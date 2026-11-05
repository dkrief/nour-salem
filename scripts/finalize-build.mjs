import { writeFile, stat, copyFile } from 'node:fs/promises';
import { loadContent } from '../src/lib/content.mjs';
import { allRoutes } from '../src/lib/routes.mjs';
const { settings, isPublic } = await loadContent();
const base = settings.domain;
// Some Astro versions emit 404/index.html; Workers needs an actual root 404.html.
try { await stat('dist/404.html'); } catch { await copyFile('dist/404/index.html', 'dist/404.html'); }
const headers = [
  '/*', '  X-Content-Type-Options: nosniff', '  Referrer-Policy: strict-origin-when-cross-origin',
  '  X-Frame-Options: DENY', '  Permissions-Policy: camera=(), microphone=(), geolocation=()',
  ...(!isPublic ? ['  X-Robots-Tag: noindex, nofollow'] : []),
  '', '/_astro/*', '  Cache-Control: public, max-age=31536000, immutable',
  '', '/404.html', '  X-Robots-Tag: noindex', '',
].join('\n');
await writeFile('dist/_headers', headers);
await writeFile('dist/_redirects', '/ /fr/ 301\n');
await writeFile('dist/robots.txt', 'User-agent: *\nAllow: /\n' + (isPublic ? 'Sitemap: ' + base + '/sitemap.xml\n' : '# Preview: noindex is also sent in HTTP headers and HTML.\n'));
const urls = isPublic ? allRoutes().map(({ path }) => '<url><loc>' + base + path + '</loc></url>').join('') : '';
await writeFile('dist/sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + urls + '</urlset>');
await writeFile('dist/build-status.json', JSON.stringify({ mode: isPublic ? 'production' : 'preview', commit: process.env.CF_PAGES_COMMIT_SHA || process.env.WORKERS_CI_COMMIT_SHA || process.env.GITHUB_SHA || 'local' }));
console.log('Build finalisé : ' + (isPublic ? 'publication' : 'aperçu non indexé') + '.');
