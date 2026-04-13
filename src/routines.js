// Al-Léa — routines.js
// Données des routines (horaires, emojis, sons)

const ROUTINES = {
  matin: [
    { start: [6, 50], label: 'Réveil Parents',                emoji: '⏰', sound: 'reveil.mp3'      },
    { start: [7,  0], label: 'Réveil Léa',                    emoji: '🎵', sound: 'musique.mp3'     },
    { start: [7, 10], label: 'Toilettes',                     emoji: '🚿', sound: 'eau_matin.mp3'   },
    { start: [7, 20], label: 'Petit-déjeuner',                emoji: '🥐', sound: 'cuisine.mp3'     },
    { start: [7, 50], label: 'S\'habiller + Dents',           emoji: '👕', sound: 'ding.mp3'        },
    { start: [8, 15], label: 'Chaussures & Manteau',          emoji: '🧥', sound: 'fermeture.mp3'   },
    { start: [8, 25], label: 'Départ',                        emoji: '🚪', sound: 'porte_ferme.mp3' },
  ],
  soir: [
    { start: [17, 20], label: 'Chercher Léa',                 emoji: '🚶', sound: 'marche.mp3'      },
    { start: [17, 30], label: 'Récupérer Léa',                emoji: '🏫', sound: 'recreation.mp3'  },
    { start: [17, 40], label: 'Jeux',                         emoji: '🧸', sound: 'jeux.mp3'        },
    { start: [18, 20], label: 'Retour maison',                emoji: '🏠', sound: 'porte.mp3'       },
    { start: [18, 30], label: 'Repas',                        emoji: '🍽️', sound: 'repas.mp3'       },
    { start: [19,  0], label: 'Bain ou douche',               emoji: '🛁', sound: 'eau.mp3'         },
    { start: [19, 20], label: 'Pyjama & Dents',               emoji: '🪥', sound: 'dents.mp3'       },
    { start: [19, 30], label: "Une histoire",                 emoji: '📖', sound: 'livre.mp3'       },
    { start: [19, 45], label: 'Câlins & Dodo',                emoji: '🌙', sound: 'berceuse.mp3'    },
  ],
};

// Limites des routines en secondes depuis minuit
const BOUNDS = {
  matin: { start: 6 * 3600 + 50 * 60, end: 8 * 3600 + 25 * 60   },
  soir:  { start: 17 * 3600 + 20 * 60, end: 19 * 3600 + 45 * 60 },
};
