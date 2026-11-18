// FICHIER GÉNÉRÉ par scripts/build-quiz-data.mjs — ne pas modifier à la main.
import type { Subject, PokemonCardData } from './types';

export const SUBJECTS: Subject[] = [
  {
    "id": "raisin-bord-de-mer",
    "name": "Raisin Bord de Mer",
    "theme": "flore",
    "group": "plante",
    "origin": "carte_classe",
    "scientific": "Coccoloba uvifera",
    "otherNames": [],
    "reefCode": null,
    "uicn": null,
    "sense": "positif",
    "role": "Arbre du bord de mer qui supporte très bien le vent et le sel. Ses grandes feuilles rondes font de l’ombre et ses grappes de fruits deviennent violettes en mûrissant.",
    "positive": null,
    "negative": null,
    "clues": [
      "Je suis un arbre du bord de mer.",
      "J'ai de grandes feuilles rondes.",
      "Mes fruits ressemblent à de petits raisins."
    ],
    "cluesExpert": [
      "Mes feuilles sont rondes et épaisses.",
      "Mes fruits poussent en grappes et ressemblent à du raisin.",
      "Ils deviennent violets lorsqu'ils mûrissent."
    ],
    "image": "/images/reef-check/raisin-bord-de-mer.webp"
  },
  {
    "id": "patate-a-durand",
    "name": "Patate à Durand",
    "theme": "flore",
    "group": "plante",
    "origin": "carte_classe",
    "scientific": "Ipomoea pes-caprae",
    "otherNames": [
      "Patate à cordes"
    ],
    "reefCode": null,
    "uicn": null,
    "sense": "positif",
    "role": "Plante rampante pionnière : ses longues tiges courent sur la plage et retiennent le sable, ce qui protège le rivage de l’érosion.",
    "positive": null,
    "negative": null,
    "clues": [
      "Je pousse dans le sable.",
      "J'ai une fleur violette.",
      "Mes feuilles ressemblent à un petit sabot."
    ],
    "cluesExpert": [
      "Mes longues tiges aident à retenir le sable.",
      "Mes feuilles ressemblent à une empreinte de sabot.",
      "Mes fleurs sont violettes ou roses."
    ],
    "image": "/images/reef-check/patate-a-durand.webp"
  },
  {
    "id": "porcher",
    "name": "Porcher",
    "theme": "flore",
    "group": "plante",
    "origin": "carte_classe",
    "scientific": "Thespesia populnea",
    "otherNames": [
      "Miro",
      "Bois de rose d'Océanie"
    ],
    "reefCode": null,
    "uicn": null,
    "sense": "positif",
    "role": "Arbre du littoral de la famille de l’hibiscus, aux feuilles en forme de cœur. Il apporte de l’ombre et abrite la petite faune du bord de mer.",
    "positive": null,
    "negative": null,
    "clues": [
      "Je suis un arbre.",
      "Mes feuilles ont la forme d'un cœur.",
      "Ma fleur est jaune avec du rouge au milieu."
    ],
    "cluesExpert": [
      "Mes feuilles ont la forme d'un cœur.",
      "Ma grande fleur est jaune avec un centre rouge foncé.",
      "Je fais partie de la même famille que l'hibiscus."
    ],
    "image": "/images/reef-check/porcher.webp"
  },
  {
    "id": "liane-cochon",
    "name": "Liane Cochon",
    "theme": "flore",
    "group": "plante",
    "origin": "carte_classe",
    "scientific": "Canavalia rosea",
    "otherNames": [
      "Patate cochon",
      "Pois bord-de-mer"
    ],
    "reefCode": null,
    "uicn": null,
    "sense": "positif",
    "role": "Plante rampante qui résiste au sel, au vent et à la sécheresse. Elle couvre le sable et aide à le maintenir en place.",
    "positive": null,
    "negative": null,
    "clues": [
      "Je vis près de la plage.",
      "Mes feuilles vont par trois.",
      "J'ai de jolies fleurs roses ou violettes."
    ],
    "cluesExpert": [
      "Mes feuilles sont composées de trois folioles.",
      "Mes fleurs sont roses à violettes.",
      "Je résiste au sel, au vent et à la sécheresse."
    ],
    "image": "/images/reef-check/liane-cochon.webp"
  },
  {
    "id": "veloutier-bord-de-mer",
    "name": "Veloutier Bord de Mer",
    "theme": "flore",
    "group": "plante",
    "origin": "complement_ame",
    "scientific": "Scaevola taccada",
    "otherNames": [
      "Manioc marron bord de mer"
    ],
    "reefCode": null,
    "uicn": null,
    "sense": "positif",
    "role": "Arbuste indigène brise-vent qui retient le sable de la dune face à la houle et abrite la petite faune du littoral.",
    "positive": null,
    "negative": null,
    "clues": [
      "Je suis un arbuste qui protège la plage contre le vent et les vagues.",
      "Mes petites fleurs blanches ont l'air d'être coupées en deux.",
      "Mes fruits sont de petites boules blanches."
    ],
    "cluesExpert": [
      "Je suis un arbuste indigène essentiel pour freiner l'érosion du sable.",
      "Mes fleurs blanches parfumées forment une demi-corolle très reconnaissable.",
      "Mes fruits blancs flottent sur la mer pour aller germer sur d'autres plages."
    ],
    "image": "/images/reef-check/veloutier-bord-de-mer.webp"
  },
  {
    "id": "filao",
    "name": "Filao",
    "theme": "flore",
    "group": "plante",
    "origin": "complement_ame",
    "scientific": "Casuarina equisetifolia",
    "otherNames": [],
    "reefCode": null,
    "uicn": null,
    "sense": "positif",
    "role": "Grand arbre introduit qui offre une ombre précieuse sur l'arrière-plage de l'Ermitage, mais dont le tapis d'aiguilles gêne parfois la pousse des plantes indigènes.",
    "positive": null,
    "negative": null,
    "clues": [
      "Je suis un grand arbre qui donne beaucoup d'ombre derrière la plage de l'Ermitage.",
      "Mes fines brindilles vertes ressemblent à des aiguilles de pin.",
      "Mes petits fruits durs et piquants tombent sur le sable."
    ],
    "cluesExpert": [
      "Je suis le grand arbre emblématique des pique-niques à l'Ermitage, arrivé d'Australie.",
      "Le vent fait chanter mes longs rameaux fins articulés qu'on prend souvent pour des aiguilles.",
      "En tombant au sol, mon épais tapis d'aiguilles empêche parfois les plantes indigènes de pousser."
    ],
    "image": "/images/reef-check/filao.webp"
  },
  {
    "id": "pourpier-bord-de-mer",
    "name": "Pourpier Bord de Mer",
    "theme": "flore",
    "group": "plante",
    "origin": "complement_ame",
    "scientific": "Sesuvium portulacastrum",
    "otherNames": [],
    "reefCode": null,
    "uicn": null,
    "sense": "positif",
    "role": "Plante grasse pionnière qui supporte le sel, stocke l'eau dans ses feuilles charnues et aide à fixer le sable en haut de plage.",
    "positive": null,
    "negative": null,
    "clues": [
      "Je rampe sur le sable tout près de l'eau salée.",
      "Mes petites feuilles sont épaisses et gorgées d'eau.",
      "J'ai de petites fleurs roses en forme d'étoile."
    ],
    "cluesExpert": [
      "Je suis une plante grasse indigène capable de pousser dans le sable très salé.",
      "Mes tiges souvent rougeâtres s'enracinent pour retenir le sable de la plage.",
      "Mes feuilles charnues me servent de réserve d'eau douce pendant la sécheresse."
    ],
    "image": "/images/reef-check/pourpier-bord-de-mer.webp"
  },
  {
    "id": "corail-dur-acropora",
    "name": "Corail dur branchu (Acropora)",
    "theme": "substrats",
    "group": "corail",
    "origin": "carte_classe",
    "scientific": "Scleractinia",
    "otherNames": [],
    "reefCode": "COD",
    "uicn": null,
    "sense": "equilibre",
    "role": "Vivant - animal. Abri pour petits poissons ; croissance rapide du récif.",
    "positive": "Bon signe si nombreuses branches colorées",
    "negative": "Mauvais signe si blanchit ou se casse facilement",
    "clues": [
      "Je pousse très vite dans le récif.",
      "J'ai des branches fragiles.",
      "Je me casse facilement."
    ],
    "cluesExpert": null,
    "image": "/images/reef-check/corail-dur-acropora.webp"
  },
  {
    "id": "corail-dur-acropora-tabulaire",
    "name": "Corail dur tabulaire",
    "theme": "substrats",
    "group": "corail",
    "origin": "carte_classe",
    "scientific": "Scleractinia",
    "otherNames": [],
    "reefCode": "COD",
    "uicn": null,
    "sense": "equilibre",
    "role": "Vivant - animal. Crée de l'ombre, abri pour poissons et invertébrés.",
    "positive": "Bon signe si forme intacte et colorée",
    "negative": "Mauvais signe si cassé ou blanchi",
    "clues": [
      "Je crée de l'ombre sur le récif.",
      "Ma forme est plate.",
      "Je ressemble à une table."
    ],
    "cluesExpert": null,
    "image": "/images/reef-check/corail-dur-acropora-tabulaire.webp"
  },
  {
    "id": "corail-dur-cerveau",
    "name": "Corail dur cerveau",
    "theme": "substrats",
    "group": "corail",
    "origin": "carte_classe",
    "scientific": "Scleractinia",
    "otherNames": [],
    "reefCode": "COD",
    "uicn": null,
    "sense": "equilibre",
    "role": "Vivant - animal. Abri pour petites espèces ; récif ancien et stable.",
    "positive": "Bien formé et coloré",
    "negative": "Mauvais signe si blanchit et se couvre d'algues",
    "clues": [
      "Je fais partie des récifs anciens.",
      "Je suis très solide.",
      "Ma surface ressemble à un cerveau."
    ],
    "cluesExpert": null,
    "image": "/images/reef-check/corail-dur-cerveau.webp"
  },
  {
    "id": "corail-dur-porites",
    "name": "Corail dur massif (Porites)",
    "theme": "substrats",
    "group": "corail",
    "origin": "carte_classe",
    "scientific": "Scleractinia",
    "otherNames": [],
    "reefCode": "COD",
    "uicn": null,
    "sense": "equilibre",
    "role": "Vivant - animal. Construit le récif ; abri pour de nombreux poissons.",
    "positive": "Bon signe si coloré et vivant",
    "negative": "Mauvais signe si blanchit",
    "clues": [
      "Je construis le récif lentement et je dure longtemps.",
      "Je suis dur, immobile et en grosses boules.",
      "Je blanchis quand le récif va mal."
    ],
    "cluesExpert": null,
    "image": "/images/reef-check/corail-dur-porites.webp"
  },
  {
    "id": "corail-mou",
    "name": "Corail mou",
    "theme": "substrats",
    "group": "corail",
    "origin": "carte_classe",
    "scientific": "Alcyonacea",
    "otherNames": [],
    "reefCode": "CMO",
    "uicn": null,
    "sense": "equilibre",
    "role": "Vivant - animal. Abri pour les petits animaux ; ne construit pas le récif.",
    "positive": "Présent avec du corail vivant",
    "negative": "Devient dominant à la place du corail dur",
    "clues": [
      "Je suis un animal marin.",
      "Je ne construis pas le récif.",
      "Je suis mou et je bouge avec les vagues."
    ],
    "cluesExpert": null,
    "image": "/images/reef-check/corail-mou.webp"
  },
  {
    "id": "corail-recemment-mort",
    "name": "Corail récemment mort",
    "theme": "substrats",
    "group": "corail",
    "origin": "carte_classe",
    "scientific": "Scleractinia",
    "otherNames": [],
    "reefCode": "CRM",
    "uicn": null,
    "sense": "negatif",
    "role": "Non vivant (anciennement vivant). Peut être colonisé par des algues ; fragilise le récif.",
    "positive": null,
    "negative": "Stress récent du récif (chaleur, pollution, piétinement)",
    "clues": [
      "Je montre un stress récent du récif.",
      "Je n'ai plus de couleur.",
      "J'étais vivant avant."
    ],
    "cluesExpert": null,
    "image": "/images/reef-check/corail-recemment-mort.webp"
  },
  {
    "id": "algues-sur-coraux-morts",
    "name": "Algues sur coraux morts",
    "theme": "substrats",
    "group": "algue",
    "origin": "carte_classe",
    "scientific": null,
    "otherNames": [],
    "reefCode": "ALG",
    "uicn": null,
    "sense": "equilibre",
    "role": "Vivant - algues. Nourrit certains poissons herbivores, occupe l'espace laissé par les coraux morts.",
    "positive": "Petite quantité",
    "negative": "Devient dominant à la place du corail dur",
    "clues": [
      "Je prends la place laissée libre.",
      "Je pousse sur du corail mort.",
      "Je suis une algue."
    ],
    "cluesExpert": null,
    "image": "/images/reef-check/algues-sur-coraux-morts.webp"
  },
  {
    "id": "macroalgues-molles",
    "name": "Macroalgues molles",
    "theme": "substrats",
    "group": "algue",
    "origin": "carte_classe",
    "scientific": "Lobophora sp.",
    "otherNames": [],
    "reefCode": "MAM",
    "uicn": null,
    "sense": "equilibre",
    "role": "Vivant - algues. Nourrit certains poissons herbivores, occupe l'espace disponible sur le récif, produit de l'oxygène.",
    "positive": "Petite quantité",
    "negative": "Très abondantes, recouvrent les roches et les coraux morts",
    "clues": [
      "Je deviens abondante quand le récif va mal.",
      "Je suis grande et bien visible.",
      "Je bouge avec les vagues."
    ],
    "cluesExpert": null,
    "image": "/images/reef-check/macroalgues-molles.webp"
  },
  {
    "id": "eponge",
    "name": "Éponge tubulaire",
    "theme": "substrats",
    "group": "eponge",
    "origin": "carte_classe",
    "scientific": "Porifera",
    "otherNames": [],
    "reefCode": "EPO",
    "uicn": null,
    "sense": "equilibre",
    "role": "Vivant - animal. Filtre l'eau du lagon, améliore la qualité de l'eau, sert d'abri à de petits animaux.",
    "positive": "Bien si associée à des coraux vivants",
    "negative": "Remplace le corail dur",
    "clues": [
      "Je suis un animal qui filtre l'eau.",
      "Je sers d'abri à de petits animaux.",
      "Je peux être en forme de tube."
    ],
    "cluesExpert": null,
    "image": "/images/reef-check/eponge.webp"
  },
  {
    "id": "eponge-dysidea",
    "name": "Éponge Dysidea",
    "theme": "substrats",
    "group": "eponge",
    "origin": "carte_classe",
    "scientific": "Porifera (Dysidea)",
    "otherNames": [],
    "reefCode": "EPO",
    "uicn": null,
    "sense": "equilibre",
    "role": "Vivant - animal. Filtre l'eau du lagon, améliore la qualité de l'eau, sert d'abri à de petits animaux.",
    "positive": "Bien si présente en quantité normale, associée à des coraux vivants",
    "negative": "Abondante, indique une eau polluée",
    "clues": [
      "Je suis un animal qui filtre l'eau du lagon.",
      "J'ai une texture spongieuse.",
      "Je peux faire penser à un cerveau."
    ],
    "cluesExpert": null,
    "image": "/images/reef-check/eponge-dysidea.webp"
  },
  {
    "id": "debris-coralliens",
    "name": "Débris coralliens",
    "theme": "substrats",
    "group": "inerte",
    "origin": "carte_classe",
    "scientific": null,
    "otherNames": [],
    "reefCode": "DEB",
    "uicn": null,
    "sense": "negatif",
    "role": "Non vivant. Peut servir d'abri temporaire, témoigne d'un récif cassé.",
    "positive": null,
    "negative": "Récif endommagé (tempêtes, piétinement, blanchissement)",
    "clues": [
      "Je montre un récif abîmé.",
      "Je suis dur et cassé.",
      "Je suis en morceaux."
    ],
    "cluesExpert": null,
    "image": "/images/reef-check/debris-coralliens.webp"
  },
  {
    "id": "sable",
    "name": "Sable",
    "theme": "substrats",
    "group": "inerte",
    "origin": "carte_classe",
    "scientific": null,
    "otherNames": [],
    "reefCode": "SAB",
    "uicn": null,
    "sense": "equilibre",
    "role": "Non vivant. Habitat pour animaux enfouis ; zone de repos pour certaines espèces.",
    "positive": "Présent dans les zones prévues du lagon",
    "negative": "Recouvre les récifs coralliens",
    "clues": [
      "Je ne suis pas vivant.",
      "Je suis formé de petits grains.",
      "Je roule avec les vagues."
    ],
    "cluesExpert": null,
    "image": "/images/reef-check/sable.webp"
  },
  {
    "id": "vase",
    "name": "Vase",
    "theme": "substrats",
    "group": "inerte",
    "origin": "carte_classe",
    "scientific": null,
    "otherNames": [],
    "reefCode": "VAS",
    "uicn": null,
    "sense": "negatif",
    "role": "Non vivant. Peut étouffer les coraux, réduit la lumière.",
    "positive": null,
    "negative": "Apports venant de la terre (pluie, pollution)",
    "clues": [
      "Je viens souvent de la terre.",
      "Je trouble l'eau.",
      "Je suis une boue fine."
    ],
    "cluesExpert": null,
    "image": "/images/reef-check/vase.webp"
  },
  {
    "id": "herbier-marin",
    "name": "Herbier marin",
    "theme": "substrats",
    "group": "algue",
    "origin": "complement_ame",
    "scientific": "Syringodium isoetifolium",
    "otherNames": [],
    "reefCode": "HER",
    "uicn": null,
    "sense": "equilibre",
    "role": "Vivant - plante marine à fleurs (phanérogame). Nourriture principale de la tortue verte, produit de l'oxygène, stabilise le sable et sert de nurserie aux jeunes poissons.",
    "positive": "Prairie dense et bien verte : eau de bonne qualité et lagon en bonne santé",
    "negative": "Régression de l'herbier : pollution de l'eau, ensablement ou piétinement",
    "clues": [
      "Contrairement aux algues, je suis une vraie plante marine avec des racines dans le sable.",
      "Je sers de nurserie aux bébés poissons et je produis de l'oxygène dans le lagon.",
      "Je forme des prairies sous-marines dont raffole la tortue verte."
    ],
    "cluesExpert": null,
    "image": "/images/reef-check/herbier-marin.webp"
  },
  {
    "id": "poisson-perroquet",
    "name": "Poisson perroquet",
    "theme": "poissons-tortues",
    "group": "poisson",
    "origin": "carte_classe",
    "scientific": "Scaridae",
    "otherNames": [],
    "reefCode": null,
    "uicn": {
      "code": "LC",
      "label": "Préoccupation mineure (LC)"
    },
    "sense": "positif",
    "role": "Nettoie le récif, essentiel à sa bonne santé. Régime : algues, corail (broie les coraux et rejette du sable).",
    "positive": null,
    "negative": null,
    "clues": [
      "Je participe à la fabrication du sable du lagon.",
      "Je suis très coloré et je nettoie le récif en mangeant des algues.",
      "J'ai un bec solide comme celui d'un perroquet et je broie le corail."
    ],
    "cluesExpert": null,
    "image": "/images/reef-check/poisson-perroquet.webp"
  },
  {
    "id": "chirurgien-bagnard",
    "name": "Chirurgien bagnard",
    "theme": "poissons-tortues",
    "group": "poisson",
    "origin": "carte_classe",
    "scientific": "Acanthurus triostegus",
    "otherNames": [],
    "reefCode": null,
    "uicn": {
      "code": "LC",
      "label": "Préoccupation mineure (LC)"
    },
    "sense": "positif",
    "role": "Indique un bon équilibre algues / récif. Régime : algues.",
    "positive": null,
    "negative": null,
    "clues": [
      "Je mange surtout des algues et j'aide à empêcher qu'elles envahissent le récif.",
      "Je vis en groupe et j'ai un corps plutôt plat.",
      "Je suis clair avec des rayures noires verticales et une nageoire jaune bien visible."
    ],
    "cluesExpert": null,
    "image": "/images/reef-check/chirurgien-bagnard.webp"
  },
  {
    "id": "poisson-papillon",
    "name": "Poisson papillon",
    "theme": "poissons-tortues",
    "group": "poisson",
    "origin": "carte_classe",
    "scientific": "Chaetodon sp.",
    "otherNames": [],
    "reefCode": null,
    "uicn": {
      "code": "LC",
      "label": "Préoccupation mineure (LC)"
    },
    "sense": "positif",
    "role": "Indique la présence de coraux vivants, récif en bonne santé. Régime : polypes, petits invertébrés.",
    "positive": null,
    "negative": null,
    "clues": [
      "Ma présence montre qu'il y a encore des coraux vivants en bonne santé.",
      "Je mange des petits animaux fixés sur le récif et je vis souvent en couple.",
      "Je suis jaune et blanc avec une bande noire sur l'œil, et mon corps est plat comme une feuille."
    ],
    "cluesExpert": null,
    "image": "/images/reef-check/poisson-papillon.webp"
  },
  {
    "id": "idole-des-maures",
    "name": "Idole des Maures",
    "theme": "poissons-tortues",
    "group": "poisson",
    "origin": "carte_classe",
    "scientific": "Zanclus cornutus",
    "otherNames": [
      "Zancle cornu"
    ],
    "reefCode": null,
    "uicn": {
      "code": "LC",
      "label": "Préoccupation mineure (LC)"
    },
    "sense": "positif",
    "role": "Présente dans les récifs en bonne santé. Régime : éponges, algues, petits invertébrés.",
    "positive": null,
    "negative": null,
    "clues": [
      "Je suis souvent observé dans les récifs en bonne santé.",
      "J'ai un corps plat et je me déplace souvent en couple.",
      "Je suis noir, blanc et jaune avec un long filament sur le dos."
    ],
    "cluesExpert": null,
    "image": "/images/reef-check/idole-des-maures.webp"
  },
  {
    "id": "demoiselle-a-trois-bandes",
    "name": "Demoiselle à trois bandes",
    "theme": "poissons-tortues",
    "group": "poisson",
    "origin": "carte_classe",
    "scientific": "Dascyllus aruanus",
    "otherNames": [],
    "reefCode": null,
    "uicn": {
      "code": "LC",
      "label": "Préoccupation mineure (LC)"
    },
    "sense": "positif",
    "role": "Vit dans les coraux branchus, présente quand les coraux sont vivants. Régime : plancton, petits invertébrés, algues.",
    "positive": null,
    "negative": null,
    "clues": [
      "Je vis uniquement là où les coraux branchus sont en bonne santé.",
      "Je suis petite et très territoriale.",
      "Je suis blanche avec trois bandes noires verticales."
    ],
    "cluesExpert": null,
    "image": "/images/reef-check/demoiselle-a-trois-bandes.webp"
  },
  {
    "id": "demoiselle-bleue-verte",
    "name": "Demoiselle bleue verte",
    "theme": "poissons-tortues",
    "group": "poisson",
    "origin": "carte_classe",
    "scientific": "Chromis viridis",
    "otherNames": [],
    "reefCode": null,
    "uicn": {
      "code": "LC",
      "label": "Préoccupation mineure (LC)"
    },
    "sense": "positif",
    "role": "Vit dans un récif structuré et vivant. Régime : plancton.",
    "positive": null,
    "negative": null,
    "clues": [
      "Je vis en grands groupes au-dessus des récifs bien structurés.",
      "Je me nourris de plancton et je nage sans cesse.",
      "Je suis petite et brillante, de couleur bleu-vert."
    ],
    "cluesExpert": null,
    "image": "/images/reef-check/demoiselle-bleue-verte.webp"
  },
  {
    "id": "demoiselle-noire-gregoire",
    "name": "Demoiselle noire (Grégoire)",
    "theme": "poissons-tortues",
    "group": "poisson",
    "origin": "carte_classe",
    "scientific": "Stegastes nigricans",
    "otherNames": [],
    "reefCode": null,
    "uicn": {
      "code": "LC",
      "label": "Préoccupation mineure (LC)"
    },
    "sense": "negatif",
    "role": "En grand nombre indique un récif dégradé. Régime : algues.",
    "positive": null,
    "negative": null,
    "clues": [
      "Quand nous sommes très nombreuses, cela indique que le récif est dégradé.",
      "Je défends farouchement mon territoire et je cultive des algues sur le corail mort.",
      "Je suis un petit poisson noir avec une rayure blanche verticale."
    ],
    "cluesExpert": null,
    "image": "/images/reef-check/demoiselle-noire-gregoire.webp"
  },
  {
    "id": "murene-etoilee",
    "name": "Murène étoilée",
    "theme": "poissons-tortues",
    "group": "poisson",
    "origin": "carte_classe",
    "scientific": "Echidna nebulosa",
    "otherNames": [],
    "reefCode": null,
    "uicn": {
      "code": "LC",
      "label": "Préoccupation mineure (LC)"
    },
    "sense": "positif",
    "role": "Indique un récif vivant avec des cachettes. Régime : crustacés, mollusques, petits poissons.",
    "positive": null,
    "negative": null,
    "clues": [
      "J'ai besoin de cachettes dans le récif pour vivre.",
      "Je chasse surtout la nuit et je vis seule.",
      "Mon corps est long comme un serpent et couvert de petites taches sombres."
    ],
    "cluesExpert": null,
    "image": "/images/reef-check/murene-etoilee.webp"
  },
  {
    "id": "merou-tapis",
    "name": "Mérou tapis",
    "theme": "poissons-tortues",
    "group": "poisson",
    "origin": "carte_classe",
    "scientific": "Epinephelus sp.",
    "otherNames": [],
    "reefCode": null,
    "uicn": {
      "code": "VU",
      "label": "Vulnérable : menacé d'extinction"
    },
    "sense": "positif",
    "role": "Indique un récif équilibré, chaîne alimentaire complète. Régime : poissons et crustacés.",
    "positive": null,
    "negative": null,
    "clues": [
      "Ma présence montre que la chaîne alimentaire est complète.",
      "Je suis un gros prédateur solitaire.",
      "Je suis trapu, brun tacheté et je peux devenir très grand."
    ],
    "cluesExpert": null,
    "image": "/images/reef-check/merou-tapis.webp"
  },
  {
    "id": "raie-fouet",
    "name": "Raie fouet",
    "theme": "poissons-tortues",
    "group": "raie",
    "origin": "carte_classe",
    "scientific": "Maculabatis sp.",
    "otherNames": [],
    "reefCode": null,
    "uicn": {
      "code": "VU",
      "label": "Vulnérable"
    },
    "sense": "positif",
    "role": "Indique des fonds sableux en bon état. Régime : mollusques, crustacés.",
    "positive": null,
    "negative": null,
    "clues": [
      "Je vis sur les fonds sableux bien préservés.",
      "Mon corps est plat et j'ai une longue queue fine.",
      "Je ressemble à un tapis posé sur le sable."
    ],
    "cluesExpert": null,
    "image": "/images/reef-check/raie-fouet.webp"
  },
  {
    "id": "raie-aigle-tachetee",
    "name": "Raie aigle tachetée",
    "theme": "poissons-tortues",
    "group": "raie",
    "origin": "carte_classe",
    "scientific": "Aetobatus ocellatus",
    "otherNames": [],
    "reefCode": null,
    "uicn": {
      "code": "EN",
      "label": "En danger"
    },
    "sense": "positif",
    "role": "A besoin d'un lagon calme et riche. Régime : coquillages.",
    "positive": null,
    "negative": null,
    "clues": [
      "J'ai besoin d'un lagon calme et riche pour vivre.",
      "Je nage grâce à de grandes \"ailes\".",
      "Je suis très grande, sombre avec des taches blanches."
    ],
    "cluesExpert": null,
    "image": "/images/reef-check/raie-aigle-tachetee.webp"
  },
  {
    "id": "tortue-verte",
    "name": "Tortue verte",
    "theme": "poissons-tortues",
    "group": "tortue",
    "origin": "carte_classe",
    "scientific": "Chelonia mydas",
    "otherNames": [],
    "reefCode": null,
    "uicn": {
      "code": "EN",
      "label": "Espèce menacée d'extinction"
    },
    "sense": "positif",
    "role": "Indique des herbiers en bon état ; ceux-ci sont sensibles à la pollution. Régime : herbiers marins.",
    "positive": null,
    "negative": null,
    "clues": [
      "Je suis très sensible à la pollution et je mange des plantes marines.",
      "Je suis grande, je nage lentement et je vis seule.",
      "J'ai une grande carapace ovale et je broute les herbiers."
    ],
    "cluesExpert": null,
    "image": "/images/reef-check/tortue-verte.webp"
  },
  {
    "id": "tortue-imbriquee",
    "name": "Tortue imbriquée",
    "theme": "poissons-tortues",
    "group": "tortue",
    "origin": "carte_classe",
    "scientific": "Eretmochelys imbricata",
    "otherNames": [],
    "reefCode": null,
    "uicn": {
      "code": "CR",
      "label": "En danger critique, très fortement menacée"
    },
    "sense": "positif",
    "role": "Dépend d'un récif en bonne santé. Régime : éponges.",
    "positive": null,
    "negative": null,
    "clues": [
      "Mon alimentation dépend d'un récif en très bonne santé.",
      "Je me nourris surtout d'éponges.",
      "Ma carapace est dentelée avec des plaques imbriquées."
    ],
    "cluesExpert": null,
    "image": "/images/reef-check/tortue-imbriquee.webp"
  },
  {
    "id": "poisson-clown",
    "name": "Poisson-clown de Maurice",
    "theme": "poissons-tortues",
    "group": "poisson",
    "origin": "complement_ame",
    "scientific": "Amphiprion chrysogaster",
    "otherNames": [
      "Poisson-clown des Mascareignes"
    ],
    "reefCode": null,
    "uicn": {
      "code": "LC",
      "label": "Endémique des Mascareignes (raréfié dans le lagon)"
    },
    "sense": "positif",
    "role": "Espèce endémique des Mascareignes, dépend directement de la survie des anémones de mer (très sensibles au réchauffement de l'eau). Régime : plancton, petites proies et algues.",
    "positive": null,
    "negative": null,
    "clues": [
      "Je vis uniquement dans notre région de l'océan Indien et je disparais si la mer chauffe trop.",
      "Je vis protégé au milieu des tentacules urticants d'une anémone de mer.",
      "J'ai le ventre jaune-orangé, le dos sombre et trois bandes blanches."
    ],
    "cluesExpert": null,
    "image": "/images/reef-check/poisson-clown.webp"
  },
  {
    "id": "baliste-picasso",
    "name": "Baliste Picasso",
    "theme": "poissons-tortues",
    "group": "poisson",
    "origin": "complement_ame",
    "scientific": "Rhinecanthus aculeatus",
    "otherNames": [
      "Poisson cochon"
    ],
    "reefCode": null,
    "uicn": {
      "code": "LC",
      "label": "Préoccupation mineure (LC)"
    },
    "sense": "positif",
    "role": "Prédateur naturel des oursins qui régule leur population dans le lagon peu profond. Régime : oursins, petits crabes, coquillages et algues.",
    "positive": null,
    "negative": null,
    "clues": [
      "Je croque des oursins et des crabes, et je grogne sous l'eau quand on approche de mon nid !",
      "Je peux bloquer une épine sur mon dos pour me coincer dans un trou du corail.",
      "Mes motifs géométriques jaunes, bleus et noirs ressemblent à la peinture d'un célèbre artiste."
    ],
    "cluesExpert": null,
    "image": "/images/reef-check/baliste-picasso.webp"
  },
  {
    "id": "holothurie-concombre-de-mer",
    "name": "Holothurie (concombre de mer)",
    "theme": "invertebres",
    "group": "invertebre",
    "origin": "complement_ame",
    "scientific": "Holothuria atra",
    "otherNames": [],
    "reefCode": null,
    "uicn": {
      "code": "LC",
      "label": "Préoccupation mineure (LC)"
    },
    "sense": "positif",
    "role": "Véritable « aspirateur du lagon » : recycle et nettoie le sable du récif. Régime : détritivore (avale le sable, digère les débris organiques et rejette du sable propre).",
    "positive": null,
    "negative": null,
    "clues": [
      "On me surnomme l'aspirateur du lagon car j'avale le sable sale pour le nettoyer.",
      "Je suis un animal marin mou et allongé posé au fond de l'eau.",
      "Je suis noir et souvent saupoudré de sable blanc pour me protéger du soleil."
    ],
    "cluesExpert": null,
    "image": "/images/reef-check/holothurie-concombre-de-mer.webp"
  },
  {
    "id": "oursin-diademe",
    "name": "Oursin diadème",
    "theme": "invertebres",
    "group": "invertebre",
    "origin": "complement_ame",
    "scientific": "Diadema setosum",
    "otherNames": [],
    "reefCode": null,
    "uicn": {
      "code": "LC",
      "label": "Préoccupation mineure (LC)"
    },
    "sense": "equilibre",
    "role": "En quantité équilibrée, empêche les algues d'étouffer le corail ; en surnombre, signale un manque de poissons prédateurs. Régime : algues qu'il racle sur la roche et le corail mort.",
    "positive": null,
    "negative": null,
    "clues": [
      "Je sors la nuit pour brouter les algues sur le récif et j'abrite parfois de minuscules poissons.",
      "Si tu marches sur le platier sans regarder, tu risques de te piquer très fort !",
      "J'ai la forme d'une boule noire entourée de très longues épines fines."
    ],
    "cluesExpert": null,
    "image": "/images/reef-check/oursin-diademe.webp"
  },
  {
    "id": "benitier",
    "name": "Bénitier",
    "theme": "invertebres",
    "group": "invertebre",
    "origin": "complement_ame",
    "scientific": "Tridacna maxima",
    "otherNames": [],
    "reefCode": null,
    "uicn": {
      "code": "LC",
      "label": "Protégé dans la Réserve Marine (sensible au braconnage)"
    },
    "sense": "positif",
    "role": "Indique une eau claire et un récif bien protégé du braconnage. Régime : filtre le plancton de l'eau et vit en symbiose avec des micro-algues grâce à la lumière.",
    "positive": null,
    "negative": null,
    "clues": [
      "Je suis un coquillage bio-indicateur précieux qui filtre l'eau claire du lagon.",
      "Je vis fixé dans le récif et je referme ma coquille ondulée dès qu'une ombre passe.",
      "Mon manteau entrouvert affiche de superbes couleurs bleues ou vertes."
    ],
    "cluesExpert": null,
    "image": "/images/reef-check/benitier.webp"
  },
  {
    "id": "acanthaster-couronne-epines",
    "name": "Couronne d'épines (Acanthaster)",
    "theme": "invertebres",
    "group": "invertebre",
    "origin": "complement_ame",
    "scientific": "Acanthaster planci",
    "otherNames": [],
    "reefCode": null,
    "uicn": {
      "code": "LC",
      "label": "Espèce surveillée (proliférations menaçantes pour le corail)"
    },
    "sense": "negatif",
    "role": "En grand nombre, détruit rapidement le corail vivant en laissant un squelette tout blanc. Régime : corallivore (mange les polypes du corail vivant).",
    "positive": null,
    "negative": null,
    "clues": [
      "Quand je pullule, je deviens l'un des pires ennemis du récif car je dévore le corail vivant.",
      "Je possède entre dix et vingt bras couverts de piquants venimeux.",
      "Je suis une grande étoile de mer surveillée de près par Reef Check."
    ],
    "cluesExpert": null,
    "image": "/images/reef-check/acanthaster-couronne-epines.webp"
  },
  {
    "id": "bernard-l-ermite",
    "name": "Bernard-l'ermite",
    "theme": "invertebres",
    "group": "invertebre",
    "origin": "complement_ame",
    "scientific": "Calcinus elegans / Coenobita rugosus",
    "otherNames": [],
    "reefCode": null,
    "uicn": {
      "code": "LC",
      "label": "Préoccupation mineure (LC)"
    },
    "sense": "positif",
    "role": "Dépend de la présence de coquillages vides : ramasser des coquillages sur la plage le prive de maison. Régime : omnivore nettoyeur (algues, débris végétaux et animaux).",
    "positive": null,
    "negative": null,
    "clues": [
      "Si les promeneurs ramassent les coquillages vides sur la plage, je n'ai plus de maison pour grandir !",
      "Je suis un petit crustacé nettoyeur muni de pinces et d'antennes.",
      "Je cache mon ventre tout mou dans une coquille que je transporte sur mon dos."
    ],
    "cluesExpert": null,
    "image": "/images/reef-check/bernard-l-ermite.webp"
  }
];

