#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Rend les éléments vidéo du sujet « choc thermique » qui sont réellement
calculables ici, sans modèle de génération d'images :

  rendu/scene3-choc-thermique.mp4   l'animation scientifique de la SCÈNE 3,
                                    livrable tel quel au montage
  rendu/animatique-reperes-12s.mp4  les 12 secondes complètes, minutées, avec
                                    des cartons de repère aux emplacements des
                                    scènes 1, 2 et 4 — outil de montage, pas
                                    un plan à diffuser
  rendu/gabarit-zones-sures.png     où poser les textes et le logo Lumia

Les scènes 1, 2 et 4 sont photoréalistes : elles demandent un modèle vidéo.
Leurs invites sont dans prompts-scenes.md.

Charte Lumia respectée : aucune représentation figurative, aucun visage, aucun
animal. L'animation n'est que géométrie, dégradés et couleur. Aucun texte n'est
incrusté dans la scène 3 ; les seuls textes à l'image sont les cartons de
l'animatique, qui ne sortent pas du montage.

    python3 video/choc-thermique/rendu.py
"""

import math
import os
import shutil
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

# --------------------------------------------------------------------------
# Format et minutage
# --------------------------------------------------------------------------

W, H = 1080, 1920          # 9:16 vertical
FPS = 30
DUREE_TOTALE = 12.0

RACINE = os.path.dirname(os.path.abspath(__file__))
SORTIE = os.path.join(RACINE, "rendu")

# Palette Lumia (src/theme.ts) — le chaud du verre emprunte l'or de la marque.
NUIT = np.array([11, 11, 15], dtype=np.float32)
OR = np.array([214, 178, 108], dtype=np.float32)
OR_CLAIR = np.array([234, 211, 160], dtype=np.float32)
OR_PROFOND = np.array([168, 129, 63], dtype=np.float32)
FROID = np.array([58, 92, 122], dtype=np.float32)      # acier bleu : la zone refroidie
TEXTE = np.array([244, 239, 230], dtype=np.float32)

# Le découpage des 12 secondes. Aucun plan ne dépasse 1,9 s : le montage reste
# nerveux, comme demandé. `source` dit qui fabrique le plan.
PLANS = [
    dict(id="1A", t0=0.00, t1=0.90, source="modele",
         titre="EAU FROIDE AU CONTACT",
         detail="Macro. Le filet d'eau touche le verre brulant. Vapeur."),
    dict(id="1B", t0=0.90, t1=1.60, source="modele",
         titre="LA FISSURE CLAQUE",
         detail="Coupe franche. Bruit sec. L'action d'ouverture."),
    dict(id="1C", t0=1.60, t1=3.00, source="modele",
         titre="LE VERRE FISSURE",
         detail="Recul. La lumiere traverse la fracture."),
    dict(id="2A", t0=3.00, t1=4.00, source="modele",
         titre="ZOOM SUR LA FISSURE",
         detail="Macro extreme. La ligne de rupture, tres nette."),
    dict(id="2B", t0=4.00, t1=5.30, source="modele",
         titre="PROPAGATION",
         detail="Les lignes se ramifient dans l'epaisseur."),
    dict(id="3", t0=5.30, t1=8.80, source="rendu",
         titre="SCHEMA : DEUX VITESSES",
         detail="Animation scientifique. Rendue par ce script."),
    dict(id="4A", t0=8.80, t1=10.60, source="modele",
         titre="RALENTI, ORBITE",
         detail="Ralenti. La camera tourne autour du verre fissure."),
    dict(id="4B", t0=10.60, t1=12.00, source="modele",
         titre="PLAN FINAL",
         detail="Macro. Eclat sur la fracture. Place pour le logo."),
]

SCENE3 = next(p for p in PLANS if p["id"] == "3")
SCENE3_DUREE = SCENE3["t1"] - SCENE3["t0"]

# Voix off : texte exact du brief, minuté pour tenir dans les 12 s.
VOIX = [
    (0.80, 2.70, "Pourquoi ce verre vient de casser ?"),
    (2.95, 5.50, "A cause d'un changement brutal de temperature."),
    (5.70, 9.40, "Une partie refroidit plus vite que l'autre. Le verre se fissure."),
    (9.65, 11.85, "C'est ce qu'on appelle un choc thermique."),
]

# Zones sures pour les textes et le logo, en pixels (voir montage.md).
ZONE_SURE = dict(x0=60, y0=230, x1=840, y1=1500)
ZONE_LOGO = dict(x0=300, y0=240, x1=780, y1=400)
ZONE_TITRE = dict(x0=60, y0=1150, x1=820, y1=1460)

POLICE_SERIF = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
POLICE_SANS = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
POLICE_MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"


def police(chemin, taille):
    try:
        return ImageFont.truetype(chemin, taille)
    except OSError:
        return ImageFont.load_default()


# --------------------------------------------------------------------------
# Petits outils
# --------------------------------------------------------------------------

_erf = np.vectorize(math.erf)


def lissage(x):
    """Accelere puis ralentit : evite les departs et arrets secs."""
    x = float(np.clip(x, 0.0, 1.0))
    return x * x * (3.0 - 2.0 * x)


def palier(x, a, b):
    """Rampe de 0 a 1 entre a et b."""
    if b <= a:
        return 1.0 if x >= b else 0.0
    return lissage((x - a) / (b - a))


def vignette():
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    dx = (xx - W / 2.0) / (W / 2.0)
    dy = (yy - H / 2.0) / (H / 2.0)
    r = np.sqrt(dx * dx + dy * dy * 0.62)
    return np.clip(1.0 - 0.52 * np.clip(r, 0, 1.6) ** 2.1, 0.18, 1.0)[:, :, None]


VIGNETTE = vignette()


def fond():
    """Nuit Lumia, avec un halo dore tres doux au centre."""
    img = np.repeat(np.repeat(NUIT[None, None, :], H, 0), W, 1).copy()
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    d = np.sqrt(((xx - W / 2) / 760.0) ** 2 + ((yy - H / 2) / 980.0) ** 2)
    halo = np.exp(-d * d * 1.9)[:, :, None]
    return img + halo * OR_PROFOND[None, None, :] * 0.16


def recadrer(img, echelle, dx=0.0, dy=0.0):
    """Zoom-recadrage : aucun plan ne reste parfaitement immobile."""
    if echelle <= 1.0001 and abs(dx) < 0.01 and abs(dy) < 0.01:
        return img
    pil = Image.fromarray(img)
    nw, nh = int(W * echelle), int(H * echelle)
    pil = pil.resize((nw, nh), Image.LANCZOS)
    cx = (nw - W) / 2.0 + dx
    cy = (nh - H) / 2.0 + dy
    cx = int(np.clip(cx, 0, nw - W))
    cy = int(np.clip(cy, 0, nh - H))
    return np.asarray(pil.crop((cx, cy, cx + W, cy + H)))


def ecrire(img_f):
    return np.clip(img_f * VIGNETTE if img_f.shape[2] == 3 else img_f, 0, 255).astype(np.uint8)


# --------------------------------------------------------------------------
# SCÈNE 3 — l'animation scientifique
# --------------------------------------------------------------------------
#
# Ce qu'on regarde : une COUPE dans la paroi du verre. L'axe horizontal est
# l'épaisseur — face gauche = la face que l'eau froide touche, face droite =
# l'intérieur encore brûlant. L'axe vertical est la paroi elle-même.
#
# La couleur est la température. Elle suit la solution de l'équation de la
# chaleur pour une face brusquement refroidie :
#
#     T(x, t) = erf( x / profondeur(t) )
#
# donc une peau froide très mince au premier instant, qui s'enfonce ensuite.
#
# Les lignes horizontales sont des repères matériels. Là où le verre a refroidi,
# il veut se contracter le long de la paroi : les repères sont tirés vers le
# centre. Là où il est resté chaud, ils ne bougent pas. Cette courbure EST le
# désaccord — la zone froide tire, la zone chaude retient, et la traction
# s'accumule sur la face refroidie. C'est là que la fissure part, et elle
# s'ouvre perpendiculairement à cette traction, donc verticalement.
#
# Aucune flèche, aucune légende, aucun texte : la charte Lumia interdit la
# figuration, et le brief interdit le texte à l'image.

SX0, SX1 = 250, 830        # l'épaisseur de la paroi, en pixels
SY0, SY1 = 430, 1490       # la hauteur de paroi montrée
SW, SH = SX1 - SX0, SY1 - SY0

_rng = np.random.default_rng(20261010)
# Le trajet de la fissure. Une rupture dans le verre n'ondule pas : elle file
# droit, puis change d'angle d'un coup. On tire donc quelques sommets et on les
# relie par des segments rectilignes — un lissage donnerait une sinusoïde, qui
# se lit comme un trait dessiné plutôt que comme une cassure. Le tirage est
# figé par la graine : le rendu est le même d'une exécution à l'autre.
_SOMMETS = 11
_x_sommets = np.linspace(0.0, SW - 1.0, _SOMMETS)
_x_sommets[1:-1] += _rng.uniform(-0.34, 0.34, _SOMMETS - 2) * (SW / _SOMMETS)
_x_sommets = np.sort(_x_sommets)
_y_sommets = np.cumsum(_rng.normal(0.0, 27.0, _SOMMETS))
_y_sommets = _y_sommets - _y_sommets.mean() + SH * 0.46
FISSURE_Y = np.clip(
    np.interp(np.arange(SW, dtype=np.float32), _x_sommets, _y_sommets),
    SH * 0.22, SH * 0.74,
).astype(np.float32)

_grain = _rng.normal(0.0, 1.0, (SH, 1)).astype(np.float32)
_grain = np.convolve(_grain[:, 0], np.ones(17) / 17.0, mode="same")[:, None, None]


def temperature(profondeur):
    """Profil de température dans l'épaisseur : 0 = froid, 1 = brûlant."""
    xs = (np.arange(SW, dtype=np.float32) + 0.5) / SW
    return np.clip(_erf(xs / max(profondeur, 1e-3)).astype(np.float32), 0.0, 1.0)


