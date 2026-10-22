# Voix belge et sons de lecture — 22 octobre 2026

## Motif de cette seconde intervention

Le retour à l’écoute indiquait que la première banque Kokoro restait peu naturelle et que certains sons isolés, notamment « a », n’étaient pas satisfaisants. Le décodage des fichiers et les tests de navigation ne suffisent pas à valider la prononciation. Ils n’auraient pas dû être présentés comme une garantie de qualité phonétique.

Deux extraits de voix féminines ont été proposés : Denise (français de France) et Charline (français de Belgique), avec une consigne, « a » seul, des voyelles et une phrase de lecture. L’utilisateur a choisi la voix B, Charline. Ce choix porte sur ces extraits ; ce n’est pas une validation humaine exhaustive du corpus.

## Changements

- La banque active est `voix/index-belge.json`, produite avec `fr-BE-CharlineNeural` à −5 % du débit du service, sans changement de hauteur. La vitesse du lecteur revient à 100 % lors de la migration de l’ancien réglage par défaut de 95 %. Une vitesse personnalisée est conservée.
- Le moteur distingue explicitement un phonème (`ph|a`), une syllabe (`sy|ma`) et une phrase ordinaire. Les 13 modèles vocaliques disposent d’une identité dédiée. Un phonème n’est pas remplacé par le nom de sa lettre.
- Les phonèmes restent à leur vitesse originale, y compris avec la tortue ou un autre réglage de voix. Les syllabes et les mots peuvent être légèrement ralentis, avec conservation de la hauteur ; la tortue augmente aussi les pauses.
- Si un enregistrement de lecture manque ou ne peut pas être chargé, la consigne affiche une invitation à réessayer. Elle n’est pas confiée à la synthèse générique de l’appareil. Les autres messages conservent leur secours vocal.
- Une phrase enregistrée complète est préférée à une succession de fragments. Le secours de l’appareil reçoit aussi une phrase complète lorsque c’est possible.
- L’aide à la lecture et la réécoute en dictée prononcent le mot entier. Le découpage orthographique coloré n’est plus synthétisé comme s’il décrivait systématiquement des syllabes orales : par exemple « mou-che » ne doit pas donner une syllabe supplémentaire, et le `s` de « fusée » se prononce /z/ dans le mot.
- Les jeux de fusion conservent leurs modèles de syllabes simples. Le tracé des voyelles utilise les mêmes références que la lecture. Les enregistrements de lecture restent prioritaires même si la voix de l’appareil est choisie pour les autres consignes.
- L’espace parents donne accès séparément aux 13 références vocaliques et à trois exemples : consigne, son et mot, calcul.
- L’atténuation des bruitages, l’annulation des lectures, les limites de mémoire et les corrections concurrentes de l’application sont conservées. La clé de sauvegarde et les progrès des enfants sont inchangés.

## Fabrication et vérification

Le script `scripts/build_natural_voices.py` transmet uniquement les textes publics du jeu au service vocal Microsoft. Il contrôle les métadonnées temporelles contre tous les caractères alphanumériques du texte avant de séparer les enregistrements par lots. Un lot non alignable est régénéré individuellement. Les attaques et les fins de mots gardent une marge audio ; aucun étirement de voyelle ou modification de hauteur n’est ajouté. Le jeu distribue ensuite des fichiers statiques et ne contacte pas le service de génération.

`tests/speech.test.cjs` vérifie notamment les identités des sons, l’absence de secours phonétique automatique, la conservation du débit des phonèmes, la réécoute lente des mots, les phrases continues, l’annulation et la préservation de la progression. `controle-audio-belge.json` documente le décodage, les limites, la présence de toutes les anciennes entrées et les niveaux du signal.

Ces contrôles détectent les fichiers manquants, silencieux, invalides ou mal associés. Ils ne certifient pas la justesse acoustique de chaque phonème ou de chaque syllabe. La voix reste une synthèse neuronale ; ce n’est pas un enregistrement d’orthophoniste. La qualité pédagogique de tout le corpus nécessite encore une écoute par un professionnel francophone et des essais avec les enfants, notamment sur iPad réel.

## Références du fournisseur

- [Voix et langues Microsoft Speech](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts) : identité et locale de la voix.
- [Prononciation et alphabets phonétiques](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup-pronunciation) : distinction entre texte, lettre et phonème. L’outil de génération employé ici ne prend pas en charge le SSML personnalisé ; cette référence n’est pas une affirmation de contrôle phonétique SSML sur Charline.
- [edge-tts](https://github.com/rany2/edge-tts) : outil de préparation utilisé hors du navigateur. Sa licence ne constitue pas une licence ouverte attribuée aux enregistrements Microsoft.
