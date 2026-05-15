import { useState, useRef, useEffect } from 'react'
import { Shuffle, Maximize2, Mic, Upload, X, Pencil } from 'lucide-react'
import PreviewFab from '../components/PreviewFab'
import ProgressBar from '../components/ProgressBar'
import BackButton from '../components/BackButton'
import { useQuiz } from '../context/QuizContext'
import { randomMessage } from '../lib/randomTexts'
import SitePreview from '../components/SitePreview'

const MAX = 5000
const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

export default function Step4Message({ onNext, onBack }) {
  const { data, update } = useQuiz()
  const [showPreview, setShowPreview] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [recording, setRecording] = useState(false)
  const [recordTime, setRecordTime] = useState(0)
  const mediaRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const audioInputRef = useRef(null)

  useEffect(() => () => clearInterval(timerRef.current), [])

  if (showPreview) return <SitePreview onBack={() => setShowPreview(false)} />

  const handleAudioFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    update({ audio: URL.createObjectURL(file) })
    e.target.value = ''
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      chunksRef.current = []
      mr.ondataavailable = e => chunksRef.current.push(e.data)
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        update({ audio: URL.createObjectURL(blob) })
        stream.getTracks().forEach(t => t.stop())
      }
      mr.start()
      mediaRef.current = mr
      setRecording(true)
      setRecordTime(0)
      timerRef.current = setInterval(() => setRecordTime(t => t + 1), 1000)
    } catch {
      alert('Permissão de microfone negada. Verifique as configurações do navegador.')
    }
  }

  const stopRecording = () => {
    mediaRef.current?.stop()
    clearInterval(timerRef.current)
    setRecording(false)
  }

  return (
    <div className="step-root">
      <div className="step-scroll">
        <div className="flex items-center gap-3 mb-5 pt-3">
          <BackButton onClick={onBack} />
          <div className="flex-1"><ProgressBar current={4} total={4} /></div>
        </div>

        <h1 className="text-[22px] font-black text-gray-900">Mensagem</h1>
        <p className="text-[14px] text-gray-500 mt-1">
          Escreva uma mensagem <span className="text-purple-600">inesquecível</span> (para emocionar)!
        </p>
        <p className="text-[12px] text-purple-500 mt-2"><Pencil size={12} className="inline text-purple-500 mr-1 mb-0.5" /><strong className="text-purple-600">Você poderá editar depois.</strong></p>

        <div className="mt-5 bg-white rounded-2xl shadow-sm overflow-hidden">
          <textarea
            rows={expanded ? 12 : 7}
            maxLength={MAX}
            placeholder="Escreva uma mensagem especial para o seu amor..."
            className="w-full outline-none text-[15px] text-gray-800 resize-none placeholder-gray-300 p-4 bg-transparent leading-relaxed"
            value={data.message}
            onChange={e => update({ message: e.target.value })}
          />
          <div className="flex items-center gap-3 px-4 pb-3 border-t border-gray-100 pt-3">
            <button onClick={() => update({ message: randomMessage() })}
              className="flex items-center gap-1.5 text-[13px] text-purple-600 font-semibold active:scale-95 transition-all">
              <Shuffle size={13} /> Gerar Aleatório
            </button>
            <button onClick={() => setExpanded(v => !v)}
              className="flex items-center gap-1.5 text-[13px] text-gray-400 active:scale-95 transition-all">
              <Maximize2 size={13} /> Expandir
            </button>
            <span className="ml-auto text-[12px] text-gray-400 font-medium tabular-nums">{data.message.length}/{MAX}</span>
          </div>
        </div>

        {/* Audio */}
        <div className="mt-4">
          <p className="text-[13px] font-semibold text-gray-600 mb-2 px-1">
            Mensagem de voz <span className="font-normal text-gray-400">(opcional)</span>
          </p>

          {!data.audio && !recording && (
            <div className="flex gap-2">
              <label className="flex-1 bg-white rounded-2xl px-3 py-3.5 shadow-sm flex items-center justify-center gap-2 cursor-pointer border-2 border-transparent active:scale-[0.98] transition-all">
                <input ref={audioInputRef} type="file" accept="audio/*" className="hidden" onChange={handleAudioFile} />
                <Upload size={15} className="text-purple-500 shrink-0" />
                <span className="text-[13px] text-gray-600 font-medium">Selecionar</span>
              </label>
              <button onClick={startRecording}
                className="flex-1 bg-white rounded-2xl px-3 py-3.5 shadow-sm flex items-center justify-center gap-2 border-2 border-transparent active:scale-[0.98] transition-all">
                <Mic size={15} className="text-red-500 shrink-0" />
                <span className="text-[13px] text-gray-600 font-medium">Gravar</span>
              </button>
            </div>
          )}

          {recording && (
            <div className="bg-white rounded-2xl px-4 py-4 shadow-sm flex items-center gap-3 border-2 border-red-200">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shrink-0" />
              <span className="text-[14px] font-semibold text-gray-700 flex-1 tabular-nums">
                Gravando... {fmtTime(recordTime)}
              </span>
              <button onClick={stopRecording}
                className="bg-red-500 text-white rounded-xl px-4 py-2 text-[13px] font-bold active:scale-95 transition-all">
                Parar
              </button>
            </div>
          )}

          {data.audio && !recording && (
            <div className="bg-white rounded-2xl px-4 py-3.5 shadow-sm border-2 border-purple-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                  <Mic size={14} className="text-purple-600" />
                </div>
                <p className="text-[13px] font-semibold text-gray-700 flex-1">Áudio adicionado</p>
                <button onClick={() => update({ audio: null })}
                  className="w-7 h-7 flex items-center justify-center active:scale-90 transition-all">
                  <X size={14} className="text-gray-400" />
                </button>
              </div>
              <audio src={data.audio} controls className="w-full h-9" />
            </div>
          )}
        </div>

        <div className="pb-4" />
      </div>

      {data.message.trim() && <PreviewFab onClick={() => setShowPreview(true)} />}
      <div className="step-bottom">
        <div className="flex gap-3">
          <button onClick={onBack} className="flex-1 border-2 border-gray-200 text-gray-600 rounded-2xl py-3.5 font-semibold text-[14px] active:scale-[0.97] transition-all">Voltar</button>
          <button onClick={onNext} className="flex-1 bg-purple-600 text-white rounded-2xl py-3.5 font-bold text-[14px] btn-pulse active:scale-[0.97] transition-all">Próximo</button>
        </div>
      </div>
    </div>
  )
}
