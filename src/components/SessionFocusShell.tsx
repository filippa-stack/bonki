import { useState, useEffect, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { EMOTION, EASE } from '@/lib/motion';

interface SessionFocusShellProps {
  children: ReactNode;
  /** Heritage Gold CTA at bottom — rendered by parent, wrapped with delayed reveal */
  ctaSlot: ReactNode;
  onExit: () => void;
}

/**
 * Immersive shell for Still Us live sessions.
 * - Full-screen verdigris canvas with slow breathing opacity
 * - No chrome — tap screen once to reveal a close X
 * - CTA fades in after 5-second reflection delay
 */
export default function SessionFocusShell({ children, ctaSlot, onExit }: SessionFocusShellProps) {
  const [showExit, setShowExit] = useState(false);
  const [showCta, setShowCta] = useState(false);
  const exitTimerRef = useState<ReturnType<typeof setTimeout> | null>(null);

  // 5-second delay before CTA appears
  useEffect(() => {
    setShowCta(false);
    const timer = setTimeout(() => setShowCta(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Tap anywhere to toggle exit button (auto-hide after 3s)
  const handleTap = useCallback(() => {
    if (showExit) {
      setShowExit(false);
      return;
    }
    setShowExit(true);
    const timer = setTimeout(() => setShowExit(false), 3000);
    if (exitTimerRef[0]) clearTimeout(exitTimerRef[0]);
    exitTimerRef[0] = timer;
  }, [showExit]);

  return (
    <div
      onClick={handleTap}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10,
        backgroundColor: 'var(--surface-base)',
        animation: 'session-focus-breathe 8s ease-in-out infinite',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Grain + light-leak from VerdigrisAtmosphere still active on body */}

      {/* Close X — appears on tap */}
      <AnimatePresence>
        {showExit && (
          <motion.button
            key="exit-x"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, ease: [...EASE] }}
            onClick={(e) => {
              e.stopPropagation();
              onExit();
            }}
            aria-label="Stäng"
            style={{
              position: 'absolute',
              top: 'calc(16px + env(safe-area-inset-top, 0px))',
              right: '16px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              zIndex: 20,
            }}
          >
            <X
              size={18}
              style={{
                color: 'var(--text-tertiary)',
                opacity: 0.5,
              }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Centered question content */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '520px',
          padding: '0 32px',
        }}
      >
        {children}
      </div>

      {/* CTA zone — fades in after 5s delay */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          flex: '0 0 auto',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingBottom: 'calc(40px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <AnimatePresence>
          {showCta && (
            <motion.div
              key="cta-reveal"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: EMOTION * 2, ease: [...EASE] }}
            >
              {ctaSlot}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
