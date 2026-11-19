import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { InterestButton } from "./InterestButton";
import { projects } from "@/data/site";

const p = projects.find((x) => x.slug === "sabari-serenity")!;

export const metadata: Metadata = {
  title: p.name,
  description: `${p.name}, ${p.location}. ${p.blurb}`,
};

export default function SabariSerenityPage() {
  return (
    <section className="relative flex min-h-[100svh] items-end overflow-hidden bg-gradient-to-br from-forest via-moss to-[#c9b79a] text-[#f4efe6]">
      <div aria-hidden className="absolute inset-x-0 bottom-0 flex h-2/5 items-end gap-3 px-10 opacity-30">
        {[0.45, 0.8, 0.6, 1, 0.7, 0.9, 0.5, 0.75, 0.6].map((h, i) => (
          <span key={i} className="w-full rounded-t-sm bg-[#10231f]" style={{ height: `${h * 100}%` }} />
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="relative mx-auto w-full max-w-[1320px] px-5 pb-24 pt-40 sm:px-8">
        <p className="text-sm text-white/70">ReaRCo · {p.status}</p>
        <h1 className="display mt-3 text-[clamp(3.6rem,12vw,10rem)] leading-[0.88]">{p.name}</h1>
        <p className="mt-6 flex items-center gap-2 text-white/85">
          <MapPin size={16} aria-hidden /> {p.location}
        </p>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/85">{p.blurb}</p>
        <div className="mt-9">
          <InterestButton />
        </div>
      </div>
    </section>
  );
}
