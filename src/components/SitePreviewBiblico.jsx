import { useState, useEffect, useRef } from 'react'
import { useQuiz } from '../context/QuizContext'
import LiveCounter from './LiveCounter'
import { PhotoCarousel, GameMockup, GAME_DEFS } from './SitePreview'

/* ─── Tema celestial ────────────────────────────────────────── */
const SKY  = 'linear-gradient(180deg, #e0f2fe 0%, #bae6fd 45%, #f0f9ff 100%)'
const SKY2 = 'linear-gradient(180deg, #f0f9ff 0%, #ffffff 100%)'
const GOLD_SECTION = 'linear-gradient(135deg, #fefce8 0%, #fef3c7 50%, #fffbeb 100%)'
const BLUE = '#1d4ed8'
const BLUE_S = '#3b82f6'
const GOLD  = '#b45309'
const GOLD_L = '#f59e0b'
const DARK  = '#0f172a'

const VERSES = [
  { text: 'O amor é paciente, o amor é bondoso. Não inveja, não se vangloria, não se orgulha.', ref: '1 Coríntios 13:4' },
  { text: 'Eu te amo com amor eterno; por isso prolonguei a minha benignidade para contigo.', ref: 'Jeremias 31:3' },
  { text: 'Aquele que encontrou uma esposa excelente encontrou algo bom e recebeu favor do Senhor.', ref: 'Provérbios 18:22' },
  { text: 'E agora permanecem a fé, a esperança e o amor, estes três; mas o maior destes é o amor.', ref: '1 Coríntios 13:13' },
  { text: 'Deleita-te também no Senhor, e ele te concederá o que deseja o teu coração.', ref: 'Salmos 37:4' },
  { text: 'Nós amamos porque ele nos amou primeiro.', ref: '1 João 4:19' },
  { text: 'Sejam bondosos e compassivos uns para com os outros, perdoando-se mutuamente.', ref: 'Efésios 4:32' },
]

const ANGEL_PARTICLES = [
  { left: '6%',  size: 14, dur: 11, delay: -2  },
  { left: '20%', size: 10, dur: 14, delay: -6  },
  { left: '36%', size: 18, dur:  9, delay: -4  },
  { left: '52%', size: 12, dur: 13, delay: -1  },
  { left: '68%', size: 16, dur:  8, delay: -7  },
  { left: '84%', size: 10, dur: 12, delay: -3  },
]

