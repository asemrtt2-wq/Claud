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
- **Les 194 livres du catalogue ont leur image.** Ce n'est pas un simple confort : le premier
  chapitre de chacun s'intitule « Ce que dit la couverture » et décrit une image précise — un
  sablier, une pomme entamée dans un miroir, une faille dans la banquise. Sans l'image, le
  lecteur lit la description de quelque chose qu'il ne voit pas. Un livre importé doit donc
  arriver avec sa couverture, et `npm run books:import` l'extrait désormais tout seul.
- **La règle reste la règle pour tout le reste** : aucun portrait, aucune silhouette, aucun
  animal ailleurs dans l'app. La maquette d'origine posait des portraits (Saladin, Ibn Sina,
  Marc Aurèle) sur les couvertures : ceux-là restent exclus.
- **Soixante-douze couvertures portent leur formule incrustée dans l'image** — « EXCLUSIVITÉ
  PREMIUM · 15,99 €/MOIS », « INCLUS AVEC PLUS · 9,99 €/MOIS », une pastille « EXTRA
  19,99 € ». C'était une promesse que l'app ne tenait pas ; elle la tient, voir « Les livres
  réservés » plus bas. Reste une limite à connaître : **le prix est dans le JPEG**, donc un
  changement de tarif obligerait à refaire ces images. Les prix du reste de l'app viennent
  tous de `plans.ts`.

  **Auditer chaque couverture importée, en haut et en bas.** La mention se place où le
  graphiste a voulu : bandeau supérieur, bandeau vertical à gauche, pastille au pied.
  Trente-huit livres importés les 21 et 23 septembre 2026 en portaient une sans que le champ
  `plan` soit posé. **Il a fallu trois passes pour toutes les trouver** : le bandeau
  supérieur, puis le pied — six ne s'y voyaient que là, dont al-Ghazali, Ibn Tufayl et « L'art
  de dire non » —, puis la couverture entière, parce que « Commencer avant d'être prêt » porte
  sa pastille en plein milieu. Ne pas se limiter à un bord.

  Deux garde-fous valent mieux qu'un œil attentif : un **contrôle croisé** qui vérifie que
  chaque livre importé est classé exactement une fois, avec mention ou sans — il a rattrapé
  « Sénèque », oublié malgré une mention bien visible — et `npm run verifier`, qui éprouve
  ensuite chaque livre réservé sur les quatre formules.

  Les 99 livres antérieurs ont été réaudités de la même manière : aucun autre n'est
  concerné. La mention n'apparaît que dans les exports récents — et elle y est désormais
  fréquente : six des huit livres du 24 septembre en portaient une. **Auditer les
  couvertures avant d'écrire les fiches**, et non après, évite d'avoir à repasser sur le
  catalogue une fois les entrées posées.

  **Une couverture peut se contredire.** Celle de « Où vont nos eaux usées ? » annonce
  « LUMIA EXTRA » et « 15,99 € », alors qu'Extra est à 19,99 € et que 15,99 € est le prix de
  Premium. Le livre est verrouillé sur **la formule nommée**, la plus protectrice pour le
  lecteur ; l'image, elle, reste à refaire. Signalé au propriétaire du projet.

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

Toute nouvelle fonctionnalité qui introduirait une image de personne ou d'animal, ou un contenu
tombant dans une case « interdit » du tableau, est à refuser ou à remplacer.

## Lancer et construire

```bash
npm install
npm start            # serveur de développement ; scanner le QR code avec Expo Go
npm run android      # ouvrir sur un appareil / émulateur Android
npm run ios          # ouvrir sur un simulateur iOS (nécessite un Mac)
npm run typecheck    # vérification TypeScript
npm run verifier     # passe l'app en revue, écran par écran
```

`npm run verifier` n'est pas un aperçu à regarder : c'est une batterie de contrôles qui
échouent bruyamment et renvoient un code d'erreur. Il reconstruit l'export web **quand il
manque ou qu'il est plus vieux que `src/` et `app/`** — sans cette comparaison de dates, la
batterie passait au vert contre le bundle de la veille, ce qui est pire que pas de batterie
du tout. Il ouvre ensuite chaque écran en relevant les erreurs de console, puis **éprouve la porte du
catalogue pour les quatre états d'abonnement** — sans abonnement, Plus, Premium, Extra —
sur **chacun des livres réservés**, plus un livre ordinaire. Il vérifie enfin ce que l'app
ne doit **jamais** proposer : acheter un livre réservé, l'offrir en cadeau, promettre
« le catalogue complet », ou laisser traîner un « À COMPLÉTER » dans un texte juridique.

