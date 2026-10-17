/* ═══════════════════════════════════════════════════════════
   ONGLET TO DO LIST
   Des listes (cartes) de tâches. Chaque tâche peut avoir une
   échéance et être marquée importante.
   - Ajout rapide : on tape et Entrée, le champ reste prêt pour la
     suivante. « demain », « vendredi », « 12/10 » fixent l'échéance,
     « ! » marque la tâche importante.
   - Clavier : Entrée dans une tâche en crée une en dessous,
     Retour arrière sur une tâche vide la supprime.
   - Glisser la poignée ⋮⋮ pour réordonner, aussi d'une liste à l'autre.
   - Les tâches faites passent dans « Terminées » (repliable).
   - Vues : Toutes, Aujourd'hui (échéance passée ou du jour), Importantes,
     et recherche.
   Données (synchronisées) : appData.todo.blocks = [{ id, title, color,
   items: [{ id, text, done, doneAt, due: 'AAAA-MM-JJ' | null,
   important, createdAt }] }]
   Sur l'appareil seulement : vue choisie, listes « Terminées » ouvertes.
   ═══════════════════════════════════════════════════════════ */

const TODO_COLORS = ['#4e73df', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];
const TODO_VIEW_KEY = 'mydesk-todo-view';
const TODO_OPEN_DONE_KEY = 'mydesk-todo-open-done';

const TODO_TRANSLATIONS = {
  fr: {
    addBlock: '＋ Nouvelle liste',
    newBlock: 'Nouvelle liste',
    listNamePlaceholder: 'Nom de la liste',
    empty: 'Aucune liste pour l’instant.',
    emptyHint: 'Crée une liste par sujet : cours, perso, courses…',
    emptyStart: 'Créer ma première liste',
    deleteBlockConfirm: 'Supprimer la liste « {name} » et ses {count} tâche(s) à faire ?',
    deleteBlock: 'Supprimer la liste',
    clearDone: 'Effacer les terminées',
    color: 'Couleur',
    menu: 'Options de la liste',
    addPlaceholder: 'Ajouter une tâche…',
    addHint: 'Astuce : « demain », « vendredi », « 12/10 » pour l’échéance, « ! » pour important.',
    taskPlaceholder: 'Tâche',
    done: 'Terminées ({count})',
    progress: '{done}/{total}',
    allDone: 'Tout est fait ✓',
    nothing: 'Rien à faire ici.',
    dueToday: 'Aujourd’hui',
    dueTomorrow: 'Demain',
    dueYesterday: 'Hier',
    overdue: 'En retard · {date}',
    setDue: 'Échéance',
    clearDue: 'Retirer l’échéance',
    quickToday: 'Aujourd’hui',
    quickTomorrow: 'Demain',
    quickWeekend: 'Ce week-end',
    quickNextWeek: 'Semaine prochaine',
    previousMonth: 'Mois précédent',
    nextMonth: 'Mois suivant',
    important: 'Important',
    notImportant: 'Retirer « important »',
    remove: 'Supprimer la tâche',
    drag: 'Glisser pour déplacer',
    removed: 'Tâche supprimée',
    listRemoved: 'Liste supprimée',
    cleared: 'Tâches terminées effacées',
    summary: '{open} à faire',
    summaryOverdue: '{count} en retard',
    summaryToday: '{count} pour aujourd’hui',
    summaryNone: 'Rien à faire, profite !',
    viewAll: 'Toutes',
    viewToday: 'Aujourd’hui',
    viewImportant: 'Importantes',
    search: 'Rechercher une tâche…',
    noMatch: 'Aucune tâche ne correspond.',
    newTask: 'Nouvelle tâche',
    defaultItemName: 'Tâche {index}',
    defaultBlockName: 'Liste {index}',
    words: {
      today: ['aujourd’hui', "aujourd'hui", 'auj', 'today'],
      tomorrow: ['demain', 'tomorrow'],
      afterTomorrow: ['après-demain', 'apres-demain'],
      days: [
        ['dimanche', 'sunday'],
        ['lundi', 'monday'],
        ['mardi', 'tuesday'],
        ['mercredi', 'wednesday'],
        ['jeudi', 'thursday'],
        ['vendredi', 'friday'],
        ['samedi', 'saturday']
      ]
    }
  },
  en: {
    addBlock: '＋ New list',
    newBlock: 'New list',
    listNamePlaceholder: 'List name',
    empty: 'No lists yet.',
    emptyHint: 'Create one list per topic: classes, personal, groceries…',
    emptyStart: 'Create my first list',
    deleteBlockConfirm: 'Delete the list “{name}” and its {count} open task(s)?',
    deleteBlock: 'Delete list',
    clearDone: 'Clear completed',
    color: 'Colour',
    menu: 'List options',
    addPlaceholder: 'Add a task…',
    addHint: 'Tip: “tomorrow”, “friday”, “12/10” set the due date, “!” marks it important.',
    taskPlaceholder: 'Task',
    done: 'Completed ({count})',
    progress: '{done}/{total}',
    allDone: 'All done ✓',
    nothing: 'Nothing to do here.',
    dueToday: 'Today',
    dueTomorrow: 'Tomorrow',
    dueYesterday: 'Yesterday',
    overdue: 'Overdue · {date}',
    setDue: 'Due date',
    clearDue: 'Remove due date',
    quickToday: 'Today',
    quickTomorrow: 'Tomorrow',
    quickWeekend: 'This weekend',
    quickNextWeek: 'Next week',
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
    important: 'Important',
    notImportant: 'Unmark important',
    remove: 'Delete task',
    drag: 'Drag to move',
    removed: 'Task deleted',
    listRemoved: 'List deleted',
    cleared: 'Completed tasks cleared',
    summary: '{open} to do',
    summaryOverdue: '{count} overdue',
    summaryToday: '{count} due today',
    summaryNone: 'Nothing to do, enjoy!',
    viewAll: 'All',
    viewToday: 'Today',
    viewImportant: 'Important',
    search: 'Search tasks…',
    noMatch: 'No matching tasks.',
    newTask: 'New task',
    defaultItemName: 'Task {index}',
    defaultBlockName: 'List {index}'
  },
  vi: {
    addBlock: '＋ Danh sách mới',
    newBlock: 'Danh sách mới',
    listNamePlaceholder: 'Tên danh sách',
    empty: 'Chưa có danh sách nào.',
    emptyHint: 'Mỗi chủ đề một danh sách: học tập, cá nhân, mua sắm…',
    emptyStart: 'Tạo danh sách đầu tiên',
    deleteBlockConfirm: 'Xoá danh sách “{name}” và {count} việc chưa xong?',
    deleteBlock: 'Xoá danh sách',
    clearDone: 'Xoá việc đã xong',
    color: 'Màu',
    menu: 'Tuỳ chọn danh sách',
    addPlaceholder: 'Thêm việc…',
    addHint: 'Mẹo: “demain/tomorrow”, “12/10” để đặt hạn, “!” để đánh dấu quan trọng.',
    taskPlaceholder: 'Việc',
    done: 'Đã xong ({count})',
    progress: '{done}/{total}',
    allDone: 'Đã xong hết ✓',
    nothing: 'Không có việc gì.',
    dueToday: 'Hôm nay',
    dueTomorrow: 'Ngày mai',
    dueYesterday: 'Hôm qua',
    overdue: 'Quá hạn · {date}',
    setDue: 'Hạn chót',
    clearDue: 'Bỏ hạn chót',
    quickToday: 'Hôm nay',
    quickTomorrow: 'Ngày mai',
    quickWeekend: 'Cuối tuần này',
    quickNextWeek: 'Tuần sau',
    previousMonth: 'Tháng trước',
    nextMonth: 'Tháng sau',
    important: 'Quan trọng',
    notImportant: 'Bỏ đánh dấu quan trọng',
    remove: 'Xoá việc',
    drag: 'Kéo để di chuyển',
    removed: 'Đã xoá việc',
    listRemoved: 'Đã xoá danh sách',
    cleared: 'Đã xoá các việc đã xong',
    summary: '{open} việc cần làm',
    summaryOverdue: '{count} quá hạn',
    summaryToday: '{count} hôm nay',
    summaryNone: 'Không còn việc gì!',
    viewAll: 'Tất cả',
    viewToday: 'Hôm nay',
    viewImportant: 'Quan trọng',
    search: 'Tìm việc…',
    noMatch: 'Không có việc phù hợp.',
    newTask: 'Việc mới',
    defaultItemName: 'Việc {index}',
    defaultBlockName: 'Danh sách {index}'
  }
};

