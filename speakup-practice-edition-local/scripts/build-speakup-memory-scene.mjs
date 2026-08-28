import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const JSON_CHUNK = 0x4e4f534a;
const BIN_CHUNK = 0x004e4942;
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const require = createRequire(import.meta.url);
const outputDir = path.join(rootDir, 'assets/speakup/memory');
const manifestPath = path.join(outputDir, 'memory-build-manifest.json');
const cleanBackgroundSource =
  'assets/remote/cdn.shopify.com/s/files/1/0951/3130/4218/files/Finance_bg-optimized.ktx2';
const basisTranscoderJs = path.join(
  rootDir,
  'assets/remote/cdn.jsdelivr.net/npm/three@0.172.0/examples/jsm/libs/basis/basis_transcoder.js',
);
const basisTranscoderWasm = path.join(
  rootDir,
  'assets/remote/cdn.jsdelivr.net/npm/three@0.172.0/examples/jsm/libs/basis/basis_transcoder.wasm',
);

const builds = [
  {
    source:
      'assets/remote/editions-winter-2026.myshopify.com/cdn/shop/3d/models/o/614d6d0fa1836313/EW26_Finance_251208v2_compressed-optimized.glb',
    output: 'assets/speakup/memory/speakup-memory-high.glb',
    coinPattern: /^shiny-coin\d+$/u,
  },
  {
    source:
      'assets/remote/editions-winter-2026.myshopify.com/cdn/shop/3d/models/o/7b3adea2cd3c35d2/finance_fg_smaller_251127_compressed-optimized.glb',
    output: 'assets/speakup/memory/speakup-memory-medium.glb',
    coinPattern: /^Coin(?:\.\d{3})?$/u,
  },
];

const personNodeNames = new Set([
  'Finance Woman',
  'Finance-l-hand.001',
  'Finance-r-hand.001',
]);
const propNodeNames = new Set(['Phone']);

