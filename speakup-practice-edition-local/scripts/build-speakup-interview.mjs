import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const JSON_CHUNK = 0x4e4f534a;
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const outputDir = path.join(rootDir, 'assets/speakup/interview');

const models = [
  {
    id: 'environment',
    source: path.join(
      rootDir,
      'assets/remote/editions-winter-2026.myshopify.com/cdn/shop/3d/models/o/9eeb64e8194faa39/POS_V53_environment_251209v2_compressed-optimized.glb',
    ),
    output: path.join(outputDir, 'speakup-interview-environment.glb'),
    remove: new Set(['env-exterior', 'env-interior']),
  },
  {
    id: 'hub',
    source: path.join(
      rootDir,
      'assets/remote/editions-winter-2026.myshopify.com/cdn/shop/3d/models/o/e51a31d48a973f83/POS_v53_Hub_251208v2_compressed-optimized.glb',
    ),
    output: path.join(outputDir, 'speakup-interview-hub.glb'),
    removeAllMeshes: true,
  },
  {
    id: 'middle-ground',
    source: path.join(
      rootDir,
      'assets/remote/editions-winter-2026.myshopify.com/cdn/shop/3d/models/o/2f9637a8c00c276d/Retail_mg_251205v2_compressed-optimized.glb',
    ),
    output: path.join(outputDir, 'speakup-interview-middle.glb'),
    removeAllMeshes: true,
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
    throw new Error('Expected a GLB 2.0 file.');
  }

  const chunks = [];
  let offset = 12;
  while (offset < source.length) {
    const byteLength = source.readUInt32LE(offset);
    const type = source.readUInt32LE(offset + 4);
    const data = source.subarray(offset + 8, offset + 8 + byteLength);
    chunks.push({ type, data });
    offset += 8 + byteLength;
  }

  const jsonChunk = chunks.find((chunk) => chunk.type === JSON_CHUNK);
  if (!jsonChunk) throw new Error('Missing GLB JSON chunk.');
  const document = JSON.parse(
    jsonChunk.data.toString('utf8').replace(/[\u0000 ]+$/u, ''),
  );
  return { chunks, document };
}

function encodeGlb(chunks, document) {
  const json = Buffer.from(JSON.stringify(document));
  const paddedJson = Buffer.alloc(align4(json.length), 0x20);
  json.copy(paddedJson);
  const nextChunks = chunks.map((chunk) =>
    chunk.type === JSON_CHUNK ? { type: chunk.type, data: paddedJson } : chunk,
  );
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

async function buildModel(spec) {
  const source = await readFile(spec.source);
  const { chunks, document } = parseGlb(source);
  const nodesWithMeshes = document.nodes
    .map((node, index) => ({ index, node }))
    .filter(({ node }) => node.mesh !== undefined);
  const targets = spec.removeAllMeshes
    ? nodesWithMeshes
    : nodesWithMeshes.filter(({ node }) => spec.remove.has(node.name));

  if (!targets.length || (!spec.removeAllMeshes && targets.length !== spec.remove.size)) {
    throw new Error(`${spec.id}: reviewed mesh targets were not found.`);
  }

  for (const { node } of targets) {
    delete node.mesh;
    delete node.skin;
  }

  const output = encodeGlb(chunks, document);
  await writeFile(spec.output, output);
  const reparsed = parseGlb(output).document;
  const remainingVisibleNodes = reparsed.nodes.filter((node) => node.mesh !== undefined);
  return {
    id: spec.id,
    source: path.relative(rootDir, spec.source),
    output: path.relative(rootDir, spec.output),
    sourceSha256: sha256(source),
    outputSha256: sha256(output),
    removedMeshNodes: targets.map(({ node }) => node.name),
    remainingVisibleNodes: remainingVisibleNodes.map((node) => node.name),
    preserved: {
      nodes: document.nodes.length,
      animations: document.animations?.map((animation) => ({
        name: animation.name,
        channels: animation.channels.length,
        samplers: animation.samplers.length,
      })) || [],
    },
  };
}

await mkdir(outputDir, { recursive: true });
const manifest = {
  purpose: 'Remove unrelated source merchandise while preserving the authored interview camera and timeline.',
  models: [],
};
for (const model of models) manifest.models.push(await buildModel(model));
await writeFile(
  path.join(outputDir, 'build-manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
console.log(JSON.stringify(manifest, null, 2));
