import { useState, useEffect, useMemo, useRef } from 'react'
import { Shuffle, Maximize2 } from 'lucide-react'
import PreviewFab from '../components/PreviewFab'
import BackButton from '../components/BackButton'
import CitySearch from '../components/CitySearch'
import { useQuiz } from '../context/QuizContext'

const MAX_TEXTO = 50

const TEXTOS_ALEATORIOS = [
  'O céu quando nossos mundos colidiram...',
  'As estrelas que brilharam no nosso início.',
  'O universo conspirou para nos unir.',
  'O céu que testemunhou o nosso começo.',
  'Mapa do instante em que tudo mudou.',
]

/* ─── Step indicator ─────────────────────────────────────────── */
function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[12px] font-bold transition-all
        ${current > 1 ? 'border-purple-500 bg-purple-500 text-white' : 'border-purple-500 bg-white text-purple-600'}`}>
        {current > 1 ? '✓' : '1'}
      </div>
      <div className={`flex-1 h-0.5 transition-all ${current >= 2 ? 'bg-purple-500' : 'bg-gray-200'}`} />
      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[12px] font-bold transition-all
        ${current >= 2 ? 'border-purple-500 bg-purple-50 text-purple-600' : 'border-gray-300 bg-white text-gray-400'}`}>
        2
      </div>
    </div>
  )
}

/* ─── Constellation SVG ──────────────────────────────────────── */
function ConstellationMap({ seed }) {
  const { pts, lines } = useMemo(() => {
    let s = (Math.abs(seed) || 54321) & 0x7fffffff
    const rand = () => {
      s = (Math.imul(1664525, s) + 1013904223) & 0x7fffffff
      return s / 0x7fffffff
    }

    const cx = 150, cy = 150, r = 125
    const pts = []
    for (let i = 0; i < 22; i++) {
      const angle = rand() * 2 * Math.PI
      const dist  = Math.sqrt(rand()) * r * 0.9
      pts.push({ x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) })
    }

    const lines = []
    pts.forEach((p, i) => {
      const near = pts
        .map((q, j) => ({ j, d: Math.hypot(p.x - q.x, p.y - q.y) }))
        .filter(({ j, d }) => j > i && d > 18 && d < 62)
        .sort((a, b) => a.d - b.d)
        .slice(0, 2)
      near.forEach(({ j }) => lines.push([i, j]))
    })

    return { pts, lines }
  }, [seed])

  const cx = 150, cy = 150

  return (
    <svg viewBox="0 0 300 300" width={260} height={260}>
      {/* fundo escuro do círculo */}
      <circle cx={cx} cy={cy} r={133} fill="#06060f" />

      {/* anéis concêntricos */}
      {[44, 88, 133].map((rr, i) => (
        <circle key={i} cx={cx} cy={cy} r={rr}
          fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
      ))}

      {/* cross lines sutis no centro */}
      <line x1={cx - 8} y1={cy} x2={cx + 8} y2={cy} stroke="rgba(255,255,255,0.1)" strokeWidth={0.8} />
      <line x1={cx} y1={cy - 8} x2={cx} y2={cy + 8} stroke="rgba(255,255,255,0.1)" strokeWidth={0.8} />

      {/* linhas das constelações */}
      {lines.map(([a, b], i) => (
        <line key={i}
          x1={pts[a].x} y1={pts[a].y}
          x2={pts[b].x} y2={pts[b].y}
          stroke="rgba(255,255,255,0.4)" strokeWidth={0.9} />
      ))}

      {/* estrelas */}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={i % 4 === 0 ? 2.5 : 1.5}
          fill="white" opacity={i % 4 === 0 ? 0.95 : 0.65} />
      ))}
    </svg>
  )
}

