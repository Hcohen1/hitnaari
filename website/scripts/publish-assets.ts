import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const MEDIA_DIR = join(ROOT, "media-build");
const BUCKET = process.env.MEDIA_BUCKET ?? "hitnaari-media";

if (!existsSync(MEDIA_DIR)) {
  console.error("media-build/ not found — run `npm run assets` first.");
  process.exit(1);
}

// Media filenames are stable, so use a 1-day TTL: fast repeat visits without
// leaving stale flyers on screen for weeks after an update.
execFileSync(
  "aws",
  [
    "s3",
    "sync",
    MEDIA_DIR,
    `s3://${BUCKET}/media/`,
    "--cache-control",
    "public, max-age=86400",
    "--only-show-errors",
  ],
  { stdio: "inherit" }
);

console.log(`published media-build/ -> s3://${BUCKET}/media/`);
