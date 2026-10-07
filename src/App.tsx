import { useEffect, useState } from 'react'
import { Logo } from './components/Logo'
import { ArrowIcon, BackIcon } from './components/icons'
import { APP_NAME, APP_TAGLINE } from './brand/brand'
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

function Home() {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">
          <ManaPips /> Commander companion
        </p>
        <h1 className="hero-title">{APP_TAGLINE}</h1>
        <p className="hero-sub">
          Build a deck on a budget or give the one you have a checkup. Pick a tool to get started.
        </p>
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
        <div className="placeholder-status">
          <span className="status-dot" /> Under construction. This is where {tool.name} will live.
        </div>
      </div>
    </section>
  )
}
