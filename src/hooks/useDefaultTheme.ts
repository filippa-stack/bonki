import { useEffect } from 'react';

/**
 * Resets theme CSS variables to :root defaults from index.css.
 * Call this on light-themed pages to prevent dark-theme bleed
 * when navigating from a product page that sets inline vars.
 *
 * Must match :root defaults in index.css — update both if changed.
 */
export function useDefaultTheme() {
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--text-primary', 'hsl(20, 16%, 15%)');
    root.style.setProperty('--text-secondary', 'hsl(29, 13%, 37%)');
    root.style.setProperty('--surface-base', 'hsl(46, 64%, 89%)');
    root.style.removeProperty('--product-bg');
  }, []);
}
