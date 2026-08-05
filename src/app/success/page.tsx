import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const order = session_id
    ? await prisma.order.findUnique({
        where: { stripeSessionId: session_id },
        include: { ebook: true },
      })
    : null;

  return (
    <>
      <Header />
      <section className="lumina-shell px-6 py-28 text-center">
        <div className="mx-auto max-w-xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#7ee0a8]/15 text-3xl">
          ✅
        </div>
        <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-white">
          Merci pour ton achat !
        </h1>
        {order ? (
          <p className="mb-8 text-[color:var(--color-lumina-text-muted)]">
            <strong className="text-white">{order.ebook.title}</strong> a bien été
            commandé. Un email de confirmation a été envoyé à{" "}
            <strong className="text-white">{order.customerEmail}</strong> avec le
            lien de téléchargement.
          </p>
        ) : (
          <p className="mb-8 text-[color:var(--color-lumina-text-muted)]">
            Ta commande a bien été enregistrée. Tu recevras ton eBook par email
            sous peu.
          </p>
        )}
        <Link
          href="/"
          className="inline-block rounded-2xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(124,92,255,0.4)] transition hover:-translate-y-0.5"
        >
          Retour à l&apos;accueil
        </Link>
        </div>
      </section>
      <Footer />
    </>
  );
}
