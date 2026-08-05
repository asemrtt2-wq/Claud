"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export default function AdminNav({ email }: { email?: string | null }) {
  return (
    <div className="border-b border-gray-mid bg-white px-6 py-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-lg font-extrabold tracking-tight text-navy">
            Admin · EBookstore
          </Link>
          <Link href="/" className="text-sm font-semibold text-text-muted hover:text-navy">
            Voir le site
          </Link>
          <Link
            href="/admin/settings"
            className="text-sm font-semibold text-text-muted hover:text-navy"
          >
            Réglages
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {email && <span className="text-sm text-text-muted">{email}</span>}
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="rounded-xl border border-gray-mid px-4 py-2 text-sm font-bold text-navy transition hover:border-royal"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
}
