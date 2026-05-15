import { useState, useEffect, useCallback } from 'react'
import PandaMascot from '../components/PandaMascot'
import { useQuiz } from '../context/QuizContext'
import { ChevronDown, ChevronUp, Shield, Lock, RefreshCw, Copy, Check, Loader } from 'lucide-react'
import { saveSite, markPaid, uploadFromPreview } from '../lib/supabase'

const BASE_PRICE = 19.90
const QR_EXTRA   = 4.90
const TOKEN      = import.meta.env.VITE_PUSHINPAY_TOKEN

const REVIEWS = [
  { name: 'Fernanda L.', text: '"Fácil de fazer e o resultado final fica incrível. Recomendo demais!"' },
  { name: 'Carla',       text: '"Fiz pro nosso aniversário e ele ficou sem palavras. A música completou tudo!"' },
]

/* ── WhatsApp mask ────────────────────────────────────────────── */
function maskWA(v) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (!d) return ''
  if (d.length <= 2)  return `(${d}`
  if (d.length <= 7)  return `(${d.slice(0,2)}) ${d.slice(2)}`
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
}

/* ── QR card thumbnails ───────────────────────────────────────── */
const QR_PH = 'https://api.qrserver.com/v1/create-qr-code/?size=72x72&data=https://meupresente.app'

function QRThumb0() {
  return (
    <div style={{width:96,height:126,background:'#fff',border:'2px solid #e5e7eb',borderRadius:12,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:4,padding:8}}>
      <img src={QR_PH} width={72} height={72} alt="" style={{borderRadius:4}} />
      <p style={{fontSize:10,color:'#9ca3af',fontWeight:600}}>Simples</p>
    </div>
  )
}
function QRThumb1() {
  return (
    <div style={{width:96,height:126,background:'linear-gradient(145deg,#ff6b8a,#e8365d)',borderRadius:12,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:3,padding:8,overflow:'hidden'}}>
      <span style={{fontSize:9,color:'rgba(255,255,255,0.9)',fontFamily:'cursive',textAlign:'center',lineHeight:1.2}}>Juntos para<br/>SEMPRE</span>
      <div style={{background:'white',borderRadius:8,padding:2}}><img src={QR_PH} width={60} height={60} alt="" /></div>
      <span style={{fontSize:8,color:'rgba(255,255,255,0.75)'}}>❤ SURPRESA ❤</span>
    </div>
  )
}
function QRThumb2() {
  return (
    <div style={{width:96,height:126,background:'linear-gradient(145deg,#fce4ec,#f8bbd0)',borderRadius:12,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:3,padding:8}}>
      <span style={{fontSize:8,color:'#c2185b',fontFamily:'cursive',textAlign:'center',lineHeight:1.2}}>Uma surpresa<br/>especial para você</span>
      <div style={{background:'white',borderRadius:'50%',padding:4,border:'2px solid #f48fb1'}}><img src={QR_PH} width={52} height={52} alt="" style={{borderRadius:'50%'}} /></div>
      <span style={{fontSize:11}}>💕</span>
    </div>
  )
}
function QRThumb3() {
  return (
    <div style={{width:96,height:126,background:'linear-gradient(145deg,#f9748f,#c0392b)',borderRadius:12,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:3,padding:8}}>
      <span style={{fontSize:8,color:'rgba(255,255,255,0.85)',fontFamily:'cursive',textAlign:'center'}}>Minha acessoria és você</span>
      <span style={{fontSize:11,color:'white',fontFamily:'cursive',fontWeight:'bold'}}>Surpreenda</span>
      <div style={{background:'white',borderRadius:8,padding:2}}><img src={QR_PH} width={52} height={52} alt="" /></div>
    </div>
  )
}

const QR_TEMPLATES = [
  { id:0, Component:QRThumb0, label:'GRÁTIS',  price:0 },
  { id:1, Component:QRThumb1, label:'R$ 4,90', price:QR_EXTRA },
  { id:2, Component:QRThumb2, label:'R$ 4,90', price:QR_EXTRA },
  { id:3, Component:QRThumb3, label:'R$ 4,90', price:QR_EXTRA },
]

