/* ═══════════════════════════════════════════════════════════
   AGENDA SUR LE TÉLÉPHONE (abonnement .ics)
   Une application web ne peut pas créer de widget. À la place, la
   synchro publie l'agenda dans le Gist sous forme de calendrier .ics :
   l'application Calendrier du téléphone (iPhone, Google Agenda…)
   s'y abonne, et son widget affiche alors l'agenda MyDesk.
   Activé dans les données (appData.calendar.feed.enabled) : chaque
   appareil synchronisé tient le fichier à jour.
   ═══════════════════════════════════════════════════════════ */

const FEED_FILE_NAME = 'mydesk-agenda.ics';
const FEED_PAST_DAYS = 90; // évènements ponctuels plus anciens : non publiés

const CALENDAR_FEED_TRANSLATIONS = {
  fr: {
    feedTitle: '📅 Agenda sur ton téléphone',
    feedToggle: "Publier mon agenda pour l'afficher dans l'appli Calendrier du téléphone (et son widget)",
    feedPending: 'Publication en cours : le lien marchera après la prochaine synchronisation.',
    feedCopy: 'Copier le lien',
    feedCopied: 'Lien copié.',
    feedSubscribe: "S'abonner (iPhone / Mac)",
    feedHowTo: 'Comment l’ajouter ?',
    feedIphone: 'iPhone : touche « S’abonner » ci-dessus (ou Réglages → Apps → Calendrier → Comptes calendrier → Ajouter un compte → Autre → Ajouter un calendrier avec abonnement → colle le lien). Puis ajoute le widget Calendrier sur l’écran d’accueil.',
    feedAndroid: 'Android : sur un ordinateur, ouvre Google Agenda → « Autres agendas » → ＋ → « À partir de l’URL » → colle le lien. Sur le téléphone, active cet agenda dans l’appli Google Agenda, puis ajoute son widget.',
    feedDelay: 'Lecture seule : les changements se font dans MyDesk. Mise à jour sur le téléphone : de 15 min à 1 h sur iPhone (selon le réglage), plusieurs heures avec Google Agenda.',
    feedPrivacy: 'Toute personne qui a ce lien peut voir ton agenda : ne le partage pas.'
  },
  en: {
    feedTitle: '📅 Calendar on your phone',
    feedToggle: "Publish my calendar to show it in the phone's Calendar app (and its widget)",
    feedPending: 'Publishing: the link will work after the next sync.',
    feedCopy: 'Copy link',
    feedCopied: 'Link copied.',
    feedSubscribe: 'Subscribe (iPhone / Mac)',
    feedHowTo: 'How to add it?',
    feedIphone: 'iPhone: tap "Subscribe" above (or Settings → Apps → Calendar → Calendar Accounts → Add Account → Other → Add Subscribed Calendar → paste the link). Then add the Calendar widget to your home screen.',
    feedAndroid: 'Android: on a computer, open Google Calendar → "Other calendars" → ＋ → "From URL" → paste the link. On the phone, turn this calendar on in the Google Calendar app, then add its widget.',
    feedDelay: 'Read-only: changes are made in MyDesk. Refresh on the phone: 15 min to 1 h on iPhone (depending on the setting), several hours with Google Calendar.',
    feedPrivacy: 'Anyone with this link can see your calendar: do not share it.'
  },
  vi: {
    feedTitle: '📅 Lịch trên điện thoại',
    feedToggle: 'Xuất bản lịch để hiển thị trong ứng dụng Lịch của điện thoại (và widget)',
    feedPending: 'Liên kết sẽ xuất hiện sau lần đồng bộ tiếp theo.',
    feedCopy: 'Sao chép liên kết',
    feedCopied: 'Đã sao chép.',
    feedSubscribe: 'Đăng ký (iPhone / Mac)',
    feedHowTo: 'Cách thêm?',
    feedIphone: 'iPhone: nhấn "Đăng ký" ở trên, rồi thêm widget Lịch vào màn hình chính.',
    feedAndroid: 'Android: trên máy tính, mở Google Calendar → "Lịch khác" → ＋ → "Từ URL" → dán liên kết.',
    feedDelay: 'Chỉ đọc. Cập nhật trên điện thoại: 15 phút đến vài giờ.',
    feedPrivacy: 'Ai có liên kết này đều xem được lịch của bạn: đừng chia sẻ.'
  }
};

