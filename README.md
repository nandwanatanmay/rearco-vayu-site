# rearco.in — redesign

The new ReaRCo website, built with Next.js (App Router), TypeScript, Tailwind CSS v4 and Framer Motion.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run lint       # type-check
```

## Pages

| Route | What it is |
|---|---|
| `/` | Corporate home: real-time 3D hero with a sun-path timeline, trust marquee, name unfolding on scroll, a tower that builds itself through the revival years, Panchtatva panels, brands, the Vāyu plan reveal, values as moving type, vision read word by word |
| `/rearco-select/vayu-kvd-windpark` | Vāyu microsite: unit explorer (filters, sq ft/sq m, 2D/3D plan, zoom, EMI), master plan, amenities, specs, location, progress, clearances, FAQ |
| `/trust` | Trust & governance hub |
| `/brands/exquisite`, `/brands/royale` | Coming-soon brand pages (Select redirects to Vāyu) |
| `/legal/disclaimer`, `/legal/privacy` | Legal text (needs legal sign-off) |
| `/api/lead` | Lead intake used by the enquiry drawer |

## Changing content

All copy, numbers and unit data live in **`data/site.ts`**. Every value that still needs confirming is marked `TODO(real-data)`:

```bash
grep -rn "TODO(" app components data
```

- **Units / floor plans**: `units` array. Each layout appears once. `rooms` draws the SVG plan on a 0–100 grid. To use real plan images instead, add an `image` field and render it in `components/vayu/FloorPlan.tsx`.
- **Clearance PDFs**: put the files in `public/clearances/` and set each `href` in `clearances`.
- **Progress photos**: extend `progress` with image paths and render them in `components/vayu/Sections.tsx → Progress`.

## Leads

The enquiry drawer (`components/lead/EnquiryDrawer.tsx`) handles every call to action on the site: details → OTP → confirmation.

- The OTP step is **stubbed** (any 4 digits pass). Wire up a provider such as MSG91 or Twilio Verify where marked `TODO(otp-provider)`.
- Set `LEAD_WEBHOOK_URL` in `.env.local` to forward leads to your CRM, Zapier or Google Sheet. Without it, leads are logged to the server console.

## The 3D hero

`components/three/siteHero.ts` renders Vāyu @ KVD Windpark in WebGL (three.js, loaded lazily after the page paints).

- **Massing:** tower footprints come from `data/siteFootprints.json`, traced from the project master plan at about 0.2 m per plan pixel. Heights follow the plan's storey markings (S+22 and S+24) at an assumed 3 m per floor. Façades, trees and landscape are stylised, so treat the scene as an artistic impression.
- **Light:** the sun-path timeline (`SunDial` in `components/home/Hero.tsx`) sets `hour` in `TimeProvider`, from 6 to 21. The scene moves the sun, sky and fog with it, and from about 18:00 the windows and garden lamps light up. The page theme switches to dusk at 18:24 (`DUSK_AT`).
- **Performance and access:** rendering pauses when the hero is off-screen or the tab is hidden. Phones and low-core devices use a lighter path with no bloom and smaller shadows. With `prefers-reduced-motion`, the camera stays still. Without WebGL, a CSS sky shows instead.
- **Plan art:** `public/plans/*.jpg` holds furnished plan art from the Vāyu brochure (Type 1245 and Type 997), used in the home-page reveal.

## Design system

- Tokens are in `app/globals.css`. The day theme is sage; the dusk theme is deep forest with gold. `<html data-time="day|night">` switches between them through `components/providers/TimeProvider.tsx`.
- Fonts: Cormorant Garamond (display), Plus Jakarta Sans (UI).
- Illustrations are code (`components/art/*`), so they re-light with the theme. Replace them with real renders when they're ready, but keep the dusk toggle working by swapping between a day and a dusk render.

See `AGENT_BRIEF.md` for the full product brief.