La liste des livres réservés n'est pas recopiée dans le script : il la **lit dans
`src/data/books.ts`**. Ajouter un livre réservé sans le tester serait autrement trop
facile — il entre dans la batterie tout seul, et les quatre formules sont éprouvées sur
lui à la ligne suivante. Avec 72 livres réservés, la revue complète demande une petite demi-heure : c'est le prix de ne rien échantillonner.

**Une seule revue à la fois.** Le serveur prend désormais un port libre au lieu du 8110
fixe, mais cela ne suffit pas : chaque exécution lance `expo export --clear`, qui efface
`dist/`. Deux revues simultanées se retirent donc le tapis l'une à l'autre, et celle qui
survit signale de **faux échecs** — six, la première fois, sur des livres parfaitement
corrects. Un échec de revue lancée en parallèle d'une autre ne prouve rien ; relancer seul
avant de conclure.

**Pour produire les vraies applications** (fichiers `.ipa` / `.aab` à envoyer aux stores), il
faut EAS Build, qui compile dans le cloud — y compris la version iOS, sans posséder de Mac.
`eas.json` est déjà écrit ; il n'y a donc pas de `build:configure` à lancer :

```bash
npx eas login
npx eas build --platform android --profile production   # .aab pour Google Play
npx eas build --platform ios --profile production       # .ipa pour l'App Store
```

Trois profils : `development` (build de développement, seul moyen de tester les achats
intégrés, qu'Expo Go ne sait pas faire), `preview` (un APK à installer directement, pour
faire essayer l'app), `production` (ce qui part aux boutiques).

Comptes nécessaires pour publier : **Apple Developer Program** (99 $/an) et **Google Play
Console** (25 $ une fois). Ce sont les seules pièces qui manquent — le code, lui, est prêt.

### La fiche des boutiques

`boutique/fiche-boutiques.md` contient tout ce que les deux boutiques demandent d'écrire :
nom, sous-titre, description, mots-clés, catégories, classification d'âge, et les réponses
à la fiche de confidentialité — « aucune donnée collectée », ce qui n'est pas une prudence
mais une conséquence de l'architecture. Deux URL restent à fournir : confidentialité et
support. Les textes existent dans l'app, mais les boutiques exigent en plus une page web
publique qui les héberge.

```bash
npm run boutique:captures   # boutique/captures/ — captures aux dimensions exactes
```

```bash
npm run boutique:pages      # boutique/pages/ — les pages légales du site
```

Les deux boutiques exigent une **adresse web publique** hébergeant la politique de
confidentialité, en plus du texte affiché dans l'app. Les deux versions doivent dire la même
chose : une politique à deux visages est un motif de rejet. Plutôt que de recopier les textes
— une copie finit toujours par diverger — le script **ouvre les écrans `/conditions` et
`/confidentialite` de l'app** dans Chromium et en extrait le rendu. Ce que le site publie est
donc au mot près ce que le lecteur voit, prix compris, puisque ces écrans lisent `plans.ts`.

Il reconnaît les intertitres à leur `accessibilityRole="header"`, posé dans `LegalDocument` —
la même annotation sert à VoiceOver et à TalkBack. Il écarte deux choses qui n'ont pas leur
place sur un site public : l'encadré qui rappelle de renseigner `src/data/legal.ts`, et les
glyphes de la police d'icônes, qui arrivent dans le texte extrait et s'afficheraient en carrés.

Il produit en plus un modèle de **mentions légales**, que l'app ne porte pas : en France, la
loi impose de dire qui édite un site et qui l'héberge. Les champs entre crochets sont à
remplir — et à faire vérifier, ce script ne donne pas de conseil juridique.

Le script des captures rend l'app dans Chromium aux tailles imposées (1320 × 2868 pour l'App Store,
1080 × 2340 pour Google Play) plutôt que de redimensionner après coup, ce qui donnerait du
texte flou. Il **pose un état de lecture** avant chaque capture — livre offert pris,
lecture en cours — parce qu'un navigateur neuf montrerait un écran verrouillé et un accueil
vide. L'écran du livre offert, lui, est capturé sans état : l'offre n'a de sens que tant
qu'elle n'est pas prise. Il produit aussi la bannière 1024 × 500 de Google Play, purement
typographique comme le reste de l'interface.

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
  cadeau.tsx                # le livre offert : les 5 proposés, un seul à garder
  abonnement.tsx            # les trois formules : prix, contenu, résiliation
  langue.tsx                # langue de lecture et mode bilingue (formule Extra)
  conditions.tsx            # conditions d'utilisation (exigées par les boutiques)
  confidentialite.tsx       # politique de confidentialité
