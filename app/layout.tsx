import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { TimeProvider } from "@/components/providers/TimeProvider";
import { EnquiryProvider } from "@/components/providers/EnquiryProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBar } from "@/components/layout/MobileBar";
import { ReraNotice } from "@/components/layout/ReraNotice";
import { company } from "@/data/site";

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rearco.in"),
  title: {
    default: "ReaRCo · Shaping spaces that shape lives",
    template: "%s · ReaRCo",
  },
  description:
    "ReaRCo (Real Estate Asset Resolution Company) revives stalled housing projects with SWAMIH funding and delivers homes designed around the five elements. Now building Vāyu @ KVD Windpark, Greater Noida West.",
  openGraph: {
    type: "website",
    siteName: "ReaRCo",
    locale: "en_IN",
  },
};

export const viewport: Viewport = {
  themeColor: "#cdd6ce",
};

const orgLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: company.legal,
  alternateName: "ReaRCo",
  url: "https://rearco.in",
  telephone: company.phone,
  email: company.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Tech Zone IV",
    addressLocality: "Greater Noida West",
    addressRegion: "Uttar Pradesh",
    addressCountry: "IN",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" data-time="day" className={`${cormorant.variable} ${jakarta.variable}`} suppressHydrationWarning>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-bg">
          Skip to content
        </a>
        <TimeProvider>
          <EnquiryProvider>
            <Header />
            <main id="main">{children}</main>
            <Footer />
            <MobileBar />
            <ReraNotice />
          </EnquiryProvider>
        </TimeProvider>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
      </body>
    </html>
  );
}