/* ── Site QR card (entregável) ───────────────────────────────── */
function SiteQRCard({ style, siteUrl }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(siteUrl)}&color=000000&bgcolor=FFFFFF`
  if (style === 0) return (
    <div style={{background:'#fff',border:'2px solid #e5e7eb',borderRadius:16,padding:16,display:'flex',flexDirection:'column',alignItems:'center',gap:8,width:200}}>
      <img src={qrUrl} width={140} height={140} alt="QR" style={{borderRadius:8}} />
      <p style={{fontSize:11,color:'#6b7280',textAlign:'center'}}>Escaneie para abrir o presente</p>
    </div>
  )
  if (style === 1) return (
    <div style={{background:'linear-gradient(145deg,#ff6b8a,#e8365d)',borderRadius:16,padding:16,display:'flex',flexDirection:'column',alignItems:'center',gap:8,width:200}}>
      <p style={{fontSize:15,color:'white',fontFamily:'cursive',textAlign:'center',lineHeight:1.3}}>Juntos para SEMPRE</p>
      <div style={{background:'white',borderRadius:12,padding:6}}><img src={qrUrl} width={130} height={130} alt="QR" /></div>
      <p style={{fontSize:10,color:'rgba(255,255,255,0.85)',letterSpacing:2}}>❤ ESCANEIE AQUI ❤</p>
    </div>
  )
  if (style === 2) return (
    <div style={{background:'linear-gradient(145deg,#fce4ec,#f8bbd0)',borderRadius:16,padding:16,display:'flex',flexDirection:'column',alignItems:'center',gap:8,width:200}}>
      <p style={{fontSize:12,color:'#c2185b',fontFamily:'cursive',textAlign:'center',lineHeight:1.3}}>Uma surpresa especial para você</p>
      <div style={{background:'white',borderRadius:'50%',padding:8,border:'3px solid #f48fb1'}}><img src={qrUrl} width={118} height={118} alt="QR" style={{borderRadius:'50%'}} /></div>
      <span style={{fontSize:16}}>💕</span>
    </div>
  )
  return (
    <div style={{background:'linear-gradient(145deg,#f9748f,#c0392b)',borderRadius:16,padding:16,display:'flex',flexDirection:'column',alignItems:'center',gap:8,width:200}}>
      <p style={{fontSize:11,color:'rgba(255,255,255,0.85)',fontFamily:'cursive',textAlign:'center'}}>Minha acessoria és você</p>
      <p style={{fontSize:18,color:'white',fontFamily:'cursive',fontWeight:'bold'}}>Surpreenda</p>
      <div style={{background:'white',borderRadius:12,padding:6}}><img src={qrUrl} width={118} height={118} alt="QR" /></div>
    </div>
  )
}

/* ── PushinPay helpers ────────────────────────────────────────── */
async function createPix(amountCents) {
  const res = await fetch('/pushinpay/api/pix/cashIn', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ value: amountCents }),
  })
  if (!res.ok) throw new Error(`PushinPay ${res.status}`)
  return res.json()
}

async function checkPix(id) {
  const res = await fetch(`/pushinpay/api/pix/cashIn/${id}`, {
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
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(siteUrl)}&format=png&margin=12`

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

        {/* header */}
        <div className="text-center mt-2">
          <span className="text-5xl">🎉</span>
          <p className="text-[22px] font-black text-gray-900 mt-3">Pagamento confirmado!</p>
          <p className="text-[14px] text-gray-500 mt-1">
            O presente de <span className="font-bold text-gray-800">{partnerName}</span> está pronto!
          </p>
        </div>

        {/* link do site */}
        <div className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col gap-2">
          <p className="text-[11px] font-bold text-purple-600 tracking-widest">LINK DO PRESENTE</p>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5">
            <p className="flex-1 text-[13px] text-gray-700 font-mono truncate">{siteUrl}</p>
            <button onClick={copyLink} className="shrink-0 active:scale-90 transition-all">
              {copied
                ? <Check size={18} className="text-green-500" />
                : <Copy size={18} className="text-purple-500" />}
            </button>
          </div>
          {copied && <p className="text-[11px] text-green-500 text-center">Link copiado!</p>}
          <a href={siteUrl} target="_blank" rel="noopener noreferrer"
            className="w-full mt-1 bg-purple-600 text-white rounded-xl py-3 font-bold text-[14px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all no-underline">
            Abrir meu site ↗
          </a>
        </div>

        {/* QR code */}
        <div className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col items-center gap-3">
          <p className="text-[11px] font-bold text-purple-600 tracking-widest self-start">QR CODE DO PRESENTE</p>
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
            <SiteQRCard style={selectedQR} siteUrl={siteUrl} />
          </div>
          <p className="text-[12px] text-gray-400 text-center">
            Quando {partnerName} escanear, abre direto o presente personalizado.
          </p>
          <button onClick={downloadQR}
            className="w-full bg-gray-800 text-white rounded-xl py-3 font-bold text-[14px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
            ⬇ Baixar QR Code
          </button>
        </div>

        {/* ver preview */}
        <button onClick={onNext}
          className="w-full border-2 border-purple-600 text-purple-600 rounded-2xl py-3.5 font-black text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
          Ver prévia completa do presente ›
        </button>
      </div>
    </div>
  )
}

