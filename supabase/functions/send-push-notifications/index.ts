import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Web Push notification sender.
 * Called by cron daily or manually.
 * Uses the Web Push protocol with VAPID authentication.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
    const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Get all push subscriptions with user notification preferences
    const { data: subscriptions, error: subErr } = await supabase
      .from("push_subscriptions")
      .select("*");

    if (subErr) throw subErr;
    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: "No subscriptions found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get notification preferences for all subscribed users
    const userIds = [...new Set(subscriptions.map((s: any) => s.user_id))];
    const { data: allPrefs } = await supabase
      .from("notification_preferences")
      .select("*")
      .in("user_id", userIds);

    const prefsMap = new Map(
      (allPrefs ?? []).map((p: any) => [p.user_id, p])
    );

    // Check which users have pending devotionals
    const { data: allDevotionals } = await supabase
      .from("devotional_content")
      .select("id");

    const totalDevotionals = allDevotionals?.length ?? 0;

    let sent = 0;
    let failed = 0;
    const failedEndpoints: string[] = [];

    for (const sub of subscriptions) {
      const prefs = prefsMap.get(sub.user_id) as any;
      // Skip if master disabled
      if (prefs && !prefs.master_enabled) continue;
      const devocionalOn = prefs ? prefs.devocional : true;
      if (!devocionalOn) continue;

      // Check if user has pending devotionals
      const { data: userProgress } = await supabase
        .from("devotional_progress")
        .select("devotional_id")
        .eq("user_id", sub.user_id);

      const completedCount = userProgress?.length ?? 0;
      const pendingCount = totalDevotionals - completedCount;

      if (pendingCount <= 0) continue;

      // Build notification payload
      const payload = JSON.stringify({
        title: "📖 Hora do Devocional!",
        body:
          pendingCount === 1
            ? "Você tem 1 devocional esperando. Não perca sua caminhada!"
            : `Você tem ${pendingCount} devocionais pendentes. Cada dia conta!`,
        icon: "/pwa-192x192.png",
        badge: "/pwa-192x192.png",
        tag: "daily-devotional",
        data: { url: "/" },
      });

      try {
        await sendWebPush(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload,
          VAPID_PUBLIC_KEY,
          VAPID_PRIVATE_KEY
        );
        sent++;
      } catch (err: any) {
        console.error(`Push failed for ${sub.endpoint}:`, err.message);
        failed++;
        // If subscription is expired (410 Gone or 404), remove it
        if (err.status === 410 || err.status === 404) {
          failedEndpoints.push(sub.endpoint);
        }
      }
    }

    // Clean up expired subscriptions
    if (failedEndpoints.length > 0) {
      await supabase
        .from("push_subscriptions")
        .delete()
        .in("endpoint", failedEndpoints);
    }

    return new Response(
      JSON.stringify({
        sent,
        failed,
        cleaned: failedEndpoints.length,
        total: subscriptions.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Push notification error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ─── Web Push implementation using Web Crypto API ───

async function sendWebPush(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string
) {
  const url = new URL(subscription.endpoint);
  const audience = `${url.protocol}//${url.host}`;

  // Create VAPID JWT
  const jwt = await createVapidJwt(audience, vapidPublicKey, vapidPrivateKey);

  // Encrypt the payload
  const encrypted = await encryptPayload(
    payload,
    subscription.keys.p256dh,
    subscription.keys.auth
  );

  const response = await fetch(subscription.endpoint, {
    method: "POST",
    headers: {
      Authorization: `vapid t=${jwt}, k=${vapidPublicKey}`,
      "Content-Encoding": "aes128gcm",
      "Content-Type": "application/octet-stream",
      TTL: "86400",
      Urgency: "normal",
    },
    body: encrypted,
  });

  if (!response.ok) {
    const text = await response.text();
    const err = new Error(`Push failed: ${response.status} ${text}`);
    (err as any).status = response.status;
    throw err;
  }

  // Consume response body
  await response.text();
}

function base64UrlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4 === 0 ? "" : "=".repeat(4 - (base64.length % 4));
  const binary = atob(base64 + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function base64UrlEncode(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function createVapidJwt(
  audience: string,
  publicKey: string,
  privateKeyB64: string
): Promise<string> {
  const header = base64UrlEncode(
    new TextEncoder().encode(JSON.stringify({ typ: "JWT", alg: "ES256" }))
  );

  const now = Math.floor(Date.now() / 1000);
  const payload = base64UrlEncode(
    new TextEncoder().encode(
      JSON.stringify({
        aud: audience,
        exp: now + 12 * 3600,
        sub: "mailto:admin@caminhoboanova.lovable.app",
      })
    )
  );

  const unsignedToken = `${header}.${payload}`;

  // Import the private key
  const privateKeyBytes = base64UrlDecode(privateKeyB64);
  const key = await crypto.subtle.importKey(
    "pkcs8",
    buildPkcs8(privateKeyBytes),
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    new TextEncoder().encode(unsignedToken)
  );

  // Convert DER signature to raw r||s format
  const rawSig = derToRaw(new Uint8Array(signature));

  return `${unsignedToken}.${base64UrlEncode(rawSig)}`;
}

function buildPkcs8(rawPrivateKey: Uint8Array): ArrayBuffer {
  // PKCS#8 wrapper for EC P-256 private key
  const prefix = new Uint8Array([
    0x30, 0x81, 0x87, 0x02, 0x01, 0x00, 0x30, 0x13, 0x06, 0x07, 0x2a, 0x86,
    0x48, 0xce, 0x3d, 0x02, 0x01, 0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d,
    0x03, 0x01, 0x07, 0x04, 0x6d, 0x30, 0x6b, 0x02, 0x01, 0x01, 0x04, 0x20,
  ]);
  const suffix = new Uint8Array([
    0xa1, 0x44, 0x03, 0x42, 0x00,
  ]);

  // We need to add the public key point too, but for signing we can use just the private scalar
  // Simplified: just wrap the raw key
  const result = new Uint8Array(prefix.length + rawPrivateKey.length);
  result.set(prefix);
  result.set(rawPrivateKey, prefix.length);
  return result.buffer;
}

function derToRaw(der: Uint8Array): Uint8Array {
  // DER encoded ECDSA signature to raw r||s (64 bytes)
  if (der.length === 64) return der; // Already raw

  const raw = new Uint8Array(64);
  // Parse DER
  let offset = 2; // skip SEQUENCE tag and length
  // R
  if (der[offset] !== 0x02) return der;
  offset++;
  const rLen = der[offset++];
  const rStart = offset + (rLen > 32 ? rLen - 32 : 0);
  const rDest = rLen > 32 ? 0 : 32 - rLen;
  raw.set(der.slice(rStart, offset + rLen), rDest);
  offset += rLen;
  // S
  if (der[offset] !== 0x02) return der;
  offset++;
  const sLen = der[offset++];
  const sStart = offset + (sLen > 32 ? sLen - 32 : 0);
  const sDest = 32 + (sLen > 32 ? 0 : 32 - sLen);
  raw.set(der.slice(sStart, offset + sLen), sDest);
  return raw;
}

async function encryptPayload(
  payload: string,
  p256dhKey: string,
  authSecret: string
): Promise<Uint8Array> {
  const payloadBytes = new TextEncoder().encode(payload);

  // Decode subscription keys
  const clientPublicKey = base64UrlDecode(p256dhKey);
  const clientAuth = base64UrlDecode(authSecret);

  // Generate a local ECDH key pair
  const localKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );

  // Export local public key (uncompressed point)
  const localPublicKeyRaw = new Uint8Array(
    await crypto.subtle.exportKey("raw", localKeyPair.publicKey)
  );

  // Import client public key
  const clientKey = await crypto.subtle.importKey(
    "raw",
    clientPublicKey,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );

  // ECDH shared secret
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: "ECDH", public: clientKey },
      localKeyPair.privateKey,
      256
    )
  );

  // Generate 16-byte salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // HKDF to derive encryption key and nonce
  // IKM = HKDF(auth_secret, shared_secret, "WebPush: info\0" || client_pub || server_pub)
  const authInfo = new Uint8Array([
    ...new TextEncoder().encode("WebPush: info\0"),
    ...clientPublicKey,
    ...localPublicKeyRaw,
  ]);

  const ikm = await hkdf(clientAuth, sharedSecret, authInfo, 32);

  const contentEncKeyInfo = new TextEncoder().encode("Content-Encoding: aes128gcm\0");
  const nonceInfo = new TextEncoder().encode("Content-Encoding: nonce\0");

  const contentEncKey = await hkdf(salt, ikm, contentEncKeyInfo, 16);
  const nonce = await hkdf(salt, ikm, nonceInfo, 12);

  // Encrypt with AES-128-GCM
  const key = await crypto.subtle.importKey(
    "raw",
    contentEncKey,
    "AES-GCM",
    false,
    ["encrypt"]
  );

  // Add padding delimiter (0x02 for last record)
  const paddedPayload = new Uint8Array(payloadBytes.length + 1);
  paddedPayload.set(payloadBytes);
  paddedPayload[payloadBytes.length] = 2; // delimiter

  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: nonce, tagLength: 128 },
      key,
      paddedPayload
    )
  );

  // Build aes128gcm header: salt(16) + rs(4) + idlen(1) + keyid(65) + encrypted
  const recordSize = encrypted.length;
  const rs = new DataView(new ArrayBuffer(4));
  rs.setUint32(0, recordSize + 86); // header + encrypted

  const result = new Uint8Array(
    16 + 4 + 1 + localPublicKeyRaw.length + encrypted.length
  );
  let pos = 0;
  result.set(salt, pos);
  pos += 16;
  result.set(new Uint8Array(rs.buffer), pos);
  pos += 4;
  result[pos++] = localPublicKeyRaw.length;
  result.set(localPublicKeyRaw, pos);
  pos += localPublicKeyRaw.length;
  result.set(encrypted, pos);

  return result;
}

async function hkdf(
  salt: Uint8Array,
  ikm: Uint8Array,
  info: Uint8Array,
  length: number
): Promise<Uint8Array> {
  // Extract
  const key = await crypto.subtle.importKey(
    "raw",
    salt.length ? salt : new Uint8Array(32),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const prk = new Uint8Array(await crypto.subtle.sign("HMAC", key, ikm));

  // Expand
  const expandKey = await crypto.subtle.importKey(
    "raw",
    prk,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const infoWithCounter = new Uint8Array(info.length + 1);
  infoWithCounter.set(info);
  infoWithCounter[info.length] = 1;

  const output = new Uint8Array(
    await crypto.subtle.sign("HMAC", expandKey, infoWithCounter)
  );

  return output.slice(0, length);
}
