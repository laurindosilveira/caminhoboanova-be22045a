import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify the user's JWT to get the real user_id
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use anon client to verify the JWT
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await anonClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { full_name, birth_date, phone, community, area, church_id: provided_church_id } = body;

    // Validate required fields
    if (!full_name || !birth_date || !phone || !community || !area) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role client to bypass RLS
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Check if this user is a pastor from a confirmed subscription
    let church_id = provided_church_id;
    let role = "membro";
    let enrollment_status = "pending";

    const { data: subData } = await serviceClient
      .from("church_subscriptions")
      .select("church_id, stripe_subscription_id")
      .eq("pastor_email", user.email)
      .eq("subscription_status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (subData?.church_id) {
      church_id = subData.church_id;
      role = "admin";
      enrollment_status = "approved";
    }

    // 2. Check member limit if not an admin
    if (role !== "admin" && church_id) {
      const { data: subInfo } = await serviceClient
        .from("church_subscriptions")
        .select("member_limit")
        .eq("church_id", church_id)
        .eq("subscription_status", "active")
        .single();

      if (subInfo?.member_limit) {
        const { count } = await serviceClient
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("church_id", church_id);

        if (count && count >= subInfo.member_limit) {
          return new Response(JSON.stringify({ error: "Limite de membros atingido para esta igreja." }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    const { error: insertError } = await serviceClient.from("profiles").insert({
      user_id: user.id,
      full_name,
      birth_date,
      phone,
      community,
      area,
      church_id,
      role,
      enrollment_status,
      email: user.email,
    });

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
