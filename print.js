/* ═══════════════════════════════════════════════════════════
   IMPRESSION DE L'EMPLOI DU TEMPS
   Une page A4 paysage par semaine sélectionnée.
   ═══════════════════════════════════════════════════════════ */

const PRINT_MAX_WEEKS = 52;

const PRINT_TRANSLATIONS = {
  fr: {
    button: 'Imprimer',
    title: "Imprimer l'emploi du temps",
    firstWeek: 'À partir de la semaine du',
    weekCount: 'Nombre de semaines',
    weeksToPrint: 'Semaines à imprimer',
    includeWeekend: 'Inclure le week-end',
    print: 'Imprimer',
    cancel: 'Annuler',
    weekRange: 'Semaine du {start} au {end}',
    noneSelected: 'Sélectionnez au moins une semaine.'
  },
  en: {
    button: 'Print',
    title: 'Print the schedule',
    firstWeek: 'Starting from the week of',
    weekCount: 'Number of weeks',
    weeksToPrint: 'Weeks to print',
    includeWeekend: 'Include weekend',
    print: 'Print',
    cancel: 'Cancel',
    weekRange: 'Week of {start} to {end}',
    noneSelected: 'Select at least one week.'
  },
  vi: {
    button: 'In',
    title: 'In thời khóa biểu',
    firstWeek: 'Bắt đầu từ tuần của',
    weekCount: 'Số tuần',
    weeksToPrint: 'Các tuần cần in',
    includeWeekend: 'Bao gồm cuối tuần',
    print: 'In',
    cancel: 'Hủy',
    weekRange: 'Tuần từ {start} đến {end}',
    noneSelected: 'Hãy chọn ít nhất một tuần.'
  }
};

function registerPrintTranslations() {
  Object.keys(PRINT_TRANSLATIONS).forEach((language) => {
    if (translations[language] && translations[language].calendar) {
      translations[language].calendar.printing = PRINT_TRANSLATIONS[language];
    }
  });
}

/* ── Sélection des semaines ────────────────────────────────── */

