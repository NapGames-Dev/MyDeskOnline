/* ═══════════════════════════════════════════════════════════
   ONGLET SPORT
   - Séances composées d'exercices (souvent liés à une « échelle »
     de progression de la bibliothèque, cf. sport-library.js)
   - Mode séance : répétitions par série, minuteur de repos,
     suggestion automatique de variante plus dure / plus facile
   - Mode modification, guide, lien avec l'agenda
   ═══════════════════════════════════════════════════════════ */

const SPORT_TYPE_NAME = 'Sport';
const SPORT_TYPE_COLOR = '#f97316';
const SPORT_CLICK_DELAY_MS = 250;
const SPORT_TEMPLATE_KEY = 'pdc-debutant-pecs-abdos';

const SPORT_TRANSLATIONS = {
  fr: {
    sessionsTitle: 'Séances',
    addSession: 'Nouvelle séance',
    loadProgram: 'Séances préfaites',
    guide: '📖 Guide & exercices',
    newSessionName: 'Nouvelle séance',
    emptyList: 'Aucune séance. Créez-en une ou ajoutez des séances préfaites.',
    presetsTitle: 'Séances préfaites',
    presetsHint: 'Coche les séances que tu veux ajouter, puis choisis quand les faire. Tu pourras les modifier ensuite.',
    presetPresent: 'Déjà dans tes séances',
    presetSchedule: "Les placer dans l'agenda chaque semaine (jour conseillé, 18:00)",
    presetAdd: 'Ajouter ({count})',
    presetCancel: 'Annuler',
    presetRepeat: 'Répétition',
    presetNoCalendar: "Pas dans l'agenda",
    presetOnce: 'Une seule fois',
    presetEveryWeek: 'Chaque {day} à {time}',
    presetEveryMonth: 'Le {day} de chaque mois à {time}',
    presetEveryDay: 'Tous les jours à {time}',
    presetOnceOn: 'Le {date} à {time}',
    presetAllPresent: 'Toutes les séances préfaites sont déjà dans ta liste.',
    presetAdded: '{count} séance(s) ajoutée(s).',
    presetAddedScheduled: "{count} séance(s) ajoutée(s), dont {scheduled} dans l'agenda.",
    noSession: 'Sélectionnez ou créez une séance.',
    notPlanned: "Pas prévue ce jour-là dans l'agenda",
    plannedOn: 'Prévue : {days}',
    plannedAt: 'Aujourd’hui à {time} · {duration} min',
    notScheduled: "Pas encore dans l'agenda",
    weekToDo: 'À faire cette semaine',
    weekDoneOn: '✓ faite {day}',
    weekStatus: 'À faire cette semaine · {done}/{total} faites',
    weekAlreadyDone: '✓ Déjà faite cette semaine ({day})',
    weekDoneToday: '✓ Faite aujourd’hui',
    reminderWeekDone: 'Toutes les séances de la semaine sont faites 👏',
    warmupTitle: '🔥 Échauffement (≈ {min} min)',
    warmupApproach: 'Séries d’approche, juste avant l’exercice :',
    warmupApproachLine: 'avant « {exercise} » : {list}',
    approachThen: ', puis ',
    approachLoad: 'Avec le sac à moitié chargé, sans forcer.',
    approachEasy: 'Variante plus facile, technique parfaite.',
    approachToday: 'Ta variante du jour, loin de l’échec : juste pour caler le geste.',
    progress: '{done}/{total} exercices faits',
    allDone: 'Séance terminée, bravo !',
    noExercises: 'Aucun exercice. Cliquez sur « Modifier » pour en ajouter.',
    instructions: 'Consignes',
    edit: '✎ Modifier',
    editTitle: 'Modifier la séance',
    doneEditing: 'Terminé',
    nameLabel: 'Nom de la séance',
    descriptionLabel: 'Échauffement / consignes',
    exercisesTitle: 'Exercices',
    exercise: 'Exercice',
    variant: 'Exercice de la bibliothèque',
    customExercise: 'Personnalisé',
    sets: 'Séries',
    reps: 'Répétitions',
    rest: 'Repos (s)',
    tip: 'Consigne',
    setsReps: '{sets} séries × {reps}',
    restShort: 'repos {rest}',
    setLabel: 'Série {n}',
    lastTime: 'Dernière fois ({date}) : {values}',
    todayNote: 'Note du jour',
    todayNotePlaceholder: 'Note (ressenti, variante…)',
    restTimer: '⏱ {rest}',
    timerRunning: 'Repos',
    timerDone: 'Repos terminé : série suivante !',
    timerStop: 'Passer',
    howTo: 'Technique',
    howToTitle: 'Comment faire',
    mistakes: 'Erreurs à éviter',
    ladder: 'Progression',
    muscles: 'Muscles : {muscles}',
    current: 'actuel',
    useVariant: 'Choisir',
    suggestUp: 'Bravo, tu as atteint {max} partout. Passe à : {name}',
    suggestUpTop: 'Bravo, tu as atteint {max} partout. Ajoute une série ou ralentis la descente (3 s).',
    suggestDown: 'Moins de {min} sur certaines séries. Essaie plutôt : {name}',
    suggestKeep: 'Objectif : {max} sur toutes les séries, puis variante suivante.',
    suggestLoadUp: 'Bravo, {max} partout. Ajoute du poids dans le sac (+0,5 à 1,5 kg). Sac déjà au maximum (10–12 kg) ? Passe à : {name}',
    suggestLoadTop: 'Bravo, {max} partout. Ajoute du poids dans le sac (+0,5 à 1,5 kg), jusqu’à 10–12 kg au maximum.',
    suggestLoadDown: 'Moins de {min} sur certaines séries : retire une bouteille du sac la prochaine fois.',
    suggestLoadKeep: 'Objectif : {max} sur toutes les séries, puis ajoute du poids dans le sac.',
    switchVariant: 'Passer à cette variante',
    addExercise: 'Ajouter un exercice',
    moveUp: 'Monter',
    deleteSession: 'Supprimer la séance',
    deleteSessionConfirm: "Supprimer cette séance ? Ses créneaux dans l'agenda seront aussi supprimés.",
    deleteExercise: "Supprimer l'exercice",
    scheduleTitle: "Ajouter à l'agenda chaque semaine",
    scheduleDay: 'Jour',
    scheduleTime: 'Heure',
    scheduleDuration: 'Durée (min)',
    scheduleAdd: 'Ajouter',
    scheduled: "Séance ajoutée à l'agenda.",
    prevDay: 'Jour précédent',
    nextDay: 'Jour suivant',
    today: "Aujourd'hui",
    pickSession: "Aucune séance n'est liée à ce créneau. Choisissez-en une :",
    guideTitle: 'Guide pour progresser seul',
    libraryTitle: 'Bibliothèque d’exercices',
    back: '← Retour à la séance',
    playVideo: 'Lire la vidéo',
    moreVideos: '▶ Autres vidéos sur YouTube',
    findVideos: '▶ Voir des vidéos sur YouTube',
    tipsProgression: 'Comment progresser',
    tipsSafety: 'Sécurité',
    tipsAbs: 'Abdos visibles',
    allowAgain: 'Réautoriser',
    exclude: '🚫 Je ne veux pas faire cet exercice',
    excludeConfirm: 'Ne plus proposer « {name} » ? Il sera remplacé par la variante la plus proche.',
    target: 'Objectif : autant ou mieux que le {date} → {values}',
    intensity: 'Chaque série : arrête-toi quand il te reste 1 à 3 répétitions propres en réserve.',
    addSet: 'Ajouter une série',
    holdStart: '▶ Chrono',
    holdStartTitle: 'Chronométrer la prochaine série (3 s pour se mettre en place)',
    holdGetReady: 'en position…',
    holdReached: 'Objectif atteint ! Tiens encore si tu peux.',
    holdStop: '✓ Stop',
    holdCancel: 'Annuler sans noter',
    autoRest: 'Repos lancé tout seul après chaque série notée',
    summaryTitle: '🎉 Séance terminée',
    summarySets: 'séries',
    summaryReps: 'répétitions',
    summaryHeld: 'tenu au total',
    summaryVsLast: 'vs la dernière fois',
    summaryRecords: 'Records battus',
    summaryRecord: '🏆 {name} : {value} (avant {before})',
    summaryUnlocked: 'Variantes débloquées',
    summaryFirst: 'Première fois sur ces variantes : ces chiffres seront ton objectif la prochaine fois.',
    summaryDetail: 'Détail',
    reminderExercises: '{count} exercices : {names}'
  },
  en: {
    sessionsTitle: 'Workouts',
    addSession: 'New workout',
    loadProgram: 'Preset workouts',
    guide: '📖 Guide & exercises',
    newSessionName: 'New workout',
    emptyList: 'No workouts yet. Create one or add preset workouts.',
    presetsTitle: 'Preset workouts',
    presetsHint: 'Tick the workouts you want to add, then choose when to do them. You can edit them afterwards.',
    presetPresent: 'Already in your workouts',
    presetSchedule: 'Put them in the calendar every week (suggested day, 18:00)',
    presetAdd: 'Add ({count})',
    presetCancel: 'Cancel',
    presetRepeat: 'Repeat',
    presetNoCalendar: 'Not in the calendar',
    presetOnce: 'Just once',
    presetEveryWeek: 'Every {day} at {time}',
    presetEveryMonth: 'On day {day} of every month at {time}',
    presetEveryDay: 'Every day at {time}',
    presetOnceOn: 'On {date} at {time}',
    presetAllPresent: 'All preset workouts are already in your list.',
    presetAdded: '{count} workout(s) added.',
    presetAddedScheduled: '{count} workout(s) added, {scheduled} in the calendar.',
    noSession: 'Select or create a workout.',
    notPlanned: 'Not scheduled on this day',
    plannedOn: 'Scheduled: {days}',
    plannedAt: 'Today at {time} · {duration} min',
    notScheduled: 'Not in the calendar yet',
    weekToDo: 'To do this week',
    weekDoneOn: '✓ done {day}',
    weekStatus: 'To do this week · {done}/{total} done',
    weekAlreadyDone: '✓ Already done this week ({day})',
    weekDoneToday: '✓ Done today',
    reminderWeekDone: 'Every workout of the week is done 👏',
    warmupTitle: '🔥 Warm-up (≈ {min} min)',
    warmupApproach: 'Ramp-up sets, right before the exercise:',
    warmupApproachLine: 'before "{exercise}": {list}',
    approachThen: ', then ',
    approachLoad: 'Backpack half loaded, no strain.',
    approachEasy: 'Easier variation, perfect form.',
    approachToday: 'Today’s variation, far from failure: just to groove the movement.',
    progress: '{done}/{total} exercises done',
    allDone: 'Workout complete, well done!',
    noExercises: 'No exercises yet. Click "Edit" to add some.',
    instructions: 'Instructions',
    edit: '✎ Edit',
    editTitle: 'Edit workout',
    doneEditing: 'Done',
    nameLabel: 'Workout name',
    descriptionLabel: 'Warm-up / instructions',
    exercisesTitle: 'Exercises',
    exercise: 'Exercise',
    variant: 'Library exercise',
    customExercise: 'Custom',
    sets: 'Sets',
    reps: 'Reps',
    rest: 'Rest (s)',
    tip: 'Tip',
    setsReps: '{sets} sets × {reps}',
    restShort: 'rest {rest}',
    setLabel: 'Set {n}',
    lastTime: 'Last time ({date}): {values}',
    todayNote: "Today's note",
    todayNotePlaceholder: 'Note (feeling, variation…)',
    restTimer: '⏱ {rest}',
    timerRunning: 'Rest',
    timerDone: 'Rest over: next set!',
    timerStop: 'Skip',
    howTo: 'Technique',
    howToTitle: 'How to',
    mistakes: 'Common mistakes',
    ladder: 'Progression',
    muscles: 'Muscles: {muscles}',
    current: 'current',
    useVariant: 'Choose',
    suggestUp: 'Well done, {max} on every set. Move to: {name}',
    suggestUpTop: 'Well done, {max} on every set. Add a set or slow down the descent (3 s).',
    suggestDown: 'Below {min} on some sets. Try: {name}',
    suggestKeep: 'Goal: {max} on every set, then the next variation.',
    suggestLoadUp: 'Well done, {max} on every set. Add weight to the backpack (+0.5 to 1.5 kg). Backpack already at its maximum (10–12 kg)? Move to: {name}',
    suggestLoadTop: 'Well done, {max} on every set. Add weight to the backpack (+0.5 to 1.5 kg), up to 10–12 kg at most.',
    suggestLoadDown: 'Below {min} on some sets: take one bottle out of the backpack next time.',
    suggestLoadKeep: 'Goal: {max} on every set, then add weight to the backpack.',
    switchVariant: 'Switch to this variation',
    addExercise: 'Add exercise',
    moveUp: 'Move up',
    deleteSession: 'Delete workout',
    deleteSessionConfirm: 'Delete this workout? Its calendar slots will be deleted too.',
    deleteExercise: 'Delete exercise',
    scheduleTitle: 'Add to the calendar every week',
    scheduleDay: 'Day',
    scheduleTime: 'Time',
    scheduleDuration: 'Duration (min)',
    scheduleAdd: 'Add',
    scheduled: 'Workout added to the calendar.',
    prevDay: 'Previous day',
    nextDay: 'Next day',
    today: 'Today',
    pickSession: 'No workout is linked to this slot. Pick one:',
    guideTitle: 'Guide to progress on your own',
    libraryTitle: 'Exercise library',
    back: '← Back to workout',
    playVideo: 'Play video',
    moreVideos: '▶ More videos on YouTube',
    findVideos: '▶ Find videos on YouTube',
    tipsProgression: 'How to progress',
    tipsSafety: 'Safety',
    tipsAbs: 'Visible abs',
    allowAgain: 'Allow again',
    exclude: '🚫 I don\'t want to do this exercise',
    excludeConfirm: 'Stop suggesting "{name}"? It will be replaced by the closest variation.',
    target: 'Goal: match or beat {date} → {values}',
    intensity: 'Every set: stop when you have 1 to 3 clean reps left in the tank.',
    addSet: 'Add a set',
    holdStart: '▶ Timer',
    holdStartTitle: 'Time the next set (3 s to get into position)',
    holdGetReady: 'get into position…',
    holdReached: 'Goal reached! Hold on longer if you can.',
    holdStop: '✓ Stop',
    holdCancel: 'Cancel without saving',
    autoRest: 'Start the rest timer after each logged set',
    summaryTitle: '🎉 Workout complete',
    summarySets: 'sets',
    summaryReps: 'reps',
    summaryHeld: 'held in total',
    summaryVsLast: 'vs last time',
    summaryRecords: 'Personal bests',
    summaryRecord: '🏆 {name}: {value} (was {before})',
    summaryUnlocked: 'Unlocked variations',
    summaryFirst: 'First time on these variations: these numbers will be your goal next time.',
    summaryDetail: 'Details',
    reminderExercises: '{count} exercises: {names}'
  },
  vi: {
    sessionsTitle: 'Buổi tập',
    addSession: 'Buổi tập mới',
    loadProgram: 'Buổi tập mẫu',
    guide: '📖 Hướng dẫn & bài tập',
    newSessionName: 'Buổi tập mới',
    emptyList: 'Chưa có buổi tập. Hãy tạo mới hoặc thêm buổi tập mẫu.',
    presetsTitle: 'Buổi tập mẫu',
    presetsHint: 'Chọn các buổi tập bạn muốn thêm, rồi chọn thời gian. Bạn có thể chỉnh sửa sau.',
    presetPresent: 'Đã có trong danh sách',
    presetSchedule: 'Thêm vào lịch hằng tuần (ngày gợi ý, 18:00)',
    presetAdd: 'Thêm ({count})',
    presetCancel: 'Hủy',
    presetRepeat: 'Lặp lại',
    presetNoCalendar: 'Không thêm vào lịch',
    presetOnce: 'Một lần',
    presetEveryWeek: 'Mỗi {day} lúc {time}',
    presetEveryMonth: 'Ngày {day} hằng tháng lúc {time}',
    presetEveryDay: 'Hằng ngày lúc {time}',
    presetOnceOn: '{date} lúc {time}',
    presetAllPresent: 'Tất cả buổi tập mẫu đã có trong danh sách.',
    presetAdded: 'Đã thêm {count} buổi tập.',
    presetAddedScheduled: 'Đã thêm {count} buổi tập, {scheduled} buổi vào lịch.',
    noSession: 'Chọn hoặc tạo một buổi tập.',
    notPlanned: 'Không có lịch vào ngày này',
    plannedOn: 'Lịch: {days}',
    plannedAt: 'Hôm nay lúc {time} · {duration} phút',
    notScheduled: 'Chưa có trong lịch',
    weekToDo: 'Cần tập tuần này',
    weekDoneOn: '✓ đã tập {day}',
    weekStatus: 'Cần tập tuần này · đã tập {done}/{total}',
    weekAlreadyDone: '✓ Đã tập tuần này ({day})',
    weekDoneToday: '✓ Đã tập hôm nay',
    reminderWeekDone: 'Đã tập đủ các buổi trong tuần 👏',
    warmupTitle: '🔥 Khởi động (≈ {min} phút)',
    warmupApproach: 'Hiệp làm quen, ngay trước bài tập:',
    warmupApproachLine: 'trước « {exercise} »: {list}',
    approachThen: ', rồi ',
    approachLoad: 'Ba lô nạp một nửa, không gắng sức.',
    approachEasy: 'Biến thể dễ hơn, kỹ thuật chuẩn.',
    approachToday: 'Biến thể hôm nay, còn xa giới hạn: chỉ để quen động tác.',
    progress: 'Đã tập {done}/{total} bài',
    allDone: 'Hoàn thành buổi tập, tuyệt vời!',
    noExercises: 'Chưa có bài tập. Nhấn "Sửa" để thêm.',
    instructions: 'Hướng dẫn',
    edit: '✎ Sửa',
    editTitle: 'Sửa buổi tập',
    doneEditing: 'Xong',
    nameLabel: 'Tên buổi tập',
    descriptionLabel: 'Khởi động / hướng dẫn',
    exercisesTitle: 'Bài tập',
    exercise: 'Bài tập',
    variant: 'Bài tập trong thư viện',
    customExercise: 'Tùy chỉnh',
    sets: 'Hiệp',
    reps: 'Lần',
    rest: 'Nghỉ (giây)',
    tip: 'Lưu ý',
    setsReps: '{sets} hiệp × {reps}',
    restShort: 'nghỉ {rest}',
    setLabel: 'Hiệp {n}',
    lastTime: 'Lần trước ({date}): {values}',
    todayNote: 'Ghi chú hôm nay',
    todayNotePlaceholder: 'Ghi chú (cảm nhận, biến thể…)',
    restTimer: '⏱ {rest}',
    timerRunning: 'Nghỉ',
    timerDone: 'Hết giờ nghỉ: hiệp tiếp theo!',
    timerStop: 'Bỏ qua',
    howTo: 'Kỹ thuật',
    howToTitle: 'Cách thực hiện',
    mistakes: 'Lỗi thường gặp',
    ladder: 'Tiến độ',
    muscles: 'Nhóm cơ: {muscles}',
    current: 'hiện tại',
    useVariant: 'Chọn',
    suggestUp: 'Tuyệt, đạt {max} ở mọi hiệp. Chuyển sang: {name}',
    suggestUpTop: 'Tuyệt, đạt {max} ở mọi hiệp. Thêm một hiệp hoặc hạ chậm hơn (3 giây).',
    suggestDown: 'Dưới {min} ở một số hiệp. Hãy thử: {name}',
    suggestKeep: 'Mục tiêu: {max} ở mọi hiệp, rồi chuyển biến thể tiếp theo.',
    suggestLoadUp: 'Tuyệt, đạt {max} ở mọi hiệp. Thêm tạ vào ba lô (+0,5 đến 1,5 kg). Ba lô đã ở mức tối đa (10–12 kg)? Chuyển sang: {name}',
    suggestLoadTop: 'Tuyệt, đạt {max} ở mọi hiệp. Thêm tạ vào ba lô (+0,5 đến 1,5 kg), tối đa 10–12 kg.',
    suggestLoadDown: 'Dưới {min} ở một số hiệp: lần sau bớt một chai khỏi ba lô.',
    suggestLoadKeep: 'Mục tiêu: {max} ở mọi hiệp, rồi thêm tạ vào ba lô.',
    switchVariant: 'Chuyển sang biến thể này',
    addExercise: 'Thêm bài tập',
    moveUp: 'Lên trên',
    deleteSession: 'Xóa buổi tập',
    deleteSessionConfirm: 'Xóa buổi tập này? Các lịch tương ứng cũng sẽ bị xóa.',
    deleteExercise: 'Xóa bài tập',
    scheduleTitle: 'Thêm vào lịch mỗi tuần',
    scheduleDay: 'Ngày',
    scheduleTime: 'Giờ',
    scheduleDuration: 'Thời lượng (phút)',
    scheduleAdd: 'Thêm',
    scheduled: 'Đã thêm buổi tập vào lịch.',
    prevDay: 'Ngày trước',
    nextDay: 'Ngày sau',
    today: 'Hôm nay',
    pickSession: 'Chưa có buổi tập nào gắn với lịch này. Hãy chọn:',
    guideTitle: 'Hướng dẫn tự tập',
    libraryTitle: 'Thư viện bài tập',
    back: '← Quay lại buổi tập',
    playVideo: 'Phát video',
    moreVideos: '▶ Thêm video trên YouTube',
    findVideos: '▶ Tìm video trên YouTube',
    tipsProgression: 'Cách tiến bộ',
    tipsSafety: 'An toàn',
    tipsAbs: 'Cơ bụng rõ nét',
    allowAgain: 'Cho phép lại',
    exclude: '🚫 Tôi không muốn tập bài này',
    excludeConfirm: 'Không đề xuất "{name}" nữa? Bài sẽ được thay bằng biến thể gần nhất.',
    target: 'Mục tiêu: bằng hoặc hơn ngày {date} → {values}',
    intensity: 'Mỗi hiệp: dừng khi còn 1–3 lần lặp chuẩn trong sức.',
    addSet: 'Thêm một hiệp',
    holdStart: '▶ Bấm giờ',
    holdStartTitle: 'Bấm giờ hiệp tiếp theo (3 giây để vào tư thế)',
    holdGetReady: 'vào tư thế…',
    holdReached: 'Đạt mục tiêu! Cố giữ thêm nếu được.',
    holdStop: '✓ Dừng',
    holdCancel: 'Hủy, không ghi',
    autoRest: 'Tự bắt đầu giờ nghỉ sau mỗi hiệp đã ghi',
    summaryTitle: '🎉 Hoàn thành buổi tập',
    summarySets: 'hiệp',
    summaryReps: 'lần lặp',
    summaryHeld: 'tổng thời gian giữ',
    summaryVsLast: 'so với lần trước',
    summaryRecords: 'Kỷ lục mới',
    summaryRecord: '🏆 {name}: {value} (trước: {before})',
    summaryUnlocked: 'Biến thể đã mở khóa',
    summaryFirst: 'Lần đầu với các biến thể này: các con số này sẽ là mục tiêu lần sau.',
    summaryDetail: 'Chi tiết',
    reminderExercises: '{count} bài: {names}'
  }
};

