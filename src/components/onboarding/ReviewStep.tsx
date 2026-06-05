"use client";

import { useState } from "react";
import type { WizardData, EssentialItem, SubscriptionItem, CategoryItem } from "@/types/onboarding";
import { calcBudget } from "@/lib/budgetCalculations";

interface EditState { type: "essential" | "subscription" | "category"; id: string; }

interface Props {
  data: WizardData;
  isSubmitting: boolean;
  submitError: string | null;
  onUpdate: (updates: Partial<WizardData>) => void;
  onConfirm: () => void;
  onBack: () => void;
}

function monthlyEquiv(amount: string, freq: SubscriptionItem["frequency"]): number {
  const n = parseFloat(amount) || 0;
  if (freq === "quarterly") return Math.round((n / 3) * 100) / 100;
  if (freq === "annual") return Math.round((n / 12) * 100) / 100;
  return n;
}

export function ReviewStep({ data, isSubmitting, submitError, onUpdate, onConfirm, onBack }: Props) {
  const [editing, setEditing] = useState<EditState | null>(null);
  const c = calcBudget(data);
  const cur = data.currency;

  function fmt(n: number) { return n.toLocaleString(undefined, { maximumFractionDigits: 0 }); }

  function saveEssential(id: string, field: keyof EssentialItem, val: string) {
    onUpdate({ essentials: data.essentials.map((e) => e.localId === id ? { ...e, [field]: val } : e) });
  }
  function saveSubscription(id: string, field: keyof SubscriptionItem, val: string) {
    onUpdate({ subscriptions: data.subscriptions.map((s) => s.localId === id ? { ...s, [field]: val } : s) });
  }
  function saveCategory(id: string, field: keyof CategoryItem, val: string) {
    onUpdate({ categories: data.categories.map((cat) => cat.localId === id ? { ...cat, [field]: val } : cat) });
  }
  function isEd(type: EditState["type"], id: string) { return editing?.type === type && editing.id === id; }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-zinc-900">Review &amp; Confirm</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Check everything looks right. Click any item to edit inline.
        </p>
      </div>

      {/* BUDGET OVERVIEW */}
      <ReviewSection title="Budget Overview">
        <ReviewRow label="Monthly Income" value={`${cur}${fmt(c.income)}`} />
        <ReviewRow label="Monthly Spending Budget" value={`${cur}${fmt(c.budget)}`} />
        {data.monthlySavingsGoal && parseFloat(data.monthlySavingsGoal) > 0 && (
          <ReviewRow label="Monthly Savings Goal" value={`${cur}${fmt(parseFloat(data.monthlySavingsGoal))}`} />
        )}
      </ReviewSection>

      {/* FIXED ESSENTIALS */}
      <ReviewSection title="Fixed Essentials">
        {data.essentials.map((e) => (
          <div key={e.localId}>
            <ItemRow
              label={e.name}
              value={`${cur}${parseFloat(e.amount || "0").toLocaleString()}/mo`}
              onEdit={() => setEditing(isEd("essential", e.localId) ? null : { type: "essential", id: e.localId })}
            />
            {isEd("essential", e.localId) && (
              <InlineEdit>
                <EditField label="Name" value={e.name} onChange={(v) => saveEssential(e.localId, "name", v)} />
                <EditField label="Amount" type="number" value={e.amount} prefix={cur} onChange={(v) => saveEssential(e.localId, "amount", v)} />
                <DoneBtn onClick={() => setEditing(null)} />
              </InlineEdit>
            )}
          </div>
        ))}
      </ReviewSection>

      {/* LIFESTYLE SUBSCRIPTIONS */}
      <ReviewSection title="Lifestyle Subscriptions">
        {data.subscriptions.length === 0 ? (
          <p className="px-4 py-3 text-sm text-zinc-400">None added</p>
        ) : (
          data.subscriptions.map((s) => {
            const mo = monthlyEquiv(s.amount, s.frequency);
            const showEquiv = s.frequency !== "monthly" && parseFloat(s.amount) > 0;
            return (
              <div key={s.localId}>
                <ItemRow
                  label={s.name}
                  value={showEquiv ? `${cur}${parseFloat(s.amount).toLocaleString()} (≈ ${cur}${mo}/mo)` : `${cur}${parseFloat(s.amount || "0").toLocaleString()}/mo`}
                  onEdit={() => setEditing(isEd("subscription", s.localId) ? null : { type: "subscription", id: s.localId })}
                />
                {isEd("subscription", s.localId) && (
                  <InlineEdit>
                    <EditField label="Name" value={s.name} onChange={(v) => saveSubscription(s.localId, "name", v)} />
                    <EditField label="Amount" type="number" value={s.amount} prefix={cur} onChange={(v) => saveSubscription(s.localId, "amount", v)} />
                    <DoneBtn onClick={() => setEditing(null)} />
                  </InlineEdit>
                )}
              </div>
            );
          })
        )}
      </ReviewSection>

      {/* SPENDING CATEGORIES */}
      <ReviewSection title="Spending Categories">
        {data.categories.length === 0 ? (
          <p className="px-4 py-3 text-sm text-zinc-400">None added</p>
        ) : (
          data.categories.map((cat) => (
            <div key={cat.localId}>
              <ItemRow
                label={`${cat.emoji} ${cat.name}`}
                value={`${cur}${parseFloat(cat.monthlyLimit || "0").toLocaleString()}/mo`}
                onEdit={() => setEditing(isEd("category", cat.localId) ? null : { type: "category", id: cat.localId })}
              />
              {isEd("category", cat.localId) && (
                <InlineEdit>
                  <EditField label="Name" value={cat.name} onChange={(v) => saveCategory(cat.localId, "name", v)} />
                  <EditField label="Budget" type="number" value={cat.monthlyLimit} prefix={cur} onChange={(v) => saveCategory(cat.localId, "monthlyLimit", v)} />
                  <DoneBtn onClick={() => setEditing(null)} />
                </InlineEdit>
              )}
            </div>
          ))
        )}
      </ReviewSection>

      {/* BUDGET BREAKDOWN */}
      <ReviewSection title="Budget Breakdown">
        <div className="px-4 py-3 space-y-1.5 text-sm">
          <BreakdownRow label="Monthly Spending Budget" value={`${cur}${fmt(c.budget)}`} />
          {c.essentialsTotal > 0 && <BreakdownRow label="− Fixed Essentials" value={`− ${cur}${fmt(c.essentialsTotal)}`} muted />}
          {c.subscriptionsTotal > 0 && <BreakdownRow label="− Lifestyle Subscriptions" value={`− ${cur}${fmt(c.subscriptionsTotal)}`} muted />}
          {c.categoriesTotal > 0 && <BreakdownRow label="− Spending Categories" value={`− ${cur}${fmt(c.categoriesTotal)}`} muted />}
          <div className="border-t border-zinc-100 my-2" />
          <div className="flex justify-between font-semibold text-sm">
            <span className="text-zinc-700">Remaining</span>
            <span className={c.remaining < 0 ? "text-rose-600" : "text-indigo-700"}>
              {c.remaining < 0 ? "−" : ""}{cur}{fmt(Math.abs(c.remaining))}
            </span>
          </div>
        </div>
      </ReviewSection>

      {/* WARNINGS */}
      {c.overAllocated && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <span>🔴</span>
          <span>Total commitments exceed your monthly spending budget by {cur}{fmt(Math.abs(c.remaining))}.</span>
        </div>
      )}
      {!c.overAllocated && c.overEightyPctFixed && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span>⚠️</span>
          <span>Over 80% of your budget is committed to fixed costs.</span>
        </div>
      )}
      {!c.overAllocated && c.categoriesExceedDiscretionary && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span>⚠️</span>
          <span>
            Category budgets exceed your discretionary budget by {cur}
            {fmt(c.categoriesTotal - c.discretionary)}.
          </span>
        </div>
      )}

      {submitError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {submitError}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors disabled:opacity-40"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? (
            <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Saving…</>
          ) : "Start using BudgetSage"}
        </button>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
      <div className="border-b border-zinc-100 bg-zinc-50/60 px-4 py-2.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{title}</span>
      </div>
      <div className="divide-y divide-zinc-50">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between px-4 py-2.5 text-sm">
      <span className="text-zinc-600">{label}</span>
      <span className="font-semibold text-zinc-800">{value}</span>
    </div>
  );
}

function BreakdownRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className={`flex justify-between ${muted ? "text-zinc-500" : "text-zinc-800"}`}>
      <span>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function ItemRow({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <button
      type="button"
      onClick={onEdit}
      className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-zinc-50 transition-colors group"
    >
      <span className="text-sm text-zinc-800">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-500">{value}</span>
        <span className="text-xs text-zinc-300 group-hover:text-indigo-400 transition-colors">✏️</span>
      </div>
    </button>
  );
}

function InlineEdit({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end gap-3 border-t border-indigo-100 bg-indigo-50/30 px-4 py-3">
      {children}
    </div>
  );
}

function DoneBtn({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="self-end rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700">
      Done
    </button>
  );
}

function EditField({ label, value, type = "text", prefix, onChange }: {
  label: string; value: string; type?: string; prefix?: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-zinc-500">{label}</p>
      <div className="relative">
        {prefix && <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs select-none">{prefix}</span>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`rounded-lg border border-zinc-200 bg-white py-1.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none ${prefix ? "pl-6 pr-2 w-24" : "px-3 w-36"}`}
        />
      </div>
    </div>
  );
}
