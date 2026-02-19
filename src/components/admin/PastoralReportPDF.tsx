import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Download, CheckCircle2, XCircle, Clock } from "lucide-react";

type Participant = {
  user_id: string; full_name: string; community: string; area: string;
  birth_date: string; phone: string; completed_count: number; completed_activity_ids: string[];
};
type Activity = { id: string; type: string; title: string; points: number; order_num: number; subtitle: string | null };

type Props = { participant: Participant; activities: Activity[] };

function calcAge(birthDate: string) {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
  return age;
}

const APTIDAO_CFG = {
  apto: { label: "🟢 Apto para a Profissão de Fé", color: "#2ECC71", bg: "#d1fae5" },
  acompanhamento: { label: "🟡 Em Acompanhamento", color: "#F59E0B", bg: "#fef3c7" },
  nao_apto: { label: "🔴 Não Apto no Momento", color: "#EF4444", bg: "#fee2e2" },
};

export default function PastoralReportPDF({ participant: p, activities }: Props) {
  const [aptidao, setAptidao] = useState<"apto" | "acompanhamento" | "nao_apto">("acompanhamento");
  const [observations, setObservations] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [assessment, setAssessment] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);

  const completedIds = new Set(p.completed_activity_ids);
  const formacoes = activities.filter(a => a.type === "formacao");
  const devocionais = activities.filter(a => a.type === "devocional");
  const encontros = activities.filter(a => a.type === "encontro");
  const doneForm = formacoes.filter(a => completedIds.has(a.id)).length;
  const doneDev = devocionais.filter(a => completedIds.has(a.id)).length;
  const doneEnc = encontros.filter(a => completedIds.has(a.id)).length;
  const pct = activities.length > 0 ? Math.round((p.completed_count / activities.length) * 100) : 0;
  const age = calcAge(p.birth_date);

  async function loadData() {
    if (loaded) return;
    setLoadingData(true);
    const now = new Date();
    const [{ data: planData }, { data: assessData }] = await Promise.all([
      supabase.from("discipleship_plans").select("*").eq("user_id", p.user_id).maybeSingle(),
      supabase.from("spiritual_assessments").select("*")
        .eq("user_id", p.user_id).eq("month", now.getMonth() + 1).eq("year", now.getFullYear()).maybeSingle(),
    ]);
    if (planData) {
      setPlan(planData);
      if (planData.aptidao) setAptidao(planData.aptidao as any);
      if (planData.pastor_notes) setObservations(planData.pastor_notes);
    }
    setAssessment(assessData);
    setLoaded(true);
    setLoadingData(false);
  }

  async function saveAptidao() {
    await supabase.from("discipleship_plans").upsert({
      user_id: p.user_id,
      aptidao,
      pastor_notes: observations,
      health_status: plan?.health_status ?? "atencao",
    }, { onConflict: "user_id" });
  }

  async function generatePDF() {
    setLoading(true);
    await saveAptidao();
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const W = 210;
      const margin = 16;
      let y = 20;

      const addText = (text: string, x: number, yPos: number, size: number, bold = false, color = "#1a1a1a") => {
        doc.setFontSize(size);
        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.setTextColor(color);
        doc.text(text, x, yPos);
      };

      const addSection = (title: string) => {
        y += 5;
        doc.setFillColor(245, 247, 255);
        doc.roundedRect(margin, y, W - margin * 2, 8, 2, 2, "F");
        addText(title, margin + 3, y + 5.5, 11, true, "#1F3C88");
        y += 13;
      };

      const addRow = (label: string, value: string) => {
        addText(`${label}:`, margin, y, 9, true, "#555");
        addText(value || "—", margin + 45, y, 9, false, "#111");
        y += 6;
      };

      // Header
      doc.setFillColor(31, 60, 136);
      doc.rect(0, 0, W, 38, "F");
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("Relatório Confirmatório", margin, 16);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(200, 210, 255);
      doc.text(`✝️ ${p.full_name}`, margin, 26);
      doc.text(`Gerado em ${new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}`, margin, 33);
      y = 48;

      // Dados pessoais
      addSection("👤 DADOS PESSOAIS");
      addRow("Nome completo", p.full_name);
      addRow("Comunidade", p.community);
      addRow("Área", p.area);
      addRow("Idade", age ? `${age} anos` : "—");
      addRow("Telefone", p.phone);
      addRow("Data de nascimento", p.birth_date ? new Date(p.birth_date).toLocaleDateString("pt-BR") : "—");

      // Aptidão
      addSection("🏁 APTIDÃO PARA A PROFISSÃO DE FÉ");
      const aptCfg = APTIDAO_CFG[aptidao];
      doc.setFillColor(aptidao === "apto" ? 209 : aptidao === "acompanhamento" ? 254 : 254,
        aptidao === "apto" ? 250 : aptidao === "acompanhamento" ? 243 : 226,
        aptidao === "apto" ? 229 : aptidao === "acompanhamento" ? 199 : 226);
      doc.roundedRect(margin, y - 2, W - margin * 2, 10, 2, 2, "F");
      addText(aptCfg.label, margin + 4, y + 5, 12, true,
        aptidao === "apto" ? "#065F46" : aptidao === "acompanhamento" ? "#92400E" : "#991B1B");
      y += 14;

      // Formação
      addSection("🎓 FORMAÇÃO");
      const course1 = formacoes.slice(0, 16);
      const course2 = formacoes.slice(16, 32);
      const done1 = course1.filter(a => completedIds.has(a.id)).length;
      const done2 = course2.filter(a => completedIds.has(a.id)).length;
      addRow("Curso 1 — Começando a Vida Cristã", `${done1}/16 lições (${Math.round((done1/16)*100)}%)`);
      addRow("Curso 2 — Crescimento Cristão", `${done2}/16 lições (${Math.round((done2/16)*100)}%)`);
      addRow("Total de atividades concluídas", `${p.completed_count}/${activities.length} (${pct}%)`);

      // Vida Espiritual
      addSection("❤️ VIDA ESPIRITUAL");
      addRow("Devocionais realizados", `${doneDev}/${devocionais.length}`);
      addRow("Formações concluídas", `${doneForm}/${formacoes.length}`);
      if (assessment) {
        const EMOJIS = ["😔", "😐", "🙂", "😊", "🔥"];
        addRow("Vida de oração (autoav.)", assessment.prayer_score ? `${EMOJIS[assessment.prayer_score-1]} (${assessment.prayer_score}/5)` : "Não avaliado");
        addRow("Sente Deus perto (autoav.)", assessment.presence_score ? `${EMOJIS[assessment.presence_score-1]} (${assessment.presence_score}/5)` : "Não avaliado");
        addRow("Pediu conversa pastoral", assessment.needs_pastor ? "Sim" : "Não");
        if (assessment.notes) addRow("Observação pessoal", assessment.notes);
      }

      // Participação
      addSection("👥 PARTICIPAÇÃO COMUNITÁRIA");
      addRow("Presença nos encontros", `${doneEnc}/${encontros.length}`);

      // Plano pastoral
      if (plan) {
        addSection("🧭 PLANO DE DISCIPULADO");
        if (plan.objectives) { addText(`Objetivos: ${plan.objectives}`, margin, y, 9); y += 5; }
        if (plan.next_steps) { addText(`Próximos passos: ${plan.next_steps}`, margin, y, 9); y += 5; }
        if (plan.challenges) { addText(`Desafios: ${plan.challenges}`, margin, y, 9); y += 5; }
        if (plan.recommendations) { addText(`Recomendações: ${plan.recommendations}`, margin, y, 9); y += 5; }
      }

      // Observações pastorais
      if (observations) {
        addSection("📝 OBSERVAÇÕES PASTORAIS");
        const lines = doc.splitTextToSize(observations, W - margin * 2 - 6);
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.setTextColor("#444");
        doc.text(lines, margin + 3, y);
        y += lines.length * 5 + 2;
      }

      // Footer
      doc.setFillColor(31, 60, 136);
      doc.rect(0, 285, W, 12, "F");
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(200, 210, 255);
      doc.text("Caminho Boa Nova — Sistema de Acompanhamento Confirmatório", margin, 292);
      doc.text(`✝️ ${new Date().getFullYear()}`, W - margin - 10, 292);

      doc.save(`Relatorio_Confirmatorio_${p.full_name.replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
    }
    setLoading(false);
  }

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
        <FileText className="w-4 h-4 text-primary" />
        <p className="font-montserrat font-bold text-foreground text-sm">📄 Relatório Confirmatório</p>
      </div>
      <div className="p-4 space-y-4">
        {!loaded ? (
          <button onClick={loadData} disabled={loadingData}
            className="w-full py-2.5 rounded-xl bg-muted text-foreground font-inter text-sm font-medium hover:bg-muted/70 transition-colors">
            {loadingData ? "Carregando..." : "Carregar dados do relatório"}
          </button>
        ) : (
          <>
            {/* Aptidão selector */}
            <div>
              <p className="font-inter text-xs font-medium text-foreground mb-2">🏁 Aptidão para a Profissão de Fé</p>
              <div className="grid grid-cols-1 gap-2">
                {(["apto", "acompanhamento", "nao_apto"] as const).map(key => {
                  const cfg = APTIDAO_CFG[key];
                  const isSelected = aptidao === key;
                  return (
                    <button key={key} onClick={() => setAptidao(key)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                        isSelected ? "border-primary/50 bg-primary/5" : "border-border bg-muted/30"
                      }`}>
                      {key === "apto" ? <CheckCircle2 className="w-5 h-5 text-brand-green flex-shrink-0" /> :
                       key === "acompanhamento" ? <Clock className="w-5 h-5 text-accent-foreground flex-shrink-0" /> :
                       <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />}
                      <span className={`font-inter text-sm font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                        {cfg.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Observações pastorais */}
            <div>
              <p className="font-inter text-xs font-medium text-foreground mb-1.5">📝 Observações pastorais (incluídas no relatório)</p>
              <textarea
                value={observations}
                onChange={e => setObservations(e.target.value)}
                placeholder="Registre a maturidade espiritual, dúvidas, desafios e recomendações..."
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-inter text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            {/* Download button */}
            <button
              onClick={generatePDF}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-inter text-sm font-medium text-primary-foreground disabled:opacity-70 transition-all"
              style={{ background: "var(--gradient-hero)" }}
            >
              <Download className="w-4 h-4" />
              {loading ? "Gerando PDF..." : "📄 Baixar Relatório Confirmatório"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
