import { useState } from 'react';
import { isSpacePaid } from '@/pages/Index';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { BEAT_1, BEAT_2 } from '@/lib/motion';
import { Button } from '@/components/ui/button';
import { Check, Shield } from 'lucide-react';
import bonkiLogo from '@/assets/bonki-logo.png';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';

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
      <div className="min-h-screen page-bg flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm text-center space-y-6"
        >
          <img src={bonkiLogo} alt="Still Us" className="h-10 w-auto mx-auto" />
          <h1 className="text-display text-foreground">Det här utrymmet är redan aktiverat.</h1>
          <button onClick={onPurchaseComplete} className="cta-primary">
            Fortsätt
          </button>
        </motion.div>
      </div>
    );
  }

  const handlePurchase = async () => {
    setProcessing(true);
    // Mock processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setCompleted(true);
    // Brief pause to show success state
    await new Promise((resolve) => setTimeout(resolve, 1200));
    onPurchaseComplete();
  };

  return (
    <div className="min-h-screen page-bg flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-sm space-y-8 text-center"
      >
        <img src={bonkiLogo} alt="Still Us" className="h-12 w-auto mx-auto" />

        <div className="space-y-3">
          <h1 className="text-display text-foreground">
            {t('purchase.title', 'Ert gemensamma utrymme')}
          </h1>
          <p className="text-body text-muted-foreground leading-relaxed">
            {t('purchase.subtitle', 'Ett engångsköp — för er båda. Inga dolda kostnader.')}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15, delay: BEAT_1 }}
          className="rounded-2xl border border-border bg-card p-6 space-y-4 text-left"
        >
          <div className="flex items-start gap-3">
            <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-foreground">
              {t('purchase.benefit_1', 'Tillgång till alla samtalsområden och reflektioner')}
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-foreground">
              {t('purchase.benefit_2', 'Dela utrymmet — båda har tillgång från dag ett')}
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-foreground">
              {t('purchase.benefit_3', 'Ert privata utrymme — för alltid')}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15, delay: BEAT_2 }}
          className="space-y-3"
        >
          <button
            onClick={handlePurchase}
            disabled={processing || completed}
            className="cta-primary gap-2"
          >
            {completed ? (
              <>
                <Check className="w-4 h-4" />
                {t('purchase.complete', 'Klart!')}
              </>
            ) : processing ? (
              <span className="animate-pulse">{t('purchase.processing', 'Behandlar...')}</span>
            ) : (
              t('purchase.buy_button', 'Lås upp för 299 kr')
            )}
          </button>

        </motion.div>
      </motion.div>
    </div>
  );
}
