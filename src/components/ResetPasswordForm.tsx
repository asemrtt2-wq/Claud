"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { resetPassword } from "@/lib/passwordReset";

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!token) {
    return (
      <div className="lumina-card w-full max-w-sm rounded-[22px] p-9 text-center">
        <h1 className="mb-3 text-2xl font-extrabold tracking-tight text-white">Lien invalide</h1>
        <p className="text-sm text-[color:var(--color-lumina-text-muted)]">
          Ce lien de réinitialisation est incomplet.{" "}
          <Link href="/forgot-password" className="font-semibold text-[#a78bfa] hover:underline">
            Demander un nouveau lien
          </Link>
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="lumina-card w-full max-w-sm rounded-[22px] p-9 text-center">
        <h1 className="mb-3 text-2xl font-extrabold tracking-tight text-white">
          Mot de passe mis à jour
        </h1>
        <p className="mb-6 text-sm text-[color:var(--color-lumina-text-muted)]">
          Tu peux maintenant te connecter avec ton nouveau mot de passe.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="w-full rounded-2xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(124,92,255,0.4)] transition hover:-translate-y-0.5"
        >
          Se connecter
        </button>
      </div>
    );
  }

  return (
    <form
      action={(formData) => startTransition(async () => {
        setError(null);
        const res = await resetPassword(token, formData);
        if ("error" in res) {
          setError(res.error);
          return;
        }
        setDone(true);
      })}
      className="lumina-card w-full max-w-sm rounded-[22px] p-9"
    >
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-white">
        Nouveau mot de passe
      </h1>
      <p className="mb-7 text-sm text-[color:var(--color-lumina-text-muted)]">
        Choisis un mot de passe d&apos;au moins 8 caractères.
      </p>

      <label className="mb-1.5 block text-sm font-semibold text-white">
        Nouveau mot de passe
      </label>
      <input
        type="password"
        name="password"
        required
        minLength={8}
        className="mb-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#7c5cff]"
      />

      {error && <p className="mb-4 text-sm font-semibold text-[#ff8a8a]">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-2xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(124,92,255,0.4)] transition hover:-translate-y-0.5 disabled:opacity-60"
      >
        {isPending ? "Enregistrement..." : "Réinitialiser le mot de passe"}
      </button>
    </form>
  );
}
