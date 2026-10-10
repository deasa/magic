import { getDb } from '../server/db.js'
import { lookupCards, MAX_NAMES } from '../server/cards.js'
import { error, json } from '../server/http.js'

// POST { names: string[] } -> { cards, notFound }. Cards are raw Scryfall objects.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { names?: unknown } | null
  const names = body?.names
  if (!Array.isArray(names) || !names.every((n) => typeof n === 'string')) {
    return error(400, 'Send { "names": [...] } with card names as strings.')
  }
  if (names.length > MAX_NAMES) return error(400, `At most ${MAX_NAMES} names per request.`)
  try {
    return json(await lookupCards(await getDb(), names))
  } catch (e) {
    console.error(e)
    return error(502, 'Card lookup failed. Try again in a moment.')
  }
}
