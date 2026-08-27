// Consolidates the many specific per-book `category` values (now ~40+ after several
// real-book import batches) into a smaller set of broad groups for the bibliothèque's
// filter pills and section headers. Each book's own real, specific category is still
// shown on its card and detail page — this grouping only simplifies navigation.
// Any category not explicitly mapped falls back to itself, so new categories never
// silently disappear from the filter bar.

const GROUPS: Record<string, string> = {
  "Développement personnel": "Développement personnel",
  "Développement personnel & Psychologie": "Développement personnel",
  "Développement personnel & psychologie": "Développement personnel",
  "Développement personnel & attention": "Développement personnel",
  "Marketing & stratégie personnelle": "Développement personnel",
  "Productivité": "Développement personnel",
  "Productivité & Attention": "Développement personnel",
  "Productivité & vie professionnelle": "Développement personnel",
  "Négociation & psychologie sociale": "Développement personnel",

  "Psychologie & Performance": "Psychologie",
  "Psychologie & Sport de combat": "Psychologie",
  "Relations & Sciences humaines": "Psychologie",
  "Finance personnelle & psychologie": "Psychologie",

  "Philosophie": "Philosophie",
  "Philosophie & Histoire": "Philosophie",
  "Philosophie & Discipline": "Philosophie",
  "Histoire & philosophie politique": "Philosophie",
  "Technologie & philosophie": "Philosophie",

  "Histoire & récit": "Histoire & Société",
  "Histoire & Société": "Histoire & Société",
  "Histoire antique": "Histoire & Société",
  "Sport & Société": "Histoire & Société",
  "Culture & nostalgie": "Histoire & Société",
  "Culture & spiritualité": "Histoire & Société",
  "Littérature & Idées": "Histoire & Société",

  "Biographie & Philosophie": "Biographies",
  "Biographie & Sport": "Biographies",
  "Biographie & Histoire": "Biographies",
  "Biographie & Histoire de l'art": "Biographies",

  "Neurosciences": "Sciences & Santé",
  "Biologie": "Sciences & Santé",
  "Sciences & Créativité": "Sciences & Santé",
  "Sciences & Santé": "Sciences & Santé",
  "Santé & Mouvement": "Sciences & Santé",
  "Histoire des sciences": "Sciences & Santé",
  "Animaux & Sciences": "Sciences & Santé",
  "Santé & physiologie": "Sciences & Santé",
  "Santé & vie professionnelle": "Sciences & Santé",

  "Nature & Conservation": "Nature & Animaux",
  "Nature & Biologie": "Nature & Animaux",

  "Fitness & Santé": "Bien-être & Fitness",
  "Bien-être": "Bien-être & Fitness",
  "Bien-Être & Méditation": "Bien-être & Fitness",
  "Sport & musculation": "Bien-être & Fitness",

  "Cuisine & Nutrition": "Cuisine & Voyage",
  "Aventure & Voyage": "Cuisine & Voyage",
};

export function getCategoryGroup(category: string): string {
  return GROUPS[category] ?? category;
}
