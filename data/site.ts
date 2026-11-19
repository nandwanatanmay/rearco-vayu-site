/**
 * All site content lives here so real data can be swapped in without touching UI.
 * Anything marked TODO(real-data) is a placeholder and must be confirmed by ReaRCo
 * before publishing.
 */

export const company = {
  name: "ReaRCo",
  legal: "ReaRCo Private Limited",
  expansion: ["Real", "Estate", "Asset", "Resolution", "Company"],
  tagline: "Shaping spaces that shape lives",
  phone: "+91 90162 72727",
  phoneHref: "tel:+919016272727",
  whatsapp: "https://wa.me/919016272727",
  email: "vayu@rearco.co.in",
  address: "Tech Zone IV, Greater Noida West, Uttar Pradesh",
  social: {
    facebook: "#",
    instagram: "#",
    x: "#",
    linkedin: "#",
  },
};

export const vayu = {
  name: "Vāyu",
  full: "ReaRCo Vāyu @ KVD Windpark",
  href: "/rearco-select/vayu-kvd-windpark",
  rera: "UPRERAPRJ3122",
  location: "Tech Zone IV, Greater Noida West",
  startingPrice: "₹82 L*", // TODO(real-data)
  possession: "Dec 2027", // TODO(real-data)
  towers: 7, // TODO(real-data)
  greenCover: "70%", // TODO(real-data)
  offer: "Inaugural price locked for the first 50 bookings", // TODO(real-data)
};

/**
 * Every project ReaRCo is building or taking forward. Add new ones here and they appear in the
 * header "Projects" menu, the footer and the home-page Projects section automatically.
 */
export type Project = {
  slug: string;
  name: string;
  short: string;
  location: string;
  status: string;
  blurb: string;
  href: string;
  image: string | null;
};

export const projects: Project[] = [
  {
    slug: "vayu",
    name: "Vāyu @ KVD Windpark",
    short: "Vāyu",
    location: vayu.location,
    status: "Now booking",
    blurb: "Seven towers revived under SWAMIH funding, designed around wind, light and greenery.",
    href: vayu.href,
    image: "/projects/vayu-towers.jpg",
  },
  {
    slug: "sabari-serenity",
    name: "Sabari Serenity",
    short: "Serenity",
    location: "Siruseri Main Road, Thalambur, Siruseri, Chennai",
    status: "Coming soon", // TODO(real-data): confirm launch status and RERA
    blurb: "A Sabari Realtors project, now with ReaRCo. Details will be announced soon.",
    href: "/projects/sabari-serenity",
    image: null,
  },
];

export const trustStats = [
  { value: "SWAMIH", label: "Funded under the Government of India's last-mile fund" },
  { value: "UPRERA", label: `Registered project ${vayu.rera}` },
  { value: "1,100+", label: "Homes being revived for waiting families" }, // TODO(real-data)
  { value: "3", label: "Environmental clearances on public record" },
];

export const revival = [
  {
    year: "2014",
    title: "A project stalls",
    body: "KVD Windpark launches, receives its first environmental clearance, then stalls. Buyers are left waiting.",
  },
  {
    year: "2021",
    title: "Resolution under IBC",
    body: "The project enters insolvency resolution. ReaRCo's plan is approved to complete it rather than abandon it.", // TODO(real-data)
  },
  {
    year: "2023",
    title: "Last-mile funding",
    body: "SWAMIH Investment Fund commits capital ring-fenced for construction, not marketing.", // TODO(real-data)
  },
  {
    year: "2024",
    title: "Relaunched as Vāyu",
    body: "Plans re-engineered for wind, light and greenery. Fresh clearance obtained and RERA registration renewed.",
  },
  {
    year: "2025",
    title: "Building again",
    body: "Structure work resumes across towers. Progress photos are published every month.",
  },
];

export type ElementKey = "sky" | "water" | "wind" | "earth" | "fire";

