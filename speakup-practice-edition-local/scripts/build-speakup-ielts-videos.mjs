import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const stockDir = path.resolve(rootDir, '../视频制作/assets/stock/ielts');
const sceneVideoDir = path.join(rootDir, 'assets/speakup/scenes/videos');

const clips = [
  {
    id: 'feature',
    input: path.join(stockDir, 'ielts_01_laptop-speaking.mp4'),
    output: path.join(sceneVideoDir, 'ielts-laptop-speaking.mp4'),
    poster: path.join(sceneVideoDir, 'ielts-laptop-speaking-poster.jpg'),
    start: '6',
    duration: '7',
    videoFilter: 'scale=1280:720,fps=25',
  },
];

function run(command, args, label) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`${label} failed.`);
}

await mkdir(sceneVideoDir, { recursive: true });

for (const clip of clips) {
  run(
    'ffmpeg',
    [
      '-hide_banner', '-loglevel', 'error', '-y',
      '-ss', clip.start,
      '-i', clip.input,
      '-t', clip.duration,
      '-an',
      '-vf', clip.videoFilter,
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '23',
      '-profile:v', 'main',
      '-level:v', '4.0',
      '-pix_fmt', 'yuv420p',
      '-bf', '0',
      '-refs', '2',
      '-g', '50',
      '-keyint_min', '25',
      '-movflags', '+faststart',
      clip.output,
    ],
    `${clip.id} video`,
  );
  run(
    'ffmpeg',
    [
      '-hide_banner', '-loglevel', 'error', '-y',
      '-ss', '0.2',
      '-i', clip.output,
      '-frames:v', '1',
      '-q:v', '2',
      clip.poster,
    ],
    `${clip.id} poster`,
  );
  console.log(path.relative(rootDir, clip.output));
  console.log(path.relative(rootDir, clip.poster));
}
