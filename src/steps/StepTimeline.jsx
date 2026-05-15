import { useState, useRef, useMemo } from 'react'
import { ImagePlus, X, Calendar, FileText, Quote, AlignLeft, Heart, Type, GripVertical } from 'lucide-react'
import PreviewFab from '../components/PreviewFab'
import BackButton from '../components/BackButton'
import { useQuiz } from '../context/QuizContext'

const MAX_TITLE   = 50
const MAX_SUB     = 150
const MAX_CLOSING = 80
const MAX_DESC    = 200
const MAX_LEGEND  = 60

/* ─── Step indicator (2 passos) ──────────────────────────────── */
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

/* ─── Stars background ───────────────────────────────────────── */
function Stars() {
  const dots = useMemo(() =>
    Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: +(Math.random() * 100).toFixed(1),
      y: +(Math.random() * 100).toFixed(1),
      s: Math.random() < 0.6 ? 1 : 1.5,
      o: +(0.15 + Math.random() * 0.5).toFixed(2),
    })), [])
  return (
    <>
      {dots.map(d => (
        <div key={d.id} style={{
          position: 'absolute',
          left: `${d.x}%`, top: `${d.y}%`,
          width: d.s, height: d.s,
          background: 'white', borderRadius: '50%', opacity: d.o,
          pointerEvents: 'none',
        }} />
      ))}
    </>
  )
}