# Quatre arrêts plutôt que trois : sans le palier intermédiaire, la bascule du
# bleu vers l'or avale la moitié de l'échelle et tout le côté chaud vire au beige.
_PALIERS = [0.0, 0.30, 0.66, 1.0]
_ECHELLE = np.array([
    [40, 96, 148],      # la face refroidie, acier franc
    [152, 104, 48],     # l'ambre profond
    [214, 178, 108],    # l'or Lumia
    [255, 226, 168],    # le cœur encore brûlant
], dtype=np.float32)


def couleurs_temperature(T):
    """La carte de chaleur : acier froid -> ambre -> or -> incandescent."""
    canaux = [np.interp(T, _PALIERS, _ECHELLE[:, i]) for i in range(3)]
    return np.stack(canaux, axis=-1).astype(np.float32)


def masque_lignes(T, contraction):
    """Les repères matériels, courbés par la contraction de la zone froide."""
    m = Image.new("L", (SW * 2, SH * 2), 0)
    d = ImageDraw.Draw(m)
    retrait = (1.0 - T) * contraction          # 0 côté chaud, max côté froid
    xs = np.arange(0, SW, 6)
    for yr in np.linspace(0.06, 0.94, 13):
        y_px = yr * SH
        depuis_centre = y_px - SH / 2.0
        ys = y_px - depuis_centre * retrait[xs] * 0.95
        pts = [(int(x * 2), int(y * 2)) for x, y in zip(xs, ys)]
        d.line(pts, fill=215, width=3)
    m = m.resize((SW, SH), Image.LANCZOS)
    return (np.asarray(m).astype(np.float32) / 255.0)[:, :, None]


