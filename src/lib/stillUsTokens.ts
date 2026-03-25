/**
 * Still Us — Design Tokens & Constants
 * Single source of truth for colors, typography, layout values.
 * Import from here instead of hardcoding hex values in components.
 */

// ── Colors ──────────────────────────────────────────────────
export const COLORS = {
  emberNight: '#0A1628',
  emberMid: '#0D2E6B',
  emberGlow: '#1A4A8A',
  lanternGlow: '#D0DFEF',
  driftwood: '#6E82A0',
  driftwoodBody: '#8DA0B8',
  deepSaffron: '#0047AB',
  bonkiOrange: '#0047AB',
  grunden: '#3A6E9B',
  normen: '#1E5A8A',
  konflikten: '#4A6E9B',
  langtan: '#6B8EBB',
  valet: '#0047AB',
  
} as const;

// ── Layer color mapping (0-indexed card_index ranges) ───────
export const LAYER_COLORS: Record<string, string> = {
  grunden: '#3A6E9B',    // cards 0-3  (weeks 1-4)
  normen: '#1E5A8A',     // cards 4-8  (weeks 5-9)
  konflikten: '#4A6E9B', // cards 9-13 (weeks 10-14)
  langtan: '#6B8EBB',    // cards 14-17 (weeks 15-18)
  valet: '#0047AB',      // cards 18-21 (weeks 19-22)
};

export function getLayerForCard(cardIndex: number): { name: string; color: string } {
  if (cardIndex <= 3) return { name: 'Grunden', color: '#3A6E9B' };
  if (cardIndex <= 8) return { name: 'Normen', color: '#1E5A8A' };
  if (cardIndex <= 13) return { name: 'Konflikten', color: '#4A6E9B' };
  if (cardIndex <= 17) return { name: 'Längtan', color: '#6B8EBB' };
  return { name: 'Valet', color: '#0047AB' };
}

// ── Phase boundaries (check-in depth) ───────────────────────
export const PHASE_A_END = 6;    // card_index 0-6  (sliders only)
export const PHASE_B_END = 13;   // card_index 7-13 (sliders + optional reflection)
export const PHASE_C_START = 14; // card_index 14-21 (sliders + invited reflection)

export function getPhase(cardIndex: number): 'A' | 'B' | 'C' {
  if (cardIndex <= PHASE_A_END) return 'A';
  if (cardIndex <= PHASE_B_END) return 'B';
  return 'C';
}

// ── Card ID helpers ─────────────────────────────────────────
export function cardIdFromIndex(index: number): string {
  return `card_${index + 1}`;
}

export function cardIndexFromId(cardId: string): number {
  return parseInt(cardId.replace('card_', ''), 10) - 1;
}

// ── Slug ↔ card_N mapping ───────────────────────────────────
// Uses sliderPrompts as the single source of truth for the slug→index mapping.
import sliderPrompts from '@/data/sliderPrompts';

/** Convert a frontend slug (e.g. 'su-01-smallest-we') to a 0-based card index. Returns -1 if not found. */
export function cardIndexFromSlug(slug: string): number {
  return sliderPrompts.findIndex(p => p.slug === slug);
}

/** Convert a frontend slug to a backend card_N id (e.g. 'card_1'). Returns null if not found. */
export function cardIdFromSlug(slug: string): string | null {
  const index = cardIndexFromSlug(slug);
  if (index === -1) {
    console.warn(`[stillUsTokens] cardIdFromSlug: unknown slug "${slug}"`);
    return null;
  }
  return cardIdFromIndex(index);
}

/** Convert a 0-based card index to a frontend slug. Returns null if out of range. */
export function slugFromCardIndex(index: number): string | null {
  if (index < 0 || index >= sliderPrompts.length) return null;
  return sliderPrompts[index].slug;
}

// ── Feedback cards (0-indexed) ──────────────────────────────
export const FEEDBACK_CARDS = [0, 3, 10, 21];

// ── Notification codes ──────────────────────────────────────
export type NotificationType = 'N1' | 'N2' | 'N3' | 'N4' | 'N5' | 'N6' | 'N7' | 'N8';
