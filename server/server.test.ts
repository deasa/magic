import { createClient } from '@libsql/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { applySchema } from './db.js'
import { lookupCards } from './cards.js'
import { deleteDeck, listDecks, saveDeck } from './decks.js'
import type { RawCard } from '../src/lib/scryfall.js'

const solRing: RawCard = { name: 'Sol Ring', cmc: 1, type_line: 'Artifact', oracle_text: '{T}: Add {C}{C}.' }
const owner = '00000000-0000-4000-8000-000000000001'

let db: ReturnType<typeof createClient>
beforeEach(async () => {
  db = createClient({ url: ':memory:' })
  await applySchema(db)
})

function scryfall(data: RawCard[], notFound: string[] = []) {
  return vi.fn(async () => Response.json({ data, not_found: notFound.map((name) => ({ name })) }))
}

describe('lookupCards', () => {
  it('fetches from Scryfall, then serves repeats from the cache', async () => {
    const fetchImpl = scryfall([solRing], ['Not A Card'])
    const first = await lookupCards(db, ['Sol Ring', 'Not A Card'], fetchImpl, 1000)
    expect(first.cards.map((c) => c.name)).toEqual(['Sol Ring'])
    expect(first.notFound).toEqual(['Not A Card'])

    const again = scryfall([])
    const second = await lookupCards(db, ['sol ring'], again, 2000)
    expect(second.cards.map((c) => c.name)).toEqual(['Sol Ring'])
    expect(again).not.toHaveBeenCalled()
  })

  it('refetches cards older than a day', async () => {
    await lookupCards(db, ['Sol Ring'], scryfall([solRing]), 0)
    const later = scryfall([solRing])
    await lookupCards(db, ['Sol Ring'], later, 25 * 60 * 60 * 1000)
    expect(later).toHaveBeenCalledOnce()
  })

  it('sends the headers Scryfall requires', async () => {
    const fetchImpl = scryfall([solRing])
    await lookupCards(db, ['Sol Ring'], fetchImpl)
    const init = (fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1]
    expect(init.headers).toMatchObject({ Accept: 'application/json', 'User-Agent': expect.stringContaining('Topdeck') })
  })
})

describe('decks', () => {
  it('saves, replaces by name, lists newest first and deletes', async () => {
    await saveDeck(db, owner, { name: 'Elves', commander: 'Ezuri, Renegade Leader', list: 'a' }, 1)
    await saveDeck(db, owner, { name: 'Tokens', commander: null, list: 'b' }, 2)
    const replaced = await saveDeck(db, owner, { name: 'Elves', commander: 'Ezuri, Renegade Leader', list: 'c' }, 3)

    const decks = await listDecks(db, owner)
    expect(decks.map((d) => [d.name, d.list])).toEqual([
      ['Elves', 'c'],
      ['Tokens', 'b'],
    ])
    expect(await listDecks(db, '00000000-0000-4000-8000-000000000002')).toEqual([])

    await deleteDeck(db, owner, replaced.id)
    expect((await listDecks(db, owner)).map((d) => d.name)).toEqual(['Tokens'])
  })
})
