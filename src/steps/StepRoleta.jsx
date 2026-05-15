import { useState, useRef } from 'react'
import PreviewFab from '../components/PreviewFab'
import BackButton from '../components/BackButton'
import { useQuiz } from '../context/QuizContext'

const THEMES = {
  rosa: { label: 'Rosa', colors: ['#d4547a', '#f0a8c0'] },
  azul: { label: 'Azul', colors: ['#3b6fd4', '#7ab2f0'] },
}

/* ─── SVG wheel ─────────────────────────────────────────────── */
function RoletaWheel({ options, theme, rotation, spinning }) {
  const n = options.length
  if (n < 2) return null
  const colors = THEMES[theme].colors
  const cx = 150, cy = 150, r = 140

  const slices = options.map((opt, i) => {
    const start = (i / n) * 2 * Math.PI - Math.PI / 2
    const end   = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2
    const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start)
    const x2 = cx + r * Math.cos(end),   y2 = cy + r * Math.sin(end)
    const large = end - start > Math.PI ? 1 : 0
    const mid = (start + end) / 2
    const tx = cx + r * 0.65 * Math.cos(mid)
    const ty = cy + r * 0.65 * Math.sin(mid)
    return { opt, x1, y1, x2, y2, large, tx, ty, mid, color: colors[i % 2] }
  })

  return (
    <svg viewBox="0 0 300 300" width="100%" height="100%"
      style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? 'transform 4s cubic-bezier(0.17,0.67,0.12,0.99)' : 'none' }}>
      {slices.map(({ opt, x1, y1, x2, y2, large, tx, ty, mid, color }, i) => (
        <g key={i}>
          <path d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
            fill={color} stroke="white" strokeWidth={1.5} />
          <text x={tx} y={ty} fill="white" fontSize={11} fontWeight="bold"
            textAnchor="middle" dominantBaseline="middle"
            transform={`rotate(${mid * 180 / Math.PI + 90}, ${tx}, ${ty})`}>
            {opt.length > 9 ? opt.slice(0, 9) + '…' : opt}
          </text>
        </g>
      ))}
      <circle cx={cx} cy={cy} r={22} fill={THEMES[theme].colors[0]} />
      <text x={cx} y={cy + 2} fontSize={20} textAnchor="middle" dominantBaseline="middle" fill="white">♥</text>
    </svg>
  )
}

/* ─── Preview ───────────────────────────────────────────────── */
function Preview({ question, options, theme, onClose }) {
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState(null)
  const rotRef = useRef(0)

  const spin = () => {
    if (spinning) return
    setSpinning(true)
    setResult(null)
    const next = rotRef.current + (5 + Math.random() * 5) * 360 + Math.random() * 360
    rotRef.current = next
    setRotation(next)
    setTimeout(() => {
      setSpinning(false)
      const n = options.length
      const sliceAngle = 360 / n
      const normalized = ((next % 360) + 360) % 360
      const pointerOnWheel = (360 - normalized) % 360
      const adjusted = (pointerOnWheel + sliceAngle / 2) % 360
      setResult(options[Math.floor(adjusted / sliceAngle) % n])
    }, 4200)
  }

  const pointer = THEMES[theme].colors[0]

  return (
    <div className="step-root" style={{ background: '#0d0d0d' }}>
      <div className="step-scroll flex flex-col items-center">
        <h2 className="text-white text-[22px] font-black text-center mt-6 mb-6 px-4 leading-snug">
          {question || 'Para onde vamos sair hoje?'}
        </h2>

        {/* pointer */}
        <div style={{ width: 0, height: 0, borderLeft: '11px solid transparent', borderRight: '11px solid transparent', borderTop: `22px solid ${pointer}`, marginBottom: 4 }} />

        <div style={{ width: '78%', aspectRatio: '1' }}>
          <RoletaWheel options={options} theme={theme} rotation={rotation} spinning={spinning} />
        </div>

        <button onClick={spin} disabled={spinning}
          className="mt-8 bg-white text-gray-900 font-bold text-[16px] px-12 py-4 rounded-2xl shadow-xl active:scale-95 transition-all">
          {spinning ? 'Girando...' : 'Girar Roleta'}
        </button>

        {result && (
          <div className="mt-6 mx-6 w-[calc(100%-48px)] bg-white/10 rounded-2xl px-5 py-4 text-center">
            <p className="text-white/50 text-[13px] font-medium">O resultado foi</p>
            <p className="text-white text-[24px] font-black mt-1">{result}</p>
          </div>
        )}

        <div className="pb-6" />
      </div>
      <button onClick={onClose}
        className="absolute bottom-4 right-4 bg-purple-600 text-white rounded-full px-5 py-2.5 font-semibold text-[14px] active:scale-95 transition-all z-10">
        Voltar
      </button>
    </div>
  )
}

