/**
 * SessionOneLive — Session 1 full flow.
 *
 * Internal step state machine:
 *   threshold → framing → reveal → oppna_q1 → oppna_q2 → stage_interstitial → vand_q1 → complete
 *
 * Prompt 3.2: threshold, framing, reveal
 * Prompt 3.3: oppna_q1, oppna_q2, stage_interstitial, vand_q1, complete
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE, EMOTION } from '@/lib/motion';
import { COLORS, cardIndexFromSlug, cardIdFromSlug } from '@/lib/stillUsTokens';
import { getSliderSetBySlug } from '@/data/sliderPrompts';
import { getThresholdFraming, MOOD_OPTIONS, type ThresholdMood } from '@/data/thresholdFramings';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import SessionFocusShell from '@/components/SessionFocusShell';
import SliderReveal from '@/components/still-us/SliderReveal';

// ── Types ───────────────────────────────────────────────────

type Step =
  | 'threshold'
  | 'framing'
  | 'reveal'
  | 'oppna_q1'
  | 'oppna_q2'
  | 'stage_interstitial'
  | 'vand_q1'
  | 'emotional_pause'
  | 'complete';

export interface SessionQuestion {
  text: string;
  anchor?: string;
}

interface CoupleStateRow {
  couple_id: string;
  initiator_id: string;
  partner_id: string | null;
  partner_tier: string;
  tier_2_partner_name: string | null;
  tier_2_pseudo_id: string | null;
  current_card_index: number;
  cycle_id: number;
}

// ── Placeholder question data (content team will provide finals) ──
function getSessionQuestions(cardIndex: number): { oppna: SessionQuestion[]; vand: SessionQuestion } {
  // TODO: Replace with real content data file lookup
  return {
    oppna: [
      { text: 'Vad har ni tänkt på sedan förra veckan?' },
      { text: 'Finns det något ni vill säga till varandra just nu?' },
    ],
    vand: {
      text: 'Om ni tänker på det ni just pratade om — vad var det viktigaste?',
    },
  };
}

// ── Reduced motion helper ───────────────────────────────────
const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Component ───────────────────────────────────────────────

export default function SessionOneLive() {
  const { cardId: slug } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { space } = useCoupleSpaceContext();

  const cardIndex = slug ? cardIndexFromSlug(slug) : -1;
  const backendCardId = slug ? cardIdFromSlug(slug) : null;
  const sliderSet = slug ? getSliderSetBySlug(slug) : undefined;

  const [step, setStep] = useState<Step>('threshold');
  const [coupleState, setCoupleState] = useState<CoupleStateRow | null>(null);
  const [deviceId] = useState(() => crypto.randomUUID());

  // Threshold mood state
  const [initiatorMood, setInitiatorMood] = useState<ThresholdMood | null>(null);
  const [partnerMood, setPartnerMood] = useState<ThresholdMood | null>(null);
  const [tier2Step, setTier2Step] = useState<'initiator' | 'partner' | 'both'>('initiator');

  // Slider reveal data
  const [initiatorSliders, setInitiatorSliders] = useState<Record<string, number>>({});
  const [partnerSliders, setPartnerSliders] = useState<Record<string, number>>({});
  const [initiatorReflection, setInitiatorReflection] = useState<string | undefined>();
  const [partnerReflection, setPartnerReflection] = useState<string | undefined>();

  // Session prompt state
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [showAnchor, setShowAnchor] = useState(false);
  const [showNoteField, setShowNoteField] = useState(false);

  const isCompact = cardIndex >= 5;
  const partnerTier = coupleState?.partner_tier ?? 'tier_1';
  const isTier1 = partnerTier === 'tier_1';

  // Derive display names
  const initiatorName = space?.partner_a_name || 'Du';
  const partnerName =
    partnerTier === 'tier_2'
      ? coupleState?.tier_2_partner_name || 'Partner'
      : space?.partner_b_name || 'Partner';

  const questions = getSessionQuestions(cardIndex);

  // ── Fetch couple_state on mount ───────────────────────────
  useEffect(() => {
    if (!space?.id) return;
    (async () => {
      const { data } = await supabase
        .from('couple_state')
        .select('couple_id, initiator_id, partner_id, partner_tier, tier_2_partner_name, tier_2_pseudo_id, current_card_index, cycle_id')
        .eq('couple_id', space.id)
        .maybeSingle();
      if (data) setCoupleState(data as unknown as CoupleStateRow);
    })();
  }, [space?.id]);

  // ── Fetch slider data for reveal ──────────────────────────
  useEffect(() => {
    if (!coupleState || !backendCardId) return;
    (async () => {
      const { data: cardStates } = await supabase
        .from('user_card_state')
        .select('user_id, slider_responses, checkin_reflection')
        .eq('couple_id', coupleState.couple_id)
        .eq('card_id', backendCardId)
        .eq('cycle_id', coupleState.cycle_id);

      if (cardStates) {
        for (const row of cardStates) {
          const responses = row.slider_responses as any;
          const valueMap: Record<string, number> = {};
          if (Array.isArray(responses)) {
            for (const r of responses) {
              if (r.slider_id && typeof r.position === 'number') {
                valueMap[r.slider_id] = r.position;
              }
            }
          }
          if (row.user_id === coupleState.initiator_id) {
            setInitiatorSliders(valueMap);
            if (row.checkin_reflection) setInitiatorReflection(row.checkin_reflection);
          } else {
            setPartnerSliders(valueMap);
            if (row.checkin_reflection) setPartnerReflection(row.checkin_reflection);
          }
        }
      }

      if (partnerTier === 'tier_1') {
        const { data: anonData } = await supabase
          .from('anonymous_slider_submission')
          .select('slider_responses, checkin_reflection')
          .eq('couple_id', coupleState.couple_id)
          .eq('card_id', backendCardId)
          .eq('cycle_id', coupleState.cycle_id)
          .limit(1)
          .maybeSingle();

        if (anonData) {
          const responses = anonData.slider_responses as any;
          const valueMap: Record<string, number> = {};
          if (Array.isArray(responses)) {
            for (const r of responses) {
              if (r.slider_id && typeof r.position === 'number') {
                valueMap[r.slider_id] = r.position;
              }
            }
          }
          setPartnerSliders(valueMap);
          if (anonData.checkin_reflection) setPartnerReflection(anonData.checkin_reflection);
        }
      }
    })();
  }, [coupleState, backendCardId, partnerTier]);

  // ── Persist threshold mood ────────────────────────────────
  const persistMood = useCallback(
    async (userId: string, mood: ThresholdMood) => {
      if (!coupleState || !backendCardId) return;
      await supabase.from('threshold_mood').insert({
        couple_id: coupleState.couple_id,
        card_id: backendCardId,
        user_id: userId,
        cycle_id: coupleState.cycle_id,
        mood,
      });
    },
    [coupleState, backendCardId],
  );

  // ── Handle both moods selected ────────────────────────────
  const holdTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const onBothMoodsSelected = useCallback(
    (iMood: ThresholdMood, pMood: ThresholdMood) => {
      if (coupleState && user?.id) {
        persistMood(user.id, iMood);
        if (partnerTier === 'tier_2' && coupleState.tier_2_pseudo_id) {
          persistMood(coupleState.tier_2_pseudo_id, pMood);
        } else if (partnerTier === 'tier_3' && coupleState.partner_id) {
          persistMood(coupleState.partner_id, pMood);
        }
      }

      const framingResult = getThresholdFraming(iMood, pMood);

      if (isCompact) {
        if (framingResult) {
          setStep('framing');
        } else {
          setStep('reveal');
        }
      } else {
        holdTimerRef.current = setTimeout(() => {
          if (framingResult) {
            setStep('framing');
          } else {
            setStep('reveal');
          }
        }, 800);
      }
    },
    [coupleState, user?.id, partnerTier, isCompact, persistMood],
  );

  useEffect(() => () => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
  }, []);

  // ── Tier 2 sequential flow ────────────────────────────────
  const handleTier2InitiatorSelect = useCallback(
    (mood: ThresholdMood) => {
      setInitiatorMood(mood);
      setTimeout(() => setTier2Step('partner'), 700);
    },
    [],
  );

  const handleTier2PartnerSelect = useCallback(
    (mood: ThresholdMood) => {
      setPartnerMood(mood);
      setTimeout(() => {
        setTier2Step('both');
        setTimeout(() => {
          if (initiatorMood) onBothMoodsSelected(initiatorMood, mood);
        }, 100);
      }, 400);
    },
    [initiatorMood, onBothMoodsSelected],
  );

  // ── Tier 1/3 simultaneous selection ───────────────────────
  useEffect(() => {
    if (initiatorMood && partnerMood && partnerTier !== 'tier_2') {
      onBothMoodsSelected(initiatorMood, partnerMood);
    }
  }, [initiatorMood, partnerMood, partnerTier, onBothMoodsSelected]);

  // ── Framing auto-advance (Trött case) ────────────────────
  const framingRef = useRef<ReturnType<typeof setTimeout>>();
  const framing = initiatorMood && partnerMood ? getThresholdFraming(initiatorMood, partnerMood) : null;

  useEffect(() => {
    if (step === 'framing' && framing && !framing.showExitCta) {
      framingRef.current = setTimeout(() => setStep('reveal'), 2000);
      return () => { if (framingRef.current) clearTimeout(framingRef.current); };
    }
  }, [step, framing]);

  // ── Stage interstitial auto-advance ───────────────────────
  useEffect(() => {
    if (step === 'stage_interstitial') {
      const delay = prefersReduced ? 300 : 500;
      const t = setTimeout(() => setStep('vand_q1'), delay);
      return () => clearTimeout(t);
    }
  }, [step]);

  // ── Save note to user_card_state ──────────────────────────
  const saveNote = useCallback(
    async (stepId: string) => {
      const text = notes[stepId]?.trim();
      if (!text || !coupleState || !backendCardId || !user?.id) return;

      // Fetch existing notes, merge, upsert
      const { data: existing } = await supabase
        .from('user_card_state')
        .select('notes')
        .eq('couple_id', coupleState.couple_id)
        .eq('user_id', user.id)
        .eq('card_id', backendCardId)
        .eq('cycle_id', coupleState.cycle_id)
        .maybeSingle();

      const existingNotes = (existing?.notes as Record<string, string>) ?? {};
      const merged = { ...existingNotes, [stepId]: text };

      await supabase
        .from('user_card_state')
        .upsert(
          {
            couple_id: coupleState.couple_id,
            user_id: user.id,
            card_id: backendCardId,
            cycle_id: coupleState.cycle_id,
            notes: merged as any,
          },
          { onConflict: 'couple_id,user_id,card_id,cycle_id' },
        );
    },
    [notes, coupleState, backendCardId, user?.id],
  );

  // ── Pause handlers ────────────────────────────────────────
  const handlePauseTime = useCallback(async () => {
    // TODO: update session_state with paused_reason='time'
    navigate('/');
  }, [navigate]);

  const handlePauseEmotional = useCallback(async () => {
    // TODO: update session_state with paused_reason='emotional'
    navigate('/');
  }, [navigate]);

  // ── Step advance handler ──────────────────────────────────
  const handleNext = useCallback(async () => {
    setShowAnchor(false);
    setShowNoteField(false);

    if (step === 'oppna_q1') {
      await saveNote('oppna_q1');
      setStep('oppna_q2');
    } else if (step === 'oppna_q2') {
      await saveNote('oppna_q2');
      setStep('stage_interstitial');
    } else if (step === 'vand_q1') {
      await saveNote('vand_q1');
      navigate(`/session/${slug}/complete-session1`);
    }
  }, [step, saveNote, navigate, slug]);

  // ── Render helpers ────────────────────────────────────────

  if (cardIndex === -1 || !slug) {
    return (
      <div style={{ minHeight: '100dvh', backgroundColor: COLORS.emberNight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: COLORS.lanternGlow, fontFamily: 'var(--font-sans)' }}>Kort hittades inte</p>
      </div>
    );
  }

  // ── STEP: THRESHOLD ───────────────────────────────────────
  if (step === 'threshold') {
    if (isCompact) {
      return (
        <SessionFocusShell
          couple_id={coupleState?.couple_id}
          card_id={backendCardId ?? undefined}
          device_id={deviceId}
          onExit={() => navigate('/')}
          ctaSlot={null}
        >
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <CompactThresholdRow
              initiatorName={initiatorName}
              partnerName={partnerName}
              initiatorMood={initiatorMood}
              partnerMood={partnerMood}
              onInitiatorSelect={setInitiatorMood}
              onPartnerSelect={setPartnerMood}
            />
            <button
              onClick={() => setStep('reveal')}
              style={{
                background: 'none',
                border: 'none',
                color: COLORS.driftwood,
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                cursor: 'pointer',
                alignSelf: 'center',
              }}
            >
              Börja direkt
            </button>
            {initiatorMood && partnerMood && framing && (
              <CompactFramingBanner
                framing={framing}
                onContinue={() => setStep('reveal')}
                onPause={handlePauseEmotional}
              />
            )}
          </div>
        </SessionFocusShell>
      );
    }

    if (partnerTier === 'tier_2') {
      return (
        <SessionFocusShell couple_id={coupleState?.couple_id} card_id={backendCardId ?? undefined} device_id={deviceId} onExit={() => navigate('/')} ctaSlot={null}>
          <Tier2Threshold
            initiatorName={initiatorName}
            partnerName={partnerName}
            tier2Step={tier2Step}
            initiatorMood={initiatorMood}
            partnerMood={partnerMood}
            onInitiatorSelect={handleTier2InitiatorSelect}
            onPartnerSelect={handleTier2PartnerSelect}
          />
        </SessionFocusShell>
      );
    }

    return (
      <SessionFocusShell couple_id={coupleState?.couple_id} card_id={backendCardId ?? undefined} device_id={deviceId} onExit={() => navigate('/')} ctaSlot={null}>
        <FullscreenThreshold
          initiatorName={initiatorName}
          partnerName={partnerName}
          initiatorMood={initiatorMood}
          partnerMood={partnerMood}
          onInitiatorSelect={setInitiatorMood}
          onPartnerSelect={setPartnerMood}
        />
      </SessionFocusShell>
    );
  }

  // ── STEP: FRAMING ─────────────────────────────────────────
  if (step === 'framing' && framing) {
    return (
      <SessionFocusShell
        couple_id={coupleState?.couple_id}
        card_id={backendCardId ?? undefined}
        device_id={deviceId}
        onExit={() => navigate('/')}
        ctaSlot={
          framing.showExitCta ? (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => setStep('reveal')}
                style={{
                  width: '100%', height: '44px', borderRadius: '12px',
                  backgroundColor: COLORS.deepSaffron, border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 600, color: '#2C2420',
                }}
              >
                Prata i den här takten
              </button>
              <button onClick={handlePauseEmotional} style={{ background: 'none', border: 'none', color: COLORS.driftwood, fontFamily: 'var(--font-sans)', fontSize: '13px', cursor: 'pointer' }}>
                Vi vill pausa istället
              </button>
            </div>
          ) : null
        }
      >
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: EMOTION, ease: [...EASE] }} style={{ textAlign: 'center', maxWidth: '300px' }}>
          <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: '20px', fontWeight: 400, color: COLORS.driftwood, lineHeight: 1.5 }}>
            {framing.body}
          </p>
        </motion.div>
      </SessionFocusShell>
    );
  }

  // ── STEP: REVEAL ──────────────────────────────────────────
  if (step === 'reveal') {
    return (
      <SliderReveal
        cardIndex={cardIndex}
        cardSlug={slug}
        sliders={sliderSet?.sliders ?? []}
        initiatorValues={initiatorSliders}
        partnerValues={partnerSliders}
        initiatorName={initiatorName}
        partnerName={partnerName}
        initiatorReflection={initiatorReflection}
        partnerReflection={partnerReflection}
        onContinue={() => setStep('oppna_q1')}
      />
    );
  }

  // ── STEP: STAGE INTERSTITIAL ──────────────────────────────
  if (step === 'stage_interstitial') {
    return (
      <div
        style={{
          minHeight: '100dvh',
          backgroundColor: COLORS.emberNight,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 24px',
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: prefersReduced ? 0 : 0.3, ease: [...EASE] }}
          style={{ textAlign: 'center' }}
        >
          <p style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: '32px',
            fontWeight: 400,
            color: COLORS.deepSaffron,
            margin: '0 0 12px 0',
          }}>
            Vänd
          </p>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '16px',
            color: `${COLORS.lanternGlow}B3`,
            margin: 0,
          }}>
            Nu vänder vi blicken inåt.
          </p>
        </motion.div>
      </div>
    );
  }

  // ── STEP: EMOTIONAL PAUSE ─────────────────────────────────
  if (step === 'emotional_pause') {
    return (
      <div
        style={{
          minHeight: '100dvh',
          backgroundColor: COLORS.emberNight,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 24px',
        }}
      >
        <h2 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: '24px',
          fontWeight: 400,
          color: COLORS.lanternGlow,
          textAlign: 'center',
          margin: '0 0 16px 0',
        }}>
          Det är modigt att stanna upp.
        </h2>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '16px',
          color: `${COLORS.lanternGlow}B3`,
          textAlign: 'center',
          maxWidth: '280px',
          lineHeight: 1.5,
          margin: '0 0 32px 0',
        }}>
          Ni kan komma tillbaka till det här när ni är redo. Allt ni har pratat om är sparat.
        </p>
        <button
          onClick={handlePauseEmotional}
          style={{
            width: '100%',
            maxWidth: '300px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: COLORS.deepSaffron,
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            fontSize: '16px',
            fontWeight: 600,
            color: '#2C2420',
          }}
        >
          Tillbaka hem
        </button>
      </div>
    );
  }

  // ── STEPS: OPPNA_Q1, OPPNA_Q2, VAND_Q1 ───────────────────
  const isOppna = step === 'oppna_q1' || step === 'oppna_q2';
  const currentQuestion = isOppna
    ? questions.oppna[step === 'oppna_q1' ? 0 : 1]
    : questions.vand;

  const activeStage: 'oppna' | 'vand' = isOppna ? 'oppna' : 'vand';
  const dotCount = isOppna ? 2 : 1;
  const activeDot = step === 'oppna_q1' ? 0 : step === 'oppna_q2' ? 1 : 0;

  const stepNavBar = (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 24px',
      paddingTop: 'calc(12px + env(safe-area-inset-top, 0px))',
    }}>
      <div style={{ display: 'flex', gap: '20px' }}>
        <StepLabel label="1. Öppna" active={activeStage === 'oppna'} />
        <StepLabel label="2. Vänd" active={activeStage === 'vand'} />
      </div>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: COLORS.driftwood }}>
        Samtal 1 av 2
      </span>
    </div>
  );

  return (
    <SessionFocusShell
      couple_id={coupleState?.couple_id}
      card_id={backendCardId ?? undefined}
      device_id={deviceId}
      topSlot={stepNavBar}
      onExit={() => navigate('/')}
      ctaSlot={
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={handleNext}
            style={{
              width: '100%',
              height: '52px',
              borderRadius: '12px',
              backgroundColor: COLORS.deepSaffron,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontSize: '16px',
              fontWeight: 600,
              color: COLORS.lanternGlow,
            }}
          >
            Nästa
          </button>
          <button
            onClick={handlePauseTime}
            style={{ background: 'none', border: 'none', color: COLORS.driftwood, fontFamily: 'var(--font-sans)', fontSize: '14px', cursor: 'pointer' }}
          >
            Pausa för idag
          </button>
          <button
            onClick={() => setStep('emotional_pause')}
            style={{ background: 'none', border: 'none', color: COLORS.driftwood, fontFamily: 'var(--font-sans)', fontSize: '13px', cursor: 'pointer', opacity: 0.6 }}
          >
            Vi behöver stanna här
          </button>
        </div>
      }
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={prefersReduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={prefersReduced ? undefined : { opacity: 0 }}
          transition={{ duration: 0.3, ease: [...EASE] }}
          style={{ width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          {/* Question text */}
          <p style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: '26px',
            fontWeight: 400,
            color: COLORS.lanternGlow,
            lineHeight: 1.4,
            margin: '0 0 16px 0',
            textWrap: 'balance',
          }}>
            {currentQuestion?.text}
          </p>

          {/* Sub-prompt dots */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px' }}>
            {Array.from({ length: dotCount }, (_, i) => (
              <div
                key={i}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: i === activeDot ? COLORS.deepSaffron : 'transparent',
                  border: i === activeDot ? 'none' : `1.5px solid ${COLORS.driftwood}`,
                }}
              />
            ))}
          </div>

          {/* Anchor (expandable) */}
          {currentQuestion?.anchor && (
            <div style={{ marginBottom: '16px' }}>
              <button
                onClick={() => setShowAnchor(!showAnchor)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  color: COLORS.driftwood,
                  cursor: 'pointer',
                  fontStyle: 'italic',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                }}
              >
                {showAnchor ? 'Dölj samtalshjälp' : 'Samtalshjälp'}
              </button>
              <AnimatePresence>
                {showAnchor && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '14px',
                      color: COLORS.driftwood,
                      fontStyle: 'italic',
                      lineHeight: 1.5,
                      marginTop: '12px',
                      overflow: 'hidden',
                    }}
                  >
                    {currentQuestion.anchor}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* "Fäst en tanke" — suppressed for Tier 1 */}
          {!isTier1 && (
            <div style={{ width: '100%', maxWidth: '340px' }}>
              {!showNoteField ? (
                <button
                  onClick={() => setShowNoteField(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    color: COLORS.driftwood,
                    fontStyle: 'italic',
                    cursor: 'pointer',
                  }}
                >
                  Fäst en tanke
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden' }}
                >
                  <textarea
                    value={notes[step] ?? ''}
                    onChange={(e) => setNotes((prev) => ({ ...prev, [step]: e.target.value }))}
                    placeholder="Fäst en tanke..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '16px',
                      borderRadius: '8px',
                      backgroundColor: COLORS.emberGlow,
                      border: 'none',
                      color: COLORS.lanternGlow,
                      fontFamily: 'var(--font-sans)',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'none',
                      lineHeight: 1.5,
                    }}
                  />
                  <p style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '11px',
                    color: COLORS.driftwoodBody,
                    fontStyle: 'italic',
                    marginTop: '6px',
                  }}>
                    Bara du kan se det här.
                  </p>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </SessionFocusShell>
  );
}

