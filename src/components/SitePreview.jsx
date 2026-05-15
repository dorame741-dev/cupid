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
      <div style={{ position: 'absolute', opacity: 0, width: 1, height: 1, overflow: 'hidden', pointerEvents: 'none' }}>
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
          {!ready
            ? <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
            : <span className="text-gray-900 text-2xl ml-[2px]">{playing ? '⏸' : '▶'}</span>}
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
          <div className="mx-4 rounded-3xl p-5 shadow-xl mb-3"
            style={{ background: 'rgba(10,2,8,0.5)', border: '1px solid rgba(190,18,60,0.2)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-white text-[14px] font-bold">Conquistas</p>
              <span className="text-rose-400/60 text-[12px] font-medium">8/30</span>
            </div>
            <div className="flex gap-2">
              {['∞', '◎', '☆', '♣'].map((icon, i) => (
                <div key={i} className="flex-1 aspect-square rounded-2xl bg-rose-950/60 border border-rose-800/30 flex items-center justify-center text-xl text-rose-300/50">{icon}</div>
              ))}
            </div>
          </div>

          <div className="mx-4 rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-br from-violet-600 via-pink-500 to-orange-400 p-7 text-center">
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-2">Experiência completa</p>
              <p className="text-white text-[24px] font-black">Sua Retrospectiva</p>
              <p className="text-white/70 text-[13px] mt-1">Explore o seu tempo de casal</p>
              <button className="mt-5 bg-white/20 backdrop-blur-sm border border-white/30 text-white font-bold px-8 py-3 rounded-full text-[14px] active:scale-95 transition-all">
                Vamos lá ✨
              </button>
            </div>
          </div>
        </div>

      </div>

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
    </div>
  )
}
