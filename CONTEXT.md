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
  * `/` : jeu **Les Gardiens du Lagon** (`src/quiz/`) : quiz à 3 mécaniques + collection des 12 cartes Pokémon de la classe, progression en `localStorage` (clé `ame_gardiens_lagon_v1`), Mode Démo Enseignant en pied de page (protégé par le mot de passe `soyoo`). Données générées depuis `data/ecole/*.json` par `node scripts/build-quiz-data.mjs` (à relancer après toute correction des JSON, ex. prénoms des élèves).
  * `/projets` : catalogue des 5 projets (données dans `src/data/ideas.ts`, rédigées pour l'enseignante) + décompte des votes.
  * `/presentation` : diaporama 16/9 de l'atelier (`src/presentation/Presentation.tsx`, textes réécrits pour les CM2).
  * Votes stockés dans le `localStorage` du navigateur (clé `ame_classroom_votes`), partagés entre les deux pages : ils ne sont visibles que sur l'ordinateur où ils ont été saisis.
* **Type d'application à produire (projet élu)** : **PWA (Progressive Web App)** réactive (React + Tailwind CSS).
* **Hébergement & Domaines** :
  * **Hébergement primaire (gratuit)** : **Vercel** (`https://ame-ermitage.vercel.app`).
  * **Domaine retenu et acheté (18/11/2026)** : `gardiensdulagon.re`, à renouveler chaque année (les QR codes imprimés dans les cahiers pointent dessus ; redirection 308 automatique de `www.gardiensdulagon.re` vers `gardiensdulagon.re` dans `vercel.json` pour unifier le `localStorage`).
  * **Mot à coller dans le cahier de texte** : `python scripts/build-flyer.py` génère `print/flyer-cahier.pdf` (4 mots par A4, QR code aux couleurs du jeu avec l'emblème du lagon, correction d'erreur H).
  * **Piste de nom de domaine personnalisé à proposer** (finançable avec 10-12 € sur l'enveloppe de 450 €) :
    * `gardiensdulagon.re` (ou `gardiens-du-lagon.re`) : Recommandé pour son impact ludique et engageant auprès des enfants et du grand public.
    * `ame-ermitage.re` (ou `.fr`) : Option sobre et institutionnelle.
    * `nout-lagon.re` : Option ancrage péi.
* **Gestion des données** : Postgres **Neon** (offre gratuite, région Francfort `aws-eu-central-1`) ajouté depuis Vercel → Storage, et **Vercel Blob** (stockage public `ame-ermitage-photos`, Paris) pour les photos. Décision du 22/11/2026 : Neon plutôt que Supabase, dont l'offre gratuite met un projet en pause après 7 jours sans activité (vacances scolaires) et dont la connexion par e-mail ne convient pas à des élèves. Variables (`DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, `AUTH_SECRET`) gérées par Vercel ; copie locale `npx vercel env pull .env.local` (jamais commitée).
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
   * 7 Pokémon liés au lagon/littoral (*Le Pérrocrasaure*, *L'Assourdine*, *Le Bernard Crocmite*, *Luffy*, *Pêche-heure*, *Bulubul*, *Torti*) et 5 Pokémon d'imagination libre (*Aéroflamme*, *Chauveflamme*, *Flamemèche*, *Cat Lover*, *Flou-flou*).
   * **12 dessins originaux redressés et recadrés** dans `data/ecole/vignettes-pokemon-eleves/*.webp` (310 Ko au total).
   * Cartouche auteur renseigné sur les 12 cartes (`Prénom`, + `1re lettre du nom` si besoin en cas d'homonyme).

### Périmètre V1 (Démo enseignant) vs Feuille de route V2
* **V1 (Démo immédiate sur `/`)** :
  * Accueil principal sur `/` (ancien catalogue de vote déplacé sur `/projets`, diaporama conservé sur `/presentation`).
  * Tirage aléatoire fluide mixant **3 mécaniques** : *« Qui suis-je ? » à 3 indices progressifs*, *Diagnostic Reef Check (bon/mauvais signe)* et *Défi visuel / fiche d'identité*.
  * **Points d'expérience (XP, 22/11/2026)** : un seul score, gagné par les actions d'apprentissage, qui remplace les étoiles du quiz (les étoiles 0 à 3 des mini-jeux restent une note de performance). Barème dans `config.ts` : « Qui suis-je ? » 30 / 20 / 10 XP selon les indices révélés, autres questions 20 XP, série +10 XP (à 3, puis toutes les 5), mini-jeu +30 XP par étoile de record jamais obtenue (rejouer sans progresser ne rapporte rien), article d'encyclopédie maîtrisé +50 XP (constante prête, à brancher avec l'encyclopédie). Mauvaise réponse ou simple lecture : 0 XP.
  * Les cartes se débloquent à des paliers d'XP cumulés (`cardThreshold`) : 50, 120, 200, 290, 390, 500, 620, 750, 890, 1040, 1200, 1370 (puis 1550… si la classe ajoute des cartes). Un gros gain qui franchit deux paliers ouvre les deux cartes, une cérémonie après l'autre ; une carte gagnée par un record de mini-jeu s'ouvre à la fermeture du jeu, avec la bulle « Nouveau record : +60 XP ». Anciennes sauvegardes : 1 étoile = 10 XP, placées juste sous le palier suivant.
  * Contrainte à respecter en touchant au barème : une question réussie ne revient plus, le quiz (134 questions) plafonne vers 3 000 XP. Mesuré par simulation (5 parties par profil, 25 s par question) : collection complète en 79 questions et environ 33 min pour un élève fort (85 % de réussite), 101 questions et 42 min pour un élève moyen (65 %), 173 questions et 72 min pour un élève en difficulté (45 %), avec 65 à 78 questions réussies sur 134 : toujours atteignable. 1re carte en 3 à 8 questions, tortue (3e carte) en 4 à 11 min.
  * **Fenêtre « Mes XP » (22/11/2026)** : le compteur d'XP de l'en-tête se touche (`XpDialog.tsx`, même style que la fenêtre du minuteur). Elle montre la carte mystère et sa jauge (« Encore 45 XP pour l'ouvrir »), puis une ligne par façon de gagner des XP avec son bouton : « Jouer » (quiz), « Jouer » / « Battre » pour chaque mini-jeu ouvert tant que son record n'est pas à 3 étoiles, jeux encore fermés avec les XP qui manquent pour la carte qui les ouvre, encyclopédie « Bientôt ». Un jeu qui attend les questions de la classe n'a pas de bouton (pas de promesse d'XP inaccessibles). Astuce « Qui suis-je ? », bonnes réponses et série en bas. Captures : `python scratch/qa-renders/capture_xp.py` (en cours de partie et collection complète, 1440 et 390 px).
  * **Mode Démo Enseignant** discret permettant d'afficher toute la collection en 1 clic.
  * Cartes Pokémon collector à effet « waouh » (holographique / animé / sublimé par IA en Image-to-Image fidèle au trait de l'élève, avec possibilité de voir aussi le dessin original et la signature de l'élève).
  * Persistance locale (`localStorage`), zéro compte utilisateur requis en V1.
  * **Back-office des questions `/admin` (22/11/2026)** : les gestionnaires (enseignants, équipe AME) se connectent par email et mot de passe et ajoutent, corrigent, retirent (sans supprimer) ou suppriment les **questions écrites à la main** : « Question à choix » (bonne réponse et 3 mauvaises, ou « Bon signe / Mauvais signe », explication, photo de la fiche, autre photo ou aucune) et « Qui suis-je ? » (3 indices ; la bonne réponse est le nom du sujet, les autres propositions sont tirées dans le même thème). Thème = celui du sujet choisi. Les « Qui suis-je ? » et défis photo tirés des fiches Reef Check restent générés depuis `data/ecole/`.
    * Fichiers : `src/admin/Admin.tsx` (écran), `api/session.ts` (connexion : mot de passe scrypt, cookie `ame_admin` signé HMAC, HttpOnly, 30 jours), `api/questions.ts` (lecture publique mise en cache 1 min sur le CDN, écriture réservée aux gestionnaires), `api/upload.ts` (photo réduite en WebP 1200 px dans le navigateur, puis rangée dans Vercel Blob), `api/_lib.ts` (outils communs, importés avec l'extension `.js`).
    * Côté jeu : `src/quiz/remoteQuestions.ts` charge `/api/questions` au démarrage et garde la dernière liste sur l'appareil (`ame_questions_cache_v1`) ; sans réseau, le jeu retombe sur `src/quiz/questions.seed.json` (les 45 questions « Diagnostic » d'origine). Les identifiants des questions d'origine (`diag-NN-sujet`) sont conservés pour ne pas perdre les questions déjà réussies ; les nouvelles prennent `q-<hasard>`.
    * Comptes gestionnaires (pas d'inscription en ligne) : `node --env-file=.env.local scripts/db.mjs admin <email> "<Nom>"` crée le compte ou lui donne un nouveau mot de passe, affiché une seule fois dans le terminal ; `admin-remove <email>` le supprime (sa session est coupée aussitôt). Autres commandes : `migrate` (tables `admins` et `questions`) et `export` (réécrit la copie de secours depuis la base, à faire de temps en temps).
    * Test local : `vercel dev` plante sous Windows (liens symboliques refusés, EPERM). Utiliser `node scratch/dev-api-server.mjs` (Vite + toutes les routes `api/` sur la vraie base, port 5190, hors Git) ou une prévisualisation Vercel (pousser une branche). **Attention : la base est celle de la production**, supprimer les questions et comptes de test après usage.
  * **Statistiques d'usage anonymes (22/11/2026)** : le jeu envoie par lots (`src/stats/track.ts`, `sendBeacon`, toutes les 8 s et à la fermeture de la page) des événements à `api/stats.ts` (fonction Vercel, table `play_events` créée à la volée dans le Postgres Neon du projet) : `visite` (type d'écran : téléphone, tablette, ordinateur), `reponse` (id de la question, sujet, juste ou non, secondes passées dessus), `partie` (mini-jeu, étoiles, durée), `session` (ouverture d'un mini-jeu : durée, parties finies, 0 = fermé sans finir), `carte` (carte gagnée, nombre de cartes possédées). **Aucune donnée personnelle** : un identifiant tiré au hasard par appareil (`ame_joueur_anonyme_v1`), ni nom, ni pseudo, ni adresse IP stockée. Limite : un même enfant sur deux appareils compte pour deux joueurs, et vider le navigateur crée un nouveau joueur.
    * **Pied de page** (`src/stats/PublicStatsStrip.tsx`) : « Tous les Gardiens ensemble » : joueurs, questions apprises (question réussie au moins une fois par un joueur), bonnes réponses, parties de mini-jeux, cartes ouvertes, heures à apprendre. `GET /api/stats`, mis en cache 5 min par Vercel. Rien ne s'affiche si le serveur ne répond pas.
    * **Back-office, onglet « Statistiques »** (`src/admin/AdminStats.tsx`, monté dans `src/admin/Admin.tsx`) : `GET /api/stats?vue=admin`, réservé aux gestionnaires connectés (cookie `ame_admin` vérifié par `currentAdmin` d'`api/_lib.ts`). Joueurs (total, jour, 7 et 30 jours), activité des 14 derniers jours, jeux les plus joués (joueurs, ouvertures, durée moyenne, part fermée sans finir, étoiles moyennes, part à 3 étoiles), quiz (réussite, questions apprises, temps par question), temps de jeu par joueur et par jour (moyenne, médiane, part qui atteint la limite des 30 min), questions les plus ratées et les mieux réussies, progression dans la collection, heures de jeu, appareils. Un encadré « À surveiller » signale tout seul un jeu souvent abandonné (40 % ou plus), trop dur (moins d'1 étoile en moyenne) ou trop facile (70 % de parties à 3 étoiles), un quiz sous 50 % de réussite et les questions sous 30 % de réussite. Heure de La Réunion (`Indian/Reunion`). Le temps de quiz est compté au plus 5 min par question (au-delà, l'enfant était parti).
    * Développement local : `vite.config.ts` sert `/api/stats` sur une base PGlite en mémoire (vide à chaque redémarrage, jamais mélangée aux vraies statistiques), vue admin ouverte sans connexion. Les mini-jeux fermés par la fin du temps de jeu quotidien ne comptent pas leur dernière session.
  * **Temps de jeu limité à 30 minutes par jour (22/11/2026)** : quiz et mini-jeux compris. Minuteur toujours visible : dans l'en-tête (« 28 min », puis compte à rebours à la seconde la dernière minute, en corail sous 5 minutes) et, pendant un mini-jeu, sous les boutons en haut à droite sur téléphone (sous la carte du circuit pour la course), en haut au centre sur écran plus large. Bandeau d'avertissement à 5 puis 1 minute. À zéro, le mini-jeu en cours se ferme et l'écran « C'est fini pour aujourd'hui ! » bloque tout jusqu'au lendemain ; le lien « Accès adulte » (mot de passe `DEMO_PASSWORD`) rouvre une séance complète, pour une démo en classe. Le temps ne s'écoule que si la page est à l'écran et que l'enfant a touché l'écran, la souris ou le clavier dans les 90 dernières secondes. Réglages dans `src/quiz/config.ts` (`DAILY_PLAY_MINUTES`, `PLAY_TIME_IDLE_SECONDS`, `PLAY_TIME_WARNINGS`) ; code dans `usePlayTime.ts` et `PlayTimer.tsx`. Sauvegarde à part (`ame_temps_de_jeu_v1`) : « Réinitialiser la progression » ne remet pas le compteur à zéro. **Limite connue** : sans compte, vider les données du navigateur ou changer d'appareil remet le compteur à zéro (verrou fiable seulement avec les comptes de la V2). Test en développement : `__playTime.use(29.9)` dans la console fait comme si 29,9 minutes avaient été jouées. Sur téléphone, les onglets « Jouer » et « Cartes » de l'en-tête n'affichent plus que leur icône pour laisser la place au minuteur. **Le minuteur de l'en-tête se touche** comme les onglets voisins : il ouvre la fenêtre « 30 minutes par jour » (`TimeInfoDialog`) avec le temps restant et sa barre, les trois raisons de la limite expliquées aux enfants (pauses pour les yeux, la concentration et le sommeil ; un peu chaque jour pour mieux retenir ; le vrai lagon dehors avec un adulte) et le fonctionnement (pause sans geste, avertissements, reprise à minuit). Textes dans `WHY` de `PlayTimer.tsx`. Le minuteur flottant des mini-jeux reste non cliquable pour ne pas gêner la partie.
* **Mini-jeux débloqués par les cartes (`src/quiz/minigames/`)** :
  * **Aperçus des cartes de l'onglet « Jeux » (22/11/2026)** : plus de photos Reef Check, chaque carte montre **le jeu lui-même**, en courte boucle filmée pendant une vraie partie (champ `preview` de `GAMES` dans `QuizGame.tsx`, composant `GameCover`). Format retenu : `public/images/minigames/apercu-<jeu>.mp4`, vidéo muette 640x360 à 30 i/s, 2 à 3,5 s, H.264 (tortue 80 Ko, course 145 Ko), et `apercu-<jeu>.webp` 960x540 = première image de la boucle (affiche de la vidéo, sans saut au démarrage). **Pas de WebP animé** : 3 à 4 fois plus lourd (325 à 565 Ko par jeu) et impossible à couper. L'image fixe s'affiche pour un jeu verrouillé (floutée), dans la fenêtre du défi des questions et si l'appareil demande moins d'animations (`prefers-reduced-motion`). La vidéo tourne sur les cartes débloquées et dans la fenêtre « Mini-jeu débloqué ».
    * Méthode de capture (à suivre pour chaque nouveau mini-jeu) : enregistrer l'écran du navigateur pendant une partie (screencast Chrome, les captures une à une plafonnent à 5-8 i/s, trop saccadé), en masquant tout sauf le `<canvas>` (pas de commandes ni de messages par-dessus), rogner la barre de défilement, choisir une boucle où il se passe quelque chose de reconnaissable (tortue : herbier, remontée « Aaah, de l'air ! », méduse ; course : fin du décompte et départ du peloton sous l'arche « DÉPART », avant que le bolide sans pilote sorte de la piste). Scripts : `python scratch/qa-renders/capture_apercus.py` (tortue et course, planches de repérage dans `scratch/qa-renders/apercus/`, fenêtres de boucle dans `LOOPS`) et `capture_ravine.py` (La Crue de la Ravine).
  * *La Traversée de la Tortue* : débloqué à la 3e carte (`TURTLE_GAME_UNLOCK_AT_CARDS`), puis rejouable depuis l'onglet « Jeux ». Canvas 2D sans dépendance ni image. La tortue verte mange algues rouges, herbier et méduses, remonte respirer, évite sacs plastique, bouteilles, bateaux, lignes de pêche et filets. Record (0 à 3 étoiles) dans la même sauvegarde `localStorage`.
  * *La Crue de la Ravine* (prototype du 22/11/2026) : débloqué à la 7e carte, voir § 9.
  * *La Grande Course du Lagon* : débloqué à la 5e carte (`RACE_GAME_UNLOCK_AT_CARDS`), idée des élèves après le succès de la tortue. Course en vraie 3D (three.js, chargé seulement à l'ouverture du jeu) sur un chenal de sable au fond du lagon : 3 tours, environ 1 minute, 6 concurrents. **Seules les cartes gagnées sont jouables** ; les rivaux sont les autres cartes gagnées, complétées par des animaux du lagon. **Les personnages n'ont aucune caractéristique de course** (décision du 22/11/2026 : chaque personnage est le dessin d'un élève, aucun ne doit être « le lent »). Après le pilote, le joueur choisit un **bolide** (`vehicles.ts`), et c'est lui qui porte Vitesse, Départ et Virages : La Bulle (équilibrée 3/3/3), L'Espadon (vitesse 5/2/2), L'Hippocampe (virages 2/2/5), La Crevette (départ 2/5/2), Le Crabe (2/3/3, résiste aux chocs). Règle d'équilibre : 9 points par bolide, aucun meilleur que les autres. Les rivaux prennent un bolide au hasard.
    * Pilotage : le bolide avance seul, flèches pour tourner, **Espace maintenu en tournant = dérapage** (3 paliers de turbo au relâchement), flèche haut = objet (flèche bas maintenue = bouture posée derrière), appui sur Espace juste avant « Partez ! » = départ turbo. Touches affichées dans un coin sur ordinateur. **Sur écran tactile** (retour d'un élève, 19/11/2026 : « très dur de tourner ») : deux grandes flèches sous le pouce gauche, et sous le pouce droit les boutons Accélérer (à tenir : plus d'accélération automatique), Frein, Déraper et Objet ; le doigt peut glisser d'un bouton à l'autre ; près du bord, le bolide est doucement ramené vers la piste ; la résolution de rendu baisse toute seule si la tablette passe sous 30 images par seconde. Contrôle : `python scratch/qa-renders/capture_tactile.py`.
    * **Défi « 20 questions » (en cours)** : la classe débloque un nouveau mini-jeu chaque fois qu'elle transmet 20 nouvelles questions de quiz (`QUESTIONS_PER_NEW_GAME`). Tant que `RACE_GAME_WAITS_FOR_QUESTIONS` vaut `true` dans `src/quiz/config.ts`, « Jouer » affiche le défi au lieu de lancer la course ; le lien discret « Accès enseignant » laisse passer avec le mot de passe du Mode Démo (`DEMO_PASSWORD`). **Passer la constante à `false` dès réception des 20 questions**, puis réutiliser le même verrou pour le jeu suivant.
    * Case d'objet en haut à gauche : la roulette défile, puis l'illustration de l'objet (`itemArt.tsx`) s'affiche jusqu'au lancer. Après un choc, les flèches répondent toujours (à 60 % pendant le tête-à-queue).
    * Objets (roulette en ramassant un coquillage) : bouture de corail (se fixe et devient un obstacle qui casse et fait déraper), encre de zourite, oursin (posé derrière : tête-à-queue puis ralenti), bulle bouclier, banc de demoiselles (file vers le concurrent de devant et le ralentit), courant porteur, tortue taxi (réservée aux derniers : emmène le bolide quelques secondes). Courants au sol qui accélèrent. **Perles** sur la piste : chacune ajoute 0,8 % de vitesse de pointe (10 au plus, moitié moins d'effet pour les rivaux), on en perd 3 à chaque choc.
    * **Circuits** (`circuits.ts`) : « Le chenal de sable » et « La passe de l'Ermitage » (eau profonde, deux courants de travers qui poussent le bolide sur le côté). Choix sur l'écran de départ, avec une case « Prochain circuit : 20 nouvelles questions ». **Décision du 21/11/2026 : chaque nouveau lot de 20 questions de la classe débloque un nouveau circuit** (pistes envisagées : le platier à marée basse, la plage sous les filaos). Ajouter un circuit = une entrée dans `CIRCUITS` (tracé, coquillages, courants, couleurs).
    * **Écran de départ en trois étapes (22/11/2026)** : circuit, puis pilote, puis bolide, une seule étape à l'écran, sans défilement même sur téléphone (les enfants se perdaient dans l'ancien écran unique). La 3D montre ce qu'on choisit : survol du circuit à l'étape 1 (`previewCircuit`), pilote dans son bolide ensuite, avec une animation propre à chaque bolide (la Bulle flotte, l'Espadon file par à-coups, l'Hippocampe slalome, la Crevette bondit, le Crabe marche de côté). Les règles (objets, perles, commandes) sont repliées sous « Comment jouer » à l'étape 3. Captures : `scratch/qa-renders/capture_etapes.py`.
    * **Pilotage tactile au doigt glissé (22/11/2026)** : retour des enfants, les flèches et pédales à l'écran ne ressemblaient pas aux jeux de course qu'ils connaissent sur téléphone. Désormais le bolide avance tout seul ; on pose un doigt n'importe où et on le glisse à gauche ou à droite sans le lever (braquage proportionnel, le point d'appui suit le doigt). Doigt à fond 0,2 s : dérapage automatique, turbo en revenant vers le centre. Toucher bref, deuxième doigt ou bouton rond : lance l'objet. Toucher pendant le décompte : départ turbo. Vibrations aux chocs et aux turbos (Android seulement, Safari iOS ne sait pas vibrer). Plus de frein ni de lancer en arrière au tactile. Réglages : `TOUCH_STEER` et les seuils `hardSteer` / `touchDrift` dans `raceEngine.ts`, portée du doigt (`reach`) dans `RaceGame.tsx`. Tests : `scratch/qa-renders/test_tactile.py`. Le ressenti n'a pas été validé à la main : à ajuster après essai par les enfants.
    * **Livrées des bolides (22/11/2026)** : chaque bolide a ses couleurs, son aspect et son motif peint (`paint` dans `vehicles.ts`) : Bulle turquoise à bulles, Espadon bleu métallisé à bande corail, Hippocampe doré à anneaux et crête violette, Crevette rose rayée de blanc, Crabe rouge tacheté. La couleur du type de la carte ne teint plus tout le bolide : elle reste sur l'anneau du cockpit et sur la carte du circuit, pour distinguer deux concurrents qui ont le même bolide. Planche : `scratch/qa-renders/capture_bolides.py`.
    * **Dérapage élargi et retours de course (22/11/2026)** : le dérapage tournait trop serré (un quart de tour en une demi-seconde : sortie de piste en 0,6 s, turbo presque impossible à charger). Rayon élargi (`DRIFT_TURN` 0,25 et `DRIFT_STEER` 0,32 dans `raceEngine.ts`, au lieu de 0,62 et 0,5) : mesuré flèche tenue à fond dans de vrais virages, il tient 1,2 à 1,6 s et atteint le 2e palier (`scratch/qa-renders/mesure_derapage.py`). Ajouts : jauge de turbo à trois crans pendant le dérapage, traits de vitesse pendant un turbo, place qui saute en vert ou rouge avec un son quand on double ou qu'on se fait doubler, astuce du départ turbo pendant le décompte (`scratch/qa-renders/capture_retours.py`). Pistes non faites : musique de fond, récompenses à débloquer.
    * Fichiers : `circuits.ts` (tracés et ambiances), `raceEngine.ts` (course : pilotage, objets, rivaux), `raceScene.ts` (affichage 3D, décor fabriqué par le code), `RaceGame.tsx` (écrans), `pilotModels.ts` (liste des personnages modélisés en 3D, voir § 8). Record en étoiles dans `raceBest`.
    * Univers, piste, objets et personnages sont originaux : on reprend les mécaniques du genre (dérapage turbo, objets, classement), jamais les éléments d'un jeu existant (noms, circuits, objets, musiques, interface).
    * Tests : console de développement `__race.setAutopilot(true)` puis `__race.simulate(secondes)` ; `__race.debugGive('oursin')` met un objet dans la case ; captures de contrôle `python scratch/qa-renders/capture_course.py` et courses complètes sur chaque circuit `python scratch/qa-renders/test_circuits_objets.py` (serveur de dev lancé).
  * Faits affichés en fin de partie (tortue : Kélonia, Ifremer et Direction de la mer Sud océan Indien ; course : bouturage du corail, croissance d'environ 1 cm par an d'un corail massif, encre du zourite, courant sortant d'une passe et interdiction de s'y baigner) : à faire relire par la RNMR avant diffusion large.
* **V2 (Évolutions prévues)** :
  * Questions enrichies par celles que préparent les élèves de CM2 cette année.
  * **Niveaux de difficulté associés à chaque question** pour ouvrir l'application à d'autres classes (choix du niveau scolaire à l'entrée).
  * **Séries par thématiques** (ex. *Poissons du lagon*, *Coraux & fonds marins*, *Jardin de l'AME*, *Invertébrés*) avec déblocage d'1 carte Pokémon à la fin d'une série complète.
  * **Comptes légers (conformes RGPD scolaire : code classe / pseudo) & Hall of Fame** (classement des meilleurs scores, dans la même base Neon). Plan retenu le 22/11/2026 : l'enseignant crée la classe (code classe), l'élève choisit son pseudo et tape un code à 4 chiffres ; tables `classes`, `students`, `progress` (la sauvegarde actuelle du jeu telle quelle, en JSONB), `play_time` (limite de 30 min par élève et par jour). Sans compte, le jeu reste jouable comme aujourd'hui ; une fois connecté, la sauvegarde du serveur fait foi (reprise de la progression locale à la première connexion).
  * **Création de compte pour garder sa progression** (demande du 22/11/2026) : cartes, records et XP conservés d'un appareil à l'autre, au lieu du seul `localStorage`. Conformité protection des mineurs : pseudo sans nom ni prénom, aucune adresse e-mail ni photo de l'enfant, compte créé par l'enseignant (code classe) ou avec consentement parental pour un usage à la maison (RGPD : moins de 15 ans en France), données minimales hébergées dans l'UE, suppression du compte sur simple demande, aucune publicité ni messagerie entre joueurs.
  * **Back-office gestionnaires** : **fait le 22/11/2026** pour les questions (voir V1, `/admin`). Reste : gérer les classes et les comptes d'élèves (étape 2), et peut-être les fiches des sujets.
  * **Temps de jeu limité à 30 minutes par jour** : **fait en V1 le 22/11/2026** (voir plus haut), compteur stocké sur l'appareil. Reste pour la V2 : faire suivre le compteur avec le compte de l'enfant, et une durée réglable par l'enseignant ou le parent sans toucher au code.
  * **Mode encyclopédie** (demande du 22/11/2026) : articles courts sur les espèces, les fonds et le Jardin de l'AME (réutiliser les fiches Reef Check et leurs photos). Lire un article ne rapporte rien seul : l'XP est gagnée en répondant juste à 3 questions du quiz liées à l'article (`XP_ARTICLE_MASTERED`, 50 XP, déjà dans `config.ts`) (champ de lien article ↔ questions à prévoir dans les données). Les mauvaises réponses renvoient vers le passage de l'article qui donne la réponse.
  * **Page de présentation du projet** (demande du 22/11/2026) : page publique « Le projet » qui raconte l'histoire de l'AME de l'Ermitage et de l'application (la classe, l'atelier de vote, les dessins des élèves devenus cartes, les mini-jeux, les partenaires scientifiques), avec quelques chiffres et visuels, et un contact. But : la montrer à des organismes partenaires et à des financeurs pour obtenir des soutiens. Contenu à faire valider par l'enseignante (droit à l'image : aucune photo d'élève reconnaissable, prénoms seulement avec accord).

---

## 7. Méthode de sublimation des dessins de cartes Pokémon (à suivre pour chaque nouveau dessin)

Méthode validée sur les 12 premières cartes (18/11/2026) : les élèves ont reconnu leur création et ont adoré la version sublimée. Pour que les prochaines cartes restent harmonieuses avec la collection, **ne rien changer aux réglages ni au gabarit de prompt** ci-dessous, seulement la description et le décor.

### Étape 1 — Préparer le dessin (jamais de photo brute dans Git)
* Photos brutes reçues (WhatsApp, scans) → `data/ecole/dessins-cartes-pokemon/` (**ignoré par Git**, dossier privé : prénoms, visages possibles). Aucune archive `.zip` dans le dépôt.
* Un dessin par fichier, **redressé, recadré au plus près**, fond papier conservé, en `.webp` → `data/ecole/vignettes-pokemon-eleves/<id>.webp`, puis copie dans `public/images/pokemon-originaux/<id>.webp` (c'est l'image « Dessin original » affichée sur la carte).
* `id` en kebab-case sans accent, dérivé du nom (`flou-flou`, `bernard-crocmite`). Viser **800 px de large minimum** : les 12 premières références faisaient 250 à 450 px et ça a fonctionné, mais plus de détail = meilleure fidélité.

### Étape 2 — Fiche de la carte dans `data/ecole/cartes-pokemon-eleves.json`
Ajouter une entrée avec tous les champs existants (copier une carte voisine) :
* `numero_collection` à la suite (`013`, `014`…), `lien_ame_lagon` (`true` = créature du lagon/littoral, débloquée en priorité ; `false` = imagination libre).
* `types` parmi **Eau, Roche, Acier, Plante, Feu, Vol, Électrik, Psy** (un nouveau type demande une couleur dans `TYPE_THEME` de `src/quiz/cards.ts` et une icône dans `src/quiz/icons.tsx`).
* `rarete_suggeree` parmi **Peu commune, Rare, Ultra-Rare, Rareté incroyable, Légendaire du Lagon** (pilote le liseré, le reflet et le suspense d'ouverture). Garder l'équilibre : une seule Légendaire, majorité de Rare. `pv_suggeres` entre 80 et 120.
* Textes de l'élève (`description_eleve`, `attaques`) recopiés **tels quels** en corrigeant seulement l'orthographe.
* `prenom_eleve` + `initiale_nom_eleve` (jamais le nom complet) ; vide → la carte affiche « Dessin : Élève CM2 ».
* **`description_visuelle_dessin`** : description factuelle de **tout** ce qui est dessiné (forme, couleurs exactes, accessoires, orientation, détails inventés). C'est la matière du prompt : un détail absent de la description risque de disparaître du rendu.

### Étape 3 — Génération Magnific (Image-to-Image, jamais Text-to-Image pur)
* `creations_request_upload` (mime `image/webp`, un emplacement par dessin) → `PUT` du fichier → `creations_finalize_upload` → l'identifiant obtenu va dans `references`.
* `images_generate` avec **`mode: "imagen-nano-banana-2"`**, **`aspectRatio: "4:3"`**, **`references: [{ type: "image", identifier: <dessin de l'élève> }]`**. Repli `mode: "grok"` **uniquement** si Nano Banana refuse l'image. Coût constaté : 75 crédits par image ; lancer les dessins en parallèle, une génération par dessin.
* **Gabarit de prompt (en anglais, structure fixe)** :

```text
Redraw this exact child's creature drawing as a vibrant, luminous official trading card game illustration. Keep the creature immediately recognizable: same silhouette, same pose, same colours and every inventive detail: <DESCRIPTION : traduction fidèle de description_visuelle_dessin, chaque partie du corps, couleur et accessoire>. Setting: <DÉCOR>. Dynamic lighting, rich painterly anime creature art, single creature centred. No text, no letters, no numbers, no card frame, no border.
```

* **Décor** : carte du lagon → le lagon turquoise de La Réunion (sable blanc, coraux, rayons de soleil dans l'eau claire, bulles) **mis en scène avec l'attaque ou l'habitat de l'élève** (ex. tornade de sable du Pérrocrasaure, picorage des algues de l'Assourdine). Carte d'imagination → son propre univers tiré de la fiche (ciel et arcs-en-ciel pour Flou-flou, forêt tropicale pour Aéroflamme).
* Exemple réel (Le Pérrocrasaure) : *« …every inventive detail: a round massive fish, royal blue body with large magenta-pink patches, grey armoured dinosaur crest plates along the back, two blue tubes pointing forward at the front, turquoise webbed fins, and a small yellow propeller at the tip of the tail. Setting: the turquoise coral lagoon of Reunion Island, white sand bottom, colourful corals, sun rays through clear water, a swirling sand tornado and bubbles around it… »*
* **Jamais de texte dans l'image** : nom, PV et attaques sont affichés par l'application. **Créature centrée avec de la marge** : la carte recadre l'illustration en 16:11 (environ 8 % de hauteur en moins).

### Étape 4 — Contrôle puis intégration
1. `creations_wait`, puis télécharger chaque rendu en PNG nommé `<id>.png` dans un dossier temporaire.
2. `python scripts/finalize-pokemon-art.py <dossier_png> <id> [<id>…]` : écrit `public/images/pokemon-ia/<id>.webp` (1200 px, WebP q82, ~70 à 200 Ko) et la planche `scratch/qa-renders/sublimation.jpg` (dessin original au-dessus, rendu IA en dessous).
3. **Relire la planche dessin par dessin** : même silhouette, mêmes couleurs, chaque détail inventé présent, pas de texte parasite, créature entière dans le cadre. Un rendu qui dérive → régénérer **ce seul dessin** en nommant dans la description le détail perdu (ne pas toucher au reste du gabarit).
4. `node scripts/build-quiz-data.mjs` (régénère `src/quiz/data.generated.ts` ; ne jamais l'éditer à la main), puis `npm run lint` et `npm run build`.
5. Vérifier la carte en grille, en vue zoomée et à l'ouverture (Mode Démo / Enseignant → « Simuler l'ouverture d'une carte »). Le nombre total de cartes (route, compteurs, numéro `#013 / 013`) suit automatiquement la taille de la collection.

---

## 8. Méthode de modélisation 3D des personnages de cartes (pilotes de la course)

Appliquée le 19/11/2026 aux 12 cartes de la collection (2,8 Mo de modèles au total). Une nouvelle carte sans modèle reste jouable : elle roule avec sa pastille illustrée dans une bulle.

1. **Figurine de référence (Magnific, Image-to-Image)** : envoyer `public/images/pokemon-ia/<id>.webp`, puis `images_generate` avec `mode: "imagen-nano-banana-2"`, `aspectRatio: "1:1"`, cette image en `references`. Gabarit de prompt (seule la description change, reprise de `description_visuelle_dessin`) :

```text
Turn this exact creature into a single 3D collectible toy figure for a 3D model reference. Keep it immediately recognizable, same colours and every detail: <DESCRIPTION>. Whole creature fully visible, three-quarter front view, clean smooth stylized 3D game character render, soft even studio lighting, plain flat white background. No scenery, no water, no ground, no shadow, no text.
```

2. **Contrôle de la figurine** (`creations_read`) : même silhouette, mêmes couleurs, tous les détails inventés. Sinon régénérer avant de lancer la 3D.
3. **Modèle 3D** : `models3d_generate` avec la figurine, `model: "tripo-p1"`, `faceLimit: 14000`, `textureQuality: "standard"`. Coût constaté : 75 crédits (figurine) + 1 035 crédits (modèle) par carte.
4. **Allègement pour le web** : télécharger le `.glb` dans `scratch/models3d/`, puis `npx @gltf-transform/cli@4 optimize scratch/models3d/<id>.glb public/models/pilotes/<id>.glb --texture-compress webp --texture-size 1024 --compress meshopt` (environ 1,7 Mo → 300 Ko).
5. **Déclaration et orientation** : ajouter l'`id` dans `src/quiz/minigames/pilotModels.ts` avec sa rotation. Le modèle sort souvent de profil : sur les 12 premiers, 8 ont demandé `SIDE` (un quart de tour), 3 étaient déjà de face (`0`) et 1 était à l'envers (`Math.PI`). Contrôle : `python scratch/qa-renders/capture_pilotes.py` (serveur de dev lancé) produit une planche face / profil de tous les pilotes ; le visage doit être visible sur la ligne du haut.

---

## 9. Idées de mini-jeux et prochain jeu (22/11/2026)

### Idées proposées par les élèves (à garder, à créditer si reprises)
1. Murène étoilée qui doit sortir sa gueule de son trou pour manger les poissons.
2. Chaîne alimentaire avec évolution (on mange, on grandit, on devient une autre espèce).
3. Déchets sur une plage : en ramasser le plus de poids en le moins de temps possible.
4. Memory avec les noms des poissons.
5. Raie qui doit se cacher quand les requins arrivent.
6. Jeu de foot style FIFA avec des poissons et des bulles d'air.
7. Rocket League avec des voitures, des personnages de Mario Kart et une bulle comme ballon.
8. Soigner les coraux morts du lagon et les herbiers.

Tri pédagogique : 8 (coraux, herbiers) apprend le plus pour sauver le lagon ; 3 (déchets) est le meilleur second, mais compter la **pollution évitée** et non le poids (un mégot ne pèse rien et pollue environ 500 L d'eau) ; 2 (chaîne alimentaire) et 4 (memory, réutilise les 41 photos) sont de bons compléments ; 1 et 5 sont des jeux de réflexes, utiles comme obstacles dans un autre jeu ; 6 et 7 n'apprennent rien sur le lagon, et Mario Kart, FIFA et Rocket League appartiennent à d'autres (interdit de reprendre leurs personnages, noms ou visuels).

Correction scientifique à respecter : un corail mort ne revit pas. Un corail blanchi peut se rétablir si le stress cesse, et on repeuple le récif par bouturage. Le jeu dit « protéger et réparer », jamais « ressusciter ».

### Ce que Julien veut mettre en avant
* Les **herbiers**, les **poissons herbivores** (perroquets, chirurgiens) et les **oursins** qui mangent les algues.
* La cause : les **engrais** (et eaux usées) qui descendent par les **ravines** avec la pluie font proliférer les algues, qui étouffent le corail.
* Exigence : le gameplay doit être **excitant et donner de la dopamine** (action, récompenses fréquentes, montée en puissance), sinon les enfants ne joueront pas. Le message passe par les mécaniques, pas par du texte à lire.

### Proposition retenue pour le prochain jeu : « La Crue de la Ravine » (nom provisoire)
Jeu d'action 2D (canvas, comme la tortue), parties de 2 à 3 minutes, tactile au doigt glissé et flèches sur ordinateur.
* **Boucle de base** : le joueur guide un **banc de brouteurs** au doigt sur le platier. Quand il passe sur les algues, il les dévore (bruit de grignotage, particules, compteur de combo). Le corail libéré reprend ses couleurs dans une explosion de couleur. Le banc grossit à chaque combo (idée 2 des élèves : il « évolue » de demoiselles en chirurgiens, puis en gros perroquets qui mangent plus large).
* **La menace** : la pluie tombe, la ravine crache des nuages verts d'engrais, et les algues s'étalent sur le corail comme une marée verte. Une jauge « santé du récif » baisse si le vert gagne. Chaque vague se termine par une **crue** (écran qui tremble, gros nuage) : le moment de tension.
* **Entre deux vagues, choix d'une carte parmi trois** (comme un roguelite, et en lien avec les cartes Pokémon du jeu) ; chaque carte est un vrai geste pour le lagon : planter l'**herbier** à l'embouchure (il retient l'engrais et la vase), des haies le long de la ravine en amont, une zone sans pêche (plus de perroquets), lâcher des **oursins** (ils broutent tout seuls, mais trop d'oursins rongent aussi le corail : il faut doser), poser une bouture de corail.
* **Obstacles repris des idées des élèves** : la **murène** sort sa gueule d'un trou du corail (idée 1) ; le **requin** passe et le banc doit se cacher dans l'herbier, qui sert de refuge et de nurserie (idée 5, à transposer au banc).
* **Récompenses** : étoiles en fin de partie, perroquets qui produisent du sable blanc (fait amusant et vrai), record en `localStorage` comme les autres jeux, déblocage par le même verrou « 20 questions » que la course.
* **Faits de fin de partie** (à faire relire par la RNMR) : engrais et eaux usées des ravines qui nourrissent les algues, rôle des brouteurs, herbier qui filtre et abrite les petits poissons, oursins utiles mais nuisibles en surnombre, sable produit par les perroquets.
* Suite possible, sans faire un jeu de plus : un niveau « plage sous les filaos » où l'on ramasse les mégots avant la pluie (idée 3).

### Prototype jouable (22/11/2026)
* Fichiers : `src/quiz/minigames/ravineEngine.ts` (moteur canvas 2D, réglages de difficulté dans `TUNE`), `RavineGame.tsx` (écrans, cartes), `ravine.css`. Record en étoiles dans `reefBest`. Débloqué à la 7e carte (`REEF_GAME_UNLOCK_AT_CARDS`) et derrière le défi des 20 questions (`REEF_GAME_WAITS_FOR_QUESTIONS`, accès enseignant avec `DEMO_PASSWORD`).
* Fait : banc guidé au doigt / à la souris / aux flèches, algues mangées avec combo, sons qui montent avec le combo, « Festin » à x10, x25, x50, x100…, évolution demoiselles → chirurgiens (30 algues) → perroquets (90 algues, sable blanc), 3 vagues de pluie avec crue (2e ravine à la vague 3), voile d'engrais visible sur l'eau, corail qui pâlit puis meurt sous les algues et reprend ses couleurs une fois libéré, choix d'une carte sur trois entre les vagues (herbier, haies, station d'épuration, zone sans pêche, oursins, boutures), fin de partie avec étoiles (55 / 70 / 85 % de corail en bonne santé) et 4 faits à retenir. Partie d'environ 2 minutes.
* **Illustrations des cartes (22/11/2026)** : une scène par carte (7 cartes depuis l'ajout du bassin de décantation) dans `public/images/minigames/ravine/<id>.webp` (800×446, 54 à 99 Ko), en haut de la carte sur ordinateur et à gauche sur téléphone, l'icône restant en pastille. Générées avec Magnific (`imagen-nano-banana-2`, 16:9, 75 crédits chacune), même style pour les six : « Bright cheerful children's book illustration… Clean painterly style with soft outlines, vivid tropical colours, simple composition a 10-year-old understands at a glance. No text… ». Les vraies photos du jeu servent de référence pour les espèces (`herbier-marin`, `oursin-diademe`, `poisson-perroquet` + `chirurgien-bagnard`, `corail-dur-acropora`). Une nouvelle carte : même gabarit de prompt, puis contrôle avec `python scratch/qa-renders/capture_cartes_ravine.py`.
* **Boue, herbier et oursins d'après le bilan Ifrecor 2020-2025 (22/11/2026)** : source vérifiée, article Imaz Press du 22/11/2026 « Récifs coralliens : en cinq ans, La Réunion a connu une bascule écologique historique » (corail vivant des pentes externes passé d'environ 50 % à moins de 15 %, algues jusqu'à 95 % sur les platiers faute d'oursins herbivores, herbiers −86 % entre 2018 et 2024, jusqu'à 90 % de corail perdu à Saint-Leu et La Saline par les apports de terre après le cyclone de 2025, coraux moins malades près des herbiers).
  * **Boue** : la ravine crache deux nuages, vert (engrais : les algues poussent, le banc peut les manger) et marron (terre : elle recouvre le corail, le banc ne peut rien). Seuls l'herbier, les haies et la nouvelle carte « Bassin de décantation » la retiennent ; la station d'épuration n'agit que sur l'engrais. Les boutures meurent plus vite sous la boue, avec un message « il faut d'abord arrêter la terre ». Le message du jeu devient « la terre avant la mer ».
  * **Herbier** : les coraux à moins de 3 cases guérissent 1,8 fois plus vite ; trop de boue d'un coup ensevelit un morceau d'herbier, qui disparaît.
  * **Oursins** : la carte devient « Le retour des oursins » et dit d'abord la réalité de La Réunion (les oursins sont morts, les algues ont envahi le récif), le surnombre restant un revers secondaire.
  * Équilibre (8 parties par réglage, pilote automatique) : sans carte contre la boue, 66 % de corail en moyenne (1 à 2 étoiles) ; boue réduite à la source comme avec bassin + haies, 77 % (2 à 3 étoiles) ; sans jouer, 0 étoile. Réglages dans `TUNE` (`mudShare`, `mudDamage`, `mudClear`, `herbierClear`, `herbierBury`, `herbierHeal`).
  * Ne pas nommer le cyclone Garance dans le jeu (des élèves l'ont vécu) : « un cyclone en 2025 ».
  * Pistes notées, non faites : canicule marine à la vague 3 (blanchissement), carte piège « tuyau géant vers le large » (la boue part sur la pente externe, fausse bonne idée), niveau « le récif d'aujourd'hui » qui démarre déjà abîmé. Les solutions détaillées par Gemini sans source (fosses septiques qui fuient vers le lagon par les résurgences, traitement poussé des stations, coraux résistants à la chaleur en pépinière) sont à faire confirmer par la RNMR avant d'entrer dans le jeu.
* Pas encore fait : murène, requin et refuge dans l'herbier, niveau de la plage aux mégots.
* Équilibre mesuré avec un pilote automatique qui vise toutes les 0,7 s (`__ravine.debug.setAutopilot(true)` puis `__ravine.debug.simulate(secondes)`) : sans jouer, 0 étoile (40 à 52 % de corail) ; pilote automatique, 2 à 3 étoiles (78 à 94 %) ; les cartes « haies » ou « oursins » ajoutent quelques points. **Pas encore essayé par des enfants** : régler `TUNE` après le premier essai en classe. Le combo devient très long dès qu'on enchaîne (plus de 1 000 avec le pilote automatique) : à surveiller.
* Aperçu de la page Mini-jeux et captures de contrôle : `python scratch/qa-renders/capture_ravine.py [url du serveur de dev]` (écrit `apercu-ravine.webp` et `apercu-ravine.mp4`, captures téléphone dans `scratch/qa-renders/ravine/`).

---

## 10. Règles de conception des mini-jeux (leçons de « La Grande Course du Lagon » et de « La Crue de la Ravine », 22/11/2026)

À relire **avant de concevoir ou de modifier un mini-jeu**. Chaque règle vient d'un retour des enfants ou de Julien sur la course et la crue de la ravine, ou d'un défaut trouvé en les testant. Elles valent pour tous les jeux, pas seulement la course.

### Respect des élèves
* **Un dessin d'élève n'est jamais désavantagé.** Les personnages des cartes n'ont aucune caractéristique de jeu (un enfant a mal vécu de voir « son » personnage lent). Toute différence de jeu est portée par un objet choisi à part (bolide, équipement), et aucun choix n'est meilleur que les autres : même total de points, un point fort par choix, un choix « équilibré partout » pour débuter.
* Les idées des élèves reprises dans un jeu sont créditées (§ 9).

### Écrans de choix et d'explication
* **Un seul choix par écran, sans défilement**, y compris sur un téléphone de 390 px : étapes numérotées, boutons « Retour » et « Suivant » collés en bas. Les enfants se perdaient dans un écran unique à faire défiler.
* **Ce qu'on choisit se voit en grand**, animé, pendant qu'on choisit (survol du circuit, bolide qui joue son animation). Un seul aperçu 3D à la fois, celui de l'option touchée : plusieurs scènes 3D en même temps sont trop lourdes pour les tablettes de l'école.
* Chaque option a une identité visuelle propre (forme, couleurs, motif, animation), pas seulement un nom et des jauges.
* Les règles longues sont repliées (« Comment jouer ») ; l'essentiel s'apprend en jouant, par une aide courte affichée au bon moment puis retirée dès que le geste est fait une fois.

### Commandes tactiles (tablette et téléphone)
* **Reprendre les gestes des jeux que les enfants connaissent déjà** : le doigt reste posé et glisse. Jamais de boutons qu'il faut lâcher pour en presser un autre (flèches gauche/droite, pédales).
* Le moins de commandes possible : avance automatique, action secondaire automatique quand le geste est franc (dérapage au doigt à fond), un seul bouton d'action bien visible sous le pouce droit, doublé par un toucher bref n'importe où.
* **La commande est visible au repos là où se pose le pouce** (bas gauche), puis vient sous le doigt où qu'il se pose. Une commande qui n'apparaît qu'au toucher ne dit pas où poser le doigt.
* Tester et capturer **en portrait et en paysage**. Vérifier que rien n'élargit la page (`document.documentElement.scrollWidth` égal à la largeur de l'écran) : un débordement de 16 px dans l'en-tête rognait tout le jeu en bas et à droite sur téléphone.

### Sensations de jeu
* **Chaque mécanique doit être tenable par un enfant qui ne dose pas** (touche ou doigt tenus à fond). Le mesurer en simulation dans de vraies situations de jeu avant de livrer, pas seulement vérifier qu'elle se déclenche : le dérapage sortait de la piste en 0,6 s et personne ne l'avait vu, parce que le pilote automatique ne dérape pas.
* Toute mécanique cachée (départ turbo, turbo de dérapage) est annoncée à l'écran au moment où elle sert.
* Tout événement important a un retour immédiat, visuel et sonore : place gagnée ou perdue, turbo prêt, turbo en cours, choc. Les indices placés sous le personnage ne suffisent pas, on ne les regarde pas en jouant : les doubler dans l'affichage.
* Vibration aux chocs sur tactile (sans effet sur iPad et iPhone, Safari ne sait pas vibrer : ne jamais en faire le seul retour).

### Vérification avant livraison
* Le navigateur de test ne remplace pas une main d'enfant : dire clairement à Julien ce qui a été mesuré en simulation et ce qui reste à valider en jouant, et regrouper les réglages de sensation dans des constantes nommées pour les ajuster vite après essai.
* Un test qui braque « au hasard » ne prouve rien : choisir la situation (entrée d'un virage, sens du virage) à partir de l'état du jeu.
* Faire un tour complet en captures après toute modification du décor ou du tracé : un défaut d'affichage local (sol replié dans un virage serré) n'apparaît qu'à un endroit précis.
* Interface du jeu : pas d'émoji ni de drapeau Unicode, typographie ou SVG ; captures en 1440 px et 390 px rangées dans `scratch/qa-renders/` (jamais commitées).

### Faire apprendre par le jeu (leçons de la crue de la ravine)
* **Choisir le jeu par ce qu'il apprend d'utile pour le lagon**, puis le rendre excitant : une idée d'élève sans lien avec le lagon (foot, jeux du commerce) ne devient pas un jeu ; une idée de réflexe (murène, raie qui se cache) devient un obstacle dans un jeu qui enseigne.
* **Le message passe par la mécanique, pas par du texte.** La cause doit se voir à l'écran : le nuage d'engrais sort de la ravine, laisse un voile vert sur l'eau, les algues poussent là où il passe et s'arrêtent dans l'herbier. Les bandeaux d'explication sont courts, apparaissent une seule fois, au moment où le phénomène se produit.
* **Jamais de fausse promesse scientifique** pour rendre le jeu plus gratifiant : un corail mort ne revit pas (on replante des boutures), un corail étouffé peut se rétablir s'il est libéré à temps. Faits de fin de partie à faire relire par la RNMR.
* **Les bons choix ont parfois un revers**, comme dans la nature : les oursins broutent les algues mais râpent le corail s'ils sont trop nombreux. C'est ce qui fait réfléchir plutôt que cliquer.
* **Entre deux vagues, une carte à choisir parmi trois**, chacune étant un vrai geste pour le lagon (herbier, haies, station d'épuration, zone sans pêche…). C'est à la fois la récompense, le moment de réflexion et la leçon. **Chaque carte porte une scène illustrée** qui montre le geste et son effet : une icône seule ne suffit pas pour qu'un enfant comprenne (retour de Julien). Méthode et gabarit de prompt : § 9, « Illustrations des cartes ».

### Boucle de récompense (« dopamine »)
* **De l'action dès la première seconde** : le terrain commence déjà avec de quoi jouer (algues présentes au départ), pas d'attente avant la première récompense.
* **Retour à chaque petite réussite** : bruit, particules, points qui s'envolent, et une note qui monte avec le combo (gamme pentatonique, toujours agréable). Paliers fêtés espacés (x10, x25, x50, x100, x200…) pour qu'ils restent des événements.
* **Le personnage du joueur grandit pendant la partie** (demoiselles → chirurgiens → perroquets) : moment fort, et chaque stade apprend une espèce.
* **Montée de tension en vagues** qui finissent sur un pic (la crue : l'écran tremble, gros nuage), puis un temps calme pour choisir. Parties courtes (environ 2 minutes) pour donner envie de rejouer.
* **Ne compter que les vraies réussites** : au début, les toutes petites algues qui venaient de germer comptaient dans le combo, qui montait à x3 000 sans effort. Un nettoyage ne compte que si la case avait vraiment des algues ; le combo repart à zéro à chaque vague.
* **Étoiles par seuils annoncés** à la fin (55, 70, 85 % de corail sauvé) : l'enfant sait ce qu'il doit viser la prochaine fois.

### Équilibre et réglages
* Mesurer avec **deux joueurs simulés** avant de livrer : un joueur qui ne fait rien doit perdre, un pilote automatique qui vise au rythme d'un humain (toutes les 0,7 s, pas à chaque image) doit gagner 2 à 3 étoiles. Le premier réglage était si facile que ne rien faire rapportait une étoile.
* Tous les réglages de difficulté dans **un seul objet nommé** (`TUNE` dans `ravineEngine.ts`), modifiable depuis la console, pour balayer plusieurs réglages d'un coup et corriger vite après un essai en classe.
* Chaque moteur expose en développement `window.__<jeu>.debug` : `setAutopilot`, `simulate(secondes)`, `state()`.

### Dessin par le code (canvas 2D)
* **Casser l'effet damier** : position, taille et forme varient un peu d'une case à l'autre, et une dalle commune sous les massifs les relie.
* **Vérifier que chaque forme se lit comme ce qu'elle est** : le corail branchu dessiné en étoile ressemblait à des étoiles de mer ; dessiné en branches qui se divisent en Y, il se lit comme du corail.
* **En portrait, les compteurs couvrent le haut de l'écran** : y garder les éléments importants visibles (la plage est plus haute en portrait pour que la ravine apparaisse sous les compteurs).

### Mettre un nouveau jeu en ligne
* Jeu chargé seulement à son ouverture (`lazy`), canvas 2D sans dépendance quand la 3D n'apporte rien ; débloqué à un nombre de cartes (`*_UNLOCK_AT_CARDS`) et derrière le défi des 20 questions (`*_WAITS_FOR_QUESTIONS`), record en étoiles dans la sauvegarde.
* Aperçu de l'onglet Mini-jeux : image `apercu-<jeu>.webp` (960×540) et boucle `apercu-<jeu>.mp4` (640×360, 30 i/s, muette, 2 à 3,5 s) filmées dans une vraie partie. Modèle de script : `scratch/qa-renders/capture_ravine.py` (Playwright avec `channel='chrome'`, clic forcé sur les boutons animés, sinon Playwright attend indéfiniment qu'ils s'immobilisent).

### Pistes mises de côté pour la course (à ne lancer que sur demande)
* Musique de fond (il n'y a que des bruitages).
* Récompenses à débloquer en course (couleurs de bolide).
* Bug clavier « les flèches ne répondent plus » sur ordinateur : cause non prouvée.
