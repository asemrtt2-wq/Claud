"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Une erreur est survenue.");
      setLoading(false);
      return;
    }

    const signInRes = await signIn("customer-credentials", {
      email,
      password,
      redirect: false,
    });

    if (signInRes?.error) {
      setError("Compte créé, mais la connexion a échoué. Essaie de te connecter.");
      setLoading(false);
      return;
    }

    router.push("/account");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="lumina-card w-full max-w-sm rounded-[22px] p-9"
    >
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-white">
        Créer un compte
      </h1>
      <p className="mb-7 text-sm text-[color:var(--color-lumina-text-muted)]">
        Rejoins Lumina pour lire, sauvegarder tes favoris et t&apos;abonner à Premium.
      </p>

      <label className="mb-1.5 block text-sm font-semibold text-white">Nom</label>
      <input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mb-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#7c5cff]"
      />

      <label className="mb-1.5 block text-sm font-semibold text-white">Email</label>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#7c5cff]"
      />

      <label className="mb-1.5 block text-sm font-semibold text-white">
        Mot de passe
      </label>
      <input
        type="password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-6 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#7c5cff]"
      />

      {error && <p className="mb-4 text-sm font-semibold text-[#ff8a8a]">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(124,92,255,0.4)] transition hover:-translate-y-0.5 disabled:opacity-60"
      >
        {loading ? "Création..." : "Créer mon compte"}
      </button>

      <p className="mt-5 text-center text-sm text-[color:var(--color-lumina-text-muted)]">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-semibold text-[#a78bfa] hover:underline">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
