import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useCardImage } from '@/hooks/useCardImage';
import { isDemoMode } from '@/lib/demoMode';
import type { ProductManifest } from '@/types/product';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface ProductPaywallProps {
  product: ProductManifest;
  onAccessGranted?: () => void;
  /** The card ID that triggered the paywall — used for watermark */
  cardId?: string;
  /** Title of the card the user actually clicked */
  currentCardTitle?: string;
}

/**
 * Per-product paywall — warm editorial design matching product identity.
 * Shows what the user experienced, what's waiting, and the price.
 */
export default function ProductPaywall({ product, onAccessGranted, cardId, currentCardTitle }: ProductPaywallProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceSek, setPriceSek] = useState<number | null>(null);

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

  // Card image for watermark
  const watermarkUrl = useCardImage(cardId ?? null);

  // Find the free card's title
  const freeCard = useMemo(
    () => product.cards.find(c => c.id === product.freeCardId),
    [product]
  );
  const freeCardTitle = freeCard?.title ?? 'ditt första samtal';

  // All card titles except the free one
  const remainingCards = useMemo(
    () => product.cards.filter(c => c.id !== product.freeCardId),
    [product]
  );

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

  return (
    <div
      className="min-h-[80vh] relative flex flex-col px-6 py-12"
      style={{ backgroundColor: 'var(--surface-base)' }}
    >
      {/* Watermark illustration */}
      {watermarkUrl && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '55%',
            height: '45%',
            backgroundImage: `url(${watermarkUrl})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'bottom right',
            opacity: 0.055,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}

      <div className="max-w-sm mx-auto w-full relative" style={{ zIndex: 1 }}>
        {/* Saffron ceremony line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.15, duration: 0.8, ease: EASE }}
          style={{
            width: '32px',
            height: '2px',
            borderRadius: '1px',
            background: 'var(--accent-saffron)',
            opacity: 0.5,
            margin: '0 auto 20px',
            transformOrigin: 'center',
          }}
        />

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: EASE }}
          className="text-center"
          style={{ marginBottom: '32px' }}
        >
          <h2
            className="font-serif"
            style={{
              fontSize: 'clamp(22px, 5.5vw, 28px)',
              fontWeight: 600,
              color: 'var(--text-primary)',
              lineHeight: 1.3,
              textWrap: 'balance',
            }}
          >
            {currentCardTitle
              ? <>{currentCardTitle} ingår i {product.name} — {product.cards.length} samtalsämnen</>
              : <>Det här var {freeCardTitle} — ett av {product.cards.length} samtalsämnen i {product.name}</>
            }
          </h2>
        </motion.div>

        {/* Remaining topics */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6, ease: EASE }}
          style={{ marginBottom: '36px' }}
        >
          <p
            className="font-sans"
            style={{
              fontSize: '10px',
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              color: 'var(--text-tertiary)',
              opacity: 0.55,
              marginBottom: '14px',
              textAlign: 'center',
            }}
          >
            {remainingCards.length} samtalsämnen väntar
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '6px 10px',
            }}
          >
            {remainingCards.map((card, i) => (
              <motion.span
                key={card.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.03, duration: 0.4 }}
                className="font-serif"
                style={{
                  fontSize: '15px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                }}
              >
                {card.title}{i < remainingCards.length - 1 ? ' ·' : ''}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Price */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center"
          style={{ marginBottom: '28px' }}
        >
          <div className="flex items-baseline justify-center gap-1">
            <span
              className="font-serif"
              style={{
                fontSize: '40px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.03em',
                lineHeight: 1,
              }}
            >
              {priceSek ?? '...'}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '16px',
                fontWeight: 500,
                color: 'var(--text-secondary)',
              }}
            >
              kr
            </span>
          </div>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--text-tertiary)',
              opacity: 0.55,
              marginTop: '6px',
            }}
          >
            Engångsköp · Tillgång för alltid
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <button
            onClick={handlePurchase}
            disabled={loading}
            className="cta-primary w-full max-w-[260px]"
          >
            {loading ? (
              <span className="animate-pulse">Förbereder...</span>
            ) : (
              `Lås upp ${product.name}`
            )}
          </button>

          {error && (
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                color: 'hsl(0, 60%, 50%)',
                marginTop: '12px',
              }}
            >
              {error}
            </p>
          )}

          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              color: 'var(--text-tertiary)',
              opacity: 0.45,
              marginTop: '14px',
            }}
          >
            Säker betalning · Ingen prenumeration
          </p>

          <button
            onClick={() => navigate('/?devState=library')}
            className="font-sans"
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              opacity: 0.50,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
              marginTop: '24px',
            }}
          >
            Tillbaka till biblioteket
          </button>
        </motion.div>
      </div>
    </div>
  );
}
