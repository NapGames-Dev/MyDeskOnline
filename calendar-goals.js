/* ═══════════════════════════════════════════════════════════
   AGENDA : OBJECTIFS DE RÉVISION
   Un objectif = un volume par semaine (ex. 4 h de révision) et une
   durée de séance (ex. 1 h). On attrape la carte de l'objectif et on
   la dépose dans l'agenda : ça crée une séance liée (event.goalId).
   La carte montre le total planifié sur la semaine affichée.
   Données : appData.calendar.goals = [{ id, name, minutesPerWeek,
   sessionMinutes, color }] (synchronisées).
   ═══════════════════════════════════════════════════════════ */

const GOAL_TRANSLATIONS = {
  fr: {
    title: '🎯 Objectifs de la semaine',
    add: '＋ Objectif',
    hint: 'Attrape un objectif et dépose-le dans l’agenda pour planifier une séance.',
    hintTouch: 'Appui long sur un objectif, puis glisse-le dans l’agenda.',
    progress: '{done} / {target}',
    reached: 'Objectif atteint ✓',
    remaining: 'Reste {time}',
    session: 'Séance de {time}',
    edit: 'Réglages de l’objectif',
    name: 'Nom',
    perWeek: 'Heures par semaine',
    sessionLength: 'Durée d’une séance (min)',
    color: 'Couleur',
    save: 'Enregistrer',
    cancel: 'Annuler',
    remove: 'Supprimer',
    removeConfirm: 'Supprimer l’objectif « {name} » ? Les séances déjà placées restent dans l’agenda.',
    defaultName: 'Révision',
    eventGoal: 'Compte pour l’objectif',
    none: 'Aucun',
    placed: 'Séance « {name} » ajoutée : {done} / {target} cette semaine.'
  },
  en: {
    title: '🎯 Weekly goals',
    add: '＋ Goal',
    hint: 'Grab a goal and drop it in the calendar to plan a session.',
    hintTouch: 'Long-press a goal, then drag it into the calendar.',
    progress: '{done} / {target}',
    reached: 'Goal reached ✓',
    remaining: '{time} left',
    session: '{time} session',
    edit: 'Goal settings',
    name: 'Name',
    perWeek: 'Hours per week',
    sessionLength: 'Session length (min)',
    color: 'Color',
    save: 'Save',
    cancel: 'Cancel',
    remove: 'Delete',
    removeConfirm: 'Delete the goal "{name}"? Sessions already placed stay in the calendar.',
    defaultName: 'Study',
    eventGoal: 'Counts towards goal',
    none: 'None',
    placed: 'Session "{name}" added: {done} / {target} this week.'
  },
  vi: {
    title: '🎯 Mục tiêu tuần',
    add: '＋ Mục tiêu',
    hint: 'Kéo một mục tiêu vào lịch để lên kế hoạch.',
    hintTouch: 'Nhấn giữ một mục tiêu rồi kéo vào lịch.',
    progress: '{done} / {target}',
    reached: 'Đã đạt ✓',
    remaining: 'Còn {time}',
    session: 'Buổi {time}',
    edit: 'Cài đặt mục tiêu',
    name: 'Tên',
    perWeek: 'Giờ mỗi tuần',
    sessionLength: 'Thời lượng buổi (phút)',
    color: 'Màu',
    save: 'Lưu',
    cancel: 'Hủy',
    remove: 'Xóa',
    removeConfirm: 'Xóa mục tiêu "{name}"?',
    defaultName: 'Ôn tập',
    eventGoal: 'Tính vào mục tiêu',
    none: 'Không',
    placed: 'Đã thêm "{name}": {done} / {target} tuần này.'
  }
};

const GOAL_DEFAULT_COLOR = '#8b5cf6';
const GOAL_LONG_PRESS_MS = 300;
let goalEditingId = null; // id de l'objectif en cours de réglage ('new' = création)
let goalDrag = null;

function registerGoalTranslations() {
  Object.keys(translations).forEach((language) => {
    translations[language].goals = GOAL_TRANSLATIONS[language] || GOAL_TRANSLATIONS.fr;
  });
}

function calendarGoals() {
  if (!Array.isArray(appData.calendar.goals)) appData.calendar.goals = [];
  return appData.calendar.goals;
}

function goalFormatMinutes(minutes) {
  const total = Math.max(0, Math.round(minutes));
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  if (!hours) return `${rest} min`;
  return rest ? `${hours}h${String(rest).padStart(2, '0')}` : `${hours}h`;
}

// Minutes planifiées pour cet objectif sur la semaine affichée.
function goalPlannedMinutes(goal) {
  return appData.calendar.events
    .filter((event) => event.goalId === goal.id)
    .flatMap((event) => getOccurrencesForWeek(event))
    .reduce((sum, occurrence) => sum + (Number(occurrence.duration) || 0), 0);
}

