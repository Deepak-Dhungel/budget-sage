"use client";

import { useState } from "react";
import type { WizardData } from "@/types/onboarding";
import { calcBudget } from "@/lib/budgetCalculations";

const ESSENTIAL_EMOJI: Record<string, string> = {
  rent: "🏠", electricity: "💡", internet: "📶",
  water: "💧", gas: "🔥", insurance: "🛡️",
};
const SUB_EMOJI: Record<string, string> = {
  netflix: "🎬", spotify: "🎵", "youtube premium": "▶️",
  "amazon prime": "📦", "disney+": "🏰", "apple tv": "🍎",
  gym: "🏋️", icloud: "☁️",
};

function essentialEmoji(name: string) { return ESSENTIAL_EMOJI[name.toLowerCase()] ?? "📌"; }
function subEmoji(name: string) { return SUB_EMOJI[name.toLowerCase()] ?? "🔔"; }

interface Editing { type: "essential" | "subscription" | "category"; id: string; value: string; }

interface Props {
  wizardState: WizardData;
  onUpdateItem: (updates: Partial<WizardData>) => void;
}

export function LiveSummaryPanel({ wizardState, onUpdateItem }: Props) {
  const [editing, setEditing] = useState<Editing | null>(null);
  const c = calcBudget(wizardState);
  const cur = wizardState.currency;

  const hasBudget = c.budget > 0;
  const hasEssentials = wizardState.essentials.length > 0;
  const hasSubs = wizardState.subscriptions.length > 0;
  const hasCats = wizardState.categories.length > 0;

  function fmt(n: number) {
    return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }

  function saveEdit() {
    if (!editing) return;
    const val = editing.value;
    if (editing.type === "essential") {
      onUpdateItem({ essentials: wizardState.essentials.map((e) => e.localId === editing.id ? { ...e, amount: val } : e) });
    } else if (editing.type === "subscription") {
      onUpdateItem({ subscriptions: wizardState.subscriptions.map((s) => s.localId === editing.id ? { ...s, amount: val } : s) });
    } else {
      onUpdateItem({ categories: wizardState.categories.map((cat) => cat.localId === editing.id ? { ...cat, monthlyLimit: val } : cat) });
    }
    setEditing(null);
  }

  if (!hasBudget && !c.income) {
    return (
      <div className="py-8 text-center text-xs text-zinc-400">
        Complete Step 1 to see your live budget summary here.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex items-center gap-2 pb-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Live Summary
        </span>
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
      </div>

      {/* ── Budget section ── */}
      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
        {/* Income / Budget rows */}
        <div className="px-4 py-3 space-y-2">
          {c.income > 0 && (
            <PanelRow label="Income" value={`${cur}${fmt(c.income)}`} />
          )}
          {hasBudget && (
            <PanelRow label="Spending Budget" value={`${cur}${fmt(c.budget)}`} />
          )}
          {wizardState.monthlySavingsGoal && parseFloat(wizardState.monthlySavingsGoal) > 0 && (
            <PanelRow
              label="Savings Goal"
              value={`${cur}${fmt(parseFloat(wizardState.monthlySavingsGoal))}`}
            />
          )}
        </div>

        {/* Committed breakdown — only if any committed */}
        {hasBudget && (hasEssentials || hasSubs || hasCats) && (
          <>
            <div className="border-t border-zinc-100 mx-4" />
            <div className="px-4 py-2 space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Committed
              </p>
              {hasEssentials && (
                <PanelRow
                  label="Fixed Essentials"
                  value={`${cur}${fmt(c.essentialsTotal)}`}
                  muted
                />
              )}
              {hasSubs && (
                <PanelRow
                  label="Lifestyle Subs"
                  value={`${cur}${fmt(c.subscriptionsTotal)}`}
                  muted
                />
              )}
              {hasCats && (
                <PanelRow
                  label="Categories"
                  value={`${cur}${fmt(c.categoriesTotal)}`}
                  muted
                />
              )}
            </div>
            <div className="border-t border-zinc-100 mx-4" />
            <div className="px-4 py-2.5">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-medium text-zinc-500">Remaining</span>
                <span
                  className={`text-base font-bold ${
                    c.remaining < 0 ? "text-rose-600" : "text-indigo-600"
                  }`}
                >
                  {c.remaining < 0 ? "−" : ""}{cur}{fmt(Math.abs(c.remaining))}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Remaining when no committed items yet */}
        {hasBudget && !hasEssentials && !hasSubs && !hasCats && (
          <>
            <div className="border-t border-zinc-100 mx-4" />
            <div className="px-4 py-2.5">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-medium text-zinc-500">Remaining</span>
                <span className="text-base font-bold text-indigo-600">
                  {cur}{fmt(c.budget)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Fixed Essentials (only if any) ── */}
      {hasEssentials && (
        <PanelSection label="Fixed Essentials">
          {wizardState.essentials.map((e) => (
            <EditableItem
              key={e.localId}
              emoji={essentialEmoji(e.name)}
              name={e.name || "—"}
              value={`${cur}${parseFloat(e.amount || "0").toLocaleString()}`}
              isEditing={editing?.id === e.localId}
              editValue={editing?.id === e.localId ? editing.value : e.amount}
              currency={cur}
              onEdit={() => setEditing(editing?.id === e.localId ? null : { type: "essential", id: e.localId, value: e.amount })}
              onEditChange={(v) => setEditing((p) => p ? { ...p, value: v } : null)}
              onSave={saveEdit}
              onCancel={() => setEditing(null)}
            />
          ))}
        </PanelSection>
      )}

      {/* ── Subscriptions (only if any) ── */}
      {hasSubs && (
        <PanelSection label="Subscriptions">
          {wizardState.subscriptions.map((s) => (
            <EditableItem
              key={s.localId}
              emoji={subEmoji(s.name)}
              name={s.name || "—"}
              value={`${cur}${parseFloat(s.amount || "0").toLocaleString()}`}
              isEditing={editing?.id === s.localId}
              editValue={editing?.id === s.localId ? editing.value : s.amount}
              currency={cur}
              onEdit={() => setEditing(editing?.id === s.localId ? null : { type: "subscription", id: s.localId, value: s.amount })}
              onEditChange={(v) => setEditing((p) => p ? { ...p, value: v } : null)}
              onSave={saveEdit}
              onCancel={() => setEditing(null)}
            />
          ))}
        </PanelSection>
      )}

      {/* ── Categories (only if any) ── */}
      {hasCats && (
        <PanelSection label="Spending Categories">
          {wizardState.categories.map((cat) => (
            <EditableItem
              key={cat.localId}
              emoji={cat.emoji}
              name={cat.name}
              value={`${cur}${parseFloat(cat.monthlyLimit || "0").toLocaleString()}`}
              isEditing={editing?.id === cat.localId}
              editValue={editing?.id === cat.localId ? editing.value : cat.monthlyLimit}
              currency={cur}
              onEdit={() => setEditing(editing?.id === cat.localId ? null : { type: "category", id: cat.localId, value: cat.monthlyLimit })}
              onEditChange={(v) => setEditing((p) => p ? { ...p, value: v } : null)}
              onSave={saveEdit}
              onCancel={() => setEditing(null)}
            />
          ))}
        </PanelSection>
      )}
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────

function PanelRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex justify-between text-xs">
      <span className={muted ? "text-zinc-400" : "text-zinc-500"}>{label}</span>
      <span className={muted ? "font-medium text-zinc-500" : "font-semibold text-zinc-800"}>{value}</span>
    </div>
  );
}

function PanelSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
      <div className="border-b border-zinc-100 bg-zinc-50/60 px-3 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
          {label}
        </span>
      </div>
      <div className="divide-y divide-zinc-50">{children}</div>
    </div>
  );
}

function EditableItem({
  emoji, name, value, isEditing, editValue, currency,
  onEdit, onEditChange, onSave, onCancel,
}: {
  emoji: string; name: string; value: string;
  isEditing: boolean; editValue: string; currency: string;
  onEdit: () => void; onEditChange: (v: string) => void;
  onSave: () => void; onCancel: () => void;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onEdit}
        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-zinc-50 transition-colors group"
      >
        <span className="w-5 shrink-0 text-sm">{emoji}</span>
        <span className="flex-1 truncate text-xs text-zinc-700">{name}</span>
        <span className="text-xs font-medium text-zinc-600">{value}</span>
        <span className="shrink-0 text-[10px] text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity">
          ✏️
        </span>
      </button>
      {isEditing && (
        <div className="flex items-center gap-2 border-t border-indigo-100 bg-indigo-50/40 px-3 py-2">
          <div className="relative flex-1">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400 text-xs select-none">
              {currency}
            </span>
            <input
              type="number"
              min="0"
              value={editValue}
              autoFocus
              onChange={(e) => onEditChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") onSave(); if (e.key === "Escape") onCancel(); }}
              className="w-full rounded-md border border-indigo-300 bg-white pl-5 pr-2 py-1 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>
          <button type="button" onClick={onSave} className="rounded-md bg-indigo-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-indigo-700">✓</button>
          <button type="button" onClick={onCancel} className="rounded-md border border-zinc-200 px-2 py-1 text-[11px] text-zinc-500 hover:bg-zinc-100">✕</button>
        </div>
      )}
    </div>
  );
}
