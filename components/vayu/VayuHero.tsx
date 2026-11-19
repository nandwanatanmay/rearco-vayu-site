"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Landmark, MessageCircle, ShieldCheck } from "lucide-react";
import { TowerArt } from "@/components/art/TowerArt";
import { Mosaic } from "@/components/art/Mosaic";
import { Button } from "@/components/ui/Button";
import { TimeToggle } from "@/components/layout/Header";
import { useEnquiry } from "@/components/providers/EnquiryProvider";
import { vayu } from "@/data/site";

export function VayuHero() {
  const { open } = useEnquiry();
  const reduce = useReducedMotion();
  return (
    <section aria-labelledby="vayu-h1" className="relative overflow-hidden bg-sky surface-transition">
      <Mosaic className="pointer-events-none absolute left-0 top-24 h-64 w-auto text-moss/25" cols={16} rows={12} seed={33} origin="tl" />

      <div className="mx-auto grid max-w-[1320px] gap-8 px-5 pb-16 pt-32 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:pb-0 lg:pt-36">
        <div className="relative z-10 lg:pb-24">
          <p className="text-sm text-ink-soft">ReaRCo Select · {vayu.location}</p>
          <h1 id="vayu-h1" className="display mt-4 text-[clamp(4.5rem,15vw,12rem)] leading-[0.85]">
            <motion.span className="block" initial={reduce ? false : { opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}>
              Vāyu
            </motion.span>
          </h1>
          <p className="mt-3 font-display text-3xl text-ink-soft">@ KVD Windpark</p>
          <p className="mt-7 max-w-lg text-[1.05rem] leading-relaxed text-ink-soft">
            2, 3 and 3.5 BHK homes with windows on two sides, set in seven slim towers around a central garden. A stalled project, now funded and rising.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button className="px-6 py-3.5" onClick={() => open({ intent: "visit", source: "vayu-hero" })}>
              Book a site visit
            </Button>
            <Button variant="outline" className="px-6 py-3.5" onClick={() => open({ intent: "brochure", source: "vayu-hero" })}>
              <MessageCircle size={16} /> Brochure on WhatsApp
            </Button>
          </div>

          <ul className="mt-10 grid max-w-xl gap-3 sm:grid-cols-3">
            <li className="flex items-start gap-2.5 text-sm">
              <ShieldCheck size={18} className="mt-0.5 shrink-0 text-moss" />
              <span>
                <strong className="block font-medium">SWAMIH funded</strong>
                <span className="text-ink-soft">Govt. of India fund</span>
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-sm">
              <Landmark size={18} className="mt-0.5 shrink-0 text-moss" />
              <span>
                <strong className="block font-medium">Bank approved</strong>
                <span className="text-ink-soft">Leading lenders</span>
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-sm">
              <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-moss text-[9px] font-semibold text-white">R</span>
              <span>
                <strong className="block font-medium">UP RERA</strong>
                <span className="text-ink-soft">{vayu.rera}</span>
              </span>
            </li>
          </ul>
        </div>

        <div className="relative h-[520px] lg:h-[680px]">
          <TowerArt className="absolute bottom-0 left-1/2 h-full w-auto -translate-x-1/2" />
          <div className="absolute right-0 top-4 flex items-center gap-3 rounded-2xl bg-surface/80 p-2 pl-4 text-sm backdrop-blur surface-transition">
            Day or dusk <TimeToggle />
          </div>
        </div>
      </div>

      {/* offer ribbon */}
      <div className="relative border-t border-line bg-forest text-[#eef1e8]">
        <div className="marquee-track flex gap-12 whitespace-nowrap py-3.5 text-sm" aria-hidden="true">
          {Array.from({ length: 2 }).flatMap((_, k) =>
            [vayu.offer, `Homes from ${vayu.startingPrice}`, `Possession ${vayu.possession}`, `UP RERA ${vayu.rera}`, "Pick-up and drop for site visits"].map((t, i) => (
              <span key={`${k}-${i}`} className="flex items-center gap-12">
                {t} <span className="text-[#d9bd85]">✦</span>
              </span>
            )),
          )}
        </div>
        <p className="sr-only">
          {vayu.offer}. Homes from {vayu.startingPrice}. Possession {vayu.possession}.
        </p>
      </div>
    </section>
  );
}
