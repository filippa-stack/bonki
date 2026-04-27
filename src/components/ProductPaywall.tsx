import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { isDemoMode, isDemoParam } from '@/lib/demoMode';
import { purchaseProduct } from '@/lib/revenueCat';
import { isAndroidNative } from '@/lib/platform';
import { productIntros } from '@/data/productIntros';
import { PREVIEW_QUESTION } from '@/lib/productPreviewQuestions';
import type { ProductManifest } from '@/types/product';
import {
  MIDNIGHT_INK,
  LANTERN_GLOW,
  BONKI_ORANGE,
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
 * ProductPaywall — unified fullscreen paywall.
 * Visually mirrors ProductIntro: atmospheric creature backdrop, framed
 * preview-question card, two-line meta, accent CTA, escape link.
 */
export default function ProductPaywall({ product, onAccessGranted }: ProductPaywallProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceSek, setPriceSek] = useState<number | null>(null);

  // Demo mode: auto-bypass paywall
  useEffect(() => {
    if (isDemoMode() || isDemoParam()) {
      onAccessGranted?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tileColors = productTileColors[product.id];
  const productAccent = tileColors?.tileLight ?? BONKI_ORANGE;
  const bgColor = product.backgroundColor ?? MIDNIGHT_INK;
  const creatureImage = PRODUCT_ILLUSTRATION[product.id];
  const introData = productIntros[product.id];
  const fullBodyText = introData?.slides.map((s) => s.body).join('\n\n') ?? '';
  const previewLabel = `En fråga ur ${product.name}`;

  // Hidden long-press dev bypass
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch dynamic price
  useEffect(() => {
    supabase
      .from('products')
      .select('price_sek')
      .eq('id', product.id)
      .single()
      .then(({ data }) => {
        setPriceSek(data?.price_sek ?? (product.id === 'still_us' ? 249 : 195));
      });
  }, [product.id]);

  const handlePurchase = async () => {
    if (!user) {
      setError('Du behöver vara inloggad. Försök ladda om sidan.');
      return;
    }
    setLoading(true);
    setError(null);

    // Native iOS: route through Apple StoreKit via RevenueCat. Apple Guideline 3.1.1
    // prohibits steering iOS users to external (Stripe) payment for digital content.
    if (Capacitor.isNativePlatform()) {
      try {
        const result = await purchaseProduct(product.id);
        if (result.cancelled) {
          setLoading(false);
          return;
        }
        if (!result.success) {
          setError('Köpet kunde inte genomföras. Försök igen.');
          setLoading(false);
          return;
        }
        toast.success('Tack för ditt köp!');
        // RevenueCat webhook syncs user_product_access server-side.
        onAccessGranted?.();
      } catch (err) {
        console.error('RevenueCat purchase error:', err);
        setError('Kunde inte starta betalningen');
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
        if (res.status === 503) {
          setError('Betalning är inte konfigurerad ännu. Kontakta oss!');
        } else {
          setError(json.error || 'Något gick fel');
        }
        return;
      }

      if (json.url) {
        window.location.href = json.url;
      }
    } catch (err) {
      console.error('Purchase error:', err);
      setError('Kunde inte starta betalningen');
    } finally {
      setLoading(false);
    }
  };

  // Hidden 3s long-press bypass (demo only)
  const handlePricePressStart = () => {
    if (isDemoMode() || isDemoParam()) {
      longPressTimer.current = setTimeout(() => {
        onAccessGranted?.();
      }, 3000);
    }
  };
  const handlePricePressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const ctaLabel = priceSek !== null ? `Köp · ${priceSek} kr` : 'Köp';

  return (
    <div
      style={{
        backgroundColor: bgColor,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        position: 'fixed',
        inset: 0,
        zIndex: 50,
      }}
    >
      {/* 1. Atmospheric creature backdrop */}
      {creatureImage && (
        <div
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
              objectPosition: PRODUCT_ILLUSTRATION_POSITION[product.id] ?? 'center 30%',
              opacity: 0.5,
              filter: 'brightness(1.15) saturate(0.95)',
            }}
          />
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
        </div>
      )}

      {/* 2. Back arrow */}
      <button
        onClick={() => navigate(-1)}
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

      {/* Content area */}
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
        <div style={{ flex: '1 1 auto', minHeight: '15%' }} />

        {/* 3. Heading */}
        <motion.h1
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0 }}
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
          {product.name}
        </motion.h1>

        {/* 4. Tagline */}
        {product.tagline && (
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '15px',
              color: LANTERN_GLOW,
              opacity: 0.6,
              textAlign: 'center',
              margin: '8px 0 0',
            }}
          >
            {product.tagline}
          </p>
        )}

        {/* 5. Body paragraphs */}
        {fullBodyText && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            {fullBodyText.split('\n\n').map((para, i) => (
              <p
                key={i}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '16px',
                  color: LANTERN_GLOW,
                  textAlign: 'center',
                  lineHeight: 1.6,
                  opacity: 0.88,
                  margin: i === 0 ? '0' : '14px 0 0',
                }}
              >
                {para}
              </p>
            ))}
          </div>
        )}

        {/* 6. Framed preview question */}
        {PREVIEW_QUESTION[product.id] && (
          <div
            style={{
              marginTop: '32px',
              padding: '24px 24px',
              borderRadius: '14px',
              backgroundColor: 'rgba(11, 16, 38, 0.35)',
              border: '1px solid rgba(253, 246, 227, 0.20)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: LANTERN_GLOW,
                opacity: 0.5,
                marginBottom: '10px',
              }}
            >
              {previewLabel}
            </div>
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '17px',
                fontWeight: 400,
                lineHeight: 1.45,
                color: LANTERN_GLOW,
                opacity: 0.92,
                margin: 0,
              }}
            >
              &ldquo;{PREVIEW_QUESTION[product.id]}&rdquo;
            </p>
          </div>
        )}

        {/* 7. Two-line meta — long-press for dev bypass */}
        <div
          style={{ marginTop: '24px', textAlign: 'center', userSelect: 'none' }}
          onPointerDown={handlePricePressStart}
          onPointerUp={handlePricePressEnd}
          onPointerLeave={handlePricePressEnd}
        >
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              fontWeight: 500,
              color: LANTERN_GLOW,
              opacity: 0.85,
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {priceSek !== null ? `${priceSek} kr` : '…'} · Engångsköp · Tillgång för alltid
          </p>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              color: LANTERN_GLOW,
              opacity: 0.55,
              margin: '6px 0 0',
              lineHeight: 1.5,
            }}
          >
            Utvecklat tillsammans med legitimerade psykologer · 29 års klinisk erfarenhet
          </p>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              color: LANTERN_GLOW,
              opacity: 0.6,
              margin: '4px 0 0',
              lineHeight: 1.5,
            }}
          >
            Bonki är ett samtalsverktyg, inte terapi eller medicinsk rådgivning
          </p>
        </div>

        {/* 8. CTA + 9. trust + 10. escape */}
        <div
          style={{
            marginTop: '24px',
            paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
          }}
        >
          {isAndroidNative() ? (
            <div
              style={{
                width: '100%',
                padding: '16px 20px',
                borderRadius: '14px',
                background: 'rgba(255,255,255,0.06)',
                color: 'rgba(253, 246, 227, 0.75)',
                fontFamily: 'var(--font-sans)',
                fontSize: 14,
                lineHeight: 1.5,
                textAlign: 'center',
              }}
            >
              Köp är inte tillgängliga i Android-versionen just nu. Vi arbetar på det. Logga in med samma konto för att låsa upp produkter du redan äger.
            </div>
          ) : (
            <button
              onClick={handlePurchase}
              disabled={loading}
              style={{
                width: '100%',
                height: '56px',
                backgroundColor: productAccent,
                border: 'none',
                borderRadius: '14px',
                cursor: loading ? 'wait' : 'pointer',
                fontFamily: 'var(--font-display)',
                fontVariationSettings: "'opsz' 17",
                fontSize: '17px',
                fontWeight: 600,
                color: MIDNIGHT_INK,
                opacity: loading ? 0.7 : 1,
                transition: 'opacity 150ms ease, transform 140ms cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onPointerDown={(e) => { if (!loading) e.currentTarget.style.transform = 'scale(0.97)'; }}
              onPointerUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              onPointerLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {loading ? 'Förbereder…' : ctaLabel}
            </button>
          )}

          {error && (
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                color: 'hsl(0, 60%, 70%)',
                textAlign: 'center',
                margin: '12px 0 0',
              }}
            >
              {error}
            </p>
          )}

          {/* Trust line */}
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              color: LANTERN_GLOW,
              opacity: 0.5,
              textAlign: 'center',
              margin: '12px 0 0',
            }}
          >
            Säker betalning · Ingen prenumeration
          </p>

          {/* Escape link */}
          <button
            onClick={() => navigate('/', { replace: true })}
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
            Utforska andra produkter
          </button>
        </div>
      </div>
    </div>
  );
}
