import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customerSession";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EBookCard from "@/components/EBookCard";
import SignOutButton from "@/components/SignOutButton";

export default async function AccountPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/login");

  const [subscription, favorites, progress] = await Promise.all([
    prisma.subscription.findUnique({ where: { customerId: customer.id } }),
    prisma.favorite.findMany({
      where: { customerId: customer.id },
      include: { ebook: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.readingProgress.findMany({
      where: { customerId: customer.id },
      include: { ebook: true },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
  ]);

  return (
    <>
      <Header />
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-navy">
                Bonjour, {customer.name}
              </h1>
              <p className="text-sm text-text-muted">{customer.email}</p>
            </div>
            <SignOutButton />
          </div>

          <div className="mb-12 rounded-[22px] border border-gray-mid bg-white p-6 shadow-soft">
            <h2 className="mb-3 text-lg font-extrabold text-navy">Abonnement</h2>
            {subscription?.status === "active" ? (
              <p className="text-sm text-text-muted">
                ✅ Premium actif ({subscription.plan === "yearly" ? "annuel" : "mensuel"}) —
                accès illimité à toute la bibliothèque.
              </p>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-text-muted">
                  Tu n&apos;as pas encore d&apos;abonnement Premium.
                </p>
                <Link
                  href="/premium"
                  className="rounded-xl bg-gradient-to-br from-royal to-[#3a6bff] px-5 py-2.5 text-sm font-bold text-white shadow-[0_12px_24px_rgba(30,91,255,0.35)] transition hover:-translate-y-0.5"
                >
                  Découvrir Premium
                </Link>
              </div>
            )}
          </div>

          {progress.length > 0 && (
            <div className="mb-12">
              <h2 className="mb-5 text-lg font-extrabold text-navy">Reprendre la lecture</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {progress.map((p) => (
                  <Link
                    key={p.id}
                    href={`/read/${p.ebook.slug}`}
                    className={`cover-theme-${p.ebook.coverTheme} flex flex-col justify-between rounded-2xl p-5 text-white shadow-soft transition hover:-translate-y-1`}
                  >
                    <span className="text-2xl">{p.ebook.coverEmoji}</span>
                    <div>
                      <p className="font-bold">{p.ebook.title}</p>
                      <p className="text-xs text-white/70">Page {p.page + 1}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="mb-5 text-lg font-extrabold text-navy">Mes favoris</h2>
            {favorites.length === 0 ? (
              <p className="text-sm text-text-muted">
                Tu n&apos;as pas encore de favoris.{" "}
                <Link href="/#catalogue" className="font-semibold text-royal hover:underline">
                  Explorer le catalogue
                </Link>
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
                {favorites.map((f) => (
                  <EBookCard
                    key={f.id}
                    slug={f.ebook.slug}
                    title={f.ebook.title}
                    category={f.ebook.category}
                    coverEmoji={f.ebook.coverEmoji}
                    coverTheme={f.ebook.coverTheme}
                    price={f.ebook.price}
                    oldPrice={f.ebook.oldPrice}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
