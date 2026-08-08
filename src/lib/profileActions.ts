"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customerSession";
import { paginateContent } from "@/lib/paginate";
import { getOwnedProfile, todayStr, updateStreak } from "@/lib/profiles";
import { setActiveProfileCookie } from "@/lib/activeProfile";
import { markProfileUnlocked, hashPin, verifyPin } from "@/lib/profileUnlock";

// ---- Profile CRUD ----

export async function createProfile(data: {
  name: string;
  avatarEmoji: string;
  color: string;
  type: "adult" | "kids";
  dailyLimitMinutes: number | null;
}) {
  const customer = await getCurrentCustomer();
  if (!customer) throw new Error("Non authentifié.");

  const profile = await prisma.profile.create({
    data: {
      customerId: customer.id,
      name: data.name,
      avatarEmoji: data.avatarEmoji || "🙂",
      color: data.color || "purple",
      type: data.type,
      dailyLimitMinutes: data.type === "kids" ? data.dailyLimitMinutes : null,
    },
  });

  revalidatePath("/profiles");
  return profile.id;
}

export async function updateProfile(
  profileId: string,
  data: {
    name?: string;
    avatarEmoji?: string;
    color?: string;
    type?: "adult" | "kids";
    dailyLimitMinutes?: number | null;
    reminderTime?: string | null;
  }
) {
  const customer = await getCurrentCustomer();
  if (!customer) throw new Error("Non authentifié.");
  const profile = await getOwnedProfile(profileId, customer.id);
  if (!profile) throw new Error("Profil introuvable.");

  await prisma.profile.update({ where: { id: profileId }, data });
  revalidatePath("/profiles");
  revalidatePath(`/p/${profileId}`);
}

export async function deleteProfile(profileId: string) {
  const customer = await getCurrentCustomer();
  if (!customer) throw new Error("Non authentifié.");
  const profile = await getOwnedProfile(profileId, customer.id);
  if (!profile) throw new Error("Profil introuvable.");

  const count = await prisma.profile.count({ where: { customerId: customer.id } });
  if (count <= 1) throw new Error("Impossible de supprimer le dernier profil.");

  await prisma.profile.delete({ where: { id: profileId } });
  revalidatePath("/profiles");
}

export async function setProfilePin(profileId: string, pin: string | null) {
  const customer = await getCurrentCustomer();
  if (!customer) throw new Error("Non authentifié.");
  const profile = await getOwnedProfile(profileId, customer.id);
  if (!profile) throw new Error("Profil introuvable.");

  const pinHash = pin ? await hashPin(pin) : null;
  await prisma.profile.update({ where: { id: profileId }, data: { pinHash } });
  revalidatePath("/profiles");
}

export async function verifyProfilePin(profileId: string, pin: string) {
  const customer = await getCurrentCustomer();
  if (!customer) return { success: false };
  const profile = await getOwnedProfile(profileId, customer.id);
  if (!profile || !profile.pinHash) return { success: false };

  const valid = await verifyPin(pin, profile.pinHash);
  if (valid) await markProfileUnlocked(profileId);
  return { success: valid };
}

// ---- Switching active profile ----

export async function switchProfile(profileId: string) {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/login");
  const profile = await getOwnedProfile(profileId, customer.id);
  if (!profile) redirect("/profiles");

  await setActiveProfileCookie(profileId);
  redirect(`/p/${profileId}`);
}

// ---- Favorites ----

