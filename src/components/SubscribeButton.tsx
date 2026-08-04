"use client";

import { useState } from "react";
import Link from "next/link";

export default function SubscribeButton({
  plan,
  isLoggedIn,
  label,
}: {
  plan: "monthly" | "yearly";
  isLoggedIn: boolean;
  label: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
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
        className="block rounded-2xl bg-gradient-to-br from-royal to-[#3a6bff] px-7 py-3.5 text-center text-sm font-bold text-white shadow-[0_12px_30px_rgba(30,91,255,0.4)] transition hover:-translate-y-0.5"
      >
        Connecte-toi pour t&apos;abonner
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="w-full rounded-2xl bg-gradient-to-br from-royal to-[#3a6bff] px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(30,91,255,0.4)] transition hover:-translate-y-0.5 disabled:opacity-60"
      >
        {loading ? "Redirection..." : label}
      </button>
      {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
    </div>
  );
}
