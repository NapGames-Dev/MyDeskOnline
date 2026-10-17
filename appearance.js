/* ═══════════════════════════════════════════════════════════
   APPEARANCE SYSTEM
   Stored in localStorage under 'mydesk-appearance'
   Completely independent from appData / saveData()
   Chargé avant script.js (cœur : données, traductions, onglets, démarrage).
   ═══════════════════════════════════════════════════════════ */

const APPEARANCE_KEY = 'mydesk-appearance';

const THEME_PRESETS = [
  {
    id: 'classic',
    name: 'Classique',
    vars: {
      '--primary': '#4e73df',
      '--primary-light': '#6c8dff',
      '--accent': '#6c47ff',
      '--background': '#f4f6fb',
      '--surface': '#ffffff',
      '--text': '#1f2937',
      '--border': '#d1d5db',
      '--header-bg': '#ffffff'
    },
    dots: ['#4e73df', '#f4f6fb', '#ffffff']
  },
  {
    id: 'emerald',
    name: 'Émeraude',
    vars: {
      '--primary': '#059669',
      '--primary-light': '#10b981',
      '--accent': '#0d9488',
      '--background': '#f0fdf4',
      '--surface': '#ffffff',
      '--text': '#064e3b',
      '--border': '#bbf7d0',
      '--header-bg': '#ffffff'
    },
    dots: ['#059669', '#f0fdf4', '#bbf7d0']
  },
  {
    id: 'rose',
    name: 'Rose',
    vars: {
      '--primary': '#e11d48',
      '--primary-light': '#fb7185',
      '--accent': '#db2777',
      '--background': '#fff1f2',
      '--surface': '#ffffff',
      '--text': '#881337',
      '--border': '#fecdd3',
      '--header-bg': '#ffffff'
    },
    dots: ['#e11d48', '#fff1f2', '#fecdd3']
  },
  {
    id: 'amber',
    name: 'Ambre',
    vars: {
      '--primary': '#d97706',
      '--primary-light': '#f59e0b',
      '--accent': '#b45309',
      '--background': '#fffbeb',
      '--surface': '#ffffff',
      '--text': '#78350f',
      '--border': '#fde68a',
      '--header-bg': '#ffffff'
    },
    dots: ['#d97706', '#fffbeb', '#fde68a']
  },
  {
    id: 'midnight',
    name: 'Minuit',
    vars: {
      '--primary': '#818cf8',
      '--primary-light': '#a5b4fc',
      '--accent': '#c084fc',
      '--background': '#0f172a',
      '--surface': '#1e293b',
      '--text': '#e2e8f0',
      '--border': '#334155',
      '--header-bg': '#1e293b'
    },
    dots: ['#818cf8', '#0f172a', '#1e293b']
  },
  {
    id: 'forest',
    name: 'Forêt',
    vars: {
      '--primary': '#16a34a',
      '--primary-light': '#22c55e',
      '--accent': '#15803d',
      '--background': '#f8fafc',
      '--surface': '#ffffff',
      '--text': '#14532d',
      '--border': '#d1fae5',
      '--header-bg': '#f0fdf4'
    },
    dots: ['#16a34a', '#f8fafc', '#f0fdf4']
  },
  {
    id: 'ocean',
    name: 'Océan',
    vars: {
      '--primary': '#0284c7',
      '--primary-light': '#38bdf8',
      '--accent': '#0ea5e9',
      '--background': '#f0f9ff',
      '--surface': '#ffffff',
      '--text': '#0c4a6e',
      '--border': '#bae6fd',
      '--header-bg': '#e0f2fe'
    },
    dots: ['#0284c7', '#f0f9ff', '#bae6fd']
  },
  {
    id: 'slate',
    name: 'Ardoise',
    vars: {
      '--primary': '#475569',
      '--primary-light': '#64748b',
      '--accent': '#334155',
      '--background': '#f8fafc',
      '--surface': '#ffffff',
      '--text': '#0f172a',
      '--border': '#e2e8f0',
      '--header-bg': '#f1f5f9'
    },
    dots: ['#475569', '#f8fafc', '#f1f5f9']
  }
];

const DEFAULT_APPEARANCE = {
  themeId: 'classic',
  colorMode: 'light',
  customVars: {},
  font: 'Inter',
  fontSize: 16,
  borderRadius: 8,
  density: 'normal'
};

