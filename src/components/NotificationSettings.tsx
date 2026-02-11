import { useTranslation } from 'react-i18next';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { Switch } from '@/components/ui/switch';
import { Bell } from 'lucide-react';

export default function NotificationSettings() {
  const { t } = useTranslation();
  const { prefs, updatePref } = useNotificationPreferences();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-3">
        <Bell className="w-4 h-4" />
        <p className="text-xs uppercase tracking-wider">
          {t('notifications.settings_title')}
        </p>
      </div>

      <div className="space-y-3">
        <label className="flex items-center justify-between gap-4 cursor-pointer">
          <div>
            <p className="text-sm text-foreground">
              {t('notifications.pref_shared_reflection')}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('notifications.pref_shared_reflection_hint')}
            </p>
          </div>
          <Switch
            checked={prefs.notifySharedReflection}
            onCheckedChange={(checked) => updatePref('notifySharedReflection', checked)}
          />
        </label>

        <label className="flex items-center justify-between gap-4 cursor-pointer">
          <div>
            <p className="text-sm text-foreground">
              {t('notifications.pref_conversation_progress')}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('notifications.pref_conversation_progress_hint')}
            </p>
          </div>
          <Switch
            checked={prefs.notifyConversationProgress}
            onCheckedChange={(checked) => updatePref('notifyConversationProgress', checked)}
          />
        </label>
      </div>
    </div>
  );
}
