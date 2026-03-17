/**
 * SliderCheckIn — Phase A/B/C slider check-in screen.
 * Touch 1 of the 3-touch rhythm.
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE, EMOTION, PAGE } from '@/lib/motion';
import { EMBER_NIGHT, EMBER_GLOW, DEEP_SAFFRON, BARK, DRIFTWOOD } from '@/lib/palette';
import { Slider } from '@/components/ui/slider';
import { getSliderSet, type CardSliderSet } from '@/data/sliderPrompts';
import { getSliderPhase, type SliderPhase } from '@/data/stillUsSequence';

interface SliderCheckInProps {
  cardIndex: number;
  onComplete: (responses: Record<string, number>, reflection?: string) => void;
  onBack?: () => void;
}

export default function SliderCheckIn({ cardIndex, onComplete, onBack }: SliderCheckInProps) {
  const sliderSet = getSliderSet(cardIndex);
  const phase = getSliderPhase(cardIndex);
  const [values, setValues] = useState<Record<string, number>>({});
  const [reflection, setReflection] = useState('');
  const [step, setStep] = useState<'sliders' | 'reflection'>('sliders');

  const allSlidersAnswered = sliderSet
    ? sliderSet.sliders.every((s) => values[s.id] !== undefined)
    : false;

  const handleSliderChange = useCallback((id: string, val: number[]) => {
    setValues((prev) => ({ ...prev, [id]: val[0] }));
  }, []);

  const handleNext = () => {
    if (phase !== 'A' && sliderSet?.reflectionPrompt && step === 'sliders') {
      setStep('reflection');
      return;
    }
    onComplete(values, reflection || undefined);
  };

  if (!sliderSet) return null;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: EMBER_NIGHT,
        display: 'flex',
        flexDirection: 'column',
        padding: '0 24px',
        paddingTop: 'calc(24px + env(safe-area-inset-top, 0px))',
        paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', color: DRIFTWOOD, fontFamily: 'var(--font-sans)', fontSize: '14px', cursor: 'pointer' }}
          >
            ← Tillbaka
          </button>
        )}
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: DRIFTWOOD, marginLeft: 'auto' }}>
          Vecka {cardIndex + 1} · Check-in
        </span>
      </div>

      <AnimatePresence mode="wait">
        {step === 'sliders' ? (
          <SlidersView
            key="sliders"
            sliderSet={sliderSet}
            values={values}
            onSliderChange={handleSliderChange}
          />
        ) : (
          <ReflectionView
            key="reflection"
            prompt={sliderSet.reflectionPrompt!}
            value={reflection}
            onChange={setReflection}
            phase={phase}
          />
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* CTA */}
      <motion.button
        onClick={handleNext}
        disabled={step === 'sliders' && !allSlidersAnswered}
        whileTap={{ scale: 0.98 }}
        style={{
          width: '100%',
          height: '52px',
          borderRadius: '12px',
          backgroundColor: allSlidersAnswered || step === 'reflection' ? DEEP_SAFFRON : `${DEEP_SAFFRON}40`,
          border: 'none',
          cursor: allSlidersAnswered || step === 'reflection' ? 'pointer' : 'default',
          fontFamily: 'var(--font-sans)',
          fontSize: '16px',
          fontWeight: 600,
          color: BARK,
          opacity: allSlidersAnswered || step === 'reflection' ? 1 : 0.5,
          transition: 'opacity 0.2s, background-color 0.2s',
          marginBottom: '8px',
        }}
      >
        {step === 'sliders' && phase !== 'A' && sliderSet.reflectionPrompt ? 'Nästa' : 'Klar'}
      </motion.button>

      {step === 'reflection' && (
        <button
          onClick={() => onComplete(values, undefined)}
          style={{
            background: 'none',
            border: 'none',
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            color: DRIFTWOOD,
            cursor: 'pointer',
            padding: '8px',
            alignSelf: 'center',
          }}
        >
          Hoppa över
        </button>
      )}
    </div>
  );
}

/* ── Sub-components ── */

function SlidersView({
  sliderSet,
  values,
  onSliderChange,
}: {
  sliderSet: CardSliderSet;
  values: Record<string, number>;
  onSliderChange: (id: string, val: number[]) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: EMOTION, ease: [...EASE] }}
      style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '24px',
          fontWeight: 500,
          color: EMBER_GLOW,
          textWrap: 'balance',
          lineHeight: 1.35,
        }}
      >
        Hur har veckan varit?
      </h2>

      {sliderSet.sliders.map((slider, i) => (
        <motion.div
          key={slider.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: EMOTION, ease: [...EASE] }}
          style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
        >
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            fontWeight: 500,
            color: EMBER_GLOW,
            lineHeight: 1.5,
          }}>
            {slider.text}
          </p>

          <Slider
            min={0}
            max={100}
            step={1}
            value={values[slider.id] !== undefined ? [values[slider.id]] : [50]}
            onValueChange={(val) => onSliderChange(slider.id, val)}
            className="w-full [&_[data-orientation=horizontal]]:h-2 [&_[role=slider]]:h-6 [&_[role=slider]]:w-6 [&_[role=slider]]:border-2"
            style={{ '--slider-track': EMBER_GLOW + '30', '--slider-range': DEEP_SAFFRON, '--slider-thumb': EMBER_GLOW } as React.CSSProperties}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: DRIFTWOOD }}>{slider.labelMin}</span>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: DRIFTWOOD }}>{slider.labelMax}</span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

function ReflectionView({
  prompt,
  value,
  onChange,
  phase,
}: {
  prompt: string;
  value: string;
  onChange: (v: string) => void;
  phase: SliderPhase;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: EMOTION, ease: [...EASE] }}
      style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
    >
      <p style={{
        fontFamily: 'var(--font-serif)',
        fontSize: '20px',
        fontWeight: 500,
        color: EMBER_GLOW,
        lineHeight: 1.4,
        textWrap: 'balance',
      }}>
        {prompt}
      </p>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={phase === 'B' ? 'Skriv några ord...' : 'Berätta lite mer...'}
        rows={4}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: '12px',
          backgroundColor: `${EMBER_GLOW}15`,
          border: `1px solid ${EMBER_GLOW}25`,
          color: EMBER_GLOW,
          fontFamily: 'var(--font-sans)',
          fontSize: '15px',
          lineHeight: 1.6,
          resize: 'none',
          outline: 'none',
        }}
      />
    </motion.div>
  );
}
