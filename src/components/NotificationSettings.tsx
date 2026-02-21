import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { ChevronDown } from 'lucide-react';

export default function NotificationSettings() {
  const { t } = useTranslation();
  const { prefs, loading, updatePref } = useNotificationPreferences();
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full gap-2 cursor-pointer h-[48px]"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        <p className="text-xs uppercase tracking-wider">Notiser</p>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="space-y-4 mt-2 pb-2">
          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <div>
              <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                {t('notifications.pref_shared_reflection')}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                {t('notifications.pref_shared_reflection_hint')}
              </p>
            </div>
            {/* Minimal text toggle */}
            <button
              disabled={loading}
              onClick={() => updatePref('notifySharedReflection', !prefs.notifySharedReflection)}
              className="text-xs font-medium transition-opacity hover:opacity-70 shrink-0"
              style={{ color: prefs.notifySharedReflection ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', opacity: prefs.notifySharedReflection ? 1 : 0.5 }}
            >
              {prefs.notifySharedReflection ? 'På' : 'Av'}
            </button>
          </label>

          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <div>
              <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                {t('notifications.pref_conversation_progress')}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                {t('notifications.pref_conversation_progress_hint')}
              </p>
            </div>
            <button
              disabled={loading}
              onClick={() => updatePref('notifyConversationProgress', !prefs.notifyConversationProgress)}
              className="text-xs font-medium transition-opacity hover:opacity-70 shrink-0"
              style={{ color: prefs.notifyConversationProgress ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', opacity: prefs.notifyConversationProgress ? 1 : 0.5 }}
            >
              {prefs.notifyConversationProgress ? 'På' : 'Av'}
            </button>
          </label>
        </div>
      )}
    </div>
  );
}
