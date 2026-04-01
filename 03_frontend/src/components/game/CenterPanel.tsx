import { useEffect, useRef } from 'react'
import type { ChatState } from '../../lib/chat'

interface Props {
  chat: ChatState
}

export default function CenterPanel({ chat }: Props) {
  const feedRef = useRef<HTMLDivElement>(null)
  const { selectedSurvivor, histories } = chat
  const chatLines = selectedSurvivor ? (histories[selectedSurvivor.id] || []) : []

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight
    }
  }, [chatLines.length])

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

      {/* Conversation — bottom half */}
      <div className="center-console">
        {selectedSurvivor ? (
          <>
            <div className="center-console-header">
              <span className="console-header-name">{selectedSurvivor.name}</span>
              <span className="console-header-bg"> · {selectedSurvivor.background}</span>
            </div>
            <div className="center-console-feed" ref={feedRef}>
              {chatLines.map((line, i) => (
                <p key={i} className={`console-line ${line.speaker === 'player' ? 'console-line-player' : 'console-line-survivor'}`}>
                  <span className="console-prefix">{line.speaker === 'player' ? '>' : `${selectedSurvivor.name}:`}</span>
                  {line.text}
                </p>
              ))}
            </div>
          </>
        ) : (
          <div className="center-console-feed center-console-idle">
            <p className="placeholder-text">Select a survivor to talk.</p>
          </div>
        )}
      </div>
    </div>
  )
}
