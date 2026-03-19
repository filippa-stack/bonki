/**
 * TillbakaSessionLive — Simplified maintenance session flow.
 * Steps: Threshold → Slider Reveal → Q1 → Q2.
 * NO step nav bar, NO "Samtal N av 2", NO stage interstitials, NO Session 2.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE, EMOTION } from '@/lib/motion';
import { supabase } from '@/integrations/supabase/client';
import { COLORS, cardIdFromIndex } from '@/lib/stillUsTokens';
import { acquireSessionLock } from '@/lib/stillUsRpc';
import { getTillbakaCard } from '@/data/tillbakaCards';
import { getThresholdFraming, MOOD_OPTIONS, type ThresholdMood } from '@/data/thresholdFramings';
import { enqueueWrite, hasPendingWrites, onSyncStatusChange } from '@/lib/offlineQueue';
import SessionFocusShell from '@/components/SessionFocusShell';
import SliderReveal from '@/components/still-us/SliderReveal';

// ── Types ───────────────────────────────────────────────────

interface CoupleStateRow {
  couple_id: string;
  initiator_id: string;
  partner_id: string | null;
  partner_tier: string;
  tier_2_partner_name: string | null;
  tier_2_pseudo_id: string | null;
  current_card_index: number;
  maintenance_card_index: number;
  cycle_id: number;
  phase: string;
}

type Step = 'threshold' | 'framing' | 'reveal' | 'q1' | 'q2';

// ── Reduced motion ──────────────────────────────────────────
const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Component ───────────────────────────────────────────────

export default function TillbakaSessionLive() {
  const { cardId: slug } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isResume = searchParams.get('resume') === 'true';

  // Parse tillbaka index from slug: "tillbaka-0", "tillbaka-1", etc.
  const tillbakaIndex = parseInt(slug?.replace('tillbaka-', '') ?? '0', 10) || 0;
  const backendCardId = `tillbaka_${tillbakaIndex + 1}`;
  const tillbakaCard = getTillbakaCard(tillbakaIndex);

  const [coupleState, setCoupleState] = useState<CoupleStateRow | null>(null);
  const [step, setStep] = useState<Step>('threshold');
  const [q1Note, setQ1Note] = useState('');
  const [q2Note, setQ2Note] = useState('');
  const [deviceId] = useState(() =>
    localStorage.getItem('still_us_device_id') ??
    (() => { const id = crypto.randomUUID(); localStorage.setItem('still_us_device_id', id); return id; })()
  );
  const [lockAcquired, setLockAcquired] = useState(false);
  const [showNoteQ1, setShowNoteQ1] = useState(false);
  const [showNoteQ2, setShowNoteQ2] = useState(false);

  // Threshold state
  const [initiatorMood, setInitiatorMood] = useState<ThresholdMood | null>(null);
  const [partnerMood, setPartnerMood] = useState<ThresholdMood | null>(null);
  const [tier2Step, setTier2Step] = useState<'initiator' | 'partner' | 'both'>('initiator');

  // Slider reveal data
  const [initiatorSliders, setInitiatorSliders] = useState<Record<string, number>>({});
  const [partnerSliders, setPartnerSliders] = useState<Record<string, number>>({});
  const [initiatorReflection, setInitiatorReflection] = useState<string | undefined>();
  const [partnerReflection, setPartnerReflection] = useState<string | undefined>();

  // Emotional exit
  const [showEmotionalExit, setShowEmotionalExit] = useState(false);
  const [pendingSync, setPendingSync] = useState(false);
  const localNotesCache = useRef<Record<string, Record<string, string>>>({});

  useEffect(() => {
    const cleanup = onSyncStatusChange(() => {
      setPendingSync(hasPendingWrites());
    });
    return cleanup;
  }, []);

  const isTier1 = coupleState?.partner_tier === 'tier_1';
  const showFastEnTanke = !isTier1;

  // Display names
  const initiatorName = 'Du';
  const partnerName =
    coupleState?.partner_tier === 'tier_2'
      ? coupleState?.tier_2_partner_name || 'Partner'
      : 'Partner';

  // ── On mount: fetch couple_state + acquire lock ───────────
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/'); return; }

      const { data: couple } = await supabase
        .from('couple_state')
        .select('couple_id, initiator_id, partner_id, partner_tier, tier_2_partner_name, tier_2_pseudo_id, current_card_index, maintenance_card_index, cycle_id, phase')
        .or(`initiator_id.eq.${user.id},partner_id.eq.${user.id}`)
        .single();

      if (!couple || couple.phase !== 'maintenance') { navigate('/'); return; }
      setCoupleState(couple as unknown as CoupleStateRow);

      // Acquire session lock
      const result = await acquireSessionLock({
        couple_id: couple.couple_id,
        card_id: backendCardId,
        device_id: deviceId,
        user_id: user.id,
      });

      if (result.status === 'acquired') {
        setLockAcquired(true);

        // If resuming, check session_state for saved step
        if (isResume) {
          const { data: ss } = await supabase
            .from('session_state')
            .select('current_step')
            .eq('couple_id', couple.couple_id)
            .eq('card_id', backendCardId)
            .eq('cycle_id', couple.cycle_id)
            .single();

          if (ss?.current_step === 'tillbaka_q2') setStep('q2');
          else if (ss?.current_step === 'tillbaka_q1') setStep('q1');
        }
      } else {
        navigate('/');
      }
    };
    init();
  }, [slug, navigate, deviceId, backendCardId, isResume]);

  // ── Fetch slider data for reveal ──────────────────────────
  useEffect(() => {
    if (!coupleState) return;
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

      if (isTier1) {
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
  }, [coupleState, backendCardId, isTier1]);

  // ── Threshold mood handling ───────────────────────────────
  const holdTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const persistMood = useCallback(
    async (userId: string, mood: ThresholdMood) => {
      if (!coupleState) return;
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

  const onBothMoodsSelected = useCallback(
    (iMood: ThresholdMood, pMood: ThresholdMood) => {
      const framingResult = getThresholdFraming(iMood, pMood);
      // Tillbaka always uses compact — go directly to reveal or framing
      if (framingResult) {
        setStep('framing');
      } else {
        setStep('reveal');
      }
    },
    [],
  );

  // Tier 2 sequential flow
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

  // Tier 1/3 simultaneous
  useEffect(() => {
    if (initiatorMood && partnerMood && coupleState?.partner_tier !== 'tier_2') {
      onBothMoodsSelected(initiatorMood, partnerMood);
    }
  }, [initiatorMood, partnerMood, coupleState?.partner_tier, onBothMoodsSelected]);

  // Framing auto-advance
  const framing = initiatorMood && partnerMood ? getThresholdFraming(initiatorMood, partnerMood) : null;
  const framingRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (step === 'framing' && framing && !framing.showExitCta) {
      framingRef.current = setTimeout(() => setStep('reveal'), 2000);
      return () => { if (framingRef.current) clearTimeout(framingRef.current); };
    }
  }, [step, framing]);

  useEffect(() => () => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
  }, []);

  // ── Step transitions ──────────────────────────────────────
  const handleRevealComplete = useCallback(() => {
    setStep('q1');
    if (coupleState) {
      supabase
        .from('session_state')
        .update({ current_step: 'tillbaka_q1' })
        .eq('couple_id', coupleState.couple_id)
        .eq('card_id', backendCardId)
        .eq('cycle_id', coupleState.cycle_id);
    }
  }, [coupleState, backendCardId]);

  const handleQ1Next = useCallback(() => {
    // Fire-and-forget note save
    if (q1Note.trim() && coupleState) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user) return;
        const cacheKey = `${coupleState.couple_id}:${backendCardId}:${user.id}`;
        const prev = localNotesCache.current[cacheKey] ?? {};
        const merged = { ...prev, tillbaka_q1: q1Note.trim() };
        localNotesCache.current[cacheKey] = merged;

        enqueueWrite({
          table: 'user_card_state',
          operation: 'upsert',
          match: {},
          data: {
            couple_id: coupleState.couple_id,
            user_id: user.id,
            card_id: backendCardId,
            cycle_id: coupleState.cycle_id,
            notes: merged,
          },
        });
      });
    }

    setStep('q2');
    if (coupleState) {
      supabase
        .from('session_state')
        .update({ current_step: 'tillbaka_q2' })
        .eq('couple_id', coupleState.couple_id)
        .eq('card_id', backendCardId)
        .eq('cycle_id', coupleState.cycle_id);
    }
  }, [coupleState, backendCardId, q1Note]);

  // ── Pause + emotional exit ────────────────────────────────
  const handlePause = useCallback(async () => {
    if (!coupleState) return;
    await supabase
      .from('session_state')
      .update({
        paused_at: new Date().toISOString(),
        paused_reason: 'time',
        current_step: step === 'q1' ? 'tillbaka_q1' : 'tillbaka_q2',
      })
      .eq('couple_id', coupleState.couple_id)
      .eq('card_id', backendCardId)
      .eq('cycle_id', coupleState.cycle_id);
    navigate('/');
  }, [coupleState, backendCardId, step, navigate]);

  const handleEmotionalExit = useCallback(async () => {
    if (!coupleState) return;
    await supabase
      .from('session_state')
      .update({
        paused_at: new Date().toISOString(),
        paused_reason: 'emotional',
        current_step: step === 'q1' ? 'tillbaka_q1' : 'tillbaka_q2',
      })
      .eq('couple_id', coupleState.couple_id)
      .eq('card_id', backendCardId)
      .eq('cycle_id', coupleState.cycle_id);
    navigate('/');
  }, [coupleState, backendCardId, step, navigate]);

  // ── Complete → navigate to tillbaka-complete ───────────────
  const handleComplete = useCallback(() => {
    // Fire-and-forget note save — never blocks navigation
    if (q2Note.trim() && coupleState) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user) return;
        const cacheKey = `${coupleState.couple_id}:${backendCardId}:${user.id}`;
        const prev = localNotesCache.current[cacheKey] ?? {};
        const merged = { ...prev, tillbaka_q2: q2Note.trim() };
        localNotesCache.current[cacheKey] = merged;

        enqueueWrite({
          table: 'user_card_state',
          operation: 'upsert',
          match: {},
          data: {
            couple_id: coupleState.couple_id,
            user_id: user.id,
            card_id: backendCardId,
            cycle_id: coupleState.cycle_id,
            notes: merged,
          },
        });
      });
    }

    navigate(`/session/${slug}/tillbaka-complete`);
  }, [navigate, slug, q2Note, coupleState, backendCardId]);

  // ── Render ────────────────────────────────────────────────

  if (!lockAcquired || !coupleState) {
    return <div style={{ minHeight: '100dvh', backgroundColor: COLORS.emberNight }} />;
  }

  // ── STEP: THRESHOLD ───────────────────────────────────────
  if (step === 'threshold') {
    if (coupleState.partner_tier === 'tier_2') {
      return (
        <SessionFocusShell couple_id={coupleState.couple_id} card_id={backendCardId} device_id={deviceId} onExit={() => navigate('/')} ctaSlot={null}>
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
      <SessionFocusShell couple_id={coupleState.couple_id} card_id={backendCardId} device_id={deviceId} onExit={() => navigate('/')} ctaSlot={null}>
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
            style={{ background: 'none', border: 'none', color: COLORS.driftwood, fontFamily: 'var(--font-sans)', fontSize: '13px', cursor: 'pointer', alignSelf: 'center' }}
          >
            Börja direkt
          </button>
          {initiatorMood && partnerMood && framing && (
            <CompactFramingBanner
              framing={framing}
              onContinue={() => setStep('reveal')}
              onPause={handlePause}
            />
          )}
        </div>
      </SessionFocusShell>
    );
  }

  // ── STEP: FRAMING ─────────────────────────────────────────
  if (step === 'framing' && framing) {
    return (
      <SessionFocusShell
        couple_id={coupleState.couple_id}
        card_id={backendCardId}
        device_id={deviceId}
        onExit={() => navigate('/')}
        ctaSlot={
          framing.showExitCta ? (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <button onClick={() => setStep('reveal')} style={{ width: '100%', height: '52px', borderRadius: '12px', backgroundColor: COLORS.deepSaffron, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '16px', fontWeight: 600, color: COLORS.lanternGlow }}>
                Prata i den här takten
              </button>
              <button onClick={handlePause} style={{ background: 'none', border: 'none', color: COLORS.driftwood, fontFamily: 'var(--font-sans)', fontSize: '14px', cursor: 'pointer' }}>
                Vi vill pausa istället
              </button>
            </div>
          ) : null
        }
      >
        <div style={{ width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: '22px', fontWeight: 400, color: COLORS.lanternGlow, lineHeight: 1.5, margin: 0 }}>
            {framing.body}
          </p>
        </div>
      </SessionFocusShell>
    );
  }

  // ── STEP: REVEAL ──────────────────────────────────────────
  if (step === 'reveal') {
    return (
      <SliderReveal
        cardIndex={tillbakaIndex}
        cardSlug={slug ?? ''}
        sliders={(tillbakaCard?.sliders ?? []).map(s => ({
          sliderId: s.id,
          text: s.text,
          leftLabel: s.leftLabel,
          rightLabel: s.rightLabel,
        }))}
        initiatorValues={initiatorSliders}
        partnerValues={partnerSliders}
        initiatorName={initiatorName}
        partnerName={partnerName}
        initiatorReflection={initiatorReflection}
        partnerReflection={partnerReflection}
        onContinue={handleRevealComplete}
      />
    );
  }

  // ── STEP: Q1 ──────────────────────────────────────────────
  if (step === 'q1') {
    return (
      <SessionFocusShell
        couple_id={coupleState.couple_id}
        card_id={backendCardId}
        device_id={deviceId}
        onExit={() => navigate('/')}
        ctaSlot={
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={handleQ1Next}
              style={{
                background: COLORS.deepSaffron,
                color: COLORS.emberNight,
                border: 'none',
                borderRadius: '30px',
                padding: '16px 40px',
                fontSize: '18px',
                fontFamily: "'DM Serif Display', serif",
                cursor: 'pointer',
                width: '100%',
                maxWidth: '280px',
              }}
            >
              Nästa
            </button>
            <button onClick={handlePause} style={{ background: 'none', border: 'none', color: COLORS.driftwood, fontFamily: 'var(--font-sans)', fontSize: '14px', cursor: 'pointer' }}>
              Pausa för idag
            </button>
            <button onClick={() => setShowEmotionalExit(true)} style={{ background: 'none', border: 'none', color: COLORS.driftwood, fontFamily: 'var(--font-sans)', fontSize: '13px', cursor: 'pointer', opacity: 0.6 }}>
              Vi behöver stanna här
            </button>
          </div>
        }
      >
        <div style={{ width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: '26px',
            fontWeight: 400,
            color: COLORS.lanternGlow,
            lineHeight: 1.4,
            margin: '0 0 32px 0',
            textWrap: 'balance',
            maxWidth: '320px',
          }}>
            {tillbakaCard?.question1 ?? '[PLACEHOLDER]'}
          </p>

          {showFastEnTanke && (
            <div style={{ width: '100%', maxWidth: '320px' }}>
              {!showNoteQ1 ? (
                <button
                  onClick={() => setShowNoteQ1(true)}
                  style={{ background: 'none', border: 'none', fontFamily: 'var(--font-sans)', fontSize: '13px', color: COLORS.driftwood, fontStyle: 'italic', cursor: 'pointer' }}
                >
                  Fäst en tanke
                </button>
              ) : (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <textarea
                      value={q1Note}
                      onChange={(e) => setQ1Note(e.target.value)}
                      placeholder="Fäst en tanke..."
                      rows={3}
                      style={{
                        width: '100%',
                        minHeight: '80px',
                        background: COLORS.emberGlow,
                        color: COLORS.lanternGlow,
                        border: 'none',
                        borderRadius: '12px',
                        padding: '12px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        outline: 'none',
                      }}
                    />
                    <p style={{ fontSize: '11px', color: COLORS.driftwoodBody, fontStyle: 'italic', marginTop: '6px' }}>
                      Bara du kan se det här.
                    </p>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          )}
        </div>
        {pendingSync && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', fontSize: '12px', color: COLORS.driftwood, padding: '8px 0', fontFamily: 'var(--font-sans)' }}>
            Dina anteckningar sparas snart.
          </motion.p>
        )}
      </SessionFocusShell>
    );
  }

  // ── STEP: Q2 ──────────────────────────────────────────────
  if (step === 'q2') {
    return (
      <SessionFocusShell
        couple_id={coupleState.couple_id}
        card_id={backendCardId}
        device_id={deviceId}
        onExit={() => navigate('/')}
        ctaSlot={
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={handleComplete}
              style={{
                background: COLORS.deepSaffron,
                color: COLORS.emberNight,
                border: 'none',
                borderRadius: '30px',
                padding: '16px 40px',
                fontSize: '18px',
                fontFamily: "'DM Serif Display', serif",
                cursor: 'pointer',
                width: '100%',
                maxWidth: '280px',
              }}
            >
              Avsluta tillbaka-samtalet
            </button>
            <button onClick={handlePause} style={{ background: 'none', border: 'none', color: COLORS.driftwood, fontFamily: 'var(--font-sans)', fontSize: '14px', cursor: 'pointer' }}>
              Pausa för idag
            </button>
            <button onClick={() => setShowEmotionalExit(true)} style={{ background: 'none', border: 'none', color: COLORS.driftwood, fontFamily: 'var(--font-sans)', fontSize: '13px', cursor: 'pointer', opacity: 0.6 }}>
              Vi behöver stanna här
            </button>
          </div>
        }
      >
        <div style={{ width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: '26px',
            fontWeight: 400,
            color: COLORS.lanternGlow,
            lineHeight: 1.4,
            margin: '0 0 32px 0',
            textWrap: 'balance',
            maxWidth: '320px',
          }}>
            {tillbakaCard?.question2 ?? '[PLACEHOLDER]'}
          </p>

          {showFastEnTanke && (
            <div style={{ width: '100%', maxWidth: '320px' }}>
              {!showNoteQ2 ? (
                <button
                  onClick={() => setShowNoteQ2(true)}
                  style={{ background: 'none', border: 'none', fontFamily: 'var(--font-sans)', fontSize: '13px', color: COLORS.driftwood, fontStyle: 'italic', cursor: 'pointer' }}
                >
                  Fäst en tanke
                </button>
              ) : (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <textarea
                      value={q2Note}
                      onChange={(e) => setQ2Note(e.target.value)}
                      placeholder="Fäst en tanke..."
                      rows={3}
                      style={{
                        width: '100%',
                        minHeight: '80px',
                        background: COLORS.emberGlow,
                        color: COLORS.lanternGlow,
                        border: 'none',
                        borderRadius: '12px',
                        padding: '12px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        outline: 'none',
                      }}
                    />
                    <p style={{ fontSize: '11px', color: COLORS.driftwoodBody, fontStyle: 'italic', marginTop: '6px' }}>
                      Bara du kan se det här.
                    </p>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          )}
        </div>

        {/* Emotional exit overlay */}
        {showEmotionalExit && (
          <div style={{
            position: 'fixed', inset: 0, background: COLORS.emberNight,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '48px 24px', zIndex: 100,
          }}>
            <div style={{
              fontFamily: "'DM Serif Display', serif", fontSize: '24px',
              color: COLORS.lanternGlow, textAlign: 'center', marginBottom: '16px',
            }}>
              Det är modigt att stanna upp.
            </div>
            <div style={{
              fontSize: '16px', color: COLORS.lanternGlow, opacity: 0.7,
              textAlign: 'center', marginBottom: '48px', maxWidth: '300px',
            }}>
              Ni kan komma tillbaka till det här när ni är redo. Allt ni har pratat om är sparat.
            </div>
            <button onClick={handleEmotionalExit} style={{
              background: COLORS.deepSaffron, color: COLORS.emberNight,
              border: 'none', borderRadius: '30px', padding: '16px 40px',
              fontSize: '18px', fontFamily: "'DM Serif Display', serif", cursor: 'pointer',
            }}>
              Tillbaka hem
            </button>
          </div>
        )}
        {pendingSync && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', fontSize: '12px', color: COLORS.driftwood, padding: '8px 0', fontFamily: 'var(--font-sans)' }}>
            Dina anteckningar sparas snart.
          </motion.p>
        )}
      </SessionFocusShell>
    );
  }

  // Fallback — should not reach
  return <div style={{ minHeight: '100dvh', backgroundColor: COLORS.emberNight }} />;
}

