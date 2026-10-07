import { useId } from 'react'
import { APP_NAME } from '../brand/brand'

type MarkProps = { size?: number; className?: string }

/** The Deckmate mark: two fanned cards with a mana spark on the front card. */
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
      <rect
        x="21" y="9" width="27" height="38" rx="5"
        transform="rotate(13 34.5 28)"
        fill={`url(#${edge})`}
        opacity="0.5"
      />
      <rect
        x="15" y="15" width="27" height="38" rx="5"
        transform="rotate(-9 28.5 34)"
        fill="var(--surface-2)"
        stroke={`url(#${edge})`}
        strokeWidth="2.5"
      />
      <g transform="rotate(-9 28.5 32.5)">
        <path
          d="M28.5 23c.9 7.2 2.3 8.6 9.5 9.5-7.2.9-8.6 2.3-9.5 9.5-.9-7.2-2.3-8.6-9.5-9.5 7.2-.9 8.6-2.3 9.5-9.5z"
          fill="var(--gold-400)"
          filter={`url(#${glow})`}
          opacity="0.7"
        />
        <path
          d="M28.5 23c.9 7.2 2.3 8.6 9.5 9.5-7.2.9-8.6 2.3-9.5 9.5-.9-7.2-2.3-8.6-9.5-9.5 7.2-.9 8.6-2.3 9.5-9.5z"
          fill={`url(#${spark})`}
        />
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
        Deck<span className="logo-word-accent">mate</span>
      </span>
    </span>
  )
}
