"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-xl border border-white/20 px-4 py-2 text-sm font-bold text-white transition hover:border-[#a78bfa]"
    >
      Déconnexion
    </button>
  );
}
