import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const VALID_THEMES = [
  'fired-earth',
  'burgundy',
  'ink',
  'stilla',
  'berry',
  'midnight',
] as const;

const VALID_SURFACES = ['lift', 'sculpt'] as const;

export type ThemeId = (typeof VALID_THEMES)[number] | null;
export type SurfaceId = (typeof VALID_SURFACES)[number] | null;

/**
 * Reads ?theme= and ?surface= from the URL and applies CSS classes on <html>.
 */
export function useThemeSwitcher(): ThemeId {
  const [params] = useSearchParams();
  const raw = params.get('theme');
  const theme: ThemeId = raw && VALID_THEMES.includes(raw as any) ? (raw as ThemeId) : null;

  const rawSurface = params.get('surface');
  const surface: SurfaceId = rawSurface && VALID_SURFACES.includes(rawSurface as any) ? (rawSurface as SurfaceId) : null;

  useEffect(() => {
    const root = document.documentElement;
    VALID_THEMES.forEach((t) => root.classList.remove(`theme-${t}`));
    VALID_SURFACES.forEach((s) => root.classList.remove(`surface-${s}`));
    if (theme) root.classList.add(`theme-${theme}`);
    if (surface) root.classList.add(`surface-${surface}`);
    return () => {
      VALID_THEMES.forEach((t) => root.classList.remove(`theme-${t}`));
      VALID_SURFACES.forEach((s) => root.classList.remove(`surface-${s}`));
    };
  }, [theme, surface]);

  return theme;
}

export { VALID_THEMES, VALID_SURFACES };
