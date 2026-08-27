#!/usr/bin/env node

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
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
  "scenes",
  "ui",
);

const ENTRY_CANVAS = { width: 1000, height: 2000 };
const PRACTICE_CANVAS = { width: 900, height: 2000 };
const PHONE_HEIGHT = 1940;
const PHONE_BASELINE = 1970;

// The source PNGs are flattened screenshots. Each mask follows only the outer
// phone body and hardware buttons so the old page visible around the device is
// removed without cropping the product UI inside the screen.
const assets = [
  {
    id: "interview-entry",
    kind: "entry",
    source: "/Users/mac/Documents/SpeakUp资产/英文面试.png",
    sourceSize: { width: 898, height: 1824 },
    crop: { x: 0, y: 0, width: 898, height: 1824 },
    canvas: ENTRY_CANVAS,
    safeRegion: { x: 82, y: 188, width: 734, height: 1556 },
    maskShapes: [
      { type: "roundRect", x: 55, y: 3, width: 788, height: 1814, radius: 220 },
      { type: "roundRect", x: 6, y: 315, width: 51, height: 70, radius: 5 },
      { type: "roundRect", x: 6, y: 438, width: 51, height: 96, radius: 5 },
      { type: "roundRect", x: 6, y: 556, width: 51, height: 162, radius: 5 },
      { type: "roundRect", x: 841, y: 442, width: 55, height: 270, radius: 5 },
    ],
  },
  {
    id: "ielts-entry",
    kind: "entry",
    source: "/Users/mac/Documents/SpeakUp资产/IELTS雅思口语.png",
    sourceSize: { width: 900, height: 1804 },
    crop: { x: 8, y: 0, width: 884, height: 1804 },
    canvas: ENTRY_CANVAS,
    safeRegion: { x: 84, y: 184, width: 732, height: 1536 },
    maskShapes: [
      { type: "roundRect", x: 63, y: 3, width: 774, height: 1794, radius: 220 },
      { type: "roundRect", x: 13, y: 313, width: 52, height: 69, radius: 5 },
      { type: "roundRect", x: 13, y: 434, width: 52, height: 96, radius: 5 },
      { type: "roundRect", x: 13, y: 552, width: 52, height: 162, radius: 5 },
      { type: "roundRect", x: 835, y: 437, width: 60, height: 270, radius: 5 },
    ],
  },
  {
    id: "work-entry",
    kind: "entry",
    source: "/Users/mac/Documents/SpeakUp资产/职场英语.png",
    sourceSize: { width: 902, height: 1808 },
    crop: { x: 16, y: 0, width: 886, height: 1808 },
    canvas: ENTRY_CANVAS,
    safeRegion: { x: 88, y: 188, width: 726, height: 1534 },
    maskShapes: [
      { type: "roundRect", x: 65, y: 3, width: 772, height: 1798, radius: 220 },
      { type: "roundRect", x: 21, y: 313, width: 46, height: 69, radius: 5 },
      { type: "roundRect", x: 21, y: 434, width: 46, height: 96, radius: 5 },
      { type: "roundRect", x: 21, y: 552, width: 46, height: 162, radius: 5 },
      { type: "roundRect", x: 835, y: 439, width: 67, height: 270, radius: 4 },
    ],
  },
  {
    id: "travel-entry",
    kind: "entry",
    source: "/Users/mac/Documents/SpeakUp资产/生活与旅行.png",
    sourceSize: { width: 882, height: 1816 },
    crop: { x: 0, y: 0, width: 882, height: 1816 },
    canvas: ENTRY_CANVAS,
    safeRegion: { x: 80, y: 188, width: 722, height: 1548 },
    maskShapes: [
      { type: "roundRect", x: 55, y: 3, width: 772, height: 1806, radius: 220 },
      { type: "roundRect", x: 5, y: 315, width: 52, height: 70, radius: 5 },
      { type: "roundRect", x: 5, y: 438, width: 52, height: 96, radius: 5 },
      { type: "roundRect", x: 5, y: 556, width: 52, height: 162, radius: 5 },
      { type: "roundRect", x: 825, y: 442, width: 55, height: 270, radius: 5 },
    ],
  },
  {
    id: "ielts-practice",
    kind: "practice",
    source:
      "/Users/mac/Projects/XE3-ESL-dev/assets/39cbe4f7-5cd5-42c6-acc9-e728629bb556.png",
    sourceSize: { width: 853, height: 1844 },
    crop: { x: 25, y: 27, width: 805, height: 1792 },
    canvas: PRACTICE_CANVAS,
    safeRegion: { x: 78, y: 148, width: 697, height: 1594 },
    maskShapes: [
      { type: "roundRect", x: 40, y: 40, width: 774, height: 1764, radius: 102 },
      { type: "roundRect", x: 29, y: 331, width: 14, height: 57, radius: 4 },
      { type: "roundRect", x: 29, y: 438, width: 14, height: 112, radius: 4 },
      { type: "roundRect", x: 29, y: 583, width: 14, height: 114, radius: 4 },
      { type: "roundRect", x: 812, y: 518, width: 17, height: 179, radius: 4 },
    ],
  },
];

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    encoding: Object.hasOwn(options, "encoding") ? options.encoding : "utf8",
    maxBuffer: options.maxBuffer ?? 64 * 1024 * 1024,
    stdio: options.stdio ?? ["ignore", "pipe", "pipe"],
  });
}

