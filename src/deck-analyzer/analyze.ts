import { nameKey, type Card, type Lookup } from '../lib/scryfall'
import type { Entry } from './parse'

export type Role = 'land' | 'ramp' | 'draw' | 'removal' | 'wipe'
export const ROLE_LABELS: Record<Role | 'other', string> = {
  land: 'Lands',
  ramp: 'Ramp',
  draw: 'Card draw',
  removal: 'Removal',
  wipe: 'Board wipes',
  other: 'Everything else',
}

export type DeckCard = { qty: number; card: Card; roles: Role[]; isCommander: boolean }

export type Vital = { role: Role; label: string; count: number; low: number; high: number; max: number }

export type Note = { tone: 'good' | 'warn' | 'tip'; title: string; body: string }

export type Issue = { kind: 'size' | 'banned' | 'color' | 'duplicate' | 'missing'; text: string }

export type Checkup = {
  commanders: Card[]
  colorIdentity: string[]
  cards: DeckCard[]
  total: number
  priceUsd: number
  avgManaValue: number
  curve: number[] // index 0..7, where 7 means 7+
  vitals: Vital[]
  pips: Record<string, number>
  sources: Record<string, number>
  issues: Issue[]
  notes: Note[]
  cuts: DeckCard[]
}

export const COLORS = ['W', 'U', 'B', 'R', 'G'] as const

const RAMP =
  /\badd \{|\badd (one|two|three|x) mana|\badd mana|search your library for [^.]*\b(land|forest|plains|island|swamp|mountain)s?\b[^.]*onto the battlefield|put (a|up to \w+) land cards? from your hand onto the battlefield|play an additional land|create (a|an|one|two|three|x) (tapped )?treasure/
const DRAW = /\bdraws? (a|an|one|two|three|four|five|x|that many|seven) (additional )?cards?|\bdraw cards equal|\bdraws? cards? equal/
const REMOVAL =
  /(destroy|exile) target (?!card)|(destroy|exile) up to (one|two|three) target (?!card)|deals? (\d+|x) damage to (any target|target creature|target permanent)|deals? damage equal to [^.]*to (any target|target creature)|return target (creature|nonland permanent|permanent)[^.]*to (its|their) owner's hand|counter target (spell|noncreature|creature)|target (player|opponent) sacrifices|fights? (target|another target|up to one target)/
const WIPE =
  /(destroy|exile) (all|each) (?!cards)|deals? (\d+|x) damage to each creature|return all (nonland )?(creatures|permanents)|all creatures get -|each player sacrifices (all|that many)/

export function isLand(card: Card) {
  return card.typeLine.split(' // ')[0].includes('Land')
}

export function rolesFor(card: Card): Role[] {
  if (isLand(card)) return ['land']
  // Reminder text in parentheses causes false hits (e.g. treasure explanations), so drop it.
  const text = card.oracleText.toLowerCase().replace(/\([^)]*\)/g, '')
  const roles: Role[] = []
  if (RAMP.test(text)) roles.push('ramp')
  if (DRAW.test(text)) roles.push('draw')
  if (WIPE.test(text)) roles.push('wipe')
  if (REMOVAL.test(text)) roles.push('removal')
  return roles
}

export function canBeCommander(card: Card) {
  return (
    (card.typeLine.includes('Legendary') && card.typeLine.includes('Creature')) ||
    /can be your commander/i.test(card.oracleText)
  )
}

function countPips(cost: string, into: Record<string, number>) {
  for (const sym of cost.match(/\{[^}]+\}/g) ?? []) {
    for (const c of COLORS) if (sym.includes(c)) into[c] += 1
  }
}

const empty = () => Object.fromEntries(COLORS.map((c) => [c, 0])) as Record<string, number>

