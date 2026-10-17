/* ═══════════════════════════════════════════════════════════
   SYNCHRONISATION MULTI-APPAREILS (GitHub Gist)
   Les données (appData) sont stockées dans un Gist privé du
   compte GitHub de l'utilisateur. Chaque appareil garde une
   copie de la dernière version synchronisée (« base ») pour
   fusionner élément par élément les modifications locales et
   distantes (fusion à trois voies).
   ═══════════════════════════════════════════════════════════ */

const SYNC_SETTINGS_KEY = 'mydesk-sync';
const SYNC_BASE_KEY = 'mydesk-sync-base';
// v2 : fusion horodatée. Les onglets encore ouverts avec l'ancien code
// continuent d'écrire dans l'ancien fichier, que plus personne ne lit :
// ils ne peuvent plus écraser les données à jour.
const SYNC_FILE_NAME = 'mydesk-sync-v2.json';
const SYNC_LEGACY_FILE_NAME = 'mydesk-sync.json';
const SYNC_API = 'https://api.github.com';
const SYNC_PUSH_DELAY_MS = 2000;
const SYNC_POLL_MS = 30000;
// Données propres à chaque appareil : jamais envoyées ni écrasées.
const SYNC_LOCAL_ONLY_PATHS = [
  'storagePath',
  'calendar.lastWeekStart',
  'mindmap.activeMapId',
  'notes.activePageId',
  'gantt.activeChartId',
  'sport.activeSessionId',
  'snake.settings'
];

const SYNC_TRANSLATIONS = {
  fr: {
    heading: 'Synchronisation entre appareils',
    description: "Synchronisez vos données entre votre téléphone et vos ordinateurs grâce à un Gist privé sur votre compte GitHub (gratuit). Collez le même token sur chaque appareil.",
    step1: 'Créez un token GitHub avec uniquement la permission « gist ».',
    step2: 'Collez-le ci-dessous puis cliquez sur « Connecter ».',
    step3: 'Répétez sur chaque appareil avec le même token.',
    createToken: 'Créer un token GitHub ↗',
    tokenLabel: 'Token GitHub',
    tokenPlaceholder: 'ghp_…',
    connect: 'Connecter',
    syncNow: 'Synchroniser maintenant',
    disconnect: 'Déconnecter',
    connected: 'Synchronisation active.',
    lastSync: 'Dernière synchronisation : {time}',
    never: 'jamais',
    syncing: 'Synchronisation…',
    synced: 'Synchronisé à {time}.',
    offline: 'Hors ligne : la synchronisation reprendra automatiquement.',
    tokenMissing: 'Veuillez coller un token GitHub.',
    errorToken: 'Token GitHub invalide ou expiré.',
    errorRateLimit: 'Limite GitHub atteinte, nouvel essai plus tard.',
    error: 'Synchronisation impossible, nouvel essai plus tard.',
    disconnected: 'Synchronisation désactivée sur cet appareil.',
    firstConnectConfirm: 'Des données existent déjà dans le cloud.\n\nOK : remplacer les données de cet appareil par celles du cloud.\nAnnuler : fusionner les données de cet appareil avec celles du cloud.',
    disconnectConfirm: 'Désactiver la synchronisation sur cet appareil ? Vos données restent sur cet appareil et dans le cloud.'
  },
  en: {
    heading: 'Sync across devices',
    description: 'Sync your data between your phone and computers using a private Gist on your GitHub account (free). Paste the same token on every device.',
    step1: 'Create a GitHub token with only the "gist" permission.',
    step2: 'Paste it below and click "Connect".',
    step3: 'Repeat on every device with the same token.',
    createToken: 'Create a GitHub token ↗',
    tokenLabel: 'GitHub token',
    tokenPlaceholder: 'ghp_…',
    connect: 'Connect',
    syncNow: 'Sync now',
    disconnect: 'Disconnect',
    connected: 'Sync is on.',
    lastSync: 'Last sync: {time}',
    never: 'never',
    syncing: 'Syncing…',
    synced: 'Synced at {time}.',
    offline: 'Offline: sync will resume automatically.',
    tokenMissing: 'Please paste a GitHub token.',
    errorToken: 'Invalid or expired GitHub token.',
    errorRateLimit: 'GitHub rate limit reached, retrying later.',
    error: 'Sync failed, retrying later.',
    disconnected: 'Sync disabled on this device.',
    firstConnectConfirm: 'Data already exists in the cloud.\n\nOK: replace this device\'s data with the cloud data.\nCancel: merge this device\'s data with the cloud data.',
    disconnectConfirm: 'Disable sync on this device? Your data stays on this device and in the cloud.'
  },
  vi: {
    heading: 'Đồng bộ giữa các thiết bị',
    description: 'Đồng bộ dữ liệu giữa điện thoại và máy tính bằng một Gist riêng tư trên tài khoản GitHub của bạn (miễn phí). Dán cùng một token trên mỗi thiết bị.',
    step1: 'Tạo token GitHub chỉ với quyền "gist".',
    step2: 'Dán token bên dưới rồi nhấn "Kết nối".',
    step3: 'Lặp lại trên mỗi thiết bị với cùng token.',
    createToken: 'Tạo token GitHub ↗',
    tokenLabel: 'Token GitHub',
    tokenPlaceholder: 'ghp_…',
    connect: 'Kết nối',
    syncNow: 'Đồng bộ ngay',
    disconnect: 'Ngắt kết nối',
    connected: 'Đồng bộ đang bật.',
    lastSync: 'Lần đồng bộ cuối: {time}',
    never: 'chưa có',
    syncing: 'Đang đồng bộ…',
    synced: 'Đã đồng bộ lúc {time}.',
    offline: 'Ngoại tuyến: đồng bộ sẽ tự động tiếp tục.',
    tokenMissing: 'Vui lòng dán token GitHub.',
    errorToken: 'Token GitHub không hợp lệ hoặc đã hết hạn.',
    errorRateLimit: 'Đã đạt giới hạn GitHub, sẽ thử lại sau.',
    error: 'Không thể đồng bộ, sẽ thử lại sau.',
    disconnected: 'Đã tắt đồng bộ trên thiết bị này.',
    firstConnectConfirm: 'Đã có dữ liệu trên đám mây.\n\nOK: thay dữ liệu của thiết bị này bằng dữ liệu trên đám mây.\nHủy: gộp dữ liệu của thiết bị này với dữ liệu trên đám mây.',
    disconnectConfirm: 'Tắt đồng bộ trên thiết bị này? Dữ liệu vẫn được giữ trên thiết bị và trên đám mây.'
  }
};

