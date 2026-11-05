import assert from 'node:assert/strict';
const base = process.argv[2] || 'http://127.0.0.1:4381';
for (const pathname of ['/fr/', '/en/', '/fr/a-propos/', '/en/acting/', '/robots.txt', '/sitemap.xml']) {
  const response = await fetch(base + pathname, { redirect: 'manual' });
  assert.equal(response.status, 200, pathname);
  assert.ok(response.headers.get('x-robots-tag')?.includes('noindex'), 'preview header: ' + pathname);
}
const root = await fetch(base + '/?campaign=test', { redirect: 'manual' });
assert.equal(root.status, 301);
assert.equal(new URL(root.headers.get('location'), base).pathname, '/fr/');
assert.equal(new URL(root.headers.get('location'), base).search, '?campaign=test');
const missing = await fetch(base + '/page-that-does-not-exist/', { redirect: 'manual' });
assert.equal(missing.status, 404);
assert.ok((await missing.text()).includes('hors champ'));
console.log('HTTP PASS: six 200s, noindex headers, root 301 preserving query and actual 404.');
