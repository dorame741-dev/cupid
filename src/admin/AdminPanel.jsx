import { useState, useEffect, useMemo } from 'react'
import {
  LayoutDashboard, Users, Settings, LogOut, TrendingUp,
  DollarSign, ShoppingCart, Percent, RefreshCw, Copy, Check,
  ChevronRight, Calendar, Star, Camera, Gamepad2, Globe, Gift,
  MessageCircle, ExternalLink, Pencil, Search,
  Tv2, Link2, Package, Sparkles, BookOpen,
} from 'lucide-react'
import { getAllSites, getAppConfig, setAppConfig, createFreeLink, getFunnelEvents, getSite, updateSiteData } from '../lib/supabase'
import { QR_TEMPLATES, SiteQRCard } from '../components/QRCard'

/* ── palette ───────────────────────────────────────────────────── */
const C = {
  bg:      '#07070f',
  side:    '#0b0b16',
  surface: '#10101e',
  card:    '#131320',
  border:  '#1c1c2e',
  borderHi:'#2a2a42',
  text:    '#e8eaf0',
  soft:    '#94a3b8',
  muted:   '#475569',
  purple:  '#7c3aed',
  purpleL: '#a78bfa',
  purpleLt:'#c4b5fd',
  green:   '#10b981',
  greenL:  '#34d399',
  amber:   '#f59e0b',
  blue:    '#3b82f6',
  red:     '#ef4444',
  pink:    '#ec4899',
  wa:      '#25d366',
  tt:      '#ff0050',
}
const SIDEBAR = 228

/* ── helpers ───────────────────────────────────────────────────── */
const TZ = 'America/Sao_Paulo'

function fmt(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('pt-BR', { timeZone: TZ, day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit' })
}
function fmtShort(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR', { timeZone: TZ, day:'2-digit', month:'2-digit' })
}
function maskPhone(p) {
  if (!p || p.length < 10) return p
  return `(${p.slice(0,2)}) ${p.slice(2,7)}-${p.slice(7)}`
}
function brl(v) { return `R$ ${Number(v).toFixed(2).replace('.', ',')}` }
function initials(name) {
  if (!name) return '?'
  return name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()
}

function getPeriod(period, from, to) {
  const now = new Date()
  if (period === 'today')  { const s = new Date(now); s.setHours(0,0,0,0); return { from: s, to: now } }
  if (period === 'week')   { const s = new Date(now); s.setDate(now.getDate()-6); s.setHours(0,0,0,0); return { from: s, to: now } }
  if (period === 'month')  { const s = new Date(now); s.setDate(now.getDate()-29); s.setHours(0,0,0,0); return { from: s, to: now } }
  if (period === 'custom') { return { from: from ? new Date(from+'T00:00:00') : new Date(0), to: to ? new Date(to+'T23:59:59') : now } }
  return { from: new Date(0), to: now }
}

function filterSites(sites, period, dateKey, from, to) {
  if (period === 'all') return sites
  const { from: f, to: t } = getPeriod(period, from, to)
  return sites.filter(s => { const d = new Date(s[dateKey]); return d >= f && d <= t })
}

/* ── chart components ───────────────────────────────────────────── */
function BarChart({ data, color = C.purple, height = 100, secondary, labelEvery = 1 }) {
  if (!data.length) return (
    <div style={{ height, display:'flex', alignItems:'center', justifyContent:'center', color: C.muted, fontSize: 12 }}>
      Sem dados
    </div>
  )
  const maxVal = Math.max(...data.map(d => Math.max(d.value, d.value2 || 0)), 1)
  const barH = height - 28
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap: data.length > 12 ? 1 : 3, height, width:'100%', overflow:'hidden' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3, height:'100%', justifyContent:'flex-end', minWidth:0 }}>
          <div style={{ width:'100%', display:'flex', alignItems:'flex-end', gap: 1, justifyContent:'center', height: barH }}>
            <div style={{ flex:1, borderRadius:'2px 2px 0 0', overflow:'hidden', height:`${Math.max((d.value/maxVal)*barH, d.value?2:0)}px`, background: color, transition:'height 0.4s', opacity:0.85 }} />
            {secondary && d.value2 !== undefined && (
              <div style={{ flex:1, borderRadius:'2px 2px 0 0', overflow:'hidden', height:`${Math.max((d.value2/maxVal)*barH, d.value2?2:0)}px`, background: secondary, transition:'height 0.4s', opacity:0.85 }} />
            )}
          </div>
          <span style={{ fontSize: data.length > 12 ? 8 : 9, color: (labelEvery > 1 && i % labelEvery !== 0) ? 'transparent' : C.muted, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', width:'100%', textAlign:'center' }}>{d.label}</span>
        </div>
      ))}
    </div>
  )
}

function HBar({ label, value, max, color, sub }) {
  const pct = max ? Math.round((value/max)*100) : 0
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:13, color: C.soft }}>{label}</span>
        <span style={{ fontSize:13, fontWeight:800, color }}>
          {value}{sub && <span style={{ fontSize:11, color:C.muted, fontWeight:400 }}> {sub}</span>}
        </span>
      </div>
      <div style={{ height:6, background:`${color}18`, borderRadius:3, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, background: color, borderRadius:3, transition:'width 0.6s cubic-bezier(.4,0,.2,1)' }} />
      </div>
    </div>
  )
}

/* ── KPI card ───────────────────────────────────────────────────── */
function KPI({ label, value, sub, color, Icon }) {
  return (
    <div style={{
      background: C.card, borderRadius:18, padding:'22px 24px',
      border:`1px solid ${C.border}`, borderTop:`2px solid ${color}`,
      display:'flex', flexDirection:'column', gap:12, flex:1,
      transition:'transform 0.15s, box-shadow 0.15s', cursor:'default',
    }}
      onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 8px 24px ${color}18` }}
      onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none' }}
    >
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:11, fontWeight:700, color: C.muted, textTransform:'uppercase', letterSpacing:1.2 }}>{label}</span>
        <div style={{ width:36, height:36, borderRadius:10, background:`${color}15`, display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid ${color}25` }}>
          <Icon size={16} color={color} />
        </div>
      </div>
      <span style={{ fontSize:32, fontWeight:900, color, lineHeight:1, letterSpacing:-1 }}>{value}</span>
      {sub && <span style={{ fontSize:12, color: C.muted, lineHeight:1.4 }}>{sub}</span>}
    </div>
  )
}

/* ── Sidebar ────────────────────────────────────────────────────── */
const NAV = [
  { id:'dashboard', label:'Dashboard',     Icon: LayoutDashboard },
  { id:'clients',   label:'Clientes',      Icon: Users },
  { id:'settings',  label:'Configurações', Icon: Settings },
]

