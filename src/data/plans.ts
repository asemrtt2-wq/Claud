/**
 * Les trois abonnements Lumia, tels que le propriétaire du projet les a définis.
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
