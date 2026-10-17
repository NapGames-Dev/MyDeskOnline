/* ═══════════════════════════════════════════════════════════
   BIBLIOTHÈQUE D'EXERCICES AU POIDS DU CORPS
   Chaque « échelle » va de la variante la plus facile à la plus
   difficile. Règle de progression : quand toutes les séries
   atteignent le haut de la fourchette, on passe à l'étape
   suivante ; si on n'atteint pas le bas, on redescend.
   Exercices avec sac à dos (load: true) : on ajoute d'abord du
   poids ; l'app ne propose la variante suivante qu'ensuite.
   ═══════════════════════════════════════════════════════════ */

const SPORT_LADDERS = {
  push: {
    name: 'Pompes',
    muscles: 'Pecs, triceps, avant des épaules',
    cue: 'Corps droit et gainé, coudes à ~45° du buste, poitrine à un poing du sol.',
    note: 'Tempo : descends en 2 s, remonte fort. Inspire en descendant, souffle en poussant. Tu dois sentir les pecs et l’arrière des bras. Douleur vive à l’épaule ou au poignet : arrête. Sol lisse : pieds nus, jamais en chaussettes.',
    steps: [
      {
        name: 'Pompes contre un mur',
        reps: '10–15',
        how: [
          'Debout face au mur, à un grand pas. Mains à hauteur de poitrine, un peu plus larges que les épaules.',
          'Corps droit, abdos et fessiers serrés.',
          'Plie les bras en 2 s, coudes à ~45° du buste, jusqu’à ce que le nez frôle le mur. Pousse en soufflant.'
        ],
        mistakes: [
          'Hanches qui restent en arrière : serre les fessiers et avance le bassin.',
          'Coudes à l’horizontale : rapproche-les du buste.'
        ]
      },
      {
        name: 'Pompes inclinées (mains sur le lit ou le canapé)',
        reps: '8–15',
        how: [
          'Mains sur le bord du lit ou du canapé (calé contre un mur), un peu plus larges que les épaules.',
          'Recule les pieds, corps droit de la tête aux talons.',
          'Descends en 2 s jusqu’à ce que la poitrine frôle le bord, coudes à ~45°.',
          'Pousse jusqu’aux bras tendus en soufflant.'
        ],
        mistakes: [
          'Bassin qui s’affaisse : serre abdos et fessiers avant de descendre.',
          'Poignets gênés : appuie-toi sur la partie la plus ferme du bord.'
        ]
      },
      {
        name: 'Pompes sur les genoux',
        reps: '8–15',
        how: [
          'Genoux au sol, mains un peu plus larges que les épaules, doigts écartés.',
          'Épaules, hanches et genoux alignés. Abdos et fessiers serrés.',
          'Descends en 2 s, poitrine à un poing du sol, coudes à ~45°.',
          'Pousse jusqu’aux bras tendus en soufflant.'
        ],
        mistakes: [
          'Fesses en l’air : avance les épaules au-dessus des mains.',
          'Tête qui plonge : regarde le sol 30 cm devant tes mains.'
        ]
      },
      {
        name: 'Pompes classiques',
        reps: '8–15',
        how: [
          'Mains à plat, un peu plus larges que les épaules, doigts écartés vers l’avant. Pieds nus, joints ou largeur de hanches.',
          'Corps droit comme une planche : abdos et fessiers serrés.',
          'Descends en 2 s, poitrine à un poing du sol, coudes à ~45° du buste (en flèche, pas en T).',
          'Pousse le sol jusqu’aux bras tendus en soufflant.'
        ],
        mistakes: [
          'Bas du dos qui tire : ton bassin tombe. Serre les fessiers, ou arrête la série.',
          'Gêne à l’avant de l’épaule : rapproche les coudes du buste et resserre un peu les mains.',
          'Poignets douloureux : fais-les sur les poings, sur une serviette pliée.'
        ]
      },
      {
        name: 'Pompes pieds surélevés',
        reps: '8–15',
        how: [
          'Pointes de pieds sur le bord du lit ou du canapé (calé contre un mur), mains au sol comme en pompes classiques.',
          'Corps droit, fessiers serrés : le bassin ne doit pas pendre.',
          'Descends en 2 s, poitrine à un poing du sol, coudes à ~45°. Pousse en soufflant.',
          'Les bras portent ≈ 70–74 % du poids du corps selon la hauteur (≈ 64 % en pompes classiques).'
        ],
        mistakes: [
          'Dos qui se creuse : serre fessiers et abdos, ou pose les pieds plus bas.',
          'La tête touche avant la poitrine : rentre le menton.'
        ]
      },
      {
        name: 'Pompes pieds surélevés, descente lente',
        reps: '6–12',
        how: [
          'Même position que les pompes pieds surélevés.',
          'Descends en 3 s. Marque 1 s d’arrêt en bas, poitrine à un poing du sol, sans te relâcher.',
          'Remonte en poussant fort, en soufflant. Repars sans pause en haut.'
        ],
        mistakes: [
          'Tempo qui s’accélère : compte « 1001, 1002, 1003 » à voix basse.',
          'Tu ne tiens plus l’arrêt en bas : la série est finie.'
        ]
      },
      {
        name: 'Pompes archer',
        reps: '5–8 / côté',
        how: [
          'Mains très écartées (environ deux fois la largeur des épaules), doigts tournés vers l’extérieur.',
          'Descends en 2 s vers une main : ce coude plie, l’autre bras reste presque tendu et aide peu.',
          'Poitrine près du sol, hanches face au sol. Pousse en soufflant.',
          'Alterne les côtés.'
        ],
        mistakes: [
          'Hanches qui tournent : écarte les pieds.',
          'Douleur à l’épaule ou au coude du bras tendu : plie-le un peu, ou reviens à la variante précédente.'
        ]
      }
    ]
  },
  wide: {
    name: 'Pompes larges',
    muscles: 'Pecs, avant des épaules, triceps (une variante des pompes, pas « plus pecs » que les classiques)',
    cue: 'Mains ~1,5× la largeur des épaules, épaules basses, amplitude complète.',
    steps: [
      {
        name: 'Pompes larges sur les genoux',
        reps: '8–12',
        how: [
          'Genoux au sol, mains environ 1,5 fois plus écartées que les épaules.',
          'Corps aligné des épaules aux genoux.',
          'Descends lentement, la poitrine entre les mains.'
        ],
        mistakes: ['Épaules qui remontent vers les oreilles.']
      },
      {
        name: 'Pompes larges',
        reps: '8–12',
        how: [
          'Position de pompe classique, mains ~1,5× la largeur des épaules.',
          'Coudes au-dessus des poignets en bas du mouvement.',
          'Amplitude complète, 2 secondes à la descente.'
        ],
        mistakes: ['Douleur à l’avant de l’épaule : resserre un peu les mains.']
      },
      {
        name: 'Pompes larges pieds surélevés',
        reps: '8–12',
        how: ['Pieds sur le bord du lit ou du canapé (calé contre un mur), mains larges.', 'Plus dur que les pompes larges au sol : plus de poids sur les bras.'],
        mistakes: ['Cambrer le dos.']
      }
    ]
  },
  close: {
    name: 'Pompes serrées',
    muscles: 'Triceps, pecs, avant des épaules',
    cue: 'Mains sous les épaules, coudes qui frôlent les côtes.',
    note: 'Tempo : descends en 2 s, remonte fort en soufflant. Tu dois sentir l’arrière des bras et le milieu des pecs. Douleur au coude ou au poignet : écarte un peu les mains. Sol lisse : pieds nus.',
    steps: [
      {
        name: 'Pompes serrées inclinées (mains sur le lit ou le canapé)',
        reps: '8–15',
        how: [
          'Mains sur le bord du lit ou du canapé (calé contre un mur), écartées de la largeur des épaules.',
          'Recule les pieds, corps droit.',
          'Descends en 2 s, coudes le long des côtes, jusqu’à frôler le bord. Pousse en soufflant.'
        ],
        mistakes: ['Coudes qui s’écartent : imagine une feuille serrée sous chaque aisselle.']
      },
      {
        name: 'Pompes serrées sur les genoux',
        reps: '8–15',
        how: [
          'Genoux au sol, mains sous les épaules, doigts vers l’avant.',
          'Épaules, hanches et genoux alignés.',
          'Descends en 2 s, coudes qui frôlent les côtes, poitrine à un poing du sol. Pousse en soufflant.'
        ],
        mistakes: [
          'Coudes qui s’écartent : ralentis et pense « coudes vers les pieds ».',
          'Fesses en l’air : avance les épaules au-dessus des mains.'
        ]
      },
      {
        name: 'Pompes serrées',
        reps: '8–15',
        how: [
          'Position de pompe, mains sous les épaules (largeur d’épaules, pas plus serré), doigts vers l’avant.',
          'Corps droit, abdos et fessiers serrés.',
          'Descends en 2 s : les coudes partent vers l’arrière et frôlent les côtes. Poitrine à un poing du sol.',
          'Pousse jusqu’aux bras tendus en soufflant.'
        ],
        mistakes: [
          'Bassin qui tombe : serre les fessiers, ou arrête la série.',
          'Coude douloureux : écarte les mains de 2–3 cm.'
        ]
      },
      {
        name: 'Pompes diamant',
        reps: '6–12',
        how: [
          'Mains sous le sternum, pouces et index qui se touchent en losange.',
          'Corps droit. Descends en 2 s, poitrine vers les mains, coudes vers l’arrière.',
          'Pousse jusqu’aux bras tendus en soufflant.'
        ],
        mistakes: [
          'Poignets ou coudes douloureux : écarte les mains de 10 cm, ou reviens aux pompes serrées avec une descente en 3 s.',
          'Coudes qui partent sur les côtés : la série est finie.'
        ]
      }
    ]
  },
  pull: {
    name: 'Rowing (tirage)',
    muscles: 'Dos, arrière des épaules, biceps',
    cue: 'Tire la poitrine vers l’appui, serre les omoplates, redescends lentement.',
    note: 'Échelle exclue par défaut (pas de meuble assez solide) : remplacée par le rowing avec sac à dos.',
    steps: [
      {
        name: 'Rowing serviette à la porte',
        reps: '10–15',
        how: [
          'Passe une serviette solide autour des deux poignées d’une porte FERMÉE.',
          'Place-toi du côté vers lequel la porte se ferme (tu tires pour la fermer, jamais pour l’ouvrir).',
          'Pieds près de la porte, penche-toi en arrière bras tendus.',
          'Tire en serrant les omoplates, coudes le long du corps. Plus tes pieds sont proches de la porte, plus c’est dur.'
        ],
        mistakes: ['Poignée fragile : vérifie-la avant.', 'Tirer avec les bras seulement, sans serrer les omoplates.']
      },
      {
        name: 'Rowing inversé sous une table, genoux fléchis',
        reps: '8–12',
        how: [
          'Allonge-toi sous une table LOURDE et stable, mains au bord, écartées de la largeur des épaules.',
          'Pieds au sol, genoux fléchis, corps gainé.',
          'Tire la poitrine vers la table, puis redescends en 2 secondes.'
        ],
        mistakes: ['Table qui bascule : teste-la d’abord en tirant doucement.', 'Hanches qui tombent.']
      },
      {
        name: 'Rowing inversé sous une table, jambes tendues',
        reps: '8–12',
        how: ['Même position, jambes tendues, appui sur les talons.', 'Corps droit comme une planche.'],
        mistakes: ['Hanches qui tombent.']
      },
      {
        name: 'Rowing inversé pieds surélevés',
        reps: '8–12',
        how: ['Talons posés sur une chaise, corps horizontal.', 'Tire jusqu’à ce que la poitrine touche presque la table.'],
        mistakes: ['Demi-amplitude.']
      }
    ]
  },
  row: {
    name: 'Rowing avec sac à dos',
    muscles: 'Dos (grands dorsaux, milieu du dos), arrière des épaules, biceps',
    cue: 'Dos plat, tire le coude vers la hanche, serre l’omoplate 1 s en haut.',
    note: 'Sac chargé de bouteilles (1,5 L = 1,5 kg), calées avec un pull, sac fermé. Tiens-le par les bretelles, plus solides que la poignée. Ajoute du poids avant de changer de variante : +0,5 à 1,5 kg quand toutes les séries sont en haut de la fourchette. Maximum 10–12 kg pour un sac ordinaire. Tu dois sentir le côté du dos, sous l’aisselle, et entre les omoplates. Anormal : douleur vive dans le bas du dos.',
    steps: [
      {
        name: 'Rowing penché deux mains avec sac à dos',
        reps: '12–20',
        load: true,
        how: [
          'Debout, pieds largeur de hanches, genoux un peu fléchis. Une bretelle dans chaque main.',
          'Pousse les fesses en arrière et penche le buste à ~45°, dos plat, regard au sol devant toi.',
          'Tire le sac vers le nombril en soufflant, coudes près du corps. Serre les omoplates 1 s.',
          'Redescends en 2 s jusqu’aux bras tendus.'
        ],
        mistakes: [
          'Bas du dos qui tire : plie plus les genoux et gaine le ventre. Si ça persiste, passe au rowing un bras, en appui.',
          'Buste qui se redresse à chaque tirage : le sac est trop lourd.'
        ]
      },
      {
        name: 'Rowing un bras avec sac à dos',
        reps: '10–15 / bras',
        load: true,
        how: [
          'Une main et le genou du même côté sur le lit ou le canapé, l’autre pied au sol, un peu écarté. Dos plat, presque parallèle au sol.',
          'Sac dans l’autre main, les deux bretelles réunies, bras tendu sous l’épaule.',
          'Tire le coude vers la hanche en soufflant, le long des côtes. Serre l’omoplate 1 s en haut.',
          'Redescends en 2 s, laisse l’épaule s’étirer vers le sol. Toutes les répétitions d’un côté, puis change.'
        ],
        mistakes: [
          'Buste qui tourne pour lancer le sac : garde les deux épaules parallèles au sol, allège si besoin.',
          'Tu sens surtout le biceps : tire avec le coude, pas avec la main.',
          'Épaule qui remonte vers l’oreille : baisse-la avant de tirer.'
        ]
      },
      {
        name: 'Rowing un bras avec sac à dos, pause et descente lente',
        reps: '10–20 / bras',
        load: true,
        how: [
          'Même position que le rowing un bras, sac au maximum.',
          'Tire le coude vers la hanche, puis tiens 2 s en haut, omoplate serrée.',
          'Redescends en 3 s jusqu’au bras tendu, épaule étirée.'
        ],
        mistakes: [
          'Tu ne tiens plus les 2 s en haut : la série est finie.',
          'Dos qui s’arrondit en fin de série : arrête-toi là.'
        ]
      }
    ]
  },
  invrow: {
    name: 'Rowing inversé à la barre',
    muscles: 'Dos (milieu du dos, grands dorsaux), arrière des épaules, biceps',
    cue: 'Corps gainé, tire la poitrine vers la barre, serre les omoplates, redescends en 2 s.',
    note: 'Barre à pression dans l’encadrement d’une porte (pas entre deux cloisons en plâtre), à hauteur de hanches. Caoutchouc ou feutre sous les embouts pour ne pas marquer la peinture ; serre fort, teste en tirant doucement puis en mettant ton poids, et resserre-la à chaque séance. Plus la barre est basse, plus c’est dur.',
    steps: [
      {
        name: 'Rowing inversé à la barre, barre haute',
        reps: '8–12',
        how: [
          'Barre à hauteur de poitrine, mains écartées de la largeur des épaules.',
          'Avance les pieds sous la barre et penche-toi en arrière, bras tendus, corps droit.',
          'Tire la poitrine vers la barre en serrant les omoplates, coudes à ~45° du buste.',
          'Redescends en 2 secondes jusqu’aux bras tendus.'
        ],
        mistakes: ['Hanches qui cassent.', 'Épaules qui remontent vers les oreilles.']
      },
      {
        name: 'Rowing inversé à la barre, genoux fléchis',
        reps: '8–12',
        how: [
          'Barre à hauteur de hanches. Allongé dessous, mains largeur d’épaules, pieds à plat au sol, genoux fléchis.',
          'Corps gainé des épaules aux genoux.',
          'Monte jusqu’à ce que la poitrine frôle la barre, serre les omoplates 1 seconde, redescends en 2 secondes.'
        ],
        mistakes: ['Fesses qui pendent.', 'Tirer avec les bras sans serrer les omoplates.']
      },
      {
        name: 'Rowing inversé à la barre, jambes tendues',
        reps: '8–12',
        how: ['Même position, jambes tendues, appui sur les talons.', 'Corps droit comme une planche du début à la fin.'],
        mistakes: ['Hanches qui tombent.', 'Demi-amplitude.']
      },
      {
        name: 'Rowing inversé à la barre, pieds surélevés',
        reps: '8–12',
        how: ['Talons posés sur le lit ou le canapé, corps horizontal sous la barre.', 'Tire jusqu’à toucher presque la barre, descente lente.'],
        mistakes: ['Demi-amplitude.', 'Support qui glisse.']
      }
    ]
  },
  slidepull: {
    name: 'Tirage glissé au sol',
    muscles: 'Grands dorsaux, arrière des épaules, biceps',
    cue: 'Sur le ventre, tire les coudes vers les côtes pour faire glisser le corps vers l’avant.',
    note: 'Sol lisse obligatoire : serviette sous le ventre et les cuisses, pieds en chaussettes, paumes nues et sèches. Exercice peu étudié : il complète le rowing, il ne le remplace pas. Tu dois sentir les côtés du dos, sous les aisselles. Anormal : pincement dans le bas du dos ou la nuque.',
    steps: [
      {
        name: 'Tirage glissé au sol',
        reps: '8–15',
        how: [
          'Sur le ventre, serviette sous le ventre et les cuisses. Bras tendus devant toi, mains à plat, largeur d’épaules.',
          'Écrase les paumes dans le sol et tire les coudes vers les côtes en soufflant : le corps glisse vers l’avant.',
          'Arrête quand les mains sont à hauteur des épaules. Front près du sol.',
          'Repousse-toi doucement en arrière jusqu’aux bras tendus.'
        ],
        mistakes: [
          'Mains qui glissent : essuie tes paumes et le sol, écarte les doigts.',
          'Bas du dos qui pince : serre les fessiers, ne te cambre pas.',
          'Nuque qui tire : regarde le sol.'
        ]
      },
      {
        name: 'Tirage glissé au sol, pause 2 s',
        reps: '8–15',
        how: [
          'Même mouvement que le tirage glissé.',
          'En fin de tirage, tiens 2 s : coudes serrés contre les côtes, épaules basses.',
          'Repousse-toi doucement en arrière.'
        ],
        mistakes: ['Épaules qui montent vers les oreilles pendant la pause : baisse-les.']
      },
      {
        name: 'Tirage glissé au sol avec sac à dos',
        reps: '8–15',
        load: true,
        how: [
          'Même mouvement, sac à dos porté sur le dos, bretelles serrées.',
          'Départ 4,5 kg (3 bouteilles), puis +1,5 kg quand toutes les séries sont en haut de la fourchette.',
          'Garde la pause de 2 s en fin de tirage.'
        ],
        mistakes: ['Le sac glisse vers la nuque : serre les bretelles, pose-le plus bas.']
      }
    ]
  },
  pike: {
    name: 'Pompes piquées (épaules)',
    muscles: 'Épaules (avant et milieu), triceps, haut des pecs',
    cue: 'Hanches hautes en V inversé, le haut du front descend devant les mains, coudes à ~45°.',
    note: 'Pieds nus sur sol lisse, sinon tu glisses. Serviette pliée sous la tête. Descends en 2 s, souffle en poussant. Tu dois sentir le dessus des épaules et l’arrière des bras. Anormal : pincement au sommet de l’épaule, douleur à la nuque.',
    steps: [
      {
        name: 'Pompes piquées sur les genoux',
        reps: '8–12',
        how: [
          'À genoux, mains au sol devant toi, largeur d’épaules. Hanches hautes, au-dessus des genoux.',
          'Descends en 2 s le haut du front vers le sol, 20 cm devant la ligne des mains : tête et mains forment un triangle.',
          'Pousse jusqu’aux bras tendus en soufflant.'
        ],
        mistakes: [
          'La poitrine descend au lieu de la tête : remonte les hanches.',
          'Coudes grands ouverts : garde-les à ~45°.'
        ]
      },
      {
        name: 'Pompes piquées',
        reps: '6–12',
        how: [
          'Position de pompe, pieds nus. Avance les pieds vers les mains : V inversé, hanches hautes, jambes presque tendues.',
          'Mains largeur d’épaules, doigts écartés.',
          'Descends en 2 s le haut du front vers le sol, devant les mains (triangle tête-mains), coudes à ~45°.',
          'Pousse le sol loin de toi jusqu’aux bras tendus, en soufflant.'
        ],
        mistakes: [
          'Hanches qui descendent : rapproche les pieds des mains.',
          'La tête cogne le sol : tu descends trop vite. Ralentis.',
          'Pincement au sommet de l’épaule : réduis l’amplitude ; si ça persiste, reviens sur les genoux.'
        ]
      },
      {
        name: 'Pompes piquées pieds surélevés (lit ou canapé)',
        reps: '6–10',
        how: [
          'Pointes de pieds sur le bord du lit ou du canapé (calé contre un mur), mains au sol.',
          'Recule les mains vers le support et monte les hanches : le buste se rapproche de la verticale.',
          'Descends en 2 s le haut du front devant les mains. Pousse en soufflant.'
        ],
        mistakes: [
          'Dos qui se creuse : serre les abdos, hanches au-dessus des épaules.',
          'Tu ne freines plus la descente : arrête la série avant de tomber sur la tête.'
        ]
      }
    ]
  },
  hamcurl: {
    name: 'Leg curl à la serviette',
    muscles: 'Arrière des cuisses (ischio-jambiers), fessiers',
    cue: 'Bassin haut du début à la fin, glisse lentement, talons enfoncés dans la serviette.',
    note: 'Parquet ou carrelage : serviette pliée ou chaussettes sous les talons. Souffle en ramenant les talons. Tu dois sentir l’arrière des cuisses. Crampe : tends la jambe, attends 30 s, reprends avec moins d’amplitude. Anormal : douleur vive derrière le genou ou dans le bas du dos.',
    steps: [
      {
        name: 'Leg curl à la serviette, aller seulement',
        reps: '6–10',
        how: [
          'Sur le dos, genoux pliés, talons sur la serviette, écartés de la largeur des hanches. Bras au sol le long du corps.',
          'Monte le bassin : épaules, hanches et genoux alignés.',
          'Bassin haut, fais glisser les talons loin de toi en 4 s, jusqu’aux jambes presque tendues.',
          'Pose les fesses, ramène les pieds, remonte le bassin et recommence.'
        ],
        mistakes: [
          'Bassin qui tombe pendant la glissade : serre les fessiers, va moins loin.',
          'Trop rapide : tout l’effet vient de la lenteur. Compte 4 s.'
        ]
      },
      {
        name: 'Leg curl à la serviette',
        reps: '8–12',
        how: [
          'Même départ, bassin haut.',
          'Glisse les talons loin de toi en 3 s, jambes presque tendues, sans poser les fesses.',
          'Ramène les talons vers les fesses en soufflant, bassin toujours haut.'
        ],
        mistakes: [
          'Bassin qui retombe au retour : finis la série en « aller seulement ».',
          'Bas du dos qui tire : rentre les côtes et monte un peu moins haut.'
        ]
      },
      {
        name: 'Leg curl à la serviette sur une jambe, aller seulement',
        reps: '5–8 / jambe',
        how: [
          'Bassin haut, un talon sur la serviette, l’autre jambe pliée en l’air.',
          'Glisse le talon loin de toi en 4 s, hanches à l’horizontale.',
          'Pose les fesses, ramène le pied en t’aidant des deux jambes, recommence.'
        ],
        mistakes: ['Bassin qui penche : pose les bras en croix au sol pour te stabiliser.']
      },
      {
        name: 'Leg curl à la serviette sur une jambe',
        reps: '6–10 / jambe',
        how: [
          'Bassin haut, un talon sur la serviette, l’autre jambe pliée en l’air.',
          'Glisse en 3 s jusqu’à la jambe presque tendue, puis ramène le talon sans poser les fesses.',
          'Toutes les répétitions d’une jambe, puis change.'
        ],
        mistakes: [
          'Bassin qui penche ou qui tombe : reviens à la variante précédente.',
          'Douleur vive derrière la cuisse : arrête l’exercice pour aujourd’hui.'
        ]
      }
    ]
  },
  back: {
    name: 'Dos au sol',
    muscles: 'Milieu et bas des trapèzes, arrière des épaules, bas du dos (posture)',
    cue: 'Front près du sol, épaules loin des oreilles, mouvements lents.',
    note: 'Exercice de contrôle, pas de force. Tu dois sentir le milieu du dos, entre et sous les omoplates. Si tu sens surtout le cou, baisse les épaules. Trop facile en haut de la fourchette : une petite bouteille de 0,5 L dans chaque main.',
    steps: [
      {
        name: 'Superman',
        reps: '10–15',
        how: [
          'Sur le ventre, bras tendus devant toi, front près du sol.',
          'Serre les fessiers, puis décolle bras, poitrine et cuisses de quelques centimètres.',
          'Tiens 2 s en haut, redescends en 2 s. Respire normalement.'
        ],
        mistakes: [
          'Pincement dans le bas du dos : monte moins haut.',
          'Nuque cassée : garde le regard vers le sol.'
        ]
      },
      {
        name: 'Y-T-W allongé',
        reps: '6–8',
        how: [
          'Sur le ventre, front sur une serviette roulée. 1 répétition = un Y, un T, un W.',
          'Y : bras tendus en diagonale devant toi, pouces vers le plafond. Décolle-les 1 s.',
          'T : bras en croix, pouces vers le plafond. Décolle-les 1 s en rapprochant les omoplates.',
          'W : coudes pliés près des côtes. Tire-les 1 s vers l’arrière et vers le bas.'
        ],
        mistakes: [
          'Épaules qui montent vers les oreilles : baisse-les avant chaque lettre.',
          'Tu décolles la poitrine pour monter les bras : garde le sternum au sol.'
        ]
      },
      {
        name: 'Y-T-W tenus 3 secondes',
        reps: '5–8',
        how: [
          'Même enchaînement. 1 répétition = un Y, un T, un W.',
          'Tiens chaque lettre 3 s en haut, omoplates serrées.',
          'Respire normalement pendant la tenue.'
        ],
        mistakes: ['Souffle bloqué : compte à voix haute.']
      }
    ]
  },
  squat: {
    name: 'Squats et fentes',
    muscles: 'Cuisses (quadriceps), fessiers',
    cue: 'Genou dans l’axe du pied, pied d’appui à plat, buste gainé.',
    note: 'Tempo : descends en 3 s, remonte sans élan. Inspire en descendant, souffle en poussant. Tu dois sentir l’avant de la cuisse et le fessier. Une chauffe au-dessus du genou est normale ; une douleur vive dans le genou ne l’est pas. Option lest : sac à dos serré contre la poitrine.',
    steps: [
      {
        name: 'Squat assisté (main sur l’encadrement d’une porte)',
        reps: '12–20',
        how: [
          'Debout face à l’encadrement d’une porte, une main posée dessus pour l’équilibre. Pieds largeur d’épaules.',
          'Descends en 3 s, fesses vers l’arrière, jusqu’aux cuisses parallèles au sol.',
          'Remonte en poussant dans tout le pied, en soufflant.'
        ],
        mistakes: ['Tu te hisses avec le bras : la main sert seulement à l’équilibre.']
      },
      {
        name: 'Squat',
        reps: '12–20',
        how: [
          'Pieds largeur d’épaules, pointes un peu ouvertes. Bras tendus devant toi.',
          'Descends en 3 s, fesses vers l’arrière, cuisses au moins parallèles au sol.',
          'Marque 1 s en bas, talons au sol, poitrine haute.',
          'Remonte en poussant dans tout le pied, en soufflant.'
        ],
        mistakes: [
          'Genoux qui rentrent : pousse-les vers l’extérieur, dans l’axe des orteils.',
          'Talons qui décollent : écarte un peu les pieds et descends moins bas.'
        ]
      },
      {
        name: 'Fente statique (split squat)',
        reps: '8–12 / jambe',
        how: [
          'Un grand pas en avant. Pieds écartés de la largeur des hanches, comme sur deux rails. Talon arrière décollé.',
          'Descends à la verticale en 3 s, jusqu’à ce que le genou arrière frôle le sol.',
          'Remonte en poussant dans tout le pied avant, en soufflant.',
          'Toutes les répétitions d’une jambe, puis change.'
        ],
        mistakes: [
          'Genou avant qui rentre : aligne-le avec le deuxième orteil.',
          'Perte d’équilibre : écarte les pieds en largeur.',
          'Tu pousses avec la jambe arrière : mets plus de poids sur le pied avant.'
        ]
      },
      {
        name: 'Squat bulgare (pied arrière sur le lit ou le canapé)',
        reps: '8–12 / jambe',
        how: [
          'Dos au lit ou au canapé, à un grand pas. Pose le dessus du pied arrière sur le bord.',
          'Pied avant à plat, buste un peu penché vers l’avant, dos plat.',
          'Descends en 3 s jusqu’à ce que la cuisse avant soit parallèle au sol.',
          'Remonte en poussant dans le pied avant, en soufflant. Toutes les répétitions d’une jambe, puis change.'
        ],
        mistakes: [
          'Talon avant qui décolle : avance le pied avant.',
          'Étirement gênant à l’avant de la cuisse arrière : rapproche-toi un peu du support.',
          'Genou douloureux : réduis l’amplitude ; si ça persiste, reviens à la fente statique.'
        ]
      },
      {
        name: 'Squat sur une jambe vers le lit ou le canapé',
        reps: '5–8 / jambe',
        how: [
          'Debout dos au bord du lit ou du canapé, talons à 10 cm. Une jambe tendue devant toi, bras tendus devant.',
          'Descends en 3 s sur l’autre jambe jusqu’à effleurer le bord avec les fesses.',
          'Remonte sans élan et sans t’asseoir vraiment, en soufflant.'
        ],
        mistakes: [
          'Tu te laisses tomber assis : freine jusqu’au bout, ou reviens au squat bulgare.',
          'Genou qui rentre : garde-le au-dessus du pied.'
        ]
      }
    ]
  },
  hinge: {
    name: 'Pont fessier',
    muscles: 'Fessiers, arrière des cuisses, bas du dos',
    cue: 'Pousse dans les talons, serre les fessiers 1 s en haut.',
    steps: [
      {
        name: 'Pont fessier',
        reps: '12–20',
        how: [
          'Allongé sur le dos, pieds à plat près des fesses.',
          'Pousse dans les talons pour monter le bassin jusqu’à aligner épaules, hanches et genoux.',
          'Serre les fessiers 1 seconde en haut, redescends lentement.'
        ],
        mistakes: ['Cambrer le bas du dos au lieu de serrer les fessiers.']
      },
      {
        name: 'Pont fessier sur une jambe',
        reps: '8–12 / jambe',
        how: ['Même mouvement, une jambe tendue en l’air.', 'Garde le bassin bien horizontal.'],
        mistakes: ['Bassin qui penche d’un côté.']
      },
      {
        name: 'Hip thrust sur une jambe (épaules sur le canapé)',
        reps: '8–12 / jambe',
        how: ['Haut du dos appuyé sur un canapé, un pied au sol.', 'Monte le bassin jusqu’à l’horizontale.'],
        mistakes: ['Hyper-cambrer en haut.']
      }
    ]
  },
  plank: {
    name: 'Planche (gainage)',
    muscles: 'Abdos (grand droit, abdos profonds), gainage',
    cue: 'Corps droit, côtes rentrées, abdos ET fessiers serrés, respire.',
    note: 'Tu dois sentir tout le ventre. Si tu sens le bas du dos, le bassin est tombé : la série est finie. Au-delà de 60 s, passe à la variante suivante plutôt que d’allonger la durée. Sol lisse : pieds nus.',
    steps: [
      {
        name: 'Planche sur les genoux',
        reps: '20–40 s',
        how: [
          'Avant-bras au sol, coudes sous les épaules, genoux au sol.',
          'Épaules, hanches et genoux alignés. Serre abdos et fessiers.',
          'Respire calmement.'
        ],
        mistakes: ['Souffle bloqué : compte tes respirations.']
      },
      {
        name: 'Planche',
        reps: '30–60 s',
        how: [
          'Avant-bras au sol, coudes sous les épaules, pointes de pieds au sol.',
          'Corps droit. Rentre les côtes, serre fort abdos et fessiers, bassin légèrement basculé vers l’arrière.',
          'Repousse le sol avec les avant-bras. Respire calmement.'
        ],
        mistakes: [
          'Tu sens le bas du dos : le bassin est tombé, arrête la série.',
          'Fesses trop hautes : aligne-les avec les épaules et les talons.'
        ]
      },
      {
        name: 'Planche avec touchers d’épaules',
        reps: '8–12 / côté',
        how: [
          'Planche bras tendus, mains sous les épaules, pieds nus écartés plus large que les hanches.',
          'Décolle une main, touche l’épaule opposée, repose-la. Alterne, 1 s par toucher.',
          'Le bassin reste immobile, comme si un verre d’eau était posé dessus.'
        ],
        mistakes: ['Hanches qui se balancent : écarte plus les pieds et ralentis.']
      },
      {
        name: 'Planche scie (pieds sur une serviette)',
        reps: '8–12',
        how: [
          'Planche sur les avant-bras, pointes de pieds sur une serviette pliée, sur sol lisse.',
          'Pousse sur les avant-bras pour faire reculer tout le corps de 10 à 20 cm, en 2 s.',
          'Reviens épaules au-dessus des coudes. Corps droit du début à la fin.'
        ],
        mistakes: [
          'Dos qui se creuse quand tu recules : recule moins loin.',
          'Tu sens le bas du dos : arrête la série.'
        ]
      },
      {
        name: 'Glissé avant à genoux (mains sur une serviette)',
        reps: '6–12',
        how: [
          'À genoux sur un appui qui ne glisse pas, mains sur une serviette, bras tendus sous les épaules.',
          'Côtes rentrées, fessiers serrés. Fais glisser les mains vers l’avant en 3 s : hanches et épaules avancent ensemble.',
          'Arrête-toi juste avant que le dos se creuse.',
          'Reviens en tirant les mains vers les genoux, en soufflant.'
        ],
        mistakes: [
          'Bas du dos qui se creuse : tu vas trop loin. Raccourcis la glissade.',
          'Fesses qui restent en arrière : avance les hanches en même temps que les mains.',
          'Douleur à l’épaule, bras devant toi : réduis l’amplitude.'
        ]
      }
    ]
  },
  side: {
    name: 'Planche latérale',
    muscles: 'Obliques (côtés de la taille)',
    cue: 'Coude sous l’épaule, hanches hautes, corps aligné.',
    note: 'Tu dois sentir le côté de la taille, près du sol. Respire calmement. Anormal : douleur dans l’épaule d’appui.',
    steps: [
      {
        name: 'Planche latérale sur les genoux',
        reps: '20–30 s / côté',
        how: [
          'Sur le côté, coude sous l’épaule, avant-bras au sol, genoux pliés à 90°.',
          'Monte les hanches : épaules, hanches et genoux alignés.',
          'Main libre sur la hanche.'
        ],
        mistakes: ['Hanches qui descendent : la série est finie.']
      },
      {
        name: 'Planche latérale',
        reps: '20–45 s / côté',
        how: [
          'Sur le côté, coude sous l’épaule, jambes tendues, pieds l’un sur l’autre (ou l’un devant l’autre pour l’équilibre).',
          'Monte les hanches : corps droit de la tête aux pieds.',
          'Repousse le sol avec l’avant-bras.'
        ],
        mistakes: [
          'Fesses qui partent en arrière : avance le bassin, serre les fessiers.',
          'Épaule d’appui douloureuse : vérifie que le coude est sous l’épaule ; sinon reviens sur les genoux.'
        ]
      },
      {
        name: 'Planche latérale avec levée de jambe',
        reps: '20–30 s / côté',
        how: ['En planche latérale, corps bien aligné.', 'Lève la jambe du dessus à hauteur de hanche et tiens.'],
        mistakes: ['Hanches qui descendent ou buste qui tourne : repose la jambe.']
      }
    ]
  },
  legraise: {
    name: 'Relevés de jambes',
    muscles: 'Surtout les fléchisseurs de hanche ; les abdos travaillent vraiment quand le bassin s’enroule (voir le crunch inversé)',
    cue: 'Bas du dos plaqué au sol, descente lente, pas d’élan.',
    steps: [
      {
        name: 'Relevés de genoux allongé',
        reps: '10–15',
        how: ['Allongé, mains sous les fesses, genoux fléchis.', 'Ramène les genoux vers la poitrine, redescends sans poser les pieds.'],
        mistakes: ['Dos qui se cambre en bas.']
      },
      {
        name: 'Relevés de jambes allongé',
        reps: '8–12',
        how: [
          'Allongé, mains sous les fesses, jambes tendues.',
          'Monte les jambes jusqu’à la verticale, redescends en 3 secondes sans toucher le sol.',
          'Le bas du dos reste collé au sol.'
        ],
        mistakes: ['Dos qui se cambre.', 'Utiliser l’élan.']
      },
      {
        name: 'Relevés de jambes + montée du bassin',
        reps: '8–12',
        how: ['Comme les relevés de jambes, puis décolle les fesses du sol en haut du mouvement.'],
        mistakes: ['Balancer les jambes.']
      }
    ]
  },
  revcrunch: {
    name: 'Crunch inversé',
    muscles: 'Abdos (grand droit) : le bassin s’enroule vers les côtes',
    cue: 'Le bassin s’enroule et décolle : ce ne sont pas les jambes qui se balancent.',
    note: 'Souffle en enroulant, inspire en déroulant. Tu dois sentir le bas du ventre. Si tu sens surtout le haut des cuisses, enroule plus le bassin et ralentis. Anormal : douleur dans le bas du dos.',
    steps: [
      {
        name: 'Crunch inversé',
        reps: '10–15',
        how: [
          'Sur le dos, bras le long du corps, paumes au sol. Genoux pliés à 90°, cuisses à la verticale.',
          'Enroule le bassin en soufflant : les fesses décollent de quelques centimètres, les genoux vont vers la poitrine.',
          'Tiens 1 s, puis déroule en 2 s jusqu’à ce que le bas du dos touche le sol. Ne repose pas les pieds.'
        ],
        mistakes: [
          'Élan avec les jambes : garde l’angle des genoux fixe.',
          'Tu pousses fort sur les mains : tourne les paumes vers le plafond.'
        ]
      },
      {
        name: 'Crunch inversé, descente lente (3 s)',
        reps: '10–15',
        how: [
          'Même mouvement que le crunch inversé.',
          'Tiens 1 s en haut, fesses décollées.',
          'Déroule le dos vertèbre par vertèbre en 3 s.'
        ],
        mistakes: ['Bassin qui retombe d’un coup : monte moins haut et freine.']
      },
      {
        name: 'Crunch inversé jambes tendues',
        reps: '8–12',
        how: [
          'Sur le dos, paumes au sol, jambes tendues à la verticale.',
          'Décolle les fesses en poussant les pieds vers le plafond, pas vers la tête. Souffle.',
          'Redescends le bassin en 3 s. Les jambes restent à la verticale.'
        ],
        mistakes: [
          'Jambes qui basculent vers la tête pour prendre de l’élan : vise un point au plafond avec les pieds.',
          'Nuque crispée : pose la tête et relâche les épaules.'
        ]
      }
    ]
  },
  hollow: {
    name: 'Hollow body',
    muscles: 'Abdos (grand droit), gainage',
    cue: 'Bas du dos collé au sol en permanence.',
    note: 'Respire court, sans bloquer. Tu dois sentir tout le ventre. Dès que le bas du dos décolle, la série est finie.',
    steps: [
      {
        name: 'Dead bug',
        reps: '8–12 / côté',
        how: [
          'Sur le dos, bras tendus vers le plafond, genoux pliés à 90° au-dessus des hanches.',
          'Plaque le bas du dos au sol. Souffle et tends en 3 s un bras derrière la tête et la jambe opposée vers le sol.',
          'Reviens en 2 s, puis change de côté.'
        ],
        mistakes: [
          'Bas du dos qui décolle : descends la jambe moins bas.',
          'Trop rapide : compte 3 s à l’aller.'
        ]
      },
      {
        name: 'Hollow body genoux fléchis',
        reps: '20–30 s',
        how: [
          'Sur le dos, bas du dos plaqué au sol.',
          'Décolle la tête et les épaules, bras tendus le long du corps, mains au-dessus du sol.',
          'Genoux pliés au-dessus des hanches. Tiens, menton rentré.'
        ],
        mistakes: [
          'Nuque qui tire : regarde tes genoux, menton vers la poitrine.',
          'Dos qui se creuse : ramène les genoux vers toi.'
        ]
      },
      {
        name: 'Hollow body hold',
        reps: '20–40 s',
        how: [
          'Bas du dos plaqué au sol, tête et épaules décollées.',
          'Jambes tendues à ~40 cm du sol, bras tendus derrière la tête.',
          'Plus les bras et les jambes sont bas, plus c’est dur : règle la hauteur pour tenir sans creuser le dos.'
        ],
        mistakes: [
          'Bas du dos qui décolle : remonte les jambes.',
          'Tu sens surtout les cuisses : enroule plus le bassin.'
        ]
      }
    ]
  },
  climbers: {
    name: 'Mountain climbers',
    muscles: 'Abdos, cardio',
    cue: 'Hanches basses, épaules au-dessus des mains.',
    steps: [
      {
        name: 'Mountain climbers lents',
        reps: '20–30 s',
        how: ['Position de pompe bras tendus.', 'Ramène un genou vers la poitrine, puis l’autre, lentement.'],
        mistakes: ['Fesses en l’air.']
      },
      {
        name: 'Mountain climbers',
        reps: '30–45 s',
        how: ['Même mouvement, rythme rapide et régulier.'],
        mistakes: ['Fesses en l’air.']
      },
      {
        name: 'Mountain climbers croisés',
        reps: '30–45 s',
        how: ['Ramène chaque genou vers le coude opposé.'],
        mistakes: ['Perdre le gainage.']
      }
    ]
  },
  crunch: {
    name: 'Crunchs',
    muscles: 'Abdos (grand droit), obliques',
    cue: 'Enroule le haut du dos en soufflant, sans tirer sur la nuque.',
    note: 'Le bas du dos reste au sol : seules les omoplates décollent. Tu dois sentir le haut du ventre. Anormal : douleur dans la nuque.',
    steps: [
      {
        name: 'Crunch',
        reps: '12–20',
        how: [
          'Sur le dos, genoux pliés, pieds à plat. Bouts des doigts aux tempes, coudes ouverts.',
          'Souffle et enroule le haut du dos : les côtes vont vers le bassin, les omoplates décollent.',
          'Tiens 1 s, redescends en 2 s sans reposer complètement la tête.'
        ],
        mistakes: [
          'Nuque qui tire : garde un poing d’écart entre menton et poitrine, regarde le plafond.',
          'Tu montes jusqu’à t’asseoir : inutile, arrête-toi quand les omoplates décollent.'
        ]
      },
      {
        name: 'Crunch vélo',
        reps: '10–15 / côté',
        how: [
          'Sur le dos, mains aux tempes, épaules décollées, genoux au-dessus des hanches.',
          'Tends une jambe et tourne le buste : l’épaule va vers le genou opposé. 2 s par côté.',
          'Change de côté sans reposer les épaules.'
        ],
        mistakes: [
          'Tu bouges seulement les coudes : c’est l’épaule qui tourne.',
          'Bas du dos qui décolle : tends la jambe plus haut.'
        ]
      },
      {
        name: 'Crunch lesté (sac à dos contre la poitrine)',
        reps: '10–15',
        load: true,
        how: [
          'Position du crunch, sac à dos serré contre le haut de la poitrine, bras croisés dessus. Départ : 3 kg.',
          'Souffle et enroule le haut du dos. Tiens 1 s.',
          'Redescends en 3 s.',
          'Toutes les séries à 15 : ajoute 1,5 kg.'
        ],
        mistakes: [
          'Tu lances le sac pour monter : allège-le.',
          'Nuque qui tire : menton à un poing de la poitrine.'
        ]
      }
    ]
  }
};

