import { useState } from 'react'

import { Calendar, Star, Camera, Gamepad2, Globe, Gift, GripVertical, X } from 'lucide-react'
import PandaMascot from '../components/PandaMascot'
import { useQuiz } from '../context/QuizContext'

const SECTIONS = [
  {
    id: 'timeline', name: 'Linha do Tempo', Icon: Calendar,
    preview: (
      <div className="flex-1 flex flex-col gap-1.5 px-2 pt-2 justify-center">
        {[['Ago 2022', '#be123c'], ['Set 2022', '#7c3aed'], ['Jan 2023', '#be123c']].map(([label, color]) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
            <div className="flex-1 h-8 rounded-lg" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <div className="px-1.5 pt-1"><span style={{ fontSize: 7, color: color }}>{label}</span></div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'stars', name: 'Mapa das Estrelas', Icon: Star,
    preview: (
      <div className="flex-1 flex flex-col items-center justify-center px-2 gap-2">
        <div className="relative w-full flex items-center justify-center">
          {[[15,20],[35,10],[55,28],[25,40],[45,15],[60,35],[10,45],[50,42]].map(([x,y],i) => (
            <div key={i} className="absolute w-1 h-1 bg-white rounded-full opacity-80"
              style={{ left: `${x}%`, top: `${y}px` }} />
          ))}
          <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center mt-2">
            <Star size={18} className="text-yellow-300/80" />
          </div>
        </div>
        <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>O céu quando nossos mundos se colidiram</p>
      </div>
    ),
  },
  {
    id: 'gallery', name: 'Galeria de Imagens', Icon: Camera,
    preview: (
      <div className="flex-1 grid grid-cols-2 gap-1 p-2">
        {['#374151','#1f2937','#111827','#374151'].map((bg, i) => (
          <div key={i} className="rounded-lg aspect-square flex items-center justify-center" style={{ background: bg }}>
            <Camera size={10} className="text-white/20" />
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'words', name: 'Jogo de Palavras', Icon: Gamepad2,
    preview: (
      <div className="flex-1 flex flex-col items-center justify-center px-2 gap-1">
        {['AMOR', 'JUNTOS'].map(word => (
          <div key={word} className="flex gap-1">
            {word.split('').map((l, i) => (
              <div key={i} className="w-5 h-5 border border-white/20 rounded flex items-center justify-center">
                <span style={{ fontSize: 8, color: 'white', fontWeight: 700 }}>{l}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'map', name: 'Jornada no Mapa', Icon: Globe,
    preview: (
      <div className="flex-1 flex items-center justify-center px-2">
        <div className="w-full aspect-square rounded-xl overflow-hidden relative" style={{ background: '#1e3a5f' }}>
          <div className="absolute inset-0 opacity-30"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 8px,rgba(255,255,255,0.1) 8px,rgba(255,255,255,0.1) 9px),repeating-linear-gradient(90deg,transparent,transparent 8px,rgba(255,255,255,0.1) 8px,rgba(255,255,255,0.1) 9px)' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/50" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'roulette', name: 'Roleta Surpresa', Icon: Gift,
    preview: (
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-20 h-20">
          {['#7c3aed','#be123c','#1d4ed8','#059669','#d97706','#dc2626'].map((color, i) => (
            <div key={i} className="absolute inset-0 rounded-full overflow-hidden"
              style={{ clipPath: `polygon(50% 50%, ${50 + 50*Math.cos((i*60-90)*Math.PI/180)}% ${50 + 50*Math.sin((i*60-90)*Math.PI/180)}%, ${50 + 50*Math.cos(((i+1)*60-90)*Math.PI/180)}% ${50 + 50*Math.sin(((i+1)*60-90)*Math.PI/180)}%)`, background: color }} />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full" />
          </div>
        </div>
      </div>
    ),
  },
]

export default function StepWrapped({ onNext, onSkip }) {
  const { data, update } = useQuiz()
  const [showAllSelected, setShowAllSelected] = useState(false)

  const selected = data.wrappedSections
  const isSelected = (id) => selected.includes(id)

  const toggle = (id) => {
    const next = isSelected(id) ? selected.filter(s => s !== id) : [...selected, id]
    update({ wrappedSections: next })
  }
  const remove = (id) => update({ wrappedSections: selected.filter(s => s !== id) })

  return (
    <div className="step-root">
      <div className="step-scroll flex flex-col items-center">

        <div className="w-full h-2 bg-purple-600 rounded-full mt-2 mb-2" />

        <div style={{ marginTop: -30, marginBottom: -38 }}>
          <PandaMascot size={230} />
        </div>

        <div className="w-full bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-gray-700 text-[15px] leading-relaxed">
            <span className="font-bold text-gray-900">Ótima escolha!</span> Selecione abaixo quais seções você quer adicionar na retrospectiva. Pode escolher{' '}
            <span className="text-purple-600 font-semibold">quantas quiser!</span>
          </p>
        </div>

        {/* Lista de selecionados */}
        {selected.length > 0 && (
          <div className="w-full mt-5">
            <div className="flex items-center gap-2 mb-3">
              <p className="text-[16px] font-black text-gray-900">Atividades Selecionadas</p>
              <span className="bg-purple-100 text-purple-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
                {selected.length} atividades
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {selected.slice(0, showAllSelected ? selected.length : 5).map((id, idx) => {
                const sec = SECTIONS.find(s => s.id === id)
                if (!sec) return null
                const { Icon } = sec
                return (
                  <div key={id} className="bg-white rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3">
                    <GripVertical size={16} className="text-gray-300 shrink-0" />
                    <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                      <Icon size={14} className="text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-purple-500 font-bold">#{idx + 1}</p>
                      <p className="text-[14px] font-semibold text-gray-800 leading-tight">{sec.name}</p>
                    </div>
                    <button onClick={() => remove(id)}
                      className="w-7 h-7 flex items-center justify-center active:scale-90 transition-all">
                      <X size={14} className="text-gray-400" />
                    </button>
                  </div>
                )
              })}
              {selected.length > 5 && (
                <button onClick={() => setShowAllSelected(v => !v)}
                  className="text-[13px] text-purple-500 font-medium text-center py-1">
                  {showAllSelected ? 'Ver menos ∧' : `Ver mais ${selected.length - 5} atividades ∨`}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Grid de seções */}
        <div className="w-full mt-5 grid grid-cols-2 gap-3">
          {SECTIONS.map(sec => {
            const sel = isSelected(sec.id)
            const { Icon } = sec
            return (
              <button key={sec.id} onClick={() => toggle(sec.id)}
                className={`relative rounded-3xl overflow-hidden text-left transition-all active:scale-[0.97] ${sel ? 'ring-2 ring-purple-500 ring-offset-1' : ''}`}>
                <div className="bg-gray-900 flex flex-col" style={{ aspectRatio: '9/16' }}>
                  {/* tag GRÁTIS */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className="bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">GRÁTIS</span>
                  </div>
                  {/* ícone / check */}
                  <div className={`absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all
                    ${sel ? 'bg-purple-600' : 'bg-white/10'}`}>
                    {sel
                      ? <span className="text-white text-[13px] font-black">✓</span>
                      : <Icon size={13} className="text-white/60" />}
                  </div>
                  {/* preview */}
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {sec.preview}
                  </div>
                  {/* nome */}
                  <div className="px-3 pb-2">
                    <p className="text-white font-bold text-[13px] leading-tight">{sec.name}</p>
                    <p className="text-white/30 text-[10px] mt-0.5">▲ Ver seção</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="pb-4" />
      </div>

      <div className="step-bottom">
        {selected.length > 0 ? (
          <button onClick={() => onNext(selected)}
            className="w-full bg-purple-600 text-white rounded-2xl py-4 font-black text-[15px] flex items-center justify-center gap-2 shadow-lg shadow-purple-200 btn-pulse active:scale-[0.98] transition-all">
            Continuar ↗
          </button>
        ) : (
          <button onClick={onSkip}
            className="w-full bg-purple-600 text-white rounded-2xl py-4 font-black text-[15px] flex items-center justify-center gap-2 shadow-lg shadow-purple-200 active:scale-[0.98] transition-all">
            Pular e configurar depois ↗
          </button>
        )}
      </div>
    </div>
  )
}
