/* ═══════════════════════════════════════════════════════════
   SPORT : HISTORIQUE, PROGRESSION ET RÉGULARITÉ
   Tout est recalculé depuis le journal (appData.sport.logs) : rien
   de plus n'est stocké. Une séance « faite » = au moins une série
   notée ou un exercice coché ce jour-là. Une semaine « tenue » =
   chaque séance de la liste faite une fois, n'importe quel jour du
   lundi au dimanche (on peut décaler) ; liste vide : une seule
   séance suffit. Les créneaux de l'agenda ne servent qu'à la grille
   (jours prévus, à venir ou manqués d'une semaine non tenue).
   ═══════════════════════════════════════════════════════════ */

const SPORT_HISTORY_WEEKS = 26;

const SPORT_HISTORY_TRANSLATIONS = {
  fr: {
    historyButton: '📈 Historique et régularité',
    historyTitle: '📈 Historique et régularité',
    historyBack: '← Retour à la séance',
    regularityTitle: 'Régularité',
    weekProgress: '{done}/{planned} séances cette semaine',
    weekDoneOnly: '{done} séance(s) cette semaine',
    streak: '🔥 {count} semaine(s) d’affilée',
    streakNone: 'Fais toutes tes séances cette semaine pour lancer ta série de semaines.',
    weekBadge: 'Semaine : {done}/{planned}',
    weekBadgeFree: 'Semaine : {done} séance(s)',
    weekRule: 'Une semaine compte quand chaque séance de ta liste est faite une fois, n’importe quel jour du lundi au dimanche : tu peux décaler tes séances. Sans séance dans la liste, une seule suffit.',
    missedTitle: 'Pas faites ces 2 dernières semaines',
    missedNone: 'Toutes tes séances faites ces deux dernières semaines. 👏',
    weekOf: 'semaine du {date}',
    todoTitle: 'Encore à faire cette semaine',
    todoNone: 'Toutes les séances de la semaine sont faites. 👏',
    catchUp: 'Faire aujourd’hui',
    lastSession: 'Dernière séance : {date}',
    heatmapTitle: 'Les {weeks} dernières semaines',
    legendDone: 'Faite',
    legendMissed: 'Manquée',
    legendPlanned: 'Prévue',
    dayMissed: 'manquée',
    dayPlanned: 'prévue',
    progressTitle: 'Progression par exercice',
    metricTotal: 'Total de la séance',
    metricBest: 'Meilleure série',
    chartEmpty: 'Pas encore de séries notées pour cet exercice.',
    variantLine: '{name} : {count} séance(s), meilleure série {best}',
    recentTitle: 'Dernières séances',
    recentEmpty: 'Aucune séance notée pour l’instant.',
    recentExercises: '{done}/{total} exercices'
  },
  en: {
    historyButton: '📈 History & consistency',
    historyTitle: '📈 History & consistency',
    historyBack: '← Back to workout',
    regularityTitle: 'Consistency',
    weekProgress: '{done}/{planned} workouts this week',
    weekDoneOnly: '{done} workout(s) this week',
    streak: '🔥 {count} week(s) in a row',
    streakNone: 'Do all your workouts this week to start your streak.',
    weekBadge: 'Week: {done}/{planned}',
    weekBadgeFree: 'Week: {done} workout(s)',
    weekRule: 'A week counts when every workout in your list is done once, on any day from Monday to Sunday: you can move your workouts around. With no workout in the list, one is enough.',
    missedTitle: 'Not done in the last 2 weeks',
    missedNone: 'Every workout done in the last two weeks. 👏',
    weekOf: 'week of {date}',
    todoTitle: 'Still to do this week',
    todoNone: 'Every workout of the week is done. 👏',
    catchUp: 'Do it today',
    lastSession: 'Last workout: {date}',
    heatmapTitle: 'Last {weeks} weeks',
    legendDone: 'Done',
    legendMissed: 'Missed',
    legendPlanned: 'Planned',
    dayMissed: 'missed',
    dayPlanned: 'planned',
    progressTitle: 'Progress per exercise',
    metricTotal: 'Workout total',
    metricBest: 'Best set',
    chartEmpty: 'No sets logged for this exercise yet.',
    variantLine: '{name}: {count} workout(s), best set {best}',
    recentTitle: 'Recent workouts',
    recentEmpty: 'No workout logged yet.',
    recentExercises: '{done}/{total} exercises'
  },
  vi: {
    historyButton: '📈 Lịch sử & đều đặn',
    historyTitle: '📈 Lịch sử & đều đặn',
    historyBack: '← Quay lại buổi tập',
    regularityTitle: 'Đều đặn',
    weekProgress: '{done}/{planned} buổi tuần này',
    weekDoneOnly: '{done} buổi tuần này',
    streak: '🔥 {count} tuần liên tiếp',
    streakNone: 'Tập đủ các buổi tuần này để bắt đầu chuỗi tuần.',
    weekBadge: 'Tuần: {done}/{planned}',
    weekBadgeFree: 'Tuần: {done} buổi',
    weekRule: 'Một tuần được tính khi mỗi buổi trong danh sách được tập một lần, vào bất kỳ ngày nào từ thứ Hai đến Chủ nhật: có thể đổi ngày tập. Nếu danh sách trống, chỉ cần một buổi.',
    missedTitle: 'Chưa tập trong 2 tuần qua',
    missedNone: 'Đã tập đủ các buổi trong hai tuần qua. 👏',
    weekOf: 'tuần {date}',
    todoTitle: 'Còn cần tập tuần này',
    todoNone: 'Đã tập đủ các buổi trong tuần. 👏',
    catchUp: 'Tập hôm nay',
    lastSession: 'Buổi gần nhất: {date}',
    heatmapTitle: '{weeks} tuần gần đây',
    legendDone: 'Đã tập',
    legendMissed: 'Bỏ lỡ',
    legendPlanned: 'Đã lên lịch',
    dayMissed: 'bỏ lỡ',
    dayPlanned: 'đã lên lịch',
    progressTitle: 'Tiến bộ theo bài tập',
    metricTotal: 'Tổng buổi tập',
    metricBest: 'Hiệp tốt nhất',
    chartEmpty: 'Chưa có hiệp nào được ghi cho bài này.',
    variantLine: '{name}: {count} buổi, hiệp tốt nhất {best}',
    recentTitle: 'Buổi tập gần đây',
    recentEmpty: 'Chưa ghi buổi tập nào.',
    recentExercises: '{done}/{total} bài'
  }
};

