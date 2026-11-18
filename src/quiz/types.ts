// Typage prêt pour la V2 : chaque question porte déjà un thème et un niveau,
// pour filtrer plus tard par série thématique et par niveau de classe.
export type Theme = 'flore' | 'substrats' | 'invertebres' | 'poissons-tortues';
export type Level = 'decouverte' | 'explorateur' | 'expert';
export type Mechanic = 'qui-suis-je' | 'diagnostic' | 'defi-visuel';

export interface Subject {
  id: string;
  name: string;
  theme: Theme;
  group: string;
  origin: string;
  scientific: string | null;
  otherNames: string[];
  reefCode: string | null;
  uicn: { code: string; label: string } | null;
  sense: string;
  role: string;
  positive: string | null;
  negative: string | null;
  clues: string[];
  cluesExpert: string[] | null;
  image: string | null;
}

interface QuestionBase {
  id: string;
  subjectId: string;
  theme: Theme;
  level: Level;
  /** Propositions dans l'ordre d'affichage (déjà mélangées au tirage). */
  options: string[];
  answer: string;
}

export interface WhoAmIQuestion extends QuestionBase {
  mechanic: 'qui-suis-je';
  clues: string[];
}

export interface DiagnosticQuestion extends QuestionBase {
  mechanic: 'diagnostic';
  prompt: string;
  /** Explication propre à la question, affichée avant le rôle du sujet. */
  explanation: string;
  showImage?: boolean;
}

export interface VisualQuestion extends QuestionBase {
  mechanic: 'defi-visuel';
  prompt: string;
  image: string;
}

export type Question = WhoAmIQuestion | DiagnosticQuestion | VisualQuestion;

export type PokemonType = 'Eau' | 'Roche' | 'Acier' | 'Plante' | 'Feu' | 'Vol' | 'Électrik' | 'Psy';

export interface PokemonCardData {
  id: string;
  number: string;
  name: string;
  firstName: string | null;
  lastInitial: string | null;
  lagoon: boolean;
  inspiredBy: string;
  types: string[];
  habitat: string;
  rarity: string;
  hp: number;
  description: string;
  attacks: { name: string; damage: number; effect: string }[];
  art: string;
  original: string;
}
