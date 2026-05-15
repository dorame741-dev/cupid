import { useState } from 'react'
import { GripVertical, X, Calendar, Star, Camera, Gamepad2, Globe, Gift } from 'lucide-react'
import { useQuiz } from '../context/QuizContext'

const SECTIONS = [
  { id: 'timeline',  name: 'Linha do Tempo',    Icon: Calendar,  img: '/screenshots/timeline.png'  },
  { id: 'stars',     name: 'Mapa das Estrelas',  Icon: Star,      img: '/screenshots/estrelas.png'  },
  { id: 'gallery',   name: 'Galeria de Imagens', Icon: Camera,    img: '/screenshots/jogo.png'      },
  { id: 'words',     name: 'Jogo de Palavras',   Icon: Gamepad2,  img: '/screenshots/palavras.png'  },
  { id: 'map',       name: 'Jornada no Mapa',    Icon: Globe,     img: '/screenshots/mapa.png'      },
  { id: 'roulette',  name: 'Roleta Surpresa',    Icon: Gift,      img: '/screenshots/roleta.png'    },
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

        <div className="w-full h-1.5 bg-purple-600 rounded-full mt-2 mb-5" />

        <div className="w-full text-center mb-1 px-1">
          <p className="text-[23px] font-black text-gray-900 leading-tight">Ótima escolha!</p>
          <p className="text-[14px] text-gray-500 mt-1.5 leading-relaxed">
            Selecione as seções que deseja adicionar.{' '}
            <span className="text-purple-600 font-semibold">Pode escolher quantas quiser!</span>
          </p>
        </div>

        {/* Lista de selecionados */}
        {selected.length > 0 && (
          <div className="w-full mt-5">
            <div className="flex items-center gap-2 mb-3">
              <p className="text-[16px] font-black text-gray-900">Selecionadas</p>
              <span className="bg-purple-100 text-purple-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
                {selected.length}
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
                    <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0">
                      <img src={sec.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-purple-500 font-bold">#{idx + 1}</p>
                      <p className="text-[14px] font-semibold text-gray-800 leading-tight">{sec.name}</p>
                    </div>
                    <button onClick={() => remove(id)} className="w-7 h-7 flex items-center justify-center active:scale-90 transition-all">
                      <X size={14} className="text-gray-400" />
                    </button>
                  </div>
                )
              })}
              {selected.length > 5 && (
                <button onClick={() => setShowAllSelected(v => !v)}
                  className="text-[13px] text-purple-500 font-medium text-center py-1">
                  {showAllSelected ? 'Ver menos ∧' : `Ver mais ${selected.length - 5} ∨`}
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
                className={`relative rounded-3xl overflow-hidden text-left transition-all active:scale-[0.97] ${sel ? 'ring-2 ring-purple-500 ring-offset-1' : ''}`}
                style={{ aspectRatio: '9/16' }}>

                {/* screenshot de fundo */}
                <img src={sec.img} alt={sec.name}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />

                {/* overlay escuro no topo e base para legibilidade */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 35%, transparent 60%, rgba(0,0,0,0.7) 100%)' }} />

                {/* tag GRÁTIS */}
                <div className="absolute top-2 left-2 z-10">
                  <span className="bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">GRÁTIS</span>
                </div>

                {/* check / ícone */}
                <div className={`absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all
                  ${sel ? 'bg-purple-600' : 'bg-black/30 backdrop-blur-sm'}`}>
                  {sel
                    ? <span className="text-white text-[13px] font-black">✓</span>
                    : <Icon size={13} className="text-white/70" />}
                </div>

                {/* nome na base */}
                <div className="absolute bottom-0 left-0 right-0 z-10 px-3 pb-3 pt-6">
                  <p className="text-white font-bold text-[13px] leading-tight drop-shadow">{sec.name}</p>
                  <p className="text-white/50 text-[10px] mt-0.5">Toque para selecionar</p>
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
