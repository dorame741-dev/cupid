import { useState, useEffect, useMemo } from 'react'
import {
  LayoutDashboard, Users, Settings, LogOut, TrendingUp,
  DollarSign, ShoppingCart, Percent, RefreshCw, Copy, Check,
  ChevronRight, Calendar, Star, Camera, Gamepad2, Globe, Gift, Clock,
} from 'lucide-react'
import { getAllSites, getAppConfig, setAppConfig, createFreeLink, getFunnelEvents } from '../lib/supabase'

/* ── palette ───────────────────────────────────────────────────── */
const C = {
  bg:      '#08080d',
  side:    '#0e0e16',
  surface: '#12121c',
  card:    '#16162080',
  border:  '#1e1e30',
  text:    '#e5e7eb',
  soft:    '#9ca3af',
  muted:   '#4b5563',
  purple:  '#7c3aed',
  purpleL: '#a78bfa',
  green:   '#10b981',
  amber:   '#f59e0b',
  blue:    '#3b82f6',
  red:     '#ef4444',
}
const SIDEBAR = 220

/* ── helpers ───────────────────────────────────────────────────── */
function fmt(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit' })
}
function fmtShort(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit' })
}
function maskPhone(p) {
  if (!p || p.length < 10) return p
  return `(${p.slice(0,2)}) ${p.slice(2,7)}-${p.slice(7)}`
}
function brl(v) { return `R$ ${v.toFixed(2).replace('.', ',')}` }

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
function BarChart({ data, color = C.purple, height = 100, secondary }) {
  if (!data.length) return <div style={{ height, display:'flex', alignItems:'center', justifyContent:'center', color: C.muted, fontSize: 12 }}>Sem dados</div>
  const maxVal = Math.max(...data.map(d => Math.max(d.value, d.value2 || 0)), 1)
  const barH = height - 28
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap: 3, height, width:'100%', overflow:'hidden' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3, height:'100%', justifyContent:'flex-end', minWidth:0 }}>
          <div style={{ width:'100%', display:'flex', alignItems:'flex-end', gap: 1, justifyContent:'center', height: barH }}>
            <div style={{ flex:1, background:`${color}25`, borderRadius:'3px 3px 0 0', position:'relative', height:`${Math.max((d.value/maxVal)*barH,d.value?2:0)}px`, transition:'height 0.4s' }}>
              <div style={{ position:'absolute', bottom:0, inset:0, background: color, borderRadius:'3px 3px 0 0' }} />
            </div>
            {secondary && d.value2 !== undefined && (
              <div style={{ flex:1, background:`${secondary}25`, borderRadius:'3px 3px 0 0', position:'relative', height:`${Math.max((d.value2/maxVal)*barH,d.value2?2:0)}px`, transition:'height 0.4s' }}>
                <div style={{ position:'absolute', bottom:0, inset:0, background: secondary, borderRadius:'3px 3px 0 0' }} />
              </div>
            )}
          </div>
          <span style={{ fontSize:9, color: C.muted, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', width:'100%', textAlign:'center' }}>{d.label}</span>
        </div>
      ))}
    </div>
  )
}

function HBar({ label, value, max, color, sub }) {
  const pct = max ? Math.round((value/max)*100) : 0
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:13, color: C.soft }}>{label}</span>
        <span style={{ fontSize:13, fontWeight:800, color }}>{value}{sub && <span style={{ fontSize:11, color:C.muted, fontWeight:400 }}> {sub}</span>}</span>
      </div>
      <div style={{ height:6, background:`${color}20`, borderRadius:3, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, background: color, borderRadius:3, transition:'width 0.5s' }} />
      </div>
    </div>
  )
}