let currentAppearance = { ...DEFAULT_APPEARANCE };

function loadAppearance() {
  try {
    const raw = localStorage.getItem(APPEARANCE_KEY);
    if (raw) {
      currentAppearance = { ...DEFAULT_APPEARANCE, ...JSON.parse(raw) };
    }
  } catch (e) {
    currentAppearance = { ...DEFAULT_APPEARANCE };
  }
}

function saveAppearance() {
  try {
    localStorage.setItem(APPEARANCE_KEY, JSON.stringify(currentAppearance));
  } catch (e) { /* silent */ }
}

function applyColorMode(mode) {
  const html = document.documentElement;
  if (mode === 'dark') {
    html.setAttribute('data-theme', 'dark');
  } else if (mode === 'light') {
    html.setAttribute('data-theme', 'light');
  } else {
    // auto: follow system
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }
}

function applyThemeVars(vars) {
  const root = document.documentElement;
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

// Couleurs de fond/texte gérées par le mode sombre ([data-theme="dark"] dans styles.css).
const DARK_MODE_SURFACE_VARS = ['--background', '--surface', '--text', '--border', '--header-bg'];

function isLightColor(hex) {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(String(hex || '').trim());
  if (!m) return true;
  const [r, g, b] = m.slice(1).map((x) => parseInt(x, 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.5;
}

function applyAppearance() {
  const a = currentAppearance;

  // Color mode
  applyColorMode(a.colorMode);
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  // Base theme. En mode sombre, un thème clair ne garde que ses couleurs
  // d'accent : ses fonds et son texte clairs, écrits en style inline sur
  // :root, écrasaient les variables du mode sombre (page claire, texte sombre
  // sur fond sombre dans l'agenda...).
  const preset = THEME_PRESETS.find(p => p.id === a.themeId);
  const keepDarkSurfaces = isDark && (!preset || isLightColor(preset.vars['--background']));
  const withoutSurfaces = (vars) => Object.fromEntries(
    Object.entries(vars).filter(([key]) => !DARK_MODE_SURFACE_VARS.includes(key))
  );
  if (keepDarkSurfaces) {
    DARK_MODE_SURFACE_VARS.forEach((key) => document.documentElement.style.removeProperty(key));
  }
  if (preset) {
    applyThemeVars(keepDarkSurfaces ? withoutSurfaces(preset.vars) : preset.vars);
  }

  // Custom overrides
  if (a.customVars && Object.keys(a.customVars).length) {
    applyThemeVars(keepDarkSurfaces ? withoutSurfaces(a.customVars) : a.customVars);
  }

  // Font
  const fontStack = a.font === 'system-ui'
    ? 'system-ui, sans-serif'
    : `'${a.font}', system-ui, sans-serif`;
  document.documentElement.style.setProperty('--font-family', fontStack);
  document.body.style.fontFamily = fontStack;

  // Font size
  document.documentElement.style.fontSize = `${a.fontSize}px`;

  // Border radius
  document.documentElement.style.setProperty('--radius-base', `${a.borderRadius}px`);

  // Density
  document.body.setAttribute('data-density', a.density);
}

function getEffectiveColorFromVar(varName) {
  const preset = THEME_PRESETS.find(p => p.id === currentAppearance.themeId);
  if (currentAppearance.customVars && currentAppearance.customVars[varName]) {
    return currentAppearance.customVars[varName];
  }
  if (preset && preset.vars[varName]) {
    return preset.vars[varName];
  }
  const defaults = THEME_PRESETS.find(p => p.id === 'classic');
  return defaults ? defaults.vars[varName] || '#000000' : '#000000';
}

function syncAppearanceUI() {
  const a = currentAppearance;

  // Preset buttons
  document.querySelectorAll('.theme-preset-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.preset === a.themeId);
  });

  // Color mode buttons
  document.querySelectorAll('.color-mode-btn[data-mode]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === a.colorMode);
  });

  // Density buttons
  document.querySelectorAll('.color-mode-btn[data-density]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.density === a.density);
  });

  // Color pickers
  document.querySelectorAll('.color-pick').forEach(input => {
    const varName = input.dataset.var;
    if (varName) {
      input.value = getEffectiveColorFromVar(varName);
    }
  });

  // Font buttons
  document.querySelectorAll('.font-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.font === a.font);
  });

  // Font size slider
  const fsSlider = document.getElementById('font-size-slider');
  const fsValue = document.getElementById('font-size-value');
  if (fsSlider) fsSlider.value = a.fontSize;
  if (fsValue) fsValue.textContent = `${a.fontSize}px`;

  // Border radius slider
  const radSlider = document.getElementById('radius-slider');
  const radValue = document.getElementById('radius-value');
  if (radSlider) radSlider.value = a.borderRadius;
  if (radValue) radValue.textContent = `${a.borderRadius}px`;
}

