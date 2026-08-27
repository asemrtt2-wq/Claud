"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-black/[0.04] text-lg text-[#1d1d1f] transition hover:bg-black/[0.08]"
      aria-label="Retour"
    >
      ←
    </button>
  );
}
