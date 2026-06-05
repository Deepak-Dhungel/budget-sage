import type { EssentialItem, SubscriptionItem, CategoryItem, WizardData } from "@/types/onboarding";

// ── Individual calculation functions ────────────────────────────────────────

export function calculateTotalEssentials(essentials: EssentialItem[]): number {
  return essentials.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
}

export function calculateTotalSubscriptions(subscriptions: SubscriptionItem[]): number {
  return subscriptions.reduce((sum, s) => {
    const amount = parseFloat(s.amount) || 0;
    if (s.frequency === "quarterly") return sum + amount / 3;
    if (s.frequency === "annual") return sum + amount / 12;
    return sum + amount;
  }, 0);
}

export function calculateTotalCategories(categories: CategoryItem[]): number {
  return categories.reduce((sum, c) => sum + (parseFloat(c.monthlyLimit) || 0), 0);
}

export function calculateRemaining(
  budget: number,
  essentials: EssentialItem[],
  subscriptions: SubscriptionItem[],
  categories: CategoryItem[]
): number {
  return (
    budget -
    calculateTotalEssentials(essentials) -
    calculateTotalSubscriptions(subscriptions) -
    calculateTotalCategories(categories)
  );
}

export function calculateCommittedPercentage(
  budget: number,
  essentials: EssentialItem[],
  subscriptions: SubscriptionItem[]
): number {
  if (budget <= 0) return 0;
  return (
    ((calculateTotalEssentials(essentials) + calculateTotalSubscriptions(subscriptions)) /
      budget) *
    100
  );
}

// ── Full budget calculation (used by ReviewStep & LiveSummaryPanel) ──────────

export interface BudgetCalcs {
  budget: number;
  income: number;
  essentialsTotal: number;
  subscriptionsTotal: number; // frequency-adjusted monthly equivalent
  categoriesTotal: number;
  fixedTotal: number;         // essentials + subscriptions
  allocated: number;          // fixed + categories
  remaining: number;          // budget - allocated (can be negative)
  discretionary: number;      // budget - fixedTotal (alias for remaining before categories)

  // Percentages (raw, use Math.min for bar rendering)
  essentialsPct: number;
  subsPct: number;
  catsPct: number;
  allocatedPct: number;
  fixedUsagePct: number;

  // Warning flags
  budgetExceedsIncome: boolean;
  overEightyPctFixed: boolean;
  categoriesExceedDiscretionary: boolean;
  overAllocated: boolean;
  isHealthy: boolean; // remaining > 30% of budget
}

export function calcBudget(data: WizardData): BudgetCalcs {
  const budget = parseFloat(data.monthlyBudget) || 0;
  const income = parseFloat(data.monthlyIncome) || 0;

  const essentialsTotal = calculateTotalEssentials(data.essentials);
  const subscriptionsTotal = calculateTotalSubscriptions(data.subscriptions);
  const categoriesTotal = calculateTotalCategories(data.categories);

  const fixedTotal = essentialsTotal + subscriptionsTotal;
  const allocated = fixedTotal + categoriesTotal;
  const discretionary = budget - fixedTotal;
  const remaining = budget - allocated;

  const essentialsPct = budget > 0 ? (essentialsTotal / budget) * 100 : 0;
  const subsPct = budget > 0 ? (subscriptionsTotal / budget) * 100 : 0;
  const catsPct = budget > 0 ? (categoriesTotal / budget) * 100 : 0;
  const allocatedPct = budget > 0 ? Math.min((allocated / budget) * 100, 100) : 0;
  const fixedUsagePct = budget > 0 ? (fixedTotal / budget) * 100 : 0;

  return {
    budget,
    income,
    essentialsTotal,
    subscriptionsTotal,
    categoriesTotal,
    fixedTotal,
    allocated,
    remaining,
    discretionary,
    essentialsPct,
    subsPct,
    catsPct,
    allocatedPct,
    fixedUsagePct,
    budgetExceedsIncome: income > 0 && budget > income,
    overEightyPctFixed: budget > 0 && fixedUsagePct > 80,
    categoriesExceedDiscretionary: discretionary > 0 && categoriesTotal > discretionary,
    overAllocated: allocated > budget && budget > 0,
    isHealthy: budget > 0 && remaining / budget > 0.3,
  };
}