const SPORT_TAB_TRANSLATIONS = { fr: 'Sport', en: 'Sport', vi: 'Thể thao' };

let sportSelectedDate = null;
let sportPickerEvent = null;
let sportView = 'workout'; // 'workout' | 'edit' | 'presets' | 'history'
let sportOpenHelp = null; // id de l'exercice dont la fiche est ouverte
let sportTimer = null;

function registerSportTranslations() {
  Object.keys(SPORT_TRANSLATIONS).forEach((language) => {
    if (!translations[language]) return;
    translations[language].sport = SPORT_TRANSLATIONS[language];
    if (translations[language].tabs) {
      translations[language].tabs.sport = SPORT_TAB_TRANSLATIONS[language];
    }
  });
}

/* ── Données ───────────────────────────────────────────────── */

function ensureSportData() {
  if (!appData.sport || typeof appData.sport !== 'object') {
    appData.sport = { sessions: [], logs: {}, activeSessionId: null };
  }
  if (!Array.isArray(appData.sport.sessions)) appData.sport.sessions = [];
  if (!appData.sport.logs || typeof appData.sport.logs !== 'object') appData.sport.logs = {};
  if (!Array.isArray(appData.sport.excluded)) appData.sport.excluded = SPORT_DEFAULT_EXCLUDED.slice();
  migrerProgrammeV3();
  migrerProgrammeV4();
  migrerProgrammeV5();
  migrerProgrammeV6();
  migrerProgrammeV7();
  migrerProgrammeV8();
  renommerSeancesPrefaites();
  appData.sport.sessions.forEach((session) => {
    if (!Array.isArray(session.exercises)) session.exercises = [];
    session.exercises.forEach(normalizeLadderExercise);
    if (session.description) {
      session.description = session.description
        .replace('10 rowings serviette faciles', '10 supermans lents')
        .replace('10 rowings sous table faciles', '10 supermans lents');
    }
  });
  if (!appData.sport.sessions.some((session) => session.id === appData.sport.activeSessionId)) {
    appData.sport.activeSessionId = appData.sport.sessions.length ? appData.sport.sessions[0].id : null;
  }
}

function sportProgramIndexByName(name) {
  const index = SPORT_PROGRAM.findIndex((template) => template.name === name);
  if (index !== -1) return index;
  const letter = SPORT_PROGRAM_OLD_NAMES.indexOf(name);
  return letter !== -1 ? letter : SPORT_PROGRAM_V4_NAMES.indexOf(name);
}

// Renomme une séance et ses créneaux de l'agenda qui portaient son nom.
function renameSportSession(session, name) {
  const oldName = session.name;
  session.name = name;
  (appData.calendar && Array.isArray(appData.calendar.events) ? appData.calendar.events : []).forEach((event) => {
    if (event.sportSessionId === session.id && event.title === oldName) event.title = name;
  });
}

