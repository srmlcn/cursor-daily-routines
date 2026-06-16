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
