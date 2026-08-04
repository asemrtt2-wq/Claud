"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customerSession";
import { paginateContent } from "@/lib/paginate";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export async function createChildProfile(data: {
  name: string;
  avatarEmoji: string;
  dailyLimitMinutes: number | null;
  reminderTime: string | null;
}) {
  const customer = await getCurrentCustomer();
  if (!customer) throw new Error("Non authentifié.");

  await prisma.childProfile.create({
    data: {
      parentId: customer.id,
      name: data.name,
      avatarEmoji: data.avatarEmoji || "🧒",
      dailyLimitMinutes: data.dailyLimitMinutes,
      reminderTime: data.reminderTime,
    },
  });

  revalidatePath("/account");
}

export async function updateChildProfile(
  id: string,
  data: {
    name?: string;
    avatarEmoji?: string;
    dailyLimitMinutes?: number | null;
    reminderTime?: string | null;
  }
) {
  const customer = await getCurrentCustomer();
  if (!customer) throw new Error("Non authentifié.");

  const profile = await prisma.childProfile.findUnique({ where: { id } });
  if (!profile || profile.parentId !== customer.id) throw new Error("Profil introuvable.");

  await prisma.childProfile.update({ where: { id }, data });
  revalidatePath("/account");
  revalidatePath(`/account/kids/${id}`);
}

export async function deleteChildProfile(id: string) {
  const customer = await getCurrentCustomer();
  if (!customer) throw new Error("Non authentifié.");

  const profile = await prisma.childProfile.findUnique({ where: { id } });
  if (!profile || profile.parentId !== customer.id) throw new Error("Profil introuvable.");

  await prisma.childProfile.delete({ where: { id } });
  revalidatePath("/account");
}

export async function saveChildReadingProgress(
  childProfileId: string,
  ebookId: string,
  page: number
) {
  const customer = await getCurrentCustomer();
  if (!customer) return;

  const profile = await prisma.childProfile.findUnique({ where: { id: childProfileId } });
  if (!profile || profile.parentId !== customer.id) return;

  const ebook = await prisma.eBook.findUnique({ where: { id: ebookId } });
  if (!ebook) return;

  const totalPages = paginateContent(ebook.content).length;
  const completed = page >= totalPages - 1;
  const now = new Date();

  const existing = await prisma.childReadingProgress.findUnique({
    where: { childProfileId_ebookId: { childProfileId, ebookId } },
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

  await prisma.childReadingProgress.upsert({
    where: { childProfileId_ebookId: { childProfileId, ebookId } },
    update: { page, completed, lastPageAt: now, avgSecondsPerPage },
    create: { childProfileId, ebookId, page, completed, lastPageAt: now },
  });
}

export async function incrementReadingMinutes(childProfileId: string) {
  const customer = await getCurrentCustomer();
  if (!customer) return { limitReached: true, minutesReadToday: 0, dailyLimitMinutes: null as number | null };

  const profile = await prisma.childProfile.findUnique({ where: { id: childProfileId } });
  if (!profile || profile.parentId !== customer.id) {
    return { limitReached: true, minutesReadToday: 0, dailyLimitMinutes: null };
  }

  const today = todayStr();
  const minutesReadToday = profile.limitResetDate === today ? profile.minutesReadToday + 1 : 1;

  const updated = await prisma.childProfile.update({
    where: { id: childProfileId },
    data: { minutesReadToday, limitResetDate: today },
  });

  const limitReached =
    Boolean(updated.dailyLimitMinutes) && updated.minutesReadToday >= (updated.dailyLimitMinutes ?? 0);

  return {
    limitReached,
    minutesReadToday: updated.minutesReadToday,
    dailyLimitMinutes: updated.dailyLimitMinutes,
  };
}

export async function getReadingStatus(childProfileId: string) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return { limitReached: true, minutesReadToday: 0, dailyLimitMinutes: null as number | null };
  }

  const profile = await prisma.childProfile.findUnique({ where: { id: childProfileId } });
  if (!profile || profile.parentId !== customer.id) {
    return { limitReached: true, minutesReadToday: 0, dailyLimitMinutes: null };
  }

  const today = todayStr();
  const minutesReadToday = profile.limitResetDate === today ? profile.minutesReadToday : 0;
  const limitReached =
    Boolean(profile.dailyLimitMinutes) && minutesReadToday >= (profile.dailyLimitMinutes ?? 0);

  return { limitReached, minutesReadToday, dailyLimitMinutes: profile.dailyLimitMinutes };
}
