// Per-fruit purchase units.
//
// Pricing is always derived from the DB `price_per_kg`, so every unit carries a
// `grams` value used for price math (price = price_per_kg * grams / 1000).
// The `label` is what the customer sees, so we can show "Dozen" for bananas or
// hide small weights for large fruits while keeping the same pricing model.

export interface FruitUnit {
  label: string;
  grams: number;
}

// Default: small-to-medium fruits sold by weight.
export const DEFAULT_UNITS: FruitUnit[] = [
  { label: "250g", grams: 250 },
  { label: "500g", grams: 500 },
  { label: "1kg", grams: 1000 },
];

// Large fruits — a whole one is well over 1kg, so 250g/500g make no sense.
const LARGE_UNITS: FruitUnit[] = [
  { label: "1kg", grams: 1000 },
  { label: "2kg", grams: 2000 },
  { label: "3kg", grams: 3000 },
];

// Bananas are sold by the dozen. A dozen ≈ 1kg, half dozen ≈ 500g, so we reuse
// the per-kg price against those gram equivalents.
const BANANA_UNITS: FruitUnit[] = [
  { label: "Half dozen", grams: 500 },
  { label: "Dozen", grams: 1000 },
];

// Map of lowercase fruit name -> its unit set. Anything not listed uses DEFAULT_UNITS.
const UNIT_OVERRIDES: Record<string, FruitUnit[]> = {
  watermelon: LARGE_UNITS,
  pineapple: LARGE_UNITS,
  muskmelon: LARGE_UNITS,
  banana: BANANA_UNITS,
};

/** Returns the purchase units for a fruit, by name (case-insensitive). */
export function unitsForFruit(name?: string): FruitUnit[] {
  if (!name) return DEFAULT_UNITS;
  return UNIT_OVERRIDES[name.toLowerCase()] ?? DEFAULT_UNITS;
}
