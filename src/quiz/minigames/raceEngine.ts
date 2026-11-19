// Moteur du mini-jeu « La Grande Course du Lagon » : canvas 2D, zéro dépendance.
// Course de bulles vue de l'arrière sur un chenal de sable au fond du lagon.
// Le sol est calculé point par point à basse résolution (champ de distance à la piste),
// puis agrandi ; les concurrents et le décor sont dessinés par-dessus, du plus loin au plus près.
//
// Repères naturalistes (à faire relire par la RNMR) :
//  - un morceau de corail branchu cassé peut se fixer et redonner une colonie (bouturage) ;
//  - le corail casse quand on le touche : dans le jeu comme dans le lagon, on passe à côté ;
//  - le zourite (poulpe) lâche un nuage d'encre pour se cacher.

export type ItemKind = 'corail' | 'encre' | 'courant' | 'bulle';

export interface RacerSetup {
  id: string;
  name: string;
  /** Illustration affichée dans la bulle. */
  art: string;
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
  order: { id: string; name: string; art: string; isPlayer: boolean }[];
}

export interface RaceCallbacks {
  onHud: (hud: RaceHud) => void;
  onCountdown: (text: string | null) => void;
  onBanner: (text: string) => void;
  onEnd: (result: RaceResult) => void;
}

interface Racer {
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
  item: ItemKind | null;
  useAt: number;
  waited: number;
  offset: number;
  offsetT: number;
  skill: number;
}

interface Obstacle {
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

interface Shell {
  x: number;
  y: number;
  seed: number;
  /** Temps restant avant de réapparaître (0 : disponible). */
  wait: number;
}

interface Shot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  t: number;
  owner: Racer;
}

interface Decor {
  kind: number;
  x: number;
  y: number;
  seed: number;
  size: number;
}

interface Part {
  x: number;
  y: number;
  h: number;
  vx: number;
  vy: number;
  vh: number;
  life: number;
  max: number;
  r: number;
  color: string;
}

const TAU = Math.PI * 2;
const WORLD = 2048;
const SDF = 1024;
/** Demi-largeur de la piste. */
const HW = 78;
const LAPS = 3;
const STEP = 10;
const BASE_SPEED = 255;
const ACCEL = 150;
const TURN = 2.15;
const CAM_BACK = 85;
const CAM_H = 30;
const FAR = 1300;
const FOG_FROM = 240;
const FOG: [number, number, number] = [44, 150, 182];
const FONT = 'Fredoka, "Plus Jakarta Sans", sans-serif';

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

const CORAL_COLORS: [string, string][] = [
  ['#f6846b', '#b8452e'],
  ['#f59ac0', '#b04f7c'],
  ['#fbd679', '#b98a26'],
  ['#b79cf0', '#6c50ad'],
  ['#7fe0c4', '#2e9079'],
];

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const wrapAngle = (a: number) => {
  let d = a % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return d;
};

