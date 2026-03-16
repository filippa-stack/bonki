import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { trackOnboardingEvent } from '@/lib/trackOnboarding';
import illustrationHome from '@/assets/illustration-still-us-home.png';

const EASE: [number, number, number, number] = [0.4, 0.0, 0.2, 1];

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.7, ease: EASE },
});

export default function Onboarding() {
  const { completeOnboarding, initializeCoupleSpace } = useApp();

  const handleChoice = (audience: 'barn' | 'par') => {
    trackOnboardingEvent('onboarding_complete', { audience });
    localStorage.setItem('bonki-initial-tab', audience);
    initializeCoupleSpace();
    completeOnboarding();
  };

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
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, duration: 1.0, ease: EASE }}
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
          src={illustrationHome}
          alt=""
          aria-hidden
          style={{
            width: '260px',
            height: '260px',
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
          flex: 1,
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
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: '#6B5E52',
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
            fontSize: '1.65rem',
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
            height: '1.5px',
            backgroundColor: 'hsla(40, 78%, 61%, 0.35)',
            marginTop: '20px',
            marginBottom: '20px',
          }}
        />

        <motion.p
          {...fadeUp(0.75)}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.92rem',
            fontWeight: 300,
            lineHeight: 1.6,
            color: 'hsla(44, 86%, 94%, 0.55)',
            margin: 0,
          }}
        >
          Var vill ni börja?
        </motion.p>
      </div>

      {/* ── Binary choice — the micro-commitment ── */}
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
        {/* Barn choice */}
        <button
          onClick={() => handleChoice('barn')}
          style={{
            width: '100%',
            padding: '18px 24px',
            background: 'linear-gradient(135deg, hsla(40, 78%, 61%, 0.12) 0%, hsla(40, 70%, 50%, 0.06) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid hsla(40, 78%, 61%, 0.18)',
            borderRadius: '16px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '4px',
            transition: 'all 200ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, hsla(40, 78%, 61%, 0.20) 0%, hsla(40, 70%, 50%, 0.10) 100%)';
            e.currentTarget.style.borderColor = 'hsla(40, 78%, 61%, 0.30)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, hsla(40, 78%, 61%, 0.12) 0%, hsla(40, 70%, 50%, 0.06) 100%)';
            e.currentTarget.style.borderColor = 'hsla(40, 78%, 61%, 0.18)';
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.05rem',
              fontWeight: 400,
              color: '#FDF6E3',
              letterSpacing: '-0.01em',
            }}
          >
            Med barnen
          </span>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.78rem',
              fontWeight: 300,
              color: 'hsla(44, 86%, 94%, 0.45)',
            }}
          >
            Samtalskort för barn 3–18 år
          </span>
        </button>

        {/* Par choice */}
        <button
          onClick={() => handleChoice('par')}
          style={{
            width: '100%',
            padding: '18px 24px',
            background: 'linear-gradient(135deg, hsla(40, 78%, 61%, 0.12) 0%, hsla(40, 70%, 50%, 0.06) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid hsla(40, 78%, 61%, 0.18)',
            borderRadius: '16px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '4px',
            transition: 'all 200ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, hsla(40, 78%, 61%, 0.20) 0%, hsla(40, 70%, 50%, 0.10) 100%)';
            e.currentTarget.style.borderColor = 'hsla(40, 78%, 61%, 0.30)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, hsla(40, 78%, 61%, 0.12) 0%, hsla(40, 70%, 50%, 0.06) 100%)';
            e.currentTarget.style.borderColor = 'hsla(40, 78%, 61%, 0.18)';
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.05rem',
              fontWeight: 400,
              color: '#FDF6E3',
              letterSpacing: '-0.01em',
            }}
          >
            Som par
          </span>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.78rem',
              fontWeight: 300,
              color: 'hsla(44, 86%, 94%, 0.45)',
            }}
          >
            Samtal för er relation
          </span>
        </button>
      </motion.div>
    </div>
  );
}
