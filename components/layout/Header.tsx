"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, Moon, Phone, Sun, X } from "lucide-react";
import { Logo } from "@/components/art/CompassMark";
import { Button } from "@/components/ui/Button";
import { useEnquiry } from "@/components/providers/EnquiryProvider";
import { useTime } from "@/components/providers/TimeProvider";
import { company, navBrands, vayu } from "@/data/site";
import { cn } from "@/lib/cn";

const links = [
  { label: "Vāyu", href: vayu.href },
  { label: "Trust & governance", href: "/trust" },
  { label: "Our approach", href: "/#panchtatva" },
  { label: "About", href: "/#about" },
];

export function TimeToggle({ className }: { className?: string }) {
  const { time, toggle } = useTime();
  const night = time === "night";
  return (
    <button
      onClick={toggle}
      aria-label={night ? "Switch to day view" : "Switch to dusk view"}
      aria-pressed={night}
      className={cn(
        "relative flex h-9 w-[68px] items-center rounded-full border border-line px-1 surface-transition",
        className,
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={cn("flex h-7 w-7 items-center justify-center rounded-full", night ? "ml-auto bg-gold text-forest" : "bg-forest text-paper")}
      >
        {night ? <Moon size={14} /> : <Sun size={14} />}
      </motion.span>
    </button>
  );
}

export function Header() {
  const { open } = useEnquiry();
  const [scrolled, setScrolled] = useState(false);
  const [brandsOpen, setBrandsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
  }, [mobileOpen]);

  const showBrands = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setBrandsOpen(true);
  };
  const hideBrands = () => {
    closeTimer.current = setTimeout(() => setBrandsOpen(false), 140);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <div
        className={cn(
          "mx-auto flex max-w-[1320px] items-center justify-between gap-4 rounded-2xl px-4 py-2.5 transition-all duration-500 sm:px-5",
          scrolled ? "glass shadow-[0_8px_30px_-12px_rgba(30,43,35,0.25)]" : "border border-transparent",
        )}
      >
        <Link href="/" aria-label="ReaRCo home" className="shrink-0">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          <div className="relative" onMouseEnter={showBrands} onMouseLeave={hideBrands}>
            <button
              className="flex items-center gap-1 rounded-full px-3.5 py-2 text-sm text-ink hover:bg-ink/5"
              aria-expanded={brandsOpen}
              aria-haspopup="true"
              onClick={() => setBrandsOpen((v) => !v)}
              onFocus={showBrands}
            >
              Our brands <ChevronDown size={14} className={cn("transition-transform", brandsOpen && "rotate-180")} />
            </button>
            <AnimatePresence>
              {brandsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-1/2 top-full mt-3 w-[620px] -translate-x-1/2 rounded-2xl bg-surface p-3 shadow-[0_30px_60px_-20px_rgba(30,43,35,0.35)] ring-1 ring-line"
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) setBrandsOpen(false);
                  }}
                >
                  <div className="grid grid-cols-3 gap-2">
                    {navBrands.map((b, i) => (
                      <Link
                        key={b.name}
                        href={b.href}
                        className="group rounded-xl p-4 transition-colors hover:bg-ink/5"
                        onClick={() => setBrandsOpen(false)}
                      >
                        <BrandSwatch index={i} />
                        <div className="mt-4 font-display text-xl">{b.name}</div>
                        <p className="mt-1 text-xs leading-relaxed text-ink-soft">{b.promise}</p>
                        <span className="mt-3 inline-block text-xs font-medium text-accent">{b.status}</span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-full px-3.5 py-2 text-sm text-ink hover:bg-ink/5">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a href={company.phoneHref} className="hidden items-center gap-2 px-2 text-sm text-ink-soft hover:text-ink xl:flex">
            <Phone size={14} /> {company.phone}
          </a>
          <TimeToggle className="hidden sm:flex" />
          <div className="hidden sm:block">
            <Button className="whitespace-nowrap" onClick={() => open({ intent: "visit", source: "header" })}>
              Book a site visit
            </Button>
          </div>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex flex-col bg-bg px-6 pb-8 pt-5 lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="flex items-center justify-between">
              <Logo />
              <button className="flex h-10 w-10 items-center justify-center rounded-full border border-line" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X size={18} />
              </button>
            </div>
            <nav className="mt-10 flex flex-col" aria-label="Mobile">
              {[...links, ...navBrands.map((b) => ({ label: b.name, href: b.href }))].map((l, i) => (
                <motion.div key={l.href + l.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }}>
                  <Link href={l.href} onClick={() => setMobileOpen(false)} className="block border-b border-line py-4 font-display text-3xl">
                    {l.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="mt-auto flex items-center justify-between gap-3 pt-8">
              <TimeToggle />
              <Button
                className="flex-1"
                onClick={() => {
                  setMobileOpen(false);
                  open({ intent: "visit", source: "mobile-menu" });
                }}
              >
                Book a site visit
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function BrandSwatch({ index }: { index: number }) {
  const tones = ["bg-moss", "bg-maroon", "bg-gold"];
  return (
    <div className="flex h-16 items-end gap-1 overflow-hidden rounded-lg bg-mist/60 p-2">
      {[0.5, 0.8, 1, 0.65].map((h, i) => (
        <span key={i} className={cn("w-full rounded-sm", tones[index])} style={{ height: `${h * (60 + index * 14)}%`, opacity: 0.55 + i * 0.12 }} />
      ))}
    </div>
  );
}
