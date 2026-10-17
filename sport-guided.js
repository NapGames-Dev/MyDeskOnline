/* ═══════════════════════════════════════════════════════════
   SPORT : MODE SÉANCE GUIDÉE
   Plein écran : l'échauffement pas à pas (chrono pour les mouvements
   tenus), puis un exercice et une série à la fois, avec des séries
   d'approche avant le premier exercice de chaque famille. On note la
   série, le repos défile, puis la série suivante s'affiche. Les
   séries vont dans le même journal que la liste (appData.sport.logs).
   L'écran reste allumé (Wake Lock) tant que le mode est ouvert.
   ═══════════════════════════════════════════════════════════ */

const SPORT_GUIDED_TRANSLATIONS = {
  fr: {
    guidedStart: '▶ Mode guidé',
    guidedTitle: 'Un exercice à la fois, en grand, écran toujours allumé',
    guidedClose: 'Quitter le mode guidé',
    guidedExercise: 'Exercice {n}/{total}',
    guidedSet: 'Série {n}/{total}',
    guidedLast: 'dernière fois : {value}',
    guidedRange: 'objectif {reps}',
    guidedDone: '✓ Série faite',
    guidedHold: '▶ Lancer le chrono',
    guidedPrev: '‹ Précédent',
    guidedSkip: 'Passer l’exercice ›',
    guidedRest: 'Repos',
    guidedNext: 'À suivre : {name} · série {n}/{total}',
    guidedAddTime: '+15 s',
    guidedSkipRest: 'Passer le repos ›',
    guidedFinish: 'Fermer',
    guidedTechnique: 'Technique',
    guidedLess: 'Moins',
    guidedMore: 'Plus',
    guidedSeconds: 'secondes',
    guidedReps: 'répétitions',
    guidedHolding: 'Tiens !',
    guidedCancel: 'Annuler',
    guidedWarmup: 'Échauffement {n}/{total}',
    guidedWarmupStart: '▶ Lancer',
    guidedWarmupDone: '✓ Fait ›',
    guidedWarmupSkip: 'Passer l’échauffement ›',
    guidedApproach: 'Séries d’approche',
    guidedApproachHint: 'Ensuite 1 min de repos, puis ta 1re série.',
    guidedApproachDone: '✓ Fait, repos 1 min',
    guidedApproachSkip: 'Passer ›',
    guidedCooldown: 'Retour au calme (facultatif) : 2 min de marche, respiration lente.'
  },
  en: {
    guidedStart: '▶ Guided mode',
    guidedTitle: 'One exercise at a time, big, screen kept on',
    guidedClose: 'Leave guided mode',
    guidedExercise: 'Exercise {n}/{total}',
    guidedSet: 'Set {n}/{total}',
    guidedLast: 'last time: {value}',
    guidedRange: 'goal {reps}',
    guidedDone: '✓ Set done',
    guidedHold: '▶ Start the timer',
    guidedPrev: '‹ Previous',
    guidedSkip: 'Skip exercise ›',
    guidedRest: 'Rest',
    guidedNext: 'Up next: {name} · set {n}/{total}',
    guidedAddTime: '+15 s',
    guidedSkipRest: 'Skip rest ›',
    guidedFinish: 'Close',
    guidedTechnique: 'Technique',
    guidedLess: 'Less',
    guidedMore: 'More',
    guidedSeconds: 'seconds',
    guidedReps: 'reps',
    guidedHolding: 'Hold!',
    guidedCancel: 'Cancel',
    guidedWarmup: 'Warm-up {n}/{total}',
    guidedWarmupStart: '▶ Start',
    guidedWarmupDone: '✓ Done ›',
    guidedWarmupSkip: 'Skip warm-up ›',
    guidedApproach: 'Ramp-up sets',
    guidedApproachHint: 'Then 1 min rest, then your first set.',
    guidedApproachDone: '✓ Done, 1 min rest',
    guidedApproachSkip: 'Skip ›',
    guidedCooldown: 'Cool-down (optional): 2 min of walking, slow breathing.'
  },
  vi: {
    guidedStart: '▶ Chế độ hướng dẫn',
    guidedTitle: 'Từng bài một, chữ lớn, màn hình luôn sáng',
    guidedClose: 'Thoát chế độ hướng dẫn',
    guidedExercise: 'Bài {n}/{total}',
    guidedSet: 'Hiệp {n}/{total}',
    guidedLast: 'lần trước: {value}',
    guidedRange: 'mục tiêu {reps}',
    guidedDone: '✓ Xong hiệp',
    guidedHold: '▶ Bấm giờ',
    guidedPrev: '‹ Trước',
    guidedSkip: 'Bỏ qua bài ›',
    guidedRest: 'Nghỉ',
    guidedNext: 'Tiếp theo: {name} · hiệp {n}/{total}',
    guidedAddTime: '+15 giây',
    guidedSkipRest: 'Bỏ qua nghỉ ›',
    guidedFinish: 'Đóng',
    guidedTechnique: 'Kỹ thuật',
    guidedLess: 'Bớt',
    guidedMore: 'Thêm',
    guidedSeconds: 'giây',
    guidedReps: 'lần',
    guidedHolding: 'Giữ!',
    guidedCancel: 'Hủy',
    guidedWarmup: 'Khởi động {n}/{total}',
    guidedWarmupStart: '▶ Bắt đầu',
    guidedWarmupDone: '✓ Xong ›',
    guidedWarmupSkip: 'Bỏ qua khởi động ›',
    guidedApproach: 'Hiệp làm quen',
    guidedApproachHint: 'Sau đó nghỉ 1 phút, rồi hiệp đầu tiên.',
    guidedApproachDone: '✓ Xong, nghỉ 1 phút',
    guidedApproachSkip: 'Bỏ qua ›',
    guidedCooldown: 'Thả lỏng (tùy chọn): đi bộ 2 phút, thở chậm.'
  }
};