def profil_ouverture(avance, ouverture):
    """De combien chaque colonne s'écarte, de part et d'autre de la fissure.

    L'écartement est maximal à la face refroidie, où la rupture est née, et
    s'annule à la pointe qui avance : c'est le profil d'ouverture d'une
    fissure réelle. Un décalage constant donnerait une fente rectangulaire,
    qui se lit comme une découpe et non comme une cassure.
    """
    front = np.clip(avance, 0.0, 1.0) * SW
    if front < 3.0:
        return np.zeros(SW, dtype=np.float32)
    j = np.arange(SW, dtype=np.float32)
    reste = np.clip((front - j) / front, 0.0, 1.0)
    # Tant que la fissure court, l'ouverture s'annule à la pointe. Une fois la
    # paroi traversée, la cassure est ouverte sur toute sa longueur : sans ce
    # plancher, la moitié droite se refermait au dernier plan.
    fini = np.clip((np.clip(avance, 0.0, 1.0) - 0.92) / 0.08, 0.0, 1.0)
    plancher = fini * 0.42 * (j < front)
    return np.maximum(np.sqrt(reste), plancher) * (11.0 * ouverture)


def masque_fissure(avance, ouverture):
    """Le trait de rupture : un fil, seulement pour en éclairer les lèvres."""
    front = int(np.clip(avance, 0.0, 1.0) * SW)
    if front < 3:
        return None
    m = Image.new("L", (W * 2, H * 2), 0)
    d = ImageDraw.Draw(m)
    sommets = [x for x in _x_sommets if x < front] + [float(front - 1)]
    pts = [((SX0 + x) * 2, (SY0 + FISSURE_Y[int(x)]) * 2) for x in sommets]
    if len(pts) >= 2:
        d.line(pts, fill=255, width=5)
    # Deux ramifications, nées sur un sommet et arrêtées net, comme sur le verre.
    for indice, montee in ((4, -1.0), (7, 1.0)):
        x0 = _x_sommets[indice]
        if front > x0 + 50:
            n = min(SW * 0.15, front - x0)
            d.line([((SX0 + x0) * 2, (SY0 + FISSURE_Y[int(x0)]) * 2),
                    ((SX0 + x0 + n) * 2,
                     (SY0 + FISSURE_Y[int(x0)] + montee * n * 0.75) * 2)],
                   fill=170, width=3)
    m = m.resize((W, H), Image.LANCZOS)
    return np.asarray(m).astype(np.float32) / 255.0


