/**
 * Maps a product palette (freeform hex strings) onto the storefront's fixed
 * colour families used by the catalogue filter. Each hex is bucketed to its
 * nearest reference colour in RGB space — simple, deterministic, good enough
 * for "show me the pink ones".
 */

const FAMILIES: Record<string, [number, number, number]> = {
  white: [255, 255, 255],
  blush: [245, 184, 196],
  warm: [232, 160, 74],
  deep: [122, 35, 48],
  green: [122, 138, 90],
  lilac: [200, 178, 232],
};

export const COLOR_FAMILIES = Object.keys(FAMILIES);

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace("#", "").trim();
  if (m.length !== 6) return null;
  const n = parseInt(m, 16);
  if (Number.isNaN(n)) return null;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function classifyHex(hex: string): string | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  let best: string | null = null;
  let bestDist = Infinity;
  for (const [family, ref] of Object.entries(FAMILIES)) {
    const d = (rgb[0] - ref[0]) ** 2 + (rgb[1] - ref[1]) ** 2 + (rgb[2] - ref[2]) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = family;
    }
  }
  return best;
}

/** True if any colour in the palette bucket-matches the requested family. */
export function paletteMatchesColor(palette: unknown, family: string): boolean {
  if (!Array.isArray(palette)) return false;
  return palette.some((h) => typeof h === "string" && classifyHex(h) === family);
}
