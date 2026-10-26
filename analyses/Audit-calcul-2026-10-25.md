# Audit du calcul — Cahier de Lumi, 25 octobre 2026

Audit statique de la version récupérée au commit `77dee66a6dccfe047939cc95497f18349336e82d`, complété par trois suites de tests exécutées. Aucun changement de jeu dans cette intervention. Les observations de navigation réelles sont réalisées séparément par l’agent principal. Les seuils de progression proposés ci-dessous sont des choix de conception, pas des seuils scientifiques certifiés.

## Conclusion

Les nouveaux contenus sont pertinents : maisons du nombre, égalité, barres, grandeurs, géométrie et calendrier enrichissent nettement l’offre. Le problème principal est leur articulation. La catégorie mélange aujourd’hui un parcours numérique verrouillé linéairement, des jeux autonomes dont les prérequis sont parfois une simple visite, et des branches complémentaires affichées comme la suite du calcul. Il faut conserver les identifiants et les acquis, mais remplacer cette logique par plusieurs branches et des prérequis à la granularité du niveau.

## Constats prioritaires et preuves

| Priorité | Constat vérifié dans le code actuel | Conséquence | Correction proposée |
|---|---|---|---|
| Haute | `MODS` place `pb` après `n100` et `mul` ; `openCalcul` ferme tous les modules d’indice supérieur à `c.open` (`index.html:3517`, `3572`, `3677`). | Les problèmes d’ajout/retrait jusqu’à dix attendent la numération jusqu’à cent et les tables de multiplication. | Ouvrir les problèmes ≤10 après les premières situations d’addition et de retrait ≤10 ; laisser les problèmes ≤20 progresser avec la plage numérique correspondante. |
| Haute | `c10` précède `a10` et `s10`. Son troisième niveau combine `? + k = 10`, `10 − k`, égalité inversée et terme inconnu (`index.html:3523`). | L’enfant doit réussir des relations symboliques relativement complexes avant les premiers ajouts et retraits illustrés. | Introduire addition/retrait concrets dès le dénombrement. Les compléments à dix restent une branche de composition et de stratégie. |
| Haute | `familyAccess` utilise `familyPlayed`, qui devient vrai dès une visite via `p.last` ; `pontDix`, `balance` et `barres` en dépendent (`index.html:7270`, `7289`). | Ouvrir puis quitter le prérequis peut suffire à annoncer la préparation ; l’inverse est aussi possible, un enfant compétent dans un autre jeu n’étant pas reconnu. | Distinguer accès historique préservé, activité découverte, réussite et recommandation. Évaluer le niveau pertinent, sans retirer les anciens accès. |
| Haute | `barres` exige une visite de `pontDix` quelle que soit sa question (`index.html:7289`), alors que réunion ≤10, comparaison et partage sont ses trois niveaux (`math-practice-fragment.js:124–135`). | Un complément à dix n’est pas le prérequis direct de toutes ces situations. | Niveau 1 : sens de réunir ; niveau 2 : sens de retirer/comparer ; niveau 3 : partage concret. Pas de verrou « pont des dix » commun. |
| Moyenne | `dbl` inclut doubles et moitiés jusqu’à vingt avant `n20` (`index.html:3538–3547`). | La plage numérique s’élargit avant l’introduction des représentations 10 + unités. | Premier niveau des doubles avec les additions ≤10 ; doubles/moitiés ≤20 après les nombres jusqu’à vingt. |
| Moyenne | Les trente-trois niveaux sont un total de onze modules très différents (`GAMES.calcul.info`, `index.html:3695`). | « Niveau 1/33 » ne dit pas quelle compétence est travaillée ni le prochain prérequis. | Afficher des étapes nommées (quantités, nombres, opérations, stratégies, problèmes) et un niveau dans chaque activité. Conserver les indices internes. |
| Moyenne | `n100` (jusqu’à99 et ±10), tables de multiplication jusqu’à100 et problème avec × sont dans le parcours global. | Le périmètre dépasse le cœur arithmétique de P1 belge. | Branche « Pour aller plus loin » clairement distincte ; aucune dépendance obligatoire du socle P1 vers cette extension. |
| Moyenne | `nombresLettres` commence parfois par un mot écrit à reconnaître, avec une aide lisant la réponse ; aucune dépendance de lecture n’est définie (`ecole-parcours-fragment.js:318–342`). | Une difficulté de décodage peut être comptée comme une difficulté mathématique. | Branche « Lire les nombres » ; signaler le lien avec la lecture, conserver une modalité orale d’association nombre entendu/chiffre et distinguer l’aide de lecture d’une erreur numérique. |
| Moyenne | Les distracteurs des nombres en lettres sont pris dans `n ±4` sur l’intervalle 0–20, même dans la tranche 0–5 (`ecole-parcours-fragment.js:322`). | La première tranche peut afficher des formes numériques au-delà du champ annoncé. | Borner les distracteurs au champ travaillé, ou annoncer explicitement la révision élargie. |
| Moyenne | Le niveau initial de `ligne` va directement de1à20 ; `ligneP` de1à10, sans case zéro (`math-practice-fragment.js:91–105`). | Le jeu ne constitue pas une entrée 0–5 et peut être trop long pour les premiers nombres de Lola. Toucher les cases dans l’ordre ne prouve pas la compréhension du cardinal. | Le présenter comme entraînement de chaîne numérique ; entrée courte 1–5 pour les petits et travail explicite du zéro dans une autre série. Ne pas l’utiliser seul comme preuve de quantité acquise. |
| Moyenne | `paniers` vérifie la quantité dans chaque panier puis affiche l’addition et éventuellement × ; il ne demande pas le total (`index.html:5224–5225`). | Réussir les paniers démontre une construction de groupes égaux, pas le calcul du produit. | Garder le jeu comme découverte concrète ; employer « Former des groupes égaux » plutôt que « Partager » lorsqu’un total n’est pas distribué. Ne pas valider la multiplication sur ce seul résultat. |
| Faible | `grandeurs` lie longueurs, unité, masses puis rendu de monnaie ; l’audio dit « pièces » alors que le choix inclut5€ (`math-practice-fragment.js:143–156`). | Changement de domaine abrupt et représentation monétaire ambiguë. | Séparer la branche monnaie de la mesure ; représenter5€ comme billet ou dire « montants ». |

