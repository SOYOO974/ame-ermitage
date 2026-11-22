import { useCallback, useEffect, useState } from 'react';
import { DAILY_PLAY_MINUTES, PLAY_TIME_IDLE_SECONDS, PLAY_TIME_STORAGE_KEY } from './config';

interface Saved {
  /** Jour local, AAAA-MM-JJ : le compteur repart de zéro chaque jour. */
  day: string;
  usedMs: number;
}

const LIMIT_MS = DAILY_PLAY_MINUTES * 60_000;
const IDLE_MS = PLAY_TIME_IDLE_SECONDS * 1000;
const TICK_MS = 1000;

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function load(): Saved {
  try {
    const saved = JSON.parse(localStorage.getItem(PLAY_TIME_STORAGE_KEY) ?? 'null') as Saved | null;
    if (saved && saved.day === today() && Number.isFinite(saved.usedMs)) return saved;
  } catch {
    // sauvegarde illisible : on repart de zéro
  }
  return { day: today(), usedMs: 0 };
}

function save(saved: Saved) {
  try {
    localStorage.setItem(PLAY_TIME_STORAGE_KEY, JSON.stringify(saved));
  } catch {
    // stockage indisponible (navigation privée) : le compteur ne vit que le temps de la page
  }
}

/**
 * Temps de jeu de la journée. Il ne s'écoule que si la page est visible et que l'enfant a touché l'écran,
 * la souris ou le clavier dans les dernières `PLAY_TIME_IDLE_SECONDS` secondes.
 */
export function usePlayTime() {
  const [usedMs, setUsedMs] = useState(() => load().usedMs);

  useEffect(() => {
    let lastInput = Date.now();
    let lastTick = Date.now();
    const onInput = () => {
      lastInput = Date.now();
    };
    const events = ['pointerdown', 'pointermove', 'keydown', 'touchstart', 'wheel'] as const;
    events.forEach((e) => window.addEventListener(e, onInput, { passive: true, capture: true }));

    const id = window.setInterval(() => {
      const now = Date.now();
      // Écart réel depuis le dernier passage, plafonné : une tablette mise en veille ne « mange » pas de temps.
      const elapsed = Math.min(now - lastTick, 2 * TICK_MS);
      lastTick = now;
      // Relecture à chaque passage : changement de jour à minuit, ou autre onglet ouvert sur le jeu.
      const saved = load();
      if (document.visibilityState === 'visible' && now - lastInput <= IDLE_MS && saved.usedMs < LIMIT_MS) {
        saved.usedMs = Math.min(LIMIT_MS, saved.usedMs + elapsed);
        save(saved);
      }
      setUsedMs(saved.usedMs);
    }, TICK_MS);

    return () => {
      window.clearInterval(id);
      events.forEach((e) => window.removeEventListener(e, onInput, { capture: true }));
    };
  }, []);

  /** Accès adulte : rouvre une séance complète pour aujourd'hui. */
  const grantSession = useCallback(() => {
    save({ day: today(), usedMs: 0 });
    setUsedMs(0);
  }, []);

  // Outil de test en développement : `__playTime.use(28)` fait comme si 28 minutes avaient déjà été jouées.
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    (window as unknown as { __playTime: unknown }).__playTime = {
      use: (minutes: number) => {
        const ms = Math.max(0, Math.min(LIMIT_MS, minutes * 60_000));
        save({ day: today(), usedMs: ms });
        setUsedMs(ms);
      },
    };
  }, []);

  const remainingMs = Math.max(0, LIMIT_MS - usedMs);
  return { remainingMs, expired: remainingMs <= 0, grantSession };
}
