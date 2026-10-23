# Le Cahier de Lumi · BOOX

Application autonome pour les anciennes liseuses BOOX Note Pro, issue de la version du Cahier de Lumi du 23 octobre 2026. Adresse propre : https://aklbcode.github.io/cahier-lumi/boox/ . Les fichiers de l'application habituelle sont conservés à l'identique ; seule cette nouvelle arborescence est publiée.

## Utilisation sur la liseuse

1. Ouvrir la nouvelle adresse dans le navigateur BOOX, puis la mettre en favori.
2. Toucher **Écouter Lumi** pour tester la voix. Vérifier le volume et, si nécessaire, connecter une enceinte ou un casque Bluetooth.
3. Choisir Luca ou Lola, puis un thème. Chaque exercice reste accessible par toucher ; **Passer l’exercice** permet de sortir d'un blocage.

Les progrès de cette édition sont indépendants. Pour reprendre une sauvegarde de l'autre site, exporter son fichier dans l'espace parents, puis utiliser **Restaurer un fichier** sur la BOOX. Les données des anciens jeux de couleurs, transformés en motifs, sont archivées lors de cet import et ne sont pas considérées comme de nouvelles compétences acquises.

## Adaptations

- Interface blanche, texte noir, contours épais, boutons d'au moins 56 pixels, police système sans téléchargement de polices.
- Navigation par pages pour les longues listes ; aucune animation indispensable, aucun confetti ni retournement en 3D du mémo.
- Formes et motifs remplacent les exercices de couleurs. Les différences portent sur des formes ou des objets ; le papillon utilise des dessins. Les cartes exportées ont un fond blanc et une encre noire.
- Lecture, calcul, niveaux, progression, trésors, aide parentale et exercices passés conservés. Les sons dédiés de lecture et la voix belge Charline sont conservés.
- MP3 ordinaires : aucune synthèse vocale du système et aucune dépendance à Web Audio. Les cris d'animaux se déclenchent par un toucher explicite.
- JavaScript compilé en ES5, bibliothèques de compatibilité locales, solution de repli pour les événements tactiles, le réseau et les API du DOM. Pas de compilateur livré à la liseuse.
- Cache hors connexion propre, si le navigateur permet les service workers. Sans cette fonction, les jeux restent utilisables en ligne. Le téléchargement complet des voix demande environ 220 Mo et se lance dans l'espace parents.

Le site ne peut pas commander le rafraîchissement matériel de la dalle. En cas de rémanence, utiliser la commande de rafraîchissement BOOX et privilégier son mode d'affichage de qualité normale.

## Vérification et limites

Les fichiers exécutables sont analysés avec une grammaire ES5. Les tests vérifient les jeux monochromes, les sauvegardes distinctes, l'archivage sans faux acquis, l'absence de dépendance à Web Audio et l'intégrité de la version initiale. Un profil de démonstration est testé dans le navigateur avec Promise, Map, Set, fetch, Pointer Events et plusieurs API du DOM désactivés avant le chargement. Ce test n'émule ni le moteur exact de NeoBrowser ni la dalle E Ink ; l'essai sur la liseuse physique reste nécessaire.

Base matérielle : [BOOX Note Pro](https://www.boox.com.hk/en/pages/boox-note-pro) (Android 6 d'origine, 10,3 pouces, 16 gris), [fiche ONYX et audio](https://onyxboox.com/boox_notepro), [archives de firmware](https://downloads.boox.com/download/note), [réglages d'affichage](https://booxsupport.zendesk.com/hc/en-us/articles/10701172864916-Display-Settings). La version du navigateur installée sur l'appareil n'est pas présumée.

## Sources et licences

Les illustrations et les enregistrements animaliers conservent leurs [crédits graphiques](assets/illustrations/CREDITS.md) et [crédits audio](assets/animaux/credits.md). core-js : licence MIT dans vendor/CORE-JS-LICENSE. Les outils de compilation et de vérification Babel/Acorn sont verrouillés dans scripts/build-tools-lock.json et ne sont pas chargés par le site.
