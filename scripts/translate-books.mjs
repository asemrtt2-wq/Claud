#!/usr/bin/env node
/**
 * Traduit le catalogue dans une autre langue, une fois, hors ligne.
 *
 *   npm run books:translate -- en                 # tout le catalogue
 *   npm run books:translate -- ar --book saladin  # un seul livre
 *   npm run books:translate -- es --dry-run       # rien n'est appelé : découpage et volume
 *
 * Pourquoi un script et pas une fonction de l'app : traduire au moment de la lecture
 * obligerait Lumia à appeler un serveur, ce qui casserait ses trois promesses — hors ligne,
 * sans compte, sans donnée envoyée — et ferait payer chaque lecteur. Ici la traduction est
 * faite une fois, relue, puis embarquée dans le bundle comme le catalogue français.
 *
 * Ce que le script garantit :
 *
 * - **Les slugs ne bougent jamais.** Ils identifient la progression et les favoris sur
 *   l'appareil : les traduire ferait perdre sa place au lecteur qui change de langue.
 * - **Les citations religieuses ne sont pas traduites par la machine.** Un verset du Coran
 *   ou un hadith re-traduit automatiquement ne serait la traduction reconnue de personne.
 *   Ces blocs sont mis de côté, laissés en français, et listés en fin de course pour qu'une
 *   traduction reconnue y soit placée à la main.
 * - **Les chiffres et la structure sont vérifiés.** Un chapitre dont la traduction ne
 *   contient pas exactement les mêmes nombres et les mêmes marqueurs (`##`, `>`, `-`, `!`)
 *   que l'original est retraduit ; s'il échoue encore, il est laissé en français et signalé.
 * - **Le travail est repris là où il s'est arrêté.** Chaque chapitre traduit est mis en
 *   cache : relancer après une coupure ne repaie pas ce qui est déjà fait.
 *
 * Il faut une clé dans `ANTHROPIC_API_KEY`. Le coût est par langue et payé une fois.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = join(ROOT, ".cache-traductions");
const MODEL = process.env.LUMIA_TRANSLATE_MODEL ?? "claude-sonnet-5";
/** À incrémenter quand la consigne change : le cache devient alors caduc. */
const PROMPT_VERSION = 1;

/** Les langues prévues pour le bundle. En ajouter une ici suffit à la rendre traduisible. */
const LANGUAGES = {
  en: { name: "anglais", endonym: "English", rtl: false },
  ar: { name: "arabe", endonym: "العربية", rtl: true },
  es: { name: "espagnol", endonym: "Español", rtl: false },
  de: { name: "allemand", endonym: "Deutsch", rtl: false },
  tr: { name: "turc", endonym: "Türkçe", rtl: false },
  id: { name: "indonésien", endonym: "Bahasa Indonesia", rtl: false },
};

/**
 * Une source qui désigne un texte religieux. Un bloc de citation suivi d'une telle source
 * est laissé en français : sa traduction relève d'une édition reconnue, pas d'un modèle.
 */
/*
 * Pas de `\b` final : il empêcherait « tirmidh » de reconnaître « at-Tirmidhi ». Les
 * translittérations françaises comptent autant que les anglaises — « Mouslim » et
 * « Muslim », « Boukhari » et « Bukhari ». Trop protéger laisse un passage en français,
 * ce qui est sans gravité ; pas assez produirait un verset re-traduit par une machine.
 */
