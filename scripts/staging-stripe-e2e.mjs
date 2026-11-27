import { randomBytes } from "node:crypto";
import fs from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import process from "node:process";
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const STAGING_REF = "nuqwwlzklqdlnvqdbpjy";
const STAGING_URL = `https://${STAGING_REF}.supabase.co`;

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

async function stripeRequest(stripeKey, method, endpoint, body) {
  const response = await fetch(`https://api.stripe.com/v1${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${stripeKey}`,
      ...(body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: body ? new URLSearchParams(body) : undefined,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result?.error?.message || `Stripe HTTP ${response.status}`);
  return result;
}

async function waitFor(getValue, description, timeoutMs = 90_000) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const value = await getValue();
      if (value) return value;
    } catch (error) {
      lastError = error;
    }
    await new Promise(resolve => setTimeout(resolve, 1_000));
  }
  throw new Error(`Timed out waiting for ${description}${lastError ? `: ${lastError.message}` : ""}`);
}

async function startLocalCallbackServer(appUrl) {
  const url = new URL(appUrl);
  if (!new Set(["localhost", "127.0.0.1"]).has(url.hostname)) return null;

  const server = createServer((_request, response) => {
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end("<!doctype html><title>Stripe staging callback</title><p>Pagamento de teste concluido.</p>");
  });
  const started = await new Promise((resolve, reject) => {
    server.once("error", error => {
      if (error.code === "EADDRINUSE") resolve(false);
      else reject(error);
    });
    server.listen(Number(url.port || 80), url.hostname);
    server.once("listening", () => resolve(true));
  });
  return started ? server : null;
}

const publicEnv = readEnvFile(".env.local");
const secretEnv = readEnvFile("supabase/secrets.staging.local.env");
const stripeEnv = readEnvFile("supabase/stripe.staging.local.env");
const supabaseUrl = publicEnv.VITE_SUPABASE_URL || secretEnv.SUPABASE_URL;
const anonKey = publicEnv.VITE_SUPABASE_PUBLISHABLE_KEY
  || publicEnv.VITE_SUPABASE_ANON_KEY
  || secretEnv.SUPABASE_PUBLISHABLE_KEY
  || secretEnv.SUPABASE_ANON_KEY;
const serviceRoleKey = secretEnv.SUPABASE_SERVICE_ROLE_KEY;
const stripeKey = stripeEnv.STRIPE_SECRET_KEY;
const appUrl = (stripeEnv.APP_URL || "http://127.0.0.1:4173").replace(/\/$/, "");

