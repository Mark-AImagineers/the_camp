import './game.css'

export default function TopBar() {
  return (
    <div className="topbar">
      <span className="topbar-title">THE CAMP</span>
      <div className="topbar-resources">
        <span className="resource"><span className="dot" style={{ background: '#639922' }}></span>Food <span className="resource-val">50</span></span>
        <span className="resource"><span className="dot" style={{ background: '#185fa5' }}></span>Medicine <span className="resource-val">20</span></span>
        <span className="resource"><span className="dot" style={{ background: '#ba7517' }}></span>Morale <span className="resource-val">70</span></span>
        <span className="resource"><span className="dot" style={{ background: '#533b2a' }}></span>Population <span className="resource-val">5</span></span>
      </div>
      <span className="topbar-day">DAY 1</span>
    </div>
  )
}
