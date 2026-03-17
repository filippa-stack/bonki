/**
 * SliderReveal — Dual-position reveal shown at start of Session 1.
 * Shows both partners' slider positions side by side.
 */

import { motion } from 'framer-motion';
import { EASE, EMOTION, BEAT_1 } from '@/lib/motion';
import { EMBER_NIGHT, EMBER_GLOW, DEEP_SAFFRON, DRIFTWOOD } from '@/lib/palette';
import type { SliderPrompt } from '@/data/sliderPrompts';

interface SliderRevealProps {
  sliders: SliderPrompt[];
  userValues: Record<string, number>;
  partnerValues: Record<string, number>;
  partnerName?: string;
  /** Phase B/C: user and partner reflections */
  userReflection?: string;
  partnerReflection?: string;
  onContinue: () => void;
}

export default function SliderReveal({
  sliders,
  userValues,
  partnerValues,
  partnerName = 'Din partner',
  userReflection,
  partnerReflection,
  onContinue,
}: SliderRevealProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: EMBER_NIGHT,
        display: 'flex',
        flexDirection: 'column',
        padding: '0 24px',
        paddingTop: 'calc(32px + env(safe-area-inset-top, 0px))',
        paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: EMOTION, ease: [...EASE] }}
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '22px',
          fontWeight: 500,
          color: EMBER_GLOW,
          marginBottom: '32px',
          textWrap: 'balance',
        }}
      >
        Så svarade ni
      </motion.h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {sliders.map((slider, i) => (
          <motion.div
            key={slider.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * BEAT_1, duration: EMOTION, ease: [...EASE] }}
          >
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              color: EMBER_GLOW,
              marginBottom: '12px',
              fontWeight: 500,
            }}>
              {slider.text}
            </p>

            {/* Dual track */}
            <div style={{ position: 'relative', height: '32px', marginBottom: '4px' }}>
              {/* Track */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: '4px',
                transform: 'translateY(-50%)',
                backgroundColor: `${EMBER_GLOW}20`,
                borderRadius: '2px',
              }} />

              {/* User dot */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * BEAT_1 + 0.15, duration: 0.25, ease: [...EASE] }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: `${userValues[slider.id] ?? 50}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: DEEP_SAFFRON,
                  border: `2px solid ${EMBER_NIGHT}`,
                }}
              />

              {/* Partner dot */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * BEAT_1 + 0.3, duration: 0.25, ease: [...EASE] }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: `${partnerValues[slider.id] ?? 50}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: EMBER_GLOW,
                  border: `2px solid ${EMBER_NIGHT}`,
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: DRIFTWOOD }}>{slider.labelMin}</span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: DRIFTWOOD }}>{slider.labelMax}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '24px', justifyContent: 'center' }}>
        <LegendDot color={DEEP_SAFFRON} label="Du" />
        <LegendDot color={EMBER_GLOW} label={partnerName} />
      </div>

      {/* Reflections (Phase B/C) */}
      {(userReflection || partnerReflection) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: EMOTION }}
          style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          {userReflection && (
            <ReflectionBubble label="Du" text={userReflection} />
          )}
          {partnerReflection && (
            <ReflectionBubble label={partnerName} text={partnerReflection} />
          )}
        </motion.div>
      )}

      <div style={{ flex: 1 }} />

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onContinue}
        style={{
          width: '100%',
          height: '52px',
          borderRadius: '12px',
          backgroundColor: DEEP_SAFFRON,
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'var(--font-sans)',
          fontSize: '16px',
          fontWeight: 600,
          color: '#2C2420',
        }}
      >
        Starta samtalet
      </motion.button>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: color }} />
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: DRIFTWOOD }}>{label}</span>
    </div>
  );
}

function ReflectionBubble({ label, text }: { label: string; text: string }) {
  return (
    <div style={{
      padding: '14px 16px',
      borderRadius: '12px',
      backgroundColor: `${EMBER_GLOW}10`,
      border: `1px solid ${EMBER_GLOW}15`,
    }}>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: DRIFTWOOD, marginBottom: '4px', fontWeight: 600 }}>
        {label}
      </p>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: EMBER_GLOW, lineHeight: 1.5 }}>
        {text}
      </p>
    </div>
  );
}
