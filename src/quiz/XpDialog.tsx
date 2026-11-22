import { useEffect } from 'react';
import { BookOpen, Check, Flame, Gamepad2, HelpCircle, Lightbulb, Lock, Play, X } from 'lucide-react';
import { cardThreshold, XP_ARTICLE_MASTERED, XP_FLAT, XP_PER_GAME_STAR, XP_STREAK, XP_WHO } from './config';
import { XpGauge } from './LagoonRoute';
import { CardBack } from './PokemonCard';
import { StarIcon } from './icons';
import { cardProgress, UNLOCK_ORDER } from './useGameState';

export interface XpGame {
  id: string;
  title: string;
  cover: string;
  unlockAt: number;
  /** Record actuel, 0 à 3 étoiles. */
  best: number;
  /** Le jeu attend encore les questions de la classe : pas de bouton, on ne promet pas des XP inaccessibles. */
  waiting: boolean;
}

interface Props {
  xp: number;
  cards: number;
  good: number;
  answered: number;
  streak: number;
  games: XpGame[];
  onPlay: () => void;
  onGame: (id: string) => void;
  onClose: () => void;
}

const MAX_STARS = 3;

/**
 * Fenêtre ouverte en touchant le compteur d'XP de l'en-tête : où j'en suis (jauge jusqu'à la prochaine carte, prochain
 * mini-jeu), puis chaque façon de gagner des XP avec son bouton pour y aller tout de suite.
 */
