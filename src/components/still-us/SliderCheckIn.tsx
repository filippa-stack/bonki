/**
 * SliderCheckIn — Phase A/B/C slider check-in screen (v3.0).
 * Touch 1 of the 3-touch rhythm.
 *
 * Route: /check-in/:cardId
 * Background: Ember Night (#2E2233)
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { COLORS, getLayerForCard, getPhase } from '@/lib/stillUsTokens';
import { getSliderSet, type CardSliderSet } from '@/data/sliderPrompts';
import { completeSliderCheckin } from '@/lib/stillUsRpc';
import StillUsSlider from '@/components/still-us/StillUsSlider';
import EmberGlowTextarea from '@/components/still-us/EmberGlowTextarea';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

interface SliderCheckInProps {
  cardIndex: number;
  coupleId?: string;
  cardId?: string;
  /** Frontend slug for route navigation (e.g. 'su-01-smallest-we') */
  slug?: string;
  /** Whether format preview has been seen */
  hasSeenFormatPreview?: boolean;
  /** Whether partner is connected */
  hasPartner?: boolean;
  /** Whether partner already completed sliders for this card */
  partnerCompleted?: boolean;
  onBack?: () => void;
}

export default function SliderCheckIn({
  cardIndex,
  coupleId,
  cardId,
  slug,
  hasSeenFormatPreview = false,
  hasPartner = false,
  partnerCompleted = false,
  onBack,
}: SliderCheckInProps) {
  const navigate = useNavigate();
  const sliderSet = getSliderSet(cardIndex);
  const phase = getPhase(cardIndex);
  const layer = getLayerForCard(cardIndex);

  // All sliders default to 50 (center)
  const [values, setValues] = useState<Record<string, number>>(() => {
    if (!sliderSet) return {};
    const init: Record<string, number> = {};
    sliderSet.sliders.forEach((s) => { init[s.sliderId] = 50; });
    return init;
  });
  const [moved, setMoved] = useState<Set<string>>(new Set());
  const [reflection, setReflection] = useState('');
  const [reflectionVisible, setReflectionVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Phase C: textarea always visible
  useEffect(() => {
    if (phase === 'C') setReflectionVisible(true);
  }, [phase]);

  // Cleanup abort controller
  useEffect(() => () => abortRef.current?.abort(), []);

  const atLeastOneMoved = moved.size > 0;

  const handleSliderChange = useCallback((id: string, val: number) => {
    setValues((prev) => ({ ...prev, [id]: val }));
    setMoved((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const maxChars = phase === 'B' ? 200 : 300;

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);

    const controller = new AbortController();
    abortRef.current = controller;

    const sliderResponses = Object.entries(values).map(([sliderId, position]) => ({
      slider_id: sliderId,
      position,
    }));

    const result = await completeSliderCheckin({
      couple_id: coupleId,
      card_id: cardId,
      slider_responses: sliderResponses,
      checkin_reflection: reflection || null,
    });

    if (controller.signal.aborted) return;

    // Show confirmation checkmark
    setShowConfirm(true);
    await new Promise((r) => setTimeout(r, 600));
    if (controller.signal.aborted) return;

    // Navigate based on state
    if (!hasSeenFormatPreview) {
      navigate('/format-preview');
    } else if (!hasPartner) {
      // Solo user who has seen format preview → solo reflection
      navigate(`/solo-reflect/${slug ?? cardId ?? `card_${cardIndex + 1}`}`);
    } else if (result.status === 'ready' || partnerCompleted) {
      // Both completed
      navigate('/');
    } else {
      // Waiting for partner
      navigate('/');
    }
  };

  const handleSkip = async () => {
    if (saving) return;
    setSaving(true);

    const controller = new AbortController();
    abortRef.current = controller;

    const sliderResponses = Object.entries(values).map(([sliderId, position]) => ({
      slider_id: sliderId,
      position,
    }));

    await completeSliderCheckin({
      couple_id: coupleId,
      card_id: cardId,
      slider_responses: sliderResponses,
      checkin_reflection: null,
    });

    if (controller.signal.aborted) return;

    setShowConfirm(true);
    await new Promise((r) => setTimeout(r, 600));
    if (controller.signal.aborted) return;

    if (!hasSeenFormatPreview) {
      navigate('/format-preview');
    } else if (!hasPartner) {
      navigate(`/solo-reflect/${slug ?? cardId ?? `card_${cardIndex + 1}`}`);
    } else {
      navigate('/');
    }
  };

  if (!sliderSet) return null;

  // ── CTA logic ──
  const hasText = reflection.trim().length > 0;
  const textLongEnough = reflection.trim().length >= 10;

  let ctaDisabled = false;
  let ctaLabel = 'Klar';
  let showSkipCta = false;

  if (phase === 'A') {
    ctaDisabled = !atLeastOneMoved;
    ctaLabel = 'Klar';
  } else if (phase === 'B') {
    ctaLabel = hasText ? 'Skicka' : 'Klar';
  } else {
    // Phase C
    if (textLongEnough) {
      ctaLabel = 'Skicka';
    } else {
      showSkipCta = true;
      ctaLabel = 'Skicka'; // won't be shown since showSkipCta
    }
  }

  // Confirmation overlay
  if (showConfirm) {
    return (
      <div
        style={{
          height: '100dvh',
          backgroundColor: COLORS.emberNight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: REDUCED ? 0.01 : 0.3, ease: EASE }}
        >
          <Check size={48} color={COLORS.deepSaffron} strokeWidth={2.5} />
        </motion.div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: COLORS.emberNight,
        display: 'flex',
        flexDirection: 'column',
        padding: '0 24px',
        paddingTop: 'calc(24px + env(safe-area-inset-top, 0px))',
        paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
        overflowY: 'auto',
      }}
    >
      {/* ── Back arrow ── */}
      {onBack && (
        <button
          onClick={onBack}
          aria-label="Tillbaka"
          style={{
            background: 'none',
            border: 'none',
            color: COLORS.lanternGlow,
            fontSize: '20px',
            cursor: 'pointer',
            padding: '4px 0',
            alignSelf: 'flex-start',
            marginBottom: '16px',
          }}
        >
          ←
        </button>
      )}

      {/* ── Week indicator ── */}
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          color: COLORS.deepSaffron,
          margin: '0 0 6px',
        }}
      >
        Vecka {cardIndex + 1}
      </p>

      {/* ── Card title ── */}
      <h1
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '28px',
          fontWeight: 600,
          color: COLORS.lanternGlow,
          lineHeight: 1.2,
          letterSpacing: '-0.02em',
          margin: '0 0 4px',
        }}
      >
        {sliderSet.cardTitle}
      </h1>

      {/* ── Layer context ── */}
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          color: COLORS.driftwood,
          margin: '0 0 28px',
        }}
      >
        {layer.name}
      </p>

      {/* ── Sliders ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {sliderSet.sliders.map((slider, i) => (
          <motion.div
            key={slider.sliderId}
            initial={REDUCED ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4, ease: EASE }}
            style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '15px',
                fontWeight: 500,
                color: COLORS.lanternGlow,
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              {slider.text}
            </p>

            <StillUsSlider
              value={values[slider.sliderId] ?? 50}
              onChange={(v) => handleSliderChange(slider.sliderId, v)}
              leftLabel={slider.leftLabel}
              rightLabel={slider.rightLabel}
              ariaLabel={slider.text}
            />
          </motion.div>
        ))}
      </div>

      {/* ── Privacy note ── */}
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontStyle: 'italic',
          fontSize: '12px',
          color: COLORS.driftwood,
          textAlign: 'center',
          margin: '20px 0 0',
          lineHeight: 1.5,
        }}
      >
        Bara du kan se det här tills ni sätter er ner tillsammans.
      </p>

      {/* ── Phase B/C reflection zone ── */}
      {phase === 'B' && (
        <div style={{ marginTop: '24px' }}>
          {!reflectionVisible ? (
            <button
              onClick={() => setReflectionVisible(true)}
              style={{
                background: 'none',
                border: 'none',
                fontFamily: 'var(--font-sans)',
                fontStyle: 'italic',
                fontSize: '14px',
                color: COLORS.driftwood,
                cursor: 'pointer',
                padding: '8px 0',
                width: '100%',
                textAlign: 'center',
              }}
            >
              Om du vill — en tanke med egna ord
            </button>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={REDUCED ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontStyle: 'italic',
                    fontSize: '14px',
                    color: COLORS.driftwood,
                    margin: '0 0 8px',
                  }}
                >
                  Om du vill — en tanke med egna ord
                </p>
                <EmberGlowTextarea
                  value={reflection}
                  onChange={setReflection}
                  placeholder="Skriv några ord..."
                  maxLength={maxChars}
                  rows={3}
                />
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '11px',
                    color: COLORS.driftwood,
                    textAlign: 'right',
                    margin: '4px 0 0',
                    opacity: 0.7,
                  }}
                >
                  {reflection.length}/{maxChars}
                </p>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      )}

      {phase === 'C' && (
        <div style={{ marginTop: '24px' }}>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '16px',
              color: COLORS.lanternGlow,
              margin: '0 0 8px',
            }}
          >
            Beskriv känslan med ett par ord.
          </p>
          <EmberGlowTextarea
            value={reflection}
            onChange={setReflection}
            placeholder="Berätta lite mer..."
            maxLength={maxChars}
            rows={4}
          />
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              color: COLORS.driftwood,
              textAlign: 'right',
              margin: '4px 0 0',
              opacity: 0.7,
            }}
          >
            {reflection.length}/{maxChars}
          </p>
        </div>
      )}

      {/* ── Spacer ── */}
      <div style={{ flex: 1, minHeight: '24px' }} />

      {/* ── CTA zone ── */}
      <div style={{ paddingBottom: '8px' }}>
        {/* Phase A: disabled hint */}
        {phase === 'A' && !atLeastOneMoved && (
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              color: COLORS.driftwood,
              textAlign: 'center',
              margin: '0 0 16px',
            }}
          >
            Flytta minst en reglage
          </p>
        )}

        {/* Phase C with < 10 chars: skip CTA */}
        {phase === 'C' && showSkipCta ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleSkip}
              disabled={saving}
              style={{
                background: 'none',
                border: 'none',
                fontFamily: 'var(--font-sans)',
                fontSize: '16px',
                color: COLORS.driftwood,
                textDecoration: 'underline',
                cursor: saving ? 'default' : 'pointer',
                padding: '12px 16px',
                opacity: saving ? 0.6 : 1,
                animation: saving && !REDUCED ? 'pulse-opacity 1.5s ease-in-out infinite' : 'none',
              }}
            >
              {saving ? 'Sparar...' : 'Fortsätt utan att skriva'}
            </button>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontStyle: 'italic',
                fontSize: '13px',
                color: COLORS.driftwood,
                opacity: 0.5,
                margin: 0,
                textAlign: 'center',
              }}
            >
              Det behöver inte vara perfekt. Bara ärligt.
            </p>
          </div>
        ) : (
          /* Normal CTA button */
          <button
            onClick={handleSave}
            disabled={ctaDisabled || saving}
            style={{
              width: '100%',
              height: '52px',
              borderRadius: '12px',
              backgroundColor: ctaDisabled ? `${COLORS.deepSaffron}40` : COLORS.bonkiOrange,
              border: 'none',
              cursor: ctaDisabled || saving ? 'default' : 'pointer',
              fontFamily: 'var(--font-sans)',
              fontSize: '16px',
              fontWeight: 600,
              color: COLORS.emberNight,
              opacity: ctaDisabled ? 0.5 : saving ? 0.7 : 1,
              transition: 'opacity 0.2s, background-color 0.2s',
              animation: saving && !REDUCED ? 'pulse-opacity 1.5s ease-in-out infinite' : 'none',
            }}
          >
            {saving ? 'Sparar...' : ctaLabel}
          </button>
        )}
      </div>

      {/* Pulse animation keyframes */}
      <style>{`
        @keyframes pulse-opacity {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
