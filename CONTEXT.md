# Contexte du Projet — Aire Marine Éducative (AME) de l'Ermitage

## 1. Fiche d'Identité du Projet

* **Projet** : Application & Outil Numérique Éco-Citoyen pour l'Aire Marine Éducative (AME).
* **Établissement & Classe** : Classe de CM2 de **Madame Pavion**, École élémentaire de l'Ermitage-les-Bains (Saint-Gilles-les-Bains / Saint-Paul, La Réunion).
* **Intervenant & Référent Numérique** : **Julien Vanwinsberghe** (SOYOO), parent d'élève d'Antoine (élève de la classe de CM2).
* **Budget alloué par l'école** : **450 €** (enveloppe initiale pour prestation numérique).
* **Cadre institutionnel** :
  * Label officiel **Office Français de la Biodiversité (OFB)**.
  * Accompagnement scientifique et pédagogique : **Réserve Naturelle Marine de La Réunion (RNMR)**.
  * Partenariats : Académie de La Réunion, Ville de Saint-Paul.
* **Zone géographique de l'AME** :
  * Plage et lagon de l'Ermitage-les-Bains, **directement en face du restaurant *Go by Le Cap Méchant*** (Mail de Rodrigues / Rue de la Cheminée).
  * Milieu naturel : récif frangeant (platier, dépression d'arrière-récif) et végétation dunaire littorale sous les filaos.

---

## 2. Enjeux Environnementaux & Scientifiques Ciblés

1. **La flore littorale & dunaire (bouclier anti-érosion)** :
   * *Patate à cordes* (*Ipomoea pes-caprae*) : plante rampante pionnière qui fixe le sable.
   * *Veloutier bord de mer* (*Scaevola taccada*) : arbuste indigène aux fleurs demi-corolles, brise-vent et protecteur du rivage.
   * *Filaos* (*Casuarina equisetifolia*) : apport d'ombre et sous-bois.
   * *Pourpier bord de mer* (*Sesuvium portulacastrum*) : herbe grasse fixatrice.
   * *Herbiers de phanérogames marines* dans le lagon.
2. **La faune marine et le récif corallien** :
   * Coraux branchus (*Acropora*), coraux massifs (*Porites*).
   * Poissons emblématiques : Poissons-clowns dans leurs anémones, Poissons-perroquets (brouteurs et producteurs de sable blanc), Balistes Picasso, Chirurgiens bagnards.
   * Invertébrés nettoyeurs : Holothuries (concombres de mer), oursins diadèmes, bénitiers.
3. **Les menaces humaines à proximité du restaurant Chez Go** :
   * Piétinement du platier corallien à marée basse par les baigneurs.
   * Pollution par les mégots de cigarettes enfouis dans le sable des filaos.
   * Toxicité des crèmes solaires chimiques pour les coraux.
   * Déchets de pique-nique et ruissellements pluviaux des ravines.

---

## 3. Architecture & Choix Techniques

* **Outil de développement** : Conception assistée par IA via **Antigravity**.
* **Site actuel (catalogue des projets + support d'atelier)** : SPA **Vite + React + TypeScript + Tailwind CSS**, dépôt GitHub `SOYOO974/ame-ermitage`, déploiement automatique sur Vercel à chaque push sur `main`.
  * `/` : catalogue des 5 projets (données dans `src/data/ideas.ts`, rédigées pour l'enseignante) + décompte des votes.
  * `/presentation` : diaporama 16/9 de l'atelier (`src/presentation/Presentation.tsx`, textes réécrits pour les CM2).
  * Votes stockés dans le `localStorage` du navigateur (clé `ame_classroom_votes`), partagés entre les deux pages : ils ne sont visibles que sur l'ordinateur où ils ont été saisis.
* **Type d'application à produire (projet élu)** : **PWA (Progressive Web App)** réactive (React + Tailwind CSS).
* **Hébergement & Domaines** :
  * **Hébergement primaire (gratuit)** : **Vercel** (`https://ame-ermitage.vercel.app`).
  * **Piste de nom de domaine personnalisé à proposer** (finançable avec 10-12 € sur l'enveloppe de 450 €) :
    * `gardiensdulagon.re` (ou `gardiens-du-lagon.re`) : Recommandé pour son impact ludique et engageant auprès des enfants et du grand public.
    * `ame-ermitage.re` (ou `.fr`) : Option sobre et institutionnelle.
    * `nout-lagon.re` : Option ancrage péi.
* **Gestion des données** : Supabase (tier gratuit) pour la persistance des scores, quiz ou contributions des élèves.
* **Respect de la vie privée & RGPD** : Zéro collecte de données personnelles sensibles, pas de compte nominatif obligatoire, navigation anonymisée ou par pseudo d'équipe en classe.

---

## 4. Démarche Pédagogique : L'Atelier Découverte d'1 Heure

Atelier animé par Julien avec les 25 élèves de CM2, le **8 octobre 2026**, projeté depuis `https://ame-ermitage.vercel.app/presentation` (14 diapos, flèches / télécommande, `F` plein écran). Principe directeur : intro IA courte, priorité aux projets et au vote, faire parler les enfants le plus possible.

1. **Introduction à l'Intelligence Artificielle (≈ 10-15 min, 4 diapos)** :
   * Devinette « Quel est leur point commun ? » : 6 usages du quotidien révélés un par un (visage qui déverrouille, clavier, GPS, YouTube, assistant vocal, filtre photo) → réponse « l'IA ».
   * Démo en direct avec **Gemini** (seul outil retenu, Suno abandonné) : super-héros du récif construit avec une phrase à trous remplie par les enfants, copiée dans Gemini.
   * Vrai ou faux question par question (vote à main levée, puis réponse « Le savais-tu ? » + règle d'or) : l'IA peut se tromper, les images IA sont indétectables à l'œil, ce qu'on envoie peut être enregistré (message de conscience, pas d'interdiction), cette présentation a été faite avec une IA.
2. **Présentation des 5 projets retenus par Mme Pavion (20 min)** :
   * Une diapo par projet : pitch, « Ce que vous ferez », et une question à la classe pour lancer la discussion.
3. **Le « Conseil des enfants pour la mer » & Vote Démocratique (15 min)** :
   * Critères : utile pour le lagon ? amusant ? faisable cette année ?
   * Vote à suspense : résultats masqués pendant la saisie (touches 1 à 5), révélés du dernier au premier (touche `R`). Vote à bulletin secret conseillé pour éviter l'effet de suivisme.
   * Pendant le vote : lancer une génération Gemini (musique ou vidéo) à dévoiler avec le résultat.
4. **Lancement de la production de contenu (10 min)** :
   * Répartition des rôles dans la classe : illustrateurs, rédacteurs d'énigmes, voix-off enregistrées, reporters photo sur le terrain.

---

## 5. Les 5 Idées Retenues pour le Vote des Élèves

1. **Le « Plantédex » du Lagon (Style Pokémon)** : Cartes collectors de chaque plante avec PV, rareté et super-pouvoirs écologiques *(Investissement : 2 à 3 séances)*.
2. **L'Arène des Gardiens du Récif (Quiz multijoueur)** : Mini-jeu interactif en classe avec questions rédigées par les élèves et tableau des champions *(Investissement : 1 séance Express)*.
3. **Le Baromètre Santé du Littoral** : Tableau de bord citoyen où la classe note l'état du lagon et de la végétation au fil des saisons *(Investissement : 2 à 3 séances)*.
4. **Le Carnet d'Enquête Numérique de l'Élève** : Cahier de bord digital où chaque binôme consigne ses sorties, observations et photos *(Investissement : Fil rouge 4+ séances)*.
5. **Le Sentier Numérique des Écoliers (QR Codes)** : Balises physiques sur la plage renvoyant vers des fiches audio enregistrées par les enfants pour les passants *(Investissement : 2 à 3 séances)*.

*(Le projet « RPG Rétro 2D » ainsi que les pistes « Détecteur Éco-IA », « Carte interactive », « Hymne Suno » et « Guide bilingue » ont été écartés pour concentrer l'énergie des élèves et éviter tout risque de projet trop chronophage).*
