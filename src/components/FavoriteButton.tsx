"use client";

import { useState, useTransition } from "react";
import { toggleFavorite } from "@/lib/customerActions";

export default function FavoriteButton({
  ebookId,
  slug,
  initialFavorited,
  isLoggedIn,
}: {
  ebookId: string;
  slug: string;
  initialFavorited: boolean;
  isLoggedIn: boolean;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  if (!isLoggedIn) return null;

  function handleClick() {
    setFavorited((prev) => !prev);
    startTransition(() => {
      toggleFavorite(ebookId, slug);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
        favorited
          ? "border-royal bg-royal/10 text-royal"
          : "border-gray-mid text-navy hover:border-royal"
      }`}
    >
      <span>{favorited ? "❤️" : "🤍"}</span>
      {favorited ? "Dans tes favoris" : "Ajouter aux favoris"}
    </button>
  );
}
