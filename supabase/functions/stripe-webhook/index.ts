import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const log = (step: string, details?: unknown) => {
  console.log(`[STRIPE-WEBHOOK] ${step}${details ? ` ${JSON.stringify(details)}` : ""}`);
};

const stripeObjectId = (value: string | { id: string } | null | undefined): string | null => {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
};

const sanitizeError = (error: unknown): string => {
  const raw = error instanceof Error ? error.message : String(error);
  return raw
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]")
    .replace(/(sk|whsec|rk)_(live|test)_[A-Za-z0-9_]+/g, "[secret]")
    .slice(0, 500);
};

const compactEventPayload = (event: Stripe.Event) => ({
  id: event.id,
  type: event.type,
  created: event.created,
  livemode: event.livemode,
  api_version: event.api_version,
  request_id: event.request?.id ?? null,
});

interface PlanFeatures {
  maxMembers: number | null;
  advancedExport: boolean;
  multiAreaManagement: boolean;
  detailedReports: boolean;
  customBranding: boolean;
}

const PLAN_FEATURES: Record<string, PlanFeatures> = {
  comunidade: {
    maxMembers: 50,
    advancedExport: false,
    multiAreaManagement: false,
    detailedReports: false,
    customBranding: false,
  },
  crescimento: {
    maxMembers: 200,
    advancedExport: true,
    multiAreaManagement: true,
    detailedReports: true,
    customBranding: false,
  },
  pastoral: {
    maxMembers: null,
    advancedExport: true,
    multiAreaManagement: true,
    detailedReports: true,
    customBranding: true,
  },
};

const getUnlockedFeatures = (oldPlan: string | null, newPlan: string) => {
  const oldF = PLAN_FEATURES[oldPlan || ""] || PLAN_FEATURES.comunidade;
  const newF = PLAN_FEATURES[newPlan];
  const unlocked = [];
  const locked = [];

  for (const key in newF) {
    if (newF[key] === true && oldF[key] === false) unlocked.push(key);
    if (newF[key] === false && oldF[key] === true) locked.push(key);
    if (key === 'maxMembers' && newF[key] !== oldF[key]) {
      unlocked.push(`maxMembers: ${oldF[key]} -> ${newF[key]}`);
    }
  }
  return { unlocked, locked };
};

const planMemberLimit = (plan: string): number | null => {
  return PLAN_FEATURES[plan]?.maxMembers ?? null;
};

// Map Stripe Product IDs to internal plan keys. Test mode must provide its own
// catalog because Stripe keeps test and live objects completely separate.
const productToPlan = (productId: string, stripeKey: string): string | null => {
  const isTestMode = /^(sk|rk)_test_/.test(stripeKey);
  const map: Record<string, string> = {};
  const products = [
    [Deno.env.get("STRIPE_PRODUCT_COMUNIDADE")?.trim() || (!isTestMode ? "prod_UuZw2jt79ka7I3" : ""), "comunidade"],
    [Deno.env.get("STRIPE_PRODUCT_CRESCIMENTO")?.trim() || (!isTestMode ? "prod_UuZtkU2SzqH0yK" : ""), "crescimento"],
    [Deno.env.get("STRIPE_PRODUCT_PASTORAL")?.trim() || (!isTestMode ? "prod_UuZtWDMyJCVaaN" : ""), "pastoral"],
  ];
  for (const [configuredProductId, plan] of products) {
    if (configuredProductId?.startsWith("prod_")) map[configuredProductId] = plan;
  }
  return map[productId] || null;
};

