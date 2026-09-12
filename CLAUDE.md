# CLAUDE.md

## Ce que c'est

**Lumia** — une application de lecture native, **iOS et Android**, écrite une seule fois avec
Expo (React Native) et expo-router. Il n'y a plus de site web : l'ancienne plateforme Next.js a
été supprimée à la demande du propriétaire du projet (voir « Historique » plus bas).

L'app fonctionne **entièrement hors ligne** : les livres sont embarqués dans le bundle, la
progression est stockée sur l'appareil. Aucun compte, aucun serveur, aucune donnée envoyée.

## Charte de contenu — non négociable

Cette charte a été posée par le propriétaire du projet. Elle gouverne **chaque livre ajouté au
catalogue et chaque écran de l'app**, et ne doit pas être contournée « pour faire joli » ni
assouplie parce qu'un contenu serait par ailleurs intéressant.

| Domaine | Règle Lumia |
| --- | --- |
| 🔞 Pornographie / nudité | **Interdit** |
| 💋 Contenu sexuellement suggestif | **Interdit** |
| 🖼 Représentation figurative | **Interdit** : ni personnage, ni visage, ni silhouette, ni animal — interface comprise |
| 🍷 Alcool | Pas de promotion ni incitation |
| 🎰 Jeux d'argent | Pas de promotion |
| 🔮 Magie / occultisme | Pas d'enseignement ni de promotion |
| 💰 Pratiques financières contraires à la charte | Pas de promotion ; pour l'islam, vigilance particulière sur le **riba** |
| 🤬 Contenu vulgaire | Éviter insultes, obscénités et vulgarité gratuite |
| 🧨 Violence | Pas de glorification gratuite ; possible dans un contexte historique ou éducatif |
| 🧠 Santé | Informations sérieuses et sourcées, sans faux diagnostic |
| 📚 Histoire / science | Sources fiables, et distinction claire entre faits, hypothèses et opinions |
| ✝️☪️✡️ Religion | Présenter chaque religion avec respect, sans caricature |
| 📢 Publicité | Même charte que le catalogue : pas de publicité incompatible |
| 💳 Abonnements | Prix clair, résiliation claire, aucune pratique trompeuse |
| 👧 Enfants | Filtrage encore plus strict |

### Ce que le code applique, et ce qu'il ne peut pas appliquer

La distinction compte : ne jamais supposer que l'app filtre le contenu toute seule.

**Appliqué par le code**, donc impossible à enfreindre par inadvertance :
- **Aucun chiffre inventé**, ce qui sert la ligne « aucune pratique trompeuse » : l'onglet
  « Avis » annonce qu'il n'est pas actif au lieu d'afficher une note fabriquée, « Populaires »
  suit l'ordre du catalogue faute de statistiques réelles, et le temps de lecture du profil est
  compté minute par minute dans le lecteur.
- **L'interface elle-même reste non figurative** : `src/components/Ornament.tsx` ne dessine que
  de la géométrie, et l'onglet « Profil » porte une icône de médaille plutôt que la silhouette
  de la maquette.

**Les couvertures : une décision explicite du propriétaire du projet.** L'app affichait au
départ des couvertures composées en code, sans aucune image, pour tenir la ligne
« représentation figurative — interdit, interface comprise ». Le propriétaire a ensuite fourni
ses propres couvertures et demandé qu'elles soient utilisées. Elles sont donc embarquées dans
`assets/couvertures/` et référencées par `src/data/covers.ts`.

Ce que cela change, et ce que cela ne change pas :
- Ces couvertures ne montrent **presque jamais de personne ni d'animal** — objets,
  architecture, paysages, typographie. Deux exceptions ont été signalées au propriétaire, qui a
  choisi de les garder : les douze masques de théâtre de **« L'intelligence sociale »**, qui
  portent des visages, et les pictogrammes stylisés (mains en prière, famille, poignée de main)
  du schéma de **« Les bienfaits de la journée d'un musulman »**. L'aigle impérial brodé sur les
  drapeaux de « Napoléon » est un emblème héraldique.
