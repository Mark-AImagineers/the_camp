import TopBar from './TopBar'
import LeftPanel from './LeftPanel'
import CenterPanel from './CenterPanel'
import RightPanel from './RightPanel'
import BottomBar from './BottomBar'
import './game.css'

export default function GameLayout() {
  return (
    <div className="game-grid">
      <TopBar />
      <LeftPanel />
      <CenterPanel />
      <RightPanel />
      <BottomBar />
    </div>
  )
}
