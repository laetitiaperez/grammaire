# Carte de la grammaire — plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**But :** construire une page web de révision de la grammaire pour le CRPE. Elle contient une carte mentale au contenu figé, issue des niveaux I et II du guide Eduscol, plus un mode révision, les confusions classiques et un entraînement par QCM.

**Architecture :** le contenu est séparé du code d'affichage. Les données se trouvent dans `data/*.js` : chaque fichier ajoute sa partie à un objet global `window.CARTE`. L'affichage est découpé en trois fichiers : `index.html` (squelette), `style.css` et `app.js`. Les fonctions pures, qu'on peut tester, sont dans `lib.js`. Un vérificateur Node (`tests/verifier.mjs`) charge ces fichiers dans un contexte `vm` et contrôle la cohérence du contenu : identifiants, liens, pages, terminologie, couverture du sommaire.

**Pile technique :** HTML, CSS et JavaScript sans framework ni dépendance. Typographies Google Fonts. Node 26 pour les tests (`node:test`, `node:vm`).

**Spec :** `docs/superpowers/specs/2026-10-29-carte-grammaire-design.md`

## Contraintes globales

- Source unique : guide Eduscol *La grammaire du français. Terminologie grammaticale*. PDF : `~/Documents/ECOLE/0.Objectif CRPE/2.1.français/guide-la-grammaire-du-francais-terminologie-grammaticale-67998.pdf`. Les numéros de page imprimés correspondent aux numéros de page du PDF.
- Terminologie du guide. Termes interdits dans tout le contenu : « adjectif possessif », « adjectif démonstratif », « complément de phrase », « adjectif qualificatif ».
- Reformuler, sans recopier de longs passages. Toute manipulation qui ne vient pas du guide va dans le champ `astuce`.
- Langue : français, typographie française (espace insécable avant `: ; ? !`, guillemets « »).
- Titre de la page : « Carte de la grammaire ».
- Volume : entre 75 et 85 notions. Le vérificateur accepte de 70 à 95, pour laisser la place à des ajustements justifiés par le guide.
- La page ne stocke rien. Aucune capacité d'artefact. `localStorage` n'est pas utilisé.
- Couleurs définies dans `:root`, avec un mode sombre sous `@media (prefers-color-scheme: dark)` pour `:root:not([data-theme="light"])` et sous `:root[data-theme="dark"]`. `body` a un fond explicite. Marges latérales de 16 px. Pas de défilement horizontal à 375 px.
- Faire un commit après chaque tâche, avec un message en français qui se termine par `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Points d'attention pour la revue

1. Une recherche sans accent ni majuscule (« epithete », « COD », « cod ») doit trouver la notion. → test `norm`/`correspond`, tâche 2.
2. Un clic sur une étiquette nature ↔ fonction qui mène à une notion d'une autre branche doit la sélectionner sur la carte, mettre la fiche à jour et la faire défiler à l'écran sur téléphone. → contrôle dans le navigateur, tâche 8.
3. À la fin de la série de questions, il faut afficher le score final et un bouton « Recommencer » qui relance la série dans un nouvel ordre. → test `melanger` et contrôle dans le navigateur, tâche 10.
4. Les intitulés longs (« Proposition subordonnée interrogative indirecte partielle ») ne doivent provoquer aucun débordement horizontal à 375 px. → contrôle `scrollWidth` dans le navigateur, tâches 8 et 11.
5. Un contenu niveau II ne doit jamais être perdu ni dupliqué : une notion niveau I sans volet « Approfondir » alors que le guide la reprend au niveau II, ou une notion niveau II qui aurait un volet « Approfondir ». → règles du vérificateur, tâche 2.

---

## Structure des fichiers

```
grammaire/
  index.html            squelette de la page, charge data/*.js, lib.js, app.js
  style.css             mise en page, thèmes, responsive
  lib.js                fonctions pures (norm, correspond, naturesPour, fonctionsPour, melanger)
  app.js                rendu de la carte, de la fiche, des fiches, des confusions, du quiz
  data/
    00-carte.js         window.CARTE = {branches:[], nf:[], sommaire:[], confusions:[], quiz:[]}
    b1-phrase.js        branche 1 (Phrase simple et complexe)
    b2-subordonnees.js  branche 2
    b3-fonctions.js     branche 3
    b4-lexique.js       branche 4
    b5-nom.js           branche 5 (Le nom et ses satellites)
    b6-verbe.js         branche 6
    b7-invariables.js   branche 7
    nature-fonction.js  CARTE.nf (annexe, tableaux 1 et 2)
    sommaire.js         CARTE.sommaire (p. 6-10 du guide)
    confusions.js       CARTE.confusions
    quiz.js             CARTE.quiz
  notes/guide.md        notes de lecture avec les pages (matériau de travail, versionné)
  tests/
    charger.mjs         charge les fichiers data et lib.js dans un contexte vm → {CARTE, LIB}
    verifier.test.mjs   règles de cohérence du contenu
    lib.test.mjs        tests des fonctions pures
  README.md
```

## Formes des données (référence commune à toutes les tâches)

```js
// Branche
{ id:"phrase", side:"L"|"R", c:"--b1", l:"Phrase simple et complexe", t:"sous-titre court",
  d:"présentation de la branche", items:[Notion, ...] }

// Notion
{ id:"cod",                 // unique, kebab-case ASCII
  s:"Complément d'objet",   // sous-titre de regroupement sur la carte (facultatif)
  l:"Complément d'objet direct (COD)",
  niv:1|2,                  // 2 = notion propre au niveau II (badge « II »)
  d:"définition",
  ex:[{t:"Le chat boit [[du lait]].", n:"commentaire facultatif"}],  // [[ ]] = mis en évidence
  rep:["manipulation tirée du guide", ...],   // « Comment le reconnaître »
  astuce:"conseil qui ne vient pas du guide",  // facultatif
  appro:{ d:"texte niveau II", pts:["point", ...] },  // facultatif ; interdit si niv:2
  p:[15, 84] }              // pages du guide : niveau I puis niveau II

// Couple nature-fonction (annexe) : CARTE.nf = [["gn","sujet"], ["pronom-personnel","cod"], ...]
//   [0] = id d'une notion de nature (branches 2, 5, 6, 7), [1] = id d'une notion de la branche 3
// Entrée du sommaire : {num:"II.2.3.1", titre:"La fonction complément d'objet", p:84, ids:["cod","coi","cos"]}
// Confusion : {q:"COD ou attribut ?", r:"réponse courte (HTML : <strong>, <code>)", ids:["cod","attribut-sujet"]}
// Question : {fam:"analyser"|"croiser"|"reconnaitre", t:"phrase avec [[groupe souligné]]" (facultatif),
//            q:"question", o:["choix", ...], r:indexBonneRéponse, e:"justification", see:"idNotion"}
```

Dans le fichier `nature-fonction.js`, on peut aussi ajouter une notion de nature générique (« groupe nominal », « infinitif ») si l'annexe en a besoin. Dans ce cas, elle reçoit une fiche dans la branche concernée et une entrée de sommaire.

---

### Tâche 1 : lire le guide et en tirer le sommaire

**Fichiers :**
- Créer : `notes/guide.md`, `data/00-carte.js`, `data/sommaire.js`

**Interfaces :**
- Produit : `window.CARTE` avec ses cinq tableaux vides, `CARTE.sommaire` rempli. Produit aussi `notes/guide.md` : pour chaque entrée du sommaire, les définitions, les exemples du guide, les manipulations, les points du niveau II, les rapprochements avec le latin ou l'ancien français et la page. Les tâches 3 à 7 et 9-10 rédigent leur contenu à partir de ces notes et ne relisent le PDF que pour vérifier un point.

- [ ] **Étape 1 :** lire le PDF en entier, 20 pages à la fois au maximum (pages 11 à 213, avec les annexes p. 185-200).
- [ ] **Étape 2 :** écrire `notes/guide.md`, une section par entrée du sommaire, dans l'ordre du guide. Mettre à part une section « Annexe — tableaux 1 et 2 » qui transcrit les couples nature-fonction tels qu'ils apparaissent dans le guide.
- [ ] **Étape 3 :** écrire `data/00-carte.js` : `window.CARTE = {branches:[], nf:[], sommaire:[], confusions:[], quiz:[]};`.
- [ ] **Étape 4 :** écrire `data/sommaire.js` avec une entrée par ligne numérotée du sommaire (p. 6-10, niveaux I et II). Les `ids` sont ceux de la liste de notions de la spec, en kebab-case. Ils restent provisoires jusqu'à ce que les tâches 3 à 7 les confirment.
- [ ] **Étape 5 :** commit `Notes de lecture et sommaire du guide`.

### Tâche 2 : vérificateur et fonctions pures

**Fichiers :**
- Créer : `tests/charger.mjs`, `tests/verifier.test.mjs`, `tests/lib.test.mjs`, `lib.js`, `data/nature-fonction.js`, `README.md`

**Interfaces :**
- Consomme : `data/00-carte.js`, `data/sommaire.js`, `notes/guide.md` (section « Annexe »).
- Produit :
  - `charger(): Promise<{CARTE, LIB}>`, qui exécute dans un même contexte `vm` (`{window:{}}`) les fichiers `data/*.js` dans l'ordre alphabétique, puis `lib.js` ;
  - `lib.js` définit `window.LIB`, avec :
    - `norm(s: string): string` : minuscules, accents supprimés (NFD), apostrophes typographiques remplacées par `'` ;
    - `correspond(notion, requete: string): boolean` : compare `norm(requete)` à `norm(l + ' ' + d + ' ' + (s||''))` ; une requête vide correspond à tout ;
    - `naturesPour(nf, idFonction): string[]` et `fonctionsPour(nf, idNature): string[]`, dans l'ordre de `nf` ;
    - `melanger(tableau, alea = Math.random): Array`, qui renvoie une nouvelle copie mélangée (Fisher-Yates) sans modifier le tableau d'origine.

- [ ] **Étape 1 : écrire `tests/lib.test.mjs`** :
  - `norm("Épithète")` donne `"epithete"` ; `norm("COD")` donne `"cod"` ; `norm("l’adjectif")` donne `"l'adjectif"` ;
  - `correspond({l:"Épithète",d:""},"epithete")` donne `true` ; `correspond({l:"Sujet",d:"x"},"cod")` donne `false` ; une requête `""` donne `true` ;
  - `naturesPour([["gn","sujet"],["pronom","sujet"],["gn","cod"]],"sujet")` donne `["gn","pronom"]` ; `fonctionsPour(...,"gn")` donne `["sujet","cod"]` ;
  - `melanger([1,2,3,4,5], aleaFixe)` renvoie les mêmes éléments, laisse le tableau d'origine intact et, avec un `alea` séquentiel déterministe, donne un ordre différent de l'original.
- [ ] **Étape 2 : écrire `tests/verifier.test.mjs`**. Il contient un `test()` par règle :
  1. ids uniques dans toutes les branches ; format `/^[a-z0-9-]+$/` ;
  2. 7 branches, avec les ids `phrase, subordonnees, fonctions, lexique, nom, verbe, invariables` ; les quatre premières en `side:"L"`, les trois suivantes en `"R"` ;
  3. chaque notion a `l` et `d` non vides, `niv` égal à 1 ou 2, au moins un exemple dans `ex` et au moins une entrée dans `rep` ; `p` est un tableau non vide d'entiers compris entre 11 et 213 ;
  4. une notion `niv:2` n'a pas de champ `appro` ; une notion `niv:1` dont `p` contient une page ≥ 52 doit avoir un `appro` (point d'attention 5) ;
  5. chaque `[[...]]` d'un exemple est bien fermé ;
  6. le nombre total de notions est compris entre 70 et 95 *(ignoré tant que `CARTE.branches` est vide, avec `{skip}`)* ;
  7. chaque id cité dans `sommaire[].ids`, `nf`, `confusions[].ids` et `quiz[].see` existe ;
  8. chaque notion est citée par au moins une entrée de `sommaire` ;
  9. dans `nf`, l'élément `[1]` appartient à la branche `fonctions`, l'élément `[0]` n'y appartient pas, et il n'y a pas de couple en double ;
  10. aucun texte (`l, d, ex, rep, astuce, appro`, confusions, quiz) ne contient un terme interdit (voir les contraintes globales), sans tenir compte de la casse ;
  11. il y a entre 13 et 17 confusions, chacune avec au moins un id ;
  12. il y a entre 35 et 45 questions, les trois familles sont présentes, `r` est un index valide de `o`, toutes les valeurs de `o` sont distinctes et `e` n'est pas vide.

  Les règles 6 à 12 ne vérifient que les tableaux non vides : elles deviennent actives au fur et à mesure que les tâches avancent.
- [ ] **Étape 3 : lancer `node --test tests/`.** Résultat attendu : échec, parce que `lib.js` et `charger.mjs` n'existent pas encore.
- [ ] **Étape 4 :** écrire `tests/charger.mjs` et `lib.js` avec les signatures ci-dessus. Écrire `data/nature-fonction.js` à partir de la section « Annexe » des notes, avec les ids de la spec.
- [ ] **Étape 5 : lancer `node --test tests/`.** Résultat attendu : tout passe, à part les règles 7 et 9, qui échouent parce que les ids de `nf` et du sommaire n'existent pas encore. On les marque en `todo` jusqu'à la tâche 7, et on vérifie que la sortie l'indique bien.
- [ ] **Étape 6 :** écrire `README.md` en français, sur le modèle de `~/Claude Code/versification/README.md`, en ajoutant la commande `node --test tests/`. Commit `Vérificateur de contenu et fonctions de base`.

### Tâches 3 à 7 : rédaction des branches

Le déroulé est le même pour chacune ; seuls les fichiers et le contenu changent.

| Tâche | Fichier(s) | Branche(s) | Couleur |
|---|---|---|---|
| 3 | `data/b1-phrase.js`, `data/b2-subordonnees.js` | Phrase simple et complexe ; Les subordonnées | `--b1`, `--b2` |
| 4 | `data/b3-fonctions.js` | Les fonctions | `--b3` |
| 5 | `data/b5-nom.js` | Le nom et ses satellites | `--b5` |
| 6 | `data/b6-verbe.js`, `data/b7-invariables.js` | Le verbe ; Les mots invariables | `--b6`, `--b7` |
| 7 | `data/b4-lexique.js` | Le lexique | `--b4` (teinte distincte de celles de la syntaxe) |

Les notions de chaque branche sont exactement celles de la section « Structure de la carte » de la spec, dans le même ordre, avec `niv:2` pour celles marquées (II). Chaque fichier fait `CARTE.branches.push({...})`. L'ordre d'affichage est fixé dans `app.js` par la liste des ids de la règle 2, et non par l'ordre de chargement.

**Interfaces :** consomme les formes de données et `notes/guide.md` ; produit les ids que citent `nf`, le sommaire, les confusions et le quiz.

- [ ] **Étape 1 :** rédiger les notions à partir des notes. Champ `d` : la définition du niveau I. Champ `ex` : de préférence les exemples du guide. Champ `rep` : les manipulations du guide. Champ `appro` : le niveau II et les encadrés « Pour aller plus loin ». Champ `p` : les pages.
- [ ] **Étape 2 :** mettre à jour `data/sommaire.js` et `data/nature-fonction.js` si un id a changé.
- [ ] **Étape 3 : lancer `node --test tests/`.** Résultat attendu : les règles 1 à 5 et 10 passent pour la nouvelle branche. À la **tâche 7**, on retire les `todo` des règles 7 et 9, et tout doit passer, y compris les règles 6 et 8.
- [ ] **Étape 4 :** relire chaque notion à côté de la page du guide indiquée (les termes, et aucune contradiction). Corriger si besoin.
- [ ] **Étape 5 :** commit `Branche <nom>`.

### Tâche 8 : la page, la carte et la fiche

**Fichiers :**
- Créer : `index.html`, `style.css`, `app.js`
- Lire comme modèle : `~/Claude Code/versification/index.html`. On en reprend la carte rayonnante, les liens SVG, la fiche collante, les media queries 880 / 1180 px et les typographies. On ne copie pas sa palette : il en faut une nouvelle, à 7 teintes `--b1`…`--b7`, en clair comme en sombre.

**Interfaces :**
- Consomme : `CARTE.branches`, `CARTE.nf`, `LIB.correspond`, `LIB.naturesPour`, `LIB.fonctionsPour`.
- Produit (dans `app.js`) : `ouvrir(id: string, defiler?: boolean)`, qui sélectionne la feuille, affiche la fiche et, si `defiler` vaut vrai et que l'écran fait moins de 1180 px, fait défiler la page jusqu'à la fiche. Utilisé par les tâches 9 et 10. `index(id) → {notion, branche}`.

- [ ] **Étape 1 :** dans `index.html`, écrire le `<title>Carte de la grammaire</title>`, l'en-tête, la méthode en 5 étapes (texte de la spec, § Organisation 1), la recherche, `#map`, `#fiche`, puis des conteneurs vides `#fiches`, `#confusions` et `#quiz`, et enfin le pied de page : « D'après le guide Eduscol *La grammaire du français. Terminologie grammaticale* (MENJ). Exemples tirés du guide ou forgés. » Charger les scripts dans l'ordre `data/00-carte.js`, puis les autres `data/*.js`, puis `lib.js` et `app.js`.
- [ ] **Étape 2 :** dans `app.js`, rendre la carte. Au centre : « La phrase ». Les feuilles sont regroupées par `s`, et les feuilles `niv:2` portent un badge « II ». La fiche contient, dans cet ordre : Définition ; Exemples (`[[x]]` devient `<mark>`) ; Comment le reconnaître (`rep`, puis `astuce` dans un encadré marqué « Astuce ») ; Nature ↔ fonction (étiquettes « Fonctions possibles » ou « Natures possibles » qui appellent `ouvrir(id, true)`, et rien du tout si la liste est vide) ; `<details>` « Approfondir (niveau II) » ; « Guide Eduscol, p. 15 · p. 84 ». À l'ouverture, la page affiche la fiche de la notion `phrase-simple-complexe`, ou à défaut la première notion de la branche `phrase`.
- [ ] **Étape 3 :** brancher la recherche sur `LIB.correspond` : les notions trouvées sont mises en évidence et les autres estompées, et l'indication affiche « N notions trouvées » ou « Aucune notion ne correspond ». Quand la recherche est vide, l'indication affiche « N notions en 7 branches ».
- [ ] **Étape 4 :** contrôler dans le navigateur intégré (fichier local) :
  - pas d'erreur dans la console ;
  - « epithete » met en évidence « Épithète » ;
  - un clic sur une étiquette de la fiche COD ouvre la fiche de la nature correspondante ;
  - à 375 px (`resize_window` mobile), `document.documentElement.scrollWidth <= innerWidth` et la fiche défile à l'écran après un clic sur une étiquette ;
  - en mode sombre, le texte reste lisible.
- [ ] **Étape 5 :** commit `Carte et fiche`.

### Tâche 9 : toutes les fiches, le mode révision et les confusions

**Fichiers :**
- Créer : `data/confusions.js`
- Modifier : `app.js`, `style.css`

**Interfaces :** consomme `ouvrir`, `index` et `CARTE.confusions`.

- [ ] **Étape 1 :** écrire `data/confusions.js` avec les 15 confusions de la spec (§ Organisation 5). Chaque réponse s'appuie sur une manipulation ou un critère du guide.
- [ ] **Étape 2 : lancer `node --test tests/`.** Résultat attendu : la règle 11 passe.
- [ ] **Étape 3 :** dans `app.js`, rendre la section « Toutes les fiches » (cartes rangées par branche, avec la définition et le premier exemple, et un lien « Fiche complète » qui appelle `ouvrir(id, true)`). Ajouter le bouton « Mode révision », avec `aria-pressed` et la classe `revision` sur `body` : les définitions sont floutées, un clic ou la touche Entrée les révèle, et le compteur affiche « N / total révélées ». Quitter le mode révision remet tout à zéro. Rendre enfin les confusions : chaque id cité devient une étiquette qui appelle `ouvrir`.
- [ ] **Étape 4 :** contrôler dans le navigateur : le mode révision floute puis révèle, le compteur s'incrémente et l'on peut révéler une fiche au clavier ; une étiquette d'une confusion ouvre la bonne fiche ; à 375 px, il n'y a pas de débordement.
- [ ] **Étape 5 :** commit `Fiches, mode révision et confusions`.

### Tâche 10 : l'entraînement

**Fichiers :**
- Créer : `data/quiz.js`
- Modifier : `app.js`, `style.css`

**Interfaces :** consomme `ouvrir`, `LIB.melanger` et `CARTE.quiz`.

- [ ] **Étape 1 :** écrire `data/quiz.js` avec 40 questions : environ 20 *analyser*, 10 *croiser* (tirées de `CARTE.nf` et de l'annexe) et 10 *reconnaître*. Les phrases viennent du guide ou sont forgées, et chaque `e` justifie la réponse par le critère du guide.
- [ ] **Étape 2 : lancer `node --test tests/`.** Résultat attendu : toutes les règles passent, la 12 comprise.
- [ ] **Étape 3 :** dans `app.js`, programmer l'entraînement :
  - au départ, on mélange la série avec `LIB.melanger` ;
  - pour chaque question : la phrase (avec `[[ ]]` qui devient `<u>`), la question et les choix ;
  - après une réponse, les choix sont désactivés, la bonne réponse et la mauvaise sont marquées, et l'on affiche la justification avec les boutons « Question suivante » et « Ouvrir la fiche » ;
  - le compteur affiche « 7 / 40 · 5 justes » ;
  - après la dernière question, on affiche le score final avec un bouton « Recommencer », qui relance la série dans un nouvel ordre (point d'attention 3) ;
  - un filtre propose « Toutes / Analyser / Croiser / Reconnaître », et en changer relance la série.
- [ ] **Étape 4 :** contrôler dans le navigateur : on va jusqu'au bout d'une série filtrée, on vérifie le score final, puis « Recommencer » doit proposer un premier énoncé différent (au moins une fois sur trois essais) ; « Ouvrir la fiche » doit ouvrir la fiche `see`.
- [ ] **Étape 5 :** commit `Entraînement`.

### Tâche 11 : vérification finale et publication

**Fichiers :**
- Modifier : `README.md`

- [ ] **Étape 1 : lancer `node --test tests/`.** Résultat attendu : tout passe, sans aucun `todo`.
- [ ] **Étape 2 :** contrôler dans le navigateur à 375 px et sur grand écran, en clair et en sombre :
  - console vide ;
  - `scrollWidth <= innerWidth` ;
  - ouverture d'une fiche de chaque branche ;
  - le volet « Approfondir » s'ouvre.
- [ ] **Étape 3 :** publier l'artefact claude.ai : `index.html` comme page, avec `style.css`, `lib.js`, `app.js` et `data/*.js` dans `files`. Prendre l'icône `book`. Ouvrir la page publiée et vérifier qu'elle se charge sans erreur.
- [ ] **Étape 4 :** **demander l'accord de Laetitia**, puis créer le dépôt public `laetitiaperez/grammaire` (`gh repo create`), pousser `main` et activer GitHub Pages sur la racine de `main`. Ajouter l'URL du site au README et faire un commit `Publication`.
