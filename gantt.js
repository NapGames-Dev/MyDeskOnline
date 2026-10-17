/* ═══════════════════════════════════════════════════════════
   GANTT
   Chargé avant script.js (cœur : données, traductions, onglets, démarrage).
   ═══════════════════════════════════════════════════════════ */

function getActiveGanttChart() {
  if (!appData.gantt || !Array.isArray(appData.gantt.charts) || appData.gantt.charts.length === 0) {
    return null;
  }
  if (!appData.gantt.activeChartId || !appData.gantt.charts.some((chart) => chart.id === appData.gantt.activeChartId)) {
    appData.gantt.activeChartId = appData.gantt.charts[0].id;
  }
  return appData.gantt.charts.find((chart) => chart.id === appData.gantt.activeChartId) || null;
}

function renderGanttList() {
  const list = document.getElementById('gantt-chart-list');
  if (!list) return;
  list.innerHTML = '';

  if (!appData.gantt || appData.gantt.charts.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty-state';
    empty.textContent = t('gantt.listEmpty');
    list.appendChild(empty);
    return;
  }

  appData.gantt.charts.forEach((chart) => {
    const item = document.createElement('li');
    item.className = 'gantt-chart-item';
    if (chart.id === appData.gantt.activeChartId) {
      item.classList.add('active');
    }
    item.textContent = chart.name || t('gantt.chartUntitled');
    item.addEventListener('click', () => {
      appData.gantt.activeChartId = chart.id;
      saveData();
      renderGantt();
    });
    list.appendChild(item);
  });
}