let syncSettings = null;
let syncInFlight = null;
let syncQueued = false;
let syncPushTimer = null;
let syncPollTimer = null;
let lastSyncStatus = null;

/* ── Réglages et base locale ───────────────────────────────── */

function registerSyncTranslations() {
  Object.keys(SYNC_TRANSLATIONS).forEach((language) => {
    if (translations[language]) {
      const feed = typeof CALENDAR_FEED_TRANSLATIONS !== 'undefined' ? CALENDAR_FEED_TRANSLATIONS[language] || CALENDAR_FEED_TRANSLATIONS.fr : {};
      translations[language].sync = { ...SYNC_TRANSLATIONS[language], ...feed };
    }
  });
}

function loadSyncSettings() {
  try {
    const raw = localStorage.getItem(SYNC_SETTINGS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function saveSyncSettings() {
  try {
    if (syncSettings) {
      localStorage.setItem(SYNC_SETTINGS_KEY, JSON.stringify(syncSettings));
    } else {
      localStorage.removeItem(SYNC_SETTINGS_KEY);
    }
  } catch (error) {
    console.warn('Impossible de stocker les réglages de synchronisation', error);
  }
  // Jeton ajouté, changé ou retiré : l'onglet Menu suit (menu.js).
  if (typeof menuVerifierAcces === 'function') menuVerifierAcces();
}

function loadSyncBase() {
  try {
    const raw = localStorage.getItem(SYNC_BASE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function saveSyncBase(data) {
  try {
    if (data) {
      localStorage.setItem(SYNC_BASE_KEY, JSON.stringify(data));
    } else {
      localStorage.removeItem(SYNC_BASE_KEY);
    }
  } catch (error) {
    console.warn('Impossible de stocker la base de synchronisation', error);
  }
}

function isSyncEnabled() {
  return Boolean(syncSettings && syncSettings.token);
}

/* ── Fusion à trois voies, horodatée ───────────────────────── */
// Chaque modification faite sur un appareil est datée dans data.syncMeta :
// clé = chemin de la donnée (« calendar.events#<id> » pour un élément de
// liste, « tabs.visibility.notes » pour une valeur), valeur = date en ms.
// À la fusion, un écart par rapport à la dernière synchro (base) ne compte
// comme une modification que s'il est PLUS RÉCENT que ce que la base
// connaissait. Un appareil resté sur un état ancien ne peut donc plus
// effacer, ni remettre à l'ancienne, des données modifiées depuis.

const SYNC_META_KEY = 'syncMeta';
const SYNC_META_MAX_AGE_MS = 180 * 24 * 3600 * 1000;

function syncIsPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function syncStableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map(syncStableStringify).join(',')}]`;
  }
  if (syncIsPlainObject(value)) {
    return `{${Object.keys(value)
      .filter((key) => value[key] !== undefined)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${syncStableStringify(value[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value === undefined ? null : value);
}

function syncEqual(a, b) {
  return syncStableStringify(a) === syncStableStringify(b);
}

function syncIsIdArray(value) {
  return Array.isArray(value) && value.every((item) => syncIsPlainObject(item) && item.id != null);
}

// Deux valeurs à comparer élément par élément (listes d'objets à id ;
// une liste absente d'un côté compte comme vide).
function syncIdArrayPair(a, b) {
  return (Array.isArray(a) || Array.isArray(b)) && (a === undefined || syncIsIdArray(a)) && (b === undefined || syncIsIdArray(b));
}

function syncIndexById(items) {
  return new Map((items || []).map((item) => [String(item.id), item]));
}

// Chemins qui diffèrent entre deux états, à la même granularité que la fusion.
function syncChangedPaths(a, b, path = '', out = []) {
  if (syncEqual(a, b)) return out;
  if (syncIdArrayPair(a, b)) {
    const before = syncIndexById(a);
    const after = syncIndexById(b);
    new Set([...before.keys(), ...after.keys()]).forEach((id) => {
      if (!syncEqual(before.get(id), after.get(id))) out.push(`${path}#${id}`);
    });
    return out;
  }
  if (syncIsPlainObject(a) || syncIsPlainObject(b)) {
    const left = syncIsPlainObject(a) ? a : {};
    const right = syncIsPlainObject(b) ? b : {};
    new Set([...Object.keys(left), ...Object.keys(right)]).forEach((key) => {
      if (!path && key === SYNC_META_KEY) return;
      syncChangedPaths(left[key], right[key], path ? `${path}.${key}` : key, out);
    });
    return out;
  }
  out.push(path);
  return out;
}

function syncMetaOf(data) {
  return syncIsPlainObject(data) && syncIsPlainObject(data[SYNC_META_KEY]) ? data[SYNC_META_KEY] : {};
}

// Date les modifications faites depuis `previousRaw` (dernier état enregistré).
// Appelé par saveData (modification de l'utilisateur) et par Ctrl+Z.
function syncRecordChanges(previousRaw) {
  if (!previousRaw || !syncIsPlainObject(appData)) return;
  let previous;
  try {
    previous = JSON.parse(previousRaw);
  } catch (error) {
    return;
  }
  const paths = syncChangedPaths(syncExtractData(previous), syncExtractData(appData));
  if (!paths.length) return;
  const now = Date.now();
  const meta = { ...syncMetaOf(appData) };
  paths.forEach((path) => {
    meta[path] = now;
  });
  // Purge des dates de plus de 6 mois (les dates de départ, à 1, restent).
  Object.keys(meta).forEach((key) => {
    if (meta[key] > 1 && now - meta[key] > SYNC_META_MAX_AGE_MS) delete meta[key];
  });
  appData[SYNC_META_KEY] = meta;
}

// Première utilisation : tout ce qui existe reçoit une date minimale. Un
// élément qui manque ensuite sans suppression datée est un état périmé.
function syncSeedMeta() {
  if (!syncIsPlainObject(appData) || syncIsPlainObject(appData[SYNC_META_KEY])) return;
  const meta = {};
  syncChangedPaths({}, syncExtractData(appData)).forEach((path) => {
    meta[path] = 1;
  });
  appData[SYNC_META_KEY] = meta;
}

function syncStripMeta(data) {
  if (!syncIsPlainObject(data)) return data;
  const copy = { ...data };
  delete copy[SYNC_META_KEY];
  return copy;
}

function syncMergeData(base, local, remote) {
  const meta = { b: syncMetaOf(base), l: syncMetaOf(local), r: syncMetaOf(remote), reassert: [] };
  const merged = syncMerge(syncStripMeta(base), syncStripMeta(local), syncStripMeta(remote), '', meta);
  if (!syncIsPlainObject(merged)) return merged;
  const mergedMeta = { ...meta.l };
  Object.keys(meta.r).forEach((key) => {
    if (!(mergedMeta[key] >= meta.r[key])) mergedMeta[key] = meta.r[key];
  });
  const now = Date.now();
  meta.reassert.forEach((key) => {
    mergedMeta[key] = now;
  });
  merged[SYNC_META_KEY] = mergedMeta;
  return merged;
}

function syncMerge(base, local, remote, path, meta = { b: {}, l: {}, r: {}, reassert: [] }) {
  if (syncEqual(local, remote)) return local;
  if (syncIdArrayPair(local, remote)) {
    return syncMergeIdArray(syncIsIdArray(base) ? base : [], local || [], remote || [], path, meta);
  }
  if (syncIsPlainObject(local) || syncIsPlainObject(remote)) {
    if ((local === undefined || syncIsPlainObject(local)) && (remote === undefined || syncIsPlainObject(remote))) {
      const baseObject = syncIsPlainObject(base) ? base : {};
      const left = local || {};
      const right = remote || {};
      const result = {};
      new Set([...Object.keys(left), ...Object.keys(right)]).forEach((key) => {
        const merged = syncMerge(baseObject[key], left[key], right[key], path ? `${path}.${key}` : key, meta);
        if (merged !== undefined) result[key] = merged;
      });
      return result;
    }
  }
  return syncMergeLeaf(base, local, remote, path, meta);
}

// Un écart avec la base n'est une vraie modification que s'il a été daté
// par saveData APRÈS la base. Sans date réelle (absente, ou date de départ
// à 1), ce n'est jamais une modification : c'est un état périmé, et c'est
// la version du cloud qui l'emporte. (Le 30/09, un appareil dont la
// dernière synchro datait d'avant l'horodatage a ainsi effacé des cartes.)
function syncIsFresh(key, side, meta) {
  return (side[key] || 0) > Math.max(meta.b[key] || 0, 1);
}

function syncMergeLeaf(base, local, remote, key, meta) {
  const localChanged = !syncEqual(base, local);
  const remoteChanged = !syncEqual(base, remote);
  if (!localChanged) {
    if (syncIsFresh(key, meta.r, meta)) return remote;
    // Le cloud a changé sans modification datée : écrit par un appareil
    // périmé. On garde notre version et on la date, pour que les autres
    // appareils la reprennent (le cloud se répare tout seul).
    meta.reassert.push(key);
    return local;
  }
  const localFresh = syncIsFresh(key, meta.l, meta);
  if (!remoteChanged) return localFresh ? local : remote;
  // Records, compteurs et défis du jour Snake : on garde le plus grand.
  if (key === 'snake.bestScore' || /^snake\.(best|stats|daily)\./.test(key)) return Math.max(Number(local) || 0, Number(remote) || 0);
  const remoteFresh = syncIsFresh(key, meta.r, meta);
  if (localFresh !== remoteFresh) return localFresh ? local : remote;
  if (!localFresh) return remote; // aucun des deux n'est une vraie modification : le cloud fait foi
  return (meta.l[key] || 0) >= (meta.r[key] || 0) ? local : remote;
}

function syncMergeIdArray(base, local, remote, path, meta) {
  const baseMap = syncIndexById(base);
  const localMap = syncIndexById(local);
  const remoteMap = syncIndexById(remote);

  // Ordre local, avec les éléments seulement distants insérés après leur voisin.
  const order = local.map((item) => String(item.id));
  remote.forEach((item, position) => {
    const id = String(item.id);
    if (order.includes(id)) return;
    if (position === 0) {
      order.unshift(id);
      return;
    }
    const previousIndex = order.indexOf(String(remote[position - 1].id));
    if (previousIndex === -1) {
      order.push(id);
    } else {
      order.splice(previousIndex + 1, 0, id);
    }
  });
  // Éléments connus de la base mais absents des deux côtés : supprimés partout.

  const result = [];
  order.forEach((id) => {
    const merged = syncMergeLeaf(baseMap.get(id), localMap.get(id), remoteMap.get(id), `${path}#${id}`, meta);
    if (merged !== undefined) result.push(merged);
  });
  return result;
}

/* ── Extraction / application des données ──────────────────── */

function syncGetPath(object, path) {
  return path.split('.').reduce((acc, part) => (syncIsPlainObject(acc) ? acc[part] : undefined), object);
}

function syncSetPath(object, path, value) {
  const parts = path.split('.');
  const last = parts.pop();
  const parent = parts.reduce((acc, part) => (syncIsPlainObject(acc) ? acc[part] : undefined), object);
  if (!syncIsPlainObject(parent)) return;
  if (value === undefined) {
    delete parent[last];
  } else {
    parent[last] = value;
  }
}

function syncExtractData(data) {
  const copy = JSON.parse(JSON.stringify(data));
  SYNC_LOCAL_ONLY_PATHS.forEach((path) => syncSetPath(copy, path, undefined));
  return copy;
}

function syncApplyData(data) {
  const localOnly = SYNC_LOCAL_ONLY_PATHS.map((path) => [path, syncGetPath(appData, path)]);
  const incoming = JSON.parse(JSON.stringify(data));
  const defaults = cloneDefault();
  appData = { ...defaults, ...incoming };
  Object.keys(defaults).forEach((key) => {
    if (syncIsPlainObject(defaults[key]) && syncIsPlainObject(incoming[key])) {
      appData[key] = { ...defaults[key], ...incoming[key] };
    }
  });
  localOnly.forEach(([path, value]) => syncSetPath(appData, path, value));
  migrateData();
  persistToLocalStorage();
  scheduleFileSave();
  renderAllViews();
  if (typeof resetUndoBaseline === 'function') {
    resetUndoBaseline();
  }
}

/* ── API GitHub ────────────────────────────────────────────── */

async function syncRequest(path, options = {}) {
  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${syncSettings.token}`
  };
  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }
  const response = await fetch(`${SYNC_API}${path}`, { ...options, headers, cache: 'no-store' });
  if (!response.ok) {
    const error = new Error(`GitHub API ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return response.status === 204 ? null : response.json();
}

async function syncFindOrCreateGist() {
  for (let page = 1; page <= 10; page += 1) {
    const gists = await syncRequest(`/gists?per_page=100&page=${page}`);
    const found = gists.find((gist) => gist.files && (gist.files[SYNC_FILE_NAME] || gist.files[SYNC_LEGACY_FILE_NAME]));
    if (found) return found.id;
    if (gists.length < 100) break;
  }
  const created = await syncRequest('/gists', {
    method: 'POST',
    body: JSON.stringify({
      description: 'MyDesk Online – données synchronisées (ne pas supprimer)',
      public: false,
      files: { [SYNC_FILE_NAME]: { content: JSON.stringify({ version: 2, data: null }) } }
    })
  });
  return created.id;
}

async function syncReadRemote() {
  const gist = await syncRequest(`/gists/${syncSettings.gistId}`);
  // Pour le lien de l'agenda publié (calendar-feed.js).
  const owner = gist.owner && gist.owner.login ? gist.owner.login : null;
  const feedOnRemote = Boolean(gist.files && typeof FEED_FILE_NAME !== 'undefined' && gist.files[FEED_FILE_NAME]);
  if (owner !== syncSettings.gistOwner || feedOnRemote !== Boolean(syncSettings.feedOnRemote)) {
    syncSettings.gistOwner = owner;
    syncSettings.feedOnRemote = feedOnRemote;
    saveSyncSettings();
  }
  // Premier passage en v2 : on repart de l'ancien fichier.
  const file = gist.files && (gist.files[SYNC_FILE_NAME] || gist.files[SYNC_LEGACY_FILE_NAME]);
  if (!file) return null;
  let content = file.content;
  if (file.truncated && file.raw_url) {
    const response = await fetch(file.raw_url, { cache: 'no-store' });
    if (!response.ok) {
      const error = new Error(`Gist raw ${response.status}`);
      error.status = response.status;
      throw error;
    }
    content = await response.text();
  }
  const payload = content ? JSON.parse(content) : null;
  return payload && syncIsPlainObject(payload.data) ? payload.data : null;
}

// data null : seuls les fichiers annexes (agenda .ics) sont envoyés.
async function syncWriteRemote(data, extraFiles = {}) {
  const files = { ...extraFiles };
  if (data) {
    const payload = { version: 2, updatedAt: new Date().toISOString(), data };
    files[SYNC_FILE_NAME] = { content: JSON.stringify(payload, null, 2) };
  }
  if (!Object.keys(files).length) return;
  await syncRequest(`/gists/${syncSettings.gistId}`, {
    method: 'PATCH',
    body: JSON.stringify({ files })
  });
}

/* ── Cycle de synchronisation ──────────────────────────────── */

function syncUserIsEditing() {
  if (document.querySelector('.modal:not([hidden])')) return true;
  if (typeof calendarIsDragging === 'function' && calendarIsDragging()) return true;
  const element = document.activeElement;
  if (!element || element === document.body) return false;
  if (element.closest && element.closest('#sync-panel')) return false;
  if (element.tagName === 'IFRAME') {
    try {
      const inner = element.contentDocument && element.contentDocument.activeElement;
      return Boolean(inner && (inner.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(inner.tagName)));
    } catch (error) {
      return false;
    }
  }
  if (element.isContentEditable) return true;
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName);
}

async function syncRun({ manual = false, firstConnect = false } = {}) {
  if (!isSyncEnabled()) return;
  if (typeof flushPendingSave === 'function') flushPendingSave(); // dates de modification à jour
  if (syncInFlight) {
    syncQueued = true;
    return;
  }
  if (!manual && syncUserIsEditing()) return; // relancé à la sortie du champ
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    updateSyncStatus('sync.offline', 'info');
    return;
  }

  // Un seul onglet synchronise à la fois (les autres attendent leur tour).
  const withLock = (task) =>
    typeof navigator !== 'undefined' && navigator.locks && navigator.locks.request
      ? navigator.locks.request('mydesk-sync', task)
      : task();
  syncInFlight = withLock(async () => {
    updateSyncStatus('sync.syncing', 'info');
    try {
      if (!syncSettings.gistId) {
        syncSettings.gistId = await syncFindOrCreateGist();
        saveSyncSettings();
      }
      let remote;
      try {
        remote = await syncReadRemote();
      } catch (error) {
        if (error.status !== 404) throw error;
        // Gist supprimé : on en retrouve ou recrée un.
        syncSettings.gistId = await syncFindOrCreateGist();
        saveSyncSettings();
        remote = await syncReadRemote();
      }

      // Données enregistrées par un autre onglet : on les reprend d'abord,
      // pour que « local » corresponde bien à la base partagée.
      if (typeof adoptDataFromOtherTab === 'function') adoptDataFromOtherTab();
      const base = loadSyncBase();
      const local = syncExtractData(appData);
      let merged;
      if (!remote) {
        merged = local;
      } else if (firstConnect && !base && window.confirm(t('sync.firstConnectConfirm'))) {
        merged = remote;
      } else {
        merged = syncMergeData(base, local, remote);
      }

      if (!syncEqual(merged, local)) {
        if (!syncEqual(syncExtractData(appData), local)) {
          // L'utilisateur a modifié les données pendant la requête : on recommence.
          syncQueued = true;
          return;
        }
        syncApplyData(merged);
        merged = syncExtractData(appData);
      }
      const dataChanged = !remote || !syncEqual(merged, remote);
      const feed = typeof feedPendingFiles === 'function' ? feedPendingFiles(merged) : { files: {}, hash: null };
      const feedChanged = Object.keys(feed.files).length > 0;
      if (dataChanged || feedChanged) {
        await syncWriteRemote(dataChanged ? merged : null, feed.files);
      }
      if (feedChanged) {
        syncSettings.feedHash = feed.hash;
        syncSettings.feedOnRemote = Boolean(feed.hash);
      }
      saveSyncBase(merged);
      syncSettings.lastSyncAt = new Date().toISOString();
      saveSyncSettings();
      updateSyncStatus('sync.synced', 'success', { time: formatTime(new Date()) });
      renderSyncPanel();
    } catch (error) {
      console.error('Synchronisation impossible', error);
      if (error.status === 401) {
        updateSyncStatus('sync.errorToken', 'error');
      } else if (error.status === 403 || error.status === 429) {
        updateSyncStatus('sync.errorRateLimit', 'error');
      } else {
        updateSyncStatus('sync.error', 'error');
      }
    }
  });

  try {
    await syncInFlight;
  } finally {
    syncInFlight = null;
    if (syncQueued) {
      syncQueued = false;
      scheduleSyncPush();
    }
  }
}

function scheduleSyncPush() {
  if (!isSyncEnabled()) return;
  if (syncPushTimer) {
    clearTimeout(syncPushTimer);
  }
  syncPushTimer = setTimeout(() => {
    syncPushTimer = null;
    syncRun();
  }, SYNC_PUSH_DELAY_MS);
}

// Appelé par saveData() à chaque modification locale.
function onLocalDataChanged() {
  scheduleSyncPush();
}

/* ── Interface ─────────────────────────────────────────────── */

function updateSyncStatus(messageKey, type = 'info', variables = {}) {
  lastSyncStatus = { messageKey, type, variables };
  const status = document.getElementById('sync-status');
  if (!status) return;
  status.textContent = t(messageKey, variables);
  status.className = `storage-status ${type}`;
}

function renderSyncPanel() {
  const disconnected = document.getElementById('sync-disconnected');
  const connected = document.getElementById('sync-connected');
  const info = document.getElementById('sync-info');
  if (!disconnected || !connected) return;
  const enabled = isSyncEnabled();
  disconnected.hidden = enabled;
  connected.hidden = !enabled;
  if (info && enabled) {
    const last = syncSettings.lastSyncAt ? new Date(syncSettings.lastSyncAt) : null;
    const time = last
      ? `${formatDate(last, { weekday: 'short' })} ${formatTime(last)}`
      : t('sync.never');
    info.textContent = `${t('sync.connected')} ${t('sync.lastSync', { time })}`;
  }
  if (enabled && typeof renderFeedPanel === 'function') renderFeedPanel();
}

function initSync() {
  syncSettings = loadSyncSettings();
  syncSeedMeta();

  const tokenInput = document.getElementById('sync-token');
  const connectBtn = document.getElementById('sync-connect');
  const syncNowBtn = document.getElementById('sync-now');
  const disconnectBtn = document.getElementById('sync-disconnect');
  const languageSelect = document.getElementById('language-select');

  connectBtn.addEventListener('click', async () => {
    const token = tokenInput.value.trim();
    if (!token) {
      updateSyncStatus('sync.tokenMissing', 'error');
      return;
    }
    syncSettings = { token, gistId: null, lastSyncAt: null };
    saveSyncBase(null);
    saveSyncSettings();
    tokenInput.value = '';
    renderSyncPanel();
    await syncRun({ manual: true, firstConnect: true });
    if (lastSyncStatus && lastSyncStatus.messageKey === 'sync.errorToken') {
      syncSettings = null;
      saveSyncSettings();
      renderSyncPanel();
    }
  });

  syncNowBtn.addEventListener('click', () => syncRun({ manual: true }));

  disconnectBtn.addEventListener('click', () => {
    if (!window.confirm(t('sync.disconnectConfirm'))) return;
    syncSettings = null;
    saveSyncSettings();
    saveSyncBase(null);
    renderSyncPanel();
    updateSyncStatus('sync.disconnected', 'info');
  });

  if (languageSelect) {
    languageSelect.addEventListener('change', () => {
      renderSyncPanel();
      if (lastSyncStatus) {
        updateSyncStatus(lastSyncStatus.messageKey, lastSyncStatus.type, lastSyncStatus.variables);
      }
    });
  }

  document.addEventListener('visibilitychange', () => {
    syncRun();
  });
  window.addEventListener('online', () => syncRun());
  document.addEventListener('focusout', () => {
    // Laisse le focus se déplacer avant de vérifier si l'utilisateur édite encore.
    setTimeout(() => {
      if (!syncUserIsEditing()) scheduleSyncPush();
    }, 0);
  });
  syncPollTimer = setInterval(() => {
    if (document.visibilityState === 'visible') {
      syncRun();
    }
  }, SYNC_POLL_MS);

  renderSyncPanel();
  syncRun();
}
