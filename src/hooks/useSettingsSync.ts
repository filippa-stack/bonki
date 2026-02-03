import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Category, Card } from '@/types';
import type { Json } from '@/integrations/supabase/types';

const DEVICE_ID_KEY = 'vi-som-foraldrar-device-id';

function getDeviceId(): string | null {
  return localStorage.getItem(DEVICE_ID_KEY);
}

interface SettingsData {
  backgroundColor: string;
  categories: Category[];
  cards: Card[];
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseSettingsSyncReturn {
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
  saveError: string | null;
}

export function useSettingsSync(
  userId: string | null,
  settings: SettingsData,
  onSettingsLoaded: (settings: Partial<SettingsData>) => void
): UseSettingsSyncReturn {
  const isInitialized = useRef(false);
  const lastSavedSettings = useRef<string>('');
  const hasMigrated = useRef(false);
  
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Migrate data from old device_id records to user account
  const migrateDeviceData = useCallback(async (userId: string) => {
    if (hasMigrated.current) return;
    hasMigrated.current = true;

    const deviceId = getDeviceId();
    if (!deviceId) return;

    try {
      // Find records with this device_id that don't have a user_id yet
      const { data: deviceRecords, error: fetchError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('device_id', deviceId)
        .is('user_id', null);

      if (fetchError || !deviceRecords || deviceRecords.length === 0) {
        return;
      }

      // Get the most complete device record (most cards)
      const bestRecord = deviceRecords.reduce((best, current) => {
        const bestCards = Array.isArray(best.cards) ? best.cards.length : 0;
        const currentCards = Array.isArray(current.cards) ? current.cards.length : 0;
        return currentCards > bestCards ? current : best;
      }, deviceRecords[0]);

      // Check if user already has settings
      const { data: userRecord } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (userRecord) {
        // Merge: take the record with more data
        const userCards = Array.isArray(userRecord.cards) ? userRecord.cards.length : 0;
        const deviceCards = Array.isArray(bestRecord.cards) ? bestRecord.cards.length : 0;

        if (deviceCards > userCards) {
          // Device record has more data, update user record with it
          await supabase
            .from('user_settings')
            .update({
              background_color: bestRecord.background_color,
              categories: bestRecord.categories,
              cards: bestRecord.cards,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);
        }
      } else {
        // No user record yet, create one from device data
        await supabase
          .from('user_settings')
          .insert({
            user_id: userId,
            device_id: deviceId,
            background_color: bestRecord.background_color,
            categories: bestRecord.categories,
            cards: bestRecord.cards,
          });
      }

      // Clean up old device-only records
      await supabase
        .from('user_settings')
        .delete()
        .eq('device_id', deviceId)
        .is('user_id', null);

    } catch (err) {
      console.error('Failed to migrate device data:', err);
    }
  }, []);

  // Load settings from database on mount or when userId changes
  useEffect(() => {
    if (!userId) {
      isInitialized.current = false;
      return;
    }

    async function loadSettings() {
      try {
        // First migrate any existing device data
        await migrateDeviceData(userId);

        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', userId)
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
          
          // Mark as saved since we just loaded
          setLastSavedAt(new Date(data.updated_at));
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        isInitialized.current = true;
      }
    }

    loadSettings();
  }, [userId, onSettingsLoaded, migrateDeviceData]);

  // Save settings to database when they change
  useEffect(() => {
    if (!isInitialized.current || !userId) return;

    const settingsString = JSON.stringify({
      backgroundColor: settings.backgroundColor,
      categories: settings.categories,
      cards: settings.cards,
    });

    // Don't save if nothing changed
    if (settingsString === lastSavedSettings.current) return;

    // Show saving status immediately
    setSaveStatus('saving');
    setSaveError(null);

    const timeoutId = setTimeout(async () => {
      try {
        const deviceId = getDeviceId() || crypto.randomUUID();
        // Store device ID for future migrations if needed
        localStorage.setItem(DEVICE_ID_KEY, deviceId);

        let saveSuccessful = false;

        // Use upsert to handle both insert and update in one operation
        // This avoids race conditions and unique constraint violations
        const { error: upsertError } = await supabase
          .from('user_settings')
          .upsert({
            user_id: userId,
            device_id: deviceId,
            background_color: settings.backgroundColor || null,
            categories: JSON.parse(JSON.stringify(settings.categories)) as Json,
            cards: JSON.parse(JSON.stringify(settings.cards)) as Json,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id',
            ignoreDuplicates: false,
          });

        if (upsertError) {
          console.error('Error saving settings:', upsertError);
          setSaveStatus('error');
          setSaveError('Kunde inte spara ändringar');
        } else {
          saveSuccessful = true;
        }

        if (saveSuccessful) {
          lastSavedSettings.current = settingsString;
          setSaveStatus('saved');
          setLastSavedAt(new Date());
          setSaveError(null);
          
          // Reset to idle after 3 seconds
          setTimeout(() => {
            setSaveStatus('idle');
          }, 3000);
        }
      } catch (err) {
        console.error('Failed to save settings:', err);
        setSaveStatus('error');
        setSaveError('Kunde inte ansluta till servern');
      }
    }, 1000); // Debounce 1 second

    return () => clearTimeout(timeoutId);
  }, [userId, settings.backgroundColor, settings.categories, settings.cards]);

  return { saveStatus, lastSavedAt, saveError };
}
