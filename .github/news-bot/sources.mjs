/* Sources de l'onglet Actualité (flux RSS publics).
   Le Monde et Les Affiches parisiennes ne sont pas repris : leurs flux
   sont réservés à un usage personnel, or les données du robot sont
   publiques.
   titleOnly : seuls le titre et le lien sont publiés (pas le chapô du
   flux). C'est le cas de toute la presse d'opinion ajoutée le 07/10/2026 ;
   le robot lit quand même l'article quand robots.txt le permet, sans
   jamais le garder.
   Équilibre gauche / droite (étiquettes dans news.js, NEWS_SOURCE_LEAN) :
   autant de sites de chaque bord, en miroir —
     gauche          Libération, Mediapart      | droite          Le Figaro, Europe 1
     gauche marquée  L'Humanité, Politis        | droite marquée  Valeurs actuelles, CNews
     centre gauche   L'Obs, Courrier intern.    | centre droit    Le Point, Contrepoints
   et autant de sites de chaque bord dans chaque thème. Garder ce
   miroir en ajoutant ou retirant une source. */

export const THEMES = {
  monde: 'International',
  france: 'France',
  juridique: 'Justice & droit'
};

export const SOURCES = [
  // International (RFI et France 24 reprennent beaucoup de dépêches AFP)
  { id: 'rfi-monde', name: 'RFI', theme: 'monde', home: 'https://www.rfi.fr/fr/monde/', url: 'https://www.rfi.fr/fr/monde/rss' },
  { id: 'f24-europe', name: 'France 24', theme: 'monde', home: 'https://www.france24.com/fr/europe/', url: 'https://www.france24.com/fr/europe/rss' },
  { id: 'f24-moyen-orient', name: 'France 24', theme: 'monde', home: 'https://www.france24.com/fr/moyen-orient/', url: 'https://www.france24.com/fr/moyen-orient/rss' },
  { id: 'f24-afrique', name: 'France 24', theme: 'monde', home: 'https://www.france24.com/fr/afrique/', url: 'https://www.france24.com/fr/afrique/rss' },
  { id: 'f24-ameriques', name: 'France 24', theme: 'monde', home: 'https://www.france24.com/fr/am%C3%A9riques/', url: 'https://www.france24.com/fr/am%C3%A9riques/rss' },
  { id: 'f24-asie', name: 'France 24', theme: 'monde', home: 'https://www.france24.com/fr/asie-pacifique/', url: 'https://www.france24.com/fr/asie-pacifique/rss' },
  { id: 'fi-monde', name: 'franceinfo', theme: 'monde', home: 'https://www.francetvinfo.fr/monde/', url: 'https://www.francetvinfo.fr/monde.rss' },
  { id: 'courrier-international', name: 'Courrier international', theme: 'monde', home: 'https://www.courrierinternational.com/', url: 'https://www.courrierinternational.com/feed/all/rss.xml' },
  { id: 'figaro-international', name: 'Le Figaro', theme: 'monde', home: 'https://www.lefigaro.fr/international', url: 'https://www.lefigaro.fr/rss/figaro_international.xml', titleOnly: true },
  { id: 'lepoint-monde', name: 'Le Point', theme: 'monde', home: 'https://www.lepoint.fr/monde/', url: 'https://www.lepoint.fr/arc/outboundfeeds/rss/category/monde/?outputType=xml', titleOnly: true },
  { id: 'cnews-monde', name: 'CNews', theme: 'monde', home: 'https://www.cnews.fr/monde', url: 'https://www.cnews.fr/rss/categorie/monde', titleOnly: true },
  { id: 'liberation-monde', name: 'Libération', theme: 'monde', home: 'https://www.liberation.fr/international/', url: 'https://www.liberation.fr/arc/outboundfeeds/rss-all/category/international/?outputType=xml', titleOnly: true },
  { id: 'humanite-monde', name: "L'Humanité", theme: 'monde', home: 'https://www.humanite.fr/monde', url: 'https://www.humanite.fr/sections/monde/feed', titleOnly: true },

  // France : politique et économie
  { id: 'fi-politique', name: 'franceinfo', theme: 'france', home: 'https://www.francetvinfo.fr/politique/', url: 'https://www.francetvinfo.fr/politique.rss' },
  { id: 'fi-economie', name: 'franceinfo', theme: 'france', home: 'https://www.francetvinfo.fr/economie/', url: 'https://www.francetvinfo.fr/economie.rss' },
  { id: 'f24-france', name: 'France 24', theme: 'france', home: 'https://www.france24.com/fr/france/', url: 'https://www.france24.com/fr/france/rss' },
  { id: 'rfi-france', name: 'RFI', theme: 'france', home: 'https://www.rfi.fr/fr/france/', url: 'https://www.rfi.fr/fr/france/rss' },
  { id: 'public-senat', name: 'Public Sénat', theme: 'france', home: 'https://www.publicsenat.fr/', url: 'https://www.publicsenat.fr/feed' },
  { id: 'lcp', name: 'LCP', theme: 'france', home: 'https://www.lcp.fr/', url: 'https://www.lcp.fr/rss.xml' },
  { id: 'figaro-france', name: 'Le Figaro', theme: 'france', home: 'https://www.lefigaro.fr/actualite-france', url: 'https://www.lefigaro.fr/rss/figaro_actualite-france.xml', titleOnly: true },
  { id: 'figaro-politique', name: 'Le Figaro', theme: 'france', home: 'https://www.lefigaro.fr/politique', url: 'https://www.lefigaro.fr/rss/figaro_politique.xml', titleOnly: true },
  { id: 'lepoint-politique', name: 'Le Point', theme: 'france', home: 'https://www.lepoint.fr/politique/', url: 'https://www.lepoint.fr/arc/outboundfeeds/rss/category/politique/?outputType=xml', titleOnly: true },
  { id: 'europe1-politique', name: 'Europe 1', theme: 'france', home: 'https://www.europe1.fr/politique', url: 'https://www.europe1.fr/rss/politique', titleOnly: true },
  // Flux généraux (politique, société, monde) : rangés en France, où ils publient le plus.
  { id: 'valeurs-actuelles', name: 'Valeurs actuelles', theme: 'france', home: 'https://www.valeursactuelles.com/', url: 'https://www.valeursactuelles.com/feed', titleOnly: true },
  { id: 'contrepoints', name: 'Contrepoints', theme: 'france', home: 'https://www.contrepoints.org/', url: 'https://www.contrepoints.org/feed', titleOnly: true },
  { id: 'liberation-politique', name: 'Libération', theme: 'france', home: 'https://www.liberation.fr/politique/', url: 'https://www.liberation.fr/arc/outboundfeeds/rss-all/category/politique/?outputType=xml', titleOnly: true },
  { id: 'mediapart', name: 'Mediapart', theme: 'france', home: 'https://www.mediapart.fr/', url: 'https://www.mediapart.fr/articles/feed', titleOnly: true },
  { id: 'humanite-politique', name: "L'Humanité", theme: 'france', home: 'https://www.humanite.fr/politique', url: 'https://www.humanite.fr/sections/politique/feed', titleOnly: true },
  { id: 'politis', name: 'Politis', theme: 'france', home: 'https://www.politis.fr/', url: 'https://www.politis.fr/flux-rss-apps/', titleOnly: true },
  { id: 'obs-politique', name: "L'Obs", theme: 'france', home: 'https://www.nouvelobs.com/politique/', url: 'https://www.nouvelobs.com/politique/rss.xml', titleOnly: true },

  // Justice et droit
  { id: 'conseil-constitutionnel', name: 'Conseil constitutionnel', theme: 'juridique', home: 'https://www.conseil-constitutionnel.fr/', url: 'https://www.conseil-constitutionnel.fr/flux/rss.xml' },
  { id: 'conseil-etat', name: "Conseil d'État", theme: 'juridique', home: 'https://www.conseil-etat.fr/', url: 'https://www.conseil-etat.fr/rss/actualites-rss' },
  { id: 'club-juristes', name: 'Le Club des juristes', theme: 'juridique', home: 'https://www.leclubdesjuristes.com/', url: 'https://www.leclubdesjuristes.com/feed/' },
  { id: 'surligneurs', name: 'Les Surligneurs', theme: 'juridique', home: 'https://www.lessurligneurs.eu/', url: 'https://www.lessurligneurs.eu/feed/' },
  { id: 'actu-juridique', name: 'Actu-Juridique', theme: 'juridique', home: 'https://www.actu-juridique.fr/', url: 'https://www.actu-juridique.fr/feed/' },
  { id: 'fi-justice', name: 'franceinfo', theme: 'juridique', home: 'https://www.francetvinfo.fr/societe/justice/', url: 'https://www.francetvinfo.fr/societe/justice.rss' },
  { id: 'lepoint-justice', name: 'Le Point', theme: 'juridique', home: 'https://www.lepoint.fr/tags/justice/', url: 'https://www.lepoint.fr/arc/outboundfeeds/rss/tag/justice/?outputType=xml', titleOnly: true },
  { id: 'liberation-justice', name: 'Libération', theme: 'juridique', home: 'https://www.liberation.fr/societe/police-justice/', url: 'https://www.liberation.fr/arc/outboundfeeds/rss-all/category/societe/police-justice/?outputType=xml' },
  { id: 'rfi-justice', name: 'RFI', theme: 'juridique', home: 'https://www.rfi.fr/fr/tag/justice/', url: 'https://www.rfi.fr/fr/tag/justice/rss' },
  { id: 'dalloz-etudiant', name: 'Dalloz Actu Étudiant', theme: 'juridique', home: 'https://actu.dalloz-etudiant.fr/', url: 'https://actu.dalloz-etudiant.fr/rss.xml' },
  { id: 'conseil-etat-jurisprudence', name: "Conseil d'État", theme: 'juridique', home: 'https://www.conseil-etat.fr/decisions-de-justice/jurisprudence', url: 'https://www.conseil-etat.fr/rss/analyses-de-jurisprudence-rss' },
  { id: 'cnil', name: 'CNIL', theme: 'juridique', home: 'https://www.cnil.fr/', url: 'https://www.cnil.fr/fr/rss.xml' },
  { id: 'jus-politicum', name: 'Jus Politicum', theme: 'juridique', home: 'https://blog.juspoliticum.com/', url: 'https://blog.juspoliticum.com/feed/' },
  { id: 'revue-dlf', name: 'Revue des droits et libertés fondamentaux', theme: 'juridique', home: 'https://revuedlf.com/', url: 'https://revuedlf.com/feed/' }
];
