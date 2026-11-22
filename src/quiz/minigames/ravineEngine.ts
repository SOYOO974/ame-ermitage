// Moteur du mini-jeu « La Crue de la Ravine » : canvas 2D, zéro dépendance, tout est dessiné par le code.
//
// Vue de dessus du platier de l'Ermitage : la plage et sa ravine en haut, la barrière de corail en bas.
// Le joueur guide au doigt (ou à la souris, ou aux flèches) un banc de poissons brouteurs qui mange les algues.
//
// Repères scientifiques (à faire relire par la Réserve Naturelle Marine) :
//  - à chaque pluie, les ravines apportent au lagon l'engrais des champs et des jardins et les eaux usées ;
//  - cet excès de nourriture fait proliférer les algues, qui recouvrent et étouffent le corail ;
//  - les poissons brouteurs (chirurgiens, perroquets) et les oursins mangent les algues ;
//  - l'herbier retient l'engrais et la vase, et abrite les jeunes poissons ;
//  - trop d'oursins finissent par râper le corail lui-même ;
//  - un corail étouffé peut se rétablir si on le libère à temps ; un corail mort ne revit pas,
//    on repeuple le récif avec des boutures ;
//  - le poisson-perroquet broute le corail mort couvert d'algues et rejette du sable blanc.

export type CardId = 'herbier' | 'haies' | 'epuration' | 'peche' | 'oursins' | 'bouture';

export interface RavineResult {
  won: boolean;
  stars: number;
  /** Part du corail en bonne santé à la fin, en %. */
  reef: number;
  score: number;
  eaten: number;
  bestCombo: number;
  stage: number;
  waves: number;
}

export interface RavineCallbacks {
  onHud: (reef: number, score: number, wave: number, stage: number, raining: boolean) => void;
  onBanner: (text: string) => void;
  /** Fin d'une vague : le jeu se met en pause et propose trois cartes. */
  onChoice: (cards: CardId[], wave: number) => void;
  onEnd: (result: RavineResult) => void;
}

const TAU = Math.PI * 2;
const CELL = 30;
const CREST = 40;
const FONT = 'Fredoka, "Plus Jakarta Sans", sans-serif';
export const WAVES = 3;
/** Le récif est perdu sous cette part de corail vivant (en %). */
const LOSE_AT = 35;
/** Étoiles selon le corail sauvé (en %). */
const STAR_AT = [55, 70, 85];

const CORAL = 1;

/** Réglages de difficulté (modifiables depuis la console de développement pour les essais). */
export const TUNE = {
  /** Pousse des algues sans engrais, puis en plus par unité d'engrais (par seconde). */
  growBase: 0.006,
  growNut: 0.45,
  /** Chance qu'une algue apparaisse sur une case chargée d'engrais. */
  seedRate: 0.9,
  /** Corail étouffé : perte de santé par seconde sous un tapis d'algues, et récupération une fois libéré. */
  damage: 0.08,
  heal: 0.03,
  /** Engrais déposé par un nuage sur la case qu'il traverse. */
  deposit: 0.9,
  /** Nuages d'engrais par seconde au début et à la fin de la pluie. */
  emitBase: 6.5,
  emitRamp: 11,
  /** Extension des gros tapis d'algues aux cases voisines. */
  spreadBase: 0.1,
  spreadNut: 0.25,
  /** Vitesse du banc. */
  speed: 300,
  /** Vitesse à laquelle le banc broute. */
  eat: 2.4,
};
const HERBIER = 2;

const STAGES = [
  { name: 'demoiselles', at: 0, rate: 1, size: 7 },
  { name: 'chirurgiens', at: 30, rate: 1.35, size: 9 },
  { name: 'perroquets', at: 90, rate: 1.8, size: 12 },
];

const CORAL_COLORS = ['#ff8a73', '#f5b83d', '#b98cf0', '#ff6fa3', '#f29b4b', '#7fd3c7'];
const PENTA = [523, 587, 659, 784, 880, 1047, 1175, 1319, 1568, 1760];

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const hex = (c: string) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const mix = (a: string, b: string, t: number) => {
  const x = hex(a);
  const y = hex(b);
  return `rgb(${Math.round(lerp(x[0], y[0], t))},${Math.round(lerp(x[1], y[1], t))},${Math.round(lerp(x[2], y[2], t))})`;
};

/** Bruit lisse (valeurs interpolées sur une grille) pour dessiner des massifs de corail naturels. */
function noise(x: number, y: number, seed: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const fx = x - xi;
  const fy = y - yi;
  const v = (i: number, j: number) => hash(i * 57.3 + j * 131.7 + seed * 17.1);
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  return lerp(lerp(v(xi, yi), v(xi + 1, yi), sx), lerp(v(xi, yi + 1), v(xi + 1, yi + 1), sx), sy);
}

interface Fish {
  ox: number;
  oy: number;
  x: number;
  y: number;
  a: number;
  phase: number;
  stage: number;
}
interface Plume {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  r: number;
}
interface Part {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  r: number;
  color: string;
}
interface FloatText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  big: boolean;
}
interface Urchin {
  x: number;
  y: number;
  tx: number;
  ty: number;
  seed: number;
}

