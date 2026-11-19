"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Moon, Pause, Play, Sun } from "lucide-react";
import HeroCanvas from "@/components/home/HeroCanvas";
import { ButtonLink, Button } from "@/components/ui/Button";
import { useEnquiry } from "@/components/providers/EnquiryProvider";
import { DUSK_AT, useTime } from "@/components/providers/TimeProvider";
import { vayu } from "@/data/site";
import { cn } from "@/lib/cn";

const ease = [0.22, 1, 0.36, 1] as const;

function clock(h: number) {
  const hh = Math.floor(h);
  const mm = Math.floor((h - hh) * 60 / 5) * 5;
  const ap = hh >= 12 ? "PM" : "AM";
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}:${String(mm).padStart(2, "0")} ${ap}`;
}

function moment(h: number) {
  if (h < 7.5) return "Sunrise over the east lawns";
  if (h < 11) return "Morning light on every balcony";
  if (h < 15) return "High sun, deep shade under the trees";
  if (h < 17.6) return "Breeze through the towers";
  if (h < DUSK_AT) return "Golden hour";
  if (h < 19.6) return "The homes begin to glow";
  return "A soft warm glow below";
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { open } = useEnquiry();
  const { hour, time } = useTime();
  const night = time === "night";

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -90]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative isolate h-[100svh] min-h-[640px] overflow-hidden" aria-label="Introduction">
      {/* CSS sky: shown while WebGL loads, and as the fallback without it */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 transition-[background] duration-[1200ms]"
        style={{
          background: night
            ? "linear-gradient(180deg,#0d1322 0%,#1c2333 55%,#2a2c35 100%)"
            : "linear-gradient(180deg,#9cbcd6 0%,#e4ece6 60%,#cdd6ce 100%)",
        }}
      />
      <div className="absolute inset-0 -z-10">
        <HeroCanvas />
      </div>

      {/* legibility veils */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-[5] hero-veil" />

      <motion.div style={{ y: copyY, opacity: fade }} className="relative mx-auto flex h-full max-w-[1400px] flex-col px-5 pb-36 pt-28 sm:px-8 sm:pb-40 lg:justify-end">
        <div className="max-w-[46rem]">
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease }}
            className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] tracking-wide text-ink-soft"
          >
            <span className="inline-flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60 motion-reduce:hidden" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              Construction resumed
            </span>
            <span aria-hidden="true">·</span>
            <span>SWAMIH-funded</span>
            <span aria-hidden="true">·</span>
            <span>UP RERA {vayu.rera}</span>
          </motion.p>

          <h1 className="font-display text-[clamp(3rem,8.4vw,8.6rem)] font-medium leading-[0.9] tracking-[-0.02em] text-ink">
            {[
              <>Shaping spaces</>,
              <>
                that shape <em className="font-normal italic text-accent">lives</em>
              </>,
            ].map((l, i) => (
              <span key={i} className="block overflow-hidden pb-[0.08em]">
                <motion.span
                  className="block"
                  initial={reduce ? false : { y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1.1, delay: 0.25 + i * 0.12, ease }}
                >
                  {l}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.div initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75, duration: 0.9 }}>
            <p className="mt-6 max-w-[30rem] text-[1.05rem] leading-relaxed text-ink-soft sm:text-lg">
              We finish the homes others left behind, with Government-backed funding, and build them around light, air and green.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href={vayu.href} className="px-6 py-3.5">
                Explore Vāyu <ArrowUpRight size={16} />
              </ButtonLink>
              <Button variant="outline" className="glass px-6 py-3.5" onClick={() => open({ intent: "visit", source: "hero" })}>
                Book a site visit
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* floating project card */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3, duration: 0.9, ease }}
        className="absolute right-8 top-28 hidden w-[290px] lg:block xl:right-[max(2rem,calc((100vw-1400px)/2+2rem))]"
      >
        <Link href={vayu.href} className="glass group block rounded-[26px] p-5 shadow-[0_30px_60px_-30px_rgba(10,20,15,0.5)] surface-transition">
          <div className="flex items-center justify-between text-xs text-ink-soft">
            <span>Live at Windpark · {clock(hour)}</span>
            {night ? <Moon size={14} /> : <Sun size={14} />}
          </div>
          <p className="mt-10 font-display text-[1.9rem] leading-[1.02]">
            Vāyu
            <span className="block text-lg italic text-ink-soft">@ KVD Windpark</span>
          </p>
          <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-line pt-4 text-sm">
            <div>
              <dt className="text-[11px] text-ink-soft">From</dt>
              <dd className="mt-0.5 font-medium">{vayu.startingPrice}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-ink-soft">Towers</dt>
              <dd className="mt-0.5 font-medium">{vayu.towers}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-ink-soft">Possession</dt>
              <dd className="mt-0.5 font-medium">{vayu.possession}</dd>
            </div>
          </dl>
          <span className="mt-4 flex items-center justify-between rounded-2xl bg-ink/5 px-4 py-2.5 text-sm transition-colors group-hover:bg-ink/10">
            See homes &amp; prices <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </Link>
      </motion.div>

      <SunDial />

      <p className="sr-only">Illustration: a 3D artistic impression of the Vāyu towers in their gardens. The light follows the time of day you choose.</p>
    </section>
  );
}

/* ───────── The signature control: drag the sun across the day ───────── */
const TICKS = [6, 9, 12, 15, 18, 21];

function SunDial() {
  const { hour, setHour } = useTime();
  const reduce = useReducedMotion();
  const track = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const raf = useRef(0);
  const dragging = useRef(false);
  const t = (hour - 6) / 15;

  const fromX = useCallback(
    (clientX: number) => {
      const r = track.current!.getBoundingClientRect();
      setHour(6 + 15 * Math.min(1, Math.max(0, (clientX - r.left) / r.width)));
    },
    [setHour],
  );

  const stop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    setPlaying(false);
  }, []);

  const play = useCallback(() => {
    let h = hour >= 20.8 ? 6 : hour;
    let last = performance.now();
    let acc = 0;
    setPlaying(true);
    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      h += dt * 1.25; // the whole day in ~12 s
      acc += dt;
      if (acc > 1 / 30 || h >= 21) {
        acc = 0;
        setHour(Math.min(21, h));
      }
      if (h >= 21) return setPlaying(false);
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }, [hour, setHour]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const onKey = (e: React.KeyboardEvent) => {
    const d = e.shiftKey ? 1 : 0.25;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") setHour(hour + d);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") setHour(hour - d);
    else if (e.key === "Home") setHour(6);
    else if (e.key === "End") setHour(21);
    else return;
    e.preventDefault();
    stop();
  };

  const night = hour >= DUSK_AT;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.1, duration: 0.9, ease }}
      className="absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-10 mx-auto max-w-[1400px] px-5 sm:bottom-8 sm:px-8 lg:left-auto lg:right-0 lg:w-[min(820px,58vw)] lg:pl-0 xl:right-[max(0px,calc((100vw-1400px)/2))]"
    >
      <div className="glass flex items-center gap-3 rounded-full py-2 pl-2 pr-4 shadow-[0_20px_50px_-30px_rgba(10,20,15,0.6)] surface-transition sm:gap-5 sm:pr-6">
        <button
          onClick={() => (playing ? stop() : play())}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink transition-transform hover:scale-105"
          aria-label={playing ? "Pause the day" : "Play a day at Windpark"}
        >
          {playing ? <Pause size={16} /> : <Play size={16} className="translate-x-[1px]" />}
        </button>
        <div className="hidden w-[11.5rem] shrink-0 leading-tight sm:block">
          <p className="text-sm font-medium tabular-nums">{clock(hour)}</p>
          <p className="truncate text-xs text-ink-soft">{moment(hour)}</p>
        </div>

        <div
          ref={track}
          role="slider"
          tabIndex={0}
          aria-label="Time of day at Windpark"
          aria-valuemin={6}
          aria-valuemax={21}
          aria-valuenow={Math.round(hour * 4) / 4}
          aria-valuetext={`${clock(hour)}, ${moment(hour)}`}
          onKeyDown={onKey}
          onPointerDown={(e) => {
            stop();
            dragging.current = true;
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            fromX(e.clientX);
          }}
          onPointerMove={(e) => dragging.current && fromX(e.clientX)}
          onPointerUp={() => (dragging.current = false)}
          onPointerCancel={() => (dragging.current = false)}
          className="group relative h-10 flex-1 cursor-grab touch-none select-none rounded-full active:cursor-grabbing"
        >
          {/* day gradient rail */}
          <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-gradient-to-r from-[#f2c39e] via-[#fff4d6] via-60% to-[#1c2340] opacity-90" />
          {TICKS.map((h) => (
            <span
              key={h}
              aria-hidden="true"
              className="absolute top-1/2 hidden -translate-x-1/2 translate-y-[9px] text-[10px] tabular-nums text-ink-soft md:block"
              style={{ left: `${((h - 6) / 15) * 100}%` }}
            >
              {h === 12 ? "Noon" : `${h % 12 || 12}${h < 12 ? "am" : "pm"}`}
            </span>
          ))}
          <span
            aria-hidden="true"
            className={cn(
              "absolute top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-lg ring-4 transition-colors duration-700 group-focus-visible:ring-gold",
              night ? "bg-[#efe6cf] text-[#1c2340] ring-white/10" : "bg-[#ffd27a] text-[#7a4a10] ring-white/40",
            )}
            style={{ left: `${t * 100}%` }}
          >
            {night ? <Moon size={14} /> : <Sun size={15} />}
          </span>
        </div>
        <span className="hidden shrink-0 text-xs text-ink-soft lg:block">Drag the sun</span>
      </div>
    </motion.div>
  );
}
