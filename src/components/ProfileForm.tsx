"use client";

import { useState, useTransition } from "react";
import { PROFILE_AVATARS, PROFILE_COLORS, profileGradient } from "@/lib/profileColors";
import {
  createProfile,
  updateProfile,
  deleteProfile,
  setProfilePin,
} from "@/lib/profileActions";

type ProfileFormValues = {
  id?: string;
  name: string;
  avatarEmoji: string;
  color: string;
  type: "adult" | "kids";
  dailyLimitMinutes: number | null;
  hasPin: boolean;
};

export default function ProfileForm({
  initial,
  onDone,
  onCancel,
  canDelete,
}: {
  initial: ProfileFormValues | null;
  onDone: () => void;
  onCancel: () => void;
  canDelete: boolean;
}) {
  const isEdit = Boolean(initial?.id);
  const [name, setName] = useState(initial?.name ?? "");
  const [avatarEmoji, setAvatarEmoji] = useState(initial?.avatarEmoji ?? PROFILE_AVATARS[0]);
  const [color, setColor] = useState(initial?.color ?? "purple");
  const [type, setType] = useState<"adult" | "kids">(initial?.type ?? "adult");
  const [dailyLimitMinutes, setDailyLimitMinutes] = useState(
    initial?.dailyLimitMinutes?.toString() ?? "30"
  );
  const [pin, setPin] = useState("");
  const [removePin, setRemovePin] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);

    startTransition(async () => {
      try {
        let profileId = initial?.id;
        if (isEdit && profileId) {
          await updateProfile(profileId, {
            name: name.trim(),
            avatarEmoji,
            color,
            type,
            dailyLimitMinutes: type === "kids" ? Number(dailyLimitMinutes) || null : null,
          });
        } else {
          profileId = await createProfile({
            name: name.trim(),
            avatarEmoji,
            color,
            type,
            dailyLimitMinutes: type === "kids" ? Number(dailyLimitMinutes) || null : null,
          });
        }

        if (profileId && (pin || removePin)) {
          await setProfilePin(profileId, removePin ? null : pin);
        }

        onDone();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      }
    });
  }

  function handleDelete() {
    if (!initial?.id) return;
    if (!confirm(`Supprimer le profil "${initial.name}" et toutes ses données ?`)) return;
    startTransition(async () => {
      try {
        await deleteProfile(initial.id!);
        onDone();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="lumina-card w-full max-w-md rounded-[26px] p-6">
      <h3 className="mb-4 text-lg font-extrabold">
        {isEdit ? "Modifier le profil" : "Nouveau profil"}
      </h3>

      <div className="mb-4 flex items-center gap-4">
        <span
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-3xl"
          style={{ background: profileGradient(color) }}
        >
          {avatarEmoji}
        </span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom du profil"
          required
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-[color:var(--color-lumina-text-muted)] focus:border-[#7c5cff]"
        />
      </div>

      <label className="mb-1 block text-xs font-semibold text-[color:var(--color-lumina-text-muted)]">
        Avatar
      </label>
      <div className="mb-4 flex flex-wrap gap-2">
        {PROFILE_AVATARS.map((emoji) => (
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

      <label className="mb-1 block text-xs font-semibold text-[color:var(--color-lumina-text-muted)]">
        Couleur
      </label>
      <div className="mb-4 flex gap-2">
        {Object.keys(PROFILE_COLORS).map((key) => (
          <button
            type="button"
            key={key}
            onClick={() => setColor(key)}
            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm text-white transition ${
              color === key ? "ring-2 ring-white" : "hover:opacity-80"
            }`}
            style={{ background: profileGradient(key) }}
            aria-label={key}
          >
            {color === key ? "✓" : ""}
          </button>
        ))}
      </div>

      <label className="mb-1 block text-xs font-semibold text-[color:var(--color-lumina-text-muted)]">
        Type de profil
      </label>
      <div className="mb-4 flex gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            checked={type === "adult"}
            onChange={() => setType("adult")}
          />
          Adulte
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            checked={type === "kids"}
            onChange={() => setType("kids")}
          />
          Enfant
        </label>
      </div>

      {type === "kids" && (
        <>
          <label className="mb-1 block text-xs font-semibold text-[color:var(--color-lumina-text-muted)]">
            Limite de lecture quotidienne (minutes, vide = illimité)
          </label>
          <input
            type="number"
            min={0}
            value={dailyLimitMinutes}
            onChange={(e) => setDailyLimitMinutes(e.target.value)}
            className="mb-4 w-full max-w-[140px] rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[#7c5cff]"
          />
        </>
      )}

      <label className="mb-1 block text-xs font-semibold text-[color:var(--color-lumina-text-muted)]">
        Code PIN {initial?.hasPin ? "(déjà activé)" : "(optionnel)"}
      </label>
      <div className="mb-4 flex items-center gap-2">
        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={pin}
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, ""));
            setRemovePin(false);
          }}
          placeholder="Ex: 1234"
          disabled={removePin}
          className="w-32 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[#7c5cff] disabled:opacity-40"
        />
        {initial?.hasPin && (
          <label className="flex items-center gap-1.5 text-xs text-[color:var(--color-lumina-text-muted)]">
            <input
              type="checkbox"
              checked={removePin}
              onChange={(e) => {
                setRemovePin(e.target.checked);
                if (e.target.checked) setPin("");
              }}
            />
            Retirer le code
          </label>
        )}
      </div>

      {error && <p className="mb-3 text-sm font-semibold text-[#ff8a8a]">{error}</p>}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          {isPending ? "..." : isEdit ? "Enregistrer" : "Créer le profil"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-bold transition hover:border-white/30"
        >
          Annuler
        </button>
        {isEdit && canDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="ml-auto rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold text-[#ff8a8a] transition hover:border-[#ff8a8a]"
          >
            Supprimer le profil
          </button>
        )}
      </div>
    </form>
  );
}
