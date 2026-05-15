import { useState, useRef } from 'react'
import { Search, Play, Check, Pencil } from 'lucide-react'
import PreviewFab from '../components/PreviewFab'
import ProgressBar from '../components/ProgressBar'
import BackButton from '../components/BackButton'
import { useQuiz } from '../context/QuizContext'
import { searchMusic } from '../lib/youtube'
import SitePreview from '../components/SitePreview'

export default function Step2Music({ onNext, onBack }) {
  const { data, update } = useQuiz()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const debounceRef = useRef(null)

  if (showPreview) return <SitePreview overlay onBack={() => setShowPreview(false)} />

  const handleSearch = (val) => {
    setQuery(val)
    clearTimeout(debounceRef.current)
    if (!val.trim()) { setResults([]); return }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try { setResults(await searchMusic(val)) }
      catch { setResults([]) }
      finally { setLoading(false) }
    }, 700)
  }

  return (
    <div className="step-root">
      <div className="step-scroll">
        <div className="flex items-center gap-3 mb-5 pt-3">
          <BackButton onClick={onBack} />
          <div className="flex-1"><ProgressBar current={2} total={4} /></div>
        </div>

        <h1 className="text-[22px] font-black text-gray-900">Música</h1>
        <p className="text-[14px] text-gray-500 mt-1">Escolha a música que representa a relação de vocês</p>
        <p className="text-[12px] text-purple-500 mt-2"><Pencil size={12} className="inline text-purple-500 mr-1 mb-0.5" /><strong className="text-purple-600">Você poderá editar depois.</strong></p>

        <div className="mt-5 bg-white rounded-2xl px-4 py-3.5 shadow-sm flex items-center gap-3 border-2 border-transparent focus-within:border-purple-300 transition-colors">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input type="text" placeholder="Pesquise por músicas ou artistas..."
            className="flex-1 outline-none text-[14px] text-gray-700 placeholder-gray-400 bg-transparent"
            value={query} onChange={e => handleSearch(e.target.value)} />
          {loading && <div className="w-4 h-4 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin shrink-0" />}
        </div>

        {data.music && (
          <div className="mt-3 bg-purple-50 rounded-2xl px-4 py-3 border-2 border-purple-200 flex items-center gap-3">
            <img src={data.music.thumbnail} alt="" className="w-12 h-12 rounded-xl object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-gray-800 line-clamp-1">{data.music.title}</p>
              <p className="text-[12px] text-gray-500">{data.music.channel}</p>
            </div>
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center shrink-0">
              <Check size={14} className="text-white" />
            </div>
          </div>
        )}

        {!loading && query.trim() && results.length === 0 && (
          <p className="text-[14px] text-purple-500 text-center py-10">Nenhum resultado encontrado.</p>
        )}

        <div className="flex flex-col gap-2 mt-3">
          {results.map(track => (
            <button key={track.id} onClick={() => update({ music: track })}
              className={`bg-white rounded-2xl px-4 py-3.5 shadow-sm flex items-center gap-3 text-left border-2 transition-all active:scale-[0.98]
                ${data.music?.id === track.id ? 'border-purple-400 bg-purple-50' : 'border-transparent'}`}>
              <img src={track.thumbnail} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-gray-800 line-clamp-2 leading-snug">{track.title}</p>
                <p className="text-[12px] text-gray-400 mt-0.5">{track.channel}</p>
              </div>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all
                ${data.music?.id === track.id ? 'bg-purple-600' : 'bg-purple-100'}`}>
                {data.music?.id === track.id ? <Check size={14} className="text-white" /> : <Play size={13} className="text-purple-600 ml-0.5" />}
              </div>
            </button>
          ))}
        </div>
        <div className="pb-4" />
      </div>

      {data.music && <PreviewFab onClick={() => setShowPreview(true)} />}
      <div className="step-bottom">
        <div className="flex gap-3">
          <button onClick={onBack} className="flex-1 border-2 border-gray-200 text-gray-600 rounded-2xl py-3.5 font-semibold text-[14px] active:scale-[0.97] transition-all">Voltar</button>
          <button onClick={onNext} className="flex-1 bg-purple-600 text-white rounded-2xl py-3.5 font-bold text-[14px] btn-pulse active:scale-[0.97] transition-all">Próximo</button>
        </div>
      </div>
    </div>
  )
}
