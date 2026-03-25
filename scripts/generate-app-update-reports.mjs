import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const outputPath = path.join(rootDir, "src", "data", "generatedAppUpdateReports.ts");

const maxCommits = 20;
const maxFilesPerCommit = 8;
const maxDiffLinesPerFile = 120;
const maxDiffChars = 5000;
const fieldSeparator = "<<CODEX_FIELD_SEPARATOR>>";
const commitSeparator = "<<CODEX_COMMIT_SEPARATOR>>";

function runGit(args) {
  return execFileSync("git", args, {
    cwd: rootDir,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trimEnd();
}

function runGitSafe(args) {
  try {
    return runGit(args);
  } catch {
    return "";
  }
}

function hasGitHistory() {
  return runGitSafe(["rev-parse", "--is-inside-work-tree"]) === "true";
}

function getTitle(value) {
  if (!value || !value.trim()) {
    return "Atualizacao do app";
  }

  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function getSummary(subject, body) {
  const compactBody = body.replace(/\s+/g, " ").trim();
  return compactBody || `Atualizacao registrada a partir do commit: ${subject}`;
}

function getLanguage(filePath) {
  const extension = path.extname(filePath).slice(1).toLowerCase();
  if (!extension) {
    return "text";
  }

  if (["tsx", "ts", "js", "jsx", "json", "css", "scss", "md", "sql"].includes(extension)) {
    return extension;
  }

  return "text";
}

function getSanitizedSnippet(diffText) {
  const lines = diffText
    .split(/\r?\n/)
    .filter((line) => !/^(diff --git |index |--- |\+\+\+ )/.test(line));

  const snippet = lines.slice(0, maxDiffLinesPerFile).join("\n").trim();
  if (!snippet) {
    return "Sem diff textual disponivel para este arquivo.";
  }

  if (snippet.length <= maxDiffChars) {
    return snippet;
  }

  return `${snippet.slice(0, maxDiffChars)}\n...`;
}

function getCodeChanges(sha) {
  const filesOutput = runGitSafe(["show", "--format=", "--name-only", "--no-renames", sha]);
  if (!filesOutput) {
    return [];
  }

  const files = filesOutput
    .split(/\r?\n/)
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, maxFilesPerCommit);

  return files.map((filePath) => {
    const diff = runGitSafe(["show", "--format=", "--unified=20", "--no-color", sha, "--", filePath]);

    return {
      filePath,
      language: getLanguage(filePath),
      summary: `Alteracoes registradas em ${filePath}.`,
      snippet: getSanitizedSnippet(diff),
    };
  });
}

function getHighlights(codeChanges) {
  if (codeChanges.length === 0) {
    return ["Commit sem diff textual disponivel no historico local."];
  }

  return [
    `${codeChanges.length} arquivo(s) alterado(s) nesta atualizacao.`,
    ...codeChanges.slice(0, 3).map((change) => `Arquivo atualizado: ${change.filePath}`),
  ];
}

function parseLogEntry(entry) {
  const parts = entry.split(fieldSeparator);
  if (parts.length < 4) {
    return null;
  }

  const [sha, date, subject, ...bodyParts] = parts;
  return {
    sha: sha.trim(),
    date: date.trim(),
    subject: subject.trim(),
    body: bodyParts.join(fieldSeparator).trim(),
  };
}

function buildReports() {
  if (!hasGitHistory()) {
    return null;
  }

  const logOutput = runGitSafe([
    "log",
    "-n",
    String(maxCommits),
    "--date=short",
    "--no-merges",
    `--pretty=format:%H${fieldSeparator}%ad${fieldSeparator}%s${fieldSeparator}%b${commitSeparator}`,
  ]);

  if (!logOutput) {
    return [];
  }

  const entries = logOutput
    .split(commitSeparator)
    .map((entry) => entry.trim())
    .filter(Boolean);

  return entries
    .map(parseLogEntry)
    .filter(Boolean)
    .map(({ sha, date, subject, body }) => {
      const title = getTitle(subject);
      const codeChanges = getCodeChanges(sha);

      return {
        id: sha,
        version: `commit-${sha.slice(0, 7)}`,
        title,
        releasedAt: date,
        summary: getSummary(title, body),
        highlights: getHighlights(codeChanges),
        codeChanges,
      };
    });
}

const reports = buildReports();
if (reports === null) {
  if (existsSync(outputPath)) {
    const currentContent = readFileSync(outputPath, "utf8");
    writeFileSync(outputPath, currentContent, "utf8");
    console.log("git history unavailable; kept existing app update reports");
    process.exit(0);
  }
}

const content = `import type { AppUpdateReport } from "./appUpdateReportTypes";

// Este arquivo e gerado automaticamente por scripts/generate-app-update-reports.mjs.
// Nao edite manualmente.
export const generatedAppUpdateReports: AppUpdateReport[] = ${JSON.stringify(reports, null, 2)};
`;

mkdirSync(path.dirname(outputPath), { recursive: true });
writeFileSync(outputPath, content, "utf8");
console.log(`generated ${reports.length} app update report(s)`);
