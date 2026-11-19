import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { projects, type Project } from "@/data/site";

function Card({ p, feature }: { p: Project; feature?: boolean }) {
  const body = (
    <>
      {p.image ? (
        <Image
          src={p.image}
          alt={`${p.name} render`}
          fill
          sizes={feature ? "(min-width:1024px) 60vw, 100vw" : "(min-width:1024px) 40vw, 100vw"}
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
      ) : (
        <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-forest via-moss to-[#c9b79a]">
          <div className="absolute inset-x-0 bottom-0 flex h-1/2 items-end gap-2 px-8 opacity-40">
            {[0.45, 0.8, 0.6, 1, 0.7, 0.9, 0.5].map((h, i) => (
              <span key={i} className="w-full rounded-t-sm bg-[#10231f]" style={{ height: `${h * 100}%` }} />
            ))}
          </div>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
      <div className="relative z-10 flex h-full flex-col justify-between p-6 text-[#f4efe6] md:p-8">
        <span className="self-start rounded-full bg-white/15 px-3 py-1.5 text-xs backdrop-blur">{p.status}</span>
        <div>
          <h3 className={`display ${feature ? "text-5xl md:text-6xl" : "text-4xl md:text-5xl"}`}>{p.name}</h3>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-white/75">
            <MapPin size={14} aria-hidden /> {p.location}
          </p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/85">{p.blurb}</p>
          <p className="mt-4 flex items-center gap-2 text-sm font-medium">
            {p.slug === "vayu" ? "Explore the project" : "Learn more"}
            <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </p>
        </div>
      </div>
    </>
  );
  const cls = "group relative block min-h-[460px] overflow-hidden rounded-[28px]";
  return (
    <Link href={p.href} className={cls} aria-label={`${p.name} — ${p.status}`}>
      {body}
    </Link>
  );
}

export function Projects() {
  const [first, ...rest] = projects;
  return (
    <section id="projects" aria-labelledby="projects-title" className="scroll-mt-24 mx-auto max-w-[1400px] px-5 pb-24 pt-8 sm:px-8 md:pb-36">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <h2 id="projects-title" className="font-display text-[clamp(2.8rem,6.5vw,6rem)] font-medium leading-[0.92] tracking-[-0.02em]">
          Our
          <br />
          <em className="font-normal text-accent">projects.</em>
        </h2>
        <p className="max-w-md text-ink-soft">Homes we are building, and stalled projects we are taking forward. Each page shows what is confirmed and what is still to come.</p>
      </div>
      <div className="mt-14 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card p={first} feature />
        <div className="grid gap-4">
          {rest.map((p) => (
            <Card key={p.slug} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
