import type { Survivor } from '../components/game/SurvivorRow'
import { getGreeting } from './greetings'

export interface ChatLine {
  speaker: 'survivor' | 'player'
  text: string
}

export interface ChatState {
  selectedSurvivor: Survivor | null
  histories: Record<string, ChatLine[]>
}

const MAX_LINES = 50

export function createChatState(): ChatState {
  return { selectedSurvivor: null, histories: {} }
}

export function selectSurvivor(state: ChatState, survivor: Survivor): ChatState {
  const id = survivor.id
  const existing = state.histories[id]

  // If already selected, deselect
  if (state.selectedSurvivor?.id === id) {
    return { ...state, selectedSurvivor: null }
  }

  // If no history yet, add a greeting
  if (!existing || existing.length === 0) {
    const greeting = getGreeting(survivor.lore_id, survivor.relationship_strength)
    return {
      selectedSurvivor: survivor,
      histories: {
        ...state.histories,
        [id]: [{ speaker: 'survivor', text: greeting }],
      },
    }
  }

  return { ...state, selectedSurvivor: survivor }
}

export function addPlayerMessage(state: ChatState, text: string): ChatState {
  if (!state.selectedSurvivor) return state
  const id = state.selectedSurvivor.id
  const history = [...(state.histories[id] || []), { speaker: 'player' as const, text }]
  return {
    ...state,
    histories: {
      ...state.histories,
      [id]: history.slice(-MAX_LINES),
    },
  }
}
