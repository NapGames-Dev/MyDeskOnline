/* ═══════════════════════════════════════════════════════════
   AGENDA : ÉVÈNEMENTS QUI SE CHEVAUCHENT
   - Les occurrences qui se chevauchent un même jour forment un
     groupe, affiché côte à côte avec un ⚠ tant que rien n'est choisi.
   - L'utilisateur choisit « le vrai » : il prend presque toute la
     largeur, les autres deviennent des bandes grises (un clic dessus
     permet de changer d'avis). « Les deux sont vrais » garde tout.
   - Le choix est propre à ce jour et à ces évènements
     (appData.calendar.conflictChoices), donc synchronisé.
   - Les écartés peuvent être supprimés (✕ sur la bande, bouton dans
     la fenêtre, ou tous ceux de la semaine depuis le bandeau) : pour
     un évènement répété, seule l'occurrence de ce jour part.
   ═══════════════════════════════════════════════════════════ */

const CONFLICT_TRANSLATIONS = {
  fr: {
    banner: '⚠ {count} chevauchement(s) cette semaine',
    choose: 'Choisir',
    title: 'Lequel est le vrai ?',
    subtitle: '{date} : ces évènements se chevauchent.',
    both: 'Les deux sont vrais',
    all: 'Tous sont vrais',
    later: 'Plus tard',
    reset: 'Redemander (afficher côte à côte)',
    badgeTitle: 'Chevauchement : cliquer pour choisir le vrai',
    dimmedTitle: '{title} : écarté (cliquer pour changer)',
    deleteSetAside: '🗑 Supprimer l’écarté',
    deleteSetAsideMany: '🗑 Supprimer les {count} écartés',
    weekSetAside: '{count} évènement(s) écarté(s) cette semaine',
    deleteWeekSetAside: '🗑 Les supprimer',
    deleted: 'Évènement(s) écarté(s) supprimé(s).'
  },
  en: {
    banner: '⚠ {count} overlap(s) this week',
    choose: 'Choose',
    title: 'Which one is real?',
    subtitle: '{date}: these events overlap.',
    both: 'Both are real',
    all: 'All are real',
    later: 'Later',
    reset: 'Ask again (show side by side)',
    badgeTitle: 'Overlap: click to choose the real one',
    dimmedTitle: '{title}: set aside (click to change)',
    deleteSetAside: '🗑 Delete the set-aside event',
    deleteSetAsideMany: '🗑 Delete the {count} set-aside events',
    weekSetAside: '{count} set-aside event(s) this week',
    deleteWeekSetAside: '🗑 Delete them',
    deleted: 'Set-aside event(s) deleted.'
  }
};

const CONFLICT_CHOSEN_WIDTH = 78; // % de la largeur pour l'évènement choisi
const CONFLICT_KEEP_DAYS = 90; // choix plus vieux que ça : supprimés

let lastConflictGroups = [];
let conflictModal = null;

function registerConflictTranslations() {
  Object.keys(translations).forEach((language) => {
    translations[language].conflicts = CONFLICT_TRANSLATIONS[language] || CONFLICT_TRANSLATIONS.fr;
  });
}

function conflictChoices() {
  const choices = appData.calendar && appData.calendar.conflictChoices;
  return choices && typeof choices === 'object' && !Array.isArray(choices) ? choices : {};
}

function conflictEnd(occurrence) {
  return occurrence.start.getTime() + occurrence.duration * 60000;
}

// Groupes d'occurrences qui se chevauchent, jour par jour.
function computeConflictGroups(occurrences) {
  const byDay = new Map();
  occurrences.forEach((occurrence) => {
    const day = toISODateString(occurrence.start);
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day).push(occurrence);
  });
  const groups = [];
  byDay.forEach((list, day) => {
    list.sort((a, b) => a.start - b.start || b.duration - a.duration);
    let current = null;
    let currentEnd = 0;
    list.forEach((occurrence) => {
      const start = occurrence.start.getTime();
      if (current && start < currentEnd) {
        current.items.push(occurrence);
        currentEnd = Math.max(currentEnd, conflictEnd(occurrence));
      } else {
        if (current && current.items.length > 1) groups.push(current);
        current = { day, items: [occurrence] };
        currentEnd = conflictEnd(occurrence);
      }
    });
    if (current && current.items.length > 1) groups.push(current);
  });
  const choices = conflictChoices();
  groups.forEach((group) => {
    const ids = group.items.map((occurrence) => String(occurrence.sourceEvent.id));
    group.key = `${group.day}|${ids.slice().sort().join('+')}`;
    const choice = choices[group.key] || null;
    group.choice = choice === 'both' || ids.includes(choice) ? choice : null;
  });
  return groups;
}

