/* ═══════════════════════════════════════════════════════════
   ASSISTANT DE DÉMARRAGE
   À la toute première ouverture de MyDesk (aucune donnée, aucune
   apparence, aucune synchro sur cet appareil) : quelques étapes pour
   choisir le style graphique puis les onglets à garder. Chaque choix
   s'applique tout de suite, avec les réglages de Paramètres (apparence
   dans localStorage, onglets dans appData.tabs, synchronisés).
   Relançable depuis Paramètres.
   ═══════════════════════════════════════════════════════════ */

const ONBOARDING_KEY = 'mydesk-onboarding';

const ONBOARDING_TRANSLATIONS = {
  fr: {
    skip: 'Passer',
    back: '← Retour',
    next: 'Suivant →',
    finish: 'Ouvrir MyDesk',
    stepOf: 'Étape {n} sur {total}',
    welcomeTitle: 'Bienvenue sur MyDesk Online',
    welcomeText: 'Ton bureau en ligne : agenda, notes, listes, révisions, sport, actualité… En deux minutes, on le règle à ton goût. Tout reste modifiable ensuite dans Paramètres.',
    welcomeStart: 'Commencer',
    welcomeSync: 'J’utilise déjà MyDesk sur un autre appareil : synchroniser',
    styleTitle: 'Le style',
    styleText: 'Choisis un thème et un mode : l’aperçu se fait derrière, en direct.',
    modeLabel: 'Mode',
    modes: { light: '☀️ Clair', dark: '🌙 Sombre', auto: '🖥️ Automatique' },
    themeLabel: 'Thème',
    fontLabel: 'Police',
    tabsTitle: 'Les onglets',
    tabsText: 'Garde seulement ce qui te sert. Tu pourras en réactiver, et les réordonner en les glissant, quand tu veux.',
    tabsAll: 'Tout cocher',
    tabsEssential: 'L’essentiel',
    tabsCount: '{n} onglet(s) sur {total}',
    descriptions: {
      calendar: 'Ta semaine heure par heure, objectifs de révision, import .ics.',
      mindmap: 'Cartes mentales pour organiser tes idées.',
      todo: 'Listes de tâches avec échéances et priorités.',
      notes: 'Pages de notes mises en forme.',
      daily: 'Petits défis à cocher chaque jour, avec l’historique.',
      sport: 'Séances, programmes et suivi de tes entraînements.',
      menutool: 'Recettes, repas et listes de courses (données publiées depuis le PC).',
      anki: 'Fiches de révision à répétition espacée.',
      news: 'Résumé quotidien de l’actualité : monde, France, justice.',
      gantt: 'Planning de projets en diagramme de Gantt.',
      snake: 'Le jeu du serpent pour une pause : 7 modes, défi du jour, trophées, sons.',
      trackirigo: 'Carte des bus et trams Irigo (Angers) en temps réel.',
      patchnotes: 'Toutes les nouveautés de MyDesk.'
    },
    doneTitle: 'C’est prêt !',
    doneText: 'Ton MyDesk est réglé. Quelques repères :',
    doneTips: [
      'Paramètres (⚙️ au bout des onglets) : thème, police, onglets, ordre.',
      'Accueil → Synchronisation : retrouve tes données sur ton téléphone et tes autres ordinateurs.',
      'Glisse un onglet dans la barre pour changer sa place.'
    ],
    restart: 'Relancer l’assistant de démarrage'
  },
  en: {
    skip: 'Skip',
    back: '← Back',
    next: 'Next →',
    finish: 'Open MyDesk',
    stepOf: 'Step {n} of {total}',
    welcomeTitle: 'Welcome to MyDesk Online',
    welcomeText: 'Your online desk: calendar, notes, lists, flashcards, sport, news… Let’s set it up your way in two minutes. Everything can be changed later in Settings.',
    welcomeStart: 'Get started',
    welcomeSync: 'I already use MyDesk on another device: sync',
    styleTitle: 'Style',
    styleText: 'Pick a theme and a mode: the preview updates live behind.',
    modeLabel: 'Mode',
    modes: { light: '☀️ Light', dark: '🌙 Dark', auto: '🖥️ Automatic' },
    themeLabel: 'Theme',
    fontLabel: 'Font',
    tabsTitle: 'Tabs',
    tabsText: 'Keep only what you need. You can turn tabs back on, and reorder them by dragging, at any time.',
    tabsAll: 'Select all',
    tabsEssential: 'Essentials',
    tabsCount: '{n} of {total} tab(s)',
    descriptions: {
      calendar: 'Your week hour by hour, study goals, .ics import.',
      mindmap: 'Mind maps to organise your ideas.',
      todo: 'Task lists with due dates and priorities.',
      notes: 'Formatted note pages.',
      daily: 'Small daily challenges to tick off, with history.',
      sport: 'Workouts, programs and training log.',
      menutool: 'Recipes, meals and shopping lists (data published from the PC).',
      anki: 'Spaced-repetition flashcards.',
      news: 'Daily news summary: world, France, justice.',
      gantt: 'Project planning as a Gantt chart.',
      snake: 'The snake game for a break: 7 modes, daily challenge, trophies, sound.',
      trackirigo: 'Live map of Irigo buses and trams (Angers).',
      patchnotes: 'Everything new in MyDesk.'
    },
    doneTitle: 'All set!',
    doneText: 'Your MyDesk is ready. A few pointers:',
    doneTips: [
      'Settings (⚙️ at the end of the tabs): theme, font, tabs, order.',
      'Home → Sync: get your data on your phone and other computers.',
      'Drag a tab in the bar to move it.'
    ],
    restart: 'Restart the setup assistant'
  },
  vi: {
    skip: 'Bỏ qua',
    back: '← Quay lại',
    next: 'Tiếp →',
    finish: 'Mở MyDesk',
    stepOf: 'Bước {n}/{total}',
    welcomeTitle: 'Chào mừng đến với MyDesk Online',
    welcomeText: 'Bàn làm việc trực tuyến của bạn: lịch, ghi chú, danh sách, ôn tập, thể thao, tin tức… Hãy thiết lập trong hai phút. Mọi thứ có thể đổi sau trong Cài đặt.',
    welcomeStart: 'Bắt đầu',
    welcomeSync: 'Tôi đã dùng MyDesk trên thiết bị khác: đồng bộ',
    styleTitle: 'Giao diện',
    styleText: 'Chọn chủ đề và chế độ: xem trước ngay phía sau.',
    modeLabel: 'Chế độ',
    modes: { light: '☀️ Sáng', dark: '🌙 Tối', auto: '🖥️ Tự động' },
    themeLabel: 'Chủ đề',
    fontLabel: 'Phông chữ',
    tabsTitle: 'Các tab',
    tabsText: 'Chỉ giữ những gì bạn cần. Bạn có thể bật lại và sắp xếp lại bất cứ lúc nào.',
    tabsAll: 'Chọn tất cả',
    tabsEssential: 'Cơ bản',
    tabsCount: '{n}/{total} tab',
    descriptions: {
      calendar: 'Tuần của bạn theo giờ, mục tiêu ôn tập, nhập .ics.',
      mindmap: 'Sơ đồ tư duy để sắp xếp ý tưởng.',
      todo: 'Danh sách việc cần làm có hạn chót.',
      notes: 'Trang ghi chú có định dạng.',
      daily: 'Thử thách nhỏ mỗi ngày, có lịch sử.',
      sport: 'Buổi tập, chương trình và theo dõi luyện tập.',
      menutool: 'Công thức, bữa ăn và danh sách mua sắm.',
      anki: 'Thẻ ôn tập lặp lại ngắt quãng.',
      news: 'Tóm tắt tin tức hằng ngày.',
      gantt: 'Kế hoạch dự án dạng biểu đồ Gantt.',
      snake: 'Trò chơi rắn săn mồi: 7 chế độ, thử thách hôm nay, cúp, âm thanh.',
      trackirigo: 'Bản đồ xe buýt và tàu điện Irigo (Angers).',
      patchnotes: 'Mọi điểm mới của MyDesk.'
    },
    doneTitle: 'Xong rồi!',
    doneText: 'MyDesk đã sẵn sàng. Vài gợi ý:',
    doneTips: [
      'Cài đặt (⚙️ cuối thanh tab): chủ đề, phông chữ, tab, thứ tự.',
      'Trang chủ → Đồng bộ: dữ liệu trên điện thoại và máy tính khác.',
      'Kéo một tab trên thanh để đổi vị trí.'
    ],
    restart: 'Chạy lại trợ lý thiết lập'
  }
};

