#!/usr/bin/env node

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = resolve(scriptDirectory, "..");
const outputDirectory = join(
  projectDirectory,
  "assets",
  "speakup",
  "outcomes",
  "ui",
);

const sources = {
  review: {
    path: "/Users/mac/Projects/XE3-ESL/portal/public/assets/portal-shots/ielts-review.webp",
    width: 840,
    height: 1826,
  },
  memory: {
    path: "/Users/mac/Projects/XE3-ESL/portal/public/assets/portal-shots/portal-memory-chat.jpg",
    width: 1290,
    height: 2796,
  },
  progress: {
    path: "/Users/mac/Projects/XE3-ESL/portal/public/assets/portal-shots/practice-progress.webp",
    width: 916,
    height: 1806,
  },
};

const outputs = [
  {
    id: "review-main",
    file: "review-main.webp",
    source: "review",
    operation: "copy",
    semantic: "IELTS Part 1 score, four-axis radar, and detailed recommendations",
    recommendedRole: "review chapter primary portrait UI",
  },
  {
    id: "review-score-detail",
    file: "review-score-detail.png",
    source: "review",
    operation: "crop",
    crop: { x: 36, y: 250, width: 768, height: 960 },
    semantic: "Practice score and four-dimension radar with the first recommendation heading",
    recommendedRole: "review chapter close-up detail",
  },
  {
    id: "review-advice-detail",
    file: "review-advice-detail.png",
    source: "review",
    operation: "crop",
    crop: { x: 36, y: 1060, width: 768, height: 380 },
    semantic: "Priority dimension, score, evidence coverage, and weakness explanation",
    recommendedRole: "review chapter diagnostic evidence detail",
  },
  {
    id: "review-next-step-detail",
    file: "review-next-step-detail.png",
    source: "review",
    operation: "crop",
    crop: { x: 36, y: 1440, width: 768, height: 240 },
    semantic: "Actionable practice suggestion and route to supporting evidence",
    recommendedRole: "review chapter next-step detail",
  },
  {
    id: "memory-main",
    file: "memory-main.jpg",
    source: "memory",
    operation: "copy",
    semantic: "Memory-aware coaching conversation across prior practice rounds",
    recommendedRole: "memory chapter primary portrait UI",
  },
  {
    id: "memory-context-detail",
    file: "memory-context-detail.jpg",
    source: "memory",
    operation: "crop",
    crop: { x: 70, y: 1030, width: 1150, height: 1212 },
    semantic: "Remembered target, project, improvements, and recurring weaknesses",
    recommendedRole: "memory chapter evidence detail",
  },
  {
    id: "memory-next-round-detail",
    file: "memory-next-round-detail.jpg",
    source: "memory",
    operation: "crop",
    crop: { x: 70, y: 2120, width: 1150, height: 676 },
    semantic: "Next practice generated from remembered weaknesses",
    recommendedRole: "memory chapter causal payoff detail",
  },
  {
    id: "progress-main",
    file: "progress-main.png",
    source: "progress",
    operation: "crop",
    // This is the crop already used by the live Portal carousel. It removes
    // the old page visible around the phone without inventing a new shell.
    crop: { x: 73, y: 31, width: 787, height: 1718 },
    roundedMask: { radius: 88 },
    semantic: "Cross-session comparison of recent practice improvement",
    recommendedRole: "progress chapter primary portrait UI",
  },
  {
    id: "progress-history-detail",
    file: "progress-history-detail.png",
    source: "progress",
    operation: "crop",
    crop: { x: 90, y: 270, width: 736, height: 1000 },
    semantic: "Latest, previous, and earlier practice comparison plus coaching conclusion",
    recommendedRole: "progress chapter history detail",
  },
];

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    encoding: Object.hasOwn(options, "encoding") ? options.encoding : "utf8",
    maxBuffer: options.maxBuffer ?? 64 * 1024 * 1024,
    stdio: options.stdio ?? ["ignore", "pipe", "pipe"],
  });
}

function probe(path) {
  const result = JSON.parse(
    run("ffprobe", [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      "stream=width,height,pix_fmt,codec_name",
      "-of",
      "json",
      path,
    ]),
  );
  const stream = result.streams?.[0];
  if (!stream) throw new Error(`No image stream found in ${path}`);
  return stream;
}

function verifySources() {
  for (const [id, source] of Object.entries(sources)) {
    const dimensions = probe(source.path);
    if (dimensions.width !== source.width || dimensions.height !== source.height) {
      throw new Error(
        `${id}: expected ${source.width}x${source.height}, ` +
          `received ${dimensions.width}x${dimensions.height}`,
      );
    }
  }
}

function writeRoundedMask(width, height, radius, destination) {
  const pixels = Buffer.alloc(width * height);
  const samples = [0.25, 0.75];

  function isInside(px, py) {
    const nearestX = Math.max(radius, Math.min(px, width - radius));
    const nearestY = Math.max(radius, Math.min(py, height - radius));
    const dx = px - nearestX;
    const dy = py - nearestY;
    return dx * dx + dy * dy <= radius * radius;
  }

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let coverage = 0;
      for (const sy of samples) {
        for (const sx of samples) {
          if (isInside(x + sx, y + sy)) coverage += 1;
        }
      }
      pixels[y * width + x] = Math.round((coverage / 4) * 255);
    }
  }

  const header = Buffer.from(`P5\n${width} ${height}\n255\n`, "ascii");
  writeFileSync(destination, Buffer.concat([header, pixels]));
}

