import type { ReactNode } from 'react'
import { CoinIcon, PulseCardIcon } from './components/icons'

export type ToolId = 'budget-builder' | 'deck-analyzer'

export type Tool = {
  id: ToolId
  name: string
  pitch: string
  status: 'live' | 'soon'
  accent: 'gold' | 'teal'
  icon: ReactNode
}

export const TOOLS: Tool[] = [
  {
    id: 'budget-builder',
    name: 'Budget Builder',
    pitch: 'Pick a commander and a price cap. Get a full deck that fits.',
    status: 'soon',
    accent: 'gold',
    icon: <CoinIcon />,
  },
  {
    id: 'deck-analyzer',
    name: 'Deck Analyzer',
    pitch: 'Paste your list and see what it needs.',
    status: 'live',
    accent: 'teal',
    icon: <PulseCardIcon />,
  },
]
