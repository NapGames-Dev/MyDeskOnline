/* ═══════════════════════════════════════════════════════════
   RÉVISIONS : cartes mémoire à répétition espacée (façon Anki)
   - Planification FSRS via la bibliothèque officielle ts-fsrs
     (vendor/ts-fsrs.umd.js) : même algorithme qu'Anki réglé sur FSRS.
   - L'état d'une carte se déduit de son historique de révisions
     (appData.anki.revlog). Après une synchro, une carte révisée sur
     deux appareils est recalculée à partir de l'union des historiques.
   - Import des exports texte d'Anki (« Notes en texte brut »).
   - Ctrl+Z propre à l'onglet (la révision, la suppression…), les
     données de révision ne passent pas par l'annulation générale.
   ═══════════════════════════════════════════════════════════ */

const ANKI_TAB_TRANSLATIONS = { fr: 'Révisions', en: 'Flashcards', vi: 'Ôn tập' };

const ANKI_TRANSLATIONS = {
  fr: {
    navDecks: 'Paquets',
    navAdd: '＋ Ajouter',
    navBrowse: 'Parcourir',
    navStats: 'Statistiques',
    navSettings: 'Réglages',
    navImport: 'Importer',
    navExport: 'Partager',
    exportTitle: 'Partager des fiches',
    exportHelp: 'Crée un fichier à envoyer à tes amis (WhatsApp, mail…). Ils l’importent dans MyDesk (Révisions → Importer) ou dans Anki (Fichier → Importer). Tes révisions ne sont pas incluses : ils partent de zéro. Renvoyer le fichier plus tard ajoute seulement les nouvelles fiches.',
    exportTags: 'Tags à inclure',
    exportToggleAll: 'Tout cocher / décocher',
    exportEmpty: 'Aucune fiche dans ce paquet.',
    exportDownload: 'Télécharger le fichier ({count} fiche(s))',
    exportShare: 'Partager…',
    exportDone: 'Fichier créé : {count} fiche(s).',
    undo: '↶ Annuler',
    undoTitle: 'Annuler : {what} (Ctrl+Z)',
    undone: 'Annulé : {what}.',
    what: {
      review: 'la révision',
      add: "l'ajout",
      edit: 'la modification',
      delete: 'la suppression',
      suspend: 'la suspension',
      deck: 'le changement de paquet',
      import: "l'import",
      reset: 'la réinitialisation',
      tag: 'le changement de tag',
      move: 'le déplacement',
      unsure: 'le marquage « à confirmer »',
      restore: 'la restauration'
    },
    deckName: 'Paquet',
    deckChoose: '— Choisir un paquet —',
    deckRequired: 'Choisis un paquet pour cette carte.',
    colNew: 'Nouvelles',
    colLearn: 'Apprent.',
    colDue: 'À revoir',
    newDeck: '＋ Nouveau paquet',
    newDeckPrompt: 'Nom du paquet (utilise « :: » pour un sous-paquet, ex. Droit::Sociétés) :',
    renameDeck: 'Renommer',
    renameDeckPrompt: 'Nouveau nom du paquet :',
    deleteDeck: 'Supprimer',
    deleteDeckConfirm: 'Supprimer le paquet « {name} », ses sous-paquets et leurs {count} note(s) ? (Annulable avec Ctrl+Z)',
    deckExists: 'Un paquet porte déjà ce nom.',
    noDecks: 'Aucun paquet pour l’instant. Crée un paquet, ajoute des cartes ou importe un export Anki (.txt).',
    defaultDeck: 'Par défaut',
    study: 'Étudier',
    studyAhead: 'Réviser maintenant',
    overviewEmpty: 'Rien à étudier dans ce paquet pour l’instant.',
    doneTitle: 'Bravo ! Fini pour aujourd’hui 🎉',
    doneLearning: '{count} carte(s) encore en apprentissage : la prochaine revient dans {time}.',
    doneTomorrow: 'Demain : {count} carte(s) à revoir.',
    backToDecks: '← Paquets',
    showAnswer: 'Afficher la réponse',
    again: 'À revoir',
    hard: 'Difficile',
    good: 'Correct',
    easy: 'Facile',
    editCard: '✏️ Modifier',
    suspendCard: '⏸ Suspendre',
    unsuspendCard: '▶ Réactiver',
    unsuspendedStatus: '{count} carte(s) réactivée(s) : de retour dans les révisions.',
    suspendedStatus: '{count} carte(s) suspendue(s) : elles n’apparaîtront plus en révision (▶ Réactiver pour les remettre).',
    deleteNote: '🗑 Supprimer',
    deleteNoteConfirm: 'Supprimer cette note et ses {count} carte(s) ? (Annulable avec Ctrl+Z)',
    endSession: 'Terminer',
    keyboardHelp: 'Clavier : Espace = réponse, puis 1 À revoir · 2 Difficile · 3 Correct · 4 Facile · E modifier · C à confirmer · Ctrl+Z annuler',
    typeBasic: 'Basique',
    typeReversed: 'Basique + carte inversée',
    typeCloze: 'Texte à trous',
    fieldFront: 'Recto',
    fieldBack: 'Verso',
    fieldText: 'Texte',
    fieldExtra: 'Informations en plus (au dos)',
    navTags: 'Tags',
    fieldTag: 'Tag (partie du cours)',
    tagPlaceholder: 'ex. T1 - Chap 1',
    tagHelp: 'Choisis un tag existant ou tape un nouveau nom pour le créer.',
    allTags: 'Tous les tags',
    noTag: 'Sans tag',
    colTag: 'Tag',
    renameTag: '✎ Renommer ce tag',
    renameTagPrompt: 'Nouveau nom pour « {name} » ({count} note(s)) :',
    tagRenamed: 'Tag renommé : « {name} » ({count} note(s)).',
    tagMergeConfirm: 'Le tag « {name} » existe déjà : y regrouper ces {count} note(s) et fusionner les deux tags ?',
    tagMerged: '{count} note(s) regroupée(s) dans « {name} ».',
    tagsHelp: 'Un tag = une partie du cours. Renommer un tag le change sur toutes ses cartes ; lui donner le nom d’un autre tag les fusionne.',
    tagNotes: '{count} note(s)',
    newTagPlaceholder: 'Nouveau tag, ex. T2 - Chap 1',
    addTag: '＋ Créer',
    tagExists: 'Ce tag existe déjà dans ce paquet.',
    tagCreated: 'Tag « {name} » créé.',
    deleteTag: 'Supprimer le tag',
    deleteTagConfirm: 'Supprimer le tag « {name} » ? Ses {count} note(s) resteront, sans tag.',
    noTags: 'Aucun tag dans ce paquet pour l’instant.',
    noteType: 'Type',
    addTitle: 'Ajouter des cartes',
    editTitle: 'Modifier la note',
    addButton: 'Ajouter (Ctrl+Entrée)',
    saveButton: 'Enregistrer (Ctrl+Entrée)',
    cancel: 'Annuler',
    added: 'Note ajoutée ({count} carte(s)).',
    saved: 'Note enregistrée.',
    emptyFront: 'Le premier champ est vide.',
    noCloze: 'Ajoute au moins un trou : sélectionne un mot puis clique sur [...] (ou Ctrl+Maj+C).',
    duplicate: 'Attention : une note avec le même recto existe déjà.',
    clozeButton: '[...]',
    clozeTitle: 'Créer un trou avec la sélection (Ctrl+Maj+C)',
    clozeHelp: 'Sélectionne le texte à cacher puis clique sur [...] : chaque numéro (c1, c2…) donne une carte. Même numéro = cachés ensemble.',
    bold: 'Gras (Ctrl+B)',
    italic: 'Italique (Ctrl+I)',
    underline: 'Souligné (Ctrl+U)',
    bullets: 'Liste à puces',
    numbers: 'Liste numérotée',
    clearFormat: 'Effacer la mise en forme',
    searchPlaceholder: 'Rechercher un mot… (ou is:due, is:new, is:aconfirmer, added:2 = ajoutées depuis hier)',
    unsureField: '⚠ À confirmer : je ne suis pas sûr que l’info soit fiable',
    unsureBadge: '⚠ À confirmer',
    unsureReview: '⚠ À confirmer : cette info n’a pas encore été vérifiée.',
    unsureMark: '⚠ À confirmer',
    unsureRemove: '✓ Info vérifiée',
    unsureMarked: 'Fiche marquée « à confirmer ».',
    unsureCleared: 'Fiche confirmée.',
    selectAll: 'Tout sélectionner',
    selectCard: 'Sélectionner',
    bulkSelected: '{count} note(s) sélectionnée(s)',
    bulkDeckKeep: 'Paquet : inchangé',
    bulkTagKeep: 'Tag : inchangé',
    bulkNewTag: '＋ Nouveau tag…',
    bulkNewTagPrompt: 'Nom du nouveau tag :',
    bulkApply: 'Appliquer',
    bulkClear: 'Désélectionner',
    bulkNothing: 'Choisis un paquet ou un tag à appliquer.',
    bulkDone: '{count} note(s) : {what}.',
    bulkDeckDone: 'paquet « {deck} »',
    bulkTagDone: 'tag « {tag} »',
    restoreTitle: 'Récupérer des cartes',
    restoreLink: 'Cartes disparues ? Les récupérer depuis l’historique de synchro',
    restoreHelp: 'Chaque synchro est gardée par GitHub. Choisis une version : les paquets, notes, cartes et révisions qui manquent aujourd’hui sont rajoutés (rien de ce que tu as maintenant n’est supprimé).',
    restoreSearch: 'Chercher dans l’historique',
    restoreSearching: 'Recherche… ({done} version(s) lue(s))',
    restoreNone: 'Aucune version de l’historique ne contient de cartes.',
    restoreNeedSync: 'La synchronisation doit être activée (onglet Accueil) pour lire l’historique.',
    restoreError: 'Lecture de l’historique impossible : {error}',
    restoreItem: '{date} : {notes} note(s), {decks} paquet(s), {reviews} révision(s)',
    restoreMissing: '{count} note(s) absente(s) aujourd’hui',
    restoreButton: 'Restaurer',
    restoreDone: 'Restauré : {notes} note(s), {cards} carte(s), {reviews} révision(s).',
    restoreNothing: 'Rien à restaurer : tout est déjà là.',
    colQuestion: 'Question',
    colDeck: 'Paquet',
    colDueDate: 'Échéance',
    colInterval: 'Intervalle',
    colReviews: 'Rév. / oublis',
    resultsCount: '{count} carte(s)',
    showMore: 'Afficher plus',
    stateNew: 'Nouvelle',
    stateLearning: 'Apprentissage',
    suspended: 'Suspendue',
    statsTitle: 'Statistiques',
    statsDeck: 'Paquet',
    allDecks: 'Tous les paquets',
    today: 'Aujourd’hui',
    todayText: '{count} carte(s) étudiée(s) en {minutes} min · {again} « À revoir »',
    todayNothing: 'Aucune carte étudiée aujourd’hui.',
    cardCounts: 'Cartes',
    countNew: 'Nouvelles',
    countLearning: 'En apprentissage',
    countYoung: 'Jeunes (< 21 j)',
    countMature: 'Matures (≥ 21 j)',
    countSuspended: 'Suspendues',
    retentionTitle: 'Rétention réelle (30 derniers jours)',
    retentionText: '{rate} % de réussite sur {count} révision(s) de cartes déjà apprises',
    retentionMature: 'Cartes matures : {rate} % sur {count}',
    retentionNone: 'Pas encore assez de révisions.',
    retentionTarget: 'Objectif réglé : {target} %',
    heatmapTitle: 'Activité (26 dernières semaines)',
    heatmapCell: '{date} : {count} révision(s)',
    forecastTitle: 'Prévision (30 prochains jours)',
    forecastCell: '{date} : {count} carte(s)',
    forecastTotal: '{count} révision(s) prévue(s), {avg} par jour en moyenne',
    settingsTitle: 'Réglages de révision',
    retention: 'Rétention visée',
    retentionHelp: 'Probabilité de te souvenir d’une carte au moment où elle revient. 0,90 est la valeur par défaut d’Anki. Plus haut = intervalles plus courts et beaucoup plus de révisions (la charge grimpe très vite au-delà de 0,95).',
    newPerDay: 'Nouvelles cartes par jour',
    shuffle: '🔀 Mélanger',
    shuffleAgain: '🔀 Mélanger à nouveau',
    shuffleOff: 'Remettre dans l’ordre',
    shuffleOn: 'Cartes mélangées dans ce paquet (nouvelles et révisions).',
    shuffleOffDone: 'Ordre d’origine rétabli.',
    moreNewInfo: 'Limite du jour atteinte : {left} nouvelle(s) carte(s) en attente dans ce paquet.',
    moreNewLabel: 'Étudier plus aujourd’hui',
    moreNewButton: 'Ajouter',
    moreNewDone: '+{count} nouvelle(s) carte(s) ajoutée(s) pour aujourd’hui dans ce paquet.',
    reviewsPerDay: 'Révisions maximum par jour',
    learningSteps: 'Étapes d’apprentissage',
    relearningSteps: 'Étapes de réapprentissage',
    stepsHelp: 'Délais avant de revoir une carte nouvelle ou oubliée, ex. « 1m 10m » (m = minutes, h = heures, d = jours).',
    maxInterval: 'Intervalle maximum (jours)',
    dayStart: 'La journée commence à (heure)',
    burySiblings: 'Ne pas montrer le même jour les cartes d’une même note (recto/verso inversé, trous)',
    settingsSaved: 'Réglages enregistrés.',
    settingsInvalidSteps: 'Étapes invalides : utilise par exemple « 1m 10m ».',
    importTitle: 'Importer des cartes',
    importHelp: 'Dans Anki : Fichier → Exporter → « Notes en texte brut (.txt) », coche « Inclure le nom du paquet », « Inclure le type de note » et « Inclure l’identifiant unique ». Les fichiers texte simples (recto⇥verso par ligne) marchent aussi.',
    importFile: 'Choisir un fichier .txt / .csv',
    importPreview: '{count} note(s) trouvée(s)',
    importTypes: 'Types : {types}',
    importDecks: 'Paquets : {decks}',
    importTarget: 'Paquet de destination',
    importUseFile: 'Garder les paquets du fichier',
    importNewDeck: 'Nouveau paquet…',
    importExisting: 'Si la note existe déjà (même identifiant Anki)',
    importUpdate: 'Mettre à jour',
    importSkip: 'Ignorer',
    importButton: 'Importer',
    importDone: 'Import terminé : {added} ajoutée(s), {updated} mise(s) à jour, {skipped} ignorée(s).',
    importEmpty: 'Aucune note lisible dans ce fichier.',
    importMedia: '{count} image(s) ou son(s) non importé(s) : seuls les textes sont repris.',
    importSample: 'Aperçu de la première note',
    mediaMissing: 'image non importée',
    soundMissing: 'son non importé'
  },
  en: {
    navDecks: 'Decks',
    navAdd: '＋ Add',
    navBrowse: 'Browse',
    navStats: 'Stats',
    navSettings: 'Settings',
    navImport: 'Import',
    navExport: 'Share',
    exportTitle: 'Share cards',
    exportHelp: 'Creates a file to send to your friends (WhatsApp, email…). They import it in MyDesk (Reviews → Import) or in Anki (File → Import). Your review history is not included: they start from scratch. Sending the file again later only adds the new cards.',
    exportTags: 'Tags to include',
    exportToggleAll: 'Tick / untick all',
    exportEmpty: 'No cards in this deck.',
    exportDownload: 'Download the file ({count} card(s))',
    exportShare: 'Share…',
    exportDone: 'File created: {count} card(s).',
    undo: '↶ Undo',
    undoTitle: 'Undo: {what} (Ctrl+Z)',
    undone: 'Undone: {what}.',
    what: {
      review: 'review',
      add: 'add',
      edit: 'edit',
      delete: 'delete',
      suspend: 'suspend',
      deck: 'deck change',
      import: 'import',
      reset: 'reset',
      tag: 'tag change',
      move: 'the move',
      unsure: 'the "to check" mark',
      restore: 'restore'
    },
    deckName: 'Deck',
    deckChoose: '— Choose a deck —',
    deckRequired: 'Choose a deck for this card.',
    colNew: 'New',
    colLearn: 'Learn',
    colDue: 'Due',
    newDeck: '＋ New deck',
    newDeckPrompt: 'Deck name (use "::" for a subdeck, e.g. Law::Companies):',
    renameDeck: 'Rename',
    renameDeckPrompt: 'New deck name:',
    deleteDeck: 'Delete',
    deleteDeckConfirm: 'Delete deck "{name}", its subdecks and their {count} note(s)? (Ctrl+Z to undo)',
    deckExists: 'A deck with this name already exists.',
    noDecks: 'No decks yet. Create a deck, add cards or import an Anki export (.txt).',
    defaultDeck: 'Default',
    study: 'Study',
    studyAhead: 'Review now',
    overviewEmpty: 'Nothing to study in this deck right now.',
    doneTitle: 'Congratulations! Done for today 🎉',
    doneLearning: '{count} card(s) still in learning: next one in {time}.',
    doneTomorrow: 'Tomorrow: {count} card(s) due.',
    backToDecks: '← Decks',
    showAnswer: 'Show answer',
    again: 'Again',
    hard: 'Hard',
    good: 'Good',
    easy: 'Easy',
    editCard: '✏️ Edit',
    suspendCard: '⏸ Suspend',
    unsuspendCard: '▶ Unsuspend',
    unsuspendedStatus: '{count} card(s) unsuspended: back in reviews.',
    suspendedStatus: '{count} card(s) suspended: they will no longer show up in reviews (▶ Unsuspend to bring them back).',
    deleteNote: '🗑 Delete',
    deleteNoteConfirm: 'Delete this note and its {count} card(s)? (Ctrl+Z to undo)',
    endSession: 'End',
    keyboardHelp: 'Keyboard: Space = answer, then 1 Again · 2 Hard · 3 Good · 4 Easy · E edit · C to check · Ctrl+Z undo',
    typeBasic: 'Basic',
    typeReversed: 'Basic + reversed card',
    typeCloze: 'Cloze',
    fieldFront: 'Front',
    fieldBack: 'Back',
    fieldText: 'Text',
    fieldExtra: 'Back extra',
    navTags: 'Tags',
    fieldTag: 'Tag (course section)',
    tagPlaceholder: 'e.g. P1 - Ch 1',
    tagHelp: 'Pick an existing tag or type a new name to create it.',
    allTags: 'All tags',
    noTag: 'No tag',
    colTag: 'Tag',
    renameTag: '✎ Rename this tag',
    renameTagPrompt: 'New name for "{name}" ({count} note(s)):',
    tagRenamed: 'Tag renamed: "{name}" ({count} note(s)).',
    tagMergeConfirm: 'Tag "{name}" already exists: move these {count} note(s) into it and merge both tags?',
    tagMerged: '{count} note(s) moved into "{name}".',
    tagsHelp: 'A tag = a part of the course. Renaming a tag changes it on all its cards; giving it another tag’s name merges them.',
    tagNotes: '{count} note(s)',
    newTagPlaceholder: 'New tag, e.g. P2 - Ch 1',
    addTag: '＋ Create',
    tagExists: 'This tag already exists in this deck.',
    tagCreated: 'Tag "{name}" created.',
    deleteTag: 'Delete tag',
    deleteTagConfirm: 'Delete tag "{name}"? Its {count} note(s) will stay, without a tag.',
    noTags: 'No tags in this deck yet.',
    noteType: 'Type',
    addTitle: 'Add cards',
    editTitle: 'Edit note',
    addButton: 'Add (Ctrl+Enter)',
    saveButton: 'Save (Ctrl+Enter)',
    cancel: 'Cancel',
    added: 'Note added ({count} card(s)).',
    saved: 'Note saved.',
    emptyFront: 'The first field is empty.',
    noCloze: 'Add at least one cloze: select a word then click [...] (or Ctrl+Shift+C).',
    duplicate: 'Warning: a note with the same front already exists.',
    clozeButton: '[...]',
    clozeTitle: 'Make a cloze from the selection (Ctrl+Shift+C)',
    clozeHelp: 'Select the text to hide then click [...]: each number (c1, c2…) makes one card. Same number = hidden together.',
    bold: 'Bold (Ctrl+B)',
    italic: 'Italic (Ctrl+I)',
    underline: 'Underline (Ctrl+U)',
    bullets: 'Bulleted list',
    numbers: 'Numbered list',
    clearFormat: 'Clear formatting',
    searchPlaceholder: 'Search a word… (or is:due, is:new, is:unconfirmed, added:2 = added since yesterday)',
    unsureField: '⚠ To check: I am not sure this information is reliable',
    unsureBadge: '⚠ To check',
    unsureReview: '⚠ To check: this information has not been verified yet.',
    unsureMark: '⚠ To check',
    unsureRemove: '✓ Verified',
    unsureMarked: 'Card marked "to check".',
    unsureCleared: 'Card verified.',
    selectAll: 'Select all',
    selectCard: 'Select',
    bulkSelected: '{count} note(s) selected',
    bulkDeckKeep: 'Deck: unchanged',
    bulkTagKeep: 'Tag: unchanged',
    bulkNewTag: '＋ New tag…',
    bulkNewTagPrompt: 'New tag name:',
    bulkApply: 'Apply',
    bulkClear: 'Deselect',
    bulkNothing: 'Choose a deck or a tag to apply.',
    bulkDone: '{count} note(s): {what}.',
    bulkDeckDone: 'deck "{deck}"',
    bulkTagDone: 'tag "{tag}"',
    restoreTitle: 'Recover cards',
    restoreLink: 'Cards gone? Recover them from the sync history',
    restoreHelp: 'GitHub keeps every sync. Pick a version: decks, notes, cards and reviews missing today are added back (nothing you have now is removed).',
    restoreSearch: 'Search the history',
    restoreSearching: 'Searching… ({done} version(s) read)',
    restoreNone: 'No version in the history contains cards.',
    restoreNeedSync: 'Sync must be enabled (Home tab) to read the history.',
    restoreError: 'Could not read the history: {error}',
    restoreItem: '{date}: {notes} note(s), {decks} deck(s), {reviews} review(s)',
    restoreMissing: '{count} note(s) missing today',
    restoreButton: 'Restore',
    restoreDone: 'Restored: {notes} note(s), {cards} card(s), {reviews} review(s).',
    restoreNothing: 'Nothing to restore: everything is already here.',
    colQuestion: 'Question',
    colDeck: 'Deck',
    colDueDate: 'Due',
    colInterval: 'Interval',
    colReviews: 'Reviews / lapses',
    resultsCount: '{count} card(s)',
    showMore: 'Show more',
    stateNew: 'New',
    stateLearning: 'Learning',
    suspended: 'Suspended',
    statsTitle: 'Statistics',
    statsDeck: 'Deck',
    allDecks: 'All decks',
    today: 'Today',
    todayText: '{count} card(s) studied in {minutes} min · {again} "Again"',
    todayNothing: 'No cards studied today.',
    cardCounts: 'Cards',
    countNew: 'New',
    countLearning: 'Learning',
    countYoung: 'Young (< 21 d)',
    countMature: 'Mature (≥ 21 d)',
    countSuspended: 'Suspended',
    retentionTitle: 'True retention (last 30 days)',
    retentionText: '{rate}% passed out of {count} review(s) of learned cards',
    retentionMature: 'Mature cards: {rate}% out of {count}',
    retentionNone: 'Not enough reviews yet.',
    retentionTarget: 'Target: {target}%',
    heatmapTitle: 'Activity (last 26 weeks)',
    heatmapCell: '{date}: {count} review(s)',
    forecastTitle: 'Forecast (next 30 days)',
    forecastCell: '{date}: {count} card(s)',
    forecastTotal: '{count} review(s) due, {avg} per day on average',
    settingsTitle: 'Review settings',
    retention: 'Desired retention',
    retentionHelp: 'Probability of remembering a card when it comes back. 0.90 is Anki’s default. Higher = shorter intervals and many more reviews (workload rises very fast above 0.95).',
    newPerDay: 'New cards per day',
    shuffle: '🔀 Shuffle',
    shuffleAgain: '🔀 Shuffle again',
    shuffleOff: 'Back to original order',
    shuffleOn: 'Cards shuffled in this deck (new and reviews).',
    shuffleOffDone: 'Original order restored.',
    moreNewInfo: 'Daily limit reached: {left} new card(s) waiting in this deck.',
    moreNewLabel: 'Study more today',
    moreNewButton: 'Add',
    moreNewDone: '+{count} new card(s) added for today in this deck.',
    reviewsPerDay: 'Maximum reviews per day',
    learningSteps: 'Learning steps',
    relearningSteps: 'Relearning steps',
    stepsHelp: 'Delays before seeing a new or forgotten card again, e.g. "1m 10m" (m = minutes, h = hours, d = days).',
    maxInterval: 'Maximum interval (days)',
    dayStart: 'Next day starts at (hour)',
    burySiblings: 'Don’t show cards of the same note on the same day (reversed, clozes)',
    settingsSaved: 'Settings saved.',
    settingsInvalidSteps: 'Invalid steps: use e.g. "1m 10m".',
    importTitle: 'Import cards',
    importHelp: 'In Anki: File → Export → "Notes in Plain Text (.txt)", tick "Include deck name", "Include notetype name" and "Include unique identifier". Simple text files (front⇥back per line) work too.',
    importFile: 'Choose a .txt / .csv file',
    importPreview: '{count} note(s) found',
    importTypes: 'Types: {types}',
    importDecks: 'Decks: {decks}',
    importTarget: 'Target deck',
    importUseFile: 'Keep the decks from the file',
    importNewDeck: 'New deck…',
    importExisting: 'If the note already exists (same Anki id)',
    importUpdate: 'Update',
    importSkip: 'Skip',
    importButton: 'Import',
    importDone: 'Import done: {added} added, {updated} updated, {skipped} skipped.',
    importEmpty: 'No readable note in this file.',
    importMedia: '{count} image(s) or sound(s) not imported: only text is kept.',
    importSample: 'First note preview',
    mediaMissing: 'image not imported',
    soundMissing: 'sound not imported'
  }
};

