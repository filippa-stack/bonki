import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { trackOnboardingEvent } from '@/lib/trackOnboarding';
import watermarkMamma from '@/assets/watermark-mamma.png';

const EASE: [number, number, number, number] = [0.4, 0.0, 0.2, 1];

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.6, ease: EASE },
});

const TRUST_SIGNALS = [
  'Barn · tonåringar · par',
  'Frågor, övningar och kartläggning',
  'Första kortet i varje produkt — helt gratis',
];

export default function Onboarding() {
  const { completeOnboarding, initializeCoupleSpace } = useApp();

  const handleCta = () => {
    trackOnboardingEvent('onboarding_complete', { last_slide: 0 });
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
      {/* ── Background illustration ── */}
      <img
        src={watermarkMamma}
        alt=""
        aria-hidden
        style={{
          position: 'absolute',
          width: '340px',
          height: '460px',
          left: '50%',
          top: '8%',
          transform: 'translateX(-50%)',
          opacity: 0.10,
          filter: 'sepia(1) saturate(0.3) brightness(2.5) hue-rotate(-10deg)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ── Content ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 32px 0',
        }}
      >
        {/* Label */}
        <motion.p
          {...fadeUp(0.3)}
          style={{
            fontFamily: 'Figtree, var(--font-sans), sans-serif',
            fontSize: '0.68rem',
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#DC9A14',
            marginBottom: '16px',
          }}
        >
          Utvecklat av psykolog
        </motion.p>

        {/* Headline */}
        <motion.h1
          {...fadeUp(0.5)}
          style={{
            fontFamily: '"DM Serif Display", var(--font-serif), serif',
            fontSize: '1.7rem',
            fontWeight: 400,
            color: '#FFFFFF',
            lineHeight: 1.3,
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          Verktyg för samtalen som inte blir av — med barnen, med varandra.
        </motion.h1>

        {/* Divider */}
        <motion.div
          {...fadeUp(0.65)}
          style={{
            width: '36px',
            height: '1.5px',
            backgroundColor: 'rgba(220, 154, 20, 0.4)',
            marginTop: '24px',
            marginBottom: '24px',
          }}
        />

        {/* Body text */}
        <motion.p
          {...fadeUp(0.75)}
          style={{
            fontFamily: 'Figtree, var(--font-sans), sans-serif',
            fontSize: '0.95rem',
            fontWeight: 300,
            lineHeight: 1.75,
            color: 'rgba(255, 255, 255, 0.6)',
            margin: 0,
          }}
        >
          Från det ditt barn känner men inte kan säga — till det ni båda vet men inte tar upp.
        </motion.p>

        {/* Trust signals */}
        <motion.div
          {...fadeUp(0.9)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            marginTop: '28px',
          }}
        >
          {TRUST_SIGNALS.map((text) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  backgroundColor: '#DC9A14',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: 'Figtree, var(--font-sans), sans-serif',
                  fontSize: '0.82rem',
                  fontWeight: 400,
                  color: 'rgba(255, 255, 255, 0.45)',
                }}
              >
                {text}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Continuum line */}
        <motion.p
          {...fadeUp(1.0)}
          style={{
            fontFamily: 'Figtree, var(--font-sans), sans-serif',
            fontSize: '0.82rem',
            fontWeight: 400,
            color: 'rgba(255, 255, 255, 0.35)',
            marginTop: '28px',
          }}
        >
          Samma psykologi. Från 3 år till vuxenliv.
        </motion.p>
      </div>

      {/* ── CTA ── */}
      <motion.div
        {...fadeUp(1.1)}
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '0 24px',
          paddingBottom: 'calc(52px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <button
          onClick={handleCta}
          style={{
            width: '100%',
            padding: '18px 32px',
            backgroundColor: '#DC9A14',
            color: '#FFFFFF',
            fontFamily: 'Figtree, var(--font-sans), sans-serif',
            fontSize: '0.92rem',
            fontWeight: 500,
            border: 'none',
            borderRadius: '14px',
            cursor: 'pointer',
            transition: 'background-color 200ms ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#c4880f')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#DC9A14')}
        >
          Utforska biblioteket
        </button>
      </motion.div>
    </div>
  );
}
