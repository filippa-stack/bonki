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
    tileLight: '#CB7AB2',
    tileMid: '#A85E94',
    tileDeep: '#115D57',
  },
  jag_med_andra: {
    tileLight: '#A62755',
    tileMid: '#8C1F47',
    tileDeep: '#721B3A',
  },
  jag_i_varlden: {
    tileLight: '#C6D423',
    tileMid: '#A3AF1C',
    tileDeep: '#606613',
  },
  vardagskort: {
    tileLight: '#8BDDB0',
    tileMid: '#68C494',
    tileDeep: '#48A873',
  },
  syskonkort: {
    tileLight: '#CF8BDD',
    tileMid: '#B56CC4',
    tileDeep: '#8E459D',
  },
  sexualitetskort: {
    tileLight: '#DD958B',
    tileMid: '#C87D73',
    tileDeep: '#AF685E',
  },
  still_us: {
    tileLight: '#94BCE1',
    tileMid: '#6F9CC5',
    tileDeep: '#4B759B',
  },
};
