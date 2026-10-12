import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import test from 'node:test';
const root = new URL('../', import.meta.url);
const catalog = JSON.parse(readFileSync(new URL('data/species.json', root), 'utf8'));
const html = readFileSync(new URL('public/index.html', root), 'utf8');
test('cada ficha publicada conserva fuentes, identificación y estado fotográfico', () => {
  assert.equal(catalog.length, 25);
  assert.equal(new Set(catalog.map(item => item.id)).size, catalog.length);
  assert.equal(catalog.filter(item => item.countries.includes('Argentina')).length, 13);
  const published = [...html.matchAll(/data-species-id="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(published.sort(), catalog.map(item => item.id).sort());
  for (const item of catalog) {
    assert(item.name && item.detail && item.short && item.cycle, item.id);
    assert(['africa', 'latinoamerica', 'asia'].includes(item.region), item.id);
    assert(item.countries.length && Array.isArray(item.aliases), item.id);
    assert(item.sources.length, item.id);
    for (const source of item.sources) {
      assert.equal(new URL(source.url).protocol, 'https:');
      assert(source.claims.length && source.verification, item.id + ': fuente');
    }
    if (item.photo) {
      assert(existsSync(new URL('public' + item.photo.asset, root)), item.id);
      assert(item.photo.author && item.photo.page_url && item.photo.changes, item.id);
      if (item.photo.license_status === 'permission_not_verified') assert(item.photo.rights_note);
      else assert(item.photo.license && item.photo.license_url, item.id + ': licencia');
    }
  }
  assert.equal(catalog.find(item => item.id === 'playfairii').photo, null);
  assert.equal(catalog.find(item => item.id === 'balzanii').photo, null);
  assert.deepEqual(catalog.find(item => item.id === 'rachovii').countries, ['Mozambique']);
});
