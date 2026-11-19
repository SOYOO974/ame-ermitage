// Moteur du mini-jeu « La Grande Course du Lagon ».
// Ce fichier contient la course elle-même (piste, pilotage, objets, rivaux, classement) ;
// l'affichage 3D est dans raceScene.ts. La simulation reste en 2D vue de dessus (x, y),
// la scène la met en volume.
//
// Repères naturalistes (à faire relire par la RNMR) :
//  - un morceau de corail branchu cassé peut se fixer et redonner une colonie (bouturage) ;
//  - le corail casse quand on le touche : dans le jeu comme dans le lagon, on passe à côté ;
//  - le zourite (poulpe) lâche un nuage d'encre pour se cacher.

import { createRaceView } from './raceScene';

export type ItemKind = 'corail' | 'encre' | 'courant' | 'bulle';

export interface RacerSetup {
  id: string;
  name: string;
  /** Illustration de la carte (pastille de secours quand le modèle 3D n'existe pas encore). */
  art: string;
  /** Modèle 3D du personnage, s'il a été modélisé. */
  model: string | null;
  /** Rotation du modèle pour qu'il regarde vers l'avant (radians). */
  modelYaw: number;
  color: string;
  deep: string;
  /** Multiplicateurs autour de 1 (vitesse de pointe, accélération). */
  speed: number;
  accel: number;
}

export interface RaceHud {
  rank: number;
  total: number;
  lap: number;
  laps: number;
  item: ItemKind | null;
  /** La roulette tourne : l'objet n'est pas encore connu. */
  rolling: boolean;
}

export interface RaceResult {
  rank: number;
  total: number;
  stars: number;
  /** Temps de course en secondes. */
  time: number;
  planted: number;
  hitsGiven: number;
  hitsTaken: number;
  turbos: number;
  order: { id: string; name: string; art: string; isPlayer: boolean }[];
}

export interface RaceCallbacks {
  onHud: (hud: RaceHud) => void;
  onCountdown: (text: string | null) => void;
  onBanner: (text: string) => void;
  /** L'écran du joueur est taché d'encre (ou ne l'est plus). */
  onInk: (active: boolean) => void;
  onEnd: (result: RaceResult) => void;
}

export interface Racer {
  setup: RacerSetup;
  isPlayer: boolean;
  x: number;
  y: number;
  a: number;
  speed: number;
  steer: number;
  idx: number;
  lat: number;
  lap: number;
  rank: number;
  /** Ordre d'arrivée (0 : encore en course). */
  finished: number;
  spin: number;
  inv: number;
  boost: number;
  slow: number;
  shield: number;
  offT: number;
  /** Dérapage en cours : -1 à gauche, 1 à droite, 0 sinon. */
  drift: number;
  /** Turbo accumulé pendant le dérapage (secondes pondérées). */
  charge: number;
  /** Petit saut au début du dérapage (temps restant). */
  hop: number;
  item: ItemKind | null;
  /** Roulette d'objet en cours (temps restant). */
  rollT: number;
  useAt: number;
  waited: number;
  offset: number;
  offsetT: number;
  skill: number;
}

export interface Obstacle {
  kind: 'corail' | 'encre';
  x: number;
  y: number;
  idx: number;
  lat: number;
  seed: number;
  life: number;
  age: number;
  grow: number;
  owner: Racer | null;
}

export interface Shell {
  x: number;
  y: number;
  seed: number;
  /** Temps restant avant de réapparaître (0 : disponible). */
  wait: number;
}

export interface Shot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  t: number;
  owner: Racer;
}

export interface Part {
  x: number;
  y: number;
  h: number;
  vx: number;
  vy: number;
  vh: number;
  life: number;
  max: number;
  r: number;
  color: number;
}

export interface Track {
  N: number;
  px: Float32Array;
  py: Float32Array;
  tx: Float32Array;
  ty: Float32Array;
}

export interface Pad {
  x: number;
  y: number;
  idx: number;
  angle: number;
}

/** Ce que la scène 3D lit à chaque image. */
export interface RaceState {
  racers: Racer[];
  player: Racer | null;
  obstacles: Obstacle[];
  shells: Shell[];
  shots: Shot[];
  parts: Part[];
  cam: { mode: 'chase' | 'orbit'; x: number; y: number; a: number; shake: number };
  clock: number;
  inkT: number;
}

const TAU = Math.PI * 2;
export const WORLD = 2048;
/** Demi-largeur de la piste. */
export const HW = 78;
const LAPS = 3;
const STEP = 10;
const BASE_SPEED = 255;
const ACCEL = 150;
const TURN = 2.15;
export const SHOT_TIME = 0.8;
/** Paliers de turbo du dérapage (charge nécessaire, durée du turbo). */
export const DRIFT_STAGES: [number, number][] = [
  [0.7, 0.7],
  [1.5, 1.25],
  [2.4, 1.9],
];

