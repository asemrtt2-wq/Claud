import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CancelPage() {
  return (
    <>
      <Header />
      <section className="mx-auto max-w-xl px-6 py-28 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-mid text-3xl">
          ✕
        </div>
        <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-navy">
          Paiement annulé
        </h1>
        <p className="mb-8 text-text-muted">
          Ta commande n&apos;a pas été finalisée. Aucun montant n&apos;a été débité.
        </p>
        <Link
          href="/#catalogue"
          className="inline-block rounded-2xl bg-gradient-to-br from-royal to-[#3a6bff] px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(30,91,255,0.4)] transition hover:-translate-y-0.5"
        >
          Retour au catalogue
        </Link>
      </section>
      <Footer />
    </>
  );
}
