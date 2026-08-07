"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export default function AdminNav({ email }: { email?: string | null }) {
  return (
    <div className="border-b border-white/10 bg-white/[0.04] px-6 py-4 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] text-white">
              ✦
            </span>
            Admin
          </Link>
          <Link
            href="/"
            className="text-sm font-semibold text-[color:var(--color-lumina-text-muted)] transition hover:text-white"
          >
            Voir le site
          </Link>
          <Link
            href="/admin#adultes"
            className="text-sm font-semibold text-[color:var(--color-lumina-text-muted)] transition hover:text-white"
          >
            📚 Catalogue Adultes
          </Link>
          <Link
            href="/admin#enfants"
            className="text-sm font-semibold text-[color:var(--color-lumina-text-muted)] transition hover:text-white"
          >
            🧒 Catalogue Enfants
          </Link>
          <Link
            href="/admin/catalogs"
            className="text-sm font-semibold text-[color:var(--color-lumina-text-muted)] transition hover:text-white"
          >
            🗂️ Catalogues
          </Link>
          <Link
            href="/admin/settings"
            className="text-sm font-semibold text-[color:var(--color-lumina-text-muted)] transition hover:text-white"
          >
            ⚙️ Réglages
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {email && (
            <span className="text-sm text-[color:var(--color-lumina-text-muted)]">{email}</span>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="rounded-xl border border-white/15 px-4 py-2 text-sm font-bold text-white transition hover:border-[#a78bfa]"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
}