def frame_scene3(t):
    """Une image de la scène 3. `t` est en secondes depuis son début."""
    p = np.clip(t / SCENE3_DUREE, 0.0, 1.0)

    profondeur = 0.022 + 0.60 * palier(p, 0.02, 0.64)
    contraction = 0.30 * palier(p, 0.20, 0.62)
    av_fissure = palier(p, 0.66, 0.82)
    ouverture = palier(p, 0.67, 1.0)
    tension = palier(p, 0.16, 0.62) * (1.0 - 0.88 * palier(p, 0.67, 0.78))

    T = temperature(profondeur)

    # La paroi, colonne de couleur étirée sur toute la hauteur.
    dalle = np.repeat(couleurs_temperature(T)[None, :, :], SH, axis=0)
    # Un grain très fin, et un lustre : du verre, pas un aplat.
    dalle *= 1.0 + 0.022 * _grain
    lustre = 1.0 + 0.09 * np.sin(np.linspace(0, math.pi, SH))[:, None, None]
    dalle *= lustre

    # La traction qui s'accumule sur la face refroidie : un halo additif.
    xs = (np.arange(SW, dtype=np.float32) + 0.5) / SW
    bande = np.exp(-((xs / 0.055) ** 2))[None, :, None]
    battement = 1.0 + 0.22 * math.sin(p * 34.0)
    dalle += bande * OR_CLAIR[None, None, :] * (0.42 * tension * battement)

    # Les repères matériels.
    a = masque_lignes(T, contraction)
    dalle = dalle * (1.0 - a * 0.42) + OR_CLAIR[None, None, :] * a * 0.78

    # Les deux lèvres s'écartent verticalement : au-dessus vers le haut,
    # au-dessous vers le bas, et un vide sombre s'ouvre entre elles.
    ecarts = profil_ouverture(av_fissure, ouverture)
    if ecarts.max() >= 1.0:
        ouverte = dalle.copy()
        for j in range(SW):
            e = int(round(ecarts[j]))
            if e < 1:
                continue
            yc = int(FISSURE_Y[j])
            colonne = np.zeros((SH, 3), dtype=np.float32)
            haut = min(max(yc - e, 0), SH)
            if haut > 0:
                colonne[0:haut] = dalle[e:e + haut, j]
            bas = min(yc + e, SH)
            if bas < SH:
                colonne[bas:SH] = dalle[bas - 2 * e:SH - 2 * e, j]
            ouverte[:, j] = colonne
        dalle = ouverte

    img = fond()
    img[SY0:SY1, SX0:SX1] = dalle

    # Les deux faces de la paroi, soulignées d'un filet.
    for y in (SY0, SY1 - 1):
        img[y, SX0:SX1] = np.minimum(img[y, SX0:SX1] * 0.4 + OR[None, :] * 0.8, 255)

    # La fissure : cœur clair, halo large.
    mf = masque_fissure(av_fissure, ouverture)
    if mf is not None:
        source = Image.fromarray((mf * 255).astype(np.uint8))
        serre = np.asarray(
            source.filter(ImageFilter.GaussianBlur(5))
        ).astype(np.float32) / 255.0
        large = np.asarray(
            source.filter(ImageFilter.GaussianBlur(18))
        ).astype(np.float32) / 255.0
        img *= (1.0 - mf[:, :, None] * 0.35)                        # le fil sombre
        levres = np.clip(serre - mf, 0.0, 1.0)[:, :, None]
        img += levres * OR_CLAIR[None, None, :] * 2.80              # les deux lèvres
        img += large[:, :, None] * OR_CLAIR[None, None, :] * 0.45   # la lueur

    # L'éclat de la rupture, bref et discret.
    # Le facteur s'applique à une couleur déjà exprimée sur 0-255 : il se compte
    # en fractions, pas en unités de luminosité.
    eclat = math.exp(-(((p - 0.672) / 0.024) ** 2))
    if eclat > 0.01:
        img += OR_CLAIR[None, None, :] * (0.13 * eclat)

    # Poussée lente de la caméra : le plan n'est jamais immobile.
    return ecrire(recadrer(ecrire(img), 1.0 + 0.085 * lissage(p), dx=18 * p, dy=-10 * p))


