import Link from "next/link";
import { getCurrentCustomer } from "@/lib/customerSession";

export default async function Header() {
  const customer = await getCurrentCustomer();

  return (
    <header className="sticky top-0 z-50 border-b border-navy/5 bg-white/85 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-navy">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#7c5cff] to-navy text-white shadow-[0_8px_20px_rgba(124,92,255,0.35)]">
            ✦
          </span>
          LUMINA
        </Link>
        <nav className="hidden items-center gap-9 md:flex">
          <Link href="/" className="text-sm font-semibold text-navy/75 transition hover:text-navy">
            Accueil
          </Link>
          <Link href="/#catalogue" className="text-sm font-semibold text-navy/75 transition hover:text-navy">
            Bibliothèque
          </Link>
          <Link href="/premium" className="text-sm font-semibold text-navy/75 transition hover:text-navy">
            Premium
          </Link>
          <Link href="/#avis" className="text-sm font-semibold text-navy/75 transition hover:text-navy">
            Avis Clients
          </Link>
        </nav>
        {customer ? (
          <Link
            href="/account"
            className="rounded-xl border border-gray-mid bg-white px-6 py-2.5 text-sm font-bold text-navy shadow-[0_8px_24px_rgba(8,27,69,0.1)] transition hover:-translate-y-0.5 hover:border-[#7c5cff]"
          >
            👤 Mon compte
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-semibold text-navy/75 transition hover:text-navy sm:block"
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
