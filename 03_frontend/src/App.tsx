import { useState } from 'react'
import FeedPreview from './components/FeedPreview'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || ''

function App() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    try {
      const res = await fetch(`${API_URL}/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.status === 201) {
        setSubmitted(true)
        setError('')
      } else if (res.status === 409) {
        setSubmitted(true)
        setError('')
      } else {
        setError('Something went wrong. Try again.')
      }
    } catch {
      setError('Could not connect. Try again later.')
    }
  }

  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero">
        <h1 className="title">THE CAMP</h1>
        <p className="tagline">You plan. You send them out. You wait.</p>
        <p className="subtitle">A post-apocalyptic shelter management game</p>
      </section>

      {/* Feed Preview */}
      <section className="section">
        <FeedPreview />
      </section>

      {/* Three Pillars */}
      <section className="section pillars">
        <div className="pillar">
          <h2>You plan. They execute.</h2>
          <p>Assign survivors. Choose gear. Pick the zone. Then hit Deploy — and lose all control.</p>
        </div>
        <div className="pillar">
          <h2>People, not units.</h2>
          <p>Every survivor has a name, a past, and people who care about them. When they don't come back, you remember.</p>
        </div>
        <div className="pillar">
          <h2>Scarcity is the point.</h2>
          <p>No loot showers. A working flashlight is a find. Antibiotics are a lifeline. Every item matters.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta">
        {submitted ? (
          <p className="cta-confirmed">You're on the list. We'll reach out.</p>
        ) : (
          <>
            <p className="cta-label">Get notified when early access opens.</p>
            <form className="cta-form" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit">NOTIFY ME</button>
            </form>
            {error && <p className="cta-error">{error}</p>}
            <p className="cta-note">No spam. One email when early access opens.</p>
          </>
        )}
      </section>

      {/* Footer */}
      <footer className="footer">
        Built by AImagineers
      </footer>
    </div>
  )
}

export default App