Les localisations renvoient à la version auditée ; le fichier HTML intègre des copies des fragments et peut changer de numérotation après intégration.

## Ce qui fonctionne bien et doit être conservé

- Les maisons du nombre proposent de véritables décompositions : quantité visible, plusieurs étages, puis clavier. Le premier item exclut les cas triviaux0+N/N+0, mais les étages complets les réintroduisent utilement.
- Les représentations passent des collections aux cadres, aux opérations et au clavier. Les aides visuelles et les réponses aidées restent distinctes.
- Les rappels partent de faits réellement rencontrés et disposent d’un calendrier1/3/7/14/30jours ; les revoir ne valide pas rétroactivement le module d’origine.
- Le passage d’un exercice et l’action du parent ne deviennent pas automatiquement une réussite ou une compétence.
- Le calendrier comporte une écoute de chaque proposition ; la géométrie ne doit donc pas être verrouillée par la lecture.
- Les saisons évitent les mois de transition ambigus ; la position de la date dans la grille est correctement calculée dans le modèle examiné.
- Les nouveaux noms numériques emploient septante et nonante.
- Les premiers niveaux maternelle `nombres` (1–3, compter/construire jusqu’à5, chiffres jusqu’à6) ont une progression globalement cohérente.

## Organisation à afficher

### Luca — cœur numérique P1

