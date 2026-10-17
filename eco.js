/* ═══════════════════════════════════════════════════════════
   IMPACT ÉCOLOGIQUE (Accueil)
   Ordre de grandeur des émissions de MyDesk : robot Actualités
   (serveurs GitHub + IA Gemini, tourne même app fermée), écran de
   cet appareil pendant que MyDesk est affiché, données échangées.
   Temps et données comptés sur cet appareil (localStorage, jamais
   synchronisés). Chargé avant script.js (cœur : onglets, démarrage).
   ═══════════════════════════════════════════════════════════ */

const ECO_KEY = 'mydesk-eco';

// Hypothèses (ordres de grandeur, à revoir si le robot change).
const ECO = {
  // Robot mesuré le 07/10/2026 sur les passages GitHub Actions : ≈ 28 min
  // de machine par jour (passage toutes les 15 min, ~30 s quand il n'y a
  // rien à faire) et 12 appels Gemini par jour (2 créneaux × 3 thèmes ×
  // résumé + approfondissement, longs textes en entrée).
  robotStart: '2026-10-04',
  robotRunnerMinPerDay: 28,
  runnerWatts: 30, // part d'un serveur pour une machine 4 cœurs, refroidissement compris
  geminiCallsPerDay: 12,
  geminiWhPerCall: 1, // ≈ 4× un message court (0,24 Wh selon Google), prompts de 10–18 k jetons
  serverKgPerKwh: 0.4, // électricité des centres de données (États-Unis, moyenne du réseau)
  // Ton appareil et le réseau : électricité française.
  frKgPerKwh: 0.052, // ADEME, mix moyen consommé en France
  networkKwhPerGb: 0.03,
  deviceWatts: { phone: 1.5, tablet: 4, computer: 30 },
  carKgPerKm: 0.2 // voiture thermique moyenne
};

const ECO_TICK_MS = 15000;
const ECO_MAX_GAP_MS = 60000; // appareil en veille : on ne compte pas le trou

const ECO_TRANSLATIONS = {
  fr: {
    heading: '🌱 Impact écologique (estimation)',
    month: 'Ce mois-ci : ≈ {kg} de CO₂e, soit ≈ {km} en voiture.',
    year: 'Sur un an, à ce rythme : ≈ {kg} (≈ {km} en voiture).',
    robot: 'Robot Actualités (serveurs GitHub + IA Gemini, tourne même app fermée) : ≈ {kg}',
    device: '{device} pendant {time} sur MyDesk : ≈ {kg}',
    network: 'Données échangées ({size}) : ≈ {kg}',
    phone: 'Ton téléphone',
    tablet: 'Ta tablette',
    computer: 'Ton ordinateur',
    note: 'Ordres de grandeur. Temps et données comptés sur cet appareil seulement. Hypothèses : électricité française ≈ 50 g CO₂e/kWh, serveurs ≈ 400 g, ordinateur ≈ 30 W, téléphone ≈ 1,5 W, IA ≈ 1 Wh par résumé, voiture ≈ 200 g/km. La fabrication des appareils (l’essentiel de l’empreinte du numérique) n’est pas comptée.',
    g: '{n} g',
    kg: '{n} kg',
    km: '{n} km',
    m: '{n} m',
    mb: '{n} Mo',
    hm: '{h} h {m} min',
    min: '{m} min'
  },
  en: {
    heading: '🌱 Environmental impact (estimate)',
    month: 'This month: ≈ {kg} CO₂e, about {km} by car.',
    year: 'Over a year at this pace: ≈ {kg} (≈ {km} by car).',
    robot: 'News robot (GitHub servers + Gemini AI, runs even when the app is closed): ≈ {kg}',
    device: '{device} for {time} on MyDesk: ≈ {kg}',
    network: 'Data transferred ({size}): ≈ {kg}',
    phone: 'Your phone',
    tablet: 'Your tablet',
    computer: 'Your computer',
    note: 'Orders of magnitude. Time and data counted on this device only. Assumptions: French electricity ≈ 50 g CO₂e/kWh, servers ≈ 400 g, computer ≈ 30 W, phone ≈ 1.5 W, AI ≈ 1 Wh per summary, car ≈ 200 g/km. Manufacturing of devices (most of the digital footprint) is not counted.',
    g: '{n} g',
    kg: '{n} kg',
    km: '{n} km',
    m: '{n} m',
    mb: '{n} MB',
    hm: '{h} h {m} min',
    min: '{m} min'
  }
};

function registerEcoTranslations() {
  Object.keys(translations).forEach((language) => {
    translations[language].eco = ECO_TRANSLATIONS[language] || ECO_TRANSLATIONS.fr;
  });
}

function ecoMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function ecoRead() {
  let state = null;
  try {
    state = JSON.parse(localStorage.getItem(ECO_KEY) || 'null');
  } catch (error) {
    state = null;
  }
  const month = ecoMonthKey();
  if (!state || state.month !== month) state = { month, ms: 0, bytes: 0 };
  return state;
}

function ecoWrite(state) {
  try {
    localStorage.setItem(ECO_KEY, JSON.stringify(state));
  } catch (error) {
    // Mémoire pleine : l'estimation n'est pas prioritaire.
  }
}

let ecoState = null;
let ecoVisibleSince = null;

