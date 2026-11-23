# LexEcôle — Outil utile

Analyse de mots et de phrases **latines** et **allemandes** pour l'école, et vérification de la traduction en français.

https://kimserge.github.io/lexecole/

1. Écris un mot (sans point) ou une phrase (avec un point).
2. Analyse : nature, déclinaison / conjugaison, cas, nombre, temps, personne, traduction.
3. Vérifie ta traduction.
4. Correction : la traduction de l'élève est comparée à une traduction automatique (brouillon).

Pour un mot seul : tableau des terminaisons et article du dictionnaire de [LexEikôn](https://kimserge.github.io/lexeikon/) correspondant à la langue de l'interface.

## Données

- Latin : [Collatinus](https://github.com/biblissima/collatinus) (Yves Ouvrard, Philippe Verkerk), GPL — modèles de flexion, lemmes, traductions.
- Allemand : [LanguageTool german-pos-dict](https://github.com/languagetool-org/german-pos-dict), CC BY-SA 4.0 — formes fléchies (`data/de.json`, sous la même licence).
- Glossaire allemand–français LexEcôle (`build/de_fr_*.tsv`).
- Dictionnaires latins de LexEikôn (chargés depuis `/lexeikon/data/`) : Lebaigue–Quicherat, FreeDict Latein–Deutsch, Whitaker, Тананушко.

`build/build_la.py` et `build/build_de.py` régénèrent `data/la.json` et `data/de.json`.

## Licence

Code : GPL-3.0 (voir `LICENSE`). `data/de.json` : CC BY-SA 4.0.

Sergey Kim
