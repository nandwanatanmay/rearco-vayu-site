/** Standard reducing-balance EMI. rate = annual %, years = tenure. */
export function emi(principal: number, annualRatePct: number, years: number) {
  const n = years * 12;
  const r = annualRatePct / 12 / 100;
  if (principal <= 0 || n <= 0) return 0;
  if (r === 0) return principal / n;
  const f = Math.pow(1 + r, n);
  return (principal * r * f) / (f - 1);
}

export function inr(v: number) {
  if (v >= 1e7) return `₹${(v / 1e7).toFixed(2)} Cr`;
  if (v >= 1e5) return `₹${(v / 1e5).toFixed(2)} L`;
  return `₹${Math.round(v).toLocaleString("en-IN")}`;
}
