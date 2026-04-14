// Al-Léa — app.js
// Logique principale

// ─── État global ──────────────────────────────────
let manualOffset    = 0;   // décalage depuis l'étape calculée automatiquement
let soundFlags      = {};  // { 600: false, 300: false, 120: false, 60: false }
let lastStepKey     = '';  // détecte le changement d'étape pour réinitialiser les flags
let prevBtnTapCount = 0;   // nombre de taps sur le bouton Précédent caché
let prevBtnUnlocked = false; // true quand le bouton Précédent est déverrouillé

// ─── Paramètres ───────────────────────────────────
let settingsOpen = false;
let isLoisir     = false;

// ─── Mode debug ───────────────────────────────────
let debugMode    = false;
let debugTimeSec = 8 * 3600;
let debugRoutine = 'matin';  // 'matin' | 'soir'
let _tapCount    = 0;
let _tapTimer    = null;

// ─── Constantes ───────────────────────────────────
const LOISIR_OFFSET = 50 * 60; // 50 minutes en secondes
const VERSION = '1.2.0';

// ─── Routines effectives (avec décalage loisirs) ──

function getEffectiveBounds() {
  if (!isLoisir) return BOUNDS;
  return {
    matin: { start: BOUNDS.matin.start + LOISIR_OFFSET, end: BOUNDS.matin.end + LOISIR_OFFSET },
    soir:  { start: BOUNDS.soir.start  + LOISIR_OFFSET, end: BOUNDS.soir.end  + LOISIR_OFFSET },
  };
}

function getEffectiveRoutines() {
  if (!isLoisir) return ROUTINES;
  function shiftStep(s) {
    const sec = s.start[0] * 3600 + s.start[1] * 60 + LOISIR_OFFSET;
    return { ...s, start: [Math.floor(sec / 3600), Math.floor((sec % 3600) / 60)] };
  }
  return {
    matin: ROUTINES.matin.map(shiftStep),
    soir:  ROUTINES.soir.map(shiftStep),
  };
}

// ─── Utilitaires temps ───────────────────────────

function nowSec() {
  if (debugMode) return debugTimeSec;
  const d = new Date();
  return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
}

function realNowSec() {
  const d = new Date();
  return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
}

function fmtClock(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}

function handleClockTap() {
  _tapCount++;
  clearTimeout(_tapTimer);
  if (_tapCount >= 5) {
    _tapCount = 0;
    toggleSettings();
  } else {
    _tapTimer = setTimeout(() => { _tapCount = 0; }, 2000);
  }
}

function toggleSettings() {
  settingsOpen = !settingsOpen;
  render();
}

function toggleDebug() {
  debugMode = !debugMode;
  if (debugMode) {
    // Choisir la routine la plus proche de l'heure actuelle
    const sec    = realNowSec();
    const bounds = getEffectiveBounds();
    const distMatin = Math.abs(sec - bounds.matin.start);
    const distSoir  = Math.abs(sec - bounds.soir.start);
    debugRoutine = distMatin <= distSoir ? 'matin' : 'soir';
    debugTimeSec = bounds[debugRoutine].start;
    manualOffset = 0;
  }
  render();
}

function setDebugRoutine(name) {
  debugRoutine = name;
  debugTimeSec = getEffectiveBounds()[name].start;
  manualOffset = 0;
  render();
}

function onDebugStep(delta) {
  debugTimeSec += delta * 60;
  manualOffset = 0;
  render();
}

function setLoisir(val) {
  isLoisir = val;
  if (debugMode) {
    debugTimeSec = getEffectiveBounds()[debugRoutine].start;
    manualOffset = 0;
  }
  render();
}

function toSec(hm) {
  return hm[0] * 3600 + hm[1] * 60;
}

function fmtMinutes(sec) {
  const m = Math.ceil(sec / 60);
  if (m > 0) return m + (m === 1 ? ' min restante' : ' min restantes');
  if (m === 0) return "C'est l'heure !";
  const late = -m;
  return late + ' min de retard';
}

function fmtHM(sec) {
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return h + 'h ' + String(m).padStart(2, '0');
  return m + ' min';
}

// ─── Sons ─────────────────────────────────────────

