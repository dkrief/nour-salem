export const languages = ['fr', 'en'];
export const routeNames = {
  fr: { home: '', about: 'a-propos', portfolio: 'portfolio', acting: 'actrice', contact: 'contact', legal: 'mentions-legales' },
  en: { home: '', about: 'about', portfolio: 'portfolio', acting: 'acting', contact: 'contact', legal: 'legal' },
};
export function route(lang, page = 'home') {
  const slug = routeNames[lang]?.[page];
  if (slug === undefined) throw new Error('Unknown language or page');
  return '/' + lang + '/' + (slug ? slug + '/' : '');
}
export const pageKeys = ['home', 'about', 'portfolio', 'acting', 'contact', 'legal'];
export function allRoutes() {
  return languages.flatMap(lang => pageKeys.map(page => ({ lang, page, slug: routeNames[lang][page], path: route(lang, page) })));
}
export const copy = {
  fr: {
    home: 'Accueil', about: 'À propos', portfolio: 'Mannequinat', acting: 'Actrice', contact: 'Contact', legal: 'Mentions légales',
    menu: 'Menu', close: 'Fermer', skip: 'Aller au contenu', discover: 'Découvrir le portfolio',
    selection: 'Une sélection', selectedWork: 'Portfolio', viewAll: 'Voir le book', more: 'Découvrir Nour',
    connect: 'Entrons en contact.', inquiries: 'Projets, castings & collaborations', email: 'Écrire à Nour',
    photoPending: 'Photographie de Nour à ajouter', copyPending: 'Contenu à compléter avant publication.',
    portfolioPending: 'Les premières images du book seront présentées ici.', bioPending: 'La biographie de Nour sera présentée ici.',
    actingPending: 'La bande démo et les projets cinéma seront présentés ici.', contactPending: 'Les coordonnées professionnelles seront ajoutées ici.',
    preview: 'Version de travail · contenus à compléter · non indexée',
    play: 'Voir la bande démo', videoNotice: 'Lire la vidéo charge le lecteur externe et ses cookies éventuels.',
    reel: 'Bande démo', credits: 'Crédits', representation: 'Représentation', details: 'Informations professionnelles',
    all: 'Tout', editorial: 'Éditorial', fashion: 'Mode', portrait: 'Portrait', film: 'Cinéma',
    enlarge: 'Agrandir la photographie', previous: 'Photo précédente', next: 'Photo suivante',
    visit: 'Voir le projet', back: 'Retour à l’accueil', notFound: 'Cette page est hors champ.',
    notFoundText: 'La page recherchée n’existe pas ou a été déplacée.', scroll: 'Défiler', rights: 'Tous droits réservés.',
  },
  en: {
    home: 'Home', about: 'About', portfolio: 'Modelling', acting: 'Acting', contact: 'Contact', legal: 'Legal',
    menu: 'Menu', close: 'Close', skip: 'Skip to content', discover: 'Explore the portfolio',
    selection: 'A selection', selectedWork: 'Portfolio', viewAll: 'View the book', more: 'Meet Nour',
    connect: 'Let’s create together.', inquiries: 'Projects, casting & collaborations', email: 'Contact Nour',
    photoPending: 'Nour’s photograph to be added', copyPending: 'Content to complete before publication.',
    portfolioPending: 'The first images from the book will be shown here.', bioPending: 'Nour’s biography will be shown here.',
    actingPending: 'The showreel and film projects will be shown here.', contactPending: 'Professional contact details will be added here.',
    preview: 'Work in progress · content to complete · not indexed',
    play: 'Watch the showreel', videoNotice: 'Playing the video loads the external player and may set its cookies.',
    reel: 'Showreel', credits: 'Credits', representation: 'Representation', details: 'Professional details',
    all: 'All', editorial: 'Editorial', fashion: 'Fashion', portrait: 'Portrait', film: 'Film',
    enlarge: 'Enlarge photograph', previous: 'Previous photo', next: 'Next photo',
    visit: 'View project', back: 'Back to home', notFound: 'This page is out of frame.',
    notFoundText: 'The page you are looking for does not exist or has moved.', scroll: 'Scroll', rights: 'All rights reserved.',
  },
};
