# Publier Lumia sur l'App Store

La marche à suivre, dans l'ordre, avec ce qui est déjà prêt et ce qui reste à faire. Compter
**deux à trois semaines** du début à la publication, dont une bonne partie en attente : les
vérifications d'identité d'Apple et la validation de l'app.

Tout ce qui est marqué **« toi »** ne peut pas être fait depuis le code : compte, paiement,
formulaires. Ce qui est marqué **« ici »** se fait dans le dépôt.

---

## Avant tout : le nom

**« Lumia » est une marque déposée de Microsoft** — c'était la gamme de téléphones Nokia
Lumia. La marque n'est plus exploitée pour des téléphones, mais elle existe, et Apple
contrôle les noms à la validation.

Trois issues possibles, par ordre de probabilité :

1. ça passe — les classes de dépôt ne couvrent pas forcément une app de lecture ;
2. Apple demande une justification ou une autorisation écrite ;
3. refus, et il faut renommer.

Ce qui est à faire, et ce n'est pas long : chercher « Lumia » dans l'App Store, et vérifier
le nom sur [la base de l'INPI](https://data.inpi.fr/) et sur
[EUIPO](https://euipo.europa.eu/eSearch/). Si une app de lecture porte déjà ce nom, il faut
en changer **avant** de créer la fiche, pas après.

Le nom affiché dans l'App Store n'a pas à être le nom de code du projet. On peut déposer
« Lumia — livres courts » ou tout autre nom composé, et ne changer qu'une ligne d'`app.json`.

---

## Étape 1 — Le compte développeur (toi)

**Apple Developer Program, 99 $ par an.** C'est la seule dépense obligatoire, et c'est la
seule pièce qui bloque tout le reste.

1. [developer.apple.com/programs/enroll](https://developer.apple.com/programs/enroll/)
2. S'inscrire **en personne physique**, pas en société. Une société exige un numéro D-U-N-S,
   qui demande des semaines à obtenir. En personne physique, il faut une pièce d'identité et
   c'est tout.
3. Apple vérifie l'identité. Compter **24 h à une semaine**.
4. Payer les 99 $. Le compte est actif.

Il faut un identifiant Apple avec l'**authentification à deux facteurs** activée. Si ce n'est
pas déjà le cas, le faire d'abord : l'inscription le refuse sinon.

---

## Étape 2 — Ce qui doit exister avant la fiche (toi)

Deux adresses web publiques, exigées par Apple et sans lesquelles la fiche ne peut pas être
soumise :

| Ce qu'Apple demande | Où c'est |
| --- | --- |
| URL de la politique de confidentialité | **obligatoire** |
| URL d'assistance | **obligatoire** |

Les deux pages sont déjà écrites : `boutique/pages/confidentialite.html` et
`boutique/pages/conditions.html`. Elles sont extraites directement des écrans de l'app, donc
elles disent au mot près la même chose — Apple refuse une politique qui diffère entre le site
et l'app.

Il reste à les mettre en ligne. Chez Hostinger, qui est déjà l'hébergeur déclaré dans
`src/data/legal.ts`, c'est un téléversement par FTP ou par le gestionnaire de fichiers. Une
page d'assistance suffit : un titre, une phrase, et l'adresse `cameradaction0@gmail.com`.

**Avant de téléverser**, régénérer les pages — elles datent du 8 octobre :

```bash
npm run boutique:pages
```

---

## Étape 3 — Préparer le dépôt (ici)

Trois choses à faire avant la première compilation, dans cet ordre.

**Les captures d'écran datent du 4 octobre**, quand le catalogue comptait environ 190 livres.
À refaire :

```bash
npm run boutique:captures
```

Ça produit `boutique/captures/ios-*.jpg` au format 1320 × 2868, qui est celui de l'iPhone
6,9 pouces — le seul jeu de captures qu'Apple exige désormais.

**Brancher `expo-updates`**, et c'est le bon moment : cette bibliothèque permet d'envoyer les
nouveaux livres sans repasser par la validation d'Apple. Elle change le build, donc elle doit
être là **dans la première version publiée**. L'installer après obligerait à tout republier.

**Vérifier que tout passe** une dernière fois :

```bash
npm run typecheck
npm run verifier
```

---

## Étape 4 — Créer la fiche dans App Store Connect (toi)

Sur [appstoreconnect.apple.com](https://appstoreconnect.apple.com) → **Apps** → **+** →
**Nouvelle app**.

| Champ | Valeur |
| --- | --- |
| Plateformes | iOS |
| Nom | `Lumia` (voir l'avertissement sur le nom, plus haut) |
| Langue principale | Français |
| Identifiant de bundle | `com.lumia.app` |
| SKU | `lumia-ios` (interne, n'est jamais affiché) |
| Accès intégral | Accès complet |

L'identifiant de bundle doit d'abord exister : **Certificats, identifiants et profils** →
**Identifiants** → **+** → App ID → `com.lumia.app`. EAS peut aussi le créer tout seul à la
première compilation, si on le laisse faire.

Le reste de la fiche — sous-titre, description, mots-clés, catégories — est déjà écrit mot
pour mot dans **`boutique/fiche-boutiques.md`**. Il n'y a qu'à recopier.

---

## Étape 5 — Les trois questionnaires (toi)

Apple en pose trois, et les trois réponses de Lumia sont simples parce que l'app ne collecte
rien.

**Confidentialité de l'app.** Répondre **« Aucune donnée collectée »**. Ce n'est pas une
prudence : l'app ne fait aucune requête réseau, ne demande aucune permission et n'embarque
aucun kit de mesure d'audience. Le tableau complet des réponses est dans
`boutique/fiche-boutiques.md`.

**Classification par âge.** Les réponses sont dans le même fichier. Le classement attendu est
**12+**, à cause des guerres et des massacres décrits dans les livres d'histoire —
factuellement, jamais avec complaisance.

**Conformité à l'exportation.** Rien à faire : `ITSAppUsesNonExemptEncryption: false` est déjà
dans `app.json`, donc Apple ne posera pas la question à chaque envoi.

---

## Étape 6 — Compiler et envoyer (ici)

```bash
npx eas login                                        # compte Expo, gratuit
npx eas build --platform ios --profile production
```

La compilation se fait **dans le cloud d'Expo**. Pas besoin de Mac, pas besoin de Xcode.
Compter 20 à 40 minutes. EAS demandera les identifiants Apple et créera tout seul le
certificat de distribution et le profil de provisionnement — il faut le laisser faire, c'est
la partie la plus pénible à faire à la main.

Puis l'envoi :

```bash
npx eas submit --platform ios --latest
```

Le fichier `.ipa` part vers App Store Connect. Compter encore 10 à 30 minutes avant qu'il
apparaisse dans la liste des builds.

---

## Étape 7 — TestFlight, avant de soumettre (toi)

Dans App Store Connect → **TestFlight**, le build est installable sur ton propre iPhone via
l'app TestFlight. **À faire avant de soumettre**, sans exception : c'est le seul moment où
l'app tourne sur un vrai iPhone, dans les vraies conditions, avant qu'Apple la regarde.

À vérifier à la main : l'app s'ouvre, le livre offert se prend, un livre réservé affiche bien
« S'abonner à Lumia Extra » et pas un bouton d'achat, le lecteur reprend à la bonne page, et
le mode avion ne change rien.

---

## Étape 8 — Soumettre (toi)

Dans la fiche : sélectionner le build, remplir les **notes pour l'équipe de validation** (le
texte est prêt dans `boutique/fiche-boutiques.md` — il explique qu'aucun compte n'est
nécessaire et comment déverrouiller un livre gratuitement), puis **Ajouter pour
validation**.

La validation prend **24 à 48 heures** en général, parfois plus au premier envoi.

**Un refus n'est pas un échec.** Apple dit précisément ce qui ne va pas, on corrige, on
renvoie, et le deuxième passage est souvent plus rapide. La plupart des apps sont refusées au
moins une fois.

---

## Ce qui reste hors de ce chemin

**Les achats intégrés ne sont pas encore branchés.** Les trois formules existent à l'écran
avec leurs prix, mais choisir une formule ne débite rien, et l'app le dit en toutes lettres.
C'est volontaire : laisser croire à un achat serait une pratique trompeuse.

Cela veut dire qu'on peut publier **maintenant**, en app gratuite, et brancher le paiement
dans une version suivante. C'est même plus sage : une première validation sans paiement est
beaucoup plus simple à passer.

Le jour où le paiement arrivera, il faudra en plus signer le **contrat des applications
payantes** et renseigner les coordonnées bancaires et fiscales dans App Store Connect — sans
quoi les produits restent invisibles, et c'est une erreur classique qui coûte une semaine.

---

## Le tableau de bord

| # | Étape | Qui | Durée |
| --- | --- | --- | --- |
| 0 | Vérifier le nom « Lumia » | toi | 30 min |
| 1 | Apple Developer Program, 99 $ | toi | 1 à 7 jours |
| 2 | Mettre les pages légales en ligne | toi | 1 h |
| 3 | Captures, `expo-updates`, revue | ici | 1 h |
| 4 | Créer la fiche | toi | 1 h |
| 5 | Les trois questionnaires | toi | 30 min |
| 6 | Compiler et envoyer | ici | 1 h |
| 7 | TestFlight sur ton iPhone | toi | 30 min |
| 8 | Soumettre | toi | 24 à 48 h d'attente |