/* ─── Polaroid card ──────────────────────────────────────────── */
function Polaroid({ photoUrl, legend, rotate = 0 }) {
  return (
    <div style={{
      background: 'white',
      padding: '8px 8px 28px 8px',
      borderRadius: 2,
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      transform: `rotate(${rotate}deg)`,
      flexShrink: 0,
      width: 130,
    }}>
      <div style={{ width: '100%', aspectRatio: '1', background: '#1a1a26', overflow: 'hidden' }}>
        {photoUrl
          ? <img src={photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 24, opacity: 0.2 }}>♥</div>
            </div>}
      </div>
      {legend && (
        <p style={{
          textAlign: 'center', fontSize: 11, color: '#555',
          marginTop: 6, fontStyle: 'italic', fontFamily: 'cursive',
          lineHeight: 1.3, padding: '0 2px',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {legend}
        </p>
      )}
    </div>
  )
}

/* ─── Timeline Preview ───────────────────────────────────────── */
function TimelinePreview({ title, subtitle, closing, moments, onClose }) {
  return (
    <div className="step-root" style={{ background: '#0d0d18', position: 'relative' }}>
      {/* fundo estrelado fixo */}
      <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0, pointerEvents: 'none' }}>
        <Stars />
      </div>

      <div className="step-scroll flex flex-col" style={{ background: 'transparent', zIndex: 1, position: 'relative' }}>
        {/* cabeçalho */}
        <div className="text-center px-5 pt-8 pb-6">
          <h2 className="text-[26px] font-black text-white leading-tight">{title || 'Nossa Jornada'}</h2>
          <p className="text-[14px] mt-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{subtitle}</p>
        </div>

        {/* momentos alternados */}
        <div className="flex flex-col gap-8 px-3 pb-4">
          {moments.map((m, i) => {
            const isLeft = i % 2 === 0
            const rotate = isLeft ? -3 : 3

            return (
              <div key={i} className="flex items-center gap-3">
                {isLeft ? (
                  <>
                    <Polaroid photoUrl={m.photoUrl} legend={m.legenda} rotate={rotate} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <p className="font-bold text-[14px] leading-tight" style={{ color: '#ff4d7d' }}>{m.data}</p>
                        <span style={{ color: '#ff4d7d', fontSize: 11 }}>♥</span>
                      </div>
                      <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>{m.descricao}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-1 min-w-0 text-right">
                      <div className="flex items-center justify-end gap-1.5 mb-1">
                        <span style={{ color: '#ff4d7d', fontSize: 11 }}>♥</span>
                        <p className="font-bold text-[14px] leading-tight" style={{ color: '#ff4d7d' }}>{m.data}</p>
                      </div>
                      <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>{m.descricao}</p>
                    </div>
                    <Polaroid photoUrl={m.photoUrl} legend={m.legenda} rotate={rotate} />
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* texto de encerramento */}
        {closing && (
          <div className="px-5 pt-4 pb-6 text-center">
            <p className="text-[22px] font-black text-white leading-snug">{closing}</p>
          </div>
        )}

        {/* botão próxima seção */}
        <div className="flex justify-center pb-8">
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

/* ─── Moment card ────────────────────────────────────────────── */
function MomentCard({ moment, idx, onChange, onRemove }) {
  const inputRef = useRef(null)
  const set = (field, val) => onChange({ ...moment, [field]: val })

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    set('photoUrl', URL.createObjectURL(file))
    e.target.value = ''
  }

  return (
    <div className="w-full bg-white rounded-3xl shadow-sm overflow-hidden mb-4">
      {/* header */}
      <div className="flex items-center px-4 pt-4 pb-2 gap-2">
        <GripVertical size={16} className="text-gray-300 shrink-0" />
        <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
          <span className="text-[11px] font-black text-purple-600">{idx + 1}</span>
        </div>
        <div className="flex-1" />
        <button onClick={onRemove} className="w-7 h-7 flex items-center justify-center active:scale-90 transition-all">
          <X size={15} className="text-gray-400" />
        </button>
      </div>

      {/* foto */}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
      <button onClick={() => inputRef.current?.click()}
        className="mx-4 mb-4 w-[calc(100%-32px)] rounded-2xl border-2 border-dashed border-purple-200 flex flex-col items-center justify-center gap-2 bg-purple-50/50 active:scale-[0.98] transition-all overflow-hidden"
        style={{ aspectRatio: '4/3' }}>
        {moment.photoUrl
          ? <img src={moment.photoUrl} alt="" className="w-full h-full object-cover" />
          : <>
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <ImagePlus size={20} className="text-purple-500" />
              </div>
              <p className="text-[13px] font-semibold text-gray-400">Clique para enviar</p>
            </>}
      </button>

      <div className="px-4 pb-4 flex flex-col gap-3">
        {/* data */}
        <div>
          <p className="text-[12px] font-semibold text-gray-500 mb-1.5">Data do Evento</p>
          <label className="bg-gray-50 rounded-2xl px-4 py-3.5 flex items-center gap-3 border-2 border-transparent focus-within:border-purple-300 transition-colors cursor-text">
            <Calendar size={14} className="text-gray-400 shrink-0" />
            <input type="text" placeholder="Ex: Janeiro 2023 ou 15/01/2023"
              className="flex-1 outline-none text-[14px] text-gray-700 placeholder-gray-300 bg-transparent"
              value={moment.data || ''} onChange={e => set('data', e.target.value)} />
          </label>
        </div>

        {/* descrição */}
        <div>
          <p className="text-[12px] font-semibold text-gray-500 mb-1.5">Descrição do Momento</p>
          <label className="bg-gray-50 rounded-2xl px-4 py-3.5 flex items-start gap-3 border-2 border-transparent focus-within:border-purple-300 transition-colors cursor-text">
            <FileText size={14} className="text-gray-400 shrink-0 mt-0.5" />
            <textarea rows={3} placeholder="O que aconteceu de especial?" maxLength={MAX_DESC}
              className="flex-1 outline-none text-[14px] text-gray-700 placeholder-gray-300 bg-transparent resize-none leading-relaxed"
              value={moment.descricao || ''} onChange={e => set('descricao', e.target.value)} />
          </label>
        </div>

        {/* legenda */}
        <div>
          <p className="text-[12px] font-semibold text-gray-500 mb-1.5">Legenda da Foto <span className="text-gray-400">(opcional)</span></p>
          <label className="bg-gray-50 rounded-2xl px-4 py-3.5 flex items-center gap-3 border-2 border-transparent focus-within:border-purple-300 transition-colors cursor-text">
            <Quote size={14} className="text-gray-400 shrink-0" />
            <input type="text" placeholder="Uma frase curta para a foto" maxLength={MAX_LEGEND}
              className="flex-1 outline-none text-[14px] text-gray-700 placeholder-gray-300 bg-transparent"
              value={moment.legenda || ''} onChange={e => set('legenda', e.target.value)} />
          </label>
        </div>
      </div>
    </div>
  )
}

/* ─── Main ───────────────────────────────────────────────────── */
export default function StepTimeline({ onNext, onBack }) {
  const { data, update } = useQuiz()
  const [subStep, setSubStep] = useState(1)
  const [showPreview, setShowPreview] = useState(false)

  const title   = data.timelineTitle
  const sub     = data.timelineSubtitle
  const closing = data.timelineClosing
  const moments = data.timelineMoments

  const canNext2   = moments.some(m => m.data?.trim() || m.descricao?.trim())
  const canPreview = subStep === 1 || moments.length > 0

  const addMoment    = () => update({ timelineMoments: [...moments, { photoUrl: '', data: '', descricao: '', legenda: '' }] })
  const updateMoment = (i, m) => { const next = [...moments]; next[i] = m; update({ timelineMoments: next }) }
  const removeMoment = (i) => update({ timelineMoments: moments.filter((_, j) => j !== i) })

  /* ── Preview ── */
  if (showPreview) return (
    <TimelinePreview
      title={title} subtitle={sub} closing={closing}
      moments={moments.length > 0 ? moments : [{ photoUrl: '', data: 'Janeiro 2024', descricao: 'Um momento especial entre nós.', legenda: '' }]}
      onClose={() => setShowPreview(false)}
    />
  )

  /* ── Sub-step 1: textos ── */
  if (subStep === 1) return (
    <div className="step-root">
      <div className="step-scroll">
        <div className="flex items-center gap-3 pt-3 mb-2">
          <BackButton onClick={onBack} />
        </div>
        <StepIndicator current={1} />

        <h1 className="text-[22px] font-black text-gray-900">Linha do Tempo Mágica</h1>
        <p className="text-[14px] text-gray-500 mt-1">Defina os textos principais que darão o tom da sua linha do tempo.</p>

        <div className="mt-6 flex flex-col gap-5">
          {/* título */}
          <div>
            <div className="flex justify-between mb-1.5">
              <p className="text-[13px] font-semibold text-gray-600">Título Principal</p>
              <span className="text-[12px] text-gray-400 tabular-nums">{title.length}/{MAX_TITLE}</span>
            </div>
            <label className="bg-white rounded-2xl px-4 py-3.5 shadow-sm flex items-center gap-3 border-2 border-transparent focus-within:border-purple-300 transition-colors cursor-text">
              <Type size={15} className="text-purple-400 shrink-0" />
              <input type="text" maxLength={MAX_TITLE}
                className="flex-1 outline-none text-[14px] text-gray-800 bg-transparent"
                value={title} onChange={e => update({ timelineTitle: e.target.value })} />
            </label>
          </div>

          {/* subtítulo */}
          <div>
            <div className="flex justify-between mb-1.5">
              <p className="text-[13px] font-semibold text-gray-600">Subtítulo</p>
              <span className="text-[12px] text-gray-400 tabular-nums">{sub.length}/{MAX_SUB}</span>
            </div>
            <label className="bg-white rounded-2xl px-4 py-3.5 shadow-sm flex items-center gap-3 border-2 border-transparent focus-within:border-purple-300 transition-colors cursor-text">
              <AlignLeft size={15} className="text-purple-400 shrink-0" />
              <input type="text" maxLength={MAX_SUB}
                className="flex-1 outline-none text-[14px] text-gray-800 bg-transparent"
                value={sub} onChange={e => update({ timelineSubtitle: e.target.value })} />
            </label>
          </div>

          {/* encerramento */}
          <div>
            <div className="flex justify-between mb-1.5">
              <p className="text-[13px] font-semibold text-gray-600">Texto de Encerramento</p>
              <span className="text-[12px] text-gray-400 tabular-nums">{closing.length}/{MAX_CLOSING}</span>
            </div>
            <label className="bg-white rounded-2xl px-4 py-3.5 shadow-sm flex items-center gap-3 border-2 border-transparent focus-within:border-purple-300 transition-colors cursor-text">
              <Heart size={15} className="text-purple-400 shrink-0" />
              <input type="text" maxLength={MAX_CLOSING}
                className="flex-1 outline-none text-[14px] text-gray-800 bg-transparent"
                value={closing} onChange={e => update({ timelineClosing: e.target.value })} />
            </label>
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

  /* ── Sub-step 2: momentos ── */
  return (
    <div className="step-root">
      <div className="step-scroll">
        <div className="flex items-center gap-3 pt-3 mb-2">
          <BackButton onClick={() => setSubStep(1)} />
        </div>
        <StepIndicator current={2} />

        <h1 className="text-[22px] font-black text-gray-900">Linha do Tempo Mágica</h1>
        <p className="text-[14px] text-gray-500 mt-1">Quais foram os momentos que definiram a jornada de vocês? Adicione aqui.</p>

        {moments.length === 0 ? (
          <button onClick={addMoment}
            className="w-full mt-5 border-2 border-dashed border-gray-200 rounded-3xl p-10 flex flex-col items-center gap-3 bg-white active:scale-[0.98] transition-all">
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
              <Calendar size={26} className="text-purple-500" />
            </div>
            <div className="text-center">
              <p className="text-[15px] font-bold text-gray-700">Adicionar o primeiro momento</p>
              <p className="text-[13px] text-purple-500 mt-1">Clique aqui para começar a sua linha do tempo.</p>
            </div>
          </button>
        ) : (
          <>
            {moments.map((m, i) => (
              <MomentCard key={i} moment={m} idx={i}
                onChange={(updated) => updateMoment(i, updated)}
                onRemove={() => removeMoment(i)} />
            ))}
            <button onClick={addMoment}
              className="w-full mt-1 bg-purple-600 text-white rounded-2xl py-3.5 font-semibold text-[14px] flex items-center justify-center gap-2 shadow-lg shadow-purple-200 active:scale-[0.98] transition-all">
              + Adicionar outro momento
            </button>
          </>
        )}
        <div className="pb-4" />
      </div>

      {canPreview && moments.length > 0 && <PreviewFab onClick={() => setShowPreview(true)} />}
      <div className="step-bottom">
        <div className="flex gap-3">
          <button onClick={() => setSubStep(1)}
            className="flex-1 border-2 border-gray-200 text-gray-600 rounded-2xl py-3.5 font-semibold text-[14px] flex items-center justify-center gap-1 active:scale-[0.97] transition-all">
            ‹ Voltar
          </button>
          <button onClick={onNext} disabled={!canNext2}
            className={`flex-1 rounded-2xl py-3.5 font-semibold text-[14px] flex items-center justify-center gap-1 transition-all active:scale-[0.97]
              ${canNext2 ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'bg-gray-100 text-gray-400'}`}>
            Próximo Passo ›
          </button>
        </div>
      </div>
    </div>
  )
}
