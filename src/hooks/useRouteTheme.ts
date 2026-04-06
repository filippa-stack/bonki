import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { allProducts, getProductForCard } from '@/data/products';

const DEEP_DUSK = '#0B1026';
const MIDNIGHT_INK = '#1A1A2E';

interface ThemeVars {
  surfaceBase: string;
  pageBg: string;
}

function resolveThemeFromPath(pathname: string): ThemeVars {
  const dark: ThemeVars = { surfaceBase: DEEP_DUSK, pageBg: DEEP_DUSK };

  const productMatch = pathname.match(/^\/product\/([^/]+)/);
  if (productMatch) {
    const product = allProducts.find(p => p.slug === productMatch[1]);
    if (product?.backgroundColor) {
      return { surfaceBase: product.backgroundColor, pageBg: product.backgroundColor };
    }
    return dark;
  }

  const cardMatch = pathname.match(/^\/card\/([^/?]+)/);
  if (cardMatch) {
    const product = getProductForCard(cardMatch[1]);
    if (product?.backgroundColor) {
      return { surfaceBase: product.backgroundColor, pageBg: product.backgroundColor };
    }
    return dark;
  }

  if (pathname.startsWith('/shared') || pathname.startsWith('/diary')) {
    return { surfaceBase: MIDNIGHT_INK, pageBg: MIDNIGHT_INK };
  }

  return dark;
}

/**
 * Sets background CSS variables via useLayoutEffect — before the browser paints.
 * Eliminates the one-frame flicker caused by useEffect-based hooks.
 * Call in AppRoutes (inside BrowserRouter, no provider needed).
 */
export function useRouteTheme(): void {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    const theme = resolveThemeFromPath(pathname);
    const root = document.documentElement;

    root.style.setProperty('--surface-base', theme.surfaceBase);
    root.style.setProperty('--page-bg', theme.pageBg);
    root.style.setProperty('--color-bg', theme.surfaceBase);
    root.style.setProperty('--color-bg-base', theme.surfaceBase);
    document.body.style.backgroundColor = theme.surfaceBase;
  }, [pathname]);
}
