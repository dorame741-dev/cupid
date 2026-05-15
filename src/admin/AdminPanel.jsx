import { useState, useEffect } from 'react'
import { getAllSites } from '../lib/supabase'

const S = {
  bg: '#0b0b0f',
  surface: '#13131a',
  border: '#1f1f2e',
  muted: '#6b7280',
  text: '#e5e7eb',
  textSoft: '#9ca3af',
}

function fmt(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

function maskPhone(phone) {
  if (!phone || phone.length < 10) return phone
  return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`
}

function StatCard({ label, value, color, sub }) {
  return (
    <div style={{
      background: S.surface, borderRadius: 16, padding: '20px 24px',
      border: `1px solid ${color}25`, display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>
      <span style={{ fontSize: 36, fontWeight: 900, color, lineHeight: 1 }}>{value}</span>
      {sub && <span style={{ fontSize: 12, color: S.muted }}>{sub}</span>}
    </div>
  )
}

export default function AdminPanel() {
  const [sites, setSites]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('all') // all | paid | pending

  const load = () => {
    setLoading(true)
    setError(null)
    getAllSites()
      .then(setSites)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleLogout = () => {
    localStorage.removeItem('adminAuth')
    window.location.href = '/login'
  }

  const paid   = sites.filter(s => s.paid).length
  const unpaid = sites.length - paid
  const revenue = paid * 19.90

  const filtered = sites.filter(s => {
    const q = search.toLowerCase()
    const name = `${s.quiz_data?.myName || ''} ${s.quiz_data?.partnerName || ''}`.toLowerCase()
    const matchSearch = !q || s.phone.includes(q) || name.includes(q)
    const matchFilter = filter === 'all' || (filter === 'paid' ? s.paid : !s.paid)
    return matchSearch && matchFilter
  })

  return (
    <div style={{ minHeight: '100vh', background: S.bg, color: S.text, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* topbar */}
      <header style={{
        background: S.surface, borderBottom: `1px solid ${S.border}`,
        padding: '0 32px', height: 60, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexShrink: 0, position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/cupido.png" alt="" style={{ width: 36, height: 36, objectFit: 'contain' }} />
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: S.text }}>Cupid Admin</p>
            <p style={{ margin: 0, fontSize: 11, color: S.muted }}>Painel de controle</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={load}
            style={{ background: 'transparent', border: `1px solid ${S.border}`, color: S.muted, borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            Atualizar
          </button>
          <button onClick={handleLogout}
            style={{ background: '#ef444415', border: '1px solid #ef444430', color: '#ef4444', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            Sair
          </button>
        </div>
      </header>

      <main style={{ flex: 1, maxWidth: 1280, width: '100%', margin: '0 auto', padding: '32px 32px' }}>

        {/* stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          <StatCard label="Total de clientes" value={sites.length} color="#7c3aed" />
          <StatCard label="Pagamentos confirmados" value={paid} color="#10b981" sub={`R$ ${revenue.toFixed(2).replace('.', ',')} arrecadados`} />
          <StatCard label="Aguardando pagamento" value={unpaid} color="#f59e0b" />
          <StatCard label="Taxa de conversão" value={sites.length ? `${Math.round((paid / sites.length) * 100)}%` : '—'} color="#3b82f6" />
        </div>

        {/* toolbar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            placeholder="Buscar por telefone ou nome do casal..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1, minWidth: 260, background: S.surface, border: `1.5px solid ${S.border}`,
              borderRadius: 10, padding: '9px 16px', color: S.text, fontSize: 14,
              outline: 'none', boxSizing: 'border-box',
            }}
          />
          {['all', 'paid', 'pending'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: '8px 18px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                border: filter === f ? '1.5px solid #7c3aed' : `1.5px solid ${S.border}`,
                background: filter === f ? '#7c3aed20' : S.surface,
                color: filter === f ? '#a78bfa' : S.muted,
              }}>
              {f === 'all' ? 'Todos' : f === 'paid' ? 'Pagos' : 'Pendentes'}
            </button>
          ))}
          <span style={{ fontSize: 12, color: S.muted, marginLeft: 4 }}>
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* estados */}
        {loading && (
          <div style={{ background: S.surface, borderRadius: 16, border: `1px solid ${S.border}`, padding: '60px 32px', textAlign: 'center' }}>
            <div style={{ width: 36, height: 36, border: '3px solid #2d2d3d', borderTop: '3px solid #7c3aed', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: S.muted, margin: 0, fontSize: 14 }}>Carregando clientes...</p>
          </div>
        )}

        {error && (
          <div style={{ background: S.surface, border: '1px solid #ef444430', borderRadius: 16, padding: '40px 32px', textAlign: 'center' }}>
            <p style={{ color: '#ef4444', fontWeight: 700, fontSize: 16, marginBottom: 12 }}>Banco de dados não configurado</p>
            <p style={{ color: S.textSoft, fontSize: 13, lineHeight: 1.8, marginBottom: 20 }}>
              Acesse <strong style={{ color: '#a78bfa' }}>Vercel → Settings → Environment Variables</strong> e adicione:
            </p>
            <div style={{ background: S.bg, borderRadius: 10, padding: '14px 20px', display: 'inline-block', fontFamily: 'monospace', fontSize: 13, color: '#86efac', lineHeight: 2.2, textAlign: 'left' }}>
              VITE_SUPABASE_URL = https://xxxx.supabase.co<br />
              VITE_SUPABASE_ANON_KEY = eyJhbGciOi...
            </div>
            <p style={{ color: S.muted, fontSize: 12, marginTop: 16 }}>Após adicionar, clique em Redeploy no Vercel.</p>
          </div>
        )}

        {/* tabela */}
        {!loading && !error && (
          <div style={{ background: S.surface, borderRadius: 16, border: `1px solid ${S.border}`, overflow: 'hidden' }}>
            {/* cabeçalho */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '180px 200px 1fr 120px 150px 150px 100px',
              background: '#0f0f18', borderBottom: `1px solid ${S.border}`,
            }}>
              {['Telefone', 'Casal', 'Título do site', 'Status', 'Cadastro', 'Pagamento', 'Ações'].map(h => (
                <div key={h} style={{ padding: '11px 16px', fontSize: 11, fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: 0.8 }}>{h}</div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div style={{ padding: '60px 32px', textAlign: 'center' }}>
                <p style={{ color: S.muted, margin: 0, fontSize: 14 }}>
                  {search || filter !== 'all' ? 'Nenhum cliente encontrado com esse filtro.' : 'Nenhum cliente ainda. Compartilhe o link do quiz!'}
                </p>
              </div>
            )}

            {filtered.map((site, i) => {
              const qd = site.quiz_data || {}
              const couple = [qd.myName, qd.partnerName].filter(Boolean).join(' e ') || '—'
              const siteTitle = qd.title || '—'
              const isLast = i === filtered.length - 1
              return (
                <div key={site.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '180px 200px 1fr 120px 150px 150px 100px',
                    borderBottom: isLast ? 'none' : `1px solid ${S.border}`,
                    alignItems: 'center',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#ffffff05'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ padding: '14px 16px' }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: S.text, fontFamily: 'monospace' }}>
                      {maskPhone(site.phone)}
                    </p>
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <p style={{ margin: 0, fontSize: 13, color: S.textSoft, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{couple}</p>
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <p style={{ margin: 0, fontSize: 13, color: S.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{siteTitle}</p>
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
                      background: site.paid ? '#10b98118' : '#f59e0b18',
                      color: site.paid ? '#10b981' : '#f59e0b',
                      border: `1px solid ${site.paid ? '#10b98130' : '#f59e0b30'}`,
                    }}>
                      {site.paid ? 'Pago' : 'Pendente'}
                    </span>
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <p style={{ margin: 0, fontSize: 12, color: S.muted }}>{fmt(site.created_at)}</p>
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <p style={{ margin: 0, fontSize: 12, color: site.paid_at ? '#10b981' : S.muted }}>{fmt(site.paid_at)}</p>
                  </div>
                  <div style={{ padding: '14px 16px', display: 'flex', gap: 8 }}>
                    <a href={`/${site.phone}`} target="_blank" rel="noopener noreferrer"
                      style={{
                        background: '#7c3aed20', color: '#a78bfa',
                        border: '1px solid #7c3aed40', borderRadius: 8,
                        padding: '5px 12px', fontSize: 12, fontWeight: 600,
                        textDecoration: 'none', whiteSpace: 'nowrap',
                      }}>
                      Ver site
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        * { box-sizing: border-box }
        ::-webkit-scrollbar { width: 6px; height: 6px }
        ::-webkit-scrollbar-track { background: transparent }
        ::-webkit-scrollbar-thumb { background: #2d2d3d; border-radius: 3px }
      `}</style>
    </div>
  )
}
