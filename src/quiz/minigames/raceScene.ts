// Affichage 3D de « La Grande Course du Lagon » (three.js).
// La course est simulée à plat dans raceEngine.ts : un point (x, y) de la simulation devient (x, hauteur, y) ici.
// Tout le décor est fabriqué par le code (géométries et textures) ; seuls les personnages des cartes
// sont des modèles 3D chargés depuis public/models/pilotes/.

import * as THREE from 'three';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { HW, SHOT_TIME, SPIN_TIME, WORLD, driftStage } from './raceEngine';
import type { Obstacle, Pad, RaceState, Racer, RacerSetup, Shot, Track } from './raceEngine';

const TAU = Math.PI * 2;
const FOG_COLOR = 0x3aa7c6;
const UP = new THREE.Vector3(0, 1, 0);
const CORALS = [0xf6846b, 0xf59ac0, 0xfbd679, 0xb79cf0, 0x7fe0c4, 0xff9d5c];
const FONT = 'Fredoka, "Plus Jakarta Sans", sans-serif';
const MAX_PARTS = 700;

/** Générateur pseudo-aléatoire reproductible : le décor est le même à chaque partie. */
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void, repeat = true) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

// ------------------------------------------------------------------ textures
function makeTextures() {
  const rnd = seeded(7);
  const sand = canvasTexture(512, 512, (g, w, h) => {
    g.fillStyle = '#f0deb0';
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 5200; i++) {
      g.fillStyle = ['#e3cd97', '#f9eecb', '#d8c189', '#fff6dc'][(rnd() * 4) | 0];
      g.globalAlpha = 0.35 + rnd() * 0.4;
      g.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 2.5, 1 + rnd() * 2.5);
    }
    // Rides du sable, en travers de la piste.
    for (let i = 0; i < 16; i++) {
      const y0 = (i + 0.5) * (h / 16);
      const phase = rnd() * TAU;
      for (const [dy, color] of [
        [0, 'rgba(176,146,92,0.42)'],
        [5, 'rgba(255,250,228,0.55)'],
      ] as [number, string][]) {
        g.globalAlpha = 1;
        g.strokeStyle = color;
        g.lineWidth = 4;
        g.beginPath();
        for (let x = 0; x <= w; x += 8) g.lineTo(x, y0 + dy + Math.sin((x / w) * TAU * 2 + phase) * 6 + Math.sin((x / w) * TAU * 5 + phase * 2) * 2);
        g.stroke();
      }
    }
  });
  const kerb = canvasTexture(32, 64, (g, w, h) => {
    g.fillStyle = '#f2674a';
    g.fillRect(0, 0, w, h / 2);
    g.fillStyle = '#fff4e0';
    g.fillRect(0, h / 2, w, h / 2);
  });
  const grass = canvasTexture(256, 256, (g, w, h) => {
    g.fillStyle = '#3aa86c';
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) {
      const x = rnd() * w;
      const y = rnd() * h;
      g.strokeStyle = ['#2c8f57', '#5cc784', '#277a4b', '#49b877'][(rnd() * 4) | 0];
      g.lineWidth = 1.5 + rnd() * 1.5;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + (rnd() - 0.5) * 7, y - 5 - rnd() * 9);
      g.stroke();
    }
  });
  const reef = canvasTexture(512, 512, (g, w, h) => {
    g.fillStyle = '#1e7890';
    g.fillRect(0, 0, w, h);
    const blob = (x: number, y: number, r: number, color: string, alpha: number) => {
      // Dessiné aussi sur les bords opposés pour que la texture se répète sans couture.
      for (const ox of [-w, 0, w]) {
        for (const oy of [-h, 0, h]) {
          const grad = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r);
          grad.addColorStop(0, color);
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          g.globalAlpha = alpha;
          g.fillStyle = grad;
          g.beginPath();
          g.arc(x + ox, y + oy, r, 0, TAU);
          g.fill();
        }
      }
    };
    for (let i = 0; i < 26; i++) blob(rnd() * w, rnd() * h, 40 + rnd() * 70, '#14586c', 0.7);
    for (let i = 0; i < 46; i++) blob(rnd() * w, rnd() * h, 10 + rnd() * 26, ['#e0648f', '#ee8f4f', '#e7c75f', '#9a7fdc', '#5fd3c0'][(rnd() * 5) | 0], 0.85);
    for (let i = 0; i < 20; i++) blob(rnd() * w, rnd() * h, 18 + rnd() * 30, '#d9c9a0', 0.45);
    g.globalAlpha = 1;
  });
  // Reflets du soleil au fond de l'eau (répétable : fréquences entières).
  const caustics = canvasTexture(256, 256, (g, w, h) => {
    const data = g.createImageData(w, h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const u = (x / w) * TAU;
        const v = (y / h) * TAU;
        let c = Math.pow(1 - Math.abs(Math.sin(u * 2 + Math.sin(v * 3) * 1.2)), 5);
        c += Math.pow(1 - Math.abs(Math.sin(v * 2 + Math.sin(u * 2) * 1.3 + 1)), 5);
        c += Math.pow(1 - Math.abs(Math.sin(u + v + Math.sin((u - v) * 2) * 1.1)), 5) * 0.8;
        const val = Math.min(255, c * 150);
        const i = (x + y * w) * 4;
        data.data[i] = val;
        data.data[i + 1] = val;
        data.data[i + 2] = val * 0.92;
        data.data[i + 3] = 255;
      }
    }
    g.putImageData(data, 0, 0);
  });
  const glow = canvasTexture(
    64,
    64,
    (g) => {
      const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.5, 'rgba(255,255,255,0.45)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, 64, 64);
    },
    false,
  );
  const ray = canvasTexture(
    64,
    256,
    (g, w, h) => {
      const v = g.createLinearGradient(0, 0, 0, h);
      v.addColorStop(0, 'rgba(255,255,255,0.9)');
      v.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = v;
      g.fillRect(0, 0, w, h);
      g.globalCompositeOperation = 'destination-in';
      const hz = g.createLinearGradient(0, 0, w, 0);
      hz.addColorStop(0, 'rgba(0,0,0,0)');
      hz.addColorStop(0.5, 'rgba(0,0,0,1)');
      hz.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = hz;
      g.fillRect(0, 0, w, h);
    },
    false,
  );
  const chevrons = canvasTexture(128, 128, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.lineCap = 'round';
    g.lineJoin = 'round';
    for (let i = 0; i < 2; i++) {
      const y = i * 64 + 50;
      g.strokeStyle = i ? '#ffffff' : '#fbd679';
      g.lineWidth = 16;
      g.beginPath();
      g.moveTo(22, y);
      g.lineTo(64, y - 34);
      g.lineTo(106, y);
      g.stroke();
    }
  });
  const checker = canvasTexture(64, 16, (g) => {
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 2; y++) {
        g.fillStyle = (x + y) & 1 ? '#06415c' : '#ffffff';
        g.fillRect(x * 8, y * 8, 8, 8);
      }
    }
  });
  checker.magFilter = THREE.NearestFilter;
  const banner = canvasTexture(
    1024,
    128,
    (g, w, h) => {
      for (let x = 0; x < 32; x++) {
        for (let y = 0; y < 4; y++) {
          g.fillStyle = (x + y) & 1 ? '#06415c' : '#ffffff';
          g.fillRect(x * 32, y * 32, 32, 32);
        }
      }
      g.fillStyle = '#06415c';
      g.beginPath();
      g.roundRect(w / 2 - 250, 10, 500, h - 20, 22);
      g.fill();
      g.fillStyle = '#fbd679';
      g.font = `600 84px ${FONT}`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText('DÉPART', w / 2, h / 2 + 4);
    },
    false,
  );
  return { sand, kerb, grass, reef, caustics, glow, ray, chevrons, checker, banner };
}