function registerTodoTranslations() {
  Object.keys(translations).forEach((language) => {
    translations[language].todo = { ...TODO_TRANSLATIONS.fr, ...(TODO_TRANSLATIONS[language] || {}) };
  });
}

const todoState = {
  view: 'all', // all | today | important
  query: '',
  openDone: new Set(),
  focus: null, // { blockId, itemId, caret } ou { blockId, add: true } ou { blockId, title: true }
  menuBlockId: null,
  drag: null
};

/* ── Petites aides ─────────────────────────────────────────── */

function todoReadLocal(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function todoWriteLocal(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    // préférence d'affichage seulement
  }
}

function todoEl(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined && text !== null) element.textContent = text;
  return element;
}

function todoButton(className, text, title) {
  const button = todoEl('button', `td-btn ${className}`, text);
  button.type = 'button';
  if (title) {
    button.title = title;
    button.setAttribute('aria-label', title);
  }
  return button;
}

function todoToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function todoIso(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function todoDaysUntil(iso) {
  const date = parseDateOnly(iso);
  if (!date) return null;
  return Math.round((date.getTime() - todoToday().getTime()) / DAY_IN_MS);
}

function todoDueLabel(iso) {
  const days = todoDaysUntil(iso);
  if (days === null) return '';
  const date = parseDateOnly(iso);
  const short = date.toLocaleDateString(getCurrentLocale(), { day: 'numeric', month: 'short' });
  if (days === 0) return t('todo.dueToday');
  if (days === 1) return t('todo.dueTomorrow');
  if (days === -1) return t('todo.overdue', { date: t('todo.dueYesterday').toLowerCase() });
  if (days < 0) return t('todo.overdue', { date: short });
  if (days < 7) return date.toLocaleDateString(getCurrentLocale(), { weekday: 'long' });
  return short;
}

function todoDueClass(iso) {
  const days = todoDaysUntil(iso);
  if (days === null) return '';
  if (days < 0) return 'is-overdue';
  if (days === 0) return 'is-today';
  if (days === 1) return 'is-soon';
  return '';
}

function todoBlocks() {
  if (!appData.todo || !Array.isArray(appData.todo.blocks)) appData.todo = { blocks: [] };
  return appData.todo.blocks;
}

function todoFindBlock(blockId) {
  return todoBlocks().find((block) => block.id === blockId) || null;
}

function todoNewItem(text, extra = {}) {
  return { id: uid(), text, done: false, due: null, important: false, createdAt: Date.now(), ...extra };
}

/* ── Ajout rapide : échéance et importance dans le texte ──── */

function todoNormalizeWord(word) {
  return word.toLowerCase().replace(/[’]/g, "'");
}

function todoParseQuickAdd(raw) {
  const words = TODO_TRANSLATIONS.fr.words;
  let due = null;
  let important = false;
  const kept = [];
  const today = todoToday();
  const tokens = raw.trim().split(/\s+/);
  tokens.forEach((token) => {
    const word = todoNormalizeWord(token).replace(/[.,;]$/, '');
    if (/^!{1,3}$/.test(word)) {
      important = true;
      return;
    }
    if (!due) {
      if (words.today.map(todoNormalizeWord).includes(word)) {
        due = todoIso(today);
        return;
      }
      if (words.tomorrow.includes(word)) {
        const date = new Date(today);
        date.setDate(date.getDate() + 1);
        due = todoIso(date);
        return;
      }
      if (words.afterTomorrow.includes(word)) {
        const date = new Date(today);
        date.setDate(date.getDate() + 2);
        due = todoIso(date);
        return;
      }
      const weekday = words.days.findIndex((names) => names.includes(word));
      if (weekday >= 0) {
        // Prochain jour de ce nom (dans 7 jours si c'est aujourd'hui).
        const date = new Date(today);
        const ahead = (weekday - date.getDay() + 7) % 7 || 7;
        date.setDate(date.getDate() + ahead);
        due = todoIso(date);
        return;
      }
      const numeric = word.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
      if (numeric) {
        const day = Number(numeric[1]);
        const month = Number(numeric[2]);
        let year = numeric[3] ? Number(numeric[3]) : today.getFullYear();
        if (year < 100) year += 2000;
        let date = new Date(year, month - 1, day);
        if (date.getMonth() === month - 1 && date.getDate() === day) {
          if (!numeric[3] && date < today) date = new Date(year + 1, month - 1, day);
          due = todoIso(date);
          return;
        }
      }
    }
    kept.push(token);
  });
  return { text: kept.join(' ').trim(), due, important };
}

/* ── Actions ───────────────────────────────────────────────── */

function todoCommit(focus = null) {
  todoState.focus = focus;
  saveData();
  renderTodo();
}

// Une suppression forme sa propre étape d'annulation (sans être regroupée
// avec la frappe qui précède) : Ctrl+Z ou « Annuler » la défait seule.
function todoUndoBoundary() {
  if (typeof undoLastRecordAt !== 'undefined') undoLastRecordAt = 0;
}

function todoAddBlock() {
  const blocks = todoBlocks();
  const block = { id: uid(), title: '', color: TODO_COLORS[blocks.length % TODO_COLORS.length], items: [] };
  blocks.push(block);
  todoCommit({ blockId: block.id, title: true });
}

function todoAddItem(block, raw, afterItemId = null) {
  const parsed = todoParseQuickAdd(raw);
  if (!parsed.text) return null;
  const item = todoNewItem(parsed.text, { due: parsed.due, important: parsed.important });
  const index = afterItemId ? block.items.findIndex((other) => other.id === afterItemId) : -1;
  if (index >= 0) block.items.splice(index + 1, 0, item);
  else {
    // Avant les tâches terminées, pour garder les tâches à faire ensemble.
    const firstDone = block.items.findIndex((other) => other.done);
    block.items.splice(firstDone < 0 ? block.items.length : firstDone, 0, item);
  }
  return item;
}

function todoToggleDone(block, item) {
  item.done = !item.done;
  item.doneAt = item.done ? Date.now() : null;
  // Une tâche faite descend dans « Terminées » ; rouverte, elle remonte en bas des tâches à faire.
  block.items = block.items.filter((other) => other.id !== item.id);
  if (item.done) block.items.unshift(item);
  else {
    const firstDone = block.items.findIndex((other) => other.done);
    block.items.splice(firstDone < 0 ? block.items.length : firstDone, 0, item);
  }
  block.items.sort((a, b) => Number(a.done) - Number(b.done));
  todoCommit();
}

function todoRemoveItem(block, item, focusPrevious = false) {
  todoUndoBoundary();
  const open = block.items.filter((other) => !other.done);
  const index = open.findIndex((other) => other.id === item.id);
  block.items = block.items.filter((other) => other.id !== item.id);
  let focus = null;
  if (focusPrevious) {
    const previous = open[index - 1];
    focus = previous ? { blockId: block.id, itemId: previous.id, caret: 'end' } : { blockId: block.id, add: true };
  }
  todoCommit(focus);
  if (!focusPrevious && typeof showUndoToast === 'function') {
    showUndoToast('undo.undo');
    const text = document.getElementById('undo-toast-text');
    if (text) text.textContent = t('todo.removed');
  }
}

function todoRemoveBlock(block) {
  todoUndoBoundary();
  const open = block.items.filter((item) => !item.done).length;
  if (open && !confirm(t('todo.deleteBlockConfirm', { name: block.title || t('todo.newBlock'), count: open }))) return;
  appData.todo.blocks = todoBlocks().filter((other) => other.id !== block.id);
  todoState.menuBlockId = null;
  todoCommit();
  if (typeof showUndoToast === 'function') {
    showUndoToast('undo.undo');
    const text = document.getElementById('undo-toast-text');
    if (text) text.textContent = t('todo.listRemoved');
  }
}

function todoClearDone(block) {
  todoUndoBoundary();
  block.items = block.items.filter((item) => !item.done);
  todoState.menuBlockId = null;
  todoCommit();
  if (typeof showUndoToast === 'function') {
    showUndoToast('undo.undo');
    const text = document.getElementById('undo-toast-text');
    if (text) text.textContent = t('todo.cleared');
  }
}

let todoPicker = null;

function todoClosePicker() {
  if (!todoPicker) return;
  todoPicker.element.remove();
  document.removeEventListener('pointerdown', todoPicker.outside, true);
  document.removeEventListener('keydown', todoPicker.key, true);
  window.removeEventListener('resize', todoPicker.close);
  todoPicker = null;
}

// Petit calendrier : raccourcis (aujourd'hui, demain, week-end, semaine
// prochaine), grille du mois, et « Retirer l'échéance ».
function todoPickDate(anchor, current, onPick) {
  todoClosePicker();
  const today = todoToday();
  const shift = (days) => {
    const date = new Date(today);
    date.setDate(date.getDate() + days);
    return date;
  };
  const weekday = today.getDay(); // 0 = dimanche
  const quick = [
    ['todo.quickToday', today],
    ['todo.quickTomorrow', shift(1)],
    ['todo.quickWeekend', shift(weekday === 6 || weekday === 0 ? 0 : 6 - weekday)],
    ['todo.quickNextWeek', shift(((8 - weekday) % 7) || 7)]
  ];
  const selected = current ? parseDateOnly(current) : null;
  let month = new Date((selected || today).getFullYear(), (selected || today).getMonth(), 1);

  const element = todoEl('div', 'td-picker');
  element.setAttribute('role', 'dialog');
  element.setAttribute('aria-label', t('todo.setDue'));
  const color = getComputedStyle(anchor).getPropertyValue('--td-color').trim();
  if (color) element.style.setProperty('--td-color', color);

  const pick = (value) => {
    todoClosePicker();
    onPick(value);
  };

  const quickList = todoEl('div', 'td-picker__quick');
  // Pas deux raccourcis pour la même date (ex. le dimanche, « ce week-end » = aujourd'hui).
  const seenDates = new Set();
  quick.forEach(([key, date]) => {
    if (seenDates.has(todoIso(date))) return;
    seenDates.add(todoIso(date));
    const button = todoButton('td-picker__shortcut');
    button.append(todoEl('span', null, t(key)));
    button.append(
      todoEl('span', 'td-picker__hint', date.toLocaleDateString(getCurrentLocale(), { weekday: 'short', day: 'numeric' }))
    );
    if (selected && todoIso(selected) === todoIso(date)) button.classList.add('is-selected');
    button.addEventListener('click', () => pick(todoIso(date)));
    quickList.append(button);
  });
  element.append(quickList);

  const calendar = todoEl('div', 'td-picker__calendar');
  element.append(calendar);

  const drawMonth = () => {
    calendar.innerHTML = '';
    const head = todoEl('div', 'td-picker__head');
    const previous = todoButton('td-picker__nav', '‹', t('todo.previousMonth'));
    previous.addEventListener('click', () => {
      month = new Date(month.getFullYear(), month.getMonth() - 1, 1);
      drawMonth();
    });
    const next = todoButton('td-picker__nav', '›', t('todo.nextMonth'));
    next.addEventListener('click', () => {
      month = new Date(month.getFullYear(), month.getMonth() + 1, 1);
      drawMonth();
    });
    const label = month.toLocaleDateString(getCurrentLocale(), { month: 'long', year: 'numeric' });
    head.append(previous, todoEl('span', 'td-picker__month', label.charAt(0).toUpperCase() + label.slice(1)), next);
    calendar.append(head);

    const grid = todoEl('div', 'td-picker__grid');
    // Initiales des jours, en commençant le lundi.
    for (let index = 0; index < 7; index += 1) {
      const date = new Date(2024, 0, 1 + index); // 1er janvier 2024 = lundi
      grid.append(todoEl('span', 'td-picker__dow', date.toLocaleDateString(getCurrentLocale(), { weekday: 'narrow' })));
    }
    const offset = (month.getDay() + 6) % 7;
    for (let index = 0; index < offset; index += 1) grid.append(todoEl('span'));
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(month.getFullYear(), month.getMonth(), day);
      const button = todoButton('td-picker__day', String(day));
      const iso = todoIso(date);
      if (iso === todoIso(today)) button.classList.add('is-today');
      if (selected && iso === todoIso(selected)) button.classList.add('is-selected');
      if (date < today) button.classList.add('is-past');
      button.title = date.toLocaleDateString(getCurrentLocale(), { weekday: 'long', day: 'numeric', month: 'long' });
      button.addEventListener('click', () => pick(iso));
      grid.append(button);
    }
    calendar.append(grid);
  };
  drawMonth();

  if (current) {
    const clear = todoButton('td-picker__clear', t('todo.clearDue'));
    clear.addEventListener('click', () => pick(null));
    element.append(clear);
  }

  document.body.appendChild(element);
  // Placé sous le bouton, sans sortir de l'écran.
  const rect = anchor.getBoundingClientRect();
  const width = element.offsetWidth;
  const height = element.offsetHeight;
  let left = Math.min(rect.left, window.innerWidth - width - 8);
  let top = rect.bottom + 6;
  if (top + height > window.innerHeight - 8) top = Math.max(8, rect.top - height - 6);
  left = Math.max(8, left);
  element.style.left = `${left}px`;
  element.style.top = `${top}px`;

  const outside = (event) => {
    if (!element.contains(event.target) && event.target !== anchor) todoClosePicker();
  };
  const key = (event) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      todoClosePicker();
    }
  };
  document.addEventListener('pointerdown', outside, true);
  document.addEventListener('keydown', key, true);
  window.addEventListener('resize', todoClosePicker);
  todoPicker = { element, outside, key, close: todoClosePicker };
  const first = element.querySelector('.td-picker__shortcut');
  if (first) first.focus();
}

