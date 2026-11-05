import { readFile, readdir, stat, realpath } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import sharp from 'sharp';

// Astro bundles this module under dist/.prerender; import.meta.url no longer
// points into the source tree at build time. npm always sets cwd to this project.
export const projectRoot = process.cwd();
const text = z.string().trim().default('');
const link = z.string().trim().refine(value => {
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
}, 'Utiliser une URL HTTPS complète.');
const optionalLink = z.union([z.literal(''), link]).default('');
const localImage = z.string().refine(value => value === '' || /^\/src\/assets\/photos\/[a-zA-Z0-9_-]+\.(jpe?g|webp)$/i.test(value),
  'Choisir un JPEG/WebP dans le dossier Photos Web.').default('');
const translated = z.object({ fr: text, en: text });
const language = z.object({
  title: text, intro: text, biography: text, acting: text, heroAlt: text, portraitAlt: text, seoDescription: text,
});
export const profileSchema = z.object({
  name: z.string().trim().min(1),
  location: text, email: z.union([z.literal(''), z.email()]).default(''),
  hero: localImage, portrait: localImage, heroPosition: z.enum(['center', 'top', 'bottom']).default('center'),
  showreel: optionalLink,
  socials: z.array(z.object({ label: z.string().trim().min(1), url: link })).default([]),
  agencies: z.array(z.object({ name: z.string().trim().min(1), url: optionalLink, territory: text })).default([]),
  details: z.array(z.object({ label: translated, value: z.string().trim().min(1) })).default([]),
  fr: language, en: language,
  legal: translated.default({ fr: '', en: '' }),
});
export const projectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  published: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
  category: z.enum(['editorial', 'fashion', 'portrait', 'film']).default('editorial'),
  year: z.string().default(''),
  title: translated.default({ fr: '', en: '' }), description: translated.default({ fr: '', en: '' }),
  credits: text, url: optionalLink,
  photos: z.array(z.object({ src: localImage, alt: translated, caption: translated.default({ fr: '', en: '' }), published: z.boolean().default(true) })).max(24).default([]),
});
export function videoEmbed(value) {
  if (!value) return null;
  const url = new URL(value);
  const host = url.hostname.toLowerCase();
  let id;
  if (host === 'youtu.be') id = url.pathname.slice(1);
  if (['youtube.com', 'www.youtube.com'].includes(host)) {
    id = url.pathname === '/watch' ? url.searchParams.get('v') : url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)$/)?.[1];
  }
  if (id && /^[A-Za-z0-9_-]{11}$/.test(id)) return 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
  if (['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'].includes(host)) {
    const match = url.pathname.match(/^\/(?:video\/)?(\d+)(?:\/([A-Za-z0-9]+))?\/?$/);
    if (match) {
      const hash = match[2] || url.searchParams.get('h');
      return 'https://player.vimeo.com/video/' + match[1] + '?autoplay=1&dnt=1' + (hash ? '&h=' + encodeURIComponent(hash) : '');
    }
  }
  throw new Error('Bande démo : fournir un lien YouTube ou Vimeo valide.');
}
export async function validateImage(src, root = projectRoot) {
  if (!src) return;
  localImage.parse(src);
  const photoRoot = await realpath(path.join(root, 'src/assets/photos'));
  const fullPath = await realpath(path.join(root, src.slice(1)));
  if (!fullPath.startsWith(photoRoot + path.sep)) throw new Error('Photo hors du dossier autorisé.');
  const info = await stat(fullPath);
  if (info.size >= 2_000_000) throw new Error(src + ' : exporter à moins de 2 Mo.');
  const metadata = await sharp(fullPath).metadata();
  if (!['jpeg', 'webp'].includes(metadata.format)) throw new Error('Format photo non pris en charge : ' + src);
  if ((metadata.width ?? 0) * (metadata.height ?? 0) > 36_000_000) throw new Error('Photo trop grande : ' + src);
}
export function readiness(profile, projects, settings) {
  const missing = [];
  if (settings.demoMode) missing.push('Remplacer les contenus fictifs et désactiver le mode démonstration');
  if (!settings.publicationApproved) missing.push('Approbation initiale de publication');
  if (!profile.hero) missing.push('Photo principale');
  if (!profile.portrait) missing.push('Portrait de biographie');
  if (!profile.email) missing.push('Adresse de contact publique');
  if (!profile.location) missing.push('Localisation professionnelle');
  for (const lang of ['fr', 'en']) {
    for (const field of ['intro', 'biography', 'acting', 'heroAlt', 'portraitAlt', 'seoDescription']) {
      if (!profile[lang][field]) missing.push(lang + ' : ' + field);
    }
    if (!profile.legal[lang]) missing.push(lang + ' : mentions légales');
  }
  if (!projects.some(p => p.category !== 'film' && p.photos.length)) missing.push('Au moins un projet photo réel et visible');
  return missing;
}
export async function loadContent(root = projectRoot, release = process.env.BUILD_MODE === 'production') {
  const readJson = async file => JSON.parse(await readFile(path.join(root, file), 'utf8'));
  const profile = profileSchema.parse(await readJson('src/content/profile.json'));
  const settings = await readJson('src/site-settings.json');
  settings.demoMode ??= false;
  if (typeof settings.publicationApproved !== 'boolean' || settings.domain !== 'https://nour-salem.com') throw new Error('Configuration de publication invalide.');
  if (typeof settings.demoMode !== 'boolean' || (settings.demoMode && settings.publicationApproved)) throw new Error('Une démonstration ne peut pas être approuvée pour indexation.');
  const files = (await readdir(path.join(root, 'src/content/projects'))).filter(f => f.endsWith('.json'));
  const projects = [];
  for (const file of files) {
    const project = projectSchema.parse(await readJson('src/content/projects/' + file));
    if (!project.published) continue;
    for (const lang of ['fr', 'en']) if (!project.title[lang]) throw new Error(file + ' : titre ' + lang + ' requis pour un projet visible.');
    project.photos = project.photos.filter(photo => photo.published);
    if (!project.photos.length) throw new Error(file + ' : ajouter une photo visible avant de rendre le projet visible.');
    for (const photo of project.photos) {
      if (!photo.src || !photo.alt.fr || !photo.alt.en) throw new Error(file + ' : image et descriptions FR/EN requises.');
      await validateImage(photo.src, root);
    }
    projects.push({ ...project, id: path.basename(file, '.json') });
  }
  await validateImage(profile.hero, root);
  await validateImage(profile.portrait, root);
  videoEmbed(profile.showreel);
  const sorted = projects.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
  const missing = readiness(profile, sorted, settings);
  if (release && missing.length) throw new Error('Publication refusée :\n- ' + missing.join('\n- '));
  return { profile, projects: sorted, settings, missing, isPublic: release && missing.length === 0 };
}
