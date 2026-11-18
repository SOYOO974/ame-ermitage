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
  * `/` : jeu **Les Gardiens du Lagon** (`src/quiz/`) : quiz à 3 mécaniques + collection des 12 cartes Pokémon de la classe, progression en `localStorage` (clé `ame_gardiens_lagon_v1`), Mode Démo Enseignant en pied de page. Données générées depuis `data/ecole/*.json` par `node scripts/build-quiz-data.mjs` (à relancer après toute correction des JSON, ex. prénoms des élèves).
  * `/projets` : catalogue des 5 projets (données dans `src/data/ideas.ts`, rédigées pour l'enseignante) + décompte des votes.
  * `/presentation` : diaporama 16/9 de l'atelier (`src/presentation/Presentation.tsx`, textes réécrits pour les CM2).
  * Votes stockés dans le `localStorage` du navigateur (clé `ame_classroom_votes`), partagés entre les deux pages : ils ne sont visibles que sur l'ordinateur où ils ont été saisis.
* **Type d'application à produire (projet élu)** : **PWA (Progressive Web App)** réactive (React + Tailwind CSS).
* **Hébergement & Domaines** :
  * **Hébergement primaire (gratuit)** : **Vercel** (`https://ame-ermitage.vercel.app`).
  * **Domaine retenu et acheté (18/11/2026)** : `gardiensdulagon.re`, à renouveler chaque année (les QR codes imprimés dans les cahiers pointent dessus).
  * **Mot à coller dans le cahier de texte** : `python scripts/build-flyer.py` génère `print/flyer-cahier.pdf` (4 mots par A4, QR code aux couleurs du jeu avec l'emblème du lagon, correction d'erreur H).
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

---

## 6. Jeu Hybride Retenu (Quiz du Lagon + Cartes Pokémon de la Classe)

Suite au travail avec Mme Pavion, l'application combine **le Quiz des Gardiens du Récif** et **la Collection de Cartes Pokémon créées par les élèves** (débloquées au fil des bonnes réponses).

### Sources de données préparées dans `data/ecole/`
1. **`data/ecole/cartes-reef-check.json`** *(41 sujets complets)* :
   * **30 sujets d'origine (`origine: "carte_classe"`)** extraits des 60 photos des cartes de l'année précédente (dossier brut `data/ecole/cartes-reef-check/` exclu de Git car 147,5 Mo) : 4 plantes du Jardin de l'AME (2 niveaux chacune), 13 substrats Reef Check (fiche + devinette 3 indices) et 13 animaux bio-indicateurs du lagon (poissons, raies, tortues).
   * **41 photos naturalistes HD (`1200×900`, `.webp`)** dans `public/images/reef-check/*.webp` couvrant 100 % des sujets : 26 vignettes d'origine (`data/ecole/vignettes-reef-check/*.webp`) restaurées en Image-to-Image avec verrou scientifique Reef Check + 15 espèces complémentaires générées à partir de vraies photos taxonomiques de référence (Wikimedia Commons / INPN).
   * **11 compléments clés (`origine: "complement_ame"`)** : *Veloutier bord de mer*, *Filao*, *Pourpier bord de mer*, *Herbier marin*, 5 invertébrés Reef Check (*Holothurie*, *Oursin diadème*, *Bénitier*, *Couronne d'épines Acanthaster*, *Bernard-l'ermite*) et 2 poissons phares (*Poisson-clown de Maurice*, *Baliste Picasso*), + la devinette manquante du *Grégoire*.
2. **`data/ecole/cartes-pokemon-eleves.json`** *(12 créations uniques extraites des 13 photos WhatsApp)* :
   * 7 Pokémon liés au lagon/littoral (*Le Pérrocrasaure*, *L'Assourdine*, *Le Bernard Crocmite*, *Luffy*, *Pêche-heure*, *Bulubul*, *Tortipousse*) et 5 Pokémon d'imagination libre (*Aéroflamme*, *Chauveflamme*, *Flamemèche*, *Cat Lover*, *Flou-flou*).
   * **12 dessins originaux redressés et recadrés** dans `data/ecole/vignettes-pokemon-eleves/*.webp` (310 Ko au total).
   * Cartouche auteur prévu sur chaque carte (`Prénom + 1re lettre du nom`, à compléter avec la liste de Mme Pavion pour les dessins non signés).

### Périmètre V1 (Démo enseignant) vs Feuille de route V2
* **V1 (Démo immédiate sur `/`)** :
  * Accueil principal sur `/` (ancien catalogue de vote déplacé sur `/projets`, diaporama conservé sur `/presentation`).
  * Tirage aléatoire fluide mixant **3 mécaniques** : *« Qui suis-je ? » à 3 indices progressifs*, *Diagnostic Reef Check (bon/mauvais signe)* et *Défi visuel / fiche d'identité*.
  * Déblocage accéléré de cartes Pokémon pour la démo (toutes les 3 bonnes réponses, paramétrable via une constante) + **Mode Démo Enseignant** discret permettant d'afficher toute la collection en 1 clic.
  * Cartes Pokémon collector à effet « waouh » (holographique / animé / sublimé par IA en Image-to-Image fidèle au trait de l'élève, avec possibilité de voir aussi le dessin original et la signature de l'élève).
  * Persistance locale (`localStorage`), zéro compte utilisateur requis en V1.
* **Mini-jeux débloqués par les cartes (`src/quiz/minigames/`)** :
  * *La Traversée de la Tortue* : débloqué à la 3e carte (`TURTLE_GAME_UNLOCK_AT_CARDS`), puis rejouable depuis l'onglet « Jeux ». Canvas 2D sans dépendance ni image. La tortue verte mange algues rouges, herbier et méduses, remonte respirer, évite sacs plastique, bouteilles, bateaux, lignes de pêche et filets. Record (0 à 3 étoiles) dans la même sauvegarde `localStorage`.
  * Faits affichés en fin de partie tirés de Kélonia, Ifremer et la Direction de la mer Sud océan Indien : à faire relire par la RNMR avant diffusion large.
* **V2 (Évolutions prévues)** :
  * Questions enrichies par celles que préparent les élèves de CM2 cette année.
  * **Niveaux de difficulté associés à chaque question** pour ouvrir l'application à d'autres classes (choix du niveau scolaire à l'entrée).
  * **Séries par thématiques** (ex. *Poissons du lagon*, *Coraux & fonds marins*, *Jardin de l'AME*, *Invertébrés*) avec déblocage d'1 carte Pokémon à la fin d'une série complète.
  * **Comptes légers (conformes RGPD scolaire : code classe / pseudo) & Hall of Fame** (classement des meilleurs scores via Supabase).
