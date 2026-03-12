import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell, BellOff, CheckCircle, Search, RefreshCw } from "lucide-react";

interface PushUser {
  user_id: string;
  full_name: string;
  community: string;
  has_push: boolean;
  endpoint_count: number;
}

interface Props {
  adminArea?: string;
}

export default function PushStatusList({ adminArea }: Props) {
  const [users, setUsers] = useState<PushUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function fetchData() {
    setLoading(true);
    try {
      // Fetch profiles (students only - exclude admins/leaders)
      const profilesQuery = supabase
        .from("profiles")
        .select("user_id, full_name, community, area");

      if (adminArea) {
        profilesQuery.eq("area", adminArea as any);
      }

      const [{ data: profiles }, { data: subs }, { data: roles }] = await Promise.all([
        profilesQuery,
        supabase.from("push_subscriptions").select("user_id, endpoint"),
        supabase.from("user_roles").select("user_id, role"),
      ]);

      // Build a set of admin/leader user IDs to exclude
      const adminIds = new Set(
        (roles ?? [])
          .filter(r => r.role === "admin" || r.role === "lider")
          .map(r => r.user_id)
      );

      // Count subscriptions per user
      const subMap = new Map<string, number>();
      (subs ?? []).forEach(s => {
        subMap.set(s.user_id, (subMap.get(s.user_id) ?? 0) + 1);
      });

      const result: PushUser[] = (profiles ?? [])
        .filter(p => !adminIds.has(p.user_id))
        .map(p => ({
          user_id: p.user_id,
          full_name: p.full_name,
          community: p.community,
          has_push: subMap.has(p.user_id),
          endpoint_count: subMap.get(p.user_id) ?? 0,
        }))
        .sort((a, b) => {
          // Push enabled first, then alphabetical
          if (a.has_push !== b.has_push) return a.has_push ? -1 : 1;
          return a.full_name.localeCompare(b.full_name);
        });

      setUsers(result);
    } catch (err) {
      console.error("Failed to fetch push status:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [adminArea]);

  const filtered = search.trim()
    ? users.filter(u =>
        u.full_name.toLowerCase().includes(search.toLowerCase()) ||
        u.community.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  const enabledCount = filtered.filter(u => u.has_push).length;
  const disabledCount = filtered.filter(u => !u.has_push).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-montserrat font-bold text-foreground text-sm flex items-center gap-2">
          📊 Status Push dos Alunos
        </h3>
        <button
          onClick={fetchData}
          disabled={loading}
          className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-brand-green/10 border border-brand-green/20">
          <Bell className="w-4 h-4 text-brand-green flex-shrink-0" />
          <div>
            <p className="text-brand-green font-inter font-bold text-sm">{enabledCount}</p>
            <p className="text-brand-green/70 font-inter text-[10px]">Push ativo</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-destructive/10 border border-destructive/20">
          <BellOff className="w-4 h-4 text-destructive flex-shrink-0" />
          <div>
            <p className="text-destructive font-inter font-bold text-sm">{disabledCount}</p>
            <p className="text-destructive/70 font-inter text-[10px]">Sem push</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar aluno..."
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-card text-sm font-inter text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* List */}
      {loading ? (
        <p className="text-muted-foreground text-xs font-inter text-center py-4 animate-pulse">Carregando...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-xs font-inter text-center py-4">Nenhum aluno encontrado.</p>
      ) : (
        <div className="max-h-64 overflow-y-auto space-y-1 rounded-xl border border-border bg-card p-2">
          {filtered.map(u => (
            <div
              key={u.user_id}
              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="font-inter text-xs font-semibold text-foreground truncate">{u.full_name}</p>
                <p className="font-inter text-[10px] text-muted-foreground">{u.community}</p>
              </div>
              {u.has_push ? (
                <div className="flex items-center gap-1 text-brand-green">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-inter font-bold">
                    {u.endpoint_count > 1 ? `${u.endpoint_count} disp.` : "Ativo"}
                  </span>
                </div>
              ) : (
                <span className="text-[10px] font-inter font-bold text-destructive/70">Inativo</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
