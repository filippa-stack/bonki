import { useState } from 'react';
import { isSpacePaid } from '@/pages/Index';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface PurchaseScreenProps {
  onPurchaseComplete: () => void;
}

export default function PurchaseScreen({ onPurchaseComplete }: PurchaseScreenProps) {
  const { t } = useTranslation();
  const { space } = useCoupleSpaceContext();
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Edge-case guard: space is already paid
  if (isSpacePaid(space?.id, (space as any)?.paid_at)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: 'var(--surface-base)' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="w-full max-w-sm text-center space-y-6"
        >
          <h1
            className="font-serif"
            style={{ fontSize: '28px', fontWeight: 600, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}
          >
            Det här utrymmet är redan aktiverat.
          </h1>
          <button onClick={onPurchaseComplete} className="cta-primary">
            Fortsätt
          </button>
        </motion.div>
      </div>
    );
  }

  const handlePurchase = async () => {
    setProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setCompleted(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    onPurchaseComplete();
  };

  const benefits = [
    t('purchase.benefit_1', 'Alla samtalsområden och reflektioner'),
    t('purchase.benefit_2', 'Dela utrymmet — båda har tillgång'),
    t('purchase.benefit_3', 'Ert privata utrymme — för alltid'),
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: 'var(--surface-base)' }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="w-full max-w-sm text-center"
      >
        {/* ── Brand mark ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.6, ease: EASE }}
        >
          <h1
            className="font-serif"
            style={{
              fontSize: '36px',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            {t('purchase.title', 'Ert gemensamma utrymme')}
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '15px',
              color: 'var(--color-text-secondary)',
              opacity: 0.75,
              marginTop: '16px',
              lineHeight: 1.6,
            }}
          >
            {t('purchase.subtitle', 'Ett engångsköp — för er båda. Inga dolda kostnader.')}
          </p>
        </motion.div>

        {/* ── Price ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: EASE }}
          style={{ marginTop: '40px' }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px' }}>
            <span
              className="font-serif"
              style={{
                fontSize: '56px',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.03em',
                lineHeight: 1,
              }}
            >
              295
            </span>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '18px',
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
              fontSize: '12px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--color-text-tertiary)',
              opacity: 0.6,
              marginTop: '8px',
            }}
          >
            Engångsbetalning
          </p>
        </motion.div>

        {/* ── Benefits ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6, ease: EASE }}
          style={{
            marginTop: '36px',
            padding: '24px 28px',
            borderRadius: 'var(--radius-card)',
            backgroundColor: 'var(--surface-raised)',
            boxShadow:
              '0 1px 2px hsla(30, 15%, 25%, 0.04), 0 4px 16px -4px hsla(30, 18%, 28%, 0.06), inset 0 1px 0 hsla(0, 0%, 100%, 0.6)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {benefits.map((benefit, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--cta-default)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Check className="w-3 h-3" style={{ color: '#FFFFFF' }} />
                </div>
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '14px',
                    color: 'var(--color-text-primary)',
                    lineHeight: 1.5,
                    textAlign: 'left',
                  }}
                >
                  {benefit}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6, ease: EASE }}
          style={{ marginTop: '36px' }}
        >
          <button
            onClick={handlePurchase}
            disabled={processing || completed}
            className="cta-primary"
            style={{
              width: '100%',
              maxWidth: '280px',
              boxShadow: '0 2px 12px -2px hsl(var(--primary) / 0.18), 0 1px 3px hsl(var(--primary) / 0.08)',
            }}
          >
            {completed ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Check className="w-4 h-4" />
                {t('purchase.complete', 'Klart!')}
              </span>
            ) : processing ? (
              <span className="animate-pulse">{t('purchase.processing', 'Behandlar...')}</span>
            ) : (
              t('purchase.buy_button', 'Lås upp för 295 kr')
            )}
          </button>

          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              color: 'var(--color-text-tertiary)',
              opacity: 0.5,
              marginTop: '16px',
              lineHeight: 1.5,
            }}
          >
            Säker betalning · Ingen prenumeration
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
