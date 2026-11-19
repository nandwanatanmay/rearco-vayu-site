"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, FileText, Plus } from "lucide-react";
import { amenities, clearances, faqs, locations, progress, specs, vayu } from "@/data/site";
import { Mosaic } from "@/components/art/Mosaic";
import { cn } from "@/lib/cn";

export function SectionHead({ title, intro, id }: { title: React.ReactNode; intro?: string; id: string }) {
  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1fr] md:items-end">
      <h2 id={id} className="display text-[clamp(2.3rem,5vw,4.3rem)]">
        {title}
      </h2>
      {intro && <p className="max-w-xl leading-relaxed text-ink-soft">{intro}</p>}
    </div>
  );
}

/* ───────── Master plan ───────── */
// TODO(real-data): tower positions and which towers are for existing allottees.

const towers = [
  { n: "1", x: 70, y: 70, w: 46, h: 90, group: "Tower 1" },
  { n: "2", x: 170, y: 50, w: 46, h: 90, group: "Tower 2–3" },
  { n: "3", x: 270, y: 70, w: 46, h: 90, group: "Tower 2–3" },
  { n: "4", x: 400, y: 50, w: 46, h: 90, group: "Towers 4–5" },
  { n: "5", x: 500, y: 70, w: 46, h: 90, group: "Towers 4–5" },
  { n: "6", x: 420, y: 250, w: 46, h: 90, group: "Tower 6–7" },
  { n: "7", x: 520, y: 270, w: 46, h: 90, group: "Tower 6–7" },
];

const zones = [
  { name: "Clubhouse & pool", x: 90, y: 250, w: 150, h: 80, kind: "club" },
  { name: "Central green", x: 260, y: 200, w: 130, h: 160, kind: "green" },
  { name: "Kids' play", x: 90, y: 345, w: 80, h: 40, kind: "green" },
  { name: "Sports courts", x: 180, y: 345, w: 70, h: 40, kind: "court" },
];

export function MasterPlan() {
  const [hover, setHover] = useState<string | null>(null);
  return (
    <section aria-labelledby="mp-title" className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 md:py-32">
      <SectionHead
        id="mp-title"
        title={
          <>
            Seven towers,
            <br />
            one garden
          </>
        }
        intro="Towers sit on the edges so the centre stays green. Cars stay below ground, so children can cycle from the clubhouse to the courts without crossing a road."
      />
      <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="overflow-hidden rounded-[28px] bg-mist/60 p-4 ring-1 ring-line surface-transition md:p-8">
          <svg viewBox="0 0 620 420" className="h-auto w-full text-ink" role="img" aria-label="Master plan of Vāyu @ KVD Windpark">
            <rect x="20" y="20" width="580" height="380" rx="18" fill="none" stroke="currentColor" strokeOpacity="0.4" strokeDasharray="6 6" />
            {/* trees */}
            {Array.from({ length: 38 }, (_, i) => (
              <circle key={i} cx={40 + ((i * 97) % 540)} cy={30 + ((i * 61) % 360)} r={5 + (i % 3) * 2} className="art-leaf-1" opacity="0.65" />
            ))}
            {zones.map((z) => (
              <g key={z.name}>
                <rect
                  x={z.x}
                  y={z.y}
                  width={z.w}
                  height={z.h}
                  rx="10"
                  className={z.kind === "green" ? "art-leaf-2" : undefined}
                  fill={z.kind === "club" ? "var(--gold)" : z.kind === "court" ? "var(--moss)" : undefined}
                  opacity={z.kind === "green" ? 0.55 : 0.4}
                />
                <text x={z.x + z.w / 2} y={z.y + z.h / 2} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="currentColor">
                  {z.name}
                </text>
              </g>
            ))}
            {towers.map((t) => {
              const on = hover === t.group;
              return (
                <g key={t.n} onMouseEnter={() => setHover(t.group)} onMouseLeave={() => setHover(null)} style={{ cursor: "pointer" }}>
                  <rect
                    x={t.x}
                    y={t.y}
                    width={t.w}
                    height={t.h}
                    rx="6"
                    fill={on ? "var(--accent)" : "currentColor"}
                    opacity={hover && !on ? 0.35 : 0.9}
                    style={{ transition: "all .3s" }}
                  />
                  <text x={t.x + t.w / 2} y={t.y + t.h / 2} textAnchor="middle" dominantBaseline="middle" fontSize="18" fill="var(--bg)" style={{ fontFamily: "var(--font-display)" }}>
                    {t.n}
                  </text>
                </g>
              );
            })}
            <text x="600" y="412" textAnchor="end" fontSize="9" fill="currentColor" opacity="0.6">
              Main entrance ↓ 30 m road
            </text>
          </svg>
        </div>
        <ul className="space-y-2" aria-label="Tower groups">
          {["Tower 1", "Tower 2–3", "Towers 4–5", "Tower 6–7"].map((g) => (
            <li key={g}>
              <button
                onMouseEnter={() => setHover(g)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(g)}
                onBlur={() => setHover(null)}
                className={cn("flex w-full items-center justify-between rounded-2xl px-5 py-4 text-left ring-1 transition-colors", hover === g ? "bg-forest text-[#eef1e8] ring-forest" : "bg-surface ring-line")}
              >
                <span className="font-display text-2xl">{g}</span>
                <span className="text-xs opacity-70">{g === "Towers 4–5" ? "Existing allottees" : "Now booking"}</span>
              </button>
            </li>
          ))}
          <li className="px-1 pt-2 text-xs leading-relaxed text-ink-soft">Indicative plan. Refer to the RERA-approved layout for exact positions.</li>
        </ul>
      </div>
    </section>
  );
}