// Points de passage du chenal (repère de 2048 unités, y vers le bas). Le départ est au premier point.
const CTRL: [number, number][] = [
  [400, 1450],
  [340, 950],
  [470, 480],
  [820, 300],
  [1130, 430],
  [1150, 760],
  [1380, 930],
  [1660, 780],
  [1700, 1200],
  [1500, 1560],
  [1100, 1480],
  [900, 1700],
  [600, 1720],
];

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const wrapAngle = (a: number) => {
  let d = a % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return d;
};

/** Palier de turbo atteint par une charge de dérapage (0 à 3). */
export const driftStage = (charge: number) => DRIFT_STAGES.filter(([need]) => charge >= need).length;

/** Piste fermée : spline de Catmull-Rom rééchantillonnée tous les STEP. */
function buildTrack(): Track {
  const dense: [number, number][] = [];
  const n = CTRL.length;
  for (let i = 0; i < n; i++) {
    const p0 = CTRL[(i - 1 + n) % n];
    const p1 = CTRL[i];
    const p2 = CTRL[(i + 1) % n];
    const p3 = CTRL[(i + 2) % n];
    for (let s = 0; s < 40; s++) {
      const t = s / 40;
      const t2 = t * t;
      const t3 = t2 * t;
      dense.push([
        0.5 * (2 * p1[0] + (p2[0] - p0[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (3 * p1[0] - p0[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * (2 * p1[1] + (p2[1] - p0[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (3 * p1[1] - p0[1] - 3 * p2[1] + p3[1]) * t3),
      ]);
    }
  }
  const m = dense.length;
  const cum = [0];
  for (let i = 0; i < m; i++) {
    const a = dense[i];
    const b = dense[(i + 1) % m];
    cum.push(cum[i] + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  const total = cum[m];
  const N = Math.round(total / STEP);
  const px = new Float32Array(N);
  const py = new Float32Array(N);
  let j = 0;
  for (let k = 0; k < N; k++) {
    const target = (k * total) / N;
    while (cum[j + 1] < target) j++;
    const f = (target - cum[j]) / (cum[j + 1] - cum[j] || 1);
    const a = dense[j];
    const b = dense[(j + 1) % m];
    px[k] = a[0] + (b[0] - a[0]) * f;
    py[k] = a[1] + (b[1] - a[1]) * f;
  }
  const tx = new Float32Array(N);
  const ty = new Float32Array(N);
  for (let k = 0; k < N; k++) {
    const dx = px[(k + 1) % N] - px[(k - 1 + N) % N];
    const dy = py[(k + 1) % N] - py[(k - 1 + N) % N];
    const l = Math.hypot(dx, dy) || 1;
    tx[k] = dx / l;
    ty[k] = dy / l;
  }
  return { N, px, py, tx, ty };
}

/** Peut lever une erreur si l'appareil n'a pas de 3D (WebGL) : l'appelant affiche alors un message. */
export function createRaceEngine(canvas: HTMLCanvasElement, mapCanvas: HTMLCanvasElement, cb: RaceCallbacks) {
  const track = buildTrack();
  const { N, px, py, tx, ty } = track;
  const at = (fraction: number, lat: number) => {
    const k = Math.round(fraction * N) % N;
    return { x: px[k] - ty[k] * lat, y: py[k] + tx[k] * lat, idx: k, angle: Math.atan2(ty[k], tx[k]) };
  };
  const shellSpots = [0.14, 0.38, 0.62, 0.86].flatMap((f) => [-48, -16, 16, 48].map((lat) => at(f, lat)));
  // Courants au sol : passer dessus donne un coup d'accélérateur.
  const pads: Pad[] = [at(0.27, -30), at(0.52, 28), at(0.74, 0)];
  const view = createRaceView(canvas, track, pads);
  const map = mapCanvas.getContext('2d')!;

  let raf = 0;
  let last = 0;
  let playing = false;
  let paused = false;
  let ended = false;
  let muted = false;
  let audio: AudioContext | null = null;
  let autopilot = false;

  let clock = 0;
  let t = 0;
  let countdown = 0;
  let countShown = '';
  let endTimer = 0;
  let finishCount = 0;
  let racers: Racer[] = [];
  let player: Racer | null = null;
  let obstacles: Obstacle[] = [];
  let shells: Shell[] = [];
  let shots: Shot[] = [];
  let parts: Part[] = [];
  let camA = Math.atan2(ty[0], tx[0]);
  let inkT = 0;
  let shake = 0;
  let wrongWay = 0;
  let lastHud = '';
  let rollTick = 0;
  /** Départ turbo : instant du premier appui pendant le décompte (-1 : pas encore appuyé). */
  let startPress = -1;
  const stats = { planted: 0, hitsGiven: 0, hitsTaken: 0, turbos: 0 };
  const keys = { left: false, right: false, brake: false, drift: false };
  const touches = new Map<number, number>();

  // ---------------------------------------------------------------- audio
  const beep = (from: number, to: number, dur: number, type: OscillatorType, vol: number, delay = 0) => {
    if (muted || !audio) return;
    const start = audio.currentTime + delay;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, start);
    osc.frequency.exponentialRampToValueAtTime(Math.max(30, to), start + dur);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(vol, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(gain).connect(audio.destination);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  };
  const sfx = {
    tick: () => beep(440, 440, 0.16, 'sine', 0.16),
    go: () => {
      beep(660, 990, 0.35, 'triangle', 0.18);
      beep(990, 1320, 0.3, 'sine', 0.1, 0.08);
    },
    roll: () => beep(880, 880, 0.04, 'square', 0.04),
    pick: () => {
      beep(620, 930, 0.1, 'sine', 0.14);
      beep(930, 1400, 0.12, 'sine', 0.1, 0.08);
    },
    throw: () => beep(300, 720, 0.22, 'triangle', 0.12),
    plant: () => beep(180, 120, 0.12, 'square', 0.07),
    crack: () => {
      beep(210, 60, 0.26, 'square', 0.14);
      beep(900, 300, 0.12, 'sawtooth', 0.06, 0.02);
    },
    ink: () => beep(160, 70, 0.4, 'sine', 0.16),
    hop: () => beep(260, 420, 0.09, 'sine', 0.08),
    stage: (n: number) => beep(500 + n * 180, 700 + n * 180, 0.1, 'triangle', 0.1),
    boost: () => beep(240, 900, 0.45, 'sawtooth', 0.08),
    shield: () => beep(500, 1000, 0.3, 'sine', 0.12),
    pop: () => beep(1100, 500, 0.12, 'sine', 0.12),
    lap: () => {
      beep(700, 700, 0.1, 'triangle', 0.13);
      beep(1050, 1050, 0.16, 'triangle', 0.13, 0.11);
    },
    finish: () => [523, 659, 784, 1047].forEach((f, i) => beep(f, f, 0.22, 'triangle', 0.15, i * 0.13)),
  };
  /** Les bruitages ne concernent que ce qui se passe près du joueur. */
  const near = (x: number, y: number) => !player || Math.hypot(x - player.x, y - player.y) < 420;

  // ---------------------------------------------------------------- géométrie
  /** Point de piste le plus proche, cherché autour de l'indice connu (ou partout si `from` est négatif). */
  const locate = (x: number, y: number, from: number) => {
    let best = 0;
    let bestD = Infinity;
    const lo = from < 0 ? 0 : -8;
    const hi = from < 0 ? N - 1 : 14;
    for (let o = lo; o <= hi; o++) {
      const k = from < 0 ? o : (from + o + N) % N;
      const d = (x - px[k]) ** 2 + (y - py[k]) ** 2;
      if (d < bestD) {
        bestD = d;
        best = k;
      }
    }
    const lat = (x - px[best]) * -ty[best] + (y - py[best]) * tx[best];
    return { idx: best, lat };
  };
  const progress = (r: Racer) => r.lap * N + r.idx;

  const burst = (x: number, y: number, color: number, count: number, power = 1) => {
    for (let i = 0; i < count; i++) {
      const a = rand(0, TAU);
      const v = rand(20, 90) * power;
      parts.push({ x, y, h: rand(2, 10), vx: Math.cos(a) * v, vy: Math.sin(a) * v, vh: rand(20, 70) * power, life: 0, max: rand(0.5, 1), r: rand(1.5, 3.2), color });
    }
  };

  // ---------------------------------------------------------------- objets
  const rollItem = (r: Racer): ItemKind => {
    // En tête : plutôt des pièges. En queue de course : plutôt des courants pour revenir.
    const back = racers.length > 1 ? (r.rank - 1) / (racers.length - 1) : 0;
    const weights: [ItemKind, number][] = [
      ['corail', 34],
      ['encre', 30 - back * 18],
      ['bulle', 24 - back * 8],
      ['courant', 6 + back * 42],
    ];
    let pick = Math.random() * weights.reduce((s, w) => s + w[1], 0);
    for (const [kind, w] of weights) {
      pick -= w;
      if (pick <= 0) return kind;
    }
    return 'corail';
  };

  const addObstacle = (kind: Obstacle['kind'], x: number, y: number, owner: Racer) => {
    const { idx, lat } = locate(x, y, -1);
    obstacles.push({ kind, x, y, idx, lat, seed: Math.random() * 1000, life: kind === 'encre' ? 16 : 1e9, age: 0, grow: 0, owner });
    // Le lagon ne doit pas devenir un champ de mines : les plus vieux coraux laissent la place.
    const corals = obstacles.filter((o) => o.kind === 'corail');
    if (corals.length > 26) obstacles.splice(obstacles.indexOf(corals[0]), 1);
  };

  const fireItem = (r: Racer, behind = false) => {
    const kind = r.item;
    if (!kind || r.spin > 0 || countdown > 0) return;
    r.item = null;
    const fx = Math.cos(r.a);
    const fy = Math.sin(r.a);
    if (kind === 'corail') {
      if (behind) {
        // Flèche bas maintenue : la bouture est posée juste derrière.
        addObstacle('corail', r.x - fx * 30, r.y - fy * 30, r);
        if (near(r.x, r.y)) sfx.plant();
      } else {
        const v = r.speed + 420;
        shots.push({ x: r.x + fx * 12, y: r.y + fy * 12, vx: fx * v, vy: fy * v, t: 0, owner: r });
        if (near(r.x, r.y)) sfx.throw();
      }
      if (r.isPlayer) stats.planted += 1;
    } else if (kind === 'encre') {
      addObstacle('encre', r.x - fx * 34, r.y - fy * 34, r);
      if (near(r.x, r.y)) sfx.ink();
    } else if (kind === 'courant') {
      r.boost = 2.3;
      if (r.isPlayer) sfx.boost();
    } else {
      r.shield = 12;
      if (r.isPlayer) sfx.shield();
    }
  };

  /** Un concurrent touche un piège. Renvoie false si sa bulle bouclier l'a protégé. */
  const hurt = (r: Racer, kind: Obstacle['kind'], owner: Racer | null) => {
    if (r.inv > 0) return false;
    if (r.shield > 0) {
      r.shield = 0;
      r.inv = 0.8;
      burst(r.x, r.y, 0xc9f6ff, 14);
      if (r.isPlayer) {
        sfx.pop();
        cb.onBanner('Ta bulle bouclier t’a protégé !');
      }
      return false;
    }
    r.drift = 0;
    r.charge = 0;
    if (kind === 'corail') {
      r.spin = 0.95;
      r.inv = 1.9;
      r.boost = 0;
    } else {
      r.slow = 1.9;
      r.inv = 1.2;
      if (r.isPlayer) {
        inkT = 2.4;
        cb.onInk(true);
      }
    }
    if (r.isPlayer) {
      stats.hitsTaken += 1;
      shake = 0.35;
    } else if (owner?.isPlayer) {
      stats.hitsGiven += 1;
      cb.onBanner(kind === 'corail' ? `${r.setup.name} a cassé ton corail !` : `${r.setup.name} est passé dans ton encre !`);
    }
    return true;
  };

  // ---------------------------------------------------------------- pilotage
  const aiSteer = (r: Racer, dt: number) => {
    r.offsetT -= dt;
    if (r.offsetT <= 0) {
      r.offsetT = rand(2, 5);
      r.offset = rand(-46, 46);
    }
    // Évitement : un piège droit devant, dans son couloir, le fait changer de côté.
    for (const o of obstacles) {
      const ahead = (o.idx - r.idx + N) % N;
      if (ahead > 0 && ahead < 20 && Math.abs(o.lat - r.lat) < 30 && Math.abs(o.lat - r.offset) < 34 && r.skill > 0.93) {
        r.offset = clamp(o.lat > 0 ? o.lat - 50 : o.lat + 50, -HW + 18, HW - 18);
      }
    }
    const look = (r.idx + 5 + ((r.speed * 0.035) | 0)) % N;
    const gx = px[look] - ty[look] * r.offset;
    const gy = py[look] + tx[look] * r.offset;
    return clamp(wrapAngle(Math.atan2(gy - r.y, gx - r.x) - r.a) * 3.2, -1, 1);
  };

  const aiItem = (r: Racer, dt: number) => {
    if (!r.item || t < r.useAt) return;
    let ok = true;
    if (r.item === 'corail' || r.item === 'encre') {
      ok = racers.some((o) => {
        if (o === r) return false;
        const gap = progress(o) - progress(r);
        return r.item === 'corail' ? gap > 6 && gap < 45 : gap < -3 && gap > -28;
      });
    }
    r.waited += dt;
    if (ok || r.waited > 5) fireItem(r);
  };

  const placeOnTrack = (r: Racer, idx: number, lat: number) => {
    r.idx = idx;
    r.lat = lat;
    r.x = px[idx] - ty[idx] * lat;
    r.y = py[idx] + tx[idx] * lat;
    r.a = Math.atan2(ty[idx], tx[idx]);
  };

  const newRacer = (setup: RacerSetup, isPlayer: boolean, skill: number): Racer => ({
    setup,
    isPlayer,
    x: 0,
    y: 0,
    a: 0,
    speed: 0,
    steer: 0,
    idx: 0,
    lat: 0,
    lap: 0,
    rank: 1,
    finished: 0,
    spin: 0,
    inv: 0,
    boost: 0,
    slow: 0,
    shield: 0,
    offT: 0,
    drift: 0,
    charge: 0,
    hop: 0,
    item: null,
    rollT: 0,
    useAt: 0,
    waited: 0,
    offset: 0,
    offsetT: rand(1, 3),
    skill,
  });

  /** Fin de dérapage : le turbo dépend du palier atteint. */
  const releaseDrift = (r: Racer) => {
    const stage = driftStage(r.charge);
    if (stage > 0 && r.spin <= 0) {
      r.boost = Math.max(r.boost, DRIFT_STAGES[stage - 1][1]);
      if (r.isPlayer) {
        stats.turbos += 1;
        sfx.boost();
      }
    }
    r.drift = 0;
    r.charge = 0;
  };

  const updateRacer = (r: Racer, dt: number) => {
    const ai = !r.isPlayer || r.finished > 0 || autopilot;
    const off = Math.abs(r.lat) > HW;
    let steerIn = 0;
    let brake = false;
    if (ai) {
      steerIn = aiSteer(r, dt);
      if (!r.isPlayer) aiItem(r, dt);
      r.drift = 0;
    } else {
      let touch = 0;
      touches.forEach((x) => {
        touch = x < canvas.clientWidth / 2 ? -1 : 1;
      });
      steerIn = (keys.left ? -1 : 0) + (keys.right ? 1 : 0) || touch;
      brake = keys.brake;
      // Dérapage : maintenir la touche en tournant. Relâcher donne un turbo si on a tenu assez longtemps.
      if (r.drift) {
        if (!keys.drift || r.speed < 90 || off) releaseDrift(r);
      } else if (keys.drift && steerIn !== 0 && r.speed > 120 && !off && r.spin <= 0) {
        r.drift = steerIn;
        r.charge = 0;
        r.hop = 0.26;
        sfx.hop();
      }
    }
    r.spin = Math.max(0, r.spin - dt);
    r.inv = Math.max(0, r.inv - dt);
    r.boost = Math.max(0, r.boost - dt);
    r.slow = Math.max(0, r.slow - dt);
    r.shield = Math.max(0, r.shield - dt);
    r.hop = Math.max(0, r.hop - dt);
    if (r.spin > 0) steerIn = 0;
    r.steer += (steerIn - r.steer) * Math.min(1, dt * 9);

    let max = BASE_SPEED * r.setup.speed;
    if (!r.isPlayer && player) {
      // Les rivaux attendent un peu le joueur distancé et accélèrent s'il s'échappe.
      const gap = progress(r) - progress(player);
      max *= r.skill * (gap > 45 ? 0.9 : gap < -45 ? 1.07 : 1);
    }
    if (r.finished) max *= 0.6;
    if (r.boost > 0) max = BASE_SPEED * 1.42;
    if (off) max *= r.boost > 0 ? 0.8 : 0.55;
    if (r.slow > 0) max *= 0.5;
    if (r.spin > 0) max *= 0.25;
    if (brake) max = 0;
    if (r.speed < max) r.speed = Math.min(max, r.speed + ACCEL * r.setup.accel * (r.boost > 0 ? 2.4 : 1) * dt);
    else r.speed = Math.max(max, r.speed - (brake ? 330 : 240) * dt);

    if (r.drift) {
      // En dérapage, la bulle tourne toujours vers l'intérieur : on règle le rayon en braquant plus ou moins.
      const inward = steerIn * r.drift;
      r.a += r.drift * TURN * (0.62 + 0.5 * inward) * dt;
      const before = driftStage(r.charge);
      r.charge += dt * (0.55 + 0.6 * Math.max(0, inward));
      const stage = driftStage(r.charge);
      if (stage > before) sfx.stage(stage);
      // Étincelles à l'arrière, de la couleur du palier.
      if (Math.random() < dt * 60) {
        const color = [0x9af0ff, 0x5fd9d2, 0xfbd679, 0xff7fb0][stage];
        const side = -r.drift;
        parts.push({
          x: r.x - Math.cos(r.a) * 7 + -Math.sin(r.a) * side * 5,
          y: r.y - Math.sin(r.a) * 7 + Math.cos(r.a) * side * 5,
          h: 1,
          vx: rand(-25, 25) - Math.cos(r.a) * 40,
          vy: rand(-25, 25) - Math.sin(r.a) * 40,
          vh: rand(20, 55),
          life: 0,
          max: rand(0.25, 0.5),
          r: stage ? 2.6 : 1.6,
          color,
        });
      }
    } else {
      r.a += r.steer * TURN * dt * (0.35 + 0.65 * Math.min(1, r.speed / 150));
    }
    r.x = clamp(r.x + Math.cos(r.a) * r.speed * dt, 24, WORLD - 24);
    r.y = clamp(r.y + Math.sin(r.a) * r.speed * dt, 24, WORLD - 24);

    const loc = locate(r.x, r.y, r.idx);
    const delta = loc.idx - r.idx;
    if (delta < -N / 2) {
      r.lap += 1;
      if (r.lap > LAPS && !r.finished) {
        r.finished = ++finishCount;
        r.drift = 0;
        if (r.isPlayer) {
          endTimer = 2.6;
          sfx.finish();
        }
      } else if (r.isPlayer && r.lap > 1 && !r.finished) {
        sfx.lap();
        cb.onBanner(r.lap === LAPS ? 'Dernier tour !' : `Tour ${r.lap} sur ${LAPS}`);
      }
    } else if (delta > N / 2) r.lap -= 1;
    r.idx = loc.idx;
    r.lat = loc.lat;

    // Courants au sol.
    for (const pad of pads) {
      if (Math.hypot(r.x - pad.x, r.y - pad.y) < 19 && r.boost < 0.9) {
        r.boost = 1.1;
        if (r.isPlayer) sfx.boost();
      }
    }

    // Perdu dans le récif : une tortue ramène le concurrent au milieu du chenal.
    r.offT = Math.abs(r.lat) > HW + 95 ? r.offT + dt : 0;
    if (r.offT > 2.2) {
      placeOnTrack(r, r.idx, 0);
      r.speed = 0;
      r.inv = 1.5;
      r.offT = 0;
      if (r.isPlayer) cb.onBanner('Une tortue te ramène sur la piste');
    }

    // Roulette d'objet.
    if (r.rollT > 0) {
      r.rollT -= dt;
      if (r.isPlayer) {
        rollTick -= dt;
        if (rollTick <= 0) {
          rollTick = 0.09;
          sfx.roll();
        }
      }
      if (r.rollT <= 0) {
        r.item = rollItem(r);
        r.useAt = t + rand(1, 3.5);
        r.waited = 0;
        if (r.isPlayer) sfx.pick();
      }
    }

    // Sillage de bulles.
    if (r.speed > 60 && Math.random() < dt * (r.boost > 0 ? 40 : 7)) {
      parts.push({ x: r.x - Math.cos(r.a) * 9 + rand(-4, 4), y: r.y - Math.sin(r.a) * 9 + rand(-4, 4), h: rand(2, 6), vx: 0, vy: 0, vh: rand(8, 22), life: 0, max: rand(0.5, 1.1), r: rand(1.2, 2.4), color: r.boost > 0 ? 0xfff2b0 : off ? 0x9ad6a6 : 0xe9fbff });
    }
  };

  const update = (dt: number) => {
    if (countdown > 0) {
      countdown -= dt;
      const label = countdown > 2.2 ? '3' : countdown > 1.4 ? '2' : countdown > 0.6 ? '1' : 'Partez !';
      if (label !== countShown) {
        countShown = label;
        cb.onCountdown(label);
        if (label === 'Partez !') {
          sfx.go();
          // Départ turbo : un seul appui, juste avant le « Partez ! » (ni trop tôt, ni trop tard).
          if (player && startPress >= 0 && startPress < 1.05) {
            player.boost = 1.3;
            stats.turbos += 1;
            cb.onBanner('Départ turbo !');
          }
        } else sfx.tick();
      }
      if (countdown > 0.6) return;
    } else if (countShown) {
      countShown = '';
      cb.onCountdown(null);
    }
    t += dt;
    for (const r of racers) updateRacer(r, dt);

    // Les bulles se repoussent.
    for (let i = 0; i < racers.length; i++) {
      for (let j = i + 1; j < racers.length; j++) {
        const a = racers[i];
        const b = racers[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy);
        if (d > 0.01 && d < 17) {
          const push = (17 - d) / 2 / d;
          a.x -= dx * push;
          a.y -= dy * push;
          b.x += dx * push;
          b.y += dy * push;
        }
      }
    }

    // Boutures lancées : elles retombent et se fixent en corail.
    shots = shots.filter((s) => {
      s.t += dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      if (s.t < SHOT_TIME) return true;
      const x = clamp(s.x, 30, WORLD - 30);
      const y = clamp(s.y, 30, WORLD - 30);
      addObstacle('corail', x, y, s.owner);
      burst(x, y, 0xf3e2b4, 8, 0.6);
      if (near(x, y)) sfx.plant();
      return false;
    });

    obstacles = obstacles.filter((o) => {
      o.life -= dt;
      o.age += dt;
      o.grow = Math.min(1, o.grow + dt * 3.5);
      if (o.life <= 0) return false;
      const radius = o.kind === 'corail' ? 15 : 22;
      for (const r of racers) {
        if (Math.hypot(r.x - o.x, r.y - o.y) > radius || r.inv > 0) continue;
        // Le lanceur a trois secondes pour dépasser sa propre bouture avant qu'elle ne le gêne.
        if (o.owner === r && o.age < 3) continue;
        // Le corail casse toujours ; le nuage d'encre se dissipe après un passage.
        const hit = hurt(r, o.kind, o.owner === r ? null : o.owner);
        if (o.kind === 'corail') {
          burst(o.x, o.y, 0xf6846b, 18, 1.2);
          if (near(o.x, o.y)) sfx.crack();
          return false;
        }
        if (hit) {
          if (near(o.x, o.y)) sfx.ink();
          return false;
        }
      }
      return true;
    });

    for (const s of shells) {
      if (s.wait > 0) {
        s.wait -= dt;
        continue;
      }
      for (const r of racers) {
        if (r.item || r.rollT > 0 || r.finished || Math.hypot(r.x - s.x, r.y - s.y) > 17) continue;
        s.wait = 4;
        // Le joueur regarde tourner la roulette ; les rivaux reçoivent leur objet aussitôt.
        r.rollT = r.isPlayer ? 1.3 : 0.05;
        burst(s.x, s.y, 0xfbd679, 10);
        break;
      }
    }

    parts = parts.filter((p) => {
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.h += p.vh * dt;
      if (p.vx || p.vy) {
        p.vh -= 160 * dt;
        if (p.h < 0) {
          p.h = 0;
          p.vh = 0;
          p.vx *= 0.8;
          p.vy *= 0.8;
        }
      }
      return p.life < p.max;
    });

    // Classement : les arrivés d'abord (dans l'ordre), puis par distance parcourue.
    const sorted = [...racers].sort((a, b) => (a.finished || 99) - (b.finished || 99) || progress(b) - progress(a));
    sorted.forEach((r, i) => (r.rank = i + 1));

    if (player) {
      const heading = Math.cos(player.a) * tx[player.idx] + Math.sin(player.a) * ty[player.idx];
      wrongWay = heading < -0.35 && player.speed > 40 && !player.finished ? wrongWay + dt : 0;
      if (wrongWay > 1.4) {
        wrongWay = -2;
        cb.onBanner('Mauvais sens : fais demi-tour !');
      }
      const hud: RaceHud = { rank: player.rank, total: racers.length, lap: clamp(player.lap, 1, LAPS), laps: LAPS, item: player.item, rolling: player.rollT > 0 };
      const sig = `${hud.rank}|${hud.lap}|${hud.item}|${hud.rolling}`;
      if (sig !== lastHud) {
        lastHud = sig;
        cb.onHud(hud);
      }
      if (endTimer > 0) {
        endTimer -= dt;
        if (endTimer <= 0) {
          ended = true;
          playing = false;
          const rank = player.rank;
          cb.onEnd({
            rank,
            total: racers.length,
            stars: rank === 1 ? 3 : rank === 2 ? 2 : rank === 3 ? 1 : 0,
            time: t,
            ...stats,
            order: sorted.map((r) => ({ id: r.setup.id, name: r.setup.name, art: r.setup.art, isPlayer: r.isPlayer })),
          });
        }
      }
    }
    if (inkT > 0 && inkT <= dt) cb.onInk(false);
    inkT = Math.max(0, inkT - dt);
    shake = Math.max(0, shake - dt);
  };

  // ---------------------------------------------------------------- carte
  const drawMinimap = () => {
    const size = mapCanvas.clientWidth || 120;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (mapCanvas.width !== Math.round(size * dpr)) {
      mapCanvas.width = Math.round(size * dpr);
      mapCanvas.height = Math.round(size * dpr);
    }
    const k = (size - 16) / WORLD;
    map.setTransform(dpr, 0, 0, dpr, 0, 0);
    map.clearRect(0, 0, size, size);
    map.translate(8, 8);
    map.lineJoin = 'round';
    map.beginPath();
    for (let i = 0; i < N; i += 3) map.lineTo(px[i] * k, py[i] * k);
    map.closePath();
    map.strokeStyle = 'rgba(6,50,74,0.7)';
    map.lineWidth = 9;
    map.stroke();
    map.strokeStyle = '#f3e2b4';
    map.lineWidth = 5;
    map.stroke();
    map.fillStyle = '#f2674a';
    for (const o of obstacles) {
      if (o.kind !== 'corail') continue;
      map.beginPath();
      map.arc(o.x * k, o.y * k, 2, 0, TAU);
      map.fill();
    }
    for (const r of [...racers].sort((a, b) => Number(a.isPlayer) - Number(b.isPlayer))) {
      map.fillStyle = r.isPlayer ? '#fff' : r.setup.color;
      map.strokeStyle = '#06324a';
      map.lineWidth = 1.5;
      map.beginPath();
      map.arc(r.x * k, r.y * k, r.isPlayer ? 5 : 3.5, 0, TAU);
      map.fill();
      map.stroke();
    }
  };

  // ---------------------------------------------------------------- boucle
  const state: RaceState = { racers, player, obstacles, shells, shots, parts, cam: { mode: 'orbit', x: px[0], y: py[0], a: 0, shake: 0 }, clock: 0, inkT: 0 };

  const step = (dt: number) => {
    clock += dt;
    if (playing) update(dt);
    if (player && (playing || ended)) {
      camA += wrapAngle(player.a - camA) * Math.min(1, dt * (player.drift ? 3.4 : 5.5));
      state.cam = { mode: 'chase', x: player.x, y: player.y, a: camA, shake };
    } else if (player) {
      // Avant la course : la caméra tourne autour du pilote choisi.
      state.cam = { mode: 'orbit', x: player.x, y: player.y, a: clock * 0.45, shake: 0 };
    }
    state.racers = racers;
    state.player = player;
    state.obstacles = obstacles;
    state.shells = shells;
    state.shots = shots;
    state.parts = parts;
    state.clock = clock;
    state.inkT = inkT;
  };

  const draw = (dt: number) => {
    view.render(state, dt);
    if (playing || ended) drawMinimap();
  };

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    if (paused) return;
    step(dt);
    draw(dt);
  };

  const setKey = (e: KeyboardEvent, down: boolean) => {
    const key = e.key.toLowerCase();
    if (key === 'arrowleft' || key === 'q' || key === 'a') keys.left = down;
    else if (key === 'arrowright' || key === 'd') keys.right = down;
    else if (key === 'arrowdown' || key === 's') keys.brake = down;
    else if (key === ' ' || key === 'shift') {
      keys.drift = down;
      if (down && !e.repeat && playing && countdown > 0 && startPress < 0) startPress = countdown;
    } else if ((key === 'arrowup' || key === 'enter' || key === 'z' || key === 'w') && playing) {
      if (down && !e.repeat && player && !player.finished) fireItem(player, keys.brake);
    } else return;
    if (playing) e.preventDefault();
  };
  const keyDown = (e: KeyboardEvent) => setKey(e, true);
  const keyUp = (e: KeyboardEvent) => setKey(e, false);
  const pointerDown = (e: PointerEvent) => {
    touches.set(e.pointerId, e.clientX - canvas.getBoundingClientRect().left);
  };
  const pointerMove = (e: PointerEvent) => {
    if (touches.has(e.pointerId)) pointerDown(e);
  };
  const pointerUp = (e: PointerEvent) => {
    touches.delete(e.pointerId);
  };
  const resize = () => view.resize();

  window.addEventListener('resize', resize);
  window.addEventListener('keydown', keyDown);
  window.addEventListener('keyup', keyUp);
  canvas.addEventListener('pointerdown', pointerDown);
  canvas.addEventListener('pointermove', pointerMove);
  window.addEventListener('pointerup', pointerUp);
  window.addEventListener('pointercancel', pointerUp);
  raf = requestAnimationFrame(frame);

  return {
    /** Écran de choix : présente le pilote sur la ligne de départ, la caméra tourne autour. */
    preview(setup: RacerSetup) {
      if (playing) return;
      const r = newRacer(setup, true, 1);
      placeOnTrack(r, 3, 0);
      racers = [r];
      player = r;
      obstacles = [];
      shots = [];
      parts = [];
      shells = [];
      ended = false;
      view.setRacers(racers);
    },
    /** Décale le sujet dans l'image (fractions de l'écran) pour laisser la place au panneau de choix. */
    setFraming(fx: number, fy: number) {
      view.setFraming(fx, fy);
    },
    /** Lance une course : le joueur et ses rivaux, placés sur la grille derrière la ligne. */
    start(playerSetup: RacerSetup, rivals: RacerSetup[]) {
      if (!audio) {
        try {
          audio = new AudioContext();
        } catch {
          audio = null;
        }
      }
      void audio?.resume();
      const setups = [...rivals, playerSetup];
      racers = setups.map((setup, i) => {
        // Du plus rapide (devant sur la grille) au plus tranquille.
        const r = newRacer(setup, i === setups.length - 1, 1.0 - (i / Math.max(1, setups.length - 1)) * 0.09);
        placeOnTrack(r, N - 4 - Math.floor(i / 2) * 4 - (i % 2) * 2, i % 2 ? 26 : -26);
        r.offset = r.lat;
        r.rank = i + 1;
        return r;
      });
      player = racers[racers.length - 1];
      obstacles = [];
      shots = [];
      parts = [];
      shells = shellSpots.map((s, i) => ({ x: s.x, y: s.y, seed: i, wait: 0 }));
      t = 0;
      countdown = 3;
      countShown = '';
      endTimer = 0;
      finishCount = 0;
      inkT = 0;
      shake = 0;
      wrongWay = 0;
      lastHud = '';
      startPress = -1;
      stats.planted = 0;
      stats.hitsGiven = 0;
      stats.hitsTaken = 0;
      stats.turbos = 0;
      keys.drift = false;
      touches.clear();
      camA = player.a;
      ended = false;
      paused = false;
      playing = true;
      last = performance.now();
      view.setFraming(0, 0);
      view.setRacers(racers);
    },
    /** Bouton tactile de l'objet. */
    fire() {
      if (player && playing && !player.finished) fireItem(player, keys.brake);
    },
    /** Bouton tactile du dérapage. */
    setDrift(value: boolean) {
      keys.drift = value;
      if (value && playing && countdown > 0 && startPress < 0) startPress = countdown;
    },
    setPaused(value: boolean) {
      paused = value;
      last = performance.now();
      if (value) void audio?.suspend();
      else void audio?.resume();
    },
    setMuted(value: boolean) {
      muted = value;
    },
    /** Tests en développement : l'ordinateur pilote aussi le joueur. */
    setAutopilot(value: boolean) {
      autopilot = value;
    },
    /** Tests en développement : avance la course sans attendre l'affichage. */
    simulate(seconds: number) {
      for (let i = 0; i < seconds * 60; i++) step(1 / 60);
      draw(1 / 60);
    },
    debug() {
      return { t, N, player: player && { idx: player.idx, lap: player.lap, rank: player.rank, lat: player.lat, speed: player.speed, item: player.item, drift: player.drift, charge: player.charge, boost: player.boost }, obstacles: obstacles.length, view: view.info() };
    },
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
      canvas.removeEventListener('pointerdown', pointerDown);
      canvas.removeEventListener('pointermove', pointerMove);
      window.removeEventListener('pointerup', pointerUp);
      window.removeEventListener('pointercancel', pointerUp);
      void audio?.close();
      view.dispose();
    },
  };
}

export type RaceEngine = ReturnType<typeof createRaceEngine>;
