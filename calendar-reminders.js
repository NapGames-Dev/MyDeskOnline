/* ═══════════════════════════════════════════════════════════
   AGENDA : RAPPELS (notifications système)
   - Une notification du système (coin de l'écran, par-dessus les
     autres applis) N minutes avant chaque évènement.
   - Délai par défaut : appData.calendar.reminders.minutes (synchronisé).
     Délai propre à un évènement : event.reminder = minutes ou 'none'
     (absent = délai par défaut).
   - Activation par appareil (localStorage) : on peut vouloir les
     rappels sur l'ordinateur et pas sur le téléphone.
   - Limite : sans serveur de push, les rappels partent tant que
     MyDesk est ouvert (même réduit ou dans un onglet en arrière-plan).
   ═══════════════════════════════════════════════════════════ */

const REMINDER_TRANSLATIONS = {
  fr: {
    title: '🔔 Rappels',
    enable: 'Activer sur cet appareil',
    disable: 'Désactiver',
    on: 'Activés sur cet appareil.',
    off: 'Désactivés sur cet appareil.',
    blocked: 'Notifications bloquées par le navigateur : autorise-les dans les réglages du site (cadenas à gauche de l’adresse), puis réessaie.',
    unsupported: 'Ce navigateur ne permet pas les notifications.',
    leadLabel: 'Prévenir',
    test: 'Tester',
    testTitle: 'Rappel MyDesk',
    testBody: 'Les rappels de l’agenda s’afficheront comme ceci.',
    testSent: '✓ Envoyée à {via}. Rien dans le coin de l’écran ? Le blocage vient de Windows : 1) Paramètres Windows › Système › Notifications : « Notifications » activé, et ton navigateur (ou « MyDesk Online » si l’app est installée) activé avec « Afficher les bannières ». 2) « Ne pas déranger » désactivé (sinon elles vont seulement dans le centre de notifications, Win+N).',
    testFailed: '✗ Le navigateur a refusé la notification : {error}',
    viaWorker: 'Windows (via l’app)',
    viaPage: 'Windows (via la page)',
    note: 'Les rappels partent tant que MyDesk est ouvert (même réduit ou dans un autre onglet).',
    eventLabel: 'Rappel',
    eventDefault: 'Par défaut ({lead})',
    none: 'Aucun',
    atStart: 'à l’heure',
    before: '{time} avant',
    minutes: '{n} min',
    hours: '{n} h',
    day: '1 jour',
    now: 'Maintenant',
    inTime: 'Dans {time}'
  },
  en: {
    title: '🔔 Reminders',
    enable: 'Turn on for this device',
    disable: 'Turn off',
    on: 'On for this device.',
    off: 'Off for this device.',
    blocked: 'Notifications are blocked by the browser: allow them in the site settings (padlock left of the address), then try again.',
    unsupported: 'This browser does not support notifications.',
    leadLabel: 'Notify',
    test: 'Test',
    testTitle: 'MyDesk reminder',
    testBody: 'Calendar reminders will look like this.',
    testSent: '✓ Sent to {via}. Nothing in the corner of the screen? Your system is blocking it: 1) Windows Settings › System › Notifications: notifications on, and your browser (or "MyDesk Online" if installed) on with banners. 2) Do not disturb off (otherwise they only go to the notification center, Win+N).',
    testFailed: '✗ The browser refused the notification: {error}',
    viaWorker: 'the system (via the app)',
    viaPage: 'the system (via the page)',
    note: 'Reminders are sent while MyDesk is open (even minimized or in another tab).',
    eventLabel: 'Reminder',
    eventDefault: 'Default ({lead})',
    none: 'None',
    atStart: 'at start time',
    before: '{time} before',
    minutes: '{n} min',
    hours: '{n} h',
    day: '1 day',
    now: 'Now',
    inTime: 'In {time}'
  },
  vi: {
    title: '🔔 Nhắc nhở',
    enable: 'Bật trên thiết bị này',
    disable: 'Tắt',
    on: 'Đã bật trên thiết bị này.',
    off: 'Đã tắt trên thiết bị này.',
    blocked: 'Trình duyệt đang chặn thông báo: hãy cho phép trong cài đặt trang (biểu tượng ổ khóa cạnh địa chỉ), rồi thử lại.',
    unsupported: 'Trình duyệt này không hỗ trợ thông báo.',
    leadLabel: 'Báo trước',
    test: 'Thử',
    testTitle: 'Nhắc nhở MyDesk',
    testBody: 'Nhắc nhở lịch sẽ hiển thị như thế này.',
    testSent: '✓ Đã gửi tới {via}. Không thấy gì ở góc màn hình? Hệ thống đang chặn: 1) Cài đặt Windows › Hệ thống › Thông báo: bật thông báo và bật trình duyệt (hoặc « MyDesk Online » nếu đã cài) có biểu ngữ. 2) Tắt « Không làm phiền » (nếu không, thông báo chỉ vào trung tâm thông báo, Win+N).',
    testFailed: '✗ Trình duyệt từ chối thông báo: {error}',
    viaWorker: 'hệ thống (qua ứng dụng)',
    viaPage: 'hệ thống (qua trang)',
    note: 'Nhắc nhở được gửi khi MyDesk đang mở (kể cả khi thu nhỏ hoặc ở tab khác).',
    eventLabel: 'Nhắc nhở',
    eventDefault: 'Mặc định ({lead})',
    none: 'Không',
    atStart: 'đúng giờ',
    before: 'trước {time}',
    minutes: '{n} phút',
    hours: '{n} giờ',
    day: '1 ngày',
    now: 'Bây giờ',
    inTime: 'Còn {time}'
  }
};

