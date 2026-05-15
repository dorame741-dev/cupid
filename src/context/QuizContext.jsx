import { createContext, useContext, useState } from 'react'

const QuizContext = createContext(null)

const DEFAULT_DATA = {
  myName: '',
  partnerName: '',
  relationshipStart: '',
  relationshipTime: '',
  city: '',
  title: '',
  music: null,
  photos: [],
  message: '',
  audio: null,
  wrappedSections: [],
  roletaTheme: 'rosa',
  roletaQuestion: '',
  roletaOptions: ['', ''],
  mapaTitle: 'Nossa Jornada no Mapa',
  mapaSubtitle: 'Lugares que marcaram nossa história',
  mapaPlaces: [],
  galeriaPhotos: [],
  galeriaStyle: 'cards',
  jogoWord: '',
  jogoDica: '',
  jogoMensagem: '',
  timelineTitle: 'Nossa Jornada',
  timelineSubtitle: 'Cada momento que nos trouxe até aqui.',
  timelineClosing: 'E estamos apenas começando!',
  timelineMoments: [],
  estrelaTexto: '',
  estrelaCity: '',
  coverPhoto: null,
  coverPhotoUrl: '',
  counterTexts: {
    sectionTitle: 'Sobre o casal',
    coupleName: '',
    sinceLabel: 'Juntos desde',
  },
}

function loadInitialData() {
  try {
    const saved    = sessionStorage.getItem('editData')
    const isDemo   = sessionStorage.getItem('demoMode') === 'true'
    if (saved || isDemo) {
      sessionStorage.removeItem('editData')
      sessionStorage.removeItem('demoMode')
      const base = saved ? { ...DEFAULT_DATA, ...JSON.parse(saved) } : { ...DEFAULT_DATA }
      return isDemo ? { ...base, __demoMode: true } : base
    }
  } catch {}
  return DEFAULT_DATA
}

export function QuizProvider({ children }) {
  const [data, setData] = useState(loadInitialData)

  const update = (fields) => setData(prev => ({ ...prev, ...fields }))

  return (
    <QuizContext.Provider value={{ data, update }}>
      {children}
    </QuizContext.Provider>
  )
}

export function useQuiz() {
  return useContext(QuizContext)
}
