import { useRef, useState } from 'react'
import { ImagePlus, Pencil } from 'lucide-react'
import PreviewFab from '../components/PreviewFab'
import { useQuiz } from '../context/QuizContext'
import SitePreview from '../components/SitePreview'

export default function Step5CoverPhoto({ onNext, onBack }) {
  const { data, update } = useQuiz()
  const [showPreview, setShowPreview] = useState(false)
  const inputRef = useRef(null)

  if (showPreview) return <SitePreview onBack={() => setShowPreview(false)} />

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    update({ coverPhoto: file, coverPhotoUrl: URL.createObjectURL(file) })
    e.target.value = ''
  }

  return (
    <div className="step-root">
      <div className="step-scroll">
        <div className="flex items-center gap-3 mb-5 pt-2">
          <button onClick={onBack} className="text-gray-500 text-xl w-8 shrink-0">←</button>
          <div className="flex-1 flex gap-1.5">
            {[1,2,3,4,5].map(s => <div key={s} className="flex-1 h-1.5 rounded-full bg-purple-600" />)}
            <div className="flex-1 h-1.5 rounded-full bg-gray-200" />
          </div>
        </div>

        <h1 className="text-[22px] font-black text-gray-900">Tempo Juntos</h1>
        <p className="text-[14px] text-gray-500 mt-1">Adicione a foto de capa do contador</p>
        <p className="text-[12px] text-purple-500 mt-2"><Pencil size={12} className="inline text-purple-500 mr-1 mb-0.5" /><strong className="text-purple-600">Você poderá editar depois.</strong></p>

        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

        <button onClick={() => inputRef.current?.click()}
          className="w-full mt-5 bg-white rounded-2xl shadow-sm overflow-hidden border-2 border-dashed border-purple-200 active:scale-[0.98] transition-all">
          {data.coverPhotoUrl ? (
            <div className="relative">
              <img src={data.coverPhotoUrl} alt="" className="w-full h-56 object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 py-2 text-center">
                <span className="text-white text-[13px] font-semibold">Toque para trocar</span>
              </div>
            </div>
          ) : (
            <div className="p-12 flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center">
                <ImagePlus size={26} className="text-purple-500" />
              </div>
              <div className="text-center">
                <p className="text-[15px] font-bold text-gray-700">Selecionar Imagem</p>
                <p className="text-[13px] text-gray-400 mt-1">Foto do casal para o contador</p>
              </div>
            </div>
          )}
        </button>
        <div className="pb-4" />
      </div>

      {data.coverPhotoUrl && <PreviewFab onClick={() => setShowPreview(true)} />}
      <div className="step-bottom">
        <div className="flex gap-3">
          <button onClick={onBack} className="flex-1 border-2 border-gray-200 text-gray-600 rounded-2xl py-3.5 font-semibold text-[14px]">← Voltar</button>
          <button onClick={onNext} className="flex-1 bg-purple-600 text-white rounded-2xl py-3.5 font-bold text-[14px] shadow-lg shadow-purple-200">Próximo →</button>
        </div>
      </div>
    </div>
  )
}