const REMINDER_LEADS = [0, 5, 10, 15, 30, 60, 120, 1440]; // minutes
const REMINDER_DEFAULT_LEAD = 10;
const REMINDER_CHECK_MS = 30000;
const REMINDER_ENABLED_KEY = 'mydesk-reminders-enabled';
const REMINDER_SENT_KEY = 'mydesk-reminders-sent';
const REMINDER_SENT_KEEP_MS = 3 * 24 * 60 * 60 * 1000;
const REMINDER_LATE_START_MS = 5 * 60000; // rappel « à l'heure » encore utile 5 min après le début

let reminderTimer = null;

function registerReminderTranslations() {
  Object.keys(translations).forEach((language) => {
    translations[language].reminders = REMINDER_TRANSLATIONS[language] || REMINDER_TRANSLATIONS.fr;
  });
}

function reminderSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

function reminderEnabled() {
  try {
    return localStorage.getItem(REMINDER_ENABLED_KEY) === '1'
      && reminderSupported() && Notification.permission === 'granted';
  } catch (error) {
    return false;
  }
}

function reminderSetEnabled(value) {
  try {
    if (value) localStorage.setItem(REMINDER_ENABLED_KEY, '1');
    else localStorage.removeItem(REMINDER_ENABLED_KEY);
  } catch (error) {
    // stockage indisponible : rien à retenir
  }
}

function reminderDefaultLead() {
  const settings = appData.calendar && appData.calendar.reminders;
  const minutes = settings ? Number(settings.minutes) : NaN;
  return REMINDER_LEADS.includes(minutes) ? minutes : REMINDER_DEFAULT_LEAD;
}

// Minutes avant l'évènement, ou null si pas de rappel pour lui.
function reminderLeadFor(event) {
  if (event.reminder === 'none') return null;
  const own = Number(event.reminder);
  if (event.reminder !== undefined && event.reminder !== null && event.reminder !== '' && Number.isFinite(own) && own >= 0) {
    return own;
  }
  return reminderDefaultLead();
}

function reminderFormatLead(minutes) {
  if (minutes === 0) return t('reminders.atStart');
  let time;
  if (minutes >= 1440 && minutes % 1440 === 0) time = t('reminders.day');
  else if (minutes >= 60 && minutes % 60 === 0) time = t('reminders.hours', { n: minutes / 60 });
  else time = t('reminders.minutes', { n: minutes });
  return t('reminders.before', { time });
}

function reminderFormatIn(milliseconds) {
  const minutes = Math.round(milliseconds / 60000);
  if (minutes <= 0) return t('reminders.now');
  let time;
  if (minutes >= 1440 && minutes % 1440 === 0) time = t('reminders.day');
  else if (minutes >= 60 && minutes % 60 === 0) time = t('reminders.hours', { n: minutes / 60 });
  else time = t('reminders.minutes', { n: minutes });
  return t('reminders.inTime', { time });
}

