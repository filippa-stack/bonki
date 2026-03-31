import { useEffect } from 'react';

export function usePageBackground(color: string) {
  useEffect(() => {
    document.documentElement.style.setProperty('--page-bg', color);
  }, [color]);
}
