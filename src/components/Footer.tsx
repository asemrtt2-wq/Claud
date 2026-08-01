import Link from "next/link";

export default function Footer() {
  return (
    <footer id="contact" className="bg-navy-dark px-6 py-16 text-[#c3cee8]">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-10 border-b border-white/10 pb-10">
          <Link href="/" className="flex items-center gap-2.5 text-xl font-extrabold text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-royal to-navy text-white shadow-[0_8px_20px_rgba(30,91,255,0.35)]">
              E
            </span>
            EBookstore
          </Link>
          <div className="flex flex-wrap gap-14">
            <div>
              <h5 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-white">
                Réseaux
              </h5>
              <ul className="flex flex-col gap-2.5 text-sm">
                <li>
                  <a href="#" className="text-[#a9b6d6] transition hover:text-white">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[#a9b6d6] transition hover:text-white">
                    TikTok
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-white">
                Support
              </h5>
              <ul className="flex flex-col gap-2.5 text-sm">
                <li>
                  <a href="#" className="text-[#a9b6d6] transition hover:text-white">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[#a9b6d6] transition hover:text-white">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-white">
                Légal
              </h5>
              <ul className="flex flex-col gap-2.5 text-sm">
                <li>
                  <a href="#" className="text-[#a9b6d6] transition hover:text-white">
                    Mentions légales
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <p className="pt-7 text-center text-sm text-[#7c88ab]">
          © 2026 EBookstore. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