function reminderSentMap() {
  try {
    const parsed = JSON.parse(localStorage.getItem(REMINDER_SENT_KEY) || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    return {};
  }
}

function reminderSaveSent(map) {
  const limit = Date.now() - REMINDER_SENT_KEEP_MS;
  Object.keys(map).forEach((key) => {
    if (map[key] < limit) delete map[key];
  });
  try {
    localStorage.setItem(REMINDER_SENT_KEY, JSON.stringify(map));
  } catch (error) {
    // stockage plein ou bloqué : au pire un rappel en double
  }
}

async function reminderShow(title, options) {
  const settings = {
    icon: 'icons/icon-192.png',
    badge: 'icons/favicon-48.png',
    ...options
  };
  // Via le service worker si possible (obligatoire pour l'app installée sur
  // téléphone) ; un clic sur la notification ramène sur MyDesk.
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    try {
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((resolve) => setTimeout(() => resolve(null), 2000))
      ]);
      if (registration && registration.showNotification) {
        await registration.showNotification(title, settings);
        return 'worker';
      }
    } catch (error) {
      // repli sur la notification simple ci-dessous
    }
  }
  const notification = new Notification(title, settings);
  notification.onclick = () => {
    window.focus();
    notification.close();
    reminderOpenTarget(settings.data);
  };
  return 'page';
}

// Après un clic sur un rappel : une séance de sport s'ouvre dans l'onglet Sport.
function reminderOpenTarget(data) {
  const target = data && data.open;
  if (target && target.tab === 'sport' && typeof openSportSessionOn === 'function') {
    openSportSessionOn(target.session, target.date);
  }
}

function checkCalendarReminders() {
  if (!reminderEnabled() || !appData.calendar || !Array.isArray(appData.calendar.events)) return;
  const now = Date.now();
  // Fenêtre de 7 jours qui commence hier : couvre un rappel « 1 jour avant »
  // et un évènement commencé il y a peu.
  const rangeStart = new Date(now - 24 * 60 * 60 * 1000);
  const sent = reminderSentMap();
  let changed = false;
  appData.calendar.events.forEach((event) => {
    const lead = reminderLeadFor(event);
    if (lead === null) return;
    getOccurrencesForWeek(event, rangeStart).forEach((occurrence) => {
      const start = occurrence.start.getTime();
      const fireAt = start - lead * 60000;
      // Après le début, plus d'intérêt (sauf rappel « à l'heure » un peu en retard).
      const lastUseful = lead === 0 ? start + REMINDER_LATE_START_MS : start;
      if (now < fireAt || now >= lastUseful) return;
      const key = `${event.id}|${occurrence.start.toISOString()}|${lead}`;
      if (sent[key]) return;
      sent[key] = now;
      changed = true;
      const end = new Date(start + occurrence.duration * 60000);
      const place = (event.location || '').trim();
      // Créneau Sport : nom de la séance, exercices, semaine ; le clic ouvre la séance.
      const sport = event.sportSessionId && typeof sportReminderContent === 'function' ? sportReminderContent(event, occurrence) : null;
      const body = [
        `${reminderFormatIn(start - now)} · ${formatTime(occurrence.start)} – ${formatTime(end)}`,
        place ? `📍 ${place}` : '',
        ...(sport ? sport.lines : [])
      ].filter(Boolean).join('\n');
      reminderShow(sport ? sport.title : event.title || t('calendar.eventDefaultTitle'), {
        body,
        tag: `mydesk-${key}`, // même rappel dans deux onglets : une seule notification
        data: sport ? { url: './?tab=sport', open: sport.open } : { url: './' }
      }).catch((error) => console.warn('Rappel impossible', error));
    });
  });
  if (changed) reminderSaveSent(sent);
}

async function reminderToggle() {
  if (reminderEnabled()) {
    reminderSetEnabled(false);
    renderRemindersPanel();
    return;
  }
  if (!reminderSupported()) return;
  let permission = Notification.permission;
  if (permission === 'default') {
    try {
      permission = await Notification.requestPermission();
    } catch (error) {
      permission = 'denied';
    }
  }
  reminderSetEnabled(permission === 'granted');
  renderRemindersPanel();
  if (permission === 'granted') checkCalendarReminders();
}

