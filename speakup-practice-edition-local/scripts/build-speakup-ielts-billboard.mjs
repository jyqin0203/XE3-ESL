import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const JSON_CHUNK = 0x4e4f534a;
const BIN_CHUNK = 0x004e4942;
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const outputDir = path.join(rootDir, 'assets/speakup/ielts');
const sourceGlbPath = path.join(
  rootDir,
  'assets/remote/editions-winter-2026.myshopify.com/cdn/shop/3d/models/o/2e684892a34b58b8/EW26_Marketing_251209v4_compressed-optimized.glb',
);
const billboardGeometryGlbPath = path.join(
  rootDir,
  'assets/remote/editions-winter-2026.myshopify.com/cdn/shop/3d/models/o/572da57473b77962/Marketing_fg_smaller_251127_compressed-optimized.glb',
);
const sourceImagePath = path.join(outputDir, 'ielts-billboard-source.png');
const posterPath = path.join(outputDir, 'ielts-billboard-static.jpg');
const outputGlbPath = path.join(outputDir, 'speakup-ielts-scene.glb');
const manifestPath = path.join(outputDir, 'billboard-build-manifest.json');

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

await mkdir(outputDir, { recursive: true });
const posterResult = spawnSync(
  'ffmpeg',
  [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-i', sourceImagePath,
    '-vf', 'crop=iw:iw*239/512:0:(ih-iw*239/512)/2,scale=1024:478',
    '-frames:v', '1',
    '-q:v', '2',
    posterPath,
  ],
  { stdio: 'inherit' },
);
if (posterResult.status !== 0) throw new Error('Failed to build billboard poster.');

const sourceGlb = await readFile(sourceGlbPath);
const billboardGeometryGlb = await readFile(billboardGeometryGlbPath);
const poster = await readFile(posterPath);
const parsed = parseGlb(sourceGlb);
const billboardParsed = parseGlb(billboardGeometryGlb);
const { document } = parsed;
const originalCounts = Object.fromEntries(
  ['nodes', 'meshes', 'materials', 'textures', 'images', 'accessors', 'bufferViews'].map(
    (key) => [key, document[key].length],
  ),
);
const originalPrefixes = Object.fromEntries(
  Object.keys(originalCounts).map((key) => [key, JSON.stringify(document[key])]),
);
const originalSceneNodes = [...document.scenes[0].nodes];
const overlaySourceNode = billboardParsed.document.nodes.find(
  (node) => node.name === 'Marketing Billboard',
);
const overlaySourceMesh = billboardParsed.document.meshes[overlaySourceNode?.mesh];
const overlaySourcePrimitive = overlaySourceMesh?.primitives?.[0];
if (!overlaySourceNode || !overlaySourceMesh || !overlaySourcePrimitive) {
  throw new Error('Expected standalone IELTS billboard geometry from the reviewed source.');
}
const sourceDracoBufferViewIndex =
  overlaySourcePrimitive.extensions?.KHR_draco_mesh_compression?.bufferView;
const sourceDracoBufferView = billboardParsed.document.bufferViews[sourceDracoBufferViewIndex];
if (!sourceDracoBufferView) throw new Error('Expected compressed billboard geometry.');
const sourceDracoBytes = billboardParsed.binChunk.data.subarray(
  sourceDracoBufferView.byteOffset || 0,
  (sourceDracoBufferView.byteOffset || 0) + sourceDracoBufferView.byteLength,
);

const geometryOffset = align4(parsed.binChunk.data.length);
const posterOffset = align4(geometryOffset + sourceDracoBytes.length);
const nextBinLength = align4(posterOffset + poster.length);
const nextBin = Buffer.alloc(nextBinLength);
parsed.binChunk.data.copy(nextBin);
sourceDracoBytes.copy(nextBin, geometryOffset);
poster.copy(nextBin, posterOffset);
const geometryBufferViewIndex = document.bufferViews.length;
document.bufferViews.push({
  buffer: 0,
  byteOffset: geometryOffset,
  byteLength: sourceDracoBytes.length,
});
const posterBufferViewIndex = document.bufferViews.length;
document.bufferViews.push({
  buffer: 0,
  byteOffset: posterOffset,
  byteLength: poster.length,
});
const imageIndex = document.images.length;
document.images.push({
  name: 'SpeakUp IELTS Billboard',
  mimeType: 'image/jpeg',
  bufferView: posterBufferViewIndex,
});
const sourceOverlayMaterial =
  billboardParsed.document.materials[overlaySourcePrimitive.material];
const sourceOverlayTextureIndex =
  sourceOverlayMaterial?.pbrMetallicRoughness?.baseColorTexture?.index;