/* ── KPI card ───────────────────────────────────────────────────── */
function KPI({ label, value, sub, color, Icon, delta }) {
  return (
    <div style={{ background: C.surface, borderRadius:16, padding:'22px 24px', border:`1px solid ${color}22`, display:'flex', flexDirection:'column', gap:10, flex:1 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:11, fontWeight:700, color: C.muted, textTransform:'uppercase', letterSpacing:1 }}>{label}</span>
        <div style={{ width:34, height:34, borderRadius:10, background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon size={17} color={color} />
        </div>
      </div>
      <span style={{ fontSize:30, fontWeight:900, color, lineHeight:1 }}>{value}</span>
      {sub && <span style={{ fontSize:12, color: C.muted }}>{sub}</span>}
    </div>
  )
}

/* ── Sidebar ────────────────────────────────────────────────────── */
const NAV = [
  { id:'dashboard', label:'Dashboard', Icon: LayoutDashboard },
  { id:'clients',   label:'Clientes',  Icon: Users },
  { id:'settings',  label:'Configurações', Icon: Settings },
]

function Sidebar({ active, setActive, onLogout }) {
  return (
    <aside style={{
      position:'fixed', left:0, top:0, bottom:0, width: SIDEBAR,
      background: C.side, borderRight:`1px solid ${C.border}`,
      display:'flex', flexDirection:'column', zIndex:100,
    }}>
      {/* logo */}
      <div style={{ padding:'20px 20px 16px', borderBottom:`1px solid ${C.border}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <img src="/cupido.png" alt="" style={{ width:36, height:36, objectFit:'contain' }} />
          <div>
            <p style={{ margin:0, fontSize:15, fontWeight:900, color: C.text }}>Cupid</p>
            <p style={{ margin:0, fontSize:10, color: C.muted }}>Admin Panel</p>
          </div>
        </div>
      </div>

      {/* nav */}
      <nav style={{ flex:1, padding:'12px 10px', display:'flex', flexDirection:'column', gap:2 }}>
        {NAV.map(({ id, label, Icon }) => {
          const on = active === id
          return (
            <button key={id} onClick={() => setActive(id)} style={{
              display:'flex', alignItems:'center', gap:10, padding:'10px 14px',
              borderRadius:10, cursor:'pointer', border:'none', textAlign:'left', width:'100%',
              background: on ? `${C.purple}20` : 'transparent',
              color: on ? C.purpleL : C.soft,
              fontWeight: on ? 700 : 500, fontSize:14,
              transition:'all 0.15s',
            }}>
              <Icon size={17} />
              {label}
              {on && <ChevronRight size={14} style={{ marginLeft:'auto' }} />}
            </button>
          )
        })}
      </nav>

      {/* logout */}
      <div style={{ padding:'12px 10px', borderTop:`1px solid ${C.border}` }}>
        <button onClick={onLogout} style={{
          display:'flex', alignItems:'center', gap:10, padding:'10px 14px',
          borderRadius:10, cursor:'pointer', border:'none', width:'100%',
          background:'transparent', color: C.red, fontWeight:600, fontSize:14,
        }}>
          <LogOut size={17} />
          Sair
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
          padding:'6px 14px', borderRadius:8, cursor:'pointer', fontSize:12, fontWeight:700, border:'none',
          background: period===key ? C.purple : C.surface,
          color: period===key ? 'white' : C.soft,
          border: period===key ? 'none' : `1px solid ${C.border}`,
          transition:'all 0.15s',
        }}>{label}</button>
      ))}
      {period === 'custom' && (
        <>
          <input type="date" value={customFrom} onChange={e=>setCustomFrom(e.target.value)}
            style={{ background:C.surface, border:`1px solid ${C.border}`, color:C.text, borderRadius:8, padding:'5px 10px', fontSize:12, outline:'none' }} />
          <span style={{ color:C.muted, fontSize:12 }}>até</span>
          <input type="date" value={customTo} onChange={e=>setCustomTo(e.target.value)}
            style={{ background:C.surface, border:`1px solid ${C.border}`, color:C.text, borderRadius:8, padding:'5px 10px', fontSize:12, outline:'none' }} />
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
  timeline:  { label:'Linha do Tempo',    Icon: Calendar, color:'#3b82f6' },
  stars:     { label:'Mapa das Estrelas', Icon: Star,     color:'#f59e0b' },
  gallery:   { label:'Galeria',           Icon: Camera,   color:'#10b981' },
  words:     { label:'Jogo de Palavras',  Icon: Gamepad2, color:'#a78bfa' },
  map:       { label:'Jornada no Mapa',   Icon: Globe,    color:'#06b6d4' },
  roulette:  { label:'Roleta Surpresa',   Icon: Gift,     color:'#ef4444' },
}

function DashboardView({ sites, price, period, setPeriod, customFrom, setCustomFrom, customTo, setCustomTo, funnelEvents }) {
  const { from, to } = getPeriod(period, customFrom, customTo)

  // filter by creation date
  const inPeriod = useMemo(() => filterSites(sites, period, 'created_at', customFrom, customTo), [sites, period, customFrom, customTo])
  // paid in period (by paid_at)
  const paidInPeriod = useMemo(() => filterSites(sites.filter(s=>s.paid), period, 'paid_at', customFrom, customTo), [sites, period, customFrom, customTo])

  const revenue = paidInPeriod.length * price
  const convRate = inPeriod.length ? Math.round((paidInPeriod.length/inPeriod.length)*100) : 0

  // daily chart data
  const dailyData = useMemo(() => {
    const days = period === 'today' ? 1 : period === 'week' ? 7 : period === 'month' ? 30 : Math.min(30, Math.ceil((to-from)/(1000*60*60*24))+1)
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(to); d.setDate(d.getDate() - (days-1-i)); d.setHours(0,0,0,0)
      const end = new Date(d); end.setHours(23,59,59,999)
      const reg = sites.filter(s => { const t = new Date(s.created_at); return t>=d && t<=end }).length
      const paid = sites.filter(s => s.paid && s.paid_at && (()=>{ const t=new Date(s.paid_at); return t>=d && t<=end })()).length
      return { label: fmtShort(d), value: reg, value2: paid }
    })
  }, [sites, period, from, to])

  // funnel events in period
  const funnelInPeriod = useMemo(() => {
    if (!funnelEvents.length) return {}
    return funnelEvents
      .filter(e => { const d=new Date(e.created_at); return d>=from && d<=to })
      .reduce((acc, e) => { acc[e.step]=(acc[e.step]||0)+1; return acc }, {})
  }, [funnelEvents, from, to])

  const maxStep = Math.max(...Object.values(funnelInPeriod), 1)
  const funnelSteps = STEP_ORDER.filter(s => funnelInPeriod[s])

  // sections from quiz_data
  const sectionCounts = useMemo(() => {
    const counts = {}
    sites.forEach(s => { (s.quiz_data?.wrappedSections||[]).forEach(sec => { counts[sec]=(counts[sec]||0)+1 }) })
    return counts
  }, [sites])
  const maxSec = Math.max(...Object.values(sectionCounts), 1)

  // recent 5 paid
  const recent = useMemo(() => sites.filter(s=>s.paid).slice(0,5), [sites])

  // peak hours
  const hourCounts = useMemo(() => {
    const h = Array(24).fill(0)
    paidInPeriod.forEach(s => { if (s.paid_at) h[new Date(s.paid_at).getHours()]++ })
    return h
  }, [paidInPeriod])
  const peakHours = hourCounts.map((v,i) => ({ label:`${i}h`, value:v }))

  const card = { background:C.surface, borderRadius:16, border:`1px solid ${C.border}`, padding:24 }
  const cardTitle = { margin:'0 0 18px', fontSize:14, fontWeight:800, color:C.text }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>

      {/* period */}
      <PeriodBar period={period} setPeriod={setPeriod} customFrom={customFrom} setCustomFrom={setCustomFrom} customTo={customTo} setCustomTo={setCustomTo} />

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
        <KPI label="Receita" value={brl(revenue)} sub={`${paidInPeriod.length} venda${paidInPeriod.length!==1?'s':''}`} color={C.green} Icon={DollarSign} />
        <KPI label="PIX gerados" value={inPeriod.length} sub="chegaram ao checkout" color={C.purple} Icon={ShoppingCart} />
        <KPI label="Conversão" value={`${convRate}%`} sub={`${paidInPeriod.length} de ${inPeriod.length} pagaram`} color={C.blue} Icon={Percent} />
        <KPI label="Ticket médio" value={paidInPeriod.length ? brl(revenue/paidInPeriod.length) : '—'} sub="por venda" color={C.amber} Icon={TrendingUp} />
      </div>

      {/* charts row */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16 }}>
        {/* sales over time */}
        <div style={card}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
            <p style={{ margin:0, fontSize:14, fontWeight:800, color:C.text }}>Vendas ao longo do tempo</p>
            <div style={{ display:'flex', gap:12, alignItems:'center' }}>
              <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:C.soft }}><span style={{ width:10,height:10,borderRadius:3,background:C.purple,display:'inline-block' }} /> Registros</span>
              <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:C.soft }}><span style={{ width:10,height:10,borderRadius:3,background:C.green,display:'inline-block' }} /> Pagamentos</span>
            </div>
          </div>
          <BarChart data={dailyData} color={C.purple} secondary={C.green} height={130} />
        </div>

        {/* funnel pix→paid */}
        <div style={card}>
          <p style={cardTitle}>Funil de Conversão</p>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <HBar label="Gerou PIX" value={inPeriod.length} max={Math.max(inPeriod.length,1)} color={C.purple} sub="clientes" />
            <HBar label="Pagou" value={paidInPeriod.length} max={Math.max(inPeriod.length,1)} color={C.green} sub={`(${convRate}%)`} />
            <HBar label="Desistiu" value={Math.max(inPeriod.length-paidInPeriod.length,0)} max={Math.max(inPeriod.length,1)} color={C.red} sub={`(${100-convRate}%)`} />
          </div>
          <div style={{ marginTop:20, padding:'12px 16px', background:`${C.green}10`, borderRadius:10, border:`1px solid ${C.green}25`, textAlign:'center' }}>
            <p style={{ margin:0, fontSize:22, fontWeight:900, color:C.green }}>{convRate}%</p>
            <p style={{ margin:0, fontSize:11, color:C.muted }}>taxa de conversão</p>
          </div>
        </div>
      </div>

      {/* bottom row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>
        {/* quiz funnel */}
        <div style={card}>
          <p style={cardTitle}>Funil do Quiz (onde param)</p>
          {funnelSteps.length === 0 ? (
            <p style={{ color:C.muted, fontSize:13, textAlign:'center', padding:'20px 0' }}>Aguardando dados de visitas…</p>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {funnelSteps.map((step, i) => {
                const count = funnelInPeriod[step] || 0
                const prev = i > 0 ? (funnelInPeriod[funnelSteps[i-1]] || 1) : count
                const drop = i > 0 ? Math.round((1 - count/prev)*100) : 0
                return (
                  <div key={step} style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:10, color:C.muted, width:6 }}>{i+1}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                        <span style={{ fontSize:11, color:C.soft }}>{STEP_NAMES[step]||step}</span>
                        <span style={{ fontSize:11, fontWeight:700, color: drop>30?C.red:drop>15?C.amber:C.green }}>
                          {count}{drop>0&&<span style={{fontSize:9,color:C.muted}}> -{drop}%</span>}
                        </span>
                      </div>
                      <div style={{ height:4, background:`${C.purple}15`, borderRadius:2 }}>
                        <div style={{ height:'100%', width:`${Math.round((count/maxStep)*100)}%`, background:drop>30?C.red:drop>15?C.amber:C.purple, borderRadius:2 }} />
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
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {Object.entries(SECTION_META).map(([id, meta]) => {
              const { Icon, label, color } = meta
              const count = sectionCounts[id] || 0
              return (
                <div key={id} style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center', shrink:0 }}>
                    <Icon size={13} color={color} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ fontSize:12, color:C.soft }}>{label}</span>
                      <span style={{ fontSize:12, fontWeight:800, color }}>{count}</span>
                    </div>
                    <div style={{ height:4, background:`${color}15`, borderRadius:2 }}>
                      <div style={{ height:'100%', width:`${maxSec?Math.round((count/maxSec)*100):0}%`, background:color, borderRadius:2 }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* peak hours */}
        <div style={card}>
          <p style={cardTitle}>Horário de pico (vendas)</p>
          <BarChart data={peakHours.filter((_,i)=>i%2===0).map((d,i)=>({...d,label:`${i*2}h`}))} color={C.amber} height={130} />
          {(() => {
            const peak = hourCounts.indexOf(Math.max(...hourCounts))
            return Math.max(...hourCounts) > 0
              ? <p style={{ margin:'14px 0 0', fontSize:12, color:C.muted, textAlign:'center' }}>Pico: <strong style={{color:C.amber}}>{peak}h–{peak+1}h</strong></p>
              : <p style={{ margin:'14px 0 0', fontSize:12, color:C.muted, textAlign:'center' }}>Sem dados no período</p>
          })()}
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
              const qd = site.quiz_data || {}
              const couple = [qd.myName, qd.partnerName].filter(Boolean).join(' e ') || '—'
              return (
                <div key={site.id} style={{ display:'flex', alignItems:'center', gap:16, padding:'12px 0', borderBottom: i<recent.length-1 ? `1px solid ${C.border}` : 'none' }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:`${C.green}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ fontSize:12, fontWeight:900, color:C.green }}>✓</span>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ margin:0, fontSize:13, fontWeight:700, color:C.text }}>{couple}</p>
                    <p style={{ margin:0, fontSize:11, color:C.muted }}>{maskPhone(site.phone)}</p>
                  </div>
                  <p style={{ margin:0, fontSize:13, fontWeight:800, color:C.green }}>{brl(price)}</p>
                  <p style={{ margin:0, fontSize:11, color:C.muted }}>{fmt(site.paid_at)}</p>
                  <a href={`/${site.phone}`} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize:11, color:C.purpleL, textDecoration:'none', fontWeight:700, background:`${C.purple}15`, border:`1px solid ${C.purple}30`, borderRadius:6, padding:'4px 10px' }}>
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