/* ─── Music player simplificado ─────────────────────────────── */
function BiblicoMusicPlayer({ music }) {
  if (!music) return null
  return (
    <div style={{ margin: '0 16px 16px', background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', borderRadius: 18, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, border: '1px solid rgba(59,130,246,0.15)' }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#bfdbfe,#dbeafe)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill={BLUE_S}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: DARK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{music.title}</p>
        <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>{music.channel}</p>
      </div>
    </div>
  )
}

/* ─── Mensagem ───────────────────────────────────────────────── */
function BiblicoMessageCard({ message, onOpen }) {
  if (!message) return null
  const preview = message.length > 120 ? message.slice(0, 120) + '…' : message
  return (
    <div style={{ margin: '0 16px', background: 'rgba(255,255,255,0.9)', borderRadius: 20, padding: 20, border: `1px solid rgba(59,130,246,0.15)`, boxShadow: '0 4px 20px rgba(59,130,246,0.08)' }}>
      <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 800, color: BLUE_S, textTransform: 'uppercase', letterSpacing: 1.2 }}>Mensagem especial</p>
      <p style={{ margin: 0, fontSize: 14, color: '#334155', lineHeight: 1.65, fontStyle: 'italic' }}>"{preview}"</p>
      {message.length > 120 && (
        <button onClick={onOpen} style={{ marginTop: 12, background: `${BLUE_S}18`, border: `1px solid ${BLUE_S}30`, color: BLUE_S, borderRadius: 20, padding: '8px 18px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
          Ver mensagem completa →
        </button>
      )}
    </div>
  )
}

/* ─── Mensagem fullscreen ────────────────────────────────────── */
function BiblicoMessageFull({ message, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'linear-gradient(160deg,#1e3a8a 0%,#1d4ed8 50%,#2563eb 100%)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '48px 28px 24px' }}>
        <p style={{ textAlign: 'center', fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 24 }}>Mensagem especial ✉️</p>
        <p style={{ fontSize: 17, color: 'white', lineHeight: 1.8, fontStyle: 'italic', textAlign: 'center' }}>"{message}"</p>
      </div>
      <div style={{ padding: '12px 20px 28px', textAlign: 'right', background: 'rgba(0,0,0,0.15)' }}>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 99, padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          Voltar
        </button>
      </div>
    </div>
  )
}

/* ─── Conquistas celestial ───────────────────────────────────── */
const BG_CELESTIAL = 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #eff6ff 100%)'

function CelestiaisSection({ data, autoStart }) {
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
      setSeqIdx(0); setWaitNext(false); setOpenGame(available[0].id)
    }
  }, [autoStart])

  const markDone = (id) => {
    setCompleted(prev => {
      const next = new Set(prev); next.add(id)
      try { localStorage.setItem('cupid_cq', JSON.stringify([...next])) } catch {}
      return next
    })
    setOpenGame(null)
    if (seqIdx >= 0) setWaitNext(true)
  }

  const goNext = () => {
    const n = seqIdx + 1
    if (n < available.length) { setSeqIdx(n); setWaitNext(false); setOpenGame(available[n].id) }
    else { setSeqIdx(-1); setWaitNext(false) }
  }

  const completedCount = available.filter(g => completed.has(g.id)).length

  if (!available.length) return null

  return (
    <>
      {openGame && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: '#0d0d0d', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <p style={{ color: 'white', fontSize: 16, fontWeight: 800 }}>{GAME_DEFS.find(g => g.id === openGame)?.label}</p>
          <p style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', padding: '0 32px' }}>Jogue no site completo!</p>
          <button onClick={() => markDone(openGame)} style={{ background: BLUE_S, color: 'white', border: 'none', borderRadius: 20, padding: '12px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Fechar ✓</button>
        </div>
      )}
      <div style={{ margin: '0 16px 16px', borderRadius: 24, padding: 20, background: BG_CELESTIAL, border: '1px solid rgba(59,130,246,0.2)', boxShadow: '0 4px 20px rgba(59,130,246,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <p style={{ color: DARK, fontSize: 14, fontWeight: 800, margin: 0 }}>Jornadas</p>
            <p style={{ color: BLUE_S, fontSize: 11, marginTop: 2 }}>{completedCount} de {available.length} completadas</p>
          </div>
          <button onClick={() => { setSeqIdx(-1); setWaitNext(false); setOpenGame(available[Math.floor(Math.random() * available.length)].id) }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: `${BLUE_S}18`, border: `1px solid ${BLUE_S}30`, borderRadius: 20, padding: '6px 12px', cursor: 'pointer' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: BLUE_S }}>SORTEAR</span>
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(available.length, 3)}, 1fr)`, gap: 8 }}>
          {available.map(g => {
            const done = completed.has(g.id)
            return (
              <button key={g.id} onClick={() => { setSeqIdx(-1); setWaitNext(false); setOpenGame(g.id) }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '14px 4px', borderRadius: 14, cursor: 'pointer', background: done ? '#dbeafe' : '#f1f5f9', border: done ? `1px solid ${BLUE_S}40` : '1px solid #e2e8f0', filter: done ? 'none' : 'grayscale(0.7) brightness(0.85)', transition: 'all 0.4s ease' }}>
                <GameMockup id={g.id} accent={done ? BLUE_S : '#94a3b8'} />
                <span style={{ fontSize: 10, fontWeight: 700, color: done ? BLUE : '#94a3b8' }}>{g.label}</span>
              </button>
            )
          })}
        </div>
        {waitNext && (
          <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center' }}>
            {seqIdx + 1 < available.length ? (
              <button onClick={goNext} style={{ background: BLUE_S, color: 'white', border: 'none', borderRadius: 20, padding: '10px 24px', fontSize: 13, fontWeight: 800, cursor: 'pointer', boxShadow: `0 4px 16px ${BLUE_S}40` }}>
                Próxima jornada →
              </button>
            ) : (
              <p style={{ color: BLUE, fontSize: 13, fontWeight: 700 }}>✨ Todas as jornadas completas! Glória a Deus!</p>
            )}
          </div>
        )}
      </div>
    </>
  )
}

/* ─── Site principal ─────────────────────────────────────────── */
export default function SitePreviewBiblico({ onBack, externalData }) {
  const ctx  = useQuiz()
  const data = externalData || ctx?.data || {}
  const ct   = data.counterTexts || {}
  const [msgOpen, setMsgOpen]     = useState(false)
  const [triggerSeq, setTriggerSeq] = useState(0)
  const coupleName = ct.coupleName || `${data.myName || ''} e ${data.partnerName || ''}`
  const year = data.relationshipStart ? new Date(data.relationshipStart + 'T00:00').getFullYear() : '2025'

  const verse = VERSES[Math.abs((data.myName || '').charCodeAt(0) || 0) % VERSES.length]

  if (msgOpen) return <BiblicoMessageFull message={data.message} onClose={() => setMsgOpen(false)} />

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f0f9ff' }}>

      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid rgba(59,130,246,0.1)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative', zIndex: 20 }}>
        <img src="/anjinho.png" alt="" style={{ height: 28, marginRight: 8, opacity: 0.9 }} onError={e => e.target.style.display='none'} />
        {data.title
          ? <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: DARK, fontFamily: "'Playfair Display', serif" }}>{data.title}</p>
          : <p style={{ margin: 0, fontSize: 14, color: '#94a3b8' }}>Pré-visualização</p>}
      </div>

      {/* Corpo scrollável */}
      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* Zona 1 — Fotos + música */}
        <div style={{ background: SKY, position: 'relative', overflow: 'hidden' }}>
          {/* partículas douradas */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
            {ANGEL_PARTICLES.map((p, i) => (
              <span key={i} className="heart-rise" style={{ left: p.left, fontSize: p.size, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s`, color: i % 2 === 0 ? 'rgba(251,191,36,0.6)' : 'rgba(245,158,11,0.5)' }}>✦</span>
            ))}
          </div>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <PhotoCarousel photos={data.photos} />
            <div style={{ height: 16 }} />
            <BiblicoMusicPlayer music={data.music} />
            <div style={{ height: 16 }} />
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 56, background: 'linear-gradient(to bottom, transparent, #f0f9ff)', zIndex: 3, pointerEvents: 'none' }} />
        </div>

        {/* Zona 2 — Sobre o casal */}
        <div style={{ background: '#ffffff', padding: '20px 16px' }}>
          <div style={{ borderRadius: 20, padding: 18, background: '#f8fafc', border: '1px solid rgba(59,130,246,0.12)' }}>
            <p style={{ margin: '0 0 10px', fontSize: 10, fontWeight: 800, color: BLUE_S, textTransform: 'uppercase', letterSpacing: 1.2 }}>{ct.sectionTitle || 'Sobre o casal'}</p>
            <p style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 900, color: DARK, lineHeight: 1.2 }}>{coupleName}</p>
            <p style={{ margin: '0 0 12px', fontSize: 12, color: BLUE_S, fontWeight: 600 }}>{ct.sinceLabel || 'Unidos desde'} ⌛ {year}</p>
            <LiveCounter startDate={data.relationshipStart} startTime={data.relationshipTime} />
          </div>
        </div>

        {/* Zona 3 — Versículo */}
        <div style={{ padding: '0 16px 20px', background: '#ffffff' }}>
          <div style={{ borderRadius: 20, padding: '20px 20px', background: GOLD_SECTION, border: `1px solid ${GOLD_L}40`, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 10, right: 14, fontSize: 36, opacity: 0.12 }}>✝</div>
            <p style={{ margin: '0 0 10px', fontSize: 10, fontWeight: 800, color: GOLD, textTransform: 'uppercase', letterSpacing: 1.2 }}>Palavra do Senhor</p>
            <p style={{ margin: '0 0 10px', fontSize: 15, color: '#78350f', lineHeight: 1.7, fontStyle: 'italic', fontWeight: 500 }}>"{verse.text}"</p>
            <p style={{ margin: 0, fontSize: 12, color: GOLD, fontWeight: 800 }}>— {verse.ref}</p>
          </div>
        </div>

        {/* Zona 4 — Mensagem */}
        <div style={{ background: SKY2, padding: '0 0 20px' }}>
          <div style={{ textAlign: 'center', padding: '20px 0 14px' }}>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 800, color: BLUE_S, textTransform: 'uppercase', letterSpacing: 1.2 }}>Para você</p>
          </div>
          <BiblicoMessageCard message={data.message} onOpen={() => setMsgOpen(true)} />
        </div>

        {/* Zona 5 — Jornadas / Conquistas */}
        <div style={{ background: '#ffffff', padding: '20px 0 0' }}>
          <div style={{ textAlign: 'center', paddingBottom: 14 }}>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 800, color: BLUE_S, textTransform: 'uppercase', letterSpacing: 1.2 }}>Jornadas do casal</p>
          </div>
          <CelestiaisSection data={data} autoStart={triggerSeq} />
        </div>

        {/* Zona 6 — Retrospectiva */}
        <div style={{ padding: '8px 16px 40px', background: '#ffffff' }}>
          <div style={{ borderRadius: 24, overflow: 'hidden', boxShadow: '0 8px 32px rgba(29,78,216,0.15)' }}>
            <div style={{ background: 'linear-gradient(135deg,#1d4ed8 0%,#3b82f6 50%,#60a5fa 100%)', padding: '28px 24px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: 1.5 }}>Experiência completa</p>
              <p style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 900, color: 'white' }}>Sua Retrospectiva</p>
              <p style={{ margin: '0 0 18px', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Explore a jornada do casal</p>
              <button onClick={() => setTriggerSeq(n => n + 1)}
                style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.35)', color: 'white', fontWeight: 800, fontSize: 14, borderRadius: 99, padding: '12px 32px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                Vamos lá <svg width="13" height="13" viewBox="0 0 14 14" style={{ display: 'inline', verticalAlign: 'middle' }}><polygon points="7,0.5 8.7,5 13.5,5 9.5,8 11,13 7,10 3,13 4.5,8 0.5,5 5.3,5" fill="white" opacity="0.9"/></svg>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Botão Voltar */}
      {onBack && (
        <div style={{ flexShrink: 0, padding: '12px 16px 24px', background: 'rgba(240,249,255,0.95)', borderTop: '1px solid rgba(59,130,246,0.1)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center' }}>
          <button onClick={onBack} style={{ background: BLUE_S, color: 'white', borderRadius: 99, padding: '10px 32px', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>
            ‹ Voltar a Editar
          </button>
        </div>
      )}
    </div>
  )
}
