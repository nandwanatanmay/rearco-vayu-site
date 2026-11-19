/** ReaRCo compass-rose mark, redrawn as a single-colour line glyph (uses currentColor). */
export function CompassMark({ className, strokeWidth = 1.2 }: { className?: string; strokeWidth?: number }) {
  const points = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4 - Math.PI / 2;
    const long = i % 2 === 0;
    const r = long ? 46 : 30;
    const side = 7;
    const tip = [50 + r * Math.cos(a), 50 + r * Math.sin(a)];
    const l = [50 + side * Math.cos(a - Math.PI / 2), 50 + side * Math.sin(a - Math.PI / 2)];
    const rr = [50 + side * Math.cos(a + Math.PI / 2), 50 + side * Math.sin(a + Math.PI / 2)];
    return { tip, l, rr, long };
  });
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
      <circle cx="50" cy="50" r="38" />
      <circle cx="50" cy="50" r="33" strokeOpacity="0.5" />
      {points.map((p, i) => (
        <g key={i}>
          <path d={`M${p.l[0]} ${p.l[1]} L${p.tip[0]} ${p.tip[1]} L${p.rr[0]} ${p.rr[1]}`} strokeLinejoin="round" />
          {p.long && <path d={`M50 50 L${p.tip[0]} ${p.tip[1]}`} strokeOpacity="0.6" />}
        </g>
      ))}
      <circle cx="50" cy="50" r="4" fill="currentColor" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <CompassMark className="h-8 w-8 text-gold" strokeWidth={2.4} />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.45rem] font-semibold tracking-tight">ReaRCo</span>
        <span className="mt-0.5 text-[0.55rem] tracking-[0.08em] text-ink-soft">Real Estate Asset Resolution Co.</span>
      </span>
    </span>
  );
}
