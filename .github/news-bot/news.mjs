/* ═══════════════════════════════════════════════════════════
   ROBOT « ACTUALITÉ »
   Lancé toutes les heures par .github/workflows/news.yml :
   1. lit les flux RSS de sources.mjs ;
   2. range les articles par jour (heure de Paris), garde 14 jours ;
   3. deux fois par jour (matin, soir), rédige un briefing par thème
      avec Gemini (clé GEMINI_API_KEY dans les secrets du dépôt) : choix
      des sujets sur les titres et chapôs, puis réécriture à partir du
      texte complet des articles cités (lu, jamais enregistré). Sans clé
      ou si Gemini ne répond pas : sujets les plus repris.
   Sortie (branche « news », lue par l'onglet Actualité) :
     index.json             { updatedAt, days: ['2026-10-04', …], weeks: […], themes }
     days/AAAA-MM-JJ.json   { date, items: […], briefings: […] }
     weeks/AAAA-MM-JJ.json  résumé de la semaine (date du lundi), refait chaque soir
     state.json             état interne du robot
   Usage : node news.mjs <dossier-de-sortie>
   ═══════════════════════════════════════════════════════════ */

import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { SOURCES, THEMES } from './sources.mjs';

const OUT_DIR = process.argv[2] || 'news-data';
const DAYS_DIR = path.join(OUT_DIR, 'days');
const WEEKS_DIR = path.join(OUT_DIR, 'weeks');
const KEEP_WEEKS = 8;
const KEEP_DAYS = 14;
const TIME_ZONE = 'Europe/Paris';
const SUMMARY_MAX = 400;
const FETCH_TIMEOUT_MS = 20000;
const USER_AGENT = 'MyDeskOnline-news-bot/1.0 (+https://github.com/Radvak/MyDeskOnline)';

// Créneaux du briefing (heure de Paris). Le robot rattrape un créneau
// manqué au passage suivant (les tâches planifiées GitHub ont du retard).
const BRIEFING_SLOTS = [
  { id: 'matin', hour: 6 },
  { id: 'soir', hour: 18 }
];
const BRIEFING_MAX_WINDOW_H = 24;
const BRIEFING_MIN_WINDOW_H = 8;
const BRIEFING_MAX_ITEMS = 90;
const BRIEFING_MAX_PROMPT_CHARS = 40000;
const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta';
// Repli si la liste des modèles est illisible. Sinon on prend les modèles
// « flash » proposés par Google, du plus récent au plus ancien.
const GEMINI_MODELS = ['gemini-flash-latest', 'gemini-flash-lite-latest'];
const GEMINI_MAX_MODELS = 5;
const GEMINI_BUSY_WAITS_MS = [8000, 20000]; // modèle saturé (503) : on réessaie après ces pauses

/* ── Dates ─────────────────────────────────────────────────── */

const parisParts = (date) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type).value;
  return { day: `${get('year')}-${get('month')}-${get('day')}`, hour: Number(get('hour')) };
};

// Instant correspondant à « jour à telle heure » à Paris (heure d'été comprise).
const parisDate = (day, hour) => {
  const [y, m, d] = day.split('-').map(Number);
  const wanted = Date.UTC(y, m - 1, d, hour);
  let guess = wanted;
  for (let i = 0; i < 2; i++) {
    const shown = parisParts(new Date(guess));
    const [sy, sm, sd] = shown.day.split('-').map(Number);
    guess += wanted - Date.UTC(sy, sm - 1, sd, shown.hour);
  }
  return new Date(guess);
};

const parisTime = (date) =>
  new Intl.DateTimeFormat('fr-FR', {
    timeZone: TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);

/* ── Lecture des flux ──────────────────────────────────────── */

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', laquo: '«', raquo: '»', hellip: '…', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', ndash: '–', mdash: '—', eacute: 'é', egrave: 'è', agrave: 'à', ccedil: 'ç', ecirc: 'ê', ocirc: 'ô', icirc: 'î', ucirc: 'û' };

const decodeEntities = (text) =>
  text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code) => {
    if (code[0] === '#') {
      const value = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(value) ? String.fromCodePoint(value) : match;
    }
    return ENTITIES[code.toLowerCase()] ?? match;
  });

// Texte brut d'un champ : enlève CDATA, balises et entités (les entités
// peuvent être doublées, ex. « &amp;eacute; »).
const cleanText = (raw) => {
  if (!raw) return '';
  let text = raw.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
  text = decodeEntities(text);
  text = text.replace(/<[^>]*>/g, ' ');
  text = decodeEntities(text);
  return text.replace(/\s+/g, ' ').trim();
};

