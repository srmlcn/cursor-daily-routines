/**
 * build-canvas.mjs
 *
 * Bundles each canvas template into a self-contained file that imports only
 * from "cursor/canvas" — no relative imports — so the Cursor canvas renderer
 * can load it directly.
 *
 * Strategy: custom text-based inliner rather than esbuild, so that the
 * template's exact structure (comments, section markers, data section) is
 * preserved verbatim. Only the relative-import lines are replaced with the
 * resolved component/helper code.
 *
 * Run:  npm run build
 * Out:  dist/skill-tracker.template.canvas.tsx
 *       dist/briefing.template.canvas.tsx
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname, extname } from "path";
import { fileURLToPath } from "url";
import {
  parseImportSpecifiers,
  parseReExportLine,
  isBarrelOnly,
  findTopLevelDeclarations,
  extractDeclarationLines,
  parseTopLevelBindingName,
} from "./build/lib.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const ENTRIES = [
  {
    src: "canvases/skill-tracker.template.canvas.tsx",
    out: "dist/skill-tracker.template.canvas.tsx",
  },
  {
    src: "skills/daily-briefing/template.canvas.tsx",
    out: "dist/briefing.template.canvas.tsx",
  },
];

// ── Resolver ──────────────────────────────────────────────────────────────────

function resolveFile(importPath, fromDir) {
  const candidates = [
    resolve(fromDir, importPath),
    resolve(fromDir, importPath + ".ts"),
    resolve(fromDir, importPath + ".tsx"),
    resolve(fromDir, importPath, "index.ts"),
    resolve(fromDir, importPath, "index.tsx"),
  ];
  for (const c of candidates) {
    try {
      readFileSync(c);
      return c;
    } catch {}
  }
  throw new Error(`Cannot resolve "${importPath}" from "${fromDir}"`);
}

// ── Import line parser ────────────────────────────────────────────────────────

function parseImport(line) {
  const m = line.match(/^import\s+(type\s+)?(\{[^}]+\}|\*\s+as\s+\w+|\w+)\s+from\s+["']([^"']+)["']/);
  if (!m) return null;
  const isType = !!m[1];
  const path = m[3];
  const isRelative = path.startsWith(".");
  if (!isRelative && path !== "cursor/canvas") return null;
  if (!isRelative) return { kind: "canvas", raw: line };
  return { kind: isType ? "relative-type" : "relative-value", path, raw: line };
}

function collectLogicalImport(lines, startIdx) {
  let logical = lines[startIdx];
  let i = startIdx + 1;
  if (/^import\s/.test(logical) && !logical.includes("from")) {
    while (i < lines.length && !lines[i - 1].includes("from")) {
      logical += " " + lines[i].trim();
      i++;
    }
    return { logical: logical.trim(), nextIdx: i, rawLine: lines[startIdx] };
  }
  return { logical: logical.trim(), nextIdx: i, rawLine: logical };
}

function collectCanvasNames(raw, canvasImports) {
  for (const { local } of parseImportSpecifiers(raw)) {
    if (local !== "*") canvasImports.add(local);
  }
}

function stripExport(line) {
  return line
    .replace(/^export default /, "")
    .replace(/^export (function|class|const|let|var|type|interface|enum)/, "$1");
}

// ── Module inliner ────────────────────────────────────────────────────────────

function processImportLine(logical, dir, canvasImports, neededSymbols, symbolRegistry) {
  const parsed = parseImport(logical);
  if (!parsed) return null;

  if (parsed.kind === "canvas") {
    collectCanvasNames(parsed.raw, canvasImports);
    return { kind: "canvas" };
  }
  if (parsed.kind === "relative-type") return { kind: "skip" };

  const specifiers = parseImportSpecifiers(parsed.raw);
  const childNeeded = new Set(specifiers.map((s) => s.local));
  const resolved = resolveFile(parsed.path, dir);
  const inner = inlineModule(resolved, canvasImports, childNeeded, symbolRegistry);
  return { kind: "inline", lines: inner };
}

function inlineBarrel(src, dir, canvasImports, neededSymbols, symbolRegistry) {
  const out = [];
  for (const line of src.split("\n")) {
    const re = parseReExportLine(line);
    if (!re || !re.path.startsWith(".")) continue;

    const targetSymbols = new Set();
    for (const { exported, local } of re.names) {
      if (neededSymbols.has(local) || neededSymbols.has(exported)) {
        targetSymbols.add(exported);
      }
    }
    if (targetSymbols.size === 0) continue;

    const resolved = resolveFile(re.path, dir);
    const inner = inlineModule(resolved, canvasImports, targetSymbols, symbolRegistry);
    if (inner.length) out.push("", ...inner, "");
  }
  return out;
}

function inlineTsModuleClean(src, dir, canvasImports, neededSymbols, symbolRegistry) {
  const pending = new Set([...neededSymbols].filter((n) => !symbolRegistry.has(n)));
  if (pending.size === 0) return [];

  const out = [];
  const lines = src.split("\n");
  let i = 0;

  while (i < lines.length) {
    const { logical, nextIdx } = collectLogicalImport(lines, i);
    i = nextIdx;

    const importResult = processImportLine(logical, dir, canvasImports, neededSymbols, symbolRegistry);
    if (importResult?.kind === "inline" && importResult.lines.length) {
      out.push("", ...importResult.lines, "");
      continue;
    }
    if (importResult) continue;
  }

  const declLines = extractDeclarationLines(src, pending, symbolRegistry);
  if (declLines.length) {
    if (out.length) out.push("");
    out.push(...declLines);
  }

  return out;
}

function registerExportedSymbols(src, symbolRegistry) {
  for (const decl of findTopLevelDeclarations(src)) {
    if (decl.isExport) symbolRegistry.add(decl.name);
  }
}

function inlineComponentModule(src, dir, canvasImports, neededSymbols, symbolRegistry) {
  const decls = findTopLevelDeclarations(src);
  const exportsNeeded = [...neededSymbols].filter((n) => {
    const d = decls.find((d) => d.name === n && d.isExport);
    return d && !symbolRegistry.has(n);
  });
  if (exportsNeeded.length === 0) return [];

  const out = [];
  const lines = src.split("\n");
  let i = 0;

  while (i < lines.length) {
    const { logical, nextIdx, rawLine } = collectLogicalImport(lines, i);
    i = nextIdx;

    const importResult = processImportLine(logical, dir, canvasImports, neededSymbols, symbolRegistry);
    if (importResult?.kind === "inline" && importResult.lines.length) {
      out.push("", ...importResult.lines, "");
      continue;
    }
    if (importResult) continue;

    const stripped = stripExport(rawLine);
    if (/^export\s*\{/.test(stripped) || /^export\s*\*/.test(stripped)) continue;
    out.push(stripped);
  }

  registerExportedSymbols(src, symbolRegistry);
  return out;
}

