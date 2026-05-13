import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { isDemoMode, isDemoParam } from '@/lib/demoMode';
import { purchaseProduct, presentCodeRedemptionSheet, restorePurchases } from '@/lib/revenueCat';
import { usePageBackground } from '@/hooks/usePageBackground';
import { productIntros } from '@/data/productIntros';
import { PREVIEW_QUESTIONS } from '@/lib/productPreviewQuestions';
import type { ProductManifest } from '@/types/product';
import {
  MIDNIGHT_INK,
  LANTERN_GLOW,
  WARM_GOLD,
  DEEP_DUSK_BG,
  productTileColors,
} from '@/lib/palette';

// ── Illustration imports (mirrors ProductIntro) ──
import jimImage from '@/assets/illustration-jag-i-mig.png';
import jmaImage from '@/assets/illustration-jag-med-andra.png';
import jivImage from '@/assets/illustration-jag-i-varlden.png';
import illustrationVardag from '@/assets/illustration-vardag.png';
import illustrationSyskon from '@/assets/illustration-syskon.png';
import illustrationSexualitet from '@/assets/illustration-sexualitet.png';
import illustrationStillUs from '@/assets/illustration-still-us-home.png';

const PRODUCT_ILLUSTRATION_POSITION: Record<string, string> = {
  jag_i_mig: 'center 25%',
  jag_med_andra: 'center 35%',
  jag_i_varlden: 'center 30%',
  vardagskort: 'center 20%',
  syskonkort: 'center 15%',
  sexualitetskort: 'center 20%',
  still_us: 'center 30%',
};

const PRODUCT_ILLUSTRATION: Record<string, string> = {
  jag_i_mig: jimImage,
  jag_med_andra: jmaImage,
  jag_i_varlden: jivImage,
  vardagskort: illustrationVardag,
  syskonkort: illustrationSyskon,
  sexualitetskort: illustrationSexualitet,
  still_us: illustrationStillUs,
};

interface ProductPaywallProps {
  product: ProductManifest;
  onAccessGranted?: () => void;
  /** @deprecated Card-level trigger is unreachable; ignored. */
  cardId?: string;
  /** @deprecated Card-level trigger is unreachable; ignored. */
  currentCardTitle?: string;
}

/**
 * ProductPaywall — visually mirrors ProductIntro.tsx so users cannot tell the
 * surfaces apart. CTA continues to call handlePurchase (RevenueCat on native,
 * Stripe on web) instead of navigating to /buy.
 */
