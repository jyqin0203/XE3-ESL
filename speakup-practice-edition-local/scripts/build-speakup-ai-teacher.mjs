import { createHash } from 'node:crypto';
import {
  access,
  mkdir,
  readFile,
  readdir,
  unlink,
  writeFile,
} from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const JSON_CHUNK = 0x4e4f534a;
const BIN_CHUNK = 0x004e4942;
const RGBA32_TRANSCODER_FORMAT = 13;

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const outputDir = path.join(rootDir, 'assets/speakup/ai-teacher');
const donorDir = path.join(outputDir, 'donors');
const basisTranscoderPath = path.join(
  rootDir,
  'assets/remote/cdn.jsdelivr.net/npm/three@0.172.0/examples/jsm/libs/basis/basis_transcoder.js',
);
const speakUpMarkPath = path.join(
  rootDir,
  'assets/speakup/speakup-mark-white.svg',
);

const MODEL_SPECS = [
  {
    id: 'high',
    source: path.join(
      rootDir,
      'assets/remote/editions-winter-2026.myshopify.com/cdn/shop/3d/models/o/63ac5b514230f82a/EW26_Sidekick_251208_compressed-optimized.glb',
    ),
    output: path.join(outputDir, 'speakup-ai-teacher-high.glb'),
    atlas: path.join(outputDir, 'ai-teacher-atlas-high.png'),
  },
  {
    id: 'medium',
    source: path.join(
      rootDir,
      'assets/remote/editions-winter-2026.myshopify.com/cdn/shop/3d/models/o/6c9b3bf2f335a314/EW26_Sidekick_251207v4_compressed-optimized.glb',
    ),
    output: path.join(outputDir, 'speakup-ai-teacher-medium.glb'),
    atlas: path.join(outputDir, 'ai-teacher-atlas-medium.png'),
  },
];

const FALLBACK_SPECS = [
  {
    id: 'desktop',
    source: path.join(
      rootDir,
      'assets/remote/cdn.shopify.com/s/files/1/0951/3130/4218/files/Sidekick_Fallback.jpg',
    ),
    donor: path.join(donorDir, 'desktop-without-mask-and-logo.png'),
    faceDonor: path.join(donorDir, 'desktop-face-without-mask.png'),
    faceCrop: { left: 1150, top: 100, width: 900, height: 650 },
    output: path.join(outputDir, 'ai-teacher-desktop.jpg'),
    optimized: path.join(outputDir, 'ai-teacher-desktop.ktx2'),
    width: 2880,
    height: 1780,
    purpleRegion: { left: 1180, top: 150, width: 760, height: 520 },
    faceRepair: { center: [1450, 430], radii: [255, 178] },
    optimizedSize: [1440, 890],
    logo: {
      repairCenter: [682, 1440],
      repairRadii: [88, 78],
      markCenter: [682, 1440],
      markSize: 108,
      markAngle: 8,
    },
  },
  {
    id: 'mobile',
    source: path.join(
      rootDir,
      'assets/remote/cdn.shopify.com/s/files/1/0951/3130/4218/files/Fallback_Mobile_Sidekick_2x_ae10922b-27e9-4a86-ac5d-24de7957ea02.jpg',
    ),
    donor: path.join(donorDir, 'mobile-without-mask.png'),
    faceDonor: path.join(donorDir, 'mobile-face-without-mask.png'),
    faceCrop: { left: 280, top: 180, width: 524, height: 600 },
    output: path.join(outputDir, 'ai-teacher-mobile.jpg'),
    optimized: path.join(outputDir, 'ai-teacher-mobile.ktx2'),
    width: 804,
    height: 1748,
    purpleRegion: { left: 330, top: 290, width: 460, height: 390 },
    faceRepair: { center: [558, 475], radii: [190, 145] },
    optimizedSize: [804, 1748],
  },
];

