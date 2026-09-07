"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customerSession";
import { getOwnedProfile } from "@/lib/profiles";

/**
 * Reviews are written as a profile, so every action re-verifies that the profile belongs to
 * the signed-in customer — the same defence-in-depth `profileActions.ts` uses, since a
 * profileId travelling through a form is attacker-controlled.
 */
async function requireProfile(profileId: string) {
  const customer = await getCurrentCustomer();
  if (!customer) throw new Error("Tu dois être connecté.");
  const profile = await getOwnedProfile(profileId, customer.id);
  if (!profile) throw new Error("Profil introuvable.");
  return profile;
}

const MAX_COMMENT = 2000;

function clean(comment: string) {
  return comment.trim().slice(0, MAX_COMMENT);
}

/** Creates or updates the profile's single rating for a book. */
export async function saveReview(
  profileId: string,
  ebookId: string,
  slug: string,
  rating: number,
  comment: string
) {
  await requireProfile(profileId);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("La note doit être comprise entre 1 et 5 étoiles.");
  }

  const existing = await prisma.review.findFirst({
    where: { ebookId, profileId, parentId: null },
    select: { id: true },
  });

  if (existing) {
    await prisma.review.update({
      where: { id: existing.id },
      data: { rating, comment: clean(comment) },
    });
  } else {
    await prisma.review.create({
      data: { ebookId, profileId, rating, comment: clean(comment) },
    });
  }

  revalidatePath(`/ebooks/${slug}`);
}

/** Answers someone else's review. Replies carry no rating of their own. */
export async function replyToReview(
  profileId: string,
  parentId: string,
  slug: string,
  comment: string
) {
  await requireProfile(profileId);

  const body = clean(comment);
  if (body.length === 0) throw new Error("Écris un message avant de répondre.");

  const parent = await prisma.review.findUnique({
    where: { id: parentId },
    select: { id: true, ebookId: true, parentId: true },
  });
  if (!parent) throw new Error("Ce commentaire n'existe plus.");

  await prisma.review.create({
    data: {
      ebookId: parent.ebookId,
      profileId,
      // Threads stay one level deep: answering a reply attaches to the same root.
      parentId: parent.parentId ?? parent.id,
      comment: body,
    },
  });

  revalidatePath(`/ebooks/${slug}`);
}

export async function deleteReview(profileId: string, reviewId: string, slug: string) {
  await requireProfile(profileId);

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { id: true, profileId: true },
  });
  if (!review) return;
  if (review.profileId !== profileId) {
    throw new Error("Tu ne peux supprimer que tes propres messages.");
  }

  // Replies cascade with the parent (onDelete: Cascade on the self-relation).
  await prisma.review.delete({ where: { id: reviewId } });
  revalidatePath(`/ebooks/${slug}`);
}
