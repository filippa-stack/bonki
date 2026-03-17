/**
 * FormatPreview — Post-first-slider onboarding (2-3 slides).
 * Explains the 3-touch weekly rhythm to new users.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE, EMOTION } from '@/lib/motion';
import { EMBER_NIGHT, EMBER_GLOW, DEEP_SAFFRON, DRIFTWOOD, BARK } from '@/lib/palette';

interface FormatPreviewProps {
  onComplete: () => void;
}

const SLIDES = [
  {
    title: 'Varje vecka — tre steg',
    body: 'Ni gör en kort check-in var för sig, och sedan två samtal ihop. Det tar ungefär 5 minuter om dagen.',
    icon: '🔄',
  },
  {
    title: 'Check-in',
    body: 'Ni svarar var för sig på några sliders om hur veckan har varit. Svaren visas när ni sätter er ner ihop.',
    icon: '📊',
  },
  {
    title: 'Två samtal',
    body: 'Första samtalet öppnar upp ämnet. Andra samtalet fördjupar det. Ni bestämmer takten.',
    icon: '💬',
  },
];

export default function FormatPreview({ onComplete }: FormatPreviewProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const isLast = slideIndex === SLIDES.length - 1;
  const slide = SLIDES[slideIndex];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: EMBER_NIGHT,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 32px',
        paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {/* Dots */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '40px' }}>
        {SLIDES.map((_, i) => (
          <div
            key={i}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: i === slideIndex ? DEEP_SAFFRON : `${EMBER_GLOW}30`,
              transition: 'background-color 0.2s',
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={slideIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: EMOTION, ease: [...EASE] }}
          style={{ textAlign: 'center', maxWidth: '320px' }}
        >
          <div style={{ fontSize: '40px', marginBottom: '20px' }}>{slide.icon}</div>

          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '22px',
            fontWeight: 500,
            color: EMBER_GLOW,
            marginBottom: '12px',
          }}>
            {slide.title}
          </h2>

          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            color: DRIFTWOOD,
            lineHeight: 1.6,
          }}>
            {slide.body}
          </p>
        </motion.div>
      </AnimatePresence>

      <div style={{ flex: 1 }} />

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => isLast ? onComplete() : setSlideIndex((i) => i + 1)}
        style={{
          width: '100%',
          maxWidth: '320px',
          height: '52px',
          borderRadius: '12px',
          backgroundColor: DEEP_SAFFRON,
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'var(--font-sans)',
          fontSize: '16px',
          fontWeight: 600,
          color: BARK,
        }}
      >
        {isLast ? 'Sätt igång' : 'Nästa'}
      </motion.button>
    </div>
  );
}
