import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { REAL_BOOKS } from "../src/lib/realBooks";

const prisma = new PrismaClient();

function chapters(paragraphs: string[]) {
  return paragraphs.join("\n\n");
}

const ebooks = [
  {
    slug: "guide-transformation-90-jours",
    title: "Le Guide de la Transformation",
    subtitle: "Perdre du gras • Construire du muscle • Garder la motivation",
    description:
      "Le programme complet de 90 jours qui a déjà aidé des milliers de personnes à perdre du poids, retrouver confiance en elles et construire un physique dont elles sont fières. Plan nutrition, exercices détaillés et suivi de motivation quotidien inclus.",
    content: chapters([
      "Chapitre 1 — Le déclic\n\nTout commence par une décision, pas par une séance de sport. Avant de parler de séries, de répétitions ou de calories, il faut comprendre pourquoi 90% des tentatives de transformation physique échouent : elles reposent sur la motivation plutôt que sur un système.",
      "La motivation est une ressource qui s'épuise. Elle est forte le lundi matin et disparaît le jeudi soir. Ce guide ne te demande pas d'être motivé tous les jours — il te donne un système simple à suivre même les jours où tu n'as pas envie.",
      "Chapitre 2 — Les trois piliers\n\nUne transformation durable repose sur trois piliers : la nutrition, l'entraînement et la récupération. Négliger l'un des trois, c'est construire une maison sur un pied bancal. Nous allons les traiter un par un, dans les prochains chapitres, avec des actions concrètes et mesurables.",
      "Chapitre 3 — La nutrition sans prise de tête\n\nOublie les régimes extrêmes. La règle d'or : manger suffisamment de protéines, assez de légumes, et ajuster les glucides et les graisses selon ton niveau d'activité. Nous verrons comment calculer tes besoins en quelques minutes, sans peser chaque gramme de nourriture pour le reste de ta vie.",
      "Chapitre 4 — S'entraîner intelligemment\n\nTrois séances par semaine suffisent pour progresser, à condition qu'elles soient bien construites. Nous détaillerons un programme complet, progressif, adapté aussi bien aux débutants qu'à ceux qui reprennent après une pause.",
    ]),
    category: "Fitness & Santé",
    author: "Marc Delrieu",
    publishedYear: 2023,
    coverEmoji: "🏋️",
    coverTheme: "royal",
    price: 19,
    oldPrice: 79,
    featured: true,
  },
  {
    slug: "voyage-vers-les-etoiles",
    title: "Voyage vers les Étoiles",
    subtitle: "Explore l'univers et repousse tes limites",
    description:
      "Un carnet de voyage et d'astronomie pour rêveurs curieux : cartes du ciel, itinéraires d'observation et récits d'explorateurs pour redécouvrir l'émerveillement.",
    content: chapters([
      "Chapitre 1 — Lever les yeux\n\nIl y a quelque chose d'universellement apaisant à regarder le ciel nocturne. Avant les villes, avant les écrans, les étoiles étaient la première carte, le premier calendrier, la première histoire que l'humanité s'est racontée.",
      "Ce carnet n'est pas un manuel d'astrophysique. C'est une invitation à ralentir, à sortir une nuit claire, et à retrouver cet émerveillement simple que beaucoup d'entre nous ont oublié en grandissant.",
      "Chapitre 2 — Les constellations à connaître\n\nCommence par la Grande Ourse : sept étoiles brillantes, faciles à repérer, qui te serviront de point de départ pour naviguer dans tout le ciel du nord. De là, tu peux retrouver l'Étoile Polaire, puis Cassiopée, puis bien d'autres.",
      "Chapitre 3 — Observer sans matériel\n\nPas besoin d'un télescope pour commencer. Une nuit sans lune, loin des lumières de la ville, et une paire d'yeux suffisent pour voir des milliers d'étoiles, la Voie lactée, et parfois même une étoile filante.",
      "Chapitre 4 — Récits d'explorateurs\n\nDepuis les marins polynésiens qui traversaient le Pacifique en suivant les étoiles, jusqu'aux astronautes qui les regardent aujourd'hui depuis l'orbite, ce chapitre rassemble des récits qui montrent à quel point le ciel a toujours guidé l'exploration humaine.",
    ]),
    category: "Aventure & Voyage",
    author: "Camille Auger",
    publishedYear: 2021,
    coverEmoji: "🚀",
    coverTheme: "dark",
    price: 14,
    oldPrice: 24,
    featured: true,
  },
  {
    slug: "reussite-et-motivation",
    title: "Réussite & Motivation",
    subtitle: "Les clés mentales pour atteindre tes objectifs",
    description:
      "Un guide pratique de développement personnel pour construire une discipline durable, rester motivé sur la durée et transformer tes ambitions en résultats concrets.",
    content: chapters([
      "Chapitre 1 — La discipline bat la motivation\n\nCeux qui réussissent durablement ne sont pas ceux qui ont le plus de motivation, mais ceux qui ont construit des habitudes qui fonctionnent même quand la motivation est absente.",
      "Ce livre te donne un cadre simple pour transformer une ambition floue — \"je veux réussir\" — en une série de petites actions quotidiennes que tu peux réellement tenir.",
      "Chapitre 2 — Définir un objectif qui tient la route\n\nUn objectif vague ne mène nulle part. Nous verrons comment formuler des objectifs clairs, mesurables, et surtout découpés en étapes suffisamment petites pour ne jamais te décourager.",
      "Chapitre 3 — Gérer l'échec\n\nL'échec n'est pas l'opposé de la réussite, c'est une étape normale du chemin. Ce chapitre te donne des outils concrets pour rebondir rapidement après un échec au lieu de laisser un mauvais jour se transformer en mauvaise semaine.",
      "Chapitre 4 — Tenir sur la durée\n\nLa vraie difficulté n'est pas de commencer, c'est de continuer. Nous verrons comment structurer ton environnement, tes routines et ton entourage pour que la régularité devienne presque automatique.",
    ]),
    category: "Développement personnel",
    author: "Julien Farel",
    publishedYear: 2020,
    coverEmoji: "⛰️",
    coverTheme: "deep",
    price: 16,
    oldPrice: null,
    featured: true,
  },
  {
    slug: "cuisine-familiale",
    title: "Cuisine Familiale",
    subtitle: "Des recettes simples et saines pour toute la famille",
    description:
      "Plus de 60 recettes healthy et rapides à préparer, pensées pour les familles pressées qui veulent bien manger sans y passer des heures.",
    content: chapters([
      "Introduction — Cuisiner sans y passer sa vie\n\nCe livre part d'un constat simple : entre le travail, les enfants et le quotidien, personne n'a envie de passer deux heures en cuisine chaque soir. Toutes les recettes qui suivent tiennent en 30 minutes ou moins.",
      "Chapitre 1 — Organiser sa semaine\n\nUn peu de planification le dimanche te fait gagner un temps précieux toute la semaine. Nous verrons comment préparer une liste de courses simple et anticiper deux ou trois bases (céréales cuites, légumes rôtis) réutilisables dans plusieurs plats.",
      "Chapitre 2 — Les basiques healthy\n\nOubliez les recettes à quinze ingrédients introuvables. Chaque recette de ce livre utilise des produits simples, disponibles dans n'importe quel supermarché, pour un repas équilibré et savoureux.",
      "Chapitre 3 — Des recettes pour tous les goûts\n\nDes bowls colorés aux plats mijotés réconfortants, en passant par des version healthy de classiques familiaux, ce chapitre couvre large pour que même les enfants les plus difficiles y trouvent leur bonheur.",
    ]),
    category: "Cuisine & Nutrition",
    author: "Nora Vidal",
    publishedYear: 2022,
    coverEmoji: "🍽️",
    coverTheme: "steel",
    price: 12,
    oldPrice: 18,
    featured: false,
  },
  {
    slug: "bien-etre-et-meditation",
    title: "Bien-Être & Méditation",
    subtitle: "Retrouve calme et clarté d'esprit au quotidien",
    description:
      "Des exercices de respiration, méditations guidées et rituels simples pour réduire le stress et cultiver la sérénité, même dans un emploi du temps chargé.",
    content: chapters([
      "Chapitre 1 — Pourquoi ralentir\n\nNotre esprit est constamment sollicité : notifications, obligations, pensées qui tournent en boucle. Ce livre propose des pauses courtes mais efficaces pour retrouver du calme au milieu de journées chargées.",
      "Chapitre 2 — La respiration comme ancrage\n\nLa respiration est l'outil le plus accessible pour calmer le système nerveux. Nous verrons plusieurs techniques simples, utilisables n'importe où, en moins de trois minutes.",
      "Chapitre 3 — Méditations guidées\n\nPas besoin de s'asseoir en silence pendant une heure. Ce chapitre propose des méditations courtes, de 5 à 10 minutes, adaptées à un emploi du temps chargé — au réveil, sur la pause déjeuner, ou avant de dormir.",
      "Chapitre 4 — Des rituels pour la journée\n\nDe petits rituels simples, répétés chaque jour, suffisent à créer une sensation durable de calme. Nous verrons comment en construire trois ou quatre qui s'intègrent naturellement à ta routine actuelle.",
    ]),
    category: "Bien-être",
    author: "Léa Sancerre",
    publishedYear: 2024,
    coverEmoji: "🧘",
    coverTheme: "royal",
    price: 13,
    oldPrice: null,
    featured: false,
  },
  {
    slug: "secrets-de-productivite",
    title: "Secrets de Productivité",
    subtitle: "Organise ton temps et atteins tes objectifs plus vite",
    description:
      "Des méthodes concrètes de gestion du temps et de concentration, inspirées des meilleures pratiques, pour reprendre le contrôle de tes journées.",
    content: chapters([
      "Chapitre 1 — Le mythe du multitâche\n\nFaire plusieurs choses à la fois donne l'impression d'être productif, mais la recherche est claire : cela ralentit presque tout ce que l'on fait. Ce livre commence par démonter ce mythe pour poser des bases solides.",
      "Chapitre 2 — Prioriser sans se noyer\n\nUne longue liste de tâches n'est pas un plan. Nous verrons une méthode simple pour identifier chaque jour les deux ou trois actions qui comptent vraiment, et laisser le reste attendre sans culpabilité.",
      "Chapitre 3 — Protéger sa concentration\n\nLes interruptions coûtent bien plus cher qu'on ne le pense : chaque notification peut te faire perdre plusieurs minutes de concentration profonde. Ce chapitre donne des techniques concrètes pour créer des blocs de travail réellement ininterrompus.",
      "Chapitre 4 — Tenir dans la durée\n\nUn système de productivité qui s'effondre après une semaine ne sert à rien. Nous verrons comment construire des habitudes réalistes, adaptées à ta vie réelle plutôt qu'à une version idéalisée de ton emploi du temps.",
    ]),
    category: "Productivité",
    author: "Thomas Brun",
    publishedYear: 2019,
    coverEmoji: "⚡",
    coverTheme: "deep",
    price: 15,
    oldPrice: 22,
    featured: false,
  },
  {
    slug: "epargner-sans-effort",
    title: "Épargner Sans Effort",
    subtitle: "Un système simple pour mettre de l'argent de côté chaque mois",
    description:
      "Un guide concret de finances personnelles pour les familles occupées : budget automatique, pièges à éviter et petites habitudes qui font une vraie différence sur l'année.",
    content: chapters([
      "Chapitre 1 — Pourquoi épargner semble toujours difficile\n\nCe n'est presque jamais une question de revenu : c'est une question de système. Sans règle automatique, l'argent qui reste en fin de mois disparaît toujours, quel que soit le salaire.",
      "Chapitre 2 — La règle du virement automatique\n\nMets en place un virement automatique vers un compte épargne le jour de ta paie, avant de voir l'argent sur ton compte courant. Ce que tu ne vois pas, tu ne le dépenses pas.",
      "Chapitre 3 — Repérer les dépenses invisibles\n\nAbonnements oubliés, frais bancaires, petits achats répétés : ce chapitre te donne une méthode en 15 minutes pour repérer les fuites les plus courantes dans un budget familial.",
      "Chapitre 4 — Un objectif concret change tout\n\nÉpargner \"pour épargner\" ne motive personne. Nous verrons comment fixer un objectif clair — vacances, matelas de sécurité, projet familial — pour que chaque virement automatique ait un sens.",
    ]),
    category: "Développement personnel",
    author: "Julien Farel",
    publishedYear: 2024,
    coverEmoji: "🪙",
    coverTheme: "steel",
    price: 14,
    oldPrice: 20,
    featured: false,
  },
];

