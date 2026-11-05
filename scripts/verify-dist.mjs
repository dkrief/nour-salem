import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { allRoutes, route } from '../src/lib/routes.mjs';
const status = JSON.parse(await readFile('dist/build-status.json', 'utf8'));
let count = 0;
const descriptions = new Set();
for (const { lang, page, path } of allRoutes()) {
  const html = await readFile('dist' + path + 'index.html', 'utf8');
  assert.ok(html.includes('<html lang="' + lang + '"'), 'lang: ' + path);
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, 'one H1: ' + path);
  const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
  assert.ok(description && !descriptions.has(description), 'unique description: ' + path);
  descriptions.add(description);
  assert.ok(html.includes('rel="canonical" href="https://nour-salem.com' + path + '"'), 'canonical: ' + path);
  assert.ok(html.includes('hreflang="fr" href="https://nour-salem.com' + route('fr', page)), 'FR alternate: ' + path);
  assert.ok(html.includes('hreflang="en" href="https://nour-salem.com' + route('en', page)), 'EN alternate: ' + path);
  assert.ok(!html.includes('src="/src/assets/'), 'no raw source images');
  assert.ok(!html.includes('<iframe'), 'no remote video until click');
  if (status.mode === 'preview') assert.ok(html.includes('content="noindex,nofollow"'), 'preview blocked');
  else assert.ok(html.includes('content="index,follow,max-image-preview:large"'), 'production indexable');
  if (status.demo) {
    assert.equal(status.mode, 'preview', 'demo must never be indexable');
    assert.ok(html.includes(lang === 'fr' ? 'textes fictifs et photo illustrative' : 'fictional copy and illustrative photo'), 'visible demo label');
    assert.ok(!html.includes('application/ld+json'), 'no fictional Person structured data');
  }
  for (const match of html.matchAll(/(?:src|href)="(\/[^"#?]*)/g)) {
    const local = match[1];
    const file = local.endsWith('/') ? local + 'index.html' : local;
    await access('dist' + file);
  }
  count++;
}
const notFound = await readFile('dist/404.html', 'utf8');
assert.ok(notFound.includes('noindex'));
const headers = await readFile('dist/_headers', 'utf8');
assert.equal(headers.includes('X-Robots-Tag: noindex, nofollow'), status.mode === 'preview');
assert.equal(await readFile('dist/_redirects', 'utf8'), '/ /fr/ 301\n');
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
assert.equal((sitemap.match(/<loc>/g) || []).length, status.mode === 'preview' ? 0 : 12);
console.log(count + ' pages vérifiées : liens internes, H1, canonicals, langues, robots, sitemap, médias et 404.');
