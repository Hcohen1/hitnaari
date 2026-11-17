import { build } from "esbuild";
import { mkdirSync } from "node:fs";

await build({
  entryPoints: ["lambda/index.ts"],
  outfile: "dist-lambda/index.cjs",
  bundle: true,
  platform: "node",
  target: "node20",
  format: "cjs",
  minify: true,
  sourcemap: false,
});
mkdirSync("dist-lambda", { recursive: true });
console.log("lambda handler bundled -> dist-lambda/index.cjs");
