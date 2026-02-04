import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SiteSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroTitleColor: string;
  heroSubtitleColor: string;
  loginTitle: string;
  loginSubtitle: string;
}

interface SiteSettingsContextType {
  settings: SiteSettings;
  updateSettings: (updates: Partial<SiteSettings>) => void;
}

const defaultSettings: SiteSettings = {
  heroTitle: 'Vi som föräldrar',
  heroSubtitle: 'A space for reflection',
  heroTitleColor: '',
  heroSubtitleColor: '',
  loginTitle: 'Vi som föräldrar',
  loginSubtitle: 'Logga in för att spara dina inställningar',
};

const STORAGE_KEY = 'bonki-site-settings';

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates: Partial<SiteSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  return (
    <SiteSettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (context === undefined) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
}
