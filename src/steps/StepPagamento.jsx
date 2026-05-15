import { useState, useEffect, useCallback } from 'react'
import { useQuiz } from '../context/QuizContext'
import { ChevronDown, ChevronUp, Shield, Lock, RefreshCw, Copy, Check, Loader } from 'lucide-react'
import { saveSite, markPaid, updateSiteData, uploadFromPreview, getAppConfig } from '../lib/supabase'
import { QR_TEMPLATES, SiteQRCard } from '../components/QRCard'

const BASE_PRICE = 19.90
const QR_EXTRA   = 2.90
const TOKEN      = import.meta.env.VITE_PUSHINPAY_TOKEN

/* ── PIX image ────────────────────────────────────────────────── */
function PixLogo({ size = 26, white = false }) {
  const [failed, setFailed] = useState(false)
  if (failed) return (
    <span style={{ fontSize: size * 0.55, fontWeight: 900, color: white ? 'white' : '#00b09b', letterSpacing: -1, lineHeight: 1 }}>PIX</span>
  )
  return (
    <img
      src="/pix.png"
      width={size}
      height={size}
      alt="PIX"
      onError={() => setFailed(true)}
      style={{ objectFit: 'contain', filter: white ? 'brightness(0) invert(1)' : 'none' }}
    />
  )
}

/* ── Reviews ──────────────────────────────────────────────────── */
const REVIEWS = [
  { name: 'Fernanda Lima',   city: 'São Paulo, SP',          text: 'Fiz o presente e ela chorou tanto que até eu me emocionei. A música e as fotos juntas ficaram perfeitas!', color: ['#f9a8d4','#ec4899'], initials: 'FL' },
  { name: 'Carla Mendes',    city: 'Belo Horizonte, MG',     text: 'Comprei para o aniversário do meu marido e ele ficou completamente sem palavras. Superou todas as expectativas.', color: ['#c4b5fd','#7c3aed'], initials: 'CM' },
  { name: 'Ana Beatriz',     city: 'Rio de Janeiro, RJ',     text: 'Nunca imaginei que um presente digital poderia ser tão especial. Valeu muito a pena cada centavo!', color: ['#fca5a5','#ef4444'], initials: 'AB' },
  { name: 'Juliana Costa',   city: 'Curitiba, PR',           text: 'Perfeito para o Dia dos Namorados. Ele ficou emocionado com cada detalhe. Vou comprar de novo!', color: ['#86efac','#16a34a'], initials: 'JC' },
  { name: 'Mariana Silva',   city: 'Brasília, DF',           text: 'Fiz às 23h e em minutos estava tudo pronto. Qualidade incrível pelo preço. Minha melhor compra do ano!', color: ['#fcd34d','#d97706'], initials: 'MS' },
]

function ReviewCarousel() {
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIdx(i => (i + 1) % REVIEWS.length)
        setVisible(true)
      }, 350)
    }, 4500)
    return () => clearInterval(t)
  }, [])

  const r = REVIEWS[idx]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      {/* avatar */}
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: `linear-gradient(135deg, ${r.color[0]}, ${r.color[1]})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 6px 24px ${r.color[1]}55`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.85)',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
      }}>
        <span style={{ fontSize: 22, fontWeight: 900, color: 'white', letterSpacing: -1 }}>{r.initials}</span>
      </div>

      {/* name + stars */}
      <div style={{ textAlign: 'center', opacity: visible ? 1 : 0, transition: 'opacity 0.35s ease' }}>
        <p style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginBottom: 2 }}>{r.name}</p>
        <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>{r.city}</p>
        <p style={{ color: '#FBBF24', fontSize: 18, letterSpacing: 2 }}>★★★★★</p>
      </div>

      {/* text */}
      <div style={{
        background: '#f9fafb', borderRadius: 16, padding: '14px 18px',
        width: '100%', textAlign: 'center',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
      }}>
        <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, fontStyle: 'italic' }}>"{r.text}"</p>
      </div>

    </div>
  )
}