src/
  theme.ts                  # couleurs, typographie, espacements, cible tactile
  components/
    BookCover.tsx           # couverture du livre : image fournie, ou composée en repli
                            # ⚠ sa prop `label` n'est dessinée que sur la couverture
                            #   composée ; avec une image, elle est ignorée (voir plus bas)
    Ornament.tsx            # motifs géométriques (étoile à 8 branches, filets, trame)
    LegalDocument.tsx       # la coquille commune aux deux textes juridiques
    ui.tsx                  # étiquettes, en-têtes, barre de progression, boutons
  data/
    types.ts                # le format d'un livre + les 7 catégories
    legal.ts                # l'éditeur, l'hébergeur du site, la date des textes
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
  import-covers.mjs         # embarque des couvertures, ramenées à 720 px
  generate-covers.mjs       # écrit src/data/covers.ts
  captures-boutique.mjs     # les captures d'écran aux dimensions des boutiques
  pages-legales.mjs         # les pages légales du site, extraites de l'app
  verifier-app.mjs          # la revue écran par écran, et la porte du catalogue
boutique/
  fiche-boutiques.md        # description, mots-clés, âge, confidentialité : le texte des fiches
  captures/                 # les images à téléverser (générées)
  pages/                    # les pages légales du site (générées depuis l'app)
eas.json                    # les trois profils de build EAS
assets/couvertures/         # les 194 couvertures, 720 px de large, ~34 Mo
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

   **Il extrait aussi la couverture.** Ces exports embarquent deux images en base64 — la
   couverture, puis une affiche de synthèse « Ce qu'il faut retenir » — ce qui explique leurs
   cinq à huit méga-octets pour cent kilo-octets de texte. Seule la première est retenue :
   c'est celle que le premier chapitre décrit. Elle atterrit dans `couvertures/` à côté des
   HTML, nommée par le slug du livre, et s'embarque ensuite :

   ```bash
   npm run covers:import -- ./mes-livres-html/couvertures   # redimensionne vers assets/
   npm run covers:index                                     # écrit src/data/covers.ts
   ```

   Les onze livres du 14 septembre 2026 ont d'abord été importés sans leur image, parce que
   personne n'avait pensé à regarder dans le HTML. Ne pas refaire le trajet : la couverture
   est dans le fichier.

   Ces livres commentent leur propre couverture, qu'ils appellent « l'affiche » : un chapitre
   d'ouverture « Ce que dit l'affiche », puis des renvois en plein texte. Comme l'app affiche
   désormais ces couvertures, ces passages sont **conservés** — le lecteur a l'image sous les
   yeux — et seul le mot change : « affiche » devient « couverture ». Le renommage ne
   s'applique qu'aux livres qui ont un intertitre consacré à leur couverture ; dans
   « Saladin », « les affiches » désigne l'imagerie populaire du personnage et reste tel quel.

**Les seize livres du 14 septembre 2026 n'ont pas d'accents dans leur corps de texte** —
« la canne a sucre cultivee descend d'especes sauvages selectionnees ». Le défaut vient de
l'export HTML, pas de l'import : les onze livres de la veille sont parfaits. Le propriétaire
du projet en a été averti, avec le choix entre réexporter et une reprise automatique ; il a
répondu « laisse comme ça, je ferai attention pour la suite ». C'est donc un état **connu et
accepté**, à ne pas « corriger » à l'aveugle.

Ce qui a pu être réparé sans rien deviner l'a été : le sommaire de ces fichiers avait gardé
ses accents, et l'import reprend de là le titre de chaque chapitre quand les deux graphies ne
diffèrent que par les accents. Seul le corps reste tel quel.