- La couverture composée en code **existe toujours** (`BookCover` sans `slug`, ou avec un slug
  absent de la table) : c'est le repli d'un livre qui n'a pas encore d'image.
- **La règle reste la règle pour tout le reste** : aucun portrait, aucune silhouette, aucun
  animal ailleurs dans l'app. La maquette d'origine posait des portraits (Saladin, Ibn Sina,
  Marc Aurèle) sur les couvertures : ceux-là restent exclus.

**Éditorial — la responsabilité de qui écrit les livres.** Tout le reste du tableau porte sur le
*texte* des livres : aucune vérification automatique n'est possible. Chaque livre ajouté à
`src/data/books.ts`, écrit à la main ou importé via `npm run books:import`, doit être relu à
l'aune de ce tableau avant d'être publié.

**Pas encore construit** — à ne pas présenter comme existant :
- Le **mode enfant** et son filtrage renforcé n'existent pas dans l'app. Il n'y a aujourd'hui
  qu'un seul profil de lecture.
- Les **paiements réels** non plus. Les trois formules existent (`src/data/plans.ts`,
  `app/abonnement.tsx`) avec leurs prix et leur contenu, mais choisir une formule ne débite
  rien : c'est un réglage local. L'écran le dit en toutes lettres — laisser croire à un achat
  serait la pratique trompeuse que la charte interdit. Le jour où le paiement arrive, il devra
  passer par les achats intégrés d'Apple et de Google, qui l'imposent pour du contenu
  numérique, et la résiliation se fera dans leurs réglages.
- **Le catalogue est verrouillé, mais rien ne se paie.** Un livre s'ouvre avec un abonnement,
  avec le livre offert ou après achat — sauf que « acheter » ne débite rien et le dit. C'est
  l'état à tenir jusqu'aux achats intégrés : la logique d'accès est complète et vérifiable,
  seule la caisse manque.
- **La demande de livre et le vote** de la formule Premium n'existent pas dans l'app. Ils
  demandent un serveur ; l'ancienne plateforme web en avait une version, supprimée avec elle.
- **Aucune traduction n'est encore embarquée.** Le pipeline est prêt, le catalogue n'a qu'une
  langue : le français.
- **L'éditeur de l'app n'est pas identifié.** `src/data/legal.ts` porte deux espaces
  réservés — nom et adresse de contact — sans lesquels aucune des deux boutiques n'accepte
  une soumission. Les écrans juridiques le signalent en rouge tant que c'est le cas.

Toute nouvelle fonctionnalité qui introduirait une image de personne ou d'animal, ou un contenu
tombant dans une case « interdit » du tableau, est à refuser ou à remplacer.

## Lancer et construire

```bash
npm install
npm start            # serveur de développement ; scanner le QR code avec Expo Go
npm run android      # ouvrir sur un appareil / émulateur Android
npm run ios          # ouvrir sur un simulateur iOS (nécessite un Mac)
npm run typecheck    # vérification TypeScript
```

**Pour produire les vraies applications** (fichiers `.ipa` / `.aab` à envoyer aux stores), il
faut EAS Build, qui compile dans le cloud — y compris la version iOS, sans posséder de Mac :

```bash
npx eas login
npx eas build:configure
npx eas build --platform android    # .aab pour Google Play
npx eas build --platform ios        # .ipa pour l'App Store
```

Comptes nécessaires pour publier : **Apple Developer Program** (99 $/an) et **Google Play
Console** (25 $ une fois). Ce sont les seules pièces qui manquent — le code, lui, est prêt.

## Règles iOS et Android appliquées

- **Zones tactiles** : `touchTarget = 48` dans `src/theme.ts` — le plus exigeant entre les 44 pt
  d'Apple et les 48 dp d'Android, une seule valeur pour les deux plateformes.
