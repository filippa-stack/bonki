import { useEffect } from 'react';

/**
 * Parse an HSL string like "hsl(200, 80%, 33%)" into { h, s, l } numbers.
 */
function parseHSLValues(hsl: string): { h: number; s: number; l: number } | null {
  const match = hsl.match(/(\d+),\s*(\d+)%?,\s*(\d+)%?/);
  if (!match) return null;
  return { h: parseInt(match[1]), s: parseInt(match[2]), l: parseInt(match[3]) };
}

/**
 * Generate CTA gradient & shadow variables from a product accent color.
 * Creates a 3-stop vertical gradient (light → base → dark) and matching shadows.
 */
function setCTAVarsFromAccent(root: HTMLElement, accent: string) {
  const parsed = parseHSLValues(accent);
  if (!parsed) return;
  const { h, s, l } = parsed;

  // 3-stop gradient: lighter top, base mid, darker bottom
  root.style.setProperty('--cta-grad-top', `hsl(${h}, ${Math.min(s + 5, 100)}%, ${Math.min(l + 12, 90)}%)`);
  root.style.setProperty('--cta-grad-mid', `hsl(${h}, ${s}%, ${l}%)`);
  root.style.setProperty('--cta-grad-bot', `hsl(${h}, ${Math.max(s - 5, 0)}%, ${Math.max(l - 10, 10)}%)`);

  // Ink: dark version of the hue for contrast
  const inkL = l > 50 ? 12 : 95; // dark ink on light bg, light ink on dark bg
  root.style.setProperty('--cta-ink', `hsl(${h}, ${Math.min(s, 30)}%, ${inkL}%)`);

  // Shadows: semi-transparent accent
  root.style.setProperty('--cta-shadow', `hsla(${h}, ${s}%, ${l}%, 0.40)`);
  root.style.setProperty('--cta-shadow-sm', `hsla(${h}, ${s}%, ${l}%, 0.22)`);
  root.style.setProperty('--cta-inner-shadow', `hsla(${h}, ${Math.max(s - 10, 0)}%, ${Math.max(l - 20, 5)}%, 0.25)`);
}

const CTA_VARS = [
  '--cta-grad-top', '--cta-grad-mid', '--cta-grad-bot',
  '--cta-ink', '--cta-shadow', '--cta-shadow-sm', '--cta-inner-shadow',
];

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

    // Set CTA button colors from accent
    setCTAVarsFromAccent(root, accent);

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
       ...CTA_VARS,
      ].forEach((v) => root.style.removeProperty(v));
    };
  }, [primary, accent, bgColor, ctaButtonColor, pronounMode]);
}