# --------------------------------------------------------------------------
# L'animatique : les 12 secondes minutées
# --------------------------------------------------------------------------
#
# Les plans 1A à 2B et 4A/4B sont photoréalistes et sortent d'un modèle vidéo.
# Ici, ils sont remplacés par un carton qui porte leur numéro, leur durée et la
# phrase de voix off qui tombe dessus. C'est un outil de montage : il cale les
# points de coupe au centième et montre les zones réservées aux textes. Il ne
# se diffuse pas.

def ornement(d, cx, cy, rayon, angle, couleur, epaisseur=3):
    """L'étoile à huit branches de Lumia : deux carrés, rien de figuratif."""
    for decalage in (0.0, math.pi / 4.0):
        pts = []
        for k in range(4):
            a = angle + decalage + k * math.pi / 2.0
            pts.append((cx + rayon * math.cos(a), cy + rayon * math.sin(a)))
        d.line(pts + [pts[0]], fill=couleur, width=epaisseur, joint="curve")


def pointilles(d, boite, couleur, pas=18, epaisseur=2):
    x0, y0, x1, y1 = boite["x0"], boite["y0"], boite["x1"], boite["y1"]
    for x in range(x0, x1, pas * 2):
        d.line([(x, y0), (min(x + pas, x1), y0)], fill=couleur, width=epaisseur)
        d.line([(x, y1), (min(x + pas, x1), y1)], fill=couleur, width=epaisseur)
    for y in range(y0, y1, pas * 2):
        d.line([(x0, y), (x0, min(y + pas, y1))], fill=couleur, width=epaisseur)
        d.line([(x1, y), (x1, min(y + pas, y1))], fill=couleur, width=epaisseur)


def voix_active(t):
    for t0, t1, texte in VOIX:
        if t0 <= t < t1:
            return texte, (t - t0) / (t1 - t0)
    return None, 0.0


