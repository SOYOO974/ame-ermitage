// Moteur du mini-jeu « La Traversée de la Tortue » : canvas 2D, zéro dépendance.
// Tout est dessiné à la main (pas d'image) pour rester net sur vidéoprojecteur comme sur téléphone.
//
// Repères scientifiques (Kélonia, Ifremer, Direction de la mer Sud océan Indien) :
//  - la tortue verte respire de l'air : apnées de quelques minutes quand elle nage ;
//  - à La Réunion elle broute des algues rouges et les herbiers du lagon ;
//  - dangers : collisions avec les bateaux rapides, pêche accidentelle, plastique avalé.

export interface TurtleResult {
  won: boolean;
  stars: number;
  energy: number;
  food: number;
  trash: number;
  hits: number;
  breaths: number;
  /** Ce qui a le plus pesé dans une défaite : sert à choisir le conseil affiché. */
  cause: 'air' | 'dechets' | 'chocs' | 'faim' | null;
}

export interface EngineCallbacks {
  onHud: (energy: number, oxygen: number, progress: number) => void;
  onBanner: (text: string) => void;
  onEnd: (result: TurtleResult) => void;
}

type Kind = 'algue' | 'herbe' | 'meduse' | 'sac' | 'bouteille' | 'bateau' | 'hamecon' | 'filet';

interface Ent {
  kind: Kind;
  x: number;
  y: number;
  seed: number;
  /** Vitesse propre vers la gauche, en plus du défilement. */
  vx: number;
  depth: number;
  taken: boolean;
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
  bubble: boolean;
}

interface FloatText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

const TAU = Math.PI * 2;
/** Durée de la traversée, en secondes. */
const DURATION = 75;
const SURF = 110;
const FONT = 'Fredoka, "Plus Jakarta Sans", sans-serif';

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const mod = (v: number, m: number) => ((v % m) + m) % m;

const ZONES: { from: number; text: string }[] = [
  { from: 0, text: 'Le récif : mange les algues rouges et l’herbier au fond' },
  { from: 0.2, text: 'Attention aux déchets : ne les avale pas !' },
  { from: 0.48, text: 'Le chenal : bateaux et lignes de pêche en surface' },
  { from: 0.78, text: 'Dernier effort avant l’herbier !' },
  { from: 0.945, text: 'L’herbier de l’Ermitage est en vue !' },
];

