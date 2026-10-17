/* ═══════════════════════════════════════════════════════════
   DÉFIS DU JOUR
   Chargé avant script.js (cœur : données, traductions, onglets, démarrage).
   ═══════════════════════════════════════════════════════════ */

function isChallengeActiveForDate(challenge, date) {
  if (!challenge || !(date instanceof Date)) return false;
  const created = parseDateOnly(challenge.createdAt);
  if (created && date < created) {
    return false;
  }
  if (!challenge.includeWeekend && isWeekend(date)) {
    return false;
  }
  return true;
}

function isChallengeDone(challengeId, dateISO) {
  const entries = appData.dailyChallenges && appData.dailyChallenges.completions;
  if (!entries || typeof entries !== 'object') return false;
  const dayEntry = entries[dateISO];
  return Boolean(dayEntry && dayEntry[challengeId]);
}

function setChallengeCompletion(challengeId, dateISO, done) {
  if (!appData.dailyChallenges.completions[dateISO]) {
    appData.dailyChallenges.completions[dateISO] = {};
  }
  appData.dailyChallenges.completions[dateISO][challengeId] = done;
}

function getChallengeWeekProgress(challenge, referenceDate = new Date()) {
  const start = startOfWeek(referenceDate);
  start.setHours(0, 0, 0, 0);

  let done = 0;
  for (let offset = 0; offset < 7; offset += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + offset);
    if (!isChallengeActiveForDate(challenge, day)) continue;
    const dayISO = toISODateString(day);
    if (isChallengeDone(challenge.id, dayISO)) {
      done += 1;
    }
  }

  const target = Math.max(1, Number(challenge.weeklyTarget) || 1);
  return { done, target, isComplete: done >= target };
}

function renderDailyHistory() {
  const container = document.getElementById('daily-history');
  if (!container) return;
  container.innerHTML = '';

  const challenges = appData.dailyChallenges && Array.isArray(appData.dailyChallenges.challenges)
    ? appData.dailyChallenges.challenges
    : [];

  if (challenges.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'daily-empty';
    empty.textContent = t('daily.empty');
    container.appendChild(empty);
    return;
  }

  const table = document.createElement('div');
  table.className = 'daily-history-table';
  const gridTemplate = `160px repeat(${challenges.length}, minmax(90px, 1fr))`;

  const header = document.createElement('div');
  header.className = 'daily-history-row daily-history-row--header';
  header.style.gridTemplateColumns = gridTemplate;

  const dateHeader = document.createElement('div');
  dateHeader.className = 'daily-history-cell daily-history-cell--date';
  dateHeader.textContent = t('daily.dateColumn');
  header.appendChild(dateHeader);

  challenges.forEach((challenge) => {
    const cell = document.createElement('div');
    cell.className = 'daily-history-cell';
    cell.textContent = challenge.name || '';
    header.appendChild(cell);
  });

  table.appendChild(header);

  for (let offset = 0; offset < DAILY_HISTORY_DAYS; offset += 1) {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - offset);
    const dayISO = toISODateString(day);

    let activeCount = 0;
    let doneCount = 0;

    const row = document.createElement('div');
    row.className = 'daily-history-row';
    row.style.gridTemplateColumns = gridTemplate;

    const dateCell = document.createElement('div');
    dateCell.className = 'daily-history-cell daily-history-cell--date';
    dateCell.textContent = formatDate(day, { year: true });
    row.appendChild(dateCell);

    challenges.forEach((challenge) => {
      const cell = document.createElement('div');
      cell.className = 'daily-history-cell';
      const active = isChallengeActiveForDate(challenge, day);
      if (!active) {
        cell.classList.add('is-inactive');
        cell.textContent = '—';
      } else {
        activeCount += 1;
        const done = isChallengeDone(challenge.id, dayISO);
        if (done) {
          doneCount += 1;
          cell.classList.add('is-done');
          cell.textContent = '✔';
        } else {
          cell.classList.add('is-missed');
          cell.textContent = '✕';
        }
      }
      row.appendChild(cell);
    });

    if (activeCount > 0 && activeCount === doneCount) {
      row.classList.add('daily-history-row--complete');
    }

    table.appendChild(row);
  }

  container.appendChild(table);
}