function buildOutput(definition, temporaryDirectory) {
  const source = sources[definition.source];
  const outputPath = join(outputDirectory, definition.file);

  if (definition.operation === "copy") {
    copyFileSync(source.path, outputPath);
    return outputPath;
  }

  const { x, y, width, height } = definition.crop;
  const codecArguments = definition.file.endsWith(".png")
    ? ["-compression_level", "6"]
    : ["-q:v", "2"];

  const inputArguments = ["-i", source.path];
  const filterArguments = [
    "-vf",
    `crop=${width}:${height}:${x}:${y}:exact=1`,
  ];

  if (definition.roundedMask) {
    const maskPath = join(temporaryDirectory, `${definition.id}-mask.pgm`);
    writeRoundedMask(width, height, definition.roundedMask.radius, maskPath);
    inputArguments.push("-i", maskPath);
    filterArguments.splice(
      0,
      filterArguments.length,
      "-filter_complex",
      `[0:v]crop=${width}:${height}:${x}:${y}:exact=1,format=rgba[crop];` +
        "[1:v]format=gray[mask];[crop][mask]alphamerge[output]",
      "-map",
      "[output]",
    );
  }

  run(
    "ffmpeg",
    [
      "-y",
      "-hide_banner",
      "-loglevel",
      "error",
      ...inputArguments,
      ...filterArguments,
      "-frames:v",
      "1",
      "-map_metadata",
      "-1",
      ...codecArguments,
      outputPath,
    ],
    { stdio: "inherit" },
  );
  return outputPath;
}

function outputMetadata(definition, path) {
  const stream = probe(path);
  const expected = definition.operation === "crop"
    ? { width: definition.crop.width, height: definition.crop.height }
    : {
        width: sources[definition.source].width,
        height: sources[definition.source].height,
      };

  if (stream.width !== expected.width || stream.height !== expected.height) {
    throw new Error(`${definition.id}: unexpected output dimensions`);
  }

  return {
    id: definition.id,
    file: definition.file,
    source: sources[definition.source].path,
    sourceSize: {
      width: sources[definition.source].width,
      height: sources[definition.source].height,
    },
    operation: definition.operation,
    ...(definition.crop ? { crop: definition.crop } : {}),
    ...(definition.roundedMask ? { roundedMask: definition.roundedMask } : {}),
    output: {
      width: stream.width,
      height: stream.height,
      aspectRatio: Number((stream.width / stream.height).toFixed(4)),
      codec: stream.codec_name,
      pixelFormat: stream.pix_fmt,
      sha256: createHash("sha256").update(readFileSync(path)).digest("hex"),
    },
    semantic: definition.semantic,
    recommendedRole: definition.recommendedRole,
    fit: "contain",
  };
}

function buildContactSheet(paths) {
  const contactSheetPath = join(outputDirectory, "contact-sheet.png");
  const panelWidth = 600;
  const panelHeight = 720;
  const inputs = paths.flatMap((path) => ["-i", path]);
  const filters = [];

  for (let index = 0; index < paths.length; index += 1) {
    filters.push(
      `color=c=0xe8e5dd:s=${panelWidth}x${panelHeight}:d=0.04[background${index}]`,
      `[${index}:v]scale=${panelWidth - 70}:${panelHeight - 50}:` +
        "force_original_aspect_ratio=decrease:flags=lanczos,format=rgba" +
        `[image${index}]`,
      `[background${index}][image${index}]overlay=` +
        `x=(W-w)/2:y=(H-h)/2:shortest=1:format=auto[panel${index}]`,
    );
  }

  const panels = paths.map((_, index) => `[panel${index}]`).join("");
  const layout = paths
    .map(
      (_, index) =>
        `${(index % 3) * panelWidth}_${Math.floor(index / 3) * panelHeight}`,
    )
    .join("|");
  filters.push(
    `${panels}xstack=inputs=${paths.length}:layout=${layout}:` +
      "fill=0xc9c5bb[sheet]",
  );

  run(
    "ffmpeg",
    [
      "-y",
      "-hide_banner",
      "-loglevel",
      "error",
      ...inputs,
      "-filter_complex",
      filters.join(";"),
      "-map",
      "[sheet]",
      "-frames:v",
      "1",
      "-compression_level",
      "6",
      contactSheetPath,
    ],
    { stdio: "inherit" },
  );

  return contactSheetPath;
}

function main() {
  mkdirSync(outputDirectory, { recursive: true });
  verifySources();
  const temporaryDirectory = mkdtempSync(join(tmpdir(), "speakup-outcomes-ui-"));

  try {
    const paths = outputs.map((definition) =>
      buildOutput(definition, temporaryDirectory),
    );
    const manifestAssets = outputs.map((definition, index) =>
      outputMetadata(definition, paths[index]),
    );
    buildContactSheet(paths);

    const manifest = {
      version: 1,
      purpose: "SpeakUp outcome-section UI assets derived only from real product captures",
      constraints: [
        "No generated interface pixels",
        "No duplicate phone shell",
        "Portrait assets must use contain rather than cover",
      ],
      contactSheet: {
        file: "contact-sheet.png",
        order: manifestAssets.map(({ id }) => id),
      },
      assets: manifestAssets,
    };
    writeFileSync(
      join(outputDirectory, "manifest.json"),
      `${JSON.stringify(manifest, null, 2)}\n`,
    );

    console.log(`Built ${outputs.length} outcome UI assets in ${outputDirectory}`);
  } finally {
    rmSync(temporaryDirectory, { recursive: true, force: true });
  }
}

main();
