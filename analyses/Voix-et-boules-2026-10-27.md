# Version 2.7.1 — voix et comptage de Lola

## Silence lors de l’ouverture locale

L’onglet signalé ouvrait `index.html` par `file://`. Le moteur demandait le manifeste vocal puis les MP3 par `fetch` sur ce même protocole, ce que les navigateurs bloquent généralement. La banque complète est présente : 207 packs, 18 430 extraits. Les voix système restent volontairement exclues pour éviter de modifier la prononciation des sons de lecture.

La version locale demande désormais ces mêmes enregistrements Charline sur `https://aklbcode.github.io/cahier-lumi/voix/`. Ce serveur autorise le chargement entre origines. Les versions HTTP/HTTPS conservent leurs fichiers vocaux relatifs. Aucun progrès ni contenu personnel n’est envoyé pour charger une voix. Une copie locale nécessite Internet ; le mode hors connexion du site reste disponible après téléchargement explicite dans les options parents.

Les téléchargements du manifeste et des packs sont bornés à quinze secondes, corps de réponse compris, même sans AbortController. Le premier démarrage accepte maintenant une banque qui met plus de cinq secondes à arriver. Après une panne, le haut-parleur permet de réessayer ; les phonèmes ne sont jamais remplacés par la voix de l’appareil.

## Compter les boules rouges

Lola → Compter → Découvrir les petites quantités. Cadre permanent de deux rangées de cinq cases ; seules les boules rouges doivent être comptées. Réponse directe sur le chiffre : aucun bouton de validation supplémentaire.

| Étape | Quantités | Disposition |
| --- | --- | --- |
| 1 | 1 à 3 | Alignées |
| 2 | 1 à 5 | Alignées |
| 3 | 1 à 10 | Alignées |
| 4 | 1 à 10 | Positions variées |

Chaque série contient huit questions équilibrées, sans répétition immédiate de la même quantité. Les règles habituelles de récompenses, de progression, de reprise et de passage parent s’appliquent. Le jeu réemploie deux consignes Charline déjà enregistrées : « Combien de points ? » et « Touche le bon chiffre. » Les profils et les acquis existants ne sont pas réinitialisés.

## Vérifications

- 33 suites automatisées réussies, dont 1 280 questions de comptage et les parties utilisant le véritable moteur de jeu.
- Tests vocaux : ouverture locale sélectionnant HTTPS pour le manifeste et les MP3, absence de synthèse installée, réseau lent, réponse bloquée, annulation et reprise, sans changement de voix.
- Navigateur : accueil de Lola et consigne du nouveau jeu effectivement lus par un élément audio ; série de huit réponses menée jusqu’au bilan, puis passage au niveau 2. Aucun progrès de production n’a été modifié pour réussir cette série : elle a été effectuée sur l’aperçu local.
- Affichage de tablette 768 × 1024 : dix cases visibles, boutons de réponse d’environ 86 × 73 pixels, boules circulaires, aucune largeur de page excédentaire.
- Aucune erreur de console constatée pendant ces vérifications.

Le transport `file://` a été testé par simulation du protocole et contrôle des autorisations du serveur, pas par automatisation d’un onglet fichier local. La Galaxy physique et l’écoute humaine exhaustive de la banque n’ont pas été testées. Les enregistrements eux-mêmes n’ont pas été modifiés.
