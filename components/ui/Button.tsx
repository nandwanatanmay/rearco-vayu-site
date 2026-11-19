import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "solid" | "outline" | "ghost" | "light";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium transition-[background-color,color,border-color,transform] duration-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  solid: "bg-accent text-accent-ink hover:brightness-110 px-5 py-3",
  outline: "border border-line text-ink hover:border-ink px-5 py-3",
  ghost: "text-ink hover:bg-ink/5 px-4 py-2.5",
  light: "bg-white text-forest hover:bg-paper px-5 py-3",
};

type Common = { variant?: Variant; className?: string; children: React.ReactNode };

export function Button({
  variant = "solid",
  className,
  children,
  ...rest
}: Common & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(base, variants[variant], className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "solid",
  className,
  children,
  href,
  ...rest
}: Common & { href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return (
    <Link href={href} className={cn(base, variants[variant], className)} {...rest}>
      {children}
    </Link>
  );
}
