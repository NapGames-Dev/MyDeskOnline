/* ═══════════════════════════════════════════════════════════
   ONGLET PATCH-NOTES
   Toutes les nouveautés depuis le début du fork (28/09/2026),
   de la plus récente à la plus ancienne. À compléter à chaque
   nouvelle fonctionnalité : ajouter une ligne dans PATCH_NOTES
   (même date = même bloc). « Nouveau » et la pastille sur l'onglet
   se basent sur la date de la dernière visite (localStorage).
   ═══════════════════════════════════════════════════════════ */

const PATCH_NOTES_SEEN_KEY = 'mydesk-patchnotes-seen';

// area : app | sync | calendar | anki | sport | news | todo | menu | snake
const PATCH_NOTES = [
  {
    date: '2026-10-17',
    title: 'Plus de cartes quand il le faut',
    items: [
      { area: 'anki', text: 'Révisions : quand la limite de nouvelles cartes du jour est atteinte, « Étudier plus aujourd’hui » (dans l’aperçu du paquet et à la fin de la séance) ajoute le nombre de nouvelles cartes voulu, pour ce paquet et pour aujourd’hui seulement. Demain, la limite normale revient.' }
    ]
  },
  {
    date: '2026-10-09',
    title: 'Heure des sources',
    items: [
      { area: 'news', text: 'Actualités : l’heure de publication de chaque article source s’affiche à côté du média dans les résumés (« franceinfo 07:42 », ou « mer. 21:15 » pour un article d’un autre jour) ; date complète au survol.' }
    ]
  },
  {
    date: '2026-10-08',
    title: 'Sport repensé, Notes refaites',
    items: [
      { area: 'app', text: 'Notes refaites : liste avec recherche instantanée (sans tenir compte des accents), notes épinglées en haut, icône, aperçu et date de modification ; titre modifiable directement dans la note (plus de fenêtres « Renommer ») ; barre de mise en forme compacte (titres, citation, gras…, listes, cases à cocher, lien, surligneurs, couleurs) ; mots et temps de lecture.' },
      { area: 'app', text: 'Notes : raccourcis en début de ligne (« # » titre, « ## » sous-titre, « - » liste, « 1. » liste numérotée, « [] » case à cocher, « > » citation), collage nettoyé depuis le web ou Word (structure gardée, styles et images retirés), dupliquer, copier le texte, supprimer avec « Annuler ». Sur téléphone : la liste, puis la note en plein écran.' },
      { area: 'anki', text: 'Notes → Révisions : bouton « 🧠 Fiche » qui crée une fiche avec le passage sélectionné (question : le titre juste au-dessus ; en texte à trous si c’est ton type par défaut).' },
      { area: 'sport', text: 'Sport : les séances ne sont plus liées à un jour. Chacune est à faire une fois dans la semaine (lundi → dimanche), le jour que tu veux : l’onglet ouvre la séance commencée ce jour-là, sinon la prochaine pas encore faite. La liste montre « ✓ faite mar. 6 » ou « À faire cette semaine », et un créneau de l’agenda ouvre sa séance si elle reste à faire, sinon la suivante (rappel compris).' },
      { area: 'sport', text: 'Sport : régularité à la semaine — la semaine compte quand chaque séance de ta liste est faite une fois ; l’historique montre ce qui reste à faire cette semaine (« Faire aujourd’hui ») et les séances pas faites des 2 dernières semaines.' },
      { area: 'sport', text: 'Sport : échauffement revu et construit d’après les exercices de la séance (cardio, mobilité des épaules, poignets, hanches et dos, activation, tout le debout puis tout au sol, ≈ 7–8 min). Carte « 🔥 Échauffement » dans la séance et, en mode guidé, étape par étape avec chrono. Séries d’approche juste avant le premier exercice de chaque famille (variante plus facile puis variante du jour, ou sac à moitié chargé), suivies d’1 min de repos.' },
      { area: 'sport', text: 'Sport : vidéos d’explication ajoutées pour les 17 variantes qui n’en avaient pas (pompes piquées, leg curl, tirage glissé, planches, crunchs inversés, crunch vélo, crunch lesté, squat sur une jambe).' },
      { area: 'sport', text: 'Sport : programme v7, revu en détail en s’appuyant sur les études de référence. Départs recalés pour quelqu’un qui fait ~25 pompes (pompes pieds surélevés, pompes serrées, fentes), deux fois plus d’arrière des cuisses, nouveau tirage glissé au sol, planche scie et glissé avant à genoux. Plus aucun exercice sur une table ou une chaise : tout se fait au lit, au canapé, au mur ou au sol.' },
      { area: 'sport', text: 'Sport : échauffement détaillé propre à chaque séance (général, mobilité dont les poignets, séries d’approche) et retour au calme ; fiches réécrites avec placement précis, tempo, respiration, « ce que tu dois sentir » et corrections du type « si tu sens X, fais Y ».' },
      { area: 'sport', text: 'Sport : au rowing et au crunch avec sac à dos, l’app propose d’abord d’ajouter du poids (+0,5 à 1,5 kg, maximum 10–12 kg) avant de changer de variante ; en dessous de la fourchette, elle propose de retirer une bouteille. Charges de départ indiquées dans les fiches.' },
      { area: 'sport', text: 'Sport : tes séances préfaites passent en v7 en gardant ton historique et ta variante si tu étais plus avancé ; les variantes renommées suivent dans tes saisies. Conseils de progression, de sécurité et d’alimentation réécrits (semaine allégée, reprise après une pause, courbature ou blessure). Créneau d’agenda proposé par défaut : 1 h.' }
    ]
  },
  {
    date: '2026-10-07',
    title: 'Cartes en lot, impact écologique, ligne éditoriale',
    items: [
      { area: 'news', text: 'Actualités : autant de médias de gauche que de droite, en miroir — Libération, Mediapart / Le Figaro, Europe 1 (gauche / droite) ; L’Humanité, Politis / Valeurs actuelles, CNews (marqués) ; L’Obs, Courrier international / Le Point, Contrepoints (centre). Autant de sites de chaque bord dans chaque thème. Seuls leurs titres et liens sont repris dans les données publiques du robot.' },
      { area: 'news', text: 'Actualités : étiquette de ligne éditoriale à côté de chaque source (gauche, centre gauche, service public, parlementaire, officiel, juridique… détail au survol), et sous chaque thème un bilan du type « 11 service public · 1 centre gauche · aucune source de droite ».' },
      { area: 'app', text: 'Accueil : estimation de l’impact écologique de MyDesk ce mois-ci et sur un an (CO₂e et équivalent en km de voiture), détaillée entre le robot Actualités, l’écran de ton appareil pendant que MyDesk est ouvert et les données échangées. Hypothèses affichées sous le calcul.' },
      { area: 'anki', text: 'Révisions : dans Parcourir, bouton « ⏸ Suspendre » sur les cartes cochées — par exemple chercher « cession », tout cocher, Suspendre : elles sortent des révisions d’un coup (annulable avec ↶ Annuler).' },
      { area: 'anki', text: 'Révisions : bouton « ▶ Réactiver » pour remettre une carte suspendue dans les révisions — dans la fiche (✏️ Modifier) ou dans Parcourir après avoir coché les cartes (astuce : chercher is:suspended). Avant, une suspension ne s’annulait qu’avec Ctrl+Z.' }
    ]
  },
  {
    date: '2026-10-06',
    title: 'Actualités plus précises, données mieux protégées',
    items: [
      { area: 'app', text: 'Alerte si la mémoire du navigateur est presque pleine (orange) ou pleine (rouge) : avant, les modifications cessaient d’être enregistrées sans prévenir. Bouton « Exporter une sauvegarde » dans l’alerte ; dans Accueil, place utilisée et plus gros postes (Anki, Agenda…).' },
      { area: 'menu', text: 'Menu : une recette qui fait presque un nombre rond de repas compte pour ce nombre (ex. 4 galettes = 1,9 repas → 2 repas). « 2 repas » donne la recette telle qu’écrite et « 1 repas » la moitié pile, au lieu de 526,3 g d’eau et 5 œufs.' },
      { area: 'news', text: 'L’onglet « Actualité » s’appelle maintenant « Actualités ».' },
      { area: 'news', text: 'Actualités : cases « Lu » Matin et Soir à droite de « L’essentiel », synchronisées entre appareils.' },
      { area: 'news', text: 'Actualités : Matin et Soir toujours proposés ; s’il n’y a pas de résumé du soir, l’app affiche « Aucun résumé généré » au lieu de remettre celui du matin.' },
      { area: 'news', text: 'Actualités : « 💡 Pour comprendre » mis en valeur dans un encadré discret.' },
      { area: 'news', text: 'Actualités : un thème absent du résumé choisi (ex. Justice le soir) affiche « Aucun résumé généré » au lieu de reprendre celui de l’autre créneau.' },
      { area: 'news', text: 'Actualités : Justice & droit est rédigé matin et soir, comme International et France (avant : une seule fois par jour, le matin).' },
      { area: 'news', text: 'Actualités : « ✨ Générer le résumé » refait le résumé affiché — un soir ou un matin passé est réécrit avec les articles de l’époque — et l’app l’affiche dès qu’il arrive (avant : il refaisait toujours le créneau en cours et restait sur la page ouverte).' },
      { area: 'news', text: 'Actualités : les résumés sont réécrits à partir du texte complet des articles cités (quand le site le permet : franceinfo, RFI, France 24, sources juridiques… ; sinon titre et chapô). Résumés plus précis et « Pour comprendre » plus fourni. Le texte lu n’est jamais conservé.' }
    ]
  },
  {
    date: '2026-10-05',
    title: 'Résumé de l’actualité à la demande',
    items: [
      { area: 'news', text: 'Bouton « ✨ Générer le résumé » dans Actualité : lance le robot tout de suite. Avec un jeton GitHub dédié (limité au dépôt, permission Actions seulement, gardé sur l’appareil), c’est en un clic ; sinon le bouton explique comment le lancer depuis GitHub.' },
      { area: 'news', text: 'Rattrapage automatique : à l’ouverture de l’onglet, si le résumé du matin ou du soir manque, l’app le demande toute seule au robot.' },
      { area: 'app', text: 'Assistant de démarrage à la première ouverture : langue, style (mode clair/sombre, thème, police, aperçu en direct) puis choix des onglets, avec une description de chacun. Relançable depuis Paramètres ; lien direct vers la synchronisation pour retrouver ses données d’un autre appareil.' },
      { area: 'todo', text: 'To Do : le texte des tâches ne disparaît plus (il se réduisait à une barre vide quand la liste était dessinée onglet fermé).' },
      { area: 'calendar', text: 'Agenda : les heures s’affichent en haut de chaque évènement, même quand le titre prend deux lignes ; un créneau court tient sur une ligne avec son heure de début.' },
      { area: 'calendar', text: 'Agenda : les évènements écartés lors d’un chevauchement se suppriment (✕ sur la bande grise, « 🗑 Supprimer les écartés » dans la fenêtre du choix, ou tous ceux de la semaine depuis le bandeau). Pour un évènement répété, seul ce jour-là part ; Ctrl+Z annule.' },
      { area: 'calendar', text: 'Agenda : rappels en notification du système (par-dessus toutes les fenêtres de l’ordi). Panneau « 🔔 Rappels » à droite de l’agenda : activer sur cet appareil, délai par défaut (à l’heure, 5 min… 1 jour avant), bouton Tester. Chaque évènement peut avoir son propre rappel ou aucun (champ « Rappel »). Fonctionne tant que MyDesk est ouvert, même réduit.' },
      { area: 'sport', text: 'Sport : bouton « ▶ Chrono » sur les exercices tenus (planche, gainage, hollow) : 3 s pour se mettre en place, bip à l’objectif (ta dernière fois), « ✓ Stop » note les secondes dans la série. Le repos se lance tout seul dès qu’une série est notée (désactivable dans la carte de la séance).' },
      { area: 'sport', text: 'Sport : bilan à la fin de la séance — séries, répétitions et temps tenu, écart avec la dernière fois, records battus 🏆, variantes débloquées (passage en un clic) et détail exercice par exercice.' },
      { area: 'sport', text: 'Sport : « ▶ Mode guidé » en plein écran — un exercice et une série à la fois en gros, boutons − / + et « ✓ Série faite », repos qui défile tout seul (+15 s, passer) puis série suivante, chrono intégré pour les gainages, bilan à la fin. L’écran du téléphone reste allumé pendant la séance.' },
      { area: 'sport', text: 'Sport : « 📈 Historique et régularité » — séances faites cette semaine sur celles prévues dans l’agenda, série de semaines tenues 🔥, séances manquées des 2 dernières semaines (à rattraper en un clic), grille des 26 dernières semaines (faite / manquée / prévue), courbe de progression par exercice avec les changements de variante, et dernières séances. Rappel « Semaine : 2/3 · 🔥 4 » sous la liste des séances.' },
      { area: 'sport', text: 'Sport : rappel de séance — un créneau Sport de l’agenda envoie « 🏋️ Pecs & abdos » avec l’heure, les exercices et « Semaine : 1/3 » ; un clic sur la notification ouvre directement la séance. Le délai du rappel s’affiche dans la carte de la séance (🔔 10 min avant).' },
      { area: 'sport', text: 'Sport : programme v5, autant de tirage que de poussée et sans meuble solide. Rowing inversé à la barre de traction posée bas dans l’encadrement d’une porte, Y-T-W pour le haut du dos, pompes piquées pour les épaules, leg curl à la serviette pour l’arrière des cuisses. La 3e séance devient « Pecs, épaules & abdos ». Tes séances préfaites sont mises à jour en gardant ta progression sur les exercices qui ne changent pas.' },
      { area: 'sport', text: 'Sport : plus besoin de barre de traction. Le rowing avec sac à dos revient dans « Pecs & abdos » et « Pecs, épaules & abdos », à la dernière variante que tu avais faite ; le rowing à la barre reste dans la bibliothèque pour plus tard.' },
      { area: 'news', text: 'Bouton « 📰 Nouveaux articles » dans Actualité : le robot relit tout de suite les médias (sans refaire le résumé), puis l’app dit combien d’articles sont arrivés. Même jeton que « ✨ Générer le résumé ».' },
      { area: 'menu', text: 'Menu : un plat se retire de « À cuisiner » sans être cuisiné (✕ sur sa carte, ou « Retirer sans cuisiner » dans la recette) ; le stock et le journal ne changent pas. (Après la prochaine publication depuis le PC.)' },
      { area: 'menu', text: 'Menu : la préparation de la box du midi suit le nombre de box choisi — « pour 7 box : 1,26 kg de poulet… 840 g de pâtes (environ 1,7 paquet de 500 g) » — et se recalcule quand on change le nombre de repas. (Après la prochaine publication depuis le PC.)' },
      { area: 'snake', text: 'Snake entièrement refait : 7 modes (Classique, Sans bords, Murs, Portails, Poison, Chrono 60 s, Zen), défi du jour (même tirage toute la journée, objectif, série de jours 🔥), réglages de vitesse (dont Turbo qui accélère), taille du plateau, 1/3/5 pommes, 7 couleurs de serpent et 4 terrains. Mouvement fluide, serpent qui regarde la pomme et ouvre la bouche, pomme dorée +3, combos, particules ; bruitages et musique synthétisés (la musique accélère avec le serpent), volume réglable. Records par mode, 15 trophées, statistiques ; démo jouée par l’ordi dans le menu ; au téléphone, glisser ou croix directionnelle.' },
      { area: 'news', text: 'Robot plus fiable : 4 passages prévus par heure (GitHub en sautait beaucoup) et nouveaux essais espacés quand Gemini est saturé.' },
      { area: 'menu', text: 'Menu : les repas se comptent en entiers (1 ou 2, jamais 1,5), au choix comme à l’affichage. « Combien de repas ? » reprend le nombre de ta dernière liste pour chaque recette (la box du midi prise pour 7 revient à 7), et un bouton « ✕ Retirer » enlève une recette de la sélection sans quitter la fenêtre.' },
      { area: 'menu', text: 'Menu : « 👤 Mon profil » (sexe, âge, taille, poids, activité) fixe ce que vaut un repas pour toi ; le nombre de repas de chaque recette et ce que la liste achète suivent. Chaque compte garde le sien.' },
      { area: 'menu', text: 'Listes de courses : bouton « 🔄 Recalculer avec le stock » (et recalcul en revenant sur l’onglet), bouton « 🗑️ Supprimer la liste », et quantités arrondies au-dessus — 2 saucisses ou 2 œufs plutôt que 1,5.' },
      { area: 'menu', text: 'Menu réservé : l’onglet n’apparaît (onglets, Paramètres, assistant de démarrage) que sur un appareil synchronisé avec un compte GitHub qui a accès au Gist Menu. Sans ce jeton, ou s’il est retiré, l’onglet disparaît et la copie locale des données Menu est effacée.' },
      { area: 'menu', text: 'Courses : plus jamais d’œufs de poules en cage. Seuls les œufs qui annoncent plein air, sol, bio ou Label Rouge sont proposés (une boîte sans mode d’élevage indiqué est refusée), y compris pour un ancien choix manuel.' },
      { area: 'menu', text: 'Farines : sarrasin (blé noir), pois chiche, riz, châtaigne, épeautre, complète et maïs ne sont plus confondues avec la farine de blé — la farine de blé du stock ne couvre plus des galettes de sarrasin. (Après la prochaine publication depuis le PC.)' },
      { area: 'menu', text: 'Liste de courses : « 🛒 Remplir mon panier U ». La liste s’ouvre sur coursesu.com et un favori « Remplir panier U » (à installer une fois) met tous les produits dans ton panier, avec les bonnes quantités, sur ton compte et ton drive. Recliquer ne double rien.' },
      { area: 'menu', text: 'Menu : 330 ingrédients de recettes mieux reconnus (crozets, passata, beaufort, poissons, pruneaux…) et des prix retrouvés pour la crème végétale, la pâte filo, les galettes de sarrasin, les cacahuètes, l’orange, le Tabasco ou les cèpes, qui comptaient 0 €. (Après la prochaine publication depuis le PC.)' }
    ]
  },
  {
    date: '2026-10-04',
    title: 'Actualité, objectifs de révision et onglets à la carte',
    items: [
      { area: 'news', text: 'Nouvel onglet Actualité : chaque jour, les titres de RFI, France 24, franceinfo, Courrier international, Public Sénat, LCP, du Conseil constitutionnel, du Conseil d’État et de sites juridiques, classés en International, France et Justice & droit.' },
      { area: 'news', text: '« L’essentiel » le matin et le soir : les sujets importants résumés par IA (Gemini), avec une ligne « Pour comprendre » et les liens vers les sources. Si l’IA ne répond pas, les sujets les plus repris par les médias s’affichent à la place.' },
      { area: 'news', text: 'Navigation sur 14 jours, filtres par thème, pastille « Nouveau » et lecture hors connexion de la dernière version.' },
      { area: 'news', text: 'Résumé de la semaine : bouton Jour | Semaine à côté du choix du jour, avec les faits les plus importants de la semaine par thème, condensés et datés. Refait chaque soir.' },
      { area: 'news', text: 'Justice & droit enrichi : Dalloz Actu Étudiant, Libération, RFI, jurisprudence du Conseil d’État, CNIL, Jus Politicum et la Revue des droits et libertés fondamentaux. Son résumé quotidien s’affiche aussi le soir.' },
      { area: 'calendar', text: 'Objectifs de révision (ex. 4 h par semaine) dans la colonne de droite : on attrape un objectif et on le dépose dans l’agenda pour planifier une séance, avec la progression de la semaine.' },
      { area: 'calendar', text: 'Cliquer-glisser vers le bas sur un jour crée un évènement sur la plage choisie et ouvre directement ses détails.' },
      { area: 'todo', text: 'To Do List repensée : listes en cartes colorées avec progression, ajout rapide au clavier (Entrée pour enchaîner, « demain », « vendredi », « 12/10 » pour l’échéance, « ! » pour important), échéances colorées (en retard, aujourd’hui), étoile « importante », tâches faites rangées dans « Terminées ».' },
      { area: 'todo', text: 'To Do List : vues Toutes / Aujourd’hui / Importantes, recherche, résumé de ce qui reste à faire, glisser une tâche pour la déplacer (même vers une autre liste), suppression annulable.' },
      { area: 'menu', text: 'Onglet Menu intégré au site : couleurs, police et mode sombre de MyDesk, navigation Recettes / Courses / À cuisiner / Stock / Catalogue dans la barre du haut (le dernier écran ouvert est retenu), une seule zone qui défile sur toute la hauteur.' },
      { area: 'menu', text: 'Menu en nombre de repas : un repas = ce que mange un homme de 20 ans, 73 kg, 1,85 m (≈ 930 kcal). « Finir la sélection » demande combien de repas faire de chaque recette, la liste achète juste ce qu’il faut, et « À cuisiner », le stock et le journal comptent en repas. (Les écrans changent après la prochaine publication depuis le PC.)' },
      { area: 'menu', text: 'Menu : œufs, concombres, citrons, avocats… comptés à la pièce partout (recettes, stock « 8 œufs », liste de courses « 1 boîte de 10 », prix par pièce), sans poids moyen deviné. Le prix des recettes compte enfin ces ingrédients (l’œuf valait 0 € dans plus de 1 000 recettes).' },
      { area: 'menu', text: 'Liste de courses : quand la recette compte en pièces et le magasin vend au poids (ou l’inverse), plus de conversion devinée — la ligne passe « à choisir », montre ce que demande la recette (« 2 gousses d’ail ») et tous les produits avec leur prix au kg ou à la pièce ; tu prends le paquet et la quantité.' },
      { area: 'app', text: 'Ordre des onglets au choix : glisser un onglet dans la barre (appui long sur téléphone) ou flèches ▲▼ dans Paramètres. L’ordre est synchronisé avec le profil.' },
      { area: 'app', text: 'Nouvel onglet Patch-Notes : toutes les mises à jour depuis le début du fork.' }
    ]
  },
  {
    date: '2026-10-01',
    title: 'Agenda plus souple',
    items: [
      { area: 'calendar', text: 'Lieu pour chaque évènement, avec suggestions des lieux déjà utilisés, affiché sous le titre (repris aussi à l’import .ics).' },
      { area: 'calendar', text: 'Déplacer un évènement en le glissant (appui long sur téléphone). Dans une série, seule la séance déplacée change. Échap annule.' },
      { area: 'calendar', text: 'Abonnement pour le téléphone : un lien d’agenda (.ics) à ajouter dans Google Agenda ou Calendrier, mis à jour à chaque synchro (option dans Synchronisation).' },
      { area: 'calendar', text: 'Clic droit sur un évènement existant : il s’ouvre pour être modifié, au lieu d’en créer un nouveau.' }
    ]
  },
  {
    date: '2026-09-30',
    title: 'Synchro fiable et Révisions plus complètes',
    items: [
      { area: 'sync', text: 'Fusion horodatée : un appareil ou un onglet resté sur une vieille version ne peut plus effacer ni écraser des données plus récentes. Un seul onglet synchronise à la fois.' },
      { area: 'sync', text: 'Historique / restaurer : revenir à une ancienne synchro, en choisissant élément par élément ce qu’on récupère (annulable).' },
      { area: 'anki', text: 'Récupérer des cartes perdues depuis l’historique de la synchro, sans rien supprimer.' },
      { area: 'calendar', text: 'Chevauchements : quand deux évènements se superposent, on choisit le vrai ; les autres deviennent des bandes grises barrées.' },
      { area: 'calendar', text: 'Petite barre rouge à l’heure actuelle sur le jour en cours.' },
      { area: 'anki', text: 'Parcourir : sélection de plusieurs cartes (Maj+clic pour une plage) pour changer leur paquet ou leur tag d’un coup.' },
      { area: 'anki', text: 'Ajout de carte : aucun paquet imposé par défaut ; le dernier paquet utilisé est gardé pour les cartes suivantes.' },
      { area: 'anki', text: 'Partager un paquet : fichier compatible Anki, avec le choix des tags, pour des amis sans compte GitHub.' },
      { area: 'anki', text: 'Marquer une fiche « à confirmer » quand l’info n’est pas sûre (touche C en révision), badge dans Parcourir et recherche is:aconfirmer.' },
      { area: 'sport', text: 'Séances préfaites à choisir une par une, avec jour, heure et répétition pour les placer dans l’agenda.' }
    ]
  },
  {
    date: '2026-09-29',
    title: 'Onglet Révisions',
    items: [
      { area: 'anki', text: 'Nouvel onglet Révisions : cartes mémoire façon Anki avec l’algorithme FSRS. Paquets et sous-paquets, cartes basiques, inversées et à trous, raccourcis clavier, limites par jour.' },
      { area: 'anki', text: 'Import des exports texte d’Anki, recherche dans Parcourir (deck:, tag:, is:…), statistiques (rétention réelle, prévision) et réglages (rétention visée, étapes).' },
      { area: 'anki', text: 'Tags liés au paquet : renommer un tag change toutes ses cartes ; vue Tags pour créer, renommer, fusionner ou supprimer.' },
      { area: 'app', text: 'L’onglet ouvert (et la vue des Révisions) est retrouvé après un rafraîchissement.' }
    ]
  },
  {
    date: '2026-09-28',
    title: 'Début du fork : synchro, Sport, Menu, app installable',
    items: [
      { area: 'sync', text: 'Synchronisation entre appareils via un Gist GitHub privé : mêmes données sur l’ordi et le téléphone.' },
      { area: 'calendar', text: 'Import de fichiers iCalendar (.ics), impression de l’emploi du temps, heure de fin liée à la durée.' },
      { area: 'calendar', text: 'Supprimer ou modifier une seule occurrence d’une série ; annuler / rétablir avec Ctrl+Z.' },
      { area: 'calendar', text: 'Cours plus lisibles : titres complets, poignées de redimensionnement discrètes.' },
      { area: 'sport', text: 'Nouvel onglet Sport : séances au poids du corps, progression guidée par échelles d’exercices, minuteur de repos, guide avec vidéos, lien avec l’agenda.' },
      { area: 'menu', text: 'Nouvel onglet Menu : l’outil Menu utilisable sans le PC.' },
      { area: 'app', text: 'App installable sur téléphone et ordinateur (icônes, bouton Installer), affichage mobile et mode sombre cohérent.' },
      { area: 'app', text: 'Plus de style périmé après une mise à jour (fichiers versionnés).' }
    ]
  }
];

