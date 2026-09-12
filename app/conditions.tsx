import { BOOK_PRICE, PLAN_LIST } from "@/data/plans";
import { LegalDocument, type Section } from "@/components/LegalDocument";

/**
 * Les conditions d'utilisation, exigées par Apple et Google dès qu'une app vend un
 * abonnement. Elles doivent nommer la formule, sa durée, son prix, dire que le
 * renouvellement est automatique et où il se résilie.
 *
 * Les prix ne sont **pas écrits ici** : ils sont lus dans `src/data/plans.ts`, seule source
 * de vérité du projet. Un prix recopié à la main est un prix qui finira par être faux — et
 * un prix faux dans les conditions est précisément la pratique trompeuse que la charte
 * interdit.
 */
const SECTIONS: Section[] = [
  {
    heading: "Où en est le paiement aujourd'hui",
    body: [
      "Aucun paiement n'est encore en place. Choisir une formule dans l'application ne débite rien : cela active seulement ses fonctions sur votre appareil, pour les essayer.",
      "Les articles qui suivent décrivent les prix et les règles qui s'appliqueront le jour où le paiement sera actif, par les achats intégrés de l'App Store et de Google Play. Ils sont écrits ici à l'avance pour que rien ne vous surprenne, pas parce qu'ils vous engagent déjà.",
    ],
  },
  {
    heading: "Ce que Lumia vous fournit",
    body: [
      "Lumia est une application de lecture. Les livres sont embarqués dans l'application : une fois installée, elle fonctionne sans connexion et sans compte.",
      "Vous accédez aux livres de trois façons : le livre offert, l'achat d'un livre seul, ou un abonnement. Un livre auquel vous avez accès reste lisible dans l'application ; il n'y a rien à télécharger ni à exporter.",
    ],
  },
  {
    heading: "Le livre offert",
    body: [
      "L'application offre un livre, celui que vous voulez, une seule fois. Ce choix est définitif : une fois validé, il ne peut pas être changé. L'application vous le dit avant que vous validiez.",
      "Le livre offert vous reste acquis, même si vous ne prenez jamais d'abonnement.",
    ],
  },
  {
    heading: "L'achat d'un livre seul",
    body: [
      `Un livre acheté seul coûte ${BOOK_PRICE}. C'est un achat définitif, pas une location : le livre reste accessible dans l'application sans limite de durée.`,
      "Un achat est lié au compte de la boutique qui l'a encaissé — votre identifiant Apple ou votre compte Google. Il se retrouve sur vos autres appareils en restaurant vos achats depuis la même boutique.",
    ],
  },
  {
    heading: "Les abonnements",
    body: [
      "Trois formules mensuelles existent :",
      ...PLAN_LIST.map(
        (plan) => `- ${plan.name} — ${plan.price} ${plan.period}, durée d'un mois.`
      ),
      "Un abonnement se renouvelle automatiquement chaque mois, pour le même prix, jusqu'à ce que vous le résiliiez. Le montant est prélevé par la boutique le jour du renouvellement.",
      "Une formule supérieure contient tout ce que contiennent les précédentes. Changer de formule prend effet selon les règles de la boutique où l'abonnement a été souscrit.",
    ],
  },
  {
    heading: "Résilier",
    body: [
      "Un abonnement se résilie à tout moment, sans frais et sans durée minimale. Il reste actif jusqu'à la fin du mois déjà payé, puis s'arrête.",
      "La résiliation se fait dans les réglages d'abonnement de votre téléphone — sur iPhone dans Réglages, votre nom, Abonnements ; sur Android dans Google Play, Paiements et abonnements. Lumia ne peut pas résilier à votre place, et aucun écran de l'application ne cherchera à vous en dissuader.",
      "La résiliation doit être faite au moins vingt-quatre heures avant la date de renouvellement, faute de quoi le mois suivant est déjà prélevé.",
    ],
  },
  {
    heading: "Remboursements",
    body: [
      "Les paiements sont encaissés par Apple ou par Google, pas par Lumia. Une demande de remboursement passe donc par eux : Lumia n'a accès ni à votre moyen de paiement, ni à la possibilité de vous rembourser directement.",
      "Si votre demande concerne un problème dans l'application elle-même, écrivez-nous : nous ne pouvons pas vous rembourser, mais nous pouvons corriger.",
    ],
  },
  {
    heading: "Ce que vous pouvez faire des livres",
    body: [
      "Les livres du catalogue sont mis à votre disposition pour votre lecture personnelle. Vous pouvez en citer des extraits en mentionnant leur source.",
      "Vous ne pouvez pas les republier, les revendre, ni les diffuser en entier, que ce soit gratuitement ou contre paiement.",
    ],
  },
  {
    heading: "Ce que les livres ne sont pas",
    body: [
      "Les livres de Lumia sont des textes d'information, écrits en distinguant ce qui est établi, ce qui est une hypothèse et ce qui est une opinion.",
      "Les chapitres qui touchent à la santé ne remplacent pas l'avis d'un médecin, ceux qui touchent à l'argent ne sont pas un conseil en investissement, et ceux qui touchent au droit ne sont pas un conseil juridique. Une décision qui compte se prend avec une personne compétente, pas avec un livre.",
    ],
  },
  {
    heading: "Si ces conditions changent",
    body: [
      "Ces conditions peuvent être modifiées, par exemple si une formule évolue. La date en tête de ce texte indique la dernière révision.",
      "Un changement de prix d'un abonnement en cours ne s'applique jamais sans votre accord : Apple et Google vous demandent de le confirmer, et sans confirmation l'abonnement s'arrête au lieu d'être prélevé au nouveau tarif.",
    ],
  },
];

export default function TermsScreen() {
  return (
    <LegalDocument
      screenTitle="Conditions"
      title="Conditions d'utilisation"
      lede="Ce que Lumia vous fournit, ce que coûte chaque formule, et comment tout s'arrête si vous le décidez. Ce texte est court parce qu'il n'a rien à cacher."
      sections={SECTIONS}
    />
  );
}
