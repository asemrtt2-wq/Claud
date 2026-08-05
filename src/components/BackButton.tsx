"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-lg text-white backdrop-blur-sm transition hover:bg-black/60"
      aria-label="Retour"
    >
      ←
    </button>
  );
}