export const panchtatva: {
  key: ElementKey;
  name: string;
  sanskrit: string;
  idea: string;
  fact: string;
  metric: string;
}[] = [
  {
    key: "sky",
    name: "Sky",
    sanskrit: "Ākāśa",
    idea: "Room to breathe",
    fact: "Towers are spaced so no home looks straight into another.",
    metric: "38 m tower spacing", // TODO(real-data)
  },
  {
    key: "water",
    name: "Water",
    sanskrit: "Jala",
    idea: "Nothing wasted",
    fact: "Rainwater is harvested and greywater recycled for the landscape.",
    metric: "100% STP reuse", // TODO(real-data)
  },
  {
    key: "wind",
    name: "Wind",
    sanskrit: "Vāyu",
    idea: "Cross-ventilated by design",
    fact: "Every home has openings on two sides, aligned to the prevailing breeze.",
    metric: "2-side ventilation",
  },
  {
    key: "earth",
    name: "Earth",
    sanskrit: "Pṛthvī",
    idea: "Ground left green",
    fact: "Most of the site is open landscape, with parking kept below ground.",
    metric: "70% open area", // TODO(real-data)
  },
  {
    key: "fire",
    name: "Fire",
    sanskrit: "Agni",
    idea: "Daylight in every room",
    fact: "Window ratios tuned so living rooms need no lights until evening.",
    metric: "Full-height glazing", // TODO(real-data)
  },
];

export const brands = [
  {
    slug: "select",
    name: "Select",
    promise: "Well-planned homes for growing families, delivered on a promise.",
    price: "From ₹82 L", // TODO(real-data)
    status: "Vāyu now booking",
    href: vayu.href,
  },
  {
    slug: "exquisite",
    name: "Exquisite",
    promise: "Larger residences with club-grade amenities and skyline views.",
    price: "From ₹1.6 Cr", // TODO(real-data)
    status: "Coming 2026",
    href: "/brands/exquisite",
  },
  {
    slug: "royale",
    name: "Royale",
    promise: "Limited-edition homes with private lifts and bespoke interiors.",
    price: "By invitation",
    status: "Coming soon",
    href: "/brands/royale",
  },
] as const;

export const values = [
  { title: "Hope, delivered", body: "Rainbow above, soft warm glow below. We finish what others left unfinished." },
  { title: "Family first", body: "Family and friends matter most, so homes are planned around how families live." },
  { title: "Courage of conviction", body: "We take on stalled projects others walk away from, and see them through." },
  { title: "A secure future", body: "Ring-fenced funding and RERA oversight protect every rupee you pay." },
  { title: "Joy that lasts", body: "Spaces for celebrations, quiet mornings and everything between." },
  { title: "Ethical by default", body: "Transparent pricing, published progress and sustainable construction." },
];

/* ───────── Vāyu microsite ───────── */

export type Bhk = "2 BHK" | "3 BHK" | "3.5 BHK";
export type Tower = "Tower 1" | "Tower 2–3" | "Tower 6–7";

export type UnitPlan = {
  id: string;
  bhk: Bhk;
  tower: Tower;
  carpet: number; // sq. m
  builtUp: number; // sq. m
  balcony: number; // sq. m
  price: number; // INR, all-inclusive estimate
  facing: string;
  rooms: { name: string; x: number; y: number; w: number; h: number }[];
};