const ANKI_DEFAULT_SETTINGS = {
  retention: 0.9,
  newPerDay: 20,
  reviewsPerDay: 200,
  learningSteps: '1m 10m',
  relearningSteps: '10m',
  maxInterval: 36500,
  dayStartHour: 4,
  burySiblings: true
};

const ANKI_STATE = { NEW: 0, LEARNING: 1, REVIEW: 2, RELEARNING: 3 };
const ANKI_LEARN_AHEAD_MS = 20 * 60 * 1000; // comme Anki : 20 min d'avance
const ANKI_MAX_ANSWER_MS = 60 * 1000;
const ANKI_UNDO_MAX = 30;
const ANKI_BROWSE_PAGE = 200;
const ANKI_MATURE_DAYS = 21;
const ANKI_COLLECTIONS = ['decks', 'notes', 'cards', 'revlog', 'tags'];

let ankiView = 'decks'; // decks | overview | review | done | add | edit | browse | stats | settings | import
let ankiDeckId = null;
let ankiCurrent = null; // { cardId, shownAt, answerShown }
let ankiEditNoteId = null;
let ankiEditReturn = 'decks';
let ankiUndoStack = [];
let ankiSchedulerCache = null;
let ankiBrowseQuery = '';
let ankiBrowseDeck = ''; // '' = tous les paquets
let ankiBrowseTag = ''; // '' = tous les tags, ANKI_NO_TAG = sans tag
let ankiTagsDeck = '';
let ankiBrowseLimit = ANKI_BROWSE_PAGE;
let ankiBrowseSelected = new Set(); // notes cochées dans « Parcourir »
let ankiBrowseLastIndex = null;
let ankiImportState = null;
let ankiExportDeck = '';
let ankiStatsDeckId = '';
let ankiStatusTimer = null;
let ankiAddDefaults = { type: 'basic', deckId: null, tagName: '' };
// Champs proposés à la prochaine ouverture de « Ajouter » (Notes → « 🧠 Fiche »).
let ankiAddPrefill = null;

function registerAnkiTranslations() {
  Object.keys(translations).forEach((language) => {
    translations[language].anki = ANKI_TRANSLATIONS[language] || ANKI_TRANSLATIONS.fr;
    if (translations[language].tabs) {
      translations[language].tabs.anki = ANKI_TAB_TRANSLATIONS[language] || ANKI_TAB_TRANSLATIONS.fr;
    }
  });
}

/* ── Données ───────────────────────────────────────────────── */

function ankiIsObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function ankiData() {
  return appData.anki;
}

function ensureAnkiData() {
  if (!ankiIsObject(appData.anki)) appData.anki = {};
  const data = appData.anki;
  ANKI_COLLECTIONS.forEach((key) => {
    if (!Array.isArray(data[key])) data[key] = [];
  });
  data.settings = { ...ANKI_DEFAULT_SETTINGS, ...(ankiIsObject(data.settings) ? data.settings : {}) };

  // Paquets parents manquants (ex. « A::B » importé sans « A »).
  const names = new Set(data.decks.map((deck) => deck.name));
  data.decks.slice().forEach((deck) => {
    const parts = String(deck.name).split('::');
    for (let i = 1; i < parts.length; i += 1) {
      const parent = parts.slice(0, i).join('::');
      if (!names.has(parent)) {
        names.add(parent);
        data.decks.push({ id: uid(), name: parent, created: Date.now() });
      }
    }
  });

  // Notes sans paquet (paquet supprimé sur un autre appareil).
  const deckIds = new Set(data.decks.map((deck) => deck.id));
  data.notes.forEach((note) => {
    if (!deckIds.has(note.deckId)) note.deckId = ankiDefaultDeck().id;
  });

  if (data.tags.some((tag) => !deckIds.has(tag.deckId))) {
    data.tags = data.tags.filter((tag) => deckIds.has(tag.deckId));
  }
  const tagsById = new Map(data.tags.map((tag) => [tag.id, tag]));
  data.notes.forEach((note) => {
    if (typeof note.part === 'string') {
      // Ancienne version : partie en texte libre → tag partagé. Un nom
      // généré depuis les tags Anki passe au format court (« T1 - Chap 1 »).
      let name = note.part;
      if (name && name === ankiPartFromTags(note.tags, true)) name = ankiPartFromTags(note.tags);
      const tag = ankiFindOrCreateTag(note.deckId, name);
      note.tagId = tag ? tag.id : null;
      delete note.part;
    } else if (note.tagId === undefined) {
      const tag = ankiFindOrCreateTag(note.deckId, ankiPartFromTags(note.tags));
      note.tagId = tag ? tag.id : null;
    } else if (note.tagId) {
      const tag = tagsById.get(note.tagId) || ankiGetTag(note.tagId);
      if (!tag) note.tagId = null;
      else if (tag.deckId !== note.deckId) note.tagId = ankiFindOrCreateTag(note.deckId, tag.name).id; // note changée de paquet
    }
  });

  // Cartes et historiques orphelins (note supprimée ailleurs).
  const noteIds = new Set(data.notes.map((note) => note.id));
  if (data.cards.some((card) => !noteIds.has(card.noteId))) {
    data.cards = data.cards.filter((card) => noteIds.has(card.noteId));
  }
  const cardIds = new Set(data.cards.map((card) => card.id));
  if (data.revlog.some((log) => !cardIds.has(log.c))) {
    data.revlog = data.revlog.filter((log) => cardIds.has(log.c));
  }
  if (typeof FSRS !== 'undefined') ankiReconcileCards();
}

// Toute suppression volontaire est datée : la synchro distingue ainsi une
// vraie suppression d'un appareil qui a simplement perdu ses données.
function ankiMarkDelete() {
  ankiData().lastDeleteAt = Date.now();
}

function ankiDefaultDeck() {
  const data = ankiData();
  let deck = data.decks.find((d) => d.name === t('anki.defaultDeck')) || data.decks[0];
  if (!deck) {
    deck = { id: uid(), name: t('anki.defaultDeck'), created: Date.now() };
    data.decks.push(deck);
  }
  return deck;
}

function ankiNewCard(noteId, ord, created) {
  return {
    id: uid(),
    noteId,
    ord,
    created,
    state: ANKI_STATE.NEW,
    due: created,
    stability: 0,
    difficulty: 0,
    elapsed_days: 0,
    scheduled_days: 0,
    learning_steps: 0,
    reps: 0,
    lapses: 0,
    last_review: null,
    lastLog: null,
    suspended: false
  };
}

/* ── FSRS ──────────────────────────────────────────────────── */

function ankiParseSteps(text) {
  return String(text || '')
    .split(/[\s,;]+/)
    .map((step) => step.trim())
    .filter(Boolean);
}

function ankiStepsValid(text) {
  return ankiParseSteps(text).every((step) => /^\d+(\.\d+)?[mhd]$/.test(step));
}

function ankiScheduler() {
  const s = ankiData().settings;
  const key = JSON.stringify([s.retention, s.maxInterval, s.learningSteps, s.relearningSteps]);
  if (!ankiSchedulerCache || ankiSchedulerCache.key !== key) {
    const valid = (text, fallback) => (ankiStepsValid(text) ? ankiParseSteps(text) : fallback);
    ankiSchedulerCache = {
      key,
      scheduler: FSRS.fsrs({
        request_retention: Math.min(0.99, Math.max(0.7, Number(s.retention) || 0.9)),
        maximum_interval: Math.max(1, Math.round(Number(s.maxInterval) || 36500)),
        enable_fuzz: true,
        enable_short_term: true,
        learning_steps: valid(s.learningSteps, ['1m', '10m']),
        relearning_steps: valid(s.relearningSteps, ['10m'])
      })
    };
  }
  return ankiSchedulerCache.scheduler;
}

function ankiToFsrs(card) {
  return {
    due: new Date(card.due || card.created || Date.now()),
    stability: card.stability || 0,
    difficulty: card.difficulty || 0,
    elapsed_days: card.elapsed_days || 0,
    scheduled_days: card.scheduled_days || 0,
    learning_steps: card.learning_steps || 0,
    reps: card.reps || 0,
    lapses: card.lapses || 0,
    state: card.state || 0,
    last_review: card.last_review ? new Date(card.last_review) : undefined
  };
}

function ankiWriteCardState(card, state, lastLogId) {
  card.due = new Date(state.due).getTime();
  card.stability = state.stability;
  card.difficulty = state.difficulty;
  card.elapsed_days = state.elapsed_days;
  card.scheduled_days = state.scheduled_days;
  card.learning_steps = state.learning_steps;
  card.reps = state.reps;
  card.lapses = state.lapses;
  card.state = state.state;
  card.last_review = state.last_review ? new Date(state.last_review).getTime() : null;
  card.lastLog = lastLogId;
}

function ankiSortLogs(logs) {
  return logs.slice().sort((a, b) => a.t - b.t || (String(a.id) < String(b.id) ? -1 : 1));
}

// Rejoue l'historique d'une carte depuis zéro (le « fuzz » de ts-fsrs est
// déterministe : même historique → mêmes échéances).
function ankiRebuildCard(card, logs) {
  const scheduler = ankiScheduler();
  let state = FSRS.createEmptyCard(new Date(card.created || Date.now()));
  const sorted = ankiSortLogs(logs);
  sorted.forEach((log) => {
    state = scheduler.next(state, new Date(log.t), log.r).card;
  });
  ankiWriteCardState(card, state, sorted.length ? sorted[sorted.length - 1].id : null);
}

// Invariant : reps = nombre de révisions de la carte et lastLog = la plus
// récente. Sinon (fusion de deux appareils), on recalcule la carte.
function ankiReconcileCards() {
  const byCard = new Map();
  ankiData().revlog.forEach((log) => {
    if (!byCard.has(log.c)) byCard.set(log.c, []);
    byCard.get(log.c).push(log);
  });
  ankiData().cards.forEach((card) => {
    const logs = byCard.get(card.id) || [];
    let last = null;
    logs.forEach((log) => {
      if (!last || log.t > last.t || (log.t === last.t && String(log.id) > String(last.id))) last = log;
    });
    if ((card.reps || 0) === logs.length && (card.lastLog || null) === (last ? last.id : null)) return;
    ankiRebuildCard(card, logs);
  });
}

/* ── Jours (la journée commence à dayStartHour, comme Anki) ─── */

function ankiDayStart(ms = Date.now()) {
  const hour = Number(ankiData().settings.dayStartHour) || 0;
  const date = new Date(ms - hour * 3600 * 1000);
  date.setHours(hour, 0, 0, 0);
  return date.getTime();
}

function ankiDayEnd(ms = Date.now()) {
  const date = new Date(ankiDayStart(ms));
  date.setDate(date.getDate() + 1);
  return date.getTime();
}

function ankiAddDays(ms, days) {
  const date = new Date(ms);
  date.setDate(date.getDate() + days);
  return date.getTime();
}

/* ── Paquets ───────────────────────────────────────────────── */

function ankiSortedDecks() {
  return ankiData().decks.slice().sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true }));
}

function ankiGetDeck(id) {
  return ankiData().decks.find((deck) => deck.id === id) || null;
}

// Identifiants du paquet et de tous ses sous-paquets.
function ankiDeckFamily(deckId) {
  const deck = ankiGetDeck(deckId);
  if (!deck) return new Set();
  const prefix = `${deck.name}::`;
  return new Set(ankiData().decks.filter((d) => d.id === deck.id || d.name.startsWith(prefix)).map((d) => d.id));
}

function ankiDeckShortName(deck) {
  const parts = deck.name.split('::');
  return parts[parts.length - 1];
}

function ankiDeckDepth(deck) {
  return deck.name.split('::').length - 1;
}

function ankiFindOrCreateDeck(name) {
  const clean = String(name || '')
    .split('::')
    .map((part) => part.trim())
    .filter(Boolean)
    .join('::');
  if (!clean) return ankiDefaultDeck();
  let deck = ankiData().decks.find((d) => d.name === clean);
  if (!deck) {
    deck = { id: uid(), name: clean, created: Date.now() };
    ankiData().decks.push(deck);
  }
  return deck;
}

/* ── Tags (partie du cours) ────────────────────────────────── */
// Anki range les cartes avec des tags hiérarchiques (« soc::titre1::chap1 »).
// Ici, un tag est un objet partagé qui désigne une partie du cours : chaque
// note pointe vers UN tag de son paquet (note.tagId), donc renommer le tag
// renomme toutes ses cartes. Les tags Anki d'origine restent dans note.tags.

const ANKI_NO_TAG = '__none__';
// Fiche « à confirmer » (info pas encore vérifiée) : note.unsure = true.
// Dans les fichiers exportés, c'est le tag Anki « a_confirmer ».
const ANKI_UNSURE_TAG = 'a_confirmer';

function ankiIsUnsureTag(tag) {
  return ['a_confirmer', 'aconfirmer', 'a-confirmer', 'unconfirmed'].includes(ankiNormalize(tag));
}

const ANKI_PART_PATTERNS = [
  [/^(?:intro|introduction)$/, (m, long) => (long ? 'Introduction' : 'Intro')],
  [/^conclusion$/, () => 'Conclusion'],
  [/^(?:titre|t)[\s_-]*(\d+)$/, (m) => `T${m[1]}`],
  [/^(?:partie|part|p)[\s_-]*(\d+)$/, (m) => `Partie ${m[1]}`],
  [/^(?:chapitre|chap|ch|c)[\s_-]*(\d+)$/, (m, long) => `${long ? 'Chapitre' : 'Chap'} ${m[1]}`],
  [/^(?:sous[\s_-]?section|ss)[\s_-]*(\d+)$/, (m) => `Sous-section ${m[1]}`],
  [/^(?:section|sect|s)[\s_-]*(\d+)$/, (m) => `Section ${m[1]}`],
  [/^(?:paragraphe|para|§)[\s_-]*(\d+)$/, (m) => `§${m[1]}`],
  [/^td[\s_-]*(\d+)$/, (m) => `TD ${m[1]}`],
  [/^annexe[\s_-]*(\d*)$/, (m) => `Annexe${m[1] ? ` ${m[1]}` : ''}`]
];

// `long` : ancien format (« Introduction - Chapitre 2 »), pour reconnaître
// les noms générés automatiquement par la version précédente.
function ankiPartSegment(segment, long = false) {
  const key = ankiNormalize(segment).trim();
  for (const [pattern, label] of ANKI_PART_PATTERNS) {
    const match = pattern.exec(key);
    if (match) return { label: label(match, long), structural: true };
  }
  const text = String(segment)
    .replace(/_+/g, ' ')
    .replace(/([a-zà-ÿ])(\d)/gi, '$1 $2')
    .trim();
  return { label: text.charAt(0).toUpperCase() + text.slice(1), structural: false };
}