export default function ProductPaywall({ product, onAccessGranted }: ProductPaywallProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [priceSek, setPriceSek] = useState<number | null>(null);

  const bgColor = product.backgroundColor ?? MIDNIGHT_INK;
  usePageBackground(bgColor);

  const creatureImage = PRODUCT_ILLUSTRATION[product.id];
  const introData = productIntros[product.id];
  const fullBodyText = introData?.slides.map((s) => s.body).join('\n\n') ?? '';
  const paragraphs = fullBodyText.split('\n\n').map((p) => p.trim()).filter(Boolean);
  const opening = paragraphs[0];
  const restParagraphs = paragraphs.slice(1);

  const isAdult = product.id === 'still_us';
  const isSexualitet = product.id === 'sexualitetskort';
  const sexSafetyLine = isSexualitet ? introData?.slides[0]?.signoff : null;
  const accentTint = isAdult ? WARM_GOLD : (productTileColors[product.id]?.tileLight ?? WARM_GOLD);
  const stickyBg = isAdult ? DEEP_DUSK_BG : bgColor;
  const previewQuestions = PREVIEW_QUESTIONS[product.id] ?? [];
  const previewLabel = `En fråga ur ${product.name}`;

  // Demo mode: auto-bypass paywall
  useEffect(() => {
    if (isDemoMode() || isDemoParam()) {
      onAccessGranted?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch dynamic price
  useEffect(() => {
    supabase
      .from('products')
      .select('price_sek')
      .eq('id', product.id)
      .single()
      .then(({ data }) => {
        setPriceSek(data?.price_sek ?? (product.id === 'still_us' ? 249 : 199));
      });
  }, [product.id]);

  // Hardware back button (Android native)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let handle: { remove: () => void } | undefined;
    App.addListener('backButton', () => {
      localStorage.removeItem('bonki-last-active-product');
      navigate('/', { replace: true });
    }).then((h) => { handle = h; });
    return () => { handle?.remove(); };
  }, [navigate]);

  const handlePurchase = async () => {
    if (!user) {
      console.error('[ProductPaywall] purchase attempt without user');
      toast.error('Du behöver vara inloggad. Försök ladda om sidan.');
      return;
    }
    setLoading(true);

    if (Capacitor.isNativePlatform()) {
      try {
        const result = await purchaseProduct(product.id);
        if (result.cancelled) {
          setLoading(false);
          return;
        }
        if (!result.success) {
          console.error('[ProductPaywall] purchase failed:', result.error);
          toast.error('Köpet kunde inte genomföras. Försök igen.');
          setLoading(false);
          return;
        }
        toast.success('Tack för ditt köp!');
        onAccessGranted?.();
      } catch (err) {
        console.error('[ProductPaywall] RevenueCat purchase error:', err);
        toast.error('Kunde inte starta betalningen');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/create-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            productId: product.id,
            successUrl: `${window.location.origin}/?purchase=success&product=${product.id}`,
            cancelUrl: `${window.location.origin}/?purchase=cancel`,
          }),
        }
      );

      const json = await res.json();

      if (json.error === 'already_purchased') {
        onAccessGranted?.();
        return;
      }

      if (!res.ok) {
        console.error('[ProductPaywall] checkout error:', json.error);
        toast.error(res.status === 503
          ? 'Betalning är inte konfigurerad ännu. Kontakta oss!'
          : (json.error || 'Något gick fel'));
        return;
      }

      if (json.url) {
        window.location.href = json.url;
      }
    } catch (err) {
      console.error('[ProductPaywall] purchase error:', err);
      toast.error('Kunde inte starta betalningen');
    } finally {
      setLoading(false);
    }
  };

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
      {/* ── Atmospheric creature backdrop ── */}
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
              objectPosition: PRODUCT_ILLUSTRATION_POSITION[product.id] ?? 'center 30%',
              opacity: 0.5,
              filter: 'brightness(1.15) saturate(0.95)',
            }}
          />
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

      {/* ── Back arrow ── */}
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
          {/* Hero spacer */}
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
            {product.name}
          </h1>

          {/* Tagline */}
          {product.tagline && (
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '20px',
                color: 'rgba(255, 255, 255, 0.85)',
                textAlign: 'center',
                lineHeight: 1.4,
                margin: '10px 0 0',
              }}
            >
              {product.tagline}
            </p>
          )}

          {/* Trust signal — psychologist credentials */}
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

          {/* Opening statement */}
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

          {/* Body paragraphs */}
          {restParagraphs.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {restParagraphs.map((para, i) => (
                <p
                  key={i}
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 15,
                    color: 'rgba(255, 255, 255, 0.85)',
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

          {/* Example questions stack */}
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

      {/* ── Sticky bottom: meta + CTA ── */}
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
            {product.cards.length} samtal · {priceSek ?? '…'} kr · engångsköp
          </p>
          <button
            onClick={handlePurchase}
            disabled={loading}
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
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'opacity 150ms ease, transform 140ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseDown={(e) => { if (!loading) e.currentTarget.style.transform = 'scale(0.98)'; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {loading ? 'Förbereder…' : (
              <>
                Köp {product.name}
                {priceSek !== null && (
                  <span style={{ opacity: 0.85, marginLeft: 6 }}>· {priceSek} kr</span>
                )}
              </>
            )}
          </button>
          {Capacitor.getPlatform() === 'ios' && (
            <button
              onClick={async () => {
                const result = await presentCodeRedemptionSheet();
                if (result.success) {
                  await restorePurchases();
                  onAccessGranted?.();
                }
                // On failure (incl. user dismissal): no UI feedback. Apple owns it.
              }}
              style={{
                display: 'block',
                margin: '16px auto 0',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                fontWeight: 500,
                color: LANTERN_GLOW,
                opacity: 0.75,
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
                padding: '8px 16px',
              }}
            >
              Lös in kod
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
