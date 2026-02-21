import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RemoteCardCueProps {
  show: boolean;
  onDone: () => void;
}

/**
 * Subtle, non-blocking micro-cue shown when the partner changed the active card.
 * Auto-fades after 2 seconds. Cannot stack, loop, or re-trigger for the same event.
 */
export default function RemoteCardCue({ show, onDone }: RemoteCardCueProps) {
  const [visible, setVisible] = useState(false);
  const hasShownRef = useRef(false);

  useEffect(() => {
    if (!show) {
      hasShownRef.current = false;
      return;
    }
    // Prevent re-trigger for the same show=true cycle
    if (hasShownRef.current) return;
    hasShownRef.current = true;
    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);
      // Allow exit animation to finish before calling onDone
      setTimeout(onDone, 350);
    }, 2000);
    return () => clearTimeout(timer);
  }, [show, onDone]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.95 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed top-16 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
        >
          <div className="px-4 py-1.5 rounded-full bg-muted/80 backdrop-blur-sm text-muted-foreground text-[11px] tracking-wide">
            Din partner fortsatte – ni är på samma kort
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