// Séances préfaites encore au nom d'origine « A — … » : on retire la lettre
// (séance et créneaux de l'agenda). Un nom changé à la main est gardé.
function renommerSeancesPrefaites() {
  appData.sport.sessions.forEach((session) => {
    if (session.template !== SPORT_TEMPLATE_KEY) return;
    const index = SPORT_PROGRAM_OLD_NAMES.indexOf(session.name);
    if (index === -1) return;
    renameSportSession(session, SPORT_PROGRAM[index].name);
  });
}

function getSportSession(id) {
  return appData.sport.sessions.find((session) => session.id === id) || null;
}

function getSportType() {
  return appData.calendar.types.find((type) => (type.name || '').trim().toLowerCase() === SPORT_TYPE_NAME.toLowerCase()) || null;
}

function getOrCreateSportType() {
  let type = getSportType();
  if (!type) {
    type = { id: uid(), name: SPORT_TYPE_NAME, color: SPORT_TYPE_COLOR };
    appData.calendar.types.push(type);
  }
  return type;
}

function isSportEvent(event) {
  if (!event) return false;
  if (event.sportSessionId) return true;
  const type = event.typeId ? getEventTypeById(event.typeId) : null;
  return Boolean(type && (type.name || '').trim().toLowerCase() === SPORT_TYPE_NAME.toLowerCase());
}

function sportDateKey(date) {
  return toISODateString(date);
}

function getSportLog(dateKey, sessionId) {
  const day = appData.sport.logs[dateKey];
  return day && day[sessionId] ? day[sessionId] : {};
}

function setSportLog(dateKey, sessionId, exerciseId, patch) {
  if (!appData.sport.logs[dateKey]) appData.sport.logs[dateKey] = {};
  if (!appData.sport.logs[dateKey][sessionId]) appData.sport.logs[dateKey][sessionId] = {};
  const entry = appData.sport.logs[dateKey][sessionId];
  entry[exerciseId] = { ...(entry[exerciseId] || {}), ...patch };
  saveData();
}

// Dernière saisie avant la date donnée, pour la même variante de l'exercice.
function getLastPerformance(sessionId, exercise, beforeKey) {
  const keys = Object.keys(appData.sport.logs).filter((key) => key < beforeKey).sort().reverse();
  for (const key of keys) {
    const entry = appData.sport.logs[key][sessionId] && appData.sport.logs[key][sessionId][exercise.id];
    if (entry && entry.variant && entry.variant !== exercise.name) continue;
    if (entry && Array.isArray(entry.sets) && entry.sets.some((value) => Number(value) > 0)) {
      return { dateKey: key, sets: entry.sets };
    }
  }
  return null;
}

// Meilleure série avant la date donnée, pour la même variante de l'exercice.
function getBestSet(sessionId, exercise, beforeKey) {
  let best = 0;
  Object.keys(appData.sport.logs).forEach((key) => {
    if (key >= beforeKey) return;
    const entry = appData.sport.logs[key][sessionId] && appData.sport.logs[key][sessionId][exercise.id];
    if (!entry || !Array.isArray(entry.sets) || (entry.variant && entry.variant !== exercise.name)) return;
    entry.sets.forEach((value) => {
      best = Math.max(best, Number(value) || 0);
    });
  });
  return best;
}

// "8–12" → {min: 8, max: 12} ; "30–45 s" → {30, 45} ; "10 / jambe" → {10, 10}
function parseRepRange(reps) {
  const text = String(reps || '');
  const range = /(\d+)\s*[–-]\s*(\d+)/.exec(text);
  if (range) return { min: Number(range[1]), max: Number(range[2]) };
  const single = /(\d+)/.exec(text);
  return single ? { min: Number(single[1]), max: Number(single[1]) } : null;
}

// Exercice tenu : la fourchette est en secondes (« 20–40 s », « 20–30 s / côté »).
function isTimedExercise(exercise) {
  return /\d\s*s\b/.test(String((exercise && exercise.reps) || ''));
}

function sportSessionDone(session, dateKey) {
  const log = getSportLog(dateKey, session.id);
  return session.exercises.length > 0 && session.exercises.every((exercise) => log[exercise.id] && log[exercise.id].done);
}

function getLadderStep(exercise) {
  const ladder = exercise.ladder ? SPORT_LADDERS[exercise.ladder] : null;
  if (!ladder) return { ladder: null, step: null };
  return { ladder, step: ladder.steps[exercise.step] || null };
}

// v3 (28/09/2026) : plus de rowing sous table ni à la porte (tirage au sac à
// dos + dos au sol), et l'exercice 4 de la séance A n'est plus une deuxième
// variante de pompes classiques mais des pompes larges. Les exercices gardent
// leur identifiant : seuls ceux qui changent de nature sont remplacés.
function migrerProgrammeV3() {
  if ((appData.sport.migration || 0) >= 3) return;
  SPORT_DEFAULT_EXCLUDED.forEach((name) => {
    if (!appData.sport.excluded.includes(name)) appData.sport.excluded.push(name);
  });
  const aRemplacer = { 0: [1, 3], 1: [0], 2: [1] }; // séance -> positions modifiées
  appData.sport.sessions.forEach((session) => {
    if (session.template !== SPORT_TEMPLATE_KEY || !(session.templateVersion >= 2)) return;
    let index = Number.isInteger(session.templateIndex) ? session.templateIndex : null;
    if (index === null) {
      const parNom = sportProgramIndexByName(session.name);
      index = parNom === -1 ? null : parNom;
    }
    const template = index !== null ? SPORT_PROGRAM[index] : null;
    if (!template) return;
    (aRemplacer[index] || []).forEach((position) => {
      const exercise = session.exercises[position];
      const cible = template.exercises[position];
      if (!exercise || !cible || !['pull', 'push'].includes(exercise.ladder)) return;
      const [ladderId, stepIndex, sets, rest] = cible;
      applyLadderStep(exercise, ladderId, stepIndex);
      exercise.sets = sets;
      exercise.rest = rest;
    });
    session.templateVersion = 3;
  });
  appData.sport.migration = 3;
}

// v4 (28/09/2026) : abdos en flexion plutôt qu'en cardio, et plus de tirage.
// A : relevés de jambes → crunch inversé ; C : Y-T-W → rowing sac à dos,
// mountain climbers → crunch. Les autres exercices gardent leur progression.
function migrerProgrammeV4() {
  if ((appData.sport.migration || 0) >= 4) return;
  const aRemplacer = { 0: { 4: 'legraise' }, 2: { 1: 'back', 5: 'climbers' } }; // séance -> position -> ancienne échelle
  appData.sport.sessions.forEach((session) => {
    if (session.template !== SPORT_TEMPLATE_KEY || session.templateVersion !== 3) return;
    const index = Number.isInteger(session.templateIndex)
      ? session.templateIndex
      : sportProgramIndexByName(session.name);
    const template = SPORT_PROGRAM[index];
    if (!template) return;
    Object.entries(aRemplacer[index] || {}).forEach(([position, ancienne]) => {
      const exercise = session.exercises[position];
      const cible = template.exercises[position];
      if (!exercise || !cible || exercise.ladder !== ancienne) return;
      const [ladderId, stepIndex, sets, rest] = cible;
      applyLadderStep(exercise, ladderId, stepIndex);
      exercise.sets = sets;
      exercise.rest = rest;
    });
    session.templateVersion = 4;
  });
  appData.sport.migration = 4;
}

// v5 (05/10/2026) : autant de tirage que de poussée, et des épaules, sans
// meuble solide. Rowing sac à dos → rowing inversé à la barre (A et C),
// pompes larges → Y-T-W (A), pont fessier → leg curl à la serviette (B).
// C devient « Pecs, épaules & abdos » : ses pompes passent en premier (même
// exercice, l'historique suit) et ses pompes larges deviennent des pompes
// piquées. Seuls les exercices encore à leur échelle d'origine changent ;
// le nom et les consignes aussi, s'ils n'ont pas été modifiés à la main.
function migrerProgrammeV5() {
  if ((appData.sport.migration || 0) >= 5) return;
  // Le rowing sac à dos (position 1 de A et C) n'est plus remplacé : le
  // programme v6 l'a remis à la place du rowing à la barre.
  const aRemplacer = { 0: { 3: 'wide' }, 1: { 3: 'hinge' } }; // séance -> position -> ancienne échelle
  appData.sport.sessions.forEach((session) => {
    if (session.template !== SPORT_TEMPLATE_KEY || session.templateVersion !== 4) return;
    const index = Number.isInteger(session.templateIndex)
      ? session.templateIndex
      : sportProgramIndexByName(session.name);
    const template = SPORT_PROGRAM[index];
    if (!template) return;
    const exercises = session.exercises;
    const apply = (exercise, position) => {
      const [ladderId, stepIndex, sets, rest] = template.exercises[position];
      applyLadderStep(exercise, ladderId, stepIndex);
      exercise.sets = sets;
      exercise.rest = rest;
    };
    if (index === 2 && exercises[0] && exercises[0].ladder === 'wide' && exercises[3] && exercises[3].ladder === 'push') {
      const [wide, , , push] = exercises;
      exercises[0] = push;
      exercises[3] = wide;
      [, , push.sets, push.rest] = template.exercises[0];
      apply(wide, 3);
    }
    Object.entries(aRemplacer[index] || {}).forEach(([position, ancienne]) => {
      const exercise = exercises[position];
      if (exercise && exercise.ladder === ancienne) apply(exercise, Number(position));
    });
    if (session.description === SPORT_PROGRAM_V4_DESCRIPTIONS[index]) session.description = template.description;
    if (session.name === SPORT_PROGRAM_V4_NAMES[index]) renameSportSession(session, template.name);
    session.templateVersion = 5;
  });
  appData.sport.migration = 5;
}

// v6 (05/10/2026) : sans barre de traction. Le rowing à la barre de A et C
// redevient un rowing avec sac à dos, à la dernière variante faite (sinon
// celle du programme). Consignes sans la barre si elles n'ont pas été modifiées.
function migrerProgrammeV6() {
  if ((appData.sport.migration || 0) >= 6) return;
  appData.sport.sessions.forEach((session) => {
    if (session.template !== SPORT_TEMPLATE_KEY || session.templateVersion !== 5) return;
    const index = Number.isInteger(session.templateIndex)
      ? session.templateIndex
      : sportProgramIndexByName(session.name);
    const template = SPORT_PROGRAM[index];
    if (!template) return;
    const exercise = session.exercises[1];
    if ((index === 0 || index === 2) && exercise && exercise.ladder === 'invrow') {
      const [ladderId, stepIndex, sets, rest] = template.exercises[1];
      const names = SPORT_LADDERS[ladderId].steps.map((step) => step.name);
      const lastKey = Object.keys(appData.sport.logs).sort().reverse().find((key) => {
        const entry = appData.sport.logs[key][session.id] && appData.sport.logs[key][session.id][exercise.id];
        return entry && names.includes(entry.variant);
      });
      const lastStep = lastKey ? names.indexOf(appData.sport.logs[lastKey][session.id][exercise.id].variant) : -1;
      applyLadderStep(exercise, ladderId, lastStep !== -1 ? lastStep : stepIndex);
      exercise.sets = sets;
      exercise.rest = rest;
    }
    if (session.description === SPORT_PROGRAM_V5_DESCRIPTIONS[index]) session.description = template.description;
    session.templateVersion = 6;
  });
  appData.sport.migration = 6;
}

// v7 (08/10/2026) : programme revu (départs recalés, plus d'ischios, tirage
// glissé, échauffements détaillés, plus rien sur une table ou une chaise).
// Variantes renommées : séances, saisies (variant) et exclusions suivent.
// Séance préfaite à la structure v6 intacte : nouvelle liste d'exercices. Un
// exercice déjà présent garde son identifiant (donc son historique) et sa
// variante si elle est plus avancée que le nouveau départ ; les nouveaux
// sont créés. Consignes remplacées si elles n'ont pas été modifiées.
function migrerProgrammeV7() {
  if ((appData.sport.migration || 0) >= 7) return;
  const renomme = (name) => SPORT_V7_RENAMED[name] || name;
  appData.sport.excluded = appData.sport.excluded.map(renomme);
  SPORT_DEFAULT_EXCLUDED.forEach((name) => {
    if (!appData.sport.excluded.includes(name)) appData.sport.excluded.push(name);
  });
  Object.values(appData.sport.logs).forEach((day) => {
    Object.values(day || {}).forEach((seance) => {
      Object.values(seance || {}).forEach((entry) => {
        if (entry && entry.variant) entry.variant = renomme(entry.variant);
      });
    });
  });
  appData.sport.sessions.forEach((session) => {
    (session.exercises || []).forEach((exercise) => {
      if (exercise.name) exercise.name = renomme(exercise.name);
    });
    if (session.template !== SPORT_TEMPLATE_KEY || session.templateVersion !== 6) return;
    const index = Number.isInteger(session.templateIndex)
      ? session.templateIndex
      : sportProgramIndexByName(session.name);
    const template = SPORT_PROGRAM[index];
    if (!template) return;
    const echelles = (session.exercises || []).map((exercise) => exercise.ladder || null);
    if (JSON.stringify(echelles) === JSON.stringify(SPORT_PROGRAM_V6_LADDERS[index])) {
      const restants = session.exercises.slice();
      session.exercises = template.exercises.map(([ladderId, stepIndex, sets, rest]) => {
        const position = restants.findIndex((exercise) => exercise.ladder === ladderId);
        const exercise = position !== -1 ? restants.splice(position, 1)[0] : { id: uid() };
        const actuelle = SPORT_LADDERS[ladderId].steps.findIndex((step) => step.name === exercise.name);
        applyLadderStep(exercise, ladderId, Math.max(actuelle, stepIndex));
        exercise.sets = sets;
        exercise.rest = rest;
        return exercise;
      });
    } else {
      // Séance retouchée à la main : on garde ses exercices, fourchettes à jour.
      session.exercises.forEach((exercise) => {
        const ladder = exercise.ladder ? SPORT_LADDERS[exercise.ladder] : null;
        const step = ladder && ladder.steps.find((item) => item.name === exercise.name);
        if (step) exercise.reps = step.reps;
      });
    }
    if (session.description === SPORT_PROGRAM_V6_DESCRIPTIONS[index]) session.description = template.description;
    session.templateVersion = 7;
  });
  appData.sport.migration = 7;
}