function ankiPartFromTag(tag, long = false) {
  const segments = String(tag || '')
    .split('::')
    .filter((segment) => segment.trim())
    .map((segment) => ankiPartSegment(segment, long));
  // Premier niveau non structurel = abréviation de la matière (« soc ») : inutile.
  if (segments.length > 1 && !segments[0].structural) segments.shift();
  return segments.map((segment) => segment.label).join(' - ');
}

// Parmi les tags Anki d'une note, garde le plus « structuré » (titre, chapitre…).
function ankiPartFromTags(tags, long = false) {
  let best = '';
  let bestScore = -1;
  (tags || []).forEach((tag) => {
    const score = String(tag)
      .split('::')
      .filter((segment) => ankiPartSegment(segment).structural).length;
    if (score > bestScore) {
      bestScore = score;
      best = ankiPartFromTag(tag, long);
    }
  });
  return best;
}

function ankiCleanTagName(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function ankiCompareTagNames(a, b) {
  const rank = (name) => (!name ? 3 : /^intro/i.test(name) ? 0 : /^conclusion/i.test(name) ? 2 : 1);
  return rank(a) - rank(b) || a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

function ankiHash(text) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

function ankiGetTag(id) {
  return id ? ankiData().tags.find((tag) => tag.id === id) || null : null;
}

function ankiTagName(note) {
  const tag = note && ankiGetTag(note.tagId);
  return tag ? tag.name : '';
}

function ankiFindTag(deckId, name) {
  const key = ankiNormalize(ankiCleanTagName(name));
  return ankiData().tags.find((tag) => tag.deckId === deckId && ankiNormalize(tag.name) === key) || null;
}

// Identifiant déterministe (paquet + nom) : deux appareils qui convertissent
// les mêmes notes créent le même tag, sans doublon après la synchro.
function ankiFindOrCreateTag(deckId, name) {
  const clean = ankiCleanTagName(name);
  if (!clean || !deckId) return null;
  const existing = ankiFindTag(deckId, clean);
  if (existing) return existing;
  let id = `tag-${ankiHash(`${deckId}|${ankiNormalize(clean)}`)}`;
  if (ankiGetTag(id)) id = uid();
  const tag = { id, deckId, name: clean, created: Date.now() };
  ankiData().tags.push(tag);
  return tag;
}

// Tags d'un paquet (et de ses sous-paquets), dans l'ordre du cours.
function ankiTagsIn(deckId) {
  const family = deckId ? ankiDeckFamily(deckId) : null;
  return ankiData()
    .tags.filter((tag) => !family || family.has(tag.deckId))
    .sort((a, b) => ankiCompareTagNames(a.name, b.name));
}

function ankiTagNoteCount(tagId) {
  return ankiData().notes.filter((note) => note.tagId === tagId).length;
}

// Renomme un tag (toutes ses cartes suivent). Si le nouveau nom est celui
// d'un autre tag du paquet, propose de fusionner les deux.
function ankiRenameTag(tagId, rawName) {
  const data = ankiData();
  const tag = ankiGetTag(tagId);
  const name = ankiCleanTagName(rawName);
  if (!tag || !name || name === tag.name) return false;
  const notes = data.notes.filter((note) => note.tagId === tag.id);
  const other = ankiFindTag(tag.deckId, name);
  if (other && other.id !== tag.id) {
    if (!window.confirm(t('anki.tagMergeConfirm', { name: other.name, count: notes.length }))) return false;
    ankiPushUndo('tag', ankiCapture({ tags: [tag.id], notes: notes.map((note) => note.id) }));
    const now = Date.now();
    notes.forEach((note) => {
      note.tagId = other.id;
      note.updated = now;
    });
    data.tags = data.tags.filter((x) => x.id !== tag.id);
    if (ankiBrowseTag === tag.id) ankiBrowseTag = other.id;
    saveData();
    ankiStatus(t('anki.tagMerged', { count: notes.length, name: other.name }), 'success');
    return true;
  }
  ankiPushUndo('tag', ankiCapture({ tags: [tag.id] }));
  tag.name = name;
  saveData();
  ankiStatus(t('anki.tagRenamed', { name, count: notes.length }), 'success');
  return true;
}

function ankiDeleteTag(tagId) {
  const data = ankiData();
  const tag = ankiGetTag(tagId);
  if (!tag) return;
  const notes = data.notes.filter((note) => note.tagId === tag.id);
  if (!window.confirm(t('anki.deleteTagConfirm', { name: tag.name, count: notes.length }))) return;
  ankiPushUndo('tag', ankiCapture({ tags: [tag.id], notes: notes.map((note) => note.id) }));
  notes.forEach((note) => {
    note.tagId = null;
  });
  data.tags = data.tags.filter((x) => x.id !== tag.id);
  if (ankiBrowseTag === tag.id) ankiBrowseTag = '';
  saveData();
  renderAnki(true);
}

// Change le paquet et/ou le tag de plusieurs notes d'un coup (révisions
// conservées). deckId null = paquet inchangé ; tagName null = tag inchangé
// (recréé à l'identique dans le nouveau paquet), '' = sans tag.
function ankiMoveNotes(noteIds, deckId, tagName) {
  const deck = deckId ? ankiGetDeck(deckId) : null;
  if ((deckId && !deck) || !noteIds.length || (!deck && tagName === null)) return false;
  const tagsBefore = ankiData().tags.map((tag) => tag.id);
  const before = ankiCapture({ notes: noteIds, tags: tagsBefore });
  const ids = new Set(noteIds);
  const now = Date.now();
  ankiData().notes.forEach((note) => {
    if (!ids.has(note.id)) return;
    const name = tagName === null ? ankiTagName(note) : tagName;
    if (deck) note.deckId = deck.id;
    const tag = ankiFindOrCreateTag(note.deckId, name);
    note.tagId = tag ? tag.id : null;
    note.updated = now;
  });
  ankiData().tags.forEach((tag) => {
    if (!tagsBefore.includes(tag.id)) before.tags[tag.id] = null;
  });
  ankiPushUndo('move', before);
  saveData();
  const parts = [];
  if (deck) parts.push(t('anki.bulkDeckDone', { deck: deck.name }));
  if (tagName !== null) parts.push(tagName ? t('anki.bulkTagDone', { tag: ankiCleanTagName(tagName) }) : t('anki.noTag'));
  ankiStatus(t('anki.bulkDone', { count: ids.size, what: parts.join(' · ') }), 'success');
  return true;
}

/* ── File d'attente du jour ────────────────────────────────── */

function ankiNoteMap() {
  return new Map(ankiData().notes.map((note) => [note.id, note]));
}

function ankiShuffleKey(id, seed) {
  let h = 2166136261 ^ (Number(seed) || 1);
  const text = String(id);
  for (let i = 0; i < text.length; i += 1) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  h ^= h >>> 15;
  h = Math.imul(h, 2246822507);
  h ^= h >>> 13;
  return h >>> 0;
}

function ankiQueue(deckId) {
  const data = ankiData();
  const settings = data.settings;
  const now = Date.now();
  const dayStart = ankiDayStart(now);
  const dayEnd = ankiDayEnd(now);
  const family = deckId ? ankiDeckFamily(deckId) : null;
  const notes = ankiNoteMap();
  const inDeck = (card) => {
    const note = notes.get(card.noteId);
    return note && (!family || family.has(note.deckId));
  };

  // Ce qui a déjà été fait aujourd'hui dans ce paquet.
  const cardsById = new Map(data.cards.map((card) => [card.id, card]));
  let newDone = 0;
  let reviewDone = 0;
  const seenNotes = new Set();
  const newSeen = new Set();
  data.revlog.forEach((log) => {
    if (log.t < dayStart) return;
    const card = cardsById.get(log.c);
    if (!card || !inDeck(card)) return;
    seenNotes.add(card.noteId);
    if (log.s === ANKI_STATE.NEW && !newSeen.has(log.c)) {
      newSeen.add(log.c);
      newDone += 1;
    } else if (log.s === ANKI_STATE.REVIEW) {
      reviewDone += 1;
    }
  });

  const learningNow = [];
  const learningLater = [];
  const reviews = [];
  const news = [];
  data.cards.forEach((card) => {
    if (card.suspended || !inDeck(card)) return;
    if (card.state === ANKI_STATE.LEARNING || card.state === ANKI_STATE.RELEARNING) {
      if (card.due <= now) learningNow.push(card);
      else if (card.due < dayEnd) learningLater.push(card);
    } else if (card.state === ANKI_STATE.REVIEW) {
      if (card.due < dayEnd) reviews.push(card);
    } else {
      news.push(card);
    }
  });
  learningNow.sort((a, b) => a.due - b.due);
  learningLater.sort((a, b) => a.due - b.due);
  reviews.sort((a, b) => a.due - b.due);
  news.sort((a, b) => a.created - b.created || a.ord - b.ord);

  // Paquet « mélangé » : ordre aléatoire mais stable (même graine = même ordre).
  const shuffleDeck = deckId ? ankiGetDeck(deckId) : null;
  if (shuffleDeck && shuffleDeck.shuffle) {
    const key = new Map();
    [...news, ...reviews].forEach((card) => key.set(card.id, ankiShuffleKey(card.id, shuffleDeck.shuffle)));
    const byKey = (a, b) => key.get(a.id) - key.get(b.id);
    news.sort(byKey);
    reviews.sort(byKey);
  }

  const bury = settings.burySiblings;
  const reviewQueue = [];
  const reviewNotes = new Set();
  reviews.forEach((card) => {
    if (bury && (seenNotes.has(card.noteId) || reviewNotes.has(card.noteId))) return;
    reviewNotes.add(card.noteId);
    reviewQueue.push(card);
  });
  const newQueue = [];
  const newNotes = new Set();
  news.forEach((card) => {
    if (bury && (seenNotes.has(card.noteId) || reviewNotes.has(card.noteId) || newNotes.has(card.noteId))) return;
    newNotes.add(card.noteId);
    newQueue.push(card);
  });

  // « Étudier plus aujourd'hui » : rallonge valable pour ce paquet, ce jour seulement.
  const queueDeck = deckId ? ankiGetDeck(deckId) : null;
  const extraNew = queueDeck && queueDeck.extraNew && queueDeck.extraNew.day === dayStart ? Number(queueDeck.extraNew.count) || 0 : 0;
  const newLeft = Math.max(0, Math.round(Number(settings.newPerDay) || 0) + extraNew - newDone);
  const reviewLeft = Math.max(0, Math.round(Number(settings.reviewsPerDay) || 0) - reviewDone);
  return {
    learningNow,
    learningLater,
    reviews: reviewQueue.slice(0, reviewLeft),
    news: newQueue.slice(0, newLeft),
    newDone,
    reviewDone,
    newWaiting: Math.max(0, newQueue.length - newLeft),
    counts: {
      new: Math.min(newQueue.length, newLeft),
      learn: learningNow.length + learningLater.length,
      review: Math.min(reviewQueue.length, reviewLeft)
    }
  };
}

// Apprentissage dû d'abord, puis révisions et nouvelles mélangées
// régulièrement (réglage « mélanger » d'Anki).
function ankiPickNext(queue, allowAhead = false) {
  if (queue.learningNow.length) return queue.learningNow[0];
  const reviews = queue.reviews.length;
  const news = queue.news.length;
  if (reviews && news) {
    const newRatio = queue.newDone / (queue.newDone + news);
    const reviewRatio = queue.reviewDone / (queue.reviewDone + reviews);
    return newRatio <= reviewRatio ? queue.news[0] : queue.reviews[0];
  }
  if (reviews) return queue.reviews[0];
  if (news) return queue.news[0];
  const next = queue.learningLater[0];
  if (next && (allowAhead || next.due - Date.now() <= ANKI_LEARN_AHEAD_MS)) return next;
  return null;
}

/* ── Rendu des cartes ──────────────────────────────────────── */

const ANKI_ALLOWED_TAGS = new Set([
  'B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE', 'BR', 'DIV', 'P', 'SPAN', 'UL', 'OL', 'LI', 'SUB', 'SUP',
  'TABLE', 'THEAD', 'TBODY', 'TR', 'TD', 'TH', 'HR', 'BLOCKQUOTE', 'PRE', 'CODE', 'H1', 'H2', 'H3', 'H4', 'A', 'IMG'
]);
const ANKI_DROP_TAGS = new Set([
  'SCRIPT', 'STYLE', 'IFRAME', 'FRAME', 'OBJECT', 'EMBED', 'LINK', 'META', 'TEMPLATE', 'SVG', 'MATH', 'FORM',
  'INPUT', 'BUTTON', 'TEXTAREA', 'SELECT', 'NOSCRIPT', 'BASE', 'AUDIO', 'VIDEO', 'SOURCE', 'HEAD', 'TITLE'
]);
const ANKI_ALLOWED_STYLES = ['font-weight', 'font-style', 'text-decoration', 'text-decoration-line', 'text-align'];

// Nettoie le HTML des cartes : balises de mise en forme uniquement,
// aucun script, aucun évènement, pas de couleurs qui cassent le mode sombre.
function ankiSanitize(html) {
  const doc = new DOMParser().parseFromString(`<body>${String(html || '')}</body>`, 'text/html');
  const clean = (node) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) return;
      if (child.nodeType !== Node.ELEMENT_NODE) {
        child.remove();
        return;
      }
      const tag = child.tagName.toUpperCase();
      if (ANKI_DROP_TAGS.has(tag)) {
        child.remove();
        return;
      }
      clean(child);
      if (!ANKI_ALLOWED_TAGS.has(tag)) {
        child.replaceWith(...Array.from(child.childNodes));
        return;
      }
      Array.from(child.attributes).forEach((attr) => {
        const name = attr.name.toLowerCase();
        const keep =
          name === 'style' ||
          (tag === 'A' && name === 'href') ||
          (tag === 'IMG' && (name === 'src' || name === 'alt')) ||
          ((tag === 'TD' || tag === 'TH') && (name === 'colspan' || name === 'rowspan'));
        if (!keep) child.removeAttribute(attr.name);
      });
      if (child.hasAttribute('style')) {
        const kept = ANKI_ALLOWED_STYLES.map((prop) => {
          const value = child.style.getPropertyValue(prop);
          return value && !/url\(|expression/i.test(value) ? `${prop}: ${value}` : null;
        }).filter(Boolean);
        if (kept.length) child.setAttribute('style', kept.join('; '));
        else child.removeAttribute('style');
      }
      if (tag === 'A') {
        const href = child.getAttribute('href') || '';
        if (/^https?:\/\//i.test(href)) {
          child.setAttribute('target', '_blank');
          child.setAttribute('rel', 'noopener noreferrer');
        } else {
          child.removeAttribute('href');
        }
      }
      if (tag === 'IMG') {
        const src = child.getAttribute('src') || '';
        if (!/^(https:\/\/|data:image\/)/i.test(src)) {
          const placeholder = doc.createElement('span');
          placeholder.className = 'anki-missing';
          placeholder.textContent = `🖼 ${t('anki.mediaMissing')} (${src})`;
          child.replaceWith(placeholder);
        }
      }
    });
  };
  clean(doc.body);
  return doc.body.innerHTML;
}

function ankiPlainText(html) {
  const doc = new DOMParser().parseFromString(`<body>${String(html || '').replace(/<br\s*\/?>|<\/(div|p|li)>/gi, ' $&')}</body>`, 'text/html');
  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
}

