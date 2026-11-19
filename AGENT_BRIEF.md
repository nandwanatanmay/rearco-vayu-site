# Brief: redesign rearco.in

You are designing and building a new website for ReaRCo, a real estate developer in Greater Noida West, India. The visual design is your call: palette, typography, layout, motion and imagery are yours to decide. This brief says what the site must do, who it is for, and what it must contain. Make something that stands out among Indian real estate websites and would hold its own on Awwwards.

## Who ReaRCo is

- ReaRCo Private Limited, with its subsidiary KV Developers Pvt. Ltd. The name stands for **Real Estate Asset Resolution Company**.
- What sets them apart: they take over stalled, insolvent housing projects through the IBC/NCLT process and finish them. The finishing work is funded by the **SWAMIH Investment Fund**, the Government of India's last-mile fund for stalled housing.
- Their philosophy is **SUKH**: comfort and happiness. Homes are planned around the **Panchtatva**, the five elements: Sky, Water, Wind, Earth and Fire.
- Tagline: "Shaping spaces that shape lives."
- There are three brand tiers: **ReaRCo Select** (well-planned family homes), **ReaRCo Exquisite** (larger homes with club-grade amenities) and **ReaRCo Royale** (limited-edition homes with bespoke interiors).
- Flagship project: **ReaRCo Vāyu @ KVD Windpark**, Tech Zone IV, Greater Noida West, UP RERA **UPRERAPRJ3122**. It is a revived project: it stalled after launch in 2014 and is now being completed.
- Contact: +91 90162 72727 · vayu@rearco.co.in
- Keep the existing compass-rose logo mark and the ReaRCo wordmark as brand anchors. The visual identity around them is yours to define.

## Who the site is for

1. **Homebuyers in Delhi NCR**, mostly families aged 28–45 who are buying their first or second home. Many have been burned by stalled projects in Greater Noida West, so trust comes before they will look at amenities.
2. **Original KVD Windpark allottees**, who want to know what happens to their booking.
3. **Bankers, investors and partners**, who want to see governance and track record.

Most visitors arrive on a mobile phone, often from a WhatsApp link or an ad.

## What is wrong with the current site (fix all of these)

- A blocking RERA legal popup appears on first visit, and then lead-form popups stack on top of it. It feels hostile.
- The corporate site and the project microsite look like two different companies.
- Sliders duplicate their slides in the DOM, so floor plans and amenities repeat.
- Floor plans are static images with tiny text and are unreadable on a phone.
- Every button opens the same lead-form modal.
- Heavy poetic copy and stock photos of men in suits holding plastic building models.
- The real strength, government-backed revival of stalled homes, is buried.

## Feel to aim for

- Quiet, confident luxury rather than loud builder marketing. It should feel like an institution you can trust with your life savings.
- Biophilic: architecture and nature together. Buildings wrapped in greenery, light and air. The Panchtatva idea should feel tangible and engineered, not mystical.
- Editorial and spacious, with generous whitespace and big confident headlines.
- Inspiration only, not to copy: the Urbansquare luxury real estate concept on Dribbble (a tower growing out of trees, soft light bars, an editorial serif headline, a floating info card). Elyse Residence (a huge wordmark over the hero image). Planetvision by Nixtio (a day/night toggle that re-lights the scene, and a blueprint card next to big stat numbers). ZenSpace (an airy bento layout and a giant wordmark in the footer).
- **One signature moment** people remember and share. Suggested: a day/night or sun-path experience where the whole page re-lights from morning to dusk and the windows of the building glow at night, tying into "a rainbow above, a soft warm glow below." You may propose something better.
- Restraint everywhere else. Avoid generic AI-template tells: identical card grids, an eyebrow label above every heading, fade-up on every section, and 01/02/03 numbering on things that aren't sequences.

## Pages and sections

### 1. Corporate homepage `/`
1. **Hero**: the brand statement and tagline, a hero visual of a biophilic building, and the signature moment. Two calls to action: explore Vāyu, and book a site visit. Small trust chips: SWAMIH-funded, the RERA number, Greater Noida West.
2. **Trust strip**: SWAMIH funding, UP RERA registration, the number of homes being revived and the number of clearances on record.
3. **Who we are**: decode the name Real Estate Asset Resolution Company, and the SUKH idea in a single sentence.
4. **Revival story**: a real timeline (this one *is* a sequence): 2014 launch and stall → IBC resolution → SWAMIH funding → relaunch as Vāyu → construction resumes.
5. **Panchtatva**: the five elements, each tied to a concrete engineering fact (tower spacing, water recycling, cross-ventilation, open green area, daylight) with a metric. Make it interactive.
6. **Our brands**: Select, Exquisite and Royale, each with its promise, price band and status.
7. **Featured project, Vāyu**: starting price, possession date, RERA number, and a teaser of the unit explorer.
8. **Core values** (six): Hope delivered · Family first · Courage of conviction · A secure future · Joy that lasts · Ethical by default.
9. **Vision and mission**. Vision: lead the transformation of real estate development from selling dreams to value-based delivery of homes in vibrant communities, through ethical and sustainable practice. Mission: turn projects around into vibrant communities, with homes where comfort, harmony and lasting value are delivered as promised.
10. **Closing call to action and footer**: quick links, contact details, social links, the RERA number, and links to the disclaimer and privacy pages.