const SACRED_SOURCE =
  /\b(coran|qur[’'`]?an|sourate|surah|verset|hadith|sunna|boukhari|bukhari|mouslim|muslim|tirmidh|abou\s?dawoud|abu\s?dawud|nasa[’'`]?i|ibn\s?maj|ahmad\b|bible|torah|[ée]vangile|deut[ée]ronome|l[ée]vitique|psaume|talmud|saint\s?paul|corinthiens)/i;

/* ------------------------------------------------------------------ lecture du catalogue */

/** Extrait le tableau `BOOKS` de `src/data/books.ts` sans compiler tout le projet. */
function readCatalog() {
  const src = readFileSync(join(ROOT, "src/data/books.ts"), "utf8");
  const marker = "export const BOOKS: Book[] = ";
  const start = src.indexOf(marker);
  if (start < 0) throw new Error("BOOKS introuvable dans src/data/books.ts");
  // Après le marqueur, pas avant : le premier « [ » de la ligne est celui de `Book[]`.
  const open = src.indexOf("[", start + marker.length);
  let depth = 0;
  let end = -1;
  for (let i = open; i < src.length; i += 1) {
    const c = src[i];
    if (c === '"') {
      // Sauter la chaîne, échappements compris : elle contient des crochets.
      i += 1;
      while (i < src.length && !(src[i] === '"' && src[i - 1] !== "\\")) i += 1;
      continue;
    }
    if (c === "[") depth += 1;
    else if (c === "]") {
      depth -= 1;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  if (end < 0) throw new Error("tableau BOOKS mal fermé");
  return eval(src.slice(open, end));
}

/* ------------------------------------------------- protection des citations religieuses */

/**
 * Remplace les citations religieuses par des marques, pour qu'elles traversent la
 * traduction sans être touchées. Renvoie le texte marqué et les blocs mis de côté.
 */
function shieldSacred(body) {
  const kept = [];
  const blocks = body.split(/\n\n+/).map((block) => {
    if (!block.startsWith("> ")) return block;
    const source = block.split("\n").find((line) => line.startsWith("— "));
    if (!source || !SACRED_SOURCE.test(source)) return block;
    kept.push(block);
    return `⟦CITATION-${kept.length - 1}⟧`;
  });
  return { text: blocks.join("\n\n"), kept };
}

function unshieldSacred(text, kept) {
  return text.replace(/⟦CITATION-(\d+)⟧/g, (_, i) => kept[Number(i)] ?? "");
}

/* -------------------------------------------------------------------------- vérification */

/** Les nombres d'un texte, normalisés : « 1 862 » et « 1,6 » comparables d'une langue à l'autre. */
function numbersIn(text) {
  return (text.match(/\d[\d  .,]*\d|\d/g) ?? [])
    .map((n) => n.replace(/[  .,]/g, ""))
    .filter(Boolean)
    .sort();
}

/** La suite des types de blocs : elle doit être identique dans les deux langues. */
function shapeOf(text) {
  return text
    .split(/\n\n+/)
    .map((b) => {
      if (b.startsWith("## ")) return "h";
      if (b.startsWith("> ")) return "q";
      if (b.startsWith("! ")) return "!";
      if (b.startsWith("- ")) return "l";
      if (/^⟦CITATION-\d+⟧$/.test(b)) return "c";
      return "p";
    })
    .join("");
}

/** Renvoie la liste des écarts entre l'original et sa traduction. */
function verify(source, translated) {
  const problems = [];
  const a = shapeOf(source);
  const b = shapeOf(translated);
  if (a !== b) problems.push(`structure des blocs : « ${a} » attendu, « ${b} » obtenu`);
  const na = numbersIn(source);
  const nb = numbersIn(translated);
  const missing = na.filter((n) => !nb.includes(n));
  const added = nb.filter((n) => !na.includes(n));
  if (missing.length) problems.push(`chiffres perdus : ${missing.slice(0, 6).join(", ")}`);
  if (added.length) problems.push(`chiffres inventés : ${added.slice(0, 6).join(", ")}`);
  const holes = (source.match(/⟦CITATION-\d+⟧/g) ?? []).filter((m) => !translated.includes(m));
  if (holes.length) problems.push(`citations religieuses perdues : ${holes.join(", ")}`);
  return problems;
}

/* --------------------------------------------------------------------------- appel modèle */

function instructions(lang) {
  return `Tu traduis un livre de non-fiction du français vers le ${lang.name}.

La traduction doit être fidèle, naturelle, et lisible par quelqu'un dont c'est la langue
maternelle. Le registre est celui d'un essai grand public exigeant : phrases nettes, pas de
jargon, pas d'emphase ajoutée.

Règles impératives :

1. Conserve EXACTEMENT la structure. Les blocs sont séparés par une ligne vide. Un bloc qui
   commence par "## " est un intertitre, par "> " une citation, par "- " une liste (une ligne
   par élément), par "! " un encadré d'avertissement. Ces préfixes ne se traduisent pas et ne
   se déplacent pas. Le nombre de blocs doit être identique.
2. Une ligne qui commence par "— " juste sous une citation en donne la source. Traduis le
   texte descriptif s'il y en a, mais laisse intacts les noms d'ouvrages, les numéros et les
   références.
3. Ne modifie AUCUN chiffre : nombres, pourcentages, dates, intervalles de confiance,
   numéros de chapitre. Adapte seulement le séparateur décimal aux usages de la langue si
   nécessaire. N'ajoute ni ne retire aucune donnée chiffrée.
4. Les marques de la forme ⟦CITATION-0⟧ sont des emplacements réservés. Recopie-les telles
   quelles, seules sur leur ligne. Ne les traduis pas, ne les commente pas.
5. Garde les noms propres, les titres d'ouvrages et les termes techniques dans leur forme
   usuelle en ${lang.name}. Ne translittère pas au hasard.
6. Ne résume pas, n'explique pas, n'ajoute pas de note du traducteur.

Réponds uniquement par la traduction, sans préambule.`;
}

async function callModel({ system, user, apiKey }) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 8000,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!res.ok) throw new Error(`API ${res.status} : ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  return data.content.map((part) => (part.type === "text" ? part.text : "")).join("").trim();
}

/* ------------------------------------------------------------------------------- traduction */

function cachePath(code, key) {
  return join(CACHE, code, `${key}.txt`);
}

function cacheKey(code, text) {
  return createHash("sha256").update(`${PROMPT_VERSION} ${code} ${text}`).digest("hex");
}

/**
 * Traduit un texte, en repassant une fois si la vérification échoue. Renvoie la traduction
 * et la liste des écarts encore présents (vide quand tout va bien).
 */
async function translate({ text, lang, code, apiKey, label }) {
  const key = cacheKey(code, text);
  const path = cachePath(code, key);
  if (existsSync(path)) return { text: readFileSync(path, "utf8"), problems: [], cached: true };

  const system = instructions(lang);
  let out = await callModel({ system, user: text, apiKey });
  let problems = verify(text, out);

  if (problems.length) {
    process.stderr.write(`    ↻ ${label} : ${problems[0]} — nouvelle tentative\n`);
    out = await callModel({
      system,
      user: `La traduction précédente ne respectait pas la consigne :\n${problems
        .map((p) => `- ${p}`)
        .join("\n")}\n\nRecommence en corrigeant cela.\n\n---\n\n${text}`,
      apiKey,
    });
    problems = verify(text, out);
  }

  if (!problems.length) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, out, "utf8");
  }
  return { text: out, problems, cached: false };
}

