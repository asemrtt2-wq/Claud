"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customerSession";
import {
  buildContent,
  CHAPTER_COUNT,
  COVER_THEMES,
  findExistingBook,
  generateChapter,
  generateOutline,
  getRequestQuota,
  isAiConfigured,
  parseDraft,
  uniqueSlug,
  type Draft,
} from "@/lib/bookRequests";

export type RequestStep = {
  requestId: string;
  status: string;
  /** Chapters written so far / total, for the progress bar. */
  done: number;
  total: number;
  label: string;
  finished: boolean;
  slug?: string;
  error?: string;
  /** Set when the catalog already has this book — the request is not consumed. */
  duplicateSlug?: string;
  duplicateTitle?: string;
};

async function requireOwnedRequest(requestId: string) {
  const customer = await getCurrentCustomer();
  if (!customer) throw new Error("Tu dois être connecté.");
  const request = await prisma.bookRequest.findUnique({ where: { id: requestId } });
  if (!request || request.customerId !== customer.id) {
    throw new Error("Demande introuvable.");
  }
  return { customer, request };
}

/**
 * Step 1 — validate the ask, check the catalog and the quota, and write the outline.
 *
 * The duplicate check runs before anything is stored, so asking for a book Lumina already
 * has costs the reader nothing.
 */
