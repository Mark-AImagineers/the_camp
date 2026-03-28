import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || ''

function App() {
  const [api, setApi] = useState<{ status: string; version: string; service: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then(res => res.json())
      .then(setApi)
      .catch(err => setError(err.message))
  }, [])

  return (
    <div style={{
      background: '#0d0d0d',
      color: '#c9b99a',
      fontFamily: 'monospace',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1.5rem',
    }}>
      <h1 style={{ fontSize: '1.2rem', letterSpacing: '0.2em', color: '#6b5c45' }}>
        THE CAMP
      </h1>
      <div style={{ color: '#7a6a54', fontSize: '0.85rem' }}>
        Frontend: <span style={{ color: '#639922' }}>OK</span>
      </div>
      <div style={{ color: '#7a6a54', fontSize: '0.85rem' }}>
        API: {error
          ? <span style={{ color: '#993c1d' }}>UNREACHABLE — {error}</span>
          : api
            ? <span style={{ color: '#639922' }}>OK — v{api.version}</span>
            : <span style={{ color: '#ba7517' }}>checking...</span>
        }
      </div>
    </div>
  )
}

export default App
