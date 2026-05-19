import { STRIPE_PLANS, PlanKey } from "./stripePlans";

export interface PlanFeatures {
  maxMembers: number | null;
  advancedExport: boolean;
  multiAreaManagement: boolean;
  detailedReports: boolean;
  customBranding: boolean;
}

export const PLAN_FEATURES: Record<string, PlanFeatures> = {
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
  Premium: {
    maxMembers: null, // Unlimited
    advancedExport: true,
    multiAreaManagement: true,
    detailedReports: true,
    customBranding: true,
  },
};

/**
 * Checks if a church/user is part of the special unlimited program.
 * Currently guaranteed for laurindosilveira@gmail.com
 */
export function isUnlimitedChurch(churchId: string | null, email?: string | null): boolean {
  const UNLIMITED_EMAILS = ["laurindosilveira@gmail.com"];
  const UNLIMITED_CHURCH_IDS = ["02f08580-80e5-4f57-8a2e-1b078d337278"]; // Igreja Boa Nova
  
  if (email && UNLIMITED_EMAILS.includes(email.toLowerCase())) return true;
  if (churchId && UNLIMITED_CHURCH_IDS.includes(churchId)) return true;
  
  return false;
}

export function getFeaturesForPlan(planKey: string | null): PlanFeatures {
  // Default/Free features or fallback if plan is null (trial might use croissance features)
  if (!planKey) {
    return PLAN_FEATURES.comunidade;
  }
  
  // Return features for the plan, or fallback to community if key not found
  return PLAN_FEATURES[planKey] || PLAN_FEATURES.comunidade;
}
