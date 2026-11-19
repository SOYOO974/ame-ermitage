import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';
import { ArrowUp, Check, ChevronsRight, Leaf, Pause, Play, RotateCcw, TriangleAlert, Volume2, VolumeX, Wind, X } from 'lucide-react';
import './turtle.css';
import { StarIcon } from '../icons';
import { createTurtleEngine } from './turtleEngine';
import type { TurtleEngine, TurtleResult } from './turtleEngine';

type Phase = 'intro' | 'play' | 'pause' | 'end';

const RULES = [
  { Icon: Leaf, title: 'Mange', text: 'Algues rouges et herbier au fond, méduses en pleine eau : l’énergie remonte.' },
  { Icon: Wind, title: 'Respire', text: 'La tortue a des poumons. Remonte à la surface avant que l’oxygène soit vide.' },
  { Icon: TriangleAlert, title: 'Évite', text: 'Sacs et bouteilles en plastique, bateaux, lignes de pêche et filets.' },
];

const FACTS = [
  'La tortue verte a des poumons, comme toi. Plus elle force, plus elle consomme d’air : en nageant, elle remonte respirer toutes les quelques minutes ; en dormant, elle peut rester plusieurs heures sous l’eau.',
  'À La Réunion, elle broute des algues rouges et les herbiers du lagon. Comme ça nourrit peu, elle doit en manger beaucoup.',
  'Un sac plastique qui flotte ressemble à une méduse. Et les bateaux rapides sont le premier danger pour les tortues de l’île : en mer, on ralentit et on garde ses déchets.',
];

const TIPS: Record<NonNullable<TurtleResult['cause']>, string> = {
  air: 'Elle a manqué d’air. Surveille la jauge d’oxygène et remonte dès qu’elle passe sous la moitié.',
  dechets: 'Elle a avalé trop de plastique. Un sac a deux poignées, une méduse a des filaments qui ondulent.',
  chocs: 'Trop de chocs. Quand le panneau « Bateau ! » clignote, attends en profondeur avant de remonter.',
  faim: 'Elle n’a pas assez mangé. Les algues rouges et l’herbier sont tout au fond.',
};

interface Props {
  best: number;
  onFinish: (stars: number) => void;
  onClose: () => void;
}

