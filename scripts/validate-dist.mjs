/**
 * validate-dist.mjs
 *
 * Bundles each dist/*.canvas.tsx with esbuild (cursor/canvas external) to verify
 * the build output parses and has no duplicate top-level bindings.
 *
 * Run: npm run validate  (after npm run build)
 */

import { readFileSync, readdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import esbuild from "esbuild";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = resolve(ROOT, "dist");

const entryPoints = readdirSync(DIST)
  .filter((f) => f.endsWith(".canvas.tsx"))
  .map((f) => resolve(DIST, f));

if (entryPoints.length === 0) {
  console.error("validate-dist: no dist/*.canvas.tsx files — run npm run build first");
  process.exit(1);
}

for (const entry of entryPoints) {
  const label = entry.slice(ROOT.length + 1);
  try {
    esbuild.buildSync({
      entryPoints: [entry],
      bundle: true,
      write: false,
      platform: "neutral",
      format: "esm",
      jsx: "preserve",
      external: ["cursor/canvas"],
      logLevel: "silent",
    });
    console.log(`✓ ${label}`);
  } catch (err) {
    console.error(`✗ ${label}`);
    console.error(err.message);
    process.exit(1);
  }
}
