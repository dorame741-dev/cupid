import { useState, useRef, useEffect } from 'react'
import { ImagePlus, X, ChevronLeft, ChevronRight, LayoutGrid, Smartphone } from 'lucide-react'
import PreviewFab from '../components/PreviewFab'
import BackButton from '../components/BackButton'
import { useQuiz } from '../context/QuizContext'

const MAX_PHOTOS = 15

/* ─── Step indicator (3 passos) ──────────────────────────────── */
function StepIndicator({ current }) {
  const dot = (n) => (
    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[12px] font-bold transition-all
      ${current > n  ? 'border-purple-500 bg-purple-500 text-white'
      : current === n ? 'border-purple-500 bg-white text-purple-600'
      :                 'border-gray-300 bg-white text-gray-400'}`}>
      {current > n ? '✓' : n}
    </div>
  )
  const line = (n) => (
    <div className={`flex-1 h-0.5 transition-all ${current > n ? 'bg-purple-500' : 'bg-gray-200'}`} />
  )
  return (
    <div className="flex items-center gap-2 mb-5">
      {dot(1)}{line(1)}{dot(2)}{line(2)}{dot(3)}
    </div>
  )
}

/* ─── Preview: Estilo Cartões ────────────────────────────────── */
function CardsPreview({ photos, onClose }) {
  const [idx, setIdx] = useState(0)
  const photo = photos[idx]

  return (
    <div className="step-root" style={{ background: '#111119' }}>
      <div className="step-scroll flex flex-col" style={{ background: '#111119' }}>
        <div className="px-5 pt-7 pb-3 shrink-0">
          <h2 className="text-[24px] font-black text-white leading-tight">
            {photo.title || 'Sem título'}
          </h2>
          {photo.desc ? (
            <p className="text-[14px] text-gray-400 mt-0.5">{photo.desc}</p>
          ) : null}
        </div>

        <div className="flex-1 flex flex-col justify-center px-4 pb-4">
          <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: '3/4' }}>
            <img src={photo.url} alt="" className="w-full h-full object-cover" />
            {idx > 0 && (
              <button onClick={() => setIdx(i => i - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 rounded-full flex items-center justify-center active:scale-90 transition-all">
                <ChevronLeft size={18} className="text-white" />
              </button>
            )}
            {idx < photos.length - 1 && (
              <button onClick={() => setIdx(i => i + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 rounded-full flex items-center justify-center active:scale-90 transition-all">
                <ChevronRight size={18} className="text-white" />
              </button>
            )}
          </div>

          {photos.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-3">
              {photos.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)}
                  className={`rounded-full transition-all ${i === idx ? 'w-4 h-1.5 bg-purple-400' : 'w-1.5 h-1.5 bg-white/20'}`} />
              ))}
            </div>
          )}
        </div>
      </div>

      <button onClick={onClose}
        className="absolute bottom-4 right-4 bg-purple-600 text-white rounded-full px-5 py-2.5 font-semibold text-[14px] active:scale-95 transition-all z-10">
        Voltar
      </button>
    </div>
  )
}

/* ─── Preview: Estilo Stories ────────────────────────────────── */
const STORY_DURATION = 4000

function StoriesPreview({ photos, onClose }) {
  const [idx, setIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const startRef = useRef(Date.now())
  const rafRef = useRef(null)

  const goTo = (next) => {
    const clamped = Math.max(0, Math.min(photos.length - 1, next))
    setIdx(clamped)
    setProgress(0)
    startRef.current = Date.now()
  }

  useEffect(() => {
    startRef.current = Date.now()
    setProgress(0)

    const tick = () => {
      const elapsed = Date.now() - startRef.current
      const pct = Math.min(100, (elapsed / STORY_DURATION) * 100)
      setProgress(pct)
      if (pct < 100) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        if (idx < photos.length - 1) {
          goTo(idx + 1)
        }
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [idx, photos.length])

  const photo = photos[idx]

  return (
    <div className="step-root" style={{ background: '#111119' }}>
      {/* barras de progresso */}
      <div className="shrink-0 flex gap-1 px-3 pt-3 pb-1" style={{ zIndex: 30, position: 'relative' }}>
        {photos.map((_, i) => (
          <div key={i} className="flex-1 rounded-full overflow-hidden" style={{ height: 3, background: 'rgba(255,255,255,0.25)' }}>
            <div className="h-full rounded-full bg-white"
              style={{ width: i < idx ? '100%' : i === idx ? `${progress}%` : '0%', transition: i === idx ? 'none' : 'width 0.1s' }} />
          </div>
        ))}
      </div>

      {/* foto ocupa o espaço restante */}
      <div className="flex-1 relative overflow-hidden">
        <img src={photo.url} alt="" className="w-full h-full object-cover" />

        {/* gradiente para leitura do título */}
        <div className="absolute inset-x-0 top-0 h-36 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.65), transparent)' }} />

        {/* título */}
        <div className="absolute top-0 left-0 right-0 px-5 pt-4 pointer-events-none" style={{ zIndex: 10 }}>
          <h2 className="text-[24px] font-black text-white leading-tight">
            {photo.title || ''}
          </h2>
          {photo.desc ? (
            <p className="text-[13px] text-white/70 mt-0.5">{photo.desc}</p>
          ) : null}
        </div>

        {/* zonas de toque — só laterais, não sobrepõem rodapé */}
        <button onClick={() => goTo(idx - 1)} className="absolute left-0 top-0 w-1/3" style={{ height: 'calc(100% - 60px)', zIndex: 20 }} />
        <button onClick={() => goTo(idx + 1)} className="absolute right-0 top-0 w-1/3" style={{ height: 'calc(100% - 60px)', zIndex: 20 }} />
      </div>

      {/* rodapé com Voltar */}
      <div className="shrink-0 flex justify-end px-4 py-3" style={{ zIndex: 30, position: 'relative' }}>
        <button onClick={onClose}
          className="bg-purple-600 text-white rounded-full px-5 py-2.5 font-semibold text-[14px] active:scale-95 transition-all">
          Voltar
        </button>
      </div>
    </div>
  )
}

/* ─── Main ───────────────────────────────────────────────────── */
export default function StepGaleria({ onNext, onBack }) {
  const { data, update } = useQuiz()
  const [subStep, setSubStep]       = useState(1)
  const [showPreview, setShowPreview] = useState(false)
  const [captionIdx, setCaptionIdx]  = useState(0)
  const inputRef = useRef(null)

  const photos     = data.galeriaPhotos
  const style      = data.galeriaStyle
  const canPreview = photos.length > 0

  const handleFiles = (e) => {
    const files = Array.from(e.target.files)
    const remaining = MAX_PHOTOS - photos.length
    const toAdd = files.slice(0, remaining).map(f => ({
      url: URL.createObjectURL(f), title: '', desc: '',
    }))
    if (toAdd.length) update({ galeriaPhotos: [...photos, ...toAdd] })
    e.target.value = ''
  }

  const removePhoto = (i) => {
    const next = photos.filter((_, j) => j !== i)
    update({ galeriaPhotos: next })
    if (captionIdx >= next.length) setCaptionIdx(Math.max(0, next.length - 1))
  }

  const updateCaption = (field, val) => {
    const next = [...photos]
    next[captionIdx] = { ...next[captionIdx], [field]: val }
    update({ galeriaPhotos: next })
  }

  /* ── Preview ── */
  if (showPreview) {
    if (style === 'stories') return <StoriesPreview photos={photos} onClose={() => setShowPreview(false)} />
    return <CardsPreview photos={photos} onClose={() => setShowPreview(false)} />
  }

  /* ── Sub-step 1: Upload ── */
  if (subStep === 1) return (
    <div className="step-root">
      <div className="step-scroll">
        <div className="flex items-center gap-3 pt-3 mb-2">
          <BackButton onClick={onBack} />
        </div>
        <StepIndicator current={1} />

        <h1 className="text-[22px] font-black text-gray-900">Galeria de Imagens</h1>
        <p className="text-[14px] text-gray-500 mt-1">Faça upload das suas imagens favoritas</p>

        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />

        {photos.length === 0 ? (
          <button onClick={() => inputRef.current?.click()}
            className="w-full mt-5 border-2 border-dashed border-purple-200 rounded-3xl p-10 flex flex-col items-center gap-3 bg-purple-50/30 active:scale-[0.98] transition-all">
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
              <ImagePlus size={26} className="text-purple-500" />
            </div>
            <div className="text-center">
              <p className="text-[15px] font-bold text-gray-700">Selecionar Imagens (Clique)</p>
              <p className="text-[13px] text-purple-500 mt-1">Limite: {MAX_PHOTOS} de {MAX_PHOTOS}.</p>
            </div>
          </button>
        ) : (
          <div className="mt-4">
            <div className="grid grid-cols-3 gap-2">
              {photos.map((p, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden">
                  <img src={p.url} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center active:scale-90 transition-all">
                    <X size={12} className="text-white" />
                  </button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <button onClick={() => inputRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-purple-200 flex flex-col items-center justify-center gap-1 bg-purple-50/50 active:scale-[0.98] transition-all">
                  <ImagePlus size={20} className="text-purple-400" />
                  <span className="text-[10px] text-purple-400 font-semibold">{MAX_PHOTOS - photos.length} restantes</span>
                </button>
              )}
            </div>
          </div>
        )}
        <div className="pb-4" />
      </div>

      {canPreview && <PreviewFab onClick={() => setShowPreview(true)} />}
      <div className="step-bottom">
        <div className="flex gap-3">
          <button onClick={onBack}
            className="flex-1 border-2 border-gray-200 text-gray-600 rounded-2xl py-3.5 font-semibold text-[14px] flex items-center justify-center gap-1 active:scale-[0.97] transition-all">
            ‹ Voltar
          </button>
          <button onClick={() => setSubStep(2)} disabled={!canPreview}
            className={`flex-1 rounded-2xl py-3.5 font-semibold text-[14px] flex items-center justify-center gap-1 transition-all active:scale-[0.97]
              ${canPreview ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'bg-gray-100 text-gray-400'}`}>
            Próximo Passo ›
          </button>
        </div>
      </div>
    </div>
  )

  /* ── Sub-step 2: Legendas ── */
  if (subStep === 2) {
    const cp = photos[captionIdx] || {}
    return (
      <div className="step-root">
        <div className="step-scroll">
          <div className="flex items-center gap-3 pt-3 mb-2">
            <BackButton onClick={() => setSubStep(1)} />
          </div>
          <StepIndicator current={2} />

          <h1 className="text-[22px] font-black text-gray-900">Galeria de Imagens</h1>
          <p className="text-[14px] text-gray-500 mt-1">Adicione legendas às suas imagens (opcional)</p>

          <p className="text-[15px] font-bold text-gray-800 mt-5 mb-3">Adicione legendas às suas fotos</p>

          {/* carrossel */}
          <div className="relative rounded-3xl overflow-hidden bg-gray-100" style={{ aspectRatio: '4/3' }}>
            <img src={cp.url} alt="" className="w-full h-full object-cover" />
            {captionIdx > 0 && (
              <button onClick={() => setCaptionIdx(i => i - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 rounded-full flex items-center justify-center active:scale-90 transition-all">
                <ChevronLeft size={18} className="text-white" />
              </button>
            )}
            {captionIdx < photos.length - 1 && (
              <button onClick={() => setCaptionIdx(i => i + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 rounded-full flex items-center justify-center active:scale-90 transition-all">
                <ChevronRight size={18} className="text-white" />
              </button>
            )}
            <div className="absolute bottom-2 right-3 bg-black/50 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
              {captionIdx + 1} de {photos.length}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <label className="bg-white rounded-2xl px-4 py-3.5 shadow-sm flex items-center gap-3 border-2 border-transparent focus-within:border-purple-300 transition-colors cursor-text">
              <input type="text" placeholder="Título da imagem (opcional)"
                className="flex-1 outline-none text-[14px] text-gray-800 placeholder-gray-300 bg-transparent"
                value={cp.title || ''} onChange={e => updateCaption('title', e.target.value)} />
            </label>
            <label className="bg-white rounded-2xl px-4 py-3.5 shadow-sm flex items-center gap-3 border-2 border-transparent focus-within:border-purple-300 transition-colors cursor-text">
              <input type="text" placeholder="Descrição (opcional)"
                className="flex-1 outline-none text-[14px] text-gray-800 placeholder-gray-300 bg-transparent"
                value={cp.desc || ''} onChange={e => updateCaption('desc', e.target.value)} />
            </label>
          </div>
          <div className="pb-4" />
        </div>

        {canPreview && <PreviewFab onClick={() => setShowPreview(true)} />}
        <div className="step-bottom">
          <div className="flex gap-3">
            <button onClick={() => setSubStep(1)}
              className="flex-1 border-2 border-gray-200 text-gray-600 rounded-2xl py-3.5 font-semibold text-[14px] flex items-center justify-center gap-1 active:scale-[0.97] transition-all">
              ‹ Voltar
            </button>
            <button onClick={() => setSubStep(3)}
              className="flex-1 bg-purple-600 text-white rounded-2xl py-3.5 font-semibold text-[14px] flex items-center justify-center gap-1 shadow-lg shadow-purple-200 active:scale-[0.97] transition-all">
              Próximo Passo ›
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ── Sub-step 3: Estilo ── */
  return (
    <div className="step-root">
      <div className="step-scroll">
        <div className="flex items-center gap-3 pt-3 mb-2">
          <BackButton onClick={() => setSubStep(2)} />
        </div>
        <StepIndicator current={3} />

        <h1 className="text-[22px] font-black text-gray-900">Galeria de Imagens</h1>
        <p className="text-[14px] text-gray-500 mt-1">Escolha o layout da sua galeria</p>

        <div className="mt-6 flex flex-col gap-3">
          <button onClick={() => update({ galeriaStyle: 'cards' })}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all active:scale-[0.98]
              ${style === 'cards' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white'}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
              ${style === 'cards' ? 'bg-purple-100' : 'bg-gray-100'}`}>
              <LayoutGrid size={20} className={style === 'cards' ? 'text-purple-600' : 'text-gray-400'} />
            </div>
            <div className="flex-1 text-left">
              <p className={`text-[15px] font-bold ${style === 'cards' ? 'text-purple-700' : 'text-gray-800'}`}>Estilo Cartões</p>
              <p className="text-[12px] text-gray-400 mt-0.5">Fotos empilhadas como cartas, ideal para destaque individual.</p>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
              ${style === 'cards' ? 'border-purple-500 bg-purple-500' : 'border-gray-300'}`}>
              {style === 'cards' && <span className="text-white text-[11px] font-black">✓</span>}
            </div>
          </button>

          <p className="text-center text-[13px] text-gray-400 font-medium">OU</p>

          <button onClick={() => update({ galeriaStyle: 'stories' })}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all active:scale-[0.98]
              ${style === 'stories' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white'}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
              ${style === 'stories' ? 'bg-purple-100' : 'bg-gray-100'}`}>
              <Smartphone size={20} className={style === 'stories' ? 'text-purple-600' : 'text-gray-400'} />
            </div>
            <div className="flex-1 text-left">
              <p className={`text-[15px] font-bold ${style === 'stories' ? 'text-purple-700' : 'text-gray-800'}`}>Estilo Stories</p>
              <p className="text-[12px] text-gray-400 mt-0.5">Navegação imersiva, semelhante aos stories do Instagram.</p>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
              ${style === 'stories' ? 'border-purple-500 bg-purple-500' : 'border-gray-300'}`}>
              {style === 'stories' && <span className="text-white text-[11px] font-black">✓</span>}
            </div>
          </button>
        </div>
        <div className="pb-4" />
      </div>

      {canPreview && <PreviewFab onClick={() => setShowPreview(true)} />}
      <div className="step-bottom">
        <div className="flex gap-3">
          <button onClick={() => setSubStep(2)}
            className="flex-1 border-2 border-gray-200 text-gray-600 rounded-2xl py-3.5 font-semibold text-[14px] flex items-center justify-center gap-1 active:scale-[0.97] transition-all">
            ‹ Voltar
          </button>
          <button onClick={onNext}
            className="flex-1 bg-purple-600 text-white rounded-2xl py-3.5 font-semibold text-[14px] flex items-center justify-center gap-1 shadow-lg shadow-purple-200 active:scale-[0.97] transition-all">
            Próximo Passo ›
          </button>
        </div>
      </div>
    </div>
  )
}
