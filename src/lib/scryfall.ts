// Minimal Scryfall client: just the fields the tools need.
// Docs: https://scryfall.com/docs/api/cards/collection

export type Card = {
  name: string
  manaCost: string
  manaValue: number
  typeLine: string
  oracleText: string
  colorIdentity: string[]
  producedMana: string[]
  commanderLegality: string
  priceUsd: number | null
  image: string | null
  scryfallUri: string
}

type RawFace = { mana_cost?: string; type_line?: string; oracle_text?: string; image_uris?: { normal?: string } }

export type RawCard = RawFace & {
  name: string
  cmc?: number
  color_identity?: string[]
  produced_mana?: string[]
  legalities?: { commander?: string }
  prices?: { usd?: string | null; usd_foil?: string | null }
  card_faces?: RawFace[]
  scryfall_uri?: string
}

export function toCard(raw: RawCard): Card {
  const faces = raw.card_faces ?? []
  const front = faces[0] ?? {}
  const usd = raw.prices?.usd ?? raw.prices?.usd_foil
  return {
    name: raw.name,
    manaCost: raw.mana_cost ?? front.mana_cost ?? '',
    manaValue: raw.cmc ?? 0,
    typeLine: raw.type_line ?? front.type_line ?? '',
    // Double-faced and split cards keep their rules text on the faces.
    oracleText: raw.oracle_text ?? faces.map((f) => f.oracle_text ?? '').join('\n'),
    colorIdentity: raw.color_identity ?? [],
    producedMana: raw.produced_mana ?? [],
    commanderLegality: raw.legalities?.commander ?? 'legal',
    priceUsd: usd ? Number(usd) : null,
    image: raw.image_uris?.normal ?? front.image_uris?.normal ?? null,
    scryfallUri: raw.scryfall_uri ?? `https://scryfall.com/search?q=${encodeURIComponent(`!"${raw.name}"`)}`,
  }
}

const BATCH = 75 // Scryfall's limit per collection request
const DELAY_MS = 100 // Scryfall asks for 50-100ms between requests

export type Lookup = { cards: Map<string, Card>; notFound: string[] }

export const nameKey = (name: string) => name.toLowerCase().split(' // ')[0].trim()

/**
 * Look up card names. Goes through the app's /api/cards function (which caches in Turso) and
 * falls back to calling Scryfall directly when that isn't available, e.g. under plain `vite dev`.
 * Keys in the result map are lowercased front-face names.
 */
export async function fetchCards(names: string[], fetchImpl: typeof fetch = fetch): Promise<Lookup> {
  const unique = [...new Set(names)]
  try {
    const res = await fetchImpl('/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ names: unique }),
    })
    if (res.ok) {
      const json = (await res.json()) as { cards: RawCard[]; notFound: string[] }
      return { cards: new Map(json.cards.map((r) => [nameKey(r.name), toCard(r)])), notFound: json.notFound }
    }
  } catch {
    // Fall through to Scryfall.
  }
  return fetchFromScryfall(unique, fetchImpl)
}

async function fetchFromScryfall(unique: string[], fetchImpl: typeof fetch): Promise<Lookup> {
  const cards = new Map<string, Card>()
  const notFound: string[] = []
  for (let i = 0; i < unique.length; i += BATCH) {
    if (i > 0) await new Promise((r) => setTimeout(r, DELAY_MS))
    const batch = unique.slice(i, i + BATCH)
    const res = await fetchImpl('https://api.scryfall.com/cards/collection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ identifiers: batch.map((name) => ({ name })) }),
    })
    if (!res.ok) throw new Error(`Scryfall returned ${res.status}`)
    const json = (await res.json()) as { data: RawCard[]; not_found?: { name: string }[] }
    for (const raw of json.data) {
      const card = toCard(raw)
      cards.set(nameKey(card.name), card)
    }
    for (const nf of json.not_found ?? []) notFound.push(nf.name)
  }
  return { cards, notFound }
}
