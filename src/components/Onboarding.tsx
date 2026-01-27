import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';

const slides = [
  {
    title: 'Welcome',
    content: 'This is a space for you and your partner to reflect on your relationship—as parents, as partners, as individuals within a shared life.',
  },
  {
    title: 'Grounded in Research',
    content: 'Every question and exercise here is informed by psychological research on relationships, communication, attachment, and parenting. This tool was created by a licensed psychologist.',
  },
  {
    title: 'No Right Answers',
    content: 'This is not therapy, coaching, or a test. There are no scores, no progress bars, no goals to achieve. Only honest conversation at your own pace.',
  },
  {
    title: 'Your Pace, Your Way',
    content: 'You can pause at any time and return later. Save conversations that matter. Write private reflections or share them with your partner. Nothing here is urgent.',
  },
  {
    title: 'A Quiet Room',
    content: 'Think of this as a quiet room you can enter together—or alone—whenever you need space to think about what matters most.',
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