function buildThemePresets() {
  const container = document.getElementById('theme-presets');
  if (!container) return;
  container.innerHTML = '';
  THEME_PRESETS.forEach(preset => {
    const btn = document.createElement('button');
    btn.className = 'theme-preset-btn';
    btn.dataset.preset = preset.id;
    btn.innerHTML = `
      <div class="preset-swatch">
        ${preset.dots.map(c => `<div class="preset-dot" style="background:${c}"></div>`).join('')}
      </div>
      <span>${preset.name}</span>
    `;
    btn.addEventListener('click', () => {
      currentAppearance.themeId = preset.id;
      currentAppearance.customVars = {};
      saveAppearance();
      applyAppearance();
      syncAppearanceUI();
    });
    container.appendChild(btn);
  });
}

function initAppearance() {
  loadAppearance();
  applyAppearance();
  buildThemePresets();
  syncAppearanceUI();

  // System dark mode listener
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', () => {
    if (currentAppearance.colorMode === 'auto') {
      applyAppearance();
    }
  });

  // Color mode buttons
  document.querySelectorAll('.color-mode-btn[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentAppearance.colorMode = btn.dataset.mode;
      saveAppearance();
      applyAppearance();
      syncAppearanceUI();
    });
  });

  // Density buttons
  document.querySelectorAll('.color-mode-btn[data-density]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentAppearance.density = btn.dataset.density;
      saveAppearance();
      applyAppearance();
      syncAppearanceUI();
    });
  });

  // Color pickers
  document.querySelectorAll('.color-pick').forEach(input => {
    input.addEventListener('input', () => {
      const varName = input.dataset.var;
      if (!currentAppearance.customVars) currentAppearance.customVars = {};
      currentAppearance.customVars[varName] = input.value;
      document.documentElement.style.setProperty(varName, input.value);
      saveAppearance();
    });
  });

  // Reset color buttons
  document.querySelectorAll('.reset-color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const varName = btn.dataset.var;
      if (currentAppearance.customVars) {
        delete currentAppearance.customVars[varName];
      }
      saveAppearance();
      applyAppearance();
      syncAppearanceUI();
    });
  });

  // Font buttons
  document.querySelectorAll('.font-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentAppearance.font = btn.dataset.font;
      saveAppearance();
      applyAppearance();
      syncAppearanceUI();
    });
  });

  // Font size slider
  const fsSlider = document.getElementById('font-size-slider');
  const fsValue = document.getElementById('font-size-value');
  if (fsSlider) {
    fsSlider.addEventListener('input', () => {
      currentAppearance.fontSize = Number(fsSlider.value);
      if (fsValue) fsValue.textContent = `${currentAppearance.fontSize}px`;
      document.documentElement.style.fontSize = `${currentAppearance.fontSize}px`;
      saveAppearance();
    });
  }

  // Border radius slider
  const radSlider = document.getElementById('radius-slider');
  const radValue = document.getElementById('radius-value');
  if (radSlider) {
    radSlider.addEventListener('input', () => {
      currentAppearance.borderRadius = Number(radSlider.value);
      if (radValue) radValue.textContent = `${currentAppearance.borderRadius}px`;
      document.documentElement.style.setProperty('--radius-base', `${currentAppearance.borderRadius}px`);
      saveAppearance();
    });
  }

  // Reset all
  const resetBtn = document.getElementById('reset-appearance');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      currentAppearance = { ...DEFAULT_APPEARANCE };
      saveAppearance();
      applyAppearance();
      syncAppearanceUI();
    });
  }
}
