import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface SiteSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroTitleColor: string;
  heroSubtitleColor: string;
  heroTitleFont: string;
  heroSubtitleFont: string;
  buttonColor: string;
  buttonTextColor: string;
  continueModuleBgColor: string;
  continueModuleTextColor: string;
  continueModuleBorderColor: string;
  noteBoxBgColor: string;
  noteBoxTextColor: string;
  noteBoxBorderColor: string;
  loginTitle: string;
  loginSubtitle: string;
}

interface SiteSettingsContextType {
  settings: SiteSettings;
  updateSettings: (updates: Partial<SiteSettings>) => void;
  loadSettings: (loadedSettings: SiteSettings) => void;
}

const defaultSettings: SiteSettings = {
  heroTitle: 'Still Us',
  heroSubtitle: 'Ert utrymme för samtal',
  heroTitleColor: '',
  heroSubtitleColor: '',
  heroTitleFont: 'serif',
  heroSubtitleFont: 'sans',
  buttonColor: 'hsl(0, 100%, 50%)',
  buttonTextColor: 'hsl(0, 0%, 100%)',
  continueModuleBgColor: '',
  continueModuleTextColor: '',
  continueModuleBorderColor: '',
  noteBoxBgColor: '',
  noteBoxTextColor: '',
  noteBoxBorderColor: '',
  loginTitle: 'Still Us',
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

  const updateSettings = useCallback((updates: Partial<SiteSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const loadSettings = useCallback((loadedSettings: SiteSettings) => {
    setSettings({ ...defaultSettings, ...loadedSettings });
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, updateSettings, loadSettings }}>
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
