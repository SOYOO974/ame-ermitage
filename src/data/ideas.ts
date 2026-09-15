export type ClassroomInvestment = '1 séance' | '2 à 3 séances' | 'Fil rouge (4+ séances)';

export interface ProjectIdea {
  id: string;
  title: string;
  subtitle: string;
  category: 'Jeu & Gamification' | 'IA & Détection' | 'Science & Terrain' | 'Sensibilisation & Création';
  badge: string;
  icon: string;
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

export const PROJECT_IDEAS: ProjectIdea[] = [
  {
    id: 'plantedex-lagon',
    title: 'Le « Plantédex » du Lagon',
    subtitle: 'L\'encyclopédie interactive style Pokémon des espèces littorales',
    category: 'Jeu & Gamification',
    badge: 'Super populaire auprès des 9-11 ans',
    icon: 'Sparkles',
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
    title: 'L\'Arène des Gardiens du Récif',
    subtitle: 'Le grand quiz interactif multijoueur pour la classe',
    category: 'Jeu & Gamification',
    badge: 'Idéal sur grand écran / TBI',
    icon: 'Trophy',
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
    id: 'rpg-retro-2d',
    title: 'RPG Rétro 2D : « Mission Lagon Protégé »',
    subtitle: 'Le mini-jeu d\'aventure arcade en pixel art',
    category: 'Jeu & Gamification',
    badge: 'Effet "Wouah" garanti',
    icon: 'Gamepad2',
    summary: 'Un jeu vidéo rétro jouable dans le navigateur où un petit écolier doit replanter la dune pour stopper l\'érosion et ramasser les mégots avant la marée.',
    concept: 'Dans la peau d\'un gardien de l\'Ermitage, le joueur explore une carte vue du dessus reproduisant fidèlement la plage devant Chez Go. Il doit planter des patates à cordes pour fixer le sable menacé par les vagues, tout en sensibilisant les baigneurs distraits.',
    pedagogicalValue: [
      'Modélisation concrète du rôle de la végétation contre l\'érosion marine',
      'Sensibilisation ludique à l\'impact des déchets et du piétinement',
      'Découverte des principes de logique d\'un jeu vidéo'
    ],
    curriculumLink: 'Mathématiques & EDD : Repérage dans l\'espace, logique, citoyenneté environnementale.',
    studentContribution: 'Les élèves définissent le scénario, les obstacles (ex: mégots, touristes distraits, vent fort) et les dialogues des personnages rencontrés.',
    techImplementation: 'Moteur de mini-jeu HTML5 / Canvas ultra-léger, fluide sur smartphone et ordinateur, rétro-compatible et instantané au chargement. Développement 100% géré par Julien.',
    classroomInvestment: 'Fil rouge (4+ séances)',
    classroomDetails: 'Projet fil rouge réparti sur plusieurs mois : les élèves écrivent les quêtes, imaginent les dialogues des personnages et testent les niveaux au fur et à mesure.',
    highlightPoints: [
      'Reproduction stylisée de la plage de l\'Ermitage',
      'Gameplay simple à une touche ou flèches directionnelles',
      'Message environnemental fort au cœur du jeu'
    ]
  },
  {
    id: 'detecteur-eco-ia',
    title: 'Le Détecteur Éco-IA (Scanner Photo)',
    subtitle: 'L\'application smartphone qui identifie la flore en un clic',
    category: 'IA & Détection',
    badge: 'Démonstration technologique concrète',
    icon: 'ScanLine',
    summary: 'L\'élève ou le visiteur prend en photo une plante du littoral avec son téléphone : l\'IA l\'analyse et affiche immédiatement sa fiche d\'identité.',
    concept: 'Une interface épurée avec un viseur photo intelligent. En cadrant une feuille ou une fleur, l\'IA reconnaît l\'espèce parmi les plantes de l\'AME et donne son statut : plante indigène protectrice, endémique rare ou plante envahissante à surveiller.',
    pedagogicalValue: [
      'Éducation aux médias et à l\'intelligence artificielle (démystifier la vision par ordinateur)',
      'Démarche d\'investigation scientifique sur le terrain',
      'Observation fine des critères morphologiques des feuilles et fleurs'
    ],
    curriculumLink: 'Sciences & Éducation aux Médias et à l\'Information (EMI) : Observer le monde vivant, comprendre les outils numériques actuels.',
    studentContribution: 'Les élèves constituent eux-mêmes la banque d\'images d\'entraînement lors d\'une sortie photo sur la plage, en photographiant les plantes sous plusieurs angles.',
    techImplementation: 'Reconnaissance d\'image optimisée par IA, fonctionne directement via le navigateur web mobile sans télécharger d\'application. Développement 100% géré par Julien.',
    classroomInvestment: '2 à 3 séances',
    classroomDetails: '1 sortie terrain pour photographier les plantes + 1 séance en classe pour trier les photos et tester la reconnaissance sur l\'application.',
    highlightPoints: [
      'Fonctionne sur n\'importe quel smartphone',
      'Diagnostic immédiat avec conseils de préservation',
      'Comparaison intelligente photo réelle vs modèle'
    ]
  },
  {
    id: 'carte-interactive',
    title: 'La Carte Interactive des Trésors Végétaux',
    subtitle: 'Le plan satellite exploratoire de la zone Chez Go',
    category: 'Science & Terrain',
    badge: 'Rendu très officiel et valorisant',
    icon: 'MapPin',
    summary: 'Une carte aérienne interactive de la plage et du lagon où chaque bosquet de végétation et chaque patate de corail remarquables sont répertoriés.',
    concept: 'À la manière d\'un Google Earth pédagogique centré sur l\'AME, la carte permet de zoomer sur le littoral devant Chez Go. En cliquant sur un point d\'intérêt, une fenêtre s\'ouvre avec les photos, les mesures et les anecdotes documentées par la classe.',
    pedagogicalValue: [
      'Lecture de cartes géographiques, échelles et coordonnées',
      'Vision globale de l\'organisation spatiale du littoral réunionnais',
      'Mise en valeur publique du travail de recensement de la classe'
    ],
    curriculumLink: 'Géographie & Sciences : Se repérer dans l\'espace, identifier les paysages littoraux et leur aménagement.',
    studentContribution: 'Les élèves effectuent le repérage des plantes remarquables lors d\'une sortie et rédigent les textes descriptifs des points d\'intérêt.',
    techImplementation: 'Fond de carte satellite haute définition (OpenStreetMap / Leaflet), marqueurs personnalisés avec filtres. Développement 100% géré par Julien.',
    classroomInvestment: '2 à 3 séances',
    classroomDetails: '1 sortie de repérage des plantes remarquables devant Chez Go + 1 séance de rédaction des textes explicatifs et légendes de la carte.',
    highlightPoints: [
      'Vue aérienne immersive de l\'Ermitage',
      'Possibilité de comparer les photos au fil des saisons',
      'Partageable facilement avec les parents et la mairie'
    ]
  },
  {
    id: 'barometre-sante',
    title: 'Le Baromètre Santé du Littoral',
    subtitle: 'Le tableau de bord citoyen et scientifique de la classe',
    category: 'Science & Terrain',
    badge: '100% aligné démarche OFB / AME',
    icon: 'Activity',
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
    title: 'Le Carnet d\'Enquête Numérique de l\'Élève',
    subtitle: 'Le cahier de bord digital personnel de chaque écolier',
    category: 'Science & Terrain',
    badge: 'Idéal pour le travail individuel ou en binôme',
    icon: 'BookOpen',
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
    title: 'Le Sentier Numérique des Écoliers',
    subtitle: 'Les QR codes sur la plage avec audioguide animé par les enfants',
    category: 'Sensibilisation & Création',
    badge: 'Impact direct sur les plagistes et touristes',
    icon: 'QrCode',
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
  },
  {
    id: 'hymne-ame-suno',
    title: 'L\'Hymne de l\'AME (Co-création musicale via Suno)',
    subtitle: 'La chanson officielle de la classe créée avec l\'IA musicale',
    category: 'Sensibilisation & Création',
    badge: 'Moment mémorable de l\'atelier d\'1 heure',
    icon: 'Music',
    summary: 'La classe écrit les paroles d\'un séga ou maloya engagé, et l\'intelligence artificielle Suno génère en direct une vraie chanson professionnelle.',
    concept: 'Lors de l\'atelier en classe, les élèves trouvent des rimes sur la protection du corail et des plantes littorales. Julien injecte les paroles dans Suno en direct pour produire la musique. Le morceau devient l\'habillage sonore officiel de l\'application et de leurs présentations.',
    pedagogicalValue: [
      'Sensibilisation à la poésie, aux rimes et au rythme',
      'Découverte concrète et stimulante de l\'IA générative audio',
      'Création d\'une fierté collective et d\'un esprit de groupe très fort'
    ],
    curriculumLink: 'Éducation musicale & Français : Écriture poétique, rythme musical, culture musicale de La Réunion.',
    studentContribution: 'Les enfants composent le refrain et les couplets, choisissent le style musical (séga entraînant, maloya ou pop acoustique).',
    techImplementation: 'Intégration d\'un lecteur audio stylisé dans l\'application web avec paroles synchronisées (karaoké) pour chanter en classe. Réalisable immédiatement pendant l\'atelier.',
    classroomInvestment: '1 séance',
    classroomDetails: 'Réalisé directement pendant l\'atelier d\'1 heure ! Les enfants écrivent les rimes, la musique est générée en direct et intégrée sur le site.',
    highlightPoints: [
      'Démonstration d\'IA la plus spectaculaire en direct pour les enfants',
      'Chanson personnalisée avec le nom de l\'école et de la classe',
      'Mode karaoké disponible sur l\'appli'
    ]
  },
  {
    id: 'guide-bilingue-creole',
    title: 'Le Guide Bilingue Français / Créole',
    subtitle: 'La valorisation du patrimoine péi et de la culture créole',
    category: 'Sensibilisation & Création',
    badge: 'Ancrage culturel et linguistique fort',
    icon: 'Languages',
    summary: 'Une application qui présente chaque espèce avec son nom créole, son histoire dans les traditions de l\'île et des proverbes péi associés.',
    concept: 'Parce que les plantes littorales et les poissons font partie intégrante du patrimoine réunionnais (Kozé kréol), l\'application permet de basculer en un clic entre le français et le créole, avec des boutons audio pour écouter la prononciation authentique.',
    pedagogicalValue: [
      'Reconnaissance et valorisation de la langue et de la culture créoles',
      'Enquête intergénérationnelle auprès des parents et grands-parents',
      'Ouverture linguistique et travail sur la traduction'
    ],
    curriculumLink: 'Langue et culture régionales (LCR) & Français : Enrichissement du vocabulaire, comparaison des langues.',
    studentContribution: 'Les enfants interviewent leurs familles pour collecter les noms créoles anciens, les usages traditionnels et enregistrent les voix créoles.',
    techImplementation: 'Sélecteur de langue instantané (FR / Kréol), lecteur d\'échantillons sonores natif sans temps de chargement. Développement 100% géré par Julien.',
    classroomInvestment: '2 à 3 séances',
    classroomDetails: '1 travail à la maison d\'enquête auprès des familles + 1 séance en classe pour enregistrer les prononciations audio en créole.',
    highlightPoints: [
      'Bouton de bascule immédiate Français / Créole',
      'Anecdotes culturelles et remèdes lontan associés',
      'Projet très apprécié des familles réunionnaises'
    ]
  }
];
