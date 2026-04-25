// ==================================================
// GEOMETRY HELPERS
// ==================================================

export const distance = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay);

export function normalize(x, y) {
  const length = Math.hypot(x, y) || 1;
  return { x: x / length, y: y / length, length };
}