function ankiNormalize(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

const ANKI_CLOZE_RE = /\{\{c(\d+)::([\s\S]*?)(?:::([\s\S]*?))?\}\}/g;

function ankiClozeNumbers(text) {
  const numbers = new Set();
  String(text || '').replace(ANKI_CLOZE_RE, (match, number) => {
    numbers.add(Number(number));
    return match;
  });
  return Array.from(numbers).filter((n) => n > 0).sort((a, b) => a - b);
}

function ankiRenderCloze(text, number, reveal) {
  return String(text || '').replace(ANKI_CLOZE_RE, (match, n, content, hint) => {
    if (Number(n) !== number) return content;
    if (reveal) return `<span class="anki-cloze">${content}</span>`;
    return `<span class="anki-cloze">[${hint ? hint : '…'}]</span>`;
  });
}

function ankiCardSides(card, note) {
  const fields = note.fields || {};
  if (note.type === 'cloze') {
    const number = card.ord + 1;
    const extra = fields.extra ? `<hr class="anki-sep">${fields.extra}` : '';
    return {
      question: ankiSanitize(ankiRenderCloze(fields.text, number, false)),
      answer: ankiSanitize(ankiRenderCloze(fields.text, number, true) + extra)
    };
  }
  const front = card.ord === 1 ? fields.back : fields.front;
  const back = card.ord === 1 ? fields.front : fields.back;
  return {
    question: ankiSanitize(front),
    answer: ankiSanitize(`${front || ''}<hr class="anki-sep">${back || ''}`)
  };
}

// Cartes que la note doit avoir : 1 (basique), 2 (inversée), 1 par numéro de trou.
function ankiWantedOrds(note) {
  if (note.type === 'reversed') return [0, 1];
  if (note.type === 'cloze') return ankiClozeNumbers(note.fields && note.fields.text).map((n) => n - 1);
  return [0];
}

// Crée les cartes manquantes et retire celles qui n'ont plus lieu d'être.
function ankiSyncNoteCards(note, created = Date.now()) {
  const data = ankiData();
  const wanted = new Set(ankiWantedOrds(note));
  const existing = data.cards.filter((card) => card.noteId === note.id);
  const removed = existing.filter((card) => !wanted.has(card.ord)).map((card) => card.id);
  if (removed.length) {
    const removedSet = new Set(removed);
    data.cards = data.cards.filter((card) => !removedSet.has(card.id));
    data.revlog = data.revlog.filter((log) => !removedSet.has(log.c));
  }
  const have = new Set(existing.map((card) => card.ord));
  const added = [];
  Array.from(wanted)
    .sort((a, b) => a - b)
    .forEach((ord) => {
      if (have.has(ord)) return;
      const card = ankiNewCard(note.id, ord, created);
      data.cards.push(card);
      added.push(card.id);
    });
  return { added, removed };
}

/* ── Formats ───────────────────────────────────────────────── */

function ankiFormatInterval(ms) {
  const locale = typeof getCurrentLocale === 'function' ? getCurrentLocale() : 'fr-FR';
  const fr = currentLanguage !== 'en';
  const number = (value) => value.toLocaleString(locale, { maximumFractionDigits: value < 10 ? 1 : 0 });
  const minutes = ms / 60000;
  if (minutes < 60) return `${Math.max(1, Math.round(minutes))} min`;
  const hours = minutes / 60;
  if (hours < 23.5) return `${number(Math.round(hours * 10) / 10)} h`;
  const days = hours / 24;
  if (days < 30) return `${Math.round(days)} ${fr ? 'j' : 'd'}`;
  if (days < 365) return `${number(Math.round((days / 30.44) * 10) / 10)} ${fr ? 'mois' : 'mo'}`;
  return `${number(Math.round((days / 365.25) * 10) / 10)} ${fr ? 'an(s)' : 'y'}`;
}

function ankiFormatDate(ms) {
  const locale = typeof getCurrentLocale === 'function' ? getCurrentLocale() : 'fr-FR';
  return new Date(ms).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ── Annulation (Ctrl+Z) propre à l'onglet ─────────────────── */

function ankiCapture(ids) {
  const before = {};
  ANKI_COLLECTIONS.forEach((collection) => {
    const wanted = new Set(ids[collection] || []);
    if (!wanted.size) return;
    const copies = {};
    wanted.forEach((id) => {
      copies[id] = null;
    });
    ankiData()[collection].forEach((item) => {
      if (wanted.has(item.id)) copies[item.id] = JSON.parse(JSON.stringify(item));
    });
    before[collection] = copies;
  });
  return before;
}

function ankiPushUndo(what, before, extra = {}) {
  ankiUndoStack.push({ what, before, ...extra });
  if (ankiUndoStack.length > ANKI_UNDO_MAX) ankiUndoStack.shift();
}

function ankiUndo() {
  const entry = ankiUndoStack.pop();
  if (!entry) return false;
  const data = ankiData();
  ANKI_COLLECTIONS.forEach((collection) => {
    const copies = entry.before[collection];
    if (!copies) return;
    const list = data[collection];
    Object.keys(copies).forEach((id) => {
      const index = list.findIndex((item) => item.id === id);
      const copy = copies[id];
      if (copy === null) {
        if (index !== -1) {
          list.splice(index, 1);
          ankiMarkDelete();
        }
      } else if (index !== -1) {
        list[index] = copy;
      } else {
        list.push(copy);
      }
    });
  });
  if (entry.what === 'review' && entry.cardId) {
    ankiView = 'review';
    ankiDeckId = entry.deckId || ankiDeckId;
    ankiCurrent = { cardId: entry.cardId, shownAt: Date.now(), answerShown: false };
  } else if (ankiView === 'review' || ankiView === 'done') {
    ankiCurrent = null;
  }
  saveData();
  renderAnki();
  ankiStatus(t('anki.undone', { what: t(`anki.what.${entry.what}`) }));
  return true;
}

/* ── Petits outils DOM ─────────────────────────────────────── */

function ankiEl(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined && text !== null) el.textContent = text;
  return el;
}

function ankiButton(className, text, onClick, title) {
  const button = ankiEl('button', className, text);
  button.type = 'button';
  if (title) button.title = title;
  button.addEventListener('click', onClick);
  return button;
}

function ankiStatus(text, type = 'info') {
  const status = document.getElementById('anki-status');
  if (!status) return;
  status.textContent = text;
  status.className = `anki-status anki-status--${type}`;
  clearTimeout(ankiStatusTimer);
  ankiStatusTimer = setTimeout(() => {
    status.textContent = '';
  }, 6000);
}

function ankiIsActive() {
  const panel = document.getElementById('anki');
  return Boolean(panel && panel.classList.contains('active'));
}

/* ── Rendu général ─────────────────────────────────────────── */

function renderAnki(force = false) {
  const main = document.getElementById('anki-main');
  if (!main || !appData.anki || typeof FSRS === 'undefined') return;
  // Ne pas effacer un formulaire en cours de saisie (synchro en arrière-plan).
  if (!force && (ankiView === 'add' || ankiView === 'edit') && main.querySelector('.anki-form')) {
    renderAnkiNav();
    return;
  }
  if (ankiDeckId && !ankiGetDeck(ankiDeckId)) ankiDeckId = null;
  renderAnkiNav();
  main.innerHTML = '';
  const views = {
    decks: renderAnkiDecks,
    overview: renderAnkiOverview,
    review: renderAnkiReview,
    done: renderAnkiDone,
    add: renderAnkiEditor,
    edit: renderAnkiEditor,
    browse: renderAnkiBrowse,
    tags: renderAnkiTags,
    restore: renderAnkiRestore,
    stats: renderAnkiStats,
    settings: renderAnkiSettings,
    import: renderAnkiImport,
    export: renderAnkiExport
  };
  (views[ankiView] || renderAnkiDecks)(main);
  ankiSaveUi();
}

// Vue, paquet et filtres retenus sur cet appareil (pas synchronisés) pour
// retrouver l'écran après un rafraîchissement.
const ANKI_UI_KEY = 'mydesk-anki-ui';
let ankiUiRestored = false; // pas d'enregistrement avant la restauration

function ankiSaveUi() {
  if (!ankiUiRestored) return;
  try {
    localStorage.setItem(
      ANKI_UI_KEY,
      JSON.stringify({
        view: ankiView,
        deckId: ankiDeckId,
        editNoteId: ankiEditNoteId,
        browseDeck: ankiBrowseDeck,
        browseTag: ankiBrowseTag,
        browseQuery: ankiBrowseQuery,
        tagsDeck: ankiTagsDeck,
        statsDeck: ankiStatsDeckId
      })
    );
  } catch (error) {
    // stockage indisponible : rien à retenir
  }
}

function ankiRestoreUi() {
  let ui = null;
  try {
    ui = JSON.parse(localStorage.getItem(ANKI_UI_KEY) || 'null');
  } catch (error) {
    ui = null;
  }
  if (!ankiIsObject(ui)) return;
  const deckOk = (id) => (id && ankiGetDeck(id) ? id : '');
  ankiDeckId = deckOk(ui.deckId) || null;
  ankiBrowseDeck = deckOk(ui.browseDeck);
  ankiBrowseTag = typeof ui.browseTag === 'string' ? ui.browseTag : '';
  ankiBrowseQuery = typeof ui.browseQuery === 'string' ? ui.browseQuery : '';
  ankiTagsDeck = deckOk(ui.tagsDeck);
  ankiStatsDeckId = deckOk(ui.statsDeck);
  let view = ui.view;
  if (view === 'edit' && !ankiData().notes.some((note) => note.id === ui.editNoteId)) view = 'browse';
  if (view === 'edit') {
    ankiEditNoteId = ui.editNoteId;
    ankiEditReturn = 'browse';
  }
  // En pleine révision : on reprend la révision du paquet (carte suivante due).
  if ((view === 'review' || view === 'done' || view === 'overview') && !ankiDeckId) view = 'decks';
  if (view === 'add') ankiEditReturn = 'decks';
  const known = ['decks', 'overview', 'review', 'done', 'add', 'edit', 'browse', 'tags', 'restore', 'stats', 'settings', 'import', 'export'];
  ankiView = known.includes(view) ? view : 'decks';
}

// Ouvre l'onglet Révisions sur « Ajouter », champs pré-remplis ({ front, back }).
function ankiOpenAddWith(prefill) {
  const link = document.querySelector('.tab-link[data-target="anki"]');
  if (!link || typeof activateTabHandler !== 'function' || !activateTabHandler) return false;
  ankiAddPrefill = prefill;
  ankiEditNoteId = null;
  ankiEditReturn = 'decks';
  activateTabHandler(link);
  ankiGo('add');
  return true;
}

function ankiGo(view) {
  ankiView = view;
  if (view !== 'review') ankiCurrent = null;
  renderAnki(true);
  const panel = document.getElementById('anki');
  if (panel && panel.scrollIntoView && window.scrollY > panel.offsetTop) panel.scrollIntoView({ block: 'start' });
}

function renderAnkiNav() {
  const nav = document.getElementById('anki-nav');
  if (!nav) return;
  nav.innerHTML = '';
  const items = [
    ['decks', 'anki.navDecks'],
    ['add', 'anki.navAdd'],
    ['browse', 'anki.navBrowse'],
    ['tags', 'anki.navTags'],
    ['stats', 'anki.navStats'],
    ['settings', 'anki.navSettings'],
    ['import', 'anki.navImport'],
    ['export', 'anki.navExport']
  ];
  const activeNav = { overview: 'decks', review: 'decks', done: 'decks', edit: 'browse', restore: 'settings' }[ankiView] || ankiView;
  items.forEach(([view, key]) => {
    const button = ankiButton(`anki-nav__btn${activeNav === view ? ' active' : ''}`, t(key), () => {
      if (view === 'add') {
        ankiEditNoteId = null;
        ankiEditReturn = ['add', 'edit', 'review', 'done'].includes(ankiView) ? 'decks' : ankiView;
      }
      ankiGo(view);
    });
    nav.appendChild(button);
  });
  const last = ankiUndoStack[ankiUndoStack.length - 1];
  const undoButton = ankiButton('anki-nav__undo', t('anki.undo'), ankiUndo, last ? t('anki.undoTitle', { what: t(`anki.what.${last.what}`) }) : '');
  undoButton.disabled = !last;
  nav.appendChild(undoButton);
}

/* ── Liste des paquets ─────────────────────────────────────── */

function renderAnkiDecks(main) {
  const card = ankiEl('div', 'anki-card');
  const head = ankiEl('div', 'anki-card__head');
  head.appendChild(ankiEl('h2', 'anki-title', t('anki.navDecks')));
  head.appendChild(ankiButton('anki-btn anki-btn--ghost', t('anki.newDeck'), ankiCreateDeckPrompt));
  card.appendChild(head);

  const decks = ankiSortedDecks();
  if (!decks.length) {
    card.appendChild(ankiEl('p', 'anki-muted', t('anki.noDecks')));
    const actions = ankiEl('div', 'anki-actions');
    actions.appendChild(ankiButton('anki-btn', t('anki.navImport'), () => ankiGo('import')));
    if (typeof isSyncEnabled === 'function' && isSyncEnabled()) {
      actions.appendChild(ankiButton('anki-btn anki-btn--ghost', t('anki.restoreLink'), () => ankiGo('restore')));
    }
    actions.appendChild(
      ankiButton('anki-btn anki-btn--ghost', t('anki.navAdd'), () => {
        ankiEditNoteId = null;
        ankiEditReturn = 'decks';
        ankiGo('add');
      })
    );
    card.appendChild(actions);
    main.appendChild(card);
    return;
  }

  const table = ankiEl('div', 'anki-decks');
  const header = ankiEl('div', 'anki-deck-row anki-deck-row--head');
  header.append(
    ankiEl('span', 'anki-deck-row__name', t('anki.deckName')),
    ankiEl('span', 'anki-count anki-count--new', t('anki.colNew')),
    ankiEl('span', 'anki-count anki-count--learn', t('anki.colLearn')),
    ankiEl('span', 'anki-count anki-count--review', t('anki.colDue')),
    ankiEl('span', 'anki-deck-row__menu', '')
  );
  table.appendChild(header);
  decks.forEach((deck) => {
    const counts = ankiQueue(deck.id).counts;
    const row = ankiEl('div', 'anki-deck-row');
    const name = ankiButton('anki-deck-row__name', ankiDeckShortName(deck), () => {
      ankiDeckId = deck.id;
      ankiGo('overview');
    });
    name.style.paddingLeft = `${0.5 + ankiDeckDepth(deck) * 1.1}rem`;
    const count = (value, kind) => ankiEl('span', `anki-count anki-count--${kind}${value ? '' : ' zero'}`, String(value));
    const menu = ankiEl('span', 'anki-deck-row__menu');
    menu.append(
      ankiButton('anki-icon-btn', '✎', () => ankiRenameDeckPrompt(deck), t('anki.renameDeck')),
      ankiButton('anki-icon-btn', '🗑', () => ankiDeleteDeck(deck), t('anki.deleteDeck'))
    );
    row.append(name, count(counts.new, 'new'), count(counts.learn, 'learn'), count(counts.review, 'review'), menu);
    table.appendChild(row);
  });
  card.appendChild(table);
  main.appendChild(card);
}

function ankiCleanDeckName(name) {
  return String(name || '')
    .split('::')
    .map((part) => part.trim())
    .filter(Boolean)
    .join('::');
}

function ankiCreateDeckPrompt() {
  const name = ankiCleanDeckName(window.prompt(t('anki.newDeckPrompt')));
  if (!name) return;
  if (ankiData().decks.some((deck) => deck.name === name)) {
    ankiStatus(t('anki.deckExists'), 'error');
    return;
  }
  const known = new Set(ankiData().decks.map((d) => d.id));
  ankiFindOrCreateDeck(name);
  ensureAnkiData(); // crée aussi les paquets parents
  const created = {};
  ankiData().decks.forEach((d) => {
    if (!known.has(d.id)) created[d.id] = null;
  });
  ankiPushUndo('deck', { decks: created });
  saveData();
  renderAnki();
}

function ankiRenameDeckPrompt(deck) {
  const name = ankiCleanDeckName(window.prompt(t('anki.renameDeckPrompt'), deck.name));
  if (!name || name === deck.name) return;
  if (ankiData().decks.some((d) => d.name === name)) {
    ankiStatus(t('anki.deckExists'), 'error');
    return;
  }
  const oldPrefix = `${deck.name}::`;
  const family = ankiData().decks.filter((d) => d.id === deck.id || d.name.startsWith(oldPrefix));
  const before = ankiCapture({ decks: family.map((d) => d.id) });
  family.forEach((d) => {
    d.name = d.id === deck.id ? name : `${name}::${d.name.slice(oldPrefix.length)}`;
  });
  const beforeIds = new Set(ankiData().decks.map((d) => d.id));
  ensureAnkiData(); // crée d'éventuels nouveaux parents
  ankiData().decks.forEach((d) => {
    if (!beforeIds.has(d.id)) before.decks[d.id] = null;
  });
  ankiPushUndo('deck', before);
  saveData();
  renderAnki();
}

function ankiDeleteDeck(deck) {
  const data = ankiData();
  const family = ankiDeckFamily(deck.id);
  const notes = data.notes.filter((note) => family.has(note.deckId));
  if (!window.confirm(t('anki.deleteDeckConfirm', { name: deck.name, count: notes.length }))) return;
  const noteIds = new Set(notes.map((note) => note.id));
  const cards = data.cards.filter((card) => noteIds.has(card.noteId));
  const cardIds = new Set(cards.map((card) => card.id));
  const logs = data.revlog.filter((log) => cardIds.has(log.c));
  const tags = data.tags.filter((tag) => family.has(tag.deckId));
  ankiPushUndo(
    'delete',
    ankiCapture({
      decks: Array.from(family),
      notes: Array.from(noteIds),
      cards: Array.from(cardIds),
      revlog: logs.map((log) => log.id),
      tags: tags.map((tag) => tag.id)
    })
  );
  data.decks = data.decks.filter((d) => !family.has(d.id));
  data.tags = data.tags.filter((tag) => !family.has(tag.deckId));
  ankiMarkDelete();
  data.notes = data.notes.filter((note) => !noteIds.has(note.id));
  data.cards = data.cards.filter((card) => !cardIds.has(card.id));
  data.revlog = data.revlog.filter((log) => !cardIds.has(log.c));
  if (family.has(ankiDeckId)) ankiDeckId = null;
  saveData();
  ankiGo('decks');
}

/* ── Aperçu d'un paquet ────────────────────────────────────── */

function renderAnkiCounts(container, counts) {
  const row = ankiEl('div', 'anki-counts');
  [
    ['new', 'anki.colNew'],
    ['learn', 'anki.colLearn'],
    ['review', 'anki.colDue']
  ].forEach(([kind, key]) => {
    const item = ankiEl('div', `anki-counts__item anki-count--${kind}`);
    item.append(ankiEl('strong', '', String(counts[kind])), ankiEl('span', '', t(key)));
    row.appendChild(item);
  });
  container.appendChild(row);
}

function renderAnkiOverview(main) {
  const deck = ankiGetDeck(ankiDeckId);
  if (!deck) {
    ankiView = 'decks';
    renderAnkiDecks(main);
    return;
  }
  const queue = ankiQueue(deck.id);
  const card = ankiEl('div', 'anki-card anki-overview');
  card.appendChild(ankiButton('anki-link', t('anki.backToDecks'), () => ankiGo('decks')));
  card.appendChild(ankiEl('h2', 'anki-title', deck.name.split('::').join(' › ')));
  renderAnkiCounts(card, queue.counts);
  const actions = ankiEl('div', 'anki-actions');
  const next = ankiPickNext(queue);
  if (next) {
    const study = ankiButton('anki-btn anki-btn--big', t('anki.study'), () => ankiStartReview(deck.id));
    actions.appendChild(study);
    requestAnimationFrame(() => study.focus());
  } else {
    card.appendChild(ankiEl('p', 'anki-muted', t('anki.overviewEmpty')));
    ankiAppendLearningInfo(card, queue);
  }
  ankiAppendMoreNew(card, deck.id, queue);
  if (deck.shuffle) card.appendChild(ankiEl('p', 'anki-muted', t('anki.shuffleOn')));
  actions.append(
    ankiButton('anki-btn anki-btn--ghost', t(deck.shuffle ? 'anki.shuffleAgain' : 'anki.shuffle'), () => {
      deck.shuffle = Date.now();
      saveData();
      renderAnki();
      ankiStatus(t('anki.shuffleOn'), 'success');
    }),
    ...(deck.shuffle
      ? [
          ankiButton('anki-btn anki-btn--ghost', t('anki.shuffleOff'), () => {
            delete deck.shuffle;
            saveData();
            renderAnki();
            ankiStatus(t('anki.shuffleOffDone'), 'success');
          })
        ]
      : []),
    ankiButton('anki-btn anki-btn--ghost', t('anki.navAdd'), () => {
      ankiEditNoteId = null;
      // Ajout depuis un paquet : ce paquet, sans le tag d'un autre.
      if (ankiAddDefaults.deckId !== deck.id) ankiAddDefaults = { ...ankiAddDefaults, deckId: deck.id, tagName: '' };
      ankiEditReturn = 'overview';
      ankiGo('add');
    }),
    ankiButton('anki-btn anki-btn--ghost', t('anki.navExport'), () => {
      ankiExportDeck = deck.id;
      ankiGo('export');
    }),
    ankiButton('anki-btn anki-btn--ghost', t('anki.navBrowse'), () => {
      ankiBrowseDeck = deck.id;
      ankiBrowseTag = '';
      ankiBrowseQuery = '';
      ankiGo('browse');
    })
  );
  card.appendChild(actions);
  main.appendChild(card);
}

function ankiAppendLearningInfo(container, queue) {
  if (queue.learningLater.length) {
    const wait = queue.learningLater[0].due - Date.now();
    container.appendChild(ankiEl('p', 'anki-muted', t('anki.doneLearning', { count: queue.learningLater.length, time: ankiFormatInterval(wait) })));
    container.appendChild(
      ankiButton('anki-btn anki-btn--ghost', t('anki.studyAhead'), () => {
        const card = ankiPickNext(ankiQueue(ankiDeckId), true);
        if (card) ankiShowCard(card);
      })
    );
  }
}

// Limite de nouvelles cartes atteinte : en ajouter pour aujourd'hui, dans ce paquet.
function ankiAppendMoreNew(container, deckId, queue) {
  const deck = ankiGetDeck(deckId);
  if (!deck || !queue.newWaiting) return;
  const box = ankiEl('div', 'anki-field');
  box.appendChild(ankiEl('span', 'anki-field__label', t('anki.moreNewLabel')));
  box.appendChild(ankiEl('p', 'anki-muted', t('anki.moreNewInfo', { left: queue.newWaiting })));
  const input = ankiEl('input');
  input.type = 'number';
  input.min = '1';
  input.max = String(queue.newWaiting);
  input.inputMode = 'numeric';
  input.value = String(Math.min(20, queue.newWaiting));
  const add = ankiButton('anki-btn', t('anki.moreNewButton'), () => {
    const count = Math.min(queue.newWaiting, Math.round(Number(input.value) || 0));
    if (count < 1) return;
    const dayStart = ankiDayStart();
    const same = deck.extraNew && deck.extraNew.day === dayStart ? Number(deck.extraNew.count) || 0 : 0;
    deck.extraNew = { day: dayStart, count: same + count };
    saveData();
    renderAnki();
    ankiStatus(t('anki.moreNewDone', { count }), 'success');
  });
  const row = ankiEl('div', 'anki-actions');
  row.append(input, add);
  box.appendChild(row);
  container.appendChild(box);
}

/* ── Révision ──────────────────────────────────────────────── */

function ankiStartReview(deckId) {
  ankiDeckId = deckId;
  ankiNextCard();
}

function ankiShowCard(card) {
  ankiCurrent = { cardId: card.id, shownAt: Date.now(), answerShown: false };
  ankiView = 'review';
  renderAnki();
}

function ankiNextCard() {
  const card = ankiPickNext(ankiQueue(ankiDeckId));
  if (card) {
    ankiShowCard(card);
  } else {
    ankiCurrent = null;
    ankiView = 'done';
    renderAnki();
  }
}

function ankiCurrentCard() {
  if (!ankiCurrent) return null;
  return ankiData().cards.find((card) => card.id === ankiCurrent.cardId) || null;
}

function renderAnkiReview(main) {
  const card = ankiCurrentCard();
  const note = card && ankiData().notes.find((n) => n.id === card.noteId);
  if (!card || !note || card.suspended) {
    ankiNextCard();
    return;
  }
  const queue = ankiQueue(ankiDeckId);
  const wrap = ankiEl('div', 'anki-review');
  const top = ankiEl('div', 'anki-review__top');
  top.appendChild(ankiButton('anki-link', t('anki.backToDecks'), () => ankiGo('overview')));
  const counts = ankiEl('div', 'anki-review__counts');
  const kind = card.state === ANKI_STATE.NEW ? 'new' : card.state === ANKI_STATE.REVIEW ? 'review' : 'learn';
  [
    ['new', queue.counts.new],
    ['learn', queue.counts.learn],
    ['review', queue.counts.review]
  ].forEach(([k, value]) => {
    counts.appendChild(ankiEl('span', `anki-count anki-count--${k}${k === kind ? ' current' : ''}`, String(value)));
  });
  top.appendChild(counts);
  wrap.appendChild(top);

  const sides = ankiCardSides(card, note);
  const deckOfNote = ankiGetDeck(note.deckId);
  const where = [deckOfNote ? deckOfNote.name.split('::').join(' › ') : '', ankiTagName(note)].filter(Boolean).join(' · ');
  if (where) wrap.appendChild(ankiEl('p', 'anki-review__where', where));
  if (note.unsure) wrap.appendChild(ankiEl('p', 'anki-unsure-banner', t('anki.unsureReview')));
  const face = ankiEl('div', 'anki-face');
  face.innerHTML = ankiCurrent.answerShown ? sides.answer : sides.question;
  wrap.appendChild(face);

  const bar = ankiEl('div', 'anki-answer-bar');
  if (!ankiCurrent.answerShown) {
    const show = ankiButton('anki-btn anki-btn--big anki-show', t('anki.showAnswer'), ankiRevealAnswer, 'Espace');
    bar.appendChild(show);
    requestAnimationFrame(() => show.focus({ preventScroll: true }));
  } else {
    const preview = ankiScheduler().repeat(ankiToFsrs(card), new Date());
    const now = Date.now();
    [
      [1, 'again'],
      [2, 'hard'],
      [3, 'good'],
      [4, 'easy']
    ].forEach(([rating, key]) => {
      const due = new Date(preview[rating].card.due).getTime();
      const button = ankiButton(`anki-grade anki-grade--${key}`, '', () => ankiAnswer(rating), `${rating}`);
      button.append(ankiEl('span', 'anki-grade__time', ankiFormatInterval(due - now)), ankiEl('span', 'anki-grade__label', t(`anki.${key}`)));
      bar.appendChild(button);
    });
    const sep = face.querySelector('.anki-sep');
    if (sep && sep.scrollIntoView) requestAnimationFrame(() => sep.scrollIntoView({ block: 'nearest' }));
  }
  wrap.appendChild(bar);

  const tools = ankiEl('div', 'anki-review__tools');
  tools.append(
    ankiButton('anki-link', t('anki.editCard'), () => ankiEditNote(note.id, 'review'), 'E'),
    ankiButton('anki-link', t(note.unsure ? 'anki.unsureRemove' : 'anki.unsureMark'), () => ankiToggleUnsure(note.id), 'C'),
    ankiButton('anki-link', t('anki.suspendCard'), () => ankiToggleSuspend([card.id], true)),
    ankiButton('anki-link', t('anki.deleteNote'), () => ankiDeleteNote(note.id))
  );
  // Sur téléphone, pas de Ctrl+Z : bouton d'annulation à portée de pouce.
  if (ankiUndoStack.length) tools.appendChild(ankiButton('anki-link', t('anki.undo'), ankiUndo));
  wrap.appendChild(tools);
  wrap.appendChild(ankiEl('p', 'anki-hint', t('anki.keyboardHelp')));
  main.appendChild(wrap);
}

function ankiRevealAnswer() {
  if (!ankiCurrent || ankiCurrent.answerShown) return;
  ankiCurrent.answerShown = true;
  renderAnki();
}

function ankiAnswer(rating) {
  const card = ankiCurrentCard();
  if (!card || !ankiCurrent.answerShown) return;
  const now = Date.now();
  const log = {
    id: uid(),
    c: card.id,
    r: rating,
    t: now,
    s: card.state,
    ms: Math.min(ANKI_MAX_ANSWER_MS, Math.max(0, now - ankiCurrent.shownAt))
  };
  const before = ankiCapture({ cards: [card.id], revlog: [log.id] });
  const result = ankiScheduler().next(ankiToFsrs(card), new Date(now), rating);
  log.iv = result.card.scheduled_days;
  ankiData().revlog.push(log);
  ankiWriteCardState(card, result.card, log.id);
  ankiPushUndo('review', before, { cardId: card.id, deckId: ankiDeckId });
  saveData();
  ankiNextCard();
}

function renderAnkiDone(main) {
  const queue = ankiQueue(ankiDeckId);
  const next = ankiPickNext(queue);
  if (next) {
    ankiShowCard(next);
    return;
  }
  const card = ankiEl('div', 'anki-card anki-done');
  card.appendChild(ankiEl('h2', 'anki-title', t('anki.doneTitle')));
  ankiAppendLearningInfo(card, queue);
  ankiAppendMoreNew(card, ankiDeckId, queue);
  const tomorrowEnd = ankiAddDays(ankiDayEnd(), 1);
  const family = ankiDeckId ? ankiDeckFamily(ankiDeckId) : null;
  const notes = ankiNoteMap();
  const tomorrow = ankiData().cards.filter((c) => {
    const note = notes.get(c.noteId);
    return !c.suspended && note && (!family || family.has(note.deckId)) && c.state !== ANKI_STATE.NEW && c.due < tomorrowEnd && c.due >= ankiDayEnd();
  }).length;
  card.appendChild(ankiEl('p', 'anki-muted', t('anki.doneTomorrow', { count: tomorrow })));
  card.appendChild(ankiButton('anki-btn', t('anki.backToDecks'), () => ankiGo('decks')));
  main.appendChild(card);
}

function ankiToggleUnsure(noteId) {
  const note = ankiData().notes.find((n) => n.id === noteId);
  if (!note) return;
  ankiPushUndo('unsure', ankiCapture({ notes: [noteId] }));
  if (note.unsure) delete note.unsure;
  else note.unsure = true;
  note.updated = Date.now();
  saveData();
  renderAnki();
  ankiStatus(t(note.unsure ? 'anki.unsureMarked' : 'anki.unsureCleared'), 'success');
}

function ankiToggleSuspend(cardIds, suspend) {
  const ids = new Set(cardIds);
  ankiPushUndo('suspend', ankiCapture({ cards: cardIds }));
  ankiData().cards.forEach((card) => {
    if (ids.has(card.id)) card.suspended = suspend;
  });
  saveData();
  if (ankiView === 'review') ankiNextCard();
  else renderAnki();
}

// Hors révision : renderAnki() ne vide pas un formulaire en cours de saisie.
function ankiUnsuspend(cardIds) {
  ankiToggleSuspend(cardIds, false);
  ankiStatus(t('anki.unsuspendedStatus', { count: cardIds.length }), 'success');
}

function ankiDeleteNote(noteId) {
  const data = ankiData();
  const cards = data.cards.filter((card) => card.noteId === noteId);
  if (!window.confirm(t('anki.deleteNoteConfirm', { count: cards.length }))) return;
  const cardIds = new Set(cards.map((card) => card.id));
  const logs = data.revlog.filter((log) => cardIds.has(log.c));
  ankiPushUndo('delete', ankiCapture({ notes: [noteId], cards: Array.from(cardIds), revlog: logs.map((log) => log.id) }));
  data.notes = data.notes.filter((note) => note.id !== noteId);
  ankiMarkDelete();
  data.cards = data.cards.filter((card) => !cardIds.has(card.id));
  data.revlog = data.revlog.filter((log) => !cardIds.has(log.c));
  saveData();
  if (ankiView === 'review') ankiNextCard();
  else if (ankiView === 'edit') ankiGo(ankiEditReturn === 'review' ? 'overview' : ankiEditReturn);
  else renderAnki();
}

/* ── Ajout / modification ──────────────────────────────────── */

function ankiEditNote(noteId, returnView) {
  ankiEditNoteId = noteId;
  ankiEditReturn = returnView;
  ankiGo('edit');
}

function ankiFieldDefs(type) {
  return type === 'cloze'
    ? [
        ['text', 'anki.fieldText'],
        ['extra', 'anki.fieldExtra']
      ]
    : [
        ['front', 'anki.fieldFront'],
        ['back', 'anki.fieldBack']
      ];
}

function ankiConvertFields(fields, fromType, toType) {
  const fromCloze = fromType === 'cloze';
  const toCloze = toType === 'cloze';
  if (fromCloze === toCloze) return { ...fields };
  return toCloze ? { text: fields.front || '', extra: fields.back || '' } : { front: fields.text || '', back: fields.extra || '' };
}

function ankiInsertCloze(editor) {
  const text = editor.innerHTML;
  const numbers = ankiClozeNumbers(text);
  const next = numbers.length ? numbers[numbers.length - 1] + 1 : 1;
  editor.focus();
  const selection = window.getSelection();
  const selected = selection && selection.rangeCount ? selection.toString() : '';
  if (selected) {
    const range = selection.getRangeAt(0);
    const container = document.createElement('div');
    container.appendChild(range.cloneContents());
    document.execCommand('insertHTML', false, `{{c${next}::${container.innerHTML}}}`);
  } else {
    document.execCommand('insertText', false, `{{c${next}::}}`);
    const sel = window.getSelection();
    if (sel && sel.rangeCount) {
      const range = sel.getRangeAt(0);
      if (range.startContainer.nodeType === Node.TEXT_NODE && range.startOffset >= 2) {
        range.setStart(range.startContainer, range.startOffset - 2);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }
}

function ankiMakeEditor(value, label) {
  const field = ankiEl('div', 'anki-field');
  field.appendChild(ankiEl('label', 'anki-field__label', t(label)));
  const editor = ankiEl('div', 'anki-editor');
  editor.contentEditable = 'true';
  editor.setAttribute('role', 'textbox');
  editor.setAttribute('aria-multiline', 'true');
  editor.setAttribute('aria-label', t(label));
  editor.innerHTML = ankiSanitize(value || '');
  editor.addEventListener('paste', (event) => {
    const clipboard = event.clipboardData;
    if (!clipboard) return;
    event.preventDefault();
    const html = clipboard.getData('text/html');
    if (html) {
      document.execCommand('insertHTML', false, ankiSanitize(html));
    } else {
      document.execCommand('insertText', false, clipboard.getData('text/plain'));
    }
  });
  field.appendChild(editor);
  return { field, editor };
}

function renderAnkiEditor(main) {
  const data = ankiData();
  const editing = ankiView === 'edit' ? data.notes.find((note) => note.id === ankiEditNoteId) : null;
  if (ankiView === 'edit' && !editing) {
    ankiView = 'browse';
    renderAnkiBrowse(main);
    return;
  }
  let type = editing ? editing.type : ankiAddDefaults.type;
  let fields = editing ? { ...editing.fields } : {};
  if (!editing && ankiAddPrefill) {
    // Texte à trous : la sélection devient le texte, le titre le complément.
    fields = type === 'cloze' ? { text: ankiAddPrefill.back, extra: ankiAddPrefill.front } : { front: ankiAddPrefill.front, back: ankiAddPrefill.back };
    ankiAddPrefill = null;
  }
  // Aucun paquet imposé : seulement celui de la note qu'on vient d'ajouter
  // (ou du paquet depuis lequel on a cliqué « Ajouter »).
  const deckFallback = ankiGetDeck(ankiAddDefaults.deckId);

  const form = ankiEl('form', 'anki-card anki-form');
  form.noValidate = true;
  form.appendChild(ankiEl('h2', 'anki-title', t(editing ? 'anki.editTitle' : 'anki.addTitle')));

  const row = ankiEl('div', 'anki-form__row');
  const typeLabel = ankiEl('label', 'anki-inline');
  typeLabel.appendChild(ankiEl('span', '', t('anki.noteType')));
  const typeSelect = ankiEl('select');
  [
    ['basic', 'anki.typeBasic'],
    ['reversed', 'anki.typeReversed'],
    ['cloze', 'anki.typeCloze']
  ].forEach(([value, key]) => {
    const option = ankiEl('option', '', t(key));
    option.value = value;
    typeSelect.appendChild(option);
  });
  typeSelect.value = type;
  typeLabel.appendChild(typeSelect);

  const deckLabel = ankiEl('label', 'anki-inline');
  deckLabel.appendChild(ankiEl('span', '', t('anki.deckName')));
  const deckSelect = ankiEl('select');
  if (!editing) {
    const choose = ankiEl('option', '', t('anki.deckChoose'));
    choose.value = '';
    deckSelect.appendChild(choose);
  }
  ankiSortedDecks().forEach((deck) => {
    const option = ankiEl('option', '', deck.name);
    option.value = deck.id;
    deckSelect.appendChild(option);
  });
  const newDeckOption = ankiEl('option', '', t('anki.importNewDeck'));
  newDeckOption.value = '__new__';
  deckSelect.appendChild(newDeckOption);
  deckSelect.value = editing ? editing.deckId : deckFallback ? deckFallback.id : '';
  deckSelect.addEventListener('change', () => {
    if (deckSelect.value !== '__new__') return;
    const name = ankiCleanDeckName(window.prompt(t('anki.newDeckPrompt')));
    if (!name) {
      deckSelect.value = editing ? editing.deckId : deckFallback ? deckFallback.id : '';
      return;
    }
    const option = ankiEl('option', '', name);
    option.value = `__name__${name}`;
    deckSelect.insertBefore(option, newDeckOption);
    deckSelect.value = option.value;
  });
  deckLabel.appendChild(deckSelect);
  row.append(typeLabel, deckLabel);
  form.appendChild(row);

  const toolbar = ankiEl('div', 'anki-toolbar');
  const fieldsBox = ankiEl('div', 'anki-fields');
  let editors = {};
  let lastEditor = null;
  const command = (name) => () => {
    (lastEditor || Object.values(editors)[0]).focus();
    document.execCommand(name, false, null);
  };
  toolbar.append(
    ankiButton('anki-tool', 'B', command('bold'), t('anki.bold')),
    ankiButton('anki-tool anki-tool--i', 'I', command('italic'), t('anki.italic')),
    ankiButton('anki-tool anki-tool--u', 'U', command('underline'), t('anki.underline')),
    ankiButton('anki-tool', '•', command('insertUnorderedList'), t('anki.bullets')),
    ankiButton('anki-tool', '1.', command('insertOrderedList'), t('anki.numbers')),
    ankiButton('anki-tool', '⌫', command('removeFormat'), t('anki.clearFormat'))
  );
  const clozeButton = ankiButton('anki-tool anki-tool--cloze', t('anki.clozeButton'), () => ankiInsertCloze(editors.text), t('anki.clozeTitle'));
  toolbar.appendChild(clozeButton);
  form.appendChild(toolbar);
  const clozeHelp = ankiEl('p', 'anki-hint', t('anki.clozeHelp'));
  form.appendChild(clozeHelp);
  form.appendChild(fieldsBox);

  const readFields = () => {
    const values = {};
    Object.keys(editors).forEach((key) => {
      values[key] = ankiSanitize(editors[key].innerHTML).replace(/^(<br>)+|(<br>)+$/g, '');
    });
    return values;
  };
  const buildFields = () => {
    fieldsBox.innerHTML = '';
    editors = {};
    ankiFieldDefs(type).forEach(([key, label]) => {
      const { field, editor } = ankiMakeEditor(fields[key], label);
      editor.addEventListener('focus', () => {
        lastEditor = editor;
      });
      editors[key] = editor;
      fieldsBox.appendChild(field);
    });
    clozeButton.hidden = type !== 'cloze';
    clozeHelp.hidden = type !== 'cloze';
  };
  buildFields();
  typeSelect.addEventListener('change', () => {
    const current = readFields();
    fields = ankiConvertFields(current, type, typeSelect.value);
    type = typeSelect.value;
    buildFields();
  });

  const tagLabel = ankiEl('label', 'anki-field');
  tagLabel.appendChild(ankiEl('span', 'anki-field__label', t('anki.fieldTag')));
  const tagInput = ankiEl('input', 'anki-input anki-part-input');
  tagInput.type = 'text';
  tagInput.placeholder = t('anki.tagPlaceholder');
  tagInput.value = editing ? ankiTagName(editing) : ankiAddDefaults.tagName;
  const tagList = ankiEl('datalist');
  tagList.id = 'anki-tag-list';
  tagInput.setAttribute('list', tagList.id);
  const fillTags = () => {
    tagList.innerHTML = '';
    const deckId = deckSelect.value.startsWith('__') ? null : deckSelect.value;
    if (!deckId) return;
    ankiTagsIn(deckId).forEach((tag) => {
      const option = ankiEl('option');
      option.value = tag.name;
      tagList.appendChild(option);
    });
  };
  fillTags();
  deckSelect.addEventListener('change', () => {
    fillTags();
    // Tag d'un autre paquet : on ne le recrée pas en douce dans celui-ci.
    const deckId = deckSelect.value.startsWith('__') ? null : deckSelect.value;
    if (tagInput.value && !(deckId && ankiFindTag(deckId, tagInput.value))) tagInput.value = '';
  });
  tagLabel.append(tagInput, tagList, ankiEl('span', 'anki-hint', t('anki.tagHelp')));
  form.appendChild(tagLabel);
  const unsureLabel = ankiEl('label', 'anki-unsure-field');
  const unsureInput = ankiEl('input');
  unsureInput.type = 'checkbox';
  unsureInput.checked = Boolean(editing && editing.unsure);
  unsureLabel.append(unsureInput, ankiEl('span', '', t('anki.unsureField')));
  form.appendChild(unsureLabel);

  const message = ankiEl('p', 'anki-form__message');
  message.setAttribute('aria-live', 'polite');
  form.appendChild(message);

  const actions = ankiEl('div', 'anki-actions');
  const submit = ankiEl('button', 'anki-btn', t(editing ? 'anki.saveButton' : 'anki.addButton'));
  submit.type = 'submit';
  actions.appendChild(submit);
  actions.appendChild(
    ankiButton('anki-btn anki-btn--ghost', t('anki.cancel'), () => {
      ankiView = ankiEditReturn || 'decks';
      if (ankiView === 'review' && ankiCurrent) ankiCurrent.answerShown = true;
      renderAnki(true);
    })
  );
  if (editing) {
    const suspendedIds = ankiData()
      .cards.filter((c) => c.noteId === editing.id && c.suspended)
      .map((c) => c.id);
    if (suspendedIds.length) {
      const unsuspend = ankiButton('anki-btn anki-btn--ghost', t('anki.unsuspendCard'), () => {
        ankiUnsuspend(suspendedIds);
        unsuspend.remove();
      });
      actions.appendChild(unsuspend);
    }
    actions.appendChild(ankiButton('anki-btn anki-btn--danger', t('anki.deleteNote'), () => ankiDeleteNote(editing.id)));
  }
  form.appendChild(actions);

  form.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      form.requestSubmit();
    } else if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'c' && type === 'cloze') {
      event.preventDefault();
      ankiInsertCloze(editors.text);
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const values = readFields();
    const firstKey = type === 'cloze' ? 'text' : 'front';
    if (!ankiPlainText(values[firstKey]) && !/<img/i.test(values[firstKey])) {
      message.textContent = t('anki.emptyFront');
      message.className = 'anki-form__message error';
      return;
    }
    if (type === 'cloze' && !ankiClozeNumbers(values.text).length) {
      message.textContent = t('anki.noCloze');
      message.className = 'anki-form__message error';
      return;
    }
    let deckId = deckSelect.value;
    if (!deckId) {
      message.textContent = t('anki.deckRequired');
      message.className = 'anki-form__message error';
      deckSelect.focus();
      return;
    }
    const createdDecks = [];
    if (deckId.startsWith('__name__') || deckId === '__new__' || !deckId) {
      const known = new Set(data.decks.map((d) => d.id));
      deckId = ankiFindOrCreateDeck(deckId.startsWith('__name__') ? deckId.slice(8) : '').id;
      ensureAnkiData();
      data.decks.forEach((d) => {
        if (!known.has(d.id)) createdDecks.push(d.id);
      });
    }
    const knownTags = new Set(data.tags.map((tag) => tag.id));
    const tag = ankiFindOrCreateTag(deckId, tagInput.value);
    const createdTags = tag && !knownTags.has(tag.id) ? [tag.id] : [];
    const plainFront = ankiNormalize(ankiPlainText(values[firstKey]));
    const duplicate = data.notes.some(
      (note) => note.id !== (editing && editing.id) && note.type === type && ankiNormalize(ankiPlainText(note.fields[firstKey])) === plainFront
    );

    if (editing) {
      const cardIds = data.cards.filter((card) => card.noteId === editing.id).map((card) => card.id);
      const logIds = data.revlog.filter((log) => cardIds.includes(log.c)).map((log) => log.id);
      const before = ankiCapture({ notes: [editing.id], cards: cardIds, revlog: logIds, decks: [] });
      createdDecks.forEach((id) => {
        before.decks = before.decks || {};
        before.decks[id] = null;
      });
      createdTags.forEach((id) => {
        before.tags = before.tags || {};
        before.tags[id] = null;
      });
      editing.type = type;
      editing.fields = values;
      editing.deckId = deckId;
      editing.tagId = tag ? tag.id : null;
      if (unsureInput.checked) editing.unsure = true;
      else delete editing.unsure;
      editing.updated = Date.now();
      const { added } = ankiSyncNoteCards(editing);
      before.cards = before.cards || {};
      added.forEach((id) => {
        before.cards[id] = null;
      });
      ankiPushUndo('edit', before);
      saveData();
      ankiStatus(t('anki.saved'), 'success');
      ankiView = ankiEditReturn || 'browse';
      if (ankiView === 'review' && ankiCurrent) ankiCurrent.answerShown = true;
      renderAnki(true);
      return;
    }

    const now = Date.now();
    const note = { id: uid(), guid: uid(), deckId, type, fields: values, tags: [], tagId: tag ? tag.id : null, created: now, updated: now };
    if (unsureInput.checked) note.unsure = true;
    data.notes.push(note);
    const { added } = ankiSyncNoteCards(note, now);
    const before = { notes: { [note.id]: null }, cards: {} };
    added.forEach((id) => {
      before.cards[id] = null;
    });
    if (createdDecks.length) {
      before.decks = {};
      createdDecks.forEach((id) => {
        before.decks[id] = null;
      });
    }
    if (createdTags.length) before.tags = { [createdTags[0]]: null };
    ankiPushUndo('add', before);
    ankiAddDefaults = { type, deckId, tagName: tag ? tag.name : '' };
    saveData();
    renderAnkiNav();
    fields = {};
    buildFields();
    fillTags();
    unsureInput.checked = false;
    // Le paquet créé à la volée devient une vraie option.
    if (createdDecks.length) {
      Array.from(deckSelect.options)
        .filter((option) => option.value.startsWith('__name__'))
        .forEach((option) => {
          option.value = deckId;
        });
      deckSelect.value = deckId;
    }
    message.textContent = `${t('anki.added', { count: added.length })}${duplicate ? ` ${t('anki.duplicate')}` : ''}`;
    message.className = `anki-form__message ${duplicate ? 'warn' : 'success'}`;
    editors[firstKey].focus();
  });

  main.appendChild(form);
  requestAnimationFrame(() => {
    const first = Object.values(editors)[0];
    if (first) first.focus();
  });
}

