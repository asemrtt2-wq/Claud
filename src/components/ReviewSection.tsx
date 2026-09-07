"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import StarRating from "@/components/StarRating";
import { profileGradient } from "@/lib/profileColors";
import { deleteReview, replyToReview, saveReview } from "@/lib/reviewActions";
import type { RatingSummary, ReviewNode } from "@/lib/reviews";

/**
 * Public ratings and comments for one book. This replaced the old "Partager" button: a share
 * link sent the page somewhere else, where this keeps what readers think on the page itself.
 *
 * Every score on screen is computed from real submitted ratings — a book nobody has rated
 * says so instead of showing an empty five-star row, which would read as a zero score.
 */
export default function ReviewSection({
  ebookId,
  slug,
  profileId,
  summary,
  reviews,
  myReview,
}: {
  ebookId: string;
  slug: string;
  /** Null when nobody is signed in / no profile is active — the form becomes a login CTA. */
  profileId: string | null;
  summary: RatingSummary;
  reviews: ReviewNode[];
  myReview: { id: string; rating: number | null; comment: string } | null;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(myReview?.rating ?? 0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState(myReview?.comment ?? "");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(fn: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await fn();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      }
    });
  }

  const shown = hovered || rating;

  return (
    <section id="avis" className="scroll-mt-24">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-xl font-extrabold tracking-tight text-[#1d1d1f]">Avis des lecteurs</h2>
        {summary.average !== null ? (
          <div className="flex items-center gap-3">
            <span className="text-3xl font-extrabold text-[#1d1d1f]">
              {summary.average.toFixed(1)}
            </span>
            <div>
              <StarRating value={summary.average} size={16} className="text-[#1d1d1f]" />
              <p className="text-xs font-semibold text-[#6e6e73]">
                {`${summary.count} avis`}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm font-semibold text-[#6e6e73]">Pas encore de note</p>
        )}
      </div>

      {/* Distribution bars, only once there is something real to distribute. */}
      {summary.count > 0 && (
        <div className="mb-8 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = summary.distribution[star - 1];
            const percent = summary.count > 0 ? (count / summary.count) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-xs font-semibold text-[#6e6e73]">
                <span className="w-8 shrink-0">{star} ★</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-black/[0.07]">
                  <span
                    className="block h-2 rounded-full bg-[#f5b301]"
                    style={{ width: `${percent}%` }}
                  />
                </span>
                <span className="w-6 shrink-0 text-right tabular-nums">{count}</span>
              </div>
            );
          })}
        </div>
      )}

      {profileId ? (
        <div className="mb-8 rounded-[22px] border border-black/[0.07] bg-white p-5 shadow-[0_2px_14px_rgba(0,0,0,0.05)]">
          <p className="mb-3 text-sm font-bold text-[#1d1d1f]">
            {myReview ? "Modifier ton avis" : "Donner ton avis"}
          </p>
          <div
            className="mb-3 flex items-center gap-1"
            onMouseLeave={() => setHovered(0)}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                aria-label={`Noter ${star} sur 5`}
                className={`text-2xl leading-none transition hover:scale-110 ${
                  star <= shown ? "text-[#f5b301]" : "text-black/20"
                }`}
              >
                ★
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-sm font-semibold text-[#6e6e73]">{`${rating} / 5`}</span>
            )}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="Ce que tu as pensé du livre (facultatif)…"
            className="w-full resize-none rounded-xl border border-black/10 bg-[#f5f5f7] px-4 py-3 text-sm text-[#1d1d1f] outline-none transition focus:border-[#7c5cff]"
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={isPending || rating === 0}
              onClick={() => run(() => saveReview(profileId, ebookId, slug, rating, comment))}
              className="rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#5b3df0] px-5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
            >
              {isPending ? "…" : myReview ? "Mettre à jour" : "Publier mon avis"}
            </button>
            {rating === 0 && (
              <span className="text-xs font-semibold text-[#6e6e73]">
                Choisis une note pour publier.
              </span>
            )}
            {myReview && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => run(() => deleteReview(profileId, myReview.id, slug))}
                className="text-xs font-bold text-[#6e6e73] transition hover:text-red-500"
              >
                Supprimer mon avis
              </button>
            )}
          </div>
        </div>
      ) : (
        <p className="mb-8 rounded-[22px] border border-black/[0.07] bg-white p-5 text-sm text-[#6e6e73]">
          <Link href="/login" className="font-bold text-[#5b3df0] hover:underline">
            Connecte-toi
          </Link>{" "}
          pour noter ce livre et laisser un commentaire.
        </p>
      )}

      {error && (
        <p className="mb-6 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}

      {reviews.length === 0 ? (
        <p className="text-sm text-[#6e6e73]">
          Aucun commentaire pour l&apos;instant — sois le premier à donner ton avis.
        </p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="rounded-[22px] border border-black/[0.07] bg-white p-5 shadow-[0_2px_14px_rgba(0,0,0,0.04)]"
            >
              <ReviewBody review={review} />

              {review.replies.length > 0 && (
                <ul className="mt-4 space-y-3 border-l-2 border-black/[0.07] pl-4">
                  {review.replies.map((reply) => (
                    <li key={reply.id}>
                      <ReviewBody review={reply} compact />
                      {reply.mine && profileId && (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => run(() => deleteReview(profileId, reply.id, slug))}
                          className="mt-1 text-xs font-bold text-[#6e6e73] transition hover:text-red-500"
                        >
                          Supprimer
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {profileId && (
                <div className="mt-3">
                  {replyTo === review.id ? (
                    <div className="flex flex-wrap items-start gap-2">
                      <textarea
                        autoFocus
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={2}
                        maxLength={2000}
                        placeholder="Ta réponse…"
                        className="min-w-0 flex-1 resize-none rounded-xl border border-black/10 bg-[#f5f5f7] px-3 py-2 text-sm outline-none focus:border-[#7c5cff]"
                      />
                      <button
                        type="button"
                        disabled={isPending || replyText.trim().length === 0}
                        onClick={() =>
                          run(async () => {
                            await replyToReview(profileId, review.id, slug, replyText);
                            setReplyText("");
                            setReplyTo(null);
                          })
                        }
                        className="rounded-xl bg-[#5b3df0] px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
                      >
                        Répondre
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReplyTo(null);
                          setReplyText("");
                        }}
                        className="rounded-xl border border-black/10 px-4 py-2 text-sm font-bold text-[#6e6e73]"
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setReplyTo(review.id)}
                        className="text-xs font-bold text-[#5b3df0] hover:underline"
                      >
                        💬 Répondre
                      </button>
                      {review.mine && (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => run(() => deleteReview(profileId, review.id, slug))}
                          className="text-xs font-bold text-[#6e6e73] transition hover:text-red-500"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ReviewBody({ review, compact = false }: { review: ReviewNode; compact?: boolean }) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <span
          className={`flex shrink-0 items-center justify-center rounded-full ${
            compact ? "h-8 w-8 text-base" : "h-10 w-10 text-lg"
          }`}
          style={{ background: profileGradient(review.author.color) }}
        >
          {review.author.avatarEmoji}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[#1d1d1f]">{review.author.name}</p>
          <p className="flex items-center gap-2 text-xs text-[#6e6e73]">
            {review.rating !== null && (
              <StarRating value={review.rating} size={12} className="text-[#1d1d1f]" />
            )}
            {review.createdAt}
          </p>
        </div>
      </div>
      {review.comment && (
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#1d1d1f]">
          {review.comment}
        </p>
      )}
    </div>
  );
}
