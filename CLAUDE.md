# CLAUDE.md

## État du projet

Le site précédent (**Lumia**, une plateforme d'eBooks Next.js/Prisma : catalogue, lecteur,
profils, abonnements Stripe, avis, panneau d'administration) a été **supprimé à la demande du
propriétaire du projet**. Il ne reste ici qu'un squelette Next.js vide.

Rien n'est encore construit. Ce fichier sera à réécrire quand le nouveau site prendra forme.

## Récupérer l'ancien site

Tout le code supprimé est intact dans l'historique Git, au tag `lumia-avant-reset`
(commit `3d79d3c`). Pour le consulter ou le restaurer :

```bash
git show lumia-avant-reset --stat        # voir ce qu'il contenait
git checkout lumia-avant-reset -- .      # tout restaurer dans le dossier de travail
```

Restaurer le code ne restaure pas la base de données de production : le schéma Prisma et les
migrations reviendraient, mais les données (livres, comptes, avis) dépendent de la base
pointée par `DATABASE_URL`.

## Ce qui reste

- `src/app/layout.tsx` + `src/app/page.tsx` — une page d'accueil vide
- `src/app/globals.css` — Tailwind v4, rien d'autre
- `next.config.mjs`, `tsconfig.json`, `postcss.config.mjs` — la configuration de base

Les dépendances Prisma, NextAuth et Stripe ont été retirées de `package.json` en même temps que
le code qui les utilisait. Elles sont encore installées dans `node_modules` ; un
`npm install` propre les enlèvera.

## Commandes

```bash
npm install
npm run dev     # serveur de développement sur :3000
npm run build   # build de production
npm run start   # lancer le build
```
