import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const JSON_CHUNK = 0x4e4f534a;
const BIN_CHUNK = 0x004e4942;
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const logoPath = path.join(rootDir, 'assets/speakup/b2b/speakup-laptop-logo.png');
const manifestPath = path.join(rootDir, 'assets/speakup/b2b/b2b-logo-build-manifest.json');

const builds = [
  {
    source: 'assets/remote/editions-winter-2026.myshopify.com/cdn/shop/3d/models/o/73f4d9f62ba07f6e/EW26_B2B_251205v2_compressed-optimized.glb',
    output: 'assets/speakup/b2b/speakup-b2b-high.glb',
  },
  {
    source: 'assets/remote/editions-winter-2026.myshopify.com/cdn/shop/3d/models/o/c4626bed57ec9dff/B2B_fg_smaller_251127_compressed-optimizedv2.glb',
    output: 'assets/speakup/b2b/speakup-b2b-medium.glb',
  },
];

function align4(value) {
  return Math.ceil(value / 4) * 4;
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function addScaled(target, vector, amount) {
  target[0] += vector[0] * amount;
  target[1] += vector[1] * amount;
  target[2] += vector[2] * amount;
}

function createLogoGeometry() {
  const center = [0.193, 0.314, 0];
  const normal = [0.8573, -0.5148, 0];
  const right = [0, 0, -1];
  const up = [0.5148, 0.8573, 0];
  const halfSize = 0.12;
  addScaled(center, normal, 0.006);

  const positions = [];
  for (const [horizontal, vertical] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    const point = [...center];
    addScaled(point, right, horizontal * halfSize);
    addScaled(point, up, vertical * halfSize);
    positions.push(...point);
  }
  return {
    positions: new Float32Array(positions),
    normals: new Float32Array([
      ...normal, ...normal, ...normal, ...normal,
    ]),
    texcoords: new Float32Array([
      0, 1,
      1, 1,
      1, 0,
      0, 0,
    ]),
    indices: new Uint16Array([0, 1, 2, 0, 2, 3]),
    min: positions.reduce(
      (bounds, value, index) => {
        const axis = index % 3;
        bounds[axis] = Math.min(bounds[axis], value);
        return bounds;
      },
      [Infinity, Infinity, Infinity],
    ),
    max: positions.reduce(
      (bounds, value, index) => {
        const axis = index % 3;
        bounds[axis] = Math.max(bounds[axis], value);
        return bounds;
      },
      [-Infinity, -Infinity, -Infinity],
    ),
  };
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

function appendBuffer(document, outputBin, sourceBinLength, data, target) {
  const bytes = Buffer.isBuffer(data)
    ? data
    : Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  const byteOffset = align4(outputBin.length);
  const nextBin = Buffer.alloc(align4(byteOffset + bytes.length));
  outputBin.copy(nextBin);
  bytes.copy(nextBin, byteOffset);
  const bufferView = document.bufferViews.length;
  const definition = {
    buffer: 0,
    byteOffset,
    byteLength: bytes.length,
  };
  if (target) definition.target = target;
  document.bufferViews.push(definition);
  if (nextBin.subarray(0, sourceBinLength).compare(outputBin.subarray(0, sourceBinLength)) !== 0) {
    throw new Error('Original binary prefix changed while appending data.');
  }
  return { outputBin: nextBin, bufferView };
}

async function buildAsset(build, logoPng) {
  const sourcePath = path.join(rootDir, build.source);
  const outputPath = path.join(rootDir, build.output);
  const source = await readFile(sourcePath);
  const parsed = parseGlb(source);
  const sourceDocument = structuredClone(parsed.document);
  const geometry = createLogoGeometry();
  const sourceBinLength = parsed.binChunk.data.length;
  let outputBin = parsed.binChunk.data;

  const specs = [
    {
      key: 'position', data: geometry.positions, target: 34962,
      accessor: {
        componentType: 5126, count: 4, type: 'VEC3',
        min: geometry.min, max: geometry.max,
      },
    },
    {
      key: 'normal', data: geometry.normals, target: 34962,
      accessor: { componentType: 5126, count: 4, type: 'VEC3' },
    },
    {
      key: 'texcoord', data: geometry.texcoords, target: 34962,
      accessor: { componentType: 5126, count: 4, type: 'VEC2' },
    },
    {
      key: 'indices', data: geometry.indices, target: 34963,
      accessor: {
        componentType: 5123, count: 6, type: 'SCALAR', min: [0], max: [3],
      },
    },
  ];
  const accessors = {};
  for (const spec of specs) {
    const appended = appendBuffer(
      parsed.document,
      outputBin,
      sourceBinLength,
      spec.data,
      spec.target,
    );
    outputBin = appended.outputBin;
    accessors[spec.key] = parsed.document.accessors.length;
    parsed.document.accessors.push({ bufferView: appended.bufferView, ...spec.accessor });
  }
  const appendedLogo = appendBuffer(
    parsed.document,
    outputBin,
    sourceBinLength,
    logoPng,
  );
  outputBin = appendedLogo.outputBin;

  parsed.document.samplers ||= [];
  const samplerIndex = parsed.document.samplers.length;
  parsed.document.samplers.push({
    magFilter: 9729,
    minFilter: 9987,
    wrapS: 33071,
    wrapT: 33071,
  });
  const imageIndex = parsed.document.images.length;
  parsed.document.images.push({
    name: 'SpeakUp Two Commas Logo',
    mimeType: 'image/png',
    bufferView: appendedLogo.bufferView,
  });
  const textureIndex = parsed.document.textures.length;
  parsed.document.textures.push({ sampler: samplerIndex, source: imageIndex });
  const materialIndex = parsed.document.materials.length;
  parsed.document.materials.push({
    name: 'SpeakUp Laptop Logo',
    alphaMode: 'BLEND',
    doubleSided: false,
    pbrMetallicRoughness: {
      baseColorTexture: { index: textureIndex },
      metallicFactor: 0,
      roughnessFactor: 1,
    },
    extensions: { KHR_materials_unlit: {} },
  });
  const meshIndex = parsed.document.meshes.length;
  parsed.document.meshes.push({
    name: 'SpeakUp Laptop Logo',
    primitives: [{
      attributes: {
        POSITION: accessors.position,
        NORMAL: accessors.normal,
        TEXCOORD_0: accessors.texcoord,
      },
      indices: accessors.indices,
      material: materialIndex,
      mode: 4,
    }],
  });
  const logoNodeIndex = parsed.document.nodes.length;
  parsed.document.nodes.push({
    name: 'SpeakUp Laptop Logo',
    mesh: meshIndex,
  });
  const laptopLidIndex = parsed.document.nodes.findIndex((node) => node.name === 'Laptop.001');
  if (laptopLidIndex < 0) throw new Error('Missing Laptop.001 lid node.');
  parsed.document.nodes[laptopLidIndex].children ||= [];
  parsed.document.nodes[laptopLidIndex].children.push(logoNodeIndex);
  parsed.document.buffers[0].byteLength = outputBin.length;

  if (JSON.stringify(parsed.document.animations || []) !== JSON.stringify(sourceDocument.animations || [])) {
    throw new Error('Animation channels changed unexpectedly.');
  }
  if (JSON.stringify(parsed.document.skins || []) !== JSON.stringify(sourceDocument.skins || [])) {
    throw new Error('Skin definitions changed unexpectedly.');
  }
  for (const key of ['materials', 'meshes', 'images', 'textures', 'samplers', 'accessors', 'bufferViews']) {
    const original = sourceDocument[key] || [];
    if (JSON.stringify(parsed.document[key].slice(0, original.length)) !== JSON.stringify(original)) {
      throw new Error(`Original ${key} definitions changed unexpectedly.`);
    }
  }

  const output = encodeGlb(parsed.chunks, parsed.document, outputBin);
  const outputParsed = parseGlb(output);
  if (outputParsed.binChunk.data.subarray(0, sourceBinLength).compare(parsed.binChunk.data) !== 0) {
    throw new Error('Original binary geometry or texture data changed.');
  }
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, output);
  return {
    source: build.source,
    sourceSha256: sha256(source),
    output: build.output,
    outputSha256: sha256(output),
    logoNode: logoNodeIndex,
    laptopLidNode: laptopLidIndex,
    preservedAnimations: parsed.document.animations?.map((animation) => ({
      name: animation.name,
      channels: animation.channels.length,
      samplers: animation.samplers.length,
    })) || [],
    exactOriginalBinaryPrefix: true,
  };
}

const logoPng = await readFile(logoPath);
const manifest = { logo: path.relative(rootDir, logoPath), builds: [] };
for (const build of builds) {
  manifest.builds.push(await buildAsset(build, logoPng));
}
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(builds.map((build) => build.output).join('\n'));
