import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Vercel réécrit toutes les URL vers "/" : on aiguille ici selon le chemin.
const Presentation = lazy(() => import('./presentation/Presentation.tsx'))
const isPresentation = window.location.pathname.replace(/\/+$/, '') === '/presentation'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isPresentation ? (
      <Suspense fallback={null}>
        <Presentation />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
)
