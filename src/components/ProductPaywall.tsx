import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Check, Lock, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { ProductManifest } from '@/types/product';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface ProductPaywallProps {
  product: ProductManifest;
  onAccessGranted?: () => void;
}

/**
 * Per-product paywall screen.
 * Shows product name, price, benefits, and a Stripe checkout button.
 * Falls back gracefully when Stripe is not yet configured.
 */
export default function ProductPaywall({ product, onAccessGranted }: ProductPaywallProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const priceSek = 149; // Default; actual price comes from DB via checkout endpoint

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

      // Redirect to Stripe Checkout
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

  const benefits = [
    t('paywall.benefit_all_cards', 'Alla kort och samtalsämnen'),
    t('paywall.benefit_reflections', 'Personliga reflektioner och minnen'),
    t('paywall.benefit_forever', 'Tillgång för alltid — inga dolda kostnader'),
  ];

  return (
    <div
      className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-12"
      style={{ backgroundColor: 'var(--surface-base)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="w-full max-w-sm text-center"
      >
        {/* Lock icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5, ease: EASE }}
          className="flex justify-center mb-6"
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: product.accentColorMuted }}
          >
            <Lock className="w-7 h-7" style={{ color: product.accentColor }} />
          </div>
        </motion.div>

        {/* Title */}
        <h2
          className="font-serif"
          style={{
            fontSize: '26px',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.01em',
            lineHeight: 1.2,
          }}
        >
          {t('paywall.unlock', 'Lås upp')} {product.name}
        </h2>

        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            marginTop: '12px',
            lineHeight: 1.6,
          }}
        >
          {product.tagline}
        </p>

        {/* Price */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{ marginTop: '28px' }}
        >
          <div className="flex items-baseline justify-center gap-1">
            <span
              className="font-serif"
              style={{
                fontSize: '44px',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.03em',
                lineHeight: 1,
              }}
            >
              {priceSek}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '16px',
                fontWeight: 500,
                color: 'var(--color-text-secondary)',
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
              color: 'var(--color-text-tertiary)',
              opacity: 0.6,
              marginTop: '6px',
            }}
          >
            Engångsköp
          </p>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{
            marginTop: '28px',
            padding: '20px 24px',
            borderRadius: 'var(--radius-card)',
            backgroundColor: 'var(--surface-raised)',
            boxShadow: '0 1px 2px hsla(30,15%,25%,0.04), 0 4px 16px -4px hsla(30,18%,28%,0.06)',
          }}
        >
          <div className="flex flex-col gap-3">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: product.accentColor }}
                >
                  <Check className="w-3 h-3 text-white" />
                </div>
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    color: 'var(--color-text-primary)',
                    lineHeight: 1.5,
                    textAlign: 'left',
                  }}
                >
                  {b}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          style={{ marginTop: '28px' }}
        >
          <button
            onClick={handlePurchase}
            disabled={loading}
            className="cta-primary w-full max-w-[260px]"
            style={{
              boxShadow: `0 2px 12px -2px ${product.accentColor}33`,
            }}
          >
            {loading ? (
              <span className="animate-pulse">Förbereder...</span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Lås upp för {priceSek} kr
              </span>
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
              color: 'var(--color-text-tertiary)',
              opacity: 0.5,
              marginTop: '14px',
              lineHeight: 1.5,
            }}
          >
            Säker betalning via Stripe · Ingen prenumeration
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
