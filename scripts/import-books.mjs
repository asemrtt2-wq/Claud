#!/usr/bin/env node
/**
 * Convertit des livres exportés en HTML vers le format du catalogue de l'app.
 *
 *   npm run books:import -- <dossier-des-html> [--theme or]
 *
 * Le script lit chaque fichier `.html`, en extrait le titre, le sous-titre, le résumé et
 * les chapitres, puis écrit des entrées prêtes à coller dans `src/data/books.ts`.
 *
 * Il n'écrit rien tout seul : le catalogue reste un fichier relu et versionné, plutôt
 * qu'un dossier généré que personne ne regarde.
 *
 * Ce qui est conservé de la mise en forme d'origine (voir `src/data/types.ts` pour les
 * conventions que le lecteur interprète) :
 *   <h4>                  → `## Sous-titre`
 *   <blockquote>, .verse  → `> citation`, suivie de `— source` pour la référence
 *   <ul>, <ol>            → lignes `- `
 *   <table>               → intitulés en paragraphe, puis une ligne `- ` par rangée
 *   .box, .stat           → `## libellé` puis les paragraphes de l'encadré
 *   .box.warn             → `## libellé` puis des paragraphes `! ` (avertissement)
 *
 * Ces livres commentent leur propre couverture, en l'appelant « l'affiche » — un chapitre
 * d'ouverture « Ce que dit l'affiche », puis des renvois en plein texte. L'app affiche
 * désormais ces couvertures (voir `src/data/covers.ts`), donc ces passages sont conservés :
 * le lecteur a l'image sous les yeux. Seul le mot change, « affiche » devenant
 * « couverture », qui est ce dont il s'agit.
 *
 * Le renommage ne s'applique qu'aux livres qui ont un intertitre consacré à leur couverture.
 * Ailleurs — dans « Saladin » — « les affiches » désigne l'imagerie populaire du personnage,
 * et le mot doit rester tel quel.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const THEMES = ["nuit", "or", "encre", "vin", "foret", "sable"];

/** Un titre ou un intertitre qui annonce un commentaire de la couverture du livre. */
const COVER_HEADING = /\b(affiche|couverture)\b/i;

/**
 * « L'affiche » désigne la couverture du livre. Les deux mots sont féminins, le remplacement
 * est donc direct ; les formes verbales (« il affiche », « afficher ») ne sont pas touchées.
 */
