import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customerSession";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SubscribeButton from "@/components/SubscribeButton";
import { MONTHLY_REQUEST_QUOTA } from "@/lib/bookRequests";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Premium — lecture illimitée et livres écrits sur demande",
  description:
    "Ouvrez tout le catalogue Lumia avec Premium : lecture illimitée sur tous vos profils, et des livres écrits sur demande chaque mois. Mensuel ou annuel, sans engagement.",
  alternates: { canonical: absoluteUrl("/premium") },
  openGraph: {
    title: "Premium — lecture illimitée et livres écrits sur demande",
    description: "Lecture illimitée sur tous vos profils et des livres écrits sur demande.",
    url: absoluteUrl("/premium"),
    type: "website",
  },
};

/**
 * The three plans, each with the advantages it actually has.
 *
 * Everything listed here is a real, shipped capability — the book-request quotas come
 * straight from MONTHLY_REQUEST_QUOTA, and the catalog size is counted from the database
 * rather than written into the copy, so the page can't drift from the product.
 */
export default async function PremiumPage() {
  const customer = await getCurrentCustomer();
  const isLoggedIn = Boolean(customer);

  const [bookCount, subscription] = await Promise.all([
    prisma.eBook.count({ where: { audience: "adults" } }),
    customer
      ? prisma.subscription.findUnique({ where: { customerId: customer.id } })
      : Promise.resolve(null),
  ]);
  const currentPlan = subscription?.status === "active" ? subscription.plan : null;

  const monthlyPrice = 9.99;
  const yearlyPrice = 79;
  const yearlySaving = Math.round(100 - (yearlyPrice / (monthlyPrice * 12)) * 100);

  return (
    <>
      <Header />
      <section className="lumia-shell px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <span className="mb-3.5 inline-block text-[0.82rem] font-extrabold uppercase tracking-wider text-[#a78bfa]">
              Nos offres
            </span>
            <h1 className="mb-4 text-[2rem] font-extrabold tracking-tight text-white md:text-[2.75rem]">
              Choisis comment tu veux lire
            </h1>
            <p className="mx-auto mb-16 max-w-2xl text-[1.05rem] text-[color:var(--color-lumia-text-muted)]">
              {`Achète un iBook à l'unité, ou passe en Premium pour ouvrir les ${bookCount} livres du catalogue — et faire écrire ceux qui te manquent.`}
            </p>
          </div>

          <div className="grid items-start gap-7 md:grid-cols-3">
            <PlanCard
              name="Gratuit"
              price="0 €"
              period="pour toujours"
              features={[
                "Créer un compte et des profils",
                "Un extrait gratuit de chaque livre",
                "Favoris, collections et notes de lecture",
                "Noter et commenter les livres",
              ]}
              cta={
                <Link
                  href={isLoggedIn ? "/profiles" : "/signup"}
                  className="block rounded-2xl border border-white/15 px-7 py-3.5 text-center text-sm font-bold text-white transition hover:border-[#7c5cff]"
                >
                  {isLoggedIn ? "Mon compte" : "Créer un compte"}
                </Link>
              }
            />

            <PlanCard
              name="Premium mensuel"
              price={`${monthlyPrice.toFixed(2).replace(".", ",")} €`}
              period="par mois"
              highlight
              current={currentPlan === "monthly"}
              features={[
                `Les ${bookCount} livres du catalogue, sans limite`,
                "Tous tes profils, sur tous tes appareils",
                `${MONTHLY_REQUEST_QUOTA.monthly} livres écrits sur demande / mois`,
                "Les nouveautés dès leur parution",
                "Résiliable à tout moment",
              ]}
              cta={
                currentPlan === "monthly" ? (
                  <p className="rounded-2xl border border-[#7c5cff] px-7 py-3.5 text-center text-sm font-bold text-[#c9bdff]">
                    ✓ Ton offre actuelle
                  </p>
                ) : (
                  <SubscribeButton plan="monthly" isLoggedIn={isLoggedIn} label="S'abonner" />
                )
              }
            />

            <PlanCard
              name="Premium annuel"
              price={`${yearlyPrice} €`}
              period={`par an — soit ${(yearlyPrice / 12).toFixed(2).replace(".", ",")} € / mois`}
              badge={`-${yearlySaving}%`}
              current={currentPlan === "yearly"}
              features={[
                "Tout le Premium mensuel",
                `${MONTHLY_REQUEST_QUOTA.yearly} livres écrits sur demande / mois`,
                `${Math.round(monthlyPrice * 12 - yearlyPrice)} € économisés sur l'année`,
                "Un seul paiement par an",
                "Résiliable à tout moment",
              ]}
              cta={
                currentPlan === "yearly" ? (
                  <p className="rounded-2xl border border-[#7c5cff] px-7 py-3.5 text-center text-sm font-bold text-[#c9bdff]">
                    ✓ Ton offre actuelle
                  </p>
                ) : (
                  <SubscribeButton
                    plan="yearly"
                    isLoggedIn={isLoggedIn}
                    label="S'abonner à l'année"
                  />
                )
              }
            />
          </div>

          {/* The book-request feature is the reason the two Premium plans now differ, so it
              gets an explanation rather than just a line in the feature list. */}
          <div className="lumia-card-premium mt-14 rounded-[22px] p-8">
            <h2 className="lumia-gold-text mb-2 text-lg font-extrabold">
              ✨ Fais écrire le livre qui te manque
            </h2>
            <p className="mb-6 max-w-2xl text-sm leading-relaxed text-[color:var(--color-lumia-text-muted)]">
              Décris le livre que tu cherches depuis ton profil. Lumia l&apos;écrit avec Claude,
              chapitre par chapitre, et le publie dans ton catalogue. Si un livre proche existe
              déjà, on te l&apos;indique au lieu d&apos;en écrire un deuxième — et la demande
              n&apos;est pas décomptée.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-2xl font-extrabold text-white">
                  {MONTHLY_REQUEST_QUOTA.monthly}
                </p>
                <p className="text-sm text-[color:var(--color-lumia-text-muted)]">
                  livres par mois avec l&apos;offre mensuelle
                </p>
              </div>
              <div className="rounded-2xl border border-[#7c5cff]/30 bg-[#7c5cff]/10 p-5">
                <p className="text-2xl font-extrabold text-white">{MONTHLY_REQUEST_QUOTA.yearly}</p>
                <p className="text-sm text-[color:var(--color-lumia-text-muted)]">
                  livres par mois avec l&apos;offre annuelle
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

function PlanCard({
  name,
  price,
  period,
  features,
  cta,
  highlight = false,
  badge,
  current = false,
}: {
  name: string;
  price: string;
  period: string;
  features: string[];
  cta: React.ReactNode;
  highlight?: boolean;
  badge?: string;
  current?: boolean;
}) {
  return (
    <div
      className={`lumia-card flex h-full flex-col rounded-[22px] p-8 text-left transition ${
        highlight || current
          ? "border-2 border-[#7c5cff] shadow-[0_20px_60px_rgba(124,92,255,0.25)] md:-translate-y-3"
          : "hover:-translate-y-1"
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span
          className={`text-xs font-extrabold uppercase tracking-wider ${
            highlight ? "text-[#a78bfa]" : "text-[color:var(--color-lumia-text-muted)]"
          }`}
        >
          {name}
        </span>
        {badge && (
          <span className="rounded-full bg-gradient-to-br from-[#ff3b3b] to-[#c9192a] px-2.5 py-1 text-[0.68rem] font-extrabold text-white">
            {badge}
          </span>
        )}
        {/* Not "le plus choisi": nothing here counts which plan people actually pick, and
            this codebase doesn't print numbers it can't back up. "Sans engagement" is a
            real property of the monthly plan. */}
        {highlight && !badge && (
          <span className="rounded-full bg-[#7c5cff] px-2.5 py-1 text-[0.68rem] font-extrabold text-white">
            Sans engagement
          </span>
        )}
      </div>
      <div className="text-4xl font-extrabold text-white">{price}</div>
      <p className="mb-6 mt-1 text-sm text-[color:var(--color-lumia-text-muted)]">{period}</p>
      <ul className="mb-8 flex flex-1 flex-col gap-3 text-sm text-[color:var(--color-lumia-text-muted)]">
        {features.map((feature) => (
          <li key={feature} className="flex gap-2.5">
            <span className="text-[#7c5cff]">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      {cta}
    </div>
  );
}
