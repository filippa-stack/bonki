/**
 * SessionOneLive — Session 1 live conversation screen.
 * Öppna (2 questions) + Vänd pt 1 (1 question) with threshold framing.
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE, EMOTION, BEAT_2 } from '@/lib/motion';
import { EMBER_NIGHT, EMBER_GLOW, DEEP_SAFFRON, DRIFTWOOD, BARK } from '@/lib/palette';

export interface SessionQuestion {
  text: string;
  /** Optional situational anchor */
  anchor?: string;
}

interface SessionOneLiveProps {
  cardIndex: number;
  cardTitle: string;
  /** Öppna questions (typically 2) */
  oppnaQuestions: SessionQuestion[];
  /** Vänd part 1 question (typically 1) */
  vandQuestion: SessionQuestion;
  /** Threshold framing text */
  framingTitle?: string;
  framingBody?: string;
  onComplete: (notes: Record<string, string>) => void;
  onPause: () => void;
}

type Stage = 'oppna' | 'vand';

export default function SessionOneLive({
  cardIndex,
  cardTitle,
  oppnaQuestions,
  vandQuestion,
  framingTitle,
  framingBody,
  onComplete,
  onPause,
}: SessionOneLiveProps) {
  const [stage, setStage] = useState<Stage>('oppna');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [showAnchor, setShowAnchor] = useState(false);

  const currentQuestion = stage === 'oppna'
    ? oppnaQuestions[questionIndex]
    : vandQuestion;

  const stageLabel = stage === 'oppna' ? '1. Öppna' : '2. Vänd';
  const totalOppna = oppnaQuestions.length;

  const noteKey = `${stage}-${questionIndex}`;

  const handleNext = useCallback(() => {
    setShowAnchor(false);

    if (stage === 'oppna') {
      if (questionIndex < totalOppna - 1) {
        setQuestionIndex((i) => i + 1);
      } else {
        setStage('vand');
        setQuestionIndex(0);
      }
    } else {
      // Vänd complete → session 1 done
      onComplete(notes);
    }
  }, [stage, questionIndex, totalOppna, notes, onComplete]);

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
          Del 1 av 2
        </span>
      </div>

      {/* Stage tabs */}
      <div style={{ display: 'flex', gap: '8px', padding: '0 24px', marginBottom: '8px' }}>
        {['oppna', 'vand'].map((s) => (
          <div
            key={s}
            style={{
              flex: 1,
              height: '3px',
              borderRadius: '2px',
              backgroundColor: s === stage || (s === 'oppna' && stage === 'vand')
                ? DEEP_SAFFRON
                : `${EMBER_GLOW}20`,
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
        {stageLabel}
      </div>

      {/* Question content */}
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
            key={`${stage}-${questionIndex}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: EMOTION, ease: [...EASE] }}
            style={{ width: '100%', textAlign: 'center' }}
          >
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '22px',
              fontWeight: 500,
              color: EMBER_GLOW,
              lineHeight: 1.4,
              textWrap: 'balance',
              marginBottom: '20px',
            }}>
              {currentQuestion?.text}
            </p>

            {/* Anchor toggle */}
            {currentQuestion?.anchor && (
              <div style={{ marginBottom: '20px' }}>
                <button
                  onClick={() => setShowAnchor(!showAnchor)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    color: DRIFTWOOD,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                  }}
                >
                  {showAnchor ? 'Dölj kontext' : 'Visa kontext'}
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
                        color: `${EMBER_GLOW}80`,
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

            {/* "Fäst en tanke" note */}
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
          {stage === 'vand' ? 'Avsluta del 1' : 'Nästa'}
        </motion.button>
      </div>
    </div>
  );
}
