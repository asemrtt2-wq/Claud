"use client";

import { useState, useTransition } from "react";
import { setMonthlyBookGoal } from "@/lib/customerActions";

export default function ReadingGoalSetting({
  initialGoal,
  booksCompletedThisMonth,
}: {
  initialGoal: number | null;
  booksCompletedThisMonth: number;
}) {
  const [goal, setGoal] = useState(initialGoal?.toString() ?? "");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    startTransition(async () => {
      await setMonthlyBookGoal(goal ? Number(goal) : null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  const numericGoal = goal ? Number(goal) : null;
  const percent = numericGoal ? Math.min(100, Math.round((booksCompletedThisMonth / numericGoal) * 100)) : 0;

  return (
    <div>
      {numericGoal ? (
        <div className="mb-3">
          <div className="mb-1.5 flex items-center justify-between text-xs text-[color:var(--color-lumina-text-muted)]">
            <span>
              {booksCompletedThisMonth} / {numericGoal} livres ce mois-ci
            </span>
            <span>{percent}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full lumina-progress-track">
            <div className="h-full lumina-progress-fill" style={{ width: `${percent}%` }} />
          </div>
        </div>
      ) : (
        <p className="mb-3 text-xs text-[color:var(--color-lumina-text-muted)]">
          Fixe-toi un objectif de lecture mensuel.
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-[color:var(--color-lumina-text-muted)]">
          🎯 Objectif de lecture (livres / mois)
        </span>
        <input
          type="number"
          min={0}
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          className="w-20 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white outline-none focus:border-[#7c5cff]"
        />
        <button
          onClick={handleSave}
          disabled={isPending}
          className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-bold transition hover:border-[#a78bfa] disabled:opacity-60"
        >
          {isPending ? "..." : saved ? "✓" : "Sauvegarder"}
        </button>
      </div>
    </div>
  );
}
