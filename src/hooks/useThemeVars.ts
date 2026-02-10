import { useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

/**
 * Syncs dynamic user-customizable values to CSS custom properties on :root.
 * This allows all components to reference these as var(--name) in CSS
 * without inline styles.
 *
 * Must be called once inside the AppProvider tree (e.g. in Index/Home).
 */
export function useThemeVars() {
  const { backgroundColor } = useApp();
  const { settings } = useSiteSettings();

  useEffect(() => {
    const root = document.documentElement;

    // Page background
    setOrRemove(root, '--page-bg', backgroundColor);

    // Hero typography colors
    setOrRemove(root, '--hero-title-color', settings.heroTitleColor);
    setOrRemove(root, '--hero-subtitle-color', settings.heroSubtitleColor);

    // Button colors
    setOrRemove(root, '--btn-primary-bg', settings.buttonColor);
    setOrRemove(root, '--btn-primary-text', settings.buttonTextColor);
  }, [
    backgroundColor,
    settings.heroTitleColor,
    settings.heroSubtitleColor,
    settings.buttonColor,
    settings.buttonTextColor,
  ]);
}

function setOrRemove(el: HTMLElement, prop: string, value: string | undefined | null) {
  if (value) {
    el.style.setProperty(prop, value);
  } else {
    el.style.removeProperty(prop);
  }
}
