# Cahier de Lumi — voix et compréhension

Analyse de la version publiée sur https://aklbcode.github.io/cahier-lumi/ et du commit source `9a2715b37b44d89a4d1a141bb912c4d635b2050d`. Correction préparée les 21–22 octobre 2026. La correction de l’espace parents publiée dans le commit `91d01c5d783c3c9f7d4c3a8dcf081c73e1f839ac` est également conservée, ainsi que l’ajustement des noms non comptables dans la cuisine du commit `72daefc10621afcc091b6e2c8d953fade171f3f0`.

## Constats vérifiables

- Le fichier de banque vocale indique `Piper fr_FR-upmc (Jessica)`, malgré un README mentionnant déjà Kokoro. La banque et sa documentation ne concordent pas.
- Les curseurs de vitesse et de hauteur ne modifient que la synthèse du navigateur. Les enregistrements Web Audio sont lus à leur vitesse fixe. Le réglage affiché ne correspond donc pas toujours à la lecture entendue.
- Chaque fragment absent de la banque peut faire basculer la lecture vers une voix différente au milieu d’une même consigne.
- Les substitutions `chu → chut`, `ké → quai` et `jin → gin` peuvent changer les sons utiles à l’apprentissage. Elles ne constituent pas de bons modèles de fusion consonne-voyelle.
- Certains titres de jeux sont lancés puis interrompus après 350 à 380 millisecondes par l’ouverture du jeu et sa consigne.
- Les bruitages de récompense peuvent recouvrir la parole, sans atténuation commune.

Un essai du jeu révèle également une ambiguïté auditive : « poire » peut apparaître comme mauvaise réponse à la recherche de /a/, alors que /wa/ contient ce son. Les mots comme « lion » ne fournissent pas un modèle fiable de /i/ isolé, et le eu ouvert de « fleur » diffère du eu fermé de « feu ».

## Corrections

Nouvelle banque féminine française `Kokoro-82M v1.0 / ff_siwis`, produite localement avec des débits de génération distincts pour les phrases, les mots et les modèles lents. Le navigateur reçoit uniquement les enregistrements, pas le modèle d’IA. Les fichiers sont mono, à 24 kHz ; les niveaux sont ajustés et les faibles débuts/fins de mots sont conservés.

Les voyelles et certaines syllabes sensibles sont préparées avec des indications phonétiques explicites. Les choix des exercices d’écoute écartent les distracteurs ambigus et les mots qui ne correspondent pas au son isolé annoncé. Des modèles articulés avec le e neutre sont préparés pour « cheval », « renard », « melon », « biberon » et « requin ».

Les consonnes ne sont pas présentées comme des pseudo-sons « meu », « peu » : les leçons conservent leurs mots d’appui et leurs syllabes. Les syllabes avec e neutre disposent d’entrées distinctes des mots comme « feu » ou « peu ».

Le lecteur utilise un seul timbre pendant chaque message. Si tous les fragments sont enregistrés, il utilise la banque de Lumi. Si un fragment manque, l’ensemble du message utilise la voix de secours de l’appareil. Les messages ne mêlent plus deux timbres.

La vitesse des enregistrements est réglable de 75 à 110 %, avec conservation de la hauteur par le lecteur du navigateur. La tortue ajoute un ralenti ponctuel et des pauses plus longues. Les bruitages sont atténués pendant la préparation et la lecture d’une consigne. Une commande d’arrêt annule immédiatement la lecture et ses attentes.

Les chargements audio sont ciblés, avec des paquets limités à environ 1,2 Mo et un cache mémoire borné. Les sons et les mots lents sont regroupés pour éviter de télécharger de grandes banques de phrases avant d’entendre une voyelle.

Les titres des jeux ne sont plus coupés par une consigne lancée presque simultanément. Les nouvelles commandes Parents proposent des exemples de consigne, de sons et de calcul, avec un état de lecture visible. Le bouton de choix de la voix de secours teste effectivement cette voix.

## Vérifications et limites

`tests/speech.test.cjs` vérifie le débit des enregistrements, le ralenti, la cohérence du timbre de secours, le choix féminin, l’annulation, les prononciations corrigées dans le contenu et la syntaxe du script principal. `scripts/check_audio.py` contrôle chaque entrée de la banque finale après décodage : validité du signal, fréquence, durée, saturation, limites des paquets et couverture de l’ancienne banque. Les résultats effectifs figurent dans `controle-audio.json`.

Les vérifications dans le navigateur contrôlent les commandes et la lecture effective d’un fichier. Elles ne remplacent pas une expertise acoustique et didactique, ni un essai avec les enfants. Les phonèmes isolés et les variantes régionales demandent une écoute humaine attentive. Une voix synthétique ne constitue pas un enregistrement humain validé par un orthophoniste.

La voix de secours dépend des voix françaises installées et des politiques audio du navigateur. Safari/iPad doit également être essayé sur les appareils des enfants. Les progrès conservent leur clé de sauvegarde existante ; les corrections ne modifient pas les compétences ou récompenses acquises.

## Sources techniques et crédits

- [Kokoro-82M — modèle](https://huggingface.co/hexgrad/Kokoro-82M), licence Apache-2.0.
- [Kokoro — voix et limites sur les très courts énoncés](https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md).
- [kokoro-onnx — moteur d’inférence](https://github.com/thewh1teagle/kokoro-onnx), licence MIT. La génération utilise le modèle complet, sans appel à un service vocal distant.
- Voix `ff_siwis` : [SIWIS French Speech Synthesis Database](https://doi.org/10.7488/ds/1705), Yamagishi, Junichi ; Honnet, Pierre-Edouard ; Garner, Philip ; Lazaridis, Alexandros (2017), University of Edinburgh. Les sorties livrées sont synthétiques et non des extraits de cette base de données.
- [MDN — vitesse de la synthèse vocale](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/rate).
