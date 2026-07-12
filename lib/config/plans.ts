import plansConfig from "@/config/plans.json";

export type PlanKey = keyof typeof plansConfig.plans;

export type PlanLimits = (typeof plansConfig.plans)[PlanKey]["limits"];

export function getPlanConfig(plan: PlanKey) {
  return plansConfig.plans[plan];
}

export function getAllPlanConfigs() {
  return plansConfig.plans;
}
