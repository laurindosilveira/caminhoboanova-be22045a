$ErrorActionPreference = "Stop"

$rootDir = Split-Path -Parent $PSScriptRoot
$outputPath = Join-Path $rootDir "src\data\generatedAppUpdateReports.ts"
$gitPath = "C:\Program Files\Git\cmd\git.exe"

$maxCommits = 20
$maxFilesPerCommit = 8
$maxDiffLinesPerFile = 120
$maxDiffChars = 5000
$fieldSeparator = "<<CODEX_FIELD_SEPARATOR>>"
$commitSeparator = "<<CODEX_COMMIT_SEPARATOR>>"

function Invoke-Git {
  param(
    [string[]]$Arguments
  )

  $output = & $gitPath @Arguments 2>$null
  if ($LASTEXITCODE -ne 0) {
    throw "git command failed: $($Arguments -join ' ')"
  }

  return ($output -join "`n").TrimEnd()
}

function Invoke-GitSafe {
  param(
    [string[]]$Arguments
  )

  try {
    return Invoke-Git -Arguments $Arguments
  } catch {
    return ""
  }
}

function Get-Title {
  param([string]$Value)

  if ([string]::IsNullOrWhiteSpace($Value)) {
    return "Atualizacao do app"
  }

  $normalized = ($Value -replace "\s+", " ").Trim()
  if ($normalized.Length -eq 0) {
    return "Atualizacao do app"
  }

  return $normalized.Substring(0, 1).ToUpper() + $normalized.Substring(1)
}

function Get-Summary {
  param(
    [string]$Subject,
    [string]$Body
  )

  $compactBody = ($Body -replace "\s+", " ").Trim()
  if (-not [string]::IsNullOrWhiteSpace($compactBody)) {
    return $compactBody
  }

  return "Atualizacao registrada a partir do commit: $Subject"
}

function Get-Language {
  param([string]$FilePath)

  $extension = [System.IO.Path]::GetExtension($FilePath).TrimStart(".").ToLowerInvariant()
  if ([string]::IsNullOrWhiteSpace($extension)) {
    return "text"
  }

  if ($extension -in @("tsx", "ts", "js", "jsx", "json", "css", "scss", "md", "sql")) {
    return $extension
  }

  return "text"
}

function Get-SanitizedSnippet {
  param([string]$DiffText)

  $lines = $DiffText -split "`r?`n" | Where-Object {
    $_ -notmatch "^(diff --git |index |--- |\+\+\+ )"
  }

  $trimmedLines = $lines | Select-Object -First $maxDiffLinesPerFile
  $snippet = ($trimmedLines -join "`n").Trim()

  if ([string]::IsNullOrWhiteSpace($snippet)) {
    return "Sem diff textual disponivel para este arquivo."
  }

  if ($snippet.Length -le $maxDiffChars) {
    return $snippet
  }

  return $snippet.Substring(0, $maxDiffChars) + "`n..."
}

function Get-CodeChanges {
  param([string]$Sha)

  $filesOutput = Invoke-GitSafe -Arguments @("show", "--format=", "--name-only", "--no-renames", $Sha)
  if ([string]::IsNullOrWhiteSpace($filesOutput)) {
    return @()
  }

  $files = $filesOutput -split "`r?`n" |
    ForEach-Object { $_.Trim() } |
    Where-Object { $_ } |
    Select-Object -First $maxFilesPerCommit

  $changes = foreach ($filePath in $files) {
    $diff = Invoke-GitSafe -Arguments @("show", "--format=", "--unified=20", "--no-color", $Sha, "--", $filePath)
    [ordered]@{
      filePath = $filePath
      language = Get-Language -FilePath $filePath
      summary = "Alteracoes registradas em $filePath."
      snippet = Get-SanitizedSnippet -DiffText $diff
    }
  }

  return @($changes)
}

function Get-Highlights {
  param([array]$CodeChanges)

  if ($CodeChanges.Count -eq 0) {
    return @("Commit sem diff textual disponivel no historico local.")
  }

  $highlights = @("$($CodeChanges.Count) arquivo(s) alterado(s) nesta atualizacao.")
  $highlights += $CodeChanges | Select-Object -First 3 | ForEach-Object {
    "Arquivo atualizado: $($_.filePath)"
  }

  return @($highlights)
}

function Parse-LogEntry {
  param([string]$Entry)

  $first = $Entry.IndexOf($fieldSeparator)
  if ($first -lt 0) {
    return $null
  }

  $second = $Entry.IndexOf($fieldSeparator, $first + $fieldSeparator.Length)
  if ($second -lt 0) {
    return $null
  }

  $third = $Entry.IndexOf($fieldSeparator, $second + $fieldSeparator.Length)
  if ($third -lt 0) {
    return $null
  }

  return [ordered]@{
    sha = $Entry.Substring(0, $first)
    date = $Entry.Substring($first + $fieldSeparator.Length, $second - ($first + $fieldSeparator.Length))
    subject = $Entry.Substring($second + $fieldSeparator.Length, $third - ($second + $fieldSeparator.Length))
    body = $Entry.Substring($third + $fieldSeparator.Length)
  }
}

$logOutput = Invoke-GitSafe -Arguments @(
  "log",
  "-n",
  "$maxCommits",
  "--date=short",
  "--no-merges",
  "--pretty=format:%H$fieldSeparator%ad$fieldSeparator%s$fieldSeparator%b$commitSeparator"
)

$reports = @()

if (-not [string]::IsNullOrWhiteSpace($logOutput)) {
  $entries = $logOutput -split [regex]::Escape($commitSeparator) | Where-Object { -not [string]::IsNullOrWhiteSpace($_.Trim()) }

  foreach ($entry in $entries) {
    $parsed = Parse-LogEntry -Entry $entry
    if ($null -eq $parsed) {
      continue
    }

    $sha = $parsed.sha
    $date = $parsed.date
    $subject = Get-Title -Value $parsed.subject
    $body = $parsed.body
    $codeChanges = Get-CodeChanges -Sha $sha

    $reports += [ordered]@{
      id = $sha
      version = "commit-$($sha.Substring(0, 7))"
      title = $subject
      releasedAt = $date
      summary = Get-Summary -Subject $subject -Body $body
      highlights = Get-Highlights -CodeChanges $codeChanges
      codeChanges = $codeChanges
    }
  }
}

$json = $reports | ConvertTo-Json -Depth 8
$content = @"
import type { AppUpdateReport } from "./appUpdateReportTypes";

// Este arquivo e gerado automaticamente por scripts/generate-app-update-reports.ps1.
// Nao edite manualmente.
export const generatedAppUpdateReports: AppUpdateReport[] = $json;
"@

$directory = Split-Path -Parent $outputPath
if (-not (Test-Path $directory)) {
  New-Item -ItemType Directory -Path $directory | Out-Null
}

Set-Content -Path $outputPath -Value $content -Encoding UTF8
Write-Output "generated $($reports.Count) app update report(s)"
