import { STRIPE_PLANS, PlanKey } from "./stripePlans";

export interface PlanFeatures {
  maxMembers: number | null;
  advancedExport: boolean;
  multiAreaManagement: boolean;
  detailedReports: boolean;
  customBranding: boolean;
}

export const PLAN_FEATURES: Record<PlanKey, PlanFeatures> = {
  comunidade: {
    maxMembers: 50,
    advancedExport: false,
    multiAreaManagement: false,
    detailedReports: false,
    customBranding: false,
  },
  crescimento: {
    maxMembers: 200,
    advancedExport: true,
    multiAreaManagement: true,
    detailedReports: true,
    customBranding: false,
  },
  pastoral: {
    maxMembers: null, // Unlimited
    advancedExport: true,
    multiAreaManagement: true,
    detailedReports: true,
    customBranding: true,
  },
};

export function getFeaturesForPlan(planKey: PlanKey | null): PlanFeatures {
  // Default/Free features or fallback if plan is null (trial might use croissance features)
  if (!planKey) {
    return PLAN_FEATURES.comunidade;
  }
  return PLAN_FEATURES[planKey];
}
