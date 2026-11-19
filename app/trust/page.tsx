import type { Metadata } from "next";
import { ExternalLink, FileText, ShieldCheck } from "lucide-react";
import { Mosaic } from "@/components/art/Mosaic";
import { Clearances, Progress } from "@/components/vayu/Sections";
import { revival, vayu } from "@/data/site";

export const metadata: Metadata = {
  title: "Trust & governance",
  description: `How ReaRCo protects buyers: SWAMIH last-mile funding, UP RERA registration ${vayu.rera}, IBC resolution milestones, clearances and monthly construction progress.`,
};

const pillars = [
  {
    title: "Ring-fenced funding",
    body: "SWAMIH Investment Fund I is a Government of India-backed fund, managed by SBICAP Ventures, created to finish stalled affordable and mid-income housing. Its money is released against construction milestones and can only be spent on this project.",
    link: null, // TODO(real-data): add link to SWAMIH sanction letter / official fund page once confirmed
  },
  {
    title: "RERA oversight",
    body: `Vāyu is registered with the Uttar Pradesh Real Estate Regulatory Authority as ${vayu.rera}. 70% of buyer payments must sit in a dedicated project account, and quarterly progress is filed with the regulator.`,
    link: { label: "Verify on UP RERA", href: "https://www.up-rera.in" },
  },
  {
    // TODO(real-data): confirm NCLT bench, order date and resolution-plan wording.
    title: "Court-approved resolution",
    body: "The revival plan was approved through the Insolvency and Bankruptcy Code process, with lenders and existing allottees represented. Their rights are written into the plan.",
    link: null,
  },
];

export default function TrustPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-sky surface-transition">
        <Mosaic className="pointer-events-none absolute right-0 top-20 h-72 w-auto text-moss/30" cols={20} rows={14} seed={61} origin="tr" />
        <div className="relative mx-auto max-w-[1320px] px-5 pb-20 pt-36 sm:px-8 md:pb-28 md:pt-44">
          <h1 className="display max-w-4xl text-[clamp(2.8rem,7vw,6.2rem)]">Can I trust this builder?</h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-soft">
            It is the right question to ask in Greater Noida West. Here is everything you need to answer it yourself: who funds us, who regulates us, what
            has been built, and the documents behind it.
          </p>
        </div>
      </section>

      <section aria-label="Safeguards" className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8">
        <ul className="grid gap-4 md:grid-cols-3">
          {pillars.map((p) => (
            <li key={p.title} className="flex flex-col rounded-3xl bg-surface p-8 ring-1 ring-line surface-transition">
              <ShieldCheck className="text-moss" />
              <h2 className="display-lower mt-10 text-3xl">{p.title}</h2>
              <p className="mt-3 flex-1 leading-relaxed text-ink-soft">{p.body}</p>
              {p.link && (
                <a href={p.link.href} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                  {p.link.label} <ExternalLink size={14} />
                </a>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="ms-title" className="bg-forest text-[#eef1e8]">
        <div className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 md:py-28">
          <h2 id="ms-title" className="display text-[clamp(2.3rem,5vw,4.3rem)]">
            Revival milestones
          </h2>
          <ol className="mt-12 border-t border-white/15">
            {revival.map((r) => (
              <li key={r.year} className="grid gap-2 border-b border-white/15 py-6 md:grid-cols-[140px_260px_1fr] md:gap-8">
                <span className="font-display text-3xl text-[#d9bd85]">{r.year}</span>
                <span className="font-medium text-white">{r.title}</span>
                <span className="text-[#b4c0b0]">{r.body}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Progress />
      <Clearances />

      <section className="mx-auto max-w-[1320px] px-5 pb-28 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-mist p-8 surface-transition md:flex-row md:items-center md:p-10">
          <div className="flex items-start gap-4">
            <FileText className="mt-1 shrink-0" />
            <p className="max-w-2xl leading-relaxed">
              Want the resolution plan summary, approvals or bank tie-ups? Our allottee desk shares them on request, in person or by email.
            </p>
          </div>
          <a href="mailto:vayu@rearco.co.in" className="shrink-0 rounded-full bg-accent px-6 py-3.5 text-sm font-medium text-accent-ink">
            Request documents
          </a>
        </div>
      </section>
    </>
  );
}
