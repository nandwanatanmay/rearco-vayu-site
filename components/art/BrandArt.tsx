import { rng, r2 } from "./rand";

/** Exquisite: twin towers at dusk with lit windows. */
export function SkylineArt({ className }: { className?: string }) {
  const rand = rng(91);
  const towers = [
    { x: 60, w: 70, top: 40 },
    { x: 150, w: 80, top: 10 },
    { x: 250, w: 60, top: 90 },
  ];
  return (
    <svg viewBox="0 0 340 300" className={className} aria-hidden="true" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="sk-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1b2620" />
          <stop offset="1" stopColor="#3b2a2a" />
        </linearGradient>
      </defs>
      <rect width="340" height="300" fill="url(#sk-sky)" />
      <circle cx="270" cy="50" r="16" fill="#efe6cf" opacity="0.9" />
      {towers.map((t, ti) => (
        <g key={ti}>
          <rect x={t.x} y={t.top} width={t.w} height={300 - t.top} fill="#121915" />
          {Array.from({ length: Math.floor((300 - t.top - 16) / 14) }, (_, f) =>
            Array.from({ length: Math.floor(t.w / 14) }, (_, c) => {
              const on = rand() > 0.42;
              return (
                <rect
                  key={`${f}-${c}`}
                  x={t.x + 5 + c * 14}
                  y={t.top + 10 + f * 14}
                  width="8"
                  height="8"
                  fill={on ? "#f0b765" : "#26302a"}
                  opacity={on ? r2(0.55 + rand() * 0.45) : 1}
                />
              );
            }),
          )}
        </g>
      ))}
      <rect y="284" width="340" height="16" fill="#0d130f" />
    </svg>
  );
}

/** Royale: arched doorway with a chandelier, drawn in gold line. */
export function ArchArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 340 300" className={className} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <rect width="340" height="300" fill="#6b1e2b" />
      <g fill="none" stroke="#d9bd85" strokeWidth="1.3">
        <path d="M100 300 L100 130 A70 70 0 0 1 240 130 L240 300" />
        <path d="M116 300 L116 134 A54 54 0 0 1 224 134 L224 300" strokeOpacity="0.5" />
        <path d="M170 60 L170 110" />
        <path d="M140 110 Q170 140 200 110" />
        <path d="M130 120 Q170 160 210 120" strokeOpacity="0.7" />
        {[-30, -15, 0, 15, 30].map((dx) => (
          <path key={dx} d={`M${170 + dx} ${dx === 0 ? 128 : 120} l0 10`} />
        ))}
        <path d="M60 300 L280 300" />
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M${100 + i * 17.5} 300 L${80 + i * 22.5} 330`} strokeOpacity="0.4" />
        ))}
      </g>
      <circle cx="170" cy="134" r="40" fill="#f0b765" opacity="0.12" />
    </svg>
  );
}
