/** Planche-contact de couvertures entières, depuis un dossier quelconque.
 *  L'audit des mentions de formule porte sur toute l'image : bandeau haut, bandeau
 *  vertical, pastille au milieu, pied. Se limiter à un bord fait manquer des livres.
 *
 *    node planche.mjs <dossier> [page] [parPage]
 */
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, extname, basename } from "node:path";
const { chromium } = createRequire(import.meta.url)("/opt/node22/lib/node_modules/playwright/index.js");

const dir = process.argv[2];
const page = Number(process.argv[3] ?? 0);
const parPage = Number(process.argv[4] ?? 12);
const tous = readdirSync(dir).filter((f) => /\.(jpg|jpeg|png)$/i.test(f)).sort();
const lot = tous.slice(page * parPage, (page + 1) * parPage);
if (!lot.length) { console.log("fin"); process.exit(0); }

const mime = (f) => (extname(f).toLowerCase() === ".png" ? "image/png" : "image/jpeg");
const cases = lot.map((f) => {
  const b64 = readFileSync(join(dir, f)).toString("base64");
  return `<figure><img src="data:${mime(f)};base64,${b64}"><figcaption>${basename(f, extname(f))}</figcaption></figure>`;
}).join("");

const html = `planche-${page}.html`;
writeFileSync(html, `<!doctype html><meta charset=utf-8><style>
body{background:#fff;margin:0;padding:8px;font:12px system-ui}
.g{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
figure{margin:0}img{width:100%;display:block;border:1px solid #bbb}
figcaption{font-size:11px;padding-top:1px}
</style><div class=g>${cases}</div>`);

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1500, height: 1000 }, deviceScaleFactor: 2 });
await p.goto(`file://${process.cwd()}/${html}`);
await p.screenshot({ path: `planche-${page}.png`, fullPage: true });
await b.close();
console.log(`planche-${page}.png — ${lot.length} couvertures (${page * parPage + 1}–${page * parPage + lot.length} sur ${tous.length})`);
