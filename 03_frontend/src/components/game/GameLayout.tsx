import TopBar from './TopBar'
import LeftPanel from './LeftPanel'
import CenterPanel from './CenterPanel'
import RightPanel from './RightPanel'
import BottomBar from './BottomBar'
import './game.css'

export default function GameLayout() {
  const saveSlotId = localStorage.getItem('thecamp_save_slot_id')

  return (
    <div className="game-grid">
      <TopBar />
      <LeftPanel saveSlotId={saveSlotId} />
      <CenterPanel />
      <RightPanel />
      <BottomBar />
    </div>
  )
}