/* ── Filtres ───────────────────────────────────────────────── */

function todoMatches(item) {
  if (todoState.query) {
    const query = todoState.query.toLowerCase();
    if (!item.text.toLowerCase().includes(query)) return false;
  }
  if (todoState.view === 'today') {
    const days = item.due ? todoDaysUntil(item.due) : null;
    return !item.done && days !== null && days <= 0;
  }
  if (todoState.view === 'important') return !item.done && item.important;
  return true;
}

function todoFiltering() {
  return todoState.view !== 'all' || Boolean(todoState.query);
}

/* ── Affichage ─────────────────────────────────────────────── */

function renderTodoToolbar(container) {
  const bar = todoEl('div', 'td-toolbar');

  const all = todoBlocks().flatMap((block) => block.items);
  const open = all.filter((item) => !item.done);
  const overdue = open.filter((item) => item.due && todoDaysUntil(item.due) < 0).length;
  const today = open.filter((item) => item.due && todoDaysUntil(item.due) === 0).length;
  const summary = todoEl('p', 'td-summary');
  if (!open.length) summary.textContent = all.length ? t('todo.summaryNone') : '';
  else {
    summary.append(todoEl('strong', null, t('todo.summary', { open: open.length })));
    if (overdue) summary.append(todoEl('span', 'td-summary__overdue', t('todo.summaryOverdue', { count: overdue })));
    if (today) summary.append(todoEl('span', 'td-summary__today', t('todo.summaryToday', { count: today })));
  }

  const views = todoEl('div', 'td-views');
  [
    ['all', 'todo.viewAll'],
    ['today', 'todo.viewToday'],
    ['important', 'todo.viewImportant']
  ].forEach(([view, key]) => {
    const button = todoButton(`td-view${todoState.view === view ? ' is-active' : ''}`, t(key));
    button.setAttribute('aria-pressed', todoState.view === view ? 'true' : 'false');
    if (view === 'today' && overdue + today) button.append(todoEl('span', 'td-view__count', String(overdue + today)));
    button.addEventListener('click', () => {
      todoState.view = view;
      todoWriteLocal(TODO_VIEW_KEY, view);
      renderTodo();
    });
    views.append(button);
  });

  const search = todoEl('input', 'td-search');
  search.type = 'search';
  search.placeholder = t('todo.search');
  search.value = todoState.query;
  search.addEventListener('input', () => {
    todoState.query = search.value.trim();
    renderTodo();
    const again = document.querySelector('#todo .td-search');
    if (again) {
      again.focus();
      again.setSelectionRange(again.value.length, again.value.length);
    }
  });

  const add = todoButton('td-add-list', t('todo.addBlock'));
  add.addEventListener('click', () => todoAddBlock());

  const left = todoEl('div', 'td-toolbar__left');
  left.append(summary, views);
  const right = todoEl('div', 'td-toolbar__right');
  right.append(search, add);
  bar.append(left, right);
  container.append(bar);
}

