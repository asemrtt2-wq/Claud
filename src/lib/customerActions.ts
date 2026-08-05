"use server";

import { revalidatePath } from "next/cache";
import { getCurrentCustomer } from "@/lib/customerSession";
import { prisma } from "@/lib/prisma";
import { paginateContent } from "@/lib/paginate";

export async function toggleFavorite(ebookId: string, slug: string) {
  const customer = await getCurrentCustomer();
  if (!customer) throw new Error("Connecte-toi pour ajouter un favori.");

  const existing = await prisma.favorite.findUnique({
    where: { customerId_ebookId: { customerId: customer.id, ebookId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
  } else {
    await prisma.favorite.create({ data: { customerId: customer.id, ebookId } });
  }

  revalidatePath(`/ebooks/${slug}`);
  revalidatePath("/account");
}

export async function saveReadingProgress(ebookId: string, page: number) {
  const customer = await getCurrentCustomer();
  if (!customer) return;

  const ebook = await prisma.eBook.findUnique({ where: { id: ebookId } });
  if (!ebook) return;
  const totalPages = paginateContent(ebook.content).length;
  const completed = page >= totalPages - 1;

  await prisma.readingProgress.upsert({
    where: { customerId_ebookId: { customerId: customer.id, ebookId } },
    update: { page, completed },
    create: { customerId: customer.id, ebookId, page, completed },
  });
}

export async function setReadingReminder(time: string | null) {
  const customer = await getCurrentCustomer();
  if (!customer) throw new Error("Non authentifié.");

  await prisma.customer.update({
    where: { id: customer.id },
    data: { readingReminderTime: time },
  });

  revalidatePath("/account");
}

export async function setMonthlyBookGoal(goal: number | null) {
  const customer = await getCurrentCustomer();
  if (!customer) throw new Error("Non authentifié.");

  await prisma.customer.update({
    where: { id: customer.id },
    data: { monthlyBookGoal: goal },
  });

  revalidatePath("/account");
}

export async function incrementAdultReadingMinutes() {
  const customer = await getCurrentCustomer();
  if (!customer) return { minutesReadToday: 0, totalMinutesRead: 0 };

  const today = new Date().toISOString().slice(0, 10);
  const minutesReadToday =
    customer.readingDate === today ? customer.minutesReadToday + 1 : 1;

  const updated = await prisma.customer.update({
    where: { id: customer.id },
    data: {
      minutesReadToday,
      readingDate: today,
      totalMinutesRead: { increment: 1 },
    },
  });

  return {
    minutesReadToday: updated.minutesReadToday,
    totalMinutesRead: updated.totalMinutesRead,
  };
}

export async function createCollection(name: string) {
  const customer = await getCurrentCustomer();
  if (!customer) throw new Error("Non authentifié.");
  if (!name.trim()) throw new Error("Nom requis.");

  const collection = await prisma.collection.create({
    data: { customerId: customer.id, name: name.trim() },
  });

  revalidatePath("/account");
  return collection.id;
}

export async function deleteCollection(collectionId: string) {
  const customer = await getCurrentCustomer();
  if (!customer) throw new Error("Non authentifié.");

  const collection = await prisma.collection.findUnique({ where: { id: collectionId } });
  if (!collection || collection.customerId !== customer.id) throw new Error("Introuvable.");

  await prisma.collection.delete({ where: { id: collectionId } });
  revalidatePath("/account");
}

export async function addToCollection(collectionId: string, ebookId: string) {
  const customer = await getCurrentCustomer();
  if (!customer) throw new Error("Non authentifié.");

  const collection = await prisma.collection.findUnique({ where: { id: collectionId } });
  if (!collection || collection.customerId !== customer.id) throw new Error("Introuvable.");

  await prisma.collectionItem.upsert({
    where: { collectionId_ebookId: { collectionId, ebookId } },
    update: {},
    create: { collectionId, ebookId },
  });

  revalidatePath("/account");
}

export async function removeFromCollection(collectionId: string, ebookId: string) {
  const customer = await getCurrentCustomer();
  if (!customer) throw new Error("Non authentifié.");

  const collection = await prisma.collection.findUnique({ where: { id: collectionId } });
  if (!collection || collection.customerId !== customer.id) throw new Error("Introuvable.");

  await prisma.collectionItem.deleteMany({ where: { collectionId, ebookId } });
  revalidatePath("/account");
}