const PATCH_NOTES_AREAS = ['app', 'sync', 'calendar', 'anki', 'sport', 'news', 'todo', 'menu'];

const PATCH_NOTES_TRANSLATIONS = {
  fr: {
    tab: 'Patch-Notes',
    title: '📝 Patch-Notes',
    intro: 'Toutes les mises à jour depuis le début du fork, le 28 septembre 2026.',
    all: 'Tout',
    count: '{count} nouveautés',
    countOne: '1 nouveauté',
    isNew: 'Nouveau',
    newBadge: 'Nouveautés depuis ta dernière visite',
    empty: 'Aucune mise à jour pour ce filtre.',
    areas: { app: 'Application', sync: 'Synchro', calendar: 'Agenda', anki: 'Révisions', sport: 'Sport', news: 'Actualités', todo: 'To Do', menu: 'Menu', snake: 'Snake' }
  },
  en: {
    tab: 'Patch Notes',
    title: '📝 Patch Notes',
    intro: 'Every update since the fork started on 28 September 2026 (notes in French).',
    all: 'All',
    count: '{count} changes',
    countOne: '1 change',
    isNew: 'New',
    newBadge: 'New since your last visit',
    empty: 'No updates for this filter.',
    areas: { app: 'App', sync: 'Sync', calendar: 'Calendar', anki: 'Flashcards', sport: 'Sport', news: 'News', todo: 'To-Do', menu: 'Menu', snake: 'Snake' }
  },
  vi: {
    tab: 'Ghi chú cập nhật',
    title: '📝 Ghi chú cập nhật',
    intro: 'Mọi cập nhật kể từ khi bắt đầu bản fork, ngày 28/09/2026 (bằng tiếng Pháp).',
    all: 'Tất cả',
    count: '{count} thay đổi',
    countOne: '1 thay đổi',
    isNew: 'Mới',
    newBadge: 'Mới kể từ lần ghé trước',
    empty: 'Không có cập nhật cho bộ lọc này.',
    areas: { app: 'Ứng dụng', sync: 'Đồng bộ', calendar: 'Lịch', anki: 'Ôn tập', sport: 'Thể thao', news: 'Tin tức', todo: 'Việc cần làm', menu: 'Thực đơn', snake: 'Rắn' }
  }
};

