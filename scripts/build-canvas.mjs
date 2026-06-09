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

// Returns { kind, names, path } or null if the line isn't an import.
//   kind: "canvas" | "relative-type" | "relative-value"
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

// ── Module inliner ────────────────────────────────────────────────────────────

const visited = new Set();

/**
 * Recursively inline a module file.
 * Returns the lines of the file with:
 *  - `import type` lines dropped
 *  - relative value imports inlined recursively
 *  - cursor/canvas imports dropped (collected separately)
 *  - `export` keyword stripped from declarations
 *  - `export { ... }` / `export * from` / `export type` lines dropped
 */
function inlineModule(filePath, canvasImports) {
  if (visited.has(filePath)) return [];
  visited.add(filePath);

  const src = readFileSync(filePath, "utf8");
  const dir = dirname(filePath);
  const lines = src.split("\n");
  const out = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Collect multi-line imports into one logical line
    let logical = line;
    if (/^import\s/.test(line) && !line.includes("from")) {
      let j = i + 1;
      while (j < lines.length && !lines[j - 1].includes("from")) {
        logical += " " + lines[j].trim();
        j++;
      }
      i = j;
    } else {
      i++;
    }

    const parsed = parseImport(logical.trim());

    if (!parsed) {
      // Re-export: `export { X } from "./relative"` — inline the source module
      const reExportMatch = logical.trim().match(/^export\s*(?:type\s*)?\{[^}]*\}\s*from\s*["']([^"']+)["']/);
      if (reExportMatch) {
        const rePath = reExportMatch[1];
        if (rePath.startsWith(".")) {
          const resolved = resolveFile(rePath, dir);
          const inner = inlineModule(resolved, canvasImports);
          if (inner.length) out.push("", ...inner, "");
        }
        continue;
      }

      // Strip standalone `export` keyword from declarations, keep the rest
      const stripped = logical
        .replace(/^export default /, "")
        .replace(/^export (function|class|const|let|var|type|interface|enum)/, "$1");
      // Drop bare `export { ... }` and `export * from` lines
      if (/^export\s*\{/.test(stripped) || /^export\s*\*/.test(stripped)) continue;
      out.push(stripped);
      continue;
    }

    if (parsed.kind === "canvas") {
      // Extract names and add to the shared set
      const match = parsed.raw.match(/\{([^}]+)\}/);
      if (match) {
        match[1].split(",").map((s) => s.trim()).filter(Boolean).forEach((name) => {
          // Handle aliased imports like `useHostTheme as useHostTheme2`
          const canonical = name.split(/\s+as\s+/)[0].trim();
          canvasImports.add(canonical);
        });
      }
      continue; // drop the import line
    }

    if (parsed.kind === "relative-type") continue; // drop type imports

    // relative-value: inline the module
    const resolved = resolveFile(parsed.path, dir);
    const inner = inlineModule(resolved, canvasImports);
    if (inner.length) out.push("", ...inner, "");
  }

  return out;
}

// ── Template bundler ──────────────────────────────────────────────────────────

function bundle(templatePath) {
  visited.clear();
  const src = readFileSync(templatePath, "utf8");
  const dir = dirname(templatePath);
  const lines = src.split("\n");

  const canvasImports = new Set();
  const bodyLines = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Collect multi-line imports into one logical line
    let logical = line;
    let consumed = 1;
    if (/^import\s/.test(line) && !line.includes("from")) {
      let j = i + 1;
      while (j < lines.length && !lines[j - 1].includes("from")) {
        logical += " " + lines[j].trim();
        j++;
      }
      consumed = j - i;
    }
    i += consumed;

    const parsed = parseImport(logical.trim());

    if (!parsed) {
      bodyLines.push(line);
      // Re-add the continuation lines we consumed
      if (consumed > 1) {
        // Already folded into logical — body only needs the original lines
        for (let k = 1; k < consumed; k++) bodyLines.push(lines[i - consumed + k]);
      }
      continue;
    }

    if (parsed.kind === "canvas") {
      const match = parsed.raw.match(/\{([^}]+)\}/);
      if (match) {
        match[1].split(",").map((s) => s.trim()).filter(Boolean).forEach((name) => {
          const canonical = name.split(/\s+as\s+/)[0].trim();
          canvasImports.add(canonical);
        });
      }
      // Replace this import line with a placeholder we'll fill later
      bodyLines.push("__CANVAS_IMPORT__");
      continue;
    }

    if (parsed.kind === "relative-type") continue; // drop

    // relative-value: inline at this position
    const resolved = resolveFile(parsed.path, dir);
    const inner = inlineModule(resolved, canvasImports);
    if (inner.length) bodyLines.push("", ...inner, "");
  }

  // Build the single deduplicated cursor/canvas import
  const canonicalImport = `import { ${[...canvasImports].sort().join(", ")} } from "cursor/canvas";`;

  // Replace the first __CANVAS_IMPORT__ placeholder with the real import,
  // remove any subsequent ones
  let first = true;
  const finalLines = bodyLines.map((l) => {
    if (l === "__CANVAS_IMPORT__") {
      if (first) { first = false; return canonicalImport; }
      return null;
    }
    return l;
  }).filter((l) => l !== null);

  return finalLines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}

// ── Main ──────────────────────────────────────────────────────────────────────

mkdirSync(resolve(ROOT, "dist"), { recursive: true });

for (const { src, out } of ENTRIES) {
  const result = bundle(resolve(ROOT, src));
  writeFileSync(resolve(ROOT, out), result);
  console.log(`✓ ${out}`);
}
