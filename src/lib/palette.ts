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

// ── Per-product tile colors ──
export interface ProductTileColors {
  tileLight: string;
  tileMid: string;
  tileDeep: string;
}

export const productTileColors: Record<string, ProductTileColors> = {
  jag_i_mig: {
    tileLight: '#657514',
    tileMid: '#4A5A0A',
    tileDeep: '#3E4A12',
  },
  jag_med_andra: {
    tileLight: '#8B2FC6',
    tileMid: '#5A1A80',
    tileDeep: '#4A1268',
  },
  jag_i_varlden: {
    tileLight: '#2D6E3A',
    tileMid: '#1A4A24',
    tileDeep: '#2A3A1E',
  },
  vardagskort: {
    tileLight: '#0E6B99',
    tileMid: '#0A4A6A',
    tileDeep: '#063450',
  },
  syskonkort: {
    tileLight: '#247A78',
    tileMid: '#1A5A58',
    tileDeep: '#0E4442',
  },
  sexualitetskort: {
    tileLight: '#A3434B',
    tileMid: '#6A2A30',
    tileDeep: '#4A1A20',
  },
};
