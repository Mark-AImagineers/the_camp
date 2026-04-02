import { useState, useCallback, useEffect } from 'react'
import TopBar from './TopBar'
import LeftPanel from './LeftPanel'
import CenterPanel from './CenterPanel'
import RightPanel from './RightPanel'
import BottomBar from './BottomBar'
import { createChatState, selectSurvivor, setHistory, addGreeting, addPlayerMessage, addSurvivorMessage } from '../../lib/chat'
import type { ChatState } from '../../lib/chat'
import { createGameLogState } from '../../lib/gameLog'
import type { GameLogState } from '../../lib/gameLog'
import type { Survivor } from './SurvivorRow'
import { apiFetch } from '../../lib/api'
import './game.css'

export default function GameLayout() {
  const saveSlotId = localStorage.getItem('thecamp_save_slot_id')
  const [chat, setChat] = useState<ChatState>(createChatState)
  const [gameLog, setGameLog] = useState<GameLogState>(createGameLogState)
  const [responding, setResponding] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)

  const fetchEvents = useCallback(() => {
    if (!saveSlotId) return
    apiFetch(`/save-slots/${saveSlotId}/events`)
      .then(res => res.json())
      .then(data => {
        setGameLog({ events: data.events || [], loaded: true })
      })
      .catch(() => {})
  }, [saveSlotId])

  // Load events on mount
  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const handleSelectSurvivor = useCallback((survivor: Survivor) => {
    setChat(prev => {
      if (prev.selectedSurvivor?.id === survivor.id) {
        return selectSurvivor(prev, survivor)
      }

      const next = selectSurvivor(prev, survivor)

      if (prev.loadedFromDb[survivor.id]) return next

      if (saveSlotId) {
        setLoadingHistory(true)
        apiFetch(`/save-slots/${saveSlotId}/survivors/${survivor.id}/chat`)
          .then(res => res.json())
          .then(data => {
            const history = data.history || []
            if (history.length > 0) {
              setChat(prev2 => setHistory(prev2, survivor.id, history))
            } else {
              setChat(prev2 => addGreeting(prev2, survivor))
            }
          })
          .catch(() => {
            setChat(prev2 => addGreeting(prev2, survivor))
          })
          .finally(() => setLoadingHistory(false))
      }

      return next
    })
  }, [saveSlotId])

  const handleSendMessage = useCallback((text: string) => {
    setChat(prev => {
      const next = addPlayerMessage(prev, text)
      const survivor = next.selectedSurvivor
      if (!survivor || !saveSlotId) return next

      setResponding(true)
      apiFetch(`/save-slots/${saveSlotId}/survivors/${survivor.id}/chat`, {
        method: 'POST',
        body: JSON.stringify({ message: text }),
      })
        .then(res => res.json())
        .then(data => {
          setChat(prev2 => addSurvivorMessage(prev2, survivor.id, data.response))
          // Refresh events — consequences may have generated new log entries
          fetchEvents()
        })
        .catch(() => {
          setChat(prev2 => addSurvivorMessage(prev2, survivor.id, '...'))
        })
        .finally(() => setResponding(false))

      return next
    })
  }, [saveSlotId, fetchEvents])

  return (
    <div className="game-grid">
      <TopBar />
      <LeftPanel saveSlotId={saveSlotId} onSelectSurvivor={handleSelectSurvivor} selectedSurvivorId={chat.selectedSurvivor?.id ?? null} />
      <CenterPanel chat={chat} gameLog={gameLog} responding={responding} loadingHistory={loadingHistory} />
      <RightPanel />
      <BottomBar selectedSurvivor={chat.selectedSurvivor} onSend={handleSendMessage} disabled={responding || loadingHistory} />
    </div>
  )
}
