# Les plans à générer — invites prêtes à coller

Sept plans sur huit sont photoréalistes : ils demandent un modèle vidéo
(Veo, Sora, Kling, Runway, Luma…). Le huitième, la scène 3, est déjà rendu par
`rendu.py` et n'a rien à générer.

**Trois réglages valent pour tous les plans :** format **9:16**, rendu
**1080 × 1920** minimum, **30 images/seconde**.

**Les durées ci-dessous sont celles du montage, pas celles de la génération.**
La plupart des modèles ne descendent pas sous 4 ou 5 secondes par clip. Générer
chaque plan à la durée minimale du modèle, puis **couper au montage** à la durée
indiquée, en gardant le passage le plus net. C'est aussi ce qui permet de
choisir l'image exacte où la fissure claque.

## L'invite négative, commune à tous les plans

À coller dans le champ « negative prompt » de chaque génération. Elle porte la
charte Lumia et les interdits du brief :

```
text, letters, words, numbers, captions, subtitles, watermark, logo, signature,
person, people, human, face, hand, fingers, arm, body, silhouette, reflection of
a person, animal, pet, smartphone, phone, screen, monitor, cartoon, anime,
illustration, painting, drawing, cgi look, plastic look, low quality, blurry,
out of focus, noisy, oversaturated, warped glass, melting, extra objects,
cluttered background, lens dirt, camera shake
```

> **`hand` et `fingers` ne sont pas facultatifs.** Un modèle à qui l'on demande
> de verser de l'eau fabrique presque toujours une main ou un pichet tenu. Le
> brief interdit toute personne, et la charte Lumia interdit toute figuration.
> Chaque invite précise donc que **l'eau entre dans le cadre par le haut, sans
> récipient ni main visibles**.

---

## 1A — l'eau froide au contact · 0,90 s · `00,00 → 00,90`

Macro. Le filet d'eau touche le verre brûlant, la vapeur monte. C'est l'image
d'ouverture : elle doit être en mouvement dès la première image, sans aucun
carton d'introduction.

**EN**
```
Extreme macro, photorealistic: a plain transparent drinking glass, very hot,
standing on a dark matte stone surface. A thin stream of cold water falls into
frame from above and strikes the glass wall — no hand, no jug, no container
visible. Fine steam lifts off the contact point. Shallow depth of field, crisp
focus on the glass wall, dark background falling to black. Cinematic side
lighting, warm highlight on the near edge, cool rim light behind. Slow push-in.
Vertical 9:16, 30fps, shot on 100mm macro lens, f/2.8.
```

**FR** — gros plan macro photoréaliste : un verre à boire ordinaire, transparent,
très chaud, posé sur une pierre sombre et mate. Un filet d'eau froide tombe dans
le cadre par le haut et frappe la paroi — aucune main, aucun pichet, aucun
récipient visible. Une vapeur fine se lève au point de contact. Faible
profondeur de champ, netteté sur la paroi, fond qui tombe au noir. Lumière
latérale cinématographique, reflet chaud sur l'arête proche, contre-jour froid
derrière. Lent travelling avant.

## 1B — la fissure claque · 0,70 s · `00,90 → 01,60`

Coupe franche sur 1A. La fissure apparaît d'un coup. **C'est l'image du
bruitage** : c'est elle qu'il faut faire tomber exactement sur le claquement.

**EN**
```
Extreme macro, photorealistic: the wall of a hot transparent drinking glass
splits. A single sharp fracture appears instantly in the glass and shoots across
the wall, with two short branching lines. The fracture surface catches the light
and glints. Cold water still running down the outside, steam. Dark matte stone
surface, black background. Hard crisp focus, high shutter speed, no motion blur
on the fracture. Cinematic side lighting. No hand, no container. Vertical 9:16,
30fps, 100mm macro.
```

**FR** — la paroi du verre chaud se fend. Une fracture nette apparaît d'un coup
et file à travers la paroi, avec deux courtes ramifications. La surface de
rupture accroche la lumière et scintille. L'eau froide coule encore à
l'extérieur, vapeur. Mise au point dure, vitesse d'obturation élevée, aucun flou
de bougé sur la fracture.

## 1C — le verre fissuré · 1,40 s · `01,60 → 03,00`

Léger recul. La fissure est installée, la lumière la traverse.

**EN**
```
Macro, photorealistic: a plain transparent drinking glass now cracked, standing
on dark matte stone. A clean fracture line runs through the glass wall and
catches a warm beam of light, throwing a thin caustic onto the stone. Residual
water beading and running down the glass, last wisps of steam. Slow pull back
and slight camera drift. Dark background, cinematic rim lighting, amber key.
Vertical 9:16, 30fps.
```

