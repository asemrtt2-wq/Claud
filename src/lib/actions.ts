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

  // "Collection Sparte" used to be seeded here, but `connect` on an implicit
  // m2m relation only ever adds books, never removes stale ones — so an
  // unrelated book connected to it during earlier iterations stayed stuck
  // there forever across every re-import. Rather than re-seed it, drop it:
  // its Sparte tomes just fall back to appearing as regular catalog books.
  await prisma.catalog.deleteMany({ where: { name: "Collection Sparte" } });

  revalidatePath("/admin");
  revalidatePath("/admin/catalogs");
  revalidatePath("/");
  redirect("/admin");
}
