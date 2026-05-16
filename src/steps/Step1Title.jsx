import { useState } from 'react'
import { Shuffle, Maximize2, Pencil } from 'lucide-react'
import PreviewFab from '../components/PreviewFab'
import ProgressBar from '../components/ProgressBar'
import BackButton from '../components/BackButton'
import { useQuiz } from '../context/QuizContext'
import { randomTitle, randomBiblicalTitle } from '../lib/randomTexts'
import SitePreview from '../components/SitePreview'

const MAX = 30

export default function Step1Title({ onNext, onBack }) {
  const { data, update } = useQuiz()
  const [showPreview, setShowPreview] = useState(false)
  const [expanded, setExpanded] = useState(false)

  if (showPreview) return <SitePreview overlay onBack={() => setShowPreview(false)} />

  return (
    <div className="step-root">
      <div className="step-scroll">
        <div className="flex items-center gap-3 mb-5 pt-3">
          <BackButton onClick={onBack} />
          <div className="flex-1"><ProgressBar current={1} total={4} /></div>
        </div>

        <h1 className="text-[22px] font-black text-gray-900 leading-tight">Título do Presente</h1>
        <p className="text-[14px] text-gray-500 mt-1">
          Escreva o título para marcar esse <span className="text-purple-600">momento especial</span>
          {data.variant === 'biblico' && <span className="text-purple-600"> — pode escolher um versículo bíblico também</span>}
        </p>
        <p className="text-[12px] text-purple-500 mt-2">
          <Pencil size={12} className="inline text-purple-500 mr-1 mb-0.5" /><strong className="text-purple-600">Você poderá editar depois.</strong>
        </p>

        <div className="mt-5 bg-white rounded-2xl shadow-sm overflow-hidden">
          <textarea
            rows={expanded ? 7 : 3}
            maxLength={MAX}
            placeholder={data.variant === 'biblico' ? 'Ex: Onde tu ires, eu irei 🕊️' : 'Ex: Amor da minha existência 💗'}
            className="w-full outline-none text-[15px] text-gray-800 resize-none placeholder-gray-300 p-4 bg-transparent leading-relaxed"
            value={data.title}
            onChange={e => update({ title: e.target.value })}
          />
          <div className="flex items-center gap-3 px-4 pb-3 border-t border-gray-100 pt-3">
            <button onClick={() => update({ title: data.variant === 'biblico' ? randomBiblicalTitle() : randomTitle() })}
              className="flex items-center gap-1.5 text-[13px] text-purple-600 font-semibold active:scale-95 transition-all">
              <Shuffle size={13} /> Gerar Aleatório
            </button>
            <button onClick={() => setExpanded(v => !v)}
              className="flex items-center gap-1.5 text-[13px] text-gray-400 active:scale-95 transition-all">
              <Maximize2 size={13} /> Expandir
            </button>
            <span className="ml-auto text-[12px] text-gray-400 font-medium tabular-nums">{data.title.length}/{MAX}</span>
          </div>
        </div>
        <div className="pb-4" />
      </div>

      {data.title.trim() && <PreviewFab onClick={() => setShowPreview(true)} />}
      <div className="step-bottom">
        <div className="flex gap-3">
          <button onClick={onBack}
            className="flex-1 border-2 border-gray-200 text-gray-600 rounded-2xl py-3.5 font-semibold text-[14px] active:scale-[0.97] transition-all">
            Voltar
          </button>
          <button onClick={onNext} disabled={!data.title.trim()}
            className={`flex-1 rounded-2xl py-3.5 font-bold text-[14px] text-white transition-all active:scale-[0.97]
              ${data.title.trim() ? 'bg-purple-600 btn-pulse' : 'bg-purple-300 opacity-50'}`}>
            Próximo
          </button>
        </div>
      </div>
    </div>
  )
}
