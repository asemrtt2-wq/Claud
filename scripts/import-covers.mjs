/**
 * Embarque des couvertures dans l'app, ramenées à 720 px de large en JPEG.
 *
 *     npm run covers:import -- <dossier>
 *     npm run covers:index          # puis régénérer la table
 *
 * Le dossier attendu est celui que produit `npm run books:import` : une image par livre,
 * nommée par son slug. Les images d'origine font plusieurs méga-octets chacune ; à 720 px
 * elles en pèsent deux cents kilo-octets et restent nettes, une couverture ne dépassant
 * jamais 200 pt à l'écran.
 *
 * Le redimensionnement passe par Chromium plutôt que par une bibliothèque d'images : c'est
 * une dépendance de développement de moins dans un projet qui n'en a aucune pour cela.
 *
 *     npx playwright install chromium
 *
 * ou, si Chromium est déjà quelque part, `PLAYWRIGHT_CHROMIUM=/chemin/vers/chromium`.
 */
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, extname, basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "assets", "couvertures");
const WIDTH = 720;
const QUALITY = 0.82;
const SOURCES = new Set([".png", ".jpg", ".jpeg", ".webp"]);

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
    "Chromium introuvable. Lancer « npx playwright install chromium », ou définir PLAYWRIGHT_MODULE."
  );
}

const dir = process.argv[2];
if (!dir) {
  console.error("Usage : npm run covers:import -- <dossier-des-images>");
  process.exit(1);
}

const files = readdirSync(dir).filter((f) => SOURCES.has(extname(f).toLowerCase()));
if (files.length === 0) {
  console.error(`Aucune image dans ${dir}`);
  process.exit(1);
}

/** Les slugs du catalogue : une image qui n'en vise aucun est presque toujours une faute. */
const slugs = new Set(
  [...readFileSync(join(ROOT, "src", "data", "books.ts"), "utf8").matchAll(/^    slug: "([^"]+)"/gm)].map(
    (m) => m[1]
  )
);

const { chromium } = loadPlaywright();
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM || undefined,
});
const page = await browser.newPage();

let total = 0;
const unknown = [];
for (const file of files.sort()) {
  const slug = basename(file, extname(file));
  if (!slugs.has(slug)) unknown.push(slug);

  // Une page neuve par image : garder vingt PNG de deux méga-octets dans le même contexte
  // finit par épuiser la mémoire du navigateur.
  await page.goto("about:blank");
  const b64 = readFileSync(join(dir, file)).toString("base64");
  const out = await page.evaluate(
    async ([data, width, quality]) => {
      const img = new Image();
      img.src = "data:image/png;base64," + data;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = Math.min(width, img.naturalWidth);
      canvas.height = Math.round((img.naturalHeight / img.naturalWidth) * canvas.width);
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      return { url: canvas.toDataURL("image/jpeg", quality), w: canvas.width, h: canvas.height };
    },
    [b64, WIDTH, QUALITY]
  );

  const buffer = Buffer.from(out.url.split(",")[1], "base64");
  writeFileSync(join(OUT, `${slug}.jpg`), buffer);
  total += buffer.length;
  console.log(`${slug.padEnd(52)} ${out.w}×${out.h}  ${(buffer.length / 1024).toFixed(0)} Ko`);
}

await browser.close();
console.log(`\n${files.length} couvertures, ${(total / 1048576).toFixed(1)} Mo ajoutés à ${OUT}`);
if (unknown.length) {
  console.log(`\n⚠ sans livre au catalogue : ${unknown.join(", ")}`);
  console.log("  (le nom du fichier doit être le slug du livre)");
}
console.log("\nPuis : npm run covers:index");
