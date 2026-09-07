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

  await seedStarterFaq();

  revalidatePath("/admin");
  revalidatePath("/admin/catalogs");
  revalidatePath("/bibliotheque");
  revalidatePath("/faq");
  revalidatePath("/");
}

/**
 * Puts a first set of answers on /faq so the page isn't empty on a fresh deploy.
 *
 * Runs **only when the FAQ table is empty** — unlike the catalog, these rows are meant to be
 * edited from /admin/faq, and re-seeding them on every import would silently overwrite the
 * admin's own wording. Every answer here describes behaviour this app really has.
 */
async function seedStarterFaq() {
  const existing = await prisma.faqItem.count();
  if (existing > 0) return;

  const items: { question: string; answer: string; category: string }[] = [
    {
      category: "Lecture",
      question: "Faut-il installer une application ?",
      answer:
        "Non. Lumia se lit directement depuis ton navigateur, sur téléphone, tablette ou ordinateur. Ta progression, tes favoris et tes surlignages suivent ton profil d'un appareil à l'autre.",
    },
    {
      category: "Lecture",
      question: "Puis-je lire hors ligne ?",
      answer:
        "Pas pour le moment. Lumia est un site web : la lecture nécessite une connexion. Nous préférons le dire clairement plutôt que d'afficher un bouton de téléchargement qui ne fonctionnerait pas.",
    },
    {
      category: "Lecture",
      question: "Puis-je écouter les livres ?",
      answer:
        "Oui, via le menu ••• du lecteur : « Écouter » lit la page à voix haute avec la synthèse vocale de ton navigateur, avec le mot en cours surligné. La qualité dépend des voix installées sur ton appareil — ce ne sont pas des narrations enregistrées.",
    },
    {
      category: "Abonnement",
      question: "Quelle différence entre acheter un livre et passer Premium ?",
      answer:
        "Un achat te donne accès à ce livre-là, pour toujours. Premium ouvre tout le catalogue tant que l'abonnement est actif, sur tous les profils du compte, et te permet de faire écrire des livres sur demande chaque mois.",
    },
    {
      category: "Abonnement",
      question: "Comment fonctionnent les livres écrits sur demande ?",
      answer:
        "Depuis ton profil, tu décris le livre qui te manque. Lumia l'écrit chapitre par chapitre et le publie dans le catalogue. L'offre mensuelle en donne 2 par mois, l'offre annuelle 5. Si un livre proche existe déjà, on te l'indique et la demande n'est pas décomptée.",
    },
    {
      category: "Abonnement",
      question: "Puis-je résilier quand je veux ?",
      answer:
        "Oui, les deux formules sont résiliables à tout moment. Tu gardes l'accès jusqu'à la fin de la période déjà payée, et les livres achetés à l'unité te restent acquis.",
    },
    {
      category: "Profils",
      question: "Combien de profils puis-je créer ?",
      answer:
        "Autant que tu veux, adultes comme enfants. Chaque profil a ses propres favoris, sa progression, ses collections et ses objectifs — rien n'est partagé entre eux. Les achats et l'abonnement, eux, valent pour tout le compte.",
    },
    {
      category: "Profils",
      question: "Comment fonctionne le mode enfant ?",
      answer:
        "Un profil de type enfant ne voit qu'un catalogue dédié, avec un lecteur adapté (lecture à voix haute, mascotte) et une limite de temps de lecture quotidienne. Cette limite s'applique au lecteur Lumia : un site web ne peut pas verrouiller l'écran du téléphone.",
    },
    {
      category: "Profils",
      question: "À quoi sert le code PIN d'un profil ?",
      answer:
        "Il empêche d'ouvrir un profil par erreur ou par curiosité depuis l'appareil de la famille. Ce n'est pas une protection de sécurité forte : il garde un enfant hors du profil parent, rien de plus.",
    },
  ];

  await prisma.faqItem.createMany({
    data: items.map((item, index) => ({ ...item, position: index + 1, published: true })),
  });
}
