import { createReadStream } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 18086);
const publicPagePath = '/practice';
const compatibilityPagePath = '/editions/winter2026';
const localMirrorOrigin = 'http://127.0.0.1:18086';
const mimeMap = JSON.parse(await readFile(path.join(rootDir, 'mime-map.json'), 'utf8'));
const sourceGoalPropsPath =
  '/assets/remote/editions-winter-2026.myshopify.com/cdn/shop/3d/models/o/510af84586abddc1/EW26_Agentic_Props_251209v5_compressed-optimized.glb';
const speakUpGoalPropsPath = '/assets/speakup/goal/speakup-goal-cards.glb';
const sourceGoalBookPath =
  '/assets/remote/editions-winter-2026.myshopify.com/cdn/shop/3d/models/o/9567eaad495dfa3f/Rigged_Book_CS_Animated_V5_compressed-optimized.glb';
const speakUpGoalBookPath = '/assets/speakup/goal/speakup-goal-book.glb';
const sourcePreparationIntroPath =
  '/assets/remote/editions-winter-2026.myshopify.com/cdn/shop/3d/models/o/46aedb6ec0619620/EW26_Online_251209v3_compressed-optimized.glb';
const speakUpPreparationIntroPath = '/assets/speakup/preparation/speakup-preparation-intro.glb';
const aiTeacherAssetReplacements = [
  [
    '/assets/remote/editions-winter-2026.myshopify.com/cdn/shop/3d/models/o/63ac5b514230f82a/EW26_Sidekick_251208_compressed-optimized.glb',
    '/assets/speakup/ai-teacher/speakup-ai-teacher-high.glb',
  ],
  [
    '/assets/remote/editions-winter-2026.myshopify.com/cdn/shop/3d/models/o/6c9b3bf2f335a314/EW26_Sidekick_251207v4_compressed-optimized.glb',
    '/assets/speakup/ai-teacher/speakup-ai-teacher-medium.glb',
  ],
  [
    '/assets/remote/cdn.shopify.com/s/files/1/0951/3130/4218/files/Sidekick_Fallback.jpg',
    '/assets/speakup/ai-teacher/ai-teacher-desktop.jpg',
  ],
  [
    '/assets/remote/cdn.shopify.com/s/files/1/0951/3130/4218/files/Fallback_Mobile_Sidekick_2x_ae10922b-27e9-4a86-ac5d-24de7957ea02.jpg',
    '/assets/speakup/ai-teacher/ai-teacher-mobile.jpg',
  ],
  [
    '/assets/remote/cdn.shopify.com/s/files/1/0951/3130/4218/files/Sidekick_desktop.ktx2',
    '/assets/speakup/ai-teacher/ai-teacher-desktop.ktx2',
  ],
  [
    '/assets/remote/cdn.shopify.com/s/files/1/0951/3130/4218/files/Fallback_Mobile_Sidekick_2x.ktx2',
    '/assets/speakup/ai-teacher/ai-teacher-mobile.ktx2',
  ],
];
const interviewAssetReplacements = [
  [
    '/assets/remote/editions-winter-2026.myshopify.com/cdn/shop/3d/models/o/9eeb64e8194faa39/POS_V53_environment_251209v2_compressed-optimized.glb',
    '/assets/speakup/interview/speakup-interview-environment.glb',
  ],
  [
    '/assets/remote/editions-winter-2026.myshopify.com/cdn/shop/3d/models/o/e51a31d48a973f83/POS_v53_Hub_251208v2_compressed-optimized.glb',
    '/assets/speakup/interview/speakup-interview-hub.glb',
  ],
  [
    '/assets/remote/editions-winter-2026.myshopify.com/cdn/shop/3d/models/o/2f9637a8c00c276d/Retail_mg_251205v2_compressed-optimized.glb',
    '/assets/speakup/interview/speakup-interview-middle.glb',
  ],
];
const ieltsAssetReplacements = [
  [
    '/assets/remote/editions-winter-2026.myshopify.com/cdn/shop/3d/models/o/2e684892a34b58b8/EW26_Marketing_251209v4_compressed-optimized.glb',
    '/assets/speakup/ielts/speakup-ielts-scene.glb',
  ],
];
const workplaceAssetReplacements = [
  [
    '/assets/remote/editions-winter-2026.myshopify.com/cdn/shop/3d/models/o/f889c7c758e60536/EW26_Checkout_251209_compressed-optimized.glb',
    '/assets/speakup/workplace/speakup-workplace-scene.glb',
  ],
  [
    '/assets/remote/editions-winter-2026.myshopify.com/cdn/shop/3d/models/o/7aca351ff49a1198/Checkout_fg_smaller_251127_compressed-optimized.glb',
    '/assets/speakup/workplace/speakup-workplace-foreground.glb',
  ],
];
const feedbackAssetReplacements = [
  [
    '/assets/remote/editions-winter-2026.myshopify.com/cdn/shop/3d/models/o/3ffd3b2a5abbe541/EW26_ShopApp_251208v3_compressed-optimized.glb',
    '/assets/speakup/feedback-scene/speakup-feedback-high.glb',
  ],
  [
    '/assets/remote/editions-winter-2026.myshopify.com/cdn/shop/3d/models/o/f10427420c475b24/EW26_ShopApp_251128v2_compressed-optimized.glb',
    '/assets/speakup/feedback-scene/speakup-feedback-medium.glb',
  ],
];
const reviewAssetReplacements = [
  [
    '/assets/remote/editions-winter-2026.myshopify.com/cdn/shop/3d/models/o/73f4d9f62ba07f6e/EW26_B2B_251205v2_compressed-optimized.glb',
    '/assets/speakup/review/speakup-review-high.glb',
  ],
  [
    '/assets/remote/editions-winter-2026.myshopify.com/cdn/shop/3d/models/o/c4626bed57ec9dff/B2B_fg_smaller_251127_compressed-optimizedv2.glb',
    '/assets/speakup/review/speakup-review-medium.glb',
  ],
  [
    '/assets/remote/cdn.shopify.com/s/files/1/0951/3130/4218/files/newProperty_1_B2B.jpg',
    '/assets/speakup/review/review-desktop-no-laptop.jpg',
  ],
  [
    '/assets/remote/cdn.shopify.com/s/files/1/0951/3130/4218/files/Fallback_Mobile_B2B_2x_1353d91d-00eb-455e-bafb-18762b0240cb.jpg',
    '/assets/speakup/review/review-mobile-no-laptop.jpg',
  ],
  [
    '/assets/remote/cdn.shopify.com/s/files/1/0951/3130/4218/files/B2B_desktop.ktx2',
    '/assets/speakup/review/review-desktop-no-laptop.jpg',
  ],
  [
    '/assets/remote/cdn.shopify.com/s/files/1/0951/3130/4218/files/Fallback_Mobile_B2B_2x.ktx2',
    '/assets/speakup/review/review-mobile-no-laptop.jpg',
  ],
];
const memoryAssetReplacements = [
  [
    '/assets/remote/editions-winter-2026.myshopify.com/cdn/shop/3d/models/o/614d6d0fa1836313/EW26_Finance_251208v2_compressed-optimized.glb',
    '/assets/speakup/memory/speakup-memory-high.glb',
  ],
  [
    '/assets/remote/editions-winter-2026.myshopify.com/cdn/shop/3d/models/o/7b3adea2cd3c35d2/finance_fg_smaller_251127_compressed-optimized.glb',
    '/assets/speakup/memory/speakup-memory-medium.glb',
  ],
  [
    '/assets/remote/cdn.shopify.com/s/files/1/0951/3130/4218/files/Finance_Fallback.jpg',
    '/assets/speakup/memory/memory-desktop.jpg',
  ],
  [
    '/assets/remote/cdn.shopify.com/s/files/1/0951/3130/4218/files/Fallback_Mobile_Finance_2x_7fce0bd0-4a7b-4811-8eb9-a51d52fd357b.jpg',
    '/assets/speakup/memory/memory-mobile.jpg',
  ],
  [
    '/assets/remote/cdn.shopify.com/s/files/1/0951/3130/4218/files/Finance_desktop.ktx2',
    '/assets/speakup/memory/memory-clean-background.ktx2',
  ],
  [
    '/assets/remote/cdn.shopify.com/s/files/1/0951/3130/4218/files/Fallback_Mobile_Finance_2x.ktx2',
    '/assets/speakup/memory/memory-clean-background.ktx2',
  ],
];

