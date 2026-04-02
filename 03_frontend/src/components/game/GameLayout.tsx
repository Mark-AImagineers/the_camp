import { useState, useCallback } from 'react'
import TopBar from './TopBar'
import LeftPanel from './LeftPanel'
import CenterPanel from './CenterPanel'
import RightPanel from './RightPanel'
import BottomBar from './BottomBar'
import { createChatState, selectSurvivor, addPlayerMessage, addSurvivorMessage } from '../../lib/chat'
import type { ChatState } from '../../lib/chat'
import type { Survivor } from './SurvivorRow'
import { apiFetch } from '../../lib/api'
import './game.css'

export default function GameLayout() {
  const saveSlotId = localStorage.getItem('thecamp_save_slot_id')
  const [chat, setChat] = useState<ChatState>(createChatState)
  const [responding, setResponding] = useState(false)

  const handleSelectSurvivor = useCallback((survivor: Survivor) => {
    setChat(prev => selectSurvivor(prev, survivor))
  }, [])

  const handleSendMessage = useCallback((text: string) => {
    setChat(prev => {
      const next = addPlayerMessage(prev, text)
      const survivor = next.selectedSurvivor
      if (!survivor || !saveSlotId) return next

      const history = next.histories[survivor.id] || []

      setResponding(true)
      apiFetch(`/save-slots/${saveSlotId}/survivors/${survivor.id}/chat`, {
        method: 'POST',
        body: JSON.stringify({ message: text, history }),
      })
        .then(res => res.json())
        .then(data => {
          setChat(prev2 => addSurvivorMessage(prev2, survivor.id, data.response))
        })
        .catch(() => {
          setChat(prev2 => addSurvivorMessage(prev2, survivor.id, '...'))
        })
        .finally(() => setResponding(false))

      return next
    })
  }, [saveSlotId])

  return (
    <div className="game-grid">
      <TopBar />
      <LeftPanel saveSlotId={saveSlotId} onSelectSurvivor={handleSelectSurvivor} selectedSurvivorId={chat.selectedSurvivor?.id ?? null} />
      <CenterPanel chat={chat} responding={responding} />
      <RightPanel />
      <BottomBar selectedSurvivor={chat.selectedSurvivor} onSend={handleSendMessage} disabled={responding} />
    </div>
  )
}
