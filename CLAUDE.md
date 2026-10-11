# Topdeck

Magic: The Gathering Commander (EDH) tools. Owner: Brendan (GitHub `deasa`).

- **Deck Analyzer** (`src/deck-analyzer/`, route `#/deck-analyzer`): paste a decklist, get an analysis.
  Working: parsing Moxfield/Archidekt/Arena exports, Scryfall lookup, deck size, bans, color identity,
  duplicates, role counts (lands, ramp, draw, removal, wipes) vs typical ranges, mana curve, color
  balance, recommendations, saved decks.
  Not built yet: card suggestions to add (EDHREC), combos (Commander Spellbook), bracket estimate.
- **Budget Builder** (route `#/budget-builder`): placeholder. **Build this next.** Pick a commander and
  a per-card price cap, get a full playable 100-card deck; reuse Deck Analyzer's parsing, card lookup
  and role tagging. Background and later ideas: `docs/commander-app-ideas.md` (written under the old
  names Deck Doctor / Penny Pincher).

## Stack

- Vite + React 19 + TypeScript SPA with hash routing (`src/App.tsx`). No router library.
- **Vercel** hosts the site; `api/*.ts` are Vercel Functions using Web `Request`/`Response` handlers
  (`export async function GET/POST/DELETE`). Shared server code is in `server/`. Relative imports in
  `api/` and `server/` use `.js` extensions so they resolve under Node ESM on Vercel.
- **Turso** (libSQL, `@libsql/client`) is the database. Schema in `server/schema.ts`, applied
  automatically by `getDb()` on first use (keep statements idempotent).
  - `cards`: Scryfall card JSON cached for 24h (prices change daily).
  - `decks`: saved decks, keyed by an anonymous per-browser `owner` UUID until accounts exist.
- **Vercel Blob** (`@vercel/blob`) is the object store. Connected and checked by `/api/health`, but no
  feature stores files yet.
- Env vars (see `.env.example`): `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `BLOB_READ_WRITE_TOKEN`.
  Never commit them; `.env*.local` is gitignored.

### API

| Endpoint | Purpose |
| --- | --- |
| `POST /api/cards` `{names}` | Card lookup: Turso cache first, then Scryfall's `/cards/collection` (75 per batch, 100ms apart, with the `User-Agent` and `Accept` headers Scryfall requires) |
| `GET/POST/DELETE /api/decks` | List, save (replaces same name), delete saved decks for an owner |
| `GET /api/health` | Reports whether Turso and Blob are connected |

The client (`src/lib/scryfall.ts`) calls `/api/cards` and falls back to Scryfall directly when the API
isn't running (plain `npm run dev`). The saved-decks UI hides itself when `/api/decks` isn't available.

## Commands

```sh
npm install
npm run dev       # front end only
npx vercel dev    # front end + api/ functions (needs .env.local; `vercel env pull .env.local`)
npm test          # vitest; server tests use an in-memory libSQL db and mock Scryfall
npm run lint      # oxlint
npm run build     # tsc -b (app, node and api configs) + vite build
```

CI (`.github/workflows/ci.yml`) runs lint, test and build. Vercel deploys through its GitHub
integration. Work goes through pull requests to `main`.

## Design

- Dark, sleek look. Tokens are CSS variables at the top of `src/index.css` (near-black violet surfaces,
  violet/teal brand gradient, gold spark, WUBRG mana colors). Each tool has an accent:
  Budget Builder gold (`accent-gold`), Deck Analyzer teal (`accent-teal`).
- Fonts: Sora (display) and Inter (body), self-hosted via Fontsource.
- Logo: a card lifted off the top of a deck with a gold mana spark (`src/components/Logo.tsx`,
  `public/favicon.svg`). Home hero: the five mana colors in a circle around the logo
  (`src/components/ManaWheel.tsx`; hand-drawn glyphs, not official symbols).
- App name lives in `src/brand/brand.ts`.
- Keep pages lean; Brendan asked for less information on the home page.
- Respect `prefers-reduced-motion`; layouts must work at phone width.

## Copy preferences (from Brendan)

- Friendly and creative, never salesy or ad-like. Don't use "brew".
- Tool names should be descriptive and not cheesy.
- Current hero: "Pull up a chair. Let's talk decks." / "Make the deck you love a little better, or a
  whole lot cheaper."

## Notes

- Footer carries the Wizards of the Coast Fan Content Policy notice; keep it.
- Test data for the sample deck: `src/deck-analyzer/__fixtures__/sample-cards.json` (hand-written,
  Scryfall-shaped). `src/deck-analyzer/sample.ts` is intentionally a bit rough (99 cards, off-color
  cards, light removal) so the analysis has something to say.
- Role tagging is regex over oracle text (`src/deck-analyzer/analyze.ts`); expect to refine it.
