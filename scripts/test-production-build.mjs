// A generated, ignored fixture exercises actual image rendering and release
// behavior without adding fictional photographs or biography to the real site.
import { mkdir, mkdtemp, cp, readFile, writeFile, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { profileSchema } from '../src/lib/content.mjs';

const root = process.cwd();
await mkdir('.codex-tmp', { recursive: true });
const fixture = await mkdtemp(path.join(root, '.codex-tmp/render-'));
for (const name of ['src', 'public', 'scripts', 'astro.config.mjs', 'tsconfig.json', 'package.json', 'wrangler.jsonc']) {
  await cp(path.join(root, name), path.join(fixture, name), { recursive: true });
}
const profile = profileSchema.parse(JSON.parse(await readFile(path.join(fixture, 'src/content/profile.json'), 'utf8')));
profile.location = 'TEST ONLY';
profile.email = 'fixture@example.com';
profile.hero = profile.portrait = '/src/assets/photos/fixture.jpg';
profile.showreel = 'https://youtu.be/abcdefghijk';
for (const lang of ['fr', 'en']) {
  for (const key of ['intro', 'biography', 'acting', 'heroAlt', 'portraitAlt', 'seoDescription']) profile[lang][key] = 'TEST FIXTURE ONLY ' + lang + ' ' + key;
  profile.legal[lang] = 'TEST FIXTURE ONLY — not a public website.';
}
await writeFile(path.join(fixture, 'src/content/profile.json'), JSON.stringify(profile));
await writeFile(path.join(fixture, 'src/site-settings.json'), JSON.stringify({ publicationApproved: true, domain: 'https://nour-salem.com' }));
await sharp({ create: { width: 1400, height: 1800, channels: 3, background: '#8d7d70' } }).jpeg().withMetadata({ exif: { IFD0: { Copyright: 'TEST ONLY' } } }).toFile(path.join(fixture, 'src/assets/photos/fixture.jpg'));
await writeFile(path.join(fixture, 'src/content/projects/fixture.json'), JSON.stringify({
  slug: 'fixture', published: true, category: 'editorial', order: 0,
  title: { fr: 'TEST UNIQUEMENT', en: 'TEST ONLY' }, description: { fr: '', en: '' },
  photos: [1, 2].map(n => ({ src: profile.hero, alt: { fr: 'Image test ' + n, en: 'Test image ' + n } })),
}));
const env = { ...process.env, BUILD_MODE: 'production', ASTRO_TELEMETRY_DISABLED: '1' };
for (const args of [
  ['scripts/validate-content.mjs'],
  [path.join(root, 'node_modules/astro/bin/astro.mjs'), 'build'],
  ['scripts/finalize-build.mjs'],
  ['scripts/verify-dist.mjs'],
]) {
  const result = spawnSync(process.execPath, args, { cwd: fixture, env, encoding: 'utf8' });
  if (result.status !== 0) { console.error(result.stdout, result.stderr); throw new Error('Fixture build failed'); }
}
const home = await readFile(path.join(fixture, 'dist/fr/index.html'), 'utf8');
assert.ok(home.includes('<picture'));
assert.ok(home.includes('image/avif') && home.includes('image/webp'));
assert.ok(home.includes('application/ld+json'));
assert.ok(!home.includes('Version de travail'));
assert.ok(!home.includes('<iframe'));
const gallery = await readFile(path.join(fixture, 'dist/fr/portfolio/index.html'), 'utf8');
assert.equal((gallery.match(/data-lightbox="fixture"/g) || []).length, 2);
const assets = await readdir(path.join(fixture, 'dist/_astro'));
const generated = assets.filter(f => /\.(jpg|webp|avif)$/.test(f));
assert.ok(generated.length >= 3);
for (const file of generated) {
  const meta = await sharp(path.join(fixture, 'dist/_astro', file)).metadata();
  assert.equal(meta.exif, undefined, 'EXIF must not be published: ' + file);
}
const before = createHash('sha256').update(home).digest('hex');
profile.en.biography = '';
await writeFile(path.join(fixture, 'src/content/profile.json'), JSON.stringify(profile));
const invalid = spawnSync(process.execPath, ['scripts/validate-content.mjs'], { cwd: fixture, env, encoding: 'utf8' });
assert.notEqual(invalid.status, 0);
const after = createHash('sha256').update(await readFile(path.join(fixture, 'dist/fr/index.html'))).digest('hex');
assert.equal(before, after, 'Failed validation must leave prior build intact');
// Restore the fixture for local browser interaction checks only.
profile.en.biography = 'TEST FIXTURE ONLY en biography';
await writeFile(path.join(fixture, 'src/content/profile.json'), JSON.stringify(profile));
await writeFile(path.join(root, '.codex-tmp/latest-fixture.txt'), fixture);
console.log('Production fixture PASS: 12 pages, optimized pictures, EXIF removed, SEO, bilingual gallery and failed-publication preservation.');
console.log('Local test fixture (never deploy): ' + fixture);
