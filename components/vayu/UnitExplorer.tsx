"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Box, Minus, Plus, RotateCcw, Square } from "lucide-react";
import { units, type Bhk, type Tower, type UnitPlan } from "@/data/site";
import { formatArea, unitLabel, type AreaUnit } from "@/lib/units";
import { emi, inr } from "@/lib/emi";
import { cn } from "@/lib/cn";
import { FloorPlan } from "./FloorPlan";
import { useEnquiry } from "@/components/providers/EnquiryProvider";

const BHKS: Bhk[] = ["2 BHK", "3 BHK", "3.5 BHK"];
const TOWERS: Tower[] = ["Tower 1", "Tower 2–3", "Tower 6–7"];

function Chip({ active, onClick, children, disabled }: { active: boolean; onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        "shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors disabled:opacity-35",
        active ? "border-ink bg-ink text-bg" : "border-line hover:border-ink",
      )}
    >
      {children}
    </button>
  );
}

export function UnitExplorer() {
  const { open } = useEnquiry();
  const [bhk, setBhk] = useState<Bhk | "All">("All");
  const [tower, setTower] = useState<Tower | "All">("All");
  const [area, setArea] = useState<AreaUnit>("sqft");
  const [selectedId, setSelectedId] = useState(units[0].id);
  const [view, setView] = useState<"2d" | "3d">("2d");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number } | null>(null);

  // EMI state
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);

  const filtered = useMemo(() => units.filter((u) => (bhk === "All" || u.bhk === bhk) && (tower === "All" || u.tower === tower)), [bhk, tower]);
  const selected: UnitPlan = filtered.find((u) => u.id === selectedId) ?? filtered[0] ?? units[0];

  const loan = selected.price * (1 - downPct / 100);
  const monthly = emi(loan, rate, years);
  const totalPay = monthly * years * 12;
  const interest = totalPay - loan;

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const pick = (u: UnitPlan) => {
    setSelectedId(u.id);
    resetView();
  };

  const available = (b: Bhk | "All", t: Tower | "All") => units.some((u) => (b === "All" || u.bhk === b) && (t === "All" || u.tower === t));

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-3xl bg-surface p-4 ring-1 ring-line surface-transition md:flex-row md:items-center md:justify-between md:p-5">
        <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 no-scrollbar md:flex-wrap" role="group" aria-label="Filter by size">
          <Chip active={bhk === "All"} onClick={() => setBhk("All")}>
            All sizes
          </Chip>
          {BHKS.map((b) => (
            <Chip key={b} active={bhk === b} onClick={() => setBhk(b)} disabled={!available(b, tower)}>
              {b}
            </Chip>
          ))}
        </div>
        <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 no-scrollbar md:flex-wrap" role="group" aria-label="Filter by tower">
          <Chip active={tower === "All"} onClick={() => setTower("All")}>
            All towers
          </Chip>
          {TOWERS.map((t) => (
            <Chip key={t} active={tower === t} onClick={() => setTower(t)} disabled={!available(bhk, t)}>
              {t}
            </Chip>
          ))}
        </div>
        <div className="flex items-center self-start rounded-full border border-line p-1 text-sm md:self-auto" role="group" aria-label="Area unit">
          {(["sqft", "sqm"] as AreaUnit[]).map((u) => (
            <button key={u} onClick={() => setArea(u)} aria-pressed={area === u} className={cn("rounded-full px-3.5 py-1.5", area === u ? "bg-accent text-accent-ink" : "text-ink-soft")}>
              {unitLabel(u)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* list: each layout rendered once */}
        <ul className="flex gap-3 overflow-x-auto pb-2 no-scrollbar lg:max-h-[640px] lg:flex-col lg:overflow-y-auto lg:pb-0" aria-label="Layouts">
          {filtered.map((u) => (
            <li key={u.id} className="min-w-[230px] lg:min-w-0">
              <button
                onClick={() => pick(u)}
                aria-current={selected.id === u.id}
                className={cn(
                  "w-full rounded-2xl p-4 text-left ring-1 transition-colors",
                  selected.id === u.id ? "bg-forest text-[#eef1e8] ring-forest" : "bg-surface ring-line hover:ring-ink/40",
                )}
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-2xl">{u.bhk}</span>
                  <span className="text-xs opacity-70">{u.tower}</span>
                </div>
                <div className="mt-2 flex justify-between text-sm opacity-80">
                  <span>
                    {formatArea(u.carpet, area)} {unitLabel(area)} carpet
                  </span>
                </div>
                <div className="mt-1 text-sm font-medium">{inr(u.price)}*</div>
              </button>
            </li>
          ))}
          {filtered.length === 0 && <li className="p-4 text-sm text-ink-soft">No layouts match. Try another tower or size.</li>}
        </ul>

        {/* viewer */}
        <div className="grid overflow-hidden rounded-[28px] bg-surface ring-1 ring-line surface-transition xl:grid-cols-[1.25fr_1fr]">
          <div className="relative min-h-[380px] border-b border-line bg-[var(--bg)] xl:border-b-0 xl:border-r">
            <div className="absolute left-4 top-4 z-10 flex rounded-full border border-line bg-surface p-1 text-xs">
              <button onClick={() => setView("2d")} aria-pressed={view === "2d"} className={cn("flex items-center gap-1 rounded-full px-3 py-1.5", view === "2d" && "bg-ink text-bg")}>
                <Square size={12} /> 2D
              </button>
              <button onClick={() => setView("3d")} aria-pressed={view === "3d"} className={cn("flex items-center gap-1 rounded-full px-3 py-1.5", view === "3d" && "bg-ink text-bg")}>
                <Box size={12} /> 3D
              </button>
            </div>
            <div className="absolute right-4 top-4 z-10 flex flex-col overflow-hidden rounded-xl border border-line bg-surface">
              <button aria-label="Zoom in" className="p-2 hover:bg-ink/5" onClick={() => setZoom((z) => Math.min(3, z + 0.4))}>
                <Plus size={15} />
              </button>
              <button aria-label="Zoom out" className="border-y border-line p-2 hover:bg-ink/5" onClick={() => setZoom((z) => Math.max(1, z - 0.4))}>
                <Minus size={15} />
              </button>
              <button aria-label="Reset view" className="p-2 hover:bg-ink/5" onClick={resetView}>
                <RotateCcw size={15} />
              </button>
            </div>

            <div
              className="h-full w-full cursor-grab touch-none overflow-hidden p-10 pt-16 active:cursor-grabbing [perspective:1200px]"
              onPointerDown={(e) => {
                drag.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
                (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
              }}
              onPointerMove={(e) => {
                if (drag.current && zoom > 1) setPan({ x: e.clientX - drag.current.x, y: e.clientY - drag.current.y });
              }}
              onPointerUp={() => (drag.current = null)}
              onWheel={(e) => {
                if (!e.ctrlKey) return;
                setZoom((z) => Math.min(3, Math.max(1, z - e.deltaY * 0.002)));
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{
                    opacity: 1,
                    scale: view === "3d" ? zoom * 0.8 : zoom,
                    x: pan.x,
                    y: pan.y,
                    rotateX: view === "3d" ? 52 : 0,
                    rotateZ: view === "3d" ? -32 : 0,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 160, damping: 24 }}
                  className="mx-auto aspect-square max-w-[460px] text-ink [transform-style:preserve-3d]"
                  style={{ filter: view === "3d" ? "drop-shadow(14px 22px 0 color-mix(in srgb, var(--ink) 12%, transparent))" : undefined }}
                >
                  <FloorPlan unit={selected} className="h-full w-full" />
                </motion.div>
              </AnimatePresence>
            </div>
            <p className="absolute bottom-3 left-4 text-[11px] text-ink-soft">Indicative layout. Drag to pan when zoomed. Not to scale.</p>
          </div>

          <div className="flex flex-col p-6 md:p-8">
            <div className="flex items-baseline justify-between">
              <h3 className="display-lower text-4xl">{selected.bhk}</h3>
              <span className="text-sm text-ink-soft">{selected.tower}</span>
            </div>
            <p className="mt-1 text-sm text-ink-soft">{selected.facing}</p>

            <dl className="mt-6 grid grid-cols-3 gap-2 border-y border-line py-5">
              {[
                { k: "Carpet", v: selected.carpet },
                { k: "Built-up", v: selected.builtUp },
                { k: "Balcony", v: selected.balcony },
              ].map((s) => (
                <div key={s.k}>
                  <dt className="text-xs text-ink-soft">{s.k}</dt>
                  <dd className="display-lower mt-1 text-[1.65rem] leading-none tabular-nums">{formatArea(s.v, area)}</dd>
                  <dd className="text-[11px] text-ink-soft">{unitLabel(area)}</dd>
                </div>
              ))}
            </dl>

            {/* EMI */}
            <div className="mt-6 space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-ink-soft">Price, all inclusive*</span>
                <span className="font-display text-3xl">{inr(selected.price)}</span>
              </div>
              <Slider label="Down payment" value={downPct} min={10} max={50} step={5} onChange={setDownPct} display={`${downPct}% · ${inr((selected.price * downPct) / 100)}`} />
              <Slider label="Interest rate" value={rate} min={7} max={12} step={0.05} onChange={setRate} display={`${rate.toFixed(2)}%`} />
              <Slider label="Tenure" value={years} min={5} max={30} step={1} onChange={setYears} display={`${years} years`} />

              <div className="rounded-2xl bg-mist/55 p-4 surface-transition">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm">Monthly EMI</span>
                  <span className="display-lower text-4xl tabular-nums">{inr(monthly)}</span>
                </div>
                <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-surface" aria-hidden="true">
                  <span className="bg-moss" style={{ width: `${(loan / totalPay) * 100}%` }} />
                  <span className="bg-gold" style={{ width: `${(interest / totalPay) * 100}%` }} />
                </div>
                <div className="mt-2 flex justify-between text-xs text-ink-soft">
                  <span>Loan {inr(loan)}</span>
                  <span>Interest {inr(interest)}</span>
                  <span>Total {inr(totalPay)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row xl:flex-col 2xl:flex-row">
              <button
                onClick={() => open({ intent: "callback", source: "unit-explorer", unit: `${selected.bhk}, ${selected.tower}`, emi: inr(monthly) })}
                className="flex-1 rounded-full bg-accent px-5 py-3.5 text-sm font-medium text-accent-ink"
              >
                Get exact cost sheet
              </button>
              <button
                onClick={() => open({ intent: "visit", source: "unit-explorer", unit: `${selected.bhk}, ${selected.tower}` })}
                className="flex-1 rounded-full border border-line px-5 py-3.5 text-sm hover:border-ink"
              >
                See this home on site
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display: string;
}) {
  return (
    <label className="block">
      <span className="flex justify-between text-sm">
        <span className="text-ink-soft">{label}</span>
        <span className="tabular-nums">{display}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-[var(--moss)]"
      />
    </label>
  );
}
