import { useState, useRef } from 'react'
import { ImagePlus, MapPin, Calendar, Tag, Type, AlignLeft, Shuffle, Maximize2, X, Globe } from 'lucide-react'
import PreviewFab from '../components/PreviewFab'
import BackButton from '../components/BackButton'
import CitySearch from '../components/CitySearch'
import { useQuiz } from '../context/QuizContext'

const MAX_TITLE    = 60
const MAX_SUBTITLE = 150
const MAX_MSG      = 200

const PLACE_MESSAGES = [
  'Esse lugar guarda uma das memórias mais especiais que temos juntos. Cada vez que passo aqui, lembro de tudo que sentimos naquele dia.',
  'Foi aqui que tudo começou. Um lugar simples, mas que pra gente tem um significado enorme.',
  'Esse lugar ficou marcado no coração. A memória de estar aqui com você é uma das que mais guardo com carinho.',
  'Quem de fora olha, não sabe o que esse lugar representa pra gente. Mas a gente sabe — e isso é o que importa.',
  'Cada detalhe desse lugar me lembra de você. Do jeito que você sorriu, do que disse, de como eu me senti.',
]
const randomMsg = () => PLACE_MESSAGES[Math.floor(Math.random() * PLACE_MESSAGES.length)]

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

/* ─── Empty state ────────────────────────────────────────────── */
function EmptyPlaces({ onAdd }) {
  return (
    <button onClick={onAdd}
      className="w-full mt-4 border-2 border-dashed border-gray-200 rounded-3xl p-10 flex flex-col items-center gap-3 bg-white active:scale-[0.98] transition-all">
      <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
        <Globe size={26} className="text-purple-500" />
      </div>
      <div className="text-center">
        <p className="text-[15px] font-bold text-gray-700">Adicionar Primeiro Local</p>
        <p className="text-[13px] text-purple-500 mt-1">Comece adicionando um lugar especial</p>
      </div>
    </button>
  )
}