function playSound(filename, times) {
  if (!filename) return;
  let count = 0;
  function next() {
    if (count >= times) return;
    count++;
    const a = new Audio('sounds/' + filename);
    a.play().catch(() => {}); // silencieux si le fichier est absent
    a.onended = () => setTimeout(next, 350);
  }
  next();
}

function checkSounds(state) {
  if (state.screen !== 'routine' || !state.nextStep) return;

  const key = state.routineName + '-' + state.effIdx;
  if (key !== lastStepKey) {
    lastStepKey = key;
    soundFlags  = { 600: false, 300: false, 120: false, 60: false };
  }

  const rem = Math.round(state.remaining);
  const seuils = [
    { at: 600, plays: 1 },
    { at: 300, plays: 1 },
    { at: 120, plays: 2 },
    { at:  60, plays: 3 },
  ];

  for (const s of seuils) {
    if (!soundFlags[s.at] && Math.abs(rem - s.at) <= 1) {
      soundFlags[s.at] = true;
      if (state.nextStep.sound) playSound(state.nextStep.sound, s.plays);
      break;
    }
  }
}

// ─── Calcul de l'état ─────────────────────────────

function getState() {
  const d   = new Date();
  const day = d.getDay();   // 0 = dimanche, 6 = samedi
  const sec = nowSec();

  // Weekend (ignoré en mode debug)
  if (!debugMode && (day === 0 || day === 6)) {
    return { screen: 'weekend' };
  }

  const { matin, soir } = getEffectiveBounds();

  // Routine matin
  if (sec >= matin.start && sec < matin.end) {
    return buildRoutineState('matin', sec);
  }

  // Routine soir
  if (sec >= soir.start && sec < soir.end) {
    return buildRoutineState('soir', sec);
  }

  // Nuit [fin soir → début matin, passe minuit]
  if (sec >= soir.end || sec < matin.start) {
    const until = sec >= soir.end
      ? (24 * 3600 - sec) + matin.start
      : matin.start - sec;
    return { screen: 'nuit', until };
  }

  // Journée [fin matin → début soir]
  return { screen: 'journee', until: soir.start - sec };
}

function buildRoutineState(routineName, sec) {
  const steps  = getEffectiveRoutines()[routineName];
  const bounds = getEffectiveBounds()[routineName];

  // Étape auto : dernière étape dont l'heure de début ≤ sec
  let autoIdx = 0;
  for (let i = 0; i < steps.length; i++) {
    if (sec >= toSec(steps[i].start)) autoIdx = i;
    else break;
  }

  // Index effectif avec décalage manuel, borné à [-1, steps.length]
  const effIdx = Math.max(-1, Math.min(steps.length, autoIdx + manualOffset));

  // Écran hors-routine avant la première étape (navigation manuelle)
  if (effIdx < 0) {
    return {
      screen: 'offscreen',
      offScreen: routineName === 'matin' ? 'nuit' : 'journee',
      routineName,
      autoIdx,
      dir: 'avant',
    };
  }

  // Écran hors-routine après la dernière étape (navigation manuelle)
  if (effIdx >= steps.length) {
    return {
      screen: 'offscreen',
      offScreen: routineName === 'matin' ? 'journee' : 'nuit',
      routineName,
      autoIdx,
      dir: 'apres',
    };
  }

  // Étape normale
  const step   = steps[effIdx];
  const isLast = effIdx === steps.length - 1;
  const next   = isLast ? null : steps[effIdx + 1];

  const stepStart = toSec(step.start);
  const stepEnd   = isLast ? bounds.end : toSec(next.start);
  const duration  = stepEnd - stepStart;
  const remaining = stepEnd - sec;
  const progress  = duration > 0
    ? Math.max(0, Math.min(1, (sec - stepStart) / duration))
    : 1;

  // Emoji "Prochaine" : étape suivante ou écran hors-routine
  const nextEmoji = next
    ? next.emoji
    : (routineName === 'matin' ? '☀️' : '🌙');

  return {
    screen: 'routine',
    routineName,
    effIdx,
    autoIdx,
    step,
    nextStep: next,
    nextEmoji,
    isLast,
    remaining,
    progress,
  };
}