const kidsEbooks = [
  {
    slug: "le-petit-dragon-curieux",
    title: "Le Petit Dragon Curieux",
    subtitle: "Une aventure pleine de découvertes",
    description:
      "Ignis le petit dragon n'a jamais vu au-delà de sa montagne. Une histoire douce sur la curiosité et le courage de découvrir le monde, parfaite pour l'heure du coucher.",
    content: chapters([
      "Ignis vivait tout en haut d'une montagne, dans une grotte tapissée de mousse douce. Chaque soir, il regardait les lumières de la vallée en bas et se demandait ce qu'il pouvait bien s'y passer.",
      "\"Tu es trop petit pour voler si loin\", lui disait toujours sa maman dragonne. Mais une nuit, sous une lune ronde et brillante, Ignis déplia ses petites ailes et s'envola tout doucement vers la vallée.",
      "Il découvrit une forêt qui chantait, une rivière qui scintillait comme des diamants, et un hibou très sage qui lui offrit une noisette dorée en cadeau de bienvenue.",
      "Quand Ignis rentra chez lui, il n'avait plus peur du tout. Il avait appris que le monde était grand, mais qu'il était toujours assez courageux pour l'explorer, un petit vol à la fois.",
      "Et chaque soir, en fermant les yeux, il rêvait déjà du prochain endroit qu'il irait découvrir.",
    ]),
    category: "Histoires pour enfants",
    author: "Inès Rocher",
    publishedYear: 2023,
    audience: "kids",
    coverEmoji: "🐉",
    coverTheme: "ember",
    price: 0,
    oldPrice: null,
    featured: false,
  },
  {
    slug: "letoile-qui-chante",
    title: "L'Étoile qui Chante",
    subtitle: "Une berceuse venue du ciel",
    description:
      "Une petite étoile a perdu sa chanson. Une histoire apaisante sur l'amitié et la musique, pensée pour accompagner en douceur le moment du coucher.",
    content: chapters([
      "Tout en haut du ciel, une petite étoile nommée Lyra avait l'habitude de chanter chaque nuit pour aider les enfants à s'endormir. Mais un soir, sa chanson avait disparu.",
      "Lyra demanda de l'aide à la Lune, qui lui répondit doucement : \"Ta chanson n'est pas perdue, elle se cache simplement là où le ciel est le plus calme.\"",
      "Alors Lyra voyagea de nuage en nuage, écoutant le vent, le silence, et le doux ronflement des enfants qui dormaient déjà. Petit à petit, la musique revint, note après note.",
      "Quand sa chanson fut de nouveau complète, Lyra la chanta plus belle que jamais, et partout sur Terre, les enfants fermèrent les yeux avec un sourire.",
      "Depuis ce jour, on dit que si tu écoutes très attentivement juste avant de t'endormir, tu peux encore entendre la douce mélodie de Lyra.",
    ]),
    category: "Histoires pour enfants",
    author: "Inès Rocher",
    publishedYear: 2022,
    audience: "kids",
    coverEmoji: "⭐",
    coverTheme: "aurora",
    price: 0,
    oldPrice: null,
    featured: false,
  },
  {
    slug: "la-foret-des-murmures",
    title: "La Forêt des Murmures",
    subtitle: "Le secret des arbres qui chuchotent",
    description:
      "Mia entend les arbres murmurer un secret magique. Une histoire sur l'écoute, la nature et la confiance en soi, pour les jeunes explorateurs.",
    content: chapters([
      "Mia adorait se promener dans la forêt derrière chez elle. Un jour, elle remarqua quelque chose d'étrange : les feuilles semblaient chuchoter entre elles, comme si elles se racontaient un secret.",
      "Elle s'assit tout doucement au pied d'un grand chêne et ferma les yeux pour mieux écouter. \"Chuuut... suis le chemin de mousse... chuuut...\" murmuraient les feuilles.",
      "Mia suivit le doux chemin de mousse verte, guidée par le murmure des arbres, jusqu'à une petite clairière où des centaines de lucioles dansaient dans la lumière du soir.",
      "Un vieux hibou, gardien de la clairière, lui expliqua que seuls ceux qui prennent le temps d'écouter vraiment peuvent trouver cet endroit magique.",
      "Mia rentra chez elle le cœur léger, en promettant de toujours prendre le temps d'écouter le monde autour d'elle, même les plus petits murmures.",
    ]),
    category: "Histoires pour enfants",
    author: "Paul Ancel",
    publishedYear: 2024,
    audience: "kids",
    coverEmoji: "🦉",
    coverTheme: "forest",
    price: 0,
    oldPrice: null,
    featured: false,
  },
];

async function main() {
  for (const ebook of [...ebooks, ...kidsEbooks, ...REAL_BOOKS]) {
    await prisma.eBook.upsert({
      where: { slug: ebook.slug },
      update: ebook,
      create: ebook,
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.admin.upsert({
      where: { email: adminEmail },
      update: { passwordHash },
      create: { email: adminEmail, passwordHash },
    });
    console.log(`Admin account ready: ${adminEmail}`);
  } else {
    console.warn(
      "ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin account creation."
    );
  }

  console.log(
    `Seeded ${ebooks.length} sample adult eBooks, ${kidsEbooks.length} kids eBooks, and ${REAL_BOOKS.length} real books.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
