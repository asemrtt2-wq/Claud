/**
 * Produit les pages légales du site, à partir de l'app elle-même.
 *
 *     npm run boutique:pages
 *
 * Apple et Google exigent une **adresse web publique** hébergeant la politique de
 * confidentialité, en plus du texte affiché dans l'app. Ces deux versions doivent dire la
 * même chose : une politique de confidentialité qui diffère entre le site et l'app est un
 * motif de rejet, et surtout une promesse à deux visages.
 *
 * Plutôt que de recopier les textes — une copie finit toujours par diverger — ce script
 * ouvre les écrans `/conditions` et `/confidentialite` de l'app dans Chromium et en extrait
 * le contenu rendu. Ce que le site publiera est donc, au mot près, ce que le lecteur voit
 * dans l'app, prix compris, puisque ces écrans lisent `plans.ts`.
 *
 * Les intertitres sont reconnus par leur `accessibilityRole="header"`, posé dans
 * `src/components/LegalDocument.tsx` : la même annotation sert à VoiceOver et à TalkBack.
 *
 * Il faut Chromium :
 *
 *     npx playwright install chromium
 *
 * ou, si Chromium est déjà quelque part, `PLAYWRIGHT_CHROMIUM=/chemin/vers/chromium`.
 */
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { join, extname, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const OUT = join(ROOT, "boutique", "pages");
const PORT = 8106;

const PAGES = [
  { route: "/confidentialite", file: "confidentialite.html" },
  { route: "/conditions", file: "conditions.html" },
];

/* --------------------------------------------------------------------- outils */

function loadPlaywright() {
  const require_ = createRequire(import.meta.url);
  for (const id of [
    process.env.PLAYWRIGHT_MODULE,
    "playwright",
    "/opt/node22/lib/node_modules/playwright/index.js",
  ].filter(Boolean)) {
    try {
      return require_(id);
    } catch {
      /* on essaie le suivant */
    }
  }
  throw new Error(
    "Chromium introuvable. Lancer « npx playwright install chromium », ou définir PLAYWRIGHT_CHROMIUM."
  );
}

const MIME = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".json": "application/json",
  ".ttf": "font/ttf",
};

