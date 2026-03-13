import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Users, TrendingUp, AlertTriangle, BookOpen, BarChart3, Trophy, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from "recharts";

type TurmaStats = {
  turma_id: string;
  turma_name: string;
  area: string | null;
  total: number;
  active: number;
  inactive: number;
  avgProgress: number;
};

const COLORS = ["hsl(var(--primary))", "hsl(var(--brand-green))", "hsl(var(--accent))", "#f59e0b", "#8b5cf6", "#ec4899"];

export default function AdminOverviewTab({
  participants,
  activities,
  turmas,
}: {
  participants: any[];
  activities: any[];
  turmas: any[];
}) {
  const { isSuper, profile } = useAuth();
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [devProgress, setDevProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverviewData();
  }, []);

  async function fetchOverviewData() {
    setLoading(true);
    const [{ data: attData }, { data: devData }] = await Promise.all([
      supabase.from("attendance").select("user_id, status, created_at").eq("status", "presente"),
      supabase.from("devotional_progress").select("user_id, completed_at"),
    ]);

    // Monthly attendance trend
    const monthlyAtt: Record<string, number> = {};
    (attData ?? []).forEach(a => {
      const month = a.created_at.substring(0, 7);
      monthlyAtt[month] = (monthlyAtt[month] || 0) + 1;
    });
    const sortedMonths = Object.keys(monthlyAtt).sort().slice(-6);
    setAttendanceData(sortedMonths.map(m => ({
      month: new Date(m + "-01").toLocaleDateString("pt-BR", { month: "short" }),
      presenças: monthlyAtt[m],
    })));

    // Weekly devotional trend
    const weeklyDev: Record<string, number> = {};
    (devData ?? []).forEach(d => {
      const week = d.completed_at.substring(0, 10);
      const weekStart = getWeekStart(new Date(week));
      weeklyDev[weekStart] = (weeklyDev[weekStart] || 0) + 1;
    });
    const sortedWeeks = Object.keys(weeklyDev).sort().slice(-8);
    setDevProgress(sortedWeeks.map(w => ({
      semana: new Date(w).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
      devocionais: weeklyDev[w],
    })));

    setLoading(false);
  }

  function getWeekStart(date: Date) {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().substring(0, 10);
  }

  // Stats per turma
  const turmaStats: TurmaStats[] = turmas.map(t => {
    const turmaParticipants = participants.filter(p => (p as any).turma_id === t.id);
    const active = turmaParticipants.filter(p => p.completed_count > 0).length;
    const avgProgress = turmaParticipants.length > 0 && activities.length > 0
      ? Math.round(turmaParticipants.reduce((s, p) => s + (p.completed_count / activities.length) * 100, 0) / turmaParticipants.length)
      : 0;
    return {
      turma_id: t.id,
      turma_name: t.name,
      area: t.area,
      total: turmaParticipants.length,
      active,
      inactive: turmaParticipants.length - active,
      avgProgress,
    };
  });

  // Area distribution
  const areaData = [
    { name: "Área 1", value: participants.filter(p => p.area === "Área 1").length },
    { name: "Área 2", value: participants.filter(p => p.area === "Área 2").length },
  ].filter(d => d.value > 0);

  // Global stats
  const totalParticipants = participants.length;
  const totalActive = participants.filter(p => p.completed_count > 0).length;
  const totalInactive = totalParticipants - totalActive;
  const globalAvgProgress = totalParticipants > 0 && activities.length > 0
    ? Math.round(participants.reduce((s, p) => s + (p.completed_count / activities.length) * 100, 0) / totalParticipants)
    : 0;

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h2 className="font-montserrat font-black text-foreground text-lg">Dashboard Global</h2>
      </div>

      {/* Global KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<Users className="w-5 h-5" />} label="Total Discípulos" value={totalParticipants} color="primary" />
        <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Ativos" value={totalActive} color="brand-green" />
        <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Sem Atividade" value={totalInactive} color="destructive" />
        <StatCard icon={<Trophy className="w-5 h-5" />} label="Progresso Médio" value={`${globalAvgProgress}%`} color="accent" />
      </div>

      {/* Turma comparison chart */}
      {turmaStats.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <p className="font-montserrat font-bold text-foreground text-sm mb-3">📊 Comparativo entre Turmas</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={turmaStats} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="turma_name" type="category" tick={{ fontSize: 10 }} width={100} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="avgProgress" name="Progresso %" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Area distribution */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <p className="font-montserrat font-bold text-foreground text-xs mb-2">Distribuição por Área</p>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie data={areaData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={45} innerRadius={25}>
                {areaData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-3 mt-1">
            {areaData.map((d, i) => (
              <span key={d.name} className="flex items-center gap-1 text-[10px] font-inter text-muted-foreground">
                <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <p className="font-montserrat font-bold text-foreground text-xs mb-2">Turmas Ativas</p>
          <div className="space-y-1.5">
            {turmaStats.map(t => (
              <div key={t.turma_id} className="flex items-center justify-between">
                <span className="text-[10px] font-inter text-foreground truncate flex-1">{t.turma_name}</span>
                <span className="text-[10px] font-inter font-bold text-primary ml-2">{t.total}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly attendance trend */}
      {attendanceData.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <p className="font-montserrat font-bold text-foreground text-sm mb-3">📅 Tendência de Presença Mensal</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="presenças" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Weekly devotional trend */}
      {devProgress.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <p className="font-montserrat font-bold text-foreground text-sm mb-3">🙏 Devocionais por Semana</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={devProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="semana" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="devocionais" fill="hsl(var(--brand-green))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-3 shadow-sm">
      <div className={`w-8 h-8 rounded-xl bg-${color}/10 flex items-center justify-center text-${color} mb-2`}>
        {icon}
      </div>
      <p className="font-montserrat font-black text-foreground text-lg">{value}</p>
      <p className="text-muted-foreground font-inter text-[10px]">{label}</p>
    </div>
  );
}
