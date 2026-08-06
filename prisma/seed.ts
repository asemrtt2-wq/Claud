import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

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
  {
    slug: "le-code-du-guerrier",
    title: "Le Code du Guerrier",
    subtitle: "Discipline, courage, volonté",
    description: "Un manuel de discipline personnelle en quatorze chapitres : pourquoi la motivation échoue toujours, comment construire un système qui tient même les jours difficiles, et les quatorze lois d'un code de vie à suivre coûte que coûte.",
    content: "Chapitre 1 — La motivation est une menteuse\n\nElle vient quand tout va bien. Elle part au premier vent contraire. Et toi, tu l'attends encore.\n\nTu connais la scène. Un dimanche soir, une vidéo, une phrase qui te retourne. Tu te lèves. Tu écris un plan. Tu jures que cette fois c'est différent. Le lundi, tu es en feu. Le mardi, ça tient. Le mercredi, il pleut, tu as mal dormi, et l'idée d'y aller te paraît absurde.\n\nTu n'as pas manqué de volonté. Tu as construit sur du sable. La motivation est une émotion : elle monte, elle descend, elle dépend de ton sommeil, de ta glycémie, de la météo et de ce qu'on t'a dit ce matin. Bâtir une vie sur une émotion, c'est bâtir une forteresse sur une vague.\n\nLes hommes qui tenaient la ligne à Platées ne se demandaient pas s'ils étaient motivés. La question ne se posait pas. Ils avaient été formés dès l'enfance à une seule chose : faire ce qui doit être fait, que l'envie soit là ou non. C'est la seule définition utile de la discipline.\n\n« Au point du jour, quand il t'en coûte de te réveiller, aie cette pensée présente : c'est pour faire œuvre d'homme que je m'éveille. Marc Aurèle, Pensées, V »\n\nNote bien ce que dit l'empereur. Il ne dit pas qu'il est motivé. Il dit qu'il n'a pas envie — il t'en coûte — et qu'il se lève quand même. L'homme le plus puissant du monde connu se parlait le matin comme tu te parles. La différence n'est pas dans ce qu'il ressentait. Elle est dans ce qu'il faisait de ce qu'il ressentait.\n\nLE RENVERSEMENT\n\nOn t'a appris : je me sens prêt, donc j'agis. Inverse-le : j'agis, et le sentiment suit. L'énergie n'est pas un préalable au mouvement, elle en est le produit. Personne n'a envie d'entrer dans l'eau froide. On y entre, et ensuite on est content d'y être. Toujours dans cet ordre.\n\nCe livre ne va donc pas essayer de te motiver. La motivation que je pourrais te donner serait périmée dans quatre jours. Il va te donner autre chose : un code. Des lois que tu te fixes une fois, et que tu ne remets plus en question ensuite.\n\nTu n'attends plus d'avoir envie. Tu décides quand, et à cette heure-là tu y vas — que tu sois motivé, fatigué, en colère ou indifférent. L'envie n'est plus consultée. Elle n'a plus voix au chapitre.\n\nChapitre 2 — Le serment\n\nTu ne perds pas la guerre dans la bataille. Tu la perds dans les mille petites renégociations quotidiennes.\n\nChaque matin, tu tiens un conseil de guerre contre toi-même. « Est-ce que j'y vais ? Est-ce que je repousse à demain ? Est-ce que je le mérite, après la journée que j'ai eue ? » Ce conseil, tu le perds une fois sur deux — parce que la partie de toi qui plaide pour le renoncement est la plus vieille, la plus rusée, et qu'elle a toujours d'excellents arguments.\n\nLa solution n'est pas de mieux plaider. C'est de dissoudre le tribunal.\n\nUne décision prise une seule fois, fermement, supprime des centaines de décisions à venir. Tu ne décides pas chaque matin si tu t'entraînes : tu as décidé, il y a des mois, que tu t'entraînes le lundi, le mercredi et le vendredi à 18h. La question ne se pose plus. On ne délibère pas sur un serment.\n\nCE QUI FAIT UN SERMENT\n\n- Il est précis. « Faire plus de sport » n'engage personne. « Lundi, mercredi, vendredi, 18h, une heure » engage un homme.\n\n- Il est peu nombreux. Trois lois que tu tiens valent mieux que quinze que tu trahis. Chaque loi non tenue affaiblit toutes les autres.\n\n- Il est déclaré. Un serment prononcé devant témoin coûte plus cher à briser. Dis-le à quelqu'un dont le regard compte pour toi.\n\n- Il n'a pas de clause de sortie. Pas de « si j'ai le temps », pas de « sauf si ». Ce sont des portes dérobées, et tu les emprunteras.\n\nLes Romains prêtaient le sacramentum, le serment militaire. Ce n'était pas un contrat de travail : c'était un engagement sacré, et le rompre déshonorait l'homme aux yeux de tous, y compris aux siens. Ils avaient compris quelque chose que nous avons perdu : un homme est ce qu'il tient. Pas ce qu'il ressent, pas ce qu'il déclare, pas ce qu'il projette. Ce qu'il tient.\n\n« Ne discourez pas sur ce que doit être l'homme de bien. Soyez-le. Marc Aurèle, Pensées, X »\n\nTrois lignes, pas plus. Trois lois que tu tiendras trente jours sans exception. Précises, datées, horaires. Écris-les à la main, et mets le papier là où tu le verras tous les matins. Un serment que tu ne peux pas relire n'est qu'une intention.\n\nChapitre 3 — Ne négocie jamais avec toi-même\n\nMolon labe. « Viens les prendre. » Deux mots pour dire : cette ligne ne se discute pas.\n\nLa légende veut qu'aux Thermopyles, sommé de déposer les armes, Léonidas ait répondu ces deux mots. Vrai ou non — Plutarque le rapporte des siècles plus tard — la formule dit l'essentiel : il existe des choses sur lesquelles on ne négocie pas. Pas parce qu'on est têtu. Parce qu'ouvrir la discussion, c'est déjà avoir commencé à céder.\n\nTon adversaire ne t'attaque jamais de front. Il ne dit pas « abandonne ». Il dit : « juste aujourd'hui ». « Tu commenceras demain, tu seras plus frais. » « Tu as eu une semaine difficile, tu as bien mérité une pause. » Chacune de ces phrases est raisonnable. Elles sont toutes raisonnables. C'est exactement ce qui les rend dangereuses.\n\nLA RÈGLE DES TRENTE SECONDES\n\nLe combat se joue dans les trente premières secondes. C'est la fenêtre pendant laquelle ton esprit cherche une raison de ne pas y aller. Passé ce délai, tu es déjà en mouvement et la question ne se pose plus.\n\nDonc : ne réfléchis pas. Compte trois secondes et lève-toi. Mets tes chaussures avant d'avoir décidé quoi que ce soit. Le corps engagé, l'esprit suit — il déteste l'incohérence bien plus qu'il ne déteste l'effort.\n\nLA RÈGLE DU JAMAIS DEUX FOIS\n\nTu vas rater des jours. Tout le monde rate des jours. Un jour manqué est un accident ; deux jours manqués sont un nouveau régime. C'est à la deuxième fois que l'habitude change de camp.\n\nNe manque jamais deux fois de suite. Même mal, même au rabais, même dix minutes au lieu d'une heure. Ce qui compte ce jour-là n'est pas la performance : c'est de prouver que la ligne tient.\n\nFAIS-LE MAL, MAIS FAIS-LE\n\nUn entraînement médiocre écrase un entraînement parfait qui n'a pas eu lieu. Vingt minutes valent mieux que zéro. Trois pages valent mieux qu'un chapitre imaginaire. Le perfectionnisme est le déguisement préféré de la lâcheté : il te donne une excuse noble pour ne rien faire.\n\n« Juste aujourd'hui. » — Mensonge. Ce n'est jamais juste aujourd'hui. « Je commencerai lundi. » — Mensonge. Lundi n'existe pas ; il n'y a que maintenant. « Je ne le sens pas. » — Vrai, et sans importance. Personne ne le sent. On y va quand même.\n\nChapitre 4 — Ton corps est ton arme\n\nUn homme négligé se croit tranquille. Il est simplement en train de désarmer, lentement, sans s'en rendre compte.\n\nLe légionnaire romain marchait sous une trentaine de kilos — armes, armure, outils, pieux, vivres — sur des étapes de vingt à trente kilomètres, et à l'arrivée il ne dressait pas le camp après le repos : il creusait le fossé et plantait la palissade, puis il mangeait. Tous les jours. Ce n'était pas de l'héroïsme, c'était le métier.\n\nÀ Sparte, l'entraînement physique n'était pas une activité parmi d'autres, c'était le centre de la vie du citoyen. Un homme faible n'était pas seulement diminué : il était un maillon défectueux dans une ligne où chacun dépendait du voisin.\n\nNous avons hérité de leurs mots et perdu leur substance. Nous parlons de force en étant assis. Or ceci reste vrai, et ne changera pas : ton corps est le véhicule de tout ce que tu veux accomplir. Ta clarté d'esprit, ton humeur, ton énergie, ton sommeil, ta capacité à encaisser un coup dur — tout passe par lui. Le négliger, ce n'est pas être modeste. C'est saboter l'outil avec lequel tu comptes construire.\n\nLES QUATRE PILIERS\n\n- La force. Soulève des choses lourdes, trois fois par semaine. La force protège les articulations, la posture, l'os, et devient décisive à mesure que les années passent. C'est l'assurance-vieillesse qu'on peut souscrire à tout âge.\n\n- Le souffle. Cours, rame, marche vite, monte des côtes. La capacité cardio-respiratoire est l'un des meilleurs indicateurs de longévité dont on dispose.\n\n- La marche. L'exercice le plus sous-estimé du monde. Longue, dehors, régulière. C'est ce que faisaient les légions, et c'est ce que ton corps sait faire mieux que tout.\n\n- Le sommeil. Sans lui, les trois autres ne servent à rien : c'est pendant la nuit que le corps répare ce que l'entraînement a détruit. Un homme qui dort cinq heures et s'entraîne dur ne devient pas fort. Il devient blessé.\n\nCOMMENCE EN DESSOUS DE TES MOYENS\n\nLa faute du débutant est de partir trop fort. Trois séances écrasantes, des courbatures de quatre jours, une blessure, l'abandon. Tu ne cherches pas un exploit : tu cherches un système qui tienne dix ans.\n\nCommence à un niveau presque trop facile. Progresse par petites marches. La régularité écrase l'intensité sur toute distance qui compte.\n\n« Un corps mal entraîné se dérobe au moment où l'on a le plus besoin de lui. Précepte militaire romain, esprit de Végèce »\n\nChapitre 5 — La douleur choisie\n\nIl y a une différence entre s'endurcir et se détruire. Confondre les deux a brisé plus d'hommes que la paresse.\n\nDisons-le d'emblée, parce que ce genre de livre l'oublie trop souvent : la douleur n'est pas le but. Elle n'est pas une monnaie, elle n'achète rien, elle ne rachète rien. Un homme qui recherche la souffrance pour elle-même n'est pas un guerrier : c'est un homme qui se punit.\n\nCe que le guerrier recherche, ce n'est pas la douleur. C'est la difficulté choisie — une charge qu'il décide de porter, qui le renforce, et qu'il maîtrise. La différence entre les deux est nette dès qu'on la nomme.\n\nLes anciens le savaient parfaitement. Sénèque conseillait de pratiquer volontairement quelques jours de pauvreté : mange le pire, porte le plus grossier, dors dur — puis demande-toi : est-ce là ce que je craignais tant ? L'objectif n'était pas de souffrir. C'était de constater qu'on survit, et de désarmer la peur.\n\n« Réserve-toi quelques jours durant lesquels tu te contenteras du strict nécessaire, et dis-toi : est-ce donc là ce que je redoutais ? Sénèque, Lettres à Lucilius, XVIII »\n\nTON ENTRAÎNEMENT VOLONTAIRE\n\nChoisis une chose désagréable, petite, et fais-la tous les jours. Pas pour le plaisir de souffrir : pour t'entraîner à faire ce que tu n'as pas envie de faire. Le muscle que tu travailles là n'est pas dans tes jambes — c'est celui qui décidera, dans dix ans, de ce que tu deviens.\n\n- Te lever à l'heure fixée, sans repousser, tous les jours.\n\n- Trente secondes d'eau froide à la fin de la douche.\n\n- Marcher sous la pluie plutôt que d'attendre l'éclaircie.\n\n- Terminer la série que tu as annoncée, même quand personne ne regarde.\n\n- Manger simplement, sans t'en plaindre.\n\nS'endurcir, c'est ajouter de la charge à un corps qui récupère. Se détruire, c'est ajouter de la charge à un corps qui ne récupère plus. Les signes du second : douleur qui persiste plus de quelques jours, sommeil qui se dégrade, performances qui chutent, humeur noire, envie de tout arrêter. Ce ne sont pas des faiblesses à mépriser : ce sont des rapports du front. Un chef qui ignore les rapports du front perd son armée.\n\nChapitre 6 — Nous combattrons à l'ombre\n\nLe courage n'est pas l'absence de peur. C'est ce que tu fais pendant que tu as peur.\n\nAux Thermopyles, un Grec annonce que les archers perses sont si nombreux que leurs flèches cachent le soleil. Le Spartiate Diénékès répond : « Tant mieux. Nous combattrons à l'ombre. » Hérodote rapporte la scène. Ce qu'elle dit n'est pas que Diénékès n'avait pas peur. C'est qu'il refusait de laisser la peur choisir ses mots — et donc son état.\n\nOn te vend l'image de l'homme sans peur. Elle n'existe pas. Elle n'a jamais existé. Un homme sans peur est un homme sans instinct de survie, et il meurt jeune. Le courage n'est pas un tempérament : c'est une décision prise en présence de la peur.\n\nCOMMENT FONCTIONNE LA PEUR\n\nElle ne parle pas de l'avenir : elle parle de ton imagination. Elle construit un scénario, souvent extrême, souvent improbable, et te le présente comme une certitude. Cœur qui bat, ventre serré, urgence. Ce n'est pas un mensonge — c'est un système de survie très ancien, calibré pour les prédateurs, et qui n'a pas été mis à jour pour les entretiens d'embauche.\n\nTrois manœuvres fonctionnent contre elle :\n\n1. Nomme-la. « J'ai peur d'être ridicule. » Formulée, la peur devient un objet devant toi ; tue, elle reste un brouillard autour de toi. La précision est une arme.\n\n2. Va au bout du scénario. C'est l'exercice stoïcien de la premeditatio malorum : imagine le pire, en détail, jusqu'à la fin. Que se passe-t-il ensuite ? Tu survis. Tu recommences. Presque toujours, le pire réel est très en dessous du pire imaginé — et infiniment plus supportable une fois regardé en face.\n\n3. Avance de trois mètres. Ne cherche pas à vaincre la peur en bloc, c'est impossible. Fais le pas suivant, le plus petit possible. Décroche le téléphone. Ouvre la porte. Enfile les chaussures. Le courage n'est pas un saut : c'est une série de très petits pas exécutés malgré le tremblement.\n\n« Ce ne sont pas les choses qui troublent les hommes, mais les opinions qu'ils s'en font. Épictète, Manuel, V »\n\nIdentifie la chose que tu évites depuis le plus longtemps. Pas la plus grosse : la plus évitée. La conversation reportée, l'appel jamais passé, le projet jamais commencé. C'est là que se trouve ton verrou. Fixe-lui une date et une heure cette semaine. Tu découvriras que la peur pesait plus lourd que l'acte.\n\nChapitre 7 — L'obstacle est le chemin\n\nTu attends que les conditions soient bonnes. Elles ne le seront jamais. Elles ne l'ont jamais été pour personne.\n\n« L'obstacle à l'action fait avancer l'action. Ce qui se met en travers du chemin devient le chemin. Marc Aurèle, Pensées, V »\n\nCette phrase a été écrite sous une tente, pendant une campagne militaire, par un homme qui gouvernait un empire ravagé par la peste, une guerre sur le Danube et une trahison politique. Ce n'est pas de l'optimisme de confort. C'est le carnet de bord d'un homme sous pression.\n\nLe message est technique, pas sentimental. Il ne dit pas que les épreuves sont des cadeaux — c'est une niaiserie, certaines épreuves ne sont que des dégâts. Il dit ceci : ce qui te bloque contient l'exercice dont tu as besoin. Le poids qui résiste est précisément celui qui te construit. Sans résistance, pas de force. Il n'existe aucune façon de devenir fort en soulevant du vide.\n\nLA QUESTION DU GUERRIER\n\nDevant un problème, la plupart des gens posent : « pourquoi moi ? » C'est une question fermée, elle ne mène nulle part et elle a un goût de plainte.\n\nRemplace-la par trois questions ouvertes :\n\n- Qu'est-ce qui dépend de moi, ici ? Souvent peu de choses. Mais jamais rien.\n\n- Quelle est la prochaine action concrète ? Pas le plan complet. La prochaine action.\n\n- Qu'est-ce que ça m'entraîne à faire ? Patience, courage, précision, sang-froid, humilité. L'obstacle choisit l'exercice ; toi, tu décides de l'exécuter.\n\nLA PLAINTE EST UN POISON LENT\n\nSe plaindre soulage cinq minutes et coûte cher ensuite. Chaque plainte réaffirme que tu es une victime de ta situation, et un homme qui se répète cela finit par le croire, puis par le devenir. On ne se plaint pas de la pluie : on prend son manteau, ou on se mouille.\n\nTrente jours sans plainte à voix haute. Aucune. Tu vas découvrir le nombre de fois où tu allais le faire, et ce sera l'information la plus utile de ta semaine.\n\nIl ne s'agit pas de nier la difficulté ni de sourire bêtement sous les coups. Un deuil est un deuil, une injustice est une injustice, et prétendre le contraire n'est pas de la force, c'est du déni. Il s'agit de refuser une seule chose : rester immobile en attendant que le monde s'arrange. Reconnais le coup. Encaisse. Puis avance.\n\nChapitre 8 — Ce que tu ne contrôles pas ne t'appartient pas\n\nÉpictète était esclave. Il a écrit la doctrine de la liberté la plus radicale de l'Antiquité. Il y a une leçon là-dedans.\n\nSa première phrase, celle par laquelle tout commence : il y a les choses qui dépendent de nous, et les choses qui n'en dépendent pas. Le malheur vient tout entier de la confusion des deux.\n\nRegarde bien la colonne de gauche. C'est là que passe la quasi-totalité de ton énergie mentale : ruminer une remarque, refaire une scène, guetter un résultat, ronger un regret. Toute cette énergie est versée dans un compte qui ne t'appartient pas.\n\nEt la colonne de droite, la seule qui t'appartienne réellement, tu la travailles à peine.\n\nLA DISCIPLINE DE L'ATTENTION\n\nC'est un entraînement, pas une révélation. Chaque fois que tu te surprends dans la colonne de gauche, tu ramènes : qu'est-ce qui dépend de moi, ici, maintenant ? Cent fois par jour au début. Dix fois par jour au bout d'un mois. Cela devient un réflexe, et ce réflexe est probablement la chose la plus utile que ce livre puisse t'apprendre.\n\nLE RÉSULTAT N'EST PAS TON AFFAIRE\n\nC'est la partie la plus dure. Tu peux tout faire correctement et perdre quand même. L'archer contrôle sa posture, son souffle, sa visée et son lâcher. Le vent, lui, ne le consulte pas.\n\nAlors juge-toi sur ce que tu contrôles : as-tu fait le travail ? Es-tu venu ? As-tu tenu ta ligne ? Si oui, la journée est gagnée, quel que soit le score affiché. Un homme qui n'a pas compris cela vit à la merci de circonstances qu'il ne dirige pas — et il appelle ça la vie.\n\n« Ne demande pas que les choses arrivent comme tu le veux, mais veuille qu'elles arrivent comme elles arrivent, et tu couleras des jours heureux. Épictète, Manuel, VIII »\n\nChapitre 9 — Parle peu. Frappe fort.\n\nOn dit « laconique » à cause d'eux. La Laconie, c'était Sparte. Ils méprisaient les grands discours, et ils avaient leurs raisons.\n\nUn Athénien reproche un jour aux Spartiates la brièveté de leurs épées. Réponse : « Elles sont bien assez longues pour atteindre nos ennemis. » Un autre, à qui l'on demande pourquoi les Spartiates parlent si peu : « Parce que celui qui parle bien mesure ses mots. » Plutarque a rempli des pages de ces répliques.\n\nCe n'était pas un jeu de style. C'était une doctrine : les mots dépensés à l'avance sont volés à l'action.\n\nLE PIÈGE DE L'ANNONCE\n\nAnnoncer un projet procure une satisfaction immédiate. Les regards, l'approbation, le sentiment d'avoir déjà commencé. Et c'est précisément le problème : une part de la récompense a été touchée avant que le travail existe, et la tension qui devait te pousser à agir est retombée.\n\nIl y a une exception importante, et elle vient du chapitre II : le serment déclaré à une personne, pour qu'elle te tienne comptable. Ce n'est pas la même chose que se raconter partout. L'un t'engage, l'autre te dispense.\n\nRègle simple : annonce peu, montre après. Le travail parle mieux que toi, et il ne se contredit pas.\n\nTROIS AUTRES SILENCES\n\n- Le silence sur les autres. Un homme qui démolit les absents devant toi te démolira devant d'autres. Et chaque phrase que tu prononces sur autrui te définit toi, pas lui.\n\n- Le silence de la maîtrise. Sous le coup de la colère, tais-toi jusqu'à demain. Ce que tu écris à chaud, tu le paieras à froid. Cette seule règle sauvera plus de relations et de carrières que tout le reste du livre.\n\n- Le silence intérieur. Le plus difficile. La façon dont tu te parles quand tu échoues. Un chef qui insulte ses hommes après une défaite n'obtient pas une meilleure armée — il en obtient une plus lente et plus craintive. Tu es à la fois le chef et l'homme. Parle-toi comme tu parlerais à un soldat que tu veux voir se relever : avec exigence, sans mépris.\n\nEst-ce vrai ? Est-ce utile ? Est-ce le moment ? Trois oui, tu parles. Un seul non, tu te tais. Tu regretteras rarement ce que tu n'as pas dit.\n\nChapitre 10 — Le bouclier de ton voisin\n\nDans la phalange, ton bouclier ne te protégeait pas seulement toi. Il couvrait le flanc de l'homme à ta gauche.\n\nC'est le fait militaire le plus important de l'Antiquité grecque, et la plus grande leçon de ce livre. Le grand bouclier rond, l'hoplon, se portait au bras gauche et débordait largement sur la droite : chaque homme protégeait donc partiellement son voisin. Une ligne ne tenait que si chacun restait à sa place. Un homme qui fuyait ouvrait une brèche mortelle pour les autres.\n\nPlutarque rapporte l'idée dans une formule limpide : on porte le casque et la cuirasse pour soi-même, mais le bouclier pour toute la ligne.\n\nRetiens ceci, parce que c'est le contraire exact de ce que raconte la culture de la performance solitaire : on ne tient pas seul. L'homme qui s'isole pour être fort finit seulement isolé. Sparte n'a pas produit des surhommes ; elle a produit une ligne, et c'est la ligne qui était invincible.\n\nTA LIGNE\n\n- Choisis tes hommes. Tu deviens la moyenne de ceux qui t'entourent — pas par magie, mais parce que tu adoptes leurs standards sans t'en apercevoir. Regarde ton entourage et demande-toi honnêtement : est-ce que ces gens me tirent vers le haut, ou est-ce que je me sens supérieur parce qu'ils sont bas ?\n\n- Sois celui sur qui on peut compter. Avant d'exiger une ligne solide, deviens un homme dont la parole vaut. Fais ce que tu as dit, à l'heure où tu l'as dit. C'est rare, et ça se remarque immédiatement.\n\n- Rends des comptes à quelqu'un. Un frère d'armes qui sait ce que tu as promis et qui te le rappellera sans complaisance. Pas un supporter : un témoin.\n\n- Protège les tiens. La force qui ne sert qu'à soi-même n'a pas de nom noble. Un guerrier sans quelqu'un à défendre n'est qu'un homme violent.\n\nUn soldat blessé qui refuse d'être évacué par fierté affaiblit sa ligne : il occupe deux hommes au lieu d'un. Demander de l'aide n'est pas une reddition, c'est de la tactique. Si tu traverses une période où tu ne t'en sors pas — épuisement qui ne passe pas, tristesse qui s'installe, envie de tout lâcher qui dure — parles-en à quelqu'un, et à un professionnel s'il le faut. Le courage, à ce moment-là, c'est d'ouvrir la bouche.\n\nChapitre 11 — Le confort est un ennemi lent\n\nIl ne t'attaque pas. Il t'installe. Et un jour tu ne peux plus te lever.\n\nLes Romains avaient un mot pour la maladie qui a rongé leurs armées de l'intérieur : la luxuria. Pas le luxe au sens moderne — le relâchement. Des camps trop confortables, des marches évitées, des exercices négligés. Aucune bataille perdue ce jour-là. Simplement une armée qui, dix ans plus tard, n'était plus capable de tenir.\n\nLe confort ne fait jamais mal sur le moment. C'est ce qui le rend redoutable. Chaque petit renoncement est indolore, raisonnable, presque invisible. Ce n'est qu'au bout de deux ou trois ans que tu regardes en arrière et que tu ne reconnais plus l'homme d'avant.\n\nLES QUATRE CONFORTABLES\n\n- L'écran. Il ne demande rien, il donne une récompense immédiate, et il consomme le temps par blocs entiers. Compte tes heures d'écran d'une semaine et convertis-les en séances d'entraînement, en pages écrites, en soirées avec les tiens. Le chiffre suffit à faire le travail.\n\n- La facilité choisie par défaut. L'ascenseur, la voiture pour huit cents mètres, la livraison. Chacune est insignifiante. Leur addition, c'est ton corps dans dix ans.\n\n- Les substances. Ce que tu prends pour t'anesthésier le soir te rend plus faible le lendemain. L'alcool en particulier : détente immédiate, sommeil dégradé, humeur plus basse. Un mauvais échange, répété.\n\n- Les gens qui ne te demandent rien. Le pire des quatre, parce qu'il est agréable. Un entourage où personne n'exige rien de personne est un entourage où personne ne grandit.\n\nREPRENDS DU TERRAIN\n\nTu n'as pas besoin d'une vie d'ascète. Tu as besoin de garder l'accès à l'inconfort — de rester capable de le supporter quand il viendra sans être invité. Et il viendra.\n\nChoisis chaque semaine une chose que tu fais volontairement à la dure : monter les escaliers, marcher sous la pluie, une séance en extérieur l'hiver, un jour sans téléphone. Ce n'est pas de la mortification. C'est de l'entretien.\n\n« C'est dans les temps faciles que se préparent les défaites des temps durs. Principe militaire romain »\n\nChapitre 12 — Les jours sans gloire\n\nLes Thermopyles ont duré trois jours. L'entraînement qui les a rendus possibles a duré trente ans.\n\nVoilà ce qu'on ne te montre jamais. Les films s'arrêtent sur la bataille. Personne ne filme les dix mille matins ordinaires qui l'ont précédée : les mêmes gestes, les mêmes exercices, sans public, sans musique, sans rien qui ressemble à de l'héroïsme.\n\nC'est pourtant là que tout se décide. La bataille ne révèle pas le guerrier, elle le révèle au grand jour — elle ne fabrique rien. Ce que tu seras le jour de l'épreuve a été déterminé par les mois où personne ne regardait.\n\nLA VÉRITÉ SUR LA CONSTANCE\n\nUne seule séance ne change rien. Une seule page ne change rien. Un seul repas correct ne change rien. C'est mathématiquement vrai, et c'est exactement l'argument que ton esprit utilisera contre toi ce soir.\n\nSauf qu'un homme n'est pas fait d'une décision : il est fait de la somme de ses répétitions. Ce que tu fais aujourd'hui est insignifiant. Ce que tu fais tous les jours est irrésistible.\n\nLE PLATEAU\n\nIl arrive toujours. Après quelques semaines, les progrès faciles s'arrêtent. Tu travailles autant et tu ne vois plus rien bouger. C'est là que la plupart des hommes abandonnent — non pas par manque de force, mais par manque de retour.\n\nComprends ce qui se passe : sur un plateau, la progression est souterraine. Le corps consolide, le système nerveux s'adapte, la technique s'affine. Rien ne se voit, tout se prépare. Le plateau n'est pas l'échec du système : c'est son fonctionnement normal. Tiens, et le palier suivant s'ouvrira.\n\nLE RITE DU MATIN\n\nCommence chaque journée par un acte de discipline exécuté avant toute discussion intérieure. Se lever à l'heure. Faire son lit. Sortir dehors. Bouger dix minutes. Ce n'est pas le contenu qui compte : c'est le message que tu t'envoies. Je fais ce que j'ai décidé. Une journée ouverte par une victoire est plus difficile à perdre.\n\nMarque d'une croix chaque jour où tu as tenu ta ligne. Ne note aucune performance, aucun chiffre, aucun poids. Seulement la croix. Au bout d'un mois, tu auras sous les yeux la seule chose qui compte : la preuve que tu tiens parole. Et une chaîne de croix, on n'a pas envie de la casser.\n\nChapitre 13 — Un guerrier qui ne se répare pas meurt\n\nAucune armée n'a jamais combattu sans camp, sans ravitaillement et sans repos. Aucune. Ni Sparte, ni Rome.\n\nIl y a une version stupide de ce livre, et elle se vend très bien : ne dors pas, ne t'arrête pas, ne ressens rien, écrase-toi. Elle produit des hommes brillants pendant huit mois et effondrés la neuvième. Ce n'est pas de la force, c'est une combustion.\n\nLes vrais soldats savaient l'inverse. Les légions consacraient un temps considérable à ce qui n'était pas le combat : marcher, construire, réparer, manger, dormir dans un camp fortifié chaque soir. Un général qui épuisait ses hommes avant la bataille perdait la bataille. Le repos n'était pas une faveur accordée aux faibles : c'était une partie de l'art de la guerre.\n\nCE QUI TE RECONSTRUIT\n\n- Le sommeil. Sept à neuf heures. Ce n'est pas négociable et ce n'est pas un signe de mollesse : c'est pendant la nuit que se répare tout ce que tu as construit dans la journée. Sacrifier le sommeil pour s'entraîner davantage, c'est saborder son propre navire pour aller plus vite.\n\n- La nourriture. Simple, suffisante, sans mise en scène. Des protéines, des légumes, assez de calories pour soutenir la charge. Se sous-alimenter n'est pas de la discipline, c'est de l'auto-sabotage.\n\n- Les jours de repos. Prévus, pas subis. Le muscle ne pousse pas à l'entraînement, il pousse pendant la récupération. Le repos programmé fait partie du programme, au même titre que la séance.\n\n- Le calme. Un homme sous tension permanente prend de mauvaises décisions et devient dur avec ceux qu'il aime. Le silence, la marche, le temps sans écran ne sont pas du luxe : ce sont l'entretien du système de commandement.\n\nLA FORCE N'EST PAS L'INSENSIBILITÉ\n\nOn confond souvent le guerrier et l'homme fermé. C'est un contresens. Marc Aurèle écrivait des pages entières sur son chagrin et ses doutes ; c'est même la raison pour laquelle on le lit encore dix-huit siècles plus tard. Il n'a pas cessé de gouverner pour autant.\n\nLa force, ce n'est pas de ne rien ressentir. C'est de ressentir pleinement et d'agir quand même. Un homme qui nie ses émotions ne les supprime pas : il les met sous pression, et elles ressortiront ailleurs — dans son corps, dans sa colère, sur ses proches.\n\nSurveille ces signes, et prends-les au sérieux : épuisement qui ne cède plus au repos, sommeil détruit, performances qui s'effondrent malgré l'effort, humeur noire durable, perte d'intérêt pour ce qui te tenait, dureté nouvelle envers tes proches, sentiment que rien n'est jamais assez.\n\nCe n'est pas une faiblesse à mater par plus de volonté — plus de volonté aggravera les choses. C'est un signal de surcharge. Réduis la charge, dors, mange, parle à quelqu'un. Et si ça persiste, va voir un médecin ou un psychologue. Un homme intelligent fait réparer son arme avant qu'elle ne casse en plein combat.\n\nChapitre 14 — Ton code, en une page\n\nTreize chapitres pour en arriver là. Voilà ce qu'un homme emporte avec lui.\n\nLES LOIS\n\n- Je n'attends pas d'avoir envie. L'heure décide, pas l'humeur.\n\n- Je ne négocie pas. Ce qui est juré ne se rediscute pas le matin.\n\n- Je ne manque jamais deux fois de suite. Un jour raté est un accident, deux jours sont une reddition.\n\n- Je fais mal plutôt que de ne pas faire. Dix minutes battent zéro, toujours.\n\n- J'entretiens mon corps. Force, souffle, marche, sommeil. C'est mon arme, pas un accessoire.\n\n- Je choisis ma difficulté. Chaque jour, une chose que je n'ai pas envie de faire.\n\n- J'avance avec la peur. Je la nomme, je vais au bout du scénario, je fais le pas suivant.\n\n- Je ne me plains pas. J'agis sur ce qui dépend de moi, j'ignore le reste.\n\n- Je me juge sur l'effort, pas sur le score. Le résultat ne m'appartient pas.\n\n- Je parle peu et je montre après. Et je me tais quand je suis en colère.\n\n- Je tiens ma place dans la ligne. On peut compter sur moi, et je protège les miens.\n\n- Je refuse le confort par défaut. Je garde l'accès à l'inconfort.\n\n- Je répare mon arme. Je dors, je mange, je me repose — c'est de la stratégie, pas de la faiblesse.\n\n- Je recommence. Autant de fois qu'il le faudra.\n\nLA QUATORZIÈME EST LA PLUS IMPORTANTE\n\nTu vas trahir ce code. Pas peut-être : sûrement. Tu vas manquer des jours, casser des chaînes, oublier des serments. Tout homme qui a tenu quelque chose de grand a d'abord échoué un nombre considérable de fois.\n\nCe qui distingue les hommes n'est pas le nombre de chutes. C'est le délai de retour. L'amateur tombe et disparaît trois mois. Le guerrier tombe et revient le lendemain, sans discours, sans se flageller, sans dramatiser. Il reprend sa place dans la ligne, et c'est tout.\n\nUne rechute n'annule pas ce que tu as construit. Deux semaines de faiblesse n'effacent pas six mois de travail : le corps garde, la compétence reste, la trace demeure. Le seul échec réel, c'est de ne pas revenir.\n\nPOUR QUOI TE BATS-TU ?\n\nUn dernier point, et c'est celui qui décide de tout le reste. La discipline n'est pas une fin. Un homme dur qui ne sert rien ni personne n'est pas un guerrier : c'est un homme dur, et le monde n'en manque pas.\n\nAlors réponds, pour toi seul : pour quoi fais-tu ça ? Pour quelqu'un ? Pour tenir debout quand les tiens auront besoin de toi ? Pour construire quelque chose qui te survive ? Pour être, à cinquante ans, un homme que tu respectes ?\n\nTrouve ta réponse et écris-la au-dessus de tes quatorze lois. Les jours où ta volonté vacillera — et il y en aura — ce n'est pas ta volonté qui te fera tenir. C'est cette phrase-là.\n\n« Ne perds plus ton temps à discuter de ce que doit être un homme de bien. Sois-le. Marc Aurèle, Pensées, X »\n\nTiens la ligne",
    category: "Développement personnel",
    author: "",
    publishedYear: null,
    coverEmoji: "⚔️",
    coverTheme: "dark",
    coverImageUrl: "/covers/le-code-du-guerrier-front.jpg",
    backCoverImageUrl: "/covers/le-code-du-guerrier-back.jpg",
    price: 14,
    oldPrice: null,
    featured: false,
  },
];

async function main() {
  for (const ebook of [...ebooks, ...kidsEbooks]) {
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
    `Seeded ${ebooks.length} adult eBooks and ${kidsEbooks.length} kids eBooks.`
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
