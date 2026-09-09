#!/usr/bin/env node
/**
 * Écrit `src/data/catalog.ts` : la liste des langues effectivement disponibles.
 *
 *   npm run catalog:index
 *
 * Metro exige des imports littéraux — on ne peut pas construire un chemin de module à
 * partir d'un code de langue. Ce fichier est donc généré à partir des `books.<code>.ts`
 * présents sur le disque, et il faut le relancer après chaque nouvelle traduction.
 */
import { readdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Nom de chaque langue dans sa propre langue, et sens de lecture. */
const LANGUAGES = {
  fr: { endonym: "Français", rtl: false },
  en: { endonym: "English", rtl: false },
  ar: { endonym: "العربية", rtl: true },
  es: { endonym: "Español", rtl: false },
  de: { endonym: "Deutsch", rtl: false },
  tr: { endonym: "Türkçe", rtl: false },
  id: { endonym: "Bahasa Indonesia", rtl: false },
};

const translated = readdirSync(join(ROOT, "src/data"))
  .map((f) => f.match(/^books\.([a-z]{2})\.ts$/)?.[1])
  .filter((code) => code && LANGUAGES[code])
  .sort();

const codes = ["fr", ...translated];
const unknown = translated.filter((c) => !LANGUAGES[c]);
if (unknown.length) {
  console.error(`Langues inconnues, à déclarer dans ce script : ${unknown.join(", ")}`);
  process.exit(1);
}

const imports = [
  'import type { Book } from "@/data/types";',
  'import { BOOKS } from "@/data/books";',
  ...translated.map((c) => `import { BOOKS_${c.toUpperCase()} } from "@/data/books.${c}";`),
].join("\n");

const entries = codes
  .map((c) => {
    const source = c === "fr" ? "BOOKS" : `BOOKS_${c.toUpperCase()}`;
    return `  ${c}: { endonym: ${JSON.stringify(LANGUAGES[c].endonym)}, rtl: ${LANGUAGES[c].rtl}, books: ${source} },`;
  })
  .join("\n");

const out = `${imports}

/**
 * Les langues du catalogue. Fichier généré par \`npm run catalog:index\` à partir des
 * \`src/data/books.<code>.ts\` présents : à relancer après chaque traduction.
 *
 * Le français est la langue source, toujours présente. Les autres sont produites par
 * \`npm run books:translate\` et relues avant d'être publiées.
 */
export type LocaleCode = ${codes.map((c) => JSON.stringify(c)).join(" | ")};

export type Locale = {
  /** Le nom de la langue dans cette langue, seul intitulé qu'un lecteur reconnaît à coup sûr. */
  endonym: string;
  /** Vrai pour une écriture de droite à gauche : l'app bascule sa mise en page. */
  rtl: boolean;
  books: Book[];
};

export const LOCALES: Record<LocaleCode, Locale> = {
${entries}
};

export const LOCALE_CODES = Object.keys(LOCALES) as LocaleCode[];

/** La langue source. Tout slug, toute catégorie et tout thème viennent d'elle. */
export const SOURCE_LOCALE: LocaleCode = "fr";
`;

writeFileSync(join(ROOT, "src/data/catalog.ts"), out, "utf8");
console.log(`${codes.length} langue(s) : ${codes.join(", ")}`);
