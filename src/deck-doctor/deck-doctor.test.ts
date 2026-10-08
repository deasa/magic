import { describe, expect, it } from 'vitest'
import { parseDecklist } from './parse'
import { analyze, rolesFor } from './analyze'
import { nameKey, toCard, type Lookup, type RawCard } from '../lib/scryfall'
import { SAMPLE_DECK } from './sample'
import sampleCards from './__fixtures__/sample-cards.json'

const lookup: Lookup = {
  cards: new Map((sampleCards as RawCard[]).map((r) => [nameKey(r.name), toCard(r)])),
  notFound: [],
}
const card = (name: string) => lookup.cards.get(nameKey(name))!

describe('parseDecklist', () => {
  it('handles common export formats', () => {
    const entries = parseDecklist(`Commander
1 Ezuri, Renegade Leader (CMM) 286 *F*

Deck
1x Sol Ring
Llanowar Elves
2 Forest
3 Forest [Lands]
SB: 1 Krosan Grip
// Sideboard
1 Overrun`)
    expect(entries).toEqual([
      { qty: 1, name: 'Ezuri, Renegade Leader', section: 'commander' },
      { qty: 1, name: 'Sol Ring', section: 'main' },
      { qty: 1, name: 'Llanowar Elves', section: 'main' },
      { qty: 5, name: 'Forest', section: 'main' },
      { qty: 1, name: 'Krosan Grip', section: 'side' },
      { qty: 1, name: 'Overrun', section: 'side' },
    ])
  })

  it('reads the *CMDR* marker', () => {
    expect(parseDecklist('1 Ezuri, Renegade Leader *CMDR*')[0].section).toBe('commander')
  })
})

describe('rolesFor', () => {
  it.each([
    ['Sol Ring', ['ramp']],
    ['Cultivate', ['ramp']],
    ['Harmonize', ['draw']],
    ['Beast Within', ['removal']],
    ['Primal Might', ['removal']],
    ['Ram Through', ['removal']],
    ['Krosan Grip', ['removal']],
    ['Overrun', []],
    ['Forest', ['land']],
    ['Sylvan Ranger', []],
  ])('%s -> %j', (name, roles) => {
    expect(rolesFor(card(name))).toEqual(roles)
  })
})

describe('analyze', () => {
  const checkup = analyze(parseDecklist(SAMPLE_DECK), lookup)

  it('finds the commander and its colors', () => {
    expect(checkup.commanders.map((c) => c.name)).toEqual(['Ezuri, Renegade Leader'])
    expect(checkup.colorIdentity).toEqual(['G'])
  })

  it('flags the size and off-color cards', () => {
    expect(checkup.total).toBe(99)
    const kinds = checkup.issues.map((i) => i.kind)
    expect(kinds).toContain('size')
    expect(checkup.issues.filter((i) => i.kind === 'color').map((i) => i.text)).toEqual([
      expect.stringContaining('Eyeblight Assassin'),
      expect.stringContaining('Rhythm of the Wild'),
      expect.stringContaining('Tyvar Kell'),
    ])
  })

  it('counts lands and asks for more removal', () => {
    expect(checkup.vitals.find((v) => v.role === 'land')!.count).toBe(34)
    expect(checkup.notes.some((n) => n.title.startsWith('Add') && n.title.endsWith('removal'))).toBe(true)
  })

  it('guesses the commander when the list has no sections', () => {
    const flat = analyze(parseDecklist('1 Sol Ring\n1 Ezuri, Renegade Leader\n1 Forest'), lookup)
    expect(flat.commanders[0].name).toBe('Ezuri, Renegade Leader')
  })

  it('flags duplicates but not basics', () => {
    const dup = analyze(parseDecklist('1 Ezuri, Renegade Leader *CMDR*\n2 Sol Ring\n20 Forest'), lookup)
    expect(dup.issues.filter((i) => i.kind === 'duplicate').map((i) => i.text)).toEqual([
      expect.stringContaining('Sol Ring'),
    ])
  })
})
