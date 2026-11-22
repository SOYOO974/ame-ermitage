import { Suspense, lazy, useEffect, useState } from 'react';
import { Check, Gamepad2, Layers, Lock, Play, RotateCcw, Settings2, Unlock, Wand2, X } from 'lucide-react';
import './quiz.css';
import './minigames/turtle.css';
import { DEMO_PASSWORD, QUESTIONS_PER_NEW_GAME, RACE_GAME_UNLOCK_AT_CARDS, RACE_GAME_WAITS_FOR_QUESTIONS, REEF_GAME_UNLOCK_AT_CARDS, REEF_GAME_WAITS_FOR_QUESTIONS, TURTLE_GAME_UNLOCK_AT_CARDS } from './config';
import { CARD_BY_ID } from './cards';
import { CollectionView, UnlockCeremony } from './Collection';
import { POKEMON_CARDS } from './data.generated';
import { HomeDeck } from './HomeDeck';
import { LagoonEmblem, StarIcon } from './icons';
import { LagoonRoute } from './LagoonRoute';
import { drawQuestion } from './questions';
import { QuestionPanel } from './QuestionPanel';
import { TimeInfoDialog, TimerPill, TimeUpScreen, TimeWarning } from './PlayTimer';
import { XpDialog } from './XpDialog';
import type { Question } from './types';
import { cardProgress, type GameKey, UNLOCK_ORDER, useGameState } from './useGameState';
import { usePlayTime } from './usePlayTime';

type View = 'accueil' | 'quiz' | 'collection' | 'jeux';

// Les mini-jeux ne sont chargés qu'à leur première ouverture.
const TurtleGame = lazy(() => import('./minigames/TurtleGame'));
const RaceGame = lazy(() => import('./minigames/RaceGame'));
const RavineGame = lazy(() => import('./minigames/RavineGame'));

type GameId = 'tortue' | 'course' | 'ravine';
const GAMES: Record<GameId, { title: string; cover: string; preview: string; unlockAt: number; pitch: string; announce: string; waitsForQuestions?: boolean }> = {
  tortue: {
    title: 'La Traversée de la Tortue',
    cover: '/images/minigames/apercu-tortue.webp',
    preview: '/images/minigames/apercu-tortue.mp4',
    unlockAt: TURTLE_GAME_UNLOCK_AT_CARDS,
    pitch: 'Mange des algues, remonte respirer, évite le plastique et les bateaux : fais traverser le lagon à une tortue verte.',
    announce: 'aide une tortue verte à traverser le lagon.',
  },
  course: {
    title: 'La Grande Course du Lagon',
    cover: '/images/minigames/apercu-course.webp',
    preview: '/images/minigames/apercu-course.mp4',
    unlockAt: RACE_GAME_UNLOCK_AT_CARDS,
    pitch: 'Choisis une de tes cartes comme pilote, lance des boutures de corail sur la piste et finis sur le podium.',
    announce: 'fais la course avec les personnages de tes cartes.',
    waitsForQuestions: RACE_GAME_WAITS_FOR_QUESTIONS,
  },
  ravine: {
    title: 'La Crue de la Ravine',
    cover: '/images/minigames/apercu-ravine.webp',
    preview: '/images/minigames/apercu-ravine.mp4',
    unlockAt: REEF_GAME_UNLOCK_AT_CARDS,
    pitch: 'Il pleut, la ravine apporte de l’engrais et les algues envahissent le récif. Guide ton banc de poissons brouteurs et sauve le corail.',
    announce: 'sauve le corail des algues avec un banc de poissons brouteurs.',
    waitsForQuestions: REEF_GAME_WAITS_FOR_QUESTIONS,
  },
};
const GAME_IDS = Object.keys(GAMES) as GameId[];

// Aperçu animé : quelques secondes filmées dans le jeu, en boucle muette (image fixe si l'élève préfère moins d'animations).
const REDUCED_MOTION = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function GameCover({ game }: { game: GameId }) {
  const { cover, preview } = GAMES[game];
  if (REDUCED_MOTION) return <img src={cover} alt="" />;
  return <video src={preview} poster={cover} autoPlay muted loop playsInline disablePictureInPicture aria-hidden="true" />;
}

const TOTAL = POKEMON_CARDS.length;

