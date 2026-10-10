import type { Client } from '@libsql/client'
import { nameKey, type RawCard } from '../src/lib/scryfall.js'

const DAY_MS = 24 * 60 * 60 * 1000
const BATCH = 75 // Scryfall's limit per collection request
const DELAY_MS = 100 // Scryfall asks for 50-100ms between requests
export const MAX_NAMES = 250

// Scryfall requires both headers on API requests.
const SCRYFALL_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  'User-Agent': 'Topdeck/0.1 (https://github.com/deasa/magic)',
}

export type CardsResult = { cards: RawCard[]; notFound: string[] }

/**
 * Look cards up by name, serving fresh copies from the Turso cache and fetching the rest from
 * Scryfall. Cards older than a day are refetched because prices update daily.
 */
export async function lookupCards(
  db: Client,
  names: string[],
  fetchImpl: typeof fetch = fetch,
  now = Date.now(),
): Promise<CardsResult> {
  const keys = new Map<string, string>() // key -> original spelling
  for (const n of names) if (n.trim()) keys.set(nameKey(n), n.trim())

  const cards: RawCard[] = []
  const fresh = new Set<string>()
  const keyList = [...keys.keys()]
  for (let i = 0; i < keyList.length; i += 100) {
    const chunk = keyList.slice(i, i + 100)
    const rs = await db.execute({
      sql: `SELECT name_key, data FROM cards WHERE fetched_at > ? AND name_key IN (${chunk.map(() => '?').join(',')})`,
      args: [now - DAY_MS, ...chunk],
    })
    for (const row of rs.rows) {
      fresh.add(String(row.name_key))
      cards.push(JSON.parse(String(row.data)))
    }
  }

  const missing = keyList.filter((k) => !fresh.has(k)).map((k) => keys.get(k)!)
  const notFound: string[] = []
  for (let i = 0; i < missing.length; i += BATCH) {
    if (i > 0) await new Promise((r) => setTimeout(r, DELAY_MS))
    const batch = missing.slice(i, i + BATCH)
    const res = await fetchImpl('https://api.scryfall.com/cards/collection', {
      method: 'POST',
      headers: SCRYFALL_HEADERS,
      body: JSON.stringify({ identifiers: batch.map((name) => ({ name })) }),
    })
    if (!res.ok) throw new Error(`Scryfall returned ${res.status}`)
    const json = (await res.json()) as { data: RawCard[]; not_found?: { name: string }[] }
    for (const nf of json.not_found ?? []) notFound.push(nf.name)
    if (json.data.length) {
      await db.batch(
        json.data.map((card) => ({
          sql: `INSERT INTO cards (name_key, data, fetched_at) VALUES (?, ?, ?)
                ON CONFLICT (name_key) DO UPDATE SET data = excluded.data, fetched_at = excluded.fetched_at`,
          args: [nameKey(card.name), JSON.stringify(card), now],
        })),
        'write',
      )
      cards.push(...json.data)
    }
  }
  return { cards, notFound }
}