function renameCover(text) {
  return text
    .replace(/\bl'affiche\b/g, "la couverture")
    .replace(/\bL'affiche\b/g, "La couverture")
    .replace(/\b(une|cette|aucune|Une|Cette|Aucune)\s+affiche\b/g, "$1 couverture")
    .replace(/\bton\s+affiche\b/g, "ta couverture")
    .replace(/\bTon\s+affiche\b/g, "Ta couverture")
    .replace(/\baffiche\b(?!\w)/g, "couverture");
}

function decode(text) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&(?:quot|#34);/g, '"')
    .replace(/&(?:#39|apos|rsquo);/g, "'")
    .replace(/&(?:lsquo);/g, "'")
    .replace(/&(?:ldquo);/g, "«")
    .replace(/&(?:rdquo);/g, "»")
    .replace(/&(?:hellip);/g, "…")
    .replace(/&(?:mdash);/g, "—")
    .replace(/&(?:ndash);/g, "–")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function stripTags(html) {
  return decode(
    html
      .replace(/<svg[\s\S]*?<\/svg>/gi, "")
      // Les exposants ne servent qu'aux ordinaux (« XII<sup>e</sup> ») : on colle la lettre.
      .replace(/<sup\b[^>]*>([\s\S]*?)<\/sup>/gi, "$1")
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, "")
  )
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

/** Les paragraphes d'un encadré, séparés dans le HTML par des `<br><br>`. */
function paragraphsFrom(html) {
  return html
    .split(/(?:<br\s*\/?>\s*){2,}/i)
    .map(stripTags)
    .filter(Boolean);
}

/**
 * Un tableau devient les intitulés de colonnes en paragraphe, puis une ligne `- ` par
 * rangée : le lecteur est un téléphone, une grille y serait illisible.
 */
function tableBlocks(html) {
  const rows = [...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map((tr) =>
    [...tr[1].matchAll(/<(th|td)\b[^>]*>([\s\S]*?)<\/\1>/gi)]
      .map((cell) => stripTags(cell[2]))
      .filter(Boolean)
  );
  const hasHead = /<th\b/i.test(html);
  const blocks = [];
  if (hasHead && rows[0]?.length) blocks.push(rows[0].join(" / "));
  const lines = (hasHead ? rows.slice(1) : rows)
    .filter((cells) => cells.length)
    .map((cells) => `- ${cells.join(" — ")}`);
  if (lines.length) blocks.push(lines.join("\n"));
  return blocks;
}

/** Reconstruit un chapitre en texte brut, dans l'ordre du document. */
function bodyFrom(sectionHtml) {
  const blocks = [];
  // Les blocs sont pris dans l'ordre où ils apparaissent : un `<div>` d'encadré est
  // rencontré avant les `<p>` qu'il contient, et les consomme donc lui-même.
  const re =
    /<h4\b[^>]*>([\s\S]*?)<\/h4>|<div\b[^>]*class="([^"]*)"[^>]*>([\s\S]*?)<\/div>|<(p|blockquote|ul|ol|table)\b([^>]*)>([\s\S]*?)<\/\4>/gi;
  let m;
  while ((m = re.exec(sectionHtml))) {
    if (m[1] !== undefined) {
      const heading = stripTags(m[1]);
      if (heading) blocks.push(`## ${heading}`);
      continue;
    }

    if (m[2] !== undefined) {
      const cls = m[2];
      const inner = m[3];
      if (/\bornament\b/.test(cls)) continue;
      if (/\bverse\b/.test(cls)) {
        const ref = inner.match(/<span[^>]*class="[^"]*\bref\b[^"]*"[^>]*>([\s\S]*?)<\/span>/i);
        const text = stripTags(ref ? inner.replace(ref[0], "") : inner);
        if (!text) continue;
        const source = ref ? stripTags(ref[1]) : "";
        blocks.push(source ? `> ${text}\n— ${source}` : `> ${text}`);
        continue;
      }
      if (/\b(box|stat)\b/.test(cls)) {
        const label = inner.match(
          /<span[^>]*class="[^"]*\b(?:label|big)\b[^"]*"[^>]*>([\s\S]*?)<\/span>/i
        );
        const rest = label ? inner.replace(label[0], "") : inner;
        const heading = label ? stripTags(label[1]) : "";
        if (heading) blocks.push(`## ${heading}`);
        const inners = [...rest.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map((p) => p[1]);
        const paragraphs = (inners.length ? inners : [rest]).flatMap(paragraphsFrom);
        // « ! » en début de ligne : le lecteur en fait un encadré d'avertissement.
        const prefix = /\bwarn\b/.test(cls) ? "! " : "";
        for (const p of paragraphs) blocks.push(prefix + p);
        continue;
      }
      continue;
    }

    const tag = m[4].toLowerCase();
    const attrs = m[5] ?? "";
    const inner = m[6];
    if (tag === "p") {
      if (/class="[^"]*\bornament\b/i.test(attrs)) continue;
      const text = stripTags(inner);
      if (text) blocks.push(text);
    } else if (tag === "blockquote") {
      const text = stripTags(inner);
      // « > » en début de bloc : le lecteur en fait une citation encadrée.
      if (text) blocks.push(`> ${text}`);
    } else if (tag === "table") {
      blocks.push(...tableBlocks(inner));
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
  const sections = [
    ...raw.matchAll(/<section[^>]*class="[^"]*chapter[^"]*"[^>]*>([\s\S]*?)<\/section>/gi),
  ];
  for (const section of sections) {
    const html = section[1];
    const h3 = html.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
    const name = h3 ? stripTags(h3[1]) : "";
    // Le titre du chapitre ne doit pas se retrouver aussi dans le corps.
    const withoutHeading = h3 ? html.replace(h3[0], "") : html;
    chapters.push({
      title: name || `Chapitre ${chapters.length + 1}`,
      body: bodyFrom(withoutHeading),
    });
  }

  /* Ce livre commente-t-il sa propre couverture ? Si oui, « affiche » y désigne cette
     couverture, et le mot est remplacé. Sinon — « Saladin » — on n'y touche pas. */
  const commentsItsCover = chapters.some(
    (c) => COVER_HEADING.test(c.title) || c.body.split("\n\n").some((b) => b.startsWith("## ") && COVER_HEADING.test(b))
  );
  if (commentsItsCover) {
    for (const chapter of chapters) {
      chapter.title = renameCover(chapter.title);
      chapter.body = renameCover(chapter.body);
    }
  }

  // Le résumé sert de point de départ : il se réécrit à la main avant publication, parce
  // qu'un chapô de chapitre n'est pas une quatrième de couverture.
  const description =
    chapters[0]?.body
      .split("\n\n")
      .find((b) => b.length > 80 && !/^(##|>|-|!|—)/.test(b)) ?? "";

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
console.error("puis renseigne `category`, `tags` et réécris `description`.");
