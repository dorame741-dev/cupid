const INNERTUBE_CONTEXT = {
  client: {
    clientName: 'WEB',
    clientVersion: '2.20240101.00.00',
    hl: 'pt',
    gl: 'BR',
  },
}

const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

export async function searchMusic(query) {
  if (!query.trim()) return []

  const key = query.trim().toLowerCase()
  const cached = cache.get(key)
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data

  const res = await fetch('/api/innertube', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      params: 'EgIQAQ%3D%3D', // filtro: apenas músicas
      context: INNERTUBE_CONTEXT,
    }),
  })

  if (!res.ok) throw new Error('Erro na busca')
  const data = await res.json()
  const results = parseResults(data)

  cache.set(key, { data: results, ts: Date.now() })
  return results
}

function parseResults(data) {
  const contents =
    data?.contents
      ?.twoColumnSearchResultsRenderer
      ?.primaryContents
      ?.sectionListRenderer
      ?.contents?.[0]
      ?.itemSectionRenderer
      ?.contents

  if (!contents) return []

  return contents
    .filter(item => item.videoRenderer)
    .slice(0, 8)
    .map(item => {
      const v = item.videoRenderer
      const id = v.videoId
      return {
        id,
        title: v.title?.runs?.[0]?.text ?? 'Sem título',
        channel: v.ownerText?.runs?.[0]?.text ?? 'Desconhecido',
        thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
        url: `https://www.youtube.com/watch?v=${id}`,
      }
    })
}

// Carrega a YouTube IFrame API uma única vez
export function loadYTAPI() {
  return new Promise((resolve) => {
    if (window.YT?.Player) return resolve()
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve() }
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const s = document.createElement('script')
      s.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(s)
    }
  })
}

// Músicas românticas padrão (usadas quando nenhuma é selecionada)
export const DEFAULT_SONGS = [
  { id: '450p7goxZqg', title: 'All of Me', channel: 'John Legend',     thumbnail: 'https://img.youtube.com/vi/450p7goxZqg/hqdefault.jpg' },
  { id: 'rtOvBOTyX00', title: 'A Thousand Years', channel: 'Christina Perri', thumbnail: 'https://img.youtube.com/vi/rtOvBOTyX00/hqdefault.jpg' },
  { id: '2Vv-BfVoq4g', title: 'Perfect', channel: 'Ed Sheeran',        thumbnail: 'https://img.youtube.com/vi/2Vv-BfVoq4g/hqdefault.jpg' },
]
