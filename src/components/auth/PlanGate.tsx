import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getPlanByProductId } from "@/lib/stripePlans";
import { getFeaturesForPlan, PlanFeatures, isUnlimitedChurch } from "@/lib/planFeatures";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Zap } from "lucide-react";

interface PlanGateProps {
  children: React.ReactNode;
  feature: keyof PlanFeatures;
  fallbackPath?: string;
}

export function PlanGate({ children, feature }: PlanGateProps) {
  const { profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ["church-subscription", profile?.church_id],
    queryFn: async () => {
      if (!profile?.church_id) return null;
      const { data, error } = await supabase
        .from("church_subscriptions")
        .select("*")
        .eq("church_id", profile.church_id)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!profile?.church_id,
  });

  // Setup realtime subscription
  useEffect(() => {
    if (!profile?.church_id) return;

    const channel = supabase
      .channel(`subscription_changes_${profile.church_id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "church_subscriptions",
          filter: `church_id=eq.${profile.church_id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["church-subscription", profile.church_id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.church_id, queryClient]);

  if (isLoading) return null;

  const isUnlimited = isUnlimitedChurch(profile?.church_id, profile?.email);
  const isBlocked = subscription?.subscription_status === "blocked" && !isUnlimited;
  
  const rawPlanKey = (subscription as any)?.product_id 
    ? getPlanByProductId((subscription as any).product_id) 
    : (subscription as any)?.recommended_plan || "comunidade";
    
  const planKey = isUnlimited ? "Premium" : rawPlanKey;
  
  const features = getFeaturesForPlan(planKey);
  const hasAccess = isUnlimited || (!isBlocked && (features[feature] === true || features[feature] === null));

  const handleUpgrade = () => {
    navigate("/minha-igreja");
  };

  if (!hasAccess) {
    return (
      <>
        <div className="relative min-h-[200px] w-full flex items-center justify-center border-2 border-dashed border-muted rounded-lg bg-muted/50 p-8 text-center">
          <div className="max-w-md space-y-4">
            <ShieldAlert className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">Recurso Bloqueado</h3>
            <p className="text-sm text-muted-foreground">
              {isBlocked 
                ? "Sua assinatura está bloqueada. Regularize seu plano em 'Minha Igreja' para continuar usando este recurso."
                : "Este recurso não está disponível no seu plano atual. Faça um upgrade para liberar o acesso."}
            </p>
            <Button onClick={handleUpgrade} variant="outline" size="sm">
              Ver Planos em Minha Igreja
            </Button>
          </div>
        </div>

        <Dialog open={true} onOpenChange={() => navigate(-1)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <DialogTitle className="text-center">Upgrade Necessário</DialogTitle>
              <DialogDescription className="text-center">
                {isBlocked 
                  ? "Sua assinatura está com problemas ou foi bloqueada. Regularize seu status para acessar todas as funcionalidades."
                  : `O recurso "${feature}" é exclusivo de planos superiores. Melhore seu plano agora para impulsionar sua gestão.`}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col sm:flex-col gap-2 mt-4">
              <Button onClick={handleUpgrade} className="w-full">
                Ir para Minha Igreja
              </Button>
              <Button variant="ghost" onClick={() => navigate(-1)} className="w-full">
                Voltar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return <>{children}</>;
}
