import { useState, useEffect } from 'react'

const SCREENSHOTS = [
  { src: '/screenshots/roleta.png',   label: 'Roleta do Casal' },
  { src: '/screenshots/mapa.png',     label: 'Jornada no Mapa' },
  { src: '/screenshots/timeline.png', label: 'Nossa Jornada' },
  { src: '/screenshots/estrelas.png', label: 'Mapa das Estrelas' },
  { src: '/screenshots/palavras.png', label: 'Jogo de Palavras' },
  { src: '/screenshots/jogo.png',     label: 'Galeria do Casal' },
]

const faqs = [
  { q: 'Quanto custa o Wrapped?', a: 'Grátis! O Wrapped já está incluído no seu plano. São 8+ seções interativas animadas para transformar seu presente em algo que vai fazer a pessoa amada chorar de emoção.' },
  { q: 'Demora para fazer?', a: 'Em poucos minutos você seleciona o que quer mostrar. O melhor de configurar agora é que você consegue visualizar uma prévia antes de finalizar.' },
  { q: 'O que tem de tão especial?', a: '9 em cada 10 clientes dizem que a Retrospectiva Animada foi a parte que fez a pessoa amada chorar de emoção. É a história de vocês contada como um filme.' },
  { q: 'Posso adicionar depois?', a: 'Pode sim, pelo painel de edição após a compra. Mas adicionando agora você já configura tudo e visualiza uma prévia antes de enviar!' },
  { q: 'Funciona em qualquer celular?', a: 'Sim! Nossa tecnologia cria uma experiência fluida que funciona perfeitamente em qualquer celular, tablet ou computador.' },
]

/* ─── Coverflow de fotos redondas ───────────────────────────── */
function CoverflowCarousel() {
  const [idx, setIdx] = useState(0)
  const n = SCREENSHOTS.length
  const prev = SCREENSHOTS[(idx - 1 + n) % n]
  const curr = SCREENSHOTS[idx]
  const next = SCREENSHOTS[(idx + 1) % n]

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % n), 3000)
    return () => clearInterval(t)
  }, [n])

  const goTo = (i) => setIdx(i)

  /* Container height = tamanho do centro (165) + ponta visível das laterais (38) */
  const C = 165   // centro
  const S = 96    // laterais
  const H = C + 38 // altura total do container

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, width: '100%' }}>
      {/* coverflow */}
      <div style={{ position: 'relative', width: '100%', height: H, overflow: 'hidden' }}>

        {/* lateral esquerda — só a ponta aparece */}
        <div style={{
          position: 'absolute',
          width: S, height: S,
          borderRadius: '50%',
          overflow: 'hidden',
          left: `calc(50% - ${Math.round(C / 2) + S - 10}px)`,
          top: H - 38,
          opacity: 0.6,
          zIndex: 1,
          border: '2.5px solid white',
          boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
          transition: 'opacity 0.4s',
        }}>
          <img src={prev.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
        </div>

        {/* centro — destaque */}
        <div style={{
          position: 'absolute',
          width: C, height: C,
          borderRadius: '50%',
          overflow: 'hidden',
          left: '50%',
          transform: 'translateX(-50%)',
          top: 0,
          zIndex: 3,
          border: '4px solid white',
          boxShadow: '0 16px 48px rgba(124,58,237,0.38)',
        }}>
          <img src={curr.src} alt={curr.label}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
        </div>

        {/* lateral direita — só a ponta aparece */}
        <div style={{
          position: 'absolute',
          width: S, height: S,
          borderRadius: '50%',
          overflow: 'hidden',
          left: `calc(50% + ${Math.round(C / 2) - 10}px)`,
          top: H - 38,
          opacity: 0.6,
          zIndex: 1,
          border: '2.5px solid white',
          boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
          transition: 'opacity 0.4s',
        }}>
          <img src={next.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
        </div>
      </div>

      {/* label da foto central */}
      <p style={{ fontSize: 13, fontWeight: 800, color: '#7C3AED', letterSpacing: 0.3, marginTop: -4 }}>{curr.label}</p>

      {/* dots */}
      <div style={{ display: 'flex', gap: 5 }}>
        {SCREENSHOTS.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} style={{
            width: i === idx ? 20 : 6, height: 6, borderRadius: 3,
            border: 'none', cursor: 'pointer', padding: 0,
            background: i === idx ? '#7C3AED' : '#E5E7EB',
            transition: 'width 0.3s ease, background 0.3s ease',
          }} />
        ))}
      </div>
    </div>
  )
}