// v8 (08/10/2026) : l'échauffement n'est plus écrit dans les consignes, il est
// construit d'après les exercices (carte « Échauffement » et mode guidé).
function migrerProgrammeV8() {
  if ((appData.sport.migration || 0) >= 8) return;
  appData.sport.sessions.forEach((session) => {
    if (session.template !== SPORT_TEMPLATE_KEY || session.templateVersion !== 7) return;
    const index = Number.isInteger(session.templateIndex)
      ? session.templateIndex
      : sportProgramIndexByName(session.name);
    const template = SPORT_PROGRAM[index];
    if (!template) return;
    if (session.description === SPORT_PROGRAM_V7_DESCRIPTIONS[index]) session.description = template.description;
    session.templateVersion = 8;
  });
  appData.sport.migration = 8;
}

function isExcludedName(name) {
  return Boolean(appData.sport && Array.isArray(appData.sport.excluded) && appData.sport.excluded.includes(name));
}

// Étape autorisée la plus proche : d'abord dans la direction demandée, puis dans l'autre.
function findAllowedStep(ladderId, stepIndex, direction = 1) {
  const ladder = SPORT_LADDERS[ladderId];
  if (!ladder) return null;
  const allowed = (index) => index >= 0 && index < ladder.steps.length && !isExcludedName(ladder.steps[index].name);
  for (let i = stepIndex; i >= 0 && i < ladder.steps.length; i += direction) {
    if (allowed(i)) return i;
  }
  for (let i = stepIndex - direction; i >= 0 && i < ladder.steps.length; i -= direction) {
    if (allowed(i)) return i;
  }
  return null;
}

// Retrouve l'étape d'après le nom (robuste aux changements de bibliothèque)
// et remplace une variante exclue par la plus proche autorisée.
function normalizeLadderExercise(exercise) {
  const ladder = exercise.ladder ? SPORT_LADDERS[exercise.ladder] : null;
  if (!ladder) return;
  const byName = ladder.steps.findIndex((step) => step.name === exercise.name);
  if (byName !== -1) exercise.step = byName;
  if (!ladder.steps[exercise.step]) exercise.step = Math.min(Math.max(0, Number(exercise.step) || 0), ladder.steps.length - 1);
  if (isExcludedName(ladder.steps[exercise.step].name)) {
    const replacement = findAllowedStep(exercise.ladder, exercise.step, 1);
    if (replacement !== null) {
      applyLadderStep(exercise, exercise.ladder, replacement);
    } else if (SPORT_LADDER_FALLBACK[exercise.ladder]) {
      // Toute l'échelle est exclue : on passe à l'échelle de repli.
      const repli = SPORT_LADDER_FALLBACK[exercise.ladder];
      const etape = findAllowedStep(repli, 0, 1);
      if (etape !== null) applyLadderStep(exercise, repli, etape);
    }
  }
}

function getVideoId(ladderId, stepIndex) {
  const videos = SPORT_VIDEOS[ladderId];
  return videos && videos[stepIndex] ? videos[stepIndex] : null;
}

function applyLadderStep(exercise, ladderId, stepIndex) {
  const ladder = SPORT_LADDERS[ladderId];
  if (!ladder || !ladder.steps[stepIndex]) return;
  const step = ladder.steps[stepIndex];
  exercise.ladder = ladderId;
  exercise.step = stepIndex;
  exercise.name = step.name;
  exercise.reps = step.reps;
  exercise.tip = ladder.cue;
}

// Suggestion de progression à partir des séries saisies.
function getProgressionAdvice(exercise, sets) {
  const range = parseRepRange(exercise.reps);
  const count = Math.max(1, Number(exercise.sets) || 1);
  const values = (sets || []).slice(0, count).map(Number);
  if (!range || values.length < count || values.some((value) => !(value > 0))) {
    return range ? { kind: 'keep', text: t('sport.suggestKeep', { max: range.max }) } : null;
  }
  const { ladder, step } = getLadderStep(exercise);
  const load = Boolean(step && step.load); // variante au sac à dos : poids d'abord
  // Étape voisine autorisée (on saute les variantes exclues).
  const neighbour = (direction) => {
    if (!ladder) return null;
    for (let i = exercise.step + direction; i >= 0 && i < ladder.steps.length; i += direction) {
      if (!isExcludedName(ladder.steps[i].name)) return i;
    }
    return null;
  };
  if (values.every((value) => value >= range.max)) {
    const next = neighbour(1);
    if (load) {
      return next !== null
        ? { kind: 'up', text: t('sport.suggestLoadUp', { max: range.max, name: ladder.steps[next].name }), step: next }
        : { kind: 'top', text: t('sport.suggestLoadTop', { max: range.max }) };
    }
    return next !== null
      ? { kind: 'up', text: t('sport.suggestUp', { max: range.max, name: ladder.steps[next].name }), step: next }
      : { kind: 'top', text: t('sport.suggestUpTop', { max: range.max }) };
  }
  if (values.some((value) => value < range.min)) {
    const prev = neighbour(-1);
    if (load) return { kind: 'keep', text: t('sport.suggestLoadDown', { min: range.min }) };
    if (prev !== null) return { kind: 'down', text: t('sport.suggestDown', { min: range.min, name: ladder.steps[prev].name }), step: prev };
  }
  return { kind: 'keep', text: t(load ? 'sport.suggestLoadKeep' : 'sport.suggestKeep', { max: range.max }) };
}

// Occurrences de l'agenda liées au sport sur une journée donnée.
function getSportOccurrencesOn(date) {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  const savedWeekStart = currentWeekStart;
  currentWeekStart = startOfWeek(day);
  const result = [];
  try {
    appData.calendar.events.filter(isSportEvent).forEach((event) => {
      getOccurrencesForWeek(event).forEach((occurrence) => {
        if (sportDateKey(new Date(occurrence.start)) === sportDateKey(day)) result.push(occurrence);
      });
    });
  } finally {
    currentWeekStart = savedWeekStart;
  }
  return result.sort((a, b) => new Date(a.start) - new Date(b.start));
}

function getSessionWeekdays(sessionId) {
  const days = new Set();
  appData.calendar.events
    .filter((event) => event.sportSessionId === sessionId && event.recurrence === 'weekly')
    .forEach((event) => days.add(new Date(event.start).getDay()));
  return Array.from(days).sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));
}

function weekdayName(day, format = 'long') {
  // 2023-01-01 est un dimanche.
  return new Date(2023, 0, 1 + day).toLocaleDateString(getCurrentLocale(), { weekday: format });
}

function formatRest(seconds) {
  const value = Number(seconds) || 0;
  if (value <= 0) return '';
  if (value < 60) return `${value} s`;
  const minutes = Math.floor(value / 60);
  const rest = value % 60;
  return rest ? `${minutes} min ${String(rest).padStart(2, '0')}` : `${minutes} min`;
}

function formatShortDate(dateKey) {
  return new Date(`${dateKey}T00:00`).toLocaleDateString(getCurrentLocale(), { weekday: 'short', day: 'numeric', month: 'short' });
}

/* ── Navigation depuis l'agenda ────────────────────────────── */

function goToSportTab() {
  const link = document.querySelector('.tab-link[data-target="sport"]');
  if (link && activateTabHandler) activateTabHandler(link);
}

function openSportFromCalendar(occurrence) {
  ensureSportData();
  const event = occurrence.sourceEvent;
  sportSelectedDate = new Date(occurrence.start);
  sportSelectedDate.setHours(0, 0, 0, 0);
  sportPickerEvent = null;
  sportView = 'workout';
  // Semaine libre : la séance du créneau si elle reste à faire cette semaine,
  // sinon la prochaine à faire (on peut décaler ses séances).
  const session = sportSessionForDate(sportSelectedDate, event.sportSessionId) || getSportSession(event.sportSessionId);
  if (session) {
    appData.sport.activeSessionId = session.id;
  } else if (appData.sport.sessions.length) {
    sportPickerEvent = event; // créneau sans séance : on propose d'en choisir une
  }
  goToSportTab();
  renderSport();
}

// Ouvre l'onglet Sport sur une séance et un jour (clic sur un rappel).
function openSportSessionOn(sessionId, dateKey) {
  ensureSportData();
  sportSelectedDate = dateKey ? new Date(`${dateKey}T00:00`) : null;
  sportPickerEvent = null;
  sportView = 'workout';
  if (getSportSession(sessionId)) appData.sport.activeSessionId = sessionId;
  goToSportTab();
  renderSport();
}

// Contenu du rappel d'un créneau Sport (calendar-reminders.js) : nom de la
// séance, exercices et où on en est de la semaine.
function sportReminderContent(event, occurrence) {
  ensureSportData();
  const day = new Date(occurrence.start);
  const session = sportSessionForDate(day, event.sportSessionId) || getSportSession(event.sportSessionId);
  if (!session) return null;
  const lines = [];
  const names = session.exercises.map((exercise) => exercise.name).filter(Boolean);
  if (names.length) {
    lines.push(t('sport.reminderExercises', { count: names.length, names: `${names.slice(0, 3).join(', ')}${names.length > 3 ? '…' : ''}` }));
  }
  if (typeof sportWeekStats === 'function') {
    const week = sportWeekStats(startOfWeek(day));
    if (week.met) lines.push(t('sport.reminderWeekDone'));
    else if (week.planned) lines.push(t('sport.weekBadge', week));
  }
  return {
    title: `🏋️ ${session.name || t('sport.newSessionName')}`,
    lines,
    open: { tab: 'sport', session: session.id, date: sportDateKey(new Date(occurrence.start)) }
  };
}

// Branche le clic gauche sur un évènement sport de l'agenda.
function attachSportClick(eventEl, occurrence) {
  if (!isSportEvent(occurrence.sourceEvent)) return;
  eventEl.classList.add('event--sport');
  let timer = null;
  eventEl.addEventListener('click', (clickEvent) => {
    if (clickEvent.target.closest('.delete-event, .resize-handle')) return;
    clearTimeout(timer);
    // Délai pour laisser le double-clic ouvrir la fenêtre de modification.
    timer = setTimeout(() => openSportFromCalendar(occurrence), SPORT_CLICK_DELAY_MS);
  });
  eventEl.addEventListener('dblclick', () => clearTimeout(timer));
}

/* ── Minuteur de repos ─────────────────────────────────────── */

const SPORT_HOLD_COUNTDOWN_S = 3;

function sportBeep(times = 3) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const context = new AudioCtx();
    [0, 0.25, 0.5].slice(0, times).forEach((offset) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = 880;
      gain.gain.setValueAtTime(0.2, context.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + offset + 0.2);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(context.currentTime + offset);
      oscillator.stop(context.currentTime + offset + 0.2);
    });
    setTimeout(() => context.close(), 1000);
  } catch (error) {
    // Son indisponible : pas grave.
  }
}

function sportAlert() {
  if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
  sportBeep();
}

function formatClock(seconds) {
  const value = Math.max(0, Math.floor(seconds));
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
}

function stopRestTimer() {
  if (sportTimer) clearInterval(sportTimer.interval);
  sportTimer = null;
  const box = document.getElementById('sport-timer');
  if (box) box.hidden = true;
}

// Boîte flottante partagée par le minuteur de repos et le chrono des exercices tenus.
function sportTimerBox() {
  stopRestTimer();
  let box = document.getElementById('sport-timer');
  if (!box) {
    box = sportEl('div', 'sport-timer');
    box.id = 'sport-timer';
    box.setAttribute('role', 'timer');
    document.body.appendChild(box);
  }
  box.hidden = false;
  box.innerHTML = '';
  box.classList.remove('sport-timer--done');
  const ui = {
    box,
    text: sportEl('div', 'sport-timer__text'),
    count: sportEl('div', 'sport-timer__count'),
    bar: sportEl('div', 'sport-timer__bar'),
    actions: sportEl('div', 'sport-timer__actions')
  };
  const track = sportEl('div', 'sport-timer__track');
  track.appendChild(ui.bar);
  box.append(ui.text, ui.count, track, ui.actions);
  return ui;
}

