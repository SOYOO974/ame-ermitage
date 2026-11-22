// Statistiques anonymes : le jeu note ce qui se passe (réponses, parties, cartes) et l'envoie par lots à /api/stats.
// Aucune donnée personnelle : un identifiant tiré au hasard par appareil, ni nom, ni pseudo, ni position.

export type StatGame = 'quiz' | 'tortue' | 'course' | 'ravine';

export interface StatEvent {
  kind: 'visite' | 'reponse' | 'partie' | 'session' | 'carte';
  game?: StatGame;
  /** Question (id) ou carte (id). */
  item?: string;
  /** Sujet de la question, type d'appareil… */
  detail?: string;
  correct?: boolean;
  seconds?: number;
  /** Étoiles d'une partie de mini-jeu (0 à 3). */
  score?: number;
  /** Parties terminées pendant une session de mini-jeu, ou nombre de cartes possédées. */
  count?: number;
}

const PLAYER_KEY = 'ame_joueur_anonyme_v1';
const ENDPOINT = '/api/stats';
const FLUSH_MS = 8000;

let queue: StatEvent[] = [];
let timer: number | undefined;

function playerId(): string {
  try {
    let id = localStorage.getItem(PLAYER_KEY);
    if (!id) {
      id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
      localStorage.setItem(PLAYER_KEY, id);
    }
    return id;
  } catch {
    return 'sans-stockage';
  }
}

function flush() {
  window.clearTimeout(timer);
  timer = undefined;
  if (!queue.length) return;
  const body = JSON.stringify({ player: playerId(), events: queue.splice(0, 50) });
  // sendBeacon survit à la fermeture de l'onglet ; fetch keepalive en secours.
  const sent = typeof navigator.sendBeacon === 'function' && navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }));
  if (!sent) fetch(ENDPOINT, { method: 'POST', body, headers: { 'content-type': 'application/json' }, keepalive: true }).catch(() => {});
  if (queue.length) flush();
}

export function track(event: StatEvent) {
  queue.push(event);
  if (queue.length >= 20) flush();
  else if (timer === undefined) timer = window.setTimeout(flush, FLUSH_MS);
}

function device(): string {
  const coarse = window.matchMedia?.('(pointer: coarse)').matches;
  const short = Math.min(window.screen.width, window.screen.height);
  if (!coarse) return 'ordinateur';
  return short >= 600 ? 'tablette' : 'telephone';
}

let started = false;
/** Une visite par chargement de page, et envoi des derniers événements quand l'enfant quitte la page. */
export function startTracking() {
  if (started) return;
  started = true;
  track({ kind: 'visite', detail: device() });
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
}

export interface PublicStats {
  joueurs: number;
  bonnes_reponses: number;
  questions_apprises: number;
  parties: number;
  cartes: number;
  secondes: number;
}

export async function fetchPublicStats(): Promise<PublicStats | null> {
  try {
    const res = await fetch(ENDPOINT);
    if (!res.ok) return null;
    return (await res.json()) as PublicStats;
  } catch {
    return null;
  }
}
