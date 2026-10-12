import { createServer } from 'node:http';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const html = readFileSync(new URL('./public/index.html', import.meta.url));
const assetsDirectory = new URL('./public/assets/', import.meta.url);
const assets = new Map(readdirSync(assetsDirectory).map(name => [
  `/assets/${name}`, readFileSync(new URL(name, assetsDirectory))
]));

export function createAppServer() {
  return createServer((request, response) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }
    const path = request.url.split('?')[0];
    let body, type, cache = 'no-cache';
    if (path === '/' || path === '/index.html') {
      body = html;
      type = 'text/html; charset=utf-8';
    } else if (path === '/health') {
      body = Buffer.from('{"status":"ok"}');
      type = 'application/json; charset=utf-8';
      cache = 'no-store';
    } else if (path === '/favicon.ico') {
      response.writeHead(204).end();
      return;
    } else if (assets.has(path)) {
      body = assets.get(path);
      type = 'image/jpeg';
      cache = 'public, max-age=31536000, immutable';
    } else {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end(request.method === 'HEAD' ? undefined : 'No encontrado');
      return;
    }
    response.writeHead(200, {
      'Content-Type': type,
      'Content-Length': body.length,
      'Cache-Control': cache
    });
    response.end(request.method === 'HEAD' ? undefined : body);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT debe ser un entero entre 1 y 65535');
  }
  const server = createAppServer();
  server.listen(port, '0.0.0.0', () => console.log(`Killi escuchando en 0.0.0.0:${port}`));
  process.on('SIGTERM', () => server.close());
  process.on('SIGINT', () => server.close());
}
