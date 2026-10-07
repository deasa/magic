type IconProps = { size?: number }

/** Penny Pincher: a coin with a price-tag notch. */
export function CoinIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="16" r="8" stroke="currentColor" strokeWidth="1.25" opacity="0.5" />
      <path
        d="M18.6 12.6c-.6-.8-1.6-1.2-2.7-1.2-1.6 0-2.7.8-2.7 2 0 2.8 5.7 1.4 5.7 4.3 0 1.2-1.2 2.1-2.9 2.1-1.2 0-2.3-.5-2.9-1.4M16 10v1.4M16 20.2v1.6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Deck Doctor: a card with a heartbeat line across it. */
export function PulseCardIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="7" y="4" width="18" height="24" rx="3" stroke="currentColor" strokeWidth="2" />
      <path
        d="M3 17h7l2-4 3.5 8 3-11 2.5 7H29"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ArrowIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 10h11M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function BackIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M16 10H5M9 5l-5 5 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
