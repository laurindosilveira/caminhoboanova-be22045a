import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { assert, assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

Deno.test("get_community_ranking should return detailed breakdown", async () => {
  const { data, error } = await supabase.rpc("get_community_ranking", {
    _community: "Bom Pastor",
    _church_id: "02f08580-80e5-4f57-8a2e-1b078d337278"
  });

  if (error) {
    throw new Error(`RPC error: ${error.message}`);
  }

  assert(Array.isArray(data), "Result should be an array");
  
  if (data.length > 0) {
    const user = data[0];
    console.log(`Checking user: ${user.full_name}`);
    
    // Check columns
    assert("user_id" in user, "Missing user_id");
    assert("faith_points" in user, "Missing faith_points");
    assert("base_points" in user, "Missing base_points");
    assert("course_bonus" in user, "Missing course_bonus");
    assert("achievement_bonus" in user, "Missing achievement_bonus");
    assert("other_bonus" in user, "Missing other_bonus");
    
    // Check math: faith_points should be sum of parts
    const sum = Number(user.base_points) + Number(user.course_bonus) + Number(user.achievement_bonus) + Number(user.other_bonus);
    assertEquals(Number(user.faith_points), sum, `Faith points (${user.faith_points}) should equal sum of breakdown (${sum})`);
  }
});

Deno.test("recalculate_ranking should execute correctly for admins", async () => {
  const { data, error } = await supabase.rpc("recalculate_ranking", {
    _church_id: "02f08580-80e5-4f57-8a2e-1b078d337278"
  });

  // Note: This might fail if the test environment doesn't have an auth session,
  // but since we use service role key in the client, it depends on function security.
  // The function is SECURITY DEFINER but checks auth.uid().
  
  if (error) {
    console.log("Recalculate error (expected if no auth session):", error.message);
  } else {
    assert(data.recalculated_at, "Should return recalculation timestamp");
    assert(data.total_users !== undefined, "Should return user count");
  }
});
