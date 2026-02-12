import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Cloud, CloudOff, Check, Loader2 } from 'lucide-react';
import type { SaveStatus } from '@/hooks/useSettingsSync';

interface SaveIndicatorProps {
  status: SaveStatus;
  error?: string | null;
  lastSavedAt?: Date | null;
}

export default function SaveIndicator({ status, error, lastSavedAt }: SaveIndicatorProps) {
  const { t } = useTranslation();

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AnimatePresence mode="wait">
      {status === 'saving' && (
        <motion.div
          key="saving"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center gap-1.5 text-muted-foreground"
        >
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span className="text-xs">{t('save_indicator.saving')}</span>
        </motion.div>
      )}

      {status === 'saved' && (
        <motion.div
          key="saved"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center gap-1.5 text-primary"
        >
          <Check className="w-3.5 h-3.5" />
          <span className="text-xs">{t('save_indicator.saved')}</span>
        </motion.div>
      )}

      {status === 'error' && (
        <motion.div
          key="error"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center gap-1.5 text-destructive"
        >
          <CloudOff className="w-3.5 h-3.5" />
          <span className="text-xs">{error || t('save_indicator.error_save')}</span>
        </motion.div>
      )}

      {status === 'idle' && lastSavedAt && (
        <motion.div
          key="idle"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center gap-1.5 text-muted-foreground"
        >
          <Cloud className="w-3.5 h-3.5" />
          <span className="text-xs">{t('save_indicator.synced', { time: formatTime(lastSavedAt) })}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
