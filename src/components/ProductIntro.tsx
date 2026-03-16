import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { productIntros } from '@/data/productIntros';
import { allProducts } from '@/data/products';
import { useCardImage } from '@/hooks/useCardImage';
import { LANTERN_GLOW, DRIFTWOOD, MIDNIGHT_INK, BONKI_ORANGE, DEEP_SAFFRON } from '@/lib/palette';

// ── Illustration imports (same as product homes) ──
import apaImage from '@/assets/apa-jag-i-mig.png';
import slothImage from '@/assets/sloth-jag-med-andra.png';
import peacockImage from '@/assets/peacock-jag-i-varlden.png';
import illustrationVardag from '@/assets/illustration-vardag.png';
import illustrationSyskon from '@/assets/illustration-syskon.png';
import illustrationSexualitet from '@/assets/illustration-sexualitet.png';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const SEEN_KEY_PREFIX = 'bonki-product-intro-seen-';

function hasSeenProductIntro(productId: string): boolean {
  return localStorage.getItem(`${SEEN_KEY_PREFIX}${productId}`) === 'true';
}

function markProductIntroSeen(productId: string): void {
  localStorage.setItem(`${SEEN_KEY_PREFIX}${productId}`, 'true');
}

/** Per-product creature illustration */
const PRODUCT_ILLUSTRATION: Record<string, string> = {
  jag_i_mig: apaImage,
  jag_med_andra: slothImage,
  jag_i_varlden: peacockImage,
  vardagskort: illustrationVardag,
  syskonkort: illustrationSyskon,
  sexualitetskort: illustrationSexualitet,
};

/** One-sentence intro per product */
const SHORT_INTROS: Record<string, string> = {
  jag_i_mig: 'Kort som hjälper ert barn sätta ord på det som känns.',
  jag_med_andra: 'Frågor om det svåra och det trygga i att vara med andra.',
  jag_i_varlden: 'De stora frågorna om vem jag är och vart världen är på väg.',
  vardagskort: 'Kort för alla de små sakerna som bygger en familj.',
  syskonkort: 'Frågor som hjälper er prata om det som finns mellan er.',
  sexualitetskort: 'Om kropp, samtycke, normer och identitet — utan att moralisera.',
};

interface ProductIntroProps {
  productId: string;
  accentColor?: string;
  backgroundColor?: string;
  freeCardId?: string;
  freeCardTitle?: string;
  onComplete: () => void;
  onStartFreeCard?: () => void;
}

