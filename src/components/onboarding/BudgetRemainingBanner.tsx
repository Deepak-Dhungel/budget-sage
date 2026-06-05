"use client";

interface Props {
  remaining: number;
  budget: number;
}

export function BudgetRemainingBanner({ remaining, budget }: Props) {
  if (budget <= 0) return null;

  const pct = (remaining / budget) * 100;
  const isOver = remaining < 0;
  const isLow = !isOver && pct <= 20;

  if (isOver) {
    return (
      <div className="mb-5 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700">
        <span>🔴</span>
        <span>
          {Math.abs(remaining).toLocaleString(undefined, { maximumFractionDigits: 0 })} over budget
        </span>
      </div>
    );
  }

  if (isLow) {
    return (
      <div className="mb-5 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700">
        <span>⚠️</span>
        <span>
          Only{" "}
          <span className="font-semibold">
            {remaining.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>{" "}
          remaining of{" "}
          {budget.toLocaleString(undefined, { maximumFractionDigits: 0 })} budget
        </span>
      </div>
    );
  }

  return (
    <div className="mb-5 flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-indigo-300">
      <span>💰</span>
      <span>
        <span className="font-semibold text-indigo-200">
          {remaining.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </span>{" "}
        <span className="text-zinc-400">remaining of</span>{" "}
        <span className="text-zinc-300">
          {budget.toLocaleString(undefined, { maximumFractionDigits: 0 })} budget
        </span>
      </span>
    </div>
  );
}
