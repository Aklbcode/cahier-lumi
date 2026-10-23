# Le Cahier de Lumi

Jeux éducatifs pour Luca (5-6 ans, 1re primaire) et Lola (3 ans, maternelle) : lecture phonique, calcul, logique, grands jeux.

**Ouvrir :** https://aklbcode.github.io/cahier-lumi/

- iPad : ouvrir le lien dans Safari → bouton Partager → « Sur l’écran d’accueil ».
- Mac : ouvrir le lien dans Safari ou Chrome et l’ajouter aux favoris (ou au Dock).
- La progression est enregistrée sur chaque appareil. Espace parents (cadenas) → « Sur cet appareil » pour ouvrir directement le monde de Luca ou de Lola.
- Voix : banque féminine neuronale **Charline, français de Belgique**, choisie à l’écoute de deux extraits. Les fichiers sont préparés à l’avance dans `voix/` ; l’appareil n’utilise pas le service de voix pendant le jeu.
- Les sons de référence utilisent des enregistrements dédiés à vitesse d’origine. Une absence de fichier demande une nouvelle écoute et ne déclenche jamais une prononciation automatique de remplacement. Les bruitages baissent pendant la parole.
- Espace parents → Voix de Lumi : tester une consigne, un encouragement, une correction ou chacun des 13 sons voyelles, et régler la vitesse des consignes. Tous les messages utilisent Charline ; aucune voix de remplacement de l’appareil n’est utilisée automatiquement.

## Vérification des voix

Le moteur se trouve dans `speech-engine.js` ; les progrès gardent leur sauvegarde habituelle. `audit-voix/Voix-belge-et-sons-de-lecture.md` décrit la nouvelle version. L’ancien rapport est conservé pour retracer la première intervention. `audit-voix/controle-audio-belge.json` contient les contrôles de la nouvelle banque sonore.

Les tests du lecteur se lancent avec `node tests/speech.test.cjs`. `scripts/build_natural_voices.py` prépare les fichiers Charline avec `edge-tts==7.3.1`. Cette étape envoie les textes publics de l’application au service vocal Microsoft ; aucune progression, réponse d’enfant ou donnée de profil n’est envoyée. L’application publiée n’intègre ni clé de service ni bibliothèque de génération. `scripts/check_audio.py --bank voix/index-belge.json --output audit-voix/controle-audio-belge.json` décode et contrôle les fichiers. Les anciens scripts et fichiers Kokoro sont conservés à titre d’historique et ne sont plus chargés par le jeu.

## Interface simplifiée — 22 octobre 2026

- Cinq thèmes directs : Lire/Écouter, Calculer/Compter, Jouer, Créer, Découvrir.
- « Mon personnage » regroupe les 48 objets. Les accessoires restent libres ; les 40 trésors se débloquent progressivement. Trois objets disponibles au maximum peuvent être équipés. Un mot par objet. Le choix est enregistré séparément pour chaque enfant.
- Le compteur d’étoiles est visible en haut, juste à côté du cadenas. Chaque série donne trois étoiles sans erreur, deux avec une erreur, une au-delà. Dix étoiles débloquent le prochain trésor ; le reste est conservé (exemple : 9 + 3 → un trésor et 2 étoiles). Aucun diamant comme monnaie. Les anciens diamants deviennent des trésors disponibles, et les trésors déjà équipés ou historiquement gagnés sont conservés. Les grands totaux d’étoiles historiques ne deviennent pas le petit compteur.
- Les acquisitions et l’adaptation des exercices restent enregistrées et consultables dans l’espace parents. Les anciennes sauvegardes sont conservées.
- Le potager est en pause ; son code et ses données sont conservés. La cuisine reste disponible sans récoltes.
- La vitesse vocale se règle dans l’espace parents ; aucun bouton « Plus lent » dans les jeux.


## Jeux concrets et apports de l’analyse du marché

- Différences entre deux scènes originales : cinq étapes pour les petits, six pour les grands.
- Robot facteur en déplacements directs ; papillon miroir avec une à quatre couleurs à compléter.
- Sudoku : quatorze étapes, de 2 × 2 à 4 × 4. Mémo des mots : neuf étapes, de deux paires d’images à huit paires mot–image. Les mots sont filtrés par sons rencontrés.
- Suites : treize étapes chez les grands, depuis une alternance de deux couleurs. Le motif AABC manquant est corrigé.
- Monstre gourmand : collections puis additions/soustractions. Nombres à construire : blocs à toucher, deux parties colorées, ajouts et retraits. Paniers : groupes égaux, addition répétée et découverte de la multiplication.
- Petits gestes : une carotte par lapin, collections progressives pour les petits.
- Fusion : cartes à toucher ou glisser ; enregistrement syllabique dédié conservé. Atelier des mots : jetons pour les sons, graphèmes mobiles puis changement d’un seul son, lettres muettes conservées.
- Douze mini-livres de trois pages avec lecture mot à mot ou écoute ; leur classement dépend des graphèmes explicitement annotés. Une réussite de compréhension ne certifie jamais le décodage oral.
- Aides visuelles après des erreurs répétées dans les nouveaux jeux. Suivi séparé des réponses réussies seul, des reprises aidées et des réussites retrouvées un autre jour sur un exemple différent.
- Activité conseillée, rappels ciblés de sons à revoir, reprise déterministe des séries standard et des entraînements de lecture/calcul. L’exercice en cours redémarre ; ses erreurs et aides restent comptées. Un défi interrompu redémarre entièrement.
- Cartes de visite : lettres, symboles, dessin libre, déplacement, annulation, galerie et export SVG. Les anciennes cartes restent consultables.
- Options parents : téléchargement des jeux et de tous les enregistrements pour jouer hors connexion (environ 200 Mo). À faire en ligne ; le stockage du navigateur peut être supprimé par l’utilisateur ou le système.
- Don unique sur chacun des profils Luca/Lola : trois étoiles et les trois premiers trésors, avec l’anneau en troisième. Les trésors historiques ne sont pas retirés. Les nouveaux parcours de puzzles commencent simplement ; la progression précédente est archivée, sans effacer les acquis de lecture/calcul.

