import { SUBJECTS } from './data.generated';
import type { Level, Mechanic, Question, Subject, Theme } from './types';
import SEED from './questions.seed.json';

export const SUBJECT_BY_ID: Record<string, Subject> = Object.fromEntries(SUBJECTS.map((s) => [s.id, s]));

export const MECHANIC_LABEL: Record<Mechanic, string> = {
  'qui-suis-je': 'Qui suis-je ?',
  diagnostic: 'Diagnostic Reef Check',
  'defi-visuel': 'Défi visuel du lagon',
};

export const THEME_LABEL: Record<Theme, string> = {
  flore: "Jardin de l'AME",
  substrats: 'Coraux et fonds marins',
  invertebres: 'Invertébrés du récif',
  'poissons-tortues': 'Poissons, raies et tortues',
};

// --- Anti-pièges pédagogiques ------------------------------------------------
// Deux sujets qui ne doivent jamais se retrouver face à face dans les propositions.
// - Corail dur cerveau / Éponge Dysidea : les deux « ressemblent à un cerveau ».
// - Éponge tubulaire / Éponge Dysidea : indices communs (« filtre l'eau »), uniquement
//   gênant quand on devine à partir d'indices.
const NEVER_TOGETHER: [string, string][] = [['corail-dur-cerveau', 'eponge-dysidea']];
const NEVER_TOGETHER_ON_CLUES: [string, string][] = [['eponge', 'eponge-dysidea']];
const NEVER_TOGETHER_ON_VISUAL: [string, string][] = [['patate-a-durand', 'liane-cochon']];

const conflicts = (a: string, b: string, pairs: [string, string][]) =>
  pairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

export function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickDistractors(subject: Subject, onClues: boolean): string[] {
  const allowed = SUBJECTS.filter(
    (s) =>
      s.id !== subject.id &&
      s.theme === subject.theme &&
      !conflicts(s.id, subject.id, NEVER_TOGETHER) &&
      !(onClues && conflicts(s.id, subject.id, NEVER_TOGETHER_ON_CLUES)) &&
      !(!onClues && conflicts(s.id, subject.id, NEVER_TOGETHER_ON_VISUAL)),
  );
  const sameGroup = shuffle(allowed.filter((s) => s.group === subject.group)).slice(0, 2);
  const others = shuffle(allowed.filter((s) => !sameGroup.includes(s)));
  const picked: Subject[] = [...sameGroup];
  for (const candidate of others) {
    if (picked.length >= 3) break;
    // Les distracteurs ne doivent pas non plus former une paire interdite entre eux.
    if (picked.some((p) => conflicts(p.id, candidate.id, NEVER_TOGETHER))) continue;
    picked.push(candidate);
  }
  return picked.map((s) => s.name);
}

// --- Banque de questions -----------------------------------------------------
// Une entrée = un gabarit. Les propositions des « Qui suis-je ? » et des défis
// visuels sont tirées au moment de jouer, pour varier d'une partie à l'autre.
interface Template {
  id: string;
  mechanic: Mechanic;
  subjectId: string;
  theme: Theme;
  level: Level;
  build: () => Question;
}

const whoAmI = (s: Subject, clues: string[], level: Level, id = `qsj-${s.id}`): Template => ({
  id,
  mechanic: 'qui-suis-je',
  subjectId: s.id,
  theme: s.theme,
  level,
  build: () => ({
    id,
    mechanic: 'qui-suis-je',
    subjectId: s.id,
    theme: s.theme,
    level,
    clues,
    answer: s.name,
    options: shuffle([s.name, ...pickDistractors(s, true)]),
  }),
});

const VISUAL_PROMPT: Record<Theme, string> = {
  flore: 'Quelle est cette plante ?',
  substrats: 'Que vois-tu sur le fond du lagon ?',
  invertebres: 'Quel est cet animal du récif ?',
  'poissons-tortues': 'Quel est cet habitant du lagon ?',
};

const visual = (s: Subject): Template => ({
  id: `vis-${s.id}`,
  mechanic: 'defi-visuel',
  subjectId: s.id,
  theme: s.theme,
  level: 'decouverte',
  build: () => ({
    id: `vis-${s.id}`,
    mechanic: 'defi-visuel',
    subjectId: s.id,
    theme: s.theme,
    level: 'decouverte',
    prompt: VISUAL_PROMPT[s.theme],
    image: s.image!,
    answer: s.name,
    options: shuffle([s.name, ...pickDistractors(s, false)]),
  }),
});

const GOOD = 'Bon signe';
const BAD = 'Mauvais signe';

