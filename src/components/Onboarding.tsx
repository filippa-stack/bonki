import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import { BEAT_1, BEAT_2, BEAT_3, EASE } from '@/lib/motion';

const slides = [
  {
    title: 'Utforska i er takt.',
    content: 'Välj ett ämne. Läs. Reflektera.',
    saffronLine: 'Det finns inget rätt sätt — bara ert.',
    cta: 'Fortsätt',
  },
  {
    title: 'Ett gemensamt rum.',
    saffronLine: 'För samtal ni vill hålla levande.',
    content: 'Still Us är skapat för er — ett utrymme att mötas i, mitt i vardagen.',
    cta: 'Fortsätt',
  },
  {
    title: 'Omsorgsfullt utvecklat.',
    titleColor: '#C4821D',
    content: 'Varje samtal bygger på psykologisk forskning om relationer och anknytning.\n\nFormulerat för att skapa klarhet, närhet och förståelse — i er takt.',
    cta: 'Kom igång',
  },
];

export default function Onboarding() {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const { completeOnboarding, initializeCoupleSpace, backgroundColor } = useApp();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handleComplete = () => {
    initializeCoupleSpace();
    completeOnboarding();
  };

  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 page-bg">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: BEAT_3, ease: EASE }}
            className="text-center"
          >
            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: BEAT_3, ease: EASE }}
              className="text-display text-foreground"
              style={slides[currentSlide].titleColor ? { color: slides[currentSlide].titleColor } : undefined}
            >
              {slides[currentSlide].title}
            </motion.h1>

            {/* Body — BEAT_1 after headline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: BEAT_1, duration: BEAT_3, ease: EASE }}
              className="text-body text-gentle leading-relaxed mt-8 whitespace-pre-line"
            >
              {slides[currentSlide].content}
            </motion.p>

            {/* Saffron accent line */}
            {slides[currentSlide].saffronLine && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: BEAT_1 + 0.1, duration: BEAT_3, ease: EASE }}
                className="mt-6"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: 'italic',
                  fontSize: '18px',
                  color: '#C4821D',
                }}
              >
                {slides[currentSlide].saffronLine}
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* CTA — BEAT_2 after body */}
        <motion.div
          key={`cta-${currentSlide}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: BEAT_2, duration: BEAT_3, ease: EASE }}
          className="mt-12 flex flex-col items-center gap-6"
        >
          <button
            onClick={isLastSlide ? handleComplete : handleNext}
            className="cta-primary"
          >
            {slides[currentSlide].cta}
          </button>

          {/* Progress dots */}
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-150 ${
                  index === currentSlide
                    ? 'bg-primary/40 w-4'
                    : 'bg-border/40 hover:bg-muted-foreground/20'
                }`}
                aria-label={t('onboarding.slide_label', { number: index + 1 })}
              />
            ))}
          </div>

          {/* "Hoppa över" — fixed height to prevent layout shift on last slide */}
          <div className="h-6 flex items-center">
            {!isLastSlide && (
              <button
                onClick={handleComplete}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('onboarding.skip')}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

