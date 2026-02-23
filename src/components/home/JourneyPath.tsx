import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Lock, Star, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import DevotionalView from "@/components/home/DevotionalView";

type Activity = {
  id: string;
  type: string;
  title: string;
  subtitle: string | null;
  order_num: number;
  points: number;
};

const typeColors: Record<string, string> = {
  devocional: "text-brand-green",
  formacao: "text-secondary",
  encontro: "text-primary",
  desafio: "text-accent",
};

const typeLabels: Record<string, string> = {
  devocional: "📖 Devocional",
  formacao: "🎓 Formação",
  encontro: "📅 Encontro",
  desafio: "✨ Desafio",
};

const typeIcons: Record<string, string> = {
  devocional: "📖",
  formacao: "🎓",
  encontro: "📅",
  desafio: "✨",
};

export default function JourneyPath() {
  const { profile } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);
  const [viewingDevotional, setViewingDevotional] = useState<Activity | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const [{ data: acts }, { data: prog }] = await Promise.all([
      supabase.from("activities").select("*").order("order_num"),
      supabase.from("user_progress").select("activity_id").eq("user_id", user.id),
    ]);

    setActivities(acts ?? []);
    setCompletedIds(new Set((prog ?? []).map(p => p.activity_id)));
    setLoading(false);
  }

  async function handleComplete(activityId: string) {
    setCompleting(activityId);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setCompleting(null); return; }

    await supabase.from("user_progress").insert({
      user_id: user.id,
      activity_id: activityId,
    });

    setCompletedIds(prev => new Set([...prev, activityId]));
    setCompleting(null);
  }

  function handleActivityClick(activity: Activity, status: "done" | "available" | "locked") {
    if (status === "locked") return;
    if (activity.type === "devocional") {
      setViewingDevotional(activity);
    } else if (status === "available") {
      handleComplete(activity.id);
    }
  }

  // Show devotional view
  if (viewingDevotional) {
    return (
      <DevotionalView
        activity={viewingDevotional}
        onBack={() => setViewingDevotional(null)}
        onComplete={async (id) => {
          await handleComplete(id);
          setViewingDevotional(null);
        }}
        isCompleted={completedIds.has(viewingDevotional.id)}
      />
    );
  }

  if (loading) {
    return (
      <div className="px-5 pt-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-montserrat font-black text-foreground text-xl">🛤️ Minha Jornada</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="w-14 h-14 rounded-full bg-muted flex-shrink-0" />
              <div className="flex-1 pt-2 space-y-2">
                <div className="h-3 bg-muted rounded w-20" />
                <div className="h-4 bg-muted rounded w-40" />
                <div className="h-3 bg-muted rounded w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const doneCount = [...completedIds].filter(id => activities.some(a => a.id === id)).length;

  let foundAvailable = false;
  const stepsWithStatus = activities.map(act => {
    const isDone = completedIds.has(act.id);
    if (isDone) return { ...act, status: "done" as const };
    if (!foundAvailable) {
      foundAvailable = true;
      return { ...act, status: "available" as const };
    }
    return { ...act, status: "locked" as const };
  });

  const nextStep = stepsWithStatus.find(s => s.status === "available");

  return (
    <div className="px-5 pt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-montserrat font-black text-foreground text-xl">🛤️ Minha Jornada</h2>
        <span className="text-muted-foreground text-xs font-inter bg-muted rounded-full px-3 py-1">
          {doneCount}/{activities.length} concluídos
        </span>
      </div>

      {/* Continue banner */}
      {nextStep && doneCount > 0 && (
        <div className="mb-5 p-3.5 rounded-2xl border border-secondary/30 bg-secondary/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary/15 flex items-center justify-center flex-shrink-0 text-lg">
            {typeIcons[nextStep.type] ?? "📌"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-inter text-[10px] text-muted-foreground">Continuar de onde parou</p>
            <p className="font-montserrat font-bold text-foreground text-sm truncate">{nextStep.title}</p>
          </div>
          <button
            onClick={() => handleActivityClick(nextStep, "available")}
            disabled={completing === nextStep.id}
            className="px-3 py-1.5 rounded-xl text-primary-foreground font-inter text-xs font-bold flex-shrink-0 transition-opacity disabled:opacity-60"
            style={{ background: "var(--gradient-hero)" }}
          >
            {completing === nextStep.id ? "..." : nextStep.type === "devocional" ? "Abrir →" : "Continuar →"}
          </button>
        </div>
      )}

      {activities.length === 0 && (
        <div className="text-center py-10">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-montserrat font-bold text-foreground text-sm">Jornada em preparação</p>
          <p className="text-muted-foreground font-inter text-xs mt-1">Seu pastor está preparando as atividades. Volte em breve!</p>
        </div>
      )}

      <div className="relative">
        {stepsWithStatus.map((step, index) => (
          <div key={step.id} className="flex gap-4 mb-1">
            {/* Timeline */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => handleActivityClick(step, step.status)}
                disabled={step.status === "locked"}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0 relative transition-all
                  ${step.status === "done" ? "bg-brand-green shadow-lg shadow-brand-green/40" : ""}
                  ${step.status === "available" ? "bg-gradient-orange shadow-2xl shadow-secondary/50 animate-float ring-4 ring-secondary/30" : ""}
                  ${step.status === "locked" ? "bg-muted opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                {step.status === "done" && (
                  <CheckCircle className="w-7 h-7 text-primary-foreground fill-primary-foreground" />
                )}
                {step.status === "available" && (
                  <>
                    <span className="text-2xl">{typeIcons[step.type] ?? "📌"}</span>
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center shadow-md">
                      <Star className="w-3 h-3 text-accent-foreground fill-accent-foreground" />
                    </span>
                  </>
                )}
                {step.status === "locked" && (
                  <Lock className="w-6 h-6 text-muted-foreground" />
                )}
              </button>

              {index < stepsWithStatus.length - 1 && (
                <div
                  className={`w-0.5 h-8 mt-1 rounded-full transition-all ${
                    step.status === "done"
                      ? "bg-brand-green/60"
                      : step.status === "available"
                      ? "bg-secondary/30"
                      : "bg-border"
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div
              className={`flex-1 pt-2.5 pb-5 ${step.status === "locked" ? "opacity-40" : "cursor-pointer"}`}
              onClick={() => handleActivityClick(step, step.status)}
            >
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-xs font-montserrat font-bold uppercase tracking-wide ${typeColors[step.type] ?? "text-muted-foreground"}`}>
                  {typeLabels[step.type] ?? step.type}
                </span>
                {step.status === "done" && (
                  <span className="text-xs text-brand-green font-inter font-medium bg-brand-green/10 rounded-full px-2 py-0.5">
                    ✔ Concluído
                  </span>
                )}
              </div>
              <h3 className="font-montserrat font-bold text-card-foreground text-base">{step.title}</h3>
              <p className="text-muted-foreground text-sm font-inter">{step.subtitle ?? ""}</p>

              {step.status === "available" && step.type !== "devocional" && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleComplete(step.id); }}
                  disabled={completing === step.id}
                  className="mt-3 px-5 py-2.5 bg-gradient-orange rounded-2xl text-primary-foreground text-sm font-montserrat font-bold shadow-lg shadow-secondary/30 active:scale-95 transition-all disabled:opacity-60"
                >
                  {completing === step.id ? "Marcando..." : doneCount === 0 ? "Iniciar →" : "Continuar →"}
                </button>
              )}

              {step.status === "available" && step.type === "devocional" && (
                <button
                  onClick={(e) => { e.stopPropagation(); setViewingDevotional(step); }}
                  className="mt-3 px-5 py-2.5 bg-gradient-orange rounded-2xl text-primary-foreground text-sm font-montserrat font-bold shadow-lg shadow-secondary/30 active:scale-95 transition-all"
                >
                  {doneCount === 0 ? "Abrir Devocional →" : "Ler Devocional →"}
                </button>
              )}

              {step.status === "done" && step.type === "devocional" && (
                <button
                  onClick={(e) => { e.stopPropagation(); setViewingDevotional(step); }}
                  className="mt-2 px-4 py-1.5 rounded-xl border border-brand-green/30 text-brand-green text-xs font-inter font-medium hover:bg-brand-green/5 transition-colors"
                >
                  📖 Reler devocional
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