/* ── Parcourir ─────────────────────────────────────────────── */

function ankiParseQuery(query) {
  const tokens = [];
  const re = /(-?)(?:(\w+):)?(?:"([^"]*)"|(\S+))/g;
  let match;
  while ((match = re.exec(String(query || '')))) {
    tokens.push({ negate: match[1] === '-', key: (match[2] || '').toLowerCase(), value: match[3] !== undefined ? match[3] : match[4] });
  }
  return tokens;
}

function ankiSearchCards(query) {
  const data = ankiData();
  const notes = ankiNoteMap();
  const decks = new Map(data.decks.map((deck) => [deck.id, deck]));
  const now = Date.now();
  const dayEnd = ankiDayEnd(now);
  const textCache = new Map();
  const noteText = (note) => {
    if (!textCache.has(note.id)) {
      textCache.set(note.id, ankiNormalize(Object.values(note.fields || {}).map(ankiPlainText).join(' ')));
    }
    return textCache.get(note.id);
  };
  const tests = ankiParseQuery(query).map(({ negate, key, value }) => {
    const v = ankiNormalize(value);
    let test;
    if (key === 'deck') {
      test = (card, note) => {
        const deck = decks.get(note.deckId);
        const name = deck ? ankiNormalize(deck.name) : '';
        return name === v || name.startsWith(`${v}::`) || (v.endsWith('*') && name.startsWith(v.slice(0, -1)));
      };
    } else if (key === 'tag') {
      test = (card, note) => ankiNormalize(ankiTagName(note)).includes(v.replace(/\*$/, ''));
    } else if (key === 'added') {
      // Comme Anki : added:1 = aujourd'hui, added:2 = depuis hier…
      const since = ankiAddDays(ankiDayStart(now), -(Math.max(1, parseInt(value, 10) || 1) - 1));
      test = (card, note) => (note.created || card.created || 0) >= since;
    } else if (key === 'is') {
      test = (card, note) =>
        ({
          unconfirmed: Boolean(note.unsure),
          aconfirmer: Boolean(note.unsure),
          new: card.state === ANKI_STATE.NEW,
          learn: card.state === ANKI_STATE.LEARNING || card.state === ANKI_STATE.RELEARNING,
          review: card.state === ANKI_STATE.REVIEW,
          due: card.state !== ANKI_STATE.NEW && card.due < dayEnd,
          suspended: Boolean(card.suspended)
        })[v] || false;
    } else {
      const needle = key ? ankiNormalize(`${key}:${value}`) : v;
      test = (card, note) => noteText(note).includes(needle);
    }
    return negate ? (card, note) => !test(card, note) : test;
  });
  return data.cards
    .filter((card) => {
      const note = notes.get(card.noteId);
      return note && tests.every((test) => test(card, note));
    })
    .sort((a, b) => a.created - b.created || a.ord - b.ord);
}