**Le défaut est intermittent, pas systématique.** Sur les quarante livres du 21 septembre
2026, trente-huit sont parfaitement accentués ; seuls « Abbas ibn Firnas » et « Al-Idrisi »
sont touchés. Ne pas conclure d'un export au suivant : la densité d'accents se mesure en une
commande, et un texte français sain tourne autour de 15 à 18 %.

**Deux pièges de ces exports récents, tous deux réglés dans le script :**

- Ils suffixent le titre du nom de l'app — `<title>Descartes - LUMIA</title>`. Laissé tel
  quel, « LUMIA » partait dans le titre affiché **et dans le slug**, qui identifie la
  progression sur l'appareil : `descartes-lumia` ne se renomme plus après coup sans perdre
  la page où le lecteur s'était arrêté. `import-books.mjs` retire ce suffixe comme il
  retirait déjà « — iBook ».
- **La balise `<title>` perd des accents que le corps garde.** Le livre écrit « une île »,
  « Ératosthène », « Dostoïevski », « le métal » ; sa balise écrit « une ile », « Eratosthene ».
  Le titre affiché doit donc suivre **la graphie du corps du texte**, qui est la bonne —
  vérification faite livre par livre, pas au jugé.

**Deux livres différents peuvent porter le même nom.** Le catalogue contient « Nietzsche »
et « Friedrich Nietzsche » : ce ne sont pas des doublons. Le premier porte sur la
falsification de l'œuvre par sa sœur et l'archive de Weimar, le second est la vie et les
livres. Les titres restent ceux du propriétaire du projet — inventer un titre serait un
acte éditorial qui ne revient pas au code — et c'est le **sous-titre** qui les distingue.

Un livre déjà au catalogue peut aussi être renvoyé : c'est arrivé pour « Le premier
passeport », « Guglielmo Marconi », « Ératosthène » et « Al-Ghazali : doute et certitude »,
réimportés à l'identique, au chapitre près. Comparer le slug et le nombre de chapitres avant
d'insérer, et écarter le renvoi — en pensant aussi à retirer la couverture extraite, sinon
elle reste orpheline dans `assets/couvertures/`.

**Mais un même nom peut cacher un second tome.** « Al-Farabi » et « Rousseau » sont arrivés
une deuxième fois avec un sommaire presque entièrement différent — 3 et 4 titres de chapitre
communs seulement. Ce ne sont ni des renvois ni des réécritures : **les livres le disent
eux-mêmes**. « Rousseau » écrit qu'« un autre volume de cette collection porte déjà sur
Rousseau » et décrit son contenu ; le nouvel « Al-Farabi » écrit que « cette collection
compte déjà un volume consacré à al-Farabi » et que « les deux se complètent sans se
répéter ». Chercher ces phrases avant de conclure.

Ces paires passent par le champ **`series`**. Les deux membres le portent, sinon un seul
s'annonce comme un tome, ce qui ressemble à un défaut. Le slug du second doit **différer** —
`al-farabi-la-cite-vertueuse` à côté d'`al-farabi` — parce qu'un slug déjà publié ne se
réaffecte pas sans déplacer la progression des lecteurs vers un autre livre.

**Où le tome se voit, et où il ne se voit pas.** `BookCover` reçoit bien un `label`
« Tome N » depuis l'accueil, l'explorateur et la fiche livre, mais **il le jette dès qu'une
image de couverture existe** : la branche `if (artwork)` retourne avant de le dessiner. Comme
les 194 livres ont leur image, cette étiquette ne s'affiche nulle part. Le tome est donc
rendu ailleurs : en texte dans l'onglet « Bibliothèque », et en étiquette dans la rangée de
tags de la fiche livre, qui est l'écran où l'on choisit quel volume ouvrir. Incruster le
label par-dessus l'image reste possible, mais c'est une décision de mise en page qui revient
au propriétaire du projet — ses couvertures portent déjà leurs propres mentions dans les
coins.

À ne pas confondre avec « Nietzsche » et « Friedrich Nietzsche », qui sont deux livres
distincts sur un même personnage et ne se déclarent pas comme tomes : eux se distinguent
par leur sous-titre, pas par `series`.

