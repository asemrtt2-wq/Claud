/**
 * Ce qui donne accès aux livres : un livre offert, l'achat à l'unité, et trois abonnements.
 *
 * La charte de contenu impose « prix clair, résiliation claire, aucune pratique
 * trompeuse ». Ce fichier est donc la seule source de vérité sur les prix et sur ce que
 * chaque formule contient : l'écran d'abonnement les affiche tels quels, sans mention en
 * petits caractères ailleurs, et rappelle où se résilie l'abonnement.
 *
 * ⚠️ Aucun paiement réel n'existe encore. Choisir une formule dans l'app ne débite rien :
 * c'est un réglage local, comme l'ancien « Pass Lumia ». Le jour où un paiement arrive, il
 * doit passer par les achats intégrés d'Apple et de Google — les deux boutiques l'imposent
 * pour du contenu numérique — et la résiliation se fera dans leurs réglages, pas ici.
 */

/**
 * Le livre offert. Le lecteur en choisit un, une seule fois, et il le garde. Le choix est
 * définitif — l'app le dit avant de valider, parce qu'un cadeau dont on découvre la limite
 * après coup est exactement la pratique trompeuse que la charte interdit.
 */
export const FREE_BOOKS = 1;

/** Le prix d'un livre acheté seul, sans abonnement. Achat définitif, pas une location. */
export const BOOK_PRICE = "4,99 €";

export const PLAN_IDS = ["plus", "premium", "extra"] as const;

export type PlanId = (typeof PLAN_IDS)[number];

export type Plan = {
  id: PlanId;
  name: string;
  /** Prix affiché, tel qu'il sera facturé. */
  price: string;
  period: string;
  /** Ce que la formule ajoute à la précédente. La première liste tout ce qu'elle contient. */
  adds: string[];
};

export const PLANS: Record<PlanId, Plan> = {
  plus: {
    id: "plus",
    name: "Lumia Plus",
    price: "9,99 €",
    period: "par mois",
    adds: ["Le catalogue complet en français"],
  },
  premium: {
    id: "premium",
    name: "Lumia Premium",
    price: "15,99 €",
    period: "par mois",
    adds: [
      "Une demande de livre par mois, et un vote sur les prochains",
      "Les nouveautés en avance",
    ],
  },
  extra: {
    id: "extra",
    name: "Lumia Extra",
    price: "19,99 €",
    period: "par mois",
    adds: [
      "Toutes les langues du catalogue",
      "Changer de langue en cours de lecture",
      "Le mode bilingue, les deux langues côte à côte",
    ],
  },
};

export const PLAN_LIST = PLAN_IDS.map((id) => PLANS[id]);

/** Rang d'une formule : une formule donne accès à tout ce que les précédentes contiennent. */
export function rankOf(plan: PlanId | null): number {
  return plan ? PLAN_IDS.indexOf(plan) : -1;
}

/** Vrai si l'abonnement en cours atteint au moins la formule demandée. */
export function hasPlan(current: PlanId | null, required: PlanId): boolean {
  return rankOf(current) >= rankOf(required);
}

/** Tout ce que contient une formule, formules précédentes comprises. */
export function everythingIn(plan: PlanId): string[] {
  return PLAN_IDS.slice(0, PLAN_IDS.indexOf(plan) + 1).flatMap((id) => PLANS[id].adds);
}

/** La formule qui débloque les langues. Le reste de l'app passe par cette constante. */
export const LANGUAGES_PLAN: PlanId = "extra";

/* ------------------------------------------------------- identifiants des boutiques */

/**
 * Les identifiants de produit à créer dans App Store Connect et dans la Google Play
 * Console, le jour où le paiement est branché.
 *
 * **Stripe ne peut pas jouer ce rôle.** Apple et Google refusent qu'une app débloque du
 * contenu numérique par un paiement extérieur au leur : une app qui le fait est rejetée à
 * la validation. Stripe reste parfait pour vendre sur un site, mais l'app aurait alors
 * besoin d'un serveur et de comptes — ce que Lumia n'a pas, et ce qui lui coûterait sa
 * promesse de fonctionner hors ligne sans compte.
 *
 * Ces identifiants ne servent encore à rien : ils fixent la convention pour que le jour où
 * les comptes développeur existent, il n'y ait plus qu'à les déclarer et à remplacer les
 * deux fonctions locales `setPlan` et `purchaseBook` de `src/store/library.tsx`.
 */
const BUNDLE = "com.lumia.app";

/** Abonnement mensuel renouvelable, un par formule. */
export const SUBSCRIPTION_PRODUCTS: Record<PlanId, string> = {
  plus: `${BUNDLE}.plus.monthly`,
  premium: `${BUNDLE}.premium.monthly`,
  extra: `${BUNDLE}.extra.monthly`,
};

/**
 * Achat définitif d'un livre seul — un produit non consommable par livre.
 *
 * ⚠️ Conséquence à connaître avant de s'engager : vendre les livres à l'unité oblige à
 * créer **un produit par livre dans chacune des deux boutiques**, soit cent douze fiches
 * pour le catalogue actuel, et deux de plus à chaque nouveau livre. C'est du travail
 * administratif récurrent, pas du code. Un abonnement seul l'éviterait entièrement.
 */
export function bookProductId(slug: string): string {
  return `${BUNDLE}.book.${slug.replace(/-/g, "_")}`;
}
