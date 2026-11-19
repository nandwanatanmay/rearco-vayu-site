"use client";

import { CalendarDays, MessageCircle, Phone } from "lucide-react";
import { useEnquiry } from "@/components/providers/EnquiryProvider";
import { company } from "@/data/site";

export function MobileBar() {
  const { open } = useEnquiry();
  return (
    <div className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-3 overflow-hidden rounded-2xl glass shadow-[0_10px_40px_-10px_rgba(30,43,35,0.4)] sm:hidden">
      <a href={company.phoneHref} className="flex flex-col items-center gap-1 py-3 text-xs">
        <Phone size={17} /> Call
      </a>
      <a href={company.whatsapp} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 border-x border-line py-3 text-xs">
        <MessageCircle size={17} /> WhatsApp
      </a>
      <button onClick={() => open({ intent: "visit", source: "mobile-bar" })} className="flex flex-col items-center gap-1 bg-accent py-3 text-xs text-accent-ink">
        <CalendarDays size={17} /> Book visit
      </button>
    </div>
  );
}
