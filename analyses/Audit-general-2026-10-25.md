# Audit général du Cahier de Lumi — 25 octobre 2026

Périmètre : sauvegarde/synchronisation, résultats et aides, passage des exercices, hors connexion, version, autonomie des nouveaux compléments « école ». Le classement pédagogique détaillé de Lire et Calculer fait l’objet d’un autre chantier.

Base de référence : dépôt `Aklbcode/cahier-lumi`, commit `77dee66a6dccfe047939cc95497f18349336e82d`. Les numéros de lignes ci-dessous correspondent à cette base avant réintégration des corrections en cours. Les fonctions et courts extraits indiqués permettent de retrouver les passages si les lignes se décalent.

## Méthode et portée des preuves

- Lecture du HTML livré, du moteur sonore, du service worker et des fragments sources. Ce sont des observations de code, pas une analyse retournée par un fournisseur REA.
- Six suites existantes relancées : `offline`, `speech`, `engine-skip`, `admin-integration`, `ecole-parcours`, `family-guidance`. Toutes passent.
- Reproduction ciblée de `runModule(0,0)` dans le banc DOM du projet : huit réponses d’entraînement justes, puis cinq réponses justes sur six au défi ; véritable fonction de bilan et de calcul des étoiles, réponses et lecture sonore simulées.
- Vérification indépendante de présence de la banque vocale : 18 430 clés, 207 packs, 930 segments inventoriés pour les nouveaux compléments, aucune clé manquante dans cet inventaire et aucune plage d’octets invalide.
- Aucun test sur la vraie Samsung, aucune écoute humaine des voix, aucun essai d’apprentissage avec Luca ou Lola n’a été réalisé par cet audit. Les tests logiciels ne permettent pas de conclure que la prononciation est correcte ou qu’une compétence scolaire est maîtrisée.

## Trois priorités

### 1. Dire exactement où les progrès sont sauvegardés

**Constat avéré, priorité élevée.** Le site GitHub est une application locale dans le navigateur. La synchronisation distante n’est active que si l’hôte fournit `window.claude.use('db')` et `window.claude.use('user')`. En leur absence, `Remote.init()` désactive le service.

- `index.html:1000` : sortie avec `this.state = 'off'` sans capacité Claude.
- `index.html:1546` : le panneau parent promet pourtant que les appareils connectés au même compte Claude partagent les progrès.
- `index.html:1645` : le pied du panneau teste `Remote.ref`, qui est une méthode toujours présente, et ajoute donc « et dans votre compte Claude » même lorsque le service est désactivé.

**Conséquence :** un parent peut croire qu’un changement d’appareil ou un nettoyage du navigateur ne risque pas de perdre les progrès. La présence d’une session Claude ailleurs ne connecte pas la version GitHub à cette base.

**Correction recommandée :** état explicite « Sur cet appareil » par défaut ; mention du compte uniquement avec `Remote.ready && Remote.state === 'on' && Remote.db`. Garder l’export/import comme transfert manuel et expliquer qu’un autre navigateur est un autre stockage. Le comportement distant par document/enfant, lorsqu’il existe, réduit les conflits entre Luca et Lola mais ne fusionne pas les actions simultanées sur le même enfant (`index.html:1024` et `1047`, remplacement du document selon horodatage).

**Point associé :** `save()` absorbe silencieusement une erreur de `localStorage.setItem` (`index.html:992`). En cas de quota ou stockage refusé, l’application continue sans signaler que l’état n’a pas été durablement écrit. Un message de sauvegarde non disponible et une proposition d’export seraient plus fiables. Aucun incident de quota réel n’a été provoqué.

### 2. Faire coïncider les étoiles du bilan et les étoiles réellement ajoutées

**Défaut reproduit.** À la fin des parcours principaux, les étoiles visibles proviennent de `shown`, initialisé avec le score de l’entraînement. Les étoiles ajoutées au compteur proviennent ensuite de `finalScore.stars`, calculé après ajout des réponses du défi.

- Lecture : `index.html:7086`, `7100` et `7101` (`runLesson`).
- Calcul : `index.html:7111`, `7127` et `7128` (`runModule`).
- La formule commune est à `index.html:7058` (`scoreOf`).

Reproduction du parcours calcul :