Object.keys(SPORT_GUIDED_TRANSLATIONS).forEach((language) => {
  if (SPORT_TRANSLATIONS[language]) Object.assign(SPORT_TRANSLATIONS[language], SPORT_GUIDED_TRANSLATIONS[language]);
});

// { sessionId, dateKey, phase: 'warmup' | 'approach' | 'set' | 'hold' | 'rest' | 'done',
//   index, set, value, pending, restEnd, restTotal, holdStart, interval, wakeLock,
//   warmup (étapes), warmIndex, warmEnd, start (1re position après l'échauffement),
//   approach (séries d'approche affichées), approached (exercices déjà préparés) }
let sportGuided = null;

function guidedSession() {
  return sportGuided ? getSportSession(sportGuided.sessionId) : null;
}

function guidedEntry(session, exercise) {
  return getSportLog(sportGuided.dateKey, session.id)[exercise.id] || {};
}

// Séries à faire : celles prévues, plus celles en plus faites la dernière fois.
function guidedSetCount(session, exercise) {
  const last = getLastPerformance(session.id, exercise, sportGuided.dateKey);
  const lastCount = last ? last.sets.filter((value) => Number(value) > 0).length : 0;
  const entry = guidedEntry(session, exercise);
  const filled = Array.isArray(entry.sets) ? entry.sets.filter((value) => Number(value) > 0).length : 0;
  return Math.max(Number(exercise.sets) || 1, lastCount, filled);
}

function guidedFirstEmptySet(session, exercise) {
  const sets = guidedEntry(session, exercise).sets || [];
  const count = guidedSetCount(session, exercise);
  for (let i = 0; i < count; i += 1) {
    if (!(Number(sets[i]) > 0)) return i;
  }
  return 0;
}

// Prochain exercice pas encore fait après `from` (puis ceux passés plus tôt).
function guidedNextExercise(session, from) {
  const count = session.exercises.length;
  for (let offset = 1; offset < count; offset += 1) {
    const index = (from + offset) % count;
    const exercise = session.exercises[index];
    if (!guidedEntry(session, exercise).done) return { index, set: guidedFirstEmptySet(session, exercise) };
  }
  return null;
}

