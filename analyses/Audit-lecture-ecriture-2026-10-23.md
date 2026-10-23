# Audit fonctionnel et pédagogique du parcours lecture–écriture

Inspection du code local au 23 octobre 2026, sans essai d'enfant ni certification pédagogique. Les références scientifiques sont traitées dans le rapport de recherche séparé. Les lignes ci-dessous désignent la version publiée `parents-20261023`, avant les corrections de cette intervention.

## À corriger en priorité

1. **Un graphème n'est pas systématiquement un phonème.** L'étape ajoutée à `itDictee` (ligne 5224) demande un jeton par son mais utilise le nombre de graphèmes non muets. Ainsi `r.oi` donne deux jetons pour « roi », alors que /ʁwa/ comporte trois phonèmes. Les semi-voyelles de lion/avion/camion/violon/radio et la graphie de gorille/pingouin ne sont pas représentées phonémiquement par `G2L`. Les variantes de schwa et certaines prononciations régionales demandent aussi de la prudence. Solution : un inventaire phonémique explicite pour les mots de segmentation, ou un sous-ensemble vérifié où la correspondance est sûre ; ne pas inférer les sons par simple découpage orthographique.

2. **Les mini-livres ne vérifient presque pas la compréhension.** `MINI_CONTENT` (5264) pose la même question (« Quelle image va avec cette histoire ? ») et la réponse est l'emoji déjà affiché sur chaque page. Choisir l'image est possible sans lire ni écouter. Les trois phrases répètent souvent « a vu ». Remplacer par des questions sur une action, un lieu, une relation ou un ordre ; opposer des réponses qui reprennent les mêmes personnages/objets. Ne jamais annoncer une mesure de décodage oral : l'app n'écoute pas l'enfant. Le champ `autonomousDecodingValidated:false` est une bonne limite à conserver.

3. **La signature des exemples ne représente pas le contenu.** Le wrapper `Engine.play` (5291) prend `caption || say`. Une légende générique identique pour tous les mots/formes rend deux exemples différents indiscernables dans le suivi ; le rappel sur un exemple différent peut ne jamais être enregistré. Ajouter des identifiants explicites stables par contenu, séparés des variations d'ordre des choix et de couleur. `evidenceKey` met aussi `gp:` devant tout `item.skill`, dont `mots`/`dictee`; le routage de révision traite alors ces activités comme une lettre. Préférer des clés de compétence nommées et une table de routage explicite.

4. **Le tracé est un recouvrement d'image, pas un enseignement du geste.** `GAMES.trace` (3711–3793) dessine un caractère de police puis contrôle 60 % de recouvrement et la quantité d'encre hors zone. Il ne démontre ni point de départ ni ordre des traits, et ne distingue ni copie ni rappel. Une surface gribouillée dans la zone peut satisfaire le masque. Le même exercice est présenté comme écriture attachée sans garantie que la police locale ait la forme attendue. Préférer des formes vectorielles script explicites, une démonstration séquentielle, puis tracer/copier/rappeler. Garder le retour prudent : un geste ressemblant sur écran ne valide pas l'écriture au crayon.

## Points forts à conserver

- Une consigne courte, une voix belge Charline unique pour les explications et les retours, aucun repli automatique vers une voix de l'appareil.
- Fusion à partir d'enregistrements syllabiques dédiés ; les consonnes ne sont pas enseignées comme « beu », « meu ».
- Graphèmes mobiles regroupant `ch`/`ou`, lettres muettes conservées, pool de mots strict pour l'atelier récent.
- Défi séparé de l'entraînement, aides et erreurs conservées lors d'une reprise ; passage parental distingué d'une réponse autonome.
- Petites séries, cinq thèmes, récompense de fin séparée du suivi des acquisitions ; absence de classement.

## Améliorations ciblées

- **Écriture :** exemples script monolinéaires cohérents, démonstration du geste, repassage, modèle éloigné, modèle caché. Fiche à imprimer pour transfert au crayon et suivi distinct des gestes guidés/copiés/rappelés.
- **Petits :** prégraphisme concret (chemin horizontal, vertical, courbe, cercle), sans demander les mêmes seuils qu'en P1. Grandes cibles, démonstration rejouable, absence de jugement d'orthographe.
- **Vocabulaire et compréhension orale :** exécuter une consigne spatiale ou une suite de deux actions ; choisir la scène qui correspond à une phrase contrastée (« le chat suit le chien » / « le chien suit le chat »). Ces activités complètent le code sans prétendre que le sudoku améliore directement la lecture.
- **Récit :** remettre deux puis trois scènes en ordre et associer cause/conséquence, en gardant les mêmes éléments visuels pour éviter le seul appariement d'objets.
- **Encodage :** rappeler un mot après une courte présentation, disposer puis vérifier les graphèmes en une fois (plutôt que correction immédiate lettre par lettre). Réserver la substitution d'un phonème aux paires réellement vérifiées phonémiquement.
- **Décodage :** contrôler également les anciens jeux `readableWords()` : son repli force douze mots même si aucun n'est déchiffrable au niveau actuel. Les activités visuelles/sonores peuvent utiliser ces mots, mais elles ne doivent pas se présenter comme lecture autonome.

## Risques et vérifications utiles

- Ne pas remettre à zéro les progrès anciens lors d'un nouveau parcours ; conserver l'historique, signaler le nouveau périmètre de mesure.
- Un seul résultat à 5/6 ne certifie pas une compétence scolaire. La probabilité de réussite au hasard ne mesure ni validité ni transfert, et suppose des choix équiprobables sans indice parasite.
- Les défis doivent conserver au moins le nombre de choix annoncé, et aucun haut-parleur donnant directement le mot cible.
- Vérifier les nombres de sons sur les mots retenus, la décodabilité réelle de chaque livre, la non-divulgation des réponses par illustration, et les signatures de révision sur des contenus différents.
- Vérifier les tracés avec un vrai doigt/stylet : géométrie atteignable, zones tactiles larges, ordre démontré, gomme/reprise, et aucun point attribué au seul bouton « fini ».
- Les jeux de mémoire/logique restent des jeux de mémoire/logique. Aucun transfert général vers la lecture, l'intelligence ou les résultats scolaires ne doit être annoncé sans données adaptées.
