"use client";

import type { EssentialItem, WizardData } from "@/types/onboarding";

const QUICK_ADD = [
  { name: "Rent", amount: "1200" },
  { name: "Electricity", amount: "80" },
  { name: "Internet", amount: "60" },
  { name: "Water", amount: "40" },
  { name: "Gas", amount: "50" },
  { name: "Insurance", amount: "100" },
];

function newItem(): EssentialItem {
  return { localId: crypto.randomUUID(), name: "", amount: "" };
}

interface ItemErrors {
  name?: string;
  amount?: string;
}

interface Props {
  data: Pick<WizardData, "essentials" | "currency">;
  errors: Partial<Record<string, string>>;
  itemErrors: Record<string, ItemErrors>;
  onChange: (essentials: EssentialItem[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function EssentialsStep({
  data,
  errors,
  itemErrors,
  onChange,
  onNext,
  onBack,
}: Props) {
  const items = data.essentials;

  function addItem(prefill?: Partial<EssentialItem>) {
    onChange([...items, { ...newItem(), ...prefill }]);
  }

  function removeItem(id: string) {
    onChange(items.filter((i) => i.localId !== id));
  }

  function updateItem(id: string, field: keyof EssentialItem, value: string) {
    onChange(
      items.map((i) => (i.localId === id ? { ...i, [field]: value } : i))
    );
  }

  const alreadyAdded = new Set(items.map((i) => i.name.toLowerCase()));

  function validate() {
    if (items.length === 0) return false;
    return items.every((i) => i.name.trim() && parseFloat(i.amount) > 0);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-zinc-900">Fixed Essentials</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Add your recurring essential costs — rent, utilities, and similar
          fixed monthly expenses.
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

      {/* Items list */}
      <div className="flex flex-col gap-3">
        {items.length === 0 && (
          <p className="text-sm text-zinc-400 py-2">
            No essentials added yet. Use the quick-add chips or the button below.
          </p>
        )}
        {errors.essentials && (
          <p className="text-xs text-rose-500">{errors.essentials}</p>
        )}

        {items.map((item) => {
          const errs = itemErrors[item.localId] ?? {};
          return (
            <div
              key={item.localId}
              className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4"
            >
              <div className="grid grid-cols-[1fr_auto_auto] gap-3 items-start">
                {/* Name */}
                <div>
                  <input
                    placeholder="Name (e.g. Rent)"
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

                {/* Amount */}
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
                      className={`w-28 rounded-lg border bg-white pl-6 pr-2 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 ${
                        errs.amount
                          ? "border-rose-400"
                          : "border-zinc-200 focus:border-indigo-500"
                      }`}
                    />
                  </div>
                  {errs.amount && (
                    <p className="mt-1 text-xs text-rose-500">{errs.amount}</p>
                  )}
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
          className="flex-1 rounded-lg border border-zinc-200 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
        >
          ← Back
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