export async function toggleFavorite(profileId: string, ebookId: string, slug: string) {
  const customer = await getCurrentCustomer();
  if (!customer) throw new Error("Non authentifié.");
  const profile = await getOwnedProfile(profileId, customer.id);
  if (!profile) throw new Error("Profil introuvable.");

  const existing = await prisma.favorite.findUnique({
    where: { profileId_ebookId: { profileId, ebookId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
  } else {
    await prisma.favorite.create({ data: { profileId, ebookId } });
  }

  revalidatePath(`/ebooks/${slug}`);
  revalidatePath(`/p/${profileId}`);
}

// ---- Reading progress ----

export async function saveReadingProgress(profileId: string, ebookId: string, page: number) {
  const customer = await getCurrentCustomer();
  if (!customer) return;
  const profile = await getOwnedProfile(profileId, customer.id);
  if (!profile) return;

  const ebook = await prisma.eBook.findUnique({ where: { id: ebookId } });
  if (!ebook) return;
  const totalPages = paginateContent(ebook.content).length;
  const completed = page >= totalPages - 1;
  const now = new Date();

  const existing = await prisma.readingProgress.findUnique({
    where: { profileId_ebookId: { profileId, ebookId } },
  });

  let avgSecondsPerPage = existing?.avgSecondsPerPage ?? null;
  if (existing?.lastPageAt && page > existing.page) {
    const elapsedSec = (now.getTime() - existing.lastPageAt.getTime()) / 1000;
    if (elapsedSec > 0 && elapsedSec < 3600) {
      avgSecondsPerPage = avgSecondsPerPage
        ? avgSecondsPerPage * 0.7 + elapsedSec * 0.3
        : elapsedSec;
    }
  }

  await prisma.readingProgress.upsert({
    where: { profileId_ebookId: { profileId, ebookId } },
    update: { page, completed, lastPageAt: now, avgSecondsPerPage },
    create: { profileId, ebookId, page, completed, lastPageAt: now },
  });
}

// ---- Reading time / daily limits / streak ----

export async function incrementReadingMinutes(profileId: string) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return { limitReached: true, minutesReadToday: 0, dailyLimitMinutes: null as number | null };
  }
  const profile = await getOwnedProfile(profileId, customer.id);
  if (!profile) {
    return { limitReached: true, minutesReadToday: 0, dailyLimitMinutes: null };
  }

  const today = todayStr();
  const minutesReadTodayVal = profile.limitResetDate === today ? profile.minutesReadToday + 1 : 1;
  const streak = updateStreak(profile);

  const updated = await prisma.profile.update({
    where: { id: profileId },
    data: {
      minutesReadToday: minutesReadTodayVal,
      limitResetDate: today,
      totalMinutesRead: { increment: 1 },
      readingStreak: streak.readingStreak,
      lastReadDate: streak.lastReadDate,
    },
  });

  const limitReached =
    Boolean(updated.dailyLimitMinutes) &&
    updated.minutesReadToday >= (updated.dailyLimitMinutes ?? 0);

  return {
    limitReached,
    minutesReadToday: updated.minutesReadToday,
    dailyLimitMinutes: updated.dailyLimitMinutes,
  };
}

export async function getReadingStatus(profileId: string) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return { limitReached: true, minutesReadToday: 0, dailyLimitMinutes: null as number | null };
  }
  const profile = await getOwnedProfile(profileId, customer.id);
  if (!profile) {
    return { limitReached: true, minutesReadToday: 0, dailyLimitMinutes: null };
  }

  const today = todayStr();
  const minutesReadTodayVal = profile.limitResetDate === today ? profile.minutesReadToday : 0;
  const limitReached =
    Boolean(profile.dailyLimitMinutes) && minutesReadTodayVal >= (profile.dailyLimitMinutes ?? 0);

  return {
    limitReached,
    minutesReadToday: minutesReadTodayVal,
    dailyLimitMinutes: profile.dailyLimitMinutes,
  };
}

// ---- Reminders & reading goals ----

export async function setReadingReminder(profileId: string, time: string | null) {
  const customer = await getCurrentCustomer();
  if (!customer) throw new Error("Non authentifié.");
  const profile = await getOwnedProfile(profileId, customer.id);
  if (!profile) throw new Error("Profil introuvable.");

  await prisma.profile.update({ where: { id: profileId }, data: { reminderTime: time } });
  revalidatePath(`/p/${profileId}`);
}

