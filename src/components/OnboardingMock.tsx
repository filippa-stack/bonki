/**
 * OnboardingMock — sandboxed v4 onboarding flow.
 *
 * 3 screens:
 *   1. Igenkänning (recognition) — pulsing logo + soft promise copy
 *   2. Promise / Login — what you get + CTA
 *   3. Welcome Gift — first free samtal teaser
 *
 * Lives only at /onboarding-mock. The real Onboarding.tsx is untouched.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BonkiLogoMark from '@/components/BonkiLogoMark';

const MIDNIGHT_INK = '#0B1026';
const LANTERN_GLOW = '#FDF6E3';
const BONKI_ORANGE = '#E85D2C';
const SOFT_GLOW = 'rgba(253, 246, 227, 0.85)';

type Screen = 'recognition' | 'promise' | 'gift';

const SCREENS: Screen[] = ['recognition', 'promise', 'gift'];

export default function OnboardingMock() {
  const [screen, setScreen] = useState<Screen>('recognition');
  const idx = SCREENS.indexOf(screen);

  const next = () => {
    const i = SCREENS.indexOf(screen);
    if (i < SCREENS.length - 1) setScreen(SCREENS[i + 1]);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: MIDNIGHT_INK,
        color: LANTERN_GLOW,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Soft ambient bloom */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(253,246,227,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Progress dots */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top, 0px) + 24px)',
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 8,
          zIndex: 2,
        }}
      >
        {SCREENS.map((s, i) => (
          <span
            key={s}
            style={{
              width: i === idx ? 24 : 6,
              height: 6,
              borderRadius: 999,
              background: i === idx ? LANTERN_GLOW : 'rgba(253,246,227,0.25)',
              transition: 'all 300ms ease',
            }}
          />
        ))}
      </div>

      <div style={{ width: '100%', maxWidth: 360, position: 'relative', zIndex: 2 }}>
        <AnimatePresence mode="wait">
          {screen === 'recognition' && (
            <motion.section
              key="recognition"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={{ textAlign: 'center' }}
            >
              <motion.div
                animate={{ scale: [1, 1.06, 1], opacity: [0.9, 1, 0.9] }}
                transition={{ duration: 4.5, ease: 'easeInOut', repeat: Infinity }}
                style={{
                  margin: '0 auto 32px',
                  width: 96,
                  height: 96,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: SOFT_GLOW,
                  filter: `drop-shadow(0 0 24px rgba(253,246,227,0.25))`,
                }}
              >
                <BonkiLogoMark size={96} />
              </motion.div>

              <h1
                style={{
                  fontFamily: 'Fraunces, serif',
                  fontWeight: 400,
                  fontSize: 34,
                  lineHeight: 1.15,
                  letterSpacing: '-0.01em',
                  margin: '0 0 16px',
                }}
              >
                Det finns saker
                <br />
                vi sällan säger.
              </h1>
              <p
                style={{
                  fontFamily: 'var(--font-body, system-ui)',
                  fontSize: 16,
                  lineHeight: 1.55,
                  color: 'rgba(253,246,227,0.7)',
                  margin: 0,
                }}
              >
                BONKI är ett rum för samtalen som
                <br />
                annars blir kvar inombords.
              </p>
            </motion.section>
          )}

          {screen === 'promise' && (
            <motion.section
              key="promise"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={{ textAlign: 'center' }}
            >
              <div
                style={{
                  margin: '0 auto 28px',
                  display: 'flex',
                  justifyContent: 'center',
                  color: SOFT_GLOW,
                }}
              >
                <BonkiLogoMark size={56} />
              </div>

              <h1
                style={{
                  fontFamily: 'Fraunces, serif',
                  fontWeight: 400,
                  fontSize: 30,
                  lineHeight: 1.2,
                  letterSpacing: '-0.01em',
                  margin: '0 0 20px',
                }}
              >
                Ett samtal i taget.
                <br />
                Inget mer, inget mindre.
              </h1>

              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: '0 0 8px',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                {[
                  'Korta, varma samtal — för par och för barn.',
                  'Inga prestationer, inga rätt svar.',
                  'Det ni delar stannar mellan er.',
                ].map((line) => (
                  <li
                    key={line}
                    style={{
                      display: 'flex',
                      gap: 12,
                      fontSize: 15,
                      lineHeight: 1.5,
                      color: 'rgba(253,246,227,0.85)',
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 999,
                        marginTop: 9,
                        background: BONKI_ORANGE,
                        flexShrink: 0,
                      }}
                    />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </motion.section>
          )}

          {screen === 'gift' && (
            <motion.section
              key="gift"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={{ textAlign: 'center' }}
            >
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 5, ease: 'easeInOut', repeat: Infinity }}
                style={{
                  margin: '0 auto 28px',
                  display: 'flex',
                  justifyContent: 'center',
                  color: BONKI_ORANGE,
                }}
              >
                <BonkiLogoMark size={72} />
              </motion.div>

              <p
                style={{
                  fontFamily: 'var(--font-body, system-ui)',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'rgba(253,246,227,0.55)',
                  margin: '0 0 12px',
                }}
              >
                Välkomstgåva
              </p>
              <h1
                style={{
                  fontFamily: 'Fraunces, serif',
                  fontWeight: 400,
                  fontSize: 30,
                  lineHeight: 1.2,
                  letterSpacing: '-0.01em',
                  margin: '0 0 14px',
                }}
              >
                Ert första samtal —
                <br />
                från oss till er.
              </h1>
              <p
                style={{
                  fontFamily: 'var(--font-body, system-ui)',
                  fontSize: 15,
                  lineHeight: 1.55,
                  color: 'rgba(253,246,227,0.7)',
                  margin: 0,
                }}
              >
                Pröva ett helt samtal innan ni bestämmer om
                <br />
                ni vill fortsätta.
              </p>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* CTA */}
      <div
        style={{
          position: 'absolute',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)',
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          padding: '0 24px',
          zIndex: 2,
        }}
      >
        {idx < SCREENS.length - 1 ? (
          <button
            onClick={next}
            style={{
              minWidth: 220,
              padding: '14px 28px',
              borderRadius: 999,
              border: 'none',
              background: LANTERN_GLOW,
              color: MIDNIGHT_INK,
              fontFamily: 'var(--font-sans, system-ui)',
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: '0.02em',
              cursor: 'pointer',
              boxShadow: '0 6px 24px rgba(0,0,0,0.35)',
            }}
          >
            Fortsätt
          </button>
        ) : (
          <button
            onClick={() => (window.location.href = '/library-mock')}
            style={{
              minWidth: 240,
              padding: '14px 28px',
              borderRadius: 999,
              border: 'none',
              background: BONKI_ORANGE,
              color: '#FFFFFF',
              fontFamily: 'var(--font-sans, system-ui)',
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: '0.02em',
              cursor: 'pointer',
              boxShadow: '0 6px 24px rgba(232,93,44,0.45)',
            }}
          >
            Öppna mitt första samtal
          </button>
        )}
      </div>
    </div>
  );
}
