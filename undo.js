/* ═══════════════════════════════════════════════════════════
   ANNULER / RÉTABLIR (Ctrl+Z / Ctrl+Y)
   Historique des états de appData enregistrés par saveData().
   Les modifications rapprochées (frappe continue) sont
   regroupées en une seule étape. L'état propre à l'appareil
   (semaine affichée, page ouverte…), le meilleur score Snake
   et les révisions (anki.js a son propre Ctrl+Z) ne sont pas
   concernés.
   ═══════════════════════════════════════════════════════════ */

const UNDO_MAX_STEPS = 50;
const UNDO_GROUP_MS = 1000;
const UNDO_TOAST_MS = 6000;

const UNDO_TRANSLATIONS = {
  fr: {
    undo: 'Annuler',
    undoShortcut: 'Annuler (Ctrl+Z)',
    redoShortcut: 'Rétablir (Ctrl+Y)',
    undone: 'Modification annulée.',
    redone: 'Modification rétablie.',
    eventDeleted: 'Évènement supprimé.'
  },
  en: {
    undo: 'Undo',
    undoShortcut: 'Undo (Ctrl+Z)',
    redoShortcut: 'Redo (Ctrl+Y)',
    undone: 'Change undone.',
    redone: 'Change redone.',
    eventDeleted: 'Event deleted.'
  },
  vi: {
    undo: 'Hoàn tác',
    undoShortcut: 'Hoàn tác (Ctrl+Z)',
    redoShortcut: 'Làm lại (Ctrl+Y)',
    undone: 'Đã hoàn tác.',
    redone: 'Đã làm lại.',
    eventDeleted: 'Đã xóa sự kiện.'
  }
};

let undoStack = [];
let redoStack = [];
let undoCurrent = null;
let undoLastRecordAt = 0;
let undoToastTimer = null;

function registerUndoTranslations() {
  Object.keys(UNDO_TRANSLATIONS).forEach((language) => {
    if (translations[language]) {
      translations[language].undo = UNDO_TRANSLATIONS[language];
    }
  });
}

function undoSnapshot() {
  const data = typeof syncExtractData === 'function' ? syncExtractData(appData) : JSON.parse(JSON.stringify(appData));
  delete data.snake;
  delete data.news;
  delete data.menu;
  delete data.anki;
  delete data.syncMeta;
  delete data.storagePath;
  return JSON.stringify(data);
}

// Appelé par saveData() après chaque modification.
function recordUndoSnapshot() {
  const now = undoSnapshot();
  if (undoCurrent === null) {
    undoCurrent = now;
    return;
  }
  if (now === undoCurrent) return;
  const time = Date.now();
  if (time - undoLastRecordAt > UNDO_GROUP_MS || undoStack.length === 0) {
    undoStack.push(undoCurrent);
    if (undoStack.length > UNDO_MAX_STEPS) undoStack.shift();
  }
  redoStack = [];
  undoCurrent = now;
  undoLastRecordAt = time;
  updateUndoButtons();
}

// Appelé quand des données arrivent d'un autre appareil.
function resetUndoBaseline() {
  undoCurrent = undoSnapshot();
  undoLastRecordAt = 0;
}

function undoRestore(serialized) {
  const data = JSON.parse(serialized);
  data.snake = appData.snake;
  data.news = appData.news;
  data.menu = appData.menu;
  data.anki = appData.anki;
  data.syncMeta = appData.syncMeta;
  if (typeof syncApplyData === 'function') {
    const previousRaw = typeof lastPersistedRaw === 'string' ? lastPersistedRaw : null;
    syncApplyData(data); // conserve l'état local, migre, enregistre et redessine
    // L'annulation est une vraie modification : on la date pour la synchro.
    if (typeof syncRecordChanges === 'function') {
      syncRecordChanges(previousRaw);
      persistToLocalStorage();
    }
  } else {
    appData = { ...appData, ...data };
    migrateData();
    persistToLocalStorage();
    scheduleFileSave();
    renderAllViews();
  }
  undoCurrent = undoSnapshot();
  undoLastRecordAt = 0;
  if (typeof onLocalDataChanged === 'function') {
    onLocalDataChanged();
  }
  updateUndoButtons();
}

function undo() {
  if (typeof flushPendingSave === 'function') flushPendingSave(); // frappe pas encore enregistrée
  if (undoStack.length === 0) return false;
  redoStack.push(undoCurrent);
  undoRestore(undoStack.pop());
  showUndoToast('undo.undone', false);
  return true;
}

function redo() {
  if (typeof flushPendingSave === 'function') flushPendingSave();
  if (redoStack.length === 0) return false;
  undoStack.push(undoCurrent);
  undoRestore(redoStack.pop());
  showUndoToast('undo.redone', false);
  return true;
}

function updateUndoButtons() {
  const undoButton = document.getElementById('undo-button');
  const redoButton = document.getElementById('redo-button');
  if (undoButton) undoButton.disabled = undoStack.length === 0;
  if (redoButton) redoButton.disabled = redoStack.length === 0;
}

function showUndoToast(messageKey, withUndoButton = true) {
  const toast = document.getElementById('undo-toast');
  const text = document.getElementById('undo-toast-text');
  const button = document.getElementById('undo-toast-button');
  if (!toast || !text || !button) return;
  text.textContent = t(messageKey);
  button.hidden = !withUndoButton;
  toast.hidden = false;
  clearTimeout(undoToastTimer);
  undoToastTimer = setTimeout(() => {
    toast.hidden = true;
  }, UNDO_TOAST_MS);
}

function undoIsTextField(element) {
  if (!element) return false;
  if (element.isContentEditable || element.tagName === 'TEXTAREA') return true;
  if (element.tagName !== 'INPUT') return false;
  return !['checkbox', 'radio', 'button', 'submit', 'color', 'range', 'file'].includes(element.type);
}

function initUndo() {
  undoCurrent = undoSnapshot();
  updateUndoButtons();

  document.getElementById('undo-button').addEventListener('click', undo);
  document.getElementById('redo-button').addEventListener('click', redo);
  document.getElementById('undo-toast-button').addEventListener('click', () => {
    document.getElementById('undo-toast').hidden = true;
    undo();
  });

  document.addEventListener('keydown', (event) => {
    if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
    // Dans un champ texte, on laisse l'annulation native du navigateur.
    if (undoIsTextField(event.target)) return;
    const key = event.key.toLowerCase();
    const isUndo = key === 'z' && !event.shiftKey;
    const isRedo = key === 'y' || (key === 'z' && event.shiftKey);
    if (!isUndo && !isRedo) return;
    event.preventDefault();
    if (isUndo) undo();
    else redo();
  });
}