function todoAutoGrow(textarea) {
  // Onglet caché (rendu au démarrage ou après une synchro) : scrollHeight vaut
  // 0 et la tâche se réduisait à une barre vide. On mesure à l'affichage.
  if (!textarea.offsetParent) {
    textarea.style.height = '';
    return;
  }
  textarea.style.height = 'auto';
  textarea.style.height = `${textarea.scrollHeight}px`;
}

// Recalcule la hauteur des tâches quand l'onglet devient visible.
function todoWatchVisibility() {
  const panel = document.getElementById('todo');
  if (!panel || panel.dataset.tdWatch) return;
  panel.dataset.tdWatch = '1';
  new MutationObserver(() => {
    if (panel.classList.contains('active')) panel.querySelectorAll('.td-task__text').forEach(todoAutoGrow);
  }).observe(panel, { attributes: true, attributeFilter: ['class'] });
}

function renderTodoItem(block, item) {
  const row = todoEl('li', 'td-task');
  row.dataset.itemId = item.id;
  row.classList.toggle('is-done', item.done);
  row.classList.toggle('is-important', Boolean(item.important));

  if (!item.done && !todoFiltering()) {
    const handle = todoButton('td-task__handle', '⋮⋮', t('todo.drag'));
    handle.tabIndex = -1;
    handle.addEventListener('pointerdown', (event) => todoStartDrag(event, block, item, row));
    row.append(handle);
  }

  const check = todoEl('input', 'td-task__check');
  check.type = 'checkbox';
  check.checked = item.done;
  check.style.setProperty('--td-color', block.color || TODO_COLORS[0]);
  check.addEventListener('change', () => todoToggleDone(block, item));
  row.append(check);

  if (item.important && !item.done) {
    const flag = todoEl('span', 'td-flag', '★');
    flag.title = t('todo.important');
    row.append(flag);
  }

  const body = todoEl('div', 'td-task__body');
  const text = todoEl('textarea', 'td-task__text');
  text.rows = 1;
  text.value = item.text;
  text.placeholder = t('todo.taskPlaceholder');
  text.readOnly = item.done;
  text.addEventListener('input', () => {
    // Une tâche tient sur une ligne logique : un retour à la ligne collé devient un espace.
    if (/\n/.test(text.value)) text.value = text.value.replace(/\s*\n+\s*/g, ' ');
    item.text = text.value;
    todoAutoGrow(text);
    saveDataSoon();
  });
  text.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.isComposing) {
      event.preventDefault();
      // Entrée : nouvelle tâche juste en dessous (même échéance si on enchaîne).
      const fresh = todoNewItem('', { due: item.due });
      const index = block.items.findIndex((other) => other.id === item.id);
      block.items.splice(index + 1, 0, fresh);
      fresh.text = '';
      todoCommit({ blockId: block.id, itemId: fresh.id, caret: 'end' });
    } else if (event.key === 'Backspace' && !text.value) {
      event.preventDefault();
      todoRemoveItem(block, item, true);
    } else if (event.key === 'Escape') {
      text.blur();
    }
  });
  text.addEventListener('blur', () => {
    // Une tâche laissée vide disparaît.
    if (!item.text.trim() && todoFindBlock(block.id) && block.items.includes(item)) {
      setTimeout(() => {
        if (!item.text.trim() && block.items.includes(item)) {
          block.items = block.items.filter((other) => other.id !== item.id);
          saveData();
          renderTodo();
        }
      }, 150);
    }
  });
  body.append(text);

  if (item.due) {
    const due = todoButton(`td-due ${todoDueClass(item.due)}`, `📅 ${todoDueLabel(item.due)}`, t('todo.setDue'));
    due.addEventListener('click', () =>
      todoPickDate(due, item.due, (value) => {
        item.due = value;
        todoCommit();
      })
    );
    body.append(due);
  }
  row.append(body);

  const actions = todoEl('div', 'td-task__actions');
  if (!item.done) {
    const star = todoButton(
      `td-task__star${item.important ? ' is-on' : ''}`,
      item.important ? '★' : '☆',
      item.important ? t('todo.notImportant') : t('todo.important')
    );
    star.addEventListener('click', () => {
      item.important = !item.important;
      todoCommit();
    });
    actions.append(star);
    if (!item.due) {
      const calendar = todoButton('td-task__date', '📅', t('todo.setDue'));
      calendar.addEventListener('click', () =>
        todoPickDate(calendar, null, (value) => {
          item.due = value;
          todoCommit();
        })
      );
      actions.append(calendar);
    }
  }
  const remove = todoButton('td-task__remove', '✕', t('todo.remove'));
  remove.addEventListener('click', () => todoRemoveItem(block, item));
  actions.append(remove);
  row.append(actions);
  return row;
}

