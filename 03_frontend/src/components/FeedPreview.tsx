import { useEffect, useState, useRef } from 'react'

interface FeedEvent {
  time: string
  text: string
  type: 'normal' | 'warning' | 'danger' | 'good'
  delay: number
}

const EVENTS: FeedEvent[] = [
  { time: '08:02', text: 'Elena and Marcus inserted. Eastfield Mall. Visibility: low.', type: 'normal', delay: 1200 },
  { time: '08:19', text: 'Ground floor cleared. No contacts.', type: 'normal', delay: 2800 },
  { time: '08:34', text: '\u26A0 Movement detected. East stairwell. Unconfirmed.', type: 'warning', delay: 2200 },
  { time: '08:41', text: 'Marcus is checking the stairwell. Elena is holding position.', type: 'normal', delay: 1800 },
  { time: '08:47', text: 'Contact. Two infected. Marcus engaged.', type: 'danger', delay: 1400 },
  { time: '08:49', text: 'Marcus took a hit. Health: 41%.', type: 'danger', delay: 1200 },
  { time: '08:51', text: 'Elena applied a field dressing. 1 medkit used.', type: 'normal', delay: 2400 },
  { time: '09:04', text: 'Pharmacy found. Gate is padlocked.', type: 'normal', delay: 3000 },
  { time: '09:18', text: '\u2605 Antibiotics \u00D74 \u2014 Rare find.', type: 'good', delay: 2000 },
]

const TYPE_COLORS: Record<string, string> = {
  normal: '#7a6a54',
  warning: '#ba7517',
  danger: '#993c1d',
  good: '#639922',
}

export default function FeedPreview() {
  const [visibleLines, setVisibleLines] = useState<number>(0)
  const feedRef = useRef<HTMLDivElement>(null)
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    let current = 0
    const showNext = () => {
      if (current >= EVENTS.length) return
      current++
      setVisibleLines(current)
      if (current < EVENTS.length) {
        setTimeout(showNext, EVENTS[current].delay)
      }
    }
    setTimeout(showNext, 1500)
  }, [])

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight
    }
  }, [visibleLines])

  return (
    <div
      ref={feedRef}
      style={{
        border: '1px solid #2a2a2a',
        background: '#111111',
        padding: '1.5rem',
        maxWidth: '640px',
        width: '100%',
        minHeight: '280px',
        fontFamily: 'monospace',
        fontSize: '0.8rem',
        lineHeight: '1.8',
        overflowY: 'auto',
      }}
    >
      {EVENTS.slice(0, visibleLines).map((event, i) => (
        <div key={i} style={{ color: TYPE_COLORS[event.type], opacity: 0, animation: 'fadeIn 0.3s forwards' }}>
          <span style={{ color: '#4a3d2e' }}>[{event.time}]</span> {event.text}
        </div>
      ))}
      {visibleLines > 0 && (
        <span style={{ color: '#7a6a54', animation: 'blink 1s step-end infinite' }}>{'\u2588'}</span>
      )}
    </div>
  )
}
