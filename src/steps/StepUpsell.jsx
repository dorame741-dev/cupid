import { useState } from 'react'
import PandaMascot from '../components/PandaMascot'

const faqs = [
  { q: 'Quanto custa o Wrapped?', a: 'Grátis! O Wrapped já está incluído no seu plano. São 8+ seções interativas animadas para transformar seu presente em algo que vai fazer a pessoa amada chorar de emoção.' },
  { q: 'Demora para fazer?', a: 'É rapidinho! Em poucos minutos você seleciona o que quer mostrar. O melhor de configurar agora é que você consegue visualizar uma prévia antes de finalizar.' },
  { q: 'O que tem de tão especial nisso?', a: '9 em cada 10 clientes dizem que a Retrospectiva Animada foi a parte que fez a pessoa amada chorar de emoção. É a história de vocês contada como um filme.' },
  { q: 'Posso adicionar depois?', a: 'Pode sim, pelo painel de edição após a compra. Mas adicionando agora você já configura tudo e visualiza uma prévia antes de enviar!' },
  { q: 'Funciona em qualquer celular?', a: 'Sim! Nossa tecnologia cria uma experiência fluida que funciona perfeitamente em qualquer celular, tablet ou computador.' },
]

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

        <div className="w-full mt-4 bg-gradient-to-br from-purple-800 to-pink-800 rounded-3xl p-5 text-center relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full" />
          <div className="text-5xl mb-2 relative">📅</div>
          <p className="text-white font-bold text-base relative">Retrospectiva Animada</p>
          <p className="text-purple-200 text-[13px] mt-1 relative">8+ seções · Animadas · Emocionantes</p>
          <div className="flex justify-center gap-2 mt-3 relative flex-wrap">
            {['💌 Mensagem', '🌙 Fase da lua', '🗺️ Mapa', '⭐ Estrelas'].map(t => (
              <span key={t} className="bg-white/20 text-white text-[11px] px-2.5 py-1 rounded-full font-medium">{t}</span>
            ))}
          </div>
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
