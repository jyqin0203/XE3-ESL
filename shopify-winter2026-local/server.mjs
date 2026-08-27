import { createReadStream } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 18086);
const mimeMap = JSON.parse(await readFile(path.join(rootDir, 'mime-map.json'), 'utf8'));
const originalAgenticPropsPath =
  '/assets/remote/editions-winter-2026.myshopify.com/cdn/shop/3d/models/o/510af84586abddc1/EW26_Agentic_Props_251209v5_compressed-optimized.glb';
const speakUpAgenticPropsPath = '/assets/speakup/agentic/speakup-agentic-cards.glb';
const originalAgenticBookPath =
  '/assets/remote/editions-winter-2026.myshopify.com/cdn/shop/3d/models/o/9567eaad495dfa3f/Rigged_Book_CS_Animated_V5_compressed-optimized.glb';
const speakUpAgenticBookPath = '/assets/speakup/agentic/speakup-agentic-book.glb';
const originalOnlineIntroPath =
  '/assets/remote/editions-winter-2026.myshopify.com/cdn/shop/3d/models/o/46aedb6ec0619620/EW26_Online_251209v3_compressed-optimized.glb';
const speakUpOnlineIntroPath = '/assets/speakup/online/speakup-online-intro.glb';

const fallbackTypes = {
  '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8',
  '.glb': 'model/gltf-binary', '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.png': 'image/png',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.mp4': 'video/mp4', '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm', '.webm': 'video/webm', '.webp': 'image/webp', '.woff2': 'font/woff2',
};

async function serveSpeakUpIndex(request, response, filePath) {
  let body = await readFile(filePath, 'utf8');
  body = body
    .replaceAll(originalAgenticPropsPath, speakUpAgenticPropsPath)
    .replaceAll(originalAgenticBookPath, speakUpAgenticBookPath)
    .replaceAll(originalOnlineIntroPath, speakUpOnlineIntroPath)
    .replace(
      '</head>',
      '<link rel="stylesheet" href="/speakup-overrides.css" data-speakup-overrides="true" /></head>',
    )
    .replace(
      '</body>',
      '<script src="/speakup-overrides.js" data-speakup-overrides="true"></script></body>',
    );
  const encoded = Buffer.from(body);
  response.writeHead(200, {
    'Cache-Control': 'no-store',
    'Content-Length': encoded.length,
    'Content-Type': 'text/html; charset=utf-8',
  });
  if (request.method === 'HEAD') response.end();
  else response.end(encoded);
}

function sendJson(response, status, value) {
  const body = Buffer.from(JSON.stringify(value));
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': body.length,
    'Cache-Control': 'no-store',
  });
  response.end(body);
}

async function serveFile(request, response, filePath, publicPath) {
  const info = await stat(filePath);
  const contentType = mimeMap[publicPath] || fallbackTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
  const range = request.headers.range;
  const common = {
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'no-store',
    'Content-Type': contentType,
  };

  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match) {
      response.writeHead(416, { 'Content-Range': `bytes */${info.size}` });
      response.end();
      return;
    }
    const start = match[1] ? Number(match[1]) : 0;
    const end = match[2] ? Math.min(Number(match[2]), info.size - 1) : info.size - 1;
    if (start > end || start >= info.size) {
      response.writeHead(416, { 'Content-Range': `bytes */${info.size}` });
      response.end();
      return;
    }
    response.writeHead(206, {
      ...common,
      'Content-Length': end - start + 1,
      'Content-Range': `bytes ${start}-${end}/${info.size}`,
    });
    if (request.method === 'HEAD') response.end();
    else createReadStream(filePath, { start, end }).pipe(response);
    return;
  }

  response.writeHead(200, { ...common, 'Content-Length': info.size });
  if (request.method === 'HEAD') response.end();
  else createReadStream(filePath).pipe(response);
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', `http://${request.headers.host || host}`);
    const serveReference = url.searchParams.get('reference') === '1';
    if (url.pathname === '/services/auth/session') return sendJson(response, 200, {});
    if (url.pathname === '/.well-known/dux') {
      response.writeHead(204, { 'Cache-Control': 'no-store' });
      return response.end();
    }

    const pageRoutes = new Set(['/', '/editions/winter2026', '/editions/winter2026/']);
    const publicPath = pageRoutes.has(url.pathname) ? '/index.html' : url.pathname;
    const decoded = decodeURIComponent(publicPath);
    const filePath = path.resolve(rootDir, `.${decoded}`);
    if (!filePath.startsWith(`${rootDir}${path.sep}`)) {
      response.writeHead(403);
      return response.end('Forbidden');
    }
    if (publicPath === '/index.html' && !serveReference) {
      return serveSpeakUpIndex(request, response, filePath);
    }
    await serveFile(request, response, filePath, publicPath);
  } catch (error) {
    response.writeHead(error?.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(error?.code === 'ENOENT' ? 'Not found' : 'Internal server error');
  }
});

server.listen(port, host, () => {
  console.log(`Shopify Winter '26 local mirror: http://${host}:${port}/editions/winter2026#sidekick`);
});
