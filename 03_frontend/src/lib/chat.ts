import type { Survivor } from '../components/game/SurvivorRow'
import { getGreeting } from './greetings'

export interface ChatLine {
  speaker: 'survivor' | 'player'
  text: string
}

export interface ChatState {
  selectedSurvivor: Survivor | null
  histories: Record<string, ChatLine[]>
  loadedFromDb: Record<string, boolean>
}

export function createChatState(): ChatState {
  return { selectedSurvivor: null, histories: {}, loadedFromDb: {} }
}

export function selectSurvivor(state: ChatState, survivor: Survivor): ChatState {
  // If already selected, deselect
  if (state.selectedSurvivor?.id === survivor.id) {
    return { ...state, selectedSurvivor: null }
  }
  return { ...state, selectedSurvivor: survivor }
}

export function setHistory(state: ChatState, survivorId: string, history: ChatLine[]): ChatState {
  return {
    ...state,
    histories: { ...state.histories, [survivorId]: history },
    loadedFromDb: { ...state.loadedFromDb, [survivorId]: true },
  }
}

export function addGreeting(state: ChatState, survivor: Survivor): ChatState {
  const id = survivor.id
  const greeting = getGreeting(survivor.lore_id, survivor.relationship_strength)
  return {
    ...state,
    histories: {
      ...state.histories,
      [id]: [{ speaker: 'survivor', text: greeting }],
    },
  }
}

export function addPlayerMessage(state: ChatState, text: string): ChatState {
  if (!state.selectedSurvivor) return state
  const id = state.selectedSurvivor.id
  const history = [...(state.histories[id] || []), { speaker: 'player' as const, text }]
  return {
    ...state,
    histories: { ...state.histories, [id]: history },
  }
}

export function addSurvivorMessage(state: ChatState, survivorId: string, text: string): ChatState {
  const history = [...(state.histories[survivorId] || []), { speaker: 'survivor' as const, text }]
  return {
    ...state,
    histories: { ...state.histories, [survivorId]: history },
  }
}