const sourceOverlayTexture = billboardParsed.document.textures[sourceOverlayTextureIndex];
const sourceOverlaySampler = billboardParsed.document.samplers[sourceOverlayTexture?.sampler];
if (!sourceOverlayMaterial || !sourceOverlayTexture || !sourceOverlaySampler) {
  throw new Error('Expected standalone billboard material and sampler.');
}
let samplerIndex = document.samplers.findIndex(
  (sampler) => JSON.stringify(sampler) === JSON.stringify(sourceOverlaySampler),
);
if (samplerIndex < 0) {
  samplerIndex = document.samplers.length;
  document.samplers.push(structuredClone(sourceOverlaySampler));
}
const textureIndex = document.textures.length;
document.textures.push({
  sampler: samplerIndex,
  source: imageIndex,
});
const billboardMaterial = structuredClone(sourceOverlayMaterial);
billboardMaterial.name = 'SpeakUp IELTS Billboard';
billboardMaterial.pbrMetallicRoughness = {
  ...billboardMaterial.pbrMetallicRoughness,
  baseColorTexture: {
    ...billboardMaterial.pbrMetallicRoughness.baseColorTexture,
    index: textureIndex,
  },
};
const materialIndex = document.materials.length;
document.materials.push(billboardMaterial);
if (!document.extensionsUsed.includes('KHR_materials_unlit')) {
  document.extensionsUsed.push('KHR_materials_unlit');
}

const accessorIndexMap = new Map();
function copyOverlayAccessor(sourceIndex) {
  if (accessorIndexMap.has(sourceIndex)) return accessorIndexMap.get(sourceIndex);
  const outputIndex = document.accessors.length;
  const accessor = structuredClone(billboardParsed.document.accessors[sourceIndex]);
  if (accessor.bufferView !== undefined) {
    throw new Error('Expected Draco-only billboard accessors.');
  }
  document.accessors.push(accessor);
  accessorIndexMap.set(sourceIndex, outputIndex);
  return outputIndex;
}

const overlayPrimitive = structuredClone(overlaySourcePrimitive);
overlayPrimitive.indices = copyOverlayAccessor(overlaySourcePrimitive.indices);
overlayPrimitive.attributes = Object.fromEntries(
  Object.entries(overlaySourcePrimitive.attributes).map(([semantic, sourceIndex]) => [
    semantic,
    copyOverlayAccessor(sourceIndex),
  ]),
);
overlayPrimitive.material = materialIndex;
overlayPrimitive.extensions.KHR_draco_mesh_compression.bufferView =
  geometryBufferViewIndex;
const meshIndex = document.meshes.length;
document.meshes.push({
  ...structuredClone(overlaySourceMesh),
  name: 'SpeakUp IELTS Billboard',
  primitives: [overlayPrimitive],
});
const nodeIndex = document.nodes.length;
const overlayNode = {
  ...structuredClone(overlaySourceNode),
  name: 'SpeakUp IELTS Billboard',
  mesh: meshIndex,
};
overlayNode.translation = [...overlayNode.translation];
overlayNode.translation[2] += 0.03;
document.nodes.push(overlayNode);
document.scenes[0].nodes.push(nodeIndex);
document.buffers[0].byteLength = nextBin.length;

for (const [key, count] of Object.entries(originalCounts)) {
  if (JSON.stringify(document[key].slice(0, count)) !== originalPrefixes[key]) {
    throw new Error(`Billboard overlay changed original ${key}.`);
  }
}
if (
  JSON.stringify(document.scenes[0].nodes.slice(0, originalSceneNodes.length)) !==
  JSON.stringify(originalSceneNodes)
) {
  throw new Error('Billboard overlay changed original scene roots.');
}

const outputGlb = encodeGlb(parsed.chunks, document, nextBin);
const outputParsed = parseGlb(outputGlb);
const outputDocument = outputParsed.document;
if (
  outputParsed.binChunk.data.subarray(0, parsed.binChunk.data.length)
    .compare(parsed.binChunk.data) !== 0 ||
  outputParsed.binChunk.data.subarray(geometryOffset, geometryOffset + sourceDracoBytes.length)
    .compare(sourceDracoBytes) !== 0 ||
  outputDocument.images[imageIndex].mimeType !== 'image/jpeg' ||
  outputDocument.textures[textureIndex].source !== imageIndex ||
  outputDocument.meshes[meshIndex].primitives[0].material !== materialIndex ||
  outputDocument.nodes[nodeIndex].mesh !== meshIndex ||
  outputDocument.scenes[0].nodes.at(-1) !== nodeIndex
) {
  throw new Error('Encoded billboard GLB failed verification.');
}

await writeFile(outputGlbPath, outputGlb);
await writeFile(
  manifestPath,
  `${JSON.stringify({
    sourceGlb: path.relative(rootDir, sourceGlbPath),
    sourceGlbSha256: sha256(sourceGlb),
    billboardGeometryGlb: path.relative(rootDir, billboardGeometryGlbPath),
    billboardGeometryGlbSha256: sha256(billboardGeometryGlb),
    sourceImage: path.relative(rootDir, sourceImagePath),
    sourceImageSha256: sha256(await readFile(sourceImagePath)),
    poster: path.relative(rootDir, posterPath),
    posterSha256: sha256(poster),
    outputGlb: path.relative(rootDir, outputGlbPath),
    outputGlbSha256: sha256(outputGlb),
    preserved: {
      originalNodes: originalCounts.nodes,
      originalMeshes: originalCounts.meshes,
      originalMaterials: originalCounts.materials,
      originalScenes: document.scenes.length,
      exactOriginalCollectionPrefixes: true,
      exactOriginalBinaryPrefix: true,
      addedBillboardOverlayNode: 'SpeakUp IELTS Billboard',
    },
  }, null, 2)}\n`,
);
console.log(path.relative(rootDir, outputGlbPath));
