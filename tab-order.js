/* ═══════════════════════════════════════════════════════════
   ORDRE DES ONGLETS
   On attrape un onglet et on le glisse ailleurs dans la barre
   (appui long sur téléphone). L'ordre est gardé dans
   appData.tabs.order (liste d'id) : il est synchronisé avec le
   profil. L'onglet Paramètres reste toujours au bout.
   Dans Paramètres › Onglets visibles : flèches ▲▼ et remise à zéro.
   ═══════════════════════════════════════════════════════════ */

const TAB_ORDER_FIXED = 'settings';
const TAB_ORDER_LONG_PRESS_MS = 350;
const TAB_ORDER_THRESHOLD_PX = 6;
const TAB_ORDER_EDGE_PX = 36;

const TAB_ORDER_TRANSLATIONS = {
  fr: {
    hint: 'Astuce : glisse un onglet dans la barre pour changer sa place (appui long sur téléphone).',
    moveUp: 'Monter « {name} »',
    moveDown: 'Descendre « {name} »',
    reset: 'Ordre par défaut'
  },
  en: {
    hint: 'Tip: drag a tab in the bar to move it (long press on phones).',
    moveUp: 'Move “{name}” up',
    moveDown: 'Move “{name}” down',
    reset: 'Default order'
  },
  vi: {
    hint: 'Mẹo: kéo một thẻ trên thanh để đổi vị trí (nhấn giữ trên điện thoại).',
    moveUp: 'Đưa “{name}” lên',
    moveDown: 'Đưa “{name}” xuống',
    reset: 'Thứ tự mặc định'
  }
};

function registerTabOrderTranslations() {
  Object.keys(translations).forEach((language) => {
    translations[language].tabOrder = TAB_ORDER_TRANSLATIONS[language] || TAB_ORDER_TRANSLATIONS.fr;
  });
}

let tabOrderDefault = null; // ordre d'origine (index.html)
let tabOrderDrag = null;
let tabOrderClickSuppressedUntil = 0;

function tabOrderBar() {
  return document.querySelector('.tab-bar');
}

function tabOrderLinks() {
  const bar = tabOrderBar();
  return bar ? Array.from(bar.querySelectorAll('.tab-link')) : [];
}

function tabOrderCurrentIds() {
  return tabOrderLinks()
    .map((link) => link.dataset.target)
    .filter((id) => id && id !== TAB_ORDER_FIXED);
}

function tabOrderRemember() {
  if (!tabOrderDefault) tabOrderDefault = tabOrderCurrentIds();
}

// Remet les boutons dans l'ordre enregistré. Les onglets absents de la
// liste (ajoutés depuis) gardent leur place d'origine par rapport aux autres.
function applyTabOrder() {
  const bar = tabOrderBar();
  if (!bar || tabOrderIsDragging()) return;
  tabOrderRemember();
  const saved = appData.tabs && Array.isArray(appData.tabs.order) ? appData.tabs.order : [];
  const known = new Set(tabOrderDefault);
  const order = saved.filter((id, index) => known.has(id) && saved.indexOf(id) === index);
  tabOrderDefault.forEach((id, index) => {
    if (order.includes(id)) return;
    const previous = tabOrderDefault.slice(0, index).reverse().find((other) => order.includes(other));
    order.splice(previous ? order.indexOf(previous) + 1 : 0, 0, id);
  });
  const fixed = bar.querySelector(`.tab-link[data-target="${TAB_ORDER_FIXED}"]`);
  order.forEach((id) => {
    const link = bar.querySelector(`.tab-link[data-target="${id}"]`);
    if (link) bar.insertBefore(link, fixed);
  });
  if (typeof tabLinks !== 'undefined' && Array.isArray(tabLinks) && tabLinks.length) {
    tabLinks = tabOrderLinks();
  }
}

function saveTabOrder(ids) {
  if (!appData.tabs) appData.tabs = { visibility: {} };
  const isDefault = tabOrderDefault && ids.join(',') === tabOrderDefault.join(',');
  appData.tabs.order = isDefault ? [] : ids;
  applyTabOrder();
  saveData();
  if (typeof renderTabVisibilitySettings === 'function') renderTabVisibilitySettings();
}

// Paramètres : déplace un onglet d'un cran parmi les onglets réglables.
function moveTabInOrder(id, direction) {
  const ids = tabOrderCurrentIds();
  const movable = OPTIONAL_TABS.map((tab) => tab.id);
  const listed = ids.filter((other) => movable.includes(other));
  const neighbour = listed[listed.indexOf(id) + direction];
  if (!neighbour) return;
  const from = ids.indexOf(id);
  const to = ids.indexOf(neighbour);
  ids[from] = neighbour;
  ids[to] = id;
  saveTabOrder(ids);
}

function resetTabOrder() {
  tabOrderRemember();
  saveTabOrder(tabOrderDefault.slice());
}

/* ── Glisser dans la barre ─────────────────────────────────── */

function tabOrderStart(event) {
  if (event.button !== undefined && event.button !== 0) return;
  const link = event.target.closest('.tab-link');
  if (!link || link.dataset.target === TAB_ORDER_FIXED) return;
  const touch = event.pointerType === 'touch' || event.pointerType === 'pen';
  tabOrderDrag = {
    link,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    x: event.clientX,
    y: event.clientY,
    touch,
    active: false,
    before: tabOrderCurrentIds(),
    timer: null,
    scrollFrame: null
  };
  if (touch) {
    tabOrderDrag.timer = setTimeout(() => tabOrderActivate(), TAB_ORDER_LONG_PRESS_MS);
  }
  document.addEventListener('pointermove', tabOrderMove);
  document.addEventListener('pointerup', tabOrderEnd);
  document.addEventListener('pointercancel', tabOrderCancel);
  document.addEventListener('keydown', tabOrderKey);
}