function goalDragActive() {
  return Boolean(goalDrag && goalDrag.active);
}

/* ── Bandeau des objectifs ─────────────────────────────────── */

function renderGoalsPanel() {
  const panel = document.getElementById('calendar-goals');
  if (!panel || !appData.calendar) return;
  if (goalDragActive()) return; // pas de nouveau rendu en plein glisser
  panel.innerHTML = '';
  const goals = calendarGoals();

  const head = document.createElement('div');
  head.className = 'calendar-goals__head';
  const title = document.createElement('h3');
  title.textContent = t('goals.title');
  const add = document.createElement('button');
  add.type = 'button';
  add.className = 'btn-secondary calendar-goals__add';
  add.textContent = t('goals.add');
  add.addEventListener('click', () => {
    goalEditingId = 'new';
    renderGoalsPanel();
  });
  head.append(title, add);
  panel.appendChild(head);

  if (goals.length) {
    const list = document.createElement('div');
    list.className = 'calendar-goals__list';
    goals.forEach((goal) => list.appendChild(renderGoalCard(goal)));
    panel.appendChild(list);
    const hint = document.createElement('p');
    hint.className = 'calendar-goals__hint';
    const touch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    hint.textContent = t(touch ? 'goals.hintTouch' : 'goals.hint');
    panel.appendChild(hint);
  }

  if (goalEditingId) {
    const goal = goalEditingId === 'new' ? null : goals.find((g) => g.id === goalEditingId);
    if (goalEditingId === 'new' || goal) panel.appendChild(renderGoalForm(goal));
    else goalEditingId = null;
  }
  panel.hidden = false;
}

function renderGoalCard(goal) {
  const target = Math.max(1, Number(goal.minutesPerWeek) || 0);
  const done = goalPlannedMinutes(goal);
  const reached = done >= target;
  const card = document.createElement('div');
  card.className = `goal-card${reached ? ' is-reached' : ''}`;
  card.style.setProperty('--goal-color', goal.color || GOAL_DEFAULT_COLOR);
  card.dataset.goalId = goal.id;

  const top = document.createElement('div');
  top.className = 'goal-card__top';
  const name = document.createElement('strong');
  name.textContent = goal.name;
  const gear = document.createElement('button');
  gear.type = 'button';
  gear.className = 'goal-card__gear';
  gear.textContent = '⚙';
  gear.title = t('goals.edit');
  gear.setAttribute('aria-label', t('goals.edit'));
  gear.addEventListener('click', () => {
    goalEditingId = goalEditingId === goal.id ? null : goal.id;
    renderGoalsPanel();
  });
  top.append(name, gear);

  const numbers = document.createElement('div');
  numbers.className = 'goal-card__numbers';
  numbers.textContent = t('goals.progress', { done: goalFormatMinutes(done), target: goalFormatMinutes(target) });
  const bar = document.createElement('div');
  bar.className = 'goal-card__bar';
  const fill = document.createElement('span');
  fill.style.width = `${Math.min(100, (done / target) * 100)}%`;
  bar.appendChild(fill);
  const status = document.createElement('small');
  status.textContent = reached
    ? t('goals.reached')
    : `${t('goals.remaining', { time: goalFormatMinutes(target - done) })} · ${t('goals.session', { time: goalFormatMinutes(goal.sessionMinutes || 60) })}`;

  card.append(top, numbers, bar, status);
  card.addEventListener('pointerdown', (event) => startGoalDrag(event, goal, card));
  return card;
}