const ONBOARDING_ESSENTIAL_TABS = ['calendar', 'todo', 'notes', 'news', 'patchnotes'];
const ONBOARDING_FONTS = ['Inter', 'Outfit', 'DM Sans', 'Sora', 'Nunito', 'IBM Plex Sans', 'system-ui'];
const ONBOARDING_STEPS = ['welcome', 'style', 'tabs', 'done'];

let onboardingStep = 0;

function registerOnboardingTranslations() {
  Object.keys(ONBOARDING_TRANSLATIONS).forEach((language) => {
    if (translations[language]) translations[language].onboarding = ONBOARDING_TRANSLATIONS[language];
  });
}

// Première ouverture sur cet appareil ? À appeler AVANT initData (qui écrit
// les données par défaut) : rien d'enregistré, ni données, ni apparence, ni
// synchro, ni assistant déjà vu.
function onboardingIsFirstVisit() {
  try {
    if (localStorage.getItem(ONBOARDING_KEY)) return false;
    const existing = ['mydesk-data', 'mydesk-appearance', 'mydesk-sync'].some((key) => localStorage.getItem(key));
    if (existing) {
      // Utilisateur d'avant l'assistant : on ne le lui impose pas.
      localStorage.setItem(ONBOARDING_KEY, 'existing');
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
}

function onboardingMarkDone(how) {
  try {
    localStorage.setItem(ONBOARDING_KEY, how);
  } catch (error) {
    // stockage indisponible : l'assistant reviendra, sans gravité
  }
}

function onboardingEl(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function onboardingSetAppearance(changes) {
  Object.assign(currentAppearance, changes);
  saveAppearance();
  applyAppearance();
  if (typeof syncAppearanceUI === 'function') syncAppearanceUI();
}

function onboardingSetTab(id, visible) {
  appData.tabs.visibility[id] = visible;
  applyTabVisibility();
  if (typeof renderTabVisibilitySettings === 'function') renderTabVisibilitySettings();
  saveData();
}

function onboardingRenderWelcome(body) {
  body.append(
    onboardingEl('div', 'onboarding__logo', '🗂️'),
    onboardingEl('h2', 'onboarding__title', t('onboarding.welcomeTitle')),
    onboardingEl('p', 'onboarding__text', t('onboarding.welcomeText'))
  );
  // La langue d'abord : tout l'assistant suit.
  const languages = document.querySelector('.language-switcher select');
  if (languages) {
    const row = onboardingEl('div', 'onboarding__language');
    const select = languages.cloneNode(true);
    select.removeAttribute('id');
    select.value = languages.value;
    select.addEventListener('change', () => {
      languages.value = select.value;
      languages.dispatchEvent(new Event('change', { bubbles: true }));
      onboardingRender();
    });
    row.append(select);
    body.append(row);
  }
  const sync = onboardingEl('button', 'onboarding__link', t('onboarding.welcomeSync'));
  sync.type = 'button';
  sync.addEventListener('click', () => {
    onboardingClose('sync');
    const home = document.querySelector('.tab-link[data-target="home"]');
    if (home) home.click();
    const panel = document.getElementById('sync-panel');
    if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const token = document.getElementById('sync-token');
    if (token) setTimeout(() => token.focus(), 400);
  });
  body.append(sync);
}

function onboardingRenderStyle(body) {
  body.append(
    onboardingEl('h2', 'onboarding__title', t('onboarding.styleTitle')),
    onboardingEl('p', 'onboarding__text', t('onboarding.styleText'))
  );

  body.append(onboardingEl('h3', 'onboarding__label', t('onboarding.modeLabel')));
  const modes = onboardingEl('div', 'onboarding__choices');
  ['light', 'dark', 'auto'].forEach((mode) => {
    const button = onboardingEl('button', 'onboarding__choice', t(`onboarding.modes.${mode}`));
    button.type = 'button';
    button.classList.toggle('is-active', currentAppearance.colorMode === mode);
    button.addEventListener('click', () => {
      onboardingSetAppearance({ colorMode: mode });
      onboardingRender();
    });
    modes.append(button);
  });
  body.append(modes);

  body.append(onboardingEl('h3', 'onboarding__label', t('onboarding.themeLabel')));
  const themes = onboardingEl('div', 'onboarding__themes');
  THEME_PRESETS.forEach((preset) => {
    const button = onboardingEl('button', 'onboarding__theme');
    button.type = 'button';
    button.classList.toggle('is-active', currentAppearance.themeId === preset.id);
    const dots = onboardingEl('span', 'onboarding__dots');
    (preset.dots || []).forEach((color) => {
      const dot = onboardingEl('span', 'onboarding__dot');
      dot.style.background = color;
      dots.append(dot);
    });
    button.append(dots, onboardingEl('span', '', preset.name));
    button.addEventListener('click', () => {
      onboardingSetAppearance({ themeId: preset.id, customVars: {} });
      onboardingRender();
    });
    themes.append(button);
  });
  body.append(themes);

  body.append(onboardingEl('h3', 'onboarding__label', t('onboarding.fontLabel')));
  const fonts = onboardingEl('div', 'onboarding__choices');
  ONBOARDING_FONTS.forEach((font) => {
    const button = onboardingEl('button', 'onboarding__choice', font === 'system-ui' ? 'Système' : font);
    button.type = 'button';
    button.style.fontFamily = font === 'system-ui' ? 'system-ui' : `'${font}', system-ui`;
    button.classList.toggle('is-active', currentAppearance.font === font);
    button.addEventListener('click', () => {
      onboardingSetAppearance({ font });
      onboardingRender();
    });
    fonts.append(button);
  });
  body.append(fonts);
}

function onboardingRenderTabs(body) {
  const tabs = OPTIONAL_TABS.filter((tab) => tabDisponible(tab.id));
  body.append(
    onboardingEl('h2', 'onboarding__title', t('onboarding.tabsTitle')),
    onboardingEl('p', 'onboarding__text', t('onboarding.tabsText'))
  );
  const presets = onboardingEl('div', 'onboarding__choices');
  [
    ['tabsAll', () => tabs.forEach((tab) => onboardingSetTab(tab.id, true))],
    ['tabsEssential', () => tabs.forEach((tab) => onboardingSetTab(tab.id, ONBOARDING_ESSENTIAL_TABS.includes(tab.id)))]
  ].forEach(([key, action]) => {
    const button = onboardingEl('button', 'onboarding__choice', t(`onboarding.${key}`));
    button.type = 'button';
    button.addEventListener('click', () => {
      action();
      onboardingRender();
    });
    presets.append(button);
  });
  const count = tabs.filter((tab) => getTabVisibility(tab.id)).length;
  presets.append(onboardingEl('span', 'onboarding__count', t('onboarding.tabsCount', { n: count, total: tabs.length })));
  body.append(presets);

  const grid = onboardingEl('div', 'onboarding__tabs');
  tabs.forEach((tab) => {
    const card = onboardingEl('label', 'onboarding__tab');
    const checkbox = onboardingEl('input');
    checkbox.type = 'checkbox';
    checkbox.checked = getTabVisibility(tab.id);
    card.classList.toggle('is-on', checkbox.checked);
    checkbox.addEventListener('change', () => {
      onboardingSetTab(tab.id, checkbox.checked);
      onboardingRender();
    });
    const text = onboardingEl('span', 'onboarding__tab-text');
    text.append(
      onboardingEl('strong', '', t(tab.labelKey)),
      onboardingEl('span', '', t(`onboarding.descriptions.${tab.id}`))
    );
    card.append(checkbox, text);
    grid.append(card);
  });
  body.append(grid);
}

function onboardingRenderDone(body) {
  body.append(
    onboardingEl('div', 'onboarding__logo', '🎉'),
    onboardingEl('h2', 'onboarding__title', t('onboarding.doneTitle')),
    onboardingEl('p', 'onboarding__text', t('onboarding.doneText'))
  );
  const tips = onboardingEl('ul', 'onboarding__tips');
  (translations[currentLanguage] || translations.fr).onboarding.doneTips.forEach((tip) => tips.append(onboardingEl('li', '', tip)));
  body.append(tips);
}

function onboardingRender() {
  const overlay = document.getElementById('onboarding');
  if (!overlay) return;
  const dialog = overlay.querySelector('.onboarding__dialog');
  dialog.innerHTML = '';
  const step = ONBOARDING_STEPS[onboardingStep];

  const head = onboardingEl('div', 'onboarding__head');
  const progress = onboardingEl('div', 'onboarding__progress');
  ONBOARDING_STEPS.forEach((name, index) => {
    const dot = onboardingEl('span', 'onboarding__step');
    dot.classList.toggle('is-done', index < onboardingStep);
    dot.classList.toggle('is-current', index === onboardingStep);
    progress.append(dot);
  });
  progress.setAttribute('aria-label', t('onboarding.stepOf', { n: onboardingStep + 1, total: ONBOARDING_STEPS.length }));
  head.append(progress);
  if (step !== 'done') {
    const skip = onboardingEl('button', 'onboarding__skip', t('onboarding.skip'));
    skip.type = 'button';
    skip.addEventListener('click', () => onboardingClose('skipped'));
    head.append(skip);
  }
  dialog.append(head);

  const body = onboardingEl('div', 'onboarding__body');
  if (step === 'welcome') onboardingRenderWelcome(body);
  if (step === 'style') onboardingRenderStyle(body);
  if (step === 'tabs') onboardingRenderTabs(body);
  if (step === 'done') onboardingRenderDone(body);
  dialog.append(body);

  const foot = onboardingEl('div', 'onboarding__foot');
  if (onboardingStep > 0 && step !== 'done') {
    const back = onboardingEl('button', 'onboarding__back', t('onboarding.back'));
    back.type = 'button';
    back.addEventListener('click', () => {
      onboardingStep -= 1;
      onboardingRender();
    });
    foot.append(back);
  }
  const next = onboardingEl(
    'button',
    'onboarding__next',
    t(step === 'welcome' ? 'onboarding.welcomeStart' : step === 'done' ? 'onboarding.finish' : 'onboarding.next')
  );
  next.type = 'button';
  next.addEventListener('click', () => {
    if (step === 'done') {
      onboardingClose('done');
      return;
    }
    onboardingStep += 1;
    onboardingRender();
  });
  foot.append(next);
  dialog.append(foot);
  next.focus({ preventScroll: true });
}

function onboardingOpen() {
  let overlay = document.getElementById('onboarding');
  if (!overlay) {
    overlay = onboardingEl('div', 'onboarding');
    overlay.id = 'onboarding';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.append(onboardingEl('div', 'onboarding__dialog'));
    overlay.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') onboardingClose('skipped');
    });
    document.body.append(overlay);
  }
  onboardingStep = 0;
  document.body.classList.add('onboarding-open');
  onboardingRender();
}

function onboardingClose(how) {
  onboardingMarkDone(how);
  const overlay = document.getElementById('onboarding');
  if (overlay) overlay.remove();
  document.body.classList.remove('onboarding-open');
}

function initOnboarding(firstVisit) {
  const restart = document.getElementById('onboarding-restart');
  if (restart) restart.addEventListener('click', onboardingOpen);
  if (firstVisit) onboardingOpen();
}
