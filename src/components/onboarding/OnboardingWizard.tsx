"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { WizardData, EssentialItem, SubscriptionItem, CategoryItem } from "@/types/onboarding";
import { calcBudget } from "@/lib/budgetCalculations";
import { ProgressBar } from "./ProgressBar";
import { BudgetStep } from "./BudgetStep";
import { EssentialsStep } from "./EssentialsStep";
import { SubscriptionsStep } from "./SubscriptionsStep";
import { CategoriesStep } from "./CategoriesStep";
import { ReviewStep } from "./ReviewStep";
import { LiveSummaryPanel } from "./LiveSummaryPanel";
import { BudgetRemainingBanner } from "./BudgetRemainingBanner";

const TOTAL_STEPS = 5;

function monthlyEquivalent(amount: string, frequency: SubscriptionItem["frequency"]): number {
  const n = parseFloat(amount) || 0;
  if (frequency === "quarterly") return Math.round((n / 3) * 100) / 100;
  if (frequency === "annual") return Math.round((n / 12) * 100) / 100;
  return n;
}

interface StepErrors {
  step1: Partial<Record<string, string>>;
  essentialItems: Record<string, { name?: string; amount?: string }>;
  subscriptionItems: Record<string, { name?: string; amount?: string }>;
}

function validateStep1(data: WizardData): Partial<Record<string, string>> {
  const errors: Partial<Record<string, string>> = {};
  const income = parseFloat(data.monthlyIncome);
  const budget = parseFloat(data.monthlyBudget);
  const savings = parseFloat(data.monthlySavingsGoal) || 0;
  if (!income || income <= 0) errors.monthlyIncome = "Income must be greater than 0";
  if (!budget || budget <= 0) errors.monthlyBudget = "Budget must be greater than 0";
  if (income > 0 && budget > 0 && budget + savings > income) {
    errors.monthlySavingsGoal = `Spending budget and savings (${data.currency}${Math.round(budget + savings)}) exceed income (${data.currency}${Math.round(income)}).`;
  }
  return errors;
}

