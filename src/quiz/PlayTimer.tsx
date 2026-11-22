import { useEffect, useRef, useState } from 'react';
import { Moon, Timer } from 'lucide-react';
import { DAILY_PLAY_MINUTES, DEMO_PASSWORD, PLAY_TIME_WARNINGS } from './config';

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
 */
export function TimerPill({ remainingMs, floating }: { remainingMs: number; floating?: 'buttons' | 'map' }) {
  const low = remainingMs <= PLAY_TIME_WARNINGS[0] * 60_000;
  const place = !floating
    ? ''
    : `pointer-events-none fixed right-3 z-[70] shadow-lg sm:right-auto sm:left-1/2 sm:top-4 sm:-translate-x-1/2 ${floating === 'map' ? 'top-[10.1rem]' : 'top-[3.9rem]'}`;
  return (
    <span
      role="timer"
      aria-label={`Temps de jeu restant aujourd’hui : ${spoken(remainingMs)}`}
      title={`Temps de jeu restant aujourd’hui (${DAILY_PLAY_MINUTES} minutes par jour)`}
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-2 py-2 font-display text-base font-semibold tabular-nums leading-none transition-colors sm:gap-1.5 sm:px-3 sm:text-lg ${
        low ? 'bg-corail-500 text-white' : floating ? 'bg-ocean-900/65 text-white backdrop-blur-sm' : 'bg-ocean-900/50 text-white'
      } ${place}`}
    >
      <Timer className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} aria-hidden="true" />
      {format(remainingMs)}
    </span>
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
