# Projet AME de l'Ermitage — consignes de session

- Contexte complet du projet : `CONTEXT.md` (à lire avant toute évolution).
- Nouveau dessin de carte Pokémon transmis par la classe : suivre **à la lettre** la méthode de `CONTEXT.md` § 7 (même modèle, même gabarit de prompt, même format de sortie), pour que la collection reste harmonieuse.
- Mini-jeu à créer ou à modifier : appliquer les règles de `CONTEXT.md` § 10 (respect des dessins d'élèves, un choix par écran, commandes tactiles au doigt glissé, message porté par la mécanique, boucle de récompense, équilibre mesuré avec un joueur inactif et un pilote automatique avant livraison, cartes de choix illustrées) sans attendre qu'on les redemande.
- Base Neon, photos Vercel Blob et back-office `/admin` : voir `CONTEXT.md` (sections « Gestion des données » et « Back-office des questions »). Il n'y a **qu'une base, celle de la production** : supprimer les questions, comptes et photos de test après chaque essai. Ne jamais afficher ni commiter `.env.local` ni les mots de passe des gestionnaires (le mot de passe créé par `scripts/db.mjs admin` s'affiche seulement dans le terminal de Julien).
- Ne jamais lire ni commiter les photos brutes des élèves (`data/ecole/dessins-cartes-pokemon/`, `data/ecole/cartes-reef-check/`, archives `.zip`).