function validateItems(
  items: (EssentialItem | SubscriptionItem)[]
): Record<string, { name?: string; amount?: string }> {
  const errors: Record<string, { name?: string; amount?: string }> = {};
  items.forEach((item) => {
    const e: { name?: string; amount?: string } = {};
    if (!item.name.trim()) e.name = "Required";
    const amt = parseFloat(item.amount);
    if (!amt || amt <= 0) e.amount = "Must be > 0";
    if (Object.keys(e).length) errors[item.localId] = e;
  });
  return errors;
}

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<StepErrors>({
    step1: {},
    essentialItems: {},
    subscriptionItems: {},
  });

  const [data, setData] = useState<WizardData>({
    monthlyIncome: "",
    monthlyBudget: "",
    currency: "$",
    monthlySavingsGoal: "",
    essentials: [],
    subscriptions: [],
    categories: [],
  });

  function update(updates: Partial<WizardData>) {
    setData((prev) => ({ ...prev, ...updates }));
  }

  function updateField(field: keyof WizardData, value: string) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  // ── Navigation ───────────────────────────────────────────

  function goNext() {
    if (step === 1) {
      const e = validateStep1(data);
      if (Object.keys(e).length) { setErrors((prev) => ({ ...prev, step1: e })); return; }
      setErrors((prev) => ({ ...prev, step1: {} }));
    }
    if (step === 2) {
      if (data.essentials.length === 0) {
        setErrors((prev) => ({ ...prev, step1: { essentials: "Add at least one essential cost" } }));
        return;
      }
      const itemErrs = validateItems(data.essentials);
      if (Object.keys(itemErrs).length) { setErrors((prev) => ({ ...prev, essentialItems: itemErrs })); return; }
      setErrors((prev) => ({ ...prev, essentialItems: {} }));
    }
    if (step === 3) {
      const itemErrs = validateItems(data.subscriptions);
      if (Object.keys(itemErrs).length) { setErrors((prev) => ({ ...prev, subscriptionItems: itemErrs })); return; }
      setErrors((prev) => ({ ...prev, subscriptionItems: {} }));
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function goBack() { setStep((s) => Math.max(s - 1, 1)); }
  function skipToNext() { setStep((s) => Math.min(s + 1, TOTAL_STEPS)); }

  // ── Submit ───────────────────────────────────────────────

  async function handleConfirm() {
    setIsSubmitting(true);
    setSubmitError(null);

    const payload = {
      monthlyIncome: parseFloat(data.monthlyIncome),
      monthlyBudget: parseFloat(data.monthlyBudget),
      currency: data.currency,
      ...(data.monthlySavingsGoal ? { monthlySavingsGoal: parseFloat(data.monthlySavingsGoal) } : {}),
      essentials: data.essentials.map((e) => ({ name: e.name.trim(), amount: parseFloat(e.amount) })),
      subscriptions: data.subscriptions.map((s) => ({ name: s.name.trim(), amount: monthlyEquivalent(s.amount, s.frequency) })),
      categories: data.categories.map((c) => ({ name: c.name.trim(), emoji: c.emoji, monthlyLimit: parseFloat(c.monthlyLimit) || 0 })),
    };

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) { setSubmitError(json.error ?? "Something went wrong. Please try again."); return; }
      router.push("/dashboard");
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Derived values ───────────────────────────────────────
  const c = calcBudget(data);
  const showPanel = step >= 2 && step <= 4; // Steps 2-4 only
  const isFullWidth = step === 1 || step === 5; // Step 1 and Review both use centered max-w-2xl

  // ── Step content ─────────────────────────────────────────
  const stepContent = (
    <>
      {/* Budget remaining banner — Steps 2, 3, 4 only */}
      {step >= 2 && step <= 4 && c.budget > 0 && (
        <BudgetRemainingBanner remaining={c.remaining} budget={c.budget} />
      )}

      {step === 1 && (
        <BudgetStep data={data} errors={errors.step1} onChange={updateField} onNext={goNext} />
      )}
      {step === 2 && (
        <EssentialsStep
          data={data}
          errors={errors.step1}
          itemErrors={errors.essentialItems}
          onChange={(essentials) => update({ essentials })}
          onNext={goNext}
          onBack={goBack}
        />
      )}
      {step === 3 && (
        <SubscriptionsStep
          data={data}
          itemErrors={errors.subscriptionItems}
          onChange={(subscriptions) => update({ subscriptions })}
          onNext={goNext}
          onBack={goBack}
          onSkip={skipToNext}
        />
      )}
      {step === 4 && (
        <CategoriesStep
          data={data}
          onChange={(categories: CategoryItem[]) => update({ categories })}
          onNext={goNext}
          onBack={goBack}
          onSkip={skipToNext}
        />
      )}
      {step === 5 && (
        <ReviewStep
          data={data}
          isSubmitting={isSubmitting}
          submitError={submitError}
          onUpdate={update}
          onConfirm={handleConfirm}
          onBack={goBack}
        />
      )}
    </>
  );

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      {isFullWidth ? (
        /* Step 5 — full width, no panel */
        <div className="max-w-2xl mx-auto">
          <ProgressBar currentStep={step} />
          <div className="rounded-2xl border border-white/80 bg-white/80 backdrop-blur-xl shadow-xl shadow-indigo-500/5 p-6 sm:p-8">
            {stepContent}
          </div>
        </div>
      ) : (
        /* Steps 1-4 — two-column on desktop */
        <div className="flex gap-6 items-start">
          {/* Left column — 60% */}
          <div className="flex-3 min-w-0">
            <ProgressBar currentStep={step} />
            <div className="rounded-2xl border border-white/80 bg-white/80 backdrop-blur-xl shadow-xl shadow-indigo-500/5 p-6 sm:p-8">
              {stepContent}
            </div>
          </div>

          {/* Right column — 40%, Steps 2-4 only, desktop only */}
          {showPanel && (
            <div className="hidden lg:block flex-2 min-w-0 sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto rounded-2xl border border-white/80 bg-white/60 backdrop-blur-xl shadow-lg shadow-indigo-500/5 p-5">
              <LiveSummaryPanel wizardState={data} onUpdateItem={update} />
            </div>
          )}
        </div>
      )}

      {/* Mobile sticky bar — Steps 2-4, hide on Review */}
      {!isFullWidth && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white/90 backdrop-blur-xl px-4 py-3 flex items-center justify-between">
          <div className="text-xs text-zinc-600">
            <span className="font-medium">
              Spending Budget: {data.currency}{c.budget > 0 ? fmt(c.budget) : "—"}
            </span>
            {c.budget > 0 && (
              <span className={`ml-2 font-medium ${c.remaining < 0 ? "text-rose-600" : "text-indigo-600"}`}>
                | Remaining: {data.currency}{fmt(Math.abs(c.remaining))}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-200 transition-colors"
          >
            View ▾
          </button>
        </div>
      )}

      {/* Mobile bottom drawer */}
      {drawerOpen && (
        <>
          <div className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-2xl border-t border-zinc-200 bg-white px-4 pt-4 pb-8">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-800">Budget Summary</span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
              >
                ✕
              </button>
            </div>
            <LiveSummaryPanel wizardState={data} onUpdateItem={update} />
          </div>
        </>
      )}

      {/* Spacer for mobile sticky bar */}
      {!isFullWidth && <div className="lg:hidden h-16" />}
    </div>
  );
}

function fmt(n: number) { return n.toLocaleString(undefined, { maximumFractionDigits: 0 }); }