function guidedPrepareValue() {
  const session = guidedSession();
  const exercise = session && session.exercises[sportGuided.index];
  if (!exercise) return;
  const own = Number((guidedEntry(session, exercise).sets || [])[sportGuided.set]) || 0;
  const last = getLastPerformance(session.id, exercise, sportGuided.dateKey);
  const lastValue = last ? Number(last.sets[sportGuided.set]) || 0 : 0;
  const range = parseRepRange(exercise.reps);
  sportGuided.value = own || lastValue || (range ? range.min : 10);
}

function guidedGoTo(position) {
  sportGuided.index = position.index;
  sportGuided.set = position.set;
  sportGuided.phase = 'set';
  // Première arrivée sur un exercice pas encore commencé : séries d'approche.
  const session = guidedSession();
  if (session && position.set === 0 && !sportGuided.approached.has(position.index)) {
    sportGuided.approached.add(position.index);
    const entry = guidedEntry(session, session.exercises[position.index]);
    const started = Array.isArray(entry.sets) && entry.sets.some((value) => Number(value) > 0);
    const sets = started ? null : sportApproach(session, position.index);
    if (sets) {
      sportGuided.phase = 'approach';
      sportGuided.approach = sets;
    }
  }
  guidedPrepareValue();
}

async function guidedKeepAwake() {
  if (!sportGuided || document.visibilityState !== 'visible' || !('wakeLock' in navigator)) return;
  if (sportGuided.wakeLock && !sportGuided.wakeLock.released) return;
  try {
    sportGuided.wakeLock = await navigator.wakeLock.request('screen');
  } catch (error) {
    // Refusé (batterie faible, navigateur) : l'écran s'éteindra normalement.
  }
}

function guidedKeydown(event) {
  if (event.key === 'Escape') closeSportGuided();
}

function openSportGuided(session, date) {
  closeSportGuided(false);
  stopRestTimer();
  sportGuided = { sessionId: session.id, dateKey: sportDateKey(date), phase: 'set', index: 0, set: 0, interval: null, wakeLock: null, warmup: [], warmIndex: 0, warmEnd: null, approached: new Set() };
  const firstOpen = session.exercises.findIndex((exercise) => !guidedEntry(session, exercise).done);
  // Échauffement seulement si rien n'est encore noté pour cette séance ce jour-là.
  const started = session.exercises.some((exercise) => {
    const entry = guidedEntry(session, exercise);
    return entry.done || (Array.isArray(entry.sets) && entry.sets.some((value) => Number(value) > 0));
  });
  if (firstOpen === -1) {
    sportGuided.phase = 'done';
  } else if (!started) {
    sportGuided.warmup = sportWarmupSteps(session);
    sportGuided.start = { index: firstOpen, set: guidedFirstEmptySet(session, session.exercises[firstOpen]) };
    sportGuided.phase = 'warmup';
  } else {
    guidedGoTo({ index: firstOpen, set: guidedFirstEmptySet(session, session.exercises[firstOpen]) });
  }
  const overlay = sportEl('div', 'sport-guided');
  overlay.id = 'sport-guided';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', session.name || t('sport.newSessionName'));
  document.body.appendChild(overlay);
  document.body.classList.add('sport-guided-open');
  document.addEventListener('keydown', guidedKeydown);
  document.addEventListener('visibilitychange', guidedKeepAwake);
  guidedKeepAwake();
  renderSportGuided();
}

function closeSportGuided(rerender = true) {
  if (!sportGuided) return;
  clearInterval(sportGuided.interval);
  if (sportGuided.wakeLock) sportGuided.wakeLock.release().catch(() => {});
  sportGuided = null;
  const overlay = document.getElementById('sport-guided');
  if (overlay) overlay.remove();
  document.body.classList.remove('sport-guided-open');
  document.removeEventListener('keydown', guidedKeydown);
  document.removeEventListener('visibilitychange', guidedKeepAwake);
  if (rerender) renderSportMain();
}

