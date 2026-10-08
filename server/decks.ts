import type { Client } from '@libsql/client'

export type SavedDeck = {
  id: string
  name: string
  commander: string | null
  list: string
  updatedAt: number
}

export const LIMITS = { name: 120, list: 20_000, decksPerOwner: 100 }

// Owner ids are random per-browser UUIDs generated on the client.
export const validOwner = (owner: unknown): owner is string =>
  typeof owner === 'string' && /^[0-9a-f-]{36}$/i.test(owner)

export async function listDecks(db: Client, owner: string): Promise<SavedDeck[]> {
  const rs = await db.execute({
    sql: 'SELECT id, name, commander, list, updated_at FROM decks WHERE owner = ? ORDER BY updated_at DESC LIMIT ?',
    args: [owner, LIMITS.decksPerOwner],
  })
  return rs.rows.map((r) => ({
    id: String(r.id),
    name: String(r.name),
    commander: r.commander == null ? null : String(r.commander),
    list: String(r.list),
    updatedAt: Number(r.updated_at),
  }))
}

/** Save a deck, replacing an existing deck of the same name for this owner. */
export async function saveDeck(
  db: Client,
  owner: string,
  input: { name: string; commander: string | null; list: string },
  now = Date.now(),
): Promise<SavedDeck> {
  const name = input.name.trim().slice(0, LIMITS.name) || 'Untitled deck'
  const existing = await db.execute({ sql: 'SELECT id FROM decks WHERE owner = ? AND name = ?', args: [owner, name] })
  const id = existing.rows[0] ? String(existing.rows[0].id) : crypto.randomUUID()
  await db.execute({
    sql: `INSERT INTO decks (id, owner, name, commander, list, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT (id) DO UPDATE SET commander = excluded.commander, list = excluded.list, updated_at = excluded.updated_at`,
    args: [id, owner, name, input.commander, input.list, now, now],
  })
  return { id, name, commander: input.commander, list: input.list, updatedAt: now }
}

export async function deleteDeck(db: Client, owner: string, id: string) {
  await db.execute({ sql: 'DELETE FROM decks WHERE owner = ? AND id = ?', args: [owner, id] })
}
