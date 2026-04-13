# Application Routine Léa — Spec v2

**Nom de l'application :** Al-Léa
**Date :** 2026-04-13
**Base :** spec-1.md + routine.txt

---

## Synthèse des corrections apportées à spec-1

### 1. Deux routines distinctes (absent de spec-1)
`routine.txt` définit deux routines séparées :
- **Routine matin** : 6h50 → 8h25
- **Routine soir** : 17h20 → 19h45

Il faut gérer les deux routine , ainsi que les plages horaires **hors routine** (journée et nuit).

### 2. Plages horaires hors routine
| Plage | Label | Affichage |
|---|---|---|
| 19h45 → 6h50 | Nuit | Icône dodo, fond sombre grisé |
| 8h25 → 17h20 | Journée | Icône activité/journée, fond grisé |

### 3. Alertes sonores
signal sonore à 10, 5, 2, 1 minutes avant la **fin de l'étape courante**

### 4. Bouton "étape précédente" — cas limite non traité
spec-1 mentionne le bouton mais ne précise pas le comportement à la **première étape** de la routine. À définir (voir questions). Pour la premiere étape, il faut quand même afficher le bouton pour revenir à l'étape précedente (Nuit ou jour)

### 5. Étapes parentales vs étapes de Léa (non distinguées dans spec-1)
Certaines étapes s'adressent aux parents, pas à Léa :
- 17h20 « Partir de la maison chercher Léa »
- 6h50 « Le réveil de Julien et Silvia sonne »

