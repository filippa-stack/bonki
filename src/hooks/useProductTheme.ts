import { useEffect } from 'react';

/**
 * Injects product-specific CSS variables onto :root so the entire
 * design system (buttons, accents, text, background) adapts to each product.
 */
export function useProductTheme(primary: string, accent: string, bgColor?: string) {
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
    }

    return () => {
      ['--cta-default', '--cta-hover-v2', '--cta-active', '--cta-bg',
       '--session-header-bg', '--accent-saffron', '--accent-text',
       '--surface-base', '--product-bg',
      ].forEach((v) => root.style.removeProperty(v));
    };
  }, [primary, accent, bgColor]);
}
