import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const STAGING_REF = "nuqwwlzklqdlnvqdbpjy";
const STRIPE_ENV_PATH = path.join(process.cwd(), "supabase", "stripe.staging.local.env");
const SUPABASE_ENV_PATH = path.join(process.cwd(), "supabase", "auth-smtp.local.env");
const WEBHOOK_URL = `https://${STAGING_REF}.supabase.co/functions/v1/stripe-webhook`;
const ENABLED_EVENTS = [
  "checkout.session.completed",
  "checkout.session.expired",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.paused",
  "customer.subscription.resumed",
  "customer.subscription.trial_will_end",
  "customer.subscription.deleted",
  "invoice.payment_failed",
  "invoice.payment_succeeded",
];
const PLANS = {
  comunidade: { name: "Caminho Boa Nova - Comunidade (staging)", amount: 7900 },
  crescimento: { name: "Caminho Boa Nova - Crescimento (staging)", amount: 12900 },
  pastoral: { name: "Caminho Boa Nova - Pastoral (staging)", amount: 19900 },
};

function readEnvFile(filePath) {
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

function writeEnvFile(values) {
  const keys = [
    "STRIPE_SECRET_KEY",
    "APP_URL",
    "STRIPE_WEBHOOK_SECRET",
    "STRIPE_PRICE_COMUNIDADE",
    "STRIPE_PRICE_CRESCIMENTO",
    "STRIPE_PRICE_PASTORAL",
    "STRIPE_PRODUCT_COMUNIDADE",
    "STRIPE_PRODUCT_CRESCIMENTO",
    "STRIPE_PRODUCT_PASTORAL",
  ];
  const content = [
    "# Staging-only Stripe values. This file is ignored by Git.",
    ...keys.map(key => `${key}=${values[key] ?? ""}`),
    "",
  ].join("\n");
  fs.writeFileSync(STRIPE_ENV_PATH, content, { encoding: "utf8", mode: 0o600 });
}

function addNestedParameter(params, key, value) {
  if (Array.isArray(value)) {
    for (const item of value) params.append(`${key}[]`, String(item));
    return;
  }
  if (value && typeof value === "object") {
    for (const [childKey, childValue] of Object.entries(value)) {
      addNestedParameter(params, `${key}[${childKey}]`, childValue);
    }
    return;
  }
  params.append(key, String(value));
}

async function stripeRequest(stripeKey, method, endpoint, body) {
  const headers = { Authorization: `Bearer ${stripeKey}` };
  let encodedBody;
  if (body) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(body)) addNestedParameter(params, key, value);
    encodedBody = params;
    headers["Content-Type"] = "application/x-www-form-urlencoded";
  }
  const response = await fetch(`https://api.stripe.com/v1${endpoint}`, {
    method,
    headers,
    body: encodedBody,
  });
  const result = await response.json();
  if (!response.ok) {
    const message = result?.error?.message || `Stripe request failed with HTTP ${response.status}`;
    throw new Error(message);
  }
  return result;
}

async function findOrCreateProduct(stripeKey, plan, definition) {
  const products = await stripeRequest(stripeKey, "GET", "/products?active=true&limit=100");
  const existing = products.data.find(product =>
    product.livemode === false
      && product.metadata?.caminho_environment === "staging"
      && product.metadata?.caminho_plan === plan
  );
  if (existing) return existing;

  return stripeRequest(stripeKey, "POST", "/products", {
    name: definition.name,
    metadata: { caminho_environment: "staging", caminho_plan: plan },
  });
}

async function findOrCreatePrice(stripeKey, product, plan, definition) {
  const prices = await stripeRequest(
    stripeKey,
    "GET",
    `/prices?active=true&type=recurring&product=${encodeURIComponent(product.id)}&limit=100`,
  );
  const existing = prices.data.find(price =>
    price.livemode === false
      && price.currency === "brl"
      && price.unit_amount === definition.amount
      && price.recurring?.interval === "month"
      && price.recurring?.interval_count === 1
  );
  if (existing) return existing;

  return stripeRequest(stripeKey, "POST", "/prices", {
    product: product.id,
    unit_amount: definition.amount,
    currency: "brl",
    recurring: { interval: "month" },
    metadata: { caminho_environment: "staging", caminho_plan: plan },
  });
}

