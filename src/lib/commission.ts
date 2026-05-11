// Single source of truth for everything commission-settlement related.
//
// Rules baked in (per pilot agreement):
//   - 10% of every delivered ride goes to the platform.
//   - A driver only owes us for a given month if their commission for that
//     month is >= MIN_PAYMENT. Smaller totals carry forward implicitly.
//   - Payment is due within GRACE_DAYS after the period ends. Beyond that,
//     the driver is blocked from going online until they settle.
//   - Bank info is shown to the driver in the app so they know where to
//     transfer the money.

export const COMMISSION_RATE = 0.10;
export const MIN_PAYMENT = 500;        // DA — below this, no settlement row.
export const GRACE_DAYS = 7;           // days after period end before lockout.

export const BANK_INFO = {
  // Algérie Poste CCP — 20-digit RIP.
  rip: process.env.NAQLGO_RIP ?? "00799999002457365905",
  accountName: process.env.NAQLGO_ACCOUNT_NAME ?? "NaqlGo",
  // BaridiMob is reachable via the same CCP number on the recipient side.
  baridiMobNote: "نفس رقم CCP صالح للتحويل عبر BaridiMob",
};

/** Earliest day-of-month that the previous-month payment becomes overdue. */
export function overdueCutoffDay(): number {
  return GRACE_DAYS + 1;
}

/** Returns YYYY-MM tuples we should bill for, given today's date.
 *  Logic: every month strictly before the current one. The current month is
 *  always "in progress" — we don't bill it until it ends. */
export function billablePeriodsUpTo(now = new Date(), monthsBack = 12): Array<{ year: number; month: number }> {
  const out: Array<{ year: number; month: number }> = [];
  // Current month is in-progress, so start from previous month.
  for (let i = 1; i <= monthsBack; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }
  return out;
}

/** First-of-next-month at 00:00 — the moment a billing period closes. */
export function periodEndDate(year: number, month: number): Date {
  return new Date(year, month, 1); // month is 1-based, JS Date is 0-based
                                    // so month=5 → June 1st, which is the
                                    // end of May.
}

/** True when "today" is more than GRACE_DAYS past the end of (year, month). */
export function isOverdue(year: number, month: number, now = new Date()): boolean {
  const cutoff = periodEndDate(year, month);
  cutoff.setDate(cutoff.getDate() + GRACE_DAYS);
  return now >= cutoff;
}

/** Pretty label, e.g. "ماي 2026". Used in UI. */
const AR_MONTHS = [
  "جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان",
  "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];
export function arMonthLabel(year: number, month: number): string {
  return `${AR_MONTHS[month - 1] ?? month} ${year}`;
}
