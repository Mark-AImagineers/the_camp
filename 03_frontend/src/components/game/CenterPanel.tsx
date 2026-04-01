export default function CenterPanel() {
  return (
    <div className="panel center-panel">
      {/* Event Log — top half */}
      <div className="center-log">
        <div className="center-log-header">
          <span className="center-header-text">No active expedition</span>
        </div>
        <div className="center-log-feed">
          <p className="placeholder-text center-placeholder">Deploy a team to begin.</p>
          <span className="cursor-blink">{'\u2588'}</span>
        </div>
      </div>

      <div className="center-divider" />

      {/* Conversation / Menu — bottom half */}
      <div className="center-console">
        <div className="center-console-feed">
          <p className="console-line"><span className="console-prefix">&gt;</span> Awaiting orders...</p>
        </div>
        <div className="center-console-input">
          <span className="console-prefix">&gt;</span>
          <span className="console-cursor">{'\u2588'}</span>
        </div>
      </div>
    </div>
  )
}
