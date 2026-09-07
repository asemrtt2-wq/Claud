"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * FAQ editing, admin-only. Each action re-checks the session server-side rather than
 * trusting `proxy.ts` alone — the same defence-in-depth every other admin action uses.
 */
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") redirect("/admin/login");
}

function revalidateFaq() {
  revalidatePath("/admin/faq");
  revalidatePath("/faq");
  // The footer links to /faq from every page, and the sitemap lists it.
  revalidatePath("/");
}

export async function createFaqItem(formData: FormData) {
  await requireAdmin();

  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  if (!question || !answer) return;

  // New entries go to the end of the list by default.
  const last = await prisma.faqItem.findFirst({ orderBy: { position: "desc" } });

  await prisma.faqItem.create({
    data: {
      question,
      answer,
      category: String(formData.get("category") ?? "").trim(),
      position: (last?.position ?? 0) + 1,
      published: formData.get("published") !== null,
    },
  });

  revalidateFaq();
}

export async function updateFaqItem(id: string, formData: FormData) {
  await requireAdmin();

  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  if (!question || !answer) return;

  await prisma.faqItem.update({
    where: { id },
    data: {
      question,
      answer,
      category: String(formData.get("category") ?? "").trim(),
      position: Number(formData.get("position") ?? 0) || 0,
      published: formData.get("published") !== null,
    },
  });

  revalidateFaq();
}

export async function deleteFaqItem(id: string) {
  await requireAdmin();
  await prisma.faqItem.delete({ where: { id } });
  revalidateFaq();
}

/** Swaps an entry with its neighbour so the admin can reorder without retyping positions. */
export async function moveFaqItem(id: string, direction: "up" | "down") {
  await requireAdmin();

  const items = await prisma.faqItem.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    select: { id: true, position: true },
  });
  const index = items.findIndex((item) => item.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= items.length) return;

  /* Positions can collide (everything defaults to 0 before the first reorder), so rewrite
     the whole list from its current order instead of swapping two numbers that may be equal. */
  const reordered = [...items];
  [reordered[index], reordered[swapWith]] = [reordered[swapWith], reordered[index]];

  await prisma.$transaction(
    reordered.map((item, i) =>
      prisma.faqItem.update({ where: { id: item.id }, data: { position: i + 1 } })
    )
  );

  revalidateFaq();
}
