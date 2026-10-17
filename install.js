/* ═══════════════════════════════════════════════════════════
   INSTALLATION DE L'APPLICATION (PWA)
   - Chrome / Edge / Android : bouton « Installer » quand le
     navigateur le permet (évènement beforeinstallprompt).
   - iPhone / iPad (Safari) : pas d'installation déclenchable par
     le site ; un bandeau explique Partager → Sur l'écran d'accueil.
   - Rien n'est affiché si l'app est déjà installée.
   ═══════════════════════════════════════════════════════════ */

const INSTALL_IOS_KEY = 'mydesk-install-ios-ferme';

const INSTALL_TRANSLATIONS = {
  fr: {
    button: '📲 Installer',
    buttonTitle: "Installer MyDesk comme une application",
    iosText: "Pour installer MyDesk : touche Partager, puis « Sur l'écran d'accueil ».",
    close: 'Fermer'
  },
  en: {
    button: '📲 Install',
    buttonTitle: 'Install MyDesk as an app',
    iosText: 'To install MyDesk: tap Share, then "Add to Home Screen".',
    close: 'Close'
  },
  vi: {
    button: '📲 Cài đặt',
    buttonTitle: 'Cài MyDesk như một ứng dụng',
    iosText: 'Để cài MyDesk: nhấn Chia sẻ, rồi "Thêm vào MH chính".',
    close: 'Đóng'
  }
};

let installPromptEvent = null;

function registerInstallTranslations() {
  Object.keys(INSTALL_TRANSLATIONS).forEach((language) => {
    if (translations[language]) translations[language].install = INSTALL_TRANSLATIONS[language];
  });
}

function isAppInstalled() {
  return (
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    window.navigator.standalone === true
  );
}

function isIosSafari() {
  const ua = window.navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1);
  return ios && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
}

// Le navigateur signale que l'app est installable : on garde l'évènement
// pour le rejouer au clic (il ne peut être déclenché que par l'utilisateur).
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  installPromptEvent = event;
  const bouton = document.getElementById('install-button');
  if (bouton) bouton.hidden = false;
});

window.addEventListener('appinstalled', () => {
  installPromptEvent = null;
  const bouton = document.getElementById('install-button');
  if (bouton) bouton.hidden = true;
});

function initInstall() {
  const bouton = document.getElementById('install-button');
  if (bouton) {
    bouton.hidden = !installPromptEvent || isAppInstalled();
    bouton.addEventListener('click', async () => {
      if (!installPromptEvent) return;
      installPromptEvent.prompt();
      try {
        await installPromptEvent.userChoice;
      } finally {
        installPromptEvent = null;
        bouton.hidden = true;
      }
    });
  }

  const bandeau = document.getElementById('install-ios');
  let ferme = false;
  try {
    ferme = localStorage.getItem(INSTALL_IOS_KEY) === '1';
  } catch (error) {
    ferme = false;
  }
  if (bandeau && isIosSafari() && !isAppInstalled() && !ferme) {
    bandeau.hidden = false;
    document.getElementById('install-ios-close').addEventListener('click', () => {
      bandeau.hidden = true;
      try {
        localStorage.setItem(INSTALL_IOS_KEY, '1');
      } catch (error) {
        // ignoré
      }
    });
  }
}
