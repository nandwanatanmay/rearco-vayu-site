/**
 * External finishes for the Vāyu / Wind Park towers.
 *
 * Source 1 – "External Paint Sample Approval on 31.07.2026" (signed 02/08/26):
 *   feature wall (elevation with minimum offsets, maximum plain surface) … "Daisy Blue" (code read as BB 5017)
 *   base wall (where offsets are major) ………………………………………………… "Steamed Idlis" (code read as WW 0026)
 *   balcony ceiling ……… external-grade emulsion, no texture, WHITE
 *   balcony walls ………… texture finish in the BASE colour
 *   balcony railing upstand … texture finish + WHITE emulsion
 * Source 2 – the three marketing renders (dark balcony railings, pale cool-grey/white towers,
 *   blue-grey feature panels, taupe crown, turquoise pool, timber-fin gate, palms).
 *
 * The hex values for the two paint shades were sampled from a *photograph of the paint card*, so they are
 * only approximate (photo exposure shifts them). Replace with the manufacturer's official values when known.
 */
export const FACADE = {
  /** "Steamed Idlis" – base wall. Sampled ≈ #DBD9CC from the scan; lifted to a paint-card-like cream. */
  base: '#ebe6d6',
  /** "Daisy Blue" – feature wall. Sampled ≈ #A1BADC from the scan; softened to the pale card tone. */
  feature: '#aec5e3',
  /** Balcony ceiling & railing upstand – white emulsion. */
  white: '#f6f5f0',
  /** Balcony back wall – textured base colour, a touch deeper so the recess reads. */
  balconyWall: '#d9d3c0',
  /** Metal balcony railing (render: near-black). */
  railing: '#2f3335',
  /** Window / door glass (render: cool blue-grey). */
  glass: '#5f7488',
  /** Roof / crown cap (render: grey-taupe). */
  crown: '#9b9a95',
} as const;

/** Colours taken from the renders for the surroundings. */
export const SITE_COLOURS = {
  sky: '#b9d2ea',
  pool: '#6fd0cf',
  palmTrunk: '#8a7a62',
  palmFrond: '#3f7a3c',
  timber: '#877d60',
} as const;
