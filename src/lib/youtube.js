const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY

export async function searchMusic(query) {
  if (!query.trim()) return []
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&q=${encodeURIComponent(query)}&key=${API_KEY}&maxResults=8`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Erro na busca')
  const data = await res.json()
  return data.items.map(item => ({
    id: item.id.videoId,
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    thumbnail: `https://img.youtube.com/vi/${item.id.videoId}/hqdefault.jpg`,
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
  }))
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
  {
    id: '450p7goxZqg',
    title: 'All of Me',
    channel: 'John Legend',
    thumbnail: 'https://img.youtube.com/vi/450p7goxZqg/hqdefault.jpg',
  },
  {
    id: 'rtOvBOTyX00',
    title: 'A Thousand Years',
    channel: 'Christina Perri',
    thumbnail: 'https://img.youtube.com/vi/rtOvBOTyX00/hqdefault.jpg',
  },
  {
    id: '2Vv-BfVoq4g',
    title: 'Perfect',
    channel: 'Ed Sheeran',
    thumbnail: 'https://img.youtube.com/vi/2Vv-BfVoq4g/hqdefault.jpg',
  },
]
