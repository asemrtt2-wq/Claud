import Link from "next/link";
import { getCurrentCustomer } from "@/lib/customerSession";

export default async function LightHeader() {
  const customer = await getCurrentCustomer();

  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-white/85 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-[#1d1d1f]">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] text-white shadow-[0_8px_20px_rgba(124,92,255,0.25)]">
            ✦
          </span>
          LUMINA
        </Link>
        <nav className="hidden items-center gap-9 md:flex">
          <Link href="/" className="text-sm font-semibold text-[#6e6e73] transition hover:text-[#1d1d1f]">
            Accueil
          </Link>
          <Link href="/bibliotheque" className="text-sm font-semibold text-[#1d1d1f] transition hover:text-[#7c5cff]">
            Bibliothèque
          </Link>
          <Link href="/premium" className="text-sm font-semibold text-[#6e6e73] transition hover:text-[#1d1d1f]">
            Premium
          </Link>
        </nav>
        {customer ? (
          <Link
            href="/profiles"
            className="rounded-xl border border-black/10 bg-black/[0.03] px-6 py-2.5 text-sm font-bold text-[#1d1d1f] transition hover:-translate-y-0.5 hover:border-[#7c5cff]/40"
          >
            👤 Mon compte
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-semibold text-[#6e6e73] transition hover:text-[#1d1d1f] sm:block"
            >
              Connexion
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-6 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(124,92,255,0.3)] transition hover:-translate-y-0.5"
            >
              ⚡ Commencer mon parcours
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
