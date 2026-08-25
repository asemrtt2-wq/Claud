"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

const DIACRITICS_REGEX = new RegExp("[̀-ͯ]", "g");

function slugify(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS_REGEX, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createEbook(formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") ?? "");
  const price = Number(formData.get("price") ?? 0);
  const oldPriceRaw = formData.get("oldPrice");

  const publishedYearRaw = formData.get("publishedYear");
  const seriesOrderRaw = formData.get("seriesOrder");
  const catalogIds = formData.getAll("catalogIds").map(String);

  await prisma.eBook.create({
    data: {
      title,
      slug: slugify(title),
      subtitle: String(formData.get("subtitle") ?? ""),
      description: String(formData.get("description") ?? ""),
      content: String(formData.get("content") ?? ""),
      pdfUrl: String(formData.get("pdfUrl") ?? "").trim() || null,
      author: String(formData.get("author") ?? ""),
      publishedYear: publishedYearRaw ? Number(publishedYearRaw) : null,
      audience: String(formData.get("audience") ?? "adults"),
      category: String(formData.get("category") ?? ""),
      coverEmoji: String(formData.get("coverEmoji") ?? "📘"),
      coverTheme: String(formData.get("coverTheme") ?? "royal"),
      coverImageUrl: String(formData.get("coverImageUrl") ?? "").trim() || null,
      backCoverImageUrl: String(formData.get("backCoverImageUrl") ?? "").trim() || null,
      seriesName: String(formData.get("seriesName") ?? "").trim() || null,
      seriesOrder: seriesOrderRaw ? Number(seriesOrderRaw) : null,
      price,
      oldPrice: oldPriceRaw ? Number(oldPriceRaw) : null,
      featured: formData.get("featured") === "on",
      catalogs: { connect: catalogIds.map((id) => ({ id })) },
    },
  });

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

export async function updateEbook(id: string, formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") ?? "");
  const oldPriceRaw = formData.get("oldPrice");
  const publishedYearRaw = formData.get("publishedYear");
  const seriesOrderRaw = formData.get("seriesOrder");
  const catalogIds = formData.getAll("catalogIds").map(String);

  await prisma.eBook.update({
    where: { id },
    data: {
      title,
      slug: slugify(title),
      subtitle: String(formData.get("subtitle") ?? ""),
      description: String(formData.get("description") ?? ""),
      content: String(formData.get("content") ?? ""),
      pdfUrl: String(formData.get("pdfUrl") ?? "").trim() || null,
      author: String(formData.get("author") ?? ""),
      publishedYear: publishedYearRaw ? Number(publishedYearRaw) : null,
      audience: String(formData.get("audience") ?? "adults"),
      category: String(formData.get("category") ?? ""),
      coverEmoji: String(formData.get("coverEmoji") ?? "📘"),
      coverTheme: String(formData.get("coverTheme") ?? "royal"),
      coverImageUrl: String(formData.get("coverImageUrl") ?? "").trim() || null,
      backCoverImageUrl: String(formData.get("backCoverImageUrl") ?? "").trim() || null,
      seriesName: String(formData.get("seriesName") ?? "").trim() || null,
      seriesOrder: seriesOrderRaw ? Number(seriesOrderRaw) : null,
      price: Number(formData.get("price") ?? 0),
      oldPrice: oldPriceRaw ? Number(oldPriceRaw) : null,
      featured: formData.get("featured") === "on",
      catalogs: { set: catalogIds.map((id) => ({ id })) },
    },
  });

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

export async function deleteEbook(id: string) {
  await requireAdmin();
  await prisma.eBook.delete({ where: { id } });
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function createCatalog(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!name) return;
  await prisma.catalog.create({ data: { name, description: description || null } });
  revalidatePath("/admin/catalogs");
}

export async function renameCatalog(id: string, formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!name) return;
  await prisma.catalog.update({ where: { id }, data: { name, description: description || null } });
  revalidatePath("/admin/catalogs");
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function deleteCatalog(id: string) {
  await requireAdmin();
  await prisma.catalog.delete({ where: { id } });
  revalidatePath("/admin/catalogs");
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function importRealBooks() {
  await requireAdmin();

  const { REAL_BOOKS } = await import("@/lib/realBooks");
  await Promise.all(
    REAL_BOOKS.map((book) =>
      prisma.eBook.upsert({
        where: { slug: book.slug },
        update: book,
        create: book,
      })
    )
  );

  const guerrier = await prisma.eBook.findUnique({ where: { slug: "le-code-du-guerrier" } });
  await prisma.catalog.upsert({
    where: { name: "Collection Guerrier" },
    update: {
      description: "Construis un mental que rien ne peut briser.",
      ...(guerrier ? { ebooks: { connect: [{ id: guerrier.id }] } } : {}),
    },
    create: {
      name: "Collection Guerrier",
      description: "Construis un mental que rien ne peut briser.",
      ...(guerrier ? { ebooks: { connect: [{ id: guerrier.id }] } } : {}),
    },
  });

  const sparteTomes = await prisma.eBook.findMany({ where: { seriesName: "Sparte" } });
  await prisma.catalog.upsert({
    where: { name: "Collection Sparte" },
    update: {
      description: "Découvre la mentalité des guerriers.",
      ebooks: { connect: sparteTomes.map((t) => ({ id: t.id })) },
    },
    create: {
      name: "Collection Sparte",
      description: "Découvre la mentalité des guerriers.",
      ebooks: { connect: sparteTomes.map((t) => ({ id: t.id })) },
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/catalogs");
  revalidatePath("/");
  redirect("/admin");
}
