# Choc thermique — vidéo éducative verticale, 12 s

Une vidéo 9:16 de douze secondes qui montre pourquoi un verre chaud casse quand
l'eau froide le touche. Quatre scènes, huit plans, quatre phrases de voix off.

## Ce qui est fait, et ce qui reste à faire

Ce dossier **n'est pas la vidéo finie**. Il contient tout ce qui a pu être
fabriqué ici, et les instructions exactes pour le reste.

| | état |
| --- | --- |
| Le découpage des 12 s, à la coupe près | **fait** — `montage.md` |
| Le texte et le minutage de la voix off | **fait** — `voix-off.md` |
| Les invites des 7 plans photoréalistes | **fait** — `prompts-scenes.md` |
| La conduite des bruitages | **fait** — `voix-off.md` |
| Les zones sûres pour textes et logo | **fait** — `rendu/gabarit-zones-sures.png` |
| **La scène 3, l'animation scientifique** | **rendue** — `rendu/scene3-choc-thermique.mp4`, utilisable telle quelle |
| L'animatique minutée des 12 s | **rendue** — `rendu/animatique-reperes-12s.mp4` |
| Les 7 plans photoréalistes | **à générer** — modèle vidéo |
| L'enregistrement de la voix off | **à faire** — voix française native |
| Les bruitages | **à faire** |
| L'assemblage final | **à faire** |

**Pourquoi les sept plans ne sont pas ici** : les générer demande un modèle
vidéo, et la voix demande une synthèse ou un enregistrement. Ni l'un ni l'autre
n'est disponible dans l'environnement où ce dossier a été produit. Fabriquer de
faux plans « photoréalistes » en code aurait donné des images que personne ne
voudrait diffuser — et les faire passer pour le rendu attendu aurait été pire.
Ce qui est rendu ici l'est pour de bon : la scène 3 est un vrai plan, fini.

## Les fichiers

```
README.md              ce document
prompts-scenes.md      les invites des 7 plans à générer, FR et EN
voix-off.md            le texte exact, le minutage, la diction, les bruitages
montage.md             la conduite, les coupes, les zones sûres, l'export
rendu.py               le script qui produit tout ce qui suit
rendu/
  scene3-choc-thermique.mp4    3,50 s — LA SCÈNE 3, livrable au montage
  animatique-reperes-12s.mp4   12,00 s — les repères de montage
  gabarit-zones-sures.png      où poser les textes et le logo
  plan-*.png                   une vignette par plan, pour la planche
```

### `scene3-choc-thermique.mp4` — un vrai plan

3,50 s, 1080 × 1920, 30 i/s. C'est la **scène 3 du brief**, finie, à poser dans
la timeline entre 05,30 et 08,80. Elle montre une coupe dans la paroi du verre :
la couleur est la température, les lignes horizontales sont des repères dans la
matière, et leur courbure est le désaccord entre la zone qui s'est contractée et
celle qui est restée chaude. La fissure naît sur la face refroidie, là où la
traction est maximale, et s'ouvre perpendiculairement à cette traction.

Le profil de température suit la solution de l'équation de la chaleur pour une
face brusquement refroidie, `T(x,t) = erf(x / profondeur(t))` : la peau froide
est très mince au premier instant, puis s'enfonce. Le détail est commenté en
tête de `rendu.py`.

Aucun texte, aucune flèche, aucune légende : le brief interdit le texte à
l'image, et la charte Lumia interdit toute figuration.

### `animatique-reperes-12s.mp4` — un outil, pas un plan

12,00 s, 1080 × 1920, 30 i/s. Les douze secondes complètes, avec la scène 3
rendue à sa place et un **carton de repère** pour chacun des sept autres plans :
son numéro, sa durée, ce qu'il montre, la phrase de voix off qui tombe dessus,
les zones sûres, et une règle de montage qui marque chaque coupe.

**Elle ne se diffuse pas** : elle porte des textes de travail. Elle sert à caler
le minutage et à voir les points de coupe avant que les vrais plans existent.

## Comment assembler

1. **Générer les sept plans** avec `prompts-scenes.md`. Les modèles descendent
   rarement sous 4 ou 5 s : générer long, couper au montage à la durée du
   tableau. Écarter tout plan qui revient avec une main, un visage, un reflet
   humain, un téléphone ou un texte incrusté.
2. **Enregistrer la voix off** — `voix-off.md`. Français de France, voix native,
   jamais un mot d'anglais.
3. **Monter** selon `montage.md`. Caler d'abord le claquement de la fissure sur
   00,90 : tout le reste se place autour.
4. **Poser les bruitages**, aucune musique.
5. **Poser les textes et le logo** en calque, dans les zones du gabarit.
6. **Exporter** en 1080 × 1920, 30 i/s, H.264 `yuv420p`, 12,00 s.

## Refaire le rendu

```bash
python3 video/choc-thermique/rendu.py              # tout
python3 video/choc-thermique/rendu.py animatique   # l'animatique seule
python3 video/choc-thermique/rendu.py scene3       # la scène 3 seule
```

Il faut `numpy`, `Pillow` et `ffmpeg`. Le rendu complet prend trois à quatre
minutes. Le tirage aléatoire du trajet de la fissure est figé par une graine :
deux exécutions donnent exactement le même fichier.

Le minutage vit **une seule fois**, dans la liste `PLANS` en tête de `rendu.py` ;
les durées de `montage.md` en sont la copie lisible. Déplacer une coupe, c'est
changer `PLANS` puis relancer l'animatique.

## La charte

La vidéo respecte la charte de contenu de `CLAUDE.md` : aucune représentation
figurative — ni personne, ni visage, ni silhouette, ni animal — aucun texte dans
les images générées, aucune musique, et aucun chiffre qui n'aurait pas été
mesuré. Le sujet est scientifique, les explications sont exactes, et la
distinction entre ce qui est fait et ce qui reste à faire est en haut de ce
document plutôt que passée sous silence.
