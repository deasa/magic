import { getDb } from '../server/db.js'
import { deleteDeck, LIMITS, listDecks, saveDeck, validOwner } from '../server/decks.js'
import { error, json } from '../server/http.js'

// GET ?owner=<id> lists decks; POST { owner, name, commander, list } saves; DELETE ?owner=&id= removes.
export async function GET(request: Request) {
  const owner = new URL(request.url).searchParams.get('owner')
  if (!validOwner(owner)) return error(400, 'Missing or invalid owner.')
  return json({ decks: await listDecks(await getDb(), owner) })
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (!body || !validOwner(body.owner)) return error(400, 'Missing or invalid owner.')
  const { name, commander, list } = body
  if (typeof name !== 'string' || typeof list !== 'string' || (commander != null && typeof commander !== 'string')) {
    return error(400, 'Send name and list as strings.')
  }
  if (list.length > LIMITS.list) return error(413, 'That decklist is too long to save.')
  const db = await getDb()
  const deck = await saveDeck(db, body.owner, { name, commander: (commander as string | null) ?? null, list })
  return json({ deck })
}

export async function DELETE(request: Request) {
  const params = new URL(request.url).searchParams
  const owner = params.get('owner')
  const id = params.get('id')
  if (!validOwner(owner) || !id) return error(400, 'Missing owner or id.')
  await deleteDeck(await getDb(), owner, id)
  return json({ ok: true })
}
