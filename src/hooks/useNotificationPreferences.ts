import { useState, useCallback } from 'react';

export interface NotificationPreferences {
  notifySharedReflection: boolean;
  notifyConversationProgress: boolean;
}

const STORAGE_KEY = 'stillus-notification-prefs';

const defaults: NotificationPreferences = {
  notifySharedReflection: true,
  notifyConversationProgress: false,
};

export function useNotificationPreferences() {
  const [prefs, setPrefs] = useState<NotificationPreferences>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
    } catch {
      return defaults;
    }
  });

  const updatePref = useCallback(<K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K],
  ) => {
    setPrefs(prev => {
      const next = { ...prev, [key]: value };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { prefs, updatePref };
}
