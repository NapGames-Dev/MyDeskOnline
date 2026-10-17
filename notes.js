/* ═══════════════════════════════════════════════════════════
   NOTES
   Liste à gauche (recherche, épinglées, aperçu, date de modification)
   et document à droite : icône, titre, barre de mise en forme,
   raccourcis façon Markdown (« # », « - », « [] », « > »…), cases à
   cocher, collage nettoyé, et « 🧠 Fiche » qui envoie la sélection vers
   les Révisions. Sur téléphone : la liste, puis la note en plein écran.
   Page : { id, name, content (HTML), emoji, pinned, createdAt, updatedAt }.
   Chargé avant script.js (cœur : données, traductions, onglets, démarrage).
   ═══════════════════════════════════════════════════════════ */

const NOTES_EMOJIS = ['📝', '📚', '⚖️', '🎓', '💡', '✅', '📌', '🎯', '🧠', '📅', '💼', '🏋️', '🍽️', '🛒', '✈️', '💰', '❤️', '⭐', '🔥', '🗂️', '🔒', '🎵', '🧪', '🌱'];
const NOTES_HIGHLIGHTS = ['#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8'];
const NOTES_COLORS = ['#dc2626', '#ea580c', '#16a34a', '#2563eb', '#7c3aed'];
const NOTES_WORDS_PER_MINUTE = 230;
const NOTES_CHECK_ZONE_PX = 28; // largeur de la case à cocher, à gauche de l'élément
const NOTES_ALLOWED_TAGS = new Set([
  'P', 'BR', 'B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE', 'DEL', 'UL', 'OL', 'LI', 'H1', 'H2', 'H3',
  'BLOCKQUOTE', 'A', 'MARK', 'CODE', 'PRE', 'SUB', 'SUP', 'TABLE', 'THEAD', 'TBODY', 'TR', 'TD', 'TH'
]);
const NOTES_DROP_TAGS = new Set([
  'SCRIPT', 'STYLE', 'META', 'LINK', 'IMG', 'PICTURE', 'SVG', 'IFRAME', 'OBJECT', 'EMBED', 'VIDEO', 'AUDIO',
  'CANVAS', 'FORM', 'INPUT', 'BUTTON', 'SELECT', 'TEXTAREA', 'NOSCRIPT', 'TEMPLATE', 'HEAD', 'TITLE'
]);
// Raccourcis tapés en début de ligne, suivis d'une espace.
const NOTES_SHORTCUTS = [
  [/^#$/, 'h1'],
  [/^##$/, 'h2'],
  [/^###$/, 'h3'],
  [/^>$/, 'blockquote'],
  [/^[-*]$/, 'ul'],
  [/^1[.)]$/, 'ol'],
  [/^\[ ?\]$/, 'check']
];

let notesQuery = '';
let notesMobileDoc = false; // téléphone : la note est ouverte (sinon la liste)
let notesRenderedId = null; // page affichée dans l'éditeur
let notesDirty = false; // l'éditeur a été modifié depuis la dernière copie
let notesSavedRange = null; // sélection dans l'éditeur, gardée quand un menu prend le focus
let notesListFrame = null;
let notesFlashText = '';
let notesFlashTimer = null;
const notesTextCache = new Map();

/* ── Données ───────────────────────────────────────────────── */

function getNotesEditorElement() {
  return document.getElementById('notes-editor');
}

function getActiveNotePage() {
  if (!appData.notes || !Array.isArray(appData.notes.pages)) return null;
  return appData.notes.pages.find((page) => page.id === appData.notes.activePageId) || null;
}

function notesTitle(page) {
  return (page && typeof page.name === 'string' && page.name.trim()) || t('notes.untitled');
}

// Copie le contenu de l'éditeur dans la page, seulement s'il a été modifié
// (sinon le simple fait d'afficher une note la ferait remonter dans la liste).
function syncActiveNoteContent() {
  const editor = getNotesEditorElement();
  const page = getActiveNotePage();
  if (!editor || !page || !notesDirty || notesRenderedId !== page.id) return;
  notesDirty = false;
  if (page.content === editor.innerHTML) return;
  page.content = editor.innerHTML;
  page.updatedAt = Date.now();
}

function notesNormalize(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

// Texte brut d'un contenu HTML (DOMParser : rien n'est chargé ni exécuté).
function notesPlainText(html) {
  if (!html) return '';
  if (notesTextCache.has(html)) return notesTextCache.get(html);
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
  doc.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
  doc.querySelectorAll('p, div, li, h1, h2, h3, blockquote, tr').forEach((element) => element.append('\n'));
  const text = doc.body.textContent
    .replace(/​/g, '')
    .replace(/ /g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim();
  if (notesTextCache.size > 300) notesTextCache.clear();
  notesTextCache.set(html, text);
  return text;
}

// Épinglées d'abord, puis de la plus récemment modifiée à la plus ancienne.
function notesSorted() {
  return appData.notes.pages
    .map((page, index) => ({ page, index }))
    .sort(
      (a, b) =>
        Number(Boolean(b.page.pinned)) - Number(Boolean(a.page.pinned)) ||
        (Number(b.page.updatedAt) || 0) - (Number(a.page.updatedAt) || 0) ||
        a.index - b.index
    )
    .map(({ page }) => page);
}

function notesFormatDate(ms) {
  if (!ms) return '';
  const date = new Date(ms);
  const now = new Date();
  const locale = getCurrentLocale();
  const dayStart = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((dayStart(now) - dayStart(date)) / 86400000);
  if (days === 0) return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  if (days === 1) return t('notes.yesterday');
  if (days > 1 && days < 7) return date.toLocaleDateString(locale, { weekday: 'long' });
  return date.toLocaleDateString(
    locale,
    date.getFullYear() === now.getFullYear() ? { day: 'numeric', month: 'short' } : { day: 'numeric', month: 'short', year: 'numeric' }
  );
}

function notesEl(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined && text !== null) element.textContent = text;
  return element;
}

// Ajoute `text` à `parent` en surlignant la recherche (sans HTML injecté).
function notesAppendHighlighted(parent, text, query) {
  const index = query ? notesNormalize(text).indexOf(query) : -1;
  if (index === -1) {
    parent.append(text);
    return;
  }
  parent.append(text.slice(0, index), notesEl('mark', '', text.slice(index, index + query.length)), text.slice(index + query.length));
}

/* ── Liste ─────────────────────────────────────────────────── */

function notesExcerpt(page, query) {
  const text = notesPlainText(page.content).replace(/\n+/g, ' · ');
  if (!query) return text.slice(0, 140);
  const index = notesNormalize(text).indexOf(query);
  if (index < 50) return text.slice(0, 140);
  return `…${text.slice(index - 40, index + 100)}`;
}

function notesListItem(page, query) {
  const button = notesEl('button', 'nt-item');
  button.type = 'button';
  button.setAttribute('role', 'option');
  const active = page.id === appData.notes.activePageId;
  button.classList.toggle('is-active', active);
  button.setAttribute('aria-selected', active ? 'true' : 'false');
  button.appendChild(notesEl('span', 'nt-item__emoji', page.emoji || '📝'));
  const body = notesEl('span', 'nt-item__body');
  const head = notesEl('span', 'nt-item__head');
  const title = notesEl('span', 'nt-item__title');
  notesAppendHighlighted(title, notesTitle(page), query);
  head.append(title, notesEl('span', 'nt-item__date', `${page.pinned ? '📌 ' : ''}${notesFormatDate(page.updatedAt)}`));
  const excerpt = notesEl('span', 'nt-item__excerpt');
  const text = notesExcerpt(page, query);
  if (text) notesAppendHighlighted(excerpt, text, query);
  else excerpt.textContent = t('notes.empty');
  body.append(head, excerpt);
  button.appendChild(body);
  button.addEventListener('click', () => setActiveNotePage(page.id));
  return button;
}

function renderNotesList() {
  const list = document.getElementById('notes-page-list');
  if (!list) return;
  list.innerHTML = '';
  const query = notesNormalize(notesQuery.trim());
  let pages = notesSorted();
  if (query) pages = pages.filter((page) => notesNormalize(`${notesTitle(page)}\n${notesPlainText(page.content)}`).includes(query));
  const count = document.getElementById('notes-count');
  if (count) count.textContent = query ? t('notes.found', { count: pages.length }) : t('notes.count', { count: appData.notes.pages.length });
  if (!pages.length) {
    list.appendChild(notesEl('p', 'nt-empty', t('notes.noResult', { query: notesQuery.trim() })));
    return;
  }
  const grouped = !query && pages.some((page) => page.pinned) && pages.some((page) => !page.pinned);
  let group = null;
  pages.forEach((page) => {
    const current = page.pinned ? 'pinned' : 'others';
    if (grouped && current !== group) list.appendChild(notesEl('p', 'nt-list__group', t(`notes.${current}`)));
    group = current;
    list.appendChild(notesListItem(page, query));
  });
}

// La liste suit la frappe (titre, aperçu, ordre) sans être refaite à chaque touche.
function notesScheduleListRender() {
  if (notesListFrame) return;
  notesListFrame = requestAnimationFrame(() => {
    notesListFrame = null;
    renderNotesList();
    renderNotesStats();
  });
}

/* ── Document ──────────────────────────────────────────────── */

function renderNotesEditor() {
  const editor = getNotesEditorElement();
  const page = getActiveNotePage();
  if (!editor || !page) return;
  const content = typeof page.content === 'string' ? page.content : '';
  // Même page, même contenu : on ne touche à rien (le curseur reste en place).
  if (notesRenderedId !== page.id || editor.innerHTML !== content) {
    editor.innerHTML = content;
    notesDirty = false;
  }
  notesRenderedId = page.id;

  const title = document.getElementById('notes-title');
  if (title && title.value !== (page.name || '')) title.value = page.name || '';
  const emoji = document.getElementById('notes-emoji');
  if (emoji) {
    emoji.textContent = page.emoji || '📝';
    emoji.classList.toggle('is-default', !page.emoji);
  }
  const pin = document.getElementById('notes-pin');
  if (pin) {
    pin.classList.toggle('is-on', Boolean(page.pinned));
    pin.setAttribute('aria-pressed', page.pinned ? 'true' : 'false');
    pin.title = t(page.pinned ? 'notes.unpin' : 'notes.pin');
  }
  renderNotesStats();
}

function renderNotesStats() {
  const page = getActiveNotePage();
  const stats = document.getElementById('notes-stats');
  const saved = document.getElementById('notes-saved');
  if (!page || !stats || !saved) return;
  const editor = getNotesEditorElement();
  const text = notesPlainText(editor && notesRenderedId === page.id ? editor.innerHTML : page.content);
  const words = (text.match(/[\p{L}\p{N}][\p{L}\p{N}’'-]*/gu) || []).length;
  stats.textContent = t('notes.stats', { words, minutes: Math.max(1, Math.round(words / NOTES_WORDS_PER_MINUTE)) });
  saved.textContent = notesFlashText || (page.updatedAt ? t('notes.edited', { date: notesFormatDate(page.updatedAt) }) : '');
}

function renderNotes() {
  if (!appData.notes || !Array.isArray(appData.notes.pages)) return;
  const app = document.getElementById('notes-app');
  if (app) app.classList.toggle('is-doc', notesMobileDoc);
  renderNotesList();
  renderNotesEditor();
}

function notesFlash(text) {
  notesFlashText = text;
  renderNotesStats();
  clearTimeout(notesFlashTimer);
  notesFlashTimer = setTimeout(() => {
    notesFlashText = '';
    renderNotesStats();
  }, 2500);
}

/* ── Actions sur les notes ─────────────────────────────────── */

function setActiveNotePage(pageId) {
  if (!appData.notes.pages.some((page) => page.id === pageId)) return;
  syncActiveNoteContent();
  appData.notes.activePageId = pageId;
  notesMobileDoc = true;
  notesCloseMenus();
  renderNotes();
  saveData();
}

function addNotePage() {
  syncActiveNoteContent();
  const now = Date.now();
  const page = { id: uid(), name: '', content: '', emoji: '', pinned: false, createdAt: now, updatedAt: now };
  appData.notes.pages.push(page);
  appData.notes.activePageId = page.id;
  notesQuery = '';
  const search = document.getElementById('notes-search');
  if (search) search.value = '';
  notesMobileDoc = true;
  notesCloseMenus();
  renderNotes();
  saveData();
  const title = document.getElementById('notes-title');
  if (title) title.focus();
}

// Suppression immédiate, annulable depuis le bandeau (Ctrl+Z de l'app).
function deleteNotePage() {
  const page = getActiveNotePage();
  if (!page) return;
  syncActiveNoteContent();
  const hadContent = Boolean((page.name || '').trim() || notesPlainText(page.content));
  appData.notes.pages = appData.notes.pages.filter((item) => item.id !== page.id);
  if (!appData.notes.pages.length) {
    const now = Date.now();
    appData.notes.pages.push({ id: uid(), name: '', content: '', emoji: '', pinned: false, createdAt: now, updatedAt: now });
  }
  appData.notes.activePageId = notesSorted()[0].id;
  notesMobileDoc = false;
  notesCloseMenus();
  renderNotes();
  saveData();
  if (hadContent && typeof showUndoToast === 'function') showUndoToast('notes.deleted');
}

function duplicateNotePage() {
  const page = getActiveNotePage();
  if (!page) return;
  syncActiveNoteContent();
  const now = Date.now();
  const copy = { ...page, id: uid(), name: t('notes.copyName', { name: notesTitle(page) }), pinned: false, createdAt: now, updatedAt: now };
  appData.notes.pages.push(copy);
  appData.notes.activePageId = copy.id;
  notesCloseMenus();
  renderNotes();
  saveData();
}

function toggleNotePin() {
  const page = getActiveNotePage();
  if (!page) return;
  page.pinned = !page.pinned;
  renderNotes();
  saveData();
}

async function copyNoteText() {
  const page = getActiveNotePage();
  const editor = getNotesEditorElement();
  if (!page || !editor) return;
  notesCloseMenus();
  const text = `${notesTitle(page)}\n\n${notesPlainText(editor.innerHTML)}`;
  try {
    await navigator.clipboard.writeText(text);
    notesFlash(t('notes.copied'));
  } catch (error) {
    notesFlash(t('notes.copyFailed'));
  }
}

function setNoteEmoji(emoji) {
  const page = getActiveNotePage();
  if (!page) return;
  page.emoji = emoji;
  page.updatedAt = Date.now();
  notesCloseMenus();
  renderNotes();
  saveData();
}

/* ── Mise en forme ─────────────────────────────────────────── */

function notesInEditor(node) {
  const editor = getNotesEditorElement();
  return Boolean(editor && node && editor.contains(node));
}

function notesClosest(node, selector) {
  const element = node && (node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement);
  const found = element && element.closest(selector);
  const editor = getNotesEditorElement();
  return found && editor && editor !== found && editor.contains(found) ? found : null;
}

// Un menu (style de paragraphe, lien…) prend le focus : on remet la sélection.
function notesRestoreRange() {
  const editor = getNotesEditorElement();
  if (!editor) return;
  editor.focus();
  if (!notesSavedRange) return;
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(notesSavedRange);
}

function notesAfterEdit(soon = false) {
  notesDirty = true;
  syncActiveNoteContent();
  if (soon) saveDataSoon();
  else saveData();
  notesScheduleListRender();
  renderNotesToolbarState();
}

function notesExec(command, value = null) {
  notesRestoreRange();
  document.execCommand('styleWithCSS', false, command === 'hiliteColor' || command === 'foreColor');
  document.execCommand(command, false, value);
  notesAfterEdit();
}

function notesFormatBlock(tag) {
  notesRestoreRange();
  const current = notesClosest(window.getSelection().anchorNode, 'h1, h2, h3, blockquote');
  // Recliquer sur le style actuel le retire.
  const target = current && current.tagName.toLowerCase() === tag ? 'p' : tag;
  document.execCommand('formatBlock', false, `<${target}>`);
  notesAfterEdit();
}

function notesToggleChecklist() {
  notesRestoreRange();
  const list = notesClosest(window.getSelection().anchorNode, 'ul, ol');
  if (list && list.classList.contains('nt-checklist')) {
    document.execCommand('insertUnorderedList'); // retire la liste
  } else {
    if (!list || list.tagName !== 'UL') document.execCommand('insertUnorderedList');
    const ul = notesClosest(window.getSelection().anchorNode, 'ul');
    if (ul) ul.classList.add('nt-checklist');
  }
  notesAfterEdit();
}

function notesInsertLink() {
  const raw = window.prompt(t('notes.linkPrompt'), 'https://');
  if (!raw || !raw.trim() || raw.trim() === 'https://') return;
  let url = raw.trim();
  if (!/^(https?:|mailto:)/i.test(url)) url = `https://${url}`;
  notesRestoreRange();
  const selection = window.getSelection();
  if (selection.rangeCount && !selection.isCollapsed) {
    document.execCommand('createLink', false, url);
  } else {
    const link = notesEl('a', '', url);
    link.href = url;
    document.execCommand('insertHTML', false, link.outerHTML);
  }
  getNotesEditorElement()
    .querySelectorAll('a[href]')
    .forEach((link) => {
      link.target = '_blank';
      link.rel = 'noopener';
    });
  notesAfterEdit();
}

// « # » + espace en début de ligne → titre, « - » → puces, « [] » → cases…
function notesMarkdownShortcut() {
  const selection = window.getSelection();
  if (!selection.rangeCount || !selection.isCollapsed) return;
  const node = selection.anchorNode;
  if (!node || node.nodeType !== Node.TEXT_NODE || !notesInEditor(node)) return;
  const offset = selection.anchorOffset;
  const before = node.textContent.slice(0, offset).replace(/ /g, ' ');
  if (!before.endsWith(' ')) return;
  const rule = NOTES_SHORTCUTS.find(([pattern]) => pattern.test(before.slice(0, -1)));
  if (!rule) return;
  const block = notesClosest(node, 'p, div, h1, h2, h3, blockquote, li');
  if (block && block.tagName === 'LI') return;
  // Le repère doit être tout au début de la ligne.
  const range = document.createRange();
  range.setStart(block || getNotesEditorElement(), 0);
  range.setEnd(node, offset);
  if (range.toString().replace(/ /g, ' ') !== before) return;
  // On construit le bloc nous-mêmes : execCommand échoue sur une ligne vide.
  node.textContent = node.textContent.slice(offset);
  let line = block;
  if (!line) {
    // Texte posé directement dans l'éditeur : la ligne va jusqu'au prochain <br> ou bloc.
    line = document.createElement('div');
    node.parentNode.insertBefore(line, node);
    let current = node;
    while (current && !(current.nodeType === Node.ELEMENT_NODE && /^(BR|DIV|P|H[1-3]|UL|OL|BLOCKQUOTE)$/.test(current.tagName))) {
      const next = current.nextSibling;
      line.appendChild(current);
      current = next;
    }
  }
  const kind = rule[1];
  let target;
  if (kind === 'ul' || kind === 'ol' || kind === 'check') {
    const list = document.createElement(kind === 'ol' ? 'ol' : 'ul');
    if (kind === 'check') list.className = 'nt-checklist';
    target = document.createElement('li');
    target.append(...Array.from(line.childNodes));
    list.appendChild(target);
    line.replaceWith(list);
  } else {
    target = document.createElement(kind);
    target.append(...Array.from(line.childNodes));
    line.replaceWith(target);
  }
  if (!target.textContent) {
    target.textContent = '';
    target.appendChild(document.createElement('br'));
  }
  const caret = document.createRange();
  caret.setStart(target.firstChild.nodeType === Node.TEXT_NODE ? target.firstChild : target, 0);
  caret.collapse(true);
  selection.removeAllRanges();
  selection.addRange(caret);
}

// Entrée dans une liste à cocher : la nouvelle case part décochée.
function notesFixNewChecklistItem() {
  const item = notesClosest(window.getSelection().anchorNode, '.nt-checklist > li');
  if (item && item.dataset.checked === 'true' && !item.textContent.trim()) delete item.dataset.checked;
}

// Collage depuis le web, Word… : on garde la structure (titres, listes, gras,
// liens, tableaux), pas les styles ni les images.
function notesSanitize(html) {
  const doc = new DOMParser().parseFromString(`<body>${String(html || '')}</body>`, 'text/html');
  const clean = (node) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) return;
      if (child.nodeType !== Node.ELEMENT_NODE) {
        child.remove();
        return;
      }
      const tag = child.tagName.toUpperCase();
      if (NOTES_DROP_TAGS.has(tag)) {
        child.remove();
        return;
      }
      clean(child);
      const renamed = { H4: 'h3', H5: 'h3', H6: 'h3', DIV: 'p', SECTION: 'p', ARTICLE: 'p' }[tag];
      if (renamed) {
        const replacement = doc.createElement(renamed);
        replacement.append(...Array.from(child.childNodes));
        child.replaceWith(replacement);
        return;
      }
      if (!NOTES_ALLOWED_TAGS.has(tag)) {
        child.replaceWith(...Array.from(child.childNodes));
        return;
      }
      Array.from(child.attributes).forEach((attr) => {
        if (!(tag === 'A' && attr.name.toLowerCase() === 'href')) child.removeAttribute(attr.name);
      });
      if (tag === 'A') {
        if (/^(https?:|mailto:)/i.test(child.getAttribute('href') || '')) {
          child.setAttribute('target', '_blank');
          child.setAttribute('rel', 'noopener');
        } else {
          child.removeAttribute('href');
        }
      }
    });
  };
  clean(doc.body);
  return doc.body.innerHTML;
}

// État des boutons (gras actif, style du paragraphe…) selon la sélection.
function renderNotesToolbarState() {
  const selection = window.getSelection();
  if (!selection.rangeCount || !notesInEditor(selection.anchorNode)) return;
  const inChecklist = Boolean(notesClosest(selection.anchorNode, '.nt-checklist'));
  document.querySelectorAll('#notes .nt-tool[data-command]').forEach((button) => {
    const command = button.dataset.command;
    let on = false;
    try {
      on = document.queryCommandState(command);
    } catch (error) {
      on = false;
    }
    if (command === 'insertUnorderedList' && inChecklist) on = false;
    button.classList.toggle('is-on', on);
  });
  const checklist = document.getElementById('notes-checklist');
  if (checklist) checklist.classList.toggle('is-on', inChecklist);
  const blockSelect = document.getElementById('notes-block');
  if (blockSelect) {
    const block = notesClosest(selection.anchorNode, 'h1, h2, h3, blockquote');
    blockSelect.value = block ? block.tagName.toLowerCase() : 'p';
  }
}

/* ── Fiche de Révisions ────────────────────────────────────── */

// Sélection (ou paragraphe en cours) → réponse ; titre le plus proche
// au-dessus → question. Ouvre l'ajout de fiche pré-rempli dans Révisions.
function notesMakeCard() {
  const editor = getNotesEditorElement();
  const page = getActiveNotePage();
  if (!editor || !page) return;
  notesRestoreRange();
  const selection = window.getSelection();
  let html = '';
  let anchor = null;
  if (selection.rangeCount && notesInEditor(selection.anchorNode)) {
    const range = selection.getRangeAt(0);
    anchor = range.startContainer;
    if (!range.collapsed) {
      const box = document.createElement('div');
      box.appendChild(range.cloneContents());
      html = box.innerHTML;
    } else {
      const block = notesClosest(anchor, 'p, div, li, h1, h2, h3, blockquote');
      if (block) html = block.innerHTML;
    }
  }
  if (!notesPlainText(html)) {
    notesFlash(t('notes.cardEmpty'));
    return;
  }
  let front = notesTitle(page);
  editor.querySelectorAll('h1, h2, h3').forEach((heading) => {
    if (anchor && heading.compareDocumentPosition(anchor) & Node.DOCUMENT_POSITION_FOLLOWING && heading.textContent.trim()) {
      front = heading.textContent.trim();
    }
  });
  syncActiveNoteContent();
  saveData();
  if (typeof ankiOpenAddWith !== 'function' || !ankiOpenAddWith({ front, back: notesSanitize(html) })) {
    notesFlash(t('notes.cardUnavailable'));
  }
}

/* ── Menus ─────────────────────────────────────────────────── */

function notesCloseMenus() {
  ['notes-menu', 'notes-emoji-picker'].forEach((id) => {
    const panel = document.getElementById(id);
    if (panel) panel.hidden = true;
  });
  const more = document.getElementById('notes-more');
  if (more) more.setAttribute('aria-expanded', 'false');
}

function notesToggleMenu(id, trigger) {
  const panel = document.getElementById(id);
  if (!panel) return;
  const open = panel.hidden;
  notesCloseMenus();
  panel.hidden = !open;
  if (trigger) trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
}

function buildNotesPickers() {
  const picker = document.getElementById('notes-emoji-picker');
  if (picker && !picker.childElementCount) {
    NOTES_EMOJIS.forEach((emoji) => {
      const button = notesEl('button', 'nt-emoji-choice', emoji);
      button.type = 'button';
      button.addEventListener('click', () => setNoteEmoji(emoji));
      picker.appendChild(button);
    });
    const none = notesEl('button', 'nt-emoji-choice nt-emoji-choice--none');
    none.type = 'button';
    none.setAttribute('data-i18n', 'notes.emojiNone');
    none.textContent = t('notes.emojiNone');
    none.addEventListener('click', () => setNoteEmoji(''));
    picker.appendChild(none);
  }
  const addSwatches = (containerId, colors, command, none) => {
    const box = document.getElementById(containerId);
    if (!box || box.childElementCount) return;
    colors.forEach((color) => {
      const swatch = notesEl('button', 'nt-swatch');
      swatch.type = 'button';
      swatch.style.setProperty('--swatch', color);
      swatch.setAttribute('aria-label', color);
      swatch.addEventListener('mousedown', (event) => event.preventDefault());
      swatch.addEventListener('click', () => notesExec(command, color));
      box.appendChild(swatch);
    });
    if (none) {
      const clear = notesEl('button', 'nt-swatch nt-swatch--none');
      clear.type = 'button';
      clear.setAttribute('data-i18n-title', 'notes.toolbar.noHighlight');
      clear.title = t('notes.toolbar.noHighlight');
      clear.addEventListener('mousedown', (event) => event.preventDefault());
      clear.addEventListener('click', () => notesExec(command, 'transparent'));
      box.appendChild(clear);
    }
  };
  addSwatches('notes-highlights', NOTES_HIGHLIGHTS, 'hiliteColor', true);
  addSwatches('notes-colors', NOTES_COLORS, 'foreColor', false);
}

/* ── Démarrage ─────────────────────────────────────────────── */

function initNotesToolbar() {
  const editor = getNotesEditorElement();
  // Les boutons ne prennent pas le focus : la sélection reste dans la note.
  document.querySelectorAll('#notes .nt-toolbar button').forEach((button) => {
    button.addEventListener('mousedown', (event) => event.preventDefault());
  });
  document.querySelectorAll('#notes .nt-tool[data-command]').forEach((button) => {
    button.addEventListener('click', () => notesExec(button.dataset.command));
  });
  const actions = {
    'notes-checklist': notesToggleChecklist,
    'notes-link': notesInsertLink,
    'notes-clear': () => notesExec('removeFormat'),
    'notes-card': notesMakeCard
  };
  Object.entries(actions).forEach(([id, action]) => {
    const button = document.getElementById(id);
    if (button) button.addEventListener('click', action);
  });
  const blockSelect = document.getElementById('notes-block');
  if (blockSelect) blockSelect.addEventListener('change', () => notesFormatBlock(blockSelect.value));
  buildNotesPickers();

  if (!editor) return;
  editor.addEventListener('input', (event) => {
    if (event.inputType === 'insertText' && event.data === ' ') notesMarkdownShortcut();
    if (event.inputType === 'insertParagraph') notesFixNewChecklistItem();
    notesAfterEdit(true);
  });
  editor.addEventListener('click', (event) => {
    const item = event.target.closest && event.target.closest('.nt-checklist > li');
    if (item && editor.contains(item) && event.clientX - item.getBoundingClientRect().left < NOTES_CHECK_ZONE_PX) {
      event.preventDefault();
      item.dataset.checked = item.dataset.checked === 'true' ? 'false' : 'true';
      notesAfterEdit();
      return;
    }
    const link = event.target.closest && event.target.closest('a[href]');
    if (link && editor.contains(link) && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      window.open(link.href, '_blank', 'noopener');
    }
  });
  editor.addEventListener('paste', (event) => {
    const data = event.clipboardData;
    if (!data) return;
    const html = data.getData('text/html');
    if (html) {
      event.preventDefault();
      document.execCommand('insertHTML', false, notesSanitize(html));
      notesAfterEdit();
    } else if (!data.getData('text/plain') && data.files && data.files.length) {
      event.preventDefault();
      notesFlash(t('notes.imagesUnsupported'));
    }
  });
  editor.addEventListener('drop', (event) => {
    if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length) {
      event.preventDefault();
      notesFlash(t('notes.imagesUnsupported'));
    }
  });
  document.addEventListener('selectionchange', () => {
    const selection = window.getSelection();
    if (!selection.rangeCount || !notesInEditor(selection.anchorNode)) return;
    notesSavedRange = selection.getRangeAt(0).cloneRange();
    renderNotesToolbarState();
  });
}

function initNotes() {
  const bind = (id, event, handler) => {
    const element = document.getElementById(id);
    if (element) element.addEventListener(event, handler);
  };
  bind('notes-add-page', 'click', addNotePage);
  bind('notes-pin', 'click', toggleNotePin);
  bind('notes-duplicate', 'click', duplicateNotePage);
  bind('notes-copy', 'click', copyNoteText);
  bind('notes-delete-page', 'click', deleteNotePage);
  bind('notes-more', 'click', (event) => {
    event.stopPropagation();
    notesToggleMenu('notes-menu', event.currentTarget);
  });
  bind('notes-emoji', 'click', (event) => {
    event.stopPropagation();
    notesToggleMenu('notes-emoji-picker');
  });
  bind('notes-back', 'click', () => {
    syncActiveNoteContent();
    notesMobileDoc = false;
    renderNotes();
  });
  bind('notes-search', 'input', (event) => {
    notesQuery = event.target.value;
    renderNotesList();
  });
  bind('notes-search', 'keydown', (event) => {
    if (event.key !== 'Escape') return;
    event.target.value = '';
    notesQuery = '';
    renderNotesList();
  });
  bind('notes-title', 'input', (event) => {
    const page = getActiveNotePage();
    if (!page) return;
    page.name = event.target.value;
    page.updatedAt = Date.now();
    saveDataSoon();
    notesScheduleListRender();
  });
  bind('notes-title', 'keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const editor = getNotesEditorElement();
    if (!editor) return;
    editor.focus();
    const caret = document.createRange();
    caret.setStart(editor, 0);
    caret.collapse(true);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(caret);
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest || event.target.closest('.nt-menu, #notes-emoji-picker, #notes-emoji')) return;
    notesCloseMenus();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') notesCloseMenus();
  });

  initNotesToolbar();
  renderNotes();
}
