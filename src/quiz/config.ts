// Points d'expérience (XP) : un seul score, gagné par les actions d'apprentissage. Les cartes de la classe
// se débloquent à des paliers d'XP cumulés (voir `cardThreshold`). Les étoiles des mini-jeux (0 à 3) restent
// une note de performance, pas un score.
// « Qui suis-je ? » : 30, 20 ou 10 XP selon le nombre d'indices révélés (1, 2 ou 3).
export const XP_WHO = [30, 20, 10];
// « Défi visuel » et « Diagnostic » : forfait.
export const XP_FLAT = 20;
// Série de bonnes réponses d'affilée : bonus à 3, puis tous les 5.
export const XP_STREAK = 10;
export const streakBonus = (streak: number): number => (streak === 3 || (streak > 0 && streak % 5 === 0) ? XP_STREAK : 0);
// Mini-jeux : seulement pour une étoile de record jamais obtenue (rejouer sans progresser ne rapporte rien).
export const XP_PER_GAME_STAR = 30;
// Encyclopédie (à venir) : article maîtrisé = 3 questions liées réussies. Lire seul ne rapporte rien.
export const XP_ARTICLE_MASTERED = 50;

// XP cumulés pour la carte n° `index` + 1 : 50, 120, 200, 290… 1370 pour la 12e, 1550 pour une 13e. La 1re vient vite
// (2 ou 3 bonnes réponses), puis chaque carte coûte 10 XP de plus que la précédente. La courbe se prolonge
// toute seule si la classe ajoute des cartes. Contrainte : une question réussie ne revient plus, le quiz
// (134 questions) plafonne vers 3 000 XP ; garder la dernière carte nettement en dessous.
export const cardThreshold = (index: number): number => (index < 0 ? 0 : 50 + index * 60 + (5 * index * (index + 1)));

// Nombre de questions récentes exclues du tirage (pas de répétition immédiate).
export const RECENT_QUESTIONS_MEMORY = 30;
export const RECENT_SUBJECTS_MEMORY = 8;

// Mini-jeu « La Traversée de la Tortue » : il se débloque quand ce nombre de cartes est gagné.
export const TURTLE_GAME_UNLOCK_AT_CARDS = 3;

// Mini-jeu « La Grande Course du Lagon » : les pilotes sont les cartes gagnées, il en faut quelques-unes pour choisir.
export const RACE_GAME_UNLOCK_AT_CARDS = 5;

// Défi lancé à la classe : un nouveau mini-jeu s'ouvre chaque fois qu'elle transmet ce nombre de nouvelles
// questions pour le quiz. Tant que `RACE_GAME_WAITS_FOR_QUESTIONS` vaut true, « Jouer » affiche le défi au lieu
// de lancer la course (l'enseignant passe avec `DEMO_PASSWORD`). Mettre false dès que les questions sont arrivées.
export const QUESTIONS_PER_NEW_GAME = 20;
export const RACE_GAME_WAITS_FOR_QUESTIONS = true;

// Mini-jeu « La Crue de la Ravine » (prototype du 22/11/2026) : débloqué à la 7e carte, et lui aussi derrière
// le défi des 20 questions tant que `REEF_GAME_WAITS_FOR_QUESTIONS` vaut true.
export const REEF_GAME_UNLOCK_AT_CARDS = 7;
export const REEF_GAME_WAITS_FOR_QUESTIONS = true;

export const STORAGE_KEY = 'ame_gardiens_lagon_v1';

// Temps de jeu par jour (quiz + mini-jeux), compté seulement quand la page est à l'écran et que l'enfant s'en sert.
// Clé de sauvegarde à part : « Réinitialiser la progression » ne remet pas le compteur à zéro.
export const DAILY_PLAY_MINUTES = 30;
export const PLAY_TIME_STORAGE_KEY = 'ame_temps_de_jeu_v1';
// Sans toucher l'écran ni le clavier pendant ce temps, le compteur s'arrête (tablette oubliée allumée).
export const PLAY_TIME_IDLE_SECONDS = 90;
// Avertissements avant la fin (en minutes restantes).
export const PLAY_TIME_WARNINGS = [5, 1];

// Mot de passe protégeant l'accès au Mode Démo / Enseignant en pied de page.
export const DEMO_PASSWORD = 'soyoo';
