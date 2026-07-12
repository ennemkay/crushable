import { getPlanConfig, type PlanKey } from "@/lib/config/plans";

export type EntitlementResult = {
  allowed: boolean;
  reason?: string;
};

export function canSearchCrushes(plan: PlanKey): EntitlementResult {
  const limit = getPlanConfig(plan).limits.searchCrushesPerMonth;
  if (limit === 0) return { allowed: false, reason: "Crush search requires a paid plan." };
  return { allowed: true };
}

export function canViewCrushDetails(plan: PlanKey): EntitlementResult {
  if (!getPlanConfig(plan).limits.viewCrushDetails) {
    return { allowed: false, reason: "Crush details require a paid plan." };
  }
  return { allowed: true };
}

export function getActiveProfileLinkLimit(plan: PlanKey) {
  return getPlanConfig(plan).limits.activeProfileLinks;
}