/* ── WhatsApp mask ────────────────────────────────────────────── */
function maskWA(v) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (!d) return ''
  if (d.length <= 2)  return `(${d}`
  if (d.length <= 7)  return `(${d.slice(0,2)}) ${d.slice(2)}`
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
}


/* ── PushinPay helpers ────────────────────────────────────────── */
async function createPix(amountCents) {
  const res = await fetch('/api/pushinpay?path=/api/pix/cashIn', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ value: amountCents }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`PushinPay ${res.status}: ${text}`)
  }
  return res.json()
}

async function checkPix(id) {
  const res = await fetch(`/api/pushinpay?path=/api/pix/cashIn/${id}`, {
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Accept': 'application/json',
    },
  })
  if (!res.ok) throw new Error(`PushinPay ${res.status}`)
  return res.json()
}

/* ── Success screen ───────────────────────────────────────────── */
function SuccessScreen({ partnerName, siteUrl, digits, selectedQR, onNext }) {
  const [copied, setCopied] = useState(false)
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(siteUrl)}&format=png&margin=12&color=000000&bgcolor=FFFFFF`

  const copyLink = () => {
    navigator.clipboard.writeText(siteUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  const downloadQR = async () => {
    try {
      const res = await fetch(qrImageUrl)
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `presente-${digits}.png`
      a.click()
      URL.revokeObjectURL(blobUrl)
    } catch {
      window.open(qrImageUrl, '_blank')
    }
  }

  return (
    <div className="step-root" style={{ background: '#fff' }}>
      <div className="step-scroll flex flex-col items-center gap-5 px-4 pb-10">
        <div className="w-full h-2 bg-green-500 rounded-full mt-2" />

        <div className="text-center mt-2">
          <div style={{ fontSize: 52, lineHeight: 1 }}>🎉</div>
          <p className="text-[22px] font-black text-gray-900 mt-3">Pagamento confirmado!</p>
          <p className="text-[14px] text-gray-500 mt-1">
            O presente de <span className="font-bold text-gray-800">{partnerName}</span> está pronto!
          </p>
        </div>

        <div className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col gap-2">
          <p className="text-[11px] font-bold text-purple-600 tracking-widest">LINK DO PRESENTE</p>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5">
            <p className="flex-1 text-[13px] text-gray-700 font-mono truncate">{siteUrl}</p>
            <button onClick={copyLink} className="shrink-0 active:scale-90 transition-all">
              {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} className="text-purple-500" />}
            </button>
          </div>
          {copied && <p className="text-[11px] text-green-500 text-center">Link copiado!</p>}
          <a href={siteUrl} target="_blank" rel="noopener noreferrer"
            className="w-full mt-1 bg-purple-600 text-white rounded-xl py-3 font-bold text-[14px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all no-underline">
            Abrir meu site ↗
          </a>
        </div>

        <div className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col items-center gap-3">
          <p className="text-[11px] font-bold text-purple-600 tracking-widest self-start">QR CODE DO PRESENTE</p>
          <SiteQRCard style={selectedQR} siteUrl={siteUrl} />
          <p className="text-[12px] text-gray-400 text-center">
            Quando {partnerName} escanear, abre direto o presente personalizado.
          </p>
          <button onClick={downloadQR}
            className="w-full bg-gray-800 text-white rounded-xl py-3 font-bold text-[14px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
            Baixar QR Code
          </button>
        </div>

        <button onClick={onNext}
          className="w-full border-2 border-purple-600 text-purple-600 rounded-2xl py-3.5 font-black text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
          Ver prévia completa do presente ›
        </button>
      </div>
    </div>
  )
}

function firePixel(event, params) {
  if (typeof window?.fbq === 'function') window.fbq('track', event, params)
  // TikTok — map FB events to TikTok standard events
  if (typeof window?.ttq !== 'undefined') {
    const ttqEvent = event === 'Purchase' ? 'CompletePayment' : 'InitiateCheckout'
    window.ttq.track(ttqEvent, { value: params.value, currency: params.currency, content_name: params.content_name })
  }
}

async function fireCAPI(eventName, customData) {
  try {
    const [pixelId, accessToken] = await Promise.all([
      getAppConfig('pixel_id'),
      getAppConfig('fb_access_token'),
    ])
    if (!pixelId || !accessToken) return
    await fetch('/api/fbcapi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pixel_id: pixelId,
        access_token: accessToken,
        events: [{
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_source_url: window.location.href,
          action_source: 'website',
          user_data: { client_user_agent: navigator.userAgent },
          custom_data: customData,
        }],
      }),
    })
  } catch {}
}

/* ── Edit-mode save screen ────────────────────────────────────── */
function EditSaveScreen({ editPhone, siteUrl, data, buildQuizData, onBack }) {
  const [saving, setSaving] = useState(false)
  const [errMsg, setErrMsg] = useState('')

  const handleSave = async () => {
    setSaving(true)
    setErrMsg('')
    try {
      const quizData = await buildQuizData()
      await updateSiteData(editPhone, quizData)
      window.location.href = `/obrigado/${editPhone}`
    } catch {
      setErrMsg('Erro ao salvar. Tente novamente.')
      setSaving(false)
    }
  }

  return (
    <div className="step-root" style={{ background: '#f8f5ff' }}>
      <div className="step-scroll flex flex-col items-center justify-center gap-6 px-6 pb-12 text-center">
        <div style={{ fontSize: 56 }}>✏️</div>
        <div>
          <p className="text-[22px] font-black text-gray-900">Salvar Alterações</p>
          <p className="text-[14px] text-gray-500 mt-2 leading-relaxed">
            As mudanças serão aplicadas ao presente em{' '}
            <strong style={{ color: '#7c3aed' }}>/{editPhone}</strong>.
          </p>
        </div>
        <div className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-left" style={{ maxWidth: 360 }}>
          <p className="text-[10px] font-bold text-purple-500 tracking-widest mb-3">RESUMO DAS ALTERAÇÕES</p>
          <div className="flex flex-col gap-2">
            <p className="text-[13px] text-gray-700">👫 Casal: <strong>{[data.myName, data.partnerName].filter(Boolean).join(' & ') || '—'}</strong></p>
            <p className="text-[13px] text-gray-700">✏️ Título: <strong>{data.title || '(sem título)'}</strong></p>
            <p className="text-[13px] text-gray-700">📅 Data: <strong>{data.relationshipStart || '—'}</strong></p>
            {data.wrappedSections?.length > 0 && (
              <p className="text-[13px] text-gray-700">🎁 Seções: <strong>{data.wrappedSections.length} extra{data.wrappedSections.length !== 1 ? 's' : ''}</strong></p>
            )}
          </div>
        </div>
        {errMsg && <p className="text-[13px] text-red-500 font-semibold">{errMsg}</p>}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-purple-600 text-white rounded-2xl py-4 font-black text-[16px] active:scale-[0.98] transition-all disabled:opacity-60"
          style={{ maxWidth: 360 }}
        >
          {saving ? '⏳ Salvando...' : '💾 Salvar Alterações'}
        </button>
        <button onClick={onBack} className="text-[13px] text-gray-400 underline">
          ← Voltar e editar mais
        </button>
      </div>
    </div>
  )
}

/* ── Main ─────────────────────────────────────────────────────── */
export default function StepPagamento({ onNext, onBack }) {
  const { data } = useQuiz()

  const [wa,         setWa]         = useState('')
  const [selectedQR, setSelectedQR] = useState(0)
  const [couponOpen, setCouponOpen] = useState(false)
  const [coupon,     setCoupon]     = useState('')

  const [screen,  setScreen]  = useState('form')
  const [pixData, setPixData] = useState(null)
  const [errMsg,  setErrMsg]  = useState('')
  const [copied,  setCopied]  = useState(false)

  const formatted = maskWA(wa)
  const digits    = wa.replace(/\D/g, '')
  const waValid   = digits.length === 11

  const extra    = QR_TEMPLATES[selectedQR].price
  const total    = BASE_PRICE + extra
  const totalStr = `R$ ${total.toFixed(2).replace('.', ',')}`
  const cents    = Math.round(total * 100)

  const isDemoMode  = Boolean(data.__demoMode)
  const isEditMode  = Boolean(data.__editPhone)
  const editPhone   = data.__editPhone || ''
  const partnerName = data.partnerName || 'ela'
  const siteUrl     = isDemoMode
    ? `${window.location.origin}/demo`
    : isEditMode ? `${window.location.origin}/${editPhone}`
    : waValid ? `${window.location.origin}/${digits}` : ''

  useEffect(() => {
    if (isEditMode) return // não dispara pixel em edição
    const p = { value: BASE_PRICE, currency: 'BRL', content_name: 'Presente de Casal' }
    firePixel('InitiateCheckout', p)
    fireCAPI('InitiateCheckout', { ...p, num_items: 1 })
  }, [])

  const buildQuizData = useCallback(async () => {
    const photos = await Promise.all(
      (data.photos || []).map(p => uploadFromPreview(p?.preview, 'photos').then(url => ({ preview: url })).catch(() => null))
    )
    const coverPhotoUrl = await uploadFromPreview(data.coverPhotoUrl, 'covers').catch(() => data.coverPhotoUrl || null)
    const galeriaPhotos = await Promise.all(
      (data.galeriaPhotos || []).map(p => {
        const url = typeof p === 'string' ? p : p?.preview || p?.url
        return uploadFromPreview(url, 'galeria').catch(() => url)
      })
    )
    return { ...data, photos: photos.filter(Boolean), coverPhoto: null, coverPhotoUrl, galeriaPhotos: galeriaPhotos.filter(Boolean), audio: null, qrTemplate: selectedQR }
  }, [data, selectedQR])

  const handleGerar = useCallback(async () => {
    if (!TOKEN) {
      setErrMsg('Token PushinPay não configurado. Adicione VITE_PUSHINPAY_TOKEN nas variáveis de ambiente.')
      setScreen('error')
      return
    }
    setScreen('loading')
    setErrMsg('')
    try {
      const quizData = await buildQuizData()
      await saveSite(digits, quizData).catch(() => {})
      const d = await createPix(cents)
      setPixData(d)
      setScreen('awaiting')
    } catch (e) {
      setErrMsg('Erro ao gerar o PIX. Verifique o token PushinPay e tente novamente.')
      setScreen('error')
    }
  }, [cents, digits, buildQuizData])

  useEffect(() => {
    if (screen !== 'awaiting' || !pixData?.id) return
    const id = setInterval(async () => {
      try {
        const d = await checkPix(pixData.id)
        if (d.status === 'paid' || d.status === 'PAID' || d.status === 'approved') {
          clearInterval(id)
          await markPaid(digits).catch(() => {})
          const purchaseParams = { value: total, currency: 'BRL', content_name: 'Presente de Casal' }
          firePixel('Purchase', purchaseParams)
          fireCAPI('Purchase', { ...purchaseParams, num_items: 1 })
          window.location.href = `/obrigado/${digits}`
        }
      } catch {}
    }, 3000)
    return () => clearInterval(id)
  }, [screen, pixData, digits])

  const copyPix = () => {
    if (!pixData?.qr_code) return
    navigator.clipboard.writeText(pixData.qr_code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  /* ── edit bypass (must come before screen checks) ── */
  if (isEditMode) return <EditSaveScreen editPhone={editPhone} siteUrl={siteUrl} data={data} buildQuizData={buildQuizData} onBack={onBack} />

  /* ── loading ── */
  if (screen === 'loading') return (
    <div className="step-root">
      <div className="step-scroll flex flex-col items-center justify-center gap-5">
        <Loader size={40} className="text-purple-500 animate-spin" />
        <p className="text-[16px] font-bold text-gray-700">Gerando seu PIX...</p>
        <p className="text-[13px] text-gray-400">Aguarde um instante</p>
      </div>
    </div>
  )

  /* ── error ── */
  if (screen === 'error') return (
    <div className="step-root">
      <div className="step-scroll flex flex-col items-center justify-center gap-5 px-6 text-center">
        <div style={{ fontSize: 52 }}>😕</div>
        <p className="text-[16px] font-bold text-gray-800">{errMsg}</p>
        <button onClick={() => setScreen('form')}
          className="bg-purple-600 text-white rounded-2xl px-8 py-3 font-bold text-[14px] active:scale-95 transition-all">
          Tentar novamente
        </button>
      </div>
    </div>
  )

  /* ── aguardando ── */
  if (screen === 'awaiting') return (
    <div className="step-root">
      <div className="step-scroll flex flex-col items-center gap-5 px-4">
        <div className="w-full h-2 bg-purple-600 rounded-full mt-2" />
        <p className="text-[20px] font-black text-gray-900 text-center mt-2">Escaneie o QR Code PIX</p>
        <p className="text-[13px] text-gray-500 text-center -mt-2">Abra o app do seu banco e pague com PIX</p>

        <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col items-center gap-4 w-full">
          {pixData?.qr_code_base64 ? (
            <img src={pixData.qr_code_base64.startsWith('data:') ? pixData.qr_code_base64 : `data:image/png;base64,${pixData.qr_code_base64}`} width={200} height={200} alt="PIX QR" className="rounded-lg" />
          ) : (
            <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center">
              <Loader size={32} className="text-gray-400 animate-spin" />
            </div>
          )}
          <div className="text-center">
            <p className="text-[13px] text-gray-500">Valor a pagar</p>
            <p className="text-[24px] font-black text-gray-900">{totalStr}</p>
          </div>
          {pixData?.qr_code && (
            <div className="w-full">
              <p className="text-[11px] text-gray-400 text-center mb-2">PIX copia e cola</p>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                <p className="flex-1 text-[11px] text-gray-500 truncate font-mono">{pixData.qr_code}</p>
                <button onClick={copyPix} className="shrink-0 active:scale-90 transition-all">
                  {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-purple-500" />}
                </button>
              </div>
              {copied && <p className="text-[11px] text-green-500 text-center mt-1">Copiado!</p>}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 w-full">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse shrink-0" />
          <p className="text-[13px] text-yellow-700 font-semibold">Aguardando confirmação do pagamento...</p>
        </div>
        <p className="text-[11px] text-gray-400 text-center">O pagamento é confirmado automaticamente em segundos após o Pix.</p>
        <button onClick={() => setScreen('form')} className="text-[12px] text-gray-400 underline pb-6">Voltar e alterar dados</button>
      </div>
    </div>
  )

  /* ── success ── */
  if (screen === 'success') return <SuccessScreen partnerName={partnerName} siteUrl={siteUrl} digits={isDemoMode ? 'demo' : digits} selectedQR={selectedQR} onNext={onNext} />

  /* ── demo bypass (skip PIX) ── */
  if (isDemoMode) return (
    <div className="step-root" style={{ background: '#f8f5ff' }}>
      <div className="step-scroll flex flex-col items-center justify-center gap-6 px-6 pb-12 text-center">
        <div style={{ fontSize: 56 }}>🎯</div>
        <div>
          <p className="text-[22px] font-black text-gray-900">Salvar Demonstração</p>
          <p className="text-[14px] text-gray-500 mt-2 leading-relaxed">
            O site ficará disponível em <strong style={{ color: '#7c3aed' }}>/demo</strong> para qualquer pessoa visualizar como exemplo.
          </p>
        </div>
        <div className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-left" style={{ maxWidth: 360 }}>
          <p className="text-[10px] font-bold text-purple-500 tracking-widest mb-3">RESUMO DA DEMONSTRAÇÃO</p>
          <div className="flex flex-col gap-2">
            <p className="text-[13px] text-gray-700">👫 Casal: <strong>{[data.myName, data.partnerName].filter(Boolean).join(' & ') || '—'}</strong></p>
            <p className="text-[13px] text-gray-700">✏️ Título: <strong>{data.title || '(sem título)'}</strong></p>
            <p className="text-[13px] text-gray-700">📅 Data: <strong>{data.relationshipStart || '—'}</strong></p>
            {data.wrappedSections?.length > 0 && (
              <p className="text-[13px] text-gray-700">🎁 Seções: <strong>{data.wrappedSections.length} extra{data.wrappedSections.length !== 1 ? 's' : ''}</strong></p>
            )}
          </div>
        </div>
        <button
          onClick={async () => {
            setScreen('loading')
            try {
              const quizData = await buildQuizData()
              await saveSite('demo', quizData)
              await markPaid('demo').catch(() => {})
              window.location.href = '/obrigado/demo'
            } catch {
              setErrMsg('Erro ao salvar demonstração. Verifique o Supabase.')
              setScreen('error')
            }
          }}
          className="w-full bg-purple-600 text-white rounded-2xl py-4 font-black text-[16px] active:scale-[0.98] transition-all"
          style={{ maxWidth: 360 }}
        >
          💾 Salvar como demonstração
        </button>
        <button onClick={onBack} className="text-[13px] text-gray-400 underline">
          ← Voltar e editar mais
        </button>
      </div>
    </div>
  )

  /* ════════════ FORMULÁRIO ════════════ */
  return (
    <div className="step-root">
      <div className="step-scroll flex flex-col">
        <div className="w-full h-2 bg-purple-600 rounded-full mt-2 mb-6" />

        {/* hero header */}
        <div className="flex flex-col items-center text-center mb-5">
          <img src="/cupido.png" alt="" style={{ width: 200, height: 200, objectFit: 'contain', marginBottom: -10 }} />
          <p className="text-[22px] font-black text-gray-900 leading-tight">Presente quase pronto!</p>
          <p className="text-[14px] text-gray-500 mt-1.5 leading-relaxed">
            Preencha abaixo e surpreenda{' '}
            <span className="font-bold text-gray-800">{partnerName}</span> com algo inesquecível.
          </p>
        </div>

        {/* resumo */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 pt-4 pb-3">
            <p className="text-[15px] font-black text-gray-900 mb-3">Resumo do pedido</p>
            <div className="flex items-center justify-between text-[14px]">
              <span className="text-gray-600">Plano Vitalício — Para Sempre</span>
              <span className="font-semibold text-gray-800">R$ 19,90</span>
            </div>
            {extra > 0 && (
              <div className="flex items-center justify-between text-[14px] mt-1">
                <span className="text-gray-600">QR code personalizado</span>
                <span className="font-semibold text-gray-800">+ R$ 2,90</span>
              </div>
            )}
            <div className="border-t border-gray-100 mt-3 pt-3 flex items-center justify-between">
              <span className="text-[15px] font-black text-gray-900">Total:</span>
              <span className="text-[18px] font-black text-gray-900">{totalStr}</span>
            </div>
          </div>
          <button onClick={() => setCouponOpen(v => !v)}
            className="w-full flex items-center gap-2 px-4 py-3 border-t border-gray-100 text-[13px] text-purple-600 font-semibold">
            Possui um cupom de desconto?
            {couponOpen ? <ChevronUp size={14} className="ml-auto"/> : <ChevronDown size={14} className="ml-auto"/>}
          </button>
          {couponOpen && (
            <div className="px-4 pb-4 flex gap-2">
              <input value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())}
                placeholder="Digite seu cupom"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-purple-400" />
              <button className="bg-purple-600 text-white text-[13px] font-bold px-4 rounded-xl">Aplicar</button>
            </div>
          )}
        </div>

        {/* whatsapp */}
        <div className="mt-5">
          <p className="text-[11px] font-bold text-purple-600 tracking-widest mb-2">SEUS DADOS</p>
          <div className="bg-white rounded-2xl shadow-sm px-4 py-3">
            <input type="tel" placeholder="WhatsApp com DDD"
              value={formatted} onChange={e => setWa(e.target.value)}
              className="w-full outline-none text-[14px] text-gray-700 py-1 placeholder-gray-300" />
          </div>
          {waValid && (
            <div className="mt-2 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
              <span className="text-green-500 font-bold text-[14px]">✓</span>
              <p className="text-[12px] text-gray-600 flex-1">
                Confirmar: <strong>{formatted}</strong> — Esse é o número correto?
              </p>
            </div>
          )}
        </div>

        {/* pix info */}
        <div className="mt-5">
          <p className="text-[11px] font-bold text-purple-600 tracking-widest mb-2">FORMA DE PAGAMENTO</p>
          <div className="flex items-center gap-3 bg-teal-50 border border-teal-100 rounded-2xl px-4 py-3">
            <PixLogo size={28} />
            <div>
              <p className="text-[13px] font-bold text-teal-800">Pagamento via PIX</p>
              <p className="text-[12px] text-teal-600">Ao clicar, seu PIX é gerado na hora — pague escaneando o QR Code ou use o código copia e cola direto no seu banco.</p>
            </div>
          </div>
        </div>

        {/* QR personalizado */}
        <div className="mt-5 bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 pt-3.5 pb-1">
            <p className="text-[14px] font-bold text-gray-800">QR code personalizado ♥</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Escolha o estilo do QR que será entregue</p>
          </div>
          <div className="pb-4 pt-2">
            <div className="flex gap-3 overflow-x-auto px-4 pb-1" style={{scrollbarWidth:'none'}}>
              {QR_TEMPLATES.map(({ id, Component, label }) => (
                <div key={id} className="flex flex-col items-center gap-1.5 shrink-0">
                  <button onClick={() => setSelectedQR(id)}
                    style={{outline: selectedQR===id ? '2.5px solid #7c3aed' : '2.5px solid transparent', borderRadius:16, transition:'outline 0.15s'}}>
                    <Component />
                  </button>
                  <span className={`text-[11px] font-bold px-3 py-0.5 rounded-full ${selectedQR===id ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-5">
          <button onClick={handleGerar}
            className="btn-pulse w-full text-white rounded-2xl py-4 font-black text-[16px] flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
            style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', boxShadow: '0 8px 24px rgba(22,163,74,0.4)' }}>
            <PixLogo size={24} white />
            Gerar PIX · {totalStr}
          </button>
          <div className="flex items-center justify-center gap-4 mt-3">
            <span className="flex items-center gap-1 text-[11px] text-gray-400"><Shield size={11}/> Compra segura</span>
            <span className="flex items-center gap-1 text-[11px] text-gray-400"><Lock size={11}/> Dados protegidos</span>
            <span className="flex items-center gap-1 text-[11px] text-gray-400"><RefreshCw size={11}/> Pagamento único</span>
          </div>
        </div>

        {/* reviews */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm p-5">
          <div className="text-center mb-5">
            <span className="text-[11px] bg-purple-50 text-purple-700 px-4 py-1.5 rounded-full font-bold uppercase tracking-wide">
              + de 50.000 casais felizes
            </span>
          </div>
          <ReviewCarousel />
        </div>

        {/* footer */}
        <div className="mt-8 flex flex-col items-center text-center gap-2 pb-10 px-2">
          <p className="text-[13px] font-bold text-gray-700">Cupid Presentes</p>
          <p className="text-[12px] text-gray-500 leading-relaxed">
            Criamos experiências únicas para eternizar momentos especiais com{' '}
            <span className="text-purple-500">presentes virtuais e personalizados</span>.
          </p>
          <div className="flex items-center gap-3 mt-1">
            <button className="text-[11px] text-gray-400 underline">Termos de Uso</button>
            <span className="text-gray-300">•</span>
            <button className="text-[11px] text-gray-400 underline">Política de Privacidade</button>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">LOVECUPID LTDA — CNPJ: 60.623.888/0001-40 — Pires do Rio/GO</p>
          <p className="text-[10px] text-gray-400">Feito com amor no Brasil · © 2025 Cupid Presentes</p>
        </div>
      </div>
    </div>
  )
}
