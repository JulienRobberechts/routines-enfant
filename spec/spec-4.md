Corrections :

## Général
- Même sans les sons, l'application doit pouvoir fonctionner.
- Afficher l'heure actuelle en haut en tout petit.

## Étape courante
- Le nom de l'étape courante doit être affiché en petit et grisé en haut de l'icone.
- Le nom de l'étape courante doit être plus proche de l'emoji.
- Le nom de l'étape courante et l'emoji ne doivent pas être l'un sur l'autre.
- Au lieu de dire "c'est l'heure", lorsque l'on est en retard sur le planning, indiquer de combien de minutes on est en retard.

## Étape suivante
- Le nom de l'étape suivante doit être affiché en petit et grisé en haut de l'icone.
- Pour l'affichage de la prochaine étape, ajouter l'heure après le nom de l'étape.
- L'heure de l'étape suivante doit toujours être affichée même si le nom de l'étape est trop long.
- Pour gagner de l'espace en hauteur, le bloc next-emoji-block doit être divisé en 2 : un bloc à gauche avec le nom et l'heure de la prochaine étape, et un bloc à droite avec l'emoji.

## Barre de progression
- La progress bar de temps doit montrer le temps écoulé, pas le temps restant. (ne pas toucher au texte)

## Boutons de navigation
- Le bouton Précédent doit être positionné en bas de l'écran et caché. Au bout de 5 appuis, il doit devenir visible et opérationnel.
- Le bouton Suivant doit être remplacé par un gros bouton avec un emoji checked. Lorsqu'il est appuyé, il y a une transition avec un feu d'artifice puis un fondu pour passer à l'étape suivante.

## Mode debug
- Proposer un mode debug caché qui fait apparaître un slider pour positionner l'heure afin de tester l'application.
- Le panneau debug doit proposer 2 modes : matin ou soir. Le slider commence 10 min avant la routine et finit 10 min après la routine.
- Le mode debug doit aussi changer l'heure actuelle affichée en haut.
- Le bandeau de debug ne doit pas masquer les boutons précédent et suivant.
