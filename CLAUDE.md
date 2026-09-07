# CLAUDE.md

## Ce que c'est

**Lumia** — une application de lecture native, **iOS et Android**, écrite une seule fois avec
Expo (React Native) et expo-router. Il n'y a plus de site web : l'ancienne plateforme Next.js a
été supprimée à la demande du propriétaire du projet (voir « Historique » plus bas).

L'app fonctionne **entièrement hors ligne** : les livres sont embarqués dans le bundle, la
progression est stockée sur l'appareil. Aucun compte, aucun serveur, aucune donnée envoyée.

## Règles de contenu — non négociables

Ces règles gouvernent chaque écran et chaque livre ajouté. Elles ont été posées par le
propriétaire du projet et ne doivent pas être contournées « pour faire joli ».

1. **Aucune représentation figurative.** Ni personnage, ni visage, ni silhouette, ni animal —
   dans l'interface comme sur les couvertures. C'est la raison pour laquelle
   `src/components/BookCover.tsx` compose les couvertures en code (dégradé + motif géométrique
   + typographie) au lieu d'afficher une image, et pourquoi l'onglet « Profil » porte une icône
   de médaille plutôt que la silhouette de la maquette d'origine.
   La maquette de référence montrait des portraits (Saladin, Ibn Sina, Marc Aurèle) sur les
   couvertures : la mise en page a été suivie, l'imagerie non.
2. **100 % halal, chaste et respectueux.** Le contenu des livres reste sobre et décent.
3. **Respect du christianisme** comme des autres religions : aucun contenu qui les dénigre.

Toute nouvelle fonctionnalité qui introduirait une image de personne ou d'animal est à refuser
ou à remplacer par un équivalent géométrique.

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
    BookCover.tsx           # couverture composée, sans image
    Ornament.tsx            # motifs géométriques (étoile à 8 branches, filets, trame)
    ui.tsx                  # étiquettes, en-têtes, barre de progression, boutons
  data/
    types.ts                # le format d'un livre + les 7 catégories
    books.ts                # LE CATALOGUE — c'est ici qu'on ajoute des livres
  store/library.tsx         # progression, favoris, temps de lecture (AsyncStorage)
scripts/import-books.mjs    # convertit des exports HTML en entrées de catalogue
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
   `category` et `tags`, que le HTML ne contient pas.

**Conventions du corps de texte** (interprétées par le lecteur) :
- une ligne vide sépare deux paragraphes ;
- une ligne commençant par `> ` devient une citation encadrée ;
- des lignes commençant par `- ` deviennent une liste à puces.

Les deux livres présents (« L'art de la discipline », « La patience comme force ») sont des
exemples courts, écrits pour que les écrans aient quelque chose de réel à afficher. Ils sont
faits pour être remplacés.

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