function Sidebar({ active, setActive, onLogout, totalPaid, totalSites }) {
  return (
    <aside style={{ position:'fixed', left:0, top:0, bottom:0, width: SIDEBAR, background: C.side, borderRight:`1px solid ${C.border}`, display:'flex', flexDirection:'column', zIndex:100 }}>
      <div style={{ padding:'22px 20px 18px', borderBottom:`1px solid ${C.border}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:12, background:`${C.purple}20`, border:`1px solid ${C.purple}30`, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
            <img src="/cupido.png" alt="" style={{ width:32, height:32, objectFit:'contain' }} onError={e=>{ e.currentTarget.style.display='none'; e.currentTarget.parentElement.textContent='💘' }} />
          </div>
          <div>
            <p style={{ margin:0, fontSize:15, fontWeight:900, color: C.text, letterSpacing:-0.3 }}>Cupid</p>
            <p style={{ margin:0, fontSize:10, color: C.muted, fontWeight:500 }}>Admin Panel</p>
          </div>
        </div>
      </div>

      <div style={{ padding:'14px 16px 10px', borderBottom:`1px solid ${C.border}`, display:'flex', gap:8 }}>
        <div style={{ flex:1, background:`${C.purple}12`, borderRadius:10, padding:'8px 10px', textAlign:'center', border:`1px solid ${C.purple}20` }}>
          <p style={{ margin:0, fontSize:17, fontWeight:900, color:C.purpleL }}>{totalSites}</p>
          <p style={{ margin:0, fontSize:9, color:C.muted, fontWeight:600, textTransform:'uppercase', letterSpacing:0.8 }}>total</p>
        </div>
        <div style={{ flex:1, background:`${C.green}12`, borderRadius:10, padding:'8px 10px', textAlign:'center', border:`1px solid ${C.green}20` }}>
          <p style={{ margin:0, fontSize:17, fontWeight:900, color:C.green }}>{totalPaid}</p>
          <p style={{ margin:0, fontSize:9, color:C.muted, fontWeight:600, textTransform:'uppercase', letterSpacing:0.8 }}>pagos</p>
        </div>
      </div>

      <nav style={{ flex:1, padding:'12px 10px', display:'flex', flexDirection:'column', gap:3 }}>
        {NAV.map(({ id, label, Icon }) => {
          const on = active === id
          return (
            <button key={id} onClick={() => setActive(id)} style={{
              display:'flex', alignItems:'center', gap:10, padding:'11px 14px', borderRadius:12,
              cursor:'pointer', border:'none', textAlign:'left', width:'100%',
              background: on ? `${C.purple}18` : 'transparent',
              color: on ? C.purpleLt : C.soft, fontWeight: on ? 700 : 500, fontSize:14,
              transition:'all 0.15s', position:'relative',
            }}>
              {on && <span style={{ position:'absolute', left:0, top:'50%', transform:'translateY(-50%)', width:3, height:20, background:C.purple, borderRadius:'0 3px 3px 0' }} />}
              <Icon size={16} />{label}
              {on && <ChevronRight size={13} style={{ marginLeft:'auto', opacity:0.6 }} />}
            </button>
          )
        })}
      </nav>

      <div style={{ padding:'12px 10px', borderTop:`1px solid ${C.border}` }}>
        <button onClick={onLogout} style={{
          display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:12,
          cursor:'pointer', border:`1px solid ${C.red}20`, width:'100%',
          background:`${C.red}08`, color: C.red, fontWeight:600, fontSize:13, transition:'all 0.15s',
        }}
          onMouseEnter={e=>e.currentTarget.style.background=`${C.red}18`}
          onMouseLeave={e=>e.currentTarget.style.background=`${C.red}08`}
        >
          <LogOut size={15} /> Sair da conta
        </button>
      </div>
    </aside>
  )
}

/* ── Period selector ────────────────────────────────────────────── */
function PeriodBar({ period, setPeriod, customFrom, setCustomFrom, customTo, setCustomTo }) {
  const opts = [['today','Hoje'],['week','7 dias'],['month','30 dias'],['all','Tudo'],['custom','Personalizado']]
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
      {opts.map(([key, label]) => (
        <button key={key} onClick={() => setPeriod(key)} style={{
          padding:'7px 16px', borderRadius:20, cursor:'pointer', fontSize:12, fontWeight:700, outline:'none',
          background: period===key ? C.purple : 'transparent',
          color: period===key ? 'white' : C.soft,
          border: period===key ? `1px solid ${C.purple}` : `1px solid ${C.border}`,
          transition:'all 0.15s',
        }}>{label}</button>
      ))}
      {period === 'custom' && (
        <>
          <input type="date" value={customFrom} onChange={e=>setCustomFrom(e.target.value)}
            style={{ background:C.surface, border:`1px solid ${C.border}`, color:C.text, borderRadius:10, padding:'6px 12px', fontSize:12, outline:'none' }} />
          <span style={{ color:C.muted, fontSize:12 }}>até</span>
          <input type="date" value={customTo} onChange={e=>setCustomTo(e.target.value)}
            style={{ background:C.surface, border:`1px solid ${C.border}`, color:C.text, borderRadius:10, padding:'6px 12px', fontSize:12, outline:'none' }} />
        </>
      )}
    </div>
  )
}

/* ── Dashboard ──────────────────────────────────────────────────── */
const STEP_NAMES = {
  'intro-names':'Nomes', 'intro-date':'Data', 'step1-title':'Título',
  'step2-music':'Música', 'step3-photos':'Fotos', 'step4-message':'Mensagem',
  'step5-cover':'Capa', 'step6-counter':'Contador',
  'upsell':'Upsell', 'step-wrapped':'Wrapped', 'step-roleta':'Roleta',
  'step-mapa':'Mapa', 'step-galeria':'Galeria', 'step-jogo':'Jogo',
  'step-timeline':'Timeline', 'step-estrelas':'Estrelas',
  'step-pagamento':'Pagamento', 'final-preview':'Prévia',
}
const STEP_ORDER = Object.keys(STEP_NAMES)

const SECTION_META = {
  timeline: { label:'Linha do Tempo',    Icon: Calendar, color:'#3b82f6' },
  stars:    { label:'Mapa das Estrelas', Icon: Star,     color:'#f59e0b' },
  gallery:  { label:'Galeria',           Icon: Camera,   color:'#10b981' },
  words:    { label:'Jogo de Palavras',  Icon: Gamepad2, color:'#a78bfa' },
  map:      { label:'Jornada no Mapa',   Icon: Globe,    color:'#06b6d4' },
  roulette: { label:'Roleta Surpresa',   Icon: Gift,     color:'#ef4444' },
}

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function DashboardView({ sites, price, period, setPeriod, customFrom, setCustomFrom, customTo, setCustomTo, funnelEvents }) {
  const { from, to } = getPeriod(period, customFrom, customTo)

  const inPeriod     = useMemo(() => filterSites(sites, period, 'created_at', customFrom, customTo), [sites, period, customFrom, customTo])
  const paidInPeriod = useMemo(() => filterSites(sites.filter(s=>s.paid), period, 'paid_at', customFrom, customTo), [sites, period, customFrom, customTo])

  const revenue  = paidInPeriod.length * price
  const convRate = inPeriod.length ? Math.round((paidInPeriod.length/inPeriod.length)*100) : 0

  const dailyData = useMemo(() => {
    const days = period === 'today' ? 1 : period === 'week' ? 7 : period === 'month' ? 30 : Math.min(30, Math.ceil((to-from)/(1000*60*60*24))+1)
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(to); d.setDate(d.getDate() - (days-1-i)); d.setHours(0,0,0,0)
      const end = new Date(d); end.setHours(23,59,59,999)
      const reg  = sites.filter(s => { const t = new Date(s.created_at); return t>=d && t<=end }).length
      const paid = sites.filter(s => s.paid && s.paid_at && (()=>{ const t=new Date(s.paid_at); return t>=d && t<=end })()).length
      return { label: fmtShort(d), value: reg, value2: paid }
    })
  }, [sites, period, from, to])

  const funnelInPeriod = useMemo(() => {
    if (!funnelEvents.length) return {}
    return funnelEvents
      .filter(e => { const d=new Date(e.created_at); return d>=from && d<=to })
      .reduce((acc, e) => { acc[e.step]=(acc[e.step]||0)+1; return acc }, {})
  }, [funnelEvents, from, to])

  const maxStep     = Math.max(...Object.values(funnelInPeriod), 1)
  const funnelSteps = STEP_ORDER.filter(s => funnelInPeriod[s])

  const sectionCounts = useMemo(() => {
    const counts = {}
    sites.forEach(s => { (s.quiz_data?.wrappedSections||[]).forEach(sec => { counts[sec]=(counts[sec]||0)+1 }) })
    return counts
  }, [sites])
  const maxSec = Math.max(...Object.values(sectionCounts), 1)

  const recent = useMemo(() => sites.filter(s=>s.paid).slice(0,5), [sites])

  // Peak hours — all 24, 1h resolution, labels every 6h
  const hourCounts = useMemo(() => {
    const h = Array(24).fill(0)
    paidInPeriod.forEach(s => {
      if (s.paid_at) {
        // Convert to Brazil timezone hour
        const brHour = new Date(new Date(s.paid_at).toLocaleString('en-US', { timeZone: TZ })).getHours()
        h[brHour]++
      }
    })
    return h
  }, [paidInPeriod])

  const peakHours = hourCounts.map((v, i) => ({ label: `${i}h`, value: v }))

  // Days of week
  const dayCounts = useMemo(() => {
    const d = Array(7).fill(0)
    paidInPeriod.forEach(s => {
      if (s.paid_at) {
        const brDay = new Date(new Date(s.paid_at).toLocaleString('en-US', { timeZone: TZ })).getDay()
        d[brDay]++
      }
    })
    return DAY_NAMES.map((name, i) => ({ label: name, value: d[i] }))
  }, [paidInPeriod])

  const card      = { background:C.card, borderRadius:18, border:`1px solid ${C.border}`, padding:24 }
  const cardTitle = { margin:'0 0 18px', fontSize:14, fontWeight:800, color:C.text, letterSpacing:-0.2 }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
      <PeriodBar period={period} setPeriod={setPeriod} customFrom={customFrom} setCustomFrom={setCustomFrom} customTo={customTo} setCustomTo={setCustomTo} />

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
        <KPI label="Receita" value={brl(revenue)} sub={`${paidInPeriod.length} venda${paidInPeriod.length!==1?'s':''} no período`} color={C.green} Icon={DollarSign} />
        <KPI label="PIX gerados" value={inPeriod.length} sub="chegaram ao checkout" color={C.purple} Icon={ShoppingCart} />
        <KPI label="Conversão" value={`${convRate}%`} sub={`${paidInPeriod.length} de ${inPeriod.length} pagaram`} color={C.blue} Icon={Percent} />
        <KPI label="Ticket médio" value={paidInPeriod.length ? brl(revenue/paidInPeriod.length) : '—'} sub="por venda" color={C.amber} Icon={TrendingUp} />
      </div>

      {/* charts row */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16 }}>
        <div style={card}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
            <p style={{ margin:0, fontSize:14, fontWeight:800, color:C.text }}>Vendas ao longo do tempo</p>
            <div style={{ display:'flex', gap:14, alignItems:'center' }}>
              <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:C.soft }}><span style={{ width:10,height:10,borderRadius:3,background:C.purple,display:'inline-block' }} /> Registros</span>
              <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:C.soft }}><span style={{ width:10,height:10,borderRadius:3,background:C.green,display:'inline-block' }} /> Pagamentos</span>
            </div>
          </div>
          <BarChart data={dailyData} color={C.purple} secondary={C.green} height={130} />
        </div>

        <div style={card}>
          <p style={cardTitle}>Funil de Conversão</p>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <HBar label="Gerou PIX" value={inPeriod.length} max={Math.max(inPeriod.length,1)} color={C.purple} sub="clientes" />
            <HBar label="Pagou" value={paidInPeriod.length} max={Math.max(inPeriod.length,1)} color={C.green} sub={`(${convRate}%)`} />
            <HBar label="Desistiu" value={Math.max(inPeriod.length-paidInPeriod.length,0)} max={Math.max(inPeriod.length,1)} color={C.red} sub={`(${100-convRate}%)`} />
          </div>
          <div style={{ marginTop:20, padding:'14px 16px', background:`${C.green}0e`, borderRadius:12, border:`1px solid ${C.green}22`, textAlign:'center' }}>
            <p style={{ margin:0, fontSize:26, fontWeight:900, color:C.green, letterSpacing:-1 }}>{convRate}%</p>
            <p style={{ margin:0, fontSize:11, color:C.muted, marginTop:2 }}>taxa de conversão</p>
          </div>
        </div>
      </div>

      {/* time analysis row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        {/* peak hours — 1h resolution */}
        <div style={card}>
          <p style={cardTitle}>Horário de pico — vendas por hora (horário de Brasília)</p>
          <BarChart data={peakHours} color={C.amber} height={130} labelEvery={6} />
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
            {[0,6,12,18,23].map(h => (
              <span key={h} style={{ fontSize:9, color:C.muted }}>{h}h</span>
            ))}
          </div>
          {(() => {
            const peak = hourCounts.indexOf(Math.max(...hourCounts))
            return Math.max(...hourCounts) > 0
              ? <p style={{ margin:'10px 0 0', fontSize:12, color:C.muted, textAlign:'center' }}>Pico: <strong style={{color:C.amber}}>{peak}h–{peak+1}h</strong> ({hourCounts[peak]} venda{hourCounts[peak]!==1?'s':''})</p>
              : <p style={{ margin:'10px 0 0', fontSize:12, color:C.muted, textAlign:'center' }}>Sem dados no período</p>
          })()}
        </div>

        {/* days of week */}
        <div style={card}>
          <p style={cardTitle}>Vendas por dia da semana</p>
          <BarChart data={dayCounts} color={C.blue} height={130} />
          {(() => {
            const maxDay = Math.max(...dayCounts.map(d=>d.value))
            const bestIdx = dayCounts.findIndex(d=>d.value===maxDay)
            return maxDay > 0
              ? <p style={{ margin:'10px 0 0', fontSize:12, color:C.muted, textAlign:'center' }}>Melhor dia: <strong style={{color:C.blue}}>{DAY_NAMES[bestIdx]}</strong> ({maxDay} venda{maxDay!==1?'s':''})</p>
              : <p style={{ margin:'10px 0 0', fontSize:12, color:C.muted, textAlign:'center' }}>Sem dados no período</p>
          })()}
        </div>
      </div>

      {/* bottom row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        {/* quiz funnel */}
        <div style={card}>
          <p style={cardTitle}>Funil do Quiz (onde param)</p>
          {funnelSteps.length === 0 ? (
            <p style={{ color:C.muted, fontSize:13, textAlign:'center', padding:'20px 0', lineHeight:1.6 }}>Aguardando dados de visitas…</p>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
              {funnelSteps.map((step, i) => {
                const count = funnelInPeriod[step] || 0
                const prev  = i > 0 ? (funnelInPeriod[funnelSteps[i-1]] || 1) : count
                const drop  = i > 0 ? Math.round((1 - count/prev)*100) : 0
                const col   = drop>30 ? C.red : drop>15 ? C.amber : C.green
                return (
                  <div key={step} style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:10, color:C.muted, width:14, textAlign:'center' }}>{i+1}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                        <span style={{ fontSize:11, color:C.soft }}>{STEP_NAMES[step]||step}</span>
                        <span style={{ fontSize:11, fontWeight:800, color: col }}>
                          {count}{drop>0 && <span style={{fontSize:9,color:C.muted,fontWeight:400}}> -{drop}%</span>}
                        </span>
                      </div>
                      <div style={{ height:4, background:`${C.purple}12`, borderRadius:2 }}>
                        <div style={{ height:'100%', width:`${Math.round((count/maxStep)*100)}%`, background:col, borderRadius:2, transition:'width 0.5s' }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* sections */}
        <div style={card}>
          <p style={cardTitle}>Seções mais escolhidas</p>
          <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
            {Object.entries(SECTION_META).map(([id, meta]) => {
              const { Icon, label, color } = meta
              const count = sectionCounts[id] || 0
              return (
                <div key={id} style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:30, height:30, borderRadius:8, background:`${color}15`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, border:`1px solid ${color}20` }}>
                    <Icon size={13} color={color} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ fontSize:12, color:C.soft }}>{label}</span>
                      <span style={{ fontSize:12, fontWeight:800, color }}>{count}</span>
                    </div>
                    <div style={{ height:4, background:`${color}12`, borderRadius:2 }}>
                      <div style={{ height:'100%', width:`${maxSec?Math.round((count/maxSec)*100):0}%`, background:color, borderRadius:2, transition:'width 0.5s' }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* recent */}
      <div style={card}>
        <p style={cardTitle}>Últimas vendas</p>
        {recent.length === 0 ? (
          <p style={{ color:C.muted, fontSize:13, textAlign:'center', padding:'20px 0' }}>Nenhuma venda ainda</p>
        ) : (
          <div style={{ display:'flex', flexDirection:'column' }}>
            {recent.map((site, i) => {
              const qd     = site.quiz_data || {}
              const couple = [qd.myName, qd.partnerName].filter(Boolean).join(' e ') || '—'
              const ini    = initials(qd.myName)
              return (
                <div key={site.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 0', borderBottom: i<recent.length-1 ? `1px solid ${C.border}` : 'none' }}>
                  <div style={{ width:38, height:38, borderRadius:12, background:`linear-gradient(135deg, ${C.purple}50, ${C.pink}50)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ fontSize:13, fontWeight:900, color:'white' }}>{ini}</span>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ margin:0, fontSize:13, fontWeight:700, color:C.text }}>{couple}</p>
                    <p style={{ margin:0, fontSize:11, color:C.muted }}>{maskPhone(site.phone)}</p>
                  </div>
                  <p style={{ margin:0, fontSize:14, fontWeight:800, color:C.green }}>{brl(price)}</p>
                  <p style={{ margin:0, fontSize:11, color:C.muted }}>{fmt(site.paid_at)}</p>
                  <a href={`/${site.phone}`} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize:11, color:C.purpleL, textDecoration:'none', fontWeight:700, background:`${C.purple}12`, border:`1px solid ${C.purple}25`, borderRadius:8, padding:'5px 12px' }}>
                    Ver ↗
                  </a>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Copy button ────────────────────────────────────────────────── */
