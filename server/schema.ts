// Turso schema, applied by getDb() on first use. Every statement is safe to run repeatedly.
export const SCHEMA = `
-- Scryfall card data, cached so repeat lookups don't hit Scryfall. Prices change daily.
CREATE TABLE IF NOT EXISTS cards (
  name_key   TEXT PRIMARY KEY,   -- lowercased front-face name
  data       TEXT NOT NULL,      -- Scryfall card JSON
  fetched_at INTEGER NOT NULL    -- unix ms
);

-- Decks people save from Deck Analyzer. owner is an anonymous per-browser id until accounts exist.
CREATE TABLE IF NOT EXISTS decks (
  id         TEXT PRIMARY KEY,
  owner      TEXT NOT NULL,
  name       TEXT NOT NULL,
  commander  TEXT,
  list       TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS decks_owner ON decks (owner, updated_at DESC);
`
