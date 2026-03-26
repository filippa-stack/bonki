import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { productIntros } from '@/data/productIntros';
import { allProducts } from '@/data/products';
import { useCardImage } from '@/hooks/useCardImage';
import { supabase } from '@/integrations/supabase/client';
import { LANTERN_GLOW, DRIFTWOOD, MIDNIGHT_INK, BONKI_ORANGE, DEEP_SAFFRON, productTileColors } from '@/lib/palette';

// ── Illustration imports (same as product homes) ──
import jimImage from '@/assets/illustration-jag-i-mig.png';
import jmaImage from '@/assets/illustration-jag-med-andra.png';
import jivImage from '@/assets/illustration-jag-i-varlden.png';
import illustrationVardag from '@/assets/illustration-vardag.png';
import illustrationSyskon from '@/assets/illustration-syskon.png';
import illustrationSexualitet from '@/assets/illustration-sexualitet.png';
import illustrationStillUs from '@/assets/illustration-still-us-home.png';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Per-product creature illustration */
const PRODUCT_ILLUSTRATION: Record<string, string> = {
  jag_i_mig: jimImage,
  jag_med_andra: jmaImage,
  jag_i_varlden: jivImage,
  vardagskort: illustrationVardag,
  syskonkort: illustrationSyskon,
  sexualitetskort: illustrationSexualitet,
  still_us: illustrationStillUs,
};

/** One-sentence intro per product */
const SHORT_INTROS: Record<string, string> = {
  jag_i_mig: 'Det här är ett samtal om vem ditt barn är — just nu, idag.',
  jag_med_andra: 'Ditt barn har börjat titta utåt — och frågorna har blivit på riktigt.',
  jag_i_varlden: 'Du lever i en tid där alla har åsikter om vem du ska vara. Men vad tänker du?',
  vardagskort: 'Kort för alla de små sakerna som bygger en familj.',
  syskonkort: 'Frågor som hjälper er prata om det som finns mellan er.',
  sexualitetskort: 'Om kropp, samtycke, normer och identitet — utan att moralisera.',
  still_us: 'För par som fortfarande fungerar, men som märkt att något tystnat.',
};

/** Still Us–specific overrides */
const STILL_US_FREE_CARD_LABEL = 'Ert första samtal';
const STILL_US_CTA = 'Börja med Ert första samtal';

// ── Server-side "seen" helpers ──

async function hasSeenProductIntroServer(productId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('onboarding_events')
    .select('id')
    .eq('user_id', user.id)
    .eq('event_type', `product_intro_seen_${productId}`)
    .limit(1);

  return (data?.length ?? 0) > 0;
}