export function createTurtleEngine(canvas: HTMLCanvasElement, cb: EngineCallbacks) {
  const ctx = canvas.getContext('2d')!;
  let W = 960;
  let H = 600;
  let scale = 1;
  let dpr = 1;
  let FLOOR = 536;
  let speed = 190;

  let raf = 0;
  let last = 0;
  let playing = false;
  let paused = false;
  let ended = false;
  let endTimer = 0;
  let muted = false;
  let audio: AudioContext | null = null;

  // « clock » anime le décor même à l'arrêt ; « t » est le temps de jeu.
  let clock = 0;
  let t = 0;
  let cam = 0;
  let energy = 70;
  let oxygen = 100;
  const turtle = { x: 200, y: 300, vy: 0, target: 300, flap: 0, inv: 0, breathing: false, chomp: 0 };
  let ents: Ent[] = [];
  let parts: Part[] = [];
  let texts: FloatText[] = [];
  let nextFloor = 0;
  let nextMid = 0;
  let nextSurf = 0;
  let nextBubble = 0;
  let shake = 0;
  let flash = 0;
  let flashColor = '255,80,60';
  let zone = -1;
  let o2Hint = false;
  let bagHint = false;
  let starved = 0;
  const stats = { food: 0, trash: 0, hits: 0, breaths: 0 };
  const keys = { up: false, down: false };

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
    eat: () => {
      beep(520, 880, 0.13, 'sine', 0.16);
      beep(780, 1180, 0.1, 'sine', 0.1, 0.07);
    },
    bad: () => beep(240, 80, 0.3, 'sawtooth', 0.12),
    hit: () => {
      beep(160, 50, 0.28, 'square', 0.14);
      beep(90, 40, 0.3, 'sawtooth', 0.1, 0.03);
    },
    breathe: () => beep(320, 640, 0.25, 'triangle', 0.08),
    alarm: () => beep(660, 660, 0.09, 'square', 0.05),
    win: () => [523, 659, 784, 1047].forEach((f, i) => beep(f, f, 0.22, 'triangle', 0.14, i * 0.13)),
    lose: () => [392, 330, 262].forEach((f, i) => beep(f, f * 0.97, 0.3, 'triangle', 0.12, i * 0.2)),
  };

  // --------------------------------------------------------------- layout
  const resize = () => {
    const cw = canvas.clientWidth || 960;
    const ch = canvas.clientHeight || 600;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    // Hauteur logique de 600 ; en portrait on garde au moins 340 de large (la colonne d'eau s'allonge).
    scale = Math.min(ch / 600, cw / 340);
    W = cw / scale;
    H = ch / scale;
    FLOOR = H - 64;
    speed = clamp(W * 0.22, 115, 210);
    turtle.x = Math.max(84, W * 0.26);
  };

  const pointerY = (clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    turtle.target = (clientY - rect.top) / scale;
  };
  const onPointer = (e: PointerEvent) => {
    if (playing && !paused) pointerY(e.clientY);
  };
  const onKey = (down: boolean) => (e: KeyboardEvent) => {
    if (e.key === 'ArrowUp' || e.key === 'z' || e.key === 'w') keys.up = down;
    else if (e.key === 'ArrowDown' || e.key === 's') keys.down = down;
    else return;
    if (playing) e.preventDefault();
  };
  const keyDown = onKey(true);
  const keyUp = onKey(false);

  // ------------------------------------------------------------ gameplay
  const say = (text: string, color: string, x = turtle.x + 20, y = turtle.y - 46) => {
    texts.push({ x: clamp(x, 110, W - 110), y: Math.max(SURF + 30, y), text, color, life: 1.7 });
  };
  const burst = (x: number, y: number, color: string, n: number) => {
    for (let i = 0; i < n; i++) {
      const a = rand(0, TAU);
      const v = rand(40, 170);
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0, max: rand(0.35, 0.7), r: rand(2, 4.5), color, bubble: false });
    }
  };
  const bubbles = (x: number, y: number, n: number) => {
    for (let i = 0; i < n; i++) parts.push({ x: x + rand(-6, 6), y: y + rand(-4, 4), vx: rand(-22, 4), vy: rand(-70, -35), life: 0, max: 4, r: rand(1.6, 4.2), color: '', bubble: true });
  };

  const spawn = (kind: Kind, y: number, extra: Partial<Ent> = {}) => {
    ents.push({ kind, x: W + 90, y, seed: rand(0, 100), vx: 0, depth: 0, taken: false, ...extra });
  };

  const spawner = (p: number) => {
    if (p > 0.94) return;
    const late = p > 0.78 ? 0.8 : 1;
    if (t >= nextFloor) {
      spawn(Math.random() < 0.58 ? 'algue' : 'herbe', FLOOR - 4);
      nextFloor = t + rand(1.5, 2.6);
    }
    if (p >= 0.2 && t >= nextMid) {
      const roll = Math.random();
      const netOk = p >= 0.55;
      if (netOk && roll < 0.13) spawn('filet', rand(SURF + 150, FLOOR - 150));
      else if (roll < 0.5) spawn('meduse', rand(SURF + 80, FLOOR - 120));
      else if (roll < 0.84) {
        spawn('sac', rand(SURF + 80, FLOOR - 120));
        if (!bagHint) {
          bagHint = true;
          cb.onBanner('Méduse ou sac plastique ? Regarde bien les poignées !');
        }
      } else spawn('bouteille', rand(SURF + 40, SURF + 150));
      nextMid = t + rand(1.7, 2.7) * late;
    }
    if (p >= 0.48 && t >= nextSurf) {
      if (Math.random() < 0.6) {
        // Le bateau arrive de loin : 1,6 s d'avertissement avant qu'il n'entre à l'écran.
        const vx = 110;
        spawn('bateau', SURF, { vx, x: W + 110 + (speed + vx) * 1.6 });
      } else spawn('hamecon', SURF, { depth: rand(110, (FLOOR - SURF) * 0.55) });
      nextSurf = t + rand(4.4, 6.4) * late;
    }
  };

  const hurt = (amount: number, text: string) => {
    energy -= amount;
    stats.hits++;
    turtle.inv = 1.5;
    shake = 0.45;
    flash = 0.5;
    flashColor = '255,80,60';
    say(text, '#ffb4a6');
    burst(turtle.x, turtle.y, '#ffffff', 14);
    sfx.hit();
  };

  const collide = () => {
    const tx = turtle.x + 14;
    const ty = turtle.y;
    for (const e of ents) {
      if (e.taken) continue;
      const bob = e.kind === 'meduse' || e.kind === 'sac' || e.kind === 'bouteille' || e.kind === 'filet' ? Math.sin(clock * 1.5 + e.seed) * 8 : 0;
      const dx = e.x - tx;
      const dy = e.y + bob - ty;
      switch (e.kind) {
        case 'algue':
        case 'herbe':
          if (Math.abs(dx) < 46 && dy < 62 && dy > -20) eat(e, 7, e.kind === 'algue' ? 'Miam ! Algue rouge' : 'Miam ! Herbier', e.kind === 'algue' ? '#ff8fa6' : '#9af0a8', e.x, e.y - 30);
          break;
        case 'meduse':
          if (Math.hypot(dx, dy) < 48) eat(e, 6, 'Miam ! Méduse', '#f7c1ff', e.x, e.y + bob);
          break;
        case 'sac':
        case 'bouteille':
          if (Math.hypot(dx, dy) < 46) {
            e.taken = true;
            energy -= e.kind === 'sac' ? 14 : 12;
            stats.trash++;
            turtle.chomp = 0.3;
            shake = 0.3;
            flash = 0.4;
            flashColor = '150,110,60';
            say(e.kind === 'sac' ? 'Beurk ! Un sac plastique, pas une méduse' : 'Beurk ! Une bouteille en plastique', '#ffd27a');
            burst(e.x, e.y + bob, '#d9d2c2', 10);
            sfx.bad();
          }
          break;
        case 'bateau':
          if (turtle.inv <= 0 && Math.abs(e.x - turtle.x) < 108 && ty < SURF + 46) hurt(26, 'Aïe ! Un bateau trop rapide');
          break;
        case 'hamecon':
          if (turtle.inv <= 0 && ((Math.abs(dx) < 16 && ty < SURF + e.depth - 6) || Math.hypot(dx, SURF + e.depth - ty) < 34)) hurt(18, 'Aïe ! Une ligne de pêche');
          break;
        case 'filet':
          if (turtle.inv <= 0 && Math.abs(dx) < 70 && Math.abs(dy) < 56) hurt(18, 'Aïe ! Un filet abandonné');
          break;
      }
    }
  };

  function eat(e: Ent, gain: number, text: string, color: string, x: number, y: number) {
    e.taken = true;
    energy = Math.min(100, energy + gain);
    stats.food++;
    turtle.chomp = 0.3;
    say(text, color);
    burst(x, y, color, 12);
    sfx.eat();
  }

  const finish = (won: boolean) => {
    if (ended) return;
    ended = true;
    endTimer = won ? 1.1 : 1.4;
    const e = Math.max(0, Math.round(energy));
    const stars = won ? 1 + (e >= 50 ? 1 : 0) + (stats.trash === 0 && stats.hits === 0 ? 1 : 0) : 0;
    const cause = won ? null : starved > 1 ? 'air' : stats.trash >= 3 && stats.trash >= stats.hits ? 'dechets' : stats.hits >= 2 ? 'chocs' : 'faim';
    result = { won, stars, energy: e, cause, ...stats };
    if (won) sfx.win();
    else sfx.lose();
  };
  let result: TurtleResult | null = null;

  const update = (dt: number) => {
    clock += dt;
    cam += speed * dt * (playing ? 1 : 0.45);
    turtle.flap += dt * (5 + Math.abs(turtle.vy) * 0.012);
    turtle.chomp = Math.max(0, turtle.chomp - dt);
    turtle.inv = Math.max(0, turtle.inv - dt);
    shake = Math.max(0, shake - dt);
    flash = Math.max(0, flash - dt);

    if (!playing) {
      // Écran d'accueil : la tortue se promène toute seule.
      turtle.target = (SURF + FLOOR) / 2 + Math.sin(clock * 0.7) * (FLOOR - SURF) * 0.22;
    } else if (ended) {
      turtle.target = result?.won ? FLOOR - 90 : FLOOR - 40;
    } else {
      if (keys.up) turtle.target -= 430 * dt;
      if (keys.down) turtle.target += 430 * dt;
    }
    turtle.target = clamp(turtle.target, SURF - 2, FLOOR - 36);
    const want = clamp((turtle.target - turtle.y) * 7, -470, 470);
    turtle.vy += (want - turtle.vy) * Math.min(1, dt * 10);
    turtle.y = clamp(turtle.y + turtle.vy * dt, SURF - 2, FLOOR - 36);

    if (clock >= nextBubble) {
      bubbles(turtle.x + 52, turtle.y - 8, 1);
      nextBubble = clock + rand(0.35, 0.8);
    }

    if (playing && !ended) {
      t += dt;
      const p = t / DURATION;

      const breathing = turtle.y <= SURF + 16;
      if (breathing) {
        if (!turtle.breathing && oxygen < 75) {
          stats.breaths++;
          say('Aaah, de l’air !', '#c9f6ff', turtle.x + 30, SURF + 60);
          sfx.breathe();
        }
        oxygen = Math.min(100, oxygen + 80 * dt);
      } else {
        if (turtle.breathing) bubbles(turtle.x + 50, turtle.y - 6, 5);
        oxygen = Math.max(0, oxygen - (100 / 18) * dt);
      }
      turtle.breathing = breathing;

      energy -= 2.3 * dt;
      if (oxygen <= 0) {
        energy -= 11 * dt;
        starved += dt;
        if (Math.floor(clock * 3) !== Math.floor((clock - dt) * 3)) sfx.alarm();
      }
      if (oxygen < 45 && !o2Hint) {
        o2Hint = true;
        cb.onBanner('L’oxygène baisse : remonte respirer à la surface !');
      }

      let z = 0;
      for (let i = 0; i < ZONES.length; i++) if (p >= ZONES[i].from) z = i;
      if (z !== zone) {
        zone = z;
        cb.onBanner(ZONES[z].text);
      }

      spawner(p);
      collide();
      cb.onHud(Math.max(0, energy), oxygen, Math.min(1, p));

      if (energy <= 0) finish(false);
      else if (t >= DURATION) finish(true);
    }

    if (ended && endTimer > 0) {
      endTimer -= dt;
      if (endTimer <= 0 && result) cb.onEnd(result);
    }

    const scroll = speed * dt * (playing ? 1 : 0.45);
    for (const e of ents) e.x -= scroll + e.vx * dt;
    ents = ents.filter((e) => e.x > -260);
    for (const q of parts) {
      q.life += dt;
      q.x += q.vx * dt - (q.bubble ? scroll * 0.6 : 0);
      q.y += q.vy * dt;
      if (!q.bubble) {
        q.vx *= 1 - 2.5 * dt;
        q.vy *= 1 - 2.5 * dt;
      } else if (q.y < SURF + 3) q.life = q.max;
    }
    parts = parts.filter((q) => q.life < q.max);
    for (const f of texts) {
      f.life -= dt;
      f.y -= 28 * dt;
    }
    texts = texts.filter((f) => f.life > 0);
  };

  // --------------------------------------------------------------- dessin
  const drawSky = () => {
    const g = ctx.createLinearGradient(0, 0, 0, SURF);
    g.addColorStop(0, '#8fd6f2');
    g.addColorStop(1, '#e4f8fb');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, SURF + 8);
    // Soleil
    const sx = W * 0.8;
    const halo = ctx.createRadialGradient(sx, 34, 4, sx, 34, 90);
    halo.addColorStop(0, 'rgba(255,244,190,0.95)');
    halo.addColorStop(0.25, 'rgba(255,236,160,0.55)');
    halo.addColorStop(1, 'rgba(255,236,160,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(sx - 90, -56, 180, 180);
    // Les hauts de l'île, au loin
    const off = -mod(cam * 0.03, W + 700) + W * 0.9;
    ctx.fillStyle = 'rgba(70,128,128,0.55)';
    ctx.beginPath();
    ctx.moveTo(off - 40, SURF + 6);
    ctx.lineTo(off + 70, SURF - 44);
    ctx.lineTo(off + 130, SURF - 30);
    ctx.lineTo(off + 210, SURF - 78);
    ctx.lineTo(off + 300, SURF - 52);
    ctx.lineTo(off + 360, SURF - 66);
    ctx.lineTo(off + 520, SURF + 6);
    ctx.fill();
    // Nuages
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    for (let i = 0; i < 4; i++) {
      const cx = mod(hash(i + 40) * 1400 - cam * 0.05 - clock * 4, W + 260) - 130;
      const cy = 18 + hash(i + 41) * 38;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 44, 11, 0, 0, TAU);
      ctx.ellipse(cx + 26, cy - 7, 26, 11, 0, 0, TAU);
      ctx.ellipse(cx - 24, cy - 4, 22, 9, 0, 0, TAU);
      ctx.fill();
    }
  };

  const drawWater = () => {
    const g = ctx.createLinearGradient(0, SURF, 0, H);
    g.addColorStop(0, '#3ccdd6');
    g.addColorStop(0.42, '#1596b1');
    g.addColorStop(1, '#06476a');
    ctx.fillStyle = g;
    ctx.fillRect(0, SURF, W, H - SURF);
    // Rayons de soleil
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 7; i++) {
      const x = mod(hash(i + 7) * (W + 300) - cam * 0.12, W + 300) - 150 + Math.sin(clock * 0.4 + i) * 22;
      const w = 30 + hash(i + 8) * 70;
      const ray = ctx.createLinearGradient(0, SURF, 0, FLOOR);
      ray.addColorStop(0, 'rgba(255,255,255,0.16)');
      ray.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = ray;
      ctx.beginPath();
      ctx.moveTo(x, SURF);
      ctx.lineTo(x + w, SURF);
      ctx.lineTo(x + w - 150, FLOOR);
      ctx.lineTo(x - 190, FLOOR);
      ctx.fill();
    }
    ctx.restore();
  };

  /** Massifs coralliens en ombre chinoise, loin derrière. */
  const drawFarReef = () => {
    const step = 150;
    const scrollX = cam * 0.3;
    const first = Math.floor(scrollX / step) - 1;
    ctx.fillStyle = 'rgba(5,62,92,0.5)';
    for (let i = first; i < first + W / step + 3; i++) {
      const x = i * step - scrollX;
      const h = 50 + hash(i) * 150;
      const w = 110 + hash(i + 0.5) * 120;
      ctx.beginPath();
      ctx.moveTo(x - w / 2, FLOOR + 8);
      ctx.bezierCurveTo(x - w / 2, FLOOR - h, x - w * 0.1, FLOOR - h * 1.15, x, FLOOR - h * 0.8);
      ctx.bezierCurveTo(x + w * 0.2, FLOOR - h * 1.3, x + w / 2, FLOOR - h * 0.6, x + w / 2, FLOOR + 8);
      ctx.fill();
    }
  };

  const drawFish = () => {
    for (let i = 0; i < 9; i++) {
      const lane = hash(i + 60);
      const x = mod(hash(i + 61) * 2000 - cam * (0.32 + lane * 0.2) - clock * (14 + lane * 20), W + 200) - 100;
      const y = SURF + 70 + hash(i + 62) * (FLOOR - SURF - 190) + Math.sin(clock * 1.3 + i) * 7;
      const s = 0.6 + hash(i + 63) * 0.7;
      ctx.fillStyle = i % 3 === 0 ? 'rgba(255,214,110,0.55)' : i % 3 === 1 ? 'rgba(150,225,255,0.5)' : 'rgba(255,150,120,0.5)';
      ctx.beginPath();
      ctx.ellipse(x, y, 11 * s, 5 * s, 0, 0, TAU);
      ctx.moveTo(x + 9 * s, y);
      ctx.lineTo(x + 18 * s, y - 6 * s);
      ctx.lineTo(x + 18 * s, y + 6 * s);
      ctx.fill();
    }
  };

  const CORAL_COLORS = ['#f08a6c', '#e9b24c', '#c77bc9', '#f2a3b5', '#63c7b2'];

  const drawCoral = (x: number, base: number, i: number, size: number) => {
    // En arrière-plan (grande taille), le corail tabulaire se lit mal : on le remplace par un massif.
    const drawn = Math.floor(hash(i + 0.3) * 4);
    const type = size > 1 && drawn === 2 ? 1 : drawn;
    const color = CORAL_COLORS[Math.floor(hash(i + 0.7) * CORAL_COLORS.length)];
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    if (type === 0) {
      // Corail branchu (Acropora)
      ctx.lineWidth = 7 * size;
      for (let b = -2; b <= 2; b++) {
        const lean = b * 0.32 + (hash(i + b) - 0.5) * 0.2;
        const len = (36 + hash(i + b * 3) * 26) * size;
        const mx = x + Math.sin(lean) * len * 0.55;
        const my = base - Math.cos(lean) * len * 0.55;
        ctx.beginPath();
        ctx.moveTo(x + b * 4 * size, base);
        ctx.lineTo(mx, my);
        ctx.lineTo(mx + Math.sin(lean + 0.5) * len * 0.5, my - Math.cos(lean + 0.5) * len * 0.5);
        ctx.moveTo(mx, my);
        ctx.lineTo(mx + Math.sin(lean - 0.5) * len * 0.45, my - Math.cos(lean - 0.5) * len * 0.45);
        ctx.stroke();
      }
    } else if (type === 1) {
      // Corail massif (Porites)
      const r = 34 * size;
      ctx.beginPath();
      ctx.ellipse(x, base, r * 1.25, r, 0, Math.PI, TAU);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.28)';
      ctx.lineWidth = 2;
      for (let k = 1; k <= 3; k++) {
        ctx.beginPath();
        ctx.ellipse(x, base, r * 1.25 * (k / 4), r * (k / 4), 0, Math.PI * 1.08, TAU * 0.96);
        ctx.stroke();
      }
    } else if (type === 2) {
      // Corail tabulaire
      ctx.lineWidth = 9 * size;
      ctx.beginPath();
      ctx.moveTo(x, base);
      ctx.lineTo(x, base - 34 * size);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(x, base - 38 * size, 44 * size, 9 * size, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.beginPath();
      ctx.ellipse(x, base - 41 * size, 34 * size, 4 * size, 0, 0, TAU);
      ctx.fill();
    } else {
      // Rocher
      ctx.fillStyle = '#6f7f86';
      ctx.beginPath();
      ctx.ellipse(x, base, 30 * size, 20 * size, 0, Math.PI, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.ellipse(x - 8 * size, base - 9 * size, 12 * size, 6 * size, -0.3, 0, TAU);
      ctx.fill();
    }
  };

  const drawMidReef = () => {
    const step = 210;
    const scrollX = cam * 0.6;
    const first = Math.floor(scrollX / step) - 1;
    ctx.save();
    ctx.globalAlpha = 0.5;
    for (let i = first; i < first + W / step + 3; i++) {
      if (hash(i + 5) < 0.25) continue;
      drawCoral(i * step - scrollX + hash(i + 1) * 90, FLOOR + 4, i + 200, 1.15 + hash(i + 2) * 0.5);
    }
    ctx.restore();
    // Voile bleuté : ce plan est plus loin que le fond de jeu.
    ctx.fillStyle = 'rgba(10,110,145,0.22)';
    ctx.fillRect(0, FLOOR - 130, W, 140);
  };

  const floorY = (x: number) => FLOOR + Math.sin((x + cam) * 0.011) * 5 + Math.sin((x + cam) * 0.027) * 2.5;

  const drawFloor = () => {
    const g = ctx.createLinearGradient(0, FLOOR - 8, 0, H);
    g.addColorStop(0, '#f0e0b0');
    g.addColorStop(1, '#bfa468');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W + 12; x += 12) ctx.lineTo(x, floorY(x));
    ctx.lineTo(W, H);
    ctx.fill();
    // Rides de sable et petits cailloux
    const step = 70;
    const first = Math.floor(cam / step) - 1;
    for (let i = first; i < first + W / step + 3; i++) {
      const x = i * step - cam + hash(i + 11) * 50;
      const y = FLOOR + 16 + hash(i + 12) * 36;
      ctx.strokeStyle = 'rgba(150,120,60,0.28)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + 14, y - 4, x + 30, y);
      ctx.stroke();
      if (hash(i + 13) > 0.6) {
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.beginPath();
        ctx.ellipse(x + 40, y + 6, 4, 2.6, 0.4, 0, TAU);
        ctx.fill();
      }
    }
    // Coraux du premier plan (décor, sans collision)
    const cstep = 330;
    const cfirst = Math.floor(cam / cstep) - 1;
    for (let i = cfirst; i < cfirst + W / cstep + 3; i++) {
      if (hash(i + 21) < 0.35) continue;
      const x = i * cstep - cam + hash(i + 22) * 160;
      drawCoral(x, floorY(x) + 6, i + 500, 0.62 + hash(i + 23) * 0.3);
    }
  };

  const drawBlades = (x: number, base: number, n: number, height: number, seed: number, colors: [string, string], width: number, cut: boolean) => {
    ctx.lineCap = 'round';
    for (let k = 0; k < n; k++) {
      const h = (cut ? 0.22 : 1) * height * (0.65 + hash(seed + k) * 0.5);
      const bx = x + (k - (n - 1) / 2) * (width * 1.5);
      const sway = Math.sin(clock * 1.8 + seed + k * 0.7) * h * 0.22;
      ctx.strokeStyle = colors[k % 2];
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(bx, base);
      ctx.quadraticCurveTo(bx + sway * 0.3, base - h * 0.6, bx + sway, base - h);
      ctx.stroke();
    }
  };

  /** Arrivée : la grande prairie sous-marine de l'Ermitage entre par la droite. */
  const drawMeadow = () => {
    const since = t - DURATION * 0.945;
    if (since <= 0) return;
    const start = Math.max(-20, W - since * speed);
    for (let x = start; x < W + 20; x += 15) {
      const wx = Math.round((x + cam) / 15);
      drawBlades(x, floorY(x) + 4, 3, 62, wx * 3.1, ['#57b86b', '#3a9957'], 4, false);
    }
  };

  const drawEnt = (e: Ent) => {
    const bob = Math.sin(clock * 1.5 + e.seed) * 8;
    switch (e.kind) {
      case 'algue': {
        const base = floorY(e.x) + 2;
        ctx.fillStyle = '#5d6b72';
        ctx.beginPath();
        ctx.ellipse(e.x, base + 2, 30, 13, 0, Math.PI, TAU);
        ctx.fill();
        drawBlades(e.x, base - 8, 7, 54, e.seed, ['#e2476a', '#b92a4f'], 5.5, e.taken);
        break;
      }
      case 'herbe':
        drawBlades(e.x, floorY(e.x) + 3, 10, 58, e.seed, ['#63c777', '#3e9f5a'], 4, e.taken);
        break;
      case 'meduse': {
        if (e.taken) return;
        const y = e.y + bob;
        const pulse = 1 + Math.sin(clock * 3 + e.seed) * 0.1;
        const glow = ctx.createRadialGradient(e.x, y, 2, e.x, y, 42);
        glow.addColorStop(0, 'rgba(255,200,245,0.35)');
        glow.addColorStop(1, 'rgba(255,200,245,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(e.x - 42, y - 42, 84, 84);
        ctx.strokeStyle = 'rgba(244,190,250,0.8)';
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        for (let k = -2; k <= 2; k++) {
          ctx.beginPath();
          ctx.moveTo(e.x + k * 7, y + 2);
          const s = Math.sin(clock * 3 + e.seed + k) * 5;
          ctx.bezierCurveTo(e.x + k * 7 + s, y + 14, e.x + k * 7 - s, y + 24, e.x + k * 8 + s, y + 34 - Math.abs(k) * 3);
          ctx.stroke();
        }
        const bell = ctx.createLinearGradient(0, y - 20, 0, y + 4);
        bell.addColorStop(0, 'rgba(255,225,250,0.95)');
        bell.addColorStop(1, 'rgba(214,140,232,0.72)');
        ctx.fillStyle = bell;
        ctx.beginPath();
        ctx.ellipse(e.x, y + 2, 22 * pulse, 21 / pulse, 0, Math.PI, TAU);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.beginPath();
        ctx.ellipse(e.x - 7, y - 9, 6, 3.5, -0.5, 0, TAU);
        ctx.fill();
        break;
      }
      case 'sac': {
        if (e.taken) return;
        const y = e.y + bob;
        ctx.save();
        ctx.translate(e.x, y);
        ctx.rotate(Math.sin(clock * 1.1 + e.seed) * 0.18);
        ctx.strokeStyle = 'rgba(245,250,255,0.9)';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        // Les deux poignées : le détail qui trahit le sac.
        ctx.beginPath();
        ctx.moveTo(-15, -14);
        ctx.quadraticCurveTo(-13, -32, -5, -15);
        ctx.moveTo(15, -14);
        ctx.quadraticCurveTo(13, -32, 5, -15);
        ctx.stroke();
        const body = ctx.createLinearGradient(-20, 0, 20, 0);
        body.addColorStop(0, 'rgba(255,255,255,0.88)');
        body.addColorStop(0.5, 'rgba(214,232,244,0.7)');
        body.addColorStop(1, 'rgba(255,255,255,0.84)');
        ctx.fillStyle = body;
        const w = Math.sin(clock * 2.4 + e.seed) * 3;
        ctx.beginPath();
        ctx.moveTo(-19, -15);
        ctx.lineTo(19, -15);
        ctx.quadraticCurveTo(24 + w, 4, 18, 20);
        ctx.quadraticCurveTo(9, 26 + w, 0, 20);
        ctx.quadraticCurveTo(-9, 15 - w, -18, 21);
        ctx.quadraticCurveTo(-24 - w, 4, -19, -15);
        ctx.fill();
        ctx.strokeStyle = 'rgba(120,150,175,0.45)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(-8, -12);
        ctx.lineTo(-4, 14);
        ctx.moveTo(7, -12);
        ctx.lineTo(10, 12);
        ctx.stroke();
        ctx.restore();
        break;
      }
      case 'bouteille': {
        if (e.taken) return;
        ctx.save();
        ctx.translate(e.x, e.y + bob);
        ctx.rotate(0.6 + Math.sin(clock * 0.9 + e.seed) * 0.25);
        ctx.fillStyle = 'rgba(176,226,255,0.72)';
        ctx.beginPath();
        ctx.roundRect(-9, -14, 18, 36, 5);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-8, -13);
        ctx.lineTo(-4, -23);
        ctx.lineTo(4, -23);
        ctx.lineTo(8, -13);
        ctx.fill();
        ctx.fillStyle = '#e8503a';
        ctx.fillRect(-4.5, -28, 9, 6);
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fillRect(-9, -2, 18, 11);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillRect(-6, -12, 2.5, 30);
        ctx.restore();
        break;
      }
      case 'filet': {
        ctx.save();
        ctx.translate(e.x, e.y + bob);
        ctx.rotate(Math.sin(clock * 0.8 + e.seed) * 0.08);
        ctx.beginPath();
        ctx.moveTo(-62, -44);
        ctx.quadraticCurveTo(0, -56, 62, -44);
        ctx.quadraticCurveTo(72, 4, 50, 50);
        ctx.quadraticCurveTo(0, 38, -52, 52);
        ctx.quadraticCurveTo(-74, 2, -62, -44);
        ctx.fillStyle = 'rgba(30,70,60,0.2)';
        ctx.fill();
        ctx.save();
        ctx.clip();
        ctx.strokeStyle = 'rgba(214,232,190,0.75)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let k = -160; k <= 160; k += 15) {
          ctx.moveTo(k, -60);
          ctx.lineTo(k + 110, 60);
          ctx.moveTo(k, -60);
          ctx.lineTo(k - 110, 60);
        }
        ctx.stroke();
        ctx.restore();
        ctx.strokeStyle = 'rgba(214,232,190,0.9)';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = '#f39a3d';
        for (const fx of [-46, 0, 46]) {
          ctx.beginPath();
          ctx.ellipse(fx, -49 - (fx === 0 ? 4 : 0), 8, 5.5, 0, 0, TAU);
          ctx.fill();
        }
        ctx.restore();
        break;
      }
      case 'hamecon': {
        const hy = SURF + e.depth;
        ctx.strokeStyle = 'rgba(255,255,255,0.75)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(e.x, SURF);
        ctx.lineTo(e.x, hy - 16);
        ctx.stroke();
        ctx.strokeStyle = '#e3e8ec';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(e.x, hy - 18);
        ctx.lineTo(e.x, hy);
        ctx.arc(e.x - 11, hy, 11, 0, Math.PI * 0.95);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.x - 22, hy + 2);
        ctx.lineTo(e.x - 15, hy - 5);
        ctx.stroke();
        // Bouchon en surface
        const fy = SURF + Math.sin(clock * 2.4 + e.seed) * 3;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(e.x, fy, 8, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#e8503a';
        ctx.beginPath();
        ctx.arc(e.x, fy, 8, Math.PI, TAU);
        ctx.fill();
        break;
      }
      case 'bateau': {
        const y = SURF + Math.sin(clock * 3 + e.seed) * 2;
        // Sillage de bulles derrière l'hélice
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        for (let k = 0; k < 14; k++) {
          const bx = e.x + 100 + k * 22 + hash(k + Math.floor(clock * 12)) * 14;
          ctx.beginPath();
          ctx.arc(bx, y + 30 + (hash(k * 3 + Math.floor(clock * 12)) - 0.5) * (14 + k * 2.5), 4.5 - k * 0.22, 0, TAU);
          ctx.fill();
        }
        // Coque sous l'eau
        ctx.fillStyle = '#9c3327';
        ctx.beginPath();
        ctx.moveTo(e.x - 100, y);
        ctx.quadraticCurveTo(-74 + e.x, y + 30, e.x - 40, y + 30);
        ctx.lineTo(e.x + 78, y + 26);
        ctx.lineTo(e.x + 92, y);
        ctx.fill();
        // Coque hors de l'eau
        ctx.fillStyle = '#f7f9fa';
        ctx.beginPath();
        ctx.moveTo(e.x - 116, y - 24);
        ctx.lineTo(e.x + 96, y - 24);
        ctx.lineTo(e.x + 92, y);
        ctx.lineTo(e.x - 100, y);
        ctx.fill();
        ctx.fillStyle = '#19b8c4';
        ctx.fillRect(e.x - 108, y - 13, 202, 5);
        // Cabine
        ctx.fillStyle = '#eef3f5';
        ctx.beginPath();
        ctx.roundRect(e.x - 10, y - 52, 70, 30, 6);
        ctx.fill();
        ctx.fillStyle = '#06415c';
        ctx.beginPath();
        ctx.roundRect(e.x - 3, y - 46, 30, 15, 3);
        ctx.fill();
        // Hélice
        ctx.fillStyle = '#3a3f44';
        ctx.fillRect(e.x + 74, y + 24, 14, 6);
        ctx.fillStyle = 'rgba(40,45,50,0.75)';
        ctx.beginPath();
        ctx.ellipse(e.x + 92, y + 27, 3.5, 15 * Math.abs(Math.sin(clock * 30)) + 3, 0, 0, TAU);
        ctx.fill();
        break;
      }
    }
  };

  /** Bateau encore hors champ : panneau d'alerte au bord droit de la surface. */
  const drawBoatWarning = () => {
    for (const e of ents) {
      if (e.kind !== 'bateau' || e.x - 116 < W) continue;
      const pulse = 0.75 + Math.sin(clock * 12) * 0.25;
      const x = W - 46;
      const y = SURF + 38;
      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.fillStyle = '#f2674a';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(x, y - 24);
      ctx.lineTo(x + 26, y + 20);
      ctx.lineTo(x - 26, y + 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = `700 26px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', x, y + 5);
      ctx.restore();
      ctx.font = `600 17px ${FONT}`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(6,50,74,0.85)';
      ctx.strokeText('Bateau !', x - 34, y + 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Bateau !', x - 34, y + 4);
      return;
    }
  };

  const flipper = (px: number, py: number, angle: number, len: number, color: string) => {
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(angle);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-2, -7);
    ctx.quadraticCurveTo(len * 0.55, -13, len, 3);
    ctx.quadraticCurveTo(len * 0.5, 11, -2, 7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const drawTurtle = () => {
    const { x, y } = turtle;
    if (turtle.inv > 0 && Math.floor(clock * 14) % 2 === 0) return;
    const tilt = clamp(turtle.vy / 520, -0.55, 0.55);
    const stroke = Math.sin(turtle.flap);
    const SKIN = '#86b46c';
    const SKIN_DARK = '#5f9150';
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt);

    // Nageoires du côté opposé (plus sombres)
    flipper(16, 6, 1.75 + stroke * 0.7, 50, SKIN_DARK);
    flipper(-34, 8, 2.5 + stroke * 0.25, 24, SKIN_DARK);
    // Queue
    ctx.fillStyle = SKIN;
    ctx.beginPath();
    ctx.moveTo(-42, 2);
    ctx.lineTo(-58, 8);
    ctx.lineTo(-42, 10);
    ctx.fill();
    // Cou et tête
    ctx.fillStyle = SKIN;
    ctx.beginPath();
    ctx.ellipse(40, -1, 16, 10, -0.15, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(57, -6, 16, 12.5, -0.1, 0, TAU);
    ctx.fill();
    // Taches de la tête
    ctx.fillStyle = SKIN_DARK;
    for (const [sx, sy, sr] of [[52, -13, 3.2], [60, -15, 2.6], [47, -6, 2.4], [55, -1, 2]] as const) {
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, TAU);
      ctx.fill();
    }
    // Bec
    ctx.strokeStyle = '#3c6a36';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (turtle.chomp > 0) {
      ctx.fillStyle = '#3c2a2a';
      ctx.ellipse(68, -1, 4.5, 5, 0, 0, TAU);
      ctx.fill();
    } else {
      ctx.arc(64, -5, 8, 0.25, 1.25);
      ctx.stroke();
    }
    // Œil
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(61, -10, 5.2, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#12303a';
    ctx.beginPath();
    ctx.arc(62.4, -10, 3, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(63.4, -11.2, 1.1, 0, TAU);
    ctx.fill();

    // Plastron (ventre clair)
    ctx.fillStyle = '#f0e6b4';
    ctx.beginPath();
    ctx.moveTo(-44, 3);
    ctx.quadraticCurveTo(0, 30, 42, 3);
    ctx.closePath();
    ctx.fill();

    // Carapace
    const shell = () => {
      ctx.beginPath();
      ctx.moveTo(-48, 6);
      ctx.bezierCurveTo(-44, -36, 26, -44, 46, 4);
      ctx.quadraticCurveTo(0, 15, -48, 6);
      ctx.closePath();
    };
    const sg = ctx.createLinearGradient(0, -38, 0, 12);
    sg.addColorStop(0, '#8a9a45');
    sg.addColorStop(0.55, '#5d7f3c');
    sg.addColorStop(1, '#3c5f33');
    ctx.fillStyle = sg;
    shell();
    ctx.fill();
    ctx.save();
    shell();
    ctx.clip();
    // Écailles
    ctx.strokeStyle = 'rgba(38,66,36,0.75)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-50, -6);
    ctx.quadraticCurveTo(0, -22, 48, -4);
    for (const sx of [-26, -6, 14, 32]) {
      ctx.moveTo(sx, -40);
      ctx.lineTo(sx + 4, -13);
      ctx.moveTo(sx + 10, -11);
      ctx.lineTo(sx + 8, 14);
    }
    ctx.stroke();
    // Reflet
    ctx.fillStyle = 'rgba(255,255,220,0.2)';
    ctx.beginPath();
    ctx.ellipse(-6, -30, 30, 7, -0.08, 0, TAU);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = '#2f5230';
    ctx.lineWidth = 2.5;
    shell();
    ctx.stroke();

    // Nageoires du côté visible
    flipper(-30, 9, 2.35 + stroke * 0.3, 26, SKIN);
    flipper(20, 8, 1.6 + Math.sin(turtle.flap + 0.35) * 0.75, 54, SKIN);
    ctx.restore();
  };

  const drawSurface = (front: boolean) => {
    const amp = 3.5;
    const wave = (x: number) => SURF + Math.sin(x * 0.022 + clock * 2.1) * amp + Math.sin(x * 0.051 - clock * 1.3) * 1.5;
    if (!front) {
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let x = 0; x <= W + 10; x += 10) ctx.lineTo(x, wave(x));
      ctx.stroke();
      return;
    }
    // Petite vague au premier plan : la tortue passe « dans » l'eau.
    ctx.fillStyle = 'rgba(60,205,214,0.5)';
    ctx.beginPath();
    ctx.moveTo(0, SURF + 16);
    for (let x = 0; x <= W + 10; x += 10) ctx.lineTo(x, wave(x + 60) + 5);
    ctx.lineTo(W, SURF + 16);
    ctx.fill();
  };

  const drawOverlays = () => {
    for (const q of parts) {
      const k = 1 - q.life / q.max;
      if (q.bubble) {
        ctx.strokeStyle = 'rgba(255,255,255,0.75)';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.arc(q.x + Math.sin(q.life * 5 + q.r) * 3, q.y, q.r, 0, TAU);
        ctx.stroke();
      } else {
        ctx.globalAlpha = k;
        ctx.fillStyle = q.color;
        ctx.beginPath();
        ctx.arc(q.x, q.y, q.r * (0.5 + k), 0, TAU);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    for (const f of texts) {
      ctx.globalAlpha = Math.min(1, f.life * 2.2);
      ctx.font = `600 21px ${FONT}`;
      ctx.lineWidth = 5;
      ctx.strokeStyle = 'rgba(6,50,74,0.9)';
      ctx.strokeText(f.text, f.x, f.y);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
  };

  const drawPlankton = () => {
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    for (let i = 0; i < 46; i++) {
      const x = mod(hash(i + 80) * 1800 - cam * (0.5 + hash(i + 81) * 0.6), W + 20) - 10;
      const y = SURF + 20 + hash(i + 82) * (FLOOR - SURF - 30) + Math.sin(clock * 0.8 + i) * 8;
      ctx.beginPath();
      ctx.arc(x, y, 0.8 + hash(i + 83) * 1.4, 0, TAU);
      ctx.fill();
    }
  };

  const render = () => {
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    ctx.save();
    if (shake > 0) ctx.translate(rand(-1, 1) * shake * 16, rand(-1, 1) * shake * 16);
    drawSky();
    drawWater();
    drawFarReef();
    drawFish();
    drawMidReef();
    drawFloor();
    drawMeadow();
    drawPlankton();
    for (const e of ents) if (e.kind === 'algue' || e.kind === 'herbe') drawEnt(e);
    for (const e of ents) if (e.kind !== 'algue' && e.kind !== 'herbe' && e.kind !== 'bateau') drawEnt(e);
    drawSurface(false);
    drawTurtle();
    for (const e of ents) if (e.kind === 'bateau') drawEnt(e);
    drawSurface(true);
    drawOverlays();
    drawBoatWarning();
    ctx.restore();

    // Manque d'air : l'écran s'assombrit par les bords.
    if (playing && !ended && oxygen < 30) {
      const a = (1 - oxygen / 30) * (0.5 + Math.sin(clock * 6) * 0.12);
      const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75);
      v.addColorStop(0, 'rgba(8,20,60,0)');
      v.addColorStop(1, `rgba(8,20,60,${a})`);
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, W, H);
    }
    if (flash > 0) {
      ctx.fillStyle = `rgba(${flashColor},${flash * 0.5})`;
      ctx.fillRect(0, 0, W, H);
    }
  };

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    if (!paused) update(dt);
    render();
  };

  const onVisibility = () => {
    if (document.hidden) last = performance.now();
  };

  resize();
  turtle.y = turtle.target = (SURF + FLOOR) / 2;
  window.addEventListener('resize', resize);
  window.addEventListener('keydown', keyDown);
  window.addEventListener('keyup', keyUp);
  canvas.addEventListener('pointerdown', onPointer);
  canvas.addEventListener('pointermove', onPointer);
  document.addEventListener('visibilitychange', onVisibility);
  last = performance.now();
  raf = requestAnimationFrame(frame);

  return {
    /** Lance (ou relance) une traversée. À appeler depuis un clic : le son en a besoin. */
    start() {
      if (!audio) {
        try {
          audio = new AudioContext();
        } catch {
          audio = null;
        }
      }
      void audio?.resume();
      t = 0;
      energy = 70;
      oxygen = 100;
      ents = [];
      parts = [];
      texts = [];
      nextFloor = 0.6;
      nextMid = 0;
      nextSurf = 0;
      zone = -1;
      o2Hint = false;
      bagHint = false;
      starved = 0;
      stats.food = stats.trash = stats.hits = stats.breaths = 0;
      turtle.inv = 0;
      turtle.breathing = false;
      turtle.target = turtle.y;
      keys.up = keys.down = false;
      result = null;
      ended = false;
      paused = false;
      playing = true;
      cb.onHud(energy, oxygen, 0);
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
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
      canvas.removeEventListener('pointerdown', onPointer);
      canvas.removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', onVisibility);
      void audio?.close();
    },
    /** Réservé aux tests : avance le temps de jeu sans attendre. */
    debug: {
      skipTo: (p: number) => (t = DURATION * p),
      step: (n: number) => {
        for (let i = 0; i < n; i++) update(1 / 60);
      },
      draw: render,
      setTarget: (y: number) => (turtle.target = y),
      state: () => ({ t, energy, oxygen, ents, turtle, stats, W, H, FLOOR, SURF, ended, result }),
    },
  };
}

export type TurtleEngine = ReturnType<typeof createTurtleEngine>;
