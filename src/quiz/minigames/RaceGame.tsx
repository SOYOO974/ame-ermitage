import { useEffect, useMemo, useRef, useState } from 'react';
import type React from 'react';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ChevronsDown, ChevronsUp, Lock, Pause, Play, RotateCcw, Shell, Users, Volume2, VolumeX, X, Zap } from 'lucide-react';
import './turtle.css';
import './race.css';
import { CARD_BY_ID, TYPE_THEME } from '../cards';
import { POKEMON_CARDS } from '../data.generated';
import { StarIcon } from '../icons';
import type { PokemonCardData } from '../types';
import { QUESTIONS_PER_NEW_GAME } from '../config';
import { CIRCUITS, CIRCUIT_BY_ID } from './circuits';
import { ITEM_ART } from './itemArt';
import { pilotModel } from './pilotModels';
import { PEARL_MAX, createRaceEngine, trackOutline } from './raceEngine';
import type { ItemKind, RaceEngine, RaceHud, RaceResult, RacerSetup } from './raceEngine';
import { VEHICLES, VEHICLE_BY_ID, vehicleTuning } from './vehicles';
import type { Vehicle } from './vehicles';

type Phase = 'select' | 'play' | 'pause' | 'end';

const RIVALS = 5;

const ITEMS: Record<ItemKind, { label: string; text: string }> = {
  corail: { label: 'Bouture de corail', text: 'Lance-la devant toi : elle se fixe sur le sable et devient un corail qui fait déraper.' },
  encre: { label: 'Encre de zourite', text: 'Lâche un nuage d’encre derrière toi pour ralentir celui qui te suit.' },
  oursin: { label: 'Oursin', text: 'Pose-le derrière toi : celui qui passe dessus part en tête-à-queue et repart au ralenti.' },
  bulle: { label: 'Bulle bouclier', text: 'Te protège du prochain piège.' },
  banc: { label: 'Banc de demoiselles', text: 'Ces petits poissons filent vers le concurrent juste devant toi et le ralentissent.' },
  courant: { label: 'Courant porteur', text: 'Un coup d’accélérateur pour doubler tout le monde.' },
  tortue: { label: 'Tortue taxi', text: 'Réservée aux derniers : une tortue t’emmène à toute vitesse pendant quelques secondes.' },
};

const ITEM_KINDS = Object.keys(ITEMS) as ItemKind[];

const OUTLINES: Record<string, string> = Object.fromEntries(CIRCUITS.map((c) => [c.id, trackOutline(c)]));

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
].map((r) => ({ ...r, art: `/images/reef-check/${r.id}.webp`, model: null, modelYaw: 0, ...vehicleTuning(VEHICLES[0]) }));