const shorten = (text, max) => {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > max * 0.6 ? lastSpace : max).trim()}…`;
};

const tagContent = (block, names) => {
  for (const name of names) {
    const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'));
    if (match && cleanText(match[1])) return match[1];
  }
  return '';
};

const entryLink = (block) => {
  const text = cleanText(tagContent(block, ['link']));
  if (/^https?:\/\//.test(text)) return text;
  const atom = block.match(/<link\b[^>]*href="([^"]+)"[^>]*>/i);
  if (atom) return decodeEntities(atom[1]);
  const guid = cleanText(tagContent(block, ['guid', 'id']));
  return /^https?:\/\//.test(guid) ? guid : '';
};

const parseFeed = (xml) => {
  const blocks = xml.match(/<item\b[\s\S]*?<\/item>|<entry\b[\s\S]*?<\/entry>/gi) || [];
  return blocks
    .map((block) => {
      const title = cleanText(tagContent(block, ['title']));
      const link = entryLink(block);
      const summary = cleanText(tagContent(block, ['description', 'summary', 'content:encoded', 'content']));
      const rawDate = cleanText(tagContent(block, ['pubDate', 'dc:date', 'published', 'updated']));
      const time = rawDate ? Date.parse(rawDate) : NaN;
      return { title, link, summary, time: Number.isFinite(time) ? time : null };
    })
    .filter((entry) => entry.title && entry.link);
};

const fetchFeed = async (source) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(source.url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/rss+xml, application/xml, text/xml, */*' },
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return parseFeed(await response.text());
  } finally {
    clearTimeout(timer);
  }
};

// Enlève les marqueurs de suivi (#xtor=…, ?utm_…) pour reconnaître un même article.
const cleanLink = (link) => link.replace(/#xtor=.*$/, '').replace(/[?&]utm_[^#]*$/, '');

const itemId = (link) => createHash('sha1').update(link).digest('hex').slice(0, 12);

/* ── Stockage ──────────────────────────────────────────────── */

const readJson = async (file, fallback) => {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
};

const loadDays = async () => {
  const days = new Map();
  let files = [];
  try {
    files = await readdir(DAYS_DIR);
  } catch {
    files = [];
  }
  for (const file of files) {
    if (!/^\d{4}-\d{2}-\d{2}\.json$/.test(file)) continue;
    const data = await readJson(path.join(DAYS_DIR, file), null);
    if (data && Array.isArray(data.items)) {
      days.set(data.date, { date: data.date, items: data.items, briefings: data.briefings || [] });
    }
  }
  return days;
};

const ensureDay = (days, date) => {
  if (!days.has(date)) days.set(date, { date, items: [], briefings: [] });
  return days.get(date);
};

/* ── Briefing (Gemini) ─────────────────────────────────────── */

const SYSTEM_PROMPT = `Tu rédiges une revue de presse pour un étudiant en droit qui veut entretenir sa culture générale sur l'actualité.
On te donne des dépêches numérotées (titre et chapô) publiées par des médias et institutions français.

Consignes :
- Retiens les 4 à 7 sujets les plus importants pour la culture générale : géopolitique, institutions, vie politique, économie, grandes décisions de justice et réformes. Écarte les faits divers sans portée nationale, le sport, les people, les annonces d'émissions, de colloques ou d'événements.
- Regroupe les dépêches qui parlent du même sujet.
- Pour chaque sujet :
  • "titre" : court et factuel, 12 mots maximum ;
  • "resume" : 2 ou 3 phrases simples (qui, quoi, où, quand, chiffres clés) ;
  • "contexte" : une phrase qui explique pourquoi c'est important ou définit la notion à connaître (institution, procédure, enjeu) ;
  • "sources" : les numéros des dépêches utilisées.
- N'utilise que les informations des dépêches. N'invente aucun fait, chiffre ou nom ; tu peux seulement ajouter une définition générale dans "contexte". Si une information est présentée comme incertaine, garde cette prudence.
- Ton neutre, sans opinion. Écris en français.
- Classe les sujets du plus important au moins important.
- S'il n'y a rien d'important, renvoie une liste vide.

