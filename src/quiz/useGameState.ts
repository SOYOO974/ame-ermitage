import { useCallback, useEffect, useState } from 'react';
import { cardThreshold, streakBonus, RECENT_QUESTIONS_MEMORY, RECENT_SUBJECTS_MEMORY, STORAGE_KEY, XP_PER_GAME_STAR } from './config';
import { POKEMON_CARDS } from './data.generated';
import { isBankExhausted } from './questions';
import type { Question } from './types';

// Ordre de déblocage : d'abord les 7 créations liées au lagon / littoral,
// puis les 5 créations d'imagination libre (chacune dans l'ordre de la collection).
export const UNLOCK_ORDER: string[] = [...POKEMON_CARDS]
  .sort((a, b) => Number(b.lagoon) - Number(a.lagoon) || a.number.localeCompare(b.number))
  .map((c) => c.id);

/** Progression vers la prochaine carte : XP déjà faits dans le palier et XP du palier. null : collection complète. */
export function cardProgress(xp: number, owned: number): { have: number; need: number; left: number } | null {
  if (owned >= UNLOCK_ORDER.length) return null;
  const from = cardThreshold(owned - 1);
  const to = cardThreshold(owned);
  return { have: Math.min(Math.max(xp - from, 0), to - from), need: to - from, left: Math.max(to - xp, 0) };
}

export type GameKey = 'turtleBest' | 'raceBest' | 'reefBest';

/** Résultat d'une action qui rapporte des XP. */
export interface Gain {
  xp: number;
  /** Cartes débloquées par ce gain (souvent aucune, parfois deux si un gros gain franchit deux paliers). */
  cards: string[];
}

export interface GameState {
  /** Points d'expérience cumulés : ils débloquent les cartes. */
  xp: number;
  good: number;
  answered: number;
  unlocked: string[];
  /** Bonnes réponses d'affilée (remise à zéro à la première erreur). */
  streak: number;
  /** Cartes déjà regardées en grand : les autres portent le badge « Nouveau ». */
  seen: string[];
  recentQuestions: string[];
  recentSubjects: string[];
  /** Questions déjà réussies dans cette partie : elles ne reviennent plus (pas d'étoiles à rejouer la même). */
  mastered: string[];
  /**
   * Questions réussies lors des parties précédentes : conservées quand l'enfant recommence, pour lui proposer
   * d'abord celles qu'il n'a jamais réussies. Vidé quand toute la banque y est passée.
   */
  history: string[];
  /** Meilleur résultat au mini-jeu de la tortue (0 à 3 étoiles). */
  turtleBest: number;
  /** Meilleur résultat à la course du lagon (0 à 3 étoiles : 3e, 2e, 1re place). */
  raceBest: number;
  /** Meilleur résultat à la crue de la ravine (0 à 3 étoiles selon le corail sauvé). */
  reefBest: number;
}

const EMPTY: GameState = { xp: 0, good: 0, answered: 0, unlocked: [], streak: 0, seen: [], recentQuestions: [], recentSubjects: [], mastered: [], history: [], turtleBest: 0, raceBest: 0, reefBest: 0 };

function load(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const saved = JSON.parse(raw) as Partial<GameState> & { stars?: number; towardNext?: number };
    const unlocked = (saved.unlocked ?? []).filter((id) => UNLOCK_ORDER.includes(id));
    // Parties d'avant les XP : 1 étoile = 10 XP, jamais moins que le palier des cartes déjà gagnées, et juste
    // sous le palier suivant (pas de carte ouverte sans cérémonie : la prochaine bonne réponse l'ouvrira).
    const xp = saved.xp ?? Math.min(Math.max((saved.stars ?? 0) * 10, cardThreshold(unlocked.length - 1)), cardThreshold(unlocked.length) - 10);
    const { stars: _stars, towardNext: _towardNext, ...rest } = saved;
    return { ...EMPTY, ...rest, xp, unlocked };
  } catch {
    return EMPTY;
  }
}

/** Ajoute des XP et débloque toutes les cartes dont le palier est franchi. */
function grant(s: GameState, gained: number): Pick<GameState, 'xp' | 'unlocked'> & { cards: string[] } {
  const xp = s.xp + gained;
  const cards: string[] = [];
  for (const id of UNLOCK_ORDER) {
    if (s.unlocked.includes(id)) continue;
    if (xp < cardThreshold(s.unlocked.length + cards.length)) break;
    cards.push(id);
  }
  return { xp, unlocked: cards.length ? [...s.unlocked, ...cards] : s.unlocked, cards };
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

  /** Enregistre une réponse au quiz. `stake` : XP mis en jeu par la question (hors bonus de série). */
  const recordAnswer = useCallback(
    (question: Question, correct: boolean, stake: number): Gain => {
      const streak = correct ? state.streak + 1 : 0;
      const gained = correct ? stake + streakBonus(streak) : 0;
      const { cards, ...won } = grant(state, gained);
      setState({
        ...state,
        ...won,
        streak,
        good: state.good + (correct ? 1 : 0),
        answered: state.answered + 1,
        recentQuestions: [...state.recentQuestions, question.id].slice(-RECENT_QUESTIONS_MEMORY),
        recentSubjects: [...state.recentSubjects, question.subjectId].slice(-RECENT_SUBJECTS_MEMORY),
        mastered: correct ? [...state.mastered, question.id] : state.mastered,
      });
      return { xp: gained, cards };
    },
    [state],
  );

  /** Fin d'un mini-jeu : XP seulement pour les étoiles de record jamais obtenues. */
  const recordGame = useCallback(
    (key: GameKey, stars: number): Gain => {
      if (stars <= state[key]) return { xp: 0, cards: [] };
      const gained = (stars - state[key]) * XP_PER_GAME_STAR;
      const { cards, ...won } = grant(state, gained);
      setState({ ...state, ...won, [key]: stars });
      return { xp: gained, cards };
    },
    [state],
  );

  // Mode démo : tout est débloqué et déjà « vu » (pas de pluie de badges « Nouveau »).
  const unlockAll = useCallback(() => setState((s) => ({ ...s, unlocked: [...UNLOCK_ORDER], seen: [...UNLOCK_ORDER], xp: Math.max(s.xp, cardThreshold(UNLOCK_ORDER.length - 1)) })), []);
  const markSeen = useCallback((id: string) => setState((s) => (s.seen.includes(id) ? s : { ...s, seen: [...s.seen, id] })), []);
  // Nouvelle partie : tout repart de zéro sauf l'historique des questions réussies (complété par cette partie).
  const reset = useCallback(
    () =>
      setState((s) => {
        const history = [...new Set([...s.history, ...s.mastered])];
        return { ...EMPTY, history: isBankExhausted(history) ? [] : history };
      }),
    [],
  );

  return { state, recordAnswer, recordGame, unlockAll, markSeen, reset };
}
