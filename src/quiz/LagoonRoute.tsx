import { Fragment, useEffect, useRef } from 'react';
import { Check, Flame } from 'lucide-react';
import { CARD_BY_ID } from './cards';
import { cardProgress, UNLOCK_ORDER } from './useGameState';

interface Props {
  unlocked: string[];
  xp: number;
  streak: number;
}

/** Jauge d'XP vers la prochaine carte (barre continue, remplie à la proportion du palier). */
export function XpGauge({ have, need, className = '' }: { have: number; need: number; className?: string }) {
  return (
    <span className={`xp-bar ${className}`} aria-hidden="true">
      <span style={{ transform: `scaleX(${need ? have / need : 1})` }} />
    </span>
  );
}

/** Route du Lagon : un jalon sobre par carte (coche dorée = carte gagnée), seule la prochaine carte est illustrée, en « mystère » flouté. */
export function LagoonRoute({ unlocked, xp, streak }: Props) {
  const nextId = UNLOCK_ORDER.find((id) => !unlocked.includes(id));
  const progress = cardProgress(xp, unlocked.length);
  const scroller = useRef<HTMLDivElement>(null);
  const nextNode = useRef<HTMLDivElement>(null);

  // Sur petit écran la route défile : on garde la carte mystère au centre.
  useEffect(() => {
    const box = scroller.current;
    const node = nextNode.current;
    if (box && node)
      box.scrollTo({
        left: node.offsetLeft - box.clientWidth / 2 + node.offsetWidth / 2,
        behavior: 'smooth',
      });
  }, [nextId]);

  return (
    <div className="route-box rounded-2xl bg-ocean-800 px-4 pb-2 pt-3 text-white shadow-lg sm:px-5 sm:pt-4">
      <div className="flex items-start justify-between gap-3">
        <div className="route-status min-w-0">
          {nextId && progress ? (
            <>
              <p className="font-display text-lg font-semibold leading-tight sm:text-xl">
                <span className="text-soleil-300">
                  {progress.have} / {progress.need} XP
                </span>{' '}
                <span className="route-long">avant la </span>carte mystère !
              </p>
              <XpGauge have={progress.have} need={progress.need} className="route-gauge mt-2 h-2.5 w-40" />
            </>
          ) : (
            <p className="font-display text-lg font-semibold sm:text-xl">Collection complète : les {UNLOCK_ORDER.length} cartes de la classe sont à toi !</p>
          )}
        </div>
        <div className="flex flex-shrink-0 items-center gap-3">
          {streak >= 2 && (
            <span key={streak} className={`streak-chip pop${streak >= 5 ? ' is-hot' : ''}`} title="Bonnes réponses d'affilée">
              <Flame className="h-5 w-5" strokeWidth={2} />
              Série x{streak}
            </span>
          )}
          <p className="hidden text-right font-display text-2xl font-semibold leading-none sm:block">
            {unlocked.length}
            <span className="text-white/60">/{UNLOCK_ORDER.length}</span>
            <span className="block pt-1 font-sans text-xs font-bold uppercase tracking-[0.15em] text-white/70">cartes</span>
          </p>
        </div>
      </div>

      {/* Collection complète : la route n'a plus rien à annoncer, on la retire. */}
      {nextId && (
        <div ref={scroller} className="route mt-1" role="img" aria-label={`Route du Lagon : ${unlocked.length} cartes gagnées sur ${UNLOCK_ORDER.length}`}>
          {UNLOCK_ORDER.map((id, i) => {
            const card = CARD_BY_ID[id];
            const owned = unlocked.includes(id);
            const isNext = id === nextId;
            const fill = owned ? 1 : isNext && progress ? progress.have / progress.need : 0;
            return (
              <Fragment key={id}>
                {i > 0 && (
                  <span className="route-link">
                    <span style={{ transform: `scaleX(${fill})` }} />
                  </span>
                )}
                <div ref={isNext ? nextNode : undefined} className={`route-node ${owned ? 'is-owned' : isNext ? 'is-next' : 'is-locked'}`}>
                  {owned && <Check strokeWidth={3.2} />}
                  {isNext && (
                    <>
                      <img src={card.art} alt="" className="is-mystery" draggable={false} />
                      <span className="route-q">?</span>
                    </>
                  )}
                  {!owned && !isNext && <span>{i + 1}</span>}
                </div>
              </Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}
