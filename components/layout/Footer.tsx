import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { CompassMark } from "@/components/art/CompassMark";
import { Mosaic } from "@/components/art/Mosaic";
import { company, navBrands, projects, vayu } from "@/data/site";

const quick = [
  { label: "Projects", href: "/#projects" },
  ...projects.map((p) => ({ label: p.name, href: p.href })),
  { label: "Trust & governance", href: "/trust" },
  { label: "Our approach", href: "/#panchtatva" },
  { label: "About ReaRCo", href: "/#about" },
  { label: "Careers", href: "#" },
];

const social = [
  { label: "Instagram", href: company.social.instagram },
  { label: "LinkedIn", href: company.social.linkedin },
  { label: "Facebook", href: company.social.facebook },
  { label: "X", href: company.social.x },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-maroon text-[#f4e9e2]">
      <Mosaic className="pointer-events-none absolute right-0 top-0 h-56 w-auto text-gold/30" cols={22} rows={10} seed={3} origin="tr" />
      <CompassMark className="pointer-events-none absolute -bottom-40 -left-40 h-[520px] w-[520px] text-white/[0.05]" strokeWidth={0.6} />

      <div className="relative mx-auto max-w-[1320px] px-5 pb-28 pt-20 sm:px-8 sm:pb-10">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <p className="font-display text-3xl leading-tight text-white sm:text-4xl">
              We finish what others left unfinished, and build homes worth the wait.
            </p>
          </div>
          <nav aria-label="Footer">
            <h3 className="text-sm text-[#d9bd85]">Explore</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {quick.map((q) => (
                <li key={q.label}>
                  <Link href={q.href} className="hover:text-white">
                    {q.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h3 className="text-sm text-[#d9bd85]">Brands</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {navBrands.map((b) => (
                <li key={b.name}>
                  <Link href={b.href} className="hover:text-white">
                    {b.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm text-[#d9bd85]">Talk to us</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a href={company.phoneHref} className="flex items-center gap-2.5 hover:text-white">
                  <Phone size={15} /> {company.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${company.email}`} className="flex items-center gap-2.5 hover:text-white">
                  <Mail size={15} /> {company.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={15} className="mt-0.5 shrink-0" /> {company.address}
              </li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-2">
              {social.map((s) => (
                <a key={s.label} href={s.href} className="rounded-full border border-white/20 px-3 py-1.5 text-xs hover:border-white/60">
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Giant wordmark */}
        <div aria-hidden="true" className="mt-20 select-none font-display text-[23vw] font-medium uppercase leading-[0.78] tracking-tight text-transparent [-webkit-text-stroke:1px_rgba(244,233,226,0.35)] sm:text-[21vw] xl:text-[290px]">
          ReaRCo
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/15 pt-6 text-xs text-[#e7d6cd] md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {company.legal}. Vāyu @ KVD Windpark · UP RERA {vayu.rera} · up-rera.in
          </p>
          <div className="flex gap-5">
            <Link href="/legal/disclaimer" className="hover:text-white">
              Disclaimer
            </Link>
            <Link href="/legal/privacy" className="hover:text-white">
              Privacy
            </Link>
          </div>
        </div>
        <p className="mt-3 max-w-3xl text-[11px] leading-relaxed text-[#cfb9ae]">
          Images are artistic impressions. Prices marked * are indicative and exclude stamp duty, registration and other applicable charges. This site is for
          information only and does not constitute an offer.
        </p>
      </div>
    </footer>
  );
}