function CopyBtn({ text, label = 'Copiar', icon: Icon = Copy, color = C.purpleL, bg = C.purple, small }) {
  const [copied, setCopied] = useState(false)
  const doCopy = (e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }
  const p = small ? '4px 8px' : '6px 12px'
  return (
    <button onClick={doCopy} title={label} style={{
      background: copied ? `${C.green}18` : `${bg}12`,
      border: `1px solid ${copied ? C.green : bg}25`,
      color: copied ? C.green : color,
      borderRadius:8, padding:p, cursor:'pointer', fontSize:11, fontWeight:700,
      display:'flex', alignItems:'center', gap:4, whiteSpace:'nowrap', transition:'all 0.15s', flexShrink:0,
    }}>
      {copied ? <Check size={12} /> : <Icon size={12} />}
      {copied ? 'Copiado!' : label}
    </button>
  )
}

/* ── QR Edit modal ──────────────────────────────────────────────── */
function QREditModal({ site, onClose, onSaved }) {
  const current = site.quiz_data?.qrTemplate ?? 0
  const [selected, setSelected] = useState(current)
  const [saving, setSaving] = useState(false)
  const siteUrl = `${window.location.origin}/${site.phone}`

  const save = async () => {
    setSaving(true)
    try {
      await updateSiteData(site.phone, { ...site.quiz_data, qrTemplate: selected })
      onSaved(selected)
      onClose()
    } catch {
      setSaving(false)
    }
  }

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }} style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:400,
      display:'flex', alignItems:'center', justifyContent:'center', padding:16,
    }}>
      <div style={{ background:C.card, borderRadius:20, width:'100%', maxWidth:540, border:`1px solid ${C.border}`, overflow:'hidden' }}>
        {/* header */}
        <div style={{ padding:'18px 24px 14px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <p style={{ margin:0, fontSize:15, fontWeight:800, color:C.text }}>Editar QR Code</p>
            <p style={{ margin:0, fontSize:12, color:C.muted, marginTop:2 }}>Escolha o modelo para este cliente</p>
          </div>
          <button onClick={onClose} style={{ background:`${C.red}12`, border:`1px solid ${C.red}25`, color:C.red, borderRadius:8, padding:'6px 12px', cursor:'pointer', fontSize:13, fontWeight:700 }}>✕</button>
        </div>

        {/* templates grid */}
        <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:20 }}>
          <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
            {QR_TEMPLATES.map(({ id, Component, label }) => (
              <div key={id} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, cursor:'pointer' }} onClick={() => setSelected(id)}>
                <div style={{
                  borderRadius:16, padding:3,
                  outline: selected===id ? `3px solid ${C.purple}` : '3px solid transparent',
                  transition:'outline 0.15s',
                }}>
                  <Component />
                </div>
                <span style={{
                  fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:99,
                  background: selected===id ? C.purple : C.surface,
                  color: selected===id ? '#fff' : C.muted,
                  border: `1px solid ${selected===id ? C.purple : C.border}`,
                }}>{label}</span>
              </div>
            ))}
          </div>

          {/* preview */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
            <p style={{ margin:0, fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:1 }}>Prévia</p>
            <SiteQRCard style={selected} siteUrl={siteUrl} />
          </div>

          <button onClick={save} disabled={saving} style={{
            width:'100%', background:C.purple, color:'#fff', fontWeight:800, fontSize:15,
            borderRadius:12, padding:'13px', border:'none', cursor:'pointer', opacity: saving ? 0.6 : 1,
          }}>
            {saving ? 'Salvando…' : '💾 Salvar QR Code'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Preview modal ──────────────────────────────────────────────── */
function PreviewModal({ site, onClose }) {
  const origin    = window.location.origin
  const qd        = site.quiz_data || {}
  const couple    = [qd.myName, qd.partnerName].filter(Boolean).join(' e ') || '—'
  const access    = `${origin}/${site.phone}`
  const edit      = `${origin}/edit/${site.phone}`
  const obrigado  = `${origin}/obrigado/${site.phone}`
  const [previewTab, setPreviewTab] = useState('site') // 'site' | 'obrigado'
  const waMsg  = `Olá! 🎉 Seu pagamento foi efetuado com sucesso!\n\nAcesse seu presente aqui:\n${access}\n\nSe quiser editar algo, use este link:\n${edit}`
  const waUrl  = `https://wa.me/55${site.phone}?text=${encodeURIComponent(waMsg)}`
  const qrUrl  = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(access)}&format=png&margin=8&color=7c3aed&bgcolor=FFFFFF`

  const row     = { display:'flex', flexDirection:'column', gap:6 }
  const lbl     = { margin:0, fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:1 }
  const linkBox = { display:'flex', alignItems:'center', gap:8, background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:'9px 14px' }
  const aBtn    = (col) => ({ display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:`${col}18`, border:`1px solid ${col}30`, color:col, borderRadius:10, padding:'10px', textDecoration:'none', fontSize:13, fontWeight:700 })

  return (
    <div onClick={e=>{ if (e.target===e.currentTarget) onClose() }} style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:300,
      display:'flex', alignItems:'center', justifyContent:'center', padding:16,
    }}>
      <div style={{ background:C.card, borderRadius:20, width:'100%', maxWidth:920, border:`1px solid ${C.border}`, maxHeight:'95vh', display:'flex', flexDirection:'column' }}>

        {/* header */}
        <div style={{ padding:'18px 24px 14px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div>
            <p style={{ margin:0, fontSize:16, fontWeight:900, color:C.text }}>{couple}</p>
            <p style={{ margin:0, fontSize:12, color:C.muted, marginTop:2 }}>
              {maskPhone(site.phone)} · {site.paid
                ? <span style={{color:C.green}}>✓ Pago</span>
                : <span style={{color:C.amber}}>⏳ Pendente — site bloqueado até pagamento</span>}
            </p>
          </div>
          <button onClick={onClose} style={{ background:`${C.red}12`, border:`1px solid ${C.red}25`, color:C.red, borderRadius:8, padding:'6px 12px', cursor:'pointer', fontSize:13, fontWeight:700 }}>✕ Fechar</button>
        </div>

        {/* body — 2 cols */}
        <div style={{ display:'flex', flex:1, overflow:'hidden', minHeight:0 }}>

          {/* left: links + actions */}
          <div style={{ flex:1, overflowY:'auto', padding:22, display:'flex', flexDirection:'column', gap:18, borderRight:`1px solid ${C.border}` }}>

            <div style={row}>
              <p style={lbl}>🔗 Link de acesso</p>
              <div style={linkBox}>
                <span style={{ flex:1, fontSize:11, color:C.soft, fontFamily:'monospace', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{access}</span>
                <CopyBtn text={access} label="Copiar" small />
              </div>
            </div>

            <div style={row}>
              <p style={lbl}>✏️ Link de edição</p>
              <div style={linkBox}>
                <span style={{ flex:1, fontSize:11, color:C.soft, fontFamily:'monospace', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{edit}</span>
                <CopyBtn text={edit} label="Copiar" color={C.amber} bg={C.amber} small />
              </div>
              <p style={{ margin:0, fontSize:11, color:C.muted, lineHeight:1.5 }}>O cliente abre e o quiz já vem preenchido com os dados dele.</p>
            </div>

            <div style={row}>
              <p style={lbl}>💬 Mensagem WhatsApp</p>
              <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 14px' }}>
                <pre style={{ margin:0, fontSize:11, color:C.soft, whiteSpace:'pre-wrap', lineHeight:1.7, fontFamily:'inherit' }}>{waMsg}</pre>
              </div>
              <a href={waUrl} target="_blank" rel="noopener noreferrer" style={aBtn(C.wa)}>
                <MessageCircle size={14} /> Enviar no WhatsApp ↗
              </a>
            </div>

            <div style={row}>
              <p style={lbl}>📱 QR Code do presente</p>
              <div style={{ background:'white', borderRadius:12, padding:16, display:'flex', alignItems:'center', gap:16 }}>
                <img src={qrUrl} alt="QR" width={120} height={120} style={{ borderRadius:6, flexShrink:0 }} />
                <div>
                  <p style={{ margin:'0 0 8px', fontSize:12, color:'#374151', fontWeight:700 }}>Escaneie para abrir o presente</p>
                  <p style={{ margin:0, fontSize:11, color:'#6b7280', lineHeight:1.5 }}>Funciona em qualquer câmera de celular. Quando escaneado abre direto o site personalizado.</p>
                </div>
              </div>
            </div>

            <div style={{ display:'flex', gap:8 }}>
              <a href={access} target="_blank" rel="noopener noreferrer" style={{ ...aBtn(C.purple), flex:1 }}>
                <ExternalLink size={14} /> Abrir site ↗
              </a>
              <a href={edit} target="_blank" rel="noopener noreferrer" style={{ ...aBtn(C.amber), flex:1 }}>
                <Pencil size={14} /> Abrir edição ↗
              </a>
            </div>
          </div>

          {/* right: phone frame preview */}
          <div style={{ width:300, flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', padding:'20px 16px', background:C.bg, gap:12 }}>
            {/* tab switcher */}
            <div style={{ display:'flex', background:C.surface, borderRadius:10, padding:3, border:`1px solid ${C.border}`, width:'100%' }}>
              {[['site','🎁 Site'],['obrigado','✅ Pós-pag']].map(([k,l]) => (
                <button key={k} onClick={()=>setPreviewTab(k)} style={{
                  flex:1, padding:'6px 4px', borderRadius:8, border:'none', cursor:'pointer', fontSize:11, fontWeight:700,
                  background: previewTab===k ? C.purple : 'transparent',
                  color: previewTab===k ? '#fff' : C.muted,
                  transition:'background 0.15s',
                }}>{l}</button>
              ))}
            </div>

            {/* phone shell */}
            <div style={{
              width:240, height:500,
              background:'#1a1a2e',
              borderRadius:36,
              padding:'10px 6px',
              border:`2px solid ${C.border}`,
              boxShadow:`0 20px 50px rgba(0,0,0,0.6), inset 0 0 0 1px #2a2a42`,
              position:'relative',
              flexShrink:0,
            }}>
              {/* notch */}
              <div style={{ width:60, height:5, background:'#2a2a42', borderRadius:3, margin:'0 auto 8px' }} />
              {/* iframe */}
              {previewTab === 'site' ? (
                site.paid ? (
                  <iframe
                    src={access}
                    title="Prévia do site do cliente"
                    style={{ width:'100%', height:'calc(100% - 22px)', border:'none', borderRadius:28, display:'block' }}
                  />
                ) : (
                  <div style={{ height:'calc(100% - 22px)', borderRadius:28, background:'#0a0208', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10, padding:16 }}>
                    <span style={{ fontSize:32 }}>🔒</span>
                    <p style={{ margin:0, fontSize:12, color:'#6b7280', textAlign:'center', lineHeight:1.6 }}>Site bloqueado. Aparece assim que o pagamento for confirmado.</p>
                  </div>
                )
              ) : (
                <iframe
                  src={obrigado}
                  title="Página pós-pagamento"
                  style={{ width:'100%', height:'calc(100% - 22px)', border:'none', borderRadius:28, display:'block' }}
                />
              )}
            </div>

            <p style={{ margin:0, fontSize:10, color:C.muted, textAlign:'center', lineHeight:1.5 }}>
              {previewTab==='site'
                ? (site.paid ? 'O que o cliente vê ao abrir o link.' : 'Site bloqueado até pagamento.')
                : 'Página que o comprador recebe após pagar.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Clients view ───────────────────────────────────────────────── */
function ClientsView({ sites, price, period, setPeriod, customFrom, setCustomFrom, customTo, setCustomTo }) {
  const [search,   setSearch]  = useState('')
  const [filter,   setFilter]  = useState('all')
  const [preview,  setPreview]  = useState(null)
  const [qrEdit,   setQrEdit]   = useState(null) // site object for QR edit
  const [sitesState, setSitesState] = useState(sites)

  const origin   = window.location.origin
  const inPeriod = filterSites(sitesState, period, 'created_at', customFrom, customTo)
  const filtered = inPeriod.filter(s => {
    const q        = search.toLowerCase()
    const name     = `${s.quiz_data?.myName||''} ${s.quiz_data?.partnerName||''}`.toLowerCase()
    const matchSrc = !q || s.phone.includes(q) || name.includes(q)
    const matchFil = filter==='all' || (filter==='paid' ? s.paid : !s.paid)
    return matchSrc && matchFil
  })

  function waLink(phone, accessUrl, editUrl) {
    const msg = `Olá! 🎉 Seu pagamento foi efetuado com sucesso!\n\nAcesse seu presente aqui:\n${accessUrl}\n\nSe quiser editar algo, use este link:\n${editUrl}`
    return `https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`
  }

  const COLS = '44px 155px 175px minmax(80px,1fr) 90px auto'
  const thStyle = { padding:'10px 14px', fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:0.9, whiteSpace:'nowrap' }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {preview && <PreviewModal site={preview} onClose={()=>setPreview(null)} />}
      {qrEdit && <QREditModal site={qrEdit} onClose={()=>setQrEdit(null)} onSaved={(tpl) => {
        setSitesState(prev => prev.map(s => s.phone===qrEdit.phone ? { ...s, quiz_data: { ...s.quiz_data, qrTemplate: tpl } } : s))
      }} />}

      <PeriodBar period={period} setPeriod={setPeriod} customFrom={customFrom} setCustomFrom={setCustomFrom} customTo={customTo} setCustomTo={setCustomTo} />

      <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
        <div style={{ flex:1, minWidth:240, position:'relative' }}>
          <Search size={14} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:C.muted, pointerEvents:'none' }} />
          <input placeholder="Buscar por telefone ou nome..." value={search} onChange={e=>setSearch(e.target.value)}
            style={{ width:'100%', background:C.surface, border:`1.5px solid ${C.border}`, borderRadius:12, padding:'10px 14px 10px 38px', color:C.text, fontSize:13, outline:'none', boxSizing:'border-box' }} />
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {[
            { f:'all',     label:'Todos',     count: inPeriod.length,               activeColor:'#7c3aed', activeBg:'rgba(124,58,237,0.12)' },
            { f:'paid',    label:'Pagos',      count: inPeriod.filter(s=>s.paid).length,   activeColor:'#16a34a', activeBg:'rgba(22,163,74,0.12)'  },
            { f:'pending', label:'Pendentes',  count: inPeriod.filter(s=>!s.paid).length,  activeColor:'#d97706', activeBg:'rgba(217,119,6,0.12)'  },
          ].map(({ f, label, count, activeColor, activeBg })=>{
            const active = filter===f
            return (
              <button key={f} onClick={()=>setFilter(f)} style={{
                display:'flex', alignItems:'center', gap:7,
                padding:'8px 14px', borderRadius:10, cursor:'pointer', fontSize:12, fontWeight:700, outline:'none',
                background: active ? activeBg : 'transparent',
                color: active ? activeColor : C.muted,
                border: active ? `1.5px solid ${activeColor}60` : `1.5px solid ${C.border}`,
                transition:'all 0.15s',
              }}>
                {label}
                <span style={{
                  background: active ? activeColor : C.border,
                  color: active ? '#fff' : C.muted,
                  borderRadius:20, fontSize:10, fontWeight:800,
                  padding:'1px 7px', lineHeight:'18px', minWidth:22, textAlign:'center',
                  transition:'all 0.15s',
                }}>{count}</span>
              </button>
            )
          })}
        </div>
        <span style={{ fontSize:12, color:C.muted, fontWeight:600 }}>{filtered.length} resultado{filtered.length!==1?'s':''}</span>
      </div>

      {/* table — scrollable so buttons never get cut */}
      <div style={{ background:C.card, borderRadius:18, border:`1px solid ${C.border}` }}>
        <div style={{ overflowX:'auto', borderRadius:18 }}>
          <div style={{ minWidth:980 }}>
            {/* header */}
            <div style={{ display:'grid', gridTemplateColumns:COLS, background:C.bg, borderRadius:'18px 18px 0 0', borderBottom:`1px solid ${C.border}` }}>
              {['', 'Telefone', 'Casal', 'Título', 'Status', 'Ações'].map(h=>(
                <div key={h} style={thStyle}>{h}</div>
              ))}
            </div>

            {filtered.length===0 && (
              <div style={{ padding:'60px 32px', textAlign:'center' }}>
                <div style={{ fontSize:32, marginBottom:12 }}>🔍</div>
                <p style={{ color:C.muted, margin:0, fontSize:14 }}>Nenhum cliente encontrado.</p>
              </div>
            )}

            {filtered.map((site, i) => {
              const qd     = site.quiz_data || {}
              const couple = [qd.myName, qd.partnerName].filter(Boolean).join(' e ') || '—'
              const ini    = initials(qd.myName || couple)
              const access = `${origin}/${site.phone}`
              const edit   = `${origin}/edit/${site.phone}`

              return (
                <div key={site.id}
                  style={{ display:'grid', gridTemplateColumns:COLS, borderBottom: i<filtered.length-1 ? `1px solid ${C.border}` : 'none', alignItems:'center', transition:'background 0.12s', borderRadius: i===filtered.length-1 ? '0 0 18px 18px' : 0 }}
                  onMouseEnter={e=>e.currentTarget.style.background='#ffffff07'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                >
                  {/* avatar */}
                  <div style={{ padding:'11px 0 11px 12px' }}>
                    <div style={{ width:30, height:30, borderRadius:9, background:`linear-gradient(135deg, ${C.purple}60, ${C.pink}60)`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <span style={{ fontSize:10, fontWeight:900, color:'white' }}>{ini}</span>
                    </div>
                  </div>
                  {/* phone */}
                  <div style={{ padding:'11px 14px' }}>
                    <p style={{ margin:0, fontSize:12, fontWeight:700, color:C.text, fontFamily:'monospace' }}>{maskPhone(site.phone)}</p>
                    <p style={{ margin:0, fontSize:10, color:C.muted, marginTop:2 }}>{fmt(site.created_at)}</p>
                  </div>
                  {/* couple */}
                  <div style={{ padding:'11px 14px' }}>
                    <p style={{ margin:0, fontSize:12, color:C.soft, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{couple}</p>
                    {site.paid_at && <p style={{ margin:0, fontSize:10, color:C.greenL, marginTop:2 }}>pago {fmt(site.paid_at)}</p>}
                  </div>
                  {/* title */}
                  <div style={{ padding:'11px 14px' }}>
                    <p style={{ margin:0, fontSize:12, color:C.muted, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{qd.title||'—'}</p>
                  </div>
                  {/* status */}
                  <div style={{ padding:'11px 14px' }}>
                    <span style={{ fontSize:10, fontWeight:700, padding:'4px 10px', borderRadius:20, display:'inline-block',
                      background: site.paid ? `${C.green}15` : `${C.amber}15`,
                      color: site.paid ? C.green : C.amber,
                      border:`1px solid ${site.paid ? C.green : C.amber}28`,
                    }}>
                      {site.paid ? '✓ Pago' : '⏳ Pend.'}
                    </span>
                  </div>
                  {/* actions */}
                  <div style={{ padding:'8px 16px 8px 8px', display:'flex', alignItems:'center', gap:5 }}>
                    {/* WhatsApp */}
                    <a href={waLink(site.phone, access, edit)} target="_blank" rel="noopener noreferrer" title="Enviar no WhatsApp"
                      style={{ display:'flex', alignItems:'center', gap:4, background:`${C.wa}15`, border:`1px solid ${C.wa}28`, color:C.wa, borderRadius:8, padding:'5px 9px', textDecoration:'none', fontSize:11, fontWeight:700, whiteSpace:'nowrap', transition:'all 0.15s', flexShrink:0 }}
                      onMouseEnter={e=>e.currentTarget.style.background=`${C.wa}28`}
                      onMouseLeave={e=>e.currentTarget.style.background=`${C.wa}15`}
                    >
                      <MessageCircle size={12} /> WA
                    </a>
                    {/* Ver site */}
                    <a href={access} target="_blank" rel="noopener noreferrer" title="Ver site do cliente"
                      style={{ display:'flex', alignItems:'center', gap:4, background:`${C.purple}12`, border:`1px solid ${C.purple}28`, color:C.purpleL, borderRadius:8, padding:'5px 9px', textDecoration:'none', fontSize:11, fontWeight:700, whiteSpace:'nowrap', transition:'all 0.15s', flexShrink:0 }}
                      onMouseEnter={e=>e.currentTarget.style.background=`${C.purple}22`}
                      onMouseLeave={e=>e.currentTarget.style.background=`${C.purple}12`}
                    >
                      <ExternalLink size={12} /> Ver
                    </a>
                    {/* Copy edit link */}
                    <CopyBtn text={edit} label="Editar" icon={Pencil} color={C.amber} bg={C.amber} small />
                    {/* QR edit */}
                    <button onClick={()=>setQrEdit(site)} title="Editar QR Code" style={{
                      display:'flex', alignItems:'center', gap:4, background:`${C.green}12`, border:`1px solid ${C.green}28`, color:C.green,
                      borderRadius:8, padding:'5px 9px', cursor:'pointer', fontSize:11, fontWeight:700, whiteSpace:'nowrap', flexShrink:0, transition:'all 0.15s',
                    }}
                      onMouseEnter={e=>e.currentTarget.style.background=`${C.green}22`}
                      onMouseLeave={e=>e.currentTarget.style.background=`${C.green}12`}
                    >
                      <Gift size={12} /> QR
                    </button>
                    {/* Preview modal */}
                    <button onClick={()=>setPreview(site)} title="Ver todos os links" style={{
                      display:'flex', alignItems:'center', gap:4, background:`${C.blue}12`, border:`1px solid ${C.blue}28`, color:C.blue,
                      borderRadius:8, padding:'5px 9px', cursor:'pointer', fontSize:11, fontWeight:700, whiteSpace:'nowrap', flexShrink:0, transition:'all 0.15s',
                    }}
                      onMouseEnter={e=>e.currentTarget.style.background=`${C.blue}22`}
                      onMouseLeave={e=>e.currentTarget.style.background=`${C.blue}12`}
                    >
                      <Link2 size={12} /> Links
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ display:'flex', gap:20, alignItems:'center', padding:'0 4px', flexWrap:'wrap' }}>
        <span style={{ fontSize:11, color:C.muted, display:'flex', alignItems:'center', gap:5 }}><MessageCircle size={12} color={C.wa} /> WA = abre WhatsApp com confirmação + links</span>
        <span style={{ fontSize:11, color:C.muted, display:'flex', alignItems:'center', gap:5 }}><Pencil size={12} color={C.amber} /> Editar = copia link de edição para enviar ao cliente</span>
        <span style={{ fontSize:11, color:C.muted, display:'flex', alignItems:'center', gap:5 }}><Link2 size={12} color={C.blue} /> Links = abre modal com todos os links + QR code</span>
      </div>
    </div>
  )
}

/* ── Demo Tab ───────────────────────────────────────────────────── */
function DemoTab() {
  const [demo,    setDemo]    = useState(undefined) // undefined=loading, null=não existe, obj=existe
  const [loading, setLoading] = useState(true)
  const [copied,  setCopied]  = useState(false)
  const origin   = window.location.origin
  const demoUrl  = `${origin}/demo`

  useEffect(() => {
    getSite('demo')
      .then(d => { setDemo(d || null); setLoading(false) })
      .catch(() => { setDemo(null); setLoading(false) })
  }, [])

  const handleEdit = () => {
    const quizData = demo?.quiz_data
    sessionStorage.setItem('demoMode', 'true')
    if (quizData && Object.keys(quizData).length > 0 && !quizData.freeLink) {
      sessionStorage.setItem('editData', JSON.stringify(quizData))
    }
    window.location.href = '/'
  }

  const copyLink = () => {
    navigator.clipboard.writeText(demoUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  const card     = { background:C.card, borderRadius:18, border:`1px solid ${C.border}`, padding:28 }
  const lbl      = { margin:'0 0 6px', fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:1, display:'block' }
  const linkBox  = { display:'flex', alignItems:'center', gap:8, background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 14px', marginBottom:8 }

  if (loading) return (
    <div style={{ ...card, display:'flex', alignItems:'center', justifyContent:'center', padding:48 }}>
      <div style={{ width:32, height:32, border:`3px solid ${C.border}`, borderTop:`3px solid ${C.purple}`, borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
    </div>
  )

  const qd      = demo?.quiz_data || {}
  const couple  = [qd.myName, qd.partnerName].filter(Boolean).join(' & ')
  const hasDemo = Boolean(demo && !demo.quiz_data?.freeLink)

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20, maxWidth:900 }}>

      {/* status + actions */}
      <div style={{ ...card, borderColor: hasDemo ? `${C.purple}30` : C.border }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
          <div>
            <p style={{ margin:'0 0 6px', fontSize:17, fontWeight:900, color:C.text, letterSpacing:-0.3 }}>
              {hasDemo ? '✅ Demonstração ativa' : '⚪ Nenhuma demonstração criada'}
            </p>
            <p style={{ margin:0, fontSize:13, color:C.muted, lineHeight:1.6 }}>
              {hasDemo
                ? `Casal: ${couple || '—'} · Título: "${qd.title || '(sem título)'}" · Link público: ${demoUrl}`
                : 'Crie uma demonstração para mostrar como o presente funciona antes de o cliente comprar.'}
            </p>
          </div>
          <button onClick={handleEdit} style={{
            display:'flex', alignItems:'center', gap:8,
            background:`${C.purple}18`, border:`1.5px solid ${C.purple}35`, color:C.purpleL,
            borderRadius:12, padding:'11px 22px', cursor:'pointer', fontSize:14, fontWeight:700,
            whiteSpace:'nowrap', transition:'all 0.15s', flexShrink:0,
          }}
            onMouseEnter={e=>e.currentTarget.style.background=`${C.purple}30`}
            onMouseLeave={e=>e.currentTarget.style.background=`${C.purple}18`}
          >
            <Sparkles size={16} />
            {hasDemo ? 'Editar demonstração' : 'Criar demonstração'}
          </button>
        </div>

        {hasDemo && (
          <div style={{ marginTop:20 }}>
            <span style={lbl}>Link público da demonstração</span>
            <div style={linkBox}>
              <span style={{ flex:1, fontSize:13, color:C.soft, fontFamily:'monospace' }}>{demoUrl}</span>
              <button onClick={copyLink} style={{
                background: copied ? `${C.green}18` : `${C.purple}12`,
                border: `1px solid ${copied ? C.green : C.purple}28`,
                color: copied ? C.green : C.purpleL,
                borderRadius:8, padding:'5px 12px', cursor:'pointer', fontSize:12, fontWeight:700,
                display:'flex', alignItems:'center', gap:5, transition:'all 0.15s', flexShrink:0,
              }}>
                {copied ? <><Check size={12} /> Copiado!</> : <><Copy size={12} /> Copiar</>}
              </button>
              <a href={demoUrl} target="_blank" rel="noopener noreferrer" style={{
                background:`${C.purple}12`, border:`1px solid ${C.purple}28`, color:C.purpleL,
                borderRadius:8, padding:'5px 12px', textDecoration:'none', fontSize:12, fontWeight:700,
                display:'flex', alignItems:'center', gap:5, flexShrink:0,
              }}>
                <ExternalLink size={12} /> Abrir
              </a>
            </div>
            <p style={{ margin:'6px 0 0', fontSize:11, color:C.muted }}>
              Compartilhe este link com potenciais clientes para mostrarem como o presente funciona. Não precisa pagar para ver.
            </p>
          </div>
        )}
      </div>

      {/* phone preview + info */}
      {hasDemo && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:20, alignItems:'start' }}>

          {/* info card */}
          <div style={card}>
            <p style={{ margin:'0 0 18px', fontSize:14, fontWeight:800, color:C.text }}>Conteúdo atual da demonstração</p>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[
                ['👫 Casal', couple || '—'],
                ['✏️ Título', qd.title || '—'],
                ['📅 Data do relacionamento', qd.relationshipStart || '—'],
                ['💌 Mensagem', qd.message ? qd.message.slice(0,80) + (qd.message.length>80?'…':'') : '—'],
                ['🎁 Seções extras', qd.wrappedSections?.length ? qd.wrappedSections.join(', ') : 'Nenhuma'],
                ['🖼️ Fotos', qd.photos?.length ? `${qd.photos.length} foto${qd.photos.length!==1?'s':''}` : '—'],
              ].map(([k,v]) => (
                <div key={k} style={{ display:'flex', gap:12, padding:'10px 0', borderBottom:`1px solid ${C.border}` }}>
                  <span style={{ fontSize:12, color:C.muted, width:170, flexShrink:0 }}>{k}</span>
                  <span style={{ fontSize:12, color:C.soft, flex:1 }}>{v}</span>
                </div>
              ))}
            </div>
            <button onClick={handleEdit} style={{
              marginTop:20, width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              background:`${C.purple}18`, border:`1.5px solid ${C.purple}35`, color:C.purpleL,
              borderRadius:12, padding:'12px', cursor:'pointer', fontSize:14, fontWeight:700, transition:'all 0.15s',
            }}
              onMouseEnter={e=>e.currentTarget.style.background=`${C.purple}30`}
              onMouseLeave={e=>e.currentTarget.style.background=`${C.purple}18`}
            >
              <Pencil size={15} /> Editar conteúdo
            </button>
          </div>

          {/* phone preview */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
            <p style={{ margin:0, fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:1 }}>Prévia do site demo</p>
            <div style={{
              width:240, height:500, background:'#1a1a2e', borderRadius:36,
              padding:'10px 6px', border:`2px solid ${C.border}`,
              boxShadow:`0 20px 50px rgba(0,0,0,0.5), inset 0 0 0 1px #2a2a42`,
            }}>
              <div style={{ width:60, height:5, background:'#2a2a42', borderRadius:3, margin:'0 auto 8px' }} />
              <iframe src={demoUrl} title="Demonstração" style={{ width:'100%', height:'calc(100% - 22px)', border:'none', borderRadius:28, display:'block' }} />
            </div>
            <p style={{ margin:0, fontSize:10, color:C.muted, textAlign:'center' }}>Isso é o que o cliente vê ao abrir o link demo</p>
          </div>
        </div>
      )}

      {/* how it works */}
      <div style={{ background:`${C.purple}08`, border:`1px solid ${C.purple}20`, borderRadius:16, padding:20 }}>
        <p style={{ margin:'0 0 12px', fontSize:13, fontWeight:800, color:C.purpleL }}>Como funciona</p>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {[
            ['1', 'Clique em "Criar/Editar demonstração" — o quiz abre normalmente'],
            ['2', 'Preencha com dados fictícios de um casal de exemplo (fotos, nome, música, etc.)'],
            ['3', 'Na última etapa, ao invés de PIX aparece um botão "Salvar como demonstração"'],
            ['4', 'O site fica disponível em /demo para qualquer pessoa ver sem pagar'],
            ['5', 'Compartilhe o link /demo nas suas redes sociais ou com clientes interessados'],
          ].map(([n, t]) => (
            <div key={n} style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
              <div style={{ width:22, height:22, borderRadius:'50%', background:`${C.purple}30`, border:`1px solid ${C.purple}50`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                <span style={{ fontSize:10, fontWeight:900, color:C.purpleL }}>{n}</span>
              </div>
              <p style={{ margin:0, fontSize:12, color:C.soft, lineHeight:1.6 }}>{t}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Settings sub-tabs ──────────────────────────────────────────── */
function SettingsTabs({ active, setActive }) {
  const tabs = [
    { id:'quiz',     label:'Quiz',          Icon: BookOpen },
    { id:'produto',  label:'Produto',       Icon: Package },
    { id:'pixel',    label:'Pixels & APIs', Icon: Tv2 },
    { id:'links',    label:'Links',         Icon: Link2 },
    { id:'demo',     label:'Demonstração',  Icon: Sparkles },
  ]
  return (
    <div style={{ display:'flex', gap:6, marginBottom:24, borderBottom:`1px solid ${C.border}`, paddingBottom:0 }}>
      {tabs.map(({ id, label, Icon }) => {
        const on = active === id
        return (
          <button key={id} onClick={()=>setActive(id)} style={{
            display:'flex', alignItems:'center', gap:8, padding:'10px 18px',
            borderRadius:0, cursor:'pointer', border:'none', background:'transparent',
            color: on ? C.purpleLt : C.soft, fontWeight: on ? 700 : 500, fontSize:13,
            borderBottom: on ? `2px solid ${C.purple}` : '2px solid transparent',
            marginBottom:-1, transition:'all 0.15s',
          }}>
            <Icon size={14} />{label}
          </button>
        )
      })}
    </div>
  )
}

function ConfigField({ label, value, onChange, placeholder, type = 'text', hint }) {
  const inp = { background:C.surface, border:`1.5px solid ${C.border}`, borderRadius:10, padding:'11px 16px', color:C.text, fontSize:14, outline:'none', boxSizing:'border-box', width:'100%', transition:'border-color 0.15s' }
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      <label style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:1 }}>{label}</label>
      <input type={type} style={inp} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        onFocus={e=>e.target.style.borderColor=C.purple} onBlur={e=>e.target.style.borderColor=C.border} />
      {hint && <p style={{ margin:0, fontSize:11, color:C.muted, lineHeight:1.5 }}>{hint}</p>}
    </div>
  )
}

function SaveBtn({ status, onClick, label = 'Salvar', color = C.purple }) {
  return (
    <button onClick={onClick} style={{
      background:`${color}18`, border:`1.5px solid ${color}35`, color,
      borderRadius:10, padding:'10px 24px', cursor:'pointer', fontSize:13, fontWeight:700,
      whiteSpace:'nowrap', transition:'all 0.15s', display:'flex', alignItems:'center', gap:8,
    }}
      onMouseEnter={e=>e.currentTarget.style.background=`${color}30`}
      onMouseLeave={e=>e.currentTarget.style.background=`${color}18`}
    >
      {status==='saving' ? <><div style={{ width:14,height:14,border:`2px solid ${color}40`,borderTop:`2px solid ${color}`,borderRadius:'50%',animation:'spin 0.7s linear infinite' }} /> Salvando…</> :
       status==='saved'  ? <><Check size={14} /> Salvo!</> : label}
    </button>
  )
}

/* ── Quiz config ────────────────────────────────────────────────── */
function QuizView() {
  const origin = window.location.origin
  const [copied, setCopied] = useState(null)

  const copy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const quizzes = [
    {
      id: 'namorados',
      emoji: '💝',
      name: 'Dia dos Namorados',
      sub: 'Cupid Presentes',
      desc: 'Quiz completo com fotos, músicas, mensagens, jogos, galeria e pagamento PIX. O cliente edita pelo link /edit/{telefone}.',
      quizUrl: `${origin}/`,
      editUrl: `${origin}/edit/{telefone}`,
      color: C.pink,
      status: 'active',
    },
    {
      id: 'biblico',
      emoji: '✝️',
      name: 'Temática Bíblica',
      sub: 'Cupid Cristão',
      desc: 'Variação com textos bíblicos, paleta exclusiva e seções personalizadas para presentes cristãos.',
      quizUrl: `${origin}/biblico`,
      editUrl: `${origin}/edit-biblico/{telefone}`,
      color: C.amber,
      status: 'active',
    },
  ]

  const card     = { background:C.card, borderRadius:18, border:`1px solid ${C.border}`, padding:28 }
  const rowStyle = { display:'flex', flexDirection:'column', gap:8 }
  const infoBox  = { background:C.bg, borderRadius:10, padding:'10px 14px' }
  const monoUrl  = { margin:'4px 0 0', fontSize:13, fontFamily:'monospace', wordBreak:'break-all' }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {quizzes.map(q => (
        <div key={q.id} style={{ ...card, borderColor: q.status==='active' ? `${q.color}30` : C.border }}>
          {/* header */}
          <div style={{ display:'flex', alignItems:'flex-start', gap:14, marginBottom:16 }}>
            <div style={{ fontSize:36, lineHeight:1, flexShrink:0 }}>{q.emoji}</div>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                <p style={{ margin:0, fontSize:16, fontWeight:800, color:C.text }}>{q.name}</p>
                <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20,
                  background: q.status==='active' ? `${C.green}20` : `${C.muted}18`,
                  color:       q.status==='active' ? C.green       : C.muted }}>
                  {q.status==='active' ? '● ATIVO' : '○ EM BREVE'}
                </span>
              </div>
              <p style={{ margin:'3px 0 0', fontSize:12, color:C.muted }}>{q.sub}</p>
              <p style={{ margin:'6px 0 0', fontSize:13, color:C.soft, lineHeight:1.5 }}>{q.desc}</p>
            </div>
          </div>

          {/* URLs */}
          <div style={rowStyle}>
            <div style={infoBox}>
              <p style={{ margin:0, fontSize:10, fontWeight:700, color:C.muted, letterSpacing:1, textTransform:'uppercase' }}>URL do Quiz</p>
              <p style={{ ...monoUrl, color:C.purpleLt }}>{q.quizUrl}</p>
            </div>
            <div style={infoBox}>
              <p style={{ margin:0, fontSize:10, fontWeight:700, color:C.muted, letterSpacing:1, textTransform:'uppercase' }}>URL de Edição</p>
              <p style={{ ...monoUrl, color:C.amber }}>{q.editUrl}</p>
            </div>
          </div>

          {/* actions */}
          {q.status === 'active' && (
            <div style={{ display:'flex', gap:8, marginTop:14, flexWrap:'wrap' }}>
              <a href={q.quizUrl} target="_blank" rel="noopener noreferrer" style={{
                background:`${q.color}18`, border:`1.5px solid ${q.color}35`, color:q.color,
                borderRadius:10, padding:'9px 20px', fontSize:12, fontWeight:700,
                textDecoration:'none', display:'flex', alignItems:'center', gap:6,
              }}>
                <ExternalLink size={12} /> Abrir Quiz
              </a>
              <button onClick={() => copy(q.quizUrl, q.id+'_quiz')} style={{
                background:`${C.purple}18`, border:`1.5px solid ${C.purple}35`, color:C.purpleL,
                borderRadius:10, padding:'9px 20px', cursor:'pointer', fontSize:12, fontWeight:700,
                display:'flex', alignItems:'center', gap:6,
              }}>
                {copied===q.id+'_quiz' ? <><Check size={12}/> Copiado!</> : <><Copy size={12}/> Copiar Link</>}
              </button>
            </div>
          )}

          {q.status === 'soon' && (
            <div style={{ marginTop:14, padding:'10px 14px', background:`${C.amber}0d`, borderRadius:10, border:`1px solid ${C.amber}20` }}>
              <p style={{ margin:0, fontSize:12, color:C.amber }}>⏳ Em desenvolvimento — URL e configurações serão adicionadas em breve.</p>
            </div>
          )}
        </div>
      ))}

      {/* SQL reminder */}
      <div style={{ background:C.bg, borderRadius:12, padding:'14px 20px', border:`1px solid ${C.border}` }}>
        <p style={{ margin:'0 0 10px', fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:1 }}>SQL necessário no Supabase</p>
        <pre style={{ margin:0, fontFamily:'monospace', fontSize:11, color:'#86efac', lineHeight:2, whiteSpace:'pre-wrap', wordBreak:'break-all' }}>{`create table if not exists sites (
  id         uuid primary key default gen_random_uuid(),
  phone      text unique not null,
  paid       boolean default false,
  quiz_data  jsonb,
  created_at timestamptz default now(),
  paid_at    timestamptz
);
create table if not exists app_config (key text primary key, value text);
create table if not exists funnel_events (
  id         bigint generated always as identity primary key,
  step       text not null,
  created_at timestamptz default now()
);
-- Storage: bucket público "site-photos" (leitura pública habilitada)`}</pre>
      </div>
    </div>
  )
}

function SettingsView({ price, onPriceChange }) {
  const [tab, setTab] = useState('produto')

  // Produto
  const [priceInput, setPriceInput] = useState(String(price).replace('.', ','))

  // Pixel
  const [pixelId,   setPixelId]   = useState('')
  const [fbToken,   setFbToken]   = useState('')
  const [ttPixelId,  setTtPixelId]  = useState('')
  const [ttToken,    setTtToken]    = useState('')

  // Links
  const [freePhone, setFreePhone] = useState('')
  const [freeLink,  setFreeLink]  = useState(null)

  const [status, setStatus] = useState({})

  useEffect(() => {
    Promise.all([
      getAppConfig('pixel_id'),
      getAppConfig('fb_access_token'),
      getAppConfig('tiktok_pixel_id'),
      getAppConfig('tiktok_access_token'),
      getAppConfig('price'),
    ]).then(([pid, fbt, ttid, ttat, p]) => {
      if (pid)  setPixelId(pid)
      if (fbt)  setFbToken(fbt)
      if (ttid) setTtPixelId(ttid)
      if (ttat) setTtToken(ttat)
      if (p)    setPriceInput(String(parseFloat(p)).replace('.', ','))
    })
  }, [])

  const save = async (key, value, field) => {
    setStatus(s => ({ ...s, [field]:'saving' }))
    try {
      await setAppConfig(key, value)
      if (key==='price') onPriceChange(parseFloat(value.replace(',','.')))
      setStatus(s => ({ ...s, [field]:'saved' }))
      setTimeout(() => setStatus(s => ({ ...s, [field]:null })), 2500)
    } catch { setStatus(s => ({ ...s, [field]:'error' })) }
  }

  const genFree = async () => {
    const digits = freePhone.replace(/\D/g,'')
    if (digits.length < 10) return
    setStatus(s => ({ ...s, free:'loading' }))
    try {
      await createFreeLink(digits)
      setFreeLink(`${window.location.origin}/${digits}`)
      setStatus(s => ({ ...s, free:'done' }))
    } catch { setStatus(s => ({ ...s, free:'error' })) }
  }

  const card = { background:C.card, borderRadius:18, border:`1px solid ${C.border}`, padding:28, display:'flex', flexDirection:'column', gap:20 }
  const section = (title, sub, color=C.text) => (
    <div>
      <p style={{ margin:'0 0 4px', fontSize:17, fontWeight:900, color, letterSpacing:-0.3 }}>{title}</p>
      {sub && <p style={{ margin:0, fontSize:13, color:C.muted, lineHeight:1.6 }}>{sub}</p>}
    </div>
  )

  return (
    <div style={{ maxWidth:760 }}>
      <SettingsTabs active={tab} setActive={setTab} />

      {/* ── Quiz ── */}
      {tab === 'quiz' && <QuizView />}

      {/* ── Produto ── */}
      {tab === 'produto' && (
        <div style={card}>
          {section('Preço do produto', 'Valor usado nos cálculos de receita. Altere aqui e o dashboard atualiza na hora.')}
          <ConfigField label="Preço base (R$)" value={priceInput} onChange={setPriceInput} placeholder="19,90" />
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <SaveBtn status={status.price} onClick={()=>save('price', priceInput, 'price')} label="Salvar preço" color={C.green} />
            {status.price==='error' && <span style={{ color:C.red, fontSize:12 }}>Erro ao salvar.</span>}
          </div>
        </div>
      )}

      {/* ── Pixels & APIs ── */}
      {tab === 'pixel' && (
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

          {/* Facebook */}
          <div style={{ ...card, borderColor:`${C.blue}25` }}>
            {section('Facebook / Meta Pixel', undefined)}
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', background:`${C.blue}0a`, borderRadius:12, border:`1px solid ${C.blue}20` }}>
              <div style={{ width:32, height:32, borderRadius:8, background:`${C.blue}25`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ fontSize:16 }}>f</span>
              </div>
              <div>
                <p style={{ margin:0, fontSize:13, fontWeight:700, color:C.text }}>Pixel + Conversions API (CAPI)</p>
                <p style={{ margin:0, fontSize:12, color:C.muted }}>Pixel dispara no browser · CAPI dispara no servidor para rastrear bloqueadores de ad</p>
              </div>
            </div>
            <ConfigField label="Pixel ID" value={pixelId} onChange={setPixelId} placeholder="1234567890123456"
              hint="Encontre em Events Manager → Pixels → seu pixel → Overview" />
            <ConfigField label="API Access Token (Conversions API)" value={fbToken} onChange={setFbToken} placeholder="EAAabc..."
              hint="Gere em Events Manager → Pixels → Settings → Conversions API → Generate access token" />
            <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
              <SaveBtn status={status.pixel} onClick={async()=>{ await save('pixel_id', pixelId.trim(), 'pixel'); await save('fb_access_token', fbToken.trim(), 'pixel') }} label="Salvar Facebook" color={C.blue} />
              {status.pixel==='error' && <span style={{ color:C.red, fontSize:12 }}>Erro. Verifique o Supabase (tabela app_config).</span>}
            </div>
            <div style={{ background:C.bg, borderRadius:12, padding:'14px 18px', display:'flex', flexDirection:'column', gap:8 }}>
              <p style={{ margin:0, fontSize:12, fontWeight:700, color:C.muted }}>Eventos rastreados automaticamente:</p>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                {[['InitiateCheckout','Pixel + CAPI',C.amber],['Purchase','Pixel + CAPI',C.green],['PageView','Pixel',C.blue]].map(([e,m,c])=>(
                  <span key={e} style={{ fontSize:11, fontWeight:700, padding:'4px 12px', borderRadius:20, background:`${c}15`, color:c, border:`1px solid ${c}25` }}>{e} <span style={{opacity:0.6}}>· {m}</span></span>
                ))}
              </div>
            </div>
          </div>

          {/* TikTok */}
          <div style={{ ...card, borderColor:`${C.tt}25` }}>
            {section('TikTok Pixel', undefined)}
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', background:`${C.tt}0a`, borderRadius:12, border:`1px solid ${C.tt}20` }}>
              <div style={{ width:32, height:32, borderRadius:8, background:`${C.tt}25`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ fontSize:16 }}>♪</span>
              </div>
              <div>
                <p style={{ margin:0, fontSize:13, fontWeight:700, color:C.text }}>TikTok Pixel (client-side)</p>
                <p style={{ margin:0, fontSize:12, color:C.muted }}>Rastreia InitiateCheckout e CompletePayment automaticamente</p>
              </div>
            </div>
            <ConfigField label="TikTok Pixel ID" value={ttPixelId} onChange={setTtPixelId} placeholder="C1ABCDEFGHIJ..."
              hint="Encontre em TikTok Ads Manager → Assets → Events → Web Events → Pixel" />
            <ConfigField label="Access Token (Events API — server-side)" value={ttToken} onChange={setTtToken} placeholder="a1b2c3d4e5..."
              hint="TikTok Ads Manager → Assets → Events → Web Events → Manage → Events API → Generate Access Token" />
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <SaveBtn status={status.tiktok} onClick={async()=>{ await save('tiktok_pixel_id', ttPixelId.trim(), 'tiktok'); await save('tiktok_access_token', ttToken.trim(), 'tiktok') }} label="Salvar TikTok" color={C.tt} />
              {status.tiktok==='error' && <span style={{ color:C.red, fontSize:12 }}>Erro ao salvar.</span>}
            </div>
            <div style={{ background:C.bg, borderRadius:12, padding:'14px 18px', display:'flex', flexDirection:'column', gap:8 }}>
              <p style={{ margin:0, fontSize:12, fontWeight:700, color:C.muted }}>Eventos rastreados automaticamente:</p>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                {[['InitiateCheckout','Pixel + Events API',C.amber],['CompletePayment','Pixel + Events API',C.green],['PageView','Pixel',C.blue]].map(([e,m,c])=>(
                  <span key={e} style={{ fontSize:11, fontWeight:700, padding:'4px 12px', borderRadius:20, background:`${c}15`, color:c, border:`1px solid ${c}25` }}>{e} <span style={{opacity:0.6}}>· {m}</span></span>
                ))}
              </div>
            </div>
          </div>

          {/* SQL helper */}
          <div style={{ background:C.bg, borderRadius:12, padding:'14px 20px', border:`1px solid ${C.border}`, fontFamily:'monospace', fontSize:12, color:'#86efac', lineHeight:2.2 }}>
            {'-- Execute no Supabase SQL Editor (se ainda não criou):'}<br/>
            {'create table if not exists app_config (key text primary key, value text);'}<br/>
            {'create table if not exists funnel_events (id bigint generated always as identity primary key, step text not null, created_at timestamptz default now());'}
          </div>
        </div>
      )}

      {/* ── Demo ── */}
      {tab === 'demo' && <DemoTab />}

      {/* ── Links ── */}
      {tab === 'links' && (
        <div style={{ ...card, borderColor:`${C.green}25` }}>
          {section('Gerar link gratuito', 'Cria um site marcado como pago sem passar pelo checkout. Útil para testes ou presentes especiais.', C.green)}
          <ConfigField label="WhatsApp do cliente (DDD + número, 11 dígitos)" value={freePhone} onChange={v=>setFreePhone(v.replace(/\D/g,''))} placeholder="31999991234" />
          <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
            <button onClick={genFree} disabled={freePhone.replace(/\D/g,'').length<10 || status.free==='loading'} style={{
              background:`${C.green}18`, border:`1.5px solid ${C.green}35`, color:C.green,
              borderRadius:10, padding:'10px 24px', cursor:'pointer', fontSize:13, fontWeight:700,
              opacity: freePhone.replace(/\D/g,'').length<10 ? 0.5 : 1, transition:'all 0.15s',
            }}
              onMouseEnter={e=>{ if (freePhone.replace(/\D/g,'').length>=10) e.currentTarget.style.background=`${C.green}30` }}
              onMouseLeave={e=>e.currentTarget.style.background=`${C.green}18`}
            >
              {status.free==='loading' ? 'Gerando…' : 'Gerar link gratuito'}
            </button>
            {status.free==='error' && <span style={{ color:C.red, fontSize:12 }}>Erro ao criar. Verifique o Supabase.</span>}
          </div>
          {freeLink && (
            <div style={{ background:`${C.green}0e`, border:`1px solid ${C.green}28`, borderRadius:12, padding:'18px 20px', display:'flex', flexDirection:'column', gap:12 }}>
              <p style={{ margin:0, fontSize:12, fontWeight:700, color:C.green }}>✓ Link gerado com sucesso!</p>
              <p style={{ margin:0, fontSize:13, color:C.greenL, fontFamily:'monospace', wordBreak:'break-all' }}>{freeLink}</p>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={()=>navigator.clipboard.writeText(freeLink)}
                  style={{ background:`${C.green}18`, border:`1px solid ${C.green}35`, color:C.green, borderRadius:8, padding:'7px 16px', cursor:'pointer', fontSize:12, fontWeight:700, display:'flex', alignItems:'center', gap:6 }}>
                  <Copy size={12} /> Copiar
                </button>
                <a href={freeLink} target="_blank" rel="noopener noreferrer"
                  style={{ background:`${C.purple}18`, border:`1px solid ${C.purple}35`, color:C.purpleL, borderRadius:8, padding:'7px 16px', fontSize:12, fontWeight:700, textDecoration:'none', display:'flex', alignItems:'center', gap:6 }}>
                  <ExternalLink size={12} /> Abrir
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Main ───────────────────────────────────────────────────────── */
export default function AdminPanel() {
  const [sites,        setSites]        = useState([])
  const [funnelEvents, setFunnelEvents] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)
  const [nav,          setNav]          = useState('dashboard')
  const [price,        setPrice]        = useState(19.90)
  const [period,       setPeriod]       = useState('month')
  const [customFrom,   setCustomFrom]   = useState('')
  const [customTo,     setCustomTo]     = useState('')

  const { from, to } = getPeriod(period, customFrom, customTo)

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const [s, fe, p] = await Promise.all([getAllSites(), getFunnelEvents(from, to), getAppConfig('price')])
      setSites(s)
      setFunnelEvents(fe)
      if (p) setPrice(parseFloat(p))
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [period, customFrom, customTo])

  const handleLogout = () => { localStorage.removeItem('adminAuth'); window.location.href = '/login' }

  const totalPaid = sites.filter(s=>s.paid).length
  const pageTitle = { dashboard:'Dashboard', clients:'Clientes', settings:'Configurações' }[nav]
  const pageSub   = { dashboard:'Visão geral do negócio', clients:'Gerenciar clientes', settings:'Configurar o sistema' }[nav]

  const rootStyle = {
    position:'fixed', inset:0, overflowY:'auto',
    background:C.bg, color:C.text,
    fontFamily:'-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif',
  }

  if (loading) return (
    <div style={{ ...rootStyle, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:44, height:44, border:`3px solid ${C.border}`, borderTop:`3px solid ${C.purple}`, borderRadius:'50%', margin:'0 auto 18px', animation:'spin 0.8s linear infinite' }} />
        <p style={{ margin:0, fontSize:14, color:C.muted }}>Carregando painel…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (error) return (
    <div style={{ ...rootStyle, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:C.card, borderRadius:20, padding:48, maxWidth:500, textAlign:'center', border:`1px solid ${C.red}25` }}>
        <div style={{ fontSize:36, marginBottom:16 }}>⚠️</div>
        <p style={{ color:C.red, fontWeight:800, fontSize:18, marginBottom:12 }}>Banco de dados não configurado</p>
        <p style={{ color:C.soft, fontSize:13, lineHeight:1.8, marginBottom:24 }}>Acesse <strong style={{color:C.purpleL}}>Vercel → Settings → Environment Variables</strong> e adicione:</p>
        <div style={{ background:C.bg, borderRadius:12, padding:'16px 22px', display:'inline-block', fontFamily:'monospace', fontSize:13, color:'#86efac', lineHeight:2.4, textAlign:'left', border:`1px solid ${C.border}` }}>
          VITE_SUPABASE_URL = https://xxxx.supabase.co<br />
          VITE_SUPABASE_ANON_KEY = eyJhbGciOi...
        </div>
      </div>
    </div>
  )

  return (
    <div style={rootStyle}>
      <Sidebar active={nav} setActive={setNav} onLogout={handleLogout} totalSites={sites.length} totalPaid={totalPaid} />

      <div style={{ marginLeft: SIDEBAR, minHeight:'100vh', display:'flex', flexDirection:'column' }}>
        <header style={{ background:C.side, borderBottom:`1px solid ${C.border}`, padding:'0 32px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
          <div>
            <p style={{ margin:0, fontSize:19, fontWeight:900, color:C.text, letterSpacing:-0.5 }}>{pageTitle}</p>
            <p style={{ margin:0, fontSize:11, color:C.muted, marginTop:1 }}>{pageSub}</p>
          </div>
          <button onClick={load} style={{ background:'transparent', border:`1px solid ${C.border}`, color:C.soft, borderRadius:10, padding:'8px 18px', cursor:'pointer', fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:7, transition:'all 0.15s' }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.borderHi; e.currentTarget.style.color=C.text }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.soft }}
          >
            <RefreshCw size={14} /> Atualizar
          </button>
        </header>

        <main style={{ flex:1, padding:'28px 32px', maxWidth:1440, width:'100%', margin:'0 auto', boxSizing:'border-box' }}>
          {nav === 'dashboard' && (
            <DashboardView sites={sites} price={price} period={period} setPeriod={setPeriod}
              customFrom={customFrom} setCustomFrom={setCustomFrom} customTo={customTo} setCustomTo={setCustomTo}
              funnelEvents={funnelEvents} />
          )}
          {nav === 'clients' && (
            <ClientsView sites={sites} price={price} period={period} setPeriod={setPeriod}
              customFrom={customFrom} setCustomFrom={setCustomFrom} customTo={customTo} setCustomTo={setCustomTo} />
          )}
          {nav === 'settings' && (
            <SettingsView price={price} onPriceChange={setPrice} />
          )}
        </main>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        * { box-sizing: border-box }
        ::-webkit-scrollbar { width: 6px; height: 6px }
        ::-webkit-scrollbar-track { background: transparent }
        ::-webkit-scrollbar-thumb { background: #252538; border-radius: 3px }
        ::-webkit-scrollbar-thumb:hover { background: #313148 }
        input:focus { border-color: ${C.purple} !important; box-shadow: 0 0 0 3px ${C.purple}15 }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5) }
      `}</style>
    </div>
  )
}
