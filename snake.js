/* ═══════════════════════════════════════════════════════════
   ONGLET SNAKE
   Jeu sur canvas : 7 modes + défi du jour, réglages (vitesse,
   plateau, nombre de pommes, couleurs du serpent et du terrain),
   mouvement fluide interpolé entre deux pas, effets (particules,
   secousse), sons synthétisés en Web Audio (aucun fichier),
   musique qui suit la vitesse, trophées et statistiques.
   Données : appData.snake = { bestScore (ancien record),
   best[mode:plateau:vitesse], stats, daily[date], trophies[id],
   settings (propres à l'appareil, jamais synchronisés) }.
   ═══════════════════════════════════════════════════════════ */

const SNAKE_DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};
const SNAKE_OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };
const SNAKE_KEYMAP = {
  arrowup: 'up', z: 'up', w: 'up',
  arrowdown: 'down', s: 'down',
  arrowleft: 'left', q: 'left', a: 'left',
  arrowright: 'right', d: 'right'
};

const SNAKE_MODES = [
  { id: 'classic', icon: '🐍' },
  { id: 'wrap', icon: '🌀' },
  { id: 'walls', icon: '🧱' },
  { id: 'portal', icon: '🔮' },
  { id: 'poison', icon: '☠️' },
  { id: 'timeattack', icon: '⏱️' },
  { id: 'zen', icon: '🍃' }
];
const SNAKE_SPEEDS = { slow: 175, normal: 130, fast: 92, turbo: 150 };
const SNAKE_TURBO_MIN_MS = 62;
const SNAKE_TURBO_STEP_MS = 3.5;
const SNAKE_SIZES = {
  small: { cols: 10, rows: 9 },
  medium: { cols: 17, rows: 15 },
  large: { cols: 24, rows: 21 }
};
const SNAKE_APPLE_CHOICES = [1, 3, 5];
const SNAKE_TIME_ATTACK_MS = 60000;
const SNAKE_CLOCK_BONUS_MS = 5000;
const SNAKE_GOLDEN_MS = 7000;
const SNAKE_GOLDEN_CHANCE = 0.12;
const SNAKE_CLOCK_CHANCE = 0.3;
const SNAKE_DAILY_KEEP = 60;
const SNAKE_DEFAULT_SETTINGS = {
  mode: 'classic',
  speed: 'normal',
  size: 'medium',
  apples: 1,
  skin: 'azur',
  theme: 'prairie',
  sound: true,
  music: false,
  volume: 0.7
};

const SNAKE_SKINS = {
  azur: { from: '#5b8def', to: '#2a52c9' },
  emeraude: { from: '#4ade80', to: '#15803d' },
  corail: { from: '#fb7185', to: '#be123c' },
  violet: { from: '#c084fc', to: '#6d28d9' },
  or: { from: '#fcd34d', to: '#d97706' },
  neon: { from: '#22d3ee', to: '#d946ef', glow: true },
  arcenciel: { from: '#f43f5e', to: '#8b5cf6', rainbow: true }
};
const SNAKE_THEMES = {
  prairie: { light: '#aad751', dark: '#a2d149', frame: '#578a34', wall: '#795548', wallTop: '#a1887f' },
  nuit: { light: '#121c33', dark: '#0e172b', frame: '#070d1a', wall: '#334155', wallTop: '#64748b', glow: true },
  sable: { light: '#f3dcab', dark: '#ebd19b', frame: '#b8894d', wall: '#9a6a32', wallTop: '#c99a5b' },
  banquise: { light: '#e8f3fb', dark: '#d9eaf6', frame: '#5b8db8', wall: '#64748b', wallTop: '#a3b5c9' }
};

// Défi du jour : même tirage pour toute la journée (mode, vitesse, obstacles, pommes).
const SNAKE_DAILY_MODES = ['classic', 'wrap', 'walls', 'portal', 'poison', 'timeattack'];
const SNAKE_DAILY_GOALS = { classic: 20, wrap: 25, walls: 15, portal: 20, poison: 15, timeattack: 18 };

const SNAKE_TROPHIES = [
  { id: 'first', icon: '🍎', test: (g) => g.eaten >= 1 },
  { id: 'ten', icon: '🍽️', test: (g) => g.eaten >= 10 },
  { id: 'twentyfive', icon: '😋', test: (g) => g.eaten >= 25 },
  { id: 'fifty', icon: '🐉', test: (g) => g.eaten >= 50 },
  { id: 'golden', icon: '🌟', test: (g) => g.goldens >= 1 },
  { id: 'combo5', icon: '⚡', test: (g) => g.bestCombo >= 5 },
  { id: 'combo10', icon: '🔥', test: (g) => g.bestCombo >= 10 },
  { id: 'portal', icon: '🌀', test: (g) => g.teleports >= 10 },
  { id: 'chrono', icon: '⏱️', test: (g) => g.mode === 'timeattack' && g.eaten >= 20 },
  { id: 'turbo', icon: '🏎️', test: (g) => g.speed === 'turbo' && g.eaten >= 20 },
  { id: 'zen', icon: '🧘', test: (g) => g.mode === 'zen' && g.time >= 180000 },
  { id: 'win', icon: '👑', test: (g) => g.won },
  { id: 'explorer', icon: '🧭', test: (g, d) => SNAKE_MODES.every((m) => d.stats.modes[m.id]) },
  { id: 'daily', icon: '📅', test: (g, d) => snakeDailyDoneCount(d) >= 1 },
  { id: 'dailyStreak', icon: '🗓️', test: (g, d) => snakeDailyStreak(d) >= 3 }
];

