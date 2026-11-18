// Génère src/quiz/data.generated.ts à partir des deux JSON de data/ecole/.
// À relancer (node scripts/build-quiz-data.mjs) dès que Mme Pavion complète
// les prénoms / initiales ou qu'une fiche Reef Check est corrigée.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const root = new URL('..', import.meta.url);
const read = (p) => JSON.parse(readFileSync(new URL(p, root), 'utf8'));
const reef = read('data/ecole/cartes-reef-check.json');
const pokemon = read('data/ecole/cartes-pokemon-eleves.json');

const img = (id) =>
  existsSync(new URL(`public/images/reef-check/${id}.webp`, root)) ? `/images/reef-check/${id}.webp` : null;

// Libellés de réponse courts et sans ambiguïté (anti-pièges pédagogiques).
const NAME = {
  eponge: 'Éponge tubulaire',
  'eponge-dysidea': 'Éponge Dysidea',
  'corail-dur-acropora': 'Corail dur branchu (Acropora)',
  'corail-dur-acropora-tabulaire': 'Corail dur tabulaire',
  'corail-dur-cerveau': 'Corail dur cerveau',
  'corail-dur-porites': 'Corail dur massif (Porites)',
  'herbier-marin': 'Herbier marin',
  'demoiselle-noire-gregoire': 'Demoiselle noire (Grégoire)',
  'acanthaster-couronne-epines': "Couronne d'épines (Acanthaster)",
  'holothurie-concombre-de-mer': 'Holothurie (concombre de mer)',
  'poisson-clown': 'Poisson-clown de Maurice',
};

// Familles de ressemblance : sert à choisir des distracteurs crédibles.
const GROUP = {
  'corail-dur-acropora': 'corail', 'corail-dur-acropora-tabulaire': 'corail', 'corail-dur-cerveau': 'corail',
  'corail-dur-porites': 'corail', 'corail-mou': 'corail', 'corail-recemment-mort': 'corail',
  'algues-sur-coraux-morts': 'algue', 'macroalgues-molles': 'algue', 'herbier-marin': 'algue',
  eponge: 'eponge', 'eponge-dysidea': 'eponge',
  'debris-coralliens': 'inerte', sable: 'inerte', vase: 'inerte',
};

// Rôle des 4 plantes des cartes de la classe (les fiches ne contenaient que des devinettes).
const FLORE_ROLE = {
  'raisin-bord-de-mer':
    'Arbre du bord de mer qui supporte très bien le vent et le sel. Ses grandes feuilles rondes font de l’ombre et ses grappes de fruits deviennent violettes en mûrissant.',
  'patate-a-durand':
    'Plante rampante pionnière : ses longues tiges courent sur la plage et retiennent le sable, ce qui protège le rivage de l’érosion.',
  porcher:
    'Arbre du littoral de la famille de l’hibiscus, aux feuilles en forme de cœur. Il apporte de l’ombre et abrite la petite faune du bord de mer.',
  'liane-cochon':
    'Plante rampante qui résiste au sel, au vent et à la sécheresse. Elle couvre le sable et aide à le maintenir en place.',
};

const subjects = [];

for (const f of reef.flore_jardin_ame) {
  const simple = f.variantes_devinettes.find((v) => v.niveau === 'simple');
  const detail = f.variantes_devinettes.find((v) => v.niveau === 'detaille');
  subjects.push({
    id: f.id,
    name: NAME[f.id] ?? f.nom.replace(/^(Le|La|Les|L')\s*/i, ''),
    theme: 'flore',
    group: 'plante',
    origin: f.origine,
    scientific: f.nom_scientifique_reference ?? null,
    otherNames: f.autres_noms_locaux ?? [],
    reefCode: null,
    uicn: null,
    sense: 'positif',
    role: f.role_ecologique ?? FLORE_ROLE[f.id],
    positive: null,
    negative: null,
    clues: simple.indices.slice(0, 3),
    cluesExpert: detail ? detail.indices.slice(-3) : null,
    image: img(f.id),
  });
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

for (const s of reef.reef_check_substrats) {
  subjects.push({
    id: s.id,
    name: NAME[s.id] ?? s.nom_fiche,
    theme: 'substrats',
    group: GROUP[s.id],
    origin: s.origine,
    scientific: s.nom_scientifique,
    otherNames: [],
    reefCode: s.code_reefcheck,
    uicn: null,
    sense: s.bio_indicateurs.positif ? 'equilibre' : 'negatif',
    role: `${cap(s.caracteristiques.type)}. ${cap(s.caracteristiques.role_ecosysteme)}.`,
    positive: s.bio_indicateurs.positif,
    negative: s.bio_indicateurs.negatif,
    clues: s.devinette.indices,
    cluesExpert: null,
    image: img(s.id),
  });
}

const fauna = (list, theme) => {
  for (const a of list) {
    const group = theme === 'invertebres' ? 'invertebre' : a.groupe === 'Poisson' ? 'poisson' : a.groupe === 'Raie' ? 'raie' : 'tortue';
    subjects.push({
      id: a.id,
      name: NAME[a.id] ?? a.nom_fiche,
      theme,
      group,
      origin: a.origine,
      scientific: a.nom_scientifique,
      otherNames: a.autres_noms_locaux ?? [],
      reefCode: null,
      uicn: { code: a.statut_uicn.code, label: a.statut_uicn.libelle_carte },
      sense: a.sens_bio_indicateur,
      role: `${a.bio_indicateur}. Régime : ${a.caracteristiques.regime_alimentaire}.`,
      positive: null,
      negative: null,
      clues: a.devinette.indices,
      cluesExpert: null,
      image: img(a.id),
    });
  }
};
fauna(reef.reef_check_faune, 'poissons-tortues');
fauna(reef.reef_check_invertebres, 'invertebres');

const cards = pokemon.cartes_pokemon.map((c) => ({
  id: c.id,
  number: c.numero_collection,
  name: c.nom,
  firstName: c.prenom_eleve,
  lastInitial: c.initiale_nom_eleve,
  lagoon: c.lien_ame_lagon,
  inspiredBy: c.espece_inspiree,
  types: c.types,
  habitat: c.habitat,
  rarity: c.rarete_suggeree,
  hp: c.pv_suggeres,
  description: c.description_eleve,
  attacks: c.attaques.map((a) => ({ name: a.nom, damage: a.degats_suggeres, effect: a.effet })),
  art: `/images/pokemon-ia/${c.id}.webp`,
  original: `/images/pokemon-originaux/${c.id}.webp`,
}));

const out = `// FICHIER GÉNÉRÉ par scripts/build-quiz-data.mjs — ne pas modifier à la main.
import type { Subject, PokemonCardData } from './types';

export const SUBJECTS: Subject[] = ${JSON.stringify(subjects, null, 2)};

export const POKEMON_CARDS: PokemonCardData[] = ${JSON.stringify(cards, null, 2)};
`;
writeFileSync(new URL('src/quiz/data.generated.ts', root), out);
console.log(`${subjects.length} sujets, ${cards.length} cartes, ${subjects.filter((s) => s.image).length} photos`);
