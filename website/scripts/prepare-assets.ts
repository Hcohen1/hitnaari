import sharp from "sharp";
import ffmpegPath from "ffmpeg-static";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const SOURCE_ROOT = join(ROOT, "..");
const MEDIA_DIR = join(ROOT, "public", "media");
const FRAMES_DIR = join(ROOT, ".frames");

if (existsSync(MEDIA_DIR)) rmSync(MEDIA_DIR, { recursive: true });
if (existsSync(FRAMES_DIR)) rmSync(FRAMES_DIR, { recursive: true });
mkdirSync(FRAMES_DIR, { recursive: true });
mkdirSync(join(MEDIA_DIR, "flyers"), { recursive: true });
mkdirSync(join(MEDIA_DIR, "videos"), { recursive: true });

const FLYERS: Array<{ target: string; source: string }> = [
  {
    target: "ima/1",
    source: join(SOURCE_ROOT, "RAW MATERIALS", "image-1794872246440.png"),
  },
  { target: "ima/2", source: join(SOURCE_ROOT, "image-1794872292769.png") },
  {
    target: "hitnaari/1",
    source: join(SOURCE_ROOT, "image-1794872282882.png"),
  },
  {
    target: "hitnaari/2",
    source: join(SOURCE_ROOT, "image-1794872306265.png"),
  },
  {
    target: "isha/1",
    source: join(SOURCE_ROOT, "image-1794872324043.png"),
  },
  {
    target: "isha/2",
    source: join(SOURCE_ROOT, "image-1794872400741.png"),
  },
  {
    target: "general/1",
    source: join(SOURCE_ROOT, "image-1794872408544.png"),
  },
  {
    target: "general/2",
    source: join(SOURCE_ROOT, "image-1794872449145.png"),
  },
];

async function processFlyers() {
  for (const f of FLYERS) {
    const outDir = join(MEDIA_DIR, "flyers", f.target.split("/")[0]);
    mkdirSync(outDir, { recursive: true });
    const out = join(MEDIA_DIR, "flyers", `${f.target}.webp`);
    const info = await sharp(f.source)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(out);
    console.log(`flyer ${f.target}.webp  <- ${f.source.split(/[\\/]/).pop()}  (${(info.size / 1024).toFixed(0)} KB)`);
  }
}

function transcodeVideo(src: string, index: number) {
  const out = join(MEDIA_DIR, "videos", `v${index}.mp4`);
  const poster = join(MEDIA_DIR, "videos", `v${index}.jpg`);
  const frame = join(FRAMES_DIR, `v${index}.jpg`);

  execFileSync(
    ffmpegPath!,
    [
      "-y",
      "-i",
      src,
      "-vf",
      "scale='min(480,iw)':-2",
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "31",
      "-maxrate",
      "450k",
      "-bufsize",
      "900k",
      "-c:a",
      "aac",
      "-b:a",
      "80k",
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
      "scale='min(480,iw)':-2",
      "-q:v",
      "5",
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
      "scale='min(480,iw)':-2",
      "-q:v",
      "5",
      frame,
    ],
    { stdio: ["ignore", "ignore", "ignore"] }
  );

  console.log(`video v${index}.mp4  <- ${src.split(/[\\/]/).pop()}`);
}

async function main() {
  await processFlyers();

  const rawDir = join(SOURCE_ROOT, "RAW MATERIALS");
  const videos = readdirSync(rawDir)
    .filter((f) => f.toLowerCase().endsWith(".mp4"))
    .sort();
  videos.forEach((v, i) => transcodeVideo(join(rawDir, v), i + 1));

  console.log(`\nprocessed ${videos.length} videos, ${FLYERS.length} flyers`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