// TODO(real-data): replace with exact RERA-registered areas & prices per layout.
export const units: UnitPlan[] = [
  {
    id: "t1-2a",
    bhk: "2 BHK",
    tower: "Tower 1",
    carpet: 61.8,
    builtUp: 99.4,
    balcony: 9.6,
    price: 8200000,
    facing: "Park facing",
    rooms: [
      { name: "Living", x: 0, y: 0, w: 56, h: 46 },
      { name: "Kitchen", x: 56, y: 0, w: 44, h: 30 },
      { name: "Bed 1", x: 0, y: 46, w: 50, h: 54 },
      { name: "Bed 2", x: 50, y: 52, w: 50, h: 48 },
      { name: "Bath", x: 56, y: 30, w: 44, h: 22 },
    ],
  },
  {
    id: "t23-2b",
    bhk: "2 BHK",
    tower: "Tower 2–3",
    carpet: 64.2,
    builtUp: 103.1,
    balcony: 10.4,
    price: 8650000,
    facing: "East facing",
    rooms: [
      { name: "Living", x: 0, y: 0, w: 60, h: 50 },
      { name: "Kitchen", x: 60, y: 0, w: 40, h: 34 },
      { name: "Bed 1", x: 0, y: 50, w: 48, h: 50 },
      { name: "Bed 2", x: 48, y: 56, w: 52, h: 44 },
      { name: "Bath", x: 60, y: 34, w: 40, h: 22 },
    ],
  },
  {
    id: "t1-3a",
    bhk: "3 BHK",
    tower: "Tower 1",
    carpet: 82.5,
    builtUp: 132.8,
    balcony: 13.2,
    price: 11200000,
    facing: "Corner, park facing",
    rooms: [
      { name: "Living", x: 0, y: 0, w: 50, h: 44 },
      { name: "Kitchen", x: 50, y: 0, w: 26, h: 30 },
      { name: "Bed 3", x: 76, y: 0, w: 24, h: 44 },
      { name: "Bed 1", x: 0, y: 44, w: 40, h: 56 },
      { name: "Bed 2", x: 40, y: 56, w: 36, h: 44 },
      { name: "Bath", x: 50, y: 30, w: 26, h: 26 },
      { name: "Bath", x: 76, y: 44, w: 24, h: 56 },
    ],
  },
  {
    id: "t23-3b",
    bhk: "3 BHK",
    tower: "Tower 2–3",
    carpet: 85.1,
    builtUp: 136.9,
    balcony: 14.0,
    price: 11650000,
    facing: "North-east facing",
    rooms: [
      { name: "Living", x: 0, y: 0, w: 54, h: 48 },
      { name: "Kitchen", x: 54, y: 0, w: 22, h: 32 },
      { name: "Bed 3", x: 76, y: 0, w: 24, h: 48 },
      { name: "Bed 1", x: 0, y: 48, w: 38, h: 52 },
      { name: "Bed 2", x: 38, y: 58, w: 38, h: 42 },
      { name: "Bath", x: 54, y: 32, w: 22, h: 26 },
      { name: "Bath", x: 76, y: 48, w: 24, h: 52 },
    ],
  },
  {
    id: "t67-3c",
    bhk: "3 BHK",
    tower: "Tower 6–7",
    carpet: 88.4,
    builtUp: 141.5,
    balcony: 15.1,
    price: 12100000,
    facing: "Club facing",
    rooms: [
      { name: "Living", x: 0, y: 0, w: 56, h: 50 },
      { name: "Kitchen", x: 56, y: 0, w: 22, h: 30 },
      { name: "Bed 3", x: 78, y: 0, w: 22, h: 50 },
      { name: "Bed 1", x: 0, y: 50, w: 40, h: 50 },
      { name: "Bed 2", x: 40, y: 56, w: 38, h: 44 },
      { name: "Bath", x: 56, y: 30, w: 22, h: 26 },
      { name: "Bath", x: 78, y: 50, w: 22, h: 50 },
    ],
  },
  {
    id: "t67-35a",
    bhk: "3.5 BHK",
    tower: "Tower 6–7",
    carpet: 101.6,
    builtUp: 162.3,
    balcony: 18.4,
    price: 14400000,
    facing: "Corner, club & park facing",
    rooms: [
      { name: "Living", x: 0, y: 0, w: 48, h: 46 },
      { name: "Kitchen", x: 48, y: 0, w: 22, h: 28 },
      { name: "Study", x: 70, y: 0, w: 30, h: 28 },
      { name: "Bed 1", x: 0, y: 46, w: 36, h: 54 },
      { name: "Bed 2", x: 36, y: 58, w: 32, h: 42 },
      { name: "Bed 3", x: 68, y: 28, w: 32, h: 44 },
      { name: "Bath", x: 48, y: 28, w: 20, h: 30 },
      { name: "Bath", x: 68, y: 72, w: 32, h: 28 },
    ],
  },
  {
    id: "t1-35b",
    bhk: "3.5 BHK",
    tower: "Tower 1",
    carpet: 98.9,
    builtUp: 158.7,
    balcony: 17.2,
    price: 13900000,
    facing: "Park facing",
    rooms: [
      { name: "Living", x: 0, y: 0, w: 52, h: 46 },
      { name: "Kitchen", x: 52, y: 0, w: 22, h: 30 },
      { name: "Study", x: 74, y: 0, w: 26, h: 30 },
      { name: "Bed 1", x: 0, y: 46, w: 36, h: 54 },
      { name: "Bed 2", x: 36, y: 56, w: 32, h: 44 },
      { name: "Bed 3", x: 68, y: 30, w: 32, h: 42 },
      { name: "Bath", x: 52, y: 30, w: 16, h: 26 },
      { name: "Bath", x: 68, y: 72, w: 32, h: 28 },
    ],
  },
];

