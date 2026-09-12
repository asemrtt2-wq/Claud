/**
 * Produit les captures d'écran demandées par l'App Store et par Google Play.
 *
 *     npm run boutique:captures
 *
 * Les deux boutiques imposent des dimensions exactes et refusent une image qui ne les
 * respecte pas au pixel près. On rend donc l'app dans un navigateur à la taille voulue
 * plutôt que de redimensionner après coup, ce qui donnerait du texte flou.
 *
 * L'export web sert de support : c'est la même app, les mêmes écrans et les mêmes
 * couvertures que sur le téléphone. Les captures qui partiraient d'un simulateur iOS
 * seraient plus fidèles au pixel près (barre d'état, coins arrondis), mais elles
 * exigeraient un Mac ; les boutiques acceptent les deux.
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
import { readFile, mkdir, rm, stat } from "node:fs/promises";
import { join, extname, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const OUT = join(ROOT, "boutique", "captures");
const PORT = 8099;

/**
 * L'état à poser avant la capture, pour montrer l'app en usage plutôt que vide.
 *
 * Un navigateur neuf n'a pris aucun livre : le lecteur afficherait son écran « ce livre
 * n'est pas encore à toi » et l'accueil « aucune lecture en cours ». On pose donc l'état
 * d'un lecteur qui a pris son livre offert et commencé à lire — c'est ce que voit
 * réellement quelqu'un qui utilise l'app, pas une mise en scène de fonctions absentes.
 *
 * La clé est celle d'AsyncStorage, qui s'appuie sur `localStorage` en web.
 */
const STORAGE_KEY = "lumia:library:v1";

const IN_USE = {
  progress: {
    saladin: { chapter: 4, offset: 0.35, finished: false, updatedAt: "2026-01-01T10:00:00.000Z" },
  },
  favorites: ["la-route-de-la-soie", "le-pouvoir-de-l-ennui"],
  minutesRead: 96,
  plan: null,
  locale: "fr",
  bilingual: false,
  freeBooks: ["saladin"],
  purchased: [],
};

/**
 * Les écrans retenus. `seed` vaut `null` là où l'écran doit être vu par un lecteur qui
 * arrive : l'offre de bienvenue n'a de sens que tant qu'elle n'est pas prise.
 */
const SCREENS = [
  { route: "/(tabs)", name: "accueil", seed: IN_USE },
  { route: "/(tabs)/explorer", name: "catalogue", seed: IN_USE },
  { route: "/livre/saladin", name: "fiche-livre", seed: IN_USE },
  { route: "/lecture/saladin", name: "lecteur", seed: IN_USE },
  { route: "/cadeau", name: "livre-offert", seed: null },
];

/**
 * Les formats exigés. L'App Store demande aujourd'hui le 6,9 pouces (1320 × 2868) ; Google
 * Play accepte tout téléphone d'au moins 1080 px de large en 9:16 environ.
 */
const FORMATS = [
  { prefix: "ios", width: 440, height: 956, scale: 3 },
  { prefix: "android", width: 360, height: 780, scale: 3 },
];

/* --------------------------------------------------------------------- outils */

function loadPlaywright() {
  const require_ = createRequire(import.meta.url);
  const candidates = [
    process.env.PLAYWRIGHT_MODULE,
    "playwright",
    "/opt/node22/lib/node_modules/playwright/index.js",
  ].filter(Boolean);
  for (const id of candidates) {
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

const MIME = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".json": "application/json",
  ".ttf": "font/ttf",
  ".woff2": "font/woff2",
};

/** Sert `dist`, en renvoyant index.html pour toute route inconnue (routage côté client). */
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

/* ------------------------------------------------------------------ la bannière */

/**
 * L'image de mise en avant de Google Play : 1024 × 500, obligatoire, et purement
 * typographique — la charte exclut toute représentation figurative, y compris ici.
 */
const BANNER = `<!doctype html><meta charset="utf-8"><style>
  html,body{margin:0;width:1024px;height:500px;overflow:hidden}
  body{background:radial-gradient(120% 140% at 78% 18%, #26200F 0%, #14131A 45%, #0B0B0F 100%);
       display:flex;align-items:center;justify-content:center;font-family:Georgia,serif}
  .wrap{text-align:center;color:#F4EFE6}
  .name{font-size:82px;letter-spacing:26px;color:#EAD3A0;margin-left:26px}
  .rule{width:120px;height:1px;background:#A8813F;margin:26px auto}
  .line{font-size:22px;letter-spacing:5px;color:#A79E90;text-transform:uppercase}
  .foot{margin-top:34px;font-size:17px;letter-spacing:2px;color:#6E6862}
  .star{position:absolute;right:96px;top:96px;width:230px;height:230px;
        border:1px solid rgba(214,178,108,.22);transform:rotate(45deg)}
  .star::after{content:"";position:absolute;inset:0;border:1px solid rgba(214,178,108,.22)}
  .star2{position:absolute;right:96px;top:96px;width:230px;height:230px;
         border:1px solid rgba(214,178,108,.14)}
</style>
<div class="star2"></div><div class="star"></div>
<div class="wrap">
  <div class="name">LUMIA</div>
  <div class="rule"></div>
  <div class="line">Lire · Comprendre · Évoluer</div>
  <div class="foot">56 livres courts, hors ligne, sans compte</div>
</div>`;

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

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const server = await serve(DIST);
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM || undefined,
});

for (const format of FORMATS) {
  for (const [index, screen] of SCREENS.entries()) {
    // Une page neuve par capture : l'état est posé avant que le bundle ne démarre, et deux
    // captures ne peuvent pas se contaminer.
    const page = await browser.newPage({
      viewport: { width: format.width, height: format.height },
      deviceScaleFactor: format.scale,
    });
    await page.addInitScript(
      ([key, seed]) => {
        try {
          if (seed) localStorage.setItem(key, seed);
          else localStorage.removeItem(key);
        } catch {
          /* un stockage indisponible donne simplement l'état vide */
        }
      },
      [STORAGE_KEY, screen.seed ? JSON.stringify(screen.seed) : null]
    );
    await page.goto(`http://localhost:${PORT}${screen.route}`, { waitUntil: "networkidle" });
    // Les couvertures se décodent après le premier rendu : sans cette pause, une capture
    // sur deux montre un cadre vide à la place de l'image.
    await page.waitForTimeout(1800);
    await page.screenshot({
      path: join(OUT, `${format.prefix}-${index}-${screen.name}.jpg`),
      type: "jpeg",
      quality: 90,
    });
    await page.close();
  }
  console.log(
    `${format.prefix} : ${SCREENS.length} captures en ${format.width * format.scale} × ${
      format.height * format.scale
    }`
  );
}

const banner = await browser.newPage({ viewport: { width: 1024, height: 500 } });
await banner.setContent(BANNER, { waitUntil: "load" });
await banner.screenshot({ path: join(OUT, "android-banniere.jpg"), type: "jpeg", quality: 92 });
console.log("bannière Google Play : 1024 × 500");

await browser.close();
server.close();
console.log(`\n→ ${OUT}`);
