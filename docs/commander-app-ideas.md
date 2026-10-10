> Planning notes from 2026-10-07. Names have changed since: the app is **Topdeck**, Deck Doctor is now **Deck Analyzer**, Penny Pincher is now **Budget Builder**, and the stack is Vite + React on Vercel with Turso and Vercel Blob (see CLAUDE.md).

# Commander App Ideas and Plan

Planning notes for a set of Magic: The Gathering apps aimed at Commander (EDH). Each idea has a name, a pitch, core features, data sources and a rough build size (S = a weekend, M = a few weeks, L = a month or more of evenings).

## Shared data sources

Almost every idea leans on the same few sources, so it's worth building one small shared "card data" layer first.

| Source | What it gives you | Notes |
|---|---|---|
| **Scryfall API** (`api.scryfall.com`) | Every card: oracle text, types, color identity, legality, images, USD/EUR/TIX prices (updated daily) | Free, no key. Ask for 50 to 100 ms between requests. **Bulk data** downloads (one JSON file of all cards) are the right way to power search and filtering locally. |
| **EDHREC** | Popular cards per commander, synergy scores, themes, average decks | No official public API. There is an unofficial JSON endpoint (`json.edhrec.com/pages/commanders/<name>.json`) that many hobby tools use; treat it as fragile and cache it. |
| **Commander Spellbook** (`backend.commanderspellbook.com`) | Known combos, what each combo needs and produces | Has a public API, including "find combos in this decklist". |
| **MTGJSON** | Full card database plus daily price history (TCGplayer, Card Kingdom, Cardmarket) | Free downloads. Good for price trends, which Scryfall doesn't keep. |
| **Moxfield / Archidekt** | Where people already keep decks | Archidekt has a usable public API for reading decks; Moxfield is unofficial. Plain-text decklist import (`1 Sol Ring`) works everywhere and is the safest starting point. |
| **Claude API** | Natural-language deck requests, explaining suggestions, writing card text | Optional, but it makes several ideas much nicer. |