function renderAnkiBrowse(main) {
  if (ankiBrowseDeck && !ankiGetDeck(ankiBrowseDeck)) ankiBrowseDeck = '';
  const card = ankiEl('div', 'anki-card');
  card.appendChild(ankiEl('h2', 'anki-title', t('anki.navBrowse')));

  const filters = ankiEl('div', 'anki-filters');
  const deckSelect = ankiEl('select', 'anki-filter');
  deckSelect.setAttribute('aria-label', t('anki.deckName'));
  const allDecks = ankiEl('option', '', t('anki.allDecks'));
  allDecks.value = '';
  deckSelect.appendChild(allDecks);
  ankiSortedDecks().forEach((deck) => {
    const option = ankiEl('option', '', `${'  '.repeat(ankiDeckDepth(deck))}${ankiDeckShortName(deck)}`);
    option.value = deck.id;
    deckSelect.appendChild(option);
  });
  deckSelect.value = ankiBrowseDeck;

  const tagSelect = ankiEl('select', 'anki-filter');
  tagSelect.setAttribute('aria-label', t('anki.colTag'));
  const search = ankiEl('input', 'anki-input anki-search');
  search.type = 'search';
  search.placeholder = t('anki.searchPlaceholder');
  search.value = ankiBrowseQuery;
  filters.append(deckSelect, tagSelect, search);
  card.appendChild(filters);

  const infoRow = ankiEl('div', 'anki-browse__info');
  const info = ankiEl('p', 'anki-muted');
  const renameSlot = ankiEl('span');
  infoRow.append(info, renameSlot);
  card.appendChild(infoRow);
  const bulkBar = ankiEl('div', 'anki-bulk');
  bulkBar.hidden = true;
  card.appendChild(bulkBar);
  const list = ankiEl('div', 'anki-browse');
  let rowBoxes = [];
  let updateSelection = () => {};
  card.appendChild(list);
  main.appendChild(card);

  const notes = ankiNoteMap();
  const decks = new Map(ankiData().decks.map((deck) => [deck.id, deck]));

  const fillTags = () => {
    const family = ankiBrowseDeck ? ankiDeckFamily(ankiBrowseDeck) : null;
    const hasNoTag = ankiData().notes.some((note) => !note.tagId && (!family || family.has(note.deckId)));
    tagSelect.innerHTML = '';
    const all = ankiEl('option', '', t('anki.allTags'));
    all.value = '';
    tagSelect.appendChild(all);
    ankiTagsIn(ankiBrowseDeck).forEach((tag) => {
      const option = ankiEl('option', '', tag.name);
      option.value = tag.id;
      tagSelect.appendChild(option);
    });
    if (hasNoTag) {
      const none = ankiEl('option', '', t('anki.noTag'));
      none.value = ANKI_NO_TAG;
      tagSelect.appendChild(none);
    }
    if (ankiBrowseTag && !Array.from(tagSelect.options).some((option) => option.value === ankiBrowseTag)) ankiBrowseTag = '';
    tagSelect.value = ankiBrowseTag;
  };

  const draw = () => {
    const family = ankiBrowseDeck ? ankiDeckFamily(ankiBrowseDeck) : null;
    const results = ankiSearchCards(ankiBrowseQuery).filter((c) => {
      const note = notes.get(c.noteId);
      if (family && !family.has(note.deckId)) return false;
      if (ankiBrowseTag === ANKI_NO_TAG) return !note.tagId;
      return !ankiBrowseTag || note.tagId === ankiBrowseTag;
    });
    info.textContent = t('anki.resultsCount', { count: results.length });

    renameSlot.innerHTML = '';
    if (ankiBrowseTag && ankiBrowseTag !== ANKI_NO_TAG) {
      renameSlot.appendChild(
        ankiButton('anki-link', t('anki.renameTag'), () => {
          const tag = ankiGetTag(ankiBrowseTag);
          if (!tag) return;
          const name = window.prompt(t('anki.renameTagPrompt', { name: tag.name, count: ankiTagNoteCount(tag.id) }), tag.name);
          if (name !== null && ankiRenameTag(tag.id, name)) renderAnki(true);
        })
      );
    }
    const visibleNotes = new Set(results.map((c) => c.noteId));
    Array.from(ankiBrowseSelected).forEach((id) => {
      if (!visibleNotes.has(id)) ankiBrowseSelected.delete(id);
    });
    ankiBrowseLastIndex = null;

    list.innerHTML = '';
    const head = ankiEl('div', 'anki-browse__row anki-browse__row--head');
    const headCheck = ankiEl('label', 'anki-browse__check');
    const headBox = ankiEl('input');
    headBox.type = 'checkbox';
    headBox.title = t('anki.selectAll');
    headBox.setAttribute('aria-label', t('anki.selectAll'));
    headBox.addEventListener('change', () => {
      if (headBox.checked) visibleNotes.forEach((id) => ankiBrowseSelected.add(id));
      else ankiBrowseSelected.clear();
      updateSelection();
    });
    headCheck.appendChild(headBox);
    head.appendChild(headCheck);
    ['colQuestion', 'colTag', 'colDeck', 'colDueDate', 'colInterval', 'colReviews'].forEach((key) => head.appendChild(ankiEl('span', '', t(`anki.${key}`))));
    list.appendChild(head);
    const shown = results.slice(0, ankiBrowseLimit);
    rowBoxes = [];
    shown.forEach((c, index) => {
      const note = notes.get(c.noteId);
      const tagName = ankiTagName(note);
      const row = ankiEl('div', `anki-browse__row${c.suspended ? ' suspended' : ''}`);
      row.tabIndex = 0;
      const check = ankiEl('label', 'anki-browse__check');
      const box = ankiEl('input');
      box.type = 'checkbox';
      box.setAttribute('aria-label', t('anki.selectCard'));
      row.addEventListener('click', (event) => {
        if (event.target.closest('.anki-browse__check')) return;
        ankiEditNote(note.id, 'browse');
      });
      row.addEventListener('keydown', (event) => {
        if (event.target !== row) return;
        if (event.key === 'Enter') ankiEditNote(note.id, 'browse');
        if (event.key === ' ') {
          event.preventDefault();
          box.click();
        }
      });
      // Maj+clic : coche ou décoche toute la plage depuis le dernier clic.
      box.addEventListener('click', (event) => {
        const checked = box.checked;
        const range = event.shiftKey && ankiBrowseLastIndex !== null;
        const from = range ? Math.min(ankiBrowseLastIndex, index) : index;
        const to = range ? Math.max(ankiBrowseLastIndex, index) : index;
        for (let i = from; i <= to; i += 1) {
          if (checked) ankiBrowseSelected.add(shown[i].noteId);
          else ankiBrowseSelected.delete(shown[i].noteId);
        }
        ankiBrowseLastIndex = index;
        updateSelection();
      });
      check.appendChild(box);
      rowBoxes.push({ box, row, noteId: c.noteId });
      const question = ankiPlainText(ankiCardSides(c, note).question) || '—';
      let dueText;
      if (c.suspended) dueText = t('anki.suspended');
      else if (c.state === ANKI_STATE.NEW) dueText = t('anki.stateNew');
      else if (c.state !== ANKI_STATE.REVIEW) dueText = t('anki.stateLearning');
      else dueText = ankiFormatDate(c.due);
      const deck = decks.get(note.deckId);
      const questionCell = ankiEl('span', 'anki-browse__q');
      questionCell.appendChild(ankiEl('span', 'anki-browse__qtext', question.length > 140 ? `${question.slice(0, 140)}…` : question));
      if (tagName || note.unsure) {
        const meta = ankiEl('span', 'anki-browse__meta');
        if (tagName) meta.appendChild(ankiEl('span', 'anki-part anki-part--inline', tagName));
        if (note.unsure) meta.appendChild(ankiEl('span', 'anki-unsure-badge', t('anki.unsureBadge')));
        questionCell.appendChild(meta);
      }
      row.append(
        check,
        questionCell,
        ankiEl('span', 'anki-browse__part', tagName || '—'),
        ankiEl('span', 'anki-browse__deck', deck ? deck.name : ''),
        ankiEl('span', '', dueText),
        ankiEl('span', '', c.state === ANKI_STATE.REVIEW ? ankiFormatInterval(c.scheduled_days * 86400000) : '—'),
        ankiEl('span', '', `${c.reps || 0} / ${c.lapses || 0}`)
      );
      list.appendChild(row);
    });
    if (results.length > ankiBrowseLimit) {
      list.appendChild(
        ankiButton('anki-btn anki-btn--ghost', t('anki.showMore'), () => {
          ankiBrowseLimit += ANKI_BROWSE_PAGE;
          draw();
        })
      );
    }
    updateSelection = () => {
      const count = ankiBrowseSelected.size;
      rowBoxes.forEach((item) => {
        item.box.checked = ankiBrowseSelected.has(item.noteId);
        item.row.classList.toggle('is-selected', item.box.checked);
      });
      headBox.checked = count > 0 && count === visibleNotes.size;
      headBox.indeterminate = count > 0 && count < visibleNotes.size;
      renderBulk();
    };
    updateSelection();
  };

  // Barre d'actions sur la sélection : changer le paquet et/ou le tag.
  let bulkBuilt = false;
  let unsuspendBtn = null;
  let suspendBtn = null;
  const selectedCards = (suspended) =>
    ankiData()
      .cards.filter((c) => Boolean(c.suspended) === suspended && ankiBrowseSelected.has(c.noteId))
      .map((c) => c.id);
  const selectedSuspended = () => selectedCards(true);
  const showSuspendButtons = () => {
    unsuspendBtn.hidden = !selectedSuspended().length;
    suspendBtn.hidden = !selectedCards(false).length;
  };
  const renderBulk = () => {
    const count = ankiBrowseSelected.size;
    bulkBar.hidden = count === 0;
    if (!count) {
      bulkBuilt = false;
      return;
    }
    if (bulkBuilt) {
      bulkBar.querySelector('.anki-bulk__count').textContent = t('anki.bulkSelected', { count });
      showSuspendButtons();
      return;
    }
    bulkBuilt = true;
    bulkBar.innerHTML = '';
    const countEl = ankiEl('strong', 'anki-bulk__count', t('anki.bulkSelected', { count }));
    const deckSel = ankiEl('select', 'anki-filter');
    deckSel.setAttribute('aria-label', t('anki.deckName'));
    const keepDeck = ankiEl('option', '', t('anki.bulkDeckKeep'));
    keepDeck.value = '';
    deckSel.appendChild(keepDeck);
    ankiSortedDecks().forEach((deck) => {
      const option = ankiEl('option', '', deck.name);
      option.value = deck.id;
      deckSel.appendChild(option);
    });
    const tagSel = ankiEl('select', 'anki-filter');
    tagSel.setAttribute('aria-label', t('anki.colTag'));
    const fillBulkTags = () => {
      const previous = tagSel.value;
      tagSel.innerHTML = '';
      const add = (value, text) => {
        const option = ankiEl('option', '', text);
        option.value = value;
        tagSel.appendChild(option);
      };
      add('__keep__', t('anki.bulkTagKeep'));
      add('__none__', t('anki.noTag'));
      // Tags du paquet choisi, sinon des paquets des notes sélectionnées.
      const noteMap = ankiNoteMap();
      const deckIds = deckSel.value
        ? [deckSel.value]
        : Array.from(new Set(Array.from(ankiBrowseSelected).map((id) => (noteMap.get(id) || {}).deckId)));
      const names = new Map();
      deckIds.forEach((deckId) => {
        if (deckId) ankiTagsIn(deckId).forEach((tag) => names.set(ankiNormalize(tag.name), tag.name));
      });
      Array.from(names.values())
        .sort(ankiCompareTagNames)
        .forEach((name) => add(`__tag__${name}`, name));
      add('__new__', t('anki.bulkNewTag'));
      const kept = Array.from(tagSel.options).some((option) => option.value === previous);
      tagSel.value = kept && previous !== '__new__' ? previous : '__keep__';
    };
    fillBulkTags();
    unsuspendBtn = ankiButton('anki-btn anki-btn--ghost', t('anki.unsuspendCard'), () => {
      const ids = selectedSuspended();
      if (ids.length) ankiUnsuspend(ids);
    });
    suspendBtn = ankiButton('anki-btn anki-btn--ghost', t('anki.suspendCard'), () => {
      const ids = selectedCards(false);
      if (!ids.length) return;
      ankiToggleSuspend(ids, true);
      ankiStatus(t('anki.suspendedStatus', { count: ids.length }), 'success');
    });
    showSuspendButtons();
    deckSel.addEventListener('change', fillBulkTags);
    tagSel.addEventListener('change', () => {
      if (tagSel.value !== '__new__') return;
      const name = ankiCleanTagName(window.prompt(t('anki.bulkNewTagPrompt')) || '');
      if (!name) {
        tagSel.value = '__keep__';
        return;
      }
      const option = ankiEl('option', '', name);
      option.value = `__tag__${name}`;
      tagSel.insertBefore(option, tagSel.lastChild);
      tagSel.value = option.value;
    });
    const apply = () => {
      const deckId = deckSel.value || null;
      let tagName = null;
      if (tagSel.value === '__none__') tagName = '';
      else if (tagSel.value.startsWith('__tag__')) tagName = tagSel.value.slice(7);
      if (!deckId && tagName === null) {
        ankiStatus(t('anki.bulkNothing'), 'error');
        return;
      }
      if (!ankiMoveNotes(Array.from(ankiBrowseSelected), deckId, tagName)) return;
      ankiBrowseSelected.clear();
      renderAnki(true);
    };
    bulkBar.append(
      countEl,
      deckSel,
      tagSel,
      ankiButton('anki-btn', t('anki.bulkApply'), apply),
      suspendBtn,
      unsuspendBtn,
      ankiButton('anki-link', t('anki.bulkClear'), () => {
        ankiBrowseSelected.clear();
        updateSelection();
      })
    );
  };

  deckSelect.addEventListener('change', () => {
    ankiBrowseDeck = deckSelect.value;
    ankiBrowseLimit = ANKI_BROWSE_PAGE;
    fillTags();
    draw();
  });
  tagSelect.addEventListener('change', () => {
    ankiBrowseTag = tagSelect.value;
    ankiBrowseLimit = ANKI_BROWSE_PAGE;
    draw();
  });
  let timer = null;
  search.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      ankiBrowseQuery = search.value;
      ankiBrowseLimit = ANKI_BROWSE_PAGE;
      draw();
    }, 150);
  });
  fillTags();
  draw();
}

/* ── Tags : créer, renommer, fusionner, supprimer ──────────── */

