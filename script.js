const DATA_KEY = 'mydesk-data';
const DATA_FILE_NAME = 'mydesk-data.json';
const defaultData = {
  storagePath: '',
  calendar: {
    events: [],
    lastWeekStart: null,
    types: []
  },
  mindmap: {
    maps: [],
    activeMapId: null
  },
  todo: {
    blocks: []
  },
  gantt: {
    charts: [],
    activeChartId: null
  },
  tabs: {
    visibility: {
      calendar: true,
      mindmap: true,
      todo: true,
      gantt: true,
      trackirigo: true
    }
  }
};

const OPTIONAL_TABS = [
  { id: 'calendar', labelKey: 'tabs.calendar' },
  { id: 'mindmap', labelKey: 'tabs.mindmap' },
  { id: 'todo', labelKey: 'tabs.todo' },
  { id: 'gantt', labelKey: 'tabs.gantt' },
  { id: 'trackirigo', labelKey: 'tabs.track' }
];

const DEFAULT_EVENT_COLOR = '#10b981';
const MIN_EVENT_DURATION = 15;
const EVENT_DURATION_STEP = 15;
const CALENDAR_START_HOUR = 7;
const CALENDAR_END_HOUR = 22;
const CALENDAR_END_MINUTE = (CALENDAR_END_HOUR + 1) * 60;
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const GANTT_ROW_HEIGHT = 56;
const GANTT_DAY_WIDTH = 64;
const VERSION_INDICATOR_ID = 'version-indicator';
const DEFAULT_VERSION_SOURCE = 'https://raw.githubusercontent.com/NapGames-Dev/MyDeskOnline/main/version.json';
const LOCAL_VERSION_INFO = {
  version: '1.3.0',
  versionCheckUrl: 'https://raw.githubusercontent.com/NapGames-Dev/MyDeskOnline/main/version.json'
};
const VERSION_INDICATOR_STATES = {
  loading: 'loading',
  upToDate: 'up-to-date',
  updateAvailable: 'update-available',
  error: 'error'
};

const LANGUAGE_KEY = 'mydesk-language';
const LANGUAGE_FALLBACK = 'fr';
const SUPPORTED_LANGUAGES = ['fr', 'en', 'vi'];
const LANGUAGE_LOCALES = {
  fr: 'fr-FR',
  en: 'en-US',
  vi: 'vi-VN'
};

const translations = {
  fr: {
    language: {
      label: 'Langue',
      selectAria: 'Choisir la langue',
      french: 'Français',
      english: 'Anglais',
      vietnamese: 'Vietnamien'
    },
    app: { title: 'MyDesk Online - By Nap' },
    tabs: {
      home: 'Accueil',
      settings: 'Paramètres',
      settingsAria: 'Onglet paramètres',
      calendar: 'Agenda',
      mindmap: 'Cartes mentales',
      todo: 'To Do List',
      gantt: 'GANTT',
      track: "Track'Irigo"
    },
    home: {
      heading: 'Configuration et sauvegarde',
      description: 'Sélectionnez un dossier local pour enregistrer vos données ou indiquez un chemin manuel. Les données sont également conservées dans votre navigateur pour un accès rapide.',
      storagePathLabel: 'Chemin de sauvegarde',
      storagePathPlaceholder: '/chemin/vers/mon/dossier',
      chooseFolder: 'Choisir un dossier',
      exportJson: 'Exporter les données (JSON)',
      importJson: 'Importer un fichier JSON'
    },
    storage: {
      savedToDisk: 'Données enregistrées sur le disque.',
      saveError: "Impossible d'enregistrer le fichier de données.",
      loadedFromDisk: 'Données chargées depuis le disque.',
      loadedFromBrowser: 'Données chargées depuis le navigateur.',
      folderUnsupported: 'Votre navigateur ne permet pas la sélection de dossier.',
      permissionDenied: 'Permission refusée pour accéder au dossier.',
      folderSelected: 'Dossier de sauvegarde sélectionné.',
      folderSelectionFailed: 'Sélection du dossier annulée ou impossible.',
      exportSuccess: 'Export JSON généré.',
      importSuccess: 'Données importées avec succès.',
      importInvalid: "Le fichier importé n'est pas valide."
    },
    version: {
      checking: 'Vérification...',
      upToDate: 'À jour',
      updateAvailable: 'Mise à jour disponible',
      error: 'Vérification impossible'
    },
    calendar: {
      today: "Aujourd'hui",
      hint: 'Astuce : utilisez les flèches du clavier pour naviguer de semaine.',
      eventTypesTitle: "Types d'évènements",
      eventTypeNameLabel: 'Nom du type',
      eventTypeNamePlaceholder: 'Nom du type',
      eventTypeColorLabel: 'Couleur',
      eventTypeAdd: 'Ajouter un type',
      eventTypeEmpty: 'Ajoutez un type pour colorer vos évènements.',
      eventTypeNone: 'Aucun',
      eventTypeUntitled: 'Sans titre',
      eventTypeNoName: 'Type sans nom',
      deleteTypeConfirm: "Supprimer ce type d'évènement ?",
      defaultTypeName: 'Type {index}',
      hourLabel: '{hour}h',
      prevWeekLabel: 'Semaine précédente',
      nextWeekLabel: 'Semaine suivante',
      eventDefaultTitle: 'Évènement',
      eventDeleteTitle: 'Supprimer',
      newEventTitle: 'Nouvel évènement',
      eventModal: {
        createTitle: 'Nouvel évènement',
        editTitle: "Modifier l'évènement",
        titleLabel: 'Titre',
        datetimeLabel: 'Date et heure',
        durationLabel: 'Durée (minutes)',
        typeLabel: "Type d'évènement",
        colorLabel: 'Couleur',
        recurrenceLabel: 'Répétition',
        typeNone: 'Aucun',
        recurrence: {
          none: 'Aucune',
          daily: 'Quotidienne',
          weekly: 'Hebdomadaire',
          monthly: 'Mensuelle',
          yearly: 'Annuelle'
        },
        save: 'Enregistrer',
        cancel: 'Annuler'
      }
    },
    mindmap: {
      addNode: 'Ajouter une bulle',
      deleteNode: 'Supprimer',
      linkNodes: 'Relier',
      linkNodesActive: 'Relier (choisir la cible)',
      colorLabel: 'Couleur',
      title: 'Cartes mentales',
      addMap: 'Nouvelle carte',
      renameMap: 'Renommer',
      deleteMap: 'Supprimer la carte',
      hint: 'Astuce : faites glisser les bulles pour les déplacer, double-cliquez pour renommer.',
      newBubble: 'Nouvelle bulle',
      defaultIdeaName: 'Idée {index}',
      defaultMapName: 'Carte {index}',
      untitledMap: 'Carte sans nom',
      untitledNode: 'Sans titre',
      renamePrompt: 'Nom de la carte',
      lastMapAlert: 'Impossible de supprimer la dernière carte.',
      deleteConfirm: 'Supprimer la carte "{name}" ?'
    },
    todo: {
      addBlock: 'Ajouter un bloc',
      newBlock: 'Nouveau bloc',
      empty: 'Ajoutez un bloc pour commencer votre liste de tâches.',
      deleteBlockConfirm: 'Supprimer ce bloc et toutes ses tâches ?',
      deleteBlock: 'Supprimer',
      addTask: 'Ajouter une tâche',
      newTask: 'Nouvelle tâche',
      defaultItemName: 'Tâche {index}',
      defaultBlockName: 'Bloc {index}'
    },
    gantt: {
      sidebarTitle: 'Schémas GANTT',
      addChart: 'Nouveau schéma',
      renameChart: 'Renommer',
      deleteChart: 'Supprimer',
      headerTitle: 'Créez un schéma GANTT pour commencer',
      headerHint: 'Ajoutez des tâches avec leurs dates de début et de fin pour visualiser votre planning.',
      addTask: 'Ajouter une tâche',
      emptySelection: 'Aucun schéma sélectionné.',
      table: {
        task: 'Tâche',
        start: 'Début',
        end: 'Fin',
        progress: 'Progression'
      },
      listEmpty: 'Créez un schéma GANTT pour commencer.',
      boardEmpty: 'Ajoutez une tâche pour construire votre planning.',
      timelinePlaceholder: 'Ajoutez des tâches avec des dates pour afficher le diagramme.',
      newChartPrompt: 'Nom du nouveau schéma GANTT',
      defaultChartName: 'Schéma {index}',
      renameChartPrompt: 'Nouveau nom du schéma',
      chartUntitled: 'Schéma sans nom',
      renameChartAlert: 'Créez un schéma avant de le renommer.',
      noChartToDelete: 'Aucun schéma à supprimer.',
      deleteChartConfirm: 'Supprimer ce schéma GANTT et toutes ses tâches ?',
      addTaskAlert: 'Créez un schéma avant d’ajouter des tâches.',
      newTaskName: 'Nouvelle tâche {index}',
      defaultTaskName: 'Tâche {index}',
      deleteTaskConfirm: 'Supprimer cette tâche du planning ?',
      barFallback: 'Tâche'
    },
    track: {
      iframeTitle: "Track'Irigo – Carte Irigo"
    },
    settings: {
      title: 'Paramètres',
      description: 'Choisissez les onglets que vous souhaitez afficher.'
    }
  },
  en: {
    language: {
      label: 'Language',
      selectAria: 'Choose a language',
      french: 'French',
      english: 'English',
      vietnamese: 'Vietnamese'
    },
    app: { title: 'MyDesk Online - By Nap' },
    tabs: {
      home: 'Home',
      settings: 'Settings',
      settingsAria: 'Settings tab',
      calendar: 'Calendar',
      mindmap: 'Mind Maps',
      todo: 'To-Do List',
      gantt: 'GANTT',
      track: "Track'Irigo"
    },
    home: {
      heading: 'Configuration and backup',
      description: 'Select a local folder to store your data or enter a manual path. Your data is also kept in the browser for quick access.',
      storagePathLabel: 'Backup path',
      storagePathPlaceholder: '/path/to/my/folder',
      chooseFolder: 'Choose a folder',
      exportJson: 'Export data (JSON)',
      importJson: 'Import a JSON file'
    },
    storage: {
      savedToDisk: 'Data saved to disk.',
      saveError: 'Unable to save the data file.',
      loadedFromDisk: 'Data loaded from disk.',
      loadedFromBrowser: 'Data loaded from the browser.',
      folderUnsupported: 'Your browser does not allow folder selection.',
      permissionDenied: 'Permission denied to access the folder.',
      folderSelected: 'Backup folder selected.',
      folderSelectionFailed: 'Folder selection was canceled or failed.',
      exportSuccess: 'JSON export generated.',
      importSuccess: 'Data imported successfully.',
      importInvalid: 'The imported file is not valid.'
    },
    version: {
      checking: 'Checking...',
      upToDate: 'Up to date',
      updateAvailable: 'Update available',
      error: 'Unable to check'
    },
    calendar: {
      today: 'Today',
      hint: 'Tip: use the arrow keys to move between weeks.',
      eventTypesTitle: 'Event types',
      eventTypeNameLabel: 'Type name',
      eventTypeNamePlaceholder: 'Type name',
      eventTypeColorLabel: 'Color',
      eventTypeAdd: 'Add type',
      eventTypeEmpty: 'Add a type to color your events.',
      eventTypeNone: 'None',
      eventTypeUntitled: 'Untitled',
      eventTypeNoName: 'Unnamed type',
      deleteTypeConfirm: 'Delete this event type?',
      defaultTypeName: 'Type {index}',
      hourLabel: '{hour}:00',
      prevWeekLabel: 'Previous week',
      nextWeekLabel: 'Next week',
      eventDefaultTitle: 'Event',
      eventDeleteTitle: 'Delete',
      newEventTitle: 'New event',
      eventModal: {
        createTitle: 'New event',
        editTitle: 'Edit event',
        titleLabel: 'Title',
        datetimeLabel: 'Date & time',
        durationLabel: 'Duration (minutes)',
        typeLabel: 'Event type',
        colorLabel: 'Color',
        recurrenceLabel: 'Repeat',
        typeNone: 'None',
        recurrence: {
          none: 'None',
          daily: 'Daily',
          weekly: 'Weekly',
          monthly: 'Monthly',
          yearly: 'Yearly'
        },
        save: 'Save',
        cancel: 'Cancel'
      }
    },
    mindmap: {
      addNode: 'Add bubble',
      deleteNode: 'Delete',
      linkNodes: 'Link',
      linkNodesActive: 'Link (choose target)',
      colorLabel: 'Color',
      title: 'Mind maps',
      addMap: 'New map',
      renameMap: 'Rename',
      deleteMap: 'Delete map',
      hint: 'Tip: drag bubbles to move them, double-click to rename.',
      newBubble: 'New bubble',
      defaultIdeaName: 'Idea {index}',
      defaultMapName: 'Map {index}',
      untitledMap: 'Untitled map',
      untitledNode: 'Untitled',
      renamePrompt: 'Map name',
      lastMapAlert: 'The last map cannot be deleted.',
      deleteConfirm: 'Delete the map "{name}"?'
    },
    todo: {
      addBlock: 'Add block',
      newBlock: 'New block',
      empty: 'Add a block to start your task list.',
      deleteBlockConfirm: 'Delete this block and all of its tasks?',
      deleteBlock: 'Delete',
      addTask: 'Add task',
      newTask: 'New task',
      defaultItemName: 'Task {index}',
      defaultBlockName: 'Block {index}'
    },
    gantt: {
      sidebarTitle: 'GANTT charts',
      addChart: 'New chart',
      renameChart: 'Rename',
      deleteChart: 'Delete',
      headerTitle: 'Create a GANTT chart to get started',
      headerHint: 'Add tasks with their start and end dates to visualize your plan.',
      addTask: 'Add task',
      emptySelection: 'No chart selected.',
      table: {
        task: 'Task',
        start: 'Start',
        end: 'End',
        progress: 'Progress'
      },
      listEmpty: 'Create a GANTT chart to get started.',
      boardEmpty: 'Add a task to build your plan.',
      timelinePlaceholder: 'Add dated tasks to display the timeline.',
      newChartPrompt: 'Name of the new GANTT chart',
      defaultChartName: 'Chart {index}',
      renameChartPrompt: 'New chart name',
      chartUntitled: 'Untitled chart',
      renameChartAlert: 'Create a chart before renaming it.',
      noChartToDelete: 'No chart to delete.',
      deleteChartConfirm: 'Delete this GANTT chart and all of its tasks?',
      addTaskAlert: 'Create a chart before adding tasks.',
      newTaskName: 'New task {index}',
      defaultTaskName: 'Task {index}',
      deleteTaskConfirm: 'Delete this task from the schedule?',
      barFallback: 'Task'
    },
    track: {
      iframeTitle: "Track'Irigo – Irigo map"
    },
    settings: {
      title: 'Settings',
      description: 'Choose which tabs you want to display.'
    }
  },
  vi: {
    language: {
      label: 'Ngôn ngữ',
      selectAria: 'Chọn ngôn ngữ',
      french: 'Tiếng Pháp',
      english: 'Tiếng Anh',
      vietnamese: 'Tiếng Việt'
    },
    app: { title: 'MyDesk Online - By Nap' },
    tabs: {
      home: 'Trang chủ',
      settings: 'Cài đặt',
      settingsAria: 'Thẻ cài đặt',
      calendar: 'Lịch',
      mindmap: 'Sơ đồ tư duy',
      todo: 'Danh sách công việc',
      gantt: 'GANTT',
      track: "Track'Irigo"
    },
    home: {
      heading: 'Thiết lập và sao lưu',
      description: 'Chọn một thư mục cục bộ để lưu dữ liệu của bạn hoặc nhập đường dẫn thủ công. Dữ liệu cũng được lưu trong trình duyệt để truy cập nhanh.',
      storagePathLabel: 'Đường dẫn sao lưu',
      storagePathPlaceholder: '/duong/dan/den/thu-muc',
      chooseFolder: 'Chọn thư mục',
      exportJson: 'Xuất dữ liệu (JSON)',
      importJson: 'Nhập tệp JSON'
    },
    storage: {
      savedToDisk: 'Đã lưu dữ liệu vào đĩa.',
      saveError: 'Không thể lưu tệp dữ liệu.',
      loadedFromDisk: 'Đã tải dữ liệu từ đĩa.',
      loadedFromBrowser: 'Đã tải dữ liệu từ trình duyệt.',
      folderUnsupported: 'Trình duyệt của bạn không cho phép chọn thư mục.',
      permissionDenied: 'Không được phép truy cập thư mục.',
      folderSelected: 'Đã chọn thư mục sao lưu.',
      folderSelectionFailed: 'Việc chọn thư mục bị hủy hoặc thất bại.',
      exportSuccess: 'Đã tạo tệp JSON xuất.',
      importSuccess: 'Nhập dữ liệu thành công.',
      importInvalid: 'Tệp được nhập không hợp lệ.'
    },
    version: {
      checking: 'Đang kiểm tra...',
      upToDate: 'Đã cập nhật',
      updateAvailable: 'Có bản cập nhật',
      error: 'Không thể kiểm tra'
    },
    calendar: {
      today: 'Hôm nay',
      hint: 'Mẹo: dùng các phím mũi tên để chuyển tuần.',
      eventTypesTitle: 'Loại sự kiện',
      eventTypeNameLabel: 'Tên loại',
      eventTypeNamePlaceholder: 'Tên loại',
      eventTypeColorLabel: 'Màu sắc',
      eventTypeAdd: 'Thêm loại',
      eventTypeEmpty: 'Thêm một loại để tô màu sự kiện của bạn.',
      eventTypeNone: 'Không',
      eventTypeUntitled: 'Chưa đặt tên',
      eventTypeNoName: 'Loại chưa đặt tên',
      deleteTypeConfirm: 'Xóa loại sự kiện này?',
      defaultTypeName: 'Loại {index}',
      hourLabel: '{hour}h',
      prevWeekLabel: 'Tuần trước',
      nextWeekLabel: 'Tuần sau',
      eventDefaultTitle: 'Sự kiện',
      eventDeleteTitle: 'Xóa',
      newEventTitle: 'Sự kiện mới',
      eventModal: {
        createTitle: 'Sự kiện mới',
        editTitle: 'Chỉnh sửa sự kiện',
        titleLabel: 'Tiêu đề',
        datetimeLabel: 'Ngày & giờ',
        durationLabel: 'Thời lượng (phút)',
        typeLabel: 'Loại sự kiện',
        colorLabel: 'Màu sắc',
        recurrenceLabel: 'Lặp lại',
        typeNone: 'Không',
        recurrence: {
          none: 'Không',
          daily: 'Hằng ngày',
          weekly: 'Hằng tuần',
          monthly: 'Hằng tháng',
          yearly: 'Hằng năm'
        },
        save: 'Lưu',
        cancel: 'Hủy'
      }
    },
    mindmap: {
      addNode: 'Thêm bong bóng',
      deleteNode: 'Xóa',
      linkNodes: 'Liên kết',
      linkNodesActive: 'Liên kết (chọn nút đích)',
      colorLabel: 'Màu sắc',
      title: 'Sơ đồ tư duy',
      addMap: 'Sơ đồ mới',
      renameMap: 'Đổi tên',
      deleteMap: 'Xóa sơ đồ',
      hint: 'Mẹo: kéo các bong bóng để di chuyển chúng, nhấp đúp để đổi tên.',
      newBubble: 'Bong bóng mới',
      defaultIdeaName: 'Ý tưởng {index}',
      defaultMapName: 'Sơ đồ {index}',
      untitledMap: 'Sơ đồ chưa có tên',
      untitledNode: 'Chưa có tên',
      renamePrompt: 'Tên sơ đồ',
      lastMapAlert: 'Không thể xóa sơ đồ cuối cùng.',
      deleteConfirm: 'Xóa sơ đồ "{name}"?'
    },
    todo: {
      addBlock: 'Thêm khối',
      newBlock: 'Khối mới',
      empty: 'Thêm một khối để bắt đầu danh sách công việc.',
      deleteBlockConfirm: 'Xóa khối này và toàn bộ công việc bên trong?',
      deleteBlock: 'Xóa',
      addTask: 'Thêm công việc',
      newTask: 'Công việc mới',
      defaultItemName: 'Công việc {index}',
      defaultBlockName: 'Khối {index}'
    },
    gantt: {
      sidebarTitle: 'Sơ đồ GANTT',
      addChart: 'Sơ đồ mới',
      renameChart: 'Đổi tên',
      deleteChart: 'Xóa',
      headerTitle: 'Tạo sơ đồ GANTT để bắt đầu',
      headerHint: 'Thêm các nhiệm vụ với ngày bắt đầu và kết thúc để trực quan hóa kế hoạch của bạn.',
      addTask: 'Thêm nhiệm vụ',
      emptySelection: 'Chưa chọn sơ đồ nào.',
      table: {
        task: 'Nhiệm vụ',
        start: 'Bắt đầu',
        end: 'Kết thúc',
        progress: 'Tiến độ'
      },
      listEmpty: 'Tạo một sơ đồ GANTT để bắt đầu.',
      boardEmpty: 'Thêm một nhiệm vụ để xây dựng kế hoạch của bạn.',
      timelinePlaceholder: 'Thêm các nhiệm vụ có ngày để hiển thị biểu đồ.',
      newChartPrompt: 'Tên sơ đồ GANTT mới',
      defaultChartName: 'Sơ đồ {index}',
      renameChartPrompt: 'Tên sơ đồ mới',
      chartUntitled: 'Sơ đồ chưa có tên',
      renameChartAlert: 'Hãy tạo một sơ đồ trước khi đổi tên.',
      noChartToDelete: 'Không có sơ đồ nào để xóa.',
      deleteChartConfirm: 'Xóa sơ đồ GANTT này và mọi nhiệm vụ của nó?',
      addTaskAlert: 'Hãy tạo một sơ đồ trước khi thêm nhiệm vụ.',
      newTaskName: 'Nhiệm vụ mới {index}',
      defaultTaskName: 'Nhiệm vụ {index}',
      deleteTaskConfirm: 'Xóa nhiệm vụ này khỏi kế hoạch?',
      barFallback: 'Nhiệm vụ'
    },
    track: {
      iframeTitle: "Track'Irigo – Bản đồ Irigo"
    },
    settings: {
      title: 'Cài đặt',
      description: 'Chọn các thẻ bạn muốn hiển thị.'
    }
  }
};