Réponds uniquement avec un objet JSON : {"points":[{"titre":"…","resume":"…","contexte":"…","sources":[1,2]}]}`;

const THEME_HINTS = {
  monde: 'Thème : actualité internationale et géopolitique.',
  france: 'Thème : France, vie politique et économie.',
  juridique:
    "Thème : justice et droit. Précise la juridiction, le type de décision (QPC, arrêt, avis, ordonnance…) et sa portée. Une affaire étrangère n'est retenue que si elle est majeure. Un procès n'est retenu que s'il a une portée nationale ou juridique."
};

const buildPrompt = (theme, items, from, to) => {
  const header = `${THEME_HINTS[theme]}\nPériode : du ${parisTime(from)} au ${parisTime(to)} (heure de Paris).\n\nDépêches :\n`;
  const lines = [];
  let length = header.length;
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const summary = shorten(item.summary || '', 240);
    const line = `[${index + 1}] (${item.source}, ${parisTime(new Date(item.date))}) ${item.title}${summary ? ` — ${summary}` : ''}`;
    if (length + line.length + 1 > BRIEFING_MAX_PROMPT_CHARS) break;
    lines.push(line);
    length += line.length + 1;
  }
  return { prompt: header + lines.join('\n'), used: lines.length };
};

const extractJson = (text) => {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('réponse sans JSON');
  return JSON.parse(text.slice(start, end + 1));
};

// Erreurs gardées dans state.json (public) et affichées sur la page du
// passage dans Actions, pour comprendre un échec sans lire tout le journal.
const briefingErrors = [];
const reportError = (message) => {
  briefingErrors.push(message.slice(0, 400));
  console.log(`::warning title=Briefing::${message.replace(/\s+/g, ' ').slice(0, 400)}`);
};

const geminiFetch = (url, key, options = {}) =>
  fetch(url, { ...options, headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key } });

// Modèles disponibles : on lit la liste (les noms changent) et on garde
// ceux de la liste de préférence, sinon un modèle « flash » proposé.
let modelList = null;
const deadModels = new Set(); // modèles retirés (404) : plus essayés pendant ce passage

const modelVersion = (id) => {
  const match = id.match(/^gemini-(\d+(?:\.\d+)?)-flash/);
  return match ? Number(match[1]) : 0;
};

// Ordre : flash numérotés du plus récent, alias « latest », puis versions « lite ».
const rankModels = (ids) => {
  const flash = ids.filter((id) => /^gemini-[\d.]+-flash$/.test(id)).sort((a, b) => modelVersion(b) - modelVersion(a));
  const lite = ids.filter((id) => /^gemini-[\d.]+-flash-lite$/.test(id)).sort((a, b) => modelVersion(b) - modelVersion(a));
  const aliases = GEMINI_MODELS.filter((id) => ids.includes(id));
  const ordered = [...flash.slice(0, 2), aliases[0], ...lite.slice(0, 1), ...aliases.slice(1), ...flash.slice(2)];
  return ordered.filter((id, index) => id && ordered.indexOf(id) === index);
};

const availableModels = async (key) => {
  if (modelList) return modelList;
  try {
    const response = await geminiFetch(`${GEMINI_API}/models?pageSize=200`, key);
    const body = await response.text();
    if (!response.ok) throw new Error(`HTTP ${response.status} ${body.slice(0, 200)}`);
    const models = (JSON.parse(body).models || []).filter((model) =>
      (model.supportedGenerationMethods || []).includes('generateContent')
    );
    modelList = rankModels(models.map((model) => String(model.name).replace(/^models\//, '')));
    console.log(`Modèles retenus : ${modelList.join(', ')}`);
  } catch (error) {
    reportError(`Liste des modèles illisible (${error.message}), liste par défaut.`);
    modelList = [];
  }
  if (!modelList.length) modelList = GEMINI_MODELS.slice();
  return modelList;
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const requestModel = async (key, model, prompt, systemPrompt) => {
  const response = await geminiFetch(`${GEMINI_API}/models/${model}:generateContent`, key, {
    method: 'POST',
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, responseMimeType: 'application/json' }
    })
  });
  const text = await response.text();
  if (!response.ok) {
    const error = new Error(`${model} : HTTP ${response.status} ${text.slice(0, 300)}`);
    error.status = response.status;
    // Google indique parfois le modèle qui remplace celui-ci.
    const suggested = text.match(/use models\/(gemini-[\w.-]+)/);
    if (suggested) error.suggested = suggested[1];
    throw error;
  }
  const candidate = (JSON.parse(text).candidates || [])[0];
  const content =
    candidate && candidate.content && Array.isArray(candidate.content.parts)
      ? candidate.content.parts.map((part) => part.text || '').join('')
      : '';
  if (!content) throw new Error(`${model} : réponse vide (${candidate ? candidate.finishReason : 'aucun candidat'})`);
  return extractJson(content);
};

const callModel = async (prompt, systemPrompt = SYSTEM_PROMPT) => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('clé GEMINI_API_KEY absente des secrets du dépôt');
  const queue = (await availableModels(key)).filter((model) => !deadModels.has(model));
  let lastError = null;
  let tried = 0;
  while (queue.length && tried < GEMINI_MAX_MODELS) {
    const model = queue.shift();
    tried += 1;
    for (let attempt = 0; attempt <= GEMINI_BUSY_WAITS_MS.length; attempt += 1) {
      try {
        return { model, data: await requestModel(key, model, prompt, systemPrompt) };
      } catch (error) {
        lastError = error;
        reportError(error.message);
        // Saturé : on patiente puis on réessaie le même modèle.
        if ((error.status === 503 || error.status === 500) && attempt < GEMINI_BUSY_WAITS_MS.length) {
          await wait(GEMINI_BUSY_WAITS_MS[attempt]);
          continue;
        }
        if (error.status === 404) {
          deadModels.add(model);
          if (error.suggested && !deadModels.has(error.suggested) && !queue.includes(error.suggested)) {
            queue.unshift(error.suggested);
          }
        }
        break;
      }
    }
    // Clé refusée : inutile d'essayer d'autres modèles.
    if (lastError && (lastError.status === 401 || lastError.status === 403)) break;
    if (lastError && lastError.status === 400 && /API_KEY|api key/i.test(lastError.message)) break;
  }
  throw lastError || new Error('aucun modèle');
};

/* ── Texte complet des articles retenus ────────────────────── */
// Deuxième temps du briefing : pour les sujets choisis à partir des titres
// et chapôs, on lit le texte des articles cités (ceux que les sites laissent
// lire : robots.txt respecté, paywall = début seulement) et l'IA réécrit
// résumé et « Pour comprendre ». Le texte lu n'est jamais enregistré (la
// branche « news » est publique) : seul le résumé est gardé.

const ARTICLE_TIMEOUT_MS = 15000;
const ARTICLE_MAX_CHARS = 6000;
const ARTICLE_MIN_CHARS = 400;
const ARTICLES_PER_POINT = 2;
const ARTICLE_CONCURRENCY = 4;
const DEEPEN_MAX_PROMPT_CHARS = 70000;

const DEEPEN_PROMPT = `Tu complètes une revue de presse pour un étudiant en droit qui veut entretenir sa culture générale.
On te donne des sujets déjà retenus, numérotés, chacun avec le texte des articles sources (ou, à défaut, leur titre et chapô).

