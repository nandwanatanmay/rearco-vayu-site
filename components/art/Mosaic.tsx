import { rng } from "./rand";

/**
 * Pixel mosaic — the five elements dissolving into a grid.
 * Density falls off from one corner so it reads as drift, not noise.
 */
export function Mosaic({
  cols = 18,
  rows = 12,
  seed = 7,
  origin = "tr",
  className,
}: {
  cols?: number;
  rows?: number;
  seed?: number;
  origin?: "tr" | "tl" | "br" | "bl";
  className?: string;
}) {
  const rand = rng(seed);
  const cells: { x: number; y: number; o: number }[] = [];
  const ox = origin.includes("r") ? cols : 0;
  const oy = origin.includes("b") ? rows : 0;
  const maxD = Math.hypot(cols, rows);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const d = Math.hypot(x - ox, y - oy) / maxD;
      const p = Math.pow(1 - d, 2.6);
      if (rand() < p) cells.push({ x, y, o: 0.35 + rand() * 0.65 });
    }
  }
  return (
    <svg viewBox={`0 0 ${cols} ${rows}`} className={className} aria-hidden="true" shapeRendering="crispEdges">
      {cells.map((c, i) => (
        <rect key={i} x={c.x} y={c.y} width="0.92" height="0.92" fill="currentColor" opacity={c.o} />
      ))}
    </svg>
  );
}