export const POKEMON_CARDS: PokemonCardData[] = [
  {
    "id": "perrocrasaure",
    "number": "001",
    "name": "Le Pérrocrasaure",
    "firstName": "Maxime",
    "lastInitial": null,
    "lagoon": true,
    "inspiredBy": "Poisson-perroquet (producteur de sable du lagon)",
    "types": [
      "Eau",
      "Roche"
    ],
    "habitat": "En bancs de 50 à 100 individus dans le lagon",
    "rarity": "Légendaire du Lagon",
    "hp": 120,
    "description": "Les Pérrocrasaures vivent en bancs de 50 à 100 individus. Leur utilité dans le lagon, c'est qu'ils fabriquent du sable avec leurs nageoires et luttent contre l'érosion.",
    "attacks": [
      {
        "name": "Tornade de sable",
        "damage": 50,
        "effect": "Il tourne en lançant du sable avec ses nageoires et crée une tornade."
      },
      {
        "name": "Bulle",
        "damage": 0,
        "effect": "Permet de soigner ses blessures."
      },
      {
        "name": "Roulement",
        "damage": 60,
        "effect": "Il se met en boule et fonce sur son adversaire à une vitesse incroyable."
      },
      {
        "name": "Noyade",
        "damage": 70,
        "effect": "Submerge son adversaire sous une grande vague du lagon."
      }
    ],
    "art": "/images/pokemon-ia/perrocrasaure.webp",
    "original": "/images/pokemon-originaux/perrocrasaure.webp"
  },
  {
    "id": "assourdine",
    "number": "002",
    "name": "L'Assourdine",
    "firstName": "Maxime",
    "lastInitial": null,
    "lagoon": true,
    "inspiredBy": "Poisson herbivore nettoyeur de coraux / Sardine",
    "types": [
      "Eau",
      "Acier"
    ],
    "habitat": "Récif corallien du lagon",
    "rarity": "Ultra-Rare",
    "hp": 100,
    "description": "Avec sa tête dure comme l'acier, l'Assourdine picore les algues sur les coraux, et comme ça ils ne meurent pas !",
    "attacks": [
      {
        "name": "Piqué tranchant",
        "damage": 40,
        "effect": "Il attaque avec sa tête rapide comme un éclair."
      },
      {
        "name": "Épuisement",
        "damage": 30,
        "effect": "Il se faufile partout ; son adversaire s'épuise et subit des dégâts."
      },
      {
        "name": "Tête de fer",
        "damage": 70,
        "effect": "Percute son adversaire avec sa tête dure comme l'acier, telle une enclume."
      }
    ],
    "art": "/images/pokemon-ia/assourdine.webp",
    "original": "/images/pokemon-originaux/assourdine.webp"
  },
  {
    "id": "bernard-crocmite",
    "number": "003",
    "name": "Le Bernard Crocmite",
    "firstName": null,
    "lastInitial": null,
    "lagoon": true,
    "inspiredBy": "Bernard-l'ermite du lagon",
    "types": [
      "Eau",
      "Roche"
    ],
    "habitat": "Dans le lagon",
    "rarity": "Rare",
    "hp": 90,
    "description": "Il vit dans le lagon et protège le récif grâce à son appétit redoutable.",
    "attacks": [
      {
        "name": "Garde-Lagon",
        "damage": 50,
        "effect": "Il peut avaler les poissons qui ne sont pas bons pour le lagon."
      }
    ],
    "art": "/images/pokemon-ia/bernard-crocmite.webp",
    "original": "/images/pokemon-originaux/bernard-crocmite.webp"
  },
  {
    "id": "luffy",
    "number": "004",
    "name": "Luffy",
    "firstName": "Talya",
    "lastInitial": null,
    "lagoon": true,
    "inspiredBy": "Étoile de mer gardienne de la plage",
    "types": [
      "Eau"
    ],
    "habitat": "Plage et bord du lagon",
    "rarity": "Rare",
    "hp": 80,
    "description": "Capacité : Mignon et blagueur. Toujours prêt à filer à toute vitesse sur le sable !",
    "attacks": [
      {
        "name": "Éclair Propre",
        "damage": 40,
        "effect": "Rapide : en un clin d'œil, il nettoie toute la plage !"
      }
    ],
    "art": "/images/pokemon-ia/luffy.webp",
    "original": "/images/pokemon-originaux/luffy.webp"
  },
  {
    "id": "peche-heure",
    "number": "005",
    "name": "Pêche-heure",
    "firstName": null,
    "lastInitial": null,
    "lagoon": true,
    "inspiredBy": "Jeu de mots marin Pêcheur / Pêche / Heure",
    "types": [
      "Eau"
    ],
    "habitat": "Sur un pêcher accroché à la coque d'un bateau",
    "rarity": "Rare",
    "hp": 90,
    "description": "Mon Pokémon Pêche-heure a trois parties : la tête c'est une pêche, le corps c'est une horloge et les bras ce sont des filets de pêche, et il est de type Eau !",
    "attacks": [
      {
        "name": "Attaque de jus",
        "damage": 30,
        "effect": "Éclabousse l'adversaire d'un jet de jus sucré."
      },
      {
        "name": "Retour au passé",
        "damage": 0,
        "effect": "Remonte les aiguilles de son horloge pour annuler la dernière erreur."
      },
      {
        "name": "Filet de poissons",
        "damage": 50,
        "effect": "Capture l'adversaire dans ses deux bras-filets."
      }
    ],
    "art": "/images/pokemon-ia/peche-heure.webp",
    "original": "/images/pokemon-originaux/peche-heure.webp"
  },
  {
    "id": "bulubul",
    "number": "006",
    "name": "Bulubul",
    "firstName": "Candice",
    "lastInitial": null,
    "lagoon": true,
    "inspiredBy": "Bulles d'écume et d'eau du lagon",
    "types": [
      "Eau"
    ],
    "habitat": "Écume et bulles du lagon",
    "rarity": "Peu commune",
    "hp": 80,
    "description": "Créature aquatique composée d'une multitude de bulles bleues scintillantes (annotation de l'élève : « couleurs au choix »).",
    "attacks": [
      {
        "name": "Danse de Bulles",
        "damage": 40,
        "effect": "Enveloppe l'adversaire dans un nuage de bulles bleues étincelantes."
      }
    ],
    "art": "/images/pokemon-ia/bulubul.webp",
    "original": "/images/pokemon-originaux/bulubul.webp"
  },
  {
    "id": "tortue-foret",
    "number": "007",
    "name": "Tortipousse",
    "firstName": null,
    "lastInitial": null,
    "lagoon": true,
    "inspiredBy": "Tortue & Flore du littoral réunionnais",
    "types": [
      "Plante",
      "Roche"
    ],
    "habitat": "Sous-bois littoral et jardin de l'AME",
    "rarity": "Ultra-Rare",
    "hp": 110,
    "description": "Tortue gardienne de la forêt littorale qui porte une jeune pousse verte vivante au sommet de sa carapace.",
    "attacks": [
      {
        "name": "Carapace-Racine",
        "damage": 60,
        "effect": "Protège les jeunes plantes du littoral avec sa carapace solide comme la roche."
      }
    ],
    "art": "/images/pokemon-ia/tortue-foret.webp",
    "original": "/images/pokemon-originaux/tortue-foret.webp"
  },
  {
    "id": "aeroflamme",
    "number": "008",
    "name": "Aéroflamme",
    "firstName": null,
    "lastInitial": null,
    "lagoon": false,
    "inspiredBy": "Oiseau jaune des forêts (type Tisserin / Bélier)",
    "types": [
      "Feu",
      "Vol",
      "Électrik"
    ],
    "habitat": "Dans la forêt",
    "rarity": "Rare",
    "hp": 90,
    "description": "Il vit dans la forêt et fend les airs à toute vitesse.",
    "attacks": [
      {
        "name": "Vol Supersonique Électrik",
        "damage": 60,
        "effect": "Il peut aller très, très vite quand il vole et lancer une décharge Électrik."
      }
    ],
    "art": "/images/pokemon-ia/aeroflamme.webp",
    "original": "/images/pokemon-originaux/aeroflamme.webp"
  },
  {
    "id": "chauveflamme",
    "number": "009",
    "name": "Chauveflamme",
    "firstName": null,
    "lastInitial": null,
    "lagoon": false,
    "inspiredBy": "Chauve-souris flamboyante des grottes",
    "types": [
      "Feu",
      "Vol",
      "Psy"
    ],
    "habitat": "Dans des grottes",
    "rarity": "Rare",
    "hp": 100,
    "description": "Créature mystérieuse des grottes volcaniques enveloppée d'ailes de feu.",
    "attacks": [
      {
        "name": "Souffle Ailé",
        "damage": 60,
        "effect": "Il jette des flammes en plein vol."
      }
    ],
    "art": "/images/pokemon-ia/chauveflamme.webp",
    "original": "/images/pokemon-originaux/chauveflamme.webp"
  },
  {
    "id": "flamemeche",
    "number": "010",
    "name": "Flamemèche",
    "firstName": "Isaure",
    "lastInitial": null,
    "lagoon": false,
    "inspiredBy": "Félin-renard de feu des montagnes",
    "types": [
      "Feu"
    ],
    "habitat": "Montagne",
    "rarity": "Rareté incroyable",
    "hp": 100,
    "description": "Rareté incroyable ! Vit dans la montagne sous le soleil.",
    "attacks": [
      {
        "name": "Boule de Feu",
        "damage": 60,
        "effect": "Lance des boules de feu avec sa bouche."
      }
    ],
    "art": "/images/pokemon-ia/flamemeche.webp",
    "original": "/images/pokemon-originaux/flamemeche.webp"
  },
  {
    "id": "cat-lover",
    "number": "011",
    "name": "Cat Lover",
    "firstName": null,
    "lastInitial": null,
    "lagoon": false,
    "inspiredBy": "Chat-cœur skateur",
    "types": [
      "Psy"
    ],
    "habitat": "Au skatepark",
    "rarity": "Peu commune",
    "hp": 80,
    "description": "Toujours sur son skateboard à roulettes près du front de mer !",
    "attacks": [
      {
        "name": "Vie en Cœur",
        "damage": 30,
        "effect": "Fait voir la vie en cœur à tous ceux qu'il croise."
      },
      {
        "name": "Hypnose Skate",
        "damage": 40,
        "effect": "Hypnotise son adversaire avec ses figures."
      }
    ],
    "art": "/images/pokemon-ia/cat-lover.webp",
    "original": "/images/pokemon-originaux/cat-lover.webp"
  },
  {
    "id": "flou-flou",
    "number": "012",
    "name": "Flou-flou",
    "firstName": null,
    "lastInitial": null,
    "lagoon": false,
    "inspiredBy": "Licorne-chiot ailé arc-en-ciel",
    "types": [
      "Vol",
      "Psy"
    ],
    "habitat": "Dans les nuages et les arcs-en-ciel",
    "rarity": "Rare",
    "hp": 90,
    "description": "Créature ailée à corne multicolore capable de souffler un tourbillon arc-en-ciel.",
    "attacks": [
      {
        "name": "Souffle Arc-en-ciel",
        "damage": 50,
        "effect": "Projette une vague de couleurs tourbillonnantes."
      }
    ],
    "art": "/images/pokemon-ia/flou-flou.webp",
    "original": "/images/pokemon-originaux/flou-flou.webp"
  }
];
