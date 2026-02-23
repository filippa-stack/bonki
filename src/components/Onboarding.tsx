import { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function Onboarding() {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const { completeOnboarding, initializeCoupleSpace } = useApp();

  const handleComplete = () => {
    initializeCoupleSpace();
    completeOnboarding();
  };

  const handleNext = () => {
    if (currentSlide < 2) setCurrentSlide(currentSlide + 1);
    else handleComplete();
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const SWIPE_THRESHOLD = 50;
    const VELOCITY_THRESHOLD = 300;
    if (info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -VELOCITY_THRESHOLD) {
      if (currentSlide < 2) setCurrentSlide(currentSlide + 1);
      else handleComplete();
    }
    if (info.offset.x > SWIPE_THRESHOLD || info.velocity.x > VELOCITY_THRESHOLD) {
      if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
    }
  };

  const isDark = currentSlide === 2;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: currentSlide === 0
          ? 'var(--surface-base)'
          : currentSlide === 1
            ? 'var(--surface-base)'
            : 'hsl(158, 32%, 14%)',
        transition: 'background-color 0.5s ease',
      }}
    >
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="flex-1 flex flex-col"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
          >
            {/* Slide content */}
            <div className="flex-1 flex flex-col" style={{ position: 'relative' }}>
              {currentSlide === 0 && <Slide1 />}
              {currentSlide === 1 && <Slide2 />}
              {currentSlide === 2 && <Slide3 />}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom controls — content-attached on slides 0-1, bottom-anchored on slide 2 */}
        <div
          style={{
            paddingBottom: 'calc(32px + env(safe-area-inset-bottom, 0px))',
            paddingTop: currentSlide < 2 ? '40px' : '24px',
          }}
          className="flex flex-col items-center gap-5 px-6"
        >
          {/* CTA button */}
          {currentSlide === 2 ? (
            <button
              onClick={handleComplete}
              style={{
                width: '60%',
                fontSize: '15px',
                letterSpacing: '0.02em',
                background: 'var(--surface-sunken)',
                color: 'hsl(158, 32%, 14%)',
                borderRadius: '14px',
                padding: '14px 0',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Kom igång
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="cta-primary"
              style={{ width: '60%', fontSize: '15px', letterSpacing: '0.02em' }}
            >
              Fortsätt
            </button>
          )}

          {/* Progress dots */}
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                aria-label={t('onboarding.slide_label', { number: i + 1 })}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '14px 8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    width: i === currentSlide ? '14px' : '5px',
                    height: '5px',
                    borderRadius: i === currentSlide ? '4px' : '50%',
                    background: i === currentSlide
                      ? '#C4821D'
                      : isDark
                        ? 'hsl(158, 20%, 30%)'
                        : 'var(--color-text-ghost)',
                    opacity: i === currentSlide ? 1 : isDark ? 0.4 : 0.3,
                    transition: 'width 0.3s ease, background 0.3s ease, opacity 0.3s ease',
                  }}
                />
              </button>
            ))}
          </div>

          {/* Skip link */}
          <div style={{ height: '20px', display: 'flex', alignItems: 'center' }}>
            {currentSlide < 2 && (
              <button
                onClick={handleComplete}
                style={{
                  fontSize: '12px',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase' as const,
                  color: isDark ? 'hsl(36, 12%, 70%)' : 'var(--color-text-tertiary)',
                  opacity: 0.45,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  textAlign: 'center' as const,
                }}
              >
                Hoppa över
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── SLIDE 1: "Ett gemensamt rum." ─── */
function Slide1() {
  return (
    <div className="flex-1 flex flex-col justify-end" style={{ paddingBottom: '32px' }}>
      <motion.h1
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0, duration: 0.6, ease: EASE }}
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '38px',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          lineHeight: 1.15,
          textAlign: 'left',
          paddingLeft: '32px',
          paddingRight: '48px',
          letterSpacing: '-0.01em',
        }}
      >
        Ett gemensamt rum.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15, duration: 0.5, ease: EASE }}
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '15px',
          color: 'var(--color-text-secondary)',
          opacity: 0.75,
          textAlign: 'left',
          paddingLeft: '32px',
          paddingRight: '48px',
          marginTop: '16px',
          lineHeight: 1.6,
        }}
      >
        Still Us är skapat för er — ett utrymme att mötas i, mitt i vardagen.
      </motion.p>

      <motion.p
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.28, duration: 0.5, ease: EASE }}
        style={{
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontSize: '17px',
          color: 'var(--accent-text)',
          textAlign: 'left',
          paddingLeft: '32px',
          marginTop: '12px',
        }}
      >
        För samtal ni vill hålla levande.
      </motion.p>
    </div>
  );
}

/* ─── SLIDE 2: "Utforska i er takt." ─── */
function Slide2() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center" style={{ position: 'relative', padding: '0 32px' }}>
      {/* Decorative "02" — aligned to headline baseline */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.06 }}
        transition={{ delay: 0, duration: 0.8, ease: EASE }}
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '180px',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -55%)',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 0,
          lineHeight: 1,
        }}
        aria-hidden
      >
        02
      </motion.span>

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.55, ease: EASE }}
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '34px',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            textAlign: 'center',
            lineHeight: 1.2,
          }}
        >
          Utforska i er takt.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.5, ease: EASE }}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            color: 'var(--color-text-secondary)',
            opacity: 0.75,
            textAlign: 'center',
            marginTop: '16px',
            lineHeight: 1.6,
          }}
        >
          Välj ett ämne. Läs. Reflektera.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34, duration: 0.5, ease: EASE }}
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: '17px',
            color: 'var(--accent-text)',
            textAlign: 'center',
            marginTop: '12px',
          }}
        >
          Det finns inget rätt sätt — bara ert.
        </motion.p>
      </div>
    </div>
  );
}

/* ─── SLIDE 3: "Omsorgsfullt utvecklat." ─── */
function Slide3() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center" style={{ padding: '0 32px' }}>
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0, duration: 0.6, ease: EASE }}
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '34px',
          fontWeight: 700,
          color: 'hsl(36, 16%, 92%)',
          textAlign: 'center',
          lineHeight: 1.2,
        }}
      >
        Omsorgsfullt utvecklat.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.55, ease: EASE }}
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '15px',
          color: 'hsl(36, 12%, 78%)',
          textAlign: 'center',
          marginTop: '16px',
          lineHeight: 1.6,
        }}
      >
        Varje samtal bygger på psykologisk forskning om relationer och anknytning.
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.55, ease: EASE }}
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '15px',
          color: 'hsl(36, 12%, 78%)',
          textAlign: 'center',
          marginTop: '8px',
          lineHeight: 1.6,
        }}
      >
        Formulerat för att skapa klarhet, närhet och förståelse — i er takt.
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5, ease: EASE }}
        style={{
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontSize: '22px',
          color: '#C4821D',
          textAlign: 'center',
          marginTop: '20px',
        }}
      >
        Bara er.
      </motion.p>
    </div>
  );
}
