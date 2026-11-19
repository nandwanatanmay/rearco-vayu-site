import Link from "next/link";
import { CompassMark } from "@/components/art/CompassMark";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[80svh] max-w-3xl flex-col items-center justify-center px-5 pt-28 text-center">
      <CompassMark className="h-16 w-16 text-gold" strokeWidth={1.4} />
      <h1 className="display mt-8 text-5xl md:text-6xl">This page has moved</h1>
      <p className="mt-5 text-ink-soft">The link may be from our old website. Start from the home page or go straight to Vāyu.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="rounded-full bg-accent px-6 py-3 text-sm text-accent-ink">
          Go to home page
        </Link>
        <Link href="/rearco-select/vayu-kvd-windpark" className="rounded-full border border-line px-6 py-3 text-sm">
          See Vāyu
        </Link>
      </div>
    </section>
  );
}