function startRestTimer(seconds, label) {
  const ui = sportTimerBox();
  ui.actions.appendChild(sportButton('sport-timer__stop', t('sport.timerStop'), stopRestTimer));
  ui.text.textContent = `${t('sport.timerRunning')} · ${label}`;

  const end = Date.now() + seconds * 1000;
  const tick = () => {
    const left = Math.max(0, Math.round((end - Date.now()) / 1000));
    ui.count.textContent = formatClock(left);
    ui.bar.style.width = `${(left / seconds) * 100}%`;
    if (left <= 0) {
      clearInterval(sportTimer.interval);
      ui.text.textContent = t('sport.timerDone');
      ui.box.classList.add('sport-timer--done');
      sportAlert();
      setTimeout(() => {
        if (sportTimer && sportTimer.end === end) stopRestTimer();
      }, 5000);
    }
  };
  sportTimer = { end, interval: setInterval(tick, 250) };
  tick();
}

// Chrono d'un exercice tenu : 3 s pour se mettre en place, puis le temps
// monte. Bip à l'objectif ; « Stop » renvoie les secondes tenues.
function startHoldTimer(label, target, onStop) {
  const ui = sportTimerBox();
  const startAt = Date.now() + SPORT_HOLD_COUNTDOWN_S * 1000;
  let started = false;
  let reached = false;
  const finish = (save) => {
    const held = started ? Math.floor((Date.now() - startAt) / 1000) : 0;
    stopRestTimer();
    if (save && held > 0) onStop(held);
  };
  ui.actions.append(
    sportButton('sport-timer__stop', t('sport.holdStop'), () => finish(true)),
    sportButton('sport-timer__cancel', '✕', () => finish(false), t('sport.holdCancel'))
  );
  const tick = () => {
    const now = Date.now();
    if (now < startAt) {
      ui.text.textContent = `${label} · ${t('sport.holdGetReady')}`;
      ui.count.textContent = String(Math.ceil((startAt - now) / 1000));
      ui.bar.style.width = '0%';
      return;
    }
    if (!started) {
      started = true;
      sportBeep(1);
    }
    const held = Math.floor((now - startAt) / 1000);
    ui.count.textContent = target ? `${formatClock(held)} / ${formatClock(target)}` : formatClock(held);
    ui.bar.style.width = target ? `${Math.min(1, held / target) * 100}%` : '100%';
    if (!reached && target && held >= target) {
      reached = true;
      ui.box.classList.add('sport-timer--done');
      sportAlert();
    }
    ui.text.textContent = reached ? t('sport.holdReached') : label;
  };
  sportTimer = { end: startAt, interval: setInterval(tick, 200) };
  tick();
}

// Après une série notée aujourd'hui : repos de l'exercice, sauf si la séance est finie.
function autoRestAfterSet(session, exercise, dateKey) {
  if (appData.sport.autoRest === false || dateKey !== sportDateKey(new Date())) return;
  const rest = Number(exercise.rest) || 0;
  if (rest <= 0 || sportSessionDone(session, dateKey)) return;
  startRestTimer(rest, exercise.name || t('sport.exercise'));
}

/* ── Rendu : helpers ───────────────────────────────────────── */

function sportEl(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function sportButton(className, text, onClick, title) {
  const button = sportEl('button', className, text);
  button.type = 'button';
  if (title) {
    button.title = title;
    button.setAttribute('aria-label', title);
  }
  button.addEventListener('click', onClick);
  return button;
}

function sportInput(type, value, onInput, attributes = {}) {
  const input = document.createElement(type === 'textarea' ? 'textarea' : 'input');
  if (type !== 'textarea') input.type = type;
  input.value = value === undefined || value === null ? '' : value;
  Object.entries(attributes).forEach(([key, val]) => input.setAttribute(key, val));
  input.addEventListener('input', () => onInput(input.value, input));
  return input;
}

function renderSportList() {
  const list = document.getElementById('sport-session-list');
  if (!list) return;
  list.innerHTML = '';
  if (appData.sport.sessions.length === 0) {
    list.appendChild(sportEl('li', 'sport-empty', t('sport.emptyList')));
    return;
  }
  appData.sport.sessions.forEach((session) => {
    const item = sportEl('li');
    const button = sportEl('button', 'sport-session-item');
    button.type = 'button';
    if (session.id === appData.sport.activeSessionId) button.classList.add('active');
    button.appendChild(sportEl('strong', '', session.name || t('sport.newSessionName')));
    const doneDay = sportSessionDoneDay(session.id, sportSelectedDate || new Date());
    button.classList.toggle('is-week-done', Boolean(doneDay));
    button.appendChild(sportEl('small', '', doneDay ? t('sport.weekDoneOn', { day: sportDayLabel(doneDay) }) : t('sport.weekToDo')));
    button.addEventListener('click', () => {
      appData.sport.activeSessionId = session.id;
      sportPickerEvent = null;
      sportView = 'workout';
      saveData();
      renderSport();
    });
    item.appendChild(button);
    list.appendChild(item);
  });
}

function renderSportPicker(main) {
  const box = sportEl('div', 'sport-card');
  box.appendChild(sportEl('p', '', t('sport.pickSession')));
  const choices = sportEl('div', 'sport-picker');
  appData.sport.sessions.forEach((session) => {
    choices.appendChild(
      sportButton('', session.name || t('sport.newSessionName'), () => {
        sportPickerEvent.sportSessionId = session.id;
        appData.sport.activeSessionId = session.id;
        sportPickerEvent = null;
        saveData();
        renderSport();
      })
    );
  });
  box.appendChild(choices);
  main.appendChild(box);
}

function renderSportHeader(main, date) {
  const header = sportEl('div', 'sport-date-nav');
  const shift = (days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    sportSelectedDate = d;
    sportPickerEvent = null;
    sportOpenHelp = null;
    selectSessionForDate(d);
    renderSport();
  };
  const label = date.toLocaleDateString(getCurrentLocale(), { weekday: 'long', day: 'numeric', month: 'long' });
  header.append(
    sportButton('sport-icon-btn', '‹', () => shift(-1), t('sport.prevDay')),
    sportEl('span', 'sport-date-nav__label', `${label.charAt(0).toUpperCase()}${label.slice(1)}`),
    sportButton('sport-icon-btn', '›', () => shift(1), t('sport.nextDay'))
  );
  if (sportDateKey(date) !== sportDateKey(new Date())) {
    header.appendChild(
      sportButton('sport-link-btn', t('sport.today'), () => {
        sportSelectedDate = null;
        sportPickerEvent = null;
        selectSessionForDate(new Date());
        renderSport();
      })
    );
  }
  main.appendChild(header);
}

function renderSportMain() {
  const main = document.getElementById('sport-main');
  if (!main) return;
  main.innerHTML = '';

  if (sportView === 'history' && typeof renderSportHistory === 'function') {
    renderSportHistory(main);
    return;
  }

  const date = sportSelectedDate || new Date(new Date().setHours(0, 0, 0, 0));
  renderSportHeader(main, date);

  if (sportPickerEvent) {
    renderSportPicker(main);
    return;
  }
  if (sportView === 'presets') {
    renderSportPresets(main);
    return;
  }

  const session = getSportSession(appData.sport.activeSessionId);
  if (!session) {
    main.appendChild(sportEl('p', 'sport-placeholder', t('sport.noSession')));
    return;
  }

  if (sportView === 'edit') {
    renderSportEdit(main, session);
  } else {
    renderSportWorkout(main, session, date);
  }
}

/* ── Mode séance ───────────────────────────────────────────── */

// Vidéo : miniature cliquable, la vidéo YouTube (sans cookies) ne se charge qu'au clic.
function renderExerciseVideo(panel, videoId, name) {
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${name} exercice technique`)}`;
  if (videoId) {
    const frame = sportEl('div', 'sport-video');
    const play = sportEl('button', 'sport-video__play');
    play.type = 'button';
    play.setAttribute('aria-label', t('sport.playVideo'));
    const img = document.createElement('img');
    img.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    img.alt = name;
    img.loading = 'lazy';
    play.append(img, sportEl('span', 'sport-video__icon', '▶'));
    play.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
      iframe.title = name;
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      iframe.allowFullscreen = true;
      frame.replaceChildren(iframe);
    });
    frame.appendChild(play);
    panel.appendChild(frame);
  }
  const more = sportEl('a', 'sport-video__more', videoId ? t('sport.moreVideos') : t('sport.findVideos'));
  more.href = searchUrl;
  more.target = '_blank';
  more.rel = 'noopener noreferrer';
  panel.appendChild(more);
}

function renderTipsList(panel, titleKey, lines) {
  const details = sportEl('details', 'sport-help__tips');
  details.appendChild(sportEl('summary', '', t(titleKey)));
  const list = sportEl('ul');
  lines.forEach((line) => list.appendChild(sportEl('li', '', line)));
  details.appendChild(list);
  panel.appendChild(details);
}

function renderExerciseHelp(container, session, exercise) {
  const { ladder, step } = getLadderStep(exercise);
  const panel = sportEl('div', 'sport-help');
  if (!ladder) {
    renderExerciseVideo(panel, null, exercise.name || t('sport.exercise'));
    if (exercise.tip) panel.appendChild(sportEl('p', 'sport-help__muted', exercise.tip));
    renderTipsList(panel, 'sport.tipsProgression', SPORT_TIPS.progression);
    container.appendChild(panel);
    return;
  }

  renderExerciseVideo(panel, getVideoId(exercise.ladder, exercise.step), exercise.name);
  panel.appendChild(sportEl('p', 'sport-help__muted', t('sport.muscles', { muscles: ladder.muscles })));
  if (step) {
    panel.appendChild(sportEl('h4', '', t('sport.howToTitle')));
    const how = sportEl('ol');
    step.how.forEach((line) => how.appendChild(sportEl('li', '', line)));
    panel.appendChild(how);
    if (step.mistakes && step.mistakes.length) {
      panel.appendChild(sportEl('h4', '', t('sport.mistakes')));
      const mistakes = sportEl('ul', 'sport-help__mistakes');
      step.mistakes.forEach((line) => mistakes.appendChild(sportEl('li', '', line)));
      panel.appendChild(mistakes);
    }
  }

  panel.appendChild(sportEl('h4', '', t('sport.ladder')));
  const steps = sportEl('ol', 'sport-ladder');
  ladder.steps.forEach((ladderStep, index) => {
    const excluded = isExcludedName(ladderStep.name);
    const item = sportEl('li', index === exercise.step ? 'current' : excluded ? 'excluded' : '');
    item.appendChild(sportEl('span', 'sport-ladder__name', `${ladderStep.name} · ${ladderStep.reps}`));
    if (index === exercise.step) {
      item.appendChild(sportEl('span', 'sport-ladder__badge', t('sport.current')));
    } else if (excluded) {
      item.appendChild(
        sportButton('sport-link-btn', t('sport.allowAgain'), () => {
          appData.sport.excluded = appData.sport.excluded.filter((name) => name !== ladderStep.name);
          saveData();
          renderSportMain();
        })
      );
    } else {
      item.appendChild(
        sportButton('sport-link-btn', t('sport.useVariant'), () => {
          applyLadderStep(exercise, exercise.ladder, index);
          saveData();
          renderSportMain();
        })
      );
    }
    steps.appendChild(item);
  });
  panel.appendChild(steps);
  if (ladder.note) panel.appendChild(sportEl('p', 'sport-help__muted', ladder.note));

  renderTipsList(panel, 'sport.tipsProgression', SPORT_TIPS.progression);
  renderTipsList(panel, 'sport.tipsSafety', SPORT_TIPS.safety);
  if (/abdo/i.test(ladder.muscles)) renderTipsList(panel, 'sport.tipsAbs', SPORT_TIPS.abs);

  const exclude = sportButton('sport-exclude-btn', t('sport.exclude'), () => {
    if (!window.confirm(t('sport.excludeConfirm', { name: exercise.name }))) return;
    appData.sport.excluded = Array.from(new Set([...appData.sport.excluded, exercise.name]));
    // Remplace l'exercice partout où il est utilisé.
    appData.sport.sessions.forEach((s) => s.exercises.forEach(normalizeLadderExercise));
    saveData();
    renderSportMain();
  });
  panel.appendChild(exclude);
  container.appendChild(panel);
}

