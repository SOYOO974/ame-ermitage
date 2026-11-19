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
   * 7 Pokémon liés au lagon/littoral (*Le Pérrocrasaure*, *L'Assourdine*, *Le Bernard Crocmite*, *Luffy*, *Pêche-heure*, *Bulubul*, *Torti*) et 5 Pokémon d'imagination libre (*Aéroflamme*, *Chauveflamme*, *Flamemèche*, *Cat Lover*, *Flou-flou*).
   * **12 dessins originaux redressés et recadrés** dans `data/ecole/vignettes-pokemon-eleves/*.webp` (310 Ko au total).
   * Cartouche auteur renseigné sur les 12 cartes (`Prénom`, + `1re lettre du nom` si besoin en cas d'homonyme).

### Périmètre V1 (Démo enseignant) vs Feuille de route V2
* **V1 (Démo immédiate sur `/`)** :
  * Accueil principal sur `/` (ancien catalogue de vote déplacé sur `/projets`, diaporama conservé sur `/presentation`).
  * Tirage aléatoire fluide mixant **3 mécaniques** : *« Qui suis-je ? » à 3 indices progressifs*, *Diagnostic Reef Check (bon/mauvais signe)* et *Défi visuel / fiche d'identité*.
  * Déblocage accéléré de cartes Pokémon pour la démo (toutes les 3 bonnes réponses, paramétrable via une constante) + **Mode Démo Enseignant** discret permettant d'afficher toute la collection en 1 clic.
  * Cartes Pokémon collector à effet « waouh » (holographique / animé / sublimé par IA en Image-to-Image fidèle au trait de l'élève, avec possibilité de voir aussi le dessin original et la signature de l'élève).
  * Persistance locale (`localStorage`), zéro compte utilisateur requis en V1.
* **Mini-jeux débloqués par les cartes (`src/quiz/minigames/`)** :
  * *La Traversée de la Tortue* : débloqué à la 3e carte (`TURTLE_GAME_UNLOCK_AT_CARDS`), puis rejouable depuis l'onglet « Jeux ». Canvas 2D sans dépendance ni image. La tortue verte mange algues rouges, herbier et méduses, remonte respirer, évite sacs plastique, bouteilles, bateaux, lignes de pêche et filets. Record (0 à 3 étoiles) dans la même sauvegarde `localStorage`.
  * *La Grande Course du Lagon* : débloqué à la 5e carte (`RACE_GAME_UNLOCK_AT_CARDS`), idée des élèves après le succès de la tortue. Course en vraie 3D (three.js, chargé seulement à l'ouverture du jeu) sur un chenal de sable au fond du lagon : 3 tours, environ 1 minute, 6 concurrents. **Seules les cartes gagnées sont jouables** ; les rivaux sont les autres cartes gagnées, complétées par des animaux du lagon. Les PV de la carte donnent ses réglages (costaud = plus rapide, départ plus lent).
    * Pilotage : le bolide avance seul, flèches pour tourner, **Espace maintenu en tournant = dérapage** (3 paliers de turbo au relâchement), flèche haut = objet (flèche bas maintenue = bouture posée derrière), appui sur Espace juste avant « Partez ! » = départ turbo. Touches affichées dans un coin sur ordinateur ; sur tablette, zones gauche / droite et boutons Déraper et Objet.
    * Objets (roulette en ramassant un coquillage) : bouture de corail (se fixe et devient un obstacle qui casse et fait déraper), encre de zourite, courant porteur, bulle bouclier. Courants au sol qui accélèrent.
    * Fichiers : `raceEngine.ts` (course : piste `CTRL`, pilotage, objets, rivaux), `raceScene.ts` (affichage 3D, décor fabriqué par le code), `RaceGame.tsx` (écrans), `pilotModels.ts` (liste des personnages modélisés en 3D, voir § 8). Record en étoiles dans `raceBest`.
    * Univers, piste, objets et personnages sont originaux : on reprend les mécaniques du genre (dérapage turbo, objets, classement), jamais les éléments d'un jeu existant (noms, circuits, objets, musiques, interface).
    * Tests : console de développement `__race.setAutopilot(true)` puis `__race.simulate(secondes)` ; captures de contrôle `python scratch/qa-renders/capture_course.py` (serveur de dev lancé).
  * Faits affichés en fin de partie (tortue : Kélonia, Ifremer et Direction de la mer Sud océan Indien ; course : bouturage du corail, croissance d'environ 1 cm par an d'un corail massif, encre du zourite) : à faire relire par la RNMR avant diffusion large.
* **V2 (Évolutions prévues)** :
  * Questions enrichies par celles que préparent les élèves de CM2 cette année.
  * **Niveaux de difficulté associés à chaque question** pour ouvrir l'application à d'autres classes (choix du niveau scolaire à l'entrée).
  * **Séries par thématiques** (ex. *Poissons du lagon*, *Coraux & fonds marins*, *Jardin de l'AME*, *Invertébrés*) avec déblocage d'1 carte Pokémon à la fin d'une série complète.
  * **Comptes légers (conformes RGPD scolaire : code classe / pseudo) & Hall of Fame** (classement des meilleurs scores via Supabase).

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

Validée le 19/11/2026 sur 3 cartes (Pérrocrasaure, Bernard Crocmite, Pêche-heure). Une carte sans modèle reste jouable : elle roule avec sa pastille illustrée dans une bulle.

1. **Figurine de référence (Magnific, Image-to-Image)** : envoyer `public/images/pokemon-ia/<id>.webp`, puis `images_generate` avec `mode: "imagen-nano-banana-2"`, `aspectRatio: "1:1"`, cette image en `references`. Gabarit de prompt (seule la description change, reprise de `description_visuelle_dessin`) :

```text
Turn this exact creature into a single 3D collectible toy figure for a 3D model reference. Keep it immediately recognizable, same colours and every detail: <DESCRIPTION>. Whole creature fully visible, three-quarter front view, clean smooth stylized 3D game character render, soft even studio lighting, plain flat white background. No scenery, no water, no ground, no shadow, no text.
```

2. **Contrôle de la figurine** (`creations_read`) : même silhouette, mêmes couleurs, tous les détails inventés. Sinon régénérer avant de lancer la 3D.
3. **Modèle 3D** : `models3d_generate` avec la figurine, `model: "tripo-p1"`, `faceLimit: 14000`, `textureQuality: "standard"`. Coût constaté : 75 crédits (figurine) + 1 035 crédits (modèle) par carte.
4. **Allègement pour le web** : télécharger le `.glb` dans `scratch/models3d/`, puis `npx @gltf-transform/cli@4 optimize scratch/models3d/<id>.glb public/models/pilotes/<id>.glb --texture-compress webp --texture-size 1024 --compress meshopt` (environ 1,7 Mo → 300 Ko).
5. **Déclaration** : ajouter l'`id` dans `src/quiz/minigames/pilotModels.ts` avec sa rotation (0 si le personnage regarde déjà vers l'avant du bolide ; sinon `Math.PI` ou `Math.PI / 2`), puis vérifier dans l'écran de choix du pilote, où le modèle tourne sur lui-même.