Pour chaque sujet, réécris à partir de ces textes :
  • "titre" : court et factuel, 12 mots maximum (garde celui fourni s'il convient) ;
  • "resume" : 2 à 4 phrases simples : les faits (qui, quoi, où, quand, chiffres clés) et ce qui est nouveau ;
  • "contexte" : 1 ou 2 phrases qui donnent les clés pour comprendre : origine de l'affaire, enjeu, notion juridique ou institution en jeu, prochaine étape.

Règles :
- N'utilise que les informations des textes fournis ; dans "contexte", tu peux ajouter une définition générale. N'invente aucun fait, chiffre ou nom.
- Si les sources divergent ou si une information est incertaine, dis-le.
- Ignore ce qui n'est pas l'article (publicités, liens « à lire aussi », mentions d'abonnement).
- Ton neutre, sans opinion. Écris en français.

Réponds uniquement avec un objet JSON : {"points":[{"n":1,"titre":"…","resume":"…","contexte":"…"}]}`;

const fetchText = async (url, timeoutMs, accept) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: accept }, signal: controller.signal, redirect: 'follow' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return { text: await response.text(), type: response.headers.get('content-type') || '' };
  } finally {
    clearTimeout(timer);
  }
};

// robots.txt : règles du groupe qui nomme ce robot, sinon du groupe « * ».
const robotsCache = new Map();

const loadRobots = async (origin) => {
  try {
    const { text } = await fetchText(`${origin}/robots.txt`, 10000, 'text/plain, */*');
    const groups = [];
    let current = null;
    let readingAgents = false;
    text.split(/\r?\n/).forEach((raw) => {
      const match = raw.replace(/#.*/, '').trim().match(/^([a-z-]+)\s*:\s*(.*)$/i);
      if (!match) return;
      const field = match[1].toLowerCase();
      const value = match[2].trim();
      if (field === 'user-agent') {
        if (!current || !readingAgents) {
          current = { agents: [], rules: [] };
          groups.push(current);
        }
        current.agents.push(value.toLowerCase());
        readingAgents = true;
        return;
      }
      readingAgents = false;
      if (current && (field === 'allow' || field === 'disallow') && value) {
        current.rules.push({ allow: field === 'allow', path: value });
      }
    });
    const name = 'mydeskonline-news-bot';
    const mine = groups.filter((group) => group.agents.some((agent) => agent !== '*' && name.includes(agent)));
    return (mine.length ? mine : groups.filter((group) => group.agents.includes('*'))).flatMap((group) => group.rules);
  } catch {
    return []; // pas de robots.txt lisible : rien d'interdit
  }
};

const robotsPattern = (rulePath) =>
  new RegExp(
    `^${rulePath
      .replace(/[.+?^{}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/\\\$$|\$$/, '$')}`
  );

const robotsAllows = async (url) => {
  const { origin, pathname, search } = new URL(url);
  if (!robotsCache.has(origin)) robotsCache.set(origin, loadRobots(origin));
  const rules = await robotsCache.get(origin);
  const target = pathname + search;
  let verdict = { allow: true, length: -1 };
  rules.forEach((rule) => {
    if (rule.path.length > verdict.length && robotsPattern(rule.path).test(target)) {
      verdict = { allow: rule.allow, length: rule.path.length };
    }
  });
  return verdict.allow;
};

// Phrases courtes de service (cookies, compte, abonnement) à écarter.
const BOILERPLATE = /cookie|connectez-vous|créez un compte|abonnez-vous|déjà abonné|newsletter|pour afficher ce contenu|javascript/i;

const collectArticleBodies = (node, out) => {
  if (Array.isArray(node)) node.forEach((child) => collectArticleBodies(child, out));
  else if (node && typeof node === 'object') {
    if (typeof node.articleBody === 'string') out.push(node.articleBody);
    Object.values(node).forEach((child) => {
      if (child && typeof child === 'object') collectArticleBodies(child, out);
    });
  }
};

// Texte d'un article : articleBody (données structurées) ou paragraphes
// de la page, le plus long des deux. '' si trop court (page bloquée…).
const extractArticle = (html) => {
  const bodies = [];
  for (const match of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      collectArticleBodies(JSON.parse(match[1].trim()), bodies);
    } catch {
      // bloc illisible : ignoré
    }
  }
  const structured = bodies.map((body) => cleanText(body)).sort((a, b) => b.length - a.length)[0] || '';
  let zone = html.replace(/<(script|style|noscript|svg|nav|header|footer|aside|form|figure|button)\b[\s\S]*?<\/\1>/gi, ' ');
  const article = zone.match(/<article\b[\s\S]*<\/article>/i);
  if (article) zone = article[0];
  const paragraphs = [...zone.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => cleanText(match[1]))
    .filter((text, index, all) => text.length >= 60 && all.indexOf(text) === index)
    .filter((text) => text.length > 220 || !BOILERPLATE.test(text));
  const fromPage = paragraphs.join('\n');
  const best = structured.length >= fromPage.length ? structured : fromPage;
  return best.length >= ARTICLE_MIN_CHARS ? shorten(best, ARTICLE_MAX_CHARS) : '';
};

const fetchArticleText = async (link) => {
  try {
    if (!/^https?:\/\//.test(link) || !(await robotsAllows(link))) return '';
    const { text, type } = await fetchText(link, ARTICLE_TIMEOUT_MS, 'text/html, application/xhtml+xml');
    return /html/i.test(type) ? extractArticle(text) : '';
  } catch {
    return '';
  }
};

const mapLimit = async (list, limit, worker) => {
  const results = new Array(list.length);
  let next = 0;
  const run = async () => {
    while (next < list.length) {
      const index = next;
      next += 1;
      results[index] = await worker(list[index], index);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, list.length) }, run));
  return results;
};

const deepenPoints = async (theme, points, items, from, to) => {
  const byLink = new Map(items.map((item) => [item.link, item]));
  const wanted = [];
  points.forEach((point, index) => {
    point.sources.slice(0, ARTICLES_PER_POINT).forEach((source) => wanted.push({ index, source }));
  });
  const texts = await mapLimit(wanted, ARTICLE_CONCURRENCY, ({ source }) => fetchArticleText(source.link));
  const read = texts.filter(Boolean).length;
  if (!read) return { points, read };

  const perArticle = Math.min(ARTICLE_MAX_CHARS, Math.floor((DEEPEN_MAX_PROMPT_CHARS - 3000) / Math.max(1, wanted.length)));
  let prompt = `${THEME_HINTS[theme]}\nPériode : du ${parisTime(from)} au ${parisTime(to)} (heure de Paris).\n\n`;
  points.forEach((point, index) => {
    prompt += `## Sujet ${index + 1} : ${point.title}\nRésumé provisoire : ${point.summary}\n`;
    wanted.forEach((entry, k) => {
      if (entry.index !== index) return;
      const item = byLink.get(entry.source.link);
      const body = texts[k]
        ? shorten(texts[k], perArticle)
        : `(texte complet indisponible) ${item && item.summary ? item.summary : ''}`;
      prompt += `### ${entry.source.source} — ${entry.source.title}\n${body}\n`;
    });
    prompt += '\n';
  });
  const { data } = await callModel(prompt, DEEPEN_PROMPT);
  const rewritten = Array.isArray(data && data.points) ? data.points : [];
  return {
    read,
    points: points.map((point, index) => {
      const update = rewritten.find((candidate) => Number(candidate.n) === index + 1);
      if (!update) return point;
      return {
        ...point,
        title: String(update.titre || '').trim() || point.title,
        summary: String(update.resume || '').trim() || point.summary,
        context: String(update.contexte || '').trim() || point.context
      };
    })
  };
};

