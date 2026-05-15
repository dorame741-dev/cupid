const QR_PH = `https://api.qrserver.com/v1/create-qr-code/?size=72x72&data=https://meupresente.app&color=000000&bgcolor=FFFFFF`

/* ── Thumbnails (selector) ───────────────────────────────────── */
export function QRThumb0() {
  return (
    <div style={{width:96,height:130,background:'#fff',border:'2px solid #f3e8ff',borderRadius:14,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:5,padding:8,position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:4,left:4,fontSize:9,color:'#d1d5db'}}>♥ ♥</div>
      <div style={{position:'absolute',top:4,right:4,fontSize:9,color:'#d1d5db'}}>♥ ♥</div>
      <img src={QR_PH} width={68} height={68} alt="" style={{borderRadius:6}} />
      <p style={{fontSize:9,color:'#7c3aed',fontWeight:700,letterSpacing:0.5,margin:0}}>ESCANEIE AQUI</p>
    </div>
  )
}
export function QRThumb1() {
  return (
    <div style={{width:96,height:130,background:'linear-gradient(150deg,#be123c,#9f1239,#7f1d1d)',borderRadius:14,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:4,padding:8,overflow:'hidden',position:'relative'}}>
      {['9%','85%','15%','90%'].map((t,i) => (
        <span key={i} style={{position:'absolute',top:t,left:['8%','75%','60%','20%'][i],fontSize:10,color:'rgba(255,255,255,0.3)',pointerEvents:'none'}}>♥</span>
      ))}
      <span style={{fontSize:10,color:'rgba(255,255,255,0.9)',fontFamily:'cursive',textAlign:'center',lineHeight:1.3,position:'relative',zIndex:1}}>Te amo para<br/>sempre ♥</span>
      <div style={{background:'white',borderRadius:8,padding:3,zIndex:1}}><img src={QR_PH} width={60} height={60} alt="" /></div>
      <span style={{fontSize:8,color:'rgba(255,255,255,0.7)',letterSpacing:1,zIndex:1}}>SURPRESA ESPECIAL</span>
    </div>
  )
}
export function QRThumb2() {
  return (
    <div style={{width:96,height:130,background:'linear-gradient(150deg,#fce7f3,#fbcfe8,#f9a8d4)',borderRadius:14,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:4,padding:8,position:'relative',overflow:'hidden'}}>
      <span style={{position:'absolute',top:5,right:6,fontSize:11,color:'#db2777',opacity:0.5}}>♥</span>
      <span style={{position:'absolute',bottom:8,left:7,fontSize:8,color:'#db2777',opacity:0.4}}>♥♥</span>
      <span style={{fontSize:9,color:'#be185d',fontFamily:'cursive',textAlign:'center',lineHeight:1.3,zIndex:1}}>Uma surpresa<br/>só para você</span>
      <div style={{background:'white',borderRadius:8,padding:3,border:'2px solid #fbcfe8',zIndex:1}}>
        <img src={QR_PH} width={56} height={56} alt="" />
      </div>
      <span style={{fontSize:10,color:'#be185d',zIndex:1}}>♥ ♥ ♥</span>
    </div>
  )
}
export function QRThumb3() {
  return (
    <div style={{width:96,height:130,background:'linear-gradient(150deg,#1c1917,#292524)',borderRadius:14,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:4,padding:8,position:'relative',overflow:'hidden',border:'1px solid rgba(255,255,255,0.08)'}}>
      <span style={{position:'absolute',top:5,right:6,fontSize:9,color:'rgba(251,191,36,0.4)'}}>♥</span>
      <span style={{position:'absolute',bottom:8,left:6,fontSize:7,color:'rgba(251,191,36,0.3)'}}>♥♥</span>
      <span style={{fontSize:9,color:'rgba(251,191,36,0.9)',fontFamily:'cursive',textAlign:'center',lineHeight:1.3,zIndex:1,letterSpacing:0.5}}>Eterno amor</span>
      <div style={{background:'white',borderRadius:8,padding:3,boxShadow:'0 0 12px rgba(251,191,36,0.3)',zIndex:1}}><img src={QR_PH} width={56} height={56} alt="" /></div>
      <span style={{fontSize:8,color:'rgba(251,191,36,0.7)',letterSpacing:1.5,zIndex:1}}>FOR YOU ♥</span>
    </div>
  )
}

export const QR_TEMPLATES = [
  { id:0, Component:QRThumb0, label:'GRÁTIS',  price:0 },
  { id:1, Component:QRThumb1, label:'R$ 4,90', price:4.90 },
  { id:2, Component:QRThumb2, label:'R$ 4,90', price:4.90 },
  { id:3, Component:QRThumb3, label:'R$ 4,90', price:4.90 },
]

