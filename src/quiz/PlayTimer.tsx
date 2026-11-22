import { useEffect, useRef, useState } from 'react';
import { Brain, Eye, Moon, Timer, Waves, X } from 'lucide-react';
import { DAILY_PLAY_MINUTES, DEMO_PASSWORD, PLAY_TIME_IDLE_SECONDS, PLAY_TIME_WARNINGS } from './config';

/** « 28 min » tant qu'il reste plus d'une minute, puis le compte à rebours à la seconde. */
function format(ms: number): string {
  const s = Math.ceil(ms / 1000);
  if (s > 60) return `${Math.ceil(s / 60)} min`;
  return `0:${String(s).padStart(2, '0')}`;
}

function spoken(ms: number): string {
  const min = Math.ceil(ms / 60_000);
  return ms > 60_000 ? `${min} minutes` : 'moins d’une minute';
}

/**
 * Minuteur toujours visible : dans l'en-tête, ou flottant pendant un mini-jeu. Sur téléphone, le haut de l'écran est pris
 * par les jauges (à gauche) et les boutons (à droite) : il se range sous les boutons, ou sous la carte du circuit pour la
 * course (`floating="map"`). Sur un écran plus large, il se place en haut au centre.
 * Dans l'en-tête, il se touche comme les onglets voisins et ouvre l'explication (`onOpen`). En mini-jeu, il ne capte
 * aucun toucher pour ne pas gêner la partie.
 */