function guidedSaveSet(value) {
  const session = guidedSession();
  const exercise = session.exercises[sportGuided.index];
  const entry = guidedEntry(session, exercise);
  const sets = Array.isArray(entry.sets) ? entry.sets.slice() : [];
  while (sets.length < sportGuided.set) sets.push('');
  sets[sportGuided.set] = Number(value) > 0 ? Number(value) : '';
  const patch = { sets, variant: exercise.name };
  if (sets.filter((v) => Number(v) > 0).length >= Math.max(1, Number(exercise.sets) || 1)) patch.done = true;
  setSportLog(sportGuided.dateKey, session.id, exercise.id, patch);

  const next = sportGuided.set + 1 < guidedSetCount(session, exercise)
    ? { index: sportGuided.index, set: sportGuided.set + 1 }
    : guidedNextExercise(session, sportGuided.index);
  if (!next) {
    sportGuided.phase = 'done';
  } else if (Number(exercise.rest) > 0) {
    sportGuided.phase = 'rest';
    sportGuided.pending = next;
    sportGuided.restTotal = Number(exercise.rest);
    sportGuided.restEnd = Date.now() + sportGuided.restTotal * 1000;
  } else {
    guidedGoTo(next);
  }
  renderSportGuided();
}

function guidedPrevious() {
  const session = guidedSession();
  if (sportGuided.set > 0) {
    guidedGoTo({ index: sportGuided.index, set: sportGuided.set - 1 });
  } else if (sportGuided.index > 0) {
    const index = sportGuided.index - 1;
    guidedGoTo({ index, set: guidedSetCount(session, session.exercises[index]) - 1 });
  }
  renderSportGuided();
}

function guidedSkip() {
  const next = guidedNextExercise(guidedSession(), sportGuided.index);
  if (next) guidedGoTo(next);
  else sportGuided.phase = 'done';
  renderSportGuided();
}

function renderSportGuided() {
  const overlay = document.getElementById('sport-guided');
  const session = guidedSession();
  if (!overlay || !session || !session.exercises.length) {
    closeSportGuided();
    return;
  }
  clearInterval(sportGuided.interval);
  overlay.classList.remove('is-reached');
  overlay.innerHTML = '';

  const top = sportEl('div', 'sport-guided__top');
  top.append(
    sportEl('span', 'sport-guided__session', session.name || t('sport.newSessionName')),
    sportButton('sport-guided__close', '✕', () => closeSportGuided(), t('sport.guidedClose'))
  );
  const steps = sportEl('div', 'sport-guided__steps');
  if (sportGuided.warmup.length) {
    steps.appendChild(sportEl('span', `warm ${sportGuided.phase === 'warmup' ? 'current' : 'done'}`));
  }
  session.exercises.forEach((exercise, index) => {
    const step = sportEl('span');
    if (guidedEntry(session, exercise).done) step.classList.add('done');
    if (index === sportGuided.index && !['done', 'warmup'].includes(sportGuided.phase)) step.classList.add('current');
    steps.appendChild(step);
  });
  const body = sportEl('div', 'sport-guided__body');
  overlay.append(top, steps, body);

  if (sportGuided.phase === 'done') renderGuidedDone(body, session);
  else if (sportGuided.phase === 'warmup') renderGuidedWarmup(body);
  else if (sportGuided.phase === 'approach') renderGuidedApproach(body, session);
  else if (sportGuided.phase === 'rest') renderGuidedRest(body, session);
  else renderGuidedSet(body, session);
}

/* ── Échauffement pas à pas ─────────────────────────────────── */

function guidedWarmupGo(index) {
  clearInterval(sportGuided.interval);
  sportGuided.warmEnd = null;
  if (index >= sportGuided.warmup.length) guidedGoTo(sportGuided.start);
  else sportGuided.warmIndex = Math.max(0, index);
  renderSportGuided();
}

