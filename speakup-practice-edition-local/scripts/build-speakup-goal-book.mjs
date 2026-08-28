import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const JSON_CHUNK = 0x4e4f534a;
const BIN_CHUNK = 0x004e4942;
const KHR_TEXTURE_BASISU = 'KHR_texture_basisu';
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const sourcePath = path.join(
  rootDir,
  'assets/remote/editions-winter-2026.myshopify.com/cdn/shop/3d/models/o/9567eaad495dfa3f/Rigged_Book_CS_Animated_V5_compressed-optimized.glb',
);
const outputPath = path.join(
  rootDir,
  'assets/speakup/goal/speakup-goal-book.glb',
);

const PAGE_SPECS = [
  {
    eyebrow: '01 · GOAL',
    title: 'Set the scene',
    accent: '#B85D47',
    icon: 'target',
    rows: [
      ['ROLE & STAKES', 'Who, when, and why'],
      ['SUCCESS LINE', 'What good sounds like'],
      ['HARD MOMENT', 'Prepare the follow-up'],
    ],
  },
  {
    eyebrow: '02 · DIALOGUE',
    title: 'Keep it moving',
    accent: '#24716D',
    icon: 'dialogue',
    rows: [
      ['OPEN', 'Start without a script'],
      ['RESPOND', 'Listen, then react'],
      ['CLARIFY', 'Ask one useful question'],
    ],
  },
  {
    eyebrow: '03 · PRACTICE',
    title: 'Speak it aloud',
    accent: '#C78C39',
    icon: 'microphone',
    rows: [
      ['WARM UP', 'Find the first sentence'],
      ['ROUND ONE', 'Say the whole thought'],
      ['ROUND TWO', 'Try the clearer version'],
    ],
  },
  {
    eyebrow: '04 · YOUR LINE',
    title: 'Say it clearly',
    accent: '#68739B',
    icon: 'waveform',
    rows: [
      ['POINT', 'Lead with the meaning'],
      ['REASON', 'Explain what matters'],
      ['ASK BACK', 'Keep the exchange alive'],
    ],
  },
  {
    eyebrow: '05 · FEEDBACK',
    title: 'Notice change',
    accent: '#9C5360',
    icon: 'feedback',
    rows: [
      ['PRONUNCIATION', 'Hear the exact word'],
      ['CLARITY', 'Make the idea easier'],
      ['NEXT TRY', 'Use one concrete fix'],
    ],
  },
  {
    eyebrow: '06 · MEMORY',
    title: 'Build on it',
    accent: '#4F6353',
    icon: 'memory',
    rows: [
      ['YOUR CONTEXT', 'Goals worth remembering'],
      ['REPEAT PATTERN', 'The block that returns'],
      ['NEXT SESSION', 'Continue, do not restart'],
    ],
  },
];

