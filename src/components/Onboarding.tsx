import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePageBackground } from '@/hooks/usePageBackground';
import { useApp } from '@/contexts/AppContext';
import { trackOnboardingEvent } from '@/lib/trackOnboarding';
import { LANTERN_GLOW } from '@/lib/palette';
import BonkiButton from '@/components/BonkiButton';
import bonkiLogo from '@/assets/bonki-logo-transparent.png';

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
        overflowY: 'auto',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      {/* ── Illustration — hero light source ── */}
      <motion.div
        initial={false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0 }}
        style={{
          position: 'relative',
          flex: '1 1 auto',
          minHeight: '180px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        {/* Radial glow behind logo — teal light source */}
        <div
          style={{
            position: 'absolute',
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, hsla(170, 35%, 50%, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <img
          src={bonkiLogo}
          alt=""
          aria-hidden
          style={{
            position: 'relative',
            width: '200px',
            height: 'auto',
            objectFit: 'contain',
            opacity: 0.88,
            filter: 'brightness(1.15) saturate(1.3)',
          }}
        />
      </motion.div>


      {/* ── Content — vertically centered text ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          paddingBottom: '24px',
          padding: '0 32px',
          paddingTop: 'max(48px, env(safe-area-inset-top, 48px))',
        }}
      >
        {/* Credential */}
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

        {/* Headline */}
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

        {/* Divider */}
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

      {/* ── Audience routing pills ── */}
      <div style={{ position: 'relative', zIndex: 1, flex: '0 0 auto', padding: '16px 32px 0' }}>
        <p style={{
          fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 500,
          color: '#FDF6E3', opacity: 0.5, margin: '0 0 12px',
        }}>
          Var vill ni börja?
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
          {[
            { label: 'Barn 3–6', subtitle: 'Känslor och inre värld', value: 'young' },
            { label: 'Barn 7–11', subtitle: 'Relationer och tillit', value: 'middle' },
            { label: 'Barn 12+', subtitle: 'Identitet och omvärld', value: 'teen' },
            { label: 'Oss som par', subtitle: 'Samtalen ni saknar', value: 'couple' },
          ].map(({ label, subtitle, value }) => {
            const selected = selectedAudience === value;
            return (
              <button key={value} onClick={() => setSelectedAudience(value)} style={{
                padding: '12px 16px', borderRadius: '16px', cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', textAlign: 'left',
                border: selected
                  ? '1px solid hsla(40, 78%, 61%, 0.35)'
                  : '1px solid hsla(0, 0%, 100%, 0.10)',
                background: selected
                  ? 'hsla(40, 78%, 61%, 0.10)'
                  : 'hsla(0, 0%, 100%, 0.04)',
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{
                    fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 500,
                    color: selected ? '#DA9D1D' : 'rgba(253, 246, 227, 0.85)',
                  }}>{label}</span>
                  <span style={{
                    fontFamily: 'var(--font-sans)', fontSize: '13px',
                    color: selected ? 'rgba(218, 157, 29, 0.5)' : 'rgba(253, 246, 227, 0.4)',
                  }}>· {subtitle}</span>
                </div>
                <span style={{
                  fontSize: '20px', fontWeight: 300,
                  color: selected ? '#DA9D1D' : 'rgba(253, 246, 227, 0.3)',
                  marginLeft: '12px', flexShrink: 0,
                }}>›</span>
              </button>
            );
          })}
        </div>
        {selectedAudience !== null && (
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: '12px',
            color: '#FDF6E3', opacity: 0.35, margin: '8px 0 0',
          }}>
            Ni kan utforska alla produkter efteråt.
          </p>
        )}
      </div>

      {/* ── CTA ── */}
      <motion.div
        {...fadeUp(0.9)}
        style={{
          position: 'relative',
          zIndex: 1,
          flex: '0 0 auto',
          padding: '0 24px',
          paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
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
            opacity: selectedAudience ? 1 : 0.4,
            pointerEvents: selectedAudience ? 'auto' : 'none',
          }}
          onClick={() => {
            localStorage.setItem('bonki-onboarding-audience', selectedAudience!);
            trackOnboardingEvent('onboarding_complete', { audience: selectedAudience });
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
