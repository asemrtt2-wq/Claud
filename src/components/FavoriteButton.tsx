"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toggleFavorite } from "@/lib/profileActions";

export default function FavoriteButton({
  ebookId,
  slug,
  initialFavorited,
  profileId,
}: {
  ebookId: string;
  slug: string;
  initialFavorited: boolean;
  profileId: string | null;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  if (!profileId) {
    return (
      <Link
        href="/profiles"
        className="flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-bold text-white transition hover:border-[#7c5cff]"
      >
        🤍 Choisir un profil
      </Link>
    );
  }

  function handleClick() {
    setFavorited((prev) => !prev);
    startTransition(() => {
      toggleFavorite(profileId as string, ebookId, slug);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
        favorited
          ? "border-[#7c5cff] bg-[#7c5cff]/10 text-[#7c5cff]"
          : "border-white/15 text-white hover:border-[#7c5cff]"
      }`}
    >
      <span>{favorited ? "❤️" : "🤍"}</span>
      {favorited ? "Dans tes favoris" : "Ajouter aux favoris"}
    </button>
  );
}
