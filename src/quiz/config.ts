// Nombre de bonnes réponses nécessaires pour débloquer une carte de la classe.
// V1 (démo) : volontairement rapide. En V2, on débloquera 1 carte par série
// thématique complète (voir les champs `theme` et `level` des questions).
export const GOOD_ANSWERS_PER_CARD_UNLOCK = 3;

// Étoiles gagnées : « Qui suis-je ? » rapporte 3, 2 ou 1 étoile selon le nombre
// d'indices révélés ; les deux autres mécaniques rapportent un forfait.
export const STARS_FLAT = 2;

// Série de bonnes réponses d'affilée : 1 étoile bonus à 3, puis tous les 5.
export const streakBonus = (streak: number): number => (streak === 3 || (streak > 0 && streak % 5 === 0) ? 1 : 0);

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

export const STORAGE_KEY = 'ame_gardiens_lagon_v1';

// Mot de passe protégeant l'accès au Mode Démo / Enseignant en pied de page.
export const DEMO_PASSWORD = 'soyoo';