/* ── Secours sans IA : sujets les plus repris ──────────────── */

const STOP_WORDS = new Set(
  'les des une un le la de du et en au aux pour par sur dans avec sans est sont ont qui que quoi cette ces sa son ses leur leurs plus pas ne il elle ils elles on nous vous apres avant contre entre selon comme mais ou donc lors face fait faire etre avoir deux trois tout tous direct video'.split(' ')
);

const titleWords = (title) =>
  new Set(
    title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9 ]+/g, ' ')
      .split(' ')
      .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
  );

// Regroupe les titres qui partagent des mots, puis garde les sujets
// repris par le plus de sources.
const autoPoints = (items) => {
  const clusters = [];
  items.forEach((item) => {
    const words = titleWords(item.title);
    const cluster = clusters.find((candidate) => {
      let shared = 0;
      words.forEach((word) => {
        if (candidate.words.has(word)) shared += 1;
      });
      return shared >= 3 || (shared >= 2 && shared / Math.max(1, Math.min(words.size, candidate.words.size)) >= 0.5);
    });
    if (cluster) {
      cluster.items.push(item);
      words.forEach((word) => cluster.words.add(word));
    } else {
      clusters.push({ items: [item], words });
    }
  });
  return clusters
    .map((cluster) => ({ ...cluster, sources: new Set(cluster.items.map((item) => item.source)).size }))
    .sort((a, b) => b.sources - a.sources || b.items.length - a.items.length)
    .slice(0, 5)
    .map((cluster) => {
      const best = cluster.items.reduce((a, b) => ((b.summary || '').length > (a.summary || '').length ? b : a));
      return {
        title: cluster.items[0].title,
        summary: best.summary || '',
        context: '',
        sources: cluster.items.slice(0, 4).map((item) => ({ title: item.title, source: item.source, link: item.link, date: item.date }))
      };
    });
};

const cleanPoints = (data, items) => {
  const points = Array.isArray(data && data.points) ? data.points : [];
  return points
    .map((point) => {
      const refs = Array.isArray(point.sources) ? point.sources : [];
      const sources = [];
      refs.forEach((ref) => {
        const item = items[Number(ref) - 1];
        if (!item) return;
        const candidates = Array.isArray(item.sources) ? item.sources : [{ title: item.title, source: item.source, link: item.link, date: item.date }];
        candidates.forEach((candidate) => {
          if (candidate.link && !sources.some((source) => source.link === candidate.link)) sources.push(candidate);
        });
      });
      const cleaned = {
        title: String(point.titre || '').trim(),
        summary: String(point.resume || '').trim(),
        context: String(point.contexte || '').trim(),
        sources: sources.slice(0, 4)
      };
      if (point.dates) cleaned.dates = String(point.dates).trim();
      return cleaned;
    })
    .filter((point) => point.title && point.summary)
    .slice(0, 8);
};

