import { useId } from 'react'
import { APP_NAME } from '../brand/brand'

type MarkProps = { size?: number; className?: string }

// Four-point mana spark centred on the top card (33, 23).
const SPARK = 'M33 12.5c1 7.6 2.4 9 10 10-7.6 1-9 2.4-10 10-1-7.6-2.4-9-10-10 7.6-1 9-2.4 10-10z'

/** The Topdeck mark: a card lifted off the top of a deck, carrying a mana spark. */
export function LogoMark({ size = 36, className }: MarkProps) {
  const id = useId()
  const edge = `${id}-edge`
  const spark = `${id}-spark`
  const glow = `${id}-glow`
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={`${APP_NAME} logo`}
    >
      <defs>
        <linearGradient id={edge} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--violet-400)" />
          <stop offset="1" stopColor="var(--teal-400)" />
        </linearGradient>
        <linearGradient id={spark} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--gold-200)" />
          <stop offset="1" stopColor="var(--gold-500)" />
        </linearGradient>
        <filter id={glow} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>
      {/* The deck */}
      <rect x="13" y="25" width="30" height="34" rx="5" transform="rotate(-5 28 42)" fill="var(--surface-3)" opacity="0.9" />
      <rect x="15" y="21" width="30" height="34" rx="5" transform="rotate(5 30 38)" fill={`url(#${edge})`} opacity="0.45" />
      {/* The top card, lifted off the deck */}
      <g transform="rotate(-11 33 23)">
        <rect x="18" y="4" width="30" height="38" rx="5" fill="var(--surface-2)" stroke={`url(#${edge})`} strokeWidth="2.5" />
        <path d={SPARK} fill="var(--gold-400)" filter={`url(#${glow})`} opacity="0.7" />
        <path d={SPARK} fill={`url(#${spark})`} />
      </g>
    </svg>
  )
}

/** Mark plus wordmark, used in the header. */
export function Logo({ size = 36 }: { size?: number }) {
  return (
    <span className="logo">
      <LogoMark size={size} />
      <span className="logo-word">
        Top<span className="logo-word-accent">deck</span>
      </span>
    </span>
  )
}
