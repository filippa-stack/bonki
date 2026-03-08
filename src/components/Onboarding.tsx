import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { trackOnboardingEvent } from '@/lib/trackOnboarding';

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
              {currentSlide === 1 && <SlideScope />}
              {currentSlide === 2 && <SlideInvitation />}
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
              Utforska biblioteket
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

/* ─── SLIDE 1: The Recognition ─── */
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
        {'V\u00e4lkommen till'}
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
        {'Det b\u00e4sta samtalet du kommer ha idag v\u00e4ntar h\u00e4r.'}
      </motion.p>

      <motion.p
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.6, ease: EASE }}
        style={{
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontSize: '15px',
          color: 'var(--color-text-secondary)',
          opacity: 0.55,
          textAlign: 'center',
          marginTop: '12px',
          lineHeight: 1.6,
          maxWidth: '280px',
        }}
      >
        {'Inte det l\u00e4ngsta. Inte det sv\u00e5raste. Det mest \u00e4rliga.'}
      </motion.p>
    </div>
  );
}

/* ─── SLIDE 2: The Scope ─── */
function SlideScope() {
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
        {'Samtal som r\u00f6r sig'}
      </motion.p>

      <motion.p
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15, duration: 0.6, ease: EASE }}
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '15px',
          color: 'var(--color-text-primary)',
          textAlign: 'center',
          lineHeight: 1.65,
          maxWidth: '300px',
        }}
      >
        {'Bonki \u00e4r verktyg f\u00f6r familjer och par som vill n\u00e5 varandra \u2014 p\u00e5 riktigt.'}
      </motion.p>

      {/* Divider */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.4, duration: 0.7, ease: EASE }}
        style={{
          width: '40px',
          height: '1px',
          background: 'var(--color-text-primary)',
          opacity: 0.1,
          marginTop: '24px',
          marginBottom: '24px',
          transformOrigin: 'center',
        }}
      />

      <motion.p
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.6, ease: EASE }}
        style={{
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontSize: '15px',
          color: 'var(--color-text-secondary)',
          opacity: 0.65,
          textAlign: 'center',
          lineHeight: 1.65,
          maxWidth: '280px',
        }}
      >
        {'Fr\u00e5n barnets f\u00f6rsta k\u00e4nslor till parrelationens sv\u00e5raste fr\u00e5gor. Varje kort \u00e4r byggt f\u00f6r att \u00f6ppna det som blivit tyst.'}
      </motion.p>
    </div>
  );
}

/* ─── SLIDE 3: The Invitation ─── */
function SlideInvitation() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center" style={{ padding: '0 32px' }}>
      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.7, ease: EASE }}
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '28px',
          fontWeight: 700,
          color: 'hsl(36, 16%, 92%)',
          textAlign: 'center',
          lineHeight: 1.25,
          letterSpacing: '-0.02em',
          maxWidth: '300px',
        }}
      >
        {'V\u00e4lj det \u00e4mne som k\u00e4nns r\u00e4tt just nu & lyssna.'}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.65, ease: EASE }}
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '14px',
          color: 'hsl(36, 12%, 78%)',
          textAlign: 'center',
          marginTop: '20px',
          lineHeight: 1.65,
          maxWidth: '290px',
        }}
      >
        {'Du hittar verktyg f\u00f6r barn, ton\u00e5ringar och par \u2014 och varje produkt b\u00f6rjar med ett kort helt gratis.'}
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
          fontSize: '15px',
          color: 'hsl(36, 12%, 70%)',
          textAlign: 'center',
          marginTop: '24px',
          lineHeight: 1.6,
          maxWidth: '260px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {'Inget \u00e4r f\u00f6r sv\u00e5rt. Inget \u00e4r f\u00f6r litet. B\u00f6rja d\u00e4r ni \u00e4r.'}
      </motion.p>
    </div>
  );
}
