import { useState, useRef } from 'react'
import { Pencil, Check } from 'lucide-react'
import PreviewFab from '../components/PreviewFab'
import BackButton from '../components/BackButton'
import { useQuiz } from '../context/QuizContext'
import SitePreview from '../components/SitePreview'
import LiveCounter from '../components/LiveCounter'

function InlineEdit({ value, placeholder, onSave, className = '' }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState(value)
  const inputRef = useRef(null)

  const open  = () => { setDraft(value); setEditing(true); setTimeout(() => inputRef.current?.focus(), 10) }
  const save  = () => { onSave(draft); setEditing(false) }
  const cancel = () => setEditing(false)

  if (editing) return (
    <span className="inline-flex items-center gap-1 w-full">
      <input
        ref={inputRef}
        className={`flex-1 bg-white/20 border-b-2 border-purple-400 outline-none text-white px-1 ${className}`}
        value={draft}
        placeholder={placeholder}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel() }}
      />
      <button onClick={save} className="w-7 h-7 bg-purple-500 rounded-full flex items-center justify-center shrink-0 active:scale-90">
        <Check size={13} className="text-white" />
      </button>
    </span>
  )

  return (
    <button onClick={open} className={`flex items-center gap-1.5 text-left group ${className}`}>
      <span>{value || placeholder}</span>
      <Pencil size={12} className="text-purple-400 opacity-60 shrink-0" />
    </button>
  )
}

export default function Step6CounterTexts({ onNext, onBack }) {
  const { data, update } = useQuiz()
  const [showPreview, setShowPreview] = useState(false)

  if (showPreview) return <SitePreview onBack={() => setShowPreview(false)} />

  const ct = data.counterTexts
  const coupleName = ct.coupleName || `${data.myName} e ${data.partnerName}`
  const year = data.relationshipStart ? new Date(data.relationshipStart + 'T00:00').getFullYear() : '2025'
  const set = (f, v) => update({ counterTexts: { ...ct, [f]: v } })

  return (
    <div className="step-root">
      <div className="step-scroll">
        <div className="flex items-center gap-3 mb-5 pt-3">
          <BackButton onClick={onBack} />
          <div className="flex-1 flex gap-1.5">
            {[1,2,3,4,5,6].map(s => <div key={s} className="flex-1 h-1.5 rounded-full bg-purple-600" />)}
          </div>
        </div>

        <h1 className="text-[22px] font-black text-gray-900">Textos do Contador</h1>
        <p className="text-[14px] text-gray-500 mt-1">Personalize os textos do contador do casal</p>
        <div className="mt-2 flex items-start gap-2 bg-purple-50 rounded-xl px-3 py-2.5">
          <span className="text-[13px]">✨</span>
          <p className="text-[12px] text-purple-700 leading-relaxed">
            Toque nos textos com o lápis <Pencil size={11} className="inline text-purple-500 mb-0.5 mx-0.5" /> para editar diretamente. Essa etapa é opcional.
          </p>
        </div>

        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-5 mb-3">Pré-visualização</p>

        {/* dark card preview */}
        <div className="rounded-3xl overflow-hidden shadow-xl bg-gray-900">
          {/* cover photo with editable section title */}
          <div className="relative">
            {data.coverPhotoUrl
              ? <img src={data.coverPhotoUrl} alt="" className="w-full h-44 object-cover" />
              : <div className="w-full h-44 bg-gray-800 flex items-center justify-center"><span className="text-gray-600 text-sm">Foto de capa</span></div>}

            {/* section title — editable inline, overlaid on the photo */}
            <div className="absolute top-3 left-3 right-3">
              <span className="inline-flex items-center bg-black/50 backdrop-blur-sm rounded-xl px-3 py-1.5 text-white text-[12px] font-semibold max-w-full">
                <InlineEdit
                  value={ct.sectionTitle}
                  placeholder="Sobre o casal"
                  onSave={v => set('sectionTitle', v)}
                  className="text-[12px] font-semibold"
                />
              </span>
            </div>
          </div>

          <div className="px-4 pt-4 pb-5">
            {/* couple name — inline editable */}
            <div className="text-[20px] font-black text-white mb-1">
              <InlineEdit
                value={ct.coupleName}
                placeholder={coupleName}
                onSave={v => set('coupleName', v)}
                className="text-[20px] font-black"
              />
            </div>

            <p className="text-[12px] text-gray-500">
              {ct.sinceLabel || 'Juntos desde'} ⌛ {year}
            </p>

            <LiveCounter dark startDate={data.relationshipStart} startTime={data.relationshipTime} />
          </div>
        </div>
        <div className="pb-4" />
      </div>

      <PreviewFab onClick={() => setShowPreview(true)} />
      <div className="step-bottom">
        <div className="flex gap-3">
          <button onClick={onBack} className="flex-1 border-2 border-gray-200 text-gray-600 rounded-2xl py-3.5 font-semibold text-[14px] active:scale-[0.97] transition-all">Voltar</button>
          <button onClick={onNext} className="flex-1 bg-purple-600 text-white rounded-2xl py-3.5 font-bold text-[14px] btn-pulse active:scale-[0.97] transition-all">Concluir</button>
        </div>
      </div>
    </div>
  )
}
