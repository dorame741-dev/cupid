import { useState } from 'react'
import { Gift, Heart } from 'lucide-react'
import PandaMascot from '../components/PandaMascot'
import { useQuiz } from '../context/QuizContext'

export default function StepIntroNames({ onNext }) {
  const { data, update } = useQuiz()
  const [focused, setFocused] = useState(null)
  const canContinue = data.myName.trim() && data.partnerName.trim()

  const borderColor = (field) =>
    data[field] || focused === field ? '#8B5CF6' : '#E5E7EB'

  return (
    <div className="step-root" style={{ background: '#fff' }}>
      <div className="step-scroll flex flex-col items-center" style={{ background: '#fff', paddingTop: 0 }}>

        <div style={{ marginTop: -60, marginBottom: -38 }}>
          <PandaMascot size={230} />
        </div>

        <div className="w-full bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-gray-700 text-[15px] leading-relaxed">
            Para começar a criar esse{' '}
            <span className="text-purple-600 font-semibold">presente especial</span>,
            me conta... <span className="font-semibold text-gray-900">quem são vocês?</span>
          </p>
        </div>

        <div className="w-full flex flex-col gap-4 mt-4">

          {/* Meu nome */}
          <label
            className="bg-white rounded-2xl px-4 py-4 shadow-sm flex items-center gap-3 cursor-text transition-all"
            style={{ border: `2px solid ${borderColor('myName')}` }}
          >
            <Gift
              size={22}
              style={{
                color: data.myName || focused === 'myName' ? '#7C3AED' : '#6B7280',
                transition: 'color 0.2s',
                flexShrink: 0,
              }}
            />
            <input
              type="text"
              placeholder="Qual o seu nome?"
              className="flex-1 outline-none text-[15px] text-gray-800 placeholder-gray-400 bg-transparent"
              value={data.myName}
              onChange={e => update({ myName: e.target.value })}
              onFocus={() => setFocused('myName')}
              onBlur={() => setFocused(null)}
            />
          </label>

          {/* Nome do parceiro */}
          <label
            className="bg-white rounded-2xl px-4 py-4 shadow-sm flex items-center gap-3 cursor-text transition-all"
            style={{ border: `2px solid ${borderColor('partnerName')}` }}
          >
            <Heart
              size={22}
              style={{
                color: data.partnerName || focused === 'partnerName' ? '#7C3AED' : '#6B7280',
                fill: data.partnerName || focused === 'partnerName' ? '#7C3AED' : 'none',
                transition: 'color 0.2s, fill 0.2s',
                flexShrink: 0,
              }}
            />
            <input
              type="text"
              placeholder="E o nome do seu parceiro(a)?"
              className="flex-1 outline-none text-[15px] text-gray-800 placeholder-gray-400 bg-transparent"
              value={data.partnerName}
              onChange={e => update({ partnerName: e.target.value })}
              onFocus={() => setFocused('partnerName')}
              onBlur={() => setFocused(null)}
            />
          </label>

        </div>
        <div className="pb-4" />
      </div>

      <div className="step-bottom" style={{ background: '#fff' }}>
        <button
          onClick={onNext}
          disabled={!canContinue}
          className={`w-full text-white rounded-2xl py-4 font-bold text-[16px] transition-all active:scale-[0.97]
            ${canContinue ? 'bg-purple-600 btn-pulse' : 'bg-purple-300 opacity-50'}`}
        >
          Continuar
        </button>
      </div>
    </div>
  )
}
