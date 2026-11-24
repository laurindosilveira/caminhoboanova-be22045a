param(
  [Parameter(Mandatory = $true)][string] $BackupDirectory,
  [Parameter(Mandatory = $true)][string] $SeedVolume,
  [switch] $AttendanceProbe,
  [switch] $StagingProbe
)
# Disposable local integration only. Restored records never leave an internal
# Docker network or a temporary filesystem. Do not use this against a server.
$ErrorActionPreference = 'Continue'
$db = 'caminho-caixa-db-http-20261110'
$api = 'caminho-caixa-postgrest-20261110'
$network = 'caminho-caixa-rede-20261110'
$repo = (Resolve-Path (Join-Path $PSScriptRoot '../..') -ErrorAction Stop).Path
$backup = (Resolve-Path -LiteralPath $BackupDirectory -ErrorAction Stop).Path
$acl = Join-Path (Split-Path $backup -Parent) 'permissoes-producao-20261109.sql'
$createdNetwork = $false; $startedDb = $false; $startedApi = $false
function Require-Success([string] $step) { if ($LASTEXITCODE -ne 0) { throw "Failed: $step" } }
function Apply-File([string] $path) {
  if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw 'Required file missing' }
  & docker cp $path "${db}:/tmp/unified-test.sql" | Out-Null
  Require-Success 'copy test file'
  # Restored fixtures may contain private data. Never print SQL diagnostics.
  if ((Split-Path -Leaf $path) -in @('attendance_scope_candidate.sql','attendance-guard.integration.sql','historical_response_read_candidate.sql','historical-response-read.integration.sql','staging_coordinated_candidate_20261124.sql','staging_leader_summary_20261124.sql','staging_care_dashboard_20261124.sql','staging_rollback_20261124.sql','staging-rollback-check.sql')) {
    & docker exec $db psql -h /tmp -U supabase_admin -d postgres -v ON_ERROR_STOP=1 -f /tmp/unified-test.sql
  } else {
    & docker exec $db psql -h /tmp -U supabase_admin -d postgres -v ON_ERROR_STOP=1 -f /tmp/unified-test.sql *> $null
  }
  Require-Success "apply $(Split-Path -Leaf $path)"
}
try {
  $existing = & docker ps -a --format '{{.Names}}'; Require-Success 'inspect containers'
  if ($existing -contains $db -or $existing -contains $api) { throw 'Test container name already exists' }
  $networks = & docker network ls --format '{{.Name}}'; Require-Success 'inspect networks'
  if ($networks -contains $network) { throw 'Test network name already exists' }
  & docker volume inspect $SeedVolume *> $null; Require-Success 'inspect seed volume'
  & docker network create --internal $network | Out-Null; Require-Success 'create network'; $createdNetwork = $true
  & docker run -d --rm --name $db --network $network --tmpfs '/testpg:rw,size=1024m' `
    -v "${SeedVolume}:/seed:ro" --entrypoint sh 'public.ecr.aws/supabase/postgres:17.11.0.018' -c `
    'cp -a /seed/. /testpg/ && chown -R postgres:postgres /testpg && exec su-exec postgres postgres -D /testpg -c listen_addresses=* -c unix_socket_directories=/tmp -c shared_preload_libraries=pg_net,pg_cron,pg_stat_statements' | Out-Null
  Require-Success 'start database'; $startedDb = $true
  $ready = $false
  for ($i=0; $i -lt 60; $i++) {
    & docker exec $db pg_isready -h /tmp -U supabase_admin -d postgres *> $null
    if ($LASTEXITCODE -eq 0) { $ready=$true; break }; Start-Sleep -Seconds 1
  }
  if (-not $ready) { throw 'Database did not start' }
  foreach ($name in @('roles.sql','schema.sql','managed-customizations.sql','data-restauravel.sql')) { Apply-File (Join-Path $backup $name) }
  Apply-File $acl
  if ($StagingProbe) {
    Apply-File (Join-Path $repo 'src/tests/staging-legacy-sync-fixture.sql')
    & docker exec $db psql -h /tmp -U supabase_admin -d postgres -At -c "select md5(pg_get_functiondef(to_regprocedure('public.sync_offline_learning(text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb)')))"
    Require-Success 'check legacy function fingerprint'
    & docker exec $db psql -h /tmp -U supabase_admin -d postgres -At -c "select proacl from pg_proc where oid=to_regprocedure('public.sync_offline_learning(text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb)')"
    $candidate = Join-Path $repo 'supabase/rollout/staging_coordinated_candidate_20261124.sql'
  } else {
    $candidate = Join-Path $repo 'supabase/rollout/20261123_coordinated_learning_candidate.sql'
  }
  Apply-File $candidate
  if ($StagingProbe) {
    & docker exec $db psql -h /tmp -U supabase_admin -d postgres -v ON_ERROR_STOP=1 -c 'DROP FUNCTION public.get_leader_participant_summaries(uuid,text,uuid)' *> $null
    Require-Success 'simulate missing staging summary'
    Apply-File (Join-Path $repo 'supabase/rollout/staging_leader_summary_20261124.sql')
    & docker exec $db psql -h /tmp -U supabase_admin -d postgres -v ON_ERROR_STOP=1 -c 'DROP FUNCTION private.get_leader_care_dashboard(uuid,text,uuid)' *> $null
    Require-Success 'simulate older staging dashboard'
    Apply-File (Join-Path $repo 'src/tests/staging-legacy-care-fixture.sql')
    Apply-File (Join-Path $repo 'supabase/rollout/staging_care_dashboard_20261124.sql')
    # Restore the candidate file for the repeat-application test below.
    & docker cp $candidate "${db}:/tmp/unified-test.sql" | Out-Null
    Require-Success 'copy staging candidate'
  }
  # A repeat must be rejected by preconditions; the first application stays intact.
  & docker exec $db psql -h /tmp -U supabase_admin -d postgres -v ON_ERROR_STOP=1 -f /tmp/unified-test.sql *> $null
  if ($LASTEXITCODE -eq 0) { throw 'Candidate unexpectedly accepted a second application' }
  foreach ($name in @('legacy-rpc-block-no-receiver.integration.sql','legacy_response_delete_guard.integration.sql','unified-rollout-fixture.sql','owned-learning-sync.integration.sql')) {
    Apply-File (Join-Path $repo "src/tests/$name")
  }
  if ($AttendanceProbe) {
    Apply-File (Join-Path $repo 'src/tests/attendance-guard.integration.sql')
    Apply-File (Join-Path $repo 'src/tests/historical-response-read.integration.sql')
  }
  & docker exec $db psql -h /tmp -U supabase_admin -d postgres -v ON_ERROR_STOP=1 -c "ALTER ROLE authenticator WITH LOGIN PASSWORD 'synthetic-recovery-http-password-2026';" *> $null
  Require-Success 'configure synthetic auth'
  & docker run -d --rm --name $api --network $network `
    -e "PGRST_DB_URI=postgres://authenticator:synthetic-recovery-http-password-2026@${db}:5432/postgres" `
    -e 'PGRST_DB_SCHEMAS=public' -e 'PGRST_DB_ANON_ROLE=anon' `
    -e 'PGRST_JWT_SECRET=synthetic-jwt-secret-for-isolated-tests-only-20261110' `
    'public.ecr.aws/supabase/postgrest:v14.5' | Out-Null
  Require-Success 'start API'; $startedApi = $true
  $ready = $false
  for ($i=0; $i -lt 30; $i++) {
    $status = & docker exec $db curl -sS --max-time 2 -o /dev/null -w '%{http_code}' "http://${api}:3000/" 2>$null
    if ($LASTEXITCODE -eq 0 -and $status -match '^(200|401|404)$') { $ready=$true; break }; Start-Sleep -Seconds 1
  }
  if (-not $ready) { throw 'API did not start' }
  Push-Location $repo
  try {
    & node 'src/tests/owned-learning-sync-http.integration.mjs'; Require-Success 'run synthetic HTTP tests'
    $env:RUN_UNIFIED_LOCAL_E2E = '1'
    try { & npx.cmd vitest run src/tests/unified-offline-queue-local.integration.test.ts; Require-Success 'run local IndexedDB and API test' }
    finally { Remove-Item Env:RUN_UNIFIED_LOCAL_E2E -ErrorAction SilentlyContinue }
  }
  finally { Pop-Location }
  if ($StagingProbe) {
    Apply-File (Join-Path $repo 'supabase/rollout/staging_rollback_20261124.sql')
    Apply-File (Join-Path $repo 'src/tests/staging-rollback-check.sql')
    Write-Output 'Staging-specific upgrade and rollback verified.'
  }
  Write-Output 'Unified candidate: atomic preconditions, old clients, identity, conflicts and HTTP passed.'
} finally {
  if ($startedApi) { & docker stop $api *> $null }
  if ($startedDb) { & docker stop $db *> $null }
  if ($createdNetwork) { & docker network rm $network *> $null }
}
