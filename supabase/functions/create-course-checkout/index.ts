import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status: number, origin: string) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Access-Control-Allow-Origin": origin,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });

serve(async (req) => {
  const appUrl = (Deno.env.get("APP_URL") ?? "https://www.caminhoboanova.com.br").replace(/\/$/, "");
  const configuredOrigin = new URL(appUrl).origin;
  const requestOrigin = req.headers.get("origin") ?? configuredOrigin;
  const allowedOrigin = requestOrigin === configuredOrigin
    || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(requestOrigin)
    ? requestOrigin
    : configuredOrigin;

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: { ...corsHeaders, "Access-Control-Allow-Origin": allowedOrigin } });
  }
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405, allowedOrigin);

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!stripeKey || !supabaseUrl || !anonKey || !serviceRoleKey) {
      return json({ error: "Checkout indisponível" }, 503, allowedOrigin);
    }

    const authorization = req.headers.get("Authorization");
    if (!authorization) return json({ error: "Não autenticado" }, 401, allowedOrigin);

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) return json({ error: "Sessão inválida" }, 401, allowedOrigin);

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const body = await req.json() as { productId?: string; syncCatalog?: boolean };

    if (body.syncCatalog === true) {
      const { data: isSystemAdmin } = await userClient.rpc("is_authorized_system_admin");
      if (isSystemAdmin !== true) return json({ error: "Acesso negado" }, 403, allowedOrigin);

      const { data: catalog, error: catalogError } = await admin
        .from("course_products")
        .select("id,slug,name,description,price_cents,currency,stripe_product_id,stripe_price_id")
        .eq("is_active", true)
        .order("display_order");
      if (catalogError) throw catalogError;

      let synchronized = 0;
      for (const item of catalog ?? []) {
        if (item.stripe_product_id && item.stripe_price_id) continue;
        const stripeProduct = await stripe.products.create({
          name: item.name,
          description: item.description ?? undefined,
          metadata: { course_product_id: item.id, slug: item.slug },
        }, { idempotencyKey: `course-product-${item.id}` });
        const stripePrice = await stripe.prices.create({
          product: stripeProduct.id,
          currency: item.currency,
          unit_amount: item.price_cents,
          metadata: { course_product_id: item.id },
        }, { idempotencyKey: `course-price-${item.id}-${item.price_cents}-${item.currency}` });
        const { error: updateError } = await admin.from("course_products").update({
          stripe_product_id: stripeProduct.id,
          stripe_price_id: stripePrice.id,
          updated_at: new Date().toISOString(),
        }).eq("id", item.id);
        if (updateError) throw updateError;
        synchronized += 1;
      }
      return json({ success: true, synchronized, total: catalog?.length ?? 0 }, 200, allowedOrigin);
    }

    if (!body.productId || !/^[0-9a-f-]{36}$/i.test(body.productId)) {
      return json({ error: "Produto inválido" }, 400, allowedOrigin);
    }

    const { data: product, error: productError } = await admin
      .from("course_products")
      .select("id,slug,name,description,product_kind,course_id,track_id,price_cents,currency,stripe_product_id,stripe_price_id,is_active")
      .eq("id", body.productId)
      .single();
    if (productError || !product?.is_active) return json({ error: "Produto indisponível" }, 404, allowedOrigin);

    const { data: profile } = await admin.from("profiles").select("church_id,email").eq("user_id", user.id).maybeSingle();
    if (!profile?.church_id) return json({ error: "Usuário sem igreja" }, 403, allowedOrigin);

    const trackId = product.track_id ?? (await admin.from("courses").select("track_id").eq("id", product.course_id).single()).data?.track_id;
    const { data: release } = await admin
      .from("track_church_releases")
      .select("track_id")
      .eq("track_id", trackId)
      .eq("church_id", profile.church_id)
      .maybeSingle();
    if (!release) return json({ error: "Produto não liberado para esta igreja" }, 403, allowedOrigin);

    const targetCourseIds = product.product_kind === "course"
      ? [product.course_id]
      : (await admin.from("courses").select("id").eq("track_id", product.track_id)).data?.map((item) => item.id) ?? [];
    const { data: existingEntitlements } = await admin
      .from("user_course_entitlements")
      .select("course_id")
      .eq("user_id", user.id)
      .in("course_id", targetCourseIds)
      .is("revoked_at", null)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);
    if (targetCourseIds.length > 0 && existingEntitlements?.length === targetCourseIds.length) {
      return json({ error: "Você já possui acesso a este produto" }, 409, allowedOrigin);
    }

    let stripeProductId = product.stripe_product_id as string | null;
    let stripePriceId = product.stripe_price_id as string | null;

    if (!stripeProductId || !stripePriceId) {
      const stripeProduct = await stripe.products.create({
        name: product.name,
        description: product.description ?? undefined,
        metadata: { course_product_id: product.id, slug: product.slug },
      }, { idempotencyKey: `course-product-${product.id}` });
      const stripePrice = await stripe.prices.create({
        product: stripeProduct.id,
        currency: product.currency,
        unit_amount: product.price_cents,
        metadata: { course_product_id: product.id },
      }, { idempotencyKey: `course-price-${product.id}-${product.price_cents}-${product.currency}` });
      stripeProductId = stripeProduct.id;
      stripePriceId = stripePrice.id;
      await admin.from("course_products").update({
        stripe_product_id: stripeProductId,
        stripe_price_id: stripePriceId,
        updated_at: new Date().toISOString(),
      }).eq("id", product.id);
    }

    const { data: order, error: orderError } = await admin
      .from("course_orders")
      .insert({
        user_id: user.id,
        product_id: product.id,
        amount_cents: product.price_cents,
        currency: product.currency,
        status: "pending",
      })
      .select("id")
      .single();
    if (orderError || !order) throw orderError ?? new Error("Order creation failed");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email ?? profile.email ?? undefined,
      line_items: [{ price: stripePriceId, quantity: 1 }],
      metadata: {
        kind: "course_sale",
        order_id: order.id,
        user_id: user.id,
        course_product_id: product.id,
      },
      payment_intent_data: {
        metadata: { kind: "course_sale", order_id: order.id, user_id: user.id },
      },
      client_reference_id: order.id,
      success_url: `${appUrl}/?course_checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/?course_checkout=cancel`,
      locale: "pt-BR",
    }, { idempotencyKey: `course-checkout-${order.id}` });

    await admin.from("course_orders").update({
      stripe_checkout_session_id: session.id,
      updated_at: new Date().toISOString(),
    }).eq("id", order.id);

    return json({ url: session.url }, 200, allowedOrigin);
  } catch (error) {
    console.error("[COURSE-CHECKOUT]", error instanceof Error ? error.message : "Unknown error");
    return json({ error: "Não foi possível iniciar o pagamento" }, 500, configuredOrigin);
  }
});