/* ─── Place card ─────────────────────────────────────────────── */
function PlaceCard({ place, idx, onChange, onRemove }) {
  const inputRef = useRef(null)
  const [expanded, setExpanded] = useState(false)

  const set = (field, val) => onChange({ ...place, [field]: val })

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    set('photoUrl', URL.createObjectURL(file))
    e.target.value = ''
  }

  return (
    <div className="w-full bg-white rounded-3xl shadow-sm overflow-hidden mb-4">
      {/* header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
          <span className="text-[12px] font-black text-purple-600">{idx + 1}</span>
        </div>
        <button onClick={onRemove} className="w-7 h-7 flex items-center justify-center active:scale-90 transition-all">
          <X size={15} className="text-gray-400" />
        </button>
      </div>

      {/* photo */}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
      <button onClick={() => inputRef.current?.click()}
        className="mx-4 mb-4 w-[calc(100%-32px)] aspect-[4/3] rounded-2xl border-2 border-dashed border-purple-200 flex flex-col items-center justify-center gap-2 bg-purple-50/50 active:scale-[0.98] transition-all overflow-hidden">
        {place.photoUrl
          ? <img src={place.photoUrl} alt="" className="w-full h-full object-cover" />
          : <>
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <ImagePlus size={20} className="text-purple-500" />
              </div>
              <p className="text-[13px] font-semibold text-gray-500">Adicionar foto</p>
            </>}
      </button>

      <div className="px-4 pb-4 flex flex-col gap-3">
        {/* local */}
        <div>
          <p className="text-[12px] font-semibold text-gray-500 mb-1.5">Local <span className="text-red-400">(Obrigatório)</span></p>
          <CitySearch value={place.local || ''} onChange={val => set('local', val)} />
        </div>

        {/* data */}
        <div>
          <p className="text-[12px] font-semibold text-gray-500 mb-1.5">Data <span className="text-red-400">(Obrigatório)</span></p>
          <label className="bg-gray-50 rounded-2xl px-4 py-3.5 flex items-center gap-3 border-2 border-transparent focus-within:border-purple-300 transition-colors cursor-text">
            <Calendar size={15} className="text-gray-400 shrink-0" />
            <input type="text" placeholder="DD/MM/AAAA" maxLength={10}
              className="flex-1 outline-none text-[14px] text-gray-700 placeholder-gray-300 bg-transparent"
              value={place.data || ''}
              onChange={e => {
                let v = e.target.value.replace(/\D/g, '')
                if (v.length >= 3) v = v.slice(0,2) + '/' + v.slice(2)
                if (v.length >= 6) v = v.slice(0,5) + '/' + v.slice(5,9)
                set('data', v)
              }} />
          </label>
        </div>

        {/* apelido */}
        <div>
          <p className="text-[12px] font-semibold text-gray-500 mb-1.5">Apelido do Local <span className="text-gray-400">(Opcional)</span></p>
          <label className="bg-gray-50 rounded-2xl px-4 py-3.5 flex items-center gap-3 border-2 border-transparent focus-within:border-purple-300 transition-colors cursor-text">
            <Tag size={15} className="text-gray-400 shrink-0" />
            <input type="text" placeholder="Ex: Onde tudo começou"
              className="flex-1 outline-none text-[14px] text-gray-700 placeholder-gray-300 bg-transparent"
              value={place.apelido || ''} onChange={e => set('apelido', e.target.value)} />
          </label>
        </div>

        {/* texto polaroid */}
        <div>
          <p className="text-[12px] font-semibold text-gray-500 mb-1.5">Texto da Polaroid <span className="text-gray-400">(Opcional)</span></p>
          <label className="bg-gray-50 rounded-2xl px-4 py-3.5 flex items-center gap-3 border-2 border-transparent focus-within:border-purple-300 transition-colors cursor-text">
            <Type size={15} className="text-gray-400 shrink-0" />
            <input type="text" placeholder="Ex: Nossa primeira viagem"
              className="flex-1 outline-none text-[14px] text-gray-700 placeholder-gray-300 bg-transparent"
              value={place.polaroidText || ''} onChange={e => set('polaroidText', e.target.value)} />
          </label>
        </div>

        {/* mensagem */}
        <div>
          <p className="text-[12px] font-semibold text-gray-500 mb-1.5">Mensagem <span className="text-red-400">(Obrigatório)</span></p>
          <div className="bg-gray-50 rounded-2xl overflow-hidden border-2 border-transparent focus-within:border-purple-300 transition-colors">
            <textarea
              rows={expanded ? 7 : 4}
              maxLength={MAX_MSG}
              placeholder="Escreva algo especial sobre este lugar..."
              className="w-full outline-none text-[14px] text-gray-700 resize-none placeholder-gray-300 p-4 bg-transparent leading-relaxed"
              value={place.mensagem || ''} onChange={e => set('mensagem', e.target.value)}
            />
            <div className="flex items-center gap-3 px-4 pb-3 border-t border-gray-200 pt-2">
              <button onClick={() => set('mensagem', randomMsg())}
                className="flex items-center gap-1.5 text-[12px] text-purple-600 font-semibold active:scale-95 transition-all">
                <Shuffle size={12} /> Gerar Aleatório
              </button>
              <button onClick={() => setExpanded(v => !v)}
                className="flex items-center gap-1.5 text-[12px] text-gray-400 active:scale-95 transition-all">
                <Maximize2 size={12} /> Expandir
              </button>
              <span className="ml-auto text-[11px] text-gray-400 tabular-nums">{(place.mensagem || '').length}/{MAX_MSG}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Mapa Preview ───────────────────────────────────────────── */
function MapaPreview({ places, title, subtitle, onClose }) {
  const [idx, setIdx] = useState(0)
  const place = places[idx]
  const isLast = idx === places.length - 1

  return (
    <div className="step-root" style={{ background: '#5bc8d8' }}>
      <div className="step-scroll flex flex-col items-center" style={{ background: '#5bc8d8' }}>

        {/* mapa grid sutil */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />

        {/* título */}
        <div className="relative text-center pt-8 px-4 mb-8">
          <h2 className="text-[24px] font-black text-white" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.18)' }}>{title}</h2>
          <p className="text-[13px] text-white/70 mt-1">{subtitle}</p>
        </div>

        {/* polaroid */}
        <div className="relative bg-white shadow-2xl p-3 pb-7 w-52"
          style={{ transform: 'rotate(-2deg)', boxShadow: '0 12px 40px rgba(0,0,0,0.25)' }}>
          <div className="w-full overflow-hidden" style={{ aspectRatio: '4/3', background: '#e5e7eb' }}>
            {place.photoUrl
              ? <img src={place.photoUrl} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center">
                  <MapPin size={28} className="text-gray-300" />
                </div>}
          </div>
          {place.polaroidText && (
            <p className="text-center text-[12px] text-gray-500 mt-2 leading-tight px-1"
              style={{ fontFamily: 'cursive', fontStyle: 'italic' }}>
              {place.polaroidText}
            </p>
          )}
          <p className="text-center text-[11px] text-gray-400 mt-1">{place.data}</p>
        </div>

        {/* pin coração */}
        <div className="relative mt-4 flex flex-col items-center">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
            style={{ boxShadow: '0 4px 16px rgba(34,197,94,0.45)' }}>
            <span className="text-white text-[22px] leading-none" style={{ marginTop: 1 }}>♥</span>
          </div>
          <div className="w-0 h-0" style={{
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '8px solid #22c55e',
            marginTop: -1,
          }} />
        </div>

        {/* dots indicador se múltiplos locais */}
        {places.length > 1 && (
          <div className="flex gap-2 mt-5">
            {places.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className={`rounded-full transition-all ${i === idx ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/40'}`} />
            ))}
          </div>
        )}

        <div className="pb-6" />
      </div>

      {/* painel inferior escuro */}
      <div className="shrink-0" style={{ background: '#0d0d0d' }}>
        <div className="px-5 pt-4 pb-3">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shrink-0">
              <MapPin size={13} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-[16px] leading-tight">{place.local || 'Local não informado'}</p>
              <p className="text-gray-500 text-[12px]">{place.data || '—'}</p>
            </div>
          </div>
          {place.mensagem && (
            <p className="text-gray-400 text-[13px] leading-relaxed mt-1">"{place.mensagem}"</p>
          )}
        </div>

        <div className="flex gap-3 px-5 pb-5 pt-2">
          <button
            onClick={() => idx === 0 ? onClose() : setIdx(i => i - 1)}
            className="flex-1 bg-purple-600 text-white rounded-full py-3.5 font-semibold text-[14px] flex items-center justify-center gap-1 active:scale-95 transition-all">
            ‹ Voltar
          </button>
          <button
            onClick={() => isLast ? onClose() : setIdx(i => i + 1)}
            className="flex-1 bg-green-500 text-white rounded-full py-3.5 font-bold text-[14px] flex items-center justify-center active:scale-95 transition-all">
            {isLast ? 'Fechar' : 'Próxima seção'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Main ───────────────────────────────────────────────────── */
export default function StepMapa({ onNext, onBack }) {
  const { data, update } = useQuiz()
  const [subStep, setSubStep] = useState(1)
  const [showPreview, setShowPreview] = useState(false)

  const title    = data.mapaTitle
  const subtitle = data.mapaSubtitle
  const places   = data.mapaPlaces

  const validPlace  = (p) => p.local?.trim() && p.data?.trim() && p.mensagem?.trim()
  const validPlaces = places.filter(validPlace)
  const canNext2    = validPlaces.length > 0
  const canPreview  = places.length > 0

  const addPlace    = () => update({ mapaPlaces: [...places, { photoUrl: '', local: '', data: '', apelido: '', polaroidText: '', mensagem: '' }] })
  const updatePlace = (i, p) => { const next = [...places]; next[i] = p; update({ mapaPlaces: next }) }
  const removePlace = (i) => update({ mapaPlaces: places.filter((_, idx) => idx !== i) })

  /* ── Preview ── */
  if (showPreview) return (
    <MapaPreview
      places={places}
      title={title}
      subtitle={subtitle}
      onClose={() => setShowPreview(false)}
    />
  )

  /* ── Sub-step 1: título e subtítulo ── */
  if (subStep === 1) return (
    <div className="step-root">
      <div className="step-scroll">
        <div className="flex items-center gap-3 pt-3 mb-2">
          <BackButton onClick={onBack} />
        </div>
        <StepIndicator current={1} />

        <h1 className="text-[22px] font-black text-gray-900">Nossa Jornada no Mapa</h1>
        <p className="text-[14px] text-gray-500 mt-1">Personalize o título e subtítulo da sua jornada.</p>

        <div className="mt-6 flex flex-col gap-4">
          <div>
            <div className="flex justify-between mb-1.5">
              <p className="text-[13px] font-semibold text-gray-600">Título da Seção</p>
              <span className="text-[12px] text-gray-400 tabular-nums">{title.length}/{MAX_TITLE}</span>
            </div>
            <label className="bg-white rounded-2xl px-4 py-3.5 shadow-sm flex items-center gap-3 border-2 border-transparent focus-within:border-purple-300 transition-colors cursor-text">
              <span className="text-purple-400 font-black text-[15px] shrink-0">H</span>
              <input type="text" maxLength={MAX_TITLE}
                className="flex-1 outline-none text-[14px] text-gray-800 bg-transparent"
                value={title} onChange={e => update({ mapaTitle: e.target.value })} />
            </label>
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <p className="text-[13px] font-semibold text-gray-600">Subtítulo</p>
              <span className="text-[12px] text-gray-400 tabular-nums">{subtitle.length}/{MAX_SUBTITLE}</span>
            </div>
            <label className="bg-white rounded-2xl px-4 py-3.5 shadow-sm flex items-center gap-3 border-2 border-transparent focus-within:border-purple-300 transition-colors cursor-text">
              <AlignLeft size={15} className="text-purple-400 shrink-0" />
              <input type="text" maxLength={MAX_SUBTITLE}
                className="flex-1 outline-none text-[14px] text-gray-800 bg-transparent"
                value={subtitle} onChange={e => update({ mapaSubtitle: e.target.value })} />
            </label>
          </div>
        </div>
        <div className="pb-4" />
      </div>

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

  /* ── Sub-step 2: locais ── */
  return (
    <div className="step-root">
      <div className="step-scroll">
        <div className="flex items-center gap-3 pt-3 mb-2">
          <BackButton onClick={() => setSubStep(1)} />
        </div>
        <StepIndicator current={2} />

        <h1 className="text-[22px] font-black text-gray-900">Nossa Jornada no Mapa</h1>
        <p className="text-[14px] text-gray-500 mt-1">Adicione os locais especiais</p>

        {places.length === 0
          ? <EmptyPlaces onAdd={addPlace} />
          : places.map((p, i) => (
              <PlaceCard key={i} place={p} idx={i}
                onChange={(updated) => updatePlace(i, updated)}
                onRemove={() => removePlace(i)} />
            ))}

        {places.length > 0 && (
          <button onClick={addPlace}
            className="w-full mt-2 border-2 border-dashed border-purple-200 rounded-2xl py-3.5 flex items-center justify-center gap-2 text-purple-500 font-semibold text-[14px] active:scale-[0.98] transition-all">
            + Adicionar outro local
          </button>
        )}
        <div className="pb-4" />
      </div>

      {canPreview && <PreviewFab onClick={() => setShowPreview(true)} />}
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