function renderTodoBlock(block) {
  const card = todoEl('section', 'td-list');
  card.dataset.blockId = block.id;
  card.style.setProperty('--td-color', block.color || TODO_COLORS[0]);

  const open = block.items.filter((item) => !item.done);
  const done = block.items.filter((item) => item.done);
  const filtering = todoFiltering();

  const head = todoEl('header', 'td-list__head');
  const title = todoEl('input', 'td-list__title');
  title.type = 'text';
  title.value = block.title;
  title.placeholder = t('todo.listNamePlaceholder');
  title.addEventListener('input', () => {
    block.title = title.value;
    saveDataSoon();
  });
  title.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const add = card.querySelector('.td-add__input');
      if (add) add.focus();
    }
  });
  head.append(title);
  if (block.items.length) {
    head.append(todoEl('span', 'td-list__count', t('todo.progress', { done: done.length, total: block.items.length })));
  }
  const menuButton = todoButton('td-list__menu-btn', '⋯', t('todo.menu'));
  menuButton.setAttribute('aria-expanded', todoState.menuBlockId === block.id ? 'true' : 'false');
  menuButton.addEventListener('click', () => {
    todoState.menuBlockId = todoState.menuBlockId === block.id ? null : block.id;
    renderTodo();
  });
  head.append(menuButton);
  card.append(head);

  if (block.items.length) {
    const bar = todoEl('div', 'td-list__progress');
    const fill = todoEl('span');
    fill.style.width = `${Math.round((done.length / block.items.length) * 100)}%`;
    bar.append(fill);
    card.append(bar);
  }

  if (todoState.menuBlockId === block.id) {
    const menu = todoEl('div', 'td-menu');
    const colors = todoEl('div', 'td-menu__colors');
    colors.setAttribute('aria-label', t('todo.color'));
    TODO_COLORS.forEach((color) => {
      const swatch = todoButton(`td-swatch${block.color === color ? ' is-active' : ''}`, '', `${t('todo.color')} ${color}`);
      swatch.style.background = color;
      swatch.addEventListener('click', () => {
        block.color = color;
        todoCommit();
      });
      colors.append(swatch);
    });
    menu.append(colors);
    const actions = todoEl('div', 'td-menu__actions');
    if (done.length) {
      const clear = todoButton('td-menu__action', t('todo.clearDone'));
      clear.addEventListener('click', () => todoClearDone(block));
      actions.append(clear);
    }
    const remove = todoButton('td-menu__action is-danger', t('todo.deleteBlock'));
    remove.addEventListener('click', () => todoRemoveBlock(block));
    actions.append(remove);
    menu.append(actions);
    card.append(menu);
  }

  const visibleOpen = open.filter(todoMatches);
  const list = todoEl('ul', 'td-tasks');
  list.dataset.blockId = block.id;
  visibleOpen.forEach((item) => list.append(renderTodoItem(block, item)));
  card.append(list);

  if (!filtering) {
    if (!open.length) card.append(todoEl('p', 'td-empty-list', done.length ? t('todo.allDone') : t('todo.nothing')));
    const add = todoEl('form', 'td-add');
    const plus = todoEl('span', 'td-add__plus', '+');
    const input = todoEl('input', 'td-add__input');
    input.type = 'text';
    input.placeholder = t('todo.addPlaceholder');
    input.setAttribute('aria-label', t('todo.addPlaceholder'));
    input.title = t('todo.addHint');
    add.append(plus, input);
    add.addEventListener('submit', (event) => {
      event.preventDefault();
      const item = todoAddItem(block, input.value);
      if (item) todoCommit({ blockId: block.id, add: true });
    });
    card.append(add);
  }

  const visibleDone = filtering ? done.filter(todoMatches) : done;
  if (visibleDone.length && todoState.view === 'all') {
    const isOpen = todoState.openDone.has(block.id) || Boolean(todoState.query);
    const toggle = todoButton('td-done-toggle', `${isOpen ? '▾' : '▸'} ${t('todo.done', { count: visibleDone.length })}`);
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    toggle.addEventListener('click', () => {
      if (todoState.openDone.has(block.id)) todoState.openDone.delete(block.id);
      else todoState.openDone.add(block.id);
      todoWriteLocal(TODO_OPEN_DONE_KEY, JSON.stringify([...todoState.openDone]));
      renderTodo();
    });
    card.append(toggle);
    if (isOpen) {
      const doneList = todoEl('ul', 'td-tasks td-tasks--done');
      visibleDone.forEach((item) => doneList.append(renderTodoItem(block, item)));
      card.append(doneList);
    }
  }
  return card;
}

