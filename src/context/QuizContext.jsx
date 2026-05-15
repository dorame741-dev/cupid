import { createContext, useContext, useState } from 'react'

const QuizContext = createContext(null)

export function QuizProvider({ children }) {
  const [data, setData] = useState({
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
  })

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
