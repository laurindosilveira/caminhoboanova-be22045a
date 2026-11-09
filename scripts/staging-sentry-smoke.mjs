import { randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";

const PORT = 4180;
const BASE_URL = `http://127.0.0.1:${PORT}`;

function readEnvFile(relativePath) {
  const filePath = path.join(process.cwd(), relativePath);
  if (!fs.existsSync(filePath)) return {};
  const values = {};
  for (const rawLine of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([^=]+)=(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values[match[1].trim()] = value;
  }
  return values;
}

async function waitForServer(url, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Preview is still starting.
    }
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  throw new Error(`Vite preview did not start at ${url}.`);
}

function findSourceMaps(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return findSourceMaps(entryPath);
    return entry.name.endsWith(".map") ? [entryPath] : [];
  });
}

const fileEnv = readEnvFile("supabase/sentry.staging.local.env");
const env = { ...fileEnv, ...process.env };
const required = ["VITE_SENTRY_DSN", "SENTRY_AUTH_TOKEN", "SENTRY_ORG", "SENTRY_PROJECT"];
const missing = required.filter(name => !env[name]?.trim());
if (missing.length) throw new Error(`Missing Sentry staging values: ${missing.join(", ")}.`);

const dsn = new URL(env.VITE_SENTRY_DSN);
if (dsn.protocol !== "https:" || !dsn.username) throw new Error("Invalid public Sentry DSN.");

const release = `caminho-boa-nova@staging-${Date.now().toString(36)}`;
const viteCli = path.join(process.cwd(), "node_modules", "vite", "bin", "vite.js");
const build = spawn(process.execPath, [viteCli, "build"], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    VITE_SENTRY_DSN: env.VITE_SENTRY_DSN,
    VITE_SENTRY_ENVIRONMENT: "staging",
    VITE_SENTRY_RELEASE: release,
    SENTRY_AUTH_TOKEN: env.SENTRY_AUTH_TOKEN,
    SENTRY_ORG: env.SENTRY_ORG,
    SENTRY_PROJECT: env.SENTRY_PROJECT,
  },
  stdio: "inherit",
});
const buildCode = await new Promise((resolve, reject) => {
  build.once("error", reject);
  build.once("exit", resolve);
});
if (buildCode !== 0) throw new Error(`Sentry build failed with exit code ${buildCode}.`);
if (findSourceMaps(path.join(process.cwd(), "dist")).length > 0) {
  throw new Error("Hidden source maps remained in dist after the Sentry upload.");
}

const releaseResponse = await fetch(
  `https://sentry.io/api/0/organizations/${encodeURIComponent(env.SENTRY_ORG)}/releases/${encodeURIComponent(release)}/`,
  { headers: { Authorization: `Bearer ${env.SENTRY_AUTH_TOKEN}` } },
);
if (!releaseResponse.ok) {
  throw new Error(`Sentry release verification failed with HTTP ${releaseResponse.status}.`);
}

const preview = spawn(
  process.execPath,
  [viteCli, "preview", "--host", "127.0.0.1", "--port", String(PORT), "--strictPort"],
  { cwd: process.cwd(), env: process.env, stdio: ["ignore", "pipe", "pipe"] },
);
let browser;
try {
  await waitForServer(BASE_URL);
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errorMarker = `sentry-staging-smoke-${randomBytes(8).toString("hex")}`;
  const envelopeAccepted = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Sentry did not receive a browser envelope.")), 20_000);
    page.on("response", response => {
      if (response.url().includes("/envelope/") && response.url().includes(dsn.hostname)) {
        clearTimeout(timeout);
        resolve(response.status());
      }
    });
  });

  await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  await page.evaluate(marker => {
    window.setTimeout(() => {
      throw new Error(marker);
    }, 0);
  }, errorMarker);
  const envelopeStatus = await envelopeAccepted;
  if (envelopeStatus < 200 || envelopeStatus >= 300) {
    throw new Error(`Sentry ingest returned HTTP ${envelopeStatus}.`);
  }

  console.log("Sentry staging smoke passed: release, source maps and browser error ingest verified.");
  console.log(`Release: ${release}`);
} finally {
  if (browser) await browser.close().catch(() => undefined);
  preview.kill();
}
