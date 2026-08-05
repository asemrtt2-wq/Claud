"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { profileGradient } from "@/lib/profileColors";
import { verifyProfilePin } from "@/lib/profileActions";

export default function PinGate({
  profileId,
  name,
  avatarEmoji,
  color,
}: {
  profileId: string;
  name: string;
  avatarEmoji: string;
  color: string;
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await verifyProfilePin(profileId, pin);
      if (result.success) {
        router.refresh();
      } else {
        setError(true);
        setPin("");
      }
    });
  }

  return (
    <div className="lumina-shell flex min-h-screen items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="lumina-card w-full max-w-xs rounded-[26px] p-6 text-center">
        <span
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
          style={{ background: profileGradient(color) }}
        >
          {avatarEmoji}
        </span>
        <p className="mb-4 text-sm font-bold text-white">Code PIN de {name}</p>
        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          autoFocus
          value={pin}
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, ""));
            setError(false);
          }}
          className="mb-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-center text-lg tracking-[0.5em] text-white outline-none focus:border-[#7c5cff]"
        />
        {error && <p className="mb-3 text-xs font-semibold text-[#ff8a8a]">Code incorrect.</p>}
        <div className="flex justify-center gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            Déverrouiller
          </button>
          <Link
            href="/profiles"
            className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-bold text-white"
          >
            Retour
          </Link>
        </div>
      </form>
    </div>
  );
}
