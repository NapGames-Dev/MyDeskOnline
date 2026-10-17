/* ═══════════════════════════════════════════════════════════
   IMPORT ICALENDAR (.ics) DANS L'AGENDA
   - Fuseaux horaires (TZID, UTC) convertis en heure locale
   - Évènements « toute la journée » placés en début de grille
   - Répétitions simples → répétition native de l'agenda
   - Répétitions complexes (BYDAY multiples, COUNT, UNTIL,
     INTERVAL, EXDATE, occurrences modifiées) → dépliées
   - Réimporter le même fichier met à jour au lieu de dupliquer
   ═══════════════════════════════════════════════════════════ */

const ICS_EXPAND_DAYS_AHEAD = 365;
const ICS_EXPAND_DAYS_BEHIND = 730;
const ICS_MAX_OCCURRENCES = 1000;
const ICS_MAX_ALL_DAY_SPAN = 14;
const ICS_TYPE_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#14b8a6', '#ef4444', '#6366f1'];
const ICS_WEEKDAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
const ICS_SIMPLE_FREQ = { DAILY: 'daily', WEEKLY: 'weekly', MONTHLY: 'monthly', YEARLY: 'yearly' };

const ICS_TRANSLATIONS = {
  fr: {
    importButton: 'Importer un .ics',
    success: '{count} évènement(s) importé(s), {updated} mis à jour.',
    empty: 'Aucun évènement trouvé dans ce fichier.',
    invalid: "Ce fichier n'est pas un calendrier iCalendar valide."
  },
  en: {
    importButton: 'Import .ics',
    success: '{count} event(s) imported, {updated} updated.',
    empty: 'No events found in this file.',
    invalid: 'This file is not a valid iCalendar file.'
  },
  vi: {
    importButton: 'Nhập tệp .ics',
    success: 'Đã nhập {count} sự kiện, cập nhật {updated}.',
    empty: 'Không tìm thấy sự kiện nào trong tệp này.',
    invalid: 'Tệp này không phải là lịch iCalendar hợp lệ.'
  }
};

function registerIcsTranslations() {
  Object.keys(ICS_TRANSLATIONS).forEach((language) => {
    if (translations[language] && translations[language].calendar) {
      translations[language].calendar.ics = ICS_TRANSLATIONS[language];
    }
  });
}

/* ── Lecture du fichier ────────────────────────────────────── */

function icsUnfold(text) {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n[ \t]/g, '').split('\n');
}

function icsUnescape(value) {
  return value.replace(/\\([\\;,nN])/g, (match, char) => (char === 'n' || char === 'N' ? '\n' : char));
}

function icsParseLine(line) {
  let inQuotes = false;
  let colon = -1;
  for (let i = 0; i < line.length; i += 1) {
    if (line[i] === '"') inQuotes = !inQuotes;
    if (line[i] === ':' && !inQuotes) {
      colon = i;
      break;
    }
  }
  if (colon === -1) return null;
  const [name, ...rawParams] = line.slice(0, colon).split(';');
  const params = {};
  rawParams.forEach((param) => {
    const eq = param.indexOf('=');
    if (eq > 0) {
      params[param.slice(0, eq).toUpperCase()] = param.slice(eq + 1).replace(/^"|"$/g, '');
    }
  });
  return { name: name.toUpperCase(), params, value: line.slice(colon + 1) };
}

function icsParseCalendar(text) {
  const lines = icsUnfold(text);
  if (!lines.some((line) => line.trim().toUpperCase() === 'BEGIN:VCALENDAR')) {
    throw new Error('invalid');
  }
  const calendar = { name: '', events: [] };
  const stack = [];
  let current = null;
  lines.forEach((raw) => {
    const line = raw.trim();
    if (!line) return;
    const prop = icsParseLine(line);
    if (!prop) return;
    if (prop.name === 'BEGIN') {
      stack.push(prop.value.toUpperCase());
      if (prop.value.toUpperCase() === 'VEVENT') {
        current = { props: {}, exdates: [] };
      }
      return;
    }
    if (prop.name === 'END') {
      const ended = stack.pop();
      if (ended === 'VEVENT' && current) {
        calendar.events.push(current);
        current = null;
      }
      return;
    }
    const inside = stack[stack.length - 1];
    if (inside === 'VCALENDAR' && prop.name === 'X-WR-CALNAME') {
      calendar.name = icsUnescape(prop.value);
    }
    if (inside !== 'VEVENT' || !current) return; // ignore VALARM, VTIMEZONE…
    if (prop.name === 'EXDATE') {
      prop.value.split(',').forEach((value) => current.exdates.push({ ...prop, value }));
    } else if (!current.props[prop.name]) {
      current.props[prop.name] = prop;
    }
  });
  return calendar;
}

