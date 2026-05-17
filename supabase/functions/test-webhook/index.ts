import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { type, church_subscription_id, status } = await req.json();

    if (type === "test_event") {
      const eventId = `test_${Math.random().toString(36).slice(2)}`;
      
      // Update church_subscriptions
      const { error: updateError } = await supabaseClient
        .from("church_subscriptions")
        .update({ 
          subscription_status: status,
          last_webhook_event_id: eventId 
        })
        .eq("id", church_subscription_id);

      if (updateError) throw updateError;

      // Log event
      await supabaseClient.from("stripe_webhook_logs").insert({
        event_id: eventId,
        event_type: "manual_test",
        status: "processed",
        church_subscription_id,
        payload: { simulated: true, status }
      });

      return new Response(JSON.stringify({ success: true, eventId }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ error: "Invalid type" }), { status: 400 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
