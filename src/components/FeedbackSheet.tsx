/**
 * FeedbackSheet — Bottom sheet for post-card feedback (rating + optional comment).
 * Never blocks completion flow; all errors caught silently.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS } from '@/lib/stillUsTokens';
import { supabase } from '@/integrations/supabase/client';

// Still Us card completion feedback
interface StillUsFeedbackProps {
  coupleId: string;
  cardId: string;
  cardIndex: number;
  onDismiss: () => void;
  // Legacy props not used in this mode
  sessionId?: never;
  coupleSpaceId?: never;
  show?: never;
}

// Legacy feedback (used by CardView + CompletedSessionView)
interface LegacyFeedbackProps {
  sessionId: string;
  coupleSpaceId: string;
  show: boolean;
  onDismiss: () => void;
  // Still Us props not used in this mode
  coupleId?: never;
  cardId?: never;
  cardIndex?: never;
}

export type FeedbackSheetProps = StillUsFeedbackProps | LegacyFeedbackProps;

const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function FeedbackSheet(props: FeedbackSheetProps) {
  const { onDismiss } = props;

  // Legacy mode: render nothing if show is false
  if ('sessionId' in props && props.sessionId !== undefined) {
    if (!props.show) return null;
    // Legacy mode renders the same sheet UI but without card-specific fields
    return <FeedbackSheetInner coupleId={props.coupleSpaceId} cardId="" cardIndex={-1} onDismiss={props.onDismiss} />;
  }

  // Still Us mode
  const { coupleId, cardId, cardIndex } = props as StillUsFeedbackProps;
  return <FeedbackSheetInner coupleId={coupleId} cardId={cardId} cardIndex={cardIndex} onDismiss={onDismiss} />;
}

function FeedbackSheetInner({ coupleId, cardId, cardIndex, onDismiss }: { coupleId: string; cardId: string; cardIndex: number; onDismiss: () => void }) {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Focus trap + escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onDismiss();
        return;
      }
      if (e.key === 'Tab' && sheetRef.current) {
        const focusable = sheetRef.current.querySelectorAll<HTMLElement>(
          'button, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onDismiss]);

  useEffect(() => {
    sheetRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(async () => {
    if (rating === null) return;
    try {
      await supabase.from('still_us_feedback' as any).insert({
        couple_id: coupleId,
        card_id: cardId,
        card_index: cardIndex,
        rating,
        comment: comment || null,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Feedback save failed (table may not exist):', err);
    }
    setSubmitted(true);
    setTimeout(onDismiss, 1000);
  }, [rating, comment, coupleId, cardId, cardIndex, onDismiss]);

  const dur = prefersReduced ? 0.01 : undefined;

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: dur ?? 0.2 }}
        onClick={onDismiss}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 998,
          background: 'rgba(0, 0, 0, 0.5)',
        }}
      />

      <motion.div
        key="sheet"
        ref={sheetRef}
        tabIndex={-1}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'tween', duration: dur ?? 0.3, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 999,
          backgroundColor: COLORS.emberMid,
          borderRadius: '16px 16px 0 0',
          padding: '24px',
          paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
          maxHeight: '80vh',
          overflowY: 'auto',
          outline: 'none',
        }}
      >
        {submitted ? (
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '16px',
            color: COLORS.lanternGlow,
            textAlign: 'center',
            padding: '24px 0',
          }}>
            Tack!
          </p>
        ) : (
          <>
            <h2 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '20px',
              color: COLORS.lanternGlow,
              margin: '0 0 20px 0',
            }}>
              Hur var det?
            </h2>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              {[1, 2, 3, 4, 5].map((n) => {
                const filled = rating !== null && n <= rating;
                return (
                  <button
                    key={n}
                    role="button"
                    aria-label={`Betyg ${n} av 5`}
                    onClick={() => setRating(n)}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: filled ? COLORS.deepSaffron : COLORS.emberGlow,
                      color: filled ? '#FFFFFF' : COLORS.driftwood,
                      fontSize: '16px',
                      fontWeight: filled ? 700 : 400,
                      fontFamily: 'var(--font-sans)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    {n}
                  </button>
                );
              })}
            </div>

            {rating !== null && (
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Berätta mer (valfritt)..."
                style={{
                  width: '100%',
                  minHeight: '60px',
                  marginTop: '16px',
                  backgroundColor: COLORS.emberGlow,
                  color: COLORS.lanternGlow,
                  fontSize: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  padding: '12px',
                  fontFamily: 'var(--font-sans)',
                  resize: 'vertical',
                  outline: 'none',
                }}
              />
            )}

            <div style={{ marginTop: '20px' }}>
              <button
                onClick={handleSubmit}
                disabled={rating === null}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: COLORS.deepSaffron,
                  border: 'none',
                  cursor: rating === null ? 'default' : 'pointer',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  opacity: rating === null ? 0.5 : 1,
                  transition: 'opacity 0.15s ease',
                }}
              >
                Skicka
              </button>

              <button
                onClick={onDismiss}
                style={{
                  display: 'block',
                  width: '100%',
                  marginTop: '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: COLORS.driftwood,
                  fontSize: '13px',
                  fontFamily: 'var(--font-sans)',
                  textAlign: 'center',
                }}
              >
                Inte nu
              </button>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
