/* ═══════════════════════════════════════════════════════════
   HISTORIQUE : restaurer depuis une ancienne synchro
   GitHub garde chaque version du Gist. On choisit une version,
   on voit ce qui a disparu ou changé depuis, et on coche ce qu'on
   veut récupérer :
   - éléments absents aujourd'hui : cochés par défaut (rajoutés) ;
   - éléments modifiés depuis : décochés par défaut (remettre
     l'ancienne version écraserait des changements plus récents).
   Rien d'autre n'est touché. Ctrl+Z annule (sauf les Révisions,
   qui ne font que rajouter ce qui manque).
   ═══════════════════════════════════════════════════════════ */

const RESTORE_TRANSLATIONS = {
  fr: {
    open: '🕘 Historique / restaurer',
    title: 'Historique des synchros',
    help: 'Choisis une version d’avant le problème. Tu verras ce qui manque ou a changé depuis, et tu coches ce que tu veux récupérer.',
    loading: 'Chargement…',
    error: 'Lecture de l’historique impossible : {error}',
    needSync: 'La synchronisation doit être activée pour lire l’historique.',
    lines: '+{add} / −{del} lignes',
    bigDelete: 'grosse suppression',
    see: 'Voir',
    back: '← Versions',
    close: 'Fermer',
    nothing: 'Rien à récupérer : cette version ne contient rien qui manque ou diffère aujourd’hui.',
    absent: 'absent aujourd’hui',
    changed: 'modifié depuis',
    today: 'aujourd’hui : {label}',
    restore: 'Restaurer la sélection ({count})',
    done: '{count} élément(s) restauré(s). Ctrl+Z pour annuler.',
    secCalendar: 'Agenda',
    secTypes: 'Types d’évènements',
    secNotes: 'Notes',
    secTodo: 'To-do',
    secDaily: 'Défis quotidiens',
    secMindmap: 'Cartes mentales',
    secGantt: 'GANTT',
    secSport: 'Sport',
    secAnki: 'Révisions',
    secTabs: 'Onglets visibles',
    ankiItem: '{notes} note(s), {cards} carte(s), {reviews} révision(s) absentes aujourd’hui',
    tabShown: 'Onglet « {name} » : affiché',
    tabHidden: 'Onglet « {name} » : masqué'
  },
  en: {
    open: '🕘 History / restore',
    title: 'Sync history',
    help: 'Pick a version from before the problem. You will see what is missing or changed since, and tick what you want back.',
    loading: 'Loading…',
    error: 'Could not read the history: {error}',
    needSync: 'Sync must be enabled to read the history.',
    lines: '+{add} / −{del} lines',
    bigDelete: 'large deletion',
    see: 'View',
    back: '← Versions',
    close: 'Close',
    nothing: 'Nothing to recover: this version has nothing missing or different today.',
    absent: 'missing today',
    changed: 'changed since',
    today: 'today: {label}',
    restore: 'Restore selection ({count})',
    done: '{count} item(s) restored. Ctrl+Z to undo.',
    secCalendar: 'Calendar',
    secTypes: 'Event types',
    secNotes: 'Notes',
    secTodo: 'To-do',
    secDaily: 'Daily challenges',
    secMindmap: 'Mind maps',
    secGantt: 'GANTT',
    secSport: 'Sport',
    secAnki: 'Flashcards',
    secTabs: 'Visible tabs',
    ankiItem: '{notes} note(s), {cards} card(s), {reviews} review(s) missing today',
    tabShown: 'Tab "{name}": shown',
    tabHidden: 'Tab "{name}": hidden'
  }
};

const RESTORE_BIG_DELETE = 100; // lignes supprimées d'un coup : à signaler