Object.keys(SPORT_HISTORY_TRANSLATIONS).forEach((language) => {
  if (SPORT_TRANSLATIONS[language]) Object.assign(SPORT_TRANSLATIONS[language], SPORT_HISTORY_TRANSLATIONS[language]);
});

let sportHistoryPick = null; // `${sessionId}|${exerciseId}` de la courbe affichée
let sportHistoryMetric = 'total'; // 'total' | 'best'

/* ── Calculs ───────────────────────────────────────────────── */

function sportShiftDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function sportEntryActive(entry) {
  return Boolean(entry && (entry.done || (Array.isArray(entry.sets) && entry.sets.some((value) => Number(value) > 0))));
}

// Séances (ids) faites ce jour-là.
function sportActiveSessionsOn(dateKey) {
  const day = appData.sport.logs[dateKey];
  if (!day) return [];
  return Object.keys(day).filter((sessionId) => Object.values(day[sessionId] || {}).some(sportEntryActive));
}

// Créneaux Sport de l'agenda entre deux dates incluses : { 'AAAA-MM-JJ': [occurrences] }.
function sportPlannedBetween(from, to) {
  const result = {};
  const fromKey = sportDateKey(from);
  const toKey = sportDateKey(to);
  const events = appData.calendar.events.filter(isSportEvent);
  for (let week = startOfWeek(from); week <= to; week = sportShiftDays(week, 7)) {
    events.forEach((event) => {
      getOccurrencesForWeek(event, week).forEach((occurrence) => {
        const key = sportDateKey(new Date(occurrence.start));
        if (key < fromKey || key > toKey) return;
        (result[key] = result[key] || []).push(occurrence);
      });
    });
  }
  return result;
}

