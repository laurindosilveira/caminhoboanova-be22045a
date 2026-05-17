import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) throw new Error("Unauthorized");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const stripe = new Stripe(stripeKey || "", { apiVersion: "2025-08-27.basil" });

    // Look for the customer ID in church_subscriptions
    // We check if the user is an admin of a church first
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("church_id, role")
      .eq("user_id", user.id)
      .single();

    const { data: isSysAdmin } = await supabaseClient.rpc("is_authorized_system_admin_v2");

    if ((!profile || profile.role !== "admin") && !isSysAdmin) {
      throw new Error("Only church admins or system admins can access the portal");
    }

    const { data: churchSub } = await supabaseClient
      .from("church_subscriptions")
      .select("stripe_customer_id")
      .eq("church_id", profile.church_id)
      .not("stripe_customer_id", "is", null)
      .single();

    let customerId = churchSub?.stripe_customer_id;

    if (!customerId) {
      // Fallback to searching by email if not linked yet
      const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
      if (customers.data.length === 0) throw new Error("No Stripe customer found");
      customerId = customers.data[0].id;
    }

    const origin = req.headers.get("origin") || "https://caminhoboanova.lovable.app";
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/admin`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
