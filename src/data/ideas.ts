export type ClassroomInvestment = '1 séance' | '2 à 3 séances' | 'Fil rouge (4+ séances)';

export interface ProjectIdea {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  category: 'Jeu & Gamification' | 'Science & Terrain' | 'Sensibilisation & Terrain';
  badge: string;
  icon: string;
  imageUrl: string;
  summary: string;
  concept: string;
  pedagogicalValue: string[];
  curriculumLink: string;
  studentContribution: string;
  techImplementation: string;
  classroomInvestment: ClassroomInvestment;
  classroomDetails: string;
  highlightPoints: string[];
}

export const SELECTED_IDEAS: ProjectIdea[] = [
  {
    id: 'plantedex-lagon',
    number: 1,
    title: 'Le « Plantédex » du Lagon',
    subtitle: 'L\'encyclopédie interactive style Pokémon des espèces littorales',
    category: 'Jeu & Gamification',
    badge: 'Super populaire auprès des élèves',
    icon: 'Sparkles',
    imageUrl: '/images/plantedex.jpg',
    summary: 'Chaque plante protégée de l\'AME devient une carte collector avec ses points de vie, son type écologique et ses super-pouvoirs de défense du lagon.',
    concept: 'Inspiré de l\'univers des cartes à collectionner, le Plantédex permet aux élèves de découvrir les plantes littorales (Patate à cordes, Veloutier, Filao, Pourpier...) comme des créatures gardiennes du récif. En répondant à des énigmes ou en explorant le terrain, ils débloquent les cartes animées dans l\'application.',
    pedagogicalValue: [
      'Classification scientifique simplifiée (indigène, endémique, exotique)',
      'Compréhension des interactions écosystémiques (dune / corail / houle)',
      'Valorisation de la mémoire et de la lecture documentaire'
    ],
    curriculumLink: 'Sciences & Technologie Cycle 3 : Le vivant, sa diversité et les fonctions qui le caractérisent.',
    studentContribution: 'Les élèves rédigent les descriptions des "super-pouvoirs", inventent les points de force de chaque plante et peuvent même dessiner les avatars qui seront numérisés.',
    techImplementation: 'Application web responsive animée, système de collection sauvegardé localement (pas besoin de compte élève), effets sonores et visuels soignés. Développement 100% géré par Julien.',
    classroomInvestment: '2 à 3 séances',
    classroomDetails: '2 séances en classe : 1 séance pour inventer les super-pouvoirs et points de vie de chaque plante + 1 séance d\'arts plastiques pour dessiner les cartes.',
    highlightPoints: [
      'Cartes virtuelles avec niveaux de rareté',
      'Fiches d\'identité rigoureuses scientifiquement',
      'Accessible sur tablettes scolaires et smartphones'
    ]
  },
  {
    id: 'arene-gardiens',
    number: 2,
    title: 'L\'Arène des Gardiens du Récif',
    subtitle: 'Le grand quiz interactif multijoueur pour la classe',
    category: 'Jeu & Gamification',
    badge: 'Idéal sur grand écran / TBI',
    icon: 'Trophy',
    imageUrl: '/images/quiz-arene.jpg',
    summary: 'Un jeu de défi type Kahoot sur-mesure, jouable en équipes sur le tableau interactif ou sur tablettes, avec des questions conçues par les élèves.',
    concept: 'L\'application génère des parties de quiz palpitantes avec compte à rebours, jingles et classement en direct. Les équipes s\'affrontent sur la connaissance des plantes, du récif corallien et des bons comportements face au restaurant Chez Go.',
    pedagogicalValue: [
      'Travail d\'équipe et émulation collective positive',
      'Formulation de questions/réponses précises par les élèves',
      'Mémorisation active des notions écologiques clés'
    ],
    curriculumLink: 'Français & Sciences : Écrire pour communiquer, vérifier des connaissances scientifiques.',
    studentContribution: 'Chaque binôme d\'élèves a pour mission de rédiger 2 à 3 questions pièges avec indices et explications, après leurs recherches en classe ou sur le terrain.',
    techImplementation: 'Mode solo ou mode "Tableau de classe" sans installation de logiciel lourd. Base de données Supabase gratuite pour enregistrer les scores. Développement 100% géré par Julien.',
    classroomInvestment: '1 séance',
    classroomDetails: '1 seule séance en classe de 45 min : chaque binôme rédige 2 ou 3 questions avec leurs réponses. Julien les intègre ensuite dans l\'application.',
    highlightPoints: [
      'Mode projection grand écran pour toute la classe',
      'Questions 100% personnalisées à l\'Ermitage',
      'Génération d\'un diplôme de "Gardien du Récif" à imprimer'
    ]
  },
  {
    id: 'barometre-sante',
    number: 3,
    title: 'Le Baromètre Santé du Littoral',
    subtitle: 'Le tableau de bord citoyen et scientifique de la classe',
    category: 'Science & Terrain',
    badge: '100% aligné démarche OFB / AME',
    icon: 'Activity',
    imageUrl: '/images/barometre.jpg',
    summary: 'Un observatoire en ligne où les élèves publient leurs relevés réguliers : santé des coraux, état de floraison des plantes et propreté du sable.',
    concept: 'Les enfants alimentent un tableau de bord moderne affichant des indicateurs visuels (jauges de santé, courbes d\'évolution). Après chaque sortie de terrain, ils saisissent leurs observations : volume de mégots ramassés, présence de floraison, fréquentation humaine.',
    pedagogicalValue: [
      'Initiation à la démarche scientifique et à la collecte de données fiables',
      'Interprétation de graphiques simples et statistiques',
      'Transmission pérenne des données à la classe de l\'année suivante'
    ],
    curriculumLink: 'Mathématiques & Sciences : Traitement de données, graphiques, démarche d\'observation rigoureuse.',
    studentContribution: 'Les élèves assument le rôle de "chercheurs référents" chargés de consigner les observations et de valider les indicateurs de santé.',
    techImplementation: 'Interface d\'administration simplifiée pour la classe, graphiques dynamiques clairs et visuels. Développement 100% géré par Julien.',
    classroomInvestment: '2 à 3 séances',
    classroomDetails: '15 minutes de saisie collective après chaque sortie de terrain (environ 3 relevés dans l\'année pour suivre l\'évolution des saisons).',
    highlightPoints: [
      'Graphiques visuels et colorés faciles à lire',
      'Indicateur météo écologique du lagon',
      'Historique sur toute l\'année scolaire'
    ]
  },
  {
    id: 'carnet-enquete',
    number: 4,
    title: 'Le Carnet d\'Enquête Numérique de l\'Élève',
    subtitle: 'Le cahier de bord digital personnel de chaque écolier',
    category: 'Science & Terrain',
    badge: 'Idéal pour le travail individuel ou en binôme',
    icon: 'BookOpen',
    imageUrl: '/images/carnet-enquete.jpg',
    summary: 'Chaque binôme d\'élèves dispose de son espace en ligne pour enregistrer ses découvertes, ses photos, ses enregistrements audio et ses missions accomplies.',
    concept: 'Remplaçant avantageusement le porte-bloc papier mouillé sur la plage, ce carnet de bord numérique permet aux enfants de consigner leurs observations en direct ou de retour en classe, avec une checklist de missions écologiques à cocher.',
    pedagogicalValue: [
      'Autonomie des élèves et valorisation du travail personnel',
      'Compétences de rédaction et de synthèse d\'informations',
      'Support d\'évaluation formative pour l\'enseignante'
    ],
    curriculumLink: 'Français & Sciences : Écriture réflexive, carnet d\'expériences, compte-rendu de sortie scolaire.',
    studentContribution: 'Chaque élève ou binôme personnalise son profil d\'éco-enquêteur et enrichit son carnet au fil des mois.',
    techImplementation: 'Sauvegarde automatique dans le navigateur, mode hors-ligne partiel pour la plage, export PDF imprimable. Développement 100% géré par Julien.',
    classroomInvestment: 'Fil rouge (4+ séances)',
    classroomDetails: 'Utilisé en continu tout au long de l\'année : 20 à 30 min après chaque sortie scolaire pour archiver les observations et valider les compétences.',
    highlightPoints: [
      'Badges d\'accomplissement à débloquer',
      'Export PDF pour le dossier scolaire de fin d\'année',
      'Zéro papier perdu sur la plage'
    ]
  },
  {
    id: 'sentier-numerique',
    number: 5,
    title: 'Le Sentier Numérique des Écoliers',
    subtitle: 'Les QR codes sur la plage avec audioguide animé par les enfants',
    category: 'Sensibilisation & Terrain',
    badge: 'Impact direct sur les plagistes et touristes',
    icon: 'QrCode',
    imageUrl: '/images/sentier-qr.jpg',
    summary: 'Des petits QR codes discrets installés près des plantes renvoient vers des capsules audio et visuelles enregistrées par les voix des élèves.',
    concept: 'Quand un baigneur ou promeneur scanne la balise devant Chez Go, il entend : « Bonjour ! Je m\'appelle Antoine, j\'ai 10 ans et je suis élève en CM2. Cette plante s\'appelle le Veloutier et elle retient le sable pour protéger le lagon... ». Une manière vivante et touchante de sensibiliser le grand public.',
    pedagogicalValue: [
      'Expression orale, élocution et travail de la voix',
      'Citoyenneté active et prise de parole dans l\'espace public',
      'Lien concret entre l\'école et la vie locale'
    ],
    curriculumLink: 'Français (Langage oral) & EMC : Prendre la parole en public, transmettre un message civique.',
    studentContribution: 'Les élèves écrivent les textes des capsules audio (format court de 30 secondes), s\'entraînent à l\'élocution et enregistrent leur voix.',
    techImplementation: 'Pages web ultra-rapides optimisées pour smartphones avec lecteur audio instantané et visuels explicatifs clairs. Développement 100% géré par Julien.',
    classroomInvestment: '2 à 3 séances',
    classroomDetails: '1 séance d\'écriture des textes courts (30s) + 1 séance d\'enregistrement des voix des enfants + pose des QR codes sur la plage lors d\'une sortie.',
    highlightPoints: [
      'Voix authentiques et touchantes des élèves',
      'Accessible à tous les usagers de la plage sans installer d\'app',
      'Partenariat possible avec le restaurant Chez Go'
    ]
  }
];

export const PROJECT_IDEAS = SELECTED_IDEAS;