/* ------------------------------------------------------------------------------- écriture */

function toModule(code, lang, books) {
  const s = (v) => JSON.stringify(v);
  const upper = code.toUpperCase();
  const entries = books
    .map(
      (b) => `  {
    slug: ${s(b.slug)},
    title: ${s(b.title)},
    subtitle: ${s(b.subtitle)},
    description:
      ${s(b.description)},
    category: ${s(b.category)},
    tags: ${s(b.tags)},
    theme: ${s(b.theme)},
    addedAt: ${s(b.addedAt)},
    chapters: [
${b.chapters.map((c) => `      { title: ${s(c.title)}, body: ${s(c.body)} },`).join("\n")}
    ],
  },`
    )
    .join("\n");

  return `import type { Book } from "@/data/types";

/**
 * Le catalogue en ${lang.name} (${lang.endonym}).
 *
 * Fichier produit par \`npm run books:translate -- ${code}\`. Il ne se modifie pas à la main
 * sans raison : une relance du script le réécrirait. Pour corriger une phrase durablement,
 * corriger le français puis retraduire le chapitre concerné.
 *
 * Les \`slug\`, \`category\`, \`theme\` et \`addedAt\` sont ceux du catalogue français : le slug
 * identifie la progression sur l'appareil, et la catégorie est traduite à l'affichage.
 */
export const BOOKS_${upper}: Book[] = [
${entries}
];
`;
}

/* ------------------------------------------------------------------------------------ main */

const args = process.argv.slice(2);
const code = args.find((a) => !a.startsWith("--"));
const dryRun = args.includes("--dry-run");
const only = args.includes("--book") ? args[args.indexOf("--book") + 1] : null;