const fallbackTypes = {
  '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8',
  '.glb': 'model/gltf-binary', '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.png': 'image/png',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.mp4': 'video/mp4', '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm', '.webm': 'video/webm', '.webp': 'image/webp', '.woff2': 'font/woff2',
};

async function serveSpeakUpIndex(request, response, filePath) {
  let body = await readFile(filePath, 'utf8');
  const embeddedRuntime = new URL(
    request.url || '/',
    `http://${request.headers.host || `${host}:${port}`}`,
  ).searchParams.get('embed') === '1';
  const forwardedProtocol = String(request.headers['x-forwarded-proto'] || '')
    .split(',')[0]
    .trim();
  const protocol = forwardedProtocol === 'https' ? 'https' : 'http';
  const requestOrigin = new URL(
    `${protocol}://${request.headers.host || `${host}:${port}`}`,
  ).origin;
  body = body
    .replaceAll(localMirrorOrigin, requestOrigin)
    .replaceAll(sourceGoalPropsPath, speakUpGoalPropsPath)
    .replaceAll(sourceGoalBookPath, speakUpGoalBookPath)
    .replaceAll(sourcePreparationIntroPath, speakUpPreparationIntroPath);
  for (const [originalPath, speakUpPath] of aiTeacherAssetReplacements) {
    body = body.replaceAll(originalPath, speakUpPath);
  }
  for (const [originalPath, speakUpPath] of interviewAssetReplacements) {
    body = body.replaceAll(originalPath, speakUpPath);
  }
  for (const [originalPath, speakUpPath] of ieltsAssetReplacements) {
    body = body.replaceAll(originalPath, speakUpPath);
  }
  for (const [originalPath, speakUpPath] of workplaceAssetReplacements) {
    body = body.replaceAll(originalPath, speakUpPath);
  }
  for (const [originalPath, speakUpPath] of feedbackAssetReplacements) {
    body = body.replaceAll(originalPath, speakUpPath);
  }
  for (const [originalPath, speakUpPath] of reviewAssetReplacements) {
    body = body.replaceAll(originalPath, speakUpPath);
  }
  for (const [originalPath, speakUpPath] of memoryAssetReplacements) {
    body = body.replaceAll(originalPath, speakUpPath);
  }
  const criticalEditionLoaderBypass = embeddedRuntime
    ? `<style data-speakup-critical-loader="true">
[data-section-name="side-and-lines"]
  :is(.davinci-lines__title, .davinci-lines__loader, .davinci-lines__complete) {
  visibility: hidden !important;
  opacity: 0 !important;
  animation: none !important;
  transition: none !important;
  pointer-events: none !important;
}
[data-section-name="side-and-lines"]
  ~ #main-content {
  visibility: visible !important;
  opacity: 1 !important;
  transition: none !important;
}
</style>`
    : '';
  body = body
    .replace(
      '</head>',
      `${criticalEditionLoaderBypass}<link rel="stylesheet" href="/speakup-overrides.css" data-speakup-overrides="true" /></head>`,
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

    const embeddedRuntime = url.searchParams.get('embed') === '1';
    if (url.pathname === '/' || url.pathname === `${publicPagePath}/`) {
      response.writeHead(308, {
        'Cache-Control': 'no-store',
        Location: `${publicPagePath}${url.search}`,
      });
      return response.end();
    }

    if (
      (url.pathname === compatibilityPagePath || url.pathname === `${compatibilityPagePath}/`) &&
      !embeddedRuntime &&
      !serveReference
    ) {
      response.writeHead(308, {
        'Cache-Control': 'no-store',
        Location: `${publicPagePath}${url.search}`,
      });
      return response.end();
    }

    const pageRoutes = new Set([compatibilityPagePath, `${compatibilityPagePath}/`]);
    const publicPath =
      url.pathname === publicPagePath
        ? '/practice.html'
        : pageRoutes.has(url.pathname)
          ? '/index.html'
          : url.pathname;
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
  console.log(`SpeakUp Practice Edition: http://${host}:${port}${publicPagePath}#ai-teacher`);
});
