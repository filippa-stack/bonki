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
    // Frame: #E89B6B (coral-amber) — 4 variants, 21 cards
    variants: ['#D08560', '#E0926A', '#EDA980', '#F2BC97'],
    permutation: [0, 2, 1, 3, 2, 0, 3, 1, 0, 2, 1, 3, 2, 0, 3, 1, 0, 2, 1, 3, 2],
    calmIndex: 1,
  },
  jag_med_andra: {
    // Frame: #CB7AB2 (magenta-pink) — 3 variants, 21 cards
    variants: ['#B05E96', '#CB7AB2', '#DCA1C8'],
    permutation: [0, 2, 1, 0, 2, 1, 0, 2, 1, 0, 2, 1, 0, 2, 1, 0, 2, 1, 0, 2, 1],
    calmIndex: 1,
  },
  jag_i_varlden: {
    // Frame: #C6D423 (chartreuse) — 3 variants, 20 cards
    variants: ['#B0BD1E', '#C6D423', '#D4DE48'],
    permutation: [0, 2, 1, 0, 2, 1, 0, 2, 1, 0, 2, 1, 0, 2, 1, 0, 2, 1, 0, 2],
    calmIndex: 1,
  },
  vardagskort: {
    // Frame: #8BDDB0 (sage) — 4 variants, 15 cards
    variants: ['#6BC494', '#8BDDB0', '#A8E6C4', '#C4F0DA'],
    permutation: [0, 2, 1, 3, 2, 0, 3, 1, 0, 2, 1, 3, 2, 0, 3],
    calmIndex: 1,
  },
  syskonkort: {
    // Frame: #CF8BDD (lavender) — 5 variants, 13 cards (middle variant matches frame)
    variants: ['#9B5BAE', '#B570C5', '#CF8BDD', '#DDA8E5', '#EAC8EE'],
    permutation: [0, 3, 1, 4, 2, 0, 3, 1, 4, 2, 0, 3, 1],
    calmIndex: 2,
  },
  sexualitetskort: {
    // Frame: #B87560 (rose-clay / N&I) — 4 variants, 14 cards
    variants: ['#A26350', '#B06D58', '#C28571', '#CFA08D'],
    permutation: [0, 2, 1, 3, 2, 0, 3, 1, 0, 2, 1, 3, 2, 0],
    calmIndex: 1,
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