/* ─── Preview ────────────────────────────────────────────────── */
function EstelaPreview({ texto, city, myName, partnerName, relationshipStart, onClose }) {
  const [coords, setCoords] = useState(null)

  // tenta buscar coordenadas via Nominatim (gracioso se offline)
  useEffect(() => {
    if (!city) return
    const query = encodeURIComponent(city.replace(' - ', ', ') + ', Brasil')
    fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`)
      .then(r => r.json())
      .then(data => {
        if (data[0]) {
          const lat = parseFloat(data[0].lat)
          const lon = parseFloat(data[0].lon)
          const latStr = `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? 'N' : 'S'}`
          const lonStr = `${Math.abs(lon).toFixed(4)}°${lon >= 0 ? 'E' : 'W'}`
          setCoords(`${latStr} ${lonStr}`)
        }
      })
      .catch(() => {})
  }, [city])

  const formatDate = (d) => {
    if (!d) return ''
    const months = ['JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO','JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO']
    const parts = d.replace(/[-/]/g, '/').split('/')
    if (parts.length === 3) {
      const [dia, mes, ano] = parts.length === 3 && parts[0].length <= 2
        ? parts : [parts[2], parts[1], parts[0]]
      const m = months[parseInt(mes) - 1]
      return m ? `${dia} DE ${m} DE ${ano}` : d.toUpperCase()
    }
    return d.toUpperCase()
  }

  const hashStr = (s) => [...s].reduce((h, c) => (Math.imul(31, h) + c.charCodeAt(0)) | 0, 0)
  const seed = Math.abs(hashStr((city || '') + (myName || '') + (partnerName || '')))

  const cityDisplay = city ? city.toUpperCase() + ', BRASIL' : ''
  const coupleTitle = [myName, partnerName].filter(Boolean).join(' e ') || 'Mapa das Estrelas'

  return (
    <div className="step-root" style={{ background: '#050510' }}>
      <div className="step-scroll flex flex-col items-center" style={{ background: '#050510' }}>

        {/* nomes do casal */}
        <div className="pt-7 pb-2 text-center px-4">
          <p className="text-white text-[26px] leading-tight"
            style={{ fontFamily: 'cursive', fontStyle: 'italic', fontWeight: 400 }}>
            {coupleTitle}
          </p>
        </div>

        {/* mapa de constelações */}
        <div className="my-3">
          <ConstellationMap seed={seed} />
        </div>

        {/* texto em aspas */}
        {texto && (
          <p className="text-center text-white text-[16px] font-semibold px-8 leading-snug mb-3">
            "{texto}"
          </p>
        )}

        {/* info da cidade e data */}
        <div className="text-center pb-10 px-4">
          {cityDisplay && (
            <p className="text-[11px] font-bold tracking-widest mb-1"
              style={{ color: '#9d7aff' }}>
              {cityDisplay}
            </p>
          )}
          {relationshipStart && (
            <p className="text-[11px] font-bold tracking-widest mb-1"
              style={{ color: '#9d7aff' }}>
              {formatDate(relationshipStart)}
            </p>
          )}
          {coords && (
            <p className="text-[11px] font-bold tracking-widest"
              style={{ color: '#9d7aff' }}>
              {coords}
            </p>
          )}
        </div>

        {/* botão próxima seção */}
        <div className="pb-8">
          <button onClick={onClose}
            className="bg-white text-gray-900 font-bold text-[15px] px-10 py-3.5 rounded-full shadow-xl active:scale-95 transition-all">
            Próxima Seção
          </button>
        </div>
      </div>

      <button onClick={onClose}
        className="absolute bottom-4 right-4 bg-purple-600 text-white rounded-full px-5 py-2.5 font-semibold text-[14px] active:scale-95 transition-all z-10">
        Voltar
      </button>
    </div>
  )
}

/* ─── Main ───────────────────────────────────────────────────── */
export default function StepEstrelas({ onNext, onBack }) {
  const { data, update } = useQuiz()
  const [subStep, setSubStep] = useState(1)
  const [showPreview, setShowPreview] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const texto = data.estrelaTexto || ''
  const city  = data.estrelaCity  || ''

  const canNext1   = true
  const canConcluir = city.trim().length > 0

  if (showPreview) return (
    <EstelaPreview
      texto={texto}
      city={city}
      myName={data.myName}
      partnerName={data.partnerName}
      relationshipStart={data.relationshipStart}
      onClose={() => setShowPreview(false)}
    />
  )

  /* ── Sub-step 1: texto ── */
  if (subStep === 1) return (
    <div className="step-root">
      <div className="step-scroll">
        <div className="flex items-center gap-3 pt-3 mb-2">
          <BackButton onClick={onBack} />
        </div>
        <StepIndicator current={1} />

        <h1 className="text-[22px] font-black text-gray-900">Mapa das Estrelas</h1>
        <p className="text-[14px] text-gray-500 mt-1">Defina o texto principal dessa página tão especial</p>

        <div className="mt-6">
          <div className="bg-white rounded-2xl shadow-sm border-2 border-transparent focus-within:border-purple-300 transition-colors overflow-hidden">
            <textarea
              rows={expanded ? 6 : 3}
              maxLength={MAX_TEXTO}
              placeholder="Ex: O céu quando nossos mundos colidiram..."
              className="w-full outline-none text-[14px] text-gray-700 resize-none placeholder-gray-300 p-4 bg-transparent leading-relaxed"
              value={texto}
              onChange={e => update({ estrelaTexto: e.target.value })}
            />
            <div className="flex items-center gap-4 px-4 pb-3 pt-1 border-t border-gray-100">
              <button onClick={() => update({ estrelaTexto: TEXTOS_ALEATORIOS[Math.floor(Math.random() * TEXTOS_ALEATORIOS.length)] })}
                className="flex items-center gap-1.5 text-[12px] text-purple-600 font-semibold active:scale-95 transition-all">
                <Shuffle size={12} /> Gerar Aleatório
              </button>
              <button onClick={() => setExpanded(v => !v)}
                className="flex items-center gap-1.5 text-[12px] text-gray-400 active:scale-95 transition-all">
                <Maximize2 size={12} /> Expandir
              </button>
              <span className="ml-auto text-[11px] text-gray-400 tabular-nums">{texto.length}/{MAX_TEXTO}</span>
            </div>
          </div>
        </div>
        <div className="pb-4" />
      </div>

      <PreviewFab onClick={() => setShowPreview(true)} />
      <div className="step-bottom">
        <div className="flex gap-3">
          <button onClick={onBack}
            className="flex-1 border-2 border-gray-200 text-gray-600 rounded-2xl py-3.5 font-semibold text-[14px] flex items-center justify-center gap-1 active:scale-[0.97] transition-all">
            ‹ Voltar
          </button>
          <button onClick={() => setSubStep(2)}
            className="flex-1 bg-purple-600 text-white rounded-2xl py-3.5 font-semibold text-[14px] flex items-center justify-center gap-1 shadow-lg shadow-purple-200 active:scale-[0.97] transition-all">
            Próximo Passo ›
          </button>
        </div>
      </div>
    </div>
  )

  /* ── Sub-step 2: cidade ── */
  return (
    <div className="step-root">
      <div className="step-scroll">
        <div className="flex items-center gap-3 pt-3 mb-2">
          <BackButton onClick={() => setSubStep(1)} />
        </div>
        <StepIndicator current={2} />

        <h1 className="text-[22px] font-black text-gray-900">Mapa das Estrelas</h1>
        <p className="text-[14px] text-gray-500 mt-1">Em qual cidade esse marco da vida de vocês aconteceu?</p>

        <div className="mt-6">
          <CitySearch
            value={city}
            onChange={val => update({ estrelaCity: val })}
          />
        </div>
        <div className="pb-4" />
      </div>

      <PreviewFab onClick={() => setShowPreview(true)} />
      <div className="step-bottom">
        <div className="flex gap-3">
          <button onClick={() => setSubStep(1)}
            className="flex-1 border-2 border-gray-200 text-gray-600 rounded-2xl py-3.5 font-semibold text-[14px] flex items-center justify-center gap-1 active:scale-[0.97] transition-all">
            ‹ Voltar
          </button>
          <button onClick={onNext}
            className="flex-1 bg-purple-600 text-white rounded-2xl py-3.5 font-semibold text-[14px] flex items-center justify-center gap-1 shadow-lg shadow-purple-200 active:scale-[0.97] transition-all">
            Concluir ›
          </button>
        </div>
      </div>
    </div>
  )
}