// ═══════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════

function StepLabel({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '13px',
        fontWeight: 600,
        color: active ? COLORS.deepSaffron : COLORS.driftwoodBody,
        paddingBottom: '4px',
        borderBottom: active ? `2px solid ${COLORS.deepSaffron}` : '2px solid transparent',
      }}
    >
      {label}
    </span>
  );
}

// ── Fullscreen Threshold (Tier 1/3) ─────────────────────────

function FullscreenThreshold({
  initiatorName,
  partnerName,
  initiatorMood,
  partnerMood,
  onInitiatorSelect,
  onPartnerSelect,
}: {
  initiatorName: string;
  partnerName: string;
  initiatorMood: ThresholdMood | null;
  partnerMood: ThresholdMood | null;
  onInitiatorSelect: (m: ThresholdMood) => void;
  onPartnerSelect: (m: ThresholdMood) => void;
}) {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
      <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '24px', fontWeight: 400, color: COLORS.lanternGlow, textAlign: 'center', margin: 0 }}>
        Hur mår ni?
      </h2>
      <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
        <MoodColumn name={initiatorName} selected={initiatorMood} onSelect={onInitiatorSelect} fullSize />
        <MoodColumn name={partnerName} selected={partnerMood} onSelect={onPartnerSelect} fullSize />
      </div>
    </div>
  );
}