1. **Les quantités et les nombres** : construire1–5 puis1–10 (`blocs`0/2), dénombrer (`calcul/n10`1), reconnaître les configurations (`n10`0), situer (`n10`2), puis dizaine et unités (`n20`).
2. **Je compose les nombres** : deux parties (`blocs`1/3), maisons3–5 puis6–10 (`maisonNombres`0–2), compléter dix (`pontDix`0/1 puis2, `c10`0/1 puis2). Les tâches avec plusieurs étages et clavier viennent après le sens des deux parties.
3. **J’ajoute et j’enlève** : premières additions et retraits visibles (`a10`0, `s10`0, `blocs`4/5), cadre puis symboles, puis mêmes actions jusqu’à vingt. Addition et soustraction sont voisines, pas deux cursus annuels successifs.
4. **Je trouve une stratégie** : doubles≤10, compléments, passage par dix, égalités ; doubles/moitiés≤20 après les représentations jusqu’à20.
5. **Je résous des problèmes** : les premiers problèmes apparaissent dès l’étape3, et non à la fin de tout le programme. Barres réunion et comparaison accompagnent les opérations ; les problèmes plus variés et termes inconnus viennent ensuite.

### Branches parallèles

- **Formes et solides** : reconnaissance → côtés/sommets → solides → objets réels → roulement. Les formes simples restent accessibles dès le début.
- **Mesurer et comparer** : longueur concrète → unité commune → masse. Ces tâches n’exigent pas de savoir calculer jusqu’à20.
- **La monnaie** : acheter au marché avec petites sommes → compléter une somme → rendre une monnaie jusqu’à5 puis10. Dépendance locale au sens de la soustraction et aux valeurs des pièces/billets.
- **Le temps** : jours/hier/demain/calendrier et heure sont deux branches ; il n’est pas nécessaire d’achever l’horloge pour commencer les jours de la semaine.
- **Lire les nombres** : nombres écrits en lettres, avec une préparation en lecture adaptée ; dizaines70/90 en extension.
- **Pour aller plus loin** : nombres jusqu’à100, groupes égaux/ajouts répétés puis symbole× et tables. Les paniers initiaux peuvent rester une découverte accessible avec petites quantités ; les tables ne bloquent aucun problème P1.
- **Mes rappels** : faits rencontrés, indépendants du numéro de rang du catalogue.

### Lola — maternelle

1. Petites quantités1–3 : `doigts`0, `nombres`0, `blocsP`0.
2. Compter et fabriquer jusqu’à5 : `nombres`2/3, `doigts`1/2, `blocsP`1/2.
3. Comparer des collections puis des chiffres : `nombres`1, `grandpetit`0 ; étendre vers10 seulement ensuite.
4. Chaîne numérique : `ligneP`, en entraînement guidé, pas comme preuve suffisante du dénombrement.

`tailles` est une branche parallèle de comparaison perceptive : elle ne doit pas être un verrou avant les quantités. Les quantités5–10, les symboles seuls et les comparaisons triples relèvent des paliers plus avancés M2/M3, pas d’un objectif imposé à trois ans.

## Dépendances au niveau utile

Références ci-dessous : indices de niveau à base0 ; les identifiants/indices stockés ne changent pas.

| Cible | Préparation logique minimale conseillée |
|---|---|
| `a10:0`, `s10:0` | `n10:1` (dénombrement ≤10), ou réussite équivalente documentée sur des collections de la même plage |
| `pb:0` | `a10:0` et `s10:0`, sans passage imposé par `n100`, `mul` ou tout `c10` |
| `pb:1` | `pb:0`, représentations `n20:0`, premiers ajouts/retraits `a20:0` et `s20:0` ; les images restent disponibles |
| `pb:2` | Extension : `pb:1` et groupes multiplicatifs `mul:0` |
| `a20:0` / `s20:0` | `n20:1` et cadre addition/soustraction correspondant ≤10 |
| `a20:1` / `s20:1` | Niveau précédent correspondant et compléments à dix (`c10:1` ou `pontDix:1`) |
| `dbl:1` | `dbl:0` et `n20:0` |
| `dbl:2` | Doubles jusqu’à20 et partage concret ; ne pas exiger des tables |
| `barres:0` | Sens de réunir (`a10:0`) |
| `barres:1` | Sens de la comparaison/différence (`s10:0`) |
| `barres:2` | Dénombrement≤10 et groupes égaux/partage concret |
| `balance:0` | Addition concrète et décomposition jusqu’à10 (`maisonNombres:2` ou `blocs:3`) |
| `balance:1` | Égalité concrète `balance:0` |
| `grandeurs:3/4` | Valeur de la monnaie et retrait/complément≤5 ou≤10 ; pas tous les niveaux de mesure |
| `formesSolides:0`, `calendrier:0`, `grandeurs:0` | Entrées indépendantes, avec consignes comprises |