export function XpDialog({ xp, cards, good, answered, streak, games, onPlay, onGame, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const total = UNLOCK_ORDER.length;
  const progress = cardProgress(xp, cards);
  // Mini-jeu encore fermé : combien d'XP avant la carte qui l'ouvre.
  const xpToOpen = (g: XpGame) => Math.max(cardThreshold(g.unlockAt - 1) - xp, 0);
  const openGames = games.filter((g) => cards >= g.unlockAt);
  const lockedGames = games.filter((g) => cards < g.unlockAt);

  const go = (action: () => void) => {
    onClose();
    action();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ocean-900/60 p-4 sm:items-center" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="xp-info-title">
      <div className="rise-in max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl lg:max-w-5xl lg:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-turq-600">Points d’expérience</p>
            <h2 id="xp-info-title" className="font-display text-3xl font-semibold text-ocean-900 sm:text-4xl">
              {xp} <span className="text-xl text-ocean-700 sm:text-2xl">XP</span>
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className="rounded-full p-2 text-ocean-700 hover:bg-sable">
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        {/* Grand écran : deux colonnes (où j'en suis à gauche, comment gagner des XP à droite), tout visible sans défiler.
            Téléphone : une seule colonne, dans l'ordre progression, façons de gagner, astuce. */}
        <div className="mt-4 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:grid-rows-[auto_1fr] lg:gap-x-8 lg:gap-y-4">
          {/* Où j'en suis : la carte mystère et sa jauge. */}
          <div className="xp-next flex items-center gap-4 rounded-xl bg-ocean-800 p-4 text-white lg:col-start-1 lg:row-start-1 lg:self-start">
          <div className="w-16 flex-shrink-0 sm:w-20" aria-hidden="true">
            <CardBack mystery={!!progress} label=" " />
          </div>
          <div className="min-w-0 flex-1">
            {progress ? (
              <>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/70">
                  Carte {cards + 1} sur {total}
                </p>
                <p className="font-display text-xl font-semibold leading-tight">
                  Encore <span className="text-soleil-300">{progress.left} XP</span> pour l’ouvrir
                </p>
                <XpGauge have={progress.have} need={progress.need} className="mt-2 h-3 w-full" />
                <p className="mt-1 text-sm font-semibold tabular-nums text-white/70">
                  {progress.have} / {progress.need} XP
                </p>
              </>
            ) : (
              <p className="font-display text-xl font-semibold leading-tight">
                Collection complète : les <span className="text-soleil-300">{total} cartes</span> sont à toi !
              </p>
            )}
          </div>
        </div>
          <section className="mt-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0">
        <h3 className="font-display text-xl font-semibold text-ocean-900">Gagner des XP</h3>
        <ul className="mt-3 space-y-3 lg:space-y-2.5">
          {/* Le quiz : la source principale d'XP. */}
          {progress && (
            <li className="xp-way">
              <span className="xp-way-icon" aria-hidden="true">
                <HelpCircle className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold leading-snug text-ocean-900">Répondre aux questions</p>
                <p className="mt-0.5 text-sm leading-snug text-ocean-700">
                  +{XP_FLAT} XP par bonne réponse, +{XP_WHO[0]} XP à « Qui suis-je ? », +{XP_STREAK} XP en série.
                </p>
              </div>
              <button type="button" onClick={() => go(onPlay)} className="xp-cta">
                <Play className="h-4 w-4" fill="currentColor" strokeWidth={0} />
                Jouer
              </button>
            </li>
          )}

          {openGames.map((g) => {
            const left = (MAX_STARS - g.best) * XP_PER_GAME_STAR;
            return (
              <li key={g.id} className="xp-way">
                <img src={g.cover} alt="" className="xp-way-cover" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold leading-snug text-ocean-900">{g.title}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm leading-snug text-ocean-700">
                    <span className="inline-flex" aria-label={`Record : ${g.best} étoile${g.best > 1 ? 's' : ''} sur 3`}>
                      {[1, 2, 3].map((n) => (
                        <StarIcon key={n} filled={n <= g.best} className="h-4 w-4" />
                      ))}
                    </span>
                    {g.waiting
                      ? 'Il attend les questions de la classe.'
                      : left > 0
                        ? `+${XP_PER_GAME_STAR} XP par nouvelle étoile de record (encore ${left} XP).`
                        : 'Record maximum : tous les XP de ce jeu sont gagnés.'}
                  </p>
                </div>
                {!g.waiting && left > 0 && (
                  <button type="button" onClick={() => go(() => onGame(g.id))} className="xp-cta">
                    <Gamepad2 className="h-4 w-4" strokeWidth={2} />
                    {g.best ? 'Battre' : 'Jouer'}
                  </button>
                )}
                {!g.waiting && left === 0 && <Check className="h-6 w-6 flex-shrink-0 text-[#2e9d6a]" strokeWidth={2.4} aria-hidden="true" />}
              </li>
            );
          })}

          {lockedGames.map((g) => (
            <li key={g.id} className="xp-way is-locked">
              <img src={g.cover} alt="" className="xp-way-cover" />
              <div className="min-w-0 flex-1">
                <p className="font-bold leading-snug text-ocean-900">{g.title}</p>
                <p className="mt-0.5 text-sm leading-snug text-ocean-700">
                  S’ouvre à la {g.unlockAt}
                  <sup>e</sup> carte, dans {xpToOpen(g)} XP. Jusqu’à +{MAX_STARS * XP_PER_GAME_STAR} XP à y gagner.
                </p>
              </div>
              <Lock className="h-5 w-5 flex-shrink-0 text-ocean-700/60" strokeWidth={2} aria-hidden="true" />
            </li>
          ))}

          <li className="xp-way is-locked">
            <span className="xp-way-icon" aria-hidden="true">
              <BookOpen className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold leading-snug text-ocean-900">Encyclopédie du lagon</p>
              <p className="mt-0.5 text-sm leading-snug text-ocean-700">
                Lis un article puis réussis ses 3 questions : +{XP_ARTICLE_MASTERED} XP.
              </p>
            </div>
            <span className="xp-soon">Bientôt</span>
          </li>
        </ul>
          </section>

          <div className="lg:col-start-1 lg:row-start-2">
        {progress && (
        <p className="mt-5 flex gap-2 lg:mt-0 rounded-xl bg-sable px-4 py-3 text-base leading-snug text-ocean-800">
          <Lightbulb className="mt-0.5 h-5 w-5 flex-shrink-0 text-corail-500" strokeWidth={1.8} aria-hidden="true" />
          <span>
            Astuce : à « Qui suis-je ? », réponds dès le 1er indice pour {XP_WHO[0]} XP au lieu de {XP_WHO[2]}. Une erreur ne fait pas perdre d’XP, et la question reviendra plus tard.
          </span>
        </p>
        )}

        {answered > 0 && (
          <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold text-ocean-700">
            <span>
              {good} bonne{good > 1 ? 's' : ''} réponse{good > 1 ? 's' : ''} sur {answered}
            </span>
            {streak >= 2 && (
              <span className="inline-flex items-center gap-1 text-corail-600">
                <Flame className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                Série en cours : {streak}
              </span>
            )}
          </p>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