const lastBriefingTime = (days, due, now) => {
  let last = 0;
  days.forEach((day) => {
    day.briefings.forEach((briefing) => {
      // Le briefing qu'on refait ne compte pas, ni ceux d'après (créneau passé refait).
      if (day.date === due.day && briefing.slot === due.slot) return;
      const time = Date.parse(briefing.generatedAt) || 0;
      if (time < now.getTime()) last = Math.max(last, time);
    });
  });
  return last;
};

// Créneau passé demandé depuis l'app (FORCE_DAY + FORCE_SLOT) : on le refait
// à son heure d'origine (même fenêtre d'articles), ou, s'il n'a jamais été
// rédigé, jusqu'au début du créneau suivant. null si c'est le créneau en cours
// ou une demande invalide (le passage normal s'en occupe).
const requestedPastSlot = (days, now) => {
  const day = String(process.env.FORCE_DAY || '').trim();
  const slot = String(process.env.FORCE_SLOT || '').trim();
  const index = BRIEFING_SLOTS.findIndex((candidate) => candidate.id === slot);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || index < 0 || !days.has(day)) return null;
  const start = parisDate(day, BRIEFING_SLOTS[index].hour);
  const next = BRIEFING_SLOTS[index + 1];
  let end;
  if (next) end = parisDate(day, next.hour);
  else {
    const following = new Date(parisDate(day, 12).getTime() + 24 * 3600 * 1000);
    end = parisDate(parisParts(following).day, BRIEFING_SLOTS[0].hour);
  }
  if (start > now || end > now) return null;
  const existing = days.get(day).briefings.find((briefing) => briefing.slot === slot);
  const at = existing && Date.parse(existing.generatedAt) ? new Date(existing.generatedAt) : end;
  return { day, slot, at };
};

const dueSlot = (days, now) => {
  const { day, hour } = parisParts(now);
  const slot = [...BRIEFING_SLOTS].reverse().find((candidate) => hour >= candidate.hour);
  if (!slot) return null;
  const existing = days.get(day);
  const force = process.env.FORCE_BRIEFING === 'true';
  const done = existing && existing.briefings.find((briefing) => briefing.slot === slot.id);
  // Un briefing de secours (IA indisponible) est refait au passage suivant.
  if (!force && done && !done.fallback) return null;
  return { day, slot: slot.id };
};

const makeBriefing = async (days, allItems, now, due) => {
  const last = lastBriefingTime(days, due, now);
  const hour = 3600 * 1000;
  let from = now.getTime() - BRIEFING_MAX_WINDOW_H * hour;
  if (last > from) from = Math.min(last, now.getTime() - BRIEFING_MIN_WINDOW_H * hour);
  const fromDate = new Date(from);

  const briefing = { slot: due.slot, generatedAt: now.toISOString(), from: fromDate.toISOString(), themes: {} };
  for (const theme of Object.keys(THEMES)) {
    const seenTitles = new Set();
    const items = allItems
      .filter((item) => item.theme === theme && Date.parse(item.date) >= from)
      .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
      .filter((item) => {
        const key = item.title.toLowerCase();
        if (seenTitles.has(key)) return false;
        seenTitles.add(key);
        return true;
      })
      .slice(0, BRIEFING_MAX_ITEMS);
    if (items.length < 2) {
      briefing.themes[theme] = { points: [], count: items.length };
      continue;
    }
    const { prompt, used } = buildPrompt(theme, items, fromDate, now);
    try {
      console.log(`Briefing ${theme} : ${used} dépêches`);
      const { model, data } = await callModel(prompt);
      briefing.model = model;
      const entry = { points: cleanPoints(data, items.slice(0, used)), count: used };
      if (entry.points.length) {
        try {
          const deep = await deepenPoints(theme, entry.points, items.slice(0, used), new Date(from), now);
          entry.points = deep.points;
          entry.read = deep.read;
          console.log(`Texte complet ${theme} : ${deep.read} article(s) lu(s)`);
        } catch (error) {
          reportError(`Texte complet ${theme} : ${error.message} (résumé sur titres et chapôs gardé)`);
        }
      }
      briefing.themes[theme] = entry;
    } catch (error) {
      reportError(`Briefing ${theme} impossible : ${error.message}`);
      briefing.themes[theme] = { points: autoPoints(items), count: items.length, auto: true };
      briefing.fallback = true;
    }
  }
  return briefing;
};

/* ── Résumé de la semaine ──────────────────────────────────── */

