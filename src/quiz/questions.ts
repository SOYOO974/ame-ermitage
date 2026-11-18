import { SUBJECTS } from './data.generated';
import type { Level, Mechanic, Question, Subject, Theme } from './types';

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
      !(onClues && conflicts(s.id, subject.id, NEVER_TOGETHER_ON_CLUES)),
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

const whoAmI = (s: Subject, clues: string[], level: Level, suffix = ''): Template => ({
  id: `qsj-${s.id}${suffix}`,
  mechanic: 'qui-suis-je',
  subjectId: s.id,
  theme: s.theme,
  level,
  build: () => ({
    id: `qsj-${s.id}${suffix}`,
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

interface DiagnosticSeed {
  subjectId: string;
  level: Level;
  prompt: string;
  answer: string;
  /** Autres propositions. Absent = question « Bon signe / Mauvais signe ». */
  wrong?: string[];
  explanation: string;
  showImage?: boolean;
}

const DIAGNOSTICS: DiagnosticSeed[] = [
  {
    subjectId: 'demoiselle-noire-gregoire',
    level: 'explorateur',
    prompt: 'En plongée, tu comptes énormément de Demoiselles noires (Grégoires) sur le récif. Bon ou mauvais signe ?',
    answer: BAD,
    explanation: 'Le Grégoire cultive des algues sur le corail mort. Quand il est très nombreux, c’est que le récif est dégradé.',
    showImage: true,
  },
  {
    subjectId: 'poisson-papillon',
    level: 'decouverte',
    prompt: 'Tu observes plusieurs couples de Poissons papillons au-dessus des coraux. Bon ou mauvais signe ?',
    answer: GOOD,
    explanation: 'Le Poisson papillon mange les polypes du corail : s’il est là, c’est qu’il reste des coraux bien vivants.',
    showImage: true,
  },
  {
    subjectId: 'macroalgues-molles',
    level: 'decouverte',
    prompt: 'De grandes algues molles recouvrent presque toutes les roches et les coraux morts. Bon ou mauvais signe ?',
    answer: BAD,
    explanation: 'En petite quantité, les macroalgues nourrissent les poissons herbivores. Très abondantes, elles montrent que le récif va mal.',
    showImage: true,
  },
  {
    subjectId: 'debris-coralliens',
    level: 'decouverte',
    prompt: 'Le fond est couvert de morceaux de corail cassés. Bon ou mauvais signe ?',
    answer: BAD,
    explanation: 'Les débris coralliens témoignent d’un récif endommagé : tempêtes, piétinement ou blanchissement.',
    showImage: true,
  },
  {
    subjectId: 'vase',
    level: 'explorateur',
    prompt: 'Une boue fine et marron se dépose sur les coraux. D’où vient-elle le plus souvent ?',
    answer: 'De la terre, apportée par la pluie',
    wrong: ['Du large, apportée par la houle', 'Des poissons qui broient le corail', 'Des coraux mous qui se décomposent'],
    explanation: 'La vase arrive de la terre avec les pluies et les ravines. Elle trouble l’eau, réduit la lumière et peut étouffer les coraux.',
  },
  {
    subjectId: 'corail-recemment-mort',
    level: 'expert',
    prompt: 'Dans le protocole Reef Check, quel code note-t-on pour un corail récemment mort ?',
    answer: 'CRM',
    wrong: ['COD', 'CMO', 'DEB'],
    explanation: 'CRM = Corail Récemment Mort. COD désigne le corail dur vivant, CMO le corail mou et DEB les débris.',
  },
  {
    subjectId: 'corail-dur-porites',
    level: 'expert',
    prompt: 'Sur une fiche Reef Check, tu lis le code « COD ». De quoi s’agit-il ?',
    answer: 'Un corail dur vivant',
    wrong: ['Un corail mou', 'Des débris coralliens', 'Une éponge'],
    explanation: 'COD = COrail Dur. Branchu, tabulaire, cerveau ou massif : ce sont eux qui construisent le récif.',
  },
  {
    subjectId: 'tortue-imbriquee',
    level: 'expert',
    prompt: 'Quel est le statut de la Tortue imbriquée sur la liste rouge de l’UICN ?',
    answer: 'En danger critique (CR)',
    wrong: ['Préoccupation mineure (LC)', 'Vulnérable (VU)', 'En danger (EN)'],
    explanation: 'C’est l’animal le plus menacé de toutes les cartes de la classe : il ne reste qu’un cran avant « éteint à l’état sauvage ».',
    showImage: true,
  },
  {
    subjectId: 'raie-aigle-tachetee',
    level: 'expert',
    prompt: 'Quel est le statut UICN de la Raie aigle tachetée ?',
    answer: 'En danger (EN)',
    wrong: ['Préoccupation mineure (LC)', 'Vulnérable (VU)', 'En danger critique (CR)'],
    explanation: 'La Raie aigle tachetée est classée « En danger ». Elle a besoin d’un lagon calme et riche pour vivre.',
    showImage: true,
  },
  {
    subjectId: 'merou-tapis',
    level: 'explorateur',
    prompt: 'Tu croises un gros Mérou tapis dans le lagon. Que nous apprend sa présence ?',
    answer: 'La chaîne alimentaire du récif est complète',
    wrong: ['L’eau est trop chaude', 'Il y a trop d’algues', 'Le sable recouvre les coraux'],
    explanation: 'Un grand prédateur ne reste que s’il trouve assez de proies : sa présence montre un récif équilibré.',
    showImage: true,
  },
  {
    subjectId: 'herbier-marin',
    level: 'decouverte',
    prompt: 'Tu survoles une prairie sous-marine dense et bien verte. Bon ou mauvais signe ?',
    answer: GOOD,
    explanation: 'Un herbier dense indique une eau de bonne qualité. Il nourrit la tortue verte et sert de nurserie aux jeunes poissons.',
  },
  {
    subjectId: 'eponge-dysidea',
    level: 'explorateur',
    prompt: 'L’Éponge Dysidea devient très abondante sur une zone du récif. Que faut-il en conclure ?',
    answer: 'L’eau est polluée',
    wrong: ['L’eau est très pure', 'Il manque du sable', 'Les tortues sont revenues'],
    explanation: 'En quantité normale, elle filtre l’eau et tout va bien. Quand elle pullule, c’est le signal d’une eau polluée.',
    showImage: true,
  },
  {
    subjectId: 'poisson-perroquet',
    level: 'decouverte',
    prompt: 'Quel grand service le Poisson perroquet rend-il au lagon ?',
    answer: 'Il broie le corail mort et fabrique du sable',
    wrong: ['Il chasse les requins', 'Il plante des herbiers', 'Il filtre l’eau comme une éponge'],
    explanation: 'Avec son bec, il racle les algues et broie le corail, qu’il rejette en sable blanc. Une partie de la plage vient de lui !',
    showImage: true,
  },
  {
    subjectId: 'acanthaster-couronne-epines',
    level: 'explorateur',
    prompt: 'Tu comptes des dizaines de Couronnes d’épines (Acanthaster) sur le récif. Bon ou mauvais signe ?',
    answer: BAD,
    explanation: 'Cette étoile de mer mange le corail vivant. Quand elle pullule, elle laisse derrière elle des squelettes tout blancs.',
  },
  {
    subjectId: 'oursin-diademe',
    level: 'expert',
    prompt: 'Les Oursins diadèmes sont beaucoup trop nombreux dans une zone. Qu’est-ce que cela signale ?',
    answer: 'Il manque des poissons prédateurs',
    wrong: ['Il y a trop de tortues', 'L’eau est trop froide', 'Le sable est trop propre'],
    explanation: 'En nombre équilibré, l’oursin broute les algues et aide le corail. En surnombre, il montre que ses prédateurs (comme le Baliste) ont disparu.',
  },
  {
    subjectId: 'benitier',
    level: 'decouverte',
    prompt: 'Tu repères plusieurs Bénitiers aux couleurs vives, bien ouverts dans le récif. Bon ou mauvais signe ?',
    answer: GOOD,
    explanation: 'Le Bénitier a besoin d’une eau claire et de lumière. Sa présence montre aussi que le récif est protégé du braconnage.',
  },
  {
    subjectId: 'corail-mou',
    level: 'explorateur',
    prompt: 'Le corail mou prend peu à peu toute la place du corail dur. Bon ou mauvais signe ?',
    answer: BAD,
    explanation: 'Le corail mou abrite de petits animaux, mais il ne construit pas le récif. S’il remplace le corail dur, le récif s’affaiblit.',
    showImage: true,
  },
  {
    subjectId: 'sable',
    level: 'explorateur',
    prompt: 'Le sable se met à recouvrir les coraux vivants. Bon ou mauvais signe ?',
    answer: BAD,
    explanation: 'Le sable est normal dans les zones sableuses du lagon, où vivent des animaux enfouis. Mais s’il recouvre le récif, il étouffe les coraux.',
    showImage: true,
  },
  {
    subjectId: 'holothurie-concombre-de-mer',
    level: 'decouverte',
    prompt: 'Pourquoi surnomme-t-on l’Holothurie « l’aspirateur du lagon » ?',
    answer: 'Elle avale le sable sale et le rejette propre',
    wrong: ['Elle aspire les petits poissons', 'Elle fait du bruit sous l’eau', 'Elle avale les coraux cassés'],
    explanation: 'Elle digère les débris mélangés au sable et rejette du sable nettoyé. Il ne faut ni la ramasser ni la sortir de l’eau.',
  },
  {
    subjectId: 'bernard-l-ermite',
    level: 'decouverte',
    prompt: 'Pourquoi faut-il laisser les coquillages vides sur la plage de l’Ermitage ?',
    answer: 'Ils servent de maison au Bernard-l’ermite',
    wrong: ['Ils retiennent les vagues', 'Ils nourrissent les tortues', 'Ils fabriquent du sable en une nuit'],
    explanation: 'Le Bernard-l’ermite protège son ventre mou dans une coquille empruntée, et doit en changer pour grandir.',
  },
  {
    subjectId: 'demoiselle-a-trois-bandes',
    level: 'explorateur',
    prompt: 'Un petit groupe de Demoiselles à trois bandes se cache entre des branches de corail. Que peut-on en déduire ?',
    answer: 'Les coraux branchus sont vivants',
    wrong: ['Le récif est envahi par les algues', 'L’eau est polluée', 'Il n’y a plus de plancton'],
    explanation: 'Cette demoiselle vit uniquement dans les coraux branchus en bonne santé : c’est sa maison et son abri.',
    showImage: true,
  },
  {
    subjectId: 'corail-dur-acropora',
    level: 'decouverte',
    prompt: 'Les branches d’un corail Acropora deviennent toutes blanches. Bon ou mauvais signe ?',
    answer: BAD,
    explanation: 'Un corail qui blanchit est stressé, souvent par une eau trop chaude. De nombreuses branches colorées, c’est au contraire un très bon signe.',
    showImage: true,
  },
  {
    subjectId: 'veloutier-bord-de-mer',
    level: 'explorateur',
    prompt: 'À quoi sert le Veloutier bord de mer en haut de la plage ?',
    answer: 'Il freine l’érosion du sable',
    wrong: ['Il nourrit les tortues vertes', 'Il fabrique du sable blanc', 'Il filtre l’eau du lagon'],
    explanation: 'Cet arbuste indigène coupe le vent et retient le sable de la dune face à la houle : un vrai bouclier pour la plage.',
  },
  {
    subjectId: 'patate-a-durand',
    level: 'decouverte',
    prompt: 'Les longues tiges de la Patate à Durand courent sur la plage. À quoi servent-elles ?',
    answer: 'Elles retiennent le sable',
    wrong: ['Elles attrapent les crabes', 'Elles boivent l’eau de mer', 'Elles font de l’ombre aux baigneurs'],
    explanation: 'C’est une plante pionnière : en s’étalant, elle fixe le sable et protège le rivage. Il faut éviter de la piétiner.',
  },
  {
    subjectId: 'filao',
    level: 'expert',
    prompt: 'Le Filao donne de l’ombre, mais il a un défaut pour le jardin de l’AME. Lequel ?',
    answer: 'Son tapis d’aiguilles gêne les plantes indigènes',
    wrong: ['Ses racines mangent le corail', 'Il attire les Couronnes d’épines', 'Il boit toute l’eau du lagon'],
    explanation: 'Arrivé d’Australie, le Filao couvre le sol d’un tapis épais d’aiguilles où les plantes indigènes ont du mal à pousser.',
  },
  {
    subjectId: 'chirurgien-bagnard',
    level: 'explorateur',
    prompt: 'Un banc de Chirurgiens bagnards broute sur le récif. Que nous indique leur présence ?',
    answer: 'Un bon équilibre entre les algues et le récif',
    wrong: ['Une eau trop chaude', 'Un récif cassé par la houle', 'Un manque de sable'],
    explanation: 'En mangeant les algues, ils les empêchent d’envahir les coraux. Ce sont les jardiniers du récif.',
    showImage: true,
  },
  {
    subjectId: 'raie-fouet',
    level: 'explorateur',
    prompt: 'Une Raie fouet se repose sur le fond. Que nous apprend-elle sur le lagon ?',
    answer: 'Les fonds sableux sont en bon état',
    wrong: ['Les coraux blanchissent', 'L’eau est boueuse', 'Les algues ont tout envahi'],
    explanation: 'La Raie fouet cherche coquillages et crustacés dans le sable : elle a besoin de fonds sableux bien préservés.',
    showImage: true,
  },
  {
    subjectId: 'tortue-verte',
    level: 'decouverte',
    prompt: 'Une Tortue verte vient régulièrement brouter dans le lagon. Que nous indique-t-elle ?',
    answer: 'Les herbiers sont en bon état',
    wrong: ['Il y a beaucoup d’éponges', 'Le corail est mort', 'L’eau est trop salée'],
    explanation: 'La Tortue verte se nourrit d’herbiers marins, très sensibles à la pollution. La voir manger ici est donc une bonne nouvelle.',
    showImage: true,
  },
  {
    subjectId: 'murene-etoilee',
    level: 'explorateur',
    prompt: 'Une Murène étoilée dépasse d’un trou dans le corail. Bon ou mauvais signe ?',
    answer: GOOD,
    explanation: 'La murène a besoin de cachettes : sa présence montre un récif vivant, plein de trous et de recoins.',
    showImage: true,
  },
  {
    subjectId: 'algues-sur-coraux-morts',
    level: 'expert',
    prompt: 'Quel poisson aide le plus le récif en broutant les algues qui poussent sur le corail mort ?',
    answer: 'Le Chirurgien bagnard',
    wrong: ['Le Mérou tapis', 'La Murène étoilée', 'La Raie aigle tachetée'],
    explanation: 'Les herbivores comme le Chirurgien bagnard et le Poisson perroquet empêchent les algues de prendre toute la place.',
    showImage: true,
  },
];

const diagnostic = (d: DiagnosticSeed, index: number): Template => {
  const subject = SUBJECT_BY_ID[d.subjectId];
  const id = `diag-${String(index + 1).padStart(2, '0')}-${d.subjectId}`;
  return {
    id,
    mechanic: 'diagnostic',
    subjectId: d.subjectId,
    theme: subject.theme,
    level: d.level,
    build: () => ({
      id,
      mechanic: 'diagnostic',
      subjectId: d.subjectId,
      theme: subject.theme,
      level: d.level,
      prompt: d.prompt,
      explanation: d.explanation,
      showImage: d.showImage,
      answer: d.answer,
      // « Bon signe / Mauvais signe » garde toujours le même ordre.
      options: d.wrong ? shuffle([d.answer, ...d.wrong]) : [GOOD, BAD],
    }),
  };
};

export const QUESTION_BANK: Template[] = [
  ...SUBJECTS.map((s) => whoAmI(s, s.clues, s.theme === 'flore' ? 'decouverte' : 'explorateur')),
  ...SUBJECTS.filter((s) => s.cluesExpert).map((s) => whoAmI(s, s.cluesExpert!, 'explorateur', '-detaille')),
  ...SUBJECTS.filter((s) => s.image).map(visual),
  ...DIAGNOSTICS.map(diagnostic),
];

const MECHANICS: Mechanic[] = ['qui-suis-je', 'diagnostic', 'defi-visuel'];

/** Tirage « intelligent » : alterne les mécaniques, évite les questions et sujets récents. */
export function drawQuestion(recentQuestions: string[], recentSubjects: string[], lastMechanic: Mechanic | null): Question {
  const order = shuffle(MECHANICS.filter((m) => m !== lastMechanic));
  if (lastMechanic) order.push(lastMechanic);
  const filters: ((t: Template) => boolean)[] = [
    (t) => !recentQuestions.includes(t.id) && !recentSubjects.includes(t.subjectId),
    (t) => !recentQuestions.includes(t.id),
    () => true,
  ];
  for (const keep of filters) {
    for (const mechanic of order) {
      const pool = QUESTION_BANK.filter((t) => t.mechanic === mechanic && keep(t));
      if (pool.length) return pool[Math.floor(Math.random() * pool.length)].build();
    }
  }
  return QUESTION_BANK[0].build();
}
