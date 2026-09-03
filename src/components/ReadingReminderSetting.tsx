"use client";

import { useState, useTransition } from "react";
import { setReadingReminder } from "@/lib/profileActions";

export default function ReadingReminderSetting({
  profileId,
  initialReminderTime,
}: {
  profileId: string;
  initialReminderTime: string | null;
}) {
  const [time, setTime] = useState(initialReminderTime ?? "");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    startTransition(async () => {
      await setReadingReminder(profileId, time || null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  const dirty = time !== (initialReminderTime ?? "");

  return (
    // Stacked rather than one wrapping row: on a phone the label, the time field and the
    // save button used to wrap into three ragged lines with the native picker landing on top.
    <div>
      <p className="text-sm font-bold">🌙 Rappel de lecture quotidien</p>
      <p className="mt-1 text-xs text-[color:var(--color-lumina-text-muted)]">
        Une bannière s&apos;affiche dans l&apos;app à cette heure-là si tu n&apos;as pas encore lu
        aujourd&apos;hui — ce n&apos;est pas une notification du téléphone.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          aria-label="Heure du rappel"
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none [color-scheme:dark] focus:border-[#7c5cff]"
        />
        <button
          onClick={handleSave}
          disabled={isPending || (!dirty && !saved)}
          className="rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-4 py-2 text-xs font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
        >
          {isPending ? "…" : saved ? "✓ Enregistré" : "Sauvegarder"}
        </button>
        {time && (
          <button
            onClick={() => {
              setTime("");
              startTransition(async () => {
                await setReadingReminder(profileId, null);
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
              });
            }}
            disabled={isPending}
            className="rounded-xl border border-white/15 px-4 py-2 text-xs font-bold transition hover:border-[#a78bfa] disabled:opacity-40"
          >
            Désactiver
          </button>
        )}
      </div>
    </div>
  );
}