// Mouvement tenu : chrono à lancer, bip et étape suivante à la fin.
// Mouvement en répétitions : « Fait » quand c'est fini.
function renderGuidedWarmup(body) {
  const steps = sportGuided.warmup;
  const step = steps[sportGuided.warmIndex];
  body.appendChild(sportEl('p', 'sport-guided__eyebrow', t('sport.guidedWarmup', { n: sportGuided.warmIndex + 1, total: steps.length })));
  body.appendChild(sportEl('h2', 'sport-guided__name', step.name));
  const actions = sportEl('div', 'sport-guided__actions');
  if (step.seconds) {
    const count = sportEl('div', 'sport-guided__count');
    const track = sportEl('div', 'sport-guided__track');
    const bar = sportEl('div', 'sport-guided__bar');
    track.appendChild(bar);
    body.append(count, track);
    const tick = () => {
      const left = sportGuided.warmEnd ? Math.max(0, Math.ceil((sportGuided.warmEnd - Date.now()) / 1000)) : step.seconds;
      count.textContent = formatClock(left);
      bar.style.width = `${(left / step.seconds) * 100}%`;
      if (sportGuided.warmEnd && left <= 0) {
        sportAlert();
        guidedWarmupGo(sportGuided.warmIndex + 1);
      }
    };
    tick();
    if (sportGuided.warmEnd) {
      sportGuided.interval = setInterval(tick, 250);
    } else {
      actions.appendChild(sportButton('sport-guided__hold', t('sport.guidedWarmupStart'), () => {
        sportGuided.warmEnd = Date.now() + step.seconds * 1000;
        renderSportGuided();
      }));
    }
  } else {
    body.appendChild(sportEl('div', 'sport-guided__count sport-guided__count--text', step.reps));
  }
  body.appendChild(sportEl('p', 'sport-guided__detail', step.detail));
  actions.appendChild(sportButton('sport-guided__done', t('sport.guidedWarmupDone'), () => guidedWarmupGo(sportGuided.warmIndex + 1)));
  body.appendChild(actions);

  const nav = sportEl('div', 'sport-guided__nav');
  const prev = sportButton('', t('sport.guidedPrev'), () => guidedWarmupGo(sportGuided.warmIndex - 1));
  prev.disabled = sportGuided.warmIndex === 0;
  nav.append(prev, sportButton('', t('sport.guidedWarmupSkip'), () => guidedWarmupGo(steps.length)));
  body.appendChild(nav);
}

// Séries d'approche, puis 1 min de repos avant la première vraie série.
function renderGuidedApproach(body, session) {
  const exercise = session.exercises[sportGuided.index];
  body.appendChild(sportEl('p', 'sport-guided__eyebrow', `${t('sport.guidedExercise', { n: sportGuided.index + 1, total: session.exercises.length })} · ${t('sport.guidedApproach')}`));
  body.appendChild(sportEl('h2', 'sport-guided__name', exercise.name || t('sport.exercise')));
  const list = sportEl('ol', 'sport-guided__approach');
  sportGuided.approach.forEach((set) => {
    const item = sportEl('li');
    item.append(sportEl('strong', '', `${set.reps} × ${set.name}`), sportEl('span', '', set.detail));
    list.appendChild(item);
  });
  body.appendChild(list);
  body.appendChild(sportEl('p', 'sport-guided__meta', t('sport.guidedApproachHint')));
  const actions = sportEl('div', 'sport-guided__actions');
  actions.appendChild(sportButton('sport-guided__done', t('sport.guidedApproachDone'), () => {
    sportGuided.phase = 'rest';
    sportGuided.pending = { index: sportGuided.index, set: 0 };
    sportGuided.restTotal = 60;
    sportGuided.restEnd = Date.now() + 60000;
    renderSportGuided();
  }));
  body.appendChild(actions);
  const nav = sportEl('div', 'sport-guided__nav');
  nav.appendChild(sportButton('', t('sport.guidedApproachSkip'), () => {
    sportGuided.phase = 'set';
    renderSportGuided();
  }));
  body.appendChild(nav);
}

