import { LegalDocument, type Section } from "@/components/LegalDocument";

/**
 * La politique de confidentialité. Les deux boutiques l'exigent pour toute app, et
 * demandent en plus une fiche « données collectées » qui doit dire la même chose.
 *
 * Pour Lumia, cette fiche se remplit en « aucune donnée collectée » — ce qui n'est pas une
 * formule de prudence mais une conséquence de l'architecture : pas de compte, pas de
 * serveur, aucune requête réseau, aucune permission demandée. Ce texte se contente donc de
 * décrire ce qui est vrai, et de nommer ce que Lumia ne fait pas.
 */
const SECTIONS: Section[] = [
  {
    heading: "En une phrase",
    body: [
      "Lumia ne collecte aucune donnée. Aucune information ne quitte votre téléphone, parce que l'application n'a personne à qui l'envoyer.",
    ],
  },
  {
    heading: "Ce qui reste sur votre téléphone",
    body: [
      "L'application enregistre, dans son espace privé sur l'appareil :",
      "- la page où vous en êtes dans chaque livre ;",
      "- vos favoris et les livres que vous avez terminés ;",
      "- votre temps de lecture, compté minute par minute pendant que vous lisez ;",
      "- vos réglages d'affichage, la langue choisie et la formule active.",
      "Ces informations ne sont lisibles que par l'application, sur cet appareil. Elles ne sont ni transmises, ni sauvegardées ailleurs, ni consultables par l'éditeur.",
    ],
  },
  {
    heading: "Ce que Lumia ne fait pas",
    body: [
      "- Aucun compte : il n'y a ni inscription, ni adresse e-mail, ni mot de passe.",
      "- Aucun serveur : l'application ne contacte aucune adresse sur Internet. Les livres sont déjà dans l'application au moment de l'installation.",
      "- Aucune mesure d'audience, aucun traqueur, aucun outil d'analyse.",
      "- Aucune publicité, et donc aucun profil publicitaire.",
      "- Aucune permission demandée : ni contacts, ni position, ni appareil photo, ni micro, ni notifications.",
      "- Aucune vente ni partage de données, puisqu'il n'y en a aucune à vendre.",
    ],
  },
  {
    heading: "Le jour où les paiements seront actifs",
    body: [
      "Les achats passeront par l'App Store et par Google Play. C'est la boutique qui encaisse : Lumia ne voit ni votre nom, ni votre adresse, ni votre moyen de paiement, et ne les enregistre nulle part.",
      "L'application recevra seulement de la boutique la réponse « cet achat est valide », qu'elle utilisera pour déverrouiller ce que vous avez payé. Le traitement de vos données de paiement par Apple ou par Google relève de leurs propres politiques de confidentialité.",
    ],
  },
  {
    heading: "Les enfants",
    body: [
      "L'application ne collectant aucune donnée, elle n'en collecte pas davantage sur un enfant qui l'utilise. Il n'y a ni profil, ni historique consultable à distance, ni contact possible avec d'autres utilisateurs.",
      "Le catalogue est écrit pour un lecteur adulte ou adolescent. Un mode enfant, avec un filtrage plus strict du catalogue, n'existe pas encore dans l'application.",
    ],
  },
  {
    heading: "Effacer ce qui est enregistré",
    body: [
      "Désinstaller l'application supprime tout ce qu'elle avait enregistré : progression, favoris, temps de lecture, réglages. Il n'en reste aucune copie, chez l'éditeur comme ailleurs.",
      "Cela vaut aussi pour les accès acquis. Les achats encaissés par une boutique se restaurent depuis cette boutique ; le livre offert, lui, est enregistré sur l'appareil et ne se restaure pas après désinstallation.",
    ],
  },
  {
    heading: "Si ce texte change",
    body: [
      "Ce texte ne changera que si l'application change. Il est révisé à chaque version qui toucherait à ce qui est enregistré sur l'appareil, et la date en tête indique la dernière révision.",
    ],
  },
];

export default function PrivacyScreen() {
  return (
    <LegalDocument
      screenTitle="Confidentialité"
      title="Politique de confidentialité"
      lede="Lumia fonctionne hors ligne, sans compte et sans serveur. Ce texte dit ce que cela implique — et il est court pour la même raison."
      sections={SECTIONS}
    />
  );
}
