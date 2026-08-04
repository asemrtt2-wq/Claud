"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-xl border border-gray-mid px-4 py-2 text-sm font-bold text-navy transition hover:border-royal"
    >
      Déconnexion
    </button>
  );
}
