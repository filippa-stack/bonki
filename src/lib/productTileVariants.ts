/**
 * Per-product interior color variants for the kids tile system.
 *
 * Each kids tile is composed of:
 *   - Outer frame: product anchor color (tileLight in manifest)
 *   - Inner zone: one of N tonal variants from this map
 *   - Title strip: frame color again
 *
 * Variant assignment is POSITION-based (not hash-based): each card's variant
 * is determined by its index in product.cards and the per-product permutation
 * below. The permutations are hand-tuned for a 2-column grid so that
 * horizontally adjacent cards (i, i+1) never share a variant. For products
 * with 4+ variants, vertically adjacent cards (i, i+2) also never share.
 * Same card always shows the same variant because card positions are stable.
 */

export interface ProductInteriorVariants {
  /** Tonal variants of the frame color. */
  variants: string[];
  /**
   * Position-indexed permutation. permutation[positionIndex % length] yields
   * the variants[] index. Length should be ≥ the product's card count.
   */
  permutation: number[];
  /** Index of the variant nearest to the frame — used as the "calm" library treatment. */
  calmIndex: number;
}

export const interiorVariants: Record<string, ProductInteriorVariants> = {
  jag_i_mig: {
    // Frame: #E89B6B (coral-amber) — 4 variants, 21 cards. Variant 1 matches frame.
    variants: ['#DC8050', '#E89B6B', '#F2B58F', '#FAD2B0'],
    permutation: [0, 2, 1, 3, 2, 0, 3, 1, 0, 2, 1, 3, 2, 0, 3, 1, 0, 2, 1, 3, 2],
    calmIndex: 3,
  },
  jag_med_andra: {
    // Frame: #CB7AB2 (magenta-pink) — 3 variants, 21 cards. Variant 1 matches frame.
    variants: ['#B05A8C', '#CB7AB2', '#E5B0D0'],
    permutation: [0, 2, 1, 0, 2, 1, 0, 2, 1, 0, 2, 1, 0, 2, 1, 0, 2, 1, 0, 2, 1],
    calmIndex: 2,
  },
  jag_i_varlden: {
    // Frame: #C6D423 (chartreuse) — 3 variants, 20 cards. Variant 1 matches frame.
    variants: ['#B0B038', '#C6D423', '#E0EA85'],
    permutation: [0, 2, 1, 0, 2, 1, 0, 2, 1, 0, 2, 1, 0, 2, 1, 0, 2, 1, 0, 2],
    calmIndex: 2,
  },
  vardagskort: {
    // Frame: #8BDDB0 (sage) — 4 variants, 15 cards. Variant 1 matches frame.
    variants: ['#62B090', '#8BDDB0', '#B5E2C5', '#DCF5E5'],
    permutation: [0, 2, 1, 3, 2, 0, 3, 1, 0, 2, 1, 3, 2, 0, 3],
    calmIndex: 3,
  },
  syskonkort: {
    // Frame: #CF8BDD (lavender) — 5 variants, 13 cards. Variant 2 (middle) matches frame.
    variants: ['#A689BD', '#B89BC8', '#CF8BDD', '#DAC4DE', '#ECD5F0'],
    permutation: [0, 3, 1, 4, 2, 0, 3, 1, 4, 2, 0, 3, 1],
    calmIndex: 4,
  },
  sexualitetskort: {
    // Frame: #B87560 (rose-clay / N&I) — 4 variants, 14 cards. Variant 1 matches frame.
    variants: ['#A56350', '#B87560', '#C89788', '#DBB5A0'],
    permutation: [0, 2, 1, 3, 2, 0, 3, 1, 0, 2, 1, 3, 2, 0],
    calmIndex: 3,
  },
};

// ── Dev-only adjacency self-check ─────────────────────────────────────────
if (import.meta.env?.DEV) {
  for (const [productId, entry] of Object.entries(interiorVariants)) {
    const p = entry.permutation;
    const variantCount = entry.variants.length;
    for (let i = 0; i < p.length - 1; i++) {
      if (p[i] === p[i + 1]) {
        console.warn(
          `[productTileVariants] ${productId}: horizontal adjacency repeat at i=${i} (variant ${p[i]})`,
        );
      }
    }
    if (variantCount >= 4) {
      for (let i = 0; i < p.length - 2; i++) {
        if (p[i] === p[i + 2]) {
          console.warn(
            `[productTileVariants] ${productId}: vertical adjacency repeat at i=${i} (variant ${p[i]})`,
          );
        }
      }
    }
  }
}

/**
 * Deterministic interior color for a card at a given position in the grid.
 * Returns the frame color as a fallback when product has no variant table.
 */
export function getInteriorForCard(
  productId: string,
  positionIndex: number,
  fallback: string,
): string {
  const entry = interiorVariants[productId];
  if (!entry) return fallback;
  const idx = entry.permutation[positionIndex % entry.permutation.length];
  return entry.variants[idx] ?? fallback;
}

/** "Calm" interior used by the library tile (closest variant to frame). */
export function getCalmInterior(productId: string, fallback: string): string {
  const entry = interiorVariants[productId];
  if (!entry) return fallback;
  return entry.variants[entry.calmIndex] ?? fallback;
}
