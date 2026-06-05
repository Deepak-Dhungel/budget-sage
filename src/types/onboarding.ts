export type Currency = "$" | "£" | "€" | "₹";

export interface EssentialItem {
  localId: string;
  name: string;
  amount: string;
}

export interface SubscriptionItem {
  localId: string;
  name: string;
  amount: string;
  frequency: "monthly" | "quarterly" | "annual";
}

export interface CategoryItem {
  localId: string;
  name: string;
  emoji: string;
  monthlyLimit: string;
  isDefault: boolean;
}

export interface WizardData {
  // Step 1
  monthlyIncome: string;
  monthlyBudget: string;
  currency: Currency;
  monthlySavingsGoal: string;
  // Step 2
  essentials: EssentialItem[];
  // Step 3
  subscriptions: SubscriptionItem[];
  // Step 4
  categories: CategoryItem[];
}

// Validated payload sent to API
export interface OnboardingPayload {
  monthlyIncome: number;
  monthlyBudget: number;
  currency: string;
  monthlySavingsGoal?: number;
  essentials: Array<{ name: string; amount: number }>;
  subscriptions: Array<{ name: string; amount: number }>;
  categories: Array<{ name: string; emoji: string; monthlyLimit: number }>;
}
