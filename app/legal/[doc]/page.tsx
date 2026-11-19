import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { company, vayu } from "@/data/site";

// TODO(legal): replace with text approved by ReaRCo's legal team.
const docs = {
  disclaimer: {
    title: "Disclaimer",
    body: [
      "This website is for information only. Nothing on it is an offer, an invitation to offer, or a contract of any kind.",
      `ReaRCo Vāyu @ KVD Windpark is registered with the Uttar Pradesh Real Estate Regulatory Authority under registration number ${vayu.rera}. Details are available at www.up-rera.in.`,
      "Images, illustrations, floor plans, amenities and specifications shown are artistic impressions and indicative only. They may change as required by the competent authorities or for design reasons. Furniture and fixtures shown are not part of the standard offering.",
      "Prices marked * are indicative and exclude stamp duty, registration charges, GST and other applicable levies. Final terms are those in the agreement for sale.",
      "Before deciding to buy, please verify all details, including plans, approvals and payment terms, with our sales team and the RERA website.",
    ],
  },
  privacy: {
    title: "Privacy policy",
    body: [
      `${company.legal} collects the details you share in enquiry forms (name, mobile number, preferred visit date and the home you looked at) only to respond to your enquiry.`,
      "We verify your number with a one-time code so that nobody can submit an enquiry in your name.",
      "We do not sell your data. We share it only with service providers who help us respond to you (for example our CRM and messaging provider), under confidentiality obligations.",
      "We store a small preference in your browser to remember whether you chose the day or dusk view, and whether you have read our legal notice. No advertising cookies are set by this site.",
      `To access, correct or delete your data, write to ${company.email}.`,
    ],
  },
} as const;

type Doc = keyof typeof docs;

export function generateStaticParams() {
  return Object.keys(docs).map((doc) => ({ doc }));
}

export async function generateMetadata({ params }: { params: Promise<{ doc: string }> }): Promise<Metadata> {
  const { doc } = await params;
  return doc in docs ? { title: docs[doc as Doc].title } : {};
}

export default async function LegalPage({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;
  if (!(doc in docs)) notFound();
  const d = docs[doc as Doc];
  return (
    <article className="mx-auto max-w-3xl px-5 pb-28 pt-40 sm:px-8">
      <h1 className="display text-[clamp(2.6rem,6vw,4.6rem)]">{d.title}</h1>
      <div className="mt-10 space-y-5 text-[1.05rem] leading-relaxed text-ink-soft">
        {d.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
    </article>
  );
}