function renderGoalForm(goal) {
  const form = document.createElement('form');
  form.className = 'goal-form';
  const field = (labelKey, input) => {
    const label = document.createElement('label');
    const span = document.createElement('span');
    span.textContent = t(labelKey);
    label.append(span, input);
    return label;
  };
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.required = true;
  nameInput.value = goal ? goal.name : t('goals.defaultName');
  const hoursInput = document.createElement('input');
  hoursInput.type = 'number';
  hoursInput.min = '0.25';
  hoursInput.step = '0.25';
  hoursInput.value = goal ? String((goal.minutesPerWeek || 240) / 60) : '4';
  const sessionInput = document.createElement('input');
  sessionInput.type = 'number';
  sessionInput.min = '15';
  sessionInput.step = '15';
  sessionInput.value = goal ? String(goal.sessionMinutes || 60) : '60';
  const colorInput = document.createElement('input');
  colorInput.type = 'color';
  colorInput.value = goal ? goal.color || GOAL_DEFAULT_COLOR : GOAL_DEFAULT_COLOR;

  const fields = document.createElement('div');
  fields.className = 'goal-form__fields';
  fields.append(field('goals.name', nameInput), field('goals.perWeek', hoursInput), field('goals.sessionLength', sessionInput), field('goals.color', colorInput));

  const actions = document.createElement('div');
  actions.className = 'goal-form__actions';
  const save = document.createElement('button');
  save.type = 'submit';
  save.textContent = t('goals.save');
  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.className = 'btn-secondary';
  cancel.textContent = t('goals.cancel');
  cancel.addEventListener('click', () => {
    goalEditingId = null;
    renderGoalsPanel();
  });
  actions.append(save, cancel);
  if (goal) {
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'btn-secondary goal-form__remove';
    remove.textContent = t('goals.remove');
    remove.addEventListener('click', () => {
      if (!window.confirm(t('goals.removeConfirm', { name: goal.name }))) return;
      appData.calendar.goals = calendarGoals().filter((g) => g.id !== goal.id);
      appData.calendar.events.forEach((event) => {
        if (event.goalId === goal.id) delete event.goalId;
      });
      goalEditingId = null;
      saveData();
      renderCalendar();
    });
    actions.appendChild(remove);
  }

  form.append(fields, actions);
  form.addEventListener('submit', (submitEvent) => {
    submitEvent.preventDefault();
    const name = nameInput.value.trim() || t('goals.defaultName');
    const minutesPerWeek = Math.max(15, Math.round((Number(hoursInput.value) || 4) * 60));
    const sessionMinutes = Math.max(15, Math.round((Number(sessionInput.value) || 60) / 15) * 15);
    const color = colorInput.value || GOAL_DEFAULT_COLOR;
    if (goal) {
      // Séances déjà placées : même couleur, et même titre si on ne l'avait pas changé.
      appData.calendar.events.forEach((event) => {
        if (event.goalId !== goal.id) return;
        if (event.title === goal.name) event.title = name;
        event.color = color;
      });
      Object.assign(goal, { name, minutesPerWeek, sessionMinutes, color });
    } else {
      calendarGoals().push({ id: uid(), name, minutesPerWeek, sessionMinutes, color });
    }
    goalEditingId = null;
    saveData();
    renderCalendar();
  });
  requestAnimationFrame(() => nameInput.focus());
  return form;
}

/* ── Glisser un objectif dans l'agenda ─────────────────────── */

function startGoalDrag(pointerEvent, goal, card) {
  if (pointerEvent.button !== 0 || goalDrag || pointerEvent.target.closest('button, input, select')) return;
  goalDrag = {
    pointerId: pointerEvent.pointerId,
    goal,
    card,
    startX: pointerEvent.clientX,
    startY: pointerEvent.clientY,
    touch: pointerEvent.pointerType !== 'mouse',
    active: false,
    timer: null,
    ghost: null,
    start: null
  };
  if (goalDrag.touch) goalDrag.timer = setTimeout(activateGoalDrag, GOAL_LONG_PRESS_MS);
  document.addEventListener('pointermove', onGoalDragMove);
  document.addEventListener('pointerup', endGoalDrag);
  document.addEventListener('pointercancel', cancelGoalDrag);
}

function activateGoalDrag() {
  if (!goalDrag || goalDrag.active) return;
  goalDrag.active = true;
  const { goal, card } = goalDrag;
  card.classList.add('is-dragging');
  const ghost = document.createElement('div');
  ghost.className = 'goal-ghost';
  ghost.style.setProperty('--goal-color', goal.color || GOAL_DEFAULT_COLOR);
  const minutes = goal.sessionMinutes || 60;
  ghost.style.height = `${Math.max(24, (minutes / 60) * (calendarHourHeight || 48))}px`;
  const name = document.createElement('strong');
  name.textContent = goal.name;
  const time = document.createElement('span');
  time.textContent = goalFormatMinutes(minutes);
  ghost.append(name, time);
  document.body.appendChild(ghost);
  goalDrag.ghost = ghost;
  goalDrag.timeEl = time;
  placeGoalGhost(goalDrag.startX, goalDrag.startY);
  if (goalDrag.touch && navigator.vibrate) navigator.vibrate(15);
}

function placeGoalGhost(x, y) {
  if (!goalDrag || !goalDrag.ghost) return;
  goalDrag.ghost.style.left = `${x - 20}px`;
  goalDrag.ghost.style.top = `${y - 10}px`;
}

