export const SQM_TO_SQFT = 10.7639;

export type AreaUnit = "sqm" | "sqft";

export function formatArea(sqm: number, unit: AreaUnit) {
  const v = unit === "sqm" ? sqm : sqm * SQM_TO_SQFT;
  return v.toLocaleString("en-IN", { maximumFractionDigits: unit === "sqm" ? 2 : 0 });
}

export const unitLabel = (u: AreaUnit) => (u === "sqm" ? "sq. m" : "sq. ft");
