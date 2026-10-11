import { afterAll, describe, expect, it, vi } from 'vitest'

process.env.TURSO_DATABASE_URL = ':memory:'
const { POST: cards } = await import('../api/cards.js')
const decks = await import('../api/decks.js')

const owner = '00000000-0000-4000-8000-000000000001'
const post = (url: string, body: unknown) =>
  new Request(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

afterAll(() => vi.unstubAllGlobals())

describe('api handlers', () => {
  it('POST /api/cards looks cards up through Scryfall', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ data: [{ name: 'Sol Ring' }], not_found: [] })))
    const res = await cards(post('http://x/api/cards', { names: ['Sol Ring'] }))
    expect(res.status).toBe(200)
    expect((await res.json()).cards[0].name).toBe('Sol Ring')
  })

  it('POST /api/cards rejects a bad body', async () => {
    expect((await cards(post('http://x/api/cards', { names: 'Sol Ring' }))).status).toBe(400)
  })

  it('saves and lists decks', async () => {
    const saved = await decks.POST(post('http://x/api/decks', { owner, name: 'Elves', commander: null, list: '1 Forest' }))
    expect(saved.status).toBe(200)
    const listed = await (await decks.GET(new Request(`http://x/api/decks?owner=${owner}`))).json()
    expect(listed.decks.map((d: { name: string }) => d.name)).toEqual(['Elves'])
    expect((await decks.GET(new Request('http://x/api/decks?owner=nope'))).status).toBe(400)
  })
})
