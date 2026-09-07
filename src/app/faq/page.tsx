import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FaqAccordion from "@/components/FaqAccordion";
import { getPublishedFaq, groupFaq } from "@/lib/faq";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "FAQ — vos questions sur Lumia",
  description:
    "Abonnement, lecture hors ligne, profils, livres écrits sur demande : les réponses aux questions les plus fréquentes sur Lumia.",
  alternates: { canonical: absoluteUrl("/faq") },
  openGraph: {
    title: "FAQ — vos questions sur Lumia",
    description: "Les réponses aux questions les plus fréquentes sur Lumia.",
    url: absoluteUrl("/faq"),
    type: "website",
  },
};

export default async function FaqPage() {
  const items = await getPublishedFaq();
  const groups = groupFaq(items);

  /* FAQPage structured data, so search engines can show the answers directly. Built from the
     same rows the page renders — it can never advertise a question the page doesn't answer. */
  const jsonLd =
    items.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }
      : null;

  return (
    <>
      <Header />
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <main className="lumia-shell px-5 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <span className="mb-3 inline-block text-[0.8rem] font-extrabold uppercase tracking-wider text-[#a78bfa]">
            Support
          </span>
          <h1 className="mb-4 text-[1.9rem] font-extrabold leading-tight tracking-tight text-white sm:text-[2.6rem]">
            Questions fréquentes
          </h1>
          <p className="mb-12 text-base text-[color:var(--color-lumia-text-muted)] sm:text-[1.05rem]">
            Tout ce qu&apos;il faut savoir sur Lumia : l&apos;abonnement, les profils, la lecture
            et les livres écrits sur demande.
          </p>

          {items.length === 0 ? (
            <p className="lumia-card rounded-[22px] p-6 text-center text-sm text-[color:var(--color-lumia-text-muted)]">
              La FAQ arrive très bientôt.
            </p>
          ) : (
            <div className="space-y-10">
              {groups.map((group) => (
                <section key={group.category || "general"}>
                  {group.category && (
                    <h2 className="lumia-gold-text mb-4 text-sm font-extrabold uppercase tracking-wider">
                      {group.category}
                    </h2>
                  )}
                  <FaqAccordion items={group.items} />
                </section>
              ))}
            </div>
          )}

          <div className="lumia-card mt-14 rounded-[22px] p-6 text-center sm:p-8">
            <p className="mb-2 font-extrabold text-white">Tu n&apos;as pas trouvé ta réponse ?</p>
            <p className="mb-5 text-sm text-[color:var(--color-lumia-text-muted)]">
              Regarde le catalogue ou crée un compte — l&apos;essentiel de Lumia s&apos;explique
              en lisant.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/bibliotheque"
                className="rounded-2xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5"
              >
                Voir la bibliothèque
              </Link>
              <Link
                href="/premium"
                className="rounded-2xl border border-white/15 px-6 py-3 text-sm font-bold text-white transition hover:border-[#a78bfa]"
              >
                Découvrir Premium
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