/** Build the checkup. `commanderOverride` picks the commander when the list doesn't mark one. */
export function analyze(entries: Entry[], lookup: Lookup, commanderOverride?: string): Checkup {
  const issues: Issue[] = []
  const cards: DeckCard[] = []
  const missing = new Set(lookup.notFound.map(nameKey))

  const deckEntries = entries.filter((e) => e.section !== 'side')
  for (const e of deckEntries) {
    const card = lookup.cards.get(nameKey(e.name))
    if (!card) {
      missing.add(nameKey(e.name))
      continue
    }
    cards.push({ qty: e.qty, card, roles: rolesFor(card), isCommander: e.section === 'commander' })
  }

  if (commanderOverride) {
    for (const dc of cards) dc.isCommander = nameKey(dc.card.name) === nameKey(commanderOverride)
  } else if (!cards.some((c) => c.isCommander)) {
    const guess = cards.find((c) => c.qty === 1 && canBeCommander(c.card))
    if (guess) guess.isCommander = true
  }

  const commanders = cards.filter((c) => c.isCommander).map((c) => c.card)
  const colorIdentity = COLORS.filter((c) => commanders.some((cmd) => cmd.colorIdentity.includes(c)))
  const total = cards.reduce((n, c) => n + c.qty, 0) + missing.size

  if (total !== 100) {
    issues.push({
      kind: 'size',
      text: `The deck has ${total} cards. Commander decks are exactly 100, including the commander.`,
    })
  }
  for (const name of missing) {
    const original = deckEntries.find((e) => nameKey(e.name) === name)?.name ?? name
    issues.push({ kind: 'missing', text: `Couldn't find "${original}". Check the spelling?` })
  }
  for (const { card, qty } of cards) {
    if (card.commanderLegality === 'banned') {
      issues.push({ kind: 'banned', text: `${card.name} is banned in Commander.` })
    } else if (card.commanderLegality === 'not_legal') {
      issues.push({ kind: 'banned', text: `${card.name} isn't legal in Commander.` })
    }
    if (commanders.length && card.colorIdentity.some((c) => !colorIdentity.includes(c as (typeof COLORS)[number]))) {
      issues.push({
        kind: 'color',
        text: `${card.name} is outside your commander's colors (${card.colorIdentity.join('')}).`,
      })
    }
    const anyNumber = /a deck can have any number of cards named/i.test(card.oracleText)
    if (qty > 1 && !card.typeLine.includes('Basic') && !anyNumber) {
      issues.push({ kind: 'duplicate', text: `${qty} copies of ${card.name}. Commander allows one of each card.` })
    }
  }

  const spells = cards.filter((c) => !isLand(c.card))
  const spellCount = spells.reduce((n, c) => n + c.qty, 0)
  const curve = Array(8).fill(0)
  let mvSum = 0
  const pips = empty()
  for (const { card, qty } of spells) {
    curve[Math.min(7, Math.floor(card.manaValue))] += qty
    mvSum += card.manaValue * qty
    countPips(card.manaCost, pips)
  }
  const avgManaValue = spellCount ? mvSum / spellCount : 0

  const sources = empty()
  for (const { card, qty } of cards.filter((c) => isLand(c.card))) {
    for (const c of COLORS) if (card.producedMana.includes(c) && colorIdentity.includes(c)) sources[c] += qty
  }

  const count = (role: Role) => cards.filter((c) => c.roles.includes(role)).reduce((n, c) => n + c.qty, 0)
  const vitals: Vital[] = [
    { role: 'land', label: ROLE_LABELS.land, count: count('land'), low: 35, high: 38, max: 45 },
    { role: 'ramp', label: ROLE_LABELS.ramp, count: count('ramp'), low: 10, high: 14, max: 20 },
    { role: 'draw', label: ROLE_LABELS.draw, count: count('draw'), low: 10, high: 14, max: 20 },
    { role: 'removal', label: ROLE_LABELS.removal, count: count('removal'), low: 8, high: 12, max: 20 },
    { role: 'wipe', label: ROLE_LABELS.wipe, count: count('wipe'), low: 2, high: 4, max: 8 },
  ]

  const notes = buildNotes(vitals, avgManaValue, curve)
  const priceUsd = cards.reduce((n, c) => n + (c.card.priceUsd ?? 0) * c.qty, 0)

  // Easiest cuts: expensive-to-cast cards that don't fill any of the basic jobs.
  const cuts = spells
    .filter((c) => !c.isCommander && c.roles.length === 0)
    .sort((a, b) => b.card.manaValue - a.card.manaValue)
    .slice(0, 5)

  return { commanders, colorIdentity, cards, total, priceUsd, avgManaValue, curve, vitals, pips, sources, issues, notes, cuts }
}

function buildNotes(vitals: Vital[], avg: number, curve: number[]): Note[] {
  const v = Object.fromEntries(vitals.map((x) => [x.role, x])) as Record<Role, Vital>
  const notes: Note[] = []
  const lands = v.land.count
  const wantLands = avg >= 3.5 ? 37 : avg <= 2.6 ? 34 : 36
  if (lands < wantLands - 1) {
    notes.push({
      tone: 'warn',
      title: `Add ${wantLands - lands} more land${wantLands - lands === 1 ? '' : 's'}`,
      body: `With an average mana value of ${avg.toFixed(2)}, about ${wantLands} lands keeps you hitting your drops.`,
    })
  } else if (lands > wantLands + 3) {
    notes.push({
      tone: 'tip',
      title: 'You could trim a land or two',
      body: `${lands} lands is on the heavy side for a ${avg.toFixed(2)} average. Swapping a couple for ramp or draw keeps late draws live.`,
    })
  } else {
    notes.push({ tone: 'good', title: 'Land count looks healthy', body: `${lands} lands fits this curve nicely.` })
  }

  const jobs: [Role, string, string][] = [
    ['ramp', 'ramp', 'Mana rocks, land searches and dorks get your big plays out a turn or two early.'],
    ['draw', 'card draw', 'Steady draw keeps your hand full in the long games Commander tends to have.'],
    ['removal', 'removal', 'Answers for the scariest thing at the table keep you alive long enough to win.'],
  ]
  for (const [role, word, why] of jobs) {
    const x = v[role]
    if (x.count >= x.low) notes.push({ tone: 'good', title: `Plenty of ${word}`, body: `${x.count} pieces. Nice.` })
    else
      notes.push({
        tone: x.count >= x.low - 2 ? 'tip' : 'warn',
        title: `Add ${x.low - x.count} more ${word}`,
        body: `You have ${x.count}; most decks want ${x.low} or more. ${why}`,
      })
  }

  if (v.wipe.count === 0) {
    notes.push({
      tone: 'tip',
      title: 'Consider a board wipe or two',
      body: 'One reset button helps when someone else pulls far ahead.',
    })
  }

  const top = curve[6] + curve[7]
  if (avg > 3.6 || top > 12) {
    notes.push({
      tone: 'warn',
      title: 'The curve is top-heavy',
      body: `${top} cards cost 6 or more. Swapping a few for cheaper plays makes early turns smoother.`,
    })
  }
  return notes
}
