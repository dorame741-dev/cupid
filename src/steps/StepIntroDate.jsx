import { Calendar, Clock } from 'lucide-react'
import PandaMascot from '../components/PandaMascot'
import LiveCounter from '../components/LiveCounter'
import CitySearch from '../components/CitySearch'
import BackButton from '../components/BackButton'
import { useQuiz } from '../context/QuizContext'
import { useEffect } from 'react'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export default function StepIntroDate({ onNext, onBack }) {
  const { data, update } = useQuiz()

  useEffect(() => {
    if (!data.relationshipStart) update({ relationshipStart: todayStr() })
    if (!data.relationshipTime) update({ relationshipTime: '15:00' })
  }, [])

  return (
    <div className="step-root">
      <div className="step-scroll flex flex-col items-center" style={{ paddingTop: 0 }}>
        <div className="w-full flex items-center pt-2 pb-0">
          <BackButton onClick={onBack} />
        </div>

        <div style={{ marginTop: -90, marginBottom: -38 }}>
          <PandaMascot size={230} />
        </div>

        <div className="w-full bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-gray-700 text-[15px] leading-relaxed">
            Que lindo! Agora, me diz uma coisa,{' '}
            <span className="text-purple-600 font-semibold">{data.myName || 'você'}</span>, há quanto tempo
            vocês estão juntos?
          </p>
        </div>

        <div className="w-full flex flex-col gap-4 mt-5">
          <div>
            <p className="text-[13px] font-semibold text-gray-600 mb-2 px-1">Dia que vocês começaram o relacionamento</p>
            <label className="bg-white rounded-2xl px-4 py-4 shadow-sm flex items-center gap-3 border-2 border-purple-300 focus-within:border-purple-500 transition-colors cursor-text">
              <Calendar size={20} className="text-purple-500 shrink-0" />
              <input type="date" className="flex-1 outline-none text-[15px] text-gray-800 bg-transparent"
                value={data.relationshipStart}
                onChange={e => update({ relationshipStart: e.target.value })} />
            </label>
          </div>

          <div>
            <p className="text-[13px] font-semibold text-gray-600 mb-2 px-1">Horário que vocês começaram o relacionamento</p>
            <label className="bg-white rounded-2xl px-4 py-4 shadow-sm flex items-center gap-3 border-2 border-purple-300 focus-within:border-purple-500 transition-colors cursor-text">
              <Clock size={20} className="text-purple-500 shrink-0" />
              <input type="time" className="flex-1 outline-none text-[15px] text-gray-800 bg-transparent"
                value={data.relationshipTime}
                onChange={e => update({ relationshipTime: e.target.value })} />
            </label>
          </div>

          <div>
            <p className="text-[13px] font-semibold text-gray-600 mb-2 px-1">
              Cidade <span className="font-normal text-gray-400">(opcional)</span>
            </p>
            <CitySearch value={data.city} onChange={city => update({ city })} />
          </div>
        </div>

        {data.relationshipStart && (
          <div className="w-full">
            <LiveCounter startDate={data.relationshipStart} startTime={data.relationshipTime} />
          </div>
        )}
        <div className="pb-4" />
      </div>

      <div className="step-bottom">
        <button
          onClick={onNext}
          className="w-full bg-purple-600 text-white rounded-2xl py-4 font-bold text-[16px] btn-pulse active:scale-[0.97] transition-all"
        >
          Continuar
        </button>
      </div>
    </div>
  )
}
