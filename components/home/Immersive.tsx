"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ArrowUpRight, Maximize2, Wind } from "lucide-react";
import { CompassMark } from "@/components/art/CompassMark";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useEnquiry } from "@/components/providers/EnquiryProvider";
import { company, panchtatva, revival, trustStats, units, values, vayu, type ElementKey } from "@/data/site";
import { cn } from "@/lib/cn";

/* ───────────────────────── Trust marquee ───────────────────────── */

export function TrustMarquee() {
  const items = [
    "SWAMIH-funded",
    `UP RERA ${vayu.rera}`,
    `${trustStats[2].value} homes revived`,
    `${trustStats[3].value} clearances on public record`,
    vayu.location,
  ];
  const row = (hidden?: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((t) => (
        <li key={t} className="flex items-center whitespace-nowrap font-display text-[clamp(1.6rem,3.2vw,2.8rem)] italic">
          <span className="px-6 sm:px-10">{t}</span>
          <CompassMark className="h-6 w-6 shrink-0 text-gold" strokeWidth={3} />
        </li>
      ))}
    </ul>
  );
  return (
    <section aria-label="Why families trust ReaRCo" className="overflow-hidden border-y border-white/10 bg-forest py-6 text-[#eef1e8] sm:py-8">
      <div className="marquee-track flex">
        {row()}
        {row(true)}
      </div>
    </section>
  );
}

/* ───────────────────────── Name, unfolded on scroll ───────────────────────── */

const WORDS = [
  { head: "R", tail: "eal" },
  { head: "E", tail: "state" },
  { head: "A", tail: "sset" },
  { head: "R", tail: "esolution" },
  { head: "Co", tail: "mpany" },
];

function Unfold({ p, i, head, tail }: { p: MotionValue<number>; i: number; head: string; tail: string }) {
  const start = 0.08 + i * 0.1;
  const reveal = useTransform(p, [start, start + 0.18], [100, 0]);
  const clip = useTransform(reveal, (v) => `inset(-10% ${v}% -10% 0)`);
  const x = useTransform(p, [start, start + 0.18], [-24, 0]);
  return (
    <span className="block whitespace-nowrap">
      <span className="text-gold">{head}</span>
      <motion.span className="inline-block text-ink" style={{ clipPath: clip, x }}>
        {tail}
      </motion.span>
    </span>
  );
}