export async function setMonthlyBookGoal(profileId: string, goal: number | null) {
  const customer = await getCurrentCustomer();
  if (!customer) throw new Error("Non authentifié.");
  const profile = await getOwnedProfile(profileId, customer.id);
  if (!profile) throw new Error("Profil introuvable.");

  await prisma.profile.update({ where: { id: profileId }, data: { monthlyBookGoal: goal } });
  revalidatePath(`/p/${profileId}`);
}

// ---- Collections ----

export async function createCollection(profileId: string, name: string) {
  const customer = await getCurrentCustomer();
  if (!customer) throw new Error("Non authentifié.");
  const profile = await getOwnedProfile(profileId, customer.id);
  if (!profile) throw new Error("Profil introuvable.");
  if (!name.trim()) throw new Error("Nom requis.");

  const collection = await prisma.collection.create({
    data: { profileId, name: name.trim() },
  });
  revalidatePath(`/p/${profileId}`);
  return collection.id;
}

export async function deleteCollection(collectionId: string) {
  const customer = await getCurrentCustomer();
  if (!customer) throw new Error("Non authentifié.");

  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    include: { profile: true },
  });
  if (!collection || collection.profile.customerId !== customer.id) throw new Error("Introuvable.");

  await prisma.collection.delete({ where: { id: collectionId } });
  revalidatePath(`/p/${collection.profileId}`);
}

export async function addToCollection(collectionId: string, ebookId: string) {
  const customer = await getCurrentCustomer();
  if (!customer) throw new Error("Non authentifié.");

  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    include: { profile: true },
  });
  if (!collection || collection.profile.customerId !== customer.id) throw new Error("Introuvable.");

  await prisma.collectionItem.upsert({
    where: { collectionId_ebookId: { collectionId, ebookId } },
    update: {},
    create: { collectionId, ebookId },
  });
  revalidatePath(`/p/${collection.profileId}`);
}

export async function removeFromCollection(collectionId: string, ebookId: string) {
  const customer = await getCurrentCustomer();
  if (!customer) throw new Error("Non authentifié.");

  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    include: { profile: true },
  });
  if (!collection || collection.profile.customerId !== customer.id) throw new Error("Introuvable.");

  await prisma.collectionItem.deleteMany({ where: { collectionId, ebookId } });
  revalidatePath(`/p/${collection.profileId}`);
}

// ---- Highlights & notes ----

export async function getHighlights(profileId: string, ebookId: string) {
  const customer = await getCurrentCustomer();
  if (!customer) return [];
  const profile = await getOwnedProfile(profileId, customer.id);
  if (!profile) return [];

  return prisma.highlight.findMany({
    where: { profileId, ebookId },
    orderBy: [{ page: "asc" }, { createdAt: "asc" }],
  });
}

export async function createHighlight(
  profileId: string,
  ebookId: string,
  page: number,
  text: string
) {
  const customer = await getCurrentCustomer();
  if (!customer) throw new Error("Non authentifié.");
  const profile = await getOwnedProfile(profileId, customer.id);
  if (!profile) throw new Error("Profil introuvable.");
  if (!text.trim()) throw new Error("Texte requis.");

  const highlight = await prisma.highlight.create({
    data: { profileId, ebookId, page, text: text.trim() },
  });
  return highlight.id;
}

export async function updateHighlightNote(highlightId: string, note: string) {
  const customer = await getCurrentCustomer();
  if (!customer) throw new Error("Non authentifié.");

  const highlight = await prisma.highlight.findUnique({
    where: { id: highlightId },
    include: { profile: true },
  });
  if (!highlight || highlight.profile.customerId !== customer.id) throw new Error("Introuvable.");

  await prisma.highlight.update({
    where: { id: highlightId },
    data: { note: note.trim() || null },
  });
}

export async function deleteHighlight(highlightId: string) {
  const customer = await getCurrentCustomer();
  if (!customer) throw new Error("Non authentifié.");

  const highlight = await prisma.highlight.findUnique({
    where: { id: highlightId },
    include: { profile: true },
  });
  if (!highlight || highlight.profile.customerId !== customer.id) throw new Error("Introuvable.");

  await prisma.highlight.delete({ where: { id: highlightId } });
}
