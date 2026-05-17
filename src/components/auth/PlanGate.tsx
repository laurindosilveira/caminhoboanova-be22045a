import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getPlanByProductId } from "@/lib/stripePlans";
import { getFeaturesForPlan, PlanFeatures } from "@/lib/planFeatures";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PlanGateProps {
  children: React.ReactNode;
  feature: keyof PlanFeatures;
  fallbackPath?: string;
}

export function PlanGate({ children, feature, fallbackPath = "/minha-igreja" }: PlanGateProps) {
  const { profile, user } = useAuth();
  const location = useLocation();

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

  if (isLoading) return null;

  // If blocked, always redirect or show block
  if (subscription?.subscription_status === "blocked") {
    return <Navigate to="/minha-igreja" state={{ from: location, reason: "blocked" }} replace />;
  }

  const planKey = subscription?.product_id ? getPlanByProductId(subscription.product_id) : "comunidade";
  const features = getFeaturesForPlan(planKey);

  const hasAccess = features[feature] === true || features[feature] === null;

  if (!hasAccess) {
    return <Navigate to={fallbackPath} state={{ from: location, reason: "plan_limit" }} replace />;
  }

  return <>{children}</>;
}
