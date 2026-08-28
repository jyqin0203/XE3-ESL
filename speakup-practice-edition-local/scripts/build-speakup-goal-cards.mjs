import { access, mkdir, readFile, readdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const sourcePath = path.join(
  rootDir,
  'assets/remote/editions-winter-2026.myshopify.com/cdn/shop/3d/models/o/510af84586abddc1/EW26_Agentic_Props_251209v5_compressed-optimized.glb',
);
const outputPath = path.join(
  rootDir,
  'assets/speakup/goal/speakup-goal-cards.glb',
);

const CARD_SPECS = [
  {
    rootNode: 'Skateboard',
    planeNode: 'Plane.004',
    name: 'Goal',
    eyebrow: 'NEXT GOAL',
    title: ['Clarify', 'the moment'],
    caption: 'Say what is at stake.',
    colors: ['#B85D47', '#7E3F38'],
    icon: 'target',
  },
  {
    rootNode: 'Wheel',
    planeNode: 'Plane.003',
    name: 'Listening',
    eyebrow: 'LISTENING',
    title: ['Keep', 'going...'],
    caption: 'Speak in your own words.',
    colors: ['#24716D', '#174A4B'],
    icon: 'microphone',
  },
  {
    rootNode: 'Shoes',
    planeNode: 'Plane.001',
    name: 'Prompt',
    eyebrow: 'YOUR TURN',
    title: ['Try it', 'out loud'],
    caption: 'One useful line at a time.',
    colors: ['#C78C39', '#8C5D26'],
    icon: 'dialogue',
  },
  {
    rootNode: 'Cap',
    planeNode: 'Plane',
    name: 'Live Practice',
    eyebrow: 'LIVE PRACTICE',
    title: ['Stay in', 'the flow'],
    caption: 'Respond, clarify, continue.',
    colors: ['#68739B', '#444967'],
    icon: 'waveform',
  },
  {
    rootNode: 'Shirt',
    planeNode: 'Plane.002',
    name: 'Feedback',
    eyebrow: 'FEEDBACK',
    title: ['Clearer.', 'More natural.'],
    caption: 'A next step you can use.',
    colors: ['#9C5360', '#6F3746'],
    icon: 'feedback',
  },
];

function compareVersions(a, b) {
  const left = a.split('.').map(Number);
  const right = b.split('.').map(Number);
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const difference = (left[index] || 0) - (right[index] || 0);
    if (difference) return difference;
  }
  return 0;
}

async function findGltfToolkit() {
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
        await access(path.join(candidate, 'node_modules/@gltf-transform/functions'));
        await access(path.join(candidate, 'node_modules/@gltf-transform/extensions'));
        await access(path.join(candidate, 'node_modules/draco3dgltf'));
        await access(path.join(candidate, 'node_modules/ndarray-pixels/node_modules/sharp'));
        candidates.push({ root: candidate, version: packageJson.version });
      } catch {
        // This npx cache entry is unrelated or incomplete.
      }
    }
  } catch {
    // The cache may not exist on a fresh machine; bootstrap it below.
  }

  candidates.sort((a, b) => compareVersions(b.version, a.version));
  if (candidates[0]) return candidates[0];

  console.log('Preparing the glTF build toolkit...');
  const bootstrap = spawnSync(
    'npx',
    ['--yes', '@gltf-transform/cli@4.4.2', '--version'],
    { stdio: 'inherit' },
  );
  if (bootstrap.status !== 0) {
    throw new Error('Unable to prepare @gltf-transform/cli with npx.');
  }
  return findGltfToolkit();
}

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function renderIcon(type) {
  if (type === 'target') {
    return `
      <g transform="translate(188 80)" fill="none" stroke="#F8F3E7" stroke-width="4">
        <circle r="29" opacity=".35"/><circle r="18" opacity=".7"/><circle r="6" fill="#F8F3E7"/>
        <path d="M-38 0h17M21 0h17M0-38v17M0 21v17" stroke-linecap="round"/>
      </g>`;
  }
  if (type === 'microphone') {
    return `
      <g transform="translate(188 82)" fill="none" stroke="#F8F3E7" stroke-width="5" stroke-linecap="round">
        <rect x="-11" y="-28" width="22" height="45" rx="11"/>
        <path d="M-22 7a22 22 0 0 0 44 0M0 30v16M-12 46h24"/>
        <path d="M-39-16q-9 12 0 24M39-16q9 12 0 24" opacity=".38"/>
      </g>`;
  }
  if (type === 'dialogue') {
    return `
      <g transform="translate(156 54)" fill="none" stroke="#F8F3E7" stroke-width="4" stroke-linejoin="round">
        <path d="M8 0h65a9 9 0 0 1 9 9v32a9 9 0 0 1-9 9H38L18 65l5-15H8a9 9 0 0 1-9-9V9A9 9 0 0 1 8 0Z"/>
        <path d="M17 18h48M17 31h34" stroke-linecap="round" opacity=".6"/>
      </g>`;
  }
  if (type === 'waveform') {
    return `
      <g transform="translate(154 80)" fill="none" stroke="#F8F3E7" stroke-width="5" stroke-linecap="round">
        <path d="M0 8v-16M14 21v-42M28 13v-26M42 30v-60M56 17v-34M70 9V-9M84 24v-48"/>
      </g>`;
  }
  return `
    <g transform="translate(150 58)" fill="none" stroke="#F8F3E7" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="27" cy="27" r="27" opacity=".3"/>
      <path d="m12 28 10 10 21-24"/>
      <path d="M60 12h28M60 27h32M60 42h22" opacity=".55"/>
    </g>`;
}

