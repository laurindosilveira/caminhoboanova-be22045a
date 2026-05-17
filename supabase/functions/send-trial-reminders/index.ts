import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    // 1. Find subscriptions ending in 5, 4, 3, 2, or 1 days
    // This function can be called daily by a cron job
    const { data: endingSoon, error: fetchError } = await supabaseAdmin
      .from('church_subscriptions')
      .select('*, churches(name)')
      .eq('subscription_status', 'trial')
      .not('pastor_email', 'is', null);

    if (fetchError) throw fetchError;

    const results = [];

    for (const sub of (endingSoon || [])) {
      if (!sub.trial_ends_at) continue;

      const endsAt = new Date(sub.trial_ends_at);
      const now = new Date();
      const diffTime = endsAt.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Send email if it's within the 5-day window
      if (diffDays <= 5 && diffDays > 0) {
        console.log(`Sending trial reminder to ${sub.pastor_email} for ${sub.churches?.name} (${diffDays} days left)`);
        
        // Use Supabase Auth to send an email or an external provider
        // Since we don't have a configured external email provider in this sandbox,
        // we'll log it and use the system audit to track the intent.
        
        await supabaseAdmin.rpc('log_church_audit', { 
          p_church_id: sub.church_id, 
          p_action: 'email_reminder_trial_sent',
          p_details: { days_left: diffDays, email: sub.pastor_email }
        });

        results.push({ church: sub.churches?.name, email: sub.pastor_email, days: diffDays });
      }
    }

    return new Response(JSON.stringify({ ok: true, processed: results.length, results }), {
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