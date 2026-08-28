import { createHash } from 'node:crypto';
import {
  access,
  mkdir,
  readFile,
  readdir,
  writeFile,
} from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const JSON_CHUNK = 0x4e4f534a;
const BIN_CHUNK = 0x004e4942;
const KHR_TEXTURE_BASISU = 'KHR_texture_basisu';
const RGBA32_TRANSCODER_FORMAT = 13;

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const sourcePath = path.join(
  rootDir,
  'assets/remote/editions-winter-2026.myshopify.com/cdn/shop/3d/models/o/46aedb6ec0619620/EW26_Online_251209v3_compressed-optimized.glb',
);
const videoPath = path.join(rootDir, 'assets/speakup/表达准备.mov');
const outputDir = path.join(rootDir, 'assets/speakup/preparation');
const framesDir = path.join(outputDir, 'frames');
const outputGlbPath = path.join(outputDir, 'speakup-preparation-intro.glb');
const outputAtlasPath = path.join(outputDir, 'speakup-preparation-atlas.png');
const outputContactSheetPath = path.join(
  outputDir,
  'speakup-preparation-ui-flow.png',
);
const outputManifestPath = path.join(outputDir, 'build-manifest.json');
const basisTranscoderPath = path.join(
  rootDir,
  'assets/remote/cdn.jsdelivr.net/npm/three@0.172.0/examples/jsm/libs/basis/basis_transcoder.js',
);

const FRAME_SPECS = [
  {
    id: '01-choose-goal',
    timestamp: 0.4,
    label: '01 · CHOOSE',
    crop: { left: 0, top: 40, width: 432, height: 455 },
  },
  {
    id: '02-name-context',
    timestamp: 3.4,
    label: '02 · CONTEXT',
    crop: { left: 0, top: 300, width: 432, height: 455 },
  },
  {
    id: '03-learn-frame',
    timestamp: 6.4,
    label: '03 · LEARN',
    crop: { left: 0, top: 100, width: 432, height: 455 },
  },
  {
    id: '04-ask-to-try',
    timestamp: 10.4,
    label: '04 · ASK TO TRY',
    crop: { left: 0, top: 420, width: 432, height: 455 },
  },
  {
    id: '05-enter-practice',
    timestamp: 13.4,
    label: '05 · ENTER',
    crop: { left: 0, top: 280, width: 432, height: 455 },
  },
  {
    id: '06-start-session',
    timestamp: 18.4,
    label: '06 · PRACTICE',
    crop: { left: 0, top: 330, width: 432, height: 455 },
  },
];

// These six paper cells are the product slots in online_fg_diffuse_v5.
// Insets leave the authored paper rules and texture visible around every card.
const PAPER_CELLS = [
  { left: 307, top: 109, width: 152, height: 183 },
  { left: 478, top: 109, width: 152, height: 183 },
  { left: 307, top: 316, width: 152, height: 184 },
  { left: 478, top: 316, width: 152, height: 184 },
  { left: 307, top: 521, width: 152, height: 187 },
  { left: 478, top: 521, width: 152, height: 187 },
];

function align4(value) {
  return Math.ceil(value / 4) * 4;
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function compareVersions(a, b) {
  const left = a.split('.').map(Number);
  const right = b.split('.').map(Number);
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const difference = (left[index] || 0) - (right[index] || 0);
    if (difference) return difference;
  }
  return 0;
}

