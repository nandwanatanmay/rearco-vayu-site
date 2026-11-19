"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { TowerArt } from "@/components/art/TowerArt";
import { ArchArt, SkylineArt } from "@/components/art/BrandArt";
import { brands } from "@/data/site";

export function Brands() {
  const [select, exquisite, royale] = brands;
  return (
    <section aria-labelledby="brands-title" className="mx-auto max-w-[1400px] px-5 pb-24 sm:px-8 md:pb-36">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <h2 id="brands-title" className="font-display text-[clamp(2.8rem,6.5vw,6rem)] font-medium leading-[0.92] tracking-[-0.02em]">
          Three ways
          <br />
          <em className="font-normal text-accent">to come home.</em>
        </h2>
        <p className="max-w-md text-ink-soft">Every ReaRCo home shares one standard of build and honesty. The brands differ in size, finish and how much is done for you.</p>
      </div>

      <div className="mt-14 grid gap-4 lg:grid-cols-[1.25fr_1fr] lg:grid-rows-2">
        <Link href={select.href} className="group relative row-span-2 flex min-h-[520px] flex-col overflow-hidden rounded-[28px] bg-mist p-7 transition-transform duration-500 hover:-translate-y-1 md:p-9 surface-transition">
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-sm text-ink-soft">ReaRCo</p>
              <h3 className="display text-6xl md:text-7xl">{select.name}</h3>
            </div>
            <span className="rounded-full bg-surface px-3 py-1.5 text-xs">{select.status}</span>
          </div>
          <TowerArt id="tw-select" className="absolute -bottom-6 right-[-8%] h-[92%] w-auto transition-transform duration-700 group-hover:scale-[1.03]" />
          <div className="relative z-10 mt-auto max-w-[16rem]">
            <p className="leading-relaxed text-ink-soft">{select.promise}</p>
            <p className="mt-4 flex items-center gap-2 font-medium">
              {select.price}* <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </p>
          </div>
        </Link>

        {[
          { b: exquisite, Art: SkylineArt },
          { b: royale, Art: ArchArt },
        ].map(({ b, Art }) => (
          <Link key={b.slug} href={b.href} className="group relative flex min-h-[250px] overflow-hidden rounded-[28px] text-[#f4efe6] transition-transform duration-500 hover:-translate-y-1">
            <Art className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/0" />
            <div className="relative z-10 flex w-full flex-col p-7 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-white/70">ReaRCo</p>
                  <h3 className="display text-5xl">{b.name}</h3>
                </div>
                <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs backdrop-blur">{b.status}</span>
              </div>
              <div className="mt-auto max-w-[17rem]">
                <p className="text-sm leading-relaxed text-white/80">{b.promise}</p>
                <p className="mt-3 text-sm font-medium">{b.price}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