// Position (en % de la largeur du jour) et état de chaque occurrence en conflit.
function computeConflictLayout(occurrences) {
  const layout = new Map();
  const groups = computeConflictGroups(occurrences);
  groups.forEach((group) => {
    if (group.choice && group.choice !== 'both') {
      const others = group.items.filter((occurrence) => String(occurrence.sourceEvent.id) !== group.choice);
      const share = (100 - CONFLICT_CHOSEN_WIDTH) / others.length;
      group.items.forEach((occurrence) => {
        if (String(occurrence.sourceEvent.id) === group.choice) {
          layout.set(occurrence, { left: 0, width: CONFLICT_CHOSEN_WIDTH, group, chosen: true });
        }
      });
      others.forEach((occurrence, index) => {
        layout.set(occurrence, { left: CONFLICT_CHOSEN_WIDTH + index * share, width: share, group, dimmed: true });
      });
      return;
    }
    // Côte à côte : chaque occurrence dans la première colonne libre.
    const columnEnds = [];
    const columnOf = new Map();
    group.items.forEach((occurrence) => {
      const start = occurrence.start.getTime();
      let column = columnEnds.findIndex((end) => end <= start);
      if (column === -1) {
        column = columnEnds.length;
        columnEnds.push(0);
      }
      columnEnds[column] = conflictEnd(occurrence);
      columnOf.set(occurrence, column);
    });
    const width = 100 / columnEnds.length;
    group.items.forEach((occurrence) => {
      layout.set(occurrence, { left: columnOf.get(occurrence) * width, width, group, unresolved: !group.choice });
    });
  });
  lastConflictGroups = groups;
  return { layout, groups };
}

// Appelé pour chaque évènement dessiné par renderCalendarEvents.
function applyConflictPlacement(eventEl, place, title) {
  if (!place) return;
  eventEl.style.left = `calc(${place.left}% + 2px)`;
  eventEl.style.right = 'auto';
  eventEl.style.width = `calc(${place.width}% - 4px)`;
  if (place.dimmed) {
    eventEl.classList.add('is-dimmed');
    eventEl.title = t('conflicts.dimmedTitle', { title });
    // Avant les autres écouteurs (ex. clic Sport) : changer d'avis.
    eventEl.addEventListener('click', (event) => {
      if (event.target.closest('.delete-event, .resize-handle')) return;
      event.stopImmediatePropagation();
      openConflictChooser(place.group);
    });
  } else if (place.chosen) {
    eventEl.classList.add('is-chosen');
  } else if (place.unresolved) {
    eventEl.classList.add('has-conflict');
    const badge = document.createElement('button');
    badge.type = 'button';
    badge.className = 'conflict-badge';
    badge.textContent = '⚠';
    badge.title = t('conflicts.badgeTitle');
    badge.addEventListener('click', (event) => {
      event.stopPropagation();
      openConflictChooser(place.group);
    });
    const header = eventEl.querySelector('.event-header');
    if (header) header.insertBefore(badge, header.firstChild);
  }
}

function setAsideOccurrences(groups) {
  return groups.flatMap((group) => (group.choice && group.choice !== 'both'
    ? group.items.filter((occurrence) => String(occurrence.sourceEvent.id) !== group.choice)
    : []));
}

// Supprime les occurrences écartées : l'évènement entier s'il est unique,
// seulement ce jour-là (exception) s'il est répété.
function deleteSetAsideOccurrences(groups) {
  const occurrences = setAsideOccurrences(groups);
  if (!occurrences.length) return;
  const removedIds = new Set();
  occurrences.forEach((occurrence) => {
    const event = occurrence.sourceEvent;
    if (!event.recurrence || event.recurrence === 'none') {
      removedIds.add(event.id);
    } else {
      const exceptions = Array.isArray(event.exceptions) ? event.exceptions : [];
      event.exceptions = Array.from(new Set([...exceptions, toISODateString(occurrence.start)]));
    }
  });
  appData.calendar.events = appData.calendar.events.filter((event) => !removedIds.has(event.id));
  saveData();
  renderCalendar();
  if (typeof showUndoToast === 'function') showUndoToast('conflicts.deleted');
}

function renderConflictBanner(groups) {
  const banner = document.getElementById('calendar-conflicts');
  if (!banner) return;
  const unresolved = groups.filter((group) => !group.choice);
  const setAside = setAsideOccurrences(groups);
  banner.innerHTML = '';
  banner.hidden = unresolved.length === 0 && setAside.length === 0;
  banner.classList.toggle('is-calm', unresolved.length === 0);
  if (unresolved.length) {
    banner.appendChild(document.createTextNode(t('conflicts.banner', { count: unresolved.length })));
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = t('conflicts.choose');
    button.addEventListener('click', () => openConflictChooser(unresolved[0], unresolved.slice(1)));
    banner.appendChild(button);
  }
  if (setAside.length) {
    const label = document.createElement('span');
    label.className = 'calendar-conflicts__set-aside';
    label.textContent = t('conflicts.weekSetAside', { count: setAside.length });
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = t('conflicts.deleteWeekSetAside');
    button.addEventListener('click', () => deleteSetAsideOccurrences(groups));
    banner.append(label, button);
  }
}

