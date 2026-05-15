import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getSite } from '../lib/supabase'
import { Check, Copy, ExternalLink, Heart } from 'lucide-react'

function WaIcon() {
  return (
    <svg viewBox="0 0 32 32" width="22" height="22" fill="currentColor">
      <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.832 4.584 2.236 6.353L4.07 28.055l6.878-2.106A12.94 12.94 0 0016 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22a10.93 10.93 0 01-5.62-1.546l-.402-.239-4.08 1.249 1.295-3.96-.26-.408A10.96 10.96 0 015 15c0-6.065 4.935-11 11-11s11 4.935 11 11-4.935 11-11 11zm5.98-8.002c-.327-.163-1.935-.954-2.235-1.063-.299-.108-.517-.163-.735.163s-.843 1.063-1.034 1.281-.381.245-.707.082c-.327-.163-1.379-.508-2.627-1.62-.971-.866-1.626-1.937-1.817-2.264-.19-.327-.02-.504.144-.667.147-.146.327-.381.49-.571.163-.19.218-.327.327-.544.108-.218.054-.408-.027-.571-.082-.163-.735-1.77-1.007-2.424-.265-.637-.536-.55-.735-.56l-.626-.011c-.218 0-.571.082-.87.408-.299.327-1.143 1.117-1.143 2.724s1.17 3.16 1.334 3.378c.163.218 2.303 3.515 5.582 4.93.78.337 1.39.538 1.865.689.784.249 1.498.214 2.062.13.629-.094 1.935-.79 2.208-1.554.272-.762.272-1.415.19-1.554-.081-.135-.298-.218-.625-.381z"/>
    </svg>
  )
}