function updateSportProgress(session, dateKey) {
  const log = getSportLog(dateKey, session.id);
  const total = session.exercises.length;
  const done = session.exercises.filter((exercise) => log[exercise.id] && log[exercise.id].done).length;
  const bar = document.getElementById('sport-progress-bar');
  const label = document.getElementById('sport-progress-label');
  if (bar) bar.style.width = total ? `${(done / total) * 100}%` : '0%';
  if (label) label.textContent = done === total && total > 0 ? t('sport.allDone') : t('sport.progress', { done, total });
  const slot = document.getElementById('sport-summary-slot');
  if (!slot) return;
  const finished = total > 0 && done === total;
  const wasShown = slot.dataset.shown === '1';
  slot.innerHTML = '';
  slot.dataset.shown = finished ? '1' : '';
  if (!finished) return;
  renderSportSummary(slot, session, dateKey);
  // On vient de finir (pas à l'ouverture d'une séance déjà finie) : on montre le bilan.
  if (!wasShown && slot.dataset.ready === '1') slot.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── Bilan de fin de séance ────────────────────────────────── */

function sumSets(sets) {
  return (sets || []).map(Number).filter((value) => value > 0).reduce((sum, value) => sum + value, 0);
}

// Séries, répétitions / secondes, écart avec la dernière fois (même
// variante), records battus et variantes débloquées.
function computeSportSummary(session, dateKey) {
  const log = getSportLog(dateKey, session.id);
  const summary = { rows: [], sets: 0, reps: 0, seconds: 0, deltaReps: null, deltaSeconds: null, records: [], unlocked: [] };
  session.exercises.forEach((exercise) => {
    const entry = log[exercise.id];
    if (!entry) return;
    const values = (Array.isArray(entry.sets) ? entry.sets : []).map(Number).filter((value) => value > 0);
    if (!values.length && !entry.done) return;
    const timed = isTimedExercise(exercise);
    const total = sumSets(values);
    summary.sets += values.length;
    if (timed) summary.seconds += total;
    else summary.reps += total;
    const sameVariant = !entry.variant || entry.variant === exercise.name;
    const last = sameVariant && values.length ? getLastPerformance(session.id, exercise, dateKey) : null;
    let delta = null;
    if (last) {
      delta = total - sumSets(last.sets);
      const field = timed ? 'deltaSeconds' : 'deltaReps';
      summary[field] = (summary[field] || 0) + delta;
    }
    const before = sameVariant ? getBestSet(session.id, exercise, dateKey) : 0;
    const todayBest = values.length ? Math.max(...values) : 0;
    if (before > 0 && todayBest > before) summary.records.push({ exercise, value: todayBest, before, timed });
    const advice = sameVariant && values.length ? getProgressionAdvice(exercise, values) : null;
    if (advice && advice.kind === 'up') summary.unlocked.push({ exercise, step: advice.step });
    summary.rows.push({ exercise, values, timed, delta });
  });
  return summary;
}

function formatSportAmount(value, timed) {
  return timed ? formatRest(value) || '0 s' : String(value);
}

function formatSportDelta(delta, timed) {
  if (delta === null) return '';
  if (delta === 0) return '=';
  const sign = delta > 0 ? '+' : '−';
  return `${sign}${timed ? formatRest(Math.abs(delta)) : Math.abs(delta)}`;
}

function sportDeltaClass(delta) {
  if (delta === null || delta === 0) return 'sport-delta';
  return `sport-delta ${delta > 0 ? 'sport-delta--up' : 'sport-delta--down'}`;
}

function renderSportSummary(container, session, dateKey) {
  const summary = computeSportSummary(session, dateKey);
  const card = sportEl('div', 'sport-card sport-summary');
  card.appendChild(sportEl('h3', 'sport-summary__title', t('sport.summaryTitle')));

  const stats = sportEl('div', 'sport-summary__stats');
  const tile = (value, label, delta, timed) => {
    const box = sportEl('div', 'sport-summary__stat');
    box.appendChild(sportEl('strong', '', value));
    box.appendChild(sportEl('span', '', label));
    if (delta !== null && delta !== undefined) {
      box.appendChild(sportEl('small', sportDeltaClass(delta), `${formatSportDelta(delta, timed)} ${t('sport.summaryVsLast')}`));
    }
    stats.appendChild(box);
  };
  tile(String(summary.sets), t('sport.summarySets'));
  if (summary.reps > 0) tile(String(summary.reps), t('sport.summaryReps'), summary.deltaReps, false);
  if (summary.seconds > 0) tile(formatRest(summary.seconds), t('sport.summaryHeld'), summary.deltaSeconds, true);
  card.appendChild(stats);

  if (summary.records.length) {
    card.appendChild(sportEl('h4', '', t('sport.summaryRecords')));
    const list = sportEl('ul', 'sport-summary__list');
    summary.records.forEach((record) => {
      list.appendChild(sportEl('li', '', t('sport.summaryRecord', {
        name: record.exercise.name,
        value: formatSportAmount(record.value, record.timed),
        before: formatSportAmount(record.before, record.timed)
      })));
    });
    card.appendChild(list);
  }

  if (summary.unlocked.length) {
    card.appendChild(sportEl('h4', '', t('sport.summaryUnlocked')));
    const list = sportEl('ul', 'sport-summary__list');
    summary.unlocked.forEach(({ exercise, step }) => {
      const ladder = SPORT_LADDERS[exercise.ladder];
      const item = sportEl('li', 'sport-summary__unlock');
      item.appendChild(sportEl('span', '', `⬆️ ${exercise.name} → ${ladder.steps[step].name}`));
      item.appendChild(
        sportButton('sport-advice__btn', t('sport.switchVariant'), () => {
          applyLadderStep(exercise, exercise.ladder, step);
          saveData();
          renderSportMain();
          if (typeof sportGuided !== 'undefined' && sportGuided) renderSportGuided();
        })
      );
      list.appendChild(item);
    });
    card.appendChild(list);
  }

  if (summary.deltaReps === null && summary.deltaSeconds === null) {
    card.appendChild(sportEl('p', 'sport-help__muted', t('sport.summaryFirst')));
  }

  const details = sportEl('details', 'sport-summary__details');
  details.appendChild(sportEl('summary', '', t('sport.summaryDetail')));
  const table = sportEl('div', 'sport-summary__rows');
  summary.rows.forEach((row) => {
    const line = sportEl('div', 'sport-summary__row');
    line.appendChild(sportEl('span', 'sport-summary__name', row.exercise.name || t('sport.exercise')));
    line.appendChild(sportEl('span', 'sport-summary__values', row.values.length ? row.values.map((value) => formatSportAmount(value, row.timed)).join(' · ') : '✓'));
    line.appendChild(sportEl('span', sportDeltaClass(row.delta), formatSportDelta(row.delta, row.timed)));
    table.appendChild(line);
  });
  details.appendChild(table);
  card.appendChild(details);
  container.appendChild(card);
}

function renderSportWorkout(main, session, date) {
  const dateKey = sportDateKey(date);
  const log = getSportLog(dateKey, session.id);

  const card = sportEl('div', 'sport-card sport-hero');
  const titleRow = sportEl('div', 'sport-hero__top');
  const titleBlock = sportEl('div');
  titleBlock.appendChild(sportEl('h2', 'sport-hero__title', session.name || t('sport.newSessionName')));
  const plannedToday = getSportOccurrencesOn(date).find((occ) => occ.sourceEvent.sportSessionId);
  const doneDay = sportSessionDoneDay(session.id, date);
  let subtitle;
  if (doneDay === dateKey) {
    subtitle = t('sport.weekDoneToday');
  } else if (doneDay) {
    subtitle = t('sport.weekAlreadyDone', { day: sportDayLabel(doneDay, 'long') });
  } else {
    const sessions = appData.sport.sessions;
    subtitle = t('sport.weekStatus', { done: sessions.filter((item) => sportSessionDoneDay(item.id, date)).length, total: sessions.length });
  }
  if (plannedToday) {
    subtitle += ` · ${t('sport.plannedAt', { time: formatTime(new Date(plannedToday.start)), duration: plannedToday.duration })}`;
    const lead = typeof reminderEnabled === 'function' && reminderEnabled() ? reminderLeadFor(plannedToday.sourceEvent) : null;
    if (lead !== null) subtitle += ` · 🔔 ${reminderFormatLead(lead)}`;
  }
  titleBlock.appendChild(sportEl('p', 'sport-hero__subtitle', subtitle));
  const heroActions = sportEl('div', 'sport-hero__actions');
  if (session.exercises.length && typeof openSportGuided === 'function') {
    heroActions.appendChild(sportButton('sport-guided-btn', t('sport.guidedStart'), () => openSportGuided(session, date), t('sport.guidedTitle')));
  }
  heroActions.appendChild(
    sportButton('sport-edit-btn', t('sport.edit'), () => {
      sportView = 'edit';
      renderSportMain();
    })
  );
  titleRow.append(titleBlock, heroActions);
  card.appendChild(titleRow);

  const progress = sportEl('div', 'sport-progress');
  const bar = sportEl('div', 'sport-progress__bar');
  bar.id = 'sport-progress-bar';
  progress.appendChild(bar);
  const progressLabel = sportEl('p', 'sport-progress__label');
  progressLabel.id = 'sport-progress-label';
  card.append(progress, progressLabel);
  card.appendChild(sportEl('p', 'sport-hero__intensity', t('sport.intensity')));
  const autoRest = sportEl('label', 'sport-hero__toggle');
  const autoRestBox = document.createElement('input');
  autoRestBox.type = 'checkbox';
  autoRestBox.checked = appData.sport.autoRest !== false;
  autoRestBox.addEventListener('change', () => {
    appData.sport.autoRest = autoRestBox.checked;
    saveData();
  });
  autoRest.append(autoRestBox, sportEl('span', '', t('sport.autoRest')));
  card.appendChild(autoRest);

  if (session.exercises.length) renderSportWarmup(card, session);
  if (session.description) {
    const details = sportEl('details', 'sport-instructions');
    details.appendChild(sportEl('summary', '', t('sport.instructions')));
    details.appendChild(sportEl('p', '', session.description));
    card.appendChild(details);
  }
  main.appendChild(card);

  if (session.exercises.length === 0) {
    main.appendChild(sportEl('p', 'sport-placeholder', t('sport.noExercises')));
    return;
  }

  const summarySlot = sportEl('div', 'sport-summary-slot');
  summarySlot.id = 'sport-summary-slot';
  main.appendChild(summarySlot);

  const list = sportEl('ol', 'sport-workout');
  session.exercises.forEach((exercise, index) => {
    const entry = log[exercise.id] || {};
    const item = sportEl('li', 'sport-workout__item');
    if (entry.done) item.classList.add('done');
    const setCount = Math.max(1, Number(exercise.sets) || 1);

    const check = sportEl('button', 'sport-check', entry.done ? '✓' : String(index + 1));
    check.type = 'button';
    check.setAttribute('aria-pressed', entry.done ? 'true' : 'false');
    check.setAttribute('aria-label', exercise.name || t('sport.exercise'));
    const setDone = (done) => {
      setSportLog(dateKey, session.id, exercise.id, { done });
      item.classList.toggle('done', done);
      check.textContent = done ? '✓' : String(index + 1);
      check.setAttribute('aria-pressed', done ? 'true' : 'false');
      updateSportProgress(session, dateKey);
    };
    check.addEventListener('click', () => setDone(!item.classList.contains('done')));

    const body = sportEl('div', 'sport-workout__body');
    const head = sportEl('div', 'sport-workout__head');
    head.appendChild(sportEl('div', 'sport-workout__name', exercise.name || t('sport.exercise')));
    head.appendChild(
      sportButton(`sport-help-btn${sportOpenHelp === exercise.id ? ' active' : ''}`, '?', () => {
        sportOpenHelp = sportOpenHelp === exercise.id ? null : exercise.id;
        renderSportMain();
      }, t('sport.howTo'))
    );
    body.appendChild(head);

    const parts = [t('sport.setsReps', { sets: setCount, reps: exercise.reps || '—' })];
    const restText = formatRest(exercise.rest);
    if (restText) parts.push(t('sport.restShort', { rest: restText }));
    body.appendChild(sportEl('div', 'sport-workout__meta', parts.join(' · ')));
    if (exercise.tip) body.appendChild(sportEl('div', 'sport-workout__tip', exercise.tip));

    if (sportOpenHelp === exercise.id) renderExerciseHelp(body, session, exercise);

    // Objectif : autant ou mieux que la dernière fois, série par série.
    const last = getLastPerformance(session.id, exercise, dateKey);
    const lastSets = last ? last.sets.map(Number).filter((value) => value > 0) : [];
    const targetCount = Math.max(setCount, lastSets.length);
    if (lastSets.length) {
      body.appendChild(
        sportEl('div', 'sport-workout__target', t('sport.target', {
          date: formatShortDate(last.dateKey),
          values: lastSets.join(' · '),
          count: lastSets.length
        }))
      );
    }

    // Saisie série par série
    const setsRow = sportEl('div', 'sport-sets');
    const values = Array.isArray(entry.sets) ? entry.sets.slice() : [];
    // Les séries du jour ne comptent pour la suggestion que si elles ont été
    // faites sur la variante actuelle (sinon on vient de changer de variante).
    let sameVariant = !entry.variant || entry.variant === exercise.name;
    const adviceBox = sportEl('div', 'sport-advice-slot');
    const renderAdvice = () => {
      adviceBox.innerHTML = '';
      const hasToday = values.some((value) => Number(value) > 0);
      const source = hasToday ? (sameVariant ? values : null) : last ? last.sets : null;
      const advice = source ? getProgressionAdvice(exercise, source) : null;
      if (!advice || advice.kind === 'keep') return;
      const banner = sportEl('div', `sport-advice sport-advice--${advice.kind}`);
      banner.appendChild(sportEl('span', '', advice.text));
      if (typeof advice.step === 'number') {
        banner.appendChild(
          sportButton('sport-advice__btn', t('sport.switchVariant'), () => {
            applyLadderStep(exercise, exercise.ladder, advice.step);
            saveData();
            renderSportMain();
          })
        );
      }
      adviceBox.appendChild(banner);
    };
    const colorInput = (input, index) => {
      const target = lastSets[index];
      const value = Number(input.value);
      input.classList.toggle('reached', Boolean(target) && value >= target);
      input.classList.toggle('below', Boolean(target) && value > 0 && value < target);
    };
    const inputs = [];
    const addSetInput = (i) => {
      const input = sportInput('number', values[i], (value) => {
        values[i] = value === '' ? '' : Number(value);
        sameVariant = true;
        colorInput(input, i);
        const filled = values.filter((v) => Number(v) > 0).length;
        const patch = { sets: values.slice(), variant: exercise.name };
        if (filled >= setCount && !item.classList.contains('done')) patch.done = true;
        setSportLog(dateKey, session.id, exercise.id, patch);
        if (patch.done) {
          item.classList.add('done');
          check.textContent = '✓';
        }
        updateSportProgress(session, dateKey);
        renderAdvice();
      }, {
        class: 'sport-set',
        min: '0',
        inputmode: 'numeric',
        'aria-label': t('sport.setLabel', { n: i + 1 }),
        placeholder: lastSets[i] ? String(lastSets[i]) : `S${i + 1}`
      });
      // « change » : à la sortie de la case (ou Entrée), pas à chaque chiffre tapé.
      input.addEventListener('change', () => {
        if (Number(input.value) > 0) autoRestAfterSet(session, exercise, dateKey);
      });
      colorInput(input, i);
      inputs.push(input);
      setsRow.insertBefore(input, addSetButton);
    };
    // Bouton « + série » : une série de plus que prévu, retenue comme objectif la prochaine fois.
    const addSetButton = sportButton('sport-add-set', '+', () => {
      addSetInput(inputs.length);
      inputs[inputs.length - 1].focus();
    }, t('sport.addSet'));
    setsRow.appendChild(addSetButton);
    const initialCount = Math.max(targetCount, values.length);
    for (let i = 0; i < initialCount; i += 1) addSetInput(i);
    if (Number(exercise.rest) > 0) {
      setsRow.appendChild(
        sportButton('sport-rest-btn', t('sport.restTimer', { rest: formatRest(exercise.rest) }), () => {
          startRestTimer(Number(exercise.rest), exercise.name || t('sport.exercise'));
        })
      );
    }
    if (isTimedExercise(exercise)) {
      setsRow.appendChild(
        sportButton('sport-hold-btn', t('sport.holdStart'), () => {
          let index = inputs.findIndex((input) => !(Number(input.value) > 0));
          if (index === -1) {
            addSetInput(inputs.length);
            index = inputs.length - 1;
          }
          const range = parseRepRange(exercise.reps);
          const target = Math.max(Number(lastSets[index]) || 0, range ? range.min : 0);
          startHoldTimer(`${exercise.name || t('sport.exercise')} · ${t('sport.setLabel', { n: index + 1 })}`, target, (seconds) => {
            const input = inputs[index];
            input.value = seconds;
            input.dispatchEvent(new Event('input'));
            input.dispatchEvent(new Event('change'));
          });
        }, t('sport.holdStartTitle'))
      );
    }
    body.appendChild(setsRow);
    body.appendChild(adviceBox);
    renderAdvice();

    body.appendChild(
      sportInput('text', entry.note, (value) => {
        setSportLog(dateKey, session.id, exercise.id, { note: value });
      }, { class: 'sport-workout__note', placeholder: t('sport.todayNotePlaceholder'), 'aria-label': t('sport.todayNote') })
    );

    item.append(check, body);
    list.appendChild(item);
  });
  main.appendChild(list);
  updateSportProgress(session, dateKey);
  summarySlot.dataset.ready = '1';
}

/* ── Mode modification ─────────────────────────────────────── */

function buildVariantSelect(exercise, onChange) {
  const select = document.createElement('select');
  const custom = sportEl('option', '', t('sport.customExercise'));
  custom.value = '';
  select.appendChild(custom);
  Object.entries(SPORT_LADDERS).forEach(([ladderId, ladder]) => {
    const group = document.createElement('optgroup');
    group.label = ladder.name;
    ladder.steps.forEach((step, index) => {
      const option = sportEl('option', '', isExcludedName(step.name) ? `🚫 ${step.name}` : step.name);
      option.value = `${ladderId}:${index}`;
      group.appendChild(option);
    });
    select.appendChild(group);
  });
  select.value = exercise.ladder && SPORT_LADDERS[exercise.ladder] ? `${exercise.ladder}:${exercise.step}` : '';
  select.addEventListener('change', () => onChange(select.value));
  return select;
}

function renderSportEdit(main, session) {
  const card = sportEl('div', 'sport-card');
  const top = sportEl('div', 'sport-hero__top');
  top.appendChild(sportEl('h2', 'sport-hero__title', t('sport.editTitle')));
  top.appendChild(
    sportButton('', t('sport.doneEditing'), () => {
      sportView = 'workout';
      renderSportMain();
    })
  );
  card.appendChild(top);

  const nameLabel = sportEl('label', 'sport-field');
  nameLabel.appendChild(sportEl('span', '', t('sport.nameLabel')));
  nameLabel.appendChild(
    sportInput('text', session.name, (value) => {
      session.name = value;
      appData.calendar.events
        .filter((event) => event.sportSessionId === session.id)
        .forEach((event) => {
          event.title = value;
        });
      saveData();
      renderSportList();
    }, { class: 'sport-name-input' })
  );
  const descLabel = sportEl('label', 'sport-field');
  descLabel.appendChild(sportEl('span', '', t('sport.descriptionLabel')));
  descLabel.appendChild(
    sportInput('textarea', session.description, (value) => {
      session.description = value;
      saveData();
    }, { rows: '4' })
  );
  card.append(nameLabel, descLabel);
  main.appendChild(card);

  const exercisesCard = sportEl('div', 'sport-card');
  exercisesCard.appendChild(sportEl('h3', '', t('sport.exercisesTitle')));
  const list = sportEl('div', 'sport-edit-list');
  session.exercises.forEach((exercise, index) => {
    const row = sportEl('div', 'sport-edit-row');
    const head = sportEl('div', 'sport-edit-row__head');
    head.appendChild(sportEl('span', 'sport-edit-row__index', String(index + 1)));
    const nameInput = sportInput('text', exercise.name, (value) => {
      exercise.name = value;
      saveData();
    }, { class: 'sport-edit-row__name', 'aria-label': t('sport.exercise'), placeholder: t('sport.exercise') });
    head.appendChild(nameInput);
    const moveUp = sportButton('sport-icon-btn sport-icon-btn--ghost', '↑', () => {
      session.exercises.splice(index - 1, 0, session.exercises.splice(index, 1)[0]);
      saveData();
      renderSportMain();
    }, t('sport.moveUp'));
    moveUp.disabled = index === 0;
    head.append(
      moveUp,
      sportButton('sport-icon-btn sport-icon-btn--ghost', '✕', () => {
        session.exercises.splice(index, 1);
        saveData();
        renderSportMain();
      }, t('sport.deleteExercise'))
    );

    const variantLabel = sportEl('label', 'sport-edit-row__variant');
    variantLabel.appendChild(sportEl('span', '', t('sport.variant')));
    variantLabel.appendChild(
      buildVariantSelect(exercise, (value) => {
        if (!value) {
          delete exercise.ladder;
          delete exercise.step;
        } else {
          const [ladderId, stepIndex] = value.split(':');
          applyLadderStep(exercise, ladderId, Number(stepIndex));
        }
        saveData();
        renderSportMain();
      })
    );

    const meta = sportEl('div', 'sport-edit-row__meta');
    const field = (labelKey, key, type, attrs = {}) => {
      const label = sportEl('label');
      label.appendChild(sportEl('span', '', t(labelKey)));
      label.appendChild(
        sportInput(type, exercise[key], (value) => {
          exercise[key] = type === 'number' ? Number(value) || 0 : value;
          saveData();
        }, attrs)
      );
      return label;
    };
    meta.append(
      field('sport.sets', 'sets', 'number', { min: '1', step: '1' }),
      field('sport.reps', 'reps', 'text'),
      field('sport.rest', 'rest', 'number', { min: '0', step: '15' })
    );
    const tipLabel = sportEl('label', 'sport-edit-row__tip');
    tipLabel.appendChild(sportEl('span', '', t('sport.tip')));
    tipLabel.appendChild(
      sportInput('text', exercise.tip, (value) => {
        exercise.tip = value;
        saveData();
      })
    );
    row.append(head, variantLabel, meta, tipLabel);
    list.appendChild(row);
  });
  exercisesCard.appendChild(list);
  exercisesCard.appendChild(
    sportButton('sport-add-btn', `+ ${t('sport.addExercise')}`, () => {
      session.exercises.push({ id: uid(), name: '', sets: 3, reps: '8–12', rest: 60, tip: '' });
      saveData();
      renderSportMain();
      const inputs = document.querySelectorAll('.sport-edit-row__name');
      if (inputs.length) inputs[inputs.length - 1].focus();
    })
  );
  main.appendChild(exercisesCard);

  const schedule = sportEl('div', 'sport-card');
  schedule.appendChild(sportEl('h3', '', t('sport.scheduleTitle')));
  const days = getSessionWeekdays(session.id);
  schedule.appendChild(
    sportEl('p', 'sport-hint', days.length ? t('sport.plannedOn', { days: days.map((d) => weekdayName(d)).join(', ') }) : t('sport.notScheduled'))
  );
  const form = sportEl('form', 'sport-schedule');
  const daySelect = document.createElement('select');
  [1, 2, 3, 4, 5, 6, 0].forEach((day) => {
    const option = sportEl('option', '', weekdayName(day));
    option.value = String(day);
    daySelect.appendChild(option);
  });
  daySelect.value = String((sportSelectedDate || new Date()).getDay());
  const timeInput = document.createElement('input');
  timeInput.type = 'time';
  timeInput.value = '18:00';
  timeInput.required = true;
  const durationInput = document.createElement('input');
  durationInput.type = 'number';
  durationInput.min = '15';
  durationInput.step = '5';
  durationInput.value = '60';
  const wrap = (labelKey, input) => {
    const label = sportEl('label');
    label.appendChild(sportEl('span', '', t(labelKey)));
    label.appendChild(input);
    return label;
  };
  const submit = sportEl('button', '', t('sport.scheduleAdd'));
  submit.type = 'submit';
  form.append(wrap('sport.scheduleDay', daySelect), wrap('sport.scheduleTime', timeInput), wrap('sport.scheduleDuration', durationInput), submit);
  form.addEventListener('submit', (submitEvent) => {
    submitEvent.preventDefault();
    addSportSessionToCalendar(session, Number(daySelect.value), timeInput.value, Number(durationInput.value) || 45);
    saveData();
    renderSport();
    showSportMessage(t('sport.scheduled'));
  });
  schedule.appendChild(form);
  main.appendChild(schedule);

  const danger = sportEl('div', 'sport-danger');
  danger.appendChild(
    sportButton('sport-delete-session', t('sport.deleteSession'), () => {
      if (!window.confirm(t('sport.deleteSessionConfirm'))) return;
      appData.sport.sessions = appData.sport.sessions.filter((s) => s.id !== session.id);
      appData.calendar.events = appData.calendar.events.filter((event) => event.sportSessionId !== session.id);
      sportView = 'workout';
      ensureSportData();
      saveData();
      renderSport();
      renderCalendar();
    })
  );
  main.appendChild(danger);
}

function showSportMessage(text) {
  const status = document.getElementById('sport-status');
  if (!status) return;
  status.textContent = text;
  clearTimeout(showSportMessage.timer);
  showSportMessage.timer = setTimeout(() => {
    status.textContent = '';
  }, 6000);
}

function renderSport() {
  if (!document.getElementById('sport')) return;
  ensureSportData();
  renderSportList();
  if (typeof renderSportWeekBadge === 'function') renderSportWeekBadge();
  renderSportMain();
}

/* ── Actions ───────────────────────────────────────────────── */

// Première date, à partir d'aujourd'hui, qui tombe sur ce jour de la semaine.
function nextDateForWeekday(weekday, fromDate = new Date()) {
  const date = new Date(fromDate);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + ((weekday - date.getDay() + 7) % 7));
  return date;
}