function inlineModule(filePath, canvasImports, neededSymbols, symbolRegistry) {
  const src = readFileSync(filePath, "utf8");
  const dir = dirname(filePath);

  if (isBarrelOnly(src)) {
    return inlineBarrel(src, dir, canvasImports, neededSymbols, symbolRegistry);
  }

  if (extname(filePath) === ".tsx") {
    return inlineComponentModule(src, dir, canvasImports, neededSymbols, symbolRegistry);
  }

  return inlineTsModuleClean(src, dir, canvasImports, neededSymbols, symbolRegistry);
}

// ── Template bundler ──────────────────────────────────────────────────────────

function bundle(templatePath) {
  const src = readFileSync(templatePath, "utf8");
  const dir = dirname(templatePath);
  const lines = src.split("\n");

  const canvasImports = new Set();
  const symbolRegistry = new Set();
  const bodyLines = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const { logical, nextIdx } = collectLogicalImport(lines, i);
    const consumed = nextIdx - i;
    i = nextIdx;

    const parsed = parseImport(logical);

    if (!parsed) {
      bodyLines.push(line);
      if (consumed > 1) {
        for (let k = 1; k < consumed; k++) {
          bodyLines.push(lines[i - consumed + k]);
        }
      }
      continue;
    }

    if (parsed.kind === "canvas") {
      collectCanvasNames(parsed.raw, canvasImports);
      bodyLines.push("__CANVAS_IMPORT__");
      continue;
    }

    if (parsed.kind === "relative-type") continue;

    const specifiers = parseImportSpecifiers(parsed.raw);
    const needed = new Set(specifiers.map((s) => s.local));
    const resolved = resolveFile(parsed.path, dir);
    const inner = inlineModule(resolved, canvasImports, needed, symbolRegistry);
    if (inner.length) bodyLines.push("", ...inner, "");
  }

  const canonicalImport = `import { ${[...canvasImports].sort().join(", ")} } from "cursor/canvas";`;

  let first = true;
  const finalLines = bodyLines
    .map((l) => {
      if (l === "__CANVAS_IMPORT__") {
        if (first) {
          first = false;
          return canonicalImport;
        }
        return null;
      }
      return l;
    })
    .filter((l) => l !== null);

  return finalLines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}

// ── Main ──────────────────────────────────────────────────────────────────────

const isMain =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  mkdirSync(resolve(ROOT, "dist"), { recursive: true });

  for (const { src, out } of ENTRIES) {
    const result = bundle(resolve(ROOT, src));
    writeFileSync(resolve(ROOT, out), result);
    console.log(`✓ ${out}`);
  }
}

export { bundle };
