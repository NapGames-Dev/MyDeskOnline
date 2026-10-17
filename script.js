/* ═══════════════════════════════════════════════════════════
   CŒUR DE MYDESK
   Données (chargement, enregistrement, migration), langue, onglets,
   paramètres, sauvegarde sur disque et démarrage (bootstrap, en fin de
   fichier). Chaque onglet a son fichier, chargé avant celui-ci :
   translations.js, calendar.js, mindmap.js, gantt.js, notes.js,
   daily-challenges.js, appearance.js, puis sport.js, anki.js, news.js…
   ═══════════════════════════════════════════════════════════ */

const DATA_KEY = 'mydesk-data';
const DATA_FILE_NAME = 'mydesk-data.json';
const defaultData = {
  storagePath: '',
  calendar: {
    events: [],
    lastWeekStart: null,
    types: []
  },
  mindmap: {
    maps: [],
    activeMapId: null
  },
  todo: {
    blocks: []
  },
  notes: {
    pages: [],
    activePageId: null
  },
  dailyChallenges: {
    challenges: [],
    completions: {}
  },
  gantt: {
    charts: [],
    activeChartId: null
  },
  snake: {
    bestScore: 0
  },
  news: {
    read: {}
  },
  sport: {
    sessions: [],
    logs: {},
    activeSessionId: null
  },
  anki: {
    decks: [],
    notes: [],
    cards: [],
    revlog: [],
    tags: [],
    settings: {}
  },
  tabs: {
    visibility: {
      calendar: true,
      mindmap: true,
      todo: true,
      notes: true,
      daily: true,
      sport: true,
      menutool: true,
      anki: true,
      news: true,
      gantt: true,
      snake: true,
      trackirigo: true,
      patchnotes: true
    },
    order: []
  }
};

const OPTIONAL_TABS = [
  { id: 'calendar', labelKey: 'tabs.calendar' },
  { id: 'mindmap', labelKey: 'tabs.mindmap' },
  { id: 'todo', labelKey: 'tabs.todo' },
  { id: 'notes', labelKey: 'tabs.notes' },
  { id: 'daily', labelKey: 'tabs.daily' },
  { id: 'sport', labelKey: 'tabs.sport' },
  { id: 'menutool', labelKey: 'tabs.menutool' },
  { id: 'anki', labelKey: 'tabs.anki' },
  { id: 'news', labelKey: 'tabs.news' },
  { id: 'gantt', labelKey: 'tabs.gantt' },
  { id: 'snake', labelKey: 'tabs.snake' },
  { id: 'trackirigo', labelKey: 'tabs.track' },
  { id: 'patchnotes', labelKey: 'tabs.patchnotes' }
];

const DAILY_HISTORY_DAYS = 14;

const DEFAULT_EVENT_COLOR = '#10b981';
const MIN_EVENT_DURATION = 15;
const EVENT_DURATION_STEP = 15;
const CALENDAR_START_HOUR = 7;
const CALENDAR_END_HOUR = 22;
const CALENDAR_END_MINUTE = (CALENDAR_END_HOUR + 1) * 60;
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const GANTT_ROW_HEIGHT = 56;
const GANTT_DAY_WIDTH = 64;
const VERSION_INDICATOR_ID = 'version-indicator';
const DEFAULT_VERSION_SOURCE = 'https://raw.githubusercontent.com/NapGames-Dev/MyDeskOnline/main/version.json';
const LOCAL_VERSION_INFO = {
  version: '1.7.2',
  versionCheckUrl: 'https://raw.githubusercontent.com/NapGames-Dev/MyDeskOnline/main/version.json'
};
const VERSION_INDICATOR_STATES = {
  loading: 'loading',
  upToDate: 'up-to-date',
  updateAvailable: 'update-available',
  error: 'error'
};

const LANGUAGE_KEY = 'mydesk-language';
const LANGUAGE_FALLBACK = 'fr';
const SUPPORTED_LANGUAGES = ['fr', 'en', 'vi'];
const LANGUAGE_LOCALES = {
  fr: 'fr-FR',
  en: 'en-US',
  vi: 'vi-VN'
};


let currentLanguage = getInitialLanguage();
document.documentElement.setAttribute('lang', currentLanguage);
let localVersionInfo = null;
let versionCheckPromise = null;
let versionIndicatorStatus = {
  state: VERSION_INDICATOR_STATES.loading,
  labelKey: 'version.checking'
};

let appData = cloneDefault();
let currentWeekStart = startOfWeek(new Date());
let folderHandle = null;
let handleDBPromise = null;
let saveTimer = null;
let lastStorageStatus = null;
let tabLinks = [];
let activateTabHandler = null;

function cloneDefault() {
  return JSON.parse(JSON.stringify(defaultData));
}

