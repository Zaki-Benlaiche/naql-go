// Normalize Algerian phone numbers into a single canonical form: 10 digits
// starting with 0 (e.g. 0612345678). This prevents the same person from
// registering twice with different formats ("+213 6 12...", "06-12...").

export function normalizePhone(raw: string): string {
  if (!raw) return "";
  // Strip everything that's not a digit or +
  let p = raw.replace(/[^\d+]/g, "");
  // International prefixes → 0
  if (p.startsWith("+213")) p = "0" + p.slice(4);
  else if (p.startsWith("00213")) p = "0" + p.slice(5);
  else if (p.startsWith("213") && p.length === 12) p = "0" + p.slice(3);
  return p;
}

// Algerian mobile numbers: 10 digits, starts with 05/06/07.
// (Landlines 02/03/04 also valid, but the platform only services mobile users.)
export function isValidPhone(p: string): boolean {
  return /^0[567]\d{8}$/.test(p);
}
