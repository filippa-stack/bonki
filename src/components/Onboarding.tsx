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
          top: '5%',
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
          display: 'flex',
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
            width: '200px',
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
            height: '80px',
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
          marginTop: 'auto',
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
        <button
          onClick={() => {
            trackOnboardingEvent('onboarding_complete', { audience: 'all' });
            initializeCoupleSpace();
            completeOnboarding();
          }}
          style={{
            width: '100%',
            height: '56px',
            background: 'linear-gradient(135deg, hsla(40, 78%, 61%, 0.15) 0%, hsla(40, 70%, 50%, 0.08) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid hsla(40, 78%, 61%, 0.22)',
            borderRadius: '14px',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'all 200ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, hsla(40, 78%, 61%, 0.22) 0%, hsla(40, 70%, 50%, 0.12) 100%)';
            e.currentTarget.style.borderColor = 'hsla(40, 78%, 61%, 0.30)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, hsla(40, 78%, 61%, 0.15) 0%, hsla(40, 70%, 50%, 0.08) 100%)';
            e.currentTarget.style.borderColor = 'hsla(40, 78%, 61%, 0.22)';
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.15rem',
              fontWeight: 500,
              color: '#FDF6E3',
              letterSpacing: '-0.01em',
            }}
          >
            Börja
          </span>
        </button>
      </motion.div>
    </div>
  );
}
