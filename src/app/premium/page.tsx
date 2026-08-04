import Link from "next/link";
import { getCurrentCustomer } from "@/lib/customerSession";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SubscribeButton from "@/components/SubscribeButton";

export default async function PremiumPage() {
  const customer = await getCurrentCustomer();
  const isLoggedIn = Boolean(customer);

  return (
    <>
      <Header />
      <section className="lumina-shell px-6 py-24">
        <div className="mx-auto max-w-5xl text-center">
          <span className="mb-3.5 inline-block text-[0.82rem] font-extrabold uppercase tracking-wider text-[#a78bfa]">
            Nos offres
          </span>
          <h1 className="mb-4 text-[2rem] font-extrabold tracking-tight text-white md:text-[2.75rem]">
            Choisis comment tu veux lire
          </h1>
          <p className="mx-auto mb-16 max-w-xl text-[1.05rem] text-[color:var(--color-lumina-text-muted)]">
            Achète un eBook à l&apos;unité ou passe à Premium pour un accès illimité à
            toute la bibliothèque.
          </p>

          <div className="grid gap-7 md:grid-cols-3">
            <div className="lumina-card flex flex-col rounded-[22px] p-8 text-left">
              <span className="mb-2 text-xs font-extrabold uppercase tracking-wider text-[color:var(--color-lumina-text-muted)]">
                Gratuit
              </span>
              <div className="mb-6 text-4xl font-extrabold text-white">0 €</div>
              <ul className="mb-8 flex flex-1 flex-col gap-3 text-sm text-[color:var(--color-lumina-text-muted)]">
                <li>✅ Créer un compte</li>
                <li>✅ Aperçu gratuit de chaque eBook</li>
                <li>✅ Ajouter des favoris</li>
              </ul>
              <Link
                href={isLoggedIn ? "/account" : "/signup"}
                className="rounded-2xl border border-white/15 px-7 py-3.5 text-center text-sm font-bold text-white transition hover:border-[#7c5cff]"
              >
                {isLoggedIn ? "Mon compte" : "Créer un compte"}
              </Link>
            </div>

            <div className="lumina-card flex flex-col rounded-[22px] border-2 border-[#7c5cff] p-8 text-left shadow-[0_20px_60px_rgba(124,92,255,0.25)]">
              <span className="mb-2 text-xs font-extrabold uppercase tracking-wider text-[#a78bfa]">
                Premium mensuel
              </span>
              <div className="mb-1 text-4xl font-extrabold text-white">9,99 €</div>
              <p className="mb-6 text-sm text-[color:var(--color-lumina-text-muted)]">par mois</p>
              <ul className="mb-8 flex flex-1 flex-col gap-3 text-sm text-[color:var(--color-lumina-text-muted)]">
                <li>✅ Accès illimité à toute la bibliothèque</li>
                <li>✅ Nouveaux eBooks chaque semaine</li>
                <li>✅ Lecture sur tous tes appareils</li>
                <li>✅ Résiliable à tout moment</li>
              </ul>
              <SubscribeButton plan="monthly" isLoggedIn={isLoggedIn} label="S'abonner" />
            </div>

            <div className="lumina-card flex flex-col rounded-[22px] p-8 text-left">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[color:var(--color-lumina-text-muted)]">
                  Premium annuel
                </span>
                <span className="rounded-full bg-gradient-to-br from-[#ff3b3b] to-[#c9192a] px-2.5 py-1 text-[0.68rem] font-extrabold text-white">
                  -30%
                </span>
              </div>
              <div className="mb-1 text-4xl font-extrabold text-white">79 €</div>
              <p className="mb-6 text-sm text-[color:var(--color-lumina-text-muted)]">par an</p>
              <ul className="mb-8 flex flex-1 flex-col gap-3 text-sm text-[color:var(--color-lumina-text-muted)]">
                <li>✅ Tous les avantages Premium</li>
                <li>✅ Économise 30% sur l&apos;année</li>
                <li>✅ Résiliable à tout moment</li>
              </ul>
              <SubscribeButton plan="yearly" isLoggedIn={isLoggedIn} label="S'abonner à l'année" />
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
