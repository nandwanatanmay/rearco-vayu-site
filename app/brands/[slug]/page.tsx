import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ArchArt, SkylineArt } from "@/components/art/BrandArt";
import { InterestButton } from "./InterestButton";
import { brands, vayu } from "@/data/site";

export function generateStaticParams() {
  return brands.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const b = brands.find((x) => x.slug === slug);
  return b ? { title: `ReaRCo ${b.name}`, description: b.promise } : {};
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const b = brands.find((x) => x.slug === slug);
  if (!b) notFound();
  if (b.slug === "select") redirect(vayu.href);

  const Art = b.slug === "exquisite" ? SkylineArt : ArchArt;

  return (
    <section className="relative flex min-h-[100svh] items-end overflow-hidden text-[#f4efe6]">
      <Art className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />
      <div className="relative mx-auto w-full max-w-[1320px] px-5 pb-24 pt-40 sm:px-8">
        <p className="text-sm text-white/70">ReaRCo · {b.status}</p>
        <h1 className="display mt-3 text-[clamp(4rem,14vw,11rem)] leading-[0.85]">{b.name}</h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">{b.promise}</p>
        <p className="mt-2 text-white/70">{b.price}</p>
        <div className="mt-9">
          <InterestButton brand={b.name} />
        </div>
      </div>
    </section>
  );
}