function serve(root) {
  const server = createServer(async (req, res) => {
    const path = decodeURIComponent((req.url ?? "/").split("?")[0]);
    let file = join(root, path);
    try {
      if ((await stat(file)).isDirectory()) file = join(file, "index.html");
    } catch {
      file = join(root, "index.html");
    }
    try {
      const body = await readFile(file);
      res.writeHead(200, { "content-type": MIME[extname(file)] ?? "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  return new Promise((ok) => server.listen(PORT, () => ok(server)));
}

const escape = (text) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Une page autonome : aucune ressource externe, rien à installer pour l'héberger. */
function render({ title, blocks }) {
  const body = blocks
    .map((b) => {
      if (b.kind === "h1") return `  <h1>${escape(b.text)}</h1>`;
      if (b.kind === "h2") return `  <h2>${escape(b.text)}</h2>`;
      if (b.kind === "li") return `  <li>${escape(b.text)}</li>`;
      return `  <p>${escape(b.text)}</p>`;
    })
    // Les puces consécutives sont regroupées dans une seule liste.
    .join("\n")
    .replace(/(?:^|\n)((?:  <li>.*<\/li>\n?)+)/g, (_, items) => `\n  <ul>\n${items}  </ul>\n`);

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)} — Lumia</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 48px 20px 96px;
    background: #0B0B0F; color: #A79E90;
    font: 16px/1.65 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  }
  main { max-width: 42rem; margin: 0 auto; }
  .marque {
    font-family: Georgia, "Times New Roman", serif;
    letter-spacing: .5em; color: #EAD3A0; font-size: 15px;
    text-transform: uppercase; margin-bottom: 40px;
  }
  h1 {
    font-family: Georgia, "Times New Roman", serif; font-weight: 400;
    font-size: clamp(28px, 6vw, 38px); line-height: 1.2; color: #F4EFE6; margin: 0 0 8px;
  }
  h2 {
    font-family: Georgia, "Times New Roman", serif; font-weight: 400;
    font-size: 20px; color: #F4EFE6; margin: 40px 0 10px;
  }
  p { margin: 0 0 14px; }
  ul { margin: 0 0 14px; padding-left: 20px; }
  li { margin-bottom: 8px; }
  li::marker { color: #D6B26C; }
  a { color: #D6B26C; }
  .sourced {
    margin-top: 64px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,.08);
    font-size: 13px; color: #6E6862;
  }
</style>
</head>
<body>
<main>
  <div class="marque">Lumia</div>
${body}
  <p class="sourced">Ce texte est celui affiché dans l'application Lumia. Les deux versions
  sont produites à partir de la même source, afin qu'elles ne puissent pas diverger.</p>
</main>
</body>
</html>
`;
}

/* ------------------------------------------------------- les mentions légales */

/**
 * Les mentions légales, que l'app ne porte pas — elles concernent le site, pas le lecteur.
 *
 * En France, la loi pour la confiance dans l'économie numérique impose à tout site de dire
 * qui l'édite et qui l'héberge. Une nuance utile à connaître : un éditeur **non
 * professionnel** peut ne pas afficher publiquement son adresse personnelle, à condition
 * d'avoir communiqué son identité à son hébergeur, qui la tient à disposition de la justice.
 * Le nom et les coordonnées de l'hébergeur, eux, restent publics dans tous les cas.
 *
 * Ce fichier est un modèle : les champs entre crochets doivent être remplis, et le tout
 * vérifié — ce script ne donne pas de conseil juridique.
 */
function mentionsLegales(publisher, host) {
  const blocks = [
    { kind: "h1", text: "Mentions légales" },
    { kind: "p", text: "Informations sur l'éditeur et l'hébergement de ce site." },
    { kind: "h2", text: "Éditeur" },
    { kind: "p", text: `Nom : ${publisher.name}` },
    { kind: "p", text: `Contact : ${publisher.email}` },
    { kind: "p", text: "Statut : éditeur non professionnel, personne physique." },
    /*
     * L'adresse personnelle n'est pas publiée, à la demande de l'éditeur.
     *
     * La loi pour la confiance dans l'économie numérique le permet à un éditeur non
     * professionnel, à condition d'avoir communiqué son identité à l'hébergeur, qui la
     * tient à disposition de l'autorité judiciaire. Les coordonnées de l'hébergeur, elles,
     * restent publiques — c'est ce qui rend l'éditeur joignable par la voie légale.
     */
    { kind: "p", text: "Conformément à la loi pour la confiance dans l'économie numérique, l'éditeur, personne physique non professionnelle, ne publie pas son adresse personnelle. Son identité est détenue par l'hébergeur du site, qui la tient à la disposition de l'autorité judiciaire." },
    { kind: "p", text: `Directeur de la publication : ${publisher.name}` },
    { kind: "h2", text: "Hébergeur" },
    { kind: "p", text: `Ce site est hébergé par ${host.name}` },
    { kind: "p", text: host.address },
    host.phone
      ? { kind: "p", text: `Téléphone : ${host.phone}` }
      : { kind: "p", text: "[ Relever le téléphone de l'hébergeur sur ses propres mentions légales, et le renseigner dans src/data/legal.ts. ]" },
    { kind: "h2", text: "Propriété intellectuelle" },
    { kind: "p", text: "Les textes des livres, les couvertures et l'application Lumia sont la propriété de leur auteur. Toute reproduction ou diffusion intégrale, gratuite ou payante, est interdite sans autorisation écrite. La citation d'extraits avec mention de la source reste libre." },
    { kind: "h2", text: "Données personnelles" },
    { kind: "p", text: "L'application Lumia ne collecte aucune donnée personnelle : elle ne contacte aucun serveur et ne demande aucun compte. Le détail figure dans la politique de confidentialité." },
    { kind: "p", text: `Ce site, lui, est hébergé par ${host.name}, qui peut déposer des cookies et enregistrer des statistiques de visite. Le détail figure dans la politique de confidentialité de l'hébergeur. [ à vérifier dans les réglages du site, et à décrire ici si des outils de mesure sont activés ]` },
    { kind: "h2", text: "Nous écrire" },
    { kind: "p", text: `Toute question sur ce site ou sur l'application : ${publisher.email}` },
  ];
  return render({ title: "Mentions légales", blocks });
}

/* ------------------------------------------------------------------------ main */

const { chromium } = loadPlaywright();

try {
  await stat(join(DIST, "index.html"));
  console.log("export web déjà présent");
} catch {
  console.log("export web…");
  const built = spawnSync("npx", ["expo", "export", "--platform", "web", "--clear"], {
    cwd: ROOT,
    stdio: "inherit",
  });
  if (built.status !== 0) throw new Error("l'export web a échoué");
}

await mkdir(OUT, { recursive: true });
const server = await serve(DIST);
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM || undefined,
});