// Programme v7 : 3 séances full body, accent pecs + abdos, sans achat ni
// meuble solide (appuis : lit, canapé, mur, sol ; sac à dos pour le tirage).
// Séries par semaine, comptées si elles finissent à 1–3 répétitions de l'échec :
// pecs 12 (pompes 8 + pompes serrées 4) ; dos 14 (rowing 11 + tirage glissé 3)
// + 4 de Y-T-W (posture, charge légère) ; épaules 3 directes (pompes piquées),
// avant ≈ 12 et arrière ≈ 14 indirectes ; triceps ≈ 15 indirectes ;
// biceps ≈ 14 indirectes ; quadriceps 6 ; ischios 6 ; fessiers ≈ 12 indirectes ;
// abdos 15 (flexion 6, gainage 6, latéral 3).
// [échelle, étape de départ, séries, repos en s]
const SPORT_PROGRAM_VERSION = 8;
// Anciens noms (avec la lettre), pour reconnaître et renommer les séances existantes.
const SPORT_PROGRAM_OLD_NAMES = ['A — Pecs & abdos', 'B — Dos, jambes & gainage', 'C — Pecs & abdos (volume)'];
// Programme v4, pour reconnaître les séances jamais modifiées à la main.
const SPORT_PROGRAM_V4_NAMES = ['Pecs & abdos', 'Dos, jambes & gainage', 'Pecs & abdos (volume)'];
const SPORT_PROGRAM_V4_DESCRIPTIONS = [
  'Échauffement (5 min) : 30 s de jumping jacks, 10 rotations d’épaules dans chaque sens, 10 squats lents, 10 pompes faciles (contre un mur).\n' +
    'Note tes répétitions série par série : le site te dira quand passer à la variante suivante.',
  'Échauffement (5 min) : 30 s de montées de genoux, 10 rotations de hanches, 10 squats lents, 10 supermans lents.\n' +
    'Le dos équilibre le travail des pecs : épaules en arrière, posture droite, pecs mieux mis en valeur.',
  'Échauffement (5 min) : 30 s de jumping jacks, 10 rotations d’épaules, 10 pompes faciles, 10 squats.\n' +
    'Séance la plus orientée pecs de la semaine : soigne l’amplitude et la descente lente.'
];
// Consignes du programme v5 (avec la barre) des séances A et C.
const SPORT_PROGRAM_V5_DESCRIPTIONS = {
  0:
    'Échauffement (5 min) : 30 s de jumping jacks, 10 rotations d’épaules dans chaque sens, 10 squats lents, 10 pompes faciles (contre un mur).\n' +
      'Barre de traction dans l’encadrement d’une porte, à hauteur de hanches, caoutchouc ou feutre sous les embouts : serre-la et teste-la avant de commencer.\n' +
      'Note tes répétitions série par série : le site te dira quand passer à la variante suivante.',
  2:
    'Échauffement (5 min) : 30 s de jumping jacks, 10 rotations d’épaules, 10 pompes faciles, 10 squats.\n' +
      'Barre de traction à hauteur de hanches, bien serrée (teste-la avant).\n' +
      'Pompes piquées : hanches hautes, la tête descend devant les mains. C’est l’exercice des épaules de la semaine.'
};
// Programme v6 (noms, consignes et échelles), pour reconnaître les séances v6
// jamais modifiées à la main (migrerProgrammeV7 dans sport.js).
const SPORT_PROGRAM_V6_NAMES = ['Pecs & abdos', 'Dos, jambes & gainage', 'Pecs, épaules & abdos'];
const SPORT_PROGRAM_V6_LADDERS = [
  ['push', 'row', 'squat', 'back', 'revcrunch', 'plank'],
  ['row', 'close', 'squat', 'hamcurl', 'side', 'hollow'],
  ['push', 'row', 'squat', 'pike', 'hollow', 'crunch']
];
// Variantes renommées en v7 (plus de table ni de chaise) : séances, saisies
// et exclusions suivent le nouveau nom.
const SPORT_V7_RENAMED = {
  'Pompes inclinées (mains sur une table)': 'Pompes inclinées (mains sur le lit ou le canapé)',
  'Pompes serrées inclinées (mains sur une table)': 'Pompes serrées inclinées (mains sur le lit ou le canapé)',
  'Squat assisté (en tenant un meuble)': 'Squat assisté (main sur l’encadrement d’une porte)',
  'Squat bulgare (pied arrière sur une chaise)': 'Squat bulgare (pied arrière sur le lit ou le canapé)',
  'Squat sur une jambe vers une chaise': 'Squat sur une jambe vers le lit ou le canapé'
};
const SPORT_PROGRAM_V6_DESCRIPTIONS = [
  'Échauffement (5 min) : 30 s de jumping jacks, 10 rotations d’épaules dans chaque sens, 10 squats lents, 10 pompes faciles (contre un mur).\n' +
    'Note tes répétitions série par série : le site te dira quand passer à la variante suivante.',
  'Échauffement (5 min) : 30 s de montées de genoux, 10 rotations de hanches, 10 squats lents, 10 supermans lents.\n' +
    'Le dos équilibre le travail des pecs : épaules en arrière, posture droite, pecs mieux mis en valeur.\n' +
    'Leg curl : sur parquet ou carrelage, une serviette ou des chaussettes sous les talons.',
  'Échauffement (5 min) : 30 s de jumping jacks, 10 rotations d’épaules, 10 pompes faciles, 10 squats.\n' +
    'Pompes piquées : hanches hautes, la tête descend devant les mains. C’est l’exercice des épaules de la semaine.'
];
// Consignes v7 (échauffement écrit dans le texte), pour reconnaître les séances
// v7 jamais modifiées à la main (migrerProgrammeV8 dans sport.js).
const SPORT_PROGRAM_V7_DESCRIPTIONS = [
  'ÉCHAUFFEMENT (≈ 6 min)\n' +
  '1. Général, 2 min : 30 s de jumping jacks puis 30 s de montées de genoux, deux fois.\n' +
  '2. Mobilité, 2 min : 10 cercles de bras dans chaque sens. 10 cercles de poignets dans chaque sens. Mains à plat au sol, 10 bascules lentes d’avant en arrière. 8 « chat-vache » à quatre pattes.\n' +
  '3. Approche, 2 min : 8 pompes inclinées (mains sur le lit), 30 s de pause, puis 5 répétitions de ta variante du jour, sans forcer.\n' +
  'SÉANCE\n' +
  'Arrête chaque série avec 1 à 3 répétitions propres en réserve. Pieds nus sur sol lisse pour les pompes et la planche.\n' +
  'Rowing : vérifie les coutures et le calage du sac. Avant la première série, 8 répétitions à deux mains pour t’échauffer.\n' +
  'RETOUR AU CALME (facultatif, 2 min) : marche et respire lentement. Les étirements ne réduisent pas les courbatures : fais-en seulement si ça te fait du bien.',
  'ÉCHAUFFEMENT (≈ 7 min)\n' +
  '1. Général, 2 min : 30 s de montées de genoux puis 30 s de talons-fesses, deux fois.\n' +
  '2. Mobilité, 3 min : 10 cercles de hanches dans chaque sens. 10 squats lents. 6 fentes arrière par jambe. 10 « bonjour » (mains sur les hanches, buste penché, dos plat). 10 cercles de bras et de poignets dans chaque sens.\n' +
  '3. Approche, 2 min : 10 rowings penchés à deux mains avec le sac du jour (demi-charge par bras), puis 5 rowings un bras de chaque côté.\n' +
  'SÉANCE\n' +
  'Arrête chaque série avec 1 à 3 répétitions propres en réserve.\n' +
  'Avant les pompes serrées : 6 pompes classiques faciles. Leg curl et tirage glissé : serviette sur sol lisse, mouvements lents.\n' +
  'RETOUR AU CALME (facultatif, 2 min) : marche et respire lentement.',
  'ÉCHAUFFEMENT (≈ 7 min)\n' +
  '1. Général, 2 min : 30 s de jumping jacks puis 30 s de montées de genoux, deux fois.\n' +
  '2. Mobilité, 3 min : 10 cercles de bras dans chaque sens. 10 cercles de poignets dans chaque sens. 8 « chat-vache ». 5 passages lents de la planche bras tendus au V inversé, talons vers le sol.\n' +
  '3. Approche, 2 min : 8 pompes inclinées (mains sur le lit), 30 s de pause, puis 5 répétitions de ta variante du jour, sans forcer.\n' +
  'SÉANCE\n' +
  'Arrête chaque série avec 1 à 3 répétitions propres en réserve. Pieds nus sur sol lisse.\n' +
  'Avant les pompes piquées : 5 répétitions faciles sur les genoux. Descends la tête lentement, serviette pliée au sol.\n' +
  'RETOUR AU CALME (facultatif, 2 min) : marche et respire lentement.'
];
// v8 : l'échauffement est construit d'après les exercices (SPORT_WARMUP).
const SPORT_PROGRAM = [
  {
    weekday: 1,
    name: 'Pecs & abdos',
    description:
      'Échauffement : déroule-le dans la carte « 🔥 Échauffement » ou en mode guidé (▶), adapté aux exercices du jour.\n' +
      'Arrête chaque série avec 1 à 3 répétitions propres en réserve. Pieds nus sur sol lisse pour les pompes et la planche.\n' +
      'Rowing : vérifie les coutures et le calage du sac avant de commencer.\n' +
      'Retour au calme (facultatif, 2 min) : marche et respire lentement. Les étirements ne réduisent pas les courbatures : fais-en seulement si ça te fait du bien.',
    exercises: [
      ['push', 4, 4, 120],
      ['row', 1, 4, 75],
      ['squat', 2, 3, 90],
      ['back', 1, 2, 45],
      ['revcrunch', 0, 3, 60],
      ['plank', 1, 3, 45]
    ]
  },
  {
    weekday: 3,
    name: 'Dos, jambes & gainage',
    description:
      'Échauffement : déroule-le dans la carte « 🔥 Échauffement » ou en mode guidé (▶), adapté aux exercices du jour.\n' +
      'Arrête chaque série avec 1 à 3 répétitions propres en réserve.\n' +
      'Leg curl et tirage glissé : serviette sur sol lisse, mouvements lents.\n' +
      'Retour au calme (facultatif, 2 min) : marche et respire lentement.',
    exercises: [
      ['row', 1, 4, 75],
      ['close', 2, 4, 90],
      ['slidepull', 0, 3, 60],
      ['squat', 2, 3, 90],
      ['hamcurl', 0, 3, 60],
      ['side', 1, 3, 30]
    ]
  },
  {
    weekday: 5,
    name: 'Pecs, épaules & abdos',
    description:
      'Échauffement : déroule-le dans la carte « 🔥 Échauffement » ou en mode guidé (▶), adapté aux exercices du jour.\n' +
      'Arrête chaque série avec 1 à 3 répétitions propres en réserve. Pieds nus sur sol lisse.\n' +
      'Pompes piquées : serviette pliée au sol sous la tête, descends lentement.\n' +
      'Retour au calme (facultatif, 2 min) : marche et respire lentement.',
    exercises: [
      ['push', 4, 4, 120],
      ['row', 1, 3, 75],
      ['pike', 1, 3, 90],
      ['hamcurl', 0, 3, 60],
      ['back', 1, 2, 45],
      ['crunch', 0, 3, 45],
      ['hollow', 1, 3, 45]
    ]
  }
];

