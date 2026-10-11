import { useEffect, useState } from 'react'
import { Logo } from './components/Logo'
import { ArrowIcon, BackIcon } from './components/icons'
import { APP_NAME } from './brand/brand'
import { ManaWheel } from './components/ManaWheel'
import { BudgetPreview } from './components/Previews'
import { DeckAnalyzer } from './deck-analyzer/DeckAnalyzer'
import { TOOLS, type Tool, type ToolId } from './tools'

// Hash routing is enough for a handful of screens.
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

      <main className="main">
        {route === 'deck-analyzer' ? <DeckAnalyzer /> : tool ? <ToolPlaceholder tool={tool} /> : <Home />}
      </main>

      <footer className="footer">
        <span>
          {APP_NAME} is unofficial Fan Content permitted under the Wizards of the Coast Fan Content Policy. Not
          approved or endorsed by Wizards.
        </span>
      </footer>
    </div>
  )
}

function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <h1 className="hero-title">
            Pull up a chair.
            <br />
            <span className="hero-title-accent">Let's talk decks.</span>
          </h1>
          <p className="hero-sub">Make the deck you love a little better, or a whole lot cheaper.</p>
        </div>
        <ManaWheel />
      </section>

      <section className="tools" aria-label="Tools">
        {TOOLS.map((t, i) => (
          <ToolCard key={t.id} tool={t} index={i} />
        ))}
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
        {tool.status === 'soon' && <span className="badge">Coming soon</span>}
      </div>
      <h2 className="tool-name">{tool.name}</h2>
      <p className="tool-pitch">{tool.pitch}</p>
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
        <BudgetPreview />
        <div className="placeholder-status">
          <span className="status-dot" /> Under construction. This is where {tool.name} will live.
        </div>
      </div>
    </section>
  )
}