function renderDailyTodayList() {
  const container = document.getElementById('daily-today-list');
  if (!container) return;
  container.innerHTML = '';

  const challenges = appData.dailyChallenges && Array.isArray(appData.dailyChallenges.challenges)
    ? appData.dailyChallenges.challenges
    : [];

  if (challenges.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'daily-empty';
    empty.textContent = t('daily.empty');
    container.appendChild(empty);
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = toISODateString(today);

  challenges.forEach((challenge, index) => {
    const item = document.createElement('div');
    item.className = 'daily-today-item';

    const weekProgress = getChallengeWeekProgress(challenge, today);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = isChallengeDone(challenge.id, todayISO);
    checkbox.disabled = !isChallengeActiveForDate(challenge, today);
    checkbox.addEventListener('change', () => {
      setChallengeCompletion(challenge.id, todayISO, checkbox.checked);
      saveData();
      renderDailyChallenges();
    });

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = challenge.name || t('daily.defaultName', { index: index + 1 });
    nameInput.className = 'daily-inline-input';
    nameInput.addEventListener('input', () => {
      challenge.name = nameInput.value;
      saveDataSoon();
      renderDailyHistory();
    });

    const weeklyTargetInput = document.createElement('input');
    weeklyTargetInput.type = 'number';
    weeklyTargetInput.className = 'daily-target-input';
    weeklyTargetInput.min = '1';
    weeklyTargetInput.step = '1';
    weeklyTargetInput.value = String(Math.max(1, Number(challenge.weeklyTarget) || 1));
    weeklyTargetInput.title = t('daily.weeklyTargetLabel');
    weeklyTargetInput.addEventListener('change', () => {
      const parsed = Number.parseInt(weeklyTargetInput.value, 10);
      challenge.weeklyTarget = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
      weeklyTargetInput.value = String(challenge.weeklyTarget);
      saveData();
      renderDailyChallenges();
    });

    const weeklyTargetText = document.createElement('span');
    weeklyTargetText.className = 'meta';
    weeklyTargetText.textContent = t('daily.timesSuffix', { count: Math.max(1, Number(challenge.weeklyTarget) || 1) });

    const progress = document.createElement('span');
    progress.className = `meta ${weekProgress.isComplete ? 'is-week-complete' : ''}`;
    progress.textContent = `${t('daily.progressLabel', { done: weekProgress.done, target: weekProgress.target })} · ${t(
      weekProgress.isComplete ? 'daily.weekComplete' : 'daily.weekInProgress'
    )}`;

    const weekendToggle = document.createElement('label');
    weekendToggle.className = 'daily-toggle';
    const weekendInput = document.createElement('input');
    weekendInput.type = 'checkbox';
    weekendInput.checked = Boolean(challenge.includeWeekend);
    weekendInput.addEventListener('change', () => {
      challenge.includeWeekend = weekendInput.checked;
      saveData();
      renderDailyChallenges();
    });
    const weekendText = document.createElement('span');
    weekendText.textContent = t('daily.includeWeekend');
    weekendToggle.appendChild(weekendInput);
    weekendToggle.appendChild(weekendText);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '✕';
    deleteBtn.addEventListener('click', () => {
      if (!confirm(t('daily.deleteConfirm'))) return;
      appData.dailyChallenges.challenges = challenges.filter((c) => c.id !== challenge.id);
      Object.keys(appData.dailyChallenges.completions).forEach((dateKey) => {
        if (appData.dailyChallenges.completions[dateKey]) {
          delete appData.dailyChallenges.completions[dateKey][challenge.id];
        }
      });
      saveData();
      renderDailyChallenges();
    });

    const meta = document.createElement('span');
    meta.className = 'meta';
    if (!challenge.includeWeekend && isWeekend(today)) {
      meta.textContent = t('daily.weekendExcluded');
    }

    item.appendChild(checkbox);
    item.appendChild(nameInput);
    item.appendChild(weeklyTargetInput);
    item.appendChild(weeklyTargetText);
    item.appendChild(progress);
    item.appendChild(weekendToggle);
    item.appendChild(deleteBtn);
    if (meta.textContent) {
      item.appendChild(meta);
    }
    container.appendChild(item);
  });

  if (!challenges.some((challenge) => isChallengeActiveForDate(challenge, today))) {
    const empty = document.createElement('div');
    empty.className = 'daily-empty';
    empty.textContent = t('daily.todayEmpty');
    container.appendChild(empty);
  }
}

function renderDailyChallenges() {
  renderDailyTodayList();
  renderDailyHistory();
}

function initDailyChallenges() {
  const addBtn = document.getElementById('daily-add');
  const nameInput = document.getElementById('daily-name');
  const weekendInput = document.getElementById('daily-include-weekend');
  const weeklyTargetInput = document.getElementById('daily-weekly-target');

  if (addBtn && nameInput && weekendInput && weeklyTargetInput) {
    const addChallenge = () => {
      const name = nameInput.value.trim();
      const weeklyTarget = Math.max(1, Number.parseInt(weeklyTargetInput.value, 10) || 1);
      const challenge = {
        id: uid(),
        name: name || t('daily.defaultName', { index: (appData.dailyChallenges.challenges.length || 0) + 1 }),
        includeWeekend: weekendInput.checked,
        weeklyTarget,
        createdAt: toISODateString(new Date())
      };
      appData.dailyChallenges.challenges.push(challenge);
      nameInput.value = '';
      weeklyTargetInput.value = String(weeklyTarget);
      saveData();
      renderDailyChallenges();
    };

    addBtn.addEventListener('click', addChallenge);
    nameInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        addChallenge();
      }
    });
  }

  renderDailyChallenges();
}
