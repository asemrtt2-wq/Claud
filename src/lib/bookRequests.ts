import { prisma } from "@/lib/prisma";

/**
 * "Demander un livre" — a Premium reader describes a book they want, and Lumina writes it
 * with Claude and publishes it into the catalog.
 *
 * Two guard rails the feature is built around:
 *  - a monthly quota, so one account can't queue an unbounded amount of generation, and
 *  - a duplicate check against the real catalog, so the same book never gets written twice.
 */

/** Requests an account may start per calendar month, by Premium plan. */
export const MONTHLY_REQUEST_QUOTA: Record<string, number> = {
  monthly: 2,
  yearly: 5,
};

export const CHAPTER_COUNT = 10;

/** Words asked of the model per chapter — enough to read as a real chapter, small enough
 *  that a single generation call comfortably finishes inside a serverless request. */
export const WORDS_PER_CHAPTER = 420;

export type Outline = {
  title: string;
  subtitle: string;
  category: string;
  description: string;
  coverEmoji: string;
  chapters: { title: string; summary: string }[];
};

export type Draft = {
  outline: Outline;
  /** Finished chapter bodies, in order; length tells the client where to resume. */
  chapters: string[];
};

export function parseDraft(raw: string | null): Draft | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Draft;
    if (!parsed?.outline?.chapters?.length) return null;
    return { outline: parsed.outline, chapters: parsed.chapters ?? [] };
  } catch {
    return null;
  }
}

/** Start of the current month, used for the quota window. */
export function monthStart(now = new Date()) {
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export type QuotaInfo = {
  /** Null when the account has no active Premium subscription. */
  plan: string | null;
  limit: number;
  used: number;
  remaining: number;
};

export async function getRequestQuota(customerId: string): Promise<QuotaInfo> {
  const subscription = await prisma.subscription.findUnique({ where: { customerId } });
  const plan = subscription?.status === "active" ? subscription.plan : null;
  const limit = plan ? (MONTHLY_REQUEST_QUOTA[plan] ?? 0) : 0;

  // Failed requests don't count — the reader got nothing for them.
  const used = await prisma.bookRequest.count({
    where: {
      customerId,
      createdAt: { gte: monthStart() },
      status: { in: ["pending", "generating", "done"] },
    },
  });

  return { plan, limit, used, remaining: Math.max(0, limit - used) };
}

const STOP_WORDS = new Set([
  "le", "la", "les", "un", "une", "des", "du", "de", "d", "et", "ou", "a", "au", "aux",
  "en", "sur", "pour", "par", "dans", "avec", "sans", "ce", "cet", "cette", "ces", "qui",
  "que", "quoi", "livre", "ebook", "sur", "the", "of", "and", "to",
]);

export function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function keywords(text: string) {
  return normalize(text)
    .split(" ")
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

export type DuplicateMatch = { slug: string; title: string; score: number };

/**
 * Looks for a book in the catalog that already covers the request.
 *
 * Deliberately a keyword-overlap check over titles/subtitles/categories rather than an
 * embedding search: there is no vector store here, and the goal is only to stop the obvious
 * "write me a book about X" when X is literally already on the shelf.
 */
export async function findExistingBook(topic: string): Promise<DuplicateMatch | null> {
  const words = keywords(topic);
  if (words.length === 0) return null;

  const books = await prisma.eBook.findMany({
    select: { slug: true, title: true, subtitle: true, category: true, description: true },
  });

  let best: DuplicateMatch | null = null;
  for (const book of books) {
    const haystack = normalize(`${book.title} ${book.subtitle} ${book.category}`);
    const haystackWords = new Set(haystack.split(" "));
    const hits = words.filter((w) => haystackWords.has(w)).length;
    // Every meaningful word of the request already in the title/subtitle/category, or a
    // strong majority of at least two words, means the book effectively exists.
    const score = hits / words.length;
    const strong = score === 1 || (hits >= 2 && score >= 0.6);
    if (strong && (!best || score > best.score)) {
      best = { slug: book.slug, title: book.title, score };
    }
  }
  return best;
}

export function slugifyTitle(title: string) {
  return normalize(title).replace(/\s+/g, "-").slice(0, 70) || "livre";
}

/** A slug that isn't taken yet — generated titles can collide with the catalog. */
export async function uniqueSlug(title: string) {
  const base = slugifyTitle(title);
  for (let i = 0; i < 50; i += 1) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    const taken = await prisma.eBook.findUnique({ where: { slug: candidate } });
    if (!taken) return candidate;
  }
  return `${base}-${Date.now()}`;
}

export const COVER_THEMES = ["royal", "navy", "deep", "dark", "steel"];

export function isAiConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-5";

/**
 * One call to Claude. Mirrors how the Stripe keys are handled elsewhere in this app: with
 * nothing configured, fail loudly and clearly rather than pretending to work.
 */
async function askClaude(system: string, prompt: string, maxTokens: number): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "La génération de livres n'est pas configurée sur ce serveur (ANTHROPIC_API_KEY manquante)."
    );
  }

  const response = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Claude a renvoyé ${response.status} : ${body.slice(0, 300)}`);
  }

  const data = (await response.json()) as { content?: { type: string; text?: string }[] };
  const text = (data.content ?? [])
    .filter((block) => block.type === "text")
    .map((block) => block.text ?? "")
    .join("")
    .trim();

  if (!text) throw new Error("Claude n'a renvoyé aucun texte.");
  return text;
}

function extractJson(text: string) {
  // The model sometimes wraps JSON in a ```json fence.
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = (fenced ? fenced[1] : text).trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Réponse illisible du modèle.");
  return JSON.parse(candidate.slice(start, end + 1));
}

