"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import LogoMark from "@/components/Logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("admin-credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="lumina-shell flex min-h-screen items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="lumina-card w-full max-w-sm rounded-[22px] p-9 shadow-strong"
      >
        <div className="mb-6 flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-white">
          <LogoMark className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] text-white" />
          Espace admin
        </div>
        <p className="mb-7 text-sm text-[color:var(--color-lumina-text-muted)]">
          Connecte-toi pour gérer le catalogue d&apos;eBooks.
        </p>

        <label className="mb-1.5 block text-sm font-semibold text-white">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#a78bfa]"
        />

        <label className="mb-1.5 block text-sm font-semibold text-white">
          Mot de passe
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#a78bfa]"
        />

        {error && <p className="mb-4 text-sm font-semibold text-[#ff8a8a]">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(124,92,255,0.4)] transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