function renderRemindersPanel() {
  const panel = document.getElementById('calendar-reminders');
  if (!panel || !appData.calendar) return;
  panel.innerHTML = '';
  const title = document.createElement('h3');
  title.textContent = t('reminders.title');
  panel.appendChild(title);

  const status = document.createElement('p');
  status.className = 'calendar-reminders__status';
  if (!reminderSupported()) {
    status.textContent = t('reminders.unsupported');
    panel.appendChild(status);
    return;
  }
  const enabled = reminderEnabled();
  const blocked = Notification.permission === 'denied';
  status.textContent = blocked ? t('reminders.blocked') : t(enabled ? 'reminders.on' : 'reminders.off');
  status.classList.toggle('is-warning', blocked);
  panel.appendChild(status);

  const row = document.createElement('div');
  row.className = 'calendar-reminders__row';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = enabled ? 'btn-secondary' : '';
  toggle.textContent = t(enabled ? 'reminders.disable' : 'reminders.enable');
  toggle.disabled = blocked && !enabled;
  toggle.addEventListener('click', reminderToggle);
  row.appendChild(toggle);
  if (enabled) {
    const test = document.createElement('button');
    test.type = 'button';
    test.className = 'btn-secondary';
    test.textContent = t('reminders.test');
    test.addEventListener('click', async () => {
      const result = panel.querySelector('.calendar-reminders__test-result') || document.createElement('p');
      result.className = 'calendar-reminders__test-result';
      row.after(result);
      try {
        // Étiquette unique : un 2e test s'affiche aussi (même étiquette = remplacée sans bannière).
        const via = await reminderShow(t('reminders.testTitle'), {
          body: t('reminders.testBody'),
          tag: `mydesk-test-${Date.now()}`
        });
        result.classList.remove('is-warning');
        result.textContent = t('reminders.testSent', { via: t(via === 'worker' ? 'reminders.viaWorker' : 'reminders.viaPage') });
      } catch (error) {
        result.classList.add('is-warning');
        result.textContent = t('reminders.testFailed', { error: (error && error.message) || String(error) });
      }
    });
    row.appendChild(test);
  }
  panel.appendChild(row);

  const lead = document.createElement('label');
  lead.className = 'calendar-reminders__lead';
  const leadText = document.createElement('span');
  leadText.textContent = t('reminders.leadLabel');
  const select = document.createElement('select');
  REMINDER_LEADS.forEach((minutes) => {
    const option = document.createElement('option');
    option.value = String(minutes);
    option.textContent = reminderFormatLead(minutes);
    select.appendChild(option);
  });
  select.value = String(reminderDefaultLead());
  select.addEventListener('change', () => {
    appData.calendar.reminders = { ...(appData.calendar.reminders || {}), minutes: Number(select.value) };
    saveData();
    checkCalendarReminders();
  });
  lead.append(leadText, select);
  panel.appendChild(lead);

  const note = document.createElement('p');
  note.className = 'calendar-reminders__note';
  note.textContent = t('reminders.note');
  panel.appendChild(note);
}

// Fenêtre d'un évènement : liste « Rappel » (par défaut, aucun, ou un délai).
function fillEventReminderSelect(value) {
  const select = document.getElementById('event-reminder');
  if (!select) return;
  select.innerHTML = '';
  const add = (optionValue, label) => {
    const option = document.createElement('option');
    option.value = optionValue;
    option.textContent = label;
    select.appendChild(option);
  };
  add('', t('reminders.eventDefault', { lead: reminderFormatLead(reminderDefaultLead()) }));
  add('none', t('reminders.none'));
  REMINDER_LEADS.forEach((minutes) => add(String(minutes), reminderFormatLead(minutes)));
  const current = value === undefined || value === null ? '' : String(value);
  select.value = Array.from(select.options).some((option) => option.value === current) ? current : '';
}

// Valeur à enregistrer sur l'évènement (undefined = délai par défaut).
function readEventReminderSelect() {
  const select = document.getElementById('event-reminder');
  if (!select || select.value === '') return undefined;
  return select.value === 'none' ? 'none' : Number(select.value);
}

function initCalendarReminders() {
  renderRemindersPanel();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'mydesk-notification-click') reminderOpenTarget(event.data.data);
    });
  }
  clearInterval(reminderTimer);
  reminderTimer = setInterval(checkCalendarReminders, REMINDER_CHECK_MS);
  document.addEventListener('visibilitychange', checkCalendarReminders);
  window.addEventListener('focus', checkCalendarReminders);
  checkCalendarReminders();
}
