import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ADMIN_USER = 'admin'
const ADMIN_PASS = 'admin159753'

export default function LoginPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState(false)

  const handleLogin = (e) => {
    e.preventDefault()
    if (user.trim() === ADMIN_USER && pass.trim() === ADMIN_PASS) {
      localStorage.setItem('adminAuth', '1')
      window.location.href = '/admin'
    } else {
      setError(true)
      setTimeout(() => setError(false), 2500)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f13', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 380, background: '#1a1a24', borderRadius: 20, padding: 32, boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🔐</div>
          <h1 style={{ color: 'white', fontSize: 22, fontWeight: 800, margin: 0 }}>Painel Admin</h1>
          <p style={{ color: '#6b7280', fontSize: 13, marginTop: 6 }}>Dia dos Namorados</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', color: '#9ca3af', fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
              Usuário
            </label>
            <input
              value={user}
              onChange={e => setUser(e.target.value)}
              autoComplete="username"
              style={{
                width: '100%', background: '#0f0f13', border: `1.5px solid ${error ? '#ef4444' : '#2d2d3d'}`,
                borderRadius: 12, padding: '10px 14px', color: 'white', fontSize: 15, outline: 'none',
                boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', color: '#9ca3af', fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
              Senha
            </label>
            <input
              type="password"
              value={pass}
              onChange={e => setPass(e.target.value)}
              autoComplete="current-password"
              style={{
                width: '100%', background: '#0f0f13', border: `1.5px solid ${error ? '#ef4444' : '#2d2d3d'}`,
                borderRadius: 12, padding: '10px 14px', color: 'white', fontSize: 15, outline: 'none',
                boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
            />
          </div>

          {error && (
            <p style={{ color: '#ef4444', fontSize: 13, textAlign: 'center', margin: 0 }}>
              Usuário ou senha incorretos
            </p>
          )}

          <button
            type="submit"
            style={{
              marginTop: 8, background: '#7c3aed', color: 'white', border: 'none',
              borderRadius: 12, padding: '12px 0', fontSize: 15, fontWeight: 700,
              cursor: 'pointer', transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}
