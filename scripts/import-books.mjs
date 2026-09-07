#!/usr/bin/env node
/**
 * Convertit des livres exportés en HTML vers le format du catalogue de l'app.
 *
 *   npm run books:import -- <dossier-des-html> [--theme or]
 *
 * Le script lit chaque fichier `.html`, en extrait le titre, le sous-titre, le résumé et
 * les chapitres, puis affiche des entrées prêtes à coller dans `src/data/books.ts`.
 *
 * Il n'écrit rien tout seul : le catalogue reste un fichier relu et versionné, plutôt
 * qu'un dossier généré que personne ne regarde.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const THEMES = ["nuit", "or", "encre", "vin", "foret", "sable"];

function stripTags(html) {
  return html
    .replace(/<svg[\s\S]*?<\/svg>/gi, "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&(?:quot|#34);/g, '"')
    .replace(/&(?:#39|apos|rsquo);/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

/** Reconstruit un chapitre en texte brut, avec les conventions du lecteur. */
function bodyFrom(sectionHtml) {
  const blocks = [];
  const re = /<(p|blockquote|ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = re.exec(sectionHtml))) {
    const tag = m[1].toLowerCase();
    const inner = m[2];
    if (tag === "p") {
      const text = stripTags(inner);
      if (text) blocks.push(text);
    } else if (tag === "blockquote") {
      const text = stripTags(inner);
      // « > » en début de bloc : le lecteur en fait une citation encadrée.
      if (text) blocks.push(`> ${text}`);
    } else {
      const items = [...inner.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)]
        .map((li) => stripTags(li[1]))
        .filter(Boolean);
      // « - » en début de ligne : le lecteur en fait une liste à puces.
      if (items.length) blocks.push(items.map((i) => `- ${i}`).join("\n"));
    }
  }
  return blocks.join("\n\n");
}

function extract(path) {
  const raw = readFileSync(path, "utf8");

  const titleTag = raw.match(/<title>([\s\S]*?)<\/title>/i);
  let full = titleTag ? stripTags(titleTag[1]) : basename(path, ".html");
  full = full.replace(/\s*[—-]\s*(iBook|eBook)$/i, "").trim();
  const [title, subtitleRaw = ""] = full.split("—").map((s) => s.trim());
  const subtitle = /^(ibook|ebook)$/i.test(subtitleRaw) ? "" : subtitleRaw;

  const chapters = [];
  const sections = [...raw.matchAll(/<section[^>]*class="[^"]*chapter[^"]*"[^>]*>([\s\S]*?)<\/section>/gi)];
  for (const section of sections) {
    const html = section[1];
    const h3 = html.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
    const name = h3 ? stripTags(h3[1]) : "";
    // Le titre du chapitre ne doit pas se retrouver aussi dans le corps.
    const withoutHeading = h3 ? html.replace(h3[0], "") : html;
    const body = bodyFrom(withoutHeading);
    if (name || body) chapters.push({ title: name || `Chapitre ${chapters.length + 1}`, body });
  }

  const lede = raw.match(/<p[^>]*class="[^"]*lede[^"]*"[^>]*>([\s\S]*?)<\/p>/i);
  const description =
    (lede ? stripTags(lede[1]) : "") ||
    chapters[0]?.body.split("\n\n").find((b) => b.length > 80 && !b.startsWith(">")) ||
    "";

  return { title, subtitle, description, chapters };
}

function toEntry(book, theme, addedAt) {
  const s = (v) => JSON.stringify(v);
  const chapters = book.chapters
    .map((c) => `    { title: ${s(c.title)}, body: ${s(c.body)} },`)
    .join("\n");
  return `  {
    slug: ${s(slugify(book.title))},
    title: ${s(book.title)},
    subtitle: ${s(book.subtitle)},
    description: ${s(book.description)},
    category: "Savoirs essentiels",
    tags: [],
    theme: ${s(theme)},
    addedAt: ${s(addedAt)},
    chapters: [
${chapters}
    ],
  },`;
}

const args = process.argv.slice(2);
const dir = args.find((a) => !a.startsWith("--"));
const themeArg = args.includes("--theme") ? args[args.indexOf("--theme") + 1] : null;

if (!dir) {
  console.error("Usage : npm run books:import -- <dossier-des-html> [--theme or]");
  process.exit(1);
}

const files = readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".html"));
if (files.length === 0) {
  console.error(`Aucun fichier .html dans ${dir}`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const entries = [];
for (const [i, file] of files.entries()) {
  const book = extract(join(dir, file));
  const theme = themeArg ?? THEMES[i % THEMES.length];
  entries.push(toEntry(book, theme, today));
  console.error(
    `✓ ${book.title.slice(0, 40).padEnd(42)} ${String(book.chapters.length).padStart(2)} chapitres`
  );
}

const out = join(dir, "books-a-coller.ts");
writeFileSync(out, entries.join("\n") + "\n", "utf8");
console.error(`\n→ ${out}`);
console.error("Colle ces entrées dans le tableau BOOKS de src/data/books.ts,");
console.error("puis renseigne `category` et `tags` pour chaque livre.");
