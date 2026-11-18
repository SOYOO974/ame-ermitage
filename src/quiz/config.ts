// Nombre de bonnes réponses nécessaires pour débloquer une carte de la classe.
// V1 (démo) : volontairement rapide. En V2, on débloquera 1 carte par série
// thématique complète (voir les champs `theme` et `level` des questions).
export const GOOD_ANSWERS_PER_CARD_UNLOCK = 3;

// Étoiles gagnées : « Qui suis-je ? » rapporte 3, 2 ou 1 étoile selon le nombre
// d'indices révélés ; les deux autres mécaniques rapportent un forfait.
export const STARS_FLAT = 2;

// Nombre de questions récentes exclues du tirage (pas de répétition immédiate).
export const RECENT_QUESTIONS_MEMORY = 30;
export const RECENT_SUBJECTS_MEMORY = 8;

export const STORAGE_KEY = 'ame_gardiens_lagon_v1';
