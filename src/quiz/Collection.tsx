import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';
import { ArrowRight, ChevronLeft, ChevronRight, Layers, Lock, Play, X } from 'lucide-react';
import { GOOD_ANSWERS_PER_CARD_UNLOCK } from './config';
import { POKEMON_CARDS } from './data.generated';
import { UNLOCK_ORDER } from './useGameState';
import { rarityTier, signature, TIER_LABEL } from './cards';
import { CardBack, PokemonCard } from './PokemonCard';
import { TypeIcon } from './icons';
import type { PokemonCardData } from './types';

/** Couleur du halo par palier de rareté (index 1 à 4). */
const TIER_GLOW = ['', '#8fd3e8', '#5fd9a0', '#ff8f7a', '#fbd679'];

// ---------------------------------------------------------------------------
// Cérémonie d'ouverture d'une carte
// ---------------------------------------------------------------------------
export function UnlockCeremony({ card, onClose, onSeeCollection }: { card: PokemonCardData; onClose: () => void; onSeeCollection: () => void }) {
  const tier = rarityTier(card);
  const [open, setOpen] = useState(false);
  // Suspense : la carte démarre « Peu commune » et chaque touche peut la faire monter d'un palier de rareté.
  const [level, setLevel] = useState(1);

  const reveal = () => {
    if (open) return;
    if (level < tier) {
      setLevel(level + 1);
      confetti({ particleCount: 18 + level * 10, spread: 360, startVelocity: 22, origin: { y: 0.5 }, colors: [TIER_GLOW[level + 1], '#ffffff'], scalar: 0.8, zIndex: 80 });
      return;
    }
    setOpen(true);
    const colors = ['#fbd679', '#5fd9d2', '#f2674a', '#ffffff', '#19b8c4'];
    const boost = 0.6 + tier * 0.25;
    window.setTimeout(() => {
      confetti({ particleCount: Math.round(110 * boost), spread: 90, startVelocity: 48, origin: { y: 0.55 }, colors, zIndex: 80 });
      confetti({ particleCount: Math.round(55 * boost), angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors, zIndex: 80 });
      confetti({ particleCount: Math.round(55 * boost), angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors, zIndex: 80 });
    }, 550);
    if (tier === 4) {
      window.setTimeout(() => confetti({ particleCount: 160, spread: 160, startVelocity: 55, origin: { y: 0.4 }, colors: ['#fbd679', '#f5b921', '#fff6c9'], zIndex: 80 }), 1100);
    }
  };

  return (
    <div
      className={`ceremony${open ? ' is-open' : ''}`}
      style={{ '--glow': TIER_GLOW[level] } as CSSProperties}
      role="dialog"
      aria-modal="true"
      aria-label="Nouvelle carte débloquée"
    >
      <div className="ceremony-rays" />
      <div className="ceremony-halo" />

      <p className="relative z-[1] text-center text-sm font-bold uppercase tracking-[0.25em] text-soleil-300">
        {open ? `Carte #${card.number} débloquée` : 'Nouvelle carte de la classe'}
      </p>
      {/* key : rejoue l'animation à chaque montée de palier */}
      <p key={open ? 'label-fin' : `label-${level}`} className="tier-up relative z-[1] -mt-2 text-center font-display text-3xl font-semibold uppercase tracking-[0.08em] sm:text-4xl" style={{ color: TIER_GLOW[level] }}>
        {open ? card.rarity : TIER_LABEL[level]}
      </p>

      <div key={`punch-${level}`} className={`ceremony-punch${level > 1 ? ' is-up' : ''}`}>
        <div className={`flip${open ? ' is-open' : ''}`}>
          <div className="flip-inner">
            <div className="flip-face">
              <PokemonCard card={card} interactive={open} showToggle={open} />
            </div>
            <div
              className="flip-face is-back"
              onClick={reveal}
              role="button"
              tabIndex={0}
              aria-label="Retourner la carte"
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && reveal()}
            >
              <CardBack label="Touche la carte" />
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-[1] flex min-h-[5.5rem] flex-col items-center gap-3 text-center">
        {open ? (
          <div className="rise-in flex flex-col items-center gap-3" style={{ animationDelay: '0.7s' }}>
            <p className="font-display text-2xl font-semibold text-white sm:text-3xl">
              {card.name} <span className="text-soleil-300">· {signature(card)}</span>
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button type="button" onClick={onSeeCollection} className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-5 py-3 text-lg font-bold text-white ring-1 ring-white/40 transition hover:bg-white/25">
                <Layers className="h-5 w-5" strokeWidth={1.8} />
                Voir la collection
              </button>
              <button type="button" onClick={onClose} className="inline-flex items-center gap-2 rounded-xl bg-corail-500 px-6 py-3 font-display text-xl font-semibold text-white shadow-lg transition hover:bg-corail-600">
                Continuer le quiz
                <ArrowRight className="h-5 w-5" strokeWidth={1.8} />
              </button>
            </div>
          </div>
        ) : (
          <p className="animate-pulse font-display text-2xl font-semibold text-white">{level === 1 ? 'Touche la carte !' : 'Elle monte en rareté ! Touche encore !'}</p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Vue zoomée plein écran
// ---------------------------------------------------------------------------
function CardZoom({ card, onClose, onPrev, onNext }: { card: PokemonCardData; onClose: () => void; onPrev?: () => void; onNext?: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev?.();
      if (e.key === 'ArrowRight') onNext?.();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, onPrev, onNext]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ocean-900/90 backdrop-blur-sm" style={{ animation: 'fade-in 0.25s ease' }} role="dialog" aria-modal="true" aria-label={card.name} onClick={onClose}>
      <button type="button" onClick={onClose} aria-label="Fermer" className="fixed right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white text-ocean-900 shadow-lg transition hover:bg-soleil-300">
        <X className="h-6 w-6" strokeWidth={2} />
      </button>
      <div className="mx-auto flex min-h-full max-w-5xl flex-col items-center justify-center gap-6 px-4 py-16 lg:flex-row lg:items-center lg:gap-10" onClick={(e) => e.stopPropagation()}>
        <div className="flex w-full items-center justify-center gap-2 lg:w-auto">
          {onPrev && (
            <button type="button" onClick={onPrev} aria-label="Carte précédente" className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/30 transition hover:bg-white/30">
              <ChevronLeft className="h-6 w-6" strokeWidth={2} />
            </button>
          )}
          {/* key : repart sur l'illustration sublimée à chaque changement de carte */}
          <div key={card.id} className="rise-in w-[min(72vw,calc(80vh*2.5/3.5),27rem)]">
            <PokemonCard card={card} interactive showToggle />
          </div>
          {onNext && (
            <button type="button" onClick={onNext} aria-label="Carte suivante" className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/30 transition hover:bg-white/30">
              <ChevronRight className="h-6 w-6" strokeWidth={2} />
            </button>
          )}
        </div>

        <div className="w-full max-w-md text-white">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-soleil-300">
            #{card.number} · {card.rarity}
          </p>
          <h2 className="mt-1 font-display text-4xl font-semibold">{card.name}</h2>
          <p className="mt-1 text-lg font-semibold text-turq-300">{signature(card)}</p>
          <p className="mt-4 text-lg leading-snug">{card.description}</p>
          <dl className="mt-4 space-y-1 text-base text-white/85">
            <div className="flex gap-2">
              <dt className="flex-shrink-0 whitespace-nowrap font-bold text-white">Habitat :</dt>
              <dd>{card.habitat}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="flex-shrink-0 whitespace-nowrap font-bold text-white">Inspiré de :</dt>
              <dd>{card.inspiredBy}</dd>
            </div>
          </dl>
          <ul className="mt-5 space-y-3">
            {card.attacks.map((a) => (
              <li key={a.name} className="border-t border-white/20 pt-3">
                <div className="flex items-baseline justify-between gap-3 font-display text-xl font-semibold">
                  <span className="inline-flex items-center gap-2">
                    <TypeIcon type={card.types[0]} size="1.4rem" />
                    {a.name}
                  </span>
                  <span className="text-soleil-300">{a.damage > 0 ? a.damage : 'Soin'}</span>
                </div>
                <p className="mt-1 text-base text-white/85">{a.effect}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Onglet « Collection de la Classe »
// ---------------------------------------------------------------------------
export function CollectionView({ unlocked, towardNext, seen, onSeen, onPlay }: { unlocked: string[]; towardNext: number; seen: string[]; onSeen: (id: string) => void; onPlay: () => void }) {
  const [zoomId, setZoomId] = useState<string | null>(null);
  // Carte verrouillée touchée : elle tremble et un message dit comment la gagner.
  const [hint, setHint] = useState<{ id: string; n: number } | null>(null);
  const nextId = UNLOCK_ORDER.find((id) => !unlocked.includes(id));
  const left = GOOD_ANSWERS_PER_CARD_UNLOCK - towardNext;

  useEffect(() => {
    if (!hint) return;
    const timer = window.setTimeout(() => setHint(null), 5000);
    return () => window.clearTimeout(timer);
  }, [hint]);

  const owned = POKEMON_CARDS.filter((c) => unlocked.includes(c.id));
  const zoomIndex = owned.findIndex((c) => c.id === zoomId);
  const open = (id: string) => {
    setZoomId(id);
    onSeen(id);
  };
  const step = (delta: number) => open(owned[(zoomIndex + delta + owned.length) % owned.length].id);

  return (
    <section className="rise-in">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.15em] text-turq-600">Créées par les élèves de CM2</p>
          <h2 className="font-display text-3xl font-semibold text-ocean-900 sm:text-4xl">
            Collection de la Classe{' '}
            <span className="text-corail-500">
              {owned.length}/{POKEMON_CARDS.length}
            </span>
          </h2>
          <p className="mt-1 max-w-2xl text-lg text-ocean-700">
            {owned.length === 0
              ? `Tu n'as pas encore de carte. Réponds bien à ${GOOD_ANSWERS_PER_CARD_UNLOCK} questions pour gagner la première !`
              : 'Chaque carte a été dessinée par un élève. Touche une carte pour la voir en grand et comparer avec son dessin original.'}
          </p>
        </div>
        {nextId && (
          <button type="button" onClick={onPlay} className="inline-flex items-center gap-2 rounded-xl bg-corail-500 px-5 py-3 font-display text-lg font-semibold text-white shadow transition hover:bg-corail-600">
            <Play className="h-5 w-5" fill="currentColor" strokeWidth={0} />
            Jouer pour gagner des cartes
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
        {POKEMON_CARDS.map((card, i) => (
          /* L'animation d'entrée est portée par ce conteneur pour ne pas bloquer le survol du bouton. */
          <div key={card.id} className="rise-in" style={{ animationDelay: `${i * 0.05}s` }}>
            {unlocked.includes(card.id) ? (
              <button type="button" onClick={() => open(card.id)} className="relative block w-full rounded-[4.6%/3.3%] text-left transition duration-200 hover:-translate-y-1.5 focus-visible:outline focus-visible:outline-4 focus-visible:outline-soleil-400" aria-label={`Voir la carte ${card.name}`}>
                <PokemonCard card={card} />
                {!seen.includes(card.id) && <span className="new-badge">Nouveau</span>}
              </button>
            ) : card.id === nextId ? (
              <button type="button" onClick={onPlay} className="deck-btn" aria-label="Jouer pour ouvrir la prochaine carte">
                <CardBack mystery label="Prochaine carte" />
                <span className="deck-tap">
                  <Play fill="currentColor" strokeWidth={0} />
                  Jouer
                </span>
              </button>
            ) : (
              <button
                key={hint?.id === card.id ? hint.n : 0}
                type="button"
                onClick={() => setHint({ id: card.id, n: (hint?.n ?? 0) + 1 })}
                className={`deck-btn${hint?.id === card.id ? ' lock-shake' : ''}`}
                aria-label={`Carte ${card.number} verrouillée`}
              >
                <CardBack number={card.number} locked label="À gagner" />
                <Lock className="absolute right-[8%] top-[6%] h-5 w-5 text-[#f3e2ad]" strokeWidth={1.8} />
              </button>
            )}
          </div>
        ))}
      </div>

      {hint &&
        createPortal(
          <div key={hint.n} className="lock-toast" role="status">
            <Lock className="h-6 w-6 flex-shrink-0 text-soleil-300" strokeWidth={1.8} />
            <span className="min-w-0 flex-1">
              Carte verrouillée ! Encore {left} bonne{left > 1 ? 's' : ''} réponse{left > 1 ? 's' : ''} pour gagner ta prochaine carte.
            </span>
            <button type="button" onClick={onPlay}>
              <Play className="h-4 w-4" fill="currentColor" strokeWidth={0} />
              Jouer
            </button>
          </div>,
          document.body,
        )}

      {/* Portail : la section est animée (transform), ce qui casserait le position: fixed. */}
      {zoomIndex >= 0 &&
        createPortal(
          <CardZoom
            card={owned[zoomIndex]}
            onClose={() => setZoomId(null)}
            onPrev={owned.length > 1 ? () => step(-1) : undefined}
            onNext={owned.length > 1 ? () => step(1) : undefined}
          />,
          document.body,
        )}
    </section>
  );
}