async function findSharpToolkit() {
  const npxCache = path.join(homedir(), '.npm', '_npx');
  const candidates = [];

  try {
    for (const entry of await readdir(npxCache, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const candidate = path.join(npxCache, entry.name);
      const packagePath = path.join(
        candidate,
        'node_modules/@gltf-transform/core/package.json',
      );
      try {
        const packageJson = JSON.parse(await readFile(packagePath, 'utf8'));
        await access(path.join(candidate, 'node_modules/sharp'));
        candidates.push({ root: candidate, version: packageJson.version });
      } catch {
        // Ignore unrelated or incomplete npx cache entries.
      }
    }
  } catch {
    // The cache may not exist on a fresh machine; bootstrap it below.
  }

  candidates.sort((a, b) => compareVersions(b.version, a.version));
  if (candidates[0]) return candidates[0];

  console.log('Preparing the image build toolkit...');
  const bootstrap = spawnSync(
    'npx',
    ['--yes', '@gltf-transform/cli@4.4.2', '--version'],
    { stdio: 'inherit' },
  );
  if (bootstrap.status !== 0) {
    throw new Error('Unable to prepare @gltf-transform/cli with npx.');
  }
  return findSharpToolkit();
}

function assertCommand(name) {
  const result = spawnSync(name, ['-version'], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`${name} is required for this build.`);
}

function parseGlb(source) {
  if (
    source.toString('utf8', 0, 4) !== 'glTF' ||
    source.readUInt32LE(4) !== 2 ||
    source.readUInt32LE(8) !== source.length
  ) {
    throw new Error(`Expected a complete glTF 2.0 binary at ${sourcePath}.`);
  }

  const chunks = [];
  let offset = 12;
  while (offset < source.length) {
    const byteLength = source.readUInt32LE(offset);
    const type = source.readUInt32LE(offset + 4);
    const end = offset + 8 + byteLength;
    if (end > source.length) throw new Error('Malformed GLB chunk length.');
    chunks.push({ type, data: source.subarray(offset + 8, end) });
    offset = end;
  }

  const jsonChunk = chunks.find((chunk) => chunk.type === JSON_CHUNK);
  const binChunk = chunks.find((chunk) => chunk.type === BIN_CHUNK);
  if (!jsonChunk || !binChunk) throw new Error('Expected JSON and BIN chunks.');
  const document = JSON.parse(
    jsonChunk.data.toString('utf8').replace(/[\u0000 ]+$/u, ''),
  );
  return { chunks, binChunk, document };
}

function replaceChunk(chunks, type, data) {
  return chunks.map((chunk) => (chunk.type === type ? { type, data } : chunk));
}

function encodeGlb(chunks) {
  const totalLength =
    12 + chunks.reduce((sum, chunk) => sum + 8 + chunk.data.length, 0);
  const output = Buffer.alloc(totalLength);
  output.write('glTF', 0, 4, 'utf8');
  output.writeUInt32LE(2, 4);
  output.writeUInt32LE(totalLength, 8);
  let offset = 12;
  for (const chunk of chunks) {
    output.writeUInt32LE(chunk.data.length, offset);
    output.writeUInt32LE(chunk.type, offset + 4);
    chunk.data.copy(output, offset + 8);
    offset += 8 + chunk.data.length;
  }
  return output;
}

function invariantSnapshot(document) {
  return JSON.stringify({
    scenes: document.scenes,
    nodes: document.nodes,
    meshes: document.meshes,
    materials: document.materials,
    skins: document.skins,
    animations: document.animations,
    accessors: document.accessors,
  });
}

function verifyExpectedPreparationScene(document) {
  const canvasNode = document.nodes?.find((node) => node.name === 'online_canvas');
  const canvasMesh = document.meshes?.[canvasNode?.mesh];
  const sceneMaterial = document.materials?.find(
    (material) => material.name === 'OnlineScene',
  );
  const atlas = document.images?.[0];
  const texture = document.textures?.[0];
  const animationNames = document.animations?.map((animation) => animation.name);

  if (
    document.nodes?.length !== 41 ||
    document.meshes?.length !== 6 ||
    document.materials?.length !== 3 ||
    document.skins?.length !== 2 ||
    document.animations?.length !== 4 ||
    canvasNode?.mesh === undefined ||
    canvasMesh?.name !== 'online_canvas' ||
    sceneMaterial?.name !== 'OnlineScene' ||
    atlas?.name !== 'online_fg_diffuse_v5' ||
    atlas?.extras?.originalWidth !== 1024 ||
    atlas?.extras?.originalHeight !== 1024 ||
    texture?.extensions?.[KHR_TEXTURE_BASISU]?.source !== 0 ||
    !animationNames.includes('online_canvasAction')
  ) {
    throw new Error('The preparation source scene no longer matches the reviewed structure.');
  }
}

function extractEmbeddedImage(document, binChunk, imageIndex) {
  const image = document.images?.[imageIndex];
  const view = document.bufferViews?.[image?.bufferView];
  if (!image || !view) throw new Error(`Embedded image ${imageIndex} is missing.`);
  const start = view.byteOffset || 0;
  return binChunk.data.subarray(start, start + view.byteLength);
}

async function decodeKtx2ToPng(ktx2, sharp, BASIS) {
  const basis = await BASIS();
  basis.initializeBasis();
  const file = new basis.KTX2File(new Uint8Array(ktx2));
  try {
    if (!file.isValid() || !file.isETC1S()) {
      throw new Error('Expected the reviewed ETC1S preparation source atlas.');
    }
    if (
      file.getWidth() !== 1024 ||
      file.getHeight() !== 1024 ||
      file.getHasAlpha()
    ) {
      throw new Error('Unexpected preparation source atlas dimensions or alpha mode.');
    }
    if (!file.startTranscoding()) throw new Error('KTX2 transcoding failed to start.');
    const rgba = new Uint8Array(
      file.getImageTranscodedSizeInBytes(
        0,
        0,
        0,
        RGBA32_TRANSCODER_FORMAT,
      ),
    );
    if (
      !file.transcodeImage(
        rgba,
        0,
        0,
        0,
        RGBA32_TRANSCODER_FORMAT,
        0,
        -1,
        -1,
      )
    ) {
      throw new Error('KTX2 transcoding failed.');
    }
    return sharp(rgba, {
      raw: { width: 1024, height: 1024, channels: 4 },
    })
      .png({ compressionLevel: 9 })
      .toBuffer();
  } finally {
    file.close();
    file.delete();
  }
}

function inspectVideo() {
  const result = spawnSync(
    'ffprobe',
    [
      '-v',
      'error',
      '-select_streams',
      'v:0',
      '-show_entries',
      'stream=width,height,codec_name:format=duration',
      '-of',
      'json',
      videoPath,
    ],
    { encoding: 'utf8' },
  );
  if (result.status !== 0) throw new Error('ffprobe could not inspect 表达准备.mov.');
  const metadata = JSON.parse(result.stdout);
  const stream = metadata.streams?.[0];
  const duration = Number(metadata.format?.duration);
  if (
    stream?.width !== 432 ||
    stream?.height !== 960 ||
    !Number.isFinite(duration) ||
    duration < FRAME_SPECS.at(-1).timestamp
  ) {
    throw new Error('表达准备.mov no longer matches the reviewed 432x960 recording.');
  }
  return { ...stream, duration };
}

async function extractFrames() {
  await mkdir(framesDir, { recursive: true });
  const framePaths = [];
  for (const spec of FRAME_SPECS) {
    const framePath = path.join(framesDir, `${spec.id}.png`);
    const result = spawnSync(
      'ffmpeg',
      [
        '-v',
        'error',
        '-y',
        '-ss',
        spec.timestamp.toFixed(2),
        '-i',
        videoPath,
        '-map',
        '0:v:0',
        '-frames:v',
        '1',
        '-an',
        framePath,
      ],
      { stdio: 'inherit' },
    );
    if (result.status !== 0) {
      throw new Error(`Could not extract UI frame at ${spec.timestamp}s.`);
    }
    framePaths.push(framePath);
  }
  return framePaths;
}

function svgEscape(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

async function buildUiCard(sharp, framePath, spec, cell) {
  const inset = 7;
  const width = cell.width - inset * 2;
  const height = cell.height - inset * 2;
  const labelHeight = 22;
  const screenHeight = height - labelHeight;
  const screen = await sharp(framePath)
    .extract(spec.crop)
    .resize(width, screenHeight, { fit: 'cover', position: 'centre' })
    .png()
    .toBuffer();
  const screenMask = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${screenHeight}">
      <rect width="${width}" height="${screenHeight}" rx="5" fill="#fff"/>
    </svg>
  `);
  const clippedScreen = await sharp(screen)
    .composite([{ input: screenMask, blend: 'dest-in' }])
    .png()
    .toBuffer();
  const cardBase = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect x=".75" y=".75" width="${width - 1.5}" height="${height - 1.5}" rx="7"
        fill="#F7F6F1" stroke="#655F55" stroke-width="1.5"/>
    </svg>
  `);
  const cardChrome = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <path d="M1 7a6 6 0 0 1 6-6h${width - 14}a6 6 0 0 1 6 6v${labelHeight - 6}H1Z" fill="#25211D"/>
      <text x="8" y="15" fill="#F7F3E9" font-family="Arial, Helvetica, sans-serif"
        font-size="8.3" font-weight="700" letter-spacing=".55">${svgEscape(spec.label)}</text>
      <rect x=".75" y=".75" width="${width - 1.5}" height="${height - 1.5}" rx="7"
        fill="none" stroke="#655F55" stroke-width="1.5"/>
    </svg>
  `);
  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: cardBase, left: 0, top: 0 },
      { input: clippedScreen, left: 0, top: labelHeight },
      { input: cardChrome, left: 0, top: 0 },
    ])
    .png()
    .toBuffer();
}

async function buildContactSheet(sharp, framePaths) {
  const width = 216;
  const height = 480;
  const gutter = 12;
  const canvasWidth = width * 3 + gutter * 4;
  const canvasHeight = height * 2 + gutter * 3;
  const inputs = [];
  for (let index = 0; index < framePaths.length; index += 1) {
    inputs.push({
      input: await sharp(framePaths[index]).resize(width, height).png().toBuffer(),
      left: gutter + (index % 3) * (width + gutter),
      top: gutter + Math.floor(index / 3) * (height + gutter),
    });
  }
  return sharp({
    create: {
      width: canvasWidth,
      height: canvasHeight,
      channels: 3,
      background: '#F3F0E8',
    },
  })
    .composite(inputs)
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function buildAtlas(sharp, originalAtlas, framePaths) {
  const composites = [];
  for (let index = 0; index < FRAME_SPECS.length; index += 1) {
    const cell = PAPER_CELLS[index];
    const card = await buildUiCard(
      sharp,
      framePaths[index],
      FRAME_SPECS[index],
      cell,
    );
    composites.push({ input: card, left: cell.left + 7, top: cell.top + 7 });
  }

  const brandPatch = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="190" height="54">
      <rect x="1" y="1" width="188" height="52" rx="6" fill="#F2F1EB" fill-opacity=".97"
        stroke="#777064" stroke-width="1.25"/>
      <text x="95" y="28" text-anchor="middle" fill="#29251F"
        font-family="Georgia, Times, serif" font-size="22" font-style="italic" font-weight="700">SpeakUp</text>
      <text x="95" y="43" text-anchor="middle" fill="#5A544A"
        font-family="Arial, Helvetica, sans-serif" font-size="7" font-weight="700"
        letter-spacing="1.5">PRACTICE FLOW</text>
    </svg>
  `);
  composites.push({ input: brandPatch, left: 556, top: 25 });

  return sharp(originalAtlas)
    .composite(composites)
    .png({ compressionLevel: 9 })
    .toBuffer();
}

