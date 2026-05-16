import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getSite } from '../lib/supabase'
import SitePreview from '../components/SitePreview'
import SitePreviewBiblico from '../components/SitePreviewBiblico'

export default function SitePage() {
  const { phone } = useParams()
  const [status, setStatus] = useState('loading') // loading | not-found | unpaid | ready
  const [quizData, setQuizData] = useState(null)

  useEffect(() => {
    getSite(phone)
      .then(site => {
        if (!site) { setStatus('not-found'); return }
        if (!site.paid) { setStatus('unpaid'); return }
        setQuizData(site.quiz_data)
        setStatus('ready')
      })
      .catch(() => setStatus('not-found'))
  }, [phone])

  if (status === 'loading') return (
    <div style={fullPage}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>💕</div>
      <p style={{ color: '#9ca3af', fontSize: 15 }}>Carregando presente...</p>
    </div>
  )

  if (status === 'not-found') return (
    <div style={fullPage}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
      <h2 style={{ color: 'white', fontSize: 20, fontWeight: 800, margin: 0 }}>Site não encontrado</h2>
      <p style={{ color: '#6b7280', fontSize: 14, marginTop: 8, textAlign: 'center', maxWidth: 280 }}>
        Esse link não existe ou foi removido.
      </p>
    </div>
  )

  if (status === 'unpaid') return (
    <div style={fullPage}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
      <h2 style={{ color: 'white', fontSize: 20, fontWeight: 800, margin: 0 }}>Presente não disponível</h2>
      <p style={{ color: '#6b7280', fontSize: 14, marginTop: 8, textAlign: 'center', maxWidth: 280 }}>
        O pagamento ainda não foi confirmado. Assim que o PIX for aprovado o site será liberado.
      </p>
    </div>
  )

  const isDemo = phone === 'demo'

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#030308', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 430, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {quizData?.variant === 'biblico'
          ? <SitePreviewBiblico externalData={quizData} />
          : <SitePreview externalData={quizData} />}
      </div>

      {isDemo && (
        <>
          <style>{`
            @keyframes demoPulse {
              0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.55), 0 8px 32px rgba(34,197,94,0.4); transform: scale(1); }
              50% { box-shadow: 0 0 0 14px rgba(34,197,94,0), 0 8px 40px rgba(34,197,94,0.5); transform: scale(1.04); }
            }
          `}</style>
          <a
            href="/"
            style={{
              position: 'fixed',
              bottom: 28,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              color: '#fff',
              fontWeight: 800,
              fontSize: 16,
              textDecoration: 'none',
              borderRadius: 99,
              padding: '16px 32px',
              whiteSpace: 'nowrap',
              animation: 'demoPulse 2s ease-in-out infinite',
              border: '2px solid rgba(255,255,255,0.25)',
            }}
          >
            💝 Cria Meu Site Agora
          </a>
        </>
      )}
    </div>
  )
}

const fullPage = {
  minHeight: '100vh',
  background: '#0a0208',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
}
