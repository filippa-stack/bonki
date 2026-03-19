/**
 * CardComplete — Card completion screen with takeaway capture.
 * Phase flow: takeaway → handoff → committing (handoff + RPC in 4.3b).
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EASE, EMOTION } from '@/lib/motion';
import { COLORS } from '@/lib/stillUsTokens';

type Phase = 'takeaway' | 'handoff' | 'committing';

interface CardCompleteProps {
  slug: string;
  cardIndex: number;
  cardTitle: string;
  coupleId: string;
  deviceId: string;
  partnerName: string;
  partnerTier: string;
}

function getHeadline(i: number): string {
  if (i <= 6) return 'Varje samtal är ett val. Ni valde rätt.';
  if (i <= 13) return 'Ni går djupare nu. Det märks.';
  return 'Det ni gör är ovanligt. De flesta slutar försöka.';
}

export default function CardComplete({
  slug,
  cardIndex,
  cardTitle,
  coupleId,
  deviceId,
  partnerName,
  partnerTier,
}: CardCompleteProps) {
  const navigate = useNavigate();

  // Card 22 guard
  useEffect(() => {
    if (cardIndex === 21) {
      navigate('/ceremony', { replace: true });
    }
  }, [cardIndex, navigate]);

  const [takeaway, setTakeaway] = useState('');
  const [phase, setPhase] = useState<Phase>('takeaway');
  const [partnerTakeaway, setPartnerTakeaway] = useState<string | null>(null);
  const [gorExpanded, setGorExpanded] = useState(false);

  const weekNumber = cardIndex + 1;

  // Don't render for card 22
  if (cardIndex === 21) return null;

  // Only render takeaway phase for now (handoff + committing in 4.3b)
  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: COLORS.emberNight,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: EMOTION, ease: [...EASE] }}
        style={{
          maxWidth: '360px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Week badge */}
        <p style={{
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          color: COLORS.deepSaffron,
          textAlign: 'center',
          margin: 0,
          fontFamily: 'var(--font-sans)',
          fontWeight: 600,
        }}>
          VECKA {weekNumber} KLAR
        </p>

        {/* Headline */}
        <h1 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: '24px',
          color: COLORS.lanternGlow,
          textAlign: 'center',
          marginTop: '16px',
          lineHeight: 1.3,
        }}>
          {getHeadline(cardIndex)}
        </h1>

        {/* Takeaway prompt */}
        <div style={{ marginTop: '32px', width: '100%' }}>
          <p style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: '16px',
            color: `${COLORS.lanternGlow}B3`,
            textAlign: 'center',
            margin: 0,
          }}>
            Något ni vill minnas från den här veckan?
          </p>

          <textarea
            value={takeaway}
            onChange={(e) => setTakeaway(e.target.value)}
            placeholder="Skriv här..."
            style={{
              width: '100%',
              minHeight: '80px',
              marginTop: '16px',
              backgroundColor: COLORS.emberGlow,
              color: COLORS.lanternGlow,
              fontSize: '14px',
              borderRadius: '12px',
              border: 'none',
              padding: '16px',
              fontFamily: 'var(--font-sans)',
              resize: 'vertical',
              outline: 'none',
              lineHeight: 1.5,
            }}
          />
        </div>

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            console.log('CardComplete Phase 1 done — takeaway stored, ready for handoff');
            // 4.3b will replace this with handoff flow
          }}
          style={{
            marginTop: '32px',
            width: '100%',
            maxWidth: '320px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: COLORS.deepSaffron,
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            fontSize: '16px',
            fontWeight: 600,
            color: '#FFFFFF',
          }}
        >
          Tillbaka hem
        </motion.button>
      </motion.div>
    </div>
  );
}
