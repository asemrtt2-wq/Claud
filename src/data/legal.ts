/**
 * L'éditeur de Lumia, son hébergeur, et la date des textes juridiques.
 *
 * Apple et Google exigent, pour toute app qui vend un abonnement, des conditions
 * d'utilisation et une politique de confidentialité **lisibles dans l'app** et accessibles
 * par une adresse web depuis la fiche de la boutique. Les deux écrans `app/conditions.tsx`
 * et `app/confidentialite.tsx` les portent, et lisent leur identité ici.
 *
 * `scripts/pages-legales.mjs` lit ce fichier lui aussi, pour les pages du site : une seule
 * source, donc pas de divergence possible entre l'app et le site.
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
  name: "Asem",
  email: "cameradaction0@gmail.com",
};

/**
 * Vrai tant que l'identité de l'éditeur n'est pas renseignée. Les deux écrans juridiques
 * affichent alors un avertissement visible : des conditions signées « À COMPLÉTER » ne
 * doivent pas partir à la validation sans que personne ne s'en aperçoive.
 */
export const publisherMissing = PUBLISHER.name === TO_FILL || PUBLISHER.email === TO_FILL;

/**
 * L'hébergeur du site — celui qui publie les pages légales, pas l'app.
 *
 * La loi française impose de le nommer publiquement. C'est aussi lui qui rend l'éditeur
 * joignable par la voie légale quand celui-ci, personne physique non professionnelle, ne
 * publie pas son adresse personnelle : son identité est alors détenue par l'hébergeur.
 *
 * ⚠️ Ces coordonnées sont à revérifier sur les mentions légales de l'hébergeur lui-même,
 * qui font foi et peuvent changer. Elles ne servent qu'au site : l'app n'est hébergée nulle
 * part, ses livres sont dans le bundle.
 */
export const HOST = {
  name: "Hostinger International Ltd.",
  address: "61 Lordou Vironos Street, 6023 Larnaca, Chypre",
  /** Vide tant qu'elle n'a pas été relevée chez l'hébergeur — mieux vaut rien qu'inventé. */
  phone: "",
};

/** La date de la dernière révision des deux textes, affichée en tête. */
export const LEGAL_UPDATED = "12 septembre 2026";