/* ── Main ─────────────────────────────────────────────────────── */
export default function StepPagamento({ onNext, onBack }) {
  const { data } = useQuiz()

  /* form state */
  const [wa,         setWa]         = useState('')
  const [selectedQR, setSelectedQR] = useState(0)
  const [qrOpen,     setQrOpen]     = useState(true)
  const [couponOpen, setCouponOpen] = useState(false)
  const [coupon,     setCoupon]     = useState('')

  /* payment state */
  const [screen,  setScreen]  = useState('form') // form | loading | awaiting | success | error
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

  const partnerName = data.partnerName || 'ela'
  const siteUrl = waValid ? `${window.location.origin}/${digits}` : ''

  /* ── serializar quiz_data (fotos viram URLs do Storage) ── */
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
    return {
      ...data,
      photos: photos.filter(Boolean),
      coverPhoto: null,
      coverPhotoUrl,
      galeriaPhotos: galeriaPhotos.filter(Boolean),
      audio: null, // audio blobs não são suportados no storage nessa versão
    }
  }, [data])

  /* ── gerar PIX ── */
  const handleGerar = useCallback(async () => {
    setScreen('loading')
    setErrMsg('')
    try {
      // Salva dados no Supabase antes de gerar o PIX
      const quizData = await buildQuizData()
      await saveSite(digits, quizData).catch(() => {}) // silencia erro de save para não bloquear pagamento
      const d = await createPix(cents)
      setPixData(d)
      setScreen('awaiting')
    } catch (e) {
      setErrMsg('Erro ao gerar o PIX. Tente novamente.')
      setScreen('error')
    }
  }, [cents, digits, buildQuizData])

  /* ── polling pagamento ── */
  useEffect(() => {
    if (screen !== 'awaiting' || !pixData?.id) return
    const id = setInterval(async () => {
      try {
        const d = await checkPix(pixData.id)
        if (d.status === 'paid' || d.status === 'PAID' || d.status === 'approved') {
          clearInterval(id)
          await markPaid(digits).catch(() => {})
          setScreen('success')
        }
      } catch {}
    }, 3000)
    return () => clearInterval(id)
  }, [screen, pixData, digits])

  /* ── copy PIX code ── */
  const copyPix = () => {
    if (!pixData?.qr_code) return
    navigator.clipboard.writeText(pixData.qr_code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  /* ════════════════════════════════════════════════════════════
     TELA: loading
  ════════════════════════════════════════════════════════════ */
  if (screen === 'loading') return (
    <div className="step-root">
      <div className="step-scroll flex flex-col items-center justify-center gap-5">
        <Loader size={40} className="text-purple-500 animate-spin" />
        <p className="text-[16px] font-bold text-gray-700">Gerando seu PIX...</p>
        <p className="text-[13px] text-gray-400">Aguarde um instante</p>
      </div>
    </div>
  )

  /* ════════════════════════════════════════════════════════════
     TELA: error
  ════════════════════════════════════════════════════════════ */
  if (screen === 'error') return (
    <div className="step-root">
      <div className="step-scroll flex flex-col items-center justify-center gap-5 px-6 text-center">
        <span className="text-5xl">😕</span>
        <p className="text-[16px] font-bold text-gray-800">{errMsg}</p>
        <button onClick={() => setScreen('form')}
          className="bg-purple-600 text-white rounded-2xl px-8 py-3 font-bold text-[14px] active:scale-95 transition-all">
          Tentar novamente
        </button>
      </div>
    </div>
  )

  /* ════════════════════════════════════════════════════════════
     TELA: aguardando pagamento
  ════════════════════════════════════════════════════════════ */
  if (screen === 'awaiting') return (
    <div className="step-root">
      <div className="step-scroll flex flex-col items-center gap-5 px-4">
        <div className="w-full h-2 bg-purple-600 rounded-full mt-2" />

        <p className="text-[20px] font-black text-gray-900 text-center mt-2">Escaneie o QR Code PIX</p>
        <p className="text-[13px] text-gray-500 text-center -mt-2">Abra o app do seu banco e pague com PIX</p>

        {/* QR PIX */}
        <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col items-center gap-4 w-full">
          {pixData?.qr_code_base64 ? (
            <img src={`data:image/png;base64,${pixData.qr_code_base64}`} width={200} height={200} alt="PIX QR" className="rounded-lg" />
          ) : (
            <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center">
              <Loader size={32} className="text-gray-400 animate-spin" />
            </div>
          )}

          {/* valor */}
          <div className="text-center">
            <p className="text-[13px] text-gray-500">Valor a pagar</p>
            <p className="text-[24px] font-black text-gray-900">{totalStr}</p>
          </div>

          {/* copia e cola */}
          {pixData?.qr_code && (
            <div className="w-full">
              <p className="text-[11px] text-gray-400 text-center mb-2">PIX copia e cola</p>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                <p className="flex-1 text-[11px] text-gray-500 truncate font-mono">{pixData.qr_code}</p>
                <button onClick={copyPix} className="shrink-0 active:scale-90 transition-all">
                  {copied
                    ? <Check size={16} className="text-green-500" />
                    : <Copy size={16} className="text-purple-500" />
                  }
                </button>
              </div>
              {copied && <p className="text-[11px] text-green-500 text-center mt-1">Copiado!</p>}
            </div>
          )}
        </div>

        {/* status pulse */}
        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 w-full">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse shrink-0" />
          <p className="text-[13px] text-yellow-700 font-semibold">Aguardando confirmação do pagamento...</p>
        </div>

        <p className="text-[11px] text-gray-400 text-center">
          O pagamento é confirmado automaticamente em segundos após o Pix.
        </p>

        <button onClick={() => setScreen('form')} className="text-[12px] text-gray-400 underline pb-6">
          Voltar e alterar dados
        </button>
      </div>
    </div>
  )

  /* ════════════════════════════════════════════════════════════
     TELA: pagamento confirmado
  ════════════════════════════════════════════════════════════ */
  if (screen === 'success') return <SuccessScreen
    partnerName={partnerName}
    siteUrl={siteUrl}
    digits={digits}
    selectedQR={selectedQR}
    onNext={onNext}
  />

  /* ════════════════════════════════════════════════════════════
     TELA: formulário principal
  ════════════════════════════════════════════════════════════ */
  return (
    <div className="step-root">
      <div className="step-scroll flex flex-col">
        <div className="w-full h-2 bg-purple-600 rounded-full mt-2 mb-6" />

        <div className="flex flex-col items-center">
          <div style={{ marginTop: -30, marginBottom: -38 }}>
            <PandaMascot size={230} />
          </div>
        </div>

        <div className="mt-5 bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-gray-700 text-[15px] leading-relaxed">
            Tudo pronto para o grande momento! Estou ansioso para ver a reação
            de <span className="font-bold text-gray-900">{partnerName}</span>.
            Preencha os detalhes abaixo e prepare-se para surpreender.
          </p>
        </div>

        {/* resumo */}
        <div className="mt-4 bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 pt-4 pb-3">
            <p className="text-[15px] font-black text-gray-900 mb-3">Resumo do pedido</p>
            <div className="flex items-center justify-between text-[14px]">
              <span className="text-gray-600">🎁 Plano: Para Sempre (Vitalício)</span>
              <span className="font-semibold text-gray-800">R$ 19,90</span>
            </div>
            {extra > 0 && (
              <div className="flex items-center justify-between text-[14px] mt-1">
                <span className="text-gray-600">QR code personalizado</span>
                <span className="font-semibold text-gray-800">+ R$ 4,90</span>
              </div>
            )}
            <div className="border-t border-gray-100 mt-3 pt-3 flex items-center justify-between">
              <span className="text-[15px] font-black text-gray-900">Total:</span>
              <span className="text-[18px] font-black text-gray-900">{totalStr}</span>
            </div>
          </div>

          <button onClick={() => setCouponOpen(v => !v)}
            className="w-full flex items-center gap-2 px-4 py-3 border-t border-gray-100 text-[13px] text-purple-600 font-semibold">
            🏷️ Possui um cupom de desconto?
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
            <input type="tel" placeholder="WhatsApp (com DDD)"
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
            <span className="text-2xl">🟢</span>
            <div>
              <p className="text-[13px] font-bold text-teal-800">Pagamento via PIX</p>
              <p className="text-[12px] text-teal-600">Instantâneo e seguro. O QR será gerado ao clicar abaixo.</p>
            </div>
          </div>
        </div>

        {/* QR personalizado */}
        <div className="mt-5 bg-white rounded-2xl shadow-sm overflow-hidden">
          <button onClick={() => setQrOpen(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3.5">
            <span className="text-[14px] font-bold text-gray-800 flex items-center gap-2">
              <span className="text-[16px]">▦</span> QR code personalizado
            </span>
            {qrOpen ? <ChevronUp size={16} className="text-gray-400"/> : <ChevronDown size={16} className="text-gray-400"/>}
          </button>
          {qrOpen && (
            <div className="pb-4">
              <div className="flex gap-3 overflow-x-auto px-4 pb-1" style={{scrollbarWidth:'none'}}>
                {QR_TEMPLATES.map(({ id, Component, label }) => (
                  <div key={id} className="flex flex-col items-center gap-1.5 shrink-0">
                    <button onClick={() => setSelectedQR(id)}
                      style={{outline: selectedQR===id ? '2.5px solid #7c3aed' : '2.5px solid transparent', borderRadius:14, transition:'outline 0.15s'}}>
                      <Component />
                    </button>
                    <span className={`text-[11px] font-bold px-3 py-0.5 rounded-full ${selectedQR===id ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-5">
          <button onClick={handleGerar}
            className="w-full bg-emerald-500 text-white rounded-2xl py-4 font-black text-[15px] flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 active:scale-[0.98] transition-all">
            🟢 Gerar QR Code PIX · {totalStr}
          </button>
          <div className="flex items-center justify-center gap-4 mt-3">
            <span className="flex items-center gap-1 text-[11px] text-gray-400"><Shield size={11}/> Compra segura</span>
            <span className="flex items-center gap-1 text-[11px] text-gray-400"><Lock size={11}/> Dados protegidos</span>
            <span className="flex items-center gap-1 text-[11px] text-gray-400"><RefreshCw size={11}/> Pagamento único</span>
          </div>
        </div>

        {/* reviews */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex justify-center py-3 border-b border-gray-50">
            <span className="flex items-center gap-1.5 text-[12px] font-bold text-purple-700 bg-purple-50 px-4 py-1.5 rounded-full">
              👥 + de 50.257 casais felizes!
            </span>
          </div>
          {REVIEWS.map((r, i) => (
            <div key={i} className={`px-4 py-4 ${i < REVIEWS.length-1 ? 'border-b border-gray-50' : ''}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-[13px]">
                  {r.name[0]}
                </div>
                <div>
                  <p className="text-[13px] font-bold text-gray-800">{r.name}</p>
                  <p className="text-yellow-400 text-[11px] leading-none">★★★★★</p>
                </div>
              </div>
              <p className="text-[13px] text-gray-600 leading-relaxed italic">{r.text}</p>
            </div>
          ))}
        </div>

        {/* footer */}
        <div className="mt-8 flex flex-col items-center text-center gap-2 pb-10 px-2">
          <span className="text-2xl">🐼</span>
          <p className="text-[13px] font-bold text-gray-700">Panda</p>
          <p className="text-[12px] text-gray-500 leading-relaxed">
            Criamos experiências únicas para eternizar momentos especiais com{' '}
            <span className="text-purple-500">presentes virtuais e personalizados</span>.
          </p>
          <div className="flex items-center gap-3 mt-1">
            <button className="text-[11px] text-gray-400 underline">Termos de Uso</button>
            <span className="text-gray-300">•</span>
            <button className="text-[11px] text-gray-400 underline">Política de Privacidade</button>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">LOVEPANDA LTDA — CNPJ: 60.623.888/0001-40 — Pires do Rio/GO</p>
          <p className="text-[10px] text-gray-400">Feito com 🤍 no Brasil</p>
          <p className="text-[10px] text-gray-400">© 2025 Panda. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  )
}
