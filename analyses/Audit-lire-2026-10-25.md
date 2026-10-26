# Audit du parcours Lire — 25 octobre 2026

Analyse de la version GitHub `77dee66a6dccfe047939cc95497f18349336e82d`, puis contre-vérification des corrections de cette intervention. L’inspection est fondée sur le code livré et des événements simulés ; l’observation du navigateur est assurée séparément par l’audit principal. Aucun essai avec les enfants ni écoute humaine exhaustive n’est revendiqué.

## Ce que la nouvelle version apporte

Les quatre ajouts de lecture ont un intérêt distinct : remédier à des confusions de lettres, travailler les petits mots, organiser une phrase et élargir les graphies. Les choix sont grands, la consigne est oralisée, les erreurs restent reprises et l’aide est enregistrée. Le matériel existant apporte déjà des bases solides : mots annotés par graphèmes, comptage des phonèmes limité à un lexique explicite, exclusion de semi-voyelles non enseignées, pseudo-mots, aide distincte et révisions différées. La lecture orale de l’enfant n’est jamais mesurée automatiquement.

## Problèmes observés avant correction

| Point | Preuve de code dans la version examinée | Conséquence |
| --- | --- | --- |
| Les nouveaux jeux ne possédaient aucun prérequis | `ecoleRegister` enregistrait directement `lettresMiroir`, `graphies`, `petitsMots`, `phraseOrdre` ; ancien fragment vers lignes 147, 206, 245 et 280. | Un enfant débutant pouvait recevoir du matériel de fin de parcours depuis le menu. |
| Le nombre de mots était le seul critère des phrases | Ancien `ecolePhraseItem`, fragment vers ligne 260 : filtre `x.words.length===ctx.L.words`. | « La vache boit » pouvait arriver avant `oi`. « Le chat boit du lait » pouvait arriver avant les correspondances nécessaires. Une phrase de trois mots n’est pas automatiquement plus simple à décoder qu’une de quatre. |
| Les graphies emportaient d’autres difficultés non enseignées | Ancien `ecoleGraphItem`, fragment vers ligne 175 : tirage dans toute la famille. | Le niveau `au/eau` pouvait proposer *oiseau* et son `s` prononcé /z/ ; `ai/ei` pouvait proposer *neige* et son `g` doux. *Panier* introduit aussi une semi-voyelle qui ne se réduit pas aux lettres connues. |
| La découverte guidée pouvait être enregistrée comme réponse autonome | Premier item de graphies : règle et mot repère, puis association mot/image, sans marquage général d’aide. | L’exposition au modèle et la réussite indépendante étaient insuffisamment distinguées. |
| La dernière question de graphies prétendait rappeler un mot déjà vu | Ancien dernier item `au/eau`, `ai/ei`, `er/ez` : nouveau mot tiré par `ecoleFresh`, correctif « … écrit tout à l’heure ». | L’enfant pouvait devoir choisir une orthographe homophone qu’il n’avait pas rencontrée dans la série. |
| « Les petits mots » mélangeait oral et décodage | Le nom était dit, les alternatives écrites, sans écoute séparée de chaque choix. | Une difficulté de lecture pouvait masquer une compétence grammaticale orale, ou une réponse grammaticale être confondue avec une preuve de décodage. |
| Un seuil d’ouverture était parfois assimilé à des sons disponibles | Ancien `miniBookDecodable` et plusieurs pools utilisaient `lecture.unlocked`. | Une ouverture par le parent pouvait faire apparaître du matériel comme lisible, sans rencontre indépendante des correspondances. L’ouverture ne doit jamais créer une preuve d’acquisition. |
| L’ordre général mélangeait objectifs parallèles | Les récits oraux et la phonologie partageaient une liste avec lecture et encodage ; ajout des jeux par insertion après une activité. | La place dans la liste ne décrivait ni le besoin réel de l’enfant, ni les prérequis internes de chaque niveau. |

## Corrections du fragment école

Un inventaire explicite borne maintenant les mots utilisables en lecture autonome. Il ne devine pas leur prononciation à partir de la chaîne de caractères. Les graphies supplémentaires sont nommées séparément ; un contexte encore non modélisé reste exclu de la voie autonome. Ainsi, le `un` belge n’est pas assimilé artificiellement à `in`, et les contextes `eill/euill/ouill` ne deviennent pas automatiquement acquis parce que le modèle *fille* a été vu.

Les prérequis se fondent sur les entrées indépendantes de `lecture.pass`, pas seulement sur `unlocked`. Les phrases filtrent chaque mot ; une phrase courte devient disponible avant la fin des 28 correspondances. Quatre phrases de quatre mots, déjà présentes dans les livres enregistrés, diversifient les premiers assemblages. Les consignes et les phrases réutilisent la banque existante.

Pour les graphies, la graphie en cours peut être présentée explicitement, mais les autres correspondances des mots et distracteurs doivent déjà être disponibles. La première question avec sa règle est guidée. Les réponses de lecture indépendantes sont enregistrées séparément des associations audio-écrit et de l’orthographe de rappel. Une graphie devient « rencontrée » après au moins deux réponses indépendantes sur des exemples distincts : ce repère organise le jeu, sans certifier une maîtrise scolaire. Le mot à compléter provient désormais des mots vraiment affichés dans cette série.

