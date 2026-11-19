import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';
import { ChevronLeft, ChevronRight, Droplet, Pause, Play, RotateCcw, Shell, Shield, Sprout, Users, Volume2, VolumeX, Waves, X } from 'lucide-react';
import './turtle.css';
import './race.css';
import { CARD_BY_ID, TYPE_THEME } from '../cards';
import { POKEMON_CARDS } from '../data.generated';
import { StarIcon } from '../icons';
import type { PokemonCardData } from '../types';
import { createRaceEngine } from './raceEngine';
import type { ItemKind, RaceEngine, RaceHud, RaceResult, RacerSetup } from './raceEngine';

type Phase = 'select' | 'play' | 'pause' | 'end';

const RIVALS = 5;

const ITEMS: Record<ItemKind, { Icon: typeof Sprout; label: string; text: string }> = {
  corail: { Icon: Sprout, label: 'Bouture de corail', text: 'Lance-la devant toi : elle se fixe sur le sable et devient un corail qui fait déraper.' },
  encre: { Icon: Droplet, label: 'Encre de zourite', text: 'Lâche un nuage d’encre derrière toi pour ralentir celui qui te suit.' },
  courant: { Icon: Waves, label: 'Courant porteur', text: 'Un coup d’accélérateur pour doubler tout le monde.' },
  bulle: { Icon: Shield, label: 'Bulle bouclier', text: 'Te protège du prochain piège.' },
};

const FACTS = [
  'Le corail est un animal. Quand une branche casse et retombe au bon endroit, elle peut se fixer et redonner un corail : c’est une bouture.',
  'Dans le jeu, le corail casse dès qu’on le touche. Dans le lagon aussi : un corail massif ne grandit que d’environ 1 cm par an. On nage au-dessus, on ne marche jamais dessus.',
  'Le zourite (le poulpe de La Réunion) crache un nuage d’encre pour disparaître quand il a peur.',
];

// Animaux du lagon qui complètent la grille tant que la collection est petite.
const LAGOON_RIVALS: RacerSetup[] = [
  { id: 'poisson-clown', name: 'Poisson-clown', color: '#ea5f2d', deep: '#b33b12' },
  { id: 'baliste-picasso', name: 'Baliste Picasso', color: '#e5b10b', deep: '#a87c00' },
  { id: 'poisson-perroquet', name: 'Poisson-perroquet', color: '#19b8c4', deep: '#0f8d9a' },
  { id: 'tortue-verte', name: 'Tortue verte', color: '#3fa565', deep: '#23733f' },
  { id: 'idole-des-maures', name: 'Idole des Maures', color: '#7f8f9c', deep: '#51606c' },
].map((r) => ({ ...r, art: `/images/reef-check/${r.id}.webp`, speed: 1, accel: 1 }));

/** Poids de la carte (ses PV) entre -1 et 1 : les costauds vont plus vite mais démarrent moins fort. */
const weight = (card: PokemonCardData) => Math.max(-1, Math.min(1, (card.hp - 100) / 20));

function setupFromCard(card: PokemonCardData): RacerSetup {
  const theme = TYPE_THEME[card.types[0]] ?? TYPE_THEME.Eau;
  const w = weight(card);
  return { id: card.id, name: card.name, art: card.art, color: theme.color, deep: theme.deep, speed: 1 + 0.03 * w, accel: 1 - 0.14 * w };
}

const shuffle = <T,>(list: T[]): T[] =>
  list
    .map((item) => ({ item, k: Math.random() }))
    .sort((a, b) => a.k - b.k)
    .map(({ item }) => item);

const rankLabel = (rank: number) => (rank === 1 ? '1re' : `${rank}e`);
const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

function Pips({ value }: { value: number }) {
  return (
    <span className="flex gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={`h-1.5 w-3.5 rounded-full ${n <= value ? 'bg-corail-500' : 'bg-ocean-900/15'}`} />
      ))}
    </span>
  );
}

interface Props {
  best: number;
  /** Cartes gagnées : ce sont les seuls personnages jouables. */
  unlocked: string[];
  onFinish: (stars: number) => void;
  onClose: () => void;
}

