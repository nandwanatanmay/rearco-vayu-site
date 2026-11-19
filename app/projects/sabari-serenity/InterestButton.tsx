"use client";

import { useEnquiry } from "@/components/providers/EnquiryProvider";

export function InterestButton() {
  const { open } = useEnquiry();
  return (
    <button
      onClick={() => open({ intent: "interest", source: "project-sabari-serenity" })}
      className="rounded-full bg-white px-7 py-4 text-sm font-medium text-forest hover:bg-paper"
    >
      Register your interest
    </button>
  );
}
