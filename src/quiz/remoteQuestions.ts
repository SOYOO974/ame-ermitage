import { setStoredQuestions, type StoredQuestion } from './questions';

// Questions du back-office : la dernière liste reçue est gardée sur l'appareil, pour qu'une classe sans
// réseau joue quand même avec les questions à jour. Sans réponse de l'API, questions.seed.json reste en place.
const CACHE_KEY = 'ame_questions_cache_v1';

const usable = (data: unknown): data is StoredQuestion[] => Array.isArray(data) && data.length > 0;

export function loadStoredQuestions() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null');
    if (usable(cached)) setStoredQuestions(cached);
  } catch {
    // cache illisible : on garde la copie de secours
  }
  fetch('/api/questions')
    .then((r) => (r.ok ? r.json() : null))
    .then((data: { questions?: unknown } | null) => {
      if (!usable(data?.questions)) return;
      setStoredQuestions(data.questions);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data.questions));
      } catch {
        // stockage plein ou indisponible : sans gravité
      }
    })
    .catch(() => {});
}