function assertSourceDimensions(asset) {
  const probe = JSON.parse(
    run("ffprobe", [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      "stream=width,height",
      "-of",
      "json",
      asset.source,
    ]),
  );
  const stream = probe.streams?.[0];
  if (
    stream?.width !== asset.sourceSize.width ||
    stream?.height !== asset.sourceSize.height
  ) {
    throw new Error(
      `${asset.id}: expected ${asset.sourceSize.width}x${asset.sourceSize.height}, ` +
        `received ${stream?.width}x${stream?.height}`,
    );
  }
}

function pointInsideRoundedRectangle(px, py, shape) {
  const right = shape.x + shape.width;
  const bottom = shape.y + shape.height;
  if (px < shape.x || px > right || py < shape.y || py > bottom) return false;

  const radius = Math.min(shape.radius, shape.width / 2, shape.height / 2);
  const nearestX = Math.max(shape.x + radius, Math.min(px, right - radius));
  const nearestY = Math.max(shape.y + radius, Math.min(py, bottom - radius));
  const dx = px - nearestX;
  const dy = py - nearestY;
  return dx * dx + dy * dy <= radius * radius;
}

function pointInsideMask(px, py, shapes) {
  return shapes.some((shape) => pointInsideRoundedRectangle(px, py, shape));
}

function writeMask(asset, destination) {
  const { width, height } = asset.sourceSize;
  const pixels = Buffer.alloc(width * height);
  const samples = [0.25, 0.75];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let coverage = 0;
      for (const sy of samples) {
        for (const sx of samples) {
          if (pointInsideMask(x + sx, y + sy, asset.maskShapes)) coverage += 1;
        }
      }
      pixels[y * width + x] = Math.round((coverage / 4) * 255);
    }
  }

  const header = Buffer.from(`P5\n${width} ${height}\n255\n`, "ascii");
  writeFileSync(destination, Buffer.concat([header, pixels]));
}

function buildAsset(asset, temporaryDirectory) {
  assertSourceDimensions(asset);
  const maskPath = join(temporaryDirectory, `${asset.id}-mask.pgm`);
  const outputPath = join(outputDirectory, `${asset.id}.png`);
  writeMask(asset, maskPath);

  const { crop, canvas } = asset;
  const top = PHONE_BASELINE - PHONE_HEIGHT;
  const filter = [
    "[0:v]format=rgba[source]",
    "[1:v]format=gray[mask]",
    "[source][mask]alphamerge[cutout]",
    `[cutout]crop=${crop.width}:${crop.height}:${crop.x}:${crop.y},` +
      `scale=-1:${PHONE_HEIGHT}:flags=lanczos,format=rgba,` +
      `pad=${canvas.width}:${canvas.height}:(ow-iw)/2:${top}:` +
      "color=0x00000000[output]",
  ].join(";");

  run(
    "ffmpeg",
    [
      "-y",
      "-hide_banner",
      "-loglevel",
      "error",
      "-i",
      asset.source,
      "-i",
      maskPath,
      "-filter_complex",
      filter,
      "-map",
      "[output]",
      "-frames:v",
      "1",
      "-compression_level",
      "6",
      outputPath,
    ],
    { stdio: "inherit" },
  );

  return outputPath;
}

