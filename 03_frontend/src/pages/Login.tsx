import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { setTokens } from '../lib/auth'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (res.ok) {
        setTokens(data.access_token, data.refresh_token)
        navigate('/slots')
      } else if (res.status === 403 && data.detail?.includes('pending')) {
        navigate('/pending')
      } else {
        setError(data.detail || 'Login failed.')
      }
    } catch {
      setError('Could not connect. Try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <h1 className="auth-title">THE CAMP</h1>
      <p className="auth-subtitle">Identify yourself.</p>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'VERIFYING...' : 'ENTER'}
        </button>
      </form>
      {error && <p className="auth-error">{error}</p>}
      <p className="auth-link">
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  )
}
