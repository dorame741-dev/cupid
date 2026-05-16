import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, MoreHorizontal, Heart, Mic } from 'lucide-react'
import { useQuiz } from '../context/QuizContext'
import LiveCounter from './LiveCounter'
import { loadYTAPI, DEFAULT_SONGS } from '../lib/youtube'

const BG_RED  = 'radial-gradient(ellipse at 20% 80%, rgba(190,18,60,0.65) 0%, transparent 52%), radial-gradient(ellipse at 80% 15%, rgba(157,23,77,0.55) 0%, transparent 48%), #0a0208'
const BG_RED2 = 'radial-gradient(ellipse at 60% 40%, rgba(190,18,60,0.5) 0%, transparent 55%), #0a0208'
const BG_BLACK = '#030308'

/* ─── Photo carousel ───────────────────────────────────────── */
function PhotoCarousel({ photos: rawPhotos }) {
  const photos = rawPhotos || []
  const [idx, setIdx]         = useState(0)
  const [opacity, setOpacity] = useState(1)
  const autoRef = useRef(null)
  const fading  = useRef(false)
  const touchX  = useRef(0)

  const fadeTo = (next) => {
    if (fading.current || photos.length <= 1) return
    fading.current = true
    setOpacity(0)
    setTimeout(() => { setIdx(next); setOpacity(1); fading.current = false }, 400)
  }

  const resetAuto = () => {
    clearInterval(autoRef.current)
    if (photos.length > 1)
      autoRef.current = setInterval(() => {
        setIdx(i => { const next = (i + 1) % photos.length; fadeTo(next); return i })
      }, 10000)
  }

  useEffect(() => { resetAuto(); return () => clearInterval(autoRef.current) }, [photos.length])

  const allPhotos = photos.length > 0 ? photos : [{ preview: '/default-couple.png', isDefault: true }]
  const isDefault = allPhotos[0]?.isDefault

  const handleTap = (e) => {
    if (isDefault || photos.length <= 1) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.changedTouches?.[0]?.clientX ?? e.clientX) - rect.left
    const dir = x < rect.width / 2 ? -1 : 1
    fadeTo((idx + dir + photos.length) % photos.length)
    resetAuto()
  }

  return (
    <div
      className="mx-5 my-6 aspect-square rounded-3xl overflow-hidden shadow-2xl relative select-none"
      style={{ cursor: isDefault ? 'default' : 'pointer' }}
      onTouchStart={e => { touchX.current = e.touches[0].clientX }}
      onTouchEnd={handleTap}
      onClick={handleTap}
    >
      {/* story bars */}
      {!isDefault && photos.length > 1 && (
        <div style={{ position: 'absolute', top: 10, left: 10, right: 10, display: 'flex', gap: 4, zIndex: 20 }}>
          {photos.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.3)', borderRadius: 2, overflow: 'hidden' }}>
              <div
                key={`fill-${idx}-${i}`}
                style={{
                  height: '100%', background: 'white', borderRadius: 2,
                  width: i < idx ? '100%' : '0%',
                  ...(i === idx ? { animation: 'storyFill 10s linear forwards' } : {}),
                }}
              />
            </div>
          ))}
        </div>
      )}

      <img src={allPhotos[idx]?.preview} alt="" aria-hidden
        className="absolute inset-0 w-full h-full object-cover scale-125 blur-2xl brightness-40 pointer-events-none" />
      <img src={allPhotos[idx]?.preview} alt="Foto do casal"
        className="relative z-10 w-full h-full object-cover pointer-events-none"
        style={{ opacity, transition: 'opacity 0.4s ease' }} />
      {isDefault && (
        <div className="absolute inset-0 z-20 flex items-end justify-center pb-5 pointer-events-none">
          <span className="bg-black/50 backdrop-blur-sm text-white/80 text-[11px] font-medium px-3 py-1 rounded-full">
            Adicione suas fotos
          </span>
        </div>
      )}
    </div>
  )
}

/* ─── YouTube hook ─────────────────────────────────────────── */
function useYTPlayer(videoId) {
  const divRef     = useRef(null)
  const playerRef  = useRef(null)
  const [ready, setReady]             = useState(false)
  const [playing, setPlaying]         = useState(false)
  const [progress, setProgress]       = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration]       = useState(0)
  const tickRef = useRef(null)

  useEffect(() => {
    if (!videoId || !divRef.current) return
    let destroyed = false
    loadYTAPI().then(() => {
      if (destroyed || !divRef.current) return
      playerRef.current = new window.YT.Player(divRef.current, {
        width: 1, height: 1, videoId,
        playerVars: { autoplay: 0, controls: 0, playsinline: 1, rel: 0, modestbranding: 1 },
        events: {
          onReady: () => { if (!destroyed) { playerRef.current.setVolume(45); setReady(true) } },
          onStateChange: (e) => {
            const S = window.YT.PlayerState
            if (e.data === S.PLAYING) {
              setPlaying(true)
              setDuration(playerRef.current.getDuration())
              tickRef.current = setInterval(() => {
                const t = playerRef.current.getCurrentTime()
                const d = playerRef.current.getDuration()
                setCurrentTime(t); setDuration(d)
                setProgress(d > 0 ? (t / d) * 100 : 0)
              }, 500)
            } else {
              setPlaying(false)
              clearInterval(tickRef.current)
            }
          },
        },
      })
    })
    return () => {
      destroyed = true
      clearInterval(tickRef.current)
      playerRef.current?.destroy()
      playerRef.current = null
    }
  }, [videoId])

  const togglePlay  = () => { if (!ready || !playerRef.current) return; playing ? playerRef.current.pauseVideo() : playerRef.current.playVideo() }
  const seekTo      = (sec) => { if (!ready || !playerRef.current) return; playerRef.current.seekTo(Math.max(0, Math.min(duration, sec)), true) }
  const seekPct     = (pct) => seekTo((pct / 100) * duration)
  const seekBack    = () => seekTo(currentTime - 15)
  const seekForward = () => seekTo(currentTime + 15)

  return { divRef, ready, playing, progress, currentTime, duration, togglePlay, seekPct, seekBack, seekForward }
}