function registerPatchNotesTranslations() {
  Object.keys(translations).forEach((language) => {
    const source = PATCH_NOTES_TRANSLATIONS[language] || PATCH_NOTES_TRANSLATIONS.fr;
    translations[language].patchNotes = source;
    if (translations[language].tabs) translations[language].tabs.patchnotes = source.tab;
  });
}

const patchNotesState = { area: 'all', seenBefore: null };

function patchNotesReadSeen() {
  try {
    return localStorage.getItem(PATCH_NOTES_SEEN_KEY) || '';
  } catch (error) {
    return '';
  }
}

function patchNotesMarkSeen() {
  try {
    localStorage.setItem(PATCH_NOTES_SEEN_KEY, PATCH_NOTES[0].date);
  } catch (error) {
    // stockage indisponible : la pastille reviendra, sans gravité
  }
  patchNotesUpdateDot();
}

// Pastille sur l'onglet quand des notes sont plus récentes que la dernière visite.
function patchNotesUpdateDot() {
  const button = document.querySelector('.tab-link[data-target="patchnotes"]');
  if (!button) return;
  const seen = patchNotesReadSeen();
  const unread = !seen || PATCH_NOTES[0].date > seen;
  button.classList.toggle('has-dot', unread);
  button.title = unread ? t('patchNotes.newBadge') : '';
}

