# Contrôle des illustrations — 23 octobre 2026

Le contrôle des références statiques de l’application, des icônes installables et des packs de voix a vérifié **186 ressources locales**, sans fichier absent. Les cartes d’animaux et d’objets utilisaient surtout des caractères emoji : leur dessin et la prise en charge des caractères récents dépendaient donc du système de la tablette. Un contrôle de fichiers seul ne pouvait pas garantir leur présence à l’écran.

Un lot local contient désormais **369 dessins SVG Twemoji**, couvrant les **371 formes Unicode relevées** dans les sources ; deux formes partagent le même dessin. Aucun dessin demandé ne manque. Le lot de dessins représente **597 794 octets**. Il comprend notamment l’abeille, l’âne, la poupée et les objets récents.

Les dessins sont regroupés dans `assets/illustrations/twemoji-bundle.js`. Leur affichage ciblé utilise `illustrations-fragment.js`, sans observer ni modifier globalement le document. Les lettres, nombres et valeurs non illustrées restent des chaînes de texte inchangées. Les cartes illustrées conservent aussi leur texte original masqué : les comparaisons de réponses et raccourcis qui lisent `textContent` gardent leur valeur. Les assemblages comme « 🍎🍎 » et « 🐰🥕 » sont pris en charge. Les identifiants internes des dégradés sont isolés pour éviter les collisions entre plusieurs cartes.

Les SVG ont été vérifiés : absence de script, gestionnaire d’événement, image distante et lien externe. Les références internes aux dégradés sont admises. Le test automatique exerce les cartes réelles du helper, les assemblages, le repli des valeurs inconnues et les identifiants de dégradés répétés.

Le rendu final dans les jeux concernés et le téléchargement hors connexion doivent être vérifiés après l’intégration par le responsable de l’application. Ce contrôle ne prétend pas qu’une image suffit toujours à identifier un mot sans ambiguïté : les mots déjà exclus des exercices d’images pour cette raison restent exclus.

Source : [Twemoji 17.0.3](https://github.com/jdecked/twemoji/tree/v17.0.3/assets/svg), par Twitter, Inc. et les autres contributeurs, sous [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Dessins d’origine conservés ; regroupement local et identifiants d’affichage adaptés. Crédits détaillés et licence complète dans `assets/illustrations/`.

Les polices Google restent des références externes existantes ; les dessins de ce lot ne dépendent ni de ces polices ni d’un serveur tiers pendant le jeu.
