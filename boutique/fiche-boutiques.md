# La fiche des boutiques

Tout ce qu'App Store Connect et la Google Play Console demandent d'écrire, écrit une fois
ici. À recopier au moment de créer la fiche ; à modifier ici d'abord, pour que les deux
boutiques disent la même chose.

**Règle qui s'applique à ce fichier comme au reste du projet** : aucun chiffre qui n'a pas
été mesuré. Pas de « des milliers de lecteurs », pas de note, pas de « des centaines de
livres ». Les nombres ci-dessous viennent du catalogue : **56 livres, 1 488 chapitres, plus
de 500 000 mots**. Ils changent quand le catalogue change.

---

## Nom et identité

| Champ | Valeur |
| --- | --- |
| Nom de l'app | `Lumia` |
| Sous-titre App Store (30 car. max) | `Des livres qui éclairent` |
| Brève description Play (80 car. max) | `56 livres courts à lire hors ligne. Sans compte, sans publicité, sans traqueur.` |
| Identifiant iOS | `com.lumia.app` |
| Nom de package Android | `com.lumia.app` |
| Catégorie principale | Livres |
| Catégorie secondaire (App Store) | Éducation |

## Mots-clés App Store (100 caractères, séparés par des virgules, sans espaces)

```
livre,lecture,hors ligne,histoire,science,savoir,culture,islam,ebook,apprendre,esprit,court
```

Ne pas y mettre « Lumia » (le nom est déjà indexé), ni le nom d'un concurrent, ni « iBooks »
qui est une marque d'Apple.

## Description

> Même texte pour les deux boutiques. Les deux acceptent 4 000 caractères ; celui-ci en fait
> environ 1 700.

```
Lumia est une bibliothèque de livres courts, à lire tranquillement, sans être interrompu.

56 livres, de douze à soixante pages, sur l'histoire, les sciences, la culture, les grandes
figures et ce qu'il est utile de comprendre du monde. Un livre se lit en une soirée.

TOUT FONCTIONNE HORS LIGNE
Les livres sont déjà dans l'application au moment de l'installation. Pas de téléchargement,
pas de chargement, pas de connexion. Dans le métro, en avion, à la montagne : ça marche.

SANS COMPTE ET SANS DONNÉES
Aucune inscription, aucune adresse e-mail, aucun mot de passe. Lumia ne contacte aucun
serveur et ne collecte rien : votre progression et vos favoris restent sur votre téléphone.

SANS PUBLICITÉ NI TRAQUEUR
Aucune bannière, aucune notification pour vous faire revenir, aucun profil publicitaire.
Une application de lecture ne devrait pas vendre l'attention de ses lecteurs.

DES TEXTES QUI CITENT LEURS SOURCES
Chaque livre distingue ce qui est établi, ce qui est une hypothèse et ce qui est une
opinion. Les chiffres sont vérifiables, les légendes sont signalées comme telles, et un
chapitre qui contredit une idée reçue explique pourquoi.

UN LECTEUR PENSÉ POUR LES YEUX
Taille du texte, largeur, ambiance claire ou sombre, sommaire, reprise à la page exacte où
vous vous êtes arrêté. Le temps de lecture est compté réellement, minute par minute.

UN LIVRE OFFERT
Cinq livres sont proposés en cadeau : vous en choisissez un, il est à vous pour toujours,
sans abonnement et sans rien payer. Le choix est définitif, et l'application le dit avant
que vous validiez.

ENSUITE, COMME VOUS VOULEZ
Un livre seul s'achète 4,99 € et vous reste acquis. Ou bien un abonnement mensuel ouvre
tout le catalogue : Lumia Plus à 9,99 €, Lumia Premium à 15,99 €, Lumia Extra à 19,99 €.
Chaque formule se résilie à tout moment, dans les réglages de votre téléphone, sans frais
et sans durée minimale.

Lire. Comprendre. Évoluer.
```

## Nouveautés de cette version (première publication)

```
Première version de Lumia : 56 livres, un lecteur soigné, et tout qui fonctionne hors ligne.
```

## Classification d'âge

Le catalogue est écrit pour un lecteur adulte ou adolescent, sans contenu sexuel, sans
vulgarité et sans jeu d'argent. Certains livres d'histoire décrivent des guerres et des
massacres — factuellement, jamais avec complaisance.

| Question | Réponse |
| --- | --- |
| Violence réaliste | Peu fréquente / légère (contexte historique et éducatif) |
| Contenu sexuel ou nudité | Aucun |
| Alcool, tabac, drogues | Aucun |
| Jeux d'argent | Aucun |
| Thèmes horrifiques | Aucun |
| Contenu généré par les utilisateurs | Aucun |
| Fonctions sociales, échanges entre utilisateurs | Aucune |
| Publicité | Aucune |
| Classement attendu | App Store 12+ · Google Play PEGI 12 |

## Confidentialité — « aucune donnée collectée »

Les deux boutiques demandent de déclarer les données collectées. Pour Lumia, **toutes les
cases restent vides**, et ce n'est pas une omission : l'application ne fait aucune requête
réseau, ne demande aucune permission et n'embarque aucun kit de mesure d'audience.

| Catégorie | Déclaration |
| --- | --- |
| Contact, identité, identifiants | Non collecté |
| Données d'utilisation, diagnostics | Non collecté |
| Position, contacts, photos, santé | Non collecté |
| Données partagées avec des tiers | Aucune |
| Données liées à l'identité de l'utilisateur | Aucune |
| Suivi publicitaire (ATT) | Non — l'app ne suit personne |
| Achats | Traités par la boutique. Lumia ne reçoit ni nom, ni carte, ni adresse. |

La progression, les favoris et le temps de lecture sont enregistrés **sur l'appareil**
(AsyncStorage). Ils ne quittent pas le téléphone : ce n'est donc pas une collecte au sens
des deux fiches.

## URL à fournir

| Champ | Valeur |
| --- | --- |
| URL de confidentialité | **à compléter** — obligatoire dans les deux boutiques |
| URL de support | **à compléter** |
| URL marketing | facultative |

Les deux textes existent déjà dans l'app (`app/confidentialite.tsx`, `app/conditions.tsx`).
Les boutiques exigent en plus une **adresse web publique** qui les héberge : une simple page
suffit, le contenu doit être le même que celui affiché dans l'app.

## Notes pour l'équipe de validation

```
Aucun compte n'est nécessaire pour tester l'application : elle fonctionne dès la première
ouverture, hors ligne, sans inscription.

Pour ouvrir un livre sans achat, utilisez l'offre de bienvenue : écran d'ouverture →
« Un livre offert, à choisir parmi 5 » → choisir un livre. Il se déverrouille immédiatement.

L'application ne demande aucune permission système et n'effectue aucune requête réseau.
```

## Captures d'écran

`npm run boutique:captures` régénère les fichiers de `boutique/captures/`, aux dimensions
exigées par chaque boutique. Voir `scripts/captures-boutique.mjs`.

| Boutique | Format demandé | Fichiers |
| --- | --- | --- |
| App Store — iPhone 6,9" | 1320 × 2868 | `boutique/captures/ios-*.jpg` |
| Google Play — téléphone | 1080 × 2340 | `boutique/captures/android-*.jpg` |

Google Play demande en plus une **image de mise en avant** de 1024 × 500, et une icône de
512 × 512 : `boutique/captures/android-banniere.jpg` et `assets/icon.png`.
