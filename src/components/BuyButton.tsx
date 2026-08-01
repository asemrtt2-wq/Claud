"use client";

import { useState } from "react";

export default function BuyButton({ ebookId }: { ebookId: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBuy(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ebookId, email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue.");
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Impossible de contacter le serveur.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleBuy} className="flex flex-col gap-3">
      <input
        type="email"
        required
        placeholder="Ton adresse email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-xl border border-gray-mid px-4 py-3 text-sm text-navy outline-none focus:border-royal"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-2xl bg-gradient-to-br from-royal to-[#3a6bff] px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(30,91,255,0.4)] transition hover:-translate-y-0.5 disabled:opacity-60"
      >
        {loading ? "Redirection..." : "Acheter maintenant"}
      </button>
      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
    </form>
  );
}