export default function TurtleGame({ best, onFinish, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<TurtleEngine | null>(null);
  const energyRef = useRef<HTMLSpanElement>(null);
  const oxygenRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const finishRef = useRef(onFinish);
  const [phase, setPhase] = useState<Phase>('intro');
  const [banner, setBanner] = useState<{ text: string; n: number } | null>(null);
  const [result, setResult] = useState<TurtleResult | null>(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    finishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    const engine = createTurtleEngine(canvasRef.current!, {
      onHud: (energy, oxygen, progress, sprinting) => {
        if (energyRef.current) energyRef.current.style.transform = `scaleX(${energy / 100})`;
        if (oxygenRef.current) oxygenRef.current.style.transform = `scaleX(${oxygen / 100})`;
        if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`;
        const hud = hudRef.current;
        if (hud) {
          hud.classList.toggle('is-low-o2', oxygen < 30);
          hud.classList.toggle('is-low-energy', energy < 25);
          hud.classList.toggle('is-sprint', sprinting);
        }
      },
      onBanner: (text) => setBanner((b) => ({ text, n: (b?.n ?? 0) + 1 })),
      onEnd: (r) => {
        setResult(r);
        setPhase('end');
        if (r.won) {
          finishRef.current(r.stars);
          const colors = ['#fbd679', '#5fd9d2', '#f2674a', '#ffffff', '#63c777'];
          confetti({ particleCount: 120, spread: 100, startVelocity: 46, origin: { y: 0.6 }, colors, zIndex: 90 });
        }
      },
    });
    engineRef.current = engine;
    // Accès console pour les tests, en développement uniquement.
    if (import.meta.env.DEV) (window as unknown as { __turtle?: TurtleEngine }).__turtle = engine;
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

  // Onglet masqué ou Échap : on met en pause plutôt que de laisser la tortue se noyer.
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
    engineRef.current?.start();
    setPhase('play');
  };

  const inGame = phase === 'play' || phase === 'pause';
  const iconBtn = 'flex h-11 w-11 items-center justify-center rounded-full bg-ocean-900/55 text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-ocean-900/80';

  return createPortal(
    <div className="tg-root" role="dialog" aria-modal="true" aria-label="Mini-jeu : La Traversée de la Tortue">
      <canvas ref={canvasRef} className="tg-canvas" />

      {inGame && (
        <div ref={hudRef} className="tg-hud">
          <span className="tg-progress" aria-hidden="true">
            <span ref={progressRef} />
          </span>
          <div className="tg-gauges">
            <div className="tg-gauge is-energy">
              <Leaf className="h-5 w-5 flex-shrink-0" strokeWidth={2} />
              <span className="tg-label">Énergie</span>
              <span className="tg-track">
                <span ref={energyRef} />
              </span>
            </div>
            <div className="tg-gauge is-oxygen">
              <Wind className="h-5 w-5 flex-shrink-0" strokeWidth={2} />
              <span className="tg-label">Oxygène</span>
              <span className="tg-track">
                <span ref={oxygenRef} />
              </span>
            </div>
          </div>
          {/* Rappel des commandes : tablette à l'horizontale et ordinateur seulement (voir turtle.css). */}
          <dl className="tg-controls" aria-label="Commandes">
            <div className="tg-fine">
              <dt>
                <kbd>Souris</kbd> ou <kbd>↑</kbd> <kbd>↓</kbd>
              </dt>
              <dd>Nager</dd>
            </div>
            <div className="tg-fine">
              <dt>
                <kbd>Clic maintenu</kbd> ou <kbd>Espace</kbd>
              </dt>
              <dd>Sprint (vide l’oxygène)</dd>
            </div>
            <div className="tg-coarse">
              <dt>
                <kbd>Glisse le doigt</kbd>
              </dt>
              <dd>Nager</dd>
            </div>
            <div className="tg-coarse">
              <dt>
                <kbd>Bouton Sprint</kbd>
              </dt>
              <dd>Accélérer (vide l’oxygène)</dd>
            </div>
            <div className="tg-fine">
              <dt>
                <kbd>Échap</kbd>
              </dt>
              <dd>Pause</dd>
            </div>
          </dl>
          <button
            type="button"
            className="tg-sprint"
            aria-label="Sprint : maintenir pour accélérer"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              engineRef.current?.setSprint(true);
            }}
            onPointerUp={() => engineRef.current?.setSprint(false)}
            onPointerCancel={() => engineRef.current?.setSprint(false)}
            onContextMenu={(e) => e.preventDefault()}
          >
            <ChevronsRight className="h-9 w-9" strokeWidth={2.4} />
            Sprint
          </button>
          <p className="tg-alert" aria-live="assertive">
            <ArrowUp className="h-6 w-6" strokeWidth={2.6} />
            Remonte respirer !
          </p>
        </div>
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

      {phase === 'play' && banner && (
        <p key={banner.n} className="tg-banner" role="status">
          {banner.text}
        </p>
      )}

      {phase === 'intro' && (
        <div className="tg-overlay">
          <div className="tg-panel rise-in">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-turq-600 sm:text-sm">Mini-jeu du lagon</p>
            <h2 className="mt-1 font-display text-3xl font-semibold leading-tight text-ocean-900 sm:text-5xl">La Traversée de la Tortue</h2>
            <p className="mt-2 text-base leading-snug text-ocean-700 sm:text-xl">Guide une jeune tortue verte jusqu’à l’herbier de l’Ermitage.</p>
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
              Glisse ton doigt ou bouge la souris de haut en bas (ou flèches du clavier). Pour sprinter : bouton Sprint, clic maintenu ou barre d’espace. Attention, le sprint vide l’oxygène 3 fois plus vite.
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
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-turq-600 sm:text-sm">{result.won ? 'Traversée réussie' : 'Traversée interrompue'}</p>
            <h2 className="mt-1 font-display text-3xl font-semibold leading-tight text-ocean-900 sm:text-4xl">
              {result.won ? 'La tortue a rejoint l’herbier !' : 'Ta tortue est épuisée…'}
            </h2>

            {result.won ? (
              <>
                <div className="mt-3 flex justify-center gap-2">
                  {[1, 2, 3].map((n) => (
                    <span key={n} className="tg-star" style={{ animationDelay: `${0.25 + n * 0.22}s` }}>
                      <StarIcon filled={n <= result.stars} className="h-12 w-12 sm:h-14 sm:w-14" />
                    </span>
                  ))}
                </div>
                <ul className="mx-auto mt-3 max-w-md space-y-1.5 text-left text-base text-ocean-800">
                  {[
                    { ok: true, text: 'Arriver jusqu’à l’herbier' },
                    { ok: result.energy >= 50, text: `Arriver avec au moins 50 % d’énergie (${result.energy} %)` },
                    { ok: result.trash === 0 && result.hits === 0, text: 'Aucun déchet avalé, aucun choc' },
                  ].map(({ ok, text }) => (
                    <li key={text} className={`flex items-center gap-2 ${ok ? 'font-semibold' : 'text-ocean-700/70'}`}>
                      <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${ok ? 'bg-turq-500 text-white' : 'bg-ocean-900/10 text-transparent'}`}>
                        <Check className="h-4 w-4" strokeWidth={3} />
                      </span>
                      {text}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mt-3 text-base leading-snug text-ocean-800 sm:text-lg">
                Pas de panique : les soigneurs de Kélonia, à Saint-Leu, la recueillent et la remettront à la mer. {result.cause && TIPS[result.cause]}
              </p>
            )}

            <dl className="mt-4 grid grid-cols-4 divide-x divide-ocean-900/10 rounded-xl bg-sable py-2.5 text-center">
              {[
                { label: 'Repas', value: result.food },
                { label: 'Respirations', value: result.breaths },
                { label: 'Déchets avalés', value: result.trash },
                { label: 'Chocs', value: result.hits },
              ].map(({ label, value }) => (
                <div key={label} className="px-1">
                  <dd className="font-display text-2xl font-semibold text-ocean-900">{value}</dd>
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
