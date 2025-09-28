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
  }
};

const DEFAULT_EVENT_COLOR = '#10b981';
const MIN_EVENT_DURATION = 15;
const EVENT_DURATION_STEP = 15;
const CALENDAR_START_HOUR = 7;
const CALENDAR_END_HOUR = 22;
const CALENDAR_END_MINUTE = (CALENDAR_END_HOUR + 1) * 60;

let appData = cloneDefault();
let currentWeekStart = startOfWeek(new Date());
let calendarCellMap = new Map();
let dayOverlayMap = new Map();
let selectedNodeId = null;
let linkMode = false;
let linkSourceId = null;
let folderHandle = null;
let handleDBPromise = null;
let saveTimer = null;
let calendarHourHeight = 48;
let resizeState = null;

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
  return date.toLocaleDateString('fr-FR', formatOptions);
}

function formatTime(date) {
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
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

function loadFromLocalStorage() {
  const raw = localStorage.getItem(DATA_KEY);
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

function persistToLocalStorage() {
  localStorage.setItem(DATA_KEY, JSON.stringify(appData));
}

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
      updateStorageStatus('Données enregistrées sur le disque.', 'success');
    } catch (error) {
      console.error('Écriture du fichier impossible', error);
      updateStorageStatus("Impossible d'enregistrer le fichier de données.", 'error');
    }
  }, 600);
}

function saveData() {
  persistToLocalStorage();
  scheduleFileSave();
}

function migrateData() {
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
      name: type && type.name ? type.name : `Type ${index + 1}`,
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
          name: 'Carte 1',
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
            title: node && node.title ? node.title : `Idée ${nodeIndex + 1}`,
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
      name: map && map.name ? map.name : `Carte ${index + 1}`,
      nodes,
      links
    };
  });

  if (appData.mindmap.maps.length === 0) {
    const fallbackId = uid();
    appData.mindmap.maps.push({ id: fallbackId, name: 'Carte 1', nodes: [], links: [] });
    appData.mindmap.activeMapId = fallbackId;
  }

  if (!appData.mindmap.activeMapId || !appData.mindmap.maps.some((map) => map.id === appData.mindmap.activeMapId)) {
    appData.mindmap.activeMapId = appData.mindmap.maps[0].id;
  }
}

function updateStorageStatus(message, type = 'info') {
  const status = document.getElementById('storage-status');
  if (!status) return;
  status.textContent = message;
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
      }
    };
    updateStorageStatus('Données chargées depuis le disque.', 'success');
  } else {
    updateStorageStatus('Données chargées depuis le navigateur.', 'info');
  }
  migrateData();
  if (appData.calendar.lastWeekStart) {
    currentWeekStart = startOfWeek(new Date(appData.calendar.lastWeekStart));
  }
}

