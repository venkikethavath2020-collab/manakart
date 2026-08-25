// ── Delivery policy (single source of truth) ──────────────────────────────
// Our flow: mornings we procure fresh fruit from the market, then deliver in
// the evening. So we DON'T promise instant delivery — we promise a same-day
// evening window for orders placed before the cutoff.

export const DELIVERY = {
  // Order cutoff for same-day delivery (24h clock for logic, label for display)
  cutoffHour: 11, // 02:00 PM
  cutoffLabel: "02:00 PM",

  // Evening delivery window
  windowStart: "4 PM",
  windowEnd: "8 PM",
  windowLabel: "4 PM – 8 PM",

  // Short reusable strings
  sameDayShort: "Same-day evening delivery",
  promiseLine: "Order by 02:00 PM → delivered today, 4–8 PM",

  // Orders after cutoff: accepted, best-effort (today if possible, else tomorrow)
  afterCutoffLine:
    "Ordering after 02:00 PM? We'll try for this evening, otherwise it arrives tomorrow.",
} as const;

/**
 * Given the current time, returns a friendly delivery expectation string.
 * Before cutoff -> same-day evening window; after -> best-effort/next day.
 * `now` is injectable for testing.
 */
export function deliveryEstimate(now: Date = new Date()): string {
  const beforeCutoff = now.getHours() < DELIVERY.cutoffHour;
  return beforeCutoff
    ? `Delivered today, ${DELIVERY.windowLabel}`
    : `Delivered ${DELIVERY.windowLabel} (today if we can, else tomorrow)`;
}