// ─── Bouton Précédent (déverrouillage secret) ─────

function handlePrevTap() {
  if (prevBtnUnlocked) {
    navigate(-1);
    return;
  }
  prevBtnTapCount++;
  if (prevBtnTapCount >= 5) {
    prevBtnUnlocked = true;
    render();
  }
}

// ─── Bouton Suivant (feu d'artifice + fondu) ──────

function showFireworks(cx, cy, callback) {
  const overlay = document.createElement('div');
  overlay.className = 'fw-overlay';
  overlay.style.left = cx + 'px';
  overlay.style.top  = cy + 'px';

  const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff9f43', '#c77dff'];
  const count  = 18;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'fw-particle';
    p.style.setProperty('--angle', ((360 / count) * i) + 'deg');
    p.style.setProperty('--dist',  (55 + Math.random() * 45) + 'px');
    p.style.setProperty('--color', colors[i % colors.length]);
    p.style.setProperty('--delay', Math.round(Math.random() * 80) + 'ms');
    overlay.appendChild(p);
  }
  document.body.appendChild(overlay);
  setTimeout(() => { overlay.remove(); callback(); }, 780);
}

function fadeTransition(callback) {
  const app = document.getElementById('app');
  app.style.transition = 'opacity 0.25s ease';
  app.style.opacity    = '0';
  setTimeout(() => {
    callback();
    requestAnimationFrame(() => {
      app.style.opacity = '1';
      setTimeout(() => { app.style.transition = ''; }, 280);
    });
  }, 260);
}

function handleNextTap() {
  const btn  = document.getElementById('btn-next');
  const rect = btn ? btn.getBoundingClientRect() : null;
  const cx   = rect ? rect.left + rect.width  / 2 : window.innerWidth  / 2;
  const cy   = rect ? rect.top  + rect.height / 2 : window.innerHeight / 2;
  showFireworks(cx, cy, () => fadeTransition(() => navigate(1)));
}

// ─── Navigation ───────────────────────────────────

function navigate(dir) {
  const sec = nowSec();
  const day = new Date().getDay();

  if (!debugMode && (day === 0 || day === 6)) return;

  const bounds   = getEffectiveBounds();
  const routines = getEffectiveRoutines();
  let routineName = null;

  if      (sec >= bounds.matin.start && sec < bounds.matin.end) routineName = 'matin';
  else if (sec >= bounds.soir.start  && sec < bounds.soir.end)  routineName = 'soir';

  if (!routineName) return;

  const steps = routines[routineName];
  let autoIdx = 0;
  for (let i = 0; i < steps.length; i++) {
    if (sec >= toSec(steps[i].start)) autoIdx = i;
    else break;
  }

  const current = Math.max(-1, Math.min(steps.length, autoIdx + manualOffset));
  const next    = Math.max(-1, Math.min(steps.length, current + dir));
  manualOffset  = next - autoIdx;

  render();
}

// ─── Rendus ───────────────────────────────────────

function renderWeekend() {
  return `
    <div class="screen-off">
      <span class="emoji-main">🎉</span>
      <div class="msg-primary">Weekend !</div>
    </div>`;
}

function renderNuit(state) {
  return `
    <div class="screen-off">
      <span class="emoji-main">🌙</span>
      <div class="msg-primary">Bonne nuit ! 😴</div>
      <div class="msg-secondary">Réveil dans ${fmtHM(state.until)}</div>
    </div>`;
}

function renderJournee(state) {
  return `
    <div class="screen-off">
      <span class="emoji-main">☀️</span>
      <div class="msg-primary">Bonne journée ! 😊</div>
      <div class="msg-secondary">Routine soir dans ${fmtHM(state.until)}</div>
    </div>`;
}

