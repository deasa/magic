# Topdeck

Pull up a chair. Let's talk decks. A set of Magic: The Gathering Commander tools:

- **Deck Analyzer** (first version live): paste a decklist and get an analysis. It looks cards up on
  Scryfall, checks deck size, bans, color identity and duplicates, counts lands, ramp, draw,
  removal and wipes against typical ranges, draws the mana curve and color balance, and writes
  short recommendations.
- **Budget Builder** (coming soon): build a full deck under a per-card price cap.

## Stack

- **Front end:** Vite + React + TypeScript (`src/`).
- **Hosting:** Vercel. Files in `api/` are Vercel Functions; shared server code lives in `server/`.
- **Database:** Turso (libSQL). It caches Scryfall card data for a day and stores saved decks.
  The schema in `server/schema.ts` is applied automatically on first use.
- **Object storage:** Vercel Blob. Connected and checked by `/api/health`; no feature stores files yet.

| Endpoint | What it does |
| --- | --- |
| `POST /api/cards` | Looks up card names, from the Turso cache or Scryfall |
| `GET/POST/DELETE /api/decks` | Lists, saves and deletes saved decks |
| `GET /api/health` | Reports whether the database and Blob store are connected |

## Run it

```sh
npm install
npm run dev        # front end only; card lookups go straight to Scryfall
npx vercel dev     # front end plus the api/ functions (needs .env.local, see .env.example)
```

`npm run build` type-checks and builds, `npm run lint` runs oxlint, `npm test` runs the unit tests
(the server tests use an in-memory libSQL database).

## Deploys

CI (`.github/workflows/ci.yml`) runs lint, tests and build, then deploys with the Vercel CLI: every pull
request gets a preview deploy (the URL is in the run summary) and every push to `main` goes to production.

Hosting is already set up. To recreate it from scratch with the CLIs:

1. **Vercel:** `npx vercel link --yes --project topdeck`.
2. **Blob:** `npx vercel blob create-store topdeck-blob --access public --yes` creates the store, connects
   it and adds `BLOB_READ_WRITE_TOKEN`.
3. **Turso:** `turso db create topdeck`, then add `TURSO_DATABASE_URL` (`turso db show topdeck --url`) and
   `TURSO_AUTH_TOKEN` (`turso db tokens create topdeck`) with `npx vercel env add` for production,
   preview and development.
4. **GitHub:** set the `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` repo variables (from `.vercel/project.json`)
   and a `VERCEL_TOKEN` repo secret (create the token at vercel.com/account/tokens).
5. Open `/api/health`; both entries should say `ok`.

## Brand

- Name lives in `src/brand/brand.ts`.
- Logo: `src/components/Logo.tsx` (a card lifted off a deck, plus wordmark), favicon in `public/favicon.svg`.
- Fonts: Sora (display) and Inter (body), self-hosted via Fontsource.
- Design tokens (colors, type, radii, motion) are CSS variables at the top of `src/index.css`.

![Home](docs/screenshots/home.png)

![Deck Analyzer](docs/screenshots/analyzer.png)

Topdeck is unofficial Fan Content permitted under the Wizards of the Coast Fan Content Policy. Not approved or endorsed by Wizards.
