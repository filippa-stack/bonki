import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { CloudOff, Loader2 } from 'lucide-react';
import type { SaveStatus } from '@/hooks/useSettingsSync';

interface SaveIndicatorProps {
  status: SaveStatus;
  error?: string | null;
  lastSavedAt?: Date | null;
}

const SLOW_SYNC_THRESHOLD_MS = 3000;

export default function SaveIndicator({ status, error }: SaveIndicatorProps) {
  const { t } = useTranslation();
  const [showSaving, setShowSaving] = useState(false);

  // Only show the "Saving…" indicator if saving takes longer than 3 seconds
  useEffect(() => {
    if (status === 'saving') {
      const timer = setTimeout(() => setShowSaving(true), SLOW_SYNC_THRESHOLD_MS);
      return () => {
        clearTimeout(timer);
        setShowSaving(false);
      };
    }
    setShowSaving(false);
  }, [status]);

  return (
    <AnimatePresence mode="wait">
      {status === 'saving' && showSaving && (
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
    </AnimatePresence>
  );
}
