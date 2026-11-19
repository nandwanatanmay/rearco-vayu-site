"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, MessageCircle, X } from "lucide-react";
import type { EnquiryContext } from "@/components/providers/EnquiryProvider";
import { vayu } from "@/data/site";
import { cn } from "@/lib/cn";

type Step = "details" | "otp" | "done";

const headings: Record<NonNullable<EnquiryContext["intent"]>, string> = {
  visit: "Book a site visit",
  brochure: "Get the brochure on WhatsApp",
  callback: "Request a call back",
  interest: "Register your interest",
};

export function EnquiryDrawer({ open, context, onClose }: { open: boolean; context: EnquiryContext; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const [step, setStep] = useState<Step>("details");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [brochure, setBrochure] = useState(true);
  const [consent, setConsent] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const intent = context.intent ?? "visit";

  // reset each time it opens
  useEffect(() => {
    if (open) {
      lastFocus.current = document.activeElement as HTMLElement;
      setStep("details");
      setOtp("");
      setError("");
      setBrochure(intent === "brochure" || intent === "visit");
      document.body.style.overflow = "hidden";
      setTimeout(() => panel.current?.querySelector<HTMLElement>("input,button")?.focus(), 60);
    } else {
      document.body.style.overflow = "";
      lastFocus.current?.focus?.();
    }
  }, [open, intent]);

  // Esc + focus trap
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !panel.current) return;
      const f = panel.current.querySelectorAll<HTMLElement>('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])');
      const list = Array.from(f).filter((el) => !el.hasAttribute("disabled"));
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (name.trim().length < 2) return setError("Enter your name.");
    if (!/^[6-9]\d{9}$/.test(phone.replace(/\D/g, "").slice(-10))) return setError("Enter a 10-digit Indian mobile number.");
    setBusy(true);
    // TODO(otp-provider): call real OTP API. Stubbed: any 4 digits pass.
    await new Promise((r) => setTimeout(r, 700));
    setBusy(false);
    setStep("otp");
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!/^\d{4}$/.test(otp)) return setError("Enter the 4-digit code sent to your phone.");
    setBusy(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, date, brochure, consent, ...context }),
      });
      if (!res.ok) throw new Error();
      setStep("done");
    } catch {
      setError("We couldn't save your request. Check your connection and try again, or call us.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]">
          <motion.div
            className="absolute inset-0 bg-forest/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="enquiry-title"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 32 }}
            className="absolute right-0 top-0 flex h-full w-full max-w-[460px] flex-col overflow-y-auto bg-surface text-ink shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-line p-6">
              <div>
                <h2 id="enquiry-title" className="display-lower text-3xl">
                  {headings[intent]}
                </h2>
                <p className="mt-1 text-sm text-ink-soft">
                  {vayu.full} · RERA {vayu.rera}
                </p>
              </div>
              <button onClick={onClose} className="rounded-full p-2 hover:bg-ink/5" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            {(context.unit || context.emi) && step !== "done" && (
              <div className="mx-6 mt-5 rounded-xl bg-mist/50 p-4 text-sm">
                <span className="text-ink-soft">You were looking at </span>
                <strong>{context.unit}</strong>
                {context.emi && (
                  <>
                    <span className="text-ink-soft"> with an EMI of about </span>
                    <strong>{context.emi}/month</strong>
                  </>
                )}
                . We'll share the exact cost sheet.
              </div>
            )}

            <div className="flex-1 p-6">
              {step === "details" && (
                <form onSubmit={sendOtp} className="space-y-4" noValidate>
                  <Field label="Your name">
                    <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={inputCls} required />
                  </Field>
                  <Field label="Mobile number">
                    <div className="flex">
                      <span className="flex items-center rounded-l-xl border border-r-0 border-line px-3 text-sm text-ink-soft">+91</span>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, "").slice(0, 10))}
                        inputMode="numeric"
                        autoComplete="tel-national"
                        className={cn(inputCls, "rounded-l-none")}
                        required
                      />
                    </div>
                  </Field>
                  {intent === "visit" && (
                    <Field label="Preferred visit date (optional)">
                      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} min={new Date().toISOString().slice(0, 10)} />
                    </Field>
                  )}
                  <Toggle checked={brochure} onChange={setBrochure}>
                    <MessageCircle size={15} className="text-moss" /> Send the brochure to my WhatsApp
                  </Toggle>
                  <Toggle checked={consent} onChange={setConsent}>
                    I agree to be contacted by ReaRCo about this enquiry, even if my number is on the DNC registry.
                  </Toggle>
                  {error && <p className="text-sm text-maroon" role="alert">{error}</p>}
                  <button type="submit" disabled={busy || !consent} className="flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3.5 text-sm font-medium text-accent-ink disabled:opacity-50">
                    {busy && <Loader2 size={16} className="animate-spin" />} Send verification code
                  </button>
                  <p className="text-center text-xs text-ink-soft">We'll text a 4-digit code to confirm it's you. No spam.</p>
                </form>
              )}

              {step === "otp" && (
                <form onSubmit={verify} className="space-y-4" noValidate>
                  <p className="text-sm text-ink-soft">
                    Code sent to <strong className="text-ink">+91 {phone}</strong>.{" "}
                    <button type="button" className="underline" onClick={() => setStep("details")}>
                      Change number
                    </button>
                  </p>
                  <Field label="Verification code">
                    <input
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      className={cn(inputCls, "text-center text-2xl tracking-[0.6em]")}
                      autoFocus
                    />
                  </Field>
                  {error && <p className="text-sm text-maroon" role="alert">{error}</p>}
                  <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3.5 text-sm font-medium text-accent-ink disabled:opacity-50">
                    {busy && <Loader2 size={16} className="animate-spin" />} Verify and {intent === "visit" ? "book visit" : "submit"}
                  </button>
                </form>
              )}

              {step === "done" && (
                <div className="flex flex-col items-start gap-4 pt-6">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-moss text-white">
                    <Check />
                  </span>
                  <h3 className="display-lower text-3xl">{intent === "visit" ? "Visit requested" : "Request received"}</h3>
                  <p className="text-ink-soft">
                    Thank you, {name.split(" ")[0]}. {brochure && "The brochure is on its way to your WhatsApp. "}
                    Our team will call you within working hours{date ? ` to confirm your visit on ${new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}` : ""}.
                  </p>
                  <button onClick={onClose} className="mt-2 rounded-full border border-line px-5 py-2.5 text-sm">
                    Back to the site
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

const inputCls =
  "w-full rounded-xl border border-line bg-transparent px-4 py-3 text-base outline-none transition-colors focus:border-ink";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-ink-soft">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[var(--maroon)]" />
      <span className="flex items-center gap-1.5">{children}</span>
    </label>
  );
}
