import { rng, r2 } from "./rand";

/**
 * Signature illustration: a slim residential tower wrapped by trees and sky gardens.
 * Windows use the `.win` class so they light up when <html data-time="night">.
 * Colours come from CSS classes in globals.css (.art-*) so day/night is pure CSS.
 */

type Blob = { cx: number; cy: number; r: number; tone: 1 | 2 | 3 };

function canopy(seed: number, cx: number, cy: number, w: number, h: number, count: number): Blob[] {
  const rand = rng(seed);
  const out: Blob[] = [];
  for (let i = 0; i < count; i++) {
    // ellipse-ish distribution, denser toward centre
    const a = rand() * Math.PI * 2;
    const d = Math.pow(rand(), 0.7);
    const x = cx + Math.cos(a) * d * (w / 2);
    const y = cy + Math.sin(a) * d * (h / 2);
    const r = 5 + rand() * 11 * (1 - d * 0.4);
    const tone = (y < cy - h * 0.15 ? 1 : y > cy + h * 0.2 ? 3 : 2) as 1 | 2 | 3;
    out.push({ cx: r2(x), cy: r2(y), r: r2(r), tone });
  }
  // draw back-to-front: darker (bottom) first
  return out.sort((p, q) => q.tone - p.tone);
}

const FLOORS = 26;
const TOP = 70;
const BOTTOM = 650;
const LEFT = 200;
const RIGHT = 320;
const FLOOR_H = (BOTTOM - TOP) / FLOORS;
const SKY_GARDENS = [6, 13, 20];

export function TowerArt({ className, id = "tw" }: { className?: string; id?: string }) {
  const rand = rng(42);

  const windows: { x: number; y: number; w: number; h: number; lit: "on" | "dim" | "off" }[] = [];
  for (let f = 0; f < FLOORS; f++) {
    if (SKY_GARDENS.includes(f)) continue;
    const y = TOP + 14 + f * FLOOR_H;
    for (let c = 0; c < 4; c++) {
      const x = LEFT + 14 + c * 24;
      const roll = rand();
      windows.push({ x, y, w: 18, h: FLOOR_H - 8, lit: roll > 0.45 ? "on" : roll > 0.2 ? "dim" : "off" });
    }
  }

  const leftTree = canopy(11, 150, 470, 210, 310, 520);
  const rightTree = canopy(23, 372, 440, 200, 340, 520);
  const gardens = SKY_GARDENS.flatMap((f, i) =>
    canopy(100 + i, (LEFT + RIGHT) / 2, TOP + f * FLOOR_H + FLOOR_H / 2 + 4, 170, 34, 34),
  );
  const shrubs = canopy(77, 260, 662, 360, 30, 70);

  return (
    <svg viewBox="0 0 520 720" className={className} role="img" aria-label="Illustration of Vāyu tower wrapped in trees and sky gardens">
      <defs>
        <radialGradient id={`${id}-glow`} cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="var(--glow)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <linearGradient id={`${id}-fin`} x1="0" x2="1">
          <stop offset="0%" className="art-fin-a" />
          <stop offset="100%" className="art-fin-b" />
        </linearGradient>
      </defs>

      <ellipse cx="260" cy="330" rx="260" ry="330" fill={`url(#${id}-glow)`} />

      {/* lawn */}
      <ellipse cx="260" cy="676" rx="250" ry="22" className="art-lawn" />
      <ellipse cx="260" cy="672" rx="120" ry="7" className="art-plinth" />

      {/* canopy masses (fill gaps between leaf clusters) */}
      <ellipse cx="150" cy="475" rx="92" ry="138" className="art-leaf-3" />
      <ellipse cx="372" cy="445" rx="88" ry="150" className="art-leaf-3" />

      {/* trees behind the tower */}
      {rightTree.filter((_, i) => i % 3 === 0).map((b, i) => (
        <circle key={`rb${i}`} cx={b.cx} cy={b.cy} r={b.r} className={`art-leaf-${b.tone}`} />
      ))}
      {leftTree.filter((_, i) => i % 3 === 0).map((b, i) => (
        <circle key={`lb${i}`} cx={b.cx} cy={b.cy} r={b.r} className={`art-leaf-${b.tone}`} />
      ))}

      {/* tower body */}
      <path
        d={`M${LEFT} ${BOTTOM} L${LEFT} ${TOP + 20} Q${LEFT} ${TOP} ${LEFT + 20} ${TOP} L${RIGHT - 20} ${TOP} Q${RIGHT} ${TOP} ${RIGHT} ${TOP + 20} L${RIGHT} ${BOTTOM} Z`}
        className="art-body"
      />
      {/* floor slabs */}
      {Array.from({ length: FLOORS + 1 }, (_, f) => (
        <line key={f} x1={LEFT} x2={RIGHT} y1={TOP + 6 + f * FLOOR_H} y2={TOP + 6 + f * FLOOR_H} className="art-slab" />
      ))}
      {windows.map((w, i) => (
        <rect key={i} x={w.x} y={w.y} width={w.w} height={w.h} rx="1.5" className={w.lit === "on" ? "win" : w.lit === "dim" ? "win dim" : "win off"} />
      ))}

      {/* curved fins, Urbansquare-like */}
      <path d={`M${LEFT - 4} ${BOTTOM} C${LEFT - 26} 480 ${LEFT - 30} 200 ${LEFT - 6} ${TOP - 30} L${LEFT + 6} ${TOP - 30} C${LEFT - 10} 220 ${LEFT - 6} 480 ${LEFT + 8} ${BOTTOM} Z`} fill={`url(#${id}-fin)`} />
      <path d={`M${RIGHT + 4} ${BOTTOM} C${RIGHT + 26} 480 ${RIGHT + 30} 200 ${RIGHT + 6} ${TOP - 30} L${RIGHT - 6} ${TOP - 30} C${RIGHT + 10} 220 ${RIGHT + 6} 480 ${RIGHT - 8} ${BOTTOM} Z`} fill={`url(#${id}-fin)`} />

      {/* sky gardens spilling out of the facade */}
      {gardens.map((b, i) => (
        <circle key={`g${i}`} cx={b.cx} cy={b.cy} r={b.r * 0.62} className={`art-leaf-${b.tone}`} />
      ))}

      {/* trees in front */}
      {leftTree.filter((_, i) => i % 3 !== 0).map((b, i) => (
        <circle key={`lf${i}`} cx={b.cx} cy={b.cy} r={b.r} className={`art-leaf-${b.tone}`} />
      ))}
      {rightTree.filter((_, i) => i % 3 !== 0).map((b, i) => (
        <circle key={`rf${i}`} cx={b.cx} cy={b.cy} r={b.r} className={`art-leaf-${b.tone}`} />
      ))}
      {/* trunks peeking out */}
      <path d="M150 640 C148 600 140 580 130 560 M150 640 C156 600 168 590 176 570" className="art-trunk" />
      <path d="M372 640 C374 600 386 585 396 565 M372 640 C366 605 356 592 348 576" className="art-trunk" />

      {/* base shrubs */}
      {shrubs.map((b, i) => (
        <circle key={`s${i}`} cx={b.cx} cy={b.cy} r={b.r * 0.55} className={`art-leaf-${b.tone}`} />
      ))}
      {/* entrance */}
      <rect x="244" y="618" width="32" height="34" rx="3" className="win" />
    </svg>
  );
}