function patchNotesEl(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined && text !== null) element.textContent = text;
  return element;
}

function patchNotesDateLabel(date) {
  const [year, month, day] = date.split('-').map(Number);
  const label = new Date(year, month - 1, day).toLocaleDateString(getCurrentLocale(), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const text = label.charAt(0).toUpperCase() + label.slice(1);
  return day === 1 && currentLanguage === 'fr' ? text.replace(/ 1 /, ' 1er ') : text;
}

function renderPatchNotes() {
  const container = document.getElementById('patchnotes-app');
  if (!container) return;
  container.innerHTML = '';

  const head = patchNotesEl('header', 'patchnotes-head');
  head.append(patchNotesEl('h2', 'patchnotes-title', t('patchNotes.title')));
  head.append(patchNotesEl('p', 'patchnotes-intro', t('patchNotes.intro')));
  container.append(head);

  const filters = patchNotesEl('div', 'patchnotes-filters');
  ['all', ...PATCH_NOTES_AREAS].forEach((area) => {
    const chip = patchNotesEl(
      'button',
      `patchnotes-chip patchnotes-area--${area}`,
      area === 'all' ? t('patchNotes.all') : t(`patchNotes.areas.${area}`)
    );
    chip.type = 'button';
    chip.classList.toggle('is-active', patchNotesState.area === area);
    chip.setAttribute('aria-pressed', patchNotesState.area === area ? 'true' : 'false');
    chip.addEventListener('click', () => {
      patchNotesState.area = area;
      renderPatchNotes();
    });
    filters.append(chip);
  });
  container.append(filters);

  const seen = patchNotesState.seenBefore;
  const timeline = patchNotesEl('div', 'patchnotes-timeline');
  PATCH_NOTES.forEach((release) => {
    const items = release.items.filter((item) => patchNotesState.area === 'all' || item.area === patchNotesState.area);
    if (!items.length) return;
    const block = patchNotesEl('section', 'patchnotes-release');
    const top = patchNotesEl('div', 'patchnotes-release__head');
    const titles = patchNotesEl('div', 'patchnotes-release__titles');
    titles.append(patchNotesEl('time', 'patchnotes-release__date', patchNotesDateLabel(release.date)));
    titles.lastChild.setAttribute('datetime', release.date);
    titles.append(patchNotesEl('h3', 'patchnotes-release__title', release.title));
    top.append(titles);
    const meta = patchNotesEl('div', 'patchnotes-release__meta');
    // Première visite : seule la dernière mise à jour est « nouvelle ».
    const isNew = seen !== null && (seen ? release.date > seen : release === PATCH_NOTES[0]);
    if (isNew) meta.append(patchNotesEl('span', 'patchnotes-new', t('patchNotes.isNew')));
    meta.append(
      patchNotesEl(
        'span',
        'patchnotes-release__count',
        items.length === 1 ? t('patchNotes.countOne') : t('patchNotes.count', { count: items.length })
      )
    );
    top.append(meta);
    block.append(top);

    const list = patchNotesEl('ul', 'patchnotes-list');
    items.forEach((item) => {
      const row = patchNotesEl('li', 'patchnotes-item');
      row.append(patchNotesEl('span', `patchnotes-tag patchnotes-area--${item.area}`, t(`patchNotes.areas.${item.area}`)));
      row.append(patchNotesEl('span', 'patchnotes-text', item.text));
      list.append(row);
    });
    block.append(list);
    timeline.append(block);
  });
  if (!timeline.children.length) timeline.append(patchNotesEl('p', 'patchnotes-empty', t('patchNotes.empty')));
  container.append(timeline);
}

function initPatchNotes() {
  const panel = document.getElementById('patchnotes');
  if (!panel) return;
  patchNotesUpdateDot();
  let wasActive = false;
  const check = () => {
    const active = panel.classList.contains('active');
    if (active && !wasActive) {
      // « Nouveau » sur ce qui est arrivé depuis la visite précédente.
      patchNotesState.seenBefore = patchNotesReadSeen();
      renderPatchNotes();
      patchNotesMarkSeen();
    }
    wasActive = active;
  };
  new MutationObserver(check).observe(panel, { attributes: true, attributeFilter: ['class'] });
  check();
  renderPatchNotes();
}