const WEEK_PROMPT = `Tu rédiges le résumé de la semaine d'une revue de presse pour un étudiant en droit qui veut entretenir sa culture générale.
On te donne, numérotés et datés, les sujets retenus chaque jour de la semaine (ou des dépêches).

Consignes :
- Retiens les 5 à 8 faits les plus importants de la semaine pour la culture générale. Un sujet qui a duré plusieurs jours n'apparaît qu'une fois, avec son évolution et où il en est à la fin de la semaine.
- Pour chaque fait :
  • "titre" : 10 mots maximum ;
  • "resume" : 2 phrases maximum, condensées (l'essentiel, le résultat) ;
  • "contexte" : une phrase qui explique pourquoi c'est important ou définit la notion à connaître ;
  • "dates" : jour(s) concerné(s), par exemple "mar. 29" ou "lun. 28 → jeu. 1er" ;
  • "sources" : les numéros utilisés.
- N'utilise que les informations fournies ; n'invente aucun fait, chiffre ou nom.
- Ton neutre, sans opinion. Écris en français.
- Classe les faits du plus important au moins important.

Réponds uniquement avec un objet JSON : {"points":[{"titre":"…","resume":"…","contexte":"…","dates":"…","sources":[1,2]}]}`;

const shiftDay = (day, offset) => {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
};

const mondayOf = (day) => {
  const weekday = (new Date(`${day}T12:00:00Z`).getUTCDay() + 6) % 7; // lundi = 0
  return shiftDay(day, -weekday);
};

const dayLabel = (day) =>
  new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: '2-digit', timeZone: 'UTC' }).format(
    new Date(`${day}T12:00:00Z`)
  );

// Matière d'un thème : les sujets des briefings du jour (déjà triés par
// l'IA) s'il y en a assez, sinon les articles de la semaine.
const weekEntries = (days, monday, theme) => {
  const sunday = shiftDay(monday, 6);
  const points = [];
  const seen = new Set();
  [...days.values()]
    .filter((day) => day.date >= monday && day.date <= sunday)
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .forEach((day) => {
      day.briefings.forEach((briefing) => {
        const data = briefing.themes && briefing.themes[theme];
        if (!data || data.auto) return;
        (data.points || []).forEach((point) => {
          const key = point.title.toLowerCase();
          if (seen.has(key)) return;
          seen.add(key);
          points.push({ date: day.date, title: point.title, summary: point.summary, context: point.context, sources: point.sources || [] });
        });
      });
    });
  if (points.length >= 5) return { entries: points, kind: 'points' };
  const items = [];
  days.forEach((day) => {
    if (day.date < monday || day.date > sunday) return;
    day.items.forEach((item) => {
      if (item.theme === theme) items.push({ ...item, date: day.date, time: item.date });
    });
  });
  items.sort((a, b) => Date.parse(b.time) - Date.parse(a.time));
  return { entries: items, kind: 'items' };
};

const buildWeekPrompt = (theme, monday, entries) => {
  const header = `${THEME_HINTS[theme]}\nSemaine du ${dayLabel(monday)} au ${dayLabel(shiftDay(monday, 6))}.\n\nSujets :\n`;
  const lines = [];
  let length = header.length;
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    const summary = shorten(entry.summary || '', 260);
    const line = `[${index + 1}] (${dayLabel(entry.date)}${entry.source ? `, ${entry.source}` : ''}) ${entry.title}${summary ? ` — ${summary}` : ''}`;
    if (length + line.length + 1 > BRIEFING_MAX_PROMPT_CHARS) break;
    lines.push(line);
    length += line.length + 1;
  }
  return { prompt: header + lines.join('\n'), used: lines.length };
};

const makeWeek = async (days, monday, now) => {
  const week = { week: monday, end: shiftDay(monday, 6), generatedAt: now.toISOString(), themes: {} };
  for (const theme of Object.keys(THEMES)) {
    const { entries, kind } = weekEntries(days, monday, theme);
    if (entries.length < 2) {
      week.themes[theme] = { points: [], count: entries.length };
      continue;
    }
    const { prompt, used } = buildWeekPrompt(theme, monday, entries);
    try {
      console.log(`Semaine ${theme} : ${used} ${kind === 'points' ? 'sujets' : 'dépêches'}`);
      const { model, data } = await callModel(prompt, WEEK_PROMPT);
      week.model = model;
      week.themes[theme] = { points: cleanPoints(data, entries.slice(0, used)), count: used };
    } catch (error) {
      reportError(`Semaine ${theme} impossible : ${error.message}`);
      const items = kind === 'items' ? entries : [];
      week.themes[theme] = { points: autoPoints(items), count: entries.length, auto: true };
      week.fallback = true;
    }
  }
  return week;
};

/* ── Programme principal ───────────────────────────────────── */