// Semaine tenue quand chaque séance de la liste a été faite une fois, n'importe
// quel jour du lundi au dimanche (on peut décaler). Liste vide : une seule suffit.
function sportWeekStats(weekStart) {
  const active = new Set();
  for (let i = 0; i < 7; i += 1) {
    sportActiveSessionsOn(sportDateKey(sportShiftDays(weekStart, i))).forEach((id) => active.add(id));
  }
  const sessions = appData.sport.sessions;
  if (!sessions.length) return { planned: 0, done: active.size, met: active.size > 0 };
  const done = sessions.filter((session) => active.has(session.id)).length;
  return { planned: sessions.length, done, met: done >= sessions.length };
}

// Séances de la liste pas faites dans les semaines terminées récentes (à partir
// de la première séance notée, pour ne pas compter avant le début).
function sportMissedSessions(weeks = 2) {
  const first = Object.keys(appData.sport.logs).sort().find((key) => sportActiveSessionsOn(key).length);
  if (!first) return [];
  const current = startOfWeek(new Date());
  const missed = [];
  for (let w = 1; w <= weeks; w += 1) {
    const weekStart = sportShiftDays(current, -7 * w);
    if (sportDateKey(sportShiftDays(weekStart, 6)) < first) continue;
    const active = new Set();
    for (let i = 0; i < 7; i += 1) {
      sportActiveSessionsOn(sportDateKey(sportShiftDays(weekStart, i))).forEach((id) => active.add(id));
    }
    appData.sport.sessions.forEach((session) => {
      if (!active.has(session.id)) missed.push({ weekStart, session });
    });
  }
  return missed;
}

// Semaines tenues d'affilée. La semaine en cours compte si elle est déjà
// tenue, mais ne casse pas la série tant qu'elle n'est pas finie.
function sportStreak() {
  let week = startOfWeek(new Date());
  let streak = sportWeekStats(week).met ? 1 : 0;
  for (let i = 0; i < 520; i += 1) {
    week = sportShiftDays(week, -7);
    if (!sportWeekStats(week).met) break;
    streak += 1;
  }
  return streak;
}

function sportOccurrenceName(occurrence) {
  const session = getSportSession(occurrence.sourceEvent.sportSessionId);
  return session ? session.name : occurrence.sourceEvent.title || t('sport.newSessionName');
}

function sportLastActiveDate() {
  return Object.keys(appData.sport.logs).sort().reverse().find((key) => sportActiveSessionsOn(key).length) || null;
}

function sportExerciseSeries(sessionId, exercise) {
  return Object.keys(appData.sport.logs).sort().map((key) => {
    const day = appData.sport.logs[key][sessionId];
    const entry = day && day[exercise.id];
    const values = entry && Array.isArray(entry.sets) ? entry.sets.map(Number).filter((value) => value > 0) : [];
    if (!values.length) return null;
    return { key, values, total: sumSets(values), best: Math.max(...values), variant: entry.variant || exercise.name };
  }).filter(Boolean);
}

/* ── Rendu ─────────────────────────────────────────────────── */

// Sur téléphone la vue est sous la liste des séances : on y descend.
function openSportHistory() {
  sportPickerEvent = null;
  sportView = 'history';
  renderSport();
  const main = document.getElementById('sport-main');
  if (!main) return;
  const top = main.getBoundingClientRect().top;
  if (top < 0 || top > window.innerHeight * 0.6) main.scrollIntoView({ block: 'start' });
}

function openSportDay(dateKey, sessionId) {
  sportSelectedDate = new Date(`${dateKey}T00:00`);
  if (sessionId && getSportSession(sessionId)) appData.sport.activeSessionId = sessionId;
  else selectSessionForDate(sportSelectedDate);
  sportPickerEvent = null;
  sportView = 'workout';
  renderSport();
  const main = document.getElementById('sport-main');
  if (main) main.scrollIntoView({ block: 'start' });
}

