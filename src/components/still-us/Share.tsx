/**
 * Share — Partner invite / weekly slider share screen (v3.0).
 * Dual purpose: first-time partner invite AND recurring weekly nudge.
 *
 * Route: /share
 * Background: Ember Night (#2E2233)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { COLORS } from '@/lib/stillUsTokens';
import { pollCoupleState, completeSliderCheckin } from '@/lib/stillUsRpc';
import EmberGlowTextarea from '@/components/still-us/EmberGlowTextarea';
import { isTestMode } from '@/lib/testMode';

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const DEFAULT_INVITE_MESSAGE = (link: string) =>
  `Hej. Jag hittade något jag vill prova med dig. Det heter Still Us — 22 veckor av samtal om oss. Börja med en snabb check-in: ${link}`;

interface ShareProps {
  /** Whether partner is already linked */
  hasPartner?: boolean;
  /** The couple_id for polling and link generation */
  coupleId?: string;
  /** Current card_id */
  cardId?: string;
  /** Current card slug for solo-reflect routing */
  cardSlug?: string;
  /** Current card title (for returning layout) */
  cardTitle?: string;
  /** Current week number (1-indexed) */
  weekNumber?: number;
  /** The signed invite/share link */
  shareLink?: string;
}

export default function Share({
  hasPartner = false,
  coupleId,
  cardId,
  cardSlug,
  cardTitle,
  weekNumber = 1,
  shareLink = '',
}: ShareProps) {
  const navigate = useNavigate();
  const [message, setMessage] = useState(() => DEFAULT_INVITE_MESSAGE(shareLink));
  const [copied, setCopied] = useState(false);

  // Update message when shareLink changes
  useEffect(() => {
    if (!hasPartner && shareLink) {
      setMessage(DEFAULT_INVITE_MESSAGE(shareLink));
    }
  }, [shareLink, hasPartner]);

  // ── Polling: watch for partner completing slider ──
  useEffect(() => {
    if (!coupleId) return;

    const stop = pollCoupleState(coupleId, 15_000, (state) => {
      if (!state) return;
      const touch = state.current_touch as string | undefined;
      if (touch === 'session_1') {
        navigate('/?product=still-us');
      }
    });

    return stop;
  }, [coupleId, navigate]);

  const handleShare = useCallback(async () => {
    const textToShare = hasPartner ? shareLink : message;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Still Us',
          text: hasPartner ? undefined : textToShare,
          url: hasPartner ? shareLink : undefined,
        });
        // After successful share, go back to Home
        navigate('/?product=still-us');
      } catch {
        // User cancelled — stay on page
      }
    } else {
      await navigator.clipboard.writeText(textToShare);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        navigate('/?product=still-us');
      }, 1500);
    }
  }, [hasPartner, message, shareLink, navigate]);

  const handleSkip = () => {
    if (cardSlug) {
      navigate(`/solo-reflect/${cardSlug}`);
    } else {
      navigate('/?product=still-us');
    }
  };

  const [simulating, setSimulating] = useState(false);
  const handleSimulatePartner = async () => {
    if (!coupleId || !cardId) return;
    setSimulating(true);
    const dummySliders = [
      { slider_id: 's1', position: 15 + Math.floor(Math.random() * 70) },
      { slider_id: 's2', position: 15 + Math.floor(Math.random() * 70) },
      { slider_id: 's3', position: 15 + Math.floor(Math.random() * 70) },
    ];
    await completeSliderCheckin({
      couple_id: coupleId,
      card_id: cardId,
      slider_responses: dummySliders,
      link_token: shareLink?.split('token=')[1] || undefined,
    });
    setSimulating(false);
    // Polling will pick up the state change and navigate
  };

  return (
    <div
      style={{
        height: '100dvh',
        backgroundColor: COLORS.emberNight,
        display: 'flex',
        flexDirection: 'column',
        padding: '0 28px',
        paddingTop: 'calc(40px + env(safe-area-inset-top, 0px))',
        paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
        overflow: 'auto',
      }}
    >
      {/* ── Headline ── */}
      <motion.h1
        initial={REDUCED ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '26px',
          fontWeight: 600,
          color: COLORS.lanternGlow,
          lineHeight: 1.25,
          letterSpacing: '-0.02em',
          margin: '0 0 12px',
        }}
      >
        {hasPartner ? 'Skicka veckans check-in' : 'Bjud in din partner'}
      </motion.h1>

      {/* ── Body text ── */}
      <motion.p
        initial={REDUCED ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5, ease: EASE }}
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '16px',
          color: `${COLORS.lanternGlow}B3`, // 70% opacity
          lineHeight: 1.6,
          margin: '0 0 24px',
        }}
      >
        {hasPartner
          ? `Din partner behöver göra sin check-in för Vecka ${weekNumber}: ${cardTitle ?? ''}`
          : 'Still Us är gjort för er båda. Du har redan gjort din check-in — nu är det din partners tur.'}
      </motion.p>

      {/* ── First-time: editable message textarea ── */}
      {!hasPartner && (
        <motion.div
          initial={REDUCED ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: EASE }}
          style={{ marginBottom: '8px' }}
        >
          <EmberGlowTextarea
            value={message}
            onChange={setMessage}
            rows={5}
          />
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontStyle: 'italic',
              fontSize: '12px',
              color: COLORS.driftwood,
              margin: '6px 0 0',
            }}
          >
            Skriv om texten så den låter som du.
          </p>
        </motion.div>
      )}

      {/* ── Spacer ── */}
      <div style={{ flex: 1, minHeight: '24px' }} />

      {/* ── Share CTA ── */}
      <motion.div
        initial={REDUCED ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5, ease: EASE }}
      >
        <button
          onClick={handleShare}
          style={{
            width: '100%',
            height: hasPartner ? '48px' : '52px',
            borderRadius: '12px',
            backgroundColor: COLORS.bonkiOrange,
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            fontSize: '16px',
            fontWeight: 600,
            color: COLORS.emberNight,
            transition: 'transform 140ms ease',
          }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {copied ? 'Kopierad!' : hasPartner ? 'Skicka länk' : 'Dela med din partner'}
        </button>

        {/* Test mode: simulate partner check-in — REMOVE BEFORE LAUNCH */}
        {isTestMode() && (
          <button
            onClick={handleSimulatePartner}
            disabled={simulating}
            style={{
              display: 'block',
              width: '100%',
              padding: '12px',
              marginTop: '8px',
              borderRadius: '12px',
              border: '2px dashed #E8913A',
              backgroundColor: 'transparent',
              color: '#E8913A',
              fontSize: '14px',
              fontFamily: 'monospace',
              fontWeight: 600,
              cursor: simulating ? 'default' : 'pointer',
              opacity: simulating ? 0.5 : 1,
            }}
          >
            {simulating ? 'Simulerar…' : 'Test: Simulera partners check-in'}
          </button>
        )}

        {/* ── Skip (first-time only) ── */}
        {!hasPartner && (
          <button
            onClick={handleSkip}
            style={{
              display: 'block',
              width: '100%',
              background: 'none',
              border: 'none',
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              color: COLORS.driftwood,
              cursor: 'pointer',
              padding: '14px 0',
              textAlign: 'center',
            }}
          >
            Jag vill utforska själv först
          </button>
        )}
      </motion.div>
    </div>
  );
}