export async function submitBookRequest(
  profileId: string,
  topic: string,
  details: string
): Promise<RequestStep> {
  const customer = await getCurrentCustomer();
  if (!customer) throw new Error("Tu dois être connecté.");

  const profile = await prisma.profile.findUnique({ where: { id: profileId } });
  if (!profile || profile.customerId !== customer.id) throw new Error("Profil introuvable.");

  const cleanTopic = topic.trim();
  if (cleanTopic.length < 4) throw new Error("Décris le livre que tu veux en quelques mots.");
  if (cleanTopic.length > 200) throw new Error("Sujet trop long (200 caractères maximum).");

  const quota = await getRequestQuota(customer.id);
  if (!quota.plan) {
    throw new Error("Les demandes de livres sont réservées aux abonnés Premium.");
  }
  if (quota.remaining <= 0) {
    throw new Error(
      `Tu as utilisé tes ${quota.limit} demandes de ce mois-ci. Le compteur repart le 1er du mois prochain.`
    );
  }

  const existing = await findExistingBook(cleanTopic);
  if (existing) {
    return {
      requestId: "",
      status: "duplicate",
      done: 0,
      total: CHAPTER_COUNT,
      label: "Ce livre existe déjà",
      finished: true,
      duplicateSlug: existing.slug,
      duplicateTitle: existing.title,
    };
  }

  if (!isAiConfigured()) {
    // Keep the ask on file so an admin can still act on it, but say plainly that nothing
    // is going to be written right now.
    await prisma.bookRequest.create({
      data: {
        customerId: customer.id,
        profileId,
        topic: cleanTopic,
        details: details.trim().slice(0, 1000),
        status: "pending",
        error: "Génération automatique indisponible (ANTHROPIC_API_KEY non configurée).",
      },
    });
    revalidatePath(`/p/${profileId}/compte`);
    throw new Error(
      "La rédaction automatique n'est pas activée sur ce serveur. Ta demande a été enregistrée pour l'équipe Lumina."
    );
  }

  const request = await prisma.bookRequest.create({
    data: {
      customerId: customer.id,
      profileId,
      topic: cleanTopic,
      details: details.trim().slice(0, 1000),
      status: "generating",
    },
  });

  try {
    const outline = await generateOutline(cleanTopic, details.trim());

    // The model may have named a book we already have — check the real title too.
    const duplicateByTitle = await findExistingBook(outline.title);
    if (duplicateByTitle) {
      await prisma.bookRequest.update({
        where: { id: request.id },
        data: { status: "duplicate", ebookId: null },
      });
      revalidatePath(`/p/${profileId}/compte`);
      return {
        requestId: request.id,
        status: "duplicate",
        done: 0,
        total: outline.chapters.length,
        label: "Ce livre existe déjà",
        finished: true,
        duplicateSlug: duplicateByTitle.slug,
        duplicateTitle: duplicateByTitle.title,
      };
    }

    const draft: Draft = { outline, chapters: [] };
    await prisma.bookRequest.update({
      where: { id: request.id },
      data: { draft: JSON.stringify(draft), status: "generating" },
    });

    revalidatePath(`/p/${profileId}/compte`);
    return {
      requestId: request.id,
      status: "generating",
      done: 0,
      total: outline.chapters.length,
      label: `Plan de « ${outline.title} » prêt`,
      finished: false,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue.";
    await prisma.bookRequest.update({
      where: { id: request.id },
      data: { status: "failed", error: message.slice(0, 500) },
    });
    revalidatePath(`/p/${profileId}/compte`);
    throw new Error(message);
  }
}

/**
 * Step 2 — write one chapter and save it.
 *
 * One chapter per call on purpose: a whole book in a single request would run for minutes
 * and be killed by the serverless time limit, exactly like the old bulk book import was.
 * Because each chapter is persisted as it lands, closing the tab only pauses the job — the
 * panel picks it back up where it stopped.
 */
export async function generateNextChapter(requestId: string): Promise<RequestStep> {
  const { request } = await requireOwnedRequest(requestId);
  const draft = parseDraft(request.draft);
  if (!draft) throw new Error("Le brouillon de cette demande est introuvable.");

  if (draft.chapters.length >= draft.outline.chapters.length) {
    return finalizeRequest(requestId);
  }

  const index = draft.chapters.length;
  try {
    const body = await generateChapter(draft.outline, index, draft.chapters);
    draft.chapters.push(body);
    await prisma.bookRequest.update({
      where: { id: requestId },
      data: { draft: JSON.stringify(draft), status: "generating", error: null },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue.";
    await prisma.bookRequest.update({
      where: { id: requestId },
      data: { status: "failed", error: message.slice(0, 500) },
    });
    throw new Error(message);
  }

  const done = draft.chapters.length;
  const total = draft.outline.chapters.length;
  if (done >= total) return finalizeRequest(requestId);

  return {
    requestId,
    status: "generating",
    done,
    total,
    label: `Chapitre ${done} / ${total} — ${draft.outline.chapters[done - 1].title}`,
    finished: false,
  };
}

/** Step 3 — turn the finished draft into a real published eBook. */
export async function finalizeRequest(requestId: string): Promise<RequestStep> {
  const { request } = await requireOwnedRequest(requestId);

  if (request.status === "done" && request.ebookId) {
    const existing = await prisma.eBook.findUnique({ where: { id: request.ebookId } });
    if (existing) {
      return {
        requestId,
        status: "done",
        done: CHAPTER_COUNT,
        total: CHAPTER_COUNT,
        label: existing.title,
        finished: true,
        slug: existing.slug,
      };
    }
  }

  const draft = parseDraft(request.draft);
  if (!draft || draft.chapters.length === 0) throw new Error("Rien à publier pour cette demande.");

  const { outline } = draft;
  const slug = await uniqueSlug(outline.title);
  const ebook = await prisma.eBook.create({
    data: {
      slug,
      title: outline.title,
      subtitle: outline.subtitle,
      description: outline.description,
      content: buildContent(draft),
      category: outline.category,
      author: "",
      audience: "adults",
      coverEmoji: outline.coverEmoji,
      // No cover art exists for a generated book, so it falls back to the gradient covers
      // the rest of the catalog already uses when an image is missing.
      coverTheme: COVER_THEMES[Math.floor(Math.random() * COVER_THEMES.length)],
      price: 9,
      featured: false,
    },
  });

  await prisma.bookRequest.update({
    where: { id: requestId },
    data: { status: "done", ebookId: ebook.id, draft: null, error: null },
  });

  // A generated book belongs to the whole catalog, so every listing needs refreshing.
  revalidatePath("/");
  revalidatePath("/bibliotheque");
  revalidatePath("/admin");
  if (request.profileId) revalidatePath(`/p/${request.profileId}/compte`);

  return {
    requestId,
    status: "done",
    done: draft.chapters.length,
    total: draft.outline.chapters.length,
    label: ebook.title,
    finished: true,
    slug: ebook.slug,
  };
}

/** Resumes a request whose tab was closed mid-generation. */
export async function resumeRequest(requestId: string): Promise<RequestStep> {
  const { request } = await requireOwnedRequest(requestId);
  const draft = parseDraft(request.draft);
  if (!draft) throw new Error("Cette demande n'a pas de brouillon à reprendre.");
  return {
    requestId,
    status: "generating",
    done: draft.chapters.length,
    total: draft.outline.chapters.length,
    label: `Reprise de « ${draft.outline.title} »`,
    finished: false,
  };
}

export async function deleteBookRequest(requestId: string) {
  const { request } = await requireOwnedRequest(requestId);
  await prisma.bookRequest.delete({ where: { id: requestId } });
  if (request.profileId) revalidatePath(`/p/${request.profileId}/compte`);
}