// Vidéos YouTube (vérifiées : existantes et intégrables), une par variante.
// null = pas de vidéo fiable trouvée : le bouton « Autres vidéos » reste disponible.
const SPORT_VIDEOS = {
  push: ['emhF1efZ-38', '5O7QVJ4s6iw', 'SWUw2epT8P4', '50Yr6Mm78u0', 'Dl1M2oeljAw', 'Dl1M2oeljAw', 'T3vnPh3Cjnk'],
  wide: ['hzDFtOWJstY', 'hzDFtOWJstY', 'hzDFtOWJstY'],
  close: ['FvnPL4cYUQk', 'FvnPL4cYUQk', '5QH97LnIXgo', 'mhVgRRoNAgg'],
  pull: [null, '5i7zfFO9RH4', 'kAP0skZtWDg', 'QWbY1Nt1FYU'],
  row: ['aGTrrWvX6vk', 'puaKVJOY8eg', 'puaKVJOY8eg'],
  invrow: [null, '5i7zfFO9RH4', 'kAP0skZtWDg', 'QWbY1Nt1FYU'],
  slidepull: ['-Hr1mNz056w', '-Hr1mNz056w', '-Hr1mNz056w'],
  pike: ['bA4xN8hD1l8', 'eZOg_vmkgbk', '_FfCWr4B6z8'],
  hamcurl: ['a_FmZ4kz00s', 'Beb0_rycJCU', 'SLRv1VZIpQs', 'DenoSLSQaN0'],
  back: ['KuddSXD0Jk0', 'ZpZEQ2JCXyc', 'LSy6R7j3PDc'],
  squat: ['tPTVVEaYza0', 'RhusC-zA56k', 'Ey1o1oQ8x6M', 'eCJxHKDXBqk', 'kc4YfSHjbYE'],
  hinge: ['9Wma4mC8wpw', 'QWu5ApIBD9A', null],
  plank: ['JCLxkG7ULfM', 'mv42eVXvMDc', 'wcKyqAMqueQ', 'Qip3IEgsDzw', '1zpcvOYzdbE'],
  side: ['hAWS7C17uJY', 'fIkpxa-kuIA', 'hAWS7C17uJY'],
  legraise: [null, 'ce-DMxpDIf8', null],
  revcrunch: ['0bq05pA3bkA', 'RSOE57OXyDk', 'SW2vRGrl4dA'],
  hollow: ['6n7ZWnV8snU', 'HAfUt2Cco74', 'HAfUt2Cco74'],
  climbers: ['e9Nwd8ckkYA', 'e9Nwd8ckkYA', 'K3Xt4QH4b-U'],
  crunch: ['PtqG6BmZW4o', 'eqg47ZuGZXQ', '2k_OJw9uxBM']
};

