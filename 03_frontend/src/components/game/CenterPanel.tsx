import { useEffect, useRef } from 'react'
import type { ChatState } from '../../lib/chat'
import type { GameLogState } from '../../lib/gameLog'

interface Props {
  chat: ChatState
  gameLog: GameLogState
  responding?: boolean
  loadingHistory?: boolean
}

export default function CenterPanel({ chat, gameLog, responding, loadingHistory }: Props) {
  const chatFeedRef = useRef<HTMLDivElement>(null)
  const logFeedRef = useRef<HTMLDivElement>(null)
  const { selectedSurvivor, histories } = chat
  const chatLines = selectedSurvivor ? (histories[selectedSurvivor.id] || []) : []

  useEffect(() => {
    if (chatFeedRef.current) {
      chatFeedRef.current.scrollTop = chatFeedRef.current.scrollHeight
    }
  }, [chatLines.length, responding])

  useEffect(() => {
    if (logFeedRef.current) {
      logFeedRef.current.scrollTop = logFeedRef.current.scrollHeight
    }
  }, [gameLog.events.length])

  // Group events by game_day for day markers
  const renderLogEntries = () => {
    const entries: JSX.Element[] = []
    let lastDay = 0

    for (const event of gameLog.events) {
      if (event.game_day !== lastDay) {
        entries.push(
          <div key={`day-${event.game_day}`} className="log-day-marker">
            ── Day {event.game_day} ──
          </div>
        )
        lastDay = event.game_day
      }
      entries.push(
        <p key={event.id} className={`log-entry log-${event.event_type}`}>
          {event.text}
        </p>
      )
    }
    return entries
  }

  return (
    <div className="panel center-panel">
      {/* Game Log — top half */}
      <div className="center-log">
        <div className="center-log-header">
          <span className="center-header-text">Camp Log</span>
        </div>
        <div className="center-log-feed" ref={logFeedRef}>
          {gameLog.events.length === 0 ? (
            <>
              <p className="placeholder-text center-placeholder">No events yet.</p>
              <span className="cursor-blink">{'\u2588'}</span>
            </>
          ) : (
            renderLogEntries()
          )}
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
            <div className="center-console-feed" ref={chatFeedRef}>
              {loadingHistory && (
                <p className="console-line console-typing">
                  <span className="console-prefix">&gt;</span>
                  <span className="typing-indicator">Loading conversation...</span>
                </p>
              )}
              {chatLines.map((line, i) => (
                <p key={i} className={`console-line ${line.speaker === 'player' ? 'console-line-player' : 'console-line-survivor'}`}>
                  <span className="console-prefix">{line.speaker === 'player' ? '>' : `${selectedSurvivor.name}:`}</span>
                  {line.text}
                </p>
              ))}
              {responding && (
                <p className="console-line console-line-survivor console-typing">
                  <span className="console-prefix">{selectedSurvivor.name}:</span>
                  <span className="typing-indicator">...</span>
                </p>
              )}
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
