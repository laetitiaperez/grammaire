# Carte de la grammaire — design

Date : 2026-10-29

## Intention

Outil personnel de révision de la grammaire pour le CRPE. Il sert à comprendre les notions, à les mémoriser et à s'auto-tester.

Source unique : le guide Eduscol *La grammaire du français. Terminologie grammaticale* (MENJ, dir. Philippe Monneret et Fabrice Poli, 213 p.), niveaux I et II. Fichier local : `~/Documents/ECOLE/0.Objectif CRPE/2.1.français/guide-la-grammaire-du-francais-terminologie-grammaticale-67998.pdf`.

Modèle : les cartes déjà faites, en particulier la Carte de la versification (`~/Claude Code/versification`). On reprend son principe : le contenu de la carte est figé, écrit une fois pour toutes, et l'auto-test vient s'ajouter par-dessus sans le modifier.

## Critères de réussite

- Chaque notion du sommaire du guide (niveaux I et II) a sa fiche.
- La terminologie est exactement celle du guide (« déterminant possessif », « groupe circonstanciel », « complément circonstanciel », etc.).
- Chaque fiche renvoie à la page du guide.
- La page est lisible sur téléphone comme sur grand écran, en mode clair comme en mode sombre.

## Forme

- Une seule page HTML autonome (`index.html`), avec le contenu écrit dans la page sous forme de données JavaScript. On ne lui donne aucune capacité d'exécution ni aucun stockage.
- Elle est publiée comme artefact claude.ai, comme les autres cartes, et sur GitHub Pages depuis le dépôt `laetitiaperez/grammaire`.

## Articulation des deux niveaux (approche A)

- La carte montre une seule arborescence.
- Une notion présente au niveau I est une feuille ordinaire.
- Une notion qui n'existe qu'au niveau II est une feuille marquée d'un badge « II ».
- Chaque fiche a une partie « Essentiel » (niveau I) et un volet repliable « Approfondir (niveau II) ».
- Une notion propre au niveau II n'a pas de volet « Approfondir » : son contenu principal vient déjà du niveau II.

## Structure de la carte

Centre : **La phrase**, structure de base dont le guide fait découler toutes les autres.

Sept branches : quatre à gauche, trois à droite. Chacune a sa couleur. Le lexique a une teinte distincte de celles de la syntaxe. Les feuilles sont groupées par sous-titres.

### À gauche : la structure de la phrase

1. **Phrase simple et complexe** : proposition ; phrase simple et phrase complexe ; coordination ; juxtaposition ; types de phrases (déclaratif, interrogatif — direct ou indirect, total ou partiel —, impératif) ; formes de phrases (négative, passive, exclamative, emphatique, impersonnelle) ; phrases non verbales (II) : phrase averbale, phrase elliptique, mot-phrase.
2. **Les subordonnées** : principale et subordonnée ; complétive conjonctive ; interrogative indirecte totale ; interrogative indirecte partielle (II) ; circonstancielle ; relative adjective ; relative substantive (II) ; infinitive (II) ; participiale (II).
3. **Les fonctions** : sujet ; complément d'objet (COD, COI, COS) ; attribut du sujet ; attribut du COD (II) ; complément circonstanciel ; épithète ; complément du nom ; complément de l'adjectif (II) ; apposition (II) ; fonctions énonciatives et textuelles (II).
4. **Le lexique** :
   - formation des mots : morphème (II), mots dérivés (préfixes et suffixes), mots composés, locutions (II), conversion (II), autres procédés (II), histoire des mots (II) ;
   - relations entre les mots : famille de mots, champ lexical, synonymie et antonymie, homonymie, polysémie, dénotation et connotation (II), hyperonymie et hyponymie (II).

### À droite : la nature des mots

5. **Le nom et ses satellites** :
   - nom ;
   - déterminants : article, possessif, démonstratif, interrogatif (II), indéfini (II), exclamatif (II), numéral (II), relatif (II) ;
   - adjectif ;
   - pronoms : personnels, possessifs, démonstratifs, indéfinis (II), interrogatifs (II), relatifs (II), adverbiaux (II).
6. **Le verbe** : radical et désinence ; classement en groupes ; modes personnels (indicatif, subjonctif, impératif) ; modes non personnels ; temps ; auxiliaires et semi-auxiliaires (II) ; voix (II).
7. **Les mots invariables** : adverbe ; préposition et groupe prépositionnel ; conjonction de coordination ; conjonction de subordination ; interjection et onomatopée (II).