function replaceAtlas(chunks, binChunk, document, atlasPng) {
  const image = document.images[0];
  const imageViewIndex = image.bufferView;
  if (
    imageViewIndex === undefined ||
    document.accessors?.some((accessor) => accessor.bufferView === imageViewIndex)
  ) {
    throw new Error('The preparation source atlas bufferView is missing or shared.');
  }

  const occupiedEnd = Math.max(
    document.buffers[0].byteLength,
    ...document.bufferViews.map(
      (view) => (view.byteOffset || 0) + view.byteLength,
    ),
  );
  const atlasOffset = align4(occupiedEnd);
  const logicalBinLength = atlasOffset + atlasPng.length;
  const nextBin = Buffer.alloc(align4(logicalBinLength));
  binChunk.data.copy(nextBin);
  atlasPng.copy(nextBin, atlasOffset);

  document.bufferViews[imageViewIndex] = {
    buffer: 0,
    byteOffset: atlasOffset,
    byteLength: atlasPng.length,
  };
  document.buffers[0].byteLength = logicalBinLength;
  document.images[0] = {
    name: 'SpeakUp Preparation Flow Atlas',
    extras: { originalWidth: 1024, originalHeight: 1024 },
    mimeType: 'image/png',
    bufferView: imageViewIndex,
  };
  document.textures[0].source = 0;
  if (document.textures[0].extensions) {
    delete document.textures[0].extensions[KHR_TEXTURE_BASISU];
    if (Object.keys(document.textures[0].extensions).length === 0) {
      delete document.textures[0].extensions;
    }
  }

  const encodedJson = Buffer.from(JSON.stringify(document));
  const nextJson = Buffer.concat([
    encodedJson,
    Buffer.alloc(align4(encodedJson.length) - encodedJson.length, 0x20),
  ]);
  let nextChunks = replaceChunk(chunks, JSON_CHUNK, nextJson);
  nextChunks = replaceChunk(nextChunks, BIN_CHUNK, nextBin);
  return encodeGlb(nextChunks);
}

