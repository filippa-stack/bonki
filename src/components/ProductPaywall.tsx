import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useCardImage } from '@/hooks/useCardImage';
import { isDemoMode, isDemoParam } from '@/lib/demoMode';
import type { ProductManifest } from '@/types/product';
import {
  MIDNIGHT_INK,
  LANTERN_GLOW,
  DRIFTWOOD,
  BONKI_ORANGE,
} from '@/lib/palette';

/** Warm neutral for readable secondary text on dark backgrounds (4.7:1 on Midnight Ink) */
const READABLE_SECONDARY = '#998F82';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface ProductPaywallProps {
  product: ProductManifest;
  onAccessGranted?: () => void;
  /** The card ID that triggered the paywall */
  cardId?: string;
  /** Title of the card the user actually clicked */
  currentCardTitle?: string;
}

/**
 * Paywall — bottom-sheet for Still Us, full-screen for kids products.
 */
export default function ProductPaywall({ product, onAccessGranted, cardId, currentCardTitle }: ProductPaywallProps) {
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
  }, []);

  const isStillUs = product.id === 'still_us';

  // CTA button is always Bonki Orange; product color goes on background
  const ctaColor = BONKI_ORANGE;
  const pageBg = product.backgroundColor ?? MIDNIGHT_INK;

  // Dev bypass via long-press on price line
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch dynamic price from DB
  useEffect(() => {
    supabase
      .from('products')
      .select('price_sek')
      .eq('id', product.id)
      .single()
      .then(({ data }) => {
        setPriceSek(data?.price_sek ?? 195);
      });
  }, [product.id]);

  // Card illustration (kids only)
  const illustrationUrl = useCardImage(cardId ?? null);

  const cardTitle = currentCardTitle ?? 'Detta kort';
  const totalCards = product.cards.length;
  const valueDescription = isStillUs
    ? 'Lås upp alla samtal om det som håller ihop er — och det som ibland inte gör det.'
    : (product.paywallDescription ?? `Lås upp alla ${totalCards} samtalsämnen i ${product.name}.`);

  // Back navigation
  const backTo = `/product/${product.slug}`;

  const handlePurchase = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

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
            successUrl: cardId
              ? `${window.location.origin}/?purchase=success&product=${product.id}&returnCard=${cardId}`
              : `${window.location.origin}/?purchase=success&product=${product.id}`,
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

  // Hidden dev bypass: long-press on price line (3s)
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

  // Swipe-to-dismiss for bottom sheet
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const handleDismiss = useCallback(() => navigate(backTo), [navigate, backTo]);

  // ── Still Us: Bottom Sheet ──
  if (isStillUs) {
    return (
      <AnimatePresence>
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
          }}
          onClick={handleDismiss}
        >
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.4, ease: EASE }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) handleDismiss();
            }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '80vh',
              backgroundColor: pageBg,
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '32px 24px',
              paddingBottom: 'max(32px, env(safe-area-inset-bottom))',
              overflowY: 'auto',
            }}
          >
            {/* Drag handle */}
            <div
              style={{
                width: '40px',
                height: '4px',
                borderRadius: '2px',
                backgroundColor: DRIFTWOOD,
                marginBottom: '28px',
                flexShrink: 0,
              }}
            />

            {/* 1. Card name */}
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontVariationSettings: "'opsz' 24",
                fontSize: '24px',
                fontWeight: 600,
                color: LANTERN_GLOW,
                textAlign: 'center',
                margin: 0,
                lineHeight: 1.25,
              }}
            >
              {cardTitle}
            </h2>

            {/* 2. Context */}
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                fontWeight: 400,
                color: READABLE_SECONDARY,
                textAlign: 'center',
                marginTop: '8px',
              }}
            >
              Ingår i Still Us · {totalCards || 'alla'} samtalsämnen
            </p>

            {/* 3. Value line */}
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '16px',
                fontWeight: 400,
                color: LANTERN_GLOW,
                textAlign: 'center',
                marginTop: '24px',
                lineHeight: 1.5,
                maxWidth: '90%',
              }}
            >
              {valueDescription}
            </p>

            {/* 4. Price line — long-press for dev bypass */}
            <p
              onPointerDown={handlePricePressStart}
              onPointerUp={handlePricePressEnd}
              onPointerLeave={handlePricePressEnd}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                fontWeight: 400,
                color: READABLE_SECONDARY,
                textAlign: 'center',
                marginTop: '16px',
                userSelect: 'none',
              }}
            >
              {priceSek ?? '...'} kr · Engångsköp · Tillgång för alltid
            </p>

            {/* 5. CTA */}
            <button
              onClick={handlePurchase}
              disabled={loading}
              style={{
                width: '100%',
                maxWidth: '320px',
                height: '56px',
                borderRadius: '14px',
                backgroundColor: ctaColor,
                border: 'none',
                cursor: loading ? 'wait' : 'pointer',
                marginTop: '32px',
                fontFamily: 'var(--font-sans)',
                fontSize: '17px',
                fontWeight: 600,
                color: MIDNIGHT_INK,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: loading ? 0.7 : 1,
                transition: 'opacity 200ms ease, transform 150ms ease',
              }}
              onPointerDown={(e) => { if (!loading) e.currentTarget.style.transform = 'scale(0.97)'; }}
              onPointerUp={(e) => { e.currentTarget.style.transform = ''; }}
              onPointerLeave={(e) => { e.currentTarget.style.transform = ''; }}
            >
              {loading ? (
                <span style={{ opacity: 0.8 }}>Förbereder...</span>
              ) : (
                'Lås upp Still Us'
              )}
            </button>

            {error && (
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  color: 'hsl(0, 60%, 60%)',
                  textAlign: 'center',
                  marginTop: '12px',
                }}
              >
                {error}
              </p>
            )}

            {/* 6. Trust */}
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                fontWeight: 400,
                color: READABLE_SECONDARY,
                textAlign: 'center',
                marginTop: '12px',
              }}
            >
              Säker betalning · Ingen prenumeration
            </p>

            {/* 7. Dismiss */}
            <button
              onClick={handleDismiss}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                fontWeight: 400,
                color: DRIFTWOOD,
                textAlign: 'center',
                marginTop: '24px',
                padding: '8px 16px',
              }}
            >
              Inte nu
            </button>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  // ── Kids products: Full-screen paywall ──
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: pageBg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        zIndex: 50,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        style={{
          width: '100%',
          maxWidth: '360px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Card Illustration */}
        {illustrationUrl && (
          <div
            style={{
              width: '100%',
              maxHeight: '35vh',
              borderRadius: '16px',
              overflow: 'hidden',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={illustrationUrl}
              alt={cardTitle}
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '35vh',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>
        )}

        {/* Card Name + Context */}
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontVariationSettings: "'opsz' 24",
            fontSize: '24px',
            fontWeight: 700,
            color: LANTERN_GLOW,
            textAlign: 'center',
            margin: 0,
            lineHeight: 1.25,
          }}
        >
          {cardTitle}
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: 400,
            color: READABLE_SECONDARY,
            textAlign: 'center',
            marginTop: '8px',
          }}
        >
          Ingår i {product.name} · {totalCards} samtalsämnen
        </p>

        {/* Value Line */}
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '16px',
            fontWeight: 400,
            color: LANTERN_GLOW,
            textAlign: 'center',
            marginTop: '24px',
            lineHeight: 1.5,
            maxWidth: '90%',
          }}
        >
          {valueDescription}
        </p>

        {/* Price Line — long-press for dev bypass */}
        <p
          onPointerDown={handlePricePressStart}
          onPointerUp={handlePricePressEnd}
          onPointerLeave={handlePricePressEnd}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            fontWeight: 400,
            color: READABLE_SECONDARY,
            textAlign: 'center',
            marginTop: '16px',
            userSelect: 'none',
          }}
        >
          {priceSek ?? '...'} kr · Engångsköp · Tillgång för alltid
        </p>

        {/* Primary CTA */}
        <button
          onClick={handlePurchase}
          disabled={loading}
          style={{
            width: '100%',
            height: '56px',
            borderRadius: '14px',
            backgroundColor: ctaColor,
            border: 'none',
            cursor: loading ? 'wait' : 'pointer',
            marginTop: '32px',
            fontFamily: 'var(--font-sans)',
            fontSize: '17px',
            fontWeight: 600,
            color: MIDNIGHT_INK,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: loading ? 0.7 : 1,
            transition: 'opacity 200ms ease, transform 150ms ease',
          }}
          onPointerDown={(e) => { if (!loading) e.currentTarget.style.transform = 'scale(0.97)'; }}
          onPointerUp={(e) => { e.currentTarget.style.transform = ''; }}
          onPointerLeave={(e) => { e.currentTarget.style.transform = ''; }}
        >
          {loading ? (
            <span style={{ opacity: 0.8 }}>Förbereder...</span>
          ) : (
            `Lås upp ${product.name}`
          )}
        </button>

        {error && (
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              color: 'hsl(0, 60%, 60%)',
              textAlign: 'center',
              marginTop: '12px',
            }}
          >
            {error}
          </p>
        )}

        {/* Trust Line */}
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '12px',
            fontWeight: 400,
            color: READABLE_SECONDARY,
            textAlign: 'center',
            marginTop: '12px',
          }}
        >
          Säker betalning · Ingen prenumeration
        </p>

        {/* Dismiss */}
        <button
          onClick={() => navigate(backTo)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            fontWeight: 400,
            color: DRIFTWOOD,
            textAlign: 'center',
            marginTop: '24px',
            padding: '8px 16px',
          }}
        >
          Inte nu
        </button>
      </motion.div>
    </div>
  );
}