export function TimerPill({ remainingMs, floating, onOpen }: { remainingMs: number; floating?: 'buttons' | 'map'; onOpen?: () => void }) {
  const low = remainingMs <= PLAY_TIME_WARNINGS[0] * 60_000;
  const place = !floating
    ? ''
    : `pointer-events-none fixed right-3 z-[70] shadow-lg sm:right-auto sm:left-1/2 sm:top-4 sm:-translate-x-1/2 ${floating === 'map' ? 'top-[10.1rem]' : 'top-[3.9rem]'}`;
  const look = `inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-2 py-2 font-display text-base font-semibold tabular-nums leading-none transition-colors sm:gap-1.5 sm:px-3 sm:text-lg ${
    low ? 'bg-corail-500 text-white' : floating ? 'bg-ocean-900/65 text-white backdrop-blur-sm' : 'bg-ocean-900/50 text-white'
  } ${place}`;
  const content = (
    <>
      <Timer className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} aria-hidden="true" />
      <span role="timer">{format(remainingMs)}</span>
    </>
  );
  if (onOpen) {
    return (
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Temps de jeu restant aujourd’hui : ${spoken(remainingMs)}. Pourquoi ${DAILY_PLAY_MINUTES} minutes par jour ?`}
        title={`Temps de jeu restant aujourd’hui (${DAILY_PLAY_MINUTES} minutes par jour)`}
        className={`${look} ${low ? 'hover:bg-corail-600' : 'hover:bg-white/15'}`}
      >
        {content}
      </button>
    );
  }
  return (
    <span aria-label={`Temps de jeu restant aujourd’hui : ${spoken(remainingMs)}`} className={look}>
      {content}
    </span>
  );
}

/** « 1 min 30 s », « 45 secondes », « 2 min ». */
function duration(seconds: number): string {
  if (seconds < 60) return `${seconds} secondes`;
  const rest = seconds % 60;
  return `${Math.floor(seconds / 60)} min${rest ? ` ${rest} s` : ''}`;
}

const WHY = [
  {
    Icon: Eye,
    title: 'Tes yeux et ta tête ont besoin de pauses',
    text: 'Rester longtemps devant un écran fatigue les yeux, rend plus difficile de se concentrer et peut gêner le sommeil.',
  },
  {
    Icon: Brain,
    title: 'Un peu chaque jour, on retient mieux',
    text: `En ${DAILY_PLAY_MINUTES} minutes, tu réponds à des dizaines de questions et tu peux gagner plusieurs cartes. Revenir souvent aide plus à retenir qu’une très longue partie.`,
  },
  {
    Icon: Waves,
    title: 'Le vrai lagon t’attend dehors',
    text: 'Les poissons, le corail et les plantes du Jardin de l’AME se découvrent aussi en vrai, les pieds dans l’eau, avec un adulte.',
  },
];

/** Fenêtre ouverte en touchant le minuteur de l'en-tête : temps restant, raisons de la limite, fonctionnement. */
export function TimeInfoDialog({ remainingMs, onClose }: { remainingMs: number; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const limitMs = DAILY_PLAY_MINUTES * 60_000;
  const leftPct = Math.max(0, Math.min(100, (remainingMs / limitMs) * 100));
  const low = remainingMs <= PLAY_TIME_WARNINGS[0] * 60_000;
  const warnings = PLAY_TIME_WARNINGS.join(' puis ');
  const lastWarning = PLAY_TIME_WARNINGS[PLAY_TIME_WARNINGS.length - 1];

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ocean-900/60 p-4 sm:items-center" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="time-info-title">
      <div className="rise-in max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-turq-600">Temps de jeu</p>
            <h2 id="time-info-title" className="font-display text-2xl font-semibold text-ocean-900 sm:text-3xl">
              {DAILY_PLAY_MINUTES} minutes par jour
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className="rounded-full p-2 text-ocean-700 hover:bg-sable">
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        <div className="mt-4 rounded-xl bg-sable p-4">
          <p className="flex items-baseline justify-between gap-3 text-ocean-700">
            <span className="text-base font-semibold">Il te reste aujourd’hui</span>
            <span className={`font-display text-3xl font-semibold tabular-nums ${low ? 'text-corail-600' : 'text-ocean-900'}`}>{format(remainingMs)}</span>
          </p>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-ocean-900/10" aria-hidden="true">
            <span className={`block h-full rounded-full ${low ? 'bg-corail-500' : 'bg-turq-600'}`} style={{ width: `${leftPct}%` }} />
          </div>
        </div>

        <h3 className="mt-6 font-display text-xl font-semibold text-ocean-900">Pourquoi {DAILY_PLAY_MINUTES} minutes ?</h3>
        <ul className="mt-3 space-y-4">
          {WHY.map(({ Icon, title, text }) => (
            <li key={title} className="flex gap-3">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-ocean-800 text-soleil-300">
                <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
              </span>
              <div>
                <p className="font-bold leading-snug text-ocean-900">{title}</p>
                <p className="mt-0.5 leading-snug text-ocean-700">{text}</p>
              </div>
            </li>
          ))}
        </ul>

        <h3 className="mt-6 font-display text-xl font-semibold text-ocean-900">Comment ça marche ?</h3>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 leading-snug text-ocean-700 marker:text-corail-500">
          <li>Le minuteur ne tourne que pendant que tu joues : si tu ne touches plus l’écran pendant {duration(PLAY_TIME_IDLE_SECONDS)}, il s’arrête.</li>
          <li>
            Un message te prévient quand il reste {warnings} minute{lastWarning > 1 ? 's' : ''}.
          </li>
          <li>Ensuite, le jeu se met en pause jusqu’à demain. Tes cartes et tout ce que tu as gagné restent bien gardés.</li>
          <li>Chaque jour à minuit, tu retrouves tes {DAILY_PLAY_MINUTES} minutes.</li>
        </ul>

        <button type="button" onClick={onClose} className="mt-6 w-full rounded-xl bg-corail-500 px-4 py-3 font-display text-xl font-semibold text-white transition hover:bg-corail-600">
          J’ai compris
        </button>
      </div>
    </div>
  );
}

/** Bandeau bref quand on passe sous 5 puis 1 minute restante. */
export function TimeWarning({ remainingMs }: { remainingMs: number }) {
  const shown = useRef(new Set<number>());
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (remainingMs <= 0) return;
    // Le plus petit seuil franchi seulement : on n'empile pas « 5 min » et « 1 min » si la page s'ouvre à 40 s.
    const crossed = PLAY_TIME_WARNINGS.filter((m) => remainingMs <= m * 60_000);
    if (crossed.length === 0) return;
    const threshold = Math.min(...crossed);
    if (shown.current.has(threshold)) return;
    crossed.forEach((m) => shown.current.add(m));
    setMessage(threshold <= 1 ? 'Dernière minute de jeu pour aujourd’hui !' : `Plus que ${threshold} minutes de jeu aujourd’hui.`);
  }, [remainingMs]);

  useEffect(() => {
    if (!message) return;
    const id = window.setTimeout(() => setMessage(null), 6000);
    return () => window.clearTimeout(id);
  }, [message]);

  if (!message) return null;
  return (
    <p role="status" className="rise-in pointer-events-none fixed inset-x-0 bottom-20 z-[75] mx-auto w-fit max-w-[calc(100%-2rem)] rounded-xl bg-corail-500 px-5 py-3 text-center font-display text-xl font-semibold text-white shadow-2xl sm:top-20">
      {message}
    </p>
  );
}

/** Séance du jour terminée : on bloque tout jusqu'au lendemain (un adulte peut rouvrir une séance). */
export function TimeUpScreen({ onGrant }: { onGrant: () => void }) {
  const [asking, setAsking] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  return (
    <div className="lagoon-hero fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto p-4 text-white" role="dialog" aria-modal="true" aria-label="Temps de jeu terminé pour aujourd’hui">
      <div className="rise-in w-full max-w-lg text-center">
        <Moon className="mx-auto h-16 w-16 text-soleil-300" strokeWidth={1.5} aria-hidden="true" />
        <p className="mt-4 text-sm font-bold uppercase tracking-[0.2em] text-soleil-300">{DAILY_PLAY_MINUTES} minutes de jeu</p>
        <h1 className="mt-2 font-display text-4xl font-semibold leading-tight sm:text-5xl">C’est fini pour aujourd’hui !</h1>
        <p className="mx-auto mt-3 max-w-md text-lg leading-snug text-white/90 sm:text-xl">
          Tes cartes, tes étoiles et tes records sont bien gardés. Reviens demain pour continuer à protéger le lagon.
        </p>
        {asking ? (
          <form
            className="mt-8 flex items-start justify-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (password.trim().toLowerCase() === DEMO_PASSWORD) onGrant();
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
                aria-label="Mot de passe adulte"
                placeholder="Mot de passe adulte"
                className={`w-52 rounded-lg border bg-white px-3 py-2 text-sm text-ocean-900 outline-none ${error ? 'border-corail-500' : 'border-white/40'}`}
              />
              {error && (
                <p className="mt-1 text-xs font-semibold text-soleil-300" role="alert">
                  Mot de passe incorrect.
                </p>
              )}
            </div>
            <button type="submit" className="rounded-lg bg-white px-3 py-2 text-sm font-bold text-ocean-900 transition hover:bg-sable">
              Rouvrir {DAILY_PLAY_MINUTES} min
            </button>
          </form>
        ) : (
          <button type="button" onClick={() => setAsking(true)} className="mx-auto mt-10 block text-sm text-white/60 underline-offset-4 hover:text-white hover:underline">
            Accès adulte
          </button>
        )}
      </div>
    </div>
  );
}