- **Safe areas** : chaque écran ajoute `useSafeAreaInsets()` ; la barre d'onglets calcule sa
  hauteur à partir de `insets.bottom`, ce qui couvre l'encoche de l'iPhone comme la barre
  gestuelle d'Android en edge-to-edge.
- **Barre d'état** : `expo-status-bar` en clair par défaut, et **en sombre dans le lecteur quand
  l'ambiance « Clair » est active** — sinon l'heure et la batterie deviennent illisibles.
- **Accessibilité** : tout bouton en icône seule porte un `accessibilityRole` et un
  `accessibilityLabel` (VoiceOver sur iOS, TalkBack sur Android).
- **iPhone d'abord** : `ios.supportsTablet: false`. Les écrans sont pensés pour le téléphone ;
  déclarer l'iPad obligerait à en soigner la mise en page, qu'Apple contrôle à la soumission.
- **Aucune permission demandée**, aucune collecte de données : `ITSAppUsesNonExemptEncryption:
  false`, pas d'ATT, et la fiche de confidentialité des stores se remplit en « aucune donnée
  collectée ».
- **Retour Android** : géré nativement par expo-router ; le lecteur désactive seulement le geste
  de balayage iOS pour ne pas le confondre avec le changement de chapitre.

## Structure

```
app/                        # les écrans (routage par fichiers, expo-router)
  _layout.tsx               # thème, contexte bibliothèque, pile de navigation
  index.tsx                 # écran d'ouverture (logo, catégories, devise)
  (tabs)/
    _layout.tsx             # barre d'onglets : Accueil, Explorer, Bibliothèque, Profil
    index.tsx               # Accueil : carrousel + « Reprendre la lecture »
    explorer.tsx            # recherche, catégories, Nouveautés, Populaires
    bibliotheque.tsx        # En cours / Favoris / Terminés / Tout
    profil.tsx              # « Mon espace » : statistiques réelles, Pass Lumia
  livre/[slug].tsx          # fiche livre : À propos / Chapitres / Avis
  lecture/[slug].tsx        # lecteur : chapitre par chapitre, réglages, langue, sommaire
  abonnement.tsx            # les trois formules : prix, contenu, résiliation
  langue.tsx                # langue de lecture et mode bilingue (formule Extra)
  conditions.tsx            # conditions d'utilisation (exigées par les boutiques)
  confidentialite.tsx       # politique de confidentialité
src/
  theme.ts                  # couleurs, typographie, espacements, cible tactile
  components/
    BookCover.tsx           # couverture du livre : image fournie, ou composée en repli
    Ornament.tsx            # motifs géométriques (étoile à 8 branches, filets, trame)
    LegalDocument.tsx       # la coquille commune aux deux textes juridiques
    ui.tsx                  # étiquettes, en-têtes, barre de progression, boutons
  data/
    types.ts                # le format d'un livre + les 7 catégories
    legal.ts                # l'éditeur de l'app et la date des textes juridiques
    books.ts                # LE CATALOGUE — c'est ici qu'on ajoute des livres
    books.<code>.ts         # le catalogue traduit (fichier généré, un par langue)
    catalog.ts              # les langues disponibles (fichier généré)
    covers.ts               # slug → couverture embarquée (fichier généré)
    plans.ts                # les trois abonnements : prix et contenu
  store/
    library.tsx             # progression, favoris, temps, formule, langue (AsyncStorage)
    catalog.tsx             # le catalogue dans la langue choisie
scripts/
  import-books.mjs          # convertit des exports HTML en entrées de catalogue
  translate-books.mjs       # traduit le catalogue dans une autre langue
  generate-catalog-index.mjs # écrit src/data/catalog.ts
assets/couvertures/         # les 56 couvertures, 720 px de large, ~9,6 Mo au total
```

## Ajouter des livres

Deux façons :

1. **À la main** — ajouter une entrée dans le tableau `BOOKS` de `src/data/books.ts`. Le format
   est décrit dans `src/data/types.ts`.