export function NameUnfold() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useTransform(scrollYProgress, (v) => (reduce ? 1 : v));
  const sentence = useTransform(p, [0.62, 0.8], [0, 1]);
  const sy = useTransform(p, [0.62, 0.8], [30, 0]);

  return (
    <section ref={ref} id="about" aria-labelledby="about-title" className="relative h-[220vh] motion-reduce:h-auto">
      <div className="sticky top-0 flex min-h-[100svh] items-center overflow-hidden motion-reduce:static">
        <div className="mx-auto grid w-full max-w-[1400px] items-center gap-10 px-5 py-24 sm:px-8 lg:grid-cols-[1.55fr_1fr]">
          <h2 id="about-title" className="font-display text-[clamp(2.6rem,7.6vw,8rem)] font-medium uppercase leading-[0.88] tracking-[-0.02em]">
            <span className="sr-only">ReaRCo: Real Estate Asset Resolution Company</span>
            <span aria-hidden="true">
              {WORDS.map((w, i) => (
                <Unfold key={i} p={p} i={i} head={w.head} tail={w.tail} />
              ))}
            </span>
          </h2>
          <motion.div style={{ opacity: sentence, y: sy }}>
            <p className="font-display text-[clamp(1.7rem,2.8vw,2.6rem)] leading-[1.12]">
              Our name is our job. We step in where housing projects have stalled, resolve them, and hand families the keys they were promised.
            </p>
            <p className="mt-6 flex items-center gap-3 text-ink-soft">
              <span className="font-display text-2xl italic text-accent">SUKH</span>
              <span className="h-px w-8 bg-line" />
              comfort and happiness, built into every home.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Revival: a tower that builds itself ───────────────────────── */

const FLOORS = 24;

function BuildTower({ stage, built }: { stage: number; built: number }) {
  // stage: 0 stalled · 1 IBC · 2 SWAMIH · 3 relaunch · 4 building
  const stalledAt = 9;
  return (
    <svg viewBox="0 0 320 560" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="bt-glass" x1="0" x2="1">
          <stop offset="0" stopColor="#2f4a3f" />
          <stop offset="1" stopColor="#1d2f27" />
        </linearGradient>
        <radialGradient id="bt-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f0b765" stopOpacity="0.5" />
          <stop offset="1" stopColor="#f0b765" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* ground */}
      <ellipse cx="160" cy="532" rx="150" ry="16" fill="#2a3a30" />
      {stage >= 4 && <circle cx="160" cy={520 - built * 20} r="120" fill="url(#bt-glow)" style={{ transition: "cy .3s" }} />}
      {Array.from({ length: FLOORS }, (_, f) => {
        const y = 520 - (f + 1) * 20;
        const exists = f < Math.max(stalledAt, built);
        const finished = stage >= 3 && f < built;
        const stalled = !finished && f < stalledAt;
        if (!exists) {
          // ghosted future floors
          return <rect key={f} x="70" y={y} width="180" height="18" fill="none" stroke="#eef1e8" strokeOpacity="0.08" strokeDasharray="3 5" />;
        }
        return (
          <g key={f} style={{ transition: "opacity .4s" }}>
            <rect x="70" y={y} width="180" height="18" fill={finished ? "#eef1e8" : "none"} stroke={stalled ? "#7f8a82" : "#eef1e8"} strokeOpacity={stalled ? 0.6 : 1} strokeDasharray={stalled && stage === 0 ? "2 3" : undefined} />
            {finished &&
              Array.from({ length: 6 }, (_, b) => (
                <rect key={b} x={76 + b * 29} y={y + 4} width="23" height="10" fill={(f * 7 + b * 3) % 5 < 2 ? "#f0b765" : "url(#bt-glass)"} />
              ))}
            {finished && (f + 1) % 3 === 0 && <rect x="70" y={y + 14} width="180" height="4" fill="#6f8a52" />}
            {stalled && stage >= 1 &&
              Array.from({ length: 6 }, (_, b) => <line key={b} x1={76 + b * 29} y1={y + 2} x2={76 + b * 29} y2={y + 16} stroke="#7f8a82" strokeOpacity="0.5" />)}
          </g>
        );
      })}
      {/* crane: frozen when stalled, working once funded */}
      {(() => {
        const top = 520 - Math.max(stalledAt, built) * 20;
        const mast = 70;
        return (
          <g stroke={stage >= 2 ? "#d9bd85" : "#7f8a82"} strokeWidth="2.5" fill="none" style={{ transition: "stroke .6s" }}>
            <line x1="235" y1={top} x2="235" y2={top - mast} />
            <line x1="150" y1={top - mast} x2="300" y2={top - mast} />
            <line x1="235" y1={top - mast - 18} x2="160" y2={top - mast} />
            <line x1="235" y1={top - mast - 18} x2="300" y2={top - mast} />
            <line x1={stage >= 2 ? 190 : 270} y1={top - mast} x2={stage >= 2 ? 190 : 270} y2={top - mast + (stage >= 2 ? 40 : 22)} style={{ transition: "all .8s" }} />
          </g>
        );
      })()}
      {stage === 0 && (
        <g transform="translate(160 400)">
          <rect x="-58" y="-18" width="116" height="36" rx="18" fill="#6b1e2b" />
          <text textAnchor="middle" y="5" fill="#fff" fontSize="14" fontFamily="var(--font-jakarta)">Work stopped</text>
        </g>
      )}
      {/* trees around the base once relaunched */}
      {stage >= 3 &&
        [40, 62, 258, 282, 20, 300].map((x, i) => (
          <circle key={i} cx={x} cy={510 - (i % 2) * 8} r={14 + (i % 3) * 4} fill={["#5f7a47", "#6f8a52", "#4f6a3a"][i % 3]} />
        ))}
    </svg>
  );
}