const SNAKE_TRANSLATIONS = {
  fr: {
    title: 'Snake',
    subtitle: 'Mange, grandis, ne te mords pas la queue.',
    play: '▶ Jouer',
    replay: '↻ Rejouer',
    resume: '▶ Reprendre',
    restart: '↻ Recommencer',
    end: '⏹ Terminer',
    menu: '☰ Menu',
    pause: 'Pause (Espace)',
    soundOn: 'Sons activés (M)',
    soundOff: 'Sons coupés (M)',
    musicOn: 'Musique activée',
    musicOff: 'Musique coupée',
    backToMenu: 'Retour au menu',
    score: 'Pommes',
    best: 'Record',
    timer: 'Temps restant',
    combo: 'Combo ×{n}',
    canvasLabel: 'Plateau de Snake',
    demo: 'Démo',
    modeTitle: 'Mode',
    optionsTitle: 'Réglages',
    soundTitle: 'Son',
    speed: 'Vitesse',
    size: 'Plateau',
    apples: 'Pommes',
    skin: 'Serpent',
    theme: 'Terrain',
    sound: 'Bruitages',
    music: 'Musique',
    volume: 'Volume',
    speeds: { slow: 'Lent', normal: 'Normal', fast: 'Rapide', turbo: 'Turbo' },
    turboHint: 'Turbo : accélère à chaque pomme.',
    sizes: { small: 'Petit', medium: 'Moyen', large: 'Grand' },
    skins: { azur: 'Azur', emeraude: 'Émeraude', corail: 'Corail', violet: 'Améthyste', or: 'Or', neon: 'Néon', arcenciel: 'Arc-en-ciel' },
    themes: { prairie: 'Prairie', nuit: 'Nuit', sable: 'Désert', banquise: 'Banquise' },
    modes: {
      classic: { name: 'Classique', desc: 'Les bords sont des murs. Le Snake de toujours.' },
      wrap: { name: 'Sans bords', desc: 'Sors d’un côté, reviens par l’autre.' },
      walls: { name: 'Murs', desc: 'Chaque pomme fait pousser un mur quelque part.' },
      portal: { name: 'Portails', desc: 'Entre dans un portail, ressors par l’autre. Ils bougent toutes les 5 pommes.' },
      poison: { name: 'Poison', desc: 'Évite les pommes violettes : elles changent de place à chaque bouchée.' },
      timeattack: { name: 'Chrono', desc: '60 secondes pour manger un max. Les horloges donnent +5 s.' },
      zen: { name: 'Zen', desc: 'Aucune collision, aucune pression : on traverse tout.' }
    },
    bestShort: 'Record {score}',
    noBest: 'Pas encore joué',
    daily: {
      title: 'Défi du jour',
      goal: 'Objectif : {goal} 🍎',
      best: 'Ton meilleur aujourd’hui : {score}',
      done: 'Réussi ✅',
      go: 'Relever le défi',
      streak: 'Série : {n} j 🔥',
      obstacles: 'avec obstacles',
      progress: 'Défi : {score} / {goal} 🍎',
      reached: 'Objectif atteint ✅',
      missing: 'Encore {n} pomme(s) pour réussir le défi.'
    },
    ready: 'Appuie sur une flèche pour partir',
    readyTouch: 'Glisse le doigt pour partir',
    paused: 'Pause',
    reasons: {
      wall: 'Boum, dans le mur !',
      self: 'Tu t’es mordu la queue !',
      poison: 'Empoisonné !',
      time: 'Temps écoulé !',
      win: 'Plateau rempli, incroyable !',
      quit: 'Partie terminée'
    },
    newRecord: '🏆 Nouveau record !',
    recordWas: 'Record : {best}',
    resultMeta: 'Longueur {length} · {time} · combo max ×{combo}',
    replayHint: 'Entrée pour rejouer · Échap pour le menu',
    trophyUnlocked: 'Trophée débloqué : {name}',
    trophiesTitle: 'Trophées ({count}/{total})',
    statsTitle: 'Statistiques',
    stats: {
      games: 'Parties',
      apples: 'Pommes mangées',
      longest: 'Plus long serpent',
      time: 'Temps de jeu',
      dailyDone: 'Défis du jour réussis'
    },
    trophies: {
      first: { name: 'Première bouchée', desc: 'Manger une pomme.' },
      ten: { name: 'Bon appétit', desc: '10 pommes dans une partie.' },
      twentyfive: { name: 'Gourmand', desc: '25 pommes dans une partie.' },
      fifty: { name: 'Anaconda', desc: '50 pommes dans une partie.' },
      golden: { name: 'Ruée vers l’or', desc: 'Manger une pomme dorée.' },
      combo5: { name: 'Enchaînement', desc: 'Atteindre un combo ×5.' },
      combo10: { name: 'Inarrêtable', desc: 'Atteindre un combo ×10.' },
      portal: { name: 'Voyageur', desc: '10 passages de portail dans une partie.' },
      chrono: { name: 'Contre la montre', desc: '20 pommes en Chrono.' },
      turbo: { name: 'Pied au plancher', desc: '20 pommes en Turbo.' },
      zen: { name: 'Lâcher prise', desc: 'Jouer 3 minutes en Zen.' },
      win: { name: 'Plateau rempli', desc: 'Remplir tout le plateau.' },
      explorer: { name: 'Explorateur', desc: 'Jouer à tous les modes.' },
      daily: { name: 'Défi relevé', desc: 'Réussir un défi du jour.' },
      dailyStreak: { name: 'Assidu', desc: 'Réussir le défi du jour 3 jours de suite.' }
    },
    controls: 'Flèches, ZQSD ou WASD pour diriger · Espace : pause · M : son',
    controlsTouch: 'Glisse sur le plateau ou utilise les flèches ci-dessous.',
    golden: 'Pomme dorée',
    dpad: { up: 'Haut', down: 'Bas', left: 'Gauche', right: 'Droite' },
    live: { length: 'Longueur', combo: 'Combo max', time: 'Temps' },
    announceOver: 'Partie terminée : {score} pommes.'
  },
  en: {
    title: 'Snake',
    subtitle: 'Eat, grow, don’t bite your own tail.',
    play: '▶ Play',
    replay: '↻ Play again',
    resume: '▶ Resume',
    restart: '↻ Restart',
    end: '⏹ End game',
    menu: '☰ Menu',
    pause: 'Pause (Space)',
    soundOn: 'Sound on (M)',
    soundOff: 'Sound off (M)',
    musicOn: 'Music on',
    musicOff: 'Music off',
    backToMenu: 'Back to menu',
    score: 'Apples',
    best: 'Best',
    timer: 'Time left',
    combo: 'Combo ×{n}',
    canvasLabel: 'Snake board',
    demo: 'Demo',
    modeTitle: 'Mode',
    optionsTitle: 'Settings',
    soundTitle: 'Sound',
    speed: 'Speed',
    size: 'Board',
    apples: 'Apples',
    skin: 'Snake',
    theme: 'Field',
    sound: 'Effects',
    music: 'Music',
    volume: 'Volume',
    speeds: { slow: 'Slow', normal: 'Normal', fast: 'Fast', turbo: 'Turbo' },
    turboHint: 'Turbo: speeds up with every apple.',
    sizes: { small: 'Small', medium: 'Medium', large: 'Large' },
    skins: { azur: 'Azure', emeraude: 'Emerald', corail: 'Coral', violet: 'Amethyst', or: 'Gold', neon: 'Neon', arcenciel: 'Rainbow' },
    themes: { prairie: 'Meadow', nuit: 'Night', sable: 'Desert', banquise: 'Ice' },
    modes: {
      classic: { name: 'Classic', desc: 'The edges are walls. Snake as you know it.' },
      wrap: { name: 'No borders', desc: 'Leave on one side, come back on the other.' },
      walls: { name: 'Walls', desc: 'Every apple grows a wall somewhere.' },
      portal: { name: 'Portals', desc: 'Enter one portal, exit the other. They move every 5 apples.' },
      poison: { name: 'Poison', desc: 'Avoid the purple apples: they move with every bite.' },
      timeattack: { name: 'Time attack', desc: '60 seconds to eat as much as you can. Clocks give +5 s.' },
      zen: { name: 'Zen', desc: 'No collisions, no pressure: go through everything.' }
    },
    bestShort: 'Best {score}',
    noBest: 'Not played yet',
    daily: {
      title: 'Daily challenge',
      goal: 'Goal: {goal} 🍎',
      best: 'Your best today: {score}',
      done: 'Done ✅',
      go: 'Take the challenge',
      streak: 'Streak: {n} d 🔥',
      obstacles: 'with obstacles',
      progress: 'Challenge: {score} / {goal} 🍎',
      reached: 'Goal reached ✅',
      missing: '{n} more apple(s) to beat the challenge.'
    },
    ready: 'Press an arrow key to start',
    readyTouch: 'Swipe to start',
    paused: 'Paused',
    reasons: {
      wall: 'Bonk, into the wall!',
      self: 'You bit your own tail!',
      poison: 'Poisoned!',
      time: 'Time’s up!',
      win: 'Board filled, incredible!',
      quit: 'Game over'
    },
    newRecord: '🏆 New best!',
    recordWas: 'Best: {best}',
    resultMeta: 'Length {length} · {time} · best combo ×{combo}',
    replayHint: 'Enter to play again · Esc for the menu',
    trophyUnlocked: 'Trophy unlocked: {name}',
    trophiesTitle: 'Trophies ({count}/{total})',
    statsTitle: 'Statistics',
    stats: {
      games: 'Games',
      apples: 'Apples eaten',
      longest: 'Longest snake',
      time: 'Time played',
      dailyDone: 'Daily challenges beaten'
    },
    trophies: {
      first: { name: 'First bite', desc: 'Eat an apple.' },
      ten: { name: 'Bon appétit', desc: '10 apples in one game.' },
      twentyfive: { name: 'Hungry', desc: '25 apples in one game.' },
      fifty: { name: 'Anaconda', desc: '50 apples in one game.' },
      golden: { name: 'Gold rush', desc: 'Eat a golden apple.' },
      combo5: { name: 'Chain', desc: 'Reach a ×5 combo.' },
      combo10: { name: 'Unstoppable', desc: 'Reach a ×10 combo.' },
      portal: { name: 'Traveller', desc: '10 portal trips in one game.' },
      chrono: { name: 'Against the clock', desc: '20 apples in Time attack.' },
      turbo: { name: 'Pedal to the metal', desc: '20 apples in Turbo.' },
      zen: { name: 'Let it go', desc: 'Play Zen for 3 minutes.' },
      win: { name: 'Full board', desc: 'Fill the whole board.' },
      explorer: { name: 'Explorer', desc: 'Play every mode.' },
      daily: { name: 'Challenge accepted', desc: 'Beat a daily challenge.' },
      dailyStreak: { name: 'Dedicated', desc: 'Beat the daily challenge 3 days in a row.' }
    },
    controls: 'Arrows or WASD to steer · Space: pause · M: sound',
    controlsTouch: 'Swipe on the board or use the arrows below.',
    golden: 'Golden apple',
    dpad: { up: 'Up', down: 'Down', left: 'Left', right: 'Right' },
    live: { length: 'Length', combo: 'Best combo', time: 'Time' },
    announceOver: 'Game over: {score} apples.'
  },
  vi: {
    title: 'Rắn',
    subtitle: 'Ăn, lớn lên, đừng cắn vào đuôi mình.',
    play: '▶ Chơi',
    replay: '↻ Chơi lại',
    resume: '▶ Tiếp tục',
    restart: '↻ Bắt đầu lại',
    end: '⏹ Kết thúc',
    menu: '☰ Menu',
    pause: 'Tạm dừng (Space)',
    soundOn: 'Bật âm thanh (M)',
    soundOff: 'Tắt âm thanh (M)',
    musicOn: 'Bật nhạc',
    musicOff: 'Tắt nhạc',
    backToMenu: 'Về menu',
    score: 'Táo',
    best: 'Kỷ lục',
    timer: 'Thời gian còn lại',
    combo: 'Combo ×{n}',
    canvasLabel: 'Bàn chơi Rắn',
    demo: 'Demo',
    modeTitle: 'Chế độ',
    optionsTitle: 'Cài đặt',
    soundTitle: 'Âm thanh',
    speed: 'Tốc độ',
    size: 'Bàn chơi',
    apples: 'Táo',
    skin: 'Rắn',
    theme: 'Nền',
    sound: 'Hiệu ứng',
    music: 'Nhạc',
    volume: 'Âm lượng',
    speeds: { slow: 'Chậm', normal: 'Thường', fast: 'Nhanh', turbo: 'Turbo' },
    turboHint: 'Turbo: nhanh dần sau mỗi quả táo.',
    sizes: { small: 'Nhỏ', medium: 'Vừa', large: 'Lớn' },
    skins: { azur: 'Xanh dương', emeraude: 'Ngọc lục bảo', corail: 'San hô', violet: 'Thạch anh tím', or: 'Vàng', neon: 'Neon', arcenciel: 'Cầu vồng' },
    themes: { prairie: 'Đồng cỏ', nuit: 'Ban đêm', sable: 'Sa mạc', banquise: 'Băng' },
    modes: {
      classic: { name: 'Cổ điển', desc: 'Mép bàn là tường. Rắn như ngày xưa.' },
      wrap: { name: 'Không biên', desc: 'Ra một bên, vào lại bên kia.' },
      walls: { name: 'Tường', desc: 'Mỗi quả táo làm mọc một bức tường.' },
      portal: { name: 'Cổng dịch chuyển', desc: 'Vào một cổng, ra cổng kia. Cổng đổi chỗ sau mỗi 5 quả táo.' },
      poison: { name: 'Táo độc', desc: 'Tránh táo tím: chúng đổi chỗ sau mỗi lần ăn.' },
      timeattack: { name: 'Tính giờ', desc: '60 giây để ăn nhiều nhất có thể. Đồng hồ cho thêm 5 giây.' },
      zen: { name: 'Thư giãn', desc: 'Không va chạm, không áp lực: đi xuyên qua mọi thứ.' }
    },
    bestShort: 'Kỷ lục {score}',
    noBest: 'Chưa chơi',
    daily: {
      title: 'Thử thách hôm nay',
      goal: 'Mục tiêu: {goal} 🍎',
      best: 'Tốt nhất hôm nay: {score}',
      done: 'Hoàn thành ✅',
      go: 'Nhận thử thách',
      streak: 'Chuỗi: {n} ngày 🔥',
      obstacles: 'có chướng ngại',
      progress: 'Thử thách: {score} / {goal} 🍎',
      reached: 'Đạt mục tiêu ✅',
      missing: 'Còn {n} quả táo nữa để hoàn thành.'
    },
    ready: 'Nhấn phím mũi tên để bắt đầu',
    readyTouch: 'Vuốt để bắt đầu',
    paused: 'Tạm dừng',
    reasons: {
      wall: 'Bốp, đâm vào tường!',
      self: 'Bạn cắn vào đuôi mình!',
      poison: 'Trúng độc!',
      time: 'Hết giờ!',
      win: 'Kín cả bàn, quá đỉnh!',
      quit: 'Kết thúc ván'
    },
    newRecord: '🏆 Kỷ lục mới!',
    recordWas: 'Kỷ lục: {best}',
    resultMeta: 'Dài {length} · {time} · combo cao nhất ×{combo}',
    replayHint: 'Enter để chơi lại · Esc để về menu',
    trophyUnlocked: 'Mở khóa cúp: {name}',
    trophiesTitle: 'Cúp ({count}/{total})',
    statsTitle: 'Thống kê',
    stats: {
      games: 'Số ván',
      apples: 'Táo đã ăn',
      longest: 'Rắn dài nhất',
      time: 'Thời gian chơi',
      dailyDone: 'Thử thách đã hoàn thành'
    },
    trophies: {
      first: { name: 'Miếng đầu tiên', desc: 'Ăn một quả táo.' },
      ten: { name: 'Chúc ngon miệng', desc: '10 quả táo trong một ván.' },
      twentyfive: { name: 'Háu ăn', desc: '25 quả táo trong một ván.' },
      fifty: { name: 'Trăn khổng lồ', desc: '50 quả táo trong một ván.' },
      golden: { name: 'Cơn sốt vàng', desc: 'Ăn một quả táo vàng.' },
      combo5: { name: 'Liên hoàn', desc: 'Đạt combo ×5.' },
      combo10: { name: 'Không thể cản', desc: 'Đạt combo ×10.' },
      portal: { name: 'Lữ khách', desc: '10 lần qua cổng trong một ván.' },
      chrono: { name: 'Chạy đua thời gian', desc: '20 quả táo ở chế độ Tính giờ.' },
      turbo: { name: 'Hết ga', desc: '20 quả táo ở tốc độ Turbo.' },
      zen: { name: 'Buông bỏ', desc: 'Chơi Thư giãn 3 phút.' },
      win: { name: 'Kín bàn', desc: 'Lấp đầy cả bàn chơi.' },
      explorer: { name: 'Nhà thám hiểm', desc: 'Chơi tất cả các chế độ.' },
      daily: { name: 'Nhận lời thách đấu', desc: 'Hoàn thành một thử thách hôm nay.' },
      dailyStreak: { name: 'Chăm chỉ', desc: 'Hoàn thành thử thách 3 ngày liên tiếp.' }
    },
    controls: 'Phím mũi tên hoặc WASD để điều khiển · Space: tạm dừng · M: âm thanh',
    controlsTouch: 'Vuốt trên bàn chơi hoặc dùng các mũi tên bên dưới.',
    golden: 'Táo vàng',
    dpad: { up: 'Lên', down: 'Xuống', left: 'Trái', right: 'Phải' },
    live: { length: 'Độ dài', combo: 'Combo cao nhất', time: 'Thời gian' },
    announceOver: 'Kết thúc: {score} quả táo.'
  }
};

function registerSnakeTranslations() {
  Object.keys(SNAKE_TRANSLATIONS).forEach((language) => {
    if (translations[language]) translations[language].snake = SNAKE_TRANSLATIONS[language];
  });
}

/* ── État ──────────────────────────────────────────────────── */

const snk = {
  el: null,
  ctx: null,
  dpr: 1,
  cell: 24,
  view: 'menu', // menu | ready | running | paused | dying | over
  game: null,
  demo: null,
  demoDiedAt: 0,
  raf: 0,
  last: 0,
  particles: [],
  popups: [],
  shake: 0,
  result: null,
  boardCache: null,
  boardCacheKey: '',
  touch: null,
  coarse: false,
  lastSecond: null,
  lastLiveSecond: null
};

/* ── Données ───────────────────────────────────────────────── */

function ensureSnakeData() {
  if (!appData.snake || typeof appData.snake !== 'object') appData.snake = { bestScore: 0 };
  const data = appData.snake;
  if (!Number.isFinite(data.bestScore) || data.bestScore < 0) data.bestScore = 0;
  if (!data.best || typeof data.best !== 'object') data.best = {};
  // Ancien jeu : 10 points par pomme sur un plateau 21×21 à vitesse normale.
  if (data.bestScore > 0 && !data.best['classic:large:normal']) {
    data.best['classic:large:normal'] = Math.floor(data.bestScore / 10);
  }
  const stats = data.stats && typeof data.stats === 'object' ? data.stats : {};
  data.stats = {
    games: Number(stats.games) || 0,
    apples: Number(stats.apples) || 0,
    longest: Number(stats.longest) || 0,
    timeMs: Number(stats.timeMs) || 0,
    modes: stats.modes && typeof stats.modes === 'object' ? stats.modes : {}
  };
  if (!data.daily || typeof data.daily !== 'object') data.daily = {};
  if (!data.trophies || typeof data.trophies !== 'object') data.trophies = {};
  const settings = data.settings && typeof data.settings === 'object' ? data.settings : {};
  data.settings = { ...SNAKE_DEFAULT_SETTINGS, ...settings };
  const s = data.settings;
  if (!SNAKE_MODES.some((m) => m.id === s.mode)) s.mode = SNAKE_DEFAULT_SETTINGS.mode;
  if (!SNAKE_SPEEDS[s.speed]) s.speed = SNAKE_DEFAULT_SETTINGS.speed;
  if (!SNAKE_SIZES[s.size]) s.size = SNAKE_DEFAULT_SETTINGS.size;
  if (!SNAKE_APPLE_CHOICES.includes(s.apples)) s.apples = SNAKE_DEFAULT_SETTINGS.apples;
  if (!SNAKE_SKINS[s.skin]) s.skin = SNAKE_DEFAULT_SETTINGS.skin;
  if (!SNAKE_THEMES[s.theme]) s.theme = SNAKE_DEFAULT_SETTINGS.theme;
  s.sound = s.sound !== false;
  s.music = s.music === true;
  s.volume = Math.min(1, Math.max(0, Number.isFinite(Number(s.volume)) ? Number(s.volume) : 0.7));
}

function snakeSettings() {
  if (!appData.snake || !appData.snake.settings) ensureSnakeData();
  return appData.snake.settings;
}

function snakeBestKey(g) {
  return `${g.mode}:${g.size}:${g.speed}`;
}

function snakeBestFor(mode, size, speed) {
  return (appData.snake && appData.snake.best[`${mode}:${size}:${speed}`]) || 0;
}

function snakeDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function snakeHash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// mulberry32 : petit générateur reproductible (défi du jour).
function snakeRng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let r = Math.imul(a ^ (a >>> 15), 1 | a);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function snakeDailyConfig(dateKey) {
  const rng = snakeRng(snakeHash(`mydesk-snake-${dateKey}`));
  const mode = SNAKE_DAILY_MODES[Math.floor(rng() * SNAKE_DAILY_MODES.length)];
  const speed = rng() < 0.3 ? 'fast' : 'normal';
  const apples = rng() < 0.5 ? 1 : 3;
  const obstacles = ['classic', 'wrap', 'poison', 'timeattack'].includes(mode) ? 4 + Math.floor(rng() * 5) : 0;
  let goal = SNAKE_DAILY_GOALS[mode];
  if (speed === 'fast') goal -= 3;
  if (apples === 3) goal += 3;
  if (obstacles) goal -= 2;
  return { key: dateKey, mode, speed, size: 'medium', apples, obstacles, goal, seed: snakeHash(`seed-${dateKey}`) };
}

function snakeDailyDone(data, key) {
  return (data.daily[key] || 0) >= snakeDailyConfig(key).goal;
}

function snakeDailyDoneCount(data) {
  return Object.keys(data.daily).filter((key) => snakeDailyDone(data, key)).length;
}

function snakeDailyStreak(data) {
  const day = new Date();
  if (!snakeDailyDone(data, snakeDateKey(day))) day.setDate(day.getDate() - 1);
  let streak = 0;
  while (snakeDailyDone(data, snakeDateKey(day))) {
    streak += 1;
    day.setDate(day.getDate() - 1);
  }
  return streak;
}

/* ── Moteur ────────────────────────────────────────────────── */

function snakeKey(x, y) {
  return `${x},${y}`;
}

function snakeCreateGame({ mode, speed, size, apples, demo = false, daily = null }) {
  const dims = SNAKE_SIZES[size];
  const seed = daily ? daily.seed : Math.floor(Math.random() * 4294967296);
  const g = {
    mode,
    speed,
    size,
    apples,
    demo,
    daily,
    cols: dims.cols,
    rows: dims.rows,
    rng: snakeRng(seed),
    dir: 'right',
    queue: [],
    snake: [],
    prev: [],
    grow: 0,
    fruits: [],
    walls: new Map(),
    portals: [],
    score: 0,
    eaten: 0,
    goldens: 0,
    combo: 0,
    bestCombo: 0,
    lastEatAt: -Infinity,
    tick: SNAKE_SPEEDS[speed],
    acc: 0,
    time: 0,
    timeLeft: mode === 'timeattack' && !demo ? SNAKE_TIME_ATTACK_MS : null,
    teleports: 0,
    alive: true,
    reason: null,
    diedAt: 0,
    won: false
  };
  const sy = Math.floor(g.rows / 2);
  const sx = Math.max(3, Math.floor(g.cols / 4));
  for (let i = 0; i < 4; i++) g.snake.push({ x: sx - i, y: sy, d: 'right' });
  g.prev = g.snake.map((s) => ({ ...s }));
  if (daily && daily.obstacles) snakePlaceObstacles(g, daily.obstacles, sy);
  if (mode === 'portal') snakePlacePortal(g);
  for (let i = 0; i < apples; i++) snakeSpawnFruit(g, 'apple');
  if (mode === 'poison') snakeRefreshPoison(g);
  return g;
}

function snakeFreeCells(g, minHeadDist = 0) {
  const taken = new Set();
  g.snake.forEach((s) => taken.add(snakeKey(s.x, s.y)));
  g.fruits.forEach((f) => taken.add(snakeKey(f.x, f.y)));
  g.walls.forEach((_, key) => taken.add(key));
  g.portals.forEach((p) => {
    taken.add(snakeKey(p.a.x, p.a.y));
    taken.add(snakeKey(p.b.x, p.b.y));
  });
  const head = g.snake[0];
  const cells = [];
  for (let y = 0; y < g.rows; y++) {
    for (let x = 0; x < g.cols; x++) {
      if (taken.has(snakeKey(x, y))) continue;
      if (Math.abs(x - head.x) + Math.abs(y - head.y) < minHeadDist) continue;
      cells.push({ x, y });
    }
  }
  return cells;
}

function snakePick(g, cells) {
  return cells[Math.floor(g.rng() * cells.length)];
}

function snakeSpawnFruit(g, type) {
  let cells = snakeFreeCells(g, 3);
  if (!cells.length) cells = snakeFreeCells(g, 1);
  if (!cells.length) return false;
  const c = snakePick(g, cells);
  const fruit = { x: c.x, y: c.y, type, born: performance.now() };
  if (type === 'golden') fruit.expires = g.time + SNAKE_GOLDEN_MS;
  if (type === 'clock') fruit.expires = g.time + 9000;
  g.fruits.push(fruit);
  return true;
}

function snakeRefreshPoison(g) {
  g.fruits = g.fruits.filter((f) => f.type !== 'poison');
  const count = g.apples + 1;
  for (let i = 0; i < count; i++) snakeSpawnFruit(g, 'poison');
}

function snakePlacePortal(g) {
  g.portals = [];
  const inner = (c) => c.x >= 1 && c.y >= 1 && c.x <= g.cols - 2 && c.y <= g.rows - 2;
  const cells = snakeFreeCells(g, 4).filter(inner);
  if (cells.length < 2) return;
  const a = snakePick(g, cells);
  const minGap = Math.floor((g.cols + g.rows) / 3);
  const far = cells.filter((c) => Math.abs(c.x - a.x) + Math.abs(c.y - a.y) >= minGap);
  const b = snakePick(g, far.length ? far : cells.filter((c) => c !== a));
  if (!b) return;
  g.portals = [{ a, b, born: performance.now() }];
}

function snakePlaceObstacles(g, count, startRow) {
  const shapes = [
    [[0, 0], [1, 0]],
    [[0, 0], [0, 1]],
    [[0, 0], [1, 0], [2, 0]],
    [[0, 0], [0, 1], [0, 2]],
    [[0, 0], [1, 0], [0, 1]],
    [[0, 0], [1, 0], [1, 1]]
  ];
  let placed = 0;
  for (let attempt = 0; attempt < 200 && placed < count; attempt++) {
    const shape = shapes[Math.floor(g.rng() * shapes.length)];
    const ox = 1 + Math.floor(g.rng() * (g.cols - 4));
    const oy = 1 + Math.floor(g.rng() * (g.rows - 4));
    const cells = shape.map(([dx, dy]) => ({ x: ox + dx, y: oy + dy }));
    const ok = cells.every((c) => Math.abs(c.y - startRow) > 1 && !g.walls.has(snakeKey(c.x, c.y)));
    if (!ok) continue;
    cells.forEach((c) => g.walls.set(snakeKey(c.x, c.y), { born: 0 }));
    placed += 1;
  }
}

function snakeGrowWall(g) {
  const head = g.snake[0];
  const v = SNAKE_DIRS[g.dir];
  const ahead = new Set();
  for (let k = 1; k <= 6; k++) ahead.add(snakeKey(head.x + v.x * k, head.y + v.y * k));
  const cells = snakeFreeCells(g, 4).filter((c) => !ahead.has(snakeKey(c.x, c.y)));
  if (!cells.length) return;
  const c = snakePick(g, cells);
  g.walls.set(snakeKey(c.x, c.y), { born: performance.now() });
  snakeEmit(g, 'wall', c);
}

function snakeStep(g) {
  g.prev = g.snake.map((s) => ({ x: s.x, y: s.y, d: s.d }));
  let turned = false;
  while (g.queue.length) {
    const next = g.queue.shift();
    if (next !== g.dir && next !== SNAKE_OPPOSITE[g.dir]) {
      g.dir = next;
      turned = true;
      break;
    }
  }
  const v = SNAKE_DIRS[g.dir];
  const head = g.snake[0];
  let x = head.x + v.x;
  let y = head.y + v.y;
  const zen = g.mode === 'zen';
  if (x < 0 || y < 0 || x >= g.cols || y >= g.rows) {
    if (g.mode !== 'wrap' && !zen) return snakeDie(g, 'wall');
    x = (x + g.cols) % g.cols;
    y = (y + g.rows) % g.rows;
  }
  const portal = g.portals.find((p) => (p.a.x === x && p.a.y === y) || (p.b.x === x && p.b.y === y));
  if (portal) {
    const entry = { x, y };
    const exit = portal.a.x === x && portal.a.y === y ? portal.b : portal.a;
    x = exit.x + v.x;
    y = exit.y + v.y;
    g.teleports += 1;
    snakeEmit(g, 'portal', { entry, exit });
  }
  if (!zen && g.walls.has(snakeKey(x, y))) return snakeDie(g, 'wall');
  const index = g.fruits.findIndex((f) => f.x === x && f.y === y);
  const fruit = index >= 0 ? g.fruits[index] : null;
  if (fruit && fruit.type === 'poison') return snakeDie(g, 'poison', fruit);
  if (fruit && fruit.type !== 'clock') g.grow += 1;
  const pops = g.grow === 0;
  if (!zen) {
    const body = pops ? g.snake.length - 1 : g.snake.length;
    for (let i = 0; i < body; i++) {
      if (g.snake[i].x === x && g.snake[i].y === y) return snakeDie(g, 'self');
    }
  }
  g.snake.unshift({ x, y, d: g.dir });
  if (pops) g.snake.pop();
  else g.grow -= 1;
  if (fruit) {
    g.fruits.splice(index, 1);
    snakeEat(g, fruit);
  }
  if (turned) snakeEmit(g, 'turn');
}

function snakeEat(g, fruit) {
  if (fruit.type === 'clock') {
    g.timeLeft = (g.timeLeft || 0) + SNAKE_CLOCK_BONUS_MS;
    snakeEmit(g, 'clock', fruit);
    return;
  }
  // Combo : pommes enchaînées vite (fenêtre proportionnelle à la taille du plateau).
  const window = g.tick * (g.cols + g.rows) * 0.55;
  g.combo = g.time - g.lastEatAt <= window ? g.combo + 1 : 1;
  g.lastEatAt = g.time;
  g.bestCombo = Math.max(g.bestCombo, g.combo);
  const points = fruit.type === 'golden' ? 3 : 1;
  g.score += points;
  g.eaten += 1;
  if (fruit.type === 'golden') g.goldens += 1;
  snakeEmit(g, fruit.type === 'golden' ? 'golden' : 'eat', { fruit, points, combo: g.combo });
  if (fruit.type === 'apple' && !snakeSpawnFruit(g, 'apple') && !g.fruits.some((f) => f.type === 'apple')) {
    snakeDie(g, 'win');
    return;
  }
  if (g.speed === 'turbo') g.tick = Math.max(SNAKE_TURBO_MIN_MS, g.tick - SNAKE_TURBO_STEP_MS);
  if (g.mode === 'walls') snakeGrowWall(g);
  if (g.mode === 'portal' && g.eaten % 5 === 0) {
    snakePlacePortal(g);
    snakeEmit(g, 'portalMove');
  }
  if (g.mode === 'poison') snakeRefreshPoison(g);
  if (fruit.type === 'apple' && !g.fruits.some((f) => f.type === 'golden') && g.rng() < SNAKE_GOLDEN_CHANCE) {
    snakeSpawnFruit(g, 'golden');
  }
  if (g.mode === 'timeattack' && !g.fruits.some((f) => f.type === 'clock') && g.rng() < SNAKE_CLOCK_CHANCE) {
    snakeSpawnFruit(g, 'clock');
  }
}

function snakeDie(g, reason) {
  g.alive = false;
  g.reason = reason;
  g.won = reason === 'win';
  g.diedAt = performance.now();
  g.prev = g.snake.map((s) => ({ ...s }));
  g.acc = 0;
  snakeEmit(g, reason === 'win' ? 'win' : reason === 'time' ? 'time' : 'die', { reason });
}

function snakeAdvance(g, dt) {
  g.time += dt;
  if (g.timeLeft !== null) {
    g.timeLeft -= dt;
    const second = Math.ceil(g.timeLeft / 1000);
    if (second !== snk.lastSecond) {
      snk.lastSecond = second;
      if (second <= 10 && second > 0) snakeEmit(g, 'tick', { last: second <= 3 });
    }
    if (g.timeLeft <= 0) {
      g.timeLeft = 0;
      snakeDie(g, 'time');
      return;
    }
  }
  const expired = g.fruits.filter((f) => f.expires && g.time > f.expires);
  if (expired.length) {
    g.fruits = g.fruits.filter((f) => !expired.includes(f));
    expired.forEach((f) => snakeEmit(g, 'expire', f));
  }
  g.acc += dt;
  while (g.alive && g.acc >= g.tick) {
    g.acc -= g.tick;
    if (g.demo) g.queue = [snakeAiDirection(g)];
    snakeStep(g);
  }
}

/* Démo du menu : le serpent joue tout seul (plus court chemin vers une
   pomme, en gardant assez de place libre pour ne pas s'enfermer). */