function onGoalDragMove(pointerEvent) {
  if (!goalDrag || pointerEvent.pointerId !== goalDrag.pointerId) return;
  if (!goalDrag.active) {
    const distance = Math.hypot(pointerEvent.clientX - goalDrag.startX, pointerEvent.clientY - goalDrag.startY);
    if (distance < 6) return;
    if (goalDrag.touch) {
      cleanupGoalDrag(); // le doigt a bougé avant l'appui long : défilement
      return;
    }
    activateGoalDrag();
  }
  pointerEvent.preventDefault();
  placeGoalGhost(pointerEvent.clientX, pointerEvent.clientY);
  if (pointerEvent.clientY < 40) window.scrollBy(0, -12);
  else if (pointerEvent.clientY > window.innerHeight - 40) window.scrollBy(0, 12);

  // Le haut de la séance se cale sur le haut du fantôme (10 px au-dessus du doigt).
  const target = document.elementFromPoint(pointerEvent.clientX, pointerEvent.clientY - 10);
  const cell = target && target.closest('.calendar-grid .hour-cell');
  document.querySelectorAll('.hour-cell.goal-drop-target').forEach((node) => node.classList.remove('goal-drop-target'));
  if (!cell) {
    goalDrag.start = null;
    goalDrag.timeEl.textContent = goalFormatMinutes(goalDrag.goal.sessionMinutes || 60);
    return;
  }
  cell.classList.add('goal-drop-target');
  const rect = cell.getBoundingClientRect();
  let minutes = Number(cell.dataset.hour) * 60 + ((pointerEvent.clientY - 10 - rect.top) / rect.height) * 60;
  minutes = Math.round(minutes / EVENT_DURATION_STEP) * EVENT_DURATION_STEP;
  minutes = Math.max(CALENDAR_START_HOUR * 60, Math.min(CALENDAR_END_MINUTE - EVENT_DURATION_STEP, minutes));
  const start = new Date(cell.dataset.date);
  start.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  goalDrag.start = start;
  const end = new Date(start.getTime() + (goalDrag.goal.sessionMinutes || 60) * 60000);
  goalDrag.timeEl.textContent = `${start.toLocaleDateString(getCurrentLocale(), { weekday: 'short' })} ${formatTime(start)} – ${formatTime(end)}`;
}

function endGoalDrag(pointerEvent) {
  if (!goalDrag || pointerEvent.pointerId !== goalDrag.pointerId) return;
  const { active, start, goal } = goalDrag;
  cleanupGoalDrag();
  if (!active || !start) {
    if (active) renderGoalsPanel();
    return;
  }
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const duration = Math.max(EVENT_DURATION_STEP, Math.min(goal.sessionMinutes || 60, CALENDAR_END_MINUTE - startMinutes));
  appData.calendar.events.push({
    id: uid(),
    title: goal.name,
    start: toLocalInputValue(start),
    duration,
    recurrence: 'none',
    typeId: '',
    color: goal.color || GOAL_DEFAULT_COLOR,
    goalId: goal.id
  });
  saveData();
  renderCalendar();
  if (typeof showUndoToast === 'function') {
    const target = Math.max(1, Number(goal.minutesPerWeek) || 0);
    const text = t('goals.placed', { name: goal.name, done: goalFormatMinutes(goalPlannedMinutes(goal)), target: goalFormatMinutes(target) });
    const toastText = document.getElementById('undo-toast-text');
    showUndoToast('undo.undo');
    if (toastText) toastText.textContent = text;
  }
}

function cancelGoalDrag(pointerEvent) {
  if (!goalDrag || (pointerEvent && pointerEvent.pointerId !== goalDrag.pointerId)) return;
  const wasActive = goalDrag.active;
  cleanupGoalDrag();
  if (wasActive) renderGoalsPanel();
}

function cleanupGoalDrag() {
  if (!goalDrag) return;
  clearTimeout(goalDrag.timer);
  if (goalDrag.ghost) goalDrag.ghost.remove();
  goalDrag.card.classList.remove('is-dragging');
  document.querySelectorAll('.hour-cell.goal-drop-target').forEach((node) => node.classList.remove('goal-drop-target'));
  goalDrag = null;
  document.removeEventListener('pointermove', onGoalDragMove);
  document.removeEventListener('pointerup', endGoalDrag);
  document.removeEventListener('pointercancel', cancelGoalDrag);
}

document.addEventListener(
  'touchmove',
  (touchEvent) => {
    if (goalDragActive()) touchEvent.preventDefault();
  },
  { passive: false }
);

document.addEventListener('keydown', (keyEvent) => {
  if (keyEvent.key === 'Escape' && goalDrag) cancelGoalDrag();
});

/* ── Fenêtre d'un évènement : lier à un objectif ───────────── */

function fillEventGoalSelect(selectedId) {
  const select = document.getElementById('event-goal');
  if (!select) return;
  const row = select.closest('label');
  const goals = calendarGoals();
  select.innerHTML = '';
  const none = document.createElement('option');
  none.value = '';
  none.textContent = t('goals.none');
  select.appendChild(none);
  goals.forEach((goal) => {
    const option = document.createElement('option');
    option.value = goal.id;
    option.textContent = goal.name;
    select.appendChild(option);
  });
  select.value = goals.some((goal) => goal.id === selectedId) ? selectedId : '';
  if (row) row.hidden = goals.length === 0;
}