/** Le jeu attend les questions de la classe : on explique le défi. Un lien discret laisse passer l'enseignant. */
function QuestionsGate({ game, onClose, onTeacher }: { game: GameId; onClose: () => void; onTeacher: () => void }) {
  const [asking, setAsking] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ocean-900/80 p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true" aria-label="Jeu à débloquer avec vos questions">
      <div className="rise-in w-full max-w-md overflow-hidden rounded-2xl bg-white text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mg-cover">
          <img src={GAMES[game].cover} alt="" style={{ filter: 'brightness(0.6)' }} />
          <span className="mg-lock">
            <Lock className="h-9 w-9 text-soleil-300" strokeWidth={1.8} />
            {QUESTIONS_PER_NEW_GAME} questions à transmettre
          </span>
        </div>
        <div className="px-6 pb-5 pt-5">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-corail-500">Défi de la classe</p>
          <h2 className="mt-1 font-display text-3xl font-semibold leading-tight text-ocean-900">{GAMES[game].title}</h2>
          <p className="mt-2 text-lg leading-snug text-ocean-700">
            Ce jeu est prêt, mais il attend vos questions ! Transmettez {QUESTIONS_PER_NEW_GAME} nouvelles questions pour le quiz : le jeu s'ouvrira pour toute la classe, et la création d'un nouveau mini-jeu commencera.
          </p>
          <button type="button" onClick={onClose} className="mt-5 inline-flex items-center justify-center rounded-xl bg-corail-500 px-7 py-3.5 font-display text-xl font-semibold text-white shadow-lg transition hover:bg-corail-600">
            D'accord, on s'y met
          </button>
          {asking ? (
            <form
              className="mt-4 flex items-start justify-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (password.trim().toLowerCase() === DEMO_PASSWORD) onTeacher();
                else setError(true);
              }}
            >
              <div className="text-left">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(false);
                  }}
                  autoFocus
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  aria-label="Mot de passe enseignant"
                  placeholder="Mot de passe enseignant"
                  className={`w-52 rounded-lg border bg-sable px-3 py-2 text-sm text-ocean-900 outline-none focus:bg-white ${error ? 'border-corail-500' : 'border-ocean-900/20 focus:border-ocean-700'}`}
                />
                {error && (
                  <p className="mt-1 text-xs font-semibold text-corail-600" role="alert">
                    Mot de passe incorrect.
                  </p>
                )}
              </div>
              <button type="submit" className="rounded-lg bg-ocean-800 px-3 py-2 text-sm font-bold text-white transition hover:bg-ocean-700">
                Entrer
              </button>
            </form>
          ) : (
            <button type="button" onClick={() => setAsking(true)} className="mx-auto mt-4 block text-xs text-ocean-700/60 underline-offset-4 hover:text-ocean-800 hover:underline">
              Accès enseignant
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DemoPanel({
  authorized,
  onAuthorize,
  onClose,
  onUnlockAll,
  onSimulate,
  onReset,
}: {
  authorized: boolean;
  onAuthorize: () => void;
  onClose: () => void;
  onUnlockAll: () => void;
  onSimulate: (id: string) => void;
  onReset: () => void;
}) {
  const [cardId, setCardId] = useState(UNLOCK_ORDER[0]);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ocean-900/60 p-4 sm:items-center" onClick={onClose} role="dialog" aria-modal="true" aria-label="Mode Démo Enseignant">
      <div className="rise-in w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-turq-600">Réservé à l'enseignant</p>
            <h2 className="font-display text-2xl font-semibold text-ocean-900">Mode Démo</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className="rounded-full p-2 text-ocean-700 hover:bg-sable">
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        {!authorized ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (password.trim().toLowerCase() === DEMO_PASSWORD) {
                onAuthorize();
              } else {
                setError(true);
              }
            }}
            className="space-y-4"
          >
            <p className="text-base leading-snug text-ocean-700">
              Cet espace permet de projeter ou tester toutes les cartes en classe. Saisis le mot de passe enseignant pour continuer.
            </p>
            <div>
              <label htmlFor="demo-password" className="block text-sm font-bold text-ocean-900">
                Mot de passe
              </label>
              <input
                id="demo-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                autoFocus
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder="Mot de passe enseignant"
                className={`mt-1.5 w-full rounded-xl border bg-sable px-3.5 py-2.5 text-base text-ocean-900 outline-none transition focus:bg-white ${
                  error ? 'border-corail-500 ring-2 ring-corail-500/20' : 'border-ocean-900/20 focus:border-ocean-700'
                }`}
              />
              {error && (
                <p className="mt-1.5 text-sm font-semibold text-corail-600" role="alert">
                  Mot de passe incorrect.
                </p>
              )}
            </div>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-ocean-800 px-4 py-3 text-base font-bold text-white transition hover:bg-ocean-700"
            >
              <Lock className="h-5 w-5" strokeWidth={1.8} />
              Déverrouiller
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <button type="button" onClick={onUnlockAll} className="flex w-full items-center gap-3 rounded-xl bg-ocean-800 px-4 py-3 text-left text-base font-bold text-white transition hover:bg-ocean-700">
              <Unlock className="h-5 w-5 flex-shrink-0" strokeWidth={1.8} />
              Débloquer les {TOTAL} cartes de la classe
            </button>

            <div className="rounded-xl bg-sable p-4">
              <label htmlFor="demo-card" className="text-sm font-bold text-ocean-900">
                Simuler l'ouverture d'une carte
              </label>
              <div className="mt-2 flex gap-2">
                <select id="demo-card" value={cardId} onChange={(e) => setCardId(e.target.value)} className="min-w-0 flex-1 rounded-lg border border-ocean-900/20 bg-white px-3 py-2.5 text-base text-ocean-900">
                  {POKEMON_CARDS.map((c) => (
                    <option key={c.id} value={c.id}>
                      #{c.number} {c.name}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={() => onSimulate(cardId)} className="inline-flex items-center gap-2 rounded-lg bg-corail-500 px-4 py-2.5 text-base font-bold text-white transition hover:bg-corail-600">
                  <Wand2 className="h-5 w-5" strokeWidth={1.8} />
                  Ouvrir
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => window.confirm('Remettre toute la progression à zéro (XP et cartes) ?') && onReset()}
              className="flex w-full items-center gap-3 rounded-xl border-2 border-corail-500/40 px-4 py-3 text-left text-base font-bold text-corail-600 transition hover:bg-corail-500/10"
            >
              <RotateCcw className="h-5 w-5 flex-shrink-0" strokeWidth={1.8} />
              Réinitialiser toute la progression
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Fin de partie : les 12 cartes sont gagnées, il n'y a plus de question à tirer. */
function EndScreen({ xp, good, answered, onCollection, onRestart }: { xp: number; good: number; answered: number; onCollection: () => void; onRestart: () => void }) {
  return (
    <section className="lagoon-hero rise-in relative overflow-hidden rounded-2xl px-5 py-10 text-center text-white shadow-lg sm:px-10 sm:py-14">
      <LagoonEmblem className="mx-auto h-16 w-16 text-soleil-300" />
      <p className="mt-4 text-sm font-bold uppercase tracking-[0.2em] text-soleil-300">Partie terminée</p>
      <h1 className="mt-2 font-display text-4xl font-semibold leading-tight sm:text-5xl">Tu es Gardien du Lagon !</h1>
      <p className="mx-auto mt-3 max-w-xl text-lg leading-snug text-white/90 sm:text-xl">Tu as gagné les {TOTAL} cartes dessinées par la classe. Il n'y a plus de carte à ouvrir : la partie est finie.</p>

      <dl className="mx-auto mt-7 flex max-w-lg justify-center divide-x divide-white/20">
        <div className="flex-1 px-1.5 sm:px-3">
          <dd className="flex items-center justify-center gap-1.5 font-display text-[1.7rem] font-semibold text-soleil-300 sm:text-4xl">
            {xp}
          </dd>
          <dt className="mt-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-white/70 sm:text-xs sm:tracking-[0.15em]">XP gagnés</dt>
        </div>
        <div className="flex-1 px-1.5 sm:px-3">
          <dd className="flex items-center justify-center gap-1.5 font-display text-[1.7rem] font-semibold sm:text-4xl">
            <Layers className="h-7 w-7 text-soleil-300 max-sm:hidden" strokeWidth={1.8} />
            {TOTAL}/{TOTAL}
          </dd>
          <dt className="mt-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-white/70 sm:text-xs sm:tracking-[0.15em]">Cartes</dt>
        </div>
        {answered > 0 && (
          <div className="flex-1 px-1.5 sm:px-3">
            <dd className="flex items-center justify-center gap-1.5 font-display text-[1.7rem] font-semibold sm:text-4xl">
              <Check className="h-7 w-7 text-soleil-300 max-sm:hidden" strokeWidth={2.4} />
              {good}/{answered}
            </dd>
            <dt className="mt-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-white/70 sm:text-xs sm:tracking-[0.15em]">Bonnes réponses</dt>
          </div>
        )}
      </dl>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <button type="button" onClick={onCollection} className="inline-flex items-center gap-2 rounded-xl bg-corail-500 px-6 py-3.5 font-display text-xl font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-corail-600">
          <Layers className="h-6 w-6" strokeWidth={1.8} />
          Voir mes {TOTAL} cartes
        </button>
        <button
          type="button"
          onClick={() => window.confirm('Recommencer une partie ? Les XP et les cartes repartent de zéro.') && onRestart()}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-3.5 text-lg font-bold text-white ring-1 ring-white/50 transition hover:bg-white/15"
        >
          <RotateCcw className="h-5 w-5" strokeWidth={1.8} />
          Recommencer une partie
        </button>
      </div>
    </section>
  );
}

/** Page des mini-jeux : ils se gagnent avec les cartes, puis restent rejouables à volonté. */
function MiniGamesView({ cards, best, onOpen, onPlay }: { cards: number; best: Record<GameId, number>; onOpen: (game: GameId) => void; onPlay: () => void }) {
  return (
    <section className="rise-in">
      <p className="text-sm font-bold uppercase tracking-[0.15em] text-turq-600">À débloquer avec tes cartes</p>
      <h2 className="font-display text-3xl font-semibold text-ocean-900 sm:text-4xl">Mini-jeux du lagon</h2>
      <p className="mt-1 max-w-2xl text-lg text-ocean-700">Chaque jeu t'apprend comment vit un animal du lagon. Une fois débloqué, tu peux y rejouer quand tu veux.</p>
      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {GAME_IDS.map((id) => {
          const game = GAMES[id];
          const unlocked = cards >= game.unlockAt;
          const left = game.unlockAt - cards;
          const record = best[id];
          return (
        <button key={id} type="button" onClick={unlocked ? () => onOpen(id) : onPlay} className={`mg-tile${unlocked ? '' : ' is-locked'}`}>
          <div className="mg-cover">
            {unlocked ? <GameCover game={id} /> : <img src={game.cover} alt="" />}
            {!unlocked && (
              <span className="mg-lock">
                <Lock className="h-8 w-8 text-soleil-300" strokeWidth={1.8} />
                Encore {left} carte{left > 1 ? 's' : ''} à gagner pour débloquer ce jeu
              </span>
            )}
          </div>
          <div className="flex flex-1 flex-col p-5">
            <h3 className="font-display text-2xl font-semibold text-ocean-900">{game.title}</h3>
            <p className="mt-1 text-lg leading-snug text-ocean-700">{game.pitch}</p>
            <div className="mt-auto flex items-center justify-between gap-3 pt-4">
              <span className="flex" aria-label={`Record : ${record} étoile${record > 1 ? 's' : ''} sur 3`}>
                {[1, 2, 3].map((n) => (
                  <StarIcon key={n} filled={n <= record} className="h-8 w-8" />
                ))}
              </span>
              <span className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-display text-lg font-semibold text-white ${unlocked ? 'bg-corail-500' : 'bg-ocean-800'}`}>
                <Play className="h-5 w-5" fill="currentColor" strokeWidth={0} />
                {unlocked ? 'Jouer' : 'Gagner des cartes'}
              </span>
            </div>
          </div>
        </button>
          );
        })}
        <div className="mg-tile is-locked">
          <div className="mg-cover">
            <span className="mg-lock">
              <Lock className="h-8 w-8 text-soleil-300" strokeWidth={1.8} />
              Bientôt
            </span>
          </div>
          <div className="p-5">
            <h3 className="font-display text-2xl font-semibold text-ocean-900">Un nouveau mini-jeu</h3>
            <p className="mt-1 text-lg leading-snug text-ocean-700">Il est en préparation. Quelle idée de jeu aimerais-tu voir ici ?</p>
          </div>
        </div>
      </div>
    </section>
  );
}

const BUBBLES = [
  { left: '4%', size: 14, duration: '13s', delay: '0s' },
  { left: '14%', size: 8, duration: '10s', delay: '-4s' },
  { left: '27%', size: 20, duration: '16s', delay: '-9s' },
  { left: '41%', size: 10, duration: '11s', delay: '-2s' },
  { left: '58%', size: 16, duration: '15s', delay: '-7s' },
  { left: '72%', size: 9, duration: '12s', delay: '-5s' },
  { left: '86%', size: 22, duration: '18s', delay: '-11s' },
  { left: '95%', size: 11, duration: '14s', delay: '-1s' },
];

const STEPS = [
  { title: 'Réponds aux questions', text: 'Devinettes, photos du lagon, bon ou mauvais signe pour le récif : touche la bonne réponse.' },
  { title: 'Gagne des XP', text: 'Chaque bonne réponse rapporte des XP, un nouveau record aux mini-jeux aussi. Quand la jauge est pleine, tu gagnes une carte mystère.' },
  { title: 'Ouvre et collectionne', text: `Touche la carte pour la retourner. Il y a ${POKEMON_CARDS.length} cartes dessinées par les élèves à gagner.` },
];

export default function QuizGame() {
  const { state, recordAnswer, recordGame, unlockAll, markSeen, reset } = useGameState();
  const playTime = usePlayTime();
  const best: Record<GameId, number> = { tortue: state.turtleBest, course: state.raceBest, ravine: state.reefBest };
  // Jeux débloqués mais pas encore réussis : ils portent la pastille « nouveau » de l'onglet Jeux.
  const freshGames = GAME_IDS.filter((id) => state.unlocked.length >= GAMES[id].unlockAt && best[id] === 0).length;
  const [openGame, setOpenGame] = useState<GameId | null>(null);
  /** Jeu demandé alors qu'il attend encore les questions de la classe. */
  const [gate, setGate] = useState<GameId | null>(null);
  // Un mini-jeu vient d'être gagné : on l'annonce une fois la carte ouverte.
  const [announce, setAnnounce] = useState<{ game: GameId; visible: boolean } | null>(null);
  const newCards = state.unlocked.filter((id) => !state.seen.includes(id)).length;
  const complete = state.unlocked.length >= TOTAL;
  const [view, setView] = useState<View>('accueil');
  const [question, setQuestion] = useState<Question | null>(null);
  const [round, setRound] = useState(0);
  /** Cartes gagnées à la dernière réponse, ouvertes au clic sur « suivant ». */
  const [pendingCards, setPendingCards] = useState<string[]>([]);
  /** File des cartes à ouvrir, une cérémonie après l'autre. */
  const [ceremonies, setCeremonies] = useState<string[]>([]);
  const ceremonyCard = ceremonies[0] ?? null;
  /** Cartes gagnées par un record de mini-jeu : elles s'ouvrent à la fermeture du jeu. */
  const [gameCards, setGameCards] = useState<string[]>([]);
  /** Bulle « +30 XP » au-dessus des mini-jeux (leurs écrans de fin ne parlent que d'étoiles). */
  const [xpToast, setXpToast] = useState<{ xp: number; n: number } | null>(null);
  const [demoOpen, setDemoOpen] = useState(false);
  const [demoAuthorized, setDemoAuthorized] = useState(false);
  const [timeInfoOpen, setTimeInfoOpen] = useState(false);
  const [xpInfoOpen, setXpInfoOpen] = useState(false);

  /** Ouvre un mini-jeu, ou explique le défi des questions s'il les attend encore (sauf pour l'enseignant). */
  const requestGame = (id: GameId) => {
    if (GAMES[id].waitsForQuestions && !demoAuthorized) setGate(id);
    else setOpenGame(id);
  };

  useEffect(() => {
    document.title = 'Les Gardiens du Lagon • AME de l’Ermitage-les-Bains';
  }, []);

  const nextQuestion = () => {
    setQuestion((current) => drawQuestion(state.recentQuestions, state.recentSubjects, state.mastered, current?.mechanic ?? null));
    setRound((r) => r + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const play = () => {
    // Collection complète : plus de question, « Jouer » mène à l'écran de fin de partie.
    if (!question && !complete) nextQuestion();
    setView('quiz');
  };

  useEffect(() => {
    if (!xpToast) return;
    const id = window.setTimeout(() => setXpToast(null), 4500);
    return () => window.clearTimeout(id);
  }, [xpToast]);

  const handleAnswer = (correct: boolean, stake: number): boolean => {
    if (!question) return false;
    const { cards } = recordAnswer(question, correct, stake);
    setPendingCards(cards);
    return cards.length > 0;
  };

  /** Ouvre les cartes gagnées et annonce le mini-jeu dont le seuil vient d'être franchi. */
  const openCards = (cards: string[]) => {
    setCeremonies((q) => [...q, ...cards]);
    const before = state.unlocked.length - cards.length;
    const won = GAME_IDS.find((id) => GAMES[id].unlockAt > before && GAMES[id].unlockAt <= state.unlocked.length);
    if (won) setAnnounce({ game: won, visible: false });
  };

  const finishGame = (key: GameKey) => (stars: number) => {
    const gain = recordGame(key, stars);
    if (gain.xp > 0) setXpToast((t) => ({ xp: gain.xp, n: (t?.n ?? 0) + 1 }));
    if (gain.cards.length) setGameCards((c) => [...c, ...gain.cards]);
  };

  const closeGame = () => {
    setOpenGame(null);
    if (gameCards.length) {
      openCards(gameCards);
      setGameCards([]);
    }
  };

  const handleNext = () => {
    if (pendingCards.length) {
      openCards(pendingCards);
      setPendingCards([]);
    }
    // La 12e carte clôt la partie : l'écran de fin attend derrière la cérémonie d'ouverture.
    if (complete) setQuestion(null);
    else nextQuestion();
  };

  const restart = () => {
    reset();
    setQuestion(null);
    setPendingCards([]);
    setGameCards([]);
    setView('accueil');
  };

  const tabClass = (active: boolean) =>
    `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition sm:px-4 sm:text-base ${
      active ? 'bg-white text-ocean-900 shadow' : 'text-white/85 hover:bg-white/15'
    }`;

  return (
    <div className="flex min-h-screen flex-col bg-sable text-ocean-900">
      <header className="sticky top-0 z-30 bg-ocean-800 text-white shadow-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
          <button type="button" onClick={() => setView('accueil')} className="flex items-center gap-3 text-left">
            <LagoonEmblem className="h-10 w-10 text-soleil-300" />
            {/* Téléphone, en plein quiz : l'en-tête tient sur une ligne pour laisser la place aux réponses. */}
            <span className={view === 'quiz' ? 'max-sm:hidden' : ''}>
              <span className="block font-display text-xl font-semibold leading-none sm:text-2xl">Les Gardiens du Lagon</span>
              <span className="hidden text-xs font-semibold uppercase tracking-[0.15em] text-white/70 sm:block">AME de l'Ermitage-les-Bains · CM2 de Mme Pavion</span>
            </span>
          </button>
          <nav className="flex items-center gap-1.5 sm:gap-2">
            {/* Téléphone : icônes seules pour Jouer et Cartes, la place va au minuteur de la journée. */}
            <button type="button" onClick={play} aria-label="Jouer" className={`${tabClass(view === 'quiz')}${view === 'quiz' ? ' max-sm:hidden' : ''}`}>
              <Play className="h-4 w-4" strokeWidth={2} />
              <span className="hidden sm:inline">Jouer</span>
            </button>
            <button type="button" onClick={() => setView('collection')} aria-label={`Mes cartes : ${state.unlocked.length} sur ${TOTAL}`} className={tabClass(view === 'collection')}>
              <Layers className="h-4 w-4" strokeWidth={2} />
              <span className="hidden sm:inline">Mes cartes</span> {state.unlocked.length}/{TOTAL}
              {newCards > 0 && (
                <span className="new-dot" aria-label={`${newCards} nouvelle${newCards > 1 ? 's' : ''} carte${newCards > 1 ? 's' : ''}`}>
                  {newCards}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setView('jeux');
                window.scrollTo({ top: 0 });
              }}
              className={tabClass(view === 'jeux')}
              aria-label="Mini-jeux"
            >
              <Gamepad2 className="h-4 w-4" strokeWidth={2} />
              <span className="hidden sm:inline">Jeux</span>
              {freshGames > 0 && <span className="new-dot" aria-label={`${freshGames} mini-jeu${freshGames > 1 ? 'x' : ''} à essayer`}>{freshGames}</span>}
            </button>
            <TimerPill remainingMs={playTime.remainingMs} onOpen={() => setTimeInfoOpen(true)} />
            <button
              type="button"
              onClick={() => setXpInfoOpen(true)}
              aria-label={`${state.xp} points d’expérience. Voir ma progression et comment gagner des XP`}
              title="Mes XP : progression et comment en gagner"
              className="inline-flex items-baseline gap-1 rounded-lg bg-ocean-900/50 px-2 py-2 font-display text-lg font-semibold text-soleil-300 transition-colors hover:bg-white/15 sm:ml-1 sm:px-3"
            >
              <span key={state.xp} className="pop inline-block">
                {state.xp}
              </span>
              <span className="text-xs font-bold tracking-[0.12em]">XP</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {view === 'accueil' && (
          <>
            <section className="lagoon-hero relative overflow-hidden text-white">
              {BUBBLES.map((b) => (
                <span key={b.left} className="bubble" style={{ left: b.left, width: b.size, height: b.size, animationDuration: b.duration, animationDelay: b.delay }} aria-hidden="true" />
              ))}
              <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 pb-24 pt-7 md:gap-10 md:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] md:pt-16">
                <div className="rise-in">
                  <p className="hidden text-sm font-bold uppercase tracking-[0.2em] text-soleil-300 sm:block">Aire Marine Éducative de l'Ermitage</p>
                  <h1 className="font-display text-4xl font-semibold leading-[1.02] sm:mt-3 sm:text-6xl">
                    Deviens Gardien
                    <br className="hidden sm:block" /> du Lagon
                  </h1>
                  <p className="mt-3 max-w-xl text-lg leading-snug text-white/90 sm:mt-5 sm:text-2xl">
                    <b className="text-soleil-300">Gagne des XP en répondant bien</b> : chaque palier ouvre une carte mystère. Gagne les {TOTAL} cartes dessinées par la classe !
                  </p>
                  <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-5 sm:mt-8">
                    <button type="button" onClick={play} className="btn-play">
                      <Play fill="currentColor" strokeWidth={0} />
                      Jouer
                    </button>
                    <button type="button" onClick={() => setView('collection')} className="hidden items-center gap-2 rounded-xl px-4 py-3 text-lg font-bold text-white ring-1 sm:inline-flex ring-white/50 transition hover:bg-white/15">
                      <Layers className="h-5 w-5" strokeWidth={1.8} />
                      Mes cartes {state.unlocked.length}/{TOTAL}
                    </button>
                  </div>
                </div>

                <HomeDeck unlocked={state.unlocked} xp={state.xp} onPlay={play} onCollection={() => setView('collection')} />
              </div>
              <svg className="wave-slide absolute -bottom-px left-0 h-16 text-sable" viewBox="0 0 1440 80" preserveAspectRatio="none" fill="currentColor" aria-hidden="true">
                <path d="M0 40c120-28 240-28 360 0s240 28 360 0 240-28 360 0 240 28 360 0v40H0z" />
              </svg>
            </section>

            <section className="mx-auto max-w-6xl px-4 py-10">
              <h2 className="font-display text-3xl font-semibold text-ocean-900">Comment jouer ?</h2>
              <div className="mt-6 grid gap-8 md:grid-cols-3">
                {STEPS.map(({ title, text }, i) => (
                  <div key={title} className="rise-in flex gap-4" style={{ animationDelay: `${0.15 + i * 0.12}s` }}>
                    <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-ocean-800 font-display text-3xl font-semibold text-soleil-300">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="font-display text-xl font-semibold text-ocean-900">{title}</h3>
                      <p className="mt-1 text-lg leading-snug text-ocean-700">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {view === 'quiz' && question && (
          <div className="quiz-wrap mx-auto flex max-w-4xl flex-col gap-5 px-4 py-6 sm:py-8">
            {/* Tant que la carte gagnée n'est pas ouverte, la route la garde en « mystère » (pas de divulgâchage). */}
            <LagoonRoute
              unlocked={state.unlocked.filter((id) => !pendingCards.includes(id))}
              xp={state.xp}
              streak={state.streak}
            />
            <QuestionPanel
              key={round}
              question={question}
              streak={state.streak}
              toNextCard={cardProgress(state.xp, state.unlocked.length)?.left ?? null}
              onAnswer={handleAnswer}
              onNext={handleNext}
            />
          </div>
        )}

        {view === 'quiz' && !question && complete && (
          <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
            <EndScreen xp={state.xp} good={state.good} answered={state.answered} onCollection={() => setView('collection')} onRestart={restart} />
          </div>
        )}

        {view === 'collection' && (
          <div className="mx-auto max-w-6xl px-4 py-8">
            <CollectionView unlocked={state.unlocked} xp={state.xp} seen={state.seen} onSeen={markSeen} onPlay={play} />
          </div>
        )}
        {view === 'jeux' && (
          <div className="mx-auto max-w-6xl px-4 py-8">
            <MiniGamesView cards={state.unlocked.length} best={best} onOpen={requestGame} onPlay={play} />
          </div>
        )}
      </main>

      <footer className="mt-10 bg-ocean-900 px-4 py-8 text-center text-sm text-white/70">
        <p className="font-semibold text-white/90">Aire Marine Éducative de l'Ermitage-les-Bains · Classe de CM2 de Madame Pavion</p>
        <p className="mt-1">Questions tirées des cartes Reef Check et du Jardin de l'AME. Cartes dessinées par les élèves.</p>
        <p className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <a href="/projets" className="underline-offset-4 hover:text-white hover:underline">
            Les 5 projets soumis au vote
          </a>
          <a href="/presentation" className="underline-offset-4 hover:text-white hover:underline">
            Diaporama de l'atelier
          </a>
          <button type="button" onClick={() => setDemoOpen(true)} className="inline-flex items-center gap-1.5 underline-offset-4 hover:text-white hover:underline">
            <Settings2 className="h-4 w-4" strokeWidth={1.5} />
            Mode Démo / Enseignant
          </button>
        </p>
      </footer>

      {demoOpen && (
        <DemoPanel
          authorized={demoAuthorized}
          onAuthorize={() => setDemoAuthorized(true)}
          onClose={() => setDemoOpen(false)}
          onUnlockAll={() => {
            unlockAll();
            setQuestion(null);
            setPendingCards([]);
            setDemoOpen(false);
            setView('collection');
          }}
          onSimulate={(id) => {
            setDemoOpen(false);
            setCeremonies([id]);
          }}
          onReset={() => {
            restart();
            setDemoOpen(false);
          }}
        />
      )}

      {ceremonyCard && (
        <UnlockCeremony
          key={ceremonyCard}
          card={CARD_BY_ID[ceremonyCard]}
          onClose={() => {
            setCeremonies((q) => q.slice(1));
            setAnnounce((a) => a && { ...a, visible: true });
          }}
          onSeeCollection={() => {
            setCeremonies([]);
            setAnnounce((a) => a && { ...a, visible: true });
            setView('collection');
          }}
        />
      )}

      {announce?.visible && !ceremonyCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ocean-900/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Mini-jeu débloqué">
          <div className="rise-in w-full max-w-md overflow-hidden rounded-2xl bg-white text-center shadow-2xl">
            <div className="mg-cover">
              <GameCover game={announce.game} />
            </div>
            <div className="px-6 pb-6 pt-5">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-corail-500">Mini-jeu débloqué</p>
              <h2 className="mt-1 font-display text-3xl font-semibold leading-tight text-ocean-900">{GAMES[announce.game].title}</h2>
              <p className="mt-2 text-lg leading-snug text-ocean-700">Tes {GAMES[announce.game].unlockAt} cartes t'ouvrent un jeu : {GAMES[announce.game].announce}</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    requestGame(announce.game);
                    setAnnounce(null);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-corail-500 px-6 py-3.5 font-display text-xl font-semibold text-white shadow-lg transition hover:bg-corail-600"
                >
                  <Gamepad2 className="h-6 w-6" strokeWidth={1.8} />
                  Jouer maintenant
                </button>
                <button type="button" onClick={() => setAnnounce(null)} className="rounded-xl px-5 py-3.5 text-lg font-bold text-ocean-800 ring-1 ring-ocean-900/25 transition hover:bg-sable">
                  Plus tard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {gate && (
        <QuestionsGate
          game={gate}
          onClose={() => setGate(null)}
          onTeacher={() => {
            setDemoAuthorized(true);
            setOpenGame(gate);
            setGate(null);
          }}
        />
      )}

      {/* Séance du jour finie : le mini-jeu en cours se ferme, l'écran de fin bloque tout jusqu'au lendemain. */}
      {openGame && !playTime.expired && <TimerPill remainingMs={playTime.remainingMs} floating={openGame === 'course' ? 'map' : 'buttons'} />}
      <TimeWarning remainingMs={playTime.remainingMs} />
      {xpInfoOpen && !playTime.expired && (
        <XpDialog
          xp={state.xp}
          cards={state.unlocked.length}
          good={state.good}
          answered={state.answered}
          streak={state.streak}
          games={GAME_IDS.map((id) => ({ id, title: GAMES[id].title, cover: GAMES[id].cover, unlockAt: GAMES[id].unlockAt, best: best[id], waiting: !!GAMES[id].waitsForQuestions && !demoAuthorized }))}
          onPlay={play}
          onGame={(id) => requestGame(id as GameId)}
          onClose={() => setXpInfoOpen(false)}
        />
      )}
      {timeInfoOpen && !playTime.expired && <TimeInfoDialog remainingMs={playTime.remainingMs} onClose={() => setTimeInfoOpen(false)} />}
      {playTime.expired && <TimeUpScreen onGrant={playTime.grantSession} />}

      {openGame && !playTime.expired && (
        <Suspense fallback={null}>
          {openGame === 'tortue' ? (
            <TurtleGame best={state.turtleBest} onFinish={finishGame('turtleBest')} onClose={closeGame} />
          ) : openGame === 'ravine' ? (
            <RavineGame best={state.reefBest} onFinish={finishGame('reefBest')} onClose={closeGame} />
          ) : (
            <RaceGame best={state.raceBest} unlocked={state.unlocked} onFinish={finishGame('raceBest')} onClose={closeGame} />
          )}
        </Suspense>
      )}

      {xpToast && (
        <div className="xp-toast" role="status">
          <span key={xpToast.n} className="pop font-display">
            Nouveau record : +{xpToast.xp} XP{gameCards.length ? ' · carte mystère gagnée !' : ''}
          </span>
        </div>
      )}
    </div>
  );
}
