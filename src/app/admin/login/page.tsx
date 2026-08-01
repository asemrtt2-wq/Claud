"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

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

    const res = await signIn("credentials", {
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
    <div className="flex min-h-screen items-center justify-center bg-gray-light px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-[22px] border border-gray-mid bg-white p-9 shadow-soft"
      >
        <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-navy">
          Espace admin
        </h1>
        <p className="mb-7 text-sm text-text-muted">
          Connecte-toi pour gérer le catalogue d&apos;eBooks.
        </p>

        <label className="mb-1.5 block text-sm font-semibold text-navy">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-xl border border-gray-mid px-4 py-3 text-sm outline-none focus:border-royal"
        />

        <label className="mb-1.5 block text-sm font-semibold text-navy">
          Mot de passe
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 w-full rounded-xl border border-gray-mid px-4 py-3 text-sm outline-none focus:border-royal"
        />

        {error && <p className="mb-4 text-sm font-semibold text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-gradient-to-br from-royal to-[#3a6bff] px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(30,91,255,0.4)] transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
