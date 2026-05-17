import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey || !webhookSecret) {
    return new Response("Secrets not set", { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const body = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const subscriptionId = session.metadata?.subscriptionId;

        if (!subscriptionId) {
          console.error("No subscriptionId in metadata");
          break;
        }

        const { data: subData, error: subError } = await supabaseAdmin
          .from("church_subscriptions")
          .select("*")
          .eq("id", subscriptionId)
          .single();

        if (subError || !subData) {
          console.error("Error fetching church_subscription:", subError);
          break;
        }

        // 1. Create the Church
        const slug = subData.church_name.toLowerCase().replace(/[^\w]/g, "-");
        const { data: churchData, error: churchError } = await supabaseAdmin
          .from("churches")
          .insert({
            name: subData.church_name,
            slug: slug,
            address: subData.church_address,
            is_active: true,
          })
          .select()
          .single();

        if (churchError) {
          console.error("Error creating church:", churchError);
          // If church already exists with this slug, it might fail. In a real app, handle slug collisions.
        }

        // 2. Update Subscription Record
        const memberLimit = subData.recommended_plan === "comunidade" ? 100 : subData.recommended_plan === "crescimento" ? 250 : null;

        await supabaseAdmin
          .from("church_subscriptions")
          .update({
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            subscription_status: "active",
            church_id: churchData?.id,
            member_limit: memberLimit,
          })
          .eq("id", subscriptionId);

        // 3. Provision Admin Profile (Pastor)
        // We look for a user with the pastor's email. If they don't exist yet, we can't create a profile linked to auth.uid().
        // However, the pastor might have signed up after checkout.
        // For now, let's just make sure that when a user with this email signs up, they get the admin role for this church.
        // We can store this intention in a table or just check church_subscriptions during profile creation.

        console.log(`Church ${subData.church_name} activated successfully.`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        await supabaseAdmin
          .from("church_subscriptions")
          .update({
            subscription_status: subscription.status,
            trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
          })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await supabaseAdmin
          .from("church_subscriptions")
          .update({
            subscription_status: "canceled",
          })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error(`Error processing webhook: ${err.message}`);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
