import { useState } from 'react'
import { QuizProvider, useQuiz } from './context/QuizContext'
import TopBanner from './components/TopBanner'
import StepIntroNames from './steps/StepIntroNames'
import StepIntroDate from './steps/StepIntroDate'
import Step1Title from './steps/Step1Title'
import Step2Music from './steps/Step2Music'
import Step3Photos from './steps/Step3Photos'
import Step4Message from './steps/Step4Message'
import Step5CoverPhoto from './steps/Step5CoverPhoto'
import Step6CounterTexts from './steps/Step6CounterTexts'
import StepUpsell from './steps/StepUpsell'
import StepWrapped from './steps/StepWrapped'
import StepRoleta from './steps/StepRoleta'
import StepMapa from './steps/StepMapa'
import StepGaleria from './steps/StepGaleria'
import StepJogoPalavra from './steps/StepJogoPalavra'
import StepTimeline from './steps/StepTimeline'
import StepEstrelas from './steps/StepEstrelas'
import StepPagamento from './steps/StepPagamento'
import SitePreview from './components/SitePreview'
import './index.css'

const STEPS = [
  'intro-names', 'intro-date',
  'step1-title', 'step2-music', 'step3-photos', 'step4-message',
  'step5-cover', 'step6-counter',
  'upsell', 'step-wrapped', 'step-roleta', 'step-mapa', 'step-galeria', 'step-jogo', 'step-timeline', 'step-estrelas', 'step-pagamento', 'final-preview',
]

function AppContent() {
  const [stepIdx, setStepIdx] = useState(0)
  const [quizData, setQuizData] = useState({})
  const { data } = useQuiz()
  const next    = () => setStepIdx(i => Math.min(i + 1, STEPS.length - 1))
  const back    = () => setStepIdx(i => Math.max(i - 1, 0))
  const skipTo  = (name) => setStepIdx(STEPS.indexOf(name))
  const step    = STEPS[stepIdx]

  const sel = data.wrappedSections

  const nextStep = (after) => {
    const order = ['roulette', 'map', 'gallery', 'words', 'timeline', 'stars']
    const fromIdx = after ? order.indexOf(after) : -1
    const found = order.slice(fromIdx + 1).find(s => sel.includes(s))
    const dest = { roulette: 'step-roleta', map: 'step-mapa', gallery: 'step-galeria', words: 'step-jogo', timeline: 'step-timeline', stars: 'step-estrelas' }
    skipTo(found ? dest[found] : 'step-pagamento')
  }

  const afterWrapped  = (sections) => nextStep(null)
  const afterRoleta   = () => nextStep('roulette')
  const afterMapa     = () => nextStep('map')
  const afterGaleria  = () => nextStep('gallery')
  const afterJogo     = () => nextStep('words')
  const afterTimeline = () => nextStep('timeline')

  return (
    <div className="phone-shell">
      {step !== 'final-preview' && <TopBanner />}
      <div className="phone-content">
        {step === 'intro-names'   && <StepIntroNames onNext={next} />}
        {step === 'intro-date'    && <StepIntroDate onNext={next} onBack={back} />}
        {step === 'step1-title'   && <Step1Title onNext={next} onBack={back} />}
        {step === 'step2-music'   && <Step2Music onNext={next} onBack={back} />}
        {step === 'step3-photos'  && <Step3Photos onNext={next} onBack={back} />}
        {step === 'step4-message' && <Step4Message onNext={next} onBack={back} />}
        {step === 'step5-cover'   && <Step5CoverPhoto onNext={next} onBack={back} />}
        {step === 'step6-counter' && <Step6CounterTexts onNext={next} onBack={back} />}
        {step === 'upsell'        && <StepUpsell onAccept={next} onDecline={() => skipTo('step-pagamento')} />}
        {step === 'step-wrapped'  && <StepWrapped onNext={(sections) => afterWrapped(sections)} onSkip={() => skipTo('step-pagamento')} />}
        {step === 'step-roleta'   && <StepRoleta onNext={afterRoleta} onBack={() => skipTo('step-wrapped')} />}
        {step === 'step-mapa'     && <StepMapa onNext={afterMapa} onBack={() => sel.includes('roulette') ? skipTo('step-roleta') : skipTo('step-wrapped')} />}
        {step === 'step-galeria'  && <StepGaleria onNext={afterGaleria} onBack={() => sel.includes('map') ? skipTo('step-mapa') : sel.includes('roulette') ? skipTo('step-roleta') : skipTo('step-wrapped')} />}
        {step === 'step-jogo'     && <StepJogoPalavra onNext={afterJogo} onBack={() => sel.includes('gallery') ? skipTo('step-galeria') : sel.includes('map') ? skipTo('step-mapa') : sel.includes('roulette') ? skipTo('step-roleta') : skipTo('step-wrapped')} />}
        {step === 'step-timeline' && <StepTimeline onNext={afterTimeline} onBack={() => sel.includes('words') ? skipTo('step-jogo') : sel.includes('gallery') ? skipTo('step-galeria') : sel.includes('map') ? skipTo('step-mapa') : sel.includes('roulette') ? skipTo('step-roleta') : skipTo('step-wrapped')} />}
        {step === 'step-estrelas' && <StepEstrelas onNext={() => skipTo('step-pagamento')} onBack={() => sel.includes('timeline') ? skipTo('step-timeline') : sel.includes('words') ? skipTo('step-jogo') : sel.includes('gallery') ? skipTo('step-galeria') : sel.includes('map') ? skipTo('step-mapa') : sel.includes('roulette') ? skipTo('step-roleta') : skipTo('step-wrapped')} />}
        {step === 'step-pagamento' && <StepPagamento onNext={() => skipTo('final-preview')} onBack={() => sel.includes('stars') ? skipTo('step-estrelas') : sel.includes('timeline') ? skipTo('step-timeline') : sel.includes('words') ? skipTo('step-jogo') : sel.includes('gallery') ? skipTo('step-galeria') : sel.includes('map') ? skipTo('step-mapa') : sel.includes('roulette') ? skipTo('step-roleta') : skipTo('step-wrapped')} />}
        {step === 'final-preview' && <SitePreview onBack={back} />}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <QuizProvider>
      <AppContent />
    </QuizProvider>
  )
}
