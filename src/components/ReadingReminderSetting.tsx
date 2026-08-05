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

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-[color:var(--color-lumina-text-muted)]">
        🌙 Rappel de lecture quotidien
      </span>
      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white outline-none focus:border-[#7c5cff]"
      />
      <button
        onClick={handleSave}
        disabled={isPending}
        className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-bold transition hover:border-[#a78bfa] disabled:opacity-60"
      >
        {isPending ? "..." : saved ? "✓" : "Sauvegarder"}
      </button>
    </div>
  );
}
