import type { UnitPlan } from "@/data/site";

/** Blueprint-style plan drawn from room rectangles (0–100 grid). */
export function FloorPlan({ unit, className }: { unit: UnitPlan; className?: string }) {
  const pad = 6;
  return (
    <svg viewBox={`${-pad} ${-pad} ${100 + pad * 2} ${100 + pad * 2}`} className={className} role="img" aria-label={`${unit.bhk} floor plan, ${unit.tower}`}>
      <defs>
        <pattern id={`grid-${unit.id}`} width="5" height="5" patternUnits="userSpaceOnUse">
          <path d="M5 0 L0 0 0 5" fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth="0.3" />
        </pattern>
      </defs>
      <rect x={-pad} y={-pad} width={100 + pad * 2} height={100 + pad * 2} fill={`url(#grid-${unit.id})`} />
      {unit.rooms.map((r, i) => {
        const isWet = r.name === "Bath" || r.name === "Kitchen";
        return (
          <g key={i}>
            <rect x={r.x} y={r.y} width={r.w} height={r.h} fill="currentColor" fillOpacity={isWet ? 0.09 : 0.03} stroke="currentColor" strokeWidth="0.9" />
            {/* door swing */}
            <path d={`M${r.x + 3} ${r.y + r.h} A6 6 0 0 1 ${r.x + 9} ${r.y + r.h - 6}`} fill="none" stroke="currentColor" strokeWidth="0.35" strokeOpacity="0.7" />
            <text x={r.x + r.w / 2} y={r.y + r.h / 2} textAnchor="middle" dominantBaseline="middle" fontSize={r.w < 26 ? 3.2 : 4} fill="currentColor" style={{ fontFamily: "var(--font-sans)" }}>
              {r.name}
            </text>
          </g>
        );
      })}
      {/* outer wall */}
      <rect x="0" y="0" width="100" height="100" fill="none" stroke="currentColor" strokeWidth="2.2" />
      {/* balcony */}
      <rect x="0" y="100" width="56" height="5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="0.5" />
      <text x="28" y="103" textAnchor="middle" dominantBaseline="middle" fontSize="2.6" fill="currentColor">
        Balcony
      </text>
      {/* north arrow */}
      <g transform="translate(104 -2)">
        <path d="M0 6 L2 0 L4 6 L2 4.6 Z" fill="currentColor" />
        <text x="2" y="9.5" textAnchor="middle" fontSize="2.8" fill="currentColor">
          N
        </text>
      </g>
    </svg>
  );
}
