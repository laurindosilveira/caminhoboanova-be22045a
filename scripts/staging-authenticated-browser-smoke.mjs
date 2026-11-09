import { randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

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

const publicEnv = readEnvFile(".env.local");
const secretEnv = readEnvFile("supabase/secrets.staging.local.env");
const supabaseUrl = publicEnv.VITE_SUPABASE_URL ?? secretEnv.SUPABASE_URL;
const serviceRoleKey = secretEnv.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl?.includes(STAGING_REF)) {
  throw new Error(`Blocked: expected staging project ${STAGING_REF}, got ${supabaseUrl || "missing URL"}.`);
}
if (!serviceRoleKey) throw new Error("Missing staging service role key.");

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const runId = Date.now().toString(36);
const email = `codex.e2e.${runId}@example.com`;
const password = `E2E#${randomBytes(18).toString("base64url")}`;
let churchId;
let userId;

async function waitForProfile() {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const { data } = await admin.from("profiles").select("user_id").eq("user_id", userId).maybeSingle();
    if (data) return;
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error("Profile trigger did not create the E2E profile.");
}

try {
  const { data: church, error: churchError } = await admin
    .from("churches")
    .insert({ name: `Codex E2E ${runId}`, slug: `codex-e2e-${runId}`, is_active: true })
    .select("id")
    .single();
  if (churchError || !church) throw churchError ?? new Error("Unable to create E2E church.");
  churchId = church.id;

  const { error: subscriptionError } = await admin.from("church_subscriptions").insert({
    church_id: churchId,
    church_name: `Codex E2E ${runId}`,
    church_email: email,
    pastor_name: "Codex E2E",
    pastor_email: email,
    recommended_plan: "teste",
    subscription_status: "active",
    is_active: true,
    member_limit: 10,
  });
  if (subscriptionError) throw subscriptionError;

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      birth_date: "1990-01-01",
      church_id: churchId,
      enrollment_status: "pending",
      full_name: "Codex E2E",
      phone: "11999999999",
      role: "user",
    },
  });
  if (createError || !created.user) throw createError ?? new Error("Unable to create E2E user.");
  userId = created.user.id;
  await waitForProfile();

  const viteCli = path.join(process.cwd(), "node_modules", "vite", "bin", "vite.js");
  const buildResult = spawnSync(process.execPath, [viteCli, "build"], {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
  });
  if (buildResult.error) throw buildResult.error;
  if (buildResult.status !== 0) throw new Error(`Staging frontend build failed with exit code ${buildResult.status}.`);

  const playwrightCli = path.join(process.cwd(), "node_modules", "@playwright", "test", "cli.js");
  const result = spawnSync(
    process.execPath,
    [playwrightCli, "test", "tests/e2e/authenticated-smoke.spec.ts", "--workers=1"],
    {
    cwd: process.cwd(),
    env: {
      ...process.env,
      E2E_USER_EMAIL: email,
      E2E_USER_PASSWORD: password,
    },
    stdio: "inherit",
    },
  );
  if (result.error) throw result.error;
  if (result.status !== 0) process.exitCode = result.status ?? 1;
} finally {
  if (userId) {
    await admin.auth.admin.deleteUser(userId);
    await admin.from("profiles").delete().eq("user_id", userId);
  }
  if (churchId) {
    await admin.from("church_subscriptions").delete().eq("church_id", churchId);
    await admin.from("churches").delete().eq("id", churchId);
  }
}