export default function ProductIntro({
  productId,
  accentColor,
  backgroundColor,
  freeCardId,
  freeCardTitle,
  onComplete,
  onStartFreeCard,
}: ProductIntroProps) {
  const introData = productIntros[productId];
  const [expanded, setExpanded] = useState(false);
  const freeCardImageUrl = useCardImage(freeCardId);

  const product = useMemo(() => allProducts.find((p) => p.id === productId), [productId]);

  const resolvedFreeCardTitle = useMemo(() => {
    if (freeCardTitle) return freeCardTitle;
    if (!freeCardId) return undefined;
    return product?.cards.find((c) => c.id === freeCardId)?.title;
  }, [productId, freeCardId, freeCardTitle, product]);

  /** Find the category name for the free card */
  const freeCardCategoryName = useMemo(() => {
    if (!freeCardId || !product) return undefined;
    const card = product.cards.find((c) => c.id === freeCardId);
    if (!card) return undefined;
    return product.categories.find((cat) => cat.id === card.categoryId)?.title;
  }, [freeCardId, product]);

  const noIntro = !introData;
  useEffect(() => {
    if (noIntro) onComplete();
  }, [noIntro, onComplete]);
  if (noIntro) return null;

  const bgColor = backgroundColor ?? product?.backgroundColor ?? MIDNIGHT_INK;
  const creatureImage = PRODUCT_ILLUSTRATION[productId];
  const shortIntro = SHORT_INTROS[productId] ?? '';
  const isSexualitet = productId === 'sexualitetskort';

  // Full body text from productIntros data
  const fullBodyText = introData.slides.map((s) => s.body).join('\n\n');
  // Include signoff in expanded text (except for sexualitet which shows it separately)
  const signoffText = !isSexualitet
    ? introData.slides.map((s) => s.signoff).filter(Boolean).join('\n\n')
    : '';

  const handleCta = () => {
    markProductIntroSeen(productId);
    if (freeCardId && onStartFreeCard) {
      onStartFreeCard();
    } else {
      onComplete();
    }
  };

  // Sexualitet safety signoff
  const sexSafetyLine = isSexualitet
    ? introData.slides[0]?.signoff
    : null;

  return (
    <div
      style={{
        backgroundColor: bgColor,
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        overflow: expanded ? 'auto' : 'hidden',
        position: 'relative',
      }}
    >
      {/* ── 1. Illustration zone — atmospheric creature backdrop ── */}
      {creatureImage && (
        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: EASE }}
          style={{
            position: 'absolute',
            top: 0,
            left: '-10%',
            right: '-10%',
            height: '42%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <img
            src={creatureImage}
            alt=""
            aria-hidden
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 30%',
              opacity: 0.28,
              filter: 'brightness(1.1) saturate(0.9)',
            }}
          />
          {/* Bottom fade into bg */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '50%',
              background: `linear-gradient(to top, ${bgColor} 0%, transparent 100%)`,
              pointerEvents: 'none',
            }}
          />
        </motion.div>
      )}

      {/* ── Content area ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '0 28px',
          paddingTop: 'max(44px, env(safe-area-inset-top, 44px))',
        }}
      >
        {/* Spacer to push content below illustration zone */}
        <div style={{ flex: '0 0 30%' }} />

        {/* 2. Welcome header */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: EASE }}
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '28px',
            fontWeight: 600,
            color: LANTERN_GLOW,
            textAlign: 'center',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          Välkommen till{'\n'}
          {product?.name ?? productId}
        </motion.h1>

        {/* Subtitle / tagline */}
        {product?.tagline && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6, ease: EASE }}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '15px',
              color: DRIFTWOOD,
              textAlign: 'center',
              marginTop: '4px',
              margin: '4px 0 0',
            }}
          >
            {product.tagline}
          </motion.p>
        )}

        {/* 3. Short intro — one sentence */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6, ease: EASE }}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            color: `${LANTERN_GLOW}D9`, // 85% opacity
            textAlign: 'center',
            lineHeight: 1.55,
            marginTop: '8px',
            margin: '8px 0 0',
          }}
        >
          {shortIntro}
        </motion.p>

        {/* 4. "Läs mer" expandable */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.5, ease: EASE }}
          style={{ textAlign: 'center', marginTop: '4px' }}
        >
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              color: DRIFTWOOD,
              cursor: 'pointer',
              padding: '6px 12px',
            }}
          >
            {expanded ? 'Visa mindre' : `Läs mer om ${product?.name ?? 'produkten'}`}
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ padding: '8px 4px 16px' }}>
                  {fullBodyText.split('\n\n').map((para, i) => (
                    <p
                      key={i}
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '14px',
                        color: `${LANTERN_GLOW}CC`, // 80% opacity
                        textAlign: 'center',
                        lineHeight: 1.6,
                        marginTop: i === 0 ? 0 : '12px',
                        margin: i === 0 ? '0' : '12px 0 0',
                      }}
                    >
                      {para}
                    </p>
                  ))}
                  {signoffText && (
                    <p
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontStyle: 'italic',
                        fontSize: '14px',
                        color: `${LANTERN_GLOW}CC`,
                        textAlign: 'center',
                        marginTop: '16px',
                      }}
                    >
                      {signoffText}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 5. First card preview */}
        {resolvedFreeCardTitle && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7, ease: EASE }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              marginTop: '24px',
              padding: '0 4px',
              justifyContent: 'center',
            }}
          >
            {/* Card mini illustration */}
            <div
              style={{
                width: '44px',
                height: '52px',
                borderRadius: '8px',
                background: `linear-gradient(145deg, ${accentColor ?? 'var(--accent-saffron)'}30, ${accentColor ?? 'var(--accent-saffron)'}15)`,
                border: `1px solid ${accentColor ?? 'var(--accent-saffron)'}25`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                overflow: 'hidden',
              }}
            >
              {freeCardImageUrl ? (
                <img
                  src={freeCardImageUrl}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  draggable={false}
                />
              ) : (
                <span style={{ fontSize: '16px', opacity: 0.7 }}>✦</span>
              )}
            </div>

            <div>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  color: DRIFTWOOD,
                  marginBottom: '3px',
                }}
              >
                Ert första samtal
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '22px',
                  fontWeight: 600,
                  color: DEEP_SAFFRON,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2,
                }}
              >
                {resolvedFreeCardTitle}
              </p>
              {freeCardCategoryName && (
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    color: DRIFTWOOD,
                    marginTop: '2px',
                  }}
                >
                  Från {freeCardCategoryName}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* 6. CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.6, ease: EASE }}
          style={{
            marginTop: '24px',
            paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
          }}
        >
          <button
            onClick={handleCta}
            style={{
              width: '100%',
              height: '56px',
              backgroundColor: BONKI_ORANGE,
              border: 'none',
              borderRadius: '14px',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontSize: '17px',
              fontWeight: 600,
              color: MIDNIGHT_INK,
              transition: 'opacity 150ms ease, transform 140ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.97)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {resolvedFreeCardTitle
              ? `Börja med ${resolvedFreeCardTitle}`
              : introData.ctaLabel}
          </button>

          {/* 7. Sexualitet safety line */}
          {sexSafetyLine && (
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontStyle: 'italic',
                fontSize: '13px',
                color: DEEP_SAFFRON,
                textAlign: 'center',
                marginTop: '12px',
                lineHeight: 1.5,
              }}
            >
              {sexSafetyLine}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}

/** Hook: check if a product intro should be shown */
export function useProductIntroNeeded(productId: string): boolean {
  return !hasSeenProductIntro(productId);
}