function setConflictChoice(group, value) {
  const choices = { ...conflictChoices() };
  if (value === null) delete choices[group.key];
  else choices[group.key] = value;
  const oldest = new Date();
  oldest.setDate(oldest.getDate() - CONFLICT_KEEP_DAYS);
  const limit = toISODateString(oldest);
  Object.keys(choices).forEach((key) => {
    if (key.split('|')[0] < limit) delete choices[key];
  });
  appData.calendar.conflictChoices = choices;
  saveData();
  renderCalendar();
}

function closeConflictChooser() {
  if (conflictModal) conflictModal.remove();
  conflictModal = null;
}

function openConflictChooser(group, queue = []) {
  closeConflictChooser();
  conflictModal = document.createElement('div');
  conflictModal.className = 'modal conflict-modal';
  conflictModal.setAttribute('role', 'dialog');
  conflictModal.setAttribute('aria-modal', 'true');
  const content = document.createElement('div');
  content.className = 'modal-content conflict-content';
  const title = document.createElement('h3');
  title.textContent = t('conflicts.title');
  const subtitle = document.createElement('p');
  subtitle.className = 'conflict-subtitle';
  const day = new Date(`${group.day}T12:00`);
  subtitle.textContent = t('conflicts.subtitle', {
    date: day.toLocaleDateString(getCurrentLocale(), { weekday: 'long', day: 'numeric', month: 'long' })
  });
  content.append(title, subtitle);

  const next = () => {
    const following = queue.find((item) => lastConflictGroups.some((g) => g.key === item.key && !g.choice));
    if (following) openConflictChooser(following, queue.slice(queue.indexOf(following) + 1));
  };
  const pick = (value) => {
    closeConflictChooser();
    setConflictChoice(group, value);
    next();
  };

  const seen = new Set();
  group.items.forEach((occurrence) => {
    const id = String(occurrence.sourceEvent.id);
    if (seen.has(id)) return;
    seen.add(id);
    const option = document.createElement('button');
    option.type = 'button';
    option.className = `conflict-option${group.choice === id ? ' is-current' : ''}`;
    option.style.setProperty('--event-color', getEventColor(occurrence.sourceEvent));
    const name = document.createElement('strong');
    name.textContent = occurrence.sourceEvent.title || t('calendar.eventDefaultTitle');
    const time = document.createElement('span');
    const end = new Date(conflictEnd(occurrence));
    time.textContent = `${formatTime(occurrence.start)} – ${formatTime(end)}`;
    option.append(name, time);
    option.addEventListener('click', () => pick(id));
    content.appendChild(option);
  });

  const actions = document.createElement('div');
  actions.className = 'conflict-actions';
  const setAside = setAsideOccurrences([group]);
  if (setAside.length) {
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'danger';
    remove.textContent = setAside.length > 1
      ? t('conflicts.deleteSetAsideMany', { count: setAside.length })
      : t('conflicts.deleteSetAside');
    remove.addEventListener('click', () => {
      closeConflictChooser();
      deleteSetAsideOccurrences([group]);
    });
    actions.appendChild(remove);
  }
  const both = document.createElement('button');
  both.type = 'button';
  both.className = 'btn-secondary';
  both.textContent = t(seen.size > 2 ? 'conflicts.all' : 'conflicts.both');
  both.addEventListener('click', () => pick('both'));
  actions.appendChild(both);
  if (group.choice) {
    const reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'btn-secondary';
    reset.textContent = t('conflicts.reset');
    reset.addEventListener('click', () => pick(null));
    actions.appendChild(reset);
  }
  const later = document.createElement('button');
  later.type = 'button';
  later.className = 'btn-secondary';
  later.textContent = t('conflicts.later');
  later.addEventListener('click', closeConflictChooser);
  actions.appendChild(later);
  content.appendChild(actions);

  conflictModal.appendChild(content);
  conflictModal.addEventListener('click', (event) => {
    if (event.target === conflictModal) closeConflictChooser();
  });
  document.body.appendChild(conflictModal);
  const first = content.querySelector('.conflict-option');
  if (first) first.focus();
}

// Après l'enregistrement d'un évènement : s'il en chevauche un autre ce
// jour-là sans choix fait, on pose la question tout de suite.
function askCalendarConflictsOn(date) {
  const day = toISODateString(date);
  const pending = lastConflictGroups.filter((group) => group.day === day && !group.choice);
  if (pending.length) openConflictChooser(pending[0], pending.slice(1));
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && conflictModal) closeConflictChooser();
});
