import { useState, useMemo } from 'react'
import { Shuffle, Search, Type, MessageSquare } from 'lucide-react'
import PreviewFab from '../components/PreviewFab'
import BackButton from '../components/BackButton'
import { useQuiz } from '../context/QuizContext'

const MAX_WORD = 10
const MAX_DICA = 50
const MAX_MSG  = 100
const MAX_ROWS = 6

const LOVE_WORDS = ['AMOR', 'BEIJO', 'FELIZ', 'JUNTOS', 'SAUDADE', 'CARINHO', 'PAIXAO', 'ETERNO', 'ABRACO', 'SORRIR']
const LOVE_DICAS = [
  'O que eu mais sinto por você?',
  'O que nos une pra sempre?',
  'Que sentimento define o que temos?',
  'O que nunca vai acabar entre nós?',
  'Qual é o nosso maior segredo?',
]
const LOVE_MSGS = [
  'Te amo mais a cada dia!',
  'Você é tudo pra mim!',
  'Nossa história é o meu presente favorito.',
  'Com você é diferente, sempre foi.',
  'Cada dia ao seu lado é uma dádiva.',
]

const randItem = (arr) => arr[Math.floor(Math.random() * arr.length)]
const normalize = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z]/g, '')

/* ─── Wordle algorithm ───────────────────────────────────────── */
function getColors(guess, target) {
  const result = Array(guess.length).fill('absent')
  const pool = [...target]
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === target[i]) { result[i] = 'correct'; pool[i] = null }
  }
  for (let i = 0; i < guess.length; i++) {
    if (result[i] === 'correct') continue
    const j = pool.indexOf(guess[i])
    if (j !== -1) { result[i] = 'present'; pool[j] = null }
  }
  return result
}

const TILE_BG = { correct: '#538d4e', present: '#b59f3b', absent: '#3a3a3c' }
const KEY_BG  = { correct: '#538d4e', present: '#b59f3b', absent: '#3a3a3c', default: '#818384' }

/* ─── Confetti ───────────────────────────────────────────────── */
const CONF_COLORS = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff922b', '#cc5de8']

function Confetti() {
  const pieces = useMemo(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: +(Math.random() * 2).toFixed(2),
      color: CONF_COLORS[i % CONF_COLORS.length],
      size: Math.round(4 + Math.random() * 6),
      dur: +(2.5 + Math.random() * 2).toFixed(2),
    })), [])

  return (
    <>
      <style>{`@keyframes conf-fall{0%{transform:translateY(-10px) rotate(0deg);opacity:1}100%{transform:translateY(110vh) rotate(720deg);opacity:0}}`}</style>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute', pointerEvents: 'none', zIndex: 5,
          left: `${p.left}%`, top: 0,
          width: p.size, height: p.size,
          background: p.color, borderRadius: 2,
          animation: `conf-fall ${p.dur}s ${p.delay}s ease-in both`,
        }} />
      ))}
    </>
  )
}

/* ─── Wordle Preview ─────────────────────────────────────────── */
const KB_ROW1 = ['Q','W','E','R','T','Y','U','I','O','P']
const KB_ROW2 = ['A','S','D','F','G','H','J','K','L']
const KB_ROW3 = ['Z','X','C','V','B','N','M','⌫']