if (supabaseUrl !== STAGING_URL) throw new Error(`Blocked: expected staging project ${STAGING_REF}.`);
if (!anonKey || !serviceRoleKey) throw new Error("Missing staging Supabase keys.");
if (!/^(sk|rk)_test_/.test(stripeKey || "")) throw new Error("Missing Stripe test key. Run npm run setup:staging:stripe first.");

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const publicClient = createClient(supabaseUrl, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const runId = `${Date.now().toString(36)}-${randomBytes(3).toString("hex")}`;
const email = `codex.stripe.${runId}@example.com`;
const password = `Stripe#${randomBytes(18).toString("base64url")}`;
let userId;
let onboardingId;
let churchId;
let checkoutSessionId;
let stripeCustomerId;
let stripeSubscriptionId;
let stripeTestClockId;
let browser;
let callbackServer;
let testStripeEventIds = [];

try {
  const frozenTime = Math.floor(Date.now() / 1000);
  const testClock = await stripeRequest(stripeKey, "POST", "/test_helpers/test_clocks", {
    frozen_time: String(frozenTime),
    name: `Caminho trial ${runId}`,
  });
  stripeTestClockId = testClock.id;

  const stripeCustomer = await stripeRequest(stripeKey, "POST", "/customers", {
    email,
    name: `Codex Stripe ${runId}`,
    test_clock: stripeTestClockId,
  });
  stripeCustomerId = stripeCustomer.id;

  const { data: createdUser, error: createUserError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: `Codex Stripe ${runId}`,
      birth_date: "1990-01-01",
      phone: "11999999999",
      role: "user",
      enrollment_status: "pending",
      area: "Sem area",
      community: "Aguardando definicao",
    },
  });
  if (createUserError || !createdUser.user) throw createUserError || new Error("Unable to create staging user.");
  userId = createdUser.user.id;

  await waitFor(async () => {
    const { data } = await admin.from("profiles").select("user_id").eq("user_id", userId).maybeSingle();
    return data;
  }, "the profile trigger");

  const { data: onboarding, error: onboardingError } = await admin
    .from("church_subscriptions")
    .insert({
      church_name: `Igreja Stripe E2E ${runId}`,
      church_email: email,
      pastor_name: `Pastor Stripe ${runId}`,
      pastor_phone: "11999999999",
      pastor_email: email,
      member_count: "25",
      objectives: "Validacao automatizada de faturamento no staging",
      recommended_plan: "comunidade",
      subscription_status: "pending_checkout",
      stripe_customer_id: stripeCustomerId,
    })
    .select("id")
    .single();
  if (onboardingError || !onboarding) throw onboardingError || new Error("Unable to create staging onboarding.");
  onboardingId = onboarding.id;

  const checkoutResponse = await fetch(`${supabaseUrl}/functions/v1/create-checkout`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      "Content-Type": "application/json",
      Origin: appUrl,
    },
    body: JSON.stringify({ subscriptionId: onboardingId }),
  });
  const checkout = await checkoutResponse.json();
  if (!checkoutResponse.ok || !checkout.url) {
    throw new Error(`create-checkout failed (${checkoutResponse.status}): ${checkout.error || "missing URL"}`);
  }

  const { data: claimed } = await admin
    .from("church_subscriptions")
    .select("stripe_checkout_session_id")
    .eq("id", onboardingId)
    .single();
  checkoutSessionId = claimed?.stripe_checkout_session_id;
  if (!checkoutSessionId?.startsWith("cs_test_")) throw new Error("Checkout did not create a Stripe test session.");
  const checkoutSession = await stripeRequest(stripeKey, "GET", `/checkout/sessions/${checkoutSessionId}`);
  if (checkoutSession.payment_method_collection !== "if_required") {
    throw new Error(`Checkout still requires payment details: ${checkoutSession.payment_method_collection}`);
  }
  if (checkoutSession.customer !== stripeCustomerId) {
    throw new Error("Checkout did not use the customer attached to the Stripe test clock.");
  }

  callbackServer = await startLocalCallbackServer(appUrl);
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ locale: "pt-BR" });
  await page.goto(checkout.url, { waitUntil: "domcontentloaded", timeout: 60_000 });
  if (!/checkout\.stripe\.com$/.test(new URL(page.url()).hostname)) throw new Error("Unexpected Checkout host.");

  const cardFieldVisible = await page.locator('input[name="cardNumber"], input[autocomplete="cc-number"]').first().isVisible().catch(() => false);
  if (cardFieldVisible) throw new Error("Card field is visible in the no-card trial checkout.");

  await page.waitForTimeout(5_000);
  const submit = page.locator("button:visible").last();
  if (!(await submit.isVisible().catch(() => false))) {
    const buttons = await page.getByRole("button").allTextContents().catch(() => []);
    fs.mkdirSync(path.join(process.cwd(), "test-results"), { recursive: true });
    await page.screenshot({
      path: path.join(process.cwd(), "test-results", "stripe-no-card-checkout.png"),
      fullPage: true,
    });
    throw new Error(`Stripe Checkout submit button was not found. Buttons: ${JSON.stringify(buttons)}`);
  }
  await submit.click();
  await page.waitForURL(url => url.toString().startsWith(appUrl) && url.searchParams.get("checkout") === "success", {
    timeout: 120_000,
    waitUntil: "commit",
  }).catch(async error => {
    if (!page.url().startsWith(appUrl)) throw error;
  });

  const provisioned = await waitFor(async () => {
    const { data, error } = await admin
      .from("church_subscriptions")
      .select("church_id,subscription_status,stripe_customer_id,stripe_subscription_id,last_webhook_event_id")
      .eq("id", onboardingId)
      .single();
    if (error) throw error;
    return data?.church_id && data?.stripe_customer_id && data?.stripe_subscription_id ? data : null;
  }, "the signed Stripe webhook to provision the church");

  churchId = provisioned.church_id;
  stripeCustomerId = provisioned.stripe_customer_id;
  stripeSubscriptionId = provisioned.stripe_subscription_id;
  if (!new Set(["trial", "active"]).has(provisioned.subscription_status)) {
    throw new Error(`Unexpected subscription status: ${provisioned.subscription_status}`);
  }
  const createdStripeSubscription = await stripeRequest(stripeKey, "GET", `/subscriptions/${stripeSubscriptionId}`);
  if (createdStripeSubscription.trial_settings?.end_behavior?.missing_payment_method !== "pause") {
    throw new Error("Stripe subscription is missing the pause-on-trial-end setting.");
  }
  if (createdStripeSubscription.test_clock !== stripeTestClockId) {
    throw new Error("Stripe subscription was not attached to the expected test clock.");
  }

  const { data: webhookLog, error: webhookLogError } = await admin
    .from("stripe_webhook_logs")
    .select("status,event_type")
    .eq("church_subscription_id", onboardingId)
    .eq("event_type", "checkout.session.completed")
    .eq("status", "processed")
    .maybeSingle();
  if (webhookLogError || !webhookLog) throw webhookLogError || new Error("Processed checkout webhook log was not found.");

  const reminderTime = createdStripeSubscription.trial_end - (3 * 24 * 60 * 60);
  await stripeRequest(stripeKey, "POST", `/test_helpers/test_clocks/${stripeTestClockId}/advance`, {
    frozen_time: String(reminderTime),
  });
  await waitFor(async () => {
    const clock = await stripeRequest(stripeKey, "GET", `/test_helpers/test_clocks/${stripeTestClockId}`);
    return clock.status === "ready" ? clock : null;
  }, "the Stripe test clock to reach the trial reminder", 180_000);

  await waitFor(async () => {
    const { data, error } = await admin
      .from("stripe_webhook_logs")
      .select("event_type,status")
      .eq("church_subscription_id", onboardingId)
      .eq("event_type", "customer.subscription.trial_will_end")
      .eq("status", "processed")
      .maybeSingle();
    if (error) throw error;
    return data;
  }, "the trial reminder webhook", 180_000);

  await stripeRequest(stripeKey, "POST", `/test_helpers/test_clocks/${stripeTestClockId}/advance`, {
    frozen_time: String(createdStripeSubscription.trial_end + 60),
  });
  await waitFor(async () => {
    const clock = await stripeRequest(stripeKey, "GET", `/test_helpers/test_clocks/${stripeTestClockId}`);
    return clock.status === "ready" ? clock : null;
  }, "the Stripe test clock to reach the end of the trial", 180_000);

  const pausedStripeSubscription = await stripeRequest(stripeKey, "GET", `/subscriptions/${stripeSubscriptionId}`);
  if (pausedStripeSubscription.status !== "paused") {
    const advancedClock = await stripeRequest(stripeKey, "GET", `/test_helpers/test_clocks/${stripeTestClockId}`);
    throw new Error(
      `Stripe did not pause the no-card trial. Status: ${pausedStripeSubscription.status}; `
      + `trial_end=${pausedStripeSubscription.trial_end}; frozen_time=${advancedClock.frozen_time}; `
      + `default_payment_method=${pausedStripeSubscription.default_payment_method}; `
      + `end_behavior=${pausedStripeSubscription.trial_settings?.end_behavior?.missing_payment_method}`,
    );
  }

  await waitFor(async () => {
    const { data, error } = await admin
      .from("church_subscriptions")
      .select("subscription_status")
      .eq("id", onboardingId)
      .single();
    if (error) throw error;
    return data?.subscription_status === "blocked" ? data : null;
  }, "the paused subscription webhook to block access", 180_000);

  const { data: magicLink, error: magicLinkError } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  if (magicLinkError || !magicLink.properties?.hashed_token) {
    throw magicLinkError || new Error("Unable to create a local staging session.");
  }
  const { data: verified, error: verifyError } = await publicClient.auth.verifyOtp({
    type: "magiclink",
    token_hash: magicLink.properties.hashed_token,
  });
  if (verifyError || !verified.session) throw verifyError || new Error("Unable to authenticate the staging pastor.");

  const blockedCheckResponse = await fetch(`${supabaseUrl}/functions/v1/check-subscription`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${verified.session.access_token}`,
      "Content-Type": "application/json",
      Origin: appUrl,
    },
    body: "{}",
  });
  const blockedCheck = await blockedCheckResponse.json();
  if (!blockedCheckResponse.ok || blockedCheck.subscribed !== false || blockedCheck.subscription_status !== "blocked") {
    throw new Error(
      `check-subscription did not report the expired no-card trial as blocked `
      + `(HTTP ${blockedCheckResponse.status}): ${JSON.stringify(blockedCheck)}`,
    );
  }

  const portalResponse = await fetch(`${supabaseUrl}/functions/v1/customer-portal`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${verified.session.access_token}`,
      "Content-Type": "application/json",
      Origin: appUrl,
    },
    body: "{}",
  });
  const portal = await portalResponse.json();
  if (!portalResponse.ok || !portal.url) {
    throw new Error(`customer-portal failed (${portalResponse.status}): ${portal.error || "missing URL"}`);
  }

  const portalPage = await browser.newPage({ locale: "pt-BR" });
  await portalPage.goto(portal.url, { waitUntil: "domcontentloaded", timeout: 60_000 });
  if (!/stripe\.com$/.test(new URL(portalPage.url()).hostname)) throw new Error("Unexpected customer portal host.");

  const paymentMethod = await stripeRequest(stripeKey, "POST", "/payment_methods", {
    type: "card",
    "card[token]": "tok_visa",
  });
  await stripeRequest(stripeKey, "POST", `/payment_methods/${paymentMethod.id}/attach`, {
    customer: stripeCustomerId,
  });
  await stripeRequest(stripeKey, "POST", `/customers/${stripeCustomerId}`, {
    "invoice_settings[default_payment_method]": paymentMethod.id,
  });
  const resumedSubscription = await stripeRequest(stripeKey, "POST", `/subscriptions/${stripeSubscriptionId}/resume`, {
    billing_cycle_anchor: "now",
  });
  const resumeInvoiceId = typeof resumedSubscription.latest_invoice === "string"
    ? resumedSubscription.latest_invoice
    : resumedSubscription.latest_invoice?.id;
  if (resumeInvoiceId) {
    await stripeRequest(stripeKey, "POST", `/invoices/${resumeInvoiceId}/pay`);
  }

  await waitFor(async () => {
    const { data, error } = await admin
      .from("church_subscriptions")
      .select("subscription_status")
      .eq("id", onboardingId)
      .single();
    if (error) throw error;
    return data?.subscription_status === "active" ? data : null;
  }, "the resumed subscription webhook to restore access", 180_000);

  await waitFor(async () => {
    const { data, error } = await admin
      .from("stripe_webhook_logs")
      .select("event_type,status")
      .eq("church_subscription_id", onboardingId)
      .in("event_type", [
        "customer.subscription.trial_will_end",
        "customer.subscription.paused",
        "customer.subscription.resumed",
      ]);
    if (error) throw error;
    const processed = new Set((data || []).filter(row => row.status === "processed").map(row => row.event_type));
    return processed.size === 3 ? processed : null;
  }, "all no-card trial lifecycle webhooks", 180_000);

  console.log("Stripe staging E2E passed: no-card checkout, trial pause, access block, portal and resume.");
  console.log(`Checkout: ${checkoutSessionId}`);
  console.log(`Subscription status: ${provisioned.subscription_status}`);
} finally {
  if (browser) await browser.close().catch(() => undefined);
  if (callbackServer) await new Promise(resolve => callbackServer.close(resolve));

  if (checkoutSessionId && (!stripeCustomerId || !stripeSubscriptionId)) {
    const session = await stripeRequest(stripeKey, "GET", `/checkout/sessions/${checkoutSessionId}`).catch(() => null);
    stripeCustomerId = typeof session?.customer === "string" ? session.customer : stripeCustomerId;
    stripeSubscriptionId = typeof session?.subscription === "string" ? session.subscription : stripeSubscriptionId;
  }
  if (stripeSubscriptionId) {
    await stripeRequest(stripeKey, "DELETE", `/subscriptions/${stripeSubscriptionId}`).catch(() => undefined);
    await new Promise(resolve => setTimeout(resolve, 2_000));
  }
  if (stripeCustomerId) await stripeRequest(stripeKey, "DELETE", `/customers/${stripeCustomerId}`).catch(() => undefined);
  if (stripeTestClockId) {
    await stripeRequest(stripeKey, "DELETE", `/test_helpers/test_clocks/${stripeTestClockId}`).catch(() => undefined);
  }
  if (checkoutSessionId || stripeCustomerId || stripeSubscriptionId || onboardingId) {
    const events = await stripeRequest(stripeKey, "GET", "/events?limit=100").catch(() => ({ data: [] }));
    testStripeEventIds = events.data.filter(event => {
      const object = event.data?.object || {};
      return object.id === checkoutSessionId
        || object.customer === stripeCustomerId
        || object.subscription === stripeSubscriptionId
        || object.metadata?.subscriptionId === onboardingId;
    }).map(event => event.id);
  }

  if (userId) await admin.auth.admin.deleteUser(userId).catch(() => undefined);
  if (onboardingId) {
    if (!churchId) {
      const { data: latestOnboarding } = await admin
        .from("church_subscriptions")
        .select("church_id")
        .eq("id", onboardingId)
        .maybeSingle();
      churchId = latestOnboarding?.church_id;
    }
    await admin.from("stripe_webhook_logs").delete().eq("church_subscription_id", onboardingId);
    if (testStripeEventIds.length) await admin.from("stripe_webhook_logs").delete().in("event_id", testStripeEventIds);
    await admin.from("church_subscriptions").delete().eq("id", onboardingId);
  }
  if (churchId) await admin.from("churches").delete().eq("id", churchId);
}
