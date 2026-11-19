"use client";

import { useEffect, useRef, useState } from "react";
import { useTime } from "@/components/providers/TimeProvider";
import type { SiteHero } from "@/components/three/siteHero";

/** Mounts the WebGL hero scene (loaded lazily) and feeds it the time of day. */
export default function HeroCanvas() {
  const host = useRef<HTMLDivElement>(null);
  const hero = useRef<SiteHero | null>(null);
  const { hour } = useTime();
  const hourRef = useRef(hour);
  hourRef.current = hour;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let disposed = false;
    let inst: SiteHero | null = null;
    // WebGL check — keep the CSS sky if it is unavailable.
    try {
      const c = document.createElement("canvas");
      if (!(c.getContext("webgl2") || c.getContext("webgl"))) return;
    } catch {
      return;
    }
    import("@/components/three/siteHero").then(({ SiteHero }) => {
      if (disposed || !host.current) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const lowPower = window.innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) <= 4;
      inst = new SiteHero(host.current, { reducedMotion: reduce, lowPower });
      inst.hour = inst.targetHour = hourRef.current;
      inst.applyHour(hourRef.current);
      requestAnimationFrame(() => !disposed && setReady(true));
      hero.current = inst;
    });
    return () => {
      disposed = true;
      inst?.dispose();
      hero.current = null;
    };
  }, []);

  useEffect(() => {
    if (hero.current) hero.current.targetHour = hour;
  }, [hour]);

  return (
    <div
      ref={host}
      className="absolute inset-0 transition-opacity duration-[1400ms] ease-out"
      style={{ opacity: ready ? 1 : 0 }}
    />
  );
}
