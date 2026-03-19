/**
 * Tier2Setup — Partner name collection for Tier 2 (same device).
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { EASE, EMOTION } from '@/lib/motion';
import { COLORS } from '@/lib/stillUsTokens';

interface Tier2SetupProps {
  onComplete: (partnerName: string) => void;
  onBack?: () => void;
}

export default function Tier2Setup({ onComplete, onBack }: Tier2SetupProps) {
  const [name, setName] = useState('');

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
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: EMOTION, ease: [...EASE] }}
        style={{ textAlign: 'center', maxWidth: '340px', width: '100%' }}
      >
        <h2 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '24px',
          fontWeight: 500,
          color: EMBER_GLOW,
          marginBottom: '12px',
        }}>
          Vad heter din partner?
        </h2>

        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '15px',
          color: DRIFTWOOD,
          lineHeight: 1.6,
          marginBottom: '28px',
        }}>
          Ni delar telefon för check-in. Vi behöver ett namn så vi vet vems tur det är.
        </p>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Partnerns namn"
          autoFocus
          style={{
            width: '100%',
            padding: '14px 16px',
            borderRadius: '12px',
            backgroundColor: `${EMBER_GLOW}12`,
            border: `1px solid ${EMBER_GLOW}20`,
            color: EMBER_GLOW,
            fontFamily: 'var(--font-sans)',
            fontSize: '16px',
            outline: 'none',
            textAlign: 'center',
            marginBottom: '24px',
          }}
        />

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => onComplete(name.trim())}
          disabled={!name.trim()}
          style={{
            width: '100%',
            height: '52px',
            borderRadius: '12px',
            backgroundColor: name.trim() ? DEEP_SAFFRON : `${DEEP_SAFFRON}40`,
            border: 'none',
            cursor: name.trim() ? 'pointer' : 'default',
            fontFamily: 'var(--font-sans)',
            fontSize: '16px',
            fontWeight: 600,
            color: BARK,
            opacity: name.trim() ? 1 : 0.5,
          }}
        >
          Fortsätt
        </motion.button>

        {onBack && (
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              color: DRIFTWOOD,
              cursor: 'pointer',
              marginTop: '12px',
              padding: '8px',
            }}
          >
            Tillbaka
          </button>
        )}
      </motion.div>
    </div>
  );
}
