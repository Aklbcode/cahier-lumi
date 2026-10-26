# Cahier de Lumi — analyse de la mise à jour et nouveaux parcours

Version corrigée **2.7.0 — 26 octobre 2026**. Version analysée : branche publique `main`, commit `77dee66a6dccfe047939cc95497f18349336e82d` du 25 octobre, comprenant les onze compléments « école ».

## Conclusion

Les nouveaux jeux enrichissent utilement Lumi : décomposition des nombres, différentes graphies d’un son, construction de phrases, vocabulaire grammatical oral, formes et calendrier. Leur principal défaut était leur articulation avec les activités existantes. L’ajout d’un titre au bon endroit ne garantissait ni des prérequis cohérents, ni un corpus adapté aux sons déjà travaillés.

La correction porte donc sur trois couches : les regroupements visibles, les dépendances entre étapes et le contenu effectivement tiré dans les exercices. Elle conserve les identifiants des activités, les résultats, les trésors, les passages adultes et les séries enregistrées.

## Méthode et portée

- Lecture du code réellement publié et comparaison avec l’interface en ligne. Les onze compléments ont été identifiés dans le dépôt et les menus, même si le pied de page affichait encore 2.6.0.
- Observation des catégories de Luca, du chemin des sons et de la maison des nombres, puis contrôle de la nouvelle organisation en navigateur local.
- Analyse séparée des corpus et moteurs de lecture, des niveaux de calcul, de la sauvegarde, des récompenses et des aides.
- Tests des générateurs et du moteur réel, profils artificiels et anciens formats de sauvegarde. Les simulations ne sont pas des observations d’enfants.
- Les principes de traçabilité du skill REA ont été utilisés ; les outils MCP REA n’étaient pas connectés. Les preuves proviennent de la lecture normale du code et du navigateur, pas d’un rapport produit par un moteur REA.

Les observations ne constituent ni une étude d’efficacité de Lumi, ni un audit complet d’ANTON. Il n’y a pas eu d’écoute humaine exhaustive des enregistrements ni d’essai sur la Samsung réelle.

## Résultats principaux de l’audit

| Priorité | Constat dans la version analysée | Traitement en 2.7.0 |
|---|---|---|
| Haute | Une liste unique mélangeait chronologie orale, premiers sons, encodage, lecture de phrases et entraînement visuel. | Parcours de lecture en étapes et branches orales parallèles. |
| Haute | Les nouveaux jeux de phrases et graphies ne contrôlaient pas les sons requis. Exemple : « La vache boit » pouvait arriver avant `oi`. | Corpus annotés et filtrés ; découverte guidée distinguée de la lecture autonome. |
| Haute | Un petit corpus dans « Écrire avec les lettres » déclenchait un repli vers tous les mots, même inconnus. La rivière utilisait également des mots non filtrés. | Suppression du repli général en lecture autonome ; cibles et distracteurs de la rivière compatibles avec le corpus. Au moins trois cibles distinctes pour ouvrir un entraînement indépendant de mots. |
| Haute | L’ancien parcours imposait nombres jusqu’à 100 et multiplication avant les premiers problèmes. | Graphe de 33 étapes : problèmes jusqu’à dix après premières additions et soustractions ; problèmes jusqu’à vingt avant les extensions. |
| Haute | Visiter le pont des dix suffisait à préparer l’égalité et les barres. | Prérequis fondés sur des résultats utiles, avec maintien explicite des accès historiques et adultes. |
| Haute | Une ouverture parent pouvait être confondue avec la connaissance des sons pour les livres. | La décodabilité des livres utilise les correspondances réussies indépendamment ; l’écoute accompagnée reste possible. |
| Moyenne | Bilan de calcul : entraînement parfait puis défi 5/6 → trois étoiles affichées mais deux créditées. | Un seul score final pour le bilan et le compteur, en lecture et calcul. |
| Moyenne | L’espace parents promettait une synchronisation Claude même sur GitHub, où le service distant est désactivé. | Texte explicite sur la sauvegarde locale et l’export/import ; statut distant conditionnel. |
| Moyenne | Les onze jeux récents étaient accompagnés d’un numéro et d’une date de version anciens. | Pied de page 2.7.0, date du 26 octobre et version de cache renouvelée. |

