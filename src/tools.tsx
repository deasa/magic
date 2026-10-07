import type { ReactNode } from 'react'
import { CoinIcon, PulseCardIcon } from './components/icons'

export type ToolId = 'penny-pincher' | 'deck-doctor'

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
    id: 'penny-pincher',
    name: 'Penny Pincher',
    pitch: 'Pick a commander and a price cap. Get a full deck that fits.',
    status: 'soon',
    accent: 'gold',
    icon: <CoinIcon />,
  },
  {
    id: 'deck-doctor',
    name: 'Deck Doctor',
    pitch: 'Paste your list and get a friendly checkup.',
    status: 'live',
    accent: 'teal',
    icon: <PulseCardIcon />,
  },
]
