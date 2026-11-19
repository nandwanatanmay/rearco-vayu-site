"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { EnquiryDrawer } from "@/components/lead/EnquiryDrawer";

export type EnquiryContext = {
  intent?: "visit" | "brochure" | "callback" | "interest";
  source?: string;
  unit?: string;
  emi?: string;
};

const Ctx = createContext<{ open: (c?: EnquiryContext) => void; close: () => void }>({
  open: () => {},
  close: () => {},
});

export function EnquiryProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [context, setContext] = useState<EnquiryContext>({});

  const open = useCallback((c: EnquiryContext = {}) => {
    setContext(c);
    setOpen(true);
  }, []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <Ctx.Provider value={{ open, close }}>
      {children}
      <EnquiryDrawer open={isOpen} context={context} onClose={close} />
    </Ctx.Provider>
  );
}

export const useEnquiry = () => useContext(Ctx);
