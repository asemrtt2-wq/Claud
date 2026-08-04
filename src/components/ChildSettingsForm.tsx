"use client";

import { useState, useTransition } from "react";
import { updateChildProfile } from "@/lib/childActions";

export default function ChildSettingsForm({
  childId,
  initialDailyLimitMinutes,
  initialReminderTime,
}: {
  childId: string;
  initialDailyLimitMinutes: number | null;
  initialReminderTime: string | null;
}) {
  const [dailyLimitMinutes, setDailyLimitMinutes] = useState(
    initialDailyLimitMinutes?.toString() ?? ""
  );
  const [reminderTime, setReminderTime] = useState(initialReminderTime ?? "");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await updateChildProfile(childId, {
        dailyLimitMinutes: dailyLimitMinutes ? Number(dailyLimitMinutes) : null,
        reminderTime: reminderTime || null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="lumina-card rounded-2xl p-5">
      <h3 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-[color:var(--color-lumina-text-muted)]">
        Contrôle parental
      </h3>
      <label className="mb-1 block text-xs font-semibold text-[color:var(--color-lumina-text-muted)]">
        Limite de lecture quotidienne (minutes, vide = illimité)
      </label>
      <input
        type="number"
        min={0}
        value={dailyLimitMinutes}
        onChange={(e) => setDailyLimitMinutes(e.target.value)}
        className="mb-3 w-full max-w-xs rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[#7c5cff]"
      />
      <label className="mb-1 block text-xs font-semibold text-[color:var(--color-lumina-text-muted)]">
        Rappel de l&apos;heure de l&apos;histoire du soir
      </label>
      <input
        type="time"
        value={reminderTime}
        onChange={(e) => setReminderTime(e.target.value)}
        className="mb-4 w-full max-w-xs rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[#7c5cff]"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-60"
      >
        {isPending ? "Sauvegarde..." : saved ? "✓ Sauvegardé" : "Sauvegarder"}
      </button>
    </form>
  );
}
