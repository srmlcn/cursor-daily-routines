import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseImportSpecifiers,
  parseReExportLine,
  findTopLevelDeclarations,
  extractDeclarationLines,
  parseTopLevelBindingName,
} from "./build/lib.mjs";
import { bundle } from "./build-canvas.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("parseImportSpecifiers handles aliases", () => {
  const specs = parseImportSpecifiers(
    'import { sk, toMins as tm } from "../../src/helpers"',
  );
  assert.deepEqual(specs, [
    { imported: "sk", local: "sk" },
    { imported: "toMins", local: "tm" },
  ]);
});

test("parseReExportLine reads barrel exports", () => {
  const re = parseReExportLine('export { sk, skillStats } from "./skill";');
  assert.equal(re.path, "./skill");
  assert.deepEqual(re.names, [
    { exported: "sk", local: "sk" },
    { exported: "skillStats", local: "skillStats" },
  ]);
});

test("extractDeclarationLines pulls same-file dependencies", () => {
  const src = readFileSync(resolve(ROOT, "src/helpers/time.ts"), "utf8");
  const registry = new Set();
  const lines = extractDeclarationLines(src, new Set(["fmtT"]), registry);
  const text = lines.join("\n");
  assert.match(text, /function fmtT/);
  assert.match(text, /function fmtMins/);
  assert.match(text, /function toMins/);
  assert.doesNotMatch(text, /function getCurrentBlockIdx/);
});

test("bundle briefing dist has a single getCurrentBlockIdx", () => {
  execSync("node scripts/build-canvas.mjs", { cwd: ROOT, stdio: "pipe" });
  const content = readFileSync(
    resolve(ROOT, "dist/briefing.template.canvas.tsx"),
    "utf8",
  );
  const count = (content.match(/function getCurrentBlockIdx/g) || []).length;
  assert.equal(count, 1);
});

test("bundle throws on template symbol collision", () => {
  const tmpDir = resolve(ROOT, ".tmp-collision-test");
  mkdirSync(tmpDir, { recursive: true });
  const template = resolve(tmpDir, "collision.template.canvas.tsx");
  writeFileSync(
    template,
    `import { useCanvasState } from "cursor/canvas";
import { toMins } from "../src/helpers";

function toMins() { return 0; }

export default function CollisionTest() {
  const [x] = useCanvasState("x", 0);
  return <div>{x}</div>;
}
`,
  );

  try {
    assert.throws(() => bundle(template), /Symbol collision/);
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
});

test("parseTopLevelBindingName ignores sk() data calls", () => {
  assert.equal(parseTopLevelBindingName('  sk("r01", "Ruby", "Core"),'), null);
  assert.equal(parseTopLevelBindingName("function helper() {}"), "helper");
});
