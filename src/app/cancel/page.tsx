import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CancelPage() {
  return (
    <>
      <Header />
      <section className="lumina-shell px-6 py-28 text-center">
        <div className="mx-auto max-w-xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-3xl">
            ✕
          </div>
          <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-white">
            Paiement annulé
          </h1>
          <p className="mb-8 text-[color:var(--color-lumina-text-muted)]">
            Ta commande n&apos;a pas été finalisée. Aucun montant n&apos;a été débité.
          </p>
          <Link
            href="/#catalogue"
            className="inline-block rounded-2xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(124,92,255,0.4)] transition hover:-translate-y-0.5"
          >
            Retour au catalogue
          </Link>
        </div>
      </section>
      <Footer />
    </>
  );
}