**Un jumeau n'est pas un tome.** « Peur d'échouer » et « Peur de réussir » se nomment
mutuellement « livre jumeau », et « 7 jours sans scroll » en annonce un aussi. Mais un
jumeau n'a **pas d'ordre** : les numéroter Tome 1 et Tome 2 inventerait une succession que
l'auteur ne donne pas, alors que « Rousseau » écrit noir sur blanc lequel est « le volume
déjà paru ». Ces paires-là restent donc sans `series` — leurs titres se distinguent
d'eux-mêmes. Le critère est le mot employé : « volume », avec un ordre → `series` ;
« jumeau », sans ordre → rien.

Ces renvois entre livres valent aussi pour ce qui **manque** : « 7 jours sans scroll »
décrit un jumeau consacré aux études sur la réduction des réseaux sociaux, qui n'est pas au
catalogue — « Ton cerveau après l'écran » porte sur le sommeil et l'attention, pas sur ces
études. Signalé au propriétaire du projet plutôt que comblé par une approximation.

**Un livre peut aussi nommer l'autre en toutes lettres.** Le second « Dostoïevski » écrit
qu'« un autre livre de cette collection porte le même nom d'auteur », puis donne son titre :
« Dostoïevski : liberté, culpabilité, souffrance et responsabilité ». C'est le cas le plus
confortable — il n'y a rien à deviner. Sans ordre de volume entre eux, pas de `series` : le
nouveau prend le slug `dostoievski-la-philosophie-d-etre-seul`, d'après ce que sa couverture
annonce, et le sous-titre fait le reste.

**Conventions du corps de texte** (interprétées par le lecteur) :
- une ligne vide sépare deux blocs ;
- `## ` en début de bloc devient un intertitre doré ;
- `> ` devient une citation encadrée ; une ligne `— …` juste en dessous en donne la source ;
- des lignes commençant par `- ` deviennent une liste à puces ;
- `! ` devient un encadré d'avertissement (mise en garde de santé, nuance à ne pas rater).

Le catalogue contient **194 livres**, importés depuis les exports HTML du propriétaire du
projet : histoire, sciences, savoirs essentiels, développement personnel, culture, grands
personnages et philosophie, soit environ 1 670 000 mots. L'ordre du tableau `BOOKS` compte : il donne le
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
| Découverte | gratuit | **Un livre au choix parmi cinq**, gardé définitivement |
| À l'unité | 4,99 € par livre | Le livre acheté, gardé définitivement — sauf les livres réservés, qui ne se vendent pas |
| Lumia Plus | 9,99 €/mois | Le catalogue en français, hors les livres réservés à Premium et à Extra |
| Lumia Premium | 15,99 €/mois | Une demande de livre par mois et un vote ; les nouveautés en avance |
| Lumia Extra | 19,99 €/mois | Toutes les langues, le changement de langue en cours de lecture, le mode bilingue |

`canRead(slug)` est la seule porte du catalogue : abonné, livre offert, ou livre acheté. Le
livre offert est **définitif** et l'app le dit avant de valider — un cadeau dont on découvre
la limite après coup est la pratique trompeuse que la charte interdit.

### Les livres réservés à une formule

**Soixante-douze couvertures** annoncent une exclusivité d'abonnement : 38 pour Extra, 18 pour
Premium, 16 pour Plus. Le nombre n'est pas à recopier de tête — il se compte dans le
catalogue, et la revue le rappelle à chaque exécution.

Le champ **`plan`** de `Book` est ce qui rend cette mention vraie. Sans lui, l'image
promettrait une exclusivité que le code n'appliquerait pas, ce qui est exactement la pratique
trompeuse interdite par la charte.

Ce qu'il change, décidé par le propriétaire du projet :

- **un livre réservé ne s'achète pas à l'unité** et ne peut pas être le livre offert. Seul
  l'abonnement l'ouvre. `purchaseBook` et `canClaimFree` le refusent, dans le contexte et non
  dans les écrans ;
- **les formules s'empilent** : Premium ouvre ce qui est réservé à Plus, Extra ouvre tout.
  C'est `hasPlan`, qui servait déjà aux langues ;
- un livre **sans** `plan` garde la règle ordinaire : n'importe quel abonnement, le livre
  offert, ou 4,99 € à l'unité.

`requiredPlan(slug)` (`src/data/books.ts`) est la table de ces exigences, construite sur le
catalogue **français** : l'accès ne dépend pas de la langue de lecture. Les écrans s'en
servent pour ne jamais proposer d'acheter ce qui ne se vend pas — la fiche livre affiche
« S'abonner à Lumia Premium » au lieu de « Acheter — 4,99 € ».