export function Revival() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [stage, setStage] = useState(reduce ? revival.length - 1 : 0);
  const [built, setBuilt] = useState(reduce ? 24 : 0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (reduce) return;
    const s = Math.min(revival.length - 1, Math.floor(v * revival.length * 0.999));
    setStage(s);
    // floors rise through the last two stages
    const b = v < 0.6 ? 0 : Math.round(9 + ((v - 0.6) / 0.38) * 15);
    setBuilt(Math.min(FLOORS, b));
  });
  const item = revival[stage];
  const rail = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={ref} aria-labelledby="revival-title" className="relative h-[420vh] bg-[#16211b] text-[#eef1e8] motion-reduce:h-auto">
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden motion-reduce:static motion-reduce:h-auto">
        <div className="mx-auto grid w-full max-w-[1400px] flex-1 grid-rows-[auto_1fr] gap-4 px-5 pt-24 sm:px-8 lg:grid-cols-[1.15fr_1fr] lg:grid-rows-1 lg:items-center lg:pt-16">
          <div>
            <h2 id="revival-title" className="text-sm tracking-wide text-[#a9b6a5]">
              From stalled to standing
            </h2>
            <div className="relative mt-2 h-[clamp(6rem,19vw,17rem)] overflow-hidden">
              {revival.map((r, i) => (
                <span
                  key={r.year}
                  aria-hidden={i !== stage}
                  className="absolute inset-0 font-display text-[clamp(6rem,19vw,17rem)] font-medium leading-[0.95] tabular-nums transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)]"
                  style={{
                    transform: `translateY(${(i - stage) * 100}%)`,
                    opacity: i === stage ? 1 : 0,
                    color: i === 0 ? "#9aa59c" : i >= 3 ? "#d9bd85" : "#eef1e8",
                  }}
                >
                  {r.year}
                </span>
              ))}
            </div>
            <div key={item.year} className="mt-2 max-w-md animate-[rise_.7s_cubic-bezier(.22,1,.36,1)]">
              <p className="font-display text-[clamp(1.8rem,3vw,2.6rem)] leading-tight">{item.title}</p>
              <p className="mt-3 leading-relaxed text-[#b9c4b5]">{item.body}</p>
            </div>
          </div>
          <div className="relative mx-auto h-full max-h-[62svh] w-full max-w-[420px] lg:max-h-[78svh]">
            <BuildTower stage={stage} built={built} />
          </div>
        </div>

        {/* progress rail */}
        <div className="mx-auto w-full max-w-[1400px] px-5 pb-8 sm:px-8 sm:pb-10">
          <div className="relative h-px bg-white/15">
            <motion.div className="absolute inset-y-0 left-0 bg-[#d9bd85]" style={{ width: rail }} />
          </div>
          <ol className="mt-3 grid grid-cols-5 text-[11px] text-[#a9b6a5] sm:text-xs">
            {revival.map((r, i) => (
              <li key={r.year} className={cn("transition-colors", i <= stage && "text-[#eef1e8]")}>
                <span className="tabular-nums">{r.year}</span>
                <span className="hidden sm:inline"> · {r.title}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      {/* reduced-motion / no-JS reading of the full timeline */}
      <ol className="sr-only">
        {revival.map((r) => (
          <li key={r.year}>
            {r.year}: {r.title}. {r.body}
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ───────────────────────── Panchtatva: five living panels ───────────────────────── */

const EL: Record<ElementKey, { bg: string; ink: string; soft: string; Art: () => React.ReactElement }> = {
  sky: { bg: "#cfdde6", ink: "#1d2c38", soft: "#4c6170", Art: SkyArt },
  water: { bg: "#1f4a52", ink: "#eaf4f2", soft: "#a9cbc8", Art: WaterArt },
  wind: { bg: "#dfe6d8", ink: "#1e2b23", soft: "#56664f", Art: WindArt },
  earth: { bg: "#5c5034", ink: "#f3ecdc", soft: "#d3c7a6", Art: EarthArt },
  fire: { bg: "#5e1a26", ink: "#fbeee0", soft: "#e7c3a5", Art: FireArt },
};

function SkyArt() {
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {[60, 110, 160, 210, 260].map((r) => (
        <circle key={r} cx="200" cy="420" r={r + 60} fill="none" stroke="#1d2c38" strokeOpacity="0.12" />
      ))}
      <g className="el-orbit" style={{ transformOrigin: "200px 420px" }}>
        <circle cx="200" cy="150" r="34" fill="#fff6dc" />
        <circle cx="200" cy="150" r="60" fill="#fff6dc" opacity="0.25" />
      </g>
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={i % 2 ? 40 : 0} y={240 + i * 26} width={260 - i * 30} height="12" rx="2" fill="#fff" opacity={0.55 - i * 0.1} className="el-bar" style={{ animationDelay: `${i * 0.6}s` }} />
      ))}
    </svg>
  );
}
function WaterArt() {
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <ellipse key={i} cx="200" cy="250" rx="40" ry="14" fill="none" stroke="#bfe3e0" strokeWidth="1.5" className="el-ripple" style={{ animationDelay: `${i * 1.1}s` }} />
      ))}
      <path d="M200 90 C 200 90 160 140 160 165 a40 40 0 0 0 80 0 C240 140 200 90 200 90z" fill="#bfe3e0" opacity="0.85" className="el-drop" />
    </svg>
  );
}
function WindArt() {
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path
          key={i}
          d={`M-20 ${110 + i * 38} C 80 ${80 + i * 38}, 160 ${150 + i * 38}, 240 ${110 + i * 38} S 380 ${80 + i * 38}, 440 ${118 + i * 38}`}
          fill="none"
          stroke="#56664f"
          strokeWidth={i % 2 ? 1.2 : 2}
          strokeLinecap="round"
          className="el-wind"
          style={{ animationDelay: `${i * -0.7}s`, opacity: 0.35 + (i % 3) * 0.2 }}
        />
      ))}
      <rect x="170" y="150" width="60" height="140" fill="none" stroke="#1e2b23" strokeWidth="2" />
      <rect x="166" y="200" width="68" height="18" fill="#dfe6d8" />
    </svg>
  );
}
function EarthArt() {
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M-10 ${260 + i * 26} Q 100 ${230 + i * 22} 200 ${258 + i * 26} T 410 ${250 + i * 26} V 420 H -10z`} fill={["#7c6c45", "#6e6140", "#5f7a47", "#4f6a3a", "#3f5530"][i]} opacity={0.9} />
      ))}
      {[90, 150, 230, 300].map((x, i) => (
        <g key={x} className="el-sway" style={{ transformOrigin: `${x}px 260px`, animationDelay: `${i * 0.8}s` }}>
          <line x1={x} y1="260" x2={x} y2={200 - i * 8} stroke="#3a2f20" strokeWidth="3" />
          <circle cx={x} cy={190 - i * 8} r={26 + (i % 2) * 8} fill={["#7b9a55", "#6b8c49", "#8aa862"][i % 3]} />
        </g>
      ))}
    </svg>
  );
}
function FireArt() {
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="fire-g" cx="0.5" cy="0.4" r="0.5">
          <stop offset="0" stopColor="#ffcf86" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffcf86" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="170" r="150" fill="url(#fire-g)" className="el-pulse" style={{ transformOrigin: "200px 170px" }} />
      {Array.from({ length: 5 }, (_, r) =>
        Array.from({ length: 4 }, (_, c) => (
          <rect key={`${r}-${c}`} x={120 + c * 42} y={180 + r * 34} width="30" height="22" fill="#ffcf86" className="el-win" style={{ animationDelay: `${(r * 4 + c) * 0.37}s` }} />
        )),
      )}
    </svg>
  );
}

export function Panchtatva() {
  const [active, setActive] = useState<ElementKey>("wind");
  return (
    <section id="panchtatva" aria-labelledby="pt-title" className="mx-auto max-w-[1400px] px-3 py-24 sm:px-5 md:py-36">
      <div className="flex flex-wrap items-end justify-between gap-6 px-2 sm:px-3">
        <h2 id="pt-title" className="font-display text-[clamp(2.8rem,6.5vw,6rem)] font-medium leading-[0.92] tracking-[-0.02em]">
          Five elements,
          <br />
          <em className="font-normal text-accent">engineered.</em>
        </h2>
        <p className="max-w-sm text-ink-soft">Panchtatva is our design brief. Each element is a promise you can measure.</p>
      </div>

      <div className="mt-12 flex flex-col gap-3 lg:h-[76svh] lg:min-h-[560px] lg:flex-row" role="list">
        {panchtatva.map((e) => {
          const s = EL[e.key];
          const on = active === e.key;
          return (
            <div
              key={e.key}
              role="listitem"
              onMouseEnter={() => setActive(e.key)}
              onFocus={() => setActive(e.key)}
              onClick={() => setActive(e.key)}
              tabIndex={0}
              aria-label={`${e.name}: ${e.idea}. ${e.fact} ${e.metric}.`}
              className={cn(
                "group relative min-h-[420px] overflow-hidden rounded-[28px] outline-none transition-[flex-grow] duration-700 ease-[cubic-bezier(.22,1,.36,1)] focus-visible:ring-2 focus-visible:ring-gold lg:min-h-0 lg:basis-0",
                on ? "lg:grow-[4.2]" : "lg:grow",
              )}
              style={{ background: s.bg, color: s.ink }}
            >
              <div className={cn("absolute inset-0 transition-opacity duration-700", on ? "opacity-100" : "opacity-100 lg:opacity-60")}>
                <s.Art />
              </div>
              {/* collapsed label (desktop) */}
              <div className={cn("absolute inset-x-0 bottom-6 hidden flex-col items-center gap-3 transition-opacity duration-300 lg:flex", on ? "opacity-0" : "opacity-100 delay-200")}>
                <span className="font-display text-3xl [writing-mode:vertical-rl] rotate-180">{e.name}</span>
                <span className="text-xs" style={{ color: s.soft }}>{e.sanskrit}</span>
              </div>
              {/* expanded content */}
              <div className={cn("relative flex h-full flex-col justify-between p-7 transition-opacity duration-500 sm:p-9", on ? "opacity-100 delay-300" : "opacity-100 lg:pointer-events-none lg:opacity-0")}>
                <div className="flex items-baseline justify-between gap-4">
                  <p className="font-display text-[clamp(2.6rem,4.6vw,4.4rem)] leading-none">{e.name}</p>
                  <p className="text-sm italic" style={{ color: s.soft }}>{e.sanskrit}</p>
                </div>
                <div className="lg:min-w-[22rem]">
                  <p className="font-display text-[clamp(2.2rem,4vw,3.6rem)] leading-[0.95]">{e.metric}</p>
                  <p className="mt-4 max-w-sm text-[15px] leading-relaxed" style={{ color: s.soft }}>
                    <span className="font-medium" style={{ color: s.ink }}>{e.idea}.</span> {e.fact}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ───────────────────────── Vāyu: the real plan tilts into view ───────────────────────── */

const PLANS = [
  { src: "/plans/vayu-3bhk-1245.jpg", w: 900, h: 832, label: "3 BHK · Tower 1", note: "Type 1245" },
  { src: "/plans/vayu-2bhk-997.jpg", w: 900, h: 560, label: "2 BHK · Towers 6–7", note: "Type 997" },
];

export function VayuReveal() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { open } = useEnquiry();
  const [plan, setPlan] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const rot = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 52, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [reduce ? 1 : 0.82, 1]);
  const word = useTransform(scrollYProgress, [0, 1], [reduce ? "0%" : "-12%", "0%"]);
  const sizes = Array.from(new Set(units.map((u) => u.bhk)));
  const P = PLANS[plan];

  return (
    <section ref={ref} aria-labelledby="vayu-title" className="relative overflow-hidden bg-[#121b16] pb-24 pt-20 text-[#eef1e8] md:pb-32 md:pt-28">
      {/* giant wordmark */}
      <motion.p
        aria-hidden="true"
        style={{ x: word }}
        className="pointer-events-none select-none whitespace-nowrap text-center font-display text-[34vw] font-medium leading-[0.75] text-white/[0.05]"
      >
        VĀYU
      </motion.p>

      <div className="relative mx-auto -mt-[16vw] max-w-[1400px] px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <p className="flex items-center gap-2 text-sm text-[#a9b6a5]">
              <Wind size={15} /> Now booking · {vayu.location}
            </p>
            <h2 id="vayu-title" className="mt-3 font-display text-[clamp(3.2rem,7vw,6.4rem)] font-medium leading-[0.9] tracking-[-0.02em]">
              Vāyu <em className="font-normal text-[#d9bd85]">@ KVD Windpark</em>
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={vayu.href} variant="light" className="px-6 py-3.5">
              See plans and prices <ArrowUpRight size={16} />
            </ButtonLink>
            <Button onClick={() => open({ intent: "brochure", source: "home-vayu" })} className="border border-white/25 bg-transparent px-6 py-3.5 text-white hover:bg-white/10">
              Get brochure on WhatsApp
            </Button>
          </div>
        </div>

        <div className="mt-12 grid items-center gap-10 lg:grid-cols-[1.35fr_1fr]" style={{ perspective: 1400 }}>
          <motion.figure style={{ rotateX: rot, scale, transformOrigin: "50% 100%" }} className="relative rounded-[28px] bg-[#f4f1ea] p-4 shadow-[0_60px_120px_-40px_rgba(0,0,0,0.8)] sm:p-7">
            <div className="relative">
              <Image key={P.src} src={P.src} width={P.w} height={P.h} alt={`Furnished floor plan of a ${P.label} home at Vāyu (${P.note})`} className="h-auto w-full animate-[fadein_.6s_ease]" sizes="(min-width:1024px) 55vw, 92vw" />
            </div>
            <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-forest">
              <div className="flex gap-1 rounded-full bg-forest/5 p-1" role="tablist" aria-label="Choose a plan">
                {PLANS.map((p, i) => (
                  <button
                    key={p.src}
                    role="tab"
                    aria-selected={i === plan}
                    onClick={() => setPlan(i)}
                    className={cn("rounded-full px-4 py-2 text-xs transition-colors sm:text-sm", i === plan ? "bg-forest text-white" : "hover:bg-forest/10")}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <a href={vayu.href + "#plans"} className="flex items-center gap-1.5 text-xs text-forest/70 hover:text-forest sm:text-sm">
                <Maximize2 size={14} /> Open the zoomable plan
              </a>
            </figcaption>
          </motion.figure>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-10">
            {[
              { k: "Homes from", v: vayu.startingPrice },
              { k: "Possession", v: vayu.possession },
              { k: "Layouts", v: sizes.map((s) => s.replace(" BHK", "")).join(" · ") + " BHK" },
              { k: "Open green area", v: vayu.greenCover },
            ].map((s) => (
              <div key={s.k} className="border-t border-white/15 pt-4">
                <dt className="text-xs text-[#a9b6a5]">{s.k}</dt>
                <dd className="mt-2 font-display text-[clamp(2rem,3.4vw,3.2rem)] leading-none">{s.v}</dd>
              </div>
            ))}
            <div className="col-span-2 rounded-2xl bg-[#d9bd85] p-5 text-forest">
              <p className="text-xs">Inaugural offer</p>
              <p className="mt-1 font-medium">{vayu.offer}</p>
              <p className="mt-2 text-xs opacity-75">UP RERA {vayu.rera} · *Prices are indicative and exclude applicable charges.</p>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Values as moving type ───────────────────────── */

export function ValuesMarquee() {
  const half = Math.ceil(values.length / 2);
  const rows = [values.slice(0, half), values.slice(half)];
  return (
    <section aria-labelledby="values-title" className="overflow-hidden py-24 md:py-36">
      <div className="mx-auto mb-12 flex max-w-[1400px] items-center gap-4 px-5 sm:px-8">
        <CompassMark className="h-9 w-9 text-gold" strokeWidth={2.2} />
        <h2 id="values-title" className="text-sm tracking-wide text-ink-soft">
          What we hold to
        </h2>
      </div>
      <ul className="sr-only">
        {values.map((v) => (
          <li key={v.title}>
            {v.title}: {v.body}
          </li>
        ))}
      </ul>
      <div aria-hidden="true" className="space-y-2 md:space-y-4">
        {rows.map((r, ri) => (
          <div key={ri} className={cn("marquee-track flex", ri === 1 && "marquee-reverse")} style={{ animationDuration: "55s" }}>
            {[0, 1].map((k) => (
              <div key={k} className="flex shrink-0 items-center">
                {r.map((v, i) => (
                  <span key={v.title} className="flex items-center">
                    <span className={cn("whitespace-nowrap px-6 font-display text-[clamp(3rem,8vw,8rem)] leading-[1.05] md:px-10", (i + ri) % 2 ? "italic text-accent" : "text-ink")}>{v.title}</span>
                    <span className="h-3 w-3 rotate-45 bg-gold/70" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────── Vision, read word by word ───────────────────────── */

function Word({ p, range, children }: { p: MotionValue<number>; range: [number, number]; children: string }) {
  const o = useTransform(p, range, [0.14, 1]);
  return (
    <motion.span style={{ opacity: o }} className="inline-block whitespace-pre">
      {children}
    </motion.span>
  );
}

export function VisionReveal() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.6"] });
  const p = useTransform(scrollYProgress, (v) => (reduce ? 1 : v));
  const vision = "Move real estate from selling dreams to delivering value: homes in vibrant communities, built ethically and sustainably.";
  const words = vision.split(" ");
  return (
    <section ref={ref} aria-labelledby="vision-title" className="bg-mist surface-transition">
      <div className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8 md:py-40">
        <h2 id="vision-title" className="text-sm tracking-wide text-ink-soft">
          Our vision
        </h2>
        <p className="mt-6 max-w-[22ch] font-display text-[clamp(2.4rem,5.6vw,5.4rem)] leading-[1.02] tracking-[-0.01em]" aria-label={vision}>
          {words.map((w, i) => (
            <Word key={i} p={p} range={[i / words.length, (i + 1.5) / words.length]}>
              {w + (i < words.length - 1 ? " " : "")}
            </Word>
          ))}
        </p>
        <div className="mt-14 grid gap-6 border-t border-line pt-8 md:grid-cols-[12rem_1fr]">
          <h3 className="text-sm tracking-wide text-ink-soft">Our mission</h3>
          <p className="max-w-2xl text-lg leading-relaxed md:text-xl">
            Turn stalled projects into living communities, with homes where comfort, harmony and lasting value arrive exactly as promised.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Closing call ───────────────────────── */

export function Closing() {
  const { open } = useEnquiry();
  return (
    <section aria-labelledby="cta-title" className="relative overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 closing-sky" />
      <div className="relative mx-auto max-w-[1400px] px-5 py-28 text-center sm:px-8 md:py-44">
        <h2 id="cta-title" className="mx-auto max-w-5xl font-display text-[clamp(3rem,8vw,7.6rem)] font-medium leading-[0.9] tracking-[-0.02em]">
          Walk the site <em className="font-normal text-accent">before</em> you decide
        </h2>
        <p className="mx-auto mt-7 max-w-lg text-lg leading-relaxed text-ink-soft">See the towers rising and the documents for yourself. We'll pick you up anywhere in Noida or Greater Noida.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button className="px-8 py-4 text-base" onClick={() => open({ intent: "visit", source: "home-closing" })}>
            Book a site visit
          </Button>
          <ButtonLink href={company.whatsapp} variant="outline" className="glass px-8 py-4 text-base" target="_blank" rel="noopener noreferrer">
            Chat on WhatsApp
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