function readOutputMetadata(asset, outputPath) {
  const probe = JSON.parse(
    run("ffprobe", [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      "stream=width,height,pix_fmt",
      "-of",
      "json",
      outputPath,
    ]),
  ).streams?.[0];

  if (probe?.width !== asset.canvas.width || probe?.height !== asset.canvas.height) {
    throw new Error(`${asset.id}: unexpected output dimensions`);
  }
  if (!probe?.pix_fmt?.includes("a")) {
    throw new Error(`${asset.id}: output does not contain an alpha channel`);
  }

  const alpha = run(
    "ffmpeg",
    [
      "-v",
      "error",
      "-i",
      outputPath,
      "-vf",
      "alphaextract",
      "-frames:v",
      "1",
      "-f",
      "rawvideo",
      "-pix_fmt",
      "gray",
      "pipe:1",
    ],
    { encoding: null },
  );

  let minimum = 255;
  let maximum = 0;
  let transparentPixels = 0;
  let partialPixels = 0;
  let opaquePixels = 0;
  for (const value of alpha) {
    minimum = Math.min(minimum, value);
    maximum = Math.max(maximum, value);
    if (value === 0) transparentPixels += 1;
    else if (value === 255) opaquePixels += 1;
    else partialPixels += 1;
  }

  if (minimum !== 0 || maximum !== 255 || transparentPixels === 0) {
    throw new Error(`${asset.id}: alpha validation failed`);
  }

  const hash = createHash("sha256").update(readFileSync(outputPath)).digest("hex");
  return {
    width: probe.width,
    height: probe.height,
    pixelFormat: probe.pix_fmt,
    alpha: {
      minimum,
      maximum,
      transparentPixels,
      partialPixels,
      opaquePixels,
    },
    sha256: hash,
  };
}

function buildContactSheet(outputPaths) {
  const contactSheetPath = join(outputDirectory, "contact-sheet.png");
  const inputs = outputPaths.flatMap((path) => ["-i", path]);
  const filters = [];
  for (let index = 0; index < outputPaths.length; index += 1) {
    filters.push(
      `color=c=0xe8e5dd:s=600x720:d=0.04[background${index}]`,
      `[${index}:v]scale=-1:660:flags=lanczos,format=rgba[phone${index}]`,
      `[background${index}][phone${index}]overlay=` +
        `x=(W-w)/2:y=20:shortest=1:format=auto[panel${index}]`,
    );
  }
  filters.push(
    "[panel0][panel1][panel2][panel3][panel4]" +
      "xstack=inputs=5:layout=0_0|600_0|1200_0|0_720|600_720:" +
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
  const temporaryDirectory = mkdtempSync(join(tmpdir(), "speakup-scene-ui-"));

  try {
    const outputPaths = assets.map((asset) => buildAsset(asset, temporaryDirectory));
    const outputMetadata = assets.map((asset, index) => ({
      id: asset.id,
      kind: asset.kind,
      file: `${asset.id}.png`,
      source: asset.source,
      sourceSize: asset.sourceSize,
      output: readOutputMetadata(asset, outputPaths[index]),
      phoneBaseline: PHONE_BASELINE,
      sourceCriticalUiSafeRegion: asset.safeRegion,
      fit: "contain",
    }));
    buildContactSheet(outputPaths);

    const manifest = {
      version: 1,
      purpose: "SpeakUp scene-entry and IELTS practice phone UI assets",
      entryCanvas: ENTRY_CANVAS,
      practiceCanvas: PRACTICE_CANVAS,
      phoneHeight: PHONE_HEIGHT,
      phoneBaseline: PHONE_BASELINE,
      contactSheet: {
        file: "contact-sheet.png",
        order: outputMetadata.map(({ id }) => id),
      },
      assets: outputMetadata,
    };
    writeFileSync(
      join(outputDirectory, "manifest.json"),
      `${JSON.stringify(manifest, null, 2)}\n`,
    );

    console.log(`Built ${assets.length} UI assets in ${outputDirectory}`);
  } finally {
    rmSync(temporaryDirectory, { recursive: true, force: true });
  }
}

main();