/* ── Dates et fuseaux horaires ─────────────────────────────── */

// Renvoie { y, m (0-11), d, h, min, allDay, utc, tzid }
function icsParseDate(prop) {
  if (!prop) return null;
  const match = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/.exec(prop.value.trim());
  if (!match) return null;
  const allDay = !match[4] || (prop.params && prop.params.VALUE === 'DATE');
  return {
    y: Number(match[1]),
    m: Number(match[2]) - 1,
    d: Number(match[3]),
    h: allDay ? 0 : Number(match[4]),
    min: allDay ? 0 : Number(match[5]),
    allDay,
    utc: Boolean(match[7]),
    tzid: prop.params ? prop.params.TZID || '' : ''
  };
}

function icsTimeZoneOffset(timestamp, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).formatToParts(new Date(timestamp));
  const get = (type) => Number(parts.find((part) => part.type === type).value);
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
  return asUtc - timestamp;
}

// Heure « murale » d'un fuseau → Date locale de l'appareil.
function icsToLocalDate(wall, tzid, utc) {
  const guess = Date.UTC(wall.y, wall.m, wall.d, wall.h, wall.min);
  if (utc) return new Date(guess);
  if (tzid) {
    try {
      const first = guess - icsTimeZoneOffset(guess, tzid);
      return new Date(guess - icsTimeZoneOffset(first, tzid));
    } catch (error) {
      // Fuseau inconnu (ex. noms Windows d'Outlook) : on garde l'heure telle quelle.
    }
  }
  return new Date(wall.y, wall.m, wall.d, wall.h, wall.min);
}