// ── Tier 2 Threshold (sequential crossfade) ─────────────────

function Tier2Threshold({
  initiatorName,
  partnerName,
  tier2Step,
  initiatorMood,
  partnerMood,
  onInitiatorSelect,
  onPartnerSelect,
}: {
  initiatorName: string;
  partnerName: string;
  tier2Step: 'initiator' | 'partner' | 'both';
  initiatorMood: ThresholdMood | null;
  partnerMood: ThresholdMood | null;
  onInitiatorSelect: (m: ThresholdMood) => void;
  onPartnerSelect: (m: ThresholdMood) => void;
}) {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
      <AnimatePresence mode="wait">
        {tier2Step === 'initiator' && (
          <motion.div key="t2-init" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: [...EASE] }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '24px', fontWeight: 400, color: COLORS.lanternGlow, textAlign: 'center', margin: 0 }}>Hur mår ni?</h2>
            <div style={{ maxWidth: '200px', width: '100%' }}>
              <MoodColumn name={initiatorName} selected={initiatorMood} onSelect={onInitiatorSelect} fullSize />
            </div>
          </motion.div>
        )}
        {tier2Step === 'partner' && (
          <motion.div key="t2-partner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: [...EASE] }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '20px', fontWeight: 400, color: COLORS.lanternGlow, textAlign: 'center', margin: 0 }}>Och du, {partnerName}?</h2>
            <div style={{ maxWidth: '200px', width: '100%' }}>
              <MoodColumn name={partnerName} selected={partnerMood} onSelect={onPartnerSelect} fullSize />
            </div>
          </motion.div>
        )}
        {tier2Step === 'both' && (
          <motion.div key="t2-both" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, ease: [...EASE] }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '24px', fontWeight: 400, color: COLORS.lanternGlow, textAlign: 'center', margin: 0 }}>Hur mår ni?</h2>
            <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
              <MoodColumn name={initiatorName} selected={initiatorMood} onSelect={() => {}} fullSize disabled />
              <MoodColumn name={partnerName} selected={partnerMood} onSelect={() => {}} fullSize disabled />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Compact Threshold Row ───────────────────────────────────