function renderCardSvg(spec) {
  const [titleLine1, titleLine2] = spec.title.map(escapeXml);
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
      <defs>
        <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#FBF7EC"/>
          <stop offset="1" stop-color="#E9E0CD"/>
        </linearGradient>
        <linearGradient id="ink" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${spec.colors[0]}"/>
          <stop offset="1" stop-color="${spec.colors[1]}"/>
        </linearGradient>
        <pattern id="grain" width="13" height="13" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="3" r=".65" fill="#FFF" opacity=".11"/>
          <circle cx="10" cy="9" r=".5" fill="#160F0C" opacity=".09"/>
          <path d="M0 12 12 0" stroke="#FFF" stroke-width=".35" opacity=".06"/>
        </pattern>
      </defs>
      <rect width="256" height="256" rx="30" fill="url(#paper)"/>
      <rect x="7" y="7" width="242" height="242" rx="24" fill="url(#ink)"/>
      <rect x="7" y="7" width="242" height="242" rx="24" fill="url(#grain)"/>
      <path d="M21 21h214v214H21Z" fill="none" stroke="#F8F3E7" stroke-opacity=".34"/>
      <text x="23" y="42" fill="#F8F3E7" font-family="Arial, Helvetica, sans-serif" font-size="10" font-weight="700" letter-spacing="1.8">${escapeXml(spec.eyebrow)}</text>
      ${renderIcon(spec.icon)}
      <text x="23" y="143" fill="#F8F3E7" font-family="Georgia, Times, serif" font-size="27" font-weight="700" letter-spacing="-.8">${titleLine1}</text>
      <text x="23" y="171" fill="#F8F3E7" font-family="Georgia, Times, serif" font-size="27" font-style="italic" letter-spacing="-.8">${titleLine2}</text>
      <path d="M23 191h210" stroke="#F8F3E7" stroke-opacity=".33"/>
      <text x="23" y="210" fill="#F8F3E7" font-family="Arial, Helvetica, sans-serif" font-size="9.5" font-weight="600">${escapeXml(spec.caption)}</text>
      <text x="23" y="234" fill="#F8F3E7" font-family="Georgia, Times, serif" font-size="16" font-style="italic">SpeakUp</text>
      <circle cx="229" cy="229" r="7" fill="#F8F3E7"/>
      <path d="m226 229 2 2 4-5" fill="none" stroke="${spec.colors[1]}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
}

const toolkit = await findGltfToolkit();
const toolkitRequire = createRequire(path.join(toolkit.root, 'package.json'));
const imageRequire = createRequire(
  path.join(toolkit.root, 'node_modules/ndarray-pixels/package.json'),
);
const { NodeIO } = toolkitRequire('@gltf-transform/core');
const { ALL_EXTENSIONS, KHRMaterialsUnlit } = toolkitRequire(
  '@gltf-transform/extensions',
);
const { prune } = toolkitRequire('@gltf-transform/functions');
const draco3d = toolkitRequire('draco3dgltf');
const sharp = imageRequire('sharp');

