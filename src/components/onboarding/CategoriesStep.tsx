"use client";

import { useState } from "react";
import type { CategoryItem, WizardData } from "@/types/onboarding";

const QUICK_ADD_CHIPS: { name: string; emoji: string }[] = [
  { name: "Food & Groceries", emoji: "🍔" },
  { name: "Dining Out", emoji: "🍽️" },
  { name: "Shopping", emoji: "🛍️" },
  { name: "Transport", emoji: "🚗" },
  { name: "Health & Wellness", emoji: "⚕️" },
  { name: "Entertainment", emoji: "🎬" },
  { name: "Education", emoji: "📚" },
  { name: "Travel", emoji: "✈️" },
  { name: "Personal Care", emoji: "🧴" },
  { name: "Gifts", emoji: "🎁" },
];

const EMOJI_LIST = [
  "🍔","🍕","🍣","🍜","☕","🍺","🍷","🥗",
  "🛍️","👗","👟","💄","🛒","📱","💻","🎮",
  "🚗","🚌","✈️","🚀","🏠","💡","🔧","🛁",
  "⚽","🎵","🎬","📚","🎨","🏋️","🧘","🎸",
  "🐶","🐱","💊","⚕️","🧴","🎁","🌊","🌿",
];

interface Props {
  data: Pick<WizardData, "categories" | "monthlyBudget" | "currency">;
  onChange: (categories: CategoryItem[]) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export function CategoriesStep({ data, onChange, onNext, onBack, onSkip }: Props) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("💰");
  const [newLimit, setNewLimit] = useState("");

  const items = data.categories;

  // Chips that haven't been added yet
  const addedNames = new Set(items.map((i) => i.name));
  const availableChips = QUICK_ADD_CHIPS.filter((c) => !addedNames.has(c.name));

  function addFromChip(chip: { name: string; emoji: string }) {
    onChange([
      ...items,
      { localId: crypto.randomUUID(), name: chip.name, emoji: chip.emoji, monthlyLimit: "0", isDefault: true },
    ]);
  }

  function updateLimit(id: string, value: string) {
    onChange(items.map((c) => (c.localId === id ? { ...c, monthlyLimit: value } : c)));
  }

  function removeItem(id: string) {
    onChange(items.filter((c) => c.localId !== id));
  }

  function addCustom() {
    if (!newName.trim() || !newEmoji) return;
    onChange([
      ...items,
      { localId: crypto.randomUUID(), name: newName.trim(), emoji: newEmoji, monthlyLimit: newLimit || "0", isDefault: false },
    ]);
    setNewName("");
    setNewEmoji("💰");
    setNewLimit("");
    setShowAddForm(false);
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-zinc-900">Spending Categories</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Set a monthly limit for each spending category. Used to track actual
          vs. budgeted spending. This step is optional.
        </p>
      </div>

      {/* Quick-add chips */}
      {availableChips.length > 0 && (
        <div>
          <p className="text-xs font-medium text-zinc-500 mb-2">Quick add</p>
          <div className="flex flex-wrap gap-2">
            {availableChips.map((chip) => (
              <button
                key={chip.name}
                type="button"
                onClick={() => addFromChip(chip)}
                className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                <span>{chip.emoji}</span>
                <span>{chip.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Added category rows */}
      {items.length > 0 && (
        <div className="flex flex-col gap-2">
          {items.map((cat) => (
            <div
              key={cat.localId}
              className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5"
            >
              <span className="text-xl w-8 text-center">{cat.emoji}</span>
              <span className="flex-1 text-sm font-medium text-zinc-800">{cat.name}</span>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs select-none">
                  {data.currency}
                </span>
                <input
                  type="number"
                  min="0"
                  value={cat.monthlyLimit}
                  onChange={(e) => updateLimit(cat.localId, e.target.value)}
                  className="w-24 rounded-lg border border-zinc-200 bg-zinc-50 pl-6 pr-2 py-1.5 text-sm text-zinc-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <button
                type="button"
                onClick={() => removeItem(cat.localId)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-300 hover:bg-rose-50 hover:text-rose-500 transition-colors text-xs"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {items.length === 0 && availableChips.length === 0 && (
        <p className="text-sm text-zinc-400 py-2">All categories added.</p>
      )}

      {/* Add custom category */}
      {showAddForm ? (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/30 p-4">
          <p className="text-sm font-medium text-zinc-700 mb-3">Custom category</p>
          <div className="flex gap-3 items-start">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker((v) => !v)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-xl hover:border-indigo-300 transition-colors"
              >
                {newEmoji}
              </button>
              {showEmojiPicker && (
                <div className="absolute top-12 left-0 z-10 w-56 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg">
                  <div className="grid grid-cols-8 gap-1">
                    {EMOJI_LIST.map((e) => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => { setNewEmoji(e); setShowEmojiPicker(false); }}
                        className="flex h-7 w-7 items-center justify-center rounded text-base hover:bg-zinc-100 transition-colors"
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <input
              placeholder="Category name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs select-none">
                {data.currency}
              </span>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                className="w-24 rounded-lg border border-zinc-200 bg-white pl-6 pr-2 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-500 hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={addCustom}
              disabled={!newName.trim()}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-40"
            >
              Add
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 self-start rounded-lg border border-dashed border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
        >
          + Add custom
        </button>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack} className="rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">
          ← Back
        </button>
        <button type="button" onClick={onSkip} className="rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-500 hover:bg-zinc-50 transition-colors">
          Skip
        </button>
        <button type="button" onClick={onNext} className="flex-1 rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
          Continue →
        </button>
      </div>
    </div>
  );
}
