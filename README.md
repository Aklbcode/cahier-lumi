# Le Cahier de Lumi

Jeux éducatifs pour Luca (5-6 ans, 1re primaire) et Lola (3 ans, maternelle) : lecture phonique, calcul, logique, grands jeux.

**Ouvrir :** https://aklbcode.github.io/cahier-lumi/

- iPad : ouvrir le lien dans Safari → bouton Partager → « Sur l’écran d’accueil ».
- Mac : ouvrir le lien dans Safari ou Chrome et l’ajouter aux favoris (ou au Dock).
- La progression est enregistrée sur chaque appareil. Espace parents (cadenas) → « Sur cet appareil » pour ouvrir directement le monde de Luca ou de Lola.
- Voix : nouvelle banque féminine française Kokoro (`ff_siwis`), dans `voix/`, avec vitesse réglable sans déformer la hauteur. La tortue réécoute la consigne plus lentement. Les bruitages baissent pendant la parole.
- Espace parents → Voix de Lumi : tester une consigne, des sons ou un calcul, régler la vitesse et choisir la voix de secours.

## Vérification des voix

Le moteur se trouve dans `speech-engine.js` ; les progrès gardent leur sauvegarde habituelle. `audit-voix/Analyse-et-corrections.md` décrit les constats, les changements et les limites de vérification. `audit-voix/controle-audio.json` contient les contrôles effectifs de la banque sonore finale.

Les tests de comportement du lecteur se lancent avec `node tests/speech.test.cjs`. Le script `scripts/build_voices.py` régénère les enregistrements avec les poids locaux de Kokoro, et `scripts/check_audio.py` décode et contrôle chaque entrée. Les poids et l’environnement de génération restent hors de l’application livrée. Les crédits du modèle et de la voix figurent dans le rapport d’audit.
