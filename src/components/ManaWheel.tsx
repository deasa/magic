import { LogoMark } from './Logo'

// Hand-drawn glyphs centred on (0, 0), roughly 30 units across.
const GLYPHS: Record<string, React.ReactNode> = {
  w: (
    <g>
      <circle r="7" />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x="-1.6" y="-15" width="3.2" height="5.5" rx="1.6" transform={`rotate(${i * 45})`} />
      ))}
    </g>
  ),
  u: <path d="M0-14C5 -6 9-1 9 4.5a9 9 0 0 1-18 0C-9-1-5-6 0-14z" />,
  b: (
    <path
      fillRule="evenodd"
      d="M0-13c-7.5 0-12 5-12 11 0 3.6 1.7 6.3 4 7.8V10h3.2V7.2h2.4V10h4.8V7.2h2.4V10H8V5.8c2.3-1.5 4-4.2 4-7.8 0-6-4.5-11-12-11zM-5.2-3.5a3 3 0 1 1 0 .01zM5.2-3.5a3 3 0 1 1 0 .01z"
    />
  ),
  r: <path d="M1-14c1 5 8 8 8 15.5A9 9 0 0 1-9 1.5C-9-3-6-5-5-8c1 3 3 4 4 4-1-4 0-7 2-10z" />,
  g: (
    <g>
      <path d="M0-14 9-1H4.5L11 8H-11l6.5-9H-9z" />
      <rect x="-1.8" y="8" width="3.6" height="6" rx="1" />
    </g>
  ),
}

const COLORS = ['w', 'u', 'b', 'r', 'g'] as const
const R = 132
const C = 200
const pos = COLORS.map((_, i) => {
  const a = ((-90 + i * 72) * Math.PI) / 180
  return { x: C + R * Math.cos(a), y: C + R * Math.sin(a) }
})

/** Decorative WUBRG wheel: the five colors in a circle around the Topdeck mark. */
export function ManaWheel() {
  const pentagon = pos.map((p) => `${p.x},${p.y}`).join(' ')
  const star = [0, 2, 4, 1, 3].map((i) => `${pos[i].x},${pos[i].y}`).join(' ')
  return (
    <div className="wheel" aria-hidden="true">
      <svg viewBox="0 0 400 400" className="wheel-svg">
        <defs>
          <radialGradient id="wheel-core" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="var(--violet-500)" stopOpacity="0.55" />
            <stop offset="1" stopColor="var(--violet-500)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="wheel-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--violet-400)" />
            <stop offset="0.5" stopColor="var(--teal-400)" />
            <stop offset="1" stopColor="var(--gold-400)" />
          </linearGradient>
          {COLORS.map((c) => (
            <radialGradient key={c} id={`orb-${c}`} cx="35%" cy="30%" r="75%">
              <stop offset="0" stopColor={`var(--mana-${c})`} stopOpacity="0.55" />
              <stop offset="0.6" stopColor="var(--surface-2)" />
              <stop offset="1" stopColor="var(--bg)" />
            </radialGradient>
          ))}
        </defs>

        <circle cx={C} cy={C} r="120" fill="url(#wheel-core)" />
        <g className="wheel-spin">
          <circle cx={C} cy={C} r="182" fill="none" stroke="url(#wheel-ring)" strokeWidth="1.2" strokeDasharray="2 10" strokeLinecap="round" opacity="0.8" />
        </g>
        <g className="wheel-spin-rev">
          <circle cx={C} cy={C} r="166" fill="none" stroke="url(#wheel-ring)" strokeWidth="1" strokeDasharray="60 24 4 24" opacity="0.35" />
        </g>
        <circle cx={C} cy={C} r={R} fill="none" stroke="var(--border-strong)" strokeWidth="1" />

        <polygon points={pentagon} fill="none" stroke="var(--border-strong)" strokeWidth="1" />
        <polygon points={star} fill="none" stroke="url(#wheel-ring)" strokeWidth="1" opacity="0.35" />

        <circle cx={C} cy={C} r="54" fill="var(--surface-1)" stroke="url(#wheel-ring)" strokeWidth="1.5" />

        {COLORS.map((c, i) => (
          <g key={c} className={`orb orb-${c}`} transform={`translate(${pos[i].x} ${pos[i].y})`} style={{ animationDelay: `${i * 0.5}s` }}>
            <circle r="40" fill={`var(--mana-${c})`} opacity="0.12" className="orb-halo" />
            <circle r="31" fill={`url(#orb-${c})`} stroke={`var(--mana-${c})`} strokeWidth="1.5" />
            <g fill={`var(--mana-${c})`}>{GLYPHS[c]}</g>
          </g>
        ))}
      </svg>
      <div className="wheel-center">
        <LogoMark size={64} />
      </div>
    </div>
  )
}
