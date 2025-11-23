// Module de récupération des cours ESAIP depuis Alcuin directement dans le navigateur
// Aucune dépendance externe n'est nécessaire.

const BASE = 'https://esaip.alcuin.com';
const LOGIN_URL = `${BASE}/OpDotNet/Noyau/Login.aspx?`;
const AGENDA_URL = `${BASE}/Eplug/Agenda/Agenda.asp`;

function parseViewState(doc) {
  const vs = doc.querySelector('input[name="__VIEWSTATE"]')?.value;
  const ev = doc.querySelector('input[name="__EVENTVALIDATION"]')?.value;
  const vg = doc.querySelector('input[name="__VIEWSTATEGENERATOR"]')?.value;
  if (!vs || !ev || !vg) {
    throw new Error('VIEWSTATE manquant sur la page de login');
  }
  return { __VIEWSTATE: vs, __EVENTVALIDATION: ev, __VIEWSTATEGENERATOR: vg };
}

async function fetchHtml(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'include',
    redirect: 'follow',
    ...options
  });
  if (!response.ok) {
    throw new Error(`Requête échouée (${response.status})`);
  }
  return { text: await response.text(), url: response.url };
}

async function postForm(url, payload) {
  return fetchHtml(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(payload).toString()
  });
}

function parseTable(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const rows = Array.from(doc.querySelectorAll('tr[id*="TableDatas"]'));
  const events = [];

  rows.forEach((row) => {
    const cols = row.querySelectorAll('td');
    if (cols.length < 7) return;

    let rawTitle = cols[1].textContent.trim();
    rawTitle = rawTitle.replace(/TA;TA/gi, '').trim();
    rawTitle = rawTitle.replace(/^Cours\s*-\s*/i, '');
    rawTitle = rawTitle.replace(/^Cours\s*Gr\s*1\s*-\s*/i, 'Gr1 - ');
    rawTitle = rawTitle.replace(/^Cours\s*Gr\s*2\s*-\s*/i, 'Gr2 - ');

    let color = '#66B2FF';
    if (/^TA\b/i.test(rawTitle)) {
      color = '#989ea6';
    } else if (/^Soutien\s*-\s*/i.test(rawTitle)) {
      color = '#80ffb0';
    } else if (/^Information\s*-\s*/i.test(rawTitle)) {
      color = '#808fff';
    } else if (/^Oral\s*-\s*/i.test(rawTitle)) {
      color = '#f5bd00';
    }

    const title = rawTitle.trim();
    const dateStr = cols[4].textContent.trim();
    const startStr = cols[5].textContent.trim().replace('h', ':').replace(/\s+/g, '');
    const endStr = cols[6].textContent.trim().replace('h', ':').replace(/\s+/g, '');

    const [dd, mm, yyyy] = dateStr.split('/');
    if (!dd || !mm || !yyyy) return;

    const dateIso = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
    const startIso = `${dateIso}T${startStr.padStart(5, '0')}`;

    const [sh, sm] = startStr.split(':').map(Number);
    const [eh, em] = endStr.split(':').map(Number);
    if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return;

    const duration = eh * 60 + em - (sh * 60 + sm);
    if (duration <= 0) return;

    events.push({
      id: crypto.randomUUID(),
      title,
      start: startIso,
      duration,
      recurrence: 'none',
      typeId: '',
      color
    });
  });

  return events;
}

async function followAspxtoasp(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const form = doc.querySelector('form');
  if (!form) {
    throw new Error('Formulaire aspxtoasp manquant');
  }

  const action = form.getAttribute('action');
  const payload = {};
  form.querySelectorAll('input').forEach((input) => {
    const name = input.getAttribute('name');
    if (!name) return;
    payload[name] = input.getAttribute('value') || '';
  });

  const targetUrl = new URL(action, BASE).toString();
  const { text } = await postForm(targetUrl, payload);
  return text;
}

