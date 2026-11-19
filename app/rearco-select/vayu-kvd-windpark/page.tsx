import type { Metadata } from "next";
import { VayuHero } from "@/components/vayu/VayuHero";
import { UnitExplorer } from "@/components/vayu/UnitExplorer";
import { Amenities, Clearances, Faq, Location, MasterPlan, Progress, SectionHead, Specs } from "@/components/vayu/Sections";
import { company, faqs, units, vayu } from "@/data/site";

export const metadata: Metadata = {
  title: "Vāyu @ KVD Windpark · 2, 3 & 3.5 BHK in Greater Noida West",
  description: `Cross-ventilated 2, 3 and 3.5 BHK homes in Tech Zone IV, Greater Noida West. SWAMIH-funded, UP RERA ${vayu.rera}. Explore plans, prices and EMI.`,
};

export default function VayuPage() {
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "ApartmentComplex",
      name: vayu.full,
      address: { "@type": "PostalAddress", addressLocality: "Greater Noida West", addressRegion: "Uttar Pradesh", addressCountry: "IN" },
      numberOfAccommodationUnits: units.length,
      telephone: company.phone,
      identifier: vayu.rera,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  return (
    <>
      <VayuHero />

      <section id="plans" aria-labelledby="plans-title" className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 md:py-32">
        <SectionHead
          id="plans-title"
          title={
            <>
              Find your
              <br />
              home
            </>
          }
          intro="Filter by size or tower, switch between square feet and metres, open the plan in 3D, and see what your monthly EMI would be."
        />
        <div className="mt-12">
          <UnitExplorer />
        </div>
        <p className="mt-4 text-xs text-ink-soft">
          *Prices are indicative and exclude stamp duty, registration and applicable charges. Areas as per RERA registration {vayu.rera}.
        </p>
      </section>

      <MasterPlan />
      <Amenities />
      <Specs />
      <Location />
      <Progress />
      <Clearances />
      <Faq />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </>
  );
}
