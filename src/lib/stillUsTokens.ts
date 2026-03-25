/**
 * Still Us — Design Tokens & Constants
 * Single source of truth for colors, typography, layout values.
 * Import from here instead of hardcoding hex values in components.
 */

// ── Colors ──────────────────────────────────────────────────
export const COLORS = {
  emberNight: '#0D1B2A',
  emberMid: '#1B3A5C',
  emberGlow: '#2A5490',
  lanternGlow: '#D6E4F0',
  driftwood: '#7B8FA8',
  driftwoodBody: '#9AADC2',
  deepSaffron: '#3B82F6',
  bonkiOrange: '#3B82F6',
  grunden: '#4A7C9B',
  normen: '#2E6B8A',
  konflikten: '#5B7EA8',
  langtan: '#7B9EC4',
  valet: '#3B82F6',
  
} as const;

// ── Layer color mapping (0-indexed card_index ranges) ───────
export const LAYER_COLORS: Record<string, string> = {
  grunden: '#4A7C9B',    // cards 0-3  (weeks 1-4)
  normen: '#2E6B8A',     // cards 4-8  (weeks 5-9)
  konflikten: '#5B7EA8', // cards 9-13 (weeks 10-14)
  langtan: '#7B9EC4',    // cards 14-17 (weeks 15-18)
  valet: '#3B82F6',      // cards 18-21 (weeks 19-22)
};

export function getLayerForCard(cardIndex: number): { name: string; color: string } {
  if (cardIndex <= 3) return { name: 'Grunden', color: '#4A7C9B' };
  if (cardIndex <= 8) return { name: 'Normen', color: '#2E6B8A' };
  if (cardIndex <= 13) return { name: 'Konflikten', color: '#5B7EA8' };
  if (cardIndex <= 17) return { name: 'Längtan', color: '#7B9EC4' };
  return { name: 'Valet', color: '#3B82F6' };
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
