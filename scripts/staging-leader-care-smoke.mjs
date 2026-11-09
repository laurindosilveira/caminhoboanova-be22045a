import { randomBytes, randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

const STAGING_REF = "nuqwwlzklqdlnvqdbpjy";

function readEnvFile(relativePath) {
  const envPath = path.join(process.cwd(), relativePath);
  const values = {};
  if (!fs.existsSync(envPath)) return values;

  for (const rawLine of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([^=]+)=(.*)$/);
    if (!match) continue;
    const key = match[1].trim();
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }
  return values;
}

const publicEnv = readEnvFile(".env.local");
const secretEnv = readEnvFile("supabase/secrets.staging.local.env");
const url = process.env.SUPABASE_URL ?? publicEnv.VITE_SUPABASE_URL ?? secretEnv.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY ?? publicEnv.VITE_SUPABASE_PUBLISHABLE_KEY ?? secretEnv.SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? secretEnv.SUPABASE_SERVICE_ROLE_KEY;

if (!url?.includes(STAGING_REF)) {
  throw new Error(`Blocked: expected staging project ${STAGING_REF}, got ${url || "missing URL"}.`);
}

if (!url || !anonKey || !serviceKey) {
  throw new Error("SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY are required");
}

const service = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const email = `leader-care-smoke-${Date.now()}@example.invalid`;
const password = `T3st!${randomBytes(18).toString("hex")}`;
let userId;
let followUpId;
let foreignReminderLogId;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function waitForProfile(id) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const { data } = await service.from("profiles").select("user_id").eq("user_id", id).maybeSingle();
    if (data) return;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Profile trigger did not create the smoke user profile");
}

