import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RemoteCardCueProps {
  show: boolean;
  onDone: () => void;
}

/**
 * Subtle, non-blocking micro-cue shown when the partner changed the active card.
 * Auto-fades after 2 seconds. Cannot stack or loop.
 */
export default function RemoteCardCue({ show, onDone }: RemoteCardCueProps) {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(onDone, 2000);
    return () => clearTimeout(timer);
  }, [show, onDone]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          <div className="px-4 py-2 rounded-full bg-muted/90 backdrop-blur-sm text-muted-foreground text-xs font-medium shadow-sm">
            Din partner fortsatte – du är nu på samma kort.
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
