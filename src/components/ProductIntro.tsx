import { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { productIntros, ProductIntroData } from '@/data/productIntros';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const SEEN_KEY_PREFIX = 'bonki-product-intro-seen-';

function hasSeenProductIntro(productId: string): boolean {
  return localStorage.getItem(`${SEEN_KEY_PREFIX}${productId}`) === 'true';
}

function markProductIntroSeen(productId: string): void {
  localStorage.setItem(`${SEEN_KEY_PREFIX}${productId}`, 'true');
}

interface ProductIntroProps {
  productId: string;
  accentColor?: string;
  backgroundColor?: string;
  freeCardId?: string;
  freeCardTitle?: string;
  onComplete: () => void;
  onStartFreeCard?: () => void;
}

export default function ProductIntro({ productId, accentColor, backgroundColor, freeCardId, freeCardTitle, onComplete, onStartFreeCard }: ProductIntroProps) {
  const introData = productIntros[productId];
  const [currentSlide, setCurrentSlide] = useState(0);
  const noIntro = !introData;

  useEffect(() => {
    if (noIntro) onComplete();
  }, [noIntro, onComplete]);

  if (noIntro) return null;

  const lastSlide = introData.slides.length - 1;

  const handleComplete = () => {
    markProductIntroSeen(productId);
    onComplete();
  };

  const handleLastSlideCta = () => {
    markProductIntroSeen(productId);
    if (freeCardId && onStartFreeCard) {
      onStartFreeCard();
    } else {
      onComplete();
    }
  };

  const handleNext = () => {
    if (currentSlide < lastSlide) setCurrentSlide(currentSlide + 1);
    else handleLastSlideCta();
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const SWIPE = 50;
    const VEL = 300;
    if (info.offset.x < -SWIPE || info.velocity.x < -VEL) {
      if (currentSlide < lastSlide) setCurrentSlide(currentSlide + 1);
      else handleLastSlideCta();
    }
    if (info.offset.x > SWIPE || info.velocity.x > VEL) {
      if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
    }
  };

  const slide = introData.slides[currentSlide];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: backgroundColor ?? 'var(--surface-base)' }}
    >
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="flex-1 flex flex-col items-center justify-center"
            style={{ padding: '0 32px' }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
          >
            {slide.kicker && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.6, ease: EASE }}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '11px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: accentColor ?? 'var(--accent-saffron)',
                  marginBottom: '16px',
                  fontWeight: 600,
                }}
              >
                {slide.kicker}
              </motion.p>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.7, ease: EASE }}
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '38px',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                textAlign: 'center',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              {slide.heading}
            </motion.h1>

            {slide.body.split('\n\n').map((paragraph, pi) => (
              <motion.p
                key={pi}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + pi * 0.1, duration: 0.6, ease: EASE }}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '15px',
                  color: 'var(--color-text-secondary)',
                  opacity: 0.75,
                  textAlign: 'center',
                  marginTop: pi === 0 ? '20px' : '14px',
                  lineHeight: 1.6,
                  maxWidth: '300px',
                }}
              >
                {paragraph}
              </motion.p>
            ))}

            {slide.signoff && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6, ease: EASE }}
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'italic',
                  fontSize: '17px',
                  color: accentColor ?? 'var(--accent-text)',
                  textAlign: 'center',
                  marginTop: '16px',
                }}
              >
                {slide.signoff}
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Bottom controls */}
        <div
          style={{
            paddingBottom: 'calc(32px + env(safe-area-inset-bottom, 0px))',
            paddingTop: '24px',
          }}
          className="flex flex-col items-center gap-5 px-6"
        >
          <button
            onClick={currentSlide === lastSlide ? handleLastSlideCta : handleNext}
            className="cta-primary"
            style={{
              width: '60%',
              fontSize: '15px',
              letterSpacing: '0.02em',
              backgroundColor: accentColor ?? undefined,
              boxShadow: accentColor
                ? `0 2px 12px -2px ${accentColor}44, 0 1px 3px ${accentColor}22`
                : '0 2px 12px -2px hsla(158, 30%, 15%, 0.18), 0 1px 3px hsla(158, 25%, 12%, 0.08)',
            }}
          >
            {currentSlide === lastSlide
              ? (freeCardId && introData.freeCardCtaLabel ? introData.freeCardCtaLabel : introData.ctaLabel)
              : 'Fortsätt'}
          </button>

          {/* Dots (only if multi-slide) */}
          {introData.slides.length > 1 && (
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              {introData.slides.map((_, i) => (
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
                      background: i === currentSlide ? (accentColor ?? 'var(--accent-saffron)') : 'var(--text-ghost)',
                      opacity: i === currentSlide ? 1 : 0.3,
                      transition: 'width 0.4s cubic-bezier(0.22, 1, 0.36, 1), background 0.4s ease, opacity 0.4s ease',
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Skip */}
          <div style={{ height: '20px', display: 'flex', alignItems: 'center' }}>
            {currentSlide < lastSlide && (
              <button
                onClick={handleComplete}
                style={{
                  fontSize: '12px',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-tertiary)',
                  opacity: 0.45,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
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

/** Hook: check if a product intro should be shown */
export function useProductIntroNeeded(productId: string): boolean {
  return !hasSeenProductIntro(productId);
}
