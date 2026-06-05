"use client";

import type { SubscriptionItem, WizardData } from "@/types/onboarding";

const QUICK_ADD: { name: string; amount: string }[] = [
  { name: "Netflix", amount: "15" },
  { name: "Spotify", amount: "10" },
  { name: "YouTube Premium", amount: "14" },
  { name: "Amazon Prime", amount: "9" },
  { name: "Disney+", amount: "8" },
  { name: "Apple TV", amount: "9" },
  { name: "Gym", amount: "30" },
  { name: "iCloud", amount: "3" },
];

function newItem(): SubscriptionItem {
  return {
    localId: crypto.randomUUID(),
    name: "",
    amount: "",
    frequency: "monthly",
  };
}

function monthlyAmount(
  amount: string,
  frequency: SubscriptionItem["frequency"]
): number | null {
  const n = parseFloat(amount);
  if (!n || n <= 0) return null;
  if (frequency === "quarterly") return Math.round((n / 3) * 100) / 100;
  if (frequency === "annual") return Math.round((n / 12) * 100) / 100;
  return n;
}

interface ItemErrors {
  name?: string;
  amount?: string;
}

interface Props {
  data: Pick<WizardData, "subscriptions" | "currency">;
  itemErrors: Record<string, ItemErrors>;
  onChange: (subscriptions: SubscriptionItem[]) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export function SubscriptionsStep({
  data,
  itemErrors,
  onChange,
  onNext,
  onBack,
  onSkip,
}: Props) {
  const items = data.subscriptions;

  function addItem(prefill?: Partial<SubscriptionItem>) {
    onChange([...items, { ...newItem(), ...prefill }]);
  }

  function removeItem(id: string) {
    onChange(items.filter((i) => i.localId !== id));
  }

  function updateItem(id: string, field: keyof SubscriptionItem, value: string) {
    onChange(items.map((i) => (i.localId === id ? { ...i, [field]: value } : i)));
  }

  function validate() {
    if (items.length === 0) return true; // optional step
    return items.every((i) => i.name.trim() && parseFloat(i.amount) > 0);
  }

  const alreadyAdded = new Set(items.map((i) => i.name.toLowerCase()));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-zinc-900">Lifestyle Subscriptions</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Add streaming, gym, software, and other recurring lifestyle costs.
          This step is optional.
        </p>
      </div>

      {/* Quick-add chips */}
      <div>
        <p className="text-xs font-medium text-zinc-500 mb-2">Quick add</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_ADD.map((chip) => {
            const taken = alreadyAdded.has(chip.name.toLowerCase());
            return (
              <button
                key={chip.name}
                type="button"
                disabled={taken}
                onClick={() => addItem({ name: chip.name, amount: chip.amount })}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  taken
                    ? "border-zinc-100 bg-zinc-50 text-zinc-300 cursor-not-allowed"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50"
                }`}
              >
                {chip.name} {data.currency}{chip.amount}
              </button>
            );
          })}
        </div>
      </div>

      {/* Items */}
      <div className="flex flex-col gap-3">
        {items.length === 0 && (
          <p className="text-sm text-zinc-400 py-2">
            No subscriptions added. You can skip this step.
          </p>
        )}

        {items.map((item) => {
          const errs = itemErrors[item.localId] ?? {};
          const monthly = monthlyAmount(item.amount, item.frequency);
          const showMonthly = item.frequency !== "monthly" && monthly !== null;

          return (
            <div
              key={item.localId}
              className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4"
            >
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-start">
                {/* Name */}
                <div>
                  <input
                    placeholder="Name (e.g. Netflix)"
                    value={item.name}
                    onChange={(e) => updateItem(item.localId, "name", e.target.value)}
                    className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 ${
                      errs.name
                        ? "border-rose-400"
                        : "border-zinc-200 focus:border-indigo-500"
                    }`}
                  />
                  {errs.name && (
                    <p className="mt-1 text-xs text-rose-500">{errs.name}</p>
                  )}
                </div>

                {/* Amount + monthly equiv */}
                <div>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs select-none">
                      {data.currency}
                    </span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={item.amount}
                      onChange={(e) => updateItem(item.localId, "amount", e.target.value)}
                      className={`w-24 rounded-lg border bg-white pl-6 pr-2 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 ${
                        errs.amount
                          ? "border-rose-400"
                          : "border-zinc-200 focus:border-indigo-500"
                      }`}
                    />
                  </div>
                  {showMonthly && (
                    <p className="mt-0.5 text-[10px] text-indigo-600 font-medium">
                      ≈ {data.currency}{monthly}/mo
                    </p>
                  )}
                  {errs.amount && (
                    <p className="mt-1 text-xs text-rose-500">{errs.amount}</p>
                  )}
                </div>

                {/* Frequency */}
                <div>
                  <select
                    value={item.frequency}
                    onChange={(e) => updateItem(item.localId, "frequency", e.target.value)}
                    className="rounded-lg border border-zinc-200 bg-white px-2 py-2 text-xs text-zinc-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeItem(item.localId)}
                  className="mt-1 flex h-8 w-8 items-center justify-center rounded-lg text-zinc-300 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => addItem()}
        className="flex items-center gap-2 self-start rounded-lg border border-dashed border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
      >
        + Add another
      </button>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-500 hover:bg-zinc-50 transition-colors"
        >
          Skip
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!validate()}
          className="flex-1 rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
