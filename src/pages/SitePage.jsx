import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getSite } from '../lib/supabase'
import SitePreview from '../components/SitePreview'

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

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#030308', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 430, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <SitePreview externalData={quizData} />
      </div>
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