function addSportSessionToCalendar(session, weekday, time, duration) {
  const [hours, minutes] = (time || '18:00').split(':').map(Number);
  const start = nextDateForWeekday(weekday);
  start.setHours(hours || 0, minutes || 0, 0, 0);
  addSportSessionEvent(session, start, duration, 'weekly');
}

// recurrence : 'none' (une fois), 'daily', 'weekly', 'monthly'.
function addSportSessionEvent(session, start, duration, recurrence) {
  const type = getOrCreateSportType();
  appData.calendar.events.push({
    id: uid(),
    title: session.name,
    start: toLocalInputValue(start),
    duration: Math.max(MIN_EVENT_DURATION, Number(duration) || 45),
    recurrence,
    typeId: type.id,
    color: type.color,
    sportSessionId: session.id
  });
}

/* ── Semaine : chaque séance une fois, le jour qu'on veut ─── */

// Une séance compte comme faite ce jour-là dès qu'une série est notée ou un exercice coché.
function sportSessionActiveOn(dateKey, sessionId) {
  return Object.values(getSportLog(dateKey, sessionId)).some(
    (entry) => entry && (entry.done || (Array.isArray(entry.sets) && entry.sets.some((value) => Number(value) > 0)))
  );
}

// Les 7 jours (lundi → dimanche) de la semaine de `date`.
function sportWeekDayKeys(date) {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, offset) => {
    const day = new Date(start);
    day.setDate(start.getDate() + offset);
    return sportDateKey(day);
  });
}

