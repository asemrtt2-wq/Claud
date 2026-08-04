"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createChildProfile, deleteChildProfile } from "@/lib/childActions";

const AVATARS = ["🧒", "👦", "👧", "🦊", "🐻", "🐱", "🐼", "🐰"];

type ChildProfileSummary = {
  id: string;
  name: string;
  avatarEmoji: string;
  dailyLimitMinutes: number | null;
  minutesReadToday: number;
  limitResetDate: string | null;
};

function minutesReadToday(profile: ChildProfileSummary) {
  const today = new Date().toISOString().slice(0, 10);
  return profile.limitResetDate === today ? profile.minutesReadToday : 0;
}

export default function ChildProfileManager({
  profiles,
}: {
  profiles: ChildProfileSummary[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [avatarEmoji, setAvatarEmoji] = useState(AVATARS[0]);
  const [dailyLimitMinutes, setDailyLimitMinutes] = useState("30");
  const [reminderTime, setReminderTime] = useState("19:30");
  const [isPending, startTransition] = useTransition();

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      await createChildProfile({
        name: name.trim(),
        avatarEmoji,
        dailyLimitMinutes: dailyLimitMinutes ? Number(dailyLimitMinutes) : null,
        reminderTime: reminderTime || null,
      });
      setName("");
      setShowForm(false);
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Supprimer ce profil enfant et toute sa progression de lecture ?")) return;
    startTransition(() => {
      deleteChildProfile(id);
    });
  }

  return (
    <div>
      {profiles.length > 0 && (
        <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {profiles.map((profile) => {
            const readToday = minutesReadToday(profile);
            const limitHit =
              Boolean(profile.dailyLimitMinutes) && readToday >= (profile.dailyLimitMinutes ?? 0);
            return (
              <div key={profile.id} className="lumina-card rounded-2xl p-4">
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] text-xl">
                    {profile.avatarEmoji}
                  </span>
                  <div>
                    <p className="text-sm font-bold">{profile.name}</p>
                    <p className="text-xs text-[color:var(--color-lumina-text-muted)]">
                      {`${readToday} min${
                        profile.dailyLimitMinutes ? ` / ${profile.dailyLimitMinutes} min` : ""
                      } aujourd'hui`}
                    </p>
                  </div>
                </div>
                {limitHit && (
                  <p className="mb-2 text-xs font-semibold text-[#ffb020]">
                    ⏱️ Temps de lecture atteint
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/account/kids/${profile.id}`}
                    className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-bold transition hover:border-[#a78bfa]"
                  >
                    📊 Tableau de bord
                  </Link>
                  <Link
                    href={`/kids/${profile.id}`}
                    className="rounded-lg bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-3 py-1.5 text-xs font-bold text-white transition hover:-translate-y-0.5"
                  >
                    🧸 Mode enfant
                  </Link>
                  <button
                    onClick={() => handleDelete(profile.id)}
                    disabled={isPending}
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-bold text-[#ff8a8a] transition hover:border-[#ff8a8a]"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="rounded-xl border border-dashed border-white/20 px-5 py-3 text-sm font-bold text-[color:var(--color-lumina-text-muted)] transition hover:border-[#a78bfa] hover:text-white"
        >
          + Ajouter un profil enfant
        </button>
      ) : (
        <form onSubmit={handleCreate} className="lumina-card max-w-md rounded-2xl p-5">
          <div className="mb-3 flex gap-2">
            {AVATARS.map((emoji) => (
              <button
                type="button"
                key={emoji}
                onClick={() => setAvatarEmoji(emoji)}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-lg transition ${
                  avatarEmoji === emoji ? "bg-[#7c5cff]" : "bg-white/5 hover:bg-white/10"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Prénom de l'enfant"
            required
            className="mb-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-[color:var(--color-lumina-text-muted)] focus:border-[#7c5cff]"
          />
          <label className="mb-1 block text-xs font-semibold text-[color:var(--color-lumina-text-muted)]">
            Limite de lecture quotidienne (minutes)
          </label>
          <input
            type="number"
            min={0}
            value={dailyLimitMinutes}
            onChange={(e) => setDailyLimitMinutes(e.target.value)}
            className="mb-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[#7c5cff]"
          />
          <label className="mb-1 block text-xs font-semibold text-[color:var(--color-lumina-text-muted)]">
            Rappel de l&apos;heure de l&apos;histoire
          </label>
          <input
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            className="mb-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[#7c5cff]"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              {isPending ? "Création..." : "Créer le profil"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-bold transition hover:border-white/30"
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