const main = async () => {
  const now = new Date();
  await mkdir(DAYS_DIR, { recursive: true });
  await mkdir(WEEKS_DIR, { recursive: true });
  const days = await loadDays();
  const state = await readJson(path.join(OUT_DIR, 'state.json'), { sources: {} });
  const cutoff = now.getTime() - KEEP_DAYS * 24 * 3600 * 1000;

  const known = new Set();
  days.forEach((day) => day.items.forEach((item) => known.add(item.id)));

  let added = 0;
  const failures = [];
  for (const source of SOURCES) {
    let entries = [];
    try {
      entries = await fetchFeed(source);
    } catch (error) {
      failures.push(`${source.id} (${error.message})`);
      continue;
    }
    const sourceKnown = Boolean(state.sources[source.id]);
    for (const entry of entries) {
      entry.link = cleanLink(entry.link);
      const id = itemId(entry.link);
      if (known.has(id)) continue;
      // Sans date : on prend l'heure de découverte, sauf au tout premier
      // passage sur la source (sinon tout son historique arriverait « aujourd'hui »).
      let time = entry.time;
      if (time === null) {
        if (!sourceKnown) continue;
        time = now.getTime();
      }
      if (time < cutoff || time > now.getTime() + 3600 * 1000) continue;
      const item = {
        id,
        title: entry.title,
        summary: source.titleOnly ? '' : shorten(entry.summary === entry.title ? '' : entry.summary, SUMMARY_MAX),
        link: entry.link,
        source: source.name,
        theme: source.theme,
        date: new Date(Math.min(time, now.getTime())).toISOString()
      };
      ensureDay(days, parisParts(new Date(item.date)).day).items.push(item);
      known.add(id);
      added += 1;
    }
    state.sources[source.id] = { lastOk: now.toISOString(), entries: entries.length };
  }
  console.log(`${added} nouveaux articles.`);
  if (failures.length) console.warn(`Flux en échec : ${failures.join(', ')}`);

  // Ménage : jours trop anciens.
  const oldest = parisParts(new Date(cutoff)).day;
  for (const date of [...days.keys()]) {
    if (date < oldest) {
      days.delete(date);
      await unlink(path.join(DAYS_DIR, `${date}.json`)).catch(() => {});
    }
  }

  const allItems = [];
  days.forEach((day) => allItems.push(...day.items));

  // Au plus 6 essais par créneau, espacés d'au moins 25 min : Gemini
  // gratuit est souvent saturé (503/429) pendant un moment, trois essais
  // rapprochés échouaient tous (05/10). Le briefing de secours reste en
  // attendant. Une demande depuis l'app (FORCE_BRIEFING) passe toujours.
  const force = process.env.FORCE_BRIEFING === 'true';
  const past = force ? requestedPastSlot(days, now) : null;
  const due = past ? { day: past.day, slot: past.slot } : dueSlot(days, now);
  const briefingNow = past ? past.at : now;
  if (past) console.log(`Briefing refait : ${past.day} ${past.slot} (à ${parisTime(past.at)})`);
  const dueKey = due ? `${due.day}-${due.slot}` : '';
  const previousAttempt = state.briefingAttempts && state.briefingAttempts.key === dueKey ? state.briefingAttempts : null;
  const attempts = previousAttempt ? previousAttempt.count : 0;
  const spaced = !previousAttempt || !previousAttempt.at || now.getTime() - Date.parse(previousAttempt.at) >= 25 * 60 * 1000;
  let newEvening = false;
  if (due && ((attempts < 6 && spaced) || force)) {
    state.briefingAttempts = { key: dueKey, count: attempts + 1, at: now.toISOString() };
    const briefing = await makeBriefing(days, allItems, briefingNow, due);
    const day = ensureDay(days, due.day);
    const previous = day.briefings.find((existing) => existing.slot === briefing.slot);
    // Un nouvel essai raté ne remplace pas un briefing déjà rédigé par l'IA.
    if (!(briefing.fallback && previous && !previous.fallback)) {
      day.briefings = day.briefings.filter((existing) => existing !== previous);
      day.briefings.push(briefing);
      newEvening = briefing.slot === 'soir' && !briefing.fallback;
    }
  }

  // Résumé de la semaine en cours : refait après le briefing du soir, ou
  // s'il manque / n'a pas été rédigé par l'IA (3 essais par jour au plus).
  const today = parisParts(now).day;
  const monday = mondayOf(today);
  const weekFile = path.join(WEEKS_DIR, `${monday}.json`);
  const currentWeek = await readJson(weekFile, null);
  const weekKey = `${today}`;
  const weekAttempts = state.weekAttempts && state.weekAttempts.key === weekKey ? state.weekAttempts.count : 0;
  const weekWanted = force || newEvening || !currentWeek || (currentWeek.fallback && weekAttempts < 3);
  if (weekWanted && parisParts(now).hour >= BRIEFING_SLOTS[0].hour) {
    state.weekAttempts = { key: weekKey, count: weekAttempts + 1 };
    const week = await makeWeek(days, monday, now);
    if (!(week.fallback && currentWeek && !currentWeek.fallback)) {
      await writeFile(weekFile, JSON.stringify(week));
    }
  }
  let weeks = [];
  try {
    weeks = (await readdir(WEEKS_DIR)).filter((file) => /^\d{4}-\d{2}-\d{2}\.json$/.test(file)).map((file) => file.slice(0, 10));
  } catch {
    weeks = [];
  }
  weeks.sort().reverse();
  for (const old of weeks.slice(KEEP_WEEKS)) await unlink(path.join(WEEKS_DIR, `${old}.json`)).catch(() => {});
  weeks = weeks.slice(0, KEEP_WEEKS);

  for (const day of days.values()) {
    day.items.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
    await writeFile(path.join(DAYS_DIR, `${day.date}.json`), JSON.stringify(day));
  }
  const index = {
    updatedAt: now.toISOString(),
    days: [...days.keys()].sort().reverse(),
    weeks,
    themes: THEMES,
    sources: SOURCES.map(({ name, theme, home }) => ({ name, theme, home }))
  };
  await writeFile(path.join(OUT_DIR, 'index.json'), JSON.stringify(index));
  if (due) state.lastBriefing = { at: now.toISOString(), slot: due.slot, errors: briefingErrors };
  await writeFile(path.join(OUT_DIR, 'state.json'), JSON.stringify(state, null, 1));
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