async function performLogin(loginValue, passwordValue) {
  const { text: loginPage } = await fetchHtml(LOGIN_URL);
  const doc = new DOMParser().parseFromString(loginPage, 'text/html');
  const state = parseViewState(doc);

  const payload = {
    __VIEWSTATE: state.__VIEWSTATE,
    __EVENTVALIDATION: state.__EVENTVALIDATION,
    __VIEWSTATEGENERATOR: state.__VIEWSTATEGENERATOR,
    'UcAuthentification1$UcLogin1$txtLogin': loginValue,
    'UcAuthentification1$UcLogin1$txtPassword': passwordValue,
    'UcAuthentification1$UcLogin1$btnEntrer': 'Connexion'
  };

  const { url } = await postForm(LOGIN_URL, payload);
  if (url.includes('Login')) {
    throw new Error('Connexion Alcuin échouée');
  }
}

async function getAgendaUrl() {
  const aspUrl = `${BASE}/OpDotnet/commun/Login/aspxtoasp.aspx?url=/Eplug/Agenda/Agenda.asp?IdApplication=190&TypeAcces=Utilisateur&IdLien=649`;
  const { url } = await fetchHtml(aspUrl);
  return url;
}

async function loadTableView(dateStr, agendaUrl) {
  const payload = {
    TypVis: 'Vis-Tab.xsl',
    date: dateStr,
    BValider: 'OK'
  };
  const { text } = await postForm(agendaUrl, payload);
  return text;
}

async function loadNextMonth(html, agendaUrl) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const links = Array.from(doc.querySelectorAll('a[onclick*="NavDat("]'));
  if (!links.length) throw new Error('Impossible de trouver un bouton NavDat');

  let nextLink = links.find((a) => a.querySelector('img')?.getAttribute('src')?.includes('FlecheDroite'));
  if (!nextLink) {
    nextLink = links[links.length - 1];
  }

  const onclick = nextLink?.getAttribute('onclick') || '';
  const num = onclick.replace(/\D/g, '');
  if (!num) throw new Error('NumDat introuvable');

  const payload = { NumDat: num, TypVis: 'Vis-Tab.xsl', BValider: 'OK' };
  let { text } = await postForm(agendaUrl, payload);
  if (typeof text === 'string' && text.includes('aspxtoasp.asp')) {
    text = await followAspxtoasp(text);
  }
  return text;
}

async function saveTimetableFile(data, folderHandle) {
  if (!folderHandle) {
    throw new Error('Aucun dossier sélectionné');
  }

  if (typeof window.ensurePermission === 'function') {
    const granted = await window.ensurePermission(folderHandle);
    if (!granted) {
      throw new Error('Permission refusée pour écrire timetable.json');
    }
  }

  const fileHandle = await folderHandle.getFileHandle('timetable.json', { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(JSON.stringify(data, null, 2));
  await writable.close();
}

async function runEsaipScraper({ login: loginValue, password, folderHandle }) {
  if (!loginValue || !password) {
    throw new Error('Identifiants manquants');
  }

  await loginToAlcuin(loginValue, password);
  const agendaUrl = await getAgendaUrl();

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  let html = await loadTableView(dateStr, agendaUrl);
  if (typeof html === 'string' && html.includes('aspxtoasp.asp')) {
    html = await followAspxtoasp(html);
  }

  const dataCurrent = parseTable(html);
  const htmlNext = await loadNextMonth(html, agendaUrl);
  const dataNext = parseTable(htmlNext);
  const events = [...dataCurrent, ...dataNext];

  const finalJson = {
    storagePath: 'MyDeskOnline-main',
    calendar: { events }
  };

  await saveTimetableFile(finalJson, folderHandle);
  return events;
}

async function loginToAlcuin(loginValue, password) {
  await performLogin(loginValue, password);
}

// Expose pour l'UI
window.runEsaipScraper = runEsaipScraper;
