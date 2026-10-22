# Le Cahier de Lumi

Jeux éducatifs pour Luca (5-6 ans, 1re primaire) et Lola (3 ans, maternelle) : lecture phonique, calcul, logique, grands jeux.

**Ouvrir :** https://aklbcode.github.io/cahier-lumi/

- iPad : ouvrir le lien dans Safari → bouton Partager → « Sur l’écran d’accueil ».
- Mac : ouvrir le lien dans Safari ou Chrome et l’ajouter aux favoris (ou au Dock).
- La progression est enregistrée sur chaque appareil. Espace parents (cadenas) → « Sur cet appareil » pour ouvrir directement le monde de Luca ou de Lola.
- Voix : banque féminine neuronale **Charline, français de Belgique**, choisie à l’écoute de deux extraits. Les fichiers sont préparés à l’avance dans `voix/` ; l’appareil n’utilise pas le service de voix pendant le jeu.
- Les sons de référence utilisent des enregistrements dédiés à vitesse d’origine. Une absence de fichier demande une nouvelle écoute et ne déclenche jamais une prononciation automatique de remplacement. La tortue ralentit légèrement les mots et allonge les pauses. Les bruitages baissent pendant la parole.
- Espace parents → Voix de Lumi : tester une consigne, chacun des 13 sons voyelles ou un calcul, régler la vitesse des consignes et choisir la voix de secours pour les autres messages.

## Vérification des voix

Le moteur se trouve dans `speech-engine.js` ; les progrès gardent leur sauvegarde habituelle. `audit-voix/Voix-belge-et-sons-de-lecture.md` décrit la nouvelle version. L’ancien rapport est conservé pour retracer la première intervention. `audit-voix/controle-audio-belge.json` contient les contrôles de la nouvelle banque sonore.

Les tests du lecteur se lancent avec `node tests/speech.test.cjs`. `scripts/build_natural_voices.py` prépare les fichiers Charline avec `edge-tts==7.3.1`. Cette étape envoie les textes publics de l’application au service vocal Microsoft ; aucune progression, réponse d’enfant ou donnée de profil n’est envoyée. L’application publiée n’intègre ni clé de service ni bibliothèque de génération. `scripts/check_audio.py --bank voix/index-belge.json --output audit-voix/controle-audio-belge.json` décode et contrôle les fichiers. Les anciens scripts et fichiers Kokoro sont conservés à titre d’historique et ne sont plus chargés par le jeu.
