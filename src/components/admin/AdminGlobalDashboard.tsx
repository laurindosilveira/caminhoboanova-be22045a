import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Church, Users, CreditCard, Activity, TrendingUp } from "lucide-react";

export default function AdminGlobalDashboard() {
  const [stats, setStats] = useState({
    churches: 0,
    members: 0,
    activeSubs: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGlobalStats() {
      const [
        { count: churchCount },
        { count: memberCount },
        { data: subs }
      ] = await Promise.all([
        supabase.from('churches').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('church_subscriptions').select('recommended_plan, subscription_status')
      ]);

      const activeSubs = subs?.filter(s => s.subscription_status === 'active').length || 0;
      const revenue = subs?.filter(s => s.subscription_status === 'active').reduce((acc, s) => {
        const p = s.recommended_plan === 'comunidade' ? 79 : s.recommended_plan === 'crescimento' ? 129 : 199;
        return acc + p;
      }, 0) || 0;

      setStats({
        churches: churchCount || 0,
        members: memberCount || 0,
        activeSubs,
        revenue
      });
      setLoading(false);
    }
    fetchGlobalStats();
  }, []);

  if (loading) return <div>Carregando dashboard global...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <Church className="w-5 h-5 text-primary" />
            <div>
              <p className="text-2xl font-black">{stats.churches}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Igrejas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="w-5 h-5 text-brand-green" />
            <div>
              <p className="text-2xl font-black">{stats.members}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Membros</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-yellow-500" />
            <div>
              <p className="text-2xl font-black">{stats.activeSubs}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Assinaturas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-2xl font-black">R$ {stats.revenue}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Receita Est.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