function renderRoutine(state) {
  const fillPct       = Math.round(state.progress * 100);
  const nextStepLabel = state.nextStep ? state.nextStep.label : '';

  return `
    <div class="screen">
      <div class="emoji-zone">
        <span class="emoji-main">${state.step.emoji}</span>
      </div>
      <div class="step-name">${state.step.label}</div>
      <div class="info-zone">
        <div class="countdown">${fmtMinutes(state.remaining)}</div>
        <div class="progress-track">
          <div class="progress-fill" style="width:${fillPct}%"></div>
        </div>
        <div class="next-label-text">Prochaine&nbsp;étape :</div>
        <div class="next-label">
          <div class="next-info-block">
            ${state.nextStep ? `<span class="next-step-name">${nextStepLabel}</span><span class="next-step-time">${fmtClock(toSec(state.nextStep.start))}</span>` : ''}
          </div>
          <span class="emoji-next">${state.nextEmoji}</span>
        </div>
        <div class="nav-zone nav-zone-check">
          <button class="btn-next-check" id="btn-next">😀</button>
        </div>
      </div>
      <button id="btn-prev" class="btn-prev-fixed${prevBtnUnlocked ? ' btn-prev-unlocked' : ''}">←</button>
    </div>`;
}

function renderOffscreen(state) {
  const isNuit = state.offScreen === 'nuit';
  const emoji  = isNuit ? '🌙' : '☀️';
  const msg    = isNuit ? 'Bonne nuit ! 😴' : 'Bonne journée ! 😊';

  const nav = state.dir === 'avant'
    ? `<span></span><button class="nav-btn" id="btn-next">Suivant →</button>`
    : `<button class="nav-btn" id="btn-prev">← Précédent</button><span></span>`;

  return `
    <div class="screen-off screen-off-nav">
      <div class="off-content">
        <span class="emoji-main">${emoji}</span>
        <div class="msg-primary">${msg}</div>
      </div>
      <div class="nav-zone">${nav}</div>
    </div>`;
}

// ─── Rendu principal ──────────────────────────────

function render() {
  const state = getState();
  const app   = document.getElementById('app');

  checkSounds(state);

  let html  = '';
  let theme = 'theme-jour';

  switch (state.screen) {
    case 'weekend':
      html = renderWeekend();
      break;
    case 'nuit':
      theme = 'theme-nuit';
      html  = renderNuit(state);
      break;
    case 'journee':
      html = renderJournee(state);
      break;
    case 'routine':
      html = renderRoutine(state);
      break;
    case 'offscreen':
      if (state.offScreen === 'nuit') theme = 'theme-nuit';
      html = renderOffscreen(state);
      break;
  }

  app.className = theme + (settingsOpen ? ' debug-active' : '');
  app.innerHTML = html;

  // Attacher les listeners de navigation
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  if (btnPrev) btnPrev.addEventListener('click', () => handlePrevTap());
  if (btnNext) {
    const isCheckBtn = btnNext.classList.contains('btn-next-check');
    btnNext.addEventListener('click', () => isCheckBtn ? handleNextTap() : navigate(1));
  }

  // ─── Horloge (toujours visible en haut) ───────────
  const clockEl = document.getElementById('clock-overlay');
  clockEl.textContent = fmtClock(nowSec()) + (debugMode ? ' 🐛' : '');
  clockEl.className = 'clock-overlay' + (theme === 'theme-nuit' ? ' clock-nuit' : '');

  // ─── Panneau paramètres ────────────────────────────
  const panelEl = document.getElementById('debug-panel');
  if (settingsOpen) {
    panelEl.style.display = 'flex';
    panelEl.innerHTML = renderSettingsPanel(theme);
  } else {
    panelEl.style.display = 'none';
  }
}

