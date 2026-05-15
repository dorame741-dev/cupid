import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { getSite } from '../lib/supabase'
import { Check, Copy, ExternalLink, Download, Pencil } from 'lucide-react'

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
  const [status, setStatus] = useState('loading')
  const [copied, setCopied] = useState(false)
  const [copiedEdit, setCopiedEdit] = useState(false)
  const [qrLoaded, setQrLoaded] = useState(false)
  const qrRef = useRef(null)

  const origin  = window.location.origin
  const siteUrl = `${origin}/${phone}`
  const editUrl = `${origin}/edit/${phone}`
  const qrSrc   = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(siteUrl)}&margin=12&color=000000&bgcolor=FFFFFF`

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

  const copy = (text, setter) => {
    navigator.clipboard.writeText(text).then(() => {
      setter(true)
      setTimeout(() => setter(false), 2500)
    })
  }

  const downloadQR = async () => {
    try {
      const res = await fetch(qrSrc)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `qrcode-presente-${phone}.png`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      window.open(qrSrc, '_blank')
    }
  }

  const partnerName = site?.quiz_data?.partnerName || ''
  const myName      = site?.quiz_data?.myName || ''

  /* ── loading ── */
  if (status === 'loading') return (
    <div style={S.root}>
      <div style={S.content}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={S.spinner} />
      </div>
    </div>
  )

  /* ── not found ── */
  if (status === 'error') return (
    <div style={S.root}>
      <div style={S.content}>
        <div style={S.errorBox}>
          <p style={{ fontSize: 40, marginBottom: 8 }}>😕</p>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Página não encontrada</p>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14 }}>Verifique o link e tente novamente.</p>
        </div>
      </div>
    </div>
  )

  /* ── not paid yet ── */
  if (status === 'unpaid') return (
    <div style={S.root}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={S.content}>
        <img src="/cupido.png" alt="Cupido" style={S.logo} />
        <div style={S.badge}>⏳ Aguardando pagamento</div>
        <h1 style={S.title}>Presente em processamento</h1>
        <p style={S.sub}>Assim que o pagamento for confirmado, o site será liberado automaticamente. Isso leva alguns segundos.</p>
        <button style={S.refreshBtn} onClick={() => window.location.reload()}>
          Verificar novamente
        </button>
      </div>
    </div>
  )

  /* ── paid / success ── */
  return (
    <div style={S.root}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={S.content}>

        {/* logo grande */}
        <img src="/cupido.png" alt="Cupido" style={S.logo} />

        {/* badge */}
        <div style={S.badge}>✅ Pagamento confirmado!</div>

        {/* title */}
        <h1 style={S.title}>
          {partnerName ? `Presente de ${myName || 'você'} para ${partnerName}` : 'Presente desbloqueado!'}
        </h1>
        <p style={S.sub}>O site personalizado está pronto e disponível para ser compartilhado.</p>

        {/* link do presente */}
        <div style={S.linkBox}>
          <p style={S.linkLabel}>Link do presente</p>
          <div style={S.linkRow}>
            <span style={S.linkText} title={siteUrl}>{siteUrl.replace('https://', '')}</span>
            <button style={S.iconBtn} onClick={() => copy(siteUrl, setCopied)} title="Copiar link">
              {copied ? <Check size={15} color="#4ade80" /> : <Copy size={15} />}
            </button>
          </div>
        </div>

        {/* link de edição */}
        <div style={{ ...S.linkBox, marginTop: -12, marginBottom: 24, borderTop: '1px solid rgba(255,255,255,0.08)', borderRadius: '0 0 14px 14px', borderTopLeftRadius: 0, borderTopRightRadius: 0, paddingTop: 12 }}>
          <p style={{ ...S.linkLabel, color: 'rgba(232,121,249,0.6)' }}>Link para editar</p>
          <div style={S.linkRow}>
            <span style={{ ...S.linkText, color: 'rgba(232,121,249,0.7)', fontSize: 12 }} title={editUrl}>{editUrl.replace('https://', '')}</span>
            <button style={{ ...S.iconBtn, color: 'rgba(232,121,249,0.7)' }} onClick={() => copy(editUrl, setCopiedEdit)} title="Copiar link de edição">
              {copiedEdit ? <Check size={15} color="#4ade80" /> : <Copy size={15} />}
            </button>
            <a href={editUrl} style={{ ...S.iconBtn, color: 'rgba(232,121,249,0.7)', textDecoration: 'none', display: 'flex', alignItems: 'center' }} title="Abrir edição">
              <Pencil size={14} />
            </a>
          </div>
        </div>

        {/* QR code */}
        <div style={S.qrWrap}>
          <img
            ref={qrRef}
            src={qrSrc}
            alt="QR Code"
            width={160}
            height={160}
            style={S.qr}
            onLoad={() => setQrLoaded(true)}
            crossOrigin="anonymous"
          />
          <p style={S.qrLabel}>Aponte a câmera para abrir</p>
          <button style={S.downloadBtn} onClick={downloadQR} disabled={!qrLoaded}>
            <Download size={15} />
            Baixar QR Code
          </button>
        </div>

        {/* WA button */}
        <a href={waUrl} target="_blank" rel="noreferrer" style={S.waBtn}>
          <WaIcon />
          Salvar links no WhatsApp
        </a>

        {/* open site button */}
        <a href={siteUrl} target="_blank" rel="noreferrer" style={S.openBtn}>
          <ExternalLink size={17} />
          Abrir presente
        </a>

        <p style={S.footer}>
          Compartilhe o link ou o QR Code com quem você ama 💕
        </p>
      </div>
    </div>
  )
}

const S = {
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
    padding: '28px 20px 20px',
  },
  logo: {
    width: 150,
    height: 150,
    objectFit: 'contain',
    filter: 'drop-shadow(0 0 28px rgba(255,100,200,0.55))',
    marginBottom: 20,
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
    marginBottom: 0,
    boxSizing: 'border-box',
  },
  linkLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1,
    margin: '0 0 8px',
  },
  linkRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
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
  iconBtn: {
    flexShrink: 0,
    background: 'rgba(255,255,255,0.08)',
    border: 'none',
    borderRadius: 8,
    padding: '6px 9px',
    cursor: 'pointer',
    color: 'rgba(255,255,255,0.65)',
    display: 'flex',
    alignItems: 'center',
  },
  qrWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },
  qr: {
    borderRadius: 14,
    border: '3px solid rgba(255,255,255,0.15)',
    display: 'block',
  },
  qrLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    margin: 0,
  },
  downloadBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: 10,
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    fontWeight: 600,
    padding: '8px 18px',
    cursor: 'pointer',
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
    boxSizing: 'border-box',
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
    boxSizing: 'border-box',
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
