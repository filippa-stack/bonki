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
  'emotional-intimacy': 'hsla(230, 40%, 30%, 0.14)',   // midnight indigo
  'communication':      'hsla(38, 50%, 45%, 0.10)',     // warm saffron
  'category-8':         'hsla(320, 25%, 35%, 0.10)',    // soft rose
  'parenting-together': 'hsla(28, 40%, 40%, 0.10)',     // amber
  'individual-needs':   'hsla(260, 25%, 38%, 0.10)',    // muted plum
  'category-9':         'hsla(215, 30%, 35%, 0.12)',    // steel mist
};
