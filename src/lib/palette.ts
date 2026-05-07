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

// ── Adult product palette (Vårt Vi and future adult products) ──
export const DEEP_DUSK_BG = '#0B1026';
export const CORNFLOWER = '#6495ED';
export const DUSTY_ROSE = '#B8868A';
export const STORM_GREY = '#3A4554';
export const SAGE = '#7A8B7A';
export const WARM_GOLD = '#E9C890';

// ── Per-product tile colors ──
export interface ProductTileColors {
  tileLight: string;
  tileMid: string;
  tileDeep: string;
}

export const productTileColors: Record<string, ProductTileColors> = {
  jag_i_mig: {
    tileLight: '#E89B6B',
    tileMid: '#D08560',
    tileDeep: '#8C4A2D',
  },
  jag_med_andra: {
    tileLight: '#CB7AB2',
    tileMid: '#A85E94',
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
    tileLight: '#B87560',
    tileMid: '#A26350',
    tileDeep: '#7E4838',
  },
  still_us: {
    tileLight: '#94BCE1',
    tileMid: '#6F9CC5',
    tileDeep: '#4B759B',
  },
};

/** Per-product dark text color for titles on tiles (in product hue family). */
export const productDarkText: Record<string, string> = {
  jag_i_mig: '#5A3A1F',       // deep coral-brown
  jag_med_andra: '#4A1428',   // deep wine
  jag_i_varlden: '#2E2D08',   // deep olive-brown
  vardagskort: '#0E2E22',     // deep forest
  syskonkort: '#2A1F40',      // deep mauve-violet
  sexualitetskort: '#3D1F15', // deep terracotta
  still_us: '#0A1628',        // ember night
};