Volume prévu : 75 à 85 notions. La liste définitive suit le guide après sa lecture complète. Une notion peut être ajoutée ou fusionnée si le guide le justifie.

## Contenu d'une fiche

1. **Définition** : celle du guide au niveau I, reformulée de près avec ses termes.
2. **Exemples** : des phrases courtes, de préférence celles du guide, avec la notion mise en évidence.
3. **Comment le reconnaître** : les manipulations utiles (pronominalisation, effacement, déplacement, remplacement, encadrement par « c'est… que », question posée sur le verbe, etc.). Quand une manipulation n'est pas tirée du guide, elle est signalée comme une astuce.
4. **Nature ↔ fonction** : des étiquettes cliquables qui mènent aux autres fiches. Une fiche de fonction liste les natures possibles (annexe, tableau 1). Une fiche de nature liste les fonctions possibles (annexe, tableau 2).
5. **Approfondir (niveau II)** : un volet repliable. Il contient les distinctions fines, les encadrés « Pour aller plus loin » et les rapprochements avec le latin ou l'ancien français quand le guide en fait.
6. **Référence** : « Guide Eduscol, p. N », avec la page du niveau I et, s'il y en a une, celle du niveau II.

Règles de fidélité :
- Lire le guide en entier avant d'écrire les fiches.
- Reformuler, sans recopier de longs passages.
- Ne rien inventer qui contredise le guide.

## Organisation de la page

1. En-tête et méthode d'analyse en 5 étapes : délimiter la phrase ; repérer les verbes conjugués et compter les propositions ; trouver le sujet et le groupe verbal ; donner la nature de chaque groupe ; donner sa fonction.
2. Recherche : les notions trouvées s'allument sur la carte, les autres s'estompent.
3. La carte et sa fiche : la fiche reste à droite sur grand écran et passe sous la carte sur téléphone. Les liens SVG entre le centre, les branches et les feuilles disparaissent sur petit écran, comme dans la carte de la versification.
4. **Toutes les fiches**, rangées par branche, avec le **mode révision** : les définitions sont floutées et un clic les révèle. Un compteur indique combien ont été révélées.
5. **Les confusions classiques**, environ 15 encadrés :
   - COD ou attribut ? COI ou complément circonstanciel ? Épithète ou attribut ?
   - Complément du nom, épithète ou apposition ?
   - « que » pronom relatif ou conjonction ? « leur » déterminant ou pronom ? « le » article ou pronom ?
   - « avant » ou « avant que » : préposition ou conjonction ?
   - Passif ou « être » + attribut ? Passé composé avec « être » ou passif ?
   - Relative ou complétive ? Adverbe ou adjectif ?
   - Homonymie ou polysémie ? Famille de mots ou champ lexical ? Dérivation ou composition ?
6. **S'entraîner** : environ 40 questions à choix multiple, dans un ordre aléatoire, en trois familles.
   - *Analyser* : un mot ou un groupe est souligné dans une phrase ; il faut donner sa nature, sa fonction ou le type de proposition.
   - *Croiser* : des questions tirées des tableaux de l'annexe (« Laquelle de ces natures ne peut pas être attribut du sujet ? »).
   - *Reconnaître* : le type ou la forme d'une phrase, le procédé de formation d'un mot.

   Chaque réponse est corrigée et justifiée, avec un bouton « Ouvrir la fiche ». Le score ne vaut que pour la séance.
7. Pied de page : la source (guide Eduscol), avec le rappel que les exemples sont tirés du guide ou forgés.

## Ce qui n'est pas prévu

- Un atelier d'analyse automatique : l'analyse grammaticale d'une phrase quelconque par programme serait trop souvent fausse.
- L'enregistrement des progrès d'une séance à l'autre.
- La modification du contenu depuis la page.

## Style

- Même facture que la carte de la versification : couleurs définies dans `:root` avec un mode sombre, palette de 7 couleurs de branche, typographies Google Fonts, `prefers-reduced-motion` respecté.
- Le titre de la page est « Carte de la grammaire ».

## Vérification

- Chaque entrée du sommaire du guide (p. 6-10) correspond à une fiche ou à une partie de fiche.
- Les liens nature ↔ fonction sont cohérents avec les tableaux 1 et 2 de l'annexe, dans les deux sens.
- Chaque question du quiz pointe vers une fiche qui existe, et sa réponse est justifiée par le guide.
- La page est contrôlée dans le navigateur à 375 px et sur grand écran, en mode clair et en mode sombre, sans erreur dans la console.