/* ── Full-size QR card (entregável) ──────────────────────────── */
export function SiteQRCard({ style = 0, siteUrl }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(siteUrl)}&color=000000&bgcolor=FFFFFF&margin=6`
  if (style === 0 || style == null) return (
    <div style={{background:'#fff',border:'2px solid #f3e8ff',borderRadius:18,padding:18,display:'flex',flexDirection:'column',alignItems:'center',gap:10,width:210,position:'relative'}}>
      <div style={{position:'absolute',top:8,left:10,fontSize:12,color:'#d8b4fe',opacity:0.6}}>♥ ♥</div>
      <div style={{position:'absolute',top:8,right:10,fontSize:12,color:'#d8b4fe',opacity:0.6}}>♥ ♥</div>
      <img src={qrUrl} width={160} height={160} alt="QR" style={{borderRadius:10}} />
      <p style={{fontSize:11,color:'#7c3aed',fontWeight:700,letterSpacing:1,margin:0}}>ESCANEIE PARA ABRIR</p>
    </div>
  )
  if (style === 1) return (
    <div style={{background:'linear-gradient(150deg,#be123c,#9f1239,#7f1d1d)',borderRadius:18,padding:18,display:'flex',flexDirection:'column',alignItems:'center',gap:10,width:210,position:'relative',overflow:'hidden'}}>
      {['8%','88%','20%','82%'].map((t,i)=>(
        <span key={i} style={{position:'absolute',top:t,left:['6%','72%','65%','12%'][i],fontSize:14,color:'rgba(255,255,255,0.15)'}}>♥</span>
      ))}
      <p style={{fontSize:14,color:'white',fontFamily:'cursive',textAlign:'center',lineHeight:1.4,zIndex:1,margin:0}}>Te amo para sempre ♥</p>
      <div style={{background:'white',borderRadius:12,padding:6,zIndex:1}}><img src={qrUrl} width={148} height={148} alt="QR" /></div>
      <p style={{fontSize:10,color:'rgba(255,255,255,0.8)',letterSpacing:2,zIndex:1,margin:0}}>ESCANEIE AQUI ♥</p>
    </div>
  )
  if (style === 2) return (
    <div style={{background:'linear-gradient(150deg,#fce7f3,#fbcfe8,#f9a8d4)',borderRadius:18,padding:18,display:'flex',flexDirection:'column',alignItems:'center',gap:10,width:210,position:'relative',overflow:'hidden'}}>
      <span style={{position:'absolute',top:8,right:10,fontSize:16,color:'#db2777',opacity:0.4}}>♥</span>
      <span style={{position:'absolute',bottom:10,left:10,fontSize:12,color:'#db2777',opacity:0.3}}>♥♥</span>
      <p style={{fontSize:13,color:'#be185d',fontFamily:'cursive',textAlign:'center',lineHeight:1.4,zIndex:1,margin:0}}>Uma surpresa especial para você</p>
      <div style={{background:'white',borderRadius:12,padding:6,border:'2px solid #fbcfe8',zIndex:1}}>
        <img src={qrUrl} width={148} height={148} alt="QR" />
      </div>
      <p style={{fontSize:14,color:'#db2777',zIndex:1,margin:0}}>♥ ♥ ♥</p>
    </div>
  )
  return (
    <div style={{background:'linear-gradient(150deg,#1c1917,#292524)',borderRadius:18,padding:18,display:'flex',flexDirection:'column',alignItems:'center',gap:10,width:210,border:'1px solid rgba(255,255,255,0.08)',position:'relative',overflow:'hidden'}}>
      <span style={{position:'absolute',top:8,right:10,fontSize:12,color:'rgba(251,191,36,0.3)'}}>♥</span>
      <span style={{position:'absolute',bottom:10,left:10,fontSize:10,color:'rgba(251,191,36,0.2)'}}>♥♥</span>
      <p style={{fontSize:12,color:'rgba(251,191,36,0.85)',fontFamily:'cursive',textAlign:'center',lineHeight:1.4,letterSpacing:0.5,zIndex:1,margin:0}}>Eterno amor ♥</p>
      <div style={{background:'white',borderRadius:12,padding:6,boxShadow:'0 0 20px rgba(251,191,36,0.2)',zIndex:1}}><img src={qrUrl} width={148} height={148} alt="QR" /></div>
      <p style={{fontSize:10,color:'rgba(251,191,36,0.7)',letterSpacing:2,zIndex:1,margin:0}}>FOR YOU ♥</p>
    </div>
  )
}