## Nouveau parcours « Lire » de Luca

1. **Les sons et les lettres** : Apprendre à lire, Trouver la première lettre, Jouer avec les sons. La phonologie orale et la découverte du code se soutiennent ; il n’est pas nécessaire de terminer tout l’alphabet avant d’assembler.
2. **Assembler et écrire des mots** : Écrire les mots, Assembler les syllabes, Écrire avec les lettres, Lire des mots inventés. Les prérequis portent sur les correspondances nécessaires au niveau et sur un corpus suffisamment varié.
3. **Lire et comprendre** : Construire une phrase, Lis et fais, Mes petits livres. Les phrases mobilisent les sons déjà travaillés ; l’aide sonore reste signalée.
4. **D’autres écritures des sons** : Distinguer b, d, p et q ; Découvrir les autres graphies. La première comparaison visuelle peut être découverte librement ; les tâches son–lettre suivantes contrôlent leurs prérequis.

Deux espaces restent disponibles à côté de cette progression : **Revoir ce que j’ai rencontré** pour les rappels et mots connus, et **Écouter et comprendre** pour les petits mots grammaticaux oraux et les histoires illustrées. Une réussite orale n’est pas comptée comme une preuve de décodage. Le travail cursif reste dans Créer et ne bloque jamais la lecture.

### Corrections des nouveaux corpus

Les prérequis sont définis par niveau, et non par un nombre arbitraire de sons débloqués. Un son passé par le parent n’est pas traité comme réussi sans aide. Les correspondances absentes ou ambiguës ne sont pas devinées : `un` n’est pas assimilé automatiquement à `in`, et des semi-voyelles non enseignées sont exclues de la lecture annoncée autonome.

Dans les graphies, la découverte du nouveau code est guidée. La lecture autonome d’une autre graphie exige les correspondances utiles. Une complétion réutilise un mot effectivement montré pendant la série. Les phrases courtes et écoutes ajoutées réemploient des enregistrements existants ; aucune nouvelle voix système n’a été introduite.

## Nouveau parcours « Calculer » de Luca

- **Construire les nombres** : cubes, ligne numérique, maisons des nombres.
- **Ajouter, enlever et résoudre** : le parcours principal, réorganisé à l’intérieur de ses 33 étapes. Les indices des anciennes sauvegardes restent inchangés.
- **Trouver des stratégies** : compléments à dix, égalité et représentation par barres.
- **Revoir les calculs rencontrés** : rappels utilisant de vrais faits déjà rencontrés.
- **Les nombres au quotidien** : nombres écrits et marché, en parallèle du parcours principal.
- **Formes, mesures et temps** : géométrie, grandeurs, calendrier et heure. Ces branches ne demandent pas de terminer toutes les opérations. Les niveaux de monnaie et d’heure gardent leurs prérequis locaux utiles.
- **Pour aller plus loin** : groupes égaux puis découverte de la multiplication. Dans le parcours principal, nombres jusqu’à cent, produits et problèmes multiplicatifs sont explicitement des extensions.

Exemple : après une réussite des premières additions illustrées et des premiers retraits illustrés jusqu’à dix, l’enfant peut travailler les histoires jusqu’à dix. Il ne doit pas connaître les tables. Les nombres jusqu’à vingt et les stratégies se développent ensuite avec leurs dépendances propres, sans imposer toutes les branches dans un ordre unique.

## Lola : découverte progressive

« Écouter » regroupe vocabulaire et compréhension, jeux de sons, puis découverte des lettres en parallèle. « Compter » commence par doigts et petites quantités, puis construction/comparaison et ligne numérique ; les tailles constituent une branche complémentaire. Aucun examen de lecture ni réussite en calcul formel n’est imposé à trois ans.

