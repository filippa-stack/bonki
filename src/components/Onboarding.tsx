import { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';

/** Apple-grade ease: slow start, confident finish */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function Onboarding() {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const { completeOnboarding, initializeCoupleSpace } = useApp();

  const handleComplete = () => {
    initializeCoupleSpace();
    completeOnboarding();
  };

  const LAST_SLIDE = 3;

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
              {currentSlide === 0 && <Slide1 />}
              {currentSlide === 1 && <Slide2 />}
              {currentSlide === 2 && <SlideMechanics />}
              {currentSlide === 3 && <Slide3 />}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Bottom controls ── */}
        <div
          style={{
            paddingBottom: 'calc(32px + env(safe-area-inset-bottom, 0px))',
            paddingTop: currentSlide < 2 ? '40px' : '24px',
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
              Kom igång
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
            {[0, 1, 2, 3].map((i) => (
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

/* ─── SLIDE 1: "Ett gemensamt rum." ─── */
function Slide1() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center" style={{ padding: '0 32px' }}>
      <motion.h1
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.7, ease: EASE }}
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '42px',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          lineHeight: 1.1,
          textAlign: 'center',
          letterSpacing: '-0.02em',
        }}
      >
        Ett gemensamt rum.
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
        }}
      >
        Still Us är skapat för er — ett utrymme att mötas i, mitt i vardagen.
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
        För samtal ni vill hålla levande.
      </motion.p>
    </div>
  );
}

/* ─── SLIDE 2: "Utforska i er takt." ─── */
function Slide2() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center" style={{ position: 'relative', padding: '0 32px' }}>
      {/* Decorative "02" watermark */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.06 }}
        transition={{ delay: 0, duration: 1.0, ease: EASE }}
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
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7, ease: EASE }}
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '36px',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            textAlign: 'center',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
          }}
        >
          Utforska i er takt.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6, ease: EASE }}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            color: 'var(--color-text-secondary)',
            opacity: 0.75,
            textAlign: 'center',
            marginTop: '20px',
            lineHeight: 1.6,
          }}
        >
          Välj ett ämne. Läs frågorna högt.
          <br />
          Lyssna. Reflektera.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
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
          Det finns inget rätt sätt — bara ert.
        </motion.p>
      </div>
    </div>
  );
}

/* ─── SLIDE MECHANICS: "Så funkar det." ─── */
function SlideMechanics() {
  const steps = [
    { num: '01', text: 'Välj ett tema. Ta samtalet i er takt.' },
    { num: '02', text: 'Låt var och en tala till punkt.' },
    { num: '03', text: 'Anteckna det ni vill minnas.' },
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
        Pausa när det behövs. Återkom när det går.
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6, ease: EASE }}
        style={{
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontSize: '17px',
          color: 'var(--accent-text)',
          textAlign: 'center',
          marginTop: '14px',
        }}
      >
        Värdet ligger i reflektionen, inte i lösningen.
      </motion.p>
    </div>
  );
}

/* ─── SLIDE 3: "Omsorgsfullt utvecklat." ─── */
function Slide3() {
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
        }}
      >
        Varje samtal bygger på psykologisk forskning om relationer och anknytning.
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.6, ease: EASE }}
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '15px',
          color: 'hsl(36, 12%, 78%)',
          textAlign: 'center',
          marginTop: '10px',
          lineHeight: 1.6,
        }}
      >
        Formulerat för att skapa klarhet, närhet och förståelse — i er takt.
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.6, ease: EASE }}
        style={{
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontSize: '20px',
          color: 'var(--accent-saffron)',
          textAlign: 'center',
          marginTop: '28px',
          letterSpacing: '-0.01em',
        }}
      >
        Bara er.
      </motion.p>
    </div>
  );
}
