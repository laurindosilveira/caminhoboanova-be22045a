import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

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
  const { isSuper } = useAuth();
  const navigate = useNavigate();

  async function handleExport() {
    setLoading(true);
    setStatus("Buscando dados...");

    try {
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
      ]);

      setStatus("Gerando SQL...");

      let sql = `-- =============================================\n`;
      sql += `-- EXPORT COMPLETO - Caminho Boa Nova\n`;
      sql += `-- Gerado em: ${new Date().toISOString()}\n`;
      sql += `-- =============================================\n\n`;
      sql += `-- IMPORTANTE: Execute este arquivo no SQL Editor do Supabase\n`;
      sql += `-- As tabelas devem existir antes de executar os INSERTs.\n`;
      sql += `-- Este arquivo contém apenas os DADOS (não a estrutura).\n\n`;

      // Order matters for foreign keys
      sql += buildInserts("courses", courses ?? []);
      sql += buildInserts("lessons", lessons ?? []);
      sql += buildInserts("lesson_content", lessonContent ?? []);
      sql += buildInserts("devotional_content", devotionalContent ?? []);
      sql += buildInserts("activities", activities ?? []);
      sql += buildInserts("turmas", turmas ?? []);
      sql += buildInserts("events", events ?? []);
      sql += buildInserts("community_settings", communitySettings ?? []);
      sql += buildInserts("community_challenges", communityChallenges ?? []);

      // Download
      const blob = new Blob([sql], { type: "text/sql;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `caminho-boa-nova-export-${new Date().toISOString().slice(0, 10)}.sql`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatus("✅ Arquivo gerado e baixado com sucesso!");
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
        <h1 className="font-montserrat font-black text-xl text-foreground">Exportar Dados</h1>
        <p className="text-muted-foreground font-inter text-sm">
          Gera um arquivo SQL com todos os dados de cursos, lições, devocionais, atividades, turmas e eventos para importar em outro banco de dados.
        </p>

        <Button onClick={handleExport} disabled={loading} className="w-full" size="lg">
          {loading ? "Exportando..." : "Gerar e Baixar SQL"}
        </Button>

        {status && (
          <p className="text-sm font-inter text-muted-foreground">{status}</p>
        )}

        <Button variant="ghost" onClick={() => navigate("/")} className="text-xs">
          ← Voltar
        </Button>
      </div>
    </div>
  );
}