// ------------------------------------------------------------------ géométries
/** Ruban posé le long de la piste, entre deux décalages latéraux. */
function ribbon(track: Track, from: number, to: number, y: number, tile: number) {
  const { N, px, py, tx, ty } = track;
  const pos = new Float32Array((N + 1) * 6);
  const uv = new Float32Array((N + 1) * 4);
  const nor = new Float32Array((N + 1) * 6);
  const index: number[] = [];
  let len = 0;
  for (let i = 0; i <= N; i++) {
    const k = i % N;
    if (i > 0) len += Math.hypot(px[k] - px[(k - 1 + N) % N], py[k] - py[(k - 1 + N) % N]);
    [from, to].forEach((lat, s) => {
      const o = (i * 2 + s) * 3;
      pos[o] = px[k] - ty[k] * lat;
      pos[o + 1] = y;
      pos[o + 2] = py[k] + tx[k] * lat;
      nor[o + 1] = 1;
      uv[(i * 2 + s) * 2] = s;
      uv[(i * 2 + s) * 2 + 1] = len / tile;
    });
    if (i < N) index.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
  }
  // La longueur de la boucle n'est pas un multiple du motif : on l'étire d'un rien pour fermer sans couture.
  const loops = Math.max(1, Math.round(len / tile));
  for (let i = 0; i <= N; i++) {
    uv[i * 4 + 1] *= loops / (len / tile);
    uv[i * 4 + 3] *= loops / (len / tile);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setIndex(index);
  return g;
}

/** Corail branchu (hauteur d'environ 1) : des branches qui se divisent. `flat` donne une gorgone en éventail. */
function coralGeometry(seed: number, flat = false) {
  const rnd = seeded(seed);
  const parts: THREE.BufferGeometry[] = [];
  const q = new THREE.Quaternion();
  const grow = (pos: THREE.Vector3, dir: THREE.Vector3, len: number, rad: number, depth: number) => {
    const g = new THREE.CylinderGeometry(rad * 0.72, rad, len, 5, 1);
    g.translate(0, len / 2, 0);
    g.applyQuaternion(q.setFromUnitVectors(UP, dir));
    g.translate(pos.x, pos.y, pos.z);
    parts.push(g);
    const end = pos.clone().addScaledVector(dir, len);
    if (depth === 0) {
      const tip = new THREE.SphereGeometry(rad * 0.85, 5, 3);
      tip.translate(end.x, end.y, end.z);
      parts.push(tip);
      return;
    }
    const kids = 2 + (rnd() < 0.45 ? 1 : 0);
    for (let i = 0; i < kids; i++) {
      const spread = new THREE.Vector3((rnd() - 0.5) * 1.5, rnd() * 0.5, flat ? (rnd() - 0.5) * 0.12 : (rnd() - 0.5) * 1.5);
      grow(end, dir.clone().add(spread).normalize(), len * 0.72, rad * 0.7, depth - 1);
    }
  };
  const trunks = flat ? 4 : 3;
  for (let i = 0; i < trunks; i++) {
    const lean = new THREE.Vector3((rnd() - 0.5) * 0.9, 1, flat ? 0 : (rnd() - 0.5) * 0.9).normalize();
    grow(new THREE.Vector3((rnd() - 0.5) * 0.12, 0, 0), lean, 0.4, flat ? 0.04 : 0.07, 2);
  }
  return mergeGeometries(parts)!;
}

/** Bloc bosselé : rocher (anguleux) ou patate de corail (arrondie). */
function lumpGeometry(seed: number, detail: number, bump: number, flatBottom: boolean) {
  const rnd = seeded(seed);
  const g = new THREE.IcosahedronGeometry(1, detail);
  const p = g.attributes.position;
  const offsets = [rnd() * 10, rnd() * 10, rnd() * 10];
  for (let i = 0; i < p.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(p, i);
    const n = Math.sin(v.x * 3.1 + offsets[0]) * Math.sin(v.y * 2.7 + offsets[1]) * Math.sin(v.z * 3.4 + offsets[2]);
    v.multiplyScalar(1 + n * bump);
    if (flatBottom && v.y < 0) v.y *= 0.15;
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

/** Touffe d'herbier : quelques lames courbées. */
function seagrassGeometry() {
  const rnd = seeded(31);
  const blades: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 5; i++) {
    const g = new THREE.CylinderGeometry(0.012, 0.06, 1, 3, 3);
    g.translate(0, 0.5, 0);
    const p = g.attributes.position;
    const bend = 0.25 + rnd() * 0.35;
    for (let k = 0; k < p.count; k++) p.setX(k, p.getX(k) + bend * p.getY(k) * p.getY(k));
    g.rotateY(rnd() * TAU);
    g.scale(1, 0.7 + rnd() * 0.5, 1);
    g.translate((rnd() - 0.5) * 0.3, 0, (rnd() - 0.5) * 0.3);
    blades.push(g);
  }
  const out = mergeGeometries(blades)!;
  out.computeVertexNormals();
  return out;
}

/** Coquillage bombé à côtes (rayon 1). */
function shellGeometry() {
  const g = new THREE.SphereGeometry(1, 28, 14);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const ridge = 1 + 0.07 * Math.cos(Math.atan2(x, y + 1.2) * 26);
    p.setXYZ(i, x * ridge, y * ridge * (y < 0 ? 0.82 : 1), p.getZ(i) * 0.36);
  }
  g.computeVertexNormals();
  return g;
}

function fishGeometry() {
  const body = new THREE.SphereGeometry(1, 10, 8);
  body.scale(0.45, 0.6, 1.3);
  const tail = new THREE.ConeGeometry(0.6, 0.9, 4);
  tail.rotateX(Math.PI / 2);
  tail.scale(0.25, 1, 1);
  tail.translate(0, 0, -1.6);
  return mergeGeometries([body, tail])!;
}

// ------------------------------------------------------------------ pilotes
interface RacerVisual {
  racer: Racer;
  root: THREE.Group;
  tilt: THREE.Group;
  flames: THREE.Mesh[];
  shield: THREE.Mesh;
  label: THREE.Sprite | null;
  roll: number;
}

export function createRaceView(canvas: HTMLCanvasElement, track: Track, pads: Pad[]) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(FOG_COLOR, 260, 1350);
  const camera = new THREE.PerspectiveCamera(58, 1, 2, 4000);
  const tex = makeTextures();
  const { N, px, py, tx, ty } = track;
  const rnd = seeded(2026);
  let framing = { x: 0, y: 0 };
  let fov = 58;
  let modelsLoaded = 0;
  // Résolution de rendu : elle baisse d'un cran quand l'appareil n'arrive pas à suivre (tablettes anciennes).
  let quality = Math.min(window.devicePixelRatio || 1, window.matchMedia('(pointer: coarse)').matches ? 1.5 : 1.75);
  let slowTime = 0;
  let frameAvg = 1 / 60;

  scene.add(new THREE.HemisphereLight(0xdcfbff, 0x2f8fa3, 1.5));
  const sun = new THREE.DirectionalLight(0xfff6dc, 2.1);
  sun.position.set(0.4, 1, 0.25);
  scene.add(sun);

  // ---------------------------------------------------------------- ciel sous-marin
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(3000, 24, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: { top: { value: new THREE.Color(0xe8feff) }, mid: { value: new THREE.Color(0x63d3e2) }, low: { value: new THREE.Color(FOG_COLOR) } },
      vertexShader: 'varying vec3 vDir; void main() { vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader:
        'uniform vec3 top; uniform vec3 mid; uniform vec3 low; varying vec3 vDir; void main() { float h = normalize(vDir).y; vec3 c = mix(low, mid, smoothstep(0.02, 0.3, h)); c = mix(c, top, smoothstep(0.3, 0.95, h)); gl_FragColor = vec4(c, 1.0);\n#include <colorspace_fragment>\n}',
    }),
  );
  sky.renderOrder = -2;
  scene.add(sky);

  // La surface de l'eau vue d'en dessous : un disque de reflets qui suit la caméra.
  const surfaceTex = tex.caustics.clone();
  surfaceTex.repeat.set(7, 7);
  const surface = new THREE.Mesh(
    new THREE.CircleGeometry(1500, 40),
    new THREE.MeshBasicMaterial({ map: surfaceTex, alphaMap: tex.glow, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide }),
  );
  surface.rotation.x = Math.PI / 2;
  surface.position.y = 300;
  scene.add(surface);

  // ---------------------------------------------------------------- sol et piste
  const causticLayer = (repeatX: number, repeatY: number) => {
    const t = tex.caustics.clone();
    t.repeat.set(repeatX, repeatY);
    return t;
  };
  const animated: { t: THREE.Texture; sx: number; sy: number }[] = [];
  const lit = (map: THREE.Texture, cx: number, cy: number, strength: number) => {
    const emissiveMap = causticLayer(cx, cy);
    animated.push({ t: emissiveMap, sx: 0.013 * cx, sy: 0.009 * cy });
    return new THREE.MeshLambertMaterial({ map, emissive: 0xffffff, emissiveMap, emissiveIntensity: strength, side: THREE.DoubleSide });
  };

  tex.reef.repeat.set(26, 26);
  const reefFloor = new THREE.Mesh(new THREE.PlaneGeometry(10000, 10000), lit(tex.reef, 60, 60, 0.16));
  reefFloor.rotation.x = -Math.PI / 2;
  reefFloor.position.set(WORLD / 2, -1.2, WORLD / 2);
  scene.add(reefFloor);

  const grassWidth = HW + 64;
  tex.grass.repeat.set((grassWidth * 2) / 90, 1);
  scene.add(new THREE.Mesh(ribbon(track, -grassWidth, grassWidth, -0.6, 90), lit(tex.grass, 2, 1 / 2, 0.14)));
  scene.add(new THREE.Mesh(ribbon(track, -HW, HW, 0, HW * 2), lit(tex.sand, 1.2, 1.2, 0.2)));
  const kerbMat = new THREE.MeshLambertMaterial({ map: tex.kerb, side: THREE.DoubleSide });
  scene.add(new THREE.Mesh(ribbon(track, -HW - 1, -HW + 9, 0.35, 34), kerbMat));
  scene.add(new THREE.Mesh(ribbon(track, HW - 9, HW + 1, 0.35, 34), kerbMat));

  /** Oriente un objet dont l'avant est +z dans le sens de la piste au point k. */
  const alongTrack = (obj: THREE.Object3D, k: number, lat = 0, y = 0) => {
    obj.position.set(px[k] - ty[k] * lat, y, py[k] + tx[k] * lat);
    obj.rotation.y = Math.PI / 2 - Math.atan2(ty[k], tx[k]);
  };

  // Ligne et portique de départ.
  const gate = new THREE.Group();
  const line = new THREE.Mesh(new THREE.PlaneGeometry(HW * 2 - 18, 12), new THREE.MeshLambertMaterial({ map: tex.checker }));
  tex.checker.repeat.set(3, 1);
  line.rotation.x = -Math.PI / 2;
  line.position.y = 0.3;
  gate.add(line);
  const postMat = new THREE.MeshLambertMaterial({ color: 0xf2674a });
  const ringMat = new THREE.MeshLambertMaterial({ color: 0xfff4e0 });
  for (const side of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 4.2, 56, 12), postMat);
    post.position.set(side * (HW + 8), 28, 0);
    gate.add(post);
    for (let i = 0; i < 4; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(3.9, 1, 8, 16), ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(side * (HW + 8), 8 + i * 13, 0);
      gate.add(ring);
    }
    const top = new THREE.Mesh(coralGeometry(11 + side), new THREE.MeshLambertMaterial({ color: side < 0 ? 0xf59ac0 : 0xfbd679 }));
    top.scale.setScalar(22);
    top.position.set(side * (HW + 8), 54, 0);
    gate.add(top);
  }
  const board = new THREE.Mesh(new THREE.BoxGeometry(HW * 2 + 16, 16, 3), [postMat, postMat, postMat, postMat, new THREE.MeshBasicMaterial({ map: tex.banner }), new THREE.MeshBasicMaterial({ map: tex.banner })]);
  board.position.y = 50;
  gate.add(board);
  alongTrack(gate, 0);
  scene.add(gate);

  // Courants au sol (coups d'accélérateur).
  const padMat = new THREE.MeshBasicMaterial({ map: tex.chevrons, transparent: true, depthWrite: false, side: THREE.DoubleSide });
  const padGlow = new THREE.MeshBasicMaterial({ color: 0x19b8c4, transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide });
  for (const pad of pads) {
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.PlaneGeometry(34, 34), padGlow);
    base.rotation.x = -Math.PI / 2;
    base.position.y = 0.45;
    const arrows = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), padMat);
    arrows.rotation.x = -Math.PI / 2;
    arrows.rotation.z = Math.PI;
    arrows.position.y = 0.6;
    g.add(base, arrows);
    g.position.set(pad.x, 0, pad.y);
    g.rotation.y = Math.PI / 2 - pad.angle;
    scene.add(g);
  }

  // Arches de roche au-dessus du chenal.
  const rockMat = new THREE.MeshLambertMaterial({ color: 0xc9b891, flatShading: true });
  for (const f of [0.33, 0.6, 0.9]) {
    const g = new THREE.TorusGeometry(HW + 34, 15, 7, 18, Math.PI);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const n = 1 + Math.sin(p.getX(i) * 0.09 + f * 20) * Math.sin(p.getY(i) * 0.11) * 0.16;
      p.setXYZ(i, p.getX(i) * n, p.getY(i) * n, p.getZ(i) * (1.6 + Math.sin(p.getX(i) * 0.05) * 0.5));
    }
    g.computeVertexNormals();
    const arch = new THREE.Mesh(g, rockMat);
    alongTrack(arch, Math.round(f * N), 0, -6);
    scene.add(arch);
    for (let i = 0; i < 5; i++) {
      const c = new THREE.Mesh(coralGeometry(40 + i), new THREE.MeshLambertMaterial({ color: CORALS[(i + Math.round(f * 10)) % CORALS.length] }));
      const a = 0.35 + i * 0.6;
      c.scale.setScalar(16 + (i % 2) * 8);
      c.position.set(Math.cos(a) * (HW + 46), Math.sin(a) * (HW + 46) - 6, 0);
      c.rotation.z = a - Math.PI / 2;
      arch.add(c);
    }
  }

  // ---------------------------------------------------------------- décor du récif
  const farFromTrack = (x: number, z: number, min: number) => {
    for (let k = 0; k < N; k += 2) if ((x - px[k]) ** 2 + (z - py[k]) ** 2 < min * min) return false;
    return true;
  };
  const dummy = new THREE.Object3D();
  const scatter = (geometry: THREE.BufferGeometry, material: THREE.Material, count: number, minD: number, maxD: number, place: (d: THREE.Object3D, color: THREE.Color) => void) => {
    const mesh = new THREE.InstancedMesh(geometry, material, count);
    const color = new THREE.Color();
    let n = 0;
    for (let tries = 0; n < count && tries < count * 6; tries++) {
      const k = (rnd() * N) | 0;
      const side = rnd() < 0.5 ? -1 : 1;
      const dist = HW + minD + rnd() * (maxD - minD);
      const x = px[k] - ty[k] * dist * side;
      const z = py[k] + tx[k] * dist * side;
      if (!farFromTrack(x, z, HW + minD - 2)) continue;
      dummy.position.set(x, 0, z);
      dummy.rotation.set(0, rnd() * TAU, 0);
      dummy.scale.setScalar(1);
      color.set(0xffffff);
      place(dummy, color);
      dummy.updateMatrix();
      mesh.setMatrixAt(n, dummy.matrix);
      mesh.setColorAt(n, color);
      n++;
    }
    mesh.count = n;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    scene.add(mesh);
    return mesh;
  };
  const plain = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const faceted = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true });
  for (const seed of [1, 2, 3]) {
    scatter(coralGeometry(seed), plain, 46, 16, 210, (d, c) => {
      d.scale.setScalar(20 + rnd() * 38);
      c.set(CORALS[(rnd() * CORALS.length) | 0]);
    });
  }
  scatter(coralGeometry(8, true), plain, 50, 14, 180, (d, c) => {
    d.scale.setScalar(26 + rnd() * 30);
    c.set([0xe0567f, 0xf08a3c, 0xb46be0, 0xff7fa8][(rnd() * 4) | 0]);
  });
  scatter(lumpGeometry(5, 2, 0.1, true), plain, 100, 18, 240, (d, c) => {
    const s = 10 + rnd() * 22;
    d.scale.set(s, s * (0.6 + rnd() * 0.3), s);
    c.set([0xc9a45c, 0x8fae6a, 0xd98f6a, 0xb8a0d8, 0xe6c86a][(rnd() * 5) | 0]);
  });
  scatter(seagrassGeometry(), new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide }), 340, 3, 70, (d, c) => {
    d.scale.setScalar(9 + rnd() * 10);
    c.set([0x2f9a63, 0x3fb574, 0x268553][(rnd() * 3) | 0]);
  });
  scatter(lumpGeometry(9, 1, 0.22, false), faceted, 70, 26, 260, (d, c) => {
    const s = 8 + rnd() * 16;
    d.scale.set(s, s * (0.6 + rnd() * 0.5), s * (0.8 + rnd() * 0.5));
    c.set([0xa9b6b8, 0xc4b79a, 0x8fa3a8][(rnd() * 3) | 0]);
  });
  // Grands pitons au loin : ils donnent de la profondeur au paysage.
  scatter(lumpGeometry(13, 1, 0.2, false), faceted, 34, 150, 520, (d, c) => {
    const s = 28 + rnd() * 34;
    d.scale.set(s, s * (2 + rnd() * 2.4), s);
    c.set([0x6fa7b4, 0x86b8b0, 0x5f97a8][(rnd() * 3) | 0]);
  });

  // Rayons de soleil : des voiles de lumière croisés, plantés autour de la piste.
  const rayMat = new THREE.MeshBasicMaterial({ map: tex.ray, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide });
  const rayGeo = new THREE.PlaneGeometry(70, 330);
  const rays: THREE.Group[] = [];
  for (let i = 0; i < 46; i++) {
    const k = (rnd() * N) | 0;
    const d = (rnd() - 0.5) * 500;
    const g = new THREE.Group();
    for (const r of [0, Math.PI / 2]) {
      const m = new THREE.Mesh(rayGeo, rayMat);
      m.rotation.y = r;
      g.add(m);
    }
    g.position.set(px[k] - ty[k] * d, 150, py[k] + tx[k] * d);
    g.rotation.z = 0.2 + rnd() * 0.15;
    g.rotation.y = rnd() * TAU;
    g.scale.x = g.scale.z = 0.6 + rnd() * 1.2;
    rays.push(g);
    scene.add(g);
  }

  // Bancs de poissons qui tournent au-dessus du récif.
  const FISH = 90;
  const fish = new THREE.InstancedMesh(fishGeometry(), plain, FISH);
  const fishData = Array.from({ length: FISH }, (_, i) => {
    const school = (i / 9) | 0;
    const k = (seeded(school + 50)() * N) | 0;
    return { cx: px[k] + (rnd() - 0.5) * 60, cz: py[k] + (rnd() - 0.5) * 60, r: 60 + seeded(school + 9)() * 120 + rnd() * 16, y: 30 + seeded(school + 3)() * 70 + rnd() * 12, speed: (0.25 + seeded(school)() * 0.3) * (school % 2 ? 1 : -1), phase: rnd() * 0.6 + school, size: 3 + rnd() * 2.5 };
  });
  const fishColors = [0xfbd679, 0x4fb8ff, 0xff8a4a, 0xf2f6fa, 0xff6fa0, 0x7fe0c4];
  fishData.forEach((_, i) => fish.setColorAt(i, new THREE.Color(fishColors[((i / 9) | 0) % fishColors.length])));
  fish.frustumCulled = false;
  scene.add(fish);

  // Petites bulles qui montent partout dans le lagon.
  const BUBBLES = 900;
  const bubblePos = new Float32Array(BUBBLES * 3);
  const bubbleSeed = new Float32Array(BUBBLES);
  for (let i = 0; i < BUBBLES; i++) {
    bubblePos[i * 3] = rnd() * (WORLD + 400) - 200;
    bubblePos[i * 3 + 2] = rnd() * (WORLD + 400) - 200;
    bubbleSeed[i] = rnd() * 220;
  }
  const bubbleGeo = new THREE.BufferGeometry();
  bubbleGeo.setAttribute('position', new THREE.BufferAttribute(bubblePos, 3));
  const bubbles = new THREE.Points(bubbleGeo, new THREE.PointsMaterial({ map: tex.glow, color: 0xe9fbff, size: 4.5, transparent: true, opacity: 0.7, depthWrite: false }));
  bubbles.frustumCulled = false;
  scene.add(bubbles);

  // Particules de la course (sillages, étincelles, éclats de corail).
  const partPos = new Float32Array(MAX_PARTS * 3);
  const partCol = new Float32Array(MAX_PARTS * 3);
  const partGeo = new THREE.BufferGeometry();
  partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3));
  partGeo.setAttribute('color', new THREE.BufferAttribute(partCol, 3));
  const partMesh = new THREE.Points(partGeo, new THREE.PointsMaterial({ map: tex.glow, size: 3.2, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  partMesh.frustumCulled = false;
  scene.add(partMesh);
  const tmpColor = new THREE.Color();

  // ---------------------------------------------------------------- objets de course
  const shellGeo = shellGeometry();
  const shellMat = new THREE.MeshStandardMaterial({ color: 0xfbd679, roughness: 0.35, metalness: 0.25, emissive: 0x7a4a00, emissiveIntensity: 0.35 });
  const bubbleMat = new THREE.MeshStandardMaterial({ color: 0xdffcff, transparent: true, opacity: 0.28, roughness: 0.05, depthWrite: false });
  const bubbleGeoBig = new THREE.SphereGeometry(1, 24, 16);
  const shellMeshes: THREE.Group[] = [];
  const makeShell = () => {
    const g = new THREE.Group();
    const shell = new THREE.Mesh(shellGeo, shellMat);
    shell.scale.setScalar(5.2);
    const halo = new THREE.Mesh(bubbleGeoBig, bubbleMat);
    halo.scale.setScalar(8.5);
    const light = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex.glow, color: 0xfff0a8, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }));
    light.scale.setScalar(30);
    g.add(light, shell, halo);
    scene.add(g);
    return g;
  };

  const coralGeos = [coralGeometry(21), coralGeometry(22), coralGeometry(23)];
  const coralMats = CORALS.map((color) => new THREE.MeshLambertMaterial({ color }));
  const inkGeo = new THREE.SphereGeometry(1, 12, 10);
  const obstacleMeshes = new Map<Obstacle, THREE.Object3D>();
  const makeObstacle = (o: Obstacle) => {
    if (o.kind === 'corail') return new THREE.Mesh(coralGeos[(o.seed | 0) % 3], coralMats[(o.seed | 0) % coralMats.length]);
    const g = new THREE.Group();
    const mat = new THREE.MeshLambertMaterial({ color: 0x241446, transparent: true, opacity: 0.85, depthWrite: false });
    const r = seeded(o.seed | 0);
    for (let i = 0; i < 7; i++) {
      const blob = new THREE.Mesh(inkGeo, mat);
      const a = (i / 7) * TAU;
      blob.position.set(Math.cos(a) * 11 * r(), 4 + r() * 7, Math.sin(a) * 11 * r());
      blob.scale.setScalar(6 + r() * 6);
      g.add(blob);
    }
    return g;
  };
  const shotGeo = coralGeometry(77);
  const shotMeshes = new Map<Shot, THREE.Mesh>();

  // ---------------------------------------------------------------- bolides et pilotes
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const modelCache = new Map<string, Promise<THREE.Object3D>>();
  const loadModel = (url: string) => {
    let p = modelCache.get(url);
    if (!p) {
      p = loader.loadAsync(url).then((gltf) => {
        modelsLoaded += 1;
        // Normalisé : posé sur le sol, centré, plus grande dimension = 1.
        const obj = gltf.scene;
        const box = new THREE.Box3().setFromObject(obj);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const s = 1 / Math.max(size.x, size.y, size.z);
        obj.position.set(-center.x * s, -box.min.y * s, -center.z * s);
        obj.scale.setScalar(s);
        obj.traverse((m) => {
          const mat = (m as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
          if (mat?.isMeshStandardMaterial) {
            mat.roughness = 0.62;
            mat.metalness = 0;
          }
        });
        const holder = new THREE.Group();
        holder.add(obj);
        return holder;
      });
      modelCache.set(url, p);
    }
    return p;
  };

  const shadowMat = new THREE.MeshBasicMaterial({ map: tex.glow, color: 0x03222e, transparent: true, opacity: 0.5, depthWrite: false });
  const shadowGeo = new THREE.PlaneGeometry(30, 30);
  // Coque : profil en goutte d'eau tourné autour de l'axe avant-arrière (longueur 21, nez à l'avant).
  const hullGeo = new THREE.LatheGeometry(
    Array.from({ length: 15 }, (_, i) => {
      const u = i / 14;
      return new THREE.Vector2(Math.sin(Math.PI * Math.pow(u, 0.72)) * (1 - u * 0.12), u * 21 - 11);
    }),
    28,
  );
  hullGeo.rotateX(Math.PI / 2);
  const podGeo = new THREE.CapsuleGeometry(1.35, 5, 6, 14);
  const flameGeo = new THREE.ConeGeometry(1, 5.5, 12);
  const shieldMat = new THREE.MeshStandardMaterial({ color: 0x9fecff, transparent: true, opacity: 0.32, roughness: 0.05, depthWrite: false, emissive: 0x3fb8d8, emissiveIntensity: 0.5 });
  let visuals: RacerVisual[] = [];

  const buildRacer = (racer: Racer): RacerVisual => {
    const setup: RacerSetup = racer.setup;
    const root = new THREE.Group();
    const tilt = new THREE.Group();
    root.add(tilt);
    const body = new THREE.MeshStandardMaterial({ color: setup.color, roughness: 0.32, metalness: 0.2 });
    const deep = new THREE.MeshStandardMaterial({ color: setup.deep, roughness: 0.45, metalness: 0.15 });
    const cream = new THREE.MeshStandardMaterial({ color: 0xfff4e0, roughness: 0.5 });

    // Coque profilée (goutte d'eau), cockpit, phares.
    const hull = new THREE.Mesh(hullGeo, body);
    hull.scale.set(5.6, 2.3, 1);
    hull.position.y = 3;
    const belly = new THREE.Mesh(hullGeo, deep);
    belly.scale.set(4.9, 1.5, 0.93);
    belly.position.set(0, 1.9, -0.3);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(4.1, 0.75, 10, 28), cream);
    rim.rotation.x = Math.PI / 2;
    rim.scale.set(1, 1.25, 1);
    rim.position.set(0, 4.7, 0.2);
    const well = new THREE.Mesh(new THREE.CylinderGeometry(3.9, 3.4, 1.2, 24), deep);
    well.scale.set(1, 1, 1.25);
    well.position.set(0, 4.5, 0.2);
    tilt.add(hull, belly, rim, well);
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xfff2a8 });
    for (const side of [-1, 1]) {
      const lamp = new THREE.Mesh(bubbleGeoBig, lampMat);
      lamp.scale.set(0.9, 0.7, 0.9);
      lamp.position.set(side * 2.1, 3.6, 8.3);
      tilt.add(lamp);
    }
    // Deux propulseurs latéraux et leur jet.
    const flames: THREE.Mesh[] = [];
    for (const side of [-1, 1]) {
      const pod = new THREE.Mesh(podGeo, deep);
      pod.rotation.x = Math.PI / 2;
      pod.position.set(side * 6.6, 2.6, -4.6);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.38, 8, 20), cream);
      ring.position.set(side * 6.6, 2.6, -1.6);
      const strut = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.7, 2.6), body);
      strut.position.set(side * 4.9, 2.8, -4.4);
      const flame = new THREE.Mesh(flameGeo, new THREE.MeshBasicMaterial({ color: 0x9af3ff, transparent: true, opacity: 0.75, depthWrite: false }));
      flame.rotation.x = -Math.PI / 2;
      flame.position.set(side * 6.6, 2.6, -9);
      flames.push(flame);
      tilt.add(pod, ring, strut, flame);
    }
    // Le pilote : modèle 3D de la carte, ou sa pastille dans une bulle en attendant.
    const seat = new THREE.Group();
    seat.position.set(0, 4.6, 0.2);
    tilt.add(seat);
    const fallback = new THREE.Group();
    const art = new THREE.Sprite(new THREE.SpriteMaterial({ color: setup.color }));
    art.scale.setScalar(9.4);
    art.position.y = 6;
    const dome = new THREE.Mesh(bubbleGeoBig, bubbleMat);
    dome.scale.setScalar(5.8);
    dome.position.y = 6;
    fallback.add(art, dome);
    seat.add(fallback);
    const image = new Image();
    image.onload = () => {
      const side = Math.min(image.naturalWidth, image.naturalHeight) * 0.86;
      const t = canvasTexture(
        256,
        256,
        (g) => {
          g.beginPath();
          g.arc(128, 128, 126, 0, TAU);
          g.clip();
          g.drawImage(image, (image.naturalWidth - side) / 2, (image.naturalHeight - side) / 2, side, side, 0, 0, 256, 256);
          g.lineWidth = 10;
          g.strokeStyle = '#ffffff';
          g.stroke();
        },
        false,
      );
      art.material.map = t;
      art.material.color.set(0xffffff);
      art.material.needsUpdate = true;
    };
    image.src = setup.art;
    if (setup.model) {
      loadModel(setup.model)
        .then((model) => {
          const pilot = model.clone();
          pilot.scale.setScalar(12.5);
          pilot.rotation.y = setup.modelYaw;
          seat.remove(fallback);
          seat.add(pilot);
        })
        .catch(() => {
          // Modèle introuvable ou illisible : la pastille reste en place.
        });
    }

    const shield = new THREE.Mesh(bubbleGeoBig, shieldMat);
    shield.scale.setScalar(13.5);
    shield.position.y = 8;
    shield.visible = false;
    root.add(shield);
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.5;
    root.add(shadow);

    let label: THREE.Sprite | null = null;
    if (!racer.isPlayer) {
      const t = canvasTexture(
        512,
        96,
        (g, w, h) => {
          g.font = `600 52px ${FONT}`;
          const tw = Math.min(w - 24, g.measureText(setup.name).width + 56);
          g.fillStyle = 'rgba(6,50,74,0.82)';
          g.beginPath();
          g.roundRect((w - tw) / 2, 8, tw, h - 16, 40);
          g.fill();
          g.fillStyle = '#ffffff';
          g.textAlign = 'center';
          g.textBaseline = 'middle';
          g.fillText(setup.name, w / 2, h / 2 + 3, w - 60);
        },
        false,
      );
      label = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, sizeAttenuation: false }));
      label.scale.set(0.17, 0.032, 1);
      label.position.y = 25;
      root.add(label);
    }
    scene.add(root);
    return { racer, root, tilt, flames, shield, label, roll: 0 };
  };

  const disposeObject = (obj: THREE.Object3D) => scene.remove(obj);

  const resize = () => {
    const w = canvas.clientWidth || 960;
    const h = canvas.clientHeight || 600;
    renderer.setPixelRatio(quality);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    if (framing.x || framing.y) camera.setViewOffset(w, h, -framing.x * w, framing.y * h, w, h);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  };
  resize();

  const camPos = new THREE.Vector3();
  const camLook = new THREE.Vector3();

  return {
    resize,
    setFraming(fx: number, fy: number) {
      framing = { x: fx, y: fy };
      resize();
    },
    setRacers(racers: Racer[]) {
      visuals.forEach((v) => disposeObject(v.root));
      visuals = racers.map(buildRacer);
    },
    info() {
      return { quality, triangles: renderer.info.render.triangles, calls: renderer.info.render.calls, models: modelsLoaded };
    },
    render(state: RaceState, dt: number) {
      const clock = state.clock;
      const { cam, player } = state;

      // Moins de 30 images par seconde pendant plus d'une seconde et demie : on allège l'image.
      frameAvg += (dt - frameAvg) * 0.1;
      slowTime = frameAvg > 1 / 30 ? slowTime + dt : 0;
      if (slowTime > 1.5 && quality > 0.7) {
        quality = Math.max(0.7, quality * 0.8);
        slowTime = 0;
        resize();
      }

      // Caméra.
      const portrait = camera.aspect < 1;
      if (cam.mode === 'chase') {
        const cx = Math.cos(cam.a);
        const cz = Math.sin(cam.a);
        const boost = player && player.boost > 0 ? 1 : 0;
        const back = 50 - boost * 5;
        camPos.set(cam.x - cx * back, 22, cam.y - cz * back);
        camLook.set(cam.x + cx * 30, 8, cam.y + cz * 30);
        fov += ((portrait ? 76 : 58) + boost * 11 - fov) * Math.min(1, dt * 5);
        if (cam.shake > 0) camPos.add(new THREE.Vector3((Math.random() - 0.5) * cam.shake * 9, (Math.random() - 0.5) * cam.shake * 6, 0));
      } else {
        const radius = portrait ? 46 : 38;
        camPos.set(cam.x + Math.cos(cam.a) * radius, 15, cam.y + Math.sin(cam.a) * radius);
        camLook.set(cam.x, 8.5, cam.y);
        fov += ((portrait ? 62 : 46) - fov) * Math.min(1, dt * 5);
      }
      camera.position.copy(camPos);
      camera.lookAt(camLook);
      if (Math.abs(camera.fov - fov) > 0.01) {
        camera.fov = fov;
        camera.updateProjectionMatrix();
      }
      sky.position.copy(camera.position);
      surface.position.set(camera.position.x, 300, camera.position.z);

      // Eau vivante.
      for (const a of animated) a.t.offset.set(clock * a.sx, clock * a.sy);
      surfaceTex.offset.set(clock * 0.02, clock * 0.014);
      tex.chevrons.offset.y = clock * 1.6;
      rays.forEach((r, i) => (r.rotation.x = Math.sin(clock * 0.35 + i) * 0.08));
      for (let i = 0; i < BUBBLES; i++) bubblePos[i * 3 + 1] = (bubbleSeed[i] + clock * 9) % 220;
      bubbleGeo.attributes.position.needsUpdate = true;
      fishData.forEach((f, i) => {
        const a = f.phase + clock * f.speed;
        dummy.position.set(f.cx + Math.cos(a) * f.r, f.y + Math.sin(clock * 0.8 + f.phase * 3) * 3, f.cz + Math.sin(a) * f.r);
        dummy.rotation.set(0, -a + (f.speed > 0 ? 0 : Math.PI) + Math.sin(clock * 7 + i) * 0.14, 0);
        dummy.scale.setScalar(f.size);
        dummy.updateMatrix();
        fish.setMatrixAt(i, dummy.matrix);
      });
      fish.instanceMatrix.needsUpdate = true;

      // Bolides.
      visuals.forEach((v, i) => {
        const r = v.racer;
        v.root.position.set(r.x, 0, r.y);
        v.root.rotation.y = Math.PI / 2 - r.a;
        const hop = r.hop > 0 ? Math.sin((r.hop / 0.26) * Math.PI) * 3.4 : 0;
        v.tilt.position.y = 1.3 + Math.sin(clock * 5 + i * 1.7) * 0.35 + hop;
        const spin = r.spin > 0 ? ((SPIN_TIME - r.spin) / SPIN_TIME) * Math.PI * 4 : 0;
        v.tilt.rotation.y = -r.drift * 0.5 + spin;
        v.roll += ((r.drift ? r.drift * 0.3 : r.steer * 0.2) - v.roll) * Math.min(1, dt * 10);
        v.tilt.rotation.z = v.roll;
        v.tilt.rotation.x = r.boost > 0 ? -0.09 : 0;
        v.root.visible = !(r.inv > 0 && r.spin <= 0 && Math.floor(clock * 14) % 2 === 0);
        const power = 0.25 + Math.min(1.2, r.speed / 255) + (r.boost > 0 ? 1.5 : 0);
        const stage = driftStage(r.charge);
        for (const flame of v.flames) {
          flame.scale.set(1 + (r.boost > 0 ? 0.5 : 0), power * (0.85 + Math.random() * 0.3), 1 + (r.boost > 0 ? 0.5 : 0));
          flame.position.z = -9 - (flame.scale.y - 1) * 3.5;
          (flame.material as THREE.MeshBasicMaterial).color.set(r.boost > 0 ? 0xffc04a : r.drift ? [0x9af3ff, 0x5fd9d2, 0xfbd679, 0xff7fb0][stage] : 0x9af3ff);
        }
        v.shield.visible = r.shield > 0 && !(r.shield < 2.5 && Math.floor(clock * 8) % 2 === 0);
        if (v.label) {
          const d = v.root.position.distanceTo(camera.position);
          v.label.visible = cam.mode === 'chase' && d > 60 && d < 300;
        }
      });

      // Coquillages à objets.
      while (shellMeshes.length < state.shells.length) shellMeshes.push(makeShell());
      shellMeshes.forEach((m, i) => {
        const s = state.shells[i];
        m.visible = !!s && s.wait <= 0;
        if (!s) return;
        m.position.set(s.x, 10 + Math.sin(clock * 2.6 + i) * 1.6, s.y);
        m.children[1].rotation.y = clock * 2.2 + i;
      });

      // Coraux plantés et nuages d'encre.
      for (const [o, m] of obstacleMeshes) {
        if (!state.obstacles.includes(o)) {
          scene.remove(m);
          obstacleMeshes.delete(o);
        }
      }
      for (const o of state.obstacles) {
        let m = obstacleMeshes.get(o);
        if (!m) {
          m = makeObstacle(o);
          m.position.set(o.x, 0, o.y);
          m.rotation.y = o.seed;
          obstacleMeshes.set(o, m);
          scene.add(m);
        }
        if (o.kind === 'corail') {
          // La bouture grandit d'un coup en se fixant, avec un petit rebond.
          const g = o.grow < 1 ? o.grow * (1.25 - 0.25 * o.grow) : 1;
          m.scale.setScalar(19 * g + 0.01);
        } else {
          m.scale.setScalar(0.3 + 0.7 * o.grow + Math.sin(clock * 2 + o.seed) * 0.04);
          m.rotation.y = o.seed + clock * 0.3;
          ((m.children[0] as THREE.Mesh).material as THREE.MeshLambertMaterial).opacity = 0.85 * Math.min(1, o.life / 2);
        }
      }
      for (const [s, m] of shotMeshes) {
        if (!state.shots.includes(s)) {
          scene.remove(m);
          shotMeshes.delete(s);
        }
      }
      for (const s of state.shots) {
        let m = shotMeshes.get(s);
        if (!m) {
          m = new THREE.Mesh(shotGeo, coralMats[0]);
          m.scale.setScalar(7);
          shotMeshes.set(s, m);
          scene.add(m);
        }
        m.position.set(s.x, 7 + Math.sin((s.t / SHOT_TIME) * Math.PI) * 26, s.y);
        m.rotation.set(clock * 9, clock * 6, 0);
      }

      // Particules.
      const count = Math.min(MAX_PARTS, state.parts.length);
      for (let i = 0; i < count; i++) {
        const p = state.parts[state.parts.length - 1 - i];
        partPos[i * 3] = p.x;
        partPos[i * 3 + 1] = p.h;
        partPos[i * 3 + 2] = p.y;
        tmpColor.set(p.color).multiplyScalar(1 - p.life / p.max);
        partCol[i * 3] = tmpColor.r;
        partCol[i * 3 + 1] = tmpColor.g;
        partCol[i * 3 + 2] = tmpColor.b;
      }
      partGeo.setDrawRange(0, count);
      partGeo.attributes.position.needsUpdate = true;
      partGeo.attributes.color.needsUpdate = true;

      renderer.render(scene, camera);
    },
    dispose() {
      renderer.dispose();
    },
  };
}
