import { useRef, useState } from 'react'
import { ImagePlus, X, Pencil } from 'lucide-react'
import PreviewFab from '../components/PreviewFab'
import ProgressBar from '../components/ProgressBar'
import BackButton from '../components/BackButton'
import { useQuiz } from '../context/QuizContext'
import SitePreview from '../components/SitePreview'

const MAX_PHOTOS = 6

export default function Step3Photos({ onNext, onBack }) {
  const { data, update } = useQuiz()
  const [showPreview, setShowPreview] = useState(false)
  const inputRef = useRef(null)

  if (showPreview) return <SitePreview overlay onBack={() => setShowPreview(false)} />

  const handleFiles = (e) => {
    const files = Array.from(e.target.files)
    const toAdd = files.slice(0, MAX_PHOTOS - data.photos.length).map(f => ({ file: f, preview: URL.createObjectURL(f) }))
    update({ photos: [...data.photos, ...toAdd] })
    e.target.value = ''
  }

  return (
    <div className="step-root">
      <div className="step-scroll">
        <div className="flex items-center gap-3 mb-5 pt-3">
          <BackButton onClick={onBack} />
          <div className="flex-1"><ProgressBar current={3} total={4} /></div>
        </div>

        <h1 className="text-[22px] font-black text-gray-900">Fotos</h1>
        <p className="text-[14px] text-gray-500 mt-1">Adicione fotos para a capa desse <span className="text-purple-600">presente único</span></p>
        <p className="text-[12px] text-purple-500 mt-2"><Pencil size={12} className="inline text-purple-500 mr-1 mb-0.5" /><strong className="text-purple-600">Você poderá editar depois.</strong></p>

        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />

        {data.photos.length === 0 ? (
          <button onClick={() => inputRef.current?.click()}
            className="w-full mt-5 bg-white rounded-2xl p-10 shadow-sm border-2 border-dashed border-purple-200 flex flex-col items-center gap-3 active:scale-[0.98] transition-all">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center">
              <ImagePlus size={26} className="text-purple-500" />
            </div>
            <div className="text-center">
              <p className="text-[15px] font-bold text-gray-700">Selecionar Imagens (Clique)</p>
              <p className="text-[13px] text-gray-400 mt-1">Limite: {MAX_PHOTOS} de {MAX_PHOTOS}.</p>
            </div>
          </button>
        ) : (
          <div className="mt-5">
            <div className="grid grid-cols-3 gap-2">
              {data.photos.map((photo, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden shadow-sm bg-gray-100">
                  <img src={photo.preview} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => update({ photos: data.photos.filter((_, i) => i !== idx) })}
                    className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-sm rounded-full w-6 h-6 flex items-center justify-center active:scale-90 transition-all">
                    <X size={11} className="text-white" />
                  </button>
                </div>
              ))}
              {data.photos.length < MAX_PHOTOS && (
                <button onClick={() => inputRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-purple-200 flex flex-col items-center justify-center bg-white gap-1.5 active:scale-[0.97] transition-all">
                  <ImagePlus size={22} className="text-purple-300" />
                  <span className="text-[10px] text-gray-400 font-medium">Adicionar</span>
                </button>
              )}
            </div>
          </div>
        )}
        <div className="pb-4" />
      </div>

      {data.photos.length > 0 && <PreviewFab onClick={() => setShowPreview(true)} />}
      <div className="step-bottom">
        <div className="flex gap-3">
          <button onClick={onBack} className="flex-1 border-2 border-gray-200 text-gray-600 rounded-2xl py-3.5 font-semibold text-[14px] active:scale-[0.97] transition-all">Voltar</button>
          <button onClick={onNext} className="flex-1 bg-purple-600 text-white rounded-2xl py-3.5 font-bold text-[14px] btn-pulse active:scale-[0.97] transition-all">Próximo</button>
        </div>
      </div>
    </div>
  )
}
