import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import QuizGame from './quiz/QuizGame.tsx'

// Vercel réécrit toutes les URL vers "/" : on aiguille ici selon le chemin.
//   /             → jeu « Les Gardiens du Lagon » (quiz + collection de cartes de la classe)
//   /projets      → ancien catalogue de vote des 5 idées
//   /presentation → diaporama de l'atelier
const Presentation = lazy(() => import('./presentation/Presentation.tsx'))
const Projets = lazy(() => import('./App.tsx'))
const path = window.location.pathname.replace(/\/+$/, '')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {path === '/presentation' ? (
      <Suspense fallback={null}>
        <Presentation />
      </Suspense>
    ) : path === '/projets' ? (
      <Suspense fallback={null}>
        <Projets />
      </Suspense>
    ) : (
      <QuizGame />
    )}
  </StrictMode>,
)
