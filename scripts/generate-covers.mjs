/**
 * Écrit `src/data/covers.ts` à partir des images présentes dans `assets/couvertures/`.
 *
 *     npm run covers:index
 *
 * Metro exige un chemin littéral dans `require` : impossible de construire le chemin d'une
 * couverture à partir d'un slug au moment de l'exécution. La table est donc écrite en clair,
 * et régénérée quand des couvertures arrivent.
 *
 * Un livre sans image n'est pas une erreur : il garde la couverture composée en code par
 * `BookCover`. Le script le signale, sans échouer — c'est l'état normal d'un livre qui vient
 * d'être importé.
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ART = join(ROOT, "assets", "couvertures");
const CATALOG = join(ROOT, "src", "data", "books.ts");
const OUT = join(ROOT, "src", "data", "covers.ts");

const files = readdirSync(ART).filter((f) => f.endsWith(".jpg"));
const order = [...readFileSync(CATALOG, "utf8").matchAll(/^    slug: "([^"]+)"/gm)].map((m) => m[1]);

const withCover = order.filter((slug) => files.includes(`${slug}.jpg`));
const missing = order.filter((slug) => !files.includes(`${slug}.jpg`));
const orphans = files.map((f) => f.slice(0, -4)).filter((slug) => !order.includes(slug));

const bytes = withCover.reduce((sum, slug) => sum + statSync(join(ART, `${slug}.jpg`)).size, 0);
const weight = (bytes / 1048576).toFixed(1).replace(".", ",");

const lines = withCover
  .map((s) => `  ${JSON.stringify(s)}: require("../../assets/couvertures/${s}.jpg"),`)
  .join("\n");

writeFileSync(
  OUT,
  `import type { ImageSourcePropType } from "react-native";

/**
 * Les couvertures dessinées par l'auteur des livres, embarquées dans le bundle.
 *
 * Ce fichier est **généré** par \`npm run covers:index\` : une entrée par livre du catalogue
 * qui a son image, dans l'ordre du catalogue. Metro exige un chemin littéral dans
 * \`require\` — d'où une table écrite en clair plutôt qu'un chemin construit à partir du slug.
 *
 * Les images sont ramenées à 720 px de large en JPEG, soit ${weight} Mo pour ${withCover.length} couvertures :
 * une couverture ne dépasse jamais 200 pt à l'écran, même sur la fiche livre.
 *
 * Un livre sans entrée ici garde la couverture composée en code par \`BookCover\`.
 */
export const COVERS: Record<string, ImageSourcePropType> = {
${lines}
};

/**
 * Proportion hauteur / largeur du cadre des couvertures, celle de la très grande majorité
 * des images fournies. Les quelques plus carrées sont centrées dedans sans être rognées.
 */
export const COVER_RATIO = 1.7764;

export function getCover(slug: string): ImageSourcePropType | undefined {
  return COVERS[slug];
}
`
);

console.log(`${withCover.length} couvertures référencées (${weight} Mo)`);
if (missing.length) console.log(`sans image, couverture composée : ${missing.join(", ")}`);
if (orphans.length) console.log(`images sans livre au catalogue : ${orphans.join(", ")}`);
