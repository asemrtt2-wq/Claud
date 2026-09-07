import Link from "next/link";
import LogoMark from "@/components/Logo";

export default function Footer() {
  return (
    <footer id="contact" className="bg-navy-dark px-6 py-16 text-[#c3cee8]">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-10 border-b border-white/10 pb-10">
          <div>
            <Link href="/" className="flex items-center gap-2.5 text-xl font-extrabold text-white">
              <LogoMark className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#7c5cff] to-navy text-white shadow-[0_8px_20px_rgba(124,92,255,0.35)]" />
              LUMIA
            </Link>
            <p className="lumia-gold-text mt-2 text-sm font-semibold">
              Lis. Apprends. Transforme-toi.
            </p>
          </div>
          <div className="flex flex-wrap gap-10 sm:gap-14">
            <div>
              <h5 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-white">
                Réseaux
              </h5>
              <ul className="flex flex-col gap-0.5 text-sm">
                <li>
                  <a href="#" className="-mx-2 inline-block rounded-lg px-2 py-2 text-[#a9b6d6] transition hover:bg-white/5 hover:text-white">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="-mx-2 inline-block rounded-lg px-2 py-2 text-[#a9b6d6] transition hover:bg-white/5 hover:text-white">
                    TikTok
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-white">
                Support
              </h5>
              <ul className="flex flex-col gap-0.5 text-sm">
                <li>
                  <Link href="/faq" className="-mx-2 inline-block rounded-lg px-2 py-2 text-[#a9b6d6] transition hover:bg-white/5 hover:text-white">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/bibliotheque" className="-mx-2 inline-block rounded-lg px-2 py-2 text-[#a9b6d6] transition hover:bg-white/5 hover:text-white">
                    Bibliothèque
                  </Link>
                </li>
                <li>
                  <Link href="/premium" className="-mx-2 inline-block rounded-lg px-2 py-2 text-[#a9b6d6] transition hover:bg-white/5 hover:text-white">
                    Premium
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-white">
                Légal
              </h5>
              <ul className="flex flex-col gap-0.5 text-sm">
                <li>
                  <a href="#" className="-mx-2 inline-block rounded-lg px-2 py-2 text-[#a9b6d6] transition hover:bg-white/5 hover:text-white">
                    Mentions légales
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <p className="pt-7 text-center text-sm text-[#7c88ab]">
          © 2026 Lumia. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
