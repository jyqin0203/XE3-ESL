import { access, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const sourceRoot = path.resolve(rootDir, '..', '视频制作', 'assets', 'stock');
const outputDir = path.join(
  rootDir,
  'assets',
  'speakup',
  'scenes',
  'videos',
);

const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg';
const FFPROBE = process.env.FFPROBE_PATH || 'ffprobe';
const FPS = 25;
const LOOP_FADE_SECONDS = 0.2;

const SCENES = [
  {
    id: 'interview',
    source: ['interview', 'interview_01_candidate-answer.mp4'],
    start: 1.7,
    end: 7.1,
    width: 1920,
    height: 810,
    // Preserve the source's 64:27 editorial widescreen frame.
    transform: 'scale=1920:810:flags=lanczos,setsar=1',
  },
  {
    id: 'ielts',
    source: ['ielts', 'ielts_02_online-answer.mp4'],
    start: 2,
    end: 7.2,
    width: 1920,
    height: 1080,
    transform:
      'scale=1920:1080:force_original_aspect_ratio=increase:flags=lanczos,crop=1920:1080,setsar=1',
  },
  {
    id: 'work',
    source: ['work', 'work_01_team-presentation.mp4'],
    start: 2.2,
    end: 7.8,
    width: 1920,
    height: 1080,
    transform:
      'scale=1920:1080:force_original_aspect_ratio=increase:flags=lanczos,crop=1920:1080,setsar=1',
  },
  {
    id: 'travel',
    source: ['travel', 'travel_01_hostel-conversation.mp4'],
    start: 0.35,
    end: 6.35,
    width: 1920,
    height: 1080,
    // The 4096x2160 source is only slightly wider than 16:9. Center-crop it
    // instead of stretching people or the circular clock.
    transform:
      'scale=1920:1080:force_original_aspect_ratio=increase:flags=lanczos,crop=1920:1080,setsar=1',
  },
];

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
    ...options,
  });

  if (result.status !== 0) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    throw new Error(`${command} exited with status ${result.status}.`);
  }

  return result.stdout;
}

function assertCommand(command) {
  run(command, ['-version']);
}

function probe(filePath) {
  return JSON.parse(
    run(FFPROBE, [
      '-v',
      'error',
      '-show_entries',
      'format=duration,size:stream=codec_type,codec_name,width,height,pix_fmt,avg_frame_rate',
      '-of',
      'json',
      filePath,
    ]),
  );
}

function buildLoopFilter(scene) {
  const sourceDuration = scene.end - scene.start;
  const bodyEnd = sourceDuration;
  const crossfadeOffset = sourceDuration - 2 * LOOP_FADE_SECONDS;

  // Rotate the clip by the fade duration, then blend its original tail into
  // its original head. The last frame now meets the first frame cleanly when
  // the browser loops, without duplicating a frozen frame.
  return [
    `[0:v]fps=${FPS},${scene.transform},format=yuv420p,settb=1/${FPS},setpts=PTS-STARTPTS,split=2[body][head]`,
    `[body]trim=start=${LOOP_FADE_SECONDS}:end=${bodyEnd},setpts=PTS-STARTPTS[bodytrim]`,
    `[head]trim=start=0:end=${LOOP_FADE_SECONDS},setpts=PTS-STARTPTS[headtrim]`,
    `[bodytrim][headtrim]xfade=transition=fade:duration=${LOOP_FADE_SECONDS}:offset=${crossfadeOffset},format=yuv420p[outv]`,
  ].join(';');
}

function validateVideo(scene, filePath) {
  const data = probe(filePath);
  const videoStreams = data.streams.filter(
    (stream) => stream.codec_type === 'video',
  );
  const audioStreams = data.streams.filter(
    (stream) => stream.codec_type === 'audio',
  );
  const video = videoStreams[0];
  const expectedDuration = scene.end - scene.start - LOOP_FADE_SECONDS;
  const actualDuration = Number(data.format.duration);

  if (
    videoStreams.length !== 1 ||
    audioStreams.length !== 0 ||
    video?.codec_name !== 'h264' ||
    video?.pix_fmt !== 'yuv420p' ||
    video?.width !== scene.width ||
    video?.height !== scene.height ||
    video?.avg_frame_rate !== `${FPS}/1` ||
    Math.abs(actualDuration - expectedDuration) > 0.08
  ) {
    throw new Error(
      `${scene.id}.mp4 failed validation: ${JSON.stringify(data)}`,
    );
  }

  return {
    duration: actualDuration,
    size: Number(data.format.size),
    width: video.width,
    height: video.height,
  };
}

function decodeCheck(filePath) {
  run(FFMPEG, ['-v', 'error', '-i', filePath, '-f', 'null', '-']);
}

function formatBytes(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MiB`;
}

assertCommand(FFMPEG);
assertCommand(FFPROBE);
await mkdir(outputDir, { recursive: true });

for (const scene of SCENES) {
  const sourcePath = path.join(sourceRoot, ...scene.source);
  const videoPath = path.join(outputDir, `${scene.id}.mp4`);
  const posterPath = path.join(outputDir, `${scene.id}-poster.jpg`);
  const sourceDuration = scene.end - scene.start;
  const outputDuration = sourceDuration - LOOP_FADE_SECONDS;

  await access(sourcePath);
  console.log(
    `Building ${scene.id} from ${scene.start.toFixed(2)}s to ${scene.end.toFixed(2)}s...`,
  );

  run(
    FFMPEG,
    [
      '-hide_banner',
      '-loglevel',
      'error',
      '-y',
      '-ss',
      String(scene.start),
      '-t',
      String(sourceDuration),
      '-i',
      sourcePath,
      '-filter_complex',
      buildLoopFilter(scene),
      '-map',
      '[outv]',
      '-an',
      '-map_metadata',
      '-1',
      '-c:v',
      'libx264',
      '-preset',
      'slow',
      '-crf',
      '22',
      '-profile:v',
      'high',
      '-level:v',
      '4.1',
      '-fps_mode',
      'cfr',
      '-movflags',
      '+faststart',
      videoPath,
    ],
    { stdio: 'inherit' },
  );

  run(
    FFMPEG,
    [
      '-hide_banner',
      '-loglevel',
      'error',
      '-y',
      '-ss',
      (outputDuration / 2).toFixed(3),
      '-i',
      videoPath,
      '-frames:v',
      '1',
      '-q:v',
      '2',
      '-map_metadata',
      '-1',
      posterPath,
    ],
    { stdio: 'inherit' },
  );

  const summary = validateVideo(scene, videoPath);
  const posterStat = await stat(posterPath);
  if (posterStat.size < 20_000) {
    throw new Error(`${scene.id}-poster.jpg is unexpectedly small.`);
  }

  decodeCheck(videoPath);
  decodeCheck(posterPath);
  console.log(
    `  ${summary.width}x${summary.height}, ${summary.duration.toFixed(2)}s, ${formatBytes(summary.size)}, poster ${formatBytes(posterStat.size)}`,
  );
}

console.log(`Built ${SCENES.length} scene loops in ${outputDir}`);
