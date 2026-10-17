/* ═══════════════════════════════════════════════════════════
   ONGLET MENU — l'outil Menu (Projet Menu) dans MyDesk, sans le PC
   - Les données publiées par le PC (publier_mydesk.py) sont dans un
     Gist privé dédié, repéré par le fichier menu-base.gz.b64.
   - Elles ne sont téléchargées que lorsqu'elles changent (version =
     dernier commit du Gist), puis gardées en cache (IndexedDB) :
     l'onglet fonctionne hors ligne.
   - L'interface est celle de l'outil (templates/index.html), affichée
     dans une iframe : ses appels fetch() vers le serveur Flask sont
     redirigés vers MenuEngine (menu-engine.js).
   ═══════════════════════════════════════════════════════════ */

const MENU_GIST_KEY = 'mydesk-menu-gist';
const MENU_FICHIER_REPERE = 'menu-base.gz.b64';
const MENU_DB = 'mydesk-menu';
const MENU_VERIF_MS = 10 * 60 * 1000;
const MENU_VUE_KEY = 'mydesk-menu-vue';
const MENU_VUES = ['menus', 'courses', 'planning', 'stock', 'catalogue'];

const MENU_TRANSLATIONS = {
  fr: {
    loading: 'Chargement des menus…',
    downloading: 'Téléchargement des menus publiés par le PC…',
    noSync: "Active la synchronisation (onglet Accueil) : l'outil Menu utilise le même compte GitHub.",
    notPublished: "Aucun menu publié pour l'instant. Sur le PC, lance « Publier vers MyDesk.bat » dans le dossier Projet Menu (une seule fois : ensuite c'est automatique après chaque scraping).",
    offline: 'Hors ligne : menus du {date} (copie locale).',
    error: 'Impossible de charger les menus : {message}',
    updated: 'Menus mis à jour ({date}).',
    publishedOn: 'Données du PC publiées le {date}',
    refresh: 'Vérifier les mises à jour',
    vues: { menus: 'Recettes', courses: 'Courses', planning: 'À cuisiner', stock: 'Stock', catalogue: 'Catalogue' }
  },
  en: {
    loading: 'Loading menus…',
    downloading: 'Downloading the menus published by the PC…',
    noSync: 'Turn on sync (Home tab): the Menu tool uses the same GitHub account.',
    notPublished: 'No menus published yet. On the PC, run "Publier vers MyDesk.bat" in the Projet Menu folder (only once: afterwards it runs after each scraping).',
    offline: 'Offline: menus from {date} (local copy).',
    error: 'Unable to load menus: {message}',
    updated: 'Menus updated ({date}).',
    publishedOn: 'PC data published on {date}',
    refresh: 'Check for updates',
    vues: { menus: 'Recipes', courses: 'Shopping', planning: 'To cook', stock: 'Pantry', catalogue: 'Catalogue' }
  },
  vi: {
    loading: 'Đang tải thực đơn…',
    downloading: 'Đang tải thực đơn từ máy tính…',
    noSync: 'Hãy bật đồng bộ (tab Trang chủ): công cụ Menu dùng cùng tài khoản GitHub.',
    notPublished: 'Chưa có thực đơn nào được xuất bản. Trên máy tính, chạy "Publier vers MyDesk.bat" trong thư mục Projet Menu.',
    offline: 'Ngoại tuyến: thực đơn ngày {date} (bản lưu cục bộ).',
    error: 'Không thể tải thực đơn: {message}',
    updated: 'Đã cập nhật thực đơn ({date}).',
    publishedOn: 'Dữ liệu máy tính xuất bản ngày {date}',
    refresh: 'Kiểm tra cập nhật',
    vues: { menus: 'Công thức', courses: 'Đi chợ', planning: 'Cần nấu', stock: 'Kho', catalogue: 'Danh mục' }
  }
};
const MENU_TAB_TRANSLATIONS = { fr: 'Menu', en: 'Meals', vi: 'Thực đơn' };