// Petit rappel sous la liste des séances : semaine en cours et série de semaines.
function renderSportWeekBadge() {
  const list = document.getElementById('sport-session-list');
  if (!list) return;
  let badge = document.getElementById('sport-week');
  if (!badge) {
    badge = sportEl('button', 'sport-week');
    badge.id = 'sport-week';
    badge.type = 'button';
    badge.addEventListener('click', openSportHistory);
    list.insertAdjacentElement('afterend', badge);
  }
  const week = sportWeekStats(startOfWeek(new Date()));
  const streak = sportStreak();
  badge.hidden = !appData.sport.sessions.length && !week.done;
  badge.classList.toggle('is-met', week.met);
  badge.textContent = [
    week.planned ? t('sport.weekBadge', { done: week.done, planned: week.planned }) : t('sport.weekBadgeFree', { done: week.done }),
    streak ? `🔥 ${streak}` : ''
  ].filter(Boolean).join(' · ');
  badge.title = t('sport.historyButton');
}

function renderSportRegularity(main) {
  const card = sportEl('div', 'sport-card sport-regularity');
  card.appendChild(sportEl('h3', '', t('sport.regularityTitle')));
  const week = sportWeekStats(startOfWeek(new Date()));
  const row = sportEl('div', 'sport-regularity__week');
  if (week.planned) {
    const dots = sportEl('span', 'sport-regularity__dots');
    for (let i = 0; i < Math.max(week.planned, week.done); i += 1) {
      dots.appendChild(sportEl('span', i < week.done ? 'is-done' : ''));
    }
    row.append(dots, sportEl('strong', '', t('sport.weekProgress', week)));
  } else {
    row.appendChild(sportEl('strong', '', t('sport.weekDoneOnly', week)));
  }
  card.appendChild(row);
  const streak = sportStreak();
  card.appendChild(sportEl('p', streak ? 'sport-regularity__streak' : 'sport-help__muted', streak ? t('sport.streak', { count: streak }) : t('sport.streakNone')));
  const last = sportLastActiveDate();
  if (last) card.appendChild(sportEl('p', 'sport-help__muted', t('sport.lastSession', { date: formatShortDate(last) })));

  // Séances encore à faire cette semaine, à lancer d'un clic.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todo = appData.sport.sessions.filter((session) => !sportSessionDoneDay(session.id, today));
  if (appData.sport.sessions.length) {
    card.appendChild(sportEl('h4', '', t('sport.todoTitle')));
    if (!todo.length) {
      card.appendChild(sportEl('p', 'sport-help__muted', t('sport.todoNone')));
    } else {
      const list = sportEl('ul', 'sport-missed');
      todo.forEach((session) => {
        const item = sportEl('li');
        item.append(
          sportEl('span', '', session.name || t('sport.newSessionName')),
          sportButton('sport-link-btn', t('sport.catchUp'), () => openSportDay(sportDateKey(today), session.id))
        );
        list.appendChild(item);
      });
      card.appendChild(list);
    }
  }
  card.appendChild(sportEl('h4', '', t('sport.missedTitle')));
  const missed = sportMissedSessions();
  if (!missed.length) {
    card.appendChild(sportEl('p', 'sport-help__muted', t('sport.missedNone')));
  } else {
    const list = sportEl('ul', 'sport-missed');
    missed.forEach(({ weekStart, session }) => {
      const week = t('sport.weekOf', { date: formatShortDate(sportDateKey(weekStart)) });
      list.appendChild(sportEl('li', '', `${week} — ${session.name || t('sport.newSessionName')}`));
    });
    card.appendChild(list);
  }
  card.appendChild(sportEl('p', 'sport-regularity__rule', t('sport.weekRule')));
  main.appendChild(card);
}