export const amenities: Record<string, { name: string; note: string }[]> = {
  "For the soul": [
    { name: "Meditation deck", note: "A quiet terrace facing the sunrise" },
    { name: "Panchtatva garden", note: "Five gardens, one for each element" },
    { name: "Reading pavilion", note: "Shaded seating under the canopy" },
  ],
  "For the body": [
    { name: "Infinity pool", note: "25 m lap pool with kids' pool" },
    { name: "Fitness studio", note: "Strength, cardio and yoga rooms" },
    { name: "Jogging trail", note: "A 650 m loop through the landscape" },
  ],
  Hospitality: [
    { name: "Clubhouse lounge", note: "Host guests without leaving home" },
    { name: "Guest suites", note: "Bookable rooms for visiting family" },
    { name: "Concierge desk", note: "Deliveries, maintenance, help" },
  ],
  "Recreation world": [
    { name: "Kids' play zone", note: "Sand pit, climbing and splash pad" },
    { name: "Sports courts", note: "Badminton, tennis and half-court basketball" },
    { name: "Party lawn", note: "For weddings, pujas and birthdays" },
  ],
  "We mean business": [
    { name: "Co-working lounge", note: "Fibre, quiet booths and meeting rooms" },
    { name: "Business centre", note: "Print, scan and video-call suites" },
    { name: "EV-ready parking", note: "Charging points in the basement" },
  ],
};

export const specs = [
  { area: "Structure", detail: "Earthquake-resistant RCC frame designed for Seismic Zone IV" },
  { area: "Living & dining", detail: "Vitrified tiles 800 × 800 mm, acrylic emulsion walls" },
  { area: "Bedrooms", detail: "Laminated wooden flooring in master bedroom, vitrified elsewhere" },
  { area: "Kitchen", detail: "Granite counter, stainless steel sink, dado tiles 2 ft above counter" },
  { area: "Bathrooms", detail: "Anti-skid tiles, branded CP fittings and sanitaryware" },
  { area: "Doors", detail: "Hardwood frames, flush shutters, polished main door" },
  { area: "Windows", detail: "UPVC with toughened glass, aligned for cross-ventilation" },
  { area: "Electrical", detail: "Copper wiring, modular switches, 100% power back-up for common areas" },
  { area: "Lifts", detail: "High-speed passenger and service lifts in every tower" },
  { area: "Security", detail: "Three-tier security, CCTV, video door phone, smart access" },
]; // TODO(real-data): confirm against brochure

export const locations = [
  { place: "Noida–Greater Noida Expressway", time: "12 min" },
  { place: "Aqua Line metro (proposed)", time: "5 min" },
  { place: "Gaur Chowk", time: "8 min" },
  { place: "Noida Sector 62", time: "20 min" },
  { place: "Jewar International Airport", time: "45 min" },
  { place: "Sharda University & hospitals", time: "15 min" },
]; // TODO(real-data)

export const clearances = [
  { year: "2014", title: "Environmental clearance", issuer: "SEIAA, Uttar Pradesh", href: "#" },
  { year: "2024", title: "Revised environmental clearance", issuer: "SEIAA, Uttar Pradesh", href: "#" },
  { year: "2025", title: "Environmental clearance amendment", issuer: "SEIAA, Uttar Pradesh", href: "#" },
]; // TODO(real-data): link the PDFs in /public/clearances

export const progress = [
  { month: "Oct 2025", tower: "Tower 1", status: "Slab 18 of 24 cast", pct: 75 },
  { month: "Oct 2025", tower: "Tower 2–3", status: "Slab 14 of 24 cast", pct: 58 },
  { month: "Oct 2025", tower: "Tower 6–7", status: "Podium complete, structure rising", pct: 34 },
  { month: "Oct 2025", tower: "Clubhouse", status: "Foundation complete", pct: 22 },
]; // TODO(real-data)

export const faqs = [
  {
    q: "Is Vāyu RERA registered?",
    a: `Yes. Vāyu @ KVD Windpark is registered with UP RERA under ${vayu.rera}. You can verify it on the UP RERA portal.`,
  },
  {
    q: "What does SWAMIH funding mean for me as a buyer?",
    a: "SWAMIH is a Government of India-backed fund for completing stalled housing. Its money can only be spent on construction of this project, which protects your payments.",
  },
  {
    q: "When is possession?",
    a: `Current RERA timeline is ${vayu.possession}. Monthly progress photos for each tower are published on this page.`,
  },
  {
    q: "Which banks offer home loans here?",
    a: "Leading banks and housing finance companies have approved the project. Ask our team for the current list and offers.", // TODO(real-data)
  },
  {
    q: "I was an original KVD Windpark buyer. What happens to my booking?",
    a: "Existing allottees are honoured under the approved resolution plan. Contact our allottee desk for your unit's status.",
  },
];

export const navBrands = brands.map((b) => ({ name: `ReaRCo ${b.name}`, href: b.href, promise: b.promise, status: b.status }));
