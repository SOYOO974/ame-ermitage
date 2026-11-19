import { useState } from 'react';
import { Lock, Play } from 'lucide-react';
import { GOOD_ANSWERS_PER_CARD_UNLOCK } from './config';
import { CARD_BY_ID } from './cards';
import { CardBack, PokemonCard } from './PokemonCard';
import { UNLOCK_ORDER } from './useGameState';

interface Props {
  unlocked: string[];
  towardNext: number;
  onPlay: () => void;
  onCollection: () => void;
}

const plural = (n: number) => `${n} bonne${n > 1 ? 's' : ''} réponse${n > 1 ? 's' : ''}`;

/**
 * Éventail de l'accueil. Règle : tout ce qui se voit se touche.
 * Carte mystère = jouer ; carte gagnée = collection ; carte verrouillée = elle tremble et dit pourquoi.
 */
export function HomeDeck({ unlocked, towardNext, onPlay, onCollection }: Props) {
  const [nudge, setNudge] = useState<{ slot: number; n: number } | null>(null);
  const complete = unlocked.length >= UNLOCK_ORDER.length;
  const recent = [...unlocked].reverse();
  const sides = complete ? recent.slice(1, 3) : recent.slice(0, 2);
  const left = GOOD_ANSWERS_PER_CARD_UNLOCK - towardNext;

  const message = complete
    ? `Bravo, tu as les ${UNLOCK_ORDER.length} cartes ! Touche-les pour les revoir.`
    : nudge
      ? 'Carte verrouillée ! Joue pour la gagner.'
      : towardNext === 0
        ? `Réponds bien à ${GOOD_ANSWERS_PER_CARD_UNLOCK} questions pour m’ouvrir !`
        : `Encore ${plural(left)} pour m’ouvrir !`;

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-5">
      <p key={nudge?.n ?? 0} className="deck-bubble" aria-live="polite">
        {message}
      </p>

      <div className="relative h-[17.5rem] w-full sm:h-[22.5rem]">
        {[0, 1].map((slot) => {
          const id = sides[slot];
          const shaking = nudge?.slot === slot;
          return (
            <div key={slot} className={`absolute top-[10%] w-[46%] ${slot === 0 ? 'left-[2%] -rotate-[10deg]' : 'right-[2%] rotate-[10deg]'}`}>
              <div className={slot === 0 ? 'float-b' : 'float-c'}>
                {id ? (
                  <button type="button" onClick={onCollection} className="deck-btn" aria-label={`Voir la carte ${CARD_BY_ID[id].name}`}>
                    <PokemonCard card={CARD_BY_ID[id]} />
                  </button>
                ) : (
                  <button
                    key={shaking ? nudge.n : 0}
                    type="button"
                    onClick={() => setNudge({ slot, n: (nudge?.n ?? 0) + 1 })}
                    className={`deck-btn${shaking ? ' lock-shake' : ''}`}
                    aria-label="Carte verrouillée : joue pour la gagner"
                  >
                    <CardBack locked label=" " />
                    <Lock className="absolute left-1/2 top-[12%] h-6 w-6 -translate-x-1/2 text-[#f3e2ad]" strokeWidth={1.8} />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        <div className="absolute left-1/2 top-0 w-[56%] -translate-x-1/2">
          <div className="float-a">
            {complete ? (
              <button type="button" onClick={onCollection} className="deck-btn" aria-label="Voir ma collection">
                <PokemonCard card={CARD_BY_ID[recent[0]]} />
              </button>
            ) : (
              <button type="button" onClick={onPlay} className="deck-btn" aria-label="Jouer pour ouvrir la carte mystère">
                <CardBack mystery label="Carte mystère" />
                <span className="deck-tap">
                  <Play fill="currentColor" strokeWidth={0} />
                  Touche pour jouer
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {!complete && (
        <div className="flex items-center gap-3 font-display text-xl font-semibold text-white" aria-label={`${towardNext} bonnes réponses sur ${GOOD_ANSWERS_PER_CARD_UNLOCK}`}>
          <span className="flex w-36 gap-1.5" aria-hidden="true">
            {Array.from({ length: GOOD_ANSWERS_PER_CARD_UNLOCK }, (_, i) => (
              <span key={i} className={`gauge-seg h-3.5 flex-1 rounded-full ${i < towardNext ? 'is-on' : ''}`} />
            ))}
          </span>
          <span className="text-soleil-300">
            {towardNext}/{GOOD_ANSWERS_PER_CARD_UNLOCK}
          </span>
        </div>
      )}
    </div>
  );
}