// Exercices exclus par défaut (à la demande de l'utilisateur) :
// porte, table, et tout ce qui demande une barre.
const SPORT_DEFAULT_EXCLUDED = [
  'Rowing serviette à la porte',
  'Rowing inversé sous une table, genoux fléchis',
  'Rowing inversé sous une table, jambes tendues',
  'Rowing inversé pieds surélevés',
  'Rowing inversé à la barre, barre haute',
  'Rowing inversé à la barre, genoux fléchis',
  'Rowing inversé à la barre, jambes tendues',
  'Rowing inversé à la barre, pieds surélevés'
];

// Échelle de repli quand toutes les variantes d'une échelle sont exclues.
const SPORT_LADDER_FALLBACK = { pull: 'row', invrow: 'row' };

// Conseils affichés dans la fiche « ? » de chaque exercice.
const SPORT_TIPS = {
  progression: [
    'Objectif de chaque séance : faire autant ou mieux que la dernière fois (les chiffres grisés), avec la même technique et le même tempo.',
    'Intensité : arrête chaque série quand il te reste 1 à 3 répétitions propres en réserve. Une répétition déformée ou hors tempo ne compte pas.',
    'Monter : toutes les séries en haut de la fourchette → variante suivante. C’est normal d’y repartir du bas de la fourchette.',
    'Exercices avec sac (rowing, crunch lesté) : ajoute d’abord du poids, +0,5 à 1,5 kg, quand toutes les séries sont en haut de la fourchette. Ne change de variante qu’une fois le sac au maximum (10–12 kg pour un sac ordinaire).',
    'Descendre : première série sous le bas de la fourchette deux séances de suite, ou technique qui se dégrade → variante précédente.',
    'Stagnation : 3 séances de suite sans gagner une répétition sur un exercice → vérifie sommeil et repas, ajoute 30 s de repos. Toujours bloqué 2 séances plus tard : semaine allégée.',
    'Semaine allégée : toutes les 6 à 8 semaines, ou plus tôt si tes scores baissent deux séances de suite. Mêmes exercices, moitié moins de séries, 4 répétitions en réserve.',
    'Après une semaine sans séance : mêmes variantes, une série de moins par exercice et 3 répétitions en réserve pendant une séance. Après 3 semaines ou plus : descends d’une variante.',
    'Semaine incomplète : continue normalement. Tu peux décaler une séance d’un jour s’il reste un jour de repos avant la suivante ; sinon, saute-la.',
    'Sac à dos en pompes ou en fentes : seulement si tu es coincé entre deux variantes. Départ 4,5 kg en pompes, 6 kg en fentes, puis +1,5 kg.'
  ],
  safety: [
    'Arrête tout de suite l’exercice si : douleur vive ou en coup de poignard, douleur dans une articulation, claquement suivi de douleur, fourmillements ou engourdissement dans un bras ou une jambe.',
    'Douleur dans la poitrine, malaise ou essoufflement anormal : arrête la séance. Si ça ne passe pas en quelques minutes, appelle le 112.',
    'Courbatures : douleur diffuse dans le muscle, des deux côtés, 1 à 3 jours après la séance, qui s’atténue en bougeant. Tu peux t’entraîner.',
    'Blessure possible : douleur précise, d’un seul côté, apparue pendant un mouvement, près d’une articulation, avec gonflement, ou qui dure plus de 7 jours. Arrête l’exercice concerné et consulte un médecin ou un kiné.',
    'Épaules : coudes à ~45° du buste en pompes, jamais en T. Ne force pas en bas du mouvement quand tu es fatigué.',
    'Poignets : échauffe-les, doigts écartés, poids sur toute la paume. S’ils font mal : pompes sur les poings, sur une serviette pliée.',
    'Bas du dos : dos plat au rowing, bassin qui ne tombe jamais en pompes et en planche. Si tu le sens travailler, la série est finie.',
    'Sol lisse : pieds nus pour les pompes, les pompes piquées et les planches. Cale le canapé contre un mur avant d’y poser les mains ou les pieds.',
    'Sac à dos : fermé, bouteilles vissées et calées, coutures des bretelles vérifiées avant chaque séance. Jamais plus de 10–12 kg dans un sac ordinaire.',
    'Abdos tous les deux jours : pas de problème. S’ils sont encore très courbaturés, fais moitié moins de séries ce jour-là.'
  ],
  abs: [
    'Les abdos se musclent ici. Ils deviennent visibles quand la couche de graisse du ventre est assez fine : ça dépend surtout de l’alimentation et de ta morphologie.',
    'Faire des abdos ne fait pas fondre la graisse du ventre : on ne choisit pas où l’on perd du gras.',
    'Il n’existe pas de seuil précis. On cite souvent 10–15 % de masse grasse chez l’homme, mais c’est un ordre de grandeur qui varie beaucoup d’une personne à l’autre.',
    'Avec ≈ 1,85 m pour 73–75 kg, ton poids est déjà dans la zone normale (IMC ≈ 21–22). Priorité : prendre du muscle en mangeant à ta faim, à peu près à l’équilibre.',
    'Si tu veux perdre un peu de gras : déficit léger, 300–500 kcal de moins par jour au maximum, et pas plus de ≈ 0,5 % de ton poids par semaine (≈ 0,3–0,4 kg). Pas de régime strict ni d’aliments interdits.',
    'Arrête le déficit si ta force baisse plusieurs séances de suite, si tu es fatigué en permanence, ou si tu passes sous ≈ 68 kg.',
    'Protéines : ≈ 1,6 g par kg de poids par jour suffisent le plus souvent (≈ 120 g pour toi). Jusqu’à ≈ 2,2 g/kg en période de déficit (≈ 160 g). Répartis-les sur 3 ou 4 repas.',
    'Dors 7 à 9 h par nuit : le manque de sommeil freine la récupération et augmente la faim.'
  ]
};

