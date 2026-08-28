import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const JSON_CHUNK = 0x4e4f534a;
const BIN_CHUNK = 0x004e4942;
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');

const hairStyles = {
  workplace: {
    name: 'SpeakUp Workplace Hair',
    center: [0.145, 0.69, 0.065],
    axisA: [1, 0, 0],
    axisB: [0, 0, 1],
    up: [0, 1, 0],
    radii: [0.345, 0.325, 0.292],
    frontPhi: Math.PI / 2,
    thetaBase: 1.76,
    partLift: 0.28,
    edgeWave: 0.035,
    ridgeAmplitude: 0.012,
    ridgeCount: 20,
    color: [0.58, 0.235, 0.075],
    highlight: [0.78, 0.39, 0.14],
    shadow: [0.27, 0.075, 0.025],
    emissive: [0.035, 0.012, 0.003],
    joint: 3,
  },
  feedback: {
    name: 'SpeakUp Feedback Hair',
    center: [0.095, 0.018, 0.19],
    axisA: [1, 0, 0],
    axisB: [0, 1, 0],
    up: [0, 0, -1],
    radii: [0.575, 0.555, 0.545],
    frontPhi: Math.PI,
    thetaBase: 1.7,
    partLift: 0.23,
    edgeWave: 0.03,
    ridgeAmplitude: 0.018,
    ridgeCount: 18,
    color: [0.68, 0.48, 0.16],
    highlight: [0.9, 0.72, 0.31],
    shadow: [0.32, 0.2, 0.055],
    emissive: [0.035, 0.025, 0.006],
  },
};

const builds = [
  {
    source: 'assets/remote/editions-winter-2026.myshopify.com/cdn/shop/3d/models/o/f889c7c758e60536/EW26_Checkout_251209_compressed-optimized.glb',
    output: 'assets/speakup/workplace/speakup-workplace-scene.glb',
    manifest: 'assets/speakup/workplace/workplace-build-manifest.json',
    hiddenMeshes: [
      'Checkout',
      'Checkout Eyes',
      'checkout-hand',
      'checkout-hat',
      'checkout-card',
      'shiny-cardchip',
    ],
  },
  {
    source: 'assets/remote/editions-winter-2026.myshopify.com/cdn/shop/3d/models/o/7aca351ff49a1198/Checkout_fg_smaller_251127_compressed-optimized.glb',
    output: 'assets/speakup/workplace/speakup-workplace-foreground.glb',
    manifest: 'assets/speakup/workplace/workplace-build-manifest.json',
    hiddenMeshes: [
      'Checkout',
      'Checkout Eyes',
      'checkout-hand',
      'checkout-card',
    ],
  },
  {
    source: 'assets/remote/editions-winter-2026.myshopify.com/cdn/shop/3d/models/o/3ffd3b2a5abbe541/EW26_ShopApp_251208v3_compressed-optimized.glb',
    output: 'assets/speakup/feedback-scene/speakup-feedback-high.glb',
    manifest: 'assets/speakup/feedback-scene/feedback-build-manifest.json',
    hiddenMeshes: [
      'Woman and Horse',
      'Horse-eye',
      'Arm',
      'checkout-hand.001',
      'shopappphone',
      'ShopAppCap',
    ],
  },
  {
    source: 'assets/remote/editions-winter-2026.myshopify.com/cdn/shop/3d/models/o/f10427420c475b24/EW26_ShopApp_251128v2_compressed-optimized.glb',
    output: 'assets/speakup/feedback-scene/speakup-feedback-medium.glb',
    manifest: 'assets/speakup/feedback-scene/feedback-build-manifest.json',
    hiddenMeshes: [
      'Woman and Horse',
      'Horse-eye',
      'Arm',
      'checkout-hand.001',
      'shopappphone',
      'ShopAppCap',
    ],
  },
];

