interface Survivor {
  id: string
  lore_id: string
  name: string
  background: string
  age: number
  persona: string | null
  voice_notes: string | null
  quirks: string | null
  stats: { str: number; dex: number; agi: number; per: number; end: number; int: number; lck: number }
  hp: number
  max_hp: number
  condition: string
  camp_role: string | null
  is_activated: boolean
  relationship_strength: number
  is_dead: boolean
}

interface Props {
  survivor: Survivor
  isExpanded: boolean
  isSelected?: boolean
  onToggle: () => void
}

const STATUS_COLORS: Record<string, string> = {
  healthy: '#639922',
  injured: '#ba7517',
  sick: '#ba7517',
  traumatized: '#993c1d',
  dead: '#3a3a3a',
}

function getHealthColor(hp: number, maxHp: number): string {
  const pct = maxHp > 0 ? hp / maxHp : 0
  if (pct > 0.6) return '#639922'
  if (pct > 0.3) return '#ba7517'
  return '#993c1d'
}

function getInitials(name: string): string {
  return name.slice(0, 2).toUpperCase()
}

export type { Survivor }

export default function SurvivorRow({ survivor, isExpanded, isSelected, onToggle }: Props) {
  const isDead = survivor.is_dead
  const isLocked = !survivor.is_activated
  const hpPct = survivor.max_hp > 0 ? (survivor.hp / survivor.max_hp) * 100 : 0
  const statusLabel = isDead ? 'KIA' : survivor.condition.charAt(0).toUpperCase() + survivor.condition.slice(1)
  const statusColor = STATUS_COLORS[survivor.condition] || '#7a6a54'

  return (
    <div
      className={`survivor-row ${isDead ? 'dead' : ''} ${isLocked ? 'locked' : ''} ${isSelected ? 'selected' : ''}`}
      onClick={isLocked ? undefined : onToggle}
    >
      {/* Main row */}
      <div className="survivor-main">
        <div className={`survivor-portrait ${isDead ? 'dead' : ''}`}>
          {getInitials(survivor.name)}
        </div>
        <div className="survivor-info">
          <div className="survivor-name-line">
            <span className={`survivor-name ${isDead ? 'dead' : ''}`}>{survivor.name}</span>
            <span className="survivor-bg"> · {survivor.background}</span>
          </div>
          <div className="survivor-hp-bar">
            <div
              className="survivor-hp-fill"
              style={{
                width: `${hpPct}%`,
                background: isDead ? '#3a3a3a' : getHealthColor(survivor.hp, survivor.max_hp),
              }}
            />
          </div>
        </div>
        <div className="survivor-status">
          {isLocked ? (
            <span className="survivor-badge locked-badge">Locked</span>
          ) : (
            <span className="survivor-badge" style={{ color: statusColor }}>{statusLabel}</span>
          )}
        </div>
      </div>

      {/* Expanded detail */}
      {isExpanded && !isLocked && (
        <div className="survivor-detail">
          <div className="survivor-detail-meta">
            <span>Age: {survivor.age}</span>
            <span className="survivor-detail-sep">·</span>
            <span>HP: {survivor.hp}/{survivor.max_hp}</span>
          </div>

          <div className="survivor-detail-stats">
            <span className="stat-item"><span className="stat-label">STR</span> {survivor.stats.str}</span>
            <span className="stat-item"><span className="stat-label">DEX</span> {survivor.stats.dex}</span>
            <span className="stat-item"><span className="stat-label">AGI</span> {survivor.stats.agi}</span>
            <span className="stat-item"><span className="stat-label">PER</span> {survivor.stats.per}</span>
            <span className="stat-item"><span className="stat-label">END</span> {survivor.stats.end}</span>
            <span className="stat-item"><span className="stat-label">INT</span> {survivor.stats.int}</span>
            <span className="stat-item"><span className="stat-label">LCK</span> {survivor.stats.lck}</span>
          </div>

          <div className="survivor-detail-rel">
            <span className="stat-label">Trust</span>
            <div className="rel-bar">
              <div className="rel-fill" style={{ width: `${survivor.relationship_strength}%` }} />
            </div>
            <span className="rel-val">{survivor.relationship_strength}</span>
          </div>

          <div className="survivor-detail-role">
            Role: {survivor.camp_role || 'Unassigned'}
          </div>
        </div>
      )}
    </div>
  )
}
