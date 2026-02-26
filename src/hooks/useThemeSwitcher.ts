import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const VALID_THEMES = [
  'fired-earth',
  'burgundy',
  'ink',
  'stilla',
  'berry',
  'midnight',
  'light-header',
  'tonal-tiles',
  'dark-tiles',
] as const;

export type ThemeId = (typeof VALID_THEMES)[number] | null;

/**
 * Reads ?theme= from the URL and applies the corresponding CSS class
 * on <html>. Removes the class when no theme param is present.
 *
 * Returns the active theme id (or null for default).
 */
export function useThemeSwitcher(): ThemeId {
  const [params] = useSearchParams();
  const raw = params.get('theme');
  const theme: ThemeId = raw && VALID_THEMES.includes(raw as any) ? (raw as ThemeId) : null;

  useEffect(() => {
    const root = document.documentElement;
    // Remove all theme classes
    VALID_THEMES.forEach((t) => root.classList.remove(`theme-${t}`));
    // Apply active
    if (theme) {
      root.classList.add(`theme-${theme}`);
    }
    return () => {
      VALID_THEMES.forEach((t) => root.classList.remove(`theme-${t}`));
    };
  }, [theme]);

  return theme;
}

export { VALID_THEMES };
