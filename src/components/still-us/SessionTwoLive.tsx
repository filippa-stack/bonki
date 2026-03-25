/**
 * SessionTwoLive — Session 2 conversation flow.
 *
 * Steps: vand_q2 → interstitial → tank_om → complete
 *
 * Structurally separate from SessionOneLive:
 * no threshold, no slider reveal, different step numbering,
 * Tänk om has a unique two-part layout.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE, EMOTION } from '@/lib/motion';
import { COLORS, cardIdFromSlug, cardIndexFromSlug } from '@/lib/stillUsTokens';
import { useCardImage } from '@/hooks/useCardImage';
import { getTankOmContent } from '@/data/tankOmContent';
import { completeSession } from '@/lib/stillUsRpc';
import { supabase } from '@/integrations/supabase/client';
import { enqueueWrite, hasPendingWrites, onSyncStatusChange } from '@/lib/offlineQueue';
import SessionFocusShell from '@/components/SessionFocusShell';
import { isDemoMode } from '@/lib/demoMode';
import { upsertDemoDiaryEntry } from '@/lib/demoDiary';

// ── Types ───────────────────────────────────────────────────

type Session2Step = 'vand_q2' | 'interstitial' | 'tank_om';

interface SessionTwoLiveProps {
  slug: string;
  coupleId: string;
  cardId: string; // card_N format
  cardIndex: number;
  cardTitle: string;
  deviceId: string;
  partnerTier: string;
  vandQuestion: string;
  vandAnchor?: string;
}

// ── Reduced motion helper ───────────────────────────────────
const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Emotional exit sub-component (avoids hooks-in-render) ───
function EmotionalExitOverlay({ onExit }: { onExit: () => void }) {
  const [showBackLink, setShowBackLink] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowBackLink(true), 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: COLORS.emberNight,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
      }}
    >
      <p style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: '20px',
        color: COLORS.lanternGlow,
        textAlign: 'center',
        maxWidth: '280px',
      }}>
        Det är okej att stanna. Ni bestämmer takten.
      </p>

      {!prefersReduced && (
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: COLORS.driftwood,
            marginTop: '24px',
          }}
        />
      )}

      {showBackLink && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          onClick={onExit}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: COLORS.driftwood,
            fontSize: '14px',
            fontFamily: 'var(--font-sans)',
            marginTop: '24px',
          }}
        >
          Tillbaka hem
        </motion.button>
      )}
    </motion.div>
  );
}

// ── Component ───────────────────────────────────────────────

export default function SessionTwoLive({
  slug,
  coupleId,
  cardId,
  cardIndex,
  cardTitle,
  deviceId,
  partnerTier,
  vandQuestion,
  vandAnchor,
}: SessionTwoLiveProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Session2Step>('vand_q2');
  const [vandNote, setVandNote] = useState('');
  const [tankOmNote, setTankOmNote] = useState('');
  const [showAnchor, setShowAnchor] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmotionalExit, setShowEmotionalExit] = useState(false);
  const [pendingSync, setPendingSync] = useState(false);
  const localNotesCache = useRef<Record<string, Record<string, string>>>({});
  const demoMode = isDemoMode();

  useEffect(() => {
    const cleanup = onSyncStatusChange(() => {
      setPendingSync(hasPendingWrites());
    });
    return cleanup;
  }, []);

  const isTier1 = partnerTier === 'tier_1';
  const tankOm = getTankOmContent(cardId);

  // ── Interstitial auto-advance ─────────────────────────────
  useEffect(() => {
    if (currentStep !== 'interstitial') return;
    const delay = prefersReduced ? 300 : 500;
    const t = setTimeout(() => setCurrentStep('tank_om'), delay);
    return () => clearTimeout(t);
  }, [currentStep]);

  // ── Note persistence helper ───────────────────────────────
  const saveNote = useCallback(
    (stepId: string, text: string) => {
      if (!text.trim()) return;

      if (demoMode) {
        upsertDemoDiaryEntry({
          productId: 'still_us',
          cardId: slug,
          text,
          entryKey: stepId,
          mode: 'append',
        });
      }

      const userId = supabase.auth.getSession().then(s => s.data.session?.user?.id);
      // Fire-and-forget: use cached user id synchronously if available
      const cachedUser = (supabase as any).auth?.['currentSession']?.user?.id;

      const doSave = (uid: string) => {
        const cacheKey = `${coupleId}:${cardId}:${uid}`;
        const prev = localNotesCache.current[cacheKey] ?? {};
        const merged = { ...prev, [stepId]: text.trim() };
        localNotesCache.current[cacheKey] = merged;

        enqueueWrite({
          table: 'user_card_state',
          operation: 'upsert',
          match: {},
          data: {
            couple_id: coupleId,
            card_id: cardId,
            user_id: uid,
            notes: merged,
          },
        });
      };

      // Try sync path first, fall back to async
      supabase.auth.getUser().then(({ data }) => {
        const uid = data.user?.id;
        if (uid) doSave(uid);
      });
    },
    [coupleId, cardId, demoMode, slug]
  );

  // ── Pause handler ─────────────────────────────────────────
  const handlePause = useCallback(
    () => {
      navigate('/product/still-us', { replace: true });
    },
    [navigate]
  );

  // ── Vänd Q2 next handler ──────────────────────────────────
  const handleVandNext = useCallback(() => {
    saveNote('session2_vand', vandNote);
    setCurrentStep('interstitial');
  }, [vandNote, saveNote]);

  // ── Complete handler ──────────────────────────────────────
  const handleComplete = useCallback(async () => {
    setSubmitting(true);
    setError(null);

    // Fire-and-forget note save — never blocks navigation
    saveNote('session2_tank_om', tankOmNote);

    const result = await completeSession({
      couple_id: coupleId,
      card_id: cardId,
      session_number: 2,
      device_id: deviceId,
      session_type: 'program',
    });

    if (result.status === 'error') {
      setError('Något gick fel. Försök igen.');
      setSubmitting(false);
      return;
    }

    if (cardIndex === 21) {
      navigate('/ceremony', { replace: true });
    } else {
      navigate(`/session/${slug}/complete`, { replace: true });
    }
  }, [coupleId, cardId, deviceId, slug, cardIndex, tankOmNote, saveNote, navigate]);

  // ── Step nav bar ──────────────────────────────────────────
  const renderStepNav = () => {
    const isVand = currentStep === 'vand_q2';
    const isTankOm = currentStep === 'tank_om';

    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
      }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span style={{
            fontSize: '13px',
            fontFamily: 'Arial, sans-serif',
            fontWeight: isVand ? 700 : 400,
            color: isVand ? COLORS.lanternGlow : COLORS.driftwood,
          }}>
            3. Vänd
          </span>
          <span style={{
            fontSize: '13px',
            fontFamily: 'Arial, sans-serif',
            fontWeight: isTankOm ? 700 : 400,
            color: isTankOm ? COLORS.lanternGlow : COLORS.driftwood,
          }}>
            4. Tänk om
          </span>
        </div>
        <span style={{
          fontSize: '11px',
          color: COLORS.driftwood,
          fontFamily: 'Arial, sans-serif',
        }}>
          Samtal 2 av 2
        </span>
      </div>
    );
  };

  // ── Exit links ────────────────────────────────────────────
  const renderExitLinks = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      marginTop: '24px',
    }}>
      <button
        onClick={handlePause}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: COLORS.driftwood,
          fontSize: '13px',
          fontFamily: 'var(--font-sans)',
        }}
      >
        Pausa för idag
      </button>
      <button
        onClick={() => setShowEmotionalExit(true)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: COLORS.driftwood,
          fontSize: '13px',
          fontFamily: 'var(--font-sans)',
        }}
      >
        Vi behöver stanna här
      </button>
    </div>
  );

  // ── Vänd Q2 step ──────────────────────────────────────────
  const renderVandQ2 = () => (
    <motion.div
      key="vand_q2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: prefersReduced ? 0 : 0.3 }}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div style={{ maxWidth: '300px', width: '100%', textAlign: 'center' }}>
        <p style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: '26px',
          color: COLORS.lanternGlow,
          lineHeight: 1.3,
          margin: 0,
        }}>
          {vandQuestion}
        </p>

        {vandAnchor && (
          <div style={{ marginTop: '24px' }}>
            <button
              onClick={() => setShowAnchor(!showAnchor)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: COLORS.driftwood,
                fontSize: '13px',
                fontFamily: 'var(--font-sans)',
                fontStyle: 'italic',
              }}
            >
              {showAnchor ? 'Dölj' : 'Behöver ni hjälp?'}
            </button>
            {showAnchor && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.2 }}
                style={{
                  color: COLORS.driftwood,
                  fontSize: '14px',
                  fontStyle: 'italic',
                  marginTop: '8px',
                  lineHeight: 1.5,
                }}
              >
                {vandAnchor}
              </motion.p>
            )}
          </div>
        )}

        {!isTier1 && (
          <div style={{ marginTop: '24px' }}>
            <textarea
              value={vandNote}
              onChange={(e) => setVandNote(e.target.value)}
              placeholder="Fäst en tanke..."
              style={{
                width: '100%',
                minHeight: '60px',
                backgroundColor: COLORS.emberGlow,
                color: COLORS.lanternGlow,
                fontSize: '14px',
                borderRadius: '12px',
                border: 'none',
                padding: '12px 16px',
                fontFamily: 'var(--font-sans)',
                resize: 'vertical',
              }}
            />
          </div>
        )}

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleVandNext}
          style={{
            marginTop: '24px',
            width: '100%',
            maxWidth: '320px',
            height: '52px',
            borderRadius: '12px',
            backgroundColor: COLORS.deepSaffron,
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            fontSize: '16px',
            fontWeight: 600,
            color: '#FFFFFF',
          }}
        >
          Nästa
        </motion.button>

        {renderExitLinks()}
      </div>
    </motion.div>
  );

  // ── Stage interstitial ────────────────────────────────────
  const renderInterstitial = () => (
    <motion.div
      key="interstitial"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: prefersReduced ? 0 : 0.3 }}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <p style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: '28px',
        color: COLORS.lanternGlow,
        textAlign: 'center',
        margin: 0,
      }}>
        Tänk om
      </p>
      <p style={{
        fontSize: '16px',
        color: `${COLORS.lanternGlow}99`,
        textAlign: 'center',
        marginTop: '8px',
      }}>
        Nu tänker vi "om".
      </p>
    </motion.div>
  );

  // ── Tänk om step ──────────────────────────────────────────
  const renderTankOm = () => (
    <motion.div
      key="tank_om"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: prefersReduced ? 0 : 0.3 }}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div style={{ maxWidth: '300px', width: '100%', textAlign: 'center' }}>
        <p style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: '18px',
          color: `${COLORS.lanternGlow}CC`,
          lineHeight: 1.4,
          margin: 0,
        }}>
          {tankOm?.scenario ?? '[Scenario saknas]'}
        </p>

        <p style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: '26px',
          color: COLORS.lanternGlow,
          lineHeight: 1.3,
          marginTop: '32px',
        }}>
          {tankOm?.question ?? '[Fråga saknas]'}
        </p>

        {!isTier1 && (
          <div style={{ marginTop: '24px' }}>
            <textarea
              value={tankOmNote}
              onChange={(e) => setTankOmNote(e.target.value)}
              placeholder="Fäst en tanke..."
              style={{
                width: '100%',
                minHeight: '60px',
                backgroundColor: COLORS.emberGlow,
                color: COLORS.lanternGlow,
                fontSize: '14px',
                borderRadius: '12px',
                border: 'none',
                padding: '12px 16px',
                fontFamily: 'var(--font-sans)',
                resize: 'vertical',
              }}
            />
          </div>
        )}

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleComplete}
          disabled={submitting}
          style={{
            marginTop: '24px',
            width: '100%',
            maxWidth: '320px',
            height: '52px',
            borderRadius: '12px',
            backgroundColor: COLORS.deepSaffron,
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            fontSize: '16px',
            fontWeight: 600,
            color: '#FFFFFF',
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? 'Sparar...' : 'Avsluta veckans samtal'}
        </motion.button>

        {error && (
          <p style={{
            color: COLORS.deepSaffron,
            fontSize: '13px',
            marginTop: '8px',
          }}>
            {error}
          </p>
        )}

        {renderExitLinks()}
      </div>
    </motion.div>
  );

  // ── Main render ───────────────────────────────────────────
  const showNav = currentStep === 'vand_q2' || currentStep === 'tank_om';

  return (
    <SessionFocusShell
      couple_id={coupleId}
      card_id={cardId}
      device_id={deviceId}
      topSlot={showNav ? renderStepNav() : undefined}
      ctaSlot={<></>}
      onExit={() => navigate('/product/still-us', { replace: true })}
    >
      {showEmotionalExit && (
        <EmotionalExitOverlay onExit={handlePause} />
      )}

      <AnimatePresence mode="wait">
        {currentStep === 'vand_q2' && renderVandQ2()}
        {currentStep === 'interstitial' && renderInterstitial()}
        {currentStep === 'tank_om' && renderTankOm()}
      </AnimatePresence>

      {pendingSync && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            textAlign: 'center',
            fontSize: '12px',
            color: COLORS.driftwood,
            padding: '8px 0',
            fontFamily: 'var(--font-sans)',
          }}
        >
          Dina anteckningar sparas snart.
        </motion.p>
      )}
    </SessionFocusShell>
  );
}
