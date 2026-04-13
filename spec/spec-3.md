# Application Al-Léa — Spec v3 (finale)

**Nom de l'application :** Al-Léa
**Date :** 2026-04-13
**Base :** spec-2.md + réponses intégrées

---

## 1. Résumé

Al-Léa est une page web statique (HTML5 + JavaScript vanilla) destinée à aider Léa (4 ans, ne sait pas lire) à suivre sa routine quotidienne du matin et du soir. L'application fonctionne **entièrement hors-ligne**, sans framework, sans backend, sans connexion internet.

---

## 2. Contraintes techniques

| Critère | Valeur |
|---|---|
| Technologies | HTML5 + JavaScript vanilla uniquement |
| Hébergement | Dossier local `src` |
| Internet requis | Non — 100% offline |
| Mobile cible | Samsung S24 (6.2", 2340×1080px, ~390×844 CSS px) |
| Orientation | Portrait **et** Paysage (les deux supportés) |
| Framework | Aucun |
| Déploiement | Aucun |

---

## 3. Logique de routines

### 3.1 Calendrier

- **Lundi → Vendredi** : routines actives
- **Samedi & Dimanche** : écran "Weekend" (aucune routine)
- Jours fériés et vacances scolaires : **non gérés** (traités comme jours normaux)

### 3.2 Plages horaires

| Plage | Type | Écran affiché |
|---|---|---|
| 19h45 → 6h50 | Nuit | Écran Nuit |
| 6h50 → 8h25 | Routine matin | Étape courante matin |
| 8h25 → 17h20 | Journée | Écran Journée |
| 17h20 → 19h45 | Routine soir | Étape courante soir |

### 3.3 Routine soir

| # | Heure début | Heure fin | Étape | Emoji | Son thématique |
|---|---|---|---|---|---|
| 1 | 17h20 | 17h30 | Partir à pied chercher Léa | 🚶 | Son de pas / cloche |
| 2 | 17h30 | 17h40 | Récupérer Léa au centre de loisirs | 🏫 | Son de récréation |
| 3 | 17h40 | 18h20 | Jeux | 🧸 | Son de jeux / grelot |
| 4 | 18h20 | 18h30 | Retour maison | 🏠 | Son de porte |
| 5 | 18h30 | 19h00 | Repas | 🍽️ | Son d'ustensiles / cloche |
| 6 | 19h00 | 19h20 | Bain ou douche | 🛁 | Son d'eau |
| 7 | 19h20 | 19h30 | Pyjama & Dents | 🪥 | Son de brosse à dents |
| 8 | 19h30 | 19h45 | Lecture d'une histoire | 📖 | Son de page tournée |
| 9 | 19h45 | — | Câlins & Dodo | 🌙 | Berceuse douce |

### 3.4 Routine matin

| # | Heure début | Heure fin | Étape | Emoji | Son thématique |
|---|---|---|---|---|---|
| 1 | 6h50 | 7h00 | Réveil Julien & Silvia | ⏰ | Son de réveil |
| 2 | 7h00 | 7h10 | Lever + Réveil Léa + Playlist | 🎵 | Mélodie joyeuse |
| 3 | 7h10 | 7h20 | Gant visage + Toilettes | 🚿 | Son d'eau / gouttes |
| 4 | 7h20 | 7h50 | Petit-déjeuner | 🥐 | Son de cuisine |
| 5 | 7h50 | 8h15 | Habillage + Dents + Jeux | 👕 | Son léger / ding |
| 6 | 8h15 | 8h25 | Chaussures & Manteau | 🧥 | Son de fermeture éclair |
| 7 | 8h25 | — | Départ | 🚪 | Son de porte qui se ferme |

*Note : toutes les étapes (y compris parentales) ont le même traitement visuel.*

---

## 4. Interface utilisateur

### 4.1 Pas de couleur par étape

L'application utilise un thème visuel **neutre et constant** :
- Fond blanc / très clair pendant les routines et la journée
- Fond sombre (gris foncé) pendant la nuit

Aucune couleur spécifique par étape.

### 4.2 Écran d'étape active (écran principal)

```
┌─────────────────────────────────┐
│                                 │
│                                 │
│          🛁  (grand)            │  ← Emoji étape courante (~55% hauteur écran)
│                                 │
│                                 │
│      ── 14 min restantes ──     │  ← Compte à rebours (minutes entières)
│      ████████░░░░░░  (barre)    │  ← Barre de progression de l'étape
│                                 │
│   Prochaine : 🪥  (petit)       │  ← Emoji étape suivante (plus petit)
│                                 │
│  ← Précédent      Suivant →    │  ← Boutons navigation bas d'écran
└─────────────────────────────────┘
```

**Règles d'affichage :**
- L'emoji de l'étape courante occupe la **majorité de l'écran** (environ 55% de la hauteur)
- Le compte à rebours affiche les minutes entières restantes jusqu'au début de la prochaine étape
- La barre de progression se vide de gauche à droite au fur et à mesure du temps
- L'étape suivante est affichée en petit en bas, avec son emoji
- À la **dernière étape** de la routine : "Prochaine" affiche l'écran hors-routine correspondant (🌙 ou ☀️)

### 4.3 Boutons de navigation

| Bouton | Action | Cas limite |
|---|---|---|
| **← Précédent** | Revient à l'étape précédente | À la 1ère étape : retour à l'écran hors-routine (Nuit ou Journée) |
| **→ Suivant** | Passe à l'étape suivante | À la dernière étape : retour à l'écran hors-routine |

La navigation manuelle **ne modifie pas l'horloge**. Elle décale uniquement l'index d'étape affiché.

À la réouverture de l'app, l'état repart **toujours de l'heure système** (pas de persistance de la navigation manuelle).

### 4.4 Écran Nuit

```
┌─────────────────────────────────┐
│                                 │
│                                 │
│          🌙  (grand)            │
│                                 │
│      Bonne nuit ! 😴            │
│                                 │
│    Réveil dans  6h 42           │  ← Temps avant début routine matin
│                                 │
└─────────────────────────────────┘
```
Fond : gris foncé. Aucun bouton de navigation (hors routine).

### 4.5 Écran Journée

```
┌─────────────────────────────────┐
│                                 │
│          ☀️  (grand)            │
│                                 │
│      Bonne journée ! 😊         │
│                                 │
│    Routine soir dans  3h 14     │  ← Temps avant 17h20
│                                 │
└─────────────────────────────────┘
```
Fond : blanc / gris clair. Aucun bouton de navigation (hors routine).

### 4.6 Écran Weekend

```
┌─────────────────────────────────┐
│                                 │
│          🎉  (grand)            │
│                                 │
│         Weekend !               │
│                                 │
└─────────────────────────────────┘
```
Fond : blanc / gris clair. Aucun bouton de navigation.

### 4.7 Orientation paysage

En mode paysage, la disposition bascule horizontalement :
```
┌───────────────────────────────────────────────────┐
│          │                                         │
│  🛁      │  ── 14 min ──  ████████░░               │
│ (grand)  │  Prochaine : 🪥                         │
│          │  ← Précédent          Suivant →         │
└───────────────────────────────────────────────────┘
```

---

## 5. Alertes sonores

### 5.1 Règle générale

Un son est joué automatiquement à **10, 5, 2 et 1 minute(s) avant le début de la prochaine étape** (= avant la fin de l'étape courante).

- Déclenchement uniquement si la page est **ouverte et active**
- Volume **fixe** (non réglable dans l'app)
- Son **thématique de l'étape suivante** (pas de l'étape courante)

### 5.2 Sons par étape

Les sons sont des fichiers audio courts (`.mp3` ou `.ogg`) stockés localement dans le dossier `src/sounds/` :

| Étape | Fichier son | Description |
|---|---|---|
| Partir à pied | `marche.mp3` | Son de pas sur un trottoir |
| Récupérer Léa | `recreation.mp3` | Son de cour de récréation |
| Jeux | `jeux.mp3` | Grelot / sons de jouets |
| Retour maison | `porte.mp3` | Son de porte qui s'ouvre |
| Repas | `repas.mp3` | Son d'ustensiles / cloche dîner |
| Bain / Douche | `eau.mp3` | Son d'eau qui coule |
| Pyjama & Dents | `dents.mp3` | Son de brosse à dents |
| Histoire | `livre.mp3` | Son de page qui tourne |
| Câlins & Dodo | `berceuse.mp3` | Mélodie berceuse courte |
| Réveil parents | `reveil.mp3` | Sonnerie de réveil douce |
| Lever + Playlist | `musique.mp3` | Mélodie joyeuse courte |
| Gant + Toilettes | `eau_matin.mp3` | Gouttes d'eau |
| Petit-déjeuner | `cuisine.mp3` | Son de cuisine / tasse |
| Habillage | `ding.mp3` | Son léger / ding |
| Chaussures & Manteau | `fermeture.mp3` | Son de fermeture éclair |
| Départ | `porte_ferme.mp3` | Son de porte qui se ferme |

*Ces fichiers devront être fournis ou générés. Des sons libres de droits (ex. Freesound.org) peuvent être utilisés.*

### 5.3 Urgence des alertes

| Délai avant l'étape suivante | Comportement |
|---|---|
| 10 minutes | Son joué 1 fois, volume normal |
| 5 minutes | Son joué 1 fois, volume normal |
| 2 minutes | Son joué 2 fois |
| 1 minute | Son joué 3 fois |

---

## 6. Fonctionnement technique

### 6.1 Détermination de l'état au chargement

```
1. Lire l'heure et le jour courant (JavaScript Date)
2. Si samedi ou dimanche → afficher écran Weekend, stop.
3. Si dans routine matin (6h50–8h25) → calculer étape courante matin
4. Si dans routine soir (17h20–19h45) → calculer étape courante soir
5. Si heure entre 19h45 et 6h50 → afficher écran Nuit
6. Si heure entre 8h25 et 17h20 → afficher écran Journée
```

### 6.2 Calcul de l'étape courante

L'étape courante est la dernière étape dont l'heure de début est ≤ heure actuelle.
La durée d'une étape = heure de début de l'étape suivante − heure de début de l'étape courante.
Le temps restant = heure de début de l'étape suivante − heure actuelle.

### 6.3 Mise à jour en temps réel

- Un `setInterval` toutes les **1 seconde** met à jour :
  - Le compte à rebours (minutes restantes)
  - La barre de progression
  - Le déclenchement des alertes sonores
- Aucun rechargement de page nécessaire

### 6.4 Gestion des alertes sonores

À chaque tick de l'intervalle, vérifier si le temps restant correspond à 10, 5, 2 ou 1 minute exacte (±1 seconde de tolérance). Si oui, jouer le son de l'étape suivante selon la règle d'urgence (§5.3).

Utiliser un flag booléen par seuil pour ne pas rejouer le son plusieurs fois au même seuil.

### 6.5 Navigation manuelle — index d'étape

```javascript
// État global
let manualOffset = 0; // décalage depuis l'étape calculée automatiquement

// Bouton Suivant
manualOffset += 1;

// Bouton Précédent
manualOffset -= 1;

// Réinitialisation au rechargement de la page (pas de localStorage)
```

L'index effectif = index calculé par l'heure + `manualOffset`, borné aux limites de la routine (ou aux écrans hors-routine si dépassement).

---

## 7. Structure des fichiers

```
src/
├── index.html          ← Page unique
├── style.css           ← Styles (responsive portrait + paysage)
├── app.js              ← Logique principale
├── routines.js         ← Données des routines (horaires, emojis, sons)
└── sounds/
    ├── marche.mp3
    ├── eau.mp3
    ├── berceuse.mp3
    └── ...             ← Un fichier par étape
```

---

## 8. Hors périmètre (définitif)

- Pas de backend, base de données, ni compte utilisateur
- Pas de connexion internet nécessaire
- Pas de déploiement en ligne
- Pas de gestion multi-enfant
- Pas de gestion des vacances scolaires
- Pas de gestion des jours fériés
- Pas de couleur spécifique par étape
- Pas de volume réglable
- Pas de persistance de la navigation manuelle entre sessions