**FR** — le verre, désormais fissuré, sur la pierre sombre. La ligne de fracture
traverse la paroi et accroche un faisceau chaud, qui projette une caustique fine
sur la pierre. Gouttes résiduelles qui coulent, dernières volutes de vapeur.
Lent recul et légère dérive de caméra.

## 2A — zoom sur la fissure · 1,00 s · `03,00 → 04,00`

Macro extrême. Rien que la ligne de rupture, très nette.

**EN**
```
Extreme macro, photorealistic: the fracture line inside a glass wall fills the
frame. Razor-sharp detail of the fracture surface — conchoidal shell marks,
internal reflections, prismatic glints along the edge. Shallow depth of field,
the plane of the crack tack sharp, everything else falling off. Dark background.
Slow lateral slide along the crack. Vertical 9:16, 30fps, macro probe lens.
```

**FR** — la ligne de fracture remplit le cadre. Détail très net de la surface de
rupture : marques en coquille, réflexions internes, éclats prismatiques le long
de l'arête. Faible profondeur de champ, le plan de la fissure parfaitement net.
Lent glissement latéral le long de la fissure.

## 2B — la propagation · 1,30 s · `04,00 → 05,30`

Les lignes se ramifient dans l'épaisseur.

**EN**
```
Extreme macro, photorealistic: fracture lines propagating through the thickness
of a glass wall, branching into finer secondary cracks. The crack front advances
visibly, new hairline branches forking off. Light refracting through each new
surface. Dark background, cinematic amber and steel lighting. Camera pushing in
along the crack. Vertical 9:16, 30fps.
```

**FR** — les lignes de fracture se propagent dans l'épaisseur de la paroi et se
ramifient en fissures secondaires plus fines. Le front avance visiblement, de
nouvelles ramures se détachent. La lumière se réfracte sur chaque surface
nouvelle. Travelling avant le long de la fissure.

## 3 — le schéma · 3,50 s · `05,30 → 08,80`

**Rien à générer.** Rendu par `rendu.py` →
`rendu/scene3-choc-thermique.mp4`. Voir le haut de ce script pour ce que
l'animation montre et pourquoi.

## 4A — ralenti, orbite · 1,80 s · `08,80 → 10,60`

Retour sur le verre fissuré, superbe ralenti, cadrage spectaculaire.

**EN**
```
Slow motion, photorealistic: a cracked transparent drinking glass on dark matte
stone, camera orbiting slowly around it at low angle. The fracture line sweeps
through the frame as the angle changes, catching the key light and flaring. A
few water droplets still clinging. Deep black background, strong cinematic rim
light, warm amber key from the side. 120fps look, heavy slow motion. No hand,
no container. Vertical 9:16.
```

**FR** — ralenti : le verre fissuré sur la pierre sombre, la caméra tourne
lentement autour, en contre-plongée. La ligne de fracture balaie le cadre à
mesure que l'angle change, accroche la lumière et éclate. Quelques gouttes
accrochées. Fond noir profond, fort contre-jour, lumière chaude latérale.

## 4B — le plan final · 1,40 s · `10,60 → 12,00`

Macro. Un éclat glisse le long de la fracture. **La moitié basse du cadre reste
calme et sombre** : c'est là que se posent le dernier texte et le logo Lumia.

**EN**
```
Extreme macro, slow motion, photorealistic: a single highlight travelling slowly
along the fracture line of a cracked glass, flaring as it passes. Upper half of
the frame holds the glass and the light; lower half is calm, dark, empty stone
with soft falloff to black. Very slow push-in, almost still. Deep blacks,
cinematic amber key. Vertical 9:16, 30fps.
```

**FR** — macro au ralenti : un éclat remonte lentement le long de la fracture et
s'épanouit au passage. La moitié haute porte le verre et la lumière ; la moitié
basse reste calme, sombre, une pierre vide qui s'éteint au noir. Très lent
travelling avant, presque immobile.

---

## Continuité : ce qu'il faut tenir d'un plan à l'autre

Les modèles vidéo ne gardent aucune mémoire d'un clip au suivant. Cinq points
doivent donc être répétés dans chaque invite, et vérifiés à la réception :

- **le même verre** : droit, lisse, sans motif, sans pied, sans anse ;
- **la même surface** : pierre sombre et mate, jamais brillante ;
- **la même lumière** : clé ambrée latérale, contre-jour froid, fond au noir ;
- **la même fissure** : partant du bas de la paroi et montant vers la droite,
  avec deux ramifications — c'est le sens que suit l'animation de la scène 3 ;
- **aucun texte**, et le cadre bas de 4B laissé vide.

Si un plan revient avec une main, un visage, un reflet humain, un téléphone ou
un texte incrusté, il est à régénérer : ce ne sont pas des détails rattrapables
au montage.
