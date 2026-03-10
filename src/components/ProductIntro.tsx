import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { productIntros, ProductIntroData } from '@/data/productIntros';
import { allProducts } from '@/data/products';
import { Heart, User, Users, Globe, Flame, Sun, UserPlus } from 'lucide-react';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const SEEN_KEY_PREFIX = 'bonki-product-intro-seen-';

/** Product-specific Lucide icons for the Spotlight mini-card */
const PRODUCT_SPOTLIGHT_ICON: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  still_us: Heart,
  jag_i_mig: User,
  jag_med_andra: Users,
  jag_i_varlden: Globe,
  sexualitetskort: Flame,
  vardagskort: Sun,
  syskonkort: UserPlus,
};

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

  // Resolve free card title from product data if not passed as prop
  const resolvedFreeCardTitle = useMemo(() => {
    if (freeCardTitle) return freeCardTitle;
    if (!freeCardId) return undefined;
    const product = allProducts.find(p => p.id === productId);
    return product?.cards.find(c => c.id === freeCardId)?.title;
  }, [productId, freeCardId, freeCardTitle]);

  useEffect(() => {
    if (noIntro) onComplete();
  }, [noIntro, onComplete]);

  if (noIntro) return null;

  const lastSlide = introData.slides.length - 1;
  const isLastSlide = currentSlide === lastSlide;
  const hasFreeCard = !!(freeCardId && resolvedFreeCardTitle);

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
            style={{ padding: '0 32px', marginBottom: '-40px' }}
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
                fontSize: 'clamp(28px, 7.5vw, 36px)',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                textAlign: 'center',
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                whiteSpace: 'pre-line',
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

            {/* ── Spotlight card preview — last slide only ── */}
            {isLastSlide && hasFreeCard && (
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.8, ease: EASE }}
                onClick={handleLastSlideCta}
                className="cursor-pointer"
                style={{
                  marginTop: '28px',
                  padding: '16px 28px',
                  borderRadius: '14px',
                  background: `linear-gradient(135deg, ${accentColor ?? 'var(--accent-saffron)'}18, ${accentColor ?? 'var(--accent-saffron)'}08)`,
                  border: `1px solid ${accentColor ?? 'var(--accent-saffron)'}22`,
                  boxShadow: `0 4px 24px -4px ${accentColor ?? 'var(--accent-saffron)'}20, 0 0 0 1px ${accentColor ?? 'var(--accent-saffron)'}08`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Decorative glow */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${accentColor ?? 'var(--accent-saffron)'}15 0%, transparent 70%)`,
                    pointerEvents: 'none',
                  }}
                />
                {/* Mini card icon */}
                <div
                  style={{
                    width: '36px',
                    height: '44px',
                    borderRadius: '6px',
                    background: `linear-gradient(145deg, ${accentColor ?? 'var(--accent-saffron)'}30, ${accentColor ?? 'var(--accent-saffron)'}15)`,
                    border: `1px solid ${accentColor ?? 'var(--accent-saffron)'}25`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {(() => {
                    const IconComp = PRODUCT_SPOTLIGHT_ICON[productId];
                    return IconComp
                      ? <IconComp size={16} className="opacity-70" />
                      : <span style={{ fontSize: '16px', opacity: 0.7 }}>✦</span>;
                  })()}
                </div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '10px',
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: accentColor ?? 'var(--accent-saffron)',
                      opacity: 0.7,
                      marginBottom: '3px',
                    }}
                  >
                    Ert första samtal
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '19px',
                      fontWeight: 700,
                      color: 'var(--color-text-primary)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {resolvedFreeCardTitle}
                  </p>
                </div>
              </motion.div>
            )}

            {slide.signoff && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: isLastSlide && hasFreeCard ? 0.7 : 0.5, duration: 0.6, ease: EASE }}
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'italic',
                  fontSize: '17px',
                  color: accentColor ?? 'var(--accent-text)',
                  textAlign: 'center',
                  marginTop: isLastSlide && hasFreeCard ? '20px' : '32px',
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
          <motion.button
            onClick={isLastSlide ? handleLastSlideCta : handleNext}
            className="cta-primary"
            initial={false}
            animate={isLastSlide && hasFreeCard ? {
              boxShadow: [
                '0 2px 12px -2px hsla(158, 30%, 15%, 0.18)',
                '0 4px 20px -2px hsla(158, 30%, 15%, 0.32)',
                '0 2px 12px -2px hsla(158, 30%, 15%, 0.18)',
              ],
            } : {}}
            transition={isLastSlide && hasFreeCard ? {
              boxShadow: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
            } : {}}
            style={{
              width: '60%',
              fontSize: '15px',
              letterSpacing: '0.02em',
              backgroundColor: accentColor ?? undefined,
            }}
          >
            {isLastSlide
              ? (freeCardId && introData.freeCardCtaLabel ? introData.freeCardCtaLabel : introData.ctaLabel)
              : 'Fortsätt'}
          </motion.button>

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
