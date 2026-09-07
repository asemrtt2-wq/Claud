/** Les six ambiances de couverture disponibles (voir `BookCover`). */
export type CoverTheme = "nuit" | "or" | "encre" | "vin" | "foret" | "sable";

export type Chapter = {
  /** Titre du chapitre, sans le mot « Chapitre ». */
  title: string;
  /** Corps du chapitre. Deux sauts de ligne séparent les paragraphes. */
  body: string;
};

export type Book = {
  /** Identifiant stable, utilisé dans les URL de l'app et pour la progression. */
  slug: string;
  title: string;
  subtitle: string;
  /** Résumé affiché sur la fiche livre. */
  description: string;
  category: Category;
  /** Étiquettes affichées sous le titre, comme sur la maquette. */
  tags: string[];
  theme: CoverTheme;
  chapters: Chapter[];
  /** Série et numéro de tome, quand le livre en fait partie. */
  series?: { name: string; volume: number };
  /** Réservé aux abonnés Pass Lumia. */
  premium?: boolean;
  /** Date d'ajout au catalogue (ISO), pour la rangée « Nouveautés ». */
  addedAt: string;
};

/** Les catégories de la maquette, dans l'ordre de l'écran d'accueil. */
export const CATEGORIES = [
  "Histoire",
  "Philosophie",
  "Développement personnel",
  "Sciences",
  "Culture",
  "Grands personnages",
  "Savoirs essentiels",
] as const;

export type Category = (typeof CATEGORIES)[number];

/**
 * Icône de chaque catégorie (jeu Ionicons). Aucune n'est figurative : ni personnage,
 * ni visage, ni animal — la règle qui gouverne toute l'imagerie de Lumia.
 */
export const CATEGORY_ICONS: Record<Category, string> = {
  Histoire: "book-outline",
  Philosophie: "business-outline",
  "Développement personnel": "bulb-outline",
  Sciences: "globe-outline",
  Culture: "leaf-outline",
  "Grands personnages": "star-outline",
  "Savoirs essentiels": "sparkles-outline",
};
