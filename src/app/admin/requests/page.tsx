import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminNav from "@/components/AdminNav";
import { isAiConfigured, MONTHLY_REQUEST_QUOTA } from "@/lib/bookRequests";

const STATUS_STYLE: Record<string, string> = {
  pending: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  generating: "border-[#7c5cff]/40 bg-[#7c5cff]/10 text-[#c9bdff]",
  done: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  duplicate: "border-white/15 bg-white/5 text-[color:var(--color-lumina-text-muted)]",
  failed: "border-red-400/30 bg-red-400/10 text-red-200",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "En attente",
  generating: "En cours",
  done: "Publié",
  duplicate: "Doublon",
  failed: "Échec",
};

/**
 * The queue behind "Demander un livre". Readers generate their own books from their profile
 * page, so this is a read-only view of what has been asked for — the place to notice a
 * request that failed or is stuck waiting on a missing API key.
 */
export default async function AdminRequestsPage() {
  const session = await getServerSession(authOptions);
  const requests = await prisma.bookRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { customer: { select: { email: true } }, profile: { select: { name: true } } },
  });

  const ebooks = await prisma.eBook.findMany({
    where: { id: { in: requests.map((r) => r.ebookId).filter((v): v is string => Boolean(v)) } },
    select: { id: true, slug: true, title: true },
  });

  const aiOn = isAiConfigured();

  return (
    <div className="lumina-shell min-h-screen">
      <AdminNav email={session?.user?.email} />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-white">
          ✨ Demandes de livres
        </h1>
        <p className="mb-6 text-sm text-[color:var(--color-lumina-text-muted)]">
          Les abonnés Premium peuvent faire écrire un livre par Claude depuis leur profil
          {Object.entries(MONTHLY_REQUEST_QUOTA)
            .map(([plan, limit]) => ` (${plan === "yearly" ? "annuel" : "mensuel"} : ${limit}/mois)`)
            .join("")}
          . Un doublon avec le catalogue est refusé avant toute génération.
        </p>

        <p
          className={`mb-8 rounded-xl border px-4 py-3 text-sm font-semibold ${
            aiOn
              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
              : "border-amber-400/30 bg-amber-400/10 text-amber-200"
          }`}
        >
          {aiOn
            ? "✅ Rédaction automatique activée — ANTHROPIC_API_KEY est configurée."
            : "⚠️ ANTHROPIC_API_KEY n'est pas configurée : les demandes sont enregistrées mais aucun livre n'est écrit automatiquement."}
        </p>

        <div className="lumina-card overflow-hidden rounded-2xl">
          <table className="w-full text-left text-sm">
            <thead className="text-xs font-bold uppercase tracking-wide text-[color:var(--color-lumina-text-muted)]">
              <tr>
                <th className="px-5 py-3">Demande</th>
                <th className="px-5 py-3">Compte</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3">Livre</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => {
                const ebook = ebooks.find((e) => e.id === request.ebookId);
                return (
                  <tr key={request.id} className="border-t border-white/10 align-top">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-white">{request.topic}</p>
                      {request.details && (
                        <p className="mt-1 text-xs text-[color:var(--color-lumina-text-muted)]">
                          {request.details}
                        </p>
                      )}
                      {request.error && (
                        <p className="mt-1 text-xs text-red-300">{request.error}</p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-[color:var(--color-lumina-text-muted)]">
                      {request.customer.email}
                      {request.profile && (
                        <span className="block text-xs">{request.profile.name}</span>
                      )}
                      <span className="block text-xs">
                        {request.createdAt.toLocaleDateString("fr-FR")}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold ${
                          STATUS_STYLE[request.status] ?? STATUS_STYLE.duplicate
                        }`}
                      >
                        {STATUS_LABEL[request.status] ?? request.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {ebook ? (
                        <Link
                          href={`/admin/ebooks/${ebook.id}/edit`}
                          className="font-semibold text-[#a78bfa] hover:underline"
                        >
                          {ebook.title}
                        </Link>
                      ) : (
                        <span className="text-[color:var(--color-lumina-text-muted)]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {requests.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-8 text-center text-[color:var(--color-lumina-text-muted)]"
                  >
                    Aucune demande pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