export default function RaceGame({ best, unlocked, onFinish, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<RaceEngine | null>(null);
  const finishRef = useRef(onFinish);
  const pilots = useMemo(() => unlocked.map((id) => CARD_BY_ID[id]).filter(Boolean), [unlocked]);
  const [pick, setPick] = useState(pilots[0]?.id ?? '');
  const [phase, setPhase] = useState<Phase>('select');
  const [hud, setHud] = useState<RaceHud | null>(null);
  const [count, setCount] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ text: string; n: number } | null>(null);
  const [result, setResult] = useState<RaceResult | null>(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    finishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    const engine = createRaceEngine(canvasRef.current!, {
      onHud: setHud,
      onCountdown: setCount,
      onBanner: (text) => setBanner((b) => ({ text, n: (b?.n ?? 0) + 1 })),
      onEnd: (r) => {
        setResult(r);
        setPhase('end');
        finishRef.current(r.stars);
        if (r.stars > 0) {
          const colors = ['#fbd679', '#5fd9d2', '#f2674a', '#ffffff', '#63c777'];
          confetti({ particleCount: 40 * r.stars, spread: 100, startVelocity: 46, origin: { y: 0.6 }, colors, zIndex: 90 });
        }
      },
    });
    engineRef.current = engine;
    // Accès console pour les tests, en développement uniquement.
    if (import.meta.env.DEV) (window as unknown as { __race?: RaceEngine }).__race = engine;
    document.body.style.overflow = 'hidden';
    return () => {
      engine.destroy();
      engineRef.current = null;
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    engineRef.current?.setMuted(muted);
  }, [muted]);

  useEffect(() => {
    const onVisibility = () => document.hidden && setPhase((p) => (p === 'play' ? 'pause' : p));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPhase((p) => (p === 'play' ? 'pause' : p === 'pause' ? 'play' : p));
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    engineRef.current?.setPaused(phase === 'pause');
  }, [phase]);

  const start = () => {
    const card = CARD_BY_ID[pick];
    if (!card) return;
    // Les rivaux : d'abord les autres cartes gagnées, puis des animaux du lagon pour compléter la grille.
    const others = shuffle(pilots.filter((c) => c.id !== pick)).map(setupFromCard);
    const rivals = [...others, ...shuffle(LAGOON_RIVALS)].slice(0, RIVALS);
    setResult(null);
    setBanner(null);
    setHud(null);
    engineRef.current?.start(setupFromCard(card), shuffle(rivals));
    setPhase('play');
    // Le bouton « C'est parti » garderait le focus : Espace relancerait la course au lieu de lancer l'objet.
    (document.activeElement as HTMLElement | null)?.blur();
  };

  const inGame = phase === 'play' || phase === 'pause';
  const iconBtn = 'flex h-11 w-11 items-center justify-center rounded-full bg-ocean-900/55 text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-ocean-900/80';
  const item = hud?.item ? ITEMS[hud.item] : null;
  const locked = POKEMON_CARDS.length - pilots.length;

  return createPortal(
    <div className="tg-root" role="dialog" aria-modal="true" aria-label="Mini-jeu : La Grande Course du Lagon">
      <canvas ref={canvasRef} className="tg-canvas rg-canvas" />

      {inGame && hud && (
        <>
          <div className="rg-rank" aria-live="polite">
            <p className="rg-place">
              {rankLabel(hud.rank)}
              <span>/ {hud.total}</span>
            </p>
            <p className="rg-lap">
              Tour {hud.lap} / {hud.laps}
            </p>
          </div>
          <span className="rg-touch is-left" aria-hidden="true">
            <ChevronLeft strokeWidth={2.4} />
          </span>
          <span className="rg-touch is-right" aria-hidden="true">
            <ChevronRight strokeWidth={2.4} />
          </span>
          <button type="button" className={`rg-item${item ? ' is-ready' : ''}`} onPointerDown={() => engineRef.current?.useItem()} disabled={!item} aria-label={item ? `Utiliser : ${item.label}` : 'Aucun objet'}>
            {item ? <item.Icon strokeWidth={2} /> : <Shell strokeWidth={1.6} />}
            <span>{item ? item.label : 'Ramasse un coquillage'}</span>
          </button>
        </>
      )}

      <div className="absolute right-3 top-3 z-[3] flex gap-2 sm:right-4 sm:top-4">
        <button type="button" onClick={() => setMuted((m) => !m)} className={iconBtn} aria-label={muted ? 'Activer le son' : 'Couper le son'}>
          {muted ? <VolumeX className="h-5 w-5" strokeWidth={2} /> : <Volume2 className="h-5 w-5" strokeWidth={2} />}
        </button>
        {inGame && (
          <button type="button" onClick={() => setPhase(phase === 'play' ? 'pause' : 'play')} className={iconBtn} aria-label={phase === 'play' ? 'Pause' : 'Reprendre'}>
            {phase === 'play' ? <Pause className="h-5 w-5" strokeWidth={2} /> : <Play className="h-5 w-5" strokeWidth={2} />}
          </button>
        )}
        <button type="button" onClick={onClose} className={iconBtn} aria-label="Quitter le mini-jeu">
          <X className="h-5 w-5" strokeWidth={2} />
        </button>
      </div>

      {phase === 'play' && count && (
        <p key={count} className="rg-count" role="status">
          {count}
        </p>
      )}
      {phase === 'play' && banner && !count && (
        <p key={banner.n} className="tg-banner" role="status">
          {banner.text}
        </p>
      )}

      {phase === 'select' && (
        <div className="tg-overlay">
          <div className="tg-panel rise-in">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-turq-600 sm:text-sm">Mini-jeu du lagon</p>
            <h2 className="mt-1 font-display text-3xl font-semibold leading-tight text-ocean-900 sm:text-5xl">La Grande Course du Lagon</h2>
            <p className="mt-2 text-base leading-snug text-ocean-700 sm:text-xl">Trois tours du chenal de sable. Choisis ton pilote parmi les cartes que tu as gagnées.</p>

            <div className="rg-pilots mt-4 sm:mt-5">
              {pilots.map((card) => {
                const w = Math.round(weight(card) * 2);
                return (
                  <button key={card.id} type="button" onClick={() => setPick(card.id)} className={`rg-pilot${pick === card.id ? ' is-picked' : ''}`} aria-pressed={pick === card.id}>
                    <img src={card.art} alt="" />
                    <span className="block px-2.5 pb-2.5 pt-2 text-left">
                      <b className="block truncate font-display text-base font-semibold leading-tight text-ocean-900">{card.name}</b>
                      <span className="mt-1.5 flex items-center justify-between gap-2 text-[0.7rem] font-bold uppercase tracking-[0.06em] text-ocean-700">
                        Vitesse <Pips value={3 + w} />
                      </span>
                      <span className="mt-1 flex items-center justify-between gap-2 text-[0.7rem] font-bold uppercase tracking-[0.06em] text-ocean-700">
                        Départ <Pips value={3 - w} />
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            {locked > 0 && (
              <p className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-ocean-700 sm:text-base">
                <Users className="h-4 w-4 flex-shrink-0" strokeWidth={2} />
                Encore {locked} pilote{locked > 1 ? 's' : ''} à débloquer en gagnant des cartes au quiz.
              </p>
            )}

            <ul className="mt-4 grid gap-2.5 text-left sm:grid-cols-2 sm:gap-x-5">
              {(Object.keys(ITEMS) as ItemKind[]).map((kind) => {
                const { Icon, label, text } = ITEMS[kind];
                return (
                  <li key={kind} className="flex gap-3">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-ocean-800 text-soleil-300">
                      <Icon className="h-5 w-5" strokeWidth={2} />
                    </span>
                    <span>
                      <b className="block font-display text-base font-semibold leading-tight text-ocean-900">{label}</b>
                      <span className="block text-sm leading-snug text-ocean-700">{text}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 rounded-xl bg-sable px-4 py-2.5 text-sm font-semibold text-ocean-800 sm:text-base">
              Ta bulle avance toute seule. Tourne avec les flèches gauche et droite, lance ton objet avec Espace. Sur tablette : appuie à gauche ou à droite de l’écran, et touche le bouton de l’objet.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
              <button type="button" onClick={start} className="btn-play">
                <Play fill="currentColor" strokeWidth={0} />
                C’est parti
              </button>
              {best > 0 && (
                <span className="inline-flex items-center gap-1 font-display text-lg font-semibold text-ocean-800">
                  Ton record :
                  {[1, 2, 3].map((n) => (
                    <StarIcon key={n} filled={n <= best} className="h-6 w-6" />
                  ))}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {phase === 'pause' && (
        <div className="tg-overlay">
          <div className="tg-panel rise-in max-w-sm text-center">
            <h2 className="font-display text-4xl font-semibold text-ocean-900">Pause</h2>
            <div className="mt-5 flex flex-col gap-3">
              <button type="button" onClick={() => setPhase('play')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-corail-500 px-6 py-3.5 font-display text-xl font-semibold text-white shadow-lg transition hover:bg-corail-600">
                <Play className="h-5 w-5" fill="currentColor" strokeWidth={0} />
                Reprendre
              </button>
              <button type="button" onClick={onClose} className="rounded-xl px-6 py-3 text-lg font-bold text-ocean-800 ring-1 ring-ocean-900/25 transition hover:bg-sable">
                Quitter le mini-jeu
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'end' && result && (
        <div className="tg-overlay">
          <div className="tg-panel rise-in">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-turq-600 sm:text-sm">Course terminée en {formatTime(result.time)}</p>
            <h2 className="mt-1 font-display text-3xl font-semibold leading-tight text-ocean-900 sm:text-4xl">
              {result.rank === 1 ? 'Victoire ! Tu es champion du lagon' : result.rank <= 3 ? `${rankLabel(result.rank)} place : tu montes sur le podium !` : `${rankLabel(result.rank)} place sur ${result.total}`}
            </h2>
            <div className="mt-3 flex justify-center gap-2">
              {[1, 2, 3].map((n) => (
                <span key={n} className="tg-star" style={{ animationDelay: `${0.25 + n * 0.22}s` }}>
                  <StarIcon filled={n <= result.stars} className="h-12 w-12 sm:h-14 sm:w-14" />
                </span>
              ))}
            </div>
            {result.stars === 0 && <p className="mt-2 text-base text-ocean-800 sm:text-lg">Finis dans les trois premiers pour gagner des étoiles. Garde ta bouture pour celui qui est juste devant toi.</p>}

            <ol className="rg-order mt-4">
              {result.order.map((r, i) => (
                <li key={r.id} className={r.isPlayer ? 'is-player' : ''}>
                  <span className="rg-order-rank">{i + 1}</span>
                  <img src={r.art} alt="" />
                  <span className="truncate">{r.isPlayer ? `${r.name} (toi)` : r.name}</span>
                </li>
              ))}
            </ol>

            <dl className="mt-4 grid grid-cols-3 divide-x divide-ocean-900/10 rounded-xl bg-sable py-2.5 text-center">
              {[
                { label: 'Boutures lancées', value: result.planted },
                { label: 'Rivaux piégés', value: result.hitsGiven },
                { label: 'Pièges touchés', value: result.hitsTaken },
              ].map(({ label, value }) => (
                <div key={label} className="px-1">
                  <dd className="font-display text-2xl font-semibold text-ocean-900">{value}</dd>
                  <dt className="text-[0.65rem] font-bold uppercase leading-tight tracking-[0.08em] text-ocean-700 sm:text-xs">{label}</dt>
                </div>
              ))}
            </dl>

            <div className="mt-4 text-left">
              <h3 className="font-display text-xl font-semibold text-ocean-900">Le savais-tu ?</h3>
              <ul className="mt-2 space-y-2 text-sm leading-snug text-ocean-800 sm:text-base">
                {FACTS.map((fact) => (
                  <li key={fact} className="flex gap-2.5">
                    <span className="mt-[0.45em] h-2 w-2 flex-shrink-0 rounded-full bg-corail-500" />
                    {fact}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button type="button" onClick={start} className="inline-flex items-center gap-2 rounded-xl bg-corail-500 px-6 py-3.5 font-display text-xl font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-corail-600">
                <RotateCcw className="h-5 w-5" strokeWidth={2} />
                Rejouer
              </button>
              <button type="button" onClick={() => setPhase('select')} className="rounded-xl px-5 py-3.5 text-lg font-bold text-ocean-800 ring-1 ring-ocean-900/25 transition hover:bg-sable">
                Changer de pilote
              </button>
              <button type="button" onClick={onClose} className="rounded-xl px-5 py-3.5 text-lg font-bold text-ocean-800 ring-1 ring-ocean-900/25 transition hover:bg-sable">
                Retour au quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}
