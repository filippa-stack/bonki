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
      // Kids product enhancements
      if (pronounMode === 'du') {
        // D: Soft accent cushion behind question
        root.style.setProperty('--question-cloud-tint', `hsla(${p}, 0.07)`);
        root.style.setProperty('--question-cloud-border', `hsla(${p}, 0.10)`);
        // A: Radial accent glow on page background
        root.style.setProperty('--kids-bg-glow', `radial-gradient(ellipse at 50% 35%, hsla(${p}, 0.06) 0%, transparent 70%)`);
        // E: Warmer question text color derived from accent
        // Extract hue from primary HSL string (format: "H, S%, L%")
        const hue = p.split(',')[0]?.trim() ?? '215';
        root.style.setProperty('--kids-question-color', `hsl(${hue}, 35%, 22%)`);
        // C: Badge accent
        root.style.setProperty('--kids-counter-bg', `hsla(${p}, 0.09)`);
        root.style.setProperty('--kids-counter-color', `hsla(${p}, 0.70)`);
        root.style.setProperty('--kids-counter-border', `hsla(${p}, 0.15)`);
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
       '--kids-bg-glow', '--kids-question-color',
       '--kids-counter-bg', '--kids-counter-color', '--kids-counter-border',
      ].forEach((v) => root.style.removeProperty(v));
    };
  }, [primary, accent, bgColor, ctaButtonColor, pronounMode]);
}
