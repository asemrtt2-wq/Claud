"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  deleteBookRequest,
  generateNextChapter,
  resumeRequest,
  submitBookRequest,
  type RequestStep,
} from "@/lib/bookRequestActions";

export type RequestSummary = {
  id: string;
  topic: string;
  status: string;
  error: string | null;
  createdAt: string;
  resumable: boolean;
  ebook: { slug: string; title: string } | null;
};

const STATUS_LABEL: Record<string, string> = {
  pending: "En attente",
  generating: "En cours d'écriture",
  done: "Publié",
  duplicate: "Déjà au catalogue",
  failed: "Échec",
};

/**
 * "Demander un livre" — the Premium reader describes a book, Lumina writes it with Claude
 * and publishes it into the catalog.
 *
 * The generation loop lives here rather than in a single server action because a whole book
 * takes minutes to write: each chapter is its own short request, saved as it lands, so the
 * work survives a closed tab and the reader watches real progress instead of a dead button.
 */
export default function BookRequestPanel({
  profileId,
  quota,
  aiConfigured,
  requests,
}: {
  profileId: string;
  quota: { plan: string | null; limit: number; used: number; remaining: number };
  aiConfigured: boolean;
  requests: RequestSummary[];
}) {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [details, setDetails] = useState("");
  const [step, setStep] = useState<RequestStep | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Walks a started request chapter by chapter until it is published. */
  async function driveToEnd(start: RequestStep) {
    let current = start;
    setStep(current);
    while (!current.finished) {
      current = await generateNextChapter(current.requestId);
      setStep(current);
    }
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStep(null);
    setRunning(true);
    try {
      const first = await submitBookRequest(profileId, topic, details);
      if (first.status === "duplicate") {
        setStep(first);
      } else {
        await driveToEnd(first);
        setTopic("");
        setDetails("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setRunning(false);
    }
  }

  async function handleResume(requestId: string) {
    setError(null);
    setRunning(true);
    try {
      await driveToEnd(await resumeRequest(requestId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setRunning(false);
    }
  }

  async function handleDelete(requestId: string) {
    await deleteBookRequest(requestId);
    router.refresh();
  }

  const percent = step && step.total > 0 ? Math.round((step.done / step.total) * 100) : 0;

  return (
    <section className="lumina-card mb-10 rounded-[22px] p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold">✨ Demander un livre</h2>
          <p className="mt-1 text-sm text-[color:var(--color-lumina-text-muted)]">
            Dis-nous le livre qui te manque : Lumina l&apos;écrit avec Claude et l&apos;ajoute au
            catalogue. Si un livre proche existe déjà, on te l&apos;indique au lieu d&apos;en
            écrire un deuxième.
          </p>
        </div>
        {quota.plan && (
          <span className="shrink-0 rounded-full border border-[#7c5cff]/40 bg-[#7c5cff]/10 px-3 py-1.5 text-xs font-bold">
            {`${quota.remaining} / ${quota.limit} ce mois-ci`}
          </span>
        )}
      </div>

      {!quota.plan ? (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm text-[color:var(--color-lumina-text-muted)]">
            Cette fonctionnalité est réservée aux abonnés Premium.
          </p>
          <Link
            href="/premium"
            className="rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5"
          >
            Passer Premium
          </Link>
        </div>
      ) : (
        <>
          {!aiConfigured && (
            <p className="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-200">
              La rédaction automatique n&apos;est pas encore activée sur ce serveur. Ta demande
              sera enregistrée et traitée par l&apos;équipe Lumina.
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={running || quota.remaining <= 0}
              maxLength={200}
              placeholder="Ex : la discipline chez les nageurs de haut niveau"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[#7c5cff] disabled:opacity-50"
            />
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              disabled={running || quota.remaining <= 0}
              maxLength={1000}
              rows={2}
              placeholder="Précisions (facultatif) : angle, ton, ce que tu veux en retirer…"
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[#7c5cff] disabled:opacity-50"
            />
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={running || topic.trim().length < 4 || quota.remaining <= 0}
                className="rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
              >
                {running ? "Écriture en cours…" : "Écrire ce livre"}
              </button>
              {quota.remaining <= 0 && (
                <span className="text-xs font-semibold text-[color:var(--color-lumina-text-muted)]">
                  Quota du mois atteint — il repart le 1er du mois prochain.
                </span>
              )}
            </div>
          </form>

          {step && step.status !== "duplicate" && (
            <div className="mt-5">
              <div className="lumina-progress-track h-2 w-full overflow-hidden rounded-full">
                <div
                  className="lumina-progress-fill h-full rounded-full transition-[width] duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-[color:var(--color-lumina-text-muted)]">
                {step.finished ? `✅ « ${step.label} » est publié.` : step.label}
              </p>
              {step.finished && step.slug && (
                <Link
                  href={`/ebooks/${step.slug}`}
                  className="mt-2 inline-block text-sm font-bold text-[#a78bfa] hover:underline"
                >
                  Ouvrir le livre →
                </Link>
              )}
            </div>
          )}

          {step?.status === "duplicate" && step.duplicateSlug && (
            <p className="mt-4 rounded-xl border border-[#7c5cff]/30 bg-[#7c5cff]/10 px-4 py-3 text-sm">
              {`Lumina a déjà « ${step.duplicateTitle} » sur ce sujet — ta demande n'a pas été décomptée. `}
              <Link href={`/ebooks/${step.duplicateSlug}`} className="font-bold text-[#a78bfa] hover:underline">
                Le lire →
              </Link>
            </p>
          )}

          {error && (
            <p className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-200">
              ❌ {error}
            </p>
          )}
        </>
      )}

      {requests.length > 0 && (
        <div className="mt-6 border-t border-white/10 pt-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[color:var(--color-lumina-text-muted)]">
            Mes demandes
          </p>
          <ul className="space-y-2">
            {requests.map((request) => (
              <li
                key={request.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{request.topic}</p>
                  <p className="text-xs text-[color:var(--color-lumina-text-muted)]">
                    {STATUS_LABEL[request.status] ?? request.status} · {request.createdAt}
                    {request.error ? ` · ${request.error}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-xs font-bold">
                  {request.ebook && (
                    <Link href={`/ebooks/${request.ebook.slug}`} className="text-[#a78bfa] hover:underline">
                      Lire →
                    </Link>
                  )}
                  {request.resumable && (
                    <button
                      onClick={() => handleResume(request.id)}
                      disabled={running}
                      className="rounded-lg border border-white/15 px-3 py-1.5 transition hover:border-[#a78bfa] disabled:opacity-40"
                    >
                      Reprendre
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(request.id)}
                    className="text-[color:var(--color-lumina-text-muted)] transition hover:text-red-300"
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
