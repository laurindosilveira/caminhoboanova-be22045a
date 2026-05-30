import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useChurch } from "@/hooks/useChurch";
import { GraduationCap, ChevronDown, ChevronRight, BookOpen, Tag, Edit3, FileText, Pencil, Plus, X, Layers } from "lucide-react";
import LessonContentEditor from "@/components/admin/tabs/LessonContentEditor";
import LessonDevotionalEditor from "@/components/admin/tabs/LessonDevotionalEditor";
import LeaderGuideEditor from "@/components/admin/tabs/LeaderGuideEditor";
import LeaderLessonEditor from "@/components/admin/tabs/leader/LeaderLessonEditor";

type Lesson = {
  id: string;
  course_id: string;
  module_id: string | null;
  order_num: number;
  title: string;
  objective: string | null;
  topics: string[] | null;
  church_id: string | null;
};

type Module = {
  id: string;
  course_id: string;
  order_num: number;
  title: string;
  church_id: string | null;
  lessons: Lesson[];
};

type Course = {
  id: string;
  order_num: number;
  title: string;
  subtitle: string | null;
  lessons: Lesson[];
  modules: Module[];
};

type EditMode = { lesson: Lesson; mode: "study" | "devotionals" | "leader-guide" | "leader-customize" } | null;

export default function CoursesTab({ churchId: selectedChurchId }: { churchId?: string | null }) {
  const { role, isSuper } = useAuth();
  const { churchId } = useChurch();
  const effectiveChurchId = selectedChurchId ?? churchId;
  const isLider = role === "lider";

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [publishedLessonIds, setPublishedLessonIds] = useState<Set<string>>(new Set());
  const [devotionalCounts, setDevotionalCounts] = useState<Record<string, number>>({});

  // New global course
  const [showNewGlobal, setShowNewGlobal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [savingGlobal, setSavingGlobal] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // New module (keyed by course_id)
  const [showNewModule, setShowNewModule] = useState<string | null>(null);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [savingModule, setSavingModule] = useState(false);
  const [moduleError, setModuleError] = useState<string | null>(null);

  // New lesson (keyed by module_id or "course:{course_id}" for module-less)
  const [showNewLesson, setShowNewLesson] = useState<string | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonObjective, setNewLessonObjective] = useState("");
  const [savingLesson, setSavingLesson] = useState(false);
  const [lessonError, setLessonError] = useState<string | null>(null);
  // Track which context a new lesson belongs to: { courseId, moduleId | null }
  const [newLessonCtx, setNewLessonCtx] = useState<{ courseId: string; moduleId: string | null } | null>(null);

  useEffect(() => {
    if (effectiveChurchId || isSuper) {
      fetchCourses();
    }
  }, [effectiveChurchId, isSuper]);

  async function fetchCourses() {
    setLoading(true);
    const filter = effectiveChurchId
      ? `church_id.is.null,church_id.eq.${effectiveChurchId}`
      : "church_id.is.null";

    const [{ data: coursesData }, { data: lessonsData }, { data: modulesData }, { data: contentData }, { data: devData }] = await Promise.all([
      supabase.from("courses").select("*").or(filter).order("order_num"),
      supabase.from("lessons").select("*").or(filter).order("order_num"),
      supabase.from("modules" as any).select("*").or(filter).order("order_num"),
      supabase.from("lesson_content").select("lesson_id, church_id").or(filter),
      supabase.from("devotional_content").select("lesson_id, church_id").not("lesson_id", "is", null).or(filter),
    ]);

    const allLessons: Lesson[] = (lessonsData ?? []) as Lesson[];
    const allModules: Omit<Module, "lessons">[] = (modulesData ?? []) as any[];

    const courseList: Course[] = (coursesData ?? []).map(c => {
      const courseModules: Module[] = allModules
        .filter(m => m.course_id === c.id)
        .map(m => ({
          ...m,
          lessons: allLessons.filter(l => l.module_id === m.id),
        }));
      return {
        ...c,
        lessons: allLessons.filter(l => l.course_id === c.id),
        modules: courseModules,
      };
    });

    setCourses(courseList);
    setPublishedLessonIds(new Set((contentData ?? []).map(c => c.lesson_id)));

    const counts: Record<string, number> = {};
    (devData ?? []).forEach(d => {
      if (d.lesson_id) counts[d.lesson_id] = (counts[d.lesson_id] || 0) + 1;
    });
    setDevotionalCounts(counts);

    if (courseList.length > 0 && !expandedCourse) setExpandedCourse(courseList[0].id);
    setLoading(false);
  }

  async function handleCreateGlobal() {
    if (!newTitle.trim()) { setGlobalError("Informe o nome do curso."); return; }
    setSavingGlobal(true);
    setGlobalError(null);
    const { data: maxRow } = await supabase
      .from("courses").select("order_num").is("church_id", null)
      .order("order_num", { ascending: false }).limit(1);
    const orderNum = maxRow && maxRow.length > 0 ? ((maxRow[0] as any).order_num ?? 0) + 1 : 1;
    const { error } = await supabase.from("courses").insert({
      title: newTitle.trim(),
      subtitle: newSubtitle.trim() || null,
      order_num: orderNum,
      church_id: null,
    });
    setSavingGlobal(false);
    if (error) { setGlobalError(error.message); return; }
    setNewTitle("");
    setNewSubtitle("");
    setShowNewGlobal(false);
    fetchCourses();
  }

  async function handleCreateModule(courseId: string) {
    if (!newModuleTitle.trim()) { setModuleError("Informe o nome do módulo."); return; }
    setSavingModule(true);
    setModuleError(null);
    const course = courses.find(c => c.id === courseId);
    const existing = course?.modules ?? [];
    const orderNum = existing.length > 0 ? Math.max(...existing.map(m => m.order_num)) + 1 : 1;
    const { error } = await supabase.from("modules" as any).insert({
      course_id: courseId,
      title: newModuleTitle.trim(),
      order_num: orderNum,
      church_id: null,
    });
    setSavingModule(false);
    if (error) { setModuleError(error.message); return; }
    setNewModuleTitle("");
    setShowNewModule(null);
    fetchCourses();
  }

  async function handleCreateLesson(courseId: string, moduleId: string | null) {
    if (!newLessonTitle.trim()) { setLessonError("Informe o título da lição."); return; }
    setSavingLesson(true);
    setLessonError(null);
    const course = courses.find(c => c.id === courseId);
    const lessonsInScope = moduleId
      ? (course?.modules.find(m => m.id === moduleId)?.lessons ?? [])
      : (course?.lessons.filter(l => !l.module_id) ?? []);
    const orderNum = lessonsInScope.length > 0 ? Math.max(...lessonsInScope.map(l => l.order_num)) + 1 : 1;
    const { error } = await supabase.from("lessons").insert({
      course_id: courseId,
      module_id: moduleId,
      title: newLessonTitle.trim(),
      objective: newLessonObjective.trim() || null,
      order_num: orderNum,
      church_id: null,
      devotional_mode: "10",
    });
    setSavingLesson(false);
    if (error) { setLessonError(error.message); return; }
    setNewLessonTitle("");
    setNewLessonObjective("");
    setShowNewLesson(null);
    setNewLessonCtx(null);
    fetchCourses();
  }

  function openNewLesson(courseId: string, moduleId: string | null) {
    const key = moduleId ?? `course:${courseId}`;
    setNewLessonCtx({ courseId, moduleId });
    setShowNewLesson(key);
    setNewLessonTitle("");
    setNewLessonObjective("");
    setLessonError(null);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center mb-3 animate-pulse">
          <GraduationCap className="w-6 h-6 text-secondary" />
        </div>
        <p className="text-muted-foreground font-inter text-sm">Carregando cursos...</p>
      </div>
    );
  }

  if (editMode) {
    if (editMode.mode === "study") {
      return <LessonContentEditor lesson={editMode.lesson} churchId={effectiveChurchId} onBack={() => { setEditMode(null); fetchCourses(); }} />;
    }
    if (editMode.mode === "leader-guide") {
      return <LeaderGuideEditor lesson={editMode.lesson} onBack={() => { setEditMode(null); fetchCourses(); }} />;
    }
    if (editMode.mode === "leader-customize") {
      return <LeaderLessonEditor lesson={editMode.lesson} onBack={() => { setEditMode(null); fetchCourses(); }} />;
    }
    return <LessonDevotionalEditor lesson={editMode.lesson} churchId={effectiveChurchId} onBack={() => { setEditMode(null); fetchCourses(); }} />;
  }

  const totalLessons = courses.reduce((s, c) => s + c.lessons.length, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-secondary/10 rounded-2xl p-4 flex items-start gap-3">
        <GraduationCap className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-montserrat font-bold text-foreground text-sm">Trilha Confirmatória</p>
          <p className="text-muted-foreground font-inter text-xs mt-0.5">
            {totalLessons} lições em {courses.length} cursos cadastrados
          </p>
          <p className="text-muted-foreground font-inter text-[10px] mt-1">
            {isLider
              ? "✅ = publicado · Clique em \"Personalizar\" para adaptar uma lição para sua turma"
              : "✅ = conteúdo publicado · 📝 = usando conteúdo padrão · 📖 = devocionais"
            }
          </p>
        </div>
        {isSuper && (
          <button
            onClick={() => { setShowNewGlobal(v => !v); setGlobalError(null); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-montserrat font-bold text-primary-foreground flex-shrink-0"
            style={{ background: "var(--gradient-hero)" }}
          >
            {showNewGlobal ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {showNewGlobal ? "Cancelar" : "Novo Curso Global"}
          </button>
        )}
      </div>

      {/* New global course form */}
      {isSuper && showNewGlobal && (
        <div className="bg-card rounded-2xl border border-primary/30 p-4 space-y-3">
          <p className="font-montserrat font-bold text-foreground text-sm">Novo Curso Global</p>
          <p className="font-inter text-xs text-muted-foreground">Ficará disponível para todas as igrejas da plataforma.</p>
          <div>
            <label className="block font-inter text-xs font-medium text-foreground mb-1">Nome do curso *</label>
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Ex: Fundamentos da Fé"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background font-inter text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block font-inter text-xs font-medium text-foreground mb-1">Subtítulo (opcional)</label>
            <input
              type="text"
              value={newSubtitle}
              onChange={e => setNewSubtitle(e.target.value)}
              placeholder="Ex: Curso introdutório para novos membros"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background font-inter text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>
          {globalError && <p className="text-destructive font-inter text-xs">{globalError}</p>}
          <button
            onClick={handleCreateGlobal}
            disabled={savingGlobal}
            className="w-full py-2.5 rounded-xl font-montserrat font-bold text-primary-foreground text-sm disabled:opacity-50"
            style={{ background: "var(--gradient-hero)" }}
          >
            {savingGlobal ? "Criando..." : "Criar Curso Global"}
          </button>
        </div>
      )}

      {/* Course list */}
      {courses.map((course) => {
        const isOpen = expandedCourse === course.id;
        const hasModules = course.modules.length > 0;
        const lessonsWithoutModule = course.lessons.filter(l => !l.module_id);

        return (
          <div key={course.id} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            {/* Course header */}
            <button
              onClick={() => setExpandedCourse(isOpen ? null : course.id)}
              className="w-full flex items-center gap-3 p-4 text-left"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--gradient-hero)" }}>
                <span className="font-montserrat font-black text-primary-foreground text-sm">#{course.order_num}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-montserrat font-bold text-foreground text-sm">{course.title}</p>
                {course.subtitle && <p className="text-muted-foreground font-inter text-xs truncate">{course.subtitle}</p>}
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-muted-foreground font-inter text-xs">{course.lessons.length} lições</p>
                  {hasModules && (
                    <>
                      <span className="text-muted-foreground font-inter text-[10px]">·</span>
                      <p className="text-secondary font-inter text-[10px] font-medium">{course.modules.length} módulos</p>
                    </>
                  )}
                  <span className="text-muted-foreground font-inter text-[10px]">·</span>
                  <p className="text-brand-green font-inter text-[10px] font-medium">
                    {course.lessons.filter(l => publishedLessonIds.has(l.id)).length} publicadas
                  </p>
                </div>
              </div>
              {isOpen
                ? <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                : <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              }
            </button>

            {isOpen && (
              <div className="border-t border-border">
                {/* "Criar novo módulo" button (super admin only) */}
                {isSuper && (
                  <div className="px-4 py-3 border-b border-border bg-muted/20">
                    {showNewModule === course.id ? (
                      <div className="space-y-2">
                        <p className="font-montserrat font-bold text-foreground text-xs">Novo Módulo</p>
                        <input
                          type="text"
                          value={newModuleTitle}
                          onChange={e => setNewModuleTitle(e.target.value)}
                          placeholder="Ex: Módulo 1 — Fundamentos"
                          className="w-full px-3 py-2 rounded-xl border border-border bg-background font-inter text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                          autoFocus
                        />
                        {moduleError && <p className="text-destructive font-inter text-xs">{moduleError}</p>}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCreateModule(course.id)}
                            disabled={savingModule}
                            className="flex-1 py-2 rounded-xl font-montserrat font-bold text-primary-foreground text-xs disabled:opacity-50"
                            style={{ background: "var(--gradient-hero)" }}
                          >
                            {savingModule ? "Criando..." : "Criar Módulo"}
                          </button>
                          <button
                            onClick={() => { setShowNewModule(null); setNewModuleTitle(""); setModuleError(null); }}
                            className="px-3 py-2 rounded-xl bg-muted text-muted-foreground font-inter text-xs"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setShowNewModule(course.id); setNewModuleTitle(""); setModuleError(null); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors text-xs font-montserrat font-bold"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        Criar novo módulo
                      </button>
                    )}
                  </div>
                )}

                {/* Modules */}
                {course.modules.map((mod) => (
                  <div key={mod.id} className="border-b border-border">
                    {/* Module header */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-secondary/5">
                      <Layers className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
                      <p className="font-montserrat font-bold text-secondary text-xs flex-1">{mod.title}</p>
                      <span className="font-inter text-[10px] text-muted-foreground">{mod.lessons.length} lição(ões)</span>
                    </div>

                    {/* Lessons in this module */}
                    {mod.lessons.map((lesson) => (
                      <LessonRow
                        key={lesson.id}
                        lesson={lesson}
                        isSuper={isSuper}
                        isLider={isLider}
                        publishedLessonIds={publishedLessonIds}
                        devotionalCounts={devotionalCounts}
                        onEdit={setEditMode}
                        onRefresh={fetchCourses}
                      />
                    ))}

                    {/* Buttons: Criar nova lição / Criar novo devocional */}
                    {isSuper && (
                      <div className="px-4 py-2.5 bg-muted/10 space-y-2">
                        {showNewLesson === mod.id ? (
                          <NewLessonForm
                            title={newLessonTitle}
                            objective={newLessonObjective}
                            error={lessonError}
                            saving={savingLesson}
                            onChangeTitle={setNewLessonTitle}
                            onChangeObjective={setNewLessonObjective}
                            onSave={() => handleCreateLesson(course.id, mod.id)}
                            onCancel={() => { setShowNewLesson(null); setNewLessonCtx(null); setLessonError(null); }}
                          />
                        ) : (
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => openNewLesson(course.id, mod.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-montserrat font-bold"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Criar nova lição
                            </button>
                            {mod.lessons.length > 0 && (
                              <button
                                onClick={() => {
                                  const last = mod.lessons[mod.lessons.length - 1];
                                  setEditMode({ lesson: last, mode: "devotionals" });
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-green/10 text-brand-green hover:bg-brand-green/20 transition-colors text-xs font-montserrat font-bold"
                              >
                                <BookOpen className="w-3.5 h-3.5" />
                                Criar novo devocional
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Lessons without a module (legacy / direct course lessons) */}
                {lessonsWithoutModule.length > 0 && (
                  <div>
                    {hasModules && (
                      <div className="px-4 py-2 bg-muted/10 border-b border-border">
                        <p className="font-inter text-[10px] text-muted-foreground">Lições sem módulo</p>
                      </div>
                    )}
                    {lessonsWithoutModule.map((lesson) => (
                      <LessonRow
                        key={lesson.id}
                        lesson={lesson}
                        isSuper={isSuper}
                        isLider={isLider}
                        publishedLessonIds={publishedLessonIds}
                        devotionalCounts={devotionalCounts}
                        onEdit={setEditMode}
                        onRefresh={fetchCourses}
                      />
                    ))}
                  </div>
                )}

                {/* Empty state */}
                {course.lessons.length === 0 && course.modules.length === 0 && !isSuper && (
                  <p className="px-4 py-4 text-muted-foreground font-inter text-xs text-center">Nenhuma lição cadastrada ainda.</p>
                )}

                {/* Add lesson to course (without module) when there are no modules */}
                {isSuper && !hasModules && (
                  <div className="px-4 py-3 border-t border-border bg-muted/10">
                    {showNewLesson === `course:${course.id}` ? (
                      <NewLessonForm
                        title={newLessonTitle}
                        objective={newLessonObjective}
                        error={lessonError}
                        saving={savingLesson}
                        onChangeTitle={setNewLessonTitle}
                        onChangeObjective={setNewLessonObjective}
                        onSave={() => handleCreateLesson(course.id, null)}
                        onCancel={() => { setShowNewLesson(null); setNewLessonCtx(null); setLessonError(null); }}
                      />
                    ) : (
                      <button
                        onClick={() => openNewLesson(course.id, null)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-montserrat font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Criar nova lição
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Lesson row ───────────────────────────────────────────────────────────────

function LessonRow({
  lesson, isSuper, isLider, publishedLessonIds, devotionalCounts, onEdit, onRefresh,
}: {
  lesson: { id: string; order_num: number; title: string; objective: string | null; topics: string[] | null; church_id: string | null };
  isSuper: boolean;
  isLider: boolean;
  publishedLessonIds: Set<string>;
  devotionalCounts: Record<string, number>;
  onEdit: (mode: { lesson: any; mode: "study" | "devotionals" | "leader-guide" | "leader-customize" }) => void;
  onRefresh: () => void;
}) {
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(lesson.title);
  const [savingRename, setSavingRename] = useState(false);

  async function handleRename() {
    if (!renameValue.trim() || renameValue.trim() === lesson.title) { setRenaming(false); return; }
    setSavingRename(true);
    await supabase.from("lessons").update({ title: renameValue.trim() }).eq("id", lesson.id);
    setSavingRename(false);
    setRenaming(false);
    onRefresh();
  }

  const devCount = devotionalCounts[lesson.id] || 0;
  return (
    <div className="border-b border-border last:border-b-0">
      <div className="flex flex-col gap-2 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
            <span className="font-montserrat font-bold text-secondary text-xs">{lesson.order_num}</span>
          </div>
          <div className="flex-1 min-w-0">
            {renaming ? (
              <div className="flex items-center gap-1.5">
                <input
                  autoFocus
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleRename(); if (e.key === "Escape") { setRenaming(false); setRenameValue(lesson.title); } }}
                  className="flex-1 px-2 py-1 rounded-lg border border-primary bg-background font-inter text-sm text-foreground focus:outline-none"
                />
                <button onClick={handleRename} disabled={savingRename} className="px-2 py-1 rounded-lg bg-primary text-primary-foreground font-inter text-xs disabled:opacity-50">
                  {savingRename ? "..." : "OK"}
                </button>
                <button onClick={() => { setRenaming(false); setRenameValue(lesson.title); }} className="px-2 py-1 rounded-lg bg-muted text-muted-foreground font-inter text-xs">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 group">
                <p className="font-inter text-sm text-foreground">{lesson.title}</p>
                {isSuper && (
                  <button onClick={() => { setRenaming(true); setRenameValue(lesson.title); }} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted">
                    <Pencil className="w-3 h-3 text-muted-foreground" />
                  </button>
                )}
              </div>
            )}
            {lesson.objective && (
              <div className="flex items-start gap-1.5 mt-1">
                <BookOpen className="w-3 h-3 text-secondary flex-shrink-0 mt-0.5" />
                <p className="font-inter text-[10px] text-muted-foreground">{lesson.objective}</p>
              </div>
            )}
            {lesson.topics && lesson.topics.length > 0 && (
              <div className="flex items-start gap-1.5 mt-1">
                <Tag className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex flex-wrap gap-1">
                  {lesson.topics.map((topic, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[9px] font-inter font-medium">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          {publishedLessonIds.has(lesson.id) ? (
            <span className="text-brand-green text-[9px] font-inter font-bold flex-shrink-0">✅</span>
          ) : (
            <span className="text-muted-foreground text-[9px] font-inter flex-shrink-0">📝</span>
          )}
        </div>

        <div className="flex gap-2 ml-10 flex-wrap">
          {(isSuper || lesson.church_id !== null) && (
            <>
              <button
                onClick={() => onEdit({ lesson, mode: "study" })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors flex-shrink-0"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="font-inter text-xs font-medium">
                  {publishedLessonIds.has(lesson.id) ? "Editar Estudo" : "Criar Estudo"}
                </span>
              </button>
              <button
                onClick={() => onEdit({ lesson, mode: "devotionals" })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-green/10 text-brand-green hover:bg-brand-green/20 transition-colors flex-shrink-0"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="font-inter text-xs font-medium">
                  Devocionais {devCount > 0 && `(${devCount})`}
                </span>
              </button>
            </>
          )}
          <button
            onClick={() => onEdit({ lesson, mode: "leader-guide" })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 transition-colors flex-shrink-0"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="font-inter text-xs font-medium">Roteiro</span>
          </button>
          {isLider && (
            <button
              onClick={() => onEdit({ lesson, mode: "leader-customize" })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex-shrink-0"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span className="font-inter text-xs font-medium">Personalizar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── New lesson inline form ───────────────────────────────────────────────────

function NewLessonForm({
  title, objective, error, saving,
  onChangeTitle, onChangeObjective, onSave, onCancel,
}: {
  title: string;
  objective: string;
  error: string | null;
  saving: boolean;
  onChangeTitle: (v: string) => void;
  onChangeObjective: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-2">
      <p className="font-montserrat font-bold text-foreground text-xs">Nova Lição</p>
      <input
        type="text"
        value={title}
        onChange={e => onChangeTitle(e.target.value)}
        placeholder="Título da lição *"
        className="w-full px-3 py-2 rounded-xl border border-border bg-background font-inter text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
        autoFocus
      />
      <input
        type="text"
        value={objective}
        onChange={e => onChangeObjective(e.target.value)}
        placeholder="Objetivo (opcional)"
        className="w-full px-3 py-2 rounded-xl border border-border bg-background font-inter text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
      />
      {error && <p className="text-destructive font-inter text-xs">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={onSave}
          disabled={saving}
          className="flex-1 py-2 rounded-xl font-montserrat font-bold text-primary-foreground text-xs disabled:opacity-50"
          style={{ background: "var(--gradient-hero)" }}
        >
          {saving ? "Criando..." : "Criar Lição"}
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-2 rounded-xl bg-muted text-muted-foreground font-inter text-xs"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
