import { useEffect, useMemo, useState } from 'react'
import { fetchCards, type Lookup } from '../lib/scryfall'
import { BackIcon, PulseCardIcon } from '../components/icons'
import { analyze, canBeCommander, ROLE_LABELS, type Checkup, type DeckCard, type Role } from './analyze'
import { parseDecklist, type Entry } from './parse'
import { deleteDeck, listDecks, saveDeck, type SavedDeck } from '../lib/decks'
import { SAMPLE_DECK } from './sample'

const STORAGE_KEY = 'topdeck.deckAnalyzer.list'

function loadDraft() {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

function saveDraft(text: string) {
  try {
    localStorage.setItem(STORAGE_KEY, text)
  } catch {
    // Storage can be unavailable (private mode); remembering the list is only a convenience.
  }
}

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'done'; entries: Entry[]; lookup: Lookup }

export function DeckAnalyzer() {
  const [text, setText] = useState(loadDraft)
  const [state, setState] = useState<State>({ status: 'idle' })
  const [commander, setCommander] = useState<string | undefined>()
  // null means saved decks aren't available (no database connected, or running without the API).
  const [decks, setDecks] = useState<SavedDeck[] | null>(null)

  useEffect(() => {
    listDecks().then(setDecks, () => setDecks(null))
  }, [])

  function load(deck: SavedDeck) {
    setText(deck.list)
    run(deck.list).then(() => setCommander(deck.commander ?? undefined))
  }

  async function remove(deck: SavedDeck) {
    await deleteDeck(deck.id).catch(() => undefined)
    setDecks((d) => d?.filter((x) => x.id !== deck.id) ?? null)
  }

  async function saveCurrent(name: string, cmd: string | null) {
    const deck = await saveDeck(name, cmd, text)
    setDecks((d) => [deck, ...(d ?? []).filter((x) => x.id !== deck.id)])
  }

  async function run(list = text) {
    const entries = parseDecklist(list)
    if (entries.length === 0) {
      setState({ status: 'error', message: 'Paste a decklist first, one card per line.' })
      return
    }
    saveDraft(list)
    setCommander(undefined)
    setState({ status: 'loading' })
    try {
      const lookup = await fetchCards(entries.filter((e) => e.section !== 'side').map((e) => e.name))
      setState({ status: 'done', entries, lookup })
    } catch {
      setState({ status: 'error', message: "Couldn't reach Scryfall to look up your cards. Try again in a moment." })
    }
  }

  const checkup = useMemo(
    () => (state.status === 'done' ? analyze(state.entries, state.lookup, commander) : null),
    [state, commander],
  )

  return (
    <section className="analyzer accent-teal">
      <a href="#/" className="back-link">
        <BackIcon /> All tools
      </a>

      <div className="analyzer-head">
        <span className="tool-icon">
          <PulseCardIcon />
        </span>
        <div>
          <h1 className="placeholder-title">Deck Analyzer</h1>
          <p className="tool-pitch">Paste a decklist to see its strengths, gaps and anything that breaks the rules.</p>
        </div>
      </div>

      {decks && decks.length > 0 && (
        <div className="saved">
          <span className="saved-label">Your decks</span>
          <ul className="chips">
            {decks.map((d) => (
              <li key={d.id} className="saved-item">
                <button className="chip" onClick={() => load(d)} disabled={state.status === 'loading'}>
                  {d.name}
                </button>
                <button className="saved-remove" onClick={() => remove(d)} aria-label={`Delete ${d.name}`}>
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="panel intake">
        <label htmlFor="decklist" className="intake-label">
          Your decklist
        </label>
        <textarea
          id="decklist"
          className="intake-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={'1 Atraxa, Praetors\' Voice *CMDR*\n1 Sol Ring\n1 Arcane Signet\n...'}
          spellCheck={false}
          rows={8}
        />
        <div className="intake-actions">
          <button className="btn btn-accent" onClick={() => run()} disabled={state.status === 'loading'}>
            {state.status === 'loading' ? 'Analyzing…' : 'Analyze deck'}
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => {
              setText(SAMPLE_DECK)
              run(SAMPLE_DECK)
            }}
            disabled={state.status === 'loading'}
          >
            Try a sample deck
          </button>
          <span className="intake-hint">Works with exports from Moxfield, Archidekt and MTG Arena.</span>
        </div>
        {state.status === 'error' && <p className="intake-error">{state.message}</p>}
      </div>

      {checkup && state.status === 'done' && (
        <Results
          checkup={checkup}
          commander={commander}
          onCommander={setCommander}
          onSave={decks ? saveCurrent : undefined}
        />
      )}
    </section>
  )
}

function Results({
  checkup,
  commander,
  onCommander,
  onSave,
}: {
  checkup: Checkup
  commander?: string
  onCommander: (name: string) => void
  onSave?: (name: string, commander: string | null) => Promise<void>
}) {
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const candidates = checkup.cards.filter((c) => canBeCommander(c.card)).map((c) => c.card.name)
  const cmd = checkup.commanders[0]

  return (
    <div className="results">
      <div className="panel summary">
        {cmd?.image && <img className="summary-art" src={cmd.image} alt={cmd.name} loading="lazy" />}
        <div className="summary-body">
          <span className="section-kicker">Analysis of</span>
          <h2 className="summary-title">{checkup.commanders.map((c) => c.name).join(' + ') || 'Your deck'}</h2>
          <div className="summary-pips">
            {checkup.colorIdentity.map((c) => (
              <span key={c} className={`pip pip-lg pip-${c.toLowerCase()}`} title={c} />
            ))}
          </div>
          {candidates.length > 1 && (
            <label className="summary-select">
              Commander
              <select value={commander ?? cmd?.name ?? ''} onChange={(e) => onCommander(e.target.value)}>
                {candidates.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
          )}
          <dl className="stats">
            <Stat label="Cards" value={`${checkup.total}`} warn={checkup.total !== 100} />
            <Stat label="Avg mana value" value={checkup.avgManaValue.toFixed(2)} />
            <Stat label="Est. price" value={`$${Math.round(checkup.priceUsd).toLocaleString()}`} />
          </dl>
          {onSave && (
            <button
              className="btn btn-ghost btn-small"
              disabled={saveState === 'saving'}
              onClick={async () => {
                setSaveState('saving')
                try {
                  const names = checkup.commanders.map((c) => c.name)
                  await onSave(names.join(' + ') || 'Untitled deck', names[0] ?? null)
                  setSaveState('saved')
                } catch {
                  setSaveState('error')
                }
              }}
            >
              {{ idle: 'Save deck', saving: 'Saving…', saved: 'Saved', error: "Couldn't save. Try again" }[saveState]}
            </button>
          )}
        </div>
      </div>

      {checkup.issues.length > 0 && (
        <div className="panel">
          <h3 className="panel-title">Needs attention</h3>
          <ul className="issues">
            {checkup.issues.map((i) => (
              <li key={i.text} className={`issue issue-${i.kind}`}>
                {i.text}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="results-grid">
        <div className="panel">
          <h3 className="panel-title">Recommendations</h3>
          <ul className="notes">
            {checkup.notes.map((n) => (
              <li key={n.title} className={`note note-${n.tone}`}>
                <span className="note-mark" aria-hidden="true" />
                <div>
                  <strong>{n.title}</strong>
                  <p>{n.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel">
          <h3 className="panel-title">Vitals</h3>
          <div className="vitals">
            {checkup.vitals.map((v) => {
              const low = v.count < v.low
              return (
                <div key={v.role} className="vital">
                  <span className="preview-label">{v.label}</span>
                  <span className="vital-bar">
                    <span
                      className="vital-band"
                      style={{ left: `${(v.low / v.max) * 100}%`, width: `${((v.high - v.low) / v.max) * 100}%` }}
                    />
                    <span
                      className={`vital-fill${low ? ' low' : ''}`}
                      style={{ width: `${Math.min(100, (v.count / v.max) * 100)}%` }}
                    />
                  </span>
                  <span className={`vital-value${low ? ' low' : ''}`}>{v.count}</span>
                </div>
              )
            })}
          </div>
          <p className="panel-foot">The bright band is the typical range for a Commander deck.</p>

          <h3 className="panel-title panel-title-spaced">Mana curve</h3>
          <Curve curve={checkup.curve} />

          {checkup.colorIdentity.length > 1 && (
            <>
              <h3 className="panel-title panel-title-spaced">Color balance</h3>
              <ColorBalance checkup={checkup} />
            </>
          )}
        </div>
      </div>

      {checkup.cuts.length > 0 && (
        <div className="panel">
          <h3 className="panel-title">Worth a second look if you need room</h3>
          <p className="panel-foot panel-foot-top">
            Your heaviest spells that don't ramp, draw or remove anything. Keep your finishers, but the rest are easy swaps.
          </p>
          <ul className="chips">
            {checkup.cuts.map((c) => (
              <li key={c.card.name}>
                <a href={c.card.scryfallUri} target="_blank" rel="noreferrer" className="chip">
                  {c.card.name} <span className="chip-mv">{c.card.manaValue}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <DeckList cards={checkup.cards} />
    </div>
  )
}

function Stat({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="stat">
      <dt>{label}</dt>
      <dd className={warn ? 'warn' : undefined}>{value}</dd>
    </div>
  )
}

function Curve({ curve }: { curve: number[] }) {
  const max = Math.max(1, ...curve)
  return (
    <div className="curve" role="img" aria-label={`Mana curve: ${curve.map((n, i) => `${n} at ${i === 7 ? '7+' : i}`).join(', ')}`}>
      {curve.map((n, i) => (
        <div key={i} className="curve-col">
          <span className="curve-n">{n || ''}</span>
          <span className="curve-bar" style={{ height: `${(n / max) * 100}%` }} />
          <span className="curve-mv">{i === 7 ? '7+' : i}</span>
        </div>
      ))}
    </div>
  )
}

function ColorBalance({ checkup }: { checkup: Checkup }) {
  const pipTotal = checkup.colorIdentity.reduce((n, c) => n + checkup.pips[c], 0) || 1
  const srcTotal = checkup.colorIdentity.reduce((n, c) => n + checkup.sources[c], 0) || 1
  return (
    <div className="balance">
      {checkup.colorIdentity.map((c) => (
        <div key={c} className="balance-row">
          <span className={`pip pip-${c.toLowerCase()}`} />
          <span className="balance-bars">
            <span className="balance-bar" style={{ width: `${(checkup.pips[c] / pipTotal) * 100}%` }} />
            <span className="balance-bar src" style={{ width: `${(checkup.sources[c] / srcTotal) * 100}%` }} />
          </span>
          <span className="balance-nums">
            {Math.round((checkup.pips[c] / pipTotal) * 100)}% / {Math.round((checkup.sources[c] / srcTotal) * 100)}%
          </span>
        </div>
      ))}
      <p className="panel-foot">Share of mana symbols in your spells vs. share of lands that make each color.</p>
    </div>
  )
}

const GROUPS: (Role | 'other')[] = ['ramp', 'draw', 'removal', 'wipe', 'other', 'land']

function DeckList({ cards }: { cards: DeckCard[] }) {
  const groups = GROUPS.map((g) => ({
    g,
    cards: cards.filter((c) =>
      g === 'other' ? c.roles.length === 0 && !c.isCommander : c.roles[0] === g && !c.isCommander,
    ),
  })).filter((x) => x.cards.length)
  return (
    <details className="panel decklist">
      <summary className="panel-title">See how we sorted your cards</summary>
      <div className="decklist-cols">
        {groups.map(({ g, cards }) => (
          <div key={g} className="decklist-group">
            <h4>
              {ROLE_LABELS[g]} <span>{cards.reduce((n, c) => n + c.qty, 0)}</span>
            </h4>
            <ul>
              {cards.map((c) => (
                <li key={c.card.name}>
                  {c.qty > 1 && <span className="qty">{c.qty}</span>}
                  <a href={c.card.scryfallUri} target="_blank" rel="noreferrer">
                    {c.card.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </details>
  )
}