/* ── Clients view ───────────────────────────────────────────────── */
function ClientsView({ sites, price, period, setPeriod, customFrom, setCustomFrom, customTo, setCustomTo }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const inPeriod = filterSites(sites, period, 'created_at', customFrom, customTo)
  const filtered = inPeriod.filter(s => {
    const q = search.toLowerCase()
    const name = `${s.quiz_data?.myName||''} ${s.quiz_data?.partnerName||''}`.toLowerCase()
    const matchSearch = !q || s.phone.includes(q) || name.includes(q)
    const matchFilter = filter==='all' || (filter==='paid' ? s.paid : !s.paid)
    return matchSearch && matchFilter
  })

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <PeriodBar period={period} setPeriod={setPeriod} customFrom={customFrom} setCustomFrom={setCustomFrom} customTo={customTo} setCustomTo={setCustomTo} />

      {/* toolbar */}
      <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
        <input placeholder="Buscar por telefone ou nome..." value={search} onChange={e=>setSearch(e.target.value)}
          style={{ flex:1, minWidth:260, background:C.surface, border:`1.5px solid ${C.border}`, borderRadius:10, padding:'9px 16px', color:C.text, fontSize:14, outline:'none' }} />
        {[['all','Todos'],['paid','Pagos'],['pending','Pendentes']].map(([f,l])=>(
          <button key={f} onClick={()=>setFilter(f)} style={{
            padding:'8px 18px', borderRadius:10, cursor:'pointer', fontSize:13, fontWeight:700, border:'none',
            background: filter===f ? `${C.purple}25` : C.surface,
            color: filter===f ? C.purpleL : C.muted,
            border: filter===f ? `1.5px solid ${C.purple}` : `1.5px solid ${C.border}`,
          }}>{l}</button>
        ))}
        <span style={{ fontSize:12, color:C.muted }}>{filtered.length} resultado{filtered.length!==1?'s':''}</span>
      </div>

      {/* table */}
      <div style={{ background:C.surface, borderRadius:16, border:`1px solid ${C.border}`, overflow:'hidden' }}>
        <div style={{ display:'grid', gridTemplateColumns:'170px 190px 1fr 110px 150px 150px 90px', background:'#0c0c14', borderBottom:`1px solid ${C.border}` }}>
          {['Telefone','Casal','Título','Status','Cadastro','Pagamento','Ações'].map(h=>(
            <div key={h} style={{ padding:'11px 16px', fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:0.8 }}>{h}</div>
          ))}
        </div>
        {filtered.length===0 && (
          <div style={{ padding:'50px 32px', textAlign:'center' }}>
            <p style={{ color:C.muted, margin:0, fontSize:14 }}>Nenhum cliente encontrado.</p>
          </div>
        )}
        {filtered.map((site,i) => {
          const qd = site.quiz_data||{}
          const couple = [qd.myName, qd.partnerName].filter(Boolean).join(' e ')||'—'
          return (
            <div key={site.id} style={{ display:'grid', gridTemplateColumns:'170px 190px 1fr 110px 150px 150px 90px', borderBottom: i<filtered.length-1 ? `1px solid ${C.border}` : 'none', alignItems:'center', transition:'background 0.12s' }}
              onMouseEnter={e=>e.currentTarget.style.background='#ffffff05'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <div style={{ padding:'14px 16px' }}>
                <p style={{ margin:0, fontSize:12, fontWeight:700, color:C.text, fontFamily:'monospace' }}>{maskPhone(site.phone)}</p>
              </div>
              <div style={{ padding:'14px 16px' }}>
                <p style={{ margin:0, fontSize:12, color:C.soft, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{couple}</p>
              </div>
              <div style={{ padding:'14px 16px' }}>
                <p style={{ margin:0, fontSize:12, color:C.muted, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{qd.title||'—'}</p>
              </div>
              <div style={{ padding:'14px 16px' }}>
                <span style={{ fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:20, background: site.paid?`${C.green}18`:`${C.amber}18`, color: site.paid?C.green:C.amber, border:`1px solid ${site.paid?C.green:C.amber}30` }}>
                  {site.paid?'Pago':'Pendente'}
                </span>
              </div>
              <div style={{ padding:'14px 16px' }}><p style={{ margin:0, fontSize:11, color:C.muted }}>{fmt(site.created_at)}</p></div>
              <div style={{ padding:'14px 16px' }}><p style={{ margin:0, fontSize:11, color:site.paid_at?C.green:C.muted }}>{fmt(site.paid_at)}</p></div>
              <div style={{ padding:'14px 16px' }}>
                <a href={`/${site.phone}`} target="_blank" rel="noopener noreferrer"
                  style={{ background:`${C.purple}20`, color:C.purpleL, border:`1px solid ${C.purple}40`, borderRadius:7, padding:'4px 10px', fontSize:11, fontWeight:700, textDecoration:'none' }}>
                  Ver ↗
                </a>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Settings view ──────────────────────────────────────────────── */
function SettingsView({ price, onPriceChange }) {
  const [priceInput, setPriceInput]   = useState(String(price).replace('.', ','))
  const [pixelId,    setPixelId]      = useState('')
  const [freePhone,  setFreePhone]    = useState('')
  const [status, setStatus]           = useState({}) // { price, pixel, free }
  const [freeLink,   setFreeLink]     = useState(null)

  useEffect(() => {
    getAppConfig('pixel_id').then(v => { if (v) setPixelId(v) })
    getAppConfig('price').then(v => { if (v) setPriceInput(String(parseFloat(v)).replace('.', ',')) })
  }, [])

  const save = async (key, value, field) => {
    setStatus(s => ({ ...s, [field]:'saving' }))
    try {
      await setAppConfig(key, value)
      if (key==='price') onPriceChange(parseFloat(value.replace(',','.')))
      setStatus(s => ({ ...s, [field]:'saved' }))
      setTimeout(() => setStatus(s => ({ ...s, [field]:null })), 2500)
    } catch {
      setStatus(s => ({ ...s, [field]:'error' }))
    }
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

  const inp = { background:C.surface, border:`1.5px solid ${C.border}`, borderRadius:10, padding:'10px 16px', color:C.text, fontSize:14, outline:'none', boxSizing:'border-box' }
  const btn = (col=C.purple) => ({ background:`${col}20`, border:`1px solid ${col}40`, color:col, borderRadius:10, padding:'10px 20px', cursor:'pointer', fontSize:13, fontWeight:700, whiteSpace:'nowrap' })
  const card = { background:C.surface, borderRadius:16, border:`1px solid ${C.border}`, padding:28 }
  const cardTitle = (col=C.text) => ({ margin:'0 0 6px', fontSize:16, fontWeight:900, color:col })
  const cardSub   = { margin:'0 0 20px', fontSize:13, color:C.muted }
  const label     = { margin:'0 0 6px', fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:1, display:'block' }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24, maxWidth:720 }}>

      {/* price */}
      <div style={card}>
        <p style={cardTitle()}>Preço do produto</p>
        <p style={cardSub}>Valor usado nos cálculos de receita do dashboard. Altere aqui e o dashboard atualiza na hora.</p>
        <span style={label}>Preço base (R$)</span>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <input style={{ ...inp, width:160 }} value={priceInput} onChange={e=>setPriceInput(e.target.value)} placeholder="19,90" />
          <button style={btn(C.green)} onClick={() => save('price', priceInput, 'price')}>
            {status.price==='saving'?'Salvando…':status.price==='saved'?'✓ Salvo':'Salvar'}
          </button>
        </div>
        {status.price==='error' && <p style={{ color:C.red, fontSize:12, marginTop:8 }}>Erro ao salvar.</p>}
      </div>

      {/* pixel */}
      <div style={card}>
        <p style={cardTitle()}>Facebook / Meta Pixel</p>
        <p style={cardSub}>
          Ao salvar o ID aqui, o pixel é injetado automaticamente em todas as visitas dos clientes.<br/>
          Eventos: <strong style={{color:C.purpleL}}>InitiateCheckout</strong> (chega no pagamento) · <strong style={{color:C.green}}>Purchase</strong> (PIX confirmado)
        </p>
        <span style={label}>Pixel ID</span>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <input style={{ ...inp, flex:1 }} value={pixelId} onChange={e=>setPixelId(e.target.value)} placeholder="Ex: 1234567890123456" />
          <button style={btn()} onClick={() => save('pixel_id', pixelId.trim(), 'pixel')}>
            {status.pixel==='saving'?'Salvando…':status.pixel==='saved'?'✓ Salvo':'Salvar'}
          </button>
        </div>
        {status.pixel==='error' && <p style={{ color:C.red, fontSize:12, marginTop:8 }}>Erro ao salvar. Verifique o Supabase (tabela app_config).</p>}
        <div style={{ marginTop:18, background:C.bg, borderRadius:10, padding:'12px 18px', fontFamily:'monospace', fontSize:12, color:'#86efac', lineHeight:2 }}>
          {'-- Execute no Supabase SQL Editor:'}<br/>
          {'create table app_config (key text primary key, value text);'}<br/>
          {'create table funnel_events (id bigint generated always as identity primary key, step text not null, created_at timestamptz default now());'}
        </div>
      </div>

      {/* free link */}
      <div style={card}>
        <p style={cardTitle(C.green)}>Gerar link gratuito</p>
        <p style={cardSub}>Cria um site já marcado como pago. Útil para testes, demonstrações ou clientes especiais.</p>
        <span style={label}>WhatsApp (DDD + número, 11 dígitos)</span>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <input style={{ ...inp, flex:1 }} value={freePhone} onChange={e=>setFreePhone(e.target.value.replace(/\D/g,''))} placeholder="Ex: 31999991234" maxLength={11} />
          <button style={btn(C.green)} disabled={freePhone.replace(/\D/g,'').length<10} onClick={genFree}>
            {status.free==='loading'?'Gerando…':'Gerar link'}
          </button>
        </div>
        {freeLink && (
          <div style={{ marginTop:16, background:`${C.green}12`, border:`1px solid ${C.green}30`, borderRadius:10, padding:'14px 18px', display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
            <span style={{ fontSize:13, color:C.green, fontFamily:'monospace', flex:1, wordBreak:'break-all' }}>{freeLink}</span>
            <button onClick={()=>navigator.clipboard.writeText(freeLink)}
              style={{ background:`${C.green}20`, border:`1px solid ${C.green}40`, color:C.green, borderRadius:8, padding:'6px 14px', cursor:'pointer', fontSize:12, fontWeight:700 }}>Copiar</button>
            <a href={freeLink} target="_blank" rel="noopener noreferrer"
              style={{ background:`${C.purple}20`, border:`1px solid ${C.purple}40`, color:C.purpleL, borderRadius:8, padding:'6px 14px', fontSize:12, fontWeight:700, textDecoration:'none' }}>Abrir ↗</a>
          </div>
        )}
        {status.free==='error' && <p style={{ color:C.red, fontSize:12, marginTop:8 }}>Erro ao criar. Verifique o Supabase.</p>}
      </div>
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
      const [s, fe, p] = await Promise.all([
        getAllSites(),
        getFunnelEvents(from, to),
        getAppConfig('price'),
      ])
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

  if (loading) return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', color:C.muted, fontFamily:'system-ui, sans-serif' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:40, height:40, border:`3px solid ${C.border}`, borderTop:`3px solid ${C.purple}`, borderRadius:'50%', margin:'0 auto 16px', animation:'spin 1s linear infinite' }} />
        <p style={{ margin:0, fontSize:14 }}>Carregando painel…</p>
      </div>
    </div>
  )

  if (error) return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'system-ui, sans-serif' }}>
      <div style={{ background:C.surface, borderRadius:20, padding:40, maxWidth:500, textAlign:'center', border:`1px solid ${C.red}30` }}>
        <p style={{ color:C.red, fontWeight:800, fontSize:18, marginBottom:12 }}>Banco de dados não configurado</p>
        <p style={{ color:C.soft, fontSize:13, lineHeight:1.8, marginBottom:20 }}>Acesse <strong style={{color:C.purpleL}}>Vercel → Settings → Environment Variables</strong> e adicione:</p>
        <div style={{ background:C.bg, borderRadius:10, padding:'14px 20px', display:'inline-block', fontFamily:'monospace', fontSize:13, color:'#86efac', lineHeight:2.2, textAlign:'left' }}>
          VITE_SUPABASE_URL = https://xxxx.supabase.co<br />
          VITE_SUPABASE_ANON_KEY = eyJhbGciOi...
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Sidebar active={nav} setActive={setNav} onLogout={handleLogout} />

      {/* main */}
      <div style={{ marginLeft: SIDEBAR, minHeight:'100vh', display:'flex', flexDirection:'column' }}>
        {/* topbar */}
        <header style={{ background:C.side, borderBottom:`1px solid ${C.border}`, padding:'0 32px', height:62, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
          <div>
            <p style={{ margin:0, fontSize:18, fontWeight:900, color:C.text }}>{pageTitle}</p>
            <p style={{ margin:0, fontSize:11, color:C.muted }}>{sites.length} cliente{sites.length!==1?'s':''} · {totalPaid} pago{totalPaid!==1?'s':''} · {brl(totalPaid*price)} arrecadados</p>
          </div>
          <button onClick={load} style={{ background:'transparent', border:`1px solid ${C.border}`, color:C.muted, borderRadius:8, padding:'7px 16px', cursor:'pointer', fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
            <RefreshCw size={14} /> Atualizar
          </button>
        </header>

        {/* content */}
        <main style={{ flex:1, padding:'28px 32px', maxWidth:1400, width:'100%', margin:'0 auto', boxSizing:'border-box' }}>
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
        ::-webkit-scrollbar-thumb { background: #2a2a3d; border-radius: 3px }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5) }
      `}</style>
    </div>
  )
}
