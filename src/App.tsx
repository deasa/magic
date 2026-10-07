import { useEffect, useState } from 'react'
import { Logo } from './components/Logo'
import { ArrowIcon, BackIcon } from './components/icons'
import { APP_NAME } from './brand/brand'
import { HeroHand } from './components/HeroHand'
import { PennyPreview, DoctorPreview } from './components/Previews'
import { TOOLS, type Tool, type ToolId } from './tools'

// Hash routing is enough until the tools have real screens.
function useRoute(): ToolId | null {
  const read = () => {
    const id = window.location.hash.replace('#/', '')
    return TOOLS.some((t) => t.id === id) ? (id as ToolId) : null
  }
  const [route, setRoute] = useState(read)
  useEffect(() => {
    const onHash = () => {
      setRoute(read())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return route
}

export default function App() {
  const route = useRoute()
  const tool = TOOLS.find((t) => t.id === route)

  return (
    <div className="shell">
      <div className="aurora" aria-hidden="true" />
      <div className="dot-grid" aria-hidden="true" />
      <header className="topbar">
        <a href="#/" className="topbar-home" aria-label={`${APP_NAME} home`}>
          <Logo />
        </a>
        <nav className="topbar-nav" aria-label="Tools">
          {TOOLS.map((t) => (
            <a key={t.id} href={`#/${t.id}`} className="topbar-link" aria-current={t.id === route ? 'page' : undefined}>
              {t.name}
            </a>
          ))}
        </nav>
      </header>

      <main className="main">{tool ? <ToolPlaceholder tool={tool} /> : <Home />}</main>

      <footer className="footer">
        <span>
          {APP_NAME} is unofficial Fan Content permitted under the Wizards of the Coast Fan Content Policy. Not
          approved or endorsed by Wizards.
        </span>
      </footer>
    </div>
  )
}

function ManaPips() {
  return (
    <span className="pips" aria-hidden="true">
      {['w', 'u', 'b', 'r', 'g'].map((c) => (
        <span key={c} className={`pip pip-${c}`} />
      ))}
    </span>
  )
}

const ROLES = ['Ramp', 'Card draw', 'Removal', 'Board wipes', 'Synergy', 'Lands', 'Combos', 'Mana curve', 'Color fixing', 'Win cons']

const STEPS = [
  { n: '01', title: 'Pick a commander', body: 'Start from any legal commander, or paste a list you already play.' },
  { n: '02', title: 'Set your rules', body: 'A max price per card, a total budget, a theme, a power level.' },
  { n: '03', title: 'Get your 99', body: 'A full list or a short prescription, with a reason for every card.' },
]

function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <ManaPips /> Commander tools
          </p>
          <h1 className="hero-title">
            Brew smarter.
            <br />
            <span className="hero-title-accent">Spend less.</span>
          </h1>
          <p className="hero-sub">
            Build a full Commander deck on any budget, or give the one you already play a checkup.
          </p>
          <div className="hero-actions">
            <a href="#/penny-pincher" className="btn btn-primary">
              Build on a budget <ArrowIcon />
            </a>
            <a href="#/deck-doctor" className="btn btn-ghost">
              Check my deck
            </a>
          </div>
        </div>
        <HeroHand />
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...ROLES, ...ROLES].map((r, i) => (
            <span key={i} className="marquee-item">
              <span className="marquee-diamond" /> {r}
            </span>
          ))}
        </div>
      </div>

      <section className="section" aria-labelledby="tools-heading">
        <div className="section-head">
          <p className="section-kicker">The toolkit</p>
          <h2 id="tools-heading" className="section-title">Two tools to start</h2>
        </div>
        <div className="tools">
          {TOOLS.map((t, i) => (
            <ToolCard key={t.id} tool={t} index={i} />
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="steps-heading">
        <div className="section-head">
          <p className="section-kicker">How it works</p>
          <h2 id="steps-heading" className="section-title">From idea to decklist in three moves</h2>
        </div>
        <ol className="steps">
          {STEPS.map((s) => (
            <li key={s.n} className="step">
              <span className="step-n">{s.n}</span>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-body">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  )
}

function ToolCard({ tool, index }: { tool: Tool; index: number }) {
  return (
    <a href={`#/${tool.id}`} className={`tool-card accent-${tool.accent}`} style={{ animationDelay: `${index * 90}ms` }}>
      <div className="tool-card-glow" aria-hidden="true" />
      <div className="tool-card-head">
        <span className="tool-icon">{tool.icon}</span>
        <span className="badge">Coming soon</span>
      </div>
      <h2 className="tool-name">{tool.name}</h2>
      <p className="tool-pitch">{tool.pitch}</p>
      <ul className="tool-features">
        {tool.features.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      <span className="tool-cta">
        Open {tool.name} <ArrowIcon />
      </span>
    </a>
  )
}

function ToolPlaceholder({ tool }: { tool: Tool }) {
  return (
    <section className={`placeholder accent-${tool.accent}`}>
      <a href="#/" className="back-link">
        <BackIcon /> All tools
      </a>
      <div className="placeholder-panel">
        <span className="tool-icon tool-icon-lg">{tool.icon}</span>
        <h1 className="placeholder-title">{tool.name}</h1>
        <p className="tool-pitch">{tool.pitch}</p>
        {tool.id === 'penny-pincher' ? <PennyPreview /> : <DoctorPreview />}
        <div className="placeholder-status">
          <span className="status-dot" /> Under construction. This is where {tool.name} will live.
        </div>
      </div>
    </section>
  )
}
