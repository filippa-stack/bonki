import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';

const slides = [
  {
    title: 'Välkommen',
    content: 'Det här är ett utrymme för dig och din partner att reflektera över er relation – som föräldrar, som partners, som individer i ett gemensamt liv.',
  },
  {
    title: 'Grundat i forskning',
    content: 'Varje fråga och övning här bygger på psykologisk forskning om relationer, kommunikation, anknytning och föräldraskap. Det här verktyget är skapat av en legitimerad psykolog.',
  },
  {
    title: 'Inga rätta svar',
    content: 'Det här är inte terapi, coachning eller ett test. Det finns inga poäng, inga framstegsmätare, inga mål att uppnå. Bara ärliga samtal i din egen takt.',
  },
  {
    title: 'I din egen takt',
    content: 'Du kan pausa när som helst och återkomma senare. Spara samtal som betyder något. Skriv privata reflektioner eller dela dem med din partner. Inget här är brådskande.',
  },
  {
    title: 'Ett stilla rum',
    content: 'Tänk på det här som ett stilla rum ni kan gå in i tillsammans – eller var för sig – när ni behöver utrymme att tänka på det som betyder mest.',
  },
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { completeOnboarding, initializeCoupleSpace } = useApp();

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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="text-center"
          >
            <h1 className="text-display text-foreground mb-8">
              {slides[currentSlide].title}
            </h1>
            <p className="text-body text-gentle leading-relaxed mb-12">
              {slides[currentSlide].content}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="flex flex-col items-center gap-6">
          <button
            onClick={isLastSlide ? handleComplete : handleNext}
            className="btn-gentle w-full max-w-xs"
          >
            {isLastSlide ? 'Begin' : 'Continue'}
          </button>

          {/* Progress dots */}
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-primary w-6'
                    : 'bg-border hover:bg-muted-foreground/30'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {!isLastSlide && (
            <button
              onClick={handleComplete}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip introduction
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
