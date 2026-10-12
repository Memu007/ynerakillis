import assert from 'node:assert/strict';
import { once } from 'node:events';
import { readFileSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { createAppServer } from '../server.mjs';

test('HTTP: front, imágenes, healthcheck y archivos privados', async () => {
  const server = createAppServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const url = `http://127.0.0.1:${server.address().port}`;
  try {
    const html = readFileSync(new URL('../public/index.html', import.meta.url));
    for (const path of ['/', '/index.html', '/?visit=1']) {
      const response = await fetch(url + path);
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('content-type'), 'text/html; charset=utf-8');
      assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
      assert.deepEqual(Buffer.from(await response.arrayBuffer()), html);
    }
    const head = await fetch(url, { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(Number(head.headers.get('content-length')), html.length);
    assert.equal((await head.arrayBuffer()).byteLength, 0);

    const health = await fetch(url + '/health');
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), { status: 'ok' });
    const assetNames = readdirSync(new URL('../public/assets/', import.meta.url));
    assert.equal(assetNames.length, 21);
    for (const name of assetNames) {
      const file = readFileSync(new URL('../public/assets/' + name, import.meta.url));
      assert(name.includes(createHash('sha256').update(file).digest('hex').slice(0, 12)));
      const response = await fetch(url + '/assets/' + name);
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('content-type'), 'image/jpeg');
      assert.match(response.headers.get('cache-control'), /immutable/);
      assert.deepEqual(Buffer.from(await response.arrayBuffer()), file);
    }
    for (const path of ['/server.mjs', '/package.json', '/README.md', '/.env', '/assets/missing.jpg', '/assets/../server.mjs', '/missing']) {
      assert.equal((await fetch(url + path)).status, 404, path);
    }
    const post = await fetch(url, { method: 'POST' });
    assert.equal(post.status, 405);
    assert.equal(post.headers.get('allow'), 'GET, HEAD');
    assert.equal((await fetch(url + '/favicon.ico')).status, 204);
    const sources = [...html.toString().matchAll(/<img[^>]+src="([^"]+)"/g)].map(m => m[1]);
    assert.equal(sources.length, 25);
    assert(sources.every(src => assetNames.includes(src.replace('/assets/', ''))));
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});

test('un PORT inválido falla al arrancar', () => {
  const result = spawnSync(process.execPath, ['server.mjs'], {
    cwd: new URL('../', import.meta.url),
    env: { ...process.env, PORT: 'incorrecto' },
    encoding: 'utf8'
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /PORT debe ser un entero/);
});

test('Railway usa el Dockerfile, el servidor y su healthcheck', () => {
  const config = JSON.parse(readFileSync(new URL('../railway.json', import.meta.url)));
  assert.equal(config.build.builder, 'DOCKERFILE');
  assert.equal(config.deploy.startCommand, 'node server.mjs');
  assert.equal(config.deploy.healthcheckPath, '/health');
});