function feedIsEnabled(data = appData) {
  return Boolean(data && data.calendar && data.calendar.feed && data.calendar.feed.enabled);
}

function feedUrl() {
  if (!syncSettings || !syncSettings.gistId || !syncSettings.gistOwner) return null;
  return `https://gist.githubusercontent.com/${syncSettings.gistOwner}/${syncSettings.gistId}/raw/${FEED_FILE_NAME}`;
}

/* ── Génération du .ics ────────────────────────────────────── */

function feedEscape(text) {
  return String(text || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

// Lignes de 75 octets maximum (RFC 5545), coupées sans casser un caractère.
function feedFold(line) {
  const encoder = new TextEncoder();
  const parts = [];
  let current = '';
  let bytes = 0;
  for (const char of line) {
    const size = encoder.encode(char).length;
    const limit = parts.length ? 74 : 75; // les suites commencent par une espace
    if (bytes + size > limit) {
      parts.push(current);
      current = '';
      bytes = 0;
    }
    current += char;
    bytes += size;
  }
  parts.push(current);
  return parts.join('\r\n ');
}

const feedPad = (n) => String(n).padStart(2, '0');

function feedLocal(date) {
  return `${date.getFullYear()}${feedPad(date.getMonth() + 1)}${feedPad(date.getDate())}T${feedPad(date.getHours())}${feedPad(date.getMinutes())}00`;
}

function feedUtc(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

const FEED_FREQ = { daily: 'DAILY', weekly: 'WEEKLY', monthly: 'MONTHLY', yearly: 'YEARLY' };

function buildCalendarFeed(data = appData) {
  const calendar = (data && data.calendar) || {};
  const events = Array.isArray(calendar.events) ? calendar.events : [];
  const types = new Map((Array.isArray(calendar.types) ? calendar.types : []).map((type) => [type.id, type.name]));
  const meta = (data && data.syncMeta) || {};
  const tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Paris').replace(/[^A-Za-z0-9_/+-]/g, '');
  const oldest = Date.now() - FEED_PAST_DAYS * 86400000;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MyDesk Online//Agenda//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:MyDesk Online',
    `X-WR-TIMEZONE:${tz}`,
    'REFRESH-INTERVAL;VALUE=DURATION:PT30M',
    'X-PUBLISHED-TTL:PT30M'
  ];
  events
    .slice()
    .sort((a, b) => String(a.id).localeCompare(String(b.id)))
    .forEach((event) => {
      const start = new Date(event.start);
      if (!event.start || Number.isNaN(start.getTime())) return;
      const freq = FEED_FREQ[event.recurrence];
      if (!freq && start.getTime() < oldest) return;
      const duration = Math.max(1, Number(event.duration) || 60);
      const end = new Date(start.getTime() + duration * 60000);
      // DTSTAMP stable (date de dernière modification connue) : le fichier
      // ne change que si l'agenda change.
      const stamp = Number(meta[`calendar.events#${event.id}`]) > 1 ? new Date(Number(meta[`calendar.events#${event.id}`])) : new Date(Date.UTC(2026, 0, 1));
      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${feedEscape(event.id)}@mydesk-online`);
      lines.push(`DTSTAMP:${feedUtc(stamp)}`);
      lines.push(`DTSTART;TZID=${tz}:${feedLocal(start)}`);
      lines.push(`DTEND;TZID=${tz}:${feedLocal(end)}`);
      lines.push(`SUMMARY:${feedEscape(event.title || t('calendar.eventDefaultTitle'))}`);
      if (event.location) lines.push(`LOCATION:${feedEscape(event.location)}`);
      const typeName = types.get(event.typeId);
      if (typeName) lines.push(`CATEGORIES:${feedEscape(typeName)}`);
      if (freq) {
        let rule = `RRULE:FREQ=${freq}`;
        if (event.until) {
          // « until » = premier jour exclu ; UNTIL (inclus, en UTC) = juste avant.
          const until = new Date(`${event.until}T00:00`);
          if (!Number.isNaN(until.getTime())) rule += `;UNTIL=${feedUtc(new Date(until.getTime() - 1000))}`;
        }
        lines.push(rule);
        (Array.isArray(event.exceptions) ? event.exceptions : []).forEach((day) => {
          const skipped = new Date(`${day}T${feedPad(start.getHours())}:${feedPad(start.getMinutes())}`);
          if (!Number.isNaN(skipped.getTime())) lines.push(`EXDATE;TZID=${tz}:${feedLocal(skipped)}`);
        });
      }
      lines.push('END:VEVENT');
    });
  lines.push('END:VCALENDAR');
  return `${lines.map(feedFold).join('\r\n')}\r\n`;
}

function feedHash(text) {
  let hash = 5381;
  for (let i = 0; i < text.length; i += 1) hash = ((hash << 5) + hash + text.charCodeAt(i)) | 0;
  return `${text.length}:${(hash >>> 0).toString(36)}`;
}

// Fichiers à envoyer en plus des données lors de la synchro :
// le .ics s'il a changé, ou sa suppression si la publication est coupée.
function feedPendingFiles(data) {
  if (feedIsEnabled(data)) {
    const content = buildCalendarFeed(data);
    const hash = feedHash(content);
    if (syncSettings.feedOnRemote && syncSettings.feedHash === hash) return { files: {}, hash };
    return { files: { [FEED_FILE_NAME]: { content } }, hash };
  }
  if (syncSettings.feedOnRemote) return { files: { [FEED_FILE_NAME]: null }, hash: null };
  return { files: {}, hash: null };
}

/* ── Interface (panneau de synchronisation) ────────────────── */

function renderFeedPanel() {
  const box = document.getElementById('sync-feed');
  if (!box) return;
  box.innerHTML = '';
  const title = document.createElement('h4');
  title.textContent = t('sync.feedTitle');
  box.appendChild(title);

  const toggle = document.createElement('label');
  toggle.className = 'sync-feed__toggle';
  const box1 = document.createElement('input');
  box1.type = 'checkbox';
  box1.checked = feedIsEnabled();
  const toggleText = document.createElement('span');
  toggleText.textContent = t('sync.feedToggle');
  toggle.append(box1, toggleText);
  box.appendChild(toggle);
  box1.addEventListener('change', () => {
    appData.calendar.feed = { enabled: box1.checked };
    saveData();
    renderFeedPanel();
  });

  if (!feedIsEnabled()) return;
  const url = feedUrl();
  if (!url || !syncSettings.feedOnRemote) {
    const pending = document.createElement('p');
    pending.className = 'sync-feed__muted';
    pending.textContent = t('sync.feedPending');
    box.appendChild(pending);
    if (!url) return;
  }

  const row = document.createElement('div');
  row.className = 'sync-feed__row';
  const input = document.createElement('input');
  input.type = 'text';
  input.readOnly = true;
  input.value = url;
  input.addEventListener('focus', () => input.select());
  const copy = document.createElement('button');
  copy.type = 'button';
  copy.className = 'btn-secondary';
  copy.textContent = t('sync.feedCopy');
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch (error) {
      input.select();
      document.execCommand('copy');
    }
    copy.textContent = t('sync.feedCopied');
    setTimeout(() => {
      copy.textContent = t('sync.feedCopy');
    }, 2000);
  });
  const subscribe = document.createElement('a');
  subscribe.className = 'btn-secondary sync-feed__subscribe';
  subscribe.href = url.replace(/^https:/, 'webcal:');
  subscribe.textContent = t('sync.feedSubscribe');
  row.append(input, copy, subscribe);
  box.appendChild(row);

  const how = document.createElement('details');
  how.className = 'sync-feed__how';
  const summary = document.createElement('summary');
  summary.textContent = t('sync.feedHowTo');
  how.appendChild(summary);
  ['feedIphone', 'feedAndroid', 'feedDelay'].forEach((key) => {
    const p = document.createElement('p');
    p.textContent = t(`sync.${key}`);
    how.appendChild(p);
  });
  box.appendChild(how);
  const privacy = document.createElement('p');
  privacy.className = 'sync-feed__warning';
  privacy.textContent = t('sync.feedPrivacy');
  box.appendChild(privacy);
}
