import type { Book } from "@/data/types";

/**
 * Le catalogue de l'app.
 *
 * Ce fichier est volontairement le seul endroit où vivent les livres : pour en ajouter un,
 * on ajoute une entrée ici — ou on lance `npm run books:import`, qui convertit un export
 * HTML de livre en entrée de ce tableau (voir `scripts/import-books.mjs`).
 *
 * Les deux livres ci-dessous sont des exemples courts, écrits pour que les écrans aient
 * quelque chose de réel à afficher. Ils sont faits pour être remplacés.
 *
 * ⚠️ Avant d'ajouter un livre ici, le relire à l'aune de la **charte de contenu** (tableau
 * complet dans CLAUDE.md) : pas de nudité ni de contenu suggestif, pas de promotion de
 * l'alcool, des jeux d'argent, de l'occultisme ou du riba, pas de vulgarité ni de violence
 * glorifiée, des sources fiables en histoire, science et santé, et le respect de chaque
 * religion. Aucune de ces règles n'est vérifiable par le code : elles se tiennent à la
 * relecture.
 */
export const BOOKS: Book[] = [
  {
    slug: "l-art-de-la-discipline",
    title: "L'art de la discipline",
    subtitle: "Les clés pour construire une vie plus forte, plus sereine et plus accomplie.",
    description:
      "La discipline est la clé qui ouvre la porte de la liberté. Ce livre vous guide pas à pas pour comprendre, appliquer et ancrer la discipline dans votre quotidien, à travers des principes simples et puissants.",
    category: "Développement personnel",
    tags: ["Développement personnel", "Mentalité", "Habitudes"],
    theme: "nuit",
    addedAt: "2026-09-01",
    chapters: [
      {
        title: "Pourquoi la discipline change tout",
        body: `La discipline n'est pas une contrainte, mais un acte de liberté. Elle permet de faire aujourd'hui ce que la plupart ne veulent pas faire, pour vivre demain ce que la plupart ne pourront pas vivre.

On imagine souvent la discipline comme une punition que l'on s'inflige. C'est l'inverse. Sans elle, ce sont les humeurs qui décident : on lit quand on en a envie, on se lève quand le corps le veut bien, on abandonne quand l'effort devient réel. Une vie gouvernée par l'humeur n'est pas une vie libre, c'est une vie subie.

> Ce que tu fais aujourd'hui construit la personne que tu deviendras demain.

La discipline commence petit. Une page par jour vaut mieux qu'un livre entier promis et jamais ouvert. La régularité bat l'intensité, parce qu'elle survit aux mauvais jours — et il y aura des mauvais jours.

Le premier pas n'est donc pas de vouloir plus. C'est de vouloir moins, mais tous les jours.`,
      },
      {
        title: "Le piège de la motivation",
        body: `La motivation est une ressource qui s'épuise. Elle est forte le lundi et disparaît le jeudi soir. Construire quoi que ce soit sur elle, c'est bâtir sur du sable.

Ce qui tient, c'est le système : l'heure fixée, le lieu préparé, la tâche découpée assez petit pour qu'on ne puisse pas la refuser. Quand la décision est prise à l'avance, il ne reste plus qu'à exécuter.

- Décide de l'heure avant d'en avoir envie.
- Prépare le lieu la veille.
- Réduis la tâche jusqu'à ce qu'elle paraisse trop facile.
- Recommence demain, surtout après un échec.

Un homme n'est pas fait d'une décision : il est fait de la somme de ses répétitions. Ce que tu fais aujourd'hui est insignifiant. Ce que tu fais tous les jours est irrésistible.`,
      },
      {
        title: "Tenir quand personne ne regarde",
        body: `L'épreuve véritable n'arrive pas les jours de grande forme. Elle arrive le soir où personne n'attend rien de toi, où rien ne serait perdu si tu t'arrêtais.

C'est là que se joue la discipline. Non pas dans l'exploit visible, mais dans la fidélité invisible à une promesse que tu t'es faite. Personne ne te félicitera pour cette page lue à vingt-deux heures. Elle compte pourtant plus que les autres.

> La constance dans l'ombre prépare la solidité en pleine lumière.

Garde une trace. Une croix sur un calendrier suffit. Non pour te juger, mais pour voir la chaîne se former — et pour hésiter à la briser.`,
      },
    ],
  },
  {
    slug: "la-patience-comme-force",
    title: "La patience comme force",
    subtitle: "Ce que l'on gagne à ne pas se précipiter.",
    description:
      "Nous confondons vitesse et progrès. Ce livre court explore la patience non comme une résignation, mais comme une discipline active : celle qui permet de durer là où d'autres s'épuisent.",
    category: "Philosophie",
    tags: ["Philosophie", "Sagesse", "Mentalité"],
    theme: "or",
    addedAt: "2026-09-04",
    premium: true,
    chapters: [
      {
        title: "L'illusion de la vitesse",
        body: `Nous vivons dans un monde qui récompense la vitesse et méprise l'attente. Pourtant, presque tout ce qui compte demande du temps : une compétence, une amitié, un caractère.

La précipitation donne le sentiment d'avancer. Elle fait rarement avancer. On confond l'agitation avec le mouvement, et le mouvement avec le progrès.

> Ce qui pousse vite meurt vite. Ce qui pousse lentement tient debout dans la tempête.

La patience n'est pas l'absence d'action. C'est l'action maintenue sans la récompense immédiate.`,
      },
      {
        title: "Attendre n'est pas subir",
        body: `Il y a deux patiences. Celle qui subit, les bras ballants, en espérant que les choses changent seules. Et celle qui travaille, sans exiger de résultat aujourd'hui.

La première est une lenteur. La seconde est une force.

- Continue quand le résultat ne se voit pas encore.
- Refuse le raccourci qui coûtera plus cher plus tard.
- Mesure en saisons, pas en journées.

Le plateau est le moment où la plupart abandonnent : le travail continue, les progrès deviennent invisibles. C'est précisément là que le corps consolide et que la technique s'affine. Rien ne se voit, tout se prépare.`,
      },
    ],
  },
];

export function getBook(slug: string): Book | undefined {
  return BOOKS.find((book) => book.slug === slug);
}

/** Nombre de pages estimé, à ~1 400 caractères par page d'écran. */
export function estimatePages(book: Book): number {
  const chars = book.chapters.reduce((sum, c) => sum + c.title.length + c.body.length, 0);
  return Math.max(1, Math.round(chars / 1400));
}

/** Durée de lecture estimée en minutes, à 200 mots par minute. */
export function estimateMinutes(book: Book): number {
  const words = book.chapters.reduce(
    (sum, c) => sum + c.body.split(/\s+/).filter(Boolean).length,
    0
  );
  return Math.max(1, Math.round(words / 200));
}