const ATLAS_FACE_DONOR = path.join(donorDir, 'face-without-mask.png');
const ATLAS_LAPTOP_DONOR = path.join(donorDir, 'laptop-surface.png');
const ATLAS_FACE_CROP = { left: 650, top: 100, width: 700, height: 500 };
const ATLAS_PURPLE_REGION = { left: 830, top: 255, width: 280, height: 200 };
const ATLAS_FACE_REPAIR = { center: [965, 350], radii: [155, 112] };
const ATLAS_LOGO_CROP = { left: 0, top: 1450, width: 500, height: 500 };
const ATLAS_LOGO = {
  repairCenter: [238, 1668],
  repairRadii: [70, 62],
  markCenter: [238, 1668],
  markSize: 72,
  markAngle: 8,
};

function align4(value) {
  return Math.ceil(value / 4) * 4;
}

function alignTo(value, alignment) {
  return Math.ceil(value / alignment) * alignment;
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

async function listNpxRoots() {
  const cache = path.join(homedir(), '.npm', '_npx');
  try {
    return (await readdir(cache, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(cache, entry.name));
  } catch {
    return [];
  }
}

async function findSharpToolkit() {
  const candidates = [];
  for (const candidate of await listNpxRoots()) {
    try {
      const packageJson = JSON.parse(
        await readFile(
          path.join(candidate, 'node_modules/@gltf-transform/core/package.json'),
          'utf8',
        ),
      );
      await access(path.join(candidate, 'node_modules/sharp'));
      candidates.push({ root: candidate, version: packageJson.version });
    } catch {
      // Ignore unrelated cache entries.
    }
  }
  candidates.sort((a, b) => compareVersions(b.version, a.version));
  if (candidates[0]) return candidates[0];

  const bootstrap = spawnSync(
    'npx',
    ['--yes', '@gltf-transform/cli@4.4.2', '--version'],
    { stdio: 'inherit' },
  );
  if (bootstrap.status !== 0) {
    throw new Error('Unable to prepare the sharp image toolkit.');
  }
  return findSharpToolkit();
}

async function findBasisEncoder() {
  for (const candidate of await listNpxRoots()) {
    const packagePath = path.join(
      candidate,
      'node_modules/basisu/package.json',
    );
    const executable = path.join(
      candidate,
      'node_modules/basisu/bin/darwin/x64_sse/basisu',
    );
    try {
      const packageJson = JSON.parse(await readFile(packagePath, 'utf8'));
      await access(executable);
      if (packageJson.version === '1.16.3') return executable;
    } catch {
      // Ignore unrelated cache entries.
    }
  }

  const bootstrap = spawnSync(
    'npx',
    ['--yes', 'basisu@1.16.3', '-version'],
    { stdio: 'inherit' },
  );
  if (bootstrap.status !== 0) {
    throw new Error('Unable to prepare the Basis Universal encoder.');
  }
  return findBasisEncoder();
}

function parseGlb(source, sourcePath) {
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

function getEmbeddedKtx2(document, binChunk) {
  const image = document.images?.[0];
  const viewIndex = image?.bufferView;
  const view = document.bufferViews?.[viewIndex];
  if (
    image?.mimeType !== 'image/ktx2' ||
    viewIndex === undefined ||
    !view ||
    view.buffer !== 0
  ) {
    throw new Error('Expected one embedded KTX2 image in buffer 0.');
  }
  const start = view.byteOffset || 0;
  return {
    image,
    view,
    viewIndex,
    start,
    end: start + view.byteLength,
    bytes: binChunk.data.subarray(start, start + view.byteLength),
  };
}

function verifyExpectedScene(document) {
  const nodeNames = document.nodes?.map((node) => node.name);
  const animationNames = document.animations?.map((animation) => animation.name);
  if (
    document.nodes?.length !== 7 ||
    document.meshes?.length !== 7 ||
    document.materials?.length !== 2 ||
    document.images?.length !== 1 ||
    document.animations?.length !== 5 ||
    !nodeNames.includes('Sidekick_laptop') ||
    !nodeNames.includes('sidekick-eyelids') ||
    !animationNames.includes('sidekick-eyelidsAction')
  ) {
    throw new Error('The AI teacher source scene no longer matches the reviewed structure.');
  }
}

function disableBlinkOverlay(document) {
  const eyelids = document.nodes?.find(
    (node) => node.name === 'sidekick-eyelids',
  );
  if (!eyelids || eyelids.mesh === undefined) {
    throw new Error('Expected the visible source eyelid mesh.');
  }
  delete eyelids.mesh;
}

function invariantSnapshot(document) {
  return JSON.stringify({
    scenes: document.scenes,
    nodes: document.nodes,
    meshes: document.meshes,
    materials: document.materials,
    accessors: document.accessors,
    animations: document.animations,
    extensionsUsed: document.extensionsUsed,
    extensionsRequired: document.extensionsRequired,
  });
}

async function decodeKtx2(ktx2, sharp, BASIS) {
  const basis = await BASIS();
  basis.initializeBasis();
  const file = new basis.KTX2File(new Uint8Array(ktx2));
  try {
    if (!file.isValid() || !file.isETC1S()) {
      throw new Error('Expected the reviewed ETC1S AI teacher source atlas.');
    }
    const width = file.getWidth();
    const height = file.getHeight();
    if (width !== 2048 || height !== 2048 || !file.getHasAlpha()) {
      throw new Error('Unexpected AI teacher source atlas dimensions or alpha mode.');
    }
    if (!file.startTranscoding()) throw new Error('KTX2 transcoding failed to start.');
    const rgba = Buffer.alloc(
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
    const png = await sharp(rgba, {
      raw: { width, height, channels: 4 },
    })
      .png({ compressionLevel: 9 })
      .toBuffer();
    return { rgba, png, width, height };
  } finally {
    file.close();
    file.delete();
  }
}

async function loadRgba(sharp, input, width, height) {
  const { data, info } = await sharp(input)
    .resize(width, height, { fit: 'fill', kernel: 'lanczos3' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  if (info.channels !== 4) throw new Error(`Expected RGBA data from ${input}.`);
  return Buffer.from(data);
}

function hueAndSaturation(rByte, gByte, bByte) {
  const r = rByte / 255;
  const g = gByte / 255;
  const b = bByte / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  if (delta === 0) return { hue: 0, saturation: 0, value: max };
  let hue;
  if (max === r) hue = ((g - b) / delta) % 6;
  else if (max === g) hue = (b - r) / delta + 2;
  else hue = (r - g) / delta + 4;
  hue /= 6;
  if (hue < 0) hue += 1;
  return {
    hue,
    saturation: max === 0 ? 0 : delta / max,
    value: max,
  };
}

async function buildPurpleMask(
  sharp,
  rgba,
  width,
  height,
  region,
  { dilation = 3, protectedEyes = [] } = {},
) {
  const mask = Buffer.alloc(width * height);
  let hardPixels = 0;
  for (let y = region.top; y < region.top + region.height; y += 1) {
    for (let x = region.left; x < region.left + region.width; x += 1) {
      const pixel = y * width + x;
      const offset = pixel * 4;
      const { hue, saturation, value } = hueAndSaturation(
        rgba[offset],
        rgba[offset + 1],
        rgba[offset + 2],
      );
      if (
        rgba[offset + 3] > 32 &&
        hue >= 0.70 &&
        hue <= 0.93 &&
        saturation >= 0.27 &&
        value >= 0.12
      ) {
        mask[pixel] = 255;
        hardPixels += 1;
      }
    }
  }
  if (hardPixels < 500) {
    throw new Error(`Purple mask detection found only ${hardPixels} pixels.`);
  }
  // The eye mask contains dark seams and pale highlights whose hue no longer
  // reads as purple. Fill the horizontal silhouette between the first and last
  // detected mask pixel on every row so those authored material variations are
  // removed together instead of surviving as an eyeglass-shaped outline.
  const silhouette = Buffer.alloc(width * height);
  for (let y = region.top; y < region.top + region.height; y += 1) {
    let left = width;
    let right = -1;
    let rowPixels = 0;
    for (let x = region.left; x < region.left + region.width; x += 1) {
      if (mask[y * width + x] === 0) continue;
      left = Math.min(left, x);
      right = Math.max(right, x);
      rowPixels += 1;
    }
    if (rowPixels < 4 || right - left < 16) continue;
    for (let x = Math.max(region.left, left - 2); x <= Math.min(region.left + region.width - 1, right + 2); x += 1) {
      silhouette[y * width + x] = 255;
    }
  }
  const { data, info } = await sharp(silhouette, {
    raw: { width, height, channels: 1 },
  })
    .dilate(dilation)
    .blur(Math.max(2.2, dilation * 0.32))
    .extractChannel(0)
    .raw()
    .toBuffer({ resolveWithObject: true });
  if (info.channels !== 1 || data.length !== width * height) {
    throw new Error('Purple mask feathering did not return one channel.');
  }
  const protectedMask = Buffer.from(data);
  for (const eye of protectedEyes) {
    const [cx, cy] = eye.center;
    const [rx, ry] = eye.radii;
    const left = Math.max(0, Math.floor(cx - rx));
    const right = Math.min(width - 1, Math.ceil(cx + rx));
    const top = Math.max(0, Math.floor(cy - ry));
    const bottom = Math.min(height - 1, Math.ceil(cy + ry));
    for (let y = top; y <= bottom; y += 1) {
      for (let x = left; x <= right; x += 1) {
        const distance = Math.sqrt(
          ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2,
        );
        if (distance >= 1) continue;
        const protection =
          distance <= 0.72 ? 1 : Math.max(0, (1 - distance) / 0.28);
        const pixel = y * width + x;
        protectedMask[pixel] = Math.round(
          protectedMask[pixel] * (1 - protection),
        );
      }
    }
  }
  return { mask: protectedMask, hardPixels };
}

async function buildEllipseMask(sharp, width, height, center, radii) {
  const [cx, cy] = center;
  const [rx, ry] = radii;
  const svg = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff"/>
    </svg>
  `);
  const { data, info } = await sharp(svg)
    .ensureAlpha()
    .extractChannel('alpha')
    .blur(Math.max(3, Math.round(Math.min(rx, ry) * 0.10)))
    .extractChannel(0)
    .raw()
    .toBuffer({ resolveWithObject: true });
  if (info.channels !== 1 || data.length !== width * height) {
    throw new Error('Ellipse mask feathering did not return one channel.');
  }
  return Buffer.from(data);
}

function applyMaskedDonor(target, donor, mask, adjustment = [0, 0, 0]) {
  if (
    target.length !== donor.length ||
    target.length !== mask.length * 4
  ) {
    throw new Error('Donor, target, and mask dimensions do not match.');
  }
  const output = Buffer.from(target);
  for (let pixel = 0; pixel < mask.length; pixel += 1) {
    const amount = mask[pixel] / 255;
    if (amount <= 0) continue;
    const offset = pixel * 4;
    for (let channel = 0; channel < 3; channel += 1) {
      const donorValue = Math.max(
        0,
        Math.min(255, donor[offset + channel] + adjustment[channel]),
      );
      output[offset + channel] = Math.round(
        target[offset + channel] * (1 - amount) + donorValue * amount,
      );
    }
    output[offset + 3] = target[offset + 3];
  }
  return output;
}

function cropIntoCanvas(crop, canvasWidth, canvasHeight, region) {
  const output = Buffer.alloc(canvasWidth * canvasHeight * 4);
  for (let y = 0; y < region.height; y += 1) {
    const sourceStart = y * region.width * 4;
    const targetStart = ((region.top + y) * canvasWidth + region.left) * 4;
    crop.copy(output, targetStart, sourceStart, sourceStart + region.width * 4);
  }
  return output;
}

function estimateSkinAdjustment(source, donor, mask, width, height, region) {
  const sourceTotals = [0, 0, 0];
  const donorTotals = [0, 0, 0];
  let count = 0;
  for (let y = region.top; y < region.top + region.height; y += 1) {
    for (let x = region.left; x < region.left + region.width; x += 1) {
      const pixel = y * width + x;
      if (mask[pixel] > 12) continue;
      const offset = pixel * 4;
      const r = source[offset];
      const g = source[offset + 1];
      const b = source[offset + 2];
      if (
        source[offset + 3] < 220 ||
        r < 85 ||
        g < 65 ||
        b < 45 ||
        r < g * 0.96 ||
        g < b * 0.92 ||
        r - b > 105
      ) {
        continue;
      }
      for (let channel = 0; channel < 3; channel += 1) {
        sourceTotals[channel] += source[offset + channel];
        donorTotals[channel] += donor[offset + channel];
      }
      count += 1;
    }
  }
  if (count < 100) return [0, 0, 0];
  return sourceTotals.map((total, channel) =>
    Math.max(-20, Math.min(20, Math.round(total / count - donorTotals[channel] / count))),
  );
}

async function renderBrandMark(sharp, size, angle) {
  const mark = await readFile(speakUpMarkPath);
  return sharp(mark)
    .resize(size, size, { fit: 'contain' })
    .rotate(angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .blur(0.35)
    .png()
    .toBuffer();
}

async function overlayBrandMark(sharp, rgba, width, height, spec) {
  const mark = await renderBrandMark(sharp, spec.markSize, spec.markAngle);
  const metadata = await sharp(mark).metadata();
  const left = Math.round(spec.markCenter[0] - metadata.width / 2);
  const top = Math.round(spec.markCenter[1] - metadata.height / 2);
  const input = await sharp(rgba, {
    raw: { width, height, channels: 4 },
  })
    .composite([{ input: mark, left, top }])
    .raw()
    .toBuffer();
  // Keep the authored cutout contract byte-for-byte.
  for (let pixel = 0; pixel < width * height; pixel += 1) {
    input[pixel * 4 + 3] = rgba[pixel * 4 + 3];
  }
  return Buffer.from(input);
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

function replaceEmbeddedKtx2(parsed, replacement) {
  const { document, chunks, binChunk } = parsed;
  const { view, viewIndex, start, end } = getEmbeddedKtx2(document, binChunk);
  const logicalLength = document.buffers[0].byteLength;
  const followingOffsets = document.bufferViews
    .filter((candidate, index) => index !== viewIndex)
    .map((candidate) => candidate.byteOffset || 0)
    .filter((offset) => offset >= end)
    .sort((a, b) => a - b);
  const oldSpanEnd = followingOffsets[0] || logicalLength;
  const suffixAlignment = oldSpanEnd % 16 === 0 ? 16 : oldSpanEnd % 8 === 0 ? 8 : 4;
  if (oldSpanEnd < end || oldSpanEnd - end >= suffixAlignment) {
    throw new Error('Unexpected padding after the AI teacher texture bufferView.');
  }
  const oldGap = binChunk.data.subarray(end, oldSpanEnd);
  if ([...oldGap].some((byte) => byte !== 0)) {
    throw new Error('Non-zero bytes found in the AI teacher texture alignment gap.');
  }

  const newSpanEnd = alignTo(start + replacement.length, suffixAlignment);
  const delta = newSpanEnd - oldSpanEnd;
  const replacementSpan = Buffer.alloc(newSpanEnd - start);
  replacement.copy(replacementSpan);
  const logicalBin = Buffer.concat([
    binChunk.data.subarray(0, start),
    replacementSpan,
    binChunk.data.subarray(oldSpanEnd, logicalLength),
  ]);

  view.byteLength = replacement.length;
  for (const [index, candidate] of document.bufferViews.entries()) {
    if (index === viewIndex) continue;
    const offset = candidate.byteOffset || 0;
    if (offset >= oldSpanEnd) candidate.byteOffset = offset + delta;
  }
  document.buffers[0].byteLength = logicalLength + delta;

  const jsonBytes = Buffer.from(JSON.stringify(document));
  const jsonPadded = Buffer.concat([
    jsonBytes,
    Buffer.alloc(align4(jsonBytes.length) - jsonBytes.length, 0x20),
  ]);
  const binPadded = Buffer.concat([
    logicalBin,
    Buffer.alloc(align4(logicalBin.length) - logicalBin.length),
  ]);
  return encodeGlb(
    chunks.map((chunk) => {
      if (chunk.type === JSON_CHUNK) return { type: JSON_CHUNK, data: jsonPadded };
      if (chunk.type === BIN_CHUNK) return { type: BIN_CHUNK, data: binPadded };
      return chunk;
    }),
  );
}

function compareModelInvariants(original, candidate, imageViewIndex) {
  const checks = {
    sceneGraph:
      invariantSnapshot(original.document) === invariantSnapshot(candidate.document),
    nonTextureBufferViews: true,
  };
  for (let index = 0; index < original.document.bufferViews.length; index += 1) {
    if (index === imageViewIndex) continue;
    const originalView = original.document.bufferViews[index];
    const candidateView = candidate.document.bufferViews[index];
    const originalStart = originalView.byteOffset || 0;
    const candidateStart = candidateView.byteOffset || 0;
    const originalBytes = original.binChunk.data.subarray(
      originalStart,
      originalStart + originalView.byteLength,
    );
    const candidateBytes = candidate.binChunk.data.subarray(
      candidateStart,
      candidateStart + candidateView.byteLength,
    );
    if (
      originalView.byteLength !== candidateView.byteLength ||
      sha256(originalBytes) !== sha256(candidateBytes)
    ) {
      checks.nonTextureBufferViews = false;
      break;
    }
  }
  return { ...checks, ok: Object.values(checks).every(Boolean) };
}

function runBasisEncoder(executable, input, output, options) {
  const args = [
    '-ktx2',
    '-q',
    String(options.quality),
    '-comp_level',
    '2',
    options.alpha ? '-force_alpha' : '-no_alpha',
    '-no_multithreading',
  ];
  if (options.size) {
    args.push('-resample', String(options.size[0]), String(options.size[1]));
  }
  args.push('-file', input, '-output_file', output);
  const result = spawnSync(executable, args, { encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`Basis encoder failed:\n${result.stdout}\n${result.stderr}`);
  }
}

async function buildAtlasModel(spec, sharp, BASIS, basisEncoder) {
  const source = await readFile(spec.source);
  const parsed = parseGlb(source, spec.source);
  verifyExpectedScene(parsed.document);
  disableBlinkOverlay(parsed.document);
  const originalInvariant = invariantSnapshot(parsed.document);
  const embedded = getEmbeddedKtx2(parsed.document, parsed.binChunk);
  const decoded = await decodeKtx2(embedded.bytes, sharp, BASIS);

  const faceDonorCrop = await loadRgba(
    sharp,
    ATLAS_FACE_DONOR,
    ATLAS_FACE_CROP.width,
    ATLAS_FACE_CROP.height,
  );
  const faceDonor = cropIntoCanvas(
    faceDonorCrop,
    decoded.width,
    decoded.height,
    ATLAS_FACE_CROP,
  );
  const purple = await buildPurpleMask(
    sharp,
    decoded.rgba,
    decoded.width,
    decoded.height,
    ATLAS_PURPLE_REGION,
  );
  const faceRepairMask = await buildEllipseMask(
    sharp,
    decoded.width,
    decoded.height,
    ATLAS_FACE_REPAIR.center,
    ATLAS_FACE_REPAIR.radii,
  );
  const adjustment = estimateSkinAdjustment(
    decoded.rgba,
    faceDonor,
    faceRepairMask,
    decoded.width,
    decoded.height,
    { left: 840, top: 220, width: 300, height: 270 },
  );
  let edited = applyMaskedDonor(
    decoded.rgba,
    faceDonor,
    faceRepairMask,
    adjustment,
  );

  const laptopDonorCrop = await loadRgba(
    sharp,
    ATLAS_LAPTOP_DONOR,
    ATLAS_LOGO_CROP.width,
    ATLAS_LOGO_CROP.height,
  );
  const laptopDonor = cropIntoCanvas(
    laptopDonorCrop,
    decoded.width,
    decoded.height,
    ATLAS_LOGO_CROP,
  );
  const repairMask = await buildEllipseMask(
    sharp,
    decoded.width,
    decoded.height,
    ATLAS_LOGO.repairCenter,
    ATLAS_LOGO.repairRadii,
  );
  edited = applyMaskedDonor(edited, laptopDonor, repairMask);
  edited = await overlayBrandMark(
    sharp,
    edited,
    decoded.width,
    decoded.height,
    ATLAS_LOGO,
  );

  const atlasPng = await sharp(edited, {
    raw: { width: decoded.width, height: decoded.height, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(spec.atlas, atlasPng);
  const encodedKtx2 = path.join(outputDir, `.ai-teacher-${spec.id}.ktx2`);
  runBasisEncoder(basisEncoder, spec.atlas, encodedKtx2, {
    quality: 255,
    alpha: true,
  });
  const replacement = await readFile(encodedKtx2);
  const output = replaceEmbeddedKtx2(parsed, replacement);
  await writeFile(spec.output, output);
  await unlink(encodedKtx2);

  if (invariantSnapshot(parsed.document) !== originalInvariant) {
    throw new Error(`${spec.id}: scene graph changed while replacing the texture.`);
  }
  const reparsed = parseGlb(output, spec.output);
  const expected = parseGlb(source, spec.source);
  disableBlinkOverlay(expected.document);
  const checks = compareModelInvariants(
    expected,
    reparsed,
    embedded.viewIndex,
  );
  if (!checks.ok) {
    throw new Error(`${spec.id}: non-texture model invariants changed.`);
  }
  return {
    id: spec.id,
    source: path.relative(rootDir, spec.source),
    sourceBytes: source.length,
    sourceSha256: sha256(source),
    output: path.relative(rootDir, spec.output),
    outputBytes: output.length,
    outputSha256: sha256(output),
    atlas: path.relative(rootDir, spec.atlas),
    atlasSha256: sha256(atlasPng),
    purplePixels: purple.hardPixels,
    skinAdjustment: adjustment,
    blinkOverlayDetached: true,
    invariants: checks,
  };
}

async function buildFallback(spec, sharp, basisEncoder) {
  const source = await loadRgba(sharp, spec.source, spec.width, spec.height);
  const faceDonorCrop = await loadRgba(
    sharp,
    spec.faceDonor,
    spec.faceCrop.width,
    spec.faceCrop.height,
  );
  const faceDonor = cropIntoCanvas(
    faceDonorCrop,
    spec.width,
    spec.height,
    spec.faceCrop,
  );
  const purple = await buildPurpleMask(
    sharp,
    source,
    spec.width,
    spec.height,
    spec.purpleRegion,
  );
  const faceRepairMask = await buildEllipseMask(
    sharp,
    spec.width,
    spec.height,
    spec.faceRepair.center,
    spec.faceRepair.radii,
  );
  const adjustment = estimateSkinAdjustment(
    source,
    faceDonor,
    faceRepairMask,
    spec.width,
    spec.height,
    spec.purpleRegion,
  );
  let edited = applyMaskedDonor(
    source,
    faceDonor,
    faceRepairMask,
    adjustment,
  );
  if (spec.logo) {
    const surfaceDonor = await loadRgba(
      sharp,
      spec.donor,
      spec.width,
      spec.height,
    );
    const repairMask = await buildEllipseMask(
      sharp,
      spec.width,
      spec.height,
      spec.logo.repairCenter,
      spec.logo.repairRadii,
    );
    edited = applyMaskedDonor(edited, surfaceDonor, repairMask);
    edited = await overlayBrandMark(
      sharp,
      edited,
      spec.width,
      spec.height,
      spec.logo,
    );
  }

  const jpeg = await sharp(edited, {
    raw: { width: spec.width, height: spec.height, channels: 4 },
  })
    .flatten({ background: '#11151e' })
    .jpeg({ quality: 94, chromaSubsampling: '4:4:4', progressive: true })
    .toBuffer();
  await writeFile(spec.output, jpeg);
  runBasisEncoder(basisEncoder, spec.output, spec.optimized, {
    quality: spec.id === 'desktop' ? 255 : 160,
    alpha: false,
    size: spec.optimizedSize,
  });
  const optimized = await readFile(spec.optimized);
  return {
    id: spec.id,
    source: path.relative(rootDir, spec.source),
    donor: path.relative(rootDir, spec.faceDonor),
    output: path.relative(rootDir, spec.output),
    outputBytes: jpeg.length,
    outputSha256: sha256(jpeg),
    optimized: path.relative(rootDir, spec.optimized),
    optimizedBytes: optimized.length,
    optimizedSha256: sha256(optimized),
    dimensions: [spec.width, spec.height],
    optimizedDimensions: spec.optimizedSize,
    purplePixels: purple.hardPixels,
    skinAdjustment: adjustment,
  };
}

async function main() {
  await mkdir(outputDir, { recursive: true });
  for (const file of [
    ...MODEL_SPECS.map((spec) => spec.source),
    ...FALLBACK_SPECS.flatMap((spec) => [
      spec.source,
      spec.donor,
      spec.faceDonor,
    ]),
    ATLAS_FACE_DONOR,
    ATLAS_LAPTOP_DONOR,
    basisTranscoderPath,
    speakUpMarkPath,
  ]) {
    await access(file);
  }

  const toolkit = await findSharpToolkit();
  const toolkitRequire = createRequire(path.join(toolkit.root, 'package.json'));
  const sharp = toolkitRequire('sharp');
  const BASIS = createRequire(import.meta.url)(basisTranscoderPath);
  const basisEncoder = await findBasisEncoder();

  const models = [];
  for (const spec of MODEL_SPECS) {
    models.push(await buildAtlasModel(spec, sharp, BASIS, basisEncoder));
  }
  const fallbacks = [];
  for (const spec of FALLBACK_SPECS) {
    fallbacks.push(await buildFallback(spec, sharp, basisEncoder));
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    intent: {
      changed: [
        'Remove the purple eye mask while preserving the original eyes and identity.',
        'Replace the source laptop mark with the existing white SpeakUp mark.',
        'Detach the source eyelid mesh so the character remains naturally open-eyed.',
      ],
      preserved: [
        'Person, clothing, pose, scene, camera, lighting, star background, rings, geometry, UVs, and all non-eyelid motion.',
        'The original atlas alpha channel and every non-texture GLB bufferView.',
      ],
    },
    generatedDonors: {
      face: path.relative(rootDir, ATLAS_FACE_DONOR),
      laptop: path.relative(rootDir, ATLAS_LAPTOP_DONOR),
      desktop: path.relative(rootDir, FALLBACK_SPECS[0].donor),
      mobile: path.relative(rootDir, FALLBACK_SPECS[1].donor),
      method: 'OpenAI built-in image edit; only reviewed local regions are blended back through deterministic masks.',
    },
    models,
    fallbacks,
    toolkit: {
      sharpViaGltfTransform: toolkit.version,
      basisEncoder: 'basisu@1.16.3 ETC1S',
      basisDecoder: 'three@0.172.0 basis_transcoder',
    },
  };
  await writeFile(
    path.join(outputDir, 'build-manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  console.log(JSON.stringify(manifest, null, 2));
}

await main();