function printToDateInput(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function printWeekLabel(weekStart, short = false) {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  const options = { day: 'numeric', month: short ? 'short' : 'long', year: 'numeric' };
  return t('calendar.printing.weekRange', {
    start: weekStart.toLocaleDateString(getCurrentLocale(), options),
    end: end.toLocaleDateString(getCurrentLocale(), options)
  });
}

function printGetFirstWeek() {
  const value = document.getElementById('print-first-week').value;
  const date = value ? new Date(`${value}T00:00`) : new Date();
  return startOfWeek(Number.isNaN(date.getTime()) ? new Date() : date);
}

function renderPrintWeekList() {
  const list = document.getElementById('print-week-list');
  const countInput = document.getElementById('print-week-count');
  const count = Math.min(PRINT_MAX_WEEKS, Math.max(1, Number(countInput.value) || 1));
  const firstWeek = printGetFirstWeek();
  list.innerHTML = '';
  for (let i = 0; i < count; i += 1) {
    const weekStart = new Date(firstWeek);
    weekStart.setDate(weekStart.getDate() + i * 7);
    const label = document.createElement('label');
    label.className = 'print-week-option';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = true;
    checkbox.value = weekStart.toISOString();
    const text = document.createElement('span');
    text.textContent = printWeekLabel(weekStart, true);
    label.append(checkbox, text);
    list.appendChild(label);
  }
}

/* ── Construction des pages ────────────────────────────────── */

// Répartit les évènements qui se chevauchent en colonnes côte à côte.
function printAssignLanes(items) {
  items.sort((a, b) => a.startMin - b.startMin || b.endMin - a.endMin);
  let cluster = [];
  let clusterEnd = -Infinity;
  const closeCluster = () => {
    const laneCount = cluster.reduce((max, item) => Math.max(max, item.lane + 1), 1);
    cluster.forEach((item) => {
      item.laneCount = laneCount;
    });
    cluster = [];
  };
  items.forEach((item) => {
    if (item.startMin >= clusterEnd) {
      closeCluster();
      clusterEnd = -Infinity;
    }
    const usedLanes = new Set(cluster.filter((other) => other.endMin > item.startMin).map((other) => other.lane));
    let lane = 0;
    while (usedLanes.has(lane)) lane += 1;
    item.lane = lane;
    cluster.push(item);
    clusterEnd = Math.max(clusterEnd, item.endMin);
  });
  closeCluster();
  return items;
}

function printCollectWeekEvents(weekStart) {
  const savedWeekStart = currentWeekStart;
  currentWeekStart = new Date(weekStart);
  const occurrences = [];
  try {
    appData.calendar.events.forEach((event) => {
      getOccurrencesForWeek(event).forEach((occurrence) => occurrences.push(occurrence));
    });
  } finally {
    currentWeekStart = savedWeekStart;
  }
  return occurrences;
}

function buildPrintWeekPage(weekStart, includeWeekend) {
  const dayCount = includeWeekend ? 7 : 5;
  const firstMinute = CALENDAR_START_HOUR * 60;
  const lastMinute = CALENDAR_END_MINUTE;
  const hourCount = (lastMinute - firstMinute) / 60;

  const page = document.createElement('section');
  page.className = 'print-page';
  const title = document.createElement('h2');
  title.textContent = printWeekLabel(weekStart);
  page.appendChild(title);

  const grid = document.createElement('div');
  grid.className = 'print-grid';
  grid.style.setProperty('--print-days', dayCount);
  grid.style.setProperty('--print-hours', hourCount);

  grid.appendChild(document.createElement('div'));
  const days = Array.from({ length: dayCount }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + index);
    return date;
  });
  days.forEach((day) => {
    const header = document.createElement('div');
    header.className = 'print-day-header';
    const weekday = day.toLocaleDateString(getCurrentLocale(), { weekday: 'long' });
    header.textContent = `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${day.getDate()}`;
    grid.appendChild(header);
  });

  const hours = document.createElement('div');
  hours.className = 'print-hours';
  for (let hour = CALENDAR_START_HOUR; hour <= CALENDAR_END_HOUR; hour += 1) {
    const label = document.createElement('div');
    label.textContent = t('calendar.hourLabel', { hour });
    hours.appendChild(label);
  }
  grid.appendChild(hours);

  const columns = days.map(() => {
    const column = document.createElement('div');
    column.className = 'print-day';
    grid.appendChild(column);
    return { column, items: [] };
  });

  printCollectWeekEvents(weekStart).forEach((occurrence) => {
    const start = new Date(occurrence.start);
    const dayIndex = Math.floor((new Date(start).setHours(0, 0, 0, 0) - weekStart.getTime()) / DAY_IN_MS + 0.5);
    if (dayIndex < 0 || dayIndex >= dayCount) return;
    const minuteOfDay = start.getHours() * 60 + start.getMinutes();
    const startMin = Math.max(firstMinute, minuteOfDay);
    const endMin = Math.min(lastMinute, minuteOfDay + occurrence.duration);
    if (endMin <= startMin) return;
    columns[dayIndex].items.push({ occurrence, start, startMin, endMin });
  });

  columns.forEach(({ column, items }) => {
    printAssignLanes(items).forEach((item) => {
      const event = item.occurrence.sourceEvent;
      const block = document.createElement('div');
      block.className = 'print-event';
      block.style.top = `${((item.startMin - firstMinute) / (lastMinute - firstMinute)) * 100}%`;
      block.style.height = `${((item.endMin - item.startMin) / (lastMinute - firstMinute)) * 100}%`;
      block.style.left = `${(item.lane / item.laneCount) * 100}%`;
      block.style.width = `${100 / item.laneCount}%`;
      block.style.setProperty('--event-color', event.color || DEFAULT_EVENT_COLOR);
      const end = new Date(item.start.getTime() + item.occurrence.duration * 60000);
      const time = document.createElement('small');
      time.textContent = `${formatTime(item.start)} – ${formatTime(end)}`;
      const name = document.createElement('strong');
      name.textContent = event.title || t('calendar.eventDefaultTitle');
      block.append(name, time);
      column.appendChild(block);
    });
  });

  page.appendChild(grid);
  return page;
}

function printSchedule(weekStarts, includeWeekend) {
  let area = document.getElementById('print-area');
  if (!area) {
    area = document.createElement('div');
    area.id = 'print-area';
    document.body.appendChild(area);
  }
  area.innerHTML = '';
  weekStarts.forEach((weekStart) => area.appendChild(buildPrintWeekPage(weekStart, includeWeekend)));
  document.body.classList.add('is-printing');
  const cleanup = () => {
    document.body.classList.remove('is-printing');
    area.innerHTML = '';
    window.removeEventListener('afterprint', cleanup);
  };
  window.addEventListener('afterprint', cleanup);
  window.print();
}

/* ── Interface ─────────────────────────────────────────────── */

function initSchedulePrint() {
  const button = document.getElementById('print-schedule');
  const modal = document.getElementById('print-modal');
  if (!button || !modal) return;
  const firstWeekInput = document.getElementById('print-first-week');
  const countInput = document.getElementById('print-week-count');
  const weekendInput = document.getElementById('print-include-weekend');
  const error = document.getElementById('print-error');

  button.addEventListener('click', () => {
    firstWeekInput.value = printToDateInput(currentWeekStart);
    countInput.value = countInput.value || 1;
    error.textContent = '';
    renderPrintWeekList();
    modal.hidden = false;
  });

  firstWeekInput.addEventListener('change', renderPrintWeekList);
  countInput.addEventListener('input', renderPrintWeekList);

  document.getElementById('print-cancel').addEventListener('click', () => {
    modal.hidden = true;
  });
  modal.addEventListener('click', (event) => {
    if (event.target === modal) modal.hidden = true;
  });

  document.getElementById('print-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const selected = Array.from(document.querySelectorAll('#print-week-list input:checked')).map(
      (checkbox) => new Date(checkbox.value)
    );
    if (selected.length === 0) {
      error.textContent = t('calendar.printing.noneSelected');
      return;
    }
    modal.hidden = true;
    printSchedule(selected, weekendInput.checked);
  });
}
