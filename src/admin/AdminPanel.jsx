import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllSites } from '../lib/supabase'

function fmt(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function maskPhone(phone) {
  if (!phone || phone.length < 10) return phone
  return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`
}

export default function AdminPanel() {
  const navigate = useNavigate()
  const [sites, setSites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getAllSites()
      .then(setSites)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('adminAuth')
    navigate('/login')
  }

  const filtered = sites.filter(s => {
    const q = search.toLowerCase()
    const name = `${s.quiz_data?.myName || ''} ${s.quiz_data?.partnerName || ''}`.toLowerCase()
    return s.phone.includes(q) || name.includes(q)
  })

  const paid   = sites.filter(s => s.paid).length
  const unpaid = sites.length - paid

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f13', color: 'white', fontFamily: 'system-ui, sans-serif' }}>

      {/* header */}
      <div style={{ background: '#1a1a24', borderBottom: '1px solid #2d2d3d', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Painel Admin</h1>
          <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>Dia dos Namorados</p>
        </div>
        <button
          onClick={handleLogout}
          style={{ background: '#2d2d3d', color: '#9ca3af', border: 'none', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
        >
          Sair
        </button>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>

        {/* stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total', value: sites.length, color: '#7c3aed' },
            { label: 'Pagos', value: paid, color: '#10b981' },
            { label: 'Não pagos', value: unpaid, color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} style={{ background: '#1a1a24', borderRadius: 14, padding: '16px 20px', border: `1px solid ${s.color}30` }}>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</p>
              <p style={{ margin: 0, fontSize: 12, color: '#6b7280', marginTop: 2 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* search */}
        <input
          placeholder="Buscar por telefone ou nome..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', background: '#1a1a24', border: '1.5px solid #2d2d3d',
            borderRadius: 12, padding: '10px 16px', color: 'white', fontSize: 14,
            outline: 'none', boxSizing: 'border-box', marginBottom: 16,
          }}
        />

        {/* table */}
        {loading && <p style={{ color: '#6b7280', textAlign: 'center', padding: 40 }}>Carregando...</p>}
        {error && (
          <div style={{ background: '#1a1a24', border: '1px solid #ef444430', borderRadius: 16, padding: 32, textAlign: 'center' }}>
            <p style={{ color: '#ef4444', fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Erro ao conectar ao banco de dados</p>
            <p style={{ color: '#9ca3af', fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
              As variáveis do Supabase não estão configuradas no Vercel.<br />
              Acesse <strong style={{ color: '#a78bfa' }}>Vercel → Settings → Environment Variables</strong> e adicione:
            </p>
            <div style={{ background: '#0f0f13', borderRadius: 10, padding: '12px 16px', textAlign: 'left', display: 'inline-block', fontFamily: 'monospace', fontSize: 12, color: '#86efac', lineHeight: 2 }}>
              VITE_SUPABASE_URL = sua_url_do_supabase<br />
              VITE_SUPABASE_ANON_KEY = sua_chave_anon
            </div>
            <p style={{ color: '#6b7280', fontSize: 12, marginTop: 12 }}>Após adicionar, faça um novo deploy no Vercel.</p>
          </div>
        )}

        {!loading && !error && (
          <div style={{ background: '#1a1a24', borderRadius: 16, overflow: 'hidden', border: '1px solid #2d2d3d' }}>
            {/* table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 110px 130px 130px 90px', gap: 0, background: '#12121a', borderBottom: '1px solid #2d2d3d' }}>
              {['Telefone', 'Casal', 'Status', 'Cadastro', 'Pagamento', 'Ação'].map(h => (
                <div key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</div>
              ))}
            </div>

            {filtered.length === 0 && (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: 40, margin: 0 }}>
                {search ? 'Nenhum resultado.' : 'Nenhum cliente ainda.'}
              </p>
            )}

            {filtered.map((site, i) => {
              const qd = site.quiz_data || {}
              const couple = [qd.myName, qd.partnerName].filter(Boolean).join(' e ') || '—'
              return (
                <div
                  key={site.id}
                  style={{
                    display: 'grid', gridTemplateColumns: '160px 1fr 110px 130px 130px 90px',
                    borderBottom: i < filtered.length - 1 ? '1px solid #2d2d3d' : 'none',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ padding: '12px 14px' }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#e5e7eb', fontFamily: 'monospace' }}>
                      {maskPhone(site.phone)}
                    </p>
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    <p style={{ margin: 0, fontSize: 13, color: '#d1d5db' }}>{couple}</p>
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                      background: site.paid ? '#10b98120' : '#f59e0b20',
                      color: site.paid ? '#10b981' : '#f59e0b',
                    }}>
                      {site.paid ? '✅ Pago' : '⏳ Pendente'}
                    </span>
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>{fmt(site.created_at)}</p>
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>{fmt(site.paid_at)}</p>
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    <a
                      href={`/${site.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-block', background: '#7c3aed20', color: '#a78bfa',
                        border: '1px solid #7c3aed40', borderRadius: 8, padding: '4px 12px',
                        fontSize: 12, fontWeight: 600, textDecoration: 'none',
                      }}
                    >
                      Ver site
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
