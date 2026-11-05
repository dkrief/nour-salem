import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import YAML from 'yaml';
import { loadContent, profileSchema, videoEmbed, validateImage, readiness } from '../src/lib/content.mjs';
import { allRoutes, route } from '../src/lib/routes.mjs';

// Pages CMS omits empty optional fields. Keep test data independent of the
// editable profile, including when the real portfolio is ready for release.
const originalProfile = { name: 'TEST ONLY', fr: { title: 'TEST FR' }, en: { title: 'TEST EN' } };
const cms = YAML.parse(await readFile('.pages.yml', 'utf8'));
async function fixture() {
  await mkdir('.codex-tmp', { recursive: true });
  const root = await mkdtemp(path.resolve('.codex-tmp/test-'));
  await mkdir(path.join(root, 'src/assets/photos'), { recursive: true });
  await mkdir(path.join(root, 'src/content/projects'), { recursive: true });
  await writeFile(path.join(root, 'src/content/profile.json'), JSON.stringify(originalProfile));
  await writeFile(path.join(root, 'src/site-settings.json'), JSON.stringify({ publicationApproved: false, domain: 'https://nour-salem.com' }));
  return root;
}
const project = () => ({ slug: 'test', published: true, order: 0, category: 'editorial', title: { fr: 'Test FR', en: 'Test EN' }, description: { fr: '', en: '' }, photos: [{ src: '/src/assets/photos/test.jpg', alt: { fr: 'Image de test', en: 'Test image' } }] });
test('all French/English routes are unique with trailing slashes', () => {
  const paths = allRoutes().map(r => r.path);
  assert.equal(paths.length, 12);
  assert.equal(new Set(paths).size, 12);
  assert.ok(paths.every(p => p.endsWith('/')));
  assert.equal(route('fr', 'about'), '/fr/a-propos/');
  assert.equal(route('en', 'about'), '/en/about/');
  assert.throws(() => route('ar', 'home'));
});
test('CMS profile with omitted empty fields remains preview and cannot be released', async () => {
  const root = await fixture();
  const draft = await loadContent(root);
  assert.equal(draft.isPublic, false);
  assert.ok(draft.missing.includes('Photo principale'));
  await assert.rejects(loadContent(root, true), /Publication refusée/);
});
test('JSON/schema error fails validation before deployment', async () => {
  const root = await fixture();
  await writeFile(path.join(root, 'src/content/profile.json'), '{"name":');
  await assert.rejects(loadContent(root), SyntaxError);
});
test('editor save, hide, reorder and bilingual changes are reflected', async () => {
  const root = await fixture();
  await sharp({ create: { width: 20, height: 30, channels: 3, background: '#aaa' } }).jpeg().toFile(path.join(root, 'src/assets/photos/test.jpg'));
  const first = project();
  const second = { ...project(), slug: 'second', order: 10 };
  await writeFile(path.join(root, 'src/content/projects/first.json'), JSON.stringify(first));
  await writeFile(path.join(root, 'src/content/projects/second.json'), JSON.stringify(second));
  assert.deepEqual((await loadContent(root)).projects.map(p => p.id), ['first', 'second']);
  second.order = 0; first.order = 10;
  await writeFile(path.join(root, 'src/content/projects/first.json'), JSON.stringify(first));
  await writeFile(path.join(root, 'src/content/projects/second.json'), JSON.stringify(second));
  assert.deepEqual((await loadContent(root)).projects.map(p => p.id), ['second', 'first']);
  second.published = false;
  await writeFile(path.join(root, 'src/content/projects/second.json'), JSON.stringify(second));
  const profile = { ...originalProfile, fr: { ...originalProfile.fr, biography: 'Biographie de test FR.' }, en: { ...originalProfile.en, biography: 'Test biography EN.' } };
  await writeFile(path.join(root, 'src/content/profile.json'), JSON.stringify(profile));
  const changed = await loadContent(root);
  assert.deepEqual(changed.projects.map(p => p.id), ['first']);
  assert.equal(changed.profile.en.biography, 'Test biography EN.');
});
test('missing image and missing translation reject a visible project', async () => {
  const root = await fixture();
  const value = project();
  await writeFile(path.join(root, 'src/content/projects/test.json'), JSON.stringify(value));
  await assert.rejects(loadContent(root), /ENOENT/);
  value.photos[0].alt.en = '';
  await writeFile(path.join(root, 'src/content/projects/test.json'), JSON.stringify(value));
  await assert.rejects(loadContent(root), /descriptions FR\/EN/);
});