2. **Depuis des exports HTML** :

   ```bash
   npm run books:import -- ./mes-livres-html
   ```

   Le script écrit un fichier `books-a-coller.ts` à côté des HTML. Il ne modifie jamais le
   catalogue tout seul : les entrées se collent dans `BOOKS`, et il reste à renseigner
   `category` et `tags`, que le HTML ne contient pas, ainsi qu'à **réécrire `description`** —
   le script y met le premier paragraphe du livre, ce qui n'est pas une quatrième de couverture.

   Le script conserve la structure du HTML : intertitres `<h4>`, encadrés `.box` et `.stat`,
   avertissements `.box warn`, versets `.verse` avec leur référence, listes et tableaux.

   Ces livres commentent leur propre couverture, qu'ils appellent « l'affiche » : un chapitre
   d'ouverture « Ce que dit l'affiche », puis des renvois en plein texte. Comme l'app affiche
   désormais ces couvertures, ces passages sont **conservés** — le lecteur a l'image sous les
   yeux — et seul le mot change : « affiche » devient « couverture ». Le renommage ne
   s'applique qu'aux livres qui ont un intertitre consacré à leur couverture ; dans
   « Saladin », « les affiches » désigne l'imagerie populaire du personnage et reste tel quel.

**Conventions du corps de texte** (interprétées par le lecteur) :
- une ligne vide sépare deux blocs ;
- `## ` en début de bloc devient un intertitre doré ;
- `> ` devient une citation encadrée ; une ligne `— …` juste en dessous en donne la source ;
- des lignes commençant par `- ` deviennent une liste à puces ;
- `! ` devient un encadré d'avertissement (mise en garde de santé, nuance à ne pas rater).

Le catalogue contient **56 livres**, importés depuis les exports HTML du propriétaire du
projet : histoire, sciences, savoirs essentiels, développement personnel, culture et grands
personnages, soit environ 510 000 mots. L'ordre du tableau `BOOKS` compte : il donne le
carrousel de l'accueil et la rangée « Populaires ».

**Comment rendre compte d'un import.** Le propriétaire du projet demande deux ou trois
captures d'écran de l'app montrant les livres — pas un aperçu web à ouvrir. Un tel aperçu a
existé : le bundle web empaqueté en une page unique de plusieurs méga-octets. Il n'a jamais
réussi à s'ouvrir sur son téléphone, et il coûte du temps et de la place à chaque mise à
jour. Des captures suffisent, et elles se regardent tout de suite.

## Abonnements et langues

Les prix et le contenu de chaque formule sont décrits **une seule fois**, dans
`src/data/plans.ts` — l'écran d'abonnement les lit de là, aucun prix n'est écrit ailleurs :

| Accès | Prix | Ce qu'il donne |
| --- | --- | --- |
| Découverte | gratuit | **Un livre au choix**, gardé définitivement |
| À l'unité | 4,99 € par livre | Le livre acheté, gardé définitivement |
| Lumia Plus | 9,99 €/mois | Le catalogue complet en français |
| Lumia Premium | 15,99 €/mois | Une demande de livre par mois et un vote ; les nouveautés en avance |
| Lumia Extra | 19,99 €/mois | Toutes les langues, le changement de langue en cours de lecture, le mode bilingue |

`canRead(slug)` est la seule porte du catalogue : abonné, livre offert, ou livre acheté. Le
livre offert est **définitif** et l'app le dit avant de valider — un cadeau dont on découvre
la limite après coup est la pratique trompeuse que la charte interdit.

### Ce que la maquette proposait et qui n'a pas été repris

La maquette de l'écran d'abonnement portait des éléments que Lumia ne peut pas afficher :

- « **Rejoignez des milliers de lecteurs** » et une note de cinq étoiles signée « Membre
  Lumia » : l'app n'a ni public mesuré ni avis. La règle du projet — n'afficher aucun chiffre
  qu'on n'a pas mesuré — vaut ici comme pour l'onglet « Avis ».