/** Le personnage ne change rien à la course : c'est le bolide qui porte les caractéristiques. */
function setupFromCard(card: PokemonCardData, vehicle: Vehicle): RacerSetup {
  const theme = TYPE_THEME[card.types[0]] ?? TYPE_THEME.Eau;
  return { id: card.id, name: card.name, art: card.art, ...pilotModel(card.id), color: theme.color, deep: theme.deep, ...vehicleTuning(vehicle) };
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
  const mapRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<HTMLDivElement>(null);
  /** Bouton tenu par chaque doigt posé sur les commandes tactiles. */
  const padPointers = useRef(new Map<number, string>());
  /** Écran tactile (tablette, téléphone) : commandes à l'écran et accélération à la pédale. */
  const [touch] = useState(() => window.matchMedia('(pointer: coarse)').matches);
  const engineRef = useRef<RaceEngine | null>(null);
  const finishRef = useRef(onFinish);
  const pilots = useMemo(() => unlocked.map((id) => CARD_BY_ID[id]).filter(Boolean), [unlocked]);
  const [pick, setPick] = useState(pilots[0]?.id ?? '');
  const [vehicleId, setVehicleId] = useState(VEHICLES[0].id);
  const [circuitId, setCircuitId] = useState(CIRCUITS[0].id);
  const circuit = CIRCUIT_BY_ID[circuitId];
  const [phase, setPhase] = useState<Phase>('select');
  const [hud, setHud] = useState<RaceHud | null>(null);
  const [count, setCount] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ text: string; n: number } | null>(null);
  const [result, setResult] = useState<RaceResult | null>(null);
  const [muted, setMuted] = useState(false);
  const [ink, setInk] = useState(false);
  /** Pause déclenchée parce que la fenêtre n'avait plus le clavier (autre application, menu du navigateur). */
  const [lostFocus, setLostFocus] = useState(false);
  /** L'appareil ne sait pas afficher de 3D (WebGL indisponible). */
  const [unsupported, setUnsupported] = useState(false);

  useEffect(() => {
    finishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    let engine: RaceEngine;
    try {
      engine = createRaceEngine(canvasRef.current!, mapRef.current!, CIRCUIT_BY_ID[circuitId], {
        onHud: setHud,
        onCountdown: setCount,
        onBanner: (text) => setBanner((b) => ({ text, n: (b?.n ?? 0) + 1 })),
        onInk: setInk,
        onFocusLost: () => {
          setLostFocus(true);
          setPhase((p) => (p === 'play' ? 'pause' : p));
        },
        onEnd: (r) => {
          setResult(r);
          setInk(false);
          setPhase('end');
          finishRef.current(r.stars);
          if (r.stars > 0) {
            const colors = ['#fbd679', '#5fd9d2', '#f2674a', '#ffffff', '#63c777'];
            confetti({ particleCount: 40 * r.stars, spread: 100, startVelocity: 46, origin: { y: 0.6 }, colors, zIndex: 90 });
          }
        },
      });
    } catch (error) {
      if (import.meta.env.DEV) console.error(error);
      setUnsupported(true);
      return;
    }
    engineRef.current = engine;
    engine.setTouchControls(touch);
    engine.setMuted(muted);
    // Accès console pour les tests, en développement uniquement.
    if (import.meta.env.DEV) (window as unknown as { __race?: RaceEngine }).__race = engine;
    document.body.style.overflow = 'hidden';
    return () => {
      engine.destroy();
      engineRef.current = null;
      document.body.style.overflow = '';
    };
    // Changer de circuit reconstruit toute la scène 3D (le canevas est remplacé : voir `key` plus bas).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [circuitId]);

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

  // Écran de choix : le pilote sélectionné est présenté en 3D à côté (ou au-dessus) du panneau.
  useEffect(() => {
    const engine = engineRef.current;
    const card = CARD_BY_ID[pick];
    if (phase !== 'select' || !engine || !card) return;
    engine.preview(setupFromCard(card, VEHICLE_BY_ID[vehicleId]));
    const wide = window.matchMedia('(min-width: 960px)');
    const frame = () => (wide.matches ? engine.setFraming(0.24, 0) : engine.setFraming(0, 0.3));
    frame();
    wide.addEventListener('change', frame);
    return () => wide.removeEventListener('change', frame);
  }, [phase, pick, circuitId, vehicleId]);

  // Roulette d'objet : les icônes défilent tant que le moteur n'a pas tiré l'objet.
  const rolling = hud?.rolling ?? false;

  const onPad = (e: React.PointerEvent) => {
    const held = padPointers.current;
    if (e.type === 'pointerup' || e.type === 'pointercancel') held.delete(e.pointerId);
    else if (e.type === 'pointerdown' || held.has(e.pointerId)) {
      // Le doigt peut glisser d'un bouton à l'autre sans se lever : on regarde ce qu'il y a dessous.
      const under = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      const act = under?.closest<HTMLElement>('[data-act]')?.dataset.act ?? '';
      if (act === 'item' && held.get(e.pointerId) !== 'item') engineRef.current?.fire();
      held.set(e.pointerId, act);
    }
    const acts = new Set(held.values());
    engineRef.current?.setPad({ steer: (acts.has('right') ? 1 : 0) - (acts.has('left') ? 1 : 0), gas: acts.has('gas'), brake: acts.has('brake'), drift: acts.has('drift') });
    padRef.current?.querySelectorAll<HTMLElement>('[data-act]').forEach((el) => el.classList.toggle('is-down', acts.has(el.dataset.act ?? '')));
  };

  const start = () => {
    padPointers.current.clear();
    const card = CARD_BY_ID[pick];
    if (!card) return;
    // Les rivaux : d'abord les autres cartes gagnées, puis des animaux du lagon pour compléter la grille.
    // Chaque rival prend un bolide au hasard.
    const anyVehicle = () => VEHICLES[Math.floor(Math.random() * VEHICLES.length)];
    const others = shuffle(pilots.filter((c) => c.id !== pick)).map((c) => setupFromCard(c, anyVehicle()));
    const rivals = [...others, ...shuffle(LAGOON_RIVALS).map((r) => ({ ...r, ...vehicleTuning(anyVehicle()) }))].slice(0, RIVALS);
    setResult(null);
    setBanner(null);
    setHud(null);
    engineRef.current?.start(setupFromCard(card, VEHICLE_BY_ID[vehicleId]), shuffle(rivals));
    setPhase('play');
    // Le bouton « C'est parti » garderait le focus : Espace relancerait la course au lieu de lancer l'objet.
    (document.activeElement as HTMLElement | null)?.blur();
  };

  const inGame = phase === 'play' || phase === 'pause';
  const iconBtn = 'flex h-11 w-11 items-center justify-center rounded-full bg-ocean-900/55 text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-ocean-900/80';
  const item = hud?.item ? ITEMS[hud.item] : null;
  const ItemArt = hud?.item ? ITEM_ART[hud.item] : null;
  const locked = POKEMON_CARDS.length - pilots.length;

  return createPortal(
    <div className="tg-root" role="dialog" aria-modal="true" aria-label="Mini-jeu : La Grande Course du Lagon">
      <canvas key={circuitId} ref={canvasRef} className="tg-canvas rg-canvas" />
      <div className={`rg-ink${ink && inGame ? ' is-on' : ''}`} aria-hidden="true" />
      <canvas ref={mapRef} className="rg-map" style={{ display: inGame ? 'block' : 'none' }} aria-hidden="true" />

      {inGame && hud && (
        <>
          <div className="rg-top">
            {/* Case d'objet : la roulette défile, puis l'objet gagné s'affiche jusqu'à ce qu'on le lance. */}
            <div className={`rg-slot${rolling ? ' is-rolling' : item ? ' is-ready' : ''}`} aria-live="polite" aria-label={rolling ? 'Roulette en cours' : item ? `Objet : ${item.label}` : 'Aucun objet'}>
              <div className="rg-slot-window">
                {rolling ? (
                  <div className="rg-strip">
                    {[...ITEM_KINDS, ITEM_KINDS[0]].map((kind, i) => {
                      const Art = ITEM_ART[kind];
                      return <Art key={i} />;
                    })}
                  </div>
                ) : ItemArt ? (
                  <span key={hud.item} className="rg-slot-art">
                    <ItemArt />
                  </span>
                ) : (
                  <Shell className="rg-slot-empty" strokeWidth={1.4} />
                )}
              </div>
              {item && !rolling && (
                <span className="rg-slot-key" aria-hidden="true">
                  <ArrowUp strokeWidth={2.6} />
                </span>
              )}
              {item && !rolling && <span className="rg-slot-name">{item.label}</span>}
            </div>
            <div className="rg-rank" aria-live="polite">
              <p className="rg-place">
                {rankLabel(hud.rank)}
                <span>/ {hud.total}</span>
              </p>
              <p className="rg-lap">
                Tour {hud.lap} / {hud.laps}
              </p>
              <p key={hud.pearls} className="rg-pearls" aria-label={`${hud.pearls} perles sur ${PEARL_MAX}`}>
                <i aria-hidden="true" />
                {hud.pearls}
                <span>/ {PEARL_MAX}</span>
              </p>
            </div>
          </div>
          {touch && (
            // Commandes tactiles : flèches sous le pouce gauche, pédales sous le pouce droit. On peut glisser d'un bouton à l'autre.
            <div ref={padRef} className="rg-pad" onPointerDown={onPad} onPointerMove={onPad} onPointerUp={onPad} onPointerCancel={onPad} onContextMenu={(e) => e.preventDefault()}>
              <div className="rg-pad-group">
                <button type="button" data-act="left" className="rg-btn is-arrow" aria-label="Tourner à gauche">
                  <ArrowLeft strokeWidth={3} />
                </button>
                <button type="button" data-act="right" className="rg-btn is-arrow" aria-label="Tourner à droite">
                  <ArrowRight strokeWidth={3} />
                </button>
              </div>
              <div className="rg-pad-group">
                <button type="button" data-act="item" className={`rg-btn is-item${item ? ' is-ready' : ''}`} aria-label={item ? `Lancer : ${item.label}` : 'Aucun objet'}>
                  {ItemArt ? <ItemArt /> : <Shell strokeWidth={1.6} />}
                  <span>Objet</span>
                </button>
                <button type="button" data-act="drift" className="rg-btn is-drift" aria-label="Déraper (maintenir en tournant)">
                  <Zap strokeWidth={2.2} />
                  <span>Déraper</span>
                </button>
                <button type="button" data-act="brake" className="rg-btn is-brake" aria-label="Freiner">
                  <ChevronsDown strokeWidth={2.6} />
                  <span>Frein</span>
                </button>
                <button type="button" data-act="gas" className="rg-btn is-gas" aria-label="Accélérer (maintenir)">
                  <ChevronsUp strokeWidth={2.6} />
                  <span>Accélérer</span>
                </button>
              </div>
            </div>
          )}
          <ul className="rg-keys" aria-label="Touches du clavier">
            <li>
              <kbd>
                <ArrowLeft strokeWidth={2.4} />
              </kbd>
              <kbd>
                <ArrowRight strokeWidth={2.4} />
              </kbd>
              Tourner
            </li>
            <li>
              <kbd className="is-wide">Espace</kbd>
              Déraper (maintenir en tournant)
            </li>
            <li>
              <kbd>
                <ArrowUp strokeWidth={2.4} />
              </kbd>
              Lancer l’objet
            </li>
            <li>
              <kbd>
                <ArrowDown strokeWidth={2.4} />
              </kbd>
              Freiner
            </li>
          </ul>
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

      {unsupported && (
        <div className="tg-overlay">
          <div className="tg-panel rise-in max-w-md">
            <h2 className="font-display text-3xl font-semibold text-ocean-900">La course ne peut pas démarrer</h2>
            <p className="mt-2 text-lg leading-snug text-ocean-700">Cet appareil ne sait pas afficher la 3D du jeu. Essaie sur un autre ordinateur ou une autre tablette.</p>
            <button type="button" onClick={onClose} className="mt-5 rounded-xl px-6 py-3 text-lg font-bold text-ocean-800 ring-1 ring-ocean-900/25 transition hover:bg-sable">
              Retour au quiz
            </button>
          </div>
        </div>
      )}

      {phase === 'select' && !unsupported && (
        <div className="tg-overlay rg-select">
          <div className="tg-panel rise-in">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-turq-600 sm:text-sm">Mini-jeu du lagon</p>
            <h2 className="mt-1 font-display text-3xl font-semibold leading-tight text-ocean-900 sm:text-4xl">La Grande Course du Lagon</h2>
            <p className="mt-2 text-base leading-snug text-ocean-700 sm:text-lg">Trois tours de circuit. Choisis ton circuit, ton pilote parmi les cartes que tu as gagnées, puis ton bolide.</p>

            <h3 className="rg-step">Circuit</h3>
            <div className="rg-circuits">
              {CIRCUITS.map((c) => (
                <button key={c.id} type="button" onClick={() => setCircuitId(c.id)} className={`rg-circuit${circuitId === c.id ? ' is-picked' : ''}`} aria-pressed={circuitId === c.id}>
                  <svg viewBox="0 0 2048 2048" aria-hidden="true">
                    <polygon points={OUTLINES[c.id]} fill="none" stroke="#06415c" strokeWidth="210" strokeLinejoin="round" />
                    <polygon points={OUTLINES[c.id]} fill="none" stroke={c.currents.length ? '#9fd3ea' : '#f3e2b4'} strokeWidth="130" strokeLinejoin="round" />
                  </svg>
                  <b>{c.name}</b>
                </button>
              ))}
              <div className="rg-circuit is-locked">
                <Lock strokeWidth={1.6} aria-hidden="true" />
                <b>Prochain circuit</b>
                <span>{QUESTIONS_PER_NEW_GAME} nouvelles questions à envoyer</span>
              </div>
            </div>
            <p className="mt-2 text-left text-sm leading-snug text-ocean-700 sm:text-base">{circuit.pitch}</p>

            <h3 className="rg-step">Pilote</h3>
            <div className="rg-pilots">
              {pilots.map((card) => {
                return (
                  <button key={card.id} type="button" onClick={() => setPick(card.id)} className={`rg-pilot${pick === card.id ? ' is-picked' : ''}`} aria-pressed={pick === card.id}>
                    <img src={card.art} alt="" />
                    <span className="block px-2.5 pb-2.5 pt-2 text-left">
                      <b className="block truncate font-display text-base font-semibold leading-tight text-ocean-900">{card.name}</b>
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

            <h3 className="rg-step">Bolide</h3>
            <div className="rg-vehicles">
              {VEHICLES.map((v) => (
                <button key={v.id} type="button" onClick={() => setVehicleId(v.id)} className={`rg-vehicle${vehicleId === v.id ? ' is-picked' : ''}`} aria-pressed={vehicleId === v.id}>
                  <b>{v.name}</b>
                  <span>
                    Vitesse <Pips value={v.speed} />
                  </span>
                  <span>
                    Départ <Pips value={v.start} />
                  </span>
                  <span>
                    Virages <Pips value={v.turn} />
                  </span>
                  <em>{v.perk ? 'Résiste aux chocs' : '\u00a0'}</em>
                </button>
              ))}
            </div>
            <p className="mt-2 text-left text-sm leading-snug text-ocean-700 sm:text-base">{VEHICLE_BY_ID[vehicleId].pitch}</p>

            <h3 className="rg-step">Objets et perles</h3>
            <p className="text-left text-sm leading-snug text-ocean-700 sm:text-base">
              Ramasse les perles : chacune te fait aller un peu plus vite (jusqu’à {PEARL_MAX}), mais tu en perds à chaque choc. Les coquillages dorés donnent un objet au hasard.
            </p>
            <ul className="mt-3 grid gap-2.5 text-left">
              {ITEM_KINDS.map((kind) => {
                const { label, text } = ITEMS[kind];
                const Art = ITEM_ART[kind];
                return (
                  <li key={kind} className="flex gap-3">
                    <span className="rg-item-art">
                      <Art />
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
              {touch
                ? 'Pouce gauche : les deux flèches pour tourner. Pouce droit : tiens la pédale Accélérer, glisse sur Déraper dans les virages pour gagner un turbo.'
                : 'Ton bolide avance tout seul. Maintiens Espace en tournant pour déraper : plus tu tiens, plus le turbo est fort quand tu relâches.'}
            </p>
            <div className="rg-start flex flex-wrap items-center justify-center gap-4">
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
            {lostFocus && <p className="mt-2 text-base leading-snug text-ocean-700">Le jeu ne recevait plus le clavier (une autre fenêtre est passée devant). Clique sur Reprendre pour continuer.</p>}
            <div className="mt-5 flex flex-col gap-3">
              <button
                type="button"
                autoFocus
                onClick={() => {
                  setLostFocus(false);
                  setPhase('play');
                  // Le bouton garderait le focus : Espace remettrait en pause au lieu de faire déraper.
                  (document.activeElement as HTMLElement | null)?.blur();
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-corail-500 px-6 py-3.5 font-display text-xl font-semibold text-white shadow-lg transition hover:bg-corail-600">
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
            {result.stars === 0 && <p className="mt-2 text-base text-ocean-800 sm:text-lg">Finis dans les trois premiers pour gagner des étoiles. Astuce : dérape dans les grands virages pour enchaîner les turbos.</p>}

            <ol className="rg-order mt-4">
              {result.order.map((r, i) => (
                <li key={r.id} className={r.isPlayer ? 'is-player' : ''}>
                  <span className="rg-order-rank">{i + 1}</span>
                  <img src={r.art} alt="" />
                  <span className="truncate">{r.isPlayer ? `${r.name} (toi)` : r.name}</span>
                </li>
              ))}
            </ol>

            <dl className="mt-4 grid grid-cols-4 divide-x divide-ocean-900/10 rounded-xl bg-sable py-2.5 text-center">
              {[
                { label: 'Turbos', value: result.turbos },
                { label: 'Perles ramassées', value: result.pearls },
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
                {(circuit.fact ? [circuit.fact, ...FACTS.slice(1)] : FACTS).map((fact) => (
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
