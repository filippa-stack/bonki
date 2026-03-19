/**
 * TillbakaSessionLive — Simplified 2-question maintenance session.
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE, EMOTION } from '@/lib/motion';
import { COLORS } from '@/lib/stillUsTokens';

interface TillbakaSessionLiveProps {
  tillbakaIndex: number;
  title: string;
  question1: string;
  question2: string;
  onComplete: (notes: Record<string, string>) => void;
  onPause: () => void;
}

export default function TillbakaSessionLive({
  tillbakaIndex,
  title,
  question1,
  question2,
  onComplete,
  onPause,
}: TillbakaSessionLiveProps) {
  const questions = [question1, question2];
  const [qIdx, setQIdx] = useState(0);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const isLast = qIdx === questions.length - 1;
  const noteKey = `tb-${qIdx}`;

  const handleNext = useCallback(() => {
    if (isLast) {
      onComplete(notes);
    } else {
      setQIdx((i) => i + 1);
    }
  }, [isLast, notes, onComplete]);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: EMBER_NIGHT,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        padding: '16px 24px',
        paddingTop: 'calc(16px + env(safe-area-inset-top, 0px))',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <button onClick={onPause} style={{ background: 'none', border: 'none', color: DRIFTWOOD, fontFamily: 'var(--font-sans)', fontSize: '14px', cursor: 'pointer' }}>
          Pausa
        </button>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: DRIFTWOOD }}>
          {title}
        </span>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', gap: '8px', padding: '0 24px', marginBottom: '24px' }}>
        {questions.map((_, i) => (
          <div key={i} style={{
            flex: 1, height: '3px', borderRadius: '2px',
            backgroundColor: i <= qIdx ? DEEP_SAFFRON : `${EMBER_GLOW}20`,
          }} />
        ))}
      </div>

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
            key={qIdx}
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
              {questions[qIdx]}
            </p>

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

      <div style={{ padding: '0 24px', paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}>
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
          {isLast ? 'Avsluta' : 'Nästa'}
        </motion.button>
      </div>
    </div>
  );
}