function restoreEventLabel(event) {
  const start = event.start ? new Date(event.start) : null;
  const when = start && !Number.isNaN(start.getTime())
    ? start.toLocaleString(getCurrentLocale(), { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : '';
  const weekly = event.recurrence === 'weekly' ? ' ↻' : '';
  return `${event.title || '—'}${when ? ` · ${when}` : ''}${weekly}`;
}

const RESTORE_SECTIONS = [
  { path: 'calendar.events', key: 'secCalendar', label: restoreEventLabel },
  { path: 'calendar.types', key: 'secTypes', label: (item) => item.name || '—' },
  { path: 'notes.pages', key: 'secNotes', label: (item) => item.name || '—' },
  { path: 'todo.blocks', key: 'secTodo', label: (item) => item.title || '—' },
  { path: 'dailyChallenges.challenges', key: 'secDaily', label: (item) => item.name || '—' },
  { path: 'mindmap.maps', key: 'secMindmap', label: (item) => item.name || '—' },
  { path: 'gantt.charts', key: 'secGantt', label: (item) => item.name || '—' },
  { path: 'sport.sessions', key: 'secSport', label: (item) => item.name || '—' }
];

const RESTORE_ANKI_COLLECTIONS = ['decks', 'notes', 'cards', 'revlog', 'tags'];

let restoreModal = null;

function registerRestoreTranslations() {
  Object.keys(translations).forEach((language) => {
    translations[language].restore = RESTORE_TRANSLATIONS[language] || RESTORE_TRANSLATIONS.fr;
  });
}

function restoreEl(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined && text !== null) el.textContent = text;
  return el;
}

/* ── Lecture de l'historique ───────────────────────────────── */

async function restoreReadVersion(sha) {
  const gist = await syncRequest(`/gists/${syncSettings.gistId}/${sha}`);
  const file = gist.files && (gist.files[SYNC_FILE_NAME] || gist.files[SYNC_LEGACY_FILE_NAME]);
  if (!file) return null;
  let content = file.content;
  if (file.truncated && file.raw_url) content = await (await fetch(file.raw_url, { cache: 'no-store' })).text();
  const payload = JSON.parse(content);
  return payload && syncIsPlainObject(payload.data) ? payload.data : null;
}

/* ── Différences avec aujourd'hui ──────────────────────────── */

function restoreDiff(version) {
  const items = [];
  RESTORE_SECTIONS.forEach((section) => {
    const old = syncGetPath(version, section.path);
    if (!Array.isArray(old)) return;
    const now = syncGetPath(appData, section.path);
    const nowById = new Map((Array.isArray(now) ? now : []).filter((x) => x && x.id != null).map((x) => [String(x.id), x]));
    old.forEach((item, index) => {
      if (!item || item.id == null) return;
      const current = nowById.get(String(item.id));
      if (!current) {
        items.push({ kind: 'absent', section, item, index, checked: true });
      } else if (!syncEqual(current, item)) {
        items.push({ kind: 'changed', section, item, current, checked: false });
      }
    });
  });

  // Révisions : on ne propose que de rajouter ce qui manque.
  const oldAnki = syncIsPlainObject(version.anki) ? version.anki : null;
  if (oldAnki && syncIsPlainObject(appData.anki)) {
    const missing = {};
    RESTORE_ANKI_COLLECTIONS.forEach((collection) => {
      const have = new Set((appData.anki[collection] || []).map((x) => x.id));
      missing[collection] = (oldAnki[collection] || []).filter((x) => x && !have.has(x.id));
    });
    if (missing.notes.length || missing.cards.length || missing.revlog.length || missing.decks.length) {
      items.push({ kind: 'anki', missing, checked: true });
    }
  }

  // Onglets visibles.
  const oldTabs = version.tabs && version.tabs.visibility;
  const nowTabs = appData.tabs && appData.tabs.visibility;
  if (syncIsPlainObject(oldTabs) && syncIsPlainObject(nowTabs)) {
    OPTIONAL_TABS.forEach((tab) => {
      if (typeof oldTabs[tab.id] === 'boolean' && oldTabs[tab.id] !== nowTabs[tab.id]) {
        items.push({ kind: 'tab', tab, value: oldTabs[tab.id], checked: false });
      }
    });
  }
  return items;
}

function restoreApply(items) {
  const chosen = items.filter((item) => item.checked);
  if (!chosen.length) return 0;
  chosen.forEach((entry) => {
    if (entry.kind === 'anki') {
      RESTORE_ANKI_COLLECTIONS.forEach((collection) => {
        if (!Array.isArray(appData.anki[collection])) appData.anki[collection] = [];
        entry.missing[collection].forEach((x) => appData.anki[collection].push(JSON.parse(JSON.stringify(x))));
      });
    } else if (entry.kind === 'tab') {
      appData.tabs.visibility[entry.tab.id] = entry.value;
    } else {
      const list = syncGetPath(appData, entry.section.path);
      if (!Array.isArray(list)) return;
      const copy = JSON.parse(JSON.stringify(entry.item));
      if (entry.kind === 'absent') {
        list.splice(Math.min(entry.index, list.length), 0, copy);
      } else {
        const index = list.findIndex((x) => x && String(x.id) === String(entry.item.id));
        if (index !== -1) list[index] = copy;
      }
    }
  });
  migrateData();
  saveData();
  renderAllViews();
  return chosen.length;
}

/* ── Fenêtre ───────────────────────────────────────────────── */

function restoreClose() {
  if (restoreModal) restoreModal.remove();
  restoreModal = null;
}

function restoreOpen() {
  restoreClose();
  restoreModal = restoreEl('div', 'modal restore-modal');
  restoreModal.setAttribute('role', 'dialog');
  restoreModal.setAttribute('aria-modal', 'true');
  const content = restoreEl('div', 'modal-content restore-content');
  restoreModal.appendChild(content);
  restoreModal.addEventListener('click', (event) => {
    if (event.target === restoreModal) restoreClose();
  });
  document.body.appendChild(restoreModal);
  restoreShowVersions(content);
}

function restoreHeader(content, withBack) {
  content.innerHTML = '';
  const head = restoreEl('div', 'restore-head');
  head.appendChild(restoreEl('h3', '', t('restore.title')));
  const close = restoreEl('button', 'btn-secondary', t('restore.close'));
  close.type = 'button';
  close.addEventListener('click', restoreClose);
  head.appendChild(close);
  content.appendChild(head);
  if (withBack) {
    const back = restoreEl('button', 'restore-link', t('restore.back'));
    back.type = 'button';
    back.addEventListener('click', () => restoreShowVersions(content));
    content.appendChild(back);
  }
}

async function restoreShowVersions(content) {
  restoreHeader(content, false);
  content.appendChild(restoreEl('p', 'restore-hint', t('restore.help')));
  if (!isSyncEnabled() || !syncSettings.gistId) {
    content.appendChild(restoreEl('p', 'restore-error', t('restore.needSync')));
    return;
  }
  const status = restoreEl('p', 'restore-hint', t('restore.loading'));
  content.appendChild(status);
  let commits;
  try {
    commits = await syncRequest(`/gists/${syncSettings.gistId}/commits?per_page=100`);
  } catch (error) {
    status.textContent = t('restore.error', { error: error.message || String(error) });
    return;
  }
  status.remove();
  const list = restoreEl('div', 'restore-list');
  commits.forEach((commit) => {
    const changes = commit.change_status || {};
    const row = restoreEl('div', 'restore-row');
    const info = restoreEl('div', 'restore-row__info');
    const date = new Date(commit.committed_at).toLocaleString(getCurrentLocale(), { dateStyle: 'medium', timeStyle: 'short' });
    info.appendChild(restoreEl('strong', '', date));
    if (changes.total) {
      const lines = restoreEl('span', 'restore-row__lines', t('restore.lines', { add: changes.additions || 0, del: changes.deletions || 0 }));
      info.appendChild(lines);
      if ((changes.deletions || 0) >= RESTORE_BIG_DELETE) info.appendChild(restoreEl('span', 'restore-badge', t('restore.bigDelete')));
    }
    const see = restoreEl('button', 'btn-secondary', t('restore.see'));
    see.type = 'button';
    see.addEventListener('click', () => restoreShowVersion(content, commit, date));
    row.append(info, see);
    list.appendChild(row);
  });
  content.appendChild(list);
}

async function restoreShowVersion(content, commit, date) {
  restoreHeader(content, true);
  content.appendChild(restoreEl('p', 'restore-version', date));
  const status = restoreEl('p', 'restore-hint', t('restore.loading'));
  content.appendChild(status);
  let version;
  try {
    version = await restoreReadVersion(commit.version);
  } catch (error) {
    status.textContent = t('restore.error', { error: error.message || String(error) });
    return;
  }
  status.remove();
  const items = version ? restoreDiff(version) : [];
  if (!items.length) {
    content.appendChild(restoreEl('p', 'restore-hint', t('restore.nothing')));
    return;
  }

  const submit = restoreEl('button', '', '');
  submit.type = 'button';
  const refresh = () => {
    const count = items.filter((item) => item.checked).length;
    submit.textContent = t('restore.restore', { count });
    submit.disabled = count === 0;
  };

  const groups = new Map();
  items.forEach((entry) => {
    const key = entry.kind === 'anki' ? 'secAnki' : entry.kind === 'tab' ? 'secTabs' : entry.section.key;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(entry);
  });
  const list = restoreEl('div', 'restore-items');
  groups.forEach((entries, key) => {
    list.appendChild(restoreEl('h4', '', t(`restore.${key}`)));
    entries.forEach((entry) => {
      const label = restoreEl('label', 'restore-item');
      const box = restoreEl('input');
      box.type = 'checkbox';
      box.checked = entry.checked;
      box.addEventListener('change', () => {
        entry.checked = box.checked;
        refresh();
      });
      const text = restoreEl('span', 'restore-item__text');
      if (entry.kind === 'anki') {
        text.appendChild(restoreEl('span', '', t('restore.ankiItem', {
          notes: entry.missing.notes.length,
          cards: entry.missing.cards.length,
          reviews: entry.missing.revlog.length
        })));
      } else if (entry.kind === 'tab') {
        text.appendChild(restoreEl('span', '', t(entry.value ? 'restore.tabShown' : 'restore.tabHidden', { name: t(entry.tab.labelKey) })));
      } else {
        text.appendChild(restoreEl('span', '', entry.section.label(entry.item)));
        text.appendChild(restoreEl('span', `restore-tag restore-tag--${entry.kind}`, t(`restore.${entry.kind}`)));
        if (entry.kind === 'changed') {
          const before = entry.section.label(entry.item);
          const now = entry.section.label(entry.current);
          if (now !== before) text.appendChild(restoreEl('span', 'restore-item__now', t('restore.today', { label: now })));
        }
      }
      label.append(box, text);
      list.appendChild(label);
    });
  });
  content.appendChild(list);

  const actions = restoreEl('div', 'modal-actions');
  submit.addEventListener('click', () => {
    const count = restoreApply(items);
    restoreClose();
    if (count) updateSyncStatus('restore.done', 'success', { count });
  });
  actions.appendChild(submit);
  content.appendChild(actions);
  refresh();
}

function initRestore() {
  const button = document.getElementById('sync-history');
  if (button) button.addEventListener('click', restoreOpen);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && restoreModal) restoreClose();
  });
}
