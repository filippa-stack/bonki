import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import type { SharedSyncStatus } from '@/hooks/useSharedProgress';

interface SyncStatusProps {
  status: SharedSyncStatus;
  error: string | null;
  onRetry?: () => void;
}

const VISIBLE_DELAY_MS = 300;

export default function SyncStatus({ status, error, onRetry }: SyncStatusProps) {
  const [showSyncing, setShowSyncing] = useState(false);

  // Only show syncing indicator after 300ms to avoid flicker
  useEffect(() => {
    if (status === 'syncing') {
      const timer = setTimeout(() => setShowSyncing(true), VISIBLE_DELAY_MS);
      return () => {
        clearTimeout(timer);
        setShowSyncing(false);
      };
    }
    setShowSyncing(false);
  }, [status]);

  const showNothing = status === 'idle' || (status === 'syncing' && !showSyncing);

  return (
    <AnimatePresence mode="wait">
      {status === 'syncing' && showSyncing && (
        <motion.div
          key="syncing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-1.5 text-muted-foreground"
        >
          <Loader2 className="w-3 h-3 animate-spin" />
          <span className="text-[11px]">Uppdaterar…</span>
        </motion.div>
      )}

      {status === 'error' && (
        <motion.div
          key="error"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-1.5 text-destructive"
        >
          <AlertCircle className="w-3 h-3" />
          <span className="text-[11px]">Kunde inte spara.</span>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-[11px] underline underline-offset-2 hover:text-destructive/80 transition-colors"
            >
              Försök igen
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
