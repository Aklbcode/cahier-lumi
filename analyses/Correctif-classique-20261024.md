# Page blanche sur tablette — version classique

La dernière version appelait `Array.prototype.at` pendant l’initialisation des modèles cursifs, avant `boot()`. Cette méthode n’existe pas dans Chrome avant 92 ou Safari avant 15.4 (données MDN : https://github.com/mdn/browser-compat-data/blob/main/javascript/builtins/Array.json). L’absence de la méthode provoquait une exception avant la création de l’accueil. La reproduction en VM confirme ce chemin ; la version exacte du navigateur Samsung n’a pas été relevée sur l’appareil physique.

Correction : core-js 3.51.0 sous licence MIT, inclus localement et chargé avant la voix et les jeux. Les mêmes fonctionnalités et modèles restent utilisés, sans modifier la sauvegarde `cahier-lumi-v1`. Aucun changement dans `boox/`.

Un écran de démarrage statique et un bouton Réessayer remplacent désormais la page vide en cas d’autre panne d’initialisation. Le bouton recharge la page ; il ne supprime aucune donnée. Le téléchargement hors connexion inclut les nouveaux fichiers.

Validation : test négatif sans `Array.at` reproduisant exactement l’exception des modèles, puis vrai démarrage et navigation après suppression de `at`, `flat`, `flatMap` et `Object.fromEntries`, sauvegardes des deux enfants conservées. Test du message de panne et du bouton Réessayer, puis suites voix, hors connexion, cursive et séparation Admin. Essai visuel de l’accueil et de l’écriture dans une page de démonstration où ces mêmes fonctions sont supprimées avant le chargement. Cette simulation ne remplace pas l’essai sur la tablette Samsung réelle.
