import type { ReactNode } from 'react'
import { CoinIcon, PulseCardIcon } from './components/icons'

export type ToolId = 'penny-pincher' | 'deck-doctor'

export type Tool = {
  id: ToolId
  name: string
  pitch: string
  features: string[]
  accent: 'gold' | 'teal'
  icon: ReactNode
}

export const TOOLS: Tool[] = [
  {
    id: 'penny-pincher',
    name: 'Penny Pincher',
    pitch: 'Pick a commander and a max price per card. Get a complete, playable 100-card deck.',
    features: ['Per-card price cap', 'Cheaper swaps for pricey staples', 'Upgrade path by impact per dollar'],
    accent: 'gold',
    icon: <CoinIcon />,
  },
  {
    id: 'deck-doctor',
    name: 'Deck Doctor',
    pitch: 'Paste your list. Get a checkup and a short prescription of cuts and adds.',
    features: ['Curve, colors and role counts', 'Cut 5, add 5 with reasons', 'Combos you have or are one card from'],
    accent: 'teal',
    icon: <PulseCardIcon />,
  },
]