function snakeAiDirection(g) {
  const wraps = g.mode === 'wrap' || g.mode === 'zen';
  const blocked = new Set();
  g.snake.forEach((s, i) => {
    if (i < g.snake.length - 1) blocked.add(snakeKey(s.x, s.y));
  });
  g.walls.forEach((_, key) => blocked.add(key));
  g.fruits.forEach((f) => {
    if (f.type === 'poison') blocked.add(snakeKey(f.x, f.y));
  });
  const move = (c, d) => {
    const v = SNAKE_DIRS[d];
    let x = c.x + v.x;
    let y = c.y + v.y;
    if (x < 0 || y < 0 || x >= g.cols || y >= g.rows) {
      if (!wraps) return null;
      x = (x + g.cols) % g.cols;
      y = (y + g.rows) % g.rows;
    }
    const portal = g.portals.find((p) => (p.a.x === x && p.a.y === y) || (p.b.x === x && p.b.y === y));
    if (portal) {
      const exit = portal.a.x === x && portal.a.y === y ? portal.b : portal.a;
      x = exit.x + v.x;
      y = exit.y + v.y;
    }
    if (blocked.has(snakeKey(x, y))) return null;
    return { x, y };
  };
  const space = (start, limit) => {
    const seen = new Set([snakeKey(start.x, start.y)]);
    const queue = [start];
    while (queue.length && seen.size < limit) {
      const c = queue.shift();
      Object.keys(SNAKE_DIRS).forEach((d) => {
        const n = move(c, d);
        if (n && !seen.has(snakeKey(n.x, n.y))) {
          seen.add(snakeKey(n.x, n.y));
          queue.push(n);
        }
      });
    }
    return seen.size;
  };
  const head = g.snake[0];
  const options = Object.keys(SNAKE_DIRS)
    .filter((d) => d !== SNAKE_OPPOSITE[g.dir])
    .map((d) => ({ d, c: move(head, d) }))
    .filter((o) => o.c);
  if (!options.length) return g.dir;
  const need = g.snake.length + 2;
  options.forEach((o) => {
    o.space = space(o.c, need);
  });
  const safe = options.filter((o) => o.space >= need);
  const pool = safe.length ? safe : options.sort((a, b) => b.space - a.space).slice(0, 1);
  const targets = new Set(g.fruits.filter((f) => f.type !== 'poison').map((f) => snakeKey(f.x, f.y)));
  const seen = new Set(pool.map((o) => snakeKey(o.c.x, o.c.y)));
  const queue = pool.map((o) => ({ c: o.c, first: o.d }));
  while (queue.length) {
    const { c, first } = queue.shift();
    if (targets.has(snakeKey(c.x, c.y))) return first;
    Object.keys(SNAKE_DIRS).forEach((d) => {
      const n = move(c, d);
      if (n && !seen.has(snakeKey(n.x, n.y))) {
        seen.add(snakeKey(n.x, n.y));
        queue.push({ c: n, first });
      }
    });
  }
  return pool.sort((a, b) => b.space - a.space)[0].d;
}

/* ── Évènements de jeu : effets, sons, affichage ───────────── */

const SNAKE_FRUIT_COLORS = { apple: '#e53935', golden: '#fbbf24', poison: '#9333ea', clock: '#e2e8f0' };

function snakeEmit(g, type, data = {}) {
  const cell = snk.cell;
  const center = (c) => ({ x: (c.x + 0.5) * cell, y: (c.y + 0.5) * cell });
  if (type === 'eat' || type === 'golden') {
    const p = center(data.fruit);
    snakeBurst(p.x, p.y, SNAKE_FRUIT_COLORS[data.fruit.type], type === 'golden' ? 22 : 12);
    snk.popups.push({ x: p.x, y: p.y, text: `+${data.points}`, color: type === 'golden' ? '#f59e0b' : '#ffffff', born: performance.now() });
  } else if (type === 'clock') {
    const p = center(data);
    snakeBurst(p.x, p.y, '#38bdf8', 12);
    snk.popups.push({ x: p.x, y: p.y, text: '+5 s', color: '#38bdf8', born: performance.now() });
  } else if (type === 'portal') {
    const a = center(data.entry);
    const b = center(data.exit);
    snakeBurst(a.x, a.y, '#a855f7', 8);
    snakeBurst(b.x, b.y, '#a855f7', 8);
  } else if (type === 'wall') {
    const p = center(data);
    snakeBurst(p.x, p.y, '#a8a29e', 8);
  } else if (type === 'expire') {
    const p = center(data);
    snakeBurst(p.x, p.y, SNAKE_FRUIT_COLORS[data.type] || '#ffffff', 6);
  } else if (type === 'die' || type === 'time') {
    if (!g.demo) snk.shake = type === 'die' ? 14 : 6;
    const head = g.snake[0];
    const p = center(head);
    if (type === 'die') snakeBurst(p.x, p.y, '#f87171', 16);
  } else if (type === 'win') {
    for (let i = 0; i < 6; i++) {
      snakeBurst(Math.random() * g.cols * cell, Math.random() * g.rows * cell, ['#fbbf24', '#f472b6', '#60a5fa', '#34d399'][i % 4], 14);
    }
  }
  if (g.demo) {
    if (type === 'die' || type === 'win') snk.demoDiedAt = performance.now();
    return;
  }
  if (type === 'eat' || type === 'golden') {
    snakeSfx(type, { combo: data.combo });
    snakeVibrate(12);
    snakeUpdateHud(true);
  } else if (type === 'clock') {
    snakeSfx('clock');
    snakeUpdateHud();
  } else if (type === 'die') {
    snakeSfx(data.reason === 'poison' ? 'poison' : 'die');
    snakeVibrate([60, 40, 90]);
    snakeEnterDying();
  } else if (type === 'time' || type === 'win') {
    snakeSfx(type);
    snakeEnterDying();
  } else {
    snakeSfx(type, data);
  }
}

function snakeBurst(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (0.4 + Math.random() * 1.2) * snk.cell * 0.009;
    snk.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - snk.cell * 0.003,
      life: 0,
      max: 380 + Math.random() * 380,
      size: snk.cell * (0.06 + Math.random() * 0.08),
      color
    });
  }
  if (snk.particles.length > 400) snk.particles.splice(0, snk.particles.length - 400);
}

function snakeUpdateParticles(dt) {
  snk.particles = snk.particles.filter((p) => {
    p.life += dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += snk.cell * 0.00002 * dt;
    return p.life < p.max;
  });
  const now = performance.now();
  snk.popups = snk.popups.filter((p) => now - p.born < 750);
  snk.shake = Math.max(0, snk.shake - dt * 0.035);
}

function snakeVibrate(pattern) {
  if (snk.coarse && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch (error) {
      // vibration indisponible
    }
  }
}

/* ── Son : tout est synthétisé (Web Audio) ─────────────────── */

const snakeAudio = { ctx: null, master: null, sfx: null, music: null, noise: null, timer: null, nextTime: 0, step: 0 };
const SNAKE_SCALE = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98, 1760];

function snakeAudioReady() {
  const s = snakeSettings();
  if (!s.sound && !s.music) return null;
  if (!snakeAudio.ctx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    try {
      const ctx = new Ctx();
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.ratio.value = 4;
      comp.connect(ctx.destination);
      const master = ctx.createGain();
      master.connect(comp);
      const sfx = ctx.createGain();
      sfx.connect(master);
      const music = ctx.createGain();
      music.gain.value = 0.2;
      music.connect(master);
      // Petit écho pour donner de l'espace aux bruitages.
      const delay = ctx.createDelay();
      delay.delayTime.value = 0.11;
      const feedback = ctx.createGain();
      feedback.gain.value = 0.22;
      const wet = ctx.createGain();
      wet.gain.value = 0.16;
      sfx.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(wet);
      wet.connect(master);
      const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const channel = noise.getChannelData(0);
      for (let i = 0; i < channel.length; i++) channel[i] = Math.random() * 2 - 1;
      Object.assign(snakeAudio, { ctx, master, sfx, music, noise });
    } catch (error) {
      return null;
    }
  }
  if (snakeAudio.ctx.state === 'suspended') snakeAudio.ctx.resume().catch(() => {});
  snakeAudio.master.gain.value = s.volume;
  return snakeAudio.ctx;
}

function snakeTone(freq, { type = 'triangle', at = 0, dur = 0.12, vol = 0.3, to = null, attack = 0.005, dest = null, detune = 0 } = {}) {
  const a = snakeAudio;
  if (!a.ctx) return;
  const t0 = a.ctx.currentTime + Math.max(0, at);
  const osc = a.ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  osc.detune.value = detune;
  const gain = a.ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain);
  gain.connect(dest || a.sfx);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}

function snakeNoise({ at = 0, dur = 0.1, vol = 0.2, freq = 1000, q = 1, type = 'bandpass', to = null, dest = null } = {}) {
  const a = snakeAudio;
  if (!a.ctx) return;
  const t0 = a.ctx.currentTime + Math.max(0, at);
  const source = a.ctx.createBufferSource();
  source.buffer = a.noise;
  source.loop = true;
  const filter = a.ctx.createBiquadFilter();
  filter.type = type;
  filter.Q.value = q;
  filter.frequency.setValueAtTime(freq, t0);
  if (to) filter.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  const gain = a.ctx.createGain();
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(dest || a.sfx);
  source.start(t0, Math.random() * 0.5);
  source.stop(t0 + dur + 0.03);
}

function snakeSfx(name, data = {}) {
  if (!snakeSettings().sound || !snakeAudioReady()) return;
  switch (name) {
    case 'eat': {
      const f = SNAKE_SCALE[Math.min(SNAKE_SCALE.length - 1, (data.combo || 1) - 1)];
      snakeNoise({ dur: 0.05, vol: 0.22, freq: 2600, q: 0.8 });
      snakeTone(f, { type: 'triangle', dur: 0.15, vol: 0.32 });
      snakeTone(f * 2, { type: 'sine', at: 0.03, dur: 0.12, vol: 0.1 });
      break;
    }
    case 'golden':
      [1, 1.25, 1.5, 2, 2.5].forEach((m, i) => snakeTone(784 * m, { type: 'triangle', at: i * 0.05, dur: 0.2, vol: 0.2 }));
      snakeNoise({ dur: 0.45, vol: 0.05, freq: 7000, type: 'highpass' });
      break;
    case 'clock':
      snakeTone(1568, { type: 'square', dur: 0.03, vol: 0.06 });
      snakeTone(1175, { type: 'square', at: 0.09, dur: 0.03, vol: 0.06 });
      snakeTone(880, { type: 'sine', at: 0.18, dur: 0.25, vol: 0.18, to: 1760 });
      break;
    case 'turn':
      snakeNoise({ dur: 0.02, vol: 0.04, freq: 5200, type: 'highpass' });
      break;
    case 'start':
      snakeTone(392, { dur: 0.1, vol: 0.22 });
      snakeTone(523.25, { at: 0.08, dur: 0.1, vol: 0.22 });
      snakeTone(783.99, { at: 0.16, dur: 0.2, vol: 0.22 });
      break;
    case 'pause':
      snakeTone(659.25, { type: 'sine', dur: 0.1, vol: 0.18 });
      snakeTone(440, { type: 'sine', at: 0.09, dur: 0.16, vol: 0.18 });
      break;
    case 'resume':
      snakeTone(440, { type: 'sine', dur: 0.1, vol: 0.18 });
      snakeTone(659.25, { type: 'sine', at: 0.09, dur: 0.16, vol: 0.18 });
      break;
    case 'die':
      snakeTone(330, { type: 'square', dur: 0.55, vol: 0.14, to: 55 });
      snakeNoise({ dur: 0.35, vol: 0.3, freq: 900, type: 'lowpass', to: 120 });
      snakeTone(110, { type: 'sine', dur: 0.4, vol: 0.45, to: 40 });
      break;
    case 'poison':
      snakeTone(520, { type: 'sawtooth', dur: 0.75, vol: 0.09, to: 80 });
      snakeTone(520, { type: 'sawtooth', dur: 0.75, vol: 0.09, to: 82, detune: 30 });
      snakeNoise({ dur: 0.5, vol: 0.15, freq: 600, q: 6, to: 150 });
      break;
    case 'time':
      snakeTone(196, { type: 'square', dur: 0.6, vol: 0.12 });
      snakeTone(185, { type: 'square', dur: 0.6, vol: 0.12 });
      break;
    case 'tick':
      snakeTone(data.last ? 1320 : 990, { type: 'sine', dur: 0.05, vol: data.last ? 0.16 : 0.1 });
      break;
    case 'wall':
      snakeTone(140, { type: 'sine', dur: 0.16, vol: 0.3, to: 60 });
      snakeNoise({ dur: 0.12, vol: 0.12, freq: 500, type: 'lowpass' });
      break;
    case 'portal':
      snakeTone(220, { type: 'sine', dur: 0.28, vol: 0.22, to: 1320 });
      snakeTone(1320, { type: 'triangle', at: 0.02, dur: 0.26, vol: 0.07, to: 330 });
      snakeNoise({ dur: 0.3, vol: 0.07, freq: 1800, q: 4, to: 300 });
      break;
    case 'portalMove':
      snakeTone(660, { type: 'sine', dur: 0.4, vol: 0.14, to: 165 });
      break;
    case 'expire':
      snakeTone(880, { type: 'sine', dur: 0.15, vol: 0.08, to: 440 });
      break;
    case 'record':
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => snakeTone(f, { type: 'square', at: 0.05 + i * 0.11, dur: 0.16, vol: 0.08 }));
      [523.25, 659.25, 783.99, 1046.5].forEach((f) => snakeTone(f, { type: 'triangle', at: 0.5, dur: 0.7, vol: 0.1 }));
      break;
    case 'win':
      [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98, 2093].forEach((f, i) => snakeTone(f, { type: 'triangle', at: i * 0.08, dur: 0.25, vol: 0.14 }));
      [523.25, 659.25, 783.99, 1046.5].forEach((f) => snakeTone(f, { type: 'triangle', at: 0.6, dur: 1, vol: 0.1 }));
      break;
    case 'trophy':
      [1318.51, 1567.98, 2093].forEach((f, i) => snakeTone(f, { type: 'sine', at: 0.9 + i * 0.07, dur: 0.3, vol: 0.12 }));
      break;
    case 'select':
      snakeTone(1046.5, { type: 'sine', dur: 0.05, vol: 0.07 });
      break;
    default:
      break;
  }
}

