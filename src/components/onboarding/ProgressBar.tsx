const STEP_LABELS = [
  "Income & Budget",
  "Fixed Essentials",
  "Subscriptions",
  "Spending Categories",
  "Review & Confirm",
];

interface Props {
  currentStep: number;
}

export function ProgressBar({ currentStep }: Props) {
  const pct = (currentStep / STEP_LABELS.length) * 100;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
          Step {currentStep} of {STEP_LABELS.length}
        </span>
        <span className="text-sm font-semibold text-zinc-800">
          {STEP_LABELS[currentStep - 1]}
        </span>
      </div>

      {/* Track */}
      <div className="relative h-1.5 rounded-full bg-zinc-100">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-indigo-600 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Step dots */}
      <div className="flex justify-between mt-2">
        {STEP_LABELS.map((_, i) => {
          const n = i + 1;
          const done = n < currentStep;
          const active = n === currentStep;
          return (
            <div key={n} className="flex flex-col items-center gap-1">
              <div
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  done
                    ? "bg-indigo-600"
                    : active
                    ? "bg-indigo-600 ring-2 ring-indigo-200 scale-125"
                    : "bg-zinc-200"
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