test('individual photos can be reordered, captioned and hidden without deletion', async () => {
  const root = await fixture();
  await sharp({ create: { width: 20, height: 30, channels: 3, background: '#aaa' } }).jpeg().toFile(path.join(root, 'src/assets/photos/test.jpg'));
  const value = project();
  const first = { ...value.photos[0], caption: { fr: 'Légende A', en: 'Caption A' } };
  const second = { ...value.photos[0], caption: { fr: 'Légende B', en: 'Caption B' } };
  value.photos = [second, first, { src: '', alt: { fr: '', en: '' }, published: false }];
  await writeFile(path.join(root, 'src/content/projects/photos.json'), JSON.stringify(value));
  assert.deepEqual((await loadContent(root)).projects[0].photos.map(p => p.caption.en), ['Caption B', 'Caption A']);
  value.photos[0].published = false;
  await writeFile(path.join(root, 'src/content/projects/photos.json'), JSON.stringify(value));
  assert.deepEqual((await loadContent(root)).projects[0].photos.map(p => p.caption.en), ['Caption A']);
  value.photos[1].published = false;
  await writeFile(path.join(root, 'src/content/projects/photos.json'), JSON.stringify(value));
  await assert.rejects(loadContent(root), /photo visible/);
});
test('draft project can be saved incomplete and never leaks to public data', async () => {
  const root = await fixture();
  const value = { slug: 'draft', published: false };
  await writeFile(path.join(root, 'src/content/projects/draft.json'), JSON.stringify(value));
  assert.equal((await loadContent(root)).projects.length, 0);
});
test('image path cannot escape private media directory', () => {
  assert.throws(() => profileSchema.parse({ ...originalProfile, hero: '/src/assets/photos/../../secret.jpg' }));
  assert.throws(() => profileSchema.parse({ ...originalProfile, hero: 'https://example.com/person.jpg' }));
});
test('image larger than 2 MB is rejected before decoding', async () => {
  const root = await fixture();
  await writeFile(path.join(root, 'src/assets/photos/large.jpg'), Buffer.alloc(2_000_000));
  await assert.rejects(validateImage('/src/assets/photos/large.jpg', root), /moins de 2 Mo/);
});
test('unsupported image format cannot masquerade as JPEG', async () => {
  const root = await fixture();
  await writeFile(path.join(root, 'src/assets/photos/invalid.jpg'), '<script>unsafe</script>');
  await assert.rejects(validateImage('/src/assets/photos/invalid.jpg', root));
});
test('video parser only allows validated YouTube/Vimeo identifiers', () => {
  assert.equal(videoEmbed(''), null);
  assert.equal(videoEmbed('https://youtu.be/abcdefghijk'), 'https://www.youtube-nocookie.com/embed/abcdefghijk?autoplay=1&rel=0');
  assert.ok(videoEmbed('https://www.youtube.com/watch?v=abcdefghijk').startsWith('https://www.youtube-nocookie.com/'));
  assert.equal(videoEmbed('https://vimeo.com/123456789/hash42'), 'https://player.vimeo.com/video/123456789?autoplay=1&dnt=1&h=hash42');
  assert.throws(() => videoEmbed('https://youtube.com.attacker.test/watch?v=abcdefghijk'));
  assert.throws(() => videoEmbed('javascript:alert(1)'));
});
test('HTTPS links only; invalid contact and unsafe media URLs rejected', () => {
  assert.throws(() => profileSchema.parse({ ...originalProfile, email: 'not an email' }));
  assert.throws(() => profileSchema.parse({ ...originalProfile, socials: [{ label: 'Bad', url: 'javascript:alert(1)' }] }));
});
test('approval alone cannot bypass missing content', () => {
  const missing = readiness(profileSchema.parse(originalProfile), [], { publicationApproved: true });
  assert.ok(missing.includes('Photo principale'));
  assert.ok(missing.length > 5);
});
test('Pages CMS covers profile schema and locks technical settings', () => {
  const profile = cms.content.find(c => c.name === 'profile');
  assert.deepEqual(profile.fields.map(f => f.name).sort(), Object.keys(profileSchema.shape).sort());
  assert.equal(profile.operations.delete, false);
  assert.equal(cms.settings.hide, true);
  assert.equal(cms.settings.commit.identity, 'app');
  assert.ok(!cms.content.some(c => c.path === 'src/site-settings.json'));
  assert.equal(cms.media[0].input, 'src/assets/photos');
  assert.ok(cms.content.find(c => c.name === 'projects').fields.find(f => f.name === 'photos').fields.some(f => f.name === 'alt'));
});
