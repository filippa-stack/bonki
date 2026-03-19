/**
 * JourneyProgress — 22-dot progress bar for the Still Us home screen.
 * Shows completed, current, and upcoming cards with layer groupings.
 */

import { motion } from 'framer-motion';
import { EASE, BEAT_1 } from '@/lib/motion';
import { COLORS } from '@/lib/stillUsTokens';
import { LAYERS, TOTAL_PROGRAM_CARDS } from '@/data/stillUsSequence';

interface JourneyProgressProps {
  currentCardIndex: number;
  /** Dark background mode (Ember Night) */
  dark?: boolean;
}

export default function JourneyProgress({ currentCardIndex, dark = false }: JourneyProgressProps) {
  const dotColor = (index: number) => {
    if (index < currentCardIndex) return DEEP_SAFFRON;
    if (index === currentCardIndex) return EMBER_GLOW;
    return dark ? `${EMBER_GLOW}25` : `${DRIFTWOOD}30`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
      {/* Layer label */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          fontWeight: 600,
          color: dark ? DRIFTWOOD : 'var(--text-tertiary)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          {LAYERS.find((l) => (l.cards as readonly number[]).includes(currentCardIndex))?.name ?? ''}
        </span>
      </div>

      {/* Dots */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '4px',
        flexWrap: 'wrap',
      }}>
        {Array.from({ length: TOTAL_PROGRAM_CARDS }, (_, i) => {
          const isLayerBoundary = LAYERS.some((l) => (l.cards as readonly number[])[0] === i && i > 0);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              {isLayerBoundary && <div style={{ width: '6px' }} />}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.02, duration: 0.2, ease: [...EASE] }}
                style={{
                  width: i === currentCardIndex ? '10px' : '7px',
                  height: i === currentCardIndex ? '10px' : '7px',
                  borderRadius: '50%',
                  backgroundColor: dotColor(i),
                  transition: 'all 0.3s',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Week label */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2px' }}>
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '12px',
          color: dark ? `${EMBER_GLOW}80` : 'var(--text-secondary)',
        }}>
          Vecka {currentCardIndex + 1} av {TOTAL_PROGRAM_CARDS}
        </span>
      </div>
    </div>
  );
}