// ═══════════════════════════════════════════════════════════
// SUB-COMPONENTS (copied from SessionOneLive to avoid modifying it)
// ═══════════════════════════════════════════════════════════

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

function Tier2Threshold({
  initiatorName, partnerName, tier2Step, initiatorMood, partnerMood, onInitiatorSelect, onPartnerSelect,
}: {
  initiatorName: string; partnerName: string;
  tier2Step: 'initiator' | 'partner' | 'both';
  initiatorMood: ThresholdMood | null; partnerMood: ThresholdMood | null;
  onInitiatorSelect: (m: ThresholdMood) => void; onPartnerSelect: (m: ThresholdMood) => void;
}) {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
      <AnimatePresence mode="wait">
        {tier2Step === 'initiator' && (
          <motion.div key="t2-init" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '24px', fontWeight: 400, color: COLORS.lanternGlow, textAlign: 'center', margin: 0 }}>Hur mår ni?</h2>
            <div style={{ maxWidth: '200px', width: '100%' }}>
              <MoodColumn name={initiatorName} selected={initiatorMood} onSelect={onInitiatorSelect} fullSize />
            </div>
          </motion.div>
        )}
        {tier2Step === 'partner' && (
          <motion.div key="t2-partner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '20px', fontWeight: 400, color: COLORS.lanternGlow, textAlign: 'center', margin: 0 }}>Och du, {partnerName}?</h2>
            <div style={{ maxWidth: '200px', width: '100%' }}>
              <MoodColumn name={partnerName} selected={partnerMood} onSelect={onPartnerSelect} fullSize />
            </div>
          </motion.div>
        )}
        {tier2Step === 'both' && (
          <motion.div key="t2-both" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
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

function CompactFramingBanner({ framing, onContinue, onPause }: { framing: { body: string; showExitCta?: boolean }; onContinue: () => void; onPause: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: EMOTION }}
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
