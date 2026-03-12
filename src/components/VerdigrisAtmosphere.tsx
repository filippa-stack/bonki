import { useEffect } from 'react';

/**
 * Applies the Verdigris theme (dark teal canvas) to Still Us views.
 * Adds the theme class + grain/light-leak atmosphere classes to <html>.
 * Cleans up on unmount.
 */
export function useVerdigrisTheme(active: boolean = true, lightLeakColor?: string) {
  useEffect(() => {
    if (!active) return;

    const root = document.documentElement;
    root.classList.add('theme-verdigris');
    document.body.classList.add('verdigris-grain', 'verdigris-lightleak');

    if (lightLeakColor) {
      root.style.setProperty('--lightleak-color', lightLeakColor);
    }

    return () => {
      root.classList.remove('theme-verdigris');
      document.body.classList.remove('verdigris-grain', 'verdigris-lightleak');
      root.style.removeProperty('--lightleak-color');
    };
  }, [active, lightLeakColor]);
}

/**
 * Category-specific light-leak colors for Still Us.
 * Maps category IDs to warm atmospheric glows.
 */
export const CATEGORY_LIGHTLEAK_COLORS: Record<string, string> = {
  'emotional-intimacy': 'hsla(194, 35%, 55%, 0.14)',   // cool teal
  'communication':      'hsla(41, 50%, 50%, 0.10)',     // warm gold
  'category-8':         'hsla(320, 25%, 45%, 0.10)',    // soft rose
  'parenting-together': 'hsla(28, 40%, 48%, 0.10)',     // amber
  'individual-needs':   'hsla(260, 20%, 48%, 0.10)',    // muted plum
  'category-9':         'hsla(170, 30%, 45%, 0.12)',    // verdant
};
