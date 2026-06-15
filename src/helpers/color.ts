export function clamp(v: number, a = 0, b = 1) {
  return Math.max(a, Math.min(b, v));
}

function toHex(n: number) {
  const h = Math.round(clamp(n, 0, 255)).toString(16);
  return h.length === 1 ? `0${h}` : h;
}

export function alphaToHex(alpha: number) {
  return toHex(Math.round(clamp(alpha, 0, 1) * 255));
}

export function applyAlpha(color: string, alpha: number) {
  if (!color) return color;
  color = color.trim();
  // #rrggbb
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    if (hex.length === 6) {
      return `#${hex}${alphaToHex(alpha)}`;
    }
    // already has alpha or short form - return as-is for safety
    if (hex.length === 8) return color;
    if (hex.length === 3) {
      // expand #rgb -> #rrggbb
      const r = hex[0] + hex[0];
      const g = hex[1] + hex[1];
      const b = hex[2] + hex[2];
      return `#${r}${g}${b}${alphaToHex(alpha)}`;
    }
    return color;
  }

  // rgb(...) -> rgba(...)
  if (color.startsWith("rgb(")) {
    return color.replace(/^rgb\((.*)\)$/, `rgba($1, ${clamp(alpha)})`);
  }
  if (color.startsWith("rgba(")) {
    // replace existing alpha
    return color.replace(/rgba\((\s*[\d\.]+,\s*[\d\.]+,\s*[\d\.]+),\s*[\d\.]+\s*\)/, `rgba($1, ${clamp(alpha)})`);
  }

  // as a last resort, return original color (some CSS variables or named colors)
  return color;
}