try {
  const { data: leaderScope, error: leaderError } = await service
    .from("profiles")
    .select("church_id, turma_id, area")
    .not("turma_id", "is", null)
    .eq("enrollment_status", "active")
    .limit(1)
    .single();
  if (leaderError) throw leaderError;

  const { data: target, error: targetError } = await service
    .from("profiles")
    .select("user_id")
    .eq("church_id", leaderScope.church_id)
    .eq("turma_id", leaderScope.turma_id)
    .eq("enrollment_status", "active")
    .limit(1)
    .single();
  if (targetError) throw targetError;

  const { data: otherTurma } = await service
    .from("turmas")
    .select("id")
    .eq("church_id", leaderScope.church_id)
    .neq("id", leaderScope.turma_id)
    .limit(1)
    .maybeSingle();

  const { data: foreignTarget, error: foreignTargetError } = await service
    .from("profiles")
    .select("user_id, church_id")
    .not("church_id", "is", null)
    .neq("church_id", leaderScope.church_id)
    .limit(1)
    .single();
  if (foreignTargetError) throw foreignTargetError;

  const { data: created, error: createError } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      area: leaderScope.area,
      birth_date: "1990-01-01",
      church_id: leaderScope.church_id,
      community: "Aguardando definicao",
      enrollment_status: "active",
      full_name: "Leader Care Smoke",
      role: "lider",
    },
  });
  if (createError) throw createError;
  userId = created.user.id;
  await waitForProfile(userId);

  const { error: profileError } = await service
    .from("profiles")
    .update({
      area: leaderScope.area,
      church_id: leaderScope.church_id,
      enrollment_status: "active",
      full_name: "Leader Care Smoke",
      is_active: true,
      role: "lider",
      turma_id: leaderScope.turma_id,
    })
    .eq("user_id", userId);
  if (profileError) throw profileError;

  const { error: roleError } = await service.from("user_roles").upsert([
    { user_id: userId, role: "lider" },
    { user_id: userId, role: "user" },
  ], { ignoreDuplicates: true, onConflict: "user_id,role" });
  if (roleError) throw roleError;

  const client = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error: signInError } = await client.auth.signInWithPassword({ email, password });
  if (signInError) throw signInError;

  const { data: dashboard, error: dashboardError } = await client.rpc("get_leader_care_dashboard", {
    p_church_id: leaderScope.church_id,
    p_turma_id: leaderScope.turma_id,
  });
  if (dashboardError) throw dashboardError;
  assert(dashboard.length > 0, "Leader dashboard returned no members");

  const { error: directReadError } = await client.from("leader_follow_ups").select("id").limit(1);
  assert(directReadError, "Authenticated client could read private follow-up rows directly");

  if (otherTurma) {
    const { error: crossTurmaError } = await client.rpc("get_leader_care_dashboard", {
      p_church_id: leaderScope.church_id,
      p_turma_id: otherTurma.id,
    });
    assert(crossTurmaError, "Leader could read another turma");
  }

  const { error: crossChurchError } = await client.rpc("get_leader_care_dashboard", {
    p_church_id: randomUUID(),
    p_turma_id: leaderScope.turma_id,
  });
  assert(crossChurchError, "Leader could change the church scope");

  const { error: crossChurchWhatsappError } = await client.rpc("prepare_whatsapp_resend", {
    _reference_id: "leader-care-smoke",
    _reminder_type: "manual_test",
    _target_user_id: foreignTarget.user_id,
  });
  assert(crossChurchWhatsappError, "Leader could prepare WhatsApp for another church");

  const { error: temporaryAdminError } = await service.from("user_roles").upsert({
    church_id: leaderScope.church_id,
    role: "admin",
    user_id: userId,
  }, { onConflict: "user_id,role" });
  if (temporaryAdminError) throw temporaryAdminError;

  const { error: crossChurchRevalidateError } = await client.rpc("revalidate_user_whatsapp", {
    _target_user_id: foreignTarget.user_id,
  });
  assert(crossChurchRevalidateError, "Church admin could revalidate WhatsApp for another church");
  await service.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");

  const { data: foreignReminderLog, error: foreignReminderLogError } = await service
    .from("whatsapp_reminder_log")
    .insert({
      church_id: foreignTarget.church_id,
      is_resent: true,
      message: "Temporary leader care scope test",
      phone: "+5551999999999",
      reference_id: "leader-care-smoke",
      reminder_type: "manual_test",
      status: "pending",
      user_id: foreignTarget.user_id,
    })
    .select("id")
    .single();
  if (foreignReminderLogError) throw foreignReminderLogError;
  foreignReminderLogId = foreignReminderLog.id;

  const { error: crossChurchConfirmError } = await client.rpc("confirm_whatsapp_resend", {
    _error: null,
    _log_id: foreignReminderLogId,
    _success: true,
  });
  assert(crossChurchConfirmError, "Leader could confirm WhatsApp for another church");

  const { data: followUp, error: followUpError } = await client.rpc("save_leader_follow_up", {
    p_due_at: new Date(Date.now() + 86_400_000).toISOString(),
    p_kind: "task",
    p_notes: "Temporary API smoke test",
    p_target_user_id: target.user_id,
    p_title: "Temporary leader care smoke test",
  });
  if (followUpError) throw followUpError;
  followUpId = followUp.id;

  const { error: completeError } = await client.rpc("complete_leader_follow_up", {
    p_follow_up_id: followUpId,
    p_resolution_notes: "Completed by staging smoke test",
  });
  if (completeError) throw completeError;

  const { error: removeLeaderRoleError } = await service
    .from("user_roles")
    .delete()
    .eq("user_id", userId)
    .eq("role", "lider");
  if (removeLeaderRoleError) throw removeLeaderRoleError;

  const { error: memberProfileError } = await service
    .from("profiles")
    .update({ role: "user" })
    .eq("user_id", userId);
  if (memberProfileError) throw memberProfileError;

  const { error: memberDashboardError } = await client.rpc("get_leader_care_dashboard", {
    p_church_id: leaderScope.church_id,
    p_turma_id: leaderScope.turma_id,
  });
  assert(memberDashboardError, "Regular member could read the leader dashboard");

  const { error: memberWriteError } = await client.rpc("save_leader_follow_up", {
    p_kind: "contact",
    p_notes: "This write must be rejected",
    p_target_user_id: target.user_id,
    p_title: "Unauthorized member write",
  });
  assert(memberWriteError, "Regular member could create a leader follow-up");

  console.log(JSON.stringify({
    blockedCrossChurch: true,
    blockedCrossTurma: Boolean(otherTurma),
    blockedDirectNotesRead: true,
    blockedForeignWhatsAppConfirmation: true,
    blockedForeignWhatsAppPreparation: true,
    blockedForeignWhatsAppRevalidation: true,
    blockedRegularMemberDashboard: true,
    blockedRegularMemberWrite: true,
    followUpLifecycle: true,
    login: true,
    visibleMembers: dashboard.length,
  }, null, 2));
} finally {
  if (foreignReminderLogId) await service.from("whatsapp_reminder_log").delete().eq("id", foreignReminderLogId);
  if (followUpId) await service.from("leader_follow_ups").delete().eq("id", followUpId);
  if (userId) {
    await service.from("user_roles").delete().eq("user_id", userId);
    await service.from("profiles").delete().eq("user_id", userId);
    await service.auth.admin.deleteUser(userId);
  }
}