// Jour où la séance a été faite dans la semaine de `date`, sinon null.
function sportSessionDoneDay(sessionId, date) {
  return sportWeekDayKeys(date).find((key) => sportSessionActiveOn(key, sessionId)) || null;
}

// Séance à ouvrir ce jour-là : celle déjà commencée ce jour, sinon celle
// demandée (créneau de l'agenda) si elle reste à faire, sinon la première de
// la liste pas encore faite cette semaine. null si tout est fait.
function sportSessionForDate(date, preferredId = null) {
  const key = sportDateKey(date);
  const sessions = appData.sport.sessions;
  const started = sessions.find((session) => sportSessionActiveOn(key, session.id));
  if (started) return started;
  const preferred = preferredId ? getSportSession(preferredId) : null;
  if (preferred && !sportSessionDoneDay(preferred.id, date)) return preferred;
  return sessions.find((session) => !sportSessionDoneDay(session.id, date)) || null;
}

function selectSessionForDate(date) {
  const session = sportSessionForDate(date);
  if (session) appData.sport.activeSessionId = session.id;
}

function sportDayLabel(dateKey, format = 'short') {
  return new Date(`${dateKey}T00:00`).toLocaleDateString(getCurrentLocale(), { weekday: format, day: 'numeric' });
}

/* ── Échauffement ──────────────────────────────────────────── */

// Étapes de SPORT_WARMUP utiles aux exercices de la séance (toutes, pour une
// séance sans exercice de la bibliothèque).
function sportWarmupSteps(session) {
  const ladders = new Set(session.exercises.map((exercise) => exercise.ladder).filter(Boolean));
  const has = (group) => group === 'all' || !ladders.size || SPORT_WARMUP_GROUPS[group].some((id) => ladders.has(id));
  return SPORT_WARMUP.filter((step) => has(step.group));
}

// Séries d'approche avant l'exercice `index`, s'il est le premier de sa
// famille dans la séance : variante plus facile puis variante du jour, ou
// sac à moitié chargé pour un exercice au sac à dos.
function sportApproach(session, index) {
  const exercise = session.exercises[index];
  if (!exercise || !exercise.ladder || isTimedExercise(exercise)) return null;
  const family = Object.values(SPORT_APPROACH_FAMILIES).find((ids) => ids.includes(exercise.ladder));
  if (!family || session.exercises.slice(0, index).some((other) => family.includes(other.ladder))) return null;
  const { ladder, step } = getLadderStep(exercise);
  if (!step) return null;
  if (step.load) return [{ name: exercise.name, reps: '10', detail: t('sport.approachLoad') }];
  const sets = [];
  for (let i = exercise.step - 1; i >= 0; i -= 1) {
    if (!isExcludedName(ladder.steps[i].name)) {
      sets.push({ name: ladder.steps[i].name, reps: '8', detail: t('sport.approachEasy') });
      break;
    }
  }
  sets.push({ name: exercise.name, reps: '4–5', detail: t('sport.approachToday') });
  return sets;
}

function sportWarmupAmount(step) {
  return step.seconds ? formatRest(step.seconds) : step.reps;
}

// ≈ 30 s par mouvement en répétitions, plus 10 s pour passer au suivant.
function sportWarmupMinutes(session) {
  const seconds = sportWarmupSteps(session).reduce((sum, step) => sum + (step.seconds || 30) + 10, 0);
  return Math.max(1, Math.round(seconds / 60));
}

function renderSportWarmup(card, session) {
  const details = sportEl('details', 'sport-instructions sport-warmup');
  details.appendChild(sportEl('summary', '', t('sport.warmupTitle', { min: sportWarmupMinutes(session) })));
  const list = sportEl('ol', 'sport-warmup__list');
  sportWarmupSteps(session).forEach((step) => {
    const item = sportEl('li');
    item.append(sportEl('strong', '', `${step.name} · ${sportWarmupAmount(step)}`), sportEl('span', '', step.detail));
    list.appendChild(item);
  });
  details.appendChild(list);
  const approaches = session.exercises
    .map((exercise, index) => [exercise, sportApproach(session, index)])
    .filter(([, sets]) => sets);
  if (approaches.length) {
    details.appendChild(sportEl('p', 'sport-warmup__approach-title', t('sport.warmupApproach')));
    const approachList = sportEl('ul', 'sport-warmup__approach');
    approaches.forEach(([exercise, sets]) => {
      const text = sets.map((set) => `${set.reps} × ${set.name}`).join(t('sport.approachThen'));
      approachList.appendChild(sportEl('li', '', t('sport.warmupApproachLine', { exercise: exercise.name, list: text })));
    });
    details.appendChild(approachList);
  }
  card.appendChild(details);
}

function buildProgramExercises(template) {
  return template.exercises.map(([ladderId, stepIndex, sets, rest]) => {
    const exercise = { id: uid(), sets, rest };
    applyLadderStep(exercise, ladderId, stepIndex);
    normalizeLadderExercise(exercise);
    return exercise;
  });
}

// Séance préfaite déjà présente dans la liste (par son numéro dans SPORT_PROGRAM).
function findPresetSession(index) {
  return appData.sport.sessions.find((session) => session.template === SPORT_TEMPLATE_KEY && session.templateIndex === index) || null;
}

// Écran « Séances préfaites » : on coche celles qu'on veut ajouter et, pour
// chacune, on choisit si et quand elle va dans l'agenda.
function renderSportPresets(main) {
  const card = sportEl('div', 'sport-card sport-presets');
  card.appendChild(sportEl('h3', '', t('sport.presetsTitle')));
  card.appendChild(sportEl('p', 'sport-presets__hint', t('sport.presetsHint')));

  const choices = [];
  const list = sportEl('div', 'sport-presets__list');
  SPORT_PROGRAM.forEach((template, index) => {
    const present = findPresetSession(index);
    const item = sportEl('div', `sport-preset${present ? ' is-present' : ''}`);
    const head = sportEl('label', 'sport-preset__head');
    const box = sportEl('input');
    box.type = 'checkbox';
    box.disabled = Boolean(present);
    const body = sportEl('div', 'sport-preset__body');
    const title = sportEl('div', 'sport-preset__title');
    title.appendChild(sportEl('strong', '', template.name));
    if (present) title.appendChild(sportEl('span', 'sport-preset__day', t('sport.presetPresent')));
    body.appendChild(title);
    const exercises = buildProgramExercises(template)
      .map((exercise) => `${exercise.name} (${exercise.sets}×)`)
      .join(' · ');
    body.appendChild(sportEl('small', '', exercises));
    head.append(box, body);
    item.appendChild(head);

    if (!present) {
      // Réglages d'agenda, visibles une fois la séance cochée.
      const form = sportEl('div', 'sport-schedule sport-preset__schedule');
      form.hidden = true;
      const repeat = document.createElement('select');
      [
        ['none', t('sport.presetNoCalendar')],
        ['once', t('sport.presetOnce')],
        ['daily', t('calendar.eventModal.recurrence.daily')],
        ['weekly', t('calendar.eventModal.recurrence.weekly')],
        ['monthly', t('calendar.eventModal.recurrence.monthly')]
      ].forEach(([value, text]) => {
        const option = sportEl('option', '', text);
        option.value = value;
        repeat.appendChild(option);
      });
      repeat.value = 'weekly';
      const dateInput = document.createElement('input');
      dateInput.type = 'date';
      dateInput.value = toISODateString(nextDateForWeekday(template.weekday));
      const timeInput = document.createElement('input');
      timeInput.type = 'time';
      timeInput.value = '18:00';
      const durationInput = document.createElement('input');
      durationInput.type = 'number';
      durationInput.min = '15';
      durationInput.step = '5';
      durationInput.value = '60';
      const wrap = (label, input) => {
        const element = sportEl('label');
        element.append(sportEl('span', '', label), input);
        return element;
      };
      const summary = sportEl('p', 'sport-preset__summary');
      const fields = [wrap(t('sport.scheduleDay'), dateInput), wrap(t('sport.scheduleTime'), timeInput), wrap(t('sport.scheduleDuration'), durationInput)];
      const refreshSummary = () => {
        const off = repeat.value === 'none';
        fields.forEach((field) => {
          field.hidden = off;
        });
        const date = dateInput.value ? new Date(`${dateInput.value}T12:00`) : null;
        let text = '';
        if (!off && date) {
          if (repeat.value === 'weekly') text = t('sport.presetEveryWeek', { day: weekdayName(date.getDay(), 'long'), time: timeInput.value });
          else if (repeat.value === 'monthly') text = t('sport.presetEveryMonth', { day: date.getDate(), time: timeInput.value });
          else if (repeat.value === 'daily') text = t('sport.presetEveryDay', { time: timeInput.value });
          else text = t('sport.presetOnceOn', { date: date.toLocaleDateString(getCurrentLocale(), { weekday: 'long', day: 'numeric', month: 'long' }), time: timeInput.value });
        }
        summary.textContent = text;
        summary.hidden = !text;
      };
      [repeat, dateInput, timeInput].forEach((input) => {
        input.addEventListener('input', refreshSummary);
        input.addEventListener('change', refreshSummary);
      });
      refreshSummary();
      form.append(wrap(t('sport.presetRepeat'), repeat), ...fields);
      item.append(form, summary);
      summary.hidden = true;
      box.addEventListener('change', () => {
        form.hidden = !box.checked;
        if (box.checked) refreshSummary();
        else summary.hidden = true;
      });
      choices.push({ box, index, repeat, dateInput, timeInput, durationInput });
    }
    list.appendChild(item);
  });
  card.appendChild(list);

  const actions = sportEl('div', 'sport-presets__actions');
  const add = sportButton('', '', () => {
    const picked = choices.filter((choice) => choice.box.checked);
    if (!picked.length) return;
    addSportPresets(
      picked.map((choice) => ({
        index: choice.index,
        recurrence: choice.repeat.value,
        date: choice.dateInput.value,
        time: choice.timeInput.value,
        duration: Number(choice.durationInput.value) || 45
      }))
    );
  });
  const refresh = () => {
    const count = choices.filter((choice) => choice.box.checked).length;
    add.textContent = t('sport.presetAdd', { count });
    add.disabled = !count;
  };
  list.addEventListener('change', refresh);
  refresh();
  actions.append(
    add,
    sportButton('btn-secondary', t('sport.presetCancel'), () => {
      sportView = 'workout';
      renderSport();
    })
  );
  card.appendChild(actions);
  if (!choices.length) card.appendChild(sportEl('p', 'sport-presets__hint', t('sport.presetAllPresent')));
  main.appendChild(card);
}

function addSportPresets(picked) {
  ensureSportData();
  let first = null;
  let scheduled = 0;
  picked.forEach((choice) => {
    const template = SPORT_PROGRAM[choice.index];
    if (!template || findPresetSession(choice.index)) return;
    const session = {
      id: uid(),
      template: SPORT_TEMPLATE_KEY,
      templateIndex: choice.index,
      templateVersion: SPORT_PROGRAM_VERSION,
      name: template.name,
      description: template.description,
      exercises: buildProgramExercises(template)
    };
    appData.sport.sessions.push(session);
    if (choice.recurrence !== 'none' && choice.date) {
      const start = new Date(`${choice.date}T${choice.time || '18:00'}`);
      if (!Number.isNaN(start.getTime())) {
        addSportSessionEvent(session, start, choice.duration, choice.recurrence === 'once' ? 'none' : choice.recurrence);
        scheduled += 1;
      }
    }
    if (!first) first = session;
  });
  if (!first) return;
  appData.sport.sessions.sort((a, b) => {
    const ia = a.template === SPORT_TEMPLATE_KEY ? a.templateIndex : 99;
    const ib = b.template === SPORT_TEMPLATE_KEY ? b.templateIndex : 99;
    return ia - ib;
  });
  appData.sport.activeSessionId = first.id;
  sportView = 'workout';
  saveData();
  renderSport();
  if (scheduled) {
    renderEventTypes();
    renderCalendar();
  }
  showSportMessage(t(scheduled ? 'sport.presetAddedScheduled' : 'sport.presetAdded', { count: picked.length, scheduled }));
}

function initSport() {
  ensureSportData();
  document.getElementById('sport-add-session').addEventListener('click', () => {
    const session = { id: uid(), name: t('sport.newSessionName'), description: '', exercises: [] };
    appData.sport.sessions.push(session);
    appData.sport.activeSessionId = session.id;
    sportPickerEvent = null;
    sportView = 'edit';
    saveData();
    renderSport();
    const input = document.querySelector('.sport-name-input');
    if (input) {
      input.focus();
      input.select();
    }
  });
  document.getElementById('sport-load-program').addEventListener('click', () => {
    sportPickerEvent = null;
    sportView = 'presets';
    renderSport();
  });
  const historyButton = document.getElementById('sport-history');
  if (historyButton && typeof openSportHistory === 'function') historyButton.addEventListener('click', openSportHistory);
  selectSessionForDate(new Date());
  renderSport();

  const languageSelect = document.getElementById('language-select');
  if (languageSelect) languageSelect.addEventListener('change', renderSport);
}
