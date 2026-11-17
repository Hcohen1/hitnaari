import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, cpSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const STAGING = join(ROOT, "dist-staging");
const ZIP = join(ROOT, "function.zip");

if (existsSync(STAGING)) rmSync(STAGING, { recursive: true });
mkdirSync(join(STAGING, "static"), { recursive: true });

// Vite build output goes to ./dist — copy under static/
cpSync(join(ROOT, "dist"), join(STAGING, "static"), { recursive: true });
cpSync(join(ROOT, "dist-lambda", "index.cjs"), join(STAGING, "index.cjs"));

if (existsSync(ZIP)) rmSync(ZIP);

const ps = `
$src = '${STAGING}';
$dst = '${ZIP}';
Compress-Archive -Path (Join-Path $src '*') -DestinationPath $dst -CompressionLevel Optimal;
`;
execFileSync("powershell.exe", ["-NoProfile", "-Command", ps], {
  stdio: "inherit",
});

const sizeMb = (statSync(ZIP).size / 1024 / 1024).toFixed(2);
console.log(`function.zip created (${sizeMb} MB)`);
if (Number(sizeMb) > 48) {
  console.warn(
    "WARNING: package is close to the 50 MB direct-upload limit for Lambda!"
  );
}