/* ─── Main config ───────────────────────────────────────────── */
export default function StepRoleta({ onNext, onBack }) {
  const { data, update } = useQuiz()
  const [showPreview, setShowPreview] = useState(false)

  const theme    = data.roletaTheme
  const question = data.roletaQuestion
  const options  = data.roletaOptions

  const validOptions = options.filter(o => o.trim())
  const canNext = validOptions.length >= 2

  const setOption = (i, val) => {
    const next = [...options]; next[i] = val; update({ roletaOptions: next })
  }
  const addOption    = () => update({ roletaOptions: [...options, ''] })
  const removeOption = (i) => update({ roletaOptions: options.filter((_, idx) => idx !== i) })

  if (showPreview) return (
    <Preview
      question={question}
      options={validOptions}
      theme={theme}
      onClose={() => setShowPreview(false)}
    />
  )

  return (
    <div className="step-root">
      <div className="step-scroll">
        <div className="flex items-center gap-3 pt-3 mb-5">
          <BackButton onClick={onBack} />
        </div>

        <h1 className="text-[24px] font-black text-gray-900">Roleta</h1>
        <p className="text-[14px] text-gray-500 mt-1">Adicione as opções e título</p>

        {/* Tema */}
        <p className="text-[15px] font-bold text-gray-800 mt-6 mb-3">Tema da roleta</p>
        <div className="flex gap-3">
          {Object.entries(THEMES).map(([key, t]) => (
            <button key={key} onClick={() => update({ roletaTheme: key })}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 transition-all active:scale-[0.98]
                ${theme === key ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white'}`}>
              <div className="flex">
                <div className="w-4 h-4 rounded-full border border-white/50" style={{ background: t.colors[0] }} />
                <div className="w-4 h-4 rounded-full border border-white/50 -ml-1.5" style={{ background: t.colors[1] }} />
              </div>
              <span className={`text-[14px] font-semibold ${theme === key ? 'text-purple-700' : 'text-gray-600'}`}>
                {t.label}
              </span>
            </button>
          ))}
        </div>

        {/* Frase */}
        <p className="text-[15px] font-bold text-gray-800 mt-6 mb-2">Frase ou pergunta</p>
        <label className="bg-white rounded-2xl px-4 py-3.5 shadow-sm flex items-center gap-3 border-2 border-transparent focus-within:border-purple-300 transition-colors cursor-text">
          <span className="text-gray-400 text-[18px] shrink-0">?</span>
          <input type="text" placeholder="Ex: Para onde vamos sair hoje?"
            className="flex-1 outline-none text-[14px] text-gray-800 placeholder-gray-300 bg-transparent"
            value={question} onChange={e => update({ roletaQuestion: e.target.value })} />
        </label>

        {/* Opções */}
        <p className="text-[15px] font-bold text-gray-800 mt-6 mb-2">Opções disponíveis</p>
        <div className="flex flex-col gap-2">
          {options.map((opt, i) => (
            <label key={i} className="bg-white rounded-2xl px-4 py-3.5 shadow-sm flex items-center gap-3 border-2 border-transparent focus-within:border-purple-300 transition-colors cursor-text">
              <span className="text-gray-300 text-[17px] shrink-0">☁</span>
              <input type="text" placeholder="Ex: Shopping"
                className="flex-1 outline-none text-[14px] text-gray-800 placeholder-gray-300 bg-transparent"
                value={opt} onChange={e => setOption(i, e.target.value)} />
              {options.length > 2 && (
                <button onClick={() => removeOption(i)}
                  className="text-gray-300 text-[15px] active:scale-90 transition-all shrink-0">✕</button>
              )}
            </label>
          ))}

          <button onClick={addOption}
            className="bg-white rounded-2xl py-3.5 shadow-sm flex items-center justify-center border-2 border-transparent active:scale-[0.98] transition-all">
            <span className="text-gray-400 text-[22px] font-light leading-none">+</span>
          </button>

          {!canNext && (
            <p className="text-[12px] text-gray-400 text-center mt-1">Adicione opções para sua roleta</p>
          )}
        </div>

        <div className="pb-4" />
      </div>

      {canNext && <PreviewFab onClick={() => setShowPreview(true)} />}
      <div className="step-bottom">
        <div className="flex gap-3">
          <button onClick={onBack}
            className="flex-1 border-2 border-gray-200 text-gray-600 rounded-2xl py-3.5 font-semibold text-[14px] flex items-center justify-center gap-1 active:scale-[0.97] transition-all">
            ‹ Voltar
          </button>
          <button onClick={onNext} disabled={!canNext}
            className={`flex-1 rounded-2xl py-3.5 font-semibold text-[14px] flex items-center justify-center gap-1 transition-all active:scale-[0.97]
              ${canNext ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'bg-gray-100 text-gray-400'}`}>
            Próximo Passo ›
          </button>
        </div>
      </div>
    </div>
  )
}
