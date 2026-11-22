import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';
import { CloudRain, Droplets, Fence, Filter, Fish, HeartPulse, Leaf, Pause, Play, RotateCcw, Sprout, Volume2, VolumeX, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import './ravine.css';
import { StarIcon } from '../icons';
import { WAVES, createRavineEngine } from './ravineEngine';
import type { CardId, RavineEngine, RavineResult } from './ravineEngine';

type Phase = 'intro' | 'play' | 'pause' | 'choice' | 'end';

/** Oursin dessiné à la main (pas d'icône existante). */
function UrchinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="3.2" fill="currentColor" />
      {Array.from({ length: 12 }, (_, k) => {
        const a = (k / 12) * Math.PI * 2;
        return <line key={k} x1={12 + Math.cos(a) * 4} y1={12 + Math.sin(a) * 4} x2={12 + Math.cos(a) * 10} y2={12 + Math.sin(a) * 10} />;
      })}
    </svg>
  );
}

const CARDS: Record<CardId, { title: string; effect: string; fact: string; Icon: LucideIcon | typeof UrchinIcon; tone: string }> = {
  herbier: {
    title: 'Planter l’herbier',
    effect: 'Un herbier pousse devant la ravine : il arrête l’engrais et la boue, et le corail voisin guérit plus vite.',
    fact: 'L’herbier fixe la vase, abrite les bébés poissons, et près de lui les coraux sont moins souvent malades. À La Réunion, les herbiers ont perdu 86 % de leur surface entre 2018 et 2024.',
    Icon: Leaf,
    tone: 'is-green',
  },
  haies: {
    title: 'Des haies le long de la ravine',
    effect: 'Moins de boue et moins d’engrais descendent à chaque pluie.',
    fact: 'Les racines des haies et des arbres au bord des ravines tiennent la terre et ralentissent l’eau avant qu’elle arrive à la mer.',
    Icon: Fence,
    tone: 'is-earth',
  },
  bassin: {
    title: 'Bassin de décantation',
    effect: 'Beaucoup moins de boue arrive dans le lagon.',
    fact: 'L’eau de pluie boueuse des champs et des chantiers s’arrête dans un grand bassin : la terre tombe au fond, l’eau repart plus claire vers la ravine.',
    Icon: Filter,
    tone: 'is-mud',
  },
  epuration: {
    title: 'Station d’épuration',
    effect: 'Moins d’engrais dans la ravine à chaque pluie (mais pas moins de boue).',
    fact: 'Les eaux usées des maisons contiennent aussi de quoi nourrir les algues. La station d’épuration les nettoie.',
    Icon: Droplets,
    tone: 'is-blue',
  },
  peche: {
    title: 'Zone sans pêche',
    effect: '+6 poissons dans ton banc, qui broutent plus vite.',
    fact: 'Dans la réserve marine, les zones protégées gardent beaucoup de poissons brouteurs : le récif se défend mieux.',
    Icon: Fish,
    tone: 'is-turq',
  },
  oursins: {
    title: 'Le retour des oursins',
    effect: '6 oursins broutent les algues tout seuls.',
    fact: 'À La Réunion, beaucoup d’oursins sont morts ces dernières années : sans eux, les algues ont envahi le récif. Attention, en trop grand nombre ils râpent aussi le corail.',
    Icon: UrchinIcon,
    tone: 'is-purple',
  },
  bouture: {
    title: 'Boutures de corail',
    effect: 'Des jeunes coraux sont replantés sur les coraux morts. Ils sont fragiles sous la boue.',
    fact: 'Un corail mort ne revit pas : on replante de petits morceaux de corail vivant. Mais si la boue continue d’arriver, les boutures meurent : il faut d’abord arrêter la terre.',
    Icon: Sprout,
    tone: 'is-pink',
  },
};

const RULES = [
  { Icon: Fish, title: 'Mange les algues', text: 'Guide ton banc sur les algues vertes. Plus tu enchaînes, plus le combo monte.' },
  { Icon: CloudRain, title: 'Gare à la crue', text: 'Quand il pleut, la ravine apporte de l’engrais (nuage vert : les algues poussent) et de la boue (nuage marron).' },
  { Icon: HeartPulse, title: 'Sauve le corail', text: 'Les poissons mangent les algues, pas la boue. Contre la boue, choisis les bonnes cartes entre deux pluies.' },
];