function renderSettingsPanel(theme) {
  const isNuit = theme === 'theme-nuit';

  const debugSection = debugMode ? `
    <div class="settings-debug-controls">
      <div class="debug-modes">
        <button class="debug-mode-btn${debugRoutine === 'matin' ? ' active' : ''}" onclick="setDebugRoutine('matin')">Matin</button>
        <button class="debug-mode-btn${debugRoutine === 'soir'  ? ' active' : ''}" onclick="setDebugRoutine('soir')">Soir</button>
      </div>
      <div class="debug-row2">
        <button class="debug-step-btn" onclick="onDebugStep(-7)">−</button>
        <span class="debug-label">⏱ ${fmtClock(debugTimeSec)}</span>
        <button class="debug-step-btn" onclick="onDebugStep(7)">+</button>
      </div>
    </div>` : '';

  return `
    <div class="settings-header">
      <span class="settings-title">⚙️ Paramètres</span>
      <button class="debug-close" onclick="toggleSettings()">✕</button>
    </div>

    <div class="settings-body">
      <div class="settings-row">
        <span class="settings-row-label">🐛 Mode debug</span>
        <button class="settings-toggle${debugMode ? ' active' : ''}" onclick="toggleDebug()">${debugMode ? 'ON' : 'OFF'}</button>
      </div>
      ${debugSection}

      <div class="settings-divider"></div>

      <div class="settings-row">
        <span class="settings-row-label">📅 Journée type</span>
        <div class="settings-choice">
          <button class="settings-choice-btn${!isLoisir ? ' active' : ''}" onclick="setLoisir(false)">🏫 École</button>
          <button class="settings-choice-btn${isLoisir ? ' active' : ''}" onclick="setLoisir(true)">🎨 Loisirs</button>
        </div>
      </div>
      ${isLoisir ? `<div class="settings-info-row">⏱ Routine décalée de 50 min</div>` : ''}

      <div class="settings-divider"></div>

      <div class="settings-actions">
        <button class="settings-action-btn" onclick="printRoutine()">🖨️ Imprimer la routine</button>
        <button class="settings-action-btn" onclick="configRoutine()">📋 Configurer la routine</button>
      </div>

      <div class="settings-version">v${VERSION}</div>
    </div>
  `;
}

// ─── Impression de la routine ─────────────────────

function printRoutine() {
  const steps = getEffectiveRoutines()[debugRoutine];
  const title = debugRoutine === 'matin' ? '🌅 Routine du matin' : '🌆 Routine du soir';
  const suffix = isLoisir ? ' (Centre de loisirs)' : '';

  const rows = steps.map(s => `
    <tr>
      <td class="col-time">${fmtClock(toSec(s.start))}</td>
      <td class="col-icon">${s.emoji}</td>
      <td class="col-name">${s.label}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${title}${suffix}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 30px; background: #fff; }
    h1 { text-align: center; font-size: 2em; margin-bottom: 30px; }
    table { width: 100%; border-collapse: collapse; font-size: 1.4em; }
    tr { border-bottom: 2px solid #ddd; }
    td { padding: 14px 10px; vertical-align: middle; }
    .col-time { font-weight: bold; color: #555; width: 90px; }
    .col-icon { font-size: 1.8em; width: 60px; text-align: center; }
    .col-name { font-size: 1.1em; }
    .print-btn {
      display: block; margin: 30px auto 0; padding: 12px 40px;
      font-size: 1.2em; cursor: pointer; background: #4d96ff;
      color: #fff; border: none; border-radius: 8px;
    }
    @media print { .print-btn { display: none; } }
  </style>
</head>
<body>
  <h1>${title}${suffix}</h1>
  <table>${rows}</table>
  <button class="print-btn" onclick="window.print()">🖨️ Imprimer</button>
</body>
</html>`;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
}

// ─── Configuration de la routine ─────────────────

function configRoutine() {
  toggleSettings();

  const routines = getEffectiveRoutines();
  const suffix   = isLoisir ? ' <span class="cfg-badge">+50 min</span>' : '';

  const sections = ['matin', 'soir'].map(name => {
    const steps = routines[name];
    const title = name === 'matin' ? '🌅 Routine du matin' : '🌆 Routine du soir';
    const rows = steps.map(s => `
      <div class="cfg-step">
        <span class="cfg-time">${fmtClock(toSec(s.start))}</span>
        <span class="cfg-emoji">${s.emoji}</span>
        <span class="cfg-label">${s.label}</span>
      </div>`).join('');
    return `
      <div class="cfg-section">
        <h2 class="cfg-title">${title}${suffix}</h2>
        ${rows}
      </div>`;
  }).join('');

  const overlay = document.createElement('div');
  overlay.id = 'config-overlay';
  overlay.className = 'config-overlay';
  overlay.innerHTML = `
    <div class="config-content">
      <button class="config-close-btn" onclick="document.getElementById('config-overlay').remove()">✕ Fermer</button>
      ${sections}
    </div>`;
  document.body.appendChild(overlay);
}

// ─── Démarrage ────────────────────────────────────

render();
setInterval(render, 3000);