/* ───────── Amenities (each rendered once) ───────── */

export function Amenities() {
  const cats = Object.keys(amenities);
  const [cat, setCat] = useState(cats[0]);
  return (
    <section aria-labelledby="am-title" className="bg-forest text-[#eef1e8]">
      <div className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 md:py-32">
        <div className="grid gap-6 md:grid-cols-[1fr_1fr] md:items-end">
          <h2 id="am-title" className="display text-[clamp(2.3rem,5vw,4.3rem)]">
            Life between
            <br />
            the towers
          </h2>
          <p className="max-w-xl leading-relaxed text-[#c3cdbf]">Fifteen ways to spend an evening without getting in the car, grouped by what they are for.</p>
        </div>
        <div role="tablist" aria-label="Amenity categories" className="mt-12 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {cats.map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={cat === c}
              onClick={() => setCat(c)}
              className={cn("shrink-0 rounded-full border px-5 py-2.5 text-sm transition-colors", cat === c ? "border-[#d9bd85] bg-[#d9bd85] text-forest" : "border-white/20 hover:border-white/60")}
            >
              {c}
            </button>
          ))}
        </div>
        <div role="tabpanel" className="mt-8">
          <AnimatePresence mode="wait">
            <motion.ul key={cat} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="grid gap-4 md:grid-cols-3">
              {amenities[cat].map((a, i) => (
                <li key={a.name} className="relative min-h-[260px] overflow-hidden rounded-3xl bg-white/[0.05] p-7 ring-1 ring-white/10">
                  <Mosaic className="absolute right-0 top-0 h-28 w-auto text-[#d9bd85]/40" cols={10} rows={7} seed={i * 13 + cat.length} origin="tr" />
                  <div className="relative flex h-full flex-col">
                    <h3 className="display-lower mt-auto pt-24 text-3xl text-white">{a.name}</h3>
                    <p className="mt-2 text-sm text-[#b4c0b0]">{a.note}</p>
                  </div>
                </li>
              ))}
            </motion.ul>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* ───────── Specifications ───────── */