for (const page of PAGES) {
  const tab = await browser.newPage({ viewport: { width: 900, height: 1200 } });
  await tab.goto(`http://localhost:${PORT}${page.route}`, { waitUntil: "networkidle" });
  await tab.waitForTimeout(1200);

  const blocks = await tab.evaluate(() => {
    const out = [];
    let seenTitle = false;
    // On parcourt les nœuds de texte terminaux : react-native-web n'émet pas de balises
    // sémantiques, seul `role="heading"` distingue un intertitre.
    const walk = (node) => {
      for (const child of node.children) {
        const heading = child.getAttribute("role") === "heading";
        const own = [...child.childNodes]
          .filter((n) => n.nodeType === 3)
          .map((n) => n.textContent.trim())
          .join(" ")
          .trim();
        if (own) {
          if (heading) {
            out.push({ kind: seenTitle ? "h2" : "h1", text: own });
            seenTitle = true;
          } else {
            out.push({ kind: "p", text: own });
          }
        }
        walk(child);
      }
    };
    walk(document.body);
    return out;
  });

  // La barre du haut de l'app (« Retour », « Conditions ») n'a pas de sens sur le site.
  const cleaned = [];
  for (const block of blocks) {
    if (block.kind !== "h1" && cleaned.length === 0) continue;
    if (!block.text) continue;
    /* Les icônes sont une police : leurs glyphes vivent dans la zone à usage privé
       d'Unicode et arrivent ici comme du texte. Sur le site, ce serait un carré vide. */
    if (/^[-\s]+$/u.test(block.text)) continue;
    /* L'encadré qui rappelle de renseigner `src/data/legal.ts` s'adresse à qui développe
       l'app, pas au lecteur : il reste à l'écran et ne part pas sur le site. Le nom de
       l'éditeur, lui, apparaît en pied de page — s'il manque, cela se voit. */
    if (block.text.includes("src/data/legal.ts")) continue;
    cleaned.push(block);
  }
  // Le point d'une puce est rendu comme un bloc à part : on le recolle au texte suivant.
  const blocksFinal = [];
  for (let i = 0; i < cleaned.length; i += 1) {
    if (cleaned[i].text === "·" && cleaned[i + 1]) {
      blocksFinal.push({ kind: "li", text: cleaned[i + 1].text });
      i += 1;
    } else {
      blocksFinal.push(cleaned[i]);
    }
  }

  const title = blocksFinal[0]?.text ?? "Lumia";
  await writeFile(join(OUT, page.file), render({ title, blocks: blocksFinal }), "utf8");
  console.log(`${page.file.padEnd(24)} ${blocksFinal.length} blocs — « ${title} »`);
  await tab.close();
}

/*
 * L'éditeur et l'hébergeur sont lus dans `src/data/legal.ts` — une seule source pour l'app
 * et pour le site. Chaque bloc est isolé avant lecture : `name` existe dans les deux.
 */
const legalSource = await readFile(join(ROOT, "src", "data", "legal.ts"), "utf8");
const blockOf = (constant) => {
  const start = legalSource.indexOf(`export const ${constant}`);
  if (start < 0) throw new Error(`${constant} introuvable dans src/data/legal.ts`);
  return legalSource.slice(start, legalSource.indexOf("};", start));
};
const field = (block, name) =>
  block.match(new RegExp(`\\b${name}:\\s*"((?:[^"\\\\]|\\\\.)*)"`))?.[1] ?? "";

const publisherBlock = blockOf("PUBLISHER");
const publisher = {
  name: field(publisherBlock, "name") || "À COMPLÉTER",
  email: field(publisherBlock, "email") || "À COMPLÉTER",
};
const hostBlock = blockOf("HOST");
const host = {
  name: field(hostBlock, "name") || "À COMPLÉTER",
  address: field(hostBlock, "address") || "À COMPLÉTER",
  phone: field(hostBlock, "phone"),
};
await writeFile(join(OUT, "mentions-legales.html"), mentionsLegales(publisher, host), "utf8");
console.log(`${"mentions-legales.html".padEnd(24)} modèle à compléter`);

await browser.close();
server.close();
console.log(`\n→ ${OUT}`);
console.log("À téléverser tel quel : ce sont des fichiers autonomes, sans ressource externe.");

/* Une page légale sans éditeur identifiable ne doit pas être mise en ligne : les deux
   boutiques la refusent, et en France la loi impose de nommer qui publie un site. */
const generated = await readFile(join(OUT, PAGES[0].file), "utf8");
if (generated.includes("À COMPLÉTER")) {
  console.log(
    "\n⚠ L'éditeur n'est pas renseigné : ces pages portent « À COMPLÉTER » en toutes lettres."
  );
  console.log("  Remplir PUBLISHER dans src/data/legal.ts, puis relancer, avant de publier.");
}
