/**
 * L'éditeur de Lumia et la date des textes juridiques.
 *
 * Apple et Google exigent, pour toute app qui vend un abonnement, des conditions
 * d'utilisation et une politique de confidentialité **lisibles dans l'app** et accessibles
 * par une adresse web depuis la fiche de la boutique. Les deux écrans `app/conditions.tsx`
 * et `app/confidentialite.tsx` les portent, et lisent leur identité ici.
 *
 * ⚠️ Ces valeurs sont des espaces réservés. Tant qu'elles le sont, les deux écrans
 * affichent un avertissement visible : des conditions signées « À COMPLÉTER » ne doivent
 * pas partir à la validation sans que personne ne s'en aperçoive.
 */

export type Publisher = {
  /** Le nom sous lequel l'app est publiée — personne physique ou société. */
  name: string;
  /** L'adresse à laquelle un lecteur peut écrire. Obligatoire pour les deux boutiques. */
  email: string;
};

/** La valeur qui marque un champ non renseigné. */
export const TO_FILL = "À COMPLÉTER";

export const PUBLISHER: Publisher = {
  name: TO_FILL,
  email: TO_FILL,
};

/** Vrai tant que l'identité de l'éditeur n'est pas renseignée. */
export const publisherMissing =
  PUBLISHER.name === TO_FILL || PUBLISHER.email === TO_FILL;

/** La date de la dernière révision des deux textes, affichée en tête. */
export const LEGAL_UPDATED = "12 septembre 2026";