export function createRavineEngine(canvas: HTMLCanvasElement, cb: RavineCallbacks) {
  const ctx = canvas.getContext('2d')!;
  // Monde logique (fixé au lancement de la partie), affiché à l'échelle de l'écran.
  let W = 1000;
  /** Hauteur de la plage en haut de l'écran : plus haute en portrait, pour que la ravine reste visible sous les compteurs. */
  let BEACH = 92;
  let H = 600;
  let scale = 1;
  let ox = 0;
  let oy = 0;
  let dpr = 1;
  let cols = 0;
  let rows = 0;
  let kind = new Uint8Array(0);
  let algae = new Float32Array(0);
  let health = new Float32Array(0);
  let nut = new Float32Array(0);
  /** Plus haut niveau d'algues atteint depuis le dernier nettoyage : seul un vrai tapis compte pour le combo. */
  let peak = new Float32Array(0);
  let seeds = new Float32Array(0);
  let coralCount = 1;
  let mouths: number[] = [];

  let raf = 0;
  let last = 0;
  let playing = false;
  let paused = false;
  let choosing = false;
  let ended = false;
  let muted = false;
  let audio: AudioContext | null = null;
  let autopilot = false;
  let autoT = 0;

  let clock = 0;
  let t = 0;
  let wave = 0;
  let waveT = 0;
  let crued = false;
  let emission = 1;
  let rateBonus = 1;
  let herbierLevel = 0;
  let score = 0;
  let eaten = 0;
  let combo = 0;
  let comboT = 0;
  let comboPop = 0;
  let bestCombo = 0;
  let stage = 0;
  let shake = 0;
  let flash = 0;
  let flashColor = '255,255,255';
  let munchT = 0;
  let tick = 0;
  let deadSay = 0;
  let reef = 100;
  const hints = new Set<string>();
  const leader = { x: 500, y: 300, vx: 0, vy: 0 };
  const target = { x: 500, y: 300 };
  const keys = { up: false, down: false, left: false, right: false };
  let fish: Fish[] = [];
  let plumes: Plume[] = [];
  let parts: Part[] = [];
  let texts: FloatText[] = [];
  let urchins: Urchin[] = [];
  let sandLayer: HTMLCanvasElement | null = null;
  let result: RavineResult | null = null;

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
    gain.gain.exponentialRampToValueAtTime(vol, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(gain).connect(audio.destination);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  };
  const sfx = {
    munch: () => beep(rand(180, 260), 90, 0.05, 'square', 0.035),
    clean: (c: number) => {
      const f = PENTA[Math.min(PENTA.length - 1, Math.floor(c / 2))];
      beep(f, f * 1.02, 0.12, 'triangle', 0.09);
    },
    milestone: () => [784, 988, 1175, 1568].forEach((f, i) => beep(f, f, 0.16, 'triangle', 0.12, i * 0.07)),
    evolve: () => [523, 659, 784, 1047, 1319].forEach((f, i) => beep(f, f * 1.01, 0.2, 'triangle', 0.13, i * 0.09)),
    crue: () => {
      beep(110, 38, 1.1, 'sawtooth', 0.16);
      beep(70, 32, 1.3, 'square', 0.08, 0.1);
    },
    dead: () => beep(160, 70, 0.3, 'sine', 0.13),
    card: () => [659, 880, 1319].forEach((f, i) => beep(f, f, 0.14, 'sine', 0.12, i * 0.08)),
    win: () => [523, 659, 784, 1047].forEach((f, i) => beep(f, f, 0.22, 'triangle', 0.14, i * 0.13)),
    lose: () => [392, 330, 262].forEach((f, i) => beep(f, f * 0.97, 0.3, 'triangle', 0.12, i * 0.2)),
  };

  // --------------------------------------------------------------- layout
  const fit = () => {
    const cw = canvas.clientWidth || 1000;
    const ch = canvas.clientHeight || 600;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    scale = Math.min(cw / W, ch / H);
    ox = (cw - W * scale) / 2;
    oy = (ch - H * scale) / 2;
  };

  /** Taille du monde d'après l'écran : 600 de haut à l'horizontale, 420 de large à la verticale. */
  const pickWorld = () => {
    const cw = canvas.clientWidth || 1000;
    const ch = canvas.clientHeight || 600;
    let s = cw > ch ? ch / 600 : cw / 420;
    s = Math.max(s, cw / 1100, ch / 1000);
    W = cw / s;
    H = ch / s;
    BEACH = cw > ch ? 92 : 150;
  };

  const idx = (c: number, r: number) => r * cols + c;
  const cx = (c: number) => c * CELL + CELL / 2;
  const cy = (r: number) => BEACH + r * CELL + CELL / 2;
  const cellAt = (x: number, y: number) => {
    const c = Math.floor(x / CELL);
    const r = Math.floor((y - BEACH) / CELL);
    if (c < 0 || r < 0 || c >= cols || r >= rows) return -1;
    return idx(c, r);
  };

  const buildWorld = () => {
    pickWorld();
    cols = Math.ceil(W / CELL);
    rows = Math.max(6, Math.floor((H - BEACH - CREST) / CELL));
    const n = cols * rows;
    kind = new Uint8Array(n);
    algae = new Float32Array(n);
    health = new Float32Array(n);
    nut = new Float32Array(n);
    peak = new Float32Array(n);
    seeds = new Float32Array(n);
    const seed = Math.random() * 1000;
    mouths = W > H ? [W * 0.3, W * 0.76] : [W * 0.36, W * 0.8];
    coralCount = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = idx(c, r);
        seeds[i] = Math.random();
        // Plus de corail vers la barrière, du sable près de la plage.
        const depth = r / rows;
        const v = noise(c / 4.2, r / 4.2, seed) * 0.75 + noise(c / 1.7, r / 1.7, seed + 9) * 0.25;
        if (r >= 1 && v + depth * 0.22 > 0.56) {
          kind[i] = CORAL;
          health[i] = 1;
          coralCount++;
        }
      }
    }
    // Un petit herbier naturel, loin de l'embouchure : les cartes en plantent devant la ravine.
    const hc = Math.floor(cols * (W > H ? 0.55 : 0.12));
    for (let r = 0; r < Math.min(3, rows); r++)
      for (let c = hc; c < Math.min(cols, hc + 3 - r); c++) {
        const i = idx(c, r);
        if (kind[i] === CORAL) coralCount--;
        kind[i] = HERBIER;
        health[i] = 0;
      }
    coralCount = Math.max(1, coralCount);
    // Des algues dès le départ, pour que le banc ait de quoi grignoter tout de suite.
    for (let k = 0; k < Math.round(n * 0.05); k++) {
      const c0 = Math.floor(rand(1, cols - 1));
      const r0 = Math.floor(rand(1, rows - 1));
      for (let d = 0; d < 5; d++) {
        const c = clamp(c0 + Math.round(rand(-1.4, 1.4)), 0, cols - 1);
        const r = clamp(r0 + Math.round(rand(-1.4, 1.4)), 0, rows - 1);
        const i = idx(c, r);
        if (kind[i] !== HERBIER) algae[i] = peak[i] = Math.max(algae[i], rand(0.45, 0.9));
      }
    }
    leader.x = target.x = W / 2;
    leader.y = target.y = BEACH + rows * CELL * 0.55;
    leader.vx = leader.vy = 0;
    sandLayer = null;
    fit();
  };

  /** Fond de sable et herbiers, dessiné une fois (et après chaque herbier planté). */
  const paintSand = () => {
    const layer = document.createElement('canvas');
    layer.width = Math.ceil(W);
    layer.height = Math.ceil(H);
    const g = layer.getContext('2d')!;
    const grad = g.createLinearGradient(0, BEACH, 0, H);
    grad.addColorStop(0, '#8fe3dc');
    grad.addColorStop(0.55, '#45c2c9');
    grad.addColorStop(1, '#1f8fb0');
    g.fillStyle = grad;
    g.fillRect(0, BEACH, W, H - BEACH);
    // Taches de sable clair au fond.
    for (let k = 0; k < (W * H) / 900; k++) {
      g.fillStyle = `rgba(255,248,225,${rand(0.05, 0.16)})`;
      g.beginPath();
      g.ellipse(rand(0, W), rand(BEACH, H), rand(4, 22), rand(2, 9), rand(0, TAU), 0, TAU);
      g.fill();
    }
    // Dalle du récif sous les massifs de corail : elle relie les cases en un vrai platier.
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        if (kind[idx(c, r)] !== CORAL) continue;
        g.fillStyle = 'rgba(176,150,112,0.32)';
        g.beginPath();
        g.ellipse(cx(c) + rand(-3, 3), cy(r) + rand(-3, 3), CELL * 0.85, CELL * 0.78, rand(0, TAU), 0, TAU);
        g.fill();
      }
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        if (kind[idx(c, r)] !== HERBIER) continue;
        const x = cx(c);
        const y = cy(r);
        g.fillStyle = 'rgba(40,120,70,0.35)';
        g.beginPath();
        g.ellipse(x, y, CELL * 0.62, CELL * 0.56, 0, 0, TAU);
        g.fill();
        g.strokeStyle = '#2f9a5a';
        g.lineWidth = 2.2;
        g.lineCap = 'round';
        for (let b = 0; b < 7; b++) {
          const bx = x + rand(-12, 12);
          const by = y + rand(-8, 12);
          g.beginPath();
          g.moveTo(bx, by);
          g.quadraticCurveTo(bx + rand(-6, 6), by - 10, bx + rand(-8, 8), by - rand(14, 20));
          g.stroke();
        }
      }
    sandLayer = layer;
  };

  // ------------------------------------------------------------- entrées
  const toWorld = (clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    return { x: (clientX - rect.left - ox) / scale, y: (clientY - rect.top - oy) / scale };
  };
  const onPointer = (e: PointerEvent) => {
    if (!playing || paused || choosing) return;
    const p = toWorld(e.clientX, e.clientY);
    // Au doigt, on vise un peu au-dessus pour que le banc ne soit pas caché sous le doigt.
    const lift = e.pointerType === 'touch' ? 46 : 0;
    target.x = clamp(p.x, 10, W - 10);
    target.y = clamp(p.y - lift, BEACH + 6, H - CREST + 10);
  };
  const onKey = (down: boolean) => (e: KeyboardEvent) => {
    const k = e.key;
    if (k === 'ArrowUp' || k === 'z' || k === 'w') keys.up = down;
    else if (k === 'ArrowDown' || k === 's') keys.down = down;
    else if (k === 'ArrowLeft' || k === 'q' || k === 'a') keys.left = down;
    else if (k === 'ArrowRight' || k === 'd') keys.right = down;
    else return;
    if (playing) e.preventDefault();
  };
  const keyDown = onKey(true);
  const keyUp = onKey(false);

  // ------------------------------------------------------------ gameplay
  const say = (text: string, color: string, x: number, y: number, big = false) => {
    texts.push({ x: clamp(x, 70, W - 70), y: clamp(y, BEACH + 20, H - 30), text, color, life: big ? 1.6 : 1.1, big });
  };
  const hint = (key: string, text: string) => {
    if (hints.has(key)) return;
    hints.add(key);
    cb.onBanner(text);
  };
  const burst = (x: number, y: number, n: number, color: string, speed = 90, r = 3) => {
    for (let k = 0; k < n; k++) {
      const a = rand(0, TAU);
      const v = rand(speed * 0.3, speed);
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(0.4, 0.8), max: 0.8, r: rand(r * 0.6, r * 1.3), color });
    }
  };

  const addFish = (n: number) => {
    for (let k = 0; k < n && fish.length < 34; k++) {
      const a = rand(0, TAU);
      const d = Math.sqrt(Math.random());
      fish.push({ ox: Math.cos(a) * d, oy: Math.sin(a) * d, x: leader.x, y: leader.y, a: 0, phase: rand(0, TAU), stage });
    }
  };
  const radius = () => 20 + Math.sqrt(fish.length) * 8.5 + (stage === 2 ? 8 : 0);

  const reefPercent = () => {
    let sum = 0;
    for (let i = 0; i < kind.length; i++) if (kind[i] === CORAL) sum += health[i];
    return (sum / coralCount) * 100;
  };

  /** Le banc mange les algues autour de lui. */
  const graze = (dt: number) => {
    const R = radius();
    const rate = STAGES[stage].rate * rateBonus * TUNE.eat;
    const c0 = Math.max(0, Math.floor((leader.x - R) / CELL));
    const c1 = Math.min(cols - 1, Math.floor((leader.x + R) / CELL));
    const r0 = Math.max(0, Math.floor((leader.y - R - BEACH) / CELL));
    const r1 = Math.min(rows - 1, Math.floor((leader.y + R - BEACH) / CELL));
    let ate = false;
    for (let r = r0; r <= r1; r++)
      for (let c = c0; c <= c1; c++) {
        const i = idx(c, r);
        if (algae[i] <= 0) continue;
        const d = Math.hypot(cx(c) - leader.x, cy(r) - leader.y);
        if (d > R + CELL * 0.4) continue;
        const w = clamp(1.25 - d / R, 0.25, 1);
        const before = algae[i];
        algae[i] = Math.max(0, before - dt * rate * w);
        ate = true;
        if (algae[i] < 0.03) {
          algae[i] = 0;
          if (before >= 0.03 && peak[i] >= 0.3) cleaned(c, r, i);
          peak[i] = 0;
        }
      }
    if (ate && munchT <= 0) {
      sfx.munch();
      munchT = 0.12;
    }
  };

  const cleaned = (c: number, r: number, i: number) => {
    eaten++;
    combo++;
    comboT = 1.1;
    comboPop = 1;
    bestCombo = Math.max(bestCombo, combo);
    const gain = 10 * Math.min(combo, 25);
    score += gain;
    sfx.clean(combo);
    const x = cx(c);
    const y = cy(r);
    burst(x, y, 5, '#7cc04a', 70, 3);
    if (kind[i] === CORAL && health[i] > 0) burst(x, y, 4, '#ffe08a', 60, 2.5);
    if (combo % 4 === 0) say(`+${gain}`, '#fff6c9', x, y - 10);
    if (combo === 10 || combo === 25 || (combo >= 50 && Number.isInteger(Math.log2(combo / 50)))) {
      sfx.milestone();
      flash = 0.35;
      flashColor = '255,236,150';
      say(combo >= 50 ? `Festin géant x${combo} !` : combo >= 25 ? `Super festin x${combo} !` : `Festin x${combo} !`, '#ffd34d', leader.x, leader.y - 60, true);
      score += Math.min(combo, 200) * 20;
    }
    if (eaten % 5 === 0) addFish(1);
    const next = STAGES[stage + 1];
    if (next && eaten >= next.at) evolve();
  };

  const evolve = () => {
    stage++;
    sfx.evolve();
    flash = 0.6;
    flashColor = '180,255,230';
    shake = Math.max(shake, 0.25);
    burst(leader.x, leader.y, 40, '#bff7ff', 220, 4);
    addFish(3);
    cb.onBanner(
      stage === 1
        ? 'Ton banc évolue : les poissons-chirurgiens arrivent ! Ils broutent plus vite.'
        : 'Les poissons-perroquets sont là ! Leur bec racle les algues… et ils rejettent du sable blanc.',
    );
  };

  /** Pluie, ravine, engrais : la menace. */
  const ravine = (dt: number) => {
    const calm = wave === 1 ? 7 : 5;
    const rain = 24;
    const after = 9;
    waveT += dt;
    const raining = waveT > calm && waveT < calm + rain;
    if (raining) {
      hint(`pluie${wave}`, wave === 1 ? 'Il pleut ! La ravine emporte l’engrais des champs et des jardins vers le lagon.' : wave === 2 ? 'Vague 2 : nouvelle pluie, la ravine se remplit plus vite.' : 'Vague 3 : orage ! Une deuxième ravine se met à couler.');
      const ramp = clamp((waveT - calm) / rain, 0, 1);
      const rate = (TUNE.emitBase + ramp * TUNE.emitRamp) * (1 + (wave - 1) * 0.35) * emission;
      const active = wave >= 3 ? mouths : mouths.slice(0, 1);
      for (const m of active) if (Math.random() < rate * dt) spawnPlume(m, 1);
    }
    if (!crued && waveT >= calm + rain) {
      crued = true;
      sfx.crue();
      shake = 1;
      flash = 0.4;
      flashColor = '150,120,60';
      cb.onBanner('La crue ! La ravine déborde et crache un gros nuage d’engrais.');
      const active = wave >= 3 ? mouths : mouths.slice(0, 1);
      for (const m of active) for (let k = 0; k < Math.round(34 * emission); k++) spawnPlume(m, 1.8);
    }
    if (waveT >= calm + rain + after) {
      if (wave >= WAVES) finish(true);
      else {
        choosing = true;
        cb.onChoice(drawCards(), wave);
      }
    }
    return raining;
  };

  const spawnPlume = (mx: number, force: number) => {
    plumes.push({
      x: mx + rand(-12, 12),
      y: BEACH - 6,
      vx: rand(-40, 40) * force,
      vy: rand(50, 95) * force,
      life: rand(6, 9),
      max: 9,
      r: rand(14, 24) * (force > 1 ? 1.25 : 1),
    });
  };

  const updatePlumes = (dt: number) => {
    for (const p of plumes) {
      p.vx += rand(-60, 60) * dt;
      p.vx *= 1 - dt * 0.5;
      p.vy *= 1 - dt * 0.42;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      p.r += dt * 5;
      const i = cellAt(p.x, p.y);
      if (i >= 0) {
        if (kind[i] === HERBIER) {
          // L'herbier retient l'engrais : le nuage s'y dissout.
          p.life -= dt * 4;
          if (!hints.has('filtre')) hint('filtre', 'Regarde : l’herbier retient l’engrais, le nuage s’y arrête !');
        } else nut[i] = Math.min(1, nut[i] + dt * TUNE.deposit * (p.life / p.max + 0.3));
      }
      if (p.x < -40 || p.x > W + 40 || p.y > H) p.life = 0;
    }
    plumes = plumes.filter((p) => p.life > 0);
  };

  /** Les algues poussent avec l'engrais et étouffent le corail. */
  const grow = (dt: number) => {
    let died = -1;
    for (let i = 0; i < kind.length; i++) {
      const k = kind[i];
      if (k === HERBIER) {
        nut[i] *= 1 - dt * 2;
        continue;
      }
      const n = nut[i];
      nut[i] = n * (1 - dt * 0.05);
      let a = algae[i];
      if (a > 0) a = Math.min(1, a + dt * (TUNE.growBase + n * TUNE.growNut));
      else if (n > 0.12 && Math.random() < dt * n * TUNE.seedRate) a = 0.06;
      algae[i] = a;
      if (a > peak[i]) peak[i] = a;
      if (k === CORAL && health[i] > 0) {
        if (a > 0.55) {
          health[i] -= dt * TUNE.damage * a;
          if (health[i] <= 0) {
            health[i] = 0;
            died = i;
          }
        } else if (a < 0.2) health[i] = Math.min(1, health[i] + dt * TUNE.heal);
      }
    }
    if (died >= 0) {
      const c = died % cols;
      const r = Math.floor(died / cols);
      burst(cx(c), cy(r), 8, '#9a958b', 60, 3);
      if (deadSay <= 0) {
        sfx.dead();
        say('Corail étouffé', '#ffb4a6', cx(c), cy(r) - 18);
        deadSay = 3;
      }
      hint('mort', 'Un corail est mort, étouffé par les algues. Un corail mort ne revit pas : protège les autres !');
    }
  };

  /** Toutes les 0,25 s : les gros tapis d'algues s'étendent aux cases voisines. */
  const spread = () => {
    for (let i = 0; i < kind.length; i++) {
      if (algae[i] < 0.75 || Math.random() > TUNE.spreadBase + nut[i] * TUNE.spreadNut) continue;
      const c = i % cols;
      const r = Math.floor(i / cols);
      const dc = Math.round(rand(-1, 1));
      const dr = Math.round(rand(-1, 1));
      const c2 = c + dc;
      const r2 = r + dr;
      if (c2 < 0 || r2 < 0 || c2 >= cols || r2 >= rows) continue;
      const j = idx(c2, r2);
      if (kind[j] !== HERBIER && algae[j] === 0) algae[j] = 0.06;
    }
  };

  const updateUrchins = (dt: number) => {
    for (const u of urchins) {
      const d = Math.hypot(u.tx - u.x, u.ty - u.y);
      if (d > 2) {
        u.x += ((u.tx - u.x) / d) * Math.min(d, 26 * dt);
        u.y += ((u.ty - u.y) / d) * Math.min(d, 26 * dt);
        continue;
      }
      const i = cellAt(u.x, u.y);
      if (i < 0) continue;
      if (algae[i] > 0) {
        algae[i] = Math.max(0, algae[i] - dt * 0.35);
        if (algae[i] < 0.03) {
          algae[i] = 0;
          score += 5;
        }
        continue;
      }
      // Cherche des algues tout près ; sinon il râpe le corail sous lui.
      const c = Math.floor(u.x / CELL);
      const r = Math.floor((u.y - BEACH) / CELL);
      let best = -1;
      let bestA = 0.05;
      for (let dr = -2; dr <= 2; dr++)
        for (let dc = -2; dc <= 2; dc++) {
          const c2 = c + dc;
          const r2 = r + dr;
          if (c2 < 0 || r2 < 0 || c2 >= cols || r2 >= rows) continue;
          const j = idx(c2, r2);
          if (algae[j] > bestA) {
            bestA = algae[j];
            best = j;
          }
        }
      if (best >= 0) {
        u.tx = cx(best % cols) + rand(-6, 6);
        u.ty = cy(Math.floor(best / cols)) + rand(-6, 6);
      } else if (kind[i] === CORAL && health[i] > 0) {
        health[i] = Math.max(0.02, health[i] - dt * 0.012 * urchins.length / 6);
        if (urchins.length > 6) hint('trop-oursins', 'Trop d’oursins : sans algues à manger, ils râpent le corail lui-même.');
        // Puis il se déplace un peu au hasard.
        if (Math.random() < dt * 0.4) {
          u.tx = clamp(u.x + rand(-60, 60), 10, W - 10);
          u.ty = clamp(u.y + rand(-60, 60), BEACH + 10, BEACH + rows * CELL - 10);
        }
      }
    }
  };

  const moveSchool = (dt: number) => {
    if (autopilot) {
      autoT -= dt;
      if (autoT <= 0) {
        autoT = 0.7;
        autoTarget();
      }
    }
    const kx = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    const ky = (keys.down ? 1 : 0) - (keys.up ? 1 : 0);
    if (kx || ky) {
      const n = Math.hypot(kx, ky);
      target.x = clamp(leader.x + (kx / n) * 120, 10, W - 10);
      target.y = clamp(leader.y + (ky / n) * 120, BEACH + 6, H - CREST + 10);
    }
    const max = TUNE.speed + stage * 35;
    const dx = target.x - leader.x;
    const dy = target.y - leader.y;
    const d = Math.hypot(dx, dy);
    const want = d < 4 ? 0 : Math.min(max, d * 5);
    const wx = d > 0 ? (dx / d) * want : 0;
    const wy = d > 0 ? (dy / d) * want : 0;
    const k = Math.min(1, dt * 7);
    leader.vx += (wx - leader.vx) * k;
    leader.vy += (wy - leader.vy) * k;
    leader.x = clamp(leader.x + leader.vx * dt, 0, W);
    leader.y = clamp(leader.y + leader.vy * dt, BEACH, H - CREST + 14);
    const spread = radius() * 0.9;
    const heading = Math.atan2(leader.vy, leader.vx);
    const moving = Math.hypot(leader.vx, leader.vy) > 30;
    for (const f of fish) {
      f.phase += dt * (moving ? 14 : 7);
      const wob = Math.sin(f.phase * 0.31) * 0.18;
      const tx = leader.x + (f.ox + wob) * spread;
      const ty = leader.y + (f.oy + Math.cos(f.phase * 0.27) * 0.18) * spread;
      const px = f.x;
      const py = f.y;
      const kk = Math.min(1, dt * (4 + f.ox * 0.7));
      f.x += (tx - f.x) * kk;
      f.y += (ty - f.y) * kk;
      const vx = f.x - px;
      const vy = f.y - py;
      const a = moving ? heading : Math.hypot(vx, vy) > 0.05 ? Math.atan2(vy, vx) : f.a;
      let da = a - f.a;
      while (da > Math.PI) da -= TAU;
      while (da < -Math.PI) da += TAU;
      f.a += da * Math.min(1, dt * 8);
      // Évolution progressive du banc, poisson par poisson.
      if (f.stage < stage && Math.random() < dt * 2.2) {
        f.stage = stage;
        burst(f.x, f.y, 4, '#ffffff', 50, 2);
      }
      // Le perroquet rejette du sable blanc.
      if (f.stage === 2 && moving && Math.random() < dt * 0.25)
        parts.push({ x: f.x - Math.cos(f.a) * 12, y: f.y - Math.sin(f.a) * 12, vx: rand(-8, 8), vy: rand(-8, 8), life: 1.4, max: 1.4, r: 2.4, color: '#fffbea' });
    }
  };

  /** Pilote automatique pour les tests : file vers le plus gros tas d'algues proche. */
  const autoTarget = () => {
    let best = -1;
    let bestV = 0;
    for (let i = 0; i < kind.length; i++) {
      if (algae[i] < 0.05) continue;
      const c = i % cols;
      const r = Math.floor(i / cols);
      const d = Math.hypot(cx(c) - leader.x, cy(r) - leader.y);
      const danger = kind[i] === CORAL && health[i] > 0 ? 1.6 : 1;
      const v = (algae[i] * danger) / (60 + d);
      if (v > bestV) {
        bestV = v;
        best = i;
      }
    }
    if (best >= 0) {
      target.x = cx(best % cols);
      target.y = cy(Math.floor(best / cols));
    }
  };

  // --------------------------------------------------------------- cartes
  const deadCells = () => {
    const out: number[] = [];
    for (let i = 0; i < kind.length; i++) if (kind[i] === CORAL && health[i] <= 0) out.push(i);
    return out;
  };
  const drawCards = (): CardId[] => {
    const pool: CardId[] = ['herbier', 'haies', 'epuration', 'peche', 'oursins', 'bouture'];
    const ok = pool.filter((c) => {
      if (c === 'herbier') return herbierLevel < 2;
      if (c === 'bouture') return deadCells().length > 0;
      return true;
    });
    for (let i = ok.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ok[i], ok[j]] = [ok[j], ok[i]];
    }
    return ok.slice(0, 3);
  };

  const plantHerbier = (mx: number) => {
    for (let r = 0; r < Math.min(4, rows); r++)
      for (let c = 0; c < cols; c++) {
        const d = Math.hypot(cx(c) - mx, (cy(r) - BEACH) * 1.4);
        if (d > 100 - r * 8) continue;
        const i = idx(c, r);
        if (kind[i] === CORAL) continue;
        kind[i] = HERBIER;
        algae[i] = 0;
        burst(cx(c), cy(r), 3, '#7ee08f', 60, 3);
      }
  };

  const apply = (card: CardId) => {
    sfx.card();
    if (card === 'herbier') {
      herbierLevel++;
      plantHerbier(mouths[0]);
      if (herbierLevel >= 2) plantHerbier(mouths[1]);
      sandLayer = null;
    } else if (card === 'haies') emission *= 0.62;
    else if (card === 'epuration') emission *= 0.72;
    else if (card === 'peche') {
      addFish(6);
      rateBonus *= 1.15;
    } else if (card === 'oursins') {
      for (let k = 0; k < 6; k++) {
        const x = rand(30, W - 30);
        const y = rand(BEACH + 60, BEACH + rows * CELL - 20);
        urchins.push({ x, y, tx: x, ty: y, seed: Math.random() });
      }
    } else if (card === 'bouture') {
      const dead = deadCells().sort(() => Math.random() - 0.5).slice(0, 10);
      for (const i of dead) {
        health[i] = 0.45;
        algae[i] = 0;
        burst(cx(i % cols), cy(Math.floor(i / cols)), 6, '#ffb3c7', 70, 3);
      }
    }
  };

  // ------------------------------------------------------------------ fin
  const finish = (won: boolean) => {
    if (ended) return;
    ended = true;
    playing = false;
    reef = reefPercent();
    const pct = Math.round(reef);
    const stars = won ? STAR_AT.filter((s) => pct >= s).length : 0;
    result = { won: won && stars > 0, stars, reef: pct, score, eaten, bestCombo, stage, waves: wave };
    if (result.won) sfx.win();
    else sfx.lose();
    cb.onEnd(result);
  };

  // --------------------------------------------------------------- boucle
  const update = (dt: number) => {
    clock += dt;
    shake = Math.max(0, shake - dt * 1.6);
    flash = Math.max(0, flash - dt * 1.4);
    comboPop = Math.max(0, comboPop - dt * 4);
    for (const p of parts) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 1 - dt * 3;
      p.vy *= 1 - dt * 3;
      p.life -= dt;
    }
    parts = parts.filter((p) => p.life > 0);
    for (const tx of texts) {
      tx.y -= dt * 34;
      tx.life -= dt;
    }
    texts = texts.filter((x) => x.life > 0);
    if (!playing || paused || choosing) return;
    t += dt;
    munchT -= dt;
    deadSay -= dt;
    if (comboT > 0) {
      comboT -= dt;
      if (comboT <= 0) combo = 0;
    }
    const raining = ravine(dt);
    if (ended || choosing) return;
    updatePlumes(dt);
    grow(dt);
    tick += dt;
    if (tick > 0.25) {
      tick = 0;
      spread();
    }
    moveSchool(dt);
    graze(dt);
    updateUrchins(dt);
    reef = reefPercent();
    if (reef < 70) hint('alerte', 'Attention : les algues gagnent ! Fonce sur les coraux qui pâlissent.');
    cb.onHud(reef, score, wave, stage, raining);
    if (reef < LOSE_AT) finish(false);
  };

  // ---------------------------------------------------------------- rendu
  const drawBeach = () => {
    ctx.fillStyle = '#f1dfb4';
    ctx.fillRect(0, 0, W, BEACH);
    // Filaos en haut.
    for (let x = -10; x < W + 30; x += 34) {
      const h = hash(x);
      ctx.fillStyle = h > 0.5 ? '#3f6b3a' : '#4d7d43';
      ctx.beginPath();
      ctx.ellipse(x + h * 10, 10 + h * 8, 26, 22, 0, 0, TAU);
      ctx.fill();
    }
    // Ravines : un lit de galets, qui coule en marron pendant la pluie.
    const raining = playing && plumes.length > 0;
    mouths.forEach((m, k) => {
      const active = k === 0 || wave >= 3;
      ctx.fillStyle = '#a39b8c';
      ctx.beginPath();
      ctx.moveTo(m - 22, 0);
      ctx.quadraticCurveTo(m - 30, BEACH * 0.5, m - 34, BEACH);
      ctx.lineTo(m + 34, BEACH);
      ctx.quadraticCurveTo(m + 30, BEACH * 0.5, m + 22, 0);
      ctx.fill();
      if (active && raining) {
        ctx.fillStyle = 'rgba(150,115,60,0.85)';
        ctx.beginPath();
        ctx.moveTo(m - 14, 0);
        ctx.quadraticCurveTo(m - 20, BEACH * 0.5, m - 26, BEACH);
        ctx.lineTo(m + 26, BEACH);
        ctx.quadraticCurveTo(m + 20, BEACH * 0.5, m + 14, 0);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,240,200,0.5)';
        ctx.lineWidth = 2;
        for (let y = (clock * 90) % 18; y < BEACH; y += 18) {
          ctx.beginPath();
          ctx.moveTo(m - 6, y);
          ctx.lineTo(m + 2, y + 7);
          ctx.stroke();
        }
      }
      ctx.fillStyle = '#5b4a33';
      ctx.font = `600 12px ${FONT}`;
      ctx.textAlign = 'center';
      if (active) ctx.fillText('ravine', m + 58, BEACH - 14);
    });
    // Bord de l'eau.
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 12) ctx.lineTo(x, BEACH + Math.sin(x * 0.05 + clock * 1.6) * 2.5);
    ctx.stroke();
  };

  const drawCoral = (x0: number, y0: number, s: number, h: number, i: number) => {
    const dead = h <= 0;
    const base = CORAL_COLORS[Math.floor(s * CORAL_COLORS.length)];
    const col = dead ? '#9a958b' : mix('#efece4', base, clamp(h * 1.15 - 0.1, 0, 1));
    const dark = dead ? '#7d786f' : mix('#cfcabe', base, clamp(h - 0.15, 0, 1) * 0.75);
    // Position et taille légèrement décalées : le récif ne doit pas ressembler à un damier.
    const x = x0 + (hash(s * 91) - 0.5) * 10;
    const y = y0 + (hash(s * 37) - 0.5) * 10;
    const k = 0.8 + hash(s * 53) * 0.4;
    const style = Math.floor(s * 31) % 3;
    ctx.lineCap = 'round';
    if (style === 0) {
      // Corail massif (Porites) : boule bosselée.
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.arc(x + 1.5, y + 2, 12 * k, 0, TAU);
      ctx.fill();
      ctx.fillStyle = col;
      ctx.beginPath();
      for (let a = 0; a <= 12; a++) {
        const ang = (a / 12) * TAU;
        const rr = (11 + Math.sin(ang * 5 + s * 20) * 1.4) * k;
        ctx.lineTo(x + Math.cos(ang) * rr, y + Math.sin(ang) * rr);
      }
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.12)';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(x - 2, y - 1, 5.5 * k, 0.4, 2.8);
      ctx.stroke();
    } else if (style === 1) {
      // Corail branchu (Acropora) : branches qui se divisent en Y.
      const branch = (bx: number, by: number, ang: number, len: number, depth: number) => {
        const ex = bx + Math.cos(ang) * len;
        const ey = by + Math.sin(ang) * len;
        ctx.lineWidth = 2.2 + depth * 1.3;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        if (depth > 0) {
          branch(ex, ey, ang - 0.5, len * 0.7, depth - 1);
          branch(ex, ey, ang + 0.5, len * 0.7, depth - 1);
        } else {
          ctx.beginPath();
          ctx.arc(ex, ey, 2.2, 0, TAU);
          ctx.fill();
        }
      };
      const turn = s * TAU;
      ctx.strokeStyle = dark;
      ctx.fillStyle = dark;
      for (let b = 0; b < 3; b++) branch(x + 1, y + 1.5, turn + (b * TAU) / 3, 7 * k, 1);
      ctx.strokeStyle = col;
      ctx.fillStyle = col;
      for (let b = 0; b < 3; b++) branch(x, y, turn + (b * TAU) / 3, 7 * k, 1);
    } else {
      // Corail table : grande assiette plate avec un liseré clair.
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.ellipse(x + 1.5, y + 2, 14 * k, 10.5 * k, s * 3, 0, TAU);
      ctx.fill();
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(x, y, 13.5 * k, 10 * k, s * 3, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(x, y, 10.5 * k, 7.5 * k, s * 3, 0, TAU);
      ctx.stroke();
    }
    // Corail en danger : il clignote.
    if (!dead && h < 0.4 && algae[i] > 0.4) {
      ctx.strokeStyle = `rgba(255,90,70,${0.35 + 0.35 * Math.sin(clock * 9 + s * 10)})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(x, y, 16, 0, TAU);
      ctx.stroke();
    }
  };

  const drawAlgae = (x: number, y: number, a: number, s: number) => {
    const n = 2 + Math.ceil(a * 4);
    ctx.fillStyle = `rgba(92,158,58,${0.45 + a * 0.5})`;
    for (let k = 0; k < n; k++) {
      const h1 = hash(s * 100 + k);
      const h2 = hash(s * 200 + k * 7);
      const sway = Math.sin(clock * 2 + s * 20 + k) * 1.5;
      ctx.beginPath();
      ctx.ellipse(x + (h1 - 0.5) * 22 + sway, y + (h2 - 0.5) * 22, 3 + a * 7, 2.5 + a * 5, h1 * 3, 0, TAU);
      ctx.fill();
    }
    if (a > 0.6) {
      ctx.fillStyle = 'rgba(140,200,80,0.55)';
      ctx.beginPath();
      ctx.arc(x + Math.sin(s * 40) * 5, y + Math.cos(s * 40) * 5, 4 + a * 3, 0, TAU);
      ctx.fill();
    }
  };

  const drawFish = (f: Fish) => {
    const st = STAGES[f.stage];
    const sz = st.size;
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate(f.a);
    const tail = Math.sin(f.phase) * 0.45;
    // Ombre.
    ctx.fillStyle = 'rgba(0,40,60,0.18)';
    ctx.beginPath();
    ctx.ellipse(3, 5, sz, sz * 0.45, 0, 0, TAU);
    ctx.fill();
    const body = f.stage === 0 ? '#3d8bff' : f.stage === 1 ? '#f3f0dc' : '#2fc6a0';
    const fin = f.stage === 0 ? '#ffd24a' : f.stage === 1 ? '#2b2b2b' : '#ff7ac0';
    ctx.fillStyle = fin;
    ctx.beginPath();
    ctx.moveTo(-sz * 0.8, 0);
    ctx.lineTo(-sz * 1.6, -sz * 0.55 + tail * sz * 0.4);
    ctx.lineTo(-sz * 1.6, sz * 0.55 + tail * sz * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(0, 0, sz, sz * 0.5, 0, 0, TAU);
    ctx.fill();
    if (f.stage === 1) {
      ctx.strokeStyle = '#2b2b2b';
      ctx.lineWidth = 1.5;
      for (const bx of [-sz * 0.4, 0.05 * sz, sz * 0.45]) {
        ctx.beginPath();
        ctx.moveTo(bx, -sz * 0.45);
        ctx.lineTo(bx, sz * 0.45);
        ctx.stroke();
      }
    }
    if (f.stage === 2) {
      ctx.fillStyle = '#ffe36e';
      ctx.beginPath();
      ctx.ellipse(sz * 0.85, 0, sz * 0.28, sz * 0.22, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,122,192,0.65)';
      ctx.beginPath();
      ctx.ellipse(-sz * 0.1, 0, sz * 0.5, sz * 0.18, 0, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = '#0b2233';
    ctx.beginPath();
    ctx.arc(sz * 0.5, -sz * 0.15, Math.max(1.3, sz * 0.12), 0, TAU);
    ctx.fill();
    ctx.restore();
  };

  const drawUrchin = (u: Urchin) => {
    ctx.save();
    ctx.translate(u.x, u.y);
    ctx.strokeStyle = '#2a1f3d';
    ctx.lineWidth = 1.5;
    for (let k = 0; k < 14; k++) {
      const a = (k / 14) * TAU + u.seed;
      const l = 9 + Math.sin(clock * 2 + k + u.seed * 9) * 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * l, Math.sin(a) * l);
      ctx.stroke();
    }
    ctx.fillStyle = '#3a2b55';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, TAU);
    ctx.fill();
    ctx.restore();
  };

  const render = () => {
    const cw = canvas.width;
    const ch = canvas.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#06476a';
    ctx.fillRect(0, 0, cw, ch);
    const sx = shake > 0 ? rand(-1, 1) * shake * 9 : 0;
    const sy = shake > 0 ? rand(-1, 1) * shake * 9 : 0;
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * (ox + sx), dpr * (oy + sy));
    if (!sandLayer) paintSand();
    ctx.drawImage(sandLayer!, 0, 0);

    // Engrais déposé : un voile vert sur l'eau.
    for (let i = 0; i < kind.length; i++) {
      const n = nut[i];
      if (n < 0.04 || kind[i] === HERBIER) continue;
      ctx.fillStyle = `rgba(150,170,40,${Math.min(0.32, n * 0.4)})`;
      ctx.fillRect((i % cols) * CELL, BEACH + Math.floor(i / cols) * CELL, CELL, CELL);
    }
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const i = idx(c, r);
        if (kind[i] === CORAL) drawCoral(cx(c), cy(r), seeds[i], health[i], i);
      }
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const i = idx(c, r);
        if (algae[i] > 0.02) drawAlgae(cx(c), cy(r), algae[i], seeds[i]);
      }

    // Nuages d'engrais.
    for (const p of plumes) {
      const a = Math.min(1, p.life / 2) * 0.42;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      g.addColorStop(0, `rgba(120,140,30,${a})`);
      g.addColorStop(1, 'rgba(120,140,30,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, TAU);
      ctx.fill();
    }

    urchins.forEach(drawUrchin);

    // Zone où le banc mange.
    if (playing) {
      ctx.strokeStyle = 'rgba(255,255,255,0.28)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 8]);
      ctx.beginPath();
      ctx.arc(leader.x, leader.y, radius(), clock * 0.6, clock * 0.6 + TAU);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    fish.forEach(drawFish);

    for (const p of parts) {
      ctx.globalAlpha = clamp(p.life / p.max, 0, 1);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Barrière de corail et vagues.
    const crestY = BEACH + rows * CELL;
    ctx.fillStyle = '#16708f';
    ctx.fillRect(0, crestY, W, H - crestY);
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 3;
    for (let k = 0; k < 2; k++) {
      ctx.beginPath();
      for (let x = 0; x <= W; x += 10) ctx.lineTo(x, crestY + 8 + k * 14 + Math.sin(x * 0.04 + clock * (2 + k) + k) * 3);
      ctx.stroke();
    }

    drawBeach();

    // Pluie.
    if (playing && plumes.length > 0 && !choosing) {
      ctx.strokeStyle = 'rgba(220,240,255,0.35)';
      ctx.lineWidth = 1.2;
      for (let k = 0; k < 70; k++) {
        const x = (hash(k) * W + clock * 60) % W;
        const y = (hash(k + 50) * H + clock * 520) % H;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 4, y + 14);
        ctx.stroke();
      }
    }

    for (const tx of texts) {
      ctx.globalAlpha = clamp(tx.life * 1.6, 0, 1);
      ctx.font = `700 ${tx.big ? 30 : 17}px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.lineWidth = tx.big ? 5 : 3.5;
      ctx.strokeStyle = 'rgba(6,50,74,0.85)';
      ctx.strokeText(tx.text, tx.x, tx.y);
      ctx.fillStyle = tx.color;
      ctx.fillText(tx.text, tx.x, tx.y);
    }
    ctx.globalAlpha = 1;

    // Combo.
    if (playing && combo >= 3) {
      const s = 1 + comboPop * 0.35;
      ctx.save();
      ctx.translate(W / 2, BEACH + 34);
      ctx.scale(s, s);
      ctx.font = `700 26px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.lineWidth = 5;
      ctx.strokeStyle = 'rgba(6,50,74,0.9)';
      const label = `COMBO x${combo}`;
      ctx.strokeText(label, 0, 0);
      ctx.fillStyle = combo >= 25 ? '#ff8a73' : combo >= 10 ? '#ffd34d' : '#ffffff';
      ctx.fillText(label, 0, 0);
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillRect(-50, 10, 100 * clamp(comboT / 1.1, 0, 1), 4);
      ctx.restore();
    }

    if (flash > 0) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = `rgba(${flashColor},${flash * 0.45})`;
      ctx.fillRect(0, 0, cw, ch);
    }
  };

  const frame = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt);
    render();
    raf = requestAnimationFrame(frame);
  };

  const onResize = () => fit();
  const onVisibility = () => {
    if (document.hidden) last = performance.now();
  };
  const reset = () => {
    t = 0;
    wave = 1;
    waveT = 0;
    crued = false;
    emission = 1;
    rateBonus = 1;
    herbierLevel = 0;
    score = 0;
    eaten = 0;
    combo = 0;
    comboT = 0;
    bestCombo = 0;
    stage = 0;
    shake = 0;
    flash = 0;
    deadSay = 0;
    hints.clear();
    fish = [];
    plumes = [];
    parts = [];
    texts = [];
    urchins = [];
    result = null;
    ended = false;
    choosing = false;
    paused = false;
    buildWorld();
    addFish(7);
    reef = reefPercent();
  };

  buildWorld();
  addFish(7);
  window.addEventListener('resize', onResize);
  window.addEventListener('keydown', keyDown);
  window.addEventListener('keyup', keyUp);
  canvas.addEventListener('pointerdown', onPointer);
  canvas.addEventListener('pointermove', onPointer);
  document.addEventListener('visibilitychange', onVisibility);
  last = performance.now();
  raf = requestAnimationFrame(frame);

  return {
    /** Lance (ou relance) une partie. À appeler depuis un clic : le son en a besoin. */
    start() {
      if (!audio) {
        try {
          audio = new AudioContext();
        } catch {
          audio = null;
        }
      }
      void audio?.resume();
      reset();
      playing = true;
      cb.onHud(reef, 0, 1, 0, false);
      cb.onBanner('Guide ton banc de poissons sur les algues vertes : mange-les avant qu’elles étouffent le corail !');
    },
    /** Carte choisie entre deux vagues. */
    choose(card: CardId) {
      apply(card);
      choosing = false;
      combo = 0;
      comboT = 0;
      wave++;
      waveT = 0;
      crued = false;
      last = performance.now();
    },
    setPaused(value: boolean) {
      paused = value;
      last = performance.now();
    },
    setMuted(value: boolean) {
      muted = value;
    },
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
      canvas.removeEventListener('pointerdown', onPointer);
      canvas.removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', onVisibility);
      void audio?.close();
    },
    /** Réservé aux tests (console de développement : __ravine). */
    debug: {
      setAutopilot: (v: boolean) => (autopilot = v),
      /** Fait avancer la partie de n secondes ; choisit la 1re carte proposée si besoin. */
      simulate: (seconds: number, pick?: CardId) => {
        const steps = Math.round(seconds * 60);
        for (let k = 0; k < steps && !ended; k++) {
          if (choosing) {
            const cards = drawCards();
            apply(pick && cards.includes(pick) ? pick : cards[0]);
            choosing = false;
            wave++;
            waveT = 0;
            crued = false;
          }
          update(1 / 60);
        }
        return { t: Math.round(t), wave, reef: Math.round(reefPercent()), score, eaten, stage, fish: fish.length, ended, result };
      },
      state: () => ({ t, wave, waveT, reef: reefPercent(), score, eaten, stage, combo, bestCombo, plumes: plumes.length, ended, choosing, result, W, H, cols, rows }),
    },
  };
}

export type RavineEngine = ReturnType<typeof createRavineEngine>;