### 2. Vāyu microsite `/rearco-select/vayu-kvd-windpark` (keep this URL for SEO)
- A hero with a banner for the inaugural offer.
- Trust badges for SWAMIH and the home-loan partner banks.
- **Interactive unit configurator** (the key feature):
  - Filter by layout (2, 3 or 3.5 BHK) and by tower (Tower 1, Towers 2–3, Towers 6–7).
  - Toggle the units between sq. m and sq. ft (1 sq. m = 10.7639 sq. ft).
  - Each plan shows carpet area, built-up area, balcony area, facing and an indicative price.
  - A readable, zoomable floor plan that works with pinch-zoom on mobile. Draw plans in SVG until real files arrive.
  - Each layout is rendered exactly once in the DOM.
- Master plan view.
- **Amenities** in five categories: For the soul · For the body · Hospitality · Recreation world · We mean business. Each item is rendered once, with no duplicated slides.
- **Technical specifications**, 10 points: structure, living/dining, bedrooms, kitchen, bathrooms, doors, windows, electrical, lifts and security.
- **Location advantage**: a map or diagram with drive times to the expressway, metro, Gaur Chowk, Sector 62, Jewar airport and hospitals/universities.
- **EMI and price calculator**: pick a unit, then set the down payment, interest rate and tenure. Show the EMI, total interest and total amount payable, using the standard reducing-balance formula.
- **Construction progress**: progress per tower, dated by month, with photos.
- **Environmental clearances**: download cards for the 2014, 2024 and 2025 PDFs.
- FAQ: RERA status, what SWAMIH funding means for buyers, possession, bank loans, and what happens to original allottees.

### 3. Trust & governance hub `/trust`
SWAMIH funding explained simply, the RERA registration with a link to verify it, IBC/NCLT revival milestones, the clearance documents, and a construction progress log. This page is the answer to "can I trust this builder?"

### 4. Brand pages `/brands/[select|exquisite|royale]`
Select links to Vāyu. Exquisite and Royale get "coming soon" pages with a register-interest form.

### 5. Legal pages `/legal/disclaimer` and `/legal/privacy`

## Navigation

- One header across every page, corporate and project alike. It sticks while you scroll.
- A mega-menu for Our Brands (Select, Exquisite, Royale).
- A persistent **Book a site visit** button.
- On mobile, a bottom action bar with Call, WhatsApp and Book visit.

## Lead capture (replaces popup spam)

- One slide-over drawer that opens **only when the visitor clicks** a call to action. Never open it automatically.
- Steps: name and phone → OTP verification (stub it now, with the interface ready for a real provider) → choose to get the brochure on WhatsApp and/or book a site-visit date.
- If the visitor came from the configurator or EMI calculator, pass that context (the unit they picked, their EMI) into the lead.
- A DNC / consent checkbox, unticked by default.
- Every call to action opens the same drawer instance.
- POST to `/api/lead`. Mock it now, with the endpoint and credentials read from environment variables.

## RERA and legal compliance

- No blocking popup on entry. Use a slim, dismissible, non-blocking notice, with the full disclaimer on its own page.
- Show the RERA number in the footer, in the Vāyu hero and in the enquiry drawer.
- Mark prices with "*" and add a note that they are indicative and exclusive of applicable charges.

## Content rules

- I have no real photos or floor plans yet. Use high-quality illustrations, SVG art or tasteful generated visuals instead. **Never** use stock photos of people in suits.
- Prices, unit areas, stats, dates and timelines are placeholders. Keep all content in typed data files, and mark every unconfirmed value `TODO(real-data)` so it can be swapped later without touching the UI.
- Write the copy in plain, warm, specific language. Use sentence case and verbs on buttons ("Book a site visit", "Get brochure on WhatsApp"). No filler and no clichés.

## Technical requirements

- Next.js (App Router) with TypeScript. Use any styling and animation libraries you like.
- Statically generated where possible. Lighthouse mobile scores of at least 90 for performance, 95 for accessibility and 95 for SEO.
- Responsive from 360 px to 1920 px, with no horizontal scroll on mobile.
- Full keyboard access and visible focus. Respect `prefers-reduced-motion`. Meet WCAG AA contrast.
- SEO: per-page metadata, Open Graph images, a sitemap, and JSON-LD (`Organization`, plus `Residence` or `ApartmentComplex` for Vāyu).
- No console errors.
- A README covering setup, where the data files are, and how to swap in real assets.

## Definition of done

- `npm run build` passes with no type errors.
- Both main pages are reviewed at 375 px, 768 px and 1440 px using screenshots, and polished.
- The configurator filters correctly, the unit toggle converts correctly, and each layout appears once.
- The EMI for ₹1 Cr, 20% down, 8.5% interest over 20 years matches the formula.
- The drawer opens from every call to action, closes with Esc, traps focus, and completes the stubbed OTP flow.
- Nothing pops up on first load.
