import { useCallback, useEffect, useState } from 'react';
import { GOOD_ANSWERS_PER_CARD_UNLOCK, streakBonus, RECENT_QUESTIONS_MEMORY, RECENT_SUBJECTS_MEMORY, STORAGE_KEY } from './config';
import { POKEMON_CARDS } from './data.generated';
import type { Question } from './types';

// Ordre de déblocage : d'abord les 7 créations liées au lagon / littoral,
// puis les 5 créations d'imagination libre (chacune dans l'ordre de la collection).
export const UNLOCK_ORDER: string[] = [...POKEMON_CARDS]
  .sort((a, b) => Number(b.lagoon) - Number(a.lagoon) || a.number.localeCompare(b.number))
  .map((c) => c.id);

export interface GameState {
  stars: number;
  good: number;
  answered: number;
  /** Bonnes réponses accumulées vers la prochaine carte. */
  towardNext: number;
  unlocked: string[];
  /** Bonnes réponses d'affilée (remise à zéro à la première erreur). */
  streak: number;
  /** Cartes déjà regardées en grand : les autres portent le badge « Nouveau ». */
  seen: string[];
  recentQuestions: string[];
  recentSubjects: string[];
}

const EMPTY: GameState = { stars: 0, good: 0, answered: 0, towardNext: 0, unlocked: [], streak: 0, seen: [], recentQuestions: [], recentSubjects: [] };

function load(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const saved = JSON.parse(raw) as Partial<GameState>;
    return {
      ...EMPTY,
      ...saved,
      unlocked: (saved.unlocked ?? []).filter((id) => UNLOCK_ORDER.includes(id)),
    };
  } catch {
    return EMPTY;
  }
}

export function useGameState() {
  const [state, setState] = useState<GameState>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // stockage indisponible (navigation privée) : la partie reste jouable sans sauvegarde
    }
  }, [state]);

  /** Enregistre une réponse. Renvoie l'id de la carte débloquée, ou null. */
  const recordAnswer = useCallback(
    (question: Question, correct: boolean, stars: number): string | null => {
      let unlockedId: string | null = null;
      let towardNext = state.towardNext;
      let unlocked = state.unlocked;
      if (correct) {
        towardNext += 1;
        const nextCard = UNLOCK_ORDER.find((id) => !unlocked.includes(id));
        if (nextCard && towardNext >= GOOD_ANSWERS_PER_CARD_UNLOCK) {
          unlockedId = nextCard;
          unlocked = [...unlocked, nextCard];
          towardNext = 0;
        }
      }
      const streak = correct ? state.streak + 1 : 0;
      setState({
        ...state,
        streak,
        stars: state.stars + (correct ? stars + streakBonus(streak) : 0),
        good: state.good + (correct ? 1 : 0),
        answered: state.answered + 1,
        towardNext,
        unlocked,
        recentQuestions: [...state.recentQuestions, question.id].slice(-RECENT_QUESTIONS_MEMORY),
        recentSubjects: [...state.recentSubjects, question.subjectId].slice(-RECENT_SUBJECTS_MEMORY),
      });
      return unlockedId;
    },
    [state],
  );

  // Mode démo : tout est débloqué et déjà « vu » (pas de pluie de badges « Nouveau »).
  const unlockAll = useCallback(() => setState((s) => ({ ...s, unlocked: [...UNLOCK_ORDER], seen: [...UNLOCK_ORDER], towardNext: 0 })), []);
  const markSeen = useCallback((id: string) => setState((s) => (s.seen.includes(id) ? s : { ...s, seen: [...s.seen, id] })), []);
  const reset = useCallback(() => setState(EMPTY), []);

  return { state, recordAnswer, unlockAll, markSeen, reset };
}
