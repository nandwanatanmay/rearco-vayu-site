import type { Door, Point } from './data/types';

/** SVG `points` attribute for a polygon. */
export const pts = (p: Point[]) => p.map(([x, y]) => `${x},${y}`).join(' ');

/** Axis-aligned bounding box [x, y, w, h]. */
export function bbox(p: Point[]): [number, number, number, number] {
  const xs = p.map((q) => q[0]);
  const ys = p.map((q) => q[1]);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return [x, y, Math.max(...xs) - x, Math.max(...ys) - y];
}

/**
 * Door symbol: the open leaf (hinge → open tip) plus the swing arc from the
 * closed tip to the open tip, centred on the hinge.
 */
export function doorPaths(d: Door) {
  const [hx, hy] = d.h;
  const [cx, cy] = d.c;
  const [ox, oy] = d.o;
  const r = Math.hypot(cx - hx, cy - hy);
  // SVG y axis points down, so a positive cross product is a clockwise sweep.
  const cross = (cx - hx) * (oy - hy) - (cy - hy) * (ox - hx);
  const sweep = cross > 0 ? 1 : 0;
  return {
    leaf: `M${hx},${hy} L${ox},${oy}`,
    arc: `M${cx},${cy} A${r},${r} 0 0 ${sweep} ${ox},${oy}`,
    opening: `M${hx},${hy} L${cx},${cy}`,
  };
}

/** Format millimetres as "3810" and metres as "3.81 m". */
export const mm = (v: number) => `${v}`;
export const metres = (v: number) => `${(v / 1000).toFixed(2)} m`;
