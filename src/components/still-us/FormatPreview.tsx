/**
 * FormatPreview — Post-first-slider onboarding (3 swipeable slides).
 * Explains the 3-touch weekly rhythm to new users.
 * Shown once after the first-ever slider completion.
 *
 * Route: /format-preview
 * Background: Ember Night (#2E2233)
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { COLORS } from '@/lib/stillUsTokens';

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const SWIPE_THRESHOLD = 40;

interface FormatPreviewProps {
  /** Whether a partner is already linked */
  hasPartner?: boolean;
  onComplete?: () => void;
}

export default function FormatPreview({ hasPartner = false, onComplete }: FormatPreviewProps) {
  const navigate = useNavigate();
  const [slideIndex, setSlideIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const isLast = slideIndex === 2;

  // Mark format preview as seen (server-side, fire-and-forget)
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('onboarding_events').insert({
        user_id: user.id,
        event_type: 'format_preview_seen',
      });
    })();
  }, []);

  const goNext = useCallback(() => {
    if (slideIndex < 2) setSlideIndex((i) => i + 1);
  }, [slideIndex]);

  const goPrev = useCallback(() => {
    if (slideIndex > 0) setSlideIndex((i) => i - 1);
  }, [slideIndex]);

  const handleComplete = useCallback(() => {
    if (onComplete) {
      onComplete();
    } else if (hasPartner) {
      navigate('/');
    } else {
      navigate('/share');
    }
  }, [onComplete, hasPartner, navigate]);

  // Touch handlers for swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };
  const onTouchEnd = () => {
    if (touchDeltaX.current < -SWIPE_THRESHOLD) goNext();
    else if (touchDeltaX.current > SWIPE_THRESHOLD) goPrev();
    touchDeltaX.current = 0;
  };

  const animVariants = REDUCED
    ? { initial: {}, animate: {}, exit: {} }
    : {
        initial: { opacity: 0, x: 40 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -40 },
      };

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        height: '100dvh',
        backgroundColor: COLORS.emberNight,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 32px',
        paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
        overflow: 'hidden',
        userSelect: 'none',
        touchAction: 'pan-y',
      }}
    >
      {/* Slide content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <AnimatePresence mode="wait">
          {slideIndex === 0 && (
            <motion.div
              key="s0"
              {...animVariants}
              transition={{ duration: 0.35 }}
              style={{ textAlign: 'center', maxWidth: '320px' }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '24px',
                  fontWeight: 600,
                  color: COLORS.deepSaffron,
                  lineHeight: 1.3,
                  margin: '0 0 16px',
                }}
              >
                Klart! Du har gjort din första check-in.
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '16px',
                  color: COLORS.lanternGlow,
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Varje vecka börjar så här — med en snabb check-in.
              </p>
            </motion.div>
          )}

          {slideIndex === 1 && (
            <motion.div
              key="s1"
              {...animVariants}
              transition={{ duration: 0.35 }}
              style={{ textAlign: 'center', maxWidth: '320px' }}
            >
              {/* Session illustration placeholder */}
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: `${COLORS.emberGlow}`,
                  margin: '0 auto 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                }}
              >
                💬
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '16px',
                  color: COLORS.lanternGlow,
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Sen pratar ni — två korta samtal.
              </p>
            </motion.div>
          )}

          {slideIndex === 2 && (
            <motion.div
              key="s2"
              {...animVariants}
              transition={{ duration: 0.35 }}
              style={{ textAlign: 'center', maxWidth: '340px' }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '14px',
                  fontWeight: 600,
                  letterSpacing: '1.2px',
                  textTransform: 'uppercase',
                  color: COLORS.deepSaffron,
                  margin: '0 0 28px',
                }}
              >
                Hur en vecka ser ut:
              </p>

              {/* Three circles with dotted connectors */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0',
                  margin: '0 0 12px',
                }}
              >
                <StepCircle label="Check-in" />
                <DottedLine />
                <StepCircle label="Samtal 1" />
                <DottedLine />
                <StepCircle label="Samtal 2" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pagination dots */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            onClick={() => setSlideIndex(i)}
            aria-label={`Slide ${i + 1}`}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: i === slideIndex ? COLORS.deepSaffron : `${COLORS.emberGlow}40`,
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
          />
        ))}
      </div>

      {/* CTA — only on last slide */}
      {isLast ? (
        <button
          onClick={handleComplete}
          style={{
            width: '100%',
            maxWidth: '320px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: COLORS.bonkiOrange,
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            fontSize: '16px',
            fontWeight: 600,
            color: COLORS.emberNight,
            transition: 'transform 140ms ease',
          }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          Fortsätt
        </button>
      ) : (
        /* Tap-to-advance hint on non-final slides */
        <button
          onClick={goNext}
          style={{
            background: 'none',
            border: 'none',
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            color: COLORS.driftwood,
            cursor: 'pointer',
            padding: '12px 24px',
          }}
        >
          Svep eller tryck →
        </button>
      )}
    </div>
  );
}

/* ── Sub-components ── */

function StepCircle({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          border: `2px solid ${COLORS.deepSaffron}`,
          backgroundColor: `${COLORS.deepSaffron}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />
      <span
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '12px',
          fontWeight: 500,
          color: COLORS.lanternGlow,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    </div>
  );
}

function DottedLine() {
  return (
    <div
      style={{
        width: '32px',
        height: '2px',
        borderBottom: `2px dotted ${COLORS.driftwood}50`,
        marginBottom: '28px',
      }}
    />
  );
}
