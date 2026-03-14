import { useEffect } from 'react';

/**
 * Injects product-specific CSS variables onto :root so the entire
 * design system (buttons, accents, text, background) adapts to each product.
 */
export function useProductTheme(primary: string, accent: string, bgColor?: string, ctaButtonColor?: string, pronounMode?: 'du' | 'ni') {
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
      // Question cloud only for kids products (pronounMode 'du')
      if (pronounMode === 'du') {
        // Use accent color (primary) for visible cloud against light backgrounds
        root.style.setProperty('--question-cloud-tint', `hsla(${p}, 0.07)`);
        root.style.setProperty('--question-cloud-border', `hsla(${p}, 0.10)`);
      }
    }

    if (ctaButtonColor) {
      root.style.setProperty('--cta-button-color', ctaButtonColor);
    }

    return () => {
      ['--cta-default', '--cta-hover-v2', '--cta-active', '--cta-bg',
       '--session-header-bg', '--accent-saffron', '--accent-text',
       '--surface-base', '--product-bg', '--cta-button-color',
       '--question-cloud-tint', '--question-cloud-border',
      ].forEach((v) => root.style.removeProperty(v));
    };
  }, [primary, accent, bgColor, ctaButtonColor, pronounMode]);
}