## Accès, résultats et sauvegardes

Une activité prématurée indique ce qui la prépare et propose un bouton direct vers l’activité correspondante. Le parent peut toujours ouvrir ou passer une étape. Les ouvertures ne donnent pas de réponses justes, d’étoiles ou de compétences automatiques.

Un instantané borné des accès historiques est conservé dans les réglages, séparément des anciens dossiers enfants. Il préserve les niveaux déjà ouverts sans transformer chaque nouvelle visite en autorisation générale. Les entraînements ouverts avant leurs prérequis sont marqués accompagnés. Les récompenses restent indépendantes des prérequis : dix étoiles ouvrent un trésor, sans diamant comme monnaie.

Les champs des anciens dossiers enfants ne sont pas réécrits pour les reclasser. Le profil Admin reste séparé. Les reprises et les passages conservent leur statut propre. Sur GitHub Pages, la progression reste locale à chaque navigateur ; l’export/import permet de la transférer.

## Points restant à améliorer

- Le premier moteur de lecture présente encore six voyelles avant la première consonne. Intercaler plus tôt consonnes et fusion mérite une prochaine migration dédiée, car l’ordre actuel est inscrit dans les sauvegardes.
- Plusieurs tâches de début de calcul vont directement jusqu’à dix. Un palier systématique 1–3 puis 1–5 dans ce moteur précis serait une amélioration ; les cubes et jeux de Lola proposent déjà des plages plus petites.
- Les nouveaux jeux scolaires standard progressent selon leurs séries, tandis que les deux parcours principaux emploient un défi séparé. Ces résultats ne doivent pas être présentés comme des évaluations équivalentes.
- L’affichage facultatif bref d’un mot mesure une reconnaissance visuelle dans le jeu, pas la fluence orale. Aucun microphone ni classement automatique de prononciation n’est ajouté.
- Le cache conserve un repli hors connexion, mais ne garantit pas une mise à jour atomique de tous les fichiers ni un stockage indéfiniment conservé par la tablette.
- L’autonomie technique ne remplace pas les échanges oraux, les manipulations d’objets et l’observation de l’écriture sur papier.

## Fondements pédagogiques

Le classement est un choix de conception documenté, pas un ordre universel validé expérimentalement pour Lumi.

- [CSEN — Apprendre à lire](https://www.csen.education.gouv.fr/enseigner-la-lecture-page-editoriale/) : enseignement explicite du code et compréhension orale en parallèle.
- [FWB — Référentiel français, P1](https://ifpc-fwb.be/v5/documents/tc/refFRALA.pdf#page=37) : articulation oral, lecture et encodage ; correspondances du simple au complexe.
- [EEF — Improving Mathematics in the Early Years and Key Stage 1](https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/early-maths/) : trajectoires de développement, représentations, langage et branches complémentaires.
- [FWB — Référentiel mathématiques, P1](https://ifpc.cfwb.be/v5/documents/tc/refMATH.pdf#page=31) : additions et soustractions jusqu’à vingt ; groupements concrets avant la multiplication formelle de P2.
- [FWB — Référentiel des compétences initiales](https://ifpc-fwb.be/v5/documents/tc/refRCI.pdf) : attendus maternels et progressivité M1–M2 puis M3.

## Pièces de vérification

Les audits de base sont disponibles dans [Audit général](Audit-general-2026-10-25.md), [Audit lecture](Audit-lire-2026-10-25.md) et [Audit calcul](Audit-calcul-2026-10-25.md). Le fichier `validation-parcours-20261026.json` consigne les dernières suites automatisées. Les tests comprennent notamment topologie des 33 étapes, accès historiques/adultes, conservation des profils, corpus aux frontières des sons connus, moteur de passage, reprise et cohérence des étoiles. Les essais en navigateur sont consignés dans `verification-navigateur-20261026.json`.
