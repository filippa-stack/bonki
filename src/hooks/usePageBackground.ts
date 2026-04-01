import { useLayoutEffect } from 'react';

export function usePageBackground(color: string) {
  useLayoutEffect(() => {
    document.documentElement.style.setProperty('--page-bg', color);
  }, [color]);
}