export function Specs() {
  return (
    <section aria-labelledby="sp-title" className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 md:py-32">
      <SectionHead id="sp-title" title={<>What it&apos;s<br />made of</>} intro="The specification that goes into every Vāyu home. Brands are confirmed in your agreement." />
      <dl className="mt-12 grid border-t border-line sm:grid-cols-2">
        {specs.map((s, i) => (
          <div key={s.area} className={cn("grid grid-cols-[130px_1fr] gap-4 border-b border-line py-6 sm:pr-10", i % 2 === 1 && "sm:border-l sm:pl-10")}>
            <dt className="font-display text-xl">{s.area}</dt>
            <dd className="text-sm leading-relaxed text-ink-soft">{s.detail}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* ───────── Location ───────── */

export function Location() {
  return (
    <section aria-labelledby="loc-title" className="bg-mist surface-transition">
      <div className="mx-auto grid max-w-[1320px] gap-12 px-5 py-24 sm:px-8 md:py-32 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <h2 id="loc-title" className="display text-[clamp(2.3rem,5vw,4.3rem)]">
            Close to
            <br />
            everything
          </h2>
          <p className="mt-6 max-w-md leading-relaxed text-ink-soft">{vayu.location}, between the Noida–Greater Noida Expressway and the upcoming metro. Typical drive times off-peak:</p>
          <ul className="mt-8 border-t border-line">
            {locations.map((l) => (
              <li key={l.place} className="flex items-baseline justify-between gap-6 border-b border-line py-4">
                <span>{l.place}</span>
                <span className="display-lower shrink-0 text-2xl tabular-nums">{l.time}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative aspect-square overflow-hidden rounded-[28px] bg-surface ring-1 ring-line surface-transition">
          <svg viewBox="0 0 400 400" className="h-full w-full text-ink" role="img" aria-label="Schematic map of Vāyu's surroundings">
            {[60, 110, 160].map((r) => (
              <circle key={r} cx="200" cy="200" r={r} fill="none" stroke="currentColor" strokeOpacity="0.15" strokeDasharray="3 5" />
            ))}
            <path d="M0 300 C120 260 260 330 400 250" fill="none" stroke="var(--gold)" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
            <text x="18" y="290" fontSize="10" fill="currentColor" opacity="0.7">
              Noida–Greater Noida Expressway
            </text>
            <path d="M120 0 L170 400" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
            <path d="M0 120 L400 160" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
            <path d="M250 0 L230 400" fill="none" stroke="var(--moss)" strokeWidth="2.5" strokeDasharray="8 6" />
            <text x="258" y="40" fontSize="10" fill="var(--moss)">
              Metro (proposed)
            </text>
            {[
              { x: 140, y: 120, t: "Gaur Chowk" },
              { x: 300, y: 130, t: "Hospitals" },
              { x: 90, y: 210, t: "Schools" },
              { x: 320, y: 330, t: "To Jewar Airport" },
            ].map((p) => (
              <g key={p.t}>
                <circle cx={p.x} cy={p.y} r="5" fill="currentColor" />
                <text x={p.x + 9} y={p.y + 4} fontSize="11" fill="currentColor">
                  {p.t}
                </text>
              </g>
            ))}
            <circle cx="200" cy="200" r="26" fill="var(--accent)" opacity="0.18">
              <animate attributeName="r" values="18;34;18" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="200" cy="200" r="11" fill="var(--accent)" />
            <text x="200" y="232" textAnchor="middle" fontSize="13" fill="currentColor" style={{ fontFamily: "var(--font-display)" }}>
              Vāyu
            </text>
          </svg>
        </div>
      </div>
    </section>
  );
}

/* ───────── Progress + clearances ───────── */

export function Progress() {
  return (
    <section aria-labelledby="pg-title" className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 md:py-32">
      <SectionHead id="pg-title" title={<>Building,<br />month by month</>} intro="Updated every month with dated site photos. Come and see for yourself on any day of the week." />
      <ul className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {progress.map((p) => (
          <li key={p.tower} className="rounded-3xl bg-surface p-6 ring-1 ring-line surface-transition">
            <div className="flex items-center justify-between text-xs text-ink-soft">
              <span>{p.month}</span>
              <span>{p.pct}%</span>
            </div>
            {/* stacked floors meter */}
            <div className="mt-5 flex h-36 items-end gap-1.5" aria-hidden="true">
              {Array.from({ length: 12 }, (_, i) => (
                <span key={i} className={cn("w-full rounded-sm", i / 12 < p.pct / 100 ? "bg-moss" : "bg-mist")} style={{ height: `${30 + i * 6}%` }} />
              ))}
            </div>
            <h3 className="mt-5 font-display text-2xl">{p.tower}</h3>
            <p className="mt-1 text-sm text-ink-soft">{p.status}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Clearances() {
  return (
    <section aria-labelledby="cl-title" className="mx-auto max-w-[1320px] px-5 pb-24 sm:px-8 md:pb-32">
      <h2 id="cl-title" className="display-lower text-3xl md:text-4xl">
        Environmental clearances
      </h2>
      <ul className="mt-6 grid gap-3 md:grid-cols-3">
        {clearances.map((c) => (
          <li key={c.year}>
            <a href={c.href} className="group flex items-center gap-4 rounded-2xl bg-surface p-5 ring-1 ring-line transition-colors hover:ring-ink/40 surface-transition">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-mist text-ink">
                <FileText size={20} />
              </span>
              <span className="flex-1">
                <span className="block font-display text-2xl leading-none">{c.year}</span>
                <span className="mt-1 block text-sm text-ink-soft">
                  {c.title} · {c.issuer}
                </span>
              </span>
              <Download size={18} className="text-ink-soft transition-transform group-hover:translate-y-0.5" aria-label="Download PDF" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ───────── FAQ ───────── */

export function Faq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <section aria-labelledby="faq-title" className="mx-auto max-w-[980px] px-5 pb-24 sm:px-8 md:pb-32">
      <h2 id="faq-title" className="display text-center text-[clamp(2.3rem,5vw,4.3rem)]">
        Questions buyers ask
      </h2>
      <ul className="mt-12 border-t border-line">
        {faqs.map((f, i) => {
          const isOpen = openIdx === i;
          return (
            <li key={f.q} className="border-b border-line">
              <h3>
                <button onClick={() => setOpenIdx(isOpen ? null : i)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-6 py-6 text-left">
                  <span className="display-lower text-2xl">{f.q}</span>
                  <Plus size={20} className={cn("shrink-0 transition-transform duration-300", isOpen && "rotate-45")} />
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                    <p className="max-w-2xl pb-6 leading-relaxed text-ink-soft">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