function renderGuidedHeading(body, session, exercise, index, set) {
  const timed = isTimedExercise(exercise);
  const last = getLastPerformance(session.id, exercise, sportGuided.dateKey);
  const lastValue = last ? Number(last.sets[set]) || 0 : 0;
  body.appendChild(sportEl('p', 'sport-guided__eyebrow', `${t('sport.guidedExercise', { n: index + 1, total: session.exercises.length })} · ${t('sport.guidedSet', { n: set + 1, total: guidedSetCount(session, exercise) })}`));
  body.appendChild(sportEl('h2', 'sport-guided__name', exercise.name || t('sport.exercise')));
  const meta = [exercise.reps ? t('sport.guidedRange', { reps: exercise.reps }) : '', lastValue ? t('sport.guidedLast', { value: formatSportAmount(lastValue, timed) }) : ''];
  body.appendChild(sportEl('p', 'sport-guided__meta', meta.filter(Boolean).join(' · ')));
  return lastValue;
}

function renderGuidedSet(body, session) {
  const exercise = session.exercises[sportGuided.index];
  const timed = isTimedExercise(exercise);
  const lastValue = renderGuidedHeading(body, session, exercise, sportGuided.index, sportGuided.set);
  if (exercise.tip) body.appendChild(sportEl('p', 'sport-guided__tip', exercise.tip));
  const { step } = getLadderStep(exercise);
  if (step && Array.isArray(step.how)) {
    const details = sportEl('details', 'sport-guided__technique');
    details.appendChild(sportEl('summary', '', t('sport.guidedTechnique')));
    const how = sportEl('ol');
    step.how.forEach((line) => how.appendChild(sportEl('li', '', line)));
    details.appendChild(how);
    body.appendChild(details);
  }

  if (sportGuided.phase === 'hold') {
    renderGuidedHold(body, exercise, lastValue);
    return;
  }

  const stepSize = timed ? 5 : 1;
  const stepper = sportEl('div', 'sport-guided__stepper');
  const valueBox = sportEl('label', 'sport-guided__value-box');
  const valueInput = sportInput('number', sportGuided.value, (value) => {
    sportGuided.value = Math.max(0, Number(value) || 0);
  }, { class: 'sport-guided__value', min: '0', inputmode: 'numeric', 'aria-label': t('sport.setLabel', { n: sportGuided.set + 1 }) });
  valueInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') guidedSaveSet(sportGuided.value);
  });
  valueBox.append(valueInput, sportEl('span', 'sport-guided__unit', t(timed ? 'sport.guidedSeconds' : 'sport.guidedReps')));
  const bump = (delta) => {
    sportGuided.value = Math.max(0, (Number(sportGuided.value) || 0) + delta);
    valueInput.value = sportGuided.value;
  };
  stepper.append(
    sportButton('sport-guided__bump', '−', () => bump(-stepSize), t('sport.guidedLess')),
    valueBox,
    sportButton('sport-guided__bump', '+', () => bump(stepSize), t('sport.guidedMore'))
  );
  body.appendChild(stepper);

  const actions = sportEl('div', 'sport-guided__actions');
  if (timed) {
    actions.appendChild(sportButton('sport-guided__hold', t('sport.guidedHold'), () => {
      sportGuided.phase = 'hold';
      sportGuided.holdStart = Date.now() + SPORT_HOLD_COUNTDOWN_S * 1000;
      renderSportGuided();
    }));
  }
  actions.appendChild(sportButton('sport-guided__done', t('sport.guidedDone'), () => guidedSaveSet(sportGuided.value)));
  body.appendChild(actions);

  const nav = sportEl('div', 'sport-guided__nav');
  const prev = sportButton('', t('sport.guidedPrev'), guidedPrevious);
  prev.disabled = sportGuided.index === 0 && sportGuided.set === 0;
  nav.append(prev, sportButton('', t('sport.guidedSkip'), guidedSkip));
  body.appendChild(nav);
}

