export interface GameEvent {
  id: number
  event_type: 'expedition' | 'camp' | 'social' | 'decision' | 'system'
  text: string
  context: Record<string, unknown>
  game_day: number
  created_at: string
}

export interface GameLogState {
  events: GameEvent[]
  loaded: boolean
}

export function createGameLogState(): GameLogState {
  return { events: [], loaded: false }
}
