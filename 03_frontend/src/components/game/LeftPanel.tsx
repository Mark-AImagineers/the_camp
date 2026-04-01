import { useState, useEffect } from 'react'
import { apiFetch } from '../../lib/api'
import SurvivorRow from './SurvivorRow'
import type { Survivor } from './SurvivorRow'

type Tab = 'people' | 'stash' | 'camp'

interface Props {
  saveSlotId: string | null
  onSelectSurvivor: (survivor: Survivor) => void
  selectedSurvivorId: string | null
}

export default function LeftPanel({ saveSlotId, onSelectSurvivor, selectedSurvivorId }: Props) {
  const [tab, setTab] = useState<Tab>('people')
  const [survivors, setSurvivors] = useState<Survivor[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!saveSlotId) return
    setLoading(true)
    apiFetch(`/save-slots/${saveSlotId}/survivors`)
      .then(res => res.json())
      .then(data => setSurvivors(data.survivors || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [saveSlotId])

  const toggleExpanded = (id: string) => {
    setExpandedId(prev => prev === id ? null : id)
  }

  const handleSurvivorClick = (survivor: Survivor) => {
    toggleExpanded(survivor.id)
    onSelectSurvivor(survivor)
  }

  return (
    <div className="panel left-panel">
      <div className="panel-tabs">
        {(['people', 'stash', 'camp'] as Tab[]).map(t => (
          <button
            key={t}
            className={`panel-tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      <div className="panel-body">
        {tab === 'people' && (
          loading ? (
            <p className="placeholder-text">Loading roster...</p>
          ) : survivors.length === 0 ? (
            <p className="placeholder-text">No survivors found.</p>
          ) : (
            <div className="survivor-list">
              {survivors.map(s => (
                <SurvivorRow
                  key={s.id}
                  survivor={s}
                  isExpanded={expandedId === s.id}
                  isSelected={selectedSurvivorId === s.id}
                  onToggle={() => handleSurvivorClick(s)}
                />
              ))}
            </div>
          )
        )}
        {tab === 'stash' && <p className="placeholder-text">Inventory will appear here.</p>}
        {tab === 'camp' && <p className="placeholder-text">Facilities will appear here.</p>}
      </div>
    </div>
  )
}
