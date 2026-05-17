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

const planMemberLimit = (plan: string): number | null => {
  if (plan?.toLowerCase().includes("comunidade")) return 100;
  if (plan?.toLowerCase().includes("crescimento")) return 250;
  return null; // pastoral = unlimited
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
    const msg = err instanceof Error ? err.message : String(err);
    log("Signature verification failed", { error: msg });
    return new Response(`Webhook Error: ${msg}`, { status: 400 });
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
    .single();

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
        churchSubId = session.metadata?.subscriptionId as string;

        if (!churchSubId) {
          log("No subscriptionId in metadata");
          break;
        }

        const { data: subData, error: subError } = await supabaseAdmin
          .from("church_subscriptions")
          .select("*")
          .eq("id", churchSubId)
          .single();

        if (subError || !subData) {
          log("Error fetching church_subscription", { subError });
          break;
        }

        // 1. Provision Church
        let churchId = (subData as any).church_id as string | null;
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
          if (churchError) log("Error creating church", { churchError });
          churchId = churchData?.id ?? null;
        }

        // 2. Provision Admin Profile (Pastor)
        if (subData.pastor_email && churchId) {
          const { data: userData } = await supabaseAdmin.auth.admin.getUserByEmail(subData.pastor_email);
          if (userData?.user) {
            await supabaseAdmin.from("profiles").update({ 
              church_id: churchId, role: "admin", enrollment_status: "approved" 
            }).eq("user_id", userData.user.id);
            await supabaseAdmin.from("user_roles").upsert({ 
              user_id: userData.user.id, role: "admin", church_id: churchId 
            }, { onConflict: "user_id,role" });
          }
        }

        // 3. Update Status
        let internalStatus = "active";
        let trialEndsAt: string | null = null;
        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          internalStatus = stripeStatusToInternal(sub.status);
          trialEndsAt = sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null;
        }

        await supabaseAdmin
          .from("church_subscriptions")
          .update({
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            subscription_status: internalStatus,
            church_id: churchId,
            member_limit: planMemberLimit(subData.recommended_plan),
            trial_ends_at: trialEndsAt,
            last_webhook_event_id: event.id
          })
          .eq("id", churchSubId);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const status = stripeStatusToInternal(subscription.status);
        
        // Find church_subscription by stripe id
        const { data: sub } = await supabaseAdmin
          .from("church_subscriptions")
          .select("id, recommended_plan")
          .eq("stripe_subscription_id", subscription.id)
          .single();

        if (sub) {
          churchSubId = sub.id;
          await supabaseAdmin
            .from("church_subscriptions")
            .update({
              subscription_status: status,
              trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
              member_limit: planMemberLimit(sub.recommended_plan),
              last_webhook_event_id: event.id
            })
            .eq("id", sub.id);
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
      payload: event,
      church_subscription_id: churchSubId,
      status: "processed"
    });

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log("ERROR processing webhook", { error: msg });
    
    // Log failure
    await supabaseAdmin.from("stripe_webhook_logs").insert({
      event_id: event.id,
      event_type: event.type,
      payload: event,
      church_subscription_id: churchSubId,
      status: "failed",
      error_message: msg
    }).select();

    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
