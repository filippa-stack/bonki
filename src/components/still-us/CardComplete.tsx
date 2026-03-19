/**
 * CardComplete — Card completion screen with takeaway capture + partner handoff + advance_card.
 * Phase flow: takeaway → handoff → partner_writing → committing.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EASE, EMOTION } from '@/lib/motion';
import { COLORS, cardIdFromSlug, FEEDBACK_CARDS } from '@/lib/stillUsTokens';
import { advanceCard, buildSliderAnchors } from '@/lib/stillUsRpc';
import FeedbackSheet from '@/components/FeedbackSheet';

type Phase = 'takeaway' | 'handoff' | 'partner_writing' | 'committing';

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
  coupleId,
  partnerName,
  partnerTier,
}: CardCompleteProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (cardIndex === 21) {
      navigate('/ceremony', { replace: true });
    }
  }, [cardIndex, navigate]);

  const [takeaway, setTakeaway] = useState('');
  const [phase, setPhase] = useState<Phase>('takeaway');
  const [partnerTakeaway, setPartnerTakeaway] = useState<string | null>(null);
  const [partnerText, setPartnerText] = useState('');
  const [gorExpanded, setGorExpanded] = useState(false);
  const [handoffReady, setHandoffReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const weekNumber = cardIndex + 1;

  // Feedback sheet trigger for specific cards
  useEffect(() => {
    if (FEEDBACK_CARDS.includes(cardIndex)) {
      const timer = setTimeout(() => setShowFeedback(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [cardIndex]);

  // Clear feedback on phase change away from takeaway
  useEffect(() => {
    if (phase !== 'takeaway') setShowFeedback(false);
  }, [phase]);

  // 3-second safety delay for handoff
  useEffect(() => {
    if (phase !== 'handoff') {
      setHandoffReady(false);
      return;
    }
    const t = setTimeout(() => setHandoffReady(true), 3000);
    return () => clearTimeout(t);
  }, [phase]);

  const fireAdvanceCard = useCallback(async (myTakeaway: string, theirTakeaway: string | null) => {
    setPhase('committing');
    setError(null);
    const backendCardId = cardIdFromSlug(slug);
    if (!backendCardId) {
      setError('Något gick fel. Försök igen.');
      return;
    }
    try {
      const nextIndex = cardIndex + 1;
      const result = await advanceCard({
        couple_id: coupleId,
        card_id: backendCardId,
        takeaway: myTakeaway || null,
        partner_takeaway: theirTakeaway,
        ...(nextIndex <= 21 ? { slider_anchors: buildSliderAnchors(nextIndex) } : {}),
      });
      if (result.status === 'ceremony') {
        navigate('/ceremony', { replace: true });
      } else if (result.status === 'error') {
        setError('Något gick fel. Försök igen.');
      } else {
        navigate('/', { replace: true });
      }
    } catch {
      setError('Något gick fel. Försök igen.');
    }
  }, [slug, coupleId, navigate]);

  if (cardIndex === 21) return null;

  const displayName = partnerName || 'din partner';

  // ── Committing phase (loading / error) ──
  if (phase === 'committing') {
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
        {error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ maxWidth: '360px', width: '100%', textAlign: 'center' }}
          >
            <p style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '18px',
              color: COLORS.lanternGlow,
              marginBottom: '24px',
            }}>
              {error}
            </p>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => fireAdvanceCard(takeaway, partnerTakeaway)}
              style={{
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
              Försök igen
            </motion.button>
          </motion.div>
        ) : (
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '16px',
            color: COLORS.driftwood,
            opacity: 0.5,
          }}>
            Sparar...
          </p>
        )}
      </div>
    );
  }

  // ── Partner writing sub-phase ──
  if (phase === 'partner_writing') {
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
          style={{ maxWidth: '360px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <p style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: '16px',
            color: COLORS.lanternGlow,
            textAlign: 'center',
            margin: 0,
          }}>
            {displayName}s tanke:
          </p>

          <textarea
            value={partnerText}
            onChange={(e) => setPartnerText(e.target.value)}
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

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const val = partnerText.trim() || null;
              setPartnerTakeaway(val);
              fireAdvanceCard(takeaway, val);
            }}
            style={{
              marginTop: '24px',
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
            Klar
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ── Handoff phase ──
  if (phase === 'handoff') {
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
          style={{ maxWidth: '360px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: '22px',
            color: COLORS.lanternGlow,
            textAlign: 'center',
            margin: 0,
            lineHeight: 1.3,
          }}>
            Vill {displayName} också skriva något?
          </h1>

          <p style={{
            fontSize: '14px',
            color: COLORS.lanternGlow,
            opacity: 0.7,
            textAlign: 'center',
            marginTop: '8px',
            fontFamily: 'var(--font-sans)',
          }}>
            Lämna över telefonen — eller hoppa över.
          </p>

          <motion.button
            whileTap={handoffReady ? { scale: 0.98 } : undefined}
            onClick={() => {
              if (handoffReady) setPhase('partner_writing');
            }}
            style={{
              marginTop: '32px',
              width: '100%',
              maxWidth: '320px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: COLORS.deepSaffron,
              border: 'none',
              cursor: handoffReady ? 'pointer' : 'not-allowed',
              opacity: handoffReady ? 1 : 0.5,
              fontFamily: 'var(--font-sans)',
              fontSize: '16px',
              fontWeight: 600,
              color: '#FFFFFF',
              transition: 'opacity 0.3s ease',
            }}
          >
            Lämna över
          </motion.button>

          <button
            onClick={() => {
              setPartnerTakeaway(null);
              fireAdvanceCard(takeaway, null);
            }}
            style={{
              marginTop: '16px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: COLORS.driftwood,
              fontSize: '14px',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Hoppa över
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Takeaway phase (default) ──
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

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setPhase('handoff')}
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

      {showFeedback && (
        <FeedbackSheet
          coupleId={coupleId}
          cardId={cardIdFromSlug(slug) || ''}
          cardIndex={cardIndex}
          onDismiss={() => setShowFeedback(false)}
        />
      )}
    </div>
  );
}
