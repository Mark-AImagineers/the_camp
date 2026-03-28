import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import { clearTokens } from '../lib/auth'

interface Slot {
  id: string
  slot_number: number
  name: string
  day_count: number
  created_at: string
}

export default function SaveSlots() {
  const navigate = useNavigate()
  const [slots, setSlots] = useState<(Slot | null)[]>([null, null, null])
  const [creating, setCreating] = useState<number | null>(null)
  const [newName, setNewName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchSlots = async () => {
    const res = await apiFetch('/save-slots')
    if (res.ok) {
      const data = await res.json()
      setSlots(data.slots)
    }
    setLoading(false)
  }

  useEffect(() => { fetchSlots() }, [])

  const handleCreate = async (slotNumber: number) => {
    if (!newName.trim()) return
    setError('')
    const res = await apiFetch('/save-slots', {
      method: 'POST',
      body: JSON.stringify({ slot_number: slotNumber, name: newName.trim() }),
    })
    if (res.ok) {
      setCreating(null)
      setNewName('')
      fetchSlots()
    } else {
      const data = await res.json()
      setError(data.detail || 'Failed to create save.')
    }
  }

  const handleDelete = async (slot: Slot) => {
    if (!confirm(`Delete "${slot.name}"? All progress will be lost.`)) return
    const res = await apiFetch(`/save-slots/${slot.id}`, { method: 'DELETE' })
    if (res.ok || res.status === 204) {
      fetchSlots()
    }
  }

  const handleContinue = (slot: Slot) => {
    localStorage.setItem('thecamp_save_slot_id', slot.id)
    localStorage.setItem('thecamp_save_slot_name', slot.name)
    navigate('/game')
  }

  const handleLogout = () => {
    clearTokens()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="auth-page">
        <p style={{ color: '#7a6a54', fontSize: '0.8rem' }}>Loading...</p>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="slots-header">
        <h1 className="auth-title">THE CAMP</h1>
        <p className="auth-subtitle">Choose your story.</p>
      </div>

      <div className="slots-container">
        {slots.map((slot, i) => {
          const slotNumber = i + 1
          const isCreating = creating === slotNumber

          if (slot) {
            return (
              <div key={i} className="slot-card filled">
                <div className="slot-header">
                  <span className="slot-label">SLOT {slotNumber}</span>
                  <button className="slot-delete" onClick={() => handleDelete(slot)}>&times;</button>
                </div>
                <p className="slot-name">{slot.name}</p>
                <p className="slot-info">Day {slot.day_count} · {new Date(slot.created_at).toLocaleDateString()}</p>
                <button className="slot-action" onClick={() => handleContinue(slot)}>CONTINUE</button>
              </div>
            )
          }

          if (isCreating) {
            return (
              <div key={i} className="slot-card creating">
                <div className="slot-header">
                  <span className="slot-label">SLOT {slotNumber}</span>
                  <button className="slot-delete" onClick={() => { setCreating(null); setNewName('') }}>&times;</button>
                </div>
                <input
                  className="slot-name-input"
                  type="text"
                  placeholder="Name your save"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  maxLength={100}
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate(slotNumber)}
                />
                <button className="slot-action" onClick={() => handleCreate(slotNumber)}>BEGIN</button>
              </div>
            )
          }

          return (
            <div key={i} className="slot-card empty">
              <div className="slot-header">
                <span className="slot-label">SLOT {slotNumber}</span>
              </div>
              <p className="slot-empty-text">Empty</p>
              <button className="slot-action dim" onClick={() => setCreating(slotNumber)}>NEW GAME</button>
            </div>
          )
        })}
      </div>

      {error && <p className="auth-error">{error}</p>}

      <p className="auth-link">
        <a href="#" onClick={(e) => { e.preventDefault(); handleLogout() }}>Log out</a>
      </p>
    </div>
  )
}
