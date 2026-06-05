"use client";

import type { WizardData } from "@/types/onboarding";

interface Props {
  data: Pick<WizardData, "monthlyIncome" | "monthlyBudget" | "monthlySavingsGoal">;
  errors: Partial<Record<string, string>>;
  onChange: (field: keyof WizardData, value: string) => void;
  onNext: () => void;
}

const CUR = "$";

export function BudgetStep({ data, errors, onChange, onNext }: Props) {
  const income = parseFloat(data.monthlyIncome) || 0;
  const budget = parseFloat(data.monthlyBudget) || 0;
  const savings = parseFloat(data.monthlySavingsGoal) || 0;

  const combined = budget + savings;
  const exceedsIncome = income > 0 && budget > 0 && combined > income;

  function validate() {
    if (!income || income <= 0) return false;
    if (!budget || budget <= 0) return false;
    if (exceedsIncome) return false;
    return true;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-zinc-900">Income &amp; Budget</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Set your income and monthly spending budget. This is how BudgetSage
          calculates what you can afford.
        </p>
      </div>

      {/* Monthly income */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
          Monthly income <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm select-none">
            {CUR}
          </span>
          <input
            type="number"
            min="0"
            step="1"
            placeholder="3000"
            value={data.monthlyIncome}
            onChange={(e) => onChange("monthlyIncome", e.target.value)}
            className={`w-full rounded-lg border bg-white pl-7 pr-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 ${
              errors.monthlyIncome
                ? "border-rose-400 focus:border-rose-400"
                : "border-zinc-200 focus:border-indigo-500"
            }`}
          />
        </div>
        {errors.monthlyIncome && (
          <p className="mt-1.5 text-xs text-rose-500">{errors.monthlyIncome}</p>
        )}
        {income > 0 && (
          <p className="mt-1.5 text-xs text-zinc-400">
            Your spending budget + savings should not exceed your income.
          </p>
        )}
      </div>

      {/* Monthly spending budget */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
          Monthly spending budget <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm select-none">
            {CUR}
          </span>
          <input
            type="number"
            min="0"
            step="1"
            placeholder="1000"
            value={data.monthlyBudget}
            onChange={(e) => onChange("monthlyBudget", e.target.value)}
            className={`w-full rounded-lg border bg-white pl-7 pr-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 ${
              errors.monthlyBudget || exceedsIncome
                ? "border-rose-400 focus:border-rose-400"
                : "border-zinc-200 focus:border-indigo-500"
            }`}
          />
        </div>
        {errors.monthlyBudget && (
          <p className="mt-1.5 text-xs text-rose-500">{errors.monthlyBudget}</p>
        )}
      </div>

      {/* Monthly savings goal */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
          Monthly savings goal{" "}
          <span className="text-zinc-400 font-normal">(optional)</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm select-none">
            {CUR}
          </span>
          <input
            type="number"
            min="0"
            step="1"
            placeholder="500"
            value={data.monthlySavingsGoal}
            onChange={(e) => onChange("monthlySavingsGoal", e.target.value)}
            className={`w-full rounded-lg border bg-white pl-7 pr-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 ${
              exceedsIncome
                ? "border-rose-400 focus:border-rose-400"
                : "border-zinc-200 focus:border-indigo-500"
            }`}
          />
        </div>
        {exceedsIncome && (
          <p className="mt-1.5 text-xs text-rose-500">
            ⚠️ Your spending budget and savings ({CUR}
            {Math.round(combined).toLocaleString()}) exceed your income (
            {CUR}
            {Math.round(income).toLocaleString()}). Please adjust.
          </p>
        )}
        {!exceedsIncome && (
          <p className="mt-1.5 text-xs text-zinc-400">
            We&apos;ll create a savings goal and track your progress automatically.
          </p>
        )}
      </div>

      <button
        onClick={onNext}
        disabled={!validate()}
        className="mt-2 w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continue →
      </button>
    </div>
  );
}