const FACTS = [
  'À chaque grosse pluie, les ravines emportent vers le lagon l’engrais des champs et des jardins, et les eaux mal nettoyées. Cet engrais nourrit les algues, qui recouvrent le corail et l’étouffent.',
  'Les ravines emportent aussi de la terre. Après un cyclone en 2025, la boue a tué jusqu’à 9 coraux sur 10 par endroits dans le lagon de Saint-Leu et de La Saline. Il faut agir à terre d’abord : haies, bassins, sols qui ne restent pas nus.',
  'Les poissons brouteurs (chirurgiens, perroquets) et les oursins mangent les algues : ce sont les jardiniers du récif. Le poisson-perroquet rejette même du sable blanc !',
  'L’herbier retient l’engrais et la vase, et les coraux proches sont moins malades. Sur terre, des haies au bord des ravines et moins d’engrais dans les jardins protègent aussi le lagon.',
  'Source des chiffres : bilan 2020-2025 de l’Initiative française pour les récifs coralliens (Ifrecor).',
];

const STAGE_NAMES = ['Demoiselles', 'Chirurgiens', 'Perroquets'];

interface Props {
  best: number;
  onFinish: (stars: number) => void;
  onClose: () => void;
}

export default function RavineGame({ best, onFinish, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<RavineEngine | null>(null);
  const reefRef = useRef<HTMLSpanElement>(null);
  const reefTextRef = useRef<HTMLSpanElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const waveRef = useRef<HTMLSpanElement>(null);
  const stageRef = useRef<HTMLSpanElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const finishRef = useRef(onFinish);
  const [phase, setPhase] = useState<Phase>('intro');
  const [banner, setBanner] = useState<{ text: string; n: number } | null>(null);
  const [choice, setChoice] = useState<{ cards: CardId[]; wave: number } | null>(null);
  const [picked, setPicked] = useState<CardId | null>(null);
  const [result, setResult] = useState<RavineResult | null>(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    finishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    const engine = createRavineEngine(canvasRef.current!, {
      onHud: (reef, score, wave, stage, raining) => {
        if (reefRef.current) reefRef.current.style.transform = `scaleX(${Math.max(0, reef) / 100})`;
        if (reefTextRef.current) reefTextRef.current.textContent = `${Math.round(reef)} %`;
        if (scoreRef.current) scoreRef.current.textContent = score.toLocaleString('fr-FR');
        if (waveRef.current) waveRef.current.textContent = `Vague ${wave} / ${WAVES}`;
        if (stageRef.current) stageRef.current.textContent = STAGE_NAMES[stage];
        hudRef.current?.classList.toggle('is-danger', reef < 55);
        hudRef.current?.classList.toggle('is-rain', raining);
      },
      onBanner: (text) => setBanner((b) => ({ text, n: (b?.n ?? 0) + 1 })),
      onChoice: (cards, wave) => {
        setPicked(null);
        setChoice({ cards, wave });
        setPhase('choice');
      },
      onEnd: (r) => {
        setResult(r);
        setPhase('end');
        if (r.won) {
          finishRef.current(r.stars);
          confetti({ particleCount: 130, spread: 100, startVelocity: 46, origin: { y: 0.6 }, colors: ['#fbd679', '#5fd9d2', '#2fc6a0', '#ff8a73', '#ffffff'], zIndex: 90 });
        }
      },
    });
    engineRef.current = engine;
    if (import.meta.env.DEV) (window as unknown as { __ravine?: RavineEngine }).__ravine = engine;
    document.body.style.overflow = 'hidden';
    return () => {
      engine.destroy();
      engineRef.current = null;
      document.body.style.overflow = '';
    };
  }, []);

  // Les illustrations des cartes sont chargées dès l'ouverture du jeu, pour s'afficher d'un coup entre deux vagues.
  useEffect(() => {
    (Object.keys(CARDS) as CardId[]).forEach((id) => {
      new Image().src = `/images/minigames/ravine/${id}.webp`;
    });
  }, []);

  useEffect(() => {
    engineRef.current?.setMuted(muted);
  }, [muted]);

  useEffect(() => {
    const pause = () => setPhase((p) => (p === 'play' ? 'pause' : p));
    const onVisibility = () => document.hidden && pause();
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
    setResult(null);
    setBanner(null);
    setChoice(null);
    engineRef.current?.start();
    setPhase('play');
  };

  const pick = (card: CardId) => {
    if (picked) return;
    setPicked(card);
    // Petit temps pour voir la carte choisie s'illuminer avant de reprendre.
    window.setTimeout(() => {
      engineRef.current?.choose(card);
      setChoice(null);
      setPhase('play');
      setBanner((b) => ({ text: `${CARDS[card].title} : ${CARDS[card].effect}`, n: (b?.n ?? 0) + 1 }));
    }, 650);
  };

  const inGame = phase === 'play' || phase === 'pause' || phase === 'choice';
  const iconBtn = 'flex h-11 w-11 items-center justify-center rounded-full bg-ocean-900/55 text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-ocean-900/80';

  return createPortal(
    <div className="tg-root rv-root" role="dialog" aria-modal="true" aria-label="Mini-jeu : La Crue de la Ravine">
      <canvas ref={canvasRef} className="tg-canvas rv-canvas" />

      {inGame && (
        <div ref={hudRef} className="rv-hud">
          <div className="rv-gauge">
            <HeartPulse className="h-5 w-5 flex-shrink-0" strokeWidth={2} />
            <span className="rv-label">Corail</span>
            <span className="tg-track">
              <span ref={reefRef} />
            </span>
            <span ref={reefTextRef} className="rv-pct">
              100 %
            </span>
          </div>
          <div className="rv-chips">
            <span ref={waveRef} className="rv-chip">
              Vague 1 / {WAVES}
            </span>
            <span ref={stageRef} className="rv-chip is-stage">
              Demoiselles
            </span>
            <span className="rv-chip is-score">
              <span ref={scoreRef}>0</span> pts
            </span>
          </div>
        </div>
      )}

      <div className="absolute right-3 top-3 z-[3] flex gap-2 sm:right-4 sm:top-4">
        <button type="button" onClick={() => setMuted((m) => !m)} className={iconBtn} aria-label={muted ? 'Activer le son' : 'Couper le son'}>
          {muted ? <VolumeX className="h-5 w-5" strokeWidth={2} /> : <Volume2 className="h-5 w-5" strokeWidth={2} />}
        </button>
        {(phase === 'play' || phase === 'pause') && (
          <button type="button" onClick={() => setPhase(phase === 'play' ? 'pause' : 'play')} className={iconBtn} aria-label={phase === 'play' ? 'Pause' : 'Reprendre'}>
            {phase === 'play' ? <Pause className="h-5 w-5" strokeWidth={2} /> : <Play className="h-5 w-5" strokeWidth={2} />}
          </button>
        )}
        <button type="button" onClick={onClose} className={iconBtn} aria-label="Quitter le mini-jeu">
          <X className="h-5 w-5" strokeWidth={2} />
        </button>
      </div>

      {phase === 'play' && banner && (
        <p key={banner.n} className="tg-banner rv-banner" role="status">
          {banner.text}
        </p>
      )}

      {phase === 'intro' && (
        <div className="tg-overlay">
          <div className="tg-panel rise-in">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-turq-600 sm:text-sm">Mini-jeu du lagon</p>
            <h2 className="mt-1 font-display text-3xl font-semibold leading-tight text-ocean-900 sm:text-5xl">La Crue de la Ravine</h2>
            <p className="mt-2 text-base leading-snug text-ocean-700 sm:text-xl">Il va pleuvoir sur l’Ermitage. Avec ton banc de poissons brouteurs, protège le corail des algues.</p>
            <ul className="mt-4 grid gap-3 text-left sm:mt-6 sm:grid-cols-3 sm:gap-4">
              {RULES.map(({ Icon, title, text }) => (
                <li key={title} className="flex gap-3 sm:flex-col sm:gap-2">
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-ocean-800 text-soleil-300">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <span>
                    <b className="block font-display text-lg font-semibold leading-tight text-ocean-900">{title}</b>
                    <span className="block text-sm leading-snug text-ocean-700 sm:text-base">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 rounded-xl bg-sable px-4 py-2.5 text-sm font-semibold text-ocean-800 sm:mt-6 sm:text-base">
              Glisse ton doigt, bouge la souris ou utilise les flèches : le banc te suit. Entre deux pluies, choisis une carte pour aider le lagon.
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

      {phase === 'choice' && choice && (
        <div className="tg-overlay rv-choice">
          <div className="m-auto w-full max-w-4xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-soleil-300 sm:text-sm">Fin de la vague {choice.wave}</p>
            <h2 className="mt-1 font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">Choisis une carte pour aider le lagon</h2>
            <div className="rv-cards">
              {choice.cards.map((id, k) => {
                const card = CARDS[id];
                const state = picked === id ? ' is-picked' : picked ? ' is-dropped' : '';
                return (
                  <button key={id} type="button" onClick={() => pick(id)} className={`rv-card ${card.tone}${state}`} style={{ animationDelay: `${k * 0.12}s` }} disabled={picked !== null}>
                    <span className="rv-card-art">
                      <img src={`/images/minigames/ravine/${id}.webp`} alt="" />
                      <span className="rv-card-icon">
                        <card.Icon className="h-6 w-6" strokeWidth={2} />
                      </span>
                    </span>
                    <span className="rv-card-body">
                      <b className="font-display text-xl font-semibold leading-tight text-ocean-900">{card.title}</b>
                      <span className="rv-card-effect">{card.effect}</span>
                      <span className="rv-card-fact">{card.fact}</span>
                    </span>
                  </button>
                );
              })}
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
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-turq-600 sm:text-sm">{result.won ? 'Récif sauvé' : 'Les algues ont gagné'}</p>
            <h2 className="mt-1 font-display text-3xl font-semibold leading-tight text-ocean-900 sm:text-4xl">
              {result.won ? `${result.reef} % du corail est en bonne santé !` : 'Le récif est étouffé…'}
            </h2>
            {result.won ? (
              <div className="mt-3 flex justify-center gap-2">
                {[1, 2, 3].map((n) => (
                  <span key={n} className="tg-star" style={{ animationDelay: `${0.25 + n * 0.22}s` }}>
                    <StarIcon filled={n <= result.stars} className="h-12 w-12 sm:h-14 sm:w-14" />
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-base leading-snug text-ocean-800 sm:text-lg">
                Les algues et la boue ont recouvert trop de corail. Astuce : fonce d’abord sur les coraux qui clignotent en rouge, et choisis des cartes qui arrêtent l’engrais et la boue avant qu’ils arrivent.
              </p>
            )}
            <p className="mt-2 text-sm text-ocean-700">1 étoile à 55 % de corail en bonne santé, 2 à 70 %, 3 à 85 %.</p>

            <dl className="mt-4 grid grid-cols-2 gap-y-2 rounded-xl bg-sable py-2.5 text-center sm:grid-cols-4 sm:divide-x sm:divide-ocean-900/10">
              {[
                { label: 'Points', value: result.score.toLocaleString('fr-FR') },
                { label: 'Algues mangées', value: result.eaten },
                { label: 'Meilleur combo', value: `x${result.bestCombo}` },
                { label: 'Ton banc', value: STAGE_NAMES[result.stage] },
              ].map(({ label, value }) => (
                <div key={label} className="px-1">
                  <dd className="font-display text-xl font-semibold text-ocean-900 sm:text-2xl">{value}</dd>
                  <dt className="text-[0.65rem] font-bold uppercase leading-tight tracking-[0.08em] text-ocean-700 sm:text-xs">{label}</dt>
                </div>
              ))}
            </dl>

            <div className="mt-4 text-left">
              <h3 className="font-display text-xl font-semibold text-ocean-900">Ce que tu viens d’apprendre</h3>
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