Conséquence sur la formule Plus : elle **ne donne plus « le catalogue complet »**, et
`plans.ts` ne l'écrit plus. L'écran d'abonnement affiche en outre, sous chaque carte, le
nombre de livres que la formule est seule à ouvrir — compté dans le catalogue, comme tous
les chiffres de l'app.

### Le livre offert : cinq livres, un seul à garder

L'offre portait au départ sur tout le catalogue ; le propriétaire du projet l'a restreinte à
une sélection de cinq. Elle vit dans `FREE_PICKS` (`src/data/plans.ts`) et **nulle part
ailleurs** — c'est un choix éditorial, une ligne à changer. Les cinq retenus couvrent cinq
catégories sur sept et se lisent sans rien connaître du reste : « Saladin », « L'histoire de
l'argent », « Le piège du "encore 5 minutes" », « Les manipulations invisibles » et « Les
bienfaits de la journée d'un musulman ».

- `app/cadeau.tsx` présente les cinq et prend le choix. Il est atteignable depuis l'écran
  d'ouverture, « Mon espace » et l'écran d'abonnement.
- `claimFreeBook` **refuse un slug hors sélection** : la règle est dans le contexte, pas
  dans les écrans, comme `canRead` pour le catalogue.
- `canClaimFree(slug)` dit si *ce* livre peut être pris maintenant. La fiche livre s'en sert
  pour ne proposer « Lire gratuitement » que sur les cinq — proposer puis refuser serait une
  porte peinte sur un mur ; ailleurs, elle renvoie vers la sélection.

### Ce que la maquette proposait et qui n'a pas été repris

La maquette de l'écran d'abonnement portait des éléments que Lumia ne peut pas afficher :

- « **Rejoignez des milliers de lecteurs** » et une note de cinq étoiles signée « Membre
  Lumia » : l'app n'a ni public mesuré ni avis. La règle du projet — n'afficher aucun chiffre
  qu'on n'a pas mesuré — vaut ici comme pour l'onglet « Avis ».
- « **Le plus populaire** » sur la formule Premium : c'est une statistique, et il n'y en a
  pas. Remplacé par « Notre recommandation », qui est un avis d'éditeur assumé.
- « **Des centaines d'iBooks** » : le nombre affiché est compté dans le catalogue, à
  l'exécution. Ne pas le recopier ici — un chiffre écrit à la main devient faux au premier
  import, et il l'était déjà (« 37 » pour un catalogue qui en comptait 99).
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

**Apple Pay et Google Pay ne sont pas cela**, malgré la ressemblance. Ce sont des moyens de
paiement pour des biens et des services hors de l'app ; Apple interdit expressément de s'en
servir pour déverrouiller du contenu numérique. L'expérience recherchée — une fenêtre qui
monte, un visage, terminé — est bien celle des achats intégrés, qui débitent la carte déjà
enregistrée sur l'identifiant Apple ou le compte Google. Seul le nom diffère, et c'est le
nom qui décide de l'acceptation à la validation.

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
- **L'éditeur est renseigné** dans `src/data/legal.ts` : Asem, cameradaction0@gmail.com.
  Le garde-fou reste en place — si ces champs repassaient à `À COMPLÉTER`, les deux écrans
  afficheraient de nouveau un avertissement rouge, et le générateur des pages du site le
  signalerait en fin de course.
- **L'hébergeur du site vit dans la même constante `HOST`** (`src/data/legal.ts`) :
  aujourd'hui Hostinger. Changer d'hébergeur, c'est changer ces trois lignes puis relancer
  `npm run boutique:pages` — rien n'est écrit en dur dans le script. Ses coordonnées sont à
  revérifier sur ses propres mentions légales, qui font foi ; son **téléphone est laissé
  vide** plutôt qu'inventé, et la page le signale tant qu'il manque.
- **L'éditeur a demandé que son adresse personnelle ne soit pas publiée.** Les mentions
  légales s'appuient donc sur ce que la loi autorise à un éditeur non professionnel :
  l'adresse n'est pas affichée, l'identité est détenue par l'hébergeur, et ce sont les
  coordonnées de celui-ci qui rendent l'éditeur joignable par la voie légale.

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