- « **Le plus populaire** » sur la formule Premium : c'est une statistique, et il n'y en a
  pas. Remplacé par « Notre recommandation », qui est un avis d'éditeur assumé.
- « **Des centaines d'iBooks** » : il y en a 37. Le nombre affiché est celui du catalogue.
- « **Disponible sur tous vos appareils** » : il n'y a ni compte ni synchronisation.
  Remplacé par « Lecture hors ligne, sans compte », qui est la vraie force.
- « **Paiement sécurisé** » : aucun paiement n'existe encore, et l'écran le dit à la place.
- Le mot « **iBooks** » est une marque d'Apple ; l'app dit « livres ».
- La **photographie de personnage** du bandeau : la règle sur la représentation figurative
  l'exclut. Remplacée par le motif géométrique.

Les fonctions annoncées mais absentes — demande de livre, vote, nouveautés en avance,
traductions — sont signalées sur la carte de leur formule, en clair.

### Brancher les achats intégrés

Le paiement doit se faire **dans l'app, sans que rien ne s'ouvre** : une fenêtre native de
l'App Store ou de Google Play monte par-dessus Lumia, Face ID, terminé. Les deux boutiques
l'imposent pour du contenu numérique — une app qui déverrouille un livre contre un paiement
extérieur est rejetée à la validation. Stripe ne peut donc pas jouer ce rôle ici : il reste
bon pour vendre sur un site, mais l'app n'a aucun moyen de savoir qu'un téléphone donné a
payé sans comptes ni serveur, c'est-à-dire sans renoncer aux trois promesses de Lumia.

Ce qui manque, dans l'ordre :

1. **Les deux comptes développeur** — Apple Developer Program (99 $/an) et Google Play
   Console (25 $ une fois). C'est la seule pièce bloquante, et elle appartient au
   propriétaire du projet. S'inscrire en personne physique évite le numéro D-U-N-S
   qu'Apple exige d'une société.
2. **Déclarer les produits** dans App Store Connect et dans la Play Console, avec les
   identifiants déjà fixés dans `src/data/plans.ts` : les trois abonnements dans un même
   groupe (sinon le passage d'une formule à l'autre ne fonctionne pas), et un produit non
   consommable par livre. Il faut aussi signer le contrat des applications payantes et
   renseigner les coordonnées bancaires : sans lui, les produits restent invisibles.
3. **Le code** : brancher la bibliothèque d'achat et remplacer `setPlan` et `purchaseBook`
   dans `src/store/library.tsx`. Le reste ne bouge pas — `canRead(slug)` est déjà la seule
   porte du catalogue, et les écrans d'achat existent déjà. Il faudra aussi ajouter le
   bouton **« Restaurer mes achats »**, qu'Apple exige et qui n'a aucun sens tant qu'aucun
   achat ne passe par une boutique.

Deux choses à ne pas découvrir en route : les achats intégrés **ne se testent pas dans Expo
Go** (il faut un build EAS signé, donc le compte Apple), et la vente à l'unité demande
**112 fiches produit** à créer à la main, deux de plus par livre ajouté.

### Ce que les boutiques exigent, et qui est déjà là

- `app/conditions.tsx` et `app/confidentialite.tsx` portent les deux textes, atteignables
  depuis l'écran d'abonnement **et** depuis « Mon espace » — un lecteur qui cherche la
  politique de confidentialité n'a pas à traverser une page qui vend.
- L'écran d'abonnement annonce la durée, le prix, le **renouvellement automatique** et le
  lieu de la résiliation. Apple contrôle ces quatre points à la validation.
- Les conditions ne recopient aucun prix : elles lisent `PLANS` et `BOOK_PRICE`. Un prix
  recopié à la main finit par être faux, et un prix faux dans les conditions est la
  pratique trompeuse que la charte interdit.