// Musique : grille de 16 pas (Am, F, C, G), tempo calé sur la vitesse du serpent.
// La batterie arrive avec les pommes mangées ; en Zen, juste basse et arpège.
const SNAKE_CHORDS = [
  [110, [220, 261.63, 329.63, 440, 523.25]],
  [87.31, [174.61, 220, 261.63, 349.23, 440]],
  [130.81, [196, 261.63, 329.63, 392, 523.25]],
  [98, [196, 246.94, 293.66, 392, 493.88]]
];
const SNAKE_ARP = [0, 2, 1, 3, 2, 4, 3, 1];

function snakeMusicStart() {
  if (!snakeSettings().music || snakeAudio.timer || !snakeAudioReady()) return;
  const a = snakeAudio;
  a.music.gain.cancelScheduledValues(a.ctx.currentTime);
  a.music.gain.setValueAtTime(0.2, a.ctx.currentTime);
  a.nextTime = a.ctx.currentTime + 0.05;
  a.timer = setInterval(snakeMusicSchedule, 25);
}

function snakeMusicStop() {
  const a = snakeAudio;
  if (!a.timer) return;
  clearInterval(a.timer);
  a.timer = null;
  a.step = 0;
}

function snakeMusicSchedule() {
  const a = snakeAudio;
  if (!a.ctx) return;
  const g = snk.game;
  const stepDur = Math.min(0.2, Math.max(0.09, (g ? g.tick : 130) / 1000));
  while (a.nextTime < a.ctx.currentTime + 0.12) {
    snakeMusicNote(a.step, a.nextTime, stepDur, g);
    a.nextTime += stepDur;
    a.step += 1;
  }
}

function snakeMusicNote(step, time, stepDur, g) {
  const a = snakeAudio;
  const at = time - a.ctx.currentTime;
  const [root, tones] = SNAKE_CHORDS[Math.floor(step / 16) % 4];
  const pos = step % 16;
  const eaten = g ? g.eaten : 0;
  const zen = g && g.mode === 'zen';
  if ([0, 3, 8, 11].includes(pos)) {
    snakeTone(pos === 3 || pos === 11 ? root * 1.5 : root, { type: 'triangle', at, dur: stepDur * 1.8, vol: 0.5, dest: a.music });
  }
  if (pos % 2 === 0) {
    const note = tones[SNAKE_ARP[(pos / 2) % SNAKE_ARP.length]] * (zen ? 1 : 2);
    snakeTone(note, { type: zen ? 'sine' : 'square', at, dur: stepDur * 0.9, vol: zen ? 0.18 : 0.06, dest: a.music });
  }
  if (zen) return;
  if (eaten >= 5 && pos % 4 === 2) snakeNoise({ at, dur: 0.04, vol: 0.12, freq: 8000, type: 'highpass', dest: a.music });
  if (eaten >= 12 && pos % 8 === 0) snakeTone(120, { type: 'sine', at, dur: 0.18, vol: 0.6, to: 45, dest: a.music });
  if (eaten >= 20 && pos % 8 === 4) snakeNoise({ at, dur: 0.12, vol: 0.2, freq: 1800, q: 0.7, dest: a.music });
}

/* ── Rendu ─────────────────────────────────────────────────── */

function snakeHexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function snakeMix(a, b, t) {
  const ca = snakeHexToRgb(a);
  const cb = snakeHexToRgb(b);
  const c = ca.map((v, i) => Math.round(v + (cb[i] - v) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

function snakeShownGame() {
  return snk.view === 'menu' ? snk.demo : snk.game;
}

function snakeLayout() {
  const el = snk.el;
  const g = snakeShownGame();
  if (!el || !g) return;
  const width = el.boardWrap.clientWidth;
  if (!width) return;
  const maxHeight = Math.max(240, Math.min(window.innerHeight * 0.7, 760));
  const cell = Math.max(10, Math.floor(Math.min(width / g.cols, maxHeight / g.rows)));
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  const cssW = cell * g.cols;
  const cssH = cell * g.rows;
  if (snk.cell !== cell || snk.dpr !== dpr || el.canvas.width !== Math.round(cssW * dpr) || el.canvas.height !== Math.round(cssH * dpr)) {
    // Les particules en cours sont en pixels : on les remet à l'échelle.
    const ratio = cell / snk.cell;
    snk.particles.forEach((p) => {
      p.x *= ratio;
      p.y *= ratio;
    });
    snk.cell = cell;
    snk.dpr = dpr;
    el.canvas.width = Math.round(cssW * dpr);
    el.canvas.height = Math.round(cssH * dpr);
    el.canvas.style.width = `${cssW}px`;
    el.canvas.style.height = `${cssH}px`;
    el.stage.style.width = `${cssW}px`;
    el.stage.style.height = `${cssH}px`;
  }
  const theme = SNAKE_THEMES[snakeSettings().theme];
  el.stage.style.setProperty('--snake-frame', theme.frame);
}

function snakeBoardImage(g) {
  const theme = snakeSettings().theme;
  const key = `${g.cols}x${g.rows}@${snk.cell}x${snk.dpr}:${theme}`;
  if (snk.boardCacheKey === key && snk.boardCache) return snk.boardCache;
  const colors = SNAKE_THEMES[theme];
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(g.cols * snk.cell * snk.dpr);
  canvas.height = Math.round(g.rows * snk.cell * snk.dpr);
  const ctx = canvas.getContext('2d');
  ctx.scale(snk.dpr, snk.dpr);
  for (let y = 0; y < g.rows; y++) {
    for (let x = 0; x < g.cols; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? colors.light : colors.dark;
      ctx.fillRect(x * snk.cell, y * snk.cell, snk.cell, snk.cell);
    }
  }
  // Léger vignettage sur les bords.
  const w = g.cols * snk.cell;
  const h = g.rows * snk.cell;
  const vignette = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, colors.glow ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.12)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
  snk.boardCache = canvas;
  snk.boardCacheKey = key;
  return canvas;
}

function snakeEaseOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function snakeDraw(g, t, now) {
  const { ctx } = snk;
  const el = snk.el;
  if (!ctx || !el) return;
  const cell = snk.cell;
  const W = g.cols * cell;
  const H = g.rows * cell;
  const settings = snakeSettings();
  const theme = SNAKE_THEMES[settings.theme];
  ctx.setTransform(snk.dpr, 0, 0, snk.dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.save();
  if (snk.shake > 0) ctx.translate((Math.random() - 0.5) * snk.shake, (Math.random() - 0.5) * snk.shake);
  ctx.drawImage(snakeBoardImage(g), 0, 0, W, H);

  g.walls.forEach((wall, key) => {
    const [x, y] = key.split(',').map(Number);
    const grow = wall.born ? snakeEaseOutBack(Math.min(1, (now - wall.born) / 320)) : 1;
    snakeDrawWall(ctx, x, y, cell, theme, grow);
  });
  g.portals.forEach((p) => {
    const appear = Math.min(1, (now - p.born) / 400);
    snakeDrawPortal(ctx, p.a, cell, now, appear);
    snakeDrawPortal(ctx, p.b, cell, now + 500, appear);
  });
  g.fruits.forEach((f) => snakeDrawFruit(ctx, f, g, cell, now));
  snakeDrawSnake(ctx, g, t, now, theme);

  snk.particles.forEach((p) => {
    ctx.globalAlpha = Math.max(0, 1 - p.life / p.max);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
  snk.popups.forEach((p) => {
    const k = (now - p.born) / 750;
    ctx.globalAlpha = Math.max(0, 1 - k * k);
    ctx.font = `800 ${Math.round(cell * 0.62)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = Math.max(2, cell * 0.12);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.strokeText(p.text, p.x, p.y - k * cell * 1.2);
    ctx.fillStyle = p.color;
    ctx.fillText(p.text, p.x, p.y - k * cell * 1.2);
  });
  ctx.globalAlpha = 1;

  // Chrono : bord rouge qui pulse dans les 10 dernières secondes.
  if (g.timeLeft !== null && g.timeLeft < 10000 && g.alive) {
    const pulse = 0.25 + 0.25 * Math.sin(now / 120);
    ctx.strokeStyle = `rgba(239, 68, 68, ${pulse})`;
    ctx.lineWidth = cell * 0.35;
    ctx.strokeRect(0, 0, W, H);
  }
  ctx.restore();
}

function snakeRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function snakeDrawWall(ctx, x, y, cell, theme, grow) {
  const size = cell * 0.92 * grow;
  const cx = (x + 0.5) * cell;
  const cy = (y + 0.5) * cell;
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  snakeRoundRect(ctx, cx - size / 2, cy - size / 2 + cell * 0.08, size, size, cell * 0.16);
  ctx.fill();
  ctx.fillStyle = theme.wall;
  snakeRoundRect(ctx, cx - size / 2, cy - size / 2, size, size, cell * 0.16);
  ctx.fill();
  ctx.fillStyle = theme.wallTop;
  snakeRoundRect(ctx, cx - size / 2 + size * 0.1, cy - size / 2 + size * 0.1, size * 0.8, size * 0.38, cell * 0.1);
  ctx.fill();
}

function snakeDrawPortal(ctx, c, cell, now, appear) {
  const cx = (c.x + 0.5) * cell;
  const cy = (c.y + 0.5) * cell;
  const r = cell * 0.46 * appear;
  if (r <= 0) return;
  const glow = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r * 1.25);
  glow.addColorStop(0, '#1e0b3a');
  glow.addColorStop(0.55, '#6d28d9');
  glow.addColorStop(1, 'rgba(168, 85, 247, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = Math.max(1.5, cell * 0.07);
  ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const start = now / 420 + (i * Math.PI * 2) / 3;
    ctx.strokeStyle = i === 0 ? '#e9d5ff' : '#c084fc';
    ctx.beginPath();
    ctx.arc(cx, cy, r * (0.55 + i * 0.15), start, start + Math.PI * 0.9);
    ctx.stroke();
  }
}

function snakeDrawFruit(ctx, f, g, cell, now) {
  const cx = (f.x + 0.5) * cell;
  const cy = (f.y + 0.5) * cell;
  const pop = snakeEaseOutBack(Math.min(1, (now - f.born) / 280));
  let scale = pop * (1 + Math.sin(now / 260 + f.x * 1.7 + f.y) * 0.045);
  let alpha = 1;
  if (f.expires) {
    const left = f.expires - g.time;
    if (left < 2000) alpha = 0.45 + 0.55 * Math.abs(Math.sin(now / 90));
  }
  if (scale <= 0) return;
  const r = cell * 0.36 * scale;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + r * 0.95, r * 0.8, r * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();
  if (f.type === 'clock') {
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = Math.max(1.5, cell * 0.08);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    const angle = now / 300;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = Math.max(1, cell * 0.05);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * r * 0.65, cy + Math.sin(angle) * r * 0.65);
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, cy - r * 0.5);
    ctx.stroke();
  } else {
    const body = { apple: ['#ef5350', '#c62828'], golden: ['#fde68a', '#f59e0b'], poison: ['#c084fc', '#6b21a8'] }[f.type];
    const grad = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.1, cx, cy, r * 1.1);
    grad.addColorStop(0, body[0]);
    grad.addColorStop(1, body[1]);
    if (f.type === 'golden') {
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = cell * 0.6;
    }
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy + r * 0.05, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.38, cy - r * 0.3, r * 0.22, r * 0.14, -0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = Math.max(1.2, cell * 0.06);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 0.75);
    ctx.quadraticCurveTo(cx + r * 0.05, cy - r * 1.05, cx + r * 0.2, cy - r * 1.2);
    ctx.stroke();
    ctx.fillStyle = f.type === 'poison' ? '#14532d' : '#43a047';
    ctx.beginPath();
    ctx.ellipse(cx + r * 0.42, cy - r * 0.98, r * 0.34, r * 0.15, -0.5, 0, Math.PI * 2);
    ctx.fill();
    if (f.type === 'poison') {
      ctx.fillStyle = 'rgba(30, 0, 50, 0.55)';
      [[-0.3, 0.2, 0.14], [0.25, -0.05, 0.1], [0.15, 0.45, 0.09]].forEach(([dx, dy, rr]) => {
        ctx.beginPath();
        ctx.arc(cx + dx * r, cy + dy * r, rr * r, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    if (f.type === 'golden') {
      for (let i = 0; i < 3; i++) {
        const a = now / 500 + (i * Math.PI * 2) / 3;
        const sx = cx + Math.cos(a) * r * 1.35;
        const sy = cy + Math.sin(a) * r * 1.35;
        const s = r * 0.22 * (0.6 + 0.4 * Math.sin(now / 150 + i));
        ctx.fillStyle = '#fffbeb';
        ctx.beginPath();
        ctx.moveTo(sx, sy - s);
        ctx.lineTo(sx + s * 0.3, sy - s * 0.3);
        ctx.lineTo(sx + s, sy);
        ctx.lineTo(sx + s * 0.3, sy + s * 0.3);
        ctx.lineTo(sx, sy + s);
        ctx.lineTo(sx - s * 0.3, sy + s * 0.3);
        ctx.lineTo(sx - s, sy);
        ctx.lineTo(sx - s * 0.3, sy - s * 0.3);
        ctx.closePath();
        ctx.fill();
      }
    }
  }
  // Anneau du temps restant (pomme dorée, horloge).
  if (f.expires) {
    const total = f.type === 'golden' ? SNAKE_GOLDEN_MS : 9000;
    const left = Math.max(0, f.expires - g.time) / total;
    ctx.strokeStyle = f.type === 'golden' ? 'rgba(245, 158, 11, 0.85)' : 'rgba(2, 132, 199, 0.85)';
    ctx.lineWidth = Math.max(1.5, cell * 0.06);
    ctx.beginPath();
    ctx.arc(cx, cy, cell * 0.47, -Math.PI / 2, -Math.PI / 2 + left * Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function snakeSegmentColor(skin, i, n, now) {
  if (skin.rainbow) return `hsl(${(i * 14 + now * 0.06) % 360}, 82%, 58%)`;
  return snakeMix(skin.from, skin.to, Math.min(1, i / Math.max(n - 1, 8)));
}

/* Le corps suit exactement la grille : entre deux positions interpolées,
   on repasse par le centre de la case (coins arrondis par lineJoin). */
function snakeDrawSnake(ctx, g, t, now, theme) {
  const cell = snk.cell;
  const n = g.snake.length;
  const skin = SNAKE_SKINS[snakeSettings().skin];
  const pts = [];
  for (let i = 0; i < n; i++) {
    const cur = g.snake[i];
    const from = g.prev[i] || g.prev[g.prev.length - 1];
    const dx = cur.x - from.x;
    const dy = cur.y - from.y;
    let x;
    let y;
    if (Math.abs(dx) + Math.abs(dy) <= 1) {
      x = from.x + dx * t;
      y = from.y + dy * t;
    } else {
      // Bord traversé ou portail : on sort d'un côté puis on rentre de l'autre.
      const v = SNAKE_DIRS[cur.d];
      if (t < 0.5) {
        x = from.x + v.x * t;
        y = from.y + v.y * t;
      } else {
        x = cur.x - v.x * (1 - t);
        y = cur.y - v.y * (1 - t);
      }
    }
    pts.push({ x: (x + 0.5) * cell, y: (y + 0.5) * cell });
  }
  const corner = (i) => ({ x: (g.snake[i].x + 0.5) * cell, y: (g.snake[i].y + 0.5) * cell });
  const near = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y) <= cell * 1.05;
  const width = cell * 0.74;
  const dead = !g.alive && !g.won;
  const deadFor = dead ? now - g.diedAt : 0;
  const flash = dead && deadFor < 500 && Math.floor(deadFor / 100) % 2 === 0;
  const colorAt = (i) => {
    if (flash) return '#ffffff';
    const base = snakeSegmentColor(skin, i, n, now);
    return dead ? snakeMix('#94a3b8', '#64748b', i / Math.max(1, n)) : base;
  };
  const taper = (i) => width * (0.62 + 0.38 * Math.min(1, (n - 1 - i) / 3));
  const glow = (skin.glow || theme.glow) && !dead;

  // Tronçons continus (coupés au passage d'un bord ou d'un portail) : les
  // couches semi-transparentes sont tracées d'un seul trait, sinon elles se
  // superposent aux jointures.
  const runs = [];
  let run = [pts[n - 1]];
  for (let i = n - 1; i > 0; i--) {
    const c = corner(i);
    if (near(run[run.length - 1], c)) run.push(c);
    else {
      runs.push(run);
      run = [c];
    }
    if (near(c, pts[i - 1])) run.push(pts[i - 1]);
    else {
      runs.push(run);
      run = [pts[i - 1]];
    }
  }
  runs.push(run);
  const strokeRuns = (lineWidth, dy = 0) => {
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    runs.forEach((r) => {
      ctx.moveTo(r[0].x, r[0].y + dy);
      if (r.length === 1) ctx.lineTo(r[0].x + 0.01, r[0].y + dy);
      for (let k = 1; k < r.length; k++) ctx.lineTo(r[k].x, r[k].y + dy);
    });
    ctx.stroke();
  };

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  strokeRuns(width * 0.92, cell * 0.1);
  if (glow) {
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = colorAt(Math.floor(n / 2));
    strokeRuns(width * 1.7);
    ctx.globalAlpha = 1;
  }
  for (let i = n - 1; i > 0; i--) {
    const c = corner(i);
    ctx.strokeStyle = colorAt(i);
    ctx.lineWidth = taper(i);
    ctx.beginPath();
    if (near(pts[i], c)) {
      ctx.moveTo(pts[i].x, pts[i].y);
      ctx.lineTo(c.x, c.y);
    } else {
      ctx.moveTo(c.x, c.y);
    }
    if (near(c, pts[i - 1])) ctx.lineTo(pts[i - 1].x, pts[i - 1].y);
    else ctx.lineTo(c.x + 0.01, c.y);
    ctx.stroke();
  }
  // Reflet le long du dos.
  if (!dead) {
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    strokeRuns(width * 0.22, -cell * 0.12);
  }
  snakeDrawHead(ctx, g, pts[0], colorAt(0), width, now, dead, glow);
}

function snakeDrawHead(ctx, g, p, color, width, now, dead, glow) {
  const cell = snk.cell;
  const v = SNAKE_DIRS[g.snake[0].d] || SNAKE_DIRS.right;
  const perp = { x: -v.y, y: v.x };
  const r = width * 0.68;
  if (glow) {
    ctx.shadowColor = color;
    ctx.shadowBlur = cell * 0.7;
  }
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Bouche ouverte quand une pomme est juste devant.
  const head = g.snake[0];
  const food = g.fruits.filter((f) => f.type !== 'poison');
  const ahead = food.some((f) => {
    for (let k = 1; k <= 2; k++) {
      if (f.x === head.x + v.x * k && f.y === head.y + v.y * k) return true;
    }
    return false;
  });
  if (ahead && !dead) {
    const angle = Math.atan2(v.y, v.x);
    ctx.fillStyle = '#3f0d12';
    ctx.beginPath();
    ctx.moveTo(p.x + v.x * r * 0.2, p.y + v.y * r * 0.2);
    ctx.arc(p.x, p.y, r * 0.95, angle - 0.55, angle + 0.55);
    ctx.closePath();
    ctx.fill();
  } else if (!dead && now % 2600 < 260) {
    // Langue qui sort de temps en temps.
    const tip = { x: p.x + v.x * r * 1.7, y: p.y + v.y * r * 1.7 };
    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = Math.max(1.2, cell * 0.06);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(p.x + v.x * r * 0.8, p.y + v.y * r * 0.8);
    ctx.lineTo(tip.x, tip.y);
    ctx.lineTo(tip.x + (v.x + perp.x) * r * 0.25, tip.y + (v.y + perp.y) * r * 0.25);
    ctx.moveTo(tip.x, tip.y);
    ctx.lineTo(tip.x + (v.x - perp.x) * r * 0.25, tip.y + (v.y - perp.y) * r * 0.25);
    ctx.stroke();
  }

  // Yeux : les pupilles regardent la pomme la plus proche ; clignement régulier.
  let look = { x: v.x, y: v.y };
  if (food.length) {
    const target = food.reduce((best, f) => {
      const dist = Math.abs(f.x - head.x) + Math.abs(f.y - head.y);
      return !best || dist < best.dist ? { f, dist } : best;
    }, null).f;
    const lx = (target.x + 0.5) * cell - p.x;
    const ly = (target.y + 0.5) * cell - p.y;
    const len = Math.hypot(lx, ly) || 1;
    look = { x: lx / len, y: ly / len };
  }
  const blink = !dead && now % 3800 < 130;
  [1, -1].forEach((side) => {
    const ex = p.x + v.x * r * 0.25 + perp.x * r * 0.48 * side;
    const ey = p.y + v.y * r * 0.25 + perp.y * r * 0.48 * side;
    const er = r * 0.36;
    if (dead) {
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = Math.max(1.5, cell * 0.07);
      ctx.beginPath();
      ctx.moveTo(ex - er * 0.6, ey - er * 0.6);
      ctx.lineTo(ex + er * 0.6, ey + er * 0.6);
      ctx.moveTo(ex + er * 0.6, ey - er * 0.6);
      ctx.lineTo(ex - er * 0.6, ey + er * 0.6);
      ctx.stroke();
      return;
    }
    if (blink) {
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = Math.max(1.5, cell * 0.06);
      ctx.beginPath();
      ctx.moveTo(ex - perp.x * er, ey - perp.y * er);
      ctx.lineTo(ex + perp.x * er, ey + perp.y * er);
      ctx.stroke();
      return;
    }
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ex, ey, er, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(ex + look.x * er * 0.4, ey + look.y * er * 0.4, er * 0.52, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ex + look.x * er * 0.4 - er * 0.18, ey + look.y * er * 0.4 - er * 0.18, er * 0.16, 0, Math.PI * 2);
    ctx.fill();
  });
}

/* ── Boucle ────────────────────────────────────────────────── */

function snakeVisible() {
  return Boolean(snk.el && snk.el.panel.classList.contains('active') && !document.hidden);
}

function snakeEnsureLoop() {
  if (snk.raf || !snakeVisible()) return;
  snk.last = performance.now();
  snk.raf = requestAnimationFrame(snakeFrame);
}

function snakeFrame(now) {
  snk.raf = 0;
  if (!snakeVisible()) {
    if (snk.view === 'running') pauseSnake();
    return;
  }
  const dt = Math.min(64, now - snk.last);
  snk.last = now;
  if (snk.view === 'running' && snk.game) {
    snakeAdvance(snk.game, dt);
    snakeUpdateLive();
  } else if (snk.view === 'menu') {
    if (!snk.demo) snakeNewDemo();
    if (snk.demo.alive) snakeAdvance(snk.demo, dt);
    else if (now - snk.demoDiedAt > 1400) snakeNewDemo();
  } else if (snk.view === 'dying' && snk.game && now - snk.game.diedAt > (snk.game.won ? 1700 : 950)) {
    snakeEnterOver();
  }
  snakeUpdateParticles(dt);
  const g = snakeShownGame();
  if (g) snakeDraw(g, Math.min(1, g.acc / g.tick), now);
  snk.raf = requestAnimationFrame(snakeFrame);
}

/* ── Déroulé d'une partie ──────────────────────────────────── */

function snakeNewDemo() {
  const s = snakeSettings();
  snk.demo = snakeCreateGame({ mode: s.mode, speed: 'normal', size: s.size, apples: s.apples, demo: true });
  snakeLayout();
}

function snakePlay({ daily = false } = {}) {
  const s = snakeSettings();
  const config = daily ? snakeDailyConfig(snakeDateKey()) : null;
  snk.game = snakeCreateGame(config
    ? { mode: config.mode, speed: config.speed, size: config.size, apples: config.apples, daily: config }
    : { mode: s.mode, speed: s.speed, size: s.size, apples: s.apples });
  snk.view = 'ready';
  snk.result = null;
  snk.particles = [];
  snk.popups = [];
  snk.lastSecond = null;
  snk.lastLiveSecond = null;
  snakeAudioReady();
  snakeSfx('select');
  snakeLayout();
  snakeRenderAll();
  snakeEnsureLoop();
}

function snakeBegin() {
  if (!snk.game || snk.view !== 'ready') return;
  snk.view = 'running';
  snk.game.acc = 0;
  snakeSfx('start');
  snakeMusicStart();
  snakeRenderOverlay();
  snakeRenderHud();
  snakeRenderSide();
}

function snakeInput(dir) {
  snakeAudioReady();
  if (snk.view === 'menu' || snk.view === 'over') {
    snakePlay({ daily: Boolean(snk.view === 'over' && snk.game && snk.game.daily) });
  }
  const g = snk.game;
  if (!g) return;
  if (snk.view === 'ready') {
    if (dir !== SNAKE_OPPOSITE[g.dir]) g.queue = [dir];
    snakeBegin();
    return;
  }
  if (snk.view === 'paused') resumeSnake();
  if (snk.view !== 'running') return;
  const last = g.queue.length ? g.queue[g.queue.length - 1] : g.dir;
  if (dir === last || g.queue.length >= 3) return;
  g.queue.push(dir);
}

function pauseSnake() {
  if (snk.view !== 'running') return;
  snk.view = 'paused';
  snakeSfx('pause');
  snakeMusicStop();
  snakeRenderOverlay();
  snakeRenderHud();
}

function resumeSnake() {
  if (snk.view !== 'paused') return;
  snk.view = 'running';
  snk.last = performance.now();
  snakeSfx('resume');
  snakeMusicStart();
  snakeRenderOverlay();
  snakeRenderHud();
  snakeEnsureLoop();
}

function snakeTogglePause() {
  if (snk.view === 'running') pauseSnake();
  else if (snk.view === 'paused') resumeSnake();
  else if (snk.view === 'ready') snakeBegin();
  else if (snk.view === 'menu') snakePlay();
  else if (snk.view === 'over') snakePlay({ daily: Boolean(snk.game && snk.game.daily) });
}

function snakeEnterDying() {
  snk.view = 'dying';
  snakeMusicStop();
  snakeRenderHud();
  snakeRenderOverlay();
}

// Fin de partie : records, statistiques, défi du jour, trophées.
function snakeFinish(g) {
  const data = appData.snake;
  const result = { reason: g.reason || 'quit', record: false, prevBest: 0, unlocked: [], daily: null };
  if (g.time <= 0 && g.score === 0) return result;
  if (g.daily) {
    const prev = data.daily[g.daily.key] || 0;
    result.prevBest = prev;
    result.record = g.score > prev && g.score > 0;
    if (g.score > prev) data.daily[g.daily.key] = g.score;
    const keys = Object.keys(data.daily).sort();
    keys.slice(0, Math.max(0, keys.length - SNAKE_DAILY_KEEP)).forEach((key) => delete data.daily[key]);
    result.daily = { goal: g.daily.goal, reached: g.score >= g.daily.goal };
  } else {
    const key = snakeBestKey(g);
    result.prevBest = data.best[key] || 0;
    result.record = g.score > result.prevBest;
    if (result.record) data.best[key] = g.score;
  }
  data.stats.games += 1;
  data.stats.apples += g.eaten;
  data.stats.longest = Math.max(data.stats.longest, g.snake.length);
  data.stats.timeMs += Math.round(g.time);
  data.stats.modes[g.mode] = 1;
  const today = snakeDateKey();
  SNAKE_TROPHIES.forEach((trophy) => {
    if (data.trophies[trophy.id]) return;
    if (trophy.test(g, data)) {
      data.trophies[trophy.id] = today;
      result.unlocked.push(trophy);
    }
  });
  saveData();
  return result;
}

function snakeEnterOver() {
  const g = snk.game;
  snk.result = snakeFinish(g);
  snk.view = 'over';
  if (snk.result.record) snakeSfx('record');
  if (snk.result.unlocked.length) snakeSfx('trophy');
  if (snk.el.status) snk.el.status.textContent = t('snake.announceOver', { score: g.score });
  snakeRenderAll();
}

function snakeQuit() {
  const g = snk.game;
  if (!g) return;
  g.alive = false;
  g.reason = 'quit';
  g.diedAt = performance.now();
  snakeMusicStop();
  snakeEnterOver();
}

function snakeToMenu() {
  snakeMusicStop();
  snk.view = 'menu';
  snk.result = null;
  snakeNewDemo();
  snakeRenderAll();
  snakeEnsureLoop();
}

/* ── Interface HTML (HUD, calque du plateau, panneau) ─────── */

function snakeEsc(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

function snakeFormatTime(ms) {
  const total = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h) return `${h} h ${String(m).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function snakeModeName(mode) {
  return t(`snake.modes.${mode}.name`);
}

function snakeCurrentBest() {
  const g = snk.view === 'menu' ? null : snk.game;
  const s = snakeSettings();
  if (g && g.daily) return appData.snake.daily[g.daily.key] || 0;
  if (g) return snakeBestFor(g.mode, g.size, g.speed);
  return snakeBestFor(s.mode, s.size, s.speed);
}

function snakeRenderHud() {
  const el = snk.el;
  if (!el) return;
  const s = snakeSettings();
  el.pause.disabled = !['running', 'paused'].includes(snk.view);
  el.pause.textContent = snk.view === 'paused' ? '▶' : '⏸';
  el.pause.title = t('snake.pause');
  el.pause.setAttribute('aria-label', t('snake.pause'));
  el.sound.textContent = s.sound ? '🔊' : '🔇';
  el.sound.title = t(s.sound ? 'snake.soundOn' : 'snake.soundOff');
  el.sound.setAttribute('aria-pressed', String(s.sound));
  el.sound.setAttribute('aria-label', el.sound.title);
  el.music.classList.toggle('is-off', !s.music);
  el.music.title = t(s.music ? 'snake.musicOn' : 'snake.musicOff');
  el.music.setAttribute('aria-pressed', String(s.music));
  el.music.setAttribute('aria-label', el.music.title);
  el.menuBtn.disabled = snk.view === 'menu';
  el.menuBtn.title = t('snake.backToMenu');
  el.menuBtn.setAttribute('aria-label', t('snake.backToMenu'));
  el.scoreChip.title = t('snake.score');
  el.bestChip.title = t('snake.best');
  el.timerChip.title = t('snake.timer');
  snakeUpdateHud();
}

function snakeUpdateHud(bump = false) {
  const el = snk.el;
  if (!el) return;
  const g = snk.view === 'menu' ? null : snk.game;
  const score = g ? g.score : 0;
  el.score.textContent = score;
  el.best.textContent = Math.max(snakeCurrentBest(), score);
  if (bump) {
    el.scoreChip.classList.remove('is-bump');
    void el.scoreChip.offsetWidth;
    el.scoreChip.classList.add('is-bump');
  }
  const timed = g && g.timeLeft !== null;
  el.timerChip.hidden = !timed;
  if (timed) {
    el.timer.textContent = Math.ceil(g.timeLeft / 1000);
    el.timerChip.classList.toggle('is-low', g.timeLeft < 10000);
  }
  if (bump && g && g.combo >= 2) {
    el.combo.textContent = t('snake.combo', { n: g.combo });
    el.combo.classList.remove('is-pop');
    void el.combo.offsetWidth;
    el.combo.classList.add('is-pop', 'is-visible');
  } else if (!g || !g.alive) {
    el.combo.classList.remove('is-visible');
  }
}

// Mis à jour à chaque image en cours de partie (texte seulement s'il change).
function snakeUpdateLive() {
  const g = snk.game;
  const el = snk.el;
  if (!g || !el) return;
  const second = Math.floor(g.time / 1000);
  if (second !== snk.lastLiveSecond) {
    snk.lastLiveSecond = second;
    const time = el.side.querySelector('[data-live="time"]');
    if (time) time.textContent = snakeFormatTime(g.time);
    if (g.timeLeft !== null) snakeUpdateHud();
    if (el.combo.classList.contains('is-visible') && g.time - g.lastEatAt >= g.tick * (g.cols + g.rows) * 0.55) {
      el.combo.classList.remove('is-visible');
    }
  }
  const length = el.side.querySelector('[data-live="length"]');
  if (length && length.textContent !== String(g.snake.length)) length.textContent = g.snake.length;
  const combo = el.side.querySelector('[data-live="combo"]');
  if (combo && combo.textContent !== `×${g.bestCombo}`) combo.textContent = `×${g.bestCombo}`;
  if (g.daily) {
    const bar = el.side.querySelector('[data-live="daily"]');
    if (bar) bar.style.width = `${Math.min(100, (g.score / g.daily.goal) * 100)}%`;
    const label = el.side.querySelector('[data-live="dailyLabel"]');
    const text = g.score >= g.daily.goal ? t('snake.daily.reached') : t('snake.daily.progress', { score: g.score, goal: g.daily.goal });
    if (label && label.textContent !== text) label.textContent = text;
  }
}

function snakeRenderOverlay() {
  const el = snk.el;
  if (!el) return;
  const g = snk.game;
  let html = '';
  if (snk.view === 'menu') {
    const s = snakeSettings();
    html = `
      <span class="snake-overlay__tag">${snakeEsc(t('snake.demo'))}</span>
      <div class="snake-overlay__center">
        <button type="button" class="snake-big-play" data-snake-action="play">${snakeEsc(t('snake.play'))}</button>
        <span class="snake-overlay__mode">${SNAKE_MODES.find((m) => m.id === s.mode).icon} ${snakeEsc(snakeModeName(s.mode))}</span>
      </div>`;
  } else if (snk.view === 'ready' && g) {
    html = `
      <div class="snake-overlay__hint">
        <strong>${g.daily ? '📅 ' : ''}${snakeEsc(snakeModeName(g.mode))}</strong>
        <span>${snakeEsc(t(snk.coarse ? 'snake.readyTouch' : 'snake.ready'))}</span>
      </div>`;
  } else if (snk.view === 'paused') {
    html = `
      <div class="snake-overlay__card">
        <h3>⏸ ${snakeEsc(t('snake.paused'))}</h3>
        <div class="snake-overlay__actions">
          <button type="button" data-snake-action="resume">${snakeEsc(t('snake.resume'))}</button>
          <button type="button" class="snake-btn-ghost" data-snake-action="restart">${snakeEsc(t('snake.restart'))}</button>
          <button type="button" class="snake-btn-ghost" data-snake-action="end">${snakeEsc(t('snake.end'))}</button>
        </div>
      </div>`;
  } else if (snk.view === 'over' && g && snk.result) {
    const r = snk.result;
    const trophies = r.unlocked.map((trophy) => `<li>${trophy.icon} ${snakeEsc(t('snake.trophyUnlocked', { name: t(`snake.trophies.${trophy.id}.name`) }))}</li>`).join('');
    let daily = '';
    if (r.daily) {
      daily = r.daily.reached
        ? `<div class="snake-result__daily is-done">${snakeEsc(t('snake.daily.reached'))}</div>`
        : `<div class="snake-result__daily">${snakeEsc(t('snake.daily.missing', { n: r.daily.goal - g.score }))}</div>`;
    }
    html = `
      <div class="snake-overlay__card snake-result${r.record ? ' is-record' : ''}">
        <div class="snake-result__reason">${snakeEsc(t(`snake.reasons.${r.reason}`))}</div>
        <div class="snake-result__score"><span aria-hidden="true">🍎</span> ${g.score}</div>
        ${r.record ? `<div class="snake-result__record">${snakeEsc(t('snake.newRecord'))}</div>` : `<div class="snake-result__best">${snakeEsc(t('snake.recordWas', { best: Math.max(r.prevBest, g.score) }))}</div>`}
        ${daily}
        <div class="snake-result__meta">${snakeEsc(t('snake.resultMeta', { length: g.snake.length, time: snakeFormatTime(g.time), combo: g.bestCombo }))}</div>
        ${trophies ? `<ul class="snake-result__trophies">${trophies}</ul>` : ''}
        <div class="snake-overlay__actions">
          <button type="button" data-snake-action="replay">${snakeEsc(t('snake.replay'))}</button>
          <button type="button" class="snake-btn-ghost" data-snake-action="menu">${snakeEsc(t('snake.menu'))}</button>
        </div>
        <p class="snake-result__hint">${snakeEsc(t('snake.replayHint'))}</p>
      </div>`;
  }
  el.overlay.innerHTML = html;
  el.overlay.dataset.view = snk.view;
  if (snk.view === 'over') {
    const replay = el.overlay.querySelector('[data-snake-action="replay"]');
    if (replay && !snk.coarse) replay.focus({ preventScroll: true });
  }
}

function snakeSegButtons(group, options, current, label) {
  return `<div class="snake-seg" role="group" aria-label="${snakeEsc(label)}">${options.map((o) => `
    <button type="button" class="snake-seg__btn${String(o.value) === String(current) ? ' is-active' : ''}" data-snake-set="${group}" data-value="${snakeEsc(o.value)}" aria-pressed="${String(o.value) === String(current)}">${snakeEsc(o.label)}</button>`).join('')}</div>`;
}

function snakeRenderSide() {
  const el = snk.el;
  if (!el) return;
  const s = snakeSettings();
  const data = appData.snake;
  const playing = ['ready', 'running', 'paused', 'dying'].includes(snk.view) && snk.game;
  if (playing) {
    const g = snk.game;
    const mode = SNAKE_MODES.find((m) => m.id === g.mode);
    el.side.innerHTML = `
      <div class="snake-card snake-ingame">
        <div class="snake-ingame__mode"><span aria-hidden="true">${mode.icon}</span> ${snakeEsc(snakeModeName(g.mode))}${g.daily ? ' · 📅' : ''}</div>
        <p class="snake-ingame__desc">${snakeEsc(t(`snake.modes.${g.mode}.desc`))}</p>
        <p class="snake-ingame__settings">${snakeEsc(t(`snake.speeds.${g.speed}`))} · ${snakeEsc(t(`snake.sizes.${g.size}`))} · ${g.apples}&nbsp;🍎</p>
        ${g.daily ? `<div class="snake-progress"><div class="snake-progress__label" data-live="dailyLabel"></div><div class="snake-progress__track"><div class="snake-progress__bar" data-live="daily"></div></div></div>` : ''}
        <dl class="snake-live">
          <div><dt>${snakeEsc(t('snake.live.length'))}</dt><dd data-live="length">${g.snake.length}</dd></div>
          <div><dt>${snakeEsc(t('snake.live.combo'))}</dt><dd data-live="combo">×${g.bestCombo}</dd></div>
          <div><dt>${snakeEsc(t('snake.live.time'))}</dt><dd data-live="time">${snakeFormatTime(g.time)}</dd></div>
        </dl>
        <ul class="snake-legend">
          <li><span class="snake-dot snake-dot--apple"></span> +1</li>
          <li><span class="snake-dot snake-dot--golden"></span> ${snakeEsc(t('snake.golden'))} +3</li>
          ${g.mode === 'poison' ? '<li><span class="snake-dot snake-dot--poison"></span> ☠️</li>' : ''}
          ${g.mode === 'timeattack' ? '<li><span class="snake-dot snake-dot--clock"></span> +5 s</li>' : ''}
        </ul>
        <p class="hint">${snakeEsc(t(snk.coarse ? 'snake.controlsTouch' : 'snake.controls'))}</p>
      </div>`;
    snk.lastLiveSecond = null;
    snakeUpdateLive();
    return;
  }

  const daily = snakeDailyConfig(snakeDateKey());
  const dailyBest = data.daily[daily.key] || 0;
  const dailyDone = dailyBest >= daily.goal;
  const streak = snakeDailyStreak(data);
  const dailyMode = SNAKE_MODES.find((m) => m.id === daily.mode);
  const modes = SNAKE_MODES.map((m) => {
    const best = snakeBestFor(m.id, s.size, s.speed);
    return `
      <button type="button" class="snake-mode${m.id === s.mode ? ' is-active' : ''}" data-snake-set="mode" data-value="${m.id}" aria-pressed="${m.id === s.mode}">
        <span class="snake-mode__icon" aria-hidden="true">${m.icon}</span>
        <span class="snake-mode__name">${snakeEsc(snakeModeName(m.id))}</span>
        <span class="snake-mode__best">${best ? `🏆 ${best}` : ''}</span>
      </button>`;
  }).join('');
  const skins = Object.keys(SNAKE_SKINS).map((id) => {
    const skin = SNAKE_SKINS[id];
    const bg = skin.rainbow ? 'linear-gradient(90deg,#f43f5e,#f59e0b,#22c55e,#3b82f6,#a855f7)' : `linear-gradient(90deg, ${skin.from}, ${skin.to})`;
    const name = t(`snake.skins.${id}`);
    return `<button type="button" class="snake-swatch${id === s.skin ? ' is-active' : ''}" data-snake-set="skin" data-value="${id}" style="background:${bg}" title="${snakeEsc(name)}" aria-label="${snakeEsc(name)}" aria-pressed="${id === s.skin}"></button>`;
  }).join('');
  const themes = Object.keys(SNAKE_THEMES).map((id) => {
    const theme = SNAKE_THEMES[id];
    const name = t(`snake.themes.${id}`);
    return `<button type="button" class="snake-swatch snake-swatch--board${id === s.theme ? ' is-active' : ''}" data-snake-set="theme" data-value="${id}" style="background:repeating-conic-gradient(${theme.light} 0 25%, ${theme.dark} 0 50%) 0 0 / 12px 12px; border-color:${theme.frame}" title="${snakeEsc(name)}" aria-label="${snakeEsc(name)}" aria-pressed="${id === s.theme}"></button>`;
  }).join('');
  const unlockedCount = SNAKE_TROPHIES.filter((tr) => data.trophies[tr.id]).length;
  const trophies = SNAKE_TROPHIES.map((tr) => {
    const date = data.trophies[tr.id];
    return `<li class="snake-trophy${date ? ' is-unlocked' : ''}" title="${snakeEsc(t(`snake.trophies.${tr.id}.desc`))}">
      <span class="snake-trophy__icon" aria-hidden="true">${date ? tr.icon : '🔒'}</span>
      <span class="snake-trophy__text"><strong>${snakeEsc(t(`snake.trophies.${tr.id}.name`))}</strong><small>${snakeEsc(t(`snake.trophies.${tr.id}.desc`))}</small></span>
    </li>`;
  }).join('');

  el.side.innerHTML = `
    <div class="snake-card snake-daily${dailyDone ? ' is-done' : ''}">
      <div class="snake-daily__head">
        <strong>📅 ${snakeEsc(t('snake.daily.title'))}</strong>
        ${streak ? `<span class="snake-daily__streak">${snakeEsc(t('snake.daily.streak', { n: streak }))}</span>` : ''}
      </div>
      <p class="snake-daily__desc">${dailyMode.icon} ${snakeEsc(snakeModeName(daily.mode))}${daily.obstacles ? ` ${snakeEsc(t('snake.daily.obstacles'))}` : ''} · ${snakeEsc(t(`snake.speeds.${daily.speed}`))} · ${daily.apples}&nbsp;🍎</p>
      <p class="snake-daily__goal">${snakeEsc(t('snake.daily.goal', { goal: daily.goal }))}${dailyBest ? ` · ${snakeEsc(t('snake.daily.best', { score: dailyBest }))}` : ''}${dailyDone ? ` · ${snakeEsc(t('snake.daily.done'))}` : ''}</p>
      <button type="button" class="snake-btn-ghost" data-snake-action="daily">${snakeEsc(t('snake.daily.go'))}</button>
    </div>
    <div class="snake-card">
      <h3 class="snake-card__title">${snakeEsc(t('snake.modeTitle'))}</h3>
      <div class="snake-modes">${modes}</div>
      <p class="snake-mode-desc">${snakeEsc(t(`snake.modes.${s.mode}.desc`))}</p>
    </div>
    <div class="snake-card">
      <h3 class="snake-card__title">${snakeEsc(t('snake.optionsTitle'))}</h3>
      <div class="snake-option"><span>${snakeEsc(t('snake.speed'))}</span>${snakeSegButtons('speed', Object.keys(SNAKE_SPEEDS).map((id) => ({ value: id, label: t(`snake.speeds.${id}`) })), s.speed, t('snake.speed'))}</div>
      ${s.speed === 'turbo' ? `<p class="snake-option__hint">${snakeEsc(t('snake.turboHint'))}</p>` : ''}
      <div class="snake-option"><span>${snakeEsc(t('snake.size'))}</span>${snakeSegButtons('size', Object.keys(SNAKE_SIZES).map((id) => ({ value: id, label: t(`snake.sizes.${id}`) })), s.size, t('snake.size'))}</div>
      <div class="snake-option"><span>${snakeEsc(t('snake.apples'))}</span>${snakeSegButtons('apples', SNAKE_APPLE_CHOICES.map((n) => ({ value: n, label: `${n} 🍎` })), s.apples, t('snake.apples'))}</div>
      <div class="snake-option"><span>${snakeEsc(t('snake.skin'))}</span><div class="snake-swatches">${skins}</div></div>
      <div class="snake-option"><span>${snakeEsc(t('snake.theme'))}</span><div class="snake-swatches">${themes}</div></div>
    </div>
    <div class="snake-card">
      <h3 class="snake-card__title">${snakeEsc(t('snake.soundTitle'))}</h3>
      <div class="snake-option">
        <span>${snakeEsc(t('snake.sound'))}</span>
        ${snakeSegButtons('sound', [{ value: 'true', label: 'On' }, { value: 'false', label: 'Off' }], String(s.sound), t('snake.sound'))}
      </div>
      <div class="snake-option">
        <span>${snakeEsc(t('snake.music'))}</span>
        ${snakeSegButtons('music', [{ value: 'true', label: 'On' }, { value: 'false', label: 'Off' }], String(s.music), t('snake.music'))}
      </div>
      <label class="snake-option"><span>${snakeEsc(t('snake.volume'))}</span><input type="range" min="0" max="100" step="5" value="${Math.round(s.volume * 100)}" data-snake-volume></label>
    </div>
    <button type="button" class="snake-play" data-snake-action="play">${snakeEsc(t('snake.play'))}</button>
    <details class="snake-card snake-details">
      <summary>🏅 ${snakeEsc(t('snake.trophiesTitle', { count: unlockedCount, total: SNAKE_TROPHIES.length }))}</summary>
      <ul class="snake-trophies">${trophies}</ul>
    </details>
    <details class="snake-card snake-details">
      <summary>📊 ${snakeEsc(t('snake.statsTitle'))}</summary>
      <dl class="snake-stats">
        <div><dt>${snakeEsc(t('snake.stats.games'))}</dt><dd>${data.stats.games}</dd></div>
        <div><dt>${snakeEsc(t('snake.stats.apples'))}</dt><dd>${data.stats.apples}</dd></div>
        <div><dt>${snakeEsc(t('snake.stats.longest'))}</dt><dd>${data.stats.longest}</dd></div>
        <div><dt>${snakeEsc(t('snake.stats.time'))}</dt><dd>${snakeFormatTime(data.stats.timeMs)}</dd></div>
        <div><dt>${snakeEsc(t('snake.stats.dailyDone'))}</dt><dd>${snakeDailyDoneCount(data)}</dd></div>
      </dl>
    </details>
    <p class="hint snake-controls-hint">${snakeEsc(t(snk.coarse ? 'snake.controlsTouch' : 'snake.controls'))}</p>`;
}

function snakeRenderAll() {
  snakeRenderHud();
  snakeRenderOverlay();
  snakeRenderSide();
}

function snakeApplySetting(name, value) {
  const s = snakeSettings();
  if (name === 'apples') s.apples = Number(value);
  else if (name === 'sound' || name === 'music') s[name] = value === 'true';
  else s[name] = value;
  if (name === 'music' && !s.music) snakeMusicStop();
  if (name === 'music' && s.music && snk.view === 'running') snakeMusicStart();
  saveData();
  snakeAudioReady();
  snakeSfx('select');
  if (['mode', 'size', 'apples'].includes(name) || snk.view === 'over') {
    if (snk.view === 'over') snk.view = 'menu';
    snakeNewDemo();
  }
  if (name === 'theme') snakeLayout();
  snakeRenderAll();
  snakeEnsureLoop();
}

/* ── Commandes ─────────────────────────────────────────────── */

function snakeHandleKey(event) {
  if (getActiveTabId() !== 'snake' || !snk.el) return;
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const target = event.target;
  if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
  if (document.querySelector('.modal:not([hidden])')) return;
  const key = event.key.toLowerCase();
  const onButton = target && target.tagName === 'BUTTON';
  const dir = SNAKE_KEYMAP[key];
  if (dir) {
    event.preventDefault();
    snakeInput(dir);
    return;
  }
  if (key === ' ' || key === 'p') {
    if (onButton && key === ' ') return;
    event.preventDefault();
    snakeTogglePause();
  } else if (key === 'enter') {
    if (onButton) return;
    if (snk.view === 'menu' || snk.view === 'over' || snk.view === 'ready') {
      event.preventDefault();
      snakeTogglePause();
    }
  } else if (key === 'escape') {
    if (snk.view === 'running') pauseSnake();
    else if (snk.view === 'paused') resumeSnake();
    else if (snk.view === 'over' || snk.view === 'ready') snakeToMenu();
  } else if (key === 'm') {
    snakeApplySetting('sound', String(!snakeSettings().sound));
  }
}

function snakeHandleClick(event) {
  const action = event.target.closest('[data-snake-action]');
  if (action) {
    snakeAudioReady();
    const name = action.dataset.snakeAction;
    if (name === 'play') snakePlay();
    else if (name === 'daily') snakePlay({ daily: true });
    else if (name === 'replay') snakePlay({ daily: Boolean(snk.game && snk.game.daily) });
    else if (name === 'resume') resumeSnake();
    else if (name === 'restart') snakePlay({ daily: Boolean(snk.game && snk.game.daily) });
    else if (name === 'end') snakeQuit();
    else if (name === 'menu') snakeToMenu();
    return;
  }
  const setting = event.target.closest('[data-snake-set]');
  if (setting) snakeApplySetting(setting.dataset.snakeSet, setting.dataset.value);
}

function snakeBindTouch() {
  const { stage } = snk.el;
  stage.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse') return;
    snk.touch = { x: event.clientX, y: event.clientY };
  });
  stage.addEventListener('pointermove', (event) => {
    if (!snk.touch || event.pointerType === 'mouse') return;
    const dx = event.clientX - snk.touch.x;
    const dy = event.clientY - snk.touch.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 22) return;
    snakeInput(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
    snk.touch = { x: event.clientX, y: event.clientY };
  });
  const release = () => {
    snk.touch = null;
  };
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);
  snk.el.dpad.addEventListener('pointerdown', (event) => {
    const button = event.target.closest('[data-dir]');
    if (!button) return;
    event.preventDefault();
    snakeInput(button.dataset.dir);
  });
}

/* ── Points d'entrée appelés par script.js ─────────────────── */

// Changement de langue.
function renderSnakeTexts() {
  if (!snk.el) return;
  snk.el.dpad.querySelectorAll('[data-dir]').forEach((button) => {
    button.setAttribute('aria-label', t(`snake.dpad.${button.dataset.dir}`));
  });
  snakeRenderAll();
}

// Données rechargées (synchro, import, annulation).
function refreshSnake() {
  if (!snk.el) return;
  ensureSnakeData();
  if (snk.view === 'menu' || snk.view === 'over') snakeRenderSide();
  snakeUpdateHud();
}

function snakeOnTabShown() {
  if (!snk.el) return;
  snakeLayout();
  snakeEnsureLoop();
}

function initSnake() {
  const panel = document.getElementById('snake');
  const canvas = document.getElementById('snake-canvas');
  if (!panel || !canvas) return;
  ensureSnakeData();
  snk.el = {
    panel,
    canvas,
    stage: document.getElementById('snake-stage'),
    boardWrap: document.getElementById('snake-board-wrap'),
    overlay: document.getElementById('snake-overlay'),
    side: document.getElementById('snake-side'),
    dpad: document.getElementById('snake-dpad'),
    score: document.getElementById('snake-score'),
    best: document.getElementById('snake-best'),
    timer: document.getElementById('snake-timer'),
    scoreChip: document.getElementById('snake-score-chip'),
    bestChip: document.getElementById('snake-best-chip'),
    timerChip: document.getElementById('snake-timer-chip'),
    combo: document.getElementById('snake-combo'),
    pause: document.getElementById('snake-pause'),
    sound: document.getElementById('snake-sound'),
    music: document.getElementById('snake-music'),
    menuBtn: document.getElementById('snake-menu'),
    status: document.getElementById('snake-status')
  };
  snk.ctx = canvas.getContext('2d');
  snk.coarse = Boolean(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);

  panel.addEventListener('click', snakeHandleClick);
  panel.addEventListener('input', (event) => {
    if (!event.target.matches('[data-snake-volume]')) return;
    snakeSettings().volume = Number(event.target.value) / 100;
    if (snakeAudio.master) snakeAudio.master.gain.value = snakeSettings().volume;
  });
  panel.addEventListener('change', (event) => {
    if (!event.target.matches('[data-snake-volume]')) return;
    saveData();
    snakeAudioReady();
    snakeSfx('eat', { combo: 3 });
  });
  snk.el.pause.addEventListener('click', () => snakeTogglePause());
  snk.el.sound.addEventListener('click', () => snakeApplySetting('sound', String(!snakeSettings().sound)));
  snk.el.music.addEventListener('click', () => snakeApplySetting('music', String(!snakeSettings().music)));
  // En pleine partie, la partie compte (record, stats) avant de revenir au menu.
  snk.el.menuBtn.addEventListener('click', () => {
    if (snk.game && ['running', 'paused', 'dying'].includes(snk.view)) {
      if (snk.game.alive) {
        snk.game.alive = false;
        snk.game.reason = 'quit';
      }
      snakeFinish(snk.game);
    }
    snakeToMenu();
  });
  document.addEventListener('keydown', snakeHandleKey);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pauseSnake();
    else snakeEnsureLoop();
  });
  window.addEventListener('resize', () => {
    if (snakeVisible()) snakeLayout();
  });
  if (window.ResizeObserver) {
    new ResizeObserver(() => {
      if (snakeVisible()) snakeLayout();
    }).observe(snk.el.boardWrap);
  }
  snakeBindTouch();

  snakeNewDemo();
  renderSnakeTexts();
  snakeEnsureLoop();
}
