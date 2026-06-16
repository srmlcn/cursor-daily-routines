/**
 * Shared helpers for canvas template bundling and tests.
 */

// ── Import / re-export parsing ────────────────────────────────────────────────

/** @returns {{ imported: string, local: string }[]} */
export function parseImportSpecifiers(raw) {
  const brace = raw.match(/^import\s+(?:type\s+)?\{([^}]+)\}/);
  if (brace) {
    return brace[1]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((part) => {
        const bits = part.split(/\s+as\s+/).map((s) => s.trim());
        const imported = bits[0];
        const local = bits[1] ?? imported;
        return { imported, local };
      });
  }
  const def = raw.match(/^import\s+(\w+)\s+from\s+/);
  if (def) return [{ imported: def[1], local: def[1] }];
  const ns = raw.match(/^import\s+\*\s+as\s+(\w+)\s+from\s+/);
  if (ns) return [{ imported: "*", local: ns[1] }];
  return [];
}

/** @returns {{ names: { exported: string, local: string }[], path: string } | null} */
export function parseReExportLine(line) {
  const m = line
    .trim()
    .match(/^export\s*(?:type\s*)?\{([^}]*)\}\s*from\s*["']([^"']+)["']/);
  if (!m) return null;
  const names = m[1]
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((part) => {
      const bits = part.split(/\s+as\s+/).map((s) => s.trim());
      const exported = bits[0];
      const local = bits[1] ?? exported;
      return { exported, local };
    });
  return { names, path: m[2] };
}

export function isBarrelOnly(src) {
  const lines = src
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("//"));
  return lines.length > 0 && lines.every((l) => /^export\s/.test(l) && /\sfrom\s+["']/.test(l));
}

// ── Top-level declaration parsing ─────────────────────────────────────────────

/**
 * @typedef {{ name: string, isExport: boolean, text: string, startLine: number }} Declaration
 */

/** @returns {Declaration[]} */
export function findTopLevelDeclarations(src) {
  const lines = src.split("\n");
  /** @type {Declaration[]} */
  const decls = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (
      !trimmed ||
      trimmed.startsWith("//") ||
      /^import\s/.test(trimmed) ||
      (/^export\s*\{/.test(trimmed) && /\sfrom\s+["']/.test(trimmed))
    ) {
      i++;
      continue;
    }

    let name = null;
    let isExport = false;

    const patterns = [
      /^(export\s+)?function\s+(\w+)/,
      /^(export\s+)?class\s+(\w+)/,
      /^(export\s+)?(?:const|let|var)\s+(\w+)/,
      /^(export\s+)?(?:interface|type)\s+(\w+)/,
    ];

    for (const p of patterns) {
      const m = line.match(p);
      if (m) {
        isExport = Boolean(m[1]);
        name = m[2];
        break;
      }
    }

    if (!name) {
      const defFn = trimmed.match(/^export\s+default\s+function\s+(\w+)/);
      if (defFn) {
        name = defFn[1];
        isExport = true;
      }
    }

    if (!name) {
      i++;
      continue;
    }

    const start = i;
    let text = line;
    let braceDepth = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;

    if (/^(export\s+)?(?:interface|type)\s/.test(trimmed)) {
      i++;
      while (i < lines.length && braceDepth > 0) {
        text += "\n" + lines[i];
        braceDepth += (lines[i].match(/\{/g) || []).length - (lines[i].match(/\}/g) || []).length;
        i++;
      }
    } else if (trimmed.includes("{")) {
      i++;
      while (i < lines.length && braceDepth > 0) {
        text += "\n" + lines[i];
        braceDepth += (lines[i].match(/\{/g) || []).length - (lines[i].match(/\}/g) || []).length;
        i++;
      }
    } else {
      i++;
    }

    decls.push({ name, isExport, text, startLine: start });
  }

  return decls;
}

/** @param {Declaration[]} decls */
export function expandWithSameFileDeps(decls, seedNames) {
  const names = new Set(seedNames);
  const byName = new Map(decls.map((d) => [d.name, d]));
  let changed = true;

  while (changed) {
    changed = false;
    for (const name of [...names]) {
      const decl = byName.get(name);
      if (!decl) continue;
      for (const other of decls) {
        if (!other.name || names.has(other.name)) continue;
        const re = new RegExp(`\\b${other.name}\\b`);
        if (re.test(decl.text)) {
          names.add(other.name);
          changed = true;
        }
      }
    }
  }

  return names;
}

/**
 * @param {string} src
 * @param {Set<string>} symbolNames
 * @param {Set<string>} symbolRegistry
 * @returns {string[]}
 */
export function extractDeclarationLines(src, symbolNames, symbolRegistry) {
  const decls = findTopLevelDeclarations(src);
  const expanded = expandWithSameFileDeps(
    decls,
    [...symbolNames].filter((n) => !symbolRegistry.has(n)),
  );

  const lines = [];
  for (const decl of decls) {
    if (!expanded.has(decl.name)) continue;
    if (symbolRegistry.has(decl.name)) continue;
    const stripped = decl.text
      .replace(/^export default /, "")
      .replace(/^export (function|class|const|let|var|interface|type)/, "$1");
    lines.push(...stripped.split("\n"));
    symbolRegistry.add(decl.name);
  }

  return lines;
}

/** @returns {string | null} */
export function parseTopLevelBindingName(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("import ")) return null;

  const patterns = [
    /^export\s+default\s+function\s+(\w+)/,
    /^export\s+function\s+(\w+)/,
    /^function\s+(\w+)/,
    /^export\s+const\s+(\w+)/,
    /^const\s+(\w+)/,
    /^export\s+class\s+(\w+)/,
    /^class\s+(\w+)/,
  ];

  for (const p of patterns) {
    const m = trimmed.match(p);
    if (m) return m[1];
  }
  return null;
}
