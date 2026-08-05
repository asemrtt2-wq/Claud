"use client";

import { useState, useTransition } from "react";
import { profileGradient } from "@/lib/profileColors";
import { switchProfile, verifyProfilePin } from "@/lib/profileActions";
import ProfileForm from "@/components/ProfileForm";

type ProfileSummary = {
  id: string;
  name: string;
  avatarEmoji: string;
  color: string;
  type: string;
  hasPin: boolean;
  dailyLimitMinutes: number | null;
};

export default function ProfilePicker({ profiles }: { profiles: ProfileSummary[] }) {
  const [manageMode, setManageMode] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pinPromptId, setPinPromptId] = useState<string | null>(null);
  const [pinValue, setPinValue] = useState("");
  const [pinError, setPinError] = useState(false);
  const [isPending, startTransition] = useTransition();

  const editingProfile = profiles.find((p) => p.id === editingId) ?? null;
  const pinProfile = profiles.find((p) => p.id === pinPromptId) ?? null;

  function handleCardClick(profile: ProfileSummary) {
    if (manageMode) {
      setEditingId(profile.id);
      return;
    }
    if (profile.hasPin) {
      setPinPromptId(profile.id);
      setPinValue("");
      setPinError(false);
      return;
    }
    startTransition(() => {
      switchProfile(profile.id);
    });
  }

  function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pinPromptId) return;
    startTransition(async () => {
      const result = await verifyProfilePin(pinPromptId, pinValue);
      if (result.success) {
        switchProfile(pinPromptId);
      } else {
        setPinError(true);
      }
    });
  }

  if (creating) {
    return (
      <div className="flex justify-center px-6">
        <ProfileForm
          initial={null}
          canDelete={false}
          onDone={() => setCreating(false)}
          onCancel={() => setCreating(false)}
        />
      </div>
    );
  }

  if (editingProfile) {
    return (
      <div className="flex justify-center px-6">
        <ProfileForm
          initial={{
            id: editingProfile.id,
            name: editingProfile.name,
            avatarEmoji: editingProfile.avatarEmoji,
            color: editingProfile.color,
            type: editingProfile.type as "adult" | "kids",
            dailyLimitMinutes: editingProfile.dailyLimitMinutes,
            hasPin: editingProfile.hasPin,
          }}
          canDelete={profiles.length > 1}
          onDone={() => setEditingId(null)}
          onCancel={() => setEditingId(null)}
        />
      </div>
    );
  }

  if (pinProfile) {
    return (
      <div className="flex justify-center px-6">
        <form
          onSubmit={handlePinSubmit}
          className="lumina-card w-full max-w-xs rounded-[26px] p-6 text-center"
        >
          <span
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
            style={{ background: profileGradient(pinProfile.color) }}
          >
            {pinProfile.avatarEmoji}
          </span>
          <p className="mb-4 text-sm font-bold">Code PIN de {pinProfile.name}</p>
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            autoFocus
            value={pinValue}
            onChange={(e) => {
              setPinValue(e.target.value.replace(/\D/g, ""));
              setPinError(false);
            }}
            className="mb-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-center text-lg tracking-[0.5em] text-white outline-none focus:border-[#7c5cff]"
          />
          {pinError && (
            <p className="mb-3 text-xs font-semibold text-[#ff8a8a]">Code incorrect.</p>
          )}
          <div className="flex justify-center gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              Déverrouiller
            </button>
            <button
              type="button"
              onClick={() => setPinPromptId(null)}
              className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-bold"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-10 flex flex-wrap items-center justify-center gap-8">
        {profiles.map((profile) => (
          <button
            key={profile.id}
            onClick={() => handleCardClick(profile)}
            className="group flex w-28 flex-col items-center gap-3"
          >
            <span
              className={`relative flex h-28 w-28 items-center justify-center rounded-3xl text-5xl shadow-lg transition group-hover:-translate-y-1.5 group-hover:shadow-2xl ${
                manageMode ? "ring-2 ring-white/40" : ""
              }`}
              style={{ background: profileGradient(profile.color) }}
            >
              {profile.avatarEmoji}
              {profile.hasPin && (
                <span className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-sm">
                  🔒
                </span>
              )}
              {manageMode && (
                <span className="absolute -top-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm text-navy">
                  ✏️
                </span>
              )}
            </span>
            <span className="text-sm font-bold text-white">{profile.name}</span>
            {profile.type === "kids" && (
              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#a78bfa]">
                Enfant
              </span>
            )}
          </button>
        ))}

        <button
          onClick={() => setCreating(true)}
          className="flex w-28 flex-col items-center gap-3"
        >
          <span className="flex h-28 w-28 items-center justify-center rounded-3xl border-2 border-dashed border-white/20 text-4xl text-white/40 transition hover:border-[#a78bfa] hover:text-white">
            +
          </span>
          <span className="text-sm font-bold text-white/60">Ajouter</span>
        </button>
      </div>

      <div className="text-center">
        <button
          onClick={() => setManageMode((v) => !v)}
          className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-bold text-[color:var(--color-lumina-text-muted)] transition hover:border-[#a78bfa] hover:text-white"
        >
          {manageMode ? "✓ Terminé" : "⚙️ Gérer les profils"}
        </button>
      </div>
    </div>
  );
}
