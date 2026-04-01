import { useLayoutEffect } from 'react';

/**
 * Resets theme CSS variables to :root defaults from index.css.
 * Call this on light-themed pages to prevent dark-theme bleed
 * when navigating from a product page that sets inline vars.
 *
 * useLayoutEffect removes the Verdigris theme class and resets
 * CSS variables BEFORE the browser paints the first frame —
 * eliminates the visible flash on page transitions.
 *
 * Must match :root defaults in index.css — update both if changed.
 * Must remove the same classes that VerdigrisAtmosphere.tsx adds.
 */
export function useDefaultTheme() {
  useLayoutEffect(() => {
    document.documentElement.classList.remove('theme-verdigris');
    document.body.classList.remove('verdigris-grain', 'verdigris-lightleak');

    const root = document.documentElement;
    root.style.setProperty('--text-primary', 'hsl(20, 16%, 15%)');
    root.style.setProperty('--text-secondary', 'hsl(29, 13%, 37%)');
    root.style.setProperty('--surface-base', 'hsl(46, 64%, 89%)');
    root.style.removeProperty('--product-bg');
  }, []);
}
