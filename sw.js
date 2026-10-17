/* Service worker : rend l'app installable et utilisable hors ligne.
   Stratégie « réseau d'abord » pour toujours servir la dernière version,
   avec repli sur le cache hors connexion. */
const CACHE_NAME = 'mydesk-shell-v92';
const APP_SHELL = [
  './',
  'index.html',
  'styles.css',
  'script.js',
  'eco.js',
  'translations.js',
  'calendar.js',
  'mindmap.js',
  'gantt.js',
  'notes.js',
  'daily-challenges.js',
  'appearance.js',
  'sync.js',
  'calendar-feed.js',
  'restore.js',
  'calendar-conflicts.js',
  'calendar-goals.js',
  'calendar-reminders.js',
  'ical.js',
  'print.js',
  'undo.js',
  'sport-library.js',
  'sport.js',
  'sport-guided.js',
  'sport-history.js',
  'snake.js',
  'menu-engine.js',
  'menu.js',
  'install.js',
  'vendor/ts-fsrs.umd.js',
  'anki.js',
  'news.js',
  'tab-order.js',
  'patch-notes.js',
  'todo.js',
  'onboarding.js',
  'version.json',
  'manifest.webmanifest',
  'MyDeskOnlineLogo.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-192.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png',
  'icons/favicon-48.png',
  'settings_icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  // Ne gère que les fichiers de l'app (pas l'API GitHub, les polices, etc.).
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    // no-cache : toujours revalider auprès du serveur (évite un CSS/JS périmé).
    fetch(request, { cache: 'no-cache' })
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request, { ignoreSearch: true }).then((cached) => cached || caches.match('index.html')))
  );
});

// Clic sur un rappel de l'agenda : revenir sur MyDesk (onglet déjà ouvert de
// préférence), qui ouvre ce que le rappel indique (ex. la séance de sport).
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const open = windows.find((client) => 'focus' in client);
      if (open) {
        open.postMessage({ type: 'mydesk-notification-click', data });
        return open.focus();
      }
      return self.clients.openWindow ? self.clients.openWindow(data.url || './') : undefined;
    })
  );
});
