export type PlanId = "starter" | "growth" | "pro";

export interface PlanConfig {
  id: PlanId;
  name: string;
  priceMonthly: number;
  maxProjects: number;
  maxPrompts: number;
  maxEngines: number;
  allowedEngines: string[];
  maxScansPerMonth: number;
  features: {
    advancedReports: boolean;
    gapAnalysis: boolean;
    aeoSuggestions: boolean;
    whiteLabel: boolean;
    apiAccess: boolean;
    multiEngineComparison: boolean;
  };
  multiEnginePromptLimit: number;
}

export const ENGINE_TIERS = {
  primary: "chatgpt",
  secondary: "gemini",
  all: ["chatgpt", "gemini", "claude", "perplexity", "deepseek"],
} as const;

export const PLANS: Record<PlanId, PlanConfig> = {
  starter: {
    id: "starter",
    name: "Starter",
    priceMonthly: 29,
    maxProjects: 1,
    maxPrompts: 50,
    maxEngines: 1,
    allowedEngines: [ENGINE_TIERS.primary],
    maxScansPerMonth: 10,
    features: {
      advancedReports: false,
      gapAnalysis: false,
      aeoSuggestions: false,
      whiteLabel: false,
      apiAccess: false,
      multiEngineComparison: false,
    },
    multiEnginePromptLimit: 0,
  },
  growth: {
    id: "growth",
    name: "Growth",
    priceMonthly: 79,
    maxProjects: 5,
    maxPrompts: 200,
    maxEngines: 2,
    allowedEngines: [ENGINE_TIERS.primary, ENGINE_TIERS.secondary],
    maxScansPerMonth: 50,
    features: {
      advancedReports: true,
      gapAnalysis: true,
      aeoSuggestions: true,
      whiteLabel: false,
      apiAccess: false,
      multiEngineComparison: true,
    },
    multiEnginePromptLimit: 50,
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceMonthly: 199,
    maxProjects: 50,
    maxPrompts: 1000,
    maxEngines: 5,
    allowedEngines: [...ENGINE_TIERS.all],
    maxScansPerMonth: 500,
    features: {
      advancedReports: true,
      gapAnalysis: true,
      aeoSuggestions: true,
      whiteLabel: true,
      apiAccess: true,
      multiEngineComparison: true,
    },
    multiEnginePromptLimit: 100,
  },
};

export function getPlan(planId: PlanId): PlanConfig {
  return PLANS[planId] || PLANS.starter;
}

export function getPlanByPriceId(stripePriceId: string | null): PlanId {
  if (!stripePriceId) return "starter";
  
  const priceIdLower = stripePriceId.toLowerCase();
  if (priceIdLower.includes("pro") || priceIdLower.includes("199")) {
    return "pro";
  }
  if (priceIdLower.includes("growth") || priceIdLower.includes("79")) {
    return "growth";
  }
  return "starter";
}

export function canCreateProject(planId: PlanId, currentCount: number): boolean {
  const plan = getPlan(planId);
  return currentCount < plan.maxProjects;
}

export function canAddPrompts(planId: PlanId, currentCount: number, addCount: number = 1): boolean {
  const plan = getPlan(planId);
  return (currentCount + addCount) <= plan.maxPrompts;
}

export function canRunScan(planId: PlanId, scansThisMonth: number): boolean {
  const plan = getPlan(planId);
  return scansThisMonth < plan.maxScansPerMonth;
}

export function canUseEngine(planId: PlanId, engine: string): boolean {
  const plan = getPlan(planId);
  return plan.allowedEngines.includes(engine);
}

export function getPromptsForMultiEngine(planId: PlanId, totalPrompts: number): number {
  const plan = getPlan(planId);
  if (!plan.features.multiEngineComparison) return 0;
  return Math.min(totalPrompts, plan.multiEnginePromptLimit);
}