function renderTodo() {
  const panel = document.getElementById('todo');
  const container = document.getElementById('todo-blocks');
  if (!panel || !container) return;
  // Barre d'outils au-dessus des listes (remplace l'ancien en-tête).
  let toolbar = panel.querySelector('.td-toolbar-host');
  if (!toolbar) {
    toolbar = todoEl('div', 'td-toolbar-host');
    panel.insertBefore(toolbar, container);
  }
  toolbar.innerHTML = '';
  container.innerHTML = '';
  container.className = 'td-board';

  const blocks = todoBlocks();
  if (!blocks.length) {
    const empty = todoEl('div', 'td-empty');
    empty.append(todoEl('div', 'td-empty__icon', '✓'));
    empty.append(todoEl('p', 'td-empty__title', t('todo.empty')));
    empty.append(todoEl('p', 'td-empty__hint', t('todo.emptyHint')));
    const start = todoButton('td-add-list', t('todo.emptyStart'));
    start.addEventListener('click', () => todoAddBlock());
    empty.append(start);
    container.append(empty);
    return;
  }
  renderTodoToolbar(toolbar);

  const filtering = todoFiltering();
  let shown = 0;
  blocks.forEach((block) => {
    if (filtering && !block.items.some(todoMatches)) return;
    container.append(renderTodoBlock(block));
    shown += 1;
  });
  if (!shown) container.append(todoEl('p', 'td-no-match', t('todo.noMatch')));
  container.querySelectorAll('.td-task__text').forEach(todoAutoGrow);
  todoWatchVisibility();
  todoApplyFocus();
}