function renderSportHeatmap(main) {
  const card = sportEl('div', 'sport-card');
  card.appendChild(sportEl('h3', '', t('sport.heatmapTitle', { weeks: SPORT_HISTORY_WEEKS })));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = sportDateKey(today);
  const first = sportShiftDays(startOfWeek(today), -7 * (SPORT_HISTORY_WEEKS - 1));
  const planned = sportPlannedBetween(first, sportShiftDays(startOfWeek(today), 6));

  const scroller = sportEl('div', 'sport-heatmap');
  const months = sportEl('div', 'sport-heatmap__months');
  const grid = sportEl('div', 'sport-heatmap__grid');
  let lastMonth = -1;
  for (let w = 0; w < SPORT_HISTORY_WEEKS; w += 1) {
    const weekStart = sportShiftDays(first, 7 * w);
    const stats = sportWeekStats(weekStart, planned);
    const month = sportShiftDays(weekStart, 6).getMonth();
    months.appendChild(sportEl('span', '', month !== lastMonth ? sportShiftDays(weekStart, 6).toLocaleDateString(getCurrentLocale(), { month: 'short' }) : ''));
    lastMonth = month;
    for (let d = 0; d < 7; d += 1) {
      const date = sportShiftDays(weekStart, d);
      const key = sportDateKey(date);
      const cell = sportEl('span', 'sport-heatmap__cell');
      if (key > todayKey) cell.classList.add('is-future');
      if (key === todayKey) cell.classList.add('is-today');
      const active = sportActiveSessionsOn(key);
      const slots = planned[key] || [];
      let label = formatShortDate(key);
      if (active.length) {
        cell.classList.add('is-done');
        label += ` : ${active.map((id) => (getSportSession(id) || {}).name || '—').join(', ')}`;
      } else if (slots.length && key >= todayKey) {
        cell.classList.add('is-planned');
        label += ` : ${t('sport.dayPlanned')} (${slots.map(sportOccurrenceName).join(', ')})`;
      } else if (slots.length && !stats.met) {
        cell.classList.add('is-missed');
        label += ` : ${t('sport.dayMissed')} (${slots.map(sportOccurrenceName).join(', ')})`;
      }
      cell.title = label;
      if (active.length || slots.length) {
        cell.classList.add('is-link');
        cell.addEventListener('click', () => openSportDay(key, active[0] || (slots[0] && slots[0].sourceEvent.sportSessionId)));
      }
      grid.appendChild(cell);
    }
  }
  scroller.append(months, grid);
  card.appendChild(scroller);
  const legend = sportEl('div', 'sport-heatmap__legend');
  [['is-done', 'legendDone'], ['is-missed', 'legendMissed'], ['is-planned', 'legendPlanned']].forEach(([cls, key]) => {
    const item = sportEl('span');
    item.append(sportEl('span', `sport-heatmap__cell ${cls}`), document.createTextNode(t(`sport.${key}`)));
    legend.appendChild(item);
  });
  card.appendChild(legend);
  main.appendChild(card);
  // Semaines les plus récentes visibles d'abord sur petit écran.
  requestAnimationFrame(() => {
    scroller.scrollLeft = scroller.scrollWidth;
  });
}

