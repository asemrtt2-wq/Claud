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
- Ces couvertures ne montrent **ni personne ni animal** — objets, architecture, paysages,
  typographie. La seule exception relevée est **« L'intelligence sociale »**, dont douze masques
  de théâtre portent des visages ; elle a été signalée au propriétaire, qui a choisi de la
  garder. L'aigle impérial brodé sur les drapeaux de « Napoléon » est un emblème héraldique.
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
- Les **abonnements réels** non plus : le « Pass Lumia » de l'écran Profil est un simple
  interrupteur local. Le jour où un vrai paiement arrive, la ligne « prix clair, résiliation
  claire » du tableau devient une contrainte de conception, pas un slogan.
- **Aucun livre du catalogue n'est réservé au Pass** : le champ `premium` existe dans le format
  (`src/data/types.ts`) et la fiche livre sait verrouiller, mais aucune entrée ne le porte. Les
  28 livres sont lisibles. Choisir lesquels réserver est une décision du propriétaire du
  projet, pas quelque chose à décider en écrivant le catalogue.

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
  lecture/[slug].tsx        # lecteur : chapitre par chapitre, réglages, sommaire
src/
  theme.ts                  # couleurs, typographie, espacements, cible tactile
  components/
    BookCover.tsx           # couverture du livre : image fournie, ou composée en repli
    Ornament.tsx            # motifs géométriques (étoile à 8 branches, filets, trame)
    ui.tsx                  # étiquettes, en-têtes, barre de progression, boutons
  data/
    types.ts                # le format d'un livre + les 7 catégories
    books.ts                # LE CATALOGUE — c'est ici qu'on ajoute des livres
    covers.ts               # slug → couverture embarquée (fichier généré)
  store/library.tsx         # progression, favoris, temps de lecture (AsyncStorage)
scripts/import-books.mjs    # convertit des exports HTML en entrées de catalogue
assets/couvertures/         # les 28 couvertures, 720 px de large, ~4,7 Mo au total
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
   avertissements `.box warn`, versets `.verse` avec leur référence, listes et tableaux. Il
   **écarte** en revanche les chapitres et les sous-parties consacrés à commenter
   l'illustration de couverture du livre d'origine (« Ce que dit l'affiche », « La phrase de
   l'affiche »…) : Lumia compose ses couvertures en code, sans représentation figurative, et un
   texte qui décrit une image que le lecteur ne verra jamais n'a pas sa place dans l'app. Les
   mentions isolées qui restent en plein chapitre se relisent à la main.

**Conventions du corps de texte** (interprétées par le lecteur) :
- une ligne vide sépare deux blocs ;
- `## ` en début de bloc devient un intertitre doré ;
- `> ` devient une citation encadrée ; une ligne `— …` juste en dessous en donne la source ;
- des lignes commençant par `- ` deviennent une liste à puces ;
- `! ` devient un encadré d'avertissement (mise en garde de santé, nuance à ne pas rater).

Le catalogue contient **28 livres**, importés depuis les exports HTML du propriétaire du
projet : histoire, sciences, savoirs essentiels, développement personnel, culture et grands
personnages, soit environ 245 000 mots. L'ordre du tableau `BOOKS` compte : il donne le
carrousel de l'accueil et la rangée « Populaires ».

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
