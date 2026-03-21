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

// ── Still Us tokens ──
export const EMBER_NIGHT = '#2E2233';
export const EMBER_MID = '#473454';
export const EMBER_GLOW = '#F5E8CC';

// ── Per-product tile colors ──
export interface ProductTileColors {
  tileLight: string;
  tileMid: string;
  tileDeep: string;
}

export const productTileColors: Record<string, ProductTileColors> = {
  jag_i_mig: {
    tileLight: '#3A6260',
    tileMid: '#2A4A48',
    tileDeep: '#1E3836',
  },
  jag_med_andra: {
    tileLight: '#3A2440',
    tileMid: '#2E1C34',
    tileDeep: '#1B121B',
  },
  jag_i_varlden: {
    tileLight: '#344452',
    tileMid: '#2A3844',
    tileDeep: '#222E38',
  },
  vardagskort: {
    tileLight: '#122E38',
    tileMid: '#0D2530',
    tileDeep: '#081C24',
  },
  syskonkort: {
    tileLight: '#8E5234',
    tileMid: '#6E3E26',
    tileDeep: '#50301C',
  },
  sexualitetskort: {
    tileLight: '#A8766C',
    tileMid: '#886056',
    tileDeep: '#6A4A42',
  },
  still_us: {
    tileLight: '#D4A03A',
    tileMid: '#473454',
    tileDeep: '#2E2233',
  },
};
