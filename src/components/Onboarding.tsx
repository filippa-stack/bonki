import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePageBackground } from '@/hooks/usePageBackground';
import { useApp } from '@/contexts/AppContext';
import { trackOnboardingEvent } from '@/lib/trackOnboarding';
import { LANTERN_GLOW } from '@/lib/palette';
import BonkiButton from '@/components/BonkiButton';
import bonkiLogo from '@/assets/bonki-logo-transparent.png';

const EASE: [number, number, number, number] = [0.4, 0.0, 0.2, 1];

const fadeUp = (_delay: number) => ({
  initial: { opacity: 1, y: 0 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0 },
});

export default function Onboarding() {
  const { completeOnboarding, initializeCoupleSpace } = useApp();
  const [selectedAudience, setSelectedAudience] = useState<string | null>(null);
  usePageBackground('#1A1A2E');

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#1A1A2E',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Saffron ambient glow — the campfire in the dark forest ── */}
      <div
        style={{
          position: 'absolute',
          top: '8%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '340px',
          height: '380px',
          background: 'radial-gradient(ellipse 70% 60% at 50% 45%, hsla(40, 78%, 61%, 0.14) 0%, hsla(40, 70%, 50%, 0.06) 40%, transparent 75%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ── Illustration — warm, visible, creatures emerging from the dark ── */}
      <motion.div
        initial={false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0 }}
        style={{
          position: 'relative',
          zIndex: 1,
          flex: '1 1 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 'max(48px, env(safe-area-inset-top, 48px))',
          paddingBottom: '8px',
        }}
      >
        <img
          src={bonkiLogo}
          alt=""
          aria-hidden
          style={{
            width: '240px',
            height: 'auto',
            objectFit: 'contain',
            opacity: 0.88,
            filter: 'brightness(1.15) saturate(1.1)',
          }}
        />
        {/* Bottom fade into Midnight Ink */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '48px',
            background: 'linear-gradient(to top, #1A1A2E 0%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />
      </motion.div>

      {/* ── Content ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          flex: '0 1 auto',
          marginBottom: '32px',
          display: 'flex',
          flexDirection: 'column',
          padding: '0 32px',
        }}
      >
        {/* Credential — subtle, earned trust */}
        <motion.p
          {...fadeUp(0.35)}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            fontWeight: 500,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: LANTERN_GLOW,
            opacity: 0.5,
            marginBottom: '14px',
          }}
        >
          Utvecklat av psykolog
        </motion.p>

        {/* Headline — the emotional hook */}
        <motion.h1
          {...fadeUp(0.5)}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 7.5vw, 38px)',
            fontWeight: 400,
            color: '#FDF6E3',
            lineHeight: 1.28,
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          Verktyg för samtalen{'\u00A0'}som inte blir av.
        </motion.h1>

        {/* Divider — saffron warmth */}
        <motion.div
          {...fadeUp(0.65)}
          style={{
            width: '32px',
            height: '2px',
            backgroundColor: 'hsla(40, 78%, 61%, 0.5)',
            marginTop: '20px',
            marginBottom: '16px',
          }}
        />

        {/* Body text */}
        <motion.p
          {...fadeUp(0.75)}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '16px',
            color: '#FDF6E3',
            lineHeight: 1.55,
            opacity: 0.85,
            margin: 0,
          }}
        >
          Bonki hjälper er prata — med varandra, med era barn, och om det som är svårt att hitta ord för. Ett samtal i taget.
        </motion.p>

        {/* ── Audience routing pills ── */}
        <div style={{ padding: '20px 0 0' }}>
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500,
            color: '#FDF6E3', opacity: 0.5, margin: '0 0 12px',
          }}>
            Vem vill ni prata med?
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { label: 'Barn 3–6', value: 'young' },
              { label: 'Barn 7–11', value: 'middle' },
              { label: 'Barn 12+', value: 'teen' },
              { label: 'Oss som par', value: 'couple' },
            ].map(({ label, value }) => {
              const selected = selectedAudience === value;
              return (
                <button key={value} onClick={() => setSelectedAudience(value)} style={{
                  padding: '10px 20px', borderRadius: '20px', cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  fontFamily: 'var(--font-sans)', fontSize: '14px',
                  border: selected
                    ? '1px solid hsla(40, 78%, 61%, 0.4)'
                    : '1px solid hsla(0, 0%, 100%, 0.15)',
                  background: selected
                    ? 'hsla(40, 78%, 61%, 0.12)'
                    : 'hsla(0, 0%, 100%, 0.06)',
                  color: selected ? '#DA9D1D' : 'rgba(253, 246, 227, 0.85)',
                }}>
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Single CTA ── */}
      <motion.div
        {...fadeUp(0.9)}
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '0 24px',
          paddingBottom: 'calc(32px + env(safe-area-inset-bottom, 0px))',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <BonkiButton
          style={{
            background: 'linear-gradient(180deg, #E85D2C 0%, #C44D22 100%)',
            boxShadow: [
              '0 10px 28px rgba(232, 93, 44, 0.35)',
              '0 4px 10px rgba(232, 93, 44, 0.20)',
              '0 1px 3px rgba(0, 0, 0, 0.12)',
              'inset 0 1.5px 0 rgba(255, 255, 255, 0.35)',
              'inset 0 -2px 6px rgba(0, 0, 0, 0.12)',
            ].join(', '),
          }}
          onClick={() => {
            trackOnboardingEvent('onboarding_complete', { audience: 'all' });
            initializeCoupleSpace();
            completeOnboarding();
          }}
        >
          Börja
        </BonkiButton>
      </motion.div>
    </div>
  );
}
