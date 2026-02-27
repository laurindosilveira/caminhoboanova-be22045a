import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SCHEMA_SQL } from "@/lib/schemaSQL";

function escapeSQL(val: unknown): string {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "boolean") return val ? "true" : "false";
  if (typeof val === "number") return String(val);
  if (Array.isArray(val)) {
    if (val.length === 0) return "'{}'";
    return `ARRAY[${val.map(v => `'${String(v).replace(/'/g, "''")}'`).join(", ")}]`;
  }
  if (typeof val === "object") return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
  return `'${String(val).replace(/'/g, "''")}'`;
}

function buildInserts(table: string, rows: Record<string, unknown>[]): string {
  if (!rows || rows.length === 0) return `-- No data for ${table}\n`;
  const cols = Object.keys(rows[0]);
  const lines = rows.map(row => {
    const vals = cols.map(c => escapeSQL(row[c]));
    return `(${vals.join(", ")})`;
  });
  return `-- ${table} (${rows.length} rows)\nINSERT INTO public.${table} (${cols.join(", ")}) VALUES\n${lines.join(",\n")}\nON CONFLICT DO NOTHING;\n\n`;
}

export default function ExportData() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  async function handleExport() {
    setLoading(true);
    setStatus("Buscando dados...");

    try {
      // Batch 1: Content & structure tables
      const [
        { data: courses },
        { data: lessons },
        { data: lessonContent },
        { data: devotionalContent },
        { data: activities },
        { data: turmas },
        { data: events },
        { data: communitySettings },
        { data: communityChallenges },
        { data: courseUnlocks },
      ] = await Promise.all([
        supabase.from("courses").select("*").order("order_num"),
        supabase.from("lessons").select("*").order("course_id, order_num"),
        supabase.from("lesson_content").select("*"),
        supabase.from("devotional_content").select("*").order("lesson_id, day_number"),
        supabase.from("activities").select("*").order("order_num"),
        supabase.from("turmas").select("*"),
        supabase.from("events").select("*").order("event_date"),
        supabase.from("community_settings").select("*"),
        supabase.from("community_challenges").select("*"),
        supabase.from("course_unlocks").select("*"),
      ]);

      // Batch 2: User data tables
      const [
        { data: profiles },
        { data: userRoles },
        { data: userProgress },
        { data: lessonResponses },
        { data: devotionalProgress },
        { data: attendance },
        { data: worshipAttendance },
        { data: achievementUnlocks },
      ] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("user_roles").select("*"),
        supabase.from("user_progress").select("*"),
        supabase.from("lesson_responses").select("*"),
        supabase.from("devotional_progress").select("*"),
        supabase.from("attendance").select("*"),
        supabase.from("worship_attendance").select("*"),
        supabase.from("achievement_unlocks").select("*"),
      ]);

      // Batch 3: Pastoral & community tables
      const [
        { data: discipleshipPlans },
        { data: pastoralNotes },
        { data: spiritualAssessments },
        { data: meetingEvaluations },
        { data: leaderMeetingNotes },
        { data: messages },
        { data: messageReactions },
        { data: areaPastors },
        { data: rankingSeasons },
        { data: challengeParticipants },
        { data: notificationPreferences },
        { data: communityChat },
        { data: prayerRequests },
        { data: testimonies },
      ] = await Promise.all([
        supabase.from("discipleship_plans").select("*"),
        supabase.from("pastoral_notes").select("*"),
        supabase.from("spiritual_assessments").select("*"),
        supabase.from("meeting_evaluations").select("*"),
        supabase.from("leader_meeting_notes").select("*"),
        supabase.from("messages").select("*"),
        supabase.from("message_reactions").select("*"),
        supabase.from("area_pastors").select("*"),
        supabase.from("ranking_seasons").select("*"),
        supabase.from("challenge_participants").select("*"),
        supabase.from("notification_preferences").select("*"),
        supabase.from("community_chat").select("*"),
        supabase.from("prayer_requests").select("*"),
        supabase.from("testimonies").select("*"),
      ]);

      setStatus("Gerando SQL completo...");

      let sql = `-- =============================================\n`;
      sql += `-- EXPORT COMPLETO - Caminho Boa Nova\n`;
      sql += `-- Gerado em: ${new Date().toISOString()}\n`;
      sql += `-- =============================================\n`;
      sql += `-- Este arquivo contém TUDO: estrutura + dados.\n`;
      sql += `-- Execute no SQL Editor do Supabase (projeto novo).\n`;
      sql += `-- =============================================\n\n`;

      // Part 1: Schema (tables, functions, RLS, triggers)
      sql += `-- =============================================\n`;
      sql += `-- PARTE 1: ESTRUTURA (Tabelas, Funções, RLS, Triggers)\n`;
      sql += `-- =============================================\n\n`;
      sql += SCHEMA_SQL;

      // Part 2: Data
      sql += `\n\n-- =============================================\n`;
      sql += `-- PARTE 2: DADOS\n`;
      sql += `-- =============================================\n\n`;

      // Order matters for foreign keys
      // 1. Structure & content (no user FK dependencies)
      sql += buildInserts("courses", courses ?? []);
      sql += buildInserts("lessons", lessons ?? []);
      sql += buildInserts("lesson_content", lessonContent ?? []);
      sql += buildInserts("devotional_content", devotionalContent ?? []);
      sql += buildInserts("activities", activities ?? []);
      sql += buildInserts("turmas", turmas ?? []);
      sql += buildInserts("events", events ?? []);
      sql += buildInserts("community_settings", communitySettings ?? []);
      sql += buildInserts("community_challenges", communityChallenges ?? []);
      sql += buildInserts("area_pastors", areaPastors ?? []);
      sql += buildInserts("messages", messages ?? []);

      // 2. User data (depends on profiles existing in target)
      sql += buildInserts("profiles", profiles ?? []);
      sql += buildInserts("user_roles", userRoles ?? []);
      sql += buildInserts("course_unlocks", courseUnlocks ?? []);

      // 3. User progress & activity data
      sql += buildInserts("user_progress", userProgress ?? []);
      sql += buildInserts("lesson_responses", lessonResponses ?? []);
      sql += buildInserts("devotional_progress", devotionalProgress ?? []);
      sql += buildInserts("attendance", attendance ?? []);
      sql += buildInserts("worship_attendance", worshipAttendance ?? []);
      sql += buildInserts("achievement_unlocks", achievementUnlocks ?? []);
      sql += buildInserts("challenge_participants", challengeParticipants ?? []);

      // 4. Pastoral & admin data
      sql += buildInserts("discipleship_plans", discipleshipPlans ?? []);
      sql += buildInserts("pastoral_notes", pastoralNotes ?? []);
      sql += buildInserts("spiritual_assessments", spiritualAssessments ?? []);
      sql += buildInserts("meeting_evaluations", meetingEvaluations ?? []);
      sql += buildInserts("leader_meeting_notes", leaderMeetingNotes ?? []);
      sql += buildInserts("ranking_seasons", rankingSeasons ?? []);
      sql += buildInserts("message_reactions", messageReactions ?? []);
      sql += buildInserts("notification_preferences", notificationPreferences ?? []);

      // 5. Community content (chat, prayers, testimonies)
      sql += buildInserts("community_chat", communityChat ?? []);
      sql += buildInserts("prayer_requests", prayerRequests ?? []);
      sql += buildInserts("testimonies", testimonies ?? []);

      // Download
      const blob = new Blob([sql], { type: "text/sql;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `caminho-boa-nova-completo-${new Date().toISOString().slice(0, 10)}.sql`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatus("✅ Arquivo completo gerado e baixado!");
    } catch (err) {
      console.error(err);
      setStatus("❌ Erro ao exportar: " + String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <span className="text-3xl">📦</span>
        </div>
        <h1 className="font-montserrat font-black text-xl text-foreground">Exportar Banco Completo</h1>
        <p className="text-muted-foreground font-inter text-sm">
          Gera um arquivo SQL único com <strong>toda a estrutura</strong> (tabelas, funções, RLS, triggers) e <strong>todos os dados</strong> (todas as 30 tabelas: cursos, lições, devocionais, perfis, progresso, presença, dados pastorais, chat, testemunhos e mais) para backup completo ou migração.
        </p>

        <Button onClick={handleExport} disabled={loading} className="w-full" size="lg">
          {loading ? "Exportando..." : "Gerar e Baixar SQL Completo"}
        </Button>

        {status && (
          <p className="text-sm font-inter text-muted-foreground">{status}</p>
        )}

        <Button variant="ghost" onClick={() => navigate(-1)} className="text-xs">
          ← Voltar
        </Button>
      </div>
    </div>
  );
}