Ces étapes doivent quand même apparaître (pour les parents qui utilisent l'app) mais peuvent avoir un traitement visuel distinct.

---

## Objectifs (inchangés, reformulés)

Permettre à Léa (4 ans, ne sait pas lire) de comprendre :
- Dans quelle étape de la routine elle se trouve
- Quelle est l'étape suivante
- Combien de temps reste-t-il avant l'étape suivante

Tout doit être représenté par des **couleurs** et des **icônes** (pas de texte pour Léa).

---

## Contraintes techniques (inchangées)

- Page web statique HTML + JavaScript vanilla (HTML5)
- Hébergée dans le dossier `src`
- Pas de framework, pas de déploiement
- **Mobile uniquement** (portrait)
- Pas de weekend (samedi et dimanche : pas de routine)

---

## Données des routines

### Routine soir

| Heure | Étape | Icône suggérée |
|---|---|---|
| 17h20 | Partir de la maison chercher Léa | A pied |
| 17h30 | Récupérer Léa au centre de loisirs | 🏫 école |
| 17h40 | Retour & Jeux libres (intérieur ou extérieur) |  jeux |
| 18h20 | Retour maison | 🏠 maison |
| 18h30 | Repas | 🍽️ repas |
| 19h00 | Bain ou douche | 🛁 bain |
| 19h20 | Pyjama & Dents | 🪥 dents |
| 19h30 | Lecture d'une histoire | 📖 livre |
| 19h45 | Câlins & Dodo (ferme la porte) | 🌙 dodo |

Corrections : 
Partir de la maison chercher Léa => A PIED
Retour & Jeux libres (intérieur ou extérieur) => Jeux

### Routine matin

| Heure | Étape | Icône suggérée |
|---|---|---|
| 6h50 | Réveil de Julien et Silvia | ⏰ réveil |
| 7h00 | Lever de Silvia & Julien + Réveil de Léa + Playlist 3 morceaux | 🎵 musique |
| 7h10 | Gant sur le visage + Toilettes | 🚿 toilette |
| 7h20 | Petit-déjeuner | 🥐 petit-dej |
| 7h50 | Habillage + Brossage de dents + Jeux | 👕 habillage |
| 8h15 | Chaussures & Manteau | 🧥 manteau |
| 8h25 | Départ (la porte se ferme) | 🚪 départ |

*Note : les icônes ci-dessus sont des suggestions à valider — voir questions.*

---

## Fonctionnement détaillé

### Détection automatique de l'étape

Au chargement, l'application lit l'heure système et détermine :
1. Si on est en semaine ou weekend → si weekend, affichage "Weekend"
2. Si on est dans une routine active → étape courante + étape suivante
3. Si on est hors routine → affichage nuit ou journée

### Navigation manuelle

- **Bouton Suivant** : marque l'étape courante comme terminée, passe à la suivante
- **Bouton Précédent** : revient à l'étape précédente
- La navigation manuelle **ne modifie pas l'horloge**, elle décale uniquement l'index d'étape affiché
- À la première étape : le bouton Précédent est **désactivé** (grisé) => NON il est activé
- À la dernière étape : le bouton Suivant affiche l'écran de fin de routine

### Affichage principal

- Grande icône de l'étape courante (couleur vive)
- Icône plus petite de l'étape suivante (couleur atténuée)
- Barre de progression ou compte à rebours visuel jusqu'à la prochaine étape
- Fond de couleur associé à l'étape courante

### Alertes sonores

Son discret joué automatiquement à **10, 5, 2 et 1 minute(s) avant** la fin de l'étape courante.
- Déclenché uniquement si la page est ouverte et active
- Sons différenciés selon l'urgence (suggestion : plus doux à 10 min, plus insistant à 1 min)

### Écrans spéciaux

| Contexte | Affichage |
|---|---|
| Nuit (19h45 → 6h50) | Icône dodo, fond gris sombre |
| Journée (8h25 → 17h20) | Icône soleil, fond gris clair |
| Weekend | Message/icône "pas de routine aujourd'hui" |

---

## Questions ouvertes

### Icônes & visuels
1. **Icônes** : utiliser des émojis natifs, des images dessinées personnalisées, ou une bibliothèque d'icônes (ex. SVG) ? Les images personnalisées seraient plus adaptées pour un enfant de 4 ans.
=> émojis natifs
2. **Couleurs** : y a-t-il une couleur spécifique souhaitée par étape, ou faut-il en proposer une palette ? => PAS DE COULEUR, j'ai changé d'avis
3. **Taille de l'icône** : occupe-t-elle la majorité de l'écran pour faciliter la compréhension ? OUI

### Sons
4. **Type de signal sonore** : un bip neutre, une mélodie douce, ou un son thématique par étape (ex. son d'eau pour le bain) ? un son thématique par étape.
5. **Volume** : contrôlable dans l'app ou fixe ? fixe
6. **Son de fin d'étape vs son de début** : le son est-il déclenché avant la fin ou au début de la prochaine étape ? (spec-1 dit "avant la fin" — confirmé ?) le son est-il déclenché 10, 5,2,1 minutes avant le début de la prochaine étape.

### Navigation & état
7. **Persistance de l'état** : si on ferme et rouvre l'app après une navigation manuelle, reprend-elle depuis l'heure système ou depuis l'étape où on était ? l'heure systeme.
8. **Bouton Précédent à la 1ère étape** : bouton grisé/invisible, ou retour à l'écran "hors routine" ? retour à l'écran "hors routine"
9. **Bouton Suivant à la dernière étape** : écran de fin ("Bonne nuit !"), ou retour à l'écran "hors routine" ?
retour à l'écran "hors routine"

### Routines & planning
10. **Vacances scolaires** : la routine s'applique-t-elle aussi pendant les vacances, ou faut-il pouvoir la désactiver ? pas pris en compte pour l'instant.
11. **Étapes parentales** (17h20, 6h50) : affichage identique aux étapes de Léa, ou visuellement distinct pour indiquer que c'est une action des parents ? identique.
12. **Jours fériés** : traités comme le weekend (pas de routine) ou comme un jour normal ?
pas pris en compte pour l'instant.

### Technique
13. **Mobile cible** : quel modèle/taille d'écran de référence pour le design ? Samsung S24
14. **Orientation** : portrait uniquement, ou paysage aussi ? les 2
15. **Accès offline** : l'app doit-elle fonctionner sans connexion internet (service worker / PWA) ? OUI, il n'y a aucun besoin d'internet pour cette application.

---

## Hors périmètre (confirmé)

- Pas de backend ni de base de données
- Pas de compte utilisateur
- Pas de déploiement en ligne
- Pas de gestion multi-enfant
- Pas de connection internet utile
- Pas de gestion des vacances scolaires ou jours feriés

