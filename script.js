const DATA_KEY = 'mydesk-data';
const DATA_FILE_NAME = 'mydesk-data.json';
const defaultData = {
  storagePath: '',
  calendar: {
    events: [],
    lastWeekStart: null
  },
  mindmap: {
    nodes: [],
    links: []
  },
  todo: {
    blocks: []
  }
};

let appData = cloneDefault();
let currentWeekStart = startOfWeek(new Date());
let calendarCellMap = new Map();
let selectedNodeId = null;
let linkMode = false;
let linkSourceId = null;
let folderHandle = null;
let handleDBPromise = null;
let saveTimer = null;

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
  return date.toLocaleDateString('fr-FR', {
    weekday: options.weekday ?? 'long',
    day: '2-digit',
    month: 'short',
    ...(options.year ? { year: 'numeric' } : {})
  });
}

function formatTime(date) {
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function uid() {
  if (window.crypto?.randomUUID) {
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
    req.onsuccess = () => resolve(req.result ?? null);
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
  if ((await handle.queryPermission?.(options)) === 'granted') {
    return true;
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
        ...(parsed.calendar ?? {})
      },
      mindmap: {
        ...cloneDefault().mindmap,
        ...(parsed.mindmap ?? {})
      },
      todo: {
        ...cloneDefault().todo,
        ...(parsed.todo ?? {})
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
        ...(fileData.calendar ?? appData.calendar)
      },
      mindmap: {
        ...cloneDefault().mindmap,
        ...(fileData.mindmap ?? appData.mindmap)
      },
      todo: {
        ...cloneDefault().todo,
        ...(fileData.todo ?? appData.todo)
      }
    };
    updateStorageStatus('Données chargées depuis le disque.', 'success');
  } else {
    updateStorageStatus('Données chargées depuis le navigateur.', 'info');
  }
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

  pathInput.value = appData.storagePath ?? '';
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
      appData.storagePath = handle.name ?? '';
      saveData();
      pathInput.value = appData.storagePath;
      updateStorageStatus('Dossier de sauvegarde sélectionné.', 'success');
    } catch (error) {
      if (error?.name !== 'AbortError') {
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
    const file = importInput.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      appData = {
        ...cloneDefault(),
        ...imported,
        calendar: {
          ...cloneDefault().calendar,
          ...(imported.calendar ?? {})
        },
        mindmap: {
          ...cloneDefault().mindmap,
          ...(imported.mindmap ?? {})
        },
        todo: {
          ...cloneDefault().todo,
          ...(imported.todo ?? {})
        }
      };
      if (appData.calendar.lastWeekStart) {
        currentWeekStart = startOfWeek(new Date(appData.calendar.lastWeekStart));
      } else {
        currentWeekStart = startOfWeek(new Date());
      }
      saveData();
      renderCalendar();
      renderMindmap();
      renderTodo();
      pathInput.value = appData.storagePath ?? '';
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
    header.innerHTML = `<span>${day.toLocaleDateString('fr-FR', { weekday: 'short' })}</span><strong>${day.getDate()}</strong>`;
    if (day.getTime() === today.getTime()) {
      header.classList.add('today');
    }
    header.dataset.date = day.toISOString();
    grid.appendChild(header);
  });

  for (let hour = 0; hour < 24; hour += 1) {
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

function getOccurrencesForWeek(event) {
  const occurrences = [];
  const weekStart = new Date(currentWeekStart);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const base = new Date(event.start);
  const baseDay = base.getDate();
  const baseMonth = base.getMonth();
  const duration = Number(event.duration ?? 60);
  if (Number.isNaN(duration) || duration <= 0) {
    return occurrences;
  }

  if (!event.recurrence || event.recurrence === 'none') {
    if (base >= weekStart && base < weekEnd) {
      occurrences.push({ start: base, duration, id: event.id, title: event.title, recurrence: event.recurrence });
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
      occurrences.push({ start: new Date(occurrence), duration, id: event.id, title: event.title, recurrence: event.recurrence });
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

  const hourCellHeight = (() => {
    const anyCell = calendarCellMap.values().next().value;
    return anyCell ? anyCell.getBoundingClientRect().height : 48;
  })();

  const weekEvents = appData.calendar.events.flatMap((event) => getOccurrencesForWeek(event));
  weekEvents.forEach((occ) => {
    const dateKey = new Date(occ.start);
    const date = new Date(dateKey);
    date.setHours(0, 0, 0, 0);
    const hour = occ.start.getHours();
    const minuteOffset = occ.start.getMinutes();
    const key = `${date.toISOString()}-${hour}`;
    const cell = calendarCellMap.get(key);
    if (!cell) return;
    const eventEl = document.createElement('div');
    eventEl.className = 'event';
    eventEl.innerHTML = `
      <div class="title">${occ.title || 'Nouvel évènement'}</div>
      <div class="time-range">${formatTime(occ.start)} – ${formatTime(new Date(occ.start.getTime() + occ.duration * 60000))}</div>
    `;
    eventEl.style.top = `${(minuteOffset / 60) * hourCellHeight}px`;
    eventEl.style.height = `${(occ.duration / 60) * hourCellHeight}px`;
    eventEl.addEventListener('click', (e) => {
      e.stopPropagation();
      const confirmDelete = confirm('Supprimer cet évènement et ses répétitions ?');
      if (confirmDelete) {
        deleteEvent(occ.id);
      }
    });
    cell.appendChild(eventEl);
  });
}

function deleteEvent(eventId) {
  appData.calendar.events = appData.calendar.events.filter((event) => event.id !== eventId);
  saveData();
  renderCalendar();
}

function openEventModal({ start }) {
  const modal = document.getElementById('event-modal');
  const form = document.getElementById('event-form');
  const titleInput = document.getElementById('event-title');
  const datetimeInput = document.getElementById('event-datetime');
  const durationInput = document.getElementById('event-duration');
  const recurrenceInput = document.getElementById('event-recurrence');

  titleInput.value = '';
  const localISO = new Date(start.getTime() - start.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  datetimeInput.value = localISO;
  durationInput.value = 60;
  recurrenceInput.value = 'none';

  modal.hidden = false;
  modal.dataset.mode = 'create';

  const cancelButton = document.getElementById('cancel-event');
  cancelButton.onclick = () => {
    modal.hidden = true;
  };

  form.onsubmit = (event) => {
    event.preventDefault();
    const title = titleInput.value.trim();
    const datetimeValue = datetimeInput.value;
    const duration = Number(durationInput.value) || 60;
    if (!datetimeValue) return;
    const startDate = new Date(datetimeValue);
    if (Number.isNaN(startDate.getTime())) {
      return;
    }
    const newEvent = {
      id: uid(),
      title: title || 'Nouvel évènement',
      start: datetimeValue,
      duration,
      recurrence: recurrenceInput.value
    };
    appData.calendar.events.push(newEvent);
    saveData();
    modal.hidden = true;
    renderCalendar();
  };
}

function initCalendar() {
  renderCalendar();
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

function initMindmap() {
  const addBtn = document.getElementById('add-node');
  const deleteBtn = document.getElementById('delete-node');
  const linkBtn = document.getElementById('link-nodes');
  const colorInput = document.getElementById('node-color');
  const canvas = document.getElementById('mindmap-canvas');

  function addNode() {
    const rect = canvas.getBoundingClientRect();
    const node = {
      id: uid(),
      title: 'Nouvelle bulle',
      color: colorInput.value,
      x: rect.width / 2 - 60,
      y: rect.height / 2 - 40
    };
    appData.mindmap.nodes.push(node);
    saveData();
    renderMindmap();
    selectNode(node.id);
  }

  addBtn.addEventListener('click', addNode);

  deleteBtn.addEventListener('click', () => {
    if (!selectedNodeId) return;
    appData.mindmap.nodes = appData.mindmap.nodes.filter((node) => node.id !== selectedNodeId);
    appData.mindmap.links = appData.mindmap.links.filter((link) => link.from !== selectedNodeId && link.to !== selectedNodeId);
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
    const node = appData.mindmap.nodes.find((n) => n.id === selectedNodeId);
    if (!node) return;
    node.color = colorInput.value;
    saveData();
    renderMindmap();
  });

  renderMindmap();
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

  if (selectedNodeId && !appData.mindmap.nodes.some((node) => node.id === selectedNodeId)) {
    selectedNodeId = null;
  }

  canvas.innerHTML = '';
  linksLayer.innerHTML = '';
  linksLayer.setAttribute('width', canvas.clientWidth);
  linksLayer.setAttribute('height', canvas.clientHeight);

  appData.mindmap.nodes.forEach((node) => {
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
        const exists = appData.mindmap.links.some((link) => (link.from === linkSourceId && link.to === node.id) || (link.from === node.id && link.to === linkSourceId));
        if (!exists) {
          appData.mindmap.links.push({ id: uid(), from: linkSourceId, to: node.id });
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
  appData.mindmap.links.forEach(() => {
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

  const fallbackId = selectedNodeId ?? null;
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
  if (!nodeId) {
    colorInput.disabled = true;
    deleteBtn.disabled = true;
    linkBtn.disabled = true;
    syncLinkButton();
  } else {
    colorInput.disabled = false;
    deleteBtn.disabled = false;
    linkBtn.disabled = false;
    const node = appData.mindmap.nodes.find((n) => n.id === nodeId);
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
  lines.forEach((line, index) => {
    const link = appData.mindmap.links[index];
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
