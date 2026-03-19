/**
 * SessionOneComplete — Session 1 completion + takeaway handoff.
 * Steps: initiator_takeaway → handoff_prompt → partner_takeaway → submitting
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '@/lib/stillUsTokens';
import { completeSession } from '@/lib/stillUsRpc';
import EmberGlowTextarea from './EmberGlowTextarea';
import LoadingCta from './LoadingCta';
import BreathingDot from './BreathingDot';

type Step = 'initiator_takeaway' | 'handoff_prompt' | 'partner_takeaway' | 'submitting';
type NavTarget = 'home' | 'session_2';

interface SessionOneCompleteProps {
  cardIndex?: number;
  slug: string;
  coupleId: string;
  cardId: string; // card_N format
  deviceId: string;
  partnerName: string;
}

export default function SessionOneComplete({
  slug,
  coupleId,
  cardId,
  deviceId,
  partnerName,
}: SessionOneCompleteProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('initiator_takeaway');
  const [initiatorTakeaway, setInitiatorTakeaway] = useState('');
  const [partnerTakeaway, setPartnerTakeaway] = useState('');
  const [navTarget, setNavTarget] = useState<NavTarget>('home');
  const [error, setError] = useState<string | null>(null);
  const [handoffReady, setHandoffReady] = useState(false);

  // Prevent back navigation
  useEffect(() => {
    const handler = () => {
      window.history.pushState(null, '', window.location.href);
    };
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  // 3-second delay for handoff CTA
  useEffect(() => {
    if (step !== 'handoff_prompt') return;
    setHandoffReady(false);
    const t = setTimeout(() => setHandoffReady(true), 3000);
    return () => clearTimeout(t);
  }, [step]);

  const advanceFromInitiator = (target: NavTarget) => {
    setNavTarget(target);
    setStep('handoff_prompt');
  };

  const submit = async (pTakeaway: string | null) => {
    setStep('submitting');
    setError(null);
    try {
      const res = await completeSession({
        couple_id: coupleId,
        card_id: cardId,
        session_number: 1,
        device_id: deviceId,
        session_type: 'program',
        session_1_takeaway: initiatorTakeaway.trim() || null,
        partner_takeaway: pTakeaway?.trim() || null,
      });

      if (res.status === 'error') {
        setError('Något gick fel. Försök igen.');
        return;
      }

      if (navTarget === 'session_2') {
        navigate(`/session/${slug}/session2-start`, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch {
      setError('Något gick fel. Försök igen.');
    }
  };

  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: COLORS.emberNight,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 32px',
      paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
    }}>
      <AnimatePresence mode="wait">
        {step === 'initiator_takeaway' && (
          <InitiatorTakeawayStep
            key="init"
            takeaway={initiatorTakeaway}
            onChange={setInitiatorTakeaway}
            onHome={() => advanceFromInitiator('home')}
            onSession2={() => advanceFromInitiator('session_2')}
          />
        )}

        {step === 'handoff_prompt' && (
          <HandoffStep
            key="handoff"
            partnerName={partnerName}
            ready={handoffReady}
            onHandoff={() => setStep('partner_takeaway')}
            onSkip={() => submit(null)}
          />
        )}

        {step === 'partner_takeaway' && (
          <PartnerTakeawayStep
            key="partner"
            partnerName={partnerName}
            takeaway={partnerTakeaway}
            onChange={setPartnerTakeaway}
            onDone={() => submit(partnerTakeaway)}
            onSkip={() => submit(null)}
          />
        )}

        {step === 'submitting' && (
          <SubmittingStep key="submit" error={error} onRetry={() => submit(partnerTakeaway)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Step Components ─────────────────────────────────────────

function InitiatorTakeawayStep({
  takeaway, onChange, onHome, onSession2,
}: {
  takeaway: string;
  onChange: (v: string) => void;
  onHome: () => void;
  onSession2: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ textAlign: 'center', maxWidth: 340, width: '100%' }}
    >
      <h2 style={{
        fontFamily: '"DM Serif Display", var(--font-serif)',
        fontSize: 24, fontWeight: 400,
        color: COLORS.deepSaffron, marginBottom: 24,
      }}>
        Ni har öppnat den här veckan.
      </h2>

      <p style={{
        fontFamily: 'var(--font-sans)', fontSize: 16,
        color: COLORS.lanternGlow, opacity: 0.7,
        lineHeight: 1.6, marginBottom: 32, maxWidth: 300, margin: '0 auto 32px',
      }}>
        Låt det ni pratat om sjunka in. Resten — en reflektion och ett scenario — väntar tills ni är redo.
      </p>

      <p style={{
        fontFamily: '"DM Serif Display", var(--font-serif)',
        fontSize: 18, fontWeight: 400,
        color: COLORS.lanternGlow, marginBottom: 12,
      }}>
        Något ni vill minnas från ikväll?
      </p>

      <EmberGlowTextarea
        value={takeaway}
        onChange={onChange}
        placeholder="Skriv här..."
        rows={3}
      />

      <p style={{
        fontFamily: 'var(--font-sans)', fontSize: 11,
        color: COLORS.driftwoodBody, fontStyle: 'italic',
        marginTop: 8, marginBottom: 32,
      }}>
        Inget ni skriver lämnar det här rummet.
      </p>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onHome}
        style={{
          width: '100%', height: 48, borderRadius: 12,
          backgroundColor: COLORS.deepSaffron, border: 'none',
          cursor: 'pointer', fontFamily: 'var(--font-sans)',
          fontSize: 16, fontWeight: 600, color: COLORS.lanternGlow,
          marginBottom: 12,
        }}
      >
        Tillbaka hem
      </motion.button>

      <button
        onClick={onSession2}
        style={{
          background: 'none', border: 'none',
          fontFamily: 'var(--font-sans)', fontSize: 14,
          color: COLORS.driftwood, cursor: 'pointer', padding: 8,
        }}
      >
        Fortsätt direkt till samtal 2
      </button>
    </motion.div>
  );
}

function HandoffStep({
  partnerName, ready, onHandoff, onSkip,
}: {
  partnerName: string;
  ready: boolean;
  onHandoff: () => void;
  onSkip: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ textAlign: 'center', maxWidth: 340, width: '100%' }}
    >
      <h2 style={{
        fontFamily: '"DM Serif Display", var(--font-serif)',
        fontSize: 22, fontWeight: 400,
        color: COLORS.lanternGlow, marginBottom: 16,
      }}>
        Vill {partnerName} också skriva något?
      </h2>

      <p style={{
        fontFamily: 'var(--font-sans)', fontSize: 16,
        color: COLORS.lanternGlow, opacity: 0.7,
        lineHeight: 1.6, marginBottom: 32,
      }}>
        Lämna över telefonen — eller hoppa över.
      </p>

      <div style={{ minHeight: 48, marginBottom: 12, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <AnimatePresence>
          {ready ? (
            <motion.button
              key="handoff-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              whileTap={{ scale: 0.98 }}
              onClick={onHandoff}
              style={{
                width: '100%', height: 48, borderRadius: 12,
                backgroundColor: COLORS.deepSaffron, border: 'none',
                cursor: 'pointer', fontFamily: 'var(--font-sans)',
                fontSize: 16, fontWeight: 600, color: COLORS.emberNight,
              }}
            >
              Lämna över
            </motion.button>
          ) : (
            <BreathingDot size={12} />
          )}
        </AnimatePresence>
      </div>

      <button
        onClick={onSkip}
        style={{
          background: 'none', border: 'none',
          fontFamily: 'var(--font-sans)', fontSize: 14,
          color: COLORS.driftwood, cursor: 'pointer', padding: 8,
        }}
      >
        Hoppa över
      </button>
    </motion.div>
  );
}

function PartnerTakeawayStep({
  partnerName, takeaway, onChange, onDone, onSkip,
}: {
  partnerName: string;
  takeaway: string;
  onChange: (v: string) => void;
  onDone: () => void;
  onSkip: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ textAlign: 'center', maxWidth: 340, width: '100%' }}
    >
      <p style={{
        fontFamily: 'var(--font-sans)', fontSize: 13,
        color: COLORS.driftwoodBody, marginBottom: 16,
      }}>
        {partnerName}
      </p>

      <p style={{
        fontFamily: '"DM Serif Display", var(--font-serif)',
        fontSize: 18, fontWeight: 400,
        color: COLORS.lanternGlow, marginBottom: 12,
      }}>
        Något du vill minnas från ikväll?
      </p>

      <EmberGlowTextarea
        value={takeaway}
        onChange={onChange}
        placeholder="Skriv här..."
        rows={3}
      />

      <p style={{
        fontFamily: 'var(--font-sans)', fontSize: 11,
        color: COLORS.driftwoodBody, fontStyle: 'italic',
        marginTop: 8, marginBottom: 32,
      }}>
        Inget ni skriver lämnar det här rummet.
      </p>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onDone}
        style={{
          width: '100%', height: 48, borderRadius: 12,
          backgroundColor: COLORS.deepSaffron, border: 'none',
          cursor: 'pointer', fontFamily: 'var(--font-sans)',
          fontSize: 16, fontWeight: 600, color: COLORS.emberNight,
          marginBottom: 12,
        }}
      >
        Klar
      </motion.button>

      <button
        onClick={onSkip}
        style={{
          background: 'none', border: 'none',
          fontFamily: 'var(--font-sans)', fontSize: 14,
          color: COLORS.driftwood, cursor: 'pointer', padding: 8,
        }}
      >
        Hoppa över
      </button>
    </motion.div>
  );
}

function SubmittingStep({ error, onRetry }: { error: string | null; onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ textAlign: 'center', maxWidth: 340, width: '100%' }}
    >
      {error ? (
        <>
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: 13,
            color: COLORS.deepSaffron, marginBottom: 16,
          }}>
            {error}
          </p>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onRetry}
            style={{
              width: '100%', height: 48, borderRadius: 12,
              backgroundColor: COLORS.deepSaffron, border: 'none',
              cursor: 'pointer', fontFamily: 'var(--font-sans)',
              fontSize: 16, fontWeight: 600, color: COLORS.emberNight,
            }}
          >
            Försök igen
          </motion.button>
        </>
      ) : (
        <motion.p
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            fontFamily: 'var(--font-sans)', fontSize: 16,
            fontWeight: 600, color: COLORS.lanternGlow,
          }}
        >
          Sparar...
        </motion.p>
      )}
    </motion.div>
  );
}
