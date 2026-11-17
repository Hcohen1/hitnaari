import sharp from "sharp";
import ffmpegPath from "ffmpeg-static";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  rmSync,
  readdirSync,
  readFileSync,
  statSync,
} from "node:fs";import { join } from "node:path";

const ROOT = process.cwd();
const SOURCE_ROOT = join(ROOT, "..");
// Media is served from S3, never bundled into the Lambda zip.
const MEDIA_DIR = join(ROOT, "media-build");
const FRAMES_DIR = join(ROOT, ".frames");

if (existsSync(MEDIA_DIR)) rmSync(MEDIA_DIR, { recursive: true });
if (existsSync(FRAMES_DIR)) rmSync(FRAMES_DIR, { recursive: true });
mkdirSync(FRAMES_DIR, { recursive: true });
mkdirSync(join(MEDIA_DIR, "flyers"), { recursive: true });
mkdirSync(join(MEDIA_DIR, "videos"), { recursive: true });

const RAW = join(SOURCE_ROOT, "RAW MATERIALS");

const FLYERS: Array<{ target: string; source: string }> = [
  { target: "ima/1", source: join(RAW, "image-1794872246440.png") },
  { target: "ima/2", source: join(RAW, "image-1794872292769.png") },
  { target: "hitnaari/1", source: join(RAW, "image-1794872282882.png") },
  { target: "hitnaari/2", source: join(RAW, "image-1794872306265.png") },
  { target: "isha/1", source: join(RAW, "image-1794872324043.png") },
  { target: "isha/2", source: join(RAW, "image-1794872400741.png") },
  { target: "general/1", source: join(RAW, "image-1794872408544.png") },
  { target: "general/2", source: join(RAW, "image-1794872449145.png") },
];

async function processFlyers() {
  for (const f of FLYERS) {
    const outDir = join(MEDIA_DIR, "flyers", f.target.split("/")[0]);
    mkdirSync(outDir, { recursive: true });
    const out = join(MEDIA_DIR, "flyers", `${f.target}.webp`);
    // Never upscale (sources top out ~1376px) and never crop; keep native detail.
    const info = await sharp(f.source)
      .rotate()
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 92, effort: 6, smartSubsample: true })
      .toFile(out);
    const meta = await sharp(out).metadata();
    console.log(
      `flyer ${f.target}.webp  ${meta.width}x${meta.height}  (${(info.size / 1024).toFixed(0)} KB)`
    );
  }
}

function transcodeVideo(src: string, index: number) {
  const out = join(MEDIA_DIR, "videos", `v${index}.mp4`);
  const poster = join(MEDIA_DIR, "videos", `v${index}.jpg`);
  const frame = join(FRAMES_DIR, `v${index}.jpg`);

  // Sources top out at 1024x576, so capping at 1280 wide means native resolution
  // at high quality (no upscaling, no downscaling) while staying streamable.
  execFileSync(
    ffmpegPath!,
    [
      "-y",
      "-i",
      src,
      "-vf",
      "scale='min(1280,iw)':-2",
      "-c:v",
      "libx264",
      "-preset",
      "medium",
      "-crf",
      "23",
      "-maxrate",
      "1500k",
      "-bufsize",
      "3000k",
      "-profile:v",
      "high",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-b:a",
      "112k",
      "-movflags",
      "+faststart",
      out,
    ],
    { stdio: ["ignore", "ignore", "ignore"] }
  );

  execFileSync(
    ffmpegPath!,
    [
      "-y",
      "-ss",
      "2",
      "-i",
      src,
      "-frames:v",
      "1",
      "-vf",
      "scale='min(1280,iw)':-2",
      "-q:v",
      "3",
      poster,
    ],
    { stdio: ["ignore", "ignore", "ignore"] }
  );

  execFileSync(
    ffmpegPath!,
    [
      "-y",
      "-ss",
      "2",
      "-i",
      src,
      "-frames:v",
      "1",
      "-vf",
      "scale='min(1280,iw)':-2",
      "-q:v",
      "3",
      frame,
    ],
    { stdio: ["ignore", "ignore", "ignore"] }
  );

  const mb = (statSync(out).size / 1048576).toFixed(1);
  console.log(`video v${index}.mp4  <- ${src.split(/[\\/]/).pop()}  (${mb} MB)`);
}

async function main() {
  await processFlyers();

  const rawDir = RAW;
  const videos = readdirSync(RAW)
    .filter((f) => f.toLowerCase().endsWith(".mp4"))
    .sort();

  // Indices stay tied to the sorted file list so v1..vN never shift; exact
  // duplicates are encoded once and skipped.
  const seen = new Map<string, number>();
  videos.forEach((name, i) => {
    const full = join(RAW, name);
    const hash = createHash("sha256").update(readFileSync(full)).digest("hex");
    const firstIndex = seen.get(hash);
    if (firstIndex) {
      console.log(`video v${i + 1}.mp4  skipped (identical to v${firstIndex})`);
      return;
    }
    seen.set(hash, i + 1);
    transcodeVideo(full, i + 1);
  });

  console.log(`\nprocessed ${videos.length} videos, ${FLYERS.length} flyers`);
  console.log("output in media-build/ — run `npm run assets:upload` to publish");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
