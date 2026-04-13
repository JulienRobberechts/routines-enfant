# Al-Léa

Application mobile pour aider Léa (4 ans) à suivre sa routine du matin et du soir.
Beaucoup d'icônes et couleurs — peu de texte à lire.

## Fonctionnement

L'app détecte l'heure et affiche automatiquement l'étape en cours, l'étape suivante et le temps restant.

- **Routine matin** : 6h50 → 8h25
- **Routine soir** : 17h20 → 19h45
- **Hors routine** : écran nuit ou journée
- **Weekend** : pas de routine

Des alertes sonores thématiques se déclenchent 10, 5, 2 et 1 minute(s) avant la fin de chaque étape.

## Navigation

| Bouton | Action |
|--------|--------|
| ▶ Suivant | Passer à l'étape suivante |
| ◀ Précédent | Revenir à l'étape précédente |

La navigation manuelle ne modifie pas l'horloge. À la fermeture/réouverture, l'app repart de l'heure système.

## Lancement

Ouvrir `src/index.html` dans un navigateur mobile (ou Chrome DevTools en mode mobile).

Fonctionne entièrement hors ligne — aucune connexion internet requise.

## Structure

```
src/
  index.html     point d'entrée
  app.js         logique principale
  routines.js    données des routines (horaires, emojis, sons)
  style.css      mise en page mobile
  sounds/        fichiers audio par étape
spec/            spécifications fonctionnelles
design/          maquettes et captures
```
