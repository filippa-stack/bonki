import { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';

/** Apple-grade ease: slow start, confident finish */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const LAST_SLIDE = 2;

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { completeOnboarding, initializeCoupleSpace } = useApp();

  const handleComplete = () => {
    initializeCoupleSpace();
    completeOnboarding();
  };

  const handleNext = () => {
    if (currentSlide < LAST_SLIDE) setCurrentSlide(currentSlide + 1);
    else handleComplete();
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const SWIPE_THRESHOLD = 50;
    const VELOCITY_THRESHOLD = 300;
    if (info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -VELOCITY_THRESHOLD) {
      if (currentSlide < LAST_SLIDE) setCurrentSlide(currentSlide + 1);
      else handleComplete();
    }
    if (info.offset.x > SWIPE_THRESHOLD || info.velocity.x > VELOCITY_THRESHOLD) {
      if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
    }
  };

  const isDark = currentSlide === LAST_SLIDE;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: isDark ? 'var(--cta-active)' : 'var(--surface-base)',
        transition: 'background-color 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="flex-1 flex flex-col"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
          >
            <div className="flex-1 flex flex-col" style={{ position: 'relative' }}>
              {currentSlide === 0 && <SlideWelcome />}
              {currentSlide === 1 && <SlideHow />}
              {currentSlide === 2 && <SlideReady />}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Bottom controls ── */}
        <div
          style={{
            paddingBottom: 'calc(32px + env(safe-area-inset-bottom, 0px))',
            paddingTop: '24px',
          }}
          className="flex flex-col items-center gap-5 px-6"
        >
          {/* CTA button */}
          {currentSlide === LAST_SLIDE ? (
            <button
              onClick={handleComplete}
              style={{
                width: '60%',
                maxWidth: '280px',
                fontSize: '15px',
                letterSpacing: '0.02em',
                background: 'var(--surface-sunken)',
                color: 'var(--cta-active)',
                borderRadius: 'var(--radius-button)',
                padding: '14px 0',
                fontWeight: 600,
                fontFamily: 'var(--font-sans)',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 12px -2px hsla(30, 18%, 25%, 0.12), 0 1px 3px hsla(30, 12%, 20%, 0.06)',
                transition: 'transform 200ms ease-out, box-shadow 300ms ease-out',
              }}
            >
              Utforska
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="cta-primary"
              style={{
                width: '60%',
                fontSize: '15px',
                letterSpacing: '0.02em',
                boxShadow: '0 2px 12px -2px hsla(158, 30%, 15%, 0.18), 0 1px 3px hsla(158, 25%, 12%, 0.08)',
              }}
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
                aria-label={`Slide ${i + 1}`}
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
                      ? 'var(--accent-saffron)'
                      : isDark
                        ? 'hsl(158, 20%, 30%)'
                        : 'var(--text-ghost)',
                    opacity: i === currentSlide ? 1 : isDark ? 0.4 : 0.3,
                    transition: 'width 0.4s cubic-bezier(0.22, 1, 0.36, 1), background 0.4s ease, opacity 0.4s ease',
                  }}
                />
              </button>
            ))}
          </div>

          {/* Skip link */}
          <div style={{ height: '20px', display: 'flex', alignItems: 'center' }}>
            {currentSlide < LAST_SLIDE && (
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
                  fontFamily: 'var(--font-sans)',
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

/* ─── SLIDE 1: Welcome to Bonki ─── */
function SlideWelcome() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center" style={{ padding: '0 32px' }}>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.6, ease: EASE }}
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase' as const,
          color: 'var(--accent-saffron)',
          marginBottom: '20px',
          fontWeight: 600,
        }}
      >
        Välkommen till
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.7, ease: EASE }}
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '46px',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          lineHeight: 1.1,
          textAlign: 'center',
          letterSpacing: '-0.02em',
        }}
      >
        Bonki
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.6, ease: EASE }}
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '15px',
          color: 'var(--color-text-secondary)',
          opacity: 0.75,
          textAlign: 'center',
          marginTop: '20px',
          lineHeight: 1.6,
          maxWidth: '280px',
        }}
      >
        Ett bibliotek av samtal — för par, barn och familjer.
      </motion.p>

      <motion.p
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.6, ease: EASE }}
        style={{
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontSize: '17px',
          color: 'var(--accent-text)',
          textAlign: 'center',
          marginTop: '16px',
        }}
      >
        Varje samtal räknas.
      </motion.p>
    </div>
  );
}

/* ─── SLIDE 2: How it works ─── */
function SlideHow() {
  const steps = [
    { num: '01', text: 'Välj en samtalslek som passar er.' },
    { num: '02', text: 'Läs frågorna högt, en i taget.' },
    { num: '03', text: 'Lyssna. Reflektera. Inga rätta svar.' },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center" style={{ padding: '0 32px' }}>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.6, ease: EASE }}
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase' as const,
          color: 'var(--accent-saffron)',
          marginBottom: '16px',
          fontWeight: 600,
        }}
      >
        Så funkar det
      </motion.p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '300px', width: '100%' }}>
        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.15, duration: 0.6, ease: EASE }}
            style={{ display: 'flex', alignItems: 'baseline', gap: '14px' }}
          >
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '28px',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                opacity: 0.08,
                lineHeight: 1,
                flexShrink: 0,
                minWidth: '32px',
              }}
            >
              {step.num}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '15px',
                color: 'var(--color-text-primary)',
                lineHeight: 1.55,
              }}
            >
              {step.text}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Divider */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.65, duration: 0.7, ease: EASE }}
        style={{
          width: '40px',
          height: '1px',
          background: 'var(--color-text-primary)',
          opacity: 0.1,
          marginTop: '28px',
          marginBottom: '24px',
          transformOrigin: 'center',
        }}
      />

      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75, duration: 0.6, ease: EASE }}
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          opacity: 0.65,
          textAlign: 'center',
          lineHeight: 1.65,
          maxWidth: '260px',
        }}
      >
        Pausa när det behövs. Återkom när det passar.
      </motion.p>
    </div>
  );
}

/* ─── SLIDE 3: Ready ─── */
function SlideReady() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center" style={{ padding: '0 32px' }}>
      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.7, ease: EASE }}
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '36px',
          fontWeight: 700,
          color: 'hsl(36, 16%, 92%)',
          textAlign: 'center',
          lineHeight: 1.15,
          letterSpacing: '-0.02em',
        }}
      >
        Omsorgsfullt utvecklat.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.65, ease: EASE }}
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '15px',
          color: 'hsl(36, 12%, 78%)',
          textAlign: 'center',
          marginTop: '20px',
          lineHeight: 1.6,
          maxWidth: '300px',
        }}
      >
        Varje samtalslek bygger på psykologisk forskning — om anknytning, känslor och relationer.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ delay: 0.3, duration: 1.2, ease: EASE }}
        style={{
          position: 'absolute',
          bottom: '30%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--accent-saffron) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.6, ease: EASE }}
        style={{
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontSize: '20px',
          color: 'var(--accent-saffron)',
          textAlign: 'center',
          marginTop: '28px',
          letterSpacing: '-0.01em',
          position: 'relative',
          zIndex: 1,
        }}
      >
        Redo att börja?
      </motion.p>
    </div>
  );
}
