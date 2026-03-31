import { ReactNode, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EMBER_GLOW, DEEP_SAFFRON, DRIFTWOOD, BARK, MIDNIGHT_INK } from '@/lib/palette';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
} from '@/components/ui/alert-dialog';
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
          flex: '1 1 0',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          position: 'relative',
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '12px 16px',
        }}
      >
        {/* Illustration background — behind the white card */}
        {illustrationSrc && (
          <img
            src={illustrationSrc}
            alt=""
            style={{
              position: 'absolute',
              inset: '-32%',
              width: '164%',
              height: '164%',
              objectFit: 'contain',
              objectPosition: '50% 45%',
              opacity: 0.7,
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        )}

        {/* White question card — sizes to content */}
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
            borderRadius: '28px',
            padding: '24px 24px 24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            overflow: 'auto',
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

      {/* Exit dialog — Radix AlertDialog (no framer-motion flicker) */}
      <AlertDialog open={showExitDialog} onOpenChange={(open) => { if (!open) onExitDialogClose?.(); }}>
        <AlertDialogContent style={{ backgroundColor: EMBER_GLOW, borderRadius: '16px', border: 'none' }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '20px',
              color: BARK,
              textAlign: 'center',
            }}>
              Pausa samtalet?
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter style={{ flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
            <AlertDialogAction onClick={onExitConfirm} style={{
              backgroundColor: DEEP_SAFFRON,
              color: MIDNIGHT_INK,
              borderRadius: '12px',
              height: '48px',
            }}>
              Ja, pausa
            </AlertDialogAction>
            <AlertDialogCancel onClick={onExitDialogClose} style={{
              background: 'none',
              border: 'none',
              color: DRIFTWOOD,
              fontSize: '14px',
            }}>
              Fortsätt
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}