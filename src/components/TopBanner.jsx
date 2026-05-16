import { useQuiz } from '../context/QuizContext'

export default function TopBanner() {
  const ctx = useQuiz()
  const isBiblico = ctx?.data?.variant === 'biblico'

  if (isBiblico) return (
    <div className="text-white text-center py-2.5 px-4 leading-snug" style={{ background: '#1d4ed8' }}>
      <span className="font-black text-[15px]" style={{ color: '#fcd34d' }}>+50.000 casais cristãos</span>
      <span className="text-[15px] font-medium"> já surpreenderam quem amam. </span>
      <span className="text-[15px] font-bold">Crie o seu presente especial agora.</span>
    </div>
  )

  return (
    <div className="bg-purple-700 text-white text-center py-2.5 px-4 leading-snug">
      <span className="text-yellow-300 font-black text-[15px]">+50.000 pessoas</span>
      <span className="text-[15px] font-medium"> já fizeram alguém chorar de emoção. </span>
      <span className="text-[15px] font-bold">Você está a 5 minutos de ser a próxima.</span>
    </div>
  )
}
