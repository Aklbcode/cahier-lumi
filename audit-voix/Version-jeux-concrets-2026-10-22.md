# Cahier de Lumi — version jeux concrets, 22 octobre 2026

## Changements livrés

Trois premiers trésors ouverts pour Luca et Lola, anneau troisième, trois étoiles attribuées une seule fois par profil. Les objets déjà possédés restent disponibles. Compteur en haut ; 3/2/1 étoiles selon les erreurs ; dix étoiles ouvrent un trésor, avec conservation du reste. Aucun diamant comme monnaie, trois objets équipés au maximum.

Jeux remaniés : différences entre deux scènes SVG originales, robot facteur à déplacement direct, papillon miroir. Sudoku en quatorze étapes (2 × 2, 3 × 3 puis 4 × 4), mémo en neuf étapes, suites des grands en treize étapes. Le mémo démarre par les images ; les mots appartiennent au répertoire de sons rencontrés. Correction du motif AABC absent et du calcul des erreurs du mémo. L’ancienne progression des jeux remaniés est archivée avant leur nouveau départ.

Nouveaux jeux : monstre gourmand, nombres à construire et décomposer, paniers pour les groupes égaux, petits gestes pour les maternelles. En lecture : fusion tactile des cartes, jetons pour les sons, graphèmes mobiles, transformation d’un seul phonème et douze livres de trois pages. Les graphèmes complexes restent ensemble, les lettres muettes sont conservées. Les livres plus avancés restent accessibles en écoute accompagnée ; une compréhension d’histoire ne valide pas la lecture orale autonome.

Activité conseillée, rappels ciblés des sons, traces de réussite seule/aidée/retrouvée plus tard. Reprise des exercices terminés d’une série de jeux ou d’un entraînement lecture/calcul ; l’item en cours redémarre avec ses erreurs et aides déjà comptées. Le défi sans aide redémarre entièrement après interruption. Pas de récompense double pour les exercices déjà terminés.

L’atelier devient une création de cartes de visite : prénom, lettres, symboles, dessin libre, déplacement et annulation, galerie et export SVG. Les anciennes cartes sont conservées. Le potager est retiré des entrées de jeu ; son code et ses données restent préservés, avec une note de reprise dans `PROJECT_NOTES.md`. La cuisine fonctionne sans récoltes pendant la pause.

Téléchargement facultatif des jeux et voix dans les options parents. Environ 200 Mo, sans données enfant dans le cache du service worker. Le téléchargement doit finir pour annoncer « prêt » ; une erreur reste explicite.

## Vérifications effectuées

- Tests du lecteur vocal, choix de voix, annulation, sons dédiés, sauvegardes historiques, objets et cycle des récompenses.
- 210 grilles de sudoku : lignes, colonnes et carrés valides ; solution unique ; solveur sans modification de la grille d’entrée.
- Modèles des différences et chemins du robot générés de manière répétée ; tous les motifs des suites générés sans erreur.
- Douze livres avec exigences de décodage explicites ; aucun livre annoncé déchiffrable au tout premier son.
- Atelier de mots : mots autorisés par les sons connus, un seul phonème changé, conservation des lettres muettes.
- Séparation des réussites aidées, autonomes et différées sur un exemple nouveau. Répéter le même exemple ne compte pas comme transfert.
- Reprise déterministe, dons idempotents, ancien apprentissage et cartes préservés ; texte des cartes échappé dans les exports.
- Cache hors connexion testé par simulation : téléchargement réussi, voix avec paramètres de version, navigation sans réseau, téléchargement incomplet.
- Essais visuels sur profils de démonstration : différences, robot, papillon, sudoku avancé, blocs et monstre ; création, dessin, sauvegarde et réouverture d’une carte ; bouton de reprise visible. Les essais de démonstration n’enregistrent pas de progression enfant.
- 982 consignes de lecture couvertes. Inventaire des nouvelles consignes et retours : zéro phrase manquante.
- 16 818 entrées audio, 10 942 enregistrements distincts, 172 fichiers, 199 916 160 octets : tous décodés sans anomalie de signal ou de bornes. Les nouveaux lots ont été divisés en fichiers inférieurs à 1,5 Mo pour éviter un gros chargement initial.

## Limites précises

Les essais automatisés et visuels ne constituent pas une observation d’utilisation par les deux enfants, ni une validation scientifique d’efficacité ou une certification des acquis scolaires. Aucun nouveau phonème de référence n’est généré : les sons dédiés de la version choisie sont conservés. Les nouvelles consignes et histoires utilisent la même Charline belge ; la lecture de page utilise un enregistrement complet pour garder la fluidité, avec mise en évidence de la page entière. L’écoute de mots reste disponible séparément.

Le mode hors connexion n’a pas été essayé en mode avion sur chaque appareil. Le cache dépend de l’espace et des règles du navigateur. L’enregistrement personnel de lecture, facultatif dans la proposition de marché, n’est pas activé.
