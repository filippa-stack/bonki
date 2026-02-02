import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Category, Card } from '@/types';
import type { Json } from '@/integrations/supabase/types';

const DEVICE_ID_KEY = 'vi-som-foraldrar-device-id';

function getOrCreateDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

interface SettingsData {
  backgroundColor: string;
  categories: Category[];
  cards: Card[];
}

export function useSettingsSync(
  settings: SettingsData,
  onSettingsLoaded: (settings: Partial<SettingsData>) => void
) {
  const deviceId = useRef(getOrCreateDeviceId());
  const isInitialized = useRef(false);
  const lastSavedSettings = useRef<string>('');

  // Load settings from database on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('device_id', deviceId.current)
          .maybeSingle();

        if (error) {
          console.error('Error loading settings:', error);
          return;
        }

        if (data) {
          const loadedSettings: Partial<SettingsData> = {};
          
          if (data.background_color) {
            loadedSettings.backgroundColor = data.background_color;
          }
          
          if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
            loadedSettings.categories = data.categories as unknown as Category[];
          }
          
          if (data.cards && Array.isArray(data.cards) && data.cards.length > 0) {
            loadedSettings.cards = data.cards as unknown as Card[];
          }

          if (Object.keys(loadedSettings).length > 0) {
            onSettingsLoaded(loadedSettings);
          }
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        isInitialized.current = true;
      }
    }

    loadSettings();
  }, [onSettingsLoaded]);

  // Save settings to database when they change
  useEffect(() => {
    if (!isInitialized.current) return;

    const settingsString = JSON.stringify({
      backgroundColor: settings.backgroundColor,
      categories: settings.categories,
      cards: settings.cards,
    });

    // Don't save if nothing changed
    if (settingsString === lastSavedSettings.current) return;

    const timeoutId = setTimeout(async () => {
      try {
        // Check if record exists
        const { data: existing } = await supabase
          .from('user_settings')
          .select('id')
          .eq('device_id', deviceId.current)
          .maybeSingle();

        if (existing) {
          // Update existing record
          const { error: updateError } = await supabase
            .from('user_settings')
            .update({
              background_color: settings.backgroundColor || null,
              categories: JSON.parse(JSON.stringify(settings.categories)) as Json,
              cards: JSON.parse(JSON.stringify(settings.cards)) as Json,
              updated_at: new Date().toISOString(),
            })
            .eq('device_id', deviceId.current);

          if (updateError) {
            console.error('Error updating settings:', updateError);
          } else {
            lastSavedSettings.current = settingsString;
          }
        } else {
          // Insert new record
          const { error: insertError } = await supabase
            .from('user_settings')
            .insert([{
              device_id: deviceId.current,
              background_color: settings.backgroundColor || null,
              categories: JSON.parse(JSON.stringify(settings.categories)) as Json,
              cards: JSON.parse(JSON.stringify(settings.cards)) as Json,
            }]);

          if (insertError) {
            console.error('Error inserting settings:', insertError);
          } else {
            lastSavedSettings.current = settingsString;
          }
        }
      } catch (err) {
        console.error('Failed to save settings:', err);
      }
    }, 1000); // Debounce 1 second

    return () => clearTimeout(timeoutId);
  }, [settings.backgroundColor, settings.categories, settings.cards]);
}
