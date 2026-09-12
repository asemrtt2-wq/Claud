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
  "leonardo-da-vinci": require("../../assets/couvertures/leonardo-da-vinci.jpg"),
  "hannibal-barca": require("../../assets/couvertures/hannibal-barca.jpg"),
  "albert-einstein": require("../../assets/couvertures/albert-einstein.jpg"),
  "gengis-khan": require("../../assets/couvertures/gengis-khan.jpg"),
  "l-histoire-de-la-medecine": require("../../assets/couvertures/l-histoire-de-la-medecine.jpg"),
  "les-grandes-inventions": require("../../assets/couvertures/les-grandes-inventions.jpg"),
  "les-plus-grandes-bibliotheques-de-l-histoire": require("../../assets/couvertures/les-plus-grandes-bibliotheques-de-l-histoire.jpg"),
  "l-histoire-du-papier": require("../../assets/couvertures/l-histoire-du-papier.jpg"),
  "la-route-de-la-soie": require("../../assets/couvertures/la-route-de-la-soie.jpg"),
  "l-histoire-de-l-argent": require("../../assets/couvertures/l-histoire-de-l-argent.jpg"),
  "comprendre-la-science": require("../../assets/couvertures/comprendre-la-science.jpg"),
  "les-lois-de-l-univers": require("../../assets/couvertures/les-lois-de-l-univers.jpg"),
  "explorer-le-savoir": require("../../assets/couvertures/explorer-le-savoir.jpg"),
  "les-bienfaits-de-la-montagne": require("../../assets/couvertures/les-bienfaits-de-la-montagne.jpg"),
  "la-nature": require("../../assets/couvertures/la-nature.jpg"),
  "le-silence-des-dunes": require("../../assets/couvertures/le-silence-des-dunes.jpg"),
  "le-monde-de-la-science": require("../../assets/couvertures/le-monde-de-la-science.jpg"),
  "la-molecule-improbable": require("../../assets/couvertures/la-molecule-improbable.jpg"),
  "le-corbeau": require("../../assets/couvertures/le-corbeau.jpg"),
  "ton-cerveau-apres-l-ecran": require("../../assets/couvertures/ton-cerveau-apres-l-ecran.jpg"),
  "le-mental-en-desordre": require("../../assets/couvertures/le-mental-en-desordre.jpg"),
  "toi-vs-toi": require("../../assets/couvertures/toi-vs-toi.jpg"),
  "recuperer": require("../../assets/couvertures/recuperer.jpg"),
  "etre-different": require("../../assets/couvertures/etre-different.jpg"),
  "le-repos": require("../../assets/couvertures/le-repos.jpg"),
  "l-effet-domino": require("../../assets/couvertures/l-effet-domino.jpg"),
  "pourquoi-sommes-nous-jaloux": require("../../assets/couvertures/pourquoi-sommes-nous-jaloux.jpg"),
  "le-piege-du-encore-5-minutes": require("../../assets/couvertures/le-piege-du-encore-5-minutes.jpg"),
  "le-pouvoir-de-l-ennui": require("../../assets/couvertures/le-pouvoir-de-l-ennui.jpg"),
  "l-intelligence-sociale": require("../../assets/couvertures/l-intelligence-sociale.jpg"),
  "l-effet-de-foule": require("../../assets/couvertures/l-effet-de-foule.jpg"),
  "le-prix-de-la-celebrite": require("../../assets/couvertures/le-prix-de-la-celebrite.jpg"),
  "pourquoi-le-temps-passe-plus-vite-en-vieillissant": require("../../assets/couvertures/pourquoi-le-temps-passe-plus-vite-en-vieillissant.jpg"),
  "le-mal-fait-du-sucre": require("../../assets/couvertures/le-mal-fait-du-sucre.jpg"),
  "comment-les-couleurs-influencent-notre-esprit": require("../../assets/couvertures/comment-les-couleurs-influencent-notre-esprit.jpg"),
  "avant-google-comment-trouvait-on-l-information": require("../../assets/couvertures/avant-google-comment-trouvait-on-l-information.jpg"),
  "pourquoi-achetons-nous-des-choses-inutiles": require("../../assets/couvertures/pourquoi-achetons-nous-des-choses-inutiles.jpg"),
  "le-monde-sans-electricite": require("../../assets/couvertures/le-monde-sans-electricite.jpg"),
  "pourquoi-avons-nous-peur-du-noir": require("../../assets/couvertures/pourquoi-avons-nous-peur-du-noir.jpg"),
  "les-manipulations-invisibles": require("../../assets/couvertures/les-manipulations-invisibles.jpg"),
  "fake-news": require("../../assets/couvertures/fake-news.jpg"),
  "l-argent-change-t-il-l-homme": require("../../assets/couvertures/l-argent-change-t-il-l-homme.jpg"),
  "le-prix-du-silence": require("../../assets/couvertures/le-prix-du-silence.jpg"),
  "la-science-de-la-performance": require("../../assets/couvertures/la-science-de-la-performance.jpg"),
  "football": require("../../assets/couvertures/football.jpg"),
  "l-eau-et-le-corps": require("../../assets/couvertures/l-eau-et-le-corps.jpg"),
  "la-soif-du-monde": require("../../assets/couvertures/la-soif-du-monde.jpg"),
  "vivre-dans-le-desert": require("../../assets/couvertures/vivre-dans-le-desert.jpg"),
  "le-sacre-liquide": require("../../assets/couvertures/le-sacre-liquide.jpg"),
  "le-voile": require("../../assets/couvertures/le-voile.jpg"),
  "les-bienfaits-de-la-journee-d-un-musulman": require("../../assets/couvertures/les-bienfaits-de-la-journee-d-un-musulman.jpg"),
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
