import { useQuiz } from '../context/QuizContext'

export default function PandaMascot({ size = 90 }) {
  const ctx = useQuiz()
  const isBiblico = ctx?.data?.variant === 'biblico'
  const imgSize = isBiblico ? Math.round(size * 0.58) : size

  return (
    <div className="flex flex-col items-center"
      style={isBiblico ? { marginTop: 65, marginBottom: 12 } : {}}>
      <img
        src={isBiblico ? '/anjinho.png' : '/cupido.png'}
        alt={isBiblico ? 'Anjinho' : 'Cupido'}
        style={{ width: imgSize, height: imgSize, objectFit: 'contain' }}
        draggable={false}
      />
    </div>
  )
}
