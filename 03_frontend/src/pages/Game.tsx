import { useNavigate } from 'react-router-dom'

export default function Game() {
  const navigate = useNavigate()
  const slotName = localStorage.getItem('thecamp_save_slot_name') || 'Unknown'

  return (
    <div className="auth-page">
      <h1 className="auth-title">THE CAMP</h1>
      <p style={{ color: '#639922', fontSize: '0.85rem', margin: '0 0 1rem' }}>{slotName}</p>
      <p style={{ color: '#7a6a54', fontSize: '0.8rem', lineHeight: 1.8, textAlign: 'center', maxWidth: 400 }}>
        The game UI is being built. Your save is active.<br />
        This is where the three-panel layout will live.
      </p>
      <p className="auth-link" style={{ marginTop: '3rem' }}>
        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/slots') }}>Back to save slots</a>
      </p>
    </div>
  )
}