function renderAnkiTags(main) {
  const decks = ankiSortedDecks();
  const card = ankiEl('div', 'anki-card anki-tags');
  const head = ankiEl('div', 'anki-card__head');
  head.appendChild(ankiEl('h2', 'anki-title', t('anki.navTags')));
  card.appendChild(head);
  if (!decks.length) {
    card.appendChild(ankiEl('p', 'anki-muted', t('anki.noDecks')));
    main.appendChild(card);
    return;
  }
  if (!ankiGetDeck(ankiTagsDeck)) ankiTagsDeck = (ankiGetDeck(ankiDeckId) || decks[0]).id;
  const deckSelect = ankiEl('select');
  deckSelect.setAttribute('aria-label', t('anki.deckName'));
  decks.forEach((deck) => {
    const option = ankiEl('option', '', deck.name);
    option.value = deck.id;
    deckSelect.appendChild(option);
  });
  deckSelect.value = ankiTagsDeck;
  deckSelect.addEventListener('change', () => {
    ankiTagsDeck = deckSelect.value;
    renderAnki(true);
  });
  head.appendChild(deckSelect);
  card.appendChild(ankiEl('p', 'anki-hint', t('anki.tagsHelp')));

  // Création
  const create = ankiEl('form', 'anki-tag-create');
  const createInput = ankiEl('input', 'anki-input');
  createInput.type = 'text';
  createInput.placeholder = t('anki.newTagPlaceholder');
  const createButton = ankiEl('button', 'anki-btn', t('anki.addTag'));
  createButton.type = 'submit';
  create.append(createInput, createButton);
  create.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = ankiCleanTagName(createInput.value);
    if (!name) return;
    if (ankiFindTag(ankiTagsDeck, name)) {
      ankiStatus(t('anki.tagExists'), 'error');
      return;
    }
    const tag = ankiFindOrCreateTag(ankiTagsDeck, name);
    ankiPushUndo('tag', { tags: { [tag.id]: null } });
    saveData();
    renderAnki(true);
    ankiStatus(t('anki.tagCreated', { name }), 'success');
    const again = document.querySelector('.anki-tag-create input');
    if (again) again.focus();
  });
  card.appendChild(create);

  // Liste : renommer en place, voir les cartes, supprimer
  const tags = ankiTagsIn(ankiTagsDeck).filter((tag) => tag.deckId === ankiTagsDeck || ankiDeckFamily(ankiTagsDeck).has(tag.deckId));
  const list = ankiEl('div', 'anki-tag-list');
  if (!tags.length) list.appendChild(ankiEl('p', 'anki-muted', t('anki.noTags')));
  tags.forEach((tag) => {
    const row = ankiEl('div', 'anki-tag-row');
    const input = ankiEl('input', 'anki-input anki-tag-row__name');
    input.type = 'text';
    input.value = tag.name;
    input.setAttribute('aria-label', t('anki.colTag'));
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        input.blur();
      } else if (event.key === 'Escape') {
        input.value = tag.name;
        input.blur();
      }
    });
    input.addEventListener('change', () => {
      if (ankiRenameTag(tag.id, input.value)) renderAnki(true);
      else input.value = tag.name;
    });
    const count = ankiTagNoteCount(tag.id);
    row.append(
      input,
      ankiButton('anki-link anki-tag-row__count', t('anki.tagNotes', { count }), () => {
        ankiBrowseDeck = tag.deckId;
        ankiBrowseTag = tag.id;
        ankiBrowseQuery = '';
        ankiGo('browse');
      }),
      ankiButton('anki-icon-btn', '🗑', () => ankiDeleteTag(tag.id), t('anki.deleteTag'))
    );
    list.appendChild(row);
  });
  card.appendChild(list);
  main.appendChild(card);
}

/* ── Récupérer depuis l'historique de synchro ──────────────── */

let ankiRestoreState = null; // { versions, searching, done, error }

// Parcourt les versions du Gist (de la plus récente à la plus ancienne) et
// garde celles qui contiennent des notes, en sautant les versions identiques.
async function ankiSearchHistory(onProgress) {
  const gistId = syncSettings.gistId;
  const commits = await syncRequest(`/gists/${gistId}/commits?per_page=60`);
  const versions = [];
  let lastSignature = null;
  for (let i = 0; i < commits.length && versions.length < 6; i += 1) {
    const commit = commits[i];
    onProgress(i + 1);
    const gist = await syncRequest(`/gists/${gistId}/${commit.version}`);
    const file = gist.files && (gist.files[SYNC_FILE_NAME] || gist.files[SYNC_LEGACY_FILE_NAME]);
    if (!file) continue;
    let content = file.content;
    if (file.truncated && file.raw_url) content = await (await fetch(file.raw_url, { cache: 'no-store' })).text();
    let anki = null;
    try {
      const payload = JSON.parse(content);
      anki = payload && payload.data && payload.data.anki;
    } catch (error) {
      continue;
    }
    if (!ankiIsObject(anki) || !Array.isArray(anki.notes) || !anki.notes.length) continue;
    const signature = `${anki.notes.length}|${(anki.cards || []).length}|${(anki.revlog || []).length}|${(anki.decks || []).length}`;
    if (signature === lastSignature) continue;
    lastSignature = signature;
    versions.push({ at: commit.committed_at, anki });
  }
  return versions;
}

// Rajoute ce qui manque (par identifiant) sans toucher à l'existant.
function ankiRestoreVersion(snapshot) {
  const data = ankiData();
  const before = {};
  const added = { notes: 0, cards: 0, revlog: 0 };
  ANKI_COLLECTIONS.forEach((collection) => {
    const have = new Set(data[collection].map((item) => item.id));
    (snapshot[collection] || []).forEach((item) => {
      if (!item || have.has(item.id)) return;
      data[collection].push(JSON.parse(JSON.stringify(item)));
      before[collection] = before[collection] || {};
      before[collection][item.id] = null;
      if (collection in added) added[collection] += 1;
    });
  });
  if (!Object.keys(before).length) {
    ankiStatus(t('anki.restoreNothing'));
    return;
  }
  ensureAnkiData();
  ankiPushUndo('restore', before);
  saveData();
  ankiGo('decks');
  ankiStatus(t('anki.restoreDone', { notes: added.notes, cards: added.cards, reviews: added.revlog }), 'success');
}

function renderAnkiRestore(main) {
  const card = ankiEl('div', 'anki-card anki-restore');
  card.appendChild(ankiButton('anki-link', `← ${t('anki.navSettings')}`, () => ankiGo('settings')));
  card.appendChild(ankiEl('h2', 'anki-title', t('anki.restoreTitle')));
  card.appendChild(ankiEl('p', 'anki-muted', t('anki.restoreHelp')));
  main.appendChild(card);
  if (typeof isSyncEnabled !== 'function' || !isSyncEnabled() || !syncSettings.gistId) {
    card.appendChild(ankiEl('p', 'anki-form__message error', t('anki.restoreNeedSync')));
    return;
  }
  const state = ankiRestoreState;
  if (!state || (!state.searching && !state.versions && !state.error)) {
    card.appendChild(
      ankiButton('anki-btn', t('anki.restoreSearch'), async () => {
        ankiRestoreState = { searching: true, done: 0 };
        renderAnki(true);
        try {
          const versions = await ankiSearchHistory((done) => {
            ankiRestoreState.done = done;
            const progress = document.querySelector('.anki-restore__progress');
            if (progress) progress.textContent = t('anki.restoreSearching', { done });
          });
          ankiRestoreState = { versions };
        } catch (error) {
          ankiRestoreState = { error: error.message || String(error) };
        }
        if (ankiView === 'restore') renderAnki(true);
      })
    );
    return;
  }
  if (state.searching) {
    card.appendChild(ankiEl('p', 'anki-muted anki-restore__progress', t('anki.restoreSearching', { done: state.done || 0 })));
    return;
  }
  if (state.error) {
    card.appendChild(ankiEl('p', 'anki-form__message error', t('anki.restoreError', { error: state.error })));
    card.appendChild(ankiButton('anki-btn anki-btn--ghost', t('anki.restoreSearch'), () => {
      ankiRestoreState = null;
      renderAnki(true);
    }));
    return;
  }
  if (!state.versions.length) {
    card.appendChild(ankiEl('p', 'anki-muted', t('anki.restoreNone')));
    return;
  }
  const locale = typeof getCurrentLocale === 'function' ? getCurrentLocale() : 'fr-FR';
  const haveNotes = new Set(ankiData().notes.map((note) => note.id));
  const list = ankiEl('div', 'anki-restore__list');
  state.versions.forEach((version) => {
    const row = ankiEl('div', 'anki-restore__row');
    const info = ankiEl('div');
    const date = new Date(version.at).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' });
    info.appendChild(
      ankiEl('strong', '', t('anki.restoreItem', {
        date,
        notes: version.anki.notes.length,
        decks: (version.anki.decks || []).length,
        reviews: (version.anki.revlog || []).length
      }))
    );
    const missing = version.anki.notes.filter((note) => !haveNotes.has(note.id)).length;
    info.appendChild(ankiEl('span', 'anki-hint', t('anki.restoreMissing', { count: missing })));
    row.append(info, ankiButton('anki-btn', t('anki.restoreButton'), () => ankiRestoreVersion(version.anki)));
    list.appendChild(row);
  });
  card.appendChild(list);
}

/* ── Statistiques ──────────────────────────────────────────── */

function renderAnkiStats(main) {
  const data = ankiData();
  const card = ankiEl('div', 'anki-card anki-stats');
  const head = ankiEl('div', 'anki-card__head');
  head.appendChild(ankiEl('h2', 'anki-title', t('anki.statsTitle')));
  const select = ankiEl('select');
  const all = ankiEl('option', '', t('anki.allDecks'));
  all.value = '';
  select.appendChild(all);
  ankiSortedDecks().forEach((deck) => {
    const option = ankiEl('option', '', deck.name);
    option.value = deck.id;
    select.appendChild(option);
  });
  if (ankiStatsDeckId && !ankiGetDeck(ankiStatsDeckId)) ankiStatsDeckId = '';
  select.value = ankiStatsDeckId;
  select.addEventListener('change', () => {
    ankiStatsDeckId = select.value;
    renderAnki();
  });
  head.appendChild(select);
  card.appendChild(head);

  const family = ankiStatsDeckId ? ankiDeckFamily(ankiStatsDeckId) : null;
  const notes = ankiNoteMap();
  const cards = data.cards.filter((c) => {
    const note = notes.get(c.noteId);
    return note && (!family || family.has(note.deckId));
  });
  const cardIds = new Set(cards.map((c) => c.id));
  const logs = data.revlog.filter((log) => cardIds.has(log.c));
  const now = Date.now();
  const dayStart = ankiDayStart(now);

  // Aujourd'hui
  const todayLogs = logs.filter((log) => log.t >= dayStart);
  const section = (titleKey) => {
    const box = ankiEl('section', 'anki-stat');
    box.appendChild(ankiEl('h3', '', t(titleKey)));
    card.appendChild(box);
    return box;
  };
  const today = section('anki.today');
  if (todayLogs.length) {
    const minutes = Math.round(todayLogs.reduce((sum, log) => sum + (log.ms || 0), 0) / 60000);
    today.appendChild(ankiEl('p', '', t('anki.todayText', { count: todayLogs.length, minutes, again: todayLogs.filter((log) => log.r === 1).length })));
  } else {
    today.appendChild(ankiEl('p', 'anki-muted', t('anki.todayNothing')));
  }

  // Répartition des cartes
  const counts = { countNew: 0, countLearning: 0, countYoung: 0, countMature: 0, countSuspended: 0 };
  cards.forEach((c) => {
    if (c.suspended) counts.countSuspended += 1;
    else if (c.state === ANKI_STATE.NEW) counts.countNew += 1;
    else if (c.state !== ANKI_STATE.REVIEW) counts.countLearning += 1;
    else if (c.scheduled_days >= ANKI_MATURE_DAYS) counts.countMature += 1;
    else counts.countYoung += 1;
  });
  const repartition = section('anki.cardCounts');
  const bar = ankiEl('div', 'anki-stackbar');
  const legend = ankiEl('div', 'anki-legend');
  const total = cards.length || 1;
  Object.keys(counts).forEach((key) => {
    const segment = ankiEl('span', `anki-stackbar__seg anki-seg--${key}`);
    segment.style.width = `${(counts[key] / total) * 100}%`;
    bar.appendChild(segment);
    const item = ankiEl('span', 'anki-legend__item');
    item.append(ankiEl('i', `anki-seg--${key}`), document.createTextNode(`${t(`anki.${key}`)} : ${counts[key]}`));
    legend.appendChild(item);
  });
  repartition.append(bar, legend);

  // Rétention réelle : réussite des révisions de cartes déjà apprises.
  const retention = section('anki.retentionTitle');
  const since = ankiAddDays(dayStart, -30);
  const recent = logs.filter((log) => log.t >= since && log.s === ANKI_STATE.REVIEW);
  const cardsById = new Map(cards.map((c) => [c.id, c]));
  const pct = (list) => Math.round((list.filter((log) => log.r > 1).length / list.length) * 1000) / 10;
  if (recent.length) {
    retention.appendChild(ankiEl('p', 'anki-big', t('anki.retentionText', { rate: pct(recent), count: recent.length })));
    const mature = recent.filter((log) => {
      const c = cardsById.get(log.c);
      return c && c.scheduled_days >= ANKI_MATURE_DAYS;
    });
    if (mature.length) retention.appendChild(ankiEl('p', 'anki-muted', t('anki.retentionMature', { rate: pct(mature), count: mature.length })));
  } else {
    retention.appendChild(ankiEl('p', 'anki-muted', t('anki.retentionNone')));
  }
  retention.appendChild(ankiEl('p', 'anki-muted', t('anki.retentionTarget', { target: Math.round(data.settings.retention * 100) })));

  // Calendrier d'activité (26 semaines, colonnes = semaines, lundi en haut).
  const heat = section('anki.heatmapTitle');
  const perDay = new Map();
  logs.forEach((log) => {
    const key = ankiDayStart(log.t);
    perDay.set(key, (perDay.get(key) || 0) + 1);
  });
  const grid = ankiEl('div', 'anki-heatmap');
  const todayDate = new Date(dayStart);
  const offset = (todayDate.getDay() + 6) % 7; // lundi = 0
  const firstDay = ankiAddDays(dayStart, -(25 * 7 + offset));
  const max = Math.max(1, ...perDay.values());
  for (let i = 0; i <= 25 * 7 + offset; i += 1) {
    const day = ankiAddDays(firstDay, i);
    const count = perDay.get(ankiDayStart(day + 3600 * 1000)) || 0;
    const level = count === 0 ? 0 : Math.min(4, Math.ceil((count / max) * 4));
    const cell = ankiEl('span', `anki-heat anki-heat--${level}`);
    cell.title = t('anki.heatmapCell', { date: ankiFormatDate(day), count });
    grid.appendChild(cell);
  }
  heat.appendChild(grid);
  requestAnimationFrame(() => {
    grid.scrollLeft = grid.scrollWidth; // téléphone : semaines récentes visibles
  });

  // Prévision : cartes à revoir par jour sur 30 jours (retards comptés aujourd'hui).
  const forecastBox = section('anki.forecastTitle');
  const forecast = new Array(30).fill(0);
  const dayEnds = forecast.map((_, i) => ankiAddDays(ankiDayEnd(now), i));
  cards.forEach((c) => {
    if (c.suspended || c.state === ANKI_STATE.NEW) return;
    const index = dayEnds.findIndex((end) => c.due < end);
    if (index !== -1) forecast[index] += 1;
  });
  const fmax = Math.max(1, ...forecast);
  const chart = ankiEl('div', 'anki-forecast');
  forecast.forEach((value, i) => {
    const col = ankiEl('span', 'anki-forecast__bar');
    col.style.height = `${Math.max(value ? 6 : 1, (value / fmax) * 100)}%`;
    col.title = t('anki.forecastCell', { date: ankiFormatDate(dayEnds[i] - 12 * 3600 * 1000), count: value });
    if (value) col.dataset.value = String(value);
    chart.appendChild(col);
  });
  forecastBox.appendChild(chart);
  const sum = forecast.reduce((a, b) => a + b, 0);
  forecastBox.appendChild(ankiEl('p', 'anki-muted', t('anki.forecastTotal', { count: sum, avg: Math.round((sum / 30) * 10) / 10 })));

  main.appendChild(card);
}

/* ── Réglages ──────────────────────────────────────────────── */

function renderAnkiSettings(main) {
  const settings = ankiData().settings;
  const form = ankiEl('form', 'anki-card anki-settings');
  form.noValidate = true;
  form.appendChild(ankiEl('h2', 'anki-title', t('anki.settingsTitle')));
  const inputs = {};
  const addField = (key, labelKey, attrs, helpKey) => {
    const label = ankiEl('label', 'anki-field');
    label.appendChild(ankiEl('span', 'anki-field__label', t(labelKey)));
    const input = ankiEl('input', 'anki-input');
    Object.entries(attrs).forEach(([name, value]) => input.setAttribute(name, value));
    if (attrs.type === 'checkbox') input.checked = Boolean(settings[key]);
    else input.value = settings[key];
    label.appendChild(input);
    if (helpKey) label.appendChild(ankiEl('span', 'anki-hint', t(helpKey)));
    inputs[key] = input;
    form.appendChild(label);
    return input;
  };
  const retention = addField('retention', 'anki.retention', { type: 'range', min: '0.80', max: '0.97', step: '0.01' }, 'anki.retentionHelp');
  const retentionValue = ankiEl('output', 'anki-range-value', Number(settings.retention).toFixed(2));
  retention.after(retentionValue);
  retention.addEventListener('input', () => {
    retentionValue.textContent = Number(retention.value).toFixed(2);
  });
  addField('newPerDay', 'anki.newPerDay', { type: 'number', min: '0', max: '9999', inputmode: 'numeric' });
  addField('reviewsPerDay', 'anki.reviewsPerDay', { type: 'number', min: '0', max: '99999', inputmode: 'numeric' });
  addField('learningSteps', 'anki.learningSteps', { type: 'text' }, 'anki.stepsHelp');
  addField('relearningSteps', 'anki.relearningSteps', { type: 'text' });
  addField('maxInterval', 'anki.maxInterval', { type: 'number', min: '1', max: '36500', inputmode: 'numeric' });
  addField('dayStartHour', 'anki.dayStart', { type: 'number', min: '0', max: '23', inputmode: 'numeric' });
  const bury = addField('burySiblings', 'anki.burySiblings', { type: 'checkbox' });
  bury.parentElement.classList.add('anki-field--check');

  const message = ankiEl('p', 'anki-form__message');
  form.appendChild(message);
  const actions = ankiEl('div', 'anki-actions');
  const save = ankiEl('button', 'anki-btn', t('anki.saveButton').replace(/\s*\(.*\)/, ''));
  save.type = 'submit';
  actions.appendChild(save);
  form.appendChild(actions);
  form.appendChild(ankiButton('anki-link anki-restore-link', t('anki.restoreLink'), () => ankiGo('restore')));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!ankiStepsValid(inputs.learningSteps.value) || !ankiStepsValid(inputs.relearningSteps.value)) {
      message.textContent = t('anki.settingsInvalidSteps');
      message.className = 'anki-form__message error';
      return;
    }
    const int = (value, min, max, fallback) => {
      const n = Math.round(Number(value));
      return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
    };
    Object.assign(settings, {
      retention: Math.round(Math.min(0.97, Math.max(0.8, Number(inputs.retention.value) || 0.9)) * 100) / 100,
      newPerDay: int(inputs.newPerDay.value, 0, 9999, 20),
      reviewsPerDay: int(inputs.reviewsPerDay.value, 0, 99999, 200),
      learningSteps: ankiParseSteps(inputs.learningSteps.value).join(' '),
      relearningSteps: ankiParseSteps(inputs.relearningSteps.value).join(' '),
      maxInterval: int(inputs.maxInterval.value, 1, 36500, 36500),
      dayStartHour: int(inputs.dayStartHour.value, 0, 23, 4),
      burySiblings: inputs.burySiblings.checked
    });
    saveData();
    message.textContent = t('anki.settingsSaved');
    message.className = 'anki-form__message success';
  });
  main.appendChild(form);
}

/* ── Export (partager des fiches) ──────────────────────────── */
// Fichier texte au format des exports d'Anki (« Notes en texte brut ») :
// réimportable dans MyDesk comme dans Anki. Sans l'historique de révisions.

const ANKI_EXPORT_TYPES = {
  fr: { basic: 'Basique', reversed: 'Basique (et carte inversée)', cloze: 'Texte à trous' },
  en: { basic: 'Basic', reversed: 'Basic (and reversed card)', cloze: 'Cloze' }
};

// « Intro - Chap 1 » → « Intro::Chap_1 » (un tag Anki n'a pas d'espace ;
// l'import de MyDesk refait « Intro - Chap 1 »).
function ankiTagForExport(name) {
  const clean = ankiCleanTagName(name);
  if (!clean) return '';
  const nested = clean
    .split(/\s+-\s+/)
    .map((part) => part.trim().replace(/\s+/g, '_'))
    .filter(Boolean)
    .join('::');
  if (ankiPartFromTag(nested) === clean) return nested;
  return clean.replace(/\s+/g, '_');
}

