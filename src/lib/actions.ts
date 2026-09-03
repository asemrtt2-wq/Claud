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

/**
 * One slice of the "Importer mes livres" run.
 *
 * This used to be a single action that fired every book's upsert at once through
 * `Promise.all` and then redirected. With 100+ books (~3.4 MB of chapter text) that
 * reliably died in production: the concurrent upserts exhausted the Prisma connection
 * pool (P2024) and/or blew the serverless function's time limit, and because the button
 * was a plain `<form action>` the failure was completely invisible — the page just sat
 * there. Now the client walks through the catalog a few books at a time, sequentially,
 * so no single request can time out and every failure has somewhere to be shown.
 */
// Not exported: a "use server" module may only export async functions.
const IMPORT_CHUNK_SIZE = 5;

export type ImportChunkResult = {
  done: boolean;
  nextOffset: number;
  imported: number;
  total: number;
  /** Titles handled in this slice, so the UI can show what it is working on. */
  titles: string[];
};

export async function importRealBooksChunk(offset: number): Promise<ImportChunkResult> {
  await requireAdmin();

  const { REAL_BOOKS } = await import("@/lib/realBooks");
  const start = Math.max(0, Math.floor(offset));
  const slice = REAL_BOOKS.slice(start, start + IMPORT_CHUNK_SIZE);

  // Sequential on purpose — see the note above.
  for (const book of slice) {
    await prisma.eBook.upsert({
      where: { slug: book.slug },
      update: book,
      create: book,
    });
  }

  const imported = start + slice.length;
  const done = imported >= REAL_BOOKS.length;

  if (done) {
    await finishImport();
  }

  return {
    done,
    nextOffset: imported,
    imported,
    total: REAL_BOOKS.length,
    titles: slice.map((b) => b.title),
  };
}

/** Catalog bookkeeping + cache busting, run once at the end of an import. */
async function finishImport() {
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
  revalidatePath("/bibliotheque");
  revalidatePath("/");
}