function CompactThresholdRow({
  initiatorName, partnerName, initiatorMood, partnerMood, onInitiatorSelect, onPartnerSelect,
}: {
  initiatorName: string; partnerName: string;
  initiatorMood: ThresholdMood | null; partnerMood: ThresholdMood | null;
  onInitiatorSelect: (m: ThresholdMood) => void; onPartnerSelect: (m: ThresholdMood) => void;
}) {
  return (
    <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
      <MoodColumn name={initiatorName} selected={initiatorMood} onSelect={onInitiatorSelect} fullSize={false} />
      <MoodColumn name={partnerName} selected={partnerMood} onSelect={onPartnerSelect} fullSize={false} />
    </div>
  );
}

// ── Compact Framing Banner ──────────────────────────────────

function CompactFramingBanner({ framing, onContinue, onPause }: { framing: { body: string; showExitCta?: boolean }; onContinue: () => void; onPause: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: EMOTION, ease: [...EASE] }}
      style={{ padding: '16px', borderRadius: '12px', backgroundColor: `${COLORS.emberGlow}30`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: '16px', color: COLORS.driftwood, textAlign: 'center', lineHeight: 1.5, margin: 0 }}>{framing.body}</p>
      {framing.showExitCta && (
        <>
          <button onClick={onContinue} style={{ width: '100%', height: '40px', borderRadius: '10px', backgroundColor: COLORS.deepSaffron, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600, color: '#2C2420' }}>Prata i den här takten</button>
          <button onClick={onPause} style={{ background: 'none', border: 'none', color: COLORS.driftwood, fontFamily: 'var(--font-sans)', fontSize: '13px', cursor: 'pointer' }}>Vi vill pausa istället</button>
        </>
      )}
    </motion.div>
  );
}

