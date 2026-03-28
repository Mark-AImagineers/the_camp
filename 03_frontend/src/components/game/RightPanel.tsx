import { useState } from 'react'

type Tab = 'zones' | 'intel'

const PLACEHOLDER: Record<Tab, string> = {
  zones: 'Available zones will appear here.',
  intel: 'Zone intel will appear here.',
}

export default function RightPanel() {
  const [tab, setTab] = useState<Tab>('zones')

  return (
    <div className="panel right-panel">
      <div className="panel-tabs">
        {(['zones', 'intel'] as Tab[]).map(t => (
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
