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
      if (res.status === 201 || res.status === 409) {
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

      {/* Hero — the world, not the product */}
      <section className="hero">
        <p className="hero-open">Nobody remembers exactly when it started.</p>
        <h1 className="title">THE CAMP</h1>
        <p className="hero-sub">Thirty people. A warehouse with concrete walls.<br />Someone has to make the calls.</p>
      </section>

      {/* Lore — pull them in */}
      <section className="section lore">
        <div className="lore-block">
          <p>Four years since the world went quiet. The cities are shells — some burned, some didn't, which in some ways is worse. They just sit there, intact, full of everything you need and everything that wants to kill you.</p>
        </div>
        <div className="lore-block">
          <p>They call them <strong>the Altered</strong>. They were people once. That's the part that doesn't go away. You see a face sometimes, in the dead corridors of what used to be places — and you recognize it.</p>
        </div>
        <div className="lore-block accent">
          <p>There are things that don't add up. A door found closed from the inside in a building believed fully Altered for two years. A scavenging party followed for three kilometers — followed, but not attacked. Markings on walls that no surviving human has claimed.</p>
        </div>
        <div className="lore-block">
          <p>Nobody investigates. Nobody wants the answer badly enough to go looking for it.</p>
        </div>
      </section>

      {/* The hook — you */}
      <section className="section you">
        <p className="you-lead">Eleven days ago, the Coordinator left on an expedition.</p>
        <p className="you-body">They haven't come back. No body. No message. No signal of any kind — just a team that went out and a silence where they used to be.</p>
        <p className="you-body">Someone has to hold the ledger. Someone has to answer when people ask what the plan is. Someone has to make the calls that keep thirty people fed and alive.</p>
        <p className="you-punch">That someone is you.</p>
      </section>

      {/* Feed — what it feels like */}
      <section className="section feed-section">
        <p className="feed-intro">You send them out. You wait. This is what comes back.</p>
        <FeedPreview />
      </section>

      {/* What's at stake — not features, consequences */}
      <section className="section stakes">
        <div className="stake">
          <p>Every survivor has a name. A past. People who care about them.</p>
          <p className="stake-quiet">When they don't come back, their portrait goes grey. It stays there. You put it there.</p>
        </div>
        <div className="divider"></div>
        <div className="stake">
          <p>A working flashlight is a find. Antibiotics are a lifeline. Nine millimeter rounds — you count every one.</p>
          <p className="stake-quiet">Nothing is given. Everything is earned or taken.</p>
        </div>
        <div className="divider"></div>
        <div className="stake">
          <p>You plan. You equip. You choose who goes and who stays.</p>
          <p className="stake-quiet">Then you hit deploy, and you lose all control.</p>
        </div>
      </section>

      {/* Closing line */}
      <section className="section closing">
        <p className="closing-line">The only thing that keeps this place alive is the decision, made again every single day, to keep trying.</p>
      </section>

      {/* CTA */}
      <section className="section cta">
        {submitted ? (
          <p className="cta-confirmed">You're on the list. We'll find you when it's time.</p>
        ) : (
          <>
            <p className="cta-label">The Camp is coming. Leave your name at the gate.</p>
            <form className="cta-form" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit">I'M IN</button>
            </form>
            {error && <p className="cta-error">{error}</p>}
            <p className="cta-note">No spam. One signal when the gates open.</p>
          </>
        )}
      </section>

      <footer className="footer">
        Built by AImagineers
      </footer>
    </div>
  )
}

export default App