/* ─── Music player ──────────────────────────────────────────── */
function MusicPlayer({ music }) {
  const song = music || DEFAULT_SONGS[0]
  const { divRef, ready, playing, progress, currentTime, duration, togglePlay, seekPct, seekBack, seekForward } = useYTPlayer(song.id)

  const fmt = (s) => { const sec = Math.max(0, Math.floor(s)); return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}` }
  const progressStyle = { background: `linear-gradient(to right, white ${progress}%, #3a3a3a ${progress}%)` }

  return (
    <div className="relative px-5 pb-6 overflow-hidden">
      <div style={{ position: 'fixed', top: '-9999px', left: '-9999px', width: 1, height: 1, pointerEvents: 'none' }}>
        <div ref={divRef} />
      </div>

      <div className="flex mb-5 relative z-10">
        <div className="min-w-0">
          <p className="text-white text-[15px] font-bold leading-tight truncate">{song.title}</p>
          <p className="text-gray-500 text-[13px] truncate">{song.channel}</p>
        </div>
      </div>

      <div className="relative z-10 mb-1">
        <input type="range" min={0} max={100} step={0.1}
          value={progress}
          onChange={e => seekPct(Number(e.target.value))}
          className="spotify-range" style={progressStyle} />
        <div className="flex justify-between mt-1.5">
          <span className="text-gray-600 text-[11px] font-medium tabular-nums">{fmt(currentTime)}</span>
          <span className="text-gray-600 text-[11px] font-medium tabular-nums">
            {duration > 0 ? `-${fmt(duration - currentTime)}` : '-0:00'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between px-1 mt-4 relative z-10">
        <button className="w-10 h-10 flex items-center justify-center text-gray-600 text-lg hover:text-white transition-colors">⇄</button>
        <button onClick={seekBack}
          className="w-10 h-10 flex flex-col items-center justify-center text-gray-300 hover:text-white transition-colors active:scale-90 group">
          <span className="text-[22px] leading-none">⏮</span>
          <span className="text-[9px] text-gray-600 group-hover:text-gray-400 leading-none mt-0.5 font-medium">15s</span>
        </button>
        <button onClick={togglePlay}
          className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all">
          <span className="text-gray-900 text-2xl ml-[2px]">{playing ? '⏸' : '▶'}</span>
        </button>
        <button onClick={seekForward}
          className="w-10 h-10 flex flex-col items-center justify-center text-gray-300 hover:text-white transition-colors active:scale-90 group">
          <span className="text-[22px] leading-none">⏭</span>
          <span className="text-[9px] text-gray-600 group-hover:text-gray-400 leading-none mt-0.5 font-medium">15s</span>
        </button>
        <button className="w-10 h-10 flex items-center justify-center text-gray-600 text-lg hover:text-white transition-colors">↺</button>
      </div>
    </div>
  )
}

/* ─── Message full screen ───────────────────────────────────── */
const BG_MSG = 'linear-gradient(160deg, #c8183e 0%, #9f1239 55%, #7f0f2e 100%)'

function MessageFull({ message, audio, onClose }) {
  const audioRef = useRef(null)
  const [playing, setPlaying]     = useState(false)
  const [progress, setProgress]   = useState(0)
  const [currentTime, setCurrent] = useState(0)
  const [duration, setDuration]   = useState(0)

  const fmt = (s) => { const n = Math.max(0, Math.floor(s)); return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}` }

  const onTimeUpdate = () => {
    const el = audioRef.current; if (!el) return
    setCurrent(el.currentTime)
    setDuration(el.duration || 0)
    setProgress(el.duration > 0 ? (el.currentTime / el.duration) * 100 : 0)
  }

  const togglePlay = () => {
    const el = audioRef.current; if (!el) return
    playing ? el.pause() : el.play()
  }

  const handleSeek = (e) => {
    const el = audioRef.current; if (!el || !duration) return
    el.currentTime = (Number(e.target.value) / 100) * duration
  }

  return (
    <div className="step-root" style={{ background: BG_MSG }}>
      {audio && (
        <audio ref={audioRef} src={audio}
          onTimeUpdate={onTimeUpdate} onLoadedMetadata={onTimeUpdate}
          onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
      )}

      <button onClick={onClose}
        className="shrink-0 w-9 h-9 flex items-center justify-center text-white/60 active:opacity-50 transition-opacity mt-3 ml-3">
        <ChevronLeft size={22} />
      </button>

      <div className="step-scroll">
        <p style={{ fontFamily: "'Dancing Script', cursive", fontSize: 26, fontWeight: 600, lineHeight: 1.85, color: 'rgba(255,255,255,0.95)' }}>
          {message}
        </p>

        {audio && (
          <div className="mt-12">
            <input type="range" min={0} max={100} step={0.1}
              value={progress} onChange={handleSeek}
              className="spotify-range w-full"
              style={{ background: `linear-gradient(to right, white ${progress}%, rgba(255,255,255,0.25) ${progress}%)` }}
            />
            <div className="flex justify-between mt-1.5 mb-5">
              <span className="text-white/50 text-[11px] tabular-nums">{fmt(currentTime)}</span>
              <span className="text-white/50 text-[11px] tabular-nums">-{fmt(duration - currentTime)}</span>
            </div>
            <div className="flex justify-center">
              <button onClick={togglePlay}
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform">
                <span style={{ fontSize: 26, color: '#9f1239', marginLeft: playing ? 0 : 3 }}>
                  {playing ? '⏸' : '▶'}
                </span>
              </button>
            </div>
          </div>
        )}
        <div className="pb-4" />
      </div>
    </div>
  )
}

/* ─── Message card ──────────────────────────────────────────── */
function MessageCard({ message, audio, onOpen }) {
  return (
    <div className="mx-4"
      style={{ background: 'linear-gradient(135deg, #be123c 0%, #9f1239 50%, #881337 100%)', borderRadius: 24, padding: 20, boxShadow: '0 8px 32px rgba(190,18,60,0.4)' }}>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-red-200 text-[13px] font-black uppercase tracking-widest">Mensagem especial</span>
        <div className="ml-auto flex items-center gap-2">
          {audio && <Mic size={14} className="text-red-200/70" />}
          <span className="text-red-300 text-base">💌</span>
        </div>
      </div>

      <p className="text-white text-[23px] font-black leading-snug line-clamp-3"
        style={{ fontFamily: "'Inter', sans-serif" }}>
        {message || 'Sua mensagem especial vai aparecer aqui!'}
      </p>

      {message && (
        <button onClick={onOpen}
          className="mt-4 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-[13px] font-semibold px-5 py-2.5 rounded-full active:scale-95 transition-all">
          Mostrar Mensagem
        </button>
      )}
    </div>
  )
}

/* ─── Games hub (Conquistas) ────────────────────────────────── */
const GAME_DEFS = [
  { id: 'roulette', label: 'Roleta',   bg: '#7f1d1d', accent: '#fca5a5' },
  { id: 'words',    label: 'Palavras', bg: '#2e1065', accent: '#c4b5fd' },
  { id: 'gallery',  label: 'Galeria',  bg: '#451a03', accent: '#fcd34d' },
  { id: 'map',      label: 'Mapa',     bg: '#082f49', accent: '#7dd3fc' },
  { id: 'timeline', label: 'Jornada',  bg: '#052e16', accent: '#6ee7b7' },
  { id: 'stars',    label: 'Estrelas', bg: '#1e1b4b', accent: '#a5b4fc' },
]

const BG_CONQUEST = 'radial-gradient(ellipse at 25% 75%, rgba(109,40,217,0.45) 0%, transparent 55%), radial-gradient(ellipse at 78% 20%, rgba(139,92,246,0.35) 0%, transparent 50%), #0d0720'

const CONQUEST_HEARTS = [
  { left: '8%',  size: 13, dur: 10, delay: -2  },
  { left: '25%', size:  9, dur: 14, delay: -6  },
  { left: '45%', size: 17, dur:  8, delay: -4  },
  { left: '65%', size: 11, dur: 12, delay: -1  },
  { left: '82%', size: 15, dur:  9, delay: -7  },
]

function GameMockup({ id, accent }) {
  if (id === 'roulette') return (
    <svg width="34" height="34" viewBox="0 0 44 44">
      {[0,1,2,3,4,5].map(i => {
        const a  = (i/6)*Math.PI*2 - Math.PI/2
        const a2 = ((i+1)/6)*Math.PI*2 - Math.PI/2
        const x1 = 22+20*Math.cos(a),  y1 = 22+20*Math.sin(a)
        const x2 = 22+20*Math.cos(a2), y2 = 22+20*Math.sin(a2)
        return <path key={i} d={`M 22 22 L ${x1} ${y1} A 20 20 0 0 1 ${x2} ${y2} Z`}
          fill={i%2===0 ? accent+'50' : accent+'22'} stroke={accent+'40'} strokeWidth="0.8"/>
      })}
      <circle cx="22" cy="22" r="6" fill={accent} opacity="0.9"/>
      <text x="22" y="26" textAnchor="middle" fontSize="8" fill="#fff" fontWeight="bold">♥</text>
    </svg>
  )
  if (id === 'words') return (
    <svg width="34" height="34" viewBox="0 0 44 44">
      {[0,1,2].map(row => [0,1,2,3,4].map(col => (
        <rect key={`${row}-${col}`} x={col*8+2} y={row*11+5} width="7" height="9" rx="1.5"
          fill={(row===0&&col===2)||(row===1&&col===0)||(row===2&&col===4) ? accent+'90' : accent+'22'}
          stroke={accent+'45'} strokeWidth="0.6"/>
      )))}
    </svg>
  )
  if (id === 'gallery') return (
    <svg width="34" height="34" viewBox="0 0 44 44">
      <rect x="2"  y="2"  width="18" height="18" rx="3" fill={accent+'40'} stroke={accent+'55'} strokeWidth="1"/>
      <rect x="24" y="2"  width="18" height="18" rx="3" fill={accent+'22'} stroke={accent+'35'} strokeWidth="1"/>
      <rect x="2"  y="24" width="18" height="18" rx="3" fill={accent+'22'} stroke={accent+'35'} strokeWidth="1"/>
      <rect x="24" y="24" width="18" height="18" rx="3" fill={accent+'40'} stroke={accent+'55'} strokeWidth="1"/>
    </svg>
  )
  if (id === 'map') return (
    <svg width="34" height="34" viewBox="0 0 44 44">
      <path d="M 8 36 Q 14 22 22 18 Q 31 14 36 8" stroke={accent+'60'} strokeWidth="1.8" fill="none" strokeDasharray="3 2.5"/>
      <circle cx="8"  cy="36" r="3.5" fill={accent}/>
      <circle cx="22" cy="18" r="2.5" fill={accent+'90'}/>
      <circle cx="36" cy="8"  r="3.5" fill={accent}/>
    </svg>
  )
  if (id === 'timeline') return (
    <svg width="34" height="34" viewBox="0 0 44 44">
      <line x1="22" y1="4" x2="22" y2="40" stroke={accent+'40'} strokeWidth="2"/>
      {[8,18,28,38].map((y,i) => (
        <g key={y}>
          <circle cx="22" cy={y} r="3.5" fill={i%2===0 ? accent : 'transparent'} stroke={accent} strokeWidth="1.5"/>
          <rect x={i%2===0 ? 29 : 5} y={y-5} width="11" height="10" rx="2" fill={accent+'22'} stroke={accent+'35'} strokeWidth="0.6"/>
        </g>
      ))}
    </svg>
  )
  if (id === 'stars') return (
    <svg width="34" height="34" viewBox="0 0 44 44">
      {[[10,10],[34,8],[20,22],[8,32],[38,30],[24,38]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r={i%2===0 ? 2.5 : 1.5} fill={accent} opacity={i%2===0 ? 0.9 : 0.5}/>
      ))}
      <line x1="10" y1="10" x2="34"  y2="8"  stroke={accent+'35'} strokeWidth="0.8"/>
      <line x1="34" y1="8"  x2="20"  y2="22" stroke={accent+'35'} strokeWidth="0.8"/>
      <line x1="20" y1="22" x2="38"  y2="30" stroke={accent+'35'} strokeWidth="0.8"/>
    </svg>
  )
  return null
}

const ROLETA_COLORS = { rosa: ['#d4547a','#f0a8c0'], azul: ['#3b6fd4','#7ab2f0'] }

function RoletaWheelSVG({ options, colors, rotation, spinning }) {
  const n = options.length
  if (n < 2) return null
  const cx = 150, cy = 150, r = 140
  const slices = options.map((opt, i) => {
    const start = (i / n) * 2 * Math.PI - Math.PI / 2
    const end   = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2
    const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start)
    const x2 = cx + r * Math.cos(end),   y2 = cy + r * Math.sin(end)
    const large = end - start > Math.PI ? 1 : 0
    const mid = (start + end) / 2
    const tx = cx + r * 0.65 * Math.cos(mid), ty = cy + r * 0.65 * Math.sin(mid)
    return { opt, x1, y1, x2, y2, large, tx, ty, mid, color: colors[i % 2] }
  })
  return (
    <svg viewBox="0 0 300 300" width="100%" height="100%"
      style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? 'transform 4s cubic-bezier(0.17,0.67,0.12,0.99)' : 'none' }}>
      {slices.map(({ opt, x1, y1, x2, y2, large, tx, ty, mid, color }, i) => (
        <g key={i}>
          <path d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`} fill={color} stroke="white" strokeWidth={1.5} />
          <text x={tx} y={ty} fill="white" fontSize={11} fontWeight="bold" textAnchor="middle" dominantBaseline="middle"
            transform={`rotate(${mid * 180 / Math.PI + 90}, ${tx}, ${ty})`}>
            {opt.length > 9 ? opt.slice(0,9)+'…' : opt}
          </text>
        </g>
      ))}
      <circle cx={cx} cy={cy} r={22} fill={colors[0]} />
      <text x={cx} y={cy+2} fontSize={20} textAnchor="middle" dominantBaseline="middle" fill="white">♥</text>
    </svg>
  )
}

