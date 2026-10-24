# Personnages comme supports de jeu — version classique

Le mémo Bluey utilise désormais de vraies images : chaque personnage est présent sur deux cartes avec exactement la même illustration. Huit personnages sont disponibles. Le petit parcours conserve cinq tailles de grille ; le grand parcours propose six étapes (2, 3, 4, 5, 6 puis 8 paires). Les visages restent cachés avant de retourner la carte, y compris pour les lecteurs d’écran. L’affichage des cartes ne dépend plus d’une rotation 3D, afin de rester lisible sur l’ancienne tablette Samsung.

Le jeu des couleurs utilise les corps des huit membres de la famille Barbapapa. Les derniers exercices font associer un personnage à une pastille neutre de même couleur. Les couleurs blanc, brun et gris utilisent des supports neutres, puisqu’aucun personnage retenu ne représente ces teintes. Les couleurs des personnages n’ont pas été modifiées.

Les images existantes sont issues des sites des personnages, conservées dans leur format source et incluses localement pour le mode hors connexion. Le détail des URL et crédits est dans assets/personnages/CREDITS.md et les deux manifestes. Les images du site Barbapapa sont des GIF comportant aussi des accessoires et décors. Ce Cahier de Lumi n’est pas une application officielle de ces séries.

Les petits noms anglais ne valident aucune compétence de déchiffrage français. Le jeu « Les paires des mots » conserve séparément les associations avec les mots du cursus déjà accessibles à l’enfant.

## Passage de niveau

Le bug venait du critère commun de progression : il exigeait 80 % de grilles sans aucune mauvaise paire. Explorer une mauvaise paire pouvait donc bloquer un enfant ayant pourtant retrouvé toutes les cartes. Pour les trois mémos, toutes les grilles réellement terminées ouvrent désormais l’étape suivante. Les mauvaises paires restent comptées pour les étoiles. Passer une grille ne constitue pas une grille terminée.

Les anciens résultats sont archivés sans être présentés comme des réussites aux nouvelles images. Les accès déjà ouverts sont conservés par taille de grille. Une ancienne série mémoire partielle est archivée ; les autres reprises, les étoiles, les décisions parentales et les compétences restent conservées.

## Vérification

- 64 mélanges par palier, identité/image exactement présente deux fois, aucun nom divulgué au dos, résolution par vrais clics, erreurs et fin unique.
- Couleurs : cible et alternatives, bonne/mauvaise réponse, transfert personnage vers pastille neutre.
- Progression : ancienne panne reproduite, série terminée avec une erreur, deux étoiles, vrai bouton Niveau suivant et ouverture du niveau 2. Jeux memo, memoG et memoMots testés.
- Archives et migration idempotente, données des autres jeux et de l’autre enfant préservées.
- Tests de compatibilité du démarrage classique, lecture, écriture, voix, fonctionnement hors connexion et accès Admin.
- Essais visuels dans le navigateur sur des profils de démonstration sans sauvegarde. Les appareils physiques de la famille n’ont pas été manipulés par l’agent.
