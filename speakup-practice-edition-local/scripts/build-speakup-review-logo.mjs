import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const JSON_CHUNK = 0x4e4f534a;
const BIN_CHUNK = 0x004e4942;
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const manifestPath = path.join(rootDir, 'assets/speakup/review/review-logo-build-manifest.json');

const builds = [
  {
    source: 'assets/remote/editions-winter-2026.myshopify.com/cdn/shop/3d/models/o/73f4d9f62ba07f6e/EW26_B2B_251205v2_compressed-optimized.glb',
    output: 'assets/speakup/review/speakup-review-high.glb',
  },
  {
    source: 'assets/remote/editions-winter-2026.myshopify.com/cdn/shop/3d/models/o/c4626bed57ec9dff/B2B_fg_smaller_251127_compressed-optimizedv2.glb',
    output: 'assets/speakup/review/speakup-review-medium.glb',
  },
];

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
  const totalLength = 12 + nextChunks.reduce((sum, chunk) => sum + 8 + chunk.data.length, 0);
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

async function buildAsset(build) {
  const sourcePath = path.join(rootDir, build.source);
  const outputPath = path.join(rootDir, build.output);
  const source = await readFile(sourcePath);
  const parsed = parseGlb(source);
  const originalNodeCount = parsed.document.nodes.length;
  const originalMeshes = JSON.stringify(parsed.document.meshes || []);
  const originalAnimations = JSON.stringify(parsed.document.animations || []);
  const originalSkins = JSON.stringify(parsed.document.skins || []);
  const hiddenMeshes = {};

  for (const name of ['Laptop', 'Laptop.001']) {
    const node = parsed.document.nodes.find((candidate) => candidate.name === name);
    if (!node || node.mesh === undefined) throw new Error(`Missing visible ${name} node.`);
    hiddenMeshes[name] = node.mesh;
    delete node.mesh;
  }

  if (parsed.document.nodes.length !== originalNodeCount) {
    throw new Error('Node graph changed unexpectedly.');
  }
  if (JSON.stringify(parsed.document.meshes || []) !== originalMeshes) {
    throw new Error('Mesh definitions changed unexpectedly.');
  }
  if (JSON.stringify(parsed.document.animations || []) !== originalAnimations) {
    throw new Error('Animation channels changed unexpectedly.');
  }
  if (JSON.stringify(parsed.document.skins || []) !== originalSkins) {
    throw new Error('Skin definitions changed unexpectedly.');
  }

  const output = encodeGlb(parsed.chunks, parsed.document, parsed.binChunk.data);
  const outputParsed = parseGlb(output);
  if (outputParsed.binChunk.data.compare(parsed.binChunk.data) !== 0) {
    throw new Error('Original binary geometry and texture data changed.');
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
    hiddenMeshes,
    preserved: {
      nodes: originalNodeCount,
      meshes: parsed.document.meshes.length,
      skins: parsed.document.skins?.length || 0,
      animations: parsed.document.animations?.map((animation) => ({
        name: animation.name,
        channels: animation.channels.length,
        samplers: animation.samplers.length,
      })) || [],
      exactOriginalBinary: true,
    },
  };
}

const manifest = { operation: 'remove laptop body, lid, and attached logo', builds: [] };
for (const build of builds) {
  manifest.builds.push(await buildAsset(build));
}
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(builds.map((build) => build.output).join('\n'));
