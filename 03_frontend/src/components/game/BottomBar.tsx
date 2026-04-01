import { useState } from 'react'
import type { Survivor } from './SurvivorRow'

interface Props {
  selectedSurvivor: Survivor | null
  onSend: (text: string) => void
}

export default function BottomBar({ selectedSurvivor, onSend }: Props) {
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || !selectedSurvivor) return
    onSend(trimmed)
    setInput('')
  }

  return (
    <div className="bottombar">
      <form className="bottombar-form" onSubmit={handleSubmit}>
        <span className="bottombar-prompt">
          {selectedSurvivor ? `[${selectedSurvivor.name}]` : '[---]'}
        </span>
        <span className="bottombar-caret">&gt;</span>
        <input
          className="bottombar-input"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={selectedSurvivor ? 'Say something...' : 'Select a survivor to talk'}
          disabled={!selectedSurvivor}
          autoComplete="off"
          spellCheck={false}
        />
      </form>
    </div>
  )
}
