import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminNav from "@/components/AdminNav";
import DeleteEbookButton from "@/components/DeleteEbookButton";
import { importRealBooks } from "@/lib/actions";

// The "Importer mes livres" action upserts dozens of real books at once — give it more
// than the default serverless timeout so it doesn't silently fail on a slow connection.
export const maxDuration = 60;

function EbookTable({ ebooks }: { ebooks: Awaited<ReturnType<typeof prisma.eBook.findMany>> }) {
  return (
    <div className="lumina-card overflow-hidden rounded-2xl">
      <table className="w-full text-left text-sm">
        <thead className="text-xs font-bold uppercase tracking-wide text-[color:var(--color-lumina-text-muted)]">
          <tr>
            <th className="px-5 py-3">Titre</th>
            <th className="px-5 py-3">Catégorie</th>
            <th className="px-5 py-3">Prix</th>
            <th className="px-5 py-3">Vedette</th>
            <th className="px-5 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {ebooks.map((ebook) => (
            <tr key={ebook.id} className="border-t border-white/10">
              <td className="px-5 py-3 font-semibold text-white">
                {ebook.coverEmoji} {ebook.title}
              </td>
              <td className="px-5 py-3 text-[color:var(--color-lumina-text-muted)]">
                {ebook.category}
              </td>
              <td className="px-5 py-3 text-white">{ebook.price} €</td>
              <td className="px-5 py-3">{ebook.featured ? "✅" : "—"}</td>
              <td className="px-5 py-3 text-right">
                <div className="flex justify-end gap-3">
                  <Link
                    href={`/admin/ebooks/${ebook.id}/edit`}
                    className="font-semibold text-[#a78bfa] hover:underline"
                  >
                    Modifier
                  </Link>
                  <DeleteEbookButton id={ebook.id} title={ebook.title} />
                </div>
              </td>
            </tr>
          ))}
          {ebooks.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="px-5 py-8 text-center text-[color:var(--color-lumina-text-muted)]"
              >
                Aucun eBook pour le moment.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  const [ebooks, orderCount, paidOrders] = await Promise.all([
    prisma.eBook.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "paid" } }),
  ]);
  const adultEbooks = ebooks.filter((e) => e.audience !== "kids");
  const kidsEbooks = ebooks.filter((e) => e.audience === "kids");

  return (
    <div className="lumina-shell">
      <AdminNav email={session?.user?.email} />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <form
          action={importRealBooks}
          className="lumina-card mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5"
        >
          <div>
            <p className="font-extrabold text-white">📚 Importer mes livres</p>
            <p className="text-sm text-[color:var(--color-lumina-text-muted)]">
              Ajoute ou met à jour d&apos;un coup tous les livres réels préparés dans le code
              (couvertures + contenu déjà extraits). Sans risque à relancer plusieurs fois.
            </p>
          </div>
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-5 py-2.5 text-sm font-bold text-white shadow-[0_12px_24px_rgba(124,92,255,0.35)] transition hover:-translate-y-0.5"
          >
            Importer maintenant
          </button>
        </form>

        <div className="mb-8 grid grid-cols-2 gap-5 sm:grid-cols-4">
          <div className="lumina-card rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-[color:var(--color-lumina-text-muted)]">
              Adultes
            </p>
            <p className="text-2xl font-extrabold text-white">{adultEbooks.length}</p>
          </div>
          <div className="lumina-card rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-[color:var(--color-lumina-text-muted)]">
              Enfants
            </p>
            <p className="text-2xl font-extrabold text-white">{kidsEbooks.length}</p>
          </div>
          <div className="lumina-card rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-[color:var(--color-lumina-text-muted)]">
              Commandes
            </p>
            <p className="text-2xl font-extrabold text-white">{orderCount}</p>
          </div>
          <div className="lumina-card rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-[color:var(--color-lumina-text-muted)]">
              Payées
            </p>
            <p className="text-2xl font-extrabold text-white">{paidOrders}</p>
          </div>
        </div>

        <section id="adultes" className="mb-12 scroll-mt-24">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              📚 Catalogue Adultes
            </h1>
            <Link
              href="/admin/ebooks/new?audience=adults"
              className="rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-5 py-2.5 text-sm font-bold text-white shadow-[0_12px_24px_rgba(124,92,255,0.35)] transition hover:-translate-y-0.5"
            >
              + Nouvel eBook
            </Link>
          </div>
          <EbookTable ebooks={adultEbooks} />
        </section>

        <section id="enfants" className="scroll-mt-24">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              🧒 Catalogue Enfants
            </h1>
            <Link
              href="/admin/ebooks/new?audience=kids"
              className="rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-5 py-2.5 text-sm font-bold text-white shadow-[0_12px_24px_rgba(124,92,255,0.35)] transition hover:-translate-y-0.5"
            >
              + Nouvel eBook
            </Link>
          </div>
          <EbookTable ebooks={kidsEbooks} />
        </section>
      </div>
    </div>
  );
}