Il ne faut pas convertir ce tableau en une chaîne de verrous : une réalisation déjà réussie reste accessible, les observations équivalentes peuvent compter, et le parent peut ouvrir un passage sans inventer de réussite. Une simple visite peut conserver un accès historique mais ne justifie pas la mention « préparé ».

## Validation effectuée

Trois commandes terminées avec code0 dans la copie auditée :

- `tests/math-practice.test.cjs` : faits rencontrés, espacement, ligne, compléments, égalités, barres, grandeurs, doigts, erreurs et sauts.
- `tests/math-strategy.test.cjs` : aides de calcul, surcomptage, passage par dix et retrait après erreur ; défi/rappel/passage préservés.
- `tests/ecole-parcours.test.cjs` : onze jeux,930phrases et163images selon la sortie du test.

Ces contrôles ne valident pas l’ordre pédagogique actuel, le transfert hors écran ou l’efficacité de l’application. La progression proposée s’appuie sur le mémo documentaire `../lumi-progression-recherche-20261025.md`, en particulier le [référentiel FWB maths P1](https://ifpc.cfwb.be/v5/documents/tc/refMATH.pdf#page=31) et les [trajectoires de développement de l’EEF](https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/early-maths/).

## Correction développée après l’audit

`curriculum-math-fragment.js` remplace la navigation linéaire de calcul par un graphe de trente-trois niveaux. Les identifiants de modules et leurs indices locaux restent inchangés. Les premiers problèmes jusqu’à dix sont à la fois accessibles et conseillés immédiatement après les premières situations d’ajout et de retrait ; les problèmes jusqu’à vingt arrivent avant l’achèvement de toutes les stratégies mentales. Nombres jusqu’à cent, multiplication et problèmes multiplicatifs forment une extension distincte.

Le menu regroupe les niveaux par objectifs. Une activité non préparée donne une raison et un bouton pour démarrer le prérequis réellement accessible. Les anciens accès et les décisions du parent sont conservés comme accès, sans fabrication de réussite. Les nouvelles réussites ne font plus augmenter `calcul.open` (ancienne frontière linéaire) : un champ `calcul.focus` conserve la cible actuelle. Le sélecteur de niveaux, le repère de l’exercice en cours et le bouton de suite utilisent le même ordre du graphe.

Le bilan affichait auparavant les étoiles de l’entraînement, tandis que le portefeuille créditait le résultat final entraînement + défi. Le nouveau lecteur utilise le résultat final dans les deux cas. Un test reproduit huit réponses correctes puis un défi à cinq sur six : deux étoiles affichées et deux créditées. Une reprise d’un niveau passé par le parent doit désormais réussir le vrai défi pour devenir une réussite indépendante.

`tests/curriculum-math.test.cjs` est passé : couverture exacte des trente-trois niveaux, dépendances sans cycle, atteignabilité complète depuis un profil neuf, problèmes précoces, fonctions de consultation sans mutation, accès historiques et parent/Admin, annulation d’une ouverture, menu et bouton de prérequis, cohérence du compteur, reprise des cinq questions restantes, série entièrement passée sans récompense, absence de résultat tardif après abandon et séparation des enfants.

Le test est une simulation du logiciel, pas une expérimentation pédagogique ni un essai sur tablette physique. Les remarques de contenu non traitées dans ce fragment (première plage de ligne numérique, articulation monnaie/mesures, distracteurs de nombres en lettres) restent identifiées dans le tableau d’audit.