async function main() {
  assertCommand('ffmpeg');
  assertCommand('ffprobe');
  await access(sourcePath);
  await access(videoPath);
  await access(basisTranscoderPath);
  await mkdir(outputDir, { recursive: true });

  const toolkit = await findSharpToolkit();
  const toolkitRequire = createRequire(path.join(toolkit.root, 'package.json'));
  const sharp = toolkitRequire('sharp');
  const BASIS = createRequire(import.meta.url)(basisTranscoderPath);
  const video = inspectVideo();
  const framePaths = await extractFrames();

  const source = await readFile(sourcePath);
  const { chunks, binChunk, document } = parseGlb(source);
  verifyExpectedPreparationScene(document);
  const originalInvariant = invariantSnapshot(document);
  const originalAtlasKtx2 = extractEmbeddedImage(document, binChunk, 0);
  const originalAtlas = await decodeKtx2ToPng(
    originalAtlasKtx2,
    sharp,
    BASIS,
  );
  const atlasPng = await buildAtlas(sharp, originalAtlas, framePaths);
  const contactSheet = await buildContactSheet(sharp, framePaths);
  const outputGlb = replaceAtlas(chunks, binChunk, document, atlasPng);

  if (invariantSnapshot(document) !== originalInvariant) {
    throw new Error(
      'Preparation source nodes, meshes, materials, skins, animations, scenes, or accessors changed.',
    );
  }
  const reparsed = parseGlb(outputGlb).document;
  if (
    invariantSnapshot(reparsed) !== originalInvariant ||
    reparsed.images?.[0]?.mimeType !== 'image/png' ||
    reparsed.textures?.[0]?.source !== 0
  ) {
    throw new Error('Encoded output did not preserve the reviewed preparation scene.');
  }

  await writeFile(outputAtlasPath, atlasPng);
  await writeFile(outputContactSheetPath, contactSheet);
  await writeFile(outputGlbPath, outputGlb);

  const manifest = {
    source: {
      glb: path.relative(rootDir, sourcePath),
      glbBytes: source.length,
      glbSha256: sha256(source),
      recording: path.relative(rootDir, videoPath),
      recordingDurationSeconds: video.duration,
      recordingDimensions: [video.width, video.height],
    },
    output: {
      glb: path.relative(rootDir, outputGlbPath),
      glbBytes: outputGlb.length,
      glbSha256: sha256(outputGlb),
      atlas: path.relative(rootDir, outputAtlasPath),
      atlasBytes: atlasPng.length,
      atlasSha256: sha256(atlasPng),
      uiFlowContactSheet: path.relative(rootDir, outputContactSheetPath),
    },
    frames: FRAME_SPECS.map((spec, index) => ({
      id: spec.id,
      timestampSeconds: spec.timestamp,
      label: spec.label,
      crop: spec.crop,
      file: path.relative(rootDir, framePaths[index]),
    })),
    preserved: {
      nodes: document.nodes.length,
      meshes: document.meshes.length,
      materials: document.materials.length,
      skins: document.skins.length,
      animations: document.animations.map((animation) => ({
        name: animation.name,
        channels: animation.channels.length,
        samplers: animation.samplers.length,
      })),
      scenes: document.scenes.length,
      accessors: document.accessors.length,
      exactInvariantJsonMatch: true,
    },
    atlasReplacement: {
      sourceImage: 'online_fg_diffuse_v5',
      sourceEncoding: 'KTX2 ETC1S 1024x1024, no alpha',
      outputEncoding: 'embedded PNG 1024x1024',
      reason:
        'The mirror includes a Basis decoder but no KTX encoder; PNG keeps the material and UV contract while remaining browser-native.',
      changedRegion:
        'Six authored product cells and the small header wordmark only; surrounding paper, baked hand shadow, brush path, and all non-canvas atlas regions are preserved.',
    },
    fallbacks: {
      status: 'blocked-for-exact-composite',
      reason:
        'Desktop, mobile, and no-WebGL fallbacks are flattened renders. The hand, sleeve, blue brush, paper, and product pixels share one bitmap, and their occlusions differ by crop. A 2D overwrite would cover authored foreground pixels. Render fresh fallbacks from the replacement GLB at the original camera states instead of patching these bitmaps.',
      requiredSources: [
        'assets/remote/cdn.shopify.com/s/files/1/0951/3130/4218/files/Online_desktop.ktx2',
        'assets/remote/cdn.shopify.com/s/files/1/0951/3130/4218/files/Fallback_Mobile_Online_2x.ktx2',
        'assets/remote/cdn.shopify.com/s/files/1/0951/3130/4218/files/Online_Fallback.jpg',
        'assets/remote/cdn.shopify.com/s/files/1/0951/3130/4218/files/Fallback_Mobile_Online_2x_19548bd3-08de-48b3-a780-e47cbf3fbf64.jpg',
      ],
    },
    toolkit: {
      sharpViaGltfTransform: toolkit.version,
      ffmpeg: true,
      basisDecoder:
        'three@0.172.0/examples/jsm/libs/basis/basis_transcoder',
    },
  };
  await writeFile(outputManifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(
    `Created ${path.relative(rootDir, outputGlbPath)} (${outputGlb.length} bytes)`,
  );
  console.log(
    `Preserved ${document.nodes.length} nodes, ${document.meshes.length} meshes, ${document.materials.length} materials, ${document.skins.length} skins, and ${document.animations.length} animations.`,
  );
  console.log(
    `Created ${path.relative(rootDir, outputAtlasPath)} and ${FRAME_SPECS.length} source UI frames.`,
  );
  console.log(
    'Fallbacks were not patched because their hand/brush occlusions are flattened; see build-manifest.json.',
  );
}

await main();