function ecoAddTime() {
  if (ecoVisibleSince === null) return;
  const now = Date.now();
  const gap = now - ecoVisibleSince;
  ecoVisibleSince = now;
  if (gap > 0 && gap <= ECO_MAX_GAP_MS) ecoState.ms += gap;
}

function ecoSave() {
  if (!ecoState) return;
  ecoAddTime();
  if (ecoState.month !== ecoMonthKey()) ecoState = ecoRead();
  ecoWrite(ecoState);
}

function ecoDevice() {
  const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  if (!coarse) return 'computer';
  return Math.min(window.screen.width, window.screen.height) < 600 ? 'phone' : 'tablet';
}

// Jours du mois en cours déjà écoulés (le robot n'existe que depuis robotStart).
function ecoRobotDays(now = new Date()) {
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const robotStart = new Date(`${ECO.robotStart}T00:00:00`);
  const start = robotStart > monthStart ? robotStart : monthStart;
  return Math.max(0, (now - start) / 86400000);
}

function ecoEstimate() {
  const now = new Date();
  const robotKwhPerDay =
    ((ECO.robotRunnerMinPerDay / 60) * ECO.runnerWatts + ECO.geminiCallsPerDay * ECO.geminiWhPerCall) / 1000;
  const robot = robotKwhPerDay * ecoRobotDays(now) * ECO.serverKgPerKwh;
  const device = ecoDevice();
  const deviceKg = (ecoState.ms / 3600000) * (ECO.deviceWatts[device] / 1000) * ECO.frKgPerKwh;
  const networkKg = (ecoState.bytes / 1e9) * ECO.networkKwhPerGb * ECO.frKgPerKwh;
  const total = robot + deviceKg + networkKg;
  const daysInMonth = Math.max(1, (now - new Date(now.getFullYear(), now.getMonth(), 1)) / 86400000);
  return { robot, device, deviceKg, networkKg, total, perYear: (total / daysInMonth) * 365 };
}

function ecoFormatKg(kg) {
  const locale = getCurrentLocale();
  if (kg < 1) {
    const grams = kg * 1000;
    return t('eco.g', { n: grams.toLocaleString(locale, { maximumFractionDigits: grams < 10 ? 1 : 0 }) });
  }
  return t('eco.kg', { n: kg.toLocaleString(locale, { maximumFractionDigits: 1 }) });
}

function ecoFormatKm(kg) {
  const locale = getCurrentLocale();
  const km = kg / ECO.carKgPerKm;
  if (km < 1) return t('eco.m', { n: Math.round(km * 1000).toLocaleString(locale) });
  return t('eco.km', { n: km.toLocaleString(locale, { maximumFractionDigits: km < 10 ? 1 : 0 }) });
}

function ecoFormatTime(ms) {
  const minutes = Math.round(ms / 60000);
  const h = Math.floor(minutes / 60);
  return h ? t('eco.hm', { h, m: minutes % 60 }) : t('eco.min', { m: minutes });
}

function renderEco() {
  const panel = document.getElementById('eco-panel');
  if (!panel || !ecoState) return;
  const home = document.getElementById('home');
  if (home && !home.classList.contains('active')) return;
  ecoAddTime();
  const e = ecoEstimate();
  const locale = getCurrentLocale();
  const mb = (ecoState.bytes / (1024 * 1024)).toLocaleString(locale, { maximumFractionDigits: 1 });
  document.getElementById('eco-month').textContent = t('eco.month', { kg: ecoFormatKg(e.total), km: ecoFormatKm(e.total) });
  document.getElementById('eco-year').textContent = t('eco.year', { kg: ecoFormatKg(e.perYear), km: ecoFormatKm(e.perYear) });
  const parts = document.getElementById('eco-parts');
  parts.innerHTML = '';
  [
    t('eco.robot', { kg: ecoFormatKg(e.robot) }),
    t('eco.device', { device: t(`eco.${e.device}`), time: ecoFormatTime(ecoState.ms), kg: ecoFormatKg(e.deviceKg) }),
    t('eco.network', { size: t('eco.mb', { n: mb }), kg: ecoFormatKg(e.networkKg) })
  ].forEach((text) => {
    const li = document.createElement('li');
    li.textContent = text;
    parts.appendChild(li);
  });
}

// Octets réellement téléchargés (0 pour ce qui sort du cache).
function ecoWatchNetwork() {
  if (typeof PerformanceObserver !== 'function') return;
  const add = (entries) => {
    entries.forEach((entry) => {
      if (entry.transferSize > 0) ecoState.bytes += entry.transferSize;
    });
  };
  try {
    new PerformanceObserver((list) => add(list.getEntries())).observe({ type: 'resource', buffered: true });
    add(performance.getEntriesByType('navigation'));
  } catch (error) {
    // Navigateur sans Resource Timing : réseau non compté.
  }
}

function initEco() {
  ecoState = ecoRead();
  if (document.visibilityState === 'visible') ecoVisibleSince = Date.now();
  ecoWatchNetwork();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      ecoVisibleSince = Date.now();
      renderEco();
    } else {
      ecoSave();
      ecoVisibleSince = null;
    }
  });
  window.addEventListener('pagehide', ecoSave);
  setInterval(() => {
    if (document.visibilityState === 'visible') ecoSave();
  }, ECO_TICK_MS);
  renderEco();
}
