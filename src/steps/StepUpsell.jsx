import { useState, useEffect } from 'react'
import PandaMascot from '../components/PandaMascot'

const SCREENSHOTS = [
  { src: '/screenshots/roleta.png',   label: '🎯 Roleta do Casal' },
  { src: '/screenshots/mapa.png',     label: '🗺️ Jornada no Mapa' },
  { src: '/screenshots/timeline.png', label: '📸 Nossa Jornada' },
  { src: '/screenshots/estrelas.png', label: '⭐ Mapa das Estrelas' },
  { src: '/screenshots/palavras.png', label: '🟩 Jogo de Palavras' },
  { src: '/screenshots/jogo.png',     label: '💑 Galeria do Casal' },
]

const faqs = [
  { q: 'Quanto custa o Wrapped?', a: 'Grátis! O Wrapped já está incluído no seu plano. São 8+ seções interativas animadas para transformar seu presente em algo que vai fazer a pessoa amada chorar de emoção.' },
  { q: 'Demora para fazer?', a: 'É rapidinho! Em poucos minutos você seleciona o que quer mostrar. O melhor de configurar agora é que você consegue visualizar uma prévia antes de finalizar.' },
  { q: 'O que tem de tão especial nisso?', a: '9 em cada 10 clientes dizem que a Retrospectiva Animada foi a parte que fez a pessoa amada chorar de emoção. É a história de vocês contada como um filme.' },
  { q: 'Posso adicionar depois?', a: 'Pode sim, pelo painel de edição após a compra. Mas adicionando agora você já configura tudo e visualiza uma prévia antes de enviar!' },
  { q: 'Funciona em qualquer celular?', a: 'Sim! Nossa tecnologia cria uma experiência fluida que funciona perfeitamente em qualquer celular, tablet ou computador.' },
]

function PhoneMockup({ src, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0, width: 148 }}>
      {/* phone frame */}
      <div style={{
        width: 148,
        height: 300,
        background: '#111',
        borderRadius: 28,
        padding: 6,
        boxShadow: '0 20px 60px rgba(0,0,0,0.35), 0 0 0 1.5px rgba(255,255,255,0.08), inset 0 0 0 1px rgba(255,255,255,0.04)',
        position: 'relative',
      }}>
        {/* dynamic island */}
        <div style={{
          position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
          width: 52, height: 10, background: '#000', borderRadius: 6, zIndex: 10,
        }} />
        {/* screen */}
        <div style={{ width: '100%', height: '100%', borderRadius: 22, overflow: 'hidden', background: '#000' }}>
          <img src={src} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
        </div>
        {/* home bar */}
        <div style={{
          position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
          width: 40, height: 3, background: 'rgba(255,255,255,0.25)', borderRadius: 2, zIndex: 10,
        }} />
        {/* side button */}
        <div style={{
          position: 'absolute', right: -3, top: 72, width: 3, height: 28,
          background: '#222', borderRadius: '0 2px 2px 0',
        }} />
        {/* volume buttons */}
        <div style={{ position: 'absolute', left: -3, top: 60, width: 3, height: 20, background: '#222', borderRadius: '2px 0 0 2px' }} />
        <div style={{ position: 'absolute', left: -3, top: 86, width: 3, height: 20, background: '#222', borderRadius: '2px 0 0 2px' }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED', textAlign: 'center' }}>{label}</span>
    </div>
  )
}

function PhoneCarousel() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % SCREENSHOTS.length), 2800)
    return () => clearInterval(t)
  }, [])

  const s = SCREENSHOTS[idx]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <PhoneMockup src={s.src} label={s.label} />
      {/* dots */}
      <div style={{ display: 'flex', gap: 5 }}>
        {SCREENSHOTS.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} style={{
            width: i === idx ? 18 : 6, height: 6,
            borderRadius: 3, border: 'none', cursor: 'pointer', padding: 0,
            background: i === idx ? '#7C3AED' : '#E5E7EB',
            transition: 'width 0.3s ease, background 0.3s ease',
          }} />
        ))}
      </div>
    </div>
  )
}

export default function StepUpsell({ onAccept, onDecline }) {
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <div className="step-root">
      <div className="step-scroll flex flex-col items-center">
        <div className="w-full h-2 bg-purple-600 rounded-full mt-2 mb-7" />
        <div style={{ marginTop: -30, marginBottom: -38 }}>
          <PandaMascot size={230} />
        </div>

        <div className="w-full mt-5 bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-gray-700 text-[15px] leading-relaxed">
            O presente ficou lindo! Mas dá pra deixar{' '}
            <span className="font-black text-purple-600">INESQUECÍVEL</span> com a{' '}
            <span className="font-bold text-gray-900">Retrospectiva Wrapped</span>.
          </p>
        </div>

        <div className="w-full mt-3 bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-gray-700 text-[15px] leading-relaxed">
            São <span className="text-purple-600 font-bold">8+ seções animadas</span> que contam a história de vocês como um filme.{' '}
            <span className="font-bold text-gray-900">9 em cada 10 pessoas choram ao ver!</span>
          </p>
        </div>

        {/* phone mockup carousel */}
        <div className="w-full mt-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl py-6 flex flex-col items-center gap-3" style={{ border: '1.5px solid #EDE9FE' }}>
          <p className="text-[12px] font-bold text-purple-500 uppercase tracking-widest">Veja o que está incluso</p>
          <PhoneCarousel />
        </div>

        <div className="w-full mt-5 flex flex-col gap-3">
          <div className="text-center">
            <span className="text-[11px] bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold uppercase tracking-wide">Experiência Completa</span>
          </div>
          <button onClick={onAccept}
            className="w-full bg-purple-600 text-white rounded-2xl py-4 font-black text-[15px] flex items-center justify-center gap-2 shadow-lg shadow-purple-200 active:scale-[0.98] transition-all">
            Sim! Quero adicionar agora ↗
          </button>
          <button onClick={onDecline} className="w-full text-gray-400 text-[13px] py-1 font-medium">
            Seguir apenas com o presente básico
          </button>
        </div>

        <div className="w-full mt-6">
          <div className="text-center mb-4">
            <span className="bg-gray-100 text-gray-500 text-[11px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">Importante</span>
          </div>
          <p className="text-xl font-black text-gray-900 text-center">Por que adicionar o Wrapped?</p>
          <p className="text-[14px] text-gray-500 text-center mt-1">Entenda a mágica do Wrapped</p>

          <div className="mt-4 flex flex-col gap-2">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-4 text-left">
                  <p className="text-[14px] font-semibold text-gray-800 pr-3">{faq.q}</p>
                  <span className={`text-purple-500 text-lg shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}>∨</span>
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 border-t border-gray-50">
                    <p className="text-[13px] text-gray-500 leading-relaxed mt-3">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="pb-8" />
      </div>
    </div>
  )
}
