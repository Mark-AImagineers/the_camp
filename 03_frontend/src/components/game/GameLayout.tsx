import { useState, useCallback } from 'react'
import TopBar from './TopBar'
import LeftPanel from './LeftPanel'
import CenterPanel from './CenterPanel'
import RightPanel from './RightPanel'
import BottomBar from './BottomBar'
import { createChatState, selectSurvivor, addPlayerMessage } from '../../lib/chat'
import type { ChatState } from '../../lib/chat'
import type { Survivor } from './SurvivorRow'
import './game.css'

export default function GameLayout() {
  const saveSlotId = localStorage.getItem('thecamp_save_slot_id')
  const [chat, setChat] = useState<ChatState>(createChatState)

  const handleSelectSurvivor = useCallback((survivor: Survivor) => {
    setChat(prev => selectSurvivor(prev, survivor))
  }, [])

  const handleSendMessage = useCallback((text: string) => {
    setChat(prev => addPlayerMessage(prev, text))
  }, [])

  return (
    <div className="game-grid">
      <TopBar />
      <LeftPanel saveSlotId={saveSlotId} onSelectSurvivor={handleSelectSurvivor} selectedSurvivorId={chat.selectedSurvivor?.id ?? null} />
      <CenterPanel chat={chat} />
      <RightPanel />
      <BottomBar selectedSurvivor={chat.selectedSurvivor} onSend={handleSendMessage} />
    </div>
  )
}
