"use server";

import { revalidatePath } from "next/cache";
import { getCurrentCustomer } from "@/lib/customerSession";
import { prisma } from "@/lib/prisma";

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

  await prisma.readingProgress.upsert({
    where: { customerId_ebookId: { customerId: customer.id, ebookId } },
    update: { page },
    create: { customerId: customer.id, ebookId, page },
  });
}
