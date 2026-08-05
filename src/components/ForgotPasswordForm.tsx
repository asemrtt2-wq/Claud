"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/passwordReset";

export default function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (sent) {
    return (
      <div className="lumina-card w-full max-w-sm rounded-[22px] p-9 text-center">
        <h1 className="mb-3 text-2xl font-extrabold tracking-tight text-white">
          Vérifie tes emails
        </h1>
        <p className="text-sm text-[color:var(--color-lumina-text-muted)]">
          Si un compte existe avec cette adresse, un lien de réinitialisation vient d&apos;être
          envoyé.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block font-semibold text-[#a78bfa] hover:underline"
        >
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form
      action={(formData) => startTransition(async () => {
        await requestPasswordReset(formData);
        setSent(true);
      })}
      className="lumina-card w-full max-w-sm rounded-[22px] p-9"
    >
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-white">
        Mot de passe oublié
      </h1>
      <p className="mb-7 text-sm text-[color:var(--color-lumina-text-muted)]">
        Indique ton email, on t&apos;envoie un lien pour en choisir un nouveau.
      </p>

      <label className="mb-1.5 block text-sm font-semibold text-white">Email</label>
      <input
        type="email"
        name="email"
        required
        className="mb-6 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#7c5cff]"
      />

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-2xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(124,92,255,0.4)] transition hover:-translate-y-0.5 disabled:opacity-60"
      >
        {isPending ? "Envoi..." : "Envoyer le lien"}
      </button>

      <p className="mt-5 text-center text-sm text-[color:var(--color-lumina-text-muted)]">
        <Link href="/login" className="font-semibold text-[#a78bfa] hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </form>
  );
}
