export default function CenterPanel() {
  return (
    <div className="panel center-panel">
      <div className="center-header">
        <span className="center-header-text">No active expedition</span>
      </div>
      <div className="center-feed">
        <p className="placeholder-text center-placeholder">Deploy a team to begin.</p>
        <span className="cursor-blink">{'\u2588'}</span>
      </div>
    </div>
  )
}
