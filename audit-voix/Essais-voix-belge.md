# Essais de la version à voix belge — 22 octobre 2026

- Choix de voix par l’utilisateur après comparaison de deux extraits : **B — français de Belgique**.
- Contrôle de tous les fichiers : **10 176 enregistrements uniques**, **16 052 entrées**, 152 packs, 178 559 280 octets. Aucun échec de décodage, aucune saturation détectée. Rapport : `controle-audio-belge.json`.
- Simulation des consignes de lecture : **982 messages**, **5 767 unités vocales**, aucun enregistrement manquant. Rapport : `couverture-lecture-belge.json`.
- Tests du lecteur réussis : phrase continue, débit des enregistrements, hauteur préservée, annulation, secours des consignes, absence de secours automatique des phonèmes/syllabes, nouvelle tentative après échec de chargement, migration des réglages et conservation des progrès.
- Navigateur intégré sur Mac : ouverture, choix de joueur, accès à l’espace parents, affichage de Charline/français de Belgique comme voix principale et accès aux treize références vocaliques.
- Lecture effective du son « a » : fichier chargé, durée 0,624 s, vitesse 1, lecteur en lecture. Vérifiée aussi sur le bouton de la leçon 1.
- Choix « voix de l’appareil » pour les consignes, puis lecture de « u » : le son de référence garde son enregistrement de Lumi, durée 0,696 s et vitesse 1.
- Consigne de démonstration : un seul enregistrement de 5,352 s pour « Écoute. Regarde les images. Puis choisis ta réponse. ».
- Réglages et commande d’arrêt fonctionnels ; aucune alerte ni erreur du navigateur pendant ces essais. Capture : `livraison/Apercu-voix-belge.png` dans la livraison locale.

Il s’agit de contrôles fonctionnels et de signal, avec validation du choix de voix sur les extraits proposés. Aucune écoute humaine exhaustive ou certification orthophonique n’est revendiquée. L’essai sur iPad physique reste à faire.