function icsToLocalInput(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function icsParseDuration(value) {
  const match = /^([+-])?P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec((value || '').trim());
  if (!match) return null;
  const minutes =
    Number(match[2] || 0) * 7 * 1440 +
    Number(match[3] || 0) * 1440 +
    Number(match[4] || 0) * 60 +
    Number(match[5] || 0) +
    Math.round(Number(match[6] || 0) / 60);
  return match[1] === '-' ? -minutes : minutes;
}

function icsWallKey(wall) {
  return `${wall.y}-${wall.m}-${wall.d}-${wall.h}-${wall.min}`;
}

function icsAddDays(wall, days) {
  const date = new Date(Date.UTC(wall.y, wall.m, wall.d + days));
  return { ...wall, y: date.getUTCFullYear(), m: date.getUTCMonth(), d: date.getUTCDate() };
}

function icsWeekday(wall) {
  return new Date(Date.UTC(wall.y, wall.m, wall.d)).getUTCDay();
}

function icsDaysInMonth(y, m) {
  return new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
}

/* ── Répétitions ───────────────────────────────────────────── */

function icsParseRule(value) {
  const rule = {};
  value.split(';').forEach((part) => {
    const [key, val] = part.split('=');
    if (key && val !== undefined) rule[key.toUpperCase()] = val.toUpperCase();
  });
  return rule;
}

function icsRuleIsSimple(rule, start, hasExceptions) {
  if (!ICS_SIMPLE_FREQ[rule.FREQ]) return false;
  if (hasExceptions || rule.COUNT || rule.UNTIL || rule.BYSETPOS || rule.BYMONTH || rule.BYYEARDAY || rule.BYWEEKNO) {
    return false;
  }
  if (rule.INTERVAL && rule.INTERVAL !== '1') return false;
  if (rule.BYMONTHDAY && Number(rule.BYMONTHDAY) !== start.d) return false;
  if (rule.BYDAY) {
    return rule.FREQ === 'WEEKLY' && rule.BYDAY === ICS_WEEKDAYS[icsWeekday(start)];
  }
  return true;
}

// Candidats d'une période (jour / semaine / mois / an) pour la règle.
function icsPeriodCandidates(rule, start, periodIndex, interval) {
  const byDay = rule.BYDAY ? rule.BYDAY.split(',') : null;
  const withTime = (y, m, d) => ({ ...start, y, m, d });

  if (rule.FREQ === 'DAILY') {
    const day = icsAddDays(start, periodIndex * interval);
    if (byDay && !byDay.some((token) => token.slice(-2) === ICS_WEEKDAYS[icsWeekday(day)])) return [];
    return [day];
  }

  if (rule.FREQ === 'WEEKLY') {
    const weekStartOffset = (icsWeekday(start) + 6) % 7; // semaine commençant lundi
    const monday = icsAddDays(start, periodIndex * interval * 7 - weekStartOffset);
    const days = byDay ? byDay.map((token) => token.slice(-2)) : [ICS_WEEKDAYS[icsWeekday(start)]];
    return days
      .map((code) => icsAddDays(monday, (ICS_WEEKDAYS.indexOf(code) + 6) % 7))
      .sort((a, b) => Date.UTC(a.y, a.m, a.d) - Date.UTC(b.y, b.m, b.d));
  }

  if (rule.FREQ === 'MONTHLY' || rule.FREQ === 'YEARLY') {
    const months = [];
    if (rule.FREQ === 'MONTHLY') {
      const total = start.m + periodIndex * interval;
      months.push({ y: start.y + Math.floor(total / 12), m: ((total % 12) + 12) % 12 });
    } else {
      const year = start.y + periodIndex * interval;
      const byMonth = rule.BYMONTH ? rule.BYMONTH.split(',').map((m) => Number(m) - 1) : [start.m];
      byMonth.forEach((m) => months.push({ y: year, m }));
    }
    const result = [];
    months.forEach(({ y, m }) => {
      const dim = icsDaysInMonth(y, m);
      if (byDay) {
        byDay.forEach((token) => {
          const code = token.slice(-2);
          const ordinal = token.length > 2 ? Number(token.slice(0, -2)) : 0;
          const matches = [];
          for (let d = 1; d <= dim; d += 1) {
            if (ICS_WEEKDAYS[icsWeekday({ y, m, d })] === code) matches.push(d);
          }
          const picked = ordinal > 0 ? [matches[ordinal - 1]] : ordinal < 0 ? [matches[matches.length + ordinal]] : matches;
          picked.filter(Boolean).forEach((d) => result.push(withTime(y, m, d)));
        });
      } else {
        const monthDays = rule.BYMONTHDAY ? rule.BYMONTHDAY.split(',').map(Number) : [start.d];
        monthDays.forEach((day) => {
          const d = day < 0 ? dim + day + 1 : day;
          if (d >= 1 && d <= dim) result.push(withTime(y, m, d));
        });
      }
    });
    let sorted = result.sort((a, b) => Date.UTC(a.y, a.m, a.d) - Date.UTC(b.y, b.m, b.d));
    if (rule.BYSETPOS) {
      const positions = rule.BYSETPOS.split(',').map(Number);
      sorted = positions.map((pos) => (pos > 0 ? sorted[pos - 1] : sorted[sorted.length + pos])).filter(Boolean);
    }
    return sorted;
  }
  return [];
}

function icsExpand(rule, start, excluded) {
  const interval = Math.max(1, Number(rule.INTERVAL) || 1);
  const count = rule.COUNT ? Number(rule.COUNT) : Infinity;
  const until = rule.UNTIL ? icsParseDate({ value: rule.UNTIL, params: {} }) : null;
  const untilTime = until ? Date.UTC(until.y, until.m, until.d, until.allDay ? 23 : until.h, until.allDay ? 59 : until.min) : Infinity;
  const horizon = Date.now() + ICS_EXPAND_DAYS_AHEAD * 86400000;
  const oldest = Date.now() - ICS_EXPAND_DAYS_BEHIND * 86400000;
  const startTime = Date.UTC(start.y, start.m, start.d, start.h, start.min);
  const occurrences = [];
  let produced = 0;

  for (let period = 0; period < 50000 && occurrences.length < ICS_MAX_OCCURRENCES; period += 1) {
    const candidates = icsPeriodCandidates(rule, start, period, interval);
    let stop = false;
    for (const wall of candidates) {
      const time = Date.UTC(wall.y, wall.m, wall.d, wall.h, wall.min);
      if (time < startTime) continue;
      // UNTIL en UTC comparé grossièrement à l'heure murale : suffisant à la journée près.
      if (time > untilTime || produced >= count || time > horizon) {
        stop = true;
        break;
      }
      produced += 1;
      // Les occurrences trop anciennes comptent pour COUNT mais ne sont pas importées.
      if (time >= oldest && !excluded.has(icsWallKey(wall))) occurrences.push(wall);
    }
    if (stop) break;
  }
  return occurrences;
}

/* ── Conversion en évènements de l'agenda ──────────────────── */

function icsEventDuration(props, start) {
  const end = icsParseDate(props.DTEND);
  if (end) {
    const startTime = Date.UTC(start.y, start.m, start.d, start.h, start.min);
    const endTime = Date.UTC(end.y, end.m, end.d, end.h, end.min);
    if (!end.utc && !start.utc && end.tzid === start.tzid) {
      return Math.round((endTime - startTime) / 60000);
    }
    const s = icsToLocalDate(start, start.tzid, start.utc);
    const e = icsToLocalDate(end, end.tzid, end.utc);
    return Math.round((e - s) / 60000);
  }
  const duration = icsParseDuration(props.DURATION && props.DURATION.value);
  if (duration !== null) return duration;
  return start.allDay ? 1440 : 60;
}

function icsBuildEvents(parsed) {
  const masters = new Map();
  const overrides = new Map();
  parsed.events.forEach((event) => {
    const status = event.props.STATUS ? event.props.STATUS.value.toUpperCase() : '';
    const eventUid = event.props.UID ? event.props.UID.value : uid();
    if (event.props['RECURRENCE-ID']) {
      if (!overrides.has(eventUid)) overrides.set(eventUid, []);
      overrides.get(eventUid).push(event);
      event.cancelled = status === 'CANCELLED';
    } else if (status !== 'CANCELLED') {
      masters.set(eventUid, event);
    }
  });

  const results = [];
  const pushEvent = (key, props, wallStart, durationMinutes) => {
    const title = props.SUMMARY ? icsUnescape(props.SUMMARY.value).trim() : '';
    const location = props.LOCATION ? icsUnescape(props.LOCATION.value).trim() : '';
    if (wallStart.allDay) {
      // Évènement sur la journée : un bloc par jour, en haut de la grille.
      const days = Math.min(ICS_MAX_ALL_DAY_SPAN, Math.max(1, Math.round(durationMinutes / 1440)));
      for (let i = 0; i < days; i += 1) {
        const day = icsAddDays(wallStart, i);
        results.push({
          icsKey: days > 1 ? `${key}~${i}` : key,
          title,
          location,
          start: icsToLocalInput(new Date(day.y, day.m, day.d, CALENDAR_START_HOUR, 0)),
          duration: 60,
          recurrence: 'none'
        });
      }
      return;
    }
    const start = icsToLocalDate(wallStart, wallStart.tzid, wallStart.utc);
    const duration = Math.max(MIN_EVENT_DURATION, Math.round(durationMinutes / EVENT_DURATION_STEP) * EVENT_DURATION_STEP);
    results.push({ icsKey: key, title, location, start: icsToLocalInput(start), duration, recurrence: 'none' });
  };

  masters.forEach((event, eventUid) => {
    const { props } = event;
    const start = icsParseDate(props.DTSTART);
    if (!start) return;
    const duration = icsEventDuration(props, start);
    const eventOverrides = overrides.get(eventUid) || [];
    const rule = props.RRULE ? icsParseRule(props.RRULE.value) : null;

    if (!rule) {
      pushEvent(eventUid, props, start, duration);
      return;
    }

    if (icsRuleIsSimple(rule, start, event.exdates.length > 0 || eventOverrides.length > 0) && !start.allDay) {
      pushEvent(eventUid, props, start, duration);
      results[results.length - 1].recurrence = ICS_SIMPLE_FREQ[rule.FREQ];
      return;
    }

    const excluded = new Set(event.exdates.map((prop) => icsParseDate(prop)).filter(Boolean).map(icsWallKey));
    eventOverrides.forEach((override) => {
      const recurrenceId = icsParseDate(override.props['RECURRENCE-ID']);
      if (recurrenceId) excluded.add(icsWallKey(recurrenceId));
    });
    icsExpand(rule, start, excluded).forEach((wall) => {
      pushEvent(`${eventUid}#${icsWallKey(wall)}`, props, wall, duration);
    });
  });

  // Occurrences modifiées individuellement.
  overrides.forEach((list, eventUid) => {
    list.forEach((override) => {
      if (override.cancelled) return;
      const start = icsParseDate(override.props.DTSTART);
      const recurrenceId = icsParseDate(override.props['RECURRENCE-ID']);
      if (!start || !recurrenceId) return;
      pushEvent(`${eventUid}#${icsWallKey(recurrenceId)}`, override.props, start, icsEventDuration(override.props, start));
    });
  });

  return results;
}

function icsFindOrCreateType(name) {
  const trimmed = (name || '').trim();
  if (!trimmed) return null;
  const existing = appData.calendar.types.find((type) => type.name === trimmed);
  if (existing) return existing;
  const type = {
    id: uid(),
    name: trimmed,
    color: ICS_TYPE_COLORS[appData.calendar.types.length % ICS_TYPE_COLORS.length]
  };
  appData.calendar.types.push(type);
  return type;
}

function importIcsText(text, fileName) {
  const parsed = icsParseCalendar(text);
  const built = icsBuildEvents(parsed);
  if (built.length === 0) return { count: 0, updated: 0 };

  const type = icsFindOrCreateType(parsed.name || (fileName || '').replace(/\.ics$/i, ''));
  const existingByKey = new Map(
    appData.calendar.events.filter((event) => event.icsKey).map((event) => [event.icsKey, event])
  );
  let count = 0;
  let updated = 0;
  built.forEach((item) => {
    const fields = {
      title: item.title || t('calendar.eventDefaultTitle'),
      location: item.location || '',
      start: item.start,
      duration: item.duration,
      recurrence: item.recurrence
    };
    const existing = existingByKey.get(item.icsKey);
    if (existing) {
      Object.assign(existing, fields);
      updated += 1;
      return;
    }
    appData.calendar.events.push({
      id: uid(),
      icsKey: item.icsKey,
      ...fields,
      typeId: type ? type.id : '',
      color: type ? type.color : DEFAULT_EVENT_COLOR
    });
    count += 1;
  });
  return { count, updated };
}

/* ── Interface ─────────────────────────────────────────────── */

function showIcsStatus(messageKey, type, variables = {}) {
  const status = document.getElementById('ics-status');
  if (!status) return;
  status.textContent = t(messageKey, variables);
  status.className = `ics-status ${type}`;
  clearTimeout(showIcsStatus.timer);
  showIcsStatus.timer = setTimeout(() => {
    status.textContent = '';
  }, 8000);
}

function initIcsImport() {
  const button = document.getElementById('ics-import');
  const input = document.getElementById('ics-input');
  if (!button || !input) return;

  button.addEventListener('click', () => input.click());
  input.addEventListener('change', async () => {
    const files = Array.from(input.files || []);
    input.value = '';
    if (files.length === 0) return;
    let total = { count: 0, updated: 0 };
    try {
      for (const file of files) {
        const result = importIcsText(await file.text(), file.name);
        total = { count: total.count + result.count, updated: total.updated + result.updated };
      }
    } catch (error) {
      console.error('Import iCalendar impossible', error);
      showIcsStatus('calendar.ics.invalid', 'error');
      return;
    }
    if (total.count + total.updated === 0) {
      showIcsStatus('calendar.ics.empty', 'info');
      return;
    }
    migrateData();
    saveData();
    renderEventTypes();
    renderCalendar();
    showIcsStatus('calendar.ics.success', 'success', total);
  });
}