let currentLanguage = getInitialLanguage();
document.documentElement.setAttribute('lang', currentLanguage);
let localVersionInfo = null;
let versionCheckPromise = null;
let versionIndicatorStatus = {
  state: VERSION_INDICATOR_STATES.loading,
  labelKey: 'version.checking'
};

let appData = cloneDefault();
let currentWeekStart = startOfWeek(new Date());
let calendarCellMap = new Map();
let dayOverlayMap = new Map();
let selectedNodeId = null;
let linkMode = false;
let linkSourceId = null;
let folderHandle = null;
let handleDBPromise = null;
let saveTimer = null;
let calendarHourHeight = 48;
let resizeState = null;
let lastStorageStatus = null;
let tabLinks = [];
let activateTabHandler = null;

function cloneDefault() {
  return JSON.parse(JSON.stringify(defaultData));
}

function startOfWeek(date) {
  const result = new Date(date);
  const day = result.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function formatDate(date, options = {}) {
  const formatOptions = {
    weekday: options.weekday ? options.weekday : 'long',
    day: '2-digit',
    month: 'short'
  };
  if (options.year) {
    formatOptions.year = 'numeric';
  }
  return date.toLocaleDateString(getCurrentLocale(), formatOptions);
}

function formatTime(date) {
  return date.toLocaleTimeString(getCurrentLocale(), {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getInitialLanguage() {
  try {
    const stored = localStorage.getItem(LANGUAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.includes(stored)) {
      return stored;
    }
  } catch (error) {
    console.warn('Impossible de lire la langue sauvegardée', error);
  }
  const browserLanguage =
    typeof navigator !== 'undefined' && navigator.language
      ? navigator.language.slice(0, 2).toLowerCase()
      : LANGUAGE_FALLBACK;
  if (SUPPORTED_LANGUAGES.includes(browserLanguage)) {
    return browserLanguage;
  }
  return LANGUAGE_FALLBACK;
}

function persistLanguagePreference(language) {
  try {
    localStorage.setItem(LANGUAGE_KEY, language);
  } catch (error) {
    console.warn('Impossible de stocker la langue sélectionnée', error);
  }
}

function getCurrentLocale() {
  return LANGUAGE_LOCALES[currentLanguage] || LANGUAGE_LOCALES[LANGUAGE_FALLBACK];
}

function t(key, variables = {}) {
  const resolveValue = (language) => {
    const source = translations[language];
    if (!source) return undefined;
    return key.split('.').reduce((acc, part) => {
      if (acc && typeof acc === 'object' && part in acc) {
        return acc[part];
      }
      return undefined;
    }, source);
  };
  let template = resolveValue(currentLanguage);
  if (typeof template === 'undefined') {
    template = resolveValue(LANGUAGE_FALLBACK);
  }
  if (typeof template === 'string') {
    return template.replace(/\{(\w+)\}/g, (match, token) =>
      Object.prototype.hasOwnProperty.call(variables, token) ? variables[token] : match
    );
  }
  return template !== undefined ? template : key;
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.getAttribute('data-i18n');
    if (!key) return;
    const translation = t(key);
    if (typeof translation === 'string') {
      element.textContent = translation;
    }
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    const key = element.getAttribute('data-i18n-placeholder');
    if (key) {
      element.setAttribute('placeholder', t(key));
    }
  });
  document.querySelectorAll('[data-i18n-title]').forEach((element) => {
    const key = element.getAttribute('data-i18n-title');
    if (key) {
      element.setAttribute('title', t(key));
    }
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
    const key = element.getAttribute('data-i18n-aria-label');
    if (key) {
      element.setAttribute('aria-label', t(key));
    }
  });
  document.title = t('app.title');
  const select = document.getElementById('language-select');
  if (select) {
    select.value = currentLanguage;
  }
}

function refreshVersionIndicator() {
  if (versionIndicatorStatus && versionIndicatorStatus.labelKey) {
    setVersionIndicatorState(versionIndicatorStatus.state, versionIndicatorStatus.labelKey);
  }
}

function refreshStorageStatus() {
  if (lastStorageStatus) {
    const { messageKey, type, variables } = lastStorageStatus;
    updateStorageStatus(messageKey, type, variables);
  }
}

function setLanguage(language) {
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    return;
  }
  if (language === currentLanguage) {
    applyTranslations();
    refreshStorageStatus();
    refreshVersionIndicator();
    syncLinkButton();
    return;
  }
  currentLanguage = language;
  document.documentElement.setAttribute('lang', currentLanguage);
  persistLanguagePreference(language);
  applyTranslations();
  renderCalendar();
  renderEventTypes();
  renderMindmapList();
  renderMindmap();
  renderGantt();
  renderTodo();
  renderTabVisibilitySettings();
  refreshStorageStatus();
  refreshVersionIndicator();
  syncLinkButton();
}

function initLocalization() {
  applyTranslations();
  const select = document.getElementById('language-select');
  if (select) {
    select.value = currentLanguage;
    select.addEventListener('change', (event) => {
      setLanguage(event.target.value);
    });
  }
  refreshVersionIndicator();
  refreshStorageStatus();
  syncLinkButton();
}

function toISODateString(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return new Date().toISOString().split('T')[0];
  }
  const normalized = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return normalized.toISOString().split('T')[0];
}