/* ── Échauffement ──────────────────────────────────────────────
   Liste ordonnée, filtrée d'après les exercices de la séance
   (sportWarmupSteps dans sport.js), selon la méthode RAMP : faire monter
   le cardio, mobiliser les articulations qui vont travailler, activer les
   muscles, puis séries d'approche juste avant le premier exercice de
   chaque famille (SPORT_APPROACH_FAMILIES). ≈ 6–8 min. Tout le debout
   d'abord, puis tout au sol. Pas d'étirements longs avant l'effort :
   mouvements dynamiques seulement.
   ─────────────────────────────────────────────────────────────── */
const SPORT_WARMUP = [
  {
    group: 'all',
    name: 'Jumping jacks',
    seconds: 45,
    detail: 'Rythme tranquille, sur l’avant du pied. Sans sauter (voisins, plancher) : écarte une jambe puis l’autre en levant les bras.'
  },
  {
    group: 'all',
    name: 'Montées de genoux sur place',
    seconds: 30,
    detail: 'Genoux vers la hauteur des hanches, bras qui accompagnent. Tu dois commencer à avoir chaud, pas à être essoufflé.'
  },
  {
    group: 'push',
    name: 'Cercles de bras',
    reps: '10 / sens',
    detail: 'Bras tendus, grands cercles lents vers l’avant puis vers l’arrière. Épaules basses, loin des oreilles.'
  },
  {
    group: 'pull',
    name: 'Ouvertures en T',
    reps: '10',
    detail: 'Debout, bras tendus devant toi à hauteur d’épaules : ouvre-les en croix en serrant les omoplates, pouces vers l’arrière. Lent, 1 s bras ouverts.'
  },
  {
    group: 'hips',
    name: 'Cercles de hanches',
    reps: '10 / sens',
    detail: 'Debout, mains sur les hanches, grands cercles lents du bassin.'
  },
  {
    group: 'legs',
    name: 'Squats lents',
    reps: '8',
    detail: 'Descends en 3 s, marque 2 s en bas talons au sol, remonte. Genoux dans l’axe des pieds.'
  },
  {
    group: 'legs',
    name: 'Fentes arrière',
    reps: '5 / jambe',
    detail: 'Un grand pas en arrière, genou arrière qui frôle le sol, remonte en poussant dans le pied avant. Main sur un mur si besoin.'
  },
  {
    group: 'all',
    name: 'Chat-vache',
    reps: '8',
    detail: 'À quatre pattes, mains sous les épaules, genoux sous les hanches : arrondis lentement le dos en soufflant, puis creuse-le en inspirant.'
  },
  {
    group: 'pull',
    name: 'Rotations du buste à quatre pattes',
    reps: '6 / côté',
    detail: 'Une main derrière la tête : ouvre le coude vers le plafond en le suivant des yeux, puis ramène-le sous la poitrine. Le bassin ne bouge pas.'
  },
  {
    group: 'push',
    name: 'Poignets à quatre pattes',
    reps: '10 + 10',
    detail: 'Mains à plat, doigts vers l’avant : bascule doucement le poids vers l’avant puis l’arrière (10). Puis doigts tournés vers les genoux, petites bascules (10). Jamais jusqu’à la douleur.'
  },
  {
    group: 'push',
    name: 'Pompes scapulaires',
    reps: '10',
    detail: 'En planche bras tendus, pieds nus : laisse la poitrine descendre entre les omoplates sans plier les coudes, puis repousse le sol en écartant les omoplates. Réveille le dentelé et stabilise les épaules.'
  },
  {
    group: 'hamstrings',
    name: 'Pont fessier',
    reps: '10',
    detail: 'Sur le dos, pieds à plat près des fesses : monte le bassin en serrant les fessiers 1 s en haut. Prépare l’arrière des cuisses au leg curl.'
  }
];

// Groupes de l'échauffement, déclenchés par les échelles présentes dans la
// séance (« all » : toujours).
const SPORT_WARMUP_GROUPS = {
  push: ['push', 'wide', 'close', 'pike', 'plank', 'side', 'climbers'],
  pull: ['row', 'slidepull', 'pull', 'invrow', 'back'],
  hips: ['squat', 'hamcurl', 'hinge'],
  legs: ['squat', 'hinge'],
  hamstrings: ['hamcurl', 'hinge']
};

// Séries d'approche : avant le premier exercice de chaque famille.
const SPORT_APPROACH_FAMILIES = {
  push: ['push', 'wide', 'close'],
  pike: ['pike'],
  row: ['row']
};