/* ─── Phone mockup ──────────────────────────────────────────── */
function PhoneMockup({ src, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0, width: 138 }}>
      <div style={{
        width: 138, height: 282,
        background: '#111', borderRadius: 26, padding: 5,
        boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1.5px rgba(255,255,255,0.08)',
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)', width: 48, height: 9, background: '#000', borderRadius: 5, zIndex: 10 }} />
        <div style={{ width: '100%', height: '100%', borderRadius: 21, overflow: 'hidden', background: '#000' }}>
          <img src={src} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
        </div>
        <div style={{ position: 'absolute', bottom: 9, left: '50%', transform: 'translateX(-50%)', width: 38, height: 3, background: 'rgba(255,255,255,0.22)', borderRadius: 2, zIndex: 10 }} />
        <div style={{ position: 'absolute', right: -3, top: 68, width: 3, height: 26, background: '#222', borderRadius: '0 2px 2px 0' }} />
        <div style={{ position: 'absolute', left: -3, top: 56, width: 3, height: 18, background: '#222', borderRadius: '2px 0 0 2px' }} />
        <div style={{ position: 'absolute', left: -3, top: 80, width: 3, height: 18, background: '#222', borderRadius: '2px 0 0 2px' }} />
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, color: '#7C3AED', textAlign: 'center' }}>{label}</span>
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
      <div style={{ display: 'flex', gap: 5 }}>
        {SCREENSHOTS.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} style={{
            width: i === idx ? 18 : 6, height: 6, borderRadius: 3,
            border: 'none', cursor: 'pointer', padding: 0,
            background: i === idx ? '#7C3AED' : '#E5E7EB',
            transition: 'width 0.3s ease, background 0.3s ease',
          }} />
        ))}
      </div>
    </div>
  )
}

/* ─── Main ──────────────────────────────────────────────────── */
export default function StepUpsell({ onAccept, onDecline }) {
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <div className="step-root">
      <div className="step-scroll flex flex-col items-center gap-0">

        {/* barra de progresso */}
        <div className="w-full h-1.5 bg-purple-600 rounded-full mt-2 mb-6" />

        {/* headline */}
        <div className="w-full text-center mb-4 px-2">
          <p className="text-[24px] font-black text-gray-900 leading-tight">
            O presente ficou lindo!
          </p>
          <p className="text-[14px] text-gray-500 mt-1.5 leading-relaxed">
            Mas você pode deixar{' '}
            <span className="font-black text-purple-600">INESQUECÍVEL</span>{' '}
            com a{' '}
            <span className="font-bold text-gray-900">Retrospectiva Wrapped</span>.
            São <span className="text-purple-600 font-bold">8+ seções animadas</span>{' '}
            que contam a história de vocês como um filme —{' '}
            <span className="font-bold text-gray-900">9 em cada 10 pessoas choram ao ver!</span>
          </p>
        </div>

        {/* coverflow de fotos redondas */}
        <div className="w-full bg-gradient-to-b from-purple-50 to-white rounded-3xl pt-5 pb-4 px-3 flex flex-col items-center gap-3 mb-4" style={{ border: '1.5px solid #EDE9FE' }}>
          <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Seções incluídas</p>
          <CoverflowCarousel />
        </div>

        {/* mockup de celular */}
        <div className="w-full bg-gray-950 rounded-3xl py-6 px-4 flex flex-col items-center gap-4 mb-4">
          <div className="text-center">
            <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">Como fica no celular</p>
            <p className="text-white text-[16px] font-black leading-tight">Experiência completa</p>
            <p className="text-gray-400 text-[12px] mt-0.5">Interativo · Animado · Emocionante</p>
          </div>
          <PhoneCarousel />
          {/* feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-1">
            {SCREENSHOTS.map(s => (
              <span key={s.label} style={{
                background: 'rgba(124,58,237,0.18)',
                color: '#c4b5fd',
                fontSize: 10,
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 20,
                letterSpacing: 0.2,
              }}>{s.label}</span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="w-full flex flex-col gap-3 mb-6">
          <button onClick={onAccept}
            className="btn-pulse w-full text-white rounded-2xl py-4 font-black text-[16px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #9333ea)', boxShadow: '0 8px 28px rgba(124,58,237,0.45)' }}>
            Quero adicionar agora ↗
          </button>
          <button onClick={onDecline} className="w-full text-gray-400 text-[13px] py-1 font-medium">
            Seguir apenas com o presente básico
          </button>
        </div>

        {/* FAQs */}
        <div className="w-full">
          <p className="text-[18px] font-black text-gray-900 text-center mb-1">Por que adicionar o Wrapped?</p>
          <p className="text-[13px] text-gray-400 text-center mb-4">Entenda a diferença que faz</p>
          <div className="flex flex-col gap-2">
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
