/**
 * PaywallBottomSheet — browse-path paywall overlay.
 * Shown when a user taps a locked (non-free) card without having purchased the product.
 */

import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { ProductManifest } from '@/types/product';
import {
  MIDNIGHT_INK,
  LANTERN_GLOW,
  DRIFTWOOD,
  SAFFRON_FLAME,
  BONKI_ORANGE,
} from '@/lib/palette';

const VALUE_LINES: Record<string, string> = {
  jag_i_mig: 'Ge ditt barn ord för det som händer inuti.',
  vardagskort: 'Allt ni gör varje dag — men aldrig pratar om på riktigt.',
  syskonkort: 'Hjälp syskonen hitta varandra — inte bara stå ut med varandra.',
  jag_med_andra: 'För barnet som börjar bry sig om vad alla andra tycker.',
  jag_i_varlden: 'Håll samtalet öppet — även när dörren stängs.',
  sexualitetskort: 'De samtal ni behöver ha — och en trygg väg in.',
  still_us: 'Ni pratar varje dag. Men när pratade ni senast om er?',
};

const KIDS_PRODUCT_IDS = [
  'jag_i_mig', 'vardagskort', 'syskonkort',
  'jag_med_andra', 'jag_i_varlden', 'sexualitetskort',
];

interface PaywallBottomSheetProps {
  open: boolean;
  onDismiss: () => void;
  product: ProductManifest;
  tappedCardName: string;
  tappedCardId: string;
  /** Price in SEK — fetched externally or defaults to null */
  priceSek: number | null;
  /** Whether the free card has been completed */
  freeCardCompleted: boolean;
  /** Callback to navigate to the free card session */
  onNavigateToFreeCard?: () => void;
}

export default function PaywallBottomSheet({
  open,
  onDismiss,
  product,
  tappedCardName,
  tappedCardId,
  priceSek,
  freeCardCompleted,
  onNavigateToFreeCard,
}: PaywallBottomSheetProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Swipe-down gesture on handle area
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const delta = e.changedTouches[0].clientY - touchStartY.current;
    if (delta > 60) onDismiss();
    touchStartY.current = null;
  }, [onDismiss]);

  const totalCards = product.cards.length;
  const totalCategories = product.categories.length;
  const valueLine = VALUE_LINES[product.id] ?? '';
  const isKids = KIDS_PRODUCT_IDS.includes(product.id);

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
            successUrl: `${window.location.origin}/card/${tappedCardId}?purchase=success`,
            cancelUrl: window.location.href,
          }),
        },
      );

      const json = await res.json();

      if (json.error === 'already_purchased') {
        onDismiss();
        navigate(`/card/${tappedCardId}`, { replace: true });
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

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onDismiss}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              height: '70vh',
              zIndex: 101,
              backgroundColor: MIDNIGHT_INK,
              borderRadius: '20px 20px 0 0',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Handle area — swipe target */}
            <div
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              style={{
                height: '40px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'grab',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '4px',
                  borderRadius: '2px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                }}
              />
            </div>

            {/* Content */}
            <div style={{ padding: '0 20px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              {/* 1. Card context */}
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: DRIFTWOOD, margin: 0 }}>
                Du valde:
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontVariationSettings: "'opsz' 18",
                  fontSize: '18px',
                  fontWeight: 600,
                  color: LANTERN_GLOW,
                  margin: 0,
                  marginTop: '8px',
                }}
              >
                {tappedCardName}
              </p>

              {/* 2. Product name */}
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontVariationSettings: "'opsz' 24",
                  fontSize: '24px',
                  fontWeight: 600,
                  color: LANTERN_GLOW,
                  margin: 0,
                  marginTop: '24px',
                }}
              >
                {product.name}
              </p>

              {/* 3. Value line */}
              {valueLine && (
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '16px',
                    fontWeight: 400,
                    color: LANTERN_GLOW,
                    margin: 0,
                    marginTop: '12px',
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {valueLine}
                </p>
              )}

              {/* 4. Credibility */}
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  fontStyle: 'italic',
                  color: DRIFTWOOD,
                  margin: 0,
                  marginTop: '10px',
                }}
              >
                Utvecklad tillsammans med psykolog · 29 års klinisk erfarenhet
              </p>

              {/* 5. Journal hook (kids only) */}
              {isKids && (
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    fontStyle: 'italic',
                    color: DRIFTWOOD,
                    margin: 0,
                    marginTop: '8px',
                  }}
                >
                  Spara barnens svar. Se dem växa — samtal för samtal.
                </p>
              )}

              {/* 6. Scope */}
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  color: DRIFTWOOD,
                  margin: 0,
                  marginTop: '16px',
                }}
              >
                {totalCards} samtal · {totalCategories} kategorier · Engångsköp
              </p>

              {/* 7. Free card nudge (conditional) */}
              {!freeCardCompleted && onNavigateToFreeCard && (
                <button
                  onClick={() => {
                    onDismiss();
                    onNavigateToFreeCard();
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '14px',
                    color: SAFFRON_FLAME,
                    textAlign: 'left',
                    margin: 0,
                    marginTop: '16px',
                    padding: 0,
                  }}
                >
                  Prova ett gratis samtal först
                </button>
              )}

              {/* 8. Price */}
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontVariationSettings: "'opsz' 28",
                  fontSize: '28px',
                  fontWeight: 600,
                  color: SAFFRON_FLAME,
                  margin: 0,
                  marginTop: '24px',
                }}
              >
                {priceSek !== null ? `${priceSek} kr` : '…'}
              </p>

              {/* 9. Trust line */}
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  color: DRIFTWOOD,
                  margin: 0,
                  marginTop: '8px',
                }}
              >
                Engångsköp · Ingen prenumeration · Tillgång för alltid
              </p>

              {/* 10. CTA */}
              <button
                onClick={handlePurchase}
                disabled={loading}
                style={{
                  width: '100%',
                  height: '56px',
                  backgroundColor: BONKI_ORANGE,
                  border: 'none',
                  borderRadius: '14px',
                  cursor: loading ? 'default' : 'pointer',
                  fontFamily: 'var(--font-display)',
                  fontVariationSettings: "'opsz' 17",
                  fontSize: '17px',
                  fontWeight: 600,
                  color: MIDNIGHT_INK,
                  marginTop: '32px',
                  opacity: loading ? 0.7 : 1,
                  transition: 'opacity 150ms ease',
                  flexShrink: 0,
                }}
              >
                {loading ? '…' : `Lås upp ${product.name}`}
              </button>

              {/* Error */}
              {error && (
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: BONKI_ORANGE, textAlign: 'center', marginTop: '8px' }}>
                  {error}
                </p>
              )}

              {/* 11. Dismiss */}
              <button
                onClick={onDismiss}
                style={{
                  display: 'block',
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '14px',
                  color: DRIFTWOOD,
                  textAlign: 'center',
                  marginTop: '16px',
                  padding: '4px 0',
                  flexShrink: 0,
                }}
              >
                Tillbaka
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