Vérifications : `tests/speech.test.cjs`, `tests/games.test.cjs`, `tests/offline.test.cjs`, couverture des nouvelles phrases et contrôle de tous les fichiers audio. Le test hors connexion simule téléchargements, lecture du cache et panne réseau ; ce n’est pas un essai en mode avion sur chaque appareil. Les essais d’interface utilisent un profil de démonstration sans sauvegarde.

Voir `PROJECT_NOTES.md` pour la reprise ultérieure du potager.


## Aide du parent — 23 octobre 2026

Cadenas → **Aider mon enfant**, placé tout en haut : choisissez Luca ou Lola, l’activité et l’étape. **Débloquer ici** ouvre l’accès ; **Passer cette épreuve** permet d’avancer sans réussir le défi. Le bouton **Annuler la dernière action** reste disponible si la progression concernée n’a pas changé depuis.

Un cadenas **Aide du parent** est aussi présent pendant les exercices. Après la vérification adulte habituelle, le panneau sélectionne le jeu et l’étape en cours. Les étapes passées manuellement restent signalées **passées par le parent**, séparément des défis réussis sans aide. Ces décisions n’ajoutent ni étoiles, ni réponses justes, ni compétences acquises. Les reprises d’exercices devenues obsolètes sont retirées ; les autres jeux et l’autre enfant sont préservés. Les anciens téléchargements hors connexion restent utilisables pendant la mise à jour.

## Lire, écrire et comprendre — 23 octobre 2026

- Douze formes script : démonstration, repassage, copie et rappel après modèle caché ; prégraphisme pour les petits et fiche A4 dans l’espace parents.
- Petits messages à composer, destinataire, espaces et point ; résultat conservé comme carte modifiable. Prérequis de lecture contrôlés.
- « Écoute et place » : relations spatiales, choix des objets, puis deux actions. « Histoire mélangée » : cinq récits originaux, deux à quatre scènes et questions de compréhension. Versions plus courtes pour Lola.
- Deux vraies questions pour chacun des douze petits livres ; mode d’écoute conservé, sans certification du décodage oral.
- Comptage des phonèmes sur lexique explicite ; mots à semi-voyelles non enseignées exclus du déchiffrage annoncé ; « nounours » corrigé. Les graphèmes ne sont plus pris pour des phonèmes par défaut.
- Quatre reprises dans « Mon petit rappel » ; exemples identifiés par contenu et réussites différées séparées des essais immédiats.
- 306 nouvelles phrases Charline ; sons de référence conservés. Les mises à jour du moteur et de l’index vocal prennent le réseau en priorité, avec repli hors connexion.

[Analyse et changements](analyses/Analyse-et-changements-2026-10-23.md) : panorama de 18 offres/éditions, dossier de recherche et correspondance avec les changements. Les tests logiciels ne constituent pas une étude d’efficacité de Lumi ni une certification de l’écriture manuscrite.

Sources des nouveaux modules : `learning-language-fragment.js` et `learning-writing-fragment.js`. `python3 scripts/integrate_learning.py` les intègre au HTML autonome. Vérification complémentaire : `node tests/literacy.test.cjs` et `node tests/writing.test.cjs`.


## Ordre progressif des jeux — 23 octobre 2026

Chaque thème affiche les activités dans un ordre stable, du point d’entrée le plus accessible vers les tâches demandant davantage de prérequis. Le classement concerne l’entrée des jeux ; leurs étapes internes continuent d’évoluer avec l’enfant. Tous les jeux restent accessibles et les sauvegardes conservent leurs identifiants.

- Luca, Lire : consignes et histoires orales, récit, syllabes, parcours sons–lettres, premier son, rappels, encodage et assemblage de mots, puis petits livres.
- Luca, Calculer : nombres manipulés, groupes égaux simples, parcours de calcul, marché, heure. Jouer : déplacements directs, appariement, mémoire, petites quantités, motifs, différences, déduction et grands labyrinthes.
- Lola, Écouter : imagier, consignes simples, histoires et livres accompagnés, chronologie puis syllabes. Compter : un objet pour chacun, tailles, petites quantités, nombres construits puis comparaison.
- Lola, Jouer : formes, ombres, petites quantités, positions, puzzle, différences, mémoire, motifs puis labyrinthe. Créer : couleurs, gestes, cartes.
- Luca, Créer : cartes libres, lettres guidées puis messages composés. Découvrir conserve la cuisine et les jeux de saison disponibles.

L’ordre est défini par `THEME_DIFFICULTY_ORDER`, appliqué après l’ajout de tous les jeux et des activités saisonnières. Les étoiles, trésors, étapes, acquis et reprises ne sont pas modifiés par le classement.