await access(sourcePath);
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    'draco3d.decoder': await draco3d.createDecoderModule(),
  });
const document = await io.read(sourcePath);
const root = document.getRoot();
const nodesByName = new Map(
  root.listNodes().map((node) => [node.getName(), node]),
);
const originalNodeCount = root.listNodes().length;
const sceneAnimation = root
  .listAnimations()
  .find((animation) => animation.getName() === 'Scene');

if (!sceneAnimation || sceneAnimation.listChannels().length !== 30) {
  throw new Error('Expected the original Scene animation with 30 channels.');
}

const unlitExtension = document.createExtension(KHRMaterialsUnlit);

for (const spec of CARD_SPECS) {
  const animatedRoot = nodesByName.get(spec.rootNode);
  const animatedPlane = nodesByName.get(spec.planeNode);
  if (!animatedRoot || !animatedPlane || !animatedPlane.getMesh()) {
    throw new Error(
      `Missing animated pair ${spec.rootNode} -> ${spec.planeNode}.`,
    );
  }

  const sourcePrimitives = animatedPlane.getMesh().listPrimitives();
  if (sourcePrimitives.length !== 1) {
    throw new Error(`${spec.planeNode} must contain exactly one primitive.`);
  }
  const sourcePrimitive = sourcePrimitives[0];
  const position = sourcePrimitive.getAttribute('POSITION');
  const texcoord = sourcePrimitive.getAttribute('TEXCOORD_0');
  const indices = sourcePrimitive.getIndices();
  if (!position || !texcoord || !indices) {
    throw new Error(`${spec.planeNode} is missing reusable plane geometry.`);
  }

  const image = await sharp(Buffer.from(renderCardSvg(spec)))
    .png({ compressionLevel: 9, palette: true, colours: 128 })
    .toBuffer();
  const texture = document
    .createTexture(`${spec.name} Card`)
    .setImage(image)
    .setMimeType('image/png');
  const material = document
    .createMaterial(`${spec.name} Card Material`)
    .setBaseColorTexture(texture)
    .setBaseColorFactor([1, 1, 1, 1])
    .setMetallicFactor(0)
    .setRoughnessFactor(1)
    .setDoubleSided(true)
    .setAlphaMode('BLEND')
    .setExtension('KHR_materials_unlit', unlitExtension.createUnlit());
  const primitive = document
    .createPrimitive()
    .setMode(sourcePrimitive.getMode())
    .setIndices(indices)
    .setAttribute('POSITION', position)
    .setAttribute('TEXCOORD_0', texcoord)
    .setMaterial(material);
  const mesh = document
    .createMesh(`${spec.name} Card Mesh`)
    .addPrimitive(primitive);

  // The root carries the original prop flight, and its child Plane carries the
  // authored reveal, scale, and +90° turn toward the camera. Only swap meshes.
  animatedRoot.setMesh(null);
  animatedPlane.setMesh(mesh);
}

await document.transform(prune());

// All remaining geometry is uncompressed and all remaining textures are PNG.
// Drop stale source-only extensions so the result has no decoder dependency.
for (const extension of [...root.listExtensionsUsed()]) {
  if (
    extension.extensionName === 'KHR_draco_mesh_compression' ||
    extension.extensionName === 'KHR_texture_basisu'
  ) {
    extension.dispose();
  }
}

if (
  root.listNodes().length !== originalNodeCount ||
  sceneAnimation.listChannels().length !== 30
) {
  throw new Error('The original animated node graph changed unexpectedly.');
}

const duration = Math.max(
  ...sceneAnimation
    .listSamplers()
    .flatMap((sampler) => Array.from(sampler.getInput().getArray() || [])),
);

await mkdir(path.dirname(outputPath), { recursive: true });
await io.write(outputPath, document);

const relativeOutput = path.relative(rootDir, outputPath);
const outputBytes = (await readFile(outputPath)).byteLength;
console.log(`Created ${relativeOutput} (${outputBytes} bytes)`);
console.log(
  `Preserved Scene: ${sceneAnimation.listChannels().length} channels, ${duration.toFixed(3)}s, ${root.listNodes().length} nodes`,
);
console.log(`glTF-Transform toolkit: ${toolkit.version}`);