// Questions écrites à la main (« Diagnostic » et « Qui suis-je ? » personnalisés) : elles se gèrent dans le
// back-office /admin et sont stockées dans Neon. questions.seed.json en est la copie de secours, utilisée tant
// que l'API n'a pas répondu (premier chargement, wifi de l'école coupé) : node scripts/db.mjs export la met à jour.
export interface StoredQuestion {
  id: string;
  mechanic: 'diagnostic' | 'qui-suis-je';
  subjectId: string;
  level: Level;
  prompt: string;
  /** Indices d'un « Qui suis-je ? » (la bonne réponse est alors le nom du sujet). */
  clues: string[] | null;
  answer: string | null;
  /** Mauvaises réponses. Absent = question « Bon signe / Mauvais signe ». */
  wrong: string[] | null;
  explanation: string;
  showImage: boolean;
  /** Photo propre à la question (sinon celle de la fiche du sujet). */
  image: string | null;
}

const stored = (q: StoredQuestion): Template | null => {
  const subject = SUBJECT_BY_ID[q.subjectId];
  if (!subject) return null;
  if (q.mechanic === 'qui-suis-je') return q.clues?.length ? whoAmI(subject, q.clues, q.level, q.id) : null;
  if (!q.answer) return null;
  const answer = q.answer;
  return {
    id: q.id,
    mechanic: 'diagnostic',
    subjectId: q.subjectId,
    theme: subject.theme,
    level: q.level,
    build: () => ({
      id: q.id,
      mechanic: 'diagnostic',
      subjectId: q.subjectId,
      theme: subject.theme,
      level: q.level,
      prompt: q.prompt,
      explanation: q.explanation,
      showImage: q.showImage,
      image: q.image ?? undefined,
      answer,
      // « Bon signe / Mauvais signe » garde toujours le même ordre.
      options: q.wrong?.length ? shuffle([answer, ...q.wrong]) : [GOOD, BAD],
    }),
  };
};

// Questions tirées des fiches (indices et photos) : elles suivent les données de data/ecole/.
const FROM_SUBJECTS: Template[] = [
  ...SUBJECTS.map((s) => whoAmI(s, s.clues, s.theme === 'flore' ? 'decouverte' : 'explorateur')),
  ...SUBJECTS.filter((s) => s.cluesExpert).map((s) => whoAmI(s, s.cluesExpert!, 'explorateur', `qsj-${s.id}-detaille`)),
  ...SUBJECTS.filter((s) => s.image).map(visual),
];

const withStored = (list: StoredQuestion[]): Template[] => [
  ...FROM_SUBJECTS,
  ...list.map(stored).filter((t): t is Template => t !== null),
];

let questionBank: Template[] = withStored(SEED as StoredQuestion[]);

/** Remplace les questions écrites à la main par celles du back-office. */
export function setStoredQuestions(list: StoredQuestion[]) {
  questionBank = withStored(list);
}

const MECHANICS: Mechanic[] = ['qui-suis-je', 'diagnostic', 'defi-visuel'];

/** Vrai quand toutes les questions de la banque ont déjà été réussies : l'historique peut repartir de zéro. */
export function isBankExhausted(history: string[]): boolean {
  return questionBank.every((t) => history.includes(t.id));
}

/**
 * Tirage « intelligent » : alterne les mécaniques, évite les questions et sujets récents.
 * Une question déjà réussie ne revient pas : la partie se termine (collection complète) avant d'épuiser la banque.
 * `history` : questions réussies lors des parties précédentes. Elles passent après celles jamais réussies.
 */
export function drawQuestion(recentQuestions: string[], recentSubjects: string[], mastered: string[], history: string[], lastMechanic: Mechanic | null): Question {
  const order = shuffle(MECHANICS.filter((m) => m !== lastMechanic));
  if (lastMechanic) order.push(lastMechanic);
  const filters: ((t: Template) => boolean)[] = [
    (t) => !history.includes(t.id) && !mastered.includes(t.id) && !recentQuestions.includes(t.id) && !recentSubjects.includes(t.subjectId),
    (t) => !history.includes(t.id) && !mastered.includes(t.id) && !recentQuestions.includes(t.id),
    (t) => !mastered.includes(t.id) && !recentQuestions.includes(t.id) && !recentSubjects.includes(t.subjectId),
    (t) => !mastered.includes(t.id) && !recentQuestions.includes(t.id),
    (t) => !mastered.includes(t.id),
    () => true,
  ];
  for (const keep of filters) {
    for (const mechanic of order) {
      const pool = questionBank.filter((t) => t.mechanic === mechanic && keep(t));
      if (pool.length) return pool[Math.floor(Math.random() * pool.length)].build();
    }
  }
  return questionBank[0].build();
}
