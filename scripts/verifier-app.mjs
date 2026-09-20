/**
 * Passe l'app en revue écran par écran, et vérifie la logique d'accès.
 *
 * Ce n'est pas un aperçu à regarder : c'est une batterie de contrôles qui échouent
 * bruyamment. Chaque écran est ouvert, on relève les erreurs de console, on vérifie qu'il
 * affiche bien quelque chose, et on éprouve la porte du catalogue pour les quatre états
 * d'abonnement possibles.
 */
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require_ = createRequire(import.meta.url);
function loadPlaywright() {
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
  throw new Error("Chromium introuvable. Lancer « npx playwright install chromium ».");
}
const { chromium } = loadPlaywright();

const PROJET = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = join(PROJET, "dist");
const PORT = 8110;
const KEY = "lumia:library:v1";

const MIME = {
  ".html": "text/html", ".js": "application/javascript", ".css": "text/css",
  ".ico": "image/x-icon", ".png": "image/png", ".jpg": "image/jpeg",
  ".json": "application/json", ".ttf": "font/ttf",
};

try {
  await stat(join(ROOT, "index.html"));
} catch {
  console.log("export web…");
  const built = spawnSync("npx", ["expo", "export", "--platform", "web", "--clear"], {
    cwd: PROJET,
    stdio: "inherit",
  });
  if (built.status !== 0) throw new Error("l'export web a échoué");
}

