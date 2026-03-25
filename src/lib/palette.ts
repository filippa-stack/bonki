/**
 * Bonki Master Palette — single source of truth for all brand colors.
 * Components should import from here instead of hardcoding hex values.
 */

// ── Global constants ──
export const MIDNIGHT_INK = '#1A1A2E';
export const DEEP_DUSK = '#2A2D3A';
export const FOREST_TEAL = '#33656D';
export const SAFFRON_FLAME = '#E9B44C';
export const DEEP_SAFFRON = '#D4A03A';
export const LANTERN_GLOW = '#FDF6E3';
export const PARCHMENT = '#F5EDD2';
export const WARM_WHITE = '#FFFDF8';
export const BONKI_ORANGE = '#E85D2C';
export const BARK = '#2C2420';
export const DRIFTWOOD = '#6B5E52';
/** @deprecated Ghost Glow removed from product surfaces. Kept for reference only. */
export const GHOST_GLOW = '#D4F5C0';

// ── Still Us tokens ──
export const EMBER_NIGHT = '#0A1628';
export const EMBER_MID = '#0D2E6B';
export const EMBER_GLOW = '#D0DFEF';

// ── Per-product tile colors ──
export interface ProductTileColors {
  tileLight: string;
  tileMid: string;
  tileDeep: string;
}

export const productTileColors: Record<string, ProductTileColors> = {
  jag_i_mig: {
    tileLight: '#2D6B62',
    tileMid: '#224F4A',
    tileDeep: '#1A3B38',
  },
  jag_med_andra: {
    tileLight: '#B07A3A',
    tileMid: '#8A6036',
    tileDeep: '#6A4828',
  },
  jag_i_varlden: {
    tileLight: '#344452',
    tileMid: '#2A3844',
    tileDeep: '#222E38',
  },
  vardagskort: {
    tileLight: '#162C26',
    tileMid: '#10241E',
    tileDeep: '#0A1A18',
  },
  syskonkort: {
    tileLight: '#4A2028',
    tileMid: '#3A1820',
    tileDeep: '#2A1018',
  },
  sexualitetskort: {
    tileLight: '#A8766D',
    tileMid: '#8A5F57',
    tileDeep: '#6E4A44',
  },
  still_us: {
    tileLight: '#0A1628',
    tileMid: '#0D2E6B',
    tileDeep: '#071020',
  },
};
