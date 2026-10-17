/* ═══════════════════════════════════════════════════════════
   MOTEUR MENU — portage JavaScript des routes de l'outil Menu
   (Projet Menu/app.py + stock_manager.py), pour s'en servir sans
   le PC.

   Répartition :
   - le PC (publier_mydesk.py) publie ce qui demande Python : les
     recettes, leur détail, les calories, et pour chaque ingrédient
     la liste des produits candidats (filtrage par rayon / mots-clés
     / exclusions) ;
   - ce moteur refait tout le reste : choix du produit selon la
     quantité (conditionnement, anti-gaspillage, carte U), stock,
     placard, listes de courses, plats à préparer, journal...
   - l'état (sélection, favoris, listes, stock...) vit dans
     appData.menu, synchronisé comme le reste de MyDesk.

   Chaque fonction garde le nom et la logique de son modèle Python
   pour qu'on puisse les comparer côte à côte.
   ═══════════════════════════════════════════════════════════ */

const MenuEngine = (() => {
  const PLACARD_DEFAUT = {
    sel: { vide: false },
    poivre: { vide: false },
    "huile d'olive": { vide: false },
    moutarde: { vide: false },
    vinaigre: { vide: false }
  };
  const INGREDIENTS_NON_LIMITANTS = new Set(['eau']);
  const NB_JOURS_CALENDRIER_MAX = 62;
  const URL_BOX_MIDI = 'midi:box';
  const MESSAGE_PC = "Cette fonction a besoin du PC : lance l'outil Menu (Lancer Menu.bat) pour le scraping.";

  let base = null; // menu-base (publié par le PC)
  let catalogue = null; // réponse /catalogue (publiée par le PC)
  let produitsParId = null; // id -> ligne du rayon principal (choix manuel, extras)
  let produitsParLigne = null; // "rayon|id" -> ligne (candidats)
  let dictionnaire = null;

  /* ── Données ─────────────────────────────────────────────── */

  // Un même id peut exister dans plusieurs rayons : les candidats désignent
  // une ligne précise (id + rayon), comme les lignes du CSV côté Python.
  const cleLigne = (id, rayon) => `${rayon || ''}|${id}`;

  function setData(nouvelleBase, nouveauCatalogue) {
    base = nouvelleBase;
    catalogue = nouveauCatalogue;
    produitsParId = new Map();
    produitsParLigne = new Map();
    const rayonPrincipal = (base && base.rayon_principal) || {};
    if (catalogue && catalogue.rayons) {
      Object.entries(catalogue.rayons).forEach(([rayonGroupe, items]) => {
        const rayon = rayonGroupe === 'autre' ? null : rayonGroupe;
        items.forEach((p) => {
          if (!p.id) return;
          const ligne = { ...p, rayon };
          produitsParLigne.set(cleLigne(p.id, rayon), ligne);
          const principal = rayonPrincipal[p.id];
          if (!produitsParId.has(p.id) || (principal !== undefined && principal === rayon)) produitsParId.set(p.id, ligne);
        });
      });
    }
    dictionnaire = new Set(base ? base.dictionnaire || [] : []);
  }

  // Mots qu'un produit doit porter pour cet ingrédient (œufs : mode
  // d'élevage annoncé, jamais de cage). scrape_marmiton.respecte_mots_requis.
  function respecteMotsRequis(c, produit) {
    const infos = base && base.canoniques ? base.canoniques[c] : null;
    const requis = infos && infos.mots_requis_produit;
    if (!requis || !requis.length || !produit) return true;
    const nom = normaliserTexte(produit.nom);
    return requis.some((mot) => {
      const m = normaliserTexte(mot).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`\\b${m}s?\\b`).test(nom);
    });
  }

  function candidatsDe(infos) {
    return (infos.candidats || [])
      .map((c) => (Array.isArray(c) ? produitsParLigne.get(cleLigne(c[0], c[1])) : produitsParId.get(c)))
      .filter(Boolean);
  }

  function hasData() {
    return Boolean(base);
  }

  function etatVide() {
    return {
      importe: null,
      selection: { recettes: [], horodatage: null },
      favoris: {},
      annotations: {},
      listes: [],
      plats: [],
      journal: [],
      placard: JSON.parse(JSON.stringify(PLACARD_DEFAUT)),
      stock: {},
      choix: {},
      materiel: [],
      supprimees: {}
    };
  }

  function etat() {
    if (!appData.menu || typeof appData.menu !== 'object') appData.menu = etatVide();
    const e = appData.menu;
    const vide = etatVide();
    Object.keys(vide).forEach((cle) => {
      if (e[cle] === undefined || e[cle] === null) e[cle] = vide[cle];
    });
    convertirStockEnPieces(e.stock);
    return e;
  }

  /* ── Ingrédients à la pièce (stock_manager.py, scrape_marmiton.py) ── */

  // Œufs, concombres, citrons... : quantités en NOMBRE DE PIÈCES (recette,
  // stock, liste), jamais en grammes. "quantite_g" garde son nom mais porte
  // alors des pièces, avec "unite": "piece".
  const aLaPiece = (c) => Boolean(base && base.ingredients_a_la_piece && base.ingredients_a_la_piece[c]);
  const uniteIngredient = (c) => (aLaPiece(c) ? 'piece' : 'g');

  function avecUnite(c, entree) {
    if (aLaPiece(c)) entree.unite = 'piece';
    return entree;
  }

  // Anciennes entrées en grammes (480 g d'œuf) -> pièces, une seule fois, avec
  // le poids que l'ancien code avait lui-même utilisé (cf. publier_mydesk.py).
  function convertirStockEnPieces(stock) {
    if (!stock || !base || !base.ingredients_a_la_piece) return;
    const anciens = base.ancien_poids_piece_g || {};
    Object.entries(stock).forEach(([c, entree]) => {
      if (!aLaPiece(c) || !entree || entree.unite === 'piece') return;
      const g = entree.quantite_g || 0;
      entree.quantite_g = g > 0 ? Math.max(0.5, Math.round((g / (anciens[c] || 1)) * 2) / 2) : 0;
      entree.unite = 'piece';
    });
  }

  function sauver() {
    saveData();
  }

  // Import unique de l'état du PC (output/*.json), au premier chargement.
  // Les tableaux reçoivent un id pour que la synchronisation fusionne
  // élément par élément.
  function importerEtatInitial(initial) {
    const e = etat();
    if (e.importe || !initial) return false;
    e.selection = {
      recettes: (initial.selection && initial.selection.recettes || []).map((r) => ({ id: r.url, ...r })),
      horodatage: initial.selection ? initial.selection.horodatage || null : null
    };
    e.favoris = Object.fromEntries((initial.favoris || []).map((url) => [url, true]));
    e.annotations = initial.annotations || {};
    e.listes = initial.listes || [];
    e.plats = (initial.plats || []).map((p) => ({ id: p.url, ...p }));
    e.journal = (initial.journal || []).map((j, i) => ({ id: `${j.cuisine_le || j.date}-${i}`, ...j }));
    e.placard = initial.placard || e.placard;
    e.stock = initial.stock || {};
    e.choix = initial.choix || {};
    e.materiel = initial.materiel || [];
    e.importe = initial.exporte_le || new Date().toISOString();
    sauver();
    return true;
  }

  /* ── Outils (équivalents Python) ─────────────────────────── */

  const arrondi = (x, n = 2) => {
    const f = 10 ** n;
    return Math.round((x + Number.EPSILON) * f) / f;
  };

  function nombreFr(valeur, decimales = 1) {
    const r = arrondi(valeur, decimales);
    if (Math.abs(r - Math.round(r)) < 1e-9) return String(Math.round(r));
    return r.toFixed(decimales).replace(/0+$/, '').replace(/\.$/, '').replace('.', ',');
  }

  function grammesFr(grammes) {
    return grammes >= 1000 ? `${nombreFr(grammes / 1000, 2)} kg` : `${nombreFr(grammes, 0)} g`;
  }

  function etapesALEchelle(modeles, parts, grammesParPart) {
    return modeles.map((etape) => etape.replace(/\{(box|g|x|paquets)(?::([^}:]+))?(?::([^}]+))?\}/g, (tout, genre, a, b) => {
      const g = a !== undefined ? grammesParPart[a.trim()] : undefined;
      if (genre === 'box') return nombreFr(parts);
      if (genre === 'x' && Number.isFinite(parseFloat(String(a).replace(',', '.')))) return nombreFr(parseFloat(String(a).replace(',', '.')) * parts);
      if (genre === 'g' && Number.isFinite(g)) return grammesFr(g * parts);
      if (genre === 'paquets' && Number.isFinite(g) && Number(b) > 0) return nombreFr((g * parts) / Number(b));
      return tout;
    }));
  }

  function nombreOuNone(valeur) {
    if (valeur === null || valeur === undefined || valeur === '') return null;
    const n = Number(valeur);
    return Number.isFinite(n) ? n : null;
  }

  function normaliserTexte(texte) {
    return String(texte || '')
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[’‘ʼ`]/g, "'");
  }

  const pad = (n) => String(n).padStart(2, '0');
  const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const isoSecondes = (d = new Date()) =>
    `${isoDate(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  function dateOuNone(valeur) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(valeur || ''));
    if (!m) return null;
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function recette(url) {
    return base && base.recettes ? base.recettes[url] || null : null;
  }

  function supprimee(url) {
    return Boolean(etat().supprimees[url]);
  }

  /* ── Favoris, sélection, annotations, matériel ───────────── */

  function listeFavoris() {
    return Object.keys(etat().favoris).filter((url) => etat().favoris[url]);
  }

  function selectionSemaine() {
    const sel = etat().selection;
    return {
      recettes: (sel.recettes || []).map(({ url, personnes }) => ({ url, personnes: personnes ?? null })),
      horodatage: sel.horodatage || null
    };
  }

  /* ── Repas (app.py : parts_par_repas & co) ──────────────── */

  // Une part = ce qu'annonce la recette ; un repas = une portion d'homme de
  // 20 ans, 1,85 m, 73 kg (base.kcal_par_portion). Les parts restent l'unité interne.
  // Profil de la personne (sexe, âge, taille, poids, activité) : fixe ce que
  // vaut UN repas. Chacun règle le sien (« Mon profil », gardé dans
  // appData.menu.profil) ; à défaut, celui du PC publié dans la base.
  // app.py : charger_profil / kcal_repas_actuel / valider_profil.
  const PROFIL_DEFAUT = { sexe: 'homme', age: 20, poids_kg: 73, taille_cm: 185, activite: 1.55 };
  const ACTIVITES = [1.2, 1.375, 1.55, 1.725, 1.9];

  function profil() {
    return { ...PROFIL_DEFAUT, ...((base && base.profil) || {}), ...(etat().profil || {}) };
  }

  function kcalRepas(p = profil()) {
    const metabolisme = 10 * p.poids_kg + 6.25 * p.taille_cm - 5 * p.age + (p.sexe === 'femme' ? -161 : 5);
    return Math.round((metabolisme * p.activite) / 3 / 10) * 10;
  }

  function validerProfil(data) {
    data = data || {};
    if (data.sexe !== 'homme' && data.sexe !== 'femme') return [null, 'Sexe : homme ou femme.'];
    const bornes = { age: [10, 100, 'Âge'], taille_cm: [120, 230, 'Taille'], poids_kg: [30, 250, 'Poids'] };
    const p = { sexe: data.sexe };
    for (const [cle, [mini, maxi, nom]] of Object.entries(bornes)) {
      const v = nombreOuNone(data[cle]);
      if (v === null || v < mini || v > maxi) return [null, `${nom} : entre ${mini} et ${maxi}.`];
      p[cle] = arrondi(v, 1);
    }
    const activite = nombreOuNone(data.activite);
    if (!ACTIVITES.includes(activite)) return [null, "Niveau d'activité inconnu."];
    p.activite = activite;
    return [p, null];
  }

  // Repas que fait la recette telle qu'écrite, avec le repère du profil ; la
  // box du midi garde son nombre fixé (repas_fixes).
  function portionsDe(r) {
    if (!r) return null;
    const fixes = Number(r.repas_fixes);
    if (fixes > 0) return fixes;
    const kcal = Number(r.kcal_total);
    if (kcal > 0) return arrondi(kcal / kcalRepas(), 1);
    return r.portions_reelles ?? null;
  }

  // Recette qui fait presque un nombre rond de repas (4 galettes = 1,9 repas) :
  // on la compte pour ce nombre rond, sinon « 2 repas » donnerait 526,3 g d'eau
  // et 5 œufs au lieu de la recette telle qu'écrite.
  const TOLERANCE_REPAS_ROND = 0.15;

  function partsParRepas(r) {
    const servingsBase = Number(r && r.servings_base);
    let portions = Number(portionsDe(r));
    if (!servingsBase || !portions) return null;
    const rond = Math.round(portions);
    if (rond >= 1 && Math.abs(portions - rond) <= rond * TOLERANCE_REPAS_ROND) portions = rond;
    return servingsBase / portions;
  }

  // Un repas se mange en entier : 1 ou 2, jamais 1,5 (au moins 1 dès qu'il
  // y a quelque chose). app.py : repas_entiers.
  function repasEntiers(repas) {
    if (repas === null || repas === undefined) return null;
    return repas > 0 ? Math.max(1, Math.floor(repas + 0.5)) : 0;
  }

  function repasDepuisParts(parts, ppr) {
    if (parts === null || parts === undefined) return null;
    return repasEntiers(ppr ? parts / ppr : parts);
  }

  function partsDepuisRepas(repas, ppr) {
    return ppr ? arrondi(repas * ppr, 2) : repas;
  }

  function repasParDefaut(r, ppr) {
    const servingsBase = (r && r.servings_base) || 1;
    return repasEntiers(ppr ? servingsBase / ppr : servingsBase);
  }

  /* ── Mise à l'échelle ────────────────────────────────────── */

  function facteurEchelle(partsDemandees, servingsBase) {
    const parts = Number(partsDemandees);
    const b = Number(servingsBase);
    if (!Number.isFinite(parts) || !Number.isFinite(b) || partsDemandees === null || servingsBase === null) return 1.0;
    if (parts <= 0 || b <= 0) return 1.0;
    return parts / b;
  }

  function consigneALEchelle(consigne, facteur) {
    if (!consigne || facteur === 1) return [consigne, false];
    const texte = consigne.trim();
    const espace = texte.indexOf(' ');
    const tete = espace === -1 ? [texte] : [texte.slice(0, espace), texte.slice(espace + 1)];
    const nombre = Number(tete[0].replace(',', '.'));
    if (!Number.isFinite(nombre) || tete[0] === '') return [consigne, false];
    // Toujours un entier, arrondi au-dessus : jamais « 1,5 saucisse ».
    const arr = Math.max(1, Math.ceil(nombre * facteur - 0.01));
    const reste = tete.length > 1 ? tete[1] : '';
    return [`${arr} ${reste}`.trim(), true];
  }

  const ARTICLES_EN_TETE = ['des ', 'les ', 'le ', 'la ', "l'", 'un ', 'une ', 'du ', 'de la ', 'de ', "d'"];

  function nettoyerLibelle(libelle) {
    let texte = String(libelle || '').trim();
    const minuscule = texte.toLowerCase();
    for (const article of ARTICLES_EN_TETE) {
      if (minuscule.startsWith(article)) {
        texte = texte.slice(article.length).trim();
        break;
      }
    }
    return texte;
  }

  function nombreEtReste(consigne) {
    const texte = String(consigne || '').trim();
    if (!texte) return [null, ''];
    const espace = texte.indexOf(' ');
    const tete = espace === -1 ? [texte] : [texte.slice(0, espace), texte.slice(espace + 1)];
    const nombre = Number(tete[0].replace(',', '.'));
    if (!Number.isFinite(nombre)) return [null, texte];
    return [nombre, tete.length > 1 ? tete[1].trim() : ''];
  }

  // Ce que la recette demande, dans ses propres mots, mis à l'échelle.
  function demandesOriginales(r, ratio) {
    const consignes = r.instructions || {};
    const libelles = r.noms_origine || {};
    const resultat = {};
    Object.entries(consignes).forEach(([canonique, textes]) => {
      const noms = libelles[canonique] || [];
      const demandes = [];
      textes.forEach((consigne, index) => {
        const libelle = nettoyerLibelle(index < noms.length ? noms[index] : canonique);
        const [nombre, reste] = nombreEtReste(consigne);
        if (nombre === null) {
          demandes.push(libelle || canonique);
          return;
        }
        const affiche = Math.max(1, Math.ceil(nombre * ratio - 0.01));
        if (reste) {
          const liaison = 'aeiouyéèêh'.includes(libelle.slice(0, 1).toLowerCase()) && libelle ? "d'" : 'de ';
          demandes.push(libelle ? `${affiche} ${reste} ${liaison}${libelle}` : `${affiche} ${reste}`);
        } else {
          demandes.push(`${affiche} ${libelle}`.trim());
        }
      });
      if (demandes.length) resultat[canonique] = demandes;
    });
    return resultat;
  }

  function besoinsRecetteAParts(r, partsDemandees) {
    const facteur = facteurEchelle(partsDemandees, r.servings_base);
    const besoins = {};
    Object.entries(r.poids || {}).forEach(([c, g]) => {
      besoins[c] = g * facteur;
    });
    return [besoins, facteur];
  }

  /* ── Stock virtuel (stock_manager.py) ────────────────────── */

  function filtrerPlacardPermanent(besoins) {
    const placard = etat().placard;
    const active = {};
    const dejaEnStock = {};
    Object.entries(besoins).forEach(([c, g]) => {
      const entree = placard[c];
      if (entree && !entree.vide) dejaEnStock[c] = g;
      else active[c] = g;
    });
    return [active, dejaEnStock];
  }

  function appliquerStockSurBesoins(besoins) {
    const stock = etat().stock;
    const reels = {};
    const detail = {};
    Object.entries(besoins).forEach(([c, besoin]) => {
      const dispo = (stock[c] && stock[c].quantite_g) || 0;
      const pris = Math.min(besoin, dispo);
      reels[c] = besoin - pris;
      if (pris > 0) detail[c] = { pris_au_stock_g: arrondi(pris, 1), restant_apres_g: arrondi(dispo - pris, 1) };
    });
    return [reels, detail];
  }

  function ajouterAchats(achatsG) {
    const stock = etat().stock;
    const aujourdhui = isoDate(new Date());
    Object.entries(achatsG).forEach(([c, g]) => {
      if (!g || g <= 0) return;
      const entree = stock[c] || { quantite_g: 0 };
      stock[c] = avecUnite(c, { quantite_g: arrondi((entree.quantite_g || 0) + g, 1), derniere_maj: aujourdhui });
    });
  }

  const estAppoint = (c, placard) => INGREDIENTS_NON_LIMITANTS.has(c) || c in placard;

  function consommerStock(besoins) {
    const stock = etat().stock;
    const placard = etat().placard;
    const rapport = {};
    Object.entries(besoins).forEach(([c, besoin]) => {
      if (besoin === null || besoin <= 0) return;
      if (estAppoint(c, placard)) {
        rapport[c] = { consomme_g: 0, manquant_g: 0, restant_g: null, dans_placard: true };
        return;
      }
      const dispo = (stock[c] && stock[c].quantite_g) || 0;
      const consomme = Math.min(besoin, dispo);
      const restant = dispo - consomme;
      if (restant > 0) stock[c] = avecUnite(c, { quantite_g: arrondi(restant, 1), derniere_maj: isoDate(new Date()) });
      else delete stock[c];
      rapport[c] = {
        consomme_g: arrondi(consomme, 1),
        manquant_g: arrondi(besoin - consomme, 1),
        restant_g: arrondi(restant, 1),
        dans_placard: false
      };
    });
    return rapport;
  }

  function partsRealisables(besoinsBase, servingsBase) {
    const b = Number(servingsBase);
    if (!Number.isFinite(b) || b <= 0 || !besoinsBase || !Object.keys(besoinsBase).length) return [0, {}, []];
    const stock = etat().stock;
    const placard = etat().placard;
    let ratioMin = null;
    const ratios = {};
    const appoints = [];
    Object.entries(besoinsBase).forEach(([c, besoin]) => {
      if (besoin === null || besoin <= 0) return;
      if (estAppoint(c, placard)) {
        if (placard[c] && placard[c].vide && ((stock[c] && stock[c].quantite_g) || 0) < besoin) appoints.push(c);
        return;
      }
      const ratio = ((stock[c] && stock[c].quantite_g) || 0) / besoin;
      ratios[c] = ratio;
      if (ratioMin === null || ratio < ratioMin) ratioMin = ratio;
    });
    if (ratioMin === null) ratioMin = 1.0;
    ratioMin = Math.min(ratioMin, 1.0);
    const partsMax = Math.floor(ratioMin * b * 2) / 2;
    const limitants = {};
    Object.entries(ratios).forEach(([c, ratio]) => {
      const parts = Math.floor(Math.min(ratio, 1.0) * b * 2) / 2;
      if (parts < b) limitants[c] = parts;
    });
    return [partsMax, limitants, appoints.sort()];
  }

  function couvertureParStock(besoins) {
    const stock = etat().stock;
    const placard = etat().placard;
    const manquants = {};
    const couverts = {};
    Object.entries(besoins).forEach(([c, besoin]) => {
      if (besoin === null || besoin <= 0) return;
      if (estAppoint(c, placard)) {
        couverts[c] = arrondi(besoin, 1);
        return;
      }
      const dispo = (stock[c] && stock[c].quantite_g) || 0;
      if (dispo >= besoin) couverts[c] = arrondi(besoin, 1);
      else manquants[c] = arrondi(besoin - dispo, 1);
    });
    return [manquants, couverts];
  }

  /* ── Produits (app.py : poids_produit_g, choisir_produit…) ─ */

  function poidsProduitG(p) {
    const manuels = (base && base.poids_manuels) || {};
    if (p.id in manuels) return Number(manuels[p.id]);
    const catalogue = poidsCatalogueG(p);
    if (catalogue) return catalogue;
    const estime = p.poids_estime_g;
    if (estime !== null && estime !== undefined && estime !== '' && Number.isFinite(Number(estime))) return Number(estime);
    return null;
  }

  // marmiton.poids_catalogue_g : poids réel écrit par le catalogue, jamais estimé.
  function poidsCatalogueG(p) {
    const val = Number(p.quantite_valeur);
    if (p.quantite_valeur === null || p.quantite_valeur === undefined || p.quantite_valeur === '' || !Number.isFinite(val) || val <= 0) return null;
    const facteur = { g: 1, gr: 1, grs: 1, ml: 1, kg: 1000, l: 1000, cl: 10 }[String(p.quantite_unite || '').trim().toLowerCase()];
    return facteur ? val * facteur : null;
  }

  // marmiton.pieces_par_produit : "Boîte de 10" -> 10, "La pièce" -> 1,
  // vendu au poids -> null.
  const MOTIFS_PIECES_PRODUIT = [
    /\b(?:boite|plateau|lot|filet|sachet|barquette|bouquet|ruban|insert|pack|etui|coffret)\s+(?:de\s+)?(\d+)\b/,
    /\b(\d+)\s*(?:fruits?|pieces?|oeufs|unites?)\b/,
    /\bx\s?(\d+)\b/
  ];
  function piecesParProduit(p) {
    const nom = normaliserTexte(p.nom || '');
    for (const motif of MOTIFS_PIECES_PRODUIT) {
      const m = motif.exec(nom);
      if (m && Number(m[1]) > 0) return Number(m[1]);
    }
    return String(p.unite_prix || '').trim().toLowerCase() === 'pce' ? 1 : null;
  }

  // app.contenance_produit : pièces pour un ingrédient à la pièce, grammes sinon.
  const contenanceProduit = (p, c) => (aLaPiece(c) ? piecesParProduit(p) : poidsProduitG(p));

  function extrairePourcentageReduction(texte) {
    if (!texte) return null;
    const m = /(\d+(?:[.,]\d+)?)\s*%/.exec(String(texte));
    return m ? Number(m[1].replace(',', '.')) : null;
  }

  function reductionCarteU(p) {
    const avantage = Boolean(p.avantage_carte_u);
    return [avantage, avantage ? extrairePourcentageReduction(p.promotion_texte) : null];
  }

  const remise = (montant, pct) => (pct ? montant * (1 - pct / 100) : montant);

  function choisirProduit(candidats, grammes, canonique, produitIdForce) {
    if (!candidats.length) return null;
    const ratioMax = base.ratio_gaspillage_max || 3.0;
    const sansPlafond = new Set(base.rayons_sans_plafond || []);
    const piece = aLaPiece(canonique);

    // Plus d'estimation par poids moyen (04/10/2026, cf. app.choisir_produit) :
    // quantités en pièces pour un ingrédient à la pièce, prix par pièce.
    const construireOptions = () => {
      const options = [];
      candidats.forEach((p) => {
        const prixUnite = Number(p.prix);
        if (p.prix === null || p.prix === undefined || !Number.isFinite(prixUnite)) return;
        const poidsUnite = contenanceProduit(p, canonique);
        const approxime = false;
        if (!poidsUnite || poidsUnite <= 0) return;
        const nbUnites = Math.ceil(grammes / poidsUnite);
        const prixKg = arrondi(piece ? prixUnite / poidsUnite : (prixUnite / poidsUnite) * 1000, 3);
        const [avantage, pct] = reductionCarteU(p);
        const prixUniteEffectif = remise(prixUnite, pct);
        options.push({
          id: p.id,
          produit: p.nom,
          rayon: p.rayon,
          nb_unites: nbUnites,
          poids_unite_g: arrondi(poidsUnite, 1),
          unite: uniteIngredient(canonique),
          prix_unite: prixUnite,
          prix_kg: arrondi(prixKg, 3),
          prix_kg_effectif: arrondi(remise(prixKg, pct), 3),
          cout_total: arrondi(nbUnites * prixUniteEffectif, 2),
          cout_total_sans_carte_u: arrondi(nbUnites * prixUnite, 2),
          approximatif: approxime,
          en_promo: Boolean(p.en_promo),
          avantage_carte_u: avantage,
          reduction_carte_u_pct: pct
        });
      });
      return options;
    };

    const options = construireOptions();

    if (options.length) {
      options.sort((a, b) => a.prix_kg_effectif - b.prix_kg_effectif);
      const raisonnables = options.filter(
        (o) => sansPlafond.has(o.rayon) || o.nb_unites * o.poids_unite_g <= grammes * ratioMax
      );
      const pool = raisonnables.length ? raisonnables : options;
      let retenu = pool.reduce((m, o) => (o.prix_kg_effectif < m.prix_kg_effectif ? o : m));
      const moinsChers = options.filter(
        (o) => o.prix_kg_effectif < retenu.prix_kg_effectif && o.cout_total <= retenu.cout_total
      );
      if (moinsChers.length) retenu = moinsChers.reduce((m, o) => (o.prix_kg_effectif < m.prix_kg_effectif ? o : m));
      const force = produitIdForce ? options.find((o) => o.id === produitIdForce) : null;
      return { ...(force || retenu), alternatives: options };
    }

    // Repli : aucun poids exploitable -> prix/kg du catalogue, approximatif.
    // Jamais pour un ingrédient à la pièce (un prix au kg ne dit pas combien
    // de pièces acheter).
    if (piece) return null;
    const optionsPrixKg = [];
    candidats.forEach((p) => {
      if (!['kg', 'l'].includes(String(p.unite_prix || '').trim().toLowerCase())) return;
      const prixKg = Number(p.prix_unitaire);
      if (p.prix_unitaire === null || p.prix_unitaire === undefined || !Number.isFinite(prixKg)) return;
      const [avantage, pct] = reductionCarteU(p);
      optionsPrixKg.push([remise(prixKg, pct), prixKg, pct, avantage, p]);
    });
    if (!optionsPrixKg.length) return null;
    optionsPrixKg.sort((a, b) => a[0] - b[0]);
    const alternatives = optionsPrixKg.map(([eff, brut, pct, avantage, p]) => ({
      id: p.id,
      produit: p.nom,
      rayon: p.rayon,
      nb_unites: null,
      poids_unite_g: null,
      prix_unite: null,
      prix_kg: arrondi(eff, 3),
      cout_total: arrondi((grammes / 1000) * eff, 2),
      cout_total_sans_carte_u: arrondi((grammes / 1000) * brut, 2),
      approximatif: true,
      en_promo: Boolean(p.en_promo),
      avantage_carte_u: avantage,
      reduction_carte_u_pct: pct
    }));
    const force = produitIdForce ? alternatives.find((a) => a.id === produitIdForce) : null;
    return { ...(force || alternatives[0]), alternatives };
  }

  function choixDepuisProduit(p, grammes, canonique) {
    const prixUnite = Number(p.prix);
    if (p.prix === null || p.prix === undefined || !Number.isFinite(prixUnite)) return null;
    const [, pct] = reductionCarteU(p);
    const poidsUnite = contenanceProduit(p, canonique);
    if (poidsUnite && poidsUnite > 0) {
      const nbUnites = Math.ceil(grammes / poidsUnite);
      return {
        id: p.id,
        produit: p.nom,
        nb_unites: nbUnites,
        poids_unite_g: arrondi(poidsUnite, 1),
        unite: uniteIngredient(canonique),
        cout_total: arrondi(nbUnites * remise(prixUnite, pct), 2),
        cout_total_sans_carte_u: arrondi(nbUnites * prixUnite, 2),
        approximatif: false
      };
    }
    if (['kg', 'l'].includes(String(p.unite_prix || '').trim().toLowerCase()) && !aLaPiece(canonique)) {
      const prixKg = Number(p.prix_unitaire);
      if (!Number.isFinite(prixKg) || p.prix_unitaire === null) return null;
      return {
        id: p.id,
        produit: p.nom,
        nb_unites: null,
        poids_unite_g: null,
        cout_total: arrondi((grammes / 1000) * remise(prixKg, pct), 2),
        cout_total_sans_carte_u: arrondi((grammes / 1000) * prixKg, 2),
        approximatif: true
      };
    }
    return null;
  }

  /* ── "À choisir" (app.py : mode_demande, achat_automatique...) ── */

  // La liste ne choisit seule la quantité que si recette et magasin comptent
  // pareil (pièces / pièces, poids / poids). Sinon : ligne "à choisir", avec
  // les mots de la recette et tous les produits en lice.
  const MOTS_MESURE_CUISINE = ['cuill', 'c.', 'cas', 'cac', 'cs', 'cc', 'pincee', 'verre', 'tasse', 'tbsp', 'tsp', 'goutte', 'noix', 'brin', 'branche', 'filet', 'noisette', 'zeste'];
  const UNITES_POIDS_CONSIGNE = /^\s*[\d.,/]+\s*(?:g|gr|grs|grammes?|kg|kilos?|ml|cl|dl|l|litres?|oz)\b/i;

  function modeDemande(consigne, libelle) {
    const texteConsigne = String(consigne || '').trim();
    if (!texteConsigne) return 'libre';
    if (UNITES_POIDS_CONSIGNE.test(texteConsigne)) return 'poids';
    const mots = normaliserTexte(`${texteConsigne} ${libelle || ''}`).replace(/[\d.,/]+/g, ' ').split(/\s+/).filter(Boolean);
    if (mots.length && MOTS_MESURE_CUISINE.some((m) => mots[0].startsWith(m))) return 'mesure';
    return 'piece';
  }

  function modesDemandeRecette(r) {
    const approximatifs = new Set(r.approximatifs || []);
    const consignes = r.instructions || {};
    const libelles = r.noms_origine || {};
    const modes = {};
    Object.entries(r.poids || {}).forEach(([c, valeur]) => {
      if (!valeur || valeur <= 0) return;
      if (!approximatifs.has(c)) {
        modes[c] = new Set([aLaPiece(c) ? 'piece' : 'poids']);
        return;
      }
      const noms = libelles[c] || [];
      const textes = consignes[c] && consignes[c].length ? consignes[c] : [''];
      modes[c] = new Set(textes.map((t, i) => modeDemande(t, i < noms.length ? noms[i] : '')));
    });
    return modes;
  }

  function achatAutomatique(c, modes, candidats) {
    const liste = [...(modes || [])];
    if (aLaPiece(c)) return liste.every((m) => m === 'piece');
    return liste.every((m) => m === 'poids' || m === 'mesure') && candidats.some((p) => poidsProduitG(p));
  }

  function optionsAChoisir(candidats, c) {
    const options = [];
    candidats.forEach((p) => {
      const prix = Number(p.prix);
      if (p.prix === null || p.prix === undefined || !Number.isFinite(prix)) return;
      const poids = poidsProduitG(p);
      const pieces = piecesParProduit(p);
      const [avantage, pct] = reductionCarteU(p);
      let unite = 'piece';
      let prixRef = prix;
      if (poids) {
        unite = 'g';
        prixRef = arrondi((prix / poids) * 1000, 3);
      } else if (pieces) {
        prixRef = arrondi(prix / pieces, 3);
      }
      const contenance = contenanceProduit(p, c);
      options.push({
        id: p.id,
        produit: p.nom,
        rayon: p.rayon,
        nb_unites: 1,
        poids_unite_g: contenance ? arrondi(contenance, 1) : null,
        unite,
        prix_unite: prix,
        prix_kg: prixRef,
        cout_total: arrondi(remise(prix, pct), 2),
        cout_total_sans_carte_u: arrondi(prix, 2),
        approximatif: false,
        en_promo: Boolean(p.en_promo),
        avantage_carte_u: avantage,
        reduction_carte_u_pct: pct
      });
    });
    options.sort((a, b) => (a.unite !== 'g') - (b.unite !== 'g') || a.prix_kg - b.prix_kg);
    return options;
  }

  /* ── Génération de la liste de courses ───────────────────── */

  function genererListeDeCourses(recettesListe, extras = {}) {
    const entrees = (recettesListe || [])
      .filter((r) => r && r.url)
      .map((r) => ({ url: r.url, personnes: r.parts }));
    if (!entrees.length) return { erreur: 'Cette liste ne contient aucun menu.' };

    const trouvees = [];
    const manquantes = [];
    entrees.forEach((entree) => {
      const r = recette(entree.url);
      if (!r) manquantes.push(entree.url);
      else trouvees.push([{ ...r, url: entree.url }, facteurEchelle(entree.personnes, r.servings_base)]);
    });
    if (!trouvees.length) {
      return {
        erreur: "Aucun menu de cette liste n'a été retrouvé dans les recettes (export écrasé par un scraping plus récent ?).",
        recettes_manquantes: manquantes
      };
    }

    const besoinsBruts = {};
    const besoinsParRecette = [];
    const demandesParIngredient = {};
    const approximatifParIngredient = {};
    const modesParIngredient = {};
    trouvees.forEach(([r, ratio]) => {
      Object.entries(modesDemandeRecette(r)).forEach(([c, modes]) => {
        modesParIngredient[c] = modesParIngredient[c] || new Set();
        modes.forEach((m) => modesParIngredient[c].add(m));
      });
      const besoinsRecette = {};
      Object.entries(demandesOriginales(r, ratio)).forEach(([c, demandes]) => {
        (demandesParIngredient[c] = demandesParIngredient[c] || []).push(...demandes);
      });
      (r.approximatifs || []).forEach((c) => {
        approximatifParIngredient[c] = true;
      });
      Object.entries(r.poids || {}).forEach(([c, g]) => {
        const grammes = g * ratio;
        if (grammes > 0) {
          besoinsBruts[c] = (besoinsBruts[c] || 0) + grammes;
          besoinsRecette[c] = (besoinsRecette[c] || 0) + grammes;
        }
      });
      besoinsParRecette.push({ url: r.url, nom: r.nom, besoins_g: besoinsRecette });
    });

    const recettesParIngredient = {};
    besoinsParRecette.forEach((r) => {
      Object.entries(r.besoins_g).forEach(([c, g]) => {
        (recettesParIngredient[c] = recettesParIngredient[c] || []).push({ nom: r.nom, grammes: arrondi(g, 1), url: r.url });
      });
    });

    if (!produitsParId || !produitsParId.size) {
      return {
        erreur: 'Aucun export coursesu.com trouvé — lance d\'abord le scraping coursesu.com sur le PC puis publie vers MyDesk.',
        recettes_manquantes: manquantes
      };
    }

    const demande = (c) => ({
      demandes: demandesParIngredient[c] || [],
      grammage_estime: Boolean(approximatifParIngredient[c])
    });

    const [aTraiter, dejaEnPlacard] = filtrerPlacardPermanent(besoinsBruts);
    const [besoinsReels, detailStock] = appliquerStockSurBesoins(aTraiter);
    Object.keys(besoinsReels).forEach((c) => {
      if (besoinsReels[c] > 0 && aLaPiece(c)) besoinsReels[c] = Math.ceil(besoinsReels[c] - 0.01);
    });

    const rayons = {};
    const nonResolus = [];
    const couvertParStock = [];
    let coutTotal = 0.0;
    const choixManuels = etat().choix;

    Object.keys(besoinsReels).sort().forEach((c) => {
      const grammes = besoinsReels[c];
      if (grammes <= 0) {
        const info = detailStock[c] || {};
        couvertParStock.push({
          ingredient: c,
          unite: uniteIngredient(c),
          grammes_necessaires: arrondi(besoinsBruts[c], 1),
          ...demande(c),
          restant_apres_g: info.restant_apres_g || 0,
          recettes: recettesParIngredient[c] || []
        });
        return;
      }
      const infos = base.canoniques[c];
      if (!infos || !infos.connu) {
        nonResolus.push({ ingredient: c, grammes: arrondi(grammes, 1), ...demande(c), raison: 'ingrédient inconnu du dictionnaire canonique' });
        return;
      }
      if (infos.gratuit) {
        (rayons.Gratuit = rayons.Gratuit || []).push({
          ingredient: c,
          grammes_necessaires: arrondi(grammes, 1),
          ...demande(c),
          produit: 'Eau du robinet',
          nb_unites: null,
          cout_total: 0.0,
          gain_carte_u: 0.0,
          approximatif: false,
          recettes: recettesParIngredient[c] || []
        });
        return;
      }

      // Un ancien choix manuel qui ne respecte plus les règles du canonique
      // (œufs de cage) est ignoré : retour au choix automatique.
      const idManuel = respecteMotsRequis(c, produitsParId.get(choixManuels[c])) ? choixManuels[c] : undefined;
      const candidats = candidatsDe(infos);
      if (!achatAutomatique(c, modesParIngredient[c], candidats)) {
        const options = optionsAChoisir(candidats, c);
        let retenu = options.find((o) => o.id === idManuel) || null;
        if (!retenu && idManuel && produitsParId.has(idManuel)) retenu = optionsAChoisir([produitsParId.get(idManuel)], c)[0] || null;
        if (!options.length && !retenu) {
          nonResolus.push({ ingredient: c, unite: uniteIngredient(c), grammes: arrondi(grammes, 1), ...demande(c), raison: 'aucun produit coursesu.com correspondant' });
          return;
        }
        const item = {
          ingredient: c,
          unite: uniteIngredient(c),
          grammes_necessaires: arrondi(grammes, 1),
          ...demande(c),
          a_choisir: true,
          grammage_estime: true,
          produit: retenu ? retenu.produit : null,
          produit_id: retenu ? retenu.id : null,
          nb_unites: retenu ? 1 : null,
          poids_unite_g: retenu ? retenu.poids_unite_g : null,
          cout_total: retenu ? retenu.cout_total_sans_carte_u : 0.0,
          gain_carte_u: retenu ? arrondi(retenu.cout_total_sans_carte_u - retenu.cout_total, 2) : 0.0,
          approximatif: false,
          recettes: recettesParIngredient[c] || [],
          alternatives: options
        };
        if (detailStock[c]) item.pris_au_stock_g = detailStock[c].pris_au_stock_g;
        if (retenu) coutTotal += item.cout_total;
        const rayon = (retenu && retenu.rayon) || 'À choisir';
        (rayons[rayon] = rayons[rayon] || []).push(item);
        return;
      }
      let choix = null;
      if (idManuel && produitsParId.has(idManuel)) {
        const produitManuel = produitsParId.get(idManuel);
        choix = choixDepuisProduit(produitManuel, grammes, c);
        if (choix) {
          choix.rayon = produitManuel.rayon;
          choix.alternatives = [{ ...choix }];
        }
      }
      if (!choix) {
        choix = choisirProduit(candidatsDe(infos), grammes, c, idManuel);
      }
      if (!choix) {
        nonResolus.push({ ingredient: c, unite: uniteIngredient(c), grammes: arrondi(grammes, 1), ...demande(c), raison: 'aucun produit coursesu.com correspondant' });
        return;
      }
      const coutReel = choix.cout_total_sans_carte_u ?? choix.cout_total;
      const gain = arrondi(coutReel - choix.cout_total, 2);
      coutTotal += coutReel;
      const item = {
        ingredient: c,
        unite: uniteIngredient(c),
        grammes_necessaires: arrondi(grammes, 1),
        ...demande(c),
        produit: choix.produit,
        produit_id: choix.id,
        nb_unites: choix.nb_unites,
        poids_unite_g: choix.poids_unite_g,
        cout_total: coutReel,
        gain_carte_u: gain,
        approximatif: choix.approximatif,
        recettes: recettesParIngredient[c] || [],
        alternatives: choix.alternatives || []
      };
      if (detailStock[c]) item.pris_au_stock_g = detailStock[c].pris_au_stock_g;
      const rayon = choix.rayon || 'Rayon inconnu';
      (rayons[rayon] = rayons[rayon] || []).push(item);
    });

    Object.entries(extras || {}).forEach(([id, nbUnites]) => {
      const p = produitsParId.get(id);
      if (!p) return;
      const prixUnite = Number(p.prix);
      if (p.prix === null || !Number.isFinite(prixUnite)) return;
      const [, pct] = reductionCarteU(p);
      const coutReel = arrondi(nbUnites * prixUnite, 2);
      const gain = arrondi(coutReel - nbUnites * remise(prixUnite, pct), 2);
      coutTotal += coutReel;
      const rayon = p.rayon || 'Rayon inconnu';
      (rayons[rayon] = rayons[rayon] || []).push({
        ingredient: p.nom,
        grammes_necessaires: null,
        produit: p.nom,
        produit_id: id,
        nb_unites: nbUnites,
        poids_unite_g: null,
        cout_total: coutReel,
        gain_carte_u: gain,
        approximatif: false,
        recettes: [],
        alternatives: [],
        ajoute_a_la_main: true
      });
    });

    const gainTotal = arrondi(
      Object.values(rayons).flat().reduce((s, item) => s + (item.gain_carte_u || 0), 0),
      2
    );
    return {
      fichier_marmiton: base.fichier,
      nb_recettes_selectionnees: entrees.length,
      nb_recettes_trouvees: trouvees.length,
      recettes_manquantes: manquantes,
      gain_carte_u_total: gainTotal,
      rayons,
      non_resolus: nonResolus,
      deja_en_placard: dejaEnPlacard,
      couvert_par_stock: couvertParStock,
      cout_total_estime: arrondi(coutTotal, 2)
    };
  }

  /* ── Listes de courses ───────────────────────────────────── */

  function nomListeParDefaut(listes, maintenant) {
    const baseNom = `Liste de courses ${pad(maintenant.getDate())}/${pad(maintenant.getMonth() + 1)}/${maintenant.getFullYear()}`;
    const noms = new Set(listes.map((l) => l.nom));
    if (!noms.has(baseNom)) return baseNom;
    let numero = 2;
    while (noms.has(`${baseNom} (${numero})`)) numero += 1;
    return `${baseNom} (${numero})`;
  }

  function metaListe(l) {
    return {
      id: l.id,
      nom: l.nom,
      cree_le: l.cree_le,
      statut: l.statut || 'a_acheter',
      achetee_le: l.achetee_le || null,
      recettes: l.recettes || []
    };
  }

  const trouverListe = (id) => etat().listes.find((l) => l.id === id) || null;

  /* ── Routes ──────────────────────────────────────────────── */

  const ok = (data, status = 200) => ({ status, data });
  const erreur = (message, status = 400, extra = {}) => ({ status, data: { ok: false, message, ...extra } });

  const routesGet = {
    '/status': () => ok({ statut: 'idle', logs: [MESSAGE_PC], csv_pret: false, erreur: null }),
    '/recettes/status': () => ok({ statut: 'idle', logs: [MESSAGE_PC], csv_pret: false, erreur: null }),
    '/recettes/historique': () => ok({ sources: [] }),
    '/recettes/selection': () => ok(selectionSemaine()),
    '/recettes/favoris': () => ok({ ok: true, urls: listeFavoris() }),
    '/materiel': () => ok({ possede: etat().materiel }),
    '/placard': () => ok(etat().placard),
    '/stock': () => ok(etat().stock),
    '/catalogue': () =>
      catalogue && catalogue.ok !== false
        ? ok(catalogue)
        : ok({ ok: false, message: 'Aucun catalogue coursesu.com publié — lance le scraping des rayons sur le PC.' }),

    '/menus': () => {
      if (!base.menus || base.menus.ok === false) return ok(base.menus || { ok: false, message: 'Aucune recette publiée.' });
      const annotations = etat().annotations;
      const recettes = (base.menus.recettes || [])
        .filter((r) => !supprimee(r.url))
        .map((r) => {
          const a = annotations[r.url] || {};
          const portions = portionsDe(recette(r.url)) ?? r.portions_reelles;
          const prix = r.prix_estime_coursesu;
          return {
            ...r,
            portions_reelles: portions,
            prix_par_portion_reelle: prix !== null && prix !== undefined && portions ? arrondi(prix / portions, 2) : null,
            note: a.note || 0,
            commentaire: a.commentaire || ''
          };
        });
      return ok({ ...base.menus, recettes, kcal_par_portion: kcalRepas() });
    },

    '/menus/non-reconnus': () => {
      const nr = base.non_reconnus || { ok: true, recettes: [] };
      return ok({ ...nr, recettes: (nr.recettes || []).filter((r) => !supprimee(r.url)) });
    },

    // Étapes à repères (box du midi), comme etapes_a_l_echelle dans app.py :
    // {box}, {g:canonique}, {x:n}, {paquets:canonique:taille}.
    '/menus/detail': (params) => {
      const url = params.get('url') || '';
      const detailBase = base.details[url];
      if (!detailBase || supprimee(url)) {
        return ok({ ok: false, message: 'Recette introuvable dans le dernier export Marmiton (probablement écrasé par un run plus récent).' });
      }
      const detail = JSON.parse(JSON.stringify(detailBase));
      const partsDemandees = nombreOuNone(params.get('parts'));
      const facteur = partsDemandees ? facteurEchelle(partsDemandees, detail.servings_base) : 1.0;
      let nonMisesALEchelle = false;
      if (facteur !== 1.0) {
        detail.ingredients.forEach((item) => {
          if (item.grammes !== null) {
            item.grammes = arrondi(item.grammes * facteur, 1);
            if (item.unite === 'piece') item.grammes = Math.max(1, Math.ceil(item.grammes - 0.01));
          }
          if (item.consigne_originale) {
            const [texte, ajustee] = consigneALEchelle(item.consigne_originale, facteur);
            item.consigne_originale = texte;
            if (!ajustee) nonMisesALEchelle = true;
          }
          if (item.prix !== null) item.prix = arrondi(item.prix * facteur, 2);
        });
        if (detail.prix_estime_coursesu !== null) detail.prix_estime_coursesu = arrondi(detail.prix_estime_coursesu * facteur, 2);
      }
      if (Array.isArray(detail.etapes_modeles) && detail.grammes_par_part) {
        detail.etapes = etapesALEchelle(detail.etapes_modeles, (detail.servings_base || 1) * facteur, detail.grammes_par_part);
      }
      const a = etat().annotations[url] || {};
      return ok({
        ...detail,
        note: a.note || 0,
        commentaire: a.commentaire || '',
        parts_demandees: facteur !== 1.0 ? partsDemandees : null,
        facteur_echelle: arrondi(facteur, 3),
        consignes_non_mises_a_l_echelle: facteur !== 1.0 ? nonMisesALEchelle : false,
        prix_par_personne_estime:
          detail.prix_estime_coursesu !== null && detail.servings_base
            ? arrondi(detail.prix_estime_coursesu / (detail.servings_base * facteur), 2)
            : null
      });
    },

    '/planning': (params) => {
      const aujourdhui = new Date();
      aujourdhui.setHours(0, 0, 0, 0);
      let debut = dateOuNone(params.get('debut'));
      if (!debut) {
        debut = new Date(aujourdhui);
        debut.setDate(debut.getDate() - ((debut.getDay() + 6) % 7));
      }
      let nbJours = parseInt(params.get('nb') || '7', 10);
      if (!Number.isFinite(nbJours)) nbJours = 7;
      nbJours = Math.max(1, Math.min(nbJours, NB_JOURS_CALENDRIER_MAX));
      const parDate = {};
      etat().journal.forEach((j) => {
        if (!dateOuNone(j.date)) return;
        (parDate[j.date] = parDate[j.date] || []).push({ url: j.url, nom: j.nom, parts: j.parts, repas: j.repas ?? null });
      });
      const jours = [];
      for (let i = 0; i < nbJours; i += 1) {
        const jour = new Date(debut);
        jour.setDate(debut.getDate() + i);
        const cle = isoDate(jour);
        jours.push({ date: cle, plats: parDate[cle] || [] });
      }
      return ok({ aujourdhui: isoDate(aujourdhui), debut: isoDate(debut), jours });
    },

    '/listes': () => {
      const listes = etat().listes.slice().sort((a, b) => {
        const ka = `${a.cree_le || ''}|${a.id || ''}`;
        const kb = `${b.cree_le || ''}|${b.id || ''}`;
        return ka < kb ? 1 : ka > kb ? -1 : 0;
      });
      return ok({
        ok: true,
        listes: listes.map((l) => ({
          id: l.id,
          nom: l.nom,
          cree_le: l.cree_le,
          statut: l.statut || 'a_acheter',
          achetee_le: l.achetee_le || null,
          recettes: (l.recettes || []).map((r) => ({ url: r.url, nom: r.nom, parts: r.parts, repas: r.repas ?? null }))
        }))
      });
    },

    '/plats-a-preparer': () => {
      const plats = etat().plats.map((plat) => {
        const r = recette(plat.url);
        const { id, ...sansId } = plat;
        if (!r) {
          return { ...sansId, introuvable: true, servings_base: null, parts_en_stock: 0, limitants: [], appoints_a_verifier: [] };
        }
        const servingsBase = r.servings_base || 1;
        const poids = r.poids || {};
        const ppr = partsParRepas(r);
        // Plafond = repas prévus par la liste, pas la recette écrite (app.py).
        const repasPrevus = nombreOuNone(plat.repas);
        const partsPrevues = repasPrevus ? partsDepuisRepas(repasPrevus, ppr) : servingsBase;
        const poidsPrevus = Object.fromEntries(Object.entries(poids).map(([c, g]) => [c, (g * partsPrevues) / servingsBase]));
        const [parts, limitants, appoints] = Object.keys(poids).length ? partsRealisables(poidsPrevus, partsPrevues) : [0, {}, []];
        return {
          ...sansId,
          nom: r.nom || plat.nom,
          image_url: r.image_url || null,
          temps_total: r.temps_total || null,
          servings_base: servingsBase,
          parts_par_repas: ppr,
          repas_recette: repasDepuisParts(servingsBase, ppr),
          repas_en_stock: repasDepuisParts(parts, ppr),
          parts_en_stock: parts,
          limitants: Object.keys(limitants).sort((x, y) => limitants[x] - limitants[y]).slice(0, 3),
          appoints_a_verifier: appoints
        };
      });
      return ok({ ok: true, plats });
    },

    '/stock/plats-possibles': () => {
      const panier = new Set(etat().selection.recettes.map((r) => r.url));
      const favoris = new Set(listeFavoris());
      const plats = [];
      Object.entries(base.recettes || {}).forEach(([url, r]) => {
        if (supprimee(url)) return;
        const poids = r.poids || {};
        if (!Object.keys(poids).length) return;
        const [partsMax, limitants, appoints] = partsRealisables(poids, r.servings_base);
        if (partsMax < 0.5) return;
        const [manquants, couverts] = couvertureParStock(poids);
        const prix = r.prix_total;
        const portions = portionsDe(r);
        plats.push({
          url,
          nom: r.nom,
          image_url: r.image_url || null,
          site_origine: r.site_origine,
          servings_base: r.servings_base,
          temps_total: r.temps_total || null,
          nb_ingredients_couverts: Object.keys(couverts).length,
          nb_ingredients_non_reconnus: r.nb_non_reconnus || 0,
          parts_realisables: partsMax,
          // Arrondi vers le bas : le stock ne fait pas un repas de plus qu'il n'a.
          repas_realisables: partsMax ? Math.floor((partsParRepas(r) ? partsMax / partsParRepas(r) : partsMax) + 1e-9) : 0,
          entierement_realisable: !Object.keys(manquants).length,
          limitants: Object.keys(limitants).sort((x, y) => limitants[x] - limitants[y]).slice(0, 3),
          appoints_a_verifier: appoints,
          kcal_total: r.kcal_total || null,
          portions_reelles: portions,
          prix_estime_coursesu: prix,
          prix_par_portion_reelle: prix !== null && prix !== undefined && portions ? arrondi(prix / portions, 2) : null,
          dans_panier: panier.has(url),
          favori: favoris.has(url),
          priorite: panier.has(url) ? 0 : favoris.has(url) ? 1 : 2
        });
      });
      // Comparaison des noms caractère par caractère, comme Python (pas localeCompare).
      const parNom = (x, y) => {
        const nx = (x.nom || '').toLowerCase();
        const ny = (y.nom || '').toLowerCase();
        return nx < ny ? -1 : nx > ny ? 1 : 0;
      };
      const prixOuInfini = (p) => (p.prix_par_portion_reelle === null || p.prix_par_portion_reelle === undefined ? Infinity : p.prix_par_portion_reelle);
      plats.sort((a, b) => a.priorite - b.priorite || (prixOuInfini(a) - prixOuInfini(b)) || parNom(a, b));
      return ok({ ok: true, plats, kcal_par_portion: kcalRepas() });
    },

    '/profil': () => ok({ ok: true, profil: profil(), kcal_par_repas: kcalRepas() }),

    '/produits/recherche': (params) => {
      const q = (params.get('q') || '').trim();
      if (q.length < 2) return ok({ ok: true, produits: [] });
      const qNorm = normaliserTexte(q);
      const produits = [];
      // Ordre du CSV et prix brut (publiés par le PC), comme la route Python.
      const ordre = base.ordre_produits || [];
      for (const [id, rayon, prixBrut] of ordre) {
        const p = produitsParLigne.get(cleLigne(id, rayon));
        if (p && normaliserTexte(p.nom).includes(qNorm)) {
          produits.push({ id, nom: p.nom, rayon, prix: prixBrut, unite_prix: p.unite_prix });
          if (produits.length >= 30) break;
        }
      }
      return ok({ ok: true, produits });
    }
  };

  const routesPost = {
    '/profil': (body) => {
      const [p, message] = validerProfil(body);
      if (!p) return erreur(message);
      etat().profil = p;
      sauver();
      return ok({ ok: true, profil: profil(), kcal_par_repas: kcalRepas() });
    },
    '/start': () => erreur(MESSAGE_PC, 409),
    '/stop': () => erreur(MESSAGE_PC, 409),
    '/recettes/start': () => erreur(MESSAGE_PC, 409),
    '/recettes/stop': () => erreur(MESSAGE_PC, 409),
    '/config/magasin': () => erreur(MESSAGE_PC, 409),
    '/produits/scraper-poids': () => erreur(MESSAGE_PC, 409),

    '/recettes/annotation': (body) => {
      const url = String(body.url || '').trim();
      if (!url) return erreur('URL de recette manquante.');
      let note = parseInt(body.note || 0, 10);
      if (!Number.isFinite(note)) note = 0;
      note = Math.max(0, Math.min(5, note));
      const commentaire = String(body.commentaire || '').trim().slice(0, 2000);
      const annotations = etat().annotations;
      if (note === 0 && !commentaire) delete annotations[url];
      else annotations[url] = { note, commentaire, maj: isoDate(new Date()) };
      sauver();
      return ok({ ok: true, annotation: annotations[url] || null });
    },

    '/recettes/favoris': (body) => {
      const url = String(body.url || '').trim();
      if (!url) return erreur('URL manquante.');
      const favoris = etat().favoris;
      let voulu = body.favori;
      if (voulu === undefined || voulu === null) voulu = !favoris[url];
      if (voulu) favoris[url] = true;
      else delete favoris[url];
      sauver();
      return ok({ ok: true, favori: Boolean(voulu), nb: listeFavoris().length });
    },

    '/recettes/selection': (body) => {
      const recettes = [];
      (body.recettes || []).forEach((r) => {
        const url = r && typeof r === 'object' ? String(r.url || '').trim() : '';
        if (!url) return;
        let personnes = Number(r.personnes);
        if (r.personnes === null || r.personnes === undefined || r.personnes === '' || !Number.isFinite(personnes) || personnes <= 0) personnes = null;
        recettes.push({ id: url, url, personnes });
      });
      etat().selection = { recettes, horodatage: new Date().toISOString() };
      sauver();
      return ok({ ok: true, nb: recettes.length });
    },

    '/materiel': (body) => {
      const possede = (body.possede || []).filter((m) => typeof m === 'string' && m.trim());
      etat().materiel = possede;
      sauver();
      return ok({ ok: true, possede });
    },

    '/menus/supprimer': (body) => {
      const urls = (body.urls || []).filter((u) => typeof u === 'string' && u);
      if (!urls.length) return erreur('Aucune URL fournie.');
      let nb = 0;
      urls.forEach((url) => {
        if (base.recettes[url] && !supprimee(url)) nb += 1;
        etat().supprimees[url] = true;
      });
      sauver();
      const restantes = Object.keys(base.recettes).filter((url) => !supprimee(url)).length;
      return ok({ ok: true, nb_supprimees: nb, nb_restantes: restantes });
    },

    '/listes/creer': (body) => {
      const repasVoulus = body && body.repas && typeof body.repas === 'object' ? body.repas : {};
      const selection = selectionSemaine().recettes.map((r) => r.url).filter(Boolean);
      if (!selection.length) return erreur('Aucun menu sélectionné : clique 🛒 sur les menus à préparer.');
      const recettes = [];
      let introuvables = 0;
      Array.from(new Set(selection)).forEach((url) => {
        const r = recette(url);
        if (!r || supprimee(url)) {
          introuvables += 1;
          return;
        }
        const ppr = partsParRepas(r);
        let repas = nombreOuNone(repasVoulus[url]);
        if (!repas || repas <= 0) repas = repasParDefaut(r, ppr);
        repas = repasEntiers(repas);
        recettes.push({ url, nom: r.nom || url, parts: partsDepuisRepas(repas, ppr), repas });
      });
      if (!recettes.length) return erreur("Aucun des menus sélectionnés n'existe dans les recettes actuelles.");
      const maintenant = new Date();
      const e = etat();
      const stamp = `${isoDate(maintenant).replace(/-/g, '')}-${pad(maintenant.getHours())}${pad(maintenant.getMinutes())}${pad(maintenant.getSeconds())}`;
      const liste = {
        id: `liste-${stamp}-${Math.random().toString(36).slice(2, 8)}`,
        nom: nomListeParDefaut(e.listes, maintenant),
        cree_le: isoSecondes(maintenant),
        statut: 'a_acheter',
        achetee_le: null,
        recettes,
        extras: {}
      };
      e.listes.push(liste);
      recettes.forEach((r) => {
        const existant = e.plats.find((p) => p.url === r.url);
        if (existant) Object.assign(existant, { liste_id: liste.id, liste_nom: liste.nom, repas: r.repas });
        else e.plats.push({ id: r.url, url: r.url, nom: r.nom, liste_id: liste.id, liste_nom: liste.nom, ajoute_le: liste.cree_le, repas: r.repas });
      });
      e.selection = { recettes: [], horodatage: maintenant.toISOString() };
      sauver();
      return ok({ ok: true, liste: { id: liste.id, nom: liste.nom }, nb_recettes: recettes.length, introuvables });
    },

    // Sort un plat de « À cuisiner » sans le cuisiner : stock et journal intacts.
    '/plats-a-preparer/retirer': (body) => {
      const url = String(body.url || '').trim();
      if (!url) return erreur('Plat manquant.');
      const e = etat();
      const restants = e.plats.filter((p) => p.url !== url);
      if (restants.length === e.plats.length) return erreur('Ce plat n’est plus dans « À cuisiner ».', 404);
      e.plats = restants;
      sauver();
      return ok({ ok: true });
    },

    '/plats-a-preparer/cuisine': (body) => {
      const url = String(body.url || '').trim();
      if (!url) return erreur('Plat manquant.');
      const r = recette(url);
      if (!r) return erreur('Recette introuvable.', 404);
      const ppr = partsParRepas(r);
      let repas = repasEntiers(nombreOuNone(body.repas));
      let parts;
      if (repas && repas > 0) {
        parts = partsDepuisRepas(repas, ppr);
      } else {
        parts = nombreOuNone(body.parts) || r.servings_base || 1;
        repas = repasDepuisParts(parts, ppr);
      }
      const [besoins] = besoinsRecetteAParts(r, parts);
      const rapport = consommerStock(besoins);
      const e = etat();
      e.plats = e.plats.filter((p) => p.url !== url);
      const maintenant = new Date();
      e.journal.push({ id: uid(), date: isoDate(maintenant), url, nom: r.nom || url, parts, repas, cuisine_le: isoSecondes(maintenant) });
      sauver();
      const consommes = {};
      const manquants = {};
      Object.entries(rapport).forEach(([c, d]) => {
        if (d.consomme_g > 0) consommes[c] = d;
        if (d.manquant_g > 0) manquants[c] = d.manquant_g;
      });
      return ok({ ok: true, nom: r.nom, parts, repas, consommes, manquants });
    },

    '/placard/vide': (body) => {
      const c = String(body.canonique || '').trim();
      if (!c) return { status: 400, data: { erreur: "Nom d'ingrédient manquant." } };
      if (etat().placard[c]) etat().placard[c].vide = true;
      sauver();
      return ok(etat().placard);
    },
    '/placard/rachete': (body) => {
      const c = String(body.canonique || '').trim();
      if (!c) return { status: 400, data: { erreur: "Nom d'ingrédient manquant." } };
      if (etat().placard[c]) etat().placard[c].vide = false;
      sauver();
      return ok(etat().placard);
    },
    '/placard/ajouter': (body) => {
      const c = String(body.canonique || '').trim();
      if (!c) return { status: 400, data: { erreur: "Nom d'ingrédient vide." } };
      etat().placard[c] = { vide: false };
      sauver();
      return ok(etat().placard);
    },

    '/stock/ajuster': (body) => {
      const c = String(body.canonique || '').trim();
      if (!c) return { status: 400, data: { erreur: "Nom d'ingrédient manquant." } };
      const quantite = Number(body.quantite_g);
      if (body.quantite_g === null || body.quantite_g === undefined || !Number.isFinite(quantite)) {
        return { status: 400, data: { erreur: 'Quantité invalide.' } };
      }
      const stock = etat().stock;
      if (quantite <= 0) delete stock[c];
      else stock[c] = avecUnite(c, { quantite_g: arrondi(quantite, 1), derniere_maj: isoDate(new Date()) });
      sauver();
      return ok(stock);
    },
    '/stock/vider': (body) => {
      const c = String(body.canonique || '').trim();
      if (!c) return { status: 400, data: { erreur: "Nom d'ingrédient manquant." } };
      delete etat().stock[c];
      sauver();
      return ok(etat().stock);
    },

    '/courses/choix-manuel': (body) => {
      const ingredient = String(body.ingredient || '').trim();
      if (!ingredient) return erreur('Ingrédient manquant.');
      if (body.produit_id) etat().choix[ingredient] = body.produit_id;
      else delete etat().choix[ingredient];
      sauver();
      return ok({ ok: true });
    },

    '/courses/choix-manuel-recherche': (body) => {
      const ingredient = String(body.ingredient || '').trim();
      const produitId = body.produit_id;
      if (!ingredient || !produitId) return erreur('Ingrédient ou produit manquant.');
      const grammes = Number(body.grammes_necessaires);
      if (!Number.isFinite(grammes)) return erreur('Grammage manquant.');
      const p = produitsParId && produitsParId.get(produitId);
      if (!p) return erreur('Produit introuvable dans le catalogue.', 404);
      if (!respecteMotsRequis(ingredient, p)) {
        return erreur('Produit refusé : pour les œufs, seulement plein air, sol, bio ou Label Rouge (jamais de cage).');
      }
      const resultat = choixDepuisProduit(p, grammes, ingredient);
      if (!resultat) return erreur('Prix ou poids introuvable pour ce produit (conditionnement non détecté).');
      const coutReel = resultat.cout_total_sans_carte_u ?? resultat.cout_total;
      resultat.gain_carte_u = arrondi(coutReel - resultat.cout_total, 2);
      resultat.cout_total = coutReel;
      etat().choix[ingredient] = produitId;
      sauver();
      return ok({ ok: true, choix: resultat });
    }
  };

  // Routes paramétrées /listes/<id>[/action]
  function routeListe(method, id, action, body) {
    const liste = trouverListe(id);
    if (!liste) return erreur('Liste introuvable.', 404);
    if (method === 'GET' && !action) {
      if (liste.statut === 'achetee') return ok({ ok: true, liste: metaListe(liste), achats: liste.achats || [] });
      const contenu = genererListeDeCourses(liste.recettes || [], liste.extras || {});
      contenu.ok = !('erreur' in contenu);
      contenu.liste = metaListe(liste);
      return ok(contenu);
    }
    if (method !== 'POST') return erreur('Méthode non prise en charge.', 405);

    // app.py : supprimer_liste_courses.
    if (action === 'supprimer') {
      const e = etat();
      e.listes = e.listes.filter((l) => l.id !== id);
      const avant = e.plats.length;
      e.plats = e.plats.filter((p) => p.liste_id !== id);
      sauver();
      return ok({ ok: true, plats_retires: avant - e.plats.length });
    }

    if (action === 'renommer') {
      const nom = String(body.nom || '').trim().slice(0, 120);
      if (!nom) return erreur('Le nom ne peut pas être vide.');
      liste.nom = nom;
      etat().plats.forEach((p) => {
        if (p.liste_id === id) p.liste_nom = nom;
      });
      sauver();
      return ok({ ok: true, nom });
    }

    if (action === 'extras') {
      const produitId = String(body.produit_id || '').trim();
      if (!produitId) return erreur('Produit manquant.');
      if (liste.statut === 'achetee') return erreur('Cette liste est déjà achetée.', 409);
      liste.extras = liste.extras || {};
      if (body.retirer) {
        delete liste.extras[produitId];
      } else {
        let delta = parseInt(body.delta || 1, 10);
        if (!Number.isFinite(delta)) delta = 1;
        const quantite = (liste.extras[produitId] || 0) + delta;
        if (quantite <= 0) delete liste.extras[produitId];
        else liste.extras[produitId] = quantite;
      }
      sauver();
      return ok({ ok: true, nb_unites: liste.extras[produitId] || 0 });
    }

    if (action === 'acheter') {
      if (liste.statut === 'achetee') return erreur('Cette liste a déjà été achetée : son contenu est déjà au stock.', 409);
      const versesG = {};
      const horsStock = [];
      const enregistres = [];
      (body.achats || []).forEach((achat) => {
        if (!achat || typeof achat !== 'object') return;
        const nbUnites = nombreOuNone(achat.nb_unites) || 0;
        if (nbUnites <= 0) return;
        const c = String(achat.ingredient || '').trim();
        if (achat.ajoute_a_la_main || !dictionnaire.has(c)) {
          horsStock.push(achat.produit || c);
          enregistres.push({ ...achat, nb_unites: nbUnites, grammes_verses: 0 });
          return;
        }
        const poidsUnite = nombreOuNone(achat.poids_unite_g);
        let grammes;
        if (poidsUnite) grammes = nbUnites * poidsUnite;
        else {
          const propose = nombreOuNone(achat.nb_unites_propose) || nbUnites;
          grammes = ((nombreOuNone(achat.grammes_necessaires) || 0) * nbUnites) / propose;
        }
        if (grammes <= 0) return;
        versesG[c] = (versesG[c] || 0) + grammes;
        enregistres.push({ ...achat, nb_unites: nbUnites, grammes_verses: arrondi(grammes, 1) });
      });
      ajouterAchats(versesG);
      liste.statut = 'achetee';
      liste.achetee_le = isoSecondes();
      liste.achats = enregistres;
      sauver();
      return ok({
        ok: true,
        verses_g: Object.fromEntries(Object.entries(versesG).map(([c, g]) => [c, arrondi(g, 1)])),
        hors_stock: horsStock
      });
    }
    return erreur('Route inconnue.', 404);
  }

  // Flask (3.x) trie les clés de tout objet JSON renvoyé : l'interface affiche
  // donc par exemple les rayons dans l'ordre alphabétique. Même tri ici.
  function trierCles(valeur) {
    if (Array.isArray(valeur)) return valeur.map(trierCles);
    if (valeur && typeof valeur === 'object') {
      const trie = {};
      Object.keys(valeur).sort().forEach((cle) => {
        trie[cle] = trierCles(valeur[cle]);
      });
      return trie;
    }
    return valeur;
  }

  // Point d'entrée : (chemin, méthode, corps JSON, paramètres) -> {status, data}
  function handle(chemin, method = 'GET', body = {}, params = new URLSearchParams()) {
    const reponse = router(chemin, method, body, params);
    return { status: reponse.status, data: trierCles(reponse.data) };
  }

  function router(chemin, method, body, params) {
    if (!base) {
      return { status: 503, data: { ok: false, message: 'Données Menu pas encore chargées.', erreur: 'Données Menu pas encore chargées.' } };
    }
    // Routes fixes d'abord : "/listes/creer" ne doit pas être pris pour une liste nommée "creer".
    const table = method === 'GET' ? routesGet : routesPost;
    const route = table[chemin];
    if (route) return method === 'GET' ? route(params) : route(body || {});
    const m = /^\/listes\/([^/]+)(?:\/([a-z]+))?$/.exec(chemin);
    if (m) return routeListe(method, decodeURIComponent(m[1]), m[2] || null, body || {});
    return erreur(`Route inconnue : ${method} ${chemin}`, 404);
  }

  return {
    setData,
    hasData,
    handle,
    importerEtatInitial,
    etat,
    // exposés pour les tests
    _internes: { genererListeDeCourses, choisirProduit, partsRealisables, demandesOriginales, poidsProduitG, normaliserTexte }
  };
})();

// Exposé pour l'iframe de l'onglet Menu (window.parent.MenuEngine) : une
// const globale ne devient pas une propriété de window.
window.MenuEngine = MenuEngine;