const SYSTEM = [
  "Tu écris des livres courts et non-fictionnels en français pour Lumina, une plateforme de",
  "lecture. Ton style est clair, concret et direct : des faits, des exemples réels et des",
  "conseils applicables, jamais de remplissage ni de formules creuses.",
  "N'invente jamais de citation, de statistique chiffrée ni d'étude que tu ne connais pas.",
].join(" ");

export async function generateOutline(topic: string, details: string): Promise<Outline> {
  const raw = await askClaude(
    SYSTEM,
    [
      `Prépare le plan d'un livre court sur : « ${topic} ».`,
      details ? `Précisions du lecteur : ${details}` : "",
      `Réponds uniquement en JSON, sans texte autour, avec ce format exact :`,
      `{"title": "...", "subtitle": "...", "category": "...", "description": "...",`,
      `"coverEmoji": "un seul emoji", "chapters": [{"title": "...", "summary": "..."}]}`,
      `- title : court et marquant, en français.`,
      `- category : un ou deux mots (ex. "Neurosciences", "Développement personnel").`,
      `- description : 2 à 3 phrases qui donnent envie de lire.`,
      `- chapters : exactement ${CHAPTER_COUNT} chapitres, avec un résumé d'une phrase chacun.`,
    ]
      .filter(Boolean)
      .join("\n"),
    2000
  );

  const parsed = extractJson(raw) as Outline;
  if (!parsed?.title || !Array.isArray(parsed.chapters) || parsed.chapters.length === 0) {
    throw new Error("Le plan renvoyé par le modèle est incomplet.");
  }
  return {
    title: String(parsed.title).slice(0, 120),
    subtitle: String(parsed.subtitle ?? "").slice(0, 160),
    category: String(parsed.category ?? "Développement personnel").slice(0, 60),
    description: String(parsed.description ?? "").slice(0, 900),
    coverEmoji: [...String(parsed.coverEmoji ?? "📘")][0] ?? "📘",
    chapters: parsed.chapters.slice(0, CHAPTER_COUNT).map((c) => ({
      title: String(c.title ?? "").slice(0, 120),
      summary: String(c.summary ?? "").slice(0, 400),
    })),
  };
}

export async function generateChapter(
  outline: Outline,
  index: number,
  previous: string[]
): Promise<string> {
  const chapter = outline.chapters[index];
  const alreadyCovered = outline.chapters
    .slice(0, index)
    .map((c, i) => `${i + 1}. ${c.title} — ${c.summary}`)
    .join("\n");

  const body = await askClaude(
    SYSTEM,
    [
      `Livre : « ${outline.title} » (${outline.category}).`,
      `Plan complet :`,
      outline.chapters.map((c, i) => `${i + 1}. ${c.title} — ${c.summary}`).join("\n"),
      alreadyCovered ? `Chapitres déjà écrits :\n${alreadyCovered}` : "",
      previous.length > 0
        ? `Fin du chapitre précédent, pour enchaîner naturellement :\n${previous[previous.length - 1].slice(-600)}`
        : "",
      "",
      `Écris maintenant le chapitre ${index + 1} : « ${chapter.title} ».`,
      `Environ ${WORDS_PER_CHAPTER} mots. Ne répète pas ce qui est déjà couvert.`,
      `Format : du texte brut, des paragraphes séparés par une ligne vide.`,
      `Tu peux utiliser "> " en début de ligne pour une citation mise en avant,`,
      `et des lignes commençant par "- " pour une liste.`,
      `N'écris pas le titre du chapitre, il est ajouté automatiquement.`,
    ]
      .filter(Boolean)
      .join("\n"),
    2500
  );

  return body.trim();
}

/** Assembles the finished draft into the reader's plain-text `content` format. */
export function buildContent(draft: Draft): string {
  return draft.outline.chapters
    .slice(0, draft.chapters.length)
    .map((chapter, i) => `Chapitre ${i + 1} — ${chapter.title}\n\n${draft.chapters[i]}`)
    .join("\n\n");
}