function todoApplyFocus() {
  const focus = todoState.focus;
  todoState.focus = null;
  if (!focus) return;
  const card = document.querySelector(`#todo .td-list[data-block-id="${focus.blockId}"]`);
  if (!card) return;
  let target = null;
  if (focus.add) target = card.querySelector('.td-add__input');
  else if (focus.title) target = card.querySelector('.td-list__title');
  else if (focus.itemId) target = card.querySelector(`.td-task[data-item-id="${focus.itemId}"] .td-task__text`);
  if (!target) return;
  target.focus();
  if (focus.caret === 'end' && typeof target.setSelectionRange === 'function') {
    target.setSelectionRange(target.value.length, target.value.length);
  }
}

/* ── Glisser pour réordonner ───────────────────────────────── */

function todoStartDrag(event, block, item, row) {
  if (event.button !== undefined && event.button !== 0) return;
  event.preventDefault();
  todoState.drag = { item, fromBlock: block, row, pointerId: event.pointerId, moved: false };
  row.classList.add('is-dragging');
  document.body.classList.add('td-dragging');
  document.addEventListener('pointermove', todoDragMove);
  document.addEventListener('pointerup', todoDragEnd);
  document.addEventListener('pointercancel', todoDragCancel);
}

function todoDragMove(event) {
  const drag = todoState.drag;
  if (!drag || event.pointerId !== drag.pointerId) return;
  event.preventDefault();
  drag.row.style.visibility = 'hidden';
  const under = document.elementFromPoint(event.clientX, event.clientY);
  drag.row.style.visibility = '';
  if (!under) return;
  const list = under.closest('.td-list');
  const tasks = list && list.querySelector('.td-tasks:not(.td-tasks--done)');
  if (!tasks) return;
  const target = under.closest('.td-task');
  if (target && target !== drag.row && tasks.contains(target)) {
    const rect = target.getBoundingClientRect();
    const after = event.clientY > rect.top + rect.height / 2;
    tasks.insertBefore(drag.row, after ? target.nextSibling : target);
  } else if (!target) {
    tasks.appendChild(drag.row);
  }
  drag.moved = true;
}

