/* ═══════════════════════════════════════════════════════════
   AGENDA
   Semaine, évènements (glisser, redimensionner, plage horaire),
   types d'évènements et fenêtre d'édition.
   Chargé avant script.js (cœur : données, traductions, onglets, démarrage).
   ═══════════════════════════════════════════════════════════ */

let calendarCellMap = new Map();
let dayOverlayMap = new Map();
let calendarHourHeight = 48;
let resizeState = null;

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
    const weekday = day.toLocaleDateString(getCurrentLocale(), { weekday: 'long' });
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
    const paddedHour = hour.toString().padStart(2, '0');
    timeCell.textContent = t('calendar.hourLabel', { hour: paddedHour });
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
      cell.addEventListener('pointerdown', (event) => startRangeSelect(event, cell));
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
  scrollCalendarToToday(grid);
}

// Téléphone : la semaine défile horizontalement. À chaque changement de
// semaine, on montre aujourd'hui (ou le lundi) plutôt que de garder la
// position de la semaine précédente.
let calendarScrolledWeek = null;
function scrollCalendarToToday(grid) {
  if (!window.matchMedia || !window.matchMedia('(max-width: 700px)').matches) return;
  const week = currentWeekStart.toISOString();
  if (calendarScrolledWeek === week) return;
  calendarScrolledWeek = week;
  const today = grid.querySelector('.day-header.today');
  const timeColumn = grid.querySelector('.time-slot');
  grid.scrollLeft = today ? Math.max(0, today.offsetLeft - (timeColumn ? timeColumn.offsetWidth : 0) - 4) : 0;
}

