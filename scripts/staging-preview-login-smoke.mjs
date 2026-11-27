// Only for the local preview build whose bundle points at the staging project.
import { chromium } from "playwright";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import assert from "node:assert/strict";

const buildDir = process.env.STAGING_PREVIEW_BUILD;
const password = process.env.STAGING_TEST_PASSWORD;
if (!buildDir || !password) throw new Error("Missing isolated build or test password");
const assets = readdirSync(join(buildDir, "assets")).filter((name) => /^client-.*\.js$/.test(name));
assert.equal(assets.length, 1, "Expected one Supabase client bundle");
const client = readFileSync(join(buildDir, "assets", assets[0]), "utf8");
assert.ok(client.includes("nuqwwlzklqdlnvqdbpjy") && !client.includes("ktvdjrabetukptqduier"));

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 393, height: 852 }, isMobile: true });
  await page.goto("http://127.0.0.1:4177/login", { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.getByPlaceholder("seu@email.com").fill("android38@example.com");
  await page.getByPlaceholder("••••••••").fill(password);
  const submit = page.getByRole("button", { name: "Entrar na Jornada" });
  await submit.waitFor({ state: "visible", timeout: 30000 });
  await page.waitForFunction(() => {
    const button = [...document.querySelectorAll("button")].find((item) => item.textContent?.includes("Entrar na Jornada"));
    return !!button && !button.disabled;
  }, undefined, { timeout: 30000 });
  await submit.click();
  await page.waitForURL((url) => !url.pathname.includes("login"), { timeout: 45000 });
  console.log(JSON.stringify({ stagingClient: true, captcha: "simulado", signedIn: true, path: new URL(page.url()).pathname }));
} finally {
  await browser.close();
}