function renderGanttBoard() {
  const nameEl = document.getElementById('gantt-active-name');
  const addTaskBtn = document.getElementById('gantt-add-task');
  const emptyEl = document.getElementById('gantt-empty');
  const boardEl = document.getElementById('gantt-board');
  const rowsContainer = document.getElementById('gantt-task-rows');
  if (!nameEl || !addTaskBtn || !emptyEl || !boardEl || !rowsContainer) return;

  const chart = getActiveGanttChart();
  if (!chart) {
    nameEl.textContent = t('gantt.headerTitle');
    addTaskBtn.disabled = true;
    emptyEl.hidden = false;
    boardEl.hidden = true;
    rowsContainer.innerHTML = '';
    renderGanttTimeline(null);
    return;
  }

  nameEl.textContent = chart.name || t('gantt.chartUntitled');
  addTaskBtn.disabled = false;
  emptyEl.hidden = true;
  boardEl.hidden = false;
  rowsContainer.innerHTML = '';

  if (chart.tasks.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = t('gantt.boardEmpty');
    rowsContainer.appendChild(empty);
  } else {
    chart.tasks.forEach((task) => {
      const row = document.createElement('div');
      row.className = 'gantt-task-row';

      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.value = task.name || '';
      nameInput.addEventListener('input', () => {
        task.name = nameInput.value;
        saveDataSoon();
        renderGanttTimeline(getActiveGanttChart());
      });

      const startInput = document.createElement('input');
      startInput.type = 'date';
      startInput.value = task.start || '';

      const endInput = document.createElement('input');
      endInput.type = 'date';
      endInput.value = task.end || '';

      startInput.addEventListener('change', () => {
        task.start = startInput.value;
        if (task.end && task.start && task.end < task.start) {
          task.end = task.start;
          endInput.value = task.end;
        }
        saveData();
        renderGanttTimeline(getActiveGanttChart());
      });

      endInput.addEventListener('change', () => {
        if (endInput.value && task.start && endInput.value < task.start) {
          endInput.value = task.start;
        }
        task.end = endInput.value;
        saveData();
        renderGanttTimeline(getActiveGanttChart());
      });

      const progressInput = document.createElement('input');
      progressInput.type = 'number';
      progressInput.min = '0';
      progressInput.max = '100';
      progressInput.step = '5';
      progressInput.value = Number.isFinite(task.progress) ? task.progress : 0;
      progressInput.addEventListener('change', () => {
        const value = Number(progressInput.value);
        if (!Number.isFinite(value)) {
          task.progress = 0;
        } else {
          task.progress = Math.min(100, Math.max(0, value));
        }
        progressInput.value = task.progress;
        saveData();
        renderGanttTimeline(getActiveGanttChart());
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.textContent = '✕';
      deleteBtn.addEventListener('click', () => {
        if (!confirm(t('gantt.deleteTaskConfirm'))) return;
        chart.tasks = chart.tasks.filter((t) => t.id !== task.id);
        saveData();
        renderGantt();
      });

      row.appendChild(nameInput);
      row.appendChild(startInput);
      row.appendChild(endInput);
      row.appendChild(progressInput);
      row.appendChild(deleteBtn);
      rowsContainer.appendChild(row);
    });
  }

  renderGanttTimeline(chart);
}

function renderGanttTimeline(chart) {
  const timeline = document.getElementById('gantt-timeline');
  if (!timeline) return;
  timeline.innerHTML = '';
  timeline.style.setProperty('--gantt-day-width', `${GANTT_DAY_WIDTH}px`);

  if (!chart || chart.tasks.length === 0) {
    const placeholder = document.createElement('div');
    placeholder.className = 'gantt-timeline-placeholder';
    placeholder.textContent = t('gantt.timelinePlaceholder');
    timeline.appendChild(placeholder);
    return;
  }

  const normalizedTasks = chart.tasks.map((task) => {
    let startDate = parseDateOnly(task.start);
    let endDate = parseDateOnly(task.end);
    if (!startDate && endDate) {
      startDate = new Date(endDate);
    }
    if (!endDate && startDate) {
      endDate = new Date(startDate);
    }
    if (!startDate || !endDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      startDate = today;
      endDate = today;
    }
    if (endDate < startDate) {
      endDate = new Date(startDate);
    }
    return { task, startDate, endDate };
  });

  const startBoundary = normalizedTasks.reduce((min, current) => (current.startDate < min ? current.startDate : min), normalizedTasks[0].startDate);
  const endBoundary = normalizedTasks.reduce((max, current) => (current.endDate > max ? current.endDate : max), normalizedTasks[0].endDate);
  const totalDays = Math.max(1, diffDays(startBoundary, endBoundary) + 1);

  const header = document.createElement('div');
  header.className = 'gantt-timeline-header';
  for (let dayIndex = 0; dayIndex < totalDays; dayIndex += 1) {
    const day = new Date(startBoundary);
    day.setDate(day.getDate() + dayIndex);
    const label = document.createElement('span');
    label.textContent = day.toLocaleDateString(getCurrentLocale(), { day: '2-digit', month: 'short' });
    header.appendChild(label);
  }
  timeline.appendChild(header);

  const body = document.createElement('div');
  body.className = 'gantt-timeline-body';
  body.style.minWidth = `${totalDays * GANTT_DAY_WIDTH}px`;
  body.style.height = `${chart.tasks.length * GANTT_ROW_HEIGHT}px`;
  timeline.appendChild(body);

  const grid = document.createElement('div');
  grid.className = 'gantt-timeline-grid';
  grid.style.width = `${totalDays * GANTT_DAY_WIDTH}px`;
  grid.style.height = `${chart.tasks.length * GANTT_ROW_HEIGHT}px`;
  for (let dayIndex = 0; dayIndex < totalDays; dayIndex += 1) {
    const column = document.createElement('span');
    grid.appendChild(column);
  }
  body.appendChild(grid);

  const bars = document.createElement('div');
  bars.className = 'gantt-timeline-bars';
  bars.style.width = `${totalDays * GANTT_DAY_WIDTH}px`;
  bars.style.height = `${chart.tasks.length * GANTT_ROW_HEIGHT}px`;
  body.appendChild(bars);

  normalizedTasks.forEach(({ task, startDate, endDate }, index) => {
    const bar = document.createElement('div');
    bar.className = 'gantt-bar';
    const offsetDays = Math.max(0, diffDays(startBoundary, startDate));
    const spanDays = Math.max(1, diffDays(startDate, endDate) + 1);
    bar.style.left = `${offsetDays * GANTT_DAY_WIDTH}px`;
    bar.style.top = `${index * GANTT_ROW_HEIGHT + (GANTT_ROW_HEIGHT - 36) / 2}px`;
    bar.style.width = `${spanDays * GANTT_DAY_WIDTH}px`;

    const progress = Math.min(100, Math.max(0, Number(task.progress) || 0));
    const progressBar = document.createElement('div');
    progressBar.className = 'gantt-bar-progress';
    progressBar.style.width = `${progress}%`;
    bar.appendChild(progressBar);

    const label = document.createElement('span');
    label.className = 'gantt-bar-label';
    const progressLabel = Number.isFinite(progress) ? ` (${Math.round(progress)}%)` : '';
    label.textContent = `${task.name || t('gantt.barFallback')}${progressLabel}`;
    bar.appendChild(label);

    bars.appendChild(bar);
  });
}

function renderGantt() {
  renderGanttList();
  renderGanttBoard();
}

function initGantt() {
  const addChartBtn = document.getElementById('gantt-add-chart');
  const renameChartBtn = document.getElementById('gantt-rename-chart');
  const deleteChartBtn = document.getElementById('gantt-delete-chart');
  const addTaskBtn = document.getElementById('gantt-add-task');

  if (addChartBtn) {
    addChartBtn.addEventListener('click', () => {
      const defaultName = t('gantt.defaultChartName', { index: appData.gantt.charts.length + 1 });
      const name = prompt(t('gantt.newChartPrompt'), defaultName);
      const trimmed = name ? name.trim() : '';
      const chart = {
        id: uid(),
        name: trimmed || defaultName,
        tasks: []
      };
      appData.gantt.charts.push(chart);
      appData.gantt.activeChartId = chart.id;
      saveData();
      renderGantt();
    });
  }

  if (renameChartBtn) {
    renameChartBtn.addEventListener('click', () => {
      const chart = getActiveGanttChart();
      if (!chart) {
        alert(t('gantt.renameChartAlert'));
        return;
      }
      const name = prompt(t('gantt.renameChartPrompt'), chart.name || t('gantt.chartUntitled'));
      if (name === null) {
        return;
      }
      const trimmed = name.trim();
      chart.name = trimmed || chart.name || t('gantt.chartUntitled');
      saveData();
      renderGantt();
    });
  }

  if (deleteChartBtn) {
    deleteChartBtn.addEventListener('click', () => {
      const chart = getActiveGanttChart();
      if (!chart) {
        alert(t('gantt.noChartToDelete'));
        return;
      }
      if (!confirm(t('gantt.deleteChartConfirm'))) return;
      appData.gantt.charts = appData.gantt.charts.filter((item) => item.id !== chart.id);
      if (appData.gantt.charts.length === 0) {
        appData.gantt.activeChartId = null;
      } else {
        appData.gantt.activeChartId = appData.gantt.charts[0].id;
      }
      saveData();
      renderGantt();
    });
  }

  if (addTaskBtn) {
    addTaskBtn.addEventListener('click', () => {
      const chart = getActiveGanttChart();
      if (!chart) {
        alert(t('gantt.addTaskAlert'));
        return;
      }
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      const task = {
        id: uid(),
        name: t('gantt.newTaskName', { index: chart.tasks.length + 1 }),
        start: toISODateString(start),
        end: toISODateString(end),
        progress: 0
      };
      chart.tasks.push(task);
      saveData();
      renderGantt();
    });
  }

  renderGantt();
}