function ankiExportField(value) {
  const text = String(value || '');
  return /[\t\r\n"]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function ankiBuildExport(notes) {
  const names = ANKI_EXPORT_TYPES[currentLanguage] || ANKI_EXPORT_TYPES.fr;
  const decks = new Map(ankiData().decks.map((deck) => [deck.id, deck.name]));
  const lines = ['#separator:tab', '#html:true', '#guid column:1', '#notetype column:2', '#deck column:3', '#tags column:6'];
  notes.forEach((note) => {
    const fields = note.fields || {};
    const [first, second] = note.type === 'cloze' ? [fields.text, fields.extra] : [fields.front, fields.back];
    lines.push(
      [note.guid || note.id, names[note.type] || names.basic, decks.get(note.deckId) || '', first, second, [ankiTagForExport(ankiTagName(note)), note.unsure ? ANKI_UNSURE_TAG : ''].filter(Boolean).join(' ')]
        .map(ankiExportField)
        .join('\t')
    );
  });
  return `${lines.join('\n')}\n`;
}

function ankiExportFileName(deck) {
  const base = String(deck ? deck.name : 'MyDesk')
    .replace(/::/g, ' - ')
    .replace(/[\\/:*?"<>|]+/g, '')
    .trim();
  return `${base || 'MyDesk'}.txt`;
}

function renderAnkiExport(main) {
  const decks = ankiSortedDecks();
  const card = ankiEl('div', 'anki-card anki-export');
  card.appendChild(ankiEl('h2', 'anki-title', t('anki.exportTitle')));
  card.appendChild(ankiEl('p', 'anki-muted', t('anki.exportHelp')));
  main.appendChild(card);
  if (!decks.length) {
    card.appendChild(ankiEl('p', 'anki-muted', t('anki.noDecks')));
    return;
  }
  if (!ankiGetDeck(ankiExportDeck)) ankiExportDeck = ankiGetDeck(ankiDeckId) ? ankiDeckId : decks[0].id;

  const deckLabel = ankiEl('label', 'anki-field');
  deckLabel.appendChild(ankiEl('span', 'anki-field__label', t('anki.deckName')));
  const deckSelect = ankiEl('select');
  decks.forEach((deck) => {
    const option = ankiEl('option', '', deck.name);
    option.value = deck.id;
    deckSelect.appendChild(option);
  });
  deckSelect.value = ankiExportDeck;
  deckLabel.appendChild(deckSelect);
  card.appendChild(deckLabel);

  const tagsBox = ankiEl('div', 'anki-field');
  card.appendChild(tagsBox);
  const actions = ankiEl('div', 'anki-actions');
  card.appendChild(actions);

  const draw = () => {
    const family = ankiDeckFamily(ankiExportDeck);
    const deckNotes = ankiData().notes.filter((note) => family.has(note.deckId));
    const groups = new Map(); // nom du tag → notes
    deckNotes.forEach((note) => {
      const name = ankiTagName(note);
      if (!groups.has(name)) groups.set(name, []);
      groups.get(name).push(note);
    });
    const names = Array.from(groups.keys()).sort(ankiCompareTagNames);

    tagsBox.innerHTML = '';
    const head = ankiEl('div', 'anki-export__head');
    head.appendChild(ankiEl('span', 'anki-field__label', t('anki.exportTags')));
    tagsBox.appendChild(head);
    const list = ankiEl('div', 'anki-export__tags');
    const boxes = names.map((name) => {
      const label = ankiEl('label', 'anki-export__item');
      const box = ankiEl('input');
      box.type = 'checkbox';
      box.checked = true;
      label.append(box, ankiEl('span', '', name || t('anki.noTag')), ankiEl('span', 'anki-muted', String(groups.get(name).length)));
      list.appendChild(label);
      return { box, name };
    });
    tagsBox.appendChild(list);
    if (!names.length) tagsBox.appendChild(ankiEl('p', 'anki-muted', t('anki.exportEmpty')));

    const chosenNotes = () =>
      boxes
        .filter((item) => item.box.checked)
        .flatMap((item) => groups.get(item.name))
        .sort((a, b) => (a.created || 0) - (b.created || 0));

    actions.innerHTML = '';
    const download = ankiButton('anki-btn', '', () => {
      const notes = chosenNotes();
      if (!notes.length) return;
      const blob = new Blob([ankiBuildExport(notes)], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = ankiExportFileName(ankiGetDeck(ankiExportDeck));
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      ankiStatus(t('anki.exportDone', { count: notes.length }), 'success');
    });
    actions.appendChild(download);

    // Téléphone : envoyer directement le fichier (WhatsApp, Messages, mail…).
    let share = null;
    const probe = typeof File === 'function' ? new File(['x'], 'test.txt', { type: 'text/plain' }) : null;
    if (probe && navigator.canShare && navigator.canShare({ files: [probe] })) {
      share = ankiButton('anki-btn anki-btn--ghost', '', async () => {
        const notes = chosenNotes();
        if (!notes.length) return;
        const deck = ankiGetDeck(ankiExportDeck);
        const file = new File([ankiBuildExport(notes)], ankiExportFileName(deck), { type: 'text/plain' });
        try {
          await navigator.share({ files: [file], title: deck ? deck.name : 'MyDesk' });
        } catch (error) {
          // partage annulé : rien à faire
        }
      });
      actions.appendChild(share);
    }

    const refresh = () => {
      const count = chosenNotes().length;
      download.textContent = t('anki.exportDownload', { count });
      download.disabled = !count;
      if (share) {
        share.textContent = t('anki.exportShare');
        share.disabled = !count;
      }
    };
    if (boxes.length > 1) {
      head.appendChild(
        ankiButton('anki-link', t('anki.exportToggleAll'), () => {
          const check = !boxes.every((item) => item.box.checked);
          boxes.forEach((item) => {
            item.box.checked = check;
          });
          refresh();
        })
      );
    }
    list.addEventListener('change', refresh);
    refresh();
  };

  deckSelect.addEventListener('change', () => {
    ankiExportDeck = deckSelect.value;
    draw();
  });
  draw();
}

/* ── Import (export texte d'Anki ou fichier simple) ────────── */

function ankiParseDelimited(text, separator) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  let atFieldStart = true;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"' && atFieldStart) {
      quoted = true;
      atFieldStart = false;
      continue;
    }
    if (ch === separator) {
      row.push(field);
      field = '';
      atFieldStart = true;
      continue;
    }
    if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      atFieldStart = true;
      continue;
    }
    field += ch;
    atFieldStart = false;
  }
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((value) => value.trim() !== ''));
}

const ANKI_SEPARATORS = { tab: '\t', comma: ',', semicolon: ';', space: ' ', pipe: '|', colon: ':' };

function ankiDetectNoteType(name) {
  const n = ankiNormalize(name);
  if (/cloze|trou/.test(n)) return 'cloze';
  if (/optional|optionnel/.test(n)) return 'optional';
  if (/revers|invers/.test(n)) return 'reversed';
  return 'basic';
}

function ankiEscapeHtml(text) {
  return String(text).replace(/[&<>]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[ch]).replace(/\n/g, '<br>');
}

function ankiParseImport(rawText) {
  const text = rawText.replace(/^﻿/, '');
  const lines = text.split(/\r?\n/);
  const headers = {};
  let start = 0;
  while (start < lines.length && lines[start].startsWith('#') && lines[start].includes(':')) {
    const line = lines[start].slice(1);
    const index = line.indexOf(':');
    headers[line.slice(0, index).trim().toLowerCase()] = line.slice(index + 1).trim();
    start += 1;
  }
  const body = lines.slice(start).join('\n');
  let separator = headers.separator ? ANKI_SEPARATORS[headers.separator.toLowerCase()] || headers.separator[0] : null;
  if (!separator) {
    const sample = body.slice(0, 5000);
    separator = sample.includes('\t') ? '\t' : sample.split(';').length > sample.split(',').length ? ';' : ',';
  }
  const html = headers.html ? headers.html.toLowerCase() === 'true' : /<[a-z][^>]*>/i.test(body);
  const column = (key) => (headers[key] ? Number(headers[key]) - 1 : -1);
  const guidCol = column('guid column');
  const typeCol = column('notetype column');
  const deckCol = column('deck column');
  const tagsCol = column('tags column');
  const special = new Set([guidCol, typeCol, deckCol, tagsCol].filter((i) => i >= 0));
  const extraTags = headers.tags ? headers.tags.split(/\s+/).filter(Boolean) : [];

  let media = 0;
  const clean = (value) => {
    let v = html ? value : ankiEscapeHtml(value);
    v = v.replace(/\[sound:[^\]]+\]/g, () => {
      media += 1;
      return `🔊 (${t('anki.soundMissing')})`;
    });
    if (/<img/i.test(v)) media += (v.match(/<img/gi) || []).length;
    return ankiSanitize(v);
  };

  const notes = [];
  ankiParseDelimited(body, separator).forEach((row) => {
    const fields = row.filter((_, i) => !special.has(i));
    if (!fields.length || !fields.some((f) => f.trim())) return;
    const typeName = typeCol >= 0 ? row[typeCol] || '' : headers.notetype || '';
    const detected = ankiDetectNoteType(typeName);
    let type = detected;
    let values;
    if (type === 'cloze') {
      values = { text: clean(fields[0] || ''), extra: clean(fields.slice(1).filter(Boolean).join('<br>')) };
      if (!ankiClozeNumbers(values.text).length) {
        type = 'basic';
        values = { front: values.text, back: values.extra };
      }
    } else {
      // « Carte inversée optionnelle » : 3e champ rempli = carte inversée voulue.
      const backFields = detected === 'optional' ? [fields[1] || ''] : fields.slice(1);
      if (detected === 'optional') type = (fields[2] || '').trim() ? 'reversed' : 'basic';
      values = { front: clean(fields[0] || ''), back: clean(backFields.filter((f) => f.trim()).join('<br><br>')) };
    }
    const tags = [
      ...extraTags,
      ...(tagsCol >= 0 && row[tagsCol] ? row[tagsCol].split(/\s+/).filter(Boolean) : [])
    ];
    notes.push({
      guid: guidCol >= 0 ? row[guidCol] || null : null,
      type,
      typeName,
      deckName: deckCol >= 0 ? row[deckCol] || '' : headers.deck || '',
      fields: values,
      tags: Array.from(new Set(tags)),
      part: ankiPartFromTags(tags.filter((tag) => !ankiIsUnsureTag(tag))),
      unsure: tags.some(ankiIsUnsureTag)
    });
  });
  return { notes, media, hasDecks: notes.some((note) => note.deckName) };
}

function renderAnkiImport(main) {
  const card = ankiEl('div', 'anki-card anki-import');
  card.appendChild(ankiEl('h2', 'anki-title', t('anki.importTitle')));
  card.appendChild(ankiEl('p', 'anki-muted', t('anki.importHelp')));
  const fileLabel = ankiEl('label', 'anki-btn anki-file');
  fileLabel.appendChild(document.createTextNode(t('anki.importFile')));
  const input = ankiEl('input');
  input.type = 'file';
  input.accept = '.txt,.csv,.tsv,text/plain,text/csv';
  fileLabel.appendChild(input);
  card.appendChild(fileLabel);
  const preview = ankiEl('div', 'anki-import__preview');
  card.appendChild(preview);
  main.appendChild(card);

  const drawPreview = () => {
    preview.innerHTML = '';
    if (!ankiImportState) return;
    const { parsed, fileName } = ankiImportState;
    if (!parsed.notes.length) {
      preview.appendChild(ankiEl('p', 'anki-form__message error', t('anki.importEmpty')));
      return;
    }
    preview.appendChild(ankiEl('p', 'anki-big', `${fileName} : ${t('anki.importPreview', { count: parsed.notes.length })}`));
    const typeCounts = {};
    parsed.notes.forEach((note) => {
      const key = t(`anki.type${note.type[0].toUpperCase()}${note.type.slice(1)}`);
      typeCounts[key] = (typeCounts[key] || 0) + 1;
    });
    preview.appendChild(ankiEl('p', 'anki-muted', t('anki.importTypes', { types: Object.entries(typeCounts).map(([k, v]) => `${k} (${v})`).join(', ') })));
    if (parsed.hasDecks) {
      const deckNames = Array.from(new Set(parsed.notes.map((note) => note.deckName).filter(Boolean)));
      preview.appendChild(ankiEl('p', 'anki-muted', t('anki.importDecks', { decks: deckNames.join(', ') })));
    }
    if (parsed.media) preview.appendChild(ankiEl('p', 'anki-form__message warn', t('anki.importMedia', { count: parsed.media })));

    const sample = ankiEl('details', 'anki-import__sample');
    sample.appendChild(ankiEl('summary', '', t('anki.importSample')));
    const first = parsed.notes[0];
    const face = ankiEl('div', 'anki-face anki-face--small');
    face.innerHTML = first.type === 'cloze' ? ankiSanitize(ankiRenderCloze(first.fields.text, 1, true)) : ankiSanitize(`${first.fields.front}<hr class="anki-sep">${first.fields.back}`);
    sample.appendChild(face);
    preview.appendChild(sample);

    const deckLabel = ankiEl('label', 'anki-field');
    deckLabel.appendChild(ankiEl('span', 'anki-field__label', t('anki.importTarget')));
    const deckSelect = ankiEl('select');
    if (parsed.hasDecks) {
      const option = ankiEl('option', '', t('anki.importUseFile'));
      option.value = '__file__';
      deckSelect.appendChild(option);
    }
    ankiSortedDecks().forEach((deck) => {
      const option = ankiEl('option', '', deck.name);
      option.value = deck.id;
      deckSelect.appendChild(option);
    });
    const newOption = ankiEl('option', '', t('anki.importNewDeck'));
    newOption.value = '__new__';
    deckSelect.appendChild(newOption);
    deckSelect.value = ankiImportState.target || (parsed.hasDecks ? '__file__' : deckSelect.options[0].value);
    deckSelect.addEventListener('change', () => {
      ankiImportState.target = deckSelect.value;
    });
    deckLabel.appendChild(deckSelect);
    preview.appendChild(deckLabel);

    const dupLabel = ankiEl('label', 'anki-field');
    dupLabel.appendChild(ankiEl('span', 'anki-field__label', t('anki.importExisting')));
    const dupSelect = ankiEl('select');
    [
      ['update', 'anki.importUpdate'],
      ['skip', 'anki.importSkip']
    ].forEach(([value, key]) => {
      const option = ankiEl('option', '', t(key));
      option.value = value;
      dupSelect.appendChild(option);
    });
    dupSelect.value = ankiImportState.duplicates || 'update';
    dupSelect.addEventListener('change', () => {
      ankiImportState.duplicates = dupSelect.value;
    });
    dupLabel.appendChild(dupSelect);
    preview.appendChild(dupLabel);

    preview.appendChild(
      ankiButton('anki-btn anki-btn--big', t('anki.importButton'), () => {
        let target = deckSelect.value;
        if (target === '__new__') {
          const name = ankiCleanDeckName(window.prompt(t('anki.newDeckPrompt'), fileName.replace(/\.[^.]+$/, '')));
          if (!name) return;
          target = `__name__${name}`;
        }
        ankiRunImport(parsed, target, dupSelect.value);
      })
    );
  };

  input.addEventListener('change', async () => {
    const file = input.files && input.files[0];
    if (!file) return;
    const text = await file.text();
    ankiImportState = { parsed: ankiParseImport(text), fileName: file.name, target: null, duplicates: 'update' };
    drawPreview();
  });
  drawPreview();
}

function ankiRunImport(parsed, target, duplicates) {
  const data = ankiData();
  const knownDecks = new Set(data.decks.map((deck) => deck.id));
  const knownTags = new Set(data.tags.map((tag) => tag.id));
  const byGuid = new Map(data.notes.filter((note) => note.guid).map((note) => [note.guid, note]));
  const before = { decks: {}, notes: {}, cards: {}, revlog: {} };
  const now = Date.now();
  let added = 0;
  let updated = 0;
  let skipped = 0;
  let fixedDeck = null;
  if (target.startsWith('__name__')) fixedDeck = ankiFindOrCreateDeck(target.slice(8));
  else if (target !== '__file__') fixedDeck = ankiGetDeck(target);

  parsed.notes.forEach((item, index) => {
    const deck = fixedDeck || ankiFindOrCreateDeck(item.deckName);
    const existing = item.guid ? byGuid.get(item.guid) : null;
    if (existing) {
      if (duplicates === 'skip') {
        skipped += 1;
        return;
      }
      const sameType = (existing.type === 'cloze') === (item.type === 'cloze');
      const cardIds = data.cards.filter((card) => card.noteId === existing.id).map((card) => card.id);
      Object.assign(before.notes, ankiCapture({ notes: [existing.id] }).notes);
      Object.assign(before.cards, ankiCapture({ cards: cardIds }).cards || {});
      Object.assign(before.revlog, ankiCapture({ revlog: data.revlog.filter((log) => cardIds.includes(log.c)).map((log) => log.id) }).revlog || {});
      existing.fields = sameType ? item.fields : ankiConvertFields(item.fields, item.type, existing.type);
      // Tag renommé à la main : on le garde tant que les tags Anki ne changent pas.
      if (!existing.tagId || JSON.stringify(existing.tags || []) !== JSON.stringify(item.tags)) {
        const tag = ankiFindOrCreateTag(deck.id, item.part);
        existing.tagId = tag ? tag.id : null;
      }
      existing.tags = item.tags;
      if (item.unsure) existing.unsure = true;
      else delete existing.unsure;
      existing.deckId = deck.id;
      existing.updated = now;
      ankiSyncNoteCards(existing, now + index).added.forEach((id) => {
        before.cards[id] = null;
      });
      updated += 1;
      return;
    }
    const note = {
      id: uid(),
      guid: item.guid || uid(),
      deckId: deck.id,
      type: item.type,
      fields: item.fields,
      tags: item.tags,
      tagId: (ankiFindOrCreateTag(deck.id, item.part) || {}).id || null,
      created: now + index,
      updated: now
    };
    if (item.unsure) note.unsure = true;
    data.notes.push(note);
    byGuid.set(note.guid, note);
    before.notes[note.id] = null;
    ankiSyncNoteCards(note, now + index).added.forEach((id) => {
      before.cards[id] = null;
    });
    added += 1;
  });
  ensureAnkiData();
  data.decks.forEach((deck) => {
    if (!knownDecks.has(deck.id)) before.decks[deck.id] = null;
  });
  before.tags = {};
  data.tags.forEach((tag) => {
    if (!knownTags.has(tag.id)) before.tags[tag.id] = null;
  });
  ankiPushUndo('import', before);
  ankiImportState = null;
  saveData();
  ankiView = 'decks';
  renderAnki();
  ankiStatus(t('anki.importDone', { added, updated, skipped }), 'success');
}

/* ── Clavier ───────────────────────────────────────────────── */

function ankiIsTextField(element) {
  if (!element) return false;
  if (element.isContentEditable || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') return true;
  if (element.tagName !== 'INPUT') return false;
  return !['checkbox', 'radio', 'button', 'submit', 'range', 'file'].includes(element.type);
}

function ankiHandleKeydown(event) {
  if (!ankiIsActive()) return;
  const inField = ankiIsTextField(event.target);
  const key = event.key.toLowerCase();
  if ((event.ctrlKey || event.metaKey) && !event.altKey && key === 'z' && !event.shiftKey) {
    if (inField || !ankiUndoStack.length) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    ankiUndo();
    return;
  }
  if (ankiView !== 'review' || inField || event.ctrlKey || event.metaKey || event.altKey || !ankiCurrent) return;
  if (event.key === ' ' || event.key === 'Enter') {
    event.preventDefault();
    if (!ankiCurrent.answerShown) ankiRevealAnswer();
    else ankiAnswer(3);
  } else if (['1', '2', '3', '4'].includes(event.key) && ankiCurrent.answerShown) {
    event.preventDefault();
    ankiAnswer(Number(event.key));
  } else if (key === 'c') {
    const card = ankiCurrentCard();
    if (card) {
      event.preventDefault();
      ankiToggleUnsure(card.noteId);
    }
  } else if (key === 'e') {
    const card = ankiCurrentCard();
    if (card) {
      event.preventDefault();
      ankiEditNote(card.noteId, 'review');
    }
  }
}

function initAnki() {
  if (typeof FSRS === 'undefined') {
    console.warn('ts-fsrs indisponible : onglet Révisions désactivé.');
    return;
  }
  ensureAnkiData();
  ankiRestoreUi();
  ankiUiRestored = true;
  window.addEventListener('keydown', ankiHandleKeydown, true);
  renderAnki();
  const languageSelect = document.getElementById('language-select');
  if (languageSelect) languageSelect.addEventListener('change', renderAnki);
  // Les cartes en apprentissage reviennent au bout de quelques minutes :
  // on rafraîchit l'écran « terminé » et les compteurs de temps en temps.
  setInterval(() => {
    if (!ankiIsActive() || document.hidden) return;
    if (ankiView === 'done' || ankiView === 'overview' || ankiView === 'decks') renderAnki();
  }, 30000);
}
