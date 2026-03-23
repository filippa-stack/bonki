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
      // Kids product enhancements
      if (pronounMode === 'du') {
        const hue = p.split(',')[0]?.trim() ?? '215';

        // Detect dark backgrounds — use light question text for readability
        const isDarkBg = (() => {
          try {
            const temp = document.createElement('div');
            temp.style.color = bgColor!;
            document.body.appendChild(temp);
            const rgb = getComputedStyle(temp).color;
            document.body.removeChild(temp);
            const [r, g, b] = rgb.match(/\d+/g)?.map(Number) ?? [0, 0, 0];
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            return luminance < 0.35;
          } catch {
            return false;
          }
        })();

        root.style.setProperty(
          '--kids-question-color',
          isDarkBg ? `hsl(${hue}, 20%, 88%)` : `hsl(${hue}, 35%, 22%)`
        );
        // Badge accent — adapt for dark backgrounds
        root.style.setProperty('--kids-counter-bg', `hsla(${p}, ${isDarkBg ? '0.15' : '0.09'})`);
        root.style.setProperty('--kids-counter-color', `hsla(${p}, ${isDarkBg ? '0.85' : '0.70'})`);
        root.style.setProperty('--kids-counter-border', `hsla(${p}, ${isDarkBg ? '0.25' : '0.15'})`);
      }
    }

    if (ctaButtonColor) {
      root.style.setProperty('--cta-button-color', ctaButtonColor);
    }

    // Tile color tokens (from manifest)
    if (manifest?.tileLight) root.style.setProperty('--tile-light', manifest.tileLight);
    if (manifest?.tileMid) root.style.setProperty('--tile-mid', manifest.tileMid);
    if (manifest?.tileDeep) root.style.setProperty('--tile-deep', manifest.tileDeep);

    return () => {
      ['--cta-default', '--cta-hover-v2', '--cta-active', '--cta-bg',
       '--session-header-bg', '--accent-saffron', '--accent-text',
       '--surface-base', '--product-bg', '--cta-button-color',
       '--kids-question-color',
       '--kids-counter-bg', '--kids-counter-color', '--kids-counter-border',
       '--tile-light', '--tile-mid', '--tile-deep',
      ].forEach((v) => root.style.removeProperty(v));
    };
  }, [primary, accent, bgColor, ctaButtonColor, pronounMode, manifest]);
}