async function ensureWebhook(stripeKey, currentSecret) {
  const endpoints = await stripeRequest(stripeKey, "GET", "/webhook_endpoints?limit=100");
  const existing = endpoints.data.find(endpoint => endpoint.url === WEBHOOK_URL && endpoint.status === "enabled");
  if (existing && currentSecret?.startsWith("whsec_")) {
    await stripeRequest(stripeKey, "POST", `/webhook_endpoints/${existing.id}`, {
      enabled_events: ENABLED_EVENTS,
      description: "Caminho Boa Nova staging",
    });
    return { endpoint: existing, secret: currentSecret };
  }

  // Stripe only returns the signing secret when an endpoint is created. If the
  // ignored local file was lost, replace only this staging/test endpoint.
  if (existing) await stripeRequest(stripeKey, "DELETE", `/webhook_endpoints/${existing.id}`);
  const created = await stripeRequest(stripeKey, "POST", "/webhook_endpoints", {
    url: WEBHOOK_URL,
    enabled_events: ENABLED_EVENTS,
    description: "Caminho Boa Nova staging",
    metadata: { caminho_environment: "staging" },
  });
  if (!created.secret?.startsWith("whsec_")) throw new Error("Stripe did not return a webhook signing secret.");
  return { endpoint: created, secret: created.secret };
}

async function ensurePortalConfiguration(stripeKey) {
  const configurations = await stripeRequest(stripeKey, "GET", "/billing_portal/configurations?active=true&limit=100");
  if (configurations.data.some(configuration => configuration.is_default)) return;

  await stripeRequest(stripeKey, "POST", "/billing_portal/configurations", {
    business_profile: {
      headline: "Gerencie a assinatura da sua igreja",
      privacy_policy_url: "https://www.caminhoboanova.com.br/privacidade",
      terms_of_service_url: "https://www.caminhoboanova.com.br/termos",
    },
    features: {
      customer_update: { enabled: true, allowed_updates: ["email", "address"] },
      invoice_history: { enabled: true },
      payment_method_update: { enabled: true },
      subscription_cancel: { enabled: true, mode: "at_period_end" },
    },
    metadata: { caminho_environment: "staging" },
  });
}

async function setSupabaseSecrets(accessToken, values) {
  const names = [
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "STRIPE_PRICE_COMUNIDADE",
    "STRIPE_PRICE_CRESCIMENTO",
    "STRIPE_PRICE_PASTORAL",
    "STRIPE_PRODUCT_COMUNIDADE",
    "STRIPE_PRODUCT_CRESCIMENTO",
    "STRIPE_PRODUCT_PASTORAL",
    "APP_URL",
  ];
  const response = await fetch(`https://api.supabase.com/v1/projects/${STAGING_REF}/secrets`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(names.map(name => ({ name, value: values[name] }))),
  });
  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Unable to configure staging Edge secrets (HTTP ${response.status}): ${details.slice(0, 300)}`);
  }
}

const stripeEnv = { ...readEnvFile(STRIPE_ENV_PATH), ...process.env };
const supabaseEnv = readEnvFile(SUPABASE_ENV_PATH);
const stripeKey = stripeEnv.STRIPE_SECRET_KEY?.trim();
const accessToken = process.env.SUPABASE_ACCESS_TOKEN || supabaseEnv.SUPABASE_ACCESS_TOKEN;
const appUrl = stripeEnv.APP_URL?.trim() || "http://127.0.0.1:4173";

if (!/^(sk|rk)_test_/.test(stripeKey || "")) {
  throw new Error(`Missing Stripe TEST key in ${path.relative(process.cwd(), STRIPE_ENV_PATH)}. Live keys are blocked.`);
}
if (!accessToken) throw new Error("Missing SUPABASE_ACCESS_TOKEN for the staging project.");
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(appUrl) && !/^https:\/\//.test(appUrl)) {
  throw new Error("APP_URL must be an HTTPS URL or a local HTTP URL.");
}

const account = await stripeRequest(stripeKey, "GET", "/account");
if (account.charges_enabled === undefined) throw new Error("The Stripe test account could not be verified.");

const values = { STRIPE_SECRET_KEY: stripeKey, APP_URL: appUrl.replace(/\/$/, "") };
for (const [plan, definition] of Object.entries(PLANS)) {
  const product = await findOrCreateProduct(stripeKey, plan, definition);
  const price = await findOrCreatePrice(stripeKey, product, plan, definition);
  values[`STRIPE_PRODUCT_${plan.toUpperCase()}`] = product.id;
  values[`STRIPE_PRICE_${plan.toUpperCase()}`] = price.id;
}

const webhook = await ensureWebhook(stripeKey, stripeEnv.STRIPE_WEBHOOK_SECRET);
values.STRIPE_WEBHOOK_SECRET = webhook.secret;
await ensurePortalConfiguration(stripeKey);
await setSupabaseSecrets(accessToken, values);
writeEnvFile(values);

console.log("Stripe staging configured successfully.");
console.log(`Project: ${STAGING_REF}`);
console.log(`Webhook: ${webhook.endpoint.id} -> ${WEBHOOK_URL}`);
for (const plan of Object.keys(PLANS)) {
  console.log(`${plan}: ${values[`STRIPE_PRODUCT_${plan.toUpperCase()}`]} / ${values[`STRIPE_PRICE_${plan.toUpperCase()}`]}`);
}