function todoDragEnd(event) {
  const drag = todoState.drag;
  if (!drag || event.pointerId !== drag.pointerId) return;
  todoDragCleanup();
  if (!drag.moved) return;
  // Nouvel ordre lu dans la page, liste par liste.
  const tasksEl = drag.row.parentElement;
  const toBlock = tasksEl ? todoFindBlock(tasksEl.dataset.blockId) : null;
  if (!toBlock) {
    renderTodo();
    return;
  }
  drag.fromBlock.items = drag.fromBlock.items.filter((other) => other.id !== drag.item.id);
  const order = Array.from(tasksEl.querySelectorAll('.td-task')).map((row) => row.dataset.itemId);
  const openItems = order
    .map((id) => (id === drag.item.id ? drag.item : toBlock.items.find((other) => other.id === id)))
    .filter(Boolean);
  const doneItems = toBlock.items.filter((other) => other.done);
  toBlock.items = [...openItems, ...doneItems];
  todoCommit();
}

function todoDragCancel() {
  todoDragCleanup();
  renderTodo();
}

function todoDragCleanup() {
  const drag = todoState.drag;
  if (drag) drag.row.classList.remove('is-dragging');
  todoState.drag = null;
  document.body.classList.remove('td-dragging');
  document.removeEventListener('pointermove', todoDragMove);
  document.removeEventListener('pointerup', todoDragEnd);
  document.removeEventListener('pointercancel', todoDragCancel);
}

/* ── Démarrage ─────────────────────────────────────────────── */

function initTodo() {
  const savedView = todoReadLocal(TODO_VIEW_KEY);
  if (['all', 'today', 'important'].includes(savedView)) todoState.view = savedView;
  try {
    const openDone = JSON.parse(todoReadLocal(TODO_OPEN_DONE_KEY) || '[]');
    if (Array.isArray(openDone)) todoState.openDone = new Set(openDone);
  } catch (error) {
    todoState.openDone = new Set();
  }
  const oldHeader = document.querySelector('#todo .todo-header');
  if (oldHeader) oldHeader.remove();
  // Fermer le menu d'une liste en cliquant ailleurs.
  document.addEventListener('click', (event) => {
    if (!todoState.menuBlockId) return;
    if (event.target.closest('.td-menu, .td-list__menu-btn')) return;
    todoState.menuBlockId = null;
    renderTodo();
  });
  renderTodo();
}
