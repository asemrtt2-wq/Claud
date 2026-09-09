import { useMemo } from "react";
import { BOOKS } from "@/data/books";
import { LOCALES, SOURCE_LOCALE } from "@/data/catalog";
import { useLibrary } from "@/store/library";
import type { Book } from "@/data/types";

/**
 * Le catalogue dans la langue choisie par le lecteur.
 *
 * Les écrans passent tous par ici plutôt que d'importer `BOOKS` : changer de langue ne
 * demande alors aucune modification d'écran. Les `slug` sont communs à toutes les langues,
 * si bien que la progression, les favoris et les couvertures suivent le lecteur qui change
 * de langue au milieu d'un livre.
 */
export function useCatalog() {
  const { locale } = useLibrary();

  return useMemo(() => {
    const books = LOCALES[locale]?.books ?? BOOKS;
    return {
      locale,
      books,
      rtl: LOCALES[locale]?.rtl ?? false,
      getBook: (slug: string): Book | undefined => books.find((b) => b.slug === slug),
      /** La version française du même livre : le mode bilingue en a besoin. */
      getSource: (slug: string): Book | undefined => BOOKS.find((b) => b.slug === slug),
      isTranslated: locale !== SOURCE_LOCALE,
    };
  }, [locale]);
}