function parseDateOnly(value) {
  if (typeof value !== 'string') return null;
  const parts = value.split('-');
  if (parts.length !== 3) return null;
  const [year, month, day] = parts.map((part) => Number(part));
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

function diffDays(start, end) {
  if (!(start instanceof Date) || !(end instanceof Date)) return 0;
  return Math.round((end.getTime() - start.getTime()) / DAY_IN_MS);
}

function uid() {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

function ensureHandleDB() {
  if (!('indexedDB' in window)) {
    return Promise.resolve(null);
  }
  if (!handleDBPromise) {
    handleDBPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open('mydesk-handles', 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('handles')) {
          db.createObjectStore('handles');
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return handleDBPromise;
}

async function storeFolderHandle(handle) {
  const db = await ensureHandleDB();
  if (!db) return;
  await new Promise((resolve, reject) => {
    const tx = db.transaction('handles', 'readwrite');
    const store = tx.objectStore('handles');
    const req = store.put(handle, 'data-folder');
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function readStoredHandle() {
  const db = await ensureHandleDB();
  if (!db) return null;
  return new Promise((resolve, reject) => {
    const tx = db.transaction('handles', 'readonly');
    const store = tx.objectStore('handles');
    const req = store.get('data-folder');
    req.onsuccess = () => resolve(typeof req.result !== 'undefined' ? req.result : null);
    req.onerror = () => reject(req.error);
  });
}

async function clearStoredHandle() {
  const db = await ensureHandleDB();
  if (!db) return;
  await new Promise((resolve, reject) => {
    const tx = db.transaction('handles', 'readwrite');
    const store = tx.objectStore('handles');
    const req = store.delete('data-folder');
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function ensurePermission(handle) {
  if (!handle) return false;
  if (!handle.requestPermission) return false;
  const options = { mode: 'readwrite' };
  if (handle.queryPermission) {
    const status = await handle.queryPermission(options);
    if (status === 'granted') {
      return true;
    }
  }
  const permission = await handle.requestPermission(options);
  return permission === 'granted';
}

function loadFromLocalStorage() {
  const raw = localStorage.getItem(DATA_KEY);
  if (!raw) {
    return cloneDefault();
  }
  try {
    const parsed = JSON.parse(raw);
    return {
      ...cloneDefault(),
      ...parsed,
      calendar: {
        ...cloneDefault().calendar,
        ...(parsed.calendar ? parsed.calendar : {})
      },
      mindmap: {
        ...cloneDefault().mindmap,
        ...(parsed.mindmap ? parsed.mindmap : {})
      },
      todo: {
        ...cloneDefault().todo,
        ...(parsed.todo ? parsed.todo : {})
      },
      gantt: {
        ...cloneDefault().gantt,
        ...(parsed.gantt ? parsed.gantt : {})
      }
    };
  } catch (error) {
    console.warn('Impossible de lire les données locales, réinitialisation.', error);
    return cloneDefault();
  }
}

async function loadFromFileSystem() {
  try {
    const storedHandle = await readStoredHandle();
    if (!storedHandle) return null;
    if (!(await ensurePermission(storedHandle))) {
      await clearStoredHandle();
      return null;
    }
    folderHandle = storedHandle;
    const fileHandle = await folderHandle.getFileHandle(DATA_FILE_NAME).catch(() => null);
    if (!fileHandle) return null;
    const file = await fileHandle.getFile();
    const text = await file.text();
    const parsed = JSON.parse(text);
    return parsed;
  } catch (error) {
    console.warn('Lecture du fichier de données impossible.', error);
    return null;
  }
}

function persistToLocalStorage() {
  localStorage.setItem(DATA_KEY, JSON.stringify(appData));
}

function scheduleFileSave() {
  if (!folderHandle) return;
  if (saveTimer) {
    clearTimeout(saveTimer);
  }
  saveTimer = setTimeout(async () => {
    saveTimer = null;
    try {
      const fileHandle = await folderHandle.getFileHandle(DATA_FILE_NAME, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(appData, null, 2));
      await writable.close();
      updateStorageStatus('storage.savedToDisk', 'success');
    } catch (error) {
      console.error('Écriture du fichier impossible', error);
      updateStorageStatus('storage.saveError', 'error');
    }
  }, 600);
}

function saveData() {
  persistToLocalStorage();
  scheduleFileSave();
}

function migrateData() {
  if (!appData.calendar || typeof appData.calendar !== 'object') {
    appData.calendar = cloneDefault().calendar;
  }
  if (!Array.isArray(appData.calendar.events)) {
    appData.calendar.events = [];
  }
  if (!Array.isArray(appData.calendar.types)) {
    appData.calendar.types = [];
  }

  appData.calendar.types = appData.calendar.types.map((type, index) => {
    const normalized = {
      id: type && type.id ? type.id : uid(),
      name: type && type.name ? type.name : t('calendar.defaultTypeName', { index: index + 1 }),
      color: type && type.color ? type.color : DEFAULT_EVENT_COLOR
    };
    return normalized;
  });

  const typeMap = new Map(appData.calendar.types.map((type) => [type.id, type]));

  appData.calendar.events = appData.calendar.events.map((event) => {
    const normalized = { ...event };
    normalized.id = normalized.id ? normalized.id : uid();
    normalized.recurrence = normalized.recurrence ? normalized.recurrence : 'none';
    normalized.duration = Number(normalized.duration);
    if (Number.isNaN(normalized.duration) || normalized.duration <= 0) {
      normalized.duration = 60;
    }
    if (normalized.duration < MIN_EVENT_DURATION) {
      normalized.duration = MIN_EVENT_DURATION;
    }
    if (normalized.typeId && !typeMap.has(normalized.typeId)) {
      normalized.typeId = '';
    }
    if (!normalized.color) {
      if (normalized.typeId && typeMap.has(normalized.typeId)) {
        normalized.color = typeMap.get(normalized.typeId).color;
      } else {
        normalized.color = DEFAULT_EVENT_COLOR;
      }
    }
    return normalized;
  });

  if (!appData.mindmap || typeof appData.mindmap !== 'object') {
    appData.mindmap = cloneDefault().mindmap;
  }

  if (Array.isArray(appData.mindmap.nodes) || Array.isArray(appData.mindmap.links)) {
    const nodes = Array.isArray(appData.mindmap.nodes) ? appData.mindmap.nodes : [];
    const links = Array.isArray(appData.mindmap.links) ? appData.mindmap.links : [];
    const defaultId = uid();
    appData.mindmap = {
      maps: [
        {
          id: defaultId,
          name: t('mindmap.defaultMapName', { index: 1 }),
          nodes,
          links
        }
      ],
      activeMapId: defaultId
    };
  }

  if (!Array.isArray(appData.mindmap.maps)) {
    appData.mindmap.maps = [];
  }

  appData.mindmap.maps = appData.mindmap.maps.map((map, index) => {
    const nodeIds = new Set();
    const nodes = Array.isArray(map && map.nodes)
      ? map.nodes.map((node, nodeIndex) => {
          const normalizedNode = {
            id: node && node.id ? node.id : uid(),
            title: node && node.title ? node.title : t('mindmap.defaultIdeaName', { index: nodeIndex + 1 }),
            color: node && node.color ? node.color : '#4e73df',
            x: typeof node === 'object' && typeof node.x === 'number' ? node.x : 100,
            y: typeof node === 'object' && typeof node.y === 'number' ? node.y : 100
          };
          nodeIds.add(normalizedNode.id);
          return normalizedNode;
        })
      : [];

    const links = Array.isArray(map && map.links)
      ? map.links
          .map((link) => ({
            id: link && link.id ? link.id : uid(),
            from: link && link.from ? link.from : null,
            to: link && link.to ? link.to : null
          }))
          .filter((link) => link.from && link.to && nodeIds.has(link.from) && nodeIds.has(link.to))
      : [];

    return {
      id: map && map.id ? map.id : uid(),
      name: map && map.name ? map.name : t('mindmap.defaultMapName', { index: index + 1 }),
      nodes,
      links
    };
  });

  if (appData.mindmap.maps.length === 0) {
    const fallbackId = uid();
    appData.mindmap.maps.push({ id: fallbackId, name: t('mindmap.defaultMapName', { index: 1 }), nodes: [], links: [] });
    appData.mindmap.activeMapId = fallbackId;
  }

  if (!appData.mindmap.activeMapId || !appData.mindmap.maps.some((map) => map.id === appData.mindmap.activeMapId)) {
    appData.mindmap.activeMapId = appData.mindmap.maps[0].id;
  }

  if (!appData.todo || typeof appData.todo !== 'object') {
    appData.todo = cloneDefault().todo;
  }

  if (!Array.isArray(appData.todo.blocks)) {
    appData.todo.blocks = [];
  }

  appData.todo.blocks = appData.todo.blocks.map((block, index) => {
    const items = Array.isArray(block && block.items)
      ? block.items.map((item, itemIndex) => ({
          id: item && item.id ? item.id : uid(),
          text: item && item.text ? item.text : t('todo.defaultItemName', { index: itemIndex + 1 }),
          done: Boolean(item && item.done)
        }))
      : [];

    return {
      id: block && block.id ? block.id : uid(),
      title: block && block.title ? block.title : t('todo.defaultBlockName', { index: index + 1 }),
      items
    };
  });

  if (!appData.gantt || typeof appData.gantt !== 'object') {
    appData.gantt = cloneDefault().gantt;
  }

  if (!Array.isArray(appData.gantt.charts)) {
    appData.gantt.charts = [];
  }

  const todayISO = new Date().toISOString().split('T')[0];

  appData.gantt.charts = appData.gantt.charts.map((chart, index) => {
    const chartId = chart && chart.id ? chart.id : uid();
    const tasks = Array.isArray(chart && chart.tasks)
      ? chart.tasks.map((task, taskIndex) => {
          const startValue = task && task.start ? task.start : todayISO;
          const endValue = task && task.end ? task.end : startValue;

          let startDate = parseDateOnly(typeof startValue === 'string' ? startValue : '');
          if (!startDate && typeof startValue === 'string' && startValue.includes('T')) {
            startDate = parseDateOnly(startValue.split('T')[0]);
          }
          if (!startDate) {
            startDate = parseDateOnly(todayISO) || new Date();
          }

          let endDate = parseDateOnly(typeof endValue === 'string' ? endValue : '');
          if (!endDate && typeof endValue === 'string' && endValue.includes('T')) {
            endDate = parseDateOnly(endValue.split('T')[0]);
          }
          if (!endDate) {
            endDate = new Date(startDate);
          }
          if (endDate < startDate) {
            endDate = new Date(startDate);
          }

          const normalizedStart = toISODateString(startDate);
          const normalizedEnd = toISODateString(endDate);
          const rawProgress = Number(task && task.progress);
          const clampedProgress = Number.isFinite(rawProgress) ? Math.min(100, Math.max(0, rawProgress)) : 0;
          return {
            id: task && task.id ? task.id : uid(),
            name: task && task.name ? task.name : t('gantt.defaultTaskName', { index: taskIndex + 1 }),
            start: normalizedStart,
            end: normalizedEnd,
            progress: clampedProgress
          };
        })
      : [];
    return {
      id: chartId,
      name: chart && chart.name ? chart.name : t('gantt.defaultChartName', { index: index + 1 }),
      tasks
    };
  });

  if (appData.gantt.charts.length === 0) {
    appData.gantt.activeChartId = null;
  } else if (!appData.gantt.activeChartId || !appData.gantt.charts.some((chart) => chart.id === appData.gantt.activeChartId)) {
    appData.gantt.activeChartId = appData.gantt.charts[0].id;
  }

  if (!appData.tabs || typeof appData.tabs !== 'object') {
    appData.tabs = cloneDefault().tabs;
  }
  if (!appData.tabs.visibility || typeof appData.tabs.visibility !== 'object') {
    appData.tabs.visibility = { ...cloneDefault().tabs.visibility };
  }
  OPTIONAL_TABS.forEach((tab) => {
    if (typeof appData.tabs.visibility[tab.id] !== 'boolean') {
      appData.tabs.visibility[tab.id] = true;
    }
  });
}

function updateStorageStatus(messageKey, type = 'info', variables = {}) {
  lastStorageStatus = { messageKey, type, variables };
  const status = document.getElementById('storage-status');
  if (!status) return;
  status.textContent = t(messageKey, variables);
  status.className = `storage-status ${type}`;
}

async function initData() {
  appData = loadFromLocalStorage();
  const fileData = await loadFromFileSystem();
  if (fileData) {
    appData = {
      ...cloneDefault(),
      ...fileData,
      calendar: {
        ...cloneDefault().calendar,
        ...(fileData.calendar ? fileData.calendar : appData.calendar)
      },
      mindmap: {
        ...cloneDefault().mindmap,
        ...(fileData.mindmap ? fileData.mindmap : appData.mindmap)
      },
      todo: {
        ...cloneDefault().todo,
        ...(fileData.todo ? fileData.todo : appData.todo)
      },
      gantt: {
        ...cloneDefault().gantt,
        ...(fileData.gantt ? fileData.gantt : appData.gantt)
      },
      tabs: {
        ...cloneDefault().tabs,
        ...(fileData.tabs ? fileData.tabs : appData.tabs)
      }
    };
    updateStorageStatus('storage.loadedFromDisk', 'success');
  } else {
    updateStorageStatus('storage.loadedFromBrowser', 'info');
  }
  migrateData();
  if (appData.calendar.lastWeekStart) {
    currentWeekStart = startOfWeek(new Date(appData.calendar.lastWeekStart));
  }
}

function initTabs() {
  tabLinks = Array.from(document.querySelectorAll('.tab-link'));
  const activateTab = (link) => {
    tabLinks.forEach((l) => l.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach((panel) => panel.classList.remove('active'));
    link.classList.add('active');
    document.getElementById(link.dataset.target).classList.add('active');

    if (link.dataset.target === 'calendar') {
      requestAnimationFrame(() => {
        renderCalendar();
        renderEventTypes();
      });
    } else if (link.dataset.target === 'gantt') {
      requestAnimationFrame(() => {
        renderGantt();
      });
    }
  };
  activateTabHandler = activateTab;
  applyTabVisibility();
  tabLinks.forEach((link) => {
    link.addEventListener('click', () => {
      activateTab(link);
      checkVersionStatus();
    });
  });

  const initiallyActive =
    tabLinks.find((link) => link.classList.contains('active') && !link.classList.contains('is-hidden')) ||
    tabLinks.find((link) => !link.classList.contains('is-hidden'));
  if (initiallyActive) {
    activateTab(initiallyActive);
  }
}

function getTabVisibility(tabId) {
  if (!appData.tabs || !appData.tabs.visibility) {
    return true;
  }
  if (typeof appData.tabs.visibility[tabId] === 'boolean') {
    return appData.tabs.visibility[tabId];
  }
  return true;
}

function applyTabVisibility() {
  const links = tabLinks.length ? tabLinks : Array.from(document.querySelectorAll('.tab-link'));
  OPTIONAL_TABS.forEach((tab) => {
    const visible = getTabVisibility(tab.id);
    const button = document.querySelector(`.tab-link[data-target="${tab.id}"]`);
    const panel = document.getElementById(tab.id);
    if (button) {
      button.classList.toggle('is-hidden', !visible);
      button.setAttribute('aria-hidden', visible ? 'false' : 'true');
    }
    if (panel) {
      panel.classList.toggle('is-hidden', !visible);
    }
  });

  if (activateTabHandler && links.length > 0) {
    const activeLink = links.find((link) => link.classList.contains('active'));
    if (activeLink && activeLink.classList.contains('is-hidden')) {
      const fallback = links.find((link) => !link.classList.contains('is-hidden'));
      if (fallback) {
        activateTabHandler(fallback);
      }
    }
  }
}

function renderTabVisibilitySettings() {
  const container = document.getElementById('tab-visibility-settings');
  if (!container) return;
  container.innerHTML = '';

  OPTIONAL_TABS.forEach((tab) => {
    const wrapper = document.createElement('label');
    wrapper.className = 'settings-toggle';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = getTabVisibility(tab.id);
    checkbox.addEventListener('change', () => {
      appData.tabs.visibility[tab.id] = checkbox.checked;
      applyTabVisibility();
      saveData();
    });

    const label = document.createElement('span');
    label.textContent = t(tab.labelKey);

    wrapper.appendChild(checkbox);
    wrapper.appendChild(label);
    container.appendChild(wrapper);
  });
}

function initSettings() {
  renderTabVisibilitySettings();
  applyTabVisibility();
}

function getVersionIndicator() {
  return document.getElementById(VERSION_INDICATOR_ID);
}

function setVersionIndicatorState(state, labelKey) {
  versionIndicatorStatus = { state, labelKey };
  const indicator = getVersionIndicator();
  if (!indicator) return;
  indicator.classList.remove(
    VERSION_INDICATOR_STATES.loading,
    VERSION_INDICATOR_STATES.upToDate,
    VERSION_INDICATOR_STATES.updateAvailable,
    VERSION_INDICATOR_STATES.error
  );
  indicator.classList.add(state);
  indicator.textContent = t(labelKey);
}

async function loadLocalVersionInfo() {
  if (localVersionInfo) {
    return localVersionInfo;
  }

  // 1. Cas où le site est ouvert en file:// -> on ne tente PAS de fetch local
  if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
    localVersionInfo = LOCAL_VERSION_INFO;
    return localVersionInfo;
  }

  // 2. Cas où le site est servi en http(s) -> on peut utiliser version.json
  const response = await fetch('version.json', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Version locale introuvable');
  }
  const payload = await response.json();
  if (!payload.version) {
    throw new Error('Version locale manquante');
  }
  localVersionInfo = payload;
  return payload;
}

function resolveRemoteVersionUrl(localInfo) {
  if (typeof window !== 'undefined' && window.MYDESK_VERSION_SOURCE) {
    return window.MYDESK_VERSION_SOURCE;
  }
  if (localInfo && typeof localInfo.versionCheckUrl === 'string' && localInfo.versionCheckUrl.trim()) {
    return localInfo.versionCheckUrl.trim();
  }
  return DEFAULT_VERSION_SOURCE;
}

async function fetchRemoteVersionInfo(remoteUrl) {
  if (!remoteUrl) {
    throw new Error('URL distante non définie');
  }
  const url = `${remoteUrl}${remoteUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Impossible de joindre ${remoteUrl}`);
  }
  const payload = await response.json();
  if (!payload.version) {
    throw new Error('Réponse distante incomplète');
  }
  return payload;
}

function versionsMatch(localInfo, remoteInfo) {
  return localInfo.version === remoteInfo.version;
}

function checkVersionStatus() {
  if (!getVersionIndicator()) {
    return Promise.resolve();
  }
  if (!versionCheckPromise) {
    setVersionIndicatorState(VERSION_INDICATOR_STATES.loading, 'version.checking');
    versionCheckPromise = (async () => {
      try {
        const localInfo = await loadLocalVersionInfo();
        const remoteInfo = await fetchRemoteVersionInfo(resolveRemoteVersionUrl(localInfo));
        if (versionsMatch(localInfo, remoteInfo)) {
          setVersionIndicatorState(VERSION_INDICATOR_STATES.upToDate, 'version.upToDate');
        } else {
          setVersionIndicatorState(VERSION_INDICATOR_STATES.updateAvailable, 'version.updateAvailable');
        }
      } catch (error) {
        console.error('Impossible de vérifier la version', error);
        setVersionIndicatorState(VERSION_INDICATOR_STATES.error, 'version.error');
      }
    })().finally(() => {
      versionCheckPromise = null;
    });
  }
  return versionCheckPromise;
}

function initVersionIndicator() {
  const indicator = getVersionIndicator();
  if (!indicator) return;
  indicator.addEventListener('click', () => {
    checkVersionStatus();
  });
  checkVersionStatus();
}

function initStorageControls() {
  const pathInput = document.getElementById('storage-path');
  const chooseBtn = document.getElementById('choose-folder');
  const exportBtn = document.getElementById('export-json');
  const importBtn = document.getElementById('import-json');
  const importInput = document.getElementById('import-input');

  pathInput.value = appData.storagePath ? appData.storagePath : '';
  pathInput.addEventListener('input', () => {
    appData.storagePath = pathInput.value;
    saveData();
  });

  chooseBtn.addEventListener('click', async () => {
    if (!window.showDirectoryPicker) {
      updateStorageStatus('storage.folderUnsupported', 'error');
      return;
    }
    try {
      const handle = await window.showDirectoryPicker();
      const granted = await ensurePermission(handle);
      if (!granted) {
        updateStorageStatus('storage.permissionDenied', 'error');
        return;
      }
      folderHandle = handle;
      await storeFolderHandle(handle);
      appData.storagePath = handle && handle.name ? handle.name : '';
      saveData();
      pathInput.value = appData.storagePath;
      updateStorageStatus('storage.folderSelected', 'success');
    } catch (error) {
      if (!error || error.name !== 'AbortError') {
        console.error(error);
        updateStorageStatus('storage.folderSelectionFailed', 'error');
      }
    }
  });

  exportBtn.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(appData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const timestamp = new Date().toISOString().split('T')[0];
    a.download = `mydesk-export-${timestamp}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    updateStorageStatus('storage.exportSuccess', 'success');
  });

  importBtn.addEventListener('click', () => {
    importInput.click();
  });

  importInput.addEventListener('change', async () => {
    const file = importInput.files && importInput.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      appData = {
        ...cloneDefault(),
        ...imported,
        calendar: {
          ...cloneDefault().calendar,
          ...(imported.calendar ? imported.calendar : {})
        },
        mindmap: {
          ...cloneDefault().mindmap,
          ...(imported.mindmap ? imported.mindmap : {})
        },
        todo: {
          ...cloneDefault().todo,
          ...(imported.todo ? imported.todo : {})
        },
        gantt: {
          ...cloneDefault().gantt,
          ...(imported.gantt ? imported.gantt : {})
        },
        tabs: {
          ...cloneDefault().tabs,
          ...(imported.tabs ? imported.tabs : {})
        }
      };
      migrateData();
      if (appData.calendar.lastWeekStart) {
        currentWeekStart = startOfWeek(new Date(appData.calendar.lastWeekStart));
      } else {
        currentWeekStart = startOfWeek(new Date());
      }
      saveData();
      renderCalendar();
      renderEventTypes();
      renderMindmapList();
      renderMindmap();
      renderTodo();
      renderTabVisibilitySettings();
      applyTabVisibility();
      pathInput.value = appData.storagePath ? appData.storagePath : '';
      updateStorageStatus('storage.importSuccess', 'success');
    } catch (error) {
      console.error(error);
      updateStorageStatus('storage.importInvalid', 'error');
    }
    importInput.value = '';
  });
}

function renderCalendar() {
  const grid = document.getElementById('calendar-grid');
  if (!grid) return;
  calendarCellMap = new Map();
  grid.innerHTML = '';

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + index);
    return date;
  });

  const topLeft = document.createElement('div');
  topLeft.className = 'time-slot';
  grid.appendChild(topLeft);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  days.forEach((day) => {
    const header = document.createElement('div');
    header.className = 'day-header';
    const weekday = day.toLocaleDateString(getCurrentLocale(), { weekday: 'long' });
    const formattedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
    header.innerHTML = `<span>${formattedWeekday}</span><strong>${day.getDate()}</strong>`;
    if (day.getTime() === today.getTime()) {
      header.classList.add('today');
    }
    header.dataset.date = day.toISOString();
    grid.appendChild(header);
  });

  for (let hour = CALENDAR_START_HOUR; hour <= CALENDAR_END_HOUR; hour += 1) {
    const timeCell = document.createElement('div');
    timeCell.className = 'time-slot';
    const paddedHour = hour.toString().padStart(2, '0');
    timeCell.textContent = t('calendar.hourLabel', { hour: paddedHour });
    grid.appendChild(timeCell);

    days.forEach((day, index) => {
      const cell = document.createElement('div');
      cell.className = 'hour-cell';
      const cellDate = new Date(day);
      cellDate.setHours(0, 0, 0, 0);
      if (cellDate.getTime() === today.getTime()) {
        cell.classList.add('today');
      }
      cell.dataset.dayIndex = index;
      cell.dataset.hour = hour;
      cell.dataset.date = cellDate.toISOString();
      cell.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        const baseDate = new Date(cell.dataset.date);
        baseDate.setHours(hour, 0, 0, 0);
        openEventModal({ start: baseDate });
      });
      calendarCellMap.set(`${cell.dataset.date}-${hour}`, cell);
      grid.appendChild(cell);
    });
  }

  updateWeekLabel();
  renderCalendarEvents();
}

function updateWeekLabel() {
  const label = document.getElementById('week-label');
  if (!label) return;
  const endDate = new Date(currentWeekStart);
  endDate.setDate(endDate.getDate() + 6);
  const locale = getCurrentLocale();
  const startText = currentWeekStart.toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' });
  const endText = endDate.toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' });
  label.textContent = `${startText} – ${endText}`;
}

function getEventTypeById(id) {
  if (!id) return null;
  return appData.calendar.types.find((type) => type.id === id) || null;
}

function getEventColor(event) {
  if (!event) return DEFAULT_EVENT_COLOR;
  if (event.color) {
    return event.color;
  }
  const type = getEventTypeById(event.typeId);
  if (type) {
    return type.color;
  }
  return DEFAULT_EVENT_COLOR;
}

function updateEventsForTypeColor(type, previousColor) {
  appData.calendar.events.forEach((event) => {
    if (event.typeId === type.id) {
      if (!event.color || event.color === previousColor) {
        event.color = type.color;
      }
    }
  });
}

function updateEventTypeSelect(selectedId) {
  const select = document.getElementById('event-type');
  if (!select) return;
  const current = typeof selectedId === 'string' ? selectedId : select.value;
  select.innerHTML = '';
  const noneOption = document.createElement('option');
  noneOption.value = '';
  noneOption.textContent = t('calendar.eventTypeNone');
  select.appendChild(noneOption);
  appData.calendar.types.forEach((type) => {
    const option = document.createElement('option');
    option.value = type.id;
    option.textContent = type.name || t('calendar.eventTypeUntitled');
    select.appendChild(option);
  });
  if (current && appData.calendar.types.some((type) => type.id === current)) {
    select.value = current;
  } else {
    select.value = '';
  }
}

function removeEventType(typeId) {
  appData.calendar.types = appData.calendar.types.filter((type) => type.id !== typeId);
  appData.calendar.events.forEach((event) => {
    if (event.typeId === typeId) {
      event.typeId = '';
    }
  });
  saveData();
  renderEventTypes();
  renderCalendarEvents();
}

function renderEventTypes() {
  const list = document.getElementById('event-type-list');
  if (!list) return;
  list.innerHTML = '';

  if (appData.calendar.types.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'event-type-empty';
    empty.textContent = t('calendar.eventTypeEmpty');
    list.appendChild(empty);
  } else {
    appData.calendar.types.forEach((type) => {
      const item = document.createElement('div');
      item.className = 'event-type-item';

      const colorInput = document.createElement('input');
      colorInput.type = 'color';
      colorInput.value = type.color || DEFAULT_EVENT_COLOR;
      colorInput.addEventListener('input', () => {
        const previousColor = type.color;
        type.color = colorInput.value;
        updateEventsForTypeColor(type, previousColor);
        saveData();
        renderCalendarEvents();
      });

      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.value = type.name || t('calendar.eventTypeUntitled');
      nameInput.addEventListener('input', () => {
        type.name = nameInput.value;
        updateEventTypeSelect(type.id);
        saveData();
      });
      nameInput.addEventListener('blur', () => {
        const trimmed = nameInput.value.trim();
        if (!trimmed) {
          type.name = t('calendar.eventTypeNoName');
          nameInput.value = type.name;
        } else {
          type.name = trimmed;
        }
        updateEventTypeSelect(type.id);
        saveData();
        renderEventTypes();
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.textContent = '✕';
      deleteBtn.addEventListener('click', () => {
        if (!confirm(t('calendar.deleteTypeConfirm'))) return;
        removeEventType(type.id);
      });

      item.appendChild(colorInput);
      item.appendChild(nameInput);
      item.appendChild(deleteBtn);
      list.appendChild(item);
    });
  }

  updateEventTypeSelect();
}

function getOccurrencesForWeek(event) {
  const occurrences = [];
  const weekStart = new Date(currentWeekStart);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const base = new Date(event.start);
  const baseDay = base.getDate();
  const baseMonth = base.getMonth();
  const duration = Number(typeof event.duration === 'number' ? event.duration : 60);
  if (Number.isNaN(duration) || duration <= 0) {
    return occurrences;
  }

  if (!event.recurrence || event.recurrence === 'none') {
    if (base >= weekStart && base < weekEnd) {
      occurrences.push({ start: new Date(base), duration, sourceEvent: event });
    }
    return occurrences;
  }

  let occurrence = new Date(base);
  const maxIterations = 366;
  let iterations = 0;

  if (occurrence < weekStart) {
    switch (event.recurrence) {
      case 'daily': {
        const diffDays = Math.floor((weekStart - occurrence) / (24 * 60 * 60 * 1000));
        occurrence.setDate(occurrence.getDate() + diffDays);
        while (occurrence < weekStart) {
          occurrence.setDate(occurrence.getDate() + 1);
        }
        break;
      }
      case 'weekly': {
        const diffWeeks = Math.floor((weekStart - occurrence) / (7 * 24 * 60 * 60 * 1000));
        occurrence.setDate(occurrence.getDate() + diffWeeks * 7);
        while (occurrence < weekStart) {
          occurrence.setDate(occurrence.getDate() + 7);
        }
        break;
      }
      case 'monthly': {
        while (occurrence < weekStart && iterations < maxIterations) {
          occurrence.setMonth(occurrence.getMonth() + 1);
          occurrence.setDate(Math.min(baseDay, daysInMonth(occurrence.getFullYear(), occurrence.getMonth())));
          iterations += 1;
        }
        iterations = 0;
        break;
      }
      case 'yearly': {
        while (occurrence < weekStart && iterations < maxIterations) {
          occurrence.setFullYear(occurrence.getFullYear() + 1);
          occurrence.setMonth(baseMonth);
          occurrence.setDate(Math.min(baseDay, daysInMonth(occurrence.getFullYear(), baseMonth)));
          iterations += 1;
        }
        iterations = 0;
        break;
      }
      default:
        break;
    }
  }

  while (occurrence < weekEnd && iterations < maxIterations) {
    if (occurrence >= weekStart) {
      occurrences.push({ start: new Date(occurrence), duration, sourceEvent: event });
    }
    iterations += 1;
    switch (event.recurrence) {
      case 'daily':
        occurrence.setDate(occurrence.getDate() + 1);
        break;
      case 'weekly':
        occurrence.setDate(occurrence.getDate() + 7);
        break;
      case 'monthly': {
        occurrence.setMonth(occurrence.getMonth() + 1);
        occurrence.setDate(Math.min(baseDay, daysInMonth(occurrence.getFullYear(), occurrence.getMonth())));
        break;
      }
      case 'yearly':
        occurrence.setFullYear(occurrence.getFullYear() + 1);
        occurrence.setMonth(baseMonth);
        occurrence.setDate(Math.min(baseDay, daysInMonth(occurrence.getFullYear(), baseMonth)));
        break;
      default:
        iterations = maxIterations;
        break;
    }
  }

  return occurrences;
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function renderCalendarEvents() {
  calendarCellMap.forEach((cell) => {
    cell.querySelectorAll('.event').forEach((node) => node.remove());
  });

  // 2) Mesurer la hauteur d’une heure pour le positionnement
  const anyCell = calendarCellMap.values().next().value;
  calendarHourHeight = anyCell ? anyCell.getBoundingClientRect().height : 48;

  // 3) Calculer les occurrences de la semaine
  const weekEvents = appData.calendar.events
    .flatMap((event) => getOccurrencesForWeek(event))
    .sort((a, b) => a.start - b.start);

  // 4) Dessiner chaque occurrence dans la cellule de départ
  weekEvents.forEach((occ) => {
    const startDate = new Date(occ.start);

    // Trouver la cellule (jour minuit + heure de départ)
    const startHour = startDate.getHours();
    if (startHour < CALENDAR_START_HOUR || startHour > CALENDAR_END_HOUR) {
      return;
    }

    const dayStart = new Date(startDate);
    dayStart.setHours(0, 0, 0, 0);
    const key = `${dayStart.toISOString()}-${startHour}`;
    const cell = calendarCellMap.get(key);
    if (!cell) return;

    // Créer l'élément event
    const eventEl = document.createElement('div');
    eventEl.className = 'event';
    eventEl.style.setProperty('--event-color', getEventColor(occ.sourceEvent));

    // Contenu (titre + horaire)
    const endDate = new Date(startDate.getTime() + occ.duration * 60000);
    const displayTitle = occ.sourceEvent.title || t('calendar.eventDefaultTitle');
    eventEl.innerHTML = `
      <div class="resize-handle top"></div>
      <div class="event-header">
        <div class="title">${displayTitle}</div>
        <button class="delete-event" title="${t('calendar.eventDeleteTitle')}">✕</button>
      </div>
      <div class="time-range">${formatTime(startDate)} – ${formatTime(endDate)}</div>
      <div class="resize-handle bottom"></div>
    `;

    // Position verticale dans la cellule + hauteur (le débordement est permis)
    const startMinutes = startDate.getMinutes();
    const topPx = (startMinutes / 60) * calendarHourHeight;
    const absoluteStartMinutes = startHour * 60 + startMinutes;
    const visibleDuration = Math.min(
      occ.duration,
      Math.max(0, CALENDAR_END_MINUTE - absoluteStartMinutes)
    );
    eventEl.style.top = `${topPx}px`;
    eventEl.style.height = `${(visibleDuration / 60) * calendarHourHeight}px`;

    // Actions
    eventEl.querySelector('.delete-event').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteEvent(occ.sourceEvent.id);
    });
    const handle = eventEl.querySelector('.resize-handle.bottom');
    handle.addEventListener('pointerdown', (e) => startDurationResize(e, occ, eventEl, handle));

    const topHandle = eventEl.querySelector('.resize-handle.top');
    topHandle.addEventListener('pointerdown', (e) => startStartResize(e, occ, eventEl, topHandle));

    eventEl.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      openEventModal({ event: occ.sourceEvent, occurrenceStart: occ.start });
    });

    cell.appendChild(eventEl);
  });
}

function startDurationResize(pointerEvent, occurrence, eventEl, handle) {
  pointerEvent.preventDefault();
  pointerEvent.stopPropagation();
  const sourceEvent = occurrence.sourceEvent;
  const originalDuration = Number(sourceEvent.duration) || MIN_EVENT_DURATION;
  resizeState = {
    pointerId: pointerEvent.pointerId,
    handle,
    eventEl,
    sourceEvent,
    occurrenceStart: new Date(occurrence.start),
    originalDuration,
    previewDuration: originalDuration,
    startY: pointerEvent.clientY
  };
  handle.setPointerCapture(pointerEvent.pointerId);
  handle.addEventListener('pointermove', handleDurationResize);
  handle.addEventListener('pointerup', finishDurationResize);
  handle.addEventListener('pointercancel', finishDurationResize);
}

function handleDurationResize(event) {
  if (!resizeState) return;
  const deltaPixels = event.clientY - resizeState.startY;
  const minutesPerPixel = 60 / calendarHourHeight;
  const rawMinutes = deltaPixels * minutesPerPixel;
  const steppedMinutes = Math.round(rawMinutes / EVENT_DURATION_STEP) * EVENT_DURATION_STEP;
  const startMinutes = resizeState.occurrenceStart.getHours() * 60 + resizeState.occurrenceStart.getMinutes();
  const available = Math.max(0, CALENDAR_END_MINUTE - startMinutes);
  let newDuration = resizeState.originalDuration + steppedMinutes;
  if (available <= 0) {
    newDuration = resizeState.originalDuration;
  } else {
    const minDuration = Math.min(MIN_EVENT_DURATION, available);
    if (newDuration < minDuration) {
      newDuration = minDuration;
    }
    if (newDuration > available) {
      newDuration = available;
    }
    const stepMinimum = Math.min(EVENT_DURATION_STEP, available);
    if (newDuration < stepMinimum) {
      newDuration = stepMinimum;
    }
  }
  resizeState.previewDuration = newDuration;
  const height = (newDuration / 60) * calendarHourHeight;
  resizeState.eventEl.style.height = `${height}px`;
  const timeRange = resizeState.eventEl.querySelector('.time-range');
  if (timeRange) {
    const endDate = new Date(resizeState.occurrenceStart.getTime() + newDuration * 60000);
    timeRange.textContent = `${formatTime(resizeState.occurrenceStart)} – ${formatTime(endDate)}`;
  }
}

function finishDurationResize(event) {
  if (!resizeState) return;
  resizeState.handle.releasePointerCapture(resizeState.pointerId);
  resizeState.handle.removeEventListener('pointermove', handleDurationResize);
  resizeState.handle.removeEventListener('pointerup', finishDurationResize);
  resizeState.handle.removeEventListener('pointercancel', finishDurationResize);
  const finalDuration = resizeState.previewDuration;
  if (finalDuration !== resizeState.originalDuration) {
    resizeState.sourceEvent.duration = finalDuration;
    saveData();
  }
  resizeState = null;
  renderCalendar();
}

function startStartResize(pointerEvent, occurrence, eventEl, handle) {
  pointerEvent.preventDefault();
  pointerEvent.stopPropagation();
  const sourceEvent = occurrence.sourceEvent;
  const originalStart = new Date(occurrence.start);
  const originalDuration = Number(sourceEvent.duration) || MIN_EVENT_DURATION;
  const fixedEnd = new Date(originalStart.getTime() + originalDuration * 60000); // fin fixe

  resizeState = {
    pointerId: pointerEvent.pointerId,
    handle,
    eventEl,
    sourceEvent,
    originalStart,
    originalDuration,
    fixedEnd,
    previewStart: new Date(originalStart),
    previewDuration: originalDuration,
    startY: pointerEvent.clientY
  };

  handle.setPointerCapture(pointerEvent.pointerId);
  handle.addEventListener('pointermove', handleStartResize);
  handle.addEventListener('pointerup', finishStartResize);
  handle.addEventListener('pointercancel', finishStartResize);
}

function handleStartResize(event) {
  if (!resizeState) return;

  const minutesPerPixel = 60 / calendarHourHeight;
  const deltaPixels = event.clientY - resizeState.startY;      // vers le bas = +, vers le haut = -
  const rawMinutes = deltaPixels * minutesPerPixel;
  const steppedMinutes = Math.round(rawMinutes / EVENT_DURATION_STEP) * EVENT_DURATION_STEP;

  // nouveau début (provisoire) = ancien début + delta
  let newStart = new Date(resizeState.originalStart.getTime() + steppedMinutes * 60000);

  // bornes : pas avant 00:00 du jour, pas après (fin - durée minimale)
  const dayStart = new Date(resizeState.originalStart);
  dayStart.setHours(CALENDAR_START_HOUR, 0, 0, 0);
  const minGap = Math.max(MIN_EVENT_DURATION, EVENT_DURATION_STEP);
  const maxStart = new Date(resizeState.fixedEnd.getTime() - minGap * 60000);

  if (newStart < dayStart) newStart = dayStart;
  if (newStart > maxStart) newStart = maxStart;

  // durée = (fin fixe - début nouveau), arrondie au pas
  let newDuration = Math.round(((resizeState.fixedEnd - newStart) / 60000) / EVENT_DURATION_STEP) * EVENT_DURATION_STEP;
  if (newDuration < MIN_EVENT_DURATION) newDuration = MIN_EVENT_DURATION;

  // réajuster le début pour coller au pas exact
  newStart = new Date(resizeState.fixedEnd.getTime() - newDuration * 60000);

  // mémoriser l’aperçu
  resizeState.previewStart = newStart;
  resizeState.previewDuration = newDuration;

  // mise à jour visuelle (top relatif à la cellule d’origine) + hauteur
  const offsetMinutes =
    (newStart.getHours() - resizeState.originalStart.getHours()) * 60 +
    (newStart.getMinutes() - resizeState.originalStart.getMinutes());
  const topPx = (offsetMinutes / 60) * calendarHourHeight;

  resizeState.eventEl.style.top = `${topPx}px`;
  resizeState.eventEl.style.height = `${(newDuration / 60) * calendarHourHeight}px`;

  const timeRange = resizeState.eventEl.querySelector('.time-range');
  if (timeRange) {
    // formatte l'heure locale (tu as déjà formatTime)
    timeRange.textContent = `${formatTime(newStart)} – ${formatTime(resizeState.fixedEnd)}`;
  }
}

function finishStartResize() {
  if (!resizeState) return;

  resizeState.handle.releasePointerCapture(resizeState.pointerId);
  resizeState.handle.removeEventListener('pointermove', handleStartResize);
  resizeState.handle.removeEventListener('pointerup', finishStartResize);
  resizeState.handle.removeEventListener('pointercancel', finishStartResize);

  const finalStart = resizeState.previewStart || resizeState.originalStart;
  const finalDuration = resizeState.previewDuration || resizeState.originalDuration;

  // convertir en valeur "datetime-local" (YYYY-MM-DDTHH:MM) comme le reste de l’app
  const localInputValue = new Date(finalStart.getTime() - finalStart.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  resizeState.sourceEvent.start = localInputValue;
  resizeState.sourceEvent.duration = finalDuration;

  saveData();
  resizeState = null;
  renderCalendar();
}

function deleteEvent(eventId) {
  appData.calendar.events = appData.calendar.events.filter((event) => event.id !== eventId);
  saveData();
  renderCalendar();
}

function openEventModal({ start, event: existingEvent = null, occurrenceStart = null }) {
  const modal = document.getElementById('event-modal');
  const form = document.getElementById('event-form');
  const titleInput = document.getElementById('event-title');
  const datetimeInput = document.getElementById('event-datetime');
  const durationInput = document.getElementById('event-duration');
  const recurrenceInput = document.getElementById('event-recurrence');
  const typeInput = document.getElementById('event-type');
  const colorInput = document.getElementById('event-color');
  const modalTitle = modal.querySelector('h3');

  const baseDate = existingEvent
    ? (occurrenceStart ? new Date(occurrenceStart) : new Date(existingEvent.start))
    : start instanceof Date
      ? new Date(start)
      : new Date();
  const localized = new Date(baseDate.getTime() - baseDate.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  updateEventTypeSelect(existingEvent && existingEvent.typeId ? existingEvent.typeId : '');

  if (existingEvent) {
    modalTitle.textContent = t('calendar.eventModal.editTitle');
    titleInput.value = existingEvent.title || '';
    datetimeInput.value = localized;
    durationInput.value = existingEvent.duration || 60;
    recurrenceInput.value = existingEvent.recurrence || 'none';
    typeInput.value = existingEvent.typeId || '';
    const type = getEventTypeById(existingEvent.typeId);
    colorInput.value = existingEvent.color || (type ? type.color : DEFAULT_EVENT_COLOR);
    modal.dataset.mode = 'edit';
    modal.dataset.eventId = existingEvent.id;
  } else {
    modalTitle.textContent = t('calendar.eventModal.createTitle');
    titleInput.value = '';
    datetimeInput.value = localized;
    durationInput.value = 60;
    recurrenceInput.value = 'none';
    typeInput.value = '';
    colorInput.value = DEFAULT_EVENT_COLOR;
    modal.dataset.mode = 'create';
    modal.dataset.eventId = '';
  }

  modal.hidden = false;

  const cancelButton = document.getElementById('cancel-event');
  cancelButton.onclick = () => {
    modal.hidden = true;
  };

  typeInput.onchange = () => {
    const selectedType = getEventTypeById(typeInput.value);
    if (selectedType) {
      colorInput.value = selectedType.color;
    }
  };

  form.onsubmit = (submitEvent) => {
    submitEvent.preventDefault();
    const title = titleInput.value.trim();
    const datetimeValue = datetimeInput.value;
    if (!datetimeValue) return;
    const startDate = new Date(datetimeValue);
    if (Number.isNaN(startDate.getTime())) {
      return;
    }
    let duration = Number(durationInput.value);
    if (!Number.isFinite(duration) || duration <= 0) {
      duration = 60;
    }
    duration = Math.round(duration / EVENT_DURATION_STEP) * EVENT_DURATION_STEP;
    if (duration < EVENT_DURATION_STEP) {
      duration = EVENT_DURATION_STEP;
    }
    const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
    const available = Math.max(0, CALENDAR_END_MINUTE - startMinutes);
    if (available > 0) {
      const minDuration = Math.min(MIN_EVENT_DURATION, available);
      if (duration < minDuration) {
        duration = minDuration;
      }
      if (duration > available) {
        duration = available;
      }
      if (duration < EVENT_DURATION_STEP && available >= EVENT_DURATION_STEP) {
        duration = EVENT_DURATION_STEP;
      }
    }
    durationInput.value = duration;
    const recurrence = recurrenceInput.value;
    const typeId = typeInput.value;
    const color = colorInput.value || DEFAULT_EVENT_COLOR;

    if (modal.dataset.mode === 'edit' && modal.dataset.eventId) {
      const targetEvent = appData.calendar.events.find((evt) => evt.id === modal.dataset.eventId);
      if (targetEvent) {
        targetEvent.title = title || t('calendar.newEventTitle');
        targetEvent.start = datetimeValue;
        targetEvent.duration = duration;
        targetEvent.recurrence = recurrence;
        targetEvent.typeId = typeId;
        targetEvent.color = color;
      }
    } else {
      const newEvent = {
        id: uid(),
        title: title || t('calendar.newEventTitle'),
        start: datetimeValue,
        duration,
        recurrence,
        typeId,
        color
      };
      appData.calendar.events.push(newEvent);
    }
    saveData();
    modal.hidden = true;
    renderCalendar();
  };
}

function initCalendar() {
  renderCalendar();
  renderEventTypes();
  const typeForm = document.getElementById('event-type-form');
  const typeNameInput = document.getElementById('event-type-name');
  const typeColorInput = document.getElementById('event-type-color');
  if (typeForm) {
    typeForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const name = typeNameInput.value.trim();
      if (!name) return;
      const color = typeColorInput.value || DEFAULT_EVENT_COLOR;
      appData.calendar.types.push({ id: uid(), name, color });
      typeNameInput.value = '';
      saveData();
      renderEventTypes();
    });
  }
  document.getElementById('prev-week').addEventListener('click', () => {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    appData.calendar.lastWeekStart = currentWeekStart.toISOString();
    saveData();
    renderCalendar();
  });
  document.getElementById('next-week').addEventListener('click', () => {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    appData.calendar.lastWeekStart = currentWeekStart.toISOString();
    saveData();
    renderCalendar();
  });
  document.getElementById('today-button').addEventListener('click', () => {
    currentWeekStart = startOfWeek(new Date());
    appData.calendar.lastWeekStart = currentWeekStart.toISOString();
    saveData();
    renderCalendar();
  });
  document.addEventListener('keydown', (event) => {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.isContentEditable) {
      return;
    }
    if (event.key === 'ArrowLeft') {
      currentWeekStart.setDate(currentWeekStart.getDate() - 7);
      appData.calendar.lastWeekStart = currentWeekStart.toISOString();
      saveData();
      renderCalendar();
    }
    if (event.key === 'ArrowRight') {
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      appData.calendar.lastWeekStart = currentWeekStart.toISOString();
      saveData();
      renderCalendar();
    }
  });
}

function getActiveMindmap() {
  let mutated = false;
  if (!appData.mindmap || !Array.isArray(appData.mindmap.maps)) {
    const fallbackId = uid();
    appData.mindmap = {
      maps: [{ id: fallbackId, name: t('mindmap.defaultMapName', { index: 1 }), nodes: [], links: [] }],
      activeMapId: fallbackId
    };
    mutated = true;
  }
  if (appData.mindmap.maps.length === 0) {
    const fallbackId = uid();
    appData.mindmap.maps.push({ id: fallbackId, name: t('mindmap.defaultMapName', { index: 1 }), nodes: [], links: [] });
    appData.mindmap.activeMapId = fallbackId;
    mutated = true;
  }
  let active = appData.mindmap.maps.find((map) => map.id === appData.mindmap.activeMapId);
  if (!active) {
    appData.mindmap.activeMapId = appData.mindmap.maps[0].id;
    active = appData.mindmap.maps[0];
    mutated = true;
  }
  if (mutated) {
    saveData();
  }
  return active;
}

function setActiveMindmap(mapId) {
  if (!appData.mindmap.maps.some((map) => map.id === mapId)) return;
  appData.mindmap.activeMapId = mapId;
  selectedNodeId = null;
  setLinkMode(false);
  renderMindmapList();
  renderMindmap();
  saveData();
}

function renderMindmapList() {
  const list = document.getElementById('mindmap-list');
  if (!list) return;
  const active = getActiveMindmap();
  list.innerHTML = '';
  appData.mindmap.maps.forEach((map) => {
    const item = document.createElement('li');
    item.classList.toggle('active', map.id === active.id);
    const nameSpan = document.createElement('span');
    nameSpan.textContent = map.name || t('mindmap.untitledMap');
    item.appendChild(nameSpan);
    item.addEventListener('click', () => {
      if (appData.mindmap.activeMapId === map.id) return;
      setActiveMindmap(map.id);
    });
    list.appendChild(item);
  });
}

function initMindmap() {
  const addBtn = document.getElementById('add-node');
  const deleteBtn = document.getElementById('delete-node');
  const linkBtn = document.getElementById('link-nodes');
  const colorInput = document.getElementById('node-color');
  const canvas = document.getElementById('mindmap-canvas');
  const addMapBtn = document.getElementById('add-map');
  const renameMapBtn = document.getElementById('rename-map');
  const deleteMapBtn = document.getElementById('delete-map');

  function addNode() {
    const rect = canvas.getBoundingClientRect();
    const node = {
      id: uid(),
      title: t('mindmap.newBubble'),
      color: colorInput.value,
      x: rect.width / 2 - 60,
      y: rect.height / 2 - 40
    };
    const map = getActiveMindmap();
    map.nodes.push(node);
    saveData();
    renderMindmap();
    selectNode(node.id);
  }

  addBtn.addEventListener('click', addNode);

  deleteBtn.addEventListener('click', () => {
    if (!selectedNodeId) return;
    const map = getActiveMindmap();
    map.nodes = map.nodes.filter((node) => node.id !== selectedNodeId);
    map.links = map.links.filter((link) => link.from !== selectedNodeId && link.to !== selectedNodeId);
    selectedNodeId = null;
    setLinkMode(false);
    saveData();
    renderMindmap();
  });

  linkBtn.addEventListener('click', () => {
    if (!selectedNodeId) return;
    setLinkMode(!linkMode);
  });

  colorInput.addEventListener('input', () => {
    if (!selectedNodeId) return;
    const map = getActiveMindmap();
    const node = map.nodes.find((n) => n.id === selectedNodeId);
    if (!node) return;
    node.color = colorInput.value;
    saveData();
    renderMindmap();
  });

  if (addMapBtn) {
    addMapBtn.addEventListener('click', () => {
      const newMap = {
        id: uid(),
        name: t('mindmap.defaultMapName', { index: appData.mindmap.maps.length + 1 }),
        nodes: [],
        links: []
      };
      appData.mindmap.maps.push(newMap);
      setActiveMindmap(newMap.id);
    });
  }

  if (renameMapBtn) {
    renameMapBtn.addEventListener('click', () => {
      const map = getActiveMindmap();
      const newName = prompt(t('mindmap.renamePrompt'), map.name || t('mindmap.untitledMap'));
      if (newName === null) return;
      const trimmed = newName.trim();
      map.name = trimmed || t('mindmap.untitledMap');
      saveData();
      renderMindmapList();
    });
  }

  if (deleteMapBtn) {
    deleteMapBtn.addEventListener('click', () => {
      if (appData.mindmap.maps.length <= 1) {
        alert(t('mindmap.lastMapAlert'));
        return;
      }
      const map = getActiveMindmap();
      if (!confirm(t('mindmap.deleteConfirm', { name: map.name || t('mindmap.untitledMap') }))) return;
      appData.mindmap.maps = appData.mindmap.maps.filter((m) => m.id !== map.id);
      const fallback = getActiveMindmap();
      appData.mindmap.activeMapId = fallback.id;
      selectedNodeId = null;
      setLinkMode(false);
      saveData();
      renderMindmapList();
      renderMindmap();
    });
  }

  renderMindmap();
  renderMindmapList();
  selectNode(selectedNodeId);
  syncLinkButton();

  window.addEventListener('resize', () => {
    requestAnimationFrame(() => updateLinkPositions());
  });
}

function renderMindmap() {
  const canvas = document.getElementById('mindmap-canvas');
  const linksLayer = document.getElementById('mindmap-links');
  if (!canvas || !linksLayer) return;
  const map = getActiveMindmap();

  if (selectedNodeId && !map.nodes.some((node) => node.id === selectedNodeId)) {
    selectedNodeId = null;
  }

  canvas.innerHTML = '';
  linksLayer.innerHTML = '';
  linksLayer.setAttribute('width', canvas.clientWidth);
  linksLayer.setAttribute('height', canvas.clientHeight);

  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
  marker.setAttribute('id', 'mindmap-arrow');
  marker.setAttribute('viewBox', '0 0 10 10');
  marker.setAttribute('refX', '10');
  marker.setAttribute('refY', '5');
  marker.setAttribute('markerWidth', '6');
  marker.setAttribute('markerHeight', '6');
  marker.setAttribute('orient', 'auto');
  const markerPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  const linkColor = 'rgba(79, 70, 229, 0.55)';
  markerPath.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
  markerPath.setAttribute('fill', linkColor);
  marker.appendChild(markerPath);
  defs.appendChild(marker);
  linksLayer.appendChild(defs);

  map.nodes.forEach((node) => {
    const nodeEl = document.createElement('div');
    nodeEl.className = 'mindmap-node';
    if (node.id === selectedNodeId) {
      nodeEl.classList.add('selected');
    }
    nodeEl.style.left = `${node.x}px`;
    nodeEl.style.top = `${node.y}px`;
    nodeEl.style.background = node.color || '#4e73df';
    nodeEl.dataset.id = node.id;
    nodeEl.textContent = node.title;

    nodeEl.addEventListener('click', (event) => {
      event.stopPropagation();
      if (linkMode && linkSourceId && linkSourceId !== node.id) {
        const exists = map.links.some((link) => (link.from === linkSourceId && link.to === node.id) || (link.from === node.id && link.to === linkSourceId));
        if (!exists) {
          map.links.push({ id: uid(), from: linkSourceId, to: node.id });
          saveData();
          renderMindmap();
        }
        setLinkMode(false);
      } else {
        selectNode(node.id);
      }
    });

    nodeEl.addEventListener('dblclick', (event) => {
      event.stopPropagation();
      editNodeTitle(node);
    });

    enableDrag(nodeEl, node);

    canvas.appendChild(nodeEl);
  });

  const linesFragment = document.createDocumentFragment();
  map.links.forEach(() => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('stroke', linkColor);
    line.setAttribute('stroke-width', '3');
    line.setAttribute('stroke-linecap', 'round');
    line.setAttribute('marker-end', 'url(#mindmap-arrow)');
    linesFragment.appendChild(line);
  });
  linksLayer.appendChild(linesFragment);
  updateLinkPositions();

  document.getElementById('mindmap-canvas').onclick = () => {
    if (!linkMode) {
      selectNode(null);
    }
  };

  const fallbackId = selectedNodeId !== null ? selectedNodeId : null;
  if (!fallbackId) {
    setLinkMode(false);
    selectNode(null);
  } else {
    selectNode(fallbackId);
    if (linkMode) {
      linkSourceId = fallbackId;
    }
    syncLinkButton();
  }
}

function editNodeTitle(node) {
  const canvas = document.getElementById('mindmap-canvas');
  const nodeEl = canvas.querySelector(`.mindmap-node[data-id="${node.id}"]`);
  if (!nodeEl) return;
  nodeEl.innerHTML = '';
  const input = document.createElement('input');
  input.type = 'text';
  input.value = node.title;
  nodeEl.appendChild(input);
  input.focus();
  input.select();
  input.addEventListener('blur', () => {
    const trimmed = input.value.trim();
    node.title = trimmed || t('mindmap.untitledNode');
    saveData();
    renderMindmap();
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      input.blur();
    }
  });
}

function selectNode(nodeId) {
  selectedNodeId = nodeId;
  const nodes = document.querySelectorAll('.mindmap-node');
  nodes.forEach((node) => {
    node.classList.toggle('selected', node.dataset.id === nodeId);
  });
  const colorInput = document.getElementById('node-color');
  const deleteBtn = document.getElementById('delete-node');
  const linkBtn = document.getElementById('link-nodes');
  const map = getActiveMindmap();
  if (!nodeId) {
    colorInput.disabled = true;
    deleteBtn.disabled = true;
    linkBtn.disabled = true;
    syncLinkButton();
  } else {
    colorInput.disabled = false;
    deleteBtn.disabled = false;
    linkBtn.disabled = false;
    const node = map.nodes.find((n) => n.id === nodeId);
    if (node) {
      colorInput.value = node.color || '#4e73df';
    }
    if (linkMode) {
      linkSourceId = nodeId;
      syncLinkButton();
    }
  }
}

function enableDrag(element, node) {
  let offsetX = 0;
  let offsetY = 0;

  element.addEventListener('pointerdown', (event) => {
    const linkingToOtherNode = linkMode && linkSourceId && linkSourceId !== node.id;
    if (linkingToOtherNode) {
      return;
    }
    event.preventDefault();
    selectNode(node.id);
    offsetX = event.clientX - node.x;
    offsetY = event.clientY - node.y;
    element.setPointerCapture(event.pointerId);
    const move = (e) => {
      node.x = e.clientX - offsetX;
      node.y = e.clientY - offsetY;
      element.style.left = `${node.x}px`;
      element.style.top = `${node.y}px`;
      updateLinkPositions();
    };
    const up = (e) => {
      element.releasePointerCapture(event.pointerId);
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerup', up);
      element.removeEventListener('pointercancel', up);
      saveData();
    };
    element.addEventListener('pointermove', move);
    element.addEventListener('pointerup', up);
    element.addEventListener('pointercancel', up);
  });
}

function updateLinkPositions() {
  const canvas = document.getElementById('mindmap-canvas');
  const linksLayer = document.getElementById('mindmap-links');
  if (!linksLayer || !canvas) return;
  const lines = Array.from(linksLayer.querySelectorAll('line'));
  const canvasRect = canvas.getBoundingClientRect();
  const map = getActiveMindmap();
  lines.forEach((line, index) => {
    const link = map.links[index];
    if (!link) return;
    const fromEl = canvas.querySelector(`.mindmap-node[data-id="${link.from}"]`);
    const toEl = canvas.querySelector(`.mindmap-node[data-id="${link.to}"]`);
    if (!fromEl || !toEl) return;
    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toEl.getBoundingClientRect();
    const x1 = fromRect.left - canvasRect.left + fromRect.width / 2;
    const y1 = fromRect.top - canvasRect.top + fromRect.height / 2;
    const x2 = toRect.left - canvasRect.left + toRect.width / 2;
    const y2 = toRect.top - canvasRect.top + toRect.height / 2;
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
  });
}

function syncLinkButton() {
  const btn = document.getElementById('link-nodes');
  if (!btn) return;
  btn.classList.toggle('active', linkMode);
  btn.textContent = linkMode ? t('mindmap.linkNodesActive') : t('mindmap.linkNodes');
}

function setLinkMode(active) {
  if (active && !selectedNodeId) {
    linkMode = false;
    linkSourceId = null;
    syncLinkButton();
    return;
  }
  linkMode = active;
  if (linkMode) {
    linkSourceId = selectedNodeId;
  } else {
    linkSourceId = null;
  }
  syncLinkButton();
}


function getActiveGanttChart() {
  if (!appData.gantt || !Array.isArray(appData.gantt.charts) || appData.gantt.charts.length === 0) {
    return null;
  }
  if (!appData.gantt.activeChartId || !appData.gantt.charts.some((chart) => chart.id === appData.gantt.activeChartId)) {
    appData.gantt.activeChartId = appData.gantt.charts[0].id;
  }
  return appData.gantt.charts.find((chart) => chart.id === appData.gantt.activeChartId) || null;
}

function renderGanttList() {
  const list = document.getElementById('gantt-chart-list');
  if (!list) return;
  list.innerHTML = '';

  if (!appData.gantt || appData.gantt.charts.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty-state';
    empty.textContent = t('gantt.listEmpty');
    list.appendChild(empty);
    return;
  }

  appData.gantt.charts.forEach((chart) => {
    const item = document.createElement('li');
    item.className = 'gantt-chart-item';
    if (chart.id === appData.gantt.activeChartId) {
      item.classList.add('active');
    }
    item.textContent = chart.name || t('gantt.chartUntitled');
    item.addEventListener('click', () => {
      appData.gantt.activeChartId = chart.id;
      saveData();
      renderGantt();
    });
    list.appendChild(item);
  });
}

function renderGanttBoard() {
  const nameEl = document.getElementById('gantt-active-name');
  const addTaskBtn = document.getElementById('gantt-add-task');
  const emptyEl = document.getElementById('gantt-empty');
  const boardEl = document.getElementById('gantt-board');
  const rowsContainer = document.getElementById('gantt-task-rows');
  if (!nameEl || !addTaskBtn || !emptyEl || !boardEl || !rowsContainer) return;

  const chart = getActiveGanttChart();
  if (!chart) {
    nameEl.textContent = t('gantt.headerTitle');
    addTaskBtn.disabled = true;
    emptyEl.hidden = false;
    boardEl.hidden = true;
    rowsContainer.innerHTML = '';
    renderGanttTimeline(null);
    return;
  }

  nameEl.textContent = chart.name || t('gantt.chartUntitled');
  addTaskBtn.disabled = false;
  emptyEl.hidden = true;
  boardEl.hidden = false;
  rowsContainer.innerHTML = '';

  if (chart.tasks.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = t('gantt.boardEmpty');
    rowsContainer.appendChild(empty);
  } else {
    chart.tasks.forEach((task) => {
      const row = document.createElement('div');
      row.className = 'gantt-task-row';

      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.value = task.name || '';
      nameInput.addEventListener('input', () => {
        task.name = nameInput.value;
        saveData();
        renderGanttTimeline(getActiveGanttChart());
      });

      const startInput = document.createElement('input');
      startInput.type = 'date';
      startInput.value = task.start || '';

      const endInput = document.createElement('input');
      endInput.type = 'date';
      endInput.value = task.end || '';

      startInput.addEventListener('change', () => {
        task.start = startInput.value;
        if (task.end && task.start && task.end < task.start) {
          task.end = task.start;
          endInput.value = task.end;
        }
        saveData();
        renderGanttTimeline(getActiveGanttChart());
      });

      endInput.addEventListener('change', () => {
        if (endInput.value && task.start && endInput.value < task.start) {
          endInput.value = task.start;
        }
        task.end = endInput.value;
        saveData();
        renderGanttTimeline(getActiveGanttChart());
      });

      const progressInput = document.createElement('input');
      progressInput.type = 'number';
      progressInput.min = '0';
      progressInput.max = '100';
      progressInput.step = '5';
      progressInput.value = Number.isFinite(task.progress) ? task.progress : 0;
      progressInput.addEventListener('change', () => {
        const value = Number(progressInput.value);
        if (!Number.isFinite(value)) {
          task.progress = 0;
        } else {
          task.progress = Math.min(100, Math.max(0, value));
        }
        progressInput.value = task.progress;
        saveData();
        renderGanttTimeline(getActiveGanttChart());
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.textContent = '✕';
      deleteBtn.addEventListener('click', () => {
        if (!confirm(t('gantt.deleteTaskConfirm'))) return;
        chart.tasks = chart.tasks.filter((t) => t.id !== task.id);
        saveData();
        renderGantt();
      });

      row.appendChild(nameInput);
      row.appendChild(startInput);
      row.appendChild(endInput);
      row.appendChild(progressInput);
      row.appendChild(deleteBtn);
      rowsContainer.appendChild(row);
    });
  }

  renderGanttTimeline(chart);
}

function renderGanttTimeline(chart) {
  const timeline = document.getElementById('gantt-timeline');
  if (!timeline) return;
  timeline.innerHTML = '';
  timeline.style.setProperty('--gantt-day-width', `${GANTT_DAY_WIDTH}px`);

  if (!chart || chart.tasks.length === 0) {
    const placeholder = document.createElement('div');
    placeholder.className = 'gantt-timeline-placeholder';
    placeholder.textContent = t('gantt.timelinePlaceholder');
    timeline.appendChild(placeholder);
    return;
  }

  const normalizedTasks = chart.tasks.map((task) => {
    let startDate = parseDateOnly(task.start);
    let endDate = parseDateOnly(task.end);
    if (!startDate && endDate) {
      startDate = new Date(endDate);
    }
    if (!endDate && startDate) {
      endDate = new Date(startDate);
    }
    if (!startDate || !endDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      startDate = today;
      endDate = today;
    }
    if (endDate < startDate) {
      endDate = new Date(startDate);
    }
    return { task, startDate, endDate };
  });

  const startBoundary = normalizedTasks.reduce((min, current) => (current.startDate < min ? current.startDate : min), normalizedTasks[0].startDate);
  const endBoundary = normalizedTasks.reduce((max, current) => (current.endDate > max ? current.endDate : max), normalizedTasks[0].endDate);
  const totalDays = Math.max(1, diffDays(startBoundary, endBoundary) + 1);

  const header = document.createElement('div');
  header.className = 'gantt-timeline-header';
  for (let dayIndex = 0; dayIndex < totalDays; dayIndex += 1) {
    const day = new Date(startBoundary);
    day.setDate(day.getDate() + dayIndex);
    const label = document.createElement('span');
    label.textContent = day.toLocaleDateString(getCurrentLocale(), { day: '2-digit', month: 'short' });
    header.appendChild(label);
  }
  timeline.appendChild(header);

  const body = document.createElement('div');
  body.className = 'gantt-timeline-body';
  body.style.minWidth = `${totalDays * GANTT_DAY_WIDTH}px`;
  body.style.height = `${chart.tasks.length * GANTT_ROW_HEIGHT}px`;
  timeline.appendChild(body);

  const grid = document.createElement('div');
  grid.className = 'gantt-timeline-grid';
  grid.style.width = `${totalDays * GANTT_DAY_WIDTH}px`;
  grid.style.height = `${chart.tasks.length * GANTT_ROW_HEIGHT}px`;
  for (let dayIndex = 0; dayIndex < totalDays; dayIndex += 1) {
    const column = document.createElement('span');
    grid.appendChild(column);
  }
  body.appendChild(grid);

  const bars = document.createElement('div');
  bars.className = 'gantt-timeline-bars';
  bars.style.width = `${totalDays * GANTT_DAY_WIDTH}px`;
  bars.style.height = `${chart.tasks.length * GANTT_ROW_HEIGHT}px`;
  body.appendChild(bars);

  normalizedTasks.forEach(({ task, startDate, endDate }, index) => {
    const bar = document.createElement('div');
    bar.className = 'gantt-bar';
    const offsetDays = Math.max(0, diffDays(startBoundary, startDate));
    const spanDays = Math.max(1, diffDays(startDate, endDate) + 1);
    bar.style.left = `${offsetDays * GANTT_DAY_WIDTH}px`;
    bar.style.top = `${index * GANTT_ROW_HEIGHT + (GANTT_ROW_HEIGHT - 36) / 2}px`;
    bar.style.width = `${spanDays * GANTT_DAY_WIDTH}px`;

    const progress = Math.min(100, Math.max(0, Number(task.progress) || 0));
    const progressBar = document.createElement('div');
    progressBar.className = 'gantt-bar-progress';
    progressBar.style.width = `${progress}%`;
    bar.appendChild(progressBar);

    const label = document.createElement('span');
    label.className = 'gantt-bar-label';
    const progressLabel = Number.isFinite(progress) ? ` (${Math.round(progress)}%)` : '';
    label.textContent = `${task.name || t('gantt.barFallback')}${progressLabel}`;
    bar.appendChild(label);

    bars.appendChild(bar);
  });
}

function renderGantt() {
  renderGanttList();
  renderGanttBoard();
}

function initGantt() {
  const addChartBtn = document.getElementById('gantt-add-chart');
  const renameChartBtn = document.getElementById('gantt-rename-chart');
  const deleteChartBtn = document.getElementById('gantt-delete-chart');
  const addTaskBtn = document.getElementById('gantt-add-task');

  if (addChartBtn) {
    addChartBtn.addEventListener('click', () => {
      const defaultName = t('gantt.defaultChartName', { index: appData.gantt.charts.length + 1 });
      const name = prompt(t('gantt.newChartPrompt'), defaultName);
      const trimmed = name ? name.trim() : '';
      const chart = {
        id: uid(),
        name: trimmed || defaultName,
        tasks: []
      };
      appData.gantt.charts.push(chart);
      appData.gantt.activeChartId = chart.id;
      saveData();
      renderGantt();
    });
  }

  if (renameChartBtn) {
    renameChartBtn.addEventListener('click', () => {
      const chart = getActiveGanttChart();
      if (!chart) {
        alert(t('gantt.renameChartAlert'));
        return;
      }
      const name = prompt(t('gantt.renameChartPrompt'), chart.name || t('gantt.chartUntitled'));
      if (name === null) {
        return;
      }
      const trimmed = name.trim();
      chart.name = trimmed || chart.name || t('gantt.chartUntitled');
      saveData();
      renderGantt();
    });
  }

  if (deleteChartBtn) {
    deleteChartBtn.addEventListener('click', () => {
      const chart = getActiveGanttChart();
      if (!chart) {
        alert(t('gantt.noChartToDelete'));
        return;
      }
      if (!confirm(t('gantt.deleteChartConfirm'))) return;
      appData.gantt.charts = appData.gantt.charts.filter((item) => item.id !== chart.id);
      if (appData.gantt.charts.length === 0) {
        appData.gantt.activeChartId = null;
      } else {
        appData.gantt.activeChartId = appData.gantt.charts[0].id;
      }
      saveData();
      renderGantt();
    });
  }

  if (addTaskBtn) {
    addTaskBtn.addEventListener('click', () => {
      const chart = getActiveGanttChart();
      if (!chart) {
        alert(t('gantt.addTaskAlert'));
        return;
      }
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      const task = {
        id: uid(),
        name: t('gantt.newTaskName', { index: chart.tasks.length + 1 }),
        start: toISODateString(start),
        end: toISODateString(end),
        progress: 0
      };
      chart.tasks.push(task);
      saveData();
      renderGantt();
    });
  }

  renderGantt();
}

function initTodo() {
  document.getElementById('add-block').addEventListener('click', () => {
    const block = {
      id: uid(),
      title: t('todo.newBlock'),
      items: []
    };
    appData.todo.blocks.push(block);
    saveData();
    renderTodo();
  });
  renderTodo();
}

function renderTodo() {
  const container = document.getElementById('todo-blocks');
  if (!container) return;
  container.innerHTML = '';
  if (appData.todo.blocks.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = t('todo.empty');
    container.appendChild(empty);
    return;
  }

  appData.todo.blocks.forEach((block) => {
    const blockEl = document.createElement('div');
    blockEl.className = 'todo-block';

    const header = document.createElement('header');
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.value = block.title;
    titleInput.addEventListener('input', () => {
      block.title = titleInput.value;
      saveData();
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = t('todo.deleteBlock');
    deleteBtn.addEventListener('click', () => {
      if (!confirm(t('todo.deleteBlockConfirm'))) return;
      appData.todo.blocks = appData.todo.blocks.filter((b) => b.id !== block.id);
      saveData();
      renderTodo();
    });

    header.appendChild(titleInput);
    header.appendChild(deleteBtn);

    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'todo-items';

    block.items.forEach((item) => {
      const itemEl = createTodoItemElement(block, item);
      itemsContainer.appendChild(itemEl);
    });

    const addItemBtn = document.createElement('button');
    addItemBtn.textContent = t('todo.addTask');
    addItemBtn.addEventListener('click', () => {
      const newItem = {
        id: uid(),
        text: t('todo.newTask'),
        done: false
      };
      block.items.push(newItem);
      saveData();
      renderTodo();
    });

    blockEl.appendChild(header);
    blockEl.appendChild(itemsContainer);
    blockEl.appendChild(addItemBtn);
    container.appendChild(blockEl);
  });
}

function createTodoItemElement(block, item) {
  const itemEl = document.createElement('div');
  itemEl.className = 'todo-item';
  if (item.done) {
    itemEl.classList.add('completed');
  }

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = item.done;
  checkbox.addEventListener('change', () => {
    item.done = checkbox.checked;
    if (item.done) {
      itemEl.classList.add('completed');
    } else {
      itemEl.classList.remove('completed');
    }
    saveData();
  });

  const textInput = document.createElement('input');
  textInput.type = 'text';
  textInput.value = item.text;
  textInput.addEventListener('input', () => {
    item.text = textInput.value;
    saveData();
  });

  const removeBtn = document.createElement('button');
  removeBtn.textContent = '✕';
  removeBtn.addEventListener('click', () => {
    block.items = block.items.filter((i) => i.id !== item.id);
    saveData();
    renderTodo();
  });

  itemEl.appendChild(checkbox);
  itemEl.appendChild(textInput);
  itemEl.appendChild(removeBtn);
  return itemEl;
}

async function bootstrap() {
  await initData();
  initTabs();
  initLocalization();
  initSettings();
  initVersionIndicator();
  initStorageControls();
  initCalendar();
  initMindmap();
  initGantt();
  initTodo();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    bootstrap().catch((error) => console.error(error));
  });
} else {
  bootstrap().catch((error) => console.error(error));
}