function sportChartSvg(points, timed, width = 640) {
  const height = 220;
  const pad = { left: 40, right: 14, top: 26, bottom: 26 };
  const ns = 'http://www.w3.org/2000/svg';
  const make = (tag, attrs, text) => {
    const node = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const svg = make('svg', { viewBox: `0 0 ${width} ${height}`, class: 'sport-chart', role: 'img' });
  const values = points.map((point) => point.value);
  const top = Math.max(1, Math.ceil(Math.max(...values) * 1.15));
  const x = (i) => pad.left + (points.length === 1 ? (width - pad.left - pad.right) / 2 : (i * (width - pad.left - pad.right)) / (points.length - 1));
  const y = (value) => pad.top + (1 - value / top) * (height - pad.top - pad.bottom);
  [0, 0.5, 1].forEach((ratio) => {
    const value = Math.round(top * ratio);
    svg.appendChild(make('line', { x1: pad.left, x2: width - pad.right, y1: y(value), y2: y(value), class: 'sport-chart__grid' }));
    svg.appendChild(make('text', { x: pad.left - 6, y: y(value) + 4, class: 'sport-chart__axis', 'text-anchor': 'end' }, timed ? formatClock(value) : String(value)));
  });
  points.forEach((point, i) => {
    if (i > 0 && point.variant !== points[i - 1].variant) {
      const mid = (x(i) + x(i - 1)) / 2;
      svg.appendChild(make('line', { x1: mid, x2: mid, y1: pad.top - 8, y2: height - pad.bottom, class: 'sport-chart__change' }));
      const name = point.variant.length > 26 ? `${point.variant.slice(0, 25)}…` : point.variant;
      svg.appendChild(make('text', { x: mid + 4, y: pad.top - 12, class: 'sport-chart__label' }, `↑ ${name}`));
    }
  });
  svg.appendChild(make('polyline', { points: points.map((point, i) => `${x(i)},${y(point.value)}`).join(' '), class: 'sport-chart__line' }));
  points.forEach((point, i) => {
    const dot = make('circle', { cx: x(i), cy: y(point.value), r: 4.5, class: 'sport-chart__dot' });
    dot.appendChild(make('title', {}, `${formatShortDate(point.key)} · ${point.variant} · ${point.values.map((v) => formatSportAmount(v, timed)).join(' · ')}`));
    svg.appendChild(dot);
  });
  [[0, 'start'], [points.length - 1, 'end']].forEach(([i, anchor]) => {
    if (i < 0 || (i === 0 && points.length === 1 && anchor === 'end')) return;
    svg.appendChild(make('text', { x: x(i), y: height - 6, class: 'sport-chart__axis', 'text-anchor': points.length === 1 ? 'middle' : anchor }, formatShortDate(points[i].key)));
  });
  return svg;
}

function renderSportProgression(main) {
  const card = sportEl('div', 'sport-card');
  card.appendChild(sportEl('h3', '', t('sport.progressTitle')));
  const options = [];
  appData.sport.sessions.forEach((session) => {
    session.exercises.forEach((exercise) => options.push({ id: `${session.id}|${exercise.id}`, session, exercise }));
  });
  if (!options.length) {
    card.appendChild(sportEl('p', 'sport-help__muted', t('sport.chartEmpty')));
    main.appendChild(card);
    return;
  }
  if (!options.some((option) => option.id === sportHistoryPick)) {
    const active = options.find((option) => option.session.id === appData.sport.activeSessionId);
    sportHistoryPick = (active || options[0]).id;
  }
  const controls = sportEl('div', 'sport-progression__controls');
  const select = document.createElement('select');
  appData.sport.sessions.forEach((session) => {
    if (!session.exercises.length) return;
    const group = document.createElement('optgroup');
    group.label = session.name || t('sport.newSessionName');
    session.exercises.forEach((exercise) => {
      const option = sportEl('option', '', exercise.name || t('sport.exercise'));
      option.value = `${session.id}|${exercise.id}`;
      group.appendChild(option);
    });
    select.appendChild(group);
  });
  select.value = sportHistoryPick;
  select.addEventListener('change', () => {
    sportHistoryPick = select.value;
    renderSportMain();
  });
  const metrics = sportEl('div', 'sport-segmented');
  [['total', 'metricTotal'], ['best', 'metricBest']].forEach(([metric, key]) => {
    const button = sportButton(sportHistoryMetric === metric ? 'active' : '', t(`sport.${key}`), () => {
      sportHistoryMetric = metric;
      renderSportMain();
    });
    button.setAttribute('aria-pressed', sportHistoryMetric === metric ? 'true' : 'false');
    metrics.appendChild(button);
  });
  controls.append(select, metrics);
  card.appendChild(controls);

  const pick = options.find((option) => option.id === sportHistoryPick);
  const series = sportExerciseSeries(pick.session.id, pick.exercise);
  if (!series.length) {
    card.appendChild(sportEl('p', 'sport-help__muted', t('sport.chartEmpty')));
    main.appendChild(card);
    return;
  }
  const timed = isTimedExercise(pick.exercise);
  const points = series.map((point) => ({ ...point, value: sportHistoryMetric === 'best' ? point.best : point.total }));
  // Dessiné à la largeur réelle de la carte (et redessiné si elle change) :
  // le texte du graphique garde sa taille sur téléphone.
  const chartBox = sportEl('div', 'sport-chart-box');
  card.appendChild(chartBox);
  let drawnWidth = 0;
  const draw = () => {
    const width = Math.max(300, Math.min(640, Math.round(chartBox.clientWidth)));
    if (!chartBox.clientWidth || Math.abs(width - drawnWidth) < 20) return;
    drawnWidth = width;
    chartBox.replaceChildren(sportChartSvg(points, timed, width));
  };
  if (typeof ResizeObserver === 'function') new ResizeObserver(draw).observe(chartBox);
  else chartBox.appendChild(sportChartSvg(points, timed));

  const variants = [];
  series.forEach((point) => {
    let variant = variants.find((item) => item.name === point.variant);
    if (!variant) {
      variant = { name: point.variant, count: 0, best: 0 };
      variants.push(variant);
    }
    variant.count += 1;
    variant.best = Math.max(variant.best, point.best);
  });
  const list = sportEl('ul', 'sport-progression__variants');
  variants.forEach((variant) => {
    list.appendChild(sportEl('li', '', t('sport.variantLine', { name: variant.name, count: variant.count, best: formatSportAmount(variant.best, timed) })));
  });
  card.appendChild(list);
  main.appendChild(card);
}

function renderSportRecent(main) {
  const card = sportEl('div', 'sport-card');
  card.appendChild(sportEl('h3', '', t('sport.recentTitle')));
  const recent = [];
  Object.keys(appData.sport.logs).sort().reverse().some((key) => {
    sportActiveSessionsOn(key).forEach((sessionId) => recent.push({ key, sessionId }));
    return recent.length >= 8;
  });
  if (!recent.length) {
    card.appendChild(sportEl('p', 'sport-help__muted', t('sport.recentEmpty')));
    main.appendChild(card);
    return;
  }
  const list = sportEl('ul', 'sport-recent');
  recent.slice(0, 8).forEach(({ key, sessionId }) => {
    const session = getSportSession(sessionId);
    const log = getSportLog(key, sessionId);
    let reps = 0;
    let seconds = 0;
    let done = 0;
    (session ? session.exercises : []).forEach((exercise) => {
      const entry = log[exercise.id];
      if (!entry) return;
      if (entry.done) done += 1;
      if (isTimedExercise(exercise)) seconds += sumSets(entry.sets);
      else reps += sumSets(entry.sets);
    });
    const parts = [formatShortDate(key), session ? session.name : '—'];
    if (session) parts.push(t('sport.recentExercises', { done, total: session.exercises.length }));
    if (reps) parts.push(`${reps} ${t('sport.summaryReps')}`);
    if (seconds) parts.push(formatRest(seconds));
    const item = sportEl('li');
    if (session) item.appendChild(sportButton('sport-recent__btn', parts.join(' · '), () => openSportDay(key, sessionId)));
    else item.textContent = parts.join(' · ');
    list.appendChild(item);
  });
  card.appendChild(list);
  main.appendChild(card);
}

function renderSportHistory(main) {
  const header = sportEl('div', 'sport-history__header');
  header.append(
    sportEl('h2', 'sport-hero__title', t('sport.historyTitle')),
    sportButton('sport-link-btn', t('sport.historyBack'), () => {
      sportView = 'workout';
      renderSport();
    })
  );
  main.appendChild(header);
  renderSportRegularity(main);
  renderSportHeatmap(main);
  renderSportProgression(main);
  renderSportRecent(main);
}