let menuDonnees = null; // {version, base, catalogue, ui, etatInitial}
let menuChargement = null;
let menuDerniereVerif = 0;
let menuEtatAffiche = null; // état au moment où l'iframe l'a vu en dernier

function registerMenuTranslations() {
  Object.keys(MENU_TRANSLATIONS).forEach((language) => {
    if (!translations[language]) return;
    translations[language].menutool = MENU_TRANSLATIONS[language];
    if (translations[language].tabs) translations[language].tabs.menutool = MENU_TAB_TRANSLATIONS[language];
  });
}

/* ── Cache local (IndexedDB) ───────────────────────────────── */

function menuDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(MENU_DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore('cache');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function menuCacheLire() {
  try {
    const db = await menuDb();
    return await new Promise((resolve, reject) => {
      const req = db.transaction('cache', 'readonly').objectStore('cache').get('donnees');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (error) {
    return null;
  }
}

async function menuCacheEffacer() {
  try {
    const db = await menuDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction('cache', 'readwrite');
      tx.objectStore('cache').delete('donnees');
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    // ignoré
  }
}

async function menuCacheEcrire(donnees) {
  try {
    const db = await menuDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction('cache', 'readwrite');
      tx.objectStore('cache').put(donnees, 'donnees');
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.warn('Cache Menu indisponible', error);
  }
}

/* ── GitHub ────────────────────────────────────────────────── */

async function menuApi(chemin) {
  const reponse = await fetch(`https://api.github.com${chemin}`, {
    headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${syncSettings.token}` },
    cache: 'no-store'
  });
  if (!reponse.ok) {
    const erreur = new Error(`GitHub ${reponse.status}`);
    erreur.status = reponse.status;
    throw erreur;
  }
  return reponse.json();
}

async function menuTrouverGist() {
  try {
    const memo = JSON.parse(localStorage.getItem(MENU_GIST_KEY) || 'null');
    if (memo && memo.id) return memo.id;
  } catch (error) {
    // ignoré
  }
  for (let page = 1; page <= 10; page += 1) {
    const gists = await menuApi(`/gists?per_page=100&page=${page}`);
    const trouve = gists.find((gist) => gist.files && gist.files[MENU_FICHIER_REPERE]);
    if (trouve) {
      try {
        localStorage.setItem(MENU_GIST_KEY, JSON.stringify({ id: trouve.id }));
      } catch (error) {
        // ignoré
      }
      return trouve.id;
    }
    if (gists.length < 100) break;
  }
  return null;
}

/* ── Accès ─────────────────────────────────────────────────── */

// L'onglet Menu n'existe que pour un compte qui a accès au Gist Menu : jeton
// de synchronisation présent ET Gist Menu trouvé et lisible avec ce jeton.
// Sans ça, ni l'onglet ni les données gardées en cache ne s'affichent.
let menuJetonVerifie;

function menuAccesAutorise() {
  if (typeof isSyncEnabled !== 'function' || !isSyncEnabled()) return false;
  try {
    const memo = JSON.parse(localStorage.getItem(MENU_GIST_KEY) || 'null');
    return Boolean(memo && memo.id);
  } catch (error) {
    return false;
  }
}

async function menuOublierAcces() {
  try {
    localStorage.removeItem(MENU_GIST_KEY);
  } catch (error) {
    // ignoré
  }
  menuDonnees = null;
  await menuCacheEffacer();
}

// Revérifié au démarrage et à chaque changement de jeton (sync.js).
async function menuVerifierAcces() {
  const jeton = typeof isSyncEnabled === 'function' && isSyncEnabled() ? syncSettings.token : null;
  if (jeton === menuJetonVerifie) return;
  menuJetonVerifie = jeton;
  if (!jeton) {
    await menuOublierAcces();
  } else {
    try {
      const gistId = await menuTrouverGist();
      if (gistId) await menuApi(`/gists/${gistId}/commits?per_page=1`);
      else await menuOublierAcces();
    } catch (error) {
      // Jeton refusé ou Gist introuvable : plus d'accès. Hors ligne, on garde
      // l'accès déjà vérifié (l'onglet marche sur le cache).
      if ([401, 403, 404].includes(error.status)) await menuOublierAcces();
    }
  }
  if (typeof applyTabVisibility === 'function') applyTabVisibility();
  if (typeof renderTabVisibilitySettings === 'function') renderTabVisibilitySettings();
}

async function menuDezip(b64) {
  const octets = Uint8Array.from(atob(b64.trim()), (c) => c.charCodeAt(0));
  const flux = new Blob([octets]).stream().pipeThrough(new DecompressionStream('gzip'));
  return JSON.parse(await new Response(flux).text());
}

async function menuTexteBrut(gist, nom) {
  const fichier = gist.files[nom];
  if (!fichier) return null;
  if (!fichier.truncated && typeof fichier.content === 'string') return fichier.content;
  const reponse = await fetch(fichier.raw_url, { cache: 'no-store' });
  if (!reponse.ok) throw new Error(`${nom} : ${reponse.status}`);
  return reponse.text();
}

// Télécharge les données si le Gist a changé depuis la copie locale.
async function menuSynchroniserDonnees() {
  const gistId = await menuTrouverGist();
  if (!gistId) return { etat: 'non-publie' };
  let commits;
  try {
    commits = await menuApi(`/gists/${gistId}/commits?per_page=1`);
  } catch (error) {
    if (error.status === 404) {
      localStorage.removeItem(MENU_GIST_KEY);
      return { etat: 'non-publie' };
    }
    throw error;
  }
  const version = commits && commits[0] ? commits[0].version : null;
  if (menuDonnees && menuDonnees.version === version) return { etat: 'a-jour' };
  const cache = await menuCacheLire();
  if (cache && cache.version === version) {
    menuDonnees = cache;
    return { etat: 'charge' };
  }
  menuStatut('menutool.downloading', 'info');
  const gist = await menuApi(`/gists/${gistId}`);
  const texteBase = await menuTexteBrut(gist, 'menu-base.gz.b64');
  if (!texteBase || texteBase.startsWith('en attente')) return { etat: 'non-publie' };
  const [base, texteCatalogue, ui, texteEtat] = await Promise.all([
    menuDezip(texteBase),
    menuTexteBrut(gist, 'menu-catalogue.gz.b64'),
    menuTexteBrut(gist, 'menu-ui.html'),
    menuTexteBrut(gist, 'menu-etat-initial.json')
  ]);
  menuDonnees = {
    version,
    base,
    catalogue: texteCatalogue ? await menuDezip(texteCatalogue) : null,
    ui,
    etatInitial: texteEtat ? JSON.parse(texteEtat) : null
  };
  await menuCacheEcrire(menuDonnees);
  return { etat: 'telecharge' };
}

/* ── Interface ─────────────────────────────────────────────── */

function menuStatut(cle, type = 'info', variables = {}) {
  const status = document.getElementById('menutool-status');
  if (!status) return;
  status.textContent = cle ? t(cle, variables) : '';
  status.className = `menutool-status ${type}`;
}

function menuDateLisible(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : `${formatDate(date, { weekday: 'short' })} ${formatTime(date)}`;
}

// Script injecté dans l'iframe AVANT celui de l'outil : ses fetch() vers le
// serveur Flask sont servis par MenuEngine, dans la page parente.
const MENU_SHIM = `
<script>
(function () {
  var moteur = window.parent && window.parent.MenuEngine;
  var fetchReseau = window.fetch.bind(window);
  window.fetch = function (ressource, options) {
    var brut = typeof ressource === 'string' ? ressource : (ressource && ressource.url) || '';
    var url = new URL(brut, 'http://menu.local');
    if (url.origin !== 'http://menu.local') return fetchReseau(ressource, options);
    var methode = ((options && options.method) || 'GET').toUpperCase();
    var corps = {};
    if (options && typeof options.body === 'string') {
      try { corps = JSON.parse(options.body); } catch (e) { corps = {}; }
    }
    var reponse;
    try {
      reponse = moteur.handle(url.pathname, methode, corps, url.searchParams);
      if (methode !== 'GET' && window.parent.menuApresAction) window.parent.menuApresAction();
    } catch (e) {
      console.error(e);
      reponse = { status: 500, data: { ok: false, message: 'Erreur du moteur Menu : ' + e.message, erreur: e.message } };
    }
    return Promise.resolve(new Response(JSON.stringify(reponse.data), {
      status: reponse.status, headers: { 'Content-Type': 'application/json' }
    }));
  };
  // La navigation passe dans la barre de MyDesk (le rail de l'outil est
  // masqué par le thème) : chaque changement d'écran lui est signalé, et on
  // rouvre le dernier écran consulté. Le scraping reste sur le PC.
  document.addEventListener('DOMContentLoaded', function () {
    var parent = window.parent;
    if (parent.menuAppliquerTheme) parent.menuAppliquerTheme();
    if (typeof window.afficherOnglet !== 'function') return;
    var afficher = window.afficherOnglet;
    window.afficherOnglet = function (nom) {
      afficher(nom);
      if (parent.menuVueAffichee) parent.menuVueAffichee(nom);
    };
    window.afficherOnglet(parent.menuVueInitiale ? parent.menuVueInitiale() : 'menus');
  });
})();
<\/script>`;

function menuAfficherIframe() {
  const conteneur = document.getElementById('menutool-frame');
  if (!conteneur || !menuDonnees || !menuDonnees.ui) return;
  // Polices de l'outil -> police de MyDesk (variable posée par le thème).
  const ui = menuDonnees.ui
    .split('"Newsreader", Georgia, serif').join('var(--md-font)')
    .split('"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif').join('var(--md-font)');
  const html = ui.includes('<head>') ? ui.replace('<head>', `<head>${MENU_SHIM}`) : MENU_SHIM + ui;
  let iframe = conteneur.querySelector('iframe');
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.title = 'Menu';
    conteneur.appendChild(iframe);
  }
  conteneur.classList.add('is-loading');
  iframe.onload = () => {
    conteneur.classList.remove('is-loading');
    menuAppliquerTheme();
  };
  iframe.srcdoc = html;
  menuEtatAffiche = JSON.stringify(appData.menu || null);
}

/* ── Intégration : thème, navigation, hauteur ──────────────── */

// L'outil décrit ses couleurs par rôle (--papier, --surface, --ink,
// --accent...) : on lui donne celles de MyDesk, recalculées à chaque
// changement d'apparence (mode sombre, thème, police, arrondis).
function menuCouleursMyDesk() {
  const racine = getComputedStyle(document.documentElement);
  const lire = (nom, defaut) => (racine.getPropertyValue(nom) || '').trim() || defaut;
  return {
    sombre: document.documentElement.getAttribute('data-theme') === 'dark',
    fond: lire('--background', '#f4f6fb'),
    surface: lire('--surface', '#ffffff'),
    texte: lire('--text', '#1f2937'),
    discret: lire('--muted', '#6b7280'),
    trait: lire('--border', '#d1d5db'),
    accent: lire('--primary', '#4e73df'),
    rayon: parseFloat(lire('--radius-base', '8')) || 8,
    police: getComputedStyle(document.body).fontFamily || 'system-ui, sans-serif'
  };
}

function menuCssTheme() {
  const c = menuCouleursMyDesk();
  const mix = (a, pourcent, b) => `color-mix(in srgb, ${a} ${pourcent}%, ${b})`;
  const semantique = c.sombre
    ? '--ok:#4ade80;--ok-doux:#14261c;--ok-bord:#1f4a31;--sur-ok:#0b1a12;'
      + '--warn:#fbbf24;--warn-doux:#2b2313;--warn-bord:#4d3b14;'
      + '--err:#f87171;--err-doux:#2e1a1d;--err-bord:#5b2a2d;'
      + '--ombre-1:0 1px 2px rgba(0,0,0,.3);--ombre-2:0 4px 14px rgba(0,0,0,.35);--ombre-3:0 12px 36px rgba(0,0,0,.5);'
    : '--ok:#047857;--ok-doux:#ecfdf5;--ok-bord:#a7f3d0;--sur-ok:#ffffff;'
      + '--warn:#b45309;--warn-doux:#fffbeb;--warn-bord:#fde68a;'
      + '--err:#dc2626;--err-doux:#fef2f2;--err-bord:#fecaca;'
      + '--ombre-1:0 1px 2px rgba(15,23,42,.05);--ombre-2:0 4px 14px rgba(15,23,42,.08);--ombre-3:0 12px 32px rgba(15,23,42,.14);';
  return ':root:root,:root:root[data-theme="clair"]{'
    + `--papier:${c.surface};--surface:${mix(c.fond, 45, c.surface)};`
    + `--surface-2:${mix(c.fond, 80, c.surface)};--surface-3:${mix(c.texte, 8, c.fond)};`
    + `--ink:${c.texte};--ink-2:${mix(c.texte, 75, c.surface)};--ink-3:${c.discret};`
    + `--line:${c.trait};--line-fort:${mix(c.texte, 20, c.trait)};`
    + `--accent:${c.accent};--accent-fonce:${mix(c.accent, 78, c.texte)};`
    + `--accent-doux:${mix(c.accent, 14, c.surface)};--sur-accent:#fff;`
    + `--rayon:${c.rayon + 2}px;--rayon-s:${Math.max(4, c.rayon - 2)}px;`
    + `--md-font:${c.police};${semantique}color-scheme:${c.sombre ? 'dark' : 'light'};}`
    + 'body{background:var(--papier);color:var(--ink);font-family:var(--md-font)}'
    + '.rail,#onglet-recette{display:none!important}'
    + '.app{display:block;min-height:0}.app>*{min-width:0}'
    + '.scene{max-width:none;padding:18px 22px 48px}'
    // Le titre de l'écran est déjà dans la barre de MyDesk.
    + '.scene h1{display:none}'
    + '@media (max-width:700px){.scene{padding:12px 10px 40px}}';
}

function menuAppliquerTheme() {
  const iframe = document.querySelector('#menutool-frame iframe');
  const doc = iframe && iframe.contentDocument;
  if (!doc || !doc.head) return;
  let style = doc.getElementById('mydesk-theme');
  if (!style) {
    style = doc.createElement('style');
    style.id = 'mydesk-theme';
  }
  // Toujours en dernier dans <head>, pour passer après les styles de l'outil.
  doc.head.appendChild(style);
  style.textContent = menuCssTheme();
  if (document.documentElement.getAttribute('data-theme') === 'dark') doc.documentElement.removeAttribute('data-theme');
  else doc.documentElement.setAttribute('data-theme', 'clair');
}

function menuVueInitiale() {
  try {
    const vue = localStorage.getItem(MENU_VUE_KEY);
    if (MENU_VUES.includes(vue)) return vue;
  } catch (error) {
    // ignoré
  }
  return 'menus';
}

// Appelé par l'iframe à chaque changement d'écran.
function menuVueAffichee(nom) {
  document.querySelectorAll('#menutool-vues .menutool-vue').forEach((bouton) => {
    const actif = bouton.dataset.vue === nom;
    bouton.classList.toggle('is-active', actif);
    if (actif) bouton.setAttribute('aria-current', 'page');
    else bouton.removeAttribute('aria-current');
  });
  if (!MENU_VUES.includes(nom)) return;
  try {
    localStorage.setItem(MENU_VUE_KEY, nom);
  } catch (error) {
    // ignoré
  }
}

function menuOuvrirVue(nom) {
  const iframe = document.querySelector('#menutool-frame iframe');
  const fenetre = iframe && iframe.contentWindow;
  if (fenetre && typeof fenetre.afficherOnglet === 'function') {
    fenetre.afficherOnglet(nom);
    fenetre.scrollTo(0, 0);
  } else {
    menuVueAffichee(nom);
  }
}

// L'iframe occupe toute la hauteur visible sous la barre : une seule zone
// qui défile, comme une page de l'outil, sans double barre de défilement.
function menuAjusterHauteur() {
  const conteneur = document.getElementById('menutool-frame');
  if (!conteneur || !conteneur.offsetParent) return;
  const haut = conteneur.getBoundingClientRect().top + window.scrollY;
  const marge = window.innerWidth <= 600 ? 8 : 24;
  conteneur.style.height = `${Math.max(420, window.innerHeight - haut - marge)}px`;
}

// Appelé par l'iframe après chaque action : l'iframe connaît déjà cet état.
function menuApresAction() {
  menuEtatAffiche = JSON.stringify(appData.menu || null);
}

function menuAppliquerDonnees() {
  MenuEngine.setData(menuDonnees.base, menuDonnees.catalogue);
  MenuEngine.importerEtatInitial(menuDonnees.etatInitial);
  const info = document.getElementById('menutool-info');
  if (info) info.textContent = t('menutool.publishedOn', { date: menuDateLisible(menuDonnees.base.genere_le) });
  menuAfficherIframe();
}

async function menuCharger(forcer = false) {
  if (menuChargement) return menuChargement;
  menuChargement = (async () => {
    try {
      if (!menuAccesAutorise()) {
        menuStatut('menutool.noSync', 'error');
        return;
      }
      if (!menuDonnees) {
        const cache = await menuCacheLire();
        if (cache) {
          menuDonnees = cache;
          menuAppliquerDonnees();
        }
      }
      if (!isSyncEnabled()) {
        if (!menuDonnees) menuStatut('menutool.noSync', 'error');
        return;
      }
      if (!forcer && menuDonnees && Date.now() - menuDerniereVerif < MENU_VERIF_MS) return;
      if (!menuDonnees) menuStatut('menutool.loading', 'info');
      menuDerniereVerif = Date.now();
      const resultat = await menuSynchroniserDonnees();
      if (resultat.etat === 'non-publie') {
        menuStatut('menutool.notPublished', 'error');
      } else if (resultat.etat === 'telecharge' || resultat.etat === 'charge') {
        menuAppliquerDonnees();
        menuStatut('menutool.updated', 'success', { date: menuDateLisible(menuDonnees.base.genere_le) });
      } else {
        menuStatut('', 'info');
      }
    } catch (error) {
      console.error('Menu', error);
      if (menuDonnees) menuStatut('menutool.offline', 'info', { date: menuDateLisible(menuDonnees.base.genere_le) });
      else menuStatut('menutool.error', 'error', { message: error.message });
    } finally {
      menuChargement = null;
    }
  })();
  return menuChargement;
}

// À l'ouverture de l'onglet : vérifie les mises à jour et, si l'état a changé
// ailleurs (autre appareil), recharge l'iframe pour l'afficher.
function menuOnglet() {
  requestAnimationFrame(menuAjusterHauteur);
  menuCharger();
  if (menuDonnees && menuEtatAffiche !== null && menuEtatAffiche !== JSON.stringify(appData.menu || null)) {
    menuAfficherIframe();
  }
}

function initMenuTool() {
  const bouton = document.getElementById('menutool-refresh');
  if (bouton) bouton.addEventListener('click', () => menuCharger(true));
  const lien = document.querySelector('.tab-link[data-target="menutool"]');
  if (lien) lien.addEventListener('click', menuOnglet);
  document.querySelectorAll('#menutool-vues .menutool-vue').forEach((vue) => {
    vue.addEventListener('click', () => menuOuvrirVue(vue.dataset.vue));
  });
  menuVueAffichee(menuVueInitiale());
  window.addEventListener('resize', menuAjusterHauteur);
  // Mode sombre, thème, police : l'outil suit l'apparence de MyDesk.
  let attente = null;
  new MutationObserver(() => {
    cancelAnimationFrame(attente);
    attente = requestAnimationFrame(menuAppliquerTheme);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'style'] });
  menuVerifierAcces().then(() => {
    if (menuAccesAutorise() && document.querySelector('#menutool.tab-panel.active')) menuOnglet();
  });
}