export default function ObrigadoPage() {
  const { phone } = useParams()
  const [site, setSite] = useState(null)
  const [status, setStatus] = useState('loading') // loading | paid | unpaid | error
  const [copied, setCopied] = useState(false)

  const siteUrl = `${window.location.origin}/${phone}`

  useEffect(() => {
    if (!phone) { setStatus('error'); return }
    getSite(phone)
      .then(data => {
        if (!data) { setStatus('error'); return }
        setSite(data)
        setStatus(data.paid ? 'paid' : 'unpaid')
      })
      .catch(() => setStatus('error'))
  }, [phone])

  const waText = encodeURIComponent(
    `💕 Aqui está o seu presente especial!\n\nClique no link abaixo para abrir:\n${siteUrl}\n\nFeito com muito amor 💝`
  )
  const waUrl = `https://wa.me/?text=${waText}`

  const copy = () => {
    navigator.clipboard.writeText(siteUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  const partnerName = site?.quiz_data?.partnerName || ''
  const myName = site?.quiz_data?.myName || ''

  /* ── loading ── */
  if (status === 'loading') return (
    <div style={styles.root}>
      <div style={styles.content}>
        <div style={styles.spinner} />
      </div>
    </div>
  )

  /* ── not found ── */
  if (status === 'error') return (
    <div style={styles.root}>
      <div style={styles.content}>
        <div style={styles.errorBox}>
          <p style={{ fontSize: 40, marginBottom: 8 }}>😕</p>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Página não encontrada</p>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14 }}>Verifique o link e tente novamente.</p>
        </div>
      </div>
    </div>
  )

  /* ── not paid yet ── */
  if (status === 'unpaid') return (
    <div style={styles.root}>
      <div style={styles.content}>
        <img src="/cupido.png" alt="Cupido" style={styles.logo} />
        <div style={styles.badge}>⏳ Aguardando pagamento</div>
        <h1 style={styles.title}>Presente em processamento</h1>
        <p style={styles.sub}>Assim que o pagamento for confirmado, o site será liberado automaticamente. Isso leva alguns segundos.</p>
        <button style={styles.refreshBtn} onClick={() => window.location.reload()}>
          Verificar novamente
        </button>
      </div>
    </div>
  )

  /* ── paid / success ── */
  return (
    <div style={styles.root}>
      <div style={styles.content}>
        {/* logo */}
        <div style={styles.logoWrap}>
          <img src="/cupido.png" alt="Cupido" style={styles.logo} />
          <div style={styles.heartRing}>
            <Heart size={14} fill="#ff4d8d" color="#ff4d8d" />
          </div>
        </div>

        {/* badge */}
        <div style={styles.badge}>✅ Pagamento confirmado!</div>

        {/* title */}
        <h1 style={styles.title}>
          {partnerName ? `Presente de ${myName || 'você'} para ${partnerName}` : 'Presente desbloqueado!'}
        </h1>
        <p style={styles.sub}>O site personalizado está pronto e disponível para ser compartilhado.</p>

        {/* link box */}
        <div style={styles.linkBox}>
          <p style={styles.linkLabel}>Link do presente</p>
          <div style={styles.linkRow}>
            <span style={styles.linkText} title={siteUrl}>{siteUrl.replace('https://', '')}</span>
            <button style={styles.copyBtn} onClick={copy} title="Copiar link">
              {copied ? <Check size={16} color="#4ade80" /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        {/* QR code */}
        <div style={styles.qrWrap}>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(siteUrl)}`}
            alt="QR Code"
            width={130}
            height={130}
            style={styles.qr}
          />
          <p style={styles.qrLabel}>Aponte a câmera para abrir</p>
        </div>

        {/* WA button */}
        <a href={waUrl} target="_blank" rel="noreferrer" style={styles.waBtn}>
          <WaIcon />
          Salvar links no WhatsApp
        </a>

        {/* open site button */}
        <a href={siteUrl} target="_blank" rel="noreferrer" style={styles.openBtn}>
          <ExternalLink size={17} />
          Abrir presente
        </a>

        <p style={styles.footer}>
          Compartilhe o link ou o QR Code com quem você ama 💕
        </p>
      </div>
    </div>
  )
}

const styles = {
  root: {
    minHeight: '100dvh',
    background: 'linear-gradient(160deg, #1a0533 0%, #3b0764 40%, #1e0a3c 100%)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '0 0 40px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    overflowX: 'hidden',
  },
  content: {
    width: '100%',
    maxWidth: 420,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '32px 20px 20px',
    gap: 0,
  },
  logoWrap: {
    position: 'relative',
    marginBottom: 20,
  },
  logo: {
    width: 90,
    height: 90,
    objectFit: 'contain',
    filter: 'drop-shadow(0 0 18px rgba(255,100,200,0.5))',
  },
  heartRing: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    background: '#1a0533',
    borderRadius: '50%',
    padding: 5,
    border: '2px solid rgba(255,77,141,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 99,
    padding: '6px 16px',
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 18,
    letterSpacing: 0.2,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 800,
    textAlign: 'center',
    margin: '0 0 10px',
    lineHeight: 1.3,
  },
  sub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    textAlign: 'center',
    margin: '0 0 24px',
    lineHeight: 1.6,
  },
  linkBox: {
    width: '100%',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 14,
    padding: '14px 16px',
    marginBottom: 20,
  },
  linkLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    margin: '0 0 8px',
  },
  linkRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  linkText: {
    flex: 1,
    color: '#e879f9',
    fontSize: 13,
    fontWeight: 600,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  copyBtn: {
    flexShrink: 0,
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    borderRadius: 8,
    padding: '6px 10px',
    cursor: 'pointer',
    color: 'rgba(255,255,255,0.7)',
    display: 'flex',
    alignItems: 'center',
  },
  qrWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  qr: {
    borderRadius: 12,
    border: '3px solid rgba(255,255,255,0.15)',
  },
  qrLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    margin: 0,
  },
  waBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    background: 'linear-gradient(135deg, #25d366, #128c7e)',
    color: '#fff',
    fontWeight: 700,
    fontSize: 16,
    textDecoration: 'none',
    borderRadius: 14,
    padding: '15px 20px',
    marginBottom: 12,
    boxShadow: '0 4px 24px rgba(37,211,102,0.35)',
    transition: 'opacity 0.15s',
  },
  openBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    background: 'rgba(255,255,255,0.08)',
    border: '1.5px solid rgba(255,255,255,0.2)',
    color: 'rgba(255,255,255,0.85)',
    fontWeight: 600,
    fontSize: 15,
    textDecoration: 'none',
    borderRadius: 14,
    padding: '13px 20px',
    marginBottom: 24,
    transition: 'background 0.15s',
  },
  footer: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 13,
    textAlign: 'center',
    margin: 0,
    lineHeight: 1.6,
  },
  errorBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 20px',
  },
  spinner: {
    width: 40,
    height: 40,
    border: '3px solid rgba(255,255,255,0.15)',
    borderTopColor: '#e879f9',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  refreshBtn: {
    marginTop: 24,
    background: 'rgba(255,255,255,0.1)',
    border: '1.5px solid rgba(255,255,255,0.25)',
    borderRadius: 12,
    color: '#fff',
    fontWeight: 600,
    fontSize: 15,
    padding: '12px 28px',
    cursor: 'pointer',
  },
}