function RoletaGameView({ data, onClose }) {
  const colors = ROLETA_COLORS[data.roletaTheme] || ROLETA_COLORS.rosa
  const question = data.roletaQuestion || 'Para onde vamos sair hoje?'
  const options  = (data.roletaOptions || []).filter(o => o?.trim())
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [result, setResult]     = useState(null)
  const rotRef = useRef(0)

  const spin = () => {
    if (spinning || options.length < 2) return
    setSpinning(true); setResult(null)
    const next = rotRef.current + (5 + Math.random() * 5) * 360 + Math.random() * 360
    rotRef.current = next; setRotation(next)
    setTimeout(() => {
      setSpinning(false)
      const n = options.length
      const normalized = ((next % 360) + 360) % 360
      const pointerOnWheel = (360 - normalized) % 360
      setResult(options[Math.floor(pointerOnWheel / (360 / n)) % n])
    }, 4200)
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'#0d0d0d', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', alignItems:'center', paddingBottom:24 }}>
        <h2 style={{ color:'white', fontSize:22, fontWeight:900, textAlign:'center', margin:'24px 16px 20px' }}>{question}</h2>
        <div style={{ width:0, height:0, borderLeft:'11px solid transparent', borderRight:'11px solid transparent', borderTop:`22px solid ${colors[0]}`, marginBottom:4 }} />
        <div style={{ width:'78%', aspectRatio:'1' }}>
          <RoletaWheelSVG options={options} colors={colors} rotation={rotation} spinning={spinning} />
        </div>
        <button onClick={spin} disabled={spinning}
          style={{ marginTop:32, background:'white', color:'#111', fontWeight:700, fontSize:16, padding:'16px 48px', borderRadius:16, border:'none', cursor:'pointer', opacity:spinning?0.6:1 }}>
          {spinning ? 'Girando…' : 'Girar Roleta'}
        </button>
        {result && (
          <div style={{ margin:'24px 24px 0', background:'rgba(255,255,255,0.1)', borderRadius:16, padding:'16px 20px', textAlign:'center' }}>
            <p style={{ color:'rgba(255,255,255,0.5)', fontSize:13 }}>O resultado foi</p>
            <p style={{ color:'white', fontSize:24, fontWeight:900, marginTop:4 }}>{result}</p>
          </div>
        )}
      </div>
      <button onClick={onClose} style={{ position:'absolute', top:16, right:16, background:'rgba(255,255,255,0.12)', color:'white', border:'none', borderRadius:20, padding:'8px 16px', fontSize:14, fontWeight:600, cursor:'pointer' }}>✕ Fechar</button>
    </div>
  )
}

