/**
 * Per-product interior color variants for the kids tile system.
 *
 * Each kids tile is composed of:
 *   - Outer frame: product anchor color (tileLight in manifest)
 *   - Inner zone: one of N tonal variants from this map
 *   - Title strip: frame color again
 *
 * Variant assignment is deterministic by cardId via getInteriorForCard.
 * Per-product permutation tables are pre-shuffled to avoid same-variant
 * adjacency in the typical product-home grid sequence.
 */

export interface ProductInteriorVariants {
  /** Tonal variants of the frame color (3-5 entries). */
  variants: string[];
  /**
   * Pre-shuffled permutation indices into `variants`. Cycled through by
   * stable hash of cardId. Length should be co-prime with typical card count
   * within a category to maximise distribution.
   */
  permutation: number[];
  /** Index of the variant nearest to the frame — used as the "calm" library treatment. */
  calmIndex: number;
}

export const interiorVariants: Record<string, ProductInteriorVariants> = {
  jag_i_mig: {
    // Frame: #E89B6B (coral-amber)
    variants: ['#D08560', '#E0926A', '#EDA980', '#F2BC97'],
    permutation: [1, 3, 0, 2, 3, 1, 2, 0],
    calmIndex: 1,
  },
  jag_med_andra: {
    // Frame: #CB7AB2 (magenta-pink)
    variants: ['#B05E96', '#CB7AB2', '#DCA1C8'],
    permutation: [1, 0, 2, 1, 2, 0],
    calmIndex: 1,
  },
  jag_i_varlden: {
    // Frame: #C6D423 (chartreuse) — narrow workable range
    variants: ['#B0BD1E', '#C6D423', '#D4DE48'],
    permutation: [1, 2, 0, 1, 0, 2],
    calmIndex: 1,
  },
  vardagskort: {
    // Frame: #8BDDB0 (sage)
    variants: ['#6BC494', '#8BDDB0', '#A8E6C4', '#C4F0DA'],
    permutation: [1, 3, 0, 2, 2, 0, 3, 1],
    calmIndex: 1,
  },
  syskonkort: {
    // Frame: #CF8BDD (lavender) — middle variant intentionally matches frame
    variants: ['#9B5BAE', '#B570C5', '#CF8BDD', '#DDA8E5', '#EAC8EE'],
    permutation: [2, 0, 3, 1, 4, 2, 1, 3, 0, 4],
    calmIndex: 2,
  },
  sexualitetskort: {
    // Frame: #B87560 (rose-clay)
    variants: ['#A26350', '#B06D58', '#C28571', '#CFA08D'],
    permutation: [1, 3, 0, 2, 3, 1, 2, 0],
    calmIndex: 1,
  },
};

/** Stable djb2-ish hash producing a non-negative integer. */
function hashCardId(cardId: string): number {
  let h = 5381;
  for (let i = 0; i < cardId.length; i++) {
    h = ((h << 5) + h + cardId.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Deterministic interior color for a given (productId, cardId).
 * Returns the frame color as a fallback when product has no variant table.
 */
export function getInteriorForCard(
  productId: string,
  cardId: string,
  fallback: string,
): string {
  const entry = interiorVariants[productId];
  if (!entry) return fallback;
  const idx = entry.permutation[hashCardId(cardId) % entry.permutation.length];
  return entry.variants[idx] ?? fallback;
}

/** "Calm" interior used by the library tile (closest variant to frame). */
export function getCalmInterior(productId: string, fallback: string): string {
  const entry = interiorVariants[productId];
  if (!entry) return fallback;
  return entry.variants[entry.calmIndex] ?? fallback;
}