def carton(plan, t):
    """Le carton de repère d'un plan confié au modèle vidéo."""
    img = Image.fromarray(ecrire(fond()))
    d = ImageDraw.Draw(img)
    local = (t - plan["t0"]) / max(plan["t1"] - plan["t0"], 1e-6)

    ornement(d, W // 2, 720, 190 + 26 * math.sin(local * math.pi),
             local * 0.55, (214, 178, 108, 255), 3)
    ornement(d, W // 2, 720, 112 + 16 * math.sin(local * math.pi + 1.0),
             -local * 0.8, (168, 129, 63, 255), 2)

    f_num = police(POLICE_SERIF, 150)
    f_tit = police(POLICE_SERIF, 54)
    f_det = police(POLICE_SANS, 33)
    f_pet = police(POLICE_MONO, 27)

    d.text((W // 2, 300), plan["id"], font=f_num, fill=(234, 211, 160), anchor="mm")
    d.text((W // 2, 950), plan["titre"], font=f_tit, fill=(244, 239, 230), anchor="mm")
    lignes = [l.strip(" .") for l in plan["detail"].split(". ") if l.strip(" .")]
    for i, ligne in enumerate(lignes):
        d.text((W // 2, 1018 + i * 42), ligne, font=f_det,
               fill=(167, 158, 144), anchor="mm")
    # Sous la dernière ligne de détail, quel que soit leur nombre : à position
    # fixe, la mention retombait dessus.
    d.text((W // 2, 1018 + len(lignes) * 42 + 10),
           "PLAN A GENERER  -  voir prompts-scenes.md",
           font=f_pet, fill=(168, 129, 63), anchor="mm")
    return img


def bandeau(img, t):
    """Minutage, voix off et zones sûres, posés sur chaque image."""
    d = ImageDraw.Draw(img, "RGBA")
    f_pet = police(POLICE_MONO, 26)
    f_vo = police(POLICE_SERIF, 40)

    pointilles(d, ZONE_SURE, (123, 174, 127, 120))
    pointilles(d, ZONE_LOGO, (214, 178, 108, 110), pas=12)
    pointilles(d, ZONE_TITRE, (214, 178, 108, 110), pas=12)
    d.text((ZONE_LOGO["x0"] + 6, ZONE_LOGO["y0"] - 30), "ZONE LOGO LUMIA",
           font=f_pet, fill=(214, 178, 108, 200))
    d.text((ZONE_TITRE["x0"] + 6, ZONE_TITRE["y0"] - 30), "ZONE TEXTE",
           font=f_pet, fill=(214, 178, 108, 200))

    texte, _ = voix_active(t)
    if texte:
        mots = []
        for mot in texte.split():
            if mot in ("?", "!", ":", ";") and mots:
                mots[-1] += " " + mot      # jamais seul en début de ligne
            else:
                mots.append(mot)
        lignes, courante = [], ""
        for mot in mots:
            essai = (courante + " " + mot).strip()
            if len(essai) > 31 and courante:
                lignes.append(courante)
                courante = mot
            else:
                courante = essai
        lignes.append(courante)
        base = ZONE_TITRE["y1"] - 62 - (len(lignes) - 1) * 52
        for i, ligne in enumerate(lignes):
            d.text((ZONE_TITRE["x0"] + 14, base + i * 52), "« " + ligne + " »"
                   if (i == 0 and len(lignes) == 1) else ligne,
                   font=f_vo, fill=(244, 239, 230, 235))
        d.text((ZONE_TITRE["x0"] + 14, base - 44), "VOIX OFF",
               font=f_pet, fill=(123, 174, 127, 220))

    # La règle de montage : chaque coupe, et le curseur.
    by, bh = H - 110, 16
    d.rectangle([60, by, W - 60, by + bh], fill=(255, 255, 255, 26))
    for plan in PLANS:
        x = 60 + (W - 120) * plan["t0"] / DUREE_TOTALE
        coul = (123, 174, 127, 230) if plan["source"] == "rendu" else (214, 178, 108, 200)
        d.rectangle([x, by - 12, x + 3, by + bh + 12], fill=coul)
    cx = 60 + (W - 120) * t / DUREE_TOTALE
    d.rectangle([cx - 2, by - 20, cx + 2, by + bh + 20], fill=(244, 239, 230, 255))
    d.text((60, by + bh + 26), f"{t:05.2f} s / {DUREE_TOTALE:.0f} s",
           font=f_pet, fill=(167, 158, 144, 230))
    d.text((W - 60, by + bh + 26), "ANIMATIQUE - REPERES DE MONTAGE",
           font=f_pet, fill=(196, 115, 107, 230), anchor="ra")
    d.text((W - 60, 150), "9:16  -  1080x1920  -  30 i/s",
           font=f_pet, fill=(110, 104, 98, 220), anchor="ra")
    return img


def frame_animatique(t):
    plan = next(p for p in PLANS if p["t0"] <= t < p["t1"]) if t < DUREE_TOTALE else PLANS[-1]
    if plan["source"] == "rendu":
        img = Image.fromarray(frame_scene3(t - plan["t0"]))
    else:
        img = carton(plan, t)
    return np.asarray(bandeau(img, t))


# --------------------------------------------------------------------------
# Le gabarit des zones sûres
# --------------------------------------------------------------------------

def gabarit():
    img = Image.fromarray(ecrire(fond()))
    d = ImageDraw.Draw(img, "RGBA")
    f_tit = police(POLICE_SERIF, 46)
    f_pet = police(POLICE_MONO, 26)
    f_min = police(POLICE_MONO, 22)

    interdits = [
        ("Barre haute des applis", 0, 0, W, 200),
        ("ICONES", 840, 850, W, 1500),
        ("Legende, pseudo, son", 0, 1500, W, H),
    ]
    for nom, x0, y0, x1, y1 in interdits:
        d.rectangle([x0, y0, x1, y1], fill=(196, 115, 107, 46))
        d.text(((x0 + x1) // 2, (y0 + y1) // 2), nom, font=f_pet,
               fill=(196, 115, 107, 235), anchor="mm")

    pointilles(d, ZONE_SURE, (123, 174, 127, 230))
    d.text((ZONE_SURE["x0"] + 10, ZONE_SURE["y0"] + 12), "ZONE SURE",
           font=f_pet, fill=(123, 174, 127, 255))
    for boite, nom in ((ZONE_LOGO, "LOGO LUMIA"), (ZONE_TITRE, "TEXTE")):
        pointilles(d, boite, (214, 178, 108, 235), pas=12)
        d.text(((boite["x0"] + boite["x1"]) // 2, (boite["y0"] + boite["y1"]) // 2),
               nom, font=f_tit, fill=(214, 178, 108, 255), anchor="mm")
        d.text((boite["x0"] + 8, boite["y1"] + 10),
               f"x {boite['x0']}-{boite['x1']}  y {boite['y0']}-{boite['y1']}",
               font=f_min, fill=(167, 158, 144, 235))
    ornement(d, W // 2, 760, 150, 0.0, (168, 129, 63, 150), 2)
    d.text((W // 2, H - 44), "Lumia  -  choc thermique  -  gabarit 1080x1920",
           font=f_pet, fill=(110, 104, 98, 235), anchor="mm")
    return img


# --------------------------------------------------------------------------
# Encodage
# --------------------------------------------------------------------------

def encoder(fabrique, duree, chemin, etiquette):
    n = int(round(duree * FPS))
    dossier = tempfile.mkdtemp(prefix="lumia-video-")
    try:
        for i in range(n):
            t = i / FPS
            Image.fromarray(fabrique(t)).save(os.path.join(dossier, f"{i:05d}.png"))
            if i % 30 == 0 or i == n - 1:
                print(f"  {etiquette} : {i + 1}/{n}", flush=True)
        cmd = [
            "ffmpeg", "-y", "-loglevel", "error",
            "-framerate", str(FPS), "-i", os.path.join(dossier, "%05d.png"),
            "-c:v", "libx264", "-preset", "slow", "-crf", "17",
            "-pix_fmt", "yuv420p", "-movflags", "+faststart", chemin,
        ]
        subprocess.run(cmd, check=True)
    finally:
        shutil.rmtree(dossier, ignore_errors=True)
    taille = os.path.getsize(chemin) / 1024.0
    print(f"  -> {os.path.relpath(chemin, RACINE)}  ({taille:.0f} ko)")


def main():
    os.makedirs(SORTIE, exist_ok=True)
    if shutil.which("ffmpeg") is None:
        sys.exit("ffmpeg est introuvable : impossible d'encoder.")

    # `python3 rendu.py animatique` ne rejoue que l'animatique, etc.
    voulu = set(sys.argv[1:]) or {"scene3", "animatique", "gabarit"}

    if "scene3" in voulu:
        print(f"Scene 3 — animation scientifique ({SCENE3_DUREE:.2f} s)")
        encoder(frame_scene3, SCENE3_DUREE,
                os.path.join(SORTIE, "scene3-choc-thermique.mp4"), "scene 3")

    if "animatique" in voulu:
        print(f"Animatique — {DUREE_TOTALE:.0f} s minutees")
        encoder(frame_animatique, DUREE_TOTALE,
                os.path.join(SORTIE, "animatique-reperes-12s.mp4"), "animatique")

    print("Gabarit des zones sures")
    gabarit().save(os.path.join(SORTIE, "gabarit-zones-sures.png"))
    print("  -> rendu/gabarit-zones-sures.png")

    # Une vignette par plan, pour la planche de montage.
    for plan in PLANS:
        t = plan["t0"] + (plan["t1"] - plan["t0"]) * 0.55
        src = (frame_scene3(t - plan["t0"]) if plan["source"] == "rendu"
               else np.asarray(carton(plan, t)))
        Image.fromarray(src).resize((W // 3, H // 3), Image.LANCZOS).save(
            os.path.join(SORTIE, f"plan-{plan['id']}.png"))
    print(f"  -> rendu/plan-*.png  ({len(PLANS)} vignettes)")


if __name__ == "__main__":
    main()