function align4(value) {
  return Math.ceil(value / 4) * 4;
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

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function renderPageIcon(type, x, y) {
  if (type === 'target') {
    return `
      <g transform="translate(${x} ${y})" fill="none" stroke="#F9F4E8" stroke-width="2.5">
        <circle r="17" opacity=".42"/><circle r="10"/><circle r="3" fill="#F9F4E8"/>
        <path d="M-23 0h10M13 0h10M0-23v10M0 13v10" stroke-linecap="round"/>
      </g>`;
  }
  if (type === 'dialogue') {
    return `
      <g transform="translate(${x - 20} ${y - 15})" fill="none" stroke="#F9F4E8" stroke-width="2.5" stroke-linejoin="round">
        <path d="M4 0h37a6 6 0 0 1 6 6v19a6 6 0 0 1-6 6H23L10 42l3-11H4a6 6 0 0 1-6-6V6A6 6 0 0 1 4 0Z"/>
        <path d="M9 11h27M9 19h18" stroke-linecap="round" opacity=".55"/>
      </g>`;
  }
  if (type === 'microphone') {
    return `
      <g transform="translate(${x} ${y})" fill="none" stroke="#F9F4E8" stroke-width="3" stroke-linecap="round">
        <rect x="-7" y="-18" width="14" height="29" rx="7"/>
        <path d="M-14 5a14 14 0 0 0 28 0M0 19v10M-8 29h16"/>
      </g>`;
  }
  if (type === 'waveform') {
    return `
      <g transform="translate(${x - 24} ${y})" fill="none" stroke="#F9F4E8" stroke-width="3" stroke-linecap="round">
        <path d="M0 5V-5M9 13v-26M18 8V-8M27 19v-38M36 11v-22M45 5V-5"/>
      </g>`;
  }
  if (type === 'feedback') {
    return `
      <g transform="translate(${x} ${y})" fill="none" stroke="#F9F4E8" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
        <circle r="18" opacity=".4"/><path d="m-9 1 6 6 13-15"/>
      </g>`;
  }
  return `
    <g transform="translate(${x} ${y})" fill="none" stroke="#F9F4E8" stroke-width="2.8" stroke-linecap="round">
      <path d="M-17 0c0-10 8-18 18-18 8 0 14 4 17 10M17 0c0 10-8 18-18 18-8 0-14-4-17-10"/>
      <path d="m12-13 7 5-8 3M-12 13l-7-5 8-3" stroke-linejoin="round"/>
    </g>`;
}

function renderMiniIcon(type, x, y, index) {
  if (type === 'dialogue') {
    return `<path d="M${x - 6} ${y - 5}h12a4 4 0 0 1 4 4v5a4 4 0 0 1-4 4h-5l-5 4 1-4h-3a4 4 0 0 1-4-4v-5a4 4 0 0 1 4-4Z" fill="none" stroke="#FFF" stroke-width="1.5"/>`;
  }
  if (type === 'microphone') {
    return `<g fill="none" stroke="#FFF" stroke-width="1.5" stroke-linecap="round"><rect x="${x - 3}" y="${y - 7}" width="6" height="11" rx="3"/><path d="M${x - 6} ${y + 1}a6 6 0 0 0 12 0M${x} ${y + 7}v4"/></g>`;
  }
  if (type === 'waveform') {
    return `<path d="M${x - 7} ${y}v-4M${x - 3} ${y + 4}v-12M${x + 1} ${y + 2}v-8M${x + 5} ${y + 5}v-14M${x + 9} ${y + 1}v-6" fill="none" stroke="#FFF" stroke-width="1.7" stroke-linecap="round"/>`;
  }
  if (type === 'feedback') {
    return `<path d="m${x - 7} ${y} 5 5 10-12" fill="none" stroke="#FFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  if (type === 'memory') {
    return `<path d="M${x - 7} ${y}a7 7 0 1 1 3 6M${x + 7} ${y}a7 7 0 1 1-3-6" fill="none" stroke="#FFF" stroke-width="1.5" stroke-linecap="round"/>`;
  }
  return `<g fill="none" stroke="#FFF" stroke-width="1.4"><circle cx="${x}" cy="${y}" r="8"/><circle cx="${x}" cy="${y}" r="3" fill="#FFF"/></g>`;
}

function renderPage(spec, index) {
  const column = index % 3;
  const row = Math.floor(index / 3);
  const x = column * 171;
  const y = row * 228;
  const cardX = x + 11;
  const cardWidth = 149;
  const cardYs = [y + 68, y + 111, y + 154];
  const rowMarkup = spec.rows
    .map(([label, detail], rowIndex) => {
      const cardY = cardYs[rowIndex];
      return `
        <g>
          <rect x="${cardX}" y="${cardY}" width="${cardWidth}" height="36" rx="7" fill="${spec.accent}"/>
          <rect x="${cardX + 7}" y="${cardY + 7}" width="22" height="22" rx="11" fill="#1D1814" fill-opacity=".18"/>
          ${renderMiniIcon(spec.icon, cardX + 18, cardY + 18, rowIndex)}
          <text x="${cardX + 37}" y="${cardY + 15}" fill="#FFF" font-family="Arial, Helvetica, sans-serif" font-size="7.2" font-weight="700" letter-spacing=".55">${escapeXml(label)}</text>
          <text x="${cardX + 37}" y="${cardY + 27}" fill="#FFF" fill-opacity=".86" font-family="Arial, Helvetica, sans-serif" font-size="6.1">${escapeXml(detail)}</text>
        </g>`;
    })
    .join('');

  return `
    <g>
      <rect x="${x + 1}" y="${y + 1}" width="169" height="225" fill="#F3EDDF" stroke="#8B8272" stroke-width="1"/>
      <rect x="${x + 5}" y="${y + 5}" width="161" height="217" fill="url(#paperGrain)" opacity=".55"/>
      <text x="${x + 11}" y="${y + 18}" fill="#4B4439" font-family="Arial, Helvetica, sans-serif" font-size="7.5" font-weight="700" letter-spacing="1.1">${escapeXml(spec.eyebrow)}</text>
      <text x="${x + 11}" y="${y + 47}" fill="#2D2923" font-family="Georgia, Times, serif" font-size="17" font-weight="700" letter-spacing="-.3">${escapeXml(spec.title)}</text>
      ${renderPageIcon(spec.icon, x + 142, y + 38)}
      ${rowMarkup}
      <path d="M${x + 11} ${y + 202}h149" stroke="#8B8272" stroke-opacity=".42"/>
      <text x="${x + 11}" y="${y + 218}" fill="#4B4439" font-family="Georgia, Times, serif" font-size="10" font-style="italic">SpeakUp</text>
      <text x="${x + 151}" y="${y + 218}" fill="#4B4439" font-family="Arial, Helvetica, sans-serif" font-size="6" text-anchor="end">PRACTICE EDITION</text>
    </g>`;
}

function renderAtlasSvg() {
  const pages = PAGE_SPECS.map(renderPage).join('');
  const paperLines = Array.from(
    { length: 14 },
    (_, index) =>
      `<path d="M0 ${460 + index * 3.5}h512" stroke="#8E887E" stroke-opacity="${index % 3 === 0 ? '.34' : '.16'}"/>`,
  ).join('');
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
      <defs>
        <pattern id="paperGrain" width="11" height="11" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="3" r=".5" fill="#FFF" opacity=".5"/>
          <circle cx="9" cy="8" r=".45" fill="#564D40" opacity=".22"/>
          <path d="M0 10 10 0" stroke="#FFF" stroke-width=".3" opacity=".26"/>
        </pattern>
      </defs>
      <rect width="512" height="512" fill="#DDD8CE"/>
      ${pages}
      <rect y="456" width="512" height="56" fill="#D7D3CB"/>
      ${paperLines}
    </svg>`;
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
  return { chunks, jsonChunk, binChunk, document };
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

const toolkit = await findSharpToolkit();
const toolkitRequire = createRequire(path.join(toolkit.root, 'package.json'));
const sharp = toolkitRequire('sharp');
const atlasPng = await sharp(Buffer.from(renderAtlasSvg()))
  .png({ compressionLevel: 9, palette: true, colours: 256 })
  .toBuffer();

const source = await readFile(sourcePath);
const { chunks, binChunk, document } = parseGlb(source);
const sceneAnimation = document.animations?.find(
  (animation) => animation.name === 'Scene',
);
if (
  document.nodes?.length !== 103 ||
  document.skins?.length !== 6 ||
  !sceneAnimation ||
  sceneAnimation.channels?.length !== 270 ||
  sceneAnimation.samplers?.length !== 270
) {
  throw new Error('Unexpected book node, skin, or Scene animation structure.');
}
if (
  document.materials?.length !== 1 ||
  document.materials[0].name !== 'Catalogue' ||
  document.images?.length !== 1 ||
  document.textures?.length !== 1
) {
  throw new Error('Expected one Catalogue material and one atlas texture.');
}

const image = document.images[0];
const imageViewIndex = image.bufferView;
if (
  imageViewIndex === undefined ||
  document.accessors?.some((accessor) => accessor.bufferView === imageViewIndex)
) {
  throw new Error('The source atlas bufferView is missing or shared with geometry.');
}

const originalStructure = JSON.stringify({
  nodes: document.nodes,
  skins: document.skins,
  animations: document.animations,
  scenes: document.scenes,
});
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
  name: 'SpeakUp Goal Book Atlas',
  extras: { originalWidth: 512, originalHeight: 512 },
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
for (const key of ['extensionsUsed', 'extensionsRequired']) {
  if (!document[key]) continue;
  document[key] = document[key].filter(
    (extension) => extension !== KHR_TEXTURE_BASISU,
  );
  if (document[key].length === 0) delete document[key];
}

if (
  JSON.stringify({
    nodes: document.nodes,
    skins: document.skins,
    animations: document.animations,
    scenes: document.scenes,
  }) !== originalStructure
) {
  throw new Error('Book nodes, skins, scenes, or animation data changed.');
}

const encodedJson = Buffer.from(JSON.stringify(document));
const nextJson = Buffer.concat([
  encodedJson,
  Buffer.alloc(align4(encodedJson.length) - encodedJson.length, 0x20),
]);
let nextChunks = replaceChunk(chunks, JSON_CHUNK, nextJson);
nextChunks = replaceChunk(nextChunks, BIN_CHUNK, nextBin);
const output = encodeGlb(nextChunks);

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, output);

const duration = Math.max(
  ...sceneAnimation.samplers.map(
    (sampler) => document.accessors[sampler.input].max?.[0] || 0,
  ),
);
console.log(
  `Created ${path.relative(rootDir, outputPath)} (${output.length} bytes)`,
);
console.log(
  `Preserved Scene: ${sceneAnimation.channels.length} channels, ${sceneAnimation.samplers.length} samplers, ${duration.toFixed(3)}s`,
);
console.log(
  `Preserved book rig: ${document.nodes.length} nodes, ${document.skins.length} skins; replaced only the 512x512 Catalogue atlas`,
);
console.log(`Image toolkit: sharp via glTF-Transform ${toolkit.version}`);
