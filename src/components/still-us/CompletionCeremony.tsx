/**
 * CompletionCeremony — 5-screen post-journey ceremony after card 22.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE, EMOTION } from '@/lib/motion';
import { COLORS } from '@/lib/stillUsTokens';

interface CompletionCeremonyProps {
  partnerName?: string;
  totalWeeks: number;
  /** Pre-computed insights from journey_insights_cache */
  insights?: {
    totalSessions: number;
    favoriteLayer?: string;
    longestStreak?: number;
  };
  onComplete: (reflection?: string) => void;
}

interface CeremonyScreen {
  title: string;
  body: string;
  showReflection?: boolean;
}

export default function CompletionCeremony({
  partnerName = 'din partner',
  totalWeeks,
  insights,
  onComplete,
}: CompletionCeremonyProps) {
  const [screenIndex, setScreenIndex] = useState(0);
  const [reflection, setReflection] = useState('');

  const screens: CeremonyScreen[] = [
    {
      title: '22 veckor ✨',
      body: `Ni har gjort hela resan. ${totalWeeks} veckor av samtal, sliders och reflektioner.`,
    },
    {
      title: 'Er resa i siffror',
      body: insights
        ? `${insights.totalSessions} samtal genomförda${insights.longestStreak ? `. Längsta svit: ${insights.longestStreak} veckor i rad` : ''}.${insights.favoriteLayer ? ` Ert favoritlager: ${insights.favoriteLayer}.` : ''}`
        : 'Vi samlar ihop era insikter...',
    },
    {
      title: 'Vad ni har byggt',
      body: 'Varje vecka har ni lagt en sten i grunden för hur ni pratar med varandra. Det är inte alltid lätt, men ni valde att göra det.',
    },
    {
      title: 'En sista reflektion',
      body: 'Vad tar ni med er från de här 22 veckorna?',
      showReflection: true,
    },
    {
      title: 'Tack',
      body: `Tack för att ni stannade kvar — för varandra och för er. Ni kan fortsätta med Tillbaka-kort varje månad.`,
    },
  ];

  const screen = screens[screenIndex];
  const isLast = screenIndex === screens.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete(reflection || undefined);
    } else {
      setScreenIndex((i) => i + 1);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: COLORS.emberNight,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 32px',
        paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {/* Screen dots */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '40px' }}>
        {screens.map((_, i) => (
          <div
            key={i}
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: i <= screenIndex ? COLORS.deepSaffron : `${COLORS.emberGlow}25`,
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={screenIndex}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: EMOTION, ease: [...EASE] }}
          style={{ textAlign: 'center', maxWidth: '340px', width: '100%' }}
        >
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '28px',
            fontWeight: 500,
            color: COLORS.emberGlow,
            marginBottom: '16px',
          }}>
            {screen.title}
          </h2>

          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            color: COLORS.driftwood,
            lineHeight: 1.6,
            marginBottom: screen.showReflection ? '24px' : '0',
          }}>
            {screen.body}
          </p>

          {screen.showReflection && (
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Vår reflektion..."
              rows={4}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '12px',
                backgroundColor: `${COLORS.emberGlow}12`,
                border: `1px solid ${COLORS.emberGlow}20`,
                color: COLORS.emberGlow,
                fontFamily: 'var(--font-sans)',
                fontSize: '15px',
                lineHeight: 1.5,
                resize: 'none',
                outline: 'none',
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <div style={{ flex: 1 }} />

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleNext}
        style={{
          width: '100%',
          maxWidth: '340px',
          height: '52px',
          borderRadius: '12px',
          backgroundColor: COLORS.deepSaffron,
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'var(--font-sans)',
          fontSize: '16px',
          fontWeight: 600,
          color: COLORS.bark,
        }}
      >
        {isLast ? 'Avsluta' : 'Nästa'}
      </motion.button>
    </div>
  );
}
