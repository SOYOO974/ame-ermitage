import { StrictMode, Suspense, lazy, type ComponentType } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import QuizGame from './quiz/QuizGame.tsx'
import { loadStoredQuestions } from './quiz/remoteQuestions.ts'

// Vercel réécrit toutes les URL vers "/" (sauf /api) : on aiguille ici selon le chemin.
//   /             → jeu « Les Gardiens du Lagon » (quiz + collection de cartes de la classe)
//   /projets      → ancien catalogue de vote des 5 idées
//   /presentation → diaporama de l'atelier
//   /admin        → back-office des questions (enseignants, équipe AME)
const Presentation = lazy(() => import('./presentation/Presentation.tsx'))
const Projets = lazy(() => import('./App.tsx'))
const Admin = lazy(() => import('./admin/Admin.tsx'))
const path = window.location.pathname.replace(/\/+$/, '')
const PAGES: Record<string, ComponentType | undefined> = { '/presentation': Presentation, '/projets': Projets, '/admin': Admin }
const Page = PAGES[path]

if (!Page) loadStoredQuestions()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {Page ? (
      <Suspense fallback={null}>
        <Page />
      </Suspense>
    ) : (
      <QuizGame />
    )}
  </StrictMode>,
)