const stripeStatusToInternal = (status: string): string => {
  switch (status) {
    case "trialing": return "trial";
    case "active": return "active";
    case "past_due": return "past_due";
    case "unpaid": return "unpaid";
    case "canceled": return "canceled";
    case "incomplete_expired": return "canceled";
    case "paused": return "blocked";
    default: return status;
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("No signature", { status: 400 });

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey || !webhookSecret) {
    log("ERROR: missing secrets");
    return new Response("Secrets not set", { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    log("Signature verification failed");
    return new Response("Invalid signature", { status: 400 });
  }

  log("Event received", { type: event.type, id: event.id });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  // 0. Idempotency Check
  const { data: existingLog } = await supabaseAdmin
    .from("stripe_webhook_logs")
    .select("id")
    .eq("event_id", event.id)
    .maybeSingle();

  if (existingLog) {
    log("Duplicate event ignored", { eventId: event.id });
    return new Response(JSON.stringify({ received: true, duplicate: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }

  let churchSubId: string | null = null;

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.metadata?.kind === "course_sale") {
          const orderId = session.metadata.order_id;
          if (!orderId || session.client_reference_id !== orderId) {
            throw new Error("Course order metadata mismatch");
          }
          if (session.payment_status !== "paid") {
            log("Course checkout completed without paid status", { orderId, paymentStatus: session.payment_status });
            break;
          }

          const { data: order, error: orderError } = await supabaseAdmin
            .from("course_orders")
            .select("id,user_id,product_id,status,course_products(product_kind,course_id,track_id)")
            .eq("id", orderId)
            .single();
          if (orderError || !order) throw new Error("Course order not found");
          if (order.user_id !== session.metadata.user_id || order.product_id !== session.metadata.course_product_id) {
            throw new Error("Course order ownership mismatch");
          }

          const paymentIntentId = stripeObjectId(session.payment_intent);
          const { error: paidOrderError } = await supabaseAdmin.from("course_orders").update({
            status: "paid",
            stripe_checkout_session_id: session.id,
            stripe_payment_intent_id: paymentIntentId,
            paid_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }).eq("id", order.id).neq("status", "refunded");
          if (paidOrderError) throw paidOrderError;

          const product = order.course_products as unknown as {
            product_kind: "course" | "bundle";
            course_id: string | null;
            track_id: string | null;
          };
          const courseIds = product.product_kind === "course"
            ? [product.course_id].filter(Boolean) as string[]
            : (await supabaseAdmin.from("courses").select("id").eq("track_id", product.track_id)).data?.map((course) => course.id) ?? [];

          for (const courseId of courseIds) {
            const { data: existing } = await supabaseAdmin
              .from("user_course_entitlements")
              .select("id")
              .eq("user_id", order.user_id)
              .eq("course_id", courseId)
              .eq("source", "purchase")
              .eq("order_id", order.id)
              .maybeSingle();
            if (!existing) {
              const { error: entitlementError } = await supabaseAdmin.from("user_course_entitlements").insert({
                user_id: order.user_id,
                course_id: courseId,
                source: "purchase",
                order_id: order.id,
                starts_at: new Date().toISOString(),
                expires_at: null,
              });
              if (entitlementError) throw entitlementError;
            }
          }
          log("Course purchase fulfilled", { orderId, courses: courseIds.length });
          break;
        }

        churchSubId = session.metadata?.subscriptionId as string;

        if (!churchSubId) {
          throw new Error("Checkout metadata is missing subscriptionId");
        }

        const { data: subData, error: subError } = await supabaseAdmin
          .from("church_subscriptions")
          .select("*")
          .eq("id", churchSubId)
          .single();

        if (subError || !subData) {
          throw new Error("Checkout subscription record was not found");
        }

        if (session.client_reference_id !== churchSubId) {
          throw new Error("Checkout reference mismatch");
        }

        const stripeSubscriptionId = stripeObjectId(session.subscription);
        const stripeCustomerId = stripeObjectId(session.customer);
        if (!stripeSubscriptionId || !stripeCustomerId) {
          throw new Error("Checkout is missing Stripe subscription identifiers");
        }

        const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
        const purchasedProductId = stripeObjectId(stripeSubscription.items.data[0]?.price.product);
        const purchasedPlan = purchasedProductId ? productToPlan(purchasedProductId, stripeKey) : null;
        if (!purchasedPlan || purchasedPlan !== subData.recommended_plan || session.metadata?.plan !== purchasedPlan) {
          throw new Error("Purchased plan does not match the onboarding request");
        }

        // 1. Provision Church
        let churchId = subData.church_id as string | null;
        if (!churchId) {
          const baseSlug = subData.church_name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w]+/g, "-").replace(/^-|-$/g, "");
          const slug = `${baseSlug}-${Date.now().toString(36)}`;
          const { data: churchData, error: churchError } = await supabaseAdmin
            .from("churches")
            .insert({
              name: subData.church_name,
              slug,
              address: subData.church_address,
              is_active: true,
            })
            .select()
            .single();
          if (churchError) throw churchError;
          churchId = churchData?.id ?? null;
        }

        // 2. Provision Admin Profile (Pastor)
        if (subData.pastor_email && churchId) {
          const normalizedEmail = subData.pastor_email.trim().toLowerCase();
          const { data: existingProfile } = await supabaseAdmin
            .from("profiles")
            .select("user_id")
            .eq("email", normalizedEmail)
            .maybeSingle();
          let userId = existingProfile?.user_id ?? null;

          if (!userId) {
            const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(subData.pastor_email, {
              data: {
                full_name: subData.pastor_name,
                church_id: churchId,
                role: "admin",
                enrollment_status: "approved"
              }
            });
            if (inviteError || !inviteData?.user) {
              throw new Error(`Unable to provision pastor account: ${sanitizeError(inviteError)}`);
            }
            userId = inviteData.user.id;
          }

          const { error: profileError } = await supabaseAdmin.from("profiles").update({
            church_id: churchId,
            role: "admin",
            enrollment_status: "approved",
            full_name: subData.pastor_name,
          }).eq("user_id", userId);
          if (profileError) throw profileError;

          const { error: roleError } = await supabaseAdmin.from("user_roles").upsert({
            user_id: userId,
            role: "admin",
            church_id: churchId,
          }, { onConflict: "user_id,role" });
          if (roleError) throw roleError;
        } else {
          throw new Error("Pastor email or church provisioning is missing");
        }

        // 3. Update Status
        const internalStatus = stripeStatusToInternal(stripeSubscription.status);
        const trialEndsAt = stripeSubscription.trial_end
          ? new Date(stripeSubscription.trial_end * 1000).toISOString()
          : null;

        const { error: subscriptionUpdateError } = await supabaseAdmin
          .from("church_subscriptions")
          .update({
            stripe_customer_id: stripeCustomerId,
            stripe_subscription_id: stripeSubscriptionId,
            subscription_status: internalStatus,
            church_id: churchId,
            recommended_plan: purchasedPlan,
            member_limit: planMemberLimit(purchasedPlan),
            trial_ends_at: trialEndsAt,
            last_webhook_event_id: event.id
          })
          .eq("id", churchSubId);
        if (subscriptionUpdateError) throw subscriptionUpdateError;

        // 4. Provision Audit
        await supabaseAdmin.rpc('log_church_audit', { 
          p_church_id: churchId, 
          p_action: 'subscription_provisioned',
          p_details: { status: internalStatus, event_id: event.id }
        });
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = stripeObjectId(charge.payment_intent);
        if (!paymentIntentId) break;
        const { data: order } = await supabaseAdmin
          .from("course_orders")
          .select("id")
          .eq("stripe_payment_intent_id", paymentIntentId)
          .maybeSingle();
        if (order) {
          await supabaseAdmin.from("course_orders").update({
            status: "refunded",
            updated_at: new Date().toISOString(),
          }).eq("id", order.id);
          await supabaseAdmin.from("user_course_entitlements").update({
            revoked_at: new Date().toISOString(),
          }).eq("order_id", order.id).eq("source", "purchase");
        }
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.metadata?.kind === "course_sale") {
          const orderId = session.metadata.order_id;
          if (!orderId || session.client_reference_id !== orderId) {
            throw new Error("Expired course checkout metadata is invalid");
          }
          await supabaseAdmin.from("course_orders").update({
            status: "expired",
            updated_at: new Date().toISOString(),
          }).eq("id", orderId).eq("status", "pending");
          break;
        }
        const subscriptionId = session.metadata?.subscriptionId;
        if (!subscriptionId || session.client_reference_id !== subscriptionId) {
          throw new Error("Expired checkout metadata is invalid");
        }

        churchSubId = subscriptionId;
        const { error: releaseError } = await supabaseAdmin
          .from("church_subscriptions")
          .update({
            stripe_checkout_session_id: null,
            checkout_started_at: null,
            last_webhook_event_id: event.id,
          })
          .eq("id", subscriptionId)
          .eq("subscription_status", "pending_checkout")
          .eq("stripe_checkout_session_id", session.id);
        if (releaseError) throw releaseError;
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const status = stripeStatusToInternal(subscription.status);
        const productId = stripeObjectId(subscription.items.data[0]?.price.product);
        const newPlan = productId ? productToPlan(productId, stripeKey) : null;
        
        const { data: sub } = await supabaseAdmin
          .from("church_subscriptions")
          .select("id, recommended_plan, church_id")
          .eq("stripe_subscription_id", subscription.id)
          .single();

        if (sub) {
          churchSubId = sub.id;
          const oldPlan = sub.recommended_plan;
          const planToUse = newPlan || oldPlan;
          
          await supabaseAdmin
            .from("church_subscriptions")
            .update({
              subscription_status: status,
              trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
              recommended_plan: planToUse,
              member_limit: planMemberLimit(planToUse),
              last_webhook_event_id: event.id,
              updated_at: new Date().toISOString()
            })
            .eq("id", sub.id);

          // Audit logic for feature changes
          if (sub.church_id && planToUse !== oldPlan) {
            const { unlocked, locked } = getUnlockedFeatures(oldPlan, planToUse);
            await supabaseAdmin.rpc('log_church_audit', { 
              p_church_id: sub.church_id, 
              p_action: 'plan_changed',
              p_details: { 
                old_plan: oldPlan, 
                new_plan: planToUse, 
                unlocked, 
                locked,
                event_id: event.id 
              }
            });
          } else if (sub.church_id) {
            await supabaseAdmin.rpc('log_church_audit', { 
              p_church_id: sub.church_id, 
              p_action: 'subscription_updated',
              p_details: { status, plan: planToUse, event_id: event.id }
            });
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const { data: sub } = await supabaseAdmin
          .from("church_subscriptions")
          .select("id")
          .eq("stripe_subscription_id", subscription.id)
          .single();

        if (sub) {
          churchSubId = sub.id;
          await supabaseAdmin
            .from("church_subscriptions")
            .update({ subscription_status: "canceled", last_webhook_event_id: event.id })
            .eq("id", sub.id);

          // Audit
          const { data: churchInfo } = await supabaseAdmin.from('church_subscriptions').select('church_id').eq('id', sub.id).single();
          if (churchInfo?.church_id) {
            await supabaseAdmin.rpc('log_church_audit', { 
              p_church_id: churchInfo.church_id, 
              p_action: 'subscription_cancelled_stripe',
              p_details: { event_id: event.id }
            });
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = invoice.subscription as string;
        if (subId) {
          const { data: sub } = await supabaseAdmin
            .from("church_subscriptions")
            .select("id")
            .eq("stripe_subscription_id", subId)
            .single();
          if (sub) {
            churchSubId = sub.id;
            await supabaseAdmin
              .from("church_subscriptions")
              .update({ subscription_status: "past_due", last_webhook_event_id: event.id })
              .eq("id", sub.id);
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = invoice.subscription as string;
        if (subId) {
          const { data: sub } = await supabaseAdmin
            .from("church_subscriptions")
            .select("id")
            .eq("stripe_subscription_id", subId)
            .single();
          if (sub) {
            churchSubId = sub.id;
            await supabaseAdmin
              .from("church_subscriptions")
              .update({ 
                subscription_status: "active", 
                last_webhook_event_id: event.id 
              })
              .eq("id", sub.id)
              .in("subscription_status", ["past_due", "unpaid"]);
          }
        }
        break;
      }
    }

    // 4. Log Audit
    await supabaseAdmin.from("stripe_webhook_logs").insert({
      event_id: event.id,
      event_type: event.type,
      payload: compactEventPayload(event),
      church_subscription_id: churchSubId,
      status: "processed"
    });

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    const msg = sanitizeError(err);
    log("ERROR processing webhook", {
      name: err instanceof Error ? err.name : "UnknownError",
      eventId: event.id,
    });
    
    // Log failure
    await supabaseAdmin.from("stripe_webhook_logs").insert({
      event_id: event.id,
      event_type: event.type,
      payload: compactEventPayload(event),
      church_subscription_id: churchSubId,
      status: "failed",
      error_message: msg
    }).select();

    return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
