import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { execFileSync } from "node:child_process";

const STAGING_REF = "nuqwwlzklqdlnvqdbpjy";

function readEnvFile(relativePath) {
  const envPath = path.join(process.cwd(), relativePath);
  const values = {};
  if (!fs.existsSync(envPath)) return values;

  for (const rawLine of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([^=]+)=(.*)$/);
    if (!match) continue;

    const key = match[1].trim();
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }
  return values;
}

function runSupabaseCli(args, accessToken) {
  const command =
    process.platform === "win32"
      ? ["cmd.exe", ["/d", "/c", "npx", "supabase", ...args]]
      : ["npx", ["supabase", ...args]];

  return execFileSync(command[0], command[1], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      SUPABASE_ACCESS_TOKEN: accessToken,
      SUPABASE_NO_TELEMETRY: "1",
    },
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function parseCliJson(output) {
  const start = output.indexOf("{");
  if (start === -1) throw new Error(`Could not parse Supabase CLI output: ${output}`);
  return JSON.parse(output.slice(start));
}

const publicEnv = readEnvFile(".env.local");
const authEnv = readEnvFile("supabase/auth-smtp.local.env");
const supabaseUrl = publicEnv.VITE_SUPABASE_URL;
const accessToken = authEnv.SUPABASE_ACCESS_TOKEN;

if (!supabaseUrl?.includes(STAGING_REF)) {
  throw new Error(`Blocked: expected staging project ${STAGING_REF}, got ${supabaseUrl || "missing URL"}.`);
}

if (!accessToken) {
  throw new Error("Missing SUPABASE_ACCESS_TOKEN in supabase/auth-smtp.local.env.");
}

const auditSql = `
with public_tables as (
  select
    c.oid,
    n.nspname as schema_name,
    c.relname as table_name,
    c.relrowsecurity as rls_enabled
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relkind in ('r','p')
), role_grants as (
  select
    table_schema,
    table_name,
    bool_or(grantee = 'anon' and privilege_type = 'SELECT') as anon_select,
    bool_or(grantee = 'anon' and privilege_type in ('INSERT','UPDATE','DELETE')) as anon_write,
    bool_or(grantee = 'authenticated' and privilege_type in ('SELECT','INSERT','UPDATE','DELETE')) as authenticated_any
  from information_schema.role_table_grants
  where table_schema = 'public'
  group by table_schema, table_name
), table_columns as (
  select
    table_schema,
    table_name,
    bool_or(column_name = 'church_id') as has_church_id,
    bool_or(column_name = 'user_id') as has_user_id,
    bool_or(column_name in ('email','phone','father_phone','mother_phone')) as has_pii
  from information_schema.columns
  where table_schema = 'public'
  group by table_schema, table_name
), policy_counts as (
  select schemaname, tablename, count(*) as policy_count
  from pg_policies
  where schemaname = 'public'
  group by schemaname, tablename
), auth_granted_without_policy as (
  select t.table_name
  from public_tables t
  join role_grants g on g.table_schema = t.schema_name and g.table_name = t.table_name
  left join policy_counts p on p.schemaname = t.schema_name and p.tablename = t.table_name
  where (coalesce(g.anon_select,false) or coalesce(g.anon_write,false) or coalesce(g.authenticated_any,false))
    and coalesce(p.policy_count, 0) = 0
), pii_anon_select as (
  select t.table_name
  from public_tables t
  join role_grants g on g.table_schema = t.schema_name and g.table_name = t.table_name
  join table_columns c on c.table_schema = t.schema_name and c.table_name = t.table_name
  where coalesce(g.anon_select,false)
    and c.has_pii
), policies as (
  select
    p.tablename,
    p.policyname,
    p.cmd,
    p.roles,
    coalesce(p.qual,'') as qual,
    coalesce(p.with_check,'') as with_check,
    coalesce(p.qual,'') || ' ' || coalesce(p.with_check,'') as expr
  from pg_policies p
  join table_columns c
    on c.table_schema = p.schemaname
   and c.table_name = p.tablename
   and c.has_church_id
  where p.schemaname = 'public'
), risky_tenant_policies as (
  select *
  from policies
  where roles::text ilike any(array['%public%','%anon%','%authenticated%'])
    and cmd in ('ALL','SELECT','INSERT','UPDATE','DELETE')
    and expr not ilike '%church_id%'
    and expr not ilike '%get_auth_church_id%'
    and expr not ilike '%get_my_church_id%'
    and expr not ilike '%can_manage_church%'
    and expr not ilike '%is_super_admin%'
    and expr not ilike '%is_authorized_system_admin%'
    and expr not ilike '%auth.uid() = user_id%'
    and expr not ilike '%user_id = auth.uid()%'
), tautological_policies as (
  select tablename, policyname, cmd, coalesce(qual,'') || ' ' || coalesce(with_check,'') as expr
  from pg_policies
  where schemaname = 'public'
    and (
      coalesce(qual,'') ilike '%p.church_id = p.church_id%'
      or coalesce(with_check,'') ilike '%p.church_id = p.church_id%'
      or coalesce(qual,'') ilike '%p.area = p.area%'
      or coalesce(with_check,'') ilike '%p.area = p.area%'
    )
), duplicate_indexes as (
  select
    ns.nspname as schema_name,
    tbl.relname as table_name,
    array_to_string(ix.indkey, ',') as indexed_columns,
    array_agg(idx.relname order by idx.relname) as index_names
  from pg_index ix
  join pg_class idx on idx.oid = ix.indexrelid
  join pg_class tbl on tbl.oid = ix.indrelid
  join pg_namespace ns on ns.oid = tbl.relnamespace
  where ns.nspname = 'public'
  group by ns.nspname, tbl.relname, array_to_string(ix.indkey, ','), ix.indpred, ix.indexprs
  having count(*) > 1
), target_columns as (
  select table_schema, table_name, column_name
  from information_schema.columns
  where table_schema = 'public'
    and column_name in (
      'church_id','user_id','turma_id','event_id','activity_id',
      'lesson_id','devotional_id','message_id','target_user_id','created_by'
    )
), index_columns as (
  select
    ns.nspname as table_schema,
    tbl.relname as table_name,
    att.attname as column_name,
    array_position(ix.indkey::int[], att.attnum::int) as key_position
  from pg_index ix
  join pg_class tbl on tbl.oid = ix.indrelid
  join pg_namespace ns on ns.oid = tbl.relnamespace
  join pg_attribute att on att.attrelid = tbl.oid and att.attnum = any(ix.indkey)
  where ns.nspname = 'public'
), missing_leading_indexes as (
  select tc.*
  from target_columns tc
  where not exists (
    select 1
    from index_columns ic
    where ic.table_schema = tc.table_schema
      and ic.table_name = tc.table_name
      and ic.column_name = tc.column_name
      and ic.key_position = 0
  )
), active_long_queries as (
  select
    state,
    extract(epoch from now() - query_start)::int as age_seconds,
    wait_event_type,
    left(query, 240) as query
  from pg_stat_activity
  where state <> 'idle'
    and query_start is not null
    and now() - query_start > interval '30 seconds'
    and pid <> pg_backend_pid()
)
select jsonb_build_object(
  'total_public_tables', (select count(*) from public_tables),
  'rls_disabled', coalesce((
    select jsonb_agg(table_name order by table_name)
    from public_tables
    where not rls_enabled
  ), '[]'::jsonb),
  'pii_anon_select', coalesce((
    select jsonb_agg(table_name order by table_name)
    from pii_anon_select
  ), '[]'::jsonb),
  'auth_granted_without_policy', coalesce((
    select jsonb_agg(table_name order by table_name)
    from auth_granted_without_policy
  ), '[]'::jsonb),
  'risky_tenant_policies', coalesce((
    select jsonb_agg(jsonb_build_object(
      'table', tablename,
      'policy', policyname,
      'cmd', cmd,
      'expr', left(expr, 240)
    ) order by tablename, policyname)
    from risky_tenant_policies
  ), '[]'::jsonb),
  'tautological_policies', coalesce((
    select jsonb_agg(jsonb_build_object(
      'table', tablename,
      'policy', policyname,
      'cmd', cmd,
      'expr', left(expr, 240)
    ) order by tablename, policyname)
    from tautological_policies
  ), '[]'::jsonb),
  'duplicate_indexes', coalesce((
    select jsonb_agg(jsonb_build_object(
      'table', table_name,
      'columns', indexed_columns,
      'indexes', index_names
    ) order by table_name)
    from duplicate_indexes
  ), '[]'::jsonb),
  'missing_leading_indexes_count', (select count(*) from missing_leading_indexes),
  'missing_leading_indexes_sample', coalesce((
    select jsonb_agg(jsonb_build_object(
      'table', table_name,
      'column', column_name
    ) order by table_name, column_name)
    from (
      select *
      from missing_leading_indexes
      order by table_name, column_name
      limit 60
    ) sample
  ), '[]'::jsonb),
  'active_queries_over_30s', coalesce((
    select jsonb_agg(jsonb_build_object(
      'state', state,
      'age_seconds', age_seconds,
      'wait_event_type', wait_event_type,
      'query', query
    ) order by age_seconds desc)
    from active_long_queries
  ), '[]'::jsonb)
) as result;
`;

runSupabaseCli(["link", "--project-ref", STAGING_REF], accessToken);

const sqlPath = path.join(os.tmpdir(), `codex-db-exposure-audit-${Date.now()}.sql`);
fs.writeFileSync(sqlPath, auditSql, "utf8");

const cliOutput = runSupabaseCli(["db", "query", "--linked", "--file", sqlPath], accessToken);
const result = parseCliJson(cliOutput).rows?.[0]?.result;

if (!result) {
  throw new Error("Supabase audit did not return a result.");
}

const output = {
  project: supabaseUrl,
  generatedAt: new Date().toISOString(),
  result,
};

console.log(JSON.stringify(output, null, 2));

const failureKeys = [
  "rls_disabled",
  "pii_anon_select",
  "risky_tenant_policies",
  "tautological_policies",
];

const hasBlockingFindings = failureKeys.some((key) => (result[key] ?? []).length > 0);
if (hasBlockingFindings) {
  process.exitCode = 1;
}
