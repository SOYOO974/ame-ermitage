// Circuits de « La Grande Course du Lagon ».
// Un circuit = un tracé, ce qui est posé dessus (coquillages, courants) et une ambiance de couleurs.
// Pour en ajouter un : copier une entrée de CIRCUITS, changer `ctrl` (points de passage dans un carré de
// 2048 unités, y vers le bas, sans croisement, tronçons voisins écartés d'au moins 300) et l'ambiance.

export interface CircuitTheme {
  /** Couleur de l'eau au loin et distances de brume. */
  fog: number;
  fogNear: number;
  fogFar: number;
  skyTop: number;
  skyMid: number;
  /** Teintes appliquées au sable de la piste, à ses bords et au fond du récif. */
  sand: number;
  bank: number;
  reef: number;
  /** Densité du décor (1 = circuit d'origine). */
  corals: number;
  rocks: number;
  rays: number;
}

export interface Circuit {
  id: string;
  name: string;
  /** Une phrase pour l'écran de choix. */
  pitch: string;
  /** Fait affiché en fin de course (à faire relire par la RNMR). */
  fact: string | null;
  /** Points de passage ; le départ est au premier point. */
  ctrl: [number, number][];
  /** Rangées de coquillages à objets (fractions du tour). */
  shells: number[];
  /** Courants au sol qui accélèrent : [fraction du tour, décalage par rapport au milieu]. */
  pads: [number, number][];
  /** Arches de roche au-dessus de la piste (fractions du tour). */
  arches: number[];
  /** Courants de travers : entre deux fractions du tour, ils poussent sur le côté (positif = vers la droite). */
  currents: { from: number; to: number; push: number }[];
  theme: CircuitTheme;
}

export const CIRCUITS: Circuit[] = [
  {
    id: 'chenal',
    name: 'Le chenal de sable',
    pitch: 'Un chenal de sable clair entre les coraux. Idéal pour apprendre à déraper.',
    fact: null,
    ctrl: [
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
    ],
    shells: [0.14, 0.38, 0.62, 0.86],
    pads: [
      [0.27, -30],
      [0.52, 28],
      [0.74, 0],
    ],
    arches: [0.33, 0.6, 0.9],
    currents: [],
    theme: { fog: 0x3aa7c6, fogNear: 260, fogFar: 1350, skyTop: 0xe8feff, skyMid: 0x63d3e2, sand: 0xffffff, bank: 0xffffff, reef: 0xffffff, corals: 1, rocks: 1, rays: 46 },
  },
  {
    id: 'passe',
    name: 'La passe de l’Ermitage',
    pitch: 'Eau profonde et roches sombres. Deux courants de travers poussent ton bolide sur le côté : braque contre eux.',
    fact: 'Une passe est une ouverture dans la barrière de corail. L’eau du lagon y repart vers le large et le courant y est très fort : on ne s’y baigne jamais.',
    ctrl: [
      [700, 1750],
      [1300, 1760],
      [1700, 1540],
      [1760, 1080],
      [1560, 760],
      [1680, 400],
      [1320, 240],
      [980, 400],
      [1040, 800],
      [900, 1200],
      [520, 1100],
      [300, 1400],
      [420, 1700],
    ],
    shells: [0.1, 0.34, 0.58, 0.83],
    pads: [
      [0.44, 0],
      [0.7, -26],
      [0.94, 24],
    ],
    arches: [0.39, 0.77],
    currents: [
      { from: 0.2, to: 0.29, push: 58 },
      { from: 0.61, to: 0.68, push: -58 },
    ],
    theme: { fog: 0x17608f, fogNear: 180, fogFar: 1000, skyTop: 0xbfeaff, skyMid: 0x2f9bd0, sand: 0xa9c8dc, bank: 0x4f7f8c, reef: 0x7fa0d0, corals: 0.45, rocks: 2.2, rays: 24 },
  },
];

export const CIRCUIT_BY_ID: Record<string, Circuit> = Object.fromEntries(CIRCUITS.map((c) => [c.id, c]));
