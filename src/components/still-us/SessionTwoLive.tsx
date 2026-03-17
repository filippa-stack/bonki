/**
 * SessionTwoLive — Session 2 live conversation.
 * Vänd pt 2 (1Q) + Tänk om (1Q).
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE, EMOTION } from '@/lib/motion';
import { EMBER_NIGHT, EMBER_GLOW, DEEP_SAFFRON, DRIFTWOOD, BARK } from '@/lib/palette';
import type { SessionQuestion } from './SessionOneLive';

interface SessionTwoLiveProps {
  cardIndex: number;
  cardTitle: string;
  vandQuestion: SessionQuestion;
  tankOmQuestion: SessionQuestion;
  /** Optional scenario narrative for Tänk om */
  scenario?: string;
  /** Optional Gör instruction */
  gorInstruction?: string;
  gorQuestion?: SessionQuestion;
  onComplete: (notes: Record<string, string>) => void;
  onPause: () => void;
}

type Stage = 'vand' | 'tankom' | 'gor';

export default function SessionTwoLive({
  cardIndex,
  cardTitle,
  vandQuestion,
  tankOmQuestion,
  scenario,
  gorInstruction,
  gorQuestion,
  onComplete,
  onPause,
}: SessionTwoLiveProps) {
  const stages: Stage[] = gorInstruction || gorQuestion ? ['vand', 'tankom', 'gor'] : ['vand', 'tankom'];
  const [stageIdx, setStageIdx] = useState(0);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const stage = stages[stageIdx];
  const isLast = stageIdx === stages.length - 1;

  const stageLabels: Record<Stage, string> = {
    vand: '2. Vänd',
    tankom: '3. Tänk om',
    gor: '4. Gör',
  };

  const currentQuestion = stage === 'vand' ? vandQuestion : stage === 'tankom' ? tankOmQuestion : gorQuestion;
  const noteKey = `s2-${stage}`;

  const handleNext = useCallback(() => {
    if (isLast) {
      onComplete(notes);
    } else {
      setStageIdx((i) => i + 1);
    }
  }, [isLast, notes, onComplete]);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: EMBER_NIGHT,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top nav */}
      <div style={{
        padding: '16px 24px',
        paddingTop: 'calc(16px + env(safe-area-inset-top, 0px))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <button
          onClick={onPause}
          style={{ background: 'none', border: 'none', color: DRIFTWOOD, fontFamily: 'var(--font-sans)', fontSize: '14px', cursor: 'pointer' }}
        >
          Pausa
        </button>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: DRIFTWOOD }}>
          Del 2 av 2
        </span>
      </div>

      {/* Stage progress */}
      <div style={{ display: 'flex', gap: '8px', padding: '0 24px', marginBottom: '8px' }}>
        {stages.map((s, i) => (
          <div
            key={s}
            style={{
              flex: 1,
              height: '3px',
              borderRadius: '2px',
              backgroundColor: i <= stageIdx ? DEEP_SAFFRON : `${EMBER_GLOW}20`,
              transition: 'background-color 0.3s',
            }}
          />
        ))}
      </div>

      <div style={{
        padding: '0 24px',
        marginBottom: '8px',
        fontFamily: 'var(--font-sans)',
        fontSize: '13px',
        fontWeight: 600,
        color: `${EMBER_GLOW}70`,
      }}>
        {stageLabels[stage]}
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px',
        maxWidth: '520px',
        margin: '0 auto',
        width: '100%',
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: EMOTION, ease: [...EASE] }}
            style={{ width: '100%', textAlign: 'center' }}
          >
            {/* Scenario text for Tänk om */}
            {stage === 'tankom' && scenario && (
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                color: `${EMBER_GLOW}70`,
                lineHeight: 1.6,
                marginBottom: '20px',
                fontStyle: 'italic',
              }}>
                {scenario}
              </p>
            )}

            {/* Gör instruction */}
            {stage === 'gor' && gorInstruction && (
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                color: `${EMBER_GLOW}70`,
                lineHeight: 1.6,
                marginBottom: '20px',
              }}>
                {gorInstruction}
              </p>
            )}

            {currentQuestion && (
              <p style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '22px',
                fontWeight: 500,
                color: EMBER_GLOW,
                lineHeight: 1.4,
                textWrap: 'balance',
                marginBottom: '20px',
              }}>
                {currentQuestion.text}
              </p>
            )}

            {currentQuestion && (
              <input
                type="text"
                placeholder="Fäst en tanke..."
                value={notes[noteKey] ?? ''}
                onChange={(e) => setNotes((prev) => ({ ...prev, [noteKey]: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  backgroundColor: `${EMBER_GLOW}10`,
                  border: `1px solid ${EMBER_GLOW}15`,
                  color: EMBER_GLOW,
                  fontFamily: 'var(--font-sans)',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CTA */}
      <div style={{
        padding: '0 24px',
        paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
      }}>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
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
            color: BARK,
          }}
        >
          {isLast ? 'Avsluta samtalet' : 'Nästa'}
        </motion.button>
      </div>
    </div>
  );
}