/** Piste fermée : spline de Catmull-Rom rééchantillonnée tous les STEP. */
function buildTrack() {
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

/** Champ de distance à l'axe de la piste (1 case = 2 unités) : tracés de plus en plus fins, du plus clair au plus sombre. */
function buildSdf(track: ReturnType<typeof buildTrack>) {
  const c = document.createElement('canvas');
  c.width = SDF;
  c.height = SDF;
  const g = c.getContext('2d', { willReadFrequently: true })!;
  g.fillStyle = 'rgb(255,255,255)';
  g.fillRect(0, 0, SDF, SDF);
  g.lineJoin = 'round';
  g.lineCap = 'round';
  g.beginPath();
  for (let k = 0; k < track.N; k++) {
    if (k === 0) g.moveTo(track.px[k] / 2, track.py[k] / 2);
    else g.lineTo(track.px[k] / 2, track.py[k] / 2);
  }
  g.closePath();
  for (let d = 252; d >= 2; d -= 2) {
    g.strokeStyle = `rgb(${d},${d},${d})`;
    g.lineWidth = d;
    g.stroke();
  }
  const data = g.getImageData(0, 0, SDF, SDF).data;
  const out = new Uint8Array(SDF * SDF);
  for (let i = 0; i < out.length; i++) out[i] = data[i * 4];
  return out;
}

export function createRaceEngine(canvas: HTMLCanvasElement, cb: RaceCallbacks) {
  const ctx = canvas.getContext('2d')!;
  const floor = document.createElement('canvas');
  const fctx = floor.getContext('2d')!;
  const track = buildTrack();
  const { N, px, py, tx, ty } = track;
  const sdf = buildSdf(track);
  const noise = new Uint8Array(65536);
  for (let i = 0; i < 65536; i++) noise[i] = (hash(i * 1.37 + 5) * 256) | 0;
  const startAngle = Math.atan2(ty[0], tx[0]);

  let W = 960;
  let H = 600;
  let dpr = 1;
  let bufW = 320;
  let FH = 100;
  let S = 3;
  let F = 700;
  let horizonY = 220;
  let img: ImageData | null = null;
  let px32: Uint32Array | null = null;

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
  let camX = px[0];
  let camY = py[0];
  let camA = startAngle;
  let inkT = 0;
  let shake = 0;
  let wrongWay = 0;
  let lastHud = '';
  const stats = { planted: 0, hitsGiven: 0, hitsTaken: 0 };
  const keys = { left: false, right: false, brake: false };
  const touches = new Map<number, number>();
  const badges = new Map<string, HTMLCanvasElement>();

  // Décor fixe : coraux, patates, gorgones et herbes de part et d'autre du chenal.
  const decor: Decor[] = [];
  for (let i = 0; i < 230; i++) {
    const k = (hash(i * 3.1) * N) | 0;
    const side = hash(i * 7.7) < 0.5 ? -1 : 1;
    const dist = HW + 22 + hash(i * 5.3) * 190;
    const x = px[k] - ty[k] * dist * side;
    const y = py[k] + tx[k] * dist * side;
    const u = (x / 2) | 0;
    const v = (y / 2) | 0;
    if (u < 2 || v < 2 || u > SDF - 3 || v > SDF - 3 || sdf[u + v * SDF] < HW + 16) continue;
    decor.push({ kind: (hash(i * 9.9) * 4) | 0, x, y, seed: i, size: 0.8 + hash(i * 2.3) * 1.1 });
  }

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
  const resize = () => {
    W = canvas.clientWidth || 960;
    H = canvas.clientHeight || 600;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    bufW = clamp(Math.round(W / 3), 200, 440);
    S = W / bufW;
    horizonY = Math.round(H * 0.36);
    FH = Math.max(8, Math.ceil((H - horizonY) / S));
    F = Math.min(W * 0.8, H * 1.3);
    floor.width = bufW;
    floor.height = FH;
    img = fctx.createImageData(bufW, FH);
    px32 = new Uint32Array(img.data.buffer);
  };

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

  const loadBadge = (setup: RacerSetup) => {
    if (badges.has(setup.id)) return;
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 128;
    const g = c.getContext('2d')!;
    g.fillStyle = setup.color;
    g.fillRect(0, 0, 128, 128);
    badges.set(setup.id, c);
    const im = new Image();
    im.onload = () => {
      const side = Math.min(im.naturalWidth, im.naturalHeight) * 0.86;
      g.drawImage(im, (im.naturalWidth - side) / 2, (im.naturalHeight - side) / 2, side, side, 0, 0, 128, 128);
    };
    im.src = setup.art;
  };

  const burst = (x: number, y: number, color: string, count: number, power = 1) => {
    for (let i = 0; i < count; i++) {
      const a = rand(0, TAU);
      const v = rand(20, 90) * power;
      parts.push({ x, y, h: rand(2, 10), vx: Math.cos(a) * v, vy: Math.sin(a) * v, vh: rand(20, 70) * power, life: 0, max: rand(0.5, 1), r: rand(1.2, 3), color });
    }
  };

  // ---------------------------------------------------------------- objets
  const giveItem = (r: Racer) => {
    // En tête : plutôt des pièges. En queue de course : plutôt des courants pour revenir.
    const back = racers.length > 1 ? (r.rank - 1) / (racers.length - 1) : 0;
    const weights: [ItemKind, number][] = [
      ['corail', 34],
      ['encre', 30 - back * 18],
      ['bulle', 24 - back * 8],
      ['courant', 6 + back * 42],
    ];
    let pick = Math.random() * weights.reduce((s, w) => s + w[1], 0);
    r.item = 'corail';
    for (const [kind, w] of weights) {
      pick -= w;
      if (pick <= 0) {
        r.item = kind;
        break;
      }
    }
    r.useAt = t + rand(1, 3.5);
    r.waited = 0;
  };

  const addObstacle = (kind: Obstacle['kind'], x: number, y: number, owner: Racer) => {
    const { idx, lat } = locate(x, y, -1);
    obstacles.push({ kind, x, y, idx, lat, seed: Math.random() * 1000, life: kind === 'encre' ? 16 : 1e9, age: 0, grow: 0, owner });
    // Le lagon ne doit pas devenir un champ de mines : les plus vieux coraux laissent la place.
    const corals = obstacles.filter((o) => o.kind === 'corail');
    if (corals.length > 26) obstacles.splice(obstacles.indexOf(corals[0]), 1);
  };

  const fireItem = (r: Racer) => {
    const kind = r.item;
    if (!kind || r.spin > 0 || countdown > 0) return;
    r.item = null;
    const fx = Math.cos(r.a);
    const fy = Math.sin(r.a);
    if (kind === 'corail') {
      const v = r.speed + 420;
      shots.push({ x: r.x + fx * 12, y: r.y + fy * 12, vx: fx * v, vy: fy * v, t: 0, owner: r });
      if (r.isPlayer) stats.planted += 1;
      if (near(r.x, r.y)) sfx.throw();
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
      burst(r.x, r.y, '#c9f6ff', 14);
      if (r.isPlayer) {
        sfx.pop();
        cb.onBanner('Ta bulle bouclier t’a protégé !');
      }
      return false;
    }
    if (kind === 'corail') {
      r.spin = 0.95;
      r.inv = 1.9;
      r.boost = 0;
    } else {
      r.slow = 1.9;
      r.inv = 1.2;
      if (r.isPlayer) inkT = 2.4;
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

  const updateRacer = (r: Racer, dt: number) => {
    const ai = !r.isPlayer || r.finished > 0 || autopilot;
    let steerIn = 0;
    let brake = false;
    if (ai) {
      steerIn = aiSteer(r, dt);
      if (!r.isPlayer) aiItem(r, dt);
    } else {
      let touch = 0;
      touches.forEach((x) => {
        touch = x < W / 2 ? -1 : 1;
      });
      steerIn = (keys.left ? -1 : 0) + (keys.right ? 1 : 0) || touch;
      brake = keys.brake;
    }
    r.spin = Math.max(0, r.spin - dt);
    r.inv = Math.max(0, r.inv - dt);
    r.boost = Math.max(0, r.boost - dt);
    r.slow = Math.max(0, r.slow - dt);
    r.shield = Math.max(0, r.shield - dt);
    if (r.spin > 0) steerIn = 0;
    r.steer += (steerIn - r.steer) * Math.min(1, dt * 9);

    const off = Math.abs(r.lat) > HW;
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

    r.a += r.steer * TURN * dt * (0.35 + 0.65 * Math.min(1, r.speed / 150));
    r.x = clamp(r.x + Math.cos(r.a) * r.speed * dt, 24, WORLD - 24);
    r.y = clamp(r.y + Math.sin(r.a) * r.speed * dt, 24, WORLD - 24);

    const loc = locate(r.x, r.y, r.idx);
    const delta = loc.idx - r.idx;
    if (delta < -N / 2) {
      r.lap += 1;
      if (r.lap > LAPS && !r.finished) {
        r.finished = ++finishCount;
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

    // Perdu dans le récif : une tortue ramène le concurrent au milieu du chenal.
    r.offT = Math.abs(r.lat) > HW + 95 ? r.offT + dt : 0;
    if (r.offT > 2.2) {
      placeOnTrack(r, r.idx, 0);
      r.speed = 0;
      r.inv = 1.5;
      r.offT = 0;
      if (r.isPlayer) cb.onBanner('Une tortue te ramène sur la piste');
    }

    // Sillage de bulles.
    if (r.speed > 60 && Math.random() < dt * (r.boost > 0 ? 30 : 9)) {
      parts.push({ x: r.x - Math.cos(r.a) * 8 + rand(-4, 4), y: r.y - Math.sin(r.a) * 8 + rand(-4, 4), h: rand(1, 5), vx: 0, vy: 0, vh: rand(8, 22), life: 0, max: rand(0.5, 1.1), r: rand(0.8, 1.8), color: off ? '#9ad6a6' : '#e9fbff' });
    }
  };

  const update = (dt: number) => {
    if (countdown > 0) {
      countdown -= dt;
      const label = countdown > 2.2 ? '3' : countdown > 1.4 ? '2' : countdown > 0.6 ? '1' : 'Partez !';
      if (label !== countShown) {
        countShown = label;
        cb.onCountdown(label);
        if (label === 'Partez !') sfx.go();
        else sfx.tick();
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
      if (s.t < 0.8) return true;
      const x = clamp(s.x, 30, WORLD - 30);
      const y = clamp(s.y, 30, WORLD - 30);
      addObstacle('corail', x, y, s.owner);
      burst(x, y, '#f3e2b4', 8, 0.6);
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
          const color = CORAL_COLORS[(o.seed | 0) % CORAL_COLORS.length][0];
          burst(o.x, o.y, color, 16, 1.2);
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
        if (r.item || r.finished || Math.hypot(r.x - s.x, r.y - s.y) > 17) continue;
        s.wait = 4;
        giveItem(r);
        burst(s.x, s.y, '#fbd679', 10);
        if (r.isPlayer) sfx.pick();
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
      const hud: RaceHud = { rank: player.rank, total: racers.length, lap: clamp(player.lap, 1, LAPS), laps: LAPS, item: player.item };
      const sig = `${hud.rank}|${hud.lap}|${hud.item}`;
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
    inkT = Math.max(0, inkT - dt);
    shake = Math.max(0, shake - dt);
  };

  // ---------------------------------------------------------------- rendu du sol
  const renderFloor = () => {
    if (!img || !px32) return;
    const f = F / S;
    const fx = Math.cos(camA);
    const fy = Math.sin(camA);
    const rx = -fy;
    const ry = fx;
    const s0x = px[0];
    const s0y = py[0];
    const t0x = tx[0];
    const t0y = ty[0];
    const fogRGB = 0xff000000 | (FOG[2] << 16) | (FOG[1] << 8) | FOG[0];
    let p = 0;
    for (let r = 0; r < FH; r++) {
      const d = (CAM_H * f) / (r + 0.5);
      if (d > FAR) {
        for (let c = 0; c < bufW; c++) px32[p++] = fogRGB;
        continue;
      }
      const k = d / f;
      let wx = camX + fx * d - rx * k * (bufW / 2 - 0.5);
      let wy = camY + fy * d - ry * k * (bufW / 2 - 0.5);
      const dxw = rx * k;
      const dyw = ry * k;
      const fog = d > FOG_FROM ? Math.min(1, (d - FOG_FROM) / (FAR - FOG_FROM)) : 0;
      const caustics = d < 620;
      for (let c = 0; c < bufW; c++, wx += dxw, wy += dyw) {
        const u = wx * 0.5 - 0.5;
        const v = wy * 0.5 - 0.5;
        let dist = 255;
        if (u >= 0 && v >= 0 && u < SDF - 1 && v < SDF - 1) {
          const u0 = u | 0;
          const v0 = v | 0;
          const fu = u - u0;
          const fv = v - v0;
          const i = u0 + v0 * SDF;
          const top = sdf[i] + (sdf[i + 1] - sdf[i]) * fu;
          const bot = sdf[i + SDF] + (sdf[i + SDF + 1] - sdf[i + SDF]) * fu;
          dist = top + (bot - top) * fv;
        }
        const n = noise[((wx | 0) & 255) | (((wy | 0) & 255) << 8)];
        let R: number;
        let G: number;
        let B: number;
        if (dist < HW - 9) {
          // Sable du chenal, avec ses rides.
          const rip = Math.sin(wx * 0.19 + Math.sin(wy * 0.045) * 2.2) + Math.sin(wy * 0.23 + Math.sin(wx * 0.05) * 2);
          const l = (n - 128) * 0.05 + rip * 7;
          R = 224 + l;
          G = 211 + l;
          B = 170 + l;
          const al = (wx - s0x) * t0x + (wy - s0y) * t0y;
          if (al > -8 && al < 8 && (wx - s0x) ** 2 + (wy - s0y) ** 2 < HW * HW) {
            const lat = (wx - s0x) * -t0y + (wy - s0y) * t0x;
            if ((Math.floor(al / 4) + Math.floor(lat / 8)) & 1) {
              R = 250;
              G = 250;
              B = 246;
            } else {
              R = 6;
              G = 65;
              B = 92;
            }
          }
        } else if (dist < HW) {
          // Bordure de galets de corail, rose et crème.
          if ((Math.floor(wx / 15) + Math.floor(wy / 15)) & 1) {
            R = 242;
            G = 112;
            B = 92;
          } else {
            R = 250;
            G = 240;
            B = 224;
          }
        } else if (dist < HW + 62) {
          // Herbier.
          const l = (n - 128) * 0.22;
          R = 52 + l;
          G = (n > 205 ? 118 : 150) + l;
          B = 104 + l;
        } else {
          // Récif : fond sombre semé de taches de corail.
          const sp = Math.sin(wx * 0.031) * Math.sin(wy * 0.027) + Math.sin((wx - wy) * 0.017);
          const l = (n - 128) * 0.14;
          if (sp > 1.15) {
            R = 205 + l;
            G = 96 + l;
            B = 128 + l;
          } else if (sp < -1.2) {
            R = 214 + l;
            G = 176 + l;
            B = 84 + l;
          } else {
            R = 22 + l;
            G = 104 + l;
            B = 124 + l;
          }
        }
        if (caustics) {
          const light = 1 + (Math.sin(wx * 0.05 + clock * 1.1) + Math.sin(wy * 0.06 - clock * 0.9) + Math.sin((wx + wy) * 0.035 + clock * 0.7)) * 0.034;
          R *= light;
          G *= light;
          B *= light;
        }
        R += (FOG[0] - R) * fog;
        G += (FOG[1] - G) * fog;
        B += (FOG[2] - B) * fog;
        px32[p++] = 0xff000000 | ((B > 255 ? 255 : B < 0 ? 0 : B) << 16) | ((G > 255 ? 255 : G < 0 ? 0 : G) << 8) | (R > 255 ? 255 : R < 0 ? 0 : R);
      }
    }
    fctx.putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(floor, 0, 0, bufW, FH, 0, horizonY, W, FH * S);
  };

  const drawBackdrop = () => {
    const g = ctx.createLinearGradient(0, 0, 0, horizonY);
    g.addColorStop(0, '#bff3f1');
    g.addColorStop(0.35, '#5fd0d6');
    g.addColorStop(1, `rgb(${FOG[0]},${FOG[1]},${FOG[2]})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, horizonY + 2);
    // Rayons du soleil à travers la surface.
    ctx.save();
    ctx.globalAlpha = 0.13;
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 6; i++) {
      const x = ((i * 0.19 + 0.05 - (camA / TAU) * 1.6 + Math.sin(clock * 0.3 + i) * 0.01) % 1 + 1) % 1;
      const cx = x * W * 1.2 - W * 0.1;
      ctx.beginPath();
      ctx.moveTo(cx - 14, 0);
      ctx.lineTo(cx + 26, 0);
      ctx.lineTo(cx + 120, horizonY);
      ctx.lineTo(cx + 30, horizonY);
      ctx.fill();
    }
    ctx.restore();
    // Massifs coralliens au loin : deux plans qui tournent avec le regard.
    const layers: [number, string, number][] = [
      [0.2, 'rgba(22,118,150,0.55)', 3],
      [0.11, 'rgba(12,92,124,0.8)', 7],
    ];
    for (const [amp, color, freq] of layers) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, horizonY + 2);
      for (let x = 0; x <= W; x += 14) {
        const a = camA + Math.atan((x - W / 2) / F);
        const h = (0.5 + 0.28 * Math.sin(a * freq + 1.3) + 0.14 * Math.sin(a * freq * 2.7 + 0.4) + 0.08 * Math.sin(a * freq * 6.1)) * amp * H * 0.5;
        ctx.lineTo(x, horizonY - Math.max(0, h));
      }
      ctx.lineTo(W, horizonY + 2);
      ctx.fill();
    }
  };

  // ---------------------------------------------------------------- dessins
  const drawCoral = (x: number, y: number, s: number, seed: number, palette: [string, string], grow = 1) => {
    const [color, dark] = palette;
    if (s < 0.22) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y - 7 * s, 8 * s, 0, TAU);
      ctx.fill();
      return;
    }
    ctx.lineCap = 'round';
    for (let pass = 0; pass < 2; pass++) {
      ctx.strokeStyle = pass ? color : dark;
      ctx.lineWidth = (pass ? 3.4 : 5.6) * s;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i - 2) * 0.44 + (hash(seed + i) - 0.5) * 0.3;
        const len = (11 + hash(seed + i * 7) * 9) * s * grow;
        const ex = x + Math.cos(a) * len;
        const ey = y + Math.sin(a) * len;
        ctx.moveTo(x + (i - 2) * 1.6 * s, y);
        ctx.lineTo(ex, ey);
        const mx = x + Math.cos(a) * len * 0.55;
        const my = y + Math.sin(a) * len * 0.55;
        const side = hash(seed + i * 3) < 0.5 ? -1 : 1;
        ctx.moveTo(mx, my);
        ctx.lineTo(mx + Math.cos(a + 0.8 * side) * len * 0.4, my + Math.sin(a + 0.8 * side) * len * 0.4);
      }
      ctx.stroke();
    }
  };

  const drawDecor = (d: Decor, x: number, y: number, s: number) => {
    const z = s * d.size;
    if (d.kind === 0) drawCoral(x, y, z * 1.7, d.seed, CORAL_COLORS[d.seed % CORAL_COLORS.length]);
    else if (d.kind === 1) {
      // Patate de corail massif.
      const w = 20 * z;
      ctx.fillStyle = d.seed % 2 ? '#c9a45c' : '#8fae6a';
      ctx.beginPath();
      ctx.ellipse(x, y, w, w * 0.78, 0, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.beginPath();
      ctx.ellipse(x - w * 0.3, y - w * 0.45, w * 0.3, w * 0.16, -0.4, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(0,40,60,0.18)';
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(x + (hash(d.seed + i) - 0.5) * w * 1.3, y - hash(d.seed + i * 4) * w * 0.55 - w * 0.08, w * 0.07, 0, TAU);
        ctx.fill();
      }
    } else if (d.kind === 2) {
      // Gorgone en éventail.
      ctx.strokeStyle = d.seed % 2 ? '#e0567f' : '#f08a3c';
      ctx.lineWidth = Math.max(1, 1.5 * z);
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let i = 0; i < 7; i++) {
        const a = -Math.PI / 2 + (i - 3) * 0.24 + Math.sin(clock * 1.2 + d.seed) * 0.04;
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + Math.cos(a) * 14 * z, y - 12 * z, x + Math.cos(a) * 26 * z, y + Math.sin(a) * 30 * z);
      }
      ctx.stroke();
    } else {
      // Touffe d'herbier qui ondule.
      ctx.strokeStyle = '#2f9a63';
      ctx.lineWidth = Math.max(1, 2.2 * z);
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const sway = Math.sin(clock * 1.6 + d.seed + i) * 5 * z;
        const bx = x + (i - 2.5) * 3.2 * z;
        ctx.moveTo(bx, y);
        ctx.quadraticCurveTo(bx + sway * 0.3, y - 10 * z, bx + sway, y - (14 + hash(d.seed + i) * 10) * z);
      }
      ctx.stroke();
    }
  };

  const drawShell = (x: number, y: number, s: number, seed: number) => {
    const bob = Math.sin(clock * 3 + seed) * 2.5 * s;
    ctx.fillStyle = 'rgba(0,40,60,0.22)';
    ctx.beginPath();
    ctx.ellipse(x, y, 9 * s, 3 * s, 0, 0, TAU);
    ctx.fill();
    const cy = y - 13 * s + bob;
    const r = 10 * s;
    const glow = ctx.createRadialGradient(x, cy, r * 0.2, x, cy, r * 2.1);
    glow.addColorStop(0, 'rgba(255,240,170,0.55)');
    glow.addColorStop(1, 'rgba(255,240,170,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, cy, r * 2.1, 0, TAU);
    ctx.fill();
    // Coquillage en éventail.
    ctx.fillStyle = '#fbd679';
    ctx.strokeStyle = '#c98a1e';
    ctx.lineWidth = Math.max(1, 1.1 * s);
    ctx.beginPath();
    ctx.moveTo(x, cy + r);
    ctx.arc(x, cy + r * 0.15, r, Math.PI * 0.92, Math.PI * 2.08);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    if (s > 0.35) {
      ctx.beginPath();
      for (let i = -2; i <= 2; i++) {
        ctx.moveTo(x, cy + r);
        ctx.lineTo(x + Math.sin(i * 0.42) * r * 0.95, cy + r * 0.15 - Math.cos(i * 0.42) * r * 0.95);
      }
      ctx.stroke();
    }
  };

  const drawInk = (x: number, y: number, s: number, o: Obstacle) => {
    const fade = Math.min(1, o.life / 2) * o.grow;
    ctx.fillStyle = `rgba(24,14,48,${0.78 * fade})`;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU + clock * 0.4;
      const r = (10 + hash(o.seed + i) * 6) * s;
      ctx.beginPath();
      ctx.ellipse(x + Math.cos(a) * 11 * s, y - 2 * s + Math.sin(a) * 3.2 * s, r, r * 0.34, 0, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = `rgba(60,36,110,${0.5 * fade})`;
    ctx.beginPath();
    ctx.ellipse(x, y - 6 * s, 11 * s, 6 * s, 0, 0, TAU);
    ctx.fill();
  };

  const drawRacer = (r: Racer, x: number, y: number, s: number) => {
    if (r.inv > 0 && r.spin <= 0 && Math.floor(clock * 14) % 2) ctx.globalAlpha = 0.55;
    ctx.fillStyle = 'rgba(0,40,60,0.28)';
    ctx.beginPath();
    ctx.ellipse(x, y, 10 * s, 3.4 * s, 0, 0, TAU);
    ctx.fill();
    ctx.save();
    const hover = Math.sin(clock * 5 + r.setup.speed * 40) * 0.6 * s;
    ctx.translate(x, y - 3 * s + hover);
    // Vu de dos par la caméra : l'inclinaison dépend du virage, relativement au regard.
    ctx.rotate(r.steer * 0.16 + clamp(wrapAngle(r.a - camA), -0.6, 0.6) * 0.25);
    if (r.spin > 0) ctx.scale(Math.cos((0.95 - r.spin) * 14), 1);
    // Coque en coquillage et ses deux nageoires.
    ctx.fillStyle = r.setup.deep;
    ctx.beginPath();
    ctx.moveTo(-9 * s, -3 * s);
    ctx.lineTo(-14 * s, -1 * s);
    ctx.lineTo(-8 * s, 0.5 * s);
    ctx.moveTo(9 * s, -3 * s);
    ctx.lineTo(14 * s, -1 * s);
    ctx.lineTo(8 * s, 0.5 * s);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, -3 * s, 9.5 * s, 4.6 * s, 0, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = r.setup.color;
    ctx.beginPath();
    ctx.ellipse(0, -3.6 * s, 9.5 * s, 2.6 * s, 0, 0, TAU);
    ctx.fill();
    // Bulle de verre avec le personnage de la carte.
    const br = 8.4 * s;
    const by = -11.5 * s;
    const badge = badges.get(r.setup.id);
    if (badge && br > 2) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, by, br, 0, TAU);
      ctx.clip();
      ctx.drawImage(badge, -br, by - br, br * 2, br * 2);
      ctx.restore();
    }
    ctx.lineWidth = Math.max(1, 1.5 * s);
    ctx.strokeStyle = r.isPlayer ? '#fff' : r.setup.color;
    ctx.beginPath();
    ctx.arc(0, by, br, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = Math.max(1, 1.1 * s);
    ctx.beginPath();
    ctx.arc(0, by, br * 0.78, Math.PI * 1.12, Math.PI * 1.48);
    ctx.stroke();
    if (r.shield > 0) {
      const blink = r.shield < 2.5 && Math.floor(clock * 8) % 2 ? 0.25 : 0.6;
      ctx.strokeStyle = `rgba(201,246,255,${blink + 0.3})`;
      ctx.fillStyle = `rgba(160,235,255,${blink * 0.35})`;
      ctx.lineWidth = Math.max(1, 1.4 * s);
      ctx.beginPath();
      ctx.arc(0, -9 * s, 15 * s, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
    // Étiquette des rivaux proches, pour savoir qui on double.
    if (!r.isPlayer && s > 1.7 && s < 6) {
      ctx.font = `600 ${clamp(8 * s, 11, 20)}px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(6,50,74,0.75)';
      ctx.fillStyle = '#fff';
      const label = `${r.rank}. ${r.setup.name}`;
      ctx.strokeText(label, x, y - 24 * s);
      ctx.fillText(label, x, y - 24 * s);
    }
  };

  const drawMinimap = () => {
    const size = clamp(Math.min(W, H) * 0.2, 84, 150);
    const x0 = W - size - 12;
    const y0 = 66;
    const k = size / WORLD;
    ctx.save();
    ctx.translate(x0, y0);
    ctx.fillStyle = 'rgba(6,50,74,0.55)';
    ctx.beginPath();
    ctx.roundRect(-6, -6, size + 12, size + 12, 12);
    ctx.fill();
    ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i = 0; i < N; i += 3) ctx.lineTo(px[i] * k, py[i] * k);
    ctx.closePath();
    ctx.strokeStyle = '#f3e2b4';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.fillStyle = '#f2674a';
    for (const o of obstacles) {
      if (o.kind !== 'corail') continue;
      ctx.beginPath();
      ctx.arc(o.x * k, o.y * k, 2, 0, TAU);
      ctx.fill();
    }
    for (const r of [...racers].sort((a, b) => Number(a.isPlayer) - Number(b.isPlayer))) {
      ctx.fillStyle = r.isPlayer ? '#fff' : r.setup.color;
      ctx.strokeStyle = '#06324a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(r.x * k, r.y * k, r.isPlayer ? 5 : 3.5, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  };

  const render = () => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (shake > 0) ctx.translate(rand(-1, 1) * shake * 14, rand(-1, 1) * shake * 10);
    drawBackdrop();
    renderFloor();

    const fx = Math.cos(camA);
    const fy = Math.sin(camA);
    const list: { z: number; draw: () => void }[] = [];
    const push = (wx: number, wy: number, draw: (x: number, y: number, s: number) => void, h = 0) => {
      const dx = wx - camX;
      const dy = wy - camY;
      const z = dx * fx + dy * fy;
      // Trop près de la caméra, un objet remplirait tout l'écran.
      if (z < 42 || z > FAR * 0.86) return;
      const side = dx * -fy + dy * fx;
      const s = F / z;
      const x = W / 2 + side * s;
      if (x < -120 * s - 60 || x > W + 120 * s + 60) return;
      list.push({ z, draw: () => draw(x, horizonY + (CAM_H - h) * s, s) });
    };
    for (const d of decor) push(d.x, d.y, (x, y, s) => drawDecor(d, x, y, s));
    for (const s of shells) if (s.wait <= 0) push(s.x, s.y, (x, y, sc) => drawShell(x, y, sc, s.seed));
    for (const o of obstacles) {
      if (o.kind === 'corail') push(o.x, o.y, (x, y, s) => drawCoral(x, y, s * 1.25, o.seed, CORAL_COLORS[(o.seed | 0) % CORAL_COLORS.length], o.grow));
      else push(o.x, o.y, (x, y, s) => drawInk(x, y, s, o));
    }
    for (const s of shots) {
      const h = Math.sin((s.t / 0.8) * Math.PI) * 26 + 6;
      push(s.x, s.y, (x, y, sc) => {
        ctx.fillStyle = '#f6846b';
        ctx.strokeStyle = '#b8452e';
        ctx.lineWidth = Math.max(1, sc);
        ctx.beginPath();
        ctx.arc(x, y, 3.4 * sc, 0, TAU);
        ctx.fill();
        ctx.stroke();
      }, h);
    }
    for (const r of racers) push(r.x, r.y, (x, y, s) => drawRacer(r, x, y, s));
    for (const p of parts) {
      push(p.x, p.y, (x, y, s) => {
        ctx.globalAlpha = 1 - p.life / p.max;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(1, p.r * s), 0, TAU);
        ctx.fill();
        ctx.globalAlpha = 1;
      }, p.h);
    }
    list.sort((a, b) => b.z - a.z);
    for (const e of list) e.draw();

    if (player && player.boost > 0 && playing) {
      // Courant porteur : filets d'eau qui filent vers les bords.
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 22; i++) {
        const a = hash(i + Math.floor(clock * 20) * 3.3) * TAU;
        const r0 = Math.max(W, H) * (0.3 + hash(i * 9 + clock) * 0.15);
        ctx.moveTo(W / 2 + Math.cos(a) * r0, H * 0.55 + Math.sin(a) * r0 * 0.7);
        ctx.lineTo(W / 2 + Math.cos(a) * r0 * 1.5, H * 0.55 + Math.sin(a) * r0 * 1.05);
      }
      ctx.stroke();
    }
    if (inkT > 0) {
      // Taches d'encre sur l'écran : gênantes, mais on voit encore la piste entre elles.
      const m = Math.min(W, H);
      ctx.fillStyle = `rgba(22,12,44,${Math.min(0.8, inkT)})`;
      for (let i = 0; i < 9; i++) {
        ctx.beginPath();
        ctx.ellipse(W * (0.1 + hash(i * 3.7) * 0.8), H * (0.2 + hash(i * 8.1) * 0.6), m * (0.1 + hash(i) * 0.1), m * (0.08 + hash(i * 2) * 0.08), hash(i * 5) * 3, 0, TAU);
        ctx.fill();
      }
    }
    if (playing || ended) drawMinimap();
  };

  // ---------------------------------------------------------------- boucle
  const step = (dt: number) => {
    clock += dt;
    if (playing) update(dt);
    if (player && (playing || ended)) {
      camA += wrapAngle(player.a - camA) * Math.min(1, dt * 5.5);
      camX = player.x - Math.cos(camA) * CAM_BACK;
      camY = player.y - Math.sin(camA) * CAM_BACK;
    } else {
      // Avant la course : la caméra survole le chenal.
      const pos = (clock * 9) % N;
      const k = Math.floor(pos);
      const k2 = (k + 1) % N;
      const f = pos - k;
      camA += wrapAngle(Math.atan2(ty[(k + 8) % N], tx[(k + 8) % N]) - camA) * Math.min(1, dt * 2);
      camX = px[k] + (px[k2] - px[k]) * f - Math.cos(camA) * CAM_BACK;
      camY = py[k] + (py[k2] - py[k]) * f - Math.sin(camA) * CAM_BACK;
    }
  };

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    if (paused) return;
    step(dt);
    render();
  };

  const setKey = (e: KeyboardEvent, down: boolean) => {
    const key = e.key.toLowerCase();
    if (key === 'arrowleft' || key === 'q' || key === 'a') keys.left = down;
    else if (key === 'arrowright' || key === 'd') keys.right = down;
    else if (key === 'arrowdown' || key === 's') keys.brake = down;
    else if ((key === ' ' || key === 'arrowup' || key === 'enter') && playing) {
      if (down && !e.repeat && player && !player.finished) fireItem(player);
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

  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('keydown', keyDown);
  window.addEventListener('keyup', keyUp);
  canvas.addEventListener('pointerdown', pointerDown);
  canvas.addEventListener('pointermove', pointerMove);
  window.addEventListener('pointerup', pointerUp);
  window.addEventListener('pointercancel', pointerUp);
  raf = requestAnimationFrame(frame);

  return {
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
        loadBadge(setup);
        const isPlayer = i === setups.length - 1;
        const r: Racer = {
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
          rank: i + 1,
          finished: 0,
          spin: 0,
          inv: 0,
          boost: 0,
          slow: 0,
          shield: 0,
          offT: 0,
          item: null,
          useAt: 0,
          waited: 0,
          offset: 0,
          offsetT: rand(1, 3),
          // Du plus rapide (devant sur la grille) au plus tranquille.
          skill: 1.0 - (i / Math.max(1, setups.length - 1)) * 0.09,
        };
        placeOnTrack(r, N - 4 - Math.floor(i / 2) * 4 - (i % 2) * 2, i % 2 ? 26 : -26);
        r.offset = r.lat;
        return r;
      });
      player = racers[racers.length - 1];
      obstacles = [];
      shots = [];
      parts = [];
      shells = [];
      for (const at of [0.14, 0.38, 0.62, 0.86]) {
        const k = Math.round(at * N);
        for (const lat of [-48, -16, 16, 48]) shells.push({ x: px[k] - ty[k] * lat, y: py[k] + tx[k] * lat, seed: k + lat, wait: 0 });
      }
      t = 0;
      countdown = 3;
      countShown = '';
      endTimer = 0;
      finishCount = 0;
      inkT = 0;
      shake = 0;
      wrongWay = 0;
      lastHud = '';
      stats.planted = 0;
      stats.hitsGiven = 0;
      stats.hitsTaken = 0;
      touches.clear();
      camA = player.a;
      ended = false;
      paused = false;
      playing = true;
      last = performance.now();
    },
    useItem() {
      if (player && playing && !player.finished) fireItem(player);
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
      render();
    },
    debug() {
      return { t, N, player: player && { idx: player.idx, lap: player.lap, rank: player.rank, lat: player.lat, speed: player.speed, item: player.item }, obstacles: obstacles.length, decor: decor.length };
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
    },
  };
}

export type RaceEngine = ReturnType<typeof createRaceEngine>;
