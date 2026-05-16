import { useQuiz } from '../context/QuizContext'

export default function PandaMascot({ size = 90 }) {
  const ctx = useQuiz()
  const isBiblico = ctx?.data?.variant === 'biblico'
  return (
    <div className="flex flex-col items-center">
      <img
        src={isBiblico ? '/anjinho.png' : '/cupido.png'}
        alt={isBiblico ? 'Anjinho' : 'Cupido'}
        style={{ width: size, height: size, objectFit: 'contain' }}
        draggable={false}
      />
    </div>
  )
}
