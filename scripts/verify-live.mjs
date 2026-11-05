import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';

const settings = JSON.parse(await readFile('src/site-settings.json', 'utf8'));
const base = settings.domain;
const request = (path, options = {}) => fetch(new URL(path, base), { redirect: 'manual', signal: AbortSignal.timeout(15000), ...options });

// The first custom-domain deployment can briefly precede DNS propagation.
for (let attempt = 0; ; attempt++) {
  try {
    const result = await request('/build-status.json');
    assert.equal(result.status, 200);
    const status = await result.json();
    assert.equal(status.commit, process.env.GITHUB_SHA);
    assert.equal(status.demo, settings.demoMode === true);
    break;
  } catch (error) {
    if (attempt === 5) throw error;
    await setTimeout(5000);
  }
}
for (const lang of ['fr', 'en']) {
  const response = await request('/' + lang + '/');
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.ok(html.includes('<html lang="' + lang + '"'));
  if (settings.demoMode) {
    assert.match(response.headers.get('x-robots-tag'), /noindex/);
    assert.ok(html.includes('content="noindex,nofollow"'));
  }
}
const root = await request('/');
assert.equal(root.status, 301);
assert.equal(new URL(root.headers.get('location'), base).href, base + '/fr/');
const www = await fetch('https://www.nour-salem.com/en/about/?check=deployment', { redirect: 'manual', signal: AbortSignal.timeout(15000) });
assert.equal(www.status, 301);
assert.equal(www.headers.get('location'), base + '/en/about/?check=deployment');
assert.equal((await request('/missing-deployment-check/')).status, 404);
console.log('Live HTTPS PASS using normal DNS: deployed commit, FR/EN pages, root/www redirects, 404 and demo noindex.');