Commander rules to encode once and reuse: 100 cards including the commander, singleton (except basics and "any number" cards), color identity, the banned list (Scryfall's `legalities.commander` covers it), partner/background/companion rules, and the Commander Brackets (1 to 5) for power level.

---

## 1. Your three ideas, expanded

### Penny Pincher (budget deck builder)
*"Pick a commander and a max price per card. Get a complete, playable 100-card deck."*

- Inputs: commander, per-card price cap (for example $1 or $5), optional total budget, optional theme ("tokens", "+1/+1 counters").
- Builds the deck from EDHREC's recommendations for that commander, filtered by Scryfall price, then fills a template: ~36 lands, ~10 ramp, ~10 card draw, ~8 removal, ~3 board wipes, the rest synergy.
- When a staple is over the cap, suggests the closest cheaper card that does the same job ("Cultivate instead of Three Visits").
- Shows total price, price per category, and a "one upgrade at a time" list sorted by impact per dollar.
- Export to plain text, Moxfield or Archidekt.
- Data: Scryfall (prices, legality, color identity), EDHREC (what goes with the commander), MTGJSON (price history so a card that spiked recently can be flagged).
- Size: **M**. The tricky part is "same job, cheaper" substitutes; start with a hand-tagged list of roles (ramp, draw, removal, wipe) using Scryfall search queries like `o:"search your library" t:sorcery` and Scryfall's `otag:` tags.

### Forge of Planes (custom card creator)
*"Design your own Magic cards that look real, and test them in your decks."*

- Card editor with a live preview: name, mana cost, type line, rules text, power/toughness, art upload, frame style (modern, old border, showcase).
- Renders mana symbols, set symbol and rarity properly; exports a print-ready PNG for proxies or a playtest.
- Optional AI helper: "make me a green legendary elf that cares about lands", with a rough power-level check against similar real cards.
- Custom set and custom commander support: save cards into a set and drop them into a deck in the other apps.
- Data: Scryfall for symbol SVGs (`/symbology`) and similar-card comparisons. Frame templates have to be drawn or sourced carefully, since Wizards' official frames and art are copyrighted (fan-content policy allows non-commercial use, so keep it free and unofficial).
- Size: **M to L**. Getting the card to look right (text fitting, symbols inline, frames) is most of the work.

### Deck Doctor (deck improver)
*"Paste your list. Get a checkup and a short prescription."*

- Import from text, Moxfield or Archidekt.
- Checkup: mana curve, color sources vs. color pips, land count, ramp/draw/removal counts compared with typical decks, average price, and estimated bracket (1 to 5).
- Prescription: "cut these 5, add these 5", using EDHREC synergy plus the role counts. Every suggestion comes with a one-line reason.
- Combo finder: shows combos already in the deck and combos one card away (Commander Spellbook).
- Budget mode: only suggest cards under X dollars (shares code with Penny Pincher).
- Data: Scryfall, EDHREC, Commander Spellbook, optionally Claude for the plain-English explanations.
- Size: **M**. Most of the analysis is counting and comparing, which is straightforward once the card data layer exists.

---

## 2. More ideas

### Command Zone Roulette (commander picker)
*"Not sure what to build next? Spin for a commander that fits your taste and wallet."*
- Filters: colors, budget, play style (combo, voltron, tribal, group hug), how popular you want it (hidden gems vs. favorites).
- Shows why it's fun, what the deck usually does, and a budget estimate. One tap sends it to Penny Pincher.
- Data: Scryfall (`is:commander`), EDHREC. Size: **S**. A great first project.

### Pod Tracker (game night tracker)
*"Life totals, commander damage, and stats for your playgroup."*
- Life, commander damage per opponent, poison, energy, monarch/initiative, turn timer.
- Logs who played what and who won, then shows win rates per deck and per player over time.
- Data: none needed beyond Scryfall for commander art. Size: **S to M** (offline-first phone app is the main effort).

### Bracket Check (power level checker)
*"Find out if your deck matches the table before the game, not after."*
- Paste a deck, get its likely Commander Bracket with the reasons (game changers, tutors, fast mana, two-card combos, mass land destruction, extra turns).
- Tells you what to cut to drop a bracket, or add to move up.
- Data: the official Game Changers list, Scryfall, Commander Spellbook. Size: **S**. Could be a feature inside Deck Doctor.

### Binder Buddy (collection-aware builder)
*"Build decks out of cards you already own."*
- Import your collection (CSV from Moxfield, ManaBox, Deckbox, TCGplayer app scans).
- "What can I build right now?" ranks commanders by how much of their typical deck you already own.
- Shopping list for the rest, sorted by price.
- Data: Scryfall, EDHREC, MTGJSON prices. Size: **M**.

### Price Watch (wishlist and price alerts)
*"Tell me when the cards I want get cheap."*
- Wishlist per deck; alerts when a card drops below your target or spikes in a deck you own.
- Weekly "your collection value" summary.
- Data: MTGJSON daily prices or Scryfall daily snapshots stored by you. Size: **S to M** (needs a small scheduled job).

### Goldfish (solo playtester)
*"Draw opening hands and play a few turns before you buy anything."*
- Shuffle, draw 7, mulligan, play out turns 1 to 5 to feel the mana and the curve.
- Stats over 1,000 simulated hands: chance to have 3 lands by turn 3, chance to cast the commander on curve.
- Data: Scryfall. Size: **S** for hand simulation, **L** if you want real rules.

### Rule Zero (table matchmaker / pre-game talk)
*"A one-page summary of your deck to share with the table."*
- Generates a shareable card: commander, bracket, what the deck does, combos, anything people should know.
- Data: reuses Deck Doctor and Bracket Check. Size: **S** once those exist.

### Precon Upgrader
*"Turn any preconstructed Commander deck into a better one, $25 at a time."*
- Pick a precon; get upgrade packs at $25, $50 and $100 with in/out swaps and reasons.
- Data: Scryfall (precon lists via set and `is:commander` searches or MTGJSON deck files), EDHREC. Size: **S to M**, mostly Deck Doctor + Penny Pincher combined.

### Theme Weaver (natural-language deck builder)
*"Describe the deck you want in a sentence; get a list."*
- "Mono-blue deck that steals opponents' creatures, under $100." Claude turns this into Scryfall searches and EDHREC lookups, then hands off to the Penny Pincher builder.
- Data: Claude API + everything above. Size: **M**.

---

## 3. Suggested umbrella

These fit naturally as one app with tabs rather than ten separate apps. A working name for the whole thing: **Commander Toolkit**, or something punchier like **"The Command Zone"** (taken by a podcast, so avoid), **"Ninety-Nine"** (the 99 cards in the deck), **"Singleton"**, or **"Color Identity"**. "Ninety-Nine" is my pick: short, every Commander player gets it, and it isn't a real product name as far as I know (worth a quick search before committing).

## 4. Comparison

| App | Fun to use | Build size | Depends on |
|---|---|---|---|
| Penny Pincher | High | M | Card data layer, EDHREC |
| Deck Doctor | High | M | Card data layer, EDHREC, Spellbook |
| Forge of Planes | High | M to L | Rendering work, no shared deps |
| Command Zone Roulette | Medium | S | Scryfall, EDHREC |
| Bracket Check | Medium | S | Game Changers list, Spellbook |
| Pod Tracker | High for groups | S to M | Nothing |
| Binder Buddy | High | M | Collection import |
| Price Watch | Medium | S to M | Scheduled price job |
| Goldfish | Medium | S | Scryfall |
| Precon Upgrader | Medium | S to M | Deck Doctor + Penny Pincher |
| Theme Weaver | High | M | Claude API, Penny Pincher |

## 5. Recommendation: build these first

1. **Deck Doctor**, with Bracket Check folded in. It's useful on day one with decks you already have, it forces you to build the shared pieces (decklist import, Scryfall card data, role tagging, EDHREC lookups) that every other idea reuses, and it's easy to test: paste your own decks and see if the advice makes sense.
2. **Penny Pincher** next. It's mostly Deck Doctor run in reverse: start from the commander's EDHREC page, apply the price cap, and fill the role template using the same role tags. Shipping it second means most of the hard parts are already done.

Forge of Planes is the most different from the rest (it's a design/rendering project, not a data project), so it's a good separate side project whenever you want a break from the deck tools.

## 6. Suggested tech stack (if you want a starting point)

- **Web app first** (works on phones too): Next.js or SvelteKit + TypeScript.
- **Card data:** download Scryfall bulk data nightly into SQLite (or Postgres) so searches are local and fast; call the live API only for images and odd lookups.
- **Cache EDHREC and Spellbook responses** for a day; they don't change fast and it keeps you polite to their servers.
- **Role tagging:** start with a handful of Scryfall search queries per role (ramp, draw, removal, wipe, tutor, protection), saved as a table of card → roles. Improve by hand over time.
- **Hosting:** Vercel or Fly.io free tiers are enough for personal use.

## 7. First milestones for Deck Doctor

1. Import a plain-text decklist and match every line to a Scryfall card (handle typos and split/double-faced names).
2. Validate it: 100 cards, singleton, color identity, banned list.
3. Show the curve, color sources and role counts next to "typical" counts.
4. Pull the commander's EDHREC page and list the top 10 recommended cards you're missing.
5. Suggest cuts (lowest synergy, off-role cards) and pair them with the adds.
6. Add Commander Spellbook combos and a bracket estimate.
