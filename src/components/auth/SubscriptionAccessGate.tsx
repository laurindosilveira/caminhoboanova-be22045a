import type { ReactNode } from "react";
import { CreditCard, LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { isUnlimitedChurch } from "@/lib/planFeatures";
import { getSubscriptionAccess } from "@/lib/subscriptionAccess";

const selfServicePaths = new Set(["/minha-igreja", "/exportar-dados"]);

export function SubscriptionAccessGate({ children }: { children: ReactNode }) {
  const { user, profile, subscription: bootstrapSubscription, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ["church-subscription", profile?.church_id],
    queryFn: async () => {
      if (!profile?.church_id) return null;
      const { data, error } = await supabase
        .from("church_subscriptions")
        .select("subscription_status,trial_ends_at,is_active")
        .eq("church_id", profile.church_id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: Boolean(profile?.church_id),
    initialData: bootstrapSubscription,
    initialDataUpdatedAt: bootstrapSubscription ? Date.now() : undefined,
  });

  if (selfServicePaths.has(location.pathname) || isUnlimitedChurch(profile?.church_id, user?.email)) {
    return <>{children}</>;
  }

  if (isLoading) {
    return <div className="min-h-screen bg-background" aria-label="Verificando assinatura" />;
  }

  const access = getSubscriptionAccess(subscription);
  if (access.allowed) return <>{children}</>;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-lg border border-border bg-card p-6 text-center shadow-sm sm:p-8">
        <CreditCard className="mx-auto h-10 w-10 text-primary" aria-hidden="true" />
        <h1 className="mt-4 font-montserrat text-2xl font-black text-foreground">Assinatura precisa de atenção</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          O acesso da sua igreja está temporariamente limitado. Um administrador pode regularizar o plano em Minha Igreja.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button onClick={() => navigate("/minha-igreja")}>Regularizar assinatura</Button>
          <Button variant="outline" onClick={() => navigate("/exportar-dados")}>Privacidade e dados</Button>
          <Button variant="outline" onClick={() => void signOut()}>
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>
      </section>
    </main>
  );
}