// ── Mood Column ─────────────────────────────────────────────

function MoodColumn({ name, selected, onSelect, fullSize, disabled = false }: {
  name: string; selected: ThresholdMood | null; onSelect: (m: ThresholdMood) => void; fullSize: boolean; disabled?: boolean;
}) {
  const h = fullSize ? '44px' : '32px';
  const fs = fullSize ? '14px' : '12px';
  const br = fullSize ? '22px' : '16px';
  const g = fullSize ? '8px' : '6px';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: g, alignItems: 'stretch' }}>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: COLORS.driftwoodBody, textAlign: 'center', marginBottom: '4px' }}>{name}</span>
      {MOOD_OPTIONS.map((mood) => {
        const sel = selected === mood;
        return (
          <button key={mood} onClick={() => !disabled && onSelect(mood)} disabled={disabled}
            style={{ height: h, borderRadius: br, backgroundColor: COLORS.emberMid, border: sel ? `2px solid ${COLORS.deepSaffron}` : '2px solid transparent', color: sel ? COLORS.deepSaffron : COLORS.lanternGlow, fontFamily: 'var(--font-sans)', fontSize: fs, fontWeight: 500, cursor: disabled ? 'default' : 'pointer', transition: 'border-color 300ms, color 300ms', width: '100%' }}>
            {mood}
          </button>
        );
      })}
    </div>
  );
}
