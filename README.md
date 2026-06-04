# Portfolio Tech Africain

Portfolio fullstack de Victoire SAWADOGO, construit avec React, TypeScript, Vite, Express et MongoDB.

## Fonctionnalites

- Portfolio public responsive avec sections profil, parcours, stack, projets, labo, CV et contact.
- Terminal interactif immersif pour explorer le profil et les projets.
- Espace admin protege par session JWT en cookie HTTP-only.
- Edition du contenu principal et upload du CV public.
- API Express avec validation des payloads via Zod.
- Headers HTTP durcis avec Helmet et limitation des tentatives de connexion.
- Synchronisation dynamique des realisations depuis GitHub.

## Installation

```bash
npm install
cp .env.example .env
npm run seed:admin
npm run dev
```

Le client Vite tourne sur `http://localhost:5173` et l'API sur `http://localhost:4000`.

Le contenu principal sauvegarde aussi les projets publics. L'endpoint `/api/projects`
sert les projets du contenu principal et ajoute les repositories GitHub publics
configures.

## Variables D'Environnement

```env
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/portfolio
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
JWT_SECRET=replace-with-a-long-random-secret
GITHUB_USERNAME=seven-v73
GITHUB_TOKEN=
GITHUB_PROJECT_TOPICS=
GITHUB_CACHE_TTL_MS=900000

```

En production, `JWT_SECRET` et `ADMIN_PASSWORD` doivent etre remplaces par des valeurs fortes. Le serveur refuse les valeurs faibles par defaut quand `NODE_ENV=production`. La session admin est envoyee dans un cookie HTTP-only, `secure` en production.

## Synchronisation GitHub

Par defaut, le portfolio recupere les repositories publics non-fork et non archives
du compte `GITHUB_USERNAME`, puis les fusionne avec les projets saisis dans
l'espace admin. Les fiches admin restent prioritaires en cas de doublon.

Pour afficher uniquement certains repositories, ajoute des topics sur GitHub puis
renseigne par exemple:

```env
GITHUB_PROJECT_TOPICS=portfolio,featured,showcase
```

`GITHUB_TOKEN` est optionnel, mais recommande en production pour augmenter les
limites de l'API GitHub. Le cache serveur est controle par `GITHUB_CACHE_TTL_MS`.

## Scripts

```bash
npm run dev         # MongoDB local, API Express et client Vite
npm run api         # API avec nodemon
npm run client      # Client Vite
npm run mongo       # Lance mongod dans .mongo-data si disponible
npm run seed:admin  # Cree ou met a jour le compte admin
npm run build       # TypeScript + build Vite
npm run preview     # Preview du build Vite
npm run start       # Lance l'API en mode production
npm run test        # Tests unitaires Vitest
npm run test:e2e    # Tests e2e Playwright
```

## Deploiement

1. Configurer une base MongoDB accessible depuis le serveur.
2. Copier `.env.production.example`, puis definir `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` et `CORS_ORIGINS`.
3. Lancer `npm run build`.
4. Servir `dist/` avec un hebergeur statique ou un reverse proxy.
5. Lancer `npm run start` pour l'API.

Pour une architecture simple, placer le client statique derriere Nginx/Caddy et proxifier `/api` vers le serveur Node.

## Tests E2E

```bash
npx playwright install chromium
npm run test:e2e
```

Les tests couvrent le portfolio public, la recherche de projets et la page de connexion admin.

## Tests Unitaires

```bash
npm run test
```

Les tests unitaires couvrent les modules purs de VictoireOS, notamment l'evaluation mathematique securisee du terminal.