function startOfWeek(date) {
  const result = new Date(date);
  const day = result.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function formatDate(date, options = {}) {
  const formatOptions = {
    weekday: options.weekday ? options.weekday : 'long',
    day: '2-digit',
    month: 'short'
  };
  if (options.year) {
    formatOptions.year = 'numeric';
  }
  return date.toLocaleDateString(getCurrentLocale(), formatOptions);
}

function formatTime(date) {
  return date.toLocaleTimeString(getCurrentLocale(), {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getActiveTabId() {
  const activePanel = document.querySelector('.tab-panel.active');
  return activePanel ? activePanel.id : null;
}

function getInitialLanguage() {
  try {
    const stored = localStorage.getItem(LANGUAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.includes(stored)) {
      return stored;
    }
  } catch (error) {
    console.warn('Impossible de lire la langue sauvegardée', error);
  }
  const browserLanguage =
    typeof navigator !== 'undefined' && navigator.language
      ? navigator.language.slice(0, 2).toLowerCase()
      : LANGUAGE_FALLBACK;
  if (SUPPORTED_LANGUAGES.includes(browserLanguage)) {
    return browserLanguage;
  }
  return LANGUAGE_FALLBACK;
}

function persistLanguagePreference(language) {
  try {
    localStorage.setItem(LANGUAGE_KEY, language);
  } catch (error) {
    console.warn('Impossible de stocker la langue sélectionnée', error);
  }
}

function getCurrentLocale() {
  return LANGUAGE_LOCALES[currentLanguage] || LANGUAGE_LOCALES[LANGUAGE_FALLBACK];
}

function t(key, variables = {}) {
  const resolveValue = (language) => {
    const source = translations[language];
    if (!source) return undefined;
    return key.split('.').reduce((acc, part) => {
      if (acc && typeof acc === 'object' && part in acc) {
        return acc[part];
      }
      return undefined;
    }, source);
  };
  let template = resolveValue(currentLanguage);
  if (typeof template === 'undefined') {
    template = resolveValue(LANGUAGE_FALLBACK);
  }
  if (typeof template === 'string') {
    return template.replace(/\{(\w+)\}/g, (match, token) =>
      Object.prototype.hasOwnProperty.call(variables, token) ? variables[token] : match
    );
  }
  return template !== undefined ? template : key;
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.getAttribute('data-i18n');
    if (!key) return;
    const translation = t(key);
    if (typeof translation === 'string') {
      element.textContent = translation;
    }
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    const key = element.getAttribute('data-i18n-placeholder');
    if (key) {
      const value = t(key);
      element.setAttribute('placeholder', value);
      element.setAttribute('data-placeholder', value);
    }
  });
  document.querySelectorAll('[data-i18n-title]').forEach((element) => {
    const key = element.getAttribute('data-i18n-title');
    if (key) {
      element.setAttribute('title', t(key));
    }
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
    const key = element.getAttribute('data-i18n-aria-label');
    if (key) {
      element.setAttribute('aria-label', t(key));
    }
  });
  document.title = t('app.title');
  const select = document.getElementById('language-select');
  if (select) {
    select.value = currentLanguage;
  }

  if (typeof renderSnakeTexts === 'function') {
    renderSnakeTexts();
  }
}

function refreshVersionIndicator() {
  if (versionIndicatorStatus && versionIndicatorStatus.labelKey) {
    setVersionIndicatorState(versionIndicatorStatus.state, versionIndicatorStatus.labelKey);
  }
}

function refreshStorageStatus() {
  if (lastStorageStatus) {
    const { messageKey, type, variables } = lastStorageStatus;
    updateStorageStatus(messageKey, type, variables);
  }
  renderStorageAlert();
  renderStorageUsage();
  if (typeof renderEco === 'function') renderEco();
}

function setLanguage(language) {
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    return;
  }
  if (language === currentLanguage) {
    applyTranslations();
    refreshStorageStatus();
    refreshVersionIndicator();
    syncLinkButton();
    return;
  }
  currentLanguage = language;
  document.documentElement.setAttribute('lang', currentLanguage);
  persistLanguagePreference(language);
  applyTranslations();
  renderCalendar();
  renderEventTypes();
  renderMindmapList();
  renderMindmap();
  renderGantt();
  renderDailyChallenges();
  renderTodo();
  renderNotes();
  renderTabVisibilitySettings();
  if (typeof renderNews === 'function') {
    renderNews();
  }
  if (typeof renderPatchNotes === 'function') {
    renderPatchNotes();
    patchNotesUpdateDot();
  }
  refreshStorageStatus();
  refreshVersionIndicator();
  syncLinkButton();
}

function initLocalization() {
  applyTranslations();
  const select = document.getElementById('language-select');
  if (select) {
    select.value = currentLanguage;
    select.addEventListener('change', (event) => {
      setLanguage(event.target.value);
    });
  }
  refreshVersionIndicator();
  refreshStorageStatus();
  syncLinkButton();
}

function toISODateString(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return new Date().toISOString().split('T')[0];
  }
  const normalized = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return normalized.toISOString().split('T')[0];
}

