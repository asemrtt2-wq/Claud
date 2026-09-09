import type { Book } from "@/data/types";
import { BOOKS } from "@/data/books";

/**
 * Les langues du catalogue. Fichier généré par `npm run catalog:index` à partir des
 * `src/data/books.<code>.ts` présents : à relancer après chaque traduction.
 *
 * Le français est la langue source, toujours présente. Les autres sont produites par
 * `npm run books:translate` et relues avant d'être publiées.
 */
export type LocaleCode = "fr";

export type Locale = {
  /** Le nom de la langue dans cette langue, seul intitulé qu'un lecteur reconnaît à coup sûr. */
  endonym: string;
  /** Vrai pour une écriture de droite à gauche : l'app bascule sa mise en page. */
  rtl: boolean;
  books: Book[];
};

export const LOCALES: Record<LocaleCode, Locale> = {
  fr: { endonym: "Français", rtl: false, books: BOOKS },
};

export const LOCALE_CODES = Object.keys(LOCALES) as LocaleCode[];

/** La langue source. Tout slug, toute catégorie et tout thème viennent d'elle. */
export const SOURCE_LOCALE: LocaleCode = "fr";
