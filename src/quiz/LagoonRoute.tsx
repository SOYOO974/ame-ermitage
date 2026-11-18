import { Fragment, useEffect, useRef } from 'react';
import { Check, Flame } from 'lucide-react';
import { GOOD_ANSWERS_PER_CARD_UNLOCK } from './config';
import { CARD_BY_ID } from './cards';
import { UNLOCK_ORDER } from './useGameState';

interface Props {
  unlocked: string[];
  towardNext: number;
  streak: number;
}

/** Route du Lagon : 12 jalons sobres (coche dorée = carte gagnée), seule la prochaine carte est illustrée, en « mystère » flouté. */
export function LagoonRoute({ unlocked, towardNext, streak }: Props) {
  const nextId = UNLOCK_ORDER.find((id) => !unlocked.includes(id));
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
    <div className="rounded-2xl bg-ocean-800 px-4 pb-2 pt-3 text-white shadow-lg sm:px-5 sm:pt-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {nextId ? (
            <>
              <p className="font-display text-lg font-semibold leading-tight sm:text-xl">
                <span className="text-soleil-300">
                  {towardNext} / {GOOD_ANSWERS_PER_CARD_UNLOCK}
                </span>{' '}
                bonnes réponses avant la carte mystère !
              </p>
              <div className="mt-2 flex w-40 gap-1.5" aria-hidden="true">
                {Array.from({ length: GOOD_ANSWERS_PER_CARD_UNLOCK }, (_, i) => (
                  <span key={i} className={`gauge-seg h-2.5 flex-1 rounded-full ${i < towardNext ? 'is-on' : ''}`} />
                ))}
              </div>
            </>
          ) : (
            <p className="font-display text-lg font-semibold sm:text-xl">Collection complète : les 12 cartes de la classe sont à toi !</p>
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
            const fill = owned ? 1 : isNext ? towardNext / GOOD_ANSWERS_PER_CARD_UNLOCK : 0;
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
