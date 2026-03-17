/**
 * Share — Partner link sharing screen with polling.
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { EASE, EMOTION } from '@/lib/motion';
import { EMBER_NIGHT, EMBER_GLOW, DEEP_SAFFRON, DRIFTWOOD, BARK } from '@/lib/palette';

interface ShareProps {
  inviteLink: string;
  partnerJoined: boolean;
  onPartnerJoined: () => void;
  onSkip: () => void;
}

export default function Share({ inviteLink, partnerJoined, onPartnerJoined, onSkip }: ShareProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Still Us',
          text: 'Jag har börjat med Still Us — häng med!',
          url: inviteLink,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    if (partnerJoined) onPartnerJoined();
  }, [partnerJoined, onPartnerJoined]);

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
          Bjud in din partner
        </h2>

        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '15px',
          color: DRIFTWOOD,
          lineHeight: 1.6,
          marginBottom: '32px',
        }}>
          Dela länken så att din partner kan göra sin check-in. Ni behöver vara två för att starta samtalet.
        </p>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleShare}
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
            marginBottom: '12px',
          }}
        >
          {copied ? 'Kopierad!' : 'Dela länk'}
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
          }}
        >
          Jag vill utforska själv först
        </button>
      </motion.div>
    </div>
  );
}
