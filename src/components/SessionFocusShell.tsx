import { ReactNode, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { EASE } from '@/lib/motion';
import { EMBER_GLOW, DEEP_SAFFRON, DRIFTWOOD, BARK, MIDNIGHT_INK } from '@/lib/palette';
import { sessionHeartbeat } from '@/lib/stillUsRpc';

interface SessionFocusShellProps {
  children: ReactNode;
  couple_id?: string;
  card_id?: string;
  device_id?: string;
  /** Top chrome slot (nav bar) */
  topSlot?: ReactNode;
  /** CTA at bottom — rendered by parent */
  ctaSlot: ReactNode;
  onExit: () => void;
  onPause?: () => void;
  showExitDialog?: boolean;
  onExitDialogClose?: () => void;
  onExitConfirm?: () => void;
  /** Product background color — fills full viewport */
  productBgColor?: string;
  /** Card illustration URL — shown behind the white question card */
  illustrationSrc?: string | null;
}

const HEARTBEAT_INTERVAL_MS = 60_000;

/**
 * Immersive shell for live sessions.
 * Product bg color, card illustration behind white question card.
 * Sends heartbeat every 60s to maintain session lock.
 */
export default function SessionFocusShell({
  children,
  couple_id,
  card_id,
  device_id,
  topSlot,
  ctaSlot,
  onExit,
  onPause,
  showExitDialog = false,
  onExitDialogClose,
  onExitConfirm,
  productBgColor,
  illustrationSrc,
}: SessionFocusShellProps) {
  const navigate = useNavigate();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const pausedRef = useRef(false);

  const bgColor = productBgColor || '#4B759B';

  // ── Heartbeat (only when all IDs provided) ──
  useEffect(() => {
    if (!couple_id || !card_id || !device_id) return;
    let timer: ReturnType<typeof setInterval>;

    const beat = async () => {
      if (pausedRef.current) return;
      try {
        const res = await sessionHeartbeat({ couple_id, card_id, device_id });
        if (res.status === 'taken_over') {
          setStatusMessage('Sessionen har flyttats till en annan enhet.');
          pausedRef.current = true;
          setTimeout(() => navigate('/'), 2500);
        } else if (res.status === 'migration_in_progress') {
          setStatusMessage('Er data uppdateras. Vänta en stund.');
          pausedRef.current = true;
        }
      } catch {
        // Silent fail — next heartbeat will retry
      }
    };

    beat();
    timer = setInterval(beat, HEARTBEAT_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [couple_id, card_id, device_id, navigate]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10,
        backgroundColor: bgColor,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: '100dvh',
      }}
    >
      {/* Status message overlay */}
      {statusMessage && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.7)',
          }}
        >
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '16px',
            color: EMBER_GLOW,
            textAlign: 'center',
            padding: '0 32px',
            lineHeight: 1.5,
          }}>
            {statusMessage}
          </p>
        </div>
      )}

      {/* Top chrome — nav bar */}
      {topSlot && (
        <div style={{ flex: '0 0 auto', zIndex: 30 }}>
          {topSlot}
        </div>
      )}

      {/* Main content area — illustration bg + white card */}
      <div
        style={{
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
          padding: '0 16px 12px',
        }}
      >
        {/* Illustration background — fills entire viewport behind the white card */}
        {illustrationSrc && (
          <img
            src={illustrationSrc}
            alt=""
            style={{
              position: 'absolute',
              inset: '-20%',
              width: '140%',
              height: '140%',
              objectFit: 'cover',
              objectPosition: '50% 50%',
              opacity: 0.7,
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        )}

        {/* White question card */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: '520px',
            flex: '0 0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FAF7F2',
            borderRadius: '38px',
            padding: '32px 28px 24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            overflow: 'hidden',
          }}
        >
          {children}
        </div>
      </div>

      {/* CTA zone */}
      <div
        style={{
          flex: '0 0 auto',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '8px 24px',
          paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {ctaSlot}
      </div>

      {/* Exit dialog — Ember Glow modal */}
      <AnimatePresence>
        {showExitDialog && (
          <motion.div
            key="exit-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [...EASE] }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
            onClick={onExitDialogClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [...EASE] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: EMBER_GLOW,
                borderRadius: '16px',
                padding: '32px 28px 24px',
                width: 'calc(100% - 48px)',
                maxWidth: '340px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px',
              }}
            >
              <p style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '20px',
                fontWeight: 600,
                color: BARK,
                textAlign: 'center',
              }}>
                Pausa samtalet?
              </p>

              <button
                onClick={onExitConfirm}
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: DEEP_SAFFRON,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: MIDNIGHT_INK,
                }}
              >
                Ja, pausa
              </button>

              <button
                onClick={onExitDialogClose}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '14px',
                  fontWeight: 400,
                  color: DRIFTWOOD,
                  padding: '4px 8px',
                }}
              >
                Fortsätt
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}