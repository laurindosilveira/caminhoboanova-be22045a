import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Globe, Lock, Unlock, ChevronDown, ChevronUp, Building2, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type GlobalCourse = {
  id: string;
  title: string;
  order_num: number;
};

type Church = {
  id: string;
  name: string;
  city: string | null;
};

type ReleaseMap = Record<string, Set<string>>; // courseId → Set<churchId>

export default function GlobalCourseReleasesPanel() {
  const [courses, setCourses] = useState<GlobalCourse[]>([]);
  const [churches, setChurches] = useState<Church[]>([]);
  const [releaseMap, setReleaseMap] = useState<ReleaseMap>({});
  const [loading, setLoading] = useState(true);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    const [{ data: coursesData }, { data: churchesData }, { data: releasesData }] = await Promise.all([
      supabase.from("courses").select("id, title, order_num").is("church_id", null).order("order_num"),
      supabase.from("churches").select("id, name, city").eq("is_active", true).order("name"),
      supabase.from("global_course_releases" as any).select("course_id, church_id"),
    ]);

    setCourses((coursesData ?? []) as GlobalCourse[]);
    setChurches((churchesData ?? []) as Church[]);

    const map: ReleaseMap = {};
    (releasesData ?? []).forEach((r: any) => {
      if (!map[r.course_id]) map[r.course_id] = new Set();
      map[r.course_id].add(r.church_id);
    });
    setReleaseMap(map);
    setLoading(false);

    if (coursesData && coursesData.length > 0 && !expandedCourse) {
      setExpandedCourse((coursesData[0] as any).id);
    }
  }

  async function toggleRelease(courseId: string, churchId: string) {
    const key = `${courseId}:${churchId}`;
    setTogglingKey(key);

    const isReleased = releaseMap[courseId]?.has(churchId) ?? false;

    if (isReleased) {
      const { error } = await (supabase.from("global_course_releases" as any) as any)
        .delete()
        .eq("course_id", courseId)
        .eq("church_id", churchId);

      if (error) {
        toast({ title: "Erro ao bloquear curso", description: error.message, variant: "destructive" });
        setTogglingKey(null);
        return;
      }

      setReleaseMap(prev => {
        const next = { ...prev };
        const set = new Set(next[courseId] ?? []);
        set.delete(churchId);
        next[courseId] = set;
        return next;
      });
      toast({ title: "Acesso bloqueado", description: "Igreja não verá mais este curso." });
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await (supabase.from("global_course_releases" as any) as any)
        .insert({ course_id: courseId, church_id: churchId, released_by: user?.id });

      if (error) {
        toast({ title: "Erro ao liberar curso", description: error.message, variant: "destructive" });
        setTogglingKey(null);
        return;
      }

      setReleaseMap(prev => {
        const next = { ...prev };
        const set = new Set(next[courseId] ?? []);
        set.add(churchId);
        next[courseId] = set;
        return next;
      });
      toast({ title: "Curso liberado", description: "Igreja poderá acessar este curso." });
    }

    setTogglingKey(null);
  }

  async function releaseToAll(courseId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    const unreleased = churches.filter(c => !(releaseMap[courseId]?.has(c.id)));
    if (unreleased.length === 0) return;

    const rows = unreleased.map(c => ({ course_id: courseId, church_id: c.id, released_by: user?.id }));
    const { error } = await (supabase.from("global_course_releases" as any) as any).insert(rows);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }

    setReleaseMap(prev => {
      const next = { ...prev };
      const set = new Set(next[courseId] ?? []);
      churches.forEach(c => set.add(c.id));
      next[courseId] = set;
      return next;
    });
    toast({ title: "Liberado para todas as igrejas" });
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted rounded-2xl animate-pulse" />)}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="font-montserrat font-bold text-foreground text-sm">Nenhum curso global criado</p>
        <p className="text-muted-foreground font-inter text-xs mt-1">Crie um curso global para gerenciar liberações.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-montserrat font-bold text-foreground text-sm">Liberação de Cursos Globais</p>
          <p className="font-inter text-xs text-muted-foreground mt-0.5">
            Controle quais igrejas têm acesso a cada curso global.
          </p>
        </div>
        <button
          onClick={fetchAll}
          className="p-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
          title="Atualizar"
        >
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-3 text-xs text-secondary font-inter">
        <strong>Como funciona:</strong> Libere um curso para uma igreja aqui. O admin da igreja ainda precisará ativá-lo para sua turma no painel deles.
      </div>

      {courses.map(course => {
        const released = releaseMap[course.id] ?? new Set<string>();
        const releasedCount = released.size;
        const isOpen = expandedCourse === course.id;

        return (
          <div key={course.id} className="bg-card border border-border rounded-2xl overflow-hidden">
            <button
              onClick={() => setExpandedCourse(isOpen ? null : course.id)}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-montserrat font-bold text-foreground text-sm">
                  Curso {course.order_num} — {course.title}
                </p>
                <p className="font-inter text-xs text-muted-foreground mt-0.5">
                  {releasedCount === 0
                    ? "Nenhuma igreja com acesso"
                    : releasedCount === churches.length
                    ? "Liberado para todas as igrejas"
                    : `${releasedCount} de ${churches.length} igrejas com acesso`}
                </p>
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
            </button>

            {isOpen && (
              <div className="border-t border-border px-4 pb-4 pt-3 space-y-2">
                {releasedCount < churches.length && (
                  <button
                    onClick={() => releaseToAll(course.id)}
                    className="w-full py-2 rounded-xl border border-brand-green/40 bg-brand-green/5 text-brand-green font-inter text-xs font-semibold hover:bg-brand-green/10 transition-colors"
                  >
                    Liberar para todas as igrejas
                  </button>
                )}

                {churches.length === 0 ? (
                  <p className="text-muted-foreground font-inter text-xs text-center py-4">
                    Nenhuma igreja ativa cadastrada.
                  </p>
                ) : (
                  churches.map(church => {
                    const isReleased = released.has(church.id);
                    const key = `${course.id}:${church.id}`;
                    const busy = togglingKey === key;

                    return (
                      <div
                        key={church.id}
                        className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-colors ${
                          isReleased ? "border-brand-green/30 bg-brand-green/5" : "border-border bg-muted/20"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isReleased ? "bg-brand-green/15" : "bg-muted"
                          }`}>
                            {isReleased
                              ? <Unlock className="w-4 h-4 text-brand-green" />
                              : <Building2 className="w-4 h-4 text-muted-foreground" />
                            }
                          </div>
                          <div className="min-w-0">
                            <p className="font-inter text-sm font-medium text-foreground truncate">{church.name}</p>
                            {church.city && (
                              <p className="font-inter text-[10px] text-muted-foreground">{church.city}</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => toggleRelease(course.id, church.id)}
                          disabled={busy}
                          className={`px-3 py-1.5 rounded-lg font-inter text-xs font-semibold transition-colors flex-shrink-0 disabled:opacity-40 ${
                            isReleased
                              ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                              : "bg-brand-green/10 text-brand-green hover:bg-brand-green/20"
                          }`}
                        >
                          {busy ? "..." : isReleased ? "Bloquear" : "Liberar"}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