```text
Entraînement : 8 réponses justes
Défi : 5 réponses justes sur 6
Défi validé : oui
Étoiles montrées au bilan : 3
Étoiles ajoutées au compteur : 2
```

**Conséquence :** la récompense semble incohérente pour l’enfant et pour l’adulte, particulièrement quand le compteur franchit dix étoiles et ouvre un trésor. Un passage pendant le défi peut également réduire le gain calculé sans mettre à jour le nombre montré.

**Correction recommandée :** une seule variable pour le gain attribué et son affichage, en conservant un résultat de défi séparé. Tester les cas « entraînement parfait puis une erreur au défi », « passage au défi », « révision d’un niveau déjà réussi » et « toute la série passée ».

### 3. Conserver la distinction entre entraînement réussi et compétence observée

**Différence fonctionnelle avérée, interprétation à clarifier.** Les parcours principaux `lecture` et `calcul` utilisent un défi séparé à une tentative. Les nouveaux jeux « école » utilisent la boucle standard `runGame`, puis une montée à 80 % de réponses réussies du premier coup, sans défi distinct.

- `index.html:1331` : boucle standard et enregistrement des résultats.
- `index.html:7044` : progression à `pct >= .8` (ou grille de mémoire terminée).
- `index.html:7075` : un défi n’est validé qu’en l’absence de passage et avec au moins cinq bonnes réponses.
- `index.html:1639–1640` : présentation parent des étapes « acquises » et du « défi sans aide ».
- `ecole-parcours-fragment.js:223` et `230` dans la base : plusieurs nouveaux exercices de petits mots proposent deux réponses.

**Interprétation :** réussir une série de choix binaires, terminer une copie de modèle et réussir un défi à quatre choix ne sont pas des observations interchangeables. Le calcul « moins d’une chance sur 200 » ne vaut que pour le modèle de six choix indépendants équiprobables à quatre options ; il ne décrit ni tous les jeux ni un diagnostic de lecture.

**Correction recommandée :** présenter les résultats comme « réussi dans ce jeu » ; documenter le type de tâche (écoute, repérage, décodage, copie, calcul), l’aide utilisée et le contexte. Ne pas convertir une ouverture adulte ou une simple visite en maîtrise. Ce point doit aussi guider la recommandation des activités et leurs prérequis.

## Ce qui est déjà solide

### Aides, erreurs et passages

- `Engine.play` distingue résultat du premier coup, erreurs, aide et passage (`index.html:1258–1287`). Une aide explicite rend la réponse non autonome, et les erreurs/aides de la question interrompue sont conservées par la reprise.
- Le passage est une navigation, pas une réponse fausse ni une réponse juste. Il écrit un événement distinct, avec jeu, niveau, question et mode défi (`index.html:1265`). Un double appui tardif ne transforme pas un résultat déjà fixé.
- Le score retire les questions passées du décompte des bonnes réponses et évite les étoiles d’une série entièrement passée (`index.html:7058–7064`). Un passage interdit de valider le défi (`7075`) et empêche la montée normale du jeu (`7041–7044`).
- Les suites `engine-skip` et `admin-integration` vérifient notamment le contournement d’un rendu cassé ou d’un retour vocal bloqué, les résultats tardifs et l’isolation du profil Admin.
- L’écoute des livres est identifiée comme aide et les traces de livre portent `autonomousDecodingValidated:false` (`index.html:5611–5612` dans la base, fonction `readMiniBook`). C’est une limite honnête à conserver.

Il reste pertinent de distinguer **réécouter la consigne**, qui ne donne pas la réponse, de **faire lire le mot ou la phrase cible**, qui change la nature d’une tâche de décodage. Le bouton `ecoleHelp` marque cette seconde situation comme aide ; les haut-parleurs de choix auditifs, eux, font partie de la tâche.

### Autonomie des nouveaux jeux

Les compléments utilisent des consignes parlées, de grandes cartes, un retour contextuel et une aide marquée. Les règles nouvelles peuvent être expliquées au premier item (ex. graphies). Les tâches de copie désignent la prochaine case visuellement et les réponses se font au toucher.

Les démonstrations générales ont été désactivées explicitement (`index.html:7356–7367`) ; il ne faut donc pas les compter parmi les aides actuellement présentées. Leur réactivation obligatoire contredirait le choix conservé dans le code. Une explication facultative ciblée serait préférable aux longs écrans imposés.

Points à observer avec les enfants, sans présumer d’un défaut :

