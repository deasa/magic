// Client for /api/decks. Decks belong to an anonymous id kept in this browser until accounts exist.

export type SavedDeck = { id: string; name: string; commander: string | null; list: string; updatedAt: number }

const OWNER_KEY = 'topdeck.ownerId'
let sessionOwner: string | null = null

function ownerId(): string {
  try {
    let id = localStorage.getItem(OWNER_KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(OWNER_KEY, id)
    }
    return id
  } catch {
    // No storage (private mode): keep an id for this visit only.
    sessionOwner ??= crypto.randomUUID()
    return sessionOwner
  }
}

async function call<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init)
  if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
    throw new Error(`Saved decks unavailable (${res.status})`)
  }
  return res.json() as Promise<T>
}

export async function listDecks(): Promise<SavedDeck[]> {
  const { decks } = await call<{ decks: SavedDeck[] }>(`/api/decks?owner=${ownerId()}`)
  return decks
}

export async function saveDeck(name: string, commander: string | null, list: string): Promise<SavedDeck> {
  const { deck } = await call<{ deck: SavedDeck }>('/api/decks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ owner: ownerId(), name, commander, list }),
  })
  return deck
}

export async function deleteDeck(id: string): Promise<void> {
  await call(`/api/decks?owner=${ownerId()}&id=${encodeURIComponent(id)}`, { method: 'DELETE' })
}