function getWordleColors(guess, target) {
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

const WL_TILE = { correct:'#538d4e', present:'#b59f3b', absent:'#3a3a3c' }
const WL_KEY  = { correct:'#538d4e', present:'#b59f3b', absent:'#3a3a3c', default:'#818384' }
const WL_ROW1 = ['Q','W','E','R','T','Y','U','I','O','P']
const WL_ROW2 = ['A','S','D','F','G','H','J','K','L']
const WL_ROW3 = ['Z','X','C','V','B','N','M','⌫']

function WordleGameView({ data, onClose }) {
  const word = data.jogoWord || ''
  const dica = data.jogoDica || 'Descubra a palavra secreta!'
  const msg  = data.jogoMensagem || ''
  const COLS = word.length
  const gridW = typeof window !== 'undefined' ? Math.min(340, window.innerWidth - 40) : 320
  const ts   = Math.min(66, Math.floor((gridW - (COLS - 1) * 8) / COLS))

  const [guesses, setGuesses] = useState([])
  const [current, setCurrent] = useState('')
  const [won,  setWon]  = useState(false)
  const [lost, setLost] = useState(false)

  const submit = () => {
    if (won || lost || current.length !== COLS) return
    const next = [...guesses, current]; setGuesses(next); setCurrent('')
    if (current === word) { setWon(true); return }
    if (next.length >= 6) setLost(true)
  }
  const handleKey = (k) => {
    if (won || lost) return
    if (k === '⌫') { setCurrent(c => c.slice(0,-1)); return }
    if (current.length < COLS) setCurrent(c => c + k)
  }

  const keyColors = {}
  guesses.forEach(g => getWordleColors(g, word).forEach((c, i) => {
    const l = g[i]; const prev = keyColors[l]
    if (!prev || c === 'correct' || (c === 'present' && prev === 'absent')) keyColors[l] = c
  }))

  if (!word) return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'#111119', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
      <p style={{ color:'white' }}>Jogo não configurado</p>
      <button onClick={onClose} style={{ color:'#a78bfa', fontSize:14, background:'none', border:'none', cursor:'pointer' }}>Fechar</button>
    </div>
  )

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'#111119', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', alignItems:'center', background:'#111119' }}>
        <div style={{ textAlign:'center', padding:'24px 20px 16px' }}>
          <h2 style={{ fontSize:20, fontWeight:900, color:'white', lineHeight:1.3 }}>{dica}</h2>
          <p style={{ fontSize:13, color:'#6b7280', marginTop:4 }}>Descubra a palavra ({COLS} letras)</p>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {Array.from({ length:6 }, (_, row) => {
            const guess = guesses[row]
            const isCur = row === guesses.length && !won && !lost
            const letters = guess ? [...guess] : isCur ? [...current, ...Array(COLS - current.length).fill('')] : Array(COLS).fill('')
            const colors  = guess ? getWordleColors(guess, word) : null
            return (
              <div key={row} style={{ display:'flex', gap:8 }}>
                {letters.map((letter, col) => {
                  const c = colors?.[col]
                  return (
                    <div key={col} style={{ width:ts, height:ts, background:c ? WL_TILE[c] : 'transparent', border:`2px solid ${c ? WL_TILE[c] : letter ? '#818384' : '#3a3a3c'}`, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:Math.round(ts*0.44), fontWeight:900, color:'white' }}>
                      {letter}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
        <div style={{ height:16 }} />
      </div>
      <div style={{ background:'#111119', padding:'8px 0 14px', flexShrink:0 }}>
        {[WL_ROW1, WL_ROW2, WL_ROW3].map((row, ri) => (
          <div key={ri} style={{ display:'flex', justifyContent:'center', gap:6, marginBottom:ri<2?6:0 }}>
            {ri === 1 && (
              <button onClick={submit} style={{ background:current.length===COLS?'#538d4e':'#3a3a3c', minWidth:46, height:54, borderRadius:8, color:'white', fontSize:13, fontWeight:700, border:'none', cursor:'pointer', flexShrink:0 }}>OK</button>
            )}
            {row.map(k => (
              <button key={k} onClick={() => handleKey(k)} style={{ background:WL_KEY[keyColors[k]||'default'], minWidth:k==='⌫'?50:36, height:54, borderRadius:8, color:'white', fontSize:k==='⌫'?20:15, fontWeight:700, border:'none', cursor:'pointer', flexShrink:0 }}>
                {k}
              </button>
            ))}
          </div>
        ))}
      </div>
      {(won || lost) && (
        <div style={{ position:'absolute', insetInline:0, bottom:0, background:'#1a1a26', borderTop:'1px solid rgba(255,255,255,0.1)', borderRadius:'24px 24px 0 0', padding:'20px', display:'flex', flexDirection:'column', alignItems:'center', zIndex:10 }}>
          <p style={{ color:'white', fontWeight:900, fontSize:22 }}>{won ? 'Parabéns! 🎉' : 'Quase lá! 😅'}</p>
          <p style={{ color:'#9ca3af', fontSize:13, marginTop:4 }}>A palavra era</p>
          <div style={{ display:'flex', gap:6, marginTop:12 }}>
            {[...word].map((l, i) => <div key={i} style={{ width:44, height:44, background:won?WL_TILE.correct:WL_TILE.absent, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:900, color:'white' }}>{l}</div>)}
          </div>
          {msg && <p style={{ color:'#d1d5db', fontSize:13, marginTop:12, textAlign:'center', fontStyle:'italic' }}>"{msg}"</p>}
          <button onClick={onClose} style={{ marginTop:16, width:'100%', background:won?'#16a34a':'#7c3aed', color:'white', borderRadius:16, padding:'14px', fontSize:15, fontWeight:700, border:'none', cursor:'pointer' }}>Fechar ✓</button>
        </div>
      )}
      <button onClick={onClose} style={{ position:'absolute', top:16, right:16, background:'rgba(255,255,255,0.12)', color:'white', border:'none', borderRadius:20, padding:'8px 16px', fontSize:14, fontWeight:600, cursor:'pointer' }}>✕ Fechar</button>
    </div>
  )
}

function GenericGameView({ gameId, onClose }) {
  const def = GAME_DEFS.find(g => g.id === gameId)
  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:def?.bg||'#111', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
      <div style={{ marginBottom:8 }}><GameMockup id={gameId} accent={def?.accent||'#fff'} /></div>
      <p style={{ color:'white', fontWeight:900, fontSize:22 }}>{def?.label}</p>
      <p style={{ color:'rgba(255,255,255,0.5)', fontSize:14, textAlign:'center', padding:'0 32px', lineHeight:1.6 }}>
        Esta seção está disponível no Wrapped do seu presente.
      </p>
      <button onClick={onClose} style={{ marginTop:8, background:'rgba(255,255,255,0.15)', color:'white', border:'1px solid rgba(255,255,255,0.2)', borderRadius:20, padding:'10px 28px', fontSize:14, fontWeight:600, cursor:'pointer' }}>✕ Fechar</button>
    </div>
  )
}

function GameModal({ gameId, data, onClose }) {
  if (gameId === 'roulette') return <RoletaGameView data={data} onClose={onClose} />
  if (gameId === 'words')    return <WordleGameView data={data} onClose={onClose} />
  return <GenericGameView gameId={gameId} onClose={onClose} />
}

function ConquistasSection({ data, autoStart }) {
  const sections  = data.wrappedSections || []
  const available = GAME_DEFS.filter(g => sections.includes(g.id))
  const [openGame, setOpenGame]   = useState(null)
  const [seqIdx, setSeqIdx]       = useState(-1)
  const [waitNext, setWaitNext]   = useState(false)
  const prevAutoStart             = useRef(0)
  const [completed, setCompleted] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('cupid_cq') || '[]')) }
    catch { return new Set() }
  })

  useEffect(() => {
    if (autoStart > prevAutoStart.current && available.length > 0) {
      prevAutoStart.current = autoStart
      setSeqIdx(0)
      setWaitNext(false)
      setOpenGame(available[0].id)
    }
  }, [autoStart])

  const markDone = (id) => {
    setCompleted(prev => {
      const next = new Set(prev)
      next.add(id)
      try { localStorage.setItem('cupid_cq', JSON.stringify([...next])) } catch {}
      return next
    })
    setOpenGame(null)
    if (seqIdx >= 0) setWaitNext(true)
  }

  const goNext = () => {
    const next = seqIdx + 1
    if (next < available.length) {
      setSeqIdx(next)
      setWaitNext(false)
      setOpenGame(available[next].id)
    } else {
      setSeqIdx(-1)
      setWaitNext(false)
    }
  }

  const openDirect = (id) => {
    setSeqIdx(-1)
    setWaitNext(false)
    setOpenGame(id)
  }

  const completedCount = available.filter(g => completed.has(g.id)).length

  if (!available.length) return (
    <div className="mx-4 rounded-3xl p-5 shadow-xl mb-3 relative overflow-hidden"
      style={{ background: BG_CONQUEST, border:'1px solid rgba(139,92,246,0.25)' }}>
      <p className="text-white text-[14px] font-bold mb-2 relative z-10">Conquistas</p>
      <p style={{ color:'rgba(139,92,246,0.5)', fontSize:12, position:'relative', zIndex:1 }}>Nenhum jogo adicionado</p>
    </div>
  )

  return (
    <>
      {openGame && <GameModal gameId={openGame} data={data} onClose={() => markDone(openGame)} />}
      <div className="mx-4 rounded-3xl p-5 shadow-xl mb-3 relative overflow-hidden"
        style={{ background: BG_CONQUEST, border:'1px solid rgba(139,92,246,0.25)' }}>

        {/* corações subindo */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex:1 }}>
          {CONQUEST_HEARTS.map((h,i) => (
            <span key={i} className="heart-rise" style={{
              left: h.left, fontSize: h.size,
              animationDuration:`${h.dur}s`, animationDelay:`${h.delay}s`,
              color: i%2===0 ? 'rgba(167,139,250,0.55)' : 'rgba(192,132,252,0.45)',
            }}>♥</span>
          ))}
        </div>

        <div style={{ position:'relative', zIndex:2 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <div>
              <p style={{ color:'white', fontSize:14, fontWeight:700, margin:0 }}>Conquistas</p>
              <p style={{ color:'rgba(167,139,250,0.7)', fontSize:11, marginTop:2 }}>
                {completedCount} de {available.length} desbloqueadas
              </p>
            </div>
            <button onClick={() => openDirect(available[Math.floor(Math.random() * available.length)].id)}
              style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(139,92,246,0.2)', border:'1px solid rgba(139,92,246,0.35)', borderRadius:20, padding:'6px 12px', cursor:'pointer' }}>
              <span style={{ fontSize:11, fontWeight:700, color:'#c4b5fd' }}>SORTEAR</span>
              <svg width="16" height="16" viewBox="0 0 16 16" style={{ flexShrink:0 }}>
                <rect x="0.5" y="0.5" width="15" height="15" rx="3.5" fill="#c4b5fd" opacity="0.9"/>
                <circle cx="4.5" cy="4.5" r="1.4" fill="#1e1b4b"/>
                <circle cx="11.5" cy="4.5" r="1.4" fill="#1e1b4b"/>
                <circle cx="8"    cy="8"   r="1.4" fill="#1e1b4b"/>
                <circle cx="4.5" cy="11.5" r="1.4" fill="#1e1b4b"/>
                <circle cx="11.5" cy="11.5" r="1.4" fill="#1e1b4b"/>
              </svg>
            </button>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:`repeat(${Math.min(available.length, 3)}, 1fr)`, gap:8 }}>
            {available.map(g => {
              const done = completed.has(g.id)
              return (
                <button key={g.id} onClick={() => openDirect(g.id)}
                  style={{
                    display:'flex', flexDirection:'column', alignItems:'center', gap:6,
                    padding:'14px 4px', borderRadius:14, cursor:'pointer',
                    background: done ? g.bg : '#111128',
                    border: done ? `1px solid ${g.accent}40` : '1px solid rgba(255,255,255,0.07)',
                    filter: done ? 'none' : 'grayscale(1) brightness(0.45)',
                    transition:'filter 0.5s ease, background 0.5s ease',
                  }}>
                  <GameMockup id={g.id} accent={done ? g.accent : '#666'} />
                  <span style={{ fontSize:10, fontWeight:700, color: done ? g.accent : 'rgba(255,255,255,0.25)' }}>
                    {g.label}
                  </span>
                </button>
              )
            })}
          </div>

          {waitNext && (
            <div style={{ marginTop:14, display:'flex', justifyContent:'center' }}>
              {seqIdx + 1 < available.length ? (
                <button onClick={goNext} style={{
                  background:'rgba(139,92,246,0.85)', color:'white', border:'none',
                  borderRadius:20, padding:'10px 24px', fontSize:13, fontWeight:800,
                  cursor:'pointer', display:'flex', alignItems:'center', gap:6,
                  boxShadow:'0 4px 20px rgba(139,92,246,0.4)',
                }}>
                  Próxima conquista →
                </button>
              ) : (
                <p style={{ color:'#c4b5fd', fontSize:13, fontWeight:700, textAlign:'center' }}>
                  ✨ Todas as conquistas desbloqueadas!
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

/* ─── Hearts defs ───────────────────────────────────────────── */
const HEART_DEFS = [
  { left: '5%',  size: 22, dur: 8,  delay: -1  },
  { left: '16%', size: 14, dur: 11, delay: -5  },
  { left: '28%', size: 30, dur: 9,  delay: -3  },
  { left: '39%', size: 12, dur: 13, delay: -8  },
  { left: '51%', size: 26, dur: 7,  delay: -2  },
  { left: '62%', size: 16, dur: 12, delay: -6  },
  { left: '73%', size: 32, dur: 8,  delay: -4  },
  { left: '84%', size: 14, dur: 10, delay: -1  },
  { left: '22%', size: 20, dur: 15, delay: -10 },
  { left: '58%', size: 10, dur: 9,  delay: -7  },
  { left: '91%', size: 18, dur: 11, delay: -3  },
  { left: '44%', size: 28, dur: 14, delay: -9  },
]

/* ─── Main preview ──────────────────────────────────────────── */
export default function SitePreview({ onBack, externalData, overlay }) {
  const ctx = useQuiz()
  const data = externalData || ctx?.data || {}
  const [msgOpen, setMsgOpen] = useState(false)
  const [triggerSeq, setTriggerSeq] = useState(0)
  const ct = data.counterTexts || {}
  const coupleName = ct.coupleName || `${data.myName} e ${data.partnerName}`
  const year = data.relationshipStart ? new Date(data.relationshipStart + 'T00:00').getFullYear() : '2025'

  if (msgOpen) return (
    <MessageFull message={data.message} audio={data.audio} onClose={() => setMsgOpen(false)} />
  )

  const overlayStyle = overlay
    ? { position: 'fixed', inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column' }
    : {}

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative" style={{ background: BG_BLACK, ...overlayStyle }}>

      {/* ── header (always visible, black) ── */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ background: BG_BLACK, position: 'relative', zIndex: 20, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="w-8" />
        <div className="flex-1 text-center px-2">
          {data.title
            ? <p className="truncate" style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: 'white', letterSpacing: 0.2 }}>{data.title}</p>
            : <p className="text-white/30 text-[13px] font-medium">Pré-visualização</p>}
        </div>
        <button className="w-8 h-8 flex items-center justify-center text-gray-600">
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* ── scrollable body ── */}
      <div className="flex-1 overflow-y-auto">

        {/* ZONE 1 RED: photo + music player (with hearts) */}
        <div className="relative overflow-hidden" style={{ background: BG_RED }}>

          {/* hearts — clipped to this zone */}
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
            {HEART_DEFS.map((h, i) => (
              <span key={i} className="heart-rise" style={{
                left: h.left,
                fontSize: h.size,
                animationDuration: `${h.dur}s`,
                animationDelay: `${h.delay}s`,
                color: i % 3 === 0 ? 'rgba(239,68,68,0.7)' : i % 3 === 1 ? 'rgba(236,72,153,0.6)' : 'rgba(190,18,60,0.65)',
              }}>♥</span>
            ))}
          </div>

          <div style={{ position: 'relative', zIndex: 2 }}>
            <PhotoCarousel photos={data.photos} />
            <MusicPlayer music={data.music} />
          </div>

          {/* overlay que cobre os tons vermelhos e funde com o preto abaixo */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: 80,
            background: `linear-gradient(to bottom, transparent, ${BG_BLACK})`,
            zIndex: 3,
            pointerEvents: 'none',
          }} />
        </div>

        {/* sobre o casal (black) */}
        <div className="px-4 pb-5" style={{ background: BG_BLACK }}>
          <div className="rounded-3xl p-4" style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-rose-300/50 text-[10px] font-bold uppercase tracking-widest mb-3">
              {ct.sectionTitle || 'Sobre o casal'}
            </p>
            <div className="aspect-square rounded-2xl overflow-hidden mb-3 shadow-xl">
              <img src={data.coverPhotoUrl || '/default-couple.png'} alt="Foto do casal"
                className="w-full h-full object-cover" />
            </div>
            <p className="text-white text-[18px] font-black leading-tight">{coupleName || 'Seu nome e parceiro(a)'}</p>
            <p className="text-rose-300/60 text-[12px] mt-1 font-medium">{ct.sinceLabel || 'Juntos desde'} ⌛ {year}</p>
            <LiveCounter dark startDate={data.relationshipStart} startTime={data.relationshipTime} />
          </div>
        </div>

        {/* ZONE 2 BLACK: mensagem especial */}
        <div style={{ background: BG_BLACK }} className="pt-0 pb-6">
          <MessageCard message={data.message} audio={data.audio} onOpen={() => setMsgOpen(true)} />
        </div>

        {/* blur fade: black → red */}
        <div style={{ height: 56, background: `linear-gradient(to bottom, ${BG_BLACK}, #0a0208)` }} />

        {/* ZONE 3 RED: conquistas + retrospectiva */}

        <div style={{ background: BG_RED2 }} className="pb-10">
          <ConquistasSection data={data} autoStart={triggerSeq} />

          <div className="mx-4 rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-br from-violet-600 via-pink-500 to-orange-400 p-7 text-center">
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-2">Experiência completa</p>
              <p className="text-white text-[24px] font-black">Sua Retrospectiva</p>
              <p className="text-white/70 text-[13px] mt-1">Explore o seu tempo de casal</p>
              <button className="mt-5 bg-white/20 backdrop-blur-sm border border-white/30 text-white font-bold px-8 py-3 rounded-full text-[14px] active:scale-95 transition-all">
                <span onClick={() => setTriggerSeq(n => n + 1)} style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
                  Vamos lá <svg width="13" height="13" viewBox="0 0 14 14" style={{ display:'inline', verticalAlign:'middle' }}><polygon points="7,0.5 8.7,5 13.5,5 9.5,8 11,13 7,10 3,13 4.5,8 0.5,5 5.3,5" fill="white" opacity="0.92"/></svg>
                </span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {onBack && (
        <div className="shrink-0 flex justify-center px-4 pt-3"
          style={{
            background: 'rgba(3,3,8,0.95)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(8px)',
            paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
            position: 'relative',
            zIndex: 50,
          }}>
          <button onClick={onBack}
            className="bg-purple-600 text-white rounded-full px-8 py-2.5 font-bold text-[14px] active:scale-95 transition-all btn-pulse">
            ‹ Voltar a Editar
          </button>
        </div>
      )}
    </div>
  )
}
