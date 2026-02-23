import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shield, User, Search, ShieldCheck, ShieldOff, CalendarDays, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

type UserEntry = {
  user_id: string;
  full_name: string;
  community: string;
  area: string;
  phone: string;
  role: "admin" | "user";
  admin_area: string | null;
  created_year: number;
};

const ROLE_CFG = {
  admin: {
    label: "Administrador",
    icon: <ShieldCheck className="w-4 h-4" />,
    badge: "bg-primary/10 text-primary border-primary/30",
  },
  user: {
    label: "Participante",
    icon: <User className="w-4 h-4" />,
    badge: "bg-muted text-muted-foreground border-border",
  },
};

const AREAS = ["Área 1", "Área 2"];

export default function UsersTab() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [promotingUser, setPromotingUser] = useState<UserEntry | null>(null);

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    setLoading(true);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, community, area, phone, created_at")
      .order("full_name");

    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id, role, admin_area");

    const roleMap: Record<string, { role: "admin" | "user"; admin_area: string | null }> = {};
    (roles ?? []).forEach(r => {
      roleMap[r.user_id] = { role: r.role as "admin" | "user", admin_area: r.admin_area ?? null };
    });

    const combined: UserEntry[] = (profiles ?? []).map(p => ({
      ...p,
      role: roleMap[p.user_id]?.role ?? "user",
      admin_area: roleMap[p.user_id]?.admin_area ?? null,
      created_year: new Date(p.created_at).getFullYear(),
    }));

    const years = [...new Set(combined.map(u => u.created_year))].sort((a, b) => b - a);
    setAvailableYears(years);
    setUsers(combined);
    setLoading(false);
  }

  async function promoteToAdmin(u: UserEntry, area: string) {
    setSaving(u.user_id);
    const { error } = await supabase.from("user_roles").upsert({
      user_id: u.user_id,
      role: "admin",
      admin_area: area,
    }, { onConflict: "user_id,role" });

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      setUsers(prev =>
        prev.map(p => p.user_id === u.user_id ? { ...p, role: "admin", admin_area: area } : p)
      );
      toast({
        title: "✅ Administrador ativado",
        description: `${u.full_name} agora lidera ${area}.`,
      });
    }
    setSaving(null);
    setPromotingUser(null);
  }

  async function demoteToUser(u: UserEntry) {
    setSaving(u.user_id);
    const { error } = await supabase.from("user_roles")
      .update({ role: "user", admin_area: null })
      .eq("user_id", u.user_id)
      .eq("role", "admin");

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      setUsers(prev =>
        prev.map(p => p.user_id === u.user_id ? { ...p, role: "user", admin_area: null } : p)
      );
      toast({
        title: "✅ Voltou a participante",
        description: `${u.full_name} agora é Participante.`,
      });
    }
    setSaving(null);
  }

  function handleToggle(u: UserEntry) {
    if (u.role === "admin") {
      demoteToUser(u);
    } else {
      setPromotingUser(u);
    }
  }

  const filtered = users.filter(u => {
    const matchesSearch = u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.community.toLowerCase().includes(search.toLowerCase());
    const matchesYear = selectedYear ? u.created_year === selectedYear : true;
    return matchesSearch && matchesYear;
  });

  const admins = filtered.filter(u => u.role === "admin");
  const regular = filtered.filter(u => u.role === "user");

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-montserrat font-black text-foreground text-lg">Gerenciar Usuários</h2>
          <p className="text-muted-foreground text-xs font-inter">Gerencie funções e permissões</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou comunidade..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 rounded-2xl border-border"
        />
      </div>

      {/* Year filter */}
      {availableYears.length > 0 && (
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setSelectedYear(null)}
              className={`px-3 py-1.5 rounded-xl text-xs font-montserrat font-bold transition-all ${
                !selectedYear ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Todos
            </button>
            {availableYears.map(year => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-3 py-1.5 rounded-xl text-xs font-montserrat font-bold transition-all ${
                  selectedYear === year ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Area selection modal */}
      {promotingUser && (
        <div className="bg-card border-2 border-primary/30 rounded-2xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="font-montserrat font-bold text-foreground text-sm">
            Selecione a turma para <span className="text-primary">{promotingUser.full_name}</span>
          </p>
          <p className="text-muted-foreground font-inter text-xs">
            Qual área este administrador vai liderar?
          </p>
          <div className="flex gap-2">
            {AREAS.map(area => (
              <button
                key={area}
                onClick={() => promoteToAdmin(promotingUser, area)}
                disabled={saving === promotingUser.user_id}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-xl text-sm font-montserrat font-bold text-primary transition-all disabled:opacity-50"
              >
                <MapPin className="w-4 h-4" />
                {area}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPromotingUser(null)}
            className="w-full text-center text-xs font-inter text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            Cancelar
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => <div key={i} className="bg-muted rounded-2xl h-16 animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* Admins */}
          {admins.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-montserrat font-bold text-muted-foreground uppercase tracking-wide">
                  Administradores ({admins.length})
                </span>
              </div>
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                {admins.map((u, i) => (
                  <UserRow
                    key={u.user_id}
                    user={u}
                    isLast={i === admins.length - 1}
                    isSaving={saving === u.user_id}
                    onToggle={() => handleToggle(u)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Regular users */}
          {regular.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-montserrat font-bold text-muted-foreground uppercase tracking-wide">
                  Participantes ({regular.length})
                </span>
              </div>
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                {regular.map((u, i) => (
                  <UserRow
                    key={u.user_id}
                    user={u}
                    isLast={i === regular.length - 1}
                    isSaving={saving === u.user_id}
                    onToggle={() => handleToggle(u)}
                  />
                ))}
              </div>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground font-inter text-sm">
              Nenhum usuário encontrado.
            </div>
          )}
        </>
      )}
    </div>
  );
}

function UserRow({
  user: u,
  isLast,
  isSaving,
  onToggle,
}: {
  user: UserEntry;
  isLast: boolean;
  isSaving: boolean;
  onToggle: () => void;
}) {
  const cfg = ROLE_CFG[u.role];
  const initials = u.full_name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className={`flex items-center gap-3 px-4 py-3 ${!isLast ? "border-b border-border" : ""} ${isSaving ? "opacity-60" : ""}`}>
      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-montserrat font-black text-sm ${
        u.role === "admin" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
      }`}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-montserrat font-bold text-foreground text-sm truncate">{u.full_name}</p>
        <p className="text-muted-foreground text-xs font-inter">
          {u.community} · {u.area}
          {u.role === "admin" && u.admin_area && (
            <span className="text-primary font-medium"> · Lidera {u.admin_area}</span>
          )}
        </p>
      </div>
      <button
        onClick={onToggle}
        disabled={isSaving}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-montserrat font-bold transition-all disabled:opacity-50 ${cfg.badge}`}
      >
        {u.role === "admin" ? <ShieldOff className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
        {u.role === "admin" ? "Remover admin" : "Tornar admin"}
      </button>
    </div>
  );
}
