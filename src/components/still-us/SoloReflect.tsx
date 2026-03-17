/**
 * SoloReflect — Solo-mode bridge reflection.
 * Shown when user is doing the program without a partner.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { EASE, EMOTION } from '@/lib/motion';
import { EMBER_NIGHT, EMBER_GLOW, DEEP_SAFFRON, DRIFTWOOD, BARK } from '@/lib/palette';
import { getSoloReflectionPrompt } from '@/data/soloReflectionPrompts';

interface SoloReflectProps {
  cardIndex: number;
  onComplete: (text: string) => void;
  onSkip: () => void;
}

export default function SoloReflect({ cardIndex, onComplete, onSkip }: SoloReflectProps) {
  const [text, setText] = useState('');
  const prompt = getSoloReflectionPrompt(cardIndex);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: EMBER_NIGHT,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 32px',
      paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: EMOTION, ease: [...EASE] }}
        style={{ maxWidth: '340px', width: '100%' }}
      >
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          color: DRIFTWOOD,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '8px',
        }}>
          Solo-reflektion
        </p>

        <p style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '20px',
          fontWeight: 500,
          color: EMBER_GLOW,
          lineHeight: 1.4,
          textWrap: 'balance',
          marginBottom: '24px',
        }}>
          {prompt}
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Skriv fritt..."
          rows={5}
          style={{
            width: '100%',
            padding: '14px 16px',
            borderRadius: '12px',
            backgroundColor: `${EMBER_GLOW}12`,
            border: `1px solid ${EMBER_GLOW}20`,
            color: EMBER_GLOW,
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            lineHeight: 1.5,
            resize: 'none',
            outline: 'none',
            marginBottom: '24px',
          }}
        />

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => onComplete(text)}
          disabled={!text.trim()}
          style={{
            width: '100%',
            height: '52px',
            borderRadius: '12px',
            backgroundColor: text.trim() ? DEEP_SAFFRON : `${DEEP_SAFFRON}40`,
            border: 'none',
            cursor: text.trim() ? 'pointer' : 'default',
            fontFamily: 'var(--font-sans)',
            fontSize: '16px',
            fontWeight: 600,
            color: BARK,
            opacity: text.trim() ? 1 : 0.5,
            marginBottom: '8px',
          }}
        >
          Spara
        </motion.button>

        <button
          onClick={onSkip}
          style={{
            background: 'none',
            border: 'none',
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            color: DRIFTWOOD,
            cursor: 'pointer',
            padding: '8px',
            display: 'block',
            margin: '0 auto',
          }}
        >
          Hoppa över
        </button>
      </motion.div>
    </div>
  );
}