// Chrono plein écran : 3 s de mise en place, puis le temps tenu monte.
function renderGuidedHold(body, exercise, lastValue) {
  const range = parseRepRange(exercise.reps);
  const target = Math.max(lastValue, range ? range.min : 0);
  const label = sportEl('p', 'sport-guided__eyebrow');
  const count = sportEl('div', 'sport-guided__count');
  const track = sportEl('div', 'sport-guided__track');
  const bar = sportEl('div', 'sport-guided__bar');
  track.appendChild(bar);
  body.append(label, count, track);
  let started = false;
  let reached = false;
  const held = () => Math.max(0, Math.floor((Date.now() - sportGuided.holdStart) / 1000));
  const actions = sportEl('div', 'sport-guided__actions');
  actions.append(
    sportButton('sport-guided__secondary', t('sport.guidedCancel'), () => {
      sportGuided.phase = 'set';
      renderSportGuided();
    }),
    sportButton('sport-guided__done', t('sport.holdStop'), () => {
      if (started) guidedSaveSet(held());
    })
  );
  body.appendChild(actions);
  const overlay = document.getElementById('sport-guided');
  const tick = () => {
    const now = Date.now();
    if (now < sportGuided.holdStart) {
      label.textContent = t('sport.holdGetReady');
      count.textContent = String(Math.ceil((sportGuided.holdStart - now) / 1000));
      return;
    }
    if (!started) {
      started = true;
      sportBeep(1);
    }
    const seconds = held();
    count.textContent = formatClock(seconds);
    bar.style.width = target ? `${Math.min(1, seconds / target) * 100}%` : '100%';
    label.textContent = reached ? t('sport.holdReached') : target ? `${t('sport.guidedHolding')} · ${formatClock(target)}` : t('sport.guidedHolding');
    if (!reached && target && seconds >= target) {
      reached = true;
      overlay.classList.add('is-reached');
      sportAlert();
    }
  };
  sportGuided.interval = setInterval(tick, 200);
  tick();
}

function renderGuidedRest(body, session) {
  const next = sportGuided.pending;
  const exercise = session.exercises[next.index];
  body.appendChild(sportEl('p', 'sport-guided__eyebrow', t('sport.guidedRest')));
  const count = sportEl('div', 'sport-guided__count');
  const track = sportEl('div', 'sport-guided__track');
  const bar = sportEl('div', 'sport-guided__bar');
  track.appendChild(bar);
  body.append(count, track);
  if (exercise) {
    body.appendChild(sportEl('p', 'sport-guided__meta', t('sport.guidedNext', {
      name: exercise.name || t('sport.exercise'),
      n: next.set + 1,
      total: guidedSetCount(session, exercise)
    })));
  }
  const goNext = () => {
    guidedGoTo(next);
    renderSportGuided();
  };
  const actions = sportEl('div', 'sport-guided__actions');
  actions.append(
    sportButton('sport-guided__secondary', t('sport.guidedAddTime'), () => {
      sportGuided.restEnd += 15000;
      sportGuided.restTotal += 15;
      tick();
    }),
    sportButton('sport-guided__done', t('sport.guidedSkipRest'), goNext)
  );
  body.appendChild(actions);
  const tick = () => {
    const left = Math.max(0, Math.ceil((sportGuided.restEnd - Date.now()) / 1000));
    count.textContent = formatClock(left);
    bar.style.width = `${(left / sportGuided.restTotal) * 100}%`;
    if (left <= 0) {
      sportAlert();
      goNext();
    }
  };
  sportGuided.interval = setInterval(tick, 250);
  tick();
}

function renderGuidedDone(body, session) {
  body.classList.add('is-summary');
  renderSportSummary(body, session, sportGuided.dateKey);
  body.appendChild(sportEl('p', 'sport-guided__meta', t('sport.guidedCooldown')));
  body.appendChild(sportButton('sport-guided__done', t('sport.guidedFinish'), () => closeSportGuided()));
}
