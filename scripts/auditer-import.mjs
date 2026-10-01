/**
 * Boîte à outils d'inspection d'un lot importé.
 *
 * Paramétrée par le dossier d'import plutôt que recopiée à chaque fois : les copies
 * dérivaient, et le bloc-notes de session ne survit pas d'un jour à l'autre.
 *
 *   node outils.mjs <dossier> table     taille et densité d'accents
 *   node outils.mjs <dossier> charte    motifs de la charte, ventilés par mot
 *   node outils.mjs <dossier> contexte <regex>   chaque occurrence dans son contexte
 *   node outils.mjs <dossier> sommaires [début] [fin]
 *   node outils.mjs <dossier> collisions         slugs déjà au catalogue
 *   node outils.mjs <dossier> volumes            renvois à un autre livre de la collection
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const DIR = process.argv[2];
const ACTION = process.argv[3] ?? "table";
const CATALOGUE = "/home/user/Claud/src/data/books.ts";

/** Découpe sur les accolades de premier niveau, chaînes ignorées. */
function decouper(source) {
  const out = [];
  let profondeur = 0;
  let debut = -1;
  let chaine = false;
  let echap = false;
  for (let i = 0; i < source.length; i += 1) {
    const c = source[i];
    if (chaine) {
      if (echap) echap = false;
      else if (c === "\\") echap = true;
      else if (c === '"') chaine = false;
      continue;
    }
    if (c === '"') chaine = true;
    else if (c === "{") {
      if (profondeur === 0) debut = i;
      profondeur += 1;
    } else if (c === "}") {
      profondeur -= 1;
      if (profondeur === 0) out.push(source.slice(debut, i + 1));
    }
  }
  return out;
}

const champ = (e, k) => {
  const m = e.match(new RegExp(`\\n    ${k}: "((?:[^"\\\\]|\\\\.)*)"`));
  return m ? JSON.parse(`"${m[1]}"`) : "";
};

export const livres = decouper(readFileSync(join(DIR, "books-a-coller.ts"), "utf8")).map((e) => {
  const chapitres = [...e.matchAll(/\{ title: "((?:[^"\\]|\\.)*)", body: "((?:[^"\\]|\\.)*)" \}/g)].map(
    (m) => ({ titre: JSON.parse(`"${m[1]}"`), corps: JSON.parse(`"${m[2]}"`) })
  );
  const corps = chapitres.map((c) => c.corps).join("\n");
  return {
    slug: champ(e, "slug"),
    titre: champ(e, "title"),
    chapitres,
    corps,
    mots: corps.split(/\s+/).filter(Boolean).length,
    accents: (corps.match(/[éèêàçùôîûëïÉÈÊÀÇÔÎÛ]/g) || []).length,
  };
});

/* Chaque motif vise une ligne de la charte. La ventilation par mot compte : « Paris » et
   « mise » déclenchent « jeux d'argent », « usure » est le plus souvent de l'attrition. */
const MOTIFS = [
  ["sexe/nudité", /\b(pornograph\w*|érotiq\w*|nudité|sensuel\w*)\b/gi],
  ["alcool", /\b(alcool\w*|ivresse|ivre|vin|bière|whisky|cocktail)\b/gi],
  ["jeux d'argent", /\b(casino|pari(s|er|e)?|loterie|jeu d.argent|mise[rz]?)\b/gi],
  ["occultisme", /\b(magie|sorcellerie|sortilège\w*|occultisme|astrolog\w*|divination|voyance|talisman\w*)\b/gi],
  ["riba/usure", /\b(usure|usurier\w*|riba|prêt à intérêt)\b/gi],
  ["vulgarité", /\b(putain|merde|salope|connard|enculé)\b/gi],
];

if (ACTION === "table") {
  for (const l of livres) {
    const d = ((l.accents / l.mots) * 100).toFixed(1);
    console.log(
      `${l.slug.slice(0, 44).padEnd(46)} ${String(l.chapitres.length).padStart(2)}ch ${String(Math.round(l.mots / 1000)).padStart(2)}k  ${d}%  « ${l.titre} »`
    );
  }
  console.log(`\n${livres.length} livres · ${livres.reduce((n, l) => n + l.mots, 0).toLocaleString("fr")} mots`);
} else if (ACTION === "charte") {
  for (const l of livres) {
    const trouve = [];
    for (const [nom, re] of MOTIFS) {
      const mots = {};
      for (const m of l.corps.matchAll(re)) {
        const k = m[0].toLowerCase();
        mots[k] = (mots[k] ?? 0) + 1;
      }
      if (Object.keys(mots).length) trouve.push(`${nom} ${JSON.stringify(mots)}`);
    }
    if (trouve.length) console.log(`${l.slug.slice(0, 42).padEnd(44)} ${trouve.join("  ")}`);
  }
} else if (ACTION === "contexte") {
  const re = new RegExp(process.argv[4], "gi");
  for (const l of livres) {
    for (const m of l.corps.matchAll(re)) {
      const d = Math.max(0, m.index - 150);
      console.log(`\n[${l.slug}] …${l.corps.slice(d, m.index + 180).replace(/\n+/g, " ")}…`);
    }
  }
} else if (ACTION === "sommaires") {
  const a = Number(process.argv[4] ?? 0);
  const b = Number(process.argv[5] ?? livres.length);
  for (const l of livres.slice(a, b)) {
    console.log(`\n■ ${l.slug} « ${l.titre} » (${l.chapitres.length}ch, ${Math.round(l.mots / 1000)}k)`);
    console.log("  " + l.chapitres.map((c) => c.titre).join(" · "));
    const fin = l.chapitres[l.chapitres.length - 1];
    console.log(`  ↳ ${fin.corps.replace(/\n+/g, " ").slice(0, 420)}`);
  }
} else if (ACTION === "collisions") {
  const cat = readFileSync(CATALOGUE, "utf8");
  const deja = livres.filter((l) => cat.includes(`\n    slug: "${l.slug}",`));
  console.log(deja.length ? `déjà au catalogue : ${deja.map((l) => l.slug).join(", ")}` : "aucune collision de slug");
} else if (ACTION === "volumes") {
  /* Les livres de cette collection se renvoient les uns aux autres. La formule employée
     décide : « volume », avec un ordre → series ; « jumeau », sans ordre → rien. */
  for (const l of livres) {
    for (const m of ["autre volume", "volume précédent", "déjà un volume", "livre jumeau", "jumeau dans", "même nom d'auteur", "autre livre de cette collection"]) {
      const i = l.corps.indexOf(m);
      if (i >= 0) console.log(`\n[${l.slug}] « ${m} »\n   …${l.corps.slice(Math.max(0, i - 220), i + 320).replace(/\n+/g, " ")}…`);
    }
  }
} else {
  console.error(`action inconnue : ${ACTION}`);
  process.exit(1);
}
