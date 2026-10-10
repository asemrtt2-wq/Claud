# Le montage

## La conduite, plan par plan

Douze secondes, huit plans, **1,50 s de moyenne**. Aucun plan ne dépasse 1,80 s
et aucun n'est immobile : même les plans contemplatifs portent un mouvement de
caméra lent. C'est ce que demande le brief — montage dynamique, aucun plan long
ou statique.

| | entrée | sortie | durée | plan | d'où il vient |
| --- | --- | --- | --- | --- | --- |
| **1A** | 00,00 | 00,90 | 0,90 | l'eau froide au contact | modèle vidéo |
| **1B** | 00,90 | 01,60 | 0,70 | **la fissure claque** | modèle vidéo |
| **1C** | 01,60 | 03,00 | 1,40 | le verre fissuré | modèle vidéo |
| **2A** | 03,00 | 04,00 | 1,00 | zoom sur la fissure | modèle vidéo |
| **2B** | 04,00 | 05,30 | 1,30 | la propagation | modèle vidéo |
| **3** | 05,30 | 08,80 | 3,50 | le schéma scientifique | **`rendu/scene3-choc-thermique.mp4`** |
| **4A** | 08,80 | 10,60 | 1,80 | ralenti, orbite | modèle vidéo |
| **4B** | 10,60 | 12,00 | 1,40 | plan final | modèle vidéo |

**Toutes les coupes sont franches.** Aucun fondu, aucune transition d'effet : un
fondu sur 0,70 s de plan mangerait la moitié du plan. La seule exception
possible est l'entrée du schéma à 05,30, qui supporte un fondu au noir de
**4 images** (0,13 s) si la bascule paraît trop brutale — à essayer, pas à
appliquer d'office.

**05,30 est la charnière.** C'est le passage du réel au schéma, et il tombe au
milieu d'une phrase de voix off (la ligne 2 finit à 05,50). Ce chevauchement est
voulu : la voix enjambe la coupe et la rend invisible. Ne pas recaler la coupe
sur la fin de la phrase, cela créerait un temps mort.

## Le point d'ancrage : 00,90

Le claquement sonore de la fissure et la première image de 1B doivent tomber sur
**la même image**. C'est le seul calage à faire au centième ; tout le reste se
replace autour.

Si le plan généré pour 1B ne fissure pas exactement sur sa première image,
**décaler le plan dans la timeline** pour amener la fissure sur 00,90 — et non
déplacer la coupe, qui décalerait tout le reste du montage.

## Les zones sûres

`rendu/gabarit-zones-sures.png` montre ces zones à l'échelle. À poser en calque
de repère dans le logiciel de montage, puis à masquer avant l'export.

| zone | x | y | |
| --- | --- | --- | --- |
| **zone sûre** | 60 → 840 | 230 → 1500 | rien d'important en dehors |
| **logo Lumia** | 300 → 780 | 240 → 400 | haut, centré |
| **texte** | 60 → 820 | 1150 → 1460 | bas, aligné à gauche |

Ce qui est réservé par les applications, et qu'il ne faut donc pas occuper :

- **haut, 0 → 200** : la barre des applications ;
- **droite, 840 → 1080 entre y 850 et 1500** : la colonne d'icônes (TikTok,
  Reels, Shorts) ;
- **bas, 1500 → 1920** : légende, pseudo, bandeau sonore.

Les plans 4A et 4B sont cadrés pour que la moitié basse reste calme et sombre :
c'est là que le dernier texte et le logo peuvent s'installer sans rien couvrir.

## Les textes à l'image

**Le brief interdit tout texte généré dans les images** : rien n'est incrusté
dans les plans eux-mêmes. Les textes se posent **au montage**, en calque, où ils
restent modifiables.

Suggestion, à reprendre librement — la vidéo se tient aussi sans aucun texte :

| temps | texte | zone |
| --- | --- | --- |
| 01,70 → 03,00 | `CHOC THERMIQUE` | texte |
| 05,60 → 08,60 | `Deux vitesses de refroidissement` | texte |
| 10,80 → 12,00 | logo **Lumia** | logo |

Police à empattements, comme toute l'identité Lumia (`src/theme.ts` :
`fonts.display`, Georgia sur iOS, serif sur Android). Couleur `#D6B26C` (l'or de
la marque) ou `#F4EFE6` (le blanc cassé du texte), sur fond sombre.

**Aucun chiffre qui ne soit pas mesuré** — c'est la règle de tout le projet, et
elle vaut ici : pas de « 90 % des gens l'ignorent », pas de compteur de vues, pas
de température inventée. Le phénomène se raconte sans chiffre.

## L'export

| | |
| --- | --- |
| définition | **1080 × 1920** (9:16) |
| cadence | **30 i/s**, constante |
| codec | H.264, profil high, `yuv420p` |
| débit | 10 à 12 Mb/s |
| audio | AAC 192 kb/s, 48 kHz, stéréo |
| durée | **12,00 s** exactement |

`yuv420p` n'est pas un détail : sans lui, certains lecteurs et plusieurs
plateformes refusent le fichier ou le réencodent mal.

## Ce que la vidéo ne doit jamais contenir

Ces interdits viennent du brief et de la charte Lumia (`CLAUDE.md`). Ils se
vérifient à l'œil sur le montage final, plan par plan :

- aucun **visage**, aucune **personne**, aucune **silhouette**, aucun **animal**
  — y compris une main qui verse l'eau ou un reflet dans le verre ;
- aucun **smartphone**, aucun écran ;
- **aucun texte généré dans les images** (les calques du montage ne sont pas
  concernés) ;
- **aucune musique** ;
- aucun **écran d'introduction** : la première image est déjà en mouvement ;
- aucun chiffre que l'on n'a pas mesuré.