function align4(value) {
  return Math.ceil(value / 4) * 4;
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function addScaled(target, vector, scale) {
  target[0] += vector[0] * scale;
  target[1] += vector[1] * scale;
  target[2] += vector[2] * scale;
}

function normalize(vector) {
  const length = Math.hypot(...vector) || 1;
  return vector.map((value) => value / length);
}

function wrappedAngle(value) {
  return Math.atan2(Math.sin(value), Math.cos(value));
}

function mixColor(from, to, amount) {
  return from.map((value, index) => value + (to[index] - value) * amount);
}

function createHairMaterial(style) {
  return {
    name: style.name,
    doubleSided: true,
    pbrMetallicRoughness: {
      baseColorFactor: [1, 1, 1, 1],
      metallicFactor: 0,
      roughnessFactor: 1,
    },
    emissiveFactor: style.emissive,
    extras: {
      speakupReplacement: 'sculpted-hair',
    },
  };
}

function createHairGeometry(style) {
  const radialSegments = 64;
  const rings = 20;
  const positions = [];
  const normals = [];
  const colors = [];
  const joints = [];
  const weights = [];
  const indices = [];

  function thetaMaxAt(phi) {
    const frontDistance = Math.abs(wrappedAngle(phi - style.frontPhi));
    const frontWeight = Math.exp(-((frontDistance / 0.72) ** 2));
    const centerPart = Math.exp(-((frontDistance / 0.25) ** 2));
    const irregularEdge = style.edgeWave * (
      Math.sin(phi * 3.1 + 0.4) + 0.45 * Math.sin(phi * 7.3 - 0.8)
    );
    return style.thetaBase - style.partLift * centerPart * frontWeight + irregularEdge;
  }

  function surfacePoint(theta, phi) {
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);
    const direction = [0, 0, 0];
    addScaled(direction, style.axisA, sinTheta * Math.cos(phi) / style.radii[0]);
    addScaled(direction, style.axisB, sinTheta * Math.sin(phi) / style.radii[2]);
    addScaled(direction, style.up, cosTheta / style.radii[1]);
    const normal = normalize(direction);

    const fromPart = Math.abs(wrappedAngle(phi - style.frontPhi));
    const frontPart = Math.exp(-((fromPart / 0.085) ** 2));
    const strandWave = 0.5 + 0.5 * Math.cos(
      style.ridgeCount * wrappedAngle(phi - style.frontPhi) + theta * 2.3,
    );
    const ridge = style.ridgeAmplitude * strandWave * Math.sin(theta) ** 1.35;
    const groove = style.ridgeAmplitude * 1.2 * frontPart * clamp((theta - 0.18) / 1.05);

    const position = [...style.center];
    addScaled(position, style.axisA, style.radii[0] * sinTheta * Math.cos(phi));
    addScaled(position, style.axisB, style.radii[2] * sinTheta * Math.sin(phi));
    addScaled(position, style.up, style.radii[1] * cosTheta);
    addScaled(position, normal, ridge - groove);
    return { position, normal, frontPart };
  }

  for (let ring = 0; ring <= rings; ring += 1) {
    const t = ring / rings;
    for (let segment = 0; segment <= radialSegments; segment += 1) {
      const phi = (segment / radialSegments) * Math.PI * 2;
      const thetaMax = thetaMaxAt(phi);
      const theta = thetaMax * t;
      const point = surfacePoint(theta, phi);

      positions.push(...point.position);
      normals.push(...point.normal);

      const flow = 0.5 + 0.5 * Math.cos(
        style.ridgeCount * wrappedAngle(phi - style.frontPhi) + theta * 2.3,
      );
      const highlightAmount = 0.08 + 0.58 * flow;
      const shadowAmount = 0.28 * point.frontPart * clamp((theta - 0.16) / 0.8);
      let tone = mixColor(style.color, style.highlight, highlightAmount);
      tone = mixColor(tone, style.shadow, shadowAmount);
      colors.push(...tone.map((value) => clamp(value)), 1);

      if (style.joint !== undefined) {
        joints.push(style.joint, 0, 0, 0);
        weights.push(1, 0, 0, 0);
      }
    }
  }

  const stride = radialSegments + 1;
  for (let ring = 0; ring < rings; ring += 1) {
    for (let segment = 0; segment < radialSegments; segment += 1) {
      const topLeft = ring * stride + segment;
      const bottomLeft = (ring + 1) * stride + segment;
      indices.push(
        topLeft,
        bottomLeft,
        topLeft + 1,
        topLeft + 1,
        bottomLeft,
        bottomLeft + 1,
      );
    }
  }

  // Raised, tapered ribbons break the cap into readable locks while the fitted
  // shell beneath them keeps the original hidden scalp fully covered.
  for (const side of [-1, 1]) {
    for (let lock = 0; lock < 7; lock += 1) {
      const centerPhi = style.frontPhi + side * (0.14 + lock * 0.19);
      const halfWidth = 0.035 + 0.006 * (lock % 3);
      const lockSegments = 14;
      const startIndex = positions.length / 3;
      for (let step = 0; step <= lockSegments; step += 1) {
        const t = step / lockSegments;
        const theta = 0.2 + (thetaMaxAt(centerPhi) - 0.2) * t;
        const lift = style.ridgeAmplitude * (0.55 + 0.95 * Math.sin(Math.PI * t));
        for (const edge of [-1, 1]) {
          const point = surfacePoint(theta, centerPhi + edge * halfWidth);
          addScaled(point.position, point.normal, lift);
          positions.push(...point.position);
          normals.push(...point.normal);
          const alternating = lock % 2 === 0 ? 0.52 : 0.36;
          let tone = mixColor(style.color, style.highlight, alternating * (1 - 0.2 * t));
          if (lock % 3 === 2) tone = mixColor(tone, style.shadow, 0.12);
          colors.push(...tone.map((value) => clamp(value)), 1);
          if (style.joint !== undefined) {
            joints.push(style.joint, 0, 0, 0);
            weights.push(1, 0, 0, 0);
          }
        }
      }
      for (let step = 0; step < lockSegments; step += 1) {
        const left = startIndex + step * 2;
        indices.push(left, left + 2, left + 1, left + 1, left + 2, left + 3);
      }
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    colors: new Float32Array(colors),
    joints: style.joint === undefined ? null : new Uint8Array(joints),
    weights: style.joint === undefined ? null : new Float32Array(weights),
    indices: new Uint16Array(indices),
    vertexCount: positions.length / 3,
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

function createBufferSpecs(geometry) {
  const positionMin = [Infinity, Infinity, Infinity];
  const positionMax = [-Infinity, -Infinity, -Infinity];
  for (let index = 0; index < geometry.positions.length; index += 3) {
    for (let axis = 0; axis < 3; axis += 1) {
      positionMin[axis] = Math.min(positionMin[axis], geometry.positions[index + axis]);
      positionMax[axis] = Math.max(positionMax[axis], geometry.positions[index + axis]);
    }
  }
  const specs = [
    {
      key: 'position', data: geometry.positions, target: 34962,
      accessor: {
        componentType: 5126, count: geometry.vertexCount, type: 'VEC3',
        min: positionMin, max: positionMax,
      },
    },
    {
      key: 'normal', data: geometry.normals, target: 34962,
      accessor: { componentType: 5126, count: geometry.vertexCount, type: 'VEC3' },
    },
    {
      key: 'color', data: geometry.colors, target: 34962,
      accessor: { componentType: 5126, count: geometry.vertexCount, type: 'VEC4' },
    },
  ];
  if (geometry.joints) {
    specs.push(
      {
        key: 'joints', data: geometry.joints, target: 34962,
        accessor: { componentType: 5121, count: geometry.vertexCount, type: 'VEC4' },
      },
      {
        key: 'weights', data: geometry.weights, target: 34962,
        accessor: { componentType: 5126, count: geometry.vertexCount, type: 'VEC4' },
      },
    );
  }
  specs.push({
    key: 'indices', data: geometry.indices, target: 34963,
    accessor: {
      componentType: 5123, count: geometry.indices.length, type: 'SCALAR',
      min: [0], max: [geometry.vertexCount - 1],
    },
  });
  return specs;
}

function appendHair(parsed, nodeName, styleName) {
  const style = hairStyles[styleName];
  const hairNode = parsed.document.nodes.find((candidate) => candidate.name === nodeName);
  if (!style || !hairNode || hairNode.mesh === undefined) {
    throw new Error(`Missing hair source ${nodeName}.`);
  }
  const sourceHatMesh = hairNode.mesh;
  const geometry = createHairGeometry(style);
  const bufferSpecs = createBufferSpecs(geometry);
  let binaryOffset = align4(parsed.binChunk.data.length);
  for (const spec of bufferSpecs) {
    spec.bytes = Buffer.from(spec.data.buffer, spec.data.byteOffset, spec.data.byteLength);
    spec.byteOffset = binaryOffset;
    binaryOffset = align4(binaryOffset + spec.bytes.length);
  }
  const outputBin = Buffer.alloc(binaryOffset);
  parsed.binChunk.data.copy(outputBin);
  const accessorIndices = {};
  for (const spec of bufferSpecs) {
    spec.bytes.copy(outputBin, spec.byteOffset);
    const bufferView = parsed.document.bufferViews.length;
    parsed.document.bufferViews.push({
      buffer: 0,
      byteOffset: spec.byteOffset,
      byteLength: spec.bytes.length,
      target: spec.target,
    });
    accessorIndices[spec.key] = parsed.document.accessors.length;
    parsed.document.accessors.push({ bufferView, ...spec.accessor });
  }

  const material = createHairMaterial(style);
  const materialIndex = parsed.document.materials.length;
  parsed.document.materials.push(material);
  const attributes = {
    POSITION: accessorIndices.position,
    NORMAL: accessorIndices.normal,
    COLOR_0: accessorIndices.color,
  };
  if (geometry.joints) {
    attributes.JOINTS_0 = accessorIndices.joints;
    attributes.WEIGHTS_0 = accessorIndices.weights;
  }
  const meshIndex = parsed.document.meshes.length;
  parsed.document.meshes.push({
    name: style.name,
    primitives: [{
      attributes,
      indices: accessorIndices.indices,
      material: materialIndex,
      mode: 4,
    }],
  });
  hairNode.mesh = meshIndex;
  parsed.document.buffers[0].byteLength = outputBin.length;
  return {
    outputBin,
    manifest: {
      node: nodeName,
      sourceHatMesh,
      mesh: meshIndex,
      material: materialIndex,
      style: styleName,
      vertices: geometry.vertexCount,
      triangles: geometry.indices.length / 3,
      method: 'fitted sculpted shell with irregular hairline, center part, and raised strand flow',
    },
  };
}

async function buildAsset(build) {
  const sourcePath = path.join(rootDir, build.source);
  const outputPath = path.join(rootDir, build.output);
  const source = await readFile(sourcePath);
  const parsed = parseGlb(source);
  const originalAnimations = JSON.stringify(parsed.document.animations || []);
  const originalSkins = JSON.stringify(parsed.document.skins || []);
  const originalNodeCount = parsed.document.nodes.length;
  const removedMeshIndices = {};

  for (const name of build.hiddenMeshes) {
    const node = parsed.document.nodes.find((candidate) => candidate.name === name);
    if (!node || node.mesh === undefined) throw new Error(`Missing visible node ${name}.`);
    removedMeshIndices[name] = node.mesh;
    delete node.mesh;
  }

  let outputBin = parsed.binChunk.data;
  let hairReplacement = null;
  if (build.hairNode) {
    const replacement = appendHair(parsed, build.hairNode, build.hairStyle);
    outputBin = replacement.outputBin;
    hairReplacement = replacement.manifest;
  }

  if (parsed.document.nodes.length !== originalNodeCount) {
    throw new Error('Node graph changed unexpectedly.');
  }
  if (JSON.stringify(parsed.document.animations || []) !== originalAnimations) {
    throw new Error('Animation channels changed unexpectedly.');
  }
  if (JSON.stringify(parsed.document.skins || []) !== originalSkins) {
    throw new Error('Skin definitions changed unexpectedly.');
  }

  const output = encodeGlb(parsed.chunks, parsed.document, outputBin);
  const outputParsed = parseGlb(output);
  if (outputParsed.binChunk.data.subarray(0, parsed.binChunk.data.length)
    .compare(parsed.binChunk.data) !== 0) {
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
    hiddenMeshes: removedMeshIndices,
    hairReplacement,
    preserved: {
      nodes: parsed.document.nodes.length,
      skins: parsed.document.skins?.length || 0,
      animations: parsed.document.animations?.map((animation) => ({
        name: animation.name,
        channels: animation.channels.length,
        samplers: animation.samplers.length,
      })) || [],
      exactOriginalBinaryPrefix: true,
    },
  };
}

const manifests = new Map();
for (const build of builds) {
  const result = await buildAsset(build);
  if (!manifests.has(build.manifest)) manifests.set(build.manifest, { builds: [] });
  manifests.get(build.manifest).builds.push(result);
}
for (const [manifestFile, manifest] of manifests) {
  const manifestPath = path.join(rootDir, manifestFile);
  await mkdir(path.dirname(manifestPath), { recursive: true });
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

console.log(builds.map((build) => build.output).join('\n'));