function updateWeekLabel() {
  const label = document.getElementById('week-label');
  if (!label) return;
  const endDate = new Date(currentWeekStart);
  endDate.setDate(endDate.getDate() + 6);
  const locale = getCurrentLocale();
  const startText = currentWeekStart.toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' });
  const endText = endDate.toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' });
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
  noneOption.textContent = t('calendar.eventTypeNone');
  select.appendChild(noneOption);
  appData.calendar.types.forEach((type) => {
    const option = document.createElement('option');
    option.value = type.id;
    option.textContent = type.name || t('calendar.eventTypeUntitled');
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
    empty.textContent = t('calendar.eventTypeEmpty');
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
        saveDataSoon();
        renderCalendarEvents();
      });

      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.value = type.name || t('calendar.eventTypeUntitled');
      nameInput.addEventListener('input', () => {
        type.name = nameInput.value;
        updateEventTypeSelect(type.id);
        saveDataSoon();
      });
      nameInput.addEventListener('blur', () => {
        const trimmed = nameInput.value.trim();
        if (!trimmed) {
          type.name = t('calendar.eventTypeNoName');
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
        if (!confirm(t('calendar.deleteTypeConfirm'))) return;
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

// rangeStart : début des 7 jours à couvrir (par défaut la semaine affichée).
function getOccurrencesForWeek(event, rangeStart = currentWeekStart) {
  const occurrences = [];
  const weekStart = new Date(rangeStart);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const base = new Date(event.start);
  const baseDay = base.getDate();
  const baseMonth = base.getMonth();
  const duration = Number(typeof event.duration === 'number' ? event.duration : 60);
  if (Number.isNaN(duration) || duration <= 0) {
    return occurrences;
  }
  const exceptions = new Set(Array.isArray(event.exceptions) ? event.exceptions : []);
  const until = event.until ? new Date(`${event.until}T00:00`) : null;
  const isSkipped = (date) => exceptions.has(toISODateString(date)) || (until && date >= until);

  if (!event.recurrence || event.recurrence === 'none') {
    if (base >= weekStart && base < weekEnd && !isSkipped(base)) {
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
    if (occurrence >= weekStart && !isSkipped(occurrence)) {
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
  // Chevauchements : côte à côte, ou « le vrai » en grand et les autres grisés.
  const conflicts = typeof computeConflictLayout === 'function' ? computeConflictLayout(weekEvents) : null;

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
    const displayTitle = occ.sourceEvent.title || t('calendar.eventDefaultTitle');
    const timeLabel = `${formatTime(startDate)} – ${formatTime(endDate)}`;
    eventEl.innerHTML = `
      <div class="resize-handle top"></div>
      <div class="event-header">
        <div class="title"></div>
        <button class="delete-event">✕</button>
      </div>
      <div class="time-range"></div>
      <div class="event-location"></div>
      <div class="resize-handle bottom"></div>
    `;
    // textContent : un titre (ex. importé d'un .ics) ne peut pas injecter de HTML.
    eventEl.querySelector('.title').textContent = displayTitle;
    eventEl.querySelector('.time-range').textContent = timeLabel;
    const place = (occ.sourceEvent.location || '').trim();
    const placeEl = eventEl.querySelector('.event-location');
    if (place) placeEl.textContent = `📍 ${place}`;
    else placeEl.remove();
    eventEl.querySelector('.delete-event').title = t('calendar.eventDeleteTitle');
    eventEl.title = `${displayTitle}\n${timeLabel}${place ? `\n📍 ${place}` : ''}`;

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
    // Trop court pour heure + titre l'un sous l'autre : sur une seule ligne,
    // avec l'heure de début seulement.
    if (visibleDuration <= 45) {
      eventEl.classList.add('is-short');
      eventEl.querySelector('.time-range').textContent = formatTime(startDate);
    }

    if (conflicts) {
      applyConflictPlacement(eventEl, conflicts.layout.get(occ), displayTitle);
    }

    // Actions
    eventEl.querySelector('.delete-event').addEventListener('click', (e) => {
      e.stopPropagation();
      requestDeleteOccurrence(occ);
    });
    const handle = eventEl.querySelector('.resize-handle.bottom');
    handle.addEventListener('pointerdown', (e) => startDurationResize(e, occ, eventEl, handle));

    const topHandle = eventEl.querySelector('.resize-handle.top');
    topHandle.addEventListener('pointerdown', (e) => startStartResize(e, occ, eventEl, topHandle));
    eventEl.addEventListener('pointerdown', (e) => startEventMove(e, occ, eventEl));

    eventEl.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      openEventModal({ event: occ.sourceEvent, occurrenceStart: occ.start });
    });
    // Clic droit sur un évènement : le modifier (et non en créer un dans la case).
    eventEl.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (moveState && moveState.active) return;
      openEventModal({ event: occ.sourceEvent, occurrenceStart: occ.start });
    });
    if (typeof attachSportClick === 'function') {
      attachSportClick(eventEl, occ);
    }

    cell.appendChild(eventEl);
  });
  if (conflicts && typeof renderConflictBanner === 'function') {
    renderConflictBanner(conflicts.groups);
  }
  renderCalendarNowLine();
  if (typeof renderGoalsPanel === 'function') renderGoalsPanel();
  if (typeof renderRemindersPanel === 'function') renderRemindersPanel();
}

// Barre rouge à l'heure actuelle sur le jour d'aujourd'hui (mise à jour chaque minute).
function renderCalendarNowLine() {
  document.querySelectorAll('.calendar-grid .current-time-line').forEach((node) => node.remove());
  const now = new Date();
  const hour = now.getHours();
  if (hour < CALENDAR_START_HOUR || hour > CALENDAR_END_HOUR) return;
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const cell = calendarCellMap.get(`${today.toISOString()}-${hour}`);
  if (!cell) return;
  const line = document.createElement('div');
  line.className = 'current-time-line';
  line.style.top = `${(now.getMinutes() / 60) * 100}%`;
  line.title = formatTime(now);
  cell.appendChild(line);
}

setInterval(() => {
  if (calendarCellMap && calendarCellMap.size) renderCalendarNowLine();
}, 60 * 1000);

/* ── Déplacer un évènement en le glissant ─────────────────────
   Souris : on attrape l'évènement et on le glisse (au-delà de quelques
   pixels). Tactile : appui long, puis on glisse (sinon la page défile).
   On lâche : nouveau jour / nouvelle heure, par pas de 15 min. Pour une
   série, seule l'occurrence déplacée change (comme le redimensionnement). */

const EVENT_MOVE_THRESHOLD_PX = 6;
const EVENT_MOVE_LONG_PRESS_MS = 350;
let moveState = null;
let calendarClickSuppressedUntil = 0;

function calendarIsDragging() {
  return Boolean(
    resizeState ||
      (moveState && moveState.active) ||
      (typeof rangeSelect !== 'undefined' && rangeSelect && rangeSelect.active) ||
      (typeof goalDragActive === 'function' && goalDragActive())
  );
}

function startEventMove(pointerEvent, occurrence, eventEl) {
  if (pointerEvent.button !== 0 || resizeState || moveState) return;
  if (pointerEvent.target.closest('.resize-handle, .delete-event, .conflict-badge')) return;
  const rect = eventEl.getBoundingClientRect();
  moveState = {
    pointerId: pointerEvent.pointerId,
    occurrence,
    eventEl,
    startX: pointerEvent.clientX,
    startY: pointerEvent.clientY,
    grabMinutes: Math.max(0, ((pointerEvent.clientY - rect.top) / calendarHourHeight) * 60),
    touch: pointerEvent.pointerType !== 'mouse',
    active: false,
    timer: null,
    newStart: null
  };
  if (moveState.touch) {
    moveState.timer = setTimeout(() => activateEventMove(), EVENT_MOVE_LONG_PRESS_MS);
  }
  document.addEventListener('pointermove', onEventMove);
  document.addEventListener('pointerup', endEventMove);
  document.addEventListener('pointercancel', cancelEventMove);
}

function activateEventMove() {
  if (!moveState || moveState.active) return;
  moveState.active = true;
  const { eventEl } = moveState;
  eventEl.classList.add('is-moving');
  eventEl.style.left = '4px';
  eventEl.style.right = '4px';
  eventEl.style.width = 'auto';
  if (moveState.touch && navigator.vibrate) navigator.vibrate(15);
}

function onEventMove(pointerEvent) {
  if (!moveState || pointerEvent.pointerId !== moveState.pointerId) return;
  const distance = Math.hypot(pointerEvent.clientX - moveState.startX, pointerEvent.clientY - moveState.startY);
  if (!moveState.active) {
    if (distance < EVENT_MOVE_THRESHOLD_PX) return;
    if (moveState.touch) {
      // Le doigt a bougé avant l'appui long : c'est un défilement.
      cleanupEventMove();
      return;
    }
    activateEventMove();
  }
  pointerEvent.preventDefault();

  // Défilement automatique près des bords de l'écran.
  if (pointerEvent.clientY < 40) window.scrollBy(0, -12);
  else if (pointerEvent.clientY > window.innerHeight - 40) window.scrollBy(0, 12);

  const target = document.elementFromPoint(pointerEvent.clientX, pointerEvent.clientY);
  const cell = target && target.closest('.calendar-grid .hour-cell');
  if (!cell) return;
  const cellRect = cell.getBoundingClientRect();
  const hour = Number(cell.dataset.hour);
  let minutes = hour * 60 + ((pointerEvent.clientY - cellRect.top) / cellRect.height) * 60 - moveState.grabMinutes;
  minutes = Math.round(minutes / EVENT_DURATION_STEP) * EVENT_DURATION_STEP;
  minutes = Math.max(CALENDAR_START_HOUR * 60, Math.min(CALENDAR_END_MINUTE - EVENT_DURATION_STEP, minutes));

  const newStart = new Date(cell.dataset.date);
  newStart.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  moveState.newStart = newStart;

  // Aperçu : l'évènement suit dans la bonne case, à la bonne hauteur.
  const targetCell = calendarCellMap.get(`${cell.dataset.date}-${Math.floor(minutes / 60)}`);
  const { eventEl, occurrence } = moveState;
  if (targetCell && eventEl.parentElement !== targetCell) targetCell.appendChild(eventEl);
  eventEl.style.top = `${((minutes % 60) / 60) * calendarHourHeight}px`;
  const timeRange = eventEl.querySelector('.time-range');
  if (timeRange) {
    const end = new Date(newStart.getTime() + occurrence.duration * 60000);
    timeRange.textContent = `${formatTime(newStart)} – ${formatTime(end)}`;
  }
}

function endEventMove(pointerEvent) {
  if (!moveState || pointerEvent.pointerId !== moveState.pointerId) return;
  const { active, newStart, occurrence } = moveState;
  cleanupEventMove();
  if (!active) return;
  calendarClickSuppressedUntil = Date.now() + 400;
  if (newStart && newStart.getTime() !== new Date(occurrence.start).getTime()) {
    const event = occurrence.sourceEvent;
    if (isRecurringEvent(event)) {
      updateSingleOccurrence(event, occurrence.start, { start: toLocalInputValue(newStart) });
    } else {
      event.start = toLocalInputValue(newStart);
    }
    saveData();
  }
  renderCalendar();
}

function cancelEventMove(pointerEvent) {
  if (!moveState || (pointerEvent && pointerEvent.pointerId !== moveState.pointerId)) return;
  const wasActive = moveState.active;
  cleanupEventMove();
  if (wasActive) renderCalendar();
}

function cleanupEventMove() {
  if (!moveState) return;
  clearTimeout(moveState.timer);
  moveState.eventEl.classList.remove('is-moving');
  moveState = null;
  document.removeEventListener('pointermove', onEventMove);
  document.removeEventListener('pointerup', endEventMove);
  document.removeEventListener('pointercancel', cancelEventMove);
}

// Après un glisser, le « clic » de fin ne doit pas ouvrir la séance de sport, etc.
document.addEventListener(
  'click',
  (clickEvent) => {
    if (Date.now() < calendarClickSuppressedUntil && clickEvent.target.closest('.calendar-grid')) {
      clickEvent.stopImmediatePropagation();
      clickEvent.preventDefault();
    }
  },
  true
);

// Tactile : une fois l'appui long validé, le doigt déplace l'évènement au lieu de faire défiler la page.
document.addEventListener(
  'touchmove',
  (touchEvent) => {
    if (moveState && moveState.active) touchEvent.preventDefault();
  },
  { passive: false }
);

document.addEventListener('keydown', (keyEvent) => {
  if (keyEvent.key === 'Escape' && moveState) cancelEventMove();
});

/* ── Sélectionner une plage horaire en glissant ───────────────
   Clic gauche sur un créneau vide puis glisser vers le bas (souris) :
   la plage se dessine par pas de 15 min, et au relâchement la fenêtre
   de création s'ouvre, déjà remplie avec ce jour et ces horaires. */

let rangeSelect = null;

function startRangeSelect(pointerEvent, cell) {
  if (pointerEvent.button !== 0 || pointerEvent.pointerType !== 'mouse') return;
  if (pointerEvent.target.closest('.event') || resizeState || moveState) return;
  const minutes = rangeMinutesAt(cell, pointerEvent.clientY, Math.floor);
  rangeSelect = { cell, date: cell.dataset.date, anchor: minutes, from: minutes, to: minutes + EVENT_DURATION_STEP, startY: pointerEvent.clientY, active: false, box: null };
  pointerEvent.preventDefault(); // pas de sélection de texte
  document.addEventListener('pointermove', onRangeSelectMove);
  document.addEventListener('pointerup', endRangeSelect);
  document.addEventListener('pointercancel', cancelRangeSelect);
}

function rangeMinutesAt(cell, clientY, round = Math.round) {
  const rect = cell.getBoundingClientRect();
  const raw = Number(cell.dataset.hour) * 60 + ((clientY - rect.top) / rect.height) * 60;
  const snapped = round(raw / EVENT_DURATION_STEP) * EVENT_DURATION_STEP;
  return Math.max(CALENDAR_START_HOUR * 60, Math.min(CALENDAR_END_MINUTE, snapped));
}

function onRangeSelectMove(pointerEvent) {
  if (!rangeSelect) return;
  if (!rangeSelect.active && Math.abs(pointerEvent.clientY - rangeSelect.startY) < 6) return;
  rangeSelect.active = true;
  // Même jour que le clic de départ, quelle que soit la colonne survolée.
  const target = document.elementFromPoint(rangeSelect.cell.getBoundingClientRect().left + 4, pointerEvent.clientY);
  const cell = target && target.closest('.calendar-grid .hour-cell');
  let minutes;
  if (cell && cell.dataset.date === rangeSelect.date) minutes = rangeMinutesAt(cell, pointerEvent.clientY);
  else minutes = pointerEvent.clientY < rangeSelect.startY ? CALENDAR_START_HOUR * 60 : CALENDAR_END_MINUTE;
  rangeSelect.from = Math.min(rangeSelect.anchor, minutes);
  rangeSelect.to = Math.max(rangeSelect.anchor + EVENT_DURATION_STEP, minutes);
  drawRangeSelect();
}

function drawRangeSelect() {
  const { date, from, to } = rangeSelect;
  const startCell = calendarCellMap.get(`${date}-${Math.floor(from / 60)}`);
  if (!startCell) return;
  if (!rangeSelect.box) {
    rangeSelect.box = document.createElement('div');
    rangeSelect.box.className = 'calendar-selection';
  }
  const box = rangeSelect.box;
  if (box.parentElement !== startCell) startCell.appendChild(box);
  box.style.top = `${((from % 60) / 60) * calendarHourHeight}px`;
  box.style.height = `${((to - from) / 60) * calendarHourHeight}px`;
  const start = new Date(date);
  start.setHours(Math.floor(from / 60), from % 60, 0, 0);
  const end = new Date(date);
  end.setHours(Math.floor(to / 60), to % 60, 0, 0);
  box.textContent = `${formatTime(start)} – ${formatTime(end)}`;
}

function endRangeSelect() {
  if (!rangeSelect) return;
  const { active, date, from, to, box } = rangeSelect;
  cleanupRangeSelect();
  if (!active) return;
  calendarClickSuppressedUntil = Date.now() + 400;
  const start = new Date(date);
  start.setHours(Math.floor(from / 60), from % 60, 0, 0);
  // La plage reste affichée tant que la fenêtre est ouverte.
  openEventModal({ start, duration: to - from });
  const modal = document.getElementById('event-modal');
  const clear = () => {
    if (!modal.hidden) return;
    if (box) box.remove();
    observer.disconnect();
  };
  const observer = new MutationObserver(clear);
  observer.observe(modal, { attributes: true, attributeFilter: ['hidden'] });
}

function cancelRangeSelect() {
  if (!rangeSelect) return;
  const { box } = rangeSelect;
  cleanupRangeSelect();
  if (box) box.remove();
}

function cleanupRangeSelect() {
  rangeSelect = null;
  document.removeEventListener('pointermove', onRangeSelectMove);
  document.removeEventListener('pointerup', endRangeSelect);
  document.removeEventListener('pointercancel', cancelRangeSelect);
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
    updateSingleOccurrence(resizeState.sourceEvent, resizeState.occurrenceStart, { duration: finalDuration });
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

  if (finalStart.getTime() !== resizeState.originalStart.getTime() || finalDuration !== resizeState.originalDuration) {
    updateSingleOccurrence(resizeState.sourceEvent, resizeState.originalStart, {
      start: toLocalInputValue(finalStart),
      duration: finalDuration
    });
    saveData();
  }
  resizeState = null;
  renderCalendar();
}

function toLocalInputValue(date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

// Applique à la série le décalage (jours + heure) fait sur une de ses occurrences,
// sans jamais ramener le début de la série sur cette occurrence.
function shiftSeriesStart(event, occurrenceStart, newOccurrenceStart) {
  const from = new Date(occurrenceStart);
  const to = new Date(newOccurrenceStart);
  const midnight = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const dayDelta = Math.round((midnight(to) - midnight(from)) / DAY_IN_MS);
  const minuteDelta = to.getHours() * 60 + to.getMinutes() - (from.getHours() * 60 + from.getMinutes());
  const start = new Date(event.start);
  start.setDate(start.getDate() + dayDelta);
  start.setMinutes(start.getMinutes() + minuteDelta);
  event.start = toLocalInputValue(start);
}

function isRecurringEvent(event) {
  return Boolean(event && event.recurrence && event.recurrence !== 'none');
}

// Modifie une seule occurrence : pour une série, l'occurrence est retirée de la
// série (exception) et remplacée par un évènement indépendant portant les changements.
function updateSingleOccurrence(event, occurrenceStart, changes) {
  if (!isRecurringEvent(event)) {
    Object.assign(event, changes);
    return event;
  }
  const dateKey = toISODateString(new Date(occurrenceStart));
  const exceptions = Array.isArray(event.exceptions) ? event.exceptions : [];
  event.exceptions = Array.from(new Set([...exceptions, dateKey]));
  const single = {
    id: uid(),
    title: event.title,
    location: event.location,
    start: toLocalInputValue(new Date(occurrenceStart)),
    duration: event.duration,
    typeId: event.typeId,
    color: event.color,
    seriesId: event.id,
    goalId: event.goalId,
    reminder: event.reminder,
    ...changes,
    recurrence: 'none'
  };
  appData.calendar.events.push(single);
  return single;
}

function deleteEvent(eventId) {
  appData.calendar.events = appData.calendar.events.filter((event) => event.id !== eventId);
  saveData();
  renderCalendar();
}

// scope : 'one' (cette occurrence), 'following' (celle-ci et les suivantes), 'all'
function deleteOccurrence(occurrence, scope) {
  const event = occurrence.sourceEvent;
  const dateKey = toISODateString(new Date(occurrence.start));
  if (scope === 'all' || !event.recurrence || event.recurrence === 'none') {
    deleteEvent(event.id);
  } else if (scope === 'following') {
    if (dateKey <= toISODateString(new Date(event.start))) {
      deleteEvent(event.id);
    } else {
      event.until = dateKey;
      saveData();
      renderCalendar();
    }
  } else {
    const exceptions = Array.isArray(event.exceptions) ? event.exceptions : [];
    event.exceptions = Array.from(new Set([...exceptions, dateKey]));
    saveData();
    renderCalendar();
  }
  if (typeof showUndoToast === 'function') {
    showUndoToast('undo.eventDeleted');
  }
}

function requestDeleteOccurrence(occurrence) {
  const event = occurrence.sourceEvent;
  if (!event.recurrence || event.recurrence === 'none') {
    deleteOccurrence(occurrence, 'all');
    return;
  }
  const modal = document.getElementById('delete-occurrence-modal');
  const close = () => {
    modal.hidden = true;
  };
  modal.querySelectorAll('[data-delete-scope]').forEach((button) => {
    button.onclick = () => {
      close();
      deleteOccurrence(occurrence, button.dataset.deleteScope);
    };
  });
  document.getElementById('delete-occurrence-cancel').onclick = close;
  modal.onclick = (clickEvent) => {
    if (clickEvent.target === modal) close();
  };
  modal.hidden = false;
}

function fillEventLocationList() {
  const list = document.getElementById('event-location-list');
  if (!list) return;
  const counts = new Map();
  appData.calendar.events.forEach((event) => {
    const place = (event.location || '').trim();
    if (place) counts.set(place, (counts.get(place) || 0) + 1);
  });
  list.innerHTML = '';
  Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 50)
    .forEach(([place]) => {
      const option = document.createElement('option');
      option.value = place;
      list.appendChild(option);
    });
}

function openEventModal({ start, duration: presetDuration = null, event: existingEvent = null, occurrenceStart = null }) {
  const modal = document.getElementById('event-modal');
  const form = document.getElementById('event-form');
  const titleInput = document.getElementById('event-title');
  const locationInput = document.getElementById('event-location');
  const datetimeInput = document.getElementById('event-datetime');
  const durationInput = document.getElementById('event-duration');
  const endTimeInput = document.getElementById('event-end-time');
  const recurrenceInput = document.getElementById('event-recurrence');
  const typeInput = document.getElementById('event-type');
  const colorInput = document.getElementById('event-color');
  const scopeRow = document.getElementById('event-scope-row');
  const scopeInput = document.getElementById('event-scope');
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
  fillEventLocationList();
  if (typeof fillEventGoalSelect === 'function') fillEventGoalSelect(existingEvent ? existingEvent.goalId : '');
  if (typeof fillEventReminderSelect === 'function') fillEventReminderSelect(existingEvent ? existingEvent.reminder : undefined);

  if (existingEvent) {
    modalTitle.textContent = t('calendar.eventModal.editTitle');
    titleInput.value = existingEvent.title || '';
    locationInput.value = existingEvent.location || '';
    datetimeInput.value = localized;
    durationInput.value = existingEvent.duration || 60;
    recurrenceInput.value = existingEvent.recurrence || 'none';
    typeInput.value = existingEvent.typeId || '';
    const type = getEventTypeById(existingEvent.typeId);
    colorInput.value = existingEvent.color || (type ? type.color : DEFAULT_EVENT_COLOR);
    modal.dataset.mode = 'edit';
    modal.dataset.eventId = existingEvent.id;
  } else {
    modalTitle.textContent = t('calendar.eventModal.createTitle');
    titleInput.value = '';
    locationInput.value = '';
    datetimeInput.value = localized;
    durationInput.value = presetDuration || 60;
    recurrenceInput.value = 'none';
    typeInput.value = '';
    colorInput.value = DEFAULT_EVENT_COLOR;
    modal.dataset.mode = 'create';
    modal.dataset.eventId = '';
  }

  // Série : choisir si la modification vise cette occurrence ou toute la série.
  const editingSeries = Boolean(existingEvent) && isRecurringEvent(existingEvent);
  scopeRow.hidden = !editingSeries;
  scopeInput.value = 'one';
  const updateScope = () => {
    const single = editingSeries && scopeInput.value === 'one';
    recurrenceInput.disabled = single;
    if (single) recurrenceInput.value = existingEvent.recurrence;
  };
  scopeInput.onchange = updateScope;
  updateScope();

  // Heure de fin ⇄ durée : modifier l'une met l'autre à jour.
  const pad = (n) => String(n).padStart(2, '0');
  const updateEndFromDuration = () => {
    const startDate = new Date(datetimeInput.value);
    const minutes = Number(durationInput.value);
    if (Number.isNaN(startDate.getTime()) || !Number.isFinite(minutes) || minutes <= 0) return;
    const end = new Date(startDate.getTime() + minutes * 60000);
    endTimeInput.value = `${pad(end.getHours())}:${pad(end.getMinutes())}`;
  };
  const updateDurationFromEnd = () => {
    const startDate = new Date(datetimeInput.value);
    const [hours, minutes] = (endTimeInput.value || '').split(':').map(Number);
    if (Number.isNaN(startDate.getTime()) || !Number.isFinite(hours) || !Number.isFinite(minutes)) return;
    const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
    let duration = hours * 60 + minutes - startMinutes;
    if (duration <= 0) duration += 24 * 60; // fin après minuit
    durationInput.value = duration;
  };
  durationInput.oninput = updateEndFromDuration;
  datetimeInput.oninput = updateEndFromDuration;
  endTimeInput.oninput = updateDurationFromEnd;
  updateEndFromDuration();

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
    duration = Math.max(MIN_EVENT_DURATION, Math.round(duration));
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
    const goalSelect = document.getElementById('event-goal');
    const goalId = goalSelect && goalSelect.value ? goalSelect.value : undefined;
    const color = colorInput.value || DEFAULT_EVENT_COLOR;
    const reminder = typeof readEventReminderSelect === 'function' ? readEventReminderSelect() : undefined;

    if (modal.dataset.mode === 'edit' && modal.dataset.eventId) {
      const targetEvent = appData.calendar.events.find((evt) => evt.id === modal.dataset.eventId);
      if (targetEvent) {
        const changes = {
          title: title || t('calendar.newEventTitle'),
          location: locationInput.value.trim(),
          duration,
          typeId,
          color,
          goalId,
          reminder
        };
        if (isRecurringEvent(targetEvent) && scopeInput.value === 'one') {
          const single = updateSingleOccurrence(targetEvent, baseDate, { ...changes, start: datetimeValue });
          if (reminder === undefined) delete single.reminder;
        } else {
          shiftSeriesStart(targetEvent, baseDate, startDate);
          Object.assign(targetEvent, changes, { recurrence });
          if (!goalId) delete targetEvent.goalId;
          if (reminder === undefined) delete targetEvent.reminder;
        }
      }
    } else {
      const newEvent = {
        id: uid(),
        title: title || t('calendar.newEventTitle'),
        location: locationInput.value.trim(),
        start: datetimeValue,
        duration,
        recurrence,
        typeId,
        color
      };
      if (goalId) newEvent.goalId = goalId;
      if (reminder !== undefined) newEvent.reminder = reminder;
      appData.calendar.events.push(newEvent);
    }
    saveData();
    modal.hidden = true;
    renderCalendar();
    if (typeof askCalendarConflictsOn === 'function' && datetimeInput.value) {
      askCalendarConflictsOn(new Date(datetimeInput.value));
    }
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