function align4(value) {
  return Math.ceil(value / 4) * 4;
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function parseGlb(source) {
  if (source.toString('utf8', 0, 4) !== 'glTF' || source.readUInt32LE(4) !== 2) {
    throw new Error('Expected GLB 2.0.');
  }
  const chunks = [];
  let offset = 12;
  while (offset < source.length) {
    const byteLength = source.readUInt32LE(offset);
    const type = source.readUInt32LE(offset + 4);
    chunks.push({ type, data: source.subarray(offset + 8, offset + 8 + byteLength) });
    offset += 8 + byteLength;
  }
  const jsonChunk = chunks.find((chunk) => chunk.type === JSON_CHUNK);
  const binChunk = chunks.find((chunk) => chunk.type === BIN_CHUNK);
  if (!jsonChunk || !binChunk) throw new Error('Expected JSON and BIN chunks.');
  return {
    chunks,
    document: JSON.parse(jsonChunk.data.toString('utf8').replace(/[\u0000 ]+$/u, '')),
    binChunk,
  };
}

function encodeGlb(chunks, document, binData) {
  const json = Buffer.from(JSON.stringify(document));
  const paddedJson = Buffer.alloc(align4(json.length), 0x20);
  json.copy(paddedJson);
  const nextChunks = chunks.map((chunk) => {
    if (chunk.type === JSON_CHUNK) return { type: chunk.type, data: paddedJson };
    if (chunk.type === BIN_CHUNK) return { type: chunk.type, data: binData };
    return chunk;
  });
  const totalLength =
    12 + nextChunks.reduce((sum, chunk) => sum + 8 + chunk.data.length, 0);
  const output = Buffer.alloc(totalLength);
  output.write('glTF', 0, 4, 'utf8');
  output.writeUInt32LE(2, 4);
  output.writeUInt32LE(totalLength, 8);
  let offset = 12;
  for (const chunk of nextChunks) {
    output.writeUInt32LE(chunk.data.length, offset);
    output.writeUInt32LE(chunk.type, offset + 4);
    chunk.data.copy(output, offset + 8);
    offset += 8 + chunk.data.length;
  }
  return output;
}

async function buildModel(build) {
  const sourcePath = path.join(rootDir, build.source);
  const outputPath = path.join(rootDir, build.output);
  const source = await readFile(sourcePath);
  const parsed = parseGlb(source);
  const originalNodeCount = parsed.document.nodes.length;
  const originalMeshes = JSON.stringify(parsed.document.meshes || []);
  const originalSkins = JSON.stringify(parsed.document.skins || []);
  const originalAnimations = JSON.stringify(parsed.document.animations || []);
  const hiddenNodes = [];

  for (const node of parsed.document.nodes) {
    if (node.mesh === undefined) continue;
    const role = personNodeNames.has(node.name)
      ? 'person'
      : build.coinPattern.test(node.name)
        ? 'coin'
        : propNodeNames.has(node.name)
          ? 'prop'
          : null;
    if (!role) continue;
    hiddenNodes.push({ name: node.name, mesh: node.mesh, role });
    delete node.mesh;
  }

  const personCount = hiddenNodes.filter((node) => node.role === 'person').length;
  const coinCount = hiddenNodes.filter((node) => node.role === 'coin').length;
  const propCount = hiddenNodes.filter((node) => node.role === 'prop').length;
  if (personCount !== 3 || coinCount !== 10 || propCount !== 1) {
    throw new Error(
      `Expected 3 person meshes, 10 coins, and 1 phone in ${build.source}; found ${personCount}, ${coinCount}, and ${propCount}.`,
    );
  }
  if (parsed.document.nodes.length !== originalNodeCount) {
    throw new Error('Node graph changed unexpectedly.');
  }
  if (JSON.stringify(parsed.document.meshes || []) !== originalMeshes) {
    throw new Error('Mesh definitions changed unexpectedly.');
  }
  if (JSON.stringify(parsed.document.skins || []) !== originalSkins) {
    throw new Error('Skin definitions changed unexpectedly.');
  }
  if (JSON.stringify(parsed.document.animations || []) !== originalAnimations) {
    throw new Error('Animation channels changed unexpectedly.');
  }

  const output = encodeGlb(parsed.chunks, parsed.document, parsed.binChunk.data);
  const outputParsed = parseGlb(output);
  if (outputParsed.binChunk.data.compare(parsed.binChunk.data) !== 0) {
    throw new Error('Original binary geometry or texture data changed.');
  }
  if (JSON.stringify(outputParsed.document.animations || []) !== originalAnimations) {
    throw new Error('Encoded animations changed unexpectedly.');
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, output);
  return {
    source: build.source,
    sourceSha256: sha256(source),
    output: build.output,
    outputSha256: sha256(output),
    hiddenNodes,
    preserved: {
      nodes: originalNodeCount,
      meshes: parsed.document.meshes.length,
      skins: parsed.document.skins?.length || 0,
      animations:
        parsed.document.animations?.map((animation) => ({
          name: animation.name,
          channels: animation.channels.length,
          samplers: animation.samplers.length,
        })) || [],
      exactOriginalBinary: true,
    },
  };
}

async function decodeKtx2ToRgba(sourcePath, rawPath) {
  const createBasisModule = require(basisTranscoderJs);
  const module = await createBasisModule({
    wasmBinary: await readFile(basisTranscoderWasm),
  });
  module.initializeBasis();
  const texture = new module.KTX2File(
    new Uint8Array(await readFile(sourcePath)),
  );
  const width = texture.getWidth();
  const height = texture.getHeight();
  if (!texture.startTranscoding()) throw new Error('Failed to start KTX2 transcoding.');
  const format = module.transcoder_texture_format.cTFRGBA32.value;
  const byteLength = texture.getImageTranscodedSizeInBytes(0, 0, 0, format);
  const pixels = new Uint8Array(byteLength);
  const success = texture.transcodeImage(pixels, 0, 0, 0, format, 0, -1, -1);
  texture.close();
  texture.delete();
  if (!success || byteLength !== width * height * 4) {
    throw new Error('Failed to decode the clean memory background to RGBA.');
  }
  await writeFile(rawPath, pixels);
  return { width, height };
}

function renderFallback(rawPath, sourceSize, outputPath, outputSize) {
  const result = spawnSync(
    'ffmpeg',
    [
      '-hide_banner',
      '-loglevel',
      'error',
      '-y',
      '-f',
      'rawvideo',
      '-pixel_format',
      'rgba',
      '-video_size',
      `${sourceSize.width}x${sourceSize.height}`,
      '-i',
      rawPath,
      '-vf',
      `scale=${outputSize.width}:${outputSize.height}:force_original_aspect_ratio=increase,crop=${outputSize.width}:${outputSize.height}`,
      '-frames:v',
      '1',
      '-q:v',
      '2',
      outputPath,
    ],
    { stdio: 'inherit' },
  );
  if (result.status !== 0) throw new Error(`Failed to render ${outputPath}.`);
}

async function buildFallbacks() {
  const sourcePath = path.join(rootDir, cleanBackgroundSource);
  const cleanKtx2 = await readFile(sourcePath);
  const cleanKtx2Output = path.join(outputDir, 'memory-clean-background.ktx2');
  const desktopOutput = path.join(outputDir, 'memory-desktop.jpg');
  const mobileOutput = path.join(outputDir, 'memory-mobile.jpg');
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'speakup-memory-'));
  const rawPath = path.join(tempDir, 'background.rgba');

  try {
    const sourceSize = await decodeKtx2ToRgba(sourcePath, rawPath);
    await writeFile(cleanKtx2Output, cleanKtx2);
    renderFallback(rawPath, sourceSize, desktopOutput, { width: 2880, height: 1780 });
    renderFallback(rawPath, sourceSize, mobileOutput, { width: 804, height: 1748 });
    const desktop = await readFile(desktopOutput);
    const mobile = await readFile(mobileOutput);
    return {
      source: cleanBackgroundSource,
      sourceSha256: sha256(cleanKtx2),
      operation: 'decode original clean background, then scale and center-crop without stretching',
      fit: 'cover',
      outputs: [
        {
          path: 'assets/speakup/memory/memory-clean-background.ktx2',
          width: sourceSize.width,
          height: sourceSize.height,
          sha256: sha256(cleanKtx2),
        },
        {
          path: 'assets/speakup/memory/memory-desktop.jpg',
          width: 2880,
          height: 1780,
          sha256: sha256(desktop),
        },
        {
          path: 'assets/speakup/memory/memory-mobile.jpg',
          width: 804,
          height: 1748,
          sha256: sha256(mobile),
        },
      ],
    };
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

await mkdir(outputDir, { recursive: true });
const modelBuilds = [];
for (const build of builds) modelBuilds.push(await buildModel(build));
const fallbacks = await buildFallbacks();
await writeFile(
  manifestPath,
  `${JSON.stringify({ modelBuilds, fallbacks }, null, 2)}\n`,
);

console.log(
  [...builds.map((build) => build.output), ...fallbacks.outputs.map((item) => item.path)].join('\n'),
);
