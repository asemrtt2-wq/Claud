import type { ImageSourcePropType } from "react-native";

/**
 * Les couvertures dessinées par l'auteur des livres, embarquées dans le bundle.
 *
 * Ce fichier est généré : une entrée par livre du catalogue, dans le même ordre. Metro exige
 * un chemin littéral dans `require` — d'où une table écrite en clair plutôt qu'un chemin
 * construit à partir du slug.
 *
 * Les images sont ramenées à 720 px de large en JPEG, soit environ 4,7 Mo pour tout le
 * catalogue : une couverture ne dépasse jamais 200 pt à l'écran, même sur la fiche livre.
 *
 * Un livre sans entrée ici garde la couverture composée en code par `BookCover`.
 */
export const COVERS: Record<string, ImageSourcePropType> = {
  "saladin": require("../../assets/couvertures/saladin.jpg"),
  "napoleon": require("../../assets/couvertures/napoleon.jpg"),
  "niccolo-machiavelli": require("../../assets/couvertures/niccolo-machiavelli.jpg"),
  "nikola-tesla": require("../../assets/couvertures/nikola-tesla.jpg"),
  "l-histoire-de-la-medecine": require("../../assets/couvertures/l-histoire-de-la-medecine.jpg"),
  "les-grandes-inventions": require("../../assets/couvertures/les-grandes-inventions.jpg"),
  "comprendre-la-science": require("../../assets/couvertures/comprendre-la-science.jpg"),
  "les-lois-de-l-univers": require("../../assets/couvertures/les-lois-de-l-univers.jpg"),
  "explorer-le-savoir": require("../../assets/couvertures/explorer-le-savoir.jpg"),
  "le-monde-de-la-science": require("../../assets/couvertures/le-monde-de-la-science.jpg"),
  "la-molecule-improbable": require("../../assets/couvertures/la-molecule-improbable.jpg"),
  "le-corbeau": require("../../assets/couvertures/le-corbeau.jpg"),
  "ton-cerveau-apres-l-ecran": require("../../assets/couvertures/ton-cerveau-apres-l-ecran.jpg"),
  "le-mental-en-desordre": require("../../assets/couvertures/le-mental-en-desordre.jpg"),
  "toi-vs-toi": require("../../assets/couvertures/toi-vs-toi.jpg"),
  "recuperer": require("../../assets/couvertures/recuperer.jpg"),
  "l-intelligence-sociale": require("../../assets/couvertures/l-intelligence-sociale.jpg"),
  "les-manipulations-invisibles": require("../../assets/couvertures/les-manipulations-invisibles.jpg"),
  "fake-news": require("../../assets/couvertures/fake-news.jpg"),
  "l-argent-change-t-il-l-homme": require("../../assets/couvertures/l-argent-change-t-il-l-homme.jpg"),
  "le-prix-du-silence": require("../../assets/couvertures/le-prix-du-silence.jpg"),
  "la-science-de-la-performance": require("../../assets/couvertures/la-science-de-la-performance.jpg"),
  "football": require("../../assets/couvertures/football.jpg"),
  "l-eau-et-le-corps": require("../../assets/couvertures/l-eau-et-le-corps.jpg"),
  "la-soif-du-monde": require("../../assets/couvertures/la-soif-du-monde.jpg"),
  "le-sacre-liquide": require("../../assets/couvertures/le-sacre-liquide.jpg"),
  "le-voile": require("../../assets/couvertures/le-voile.jpg"),
  "allah-est-avec-toi": require("../../assets/couvertures/allah-est-avec-toi.jpg"),
};

/**
 * Proportion hauteur / largeur du cadre des couvertures. C'est celle de 26 des 28 images
 * fournies ; les deux autres, plus carrées, sont centrées dedans sans être rognées.
 */
export const COVER_RATIO = 1.7764;

export function getCover(slug: string): ImageSourcePropType | undefined {
  return COVERS[slug];
}