const server = createServer(async (req, res) => {
  const path = decodeURIComponent((req.url ?? "/").split("?")[0]);
  let file = join(ROOT, path);
  try {
    if ((await stat(file)).isDirectory()) file = join(file, "index.html");
  } catch {
    file = join(ROOT, "index.html");
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
await new Promise((ok) => server.listen(PORT, ok));

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM || undefined,
});

const state = (extra = {}) =>
  JSON.stringify({
    progress: {}, favorites: [], minutesRead: 0, plan: null,
    locale: "fr", bilingual: false, freeBooks: [], purchased: [], ...extra,
  });

let failures = 0;
const check = (label, ok, detail = "") => {
  console.log(`${ok ? "  ok  " : "  ÉCHEC"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures += 1;
};

/** Ouvre une route avec un état donné et renvoie son texte + ses erreurs. */
async function open(route, seed = state()) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.addInitScript(([k, v]) => {
    try { localStorage.setItem(k, v); } catch { /* stockage indisponible */ }
  }, [KEY, seed]);
  await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  const text = await page.evaluate(() => document.body.innerText);
  await page.close();
  return { text, errors };
}

/* ------------------------------------------------- 1. tous les écrans s'ouvrent */

console.log("\n1. Les écrans s'ouvrent, sans erreur de console\n");
const SCREENS = [
  ["/", "Écran d'ouverture", "LUMIA"],
  ["/(tabs)", "Accueil", "Reprendre la lecture"],
  ["/(tabs)/explorer", "Explorer", "Nouveautés"],
  ["/(tabs)/bibliotheque", "Bibliothèque", "Tout"],
  ["/(tabs)/profil", "Mon espace", "Lumia"],
  ["/livre/saladin", "Fiche livre", "Saladin"],
  // Le lecteur se teste avec un accès : sans lui, il affiche à juste titre son écran
  // verrouillé, ce qui est le comportement voulu et non le lecteur.
  ["/livre/napoleon", "Fiche livre (verrouillée)", "Napoléon"],
  ["/cadeau", "Livre offert", "offert"],
  ["/abonnement", "Abonnements", "9,99"],
  ["/langue", "Langue", "langue"],
  ["/conditions", "Conditions", "Conditions"],
  ["/confidentialite", "Confidentialité", "confidentialité"],
];
for (const [route, label, expected] of SCREENS) {
  const { text, errors } = await open(route);
  check(
    `${label.padEnd(20)} ${route}`,
    errors.length === 0 && text.includes(expected),
    errors.length ? errors[0].slice(0, 90) : text.includes(expected) ? "" : `« ${expected} » absent`
  );
}

/* ------------------------------------------ 2. la porte du catalogue, par formule */

/*
 * Les livres réservés sont lus dans le catalogue, pas recopiés ici : ajouter un livre
 * réservé sans le tester serait autrement trop facile.
 */
const catalogue = await readFile(join(PROJET, "src", "data", "books.ts"), "utf8");
const RESERVES = [...catalogue.matchAll(/\n    slug: "([^"]+)",[\s\S]{0,900}?\n    plan: "(plus|premium|extra)",/g)]
  .map((m) => ({ slug: m[1], plan: m[2] }));
const RANGS = { plus: 1, premium: 2, extra: 3 };

console.log(`\n2. La porte du catalogue — ${RESERVES.length} livres réservés × 4 formules\n`);
check(`le catalogue déclare bien des livres réservés`, RESERVES.length > 0,
  RESERVES.map((r) => `${r.slug}=${r.plan}`).join(", "));

for (const formule of [null, "plus", "premium", "extra"]) {
  const rangLecteur = formule ? RANGS[formule] : 0;
  for (const { slug, plan } of RESERVES) {
    const doitOuvrir = rangLecteur >= RANGS[plan];
    const { text } = await open(`/livre/${slug}`, state({ plan: formule }));
    const ouvert = /\n(Lire|Reprendre)\n/.test(text);
    check(
      `${String(formule ?? "aucun").padEnd(8)} ${slug.slice(0, 34).padEnd(36)} réservé ${plan.padEnd(8)} ${doitOuvrir ? "doit ouvrir" : "doit rester fermé"}`,
      ouvert === doitOuvrir
    );
  }
}

console.log("\n2 bis. Un livre ordinaire suit l'autre règle\n");
for (const [formule, doitOuvrir] of [[null, false], ["plus", true], ["premium", true], ["extra", true]]) {
  const { text } = await open("/livre/napoleon", state({ plan: formule }));
  check(`${String(formule ?? "aucun").padEnd(8)} napoleon (ordinaire) ${doitOuvrir ? "doit ouvrir" : "doit rester fermé"}`,
    /\n(Lire|Reprendre)\n/.test(text) === doitOuvrir);
}

console.log("\n2 ter. Aucun livre réservé ne se vend ni ne s'offre\n");
for (const { slug, plan } of RESERVES) {
  const { text } = await open(`/livre/${slug}`);
  const nom = { plus: "Lumia Plus", premium: "Lumia Premium", extra: "Lumia Extra" }[plan];
  check(
    `${slug.slice(0, 40).padEnd(42)} → « S'abonner à ${nom} »`,
    !text.includes("Acheter —") && !text.includes("Lire gratuitement") && text.includes(`S'abonner à ${nom}`)
  );
}

/* --------------------------------------- 3. ce qui ne doit jamais être proposé */

console.log("\n3. Ce que l'app ne doit jamais proposer\n");

const cook = await open("/livre/james-cook");
check("un livre réservé ne propose pas l'achat à l'unité", !cook.text.includes("Acheter —"));
check("un livre réservé ne propose pas le cadeau", !cook.text.includes("Lire gratuitement"));
check("un livre réservé renvoie vers son abonnement", cook.text.includes("S'abonner à Lumia Premium"));

const cadeau = await open("/cadeau");
for (const reserve of ["James Cook", "Épictète", "Spartacus"]) {
  check(`« ${reserve} » n'est pas proposé en cadeau`, !cadeau.text.includes(reserve));
}

const abo = await open("/abonnement");
check("l'écran d'abonnement ne promet plus « le catalogue complet »",
  !abo.text.includes("catalogue complet"));
check("l'écran d'abonnement dit qu'aucun paiement n'est actif",
  abo.text.includes("Le paiement n'est pas encore en place"));
check("l'écran d'abonnement annonce le renouvellement automatique",
  abo.text.includes("renouvelle automatiquement"));

/* ------------------------------------------------ 4. le livre offert est définitif */

console.log("\n4. Le livre offert\n");
const pris = await open("/cadeau", state({ freeBooks: ["saladin"] }));
check("une fois pris, l'écran ne propose plus de choisir", !pris.text.includes("Choisir celui-ci"));
check("une fois pris, il montre le livre gardé", pris.text.includes("Votre livre"));

const saladinPris = await open("/livre/saladin", state({ freeBooks: ["saladin"] }));
check("le livre offert s'ouvre sans abonnement", /\n(Lire|Reprendre)\n/.test(saladinPris.text));

const lecteur = await open("/lecture/saladin", state({ freeBooks: ["saladin"] }));
check("le lecteur affiche le texte du livre", lecteur.text.includes("Deux Saladin"), lecteur.errors[0] ?? "");
check("le lecteur affiche la position dans le livre", /1 \/ \d+/.test(lecteur.text));

const lecteurFerme = await open("/lecture/napoleon");
check("le lecteur refuse un livre non acquis", lecteurFerme.text.includes("n'est pas encore à toi"));

/* ------------------------------------------------------------ 5. les textes légaux */

console.log("\n5. Les textes légaux\n");
const confid = await open("/confidentialite");
check("l'éditeur est nommé", confid.text.includes("Asem"));
check("aucun « À COMPLÉTER » ne subsiste", !confid.text.includes("À COMPLÉTER"));
check("l'avertissement interne n'est plus affiché", !confid.text.includes("src/data/legal.ts"));

await browser.close();
server.close();

console.log(`\n${failures === 0 ? "✓ tout passe" : `✗ ${failures} échec(s)`}\n`);
process.exit(failures === 0 ? 0 : 1);
