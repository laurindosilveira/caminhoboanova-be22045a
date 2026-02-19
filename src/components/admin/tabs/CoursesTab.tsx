import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, ChevronDown, ChevronRight, BookOpen, Tag, Edit3 } from "lucide-react";
import LessonContentEditor from "@/components/admin/tabs/LessonContentEditor";

type Lesson = {
  id: string;
  course_id: string;
  order_num: number;
  title: string;
  objective: string | null;
  topics: string[] | null;
};

type Course = {
  id: string;
  order_num: number;
  title: string;
  subtitle: string | null;
  lessons: Lesson[];
};

export default function CoursesTab() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    setLoading(true);
    const { data: coursesData } = await supabase.from("courses").select("*").order("order_num");
    const { data: lessonsData } = await supabase.from("lessons").select("*").order("order_num");
    const courseList = (coursesData ?? []).map(c => ({
      ...c,
      lessons: (lessonsData ?? []).filter(l => l.course_id === c.id),
    }));
    setCourses(courseList);
    if (courseList.length > 0) setExpandedCourse(courseList[0].id);
    setLoading(false);
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

  // If editing a lesson's content
  if (editingLesson) {
    return <LessonContentEditor lesson={editingLesson} onBack={() => setEditingLesson(null)} />;
  }

  return (
    <div className="space-y-4">
      <div className="bg-secondary/10 rounded-2xl p-4 flex items-start gap-3">
        <GraduationCap className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-montserrat font-bold text-foreground text-sm">Trilha Confirmatória</p>
          <p className="text-muted-foreground font-inter text-xs mt-0.5">
            {courses.reduce((s, c) => s + c.lessons.length, 0)} lições em {courses.length} cursos cadastrados
          </p>
          <p className="text-muted-foreground font-inter text-[10px] mt-1">
            Clique em ✏️ para editar o conteúdo de cada lição (vídeo, áudio, perguntas, etc.)
          </p>
        </div>
      </div>

      {courses.map((course) => {
        const isOpen = expandedCourse === course.id;
        return (
          <div key={course.id} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
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
                <p className="text-muted-foreground font-inter text-xs mt-0.5">{course.lessons.length} lições</p>
              </div>
              {isOpen
                ? <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                : <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              }
            </button>

            {isOpen && (
              <div className="border-t border-border">
                {course.lessons.map((lesson) => (
                  <div key={lesson.id} className="border-b border-border last:border-b-0">
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="w-7 h-7 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                        <span className="font-montserrat font-bold text-secondary text-xs">{lesson.order_num}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-inter text-sm text-foreground">{lesson.title}</p>
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
                      {/* Edit content button */}
                      <button
                        onClick={() => setEditingLesson(lesson)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex-shrink-0"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span className="font-inter text-xs font-medium">Editar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
