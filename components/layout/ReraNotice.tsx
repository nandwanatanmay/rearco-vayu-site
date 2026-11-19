"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { vayu } from "@/data/site";

const KEY = "rearco-rera-ack";

/** Non-blocking replacement for the old full-screen RERA wall. */
export function ReraNotice() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let acked = false;
    try {
      acked = localStorage.getItem(KEY) === "1";
    } catch {}
    if (!acked) {
      const t = setTimeout(() => setShow(true), 1800);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.aside
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          className="glass fixed left-3 right-3 top-[76px] z-40 flex items-center gap-3 rounded-2xl py-2 pl-4 pr-2 text-[12.5px] leading-snug shadow-[0_16px_40px_-20px_rgba(30,43,35,0.45)] sm:left-5 sm:right-auto sm:max-w-[34rem] lg:bottom-6 lg:top-auto"
          aria-label="Legal notice"
        >
          <p className="text-ink-soft">
            For information only, not an offer. Vāyu is UP RERA registered: <strong className="font-medium text-ink">{vayu.rera}</strong>.{" "}
            <Link href="/legal/disclaimer" className="underline underline-offset-2 hover:text-ink">
              Disclaimer
            </Link>
          </p>
          <button onClick={dismiss} className="shrink-0 rounded-full bg-ink px-3.5 py-1.5 text-xs text-bg">
            Got it
          </button>
          <button onClick={dismiss} className="shrink-0 rounded-full p-1.5 text-ink-soft hover:bg-ink/5" aria-label="Dismiss notice">
            <X size={14} />
          </button>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
