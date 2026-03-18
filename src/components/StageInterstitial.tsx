/**
 * StageInterstitial — 500ms flash showing stage name.
 * DM Serif Display, 32px, Deep Saffron. Respects prefers-reduced-motion.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS } from '@/lib/stillUsTokens';

interface StageInterstitialProps {
  visible: boolean;
  stageName?: string;
  subtitle?: string;
  onComplete?: () => void;
}

export default function StageInterstitial({
  visible,
  stageName,
  subtitle,
  onComplete,
}: StageInterstitialProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!visible || !stageName) return;
    setShow(true);
    const timer = setTimeout(() => {
      setShow(false);
      onComplete?.();
    }, 500);
    return () => clearTimeout(timer);
  }, [visible, stageName, onComplete]);

  return (
    <AnimatePresence>
      {show && stageName && (
        <motion.div
          key="stage-interstitial"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: COLORS.emberNight,
            gap: '8px',
          }}
        >
          <h2 style={{
            fontFamily: '"DM Serif Display", var(--font-serif)',
            fontSize: '32px',
            fontWeight: 400,
            color: COLORS.deepSaffron,
            textAlign: 'center',
          }}>
            {stageName}
          </h2>
          {subtitle && (
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '15px',
              color: COLORS.driftwood,
              textAlign: 'center',
            }}>
              {subtitle}
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
