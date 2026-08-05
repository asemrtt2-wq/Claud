import Link from "next/link";
import { getCurrentCustomer } from "@/lib/customerSession";

export default async function Header() {
  const customer = await getCurrentCustomer();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0918]/85 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] text-white shadow-[0_8px_20px_rgba(124,92,255,0.35)]">
            ✦
          </span>
          LUMINA
        </Link>
        <nav className="hidden items-center gap-9 md:flex">
          <Link href="/" className="text-sm font-semibold text-white/70 transition hover:text-white">
            Accueil
          </Link>
          <Link href="/#catalogue" className="text-sm font-semibold text-white/70 transition hover:text-white">
            Bibliothèque
          </Link>
          <Link href="/premium" className="text-sm font-semibold text-white/70 transition hover:text-white">
            Premium
          </Link>
          <Link href="/#avis" className="text-sm font-semibold text-white/70 transition hover:text-white">
            Avis Clients
          </Link>
        </nav>
        {customer ? (
          <Link
            href="/profiles"
            className="rounded-xl border border-white/15 bg-white/5 px-6 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:border-[#a78bfa]"
          >
            👤 Mon compte
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-semibold text-white/70 transition hover:text-white sm:block"
            >
              Connexion
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-6 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(124,92,255,0.35)] transition hover:-translate-y-0.5"
            >
              Commencer gratuitement
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