function WordleGame({ word, dica, mensagem, onClose }) {
  const COLS = word.length
  const tileSize = Math.min(50, Math.floor((280 - (COLS - 1) * 6) / COLS))
  const fontSize = Math.round(tileSize * 0.4)

  const [guesses, setGuesses] = useState([])
  const [current, setCurrent] = useState('')
  const [won, setWon]   = useState(false)
  const [lost, setLost] = useState(false)

  const submit = () => {
    if (won || lost || current.length !== COLS) return
    const next = [...guesses, current]
    setGuesses(next)
    setCurrent('')
    if (current === word) { setWon(true); return }
    if (next.length >= MAX_ROWS) setLost(true)
  }

  const handleKey = (k) => {
    if (won || lost) return
    if (k === '⌫') { setCurrent(c => c.slice(0, -1)); return }
    if (current.length < COLS) setCurrent(c => c + k)
  }

  // keyboard letter colors
  const keyColors = {}
  guesses.forEach(g => {
    getColors(g, word).forEach((c, i) => {
      const l = g[i]
      const prev = keyColors[l]
      if (!prev || c === 'correct' || (c === 'present' && prev === 'absent')) keyColors[l] = c
    })
  })

  const KeyBtn = ({ k, wide }) => (
    <button onClick={() => handleKey(k)}
      style={{
        background: KEY_BG[keyColors[k] || 'default'],
        minWidth: wide ? 42 : k.length > 1 ? 38 : 30,
        height: 46, borderRadius: 6,
        color: 'white', fontSize: k === '⌫' ? 18 : 13, fontWeight: 700,
        border: 'none', cursor: 'pointer', flexShrink: 0,
      }}
      className="active:scale-[0.88] transition-all">
      {k}
    </button>
  )

  const WinTile = ({ letter, color }) => (
    <div style={{
      width: 44, height: 44,
      background: TILE_BG[color] || TILE_BG.correct,
      borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 18, fontWeight: 900, color: 'white',
    }}>{letter}</div>
  )

  return (
    <div className="step-root" style={{ background: '#111119', position: 'relative', overflow: 'hidden' }}>
      {won && <Confetti />}

      <div className="step-scroll flex flex-col items-center" style={{ background: '#111119' }}>
        <div className="text-center px-5 pt-6 pb-4">
          <h2 className="text-[22px] font-black text-white leading-snug">{dica || 'Descubra a palavra secreta!'}</h2>
          <p className="text-[13px] text-gray-500 mt-1">Descubra a palavra secreta ({COLS} letras)</p>
        </div>

        {/* grade de tentativas */}
        <div className="flex flex-col gap-1.5">
          {Array.from({ length: MAX_ROWS }, (_, row) => {
            const guess = guesses[row]
            const isCurrent = row === guesses.length && !won && !lost
            const letters = guess
              ? [...guess]
              : isCurrent
                ? [...current, ...Array(COLS - current.length).fill('')]
                : Array(COLS).fill('')
            const colors = guess ? getColors(guess, word) : null

            return (
              <div key={row} className="flex gap-1.5">
                {letters.map((letter, col) => {
                  const color = colors ? colors[col] : null
                  return (
                    <div key={col} style={{
                      width: tileSize, height: tileSize,
                      background: color ? TILE_BG[color] : 'transparent',
                      border: `2px solid ${color ? TILE_BG[color] : letter ? '#818384' : '#3a3a3c'}`,
                      borderRadius: 6,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize, fontWeight: 900, color: 'white',
                    }}>
                      {letter}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
        <div className="pb-4" />
      </div>

      {/* teclado virtual */}
      <div className="shrink-0 pb-3 pt-1" style={{ background: '#111119' }}>
        {/* row 1 */}
        <div className="flex justify-center gap-[5px] mb-[5px]">
          {KB_ROW1.map(k => <KeyBtn key={k} k={k} />)}
        </div>
        {/* row 2 + OK */}
        <div className="flex justify-center gap-[5px] mb-[5px]">
          {KB_ROW2.map(k => <KeyBtn key={k} k={k} />)}
          <button onClick={submit}
            style={{ background: current.length === COLS ? '#538d4e' : '#3a3a3c', minWidth: 40, height: 46, borderRadius: 6, color: 'white', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s' }}
            className="ml-[5px] active:scale-90 transition-all">
            OK
          </button>
        </div>
        {/* row 3 */}
        <div className="flex justify-center gap-[5px] items-center">
          {KB_ROW3.map(k => <KeyBtn key={k} k={k} wide={k === '⌫'} />)}
        </div>
      </div>

      {/* painel vitória */}
      {won && (
        <div className="absolute inset-x-0 bottom-0 z-10 rounded-t-3xl px-5 pt-5 pb-5 flex flex-col items-center"
          style={{ background: '#1a1a26', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-white font-black text-[22px]">Parabéns! 🎉</p>
          <p className="text-gray-400 text-[13px] mt-1">A palavra era</p>
          <div className="flex gap-1.5 mt-3">
            {[...word].map((l, i) => <WinTile key={i} letter={l} color="correct" />)}
          </div>
          {mensagem && <p className="text-gray-300 text-[13px] mt-3 text-center italic">"{mensagem}"</p>}
          <button onClick={onClose}
            className="mt-4 w-full bg-green-500 text-white rounded-2xl py-3.5 font-bold text-[15px] flex items-center justify-center gap-2 active:scale-[0.97] transition-all">
            Próxima Seção →
          </button>
        </div>
      )}

      {/* painel derrota */}
      {lost && (
        <div className="absolute inset-x-0 bottom-0 z-10 rounded-t-3xl px-5 pt-5 pb-5 flex flex-col items-center"
          style={{ background: '#1a1a26', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-white font-black text-[22px]">Quase lá! 😅</p>
          <p className="text-gray-400 text-[13px] mt-1">A palavra era</p>
          <div className="flex gap-1.5 mt-3">
            {[...word].map((l, i) => <WinTile key={i} letter={l} color="absent" />)}
          </div>
          {mensagem && <p className="text-gray-300 text-[13px] mt-3 text-center italic">"{mensagem}"</p>}
          <button onClick={onClose}
            className="mt-4 w-full bg-purple-600 text-white rounded-2xl py-3.5 font-bold text-[15px] flex items-center justify-center gap-2 active:scale-[0.97] transition-all">
            Fechar Preview
          </button>
        </div>
      )}
      <button onClick={onClose}
        className="absolute bottom-4 right-4 bg-purple-600 text-white rounded-full px-5 py-2.5 font-semibold text-[14px] active:scale-95 transition-all z-[5]">
        Voltar
      </button>
    </div>
  )
}

/* ─── Main config ────────────────────────────────────────────── */
export default function StepJogoPalavra({ onNext, onBack }) {
  const { data, update } = useQuiz()
  const [showPreview, setShowPreview] = useState(false)

  const word     = data.jogoWord     || ''
  const dica     = data.jogoDica     || ''
  const mensagem = data.jogoMensagem || ''

  const wordValid  = word.length >= 3
  const canPreview = wordValid

  if (showPreview) return (
    <WordleGame
      word={word}
      dica={dica}
      mensagem={mensagem}
      onClose={() => setShowPreview(false)}
    />
  )

  return (
    <div className="step-root">
      <div className="step-scroll">
        <div className="flex items-center gap-3 pt-3 mb-5">
          <BackButton onClick={onBack} />
        </div>

        <h1 className="text-[22px] font-black text-gray-900">Jogo da Palavra</h1>
        <p className="text-[14px] text-gray-500 mt-1">Configure a palavra e dicas</p>

        <div className="mt-6 flex flex-col gap-6">

          {/* palavra secreta */}
          <div>
            <p className="text-[14px] font-bold text-gray-800 mb-2">Palavra Secreta</p>
            <label className="bg-white rounded-2xl px-4 py-3.5 shadow-sm flex items-center gap-3 border-2 border-transparent focus-within:border-purple-300 transition-colors cursor-text">
              <Search size={15} className="text-gray-300 shrink-0" />
              <input type="text" placeholder="EX: AMOR" maxLength={MAX_WORD}
                className="flex-1 outline-none text-[14px] text-gray-800 placeholder-gray-300 bg-transparent uppercase tracking-widest"
                value={word}
                onChange={e => update({ jogoWord: normalize(e.target.value) })} />
              <span className="text-[12px] text-gray-400 shrink-0 tabular-nums">{word.length}/{MAX_WORD}</span>
              <button onClick={() => update({ jogoWord: randItem(LOVE_WORDS) })}
                className="text-purple-400 active:scale-90 transition-all shrink-0">
                <Shuffle size={14} />
              </button>
            </label>
            <p className="text-[12px] text-gray-400 mt-1.5">Escolha uma palavra entre 3 e {MAX_WORD} letras.</p>
          </div>

          {/* dica */}
          <div>
            <p className="text-[14px] font-bold text-gray-800 mb-2">Dica / Pergunta</p>
            <label className="bg-white rounded-2xl px-4 py-3.5 shadow-sm flex items-center gap-3 border-2 border-transparent focus-within:border-purple-300 transition-colors cursor-text">
              <Type size={15} className="text-gray-300 shrink-0" />
              <input type="text" placeholder="O que mais gosto em você" maxLength={MAX_DICA}
                className="flex-1 outline-none text-[14px] text-gray-800 placeholder-gray-300 bg-transparent"
                value={dica}
                onChange={e => update({ jogoDica: e.target.value })} />
              <span className="text-[12px] text-gray-400 shrink-0 tabular-nums">{dica.length}/{MAX_DICA}</span>
              <button onClick={() => update({ jogoDica: randItem(LOVE_DICAS) })}
                className="text-purple-400 active:scale-90 transition-all shrink-0">
                <Shuffle size={14} />
              </button>
            </label>
            <p className="text-[12px] text-gray-400 mt-1.5">A pergunta ou dica que aparecerá acima do jogo.</p>
          </div>

          {/* mensagem final */}
          <div>
            <p className="text-[14px] font-bold text-gray-800 mb-2">Mensagem Final</p>
            <div className="bg-white rounded-2xl shadow-sm border-2 border-transparent focus-within:border-purple-300 transition-colors overflow-hidden">
              <div className="flex items-start gap-3 px-4 pt-3.5">
                <MessageSquare size={15} className="text-gray-300 shrink-0 mt-0.5" />
                <textarea rows={3} placeholder="É isso que eu mais amo em você!" maxLength={MAX_MSG}
                  className="flex-1 outline-none text-[14px] text-gray-800 placeholder-gray-300 bg-transparent resize-none leading-relaxed"
                  value={mensagem}
                  onChange={e => update({ jogoMensagem: e.target.value })} />
                <button onClick={() => update({ jogoMensagem: randItem(LOVE_MSGS) })}
                  className="text-purple-400 active:scale-90 transition-all shrink-0 mt-0.5">
                  <Shuffle size={14} />
                </button>
              </div>
              <div className="flex justify-end px-4 pb-2 pt-1">
                <span className="text-[11px] text-gray-400 tabular-nums">{mensagem.length}/{MAX_MSG}</span>
              </div>
            </div>
            <p className="text-[12px] text-gray-400 mt-1.5">A mensagem que aparecerá quando a pessoa acertar a palavra.</p>
          </div>
        </div>
        <div className="pb-4" />
      </div>

      {canPreview && <PreviewFab onClick={() => setShowPreview(true)} />}
      <div className="step-bottom">
        <div className="flex gap-3">
          <button onClick={onBack}
            className="flex-1 border-2 border-gray-200 text-gray-600 rounded-2xl py-3.5 font-semibold text-[14px] flex items-center justify-center gap-1 active:scale-[0.97] transition-all">
            ‹ Voltar
          </button>
          <button onClick={onNext} disabled={!wordValid}
            className={`flex-1 rounded-2xl py-3.5 font-semibold text-[14px] flex items-center justify-center gap-1 transition-all active:scale-[0.97]
              ${wordValid ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'bg-gray-100 text-gray-400'}`}>
            Próximo Passo ›
          </button>
        </div>
      </div>
    </div>
  )
}