Le premier niveau des lettres miroirs reste un jeu visuel libre. Les niveaux en contexte nécessitent les lettres/sons concernés. Ils continuent à faire entendre les mots ; ils ne certifient pas la lecture de tout le mot. Les petits mots ont un objectif grammatical oral explicite et des boutons d’écoute distincts pour les alternatives ; leurs résultats portent la clé `oral:grammar:*`.

Un parent peut toujours ouvrir l’activité. Si les prérequis ordinaires manquent, le matériel est traité comme entraînement aidé, dans une clé distincte. Le profil Admin garde accès à tout. Les identifiants, indices des niveaux, étoiles et anciennes sauvegardes ne sont pas réinitialisés.

Fonctions pures exposées pour l’intégration :

- `ecoleWordRequirements(word)` → `keys`, `families`, `unmodelled`.
- `ecoleReadingKnown(profile)` → ensembles de correspondances et graphies rencontrées.
- `ecoleWordReady(word, profile, {family})` → disponibilité d’un mot ; la famille en cours peut être explicitement enseignée.
- `ecoleGraphPool(family, profile)` et `ecolePhrasePool(level, profile)` → corpus bornés.
- `ecoleReadingAccess(gameId, profile, levelIndex)` → `ready`, `training`, `parent`, `missing`, `missingFamilies`, `available`, `reason` ; indices à partir de zéro.
- `GAMES.lettresMiroir.preReq`, `GAMES.graphies.preReq`, `GAMES.phraseOrdre.preReq` délèguent à cet accès.

## Organisation pédagogique recommandée

Il faut un parcours principal court, des objectifs parallèles et des remédiations, plutôt qu’une chaîne qui exige de finir chaque jeu.

| Famille | Activités | Logique des prérequis |
| --- | --- | --- |
| Écouter les mots | Jouer avec les sons ; pour Lola, imagier, associations, consignes et récits courts. | Travail oral, accessible sans savoir lire. Finir toutes les rimes ou les récits ne conditionne pas l’apprentissage du code. |
| Relier lettres et sons | Apprendre à lire ; sons/lettres de Lola. | Une nouvelle correspondance, rappel de correspondances déjà rencontrées, puis application dans des syllabes et des mots compatibles. Nom de la lettre et son restent distincts. |
| Assembler et écrire | Assembler les syllabes, Écrire les mots, Écrire avec les lettres, Le mot du monstre. | Les correspondances de tous les choix doivent être disponibles ; encodage et décodage avancent ensemble. Les pseudo-mots contrôlent l’assemblage écrit–audio, sans mesurer une lecture orale. |
| Lire et comprendre | Phrases en ordre, Lis et fais, petits livres lisibles. | Seuls les mots compatibles sont proposés. Les petits mots peuvent être travaillés à l’oral en parallèle. Les livres gardent une voie d’écoute accompagnée. |
| Élargir et consolider | Nouvelles graphies, lettres miroirs, Mon petit rappel, Lecture éclair. | Graphies nouvelles après leur phonème de référence et les autres correspondances du corpus. Miroirs comme remédiation ciblée, pas comme barrière pour tous. Le rappel dépend de ce qui a été rencontré ; l’affichage bref vient après une découverte sans disparition. |

Les activités à plusieurs niveaux ne doivent pas être classées sur leur seul premier niveau. Par exemple, un premier jeu de syllabes accessible n’autorise pas automatiquement une variante longue avec des consonnes nouvelles. La progression générale doit indiquer l’étape courante et recommander la prochaine activité réellement accessible, tout en conservant l’aide du parent et les accès historiques en entraînement.

## Validation et limites restantes

- `tests/ecole-reading-prereqs.test.cjs` vérifie nouveaux profils, faux déblocage sans correspondances, prérequis par niveau, premières phrases avant 28 sons, graphies non importées par effet de bord, exceptions non devinées, distinction guidée, rappel d’un mot réellement vu, accès adulte, fonctions sans mutation et sons réutilisés présents dans la banque.
- `tests/ecole-parcours.test.cjs` : onze jeux et tous leurs niveaux, clics justes/faux, aide, images et inventaire vocal. L’essai complet du corpus s’effectue sur le profil de démonstration ouvert ; les limites d’accès font l’objet du test dédié.
- `tests/reading-practice.test.cjs` : 512 pseudo-mots et 384 actions lues, prérequis, aides, mots connus et affichage bref.
- `tests/literacy.test.cjs` : phonèmes, 700 modèles oraux, récits et questions, messages et rappels.

Les contrôles logiciels ne prouvent pas l’efficacité pédagogique. L’image choisie, le genre d’un nom ou le bon ordre de cartes ne mesurent pas directement la lecture orale. La durée d’affichage de Lecture éclair n’est pas une mesure de fluence. L’écriture tracée sur écran ne valide ni la tenue du crayon ni le transfert sur papier.

Le parcours de code historique introduit six voyelles avant sa première consonne. Une future progression peut intercaler plus tôt quelques consonnes continues pour permettre les premières fusions après peu de correspondances ; cela nécessite une migration soigneuse des indices de leçons existants, et ne doit pas être réalisé par un simple tri de `LESSONS`. Les règles gestuelles parlées de b/d/p/q devront aussi être comparées au modèle cursif utilisé par l’école. L’écoute humaine et l’essai avec l’enfant restent nécessaires.
