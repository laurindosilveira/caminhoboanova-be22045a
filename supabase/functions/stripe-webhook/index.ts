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
  if (plan === "comunidade") return 100;
  if (plan === "crescimento") return 250;
  return null; // pastoral = unlimited
};

// Map a Stripe price/product to one of our plans (fallback to stored recommended_plan).
const stripeStatusToInternal = (status: string): string => {
  // Stripe statuses: trialing, active, past_due, canceled, unpaid, incomplete, incomplete_expired, paused
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
    // In Deno, constructEventAsync is REQUIRED (uses Web Crypto API).
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

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId = session.metadata?.subscriptionId;

        if (!subscriptionId) {
          log("No subscriptionId in metadata, skipping provisioning");
          break;
        }

        const { data: subData, error: subError } = await supabaseAdmin
          .from("church_subscriptions")
          .select("*")
          .eq("id", subscriptionId)
          .single();

        if (subError || !subData) {
          log("Error fetching church_subscription", { subError });
          break;
        }

        // 1. Create or reuse the Church
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

        // 2. Determine status from subscription (trialing vs active)
        let internalStatus = "active";
        let trialEndsAt: string | null = null;
        if (session.subscription) {
          try {
            const sub = await stripe.subscriptions.retrieve(session.subscription as string);
            internalStatus = stripeStatusToInternal(sub.status);
            trialEndsAt = sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null;
          } catch (e) {
            log("Could not retrieve subscription", { e: String(e) });
          }
        }

        const memberLimit = planMemberLimit(subData.recommended_plan);

        await supabaseAdmin
          .from("church_subscriptions")
          .update({
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            subscription_status: internalStatus,
            church_id: churchId,
            member_limit: memberLimit,
            trial_ends_at: trialEndsAt,
          })
          .eq("id", subscriptionId);

        log("Church activated", { name: subData.church_name, status: internalStatus });
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const internalStatus = stripeStatusToInternal(subscription.status);
        const { error } = await supabaseAdmin
          .from("church_subscriptions")
          .update({
            subscription_status: internalStatus,
            trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
          })
          .eq("stripe_subscription_id", subscription.id);
        if (error) log("Update error", { error });
        log("Subscription updated", { id: subscription.id, status: internalStatus });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await supabaseAdmin
          .from("church_subscriptions")
          .update({ subscription_status: "canceled" })
          .eq("stripe_subscription_id", subscription.id);
        log("Subscription canceled", { id: subscription.id });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = (invoice as any).subscription as string | null;
        if (subId) {
          await supabaseAdmin
            .from("church_subscriptions")
            .update({ subscription_status: "past_due" })
            .eq("stripe_subscription_id", subId);
          log("Payment failed -> past_due", { subId });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = (invoice as any).subscription as string | null;
        if (subId) {
          // Re-activate if it was past_due
          await supabaseAdmin
            .from("church_subscriptions")
            .update({ subscription_status: "active" })
            .eq("stripe_subscription_id", subId)
            .in("subscription_status", ["past_due", "unpaid"]);
          log("Payment succeeded", { subId });
        }
        break;
      }

      default:
        log("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log("ERROR processing webhook", { error: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
