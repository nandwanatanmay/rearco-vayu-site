"use client";

import { useEnquiry } from "@/components/providers/EnquiryProvider";

export function InterestButton({ brand }: { brand: string }) {
  const { open } = useEnquiry();
  return (
    <button onClick={() => open({ intent: "interest", source: `brand-${brand.toLowerCase()}` })} className="rounded-full bg-white px-7 py-4 text-sm font-medium text-forest hover:bg-paper">
      Be first to hear about {brand}
    </button>
  );
}