async function markProductIntroSeenServer(productId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('onboarding_events').insert({
    user_id: user.id,
    event_type: `product_intro_seen_${productId}`,
  });
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

export default function ProductIntro({
  productId,
  accentColor,
  backgroundColor,
  freeCardId,
  freeCardTitle,
  onComplete,
  onStartFreeCard,
}: ProductIntroProps) {
  const navigate = useNavigate();
  const introData = productIntros[productId];
  const [expanded, setExpanded] = useState(false);
  const [initiating, setInitiating] = useState(false);
  const freeCardImageUrl = useCardImage(freeCardId);
  const isStillUs = productId === 'still_us';

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
  const tileColors = productTileColors[productId];
  const productAccent = tileColors?.tileLight ?? BONKI_ORANGE;

  // Full body text from productIntros data
  const fullBodyText = introData.slides.map((s) => s.body).join('\n\n');
  // Include signoff in expanded text (except for sexualitet which shows it separately)
  const signoffText = !isSexualitet
    ? introData.slides.map((s) => s.signoff).filter(Boolean).join('\n\n')
    : '';

  const handleCta = async () => {
    // Persist seen flag server-side (fire-and-forget)
    markProductIntroSeenServer(productId);

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

  // Labels for free card preview
  const freeCardLabel = isStillUs ? STILL_US_FREE_CARD_LABEL : 'Ert första samtal';

  // CTA label
  const ctaLabel = isStillUs
    ? STILL_US_CTA
    : resolvedFreeCardTitle
      ? `Börja med ${resolvedFreeCardTitle}`
      : introData.ctaLabel;

  return (
    <div
      style={{
        backgroundColor: bgColor,
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        overflow: expanded ? 'auto' : 'hidden',
        position: 'fixed',
        inset: 0,
        zIndex: 50,
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
              opacity: 0.38,
              filter: 'brightness(1.15) saturate(0.95)',
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

      {/* ── Back button ── */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        onClick={() => {
          localStorage.removeItem('bonki-last-active-product');
          navigate('/', { replace: true });
        }}
        style={{
          position: 'absolute',
          top: 'max(12px, env(safe-area-inset-top, 12px))',
          left: '16px',
          zIndex: 10,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          color: LANTERN_GLOW,
          opacity: 0.7,
        }}
        aria-label="Tillbaka"
      >
        <ArrowLeft size={24} />
      </motion.button>

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
              color: productAccent,
              textAlign: 'center',
              marginTop: '4px',
              margin: '4px 0 0',
            }}
          >
            {product.tagline}
          </motion.p>
        )}

        {/* 3. Full body text — all paragraphs visible */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6, ease: EASE }}
          style={{ textAlign: 'center', marginTop: '8px' }}
        >
          {fullBodyText.split('\n\n').map((para, i) => (
            <p
              key={i}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '15px',
                color: LANTERN_GLOW,
                textAlign: 'center',
                lineHeight: 1.55,
                marginTop: i === 0 ? 0 : '10px',
                margin: i === 0 ? '0' : '10px 0 0',
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
                color: productAccent,
                textAlign: 'center',
                marginTop: '18px',
                opacity: 0.85,
              }}
            >
              {signoffText}
            </p>
          )}
        </motion.div>


        {/* 6. First card preview */}
        {resolvedFreeCardTitle && !isStillUs && (
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
                background: `linear-gradient(145deg, ${productAccent}30, ${productAccent}15)`,
                border: `1px solid ${productAccent}25`,
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
                  fontSize: '10px',
                  fontWeight: 500,
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  color: `${LANTERN_GLOW}99`,
                  marginBottom: '3px',
                }}
              >
                {freeCardLabel}
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '20px',
                  fontWeight: 600,
                  color: LANTERN_GLOW,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2,
                }}
              >
                {isStillUs ? 'Ert första samtal' : resolvedFreeCardTitle}
              </p>
              {!isStillUs && freeCardCategoryName && (
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '12px',
                    color: `${LANTERN_GLOW}80`,
                    marginTop: '2px',
                  }}
                >
                  Från {freeCardCategoryName}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* 7. CTA Button */}
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
            disabled={initiating}
            style={{
              width: '100%',
              height: '56px',
              backgroundColor: productAccent,
              border: 'none',
              borderRadius: '14px',
              cursor: 'pointer',
              fontFamily: 'var(--font-display)',
              fontVariationSettings: "'opsz' 17",
              fontSize: '17px',
              fontWeight: 600,
              color: MIDNIGHT_INK,
              opacity: initiating ? 0.7 : 1,
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
            {ctaLabel}
          </button>

          {/* Sexualitet safety line */}
          {sexSafetyLine && (
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontStyle: 'italic',
                fontSize: '13px',
                color: productAccent,
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

/** Hook: check if a product intro should be shown.
 *  Shows intro until the user has completed at least one session in this product. */
export function useProductIntroNeeded(productId: string): boolean {
  const [needed, setNeeded] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) { setChecked(true); return; }

      // Check for any completed session in this product
      const { data } = await supabase
        .from('couple_sessions')
        .select('id')
        .eq('product_id', productId)
        .eq('status', 'completed')
        .limit(1);

      if (!cancelled) {
        const hasCompleted = (data?.length ?? 0) > 0;
        setNeeded(!hasCompleted);
        setChecked(true);
      }
    })();

    return () => { cancelled = true; };
  }, [productId]);

  // Don't show until we've checked server
  if (!checked) return false;
  return needed;
}