function tabOrderActivate() {
  const drag = tabOrderDrag;
  if (!drag || drag.active) return;
  drag.active = true;
  drag.link.classList.add('is-dragging');
  tabOrderBar().classList.add('is-reordering');
  if (drag.touch && navigator.vibrate) navigator.vibrate(15);
  tabOrderAutoScroll();
}

function tabOrderMove(event) {
  const drag = tabOrderDrag;
  if (!drag || event.pointerId !== drag.pointerId) return;
  drag.x = event.clientX;
  drag.y = event.clientY;
  const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
  if (!drag.active) {
    if (drag.touch) {
      // Le doigt bouge avant l'appui long : c'est un défilement, pas un glisser.
      if (distance > TAB_ORDER_THRESHOLD_PX * 2) tabOrderCleanup();
      return;
    }
    if (distance < TAB_ORDER_THRESHOLD_PX) return;
    tabOrderActivate();
  }
  event.preventDefault();
  tabOrderPlace(event.clientX, event.clientY);
}

// Place l'onglet tenu avant/après celui qui est sous le pointeur
// (la barre peut tenir sur plusieurs lignes).
function tabOrderPlace(x, y) {
  const drag = tabOrderDrag;
  const bar = tabOrderBar();
  const others = tabOrderLinks().filter(
    (link) => link !== drag.link && link.dataset.target !== TAB_ORDER_FIXED && !link.classList.contains('is-hidden')
  );
  let target = null;
  let best = Infinity;
  others.forEach((link) => {
    const rect = link.getBoundingClientRect();
    if (y < rect.top - 4 || y > rect.bottom + 4) return;
    const gap = x < rect.left ? rect.left - x : x > rect.right ? x - rect.right : 0;
    if (gap < best) {
      best = gap;
      target = link;
    }
  });
  if (!target || best > 40) return;
  const rect = target.getBoundingClientRect();
  const after = x > rect.left + rect.width / 2;
  bar.insertBefore(drag.link, after ? target.nextElementSibling : target);
}

// Téléphone : la barre défile quand le doigt approche d'un bord.
function tabOrderAutoScroll() {
  const drag = tabOrderDrag;
  if (!drag || !drag.active) return;
  const bar = tabOrderBar();
  const rect = bar.getBoundingClientRect();
  if (bar.scrollWidth > bar.clientWidth) {
    let step = 0;
    if (drag.x < rect.left + TAB_ORDER_EDGE_PX) step = -8;
    else if (drag.x > rect.right - TAB_ORDER_EDGE_PX) step = 8;
    if (step) {
      bar.scrollLeft += step;
      tabOrderPlace(drag.x, drag.y);
    }
  }
  drag.scrollFrame = requestAnimationFrame(tabOrderAutoScroll);
}

function tabOrderEnd(event) {
  const drag = tabOrderDrag;
  if (!drag || event.pointerId !== drag.pointerId) return;
  if (drag.active) {
    tabOrderClickSuppressedUntil = Date.now() + 400;
    const ids = tabOrderCurrentIds();
    tabOrderCleanup();
    if (ids.join(',') !== drag.before.join(',')) saveTabOrder(ids);
    return;
  }
  tabOrderCleanup();
}

function tabOrderCancel() {
  const drag = tabOrderDrag;
  if (!drag) return;
  const wasActive = drag.active;
  tabOrderCleanup();
  if (wasActive) applyTabOrder(); // remet l'ordre enregistré
}

function tabOrderKey(event) {
  if (event.key === 'Escape' && tabOrderDrag && tabOrderDrag.active) {
    event.preventDefault();
    tabOrderClickSuppressedUntil = Date.now() + 400;
    tabOrderCancel();
  }
}

function tabOrderCleanup() {
  const drag = tabOrderDrag;
  if (!drag) return;
  clearTimeout(drag.timer);
  if (drag.scrollFrame) cancelAnimationFrame(drag.scrollFrame);
  drag.link.classList.remove('is-dragging');
  const bar = tabOrderBar();
  if (bar) bar.classList.remove('is-reordering');
  tabOrderDrag = null;
  document.removeEventListener('pointermove', tabOrderMove);
  document.removeEventListener('pointerup', tabOrderEnd);
  document.removeEventListener('pointercancel', tabOrderCancel);
  document.removeEventListener('keydown', tabOrderKey);
}

function tabOrderIsDragging() {
  return Boolean(tabOrderDrag && tabOrderDrag.active);
}

function initTabOrder() {
  const bar = tabOrderBar();
  if (!bar) return;
  tabOrderRemember();
  bar.addEventListener('pointerdown', tabOrderStart);
  // Pas de clic (ouverture d'onglet) juste après un glisser.
  bar.addEventListener(
    'click',
    (event) => {
      if (Date.now() < tabOrderClickSuppressedUntil) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );
  // Téléphone : bloque le défilement de la barre et le menu de l'appui long pendant le glisser.
  bar.addEventListener(
    'touchmove',
    (event) => {
      if (tabOrderIsDragging()) event.preventDefault();
    },
    { passive: false }
  );
  bar.addEventListener('contextmenu', (event) => {
    if (tabOrderDrag) event.preventDefault();
  });
  applyTabOrder();
}
