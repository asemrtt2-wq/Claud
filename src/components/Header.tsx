import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-navy/5 bg-white/85 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-navy">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-royal to-navy text-white shadow-[0_8px_20px_rgba(30,91,255,0.35)]">
            E
          </span>
          EBookstore
        </Link>
        <nav className="hidden items-center gap-9 md:flex">
          <Link href="/" className="text-sm font-semibold text-navy/75 transition hover:text-navy">
            Accueil
          </Link>
          <Link href="/#catalogue" className="text-sm font-semibold text-navy/75 transition hover:text-navy">
            Nos eBooks
          </Link>
          <Link href="/#avis" className="text-sm font-semibold text-navy/75 transition hover:text-navy">
            Avis Clients
          </Link>
          <Link href="/#contact" className="text-sm font-semibold text-navy/75 transition hover:text-navy">
            Contact
          </Link>
        </nav>
        <Link
          href="/#catalogue"
          className="rounded-xl border border-gray-mid bg-white px-6 py-2.5 text-sm font-bold text-navy shadow-[0_8px_24px_rgba(8,27,69,0.1)] transition hover:-translate-y-0.5 hover:border-royal"
        >
          Nos eBooks
        </Link>
      </div>
    </header>
  );
}