function parseDateOnly(value) {
  if (typeof value !== 'string') return null;
  const parts = value.split('-');
  if (parts.length !== 3) return null;
  const [year, month, day] = parts.map((part) => Number(part));
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

function diffDays(start, end) {
  if (!(start instanceof Date) || !(end instanceof Date)) return 0;
  return Math.round((end.getTime() - start.getTime()) / DAY_IN_MS);
}

function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function uid() {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

function ensureHandleDB() {
  if (!('indexedDB' in window)) {
    return Promise.resolve(null);
  }
  if (!handleDBPromise) {
    handleDBPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open('mydesk-handles', 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('handles')) {
          db.createObjectStore('handles');
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return handleDBPromise;
}

async function storeFolderHandle(handle) {
  const db = await ensureHandleDB();
  if (!db) return;
  await new Promise((resolve, reject) => {
    const tx = db.transaction('handles', 'readwrite');
    const store = tx.objectStore('handles');
    const req = store.put(handle, 'data-folder');
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function readStoredHandle() {
  const db = await ensureHandleDB();
  if (!db) return null;
  return new Promise((resolve, reject) => {
    const tx = db.transaction('handles', 'readonly');
    const store = tx.objectStore('handles');
    const req = store.get('data-folder');
    req.onsuccess = () => resolve(typeof req.result !== 'undefined' ? req.result : null);
    req.onerror = () => reject(req.error);
  });
}

async function clearStoredHandle() {
  const db = await ensureHandleDB();
  if (!db) return;
  await new Promise((resolve, reject) => {
    const tx = db.transaction('handles', 'readwrite');
    const store = tx.objectStore('handles');
    const req = store.delete('data-folder');
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function ensurePermission(handle) {
  if (!handle) return false;
  if (!handle.requestPermission) return false;
  const options = { mode: 'readwrite' };
  if (handle.queryPermission) {
    const status = await handle.queryPermission(options);
    if (status === 'granted') {
      return true;
    }
  }
  const permission = await handle.requestPermission(options);
  return permission === 'granted';
}

// Dernier contenu lu ou écrit par CET onglet : sert à voir si un autre
// onglet (ou la fenêtre de l'app installée) a enregistré entre-temps.
let lastPersistedRaw = null;

function loadFromLocalStorage() {
  const raw = localStorage.getItem(DATA_KEY);
  lastPersistedRaw = raw;
  if (!raw) {
    return cloneDefault();
  }
  try {
    const parsed = JSON.parse(raw);
    return {
      ...cloneDefault(),
      ...parsed,
      calendar: {
        ...cloneDefault().calendar,
        ...(parsed.calendar ? parsed.calendar : {})
      },
        mindmap: {
          ...cloneDefault().mindmap,
          ...(parsed.mindmap ? parsed.mindmap : {})
        },
        todo: {
          ...cloneDefault().todo,
          ...(parsed.todo ? parsed.todo : {})
        },
        notes: {
          ...cloneDefault().notes,
          ...(parsed.notes ? parsed.notes : {})
        },
        dailyChallenges: {
          ...cloneDefault().dailyChallenges,
          ...(parsed.dailyChallenges ? parsed.dailyChallenges : {})
        },
        gantt: {
        ...cloneDefault().gantt,
        ...(parsed.gantt ? parsed.gantt : {})
      }
    };
  } catch (error) {
    console.warn('Impossible de lire les données locales, réinitialisation.', error);
    return cloneDefault();
  }
}

async function loadFromFileSystem() {
  try {
    const storedHandle = await readStoredHandle();
    if (!storedHandle) return null;
    if (!(await ensurePermission(storedHandle))) {
      await clearStoredHandle();
      return null;
    }
    folderHandle = storedHandle;
    const fileHandle = await folderHandle.getFileHandle(DATA_FILE_NAME).catch(() => null);
    if (!fileHandle) return null;
    const file = await fileHandle.getFile();
    const text = await file.text();
    const parsed = JSON.parse(text);
    return parsed;
  } catch (error) {
    console.warn('Lecture du fichier de données impossible.', error);
    return null;
  }
}

// Le navigateur garde environ 5 Mo par site (comptés en caractères, toutes
// clés confondues, copie de synchro comprise). Au-delà, l'écriture échoue :
// on le signale au lieu de perdre les modifications sans rien dire.
const STORAGE_LIMIT_CHARS = 5 * 1024 * 1024;
const STORAGE_WARN_RATIO = 0.8;
const STORAGE_CHECK_MS = 60 * 1000;
let storageAlert = null; // null | 'almost' | 'full'
let storageAlertClosed = false;
let storageAlertUsed = 0;
let storageCheckedAt = 0;

function persistToLocalStorage() {
  const raw = JSON.stringify(appData);
  try {
    localStorage.setItem(DATA_KEY, raw);
  } catch (error) {
    // Rien n'est écrit : lastPersistedRaw reste la dernière version vraiment
    // enregistrée (la synchro datera bien ces modifications).
    console.warn('Enregistrement dans le navigateur impossible', error);
    setStorageAlert('full');
    return false;
  }
  lastPersistedRaw = raw;
  if (storageAlert === 'full' || Date.now() - storageCheckedAt > STORAGE_CHECK_MS) {
    checkStorageUsage();
  }
  return true;
}

// Taille de chaque clé du stockage du navigateur, en caractères.
function storageUsage() {
  const keys = {};
  let total = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const size = key.length + (localStorage.getItem(key) || '').length;
      keys[key] = size;
      total += size;
    }
  } catch (error) {
    return null;
  }
  return { total, keys };
}

function formatStorageSize(chars) {
  const locale = getCurrentLocale();
  if (chars < 100 * 1024) {
    return t('storage.kb', { n: Math.max(1, Math.round(chars / 1024)).toLocaleString(locale) });
  }
  const mb = (chars / (1024 * 1024)).toLocaleString(locale, { maximumFractionDigits: 1 });
  return t('storage.mb', { n: mb });
}

function checkStorageUsage() {
  storageCheckedAt = Date.now();
  const usage = storageUsage();
  if (!usage) return;
  storageAlertUsed = usage.total;
  setStorageAlert(usage.total > STORAGE_LIMIT_CHARS * STORAGE_WARN_RATIO ? 'almost' : null);
  renderStorageUsage(usage);
}

function setStorageAlert(level) {
  if (level !== storageAlert) storageAlertClosed = false;
  storageAlert = level;
  renderStorageAlert();
}

function renderStorageAlert() {
  const box = document.getElementById('storage-alert');
  if (!box) return;
  const show = Boolean(storageAlert) && !(storageAlert === 'almost' && storageAlertClosed);
  box.hidden = !show;
  if (!show) return;
  box.classList.toggle('is-full', storageAlert === 'full');
  document.getElementById('storage-alert-text').textContent =
    storageAlert === 'full'
      ? t('storage.alertFull')
      : t('storage.alertAlmost', { used: formatStorageSize(storageAlertUsed), limit: formatStorageSize(STORAGE_LIMIT_CHARS) });
  document.getElementById('storage-alert-close').hidden = storageAlert === 'full';
}

// Accueil : place utilisée et les trois plus gros postes (calculés seulement
// quand l'onglet est affiché).
function renderStorageUsage(usage = null) {
  const line = document.getElementById('storage-usage');
  const panel = document.getElementById('home');
  if (!line || !panel || !panel.classList.contains('active')) return;
  const current = usage || storageUsage();
  if (!current) {
    line.textContent = '';
    return;
  }
  const sizes = Object.keys(appData || {}).map((key) => [key, JSON.stringify(appData[key] ?? null).length]);
  const syncBase = current.keys['mydesk-sync-base'];
  if (syncBase) sizes.push(['syncBase', syncBase]);
  const parts = sizes
    .filter(([key, size]) => size >= 10 * 1024 && translationExists(`storage.parts.${key}`))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([key, size]) => `${t(`storage.parts.${key}`)} ${formatStorageSize(size)}`);
  let text = t('storage.usage', { used: formatStorageSize(current.total), limit: formatStorageSize(STORAGE_LIMIT_CHARS) });
  if (parts.length) text += ` ${t('storage.usageParts', { parts: parts.join(', ') })}`;
  line.textContent = text;
  line.classList.toggle('is-high', current.total > STORAGE_LIMIT_CHARS * STORAGE_WARN_RATIO);
}

function translationExists(key) {
  const read = (language) =>
    key.split('.').reduce((node, part) => (node && typeof node === 'object' ? node[part] : undefined), translations[language]);
  return typeof (read(currentLanguage) ?? read(LANGUAGE_FALLBACK)) === 'string';
}

// Un autre onglet a enregistré des données plus récentes : on les reprend.
// Sans ça, un onglet resté ouvert avec un état périmé pouvait, en se
// synchronisant, faire passer pour « supprimé » tout ce qu'il n'avait pas.
function adoptDataFromOtherTab() {
  let raw = null;
  try {
    raw = localStorage.getItem(DATA_KEY);
  } catch (error) {
    return false;
  }
  if (!raw || raw === lastPersistedRaw) return false;
  appData = loadFromLocalStorage();
  migrateData();
  renderAllViews();
  if (typeof resetUndoBaseline === 'function') {
    resetUndoBaseline();
  }
  return true;
}

window.addEventListener('storage', (event) => {
  if (event.key === DATA_KEY) adoptDataFromOtherTab();
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') flushPendingSave();
  else if (appData) adoptDataFromOtherTab();
});
window.addEventListener('pagehide', () => flushPendingSave());

function scheduleFileSave() {
  if (!folderHandle) return;
  if (saveTimer) {
    clearTimeout(saveTimer);
  }
  saveTimer = setTimeout(async () => {
    saveTimer = null;
    try {
      const fileHandle = await folderHandle.getFileHandle(DATA_FILE_NAME, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(appData, null, 2));
      await writable.close();
      updateStorageStatus('storage.savedToDisk', 'success');
    } catch (error) {
      console.error('Écriture du fichier impossible', error);
      updateStorageStatus('storage.saveError', 'error');
    }
  }, 600);
}

function saveData() {
  if (saveSoonTimer) {
    clearTimeout(saveSoonTimer);
    saveSoonTimer = null;
  }
  if (typeof syncRecordChanges === 'function') {
    syncRecordChanges(lastPersistedRaw);
  }
  persistToLocalStorage();
  scheduleFileSave();
  if (typeof recordUndoSnapshot === 'function') {
    recordUndoSnapshot();
  }
  if (typeof onLocalDataChanged === 'function') {
    onLocalDataChanged();
  }
}

// Frappe dans un champ : saveData réécrit toute la base (et la compare pour
// la synchro, et la photographie pour Ctrl+Z) ; on attend donc une courte
// pause dans la frappe. Enregistré quoi qu'il arrive en quittant la page,
// avant une annulation et avant une synchro (flushPendingSave).
const SAVE_SOON_MS = 400;
let saveSoonTimer = null;

function saveDataSoon() {
  if (saveSoonTimer) clearTimeout(saveSoonTimer);
  saveSoonTimer = setTimeout(saveData, SAVE_SOON_MS);
}

function flushPendingSave() {
  if (saveSoonTimer) saveData();
}

function renderAllViews() {
  [
    renderCalendar,
    renderEventTypes,
    renderMindmapList,
    renderMindmap,
    renderGantt,
    renderNotes,
    renderDailyChallenges,
    renderTodo,
    renderTabVisibilitySettings,
    applyTabVisibility,
    typeof refreshSnake === 'function' ? refreshSnake : null,
    typeof renderNews === 'function' ? renderNews : null,
    typeof renderSport === 'function' ? renderSport : null,
    typeof renderAnki === 'function' ? renderAnki : null
  ].forEach((render) => {
    if (!render) return;
    try {
      render();
    } catch (error) {
      console.warn('Rendu impossible', error);
    }
  });
}

function migrateData() {
  const todayISO = toISODateString(new Date());
  if (!appData.calendar || typeof appData.calendar !== 'object') {
    appData.calendar = cloneDefault().calendar;
  }
  if (!Array.isArray(appData.calendar.events)) {
    appData.calendar.events = [];
  }
  if (!Array.isArray(appData.calendar.types)) {
    appData.calendar.types = [];
  }

  appData.calendar.types = appData.calendar.types.map((type, index) => {
    const normalized = {
      id: type && type.id ? type.id : uid(),
      name: type && type.name ? type.name : t('calendar.defaultTypeName', { index: index + 1 }),
      color: type && type.color ? type.color : DEFAULT_EVENT_COLOR
    };
    return normalized;
  });

  const typeMap = new Map(appData.calendar.types.map((type) => [type.id, type]));

  appData.calendar.events = appData.calendar.events.map((event) => {
    const normalized = { ...event };
    normalized.id = normalized.id ? normalized.id : uid();
    normalized.recurrence = normalized.recurrence ? normalized.recurrence : 'none';
    normalized.duration = Number(normalized.duration);
    if (Number.isNaN(normalized.duration) || normalized.duration <= 0) {
      normalized.duration = 60;
    }
    if (normalized.duration < MIN_EVENT_DURATION) {
      normalized.duration = MIN_EVENT_DURATION;
    }
    if (normalized.typeId && !typeMap.has(normalized.typeId)) {
      normalized.typeId = '';
    }
    if (!normalized.color) {
      if (normalized.typeId && typeMap.has(normalized.typeId)) {
        normalized.color = typeMap.get(normalized.typeId).color;
      } else {
        normalized.color = DEFAULT_EVENT_COLOR;
      }
    }
    return normalized;
  });

  if (!appData.mindmap || typeof appData.mindmap !== 'object') {
    appData.mindmap = cloneDefault().mindmap;
  }

  if (Array.isArray(appData.mindmap.nodes) || Array.isArray(appData.mindmap.links)) {
    const nodes = Array.isArray(appData.mindmap.nodes) ? appData.mindmap.nodes : [];
    const links = Array.isArray(appData.mindmap.links) ? appData.mindmap.links : [];
    const defaultId = uid();
    appData.mindmap = {
      maps: [
        {
          id: defaultId,
          name: t('mindmap.defaultMapName', { index: 1 }),
          nodes,
          links
        }
      ],
      activeMapId: defaultId
    };
  }

  if (!Array.isArray(appData.mindmap.maps)) {
    appData.mindmap.maps = [];
  }

  appData.mindmap.maps = appData.mindmap.maps.map((map, index) => {
    const nodeIds = new Set();
    const nodes = Array.isArray(map && map.nodes)
      ? map.nodes.map((node, nodeIndex) => {
          const normalizedNode = {
            id: node && node.id ? node.id : uid(),
            title: node && node.title ? node.title : t('mindmap.defaultIdeaName', { index: nodeIndex + 1 }),
            color: node && node.color ? node.color : '#4e73df',
            x: typeof node === 'object' && typeof node.x === 'number' ? node.x : 100,
            y: typeof node === 'object' && typeof node.y === 'number' ? node.y : 100
          };
          nodeIds.add(normalizedNode.id);
          return normalizedNode;
        })
      : [];

    const links = Array.isArray(map && map.links)
      ? map.links
          .map((link) => ({
            id: link && link.id ? link.id : uid(),
            from: link && link.from ? link.from : null,
            to: link && link.to ? link.to : null
          }))
          .filter((link) => link.from && link.to && nodeIds.has(link.from) && nodeIds.has(link.to))
      : [];

    return {
      id: map && map.id ? map.id : uid(),
      name: map && map.name ? map.name : t('mindmap.defaultMapName', { index: index + 1 }),
      nodes,
      links
    };
  });

  if (appData.mindmap.maps.length === 0) {
    const fallbackId = uid();
    appData.mindmap.maps.push({ id: fallbackId, name: t('mindmap.defaultMapName', { index: 1 }), nodes: [], links: [] });
    appData.mindmap.activeMapId = fallbackId;
  }

  if (!appData.mindmap.activeMapId || !appData.mindmap.maps.some((map) => map.id === appData.mindmap.activeMapId)) {
    appData.mindmap.activeMapId = appData.mindmap.maps[0].id;
  }

  if (!appData.todo || typeof appData.todo !== 'object') {
    appData.todo = cloneDefault().todo;
  }

  if (!Array.isArray(appData.todo.blocks)) {
    appData.todo.blocks = [];
  }

  appData.todo.blocks = appData.todo.blocks.map((block, index) => {
    const items = Array.isArray(block && block.items)
      ? block.items.map((item, itemIndex) => ({
          // On garde les champs ajoutés par todo.js (échéance, important…).
          ...item,
          id: item && item.id ? item.id : uid(),
          text: item && item.text ? item.text : t('todo.defaultItemName', { index: itemIndex + 1 }),
          done: Boolean(item && item.done)
        }))
      : [];

    return {
      ...block,
      id: block && block.id ? block.id : uid(),
      title: block && block.title ? block.title : t('todo.defaultBlockName', { index: index + 1 }),
      items
    };
  });

  if (!appData.notes || typeof appData.notes !== 'object') {
    appData.notes = cloneDefault().notes;
  }

  if (!Array.isArray(appData.notes.pages)) {
    appData.notes.pages = [];
  }

  // Les champs en plus (icône, épinglée, dates) sont gardés ; titre vide permis.
  appData.notes.pages = appData.notes.pages.map((page) => ({
    ...(page && typeof page === 'object' ? page : {}),
    id: page && page.id ? page.id : uid(),
    name: page && typeof page.name === 'string' ? page.name : '',
    content: page && typeof page.content === 'string' ? page.content : ''
  }));

  if (appData.notes.pages.length === 0) {
    const defaultPage = { id: uid(), name: '', content: '', createdAt: Date.now(), updatedAt: Date.now() };
    appData.notes.pages.push(defaultPage);
    appData.notes.activePageId = defaultPage.id;
  }

  if (!appData.notes.activePageId || !appData.notes.pages.some((page) => page.id === appData.notes.activePageId)) {
    appData.notes.activePageId = appData.notes.pages[0].id;
  }

  if (!appData.dailyChallenges || typeof appData.dailyChallenges !== 'object') {
    appData.dailyChallenges = cloneDefault().dailyChallenges;
  }

  if (!Array.isArray(appData.dailyChallenges.challenges)) {
    appData.dailyChallenges.challenges = [];
  }

  appData.dailyChallenges.challenges = appData.dailyChallenges.challenges.map((challenge, index) => ({
    id: challenge && challenge.id ? challenge.id : uid(),
    name: challenge && challenge.name ? challenge.name : t('daily.defaultName', { index: index + 1 }),
    includeWeekend: typeof (challenge && challenge.includeWeekend) === 'boolean' ? challenge.includeWeekend : true,
    weeklyTarget:
      challenge && Number.isFinite(Number(challenge.weeklyTarget))
        ? Math.max(1, Math.round(Number(challenge.weeklyTarget)))
        : 1,
    createdAt:
      challenge && typeof challenge.createdAt === 'string' ? challenge.createdAt : todayISO
  }));

  if (!appData.dailyChallenges.completions || typeof appData.dailyChallenges.completions !== 'object') {
    appData.dailyChallenges.completions = {};
  }

  Object.keys(appData.dailyChallenges.completions).forEach((dateKey) => {
    const entry = appData.dailyChallenges.completions[dateKey];
    if (!entry || typeof entry !== 'object') {
      appData.dailyChallenges.completions[dateKey] = {};
    }
  });

  if (!appData.gantt || typeof appData.gantt !== 'object') {
    appData.gantt = cloneDefault().gantt;
  }

  if (!Array.isArray(appData.gantt.charts)) {
    appData.gantt.charts = [];
  }

  appData.gantt.charts = appData.gantt.charts.map((chart, index) => {
    const chartId = chart && chart.id ? chart.id : uid();
    const tasks = Array.isArray(chart && chart.tasks)
      ? chart.tasks.map((task, taskIndex) => {
          const startValue = task && task.start ? task.start : todayISO;
          const endValue = task && task.end ? task.end : startValue;

          let startDate = parseDateOnly(typeof startValue === 'string' ? startValue : '');
          if (!startDate && typeof startValue === 'string' && startValue.includes('T')) {
            startDate = parseDateOnly(startValue.split('T')[0]);
          }
          if (!startDate) {
            startDate = parseDateOnly(todayISO) || new Date();
          }

          let endDate = parseDateOnly(typeof endValue === 'string' ? endValue : '');
          if (!endDate && typeof endValue === 'string' && endValue.includes('T')) {
            endDate = parseDateOnly(endValue.split('T')[0]);
          }
          if (!endDate) {
            endDate = new Date(startDate);
          }
          if (endDate < startDate) {
            endDate = new Date(startDate);
          }

          const normalizedStart = toISODateString(startDate);
          const normalizedEnd = toISODateString(endDate);
          const rawProgress = Number(task && task.progress);
          const clampedProgress = Number.isFinite(rawProgress) ? Math.min(100, Math.max(0, rawProgress)) : 0;
          return {
            id: task && task.id ? task.id : uid(),
            name: task && task.name ? task.name : t('gantt.defaultTaskName', { index: taskIndex + 1 }),
            start: normalizedStart,
            end: normalizedEnd,
            progress: clampedProgress
          };
        })
      : [];
    return {
      id: chartId,
      name: chart && chart.name ? chart.name : t('gantt.defaultChartName', { index: index + 1 }),
      tasks
    };
  });

  if (appData.gantt.charts.length === 0) {
    appData.gantt.activeChartId = null;
  } else if (!appData.gantt.activeChartId || !appData.gantt.charts.some((chart) => chart.id === appData.gantt.activeChartId)) {
    appData.gantt.activeChartId = appData.gantt.charts[0].id;
  }

  if (!appData.snake || typeof appData.snake !== 'object') {
    appData.snake = cloneDefault().snake;
  }
  if (typeof ensureSnakeData === 'function') {
    ensureSnakeData();
  }

  if (typeof ensureSportData === 'function') {
    ensureSportData();
  }

  if (typeof ensureAnkiData === 'function') {
    ensureAnkiData();
  }

  if (!appData.tabs || typeof appData.tabs !== 'object') {
    appData.tabs = cloneDefault().tabs;
  }
  if (!appData.tabs.visibility || typeof appData.tabs.visibility !== 'object') {
    appData.tabs.visibility = { ...cloneDefault().tabs.visibility };
  }
  OPTIONAL_TABS.forEach((tab) => {
    if (typeof appData.tabs.visibility[tab.id] !== 'boolean') {
      appData.tabs.visibility[tab.id] = true;
    }
  });
}

function updateStorageStatus(messageKey, type = 'info', variables = {}) {
  lastStorageStatus = { messageKey, type, variables };
  const status = document.getElementById('storage-status');
  if (!status) return;
  status.textContent = t(messageKey, variables);
  status.className = `storage-status ${type}`;
}

async function initData() {
  appData = loadFromLocalStorage();
  const fileData = await loadFromFileSystem();
  if (fileData) {
    appData = {
      ...cloneDefault(),
      ...fileData,
      calendar: {
        ...cloneDefault().calendar,
        ...(fileData.calendar ? fileData.calendar : appData.calendar)
      },
      mindmap: {
        ...cloneDefault().mindmap,
        ...(fileData.mindmap ? fileData.mindmap : appData.mindmap)
      },
      todo: {
        ...cloneDefault().todo,
        ...(fileData.todo ? fileData.todo : appData.todo)
      },
      notes: {
        ...cloneDefault().notes,
        ...(fileData.notes ? fileData.notes : appData.notes)
      },
      dailyChallenges: {
        ...cloneDefault().dailyChallenges,
        ...(fileData.dailyChallenges ? fileData.dailyChallenges : appData.dailyChallenges)
      },
      gantt: {
        ...cloneDefault().gantt,
        ...(fileData.gantt ? fileData.gantt : appData.gantt)
      },
      tabs: {
        ...cloneDefault().tabs,
        ...(fileData.tabs ? fileData.tabs : appData.tabs)
      }
    };
    updateStorageStatus('storage.loadedFromDisk', 'success');
  } else {
    updateStorageStatus('storage.loadedFromBrowser', 'info');
  }
  migrateData();
  if (appData.calendar.lastWeekStart) {
    currentWeekStart = startOfWeek(new Date(appData.calendar.lastWeekStart));
  }
}

// Onglet ouvert, retenu sur cet appareil pour le retrouver après un rafraîchissement.
const ACTIVE_TAB_KEY = 'mydesk-active-tab';

function initTabs() {
  tabLinks = Array.from(document.querySelectorAll('.tab-link'));
  const activateTab = (link) => {
    const previousActivePanel = document.querySelector('.tab-panel.active');
    tabLinks.forEach((l) => l.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach((panel) => panel.classList.remove('active'));
    link.classList.add('active');
    // Téléphone : la barre d'onglets défile, on y recentre l'onglet ouvert.
    if (window.matchMedia && window.matchMedia('(max-width: 700px)').matches && link.scrollIntoView) {
      link.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    }
    const targetId = link.dataset.target;
    document.getElementById(targetId).classList.add('active');
    try {
      localStorage.setItem(ACTIVE_TAB_KEY, targetId);
    } catch (error) {
      // stockage indisponible : on ne retient simplement pas l'onglet
    }

    if (previousActivePanel && previousActivePanel.id === 'snake' && targetId !== 'snake' && typeof pauseSnake === 'function') {
      pauseSnake();
    }

    if (targetId === 'calendar') {
      requestAnimationFrame(() => {
        renderCalendar();
        renderEventTypes();
      });
    } else if (targetId === 'home') {
      renderStorageUsage();
      if (typeof renderEco === 'function') renderEco();
    } else if (targetId === 'gantt') {
      requestAnimationFrame(() => {
        renderGantt();
      });
    } else if (targetId === 'snake' && typeof snakeOnTabShown === 'function') {
      requestAnimationFrame(() => {
        snakeOnTabShown();
      });
    }
  };
  activateTabHandler = activateTab;
  applyTabVisibility();
  tabLinks.forEach((link) => {
    link.addEventListener('click', () => {
      activateTab(link);
      checkVersionStatus();
    });
  });

  // ?tab=sport : raccourcis de l'app installée (appui long sur l'icône).
  const ongletDemande = new URLSearchParams(window.location.search).get('tab');
  let ongletRetenu = null;
  try {
    ongletRetenu = localStorage.getItem(ACTIVE_TAB_KEY);
  } catch (error) {
    ongletRetenu = null;
  }
  const visibleTab = (id) => tabLinks.find((link) => id && link.dataset.target === id && !link.classList.contains('is-hidden'));
  const initiallyActive =
    visibleTab(ongletDemande) ||
    visibleTab(ongletRetenu) ||
    tabLinks.find((link) => link.classList.contains('active') && !link.classList.contains('is-hidden')) ||
    tabLinks.find((link) => !link.classList.contains('is-hidden'));
  // ?tab= ne sert qu'à l'ouverture (raccourcis de l'app) : on le retire de
  // l'adresse pour qu'un rafraîchissement garde l'onglet choisi ensuite.
  if (ongletDemande && window.history && window.history.replaceState) {
    const url = new URL(window.location.href);
    url.searchParams.delete('tab');
    window.history.replaceState(null, '', url.pathname + url.search + url.hash);
  }
  if (initiallyActive) {
    activateTab(initiallyActive);
  }
}

// Onglet réservé : Menu seulement pour un compte qui a accès au Gist Menu
// (menu.js : menuAccesAutorise).
function tabDisponible(tabId) {
  return tabId !== 'menutool' || (typeof menuAccesAutorise === 'function' && menuAccesAutorise());
}

function getTabVisibility(tabId) {
  if (!tabDisponible(tabId)) {
    return false;
  }
  if (!appData.tabs || !appData.tabs.visibility) {
    return true;
  }
  if (typeof appData.tabs.visibility[tabId] === 'boolean') {
    return appData.tabs.visibility[tabId];
  }
  return true;
}

function applyTabVisibility() {
  if (typeof applyTabOrder === 'function') {
    applyTabOrder();
  }
  const links = tabLinks.length ? tabLinks : Array.from(document.querySelectorAll('.tab-link'));
  OPTIONAL_TABS.forEach((tab) => {
    const visible = getTabVisibility(tab.id);
    const button = document.querySelector(`.tab-link[data-target="${tab.id}"]`);
    const panel = document.getElementById(tab.id);
    if (button) {
      button.classList.toggle('is-hidden', !visible);
      button.setAttribute('aria-hidden', visible ? 'false' : 'true');
    }
    if (panel) {
      panel.classList.toggle('is-hidden', !visible);
    }
  });

  if (activateTabHandler && links.length > 0) {
    const activeLink = links.find((link) => link.classList.contains('active'));
    if (activeLink && activeLink.classList.contains('is-hidden')) {
      const fallback = links.find((link) => !link.classList.contains('is-hidden'));
      if (fallback) {
        activateTabHandler(fallback);
      }
    }
  }
}

function renderTabVisibilitySettings() {
  const container = document.getElementById('tab-visibility-settings');
  if (!container) return;
  container.innerHTML = '';

  // Même ordre que la barre d'onglets (réglable en glissant ou avec ▲▼).
  const barOrder = Array.from(document.querySelectorAll('.tab-bar .tab-link')).map((link) => link.dataset.target);
  const orderedTabs = OPTIONAL_TABS.filter((tab) => tabDisponible(tab.id)).sort((a, b) => barOrder.indexOf(a.id) - barOrder.indexOf(b.id));

  orderedTabs.forEach((tab, index) => {
    const wrapper = document.createElement('label');
    wrapper.className = 'settings-toggle';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = getTabVisibility(tab.id);
    checkbox.addEventListener('change', () => {
      appData.tabs.visibility[tab.id] = checkbox.checked;
      applyTabVisibility();
      saveData();
    });

    const label = document.createElement('span');
    label.textContent = t(tab.labelKey);

    wrapper.appendChild(checkbox);
    wrapper.appendChild(label);
    if (typeof moveTabInOrder === 'function') {
      const arrows = document.createElement('span');
      arrows.className = 'settings-toggle__order';
      [
        ['▲', -1, 'tabOrder.moveUp', index === 0],
        ['▼', 1, 'tabOrder.moveDown', index === orderedTabs.length - 1]
      ].forEach(([symbol, direction, key, disabled]) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'settings-toggle__move';
        button.textContent = symbol;
        button.disabled = disabled;
        button.title = t(key, { name: t(tab.labelKey) });
        button.setAttribute('aria-label', button.title);
        button.addEventListener('click', (event) => {
          event.preventDefault();
          moveTabInOrder(tab.id, direction);
        });
        arrows.appendChild(button);
      });
      wrapper.appendChild(arrows);
    }
    container.appendChild(wrapper);
  });

  if (typeof resetTabOrder === 'function') {
    const footer = document.createElement('div');
    footer.className = 'settings-tab-order';
    const hint = document.createElement('p');
    hint.className = 'settings-section__desc';
    hint.textContent = t('tabOrder.hint');
    const reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'btn-secondary';
    reset.textContent = t('tabOrder.reset');
    reset.disabled = !(appData.tabs && Array.isArray(appData.tabs.order) && appData.tabs.order.length);
    reset.addEventListener('click', () => resetTabOrder());
    footer.appendChild(hint);
    footer.appendChild(reset);
    container.appendChild(footer);
  }
}

function initSettings() {
  renderTabVisibilitySettings();
  applyTabVisibility();
}

function getVersionIndicator() {
  return document.getElementById(VERSION_INDICATOR_ID);
}

function setVersionIndicatorState(state, labelKey) {
  versionIndicatorStatus = { state, labelKey };
  const indicator = getVersionIndicator();
  if (!indicator) return;
  indicator.classList.remove(
    VERSION_INDICATOR_STATES.loading,
    VERSION_INDICATOR_STATES.upToDate,
    VERSION_INDICATOR_STATES.updateAvailable,
    VERSION_INDICATOR_STATES.error
  );
  indicator.classList.add(state);
  indicator.textContent = t(labelKey);
}

async function loadLocalVersionInfo() {
  if (localVersionInfo) {
    return localVersionInfo;
  }

  // 1. Cas où le site est ouvert en file:// -> on ne tente PAS de fetch local
  if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
    localVersionInfo = LOCAL_VERSION_INFO;
    return localVersionInfo;
  }

  // 2. Cas où le site est servi en http(s) -> on peut utiliser version.json
  const response = await fetch('version.json', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Version locale introuvable');
  }
  const payload = await response.json();
  if (!payload.version) {
    throw new Error('Version locale manquante');
  }
  localVersionInfo = payload;
  return payload;
}

function resolveRemoteVersionUrl(localInfo) {
  if (typeof window !== 'undefined' && window.MYDESK_VERSION_SOURCE) {
    return window.MYDESK_VERSION_SOURCE;
  }
  if (localInfo && typeof localInfo.versionCheckUrl === 'string' && localInfo.versionCheckUrl.trim()) {
    return localInfo.versionCheckUrl.trim();
  }
  return DEFAULT_VERSION_SOURCE;
}

async function fetchRemoteVersionInfo(remoteUrl) {
  if (!remoteUrl) {
    throw new Error('URL distante non définie');
  }
  const url = `${remoteUrl}${remoteUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Impossible de joindre ${remoteUrl}`);
  }
  const payload = await response.json();
  if (!payload.version) {
    throw new Error('Réponse distante incomplète');
  }
  return payload;
}

function versionsMatch(localInfo, remoteInfo) {
  return localInfo.version === remoteInfo.version;
}

function checkVersionStatus() {
  if (!getVersionIndicator()) {
    return Promise.resolve();
  }
  if (!versionCheckPromise) {
    setVersionIndicatorState(VERSION_INDICATOR_STATES.loading, 'version.checking');
    versionCheckPromise = (async () => {
      try {
        const localInfo = await loadLocalVersionInfo();
        const remoteInfo = await fetchRemoteVersionInfo(resolveRemoteVersionUrl(localInfo));
        if (versionsMatch(localInfo, remoteInfo)) {
          setVersionIndicatorState(VERSION_INDICATOR_STATES.upToDate, 'version.upToDate');
        } else {
          setVersionIndicatorState(VERSION_INDICATOR_STATES.updateAvailable, 'version.updateAvailable');
        }
      } catch (error) {
        console.error('Impossible de vérifier la version', error);
        setVersionIndicatorState(VERSION_INDICATOR_STATES.error, 'version.error');
      }
    })().finally(() => {
      versionCheckPromise = null;
    });
  }
  return versionCheckPromise;
}

function initVersionIndicator() {
  const indicator = getVersionIndicator();
  if (!indicator) return;
  indicator.addEventListener('click', () => {
    checkVersionStatus();
  });
  checkVersionStatus();
}

function initStorageControls() {
  const pathInput = document.getElementById('storage-path');
  const chooseBtn = document.getElementById('choose-folder');
  const exportBtn = document.getElementById('export-json');
  const importBtn = document.getElementById('import-json');
  const importInput = document.getElementById('import-input');

  pathInput.value = appData.storagePath ? appData.storagePath : '';
  pathInput.addEventListener('input', () => {
    appData.storagePath = pathInput.value;
    saveDataSoon();
  });

  chooseBtn.addEventListener('click', async () => {
    if (!window.showDirectoryPicker) {
      updateStorageStatus('storage.folderUnsupported', 'error');
      return;
    }
    try {
      const handle = await window.showDirectoryPicker();
      const granted = await ensurePermission(handle);
      if (!granted) {
        updateStorageStatus('storage.permissionDenied', 'error');
        return;
      }
      folderHandle = handle;
      await storeFolderHandle(handle);
      appData.storagePath = handle && handle.name ? handle.name : '';
      saveData();
      pathInput.value = appData.storagePath;
      updateStorageStatus('storage.folderSelected', 'success');
    } catch (error) {
      if (!error || error.name !== 'AbortError') {
        console.error(error);
        updateStorageStatus('storage.folderSelectionFailed', 'error');
      }
    }
  });

  document.getElementById('storage-alert-export').addEventListener('click', () => exportBtn.click());
  document.getElementById('storage-alert-close').addEventListener('click', () => {
    storageAlertClosed = true;
    renderStorageAlert();
  });
  checkStorageUsage();

  exportBtn.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(appData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const timestamp = new Date().toISOString().split('T')[0];
    a.download = `mydesk-export-${timestamp}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    updateStorageStatus('storage.exportSuccess', 'success');
  });

  importBtn.addEventListener('click', () => {
    importInput.click();
  });

  importInput.addEventListener('change', async () => {
    const file = importInput.files && importInput.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      appData = {
        ...cloneDefault(),
        ...imported,
        calendar: {
          ...cloneDefault().calendar,
          ...(imported.calendar ? imported.calendar : {})
        },
        mindmap: {
          ...cloneDefault().mindmap,
          ...(imported.mindmap ? imported.mindmap : {})
        },
        todo: {
          ...cloneDefault().todo,
          ...(imported.todo ? imported.todo : {})
        },
        notes: {
          ...cloneDefault().notes,
          ...(imported.notes ? imported.notes : {})
        },
        dailyChallenges: {
          ...cloneDefault().dailyChallenges,
          ...(imported.dailyChallenges ? imported.dailyChallenges : {})
        },
        gantt: {
          ...cloneDefault().gantt,
          ...(imported.gantt ? imported.gantt : {})
        },
        tabs: {
          ...cloneDefault().tabs,
          ...(imported.tabs ? imported.tabs : {})
        }
      };
      migrateData();
      if (appData.calendar.lastWeekStart) {
        currentWeekStart = startOfWeek(new Date(appData.calendar.lastWeekStart));
      } else {
        currentWeekStart = startOfWeek(new Date());
      }
      saveData();
      renderCalendar();
      renderEventTypes();
      renderMindmapList();
      renderMindmap();
      renderNotes();
      renderTodo();
      renderTabVisibilitySettings();
      applyTabVisibility();
      pathInput.value = appData.storagePath ? appData.storagePath : '';
      updateStorageStatus('storage.importSuccess', 'success');
    } catch (error) {
      console.error(error);
      updateStorageStatus('storage.importInvalid', 'error');
    }
    importInput.value = '';
  });
}

async function bootstrap() {
  // Avant initData, qui enregistre les données par défaut.
  const firstVisit = typeof onboardingIsFirstVisit === 'function' && onboardingIsFirstVisit();
  if (typeof registerSyncTranslations === 'function') {
    registerSyncTranslations();
  }
  if (typeof registerIcsTranslations === 'function') {
    registerIcsTranslations();
  }
  if (typeof registerPrintTranslations === 'function') {
    registerPrintTranslations();
  }
  if (typeof registerUndoTranslations === 'function') {
    registerUndoTranslations();
  }
  if (typeof registerSportTranslations === 'function') {
    registerSportTranslations();
  }
  if (typeof registerSnakeTranslations === 'function') {
    registerSnakeTranslations();
  }
  if (typeof registerMenuTranslations === 'function') {
    registerMenuTranslations();
  }
  if (typeof registerAnkiTranslations === 'function') {
    registerAnkiTranslations();
  }
  if (typeof registerRestoreTranslations === 'function') {
    registerRestoreTranslations();
  }
  if (typeof registerConflictTranslations === 'function') {
    registerConflictTranslations();
  }
  if (typeof registerGoalTranslations === 'function') {
    registerGoalTranslations();
  }
  if (typeof registerReminderTranslations === 'function') {
    registerReminderTranslations();
  }
  if (typeof registerInstallTranslations === 'function') {
    registerInstallTranslations();
  }
  if (typeof registerNewsTranslations === 'function') {
    registerNewsTranslations();
  }
  if (typeof registerTabOrderTranslations === 'function') {
    registerTabOrderTranslations();
  }
  if (typeof registerPatchNotesTranslations === 'function') {
    registerPatchNotesTranslations();
  }
  if (typeof registerTodoTranslations === 'function') {
    registerTodoTranslations();
  }
  if (typeof registerOnboardingTranslations === 'function') {
    registerOnboardingTranslations();
  }
  if (typeof registerEcoTranslations === 'function') {
    registerEcoTranslations();
  }
  await initData();
  initAppearance();
  initTabs();
  if (typeof initTabOrder === 'function') {
    initTabOrder();
  }
  initLocalization();
  initSettings();
  initVersionIndicator();
  initStorageControls();
  initCalendar();
  initMindmap();
  initGantt();
  initNotes();
  initDailyChallenges();
  initTodo();
  if (typeof initSnake === 'function') {
    initSnake();
  }
  if (typeof initSync === 'function') {
    initSync();
  }
  if (typeof initIcsImport === 'function') {
    initIcsImport();
  }
  if (typeof initCalendarReminders === 'function') {
    initCalendarReminders();
  }
  if (typeof initSchedulePrint === 'function') {
    initSchedulePrint();
  }
  if (typeof initUndo === 'function') {
    initUndo();
  }
  if (typeof initSport === 'function') {
    initSport();
  }
  if (typeof initMenuTool === 'function') {
    initMenuTool();
  }
  if (typeof initAnki === 'function') {
    initAnki();
  }
  if (typeof initNews === 'function') {
    initNews();
  }
  if (typeof initPatchNotes === 'function') {
    initPatchNotes();
  }
  if (typeof initRestore === 'function') {
    initRestore();
  }
  if (typeof initInstall === 'function') {
    initInstall();
  }
  if (typeof initOnboarding === 'function') {
    initOnboarding(firstVisit);
  }
  if (typeof initEco === 'function') {
    initEco();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    bootstrap().catch((error) => console.error(error));
  });
} else {
  bootstrap().catch((error) => console.error(error));
}