function initTabs() {
  const links = Array.from(document.querySelectorAll('.tab-link'));
  links.forEach((link) => {
    link.addEventListener('click', () => {
      links.forEach((l) => l.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach((panel) => panel.classList.remove('active'));
      link.classList.add('active');
      document.getElementById(link.dataset.target).classList.add('active');
    });
  });
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
    saveData();
  });

  chooseBtn.addEventListener('click', async () => {
    if (!window.showDirectoryPicker) {
      updateStorageStatus("Votre navigateur ne permet pas la sélection de dossier.", 'error');
      return;
    }
    try {
      const handle = await window.showDirectoryPicker();
      const granted = await ensurePermission(handle);
      if (!granted) {
        updateStorageStatus("Permission refusée pour accéder au dossier.", 'error');
        return;
      }
      folderHandle = handle;
      await storeFolderHandle(handle);
      appData.storagePath = handle && handle.name ? handle.name : '';
      saveData();
      pathInput.value = appData.storagePath;
      updateStorageStatus('Dossier de sauvegarde sélectionné.', 'success');
    } catch (error) {
      if (!error || error.name !== 'AbortError') {
        console.error(error);
        updateStorageStatus("Sélection du dossier annulée ou impossible.", 'error');
      }
    }
  });

  exportBtn.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(appData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const timestamp = new Date().toISOString().split('T')[0];
    a.download = `mydesk-export-${timestamp}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    updateStorageStatus('Export JSON généré.', 'success');
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
      renderTodo();
      pathInput.value = appData.storagePath ? appData.storagePath : '';
      updateStorageStatus('Données importées avec succès.', 'success');
    } catch (error) {
      console.error(error);
      updateStorageStatus("Le fichier importé n'est pas valide.", 'error');
    }
    importInput.value = '';
  });
}

function renderCalendar() {
  const grid = document.getElementById('calendar-grid');
  if (!grid) return;
  calendarCellMap = new Map();
  grid.innerHTML = '';

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + index);
    return date;
  });

  const topLeft = document.createElement('div');
  topLeft.className = 'time-slot';
  grid.appendChild(topLeft);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  days.forEach((day) => {
    const header = document.createElement('div');
    header.className = 'day-header';
    const weekday = day.toLocaleDateString('fr-FR', { weekday: 'long' });
    const formattedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
    header.innerHTML = `<span>${formattedWeekday}</span><strong>${day.getDate()}</strong>`;
    if (day.getTime() === today.getTime()) {
      header.classList.add('today');
    }
    header.dataset.date = day.toISOString();
    grid.appendChild(header);
  });

  for (let hour = CALENDAR_START_HOUR; hour <= CALENDAR_END_HOUR; hour += 1) {
    const timeCell = document.createElement('div');
    timeCell.className = 'time-slot';
    timeCell.textContent = `${hour.toString().padStart(2, '0')}h`;
    grid.appendChild(timeCell);

    days.forEach((day, index) => {
      const cell = document.createElement('div');
      cell.className = 'hour-cell';
      const cellDate = new Date(day);
      cellDate.setHours(0, 0, 0, 0);
      if (cellDate.getTime() === today.getTime()) {
        cell.classList.add('today');
      }
      cell.dataset.dayIndex = index;
      cell.dataset.hour = hour;
      cell.dataset.date = cellDate.toISOString();
      cell.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        const baseDate = new Date(cell.dataset.date);
        baseDate.setHours(hour, 0, 0, 0);
        openEventModal({ start: baseDate });
      });
      calendarCellMap.set(`${cell.dataset.date}-${hour}`, cell);
      grid.appendChild(cell);
    });
  }

  updateWeekLabel();
  renderCalendarEvents();
}

function updateWeekLabel() {
  const label = document.getElementById('week-label');
  if (!label) return;
  const endDate = new Date(currentWeekStart);
  endDate.setDate(endDate.getDate() + 6);
  const startText = currentWeekStart.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const endText = endDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  label.textContent = `${startText} – ${endText}`;
}

function getEventTypeById(id) {
  if (!id) return null;
  return appData.calendar.types.find((type) => type.id === id) || null;
}

function getEventColor(event) {
  if (!event) return DEFAULT_EVENT_COLOR;
  if (event.color) {
    return event.color;
  }
  const type = getEventTypeById(event.typeId);
  if (type) {
    return type.color;
  }
  return DEFAULT_EVENT_COLOR;
}

function updateEventsForTypeColor(type, previousColor) {
  appData.calendar.events.forEach((event) => {
    if (event.typeId === type.id) {
      if (!event.color || event.color === previousColor) {
        event.color = type.color;
      }
    }
  });
}

function updateEventTypeSelect(selectedId) {
  const select = document.getElementById('event-type');
  if (!select) return;
  const current = typeof selectedId === 'string' ? selectedId : select.value;
  select.innerHTML = '';
  const noneOption = document.createElement('option');
  noneOption.value = '';
  noneOption.textContent = 'Aucun';
  select.appendChild(noneOption);
  appData.calendar.types.forEach((type) => {
    const option = document.createElement('option');
    option.value = type.id;
    option.textContent = type.name || 'Sans titre';
    select.appendChild(option);
  });
  if (current && appData.calendar.types.some((type) => type.id === current)) {
    select.value = current;
  } else {
    select.value = '';
  }
}

function removeEventType(typeId) {
  appData.calendar.types = appData.calendar.types.filter((type) => type.id !== typeId);
  appData.calendar.events.forEach((event) => {
    if (event.typeId === typeId) {
      event.typeId = '';
    }
  });
  saveData();
  renderEventTypes();
  renderCalendarEvents();
}

function renderEventTypes() {
  const list = document.getElementById('event-type-list');
  if (!list) return;
  list.innerHTML = '';

  if (appData.calendar.types.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'event-type-empty';
    empty.textContent = 'Ajoutez un type pour colorer vos évènements.';
    list.appendChild(empty);
  } else {
    appData.calendar.types.forEach((type) => {
      const item = document.createElement('div');
      item.className = 'event-type-item';

      const colorInput = document.createElement('input');
      colorInput.type = 'color';
      colorInput.value = type.color || DEFAULT_EVENT_COLOR;
      colorInput.addEventListener('input', () => {
        const previousColor = type.color;
        type.color = colorInput.value;
        updateEventsForTypeColor(type, previousColor);
        saveData();
        renderCalendarEvents();
      });

      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.value = type.name || 'Sans titre';
      nameInput.addEventListener('input', () => {
        type.name = nameInput.value;
        updateEventTypeSelect(type.id);
        saveData();
      });
      nameInput.addEventListener('blur', () => {
        const trimmed = nameInput.value.trim();
        if (!trimmed) {
          type.name = 'Type sans nom';
          nameInput.value = type.name;
        } else {
          type.name = trimmed;
        }
        updateEventTypeSelect(type.id);
        saveData();
        renderEventTypes();
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.textContent = '✕';
      deleteBtn.addEventListener('click', () => {
        if (!confirm('Supprimer ce type d\'évènement ?')) return;
        removeEventType(type.id);
      });

      item.appendChild(colorInput);
      item.appendChild(nameInput);
      item.appendChild(deleteBtn);
      list.appendChild(item);
    });
  }

  updateEventTypeSelect();
}

function getOccurrencesForWeek(event) {
  const occurrences = [];
  const weekStart = new Date(currentWeekStart);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const base = new Date(event.start);
  const baseDay = base.getDate();
  const baseMonth = base.getMonth();
  const duration = Number(typeof event.duration === 'number' ? event.duration : 60);
  if (Number.isNaN(duration) || duration <= 0) {
    return occurrences;
  }

  if (!event.recurrence || event.recurrence === 'none') {
    if (base >= weekStart && base < weekEnd) {
      occurrences.push({ start: new Date(base), duration, sourceEvent: event });
    }
    return occurrences;
  }

  let occurrence = new Date(base);
  const maxIterations = 366;
  let iterations = 0;

  if (occurrence < weekStart) {
    switch (event.recurrence) {
      case 'daily': {
        const diffDays = Math.floor((weekStart - occurrence) / (24 * 60 * 60 * 1000));
        occurrence.setDate(occurrence.getDate() + diffDays);
        while (occurrence < weekStart) {
          occurrence.setDate(occurrence.getDate() + 1);
        }
        break;
      }
      case 'weekly': {
        const diffWeeks = Math.floor((weekStart - occurrence) / (7 * 24 * 60 * 60 * 1000));
        occurrence.setDate(occurrence.getDate() + diffWeeks * 7);
        while (occurrence < weekStart) {
          occurrence.setDate(occurrence.getDate() + 7);
        }
        break;
      }
      case 'monthly': {
        while (occurrence < weekStart && iterations < maxIterations) {
          occurrence.setMonth(occurrence.getMonth() + 1);
          occurrence.setDate(Math.min(baseDay, daysInMonth(occurrence.getFullYear(), occurrence.getMonth())));
          iterations += 1;
        }
        iterations = 0;
        break;
      }
      case 'yearly': {
        while (occurrence < weekStart && iterations < maxIterations) {
          occurrence.setFullYear(occurrence.getFullYear() + 1);
          occurrence.setMonth(baseMonth);
          occurrence.setDate(Math.min(baseDay, daysInMonth(occurrence.getFullYear(), baseMonth)));
          iterations += 1;
        }
        iterations = 0;
        break;
      }
      default:
        break;
    }
  }

  while (occurrence < weekEnd && iterations < maxIterations) {
    if (occurrence >= weekStart) {
      occurrences.push({ start: new Date(occurrence), duration, sourceEvent: event });
    }
    iterations += 1;
    switch (event.recurrence) {
      case 'daily':
        occurrence.setDate(occurrence.getDate() + 1);
        break;
      case 'weekly':
        occurrence.setDate(occurrence.getDate() + 7);
        break;
      case 'monthly': {
        occurrence.setMonth(occurrence.getMonth() + 1);
        occurrence.setDate(Math.min(baseDay, daysInMonth(occurrence.getFullYear(), occurrence.getMonth())));
        break;
      }
      case 'yearly':
        occurrence.setFullYear(occurrence.getFullYear() + 1);
        occurrence.setMonth(baseMonth);
        occurrence.setDate(Math.min(baseDay, daysInMonth(occurrence.getFullYear(), baseMonth)));
        break;
      default:
        iterations = maxIterations;
        break;
    }
  }

  return occurrences;
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function renderCalendarEvents() {
  calendarCellMap.forEach((cell) => {
    cell.querySelectorAll('.event').forEach((node) => node.remove());
  });

  // 2) Mesurer la hauteur d’une heure pour le positionnement
  const anyCell = calendarCellMap.values().next().value;
  calendarHourHeight = anyCell ? anyCell.getBoundingClientRect().height : 48;

  // 3) Calculer les occurrences de la semaine
  const weekEvents = appData.calendar.events
    .flatMap((event) => getOccurrencesForWeek(event))
    .sort((a, b) => a.start - b.start);

  // 4) Dessiner chaque occurrence dans la cellule de départ
  weekEvents.forEach((occ) => {
    const startDate = new Date(occ.start);

    // Trouver la cellule (jour minuit + heure de départ)
    const startHour = startDate.getHours();
    if (startHour < CALENDAR_START_HOUR || startHour > CALENDAR_END_HOUR) {
      return;
    }

    const dayStart = new Date(startDate);
    dayStart.setHours(0, 0, 0, 0);
    const key = `${dayStart.toISOString()}-${startHour}`;
    const cell = calendarCellMap.get(key);
    if (!cell) return;

    // Créer l'élément event
    const eventEl = document.createElement('div');
    eventEl.className = 'event';
    eventEl.style.setProperty('--event-color', getEventColor(occ.sourceEvent));

    // Contenu (titre + horaire)
    const endDate = new Date(startDate.getTime() + occ.duration * 60000);
    eventEl.innerHTML = `
      <div class="resize-handle top"></div>
      <div class="event-header">
        <div class="title">${occ.sourceEvent.title || 'Évènement'}</div>
        <button class="delete-event" title="Supprimer">✕</button>
      </div>
      <div class="time-range">${formatTime(startDate)} – ${formatTime(endDate)}</div>
      <div class="resize-handle bottom"></div>
    `;

    // Position verticale dans la cellule + hauteur (le débordement est permis)
    const startMinutes = startDate.getMinutes();
    const topPx = (startMinutes / 60) * calendarHourHeight;
    const absoluteStartMinutes = startHour * 60 + startMinutes;
    const visibleDuration = Math.min(
      occ.duration,
      Math.max(0, CALENDAR_END_MINUTE - absoluteStartMinutes)
    );
    eventEl.style.top = `${topPx}px`;
    eventEl.style.height = `${(visibleDuration / 60) * calendarHourHeight}px`;

    // Actions
    eventEl.querySelector('.delete-event').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteEvent(occ.sourceEvent.id);
    });
    const handle = eventEl.querySelector('.resize-handle.bottom');
    handle.addEventListener('pointerdown', (e) => startDurationResize(e, occ, eventEl, handle));

    const topHandle = eventEl.querySelector('.resize-handle.top');
    topHandle.addEventListener('pointerdown', (e) => startStartResize(e, occ, eventEl, topHandle));

    eventEl.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      openEventModal({ event: occ.sourceEvent, occurrenceStart: occ.start });
    });

    cell.appendChild(eventEl);
  });
}

function startDurationResize(pointerEvent, occurrence, eventEl, handle) {
  pointerEvent.preventDefault();
  pointerEvent.stopPropagation();
  const sourceEvent = occurrence.sourceEvent;
  const originalDuration = Number(sourceEvent.duration) || MIN_EVENT_DURATION;
  resizeState = {
    pointerId: pointerEvent.pointerId,
    handle,
    eventEl,
    sourceEvent,
    occurrenceStart: new Date(occurrence.start),
    originalDuration,
    previewDuration: originalDuration,
    startY: pointerEvent.clientY
  };
  handle.setPointerCapture(pointerEvent.pointerId);
  handle.addEventListener('pointermove', handleDurationResize);
  handle.addEventListener('pointerup', finishDurationResize);
  handle.addEventListener('pointercancel', finishDurationResize);
}

function handleDurationResize(event) {
  if (!resizeState) return;
  const deltaPixels = event.clientY - resizeState.startY;
  const minutesPerPixel = 60 / calendarHourHeight;
  const rawMinutes = deltaPixels * minutesPerPixel;
  const steppedMinutes = Math.round(rawMinutes / EVENT_DURATION_STEP) * EVENT_DURATION_STEP;
  const startMinutes = resizeState.occurrenceStart.getHours() * 60 + resizeState.occurrenceStart.getMinutes();
  const available = Math.max(0, CALENDAR_END_MINUTE - startMinutes);
  let newDuration = resizeState.originalDuration + steppedMinutes;
  if (available <= 0) {
    newDuration = resizeState.originalDuration;
  } else {
    const minDuration = Math.min(MIN_EVENT_DURATION, available);
    if (newDuration < minDuration) {
      newDuration = minDuration;
    }
    if (newDuration > available) {
      newDuration = available;
    }
    const stepMinimum = Math.min(EVENT_DURATION_STEP, available);
    if (newDuration < stepMinimum) {
      newDuration = stepMinimum;
    }
  }
  resizeState.previewDuration = newDuration;
  const height = (newDuration / 60) * calendarHourHeight;
  resizeState.eventEl.style.height = `${height}px`;
  const timeRange = resizeState.eventEl.querySelector('.time-range');
  if (timeRange) {
    const endDate = new Date(resizeState.occurrenceStart.getTime() + newDuration * 60000);
    timeRange.textContent = `${formatTime(resizeState.occurrenceStart)} – ${formatTime(endDate)}`;
  }
}

function finishDurationResize(event) {
  if (!resizeState) return;
  resizeState.handle.releasePointerCapture(resizeState.pointerId);
  resizeState.handle.removeEventListener('pointermove', handleDurationResize);
  resizeState.handle.removeEventListener('pointerup', finishDurationResize);
  resizeState.handle.removeEventListener('pointercancel', finishDurationResize);
  const finalDuration = resizeState.previewDuration;
  if (finalDuration !== resizeState.originalDuration) {
    resizeState.sourceEvent.duration = finalDuration;
    saveData();
  }
  resizeState = null;
  renderCalendar();
}

function startStartResize(pointerEvent, occurrence, eventEl, handle) {
  pointerEvent.preventDefault();
  pointerEvent.stopPropagation();
  const sourceEvent = occurrence.sourceEvent;
  const originalStart = new Date(occurrence.start);
  const originalDuration = Number(sourceEvent.duration) || MIN_EVENT_DURATION;
  const fixedEnd = new Date(originalStart.getTime() + originalDuration * 60000); // fin fixe

  resizeState = {
    pointerId: pointerEvent.pointerId,
    handle,
    eventEl,
    sourceEvent,
    originalStart,
    originalDuration,
    fixedEnd,
    previewStart: new Date(originalStart),
    previewDuration: originalDuration,
    startY: pointerEvent.clientY
  };

  handle.setPointerCapture(pointerEvent.pointerId);
  handle.addEventListener('pointermove', handleStartResize);
  handle.addEventListener('pointerup', finishStartResize);
  handle.addEventListener('pointercancel', finishStartResize);
}

function handleStartResize(event) {
  if (!resizeState) return;

  const minutesPerPixel = 60 / calendarHourHeight;
  const deltaPixels = event.clientY - resizeState.startY;      // vers le bas = +, vers le haut = -
  const rawMinutes = deltaPixels * minutesPerPixel;
  const steppedMinutes = Math.round(rawMinutes / EVENT_DURATION_STEP) * EVENT_DURATION_STEP;

  // nouveau début (provisoire) = ancien début + delta
  let newStart = new Date(resizeState.originalStart.getTime() + steppedMinutes * 60000);

  // bornes : pas avant 00:00 du jour, pas après (fin - durée minimale)
  const dayStart = new Date(resizeState.originalStart);
  dayStart.setHours(CALENDAR_START_HOUR, 0, 0, 0);
  const minGap = Math.max(MIN_EVENT_DURATION, EVENT_DURATION_STEP);
  const maxStart = new Date(resizeState.fixedEnd.getTime() - minGap * 60000);

  if (newStart < dayStart) newStart = dayStart;
  if (newStart > maxStart) newStart = maxStart;

  // durée = (fin fixe - début nouveau), arrondie au pas
  let newDuration = Math.round(((resizeState.fixedEnd - newStart) / 60000) / EVENT_DURATION_STEP) * EVENT_DURATION_STEP;
  if (newDuration < MIN_EVENT_DURATION) newDuration = MIN_EVENT_DURATION;

  // réajuster le début pour coller au pas exact
  newStart = new Date(resizeState.fixedEnd.getTime() - newDuration * 60000);

  // mémoriser l’aperçu
  resizeState.previewStart = newStart;
  resizeState.previewDuration = newDuration;

  // mise à jour visuelle (top relatif à la cellule d’origine) + hauteur
  const offsetMinutes =
    (newStart.getHours() - resizeState.originalStart.getHours()) * 60 +
    (newStart.getMinutes() - resizeState.originalStart.getMinutes());
  const topPx = (offsetMinutes / 60) * calendarHourHeight;

  resizeState.eventEl.style.top = `${topPx}px`;
  resizeState.eventEl.style.height = `${(newDuration / 60) * calendarHourHeight}px`;

  const timeRange = resizeState.eventEl.querySelector('.time-range');
  if (timeRange) {
    // formatte l'heure locale (tu as déjà formatTime)
    timeRange.textContent = `${formatTime(newStart)} – ${formatTime(resizeState.fixedEnd)}`;
  }
}

function finishStartResize() {
  if (!resizeState) return;

  resizeState.handle.releasePointerCapture(resizeState.pointerId);
  resizeState.handle.removeEventListener('pointermove', handleStartResize);
  resizeState.handle.removeEventListener('pointerup', finishStartResize);
  resizeState.handle.removeEventListener('pointercancel', finishStartResize);

  const finalStart = resizeState.previewStart || resizeState.originalStart;
  const finalDuration = resizeState.previewDuration || resizeState.originalDuration;

  // convertir en valeur "datetime-local" (YYYY-MM-DDTHH:MM) comme le reste de l’app
  const localInputValue = new Date(finalStart.getTime() - finalStart.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  resizeState.sourceEvent.start = localInputValue;
  resizeState.sourceEvent.duration = finalDuration;

  saveData();
  resizeState = null;
  renderCalendar();
}

function deleteEvent(eventId) {
  appData.calendar.events = appData.calendar.events.filter((event) => event.id !== eventId);
  saveData();
  renderCalendar();
}

function openEventModal({ start, event: existingEvent = null, occurrenceStart = null }) {
  const modal = document.getElementById('event-modal');
  const form = document.getElementById('event-form');
  const titleInput = document.getElementById('event-title');
  const datetimeInput = document.getElementById('event-datetime');
  const durationInput = document.getElementById('event-duration');
  const recurrenceInput = document.getElementById('event-recurrence');
  const typeInput = document.getElementById('event-type');
  const colorInput = document.getElementById('event-color');
  const modalTitle = modal.querySelector('h3');

  const baseDate = existingEvent
    ? (occurrenceStart ? new Date(occurrenceStart) : new Date(existingEvent.start))
    : start instanceof Date
      ? new Date(start)
      : new Date();
  const localized = new Date(baseDate.getTime() - baseDate.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  updateEventTypeSelect(existingEvent && existingEvent.typeId ? existingEvent.typeId : '');

  if (existingEvent) {
    modalTitle.textContent = 'Modifier l\'évènement';
    titleInput.value = existingEvent.title || '';
    datetimeInput.value = localized;
    durationInput.value = existingEvent.duration || 60;
    recurrenceInput.value = existingEvent.recurrence || 'none';
    typeInput.value = existingEvent.typeId || '';
    const type = getEventTypeById(existingEvent.typeId);
    colorInput.value = existingEvent.color || (type ? type.color : DEFAULT_EVENT_COLOR);
    modal.dataset.mode = 'edit';
    modal.dataset.eventId = existingEvent.id;
  } else {
    modalTitle.textContent = 'Nouvel évènement';
    titleInput.value = '';
    datetimeInput.value = localized;
    durationInput.value = 60;
    recurrenceInput.value = 'none';
    typeInput.value = '';
    colorInput.value = DEFAULT_EVENT_COLOR;
    modal.dataset.mode = 'create';
    modal.dataset.eventId = '';
  }

  modal.hidden = false;

  const cancelButton = document.getElementById('cancel-event');
  cancelButton.onclick = () => {
    modal.hidden = true;
  };

  typeInput.onchange = () => {
    const selectedType = getEventTypeById(typeInput.value);
    if (selectedType) {
      colorInput.value = selectedType.color;
    }
  };

  form.onsubmit = (submitEvent) => {
    submitEvent.preventDefault();
    const title = titleInput.value.trim();
    const datetimeValue = datetimeInput.value;
    if (!datetimeValue) return;
    const startDate = new Date(datetimeValue);
    if (Number.isNaN(startDate.getTime())) {
      return;
    }
    let duration = Number(durationInput.value);
    if (!Number.isFinite(duration) || duration <= 0) {
      duration = 60;
    }
    duration = Math.round(duration / EVENT_DURATION_STEP) * EVENT_DURATION_STEP;
    if (duration < EVENT_DURATION_STEP) {
      duration = EVENT_DURATION_STEP;
    }
    const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
    const available = Math.max(0, CALENDAR_END_MINUTE - startMinutes);
    if (available > 0) {
      const minDuration = Math.min(MIN_EVENT_DURATION, available);
      if (duration < minDuration) {
        duration = minDuration;
      }
      if (duration > available) {
        duration = available;
      }
      if (duration < EVENT_DURATION_STEP && available >= EVENT_DURATION_STEP) {
        duration = EVENT_DURATION_STEP;
      }
    }
    durationInput.value = duration;
    const recurrence = recurrenceInput.value;
    const typeId = typeInput.value;
    const color = colorInput.value || DEFAULT_EVENT_COLOR;

    if (modal.dataset.mode === 'edit' && modal.dataset.eventId) {
      const targetEvent = appData.calendar.events.find((evt) => evt.id === modal.dataset.eventId);
      if (targetEvent) {
        targetEvent.title = title || 'Nouvel évènement';
        targetEvent.start = datetimeValue;
        targetEvent.duration = duration;
        targetEvent.recurrence = recurrence;
        targetEvent.typeId = typeId;
        targetEvent.color = color;
      }
    } else {
      const newEvent = {
        id: uid(),
        title: title || 'Nouvel évènement',
        start: datetimeValue,
        duration,
        recurrence,
        typeId,
        color
      };
      appData.calendar.events.push(newEvent);
    }
    saveData();
    modal.hidden = true;
    renderCalendar();
  };
}

function initCalendar() {
  renderCalendar();
  renderEventTypes();
  const typeForm = document.getElementById('event-type-form');
  const typeNameInput = document.getElementById('event-type-name');
  const typeColorInput = document.getElementById('event-type-color');
  if (typeForm) {
    typeForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const name = typeNameInput.value.trim();
      if (!name) return;
      const color = typeColorInput.value || DEFAULT_EVENT_COLOR;
      appData.calendar.types.push({ id: uid(), name, color });
      typeNameInput.value = '';
      saveData();
      renderEventTypes();
    });
  }
  document.getElementById('prev-week').addEventListener('click', () => {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    appData.calendar.lastWeekStart = currentWeekStart.toISOString();
    saveData();
    renderCalendar();
  });
  document.getElementById('next-week').addEventListener('click', () => {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    appData.calendar.lastWeekStart = currentWeekStart.toISOString();
    saveData();
    renderCalendar();
  });
  document.getElementById('today-button').addEventListener('click', () => {
    currentWeekStart = startOfWeek(new Date());
    appData.calendar.lastWeekStart = currentWeekStart.toISOString();
    saveData();
    renderCalendar();
  });
  document.addEventListener('keydown', (event) => {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.isContentEditable) {
      return;
    }
    if (event.key === 'ArrowLeft') {
      currentWeekStart.setDate(currentWeekStart.getDate() - 7);
      appData.calendar.lastWeekStart = currentWeekStart.toISOString();
      saveData();
      renderCalendar();
    }
    if (event.key === 'ArrowRight') {
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      appData.calendar.lastWeekStart = currentWeekStart.toISOString();
      saveData();
      renderCalendar();
    }
  });
}

function getActiveMindmap() {
  let mutated = false;
  if (!appData.mindmap || !Array.isArray(appData.mindmap.maps)) {
    const fallbackId = uid();
    appData.mindmap = { maps: [{ id: fallbackId, name: 'Carte 1', nodes: [], links: [] }], activeMapId: fallbackId };
    mutated = true;
  }
  if (appData.mindmap.maps.length === 0) {
    const fallbackId = uid();
    appData.mindmap.maps.push({ id: fallbackId, name: 'Carte 1', nodes: [], links: [] });
    appData.mindmap.activeMapId = fallbackId;
    mutated = true;
  }
  let active = appData.mindmap.maps.find((map) => map.id === appData.mindmap.activeMapId);
  if (!active) {
    appData.mindmap.activeMapId = appData.mindmap.maps[0].id;
    active = appData.mindmap.maps[0];
    mutated = true;
  }
  if (mutated) {
    saveData();
  }
  return active;
}

function setActiveMindmap(mapId) {
  if (!appData.mindmap.maps.some((map) => map.id === mapId)) return;
  appData.mindmap.activeMapId = mapId;
  selectedNodeId = null;
  setLinkMode(false);
  renderMindmapList();
  renderMindmap();
  saveData();
}

function renderMindmapList() {
  const list = document.getElementById('mindmap-list');
  if (!list) return;
  const active = getActiveMindmap();
  list.innerHTML = '';
  appData.mindmap.maps.forEach((map) => {
    const item = document.createElement('li');
    item.classList.toggle('active', map.id === active.id);
    const nameSpan = document.createElement('span');
    nameSpan.textContent = map.name || 'Carte sans nom';
    item.appendChild(nameSpan);
    item.addEventListener('click', () => {
      if (appData.mindmap.activeMapId === map.id) return;
      setActiveMindmap(map.id);
    });
    list.appendChild(item);
  });
}

function initMindmap() {
  const addBtn = document.getElementById('add-node');
  const deleteBtn = document.getElementById('delete-node');
  const linkBtn = document.getElementById('link-nodes');
  const colorInput = document.getElementById('node-color');
  const canvas = document.getElementById('mindmap-canvas');
  const addMapBtn = document.getElementById('add-map');
  const renameMapBtn = document.getElementById('rename-map');
  const deleteMapBtn = document.getElementById('delete-map');

  function addNode() {
    const rect = canvas.getBoundingClientRect();
    const node = {
      id: uid(),
      title: 'Nouvelle bulle',
      color: colorInput.value,
      x: rect.width / 2 - 60,
      y: rect.height / 2 - 40
    };
    const map = getActiveMindmap();
    map.nodes.push(node);
    saveData();
    renderMindmap();
    selectNode(node.id);
  }

  addBtn.addEventListener('click', addNode);

  deleteBtn.addEventListener('click', () => {
    if (!selectedNodeId) return;
    const map = getActiveMindmap();
    map.nodes = map.nodes.filter((node) => node.id !== selectedNodeId);
    map.links = map.links.filter((link) => link.from !== selectedNodeId && link.to !== selectedNodeId);
    selectedNodeId = null;
    setLinkMode(false);
    saveData();
    renderMindmap();
  });

  linkBtn.addEventListener('click', () => {
    if (!selectedNodeId) return;
    setLinkMode(!linkMode);
  });

  colorInput.addEventListener('input', () => {
    if (!selectedNodeId) return;
    const map = getActiveMindmap();
    const node = map.nodes.find((n) => n.id === selectedNodeId);
    if (!node) return;
    node.color = colorInput.value;
    saveData();
    renderMindmap();
  });

  if (addMapBtn) {
    addMapBtn.addEventListener('click', () => {
      const newMap = {
        id: uid(),
        name: `Carte ${appData.mindmap.maps.length + 1}`,
        nodes: [],
        links: []
      };
      appData.mindmap.maps.push(newMap);
      setActiveMindmap(newMap.id);
    });
  }

  if (renameMapBtn) {
    renameMapBtn.addEventListener('click', () => {
      const map = getActiveMindmap();
      const newName = prompt('Nom de la carte', map.name || 'Carte sans nom');
      if (newName === null) return;
      const trimmed = newName.trim();
      map.name = trimmed || 'Carte sans nom';
      saveData();
      renderMindmapList();
    });
  }

  if (deleteMapBtn) {
    deleteMapBtn.addEventListener('click', () => {
      if (appData.mindmap.maps.length <= 1) {
        alert('Impossible de supprimer la dernière carte.');
        return;
      }
      const map = getActiveMindmap();
      if (!confirm(`Supprimer la carte "${map.name}" ?`)) return;
      appData.mindmap.maps = appData.mindmap.maps.filter((m) => m.id !== map.id);
      const fallback = getActiveMindmap();
      appData.mindmap.activeMapId = fallback.id;
      selectedNodeId = null;
      setLinkMode(false);
      saveData();
      renderMindmapList();
      renderMindmap();
    });
  }

  renderMindmap();
  renderMindmapList();
  selectNode(selectedNodeId);
  syncLinkButton();

  window.addEventListener('resize', () => {
    requestAnimationFrame(() => updateLinkPositions());
  });
}

function renderMindmap() {
  const canvas = document.getElementById('mindmap-canvas');
  const linksLayer = document.getElementById('mindmap-links');
  if (!canvas || !linksLayer) return;
  const map = getActiveMindmap();

  if (selectedNodeId && !map.nodes.some((node) => node.id === selectedNodeId)) {
    selectedNodeId = null;
  }

  canvas.innerHTML = '';
  linksLayer.innerHTML = '';
  linksLayer.setAttribute('width', canvas.clientWidth);
  linksLayer.setAttribute('height', canvas.clientHeight);

  map.nodes.forEach((node) => {
    const nodeEl = document.createElement('div');
    nodeEl.className = 'mindmap-node';
    if (node.id === selectedNodeId) {
      nodeEl.classList.add('selected');
    }
    nodeEl.style.left = `${node.x}px`;
    nodeEl.style.top = `${node.y}px`;
    nodeEl.style.background = node.color || '#4e73df';
    nodeEl.dataset.id = node.id;
    nodeEl.textContent = node.title;

    nodeEl.addEventListener('click', (event) => {
      event.stopPropagation();
      if (linkMode && linkSourceId && linkSourceId !== node.id) {
        const exists = map.links.some((link) => (link.from === linkSourceId && link.to === node.id) || (link.from === node.id && link.to === linkSourceId));
        if (!exists) {
          map.links.push({ id: uid(), from: linkSourceId, to: node.id });
          saveData();
          renderMindmap();
        }
        setLinkMode(false);
      } else {
        selectNode(node.id);
      }
    });

    nodeEl.addEventListener('dblclick', (event) => {
      event.stopPropagation();
      editNodeTitle(node);
    });

    enableDrag(nodeEl, node);

    canvas.appendChild(nodeEl);
  });

  const linesFragment = document.createDocumentFragment();
  map.links.forEach(() => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('stroke', 'rgba(79, 70, 229, 0.45)');
    line.setAttribute('stroke-width', '3');
    line.setAttribute('stroke-linecap', 'round');
    linesFragment.appendChild(line);
  });
  linksLayer.appendChild(linesFragment);
  updateLinkPositions();

  document.getElementById('mindmap-canvas').onclick = () => {
    if (!linkMode) {
      selectNode(null);
    }
  };

  const fallbackId = selectedNodeId !== null ? selectedNodeId : null;
  if (!fallbackId) {
    setLinkMode(false);
    selectNode(null);
  } else {
    selectNode(fallbackId);
    if (linkMode) {
      linkSourceId = fallbackId;
    }
    syncLinkButton();
  }
}

function editNodeTitle(node) {
  const canvas = document.getElementById('mindmap-canvas');
  const nodeEl = canvas.querySelector(`.mindmap-node[data-id="${node.id}"]`);
  if (!nodeEl) return;
  nodeEl.innerHTML = '';
  const input = document.createElement('input');
  input.type = 'text';
  input.value = node.title;
  nodeEl.appendChild(input);
  input.focus();
  input.select();
  input.addEventListener('blur', () => {
    node.title = input.value.trim() || 'Sans titre';
    saveData();
    renderMindmap();
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      input.blur();
    }
  });
}

function selectNode(nodeId) {
  selectedNodeId = nodeId;
  const nodes = document.querySelectorAll('.mindmap-node');
  nodes.forEach((node) => {
    node.classList.toggle('selected', node.dataset.id === nodeId);
  });
  const colorInput = document.getElementById('node-color');
  const deleteBtn = document.getElementById('delete-node');
  const linkBtn = document.getElementById('link-nodes');
  const map = getActiveMindmap();
  if (!nodeId) {
    colorInput.disabled = true;
    deleteBtn.disabled = true;
    linkBtn.disabled = true;
    syncLinkButton();
  } else {
    colorInput.disabled = false;
    deleteBtn.disabled = false;
    linkBtn.disabled = false;
    const node = map.nodes.find((n) => n.id === nodeId);
    if (node) {
      colorInput.value = node.color || '#4e73df';
    }
    if (linkMode) {
      linkSourceId = nodeId;
      syncLinkButton();
    }
  }
}

function enableDrag(element, node) {
  let offsetX = 0;
  let offsetY = 0;

  element.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    selectNode(node.id);
    offsetX = event.clientX - node.x;
    offsetY = event.clientY - node.y;
    element.setPointerCapture(event.pointerId);
    const move = (e) => {
      node.x = e.clientX - offsetX;
      node.y = e.clientY - offsetY;
      element.style.left = `${node.x}px`;
      element.style.top = `${node.y}px`;
      updateLinkPositions();
    };
    const up = (e) => {
      element.releasePointerCapture(event.pointerId);
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerup', up);
      element.removeEventListener('pointercancel', up);
      saveData();
    };
    element.addEventListener('pointermove', move);
    element.addEventListener('pointerup', up);
    element.addEventListener('pointercancel', up);
  });
}

function updateLinkPositions() {
  const canvas = document.getElementById('mindmap-canvas');
  const linksLayer = document.getElementById('mindmap-links');
  if (!linksLayer || !canvas) return;
  const lines = Array.from(linksLayer.querySelectorAll('line'));
  const canvasRect = canvas.getBoundingClientRect();
  const map = getActiveMindmap();
  lines.forEach((line, index) => {
    const link = map.links[index];
    if (!link) return;
    const fromEl = canvas.querySelector(`.mindmap-node[data-id="${link.from}"]`);
    const toEl = canvas.querySelector(`.mindmap-node[data-id="${link.to}"]`);
    if (!fromEl || !toEl) return;
    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toEl.getBoundingClientRect();
    const x1 = fromRect.left - canvasRect.left + fromRect.width / 2;
    const y1 = fromRect.top - canvasRect.top + fromRect.height / 2;
    const x2 = toRect.left - canvasRect.left + toRect.width / 2;
    const y2 = toRect.top - canvasRect.top + toRect.height / 2;
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
  });
}

function syncLinkButton() {
  const btn = document.getElementById('link-nodes');
  if (!btn) return;
  btn.classList.toggle('active', linkMode);
  btn.textContent = linkMode ? 'Relier (choisir la cible)' : 'Relier';
}

function setLinkMode(active) {
  if (active && !selectedNodeId) {
    linkMode = false;
    linkSourceId = null;
    syncLinkButton();
    return;
  }
  linkMode = active;
  if (linkMode) {
    linkSourceId = selectedNodeId;
  } else {
    linkSourceId = null;
  }
  syncLinkButton();
}

function initTodo() {
  document.getElementById('add-block').addEventListener('click', () => {
    const block = {
      id: uid(),
      title: 'Nouveau bloc',
      items: []
    };
    appData.todo.blocks.push(block);
    saveData();
    renderTodo();
  });
  renderTodo();
}

function renderTodo() {
  const container = document.getElementById('todo-blocks');
  if (!container) return;
  container.innerHTML = '';
  if (appData.todo.blocks.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'Ajoutez un bloc pour commencer votre liste de tâches.';
    container.appendChild(empty);
    return;
  }

  appData.todo.blocks.forEach((block) => {
    const blockEl = document.createElement('div');
    blockEl.className = 'todo-block';

    const header = document.createElement('header');
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.value = block.title;
    titleInput.addEventListener('input', () => {
      block.title = titleInput.value;
      saveData();
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Supprimer';
    deleteBtn.addEventListener('click', () => {
      if (!confirm('Supprimer ce bloc et toutes ses tâches ?')) return;
      appData.todo.blocks = appData.todo.blocks.filter((b) => b.id !== block.id);
      saveData();
      renderTodo();
    });

    header.appendChild(titleInput);
    header.appendChild(deleteBtn);

    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'todo-items';

    block.items.forEach((item) => {
      const itemEl = createTodoItemElement(block, item);
      itemsContainer.appendChild(itemEl);
    });

    const addItemBtn = document.createElement('button');
    addItemBtn.textContent = 'Ajouter une tâche';
    addItemBtn.addEventListener('click', () => {
      const newItem = {
        id: uid(),
        text: 'Nouvelle tâche',
        done: false
      };
      block.items.push(newItem);
      saveData();
      renderTodo();
    });

    blockEl.appendChild(header);
    blockEl.appendChild(itemsContainer);
    blockEl.appendChild(addItemBtn);
    container.appendChild(blockEl);
  });
}

function createTodoItemElement(block, item) {
  const itemEl = document.createElement('div');
  itemEl.className = 'todo-item';
  if (item.done) {
    itemEl.classList.add('completed');
  }

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = item.done;
  checkbox.addEventListener('change', () => {
    item.done = checkbox.checked;
    if (item.done) {
      itemEl.classList.add('completed');
    } else {
      itemEl.classList.remove('completed');
    }
    saveData();
  });

  const textInput = document.createElement('input');
  textInput.type = 'text';
  textInput.value = item.text;
  textInput.addEventListener('input', () => {
    item.text = textInput.value;
    saveData();
  });

  const removeBtn = document.createElement('button');
  removeBtn.textContent = '✕';
  removeBtn.addEventListener('click', () => {
    block.items = block.items.filter((i) => i.id !== item.id);
    saveData();
    renderTodo();
  });

  itemEl.appendChild(checkbox);
  itemEl.appendChild(textInput);
  itemEl.appendChild(removeBtn);
  return itemEl;
}

async function bootstrap() {
  await initData();
  initTabs();
  initStorageControls();
  initCalendar();
  initMindmap();
  initTodo();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    bootstrap().catch((error) => console.error(error));
  });
} else {
  bootstrap().catch((error) => console.error(error));
}