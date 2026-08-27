"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toggleFavorite } from "@/lib/profileActions";

export default function FavoriteButton({
  ebookId,
  slug,
  initialFavorited,
  profileId,
  light = false,
}: {
  ebookId: string;
  slug: string;
  initialFavorited: boolean;
  profileId: string | null;
  light?: boolean;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();
  const [popping, setPopping] = useState(false);

  const border = light ? "border-black/10" : "border-white/15";
  const text = light ? "text-[#1d1d1f]" : "text-white";

  if (!profileId) {
    return (
      <Link
        href="/profiles"
        className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition hover:border-[#7c5cff] ${border} ${text}`}
      >
        🤍 Choisir un profil
      </Link>
    );
  }

  function handleClick() {
    setFavorited((prev) => !prev);
    setPopping(true);
    startTransition(() => {
      toggleFavorite(profileId as string, ebookId, slug);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
        favorited ? `border-[#7c5cff] bg-[#7c5cff]/10 text-[#7c5cff]` : `${border} ${text} hover:border-[#7c5cff]`
      }`}
    >
      <span className={popping ? "heart-pop" : ""} onAnimationEnd={() => setPopping(false)}>
        {favorited ? "❤️" : "🤍"}
      </span>
      {favorited ? "Dans tes favoris" : "Ajouter aux favoris"}
    </button>
  );
}
