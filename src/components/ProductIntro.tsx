import { useState, useEffect, useMemo } from 'react';
import { Capacitor } from '@capacitor/core';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { productIntros } from '@/data/productIntros';
import { allProducts } from '@/data/products';
import { useCardImage } from '@/hooks/useCardImage';
import { supabase } from '@/integrations/supabase/client';
import { LANTERN_GLOW, DRIFTWOOD, MIDNIGHT_INK, BONKI_ORANGE, DEEP_SAFFRON, WARM_GOLD, DEEP_DUSK_BG, productTileColors } from '@/lib/palette';
import { isProductFreeForUser } from '@/lib/freeCardPolicy';
import { usePageBackground } from '@/hooks/usePageBackground';
import { PREVIEW_QUESTIONS } from '@/lib/productPreviewQuestions';

// ── Illustration imports (same as product homes) ──
import jimImage from '@/assets/illustration-jag-i-mig.png';
import jmaImage from '@/assets/illustration-jag-med-andra.png';
import jivImage from '@/assets/illustration-jag-i-varlden.png';
import illustrationVardag from '@/assets/illustration-vardag.png';
import illustrationSyskon from '@/assets/illustration-syskon.png';
import illustrationSexualitet from '@/assets/illustration-sexualitet.png';
import illustrationStillUs from '@/assets/illustration-still-us-home.png';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Per-product illustration focal point */
const PRODUCT_ILLUSTRATION_POSITION: Record<string, string> = {
  jag_i_mig: 'center 25%',
  jag_med_andra: 'center 35%',
  jag_i_varlden: 'center 30%',
  vardagskort: 'center 20%',
  syskonkort: 'center 15%',
  sexualitetskort: 'center 20%',
  still_us: 'center 30%',
};

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
  const hasFreeCard = isProductFreeForUser(productId);
  const [priceSek, setPriceSek] = useState<number | null>(null);

  useEffect(() => {
    if (!productId) return;
    supabase
      .from('products')
      .select('price_sek')
      .eq('id', productId)
      .single()
      .then(({ data }) => {
        setPriceSek(data?.price_sek ?? (productId === 'still_us' ? 249 : 195));
      });
  }, [productId]);

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
  usePageBackground(bgColor);
  const creatureImage = PRODUCT_ILLUSTRATION[productId];
  const shortIntro = SHORT_INTROS[productId] ?? '';
  const isSexualitet = productId === 'sexualitetskort';
  const tileColors = productTileColors[productId];
  const productAccent = tileColors?.tileLight ?? BONKI_ORANGE;

  // Full body text from productIntros data
  const fullBodyText = introData.slides.map((s) => s.body).join('\n\n');

  const handleCta = async () => {
    markProductIntroSeenServer(productId);
    localStorage.setItem(`bonki-intro-seen-${productId}`, '1');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('onboarding_events').insert({
          user_id: user.id,
          event_type: `intro_cta_clicked_${productId}`,
        });
      }
    } catch {
      // Non-blocking — don't let telemetry failures stop checkout
    }

    navigate(`/buy?product=${productId}`);
  };

  // Sexualitet safety signoff
  const sexSafetyLine = isSexualitet
    ? introData.slides[0]?.signoff
    : null;

  // Labels for free card preview
  const freeCardLabel = isStillUs ? STILL_US_FREE_CARD_LABEL : 'Ert första samtal';

  // CTA label
  const ctaLabel = priceSek !== null
    ? `Köp · ${priceSek} kr`
    : 'Köp';

  const previewLabel = `En fråga ur ${product?.name ?? 'samtalen'}`;

  return (
    <div
      style={{
        backgroundColor: bgColor,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: expanded ? 'auto' : 'hidden',
        position: 'fixed',
        inset: 0,
        zIndex: 50,
      }}
    >
  const isAdult = isStillUs;
  const accentTint = isAdult ? WARM_GOLD : (productTileColors[productId]?.tileLight ?? WARM_GOLD);
  const stickyBg = isAdult ? DEEP_DUSK_BG : bgColor;
  const previewQuestions = PREVIEW_QUESTIONS[productId] ?? [];
  const paragraphs = fullBodyText.split('\n\n').map(p => p.trim()).filter(Boolean);
  const opening = paragraphs[0];
  const restParagraphs = paragraphs.slice(1);

  return (
    <div
      style={{
        backgroundColor: bgColor,
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Illustration zone — atmospheric creature backdrop ── */}
      {creatureImage && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            left: '-10%',
            right: '-10%',
            height: '38%',
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <img
            src={creatureImage}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: PRODUCT_ILLUSTRATION_POSITION[productId] ?? 'center 30%',
              opacity: 0.5,
              filter: 'brightness(1.15) saturate(0.95)',
            }}
          />
          {/* Atmospheric glow */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: isAdult
                ? 'radial-gradient(ellipse at 50% 30%, rgba(100,149,237,0.18) 0%, transparent 70%)'
                : `radial-gradient(ellipse at 50% 30%, ${accentTint}22 0%, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />
          {/* Bottom fade into bg */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '60%',
              background: `linear-gradient(to top, ${bgColor} 0%, transparent 100%)`,
              pointerEvents: 'none',
            }}
          />
        </div>
      )}

      {/* ── Back button ── */}
      <button
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
      </button>

      {/* ── Scrollable content ── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            padding: '0 24px',
            paddingTop: 'max(80px, calc(env(safe-area-inset-top, 0px) + 80px))',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Hero spacer to let illustration breathe */}
          <div style={{ height: 'calc(28vh - 80px)', minHeight: 60 }} />

          {/* Title */}
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '40px',
              fontWeight: 500,
              color: LANTERN_GLOW,
              textAlign: 'center',
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
              margin: 0,
              textShadow: '0 2px 12px rgba(0,0,0,0.35)',
            }}
          >
            {product?.name ?? productId}
          </h1>

          {/* Subtitle */}
          {product?.tagline && (
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: '18px',
                color: LANTERN_GLOW,
                opacity: 0.85,
                textAlign: 'center',
                lineHeight: 1.4,
                margin: '10px 0 0',
              }}
            >
              {product.tagline}
            </p>
          )}

          {/* ── Trust signal ── */}
          <div
            style={{
              marginTop: 32,
              padding: '14px 0',
              borderTop: `1px solid color-mix(in srgb, ${WARM_GOLD} 35%, transparent)`,
              borderBottom: `1px solid color-mix(in srgb, ${WARM_GOLD} 35%, transparent)`,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: WARM_GOLD,
                opacity: 0.8,
              }}
            >
              Utvecklat av psykolog
            </div>
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: 15,
                color: LANTERN_GLOW,
                opacity: 0.95,
                marginTop: 6,
              }}
            >
              Ida W. · 29 års klinisk erfarenhet
            </div>
          </div>

          {/* ── Opening statement ── */}
          {opening && (
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 18,
                color: LANTERN_GLOW,
                lineHeight: 1.4,
                textAlign: 'center',
                margin: '24px 0',
              }}
            >
              {opening}
            </p>
          )}

          {/* ── Body paragraphs ── */}
          {restParagraphs.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {restParagraphs.map((para, i) => (
                <p
                  key={i}
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 15,
                    color: LANTERN_GLOW,
                    opacity: 0.85,
                    lineHeight: 1.55,
                    textAlign: 'center',
                    margin: 0,
                  }}
                >
                  {para}
                </p>
              ))}
            </div>
          )}

          {/* ── Example questions stack ── */}
          {previewQuestions.length > 0 && (
            <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {previewQuestions.map((q, i) => (
                <div
                  key={i}
                  style={{
                    padding: '24px 20px',
                    borderRadius: 14,
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '0.10em',
                      textTransform: 'uppercase',
                      color: LANTERN_GLOW,
                      opacity: 0.55,
                      marginBottom: 12,
                    }}
                  >
                    {previewLabel}
                  </div>
                  <p
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontStyle: 'italic',
                      fontSize: 17,
                      color: LANTERN_GLOW,
                      lineHeight: 1.45,
                      margin: 0,
                    }}
                  >
                    &ldquo;{q}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Sexualitet safety line */}
          {sexSafetyLine && (
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: 13,
                color: LANTERN_GLOW,
                opacity: 0.6,
                textAlign: 'center',
                marginTop: 20,
                lineHeight: 1.5,
              }}
            >
              {sexSafetyLine}
            </p>
          )}

          {/* Bottom spacer so sticky CTA doesn't cover content */}
          <div style={{ height: 'calc(140px + env(safe-area-inset-bottom, 0px))' }} />
        </div>
      </div>

      {/* ── Sticky bottom: price + CTA ── */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 5,
          paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
          paddingTop: 16,
          background: `linear-gradient(to top, ${stickyBg} 0%, ${stickyBg} 70%, transparent 100%)`,
          pointerEvents: 'none',
        }}
      >
        <div style={{ pointerEvents: 'auto', padding: '0 24px' }}>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 13,
              color: LANTERN_GLOW,
              opacity: 0.7,
              letterSpacing: '0.04em',
              textAlign: 'center',
              margin: '0 0 10px',
            }}
          >
            {product?.cards.length ?? 0} samtal · {priceSek ?? '…'} kr · engångsköp
          </p>
          <button
            onClick={handleCta}
            disabled={initiating}
            style={{
              width: '100%',
              height: 56,
              borderRadius: 28,
              background: `color-mix(in srgb, ${accentTint} 28%, rgba(255,255,255,0.06))`,
              border: `1px solid color-mix(in srgb, ${accentTint} 50%, transparent)`,
              color: LANTERN_GLOW,
              fontFamily: 'var(--font-display)',
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              opacity: initiating ? 0.7 : 1,
              transition: 'opacity 150ms ease, transform 140ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.98)'; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            Köp {product?.name ?? ''}
            {priceSek !== null && (
              <span style={{ opacity: 0.85, marginLeft: 6 }}>· {priceSek} kr</span>
            )}
          </button>
        </div>
      </div>
      {/* TODO: free-session branch returns in a later release */}
    </div>
  );
}


/** Hook: check if a product intro should be shown.
 *  Shows intro until the user has completed at least one session in this product. */
export function useProductIntroNeeded(productId: string): { needed: boolean; checked: boolean } {
  const [needed, setNeeded] = useState(true);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) {
        // Demo mode: no user, but skip intro so screenshots/dev exploration can render
        if (typeof window !== 'undefined' &&
            (window.location.search.includes('demo=1') ||
             sessionStorage.getItem('bonki-demo-mode') === '1')) {
          setNeeded(false);
          setChecked(true);
          return;
        }
        // Auth not settled — don't mark checked, keep ProductHome in loading state
        return;
      }

      // Purchased users never see the intro/paywall hybrid — short-circuit.
      const { data: accessRow } = await supabase
        .from('user_product_access')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();
      if (cancelled) return;

      if (accessRow) {
        setNeeded(false);
        setChecked(true);
        return;
      }

      // Fallback: completed-session signal for non-purchased users
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

  return { needed, checked };
}