- **`src/data/legal.ts` contient encore des espaces réservés** : le nom de l'éditeur et son
  adresse de contact. Tant qu'ils le sont, les deux écrans affichent un avertissement
  rouge, pour que des conditions signées « À COMPLÉTER » ne partent pas à la validation
  sans que personne ne s'en aperçoive.

`hasPlan(plan, "extra")` est la seule porte des langues. Le reste de l'app passe par
`canChangeLanguage`, exposé par le contexte bibliothèque, plutôt que de comparer des noms de
formules un peu partout.

### Traduire le catalogue

```bash
npm run books:translate -- en --dry-run   # volume et coût, sans rien appeler
npm run books:translate -- en             # écrit src/data/books.en.ts
npm run catalog:index                     # déclare la langue à l'app
```

La traduction est faite **une fois, hors ligne**, puis embarquée : traduire au moment de la
lecture obligerait à appeler un serveur, ce qui casserait les trois promesses de Lumia et
ferait payer chaque lecteur. Il faut `ANTHROPIC_API_KEY`, et le coût est par langue.

Ce que le script garantit, et pourquoi :

- **Les `slug` ne bougent jamais.** Ils identifient la progression et les favoris sur
  l'appareil : c'est ce qui permet de changer de langue au milieu d'un livre sans perdre sa
  page.
- **Les citations religieuses ne sont pas traduites par la machine.** Un verset ou un hadith
  re-traduit automatiquement ne serait la traduction reconnue de personne. Les blocs `>` dont
  la source cite le Coran, un recueil de hadiths ou un texte biblique sont mis de côté et
  restent en français — 58 des 60 citations du catalogue — puis listés en fin de course pour
  qu'une traduction reconnue y soit placée à la main.
- **Les chiffres et la structure sont vérifiés.** Un chapitre dont la traduction n'a pas
  exactement les mêmes nombres et les mêmes marqueurs (`##`, `>`, `-`, `!`) est retraduit ;
  s'il échoue encore, il reste en français et il est signalé. Mieux vaut une page non traduite
  qu'une page dont « d = 0,65 » a bougé.
- **Le travail reprend où il s'est arrêté** : chaque chapitre traduit est mis en cache dans
  `.cache-traductions/` (non versionné).

`src/data/catalog.ts` est **généré** par `npm run catalog:index` : Metro exige des chemins
d'import littéraux, donc la liste des langues disponibles se déduit des `books.<code>.ts`
présents sur le disque.

## Choix assumés

- **Pas de notes ni d'avis pour l'instant.** L'onglet « Avis » de la fiche livre dit qu'il n'est
  pas actif plutôt que d'afficher « 4,8 ★ (1,2k) » comme la maquette : ces chiffres demanderaient
  un serveur et de vrais lecteurs. Rien dans l'app n'affiche un nombre qu'elle n'a pas mesuré —
  le temps de lecture du profil est compté minute par minute dans le lecteur, pas estimé.
- **« Populaires » suit l'ordre du catalogue** tant qu'aucune statistique d'usage n'existe.
- **Pas de `react-native-svg`** : les motifs sont faits de vues et de rotations. Une dépendance
  native en moins, et un rendu net à toutes les tailles.
- **`typedRoutes` désactivé** dans `app.json` : sur cette combinaison de versions d'Expo, le
  générateur de types de routes échoue à résoudre `expo-router` et empêche le serveur de
  démarrer. C'est un confort de typage, pas une fonctionnalité.
- **`react-dom` figé sur la version exacte de `react`** : un écart entre les deux provoque
  l'erreur React #527 au rendu web. Cela ne concerne que la prévisualisation web, pas mobile.

## Historique

Ce dépôt contenait auparavant **Lumia en site web** (Next.js + Prisma + Stripe : catalogue,
lecteur, profils, abonnements, avis, panneau d'administration). Il a été supprimé sur demande.
Tout ce code reste consultable dans l'historique Git au tag `lumia-avant-reset` :

```bash
git show lumia-avant-reset --stat
git checkout lumia-avant-reset -- .   # pour le restaurer
```
