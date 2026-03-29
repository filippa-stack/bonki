import { useEffect } from 'react';
import type { ProductManifest } from '@/types/product';

/**
 * Injects product-specific CSS variables onto :root so the entire
 * design system (buttons, accents, text, background) adapts to each product.
 *
 * Accepts either individual args (legacy) or a full ProductManifest for tile colors.
 */
export function useProductTheme(
  primary: string,
  accent: string,
  bgColor?: string,
  ctaButtonColor?: string,
  pronounMode?: 'du' | 'ni',
  manifest?: ProductManifest,
) {
  useEffect(() => {
    const root = document.documentElement;
    const parseHSL = (hsl: string) => hsl.replace(/hsl\(([^)]+)\)/, '$1').trim();
    const p = parseHSL(primary);
    const a = parseHSL(accent);

    root.style.setProperty('--cta-default', `hsl(${p})`);
    root.style.setProperty('--cta-hover-v2', primary);
    root.style.setProperty('--cta-active', primary);
    root.style.setProperty('--cta-bg', primary);
    root.style.setProperty('--session-header-bg', primary);

    root.style.setProperty('--accent-saffron', `hsl(${a})`);
    root.style.setProperty('--accent-text', `hsl(${a})`);

    if (bgColor) {
      root.style.setProperty('--surface-base', bgColor);
      root.style.setProperty('--product-bg', bgColor);

      // All product backgrounds are dark — force light text for readability
      root.style.setProperty('--text-primary', 'hsl(38, 25%, 92%)');
      root.style.setProperty('--text-secondary', 'hsl(38, 15%, 65%)');

      // Product-specific question colors
      if (pronounMode === 'du') {
        // Kids: light tinted text for dark backgrounds
        const hue = p.split(',')[0]?.trim() ?? '215';
        root.style.setProperty('--kids-question-color', `hsl(${hue}, 20%, 88%)`);
        root.style.setProperty('--kids-counter-bg', `hsla(${p}, 0.15)`);
        root.style.setProperty('--kids-counter-color', `hsla(${p}, 0.85)`);
        root.style.setProperty('--kids-counter-border', `hsla(${p}, 0.25)`);
      } else {
        // Still Us (ni): questions render inside white card — use dark text
        root.style.setProperty('--kids-question-color', 'hsl(20, 16%, 15%)');
      }
    }

    if (ctaButtonColor) {
      root.style.setProperty('--cta-button-color', ctaButtonColor);
    }

    // Tile color tokens (from manifest)
    if (manifest?.tileLight) root.style.setProperty('--tile-light', manifest.tileLight);
    if (manifest?.tileMid) root.style.setProperty('--tile-mid', manifest.tileMid);
    if (manifest?.tileDeep) root.style.setProperty('--tile-deep', manifest.tileDeep);

    // No cleanup — vars persist until overwritten by next page's theme hook
    // or useDefaultTheme(). Removing them caused flash during AnimatePresence gap.
  }, [primary, accent, bgColor, ctaButtonColor, pronounMode, manifest]);
}
