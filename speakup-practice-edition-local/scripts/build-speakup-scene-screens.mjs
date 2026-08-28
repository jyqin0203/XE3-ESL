import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const uiDir = path.join(rootDir, 'assets/speakup/scenes/ui');
const screenDir = path.join(uiDir, 'screens');

const specs = [
  ['interview-entry.png', 'interview-screen.png', '860:1870:70:65'],
  ['ielts-entry.png', 'ielts-screen.png', '860:1870:70:65'],
  ['work-entry.png', 'work-screen.png', '860:1870:70:65'],
  ['travel-entry.png', 'travel-screen.png', '860:1870:70:65'],
  ['ielts-practice.png', 'ielts-practice-screen.png', '790:1890:55:55'],
];

await mkdir(screenDir, { recursive: true });

for (const [inputName, outputName, crop] of specs) {
  const input = path.join(uiDir, inputName);
  const output = path.join(screenDir, outputName);
  const result = spawnSync(
    'ffmpeg',
    [
      '-hide_banner',
      '-loglevel',
      'error',
      '-y',
      '-i',
      input,
      '-vf',
      `crop=${crop}`,
      '-frames:v',
      '1',
      '-compression_level',
      '9',
      output,
    ],
    { stdio: 'inherit' },
  );
  if (result.status !== 0) {
    throw new Error(`Failed to build ${outputName}.`);
  }
  console.log(path.relative(rootDir, output));
}