const lang = LANGUAGES[code];
if (!lang) {
  console.error(`Usage : npm run books:translate -- <${Object.keys(LANGUAGES).join("|")}> [--book <slug>] [--dry-run]`);
  process.exit(1);
}

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey && !dryRun) {
  console.error("ANTHROPIC_API_KEY manquante. Ajoute-la à ton environnement, ou lance --dry-run.");
  process.exit(1);
}

const catalog = readCatalog().filter((b) => !only || b.slug === only);
if (catalog.length === 0) {
  console.error(only ? `Aucun livre au slug « ${only} »` : "Catalogue vide");
  process.exit(1);
}

if (dryRun) {
  let chapters = 0;
  let words = 0;
  let sacred = 0;
  for (const book of catalog) {
    for (const chapter of book.chapters) {
      chapters += 1;
      const { kept } = shieldSacred(chapter.body);
      sacred += kept.length;
      words += `${chapter.title} ${chapter.body}`.split(/\s+/).filter(Boolean).length;
    }
  }
  console.log(`${catalog.length} livres, ${chapters} chapitres, ${words.toLocaleString("fr-FR")} mots`);
  console.log(`${sacred} citations religieuses seront laissées en français`);
  console.log(`≈ ${Math.round((words * 1.35) / 1000)}k tokens en entrée, autant en sortie`);
  console.log("\nRien n'a été appelé. Retire --dry-run et exporte ANTHROPIC_API_KEY pour traduire.");
  process.exit(0);
}

const translated = [];
const failures = [];
const sacredBlocks = [];

for (const [i, book] of catalog.entries()) {
  process.stderr.write(`\n[${i + 1}/${catalog.length}] ${book.title}\n`);

  const meta = await translate({
    text: [book.title, book.subtitle, book.description].join("\n\n"),
    lang,
    code,
    apiKey,
    label: "fiche",
  });
  const [title, subtitle, description] = meta.text.split(/\n\n+/);

  const tags = await translate({
    text: book.tags.join("\n"),
    lang,
    code,
    apiKey,
    label: "étiquettes",
  });

  const chapters = [];
  for (const [j, chapter] of book.chapters.entries()) {
    const { text, kept } = shieldSacred(chapter.body);
    const label = `${book.slug} ch${j + 1}`;
    const out = await translate({
      text: `${chapter.title}\n\n${text}`,
      lang,
      code,
      apiKey,
      label,
    });
    if (out.problems.length) {
      failures.push({ book: book.slug, chapter: j + 1, title: chapter.title, problems: out.problems });
      // Un chapitre qui ne passe pas la vérification reste en français : mieux vaut une
      // page non traduite qu'une page dont les chiffres ont bougé.
      chapters.push(chapter);
      process.stderr.write(`    ✗ ${label} laissé en français\n`);
      continue;
    }
    const [head, ...rest] = out.text.split(/\n\n+/);
    chapters.push({ title: head.trim(), body: unshieldSacred(rest.join("\n\n"), kept) });
    for (const block of kept) sacredBlocks.push({ book: book.slug, chapter: j + 1, block });
    process.stderr.write(`    ${out.cached ? "·" : "✓"} ${label}\n`);
  }

  translated.push({
    ...book,
    title: (title ?? book.title).trim(),
    subtitle: (subtitle ?? book.subtitle).trim(),
    description: (description ?? book.description).trim(),
    tags: tags.text.split("\n").map((t) => t.trim()).filter(Boolean),
    chapters,
  });
}

const out = join(ROOT, `src/data/books.${code}.ts`);
writeFileSync(out, toModule(code, lang, translated), "utf8");

console.error(`\n→ ${out}`);
console.error(`\nCitations religieuses laissées en français : ${sacredBlocks.length}`);
if (sacredBlocks.length) {
  console.error("Elles demandent une traduction reconnue, placée à la main :");
  for (const s of sacredBlocks.slice(0, 12)) {
    console.error(`  ${s.book} ch${s.chapter} — ${s.block.split("\n")[0].slice(0, 78)}…`);
  }
  if (sacredBlocks.length > 12) console.error(`  … et ${sacredBlocks.length - 12} autres`);
}
if (failures.length) {
  console.error(`\n⚠ ${failures.length} chapitre(s) laissé(s) en français faute de vérification :`);
  for (const f of failures) console.error(`  ${f.book} ch${f.chapter} — ${f.problems.join(" ; ")}`);
  process.exitCode = 1;
}
