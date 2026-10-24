// The mark: the Overview page's section rail in miniature. Six bars, one per
// section in page order, heights in proportion to what each section holds.

const INKS = ["#d1612f", "#2f7f7a", "#5f9a4a", "#e3b72b", "#6e4aa0", "#8a5a3b"]; // colour, type, space, components, surfaces, mcp
const EXTENT = [20, 25, 23, 16, 5, 4];

/**
 * @param {object} o
 * @param {number} o.size    viewBox size (square)
 * @param {number} o.inset   padding around the bars, in viewBox units
 * @param {string|null} o.ground  background fill, or null for transparent
 * @param {string} o.rule    baseline colour
 */
export function markSVG({ size = 32, inset = 3, ground = "#fbfbfa", rule = "#0b0b0c" } = {}) {
  // Small sizes snap to whole pixels so the bars stay crisp in a browser tab.
  const snap = size <= 48 ? Math.round : (n) => n;
  const max = Math.max(...EXTENT);
  const ruleH = snap(Math.max(1.5, size / 16));
  const base = size - inset - ruleH;
  const top = inset;
  const w = (size - inset * 2) / EXTENT.length;
  const bars = EXTENT.map((e, i) => {
    const h = snap(Math.max(ruleH, ((base - top) * e) / max));
    return `<rect x="${(inset + i * w).toFixed(2)}" y="${(base - h).toFixed(2)}" width="${(w + 0.02).toFixed(2)}" height="${h.toFixed(2)}" fill="${INKS[i]}"/>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">${ground ? `<rect width="${size}" height="${size}" fill="${ground}"/>` : ""}${bars}<rect x="${inset}" y="${base.toFixed(2)}" width="${size - inset * 2}" height="${ruleH.toFixed(2)}" fill="${rule}"/></svg>`;
}
