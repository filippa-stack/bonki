import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { allProducts, getProductById } from '@/data/products';
import { isDemoMode, isDemoParam } from '@/lib/demoMode';
import {
  MIDNIGHT_INK,
  LANTERN_GLOW,
  DRIFTWOOD,
  SAFFRON_FLAME,
  BONKI_ORANGE,
} from '@/lib/palette';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Per-product value lines */
const VALUE_LINES: Record<string, string> = {
  jag_i_mig: 'Ge ditt barn ord för det som händer inuti.',
  vardagskort: 'Allt ni gör varje dag — men aldrig pratar om på riktigt.',
  syskonkort: 'Hjälp syskonen hitta varandra — inte bara stå ut med varandra.',
  jag_med_andra: 'För barnet som börjar bry sig om vad alla andra tycker.',
  jag_i_varlden: 'Håll samtalet öppet — även när dörren stängs.',
  sexualitetskort: 'De samtal ni behöver ha — och en trygg väg in.',
  still_us: 'Ni pratar varje dag. Men när pratade ni senast om er?',
};

export default function PaywallFullScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const productId = searchParams.get('product') ?? '';
  const product = getProductById(productId);

  const [priceSek, setPriceSek] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dev bypass long-press
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!productId) return;
    supabase
      .from('products')
      .select('price_sek')
      .eq('id', productId)
      .single()
      .then(({ data }) => {
        setPriceSek(data?.price_sek ?? 195);
      });
  }, [productId]);

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: MIDNIGHT_INK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: DRIFTWOOD, fontSize: '14px' }}>Produkten hittades inte</p>
      </div>
    );
  }

  const totalCards = product.cards.length;
  const totalCategories = product.categories.length;
  const valueLine = VALUE_LINES[product.id] ?? '';

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
            cancelUrl: `${window.location.origin}/paywall-full?product=${product.id}`,
          }),
        },
      );

      const json = await res.json();

      if (json.error === 'already_purchased') {
        navigate(`/product/${product.slug}`, { replace: true });
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

  // Dev bypass
  const handlePricePressStart = () => {
    if (isDemoMode() || isDemoParam()) {
      longPressTimer.current = setTimeout(() => {
        navigate(`/product/${product.slug}`, { replace: true });
      }, 3000);
    }
  };
  const handlePricePressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        backgroundColor: MIDNIGHT_INK,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
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
      </motion.button>

      {/* Content — vertically centered */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 24px',
        }}
      >
        {/* GROUP 1 — HERO */}
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontVariationSettings: "'opsz' 32",
            fontSize: '32px',
            fontWeight: 600,
            color: LANTERN_GLOW,
            textAlign: 'center',
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {product.name}
        </h1>

        {valueLine && (
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '17px',
              fontWeight: 400,
              color: LANTERN_GLOW,
              textAlign: 'center',
              margin: 0,
              marginTop: '20px',
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

        {/* GROUP 2 — TRUST */}
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontStyle: 'italic',
            color: DRIFTWOOD,
            textAlign: 'center',
            margin: 0,
            marginTop: '32px',
          }}
        >
          Utvecklad tillsammans med psykolog · 29 års klinisk erfarenhet
        </p>

        {product.id !== 'still_us' && (
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              fontStyle: 'italic',
              color: DRIFTWOOD,
              textAlign: 'center',
              margin: 0,
              marginTop: '6px',
            }}
          >
            Spara barnens svar. Se dem växa — samtal för samtal.
          </p>
        )}

        {/* GROUP 3 — OFFER */}
        <p
          onMouseDown={handlePricePressStart}
          onMouseUp={handlePricePressEnd}
          onMouseLeave={handlePricePressEnd}
          onTouchStart={handlePricePressStart}
          onTouchEnd={handlePricePressEnd}
          style={{
            fontFamily: 'var(--font-display)',
            fontVariationSettings: "'opsz' 36",
            fontSize: '36px',
            fontWeight: 600,
            color: SAFFRON_FLAME,
            textAlign: 'center',
            margin: 0,
            marginTop: '40px',
            cursor: 'default',
          }}
        >
          {priceSek !== null ? `${priceSek} kr` : '…'}
        </p>

        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            color: DRIFTWOOD,
            textAlign: 'center',
            margin: 0,
            marginTop: '8px',
          }}
        >
          {totalCards} samtal · Engångsköp · Tillgång för alltid
        </p>

        {/* GROUP 4 — ACTION */}
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
            marginTop: '40px',
            opacity: loading ? 0.7 : 1,
            transition: 'opacity 150ms ease',
          }}
        >
          {loading ? '…' : `Lås upp ${product.name}`}
        </button>

        {/* Error */}
        {error && (
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#E85D2C', textAlign: 'center', marginTop: '8px' }}>
            {error}
          </p>
        )}

        {/* 9. Dismiss */}
        <button
          onClick={() => navigate(`/product/${product.slug}`, { replace: true })}
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
          }}
        >
          Inte just nu
        </button>
      </div>
    </motion.div>
  );
}
