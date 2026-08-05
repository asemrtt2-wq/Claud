"use client";

import { useState } from "react";
import Link from "next/link";

export default function BuyButton({
  ebookId,
  isLoggedIn,
}: {
  ebookId: string;
  isLoggedIn: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBuy() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ebookId }),
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

  if (!isLoggedIn) {
    return (
      <Link
        href="/login"
        className="block rounded-2xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-7 py-3.5 text-center text-sm font-bold text-white shadow-[0_12px_30px_rgba(124,92,255,0.4)] transition hover:-translate-y-0.5"
      >
        Connecte-toi pour acheter
      </Link>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={handleBuy}
        disabled={loading}
        className="rounded-2xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(124,92,255,0.4)] transition hover:-translate-y-0.5 disabled:opacity-60"
      >
        {loading ? "Redirection..." : "Acheter maintenant"}
      </button>
      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
    </div>
  );
}
