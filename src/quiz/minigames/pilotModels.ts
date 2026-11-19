// Personnages des cartes modélisés en 3D (fichiers public/models/pilotes/<id>.glb).
// La valeur est la rotation, en radians, qui fait regarder le modèle vers l'avant du bolide.
// Une carte absente de cette liste roule avec sa pastille illustrée dans une bulle.
// Méthode de fabrication d'un modèle : CONTEXT.md § 8.
export const PILOT_MODELS: Record<string, number> = {
  perrocrasaure: 0,
  'bernard-crocmite': 0,
  'peche-heure': 0,
};

export const pilotModel = (id: string) => (id in PILOT_MODELS ? { model: `/models/pilotes/${id}.glb`, modelYaw: PILOT_MODELS[id] } : { model: null, modelYaw: 0 });