- Comprennent-ils le passage du dessin de maison aux deux parties d’un nombre ?
- Les signes `=`/`≠` utilisés pour comparer deux lettres sont-ils compris comme « pareil/différent » ?
- Une case qui brille et une palette de couleurs suffisent-elles à expliquer comment copier un modèle ?
- Les choix de mots, de jours ou de nombres écrits exigent-ils une lecture supérieure au niveau annoncé ? Le calendrier a des haut-parleurs individuels, ce qui réduit ce risque ; toutes les tâches ne sont pas de même nature.

Ces observations doivent porter sur la compréhension de la consigne, pas seulement sur la capacité à trouver finalement la bonne réponse après sa mise en évidence.

### Voix

Le moteur conserve les identités phonème/syllabe et interdit un remplacement automatique par la voix de l’appareil lorsqu’un son pédagogique manque (`speech-engine.js:25–28`, `152–173`). Les retours manquants peuvent être remplacés par une phrase générique Charline ; cela conserve le timbre, mais peut perdre l’explication précise souhaitée. Les phonèmes gardent une vitesse de lecture de 1 (`182`).

L’inventaire des 930 segments « école » est couvert et les fichiers/plages d’octets sont valides. Cela n’établit ni la bonne articulation ni l’intelligibilité sur les haut-parleurs de la tablette. La suite `speech` simule le moteur ; elle n’écoute pas les enregistrements.

## Hors connexion et identification de version

### Fonctionnement constaté dans le code

- Téléchargement explicite depuis l’espace parent, comprenant index, moteur, illustrations, police, sons animaliers, personnages et tous les packs de voix (`index.html:5329–5333`, `sw.js:6`).
- Le service worker choisit le réseau en priorité pour le HTML, le moteur et l’index vocal, puis les caches en secours (`sw.js:7`).
- Les anciens caches sont gardés pour permettre une navigation hors connexion pendant une mise à jour ; la suite `offline` couvre ce secours avec un réseau simulé indisponible.
- Le téléchargement complet n’est annoncé qu’après parcours réussi de la liste ; une erreur est remontée au parent. `navigator.storage.persist()` est demandé mais son acceptation n’est pas garantie (`index.html:1658`).

### Limites et améliorations

- **Version affichée périmée :** le pied de l’accueil annonce encore `2.6.0 · 24/10/2026` (`index.html:7404`, `family-guidance-fragment.js:181`) alors que le cache et la voix portent `20261025-ecole-1`. Il faut une version commune pour que la famille puisse identifier ce qu’elle teste.
- **Pas de bascule atomique de tous les fichiers :** le HTML, le moteur et l’index sont mis à jour séparément ; les URL de cache ignorent les paramètres (`sw.js:5`) et les ressources statiques peuvent venir d’un ancien cache (`sw.js:7`). Cela favorise la continuité mais ne prouve pas qu’un ancien téléchargement et un nouvel index restent toujours cohérents. Les nouveaux packs « école » ont des noms nouveaux, ce qui limite ici le risque. Aucun mélange effectif de médias n’a été reproduit.
- **Accumulation possible :** aucune suppression contrôlée d’anciennes versions de cache n’apparaît dans `sw.js`. Avec une banque volumineuse, plusieurs téléchargements complets peuvent augmenter la pression de stockage. Conserver une précédente version complète et ne purger les plus anciennes qu’après un nouveau téléchargement réussi serait une stratégie à vérifier.
- Le test existant est un banc de cache simulé. Il reste à tester téléchargement, rechargement, mode avion, reprise après mise à jour et stockage limité sur la vraie tablette.

## Bilan de cet audit

L’intégration des onze nouveaux jeux ne montre pas de blocage dans les suites exécutées ; le moteur possède de bonnes protections contre les passages, aides et retours tardifs. Deux corrections concrètes sont nécessaires : la promesse de synchronisation sur GitHub et le désaccord entre étoiles affichées et attribuées. La troisième priorité est éditoriale et pédagogique : ne pas présenter tous les résultats des jeux comme une validation scolaire équivalente.

Le nouveau rangement de Lire et Calculer doit préserver les données, les passages adultes, les aides identifiées et les anciens accès, tout en séparant les branches de compétences. Il ne doit pas transformer les étoiles ou une activité simplement ouverte en preuve de prérequis acquis.
