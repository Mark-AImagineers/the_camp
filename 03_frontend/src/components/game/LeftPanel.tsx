import { useState } from 'react'

type Tab = 'people' | 'stash' | 'camp'

const PLACEHOLDER: Record<Tab, string> = {
  people: 'Survivor roster will appear here.',
  stash: 'Inventory will appear here.',
  camp: 'Facilities will appear here.',
}

export default function LeftPanel() {
  const [tab, setTab] = useState<Tab>('people')

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
        <p className="placeholder-text">{PLACEHOLDER[tab]}</p>
      </div>
    </div>
  )
}
